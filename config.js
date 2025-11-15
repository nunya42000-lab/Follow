(function() {
    'use strict';

    const MAX_MACHINES = 4;
    const DEMO_DELAY_BASE_MS = 798;
    const SPEED_DELETE_INITIAL_DELAY = 250;
    const SPEED_DELETE_INTERVAL_MS = 10;    

    const SETTINGS_KEY = 'followMeAppSettings_v4';
    const STATE_KEY = 'followMeAppState_v4';

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

    const DEFAULT_SETTINGS = {
        isDarkMode: true,
        playbackSpeed: 1.0,
        uiScaleMultiplier: 1.0, 
        globalUiScale: 100,
        isSpeedDeletingEnabled: true, 
        isAutoplayEnabled: true, 
        isUniqueRoundsAutoClearEnabled: true,
        isAudioPlaybackEnabled: true,
        isVoiceInputEnabled: true,
        isHapticsEnabled: true,
        showWelcomeScreen: true,
        currentInput: INPUTS.KEY9,
        currentMode: MODES.SIMON,
        sequenceLength: 20,
        simonChunkSize: 3,
        simonInterSequenceDelay: 500
    };

    // Expose to global scope
    window.AppConfig = {
        MAX_MACHINES,
        DEMO_DELAY_BASE_MS,
        SPEED_DELETE_INITIAL_DELAY,
        SPEED_DELETE_INTERVAL_MS,
        SETTINGS_KEY,
        STATE_KEY,
        INPUTS,
        MODES,
        MODE_LABELS,
        PIANO_SPEAK_MAP,
        VOICE_VALUE_MAP,
        DEFAULT_SETTINGS
    };

})();
,
  measurementId: "G-FN9Y8WVHCL"
};

// Initialize Firebase
// We check if firebase is defined to avoid errors if the script didn't load
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } catch (e) {
        console.error("Firebase initialization error:", e);
    }
} else {
    console.error("Firebase SDK not loaded. Check index.html");
}


