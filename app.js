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

const DEFAULT_APP = {
    showTimerBtn: false,
    showCounterBtn: false,
    gestureInput: false,
    inputsOnly: false,
    stealthPause: 0.2,
    gestureMappings: {},
    morseMappings: {},
 globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: true, isHapticsEnabled: true, isSpeedDeletingEnabled: true, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, showMicBtn: false, showCamBtn: false, autoInputMode: 'none', activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), isPracticeModeEnabled: false, voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', generalLanguage: 'en' };

const DICTIONARY = {
    'en': { correct: "Correct", wrong: "Wrong", stealth: "Stealth Active", reset: "Reset to Round 1", stop: "Playback Stopped 🛑" },
    'es': { correct: "Correcto", wrong: "Incorrecto", stealth: "Modo Sigilo", reset: "Reiniciar Ronda 1", stop: "Detenido 🛑" }
};

let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));

// Runtime UI state for Timer & Counter
let uiTimer = { running:false, startTime:0, elapsed:0, interval:null };
let uiCounter = { value:0 };

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
            if (typeof appSettings.isUniqueRoundsAutoClearEnabled === 'undefined') appSettings.isUniqueRoundsAutoClearEnabled = true; // Safety default
            
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
    
    // --- MAP LETTERS TO NUMBERS 6-12 ---
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

    // --- SMART LIMIT LOGIC ---
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
            // --- UPDATED UNIQUE AUTOPLAY LOGIC ---
            if (appSettings.isUniqueRoundsAutoClearEnabled) {
                // Strict Game Mode: Play only when round is complete
                if(state.sequences[0].length >= roundNum) { 
                    disableInput(true); 
                    setTimeout(playDemo, 250); 
                } 
            } else {
                // Freeform/Manual Mode: Play after EVERY input (Recorder style)
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
        if(demoBtn) { 
            demoBtn.innerHTML = '▶'; 
            demoBtn.disabled = false; 
        }
        
        // REVERT SETTINGS BUTTON
        settingsBtns.forEach(btn => {
            btn.innerHTML = '⚙️';
            btn.disabled = false;
        });
        
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
    settingsBtns.forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = '■'; 
    });

    isDemoPlaying = true; 
    
    let i = 0; 
    const speed = appSettings.playbackSpeed || 1; 
    const baseInterval = CONFIG.DEMO_DELAY_BASE_MS / speed;
    
    function next() { 
        // SAFETY: Wrap in try/catch to ensure inputs are re-enabled even if logic fails
        try {
            if(!isDemoPlaying) return; 
            
            if(i >= playlist.length) { 
                disableInput(false); 
                isDemoPlaying = false; 
                if(demoBtn) { demoBtn.innerHTML = '▶'; demoBtn.disabled = false; }
                settingsBtns.forEach(btn => {
                    btn.innerHTML = '⚙️';
                    btn.disabled = false;
                });
                
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
            speak(item.val); vibrateMorse(item.val); 
            const seqBoxes = document.getElementById('sequence-container').children; 
            if(seqBoxes[item.machine]) { seqBoxes[item.machine].style.transform = 'scale(1.05)'; setTimeout(() => seqBoxes[item.machine].style.transform = 'scale(1)', 250 / speed); } 
            
            if(demoBtn) demoBtn.innerText = (i + 1);

            let nextDelay = baseInterval;
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
    container.innerHTML = ''; 
    const settings = getProfileSettings();
    const state = getState();

    ['key9', 'key12', 'piano'].forEach(k => { 
        const el = document.getElementById(`pad-${k}`); 
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none'; 
    });

    if(appSettings.isPracticeModeEnabled) {
        if(practiceSequence.length === 0) {
            practiceSequence = [];
            state.currentRound = 1;
            setTimeout(startPracticeRound, 100);
        }
        container.innerHTML = `<h2 class=\"text-2xl font-bold text-center w-full mt-10\" style=\"color:var(--text-main)\">Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span></h2>`; 
        return;
    }

    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    
    // --- VISUAL HEADER FOR ROUNDS (NEW) ---
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
    
    document.querySelectorAll('#mic-master-btn').forEach(btn => { btn.classList.toggle('hidden', !appSettings.showMicBtn); btn.classList.toggle('master-active', modules.sensor && modules.sensor.mode.audio); });
    document.querySelectorAll('#camera-master-btn').forEach(btn => { btn.classList.toggle('hidden', !appSettings.showCamBtn); btn.classList.toggle('master-active', modules.sensor && modules.sensor.mode.camera); });
    document.querySelectorAll('.reset-button').forEach(b => { b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none'; });
}

function toggleBlackout() { 
    blackoutState.isActive = !blackoutState.isActive; 
    document.body.classList.toggle('blackout-active', blackoutState.isActive); 
    
    const layer = document.getElementById('blackout-layer');

    if(blackoutState.isActive) { 
        if(appSettings.isAudioEnabled) speak("Stealth Active"); 
        
        // --- GESTURE TOGGLE CHECK ---
        if (appSettings.isBlackoutGesturesEnabled) {
            // New Gesture Handlers
            layer.addEventListener('touchstart', handleBlackoutGestureStart, {passive: false});
            layer.addEventListener('touchmove', handleBlackoutGestureMove, {passive: false});
            layer.addEventListener('touchend', handleBlackoutGestureEnd, {passive: false});
        } else {
            // Legacy Grid Handler
            layer.addEventListener('touchstart', handleBlackoutTouch, {passive: false}); 
        }

    } else { 
        // Remove ALL possible listeners
        layer.removeEventListener('touchstart', handleBlackoutTouch); 
        layer.removeEventListener('touchstart', handleBlackoutGestureStart);
        layer.removeEventListener('touchmove', handleBlackoutGestureMove);
        layer.removeEventListener('touchend', handleBlackoutGestureEnd);
    } 
}

function handleShake(e) { if(!appSettings.isBlackoutFeatureEnabled) return; const acc = e.acceleration; if(!acc) return; if(Math.hypot(acc.x, acc.y, acc.z) > 15) { const now = Date.now(); if(now - blackoutState.lastShake > 1000) { toggleBlackout(); vibrate(); blackoutState.lastShake = now; } } }

// Legacy Grid-Based Touch System
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

// --- NEW BLACKOUT GESTURE SYSTEM ---
function handleBlackoutGestureStart(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    
    // If it's a new tap sequence (not a multi-touch add-on)
    if (!gestureInputState.startTime || (Date.now() - gestureInputState.startTime > 500)) {
        gestureInputState.maxTouches = e.touches.length;
        gestureInputState.startX = e.touches[0].clientX;
        gestureInputState.startY = e.touches[0].clientY;
        gestureInputState.startTime = Date.now();
    } else {
        // Update max touches if fingers added
        gestureInputState.maxTouches = Math.max(gestureInputState.maxTouches, e.touches.length);
    }
}

function handleBlackoutGestureMove(e) {
    e.preventDefault();
    gestureInputState.maxTouches = Math.max(gestureInputState.maxTouches, e.touches.length);
}

function handleBlackoutGestureEnd(e) {
    e.preventDefault();
    if (e.touches.length > 0) return; // Wait for ALL fingers to lift

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - gestureInputState.startX;
    const diffY = endY - gestureInputState.startY;
    const duration = Date.now() - gestureInputState.startTime;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);
    
    let val = null;

    // TAP DETECTION (Short duration, low movement)
    if (duration < 300 && absX < 30 && absY < 30) {
        if (gestureInputState.maxTouches === 1) {
            // Handle Double Tap Logic
            if (gestureInputState.isTapCandidate) {
                // Double Tap Detected -> 11 (F)
                clearTimeout(timers.tap);
                gestureInputState.isTapCandidate = false;
                val = '11'; // F
            } else {
                gestureInputState.isTapCandidate = true;
                timers.tap = setTimeout(() => {
                    // Single Tap Confirmed -> 5
                    if (gestureInputState.isTapCandidate) {
                        addValue('5'); 
                        vibrateMorse('5');
                        gestureInputState.isTapCandidate = false;
                    }
                }, 250); // Double tap window
                return; // Wait for timer
            }
        } else if (gestureInputState.maxTouches === 2) {
            val = '10'; // E (2-finger tap)
        }
    } 
    // LONG PRESS DETECTION
    else if (duration > 500 && absX < 30 && absY < 30) {
        val = '12'; // G (Long Press)
    }
    // SWIPE DETECTION
    else if (Math.max(absX, absY) > 50) {
        // Determine Direction
        const isHorizontal = absX > absY;
        const isPositive = (isHorizontal ? diffX : diffY) > 0;
        
        // 1-Finger Swipes
        if (gestureInputState.maxTouches === 1) {
            if (!isHorizontal && !isPositive) val = '1'; // Up
            else if (isHorizontal && isPositive) val = '2'; // Right
            else if (!isHorizontal && isPositive) val = '3'; // Down
            else if (isHorizontal && !isPositive) val = '4'; // Left
        } 
        // 2-Finger Swipes
        else if (gestureInputState.maxTouches === 2) {
             if (!isHorizontal && !isPositive) val = 'A'; // 6 (Up)
            else if (isHorizontal && isPositive) val = 'B'; // 7 (Right)
            else if (!isHorizontal && isPositive) val = 'C'; // 8 (Down)
            else if (isHorizontal && !isPositive) val = 'D'; // 9 (Left)
        }
    }

    if (val) {
        addValue(val);
        vibrateMorse(val);
    }
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

function handleStealthActionStart(action) {
    if(!document.body.classList.contains('hide-controls')) return;
    ignoreNextClick = false;
    timers.stealthAction = setTimeout(() => {
        ignoreNextClick = true;
        vibrate();
        if(action === 'play') playDemo();
        if(action === 'backspace') handleBackspace();
        if(action === 'delete') {
             const settings = getProfileSettings();
             const targetIndex = settings.currentMode === CONFIG.MODES.SIMON ? (getState().nextSequenceIndex - 1) % settings.machineCount : 0;
             getState().sequences[targetIndex] = [];
             getState().nextSequenceIndex = 0;
             renderUI(); saveState();
        }
    }, 800); 
}
function handleStealthActionEnd() { if(timers.stealthAction) clearTimeout(timers.stealthAction); }

window.onload = function() {
    try {
        loadState(); initComments(db); if (window.DeviceMotionEvent) window.addEventListener('devicemotion', handleShake, false); const target = document.body;
        target.addEventListener('touchstart', (e) => { if(modules.sensor && modules.sensor.audioCtx && modules.sensor.audioCtx.state === 'suspended') modules.sensor.audioCtx.resume(); 
            if (e.touches.length === 2) { gestureState.isPinching = true; gestureState.startDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); gestureState.startScale = (appSettings.gestureResizeMode === 'sequence') ? (appSettings.uiScaleMultiplier || 1.0) : (appSettings.globalUiScale || 100); } }, { passive: false });
        target.addEventListener('touchmove', (e) => { 
            if (gestureState.isPinching && e.touches.length === 2) { 
                e.preventDefault(); const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); const ratio = dist / gestureState.startDist; 
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

        modules.sensor = new SensorEngine((val) => addValue(val), (msg) => showToast(msg)); if (appSettings.sensorAudioThresh) modules.sensor.setSensitivity('audio', appSettings.sensorAudioThresh); if (appSettings.sensorCamThresh) modules.sensor.setSensitivity('camera', appSettings.sensorCamThresh);
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
            onSave: () => saveState(), onReset: () => { localStorage.clear(); location.reload(); },
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
            onProfileSave: () => { 
                appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings)); 
                saveState(); 
                showToast("Profile Settings Saved 💾"); 
            }
        }, modules.sensor);
        updateAllChrome(); 
        
        if(appSettings.isPracticeModeEnabled) {
            const settingsModal = document.getElementById('settings-modal');
            if(!settingsModal || settingsModal.classList.contains('pointer-events-none')) {
                setTimeout(startPracticeRound, 500);
            }
        }

        document.querySelectorAll('.btn-pad-number, .piano-key-white, .piano-key-black').forEach(btn => {
            if(btn.dataset.value === '1') {
                btn.addEventListener('mousedown', handle1KeyStart); btn.addEventListener('touchstart', handle1KeyStart, {passive: true});
                btn.addEventListener('mouseup', handle1KeyEnd); btn.addEventListener('touchend', handle1KeyEnd); btn.addEventListener('mouseleave', handle1KeyEnd);
            }
            const val = btn.dataset.value;
            if(val === '7' || val === 'C') {
                btn.addEventListener('mousedown', () => handleStealthActionStart('play')); btn.addEventListener('touchstart', () => handleStealthActionStart('play'), {passive: true});
                btn.addEventListener('mouseup', handleStealthActionEnd); btn.addEventListener('touchend', handleStealthActionEnd); btn.addEventListener('mouseleave', handleStealthActionEnd);
            }
            if(val === '8' || val === 'D') {
                btn.addEventListener('mousedown', () => handleStealthActionStart('backspace')); btn.addEventListener('touchstart', () => handleStealthActionStart('backspace'), {passive: true});
                btn.addEventListener('mouseup', handleStealthActionEnd); btn.addEventListener('touchend', handleStealthActionEnd); btn.addEventListener('mouseleave', handleStealthActionEnd);
            }
            if(val === '9' || val === 'E') {
                btn.addEventListener('mousedown', () => handleStealthActionStart('delete')); btn.addEventListener('touchstart', () => handleStealthActionStart('delete'), {passive: true});
                btn.addEventListener('mouseup', handleStealthActionEnd); btn.addEventListener('touchend', handleStealthActionEnd); btn.addEventListener('mouseleave', handleStealthActionEnd);
            }

            btn.addEventListener('click', (e) => {
                if((val === '1' || val === '7' || val === '8' || val === '9' || val === 'C' || val === 'D' || val === 'E') && ignoreNextClick) { ignoreNextClick = false; return; }
                addValue(e.target.dataset.value);
            });
        });
        
        document.querySelectorAll('button[data-action=\"play-demo\"]').forEach(b => { 
            b.addEventListener('click', playDemo); 
            const startLongPress = () => { 
                timers.longPress = setTimeout(() => { 
                    if(appSettings.isLongPressAutoplayEnabled !== false) {
                        appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled; 
                        showToast(`Autoplay: ${appSettings.isAutoplayEnabled?'ON':'OFF'}`); 
                        saveState(); 
                        vibrate(); 
                    }
                }, 500); 
            }; 
            const cancelLong = () => clearTimeout(timers.longPress); 
            b.addEventListener('mousedown', startLongPress); 
            b.addEventListener('touchstart', startLongPress, { passive: true }); 
            b.addEventListener('mouseup', cancelLong); 
            b.addEventListener('mouseleave', cancelLong); 
            b.addEventListener('touchend', cancelLong); 
        });
        
        document.querySelectorAll('button[data-action=\"open-settings\"]').forEach(b => {
             const startSettingsLong = () => {
                 timers.settingsLongPress = setTimeout(() => {
                     vibrate();
                     if(modules.settings) modules.settings.toggleRedeem(true);
                 }, 800);
             };
             const cancelSettingsLong = () => { if(timers.settingsLongPress) clearTimeout(timers.settingsLongPress); };
             
             b.addEventListener('mousedown', startSettingsLong);
             b.addEventListener('touchstart', startSettingsLong, { passive: true });
             b.addEventListener('mouseup', cancelSettingsLong);
             b.addEventListener('mouseleave', cancelSettingsLong);
             b.addEventListener('touchend', cancelSettingsLong);
             
             b.onclick = () => {
                 if(timers.settingsLongPress) clearTimeout(timers.settingsLongPress);
                 if(isDemoPlaying) {
                     playDemo(); 
                     return;
                 }
                 modules.settings.openSettings();
             };
        });

        document.querySelectorAll('button[data-action=\"reset-unique-rounds\"]').forEach(b => b.addEventListener('click', () => { if(confirm("Reset to Round 1?")) resetRounds(); }));
        document.querySelectorAll('button[data-action=\"backspace\"]').forEach(b => { 
            b.addEventListener('click', handleBackspace); 
            const startDelete = (e) => { 
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
            b.addEventListener('mousedown', startDelete); b.addEventListener('touchstart', startDelete, { passive: true }); b.addEventListener('mouseup', stopDelete); b.addEventListener('mouseleave', stopDelete); b.addEventListener('touchend', stopDelete); b.addEventListener('touchcancel', stopDelete); 
        });
        document.querySelectorAll('button[data-action=\"open-share\"]').forEach(b => b.addEventListener('click', () => modules.settings.openShare())); 
        
        document.getElementById('close-settings').addEventListener('click', () => {
            if(appSettings.isPracticeModeEnabled) {
                setTimeout(startPracticeRound, 500);
            }
        });

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
    } catch (error) { console.error("CRITICAL ERROR:", error); alert("App crashed: " + error.message); }
};



// --- Timer & Counter UI wiring (injected) ---
(function(){
    function pad2(n){ return String(n).padStart(2,'0'); }
    function updateTimerLabel() {
        const btn = document.getElementById('timer-btn');
        if(!btn) return;
        const ms = uiTimer.elapsed || 0;
        const m = Math.floor(ms/60000);
        const s = Math.floor((ms%60000)/1000);
        btn.textContent = `⏱️ ${pad2(m)}:${pad2(s)}`;
    }

    function startTimer() {
        if(uiTimer.interval) clearInterval(uiTimer.interval);
        uiTimer.running = true;
        uiTimer.startTime = Date.now() - (uiTimer.elapsed || 0);
        uiTimer.interval = setInterval(function(){
            uiTimer.elapsed = Date.now() - uiTimer.startTime;
            updateTimerLabel();
        }, 250);
    }
    function stopTimer() {
        uiTimer.running = false;
        if(uiTimer.interval) { clearInterval(uiTimer.interval); uiTimer.interval = null; }
    }
    function resetTimer() {
        uiTimer.elapsed = 0;
        uiTimer.startTime = Date.now();
        updateTimerLabel();
    }

    function attachHandlers() {
        const timerBtn = document.getElementById('timer-btn');
        const counterBtn = document.getElementById('counter-btn');
        const micBtn = document.getElementById('mic-btn');
        const camBtn = document.getElementById('cam-btn');

        if(timerBtn) {
            // init label
            updateTimerLabel();
            let longPress = null;
            timerBtn.addEventListener('mousedown', (e)=>{
                longPress = setTimeout(()=>{ resetTimer(); }, 600);
            });
            timerBtn.addEventListener('touchstart', (e)=>{ longPress = setTimeout(()=>{ resetTimer(); }, 600); }, {passive:true});
            timerBtn.addEventListener('mouseup', (e)=>{
                if(longPress) { clearTimeout(longPress); longPress = null; }
                if(!uiTimer.running) startTimer(); else stopTimer();
            });
            timerBtn.addEventListener('touchend', (e)=>{
                if(longPress) { clearTimeout(longPress); longPress = null; }
                if(!uiTimer.running) startTimer(); else stopTimer();
            });
        }

        if(counterBtn) {
            counterBtn.textContent = `#${uiCounter.value || 0}`;
            let longPressC = null;
            counterBtn.addEventListener('mousedown', (e)=>{
                longPressC = setTimeout(()=>{ uiCounter.value = 0; counterBtn.textContent = `#0`; }, 600);
            });
            counterBtn.addEventListener('touchstart', (e)=>{ longPressC = setTimeout(()=>{ uiCounter.value = 0; counterBtn.textContent = `#0`; }, 600); }, {passive:true});
            counterBtn.addEventListener('mouseup', (e)=>{
                if(longPressC) { clearTimeout(longPressC); longPressC = null; }
                uiCounter.value = (uiCounter.value || 0) + 1;
                counterBtn.textContent = `#${uiCounter.value}`;
            });
            counterBtn.addEventListener('touchend', (e)=>{
                if(longPressC) { clearTimeout(longPressC); longPressC = null; }
                uiCounter.value = (uiCounter.value || 0) + 1;
                counterBtn.textContent = `#${uiCounter.value}`;
            });
        }
    }

    function updateTopButtonsVisibility() {
        const timerBtn = document.getElementById('timer-btn');
        const counterBtn = document.getElementById('counter-btn');
        const micBtn = document.getElementById('mic-btn');
        const camBtn = document.getElementById('cam-btn');
        if(!timerBtn && !counterBtn && !micBtn && !camBtn) return;

        try {
            if(window.appSettings && window.appSettings.showTimerBtn) timerBtn && timerBtn.classList.remove('hidden'); else timerBtn && timerBtn.classList.add('hidden');
            if(window.appSettings && window.appSettings.showCounterBtn) counterBtn && counterBtn.classList.remove('hidden'); else counterBtn && counterBtn.classList.add('hidden');
            if(window.appSettings && window.appSettings.showMicBtn) micBtn && micBtn.classList.remove('hidden'); else micBtn && micBtn.classList.add('hidden');
            if(window.appSettings && window.appSettings.showCamBtn) camBtn && camBtn.classList.remove('hidden'); else camBtn && camBtn.classList.add('hidden');
        } catch(e){ console.warn('updateTopButtonsVisibility error', e); }
    }

    // Hook into existing renderUI if present
    const originalRender = window.renderUI;
    window.renderUI = function(){
        try { if(typeof originalRender === 'function') originalRender(); } catch(e){ console.error(e); }
        updateTopButtonsVisibility();
    };

    // Initialize on DOM ready
    function init() {
        attachHandlers();
        updateTopButtonsVisibility();
        // connect to settings manager if present to persist button visibility toggles
        if(window.settingsManager && window.appSettings) {
            const t = document.getElementById('timer-toggle');
            const c = document.getElementById('counter-toggle');
            if(t) { t.checked = !!window.appSettings.showTimerBtn; t.onchange = ()=>{ window.appSettings.showTimerBtn = t.checked; if(window.settingsManager.callbacks && window.settingsManager.callbacks.onSave) settingsManager.callbacks.onSave(); updateTopButtonsVisibility(); } }
            if(c) { c.checked = !!window.appSettings.showCounterBtn; c.onchange = ()=>{ window.appSettings.showCounterBtn = c.checked; if(window.settingsManager.callbacks && window.settingsManager.callbacks.onSave) settingsManager.callbacks.onSave(); updateTopButtonsVisibility(); } }
        }
    }

    if(document.readyState === 'interactive' || document.readyState === 'complete') setTimeout(init,50);
    else document.addEventListener('DOMContentLoaded', init);
})(); 


// --- Gesture input, stealth settings, practice start, and unique rounds fixes (injection) ---
(function(){
    // Default gesture/morse mappings as requested
    const DEFAULT_GESTURE_MAPPINGS = {
        '9key': {
            1: 'tap', 2: 'doubletap', 3: 'longtap', 4: 'tap2', 5: 'doubletap2', 6: 'longtap2',
            7: 'tap3', 8: 'doubletap3', 9: 'longtap3'
        },
        '12key': {
            1: 'swipeleft',2:'swipedown',3:'swipeup',4:'swiperight',5:'swipeleft2',6:'swipedown2',
            7:'swipeup2',8:'swiperight2',9:'swipeleft3',10:'swipedown3',11:'swipeup3',12:'swiperight3'
        },
        'piano': {
            1:'swipeleft2',2:'swipeup2left',3:'swipeup2',4:'swipeupright2',5:'swiperight2',
            'C':'swipeup2left','D':'swipeleft2','E':'swipeup2right','F':'swipedown2','G':'swipedownright2',
            'A':'swiperight2','B':'swipeupright2'
        }
    };
    const DEFAULT_MORSE = {
        '9key': {1:'.',2:'..',3:'...',4:'-',5:'-.',6:'-..',7:'--',8:'--.',9:'---'},
        '12key': {1:'.',2:'..',3:'...',4:'...-',5:'-',6:'-.',7:'-..',8:'-.-',9:'--',10:'--.',11:'--..',12:'---'},
        'piano': {1:'-',2:'-.',3:'--',4:'-..',5:'-.-','C':'.','D':'..','E':'.-','F':'...','G':'..-','A':'.-.','B':'.--'}
    };

    // Ensure appSettings have defaults
    if(window.appSettings) {
        window.appSettings.gestureMappings = window.appSettings.gestureMappings || DEFAULT_GESTURE_MAPPINGS;
        window.appSettings.morseMappings = window.appSettings.morseMappings || DEFAULT_MORSE;
        if(typeof window.appSettings.gestureInput === 'undefined') window.appSettings.gestureInput = false;
        if(typeof window.appSettings.inputsOnly === 'undefined') window.appSettings.inputsOnly = false;
        if(typeof window.appSettings.stealthPause === 'undefined') window.appSettings.stealthPause = 0.2;
    }

    // Triple 3-finger tap toggles gestureInput on main screen
    (function(){
        let lastTaps = [];
        function onTouchStart(e){
            if(!e.touches) return;
            const touchCount = e.touches.length;
            const now = Date.now();
            if(touchCount === 3) {
                lastTaps.push(now);
                // keep last 6 times
                if(lastTaps.length>6) lastTaps.shift();
                // check for triple taps within 800ms total and each separated <400ms
                if(lastTaps.length>=3) {
                    const a = lastTaps.slice(-3);
                    if(a[2]-a[0] < 800) {
                        // toggle
                        window.appSettings.gestureInput = !window.appSettings.gestureInput;
                        if(window.renderUI) renderUI();
                        // clear taps to avoid double toggle
                        lastTaps = [];
                    }
                }
            }
        }
        document.addEventListener('touchstart', onTouchStart, {passive:true});
    })();

    // Gesture pad capture (rudimentary): map simple swipes and taps to values using appSettings.gestureMappings
    (function(){
        const pad = document.getElementById('gesture-pad');
        if(!pad) return;
        pad.style.touchAction = 'none';
        let startX=0,startY=0,startT=0,startTouches=0,tapCount=0;
        pad.addEventListener('touchstart', (e)=>{
            const t = e.touches[0];
            startX = t.clientX; startY = t.clientY; startT = Date.now();
            startTouches = e.touches.length;
            tapCount = (e.detail && e.detail.tapCount) ? e.detail.tapCount : 1;
        }, {passive:true});
        pad.addEventListener('touchend', (e)=>{
            const t = e.changedTouches[0];
            const dx = t.clientX - startX; const dy = t.clientY - startY;
            const dt = Date.now() - startT;
            let gesture = null;
            const absx = Math.abs(dx), absy=Math.abs(dy);
            if(absx<20 && absy<20 && dt<300) {
                // tap type based on number of touches and dt
                if(startTouches===1) gesture = 'tap';
                else if(startTouches===2) gesture = 'tap2';
                else if(startTouches===3) gesture = 'tap3';
            } else {
                // swipe
                if(absx>absy) {
                    if(dx>0) gesture = 'swiperight' + (startTouches>1?startTouches:'');
                    else gesture = 'swipeleft' + (startTouches>1?startTouches:'');
                } else {
                    if(dy>0) gesture = 'swipedown' + (startTouches>1?startTouches:'');
                    else gesture = 'swipeup' + (startTouches>1?startTouches:'');
                }
            }
            if(gesture) {
                // Map gesture to value depending on current input type
                const settings = window.appSettings || {};
                const inputType = (settings.runtimeSettings && settings.runtimeSettings.currentInput) || 'key9';
                // normalize key names
                const mapKey = (inputType==='piano')? 'piano' : (inputType==='piano' || inputType==='key12' || inputType==='key9') ? ((inputType==='key12')?'12key':'9key') : '9key';
                const gm = settings.gestureMappings && settings.gestureMappings[mapKey];
                if(gm) {
                    // find key matching gesture string exactly or endsWith
                    for(const k in gm) {
                        if(gm[k] === gesture) {
                            // dispatch value k to addValue
                            if(window.addValue) addValue(gm[k] && isNaN(k) ? k : Number(k));
                            break;
                        }
                    }
                }
            }
        }, {passive:true});
    })();

    // Practice start overlay behavior
    (function(){
        const startBtn = document.getElementById('practice-start-button');
        const overlay = document.getElementById('practice-start-overlay');
        function updatePracticeStartVisibility() {
            if(!startBtn) return;
            const isPractice = window.appSettings && window.appSettings.isPracticeModeEnabled;
            const settingsModal = document.getElementById('settings-modal');
            // Only show when practice mode enabled and settings modal is closed and no demo playing
            if(isPractice && (!settingsModal || settingsModal.classList.contains('pointer-events-none')) ) {
                startBtn.classList.remove('hidden');
            } else {
                startBtn.classList.add('hidden');
            }
        }
        startBtn && startBtn.addEventListener('click', ()=>{
            startBtn.classList.add('hidden');
            // start practice
            if(window.startPracticeRound) startPracticeRound();
        });
        // hook into renderUI
        const oldRender = window.renderUI;
        window.renderUI = function(){
            try { if(oldRender) oldRender(); } catch(e) {}
            try { updatePracticeStartVisibility(); } catch(e) {}
        };
        document.addEventListener('DOMContentLoaded', updatePracticeStartVisibility);
    })();

    // Small fix attempt for unique rounds autoplay issues:
    (function(){
        // Wrap original startPracticeRound / playPracticeSequence to ensure autoplay only fires when a round begins
        if(window.startPracticeRound) {
            const origStart = window.startPracticeRound;
            window.startPracticeRound = function(){
                // set a flag marking that a manual round start is occurring
                window._manualRoundStart = true;
                origStart();
                setTimeout(()=>{ window._manualRoundStart = false; }, 2000);
            };
        }
        // Patch addValue to avoid immediate autoplay when in unique mode; only allow autoplay when round completes
        if(window.addValue) {
            const origAdd = window.addValue;
            window.addValue = function(value){
                try {
                    const settings = (window.appSettings && window.appSettings.runtimeSettings) || {};
                    const isUnique = settings.currentMode === 'unique';
                    // If unique rounds and autoplay is enabled, only call original addValue and do not auto-play sequence here
                    origAdd(value);
                    // nothing else; rely on startPracticeRound flow to manage autoplay
                } catch(e){ console.error('patched addValue error', e); origAdd(value); }
            };
        }
    })();

})();

