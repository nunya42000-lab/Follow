/* ========================================
   FILE: config.js
   ======================================== */

export const CONFIG = {
    MAX_MACHINES: 10,
    STORAGE_KEY_SETTINGS: 'app_settings_v1', // Added for state.js consistency
    STORAGE_KEY_STATE: 'app_state_v1',       // Added for state.js consistency
    INPUTS: {
        KEY9: 'key9',
        KEY12: 'key12',
        PIANO: 'piano'
    },
    MODES: {
        SIMON: 'simon',
        UNIQUE_ROUNDS: 'unique_rounds'
    }
};

/**
 * Default settings applied to every new profile created.
 */
export const DEFAULT_PROFILE_SETTINGS = {
    sequenceLength: 10,
    currentInput: CONFIG.INPUTS.KEY9,
    currentMode: CONFIG.MODES.SIMON,
    machineCount: 1,
    simonChunkSize: 0,
    simonInterSequenceDelay: 1000,
};

/**
 * The master blueprint for the application's global state.
 * Includes a default profile and runtimeSettings to prevent initialization errors.
 */
export const DEFAULT_APP = {
    // UI and Display
    globalUiScale: 100,
    uiScaleMultiplier: 1.0,
    showWelcomeScreen: true,
    gestureResizeMode: 'global',
    activeTheme: 'default',
    customThemes: {},
    isUpsideDownEnabled: false,
    
    // Playback and Logic
    playbackSpeed: 1.0,
    speedStep: 0.05,
    uiScaleStep: 0.05,
    sequenceStep: 1,
    isAutoplayEnabled: false,
    isUniqueRoundsAutoClearEnabled: true,
    isLongPressAutoplayEnabled: true,
    pauseSetting: 'none',
    
    // Hardware and Inputs
    isAudioEnabled: false,
    isHapticsEnabled: true,
    isFlashEnabled: true,
    isSpeedDeletingEnabled: true,
    isSpeedGesturesEnabled: false,
    isVolumeGesturesEnabled: false,
    isArModeEnabled: false,
    isVoiceInputEnabled: false,
    isWakeLockEnabled: true,
    isDeleteGestureEnabled: false,
    isClearGestureEnabled: false,
    isGestureInputEnabled: false,
    gestureMappings: {},
    
    // Sensors and Feedback
    sensorAudioThresh: -85,
    sensorCamThresh: 30,
    isBlackoutFeatureEnabled: false,
    isBlackoutGesturesEnabled: false,
    isHapticMorseEnabled: false,
    showMicBtn: false,
    showCamBtn: false,
    autoInputMode: 'none',
    
    // Developer Controls
    devHideVoiceSettings: false,
    devHideHapticSettings: false,
    devSpeedIncrement: "0.05",
    devUiIncrement: "0.05",
    devSeqIncrement: "1",
    
    // Utility and Tools
    showTimer: false,
    showCounter: false,
    isPracticeModeEnabled: false,
    isStealth1KeyEnabled: false,
    
    // Voice/TTS Settings
    voicePitch: 1.0,
    voiceRate: 1.0,
    voiceVolume: 1.0,
    selectedVoice: null,
    voicePresets: {},
    activeVoicePresetId: 'standard',
    generalLanguage: 'en',

    // --- Profile Management ---
    activeProfileId: 'profile_1',
    profiles: {
        'profile_1': {
            name: 'Default Profile',
            settings: { ...DEFAULT_PROFILE_SETTINGS },
            theme: 'default'
        }
    },
    
    // --- Active Runtime State ---
    // This serves as a safety buffer for hardware engines during startup
    runtimeSettings: { ...DEFAULT_PROFILE_SETTINGS }
};
   
