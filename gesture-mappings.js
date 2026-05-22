// gesture-mappings.js

export const DEFAULT_HAND_MAPPINGS = {
    // 9-Key Defaults
    'k9_1': 'hand_1_up',
    'k9_2': 'hand_2_up',
    'k9_3': 'hand_3_up',
    'k9_4': 'hand_4_up',
    'k9_5': 'hand_5_up',
    'k9_6': 'hand_1_down',
    'k9_7': 'hand_2_down',
    'k9_8': 'hand_3_down',
    'k9_9': 'hand_4_down',

    // 12-Key Defaults
    'k12_1': 'hand_1_up',
    'k12_2': 'hand_2_up',
    'k12_3': 'hand_3_up',
    'k12_4': 'hand_4_up',
    'k12_5': 'hand_5_up',
    'k12_6': 'hand_1_down',
    'k12_7': 'hand_2_down',
    'k12_8': 'hand_3_down',
    'k12_9': 'hand_4_down',
    'k12_10': 'hand_5_down',
    'k12_11': 'hand_1_right',
    'k12_12': 'hand_1_left',

    // Piano Defaults
    'piano_C': 'hand_1_up',
    'piano_D': 'hand_2_up',
    'piano_E': 'hand_3_up',
    'piano_F': 'hand_4_up',
    'piano_G': 'hand_5_up',
    'piano_A': 'hand_1_right',
    'piano_B': 'hand_1_left',
    'piano_1': 'hand_2_right',
    'piano_2': 'hand_3_right',
    'piano_3': 'hand_4_right',
    'piano_4': 'hand_5_right',
    'piano_5': 'hand_2_left'
};

export function mapGestureToValue(gesture, currentInput) {
    // Reverse lookup: Find which key is mapped to the detected hand gesture
    for (const [key, mappedGesture] of Object.entries(DEFAULT_HAND_MAPPINGS)) {
        if (mappedGesture === gesture) {
            if (currentInput === 'key9' && key.startsWith('k9_')) {
                return key.replace('k9_', '');
            }
            if (currentInput === 'key12' && key.startsWith('k12_')) {
                return key.replace('k12_', '');
            }
            if (currentInput === 'piano' && key.startsWith('piano_')) {
                return key.replace('piano_', '');
            }
        }
    }
    return null;
}