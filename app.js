// --- IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager } from './settings.js';
import { initComments } from './comments.js';

// --- FIREBASE INIT ---
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

// --- CONFIG & CONSTANTS ---
const CONFIG = {
    MAX_MACHINES: 4,
    DEMO_DELAY_BASE_MS: 798,
    SPEED_DELETE_DELAY: 400, // Increased slightly to differentiate tap vs hold
    SPEED_DELETE_INTERVAL: 100,
    STORAGE_KEY_SETTINGS: 'followMeAppSettings_v20', 
    STORAGE_KEY_STATE: 'followMeAppState_v20',
    INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' },
    MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' }
};

// Core Profile Data
const DEFAULT_PROFILE_SETTINGS = {
    currentInput: CONFIG.INPUTS.KEY9,
    currentMode: CONFIG.MODES.SIMON,
    sequenceLength: 20,
    machineCount: 1,
    simonChunkSize: 3,
    simonInterSequenceDelay: 500,
};

const PREMADE_PROFILES = {
    'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS } },
    'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 200 }},
    'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }},
    'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }},
    'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15 }}
};

const DEFAULT_APP = {
    // Globals
    globalUiScale: 100, 
    uiScaleMultiplier: 1.0, 
    showWelcomeScreen: true,
    gestureResizeMode: 'global',
    playbackSpeed: 1.0,
    
    // Toggles
    isAutoplayEnabled: true, 
    isUniqueRoundsAutoClearEnabled: true,
    isAudioEnabled: true,
    isHapticsEnabled: true,
    isSpeedDeletingEnabled: true,
    
    // Feature Toggles
    activeTheme: 'default',
    isBlackoutFeatureEnabled: false,
    isHapticMorseEnabled: false,
    showMicBtn: false,
    showCamBtn: false,
    autoInputMode: 'none',

    activeProfileId: 'profile_1',
    profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)),
    
    // RUNTIME: This separates "Saved Profiles" from "Current State"
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS))
};

// --- STATE ---
let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null };
let timers = { speedDelete: null, initialDelay: null, longPress: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };
let blackoutState = { isActive: false, lastTap: 0 };
let isDeleting = false; // Flag to prevent click if held

// --- CORE FUNCTIONS ---

// CHANGED: Now returns the runtime settings, not the saved profile
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
            // Deep merge profiles to ensure defaults exist if corrupted
            appSettings = { ...DEFAULT_APP, ...loaded, profiles: { ...DEFAULT_APP.profiles, ...(loaded.profiles || {}) } };
            
            // Ensure runtimeSettings exists (migration)
            if(!appSettings.runtimeSettings) {
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId]?.settings || DEFAULT_PROFILE_SETTINGS));
            }
        } else {
            // First boot: Load default profile into runtime
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles['profile_1'].settings));
        }

        if(st) appState = JSON.parse(st);
        if(!appState['current_session']) appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
        
    } catch(e) { 
        console.error("Load failed, resetting", e); 
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
        saveState();
    }
}

function vibrate() {
    if(appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10);
}

// --- HAPTIC MORSE LOGIC (SCALED) ---
function vibrateMorse(num) {
    if(!navigator.vibrate || !appSettings.isHapticMorseEnabled) return;
    
    // SCALE: Durations get shorter as speed increases
    const speed = appSettings.playbackSpeed || 1.0;
    const factor = 1.0 / speed; // If speed 2.0, duration is 0.5x
    
    const DOT = 100 * factor;
    const DASH = 300 * factor;
    const GAP = 100 * factor;
    
    let pattern = [];
    const n = parseInt(num);
    
    // 1-3: Dots
    if (n >= 1 && n <= 3) { for(let i=0; i<n; i++) { pattern.push(DOT); pattern.push(GAP); } } 
    // 4-6: Dash + Dots
    else if (n >= 4 && n <= 6) { pattern.push(DASH); pattern.push(GAP); for(let i=0; i<(n-3); i++) { pattern.push(DOT); pattern.push(GAP); } } 
    // 7-9: Dash + Dash + Dots
    else if (n >= 7 && n <= 9) { pattern.push(DASH); pattern.push(GAP); pattern.push(DASH); pattern.push(GAP); for(let i=0; i<(n-6); i++) { pattern.push(DOT); pattern.push(GAP); } }
    // 10+: Long
    else if (n >= 10) { pattern.push(DASH); pattern.push(DOT); }
    
    if(pattern.length > 0) navigator.vibrate(pattern);
}

function speak(text) {
    if(!appSettings.isAudioEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.2;
    window.speechSynthesis.speak(u);
}

function showToast(msg) {
    const t = document.getElementById('toast-notification');
    const m = document.getElementById('toast-message');
    if(!t || !m) return;
    m.textContent = msg;
    t.classList.remove('opacity-0', '-translate-y-10');
    setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000);
}

// --- BLACKOUT LOGIC (FIXED) ---
function toggleBlackout() {
    blackoutState.isActive = !blackoutState.isActive;
    document.body.classList.toggle('blackout-active', blackoutState.isActive);
    if(blackoutState.isActive) {
        if(appSettings.isAudioEnabled) speak("Stealth Active");
        document.getElementById('blackout-layer').addEventListener('touchstart', handleBlackoutTouch, {passive: false});
        // Remove desktop click listener to prevent conflict on hybrid devices
    } else {
        document.getElementById('blackout-layer').removeEventListener('touchstart', handleBlackoutTouch);
    }
}

function handleBlackoutTouch(e) {
    // 1. CHECK GESTURE FIRST (Exit Strategy)
    if(e.touches && e.touches.length === 3) {
        const now = Date.now();
        if(now - blackoutState.lastTap < 400) {
            toggleBlackout();
            e.preventDefault(); e.stopPropagation();
            return;
        }
        blackoutState.lastTap = now;
        e.preventDefault(); e.stopPropagation();
        return;
    }

    if(!blackoutState.isActive) return;
    
    // 2. Handle Input
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
        const cols = 3;
        const rows = (settings.currentInput === 'key12') ? 4 : 3;
        const c = Math.floor(x / (w / cols));
        const r = Math.floor(y / (h / rows));
        let num = (r * 3) + c + 1;
        if(num > 0 && num <= (settings.currentInput === 'key12' ? 12 : 9)) val = num.toString();
    }

    if(val) {
        addValue(val);
        speak(val);
        vibrateMorse(val);
    }
}

// --- GESTURES ---
function initGestures() {
    const target = document.body;
    
    // Blackout Toggle (3 fingers) - ON BODY (Entry Strategy)
    target.addEventListener('touchstart', (e) => {
        if(!appSettings.isBlackoutFeatureEnabled) return;
        if(e.touches.length === 3) {
            const now = Date.now();
            if(now - blackoutState.lastTap < 400) toggleBlackout();
            blackoutState.lastTap = now;
        }
    });

    // Pinch (Scale UI)
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
            
            if (appSettings.gestureResizeMode === 'sequence') {
                appSettings.uiScaleMultiplier = Math.min(Math.max(gestureState.startScale * ratio, 0.5), 2.5); 
                renderUI(); 
            } else {
                appSettings.globalUiScale = Math.min(Math.max(gestureState.startScale * ratio, 50), 150); 
                updateAllChrome();
            }
        }
    }, { passive: false });

    target.addEventListener('touchend', () => {
        if(gestureState.isPinching) { gestureState.isPinching = false; saveState(); }
    });
}

// --- GAME LOGIC ---
function addValue(value) {
    vibrate();
    const state = getState();
    const settings = getProfileSettings();
    let targetIndex = 0;
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    
    const limit = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? state.currentRound : settings.sequenceLength;
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) return;
    
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
             if(state.sequences[0].length === state.currentRound) {
                 disableInput(true);
                 setTimeout(playDemo, 250);
             }
        }
    }
}

function handleBackspace(e) {
    // If triggered by event, prevent ghost clicks from long press
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

function disableInput(disabled) {
    const pad = document.getElementById(`pad-${getProfileSettings().currentInput}`);
    if(pad) pad.querySelectorAll('button').forEach(b => b.disabled = disabled);
}

function playDemo() {
    const settings = getProfileSettings();
    const state = getState();
    const demoBtn = document.querySelector(`#pad-${settings.currentInput} button[data-action="play-demo"]`);
    if(demoBtn && demoBtn.disabled) return;
    
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
        if(!seq || seq.length === 0) return;
        playlist = seq.map(v => ({ val: v, machine: 0 }));
    }
    
    disableInput(true);
    if(demoBtn) demoBtn.disabled = true;
    
    let i = 0;
    const speed = appSettings.playbackSpeed || 1;
    const interval = CONFIG.DEMO_DELAY_BASE_MS / speed;
    
    function next() {
        if(i >= playlist.length) {
            disableInput(false);
            if(demoBtn) { demoBtn.innerHTML = '▶'; demoBtn.disabled = false; }
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
                state.sequences[0] = [];
                state.nextSequenceIndex = 0;
                state.currentRound++;
                if(state.currentRound > settings.sequenceLength) resetRounds();
                renderUI();
                saveState();
            }
            return;
        }
        
        const item = playlist[i];
        if(demoBtn) demoBtn.innerHTML = i + 1;
        const key = document.querySelector(`#pad-${settings.currentInput} button[data-value="${item.val}"]`);
        const visualClass = settings.currentInput === 'piano' ? 'flash' : (settings.currentInput === 'key9' ? 'key9-flash' : 'key12-flash');
        
        speak(item.val);
        vibrateMorse(item.val);
        
        if(key) { key.classList.add(visualClass); setTimeout(() => key.classList.remove(visualClass), 250 / speed); }
        const seqBoxes = document.getElementById('sequence-container').children;
        if(seqBoxes[item.machine]) {
            seqBoxes[item.machine].classList.add('bg-accent-app', 'scale-105');
            setTimeout(() => seqBoxes[item.machine].classList.remove('bg-accent-app', 'scale-105'), 250 / speed);
        }

        i++;
        setTimeout(next, interval);
    }
    next();
}

function renderUI() {
    const settings = getProfileSettings();
    const state = getState();
    const container = document.getElementById('sequence-container');
    
    ['key9', 'key12', 'piano'].forEach(k => {
        const el = document.getElementById(`pad-${k}`);
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none';
    });
    
    container.innerHTML = '';
    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const h = document.createElement('h2');
        h.className = "text-center text-2xl font-bold mb-4 w-full";
        h.textContent = `Round ${state.currentRound} / ${settings.sequenceLength}`;
        container.appendChild(h);
    }
    
    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4);
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;

    activeSeqs.forEach((seq, idx) => {
        const card = document.createElement('div');
        card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)]";
        const numGrid = document.createElement('div');
        numGrid.className = isLandscape ? "flex flex-wrap gap-2 justify-center" : "grid grid-cols-5 gap-2 justify-center";
        
        (seq || []).forEach(num => {
            const span = document.createElement('span');
            span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold";
            const scale = appSettings.uiScaleMultiplier || 1.0;
            span.style.width = (40 * scale) + 'px';
            span.style.height = (40 * scale) + 'px';
            span.style.fontSize = (1.2 * scale) + 'rem';
            span.textContent = num;
            numGrid.appendChild(span);
        });
        card.appendChild(numGrid);
        container.appendChild(card);
    });

    // Auto Inputs
    document.querySelectorAll('#mic-master-btn').forEach(btn => {
        btn.classList.toggle('hidden', !appSettings.showMicBtn);
        btn.classList.toggle('master-active', modules.sensor && modules.sensor.mode.audio);
    });
    document.querySelectorAll('#camera-master-btn').forEach(btn => {
        btn.classList.toggle('hidden', !appSettings.showCamBtn);
        btn.classList.toggle('master-active', modules.sensor && modules.sensor.mode.camera);
    });
    document.querySelectorAll('.reset-button').forEach(b => {
        b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none';
    });
}

function updateAllChrome() {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    if(appSettings.activeTheme !== 'default') document.body.classList.add(appSettings.activeTheme);
    document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`;
    renderUI();
}

window.onload = function() {
    try {
        loadState();
        initComments(db);
        initGestures(); 
        
        modules.sensor = new SensorEngine((val, src) => addValue(val), (msg) => showToast(msg));
        modules.sensor.setSensitivity('audio', -85); modules.sensor.setSensitivity('camera', 50);

        modules.settings = new SettingsManager(appSettings, {
            onUpdate: () => { updateAllChrome(); saveState(); },
            onSave: () => saveState(),
            onReset: () => { localStorage.clear(); location.reload(); },
            
            // PROFILE SWITCH: Now clones the profile into runtimeSettings
            onProfileSwitch: (id) => {
                appSettings.activeProfileId = id;
                // THIS IS THE KEY FIX: Reload runtime from saved preset
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
                
                // New Session for new profile
                appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
                
                updateAllChrome(); saveState();
            },
            
            // SAVE PROFILE: Saves CURRENT runtime into the preset library
            onProfileAdd: (name, settings = null, id = null) => {
                const newId = id || 'p_' + Date.now();
                // If explicit settings passed (rare), use them, else use current runtime
                const source = settings || appSettings.runtimeSettings;
                appSettings.profiles[newId] = { name, settings: JSON.parse(JSON.stringify(source)) };
                appSettings.activeProfileId = newId;
                updateAllChrome(); saveState();
            },
            
            onProfileRename: (name) => { appSettings.profiles[appSettings.activeProfileId].name = name; saveState(); },
            onProfileDelete: () => {
                if(Object.keys(appSettings.profiles).length <= 1) return alert("Keep at least one profile.");
                delete appSettings.profiles[appSettings.activeProfileId];
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
                // Fallback to first profile
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings));
                updateAllChrome(); saveState();
            }
        });

        updateAllChrome();

        document.querySelectorAll('.btn-pad-number, .piano-key-white, .piano-key-black').forEach(btn => btn.addEventListener('click', (e) => addValue(e.target.dataset.value)));
        
        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
            b.addEventListener('click', playDemo);
            const startLongPress = () => { timers.longPress = setTimeout(() => { appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled; showToast(`Autoplay: ${appSettings.isAutoplayEnabled?'ON':'OFF'}`); saveState(); vibrate(); }, 500); };
            const cancelLong = () => clearTimeout(timers.longPress);
            b.addEventListener('mousedown', startLongPress); b.addEventListener('touchstart', startLongPress, { passive: true });
            b.addEventListener('mouseup', cancelLong); b.addEventListener('mouseleave', cancelLong); b.addEventListener('touchend', cancelLong);
        });

        document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => b.addEventListener('click', () => { if(confirm("Reset to Round 1?")) resetRounds(); }));
        
        // FIXED BACKSPACE LISTENERS
        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            b.addEventListener('click', handleBackspace); 
            
            const startDelete = (e) => { 
                // Don't prevent default here to allow click to fire on quick taps
                isDeleting = false; 
                timers.initialDelay = setTimeout(() => { 
                    isDeleting = true; 
                    timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); 
                }, CONFIG.SPEED_DELETE_DELAY); 
            };
            const stopDelete = () => { 
                clearTimeout(timers.initialDelay); 
                clearInterval(timers.speedDelete); 
                // isDeleting remains true for a split second to block the 'click' event if it was a hold
                setTimeout(() => isDeleting = false, 50); 
            };
            
            b.addEventListener('mousedown', startDelete); 
            b.addEventListener('touchstart', startDelete, { passive: true }); // Passive true helps scrolling but here we just want non-blocking
            b.addEventListener('mouseup', stopDelete); 
            b.addEventListener('mouseleave', stopDelete); 
            b.addEventListener('touchend', stopDelete);
        });
        
        document.querySelectorAll('button[data-action="open-share"]').forEach(b => b.addEventListener('click', () => modules.settings.openShare()));
        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => b.onclick = () => modules.settings.openSettings());

        document.addEventListener('click', (e) => {
            if(e.target.closest('#camera-master-btn')) {
                const on = !modules.sensor.mode.camera;
                if(!document.getElementById('hidden-video')) {
                    const v = document.createElement('video'); v.id = 'hidden-video'; v.autoplay = true; v.muted = true; v.playsInline = true; v.style.display='none';
                    const c = document.createElement('canvas'); c.id = 'hidden-canvas'; c.style.display='none';
                    document.body.append(v, c);
                    modules.sensor.setupDOM(v, c);
                }
                modules.sensor.toggleCamera(on); renderUI();
            }
            if(e.target.closest('#mic-master-btn')) { const on = !modules.sensor.mode.audio; modules.sensor.toggleAudio(on); renderUI(); }
        });

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);

    } catch (error) { console.error("CRITICAL ERROR:", error); alert("App crashed: " + error.message); }
};
