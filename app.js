// ==========================================
// 1. IMPORTS
// ==========================================
import { GestureEngine } from './gestures.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS } from './settings.js';
import { initComments } from './comments.js';
import { VisionEngine } from './vision.js';

// ==========================================
// 2. FIREBASE & PERSISTENCE
// ==========================================
const firebaseConfig = { 
    apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", 
    authDomain: "follow-me-app-de3e9.firebaseapp.com", 
    projectId: "follow-me-app-de3e9", 
    storageBucket: "follow-me-app-de3e9.firebasestorage.app", 
    messagingSenderId: "957006680126", 
    appId: "1:957006680126:web:6d679717d9277fd9ae816f" 
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') console.log('Multiple tabs open, persistence limited.');
    else if (err.code == 'unimplemented') console.log('Browser lacks persistence support.');
});

// ==========================================
// 3. CONSTANTS & DEFAULTS
// ==========================================
const CONFIG = { 
    MAX_MACHINES: 4, 
    DEMO_DELAY_BASE_MS: 798, 
    SPEED_DELETE_DELAY: 250, 
    SPEED_DELETE_INTERVAL: 20, 
    STORAGE_KEY_SETTINGS: 'followMeAppSettings_v47', 
    STORAGE_KEY_STATE: 'followMeAppState_v48', 
    INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, 
    MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } 
};

const DICTIONARY = {
    'en': { correct: "Correct", wrong: "Wrong", stealth: "Stealth Active", reset: "Reset to Round 1", stop: "Playback Stopped 🛑" },
    'es': { correct: "Correcto", wrong: "Incorrecto", stealth: "Modo Sigilo", reset: "Reiniciar Ronda 1", stop: "Detenido 🛑" }
};

const DEFAULT_PROFILE_SETTINGS = { 
    currentInput: CONFIG.INPUTS.KEY9, 
    currentMode: CONFIG.MODES.SIMON, 
    sequenceLength: 20, 
    machineCount: 1, 
    simonChunkSize: 40, 
    simonInterSequenceDelay: 0 
};

const PREMADE_PROFILES = { 
    'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 
    'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 40, simonInterSequenceDelay: 0 }, theme: 'default' }, 
    'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 
    'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 
    'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }
};

const DEFAULT_MAPPINGS = {
    'k9_1': 'tap', 'k9_2': 'double_tap', 'k9_3': 'triple_tap',
    'k9_4': 'tap_2f_any', 'k9_5': 'double_tap_2f_any', 'k9_6': 'triple_tap_2f_any',
    'k9_7': 'tap_3f_any', 'k9_8': 'double_tap_3f_any', 'k9_9': 'triple_tap_3f_any',
    'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
    'k12_5': 'tap_2f_any', 'k12_6': 'double_tap_2f_any', 'k12_7': 'triple_tap_2f_any', 'k12_8': 'long_tap_2f_any',
    'k12_9': 'tap_3f_any', 'k12_10': 'double_tap_3f_any', 'k12_11': 'triple_tap_3f_any', 'k12_12': 'long_tap_3f_any',
    'piano_C': 'swipe_nw', 'piano_D': 'swipe_left', 'piano_E': 'swipe_sw',
    'piano_F': 'swipe_down', 'piano_G': 'swipe_se', 'piano_A': 'swipe_right', 'piano_B': 'swipe_ne',
    'piano_1': 'swipe_left_2f', 'piano_2': 'swipe_nw_2f', 'piano_3': 'swipe_up_2f',
    'piano_4': 'swipe_ne_2f', 'piano_5': 'swipe_right_2f'
};

const DEFAULT_HAND_MAPPINGS = {
    'k9_1': 'hand_1_up', 'k9_2': 'hand_2_up', 'k9_3': 'hand_3_up',
    'k9_4': 'hand_4_up', 'k9_5': 'hand_5_up', 'k9_6': 'hand_1_down',
    'k9_7': 'hand_2_down', 'k9_8': 'hand_3_down', 'k9_9': 'hand_4_down',
    'k12_1': 'hand_1_up', 'k12_2': 'hand_2_up', 'k12_3': 'hand_3_up',
    'k12_4': 'hand_4_up', 'k12_5': 'hand_5_up', 'k12_6': 'hand_1_down',
    'k12_7': 'hand_2_down', 'k12_8': 'hand_3_down', 'k12_9': 'hand_4_down',
    'k12_10': 'hand_5_down', 'k12_11': 'hand_1_right', 'k12_12': 'hand_1_left',
    'piano_C': 'hand_1_up', 'piano_D': 'hand_2_up', 'piano_E': 'hand_3_up',
    'piano_F': 'hand_4_up', 'piano_G': 'hand_5_up', 'piano_A': 'hand_1_right', 'piano_B': 'hand_1_left',
    'piano_1': 'hand_1_down', 'piano_2': 'hand_2_down', 'piano_3': 'hand_3_down',
    'piano_4': 'hand_4_down', 'piano_5': 'hand_5_down'
};

const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: false, isHapticsEnabled: true, isFlashEnabled: true,  
    pauseSetting: 'none', isSpeedDeletingEnabled: true, isSpeedGesturesEnabled: false, isVolumeGesturesEnabled: false,
    isArModeEnabled: false, isVoiceInputEnabled: false, isDeleteGestureEnabled: false, isClearGestureEnabled: false,
    isAutoTimerEnabled: false, isAutoCounterEnabled: false, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', showTimer: false, showCounter: false,
    activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), 
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), 
    isPracticeModeEnabled: false, voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, 
    selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', generalLanguage: 'en', 
    isGestureInputEnabled: false, gestureMappings: {} 
};

// ==========================================
// 4. GLOBAL STATE
// ==========================================
let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null, vision: null, gestureEngine: null };
let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null, stealth: null, stealthAction: null, playback: null, tap: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };
let blackoutState = { isActive: false, lastShake: 0 }; 
let isDeleting = false; 
let isDemoPlaying = false;
let isPlaybackPaused = false;
let playbackResumeCallback = null;
let practiceSequence = [];
let practiceInputIndex = 0;
let ignoreNextClick = false;
let voiceModule = null;
let isGesturePadVisible = false;

let simpleTimer = { interval: null, startTime: 0, elapsed: 0, isRunning: false };
let simpleCounter = 0;
let globalTimerActions = { start: null, stop: null, reset: null };
let globalCounterActions = { increment: null, reset: null };

// ==========================================
// 5. STATE ACCESS & PERSISTENCE
// ==========================================
const getProfileSettings = () => appSettings.runtimeSettings;
const getState = () => appState['current_session'] || (appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 });

function saveState() { 
    localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); 
    localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState)); 
}

function loadState() { 
    try { 
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS); 
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE); 
        if(s) { 
            const loaded = JSON.parse(s); 
            appSettings = { ...DEFAULT_APP, ...loaded, profiles: { ...DEFAULT_APP.profiles, ...(loaded.profiles || {}) }, customThemes: { ...DEFAULT_APP.customThemes, ...(loaded.customThemes || {}) } }; 
            if(!appSettings.runtimeSettings) appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId]?.settings || DEFAULT_PROFILE_SETTINGS)); 
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

// ==========================================
// 6. UTILITIES (Haptics, Speech, Toasts)
// ==========================================
function vibrate() { if(appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10); }

function vibrateMorse(val) { 
    if(!navigator.vibrate || !appSettings.isHapticMorseEnabled) return; 
    let num = parseInt(val);
    if(isNaN(num)) {
        const map = { 'A':6, 'B':7, 'C':8, 'D':9, 'E':10, 'F':11, 'G':12 };
        num = map[val.toUpperCase()] || 0;
    }
    let patternStr = (appSettings.morseMappings && appSettings.morseMappings[num]) ? appSettings.morseMappings[num] : "";
    if (!patternStr) {
        if (num <= 3) patternStr = ".".repeat(num);
        else if (num <= 6) patternStr = "-" + ".".repeat(num-3);
        else if (num <= 9) patternStr = "--" + ".".repeat(num-6);
        else patternStr = "---" + ".".repeat(num-10);
    }
    if (patternStr.startsWith('__')) {
        switch(patternStr) {
            case '__TICK__': navigator.vibrate(15); break;
            case '__THUD__': navigator.vibrate(70); break;
            case '__BUZZ__': navigator.vibrate(400); break;
            case '__DBL__': navigator.vibrate([20, 50, 20]); break;
            case '__TRPL__': navigator.vibrate([20, 40, 20, 40, 20]); break;
            case '__HBEAT__': navigator.vibrate([60, 80, 150]); break;
            case '__RAMP__': navigator.vibrate([10, 20, 40, 80]); break;
        }
        return;
    }
    const speed = appSettings.playbackSpeed || 1.0; 
    const factor = 1.0 / speed; 
    const DOT = 100 * factor, DASH = 300 * factor, GAP = 100 * factor; 
    let pattern = []; 
    for (let char of patternStr) {
        if(char === '.') pattern.push(DOT);
        if(char === '-') pattern.push(DASH);
        pattern.push(GAP);
    }
    if(pattern.length > 0) navigator.vibrate(pattern); 
}

function showToast(msg) { 
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    let finalMsg = msg;
    if(msg === "Reset to Round 1") finalMsg = dict.reset;
    else if(msg === "Playback Stopped 🛑") finalMsg = dict.stop;
    else if(msg === "Stealth Active") finalMsg = dict.stealth;
    const t = document.getElementById('toast-notification'); 
    const m = document.getElementById('toast-message'); 
    if(!t || !m) return; 
    m.textContent = finalMsg; 
    t.classList.remove('opacity-0', '-translate-y-10'); 
    setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000); 
}

function speak(text) { 
    if(!appSettings.isAudioEnabled || !window.speechSynthesis) return; 
    window.speechSynthesis.cancel(); 
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    let msg = text;
    if(text === "Correct") msg = dict.correct;
    else if(text === "Wrong") msg = dict.wrong;
    else if(text === "Stealth Active") msg = dict.stealth;
    const u = new SpeechSynthesisUtterance(msg); 
    u.lang = (lang === 'es') ? 'es-MX' : 'en-US';
    if(appSettings.selectedVoice){
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(voice => voice.name === appSettings.selectedVoice);
        if(v) u.voice = v;
    } 
    u.volume = appSettings.voiceVolume || 1.0; 
    u.pitch = Math.min(2, Math.max(0.1, appSettings.voicePitch || 1.0));
    u.rate = Math.min(10, Math.max(0.1, appSettings.voiceRate || 1.0));
    window.speechSynthesis.speak(u); 
}

// ==========================================
// 7. THEME & GLOBAL UI UPDATES
// ==========================================
function applyTheme(themeKey) { 
    const body = document.body; 
    body.className = body.className.replace(/theme-\w+/g, ''); 
    let t = appSettings.customThemes[themeKey] || PREMADE_THEMES[themeKey] || PREMADE_THEMES['default']; 
    body.style.setProperty('--primary', t.bubble); 
    body.style.setProperty('--bg-main', t.bgMain); 
    body.style.setProperty('--bg-modal', t.bgCard); 
    body.style.setProperty('--card-bg', t.bgCard); 
    body.style.setProperty('--seq-bubble', t.bubble); 
    body.style.setProperty('--btn-bg', t.btn); 
    body.style.setProperty('--bg-input', t.bgMain); 
    body.style.setProperty('--text-main', t.text); 
    const isDark = parseInt(t.bgCard.replace('#',''), 16) < 0xffffff / 2; 
    body.style.setProperty('--border', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'); 
}

function updateAllChrome() { 
    applyTheme(appSettings.activeTheme); 
    document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`; 
    renderUI(); 
}

function disableInput(disabled) {
    const footer = document.getElementById('input-footer');
    if(!footer) return;
    if(disabled) footer.classList.add('opacity-50', 'pointer-events-none'); 
    else footer.classList.remove('opacity-50', 'pointer-events-none');
}

// ==========================================
// 8. RENDER UI
// ==========================================
function renderUI() {
    const container = document.getElementById('sequence-container'); 
    if(!container) return;

    // --- Gesture Overlay Logic ---
    const gpWrap = document.getElementById('gesture-pad-wrapper');
    const pad = document.getElementById('gesture-pad');
    if (gpWrap) {
        const isGlobalGestureOn = appSettings.isGestureInputEnabled; 
        const isBossGestureOn = appSettings.isBlackoutFeatureEnabled && appSettings.isBlackoutGesturesEnabled && blackoutState.isActive;
        if ((isGlobalGestureOn && isGesturePadVisible) || isBossGestureOn) {
            document.body.classList.add('input-gestures-mode');
            gpWrap.classList.remove('hidden');
            if (isBossGestureOn) {
                gpWrap.style.zIndex = '10001'; 
                if(pad) { pad.style.opacity = '0.05'; pad.style.borderColor = 'transparent'; }
            } else {
                gpWrap.style.zIndex = ''; 
                if(pad) { pad.style.opacity = '1'; pad.style.borderColor = ''; }
            }
        } else { 
            document.body.classList.remove('input-gestures-mode');
            gpWrap.classList.add('hidden'); 
        }
    }

    container.innerHTML = ''; 
    const settings = getProfileSettings();
    const state = getState();

    ['key9', 'key12', 'piano'].forEach(k => { 
        const el = document.getElementById(`pad-${k}`); 
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none'; 
    });
    
    // --- Practice Mode UI ---
    if(appSettings.isPracticeModeEnabled) {
        const header = document.createElement('h2');
        header.className = "text-2xl font-bold text-center w-full mt-4 mb-4"; 
        header.style.color = "var(--text-main)";
        header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span>`;
        container.appendChild(header);

        if(practiceSequence.length === 0) { 
            const btn = document.createElement('button');
            btn.textContent = "START";
            btn.className = "w-48 h-48 rounded-full bg-green-600 text-white text-3xl font-bold shadow-lg mx-auto block animate-pulse"; 
            btn.onclick = () => { btn.style.display = 'none'; startPracticeRound(); };
            container.appendChild(btn);
        } else {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = "flex flex-col items-center gap-3 w-full";
            const replayBtn = document.createElement('button');
            replayBtn.innerHTML = "↻ REPLAY ROUND";
            replayBtn.className = "w-64 py-4 bg-yellow-600 text-white font-bold rounded-xl text-xl";
            replayBtn.onclick = () => { practiceInputIndex = 0; showToast("Replaying... 👂"); playPracticeSequence(); };
            controlsDiv.appendChild(replayBtn);
            container.appendChild(controlsDiv);
        }
        return;
    }
    
    // --- Standard Sequence Cards ---
    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4); 
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    
    activeSeqs.forEach((seq, idx) => { 
        const card = document.createElement('div'); 
        card.className = "p-4 rounded-xl shadow-md bg-[var(--card-bg)] relative group min-h-[100px]"; 
        
        if (settings.machineCount > 1 || settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
            const headerRow = document.createElement('div');
            headerRow.className = "flex justify-between items-center mb-2 pb-2 border-b border-opacity-20";
            const title = document.createElement('span');
            title.className = "text-[10px] font-bold uppercase tracking-wider";
            title.textContent = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? "SEQUENCE" : `MACHINE ${idx + 1}`;
            headerRow.appendChild(title);
            card.appendChild(headerRow);
        }

        const numGrid = document.createElement('div'); 
        numGrid.className = (settings.machineCount > 1) ? "grid grid-cols-4 gap-2 justify-items-center" : "flex flex-wrap gap-2 justify-center";
        (seq || []).forEach(num => { 
            const span = document.createElement('span'); 
            span.className = "number-box rounded-lg flex items-center justify-center font-bold"; 
            const scale = appSettings.uiScaleMultiplier || 1.0; 
            span.style.width = (40 * scale) + 'px'; 
            span.style.height = (40 * scale) + 'px'; 
            span.style.fontSize = (20 * scale) + 'px';
            span.textContent = num; 
            numGrid.appendChild(span); 
        }); 
        card.appendChild(numGrid); 
        container.appendChild(card); 
    });

    // Update Header Icons
    const hMic = document.getElementById('header-mic-btn');
    const hCam = document.getElementById('header-cam-btn');
    const hGest = document.getElementById('header-gesture-btn'); 
    if(hMic) hMic.classList.toggle('header-btn-active', voiceModule?.isListening);
    if(hCam) hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active'));
    if(hGest) hGest.classList.toggle('header-btn-active', isGesturePadVisible); 

    updateEngineConstraints();
}

// ==========================================
// 9. GAMEPLAY LOGIC
// ==========================================
function addValue(value) {
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings();
    
    if(appSettings.isPracticeModeEnabled) {
        if(practiceSequence.length === 0) return; 
        if(value == practiceSequence[practiceInputIndex]) { 
            practiceInputIndex++; 
            if(practiceInputIndex >= practiceSequence.length) { 
                speak("Correct"); state.currentRound++; 
                setTimeout(startPracticeRound, 1500); 
            } 
        } else { 
            speak("Wrong"); navigator.vibrate(500); 
            setTimeout(() => playPracticeSequence(), 1500); 
        } 
        return;
    }
    
    let targetIndex = (settings.currentMode === CONFIG.MODES.SIMON) ? state.nextSequenceIndex % settings.machineCount : 0;
    const roundNum = parseInt(state.currentRound) || 1;
    const limit = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) ? roundNum : settings.sequenceLength;
    
    if(state.sequences[targetIndex]?.length >= limit) return;

    // Auto Timer/Counter
    let isFirstInput = !state.sequences.some(s => s.length > 0);
    if (isFirstInput) {
        if (appSettings.isAutoTimerEnabled && globalTimerActions.start) globalTimerActions.start();
        if (appSettings.isAutoCounterEnabled && globalCounterActions.increment) globalCounterActions.increment();
    }

    if(!state.sequences[targetIndex]) state.sequences[targetIndex] = [];
    state.sequences[targetIndex].push(value); 
    state.nextSequenceIndex++; 
    renderUI(); 
    saveState();
    
    if(appSettings.isAutoplayEnabled) {
        if (settings.currentMode === CONFIG.MODES.SIMON) { 
            if((state.nextSequenceIndex - 1) % settings.machineCount === settings.machineCount - 1) setTimeout(playDemo, 250); 
        } else if (appSettings.isUniqueRoundsAutoClearEnabled && state.sequences[0].length >= roundNum) {
            disableInput(true); setTimeout(playDemo, 250); 
        } else {
            setTimeout(playDemo, 250);
        }
    }
}

function handleBackspace(e) { 
    if(e) { e.preventDefault(); e.stopPropagation(); } 
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings(); 
    let target = (state.nextSequenceIndex - 1) % settings.machineCount;
    if (target < 0) target = settings.machineCount - 1; 
    
    if(state.sequences[target]?.length > 0) {
         state.sequences[target].pop();
         state.nextSequenceIndex--;
    }
    
    if (!state.sequences.some(s => s.length > 0) && appSettings.isAutoTimerEnabled) globalTimerActions.stop?.();
    renderUI(); saveState(); 
}

function playDemo() {
    if(isDemoPlaying) return;
    isDemoPlaying = true; isPlaybackPaused = false;
    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    const playBtn = document.querySelector('button[data-action="play-demo"]'); 
    
    let seqsToPlay = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    const chunkSize = settings.simonChunkSize || 3;
    let chunks = [], maxLen = 0;
    seqsToPlay.forEach(s => { if(s.length > maxLen) maxLen = s.length; });
    
    for(let i=0; i<maxLen; i+=chunkSize) {
        for(let m=0; m<seqsToPlay.length; m++) {
            if(i < seqsToPlay[m].length) {
                chunks.push({ machine: m, nums: seqsToPlay[m].slice(i, i+chunkSize) });
            }
        }
    }

    let cIdx = 0, totalCount = 0;
    const schedule = (fn, delay) => setTimeout(() => { if(!isDemoPlaying) return; if(isPlaybackPaused) playbackResumeCallback = fn; else fn(); }, delay);

    function nextChunk() {
        if(!isDemoPlaying || cIdx >= chunks.length) { 
            isDemoPlaying = false; if(playBtn) playBtn.textContent = "▶";
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
               state.currentRound++; state.sequences[0] = []; state.nextSequenceIndex = 0;
               renderUI(); saveState(); disableInput(false);
            }
            return; 
        }
        const chunk = chunks[cIdx];
        let nIdx = 0;
        function playNum() {
            if(!isDemoPlaying) return;
            if(nIdx >= chunk.nums.length) { cIdx++; schedule(nextChunk, settings.simonInterSequenceDelay || 0); return; }
            const val = chunk.nums[nIdx];
            totalCount++; if(playBtn) playBtn.textContent = totalCount;
            const btn = document.querySelector(`#pad-${settings.currentInput} button[data-value="${val}"]`);
            if(btn) { btn.classList.add('flash-active'); setTimeout(() => btn.classList.remove('flash-active'), 250/speed); }
            speak(val);
            if(appSettings.isHapticMorseEnabled) vibrateMorse(val);
            nIdx++; schedule(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}

// ==========================================
// 10. PRACTICE MODE ENGINE
// ==========================================
function startPracticeRound() {
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
        practiceSequence.push(getRand()); state.currentRound = practiceSequence.length;
    } else {
        practiceSequence = []; for(let i=0; i<state.currentRound; i++) practiceSequence.push(getRand());
    }
    practiceInputIndex = 0; renderUI(); showToast(`Practice Round ${state.currentRound}`); 
    setTimeout(() => playPracticeSequence(), 1000);
}

function playPracticeSequence() {
    disableInput(true); 
    let i = 0; const speed = appSettings.playbackSpeed || 1.0;
    function next() {
        if(i >= practiceSequence.length) { disableInput(false); return; }
        const val = practiceSequence[i]; 
        const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value=\"${val}\"]`);
        if(btn) { btn.classList.add('flash-active'); setTimeout(() => btn.classList.remove('flash-active'), 250 / speed); }
        speak(val); i++; setTimeout(next, 800 / speed);
    } 
    next();
}

// ==========================================
// 11. CLASSES & ENGINE INITS
// ==========================================
class VoiceCommander {
    constructor(callbacks) {
        this.callbacks = callbacks; this.recognition = null; this.isListening = false;
        this.prefixes = ['add', 'plus', 'press', 'enter', 'push', 'input'];
        this.vocab = { '1': '1', 'one': '1', '2': '2', 'two': '2', 'play': 'CMD_PLAY', 'stop': 'CMD_STOP', 'delete': 'CMD_DELETE', 'back': 'CMD_DELETE' }; // Truncated for space, use your full vocab
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            this.recognition = new SR(); this.recognition.continuous = false; this.recognition.onresult = (e) => this.handleResult(e);
            this.recognition.onend = () => { if(this.isListening) setTimeout(() => this.recognition.start(), 100); };
        }
    }
    toggle(active) { this.isListening = active; if(active) this.recognition.start(); else this.recognition.stop(); }
    handleResult(event) {
        const transcript = event.results[event.results.length-1][0].transcript.trim().toLowerCase();
        const words = transcript.split(' ');
        words.forEach((word, i) => {
            if (this.vocab[word]?.startsWith('CMD_')) this.callbacks.onCommand(this.vocab[word]);
            else if (this.prefixes.includes(word) && words[i+1]) {
                const mapped = this.vocab[words[i+1]]; if (mapped) this.callbacks.onInput(mapped);
            }
        });
    }
}

function mapGestureToValue(kind, currentInput) {
    const saved = appSettings.gestureMappings || {};
    const matches = (target, incoming) => (target === incoming || (target?.endsWith('_any') && incoming.startsWith(target.replace('_any', ''))));
    const checkMatch = (key) => {
        const m = saved[key] || {};
        return matches(m.gesture || DEFAULT_MAPPINGS[key], kind) || matches(m.hand || DEFAULT_HAND_MAPPINGS[key], kind);
    };
    if(currentInput === 'piano') {
        const keys = ['C','D','E','F','G','A','B','1','2','3','4','5'];
        for(let k of keys) if (checkMatch('piano_' + k)) return k;
    } else {
        const count = (currentInput === 'key12') ? 12 : 9;
        const prefix = (currentInput === 'key12') ? 'k12_' : 'k9_';
        for(let i=1; i<=count; i++) if (checkMatch(prefix + i)) return i;
    }
    return null;
}

function updateEngineConstraints() {
    if (!modules.gestureEngine) return;
    const activeList = [];
    const settings = getProfileSettings();
    const prefix = settings.currentInput === 'piano' ? 'piano_' : (settings.currentInput === 'key12' ? 'k12_' : 'k9_');
    const items = settings.currentInput === 'piano' ? ['C','D','E','F','G','A','B','1','2','3','4','5'] : Array.from({length: settings.currentInput === 'key12' ? 12 : 9}, (_, i) => i + 1);
    items.forEach(k => activeList.push(appSettings.gestureMappings?.[prefix+k]?.gesture || DEFAULT_MAPPINGS[prefix+k]));
    modules.gestureEngine.updateAllowed(activeList);
}

function initGestureEngine() {
    modules.gestureEngine = new GestureEngine(document.body, { tapDelay: 300, swipeThreshold: 30 }, {
        onGesture: (data) => {
            if (isGesturePadVisible || document.body.classList.contains('input-gestures-mode') || blackoutState.isActive) {
                const val = mapGestureToValue(data.name, getProfileSettings().currentInput);
                if (val) addValue(val);
            }
        },
        onContinuous: (data) => {
            if (data.type === 'squiggle' && data.fingers === 1 && appSettings.isDeleteGestureEnabled) handleBackspace();
            if (data.type === 'pinch') {
                const mode = appSettings.gestureResizeMode;
                if (mode === 'sequence') appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, (appSettings.uiScaleMultiplier || 1.0) * data.scale));
                else if (mode === 'global') appSettings.globalUiScale = Math.min(200, Math.max(50, (appSettings.globalUiScale || 100) * data.scale));
                updateAllChrome();
            }
        }
    });
}

// ==========================================
// 12. LISTENERS & BOOTSTRAP
// ==========================================
function initGlobalListeners() {
    document.querySelectorAll('.btn-pad-number').forEach(b => {
        const press = (e) => { e.preventDefault(); addValue(b.dataset.value); };
        b.addEventListener('touchstart', press, { passive: false }); b.addEventListener('mousedown', press);
    });
    
    document.querySelector('button[data-action="play-demo"]')?.addEventListener('click', playDemo);
    document.querySelector('button[data-action="backspace"]')?.addEventListener('click', handleBackspace);
    document.querySelector('button[data-action="open-settings"]')?.addEventListener('click', () => modules.settings.openSettings());

    // Shake for Boss Mode
    let lastX=0, lastY=0, lastZ=0;
    window.addEventListener('devicemotion', (e) => {
        if(!appSettings.isBlackoutFeatureEnabled) return; 
        const acc = e.accelerationIncludingGravity; if(!acc) return;
        if(Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) > 25) {
            if(Date.now() - blackoutState.lastShake > 1000) {
                blackoutState.isActive = !blackoutState.isActive;
                document.body.classList.toggle('blackout-active', blackoutState.isActive);
                vibrate(); renderUI(); blackoutState.lastShake = Date.now();
            }
        }
        lastX = acc.x; lastY = acc.y; lastZ = acc.z;
    });
}

const startApp = () => {
    loadState();
    modules.settings = new SettingsManager(appSettings, {
        onSave: saveState, onUpdate: updateAllChrome,
        onProfileSwitch: (id) => { appSettings.activeProfileId = id; appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); saveState(); renderUI(); }
    });
    modules.sensor = new SensorEngine((val) => addValue(val));
    modules.vision = new VisionEngine((gesture) => {
        const val = mapGestureToValue(gesture, getProfileSettings().currentInput);
        if (val) addValue(val);
    });
    voiceModule = new VoiceCommander({ onInput: addValue, onCommand: (cmd) => { if(cmd==='CMD_PLAY') playDemo(); } });
    const headerCam = document.getElementById('header-cam-btn');
if (headerCam) {
    headerCam.onclick = async () => {
        const isCurrentlyActive = document.body.classList.contains('ar-active');
        
        if (!isCurrentlyActive) {
            // --- START AR MODE ---
            try {
                const videoEl = await modules.vision.start(); // Ensure VisionEngine returns the <video>
                
                if (videoEl) {
                    videoEl.classList.add('ar-background-video');
                    videoEl.setAttribute('autoplay', '');
                    videoEl.setAttribute('muted', '');
                    videoEl.setAttribute('playsinline', '');
                    
                    // Only prepend if it's not already there
                    if (!document.querySelector('.ar-background-video')) {
                        document.body.prepend(videoEl);
                    }
                    
                    document.body.classList.add('ar-active');
                    headerCam.classList.add('header-btn-active');
                    showToast("AR Analyzer ON 📸");
                }
            } catch (err) {
                console.error("Camera failed:", err);
                showToast("Camera Denied ❌");
            }
        } else {
            // --- STOP AR MODE ---
            document.body.classList.remove('ar-active');
            headerCam.classList.remove('header-btn-active');
            
            modules.vision.stop();
            
            // Clean up the element to save memory
            const oldVideo = document.querySelector('.ar-background-video');
            if (oldVideo) oldVideo.remove();
            
            showToast("AR Mode OFF");
        }
    };
    }
    
    updateAllChrome();
    initComments(db);
    initGlobalListeners();
    initGestureEngine();
    renderUI();
};

document.addEventListener('DOMContentLoaded', startApp);
