import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS, PRELOADED_GESTURE_PRESETS } from './settings.js';
import { initComments } from './comments.js';

const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CONFIG ---
const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v46', STORAGE_KEY_STATE: 'followMeAppState_v46', INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } };

const DEFAULT_PROFILE_SETTINGS = { currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, simonChunkSize: 3, simonInterSequenceDelay: 400 };
const PREMADE_PROFILES = { 'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 400 }, theme: 'default' }, 'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }};

const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: true, isHapticsEnabled: true, 
   isFlashEnabled: false, 
    pauseSetting: 'none',
    isSpeedDeletingEnabled: true, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', 
    showTimer: false, showCounter: false,
    activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), 
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), 
    isPracticeModeEnabled: false, voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, 
    selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', generalLanguage: 'en', 
    isGestureInputEnabled: false,  
gestureConfig: {
    'key9': { activePreset: 'taps', customPresets: {} },
    'key12': { activePreset: 'taps', customPresets: {} },
    'piano': { activePreset: 'swipes', customPresets: {} },
    'general': { activePreset: 'default', customPresets: {} }
},
isGestureInputEnabled: false

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

// --- NEW GLOBALS FOR TIMER/COUNTER ---
let simpleTimer = { interval: null, startTime: 0, elapsed: 0, isRunning: false };
let simpleCounter = 0;

const getProfileSettings = () => appSettings.runtimeSettings;
const getState = () => appState['current_session'] || (appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 });
function saveState() { localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState)); }

function loadState() { 
    try { 
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS); 
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE); 
        
        // 1. Initialize appSettings with Defaults first
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));

        if(s) { 
            const loaded = JSON.parse(s); 
            // 2. Merge loaded data carefully
            appSettings = { 
                ...appSettings, 
                ...loaded, 
                profiles: { ...appSettings.profiles, ...(loaded.profiles || {}) }, 
                customThemes: { ...appSettings.customThemes, ...(loaded.customThemes || {}) } 
            }; 

            // 3. REPAIR: Ensure gestureConfig has all required sections
            if (!appSettings.gestureConfig) appSettings.gestureConfig = {};
            
            const requiredKeys = ['key9', 'key12', 'piano', 'general'];
            requiredKeys.forEach(key => {
                // If a section is missing (e.g. user has old data), copy it from Default
                if (!appSettings.gestureConfig[key]) {
                    appSettings.gestureConfig[key] = JSON.parse(JSON.stringify(DEFAULT_APP.gestureConfig[key]));
                }
            });

            // 4. Ensure other boolean flags exist
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

            // 5. Runtime Settings Safety
            if(!appSettings.runtimeSettings) appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles['profile_1'].settings)); 
            if(appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
        } 
        
        // Load State (Session)
        if(st) appState = JSON.parse(st); 
        if(!appState['current_session']) appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
        appState['current_session'].currentRound = parseInt(appState['current_session'].currentRound) || 1;
        
    } catch(e) { 
        console.error("Load failed", e); 
        // Emergency Reset
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP)); 
        saveState(); 
    } 
                }
            }
            
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
    // 1. Create the Full-Screen Gesture Layer if it doesn't exist
    let layer = document.getElementById('gesture-input-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'gesture-input-layer';
        // z-index 35 sits above content/footer but BELOW the Header buttons (z-40)
        layer.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:35; display:none; touch-action:none;";
        document.body.appendChild(layer);
    }

    // 2. Visibility & Footer Toggle Logic
    const toggleGestureMode = () => {
        const active = appSettings.isGestureInputEnabled;
        layer.style.display = active ? 'block' : 'none';
        
        // Hide Footer if active (using a body class is cleanest)
        if (active) {
            document.body.classList.add('gesture-mode-active');
            document.body.classList.add('hide-controls'); // Reuse existing class to hide footer
            showToast("Gesture Input Active 👆");
        } else {
            document.body.classList.remove('gesture-mode-active');
            document.body.classList.remove('hide-controls');
        }
    };

    // Run once on init
    toggleGestureMode();

    // Export this function so Settings can call it when toggled
    window.updateGestureLayerVisibility = toggleGestureMode;

    // 3. Touch State Tracking
    let touchState = { 
        startTime: 0, 
        startX: 0, 
        startY: 0, 
        maxTouches: 0, 
        isTap: true,
        tapCount: 0,
        tapTimer: null,
        longPressTimer: null
    };

    const resetState = () => {
        touchState.maxTouches = 0;
        touchState.isTap = true;
        clearTimeout(touchState.longPressTimer);
    };

    // 4. Event Listeners
    layer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const now = Date.now();

        // If this is the first finger, start fresh
        if (e.touches.length === 1) {
            touchState.startTime = now;
            touchState.startX = t.clientX;
            touchState.startY = t.clientY;
            touchState.isTap = true;
            // Clear previous tap timer if we tap again quickly (for double/triple detection)
            // But DON'T clear count yet, that happens in touchend logic
        }

        // Track max fingers seen during this gesture
        if (e.touches.length > touchState.maxTouches) {
            touchState.maxTouches = e.touches.length;
        }

        // Long Press Detection (only if it stays a tap)
        clearTimeout(touchState.longPressTimer);
        touchState.longPressTimer = setTimeout(() => {
            if (touchState.isTap) {
                // It's a long press!
                triggerGesture('long_tap', touchState.maxTouches);
                touchState.isTap = false; // Prevent touchend from firing tap
                touchState.tapCount = 0;  // Reset tap cycle
            }
        }, 600); // 600ms for long press
    }, { passive: false });

    layer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - touchState.startX;
        const dy = t.clientY - touchState.startY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // If moved more than 20px, it's a Swipe, not a Tap
        if (dist > 20) {
            touchState.isTap = false;
            clearTimeout(touchState.longPressTimer);
        }
    }, { passive: false });

    layer.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(touchState.longPressTimer);

        // Only process when ALL fingers lift (touches.length === 0)
        if (e.touches.length > 0) return;

        const duration = Date.now() - touchState.startTime;
        const fingers = touchState.maxTouches || 1;

        if (touchState.isTap) {
            // It was a tap (short, no movement)
            handleTapLogic(fingers);
        } else {
            // It was a swipe (movement detected)
            // Calculate direction based on last known position
            const t = e.changedTouches[0]; // Use changedTouches for lift position
            const dx = t.clientX - touchState.startX;
            const dy = t.clientY - touchState.startY;
            const dir = getSwipeDirection(dx, dy);
            
            triggerGesture(dir, fingers);
            touchState.tapCount = 0; // Swipe breaks tap combos
        }
        
        resetState();
    }, { passive: false });

    // 5. Helper Logic
    
    // Distinguish Single, Double, Triple taps
    function handleTapLogic(fingers) {
        touchState.tapCount++;
        
        clearTimeout(touchState.tapTimer);
        touchState.tapTimer = setTimeout(() => {
            // Timer finished, finalize the tap count
            let type = 'tap';
            if (touchState.tapCount === 2) type = 'double_tap';
            if (touchState.tapCount >= 3) type = 'triple_tap';
            
            triggerGesture(type, fingers);
            touchState.tapCount = 0; // Reset
        }, 280); // 280ms window for multi-taps
    }

    // Convert XY to 8-way Direction
    function getSwipeDirection(dx, dy) {
        const angle = Math.atan2(dy, dx) * 180 / Math.PI; // -180 to 180
        
        // 8-Way Logic (22.5 degree offsets)
        if (angle >= -22.5 && angle < 22.5) return 'swipe_right';
        if (angle >= 22.5 && angle < 67.5) return 'swipe_se';
        if (angle >= 67.5 && angle < 112.5) return 'swipe_down';
        if (angle >= 112.5 && angle < 157.5) return 'swipe_sw';
        if (angle >= 157.5 || angle < -157.5) return 'swipe_left';
        if (angle >= -157.5 && angle < -112.5) return 'swipe_nw';
        if (angle >= -112.5 && angle < -67.5) return 'swipe_up';
        if (angle >= -67.5 && angle < -22.5) return 'swipe_ne';
        
        return 'swipe_right'; // Fallback
    }

    // Construct the string ID and execute
    function triggerGesture(baseName, fingers) {
        let suffix = '';
        if (fingers === 2) suffix = '_2f';
        if (fingers === 3) suffix = '_3f';
        
        const gestureKey = baseName + suffix;
        handleInputGesture(gestureKey);
        
        // Visual Feedback (Ghost Overlay) - Only if Flash is ON
        if (appSettings.isFlashEnabled) {
            showGestureFeedback(gestureKey);
        }
    }
}

// Looks up the gesture in settings and executes the action
function handleInputGesture(gestureKey) {
    const settings = getProfileSettings();
    const currentInput = settings.currentInput; // 'key9', 'key12', 'piano'
    
    // 1. Check General Mappings First (Global Overrides)
    const genAction = findActionInConfig('general', gestureKey);
    if (genAction) {
        executeGeneralAction(genAction);
        return;
    }

    // 2. Check Specific Input Mappings
    const value = findActionInConfig(currentInput, gestureKey);
    if (value) {
        // Map Piano Keys/Letters back to values if needed
        addValue(value);
        
        // Audio Feedback (Morse)
        const config = appSettings.gestureConfig[currentInput];
        const mappings = getActiveMappings(currentInput);
        // Find the map key that resulted in this value to get its morse
        // This is a reverse lookup, slightly inefficient but robust
        for (const [key, map] of Object.entries(mappings)) {
             if (map.gesture === gestureKey) {
                 if (map.morse) vibrateMorse(map.morse);
                 break;
             }
        }
    }
}

// Helper to look into the complex config object
function findActionInConfig(sectionKey, gestureKey) {
    const mappings = getActiveMappings(sectionKey);
    if (!mappings) return null;

    for (const [id, data] of Object.entries(mappings)) {
        if (data.gesture === gestureKey) {
            // ID looks like 'k9_1', 'gen_backspace', etc.
            // We need to extract the actionable value.
            if (sectionKey === 'general') {
                return id.replace('gen_', ''); // returns 'backspace', 'settings'
            } else if (sectionKey === 'piano') {
                return id.replace('piano_', ''); // returns 'C', '1', etc.
            } else {
                // key9/key12: extract the number after the underscore
                return id.split('_')[1]; 
            }
        }
    }
    return null;
}

// Helper to get the correct mapping object (Custom or Built-in)
function getActiveMappings(sectionKey) {
    if (!appSettings.gestureConfig || !appSettings.gestureConfig[sectionKey]) return {};
    const config = appSettings.gestureConfig[sectionKey];
    const activeId = config.activePreset;

    // Try Custom
    if (config.customPresets && config.customPresets[activeId]) {
        return config.customPresets[activeId].mappings;
    }
    // Try Preloaded (Requires import, or assume global if attached to window. Or just access settings.js logic if available. 
    // Since we are in app.js, we need access to PRELOADED_GESTURE_PRESETS.
    // For simplicity, we will assume modules.settings has it or we re-import it. 
    // BETTER: Let's attach PRELOADED to appSettings during load/init so app.js can see it easily without imports.)
    
    // *Correction*: To keep this simple without import messes, ensure PRELOADED_GESTURE_PRESETS 
    // is available globally or accessible via modules.settings.constructor.PRELOADED...
    // *Workaround*: We will rely on SettingsManager to have synced it, OR we just look at the `PRELOADED_GESTURE_PRESETS` 
    // which we will assume is imported at the top of app.js. 
    
    // *Wait*: You cannot import at top of app.js easily if not a module. 
    // We will assume `import { PRELOADED_GESTURE_PRESETS } from './settings.js';` is added to the top of app.js.
    
    if (PRELOADED_GESTURE_PRESETS && PRELOADED_GESTURE_PRESETS[sectionKey] && PRELOADED_GESTURE_PRESETS[sectionKey][activeId]) {
        return PRELOADED_GESTURE_PRESETS[sectionKey][activeId].mappings;
    }
    return {};
}

function executeGeneralAction(action) {
    console.log("General Action:", action);
    vibrate(); // Feedback
    if (action === 'backspace') {
        handleBackspace();
    } else if (action === 'settings') {
        modules.settings.openSettings();
    } else if (action === 'reset') {
        // Reset Logic
        const s = getState();
        s.currentRound = 1;
        s.sequences[0] = [];
        s.nextSequenceIndex = 0;
        renderUI();
        saveState();
        showToast("Reset to Round 1");
    } else if (action === 'playstop') {
        if (isDemoPlaying) {
             isDemoPlaying = false; 
             showToast("Stopped 🛑");
        } else {
             playDemo();
        }
    }
}

// Simple Visual Feedback for Gestures (Ghost Text)
function showGestureFeedback(text) {
    const feedback = document.createElement('div');
    feedback.textContent = text.replace(/_/g, ' ').toUpperCase();
    feedback.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); font-size:2rem; color:rgba(255,255,255,0.5); font-weight:bold; pointer-events:none; z-index:40; animation: fadeOut 0.5s forwards;";
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 500);
}

// Add css animation for feedback
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeOut { 0% { opacity: 1; transform:translate(-50%, -50%) scale(0.8); } 100% { opacity: 0; transform:translate(-50%, -50%) scale(1.5); } }`;
document.head.appendChild(style);


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

    // --- PRACTICE MODE UI ---
    if(appSettings.isPracticeModeEnabled) {
        // Create Header
        const header = document.createElement('h2');
        header.className = "text-2xl font-bold text-center w-full mt-10 mb-8";
        header.style.color = "var(--text-main)";
        header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span>`;
        container.appendChild(header);

        // If sequence is empty, we are waiting to start -> Show Big Button
        if(practiceSequence.length === 0) { 
            state.currentRound = 1; 
            
            const btn = document.createElement('button');
            btn.textContent = "START";
            btn.className = "w-48 h-48 rounded-full bg-green-600 hover:bg-green-500 text-white text-3xl font-bold shadow-[0_0_40px_rgba(22,163,74,0.5)] transition-all transform hover:scale-105 active:scale-95 animate-pulse";
            btn.onclick = () => {
                btn.style.display = 'none'; // Disappear
                startPracticeRound();       // Start Game
            };
            container.appendChild(btn);
        }
        return;
    }

    // --- STANDARD GAME UI ---
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
    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    const playBtn = document.querySelector('button[data-action="play-demo"]'); // Get button for updating text
    
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
    let totalCount = 0; // Track the sequence position

    function nextChunk() {
        if(!isDemoPlaying) {
            if(playBtn) playBtn.textContent = "▶"; // Restore icon if stopped
            return;
        }

        if(cIdx >= chunks.length) { 
            isDemoPlaying = false; 
            if(playBtn) playBtn.textContent = "▶"; // Restore icon on finish
            
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
                setTimeout(nextChunk, machineDelay);
                return;
            }
            const val = chunk.nums[nIdx];
            totalCount++; // Increment count
            
            // UPDATE PLAY BUTTON TEXT to show position (1, 2, 3...)
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
    }, null); 

    // Init Sensor Engine
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
        // --- Input Pad Listeners ---
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

        // --- Play/Demo Button ---
        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
            const start = (e) => { 
                if(e) { e.preventDefault(); e.stopPropagation(); } 
                if(isDemoPlaying) { 
                    isDemoPlaying = false; 
                    b.textContent = "▶"; 
                    showToast("Playback Stopped 🛑"); 
                    return; 
                } 
                playDemo(); 
            };
            const longStart = () => { timers.longPress = setTimeout(() => { appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled; modules.settings.updateUIFromSettings(); showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`); ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500); }, 800); };
            const longEnd = () => { clearTimeout(timers.longPress); };
            b.addEventListener('mousedown', start); b.addEventListener('touchstart', start, { passive: false }); 
            if (appSettings.isLongPressAutoplayEnabled) {
                b.addEventListener('mousedown', longStart); b.addEventListener('touchstart', longStart, { passive: true }); b.addEventListener('mouseup', longEnd); b.addEventListener('mouseleave', longEnd); b.addEventListener('touchend', longEnd);
            }
        });
        
        // --- Reset Button ---
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

        // --- Settings Button (STOP if playing, else Open) ---
        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
            b.addEventListener('click', () => {
                if(isDemoPlaying) {
                    isDemoPlaying = false;
                    const pb = document.querySelector('button[data-action="play-demo"]');
                    if(pb) pb.textContent = "▶";
                    showToast("Playback Stopped 🛑");
                    return;
                }
                modules.settings.openSettings();
            });
            
            const start = () => { timers.settingsLongPress = setTimeout(() => { modules.settings.toggleRedeem(true); ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500); }, 1000); };
            const end = () => clearTimeout(timers.settingsLongPress);
            b.addEventListener('touchstart', start, {passive:true}); b.addEventListener('touchend', end); b.addEventListener('mousedown', start); b.addEventListener('mouseup', end);
        });

        // --- Backspace ---
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
        
        // --- Blackout ---
        let lastX=0, lastY=0, lastZ=0;
        window.addEventListener('devicemotion', (e) => {
            if(!appSettings.isBlackoutFeatureEnabled) return;
            const acc = e.accelerationIncludingGravity;
            if(!acc) return;
            const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
            if(delta > 25) { 
                const now = Date.now();
                if(now - blackoutState.lastShake > 1000) {
                    blackoutState.isActive = !blackoutState.isActive;
                    document.body.classList.toggle('blackout-active', blackoutState.isActive);
                    if(blackoutState.isActive) {
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
        
        // ============================================
        // NEW TIMER & COUNTER LOGIC
        // ============================================

        const headerTimer = document.getElementById('header-timer-btn');
        const headerCounter = document.getElementById('header-counter-btn');
        const headerMic = document.getElementById('header-mic-btn');
        const headerCam = document.getElementById('header-cam-btn');
        
        // --- TIMER LOGIC (Stopwatch) ---
        if(headerTimer) {
            headerTimer.textContent = "00:00"; // Initial display
            headerTimer.style.fontSize = "0.75rem"; // Ensure it fits
            
            // Format time helper
            const formatTime = (ms) => {
                const totalSec = Math.floor(ms / 1000);
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            };
            
            // Update function
            const updateTimer = () => {
                const now = Date.now();
                const diff = now - simpleTimer.startTime + simpleTimer.elapsed;
                headerTimer.textContent = formatTime(diff);
            };

                        // Actions
            const toggleTimer = () => {
                if(simpleTimer.isRunning) {
                    // Pause
                    clearInterval(simpleTimer.interval);
                    simpleTimer.elapsed += Date.now() - simpleTimer.startTime;
                    simpleTimer.isRunning = false;
                    // REMOVED: headerTimer.style.color = "white"; 
                } else {
                    // Start
                    simpleTimer.startTime = Date.now();
                    simpleTimer.interval = setInterval(updateTimer, 100);
                    simpleTimer.isRunning = true;
                    // REMOVED: headerTimer.style.color = "#4f46e5";
                }
                vibrate();
            };
            
            const resetTimer = () => {
                clearInterval(simpleTimer.interval);
                simpleTimer.isRunning = false;
                simpleTimer.elapsed = 0;
                headerTimer.textContent = "00:00";
                // REMOVED: headerTimer.style.color = "white";
                showToast("Timer Reset");
                vibrate();
            };

            // Long Press Setup
            let tTimer;
            let tIsLong = false;
            const startT = (e) => {
                if(e.type === 'mousedown' && e.button !== 0) return;
                tIsLong = false;
                tTimer = setTimeout(() => { tIsLong = true; resetTimer(); }, 600);
            };
            const endT = (e) => {
                if(e) e.preventDefault();
                clearTimeout(tTimer);
                if(!tIsLong) toggleTimer();
            };
            
            headerTimer.addEventListener('mousedown', startT);
            headerTimer.addEventListener('touchstart', startT, {passive:true});
            headerTimer.addEventListener('mouseup', endT);
            headerTimer.addEventListener('touchend', endT);
            headerTimer.addEventListener('mouseleave', () => clearTimeout(tTimer));
        }

        // --- COUNTER LOGIC (Simple Count) ---
        if(headerCounter) {
            headerCounter.textContent = simpleCounter.toString(); // Initial
            headerCounter.style.fontSize = "1.2rem";

            const updateCounter = () => { headerCounter.textContent = simpleCounter; };
            
            const increment = () => {
                simpleCounter++;
                updateCounter();
                vibrate();
            };
            
            const resetCounter = () => {
                simpleCounter = 0;
                updateCounter();
                showToast("Counter Reset");
                vibrate();
            };

            // Long Press Setup
            let cTimer;
            let cIsLong = false;
            const startC = (e) => {
                if(e.type === 'mousedown' && e.button !== 0) return;
                cIsLong = false;
                cTimer = setTimeout(() => { cIsLong = true; resetCounter(); }, 600);
            };
            const endC = (e) => {
                if(e) e.preventDefault();
                clearTimeout(cTimer);
                if(!cIsLong) increment();
            };

            headerCounter.addEventListener('mousedown', startC);
            headerCounter.addEventListener('touchstart', startC, {passive:true});
            headerCounter.addEventListener('mouseup', endC);
            headerCounter.addEventListener('touchend', endC);
            headerCounter.addEventListener('mouseleave', () => clearTimeout(cTimer));
        }

        // --- Mic/Cam Standard Logic ---
        if(headerMic) {
            headerMic.onclick = () => {
                if(!modules.sensor) return;
                modules.sensor.toggleAudio(!modules.sensor.mode.audio); 
                renderUI(); 
                const isActive = modules.sensor.mode.audio;
                showToast(isActive ? "Mic Input ON 🎤" : "Mic Input OFF 🔇");
            };
        }
        if(headerCam) {
            headerCam.onclick = () => {
                if(!modules.sensor) return;
                modules.sensor.toggleCamera(!modules.sensor.mode.camera);
                renderUI(); 
                const isActive = modules.sensor.mode.camera;
                showToast(isActive ? "Camera Input ON 📷" : "Camera Input OFF 🚫");
            };
        }

    } catch (error) { console.error("CRITICAL ERROR:", error); alert("App crashed: " + error.message); }
}

// Start
document.addEventListener('DOMContentLoaded', startApp);
