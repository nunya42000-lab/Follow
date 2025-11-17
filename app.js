// --- [App Initialization] ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Load Core Data ---
    App.loadGlobalSettings(); 
    App.loadProfiles(); 
    App.loadSequences(); 
    App.loadShortcutMap(); 
    
    // --- Initialize Systems ---
    App.initializeShortcuts(); 
    UI.updateAll(); // This now populates everything
    
    console.log("Number Tracker App Initialized.");

    // --- Settings Tab Event Listeners ---
    const loadProfileButton = document.getElementById('load-profile-button');
    const profileSelect = document.getElementById('profile-select-dropdown');
    loadProfileButton.addEventListener('click', () => {
        const selectedIndex = profileSelect.value;
        App.actionLibrary.loadProfile(selectedIndex);
    });

    const saveProfileButton = document.getElementById('save-profile-button');
    const saveProfileInput = document.getElementById('save-profile-name-input');
    saveProfileButton.addEventListener('click', () => {
        const profileName = saveProfileInput.value.trim();
        if (profileName) {
            App.actionLibrary.saveCurrentProfile(profileName);
            saveProfileInput.value = '';
        } else {
            alert("Please enter a name for the profile.");
        }
    });

    // Live-Updating Settings Inputs
    const deleteSpeedInput = document.getElementById('setting-delete-speed');
    deleteSpeedInput.addEventListener('change', (e) => {
        App.currentSettings.deleteSpeed = parseInt(e.target.value, 10);
        App.saveGlobalSettings();
    });

    const stealthOpacityInput = document.getElementById('setting-stealth-opacity');
    stealthOpacityInput.addEventListener('input', (e) => { 
        App.currentSettings.stealthMode.opacity = parseFloat(e.target.value);
        App.saveGlobalSettings();
        // [NEW] Apply live opacity change
        document.getElementById('app-container').style.opacity = App.currentSettings.stealthMode.opacity;
    });

    const stealthHideButtonsInput = document.getElementById('setting-stealth-hidebuttons');
    stealthHideButtonsInput.addEventListener('change', (e) => {
        App.currentSettings.stealthMode.hideButtons = e.target.checked;
        App.saveGlobalSettings();
        // [NEW] Apply live keypad visibility change
        UI.applyStealthSettings();
    });

    // --- Shortcut Tab Event Listener ---
    const shortcutContainer = document.getElementById('shortcut-list-container');
    shortcutContainer.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT') {
            const eventMapKey = e.target.dataset.eventMap; 
            const newAction = e.target.value; 

            if (newAction === 'none') {
                delete App.shortcutMap[eventMapKey];
            } else {
                App.shortcutMap[eventMapKey] = newAction;
            }
            
            App.saveShortcutMap(); 
            App.initializeShortcuts(); // Re-apply all listeners
        }
    });

    // --- Main Tab Mode Button Listeners ---
    document.getElementById('mode-standard').addEventListener('click', () => {
        App.actionLibrary.changeMode('standard');
    });
    document.getElementById('mode-stealth').addEventListener('click', () => {
        App.actionLibrary.changeMode('stealth');
    });
    document.getElementById('mode-rapid').addEventListener('click', () => {
        App.actionLibrary.changeMode('rapid');
    });
});

// ==========================================================
// App (The "Brain")
// Manages all data, settings, and logic.
// ==========================================================
const App = {
    currentSettings: {}, 
    settingsProfiles: [], 
    shortcutMap: {}, 
    sequences: { 
        standard: [],
        stealth: [],
        rapid: []
    }, 
    rapidDeleteInterval: null, // [NEW] Timer for rapid delete

    actionLibrary: {
        // --- Profile Actions ---
        loadProfile: (profileIndex) => {
            if (App.settingsProfiles[profileIndex]) {
                App.currentSettings = JSON.parse(JSON.stringify(App.settingsProfiles[profileIndex].settings));
                App.saveGlobalSettings(); 
                UI.updateAll(); // Full refresh to apply profile settings
                console.log(`Loaded profile: ${App.settingsProfiles[profileIndex].name}`);
            } else {
                console.error(`Profile index ${profileIndex} not found.`);
            }
        },
        saveCurrentProfile: (profileName) => {
            const newProfile = {
                name: profileName,
                isDefault: false,
                settings: JSON.parse(JSON.stringify(App.currentSettings))
            };
            App.settingsProfiles.push(newProfile);
            App.saveProfiles(); 
            UI.populateProfileDropdown(); 
            console.log(`Saved new profile: ${profileName}`);
        },

        // --- Core App Actions ---
        toggleAutoplay: () => {
            App.currentSettings.autoplayEnabled = !App.currentSettings.autoplayEnabled;
            App.saveGlobalSettings(); 
            UI.updatePlayButtonState(); 
            console.log(`Autoplay set to: ${App.currentSettings.autoplayEnabled}`);
        },
        changeMode: (modeName) => {
            App.currentSettings.currentMode = modeName;
            App.saveGlobalSettings(); 
            UI.updateModeDisplay(); 
            UI.updateSequenceDisplay(); 
            console.log(`Mode changed to: ${modeName}`);
        },
        
        // --- Number/Sequence Actions ---
        addNumber: (number) => {
            const mode = App.currentSettings.currentMode;
            App.sequences[mode].push(number);
            App.saveSequences();
            UI.updateSequenceDisplay();
        },
        deleteLastNumber: () => {
            const mode = App.currentSettings.currentMode;
            if (App.sequences[mode].length > 0) {
                App.sequences[mode].pop();
                App.saveSequences();
                UI.updateSequenceDisplay();
            }
        },
        // [NEW] Rapid Delete functions
        startRapidDelete: () => {
            if (App.rapidDeleteInterval) return; // Already running
            
            // Delete one immediately on press
            App.actionLibrary.deleteLastNumber(); 
            
            // Start the interval
            App.rapidDeleteInterval = setInterval(() => {
                App.actionLibrary.deleteLastNumber();
            }, App.currentSettings.deleteSpeed); // Uses speed from profile
        },
        stopRapidDelete: () => {
            clearInterval(App.rapidDeleteInterval);
            App.rapidDeleteInterval = null;
        },

        clearCurrentSequence: () => {
            const mode = App.currentSettings.currentMode;
            App.sequences[mode] = [];
            App.saveSequences();
            UI.updateSequenceDisplay();
        },
        clearAllData: () => {
            App.sequences = { standard: [], stealth: [], rapid: [] };
            App.saveSequences();
            UI.updateSequenceDisplay();
            console.log('Cleared all sequence data.');
        }
    },

    // --- [Data & Settings Management] ---
    
    loadGlobalSettings: () => {
        const savedSettings = localStorage.getItem('globalSettings');
        if (savedSettings) {
            const saved = JSON.parse(savedSettings);
            App.currentSettings = { ...masterSettingsTemplate, ...saved };
        } else {
            App.currentSettings = JSON.parse(JSON.stringify(defaultSettingsProfiles[0].settings));
        }
    },
    saveGlobalSettings: () => {
        localStorage.setItem('globalSettings', JSON.stringify(App.currentSettings));
    },

    loadProfiles: () => {
        const savedProfiles = localStorage.getItem('userProfiles');
        if (savedProfiles) {
            App.settingsProfiles = JSON.parse(savedProfiles);
        } else {
            App.settingsProfiles = JSON.parse(JSON.stringify(defaultSettingsProfiles));
        }
    },
    saveProfiles: () => {
        localStorage.setItem('userProfiles', JSON.stringify(App.settingsProfiles));
    },

    loadSequences: () => {
        const savedSequences = localStorage.getItem('sequenceData');
        if (savedSequences) {
            App.sequences = JSON.parse(savedSequences);
            if (!App.sequences.standard) App.sequences.standard = [];
            if (!App.sequences.stealth) App.sequences.stealth = [];
            if (!App.sequences.rapid) App.sequences.rapid = [];
        }
    },
    saveSequences: () => {
        localStorage.setItem('sequenceData', JSON.stringify(App.sequences));
    },

    loadShortcutMap: () => {
        const savedMap = localStorage.getItem('shortcutMap');
        if (savedMap) {
            App.shortcutMap = JSON.parse(savedMap);
        } else {
            // [NEW] Set a useful default for rapid delete
            App.shortcutMap = {
                'playButton_longPress': 'toggleAutoplay',
                'deleteButton_longPress': 'startRapidDelete' 
            };
            App.saveShortcutMap();
        }
    },
    saveShortcutMap: () => {
        localStorage.setItem('shortcutMap', JSON.stringify(App.shortcutMap));
    },

    initializeShortcuts: () => {
        ShortcutEngine.init(App.shortcutMap);
    }
};

// ==========================================================
// ShortcutEngine (The "Listeners")
// [UPGRADE] Now handles rapid delete release
// ==========================================================
const ShortcutEngine = {
    config: {
        doubleTapDelay: 250, 
        longPressDelay: 800  
    },
    activeMap: {}, 
    elements: {},  

    init: (shortcutMap) => {
        ShortcutEngine.activeMap = shortcutMap;

        for (const elementId of Object.keys(triggerManifest)) {
            const el = document.getElementById(elementId);
            if (el) {
                const oldEl = ShortcutEngine.elements[elementId] ? ShortcutEngine.elements[elementId].element : el;
                const newEl = oldEl.cloneNode(true); 
                oldEl.parentNode.replaceChild(newEl, oldEl); 
                ShortcutEngine.elements[elementId] = { element: newEl }; 
            }
        }
        
        for (const elementId of Object.keys(triggerManifest)) {
            const el = ShortcutEngine.elements[elementId].element;
            if (el) {
                el.addEventListener('mousedown', (e) => ShortcutEngine.handlePress(e, elementId), false);
                el.addEventListener('mouseup', (e) => ShortcutEngine.handleRelease(e, elementId), false);
                el.addEventListener('touchstart', (e) => ShortcutEngine.handlePress(e, elementId), { passive: false });
                el.addEventListener('touchend', (e) => ShortcutEngine.handleRelease(e, elementId), false);
            }
        }
    },

    handlePress: (e, elementId) => {
        e.preventDefault();
        const state = ShortcutEngine.elements[elementId];
        
        if (state.tapTimer) {
            clearTimeout(state.tapTimer);
            state.tapTimer = null;
        }

        state.longPressTimer = setTimeout(() => {
            console.log(`Gesture: ${elementId} -> longPress`);
            ShortcutEngine.executeAction(`${elementId}_longPress`);
            state.longPressFired = true; 
        }, ShortcutEngine.config.longPressDelay);
    },

    handleRelease: (e, elementId) => {
        e.preventDefault();
        const state = ShortcutEngine.elements[elementId];

        // [NEW] Check for rapid delete stop
        // If the long press action was 'startRapidDelete', we must call 'stopRapidDelete' on release.
        const longPressAction = ShortcutEngine.activeMap[`${elementId}_longPress`];
        if (longPressAction === 'startRapidDelete') {
            App.actionLibrary.stopRapidDelete();
        }

        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;

        if (state.longPressFired) {
            state.longPressFired = false; 
            return; 
        }

        state.tapCount = (state.tapCount || 0) + 1;

        state.tapTimer = setTimeout(() => {
            if (state.tapCount === 1) {
                console.log(`Gesture: ${elementId} -> click`);
                ShortcutEngine.executeAction(`${elementId}_click`);
            } else if (state.tapCount === 2) {
                console.log(`Gesture: ${elementId} -> doubleTap`);
                ShortcutEngine.executeAction(`${elementId}_doubleTap`);
            }
            state.tapCount = 0;
            state.tapTimer = null;
        }, ShortcutEngine.config.doubleTapDelay);
    },
    
    executeAction: (eventMapKey) => {
        const actionString = ShortcutEngine.activeMap[eventMapKey];
        if (!actionString) {
            return;
        }

        const match = actionString.match(/(\w+)\((.*?)\)/);
        
        if (match) {
            const actionName = match[1]; 
            const args = match[2].split(',').map(arg => arg.trim()); 
            
            if (App.actionLibrary[actionName]) {
                App.actionLibrary[actionName](...args); 
            } else {
                console.error(`Action not found: ${actionName}`);
            }
        } else {
            const actionName = actionString; 
            if (App.actionLibrary[actionName]) {
                App.actionLibrary[actionName](); 
            } else {
                console.error(`Action not found: ${actionName}`);
            }
        }
    }
};


// ==========================================================
// UI (The "Controls")
// ==========================================================

// --- Master list of all possible UI triggers ---
const triggerManifest = {
    'numButton1': ['click', 'longPress', 'doubleTap'],
    'numButton2': ['click', 'longPress', 'doubleTap'],
    'numButton3': ['click', 'longPress', 'doubleTap'],
    'numButton4': ['click', 'longPress', 'doubleTap'],
    'numButton5': ['click', 'longPress', 'doubleTap'],
    'numButton6': ['click', 'longPress', 'doubleTap'],
    'numButton7': ['click', 'longPress', 'doubleTap'],
    'numButton8': ['click', 'longPress', 'doubleTap'],
    'numButton9': ['click', 'longPress', 'doubleTap'],
    'numButton10': ['click', 'longPress', 'doubleTap'],
    'playButton': ['click', 'longPress', 'doubleTap'],
    'deleteButton': ['click', 'longPress', 'doubleTap'],
};

// --- Master list of all possible actions ---
// [NEW] Added Rapid Delete
const actionManifest = [
    { name: '--- Profiles ---', id: 'none', disabled: true },
    { name: 'Load Profile 1', id: 'loadProfile(0)' },
    { name: 'Load Profile 2', id: 'loadProfile(1)' },
    { name: 'Load Profile 3', id: 'loadProfile(2)' },
    { name: 'Load Profile 4', id: 'loadProfile(3)' },
    { name: 'Load Profile 5', id: 'loadProfile(4)' },
    { name: '--- Core ---', id: 'none', disabled: true },
    { name: 'Toggle Autoplay', id: 'toggleAutoplay' },
    { name: 'Change to Standard Mode', id: 'changeMode("standard")' },
    { name: 'Change to Stealth Mode', id: 'changeMode("stealth")' },
    { name: 'Change to Rapid Mode', id: 'changeMode("rapid")' },
    { name: '--- Data ---', id: 'none', disabled: true },
    { name: 'Add Number 1', id: 'addNumber(1)' },
    { name: 'Add Number 2', id: 'addNumber(2)' },
    { name: 'Add Number 3', id: 'addNumber(3)' },
    { name: 'Add Number 4', id: 'addNumber(4)' },
    { name: 'Add Number 5', id: 'addNumber(5)' },
    { name: 'Add Number 6', id: 'addNumber(6)' },
    { name: 'Add Number 7', id: 'addNumber(7)' },
    { name: 'Add Number 8', id: 'addNumber(8)' },
    { name: 'Add Number 9', id:s: 'addNumber(9)' },
    { name: 'Add Number 10', id: 'addNumber(10)' },
    { name: 'Delete Last Number', id: 'deleteLastNumber' },
    { name: 'Start Rapid Delete', id: 'startRapidDelete' },
    { name: 'Clear Current Sequence', id: 'clearCurrentSequence' },
    { name: 'Clear ALL Data', id: 'clearAllData' },
];


const UI = {
    updateAll: () => {
        UI.populateProfileDropdown();
        UI.loadSettingsToUI(); // This now applies visual changes
        UI.buildShortcutList(); 
        UI.updateModeDisplay(); 
        UI.updateSequenceDisplay(); 
        UI.updatePlayButtonState(); 
        console.log("UI Updated");
    },

    populateProfileDropdown: () => {
        const select = document.getElementById('profile-select-dropdown');
        select.innerHTML = ''; 
        
        App.settingsProfiles.forEach((profile, index) => {
            const option = document.createElement('option');
            option.value = index; 
            option.textContent = profile.name;
            select.appendChild(option);
        });
    },

    loadSettingsToUI: () => {
        // Load values into form fields
        document.getElementById('setting-delete-speed').value = App.currentSettings.deleteSpeed;
        document.getElementById('setting-stealth-opacity').value = App.currentSettings.stealthMode.opacity;
        document.getElementById('setting-stealth-hidebuttons').checked = App.currentSettings.stealthMode.hideButtons;
        
        // [NEW] Apply visual settings immediately
        UI.applyStealthSettings();
    },

    // [NEW] Function to apply stealth visuals
    applyStealthSettings: () => {
        const appContainer = document.getElementById('app-container');
        const keypad = document.getElementById('keypad-area');
        const settings = App.currentSettings.stealthMode;

        appContainer.style.opacity = settings.opacity;
        
        if (settings.hideButtons) {
            keypad.style.display = 'none';
        } else {
            keypad.style.display = 'grid'; // Or original display value
        }
    },

    buildShortcutList: () => {
        const container = document.getElementById('shortcut-list-container');
        container.innerHTML = ''; 

        const formatName = (str) => {
            return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        };

        for (const elementId of Object.keys(triggerManifest)) {
            const element = document.getElementById(elementId);
            const buttonName = element ? element.textContent : elementId; 
            
            const eventTypes = triggerManifest[elementId];
            
            for (const eventType of eventTypes) {
                const eventMapKey = `${elementId}_${eventType}`;

                const item = document.createElement('div');
                item.className = 'shortcut-item';

                const label = document.createElement('label');
                label.textContent = `${buttonName} (${formatName(eventType)}):`;
                
                const select = document.createElement('select');
                select.dataset.eventMap = eventMapKey; 

                const noneOption = document.createElement('option');
                noneOption.value = 'none';
                noneOption.textContent = 'None';
                select.appendChild(noneOption);

                const currentAction = App.shortcutMap[eventMapKey];

                actionManifest.forEach(action => {
                    const option = document.createElement('option');
                    option.value = action.id;
                    option.textContent = action.name;
                    if (action.disabled) {
                        option.disabled = true;
                    }
                    if (action.id === currentAction) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });

                item.appendChild(label);
                item.appendChild(select);
                container.appendChild(item);
            }
        }
    },

    updateSequenceDisplay: () => {
        const display = document.getElementById('main-sequence-display');
        const mode = App.currentSettings.currentMode;
        if (display && App.sequences[mode]) {
            display.textContent = App.sequences[mode].join(' ');
        }
    },

    updateModeDisplay: () => {
        const modes = ['standard', 'stealth', 'rapid'];
        const currentMode = App.currentSettings.currentMode;
        
        modes.forEach(mode => {
            const button = document.getElementById(`mode-${mode}`);
            if (button) {
                if (mode === currentMode) {
                    button.classList.add('active'); 
                } else {
                    button.classList.remove('active'); 
                }
            }
        });
    },

    updatePlayButtonState: () => {
        const playButton = document.getElementById('playButton');
        if (!playButton) return;
        
        if (App.currentSettings.autoplayEnabled) {
            playButton.classList.add('active'); 
        } else {
            playButton.classList.remove('active'); 
        }
    }
};


// ==========================================================
// DEFAULT SETTINGS AND PROFILES
// ==========================================================
const masterSettingsTemplate = {
    currentMode: 'standard', 
    deleteSpeed: 100, // Now used by Rapid Delete
    stealthMode: {
        opacity: 1.0, // Now visually applied
        hideButtons: false // Now visually applied
    },
    autoplayEnabled: false
};

const defaultSettingsProfiles = [
    { name: "Profile 1: Standard", isDefault: true, settings: { ...masterSettingsTemplate } },
    { name: "Profile 2: Stealth", isDefault: true, settings: { ...masterSettingsTemplate, currentMode: 'stealth', stealthMode: { opacity: 0.5, hideButtons: true } } },
    { name: "Profile 3: Rapid Input", isDefault: true, settings: { ...masterSettingsTemplate, currentMode: 'rapid', deleteSpeed: 50 } },
    { name: "Profile 4: Autoplay", isDefault: true, settings: { ...masterSettingsTemplate, autoplayEnabled: true } },
    { name: "Profile 5: Custom", isDefault: true, settings: { ...masterSettingsTemplate } }
];
