// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS } from './settings.js';
import { initComments } from './comments.js';

const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CONFIG ---
const CONFIG = { 
    MAX_MACHINES: 4, 
    DEMO_DELAY_BASE_MS: 798, 
    SPEED_DELETE_DELAY: 250, 
    SPEED_DELETE_INTERVAL: 20, 
    STORAGE_KEY_SETTINGS: 'followMeAppSettings_v60_FINAL', 
    STORAGE_KEY_STATE: 'followMeAppState_v60_FINAL',
    INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' },
    MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' }
};

// --- RESTORED DATA (Previously Missing) ---
const DICTIONARY = {
    'en': { correct: "Correct", wrong: "Wrong", stealth: "Stealth Active", reset: "Reset to Round 1", stop: "Playback Stopped 🛑" },
    'es': { correct: "Correcto", wrong: "Incorrecto", stealth: "Modo Sigilo", reset: "Reiniciar Ronda 1", stop: "Detenido 🛑" }
};

const DEFAULT_PROFILE_SETTINGS = { 
    currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, 
    isUniqueRoundsAutoClearEnabled: false, isAutoplayEnabled: false, isAudioEnabled: true, 
    isHapticMorseEnabled: false, hapticMorsePause: 0, playbackSpeed: 1.0, simonInterSequenceDelay: 0, chunkSize: 3 
};

const PREMADE_PROFILES = { 
    'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 
    'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, chunkSize: 4, simonInterSequenceDelay: 400 }, theme: 'default' }, 
    'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 
    'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 
    'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }
};

// --- STATE ---
let appSettings = {
    // Persistent Settings
    activeProfileId: 'profile_1',
    profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)),
    activeTheme: 'default',
    customThemes: {},
    activeVoicePresetId: 'standard',
    voicePresets: {},
    customGestures: [], 
    generalActions: [], 
    
    // Global Toggles
    showWelcomeScreen: true,
    isHapticsEnabled: true,
    isSpeedDeletingEnabled: true,
    isBlackoutMode: false,
    stealth1Key: false,
    isGestureInputEnabled: false, 
    
    // New HUD & Visuals
    showHudTimer: false,
    showHudCounter: false,
    globalFontSize: 100, 
    sequenceSize: 100,
    uiScale: 100,
    gestureResizeMode: 'global', 
    
    // Mapping Storage
    gestureMappings: {}, 

    generalLanguage: 'en',
    autoInputMode: 'none', 

    // Runtime Settings (Copied from Profile)
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS))
};

let state = {
    sequence: [],
    userSequence: [],
    demoIndex: 0,
    isPlayingDemo: false,
    isMicActive: false,
    isCamActive: false,
    recognition: null,
    wakeLock: null,
    audioCtx: null,
    gainNode: null,
    lastTapTime: 0,
    tapCount: 0,
    longTapTimer: null,
    practiceModeActive: false,
    
    // HUD State
    timerInterval: null,
    timerSeconds: 0,
    timerRunning: false,
    counterValue: 0
};

let modules = { settings: null, sensors: null };
let timers = { speedDelete: null, initialDelay: null, demo: null };

// --- INIT ---
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    loadSettings();
    initAudio();
    initSpeechRecognition();
    initWakeLock();
    
    modules.sensors = new SensorEngine(handleSensorTrigger, (status) => {
        const ab = document.getElementById('calib-audio-bar');
        const cb = document.getElementById('calib-cam-bar');
        if(ab) ab.style.width = Math.min(100, (status.audioLevel + 100)) + "%";
        if(cb) cb.style.width = Math.min(100, status.camDiff) + "%";
    });

    modules.settings = new SettingsManager(appSettings, {
        onSave: saveSettings,
        onUpdate: () => { renderUI(); updateHud(); }
    }, modules.sensors);

    initComments(db);
    
    // Initial Render
    renderUI();
    updateHud();
    
    // Event Bindings
    bindFooterEvents();        
    attachGlobalListeners();   
    
    if(appSettings.showWelcomeScreen) setTimeout(() => modules.settings.openSetup(), 500);

    const practiceBtn = document.getElementById('practice-start-btn');
    if(practiceBtn) practiceBtn.addEventListener('click', startPracticeRound);
}

// --- HUD LOGIC ---
function updateHud() {
    const hud = document.getElementById('hud-header');
    const timerBtn = document.getElementById('hud-timer-btn');
    const counterBtn = document.getElementById('hud-counter-btn');
    const micBtn = document.getElementById('hud-mic-btn');
    const camBtn = document.getElementById('hud-cam-btn');
    
    const hasTimer = appSettings.showHudTimer;
    const hasCounter = appSettings.showHudCounter;
    const hasMic = appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both';
    const hasCam = appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both';
    
    if(timerBtn) timerBtn.classList.toggle('hidden', !hasTimer);
    if(counterBtn) counterBtn.classList.toggle('hidden', !hasCounter);
    if(micBtn) micBtn.classList.toggle('hidden', !hasMic);
    if(camBtn) camBtn.classList.toggle('hidden', !hasCam);
    
    const anyActive = hasTimer || hasCounter || hasMic || hasCam;
    if(anyActive) {
        hud.classList.add('active');
        document.getElementById('app').style.paddingTop = '4.5rem'; 
    } else {
        hud.classList.remove('active');
        document.getElementById('app').style.paddingTop = '1rem';
    }

    if(timerBtn) {
        timerBtn.onclick = toggleHudTimer;
        addLongPressListener(timerBtn, resetHudTimer);
    }
    if(counterBtn) {
        counterBtn.onclick = () => { state.counterValue++; updateHudCounterDisplay(); };
        addLongPressListener(counterBtn, () => { state.counterValue = 0; updateHudCounterDisplay(); });
    }
    if(micBtn) micBtn.onclick = toggleMic;
    if(camBtn) camBtn.onclick = toggleCam;
}

function toggleHudTimer() {
    if(state.timerRunning) {
        clearInterval(state.timerInterval);
        state.timerRunning = false;
        document.getElementById('hud-timer-btn').classList.remove('active');
    } else {
        state.timerRunning = true;
        document.getElementById('hud-timer-btn').classList.add('active');
        state.timerInterval = setInterval(() => {
            state.timerSeconds++;
            updateHudTimerDisplay();
        }, 1000);
    }
}

function resetHudTimer() {
    clearInterval(state.timerInterval);
    state.timerRunning = false;
    state.timerSeconds = 0;
    updateHudTimerDisplay();
    document.getElementById('hud-timer-btn').classList.remove('active');
}

function updateHudTimerDisplay() {
    const min = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
    const sec = (state.timerSeconds % 60).toString().padStart(2, '0');
    const el = document.getElementById('hud-timer-val');
    if(el) el.textContent = `${min}:${sec}`;
}

function updateHudCounterDisplay() {
    const el = document.getElementById('hud-counter-val');
    if(el) el.textContent = state.counterValue;
}

function addLongPressListener(el, callback) {
    let timer;
    const start = (e) => {
        if(e.type === 'touchstart') e.preventDefault();
        timer = setTimeout(() => {
            if(navigator.vibrate && appSettings.isHapticsEnabled) navigator.vibrate(50);
            callback();
        }, 600);
    };
    const end = () => clearTimeout(timer);
    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
    el.addEventListener('touchend', end);
}
// --- UI ---
function renderUI() {
    const container = document.getElementById('sequence-container');
    const body = document.body;
    const ps = appSettings.runtimeSettings;
    
    // Apply Global Settings
    body.classList.toggle('blackout-active', appSettings.isBlackoutMode);
    body.classList.toggle('input-gestures-active', appSettings.isGestureInputEnabled); 
    
    // Toggle Footer Input Pads
    document.getElementById('pad-key9').style.display = (ps.currentInput === CONFIG.INPUTS.KEY9) ? 'block' : 'none';
    document.getElementById('pad-key12').style.display = (ps.currentInput === CONFIG.INPUTS.KEY12) ? 'block' : 'none';
    document.getElementById('pad-piano').style.display = (ps.currentInput === CONFIG.INPUTS.PIANO) ? 'block' : 'none';

    // Practice Mode State
    const practiceBtn = document.getElementById('practice-start-btn');
    if (appSettings.isPracticeModeEnabled && !state.practiceModeActive) {
        // Show Start Button, Hide Game
        container.innerHTML = ''; 
        if(practiceBtn) {
            practiceBtn.style.display = 'block';
            practiceBtn.textContent = "START";
        }
        return;
    } else {
        if(practiceBtn) practiceBtn.style.display = 'none';
    }

    // Render Sequence
    const inputs = state.sequence;
    container.innerHTML = '';
    
    // Calculate Font Size based on setting
    const baseSize = 1.2; // rem
    const fontMult = appSettings.globalFontSize / 100;
    const finalFontSize = `${baseSize * fontMult}rem`;

    if (ps.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-2 justify-center p-2';
        
        inputs.forEach((val, idx) => {
            const isUser = (idx < state.userSequence.length);
            const isCurrent = (idx === state.userSequence.length);
            const match = isUser ? (state.userSequence[idx] === val) : null;
            
            const div = document.createElement('div');
            div.style.fontSize = finalFontSize;
            
            div.className = `number-box w-12 h-12 md:w-14 md:h-14 font-bold rounded-lg border-2 flex items-center justify-center transition-all duration-200 
            ${isUser 
                ? (match ? 'bg-gray-800 border-green-500 text-green-400 opacity-50' : 'bg-red-900 border-red-500 text-white') 
                : (isCurrent ? 'bg-primary-app border-white scale-110 z-10 shadow-lg' : 'bg-gray-800 border-gray-600 text-gray-400')}`;
            
            div.textContent = val;
            wrap.appendChild(div);
        });
        container.appendChild(wrap);
        
        document.querySelectorAll('.reset-button').forEach(b => b.style.display = 'block');
    } else {
        // Simon Mode
        document.querySelectorAll('.reset-button').forEach(b => b.style.display = 'none');
        
        const showCount = Math.max(1, Math.min(inputs.length, 5)); 
        const visibleInputs = inputs.slice(-showCount);
        
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-3 justify-center items-center';
        
        visibleInputs.forEach((val, i) => {
            const isLast = i === visibleInputs.length - 1;
            const div = document.createElement('div');
            div.style.fontSize = isLast ? `calc(${finalFontSize} * 1.5)` : finalFontSize; 
            div.className = `number-box transition-all duration-300 flex items-center justify-center rounded-xl shadow-lg 
                ${isLast 
                    ? 'w-24 h-24 bg-primary-app text-white border-2 border-white' 
                    : 'w-16 h-16 bg-gray-800 text-gray-500 border border-gray-700'}`;
            div.textContent = val;
            wrap.appendChild(div);
        });
        container.appendChild(wrap);
    }
}

function startPracticeRound() {
    state.practiceModeActive = true;
    state.sequence = [];
    state.userSequence = [];
    
    const practiceBtn = document.getElementById('practice-start-btn');
    if(practiceBtn) practiceBtn.style.display = 'none';

    addToSequence(); 
    renderUI();
    
    setTimeout(() => playDemo(), 500);
}

function resetUniqueRounds() {
    state.sequence = [];
    state.userSequence = [];
    
    if(appSettings.isPracticeModeEnabled) {
        state.practiceModeActive = false;
    } else {
        addToSequence();
    }
    renderUI();
}

// --- CORE GAME LOGIC ---
function handleInput(val) {
    if (state.isPlayingDemo) return;
    
    if (!appSettings.isPracticeModeEnabled && state.sequence.length === 0) {
        addToSequence();
        renderUI();
    }

    const ps = appSettings.runtimeSettings;

    flashButton(val);

    if (ps.currentMode === CONFIG.MODES.SIMON) {
        const expected = state.sequence[state.userSequence.length];
        if (val === expected) {
            state.userSequence.push(val);
            if (state.userSequence.length === state.sequence.length) {
                if (appSettings.isAudioEnabled) speak("Correct");
                state.userSequence = [];
                setTimeout(() => {
                    addToSequence();
                    renderUI();
                    if (ps.isAutoplayEnabled) setTimeout(playDemo, 500);
                }, 500);
            }
        } else {
            if(navigator.vibrate && appSettings.isHapticsEnabled) navigator.vibrate(200);
            if (appSettings.isAudioEnabled) speak("Wrong");
            showToast(`Wrong! Expected: ${expected}`);
            
            if(appSettings.isPracticeModeEnabled) {
                state.practiceModeActive = false;
                state.sequence = [];
                state.userSequence = [];
                renderUI();
            } else {
                state.sequence = [];
                state.userSequence = [];
                setTimeout(() => { addToSequence(); renderUI(); }, 1000);
            }
        }
    } else {
        state.userSequence.push(val);
        while (state.sequence.length < state.userSequence.length) {
            addToSequence();
        }
        
        renderUI();
        
        if (ps.isUniqueRoundsAutoClearEnabled && state.userSequence.length >= 5) {
             if(state.userSequence.length % 10 === 0) {
                 // Clean up logic if needed
             }
        }
        
        if (state.sequence.length === state.userSequence.length) {
             addToSequence();
             renderUI();
             if (ps.isAutoplayEnabled) {
                 setTimeout(() => playDemo(true), 200); 
             }
        }
    }
}

function addToSequence() {
    const ps = appSettings.runtimeSettings;
    let pool = [];
    if (ps.currentInput === CONFIG.INPUTS.KEY9) pool = ['1','2','3','4','5','6','7','8','9'];
    else if (ps.currentInput === CONFIG.INPUTS.KEY12) pool = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    else pool = ['C','D','E','F','G','A','B','1','2','3','4','5'];

    const nextVal = pool[Math.floor(Math.random() * pool.length)];
    state.sequence.push(nextVal);
}

function handleBackspace() {
    if (state.userSequence.length > 0) {
        state.userSequence.pop();
        if(appSettings.runtimeSettings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
             if(state.sequence.length > state.userSequence.length) {
                 state.sequence.pop(); 
             }
        }
        renderUI();
    }
}
// --- DEMO PLAYBACK ---
async function playDemo(playOnlyNewItems = false) {
    if (state.isPlayingDemo) {
        state.isPlayingDemo = false;
        clearTimeout(timers.demo);
        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.textContent = "▶");
        return;
    }

    state.isPlayingDemo = true;
    document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.textContent = "⏹");

    const ps = appSettings.runtimeSettings;
    const speedMs = CONFIG.DEMO_DELAY_BASE_MS / ps.playbackSpeed;
    const startIndex = playOnlyNewItems ? Math.max(0, state.sequence.length - 1) : 0;
    const hapticPauseMs = (ps.hapticMorsePause || 0) * 1000;

    const playStep = async (i) => {
        if (!state.isPlayingDemo || i >= state.sequence.length) {
            state.isPlayingDemo = false;
            document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.textContent = "▶");
            return;
        }

        const val = state.sequence[i];
        flashButton(val);

        if (appSettings.isAudioEnabled) speak(val);
        if (appSettings.isHapticMorseEnabled) await vibrateMorse(val);

        const totalDelay = speedMs + (appSettings.isHapticMorseEnabled ? hapticPauseMs : 0);
        timers.demo = setTimeout(() => playStep(i + 1), totalDelay);
    };

    playStep(startIndex);
}

// --- SYSTEM ACTIONS ---
function triggerSystemAction(actionId) {
    if(!actionId) return;
    console.log("System Action:", actionId);
    
    switch(actionId) {
        case 'toggle_blackout':
            appSettings.isBlackoutMode = !appSettings.isBlackoutMode;
            renderUI();
            showToast(`Blackout: ${appSettings.isBlackoutMode ? 'ON' : 'OFF'}`);
            break;
        case 'toggle_input_gestures':
            appSettings.isGestureInputEnabled = !appSettings.isGestureInputEnabled;
            renderUI();
            if(modules.settings && modules.settings.dom.gestureInputToggle) 
                modules.settings.dom.gestureInputToggle.checked = appSettings.isGestureInputEnabled;
            showToast(`Gesture Input: ${appSettings.isGestureInputEnabled ? 'ON' : 'OFF'}`);
            break;
        case 'reset_game':
            if(appSettings.runtimeSettings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) resetUniqueRounds();
            else { state.sequence = []; state.userSequence = []; addToSequence(); renderUI(); }
            showToast("Game Reset");
            break;
        case 'backspace':
            handleBackspace();
            break;
        case 'play_demo':
            playDemo();
            break;
        case 'toggle_hud':
            const hud = document.getElementById('hud-header');
            if(hud) hud.classList.toggle('active'); 
            break;
        case 'timer_toggle':
            toggleHudTimer();
            break;
        case 'timer_reset':
            resetHudTimer();
            break;
        case 'counter_inc':
            state.counterValue++;
            updateHudCounterDisplay();
            break;
        case 'counter_reset':
            state.counterValue = 0;
            updateHudCounterDisplay();
            break;
    }
}

// --- GLOBAL LISTENERS (Gestures & Pinch) ---
function attachGlobalListeners() {
    let touchStartX = 0, touchStartY = 0;
    let touchStartTime = 0;
    let initialPinchDist = null;
    let initialValue = null;
    let fingers = 0;
    let isGesture = false;

    const handleStart = (e) => {
        const isBlackout = appSettings.isBlackoutMode;
        const isInputMode = appSettings.isGestureInputEnabled;

        // 1. Handle Pinch Start
        if (e.touches && e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDist = Math.sqrt(dx*dx + dy*dy);
            
            if (appSettings.gestureResizeMode === 'font') initialValue = appSettings.globalFontSize;
            else if (appSettings.gestureResizeMode === 'sequence') initialValue = appSettings.sequenceSize;
            else initialValue = appSettings.uiScale; 
            return;
        }

        // 2. Handle Swipe/Tap Start
        if (!isBlackout && !isInputMode) return;
        if (!isBlackout && e.target.closest('button, input, select')) return;

        fingers = e.touches ? e.touches.length : 1;
        touchStartX = e.touches ? e.touches[0].clientX : e.clientX;
        touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
        touchStartTime = Date.now();
        isGesture = true;
    };

    const handleMove = (e) => {
        // Handle Pinch Resize
        if (initialPinchDist && e.touches && e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const currentDist = Math.sqrt(dx*dx + dy*dy);
            
            const scaleFactor = currentDist / initialPinchDist;
            let newValue = Math.round(initialValue * scaleFactor);
            
            if (appSettings.gestureResizeMode === 'font') {
                newValue = Math.max(100, Math.min(200, newValue));
                appSettings.globalFontSize = newValue;
                if(modules.settings && modules.settings.dom.fontSizeSlider) {
                    modules.settings.dom.fontSizeSlider.value = newValue;
                    modules.settings.dom.fontSizeDisplay.textContent = newValue + "%";
                }
            } else {
                newValue = Math.max(50, Math.min(300, newValue));
                if (appSettings.gestureResizeMode === 'sequence') appSettings.sequenceSize = newValue;
                else appSettings.uiScale = newValue;
            }
            requestAnimationFrame(renderUI);
        }
    };

    const handleEnd = (e) => {
        // Reset Pinch
        if (initialPinchDist && (!e.touches || e.touches.length < 2)) {
            initialPinchDist = null;
            initialValue = null;
            return;
        }

        if (!isGesture) return;
        isGesture = false;

        const touchEndX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const touchEndY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const duration = Date.now() - touchStartTime;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let gestureType = null;
        if (dist < 30) {
            if (duration > 400) gestureType = `long_tap${fingers > 1 ? `_${fingers}f` : ''}`;
            else gestureType = `tap${fingers > 1 ? `_${fingers}f` : ''}`; 
        } else {
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            let dir = '';
            if(angle >= -22 && angle < 22) dir = 'right';
            else if(angle >= 22 && angle < 68) dir = 'se';
            else if(angle >= 68 && angle < 112) dir = 'down';
            else if(angle >= 112 && angle < 158) dir = 'sw';
            else if(angle >= 158 || angle < -158) dir = 'left';
            else if(angle >= -158 && angle < -112) dir = 'nw';
            else if(angle >= -112 && angle < -68) dir = 'up';
            else if(angle >= -68 && angle < -22) dir = 'ne';
            gestureType = `swipe_${dir}${fingers > 1 ? `_${fingers}f` : ''}`;
        }
        
        if(gestureType) executeGesture(gestureType);
    };

    const executeGesture = (type) => {
        console.log("Detected Gesture:", type);
        const genAction = appSettings.generalActions?.find(a => a.trigger === type);
        if(genAction) { triggerSystemAction(genAction.action); return; }
        
        if(appSettings.gestureMappings) {
            for(const [keyId, map] of Object.entries(appSettings.gestureMappings)) {
                if(map.gesture === type) {
                    let val = keyId.replace(/^(k9_|k12_|piano_)/, '');
                    if(val) handleInput(val);
                    return;
                }
            }
        }
    };

    window.addEventListener('touchstart', handleStart, {passive: false});
    window.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('touchend', handleEnd, {passive: false});
    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mouseup', handleEnd);
}
function bindFooterEvents() {
    // 1. Keypad & Piano Inputs
    document.querySelectorAll('.btn-pad-number, .piano-key-white, .piano-key-black').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleInput(newBtn.dataset.value);
        });
        newBtn.addEventListener('touchstart', () => newBtn.classList.add('active'), {passive: true});
        newBtn.addEventListener('touchend', () => newBtn.classList.remove('active'));
    });

    // 2. Control Buttons
    document.querySelectorAll('button[data-action]').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        if (newBtn.dataset.action === 'backspace') {
            setupSpeedDelete(newBtn);
        } else {
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = newBtn.dataset.action;
                if (action === 'open-settings') modules.settings.openSettings();
                else if (action === 'play-demo') triggerSystemAction('play_demo');
                else if (action === 'reset-unique-rounds') triggerSystemAction('reset_game');
                else triggerSystemAction(action);
            });
        }
    });
}

function setupSpeedDelete(btn) {
    const performDelete = () => {
        triggerSystemAction('backspace');
        if (navigator.vibrate && appSettings.isHapticsEnabled) navigator.vibrate(10);
    };

    const start = (e) => {
        if(e.type === 'touchstart') e.preventDefault();
        performDelete(); 
        if (appSettings.isSpeedDeletingEnabled) {
            timers.initialDelay = setTimeout(() => {
                timers.speedDelete = setInterval(performDelete, CONFIG.SPEED_DELETE_INTERVAL);
            }, CONFIG.SPEED_DELETE_DELAY);
        }
    };

    const stop = () => {
        clearTimeout(timers.initialDelay);
        clearInterval(timers.speedDelete);
    };

    btn.addEventListener('mousedown', start);
    btn.addEventListener('touchstart', start);
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('mouseleave', stop);
    btn.addEventListener('touchend', stop);
    btn.addEventListener('click', (e) => e.preventDefault());
}

// --- FEEDBACK SYSTEMS ---
function flashButton(val) {
    const ps = appSettings.runtimeSettings;
    let btn;
    if (ps.currentInput === CONFIG.INPUTS.PIANO) {
        btn = document.querySelector(`button[data-value="${val}"]`);
    } else {
        btn = document.querySelector(`#pad-${ps.currentInput} button[data-value="${val}"]`);
    }
    if (btn) {
        btn.classList.add('flash-active');
        setTimeout(() => btn.classList.remove('flash-active'), 200);
    }
}

function speak(text) {
    if (!state.gainNode) initAudio(); 
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        
        // --- DICTIONARY LOOKUP (RESTORED) ---
        const lang = appSettings.generalLanguage || 'en';
        const dict = DICTIONARY[lang] || DICTIONARY['en'];
        let msg = text;
        if(text === "Correct") msg = dict.correct;
        if(text === "Wrong") msg = dict.wrong;
        if(text === "Stealth Active") msg = dict.stealth;

        const utterance = new SpeechSynthesisUtterance(msg.toString());
        const presetId = appSettings.activeVoicePresetId || 'standard';
        const preset = appSettings.voicePresets?.[presetId] || PREMADE_VOICE_PRESETS[presetId] || PREMADE_VOICE_PRESETS['standard'];
        utterance.pitch = preset.pitch;
        utterance.rate = preset.rate;
        utterance.volume = preset.volume;
        window.speechSynthesis.speak(utterance);
    }
}

async function vibrateMorse(val) {
    if (!navigator.vibrate) return;
    const morseCode = {
        '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
        '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
        '10': '.---- -----', '11': '.---- .----', '12': '.---- ..---',
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..'
    };
    const pattern = morseCode[val.toString().toUpperCase()];
    if (!pattern) return;

    const dot = 60; const dash = 200; const gap = 50;   
    for (const symbol of pattern) {
        if (symbol === '.') navigator.vibrate(dot);
        else if (symbol === '-') navigator.vibrate(dash);
        else if (symbol === ' ') await new Promise(r => setTimeout(r, 200)); 
        await new Promise(r => setTimeout(r, gap + (symbol === '.' ? dot : dash))); 
    }
}

function showToast(msg) {
    // --- DICTIONARY LOOKUP (RESTORED) ---
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    if(msg === "Reset to Round 1") msg = dict.reset;
    if(msg === "Playback Stopped 🛑") msg = dict.stop;
    if(msg === "Stealth Active") msg = dict.stealth;

    const t = document.getElementById('toast-notification');
    const m = document.getElementById('toast-message');
    if (t && m) {
        m.textContent = msg;
        t.classList.remove('opacity-0', '-translate-y-10');
        setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000);
    }
}

// --- PERSISTENCE ---
function saveSettings() {
    try { localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); } catch (e) { console.error("Save failed", e); }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
        if (saved) {
            const parsed = JSON.parse(saved);
            appSettings = { ...appSettings, ...parsed, runtimeSettings: { ...appSettings.runtimeSettings, ...parsed.runtimeSettings } };
            // Ensure array defaults
            if(!appSettings.generalActions) appSettings.generalActions = []; 
            if(!appSettings.customGestures) appSettings.customGestures = [];
            // Ensure profiles exist (merge preserved defaults if profiles are missing)
            if(!appSettings.profiles) appSettings.profiles = JSON.parse(JSON.stringify(PREMADE_PROFILES));
        }
    } catch (e) { console.error("Load failed", e); }
}

// --- SENSOR TOGGLES (HUD) ---
function toggleMic() {
    state.isMicActive = !state.isMicActive;
    const btn = document.getElementById('hud-mic-btn');
    if(state.isMicActive) {
        btn.classList.add('active');
        if(modules.sensors) modules.sensors.startAudio();
    } else {
        btn.classList.remove('active');
        if(modules.sensors) modules.sensors.stopAudio();
    }
}

function toggleCam() {
    state.isCamActive = !state.isCamActive;
    const btn = document.getElementById('hud-cam-btn');
    if(state.isCamActive) {
        btn.classList.add('active');
        if(modules.sensors) modules.sensors.startCamera();
    } else {
        btn.classList.remove('active');
        if(modules.sensors) modules.sensors.stopCamera();
    }
}

function handleSensorTrigger(num, source) {
    if(source === 'shake') {
        const genAction = appSettings.generalActions?.find(a => a.trigger === 'shake');
        if(genAction) { triggerSystemAction(genAction.action); return; }
        triggerSystemAction('toggle_input_gestures'); 
        return;
    }
    if(source === 'camera-cover') { 
         const genAction = appSettings.generalActions?.find(a => a.trigger === 'cam_cover');
         if(genAction) triggerSystemAction(genAction.action);
         return;
    }
    const mode = appSettings.autoInputMode;
    if (mode === 'none') return;
    if (source.startsWith('camera') && mode === 'mic') return;
    if (source === 'audio' && mode === 'cam') return;
    handleInput(num.toString());
}

// --- BOILERPLATE INIT ---
function initAudio() {
    if (!state.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioContext();
        state.gainNode = state.audioCtx.createGain();
        state.gainNode.connect(state.audioCtx.destination);
    }
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
}

function initSpeechRecognition() {}

async function initWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            state.wakeLock = await navigator.wakeLock.request('screen');
            document.addEventListener('visibilitychange', async () => {
                if (state.wakeLock !== null && document.visibilityState === 'visible') {
                    state.wakeLock = await navigator.wakeLock.request('screen');
                }
            });
        }
    } catch (err) { console.log('Wake Lock error:', err); }
}

window.appState = state; 
