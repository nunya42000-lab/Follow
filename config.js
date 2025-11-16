(function() {
    'use strict';

    const MAX_MACHINES = 4;
    const DEMO_DELAY_BASE_MS = 798;
    const SPEED_DELETE_INITIAL_DELAY = 250;
    const SPEED_DELETE_INTERVAL_MS = 10;    

    const SETTINGS_KEY = 'followMeAppSettings_v4';
    const STATE_KEY = 'followMeAppState_v4';
    const PRESETS_KEY = 'followMePresets_v1';

    // Input and Mode Definitions
    const INPUTS = {
        KEY9: 'key9',
        KEY12: 'key12',
        PIANO: 'piano'
    };
    const MODES = {
        SIMON: 'simon',
        UNIQUE_ROUNDS: 'unique_rounds'
    };
    const MODE_LABELS = {
        [MODES.SIMON]: 'Simon Says',
        [MODES.UNIQUE_ROUNDS]: 'Unique Rounds'
    };

    const PIANO_SPEAK_MAP = {
        'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B',
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
    };

    const VOICE_VALUE_MAP = {
        'one': '1', 'two': '2', 'to': '2', 'three': '3', 'four': '4', 'for': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
        'eleven': '11', 'twelve': '12',
        'see': 'C', 'dee': 'D', 'e': 'E', 'eff': 'F', 'gee': 'G', 'eh': 'A', 'be': 'B',
        'c': 'C', 'd': 'D', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'
    };

    // --- NEW: Default settings for all 20+ features ---
    const DEFAULT_SETTINGS = {
        // Setup
        currentInput: INPUTS.KEY9,
        currentMode: MODES.SIMON,
        sequenceLength: 20,
        simonChunkSize: 3,
        simonInterSequenceDelay: 500,
        isUniqueRoundsAutoClearEnabled: true,
        
        // Manual Input
        isSwipeToDeleteEnabled: true,
        isVoiceInputEnabled: true,
        isSpeedDeletingEnabled: true, 
        isHapticsEnabled: true,
        
        // Auto Input
        isCameraInputEnabled: false,
        isMicInputEnabled: false,
        
        // Shortcuts
        shortcutStealth: 'none',
        shortcutPlay: 'none',
        shortcutBackspace: 'none',
        shortcutClearAll: 'none',
        
        // Playback
        isAudioPlaybackEnabled: true,
        isHapticPlaybackEnabled: false,
        isVisualMetronomeEnabled: false,
        isAutoplayEnabled: true, 
        playbackSpeed: 1.0,
        
        // General
        isDarkMode: true,
        globalUiScale: 100,
        uiScaleMultiplier: 1.0, 
        showWelcomeScreen: true,
    };

    // Expose to global scope
    window.AppConfig = {
        MAX_MACHINES,
        DEMO_DELAY_BASE_MS,
        SPEED_DELETE_INITIAL_DELAY,
        SPEED_DELETE_INTERVAL_MS,
        SETTINGS_KEY,
        STATE_KEY,
        PRESETS_KEY,
        INPUTS,
        MODES,
        MODE_LABELS,
        PIANO_SPEAK_MAP,
        VOICE_VALUE_MAP,
        DEFAULT_SETTINGS
    };

})();
