import { 
    SETTINGS_KEY, STATE_KEY, 
    DEFAULT_APP_SETTINGS, DEFAULT_PROFILE_SETTINGS, PREMADE_PROFILES, 
    MAX_MACHINES 
} from './config.js';

// FIX: Removed import from utils.js to break circular dependency

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
            
            // deepMerge is now defined locally below
            appSettings = deepMerge(deepClone(DEFAULT_APP_SETTINGS), loadedJson);
            
            if (!appSettings.profiles || Object.keys(appSettings.profiles).length === 0) {
                 appSettings.profiles = deepClone(PREMADE_PROFILES);
            } else {
                Object.keys(appSettings.profiles).forEach(profileId => {
                    const userSettings = appSettings.profiles[profileId].settings || {};
                    appSettings.profiles[profileId].settings = deepMerge(deepClone(DEFAULT_PROFILE_SETTINGS), userSettings);
                    
                    if (appSettings.profiles[profileId].settings.cameraGridConfig) {
                        appSettings.profiles[profileId].settings.cameraGridConfig9 = { ...appSettings.profiles[profileId].settings.cameraGridConfig };
                        delete appSettings.profiles[profileId].settings.cameraGridConfig;
                    }
                });
            }
        } else {
            appSettings = deepClone(DEFAULT_APP_SETTINGS);
            appSettings.profiles = deepClone(PREMADE_PROFILES);
        }

        if (storedState) {
            appState = JSON.parse(storedState);
        }
        
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

// --- INTERNAL HELPERS (Moved here to prevent Circular Dependency) ---
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

function deepMerge(target, source) {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return target;

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]));
            }
        }
    }
    return { ...target, ...source };
}
