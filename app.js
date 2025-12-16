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
const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v58', STORAGE_KEY_STATE: 'followMeAppState_v58', INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } };

const DEFAULT_PROFILE_SETTINGS = { currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, simonChunkSize: 3, simonInterSequenceDelay: 400 };
const PREMADE_PROFILES = { 'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 400 }, theme: 'default' }, 'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }};

const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: true, isHapticsEnabled: true, 
    isSpeedDeletingEnabled: true, isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', 
    activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), 
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), 
    isPracticeModeEnabled: false, 
    voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', 
    generalLanguage: 'en', isGestureInputEnabled: false, gestureMappings: {},
    // New Defaults
    morsePauseDuration: 0.2, showTimer: false, showCounter: false
};

const DICTIONARY = {
    'en': { correct: "Correct", wrong: "Wrong", stealth: "Stealth Active", reset: "Reset to Round 1", stop: "Playback Stopped 🛑" },
    'es': { correct: "Correcto", wrong: "Incorrecto", stealth: "Modo Sigilo", reset: "Reiniciar Ronda 1", stop: "Detenido 🛑" }
};

let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null };
let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null, stealth: null, stealthAction: null, playback: null, tap: null, headerTimer: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };
let blackoutState = { isActive: false, lastShake: 0 }; 
let gestureInputState = { startX: 0, startY: 0, startTime: 0, maxTouches: 0, isTapCandidate: false, tapCount: 0 };
let headerState = { timerValue: 0, isTimerRunning: false, counterValue: 0 }; // New Header State
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
            if (typeof appSettings.morsePauseDuration === 'undefined') appSettings.morsePauseDuration = 0.2;
            
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
// app.js (Continued)

function initListeners() {
    modules.settings = new SettingsManager(appSettings, {
        onSave: saveState,
        onUpdate: (type) => {
            applyTheme();
            renderSequence();
            // Handle Start Button Visibility based on Practice Mode
            const startBtn = document.getElementById('practice-start-btn');
            if(appSettings.isPracticeModeEnabled && startBtn && appState['current_session'].sequences[0].length === 0) {
                 startBtn.classList.remove('hidden');
                 document.getElementById('sequence-container').classList.add('opacity-0');
            } else if (startBtn) {
                 startBtn.classList.add('hidden');
                 document.getElementById('sequence-container').classList.remove('opacity-0');
            }
        },
        onProfileSwitch: (id) => {
            appSettings.activeProfileId = id;
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
            resetGame();
            saveState();
        },
        onProfileAdd: (name) => {
            const id = 'p_' + Date.now();
            appSettings.profiles[id] = { name: name, settings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), theme: 'default' };
            appSettings.activeProfileId = id;
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
            saveState();
        },
        onProfileRename: (name) => {
            if (appSettings.profiles[appSettings.activeProfileId]) appSettings.profiles[appSettings.activeProfileId].name = name;
            saveState();
        },
        onProfileDelete: () => {
            if (Object.keys(appSettings.profiles).length > 1) {
                delete appSettings.profiles[appSettings.activeProfileId];
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings));
                saveState();
            }
        },
        onProfileSave: () => {
            appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings));
            appSettings.profiles[appSettings.activeProfileId].theme = appSettings.activeTheme;
            saveState();
        },
        onReset: () => {
            localStorage.clear();
            location.reload();
        }
    }, modules.sensor);

    // --- NEW HEADER LISTENERS ---
    const hTimer = document.getElementById('header-timer-btn');
    if(hTimer) {
        hTimer.addEventListener('click', () => {
            if(headerState.isTimerRunning) {
                clearInterval(timers.headerTimer);
                headerState.isTimerRunning = false;
                hTimer.classList.remove('border-green-500', 'text-green-400');
            } else {
                const startTime = Date.now() - (headerState.timerValue || 0);
                hTimer.classList.add('border-green-500', 'text-green-400');
                headerState.isTimerRunning = true;
                timers.headerTimer = setInterval(() => {
                    headerState.timerValue = Date.now() - startTime;
                    document.getElementById('timer-display').textContent = (headerState.timerValue / 1000).toFixed(1) + 's';
                }, 100);
            }
        });
        hTimer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            clearInterval(timers.headerTimer);
            headerState.isTimerRunning = false;
            headerState.timerValue = 0;
            document.getElementById('timer-display').textContent = '0.0s';
            hTimer.classList.remove('border-green-500', 'text-green-400');
        });
        // Long press for mobile
        let lpTimer;
        hTimer.addEventListener('touchstart', () => { lpTimer = setTimeout(() => {
            clearInterval(timers.headerTimer);
            headerState.isTimerRunning = false;
            headerState.timerValue = 0;
            document.getElementById('timer-display').textContent = '0.0s';
            hTimer.classList.remove('border-green-500', 'text-green-400');
            navigator.vibrate(50);
        }, 800); }, {passive:true});
        hTimer.addEventListener('touchend', () => clearTimeout(lpTimer));
    }

    const hCounter = document.getElementById('header-counter-btn');
    if(hCounter) {
        hCounter.addEventListener('click', () => {
            headerState.counterValue++;
            document.getElementById('counter-display').textContent = headerState.counterValue;
        });
        hCounter.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            headerState.counterValue = 0;
            document.getElementById('counter-display').textContent = '0';
            navigator.vibrate(50);
        });
         // Long press for mobile
         let lpCounter;
         hCounter.addEventListener('touchstart', () => { lpCounter = setTimeout(() => {
             headerState.counterValue = 0;
             document.getElementById('counter-display').textContent = '0';
             navigator.vibrate(50);
         }, 800); }, {passive:true});
         hCounter.addEventListener('touchend', () => clearTimeout(lpCounter));
    }

    // Cam/Mic buttons in header
    const hCam = document.getElementById('header-cam-btn');
    if(hCam) hCam.addEventListener('click', () => {
        appSettings.autoInputMode = (appSettings.autoInputMode === 'cam') ? 'none' : 'cam';
        modules.settings.updateUIFromSettings();
        modules.settings.callbacks.onSave();
        modules.settings.callbacks.onUpdate();
    });

    const hMic = document.getElementById('header-mic-btn');
    if(hMic) hMic.addEventListener('click', () => {
        appSettings.autoInputMode = (appSettings.autoInputMode === 'mic') ? 'none' : 'mic';
        modules.settings.updateUIFromSettings();
        modules.settings.callbacks.onSave();
        modules.settings.callbacks.onUpdate();
    });

    // Practice Start Button
    const pStart = document.getElementById('practice-start-btn');
    if(pStart) pStart.addEventListener('click', startPracticeGame);

    document.querySelectorAll('.btn-input').forEach(btn => {
        const action = btn.dataset.action;
        const val = btn.dataset.value;

        const handlePress = (e) => {
            if (ignoreNextClick) return;
            e.preventDefault();
            if (action === 'open-settings') modules.settings.openSetup();
            else if (action === 'backspace') handleBackspace();
            else if (action === 'play-demo') toggleDemo();
            else if (action === 'reset-unique-rounds') resetGame();
            else if (val) addValue(val);
            vibrate();
        };

        btn.addEventListener('mousedown', handlePress);
        btn.addEventListener('touchstart', handlePress, { passive: false });

        // Special handlers (Long press settings, Long press Play)
        if (action === 'open-settings') {
            btn.addEventListener('touchstart', () => { timers.settingsLongPress = setTimeout(() => { modules.settings.toggleRedeem(true); ignoreNextClick = true; vibrate(); }, 800); }, { passive: true });
            btn.addEventListener('touchend', () => { clearTimeout(timers.settingsLongPress); setTimeout(() => ignoreNextClick = false, 100); });
        }
        if (action === 'play-demo') {
            btn.addEventListener('touchstart', () => { timers.longPress = setTimeout(() => { appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled; showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`); vibrate(); ignoreNextClick = true; }, 800); }, { passive: true });
            btn.addEventListener('touchend', () => { clearTimeout(timers.longPress); setTimeout(() => ignoreNextClick = false, 100); });
        }
        if (action === 'backspace') {
            const startDelete = () => {
                handleBackspace();
                if (!appSettings.isSpeedDeletingEnabled) return;
                isDeleting = false;
                timers.initialDelay = setTimeout(() => { isDeleting = true; timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); }, CONFIG.SPEED_DELETE_DELAY);
            };
            const stopDelete = () => { clearTimeout(timers.initialDelay); clearInterval(timers.speedDelete); setTimeout(() => isDeleting = false, 50); };
            btn.addEventListener('mousedown', startDelete); btn.addEventListener('touchstart', startDelete, { passive: true }); btn.addEventListener('mouseup', stopDelete); btn.addEventListener('mouseleave', stopDelete); btn.addEventListener('touchend', stopDelete); btn.addEventListener('touchcancel', stopDelete);
        }
    });

    // 1-Key Stealth Toggle (Hold 1)
    const btn1 = document.querySelector('button[data-value="1"]');
    if(btn1) {
        btn1.addEventListener('touchstart', () => {
            if(!appSettings.isStealth1KeyEnabled) return;
            timers.stealth = setTimeout(() => {
                document.body.classList.toggle('hide-controls');
                vibrate();
                showToast(document.body.classList.contains('hide-controls') ? DICTIONARY[appSettings.generalLanguage].stealth : "UI Visible");
            }, 1000);
        }, {passive:true});
        btn1.addEventListener('touchend', () => clearTimeout(timers.stealth));
    }

    // Blackout Shake
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            if (!appSettings.isBlackoutFeatureEnabled) return;
            const acc = event.accelerationIncludingGravity;
            if (!acc) return;
            const now = Date.now();
            if ((now - blackoutState.lastShake) > 1000) {
                const force = Math.abs(acc.x + acc.y + acc.z);
                if (force > 30) { 
                    blackoutState.isActive = !blackoutState.isActive;
                    blackoutState.lastShake = now;
                    document.body.classList.toggle('blackout-active', blackoutState.isActive);
                    if(blackoutState.isActive) {
                        showToast("Blackout Mode ON");
                        if(appSettings.isBlackoutGesturesEnabled) document.getElementById('gesture-pad-wrapper').classList.remove('hidden');
                    } else {
                        document.getElementById('gesture-pad-wrapper').classList.add('hidden');
                    }
                    vibrate();
                }
            }
        });
    }

    document.getElementById('close-settings').addEventListener('click', () => {
         // Re-check Start button state on close
        if(appSettings.isPracticeModeEnabled && appState['current_session'].sequences[0].length === 0) {
             document.getElementById('practice-start-btn').classList.remove('hidden');
             document.getElementById('sequence-container').classList.add('opacity-0');
        }
    });

    if (appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
}

function startPracticeGame() {
    const btn = document.getElementById('practice-start-btn');
    if(btn) btn.classList.add('hidden');
    document.getElementById('sequence-container').classList.remove('opacity-0');
    resetGame(); // Ensure fresh state
    nextRound(); // Start the first round
}

function showToast(msg) {
    const t = document.getElementById('toast-notification');
    const m = document.getElementById('toast-message');
    if (t && m) {
        m.innerText = msg;
        t.classList.remove('opacity-0', 'translate-y-10');
        setTimeout(() => t.classList.add('opacity-0', 'translate-y-10'), 2000);
    }
}

function resetGame() {
    appState['current_session'] = { sequences: Array.from({ length: CONFIG.MAX_MACHINES }, () => []), nextSequenceIndex: 0, currentRound: 1 };
    renderSequence();
    saveState();
    stopPlayback();
    
    // If Practice mode is on, show Start button again
    if(appSettings.isPracticeModeEnabled) {
        document.getElementById('practice-start-btn').classList.remove('hidden');
        document.getElementById('sequence-container').classList.add('opacity-0');
    }
}

function handleBackspace(specificIndex = null) {
    const s = getState();
    if (specificIndex !== null) {
        // Not implemented for this version, standard backspace:
        s.sequences[s.nextSequenceIndex].pop();
    } else {
        if (s.sequences[s.nextSequenceIndex].length > 0) {
            s.sequences[s.nextSequenceIndex].pop();
        } else if (s.nextSequenceIndex > 0) {
            s.nextSequenceIndex--;
            s.sequences[s.nextSequenceIndex].pop();
        }
    }
    renderSequence();
    saveState();
}

// --- CORE GAME LOGIC ---

function addValue(val) {
    if (appSettings.isStealth1KeyEnabled && document.body.classList.contains('hide-controls')) {
        // In full stealth, remap everything? Or just accept value?
        // Current requirement: Just accept value.
    }

    const s = getState();
    const settings = getProfileSettings();

    // Check if we need to loop back to machine 0
    if (s.nextSequenceIndex >= settings.machineCount) {
        s.nextSequenceIndex = 0;
    }

    s.sequences[s.nextSequenceIndex].push(val);
    
    // Check correctness immediately
    const isCorrect = checkSequence();
    
    if (isCorrect) {
        // Move to next machine for next input
        s.nextSequenceIndex = (s.nextSequenceIndex + 1) % settings.machineCount;
        renderSequence();
        saveState();
    } else {
        // Wrong input logic (flash red, maybe vibrate error)
        vibrate(); vibrate();
        // Remove the wrong input
        s.sequences[s.nextSequenceIndex].pop();
        showToast(DICTIONARY[appSettings.generalLanguage].wrong);
        renderSequence();
    }
}

function checkSequence() {
    // Since we don't have a "Ground Truth" (user is entering the sequence as they see it),
    // "Correct" just means "Input Accepted".
    // However, for Unique Mode/Simon Mode automation, we track round completion.
    
    const s = getState();
    const settings = getProfileSettings();
    
    // UNIQUE ROUNDS LOGIC
    if (settings.currentMode === 'unique') {
        const currentLen = s.sequences[0].length;
        
        // In Unique mode, usually we just want to confirm input and maybe auto-advance.
        // If Autoplay is ON, we act like a "Follow" game:
        // System says X -> User enters X -> System says Y -> User enters Y.
        // User entered a number. It's accepted.
        
        if (appSettings.isAutoplayEnabled) {
            // FIX FOR UNIQUE ROUNDS FREEZING
            // We wait a tiny bit to let the UI update, then trigger the NEXT round.
            if(timers.playback) clearTimeout(timers.playback);
            
            timers.playback = setTimeout(() => {
                if(appSettings.isUniqueRoundsAutoClearEnabled) {
                    s.sequences.forEach(arr => arr.length = 0); // Clear data
                    renderSequence();
                }
                nextRound(); // Generate next random number and play it
            }, settings.simonInterSequenceDelay + 200);
        }
        return true;
    }
    
    // SIMON MODE LOGIC (Standard)
    // If user has entered 'sequenceLength' items, maybe finish round?
    // Currently this app is a "Recorder", so it just accepts input.
    // But if Autoplay is ON, we assume the user is "adding" to the sequence.
    
    if (appSettings.isAutoplayEnabled && settings.currentMode === 'simon') {
        // In Simon, we usually play the WHOLE sequence after an addition.
        if(timers.playback) clearTimeout(timers.playback);
        timers.playback = setTimeout(() => {
            playSequence();
        }, 800);
    }
    
    return true;
}

function nextRound() {
    const s = getState();
    const settings = getProfileSettings();
    const mode = settings.currentMode;

    if (mode === 'unique') {
        // Generate a random number
        const max = (settings.currentInput === CONFIG.INPUTS.KEY12 || settings.currentInput === CONFIG.INPUTS.PIANO) ? 12 : 9;
        const nextNum = Math.floor(Math.random() * max) + 1;
        
        // We don't store "Target" sequences in this app version (it's a recorder), 
        // but to support "Autoplay" in Unique mode, we effectively simulate the machine.
        // We will just Speak/Flash the new number.
        
        // Note: In a recorder app, we don't usually generate the number *into* the user's list.
        // We just speak it.
        speakItem(nextNum);
        flashKey(nextNum);
        
        s.currentRound++;
        showToast(`Round ${s.currentRound}`);
    } else {
        // Simon Logic (Incrementing)
        // Usually handled by user input in this specific app design.
    }
}

function speakItem(val) {
    if (!appSettings.isAudioEnabled) return;
    
    // Handle Piano Letters
    let text = val;
    if(getProfileSettings().currentInput === CONFIG.INPUTS.PIANO) {
        const map = {1:'1', 2:'2', 3:'3', 4:'4', 5:'5', 6:'A', 7:'B', 8:'C', 9:'D', 10:'E', 11:'F', 12:'G'}; // Mapping is actually A=6..
        // Re-read Help: "Piano Keys A through G map to numbers 6 through 12"
        const rMap = {6:'A', 7:'B', 8:'C', 9:'D', 10:'E', 11:'F', 12:'G'};
        if(rMap[val]) text = rMap[val];
    }

    const u = new SpeechSynthesisUtterance(String(text));
    u.pitch = appSettings.voicePitch;
    u.rate = appSettings.voiceRate;
    u.volume = appSettings.voiceVolume;
    if (appSettings.selectedVoice) {
        const v = window.speechSynthesis.getVoices().find(voice => voice.name === appSettings.selectedVoice);
        if (v) u.voice = v;
    }
    window.speechSynthesis.speak(u);
}

function flashKey(val) {
    const sel = `button[data-value="${val}"]`;
    const btn = document.querySelector(sel);
    if (btn) {
        btn.classList.add('flash-active');
        setTimeout(() => btn.classList.remove('flash-active'), 200);
    }
    vibrateMorse(val);
}

function playSequence() {
    stopPlayback();
    isDemoPlaying = true;
    const s = getState();
    const settings = getProfileSettings();
    const speed = appSettings.playbackSpeed || 1.0;
    const delayBase = (600 / speed); // Standard gap
    // ADD MORSE PAUSE
    const morsePause = (appSettings.morsePauseDuration || 0) * 1000;
    
    let ops = [];

    // Interleave logic if multiple machines
    const maxLen = Math.max(...s.sequences.map(a => a.length));
    const chunkSize = settings.simonChunkSize || 3;

    for (let i = 0; i < maxLen; i += chunkSize) {
        for (let m = 0; m < settings.machineCount; m++) {
            const seq = s.sequences[m];
            if (!seq) continue;
            
            const chunk = seq.slice(i, i + chunkSize);
            if (chunk.length > 0) {
                // Add machine switch delay if needed
                if (settings.machineCount > 1 && m > 0) {
                     ops.push({ type: 'delay', ms: settings.simonInterSequenceDelay });
                }
                
                chunk.forEach(val => {
                    ops.push({ type: 'play', val: val });
                    // Add standard delay + morse pause
                    ops.push({ type: 'delay', ms: delayBase + morsePause });
                });
            }
        }
        // Inter-chunk delay
        if (i + chunkSize < maxLen) {
             ops.push({ type: 'delay', ms: settings.simonInterSequenceDelay });
        }
    }

    let idx = 0;
    function nextOp() {
        if (!isDemoPlaying || idx >= ops.length) {
            isDemoPlaying = false;
            return;
        }
        const op = ops[idx++];
        if (op.type === 'play') {
            speakItem(op.val);
            flashKey(op.val);
            nextOp(); // Move to next immediately? No, wait for the delay op
        } else if (op.type === 'delay') {
            timers.playback = setTimeout(nextOp, op.ms);
        }
    }
    nextOp();
}

function stopPlayback() {
    isDemoPlaying = false;
    if (timers.playback) clearTimeout(timers.playback);
    window.speechSynthesis.cancel();
}

function toggleDemo() {
    if (isDemoPlaying) {
        stopPlayback();
        showToast(DICTIONARY[appSettings.generalLanguage].stop);
    } else {
        playSequence();
    }
}

function renderSequence() {
    const container = document.getElementById('sequence-container');
    if (!container) return;
    container.innerHTML = '';
    
    const settings = getProfileSettings();
    const s = getState();

    // Mapping for Piano letters
    const rMap = {6:'A', 7:'B', 8:'C', 9:'D', 10:'E', 11:'F', 12:'G'};

    for(let m=0; m<settings.machineCount; m++) {
        const seq = s.sequences[m] || [];
        const card = document.createElement('div');
        card.className = "bg-black bg-opacity-40 p-2 rounded-xl border border-gray-700 m-1 flex flex-wrap items-center content-start min-h-[60px] max-w-full";
        // Highlight active machine
        if(m === s.nextSequenceIndex) card.classList.add('border-blue-500', 'shadow-lg');
        
        if (settings.machineCount > 1) {
             const badge = document.createElement('div');
             badge.className = "w-6 h-6 rounded-full bg-gray-600 text-white flex items-center justify-center text-xs font-bold mr-2 mb-1";
             badge.innerText = m + 1;
             card.appendChild(badge);
        }

        seq.forEach((val, idx) => {
            const el = document.createElement('div');
            el.className = "number-box m-1 text-sm font-bold shadow-md";
            
            let displayVal = val;
            if(settings.currentInput === CONFIG.INPUTS.PIANO && rMap[val]) displayVal = rMap[val];
            
            el.innerText = displayVal;

            // Delete specific item on click (optional feature)
            el.onclick = (e) => {
                e.stopPropagation();
                if(confirm("Remove this number?")) {
                    s.sequences[m].splice(idx, 1);
                    renderSequence();
                    saveState();
                }
            };
            card.appendChild(el);
        });
        container.appendChild(card);
    }
    
    // Manage footer visibility based on settings
    const footer = document.getElementById('input-footer');
    const inputKey = settings.currentInput;
    
    document.getElementById('pad-key9').style.display = (inputKey === CONFIG.INPUTS.KEY9) ? 'block' : 'none';
    document.getElementById('pad-key12').style.display = (inputKey === CONFIG.INPUTS.KEY12) ? 'block' : 'none';
    document.getElementById('pad-piano').style.display = (inputKey === CONFIG.INPUTS.PIANO) ? 'block' : 'none';
    
    // Show/Hide Mic/Cam buttons in footer based on settings
    // Note: User asked to MOVE them to header. 
    // The footer buttons (id="mic-master-btn") should be hidden now.
    // They are hidden by CSS 'hidden' class in HTML, we ensure they stay hidden here.
    const fMic = document.getElementById('mic-master-btn');
    if(fMic) fMic.classList.add('hidden'); 
    const fCam = document.getElementById('camera-master-btn');
    if(fCam) fCam.classList.add('hidden');

    // Toggle header buttons visibility
    const hCam = document.getElementById('header-cam-btn');
    const hMic = document.getElementById('header-mic-btn');
    if(hCam) hCam.classList.toggle('hidden', !appSettings.showCamBtn);
    if(hMic) hMic.classList.toggle('hidden', !appSettings.showMicBtn);
    
    // Auto-Input Triggers
    if ((appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') && !modules.sensor.isAudioActive) modules.sensor.toggleAudio(true);
    if ((appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') && !modules.sensor.isCamActive) modules.sensor.toggleCamera(true);
}

function applyTheme() {
    const theme = appSettings.customThemes[appSettings.activeTheme] || PREMADE_THEMES[appSettings.activeTheme] || PREMADE_THEMES['default'];
    const r = document.documentElement.style;
    r.setProperty('--bg-main', theme.bgMain);
    r.setProperty('--card-bg', theme.bgCard);
    r.setProperty('--seq-bubble', theme.bubble);
    r.setProperty('--btn-bg', theme.btn);
    r.setProperty('--text-main', theme.text);
}

window.addEventListener('DOMContentLoaded', () => {
    loadState();
    modules.sensor = new SensorEngine(addValue, showToast);
    initGesturePad();
    initComments(db);
    initListeners();
    applyTheme();
    renderSequence();
    
    // Initial Header State
    const hTimer = document.getElementById('header-timer-btn');
    const hCounter = document.getElementById('header-counter-btn');
    if(hTimer) hTimer.classList.toggle('hidden', !appSettings.showTimer);
    if(hCounter) hCounter.classList.toggle('hidden', !appSettings.showCounter);
    const header = document.getElementById('main-header');
    if(header) header.classList.toggle('opacity-0', (!appSettings.showTimer && !appSettings.showCounter));
});
