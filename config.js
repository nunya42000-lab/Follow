/* ========================================
   FILE: config.js
   ======================================== */

export const CONFIG = {
    MAX_MACHINES: 10,
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

export const DEFAULT_PROFILE_SETTINGS = {
    sequenceLength: 10,
    currentInput: CONFIG.INPUTS.KEY9,
    currentMode: CONFIG.MODES.SIMON,
    machineCount: 1,
    simonChunkSize: 0,
    simonInterSequenceDelay: 1000,
};

export const DEFAULT_APP = {
    globalUiScale: 100,
    uiScaleMultiplier: 1.0,
    showWelcomeScreen: true,
    gestureResizeMode: 'global',
    playbackSpeed: 1.0,
    speedStep: 0.05,
    uiScaleStep: 0.05,
    sequenceStep: 1,
    isAutoplayEnabled: false,
    isUniqueRoundsAutoClearEnabled: true,
    isAudioEnabled: false,
    isHapticsEnabled: true,
    isFlashEnabled: true,
    pauseSetting: 'none',
    isSpeedDeletingEnabled: true,
    isSpeedGesturesEnabled: false,
    isVolumeGesturesEnabled: false,
    isArModeEnabled: false,
    isVoiceInputEnabled: false,
    isWakeLockEnabled: true,
    isUpsideDownEnabled: false,
    devHideVoiceSettings: false,
    devHideHapticSettings: false,
    isDeleteGestureEnabled: false,
    isClearGestureEnabled: false,
    isAutoTimerEnabled: false,
    isAutoCounterEnabled: false,
    isLongPressAutoplayEnabled: true,
    isStealth1KeyEnabled: false,
    activeTheme: 'default',
    customThemes: {},
    sensorAudioThresh: -85,
    sensorCamThresh: 30,
    isBlackoutFeatureEnabled: false,
    isBlackoutGesturesEnabled: false,
    isHapticMorseEnabled: false,
    showMicBtn: false,
    showCamBtn: false,
    autoInputMode: 'none',
    showTimer: false,
    showCounter: false,
    activeProfileId: 'profile_1',
    isPracticeModeEnabled: false,
    voicePitch: 1.0,
    voiceRate: 1.0,
    voiceVolume: 1.0,
    selectedVoice: null,
    voicePresets: {},
    activeVoicePresetId: 'standard',
    generalLanguage: 'en',
    isGestureInputEnabled: false,
    gestureMappings: {}
};