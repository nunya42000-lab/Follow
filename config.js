// config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4",
  authDomain: "follow-me-app-de3e9.firebaseapp.com",
  projectId: "follow-me-app-de3e9",
  storageBucket: "follow-me-app-de3e9.firebasestorage.app",
  messagingSenderId: "957006680126",
  appId: "1:957006680126:web:6d679717d9277fd9ae816f"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- CONSTANTS ---
export const MAX_MACHINES = 4;
export const DEMO_DELAY_BASE_MS = 798;
export const SPEED_DELETE_INITIAL_DELAY = 250;
export const SPEED_DELETE_INTERVAL_MS = 10;    
export const SHAKE_BASE_THRESHOLD = 25; 
export const SHAKE_TIMEOUT_MS = 500; 
export const FLASH_COOLDOWN_MS = 250; 

export const SETTINGS_KEY = 'followMeAppSettings_v7';
export const STATE_KEY = 'followMeAppState_v7';

export const INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
export const MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };
export const AUTO_INPUT_MODES = { OFF: '0', TONE: '1', PATTERN: '2' }; 

export const SHORTCUT_TRIGGERS = {
    'none': 'Select Trigger...',
    'shake': 'Shake Device (Experimental)',
    'longpress_backspace': 'Long Press Backspace',
    'longpress_play': 'Long Press Play',
    'longpress_settings': 'Long Press Settings',
    'tilt_left': 'Tilt Left (Experimental)',
    'tilt_right': 'Tilt Right (Experimental)',
    'swipe_up': 'Swipe Up (Screen)',
    'swipe_down': 'Swipe Down (Screen)',
    'swipe_left': 'Swipe Left (Screen)',
    'swipe_right': 'Swipe Right (Screen)'
};

export const SHORTCUT_ACTIONS = {
    'none': 'Select Action...',
    'play_demo': 'Play Demo',
    'reset_rounds': 'Reset Rounds (Confirm)',
    'clear_all': 'Clear All (Confirm)',
    'clear_last': 'Clear Last (Backspace)',
    'toggle_autoplay': 'Toggle Autoplay',
    'toggle_audio': 'Toggle Audio',
    'toggle_haptics': 'Toggle Haptics',
    'toggle_dark_mode': 'Toggle Dark Mode',
    'open_settings': 'Open/Close Settings',
    'open_help': 'Open/Close Help',
    'next_profile': 'Switch to Next Profile',
    'prev_profile': 'Switch to Previous Profile'
};

export const PIANO_SPEAK_MAP = {
    'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B',
    '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
};

export const VOICE_VALUE_MAP = {
    'one': '1', 'two': '2', 'to': '2', 'three': '3', 'four': '4', 'for': '4', 'five': '5',
    'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
    'eleven': '11', 'twelve': '12',
    'see': 'C', 'dee': 'D', 'e': 'E', 'eff': 'F', 'gee': 'G', 'eh': 'A', 'be': 'B',
    'c': 'C', 'd': 'D', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'
};

export const DEFAULT_PROFILE_SETTINGS = {
    currentInput: INPUTS.KEY9,
    currentMode: MODES.SIMON,
    sequenceLength: 20,
    simonChunkSize: 3,
    simonInterSequenceDelay: 500,
    isAutoplayEnabled: true, 
    isUniqueRoundsAutoClearEnabled: true,
    isAudioEnabled: true,
    isVoiceInputEnabled: true,
    isHapticsEnabled: true,
    isSpeedDeletingEnabled: true, 
    uiScaleMultiplier: 1.0, 
    machineCount: 1,
    shortcuts: [], 
    shakeSensitivity: 10,
    autoInputMode: AUTO_INPUT_MODES.OFF, 
    flashSensitivity: 50, 
    cameraGridConfig9: { top: '25%', left: '25%', width: '50%', height: '50%' },
    cameraGridConfig12: { top: '25%', left: '20%', width: '60%', height: '40%' }
};

export const DEFAULT_APP_SETTINGS = {
    globalUiScale: 100,
    isDarkMode: true,
    showWelcomeScreen: true,
    activeProfileId: 'profile_1',
    profiles: {},
    playbackSpeed: 1.0,
};

export const PREMADE_PROFILES = {
    'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS } },
    'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 200 }},
    'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }},
    'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: INPUTS.PIANO }},
    'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: MODES.UNIQUE_ROUNDS, sequenceLength: 15 }}
};
