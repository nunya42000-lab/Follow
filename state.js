(function() {
    'use strict';

    const PRESETS_KEY = 'followMePresets_v1';
    let settings = { ...AppConfig.DEFAULT_SETTINGS };
    let appState = {};
    let appPresets = {}; 

    function getInitialState() {
        return { 
            sequences: Array.from({ length: AppConfig.MAX_MACHINES }, () => []),
            machineCount: 1,
            nextSequenceIndex: 0,
            currentRound: 1,
            maxRound: settings.sequenceLength
        };
    }

    function saveState() {
        try {
            localStorage.setItem(AppConfig.SETTINGS_KEY, JSON.stringify(settings));
            localStorage.setItem(AppConfig.STATE_KEY, JSON.stringify(appState));
        } catch (error) {
            console.error("Failed to save state to localStorage:", error);
        }
    }
    
    // --- PRESET FUNCTIONS ---
    function savePresets() {
        try {
            localStorage.setItem(PRESETS_KEY, JSON.stringify(appPresets));
        } catch (error) {
            console.error("Failed to save presets to localStorage:", error);
        }
    }

    function loadPresets() {
        try {
            const storedPresets = localStorage.getItem(PRESETS_KEY);
            if (storedPresets) {
                appPresets = JSON.parse(storedPresets);
                // Ensure default preset exists if user deleted it
                if (!appPresets["Follow Me"]) {
                    appPresets["Follow Me"] = { ...AppConfig.DEFAULT_SETTINGS };
                    savePresets();
                }
            } else {
                appPresets = {
                    "Follow Me": { ...AppConfig.DEFAULT_SETTINGS }
                };
                savePresets();
            }
        } catch (error) {
            console.error("Failed to load presets:", error);
            appPresets = {
                "Follow Me": { ...AppConfig.DEFAULT_SETTINGS }
            };
        }
    }

    function saveCurrentSettingsAsPreset(name) {
        if (!name) return;
        const settingsToSave = JSON.parse(JSON.stringify(settings));
        appPresets[name] = settingsToSave;
        savePresets();
    }
    
    function loadSettingsFromPreset(name) {
        const loaded = appPresets[name];
        if (!loaded) {
            console.error(`Preset "${name}" not found.`);
            return false;
        }
        settings = JSON.parse(JSON.stringify(loaded));
        saveState(); 
        return true;
    }

    function renamePreset(oldName, newName) {
        if (!oldName || !newName || oldName === newName || !appPresets[oldName]) {
            return false;
        }
        appPresets[newName] = appPresets[oldName];
        delete appPresets[oldName];
        savePresets();
        return true;
    }

    function deletePreset(name) {
        if (!name || !appPresets[name]) {
            return false;
        }
        // Don't allow deleting the last preset
        if (Object.keys(appPresets).length <= 1) {
            UI.showModal("Cannot Delete", "You cannot delete the last preset.", () => UI.closeModal(), "OK", "");
            return false;
        }
        delete appPresets[name];
        savePresets();
        return true;
    }
    // --- END PRESET FUNCTIONS ---

    function loadState() {
        try {
            const storedSettings = localStorage.getItem(AppConfig.SETTINGS_KEY);
            const storedState = localStorage.getItem(AppConfig.STATE_KEY);

            if (storedSettings) {
                const loadedSettings = JSON.parse(storedSettings);
                delete loadedSettings.areSlidersLocked; 
                settings = { ...AppConfig.DEFAULT_SETTINGS, ...loadedSettings };
            } else {
                settings = { ...AppConfig.DEFAULT_SETTINGS };
            }

            if (settings.currentMode === 'changing') {
                settings.currentMode = AppConfig.MODES.UNIQUE_ROUNDS;
            }
            if (settings.isChangingAutoClearEnabled !== undefined) {
                settings.isUniqueRoundsAutoClearEnabled = settings.isChangingAutoClearEnabled;
                delete settings.isChangingAutoClearEnabled;
            }

            const defaultStates = {
                [AppConfig.INPUTS.KEY9]: getInitialState(),
                [AppConfig.INPUTS.KEY12]: getInitialState(),
                [AppConfig.INPUTS.PIANO]: getInitialState(),
            };

            if (storedState) {
                const loadedState = JSON.parse(storedState);
                appState[AppConfig.INPUTS.KEY9] = { ...defaultStates[AppConfig.INPUTS.KEY9], ...(loadedState[AppConfig.INPUTS.KEY9] || {}) };
                appState[AppConfig.INPUTS.KEY12] = { ...defaultStates[AppConfig.INPUTS.KEY12], ...(loadedState[AppConfig.INPUTS.KEY12] || {}) };
                appState[AppConfig.INPUTS.PIANO] = { ...defaultStates[AppConfig.INPUTS.PIANO], ...(loadedState[AppConfig.INPUTS.PIANO] || {}) };
                
                Object.values(appState).forEach(state => {
                    if (state.sequenceCount !== undefined) {
                        state.machineCount = state.sequenceCount;
                        delete state.sequenceCount;
                    }
                });

            } else {
                appState = defaultStates;
            }

            Object.values(appState).forEach(state => {
                state.maxRound = settings.sequenceLength;
            });

        } catch (error) {
            console.error("Failed to load state from localStorage:", error);
            localStorage.removeItem(AppConfig.SETTINGS_KEY);
            localStorage.removeItem(AppConfig.STATE_KEY);
            settings = { ...AppConfig.DEFAULT_SETTINGS };
            appState = {
                [AppConfig.INPUTS.KEY9]: getInitialState(),
                [AppConfig.INPUTS.KEY12]: getInitialState(),
                [AppConfig.INPUTS.PIANO]: getInitialState(),
            };
        }
        
        loadPresets(); 
    }

    function resetToDefaults() {
        settings = { ...AppConfig.DEFAULT_SETTINGS };
        appState = {
            [AppConfig.INPUTS.KEY9]: getInitialState(),
            [AppConfig.INPUTS.KEY12]: getInitialState(),
            [AppConfig.INPUTS.PIANO]: getInitialState(),
        };
        
        appPresets = {
            "Follow Me": { ...AppConfig.DEFAULT_SETTINGS }
        };
        
        saveState();
        savePresets(); 
    }

    // Expose to global scope
    window.StateManager = {
        loadState,
        saveState,
        getInitialState,
        resetToDefaults,
        getSettings: () => settings,
        getAppState: () => appState,
        getCurrentState: () => appState[settings.currentInput],
        getPresets: () => appPresets,
        saveCurrentSettingsAsPreset,
        loadSettingsFromPreset,
        renamePreset,
        deletePreset
    };

})();
