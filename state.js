(function() {
    'use strict';

    const PRESETS_KEY = 'followMePresets_v1';
    let settings = { ...AppConfig.DEFAULT_SETTINGS };
    let appState = {};
    let appPresets = {}; // <-- NEW: To hold all saved presets

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
    
    // --- NEW PRESET FUNCTIONS ---
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
            } else {
                // Initialize with the default "Follow Me" preset
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
        // Create a deep copy of the current settings to save
        const settingsToSave = JSON.parse(JSON.stringify(settings));
        appPresets[name] = settingsToSave;
        savePresets();
    }
    
    function loadSettingsFromPreset(name) {
        const loaded = appPresets[name];
        if (!loaded) {
            console.error(`Preset "${name}" not found.`);
            return;
        }
        // Overwrite current settings with the loaded preset
        // Use JSON parse/stringify for a deep copy
        settings = JSON.parse(JSON.stringify(loaded));
        saveState(); // Save the newly loaded settings as the *current* settings
    }
    // --- END NEW PRESET FUNCTIONS ---

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

            // ... (rest of the function is the same)
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
        
        loadPresets(); // <-- NEW: Load presets on startup
    }

    function resetToDefaults() {
        settings = { ...AppConfig.DEFAULT_SETTINGS };
        appState = {
            [AppConfig.INPUTS.KEY9]: getInitialState(),
            [AppConfig.INPUTS.KEY12]: getInitialState(),
            [AppConfig.INPUTS.PIANO]: getInitialState(),
        };
        
        // Also reset presets
        appPresets = {
            "Follow Me": { ...AppConfig.DEFAULT_SETTINGS }
        };
        
        saveState();
        savePresets(); // <-- NEW: Save reset presets
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
        // --- NEW EXPOSED FUNCTIONS ---
        getPresets: () => appPresets,
        saveCurrentSettingsAsPreset,
        loadSettingsFromPreset
    };

})();
