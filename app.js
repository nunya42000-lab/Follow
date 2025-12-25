// app.js - FIXED
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

// --- DICTIONARY ---
const DICTIONARY = {
    en: { correct: "Correct", wrong: "Wrong", stop: "Playback Stopped 🛑", reset: "Reset to Round 1", stealth: "Stealth Active" },
    es: { correct: "Correcto", wrong: "Incorrecto", stop: "Reproducción Detenida 🛑", reset: "Reinicio a Ronda 1", stealth: "Modo Sigilo" }
};

const DEFAULT_PROFILE_SETTINGS = { 
    currentInput: CONFIG.INPUTS.KEY9, 
    currentMode: CONFIG.MODES.SIMON, 
    sequenceLength: 20, 
    uniqueLength: 15, 
    machineCount: 1, 
    isUniqueRoundsAutoClearEnabled: false, 
    isAutoplayEnabled: false, 
    isAudioEnabled: true, 
    isHapticMorseEnabled: false, 
    hapticPauseDuration: 0, 
    playbackSpeed: 1.0, 
    simonInterSequenceDelay: 0, 
    chunkSize: 3 
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
    activeProfileId: 'profile_1',
    profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)),
    activeTheme: 'default',
    customThemes: {},
    activeVoicePresetId: 'standard',
    voicePresets: {},
    customGestures: [], // Fixed: Array
    generalActions: [
        {gesture: 'shake', action: 'act_toggle_input'},
        {gesture: 'cam_cover', action: 'act_toggle_blackout'}
    ], 
    showWelcomeScreen: true,
    isHapticsEnabled: true,
    isSpeedDeletingEnabled: true,
    isBlackoutMode: false,
    stealth1Key: false,
    isGestureInputEnabled: false, 
    isPracticeModeEnabled: false,
    showHudTimer: false,
    showHudCounter: false,
    globalFontSize: 100, 
    sequenceSize: 100,
    uiScale: 100,
    gestureResizeMode: 'global', 
    generalLanguage: 'en',
    autoInputMode: 'none', 
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS))
};

let state = {
    sequence: [],
    userSequence: [],
    practiceSequence: [],
    demoIndex: 0,
    isPlayingDemo: false,
    wakeLock: null,
    audioCtx: null,
    gainNode: null,
    timerInterval: null,
    timerSeconds: 0,
    timerRunning: false,
    counterValue: 0
};

let modules = { settings: null, sensors: null };
let timers = { speedDelete: null, initialDelay: null, demo: null, stealth: null };

// --- INIT ---
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    loadSettings();
    initAudio();
    initWakeLock();
    
    // Sensors
    modules.sensors = new SensorEngine(handleSensorTrigger, (status) => {
        const ab = document.getElementById('calib-audio-bar');
        const cb = document.getElementById('calib-cam-bar');
        if(ab) ab.style.width = Math.min(100, (status.audioLevel + 100)) + "%";
        if(cb) cb.style.width = Math.min(100, status.camDiff) + "%";
    });

    // Settings
    modules.settings = new SettingsManager(appSettings, {
        onSave: saveSettings,
        onUpdate: () => { renderUI(); updateHeaderVisibility(); }
    }, modules.sensors);

    initComments(db);
    initGesturePad();
    
    renderUI();
    updateHeaderVisibility();
    bindFooterEvents();        
    attachGlobalListeners();   
    
    // Practice Start Button
    const practiceStartBtn = document.getElementById('practice-start-btn');
    if(practiceStartBtn) {
        practiceStartBtn.onclick = () => {
            vibrate();
            startPracticeRound();
        };
    }

    setupHeaderListeners();

    if(appSettings.showWelcomeScreen) setTimeout(() => modules.settings.openSetup(), 500);
}

// --- HEADER / HUD LOGIC ---
function updateHeaderVisibility() {
    const header = document.getElementById('dynamic-header');
    const timerBtn = document.getElementById('header-timer-btn');
    const counterBtn = document.getElementById('header-counter-btn');
    const micBtn = document.getElementById('header-mic-btn');
    const camBtn = document.getElementById('header-cam-btn');
    
    if(!header) return;

    if(timerBtn) timerBtn.classList.toggle('hidden', !appSettings.showHudTimer);
    if(counterBtn) counterBtn.classList.toggle('hidden', !appSettings.showHudCounter);
    
    const showMic = (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both');
    const showCam = (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both');
    
    if(micBtn) micBtn.classList.toggle('hidden', !showMic);
    if(camBtn) camBtn.classList.toggle('hidden', !showCam);

    if(micBtn) micBtn.classList.toggle('master-active', modules.sensors && modules.sensors.mode.audio);
    if(camBtn) camBtn.classList.toggle('master-active', modules.sensors && modules.sensors.mode.camera);

    const hasVisible = [timerBtn, counterBtn, micBtn, camBtn].some(el => el && !el.classList.contains('hidden'));
    header.classList.toggle('header-visible', hasVisible);
    
    const app = document.getElementById('app');
    if(app) app.style.paddingTop = hasVisible ? '4rem' : '1rem';
}

function setupHeaderListeners() {
    const timerBtn = document.getElementById('header-timer-btn');
    const counterBtn = document.getElementById('header-counter-btn');
    const micBtn = document.getElementById('header-mic-btn');
    const camBtn = document.getElementById('header-cam-btn');

    if(timerBtn) bindLongPress(timerBtn, toggleHudTimer, resetHudTimer);
    if(counterBtn) bindLongPress(counterBtn, () => { state.counterValue++; updateHudCounterDisplay(); }, () => { state.counterValue = 0; updateHudCounterDisplay(); showToast("Counter Reset"); });
    
    if(micBtn) micBtn.onclick = () => {
        appSettings.isAudioEnabled = !appSettings.isAudioEnabled;
        if(modules.sensors) modules.sensors.toggleAudio(appSettings.isAudioEnabled);
        updateHeaderVisibility();
    };
    if(camBtn) camBtn.onclick = () => {
        const camActive = modules.sensors && modules.sensors.mode.camera;
        if(modules.sensors) modules.sensors.toggleCamera(!camActive);
        updateHeaderVisibility();
    };
}

function toggleHudTimer() {
    vibrate();
    const btn = document.getElementById('header-timer-btn');
    if(state.timerRunning) {
        clearInterval(state.timerInterval);
        state.timerRunning = false;
        if(btn) btn.classList.remove('timer-running');
    } else {
        state.timerRunning = true;
        if(btn) btn.classList.add('timer-running');
        state.timerInterval = setInterval(() => {
            state.timerSeconds++;
            updateHudTimerDisplay();
        }, 1000);
    }
}

function resetHudTimer() {
    vibrate();
    clearInterval(state.timerInterval);
    state.timerRunning = false;
    state.timerSeconds = 0;
    updateHudTimerDisplay();
    const btn = document.getElementById('header-timer-btn');
    if(btn) btn.classList.remove('timer-running');
    showToast("Timer Reset");
}

function updateHudTimerDisplay() {
    const min = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
    const sec = (state.timerSeconds % 60).toString().padStart(2, '0');
    const el = document.getElementById('header-timer-btn');
    if(el) el.textContent = `${min}:${sec}`;
}

function updateHudCounterDisplay() {
    const el = document.getElementById('header-counter-btn');
    if(el) el.textContent = state.counterValue;
}

// --- UI RENDERER ---
function renderUI() {
    const container = document.getElementById('sequence-container');
    const body = document.body;
    const ps = appSettings.runtimeSettings;
    
    body.classList.toggle('blackout-active', appSettings.isBlackoutMode);
    
    if (appSettings.isGestureInputEnabled) {
        body.classList.add('gesture-fullscreen');
    } else {
        body.classList.remove('gesture-fullscreen');
    }

    document.getElementById('pad-key9').style.display = (ps.currentInput === CONFIG.INPUTS.KEY9) ? 'block' : 'none';
    document.getElementById('pad-key12').style.display = (ps.currentInput === CONFIG.INPUTS.KEY12) ? 'block' : 'none';
    document.getElementById('pad-piano').style.display = (ps.currentInput === CONFIG.INPUTS.PIANO) ? 'block' : 'none';

    const practiceBtnContainer = document.getElementById('practice-start-container');
    if (appSettings.isPracticeModeEnabled) {
        if (state.practiceSequence.length === 0) {
            if(practiceBtnContainer) practiceBtnContainer.classList.remove('hidden');
            container.innerHTML = '';
            return;
        } else {
            if(practiceBtnContainer) practiceBtnContainer.classList.add('hidden');
            const modeName = (ps.currentMode === CONFIG.MODES.SIMON) ? 'Simon' : 'Unique';
            container.innerHTML = `<h2 class="text-2xl font-bold text-center w-full mt-10 mb-4" style="color:var(--text-main)">Practice Mode (${modeName})<br><span class="text-sm opacity-70">Round ${state.practiceSequence.length}</span></h2>`;
        }
    } else {
        if(practiceBtnContainer) practiceBtnContainer.classList.add('hidden');
        container.innerHTML = '';
    }

    const inputs = appSettings.isPracticeModeEnabled ? state.practiceSequence : state.sequence;
    const userInputs = state.userSequence;
    
    const baseSize = 1.2;
    const fontMult = (appSettings.globalFontSize || 100) / 100;
    const uiScale = (appSettings.uiScale || 100) / 100;
    
    const finalBoxSize = 40 * uiScale; 
    const finalFontSize = `${baseSize * fontMult * uiScale}rem`;

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-wrap gap-2 justify-center p-2';

    if (ps.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        inputs.forEach((val, idx) => {
            const isUser = (idx < userInputs.length);
            const isCurrent = (idx === userInputs.length);
            const match = isUser ? (userInputs[idx] === val) : null;
            
            const div = document.createElement('div');
            div.style.width = finalBoxSize + 'px';
            div.style.height = finalBoxSize + 'px';
            div.style.fontSize = finalFontSize;
            
            div.className = `number-box font-bold rounded-lg border-2 flex items-center justify-center transition-all duration-200 
            ${isUser 
                ? (match ? 'bg-gray-800 border-green-500 text-green-400 opacity-50' : 'bg-red-900 border-red-500 text-white') 
                : (isCurrent ? 'bg-primary-app border-white scale-110 z-10 shadow-lg' : 'bg-gray-800 border-gray-600 text-gray-400')}`;
            
            div.textContent = val;
            wrap.appendChild(div);
        });
        document.querySelectorAll('.reset-button').forEach(b => b.style.display = 'block');
    } else {
        // Simon Mode
        document.querySelectorAll('.reset-button').forEach(b => b.style.display = 'none');
        const showCount = Math.max(1, Math.min(inputs.length, 5)); 
        const visibleInputs = inputs.slice(-showCount);
        
        visibleInputs.forEach((val, i) => {
            const isLast = i === visibleInputs.length - 1;
            const div = document.createElement('div');
            const boxSize = isLast ? finalBoxSize * 1.5 : finalBoxSize;
            
            div.style.width = boxSize + 'px';
            div.style.height = boxSize + 'px';
            div.style.fontSize = isLast ? `calc(${finalFontSize} * 1.5)` : finalFontSize;
            
            div.className = `number-box transition-all duration-300 flex items-center justify-center rounded-xl shadow-lg 
                ${isLast 
                    ? 'bg-primary-app text-white border-2 border-white' 
                    : 'bg-gray-800 text-gray-500 border border-gray-700'}`;
            div.textContent = val;
            wrap.appendChild(div);
        });
    }
    container.appendChild(wrap);
}

// --- CORE GAME LOGIC ---
function handleInput(val) {
    if (state.isPlayingDemo) return;

    // Stealth Mode Toggle (Hold 1)
    if(val === '1' && !appSettings.isPracticeModeEnabled && state.sequence.length === 0) {
        // Only trigger stealth if we are in idle state, handled via Long Press in footer binding usually,
        // but keeping simple check here if needed.
    }
    
    // 1. Practice Mode Logic
    if (appSettings.isPracticeModeEnabled) {
        state.userSequence.push(val);
        flashButton(val);
        
        const idx = state.userSequence.length - 1;
        if (state.userSequence[idx] !== state.practiceSequence[idx]) {
            if(navigator.vibrate && appSettings.isHapticsEnabled) navigator.vibrate(200);
            if(appSettings.isAudioEnabled) speak("Wrong");
            showToast("Wrong!");
            state.userSequence = []; 
            setTimeout(renderUI, 500);
        } else {
            if(state.userSequence.length === state.practiceSequence.length) {
                if(appSettings.isAudioEnabled) speak("Correct");
                showToast("Round Complete!");
                setTimeout(startPracticeRound, 1000); 
            }
            renderUI();
        }
        return;
    }

    // 2. Standard Game Logic
    if (state.sequence.length === 0) {
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
            
            state.sequence = [];
            state.userSequence = [];
            setTimeout(() => { addToSequence(); renderUI(); }, 1000);
        }
    } else {
        // Unique Logic
        state.userSequence.push(val);
        while (state.sequence.length < state.userSequence.length) {
            addToSequence();
        }
        renderUI();
        
        const targetLen = ps.uniqueLength || 15;
        if (state.userSequence.length >= targetLen && ps.isAutoplayEnabled) {
             setTimeout(() => playDemo(true), 300); 
        } else if (state.sequence.length === state.userSequence.length) {
             addToSequence();
             renderUI();
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
    const targetSeq = state.userSequence;
    
    if (targetSeq.length > 0) {
        targetSeq.pop();
        if(!appSettings.isPracticeModeEnabled && appSettings.runtimeSettings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
             if(state.sequence.length > state.userSequence.length) {
                 state.sequence.pop(); 
             }
        }
        renderUI();
    }
}

function startPracticeRound() {
    state.sequence = []; 
    state.userSequence = [];
    state.practiceSequence = []; 
    
    const practiceBtn = document.getElementById('practice-start-btn');
    if(practiceBtn) practiceBtn.style.display = 'none';

    const settings = appSettings.runtimeSettings;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    const len = isUnique ? (settings.uniqueLength || 15) : 5; 
    
    const max = (settings.currentInput === CONFIG.INPUTS.KEY12) ? 12 : 9;
    const pool = (settings.currentInput === CONFIG.INPUTS.PIANO) 
        ? ['C','D','E','F','G','A','B','1','2','3','4','5']
        : Array.from({length: max}, (_, i) => (i + 1).toString());

    for(let i=0; i<len; i++) {
        state.practiceSequence.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    showToast(`Practice: ${len} items`);
    renderUI();
    setTimeout(() => playDemo(), 500);
}

function resetUniqueRounds() {
    state.sequence = [];
    state.userSequence = [];
    if(appSettings.isPracticeModeEnabled) {
        renderUI();
    } else {
        addToSequence();
        renderUI();
    }
}

// --- DEMO PLAYBACK ---
async function playDemo(playOnlyNewItems = false) {
    if (state.isPlayingDemo) {
        stopDemo();
        return;
    }

    state.isPlayingDemo = true;
    document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.textContent = "⏹");

    const seq = appSettings.isPracticeModeEnabled ? state.practiceSequence : state.sequence;
    const ps = appSettings.runtimeSettings;
    const speedMs = CONFIG.DEMO_DELAY_BASE_MS / (ps.playbackSpeed || 1.0);
    const startIndex = playOnlyNewItems ? Math.max(0, seq.length - 1) : 0;
    const hapticPauseMs = (ps.hapticPauseDuration || 0); 

    const playStep = async (i) => {
        if (!state.isPlayingDemo || i >= seq.length) {
            stopDemo();
            return;
        }

        const val = seq[i];
        flashButton(val);

        if (appSettings.isAudioEnabled) speak(val);
        if (appSettings.isHapticMorseEnabled) vibrateMorse(val);

        const totalDelay = speedMs + (appSettings.isHapticMorseEnabled ? hapticPauseMs : 0);
        timers.demo = setTimeout(() => playStep(i + 1), totalDelay);
    };

    playStep(startIndex);
}

function stopDemo() {
    state.isPlayingDemo = false;
    clearTimeout(timers.demo);
    document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.textContent = "▶");
    renderUI();
}

function flashButton(val) {
    const ps = appSettings.runtimeSettings;
    let btn;
    if (ps.currentInput === CONFIG.INPUTS.PIANO) {
        btn = document.querySelector(`button[data-value="${val}"]`);
    } else {
        const containerId = ps.currentInput === CONFIG.INPUTS.KEY12 ? 'pad-key12' : 'pad-key9';
        btn = document.querySelector(`#${containerId} button[data-value="${val}"]`);
    }
    
    if (btn) {
        btn.classList.add('flash-active');
        setTimeout(() => btn.classList.remove('flash-active'), 200);
    }
}

// --- SYSTEM ACTIONS ---
function triggerSystemAction(actionId) {
    if(!actionId) return;
    switch(actionId) {
        case 'act_toggle_blackout':
            appSettings.isBlackoutMode = !appSettings.isBlackoutMode;
            renderUI();
            showToast(`Blackout: ${appSettings.isBlackoutMode ? 'ON' : 'OFF'}`);
            break;
        case 'act_toggle_input':
            appSettings.isGestureInputEnabled = !appSettings.isGestureInputEnabled;
            renderUI();
            updateHeaderVisibility();
            showToast(`Gestures: ${appSettings.isGestureInputEnabled ? 'ON' : 'OFF'}`);
            break;
        case 'act_reset':
            if(confirm("Reset Round?")) {
                if(appSettings.runtimeSettings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) resetUniqueRounds();
                else { state.sequence = []; state.userSequence = []; addToSequence(); renderUI(); }
            }
            break;
        case 'act_backspace': handleBackspace(); break;
        case 'act_play': playDemo(); break;
        case 'act_settings': if(modules.settings) modules.settings.openSettings(); break;
        case 'act_redeem': if(modules.settings) modules.settings.toggleRedeem(true); break;
    }
}

// --- GESTURE & SENSOR LOGIC ---
function initGesturePad() {
    const pad = document.getElementById('gesture-pad');
    const indicator = document.getElementById('gesture-indicator');
    if(!pad) return;

    let strokes = [];
    let currentStroke = [];
    let timer = null;
    let isTouchActive = false;

    const start = (e) => {
        e.preventDefault();
        isTouchActive = true;
        clearTimeout(timer);
        const t = e.touches[0];
        const rect = pad.getBoundingClientRect();
        currentStroke = [{x: t.clientX - rect.left, y: t.clientY - rect.top}];
    };

    const move = (e) => {
        if(!isTouchActive) return;
        e.preventDefault();
        const t = e.touches[0];
        const rect = pad.getBoundingClientRect();
        currentStroke.push({x: t.clientX - rect.left, y: t.clientY - rect.top});
    };

    const end = (e) => {
        if(!isTouchActive) return;
        e.preventDefault();
        isTouchActive = false;
        
        if(currentStroke.length > 2) strokes.push(currentStroke);
        
        timer = setTimeout(() => {
            processGestures(strokes, e.changedTouches.length); 
            strokes = [];
        }, 400);
    };

    pad.addEventListener('touchstart', start, {passive:false});
    pad.addEventListener('touchmove', move, {passive:false});
    pad.addEventListener('touchend', end, {passive:false});
}

function processGestures(strokes, fingers) {
    if(strokes.length === 0) return;
    
    // 1. Custom Match
    const customMatch = matchCustomGesture(strokes);
    if(customMatch) {
        resolveGesture(customMatch);
        return;
    }

    // 2. Standard Match
    if(strokes.length === 1) {
        const s = strokes[0];
        const dx = s[s.length-1].x - s[0].x;
        const dy = s[s.length-1].y - s[0].y;
        const dist = Math.hypot(dx, dy);
        
        let action = '';
        const suffix = fingers === 2 ? '_2f' : fingers === 3 ? '_3f' : '';

        if(dist < 20) {
            action = 'tap' + suffix; 
        } else {
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            if(angle >= -22.5 && angle < 22.5) action = 'swipe_right';
            else if(angle >= 22.5 && angle < 67.5) action = 'swipe_se';
            else if(angle >= 67.5 && angle < 112.5) action = 'swipe_down';
            else if(angle >= 112.5 && angle < 157.5) action = 'swipe_sw';
            else if(angle >= 157.5 || angle < -157.5) action = 'swipe_left';
            else if(angle >= -157.5 && angle < -112.5) action = 'swipe_nw';
            else if(angle >= -112.5 && angle < -67.5) action = 'swipe_up';
            else if(angle >= -67.5 && angle < -22.5) action = 'swipe_ne';
            action += suffix;
        }
        resolveGesture(action);
    }
}

function matchCustomGesture(inputStrokes) {
    if(!appSettings.customGestures) return null;
    const inputNorm = normalizeStrokes(inputStrokes);
    let bestMatch = null;
    let bestScore = Infinity;

    if(Array.isArray(appSettings.customGestures)) {
        appSettings.customGestures.forEach(g => {
            if(g.data && g.data.length === inputNorm.length) {
                const score = compareGestures(inputNorm, g.data);
                if(score < 0.3 && score < bestScore) {
                    bestScore = score;
                    bestMatch = g.type;
                }
            }
        });
    }
    return bestMatch;
}

function normalizeStrokes(strokes) {
    let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    strokes.flat().forEach(p => { if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x; if(p.y<minY)minY=p.y; if(p.y>maxY)maxY=p.y; });
    const w = Math.max(maxX - minX, 1); const h = Math.max(maxY - minY, 1); const scale = 1 / Math.max(w, h);
    return strokes.map(s => s.map(p => ({ x: (p.x - minX) * scale, y: (p.y - minY) * scale })));
}

function compareGestures(g1, g2) {
    let totalDist = 0, points = 0;
    for(let i=0; i<g1.length; i++) {
        for(let j=0; j<Math.min(g1[i].length, g2[i].length); j+=2) {
             const d = Math.hypot(g1[i][j].x - g2[i][j].x, g1[i][j].y - g2[i][j].y);
             totalDist += d; points++;
        }
    }
    return points === 0 ? Infinity : totalDist / points;
}

function resolveGesture(code) {
    const indicator = document.getElementById('gesture-indicator');
    if(indicator) { indicator.textContent = code; indicator.style.opacity = 1; setTimeout(()=>indicator.style.opacity=0.5, 500); }
    
    // 1. General Actions
    const gen = appSettings.generalActions || [];
    const genMatch = gen.find(a => a.gesture === code);
    if(genMatch) { triggerSystemAction(genMatch.action); return; }

    // 2. Input Mapping
    if(modules.settings) {
        const s = appSettings.runtimeSettings;
        const type = s.currentInput === CONFIG.INPUTS.KEY9 ? 'key9' : s.currentInput === CONFIG.INPUTS.KEY12 ? 'key12' : 'piano';
        const map = modules.settings.getEffectiveMap(type);
        for(const k in map) {
            if(map[k] === code) {
                let val = k.replace(/k9_|k12_|piano_/,'');
                handleInput(val);
                return;
            }
        }
    }
}

// --- GLOBAL & FOOTER ---
function attachGlobalListeners() {
    window.addEventListener('devicemotion', (e) => {
        const acc = e.acceleration;
        if(!acc) return;
        if(Math.hypot(acc.x, acc.y, acc.z) > 15) {
            const now = Date.now();
            if(now - (window.lastShake || 0) > 1000) {
                window.lastShake = now;
                resolveGesture('shake');
            }
        }
    });

    let initialPinchDist = null;
    let initialValue = null;

    document.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDist = Math.sqrt(dx*dx + dy*dy);
            
            if (appSettings.gestureResizeMode === 'font') initialValue = (appSettings.globalFontSize || 100);
            else if (appSettings.gestureResizeMode === 'sequence') initialValue = (appSettings.sequenceSize || 100);
            else initialValue = (appSettings.uiScale || 100); 
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (initialPinchDist && e.touches && e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const currentDist = Math.sqrt(dx*dx + dy*dy);
            const ratio = currentDist / initialPinchDist;
            
            let newVal = initialValue * ratio;
            newVal = Math.min(Math.max(newVal, 50), 300);
            
            if (appSettings.gestureResizeMode === 'font') appSettings.globalFontSize = newVal;
            else if (appSettings.gestureResizeMode === 'sequence') appSettings.sequenceSize = newVal;
            else appSettings.uiScale = newVal;
            
            requestAnimationFrame(renderUI);
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (initialPinchDist && e.touches.length < 2) {
            initialPinchDist = null;
            if(modules.settings) saveSettings();
        }
    });
}

function bindFooterEvents() {
    document.querySelectorAll('.btn-pad-number, .piano-key-white, .piano-key-black').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            vibrate();
            handleInput(newBtn.dataset.value);
        });
        
        newBtn.addEventListener('touchstart', () => newBtn.classList.add('active'), {passive: true});
        newBtn.addEventListener('touchend', () => newBtn.classList.remove('active'));
        newBtn.addEventListener('mousedown', () => newBtn.classList.add('active'));
        newBtn.addEventListener('mouseup', () => newBtn.classList.remove('active'));
        newBtn.addEventListener('mouseleave', () => newBtn.classList.remove('active'));
    });

    document.querySelectorAll('button[data-action]').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        const action = newBtn.dataset.action;

        if (action === 'backspace') {
            setupSpeedDelete(newBtn);
        } else {
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                vibrate();
                if (action === 'open-settings') modules.settings.openSettings();
                else if (action === 'play-demo') playDemo();
                else if (action === 'reset-unique-rounds') triggerSystemAction('act_reset');
                else triggerSystemAction(action);
            });
        }
    });
}

function setupSpeedDelete(btn) {
    const performDelete = () => {
        handleBackspace();
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
    btn.addEventListener('touchcancel', stop);
}

// --- HELPERS ---
function vibrate(ms = 50) {
    if(navigator.vibrate && appSettings.isHapticsEnabled) navigator.vibrate(ms);
}

function speak(text) {
    if (!state.gainNode) initAudio(); 
    if ('speechSynthesis' in window && appSettings.isAudioEnabled) {
        window.speechSynthesis.cancel(); 
        
        const lang = appSettings.generalLanguage || 'en';
        const dict = DICTIONARY[lang] || DICTIONARY['en'];
        let msg = text;
        if(text === "Correct") msg = dict.correct;
        if(text === "Wrong") msg = dict.wrong;
        if(text === "Stealth Active") msg = dict.stealth;

        const utterance = new SpeechSynthesisUtterance(msg.toString());
        const presetId = appSettings.activeVoicePresetId || 'standard';
        const preset = appSettings.voicePresets?.[presetId] || PREMADE_VOICE_PRESETS[presetId] || PREMADE_VOICE_PRESETS['standard'];
        
        if(preset) {
            utterance.pitch = preset.pitch;
            utterance.rate = preset.rate;
            utterance.volume = preset.volume;
        }
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

function saveSettings() {
    try { localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); } catch (e) { console.error("Save failed", e); }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
        if (saved) {
            const parsed = JSON.parse(saved);
            appSettings = { ...appSettings, ...parsed, runtimeSettings: { ...appSettings.runtimeSettings, ...parsed.runtimeSettings } };
            
            if(!appSettings.generalActions) appSettings.generalActions = [
                {gesture: 'shake', action: 'act_toggle_input'},
                {gesture: 'cam_cover', action: 'act_toggle_blackout'}
            ];
            if(!appSettings.customGestures) appSettings.customGestures = [];
            if(!appSettings.profiles) appSettings.profiles = JSON.parse(JSON.stringify(PREMADE_PROFILES));
        }
    } catch (e) { console.error("Load failed", e); }
}

function bindLongPress(el, onClick, onLong) {
    let timer, isLong = false;
    const start = () => { isLong = false; timer = setTimeout(() => { isLong = true; onLong(); }, 600); };
    const end = (e) => { 
        clearTimeout(timer); 
        if(!isLong) { 
             if(e.type !== 'touchend') onClick(); 
             else { e.preventDefault(); onClick(); }
        }
    };
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('touchstart', start, {passive:true});
    el.addEventListener('touchend', end);
}

function handleSensorTrigger(num, source) {
    if(source === 'shake') resolveGesture('shake');
    else if(source === 'camera-cover') resolveGesture('cam_cover');
    else {
        const mode = appSettings.autoInputMode;
        if (mode === 'none') return;
        if (source.startsWith('camera') && mode === 'mic') return;
        if (source === 'audio' && mode === 'cam') return;
        handleInput(num.toString());
    }
}

function initAudio() {
    if (!state.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioContext();
        state.gainNode = state.audioCtx.createGain();
        state.gainNode.connect(state.audioCtx.destination);
    }
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
}

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
 hits a goal. 
        // Based on prompt: "Autoplay doesn't work on unique rounds". 
        // We trigger it if the sequence meets the specific length.
        if (state.userSequence.length >= targetLen && ps.isAutoplayEnabled) {
             setTimeout(() => playDemo(true), 300); 
        } else if (state.sequence.length === state.userSequence.length) {
             // Standard keep-pace logic
             addToSequence();
             renderUI();
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
    // Handle both Standard and Practice arrays
    const targetSeq = appSettings.isPracticeModeEnabled ? state.userSequence : state.userSequence;
    
    if (targetSeq.length > 0) {
        targetSeq.pop();
        // In Unique mode (standard), we might also pop the master sequence to stay in sync
        if(!appSettings.isPracticeModeEnabled && appSettings.runtimeSettings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
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
        stopDemo();
        return;
    }

    state.isPlayingDemo = true;
    document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.textContent = "⏹");

    // Choose which sequence to play
    const seq = appSettings.isPracticeModeEnabled ? state.practiceSequence : state.sequence;
    
    const ps = appSettings.runtimeSettings;
    const speedMs = CONFIG.DEMO_DELAY_BASE_MS / (ps.playbackSpeed || 1.0);
    const startIndex = playOnlyNewItems ? Math.max(0, seq.length - 1) : 0;
    
    // Haptic Pause Calculation
    // We add this to the visual delay to keep them synced
    const hapticPauseMs = (ps.hapticPauseDuration || 0); 

    const playStep = async (i) => {
        if (!state.isPlayingDemo || i >= seq.length) {
            stopDemo();
            return;
        }

        const val = seq[i];
        flashButton(val);

        if (appSettings.isAudioEnabled) speak(val);
        if (appSettings.isHapticMorseEnabled) vibrateMorse(val);

        // Calculate total delay: Speed + (Pause if Haptics enabled)
        const totalDelay = speedMs + (appSettings.isHapticMorseEnabled ? hapticPauseMs : 0);
        timers.demo = setTimeout(() => playStep(i + 1), totalDelay);
    };

    playStep(startIndex);
}

function stopDemo() {
    state.isPlayingDemo = false;
    clearTimeout(timers.demo);
    document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.textContent = "▶");
    renderUI();
}

function flashButton(val) {
    // Visual flash helper
    const boxes = document.querySelectorAll('.number-box');
    boxes.forEach(b => {
        if(b.textContent == val) {
            b.classList.add('scale-110', 'bg-white', 'text-black');
            setTimeout(() => b.classList.remove('scale-110', 'bg-white', 'text-black'), 300);
        }
    });
}

// --- SYSTEM ACTIONS ---
function triggerSystemAction(actionId) {
    if(!actionId) return;
    console.log("System Action:", actionId);
    
    switch(actionId) {
        case 'act_toggle_blackout':
            appSettings.isBlackoutMode = !appSettings.isBlackoutMode;
            renderUI();
            showToast(`Blackout: ${appSettings.isBlackoutMode ? 'ON' : 'OFF'}`);
            break;
        case 'act_toggle_input':
            appSettings.isGestureInputEnabled = !appSettings.isGestureInputEnabled;
            renderUI();
            updateHeaderVisibility();
            showToast(`Gestures: ${appSettings.isGestureInputEnabled ? 'ON' : 'OFF'}`);
            break;
        case 'act_reset':
            if(confirm("Reset Round?")) {
                if(appSettings.runtimeSettings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) resetUniqueRounds();
                else { state.sequence = []; state.userSequence = []; addToSequence(); renderUI(); }
            }
            break;
        case 'act_backspace': handleBackspace(); break;
        case 'act_play': playDemo(); break;
        case 'act_settings': if(modules.settings) modules.settings.openSettings(); break;
        case 'act_redeem': if(modules.settings) modules.settings.toggleRedeem(true); break;
    }
}

// --- GLOBAL LISTENERS (Pinch & Shake) ---
function attachGlobalListeners() {
    // SHAKE DETECTION (DeviceMotion)
    window.addEventListener('devicemotion', (e) => {
        const acc = e.acceleration;
        if(!acc) return;
        if(Math.hypot(acc.x, acc.y, acc.z) > 15) {
            const now = Date.now();
            if(now - (window.lastShake || 0) > 1000) {
                window.lastShake = now;
                // Use the new General Action trigger 'trigger_shake'
                const match = appSettings.generalActions.find(a => a.gesture === 'trigger_shake');
                if(match) triggerSystemAction(match.action);
            }
        }
    });

    // PINCH TO RESIZE
    let initialPinchDist = null;
    let initialValue = null;

    document.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDist = Math.sqrt(dx*dx + dy*dy);
            
            // Determine what we are resizing
            if (appSettings.gestureResizeMode === 'font') initialValue = appSettings.fontSizeMultiplier || 1.0;
            else if (appSettings.gestureResizeMode === 'sequence') initialValue = appSettings.uiScaleMultiplier || 1.0;
            else initialValue = appSettings.globalUiScale || 100; 
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (initialPinchDist && e.touches && e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const currentDist = Math.sqrt(dx*dx + dy*dy);
            
            const ratio = currentDist / initialPinchDist;
            
            if (appSettings.gestureResizeMode === 'font') {
                let newVal = initialValue * ratio;
                newVal = Math.min(Math.max(newVal, 1.0), 2.0); // 100% to 200%
                appSettings.fontSizeMultiplier = newVal;
            } 
            else if (appSettings.gestureResizeMode === 'sequence') {
                let newVal = initialValue * ratio;
                appSettings.uiScaleMultiplier = Math.min(Math.max(newVal, 0.5), 3.0);
            } 
            else {
                // Global UI
                let newVal = initialValue * ratio;
                appSettings.globalUiScale = Math.min(Math.max(newVal, 50), 300);
            }
            
            requestAnimationFrame(renderUI);
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (initialPinchDist && e.touches.length < 2) {
            initialPinchDist = null;
            // Save settings on end
            if(modules.settings) modules.settings.save();
        }
    });
}
// app.js - Part 3 of 3

        if(gestureType) executeGesture(gestureType);
    };

    const executeGesture = (type) => {
        console.log("Detected Gesture:", type);
        
        // 1. Check General System Actions (Overrides)
        const genAction = appSettings.generalActions?.find(a => a.gesture === type);
        if(genAction) { triggerSystemAction(genAction.action); return; }
        
        // 2. Check Input Mappings
        if(modules.settings) {
            const s = appSettings.runtimeSettings;
            const inputType = s.currentInput === CONFIG.INPUTS.KEY9 ? 'key9' : s.currentInput === CONFIG.INPUTS.KEY12 ? 'key12' : 'piano';
            const map = modules.settings.getEffectiveMap(inputType);
            
            // Reverse lookup: Find which key is mapped to this gesture
            for(const [keyId, gestureCode] of Object.entries(map)) {
                if(gestureCode === type) {
                    // Extract value from key ID (e.g. "k9_1" -> "1")
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
        // Clone to remove old listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            vibrate();
            handleInput(newBtn.dataset.value);
        });
        
        // Visual feedback state
        newBtn.addEventListener('touchstart', () => newBtn.classList.add('active'), {passive: true});
        newBtn.addEventListener('touchend', () => newBtn.classList.remove('active'));
        newBtn.addEventListener('mousedown', () => newBtn.classList.add('active'));
        newBtn.addEventListener('mouseup', () => newBtn.classList.remove('active'));
        newBtn.addEventListener('mouseleave', () => newBtn.classList.remove('active'));
    });

    // 2. Control Buttons
    document.querySelectorAll('button[data-action]').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        const action = newBtn.dataset.action;

        if (action === 'backspace') {
            setupSpeedDelete(newBtn);
        } else {
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                vibrate();
                if (action === 'open-settings') modules.settings.openSettings();
                else if (action === 'play-demo') playDemo(); // Direct call instead of system action for simplicity
                else if (action === 'reset-unique-rounds') triggerSystemAction('act_reset');
                else triggerSystemAction(action);
            });
        }
    });
}

function setupSpeedDelete(btn) {
    const performDelete = () => {
        handleBackspace();
        if (navigator.vibrate && appSettings.isHapticsEnabled) navigator.vibrate(10);
    };

    const start = (e) => {
        if(e.type === 'touchstart') e.preventDefault();
        performDelete(); // Delete one immediately
        
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
    btn.addEventListener('touchstart', start); // Passive false implied if e.preventDefault used? No, keep standard.
    // Note: If using preventDefault in start, we don't need {passive:false} here, but good practice.
    
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('mouseleave', stop);
    btn.addEventListener('touchend', stop);
    btn.addEventListener('touchcancel', stop);
    btn.addEventListener('click', (e) => e.preventDefault());
}

// --- FEEDBACK SYSTEMS ---
function flashButton(val) {
    const ps = appSettings.runtimeSettings;
    let btn;
    if (ps.currentInput === CONFIG.INPUTS.PIANO) {
        btn = document.querySelector(`button[data-value="${val}"]`);
    } else {
        // Handle 9-key vs 12-key containers
        const containerId = ps.currentInput === CONFIG.INPUTS.KEY12 ? 'pad-key12' : 'pad-key9';
        btn = document.querySelector(`#${containerId} button[data-value="${val}"]`);
    }
    
    if (btn) {
        btn.classList.add('flash-active');
        setTimeout(() => btn.classList.remove('flash-active'), 200);
    }
}

function speak(text) {
    if (!state.gainNode) initAudio(); 
    if ('speechSynthesis' in window && appSettings.isAudioEnabled) {
        window.speechSynthesis.cancel(); 
        
        // Dictionary Lookup
        const lang = appSettings.generalLanguage || 'en';
        const dict = DICTIONARY[lang] || DICTIONARY['en'];
        let msg = text;
        if(text === "Correct") msg = dict.correct;
        if(text === "Wrong") msg = dict.wrong;
        if(text === "Stealth Active") msg = dict.stealth;

        const utterance = new SpeechSynthesisUtterance(msg.toString());
        const presetId = appSettings.activeVoicePresetId || 'standard';
        const preset = appSettings.voicePresets?.[presetId] || PREMADE_VOICE_PRESETS[presetId] || PREMADE_VOICE_PRESETS['standard'];
        
        if(preset) {
            utterance.pitch = preset.pitch;
            utterance.rate = preset.rate;
            utterance.volume = preset.volume;
        }
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
    
    // Handle number strings
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
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    
    // Localize common messages
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
            
            // Ensure data integrity for new features
            if(!appSettings.generalActions) appSettings.generalActions = [
                {gesture: 'trigger_shake', action: 'act_toggle_input'},
                {gesture: 'trigger_cam_cover', action: 'act_toggle_blackout'}
            ];
            if(!appSettings.customGestures) appSettings.customGestures = {};
            if(!appSettings.profiles) appSettings.profiles = JSON.parse(JSON.stringify(PREMADE_PROFILES));
        }
    } catch (e) { console.error("Load failed", e); }
}

// --- SENSOR HANDLER (Bridge to App Logic) ---
function handleSensorTrigger(num, source) {
    // 1. System Triggers
    if(source === 'shake') {
        const genAction = appSettings.generalActions?.find(a => a.gesture === 'trigger_shake');
        if(genAction) triggerSystemAction(genAction.action);
        return;
    }
    if(source === 'camera-cover') { 
         const genAction = appSettings.generalActions?.find(a => a.gesture === 'trigger_cam_cover');
         if(genAction) triggerSystemAction(genAction.action);
         return;
    }

    // 2. Auto Input Mode
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

function initSpeechRecognition() {} // Placeholder for future expansion

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

// Expose state for debugging
window.appState = state;
