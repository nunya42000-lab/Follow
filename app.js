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
const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v46', STORAGE_KEY_STATE: 'followMeAppState_v46', INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } };

const DEFAULT_PROFILE_SETTINGS = { currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, simonChunkSize: 3, simonInterSequenceDelay: 400 };
const PREMADE_PROFILES = { 'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 400 }, theme: 'default' }, 'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }};

// Updated DEFAULT_APP with new Timer/Counter toggles
const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: true, isHapticsEnabled: true, 
    isSpeedDeletingEnabled: true, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', 
    showTimer: false, showCounter: false, // NEW DEFAULTS
    activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), 
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), 
    isPracticeModeEnabled: false, voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, 
    selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', generalLanguage: 'en', 
    isGestureInputEnabled: false, gestureMappings: {} 
};

const DICTIONARY = {
    'en': { correct: "Correct", wrong: "Wrong", stealth: "Stealth Active", reset: "Reset to Round 1", stop: "Playback Stopped 🛑" },
    'es': { correct: "Correcto", wrong: "Incorrecto", stealth: "Modo Sigilo", reset: "Reiniciar Ronda 1", stop: "Detenido 🛑" }
};

let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null };
let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null, stealth: null, stealthAction: null, playback: null, tap: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };
let blackoutState = { isActive: false, lastShake: 0 }; 
let gestureInputState = { startX: 0, startY: 0, startTime: 0, maxTouches: 0, isTapCandidate: false, tapCount: 0 };
let isDeleting = false; 
let isDemoPlaying = false; 
let practiceSequence = [];
let practiceInputIndex = 0;
let ignoreNextClick = false;

const getProfileSettings = () => appSettings.runtimeSettings;
const getState = () => appState['current_session'] || (appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 });
function saveState() { localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState)); }

function loadState() { 
    try { 
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS); 
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE); 
        if(s) { 
            const loaded = JSON.parse(s); 
            appSettings = { ...DEFAULT_APP, ...loaded, profiles: { ...DEFAULT_APP.profiles, ...(loaded.profiles || {}) }, customThemes: { ...DEFAULT_APP.customThemes, ...(loaded.customThemes || {}) } }; 
            
            if (typeof appSettings.isHapticsEnabled === 'undefined') appSettings.isHapticsEnabled = true;
            if (typeof appSettings.isSpeedDeletingEnabled === 'undefined') appSettings.isSpeedDeletingEnabled = true;
            if (typeof appSettings.isLongPressAutoplayEnabled === 'undefined') appSettings.isLongPressAutoplayEnabled = true;
            if (typeof appSettings.isUniqueRoundsAutoClearEnabled === 'undefined') appSettings.isUniqueRoundsAutoClearEnabled = true; 
            
            // Ensure new toggles exist in loaded state
            if (typeof appSettings.showTimer === 'undefined') appSettings.showTimer = false;
            if (typeof appSettings.showCounter === 'undefined') appSettings.showCounter = false;

            if (!appSettings.voicePresets) appSettings.voicePresets = {};
            if (!appSettings.activeVoicePresetId) appSettings.activeVoicePresetId = 'standard';
            if (!appSettings.generalLanguage) appSettings.generalLanguage = 'en';
            if (!appSettings.gestureResizeMode) appSettings.gestureResizeMode = 'global';

            if(!appSettings.runtimeSettings) appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId]?.settings || DEFAULT_PROFILE_SETTINGS)); 
            if(appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
        } else { 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles['profile_1'].settings)); 
        } 
        if(st) appState = JSON.parse(st); 
        if(!appState['current_session']) appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
        
        appState['current_session'].currentRound = parseInt(appState['current_session'].currentRound) || 1;
        
    } catch(e) { 
        console.error("Load failed", e); 
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP)); 
        saveState(); 
    } 
}

function vibrate() { if(appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10); }

function vibrateMorse(val) { 
    if(!navigator.vibrate || !appSettings.isHapticMorseEnabled) return; 
    let num = parseInt(val);
    if(isNaN(num)) {
        const map = { 'A':6, 'B':7, 'C':8, 'D':9, 'E':10, 'F':11, 'G':12 };
        num = map[val.toUpperCase()] || 0;
    }
    const speed = appSettings.playbackSpeed || 1.0; 
    const factor = 1.0 / speed; 
    const DOT = 100 * factor, DASH = 300 * factor, GAP = 100 * factor; 
    let pattern = []; 
    if (num >= 1 && num <= 3) { for(let i=0; i<num; i++) { pattern.push(DOT); pattern.push(GAP); } } 
    else if (num >= 4 && num <= 6) { pattern.push(DASH); pattern.push(GAP); for(let i=0; i<(num-3); i++) { pattern.push(DOT); pattern.push(GAP); } } 
    else if (num >= 7 && num <= 9) { pattern.push(DASH); pattern.push(GAP); pattern.push(DASH); pattern.push(GAP); for(let i=0; i<(num-6); i++) { pattern.push(DOT); pattern.push(GAP); } } 
    else if (num >= 10 && num <= 12) { pattern.push(DASH); pattern.push(GAP); pattern.push(DASH); pattern.push(GAP); pattern.push(DASH); pattern.push(GAP); for(let i=0; i<(num-10); i++) { pattern.push(DOT); pattern.push(GAP); } } 
    if(pattern.length > 0) navigator.vibrate(pattern); 
}

function initGesturePad() {
    const pad = document.getElementById('gesture-pad');
    const indicator = document.getElementById('gesture-indicator');
    if(!pad) return;
    let touchState = { timers: {}, points: [], lastTapTime: 0, tapCount: 0, lastTapFingers: 0, startTime:0, maxTouches:0 };
    const resetTouch = () => { touchState.points = []; clearTimeout(touchState.timers.long); touchState.startTime = 0; touchState.maxTouches = 0; };
    const getDir = (dx, dy) => {
        const ax = Math.abs(dx), ay = Math.abs(dy);
        if(ax < 20 && ay < 20) return 'tap';
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if(angle >= -22 && angle < 22) return 'swipe_right';
        if(angle >= 22 && angle < 68) return 'swipe_ne';
        if(angle >= 68 && angle < 112) return 'swipe_up';
        if(angle >= 112 && angle < 158) return 'swipe_nw';
        if(angle >= 158 || angle < -158) return 'swipe_left';
        if(angle >= -158 && angle < -112) return 'swipe_sw';
        if(angle >= -112 && angle < -68) return 'swipe_down';
        if(angle >= -68 && angle < -22) return 'swipe_se';
        return 'swipe';
    };

    pad.addEventListener('touchstart', (ev) => {
        ev.preventDefault();
        const t = ev.touches;
        touchState.points = [{ x: t[0].clientX, y: t[0].clientY }];
        touchState.startTime = Date.now();
        touchState.maxTouches = t.length;
        touchState.timers.long = setTimeout(() => {
            const kind = `long_tap${touchState.maxTouches === 2 ? '_2f' : touchState.maxTouches === 3 ? '_3f' : ''}`;
            handleGesture(kind);
        }, 500);
    }, {passive:false});

    pad.addEventListener('touchmove', (ev) => {
        ev.preventDefault();
        if(ev.touches && ev.touches.length) {
            const t = ev.touches[0];
            touchState.points.push({ x: t.clientX, y: t.clientY });
        }
    }, {passive:false});

    pad.addEventListener('touchend', (ev) => {
        ev.preventDefault();
        clearTimeout(touchState.timers.long);
        const duration = Date.now() - (touchState.startTime || 0);
        const touches = touchState.maxTouches || 1;
        const p0 = touchState.points[0] || { x:0, y:0 };
        const pN = touchState.points[touchState.points.length-1] || p0;
        const dx = pN.x - p0.x;
        const dy = pN.y - p0.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < 20) {
            const now = Date.now();
            if(now - touchState.lastTapTime < 350 && touchState.lastTapFingers === touches) {
                touchState.tapCount = (touchState.tapCount || 1) + 1;
            } else {
                touchState.tapCount = 1;
            }
            touchState.lastTapTime = now;
            touchState.lastTapFingers = touches;

            const kind = (touchState.tapCount === 1) ? `tap${touches===2? '_2f' : touches===3? '_3f' : ''}` :
                          (touchState.tapCount === 2) ? `double_tap${touches===2? '_2f' : touches===3? '_3f' : ''}` :
                          `tap${touches===2? '_2f' : touches===3? '_3f' : ''}`;
            handleGesture(kind);
        } else {
            const dir = getDir(dx, dy);
            const suf = touches===2? '_2f' : touches===3? '_3f' : '';
            handleGesture(dir + suf);
        }
        resetTouch();
    }, {passive:false});

    function handleGesture(kind) {
        if(indicator) {
            indicator.textContent = `Gesture: ${kind}`;
            setTimeout(()=>indicator.textContent = 'Use gestures here — swipes, taps, multi-finger.', 700);
        }
        const settings = getProfileSettings();
        const mapResult = mapGestureToValue(kind, settings.currentInput);
        if(mapResult !== null) addValue(mapResult);
    }
}

function mapGestureToValue(kind, currentInput) {
    const gm = appSettings.gestureMappings || {};
    if(currentInput === CONFIG.INPUTS.PIANO) {
        for(const k in gm) {
            if(k.startsWith('piano_') && gm[k].gesture === kind) {
                const id = k.replace('piano_','');
                return id;
            }
        }
    }
    for(let i=1;i<=12;i++){ const k12 = 'k12_' + i; if(gm[k12] && gm[k12].gesture === kind) return i; }
    for(let i=1;i<=9;i++){ const k9 = 'k9_' + i; if(gm[k9] && gm[k9].gesture === kind) return i; }
    return null;
}

function speak(text) { 
    if(!appSettings.isAudioEnabled || !window.speechSynthesis) return; 
    window.speechSynthesis.cancel(); 
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    let msg = text;
    if(text === "Correct") msg = dict.correct;
    if(text === "Wrong") msg = dict.wrong;
    if(text === "Stealth Active") msg = dict.stealth;
    const u = new SpeechSynthesisUtterance(msg); 
    if(lang === 'es') u.lang = 'es-MX'; else u.lang = 'en-US';
    if(appSettings.selectedVoice){
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(voice => voice.name === appSettings.selectedVoice);
        if(v) u.voice = v;
    } 
    let p = appSettings.voicePitch || 1.0; 
    let r = appSettings.voiceRate || 1.0; 
    u.volume = appSettings.voiceVolume || 1.0; 
    u.pitch = Math.min(2, Math.max(0.1, p));
    u.rate = Math.min(10, Math.max(0.1, r));
    window.speechSynthesis.speak(u); 
}

function showToast(msg) { 
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    if(msg === "Reset to Round 1") msg = dict.reset;
    if(msg === "Playback Stopped 🛑") msg = dict.stop;
    if(msg === "Stealth Active") msg = dict.stealth;
    const t = document.getElementById('toast-notification'); 
    const m = document.getElementById('toast-message'); 
    if(!t || !m) return; 
    m.textContent = msg; 
    t.classList.remove('opacity-0', '-translate-y-10'); 
    setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000); 
}

function applyTheme(themeKey) { const body = document.body; body.className = body.className.replace(/theme-\w+/g, ''); let t = appSettings.customThemes[themeKey]; if (!t && PREMADE_THEMES[themeKey]) t = PREMADE_THEMES[themeKey]; if (!t) t = PREMADE_THEMES['default']; body.style.setProperty('--primary', t.bubble); body.style.setProperty('--bg-main', t.bgMain); body.style.setProperty('--bg-modal', t.bgCard); body.style.setProperty('--card-bg', t.bgCard); body.style.setProperty('--seq-bubble', t.bubble); body.style.setProperty('--btn-bg', t.btn); body.style.setProperty('--bg-input', t.bgMain); body.style.setProperty('--text-main', t.text); const isDark = parseInt(t.bgCard.replace('#',''), 16) < 0xffffff / 2; body.style.setProperty('--border', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'); }
function updateAllChrome() { applyTheme(appSettings.activeTheme); document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`; renderUI(); }

function startPracticeRound() {
    const settingsModal = document.getElementById('settings-modal');
    if(settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    const state = getState(); 
    const settings = getProfileSettings(); 
    const max = (settings.currentInput === 'key12') ? 12 : 9;
    const getRand = () => { 
        if(settings.currentInput === 'piano') { 
            const keys = ['C','D','E','F','G','A','B','1','2','3','4','5']; 
            return keys[Math.floor(Math.random()*keys.length)]; 
        } 
        return Math.floor(Math.random() * max) + 1; 
    };
    if(practiceSequence.length === 0) state.currentRound = 1;
    if(settings.currentMode === CONFIG.MODES.SIMON) {
        practiceSequence.push(getRand());
        state.currentRound = practiceSequence.length;
    } else {
        practiceSequence = []; 
        const len = state.currentRound; 
        for(let i=0; i<len; i++) practiceSequence.push(getRand());
    }
    practiceInputIndex = 0; 
    renderUI(); 
    showToast(`Practice Round ${state.currentRound}`); 
    setTimeout(() => playPracticeSequence(), 1000);
}

function playPracticeSequence() {
    const settingsModal = document.getElementById('settings-modal');
    if(settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    disableInput(true); 
    let i = 0; 
    const speed = appSettings.playbackSpeed || 1.0;
    function next() {
        if(i >= practiceSequence.length) { disableInput(false); return; }
        const val = practiceSequence[i]; 
        const settings = getProfileSettings(); 
        const key = document.querySelector(`#pad-${settings.currentInput} button[data-value=\"${val}\"]`);
        if(key) { key.classList.add('flash-active'); setTimeout(() => key.classList.remove('flash-active'), 250 / speed); }
        speak(val); 
        i++; 
        setTimeout(next, 800 / speed);
    } 
    next();
}

function addValue(value) {
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings();
    
    if(appSettings.isPracticeModeEnabled) {
        if(practiceSequence.length === 0) return; 
        if(value == practiceSequence[practiceInputIndex]) { 
            practiceInputIndex++; 
            if(practiceInputIndex >= practiceSequence.length) { 
                speak("Correct"); 
                state.currentRound++; 
                setTimeout(startPracticeRound, 1500); 
            } 
        } else { 
            speak("Wrong"); 
            navigator.vibrate(500); 
            setTimeout(() => playPracticeSequence(), 1500); 
        } 
        return;
    }
    
    let targetIndex = 0; 
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    const roundNum = parseInt(state.currentRound) || 1;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    let limit;
    if (isUnique) { limit = appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength; } else { limit = settings.sequenceLength; }
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
        if (isUnique && appSettings.isUniqueRoundsAutoClearEnabled) { showToast("Round Full - Reset? 🛑"); vibrate(); }
        return;
    }

    if(!state.sequences[targetIndex]) state.sequences[targetIndex] = [];
    state.sequences[targetIndex].push(value); 
    state.nextSequenceIndex++; 
    renderUI(); 
    saveState();
    
    if(appSettings.isAutoplayEnabled) {
        if (settings.currentMode === CONFIG.MODES.SIMON) { 
            const justFilled = (state.nextSequenceIndex - 1) % settings.machineCount; 
            if(justFilled === settings.machineCount - 1) setTimeout(playDemo, 250); 
        } else { 
            if (appSettings.isUniqueRoundsAutoClearEnabled) {
                if(state.sequences[0].length >= roundNum) { disableInput(true); setTimeout(playDemo, 250); } 
            } else { setTimeout(playDemo, 250); }
        }
    }
}

function renderUI() {
    const container = document.getElementById('sequence-container'); 
    try {
        const gpWrap = document.getElementById('gesture-pad-wrapper');
        if (gpWrap) {
            if (appSettings.isGestureInputEnabled) {
                gpWrap.classList.remove('hidden');
                if (!window.__gesturePadInited) { initGesturePad(); window.__gesturePadInited = true; }
            } else { gpWrap.classList.add('hidden'); }
        }
    } catch(e) { console.error('Gesture UI error', e); }

    container.innerHTML = ''; 
    const settings = getProfileSettings();
    const state = getState();

    ['key9', 'key12', 'piano'].forEach(k => { 
        const el = document.getElementById(`pad-${k}`); 
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none'; 
    });

    if(appSettings.isPracticeModeEnabled) {
        if(practiceSequence.length === 0) { practiceSequence = []; state.currentRound = 1; setTimeout(startPracticeRound, 100); }
        container.innerHTML = `<h2 class=\"text-2xl font-bold text-center w-full mt-10\" style=\"color:var(--text-main)\">Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span></h2>`; 
        return;
    }

    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const roundNum = parseInt(state.currentRound) || 1;
        const header = document.createElement('h2');
        header.className = "text-xl font-bold text-center w-full mb-4 opacity-80";
        header.style.color = "var(--text-main)";
        header.innerHTML = `Unique Mode: <span class=\"text-primary-app\">Round ${roundNum}</span>`;
        container.appendChild(header);
    }

    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4); 
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    
    activeSeqs.forEach((seq) => { 
        const card = document.createElement('div'); card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)]"; 
        const numGrid = document.createElement('div'); 
        if (settings.machineCount > 1) { numGrid.className = "grid grid-cols-4 gap-2 justify-items-center"; } else { numGrid.className = "flex flex-wrap gap-2 justify-center"; }
        (seq || []).forEach(num => { const span = document.createElement('span'); span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold"; const scale = appSettings.uiScaleMultiplier || 1.0; span.style.width = (40 * scale) + 'px'; span.style.height = (40 * scale) + 'px'; span.style.fontSize = (1.2 * scale) + 'rem'; span.textContent = num; numGrid.appendChild(span); }); 
        card.appendChild(numGrid); container.appendChild(card); 
    });
    
    // UPDATED: VISUAL FEEDBACK FOR HEADER BUTTONS
    const hMic = document.getElementById('header-mic-btn');
    const hCam = document.getElementById('header-cam-btn');
    
    // Note: Visibility (hidden vs block) is handled by SettingsManager.updateHeaderVisibility()
    // Here we handle the ACTIVE state styling (e.g. green when on)
    if(hMic) {
        hMic.classList.toggle('header-btn-active', modules.sensor && modules.sensor.mode.audio);
    }
    if(hCam) {
        hCam.classList.toggle('header-btn-active', modules.sensor && modules.sensor.mode.camera);
    }

    document.querySelectorAll('.reset-button').forEach(b => { b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none'; });
}
    // UPDATED: Bind new Header Button Listeners
    const headerTimer = document.getElementById('header-timer-btn');
    const headerCounter = document.getElementById('header-counter-btn');
    const headerMic = document.getElementById('header-mic-btn');
    const headerCam = document.getElementById('header-cam-btn');

    if(headerTimer) {
        headerTimer.onclick = () => {
             // Future Logic for Timer
             showToast("Timer feature coming soon! ⏱️");
        };
    }
    if(headerCounter) {
        headerCounter.onclick = () => {
             // Future Logic for Counter
             showToast("Counter feature coming soon! #");
        };
    }
    if(headerMic) {
        headerMic.onclick = () => {
            if(!modules.sensor) return;
            modules.sensor.toggleAudio();
            renderUI(); // Update active state
            const isActive = modules.sensor.mode.audio;
            showToast(isActive ? "Mic Input ON 🎤" : "Mic Input OFF 🔇");
        };
    }
    if(headerCam) {
        headerCam.onclick = () => {
            if(!modules.sensor) return;
            modules.sensor.toggleCamera();
            renderUI(); // Update active state
            const isActive = modules.sensor.mode.camera;
            showToast(isActive ? "Camera Input ON 📷" : "Camera Input OFF 🚫");
        };
    }
}

function disableInput(disabled) {
    const footer = document.getElementById('input-footer');
    if(!footer) return;
    if(disabled) { footer.classList.add('opacity-50', 'pointer-events-none'); } 
    else { footer.classList.remove('opacity-50', 'pointer-events-none'); }
}

function playDemo() {
    if(isDemoPlaying) return;
    isDemoPlaying = true;
    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    
    // Determine active sequences based on mode
    let seqsToPlay = [];
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        // Unique Mode: Just play the one active sequence
        seqsToPlay = [state.sequences[0]];
    } else {
        // Simon Mode: Play all active machine sequences
        seqsToPlay = state.sequences.slice(0, settings.machineCount);
    }
    
    // Chunking Logic
    const chunkSize = settings.simonChunkSize || 3;
    let chunks = [];
    let maxLen = 0;
    seqsToPlay.forEach(s => { if(s.length > maxLen) maxLen = s.length; });
    
    // Build interleaved playback list
    // e.g. M1(1-3), M2(1-3) ... then M1(4-6), M2(4-6)
    for(let i=0; i<maxLen; i+=chunkSize) {
        for(let m=0; m<seqsToPlay.length; m++) {
            const seq = seqsToPlay[m];
            if(i < seq.length) {
                const slice = seq.slice(i, i+chunkSize);
                chunks.push({ 
                    machine: m, 
                    nums: slice, 
                    isNewRound: (m===0 && i===0 && chunks.length===0) // Flag start
                });
            }
        }
    }

    let cIdx = 0;
    function nextChunk() {
        if(cIdx >= chunks.length) { 
            isDemoPlaying = false; 
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
               // Auto-advance logic for Unique Mode
               setTimeout(() => {
                   state.currentRound++;
                   state.sequences[0] = [];
                   state.nextSequenceIndex = 0;
                   renderUI();
                   showToast(`Round ${state.currentRound}`);
                   saveState();
                   disableInput(false);
               }, 500);
            }
            return; 
        }

        const chunk = chunks[cIdx];
        const machineDelay = (settings.simonInterSequenceDelay) || 0;
        
        // Speak/Play the chunk
        let nIdx = 0;
        function playNum() {
            if(nIdx >= chunk.nums.length) {
                cIdx++;
                setTimeout(nextChunk, machineDelay);
                return;
            }
            const val = chunk.nums[nIdx];
            
            // Visual Flash
            const kVal = val; 
            const padId = `pad-${settings.currentInput}`;
            const btn = document.querySelector(`#${padId} button[data-value="${kVal}"]`);
            if(btn) {
                btn.classList.add('flash-active');
                setTimeout(() => btn.classList.remove('flash-active'), 250/speed);
            }
            
            speak(val);
            if(appSettings.isHapticMorseEnabled) vibrateMorse(val);
            
            nIdx++;
            setTimeout(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}

function handleBackspace(e) { 
    if(e) { e.preventDefault(); e.stopPropagation(); } 
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings(); 
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
         if(state.sequences[0].length > 0) { state.sequences[0].pop(); state.nextSequenceIndex--; }
    } else {
        // Simon Logic: Remove last entered across all machines
        // We find the last modified machine sequence
        let target = (state.nextSequenceIndex - 1) % settings.machineCount;
        if (target < 0) target = settings.machineCount - 1; 
        
        if(state.sequences[target] && state.sequences[target].length > 0) {
             state.sequences[target].pop();
             state.nextSequenceIndex--;
        }
    }
    renderUI(); 
    saveState(); 
}

const startApp = () => {
    loadState();
    
    // Init Settings Manager
    modules.settings = new SettingsManager(appSettings, {
        onSave: saveState,
        onUpdate: (type) => { 
            if(type === 'mode_switch') {
                const s = getState();
                s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []);
                s.nextSequenceIndex = 0;
                s.currentRound = 1;
                renderUI();
            } else {
                updateAllChrome(); 
            }
        },
        onReset: () => { 
            localStorage.clear(); 
            location.reload(); 
        },
        onProfileSwitch: (id) => { 
            appSettings.activeProfileId = id; 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); 
            if(appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
            saveState(); 
            const s = getState(); s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); s.nextSequenceIndex = 0; s.currentRound = 1;
            renderUI(); 
        },
        onProfileAdd: (name) => { 
            const id = 'p_' + Date.now(); 
            appSettings.profiles[id] = { name, settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }; 
            appSettings.activeProfileId = id; 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); 
            saveState(); 
            renderUI(); 
        },
        onProfileRename: (name) => { 
            if(appSettings.profiles[appSettings.activeProfileId]) { 
                appSettings.profiles[appSettings.activeProfileId].name = name; 
                saveState(); 
            } 
        },
        onProfileDelete: () => { 
            if(Object.keys(appSettings.profiles).length > 1) { 
                delete appSettings.profiles[appSettings.activeProfileId]; 
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0]; 
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings)); 
                saveState(); 
                renderUI(); 
            } else { alert("Must keep one profile."); } 
        },
        onProfileSave: () => { 
            if(appSettings.profiles[appSettings.activeProfileId]) { 
                appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings)); 
                saveState(); 
                alert("Profile Saved!"); 
            } 
        }
    }, null); // Sensor engine added later

    // Init Sensor Engine
    modules.sensor = new SensorEngine(
        (val, source) => { 
             // Trigger callback
             // source is 'camera' or 'camera-white' or 'audio'
             addValue(val); 
             const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
             if(btn) { btn.classList.add('flash-active'); setTimeout(() => btn.classList.remove('flash-active'), 200); }
        },
        (status) => {
            // Status update (reserved for debug)
        }
    );
    modules.settings.sensorEngine = modules.sensor;

    // Apply initial state
    updateAllChrome();
    
    // Init Comments
    initComments(db);

    // Initial Header Visibility Check
    modules.settings.updateHeaderVisibility();

    // Init Global Listeners
    initGlobalListeners();
    
    // Restore sensor state if previously active
    if (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleAudio(true);
    }
    if (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleCamera(true);
    }
    
    renderUI();
};

function initGlobalListeners() {
    try {
        // --- INPUT PAD LISTENERS ---
        document.querySelectorAll('.btn-pad-number').forEach(b => {
            const press = (e) => { 
                if(e) { e.preventDefault(); e.stopPropagation(); } 
                if(ignoreNextClick) return; 
                addValue(b.dataset.value); 
                b.classList.add('flash-active'); 
                setTimeout(() => b.classList.remove('flash-active'), 150); 
            };
            b.addEventListener('mousedown', press); 
            b.addEventListener('touchstart', press, { passive: false }); 
            
            // Stealth Mode Logic
            b.addEventListener('touchstart', (e) => {
                if(b.dataset.value === '1' && appSettings.isStealth1KeyEnabled) {
                    timers.stealth = setTimeout(() => {
                        document.body.classList.toggle('hide-controls');
                        showToast("Stealth Toggle");
                        ignoreNextClick = true;
                        setTimeout(() => ignoreNextClick = false, 500);
                    }, 1000);
                }
            }, {passive:true});
            b.addEventListener('touchend', () => clearTimeout(timers.stealth));
        });

        // --- CONTROL BUTTONS ---
        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
            const start = (e) => { if(e) { e.preventDefault(); e.stopPropagation(); } if(isDemoPlaying) { isDemoPlaying = false; showToast("Playback Stopped 🛑"); return; } playDemo(); };
            const longStart = () => { timers.longPress = setTimeout(() => { appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled; modules.settings.updateUIFromSettings(); showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`); ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500); }, 800); };
            const longEnd = () => { clearTimeout(timers.longPress); };
            b.addEventListener('mousedown', start); b.addEventListener('touchstart', start, { passive: false }); 
            if (appSettings.isLongPressAutoplayEnabled) {
                b.addEventListener('mousedown', longStart); b.addEventListener('touchstart', longStart, { passive: true }); b.addEventListener('mouseup', longEnd); b.addEventListener('mouseleave', longEnd); b.addEventListener('touchend', longEnd);
            }
        });
        
        document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => {
            b.addEventListener('click', () => {
                if(confirm("Reset Round Counter to 1?")) {
                    const s = getState();
                    s.currentRound = 1;
                    s.sequences[0] = [];
                    s.nextSequenceIndex = 0;
                    renderUI();
                    saveState();
                    showToast("Reset to Round 1");
                }
            });
        });

        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
            b.addEventListener('click', () => modules.settings.openSettings());
            // Long press for ATM/Redeem
            const start = () => { timers.settingsLongPress = setTimeout(() => { modules.settings.toggleRedeem(true); ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500); }, 1000); };
            const end = () => clearTimeout(timers.settingsLongPress);
            b.addEventListener('touchstart', start, {passive:true}); b.addEventListener('touchend', end); b.addEventListener('mousedown', start); b.addEventListener('mouseup', end);
        });

        // Backspace with Speed Delete
        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            const startDelete = (e) => { 
                if(e) { e.preventDefault(); e.stopPropagation(); } 
                handleBackspace(null); 
                if(!appSettings.isSpeedDeletingEnabled) return; 
                isDeleting = false; 
                timers.initialDelay = setTimeout(() => { 
                    isDeleting = true; 
                    timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); 
                }, CONFIG.SPEED_DELETE_DELAY); 
            }; 
            const stopDelete = () => { 
                clearTimeout(timers.initialDelay); 
                clearInterval(timers.speedDelete); 
                setTimeout(() => isDeleting = false, 50); 
            }; 
            b.addEventListener('mousedown', startDelete); b.addEventListener('touchstart', startDelete, { passive: false }); b.addEventListener('mouseup', stopDelete); b.addEventListener('mouseleave', stopDelete); b.addEventListener('touchend', stopDelete); b.addEventListener('touchcancel', stopDelete); 
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            if(appSettings.isPracticeModeEnabled) {
                setTimeout(startPracticeRound, 500);
            }
        });

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
        
        // --- BLACKOUT MODE LISTENERS ---
        // (Shake to toggle blackout)
        let lastX=0, lastY=0, lastZ=0;
        window.addEventListener('devicemotion', (e) => {
            if(!appSettings.isBlackoutFeatureEnabled) return;
            const acc = e.accelerationIncludingGravity;
            if(!acc) return;
            const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
            if(delta > 25) { // Shake threshold
                const now = Date.now();
                if(now - blackoutState.lastShake > 1000) {
                    blackoutState.isActive = !blackoutState.isActive;
                    document.body.classList.toggle('blackout-active', blackoutState.isActive);
                    if(blackoutState.isActive) {
                        // Enter Blackout
                        if (appSettings.isBlackoutGesturesEnabled) {
                            showToast("Blackout: Gestures Active 👆");
                        } else {
                            showToast("Blackout Mode Active 🌑");
                        }
                    }
                    blackoutState.lastShake = now;
                }
            }
            lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        });
        
        // Allow tap on blackout layer to exit if user panics (optional, but good UX)
        // Double tap on top-left corner to exit manually without shake
        const bl = document.getElementById('blackout-layer');
        if(bl) {
             let taps = 0;
             bl.addEventListener('touchstart', (e) => {
                 // Pass through gestures if enabled
                 if(appSettings.isBlackoutGesturesEnabled) {
                     // Pass to gesture handler logic (simulated by overlay transparency or event forwarding)
                     // Since blackout layer is on top, we handle gestures here directly if needed
                     // But for now, we rely on the shake.
                     // We can implement full screen gesture capture here later.
                 }
                 taps++;
                 if(taps > 4) {
                     blackoutState.isActive = false;
                     document.body.classList.remove('blackout-active');
                     taps = 0;
                 }
                 setTimeout(()=>taps=0, 1000);
             });
        }

    } catch (error) { console.error("CRITICAL ERROR:", error); alert("App crashed: " + error.message); }
}

// Start
document.addEventListener('DOMContentLoaded', startApp);
