import { 
    SETTINGS_KEY, STATE_KEY, 
    DEFAULT_APP_SETTINGS, DEFAULT_PROFILE_SETTINGS, PREMADE_PROFILES, 
    MAX_MACHINES 
} from './config.js';

export let appSettings = { ...DEFAULT_APP_SETTINGS };
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
            const loadedSettings = JSON.parse(storedSettings);
            appSettings = { ...DEFAULT_APP_SETTINGS, ...loadedSettings };
            
            // Fix: Migration crash protection
            if (!appSettings.profiles || Object.keys(appSettings.profiles).length === 0) {
                throw new Error("Profiles corrupted");
            }

            Object.keys(appSettings.profiles).forEach(profileId => {
                appSettings.profiles[profileId].settings = {
                    ...DEFAULT_PROFILE_SETTINGS, 
                    ...(appSettings.profiles[profileId].settings || {})
                };
                if (appSettings.profiles[profileId].settings.isAudioPlaybackEnabled !== undefined) {
                    appSettings.profiles[profileId].settings.isAudioEnabled = appSettings.profiles[profileId].settings.isAudioPlaybackEnabled;
                    delete appSettings.profiles[profileId].settings.isAudioPlaybackEnabled;
                }
                if (appSettings.profiles[profileId].settings.cameraGridConfig) {
                    appSettings.profiles[profileId].settings.cameraGridConfig9 = { ...appSettings.profiles[profileId].settings.cameraGridConfig };
                    delete appSettings.profiles[profileId].settings.cameraGridConfig;
                }
            });
        } else {
            appSettings.profiles = {};
            Object.keys(PREMADE_PROFILES).forEach(id => {
                appSettings.profiles[id] = { 
                    name: PREMADE_PROFILES[id].name, 
                    settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] }
                };
            });
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
        appSettings = { ...DEFAULT_APP_SETTINGS };
        appSettings.profiles = {};
        Object.keys(PREMADE_PROFILES).forEach(id => {
            appSettings.profiles[id] = { 
                name: PREMADE_PROFILES[id].name, 
                settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] }
            };
        });
        appState = {};
        Object.keys(appSettings.profiles).forEach(profileId => {
            appState[profileId] = getInitialState();
        });
    }
}
