// constants.js
import { GESTURE_GROUPS } from './gesture-groups.js';

/**
 * GESTURE DATA EXPORT
 * Re-exports the modularized groups for use in the settings and mapping engines.
 */
export { GESTURE_GROUPS };

/**
 * PRESET MAPPING FIXES
 * Hard-coded configurations for specific layout requirements.
 */

// Default 9-Key Spatial Mapping
export const DEFAULT_9KEY_MAPPING = {
    "1": "Double_tap_spatial_nw",
    "2": "Double_tap_spatial_up",
    "3": "Double_tap_spatial_ne",
    "4": "Double_tap_spatial_left",
    "5": "double_tap",
    "6": "Double_tap_spatial_right",
    "7": "Double_tap_spatial_sw",
    "8": "Double_tap_spatial_down",
    "9": "Double_tap_spatial_se"
};

// Piano Layout Fix: Handles 2-Finger Swipe requirements
export const PIANO_MAPPING_FIX = {
    "1": "tap",
    "2": "swipe_nw_2f",
    "3": "tap",
    "4": "swipe_ne_2f",
    "5": "tap"
};

// 12-Key Extended Layout Fix: Handles 3-Finger Swipe requirements
export const KEY12_SWIPE_FIX = {
    "1": "tap", "2": "tap", "3": "tap",
    "4": "tap", "5": "tap", "6": "tap",
    "7": "tap", "8": "tap",
    "9": "swipe_left_3f",
    "10": "swipe_up_3f",
    "11": "swipe_down_3f",
    "12": "swipe_right_3f"
};

/**
 * SYSTEM CONFIGURATION
 * Global constants and thresholds for engine logic.
 */
export const CONFIG = {
    VERSION: "2.0.114-PRO",
    MAX_MACHINES: 10,
    DEFAULT_SPEED: 1.0,
    DEFAULT_UI_SCALE: 1.0,
    SECRET_TAP_COUNT: 7,
    
    // Temporal & Geometric Thresholds for gesture-math.js
    FLICK_VELOCITY_THRESHOLD: 2.5,  // px per ms
    PAUSE_TIME_THRESHOLD: 100,      // ms
    PAUSE_SPEED_THRESHOLD: 0.1,     // px per ms
    COMPLEXITY_CURVE_THRESHOLD: 1.15,

    // Screen Anchor Zones (expressed as screen percentages)
    ZONES: {
        TOP: 0.15,    // Top 15% of screen
        BOTTOM: 0.85, // Bottom 15% of screen
        LEFT: 0.15,
        RIGHT: 0.85
    }
};

/**
 * DEFAULT PROFILE TEMPLATE
 * Initial settings applied to new profiles, including developer overrides.
 */
export const DEFAULT_PROFILE_SETTINGS = {
    // Basic Configuration
    currentInput: 'key9',
    currentMode: 'follow',
    
    // System Values
    speed: CONFIG.DEFAULT_SPEED,
    uiScale: CONFIG.DEFAULT_UI_SCALE,
    autoplay: false,
    audioEnabled: true,
    hapticEnabled: true,
    voiceEnabled: false,
    autoInputMode: 'none',

    // Developer UI Visibility
    devHideVoiceSettings: false,
    devHideHapticSettings: false,

    // Developer Increment Settings (Dropdown Selections)
    devSpeedIncrement: "0.05",
    devUiIncrement: "0.05",
    devSeqIncrement: "1",

    // Input Mapping
    gestures: { ...DEFAULT_9KEY_MAPPING }
};

/**
 * INITIAL SYSTEM STATE
 */
export const INITIAL_PROFILES = {
    'p_default': {
        name: 'Standard 9-Key',
        settings: { ...DEFAULT_PROFILE_SETTINGS },
        theme: 'default'
    }
};
	
