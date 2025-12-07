// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS, DEFAULT_MAPPINGS } from './settings.js';
import { initComments } from './comments.js';

const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CONFIG ---
const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v58', STORAGE_KEY_STATE: 'followMeAppState_v58', INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } };

const DEFAULT_PROFILE_SETTINGS = { currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, simonChunkSize: 3, simonInterSequenceDelay: 400 };
const PREMADE_PROFILES = { 'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 400 }, theme: 'default' }, 'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }};

const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: true, isHapticsEnabled: true, 
    isSpeedDeletingEnabled: true, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    morsePauseDuration: 0.2, // NEW: Default pause
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', 
    showTimer: false, showCounter: false, isGestureModeEnabled: false, // NEW TOGGLES
    gestureMappings: JSON.parse(JSON.stringify(DEFAULT_MAPPINGS)), // NEW MAPPINGS
    activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), 
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), 
    isPracticeModeEnabled: false, 
    voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', generalLanguage: 'en' 
};

const DICTIONARY = {
    'en': { correct: "Correct", wrong: "Wrong", stealth: "Stealth Active", reset: "Reset to Round 1", stop: "Playback Stopped 🛑" },
    'es': { correct: "Correcto", wrong: "Incorrecto", stealth: "Modo Sigilo", reset: "Reiniciar Ronda 1", stop: "Detenido 🛑" }
};

let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null };
// Added timer state
let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null, stealth: null, stealthAction: null, playback: null, tap: null, stopwatch: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };
let blackoutState = { isActive: false, lastShake: 0 }; 
// Expanded Gesture Input State
let gestureInputState = { 
    startX: 0, startY: 0, startTime: 0, maxTouches: 0, 
    isTapCandidate: false, tapCount: 0, 
    isTracking: false, history: [] 
};
let activationGestureState = { tapCount: 0, lastTapTime: 0 }; // For 3-finger triple tap

let timerState = { running: false, startTime: 0, elapsed: 0 };
let counterState = { count: 0 };

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
            
            // Safety defaults for new settings
            if (typeof appSettings.morsePauseDuration === 'undefined') appSettings.morsePauseDuration = 0.2;
            if (!appSettings.gestureMappings) appSettings.gestureMappings = JSON.parse(JSON.stringify(DEFAULT_MAPPINGS));

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
    
    // Lookup custom morse pattern from mapping if available
    const settings = getProfileSettings();
    const mode = settings.currentInput || 'key9';
    const mapping = appSettings.gestureMappings?.[mode]?.[val];
    
    // If we have a custom mapping with a defined morse pattern, parse it
    if (mapping && mapping.m) {
        const pattern = [];
        const speed = appSettings.playbackSpeed || 1.0;
        const factor = 1.0 / speed;
        const DOT = 100 * factor, DASH = 300 * factor, GAP = 100 * factor;
        
        for(let char of mapping.m) {
            if(char === '.') { pattern.push(DOT); pattern.push(GAP); }
            else if(char === '-') { pattern.push(DASH); pattern.push(GAP); }
        }
        if(pattern.length > 0) navigator.vibrate(pattern);
        return;
    }

    // Fallback Legacy Morse
    let num = parseInt(val);
    if(isNaN(num)) {
        const map = { 'A':6, 'B':7, 'C':8, 'D':9, 'E':10, 'F':11, 'G':12 };
        num = map[val.toUpperCase()] || 0;
    }

    const speed = appSettings.playbackSpeed || 1.0; 
    const factor = 1.0 / speed; 
    const DOT = 100 * factor, DASH = 300 * factor, GAP = 100 * factor; 
    let pattern = []; 
    
    if (num >= 1 && num <= 3) { 
        for(let i=0; i<num; i++) { pattern.push(DOT); pattern.push(GAP); } 
    } else if (num >= 4 && num <= 6) { 
        pattern.push(DASH); pattern.push(GAP); 
        for(let i=0; i<(num-3); i++) { pattern.push(DOT); pattern.push(GAP); } 
    } else if (num >= 7 && num <= 9) { 
        pattern.push(DASH); pattern.push(GAP); pattern.push(DASH); pattern.push(GAP); 
        for(let i=0; i<(num-6); i++) { pattern.push(DOT); pattern.push(GAP); } 
    } else if (num >= 10 && num <= 12) { 
        pattern.push(DASH); pattern.push(GAP); pattern.push(DASH); pattern.push(GAP); pattern.push(DASH); pattern.push(GAP);
        for(let i=0; i<(num-10); i++) { pattern.push(DOT); pattern.push(GAP); } 
    } 
    
    if(pattern.length > 0) navigator.vibrate(pattern); 
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
    if(lang === 'es') u.lang = 'es-MX';
    else u.lang = 'en-US';

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

    if(practiceSequence.length === 0) {
        state.currentRound = 1;
    }

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
    
    // NEW: Show Start Button instead of auto-starting
    const startBtn = document.getElementById('practice-start-btn');
    if(startBtn) {
        startBtn.classList.remove('hidden');
        startBtn.onclick = () => {
            startBtn.classList.add('hidden');
            showToast(`Practice Round ${state.currentRound}`); 
            setTimeout(() => playPracticeSequence(), 500);
        };
    }
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
        
        if(key) { 
            key.classList.add('flash-active'); 
            setTimeout(() => key.classList.remove('flash-active'), 250 / speed); 
        }
        
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
    if (isUnique) {
        limit = appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength;
    } else {
        limit = settings.sequenceLength;
    }
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
        if (isUnique && appSettings.isUniqueRoundsAutoClearEnabled) {
            showToast("Round Full - Reset? 🛑");
            vibrate();
        }
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
            // --- STRICT UNIQUE AUTOPLAY FIX ---
            // Only autoplay when the sequence length matches the round target
            // This prevents it from trying to play after every single input
            if (state.sequences[0].length >= roundNum) { 
                disableInput(true); 
                setTimeout(playDemo, 250); 
            }
        }
    }
}

function handleBackspace(e) { 
    if(e && isDeleting) return; 
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings(); 
    if(state.nextSequenceIndex === 0) return; 
    
    let targetIndex = 0; 
    if(settings.currentMode === CONFIG.MODES.SIMON) targetIndex = (state.nextSequenceIndex - 1) % settings.machineCount; 
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length > 0) { 
        state.sequences[targetIndex].pop(); 
        state.nextSequenceIndex--; 
        if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) disableInput(false); 
        renderUI(); 
        saveState(); 
    } 
}

function resetRounds() { 
    const state = getState(); 
    state.currentRound = 1; 
    state.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
    state.nextSequenceIndex = 0; 
    disableInput(false); 
    renderUI(); 
    saveState(); 
    showToast("Reset to Round 1"); 
}

function disableInput(disabled) { const pad = document.getElementById(`pad-${getProfileSettings().currentInput}`); if(pad) pad.querySelectorAll('button').forEach(b => b.disabled = disabled); }

function playDemo() {
    const settings = getProfileSettings(); 
    const state = getState(); 
    const demoBtn = document.querySelector(`#pad-${settings.currentInput} button[data-action=\"play-demo\"]`);
    const settingsBtns = document.querySelectorAll('button[data-action=\"open-settings\"]');
    
    if(isDemoPlaying) {
        isDemoPlaying = false;
        if(timers.playback) clearTimeout(timers.playback);
        disableInput(false);
        if(demoBtn) { demoBtn.innerHTML = '▶'; demoBtn.disabled = false; }
        settingsBtns.forEach(btn => { btn.innerHTML = '⚙️'; btn.disabled = false; });
        showToast("Playback Stopped 🛑");
        return;
    }

    if(demoBtn && demoBtn.disabled && !isDemoPlaying) return; 

    let playlist = [];
    if(settings.currentMode === CONFIG.MODES.SIMON) { 
        const activeSeqs = state.sequences.slice(0, settings.machineCount); 
        const maxLen = Math.max(...activeSeqs.map(s => s.length)); 
        if(maxLen === 0) return; 
        const chunkSize = (settings.machineCount > 1) ? settings.simonChunkSize : maxLen; 
        const numChunks = Math.ceil(maxLen / chunkSize); 
        for(let c=0; c<numChunks; c++) { 
            for(let m=0; m<settings.machineCount; m++) { 
                for(let k=0; k<chunkSize; k++) { 
                    const idx = (c*chunkSize) + k; 
                    if(activeSeqs[m][idx]) playlist.push({ val: activeSeqs[m][idx], machine: m }); 
                } 
            } 
        } 
    } else { 
        const seq = state.sequences[0]; 
        if(!seq || seq.length === 0) { disableInput(false); return; } 
        playlist = seq.map(v => ({ val: v, machine: 0 })); 
    }
    
    disableInput(true); 
    if(demoBtn) demoBtn.disabled = false;
    settingsBtns.forEach(btn => { btn.disabled = false; btn.innerHTML = '■'; });

    isDemoPlaying = true; 
    
    let i = 0; 
    const speed = appSettings.playbackSpeed || 1; 
    const baseInterval = CONFIG.DEMO_DELAY_BASE_MS / speed;
    const pauseDur = (appSettings.morsePauseDuration || 0.2) * 1000; // NEW: Morse Pause
    
    function next() { 
        try {
            if(!isDemoPlaying) return; 
            
            if(i >= playlist.length) { 
                disableInput(false); 
                isDemoPlaying = false; 
                if(demoBtn) { demoBtn.innerHTML = '▶'; demoBtn.disabled = false; }
                settingsBtns.forEach(btn => { btn.innerHTML = '⚙️'; btn.disabled = false; });
                
                // --- UNIQUE AUTO ADVANCE CLEANUP ---
                if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) { 
                    state.sequences[0] = []; 
                    state.nextSequenceIndex = 0; 
                    state.currentRound = (parseInt(state.currentRound) || 1) + 1; 
                    if(state.currentRound > settings.sequenceLength) resetRounds(); 
                    renderUI(); 
                    saveState(); 
                } 
                return; 
            } 
            
            const item = playlist[i]; 
            const key = document.querySelector(`#pad-${settings.currentInput} button[data-value=\"${item.val}\"]`); 
            if(key) { key.classList.add('flash-active'); setTimeout(() => key.classList.remove('flash-active'), 250 / speed); } 
            
            speak(item.val); 
            vibrateMorse(item.val); 
            
            const seqBoxes = document.getElementById('sequence-container').children; 
            if(seqBoxes[item.machine]) { seqBoxes[item.machine].style.transform = 'scale(1.05)'; setTimeout(() => seqBoxes[item.machine].style.transform = 'scale(1)', 250 / speed); } 
            
            if(demoBtn) demoBtn.innerText = (i + 1);

            let nextDelay = baseInterval + pauseDur; // Add pause duration
            if (i + 1 < playlist.length) {
                const nextItem = playlist[i+1];
                if (nextItem.machine !== item.machine) {
                    nextDelay += (settings.simonInterSequenceDelay || 0);
                }
            }
            
            i++; 
            timers.playback = setTimeout(next, nextDelay); 

        } catch (err) {
            console.error("Playback error", err);
            disableInput(false);
            isDemoPlaying = false;
            if(demoBtn) demoBtn.innerHTML = '▶';
        }
    } 
    next();
}
function renderUI() {
    const container = document.getElementById('sequence-container'); 
    // Don't wipe container if practice start button is there and we are just updating visuals
    const startBtn = document.getElementById('practice-start-btn');
    const preservingStartBtn = (appSettings.isPracticeModeEnabled && startBtn && !startBtn.classList.contains('hidden'));
    
    if (!preservingStartBtn) {
        container.innerHTML = ''; 
    }
    
    const settings = getProfileSettings();
    const state = getState();

    // Input Pad Visibility
    ['key9', 'key12', 'piano'].forEach(k => { 
        const el = document.getElementById(`pad-${k}`); 
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none'; 
    });

    // Practice Mode Header
    if(appSettings.isPracticeModeEnabled) {
        if (!preservingStartBtn) {
            // Re-inject start button if lost (should be handled by startPracticeRound, but safety check)
            if(practiceSequence.length === 0) setTimeout(startPracticeRound, 100);
             container.innerHTML = `<h2 class=\"text-2xl font-bold text-center w-full mt-10 mb-4\" style=\"color:var(--text-main)\">Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span></h2>`;
             const btn = document.createElement('button');
             btn.id = 'practice-start-btn';
             btn.className = 'bg-green-600 hover:bg-green-500 text-white font-bold text-2xl px-8 py-6 rounded-full shadow-2xl btn-pulse z-40 transform transition hover:scale-105 active:scale-95';
             btn.textContent = 'START ROUND';
             btn.onclick = () => {
                 btn.classList.add('hidden');
                 showToast(`Practice Round ${state.currentRound}`);
                 setTimeout(() => playPracticeSequence(), 500);
             };
             container.appendChild(btn);
        }
        // Don't render grid behind start button initially
        if(document.getElementById('practice-start-btn') && !document.getElementById('practice-start-btn').classList.contains('hidden')) return;
    }

    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    
    // Unique Mode Header
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && !appSettings.isPracticeModeEnabled) {
        const roundNum = parseInt(state.currentRound) || 1;
        const header = document.createElement('h2');
        header.className = "text-xl font-bold text-center w-full mb-4 opacity-80";
        header.style.color = "var(--text-main)";
        header.innerHTML = `Unique Mode: <span class=\"text-primary-app\">Round ${roundNum}</span>`;
        container.appendChild(header);
    }

    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4); 
    const gridDiv = document.createElement('div');
    gridDiv.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    
    activeSeqs.forEach((seq) => { 
        const card = document.createElement('div'); card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)]"; 
        const numGrid = document.createElement('div'); 
        if (settings.machineCount > 1) { numGrid.className = "grid grid-cols-4 gap-2 justify-items-center"; } else { numGrid.className = "flex flex-wrap gap-2 justify-center"; }
        (seq || []).forEach(num => { const span = document.createElement('span'); span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold"; const scale = appSettings.uiScaleMultiplier || 1.0; span.style.width = (40 * scale) + 'px'; span.style.height = (40 * scale) + 'px'; span.style.fontSize = (1.2 * scale) + 'rem'; span.textContent = num; numGrid.appendChild(span); }); 
        card.appendChild(numGrid); gridDiv.appendChild(card); 
    });
    if (!preservingStartBtn) container.appendChild(gridDiv);
    
    // Header Tools Visibility
    const timerBtn = document.getElementById('timer-btn');
    const counterBtn = document.getElementById('counter-btn');
    if (timerBtn) timerBtn.classList.toggle('hidden', !appSettings.showTimer);
    if (counterBtn) counterBtn.classList.toggle('hidden', !appSettings.showCounter);

    // Mic/Cam Visibility (Moved to Header)
    const micBtn = document.getElementById('mic-master-btn');
    const camBtn = document.getElementById('camera-master-btn');
    if (micBtn) {
        micBtn.classList.toggle('hidden', !appSettings.showMicBtn);
        micBtn.classList.toggle('master-active', modules.sensor && modules.sensor.mode.audio);
    }
    if (camBtn) {
        camBtn.classList.toggle('hidden', !appSettings.showCamBtn);
        camBtn.classList.toggle('master-active', modules.sensor && modules.sensor.mode.camera);
    }
    
    document.querySelectorAll('.reset-button').forEach(b => { b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none'; });
}

// --- TIMER FUNCTIONS ---
function toggleTimer() {
    if (timerState.running) {
        clearInterval(timers.stopwatch);
        timerState.running = false;
        document.getElementById('timer-btn').classList.remove('text-green-400');
    } else {
        timerState.startTime = Date.now() - timerState.elapsed;
        timers.stopwatch = setInterval(updateTimerDisplay, 100);
        timerState.running = true;
        document.getElementById('timer-btn').classList.add('text-green-400');
    }
    vibrate();
}

function resetTimer() {
    if (timers.stopwatch) clearInterval(timers.stopwatch);
    timerState.running = false;
    timerState.elapsed = 0;
    updateTimerDisplay();
    document.getElementById('timer-btn').classList.remove('text-green-400');
    vibrate();
    showToast("Timer Reset");
}

function updateTimerDisplay() {
    if (timerState.running) timerState.elapsed = Date.now() - timerState.startTime;
    const seconds = (timerState.elapsed / 1000).toFixed(1);
    const btn = document.getElementById('timer-btn');
    if (btn) btn.innerText = `⏱️ ${seconds}s`;
}

// --- COUNTER FUNCTIONS ---
function incrementCounter() {
    counterState.count++;
    updateCounterDisplay();
    vibrate();
}

function resetCounter() {
    counterState.count = 0;
    updateCounterDisplay();
    vibrate();
    showToast("Counter Reset");
}

function updateCounterDisplay() {
    const btn = document.getElementById('counter-btn');
    if (btn) btn.innerText = counterState.count;
}

// --- GESTURE SYSTEM ---
function toggleBlackout() { 
    blackoutState.isActive = !blackoutState.isActive; 
    document.body.classList.toggle('blackout-active', blackoutState.isActive); 
    
    const layer = document.getElementById('blackout-layer');

    if(blackoutState.isActive) { 
        if(appSettings.isAudioEnabled) speak("Stealth Active"); 
        
        // Setup listeners based on Gesture Toggle
        if (appSettings.isBlackoutGesturesEnabled) {
            setupGestureListeners(layer);
        } else {
            // Legacy Grid Handler
            layer.addEventListener('touchstart', handleBlackoutTouch, {passive: false}); 
        }

    } else { 
        removeGestureListeners(layer);
        layer.removeEventListener('touchstart', handleBlackoutTouch); 
    } 
}

function toggleGestureOverlay(forceState = null) {
    const overlay = document.getElementById('gesture-pad-overlay');
    if (!overlay) return;
    
    const isActive = forceState !== null ? forceState : !overlay.classList.contains('active');
    
    if (isActive) {
        overlay.classList.add('active');
        setupGestureListeners(overlay);
        showToast("Gesture Pad Active");
    } else {
        overlay.classList.remove('active');
        removeGestureListeners(overlay);
        showToast("Gesture Pad Closed");
    }
}

function setupGestureListeners(element) {
    element.addEventListener('touchstart', handleGestureStart, {passive: false});
    element.addEventListener('touchmove', handleGestureMove, {passive: false});
    element.addEventListener('touchend', handleGestureEnd, {passive: false});
}

function removeGestureListeners(element) {
    element.removeEventListener('touchstart', handleGestureStart);
    element.removeEventListener('touchmove', handleGestureMove);
    element.removeEventListener('touchend', handleGestureEnd);
}

function handleShake(e) { if(!appSettings.isBlackoutFeatureEnabled) return; const acc = e.acceleration; if(!acc) return; if(Math.hypot(acc.x, acc.y, acc.z) > 15) { const now = Date.now(); if(now - blackoutState.lastShake > 1000) { toggleBlackout(); vibrate(); blackoutState.lastShake = now; } } }

// Legacy Grid
function handleBlackoutTouch(e) { 
    if(!blackoutState.isActive) return; 
    e.preventDefault(); e.stopPropagation(); 
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX; 
    const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY; 
    const w = window.innerWidth, h = window.innerHeight; 
    const settings = getProfileSettings(); 
    let val = null; 
    
    if(settings.currentInput === 'piano') { 
        const keys = ['C','D','E','F','G','A','B','1','2','3','4','5']; 
        const idx = Math.floor(x / (w / keys.length)); 
        if(keys[idx]) val = keys[idx]; 
    } else { 
        const c = Math.floor(x / (w/3)); 
        const r = Math.floor(y / (h/ (settings.currentInput==='key12'?4:3))); 
        let num = (r * 3) + c + 1; 
        if(num > 0 && num <= (settings.currentInput==='key12'?12:9)) val = num.toString(); 
    } 
    
    if(val) { addValue(val); vibrateMorse(val); } 
}

// --- NEW DYNAMIC GESTURE ENGINE ---
function handleGestureStart(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    
    if (!gestureInputState.isTracking) {
        gestureInputState.isTracking = true;
        gestureInputState.maxTouches = e.touches.length;
        gestureInputState.startX = e.touches[0].clientX;
        gestureInputState.startY = e.touches[0].clientY;
        gestureInputState.startTime = Date.now();
    } else {
        gestureInputState.maxTouches = Math.max(gestureInputState.maxTouches, e.touches.length);
    }
}

function handleGestureMove(e) {
    e.preventDefault();
    if(gestureInputState.isTracking) {
        gestureInputState.maxTouches = Math.max(gestureInputState.maxTouches, e.touches.length);
    }
}

function handleGestureEnd(e) {
    e.preventDefault();
    if (e.touches.length > 0) return; // Wait for all fingers

    gestureInputState.isTracking = false;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - gestureInputState.startX;
    const diffY = endY - gestureInputState.startY;
    const duration = Date.now() - gestureInputState.startTime;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);
    
    let detectedGesture = '';
    const fingers = gestureInputState.maxTouches;

    // Detect Gesture Type
    if (duration < 300 && absX < 30 && absY < 30) {
        // TAPS
        if (fingers === 1) {
             // Logic for Double Tap vs Single Tap
             if (gestureInputState.isTapCandidate) {
                 clearTimeout(timers.tap);
                 gestureInputState.isTapCandidate = false;
                 processDetectedGesture('dbl_1');
                 return;
             } else {
                 gestureInputState.isTapCandidate = true;
                 timers.tap = setTimeout(() => {
                     if (gestureInputState.isTapCandidate) {
                         processDetectedGesture('tap_1');
                         gestureInputState.isTapCandidate = false;
                     }
                 }, 250); // Double tap window
                 return;
             }
        } else if (fingers === 2) {
             // 2 Finger Tap (Treating dbl/single same for now unless expanded)
             processDetectedGesture('tap_2'); return;
        } else if (fingers === 3) {
             processDetectedGesture('tap_3'); return;
        }
    } 
    else if (duration > 500 && absX < 30 && absY < 30) {
        // LONG PRESS
        processDetectedGesture(`long_${fingers}`);
        return;
    }
    else if (Math.max(absX, absY) > 50) {
        // SWIPES
        let dir = '';
        // Diagonal Check (if both axes are significant)
        const isDiagonal = (absX > 40 && absY > 40);
        
        if (isDiagonal) {
            const isRight = diffX > 0;
            const isDown = diffY > 0;
            if (!isRight && !isDown) dir = 'upleft';
            else if (isRight && !isDown) dir = 'upright';
            else if (!isRight && isDown) dir = 'downleft';
            else if (isRight && isDown) dir = 'downright';
        } else {
            // Cardinal
            if (absX > absY) {
                dir = diffX > 0 ? 'right' : 'left';
            } else {
                dir = diffY > 0 ? 'down' : 'up';
            }
        }
        processDetectedGesture(`swipe_${dir}_${fingers}`);
        return;
    }
}

function processDetectedGesture(gestureKey) {
    const inputType = getProfileSettings().currentInput || 'key9';
    const mapping = appSettings.gestureMappings[inputType];
    
    if (!mapping) return;

    // Reverse lookup: Find which Value corresponds to this GestureKey
    let valueToTrigger = null;
    
    // mapping object structure: { '1': { g: 'tap_1', m: '...' }, '2': ... }
    for (const [val, config] of Object.entries(mapping)) {
        if (config.g === gestureKey) {
            valueToTrigger = val;
            break;
        }
    }

    if (valueToTrigger) {
        addValue(valueToTrigger);
        vibrateMorse(valueToTrigger);
    } else {
        // Feedback for unrecognized gesture
        vibrate(); 
        console.log("Unmapped gesture:", gestureKey);
    }
}

// --- 3-FINGER TRIPLE TAP ACTIVATION ---
function handleBodyTouchStart(e) {
    if (e.touches.length === 3) {
        const now = Date.now();
        if (now - activationGestureState.lastTapTime < 400) {
            activationGestureState.tapCount++;
        } else {
            activationGestureState.tapCount = 1;
        }
        activationGestureState.lastTapTime = now;
        
        if (activationGestureState.tapCount === 3) {
            // Trigger Toggle
            activationGestureState.tapCount = 0;
            const overlay = document.getElementById('gesture-pad-overlay');
            const isActive = overlay && overlay.classList.contains('active');
            toggleGestureOverlay(!isActive);
            vibrate();
            setTimeout(() => vibrate(), 100); // Double buzz confirmation
        }
    }
    
    // Resume Audio Context if suspended (iOS requirement)
    if(modules.sensor && modules.sensor.audioCtx && modules.sensor.audioCtx.state === 'suspended') modules.sensor.audioCtx.resume();
}


function handle1KeyStart() {
    if(!appSettings.isStealth1KeyEnabled) return;
    ignoreNextClick = false;
    timers.stealth = setTimeout(() => {
        ignoreNextClick = true;
        document.body.classList.toggle('hide-controls');
        vibrate();
    }, 1000); 
}
function handle1KeyEnd() { if(timers.stealth) clearTimeout(timers.stealth); }

window.onload = function() {
    try {
        loadState(); 
        initComments(db); 
        if (window.DeviceMotionEvent) window.addEventListener('devicemotion', handleShake, false); 
        
        const target = document.body;

        // Global Touch Handler for Activation Gesture & Audio Resume
        target.addEventListener('touchstart', handleBodyTouchStart, { passive: true });
        
        // Pinch Zoom Logic
        target.addEventListener('touchstart', (e) => { 
            if (e.touches.length === 2) { 
                gestureState.isPinching = true; 
                gestureState.startDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); 
                gestureState.startScale = (appSettings.gestureResizeMode === 'sequence') ? (appSettings.uiScaleMultiplier || 1.0) : (appSettings.globalUiScale || 100); 
            } 
        }, { passive: false });
        
        target.addEventListener('touchmove', (e) => { 
            if (gestureState.isPinching && e.touches.length === 2) { 
                e.preventDefault(); 
                const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); 
                const ratio = dist / gestureState.startDist; 
                let newScale = gestureState.startScale * ratio;
                if (appSettings.gestureResizeMode === 'sequence') { 
                    newScale = Math.round(newScale * 10) / 10; 
                    appSettings.uiScaleMultiplier = Math.min(Math.max(newScale, 0.5), 3.0); renderUI(); 
                } else { 
                    newScale = Math.round(newScale / 10) * 10;
                    appSettings.globalUiScale = Math.min(Math.max(newScale, 50), 300); updateAllChrome(); 
                } 
            } 
        }, { passive: false });
        
        target.addEventListener('touchend', () => { if(gestureState.isPinching) { gestureState.isPinching = false; saveState(); } });

        modules.sensor = new SensorEngine((val) => addValue(val), (msg) => showToast(msg)); 
        if (appSettings.sensorAudioThresh) modules.sensor.setSensitivity('audio', appSettings.sensorAudioThresh); 
        if (appSettings.sensorCamThresh) modules.sensor.setSensitivity('camera', appSettings.sensorCamThresh);
        
        modules.settings = new SettingsManager(appSettings, {
            onUpdate: (type) => { 
                if(type === 'mode_switch') {
                    appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
                    showToast("Game Mode Reset 🔄");
                }
                if(appSettings.isPracticeModeEnabled) {
                    practiceSequence = [];
                    practiceInputIndex = 0;
                    appState['current_session'].currentRound = 1;
                }
                updateAllChrome(); 
                saveState(); 
            },
            onSave: () => saveState(), 
            onReset: () => { localStorage.clear(); location.reload(); },
            onProfileSwitch: (id) => { 
                appSettings.activeProfileId = id; 
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); 
                appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 }; 
                practiceSequence = []; 
                updateAllChrome(); 
                saveState(); 
            },
            onProfileAdd: (name) => { const id = 'p_' + Date.now(); appSettings.profiles[id] = { name, settings: JSON.parse(JSON.stringify(appSettings.runtimeSettings)), theme: appSettings.activeTheme }; appSettings.activeProfileId = id; updateAllChrome(); saveState(); },
            onProfileRename: (name) => { appSettings.profiles[appSettings.activeProfileId].name = name; saveState(); },
            onProfileDelete: () => { delete appSettings.profiles[appSettings.activeProfileId]; appSettings.activeProfileId = Object.keys(appSettings.profiles)[0]; appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings)); if(appSettings.profiles[appSettings.activeProfileId].theme) appSettings.activeTheme = appSettings.profiles[appSettings.activeProfileId].theme; updateAllChrome(); saveState(); },
            onProfileSave: () => { appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings)); saveState(); showToast("Profile Settings Saved 💾"); }
        }, modules.sensor);
        
        updateAllChrome(); 

        if(appSettings.isPracticeModeEnabled) {
            const settingsModal = document.getElementById('settings-modal');
            if(!settingsModal || settingsModal.classList.contains('pointer-events-none')) {
                setTimeout(startPracticeRound, 500);
            }
        }

        // Button Listeners
        document.querySelectorAll('.btn-pad-number, .piano-key-white, .piano-key-black').forEach(btn => {
            if(btn.dataset.value === '1') {
                btn.addEventListener('mousedown', handle1KeyStart); btn.addEventListener('touchstart', handle1KeyStart, {passive: true});
                btn.addEventListener('mouseup', handle1KeyEnd); btn.addEventListener('touchend', handle1KeyEnd); btn.addEventListener('mouseleave', handle1KeyEnd);
            }
            btn.addEventListener('click', (e) => {
                if(btn.dataset.value === '1' && ignoreNextClick) { ignoreNextClick = false; return; }
                addValue(e.target.dataset.value);
            });
        });

        // Timer/Counter Listeners
        const tBtn = document.getElementById('timer-btn');
        if(tBtn) {
            tBtn.addEventListener('click', toggleTimer);
            // Long Press Reset
            let pressTimer;
            tBtn.addEventListener('touchstart', () => { pressTimer = setTimeout(resetTimer, 800); }, {passive:true});
            tBtn.addEventListener('touchend', () => clearTimeout(pressTimer));
            tBtn.addEventListener('mousedown', () => { pressTimer = setTimeout(resetTimer, 800); });
            tBtn.addEventListener('mouseup', () => clearTimeout(pressTimer));
        }

        const cBtn = document.getElementById('counter-btn');
        if(cBtn) {
            cBtn.addEventListener('click', incrementCounter);
            let pressTimer;
            cBtn.addEventListener('touchstart', () => { pressTimer = setTimeout(resetCounter, 800); }, {passive:true});
            cBtn.addEventListener('touchend', () => clearTimeout(pressTimer));
            cBtn.addEventListener('mousedown', () => { pressTimer = setTimeout(resetCounter, 800); });
            cBtn.addEventListener('mouseup', () => clearTimeout(pressTimer));
        }
        
        // Demo & Settings Buttons
        document.querySelectorAll('button[data-action=\"play-demo\"]').forEach(b => { 
            b.addEventListener('click', playDemo); 
            const startLongPress = () => { timers.longPress = setTimeout(() => { if(appSettings.isLongPressAutoplayEnabled !== false) { appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled; showToast(`Autoplay: ${appSettings.isAutoplayEnabled?'ON':'OFF'}`); saveState(); vibrate(); } }, 500); }; 
            const cancelLong = () => clearTimeout(timers.longPress); 
            b.addEventListener('mousedown', startLongPress); b.addEventListener('touchstart', startLongPress, { passive: true }); b.addEventListener('mouseup', cancelLong); b.addEventListener('mouseleave', cancelLong); b.addEventListener('touchend', cancelLong); 
        });
        
        document.querySelectorAll('button[data-action=\"open-settings\"]').forEach(b => {
             const startSettingsLong = () => { timers.settingsLongPress = setTimeout(() => { vibrate(); if(modules.settings) modules.settings.toggleRedeem(true); }, 800); };
             const cancelSettingsLong = () => { if(timers.settingsLongPress) clearTimeout(timers.settingsLongPress); };
             b.addEventListener('mousedown', startSettingsLong); b.addEventListener('touchstart', startSettingsLong, { passive: true }); b.addEventListener('mouseup', cancelSettingsLong); b.addEventListener('mouseleave', cancelSettingsLong); b.addEventListener('touchend', cancelSettingsLong);
             b.onclick = () => { if(timers.settingsLongPress) clearTimeout(timers.settingsLongPress); if(isDemoPlaying) { playDemo(); return; } modules.settings.openSettings(); };
        });

        document.querySelectorAll('button[data-action=\"reset-unique-rounds\"]').forEach(b => b.addEventListener('click', () => { if(confirm("Reset to Round 1?")) resetRounds(); }));
        document.querySelectorAll('button[data-action=\"backspace\"]').forEach(b => { 
            b.addEventListener('click', handleBackspace); 
            const startDelete = () => { if(!appSettings.isSpeedDeletingEnabled) return; isDeleting = false; timers.initialDelay = setTimeout(() => { isDeleting = true; timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); }, CONFIG.SPEED_DELETE_DELAY); }; 
            const stopDelete = () => { clearTimeout(timers.initialDelay); clearInterval(timers.speedDelete); setTimeout(() => isDeleting = false, 50); }; 
            b.addEventListener('mousedown', startDelete); b.addEventListener('touchstart', startDelete, { passive: true }); b.addEventListener('mouseup', stopDelete); b.addEventListener('mouseleave', stopDelete); b.addEventListener('touchend', stopDelete); b.addEventListener('touchcancel', stopDelete); 
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            if(appSettings.isPracticeModeEnabled) setTimeout(startPracticeRound, 500);
            // Check if gestures enabled
            toggleGestureOverlay(appSettings.isGestureModeEnabled ? true : null);
        });

        // Initialize Mic/Cam Buttons in Header
        document.getElementById('mic-master-btn').onclick = () => { modules.sensor.toggleAudio(!modules.sensor.mode.audio); updateAllChrome(); };
        document.getElementById('camera-master-btn').onclick = () => { modules.sensor.toggleCamera(!modules.sensor.mode.camera); updateAllChrome(); };

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
    } catch (error) { console.error("CRITICAL ERROR:", error); alert("App crashed: " + error.message); }
};
