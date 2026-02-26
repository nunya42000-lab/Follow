// mappings.js
import { GESTURE_GROUPS } from './gesture-groups.js';

export { GESTURE_GROUPS };

// 9-Key Spatial: Default mapping for 9-key profiles
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

// Global Default Mappings for various input types
export const DEFAULT_MAPPINGS = {
    // 9-Key: Basic Taps
    'k9_1': 'tap', 'k9_2': 'double_tap', 'k9_3': 'triple_tap',
    'k9_4': 'tap_2f_any', 'k9_5': 'double_tap_2f_any', 'k9_6': 'triple_tap_2f_any',
    'k9_7': 'tap_3f_any', 'k9_8': 'double_tap_3f_any', 'k9_9': 'triple_tap_3f_any',

    // 12-Key: Basic Taps
    'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
    'k12_5': 'tap_2f_any', 'k12_6': 'double_tap_2f_any', 'k12_7': 'triple_tap_2f_any', 'k12_8': 'long_tap_2f_any',
    'k12_9': 'tap_3f_any', 'k12_10': 'double_tap_3f_any', 'k12_11': 'triple_tap_3f_any', 'k12_12': 'long_tap_3f_any',

    // Piano: Directional Swipes
    'piano_C': 'swipe_nw', 'piano_D': 'swipe_left', 'piano_E': 'swipe_sw',
    'piano_F': 'swipe_down', 'piano_G': 'swipe_se', 'piano_A': 'swipe_right', 'piano_B': 'swipe_ne',
    
    // Piano: Multi-Finger Swipes
    'piano_1': 'swipe_left_2f', 'piano_2': 'swipe_nw_2f', 'piano_3': 'swipe_up_2f',
    'piano_4': 'swipe_ne_2f', 'piano_5': 'swipe_right_2f'
};

export const PREMADE_MAPPING_PROFILES = {
    '9_hand_count': {
        name: "Hand Count (Up/Down)",
        type: 'key9',
        map: {
            'k9_1': { hand: 'hand_1_up' }, 'k9_2': { hand: 'hand_2_up' },
            'k9_3': { hand: 'hand_3_up' }, 'k9_4': { hand: 'hand_4_up' },
            'k9_5': { hand: 'hand_5_up' }, 'k9_6': { hand: 'hand_1_down' },
            'k9_7': { hand: 'hand_2_down' }, 'k9_8': { hand: 'hand_3_down' },
            'k9_9': { hand: 'hand_4_down' }
        }
    },
    '12_taps': {
        name: "Taps (Default)",
        type: 'key12',
        map: {
            'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
            'k12_5': 'tap_2f_any', 'k12_6': 'double_tap_2f_any', 'k12_7': 'triple_tap_2f_any', 'k12_8': 'long_tap_2f_any',
            'k12_9': 'tap_3f_any', 'k12_10': 'double_tap_3f_any', 'k12_11': 'triple_tap_3f_any', 'k12_12': 'long_tap_3f_any'
        }
    },
    '12_swipes': {
        name: "Swipes (Directional)",
        type: 'key12',
        map: {
            'k12_1': 'swipe_left', 'k12_2': 'swipe_up', 'k12_3': 'swipe_down', 'k12_4': 'swipe_right',
            'k12_5': 'swipe_left_2f', 'k12_6': 'swipe_up_2f', 'k12_7': 'swipe_down_2f', 'k12_8': 'swipe_right_2f',
            'k12_9': 'swipe_left_3f', 'k12_10': 'swipe_up_3f', 'k12_11': 'swipe_down_3f', 'k12_12': 'swipe_right_3f'
        }
    },
    'piano_hand_hybrid': {
        name: "Piano Hands",
        type: 'piano',
        map: {
            'piano_C': { hand: 'hand_1_up' }, 'piano_D': { hand: 'hand_2_up' },
            'piano_E': { hand: 'hand_3_up' }, 'piano_F': { hand: 'hand_4_up' },
            'piano_G': { hand: 'hand_5_up' }, 'piano_A': { hand: 'hand_1_right' },
            'piano_B': { hand: 'hand_2_right' }, 'piano_1': { hand: 'hand_1_down' },
            'piano_2': { hand: 'hand_2_down' }, 'piano_3': { hand: 'hand_3_down' },
            'piano_4': { hand: 'hand_4_down' }, 'piano_5': { hand: 'hand_5_down' }
        }
    }
};