import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS } from './settings.js';
import { initComments } from './comments.js';

const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CONFIG ---
const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v49', STORAGE_KEY_STATE: 'followMeAppState_v49', INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } };

const DEFAULT_PROFILE_SETTINGS = { currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, simonChunkSize: 40, simonInterSequenceDelay: 0 };
const PREMADE_PROFILES = { 'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 40, simonInterSequenceDelay: 0 }, theme: 'default' }, 'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }};

const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, 
    isAudioEnabled: false, isHapticsEnabled: true, isFlashEnabled: true, pauseSetting: 'none',
    isSpeedDeletingEnabled: true, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', 
    showTimer: false, showCounter: false,
    // --- NEW TOGGLES ---
    isAutoTimerEnabled: false, isAutoCounterEnabled: false,
    isSpeedGesturesEnabled: false, isVolumeGesturesEnabled: false,
    isDeleteGestureEnabled: false, isClearGestureEnabled: false,
    // -------------------
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
let blackoutState = { isActive: false, lastShake: 0 }; 
let isDeleting = false; 
let isDemoPlaying = false;
let isPlaybackPaused = false;
let playbackResumeCallback = null;
let practiceSequence = [];
let practiceInputIndex = 0;
let ignoreNextClick = false;
let isGesturePadVisible = true;

// --- TIMER/COUNTER GLOBALS ---
let simpleTimer = { interval: null, startTime: 0, elapsed: 0, isRunning: false };
let simpleCounter = 0;

const getProfileSettings = () => appSettings.runtimeSettings;
const getState = () => appState['current_session'] || (appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 });
function saveState() { localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState)); }

function loadState() { 
    try { 
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS); 
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE); 
        if(s) { 
            const loaded = JSON.parse(s); 
            // Merge defaults to ensure new flags exist
            appSettings = { ...DEFAULT_APP, ...loaded, profiles: { ...DEFAULT_APP.profiles, ...(loaded.profiles || {}) }, customThemes: { ...DEFAULT_APP.customThemes, ...(loaded.customThemes || {}) } }; 
            
            // Safety checks for undefined values
            const bools = ['isHapticsEnabled','isSpeedDeletingEnabled','isLongPressAutoplayEnabled','isUniqueRoundsAutoClearEnabled','showTimer','showCounter','isAutoTimerEnabled','isAutoCounterEnabled','isSpeedGesturesEnabled','isVolumeGesturesEnabled','isDeleteGestureEnabled','isClearGestureEnabled'];
            bools.forEach(b => { if (typeof appSettings[b] === 'undefined') appSettings[b] = DEFAULT_APP[b]; });

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
    if(isNaN(num)) { const map = { 'A':6, 'B':7, 'C':8, 'D':9, 'E':10, 'F':11, 'G':12 }; num = map[val.toUpperCase()] || 0; }
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

// --- GESTURE PAD LOGIC (UPDATED) ---
function initGesturePad() {
    const pad = document.getElementById('gesture-pad');
    const indicator = document.getElementById('gesture-indicator');
    if(!pad) return;

    let state = {
        startX: 0, startY: 0,
        startTime: 0,
        maxTouches: 0,
        tapCount: 0,
        tapTimer: null,
        longPressTimer: null,
        isLongPressTriggered: false,
        // New Rotation/ZigZag State
        startAngle: 0,
        lastAngle: 0,
        accRotation: 0,
        lastX: 0,
        direction: 0, // 0: none, 1: right, -1: left
        reversals: 0,
        startPinchDist: 0,
        isActionTriggered: false
    };

    const getFingerSuffix = (n) => (n >= 3 ? '_3f' : n === 2 ? '_2f' : '');
    
    // Helper: Angle between two points (degrees)
    const getAngle = (p1, p2) => Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * 180 / Math.PI;
    
    // Helper: Distance between two points
    const getDist = (p1, p2) => Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2));

    pad.addEventListener('touchstart', (ev) => {
        ev.preventDefault();
        const t = ev.touches;
        if(t.length === 0) return;

        // Reset if starting fresh
        if (!state.startTime || (Date.now() - state.startTime > 400 && state.tapCount === 0)) {
            state.startX = t[0].clientX;
            state.startY = t[0].clientY;
            state.startTime = Date.now();
            state.maxTouches = t.length;
            state.isLongPressTriggered = false;
            state.isActionTriggered = false;
            
            // ZigZag Init
            state.lastX = t[0].clientX;
            state.direction = 0;
            state.reversals = 0;

            // Rotation Init
            if (t.length >= 2) {
                state.startAngle = getAngle(t[0], t[1]);
                state.lastAngle = state.startAngle;
                state.accRotation = 0;
            }

            // Pinch Init (Boss Mode)
            if (t.length === 4) {
                 // Average distance from centroid could be used, but simple width check works
                 state.startPinchDist = Math.abs(t[0].clientX - t[3].clientX) + Math.abs(t[0].clientY - t[3].clientY);
            }

            clearTimeout(state.longPressTimer);
            state.longPressTimer = setTimeout(() => {
                if(!state.isActionTriggered && state.maxTouches < 2) { // Only single finger long press
                    state.isLongPressTriggered = true;
                    handleGesture('long_tap');
                }
            }, 600);
        } else {
            state.maxTouches = Math.max(state.maxTouches, t.length);
            if(t.length >= 2 && !state.isActionTriggered) {
                state.startAngle = getAngle(t[0], t[1]);
                state.lastAngle = state.startAngle;
            }
             if (t.length === 4) {
                 state.startPinchDist = Math.abs(t[0].clientX - t[3].clientX) + Math.abs(t[0].clientY - t[3].clientY);
            }
        }
    }, {passive: false});

    pad.addEventListener('touchmove', (ev) => {
        ev.preventDefault();
        const t = ev.touches;
        state.maxTouches = Math.max(state.maxTouches, t.length);

        // --- BOSS MODE (4-Finger Pinch) ---
        if (t.length === 4) {
            const currentDist = Math.abs(t[0].clientX - t[3].clientX) + Math.abs(t[0].clientY - t[3].clientY);
            if (state.startPinchDist > 0 && currentDist < state.startPinchDist * 0.6) {
                // Pinched in significantly
                 if (!state.isActionTriggered && appSettings.isBlackoutFeatureEnabled) {
                     state.isActionTriggered = true;
                     toggleBossMode();
                 }
            }
            return;
        }

        // --- SPEED/VOLUME GESTURES (Twist) ---
        if ((t.length === 2 && appSettings.isSpeedGesturesEnabled) || (t.length === 3 && appSettings.isVolumeGesturesEnabled)) {
            const currentAngle = getAngle(t[0], t[1]);
            let delta = currentAngle - state.lastAngle;
            
            // Handle wrap-around (180 to -180)
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;

            state.accRotation += delta;
            state.lastAngle = currentAngle;

            // Trigger every 15 degrees
            if (Math.abs(state.accRotation) > 15) {
                state.isActionTriggered = true;
                const isCW = state.accRotation > 0;
                
                if (t.length === 2) {
                    // Speed
                    let spd = appSettings.playbackSpeed || 1.0;
                    if (isCW) spd = Math.min(2.0, spd + 0.05);
                    else spd = Math.max(0.5, spd - 0.05);
                    appSettings.playbackSpeed = spd;
                    showToast(`Speed: ${Math.round(spd*100)}%`);
                } else {
                    // Volume
                    let vol = appSettings.voiceVolume || 1.0;
                    if (isCW) vol = Math.min(1.0, vol + 0.05);
                    else vol = Math.max(0.0, vol - 0.05);
                    appSettings.voiceVolume = vol;
                    showToast(`Volume: ${Math.round(vol*100)}%`);
                }
                
                // Reset accum but keep remainder to smooth
                state.accRotation = 0;
                // Save settings (debounce usually better, but for now just update memory)
                if(modules.settings) modules.settings.updateUIFromSettings();
                saveState();
            }
            clearTimeout(state.longPressTimer);
            return;
        }

        // --- DELETE/CLEAR GESTURES (Zig-Zag) ---
        if (t.length === 1 && (appSettings.isDeleteGestureEnabled || appSettings.isClearGestureEnabled)) {
            const cx = t[0].clientX;
            const dx = cx - state.lastX;
            
            // Noise threshold
            if (Math.abs(dx) > 10) {
                const newDir = dx > 0 ? 1 : -1;
                if (state.direction !== 0 && newDir !== state.direction) {
                    state.reversals++;
                    vibrate(); // Slight feedback on reversal
                }
                state.direction = newDir;
                state.lastX = cx;

                // Check triggers
                // L-R-L (3) or L-R-L-R (4) -> Delete
                if (appSettings.isDeleteGestureEnabled && !state.isActionTriggered && state.reversals >= 3 && state.reversals < 5) {
                     // We don't trigger immediately, we wait for lift OR ensure it's not a Clear gesture
                }
                
                // 5+ Reversals -> Clear
                if (appSettings.isClearGestureEnabled && !state.isActionTriggered && state.reversals >= 6) {
                    state.isActionTriggered = true;
                    handleClearSequence();
                }
            }
            
            // Cancel long press on movement
            if (Math.abs(t[0].clientX - state.startX) > 20 || Math.abs(t[0].clientY - state.startY) > 20) {
                 clearTimeout(state.longPressTimer);
            }
        }

    }, {passive: false});

    pad.addEventListener('touchend', (ev) => {
        ev.preventDefault();
        if (ev.touches.length > 0) return; // Wait for last finger

        clearTimeout(state.longPressTimer);
        
        // Handle Zig-Zag End (Delete)
        if (!state.isActionTriggered && appSettings.isDeleteGestureEnabled && state.reversals >= 3) {
            handleBackspace(null);
            state.reversals = 0;
            return;
        }

        if (state.isActionTriggered || state.isLongPressTriggered) return;

        // Normal Tap Logic
        const t = ev.changedTouches[0];
        const dx = t.clientX - state.startX;
        const dy = t.clientY - state.startY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const suffix = getFingerSuffix(state.maxTouches);

        if (dist > 30) {
            // Swipe
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
            handleGesture(get8WayDirection(dx, dy) + suffix);
        } else {
            // Tap
            state.tapCount++;
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

// Fixed mapping function
function mapGestureToValue(kind, currentInput) {
    const gm = appSettings.gestureMappings || {};
    if(currentInput === CONFIG.INPUTS.PIANO) {
        for(const k in gm) if(k.startsWith('piano_') && gm[k].gesture === kind) return k.replace('piano_','');
        return null;
    }
    if(currentInput === CONFIG.INPUTS.KEY12) {
        for(let i=1; i<=12; i++) if(gm['k12_' + i] && gm['k12_' + i].gesture === kind) return i;
        return null;
    }
    if(currentInput === CONFIG.INPUTS.KEY9) {
        for(let i=1; i<=9; i++) if(gm['k9_' + i] && gm['k9_' + i].gesture === kind) return i;
        return null;
    }
    return null;
}

function toggleBossMode() {
    blackoutState.isActive = !blackoutState.isActive;
    document.body.classList.toggle('blackout-active', blackoutState.isActive);
    showToast(blackoutState.isActive ? "Boss Mode 🌑" : "Welcome Back");
    vibrate();
}

// --- TIMER / COUNTER LOGIC ---
const updateTimerDisplay = () => {
    const headerTimer = document.getElementById('header-timer-btn');
    if(!headerTimer) return;
    const now = Date.now();
    const diff = now - simpleTimer.startTime + simpleTimer.elapsed;
    const totalSec = Math.floor(diff / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    headerTimer.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
};

function startAutoTimer() {
    if (simpleTimer.isRunning) return;
    simpleTimer.startTime = Date.now();
    simpleTimer.interval = setInterval(updateTimerDisplay, 100);
    simpleTimer.isRunning = true;
}

function stopAndResetTimer() {
    clearInterval(simpleTimer.interval);
    simpleTimer.isRunning = false;
    simpleTimer.elapsed = 0;
    const headerTimer = document.getElementById('header-timer-btn');
    if(headerTimer) headerTimer.textContent = "00:00";
}

function updateCounterDisplay() {
    const headerCounter = document.getElementById('header-counter-btn');
    if(headerCounter) headerCounter.textContent = simpleCounter;
}

// --- CORE APP LOGIC ---

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

function addValue(value) {
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings();
    
    // --- Auto Timer/Counter Logic ---
    // Check if this is the very first input of the session (all sequences empty)
    let isFirstInput = true;
    for (let seq of state.sequences) { if(seq && seq.length > 0) isFirstInput = false; }
    
    if (isFirstInput) {
        if (appSettings.isAutoTimerEnabled) {
            stopAndResetTimer();
            startAutoTimer();
        }
        if (appSettings.isAutoCounterEnabled) {
            simpleCounter++;
            updateCounterDisplay();
        }
    }

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
    
    // Check if empty to stop Auto Timer
    let isEmpty = true;
    for (let seq of state.sequences) { if(seq && seq.length > 0) isEmpty = false; }
    if (isEmpty && appSettings.isAutoTimerEnabled) {
        clearInterval(simpleTimer.interval);
        simpleTimer.isRunning = false;
        // We don't reset to 00:00 immediately, we leave it frozen so user can see time
    }

    renderUI(); 
    saveState(); 
}

function handleClearSequence() {
    const state = getState();
    state.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []);
    state.nextSequenceIndex = 0;
    
    if(appSettings.isAutoTimerEnabled) stopAndResetTimer();
    
    renderUI();
    saveState();
    showToast("Cleared");
    vibrate();
}

function renderUI() {
    const container = document.getElementById('sequence-container'); 
    try {
        const gpWrap = document.getElementById('gesture-pad-wrapper');
        if (gpWrap) {
            if (!appSettings.isGestureInputEnabled) isGesturePadVisible = true;
            if (appSettings.isGestureInputEnabled && isGesturePadVisible) {
                document.body.classList.add('input-gestures-mode'); 
                gpWrap.classList.remove('hidden');
                if (!window.__gesturePadInited) { initGesturePad(); window.__gesturePadInited = true; }
            } else { 
                document.body.classList.remove('input-gestures-mode'); 
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
        const header = document.createElement('h2');
        header.className = "text-2xl font-bold text-center w-full mt-10 mb-8";
        header.style.color = "var(--text-main)";
        header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span>`;
        container.appendChild(header);

        if(practiceSequence.length === 0) { 
            state.currentRound = 1; 
            const btn = document.createElement('button');
            btn.textContent = "START";
            btn.className = "w-48 h-48 rounded-full bg-green-600 hover:bg-green-500 text-white text-3xl font-bold shadow-[0_0_40px_rgba(22,163,74,0.5)] transition-all transform hover:scale-105 active:scale-95 animate-pulse";
            btn.onclick = () => { btn.style.display = 'none'; startPracticeRound(); };
            container.appendChild(btn);
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
    if(hMic) hMic.classList.toggle('header-btn-active', modules.sensor && modules.sensor.mode.audio);
    if(hCam) hCam.classList.toggle('header-btn-active', modules.sensor && modules.sensor.mode.camera);
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
    
    let seqsToPlay = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    const chunkSize = settings.simonChunkSize || 3;
    let chunks = [];
    let maxLen = 0;
    seqsToPlay.forEach(s => { if(s.length > maxLen) maxLen = s.length; });
    
    for(let i=0; i<maxLen; i+=chunkSize) {
        for(let m=0; m<seqsToPlay.length; m++) {
            const seq = seqsToPlay[m];
            if(i < seq.length) chunks.push({ machine: m, nums: seq.slice(i, i+chunkSize), isNewRound: (m===0 && i===0 && chunks.length===0) });
        }
    }

    let cIdx = 0;
    let totalCount = 0; 
    const schedule = (fn, delay) => {
        setTimeout(() => {
            if(!isDemoPlaying) return; 
            if(isPlaybackPaused) { playbackResumeCallback = fn; } else { fn(); }
        }, delay);
    };

    function nextChunk() {
        if(!isDemoPlaying) { if(playBtn) playBtn.textContent = "▶"; return; }
        if(cIdx >= chunks.length) { 
            isDemoPlaying = false; 
            if(playBtn) playBtn.textContent = "▶";
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
               setTimeout(() => {
                   if(!isDemoPlaying) {
                       state.currentRound++;
                       state.sequences[0] = [];
                       state.nextSequenceIndex = 0;
                       if(appSettings.isAutoTimerEnabled) stopAndResetTimer();
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
            if(!isDemoPlaying) { if(playBtn) playBtn.textContent = "▶"; return; }
            if(nIdx >= chunk.nums.length) { cIdx++; schedule(nextChunk, machineDelay); return; }
            const val = chunk.nums[nIdx];
            totalCount++; 
            if(playBtn) playBtn.textContent = totalCount;
            const btn = document.querySelector(`#pad-${settings.currentInput} button[data-value="${val}"]`);
            if(btn) { btn.classList.add('flash-active'); setTimeout(() => btn.classList.remove('flash-active'), 250/speed); }
            speak(val);
            if(appSettings.isHapticMorseEnabled) vibrateMorse(val);
            nIdx++;
            schedule(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}

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
        onReset: () => { localStorage.clear(); location.reload(); },
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
        onProfileRename: (name) => { if(appSettings.profiles[appSettings.activeProfileId]) { appSettings.profiles[appSettings.activeProfileId].name = name; saveState(); } },
        onProfileDelete: () => { 
            if(Object.keys(appSettings.profiles).length > 1) { 
                delete appSettings.profiles[appSettings.activeProfileId]; 
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0]; 
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings)); 
                saveState(); 
                renderUI(); 
            } else { alert("Must keep one profile."); } 
        },
        onProfileSave: () => { if(appSettings.profiles[appSettings.activeProfileId]) { appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings)); saveState(); alert("Profile Saved!"); } }
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

    updateAllChrome();
    initComments(db);
    modules.settings.updateHeaderVisibility();
    initGlobalListeners();
    
    if (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') { modules.sensor.toggleAudio(true); }
    if (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') { modules.sensor.toggleCamera(true); }
    renderUI();
};

function initGlobalListeners() {
    try {
        let pinchStartDist = 0; let pinchStartGlobal = 100; let pinchStartSeq = 1.0;
        
        document.body.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                pinchStartDist = Math.sqrt(dx * dx + dy * dy);
                pinchStartGlobal = appSettings.globalUiScale || 100;
                pinchStartSeq = appSettings.uiScaleMultiplier || 1.0;
            }
        }, { passive: false });

        document.body.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && pinchStartDist > 0 && !appSettings.isSpeedGesturesEnabled) {
                if(e.cancelable) e.preventDefault(); 
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ratio = dist / pinchStartDist;
                const mode = appSettings.gestureResizeMode || 'global';
                if (mode === 'sequence') {
                    let newScale = pinchStartSeq * ratio;
                    newScale = Math.min(2.5, Math.max(0.5, newScale));
                    appSettings.uiScaleMultiplier = newScale;
                    renderUI();
                } else {
                    let newScale = pinchStartGlobal * ratio;
                    newScale = Math.min(200, Math.max(50, newScale));
                    appSettings.globalUiScale = newScale;
                    updateAllChrome();
                }
            }
        }, { passive: false });

        document.body.addEventListener('touchend', (e) => {
            if (e.touches.length < 2 && pinchStartDist > 0) {
                pinchStartDist = 0;
                saveState(); 
                if(modules.settings) modules.settings.updateUIFromSettings();
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
            b.addEventListener('click', () => {
                if(confirm("Reset Round Counter to 1?")) {
                    const s = getState(); s.currentRound = 1; s.sequences[0] = []; s.nextSequenceIndex = 0;
                    if(appSettings.isAutoTimerEnabled) stopAndResetTimer();
                    renderUI(); saveState(); showToast("Reset to Round 1");
                }
            });
        });

        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
            b.addEventListener('click', () => {
                if(isDemoPlaying) { isDemoPlaying = false; const pb = document.querySelector('button[data-action="play-demo"]'); if(pb) pb.textContent = "▶"; showToast("Playback Stopped 🛑"); return; }
                modules.settings.openSettings();
            });
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
                timers.initialDelay = setTimeout(() => { 
                    isDeleting = true; 
                    timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); 
                }, CONFIG.SPEED_DELETE_DELAY); 
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

        // Shake for Gesture Pad Toggle
        let lastX=0, lastY=0, lastZ=0;
        window.addEventListener('devicemotion', (e) => {
            if(!appSettings.isGestureInputEnabled) return;
            const acc = e.accelerationIncludingGravity;
            if(!acc) return;
            const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
            if(delta > 25) { 
                const now = Date.now();
                if(now - blackoutState.lastShake > 1000) {
                    isGesturePadVisible = !isGesturePadVisible;
                    renderUI(); 
                    if(isGesturePadVisible) showToast("Gestures Active 👆"); else showToast("Standard Controls 📱");
                    blackoutState.lastShake = now;
                }
            }
            lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        });
        
        // Tap 5 times to exit blackout (Backup method)
        const bl = document.getElementById('blackout-layer');
        if(bl) {
             let taps = 0;
             bl.addEventListener('touchstart', (e) => {
                 taps++;
                 if(taps > 4) {
                     blackoutState.isActive = false;
                     document.body.classList.remove('blackout-active');
                     taps = 0;
                 }
                 setTimeout(()=>taps=0, 1000);
             });
        }
        
        const headerTimer = document.getElementById('header-timer-btn');
        const headerCounter = document.getElementById('header-counter-btn');
        const headerMic = document.getElementById('header-mic-btn');
        const headerCam = document.getElementById('header-cam-btn');
        
        if(headerTimer) {
            headerTimer.textContent = "00:00"; 
            headerTimer.style.fontSize = "0.75rem"; 
            const toggleTimer = () => {
                if(simpleTimer.isRunning) { clearInterval(simpleTimer.interval); simpleTimer.elapsed += Date.now() - simpleTimer.startTime; simpleTimer.isRunning = false; } 
                else { simpleTimer.startTime = Date.now(); simpleTimer.interval = setInterval(updateTimerDisplay, 100); simpleTimer.isRunning = true; }
                vibrate();
            };
            const resetTimer = () => { clearInterval(simpleTimer.interval); simpleTimer.isRunning = false; simpleTimer.elapsed = 0; headerTimer.textContent = "00:00"; showToast("Timer Reset"); vibrate(); };
            let tTimer; let tIsLong = false;
            const startT = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; tIsLong = false; tTimer = setTimeout(() => { tIsLong = true; resetTimer(); }, 600); };
            const endT = (e) => { if(e) e.preventDefault(); clearTimeout(tTimer); if(!tIsLong) toggleTimer(); };
            headerTimer.addEventListener('mousedown', startT); headerTimer.addEventListener('touchstart', startT, {passive:true});
            headerTimer.addEventListener('mouseup', endT); headerTimer.addEventListener('touchend', endT); headerTimer.addEventListener('mouseleave', () => clearTimeout(tTimer));
        }

        if(headerCounter) {
            headerCounter.textContent = simpleCounter.toString(); headerCounter.style.fontSize = "1.2rem";
            const updateCounter = () => { headerCounter.textContent = simpleCounter; };
            const increment = () => { simpleCounter++; updateCounter(); vibrate(); };
            const resetCounter = () => { simpleCounter = 0; updateCounter(); showToast("Counter Reset"); vibrate(); };
            let cTimer; let cIsLong = false;
            const startC = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; cIsLong = false; cTimer = setTimeout(() => { cIsLong = true; resetCounter(); }, 600); };
            const endC = (e) => { if(e) e.preventDefault(); clearTimeout(cTimer); if(!cIsLong) increment(); };
            headerCounter.addEventListener('mousedown', startC); headerCounter.addEventListener('touchstart', startC, {passive:true});
            headerCounter.addEventListener('mouseup', endC); headerCounter.addEventListener('touchend', endC); headerCounter.addEventListener('mouseleave', () => clearTimeout(cTimer));
        }

        if(headerMic) {
            headerMic.onclick = () => { if(!modules.sensor) return; modules.sensor.toggleAudio(!modules.sensor.mode.audio); renderUI(); const isActive = modules.sensor.mode.audio; showToast(isActive ? "Mic Input ON 🎤" : "Mic Input OFF 🔇"); };
        }
        if(headerCam) {
            headerCam.onclick = () => { if(!modules.sensor) return; modules.sensor.toggleCamera(!modules.sensor.mode.camera); renderUI(); const isActive = modules.sensor.mode.camera; showToast(isActive ? "Camera Input ON 📷" : "Camera Input OFF 🚫"); };
        }

    } catch (error) { console.error("CRITICAL ERROR:", error); alert("App crashed: " + error.message); }
}

document.addEventListener('DOMContentLoaded', startApp);
