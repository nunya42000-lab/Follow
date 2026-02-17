export const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v47', STORAGE_KEY_STATE: 'followMeAppState_v48', INPUTS: { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' }, MODES: { SIMON: 'simon', UNIQUE_ROUNDS: 'unique' } };

// UPDATED DEFAULTS: Chunk=40 (Full), Delay=0
export const DEFAULT_PROFILE_SETTINGS = { currentInput: CONFIG.INPUTS.KEY9, currentMode: CONFIG.MODES.SIMON, sequenceLength: 20, machineCount: 1, simonChunkSize: 40, simonInterSequenceDelay: 0 };
export const PREMADE_PROFILES = { 'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }, 'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 40, simonInterSequenceDelay: 0 }, theme: 'default' }, 'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }, theme: 'default' }, 'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: CONFIG.INPUTS.PIANO }, theme: 'default' }, 'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: CONFIG.MODES.UNIQUE_ROUNDS, sequenceLength: 15, currentInput: CONFIG.INPUTS.KEY12 }, theme: 'default' }};
// UPDATED DEFAULTS: Flash=True, Audio=False, PlaybackSpeed=1.0
export const DEFAULT_APP = { 
    globalUiScale: 100, uiScaleMultiplier: 1.0, showWelcomeScreen: true, gestureResizeMode: 'global', playbackSpeed: 1.0, 
    isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, 
    isAudioEnabled: false, 
    isHapticsEnabled: true, 
    isFlashEnabled: true,  
    pauseSetting: 'none',
    isSpeedDeletingEnabled: true, 
    isSpeedGesturesEnabled: false, 
    isVolumeGesturesEnabled: false,
    isArModeEnabled: false, 
    isVoiceInputEnabled: false, 
    
    // --- NEW TOGGLES ---
    isDeleteGestureEnabled: false, 
    isClearGestureEnabled: false,
    isAutoTimerEnabled: false,
    isAutoCounterEnabled: false,
    // -------------------

    isLongPressAutoplayEnabled: true, isStealth1KeyEnabled: false, 
    activeTheme: 'default', customThemes: {}, sensorAudioThresh: -85, sensorCamThresh: 30, 
    isBlackoutFeatureEnabled: false, isBlackoutGesturesEnabled: false, isHapticMorseEnabled: false, 
    showMicBtn: false, showCamBtn: false, autoInputMode: 'none', 
    showTimer: false, showCounter: false,
    activeProfileId: 'profile_1', profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)), 
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)), 
    isPracticeModeEnabled: false, voicePitch: 1.0, voiceRate: 1.0, voiceVolume: 1.0, 
    selectedVoice: null, voicePresets: {}, activeVoicePresetId: 'standard', generalLanguage: 'en', 
    isGestureInputEnabled: false, gestureMappings: {} 
};
// DEFAULT MAPPINGS (Extracted to top level)
export const DEFAULT_MAPPINGS = {
    // 9-Key: Basic Taps
    'k9_1': 'tap', 'k9_2': 'double_tap', 'k9_3': 'triple_tap',
    
    // 9-Key: Multi-Touch (Defaults to _any for forgiveness)
    'k9_4': 'tap_2f_any', 'k9_5': 'double_tap_2f_any', 'k9_6': 'triple_tap_2f_any',
    'k9_7': 'tap_3f_any', 'k9_8': 'double_tap_3f_any', 'k9_9': 'triple_tap_3f_any',

    // 12-Key: Basic Taps
    'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
    
    // 12-Key: Multi-Touch
    'k12_5': 'tap_2f_any', 'k12_6': 'double_tap_2f_any', 'k12_7': 'triple_tap_2f_any', 'k12_8': 'long_tap_2f_any',
    'k12_9': 'tap_3f_any', 'k12_10': 'double_tap_3f_any', 'k12_11': 'triple_tap_3f_any', 'k12_12': 'long_tap_3f_any',

    // Piano: Directional Swipes (Unchanged)
    'piano_C': 'swipe_nw', 'piano_D': 'swipe_left', 'piano_E': 'swipe_sw',
    'piano_F': 'swipe_down', 'piano_G': 'swipe_se', 'piano_A': 'swipe_right', 'piano_B': 'swipe_ne',
    
    // Piano: Multi-Finger Swipes
    'piano_1': 'swipe_left_2f', 'piano_2': 'swipe_nw_2f', 'piano_3': 'swipe_up_2f',
    'piano_4': 'swipe_ne_2f', 'piano_5': 'swipe_right_2f'
};    
export const DICTIONARY = {
    'en': { correct: "Correct", wrong: "Wrong", stealth: "Stealth Active", reset: "Reset to Round 1", stop: "Playback Stopped 🛑" },
    'es': { correct: "Correcto", wrong: "Incorrecto", stealth: "Modo Sigilo", reset: "Reiniciar Ronda 1", stop: "Detenido 🛑" }
};
