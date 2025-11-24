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
    SPEED_DELETE_DELAY: 250,
    SPEED_DELETE_INTERVAL: 100,
    STORAGE_KEY_SETTINGS: 'followMeAppSettings_v14', 
    STORAGE_KEY_STATE: 'followMeAppState_v14',
    INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' },
    MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' }
};

// Core Profile Data (What is saved per profile)
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
    uiScaleMultiplier: 1.0, // Sequence Scale
    isDarkMode: true,
    showWelcomeScreen: true,
    gestureResizeMode: 'global',
    playbackSpeed: 1.0,
    
    // Global Toggles
    isAutoplayEnabled: true, 
    isUniqueRoundsAutoClearEnabled: true,
    isAudioEnabled: true,
    isHapticsEnabled: true,
    isSpeedDeletingEnabled: true,
    showMicBtn: false,
    showCamBtn: false,

    activeProfileId: 'profile_1',
    profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)),
};

// --- STATE ---
let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null };
let timers = { speedDelete: null, initialDelay: null, longPress: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };

// --- CORE FUNCTIONS ---

const getProfile = () => appSettings.profiles[appSettings.activeProfileId] || appSettings.profiles['profile_1'];
const getProfileSettings = () => getProfile().settings;
const getState = () => appState[appSettings.activeProfileId];

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
            // Safe merge
            appSettings = { 
                ...DEFAULT_APP, 
                ...loaded, 
                profiles: { ...DEFAULT_APP.profiles, ...(loaded.profiles || {}) } 
            };
        }
        
        if(st) appState = JSON.parse(st);
        
        if(!appSettings.profiles[appSettings.activeProfileId]) {
            appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
        }
        
        Object.keys(appSettings.profiles).forEach(id => {
            if(!appState[id]) {
                appState[id] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
            }
        });

    } catch(e) { 
        console.error("Load failed, resetting", e); 
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
        saveState();
    }
}

function vibrate() {
    if(appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10);
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

// --- GESTURE LOGIC ---
function initGestures() {
    const target = document.body;
    
    target.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            gestureState.isPinching = true;
            gestureState.startDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            
            if (appSettings.gestureResizeMode === 'sequence') {
                gestureState.startScale = appSettings.uiScaleMultiplier || 1.0;
            } else {
                gestureState.startScale = appSettings.globalUiScale || 100;
            }
        }
    }, { passive: false });

    target.addEventListener('touchmove', (e) => {
        if (gestureState.isPinching && e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            
            const ratio = dist / gestureState.startDist;
            
            if (appSettings.gestureResizeMode === 'sequence') {
                let newScale = gestureState.startScale * ratio;
                // Up to 300%
                newScale = Math.min(Math.max(newScale, 0.5), 3.0); 
                appSettings.uiScaleMultiplier = newScale;
                renderUI(); 
            } else {
                let newScale = gestureState.startScale * ratio;
                newScale = Math.min(Math.max(newScale, 50), 150); 
                appSettings.globalUiScale = newScale;
                updateAllChrome();
                
                const slider = document.getElementById('ui-scale-slider');
                if(slider) slider.value = newScale;
            }
        }
    }, { passive: false });

    target.addEventListener('touchend', () => {
        if(gestureState.isPinching) {
            gestureState.isPinching = false;
            saveState(); 
        }
    });
}

// --- GAME LOGIC ---

function addValue(value) {
    vibrate();
    const state = getState();
    const settings = getProfileSettings();
    
    let targetIndex = 0;
    if (settings.currentMode === CONFIG.MODES.SIMON) {
        targetIndex = state.nextSequenceIndex % settings.machineCount;
    }
    
    const currentSeq = state.sequences[targetIndex] || [];
    const limit = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? state.currentRound : settings.sequenceLength;
    
    if(currentSeq.length >= limit) return;
    
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

function handleBackspace() {
    vibrate();
    const state = getState();
    const settings = getProfileSettings();
    if(state.nextSequenceIndex === 0) return;
    
    let targetIndex = 0;
    if(settings.currentMode === CONFIG.MODES.SIMON) {
        targetIndex = (state.nextSequenceIndex - 1) % settings.machineCount;
    }
    
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
            if(demoBtn) demoBtn.innerHTML = '▶'; 
            if(demoBtn) demoBtn.disabled = false;
            
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
                state.sequences[0] = [];
                state.nextSequenceIndex = 0;
                state.currentRound++;
                if(state.currentRound > settings.sequenceLength) {
                    resetRounds();
                }
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
        if(key) {
            key.classList.add(visualClass);
            setTimeout(() => key.classList.remove(visualClass), 250 / speed);
        }
        
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

// --- UI RENDERING ---

function renderUI() {
    const settings = getProfileSettings();
    const state = getState();
    const container = document.getElementById('sequence-container');
    
    // 1. Show correct Pad
    ['key9', 'key12', 'piano'].forEach(k => {
        const el = document.getElementById(`pad-${k}`);
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none';
    });
    
    // 2. Render Numbers
    container.innerHTML = '';
    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const h = document.createElement('h2');
        h.className = "text-center text-2xl font-bold mb-4 w-full text-gray-900 dark:text-white";
        h.textContent = `Round ${state.currentRound} / ${settings.sequenceLength}`;
        container.appendChild(h);
    }
    
    let gridCols = settings.machineCount === 4 ? 4 : (settings.machineCount === 3 ? 3 : (settings.machineCount === 2 ? 2 : 1));
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) gridCols = 1;
    
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    
    // Detect Orientation for Grid Logic
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;

    activeSeqs.forEach((seq, idx) => {
        const card = document.createElement('div');
        card.className = "p-4 rounded-xl shadow-md bg-white dark:bg-gray-700 transition-all duration-200 min-h-[100px]";
        
        // Internal Grid Logic
        const numGrid = document.createElement('div');
        // Use Flex Wrap for landscape to fill space, Fixed Grid for portrait
        if(isLandscape) {
            numGrid.className = "flex flex-wrap gap-2 justify-center";
        } else {
            numGrid.className = "grid grid-cols-5 gap-2 justify-center"; 
        }
        
        (seq || []).forEach(num => {
            const span = document.createElement('span');
            span.className = "number-box bg-secondary-app text-white rounded-lg shadow-sm flex items-center justify-center font-bold";
            
            // Apply Sequence Scale
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

    // 3. Update Auto Input Buttons
    document.querySelectorAll('#mic-master-btn').forEach(btn => {
        btn.classList.toggle('hidden', !appSettings.showMicBtn);
        btn.classList.toggle('master-active', modules.sensor.mode.audio);
    });
    
    document.querySelectorAll('#camera-master-btn').forEach(btn => {
        btn.classList.toggle('hidden', !appSettings.showCamBtn);
        btn.classList.toggle('master-active', modules.sensor.mode.camera);
    });

    document.querySelectorAll('.reset-button').forEach(b => {
        b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none';
    });
}

function updateAllChrome() {
    document.body.classList.toggle('dark', appSettings.isDarkMode);
    document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`;
    
    // Handle resizing on orientation change
    window.removeEventListener('resize', renderUI);
    window.addEventListener('resize', renderUI);
    
    renderUI();
}

// --- INIT ---

window.onload = function() {
    try {
        loadState();
        
        initComments(db);
        initGestures(); 
        
        modules.sensor = new SensorEngine(
            (val, src) => addValue(val), 
            (msg) => showToast(msg)
        );
        modules.sensor.setSensitivity('audio', -85); 
        modules.sensor.setSensitivity('camera', 50);

        modules.settings = new SettingsManager(appSettings, {
            onUpdate: () => { updateAllChrome(); saveState(); },
            onSave: () => saveState(),
            onReset: () => { 
                localStorage.clear(); 
                location.reload(); 
            },
            onProfileSwitch: (id) => {
                appSettings.activeProfileId = id;
                if(!appState[id]) appState[id] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
                updateAllChrome();
                saveState();
            },
            onProfileAdd: (name) => {
                const id = 'p_' + Date.now();
                appSettings.profiles[id] = { name, settings: { ...DEFAULT_PROFILE_SETTINGS } };
                appState[id] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
                appSettings.activeProfileId = id;
                updateAllChrome();
                saveState();
            },
            onProfileRename: (name) => {
                appSettings.profiles[appSettings.activeProfileId].name = name;
                saveState();
            },
            onProfileDelete: () => {
                if(Object.keys(appSettings.profiles).length <= 1) return alert("Keep at least one profile.");
                delete appSettings.profiles[appSettings.activeProfileId];
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
                updateAllChrome();
                saveState();
            },
            onCustomSettingsChange: () => {
                // Optional: Logic to rename profile to "Custom" if desired, 
                // but user asked for it to say Custom. For now, we keep the name 
                // but could append " (Custom)" in the dropdown display logic.
            },
            onRequestPermissions: () => {
                if(typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                     DeviceMotionEvent.requestPermission().then(r => console.log(r)).catch(console.error);
                }
            }
        });

        // Initial Render
        updateAllChrome();

        // --- GLOBAL EVENT LISTENERS ---
        document.querySelectorAll('.btn-pad-number, .piano-key-white, .piano-key-black').forEach(btn => {
            btn.addEventListener('click', (e) => addValue(e.target.dataset.value));
        });

        // Play Demo + Long Press
        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
            b.addEventListener('click', playDemo);
            
            const startLongPress = (e) => {
                timers.longPress = setTimeout(() => {
                    appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled;
                    showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? 'ON' : 'OFF'}`);
                    // Sync UI checkbox in SettingsManager if open
                    if(modules.settings && modules.settings.dom.autoplay) {
                        modules.settings.dom.autoplay.checked = appSettings.isAutoplayEnabled;
                        modules.settings.dom.quickAutoplay.checked = appSettings.isAutoplayEnabled;
                    }
                    saveState();
                    vibrate();
                }, 500);
            };
            
            const cancelLong = () => clearTimeout(timers.longPress);
            
            b.addEventListener('mousedown', startLongPress);
            b.addEventListener('touchstart', startLongPress, { passive: true });
            b.addEventListener('mouseup', cancelLong);
            b.addEventListener('mouseleave', cancelLong);
            b.addEventListener('touchend', cancelLong);
        });

        document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => b.addEventListener('click', () => {
            if(confirm("Reset to Round 1?")) resetRounds();
        }));
        
        // Speed Delete Fix
        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            b.addEventListener('click', handleBackspace); // Click handler
            
            const startDelete = (e) => {
                if(e.type === 'touchstart') e.preventDefault(); // Prevent ghost clicks
                timers.initialDelay = setTimeout(() => {
                    timers.speedDelete = setInterval(handleBackspace, CONFIG.SPEED_DELETE_INTERVAL);
                }, CONFIG.SPEED_DELETE_DELAY);
            };
            
            const stopDelete = () => { 
                clearTimeout(timers.initialDelay); 
                clearInterval(timers.speedDelete); 
            };

            b.addEventListener('mousedown', startDelete);
            b.addEventListener('touchstart', startDelete);
            b.addEventListener('mouseup', stopDelete);
            b.addEventListener('mouseleave', stopDelete);
            b.addEventListener('touchend', stopDelete);
        });
        
        // Share & Settings
        document.querySelectorAll('button[data-action="open-share"]').forEach(b => {
            b.addEventListener('click', () => modules.settings.openShare());
        });
        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => b.onclick = () => modules.settings.openSettings());

        // Master Switch Logic
        document.addEventListener('click', (e) => {
            if(e.target.closest('#camera-master-btn')) {
                const on = !modules.sensor.mode.camera;
                if(!document.getElementById('hidden-video')) {
                    const v = document.createElement('video'); v.id = 'hidden-video'; v.autoplay = true; v.muted = true; v.playsInline = true; v.style.display='none';
                    const c = document.createElement('canvas'); c.id = 'hidden-canvas'; c.style.display='none';
                    document.body.append(v, c);
                    modules.sensor.setupDOM(v, c);
                }
                modules.sensor.toggleCamera(on);
                renderUI();
            }
            if(e.target.closest('#mic-master-btn')) {
                const on = !modules.sensor.mode.audio;
                modules.sensor.toggleAudio(on);
                renderUI();
            }
        });

        // Start Welcome Logic
        if(appSettings.showWelcomeScreen && modules.settings) {
             setTimeout(() => modules.settings.openSetup(), 500);
        }

    } catch (error) {
        console.error("CRITICAL ERROR:", error);
        alert("App crashed: " + error.message);
    }
};
