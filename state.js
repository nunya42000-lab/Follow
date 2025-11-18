import { 
    SETTINGS_KEY, STATE_KEY, 
    DEFAULT_APP_SETTINGS, DEFAULT_PROFILE_SETTINGS, PREMADE_PROFILES, 
    MAX_MACHINES 
} from './config.js';
import { deepClone, deepMerge } from './utils.js';

export let appSettings = deepClone(DEFAULT_APP_SETTINGS);
export let appState = {}; 

export const getCurrentProfileSettings = () => appSettings.profiles[appSettings.activeProfileId]?.settings;
export const getCurrentState = () => appState[appSettings.activeProfileId];

export function setAppSettings(newSettings) {
    appSettings = newSettings;
}

export function setAppState(newState) {
    appState = newState;
}

export function getInitialState() {
    return { 
        sequences: Array.from({ length: MAX_MACHINES }, () => []),
        nextSequenceIndex: 0,
        currentRound: 1
    };
}

export function saveState() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
        localStorage.setItem(STATE_KEY, JSON.stringify(appState));
    } catch (error) {
        console.error("Failed to save state:", error);
    }
}

export function loadState() {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        const storedState = localStorage.getItem(STATE_KEY);

        if (storedSettings) {
            const loadedJson = JSON.parse(storedSettings);
            
            // BIG FIX: Deep Merge loaded data ON TOP of default structure.
            // This ensures if you added new settings variables in config.js, 
            // they appear in the user's profile instead of being undefined.
            appSettings = deepMerge(deepClone(DEFAULT_APP_SETTINGS), loadedJson);
            
            // Ensure profiles exist and have valid structure
            if (!appSettings.profiles || Object.keys(appSettings.profiles).length === 0) {
                 // Fallback if profiles object is somehow empty but settings existed
                 appSettings.profiles = deepClone(PREMADE_PROFILES);
            } else {
                // Validate each profile has current default settings structure
                Object.keys(appSettings.profiles).forEach(profileId => {
                    const userSettings = appSettings.profiles[profileId].settings || {};
                    appSettings.profiles[profileId].settings = deepMerge(deepClone(DEFAULT_PROFILE_SETTINGS), userSettings);
                    
                    // Migration Cleanups (Legacy support)
                    if (appSettings.profiles[profileId].settings.cameraGridConfig) {
                        appSettings.profiles[profileId].settings.cameraGridConfig9 = { ...appSettings.profiles[profileId].settings.cameraGridConfig };
                        delete appSettings.profiles[profileId].settings.cameraGridConfig;
                    }
                });
            }
        } else {
            // Fresh install
            appSettings = deepClone(DEFAULT_APP_SETTINGS);
            appSettings.profiles = deepClone(PREMADE_PROFILES);
        }

        if (storedState) {
            appState = JSON.parse(storedState);
        }
        
        // Ensure every profile has a state object
        Object.keys(appSettings.profiles).forEach(profileId => {
            if (!appState[profileId]) {
                appState[profileId] = getInitialState();
            }
        });
        
        if (!appSettings.profiles[appSettings.activeProfileId]) {
            appSettings.activeProfileId = Object.keys(appSettings.profiles)[0] || 'profile_1';
        }

    } catch (error) {
        console.error("Failed to load state:", error);
        localStorage.removeItem(SETTINGS_KEY);
        localStorage.removeItem(STATE_KEY);
        appSettings = deepClone(DEFAULT_APP_SETTINGS);
        appSettings.profiles = deepClone(PREMADE_PROFILES);
        appState = {};
        Object.keys(appSettings.profiles).forEach(profileId => {
            appState[profileId] = getInitialState();
        });
    }
}
