import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS } from './settings.js';
import { initComments } from './comments.js';

const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CONFIG ---
const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v47', STORAGE_KEY_STATE: 'followMeAppState_v48', INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } };

// UPDATED DEFAULTS: Chunk=40 (Full), Delay=0
const DEFAULT_PROFILE_SETTINGS = { currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, simonChunkSize: 40, simonInterSequenceDelay: 0 };
const PREMADE_PROFILES = { 'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 40, simonInterSequenceDelay: 0 }, theme: 'default' }, 'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }};
// UPDATED DEFAULTS: Flash=True, Audio=False, PlaybackSpeed=1.0
const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, 
    isAudioEnabled: false, 
    isHapticsEnabled: true, 
    isFlashEnabled: true,  
    pauseSetting: 'none',
    isSpeedDeletingEnabled: true, 
    isSpeedGesturesEnabled: false, 
    isVolumeGesturesEnabled: false,
    isArModeEnabled: false, 
    isVoiceInputEnabled: false, 
    
    // --- NEW TOGGLES ---
    isDeleteGestureEnabled: false, 
    isClearGestureEnabled: false,
    isAutoTimerEnabled: false,
    isAutoCounterEnabled: false,
    // -------------------

    isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', 
    showTimer: false, showCounter: false,
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
let isPlaybackPaused = false;
let playbackResumeCallback = null;
let practiceSequence = [];
let practiceInputIndex = 0;
let ignoreNextClick = false;
let voiceModule = null

// New flag for Shake Toggle
let isGesturePadVisible = true;

// --- NEW GLOBALS FOR AUTO-LOGIC ---
let simpleTimer = { interval: null, startTime: 0, elapsed: 0, isRunning: false };
let simpleCounter = 0;
let globalTimerActions = { start: null, stop: null, reset: null };
let globalCounterActions = { increment: null, reset: null };

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

    let state = {
        startX: 0, startY: 0, startTime: 0, maxTouches: 0,
        isLongPressTriggered: false, longPressTimer: null,
        tapCount: 0, tapTimer: null, lastTapFingers: 0
    };

    const get8WayDirection = (dx, dy) => {
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle > -22.5 && angle <= 22.5) return 'swipe_right';
        if (angle > 22.5 && angle <= 67.5) return 'swipe_se';
        if (angle > 67.5 && angle <= 112.5) return 'swipe_down';
        if (angle > 112.5 && angle <= 157.5) return 'swipe_sw';
        if (angle > 157.5 || angle <= -157.5) return 'swipe_left';
        if (angle > -157.5 && angle <= -112.5) return 'swipe_nw';
        if (angle > -112.5 && angle <= -67.5) return 'swipe_up';
        if (angle > -67.5 && angle <= -22.5) return 'swipe_ne';
        return 'swipe_right';
    };

    const getFingerSuffix = (n) => (n >= 3 ? '_3f' : n === 2 ? '_2f' : '');

    pad.addEventListener('touchstart', (ev) => {
        ev.preventDefault();
        const t = ev.touches;
        if(t.length === 0) return;

        if (!state.startTime || (Date.now() - state.startTime > 300 && state.tapCount === 0)) {
            state.startX = t[0].clientX;
            state.startY = t[0].clientY;
            state.startTime = Date.now();
            state.maxTouches = t.length;
            state.isLongPressTriggered = false;
            
            clearTimeout(state.longPressTimer);
            state.longPressTimer = setTimeout(() => {
                state.isLongPressTriggered = true;
                const suffix = getFingerSuffix(state.maxTouches);
                handleGesture(`long_tap${suffix}`);
            }, 600);
        } else {
            state.maxTouches = Math.max(state.maxTouches, t.length);
        }
    }, {passive: false});

    pad.addEventListener('touchmove', (ev) => {
        ev.preventDefault();
        state.maxTouches = Math.max(state.maxTouches, ev.touches.length);
        const t = ev.touches[0];
        const dx = t.clientX - state.startX;
        const dy = t.clientY - state.startY;
        if (Math.sqrt(dx*dx + dy*dy) > 20) {
            clearTimeout(state.longPressTimer);
        }
    }, {passive: false});

    pad.addEventListener('touchend', (ev) => {
        ev.preventDefault();
        if (ev.touches.length > 0) return;

        clearTimeout(state.longPressTimer);
        if (state.isLongPressTriggered) return;

        const t = ev.changedTouches[0];
        const dx = t.clientX - state.startX;
        const dy = t.clientY - state.startY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const suffix = getFingerSuffix(state.maxTouches);

        if (dist > 30) {
            state.tapCount = 0;
            const dir = get8WayDirection(dx, dy);
            handleGesture(dir + suffix);
        } else {
            state.tapCount++;
            state.lastTapFingers = state.maxTouches;
            clearTimeout(state.tapTimer);
            state.tapTimer = setTimeout(() => {
                let gesture = 'tap';
                if (state.tapCount === 2) gesture = 'double_tap';
                if (state.tapCount >= 3) gesture = 'triple_tap';
                handleGesture(gesture + suffix);
                state.tapCount = 0;
            }, 300);
        }
    }, {passive: false});

    function handleGesture(kind) {
        if(indicator) {
            indicator.textContent = `Gesture: ${kind.replace(/_/g, ' ')}`;
            indicator.style.opacity = '1';
            setTimeout(()=> { indicator.style.opacity = '0.3'; indicator.textContent = 'Area Active'; }, 1000);
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
                return k.replace('piano_','');
            }
        }
        return null;
    }
    if(currentInput === CONFIG.INPUTS.KEY12) {
        for(let i=1; i<=12; i++) { 
            const k = 'k12_' + i; 
            if(gm[k] && gm[k].gesture === kind) return i; 
        }
        return null;
    }
    if(currentInput === CONFIG.INPUTS.KEY9) {
        for(let i=1; i<=9; i++) { 
            const k = 'k9_' + i; 
            if(gm[k] && gm[k].gesture === kind) return i; 
        }
        return null;
    }
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

    let isFirstInput = true;
    state.sequences.forEach(s => { if(s.length > 0) isFirstInput = false; });

    if (isFirstInput) {
        if (appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.reset && globalTimerActions.start) {
            globalTimerActions.reset();
            globalTimerActions.start();
        }
        if (appSettings.isAutoCounterEnabled && appSettings.showCounter && globalCounterActions.increment) {
            globalCounterActions.increment();
        }
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
function handleBackspace(e) { 
    if(e) { e.preventDefault(); e.stopPropagation(); } 
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings(); 
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
         if(state.sequences[0].length > 0) { state.sequences[0].pop(); state.nextSequenceIndex--; }
    } else {
        let target = (state.nextSequenceIndex - 1) % settings.machineCount;
        if (target < 0) target = settings.machineCount - 1; 
        
        if(state.sequences[target] && state.sequences[target].length > 0) {
             state.sequences[target].pop();
             state.nextSequenceIndex--;
        }
    }
    
    let isEmpty = true;
    state.sequences.forEach(s => { if(s.length > 0) isEmpty = false; });
    
    if (isEmpty && appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.stop) {
        globalTimerActions.stop();
    }

    renderUI(); 
    saveState(); 
}


function renderUI() {
    const container = document.getElementById('sequence-container'); 
    try {
        const gpWrap = document.getElementById('gesture-pad-wrapper');
        const pad = document.getElementById('gesture-pad');
        if (gpWrap) {
            // Note: The visibility logic here is now controlled by the header toggle
            // We just check the setting directly
            
            // --- FIXED LOGIC: Boss Mode Gestures OR Global Gestures ---
            const isGlobalGestureOn = appSettings.isGestureInputEnabled; // Logic moved to explicit toggle
            const isBossGestureOn = appSettings.isBlackoutFeatureEnabled && appSettings.isBlackoutGesturesEnabled && blackoutState.isActive;

            if (isGlobalGestureOn || isBossGestureOn) {
                document.body.classList.add('input-gestures-mode');
                gpWrap.classList.remove('hidden');
                
                // --- FIXED Z-INDEX: Ensure Pad sits ON TOP of Blackout Layer ---
                if (isBossGestureOn) {
                    gpWrap.style.zIndex = '10001'; // Higher than blackout (9999)
                    if(pad) {
                        pad.style.opacity = '0.05'; // Almost invisible to maintain "Blackout" feel
                        pad.style.borderColor = 'transparent';
                    }
                } else {
                    gpWrap.style.zIndex = ''; // Reset to CSS default (30)
                    if(pad) {
                        pad.style.opacity = '1';
                        pad.style.borderColor = '';
                    }
                }

                if (!window.__gesturePadInited) { initGesturePad(); window.__gesturePadInited = true; }
            } else { 
                document.body.classList.remove('input-gestures-mode');
                gpWrap.classList.add('hidden'); 
                gpWrap.style.zIndex = ''; // Reset
            }
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
        const header = document.createElement('h2');
        header.className = "text-2xl font-bold text-center w-full mt-4 mb-4"; // Reduced top margin
        header.style.color = "var(--text-main)";
        header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span>`;
        container.appendChild(header);

        if(practiceSequence.length === 0) { 
            state.currentRound = 1; 
            
            const btn = document.createElement('button');
            btn.textContent = "START";
            btn.className = "w-48 h-48 rounded-full bg-green-600 hover:bg-green-500 text-white text-3xl font-bold shadow-[0_0_40px_rgba(22,163,74,0.5)] transition-all transform hover:scale-105 active:scale-95 animate-pulse mx-auto block"; // Added mx-auto block
            btn.onclick = () => {
                btn.style.display = 'none'; 
                startPracticeRound();       
            };
            container.appendChild(btn);
        } else {
            // --- NEW RESET CONTROLS ---
            const controlsDiv = document.createElement('div');
            controlsDiv.className = "flex flex-col items-center gap-3 w-full";

            // 1. REPLAY BUTTON (The main request)
            const replayBtn = document.createElement('button');
            replayBtn.innerHTML = "↻ REPLAY ROUND";
            replayBtn.className = "w-64 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg text-xl active:scale-95 transition-transform";
            replayBtn.onclick = () => {
                practiceInputIndex = 0; // Reset your input progress
                showToast("Replaying... 👂");
                playPracticeSequence(); // Play the audio again
            };

            // 2. HARD RESET (Back to Round 1)
            const resetLvlBtn = document.createElement('button');
            resetLvlBtn.innerHTML = "⚠️ Reset to Level 1";
            resetLvlBtn.className = "text-xs text-red-400 hover:text-red-300 underline py-2";
            resetLvlBtn.onclick = () => {
                if(confirm("Restart practice from Level 1?")) {
                    practiceSequence = [];
                    state.currentRound = 1;
                    renderUI();
                }
            };

            controlsDiv.appendChild(replayBtn);
            controlsDiv.appendChild(resetLvlBtn);
            container.appendChild(controlsDiv);
        }
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
        (seq || []).forEach(num => { 
            const span = document.createElement('span'); 
            span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold"; 
            
            const scale = appSettings.uiScaleMultiplier || 1.0; 
            const boxSize = 40 * scale;
            span.style.width = boxSize + 'px'; 
            span.style.height = boxSize + 'px'; 
            
            const fontMult = appSettings.uiFontSizeMultiplier || 1.0;
            const fontSizePx = (boxSize * 0.5) * fontMult;
            span.style.fontSize = fontSizePx + 'px'; 
            
            span.textContent = num; 
            numGrid.appendChild(span); 
        }); 
        card.appendChild(numGrid); container.appendChild(card); 
    });

    
    const hMic = document.getElementById('header-mic-btn');
    const hCam = document.getElementById('header-cam-btn');
    const hGest = document.getElementById('header-gesture-btn'); // ADDED

    if(hMic) hMic.classList.toggle('header-btn-active', modules.sensor && modules.sensor.mode.audio);
    if(hCam) hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active'));
    if(hGest) hGest.classList.toggle('header-btn-active', !!appSettings.isGestureInputEnabled); // ADDED

    document.querySelectorAll('.reset-button').forEach(b => { b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none'; });
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
    isPlaybackPaused = false;
    playbackResumeCallback = null;

    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    const playBtn = document.querySelector('button[data-action="play-demo"]'); 
    
    let seqsToPlay = [];
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        seqsToPlay = [state.sequences[0]];
    } else {
        seqsToPlay = state.sequences.slice(0, settings.machineCount);
    }
    
    const chunkSize = settings.simonChunkSize || 3;
    let chunks = [];
    let maxLen = 0;
    seqsToPlay.forEach(s => { if(s.length > maxLen) maxLen = s.length; });
    
    for(let i=0; i<maxLen; i+=chunkSize) {
        for(let m=0; m<seqsToPlay.length; m++) {
            const seq = seqsToPlay[m];
            if(i < seq.length) {
                const slice = seq.slice(i, i+chunkSize);
                chunks.push({ 
                    machine: m, 
                    nums: slice, 
                    isNewRound: (m===0 && i===0 && chunks.length===0) 
                });
            }
        }
    }

    let cIdx = 0;
    let totalCount = 0; 

    const schedule = (fn, delay) => {
        setTimeout(() => {
            if(!isDemoPlaying) return; 
            if(isPlaybackPaused) {
                playbackResumeCallback = fn;
            } else {
                fn();
            }
        }, delay);
    };

        function nextChunk() {
        if(!isDemoPlaying) {
            if(playBtn) playBtn.textContent = "▶";
            return;
        }

        if(cIdx >= chunks.length) { 
            isDemoPlaying = false; 
            if(playBtn) playBtn.textContent = "▶";
            
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
               setTimeout(() => {
                   if(!isDemoPlaying) {
                       state.currentRound++;
                       state.sequences[0] = [];
                       state.nextSequenceIndex = 0;
                       renderUI();
                       showToast(`Round ${state.currentRound}`);
                       saveState();
                       disableInput(false);
                   }
               }, 500);
            }
            return; 
        }

        const chunk = chunks[cIdx];
        const machineDelay = (settings.simonInterSequenceDelay) || 0;
        
        let nIdx = 0;
        function playNum() {
            if(!isDemoPlaying) {
                if(playBtn) playBtn.textContent = "▶";
                return;
            }
            
            if(nIdx >= chunk.nums.length) {
                cIdx++;
                schedule(nextChunk, machineDelay);
                return;
            }
            const val = chunk.nums[nIdx];
            totalCount++; 
            
            if(playBtn) playBtn.textContent = totalCount;
            
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
            schedule(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}

/* --- UPDATED VOICE COMMANDER CLASS (Prefix Mode) --- */
class VoiceCommander {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.recognition = null;
        this.isListening = false;
        this.restartTimer = null;
        
        // Trigger words that must precede a number
        this.prefixes = ['add', 'plus', 'press', 'enter', 'push', 'input'];

        this.vocab = {
            // Digits (Handle both words and numbers)
            '1': '1', 'one': '1', 'won': '1',
            '2': '2', 'two': '2', 'to': '2', 'too': '2',
            '3': '3', 'three': '3', 'tree': '3',
            '4': '4', 'four': '4', 'for': '4', 'fore': '4',
            '5': '5', 'five': '5',
            '6': '6', 'six': '6',
            '7': '7', 'seven': '7',
            '8': '8', 'eight': '8', 'ate': '8',
            '9': '9', 'nine': '9',
            '10': '10', 'ten': '10', 'tin': '10',
            '11': '11', 'eleven': '11',
            '12': '12', 'twelve': '12',

            // Letters A-G (Piano Mode)
            'a': 'A', 'hey': 'A',
            'b': 'B', 'bee': 'B', 'be': 'B',
            'c': 'C', 'see': 'C', 'sea': 'C',
            'd': 'D', 'dee': 'D',
            'e': 'E',
            'f': 'F',
            'g': 'G', 'jee': 'G',

            // Global Commands (No prefix needed)
            'play': 'CMD_PLAY', 'start': 'CMD_PLAY', 'go': 'CMD_PLAY', 'read': 'CMD_PLAY',
            'stop': 'CMD_STOP', 'pause': 'CMD_STOP', 'halt': 'CMD_STOP',
            'delete': 'CMD_DELETE', 'back': 'CMD_DELETE', 'undo': 'CMD_DELETE',
            'clear': 'CMD_CLEAR', 'reset': 'CMD_CLEAR',
            'settings': 'CMD_SETTINGS', 'menu': 'CMD_SETTINGS', 'options': 'CMD_SETTINGS'
        };

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false; 
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => this.handleResult(event);
            this.recognition.onend = () => this.handleEnd();
            this.recognition.onerror = (e) => console.log('Voice Error:', e.error);
        } else {
            console.warn("Voice Control not supported.");
        }
    }

    toggle(active) {
        if (!this.recognition) return;
        if (active) {
            this.isListening = true;
            try { this.recognition.start(); } catch(e) {}
            this.callbacks.onStatus("Voice Active (Say 'Add...') 🎙️");
        } else {
            this.isListening = false;
            try { this.recognition.stop(); } catch(e) {}
            clearTimeout(this.restartTimer);
            this.callbacks.onStatus("Voice Off 🔇");
        }
    }

    handleResult(event) {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        console.log("Heard:", transcript);

        const words = transcript.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            // 1. Check for Global Commands (play, stop, clear)
            if (this.vocab[word] && this.vocab[word].startsWith('CMD_')) {
                this.callbacks.onCommand(this.vocab[word]);
                continue;
            }

            // 2. Check for Prefix (add, plus, press)
            if (this.prefixes.includes(word)) {
                // If we found a prefix, look at the VERY NEXT word
                const nextWord = words[i + 1];
                if (nextWord) {
                    const mapped = this.vocab[nextWord];
                    // If the next word is a valid input (number/letter)
                    if (mapped && !mapped.startsWith('CMD_')) {
                        this.callbacks.onInput(mapped);
                        i++; // Skip the number so we don't process it twice
                    }
                }
            }
        }
    }

    handleEnd() {
        if (this.isListening) {
            this.restartTimer = setTimeout(() => {
                try { this.recognition.start(); } catch(e) {}
            }, 100);
        }
    }
}

const startApp = () => {
    loadState();

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
    }, null); 

    modules.sensor = new SensorEngine(
        (val, source) => { 
             addValue(val); 
             const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
             if(btn) { btn.classList.add('flash-active'); setTimeout(() => btn.classList.remove('flash-active'), 200); }
        },
        (status) => { }
    );
    modules.settings.sensorEngine = modules.sensor;

    // --- FIX: INITIALIZE VOICE MODULE ---
    voiceModule = new VoiceCommander({
        onStatus: (msg) => showToast(msg),
        onInput: (val) => {
            addValue(val);
            const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
            if(btn) { 
                btn.classList.add('flash-active'); 
                setTimeout(() => btn.classList.remove('flash-active'), 200); 
            }
        },
        onCommand: (cmd) => {
            if(cmd === 'CMD_PLAY') playDemo();
            if(cmd === 'CMD_STOP') { isDemoPlaying = false; showToast("Stopped"); }
            if(cmd === 'CMD_CLEAR') { 
                const s = getState(); s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
                renderUI(); showToast("Cleared"); 
            }
            if(cmd === 'CMD_DELETE') handleBackspace();
            if(cmd === 'CMD_SETTINGS') modules.settings.openSettings();
        }
    });

    updateAllChrome();
    initComments(db);
    modules.settings.updateHeaderVisibility();
    initGlobalListeners();
    
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
        function getRotationAngle(touch1, touch2) {
            const dy = touch2.clientY - touch1.clientY;
            const dx = touch2.clientX - touch1.clientX;
            return Math.atan2(dy, dx) * 180 / Math.PI;
        }

        let rotStartAngle = 0;
        let rotAccumulator = 0;
        let rotLastUpdate = 0;

        let squiggleState = { isTracking: false, startX: 0, lastX: 0, direction: 0, flips: 0, hasTriggered: false };
        let squiggleState2F = { isTracking: false, lastX: 0, direction: 0, flips: 0, hasTriggered: false };

        let fourFingerStartSpread = 0;
        let pinchStartDist = 0;
        let pinchStartGlobal = 100;
        let pinchStartSeq = 1.0;


        document.body.addEventListener('touchstart', (e) => {
            const t = e.touches;

            if (t.length === 1) {
                squiggleState.isTracking = true;
                squiggleState.startX = t[0].clientX;
                squiggleState.lastX = t[0].clientX;
                squiggleState.direction = 0;
                squiggleState.flips = 0;
                squiggleState.hasTriggered = false;
            } else {
                squiggleState.isTracking = false; 
            }

            if (t.length === 2) {
                rotStartAngle = getRotationAngle(t[0], t[1]);
                rotAccumulator = 0;
                const dx = t[0].clientX - t[1].clientX;
                const dy = t[0].clientY - t[1].clientY;
                pinchStartDist = Math.sqrt(dx * dx + dy * dy);
                pinchStartGlobal = appSettings.globalUiScale || 100;
                pinchStartSeq = appSettings.uiScaleMultiplier || 1.0;

                squiggleState2F.isTracking = true;
                squiggleState2F.lastX = (t[0].clientX + t[1].clientX) / 2;
                squiggleState2F.direction = 0;
                squiggleState2F.flips = 0;
                squiggleState2F.hasTriggered = false;
            } else {
                squiggleState2F.isTracking = false;
            }

            if (t.length === 4) {
                const d1 = Math.hypot(t[0].clientX - t[3].clientX, t[0].clientY - t[3].clientY);
                const d2 = Math.hypot(t[1].clientX - t[2].clientX, t[1].clientY - t[2].clientY);
                fourFingerStartSpread = d1 + d2;
            }

        }, { passive: false });


        document.body.addEventListener('touchmove', (e) => {
            const t = e.touches;
            const now = Date.now();

            if (t.length === 1 && squiggleState.isTracking && !squiggleState.hasTriggered) {
                if (appSettings.isDeleteGestureEnabled) {
                    const x = t[0].clientX;
                    const dx = x - squiggleState.lastX;
                    
                    if (Math.abs(dx) > 5) {
                        const newDir = dx > 0 ? 1 : -1;
                        if (squiggleState.direction !== 0 && newDir !== squiggleState.direction) {
                            squiggleState.flips++;
                        }
                        squiggleState.direction = newDir;
                        squiggleState.lastX = x;

                        if (squiggleState.flips >= 4) {
                            handleBackspace(null); 
                            squiggleState.hasTriggered = true; 
                            showToast("Deleted ⌫");
                            squiggleState.flips = 2; 
                            squiggleState.hasTriggered = false; 
                        }
                    }
                }
            }


            if (t.length === 2) {
                
                if (appSettings.isClearGestureEnabled && squiggleState2F.isTracking && !squiggleState2F.hasTriggered) {
                    const currentAvgX = (t[0].clientX + t[1].clientX) / 2;
                    const dx = currentAvgX - squiggleState2F.lastX;
                    
                    if (Math.abs(dx) > 5) {
                        const newDir = dx > 0 ? 1 : -1;
                        if (squiggleState2F.direction !== 0 && newDir !== squiggleState2F.direction) {
                            squiggleState2F.flips++;
                        }
                        squiggleState2F.direction = newDir;
                        squiggleState2F.lastX = currentAvgX;

                        if (squiggleState2F.flips >= 3) {
                             const s = getState();
                             s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []);
                             s.nextSequenceIndex = 0;
                             renderUI();
                             saveState();
                             showToast("CLEARED 💥");
                             vibrate();
                             squiggleState2F.hasTriggered = true; 
                        }
                    }
                }

                if (!squiggleState2F.hasTriggered && (now - rotLastUpdate > 50)) {
                    
                    if (appSettings.isSpeedGesturesEnabled) {
                        if(e.cancelable) e.preventDefault();
                        const currentAngle = getRotationAngle(t[0], t[1]);
                        let delta = currentAngle - rotStartAngle;
                        if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
                        rotAccumulator += delta;
                        rotStartAngle = currentAngle;
                        
                        if (Math.abs(rotAccumulator) > 15) {
                            let newSpeed = appSettings.playbackSpeed || 1.0;
                            if (rotAccumulator > 0) { newSpeed += 0.05; showToast(`Speed: ${(newSpeed * 100).toFixed(0)}% 🐇`); } 
                            else { newSpeed -= 0.05; showToast(`Speed: ${(newSpeed * 100).toFixed(0)}% 🐢`); }
                            appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed));
                            saveState();
                            rotAccumulator = 0;
                            rotLastUpdate = now;
                        }
                    }

                    if (pinchStartDist > 0) {
                        const dx = t[0].clientX - t[1].clientX;
                        const dy = t[0].clientY - t[1].clientY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (Math.abs(dist - pinchStartDist) > 20) {
                            const ratio = dist / pinchStartDist;
                            const mode = appSettings.gestureResizeMode || 'global';
                            if (mode === 'sequence') {
                                let newScale = pinchStartSeq * ratio;
                                appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, newScale));
                                renderUI();
                            } else {
                                let newScale = pinchStartGlobal * ratio;
                                appSettings.globalUiScale = Math.min(200, Math.max(50, newScale));
                                updateAllChrome();
                            }
                        }
                    }
                }
            }

            if (t.length === 3 && appSettings.isVolumeGesturesEnabled && (now - rotLastUpdate > 50)) {
                if(e.cancelable) e.preventDefault();
                const currentAngle = getRotationAngle(t[0], t[1]);
                let delta = currentAngle - rotStartAngle;
                if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
                rotAccumulator += delta;
                rotStartAngle = currentAngle;
                
                if (Math.abs(rotAccumulator) > 15) {
                    let newVol = appSettings.voiceVolume || 1.0;
                    if (rotAccumulator > 0) { newVol += 0.05; showToast(`Volume: ${(newVol * 100).toFixed(0)}% 🔊`); } 
                    else { newVol -= 0.05; showToast(`Volume: ${(newVol * 100).toFixed(0)}% 🔉`); }
                    appSettings.voiceVolume = Math.min(1.0, Math.max(0.0, newVol));
                    saveState();
                    rotAccumulator = 0;
                    rotLastUpdate = now;
                }
            }
            
        }, { passive: false });

        document.body.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) { 
                pinchStartDist = 0; 
                squiggleState2F.isTracking = false;
                saveState(); 
                if(modules.settings) modules.settings.updateUIFromSettings(); 
            }
            if (e.touches.length < 4) fourFingerStartSpread = 0;
            if (e.touches.length === 0) { 
                squiggleState.isTracking = false; 
            }
        });


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

        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
            let wasPlaying = false; let lpTriggered = false;
            const handleDown = (e) => { 
                if(e && e.cancelable) { e.preventDefault(); e.stopPropagation(); } 
                wasPlaying = isDemoPlaying; lpTriggered = false;
                if(wasPlaying) { isDemoPlaying = false; b.textContent = "▶"; showToast("Playback Stopped 🛑"); return; }
                if (appSettings.isLongPressAutoplayEnabled) {
                    timers.longPress = setTimeout(() => {
                        lpTriggered = true;
                        appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled;
                        modules.settings.updateUIFromSettings();
                        showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`);
                        ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500);
                    }, 800);
                }
            };
            const handleUp = (e) => {
                if(e && e.cancelable) { e.preventDefault(); e.stopPropagation(); } 
                clearTimeout(timers.longPress);
                if (!wasPlaying && !lpTriggered) { playDemo(); }
            };
            b.addEventListener('mousedown', handleDown); b.addEventListener('touchstart', handleDown, { passive: false });
            b.addEventListener('mouseup', handleUp); b.addEventListener('touchend', handleUp); b.addEventListener('mouseleave', () => clearTimeout(timers.longPress));
        });

        document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => {
            b.addEventListener('click', () => { if(confirm("Reset Round Counter to 1?")) { const s = getState(); s.currentRound = 1; s.sequences[0] = []; s.nextSequenceIndex = 0; renderUI(); saveState(); showToast("Reset to Round 1"); } });
        });
        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
            b.addEventListener('click', () => { if(isDemoPlaying) { isDemoPlaying = false; const pb = document.querySelector('button[data-action="play-demo"]'); if(pb) pb.textContent = "▶"; showToast("Playback Stopped 🛑"); return; } modules.settings.openSettings(); });
            const start = () => { timers.settingsLongPress = setTimeout(() => { modules.settings.toggleRedeem(true); ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500); }, 1000); };
            const end = () => clearTimeout(timers.settingsLongPress);
            b.addEventListener('touchstart', start, {passive:true}); b.addEventListener('touchend', end); b.addEventListener('mousedown', start); b.addEventListener('mouseup', end);
        });

        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            const startDelete = (e) => { 
                if(e) { e.preventDefault(); e.stopPropagation(); } 
                handleBackspace(null); 
                if(!appSettings.isSpeedDeletingEnabled) return; 
                isDeleting = false; 
                timers.initialDelay = setTimeout(() => { isDeleting = true; timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); }, CONFIG.SPEED_DELETE_DELAY); 
            }; 
            const stopDelete = () => { clearTimeout(timers.initialDelay); clearInterval(timers.speedDelete); setTimeout(() => isDeleting = false, 50); }; 
            b.addEventListener('mousedown', startDelete); b.addEventListener('touchstart', startDelete, { passive: false }); b.addEventListener('mouseup', stopDelete); b.addEventListener('mouseleave', stopDelete); b.addEventListener('touchend', stopDelete); b.addEventListener('touchcancel', stopDelete); 
        });

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
        
        const handlePause = (e) => { if(isDemoPlaying) { isPlaybackPaused = true; showToast("Paused ⏸️"); } };
        const handleResume = (e) => { if(isPlaybackPaused) { isPlaybackPaused = false; showToast("Resumed ▶️"); if(playbackResumeCallback) { const fn = playbackResumeCallback; playbackResumeCallback = null; fn(); } } };
        document.body.addEventListener('mousedown', handlePause); document.body.addEventListener('touchstart', handlePause, {passive:true});
        document.body.addEventListener('mouseup', handleResume); document.body.addEventListener('touchend', handleResume);
        
        document.getElementById('close-settings').addEventListener('click', () => { if(appSettings.isPracticeModeEnabled) { setTimeout(startPracticeRound, 500); } });

                                let lastX=0, lastY=0, lastZ=0;
        window.addEventListener('devicemotion', (e) => {
            // 1. Check if Boss Mode feature is actually enabled in Settings
            if (!appSettings.isBlackoutFeatureEnabled) return;

            const acc = e.accelerationIncludingGravity; 
            if(!acc) return;
            
            // Calculate Shake Delta
            const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
            
            if(delta > 25) { // Sensitivity Threshold
                const now = Date.now();
                // 1 Second Cooldown to prevent double-toggles
                if(now - blackoutState.lastShake > 1000) {
                    
                    // 2. Toggle State
                    blackoutState.isActive = !blackoutState.isActive;
                    document.body.classList.toggle('blackout-active', blackoutState.isActive);
                    
                    // 3. Feedback
                    if(blackoutState.isActive) showToast("Boss Mode 🌑"); 
                    else showToast("Welcome Back ☀️");
                    
                    vibrate();
                    renderUI(); // Re-render to ensure any Z-index changes apply
                    
                    blackoutState.lastShake = now;
                }
            }
            lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        });

                                                                                   
        const bl = document.getElementById('blackout-layer');
        if(bl) {
             bl.addEventListener('touchstart', (e) => {
                 if (appSettings.isBlackoutGesturesEnabled) return;
                 if (e.touches.length === 1) {
                     e.preventDefault(); 
                     const t = e.touches[0]; const w = window.innerWidth; const h = window.innerHeight;
                     let col = Math.floor(t.clientX / (w / 3)); if (col > 2) col = 2;
                     const settings = getProfileSettings();
                     let val = null;
                     if (settings.currentInput === 'key9') {
                         let row = Math.floor(t.clientY / (h / 3)); if (row > 2) row = 2;
                         val = (row * 3) + col + 1;
                     } else {
                         let row = Math.floor(t.clientY / (h / 4)); if (row > 3) row = 3;
                         const index = (row * 3) + col; 
                         if (settings.currentInput === 'piano') {
                             const map = ['1','2','3', '4','5','C', 'D','E','F', 'G','A','B']; val = map[index];
                         } else { val = index + 1; }
                     }
                     if (val !== null) { addValue(val.toString()); if(navigator.vibrate) navigator.vibrate(20); }
                 }
             }, { passive: false });
        }
        
        const headerTimer = document.getElementById('header-timer-btn');
        const headerCounter = document.getElementById('header-counter-btn');
        const headerMic = document.getElementById('header-mic-btn');
        const headerCam = document.getElementById('header-cam-btn');
        const headerGestureBtn = document.getElementById('header-gesture-btn'); // ADDED

        if(headerTimer) {
            headerTimer.textContent = "00:00"; 
            headerTimer.style.fontSize = "0.75rem"; 
            const formatTime = (ms) => {
                const totalSec = Math.floor(ms / 1000); const m = Math.floor(totalSec / 60); const s = totalSec % 60;
                return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            };
            const updateTimer = () => {
                const now = Date.now(); const diff = now - simpleTimer.startTime + simpleTimer.elapsed;
                headerTimer.textContent = formatTime(diff);
            };
            
            globalTimerActions.start = () => {
                if(!simpleTimer.isRunning) {
                    simpleTimer.startTime = Date.now();
                    simpleTimer.interval = setInterval(updateTimer, 100);
                    simpleTimer.isRunning = true;
                }
            };
            globalTimerActions.stop = () => {
                if(simpleTimer.isRunning) {
                    clearInterval(simpleTimer.interval);
                    simpleTimer.elapsed += Date.now() - simpleTimer.startTime;
                    simpleTimer.isRunning = false;
                }
            };
            globalTimerActions.reset = () => {
                clearInterval(simpleTimer.interval);
                simpleTimer.isRunning = false;
                simpleTimer.elapsed = 0;
                headerTimer.textContent = "00:00";
            };

            const toggleTimer = () => {
                if(simpleTimer.isRunning) globalTimerActions.stop(); else globalTimerActions.start();
                vibrate();
            };
            const resetTimer = () => { globalTimerActions.reset(); showToast("Timer Reset"); vibrate(); };

            let tTimer; let tIsLong = false;
            const startT = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; tIsLong = false; tTimer = setTimeout(() => { tIsLong = true; resetTimer(); }, 600); };
            const endT = (e) => { if(e) e.preventDefault(); clearTimeout(tTimer); if(!tIsLong) toggleTimer(); };
            headerTimer.addEventListener('mousedown', startT); headerTimer.addEventListener('touchstart', startT, {passive:true});
            headerTimer.addEventListener('mouseup', endT); headerTimer.addEventListener('touchend', endT); headerTimer.addEventListener('mouseleave', () => clearTimeout(tTimer));
        }

        if(headerCounter) {
            headerCounter.textContent = simpleCounter.toString(); headerCounter.style.fontSize = "1.2rem";
            const updateCounter = () => { headerCounter.textContent = simpleCounter; };
            
            globalCounterActions.increment = () => { simpleCounter++; updateCounter(); };
            globalCounterActions.reset = () => { simpleCounter = 0; updateCounter(); };

            const increment = () => { globalCounterActions.increment(); vibrate(); };
            const resetCounter = () => { globalCounterActions.reset(); showToast("Counter Reset"); vibrate(); };

            let cTimer; let cIsLong = false;
            const startC = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; cIsLong = false; cTimer = setTimeout(() => { cIsLong = true; resetCounter(); }, 600); };
            const endC = (e) => { if(e) e.preventDefault(); clearTimeout(cTimer); if(!cIsLong) increment(); };
            headerCounter.addEventListener('mousedown', startC); headerCounter.addEventListener('touchstart', startC, {passive:true});
            headerCounter.addEventListener('mouseup', endC); headerCounter.addEventListener('touchend', endC); headerCounter.addEventListener('mouseleave', () => clearTimeout(cTimer));
        }

        if(headerMic) { 
            headerMic.onclick = () => { 
                if(!voiceModule) return;
                const isActive = !voiceModule.isListening;
                voiceModule.toggle(isActive);
                headerMic.classList.toggle('header-btn-active', isActive);
            }; 
        }

        // ADDED GESTURE BUTTON LOGIC
        if(headerGestureBtn) {
            headerGestureBtn.onclick = () => {
                // Toggle the setting
                appSettings.isGestureInputEnabled = !appSettings.isGestureInputEnabled;
                
                // Update UI state
                headerGestureBtn.classList.toggle('header-btn-active', appSettings.isGestureInputEnabled);
                
                // Feedback
                if(appSettings.isGestureInputEnabled) showToast("Gestures Active 🗒️");
                else showToast("Gestures Off");
                
                // Save and Render
                saveState();
                renderUI();
                
                if(modules.settings) modules.settings.updateUIFromSettings();
            };
        }

        if(headerCam) { 
            headerCam.onclick = () => {
                const isArActive = document.body.classList.contains('ar-active');
                const newState = !isArActive;

                if (newState) {
                    // Turn AR ON
                    document.body.classList.add('ar-active');
                    headerCam.classList.add('header-btn-active');
                    
                    if (modules.sensor) {
                        modules.sensor.toggleCamera(true); // Start stream
                        if (modules.sensor.videoEl) {
                            modules.sensor.videoEl.style.display = 'block';
                            modules.sensor.videoEl.className = 'ar-background-video';
                        }
                    }
                    showToast("AR Mode ON 📸");
                } else {
                    // Turn AR OFF
                    document.body.classList.remove('ar-active');
                    headerCam.classList.remove('header-btn-active');
                    
                    if (modules.sensor) {
                        modules.sensor.toggleCamera(false); // Stop stream
                        if (modules.sensor.videoEl) {
                            modules.sensor.videoEl.style.display = 'none';
                        }
                    }
                    showToast("AR Mode OFF");
                }
            }; 
        }
    } catch(e) {
        console.error("Listener Error:", e);
    }
}
        
document.addEventListener('DOMContentLoaded', startApp);
