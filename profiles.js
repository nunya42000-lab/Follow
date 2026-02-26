// profiles.js
import { CONFIG, DEFAULT_PROFILE_SETTINGS } from './config.js';

/**
 * PREMADE_PROFILES
 * These represent the core gameplay archetypes. Each profile inherits 
 * the default settings and overrides specific parameters like mode or input type.
 */
export const PREMADE_PROFILES = { 
    'profile_1': { 
        name: "Follow Me", 
        settings: { ...DEFAULT_PROFILE_SETTINGS }, 
        theme: 'default' 
    }, 
    'profile_2': { 
        name: "2 Machines", 
        settings: { 
            ...DEFAULT_PROFILE_SETTINGS, 
            machineCount: 2, 
            simonChunkSize: 40, 
            simonInterSequenceDelay: 0 
        }, 
        theme: 'default' 
    }, 
    'profile_3': { 
        name: "Bananas", 
        settings: { 
            ...DEFAULT_PROFILE_SETTINGS, 
            sequenceLength: 25 
        }, 
        theme: 'default' 
    }, 
    'profile_4': { 
        name: "Piano", 
        settings: { 
            ...DEFAULT_PROFILE_SETTINGS, 
            currentInput: CONFIG.INPUTS.PIANO 
        }, 
        theme: 'default' 
    }, 
    'profile_5': { 
        name: "15 Rounds", 
        settings: { 
            ...DEFAULT_PROFILE_SETTINGS, 
            currentMode: CONFIG.MODES.UNIQUE_ROUNDS, 
            sequenceLength: 15, 
            currentInput: CONFIG.INPUTS.KEY12 
        }, 
        theme: 'default' 
    }
};
