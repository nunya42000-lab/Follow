// app.js - Scavenger Hunt Fix Applied
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { initComments } from "./comments.js";
import { SensorEngine } from "./sensors.js";

// --- FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4",
  authDomain: "follow-me-app-de3e9.firebaseapp.com",
  projectId: "follow-me-app-de3e9",
  storageBucket: "follow-me-app-de3e9.firebasestorage.app",
  messagingSenderId: "957006680126",
  appId: "1:957006680126:web:6d679717d9277fd9ae816f"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- CONSTANTS ---
const SETTINGS_KEY = 'followMeAppSettings_v12'; 
const STATE_KEY = 'followMeAppState_v12';
const MAX_MACHINES = 4;
const INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
const MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };
const AUTO_INPUT = { OFF: '0', TONE: '1', PATTERN: '2', FUSION: '3' };

const DEFAULT_PROFILE_SETTINGS = {
    currentInput: INPUTS.KEY9,
    currentMode: MODES.SIMON,
    sequenceLength: 20,
    simonChunkSize: 3,
    simonInterSequenceDelay: 500,
    isAutoplayEnabled: true,
    isUniqueRoundsAutoClearEnabled: true,
    isAudioEnabled: true,
    isHapticsEnabled: true,
    isSpeedDeletingEnabled: true,
    uiScaleMultiplier: 1.0,
    machineCount: 1,
    shakeSensitivity: 10,
    audioSensitivity: -85,
    cameraSensitivity: 30,
    autoInputMode: AUTO_INPUT.OFF,
    shortcuts: []
};

const DEFAULT_APP_SETTINGS = {
    globalUiScale: 100,
    isDarkMode: true,
    showWelcomeScreen: true,
    activeProfileId: 'profile_1',
    profiles: {
        'profile_1': { name: "Default", settings: { ...DEFAULT_PROFILE_SETTINGS } },
        'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2 } }
    },
    playbackSpeed: 1.0
};

// --- STATE ---
let appSettings = { ...DEFAULT_APP_SETTINGS };
let appState = {};
let sensorEngine = null;
let isCameraOn = false;
let isMicOn = false;

// --- DOM ---
let els = {};

function assignDomElements() {
    els = {
        sequenceContainer: document.getElementById('sequence-container'),
        toast: document.getElementById('toast-notification'),
        toastMsg: document.getElementById('toast-message'),
        settingsModal: document.getElementById('settings-modal'),
        gameSetupModal: document.getElementById('game-setup-modal'),
        helpModal: document.getElementById('help-modal'),
        customModal: document.getElementById('custom-modal'),
        // Modal Parts
        modalTitle: document.getElementById('modal-title'),
        modalMsg: document.getElementById('modal-message'),
        modalConfirm: document.getElementById('modal-confirm'),
        modalCancel: document.getElementById('modal-cancel'),
        // Inputs (Pads)
        pads: {
            key9: document.getElementById('pad-key9'),
            key12: document.getElementById('pad-key12'),
            piano: document.getElementById('pad-piano')
        },
        // Sensors
        sensorLayer: document.getElementById('sensor-layer'),
        camFeed: document.getElementById('cam-feed'),
        procCanvas: document.getElementById('proc-canvas'),
        // FIX: Select by CLASS, not ID, to handle multiple instances
        camBtns: document.querySelectorAll('.camera-master-btn'),
        micBtns: document.querySelectorAll('.mic-master-btn'),
        // Sliders
        micSensSlider: document.getElementById('mic-sens-slider'),
        camSensSlider: document.getElementById('cam-sens-slider'),
        autoInputSlider: document.getElementById('auto-input-slider'),
        autoInputDesc: document.getElementById('auto-input-desc'),
        // Settings Inputs
        inputSelect: document.getElementById('input-select'),
        modeToggle: document.getElementById('mode-toggle'),
        machineSlider: document.getElementById('machines-slider'),
        lengthSlider: document.getElementById('sequence-length-slider'),
        // Profile Selectors
        configSelectSettings: document.getElementById('settings-config-select'),
        configSelectQuick: document.getElementById('quick-config-select'),
        
        themeToggle: document.getElementById('dark-mode-toggle'),
        tabNav: document.getElementById('settings-tab-nav'),
        // Profile Management
        configAdd: document.getElementById('config-add'),
        configRename: document.getElementById('config-rename'),
        configDelete: document.getElementById('config-delete'),
        activeProfileName: document.getElementById('active-profile-name'),
        // Quick Toggles
        quickAutoplay: document.getElementById('quick-autoplay-toggle'),
        quickAudio: document.getElementById('quick-audio-toggle'),
        settingsAutoplay: document.getElementById('settings-autoplay-toggle'),
        settingsAudio: document.getElementById('settings-audio-toggle'),
        globalResizeUp: document.getElementById('global-resize-up'),
        globalResizeDown: document.getElementById('global-resize-down')
    };
}

// --- LOGIC: CUSTOM PROFILE PROTECTION ---
function switchToCustomProfile() {
    if (appSettings.activeProfileId === 'custom') return; 
    
    const currentSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings));
    appSettings.profiles['custom'] = {
        name: "Custom (Unsaved)",
        settings: currentSettings
    };
    appState['custom'] = JSON.parse(JSON.stringify(appState[appSettings.activeProfileId] || getInitialState()));
    
    appSettings.activeProfileId = 'custom';
    updateProfileDropdowns();
    if(els.configSelectSettings) els.configSelectSettings.value = 'custom';
    if(els.configSelectQuick) els.configSelectQuick.value = 'custom';
    if(els.activeProfileName) els.activeProfileName.innerText = "Custom (Unsaved)";
}

function modifyProfileSetting(key, value) {
    if (appSettings.activeProfileId !== 'custom' && appSettings.profiles[appSettings.activeProfileId]) {
        switchToCustomProfile();
    }
    getSettings()[key] = value;
    saveState();
    updateAllChrome();
}

function updateProfileDropdowns() {
    const populate = (select) => {
        if(!select) return;
        select.innerHTML = '';
        Object.keys(appSettings.profiles).forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.innerText = appSettings.profiles[id].name;
            select.appendChild(opt);
        });
        select.value = appSettings.activeProfileId;
    };
    populate(els.configSelectSettings);
    populate(els.configSelectQuick);
}

// --- STORAGE ---
function loadState() {
    try {
        const sSettings = localStorage.getItem(SETTINGS_KEY);
        const sState = localStorage.getItem(STATE_KEY);
        if (sSettings) appSettings = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(sSettings) };
        if (sState) appState = JSON.parse(sState);
        
        if (!appSettings.profiles[appSettings.activeProfileId]) {
            appSettings.activeProfileId = Object.keys(appSettings.profiles)[0] || 'profile_1';
        }
        if (!appState[appSettings.activeProfileId]) {
            appState[appSettings.activeProfileId] = getInitialState();
        }
    } catch (e) { console.error("Load error", e); }
}

function saveState() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function getInitialState() {
    return { sequences: Array.from({ length: MAX_MACHINES }, () => []), nextSequenceIndex: 0, currentRound: 1 };
}

const getProfile = () => appSettings.profiles[appSettings.activeProfileId];
const getSettings = () => getProfile().settings;
const getState = () => appState[appSettings.activeProfileId];

// --- GAMEPLAY ---
function addValue(value, source = 'manual') {
    const valStr = String(value);
    if (source === 'manual') vibrate();

    const state = getState();
    const settings = getSettings();
    const mode = settings.currentMode;
    
    let targetIndex = 0;
    if (mode === MODES.UNIQUE_ROUNDS) {
        if (state.sequences[0].length >= state.currentRound) return;
        targetIndex = 0;
    } else {
        targetIndex = state.nextSequenceIndex % settings.machineCount;
        if (state.sequences[targetIndex] && state.sequences[targetIndex].length >= settings.sequenceLength) return;
    }

    state.sequences[targetIndex].push(valStr);
    state.nextSequenceIndex++;
    renderSequences();
    saveState();
    
    if (source !== 'manual') {
        showToast(`Detected: ${valStr} (${source})`);
        const btn = document.querySelector(`button[data-value="${valStr}"]`);
        if (btn) {
            btn.classList.add('key9-flash');
            setTimeout(() => btn.classList.remove('key9-flash'), 200);
        }
    }

    if (settings.isAutoplayEnabled) {
        if (mode === MODES.UNIQUE_ROUNDS && state.sequences[0].length === state.currentRound) {
            setTimeout(playDemo, 200);
        } else if (mode === MODES.SIMON) {
             const justFilledIndex = (state.nextSequenceIndex - 1) % settings.machineCount;
             if (justFilledIndex === settings.machineCount - 1) {
                 setTimeout(playDemo, 200);
             }
        }
    }
}

function handleBackspace() {
    vibrate(15);
    const state = getState();
    const settings = getSettings();
    if (state.nextSequenceIndex === 0) return;
    let targetIndex = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : (state.nextSequenceIndex - 1) % settings.machineCount;
    if (state.sequences[targetIndex].length > 0) {
        state.sequences[targetIndex].pop();
        state.nextSequenceIndex--;
        renderSequences();
        saveState();
    }
}

// --- SENSORS ---
function initSensors() {
    sensorEngine = new SensorEngine((num, src) => addValue(num, src), () => {});
    sensorEngine.setupDOM(els.camFeed, els.procCanvas);
    updateSensorState();
}

function updateSensorState() {
    const mode = getSettings().autoInputMode;
    const canMic = (mode === AUTO_INPUT.TONE || mode === AUTO_INPUT.FUSION);
    const canCam = (mode === AUTO_INPUT.PATTERN || mode === AUTO_INPUT.FUSION);

    // FIX: Iterate over the NodeList selected by CLASS
    els.camBtns.forEach(b => b.classList.toggle('hidden', !canCam));
    els.micBtns.forEach(b => b.classList.toggle('hidden', !canMic));

    if (!canMic && isMicOn) toggleMic();
    if (!canCam && isCameraOn) toggleCamera();

    sensorEngine.toggleCamera(isCameraOn);
    sensorEngine.toggleAudio(isMicOn);

    if (isCameraOn) {
        els.sensorLayer.classList.remove('hidden');
        document.body.classList.add('camera-active');
    } else {
        els.sensorLayer.classList.add('hidden');
        document.body.classList.remove('camera-active');
    }

    const descMap = { '0':'Disabled', '1':'Microphone Only', '2':'Camera Only', '3':'Fusion (Both)' };
    if(els.autoInputDesc) els.autoInputDesc.innerText = descMap[mode];
}

function toggleCamera() {
    const mode = getSettings().autoInputMode;
    if (mode === AUTO_INPUT.PATTERN || mode === AUTO_INPUT.FUSION) {
        isCameraOn = !isCameraOn;
        sensorEngine.toggleCamera(isCameraOn);
        els.camBtns.forEach(b => b.classList.toggle('master-active', isCameraOn));
        if (isCameraOn) {
            els.sensorLayer.classList.remove('hidden');
            document.body.classList.add('camera-active');
        } else {
            els.sensorLayer.classList.add('hidden');
            document.body.classList.remove('camera-active');
        }
    }
}

function toggleMic() {
    const mode = getSettings().autoInputMode;
    if (mode === AUTO_INPUT.TONE || mode === AUTO_INPUT.FUSION) {
        isMicOn = !isMicOn;
        sensorEngine.toggleAudio(isMicOn);
        els.micBtns.forEach(b => b.classList.toggle('master-active', isMicOn));
        if (isMicOn) showToast("Audio Listening...");
    }
}

// --- UI & LISTENERS ---
function renderSequences() {
    const state = getState();
    const settings = getSettings();
    if (!els.sequenceContainer) return;
    els.sequenceContainer.innerHTML = '';
    const activeSeqs = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    let cols = settings.machineCount;
    if (settings.currentMode === MODES.UNIQUE_ROUNDS) cols = 1;
    els.sequenceContainer.className = `grid gap-4 flex-grow mb-6 pt-1 max-w-5xl mx-auto ${cols === 1 ? 'grid-cols-1 max-w-xl' : (cols === 2 ? 'grid-cols-2' : 'grid-cols-'+cols)}`;
    if (settings.currentMode === MODES.UNIQUE_ROUNDS) {
        const header = document.createElement('div');
        header.className = "text-center text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 col-span-full shadow-text";
        header.innerText = `Round: ${state.currentRound} / ${settings.sequenceLength}`;
        els.sequenceContainer.appendChild(header);
    }
    activeSeqs.forEach((seq, idx) => {
        const div = document.createElement('div');
        const isCurrent = (state.nextSequenceIndex % settings.machineCount === idx && settings.currentMode === MODES.SIMON && settings.machineCount > 1);
        div.className = `p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] backdrop-blur-sm ${isCurrent ? 'bg-accent-app/90 scale-[1.02] ring-2 ring-primary-app' : 'bg-white/90 dark:bg-gray-700/90'}`;
        const size = 40 * settings.uiScaleMultiplier;
        const font = 1.1 * settings.uiScaleMultiplier;
        div.innerHTML = `<div class="flex flex-wrap gap-2">${seq.map(val => `<span class="bg-secondary-app text-white rounded-xl text-center shadow-sm flex items-center justify-center font-bold" style="width:${size}px; height:${size}px; font-size:${font}rem">${val}</span>`).join('')}</div>`;
        els.sequenceContainer.appendChild(div);
    });
}

function updateAllChrome() {
    const settings = getSettings();
    Object.values(els.pads).forEach(pad => pad.style.display = 'none');
    if (settings.currentInput === INPUTS.KEY9) els.pads.key9.style.display = 'block';
    if (settings.currentInput === INPUTS.KEY12) els.pads.key12.style.display = 'block';
    if (settings.currentInput === INPUTS.PIANO) els.pads.piano.style.display = 'block';
    document.body.className = appSettings.isDarkMode ? 'dark min-h-screen flex flex-col font-sans p-4 relative overflow-x-hidden' : 'light min-h-screen flex flex-col font-sans p-4 relative overflow-x-hidden';
    if(isCameraOn) document.body.classList.add('camera-active');
    
    if(els.quickAutoplay) els.quickAutoplay.checked = settings.isAutoplayEnabled;
    if(els.settingsAutoplay) els.settingsAutoplay.checked = settings.isAutoplayEnabled;
    if(els.quickAudio) els.quickAudio.checked = settings.isAudioEnabled;
    if(els.settingsAudio) els.settingsAudio.checked = settings.isAudioEnabled;
    if(els.autoInputSlider) els.autoInputSlider.value = settings.autoInputMode;
    if(els.modeToggle) els.modeToggle.checked = (settings.currentMode === MODES.UNIQUE_ROUNDS);
    if(els.inputSelect) els.inputSelect.value = settings.currentInput;
    if(els.machineSlider) els.machineSlider.value = settings.machineCount;
    if(els.lengthSlider) els.lengthSlider.value = settings.sequenceLength;
    if(els.activeProfileName) els.activeProfileName.innerText = appSettings.profiles[appSettings.activeProfileId].name;
    
    renderSequences();
    updateSensorState();
}

// --- UTILS ---
function speak(text) {
    const settings = getSettings();
    if (!settings.isAudioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.2;
    window.speechSynthesis.speak(u);
}
function vibrate(ms = 10) { if (getSettings().isHapticsEnabled && navigator.vibrate) navigator.vibrate(ms); }
function showToast(msg) {
    if(!els.toast) return;
    els.toastMsg.innerText = msg;
    els.toast.classList.remove('opacity-0', '-translate-y-10');
    setTimeout(() => els.toast.classList.add('opacity-0', '-translate-y-10'), 2000);
}
function playDemo() {
    const state = getState();
    const settings = getSettings();
    const seq = state.sequences[0];
    if (seq.length === 0) return;
    let i = 0;
    const speed = appSettings.playbackSpeed || 1.0;
    const delay = 800 / speed;
    function next() {
        if (i >= seq.length) {
            if (settings.currentMode === MODES.UNIQUE_ROUNDS && settings.isUniqueRoundsAutoClearEnabled) {
                setTimeout(() => {
                    state.currentRound++;
                    state.sequences[0] = [];
                    state.nextSequenceIndex = 0;
                    saveState();
                    renderSequences();
                    speak("Next Round");
                }, 500);
            }
            return;
        }
        const val = seq[i];
        speak(val);
        const btn = document.querySelector(`button[data-value="${val}"]`);
        if (btn) {
            btn.classList.add('key9-flash');
            setTimeout(() => btn.classList.remove('key9-flash'), 200);
        }
        i++;
        setTimeout(next, delay);
    }
    next();
}
function toggleModal(modal, show) {
    if (!modal) return;
    if (show) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.querySelector('div').classList.remove('scale-90');
    } else {
        modal.querySelector('div').classList.add('scale-90');
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('pointer-events-none'), 300);
    }
}

// --- INIT ---
function initListeners() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const { action, value, tab } = btn.dataset;
        if (value) addValue(value);
        if (action === 'backspace') handleBackspace();
        if (action === 'open-settings') { updateAllChrome(); toggleModal(els.settingsModal, true); }
        if (action === 'play-demo') playDemo();
        if (action === 'restore-defaults') { localStorage.clear(); location.reload(); }
        if (action === 'open-help') toggleModal(els.helpModal, true);
        if (action === 'open-comments') document.getElementById('open-comment-modal').click();
        
        // FIX: Use data-action for camera/mic, not brittle IDs
        if (action === 'toggle-camera') toggleCamera();
        if (action === 'toggle-mic') toggleMic();

        if (tab) {
            document.querySelectorAll('.settings-tab-content').forEach(t => t.classList.add('hidden'));
            document.getElementById(`settings-tab-${tab}`).classList.remove('hidden');
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active-tab'));
            btn.classList.add('active-tab');
        }
    });
    
    const switchProfile = (e) => {
        appSettings.activeProfileId = e.target.value;
        updateAllChrome();
        saveState();
    };
    if(els.configSelectSettings) els.configSelectSettings.onchange = switchProfile;
    if(els.configSelectQuick) els.configSelectQuick.onchange = switchProfile;

    if(els.configAdd) els.configAdd.onclick = () => {
        const name = prompt("New Profile Name:");
        if(name) {
            const id = 'profile_' + Date.now();
            appSettings.profiles[id] = { name, settings: { ...DEFAULT_PROFILE_SETTINGS } };
            appSettings.activeProfileId = id;
            appState[id] = getInitialState();
            saveState();
            updateProfileDropdowns();
            updateAllChrome();
        }
    };
    if(els.configRename) els.configRename.onclick = () => {
        if(appSettings.activeProfileId === 'custom') return alert("Save this custom profile as 'New' to rename it.");
        const name = prompt("Rename Profile:", appSettings.profiles[appSettings.activeProfileId].name);
        if(name) {
            appSettings.profiles[appSettings.activeProfileId].name = name;
            saveState();
            updateProfileDropdowns();
            if(els.activeProfileName) els.activeProfileName.innerText = name;
        }
    };
    if(els.configDelete) els.configDelete.onclick = () => {
        if(Object.keys(appSettings.profiles).length <= 1) return alert("Cannot delete last profile.");
        if(confirm("Delete this profile?")) {
            delete appSettings.profiles[appSettings.activeProfileId];
            appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
            saveState();
            updateProfileDropdowns();
            updateAllChrome();
        }
    };

    const wrap = (key, val) => modifyProfileSetting(key, val);
    if(els.modeToggle) els.modeToggle.onchange = (e) => wrap('currentMode', e.target.checked ? MODES.UNIQUE_ROUNDS : MODES.SIMON);
    if(els.inputSelect) els.inputSelect.onchange = (e) => wrap('currentInput', e.target.value);
    if(els.machineSlider) els.machineSlider.oninput = (e) => wrap('machineCount', parseInt(e.target.value));
    if(els.lengthSlider) els.lengthSlider.oninput = (e) => wrap('sequenceLength', parseInt(e.target.value));
    if(els.autoInputSlider) els.autoInputSlider.oninput = (e) => wrap('autoInputMode', String(e.target.value));
    
    const handleAutoplay = (val) => { 
        modifyProfileSetting('isAutoplayEnabled', val); 
        if(els.quickAutoplay) els.quickAutoplay.checked = val; 
        if(els.settingsAutoplay) els.settingsAutoplay.checked = val; 
    };
    const handleAudio = (val) => { 
        modifyProfileSetting('isAudioEnabled', val); 
        if(els.quickAudio) els.quickAudio.checked = val; 
        if(els.settingsAudio) els.settingsAudio.checked = val; 
    };

    if(els.quickAutoplay) els.quickAutoplay.onchange = (e) => handleAutoplay(e.target.checked);
    if(els.settingsAutoplay) els.settingsAutoplay.onchange = (e) => handleAutoplay(e.target.checked);
    if(els.quickAudio) els.quickAudio.onchange = (e) => handleAudio(e.target.checked);
    if(els.settingsAudio) els.settingsAudio.onchange = (e) => handleAudio(e.target.checked);

    if(els.themeToggle) els.themeToggle.onchange = (e) => { appSettings.isDarkMode = e.target.checked; updateAllChrome(); saveState(); };
    if(els.globalResizeUp) els.globalResizeUp.onclick = () => { appSettings.globalUiScale += 10; document.documentElement.style.fontSize = appSettings.globalUiScale + '%'; saveState(); };
    if(els.globalResizeDown) els.globalResizeDown.onclick = () => { appSettings.globalUiScale -= 10; document.documentElement.style.fontSize = appSettings.globalUiScale + '%'; saveState(); };

    document.getElementById('close-settings').onclick = () => toggleModal(els.settingsModal, false);
    document.getElementById('close-help').onclick = () => toggleModal(els.helpModal, false);
    document.getElementById('close-game-setup-modal').onclick = () => toggleModal(els.gameSetupModal, false);

    initComments(db);
    initSensors();
}

// FIX: Safer load sequence
const startApp = () => {
    assignDomElements();
    loadState();
    document.documentElement.style.fontSize = appSettings.globalUiScale + '%';
    updateProfileDropdowns();
    updateAllChrome();
    initListeners();
    if (appSettings.showWelcomeScreen) toggleModal(els.gameSetupModal, true);
};

// Ensure DOM is ready before running
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
