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

const DEFAULT_APP = { globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: true, isHapticsEnabled: true, isSpeedDeletingEnabled: true, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, showMicBtn: false, showCamBtn: false, autoInputMode: 'none', activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), isPracticeModeEnabled: false, voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', generalLanguage: 'en', isGestureInputEnabled: false, gestureMappings: {} };

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
        // start long-press timer
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
        if(mapResult !== null) {
            addValue(mapResult);
        }
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
    for(let i=1;i<=12;i++){
        const k12 = 'k12_' + i;
        if(gm['k12_' + i] && gm['k12_' + i].gesture === kind) return i;
    }
    for(let i=1;i<=9;i++){
        const k9 = 'k9_' + i;
        if(gm['k9_' + i] && gm['k9_' + i].gesture === kind) return i;
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

    // --- Gesture pad show/hide ---
    try {
        const gpWrap = document.getElementById('gesture-pad-wrapper');
        if (gpWrap) {
            if (appSettings.isGestureInputEnabled) {
                gpWrap.classList.remove('hidden');
                if (!window.__gesturePadInited) {
                    initGesturePad();
                    window.__gesturePadInited = true;
                }
            } else {
                gpWrap.classList.add('hidden');
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
            onSave: () => saveState(), onSettingsChanged: () => { renderUI(); if(window.updateHelpMappings) updateHelpMappings(); }, onReset: () => { localStorage.clear(); location.reload(); },
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
                       /* ================================
                       GESTURE SYSTEM — CORE ENGINE
                       ================================ */
                       
                       // ----- Defaults -----
                       appSettings.generalGestures ??= [
                       { name: "Toggle Settings", action: "toggleSettings", gesture: null },
                       { name: "Toggle Practice", action: "togglePractice", gesture: null },
                       { name: "Toggle Gesture Input", action: "toggleGestures", gesture: null }
                       ];
                       
                       // ----- Action execution -----
                       function executeGestureAction(action) {
                       switch (action) {
                       case "toggleSettings":
                       document.getElementById("settings-modal")
                       ?.classList.toggle("hidden");
                       break;
                       
                       case "togglePractice":
                       appSettings.isPracticeModeEnabled =
                       !appSettings.isPracticeModeEnabled;
                       break;
                       
                       case "toggleGestures":
                       appSettings.isGestureInputEnabled =
                       !appSettings.isGestureInputEnabled;
                       break;
                       }
                       }
                       
                       // ----- Gesture normalization -----
                       function normalizeGesture(points) {
                       if (!points || points.length < 5) return null;
                       let sig = [];
                       for (let i = 1; i < points.length; i++) {
                       const dx = points[i].x - points[i - 1].x;
                       const dy = points[i].y - points[i - 1].y;
                       sig.push(
                       Math.abs(dx) > Math.abs(dy)
                       ? (dx > 0 ? "R" : "L")
                       : (dy > 0 ? "D" : "U")
                       );
                       }
                       return sig.join("");
                       }
                       
                       // ----- Similarity score -----
                       function gestureSimilarity(a, b) {
                       if (!a || !b) return 0;
                       let matches = 0;
                       const len = Math.min(a.length, b.length);
                       for (let i = 0; i < len; i++) {
                       if (a[i] === b[i]) matches++;
                       }
                       return matches / Math.max(a.length, b.length);
                       }
                       
                       // ----- Character typing -----
                       function gestureTypeCharacter(char) {
                       if (!char) return;
                       if (typeof handleInput === "function") {
                       handleInput(char);
                       }
                       }
                       
                       // ----- Gesture handler (FINAL PIPELINE) -----
                       function handleCompletedGesture(points) {
                       const sig = normalizeGesture(points);
                       if (!sig) return;
                       
                       let best = { score: 0, action: null, char: null };
                       
                       // Global actions
                       (appSettings.generalGestures || []).forEach(g => {
                       if (!g.gesture) return;
                       const score = gestureSimilarity(
                       sig,
                       normalizeGesture(g.gesture)
                       );
                       if (score > best.score) {
                       best = { score, action: g.action, char: null };
                       }
                       });
                       
                       // Character gestures (per input mode)
                       const mode = currentInputMode;
                       const map = appSettings.mappings?.[mode] || {};
                       Object.values(map).forEach(entry => {
                       if (!entry?.gesture) return;
                       const score = gestureSimilarity(
                       sig,
                       normalizeGesture(entry.gesture)
                       );
                       if (score > best.score) {
                       best = { score, action: null, char: entry.value || entry };
                       }
                       });
                       
                       if (best.score > 0.6) {
                       if (best.action) {
                       executeGestureAction(best.action);
                       showGestureFeedback?.(best.action);
                       } else if (best.char) {
                       gestureTypeCharacter(best.char);
                       showGestureFeedback?.(best.char);
                       }
                       }
                       }
/* ================================
   GESTURE FEEDBACK GLUE
   ================================ */

function showGestureFeedback(text) {
  const el = document.getElementById("gesture-feedback");
  if (!el) return;

  el.textContent = text;
  el.classList.remove("hidden");
  el.classList.add("show");

  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.classList.remove("show");
    el.classList.add("hidden");
  }, 700);
      }
