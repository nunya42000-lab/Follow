import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager } from './settings.js';
import { initComments } from './comments.js';

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

const CONFIG = {
    MAX_MACHINES: 4,
    DEMO_DELAY_BASE_MS: 798,
    SPEED_DELETE_DELAY: 400, 
    SPEED_DELETE_INTERVAL: 100,
    STORAGE_KEY_SETTINGS: 'followMeAppSettings_v26',
    STORAGE_KEY_STATE: 'followMeAppState_v26',
    INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' },
    MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' }
};

// --- PREMADE THEMES ---
export const PREMADE_THEMES = {
    'default': { name: "Default Dark", p1: "#4f46e5", p2: "#4338ca", s1: "#1f2937", s2: "#374151" },
    'light':   { name: "Light Mode",   p1: "#4f46e5", p2: "#4338ca", s1: "#f3f4f6", s2: "#ffffff" },
    'ocean':   { name: "Ocean Blue",   p1: "#0ea5e9", p2: "#0284c7", s1: "#0f172a", s2: "#1e293b" },
    'matrix':  { name: "The Matrix",   p1: "#003b00", p2: "#005500", s1: "#000000", s2: "#0a0a0a" },
    'cyber':   { name: "Cyberpunk",    p1: "#d946ef", p2: "#c026d3", s1: "#0f0b1e", s2: "#1a1625" },
    'volcano': { name: "Volcano",      p1: "#b91c1c", p2: "#991b1b", s1: "#2b0a0a", s2: "#450a0a" },
    'forest':  { name: "Deep Forest",  p1: "#166534", p2: "#14532d", s1: "#052e16", s2: "#064e3b" },
    // Add up to 20 themes here following this structure
};

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
    'profile_3': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }},
};

const DEFAULT_APP = {
    globalUiScale: 100, 
    uiScaleMultiplier: 1.0, 
    showWelcomeScreen: true,
    gestureResizeMode: 'global',
    playbackSpeed: 1.0,
    
    isAutoplayEnabled: true, 
    isUniqueRoundsAutoClearEnabled: true,
    isAudioEnabled: true,
    isHapticsEnabled: true,
    isSpeedDeletingEnabled: true,
    
    activeTheme: 'default',
    customThemes: {}, 
    sensorAudioThresh: -85,
    sensorCamThresh: 30,

    isBlackoutFeatureEnabled: false,
    isHapticMorseEnabled: false,
    showMicBtn: false,
    showCamBtn: false,
    autoInputMode: 'none',

    activeProfileId: 'profile_1',
    profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)),
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS))
};

let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null };
let timers = { speedDelete: null, initialDelay: null, longPress: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };
let blackoutState = { isActive: false, lastShake: 0 }; 
let isDeleting = false; 

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
    } catch(e) { 
        console.error("Load failed, resetting", e); 
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
        saveState();
    }
}

function vibrate() { if(appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10); }
function showToast(msg) {
    const t = document.getElementById('toast-notification');
    const m = document.getElementById('toast-message');
    if(!t || !m) return;
    m.textContent = msg;
    t.classList.remove('opacity-0', '-translate-y-10');
    setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000);
}

function applyTheme(themeKey) {
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');

    let t = appSettings.customThemes[themeKey];
    if (!t && PREMADE_THEMES[themeKey]) t = PREMADE_THEMES[themeKey];
    if (!t) t = PREMADE_THEMES['default'];

    body.style.setProperty('--primary', t.p1);
    body.style.setProperty('--primary-hover', t.p2);
    body.style.setProperty('--bg-main', t.s1);
    body.style.setProperty('--bg-modal', t.s2);
    body.style.setProperty('--card-bg', t.s2);
    body.style.setProperty('--bg-input', t.s2); 
    body.style.setProperty('--border', t.s2); 
    
    // Contrast Check
    const getContrastYIQ = (hex) => {
        hex = hex.replace("#", "");
        var r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
        return (((r*299)+(g*587)+(b*114))/1000 >= 128) ? '#111827' : '#ffffff';
    }
    const textColor = getContrastYIQ(t.s1);
    body.style.setProperty('--text-main', textColor);
    body.style.setProperty('--text-muted', (textColor === '#ffffff') ? '#9ca3af' : '#4b5563');
    body.style.setProperty('--btn-control-bg', t.s2);
}

function updateAllChrome() {
    applyTheme(appSettings.activeTheme);
    document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`;
    renderUI();
}

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
    renderUI(); saveState();
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
        renderUI(); saveState();
    }
}

function renderUI() {
    const container = document.getElementById('sequence-container');
    container.innerHTML = '';
    const settings = getProfileSettings();
    
    ['key9', 'key12', 'piano'].forEach(k => {
        const el = document.getElementById(`pad-${k}`);
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none';
    });
    
    const state = getState();
    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const h = document.createElement('h2');
        h.className = "text-center text-2xl font-bold mb-4 w-full";
        h.textContent = `Round ${state.currentRound} / ${settings.sequenceLength}`;
        container.appendChild(h);
    }
    
    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4);
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;

    activeSeqs.forEach((seq) => {
        const card = document.createElement('div');
        card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)]";
        const numGrid = document.createElement('div');
        numGrid.className = "flex flex-wrap gap-2 justify-center";
        (seq || []).forEach(num => {
            const span = document.createElement('span');
            span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold";
            const scale = appSettings.uiScaleMultiplier || 1.0;
            span.style.width = (40 * scale) + 'px'; span.style.height = (40 * scale) + 'px'; span.style.fontSize = (1.2 * scale) + 'rem';
            span.textContent = num;
            numGrid.appendChild(span);
        });
        card.appendChild(numGrid);
        container.appendChild(card);
    });

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

window.onload = function() {
    loadState();
    initComments(db);
    
    modules.sensor = new SensorEngine((val) => addValue(val), (msg) => showToast(msg));
    if (appSettings.sensorAudioThresh) modules.sensor.setSensitivity('audio', appSettings.sensorAudioThresh);
    if (appSettings.sensorCamThresh) modules.sensor.setSensitivity('camera', appSettings.sensorCamThresh);

    modules.settings = new SettingsManager(appSettings, {
        onUpdate: () => { updateAllChrome(); saveState(); },
        onSave: () => saveState(),
        onReset: () => { localStorage.clear(); location.reload(); },
        onProfileSwitch: (id) => {
            appSettings.activeProfileId = id;
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
            appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
            updateAllChrome(); saveState();
        },
    }, modules.sensor); // Pass Sensor Engine here

    updateAllChrome();
    
    document.querySelectorAll('.btn-pad-number, .piano-key-white, .piano-key-black').forEach(btn => btn.addEventListener('click', (e) => addValue(e.target.dataset.value)));
    
    document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
        b.addEventListener('click', handleBackspace); 
        const startDelete = (e) => { 
            isDeleting = false; 
            timers.initialDelay = setTimeout(() => { isDeleting = true; timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); }, CONFIG.SPEED_DELETE_DELAY); 
        };
        const stopDelete = () => { clearTimeout(timers.initialDelay); clearInterval(timers.speedDelete); setTimeout(() => isDeleting = false, 50); };
        
        b.addEventListener('mousedown', startDelete); 
        b.addEventListener('touchstart', startDelete, { passive: true });
        // Interruptions
        b.addEventListener('mouseup', stopDelete); 
        b.addEventListener('mouseleave', stopDelete); 
        b.addEventListener('touchend', stopDelete);
        b.addEventListener('touchcancel', stopDelete); // Crucial fix for stuck button
    });

    document.querySelectorAll('button[data-action="open-settings"]').forEach(b => b.onclick = () => modules.settings.openSettings());
};
