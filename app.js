import { GestureEngine } from './gestures.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { renderUI } from './renderer.js';
import { loadState, saveState, appSettings } from './state.js';
import * as SharedState from './state.js';
import { applyUpsideDown, applyWakeLock } from './hardware.js';
import { VoiceCommander } from './voice-commander.js';
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS } from './settings.js';
import { initComments } from './comments.js';
import { VisionEngine } from './vision.js';
import { CONFIG, DEFAULT_PROFILE_SETTINGS, PREMADE_PROFILES, DEFAULT_APP, DEFAULT_MAPPINGS, DICTIONARY} from './constants.js';
const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ENABLE OFFLINE PERSISTENCE ---
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one.');
    } else if (err.code == 'unimplemented') {
        console.log('Browser does not support persistence');
    }
});
    


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
             // --- FIX: Prevent Sensor Interference ---
             // If AI Vision is running, ignore the basic light/camera sensor
             // to prevent "7s" or random inputs from light changes.
             if (source === 'camera' && modules.vision && modules.vision.isActive) return;
             // ----------------------------------------

             addValue(val); 
             const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
             if(btn) { btn.classList.add('flash-active'); setTimeout(() => btn.classList.remove('flash-active'), 200); }
        },
        (status) => { }
    );

    modules.settings.sensorEngine = modules.sensor;
modules.vision = new VisionEngine(
        (gesture) => {
            // This runs when the AI detects a hand gesture (e.g. "hand_5_up")
            const settings = getProfileSettings();
            const mappedVal = mapGestureToValue(gesture, settings.currentInput);
            
            if (mappedVal) {
                addValue(mappedVal);
                
                // Visual Feedback
                const btn = document.querySelector(`#pad-${settings.currentInput} button[data-value="${mappedVal}"]`);
                if(btn) { 
                    btn.classList.add('flash-active'); 
                    setTimeout(() => btn.classList.remove('flash-active'), 200); 
                }
                showToast(`Hand: ${mappedVal} 🖐️`);
            }
        },
        (status) => showToast(status) // Shows "Loading AI...", "Cam Blocked", etc.
    );
    // --- FIX: INITIALIZE VOICE MODULE ---
    voiceModule = new VoiceCommander({
        onStatus: (msg) => showToast(msg),
            onInput: (val) => {
        addValue(val);

        // --- NEW: Blink the Mic Button ---
        const hMic = document.getElementById('header-mic-btn');
        if(hMic) {
            // 1. Force the visual state OFF
            hMic.classList.remove('header-btn-active');
            
            // 2. Wait 300ms (approx time for speech engine to reset) then turn ON
            setTimeout(() => {
                // Only turn back on if the user hasn't manually stopped it
                if(voiceModule && voiceModule.isListening) {
                    hMic.classList.add('header-btn-active');
                }
            }, 300);
        }
        // ---------------------------------

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
    
    // --- THIS IS THE CRITICAL CHANGE ---
    initGlobalListeners(); // Keep buttons working
    initGestureEngine();   // Start the new gesture system
    
    if (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleAudio(true);
    }
    if (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleCamera(true);
    }
    
    renderUI();
    const devTrigger = document.getElementById('dev-secret-trigger');
if (devTrigger) {
    devTrigger.addEventListener('click', () => {
        // Only progress if not already a developer
        if (isDeveloperMode) return;

        devClickCount++;
        
        if (devClickCount === 4) showToast("3");
        if (devClickCount === 5) showToast("2");
        if (devClickCount === 6) showToast("1");
        
        if (devClickCount === 7) {
            isDeveloperMode = true;
            localStorage.setItem('isDeveloperMode', 'true');
            showToast("You are now a developer. Long press the settings button to access developer options");
        }
    });
                }
    
};

// ... (Previous imports and init logic remain unchanged) ...

// --- NEW: Default Hand Definitions ---
const DEFAULT_HAND_MAPPINGS = {
    // 9-Key Defaults
    'k9_1': 'hand_1_up', 'k9_2': 'hand_2_up', 'k9_3': 'hand_3_up',
    'k9_4': 'hand_4_up', 'k9_5': 'hand_5_up', 'k9_6': 'hand_1_down',
    'k9_7': 'hand_2_down', 'k9_8': 'hand_3_down', 'k9_9': 'hand_4_down',

    // 12-Key Defaults
    'k12_1': 'hand_1_up', 'k12_2': 'hand_2_up', 'k12_3': 'hand_3_up',
    'k12_4': 'hand_4_up', 'k12_5': 'hand_5_up', 'k12_6': 'hand_1_down',
    'k12_7': 'hand_2_down', 'k12_8': 'hand_3_down', 'k12_9': 'hand_4_down',
    'k12_10': 'hand_5_down', 'k12_11': 'hand_1_right', 'k12_12': 'hand_1_left',

    // Piano Defaults
    'piano_C': 'hand_1_up', 'piano_D': 'hand_2_up', 'piano_E': 'hand_3_up',
    'piano_F': 'hand_4_up', 'piano_G': 'hand_5_up', 'piano_A': 'hand_1_right', 'piano_B': 'hand_1_left',
    'piano_1': 'hand_1_down', 'piano_2': 'hand_2_down', 'piano_3': 'hand_3_down',
    'piano_4': 'hand_4_down', 'piano_5': 'hand_5_down'
};



function initGestureEngine() {
    const engine = new GestureEngine(document.body, {
        tapDelay: appSettings.gestureTapDelay || 300,
        swipeThreshold: appSettings.gestureSwipeDist || 30,
        debug: false
    }, {
        onGesture: (data) => {
            // Input Mapping
            const isPadOpen = (typeof isGesturePadVisible !== 'undefined' && isGesturePadVisible);
            const isClassPresent = document.body.classList.contains('input-gestures-mode');
            const isBossActive = appSettings.isBlackoutFeatureEnabled && appSettings.isBlackoutGesturesEnabled && blackoutState.isActive;

            if (isPadOpen || isClassPresent || isBossActive) {
                const settings = getProfileSettings();
                const mapResult = mapGestureToValue(data.name, settings.currentInput);
                const indicator = document.getElementById('gesture-indicator');

                if (mapResult !== null) {
                    addValue(mapResult);
                    if(indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ').toUpperCase();
                        indicator.style.opacity = '1';
                        indicator.style.color = 'var(--seq-bubble)';
                        setTimeout(() => { indicator.style.opacity = '0.3'; indicator.style.color = ''; }, 250);
                    }
                } else {
                    if(indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ');
                        indicator.style.opacity = '0.5';
                        setTimeout(() => indicator.style.opacity = '0.3', 500);
                    }
                }
            }
        },
        onContinuous: (data) => {
            // --- FIX: HANDLE DELETE & CLEAR HERE ---
            // The v100 engine emits 'squiggle' as a continuous event for instant feedback.
            
            // 1. Delete (1-Finger Squiggle)
            if (data.type === 'squiggle' && data.fingers === 1) {
                if (appSettings.isDeleteGestureEnabled) { 
                    handleBackspace(); 
                    showToast("Deleted ⌫"); 
                    vibrate(); 
                }
                return;
            }

            // 2. Clear (2-Finger Squiggle)
            if (data.type === 'squiggle' && data.fingers === 2) {
                if (appSettings.isClearGestureEnabled) { 
                    const s = getState(); 
                    s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
                    s.nextSequenceIndex = 0; 
                    renderUI(); 
                    saveState(); 
                    showToast("CLEARED 💥"); 
                    vibrate(); 
                }
                return;
            }
            // ---------------------------------------

            if (data.type === 'twist' && data.fingers === 3 && appSettings.isVolumeGesturesEnabled) {
                let newVol = appSettings.voiceVolume || 1.0; newVol += (data.value * 0.05); 
                appSettings.voiceVolume = Math.min(1.0, Math.max(0.0, newVol)); saveState(); showToast(`Volume: ${(appSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
            }
            if (data.type === 'twist' && data.fingers === 2 && appSettings.isSpeedGesturesEnabled) {
                let newSpeed = appSettings.playbackSpeed || 1.0; newSpeed += (data.value * 0.05);
                appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed)); saveState(); showToast(`Speed: ${(appSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
            }
            if (data.type === 'pinch') {
                const mode = appSettings.gestureResizeMode || 'global';
                if (mode === 'none') return;
                if (!gestureState.isPinching) { gestureState.isPinching = true; gestureState.startGlobal = appSettings.globalUiScale; gestureState.startSeq = appSettings.uiScaleMultiplier; }
                clearTimeout(gestureState.resetTimer); gestureState.resetTimer = setTimeout(() => { gestureState.isPinching = false; }, 250);
                if (mode === 'sequence') {
                    let raw = gestureState.startSeq * data.scale; let newScale = Math.round(raw * 10) / 10;
                    if (newScale !== appSettings.uiScaleMultiplier) { appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, newScale)); renderUI(); showToast(`Cards: ${(appSettings.uiScaleMultiplier * 100).toFixed(0)}% 🔍`); }
                } else {
                    let raw = gestureState.startGlobal * data.scale; let newScale = Math.round(raw / 10) * 10;
                    if (newScale !== appSettings.globalUiScale) { appSettings.globalUiScale = Math.min(200, Math.max(50, newScale)); updateAllChrome(); showToast(`UI: ${appSettings.globalUiScale}% 🔍`); }
                }
            }
        }
    });
    modules.gestureEngine = engine;

    // Initial Update
    updateEngineConstraints();

    // Hook into renderUI so constraints update when you switch inputs
    const originalRender = renderUI;
    renderUI = function() {
        originalRender();
        updateEngineConstraints();
    };
}
                    
                            

function initGlobalListeners() {
    try {
        const devHideVoiceToggle = document.getElementById('dev-hide-voice-toggle');
if (devHideVoiceToggle) {
    // Set the initial visual state of the toggle to match loaded settings
    devHideVoiceToggle.checked = appSettings.devHideVoiceSettings;
    
    // Listen for clicks
    devHideVoiceToggle.addEventListener('change', (e) => {
        appSettings.devHideVoiceSettings = e.target.checked;
        applyDeveloperVisibility(); // Trigger the hide/show logic
        
        // Save the state so it remembers on refresh
        if (typeof saveSettings === 'function') {
            saveSettings(); 
        }
    });
}

const devHideHapticToggle = document.getElementById('dev-hide-haptic-toggle');
if (devHideHapticToggle) {
    // Set the initial visual state of the toggle to match loaded settings
    devHideHapticToggle.checked = appSettings.devHideHapticSettings;
    
    // Listen for clicks
    devHideHapticToggle.addEventListener('change', (e) => {
        appSettings.devHideHapticSettings = e.target.checked;
        applyDeveloperVisibility(); // Trigger the hide/show logic
        
        // Save the state so it remembers on refresh
        if (typeof saveSettings === 'function') {
            saveSettings(); 
        }
    });
            }
        // --- BUTTON LISTENERS ---
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

    const start = () => { 
        timers.settingsLongPress = setTimeout(() => { 
            // Only opens the developer modal if in dev mode
            if (isDeveloperMode) {
                openDeveloperModal(); 
            }
            
            ignoreNextClick = true; 
            setTimeout(() => ignoreNextClick = false, 500); 
        }, 1000); 
    };


    const end = () => clearTimeout(timers.settingsLongPress);
    b.addEventListener('touchstart', start, {passive:true}); 
    b.addEventListener('touchend', end); 
    b.addEventListener('mousedown', start); 
    b.addEventListener('mouseup', end);
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

        // --- BOSS MODE SHAKE & GRID ---
        let lastX=0, lastY=0, lastZ=0;
        window.addEventListener('devicemotion', (e) => {
            if(!appSettings.isBlackoutFeatureEnabled) return; 
            const acc = e.accelerationIncludingGravity; if(!acc) return;
            const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
            
            if(delta > 25) { 
                const now = Date.now();
                if(now - blackoutState.lastShake > 1000) {
                    blackoutState.isActive = !blackoutState.isActive;
                    document.body.classList.toggle('blackout-active', blackoutState.isActive);
                    showToast(blackoutState.isActive ? "Boss Mode 🌑" : "Welcome Back");
                    vibrate();
                    renderUI(); 
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
        
        // --- HEADER BUTTONS ---
        const headerTimer = document.getElementById('header-timer-btn');
        const headerCounter = document.getElementById('header-counter-btn');
        const headerMic = document.getElementById('header-mic-btn');
        const headerCam = document.getElementById('header-cam-btn');
        const headerGesture = document.getElementById('header-gesture-btn'); 
        const headerHand = document.getElementById('header-hand-btn'); // Get the button

        if(headerHand) {
            headerHand.onclick = () => {
                if(!modules.vision) return;
                
                // Toggle State
                const isActive = !modules.vision.isActive;
                
                if (isActive) {
                    modules.vision.start();
                    headerHand.classList.add('header-btn-active');
                } else {
                    modules.vision.stop();
                    headerHand.classList.remove('header-btn-active');
                }
            };
        }
        
        const headerStealth = document.getElementById('header-stealth-btn');
if(headerStealth) {
    headerStealth.onclick = () => {
        document.body.classList.toggle('hide-controls');
        const isActive = document.body.classList.contains('hide-controls');
        headerStealth.classList.toggle('header-btn-active', isActive);
        showToast(isActive ? "Inputs Only Active" : "Controls Visible");
        
        // Force layout recalculation for the new huge buttons
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    };
}
        
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

        if(headerGesture) {
            headerGesture.onclick = () => {
                isGesturePadVisible = !isGesturePadVisible;
                headerGesture.classList.toggle('header-btn-active', isGesturePadVisible);
                const gpWrap = document.getElementById('gesture-pad-wrapper');
                if(gpWrap) {
                    if(isGesturePadVisible) {
                        gpWrap.classList.remove('hidden');
                        showToast("Pad Visible 🗒️");
                    } else {
                        gpWrap.classList.add('hidden');
                        showToast("Pad Hidden");
                    }
                }
                renderUI();
            };
        }
        
        if(headerCam) { 
            headerCam.onclick = () => {
                const isArActive = document.body.classList.contains('ar-active');
                const newState = !isArActive;
                if (newState) {
                    document.body.classList.add('ar-active');
                    headerCam.classList.add('header-btn-active');
                    if (modules.sensor) {
                        modules.sensor.toggleCamera(true); 
                        if (modules.sensor.videoEl) {
                            modules.sensor.videoEl.style.display = 'block';
                            modules.sensor.videoEl.className = 'ar-background-video';
                        }
                    }
                    showToast("AR Mode ON 📸");
                } else {
                    document.body.classList.remove('ar-active');
                    headerCam.classList.remove('header-btn-active');
                    if (modules.sensor) {
                        modules.sensor.toggleCamera(false);
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
// 1. Keep this at the TOP level (outside any functions)
let devGestureEngine = null;

function openDeveloperModal() { 
    const modal = document.getElementById('developer-modal');
    const container = document.getElementById('developer-controls-container');
    const visibilitySection = document.createElement('div');
    visibilitySection.className = "mb-6 p-3 bg-gray-900 rounded-lg border border-gray-700";
    visibilitySection.innerHTML = `
        <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">UI Visibility Overrides</h3>
        
        <div class="flex justify-between items-center mb-3">
            <span class="text-sm">Hide Voice Settings</span>
            <input type="checkbox" id="dev-hide-voice-toggle" class="h-5 w-5" ${appSettings.devHideVoiceSettings ? 'checked' : ''}>
        </div>

        <div class="flex justify-between items-center">
            <span class="text-sm">Hide Haptic Mapping</span>
            <input type="checkbox" id="dev-hide-haptic-toggle" class="h-5 w-5" ${appSettings.devHideHapticSettings ? 'checked' : ''}>
        </div>
    `;
    container.appendChild(visibilitySection);
    document.getElementById('dev-hide-voice-toggle').onchange = (e) => {
        appSettings.devHideVoiceSettings = e.target.checked;
        saveState(); // Ensure your save function is called
        if (window.settingsManager) window.settingsManager.renderUI(); 
    };

    document.getElementById('dev-hide-haptic-toggle').onchange = (e) => {
        appSettings.devHideHapticSettings = e.target.checked;
        saveState();
        if (window.settingsManager) window.settingsManager.renderUI();
    };
}
    container.innerHTML = ''; 
    const gConfig = modules.gestureEngine.config;

    const settings = [
        { key: 'tapDelay', label: 'Tap Delay (ms)', min: 100, max: 1500, step: 50 },
        { key: 'longPressTime', label: 'Long Press Time (ms)', min: 100, max: 1000, step: 50 },
        { key: 'swipeThreshold', label: 'Swipe Sensitivity', min: 10, max: 200, step: 10 },
        { key: 'tapPrecision', label: 'Tap Precision (px)', min: 5, max: 100, step: 5 }
    ];

    settings.forEach(s => {
        const div = document.createElement('div');
        div.className = 'space-y-2 mb-4';
        div.innerHTML = `
            <div class="flex justify-between text-xs font-bold text-gray-400">
                <span>${s.label}</span>
                <span id="val-${s.key}">${gConfig[s.key]}</span>
            </div>
            <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${gConfig[s.key]}" 
                   class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-app">
        `;
        const input = div.querySelector('input');
        input.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            document.getElementById(`val-${s.key}`).innerText = val;
            gConfig[s.key] = val; 
        });
        container.appendChild(div);
    });
// --- New: Visibility Toggles ---
const toggleSection = document.createElement('div');
toggleSection.className = 'mt-6 pt-4 border-t border-gray-700 space-y-4';
toggleSection.innerHTML = `
    <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tab Visibility (Playback)</h3>
    <label class="flex items-center justify-between cursor-pointer group">
        <span class="text-sm text-gray-300">Hide Voice Settings</span>
        <input type="checkbox" id="dev-hide-voice" ${appSettings.devHideVoiceSettings ? 'checked' : ''} class="w-5 h-5 accent-primary-app">
    </label>
    <label class="flex items-center justify-between cursor-pointer group">
        <span class="text-sm text-gray-300">Hide Haptic Mapping</span>
        <input type="checkbox" id="dev-hide-haptic" ${appSettings.devHideHapticSettings ? 'checked' : ''} class="w-5 h-5 accent-primary-app">
    </label>
`;

// Add event listeners for the toggles
toggleSection.querySelector('#dev-hide-voice').onchange = (e) => {
    appSettings.devHideVoiceSettings = e.target.checked;
};
toggleSection.querySelector('#dev-hide-haptic').onchange = (e) => {
    appSettings.devHideHapticSettings = e.target.checked;
};

container.appendChild(toggleSection);
    
    // Show the modal
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-90');
    }, 10);

    // --- CALL THE TESTER HERE ---
    initDevTestBed(); 
        const mainVideo = document.querySelector('video'); // Finds your main app camera
    const devPreview = document.getElementById('dev-camera-preview');
    
    if (mainVideo && devPreview && mainVideo.srcObject) {
        devPreview.srcObject = mainVideo.srcObject;
        logToDevBox("SYSTEM", "Camera feed synced to diagnostic area.");
    }
    
} // <--- Properly CLOSE the open function here

// 2. Define this separately (Top level)
function initDevTestBed() {
    const pad = document.getElementById('dev-touch-pad');
    if (!pad || devGestureEngine) return;

    devGestureEngine = new GestureEngine(pad, modules.gestureEngine.config, {
        onGesture: (data) => logToDevBox("GESTURE", data.name),
        onContinuous: (data) => logToDevBox("MATH", `Type: ${data.type}, Val: ${data.value.toFixed(2)}, Fingers: ${data.fingers}`)
    });
}

// 3. Define this separately (Top level)
function logToDevBox(title, data) {
    const logBox = document.getElementById('dev-debug-log');
    if (!logBox) return;
    const time = new Date().toLocaleTimeString().split(' ')[0];
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
    logBox.value = `[${time}] ${title}: ${dataString}\n` + logBox.value;
}

    function closeDeveloperModal() {
    const modal = document.getElementById('developer-modal');
    if (!modal) return;

    // --- NEW: Save settings permanently ---
    if (modules.gestureEngine) {
        const gConfig = modules.gestureEngine.config;
        
        // Map the live engine config back to your persistent appSettings
        appSettings.gestureTapDelay = gConfig.tapDelay;
        appSettings.gestureSwipeDist = gConfig.swipeThreshold; 
        appSettings.gestureLongPressTime = gConfig.longPressTime;
        appSettings.gestureTapPrecision = gConfig.tapPrecision;
        
        // Save to localStorage so they survive a page refresh
        if (typeof saveState === 'function') {
            saveState();
            showToast("Developer Settings Saved 💾"); // Optional: gives you visual feedback
        }
    }
    // --- EXISTING: Smooth close animation ---
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-90');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
   }
    
   
    window.closeDeveloperModal = closeDeveloperModal; 

    // --- DEVELOPER BUTTON LISTENERS ---
    const devSaveReloadBtn = document.getElementById('dev-save-reload-btn');
    if (devSaveReloadBtn) {
        devSaveReloadBtn.addEventListener('click', () => {
            closeDeveloperModal(); // Saves the current settings 
            setTimeout(() => {
                window.location.reload(); // Reloads to apply changes
            }, 100);
        });
    }

    const devNukeBtn = document.getElementById('dev-nuke-btn');
    if (devNukeBtn) {
        devNukeBtn.addEventListener('click', () => {
            if (confirm("☢️ WARNING: This will permanently wipe ALL saved settings, profiles, and sequences. Are you sure you want to proceed?")) {
                localStorage.clear(); // Wipes all data
                
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for(let registration of registrations) {
                            registration.unregister(); // Clears offline cache ghosts
                        }
                    });
                }
                
                window.location.reload(true); // Hard reboot
            }
        });
    }

} // <-- This is the final bracket for initGlobalListeners
   

function applyDeveloperVisibility() {
    const voiceSection = document.getElementById('voice-settings-section');
    const hapticSection = document.getElementById('morse-container');

    if (voiceSection) {
        if (appSettings.devHideVoiceSettings) {
            voiceSection.classList.add('hidden');
        } else {
            voiceSection.classList.remove('hidden');
        }
    }

    if (hapticSection) {
        if (appSettings.devHideHapticSettings) {
            hapticSection.classList.add('hidden');
        } else {
            hapticSection.classList.remove('hidden');
        }
    }
      }
window.applyDeveloperVisibility = applyDeveloperVisibility;
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the main application
    startApp(); 
    
    // 2. Immediately apply visibility overrides from developer settings
    if (typeof applyDeveloperVisibility === 'function') {
        applyDeveloperVisibility();
    }
});

