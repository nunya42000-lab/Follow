import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- CUSTOM MODULE IMPORTS ---
import { CONFIG, DEFAULT_APP, DEFAULT_PROFILE_SETTINGS } from './constants.js';
import { applyTheme } from './utils.js';
import { initCore, getState, saveState, loadState, addValue } from './core.js';
import { initUI, renderUI, updateAllChrome, disableInput } from './ui.js';
import { initEvents, initGlobalListeners } from './events.js';
import { initGestureHandler, initGestureEngine } from './gestureHandler.js';

// --- ALREADY EXTRACTED MODULES ---
import { SettingsManager } from './settings.js';
import { SensorEngine } from './sensors.js';
import { VisionEngine } from './vision.js';
import { VoiceCommander } from './voice.js';
import { initComments } from './comments.js';

// --- FIREBASE SETUP ---
const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

enableIndexedDbPersistence(db).catch((err) => {
    console.warn("Persistence error:", err.code);
});

// --- GLOBAL APP STATE ---
export let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
export let appState = {};
export let modules = { sensor: null, settings: null, vision: null, gestureEngine: null };
export let voiceModule = null;

// UI/Interaction State
export let isGesturePadVisible = false;
export let blackoutState = { isActive: false, lastShake: 0 }; 
export let gestureState = { startDist: 0, startScale: 1, isPinching: false };
export let simpleTimer = { interval: null, startTime: 0, elapsed: 0, isRunning: false };
export let simpleCounter = { value: 0 };

// Shared Actions
export const globalTimerActions = { start: null, stop: null, reset: null };
export const globalCounterActions = { increment: null, reset: null };

// --- HELPERS ---
const getProfileSettings = () => appSettings.runtimeSettings;

// --- INITIALIZE DEPENDENCIES ---
initCore({
    getAppSettings: () => appSettings,
    getState: () => appState,
    getProfileSettings: getProfileSettings,
    saveState: () => saveState(appSettings, appState),
    renderUI: renderUI,
    disableInput: disableInput,
    globalTimerActions: globalTimerActions,
    globalCounterActions: globalCounterActions
});

initUI({
    getAppSettings: () => appSettings,
    getState: () => appState['current_session'],
    getProfileSettings: getProfileSettings,
    saveState: () => saveState(appSettings, appState),
    getModules: () => modules,
    getVoiceModule: () => voiceModule,
    getBlackoutState: () => blackoutState,
    getGesturePadVisible: () => isGesturePadVisible
});

initEvents({
    getAppSettings: () => appSettings,
    getState: () => appState['current_session'],
    getProfileSettings: getProfileSettings,
    saveState: () => saveState(appSettings, appState),
    getModules: () => modules,
    getVoiceModule: () => voiceModule,
    getBlackoutState: () => blackoutState,
    getGesturePadVisible: () => isGesturePadVisible,
    setGesturePadVisible: (val) => { isGesturePadVisible = val; },
    simpleTimer: simpleTimer,
    simpleCounter: simpleCounter,
    globalTimerActions: globalTimerActions,
    globalCounterActions: globalCounterActions
});

initGestureHandler({
    getAppSettings: () => appSettings,
    getProfileSettings: getProfileSettings,
    saveState: () => saveState(appSettings, appState),
    getState: () => appState['current_session'],
    getBlackoutState: () => blackoutState,
    getGesturePadVisible: () => isGesturePadVisible,
    setGesturePadVisible: (val) => { isGesturePadVisible = val; },
    getModules: () => modules
});

// --- MAIN START SEQUENCE ---
const startApp = () => {
    // Load local data
    const loaded = loadState();
    appSettings = loaded.settings;
    appState = loaded.state;

    // Initialize Settings Manager
    modules.settings = new SettingsManager(appSettings, {
        onSave: () => saveState(appSettings, appState),
        onUpdate: (type) => (type === 'mode_switch') ? renderUI() : updateAllChrome(),
        onReset: () => { localStorage.clear(); location.reload(); },
        onProfileSwitch: (id) => {
            appSettings.activeProfileId = id;
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
            saveState(appSettings, appState);
            renderUI();
        }
    });

    // Initialize Engines
    modules.sensor = new SensorEngine((val) => addValue(val));
    modules.settings.sensorEngine = modules.sensor;

    modules.vision = new VisionEngine((gesture) => {
        // Hand gesture logic handled in gestureHandler
    });

    voiceModule = new VoiceCommander({
        onStatus: (msg) => console.log(msg),
        onInput: (val) => addValue(val),
        onCommand: (cmd) => { /* logic moved to voice.js handler */ }
    });

    // Run Initializers
    updateAllChrome();
    initComments(db);
    initGlobalListeners();
    initGestureEngine(gestureState);
    
    // Auto-Input Modes
    if (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') modules.sensor.toggleAudio(true);
    if (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') modules.sensor.toggleCamera(true);
    
    renderUI();
};

document.addEventListener('DOMContentLoaded', startApp);
