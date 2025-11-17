// --- [App Initialization] ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Load Core Data ---
    App.loadGlobalSettings(); 
    App.loadProfiles(); 
    App.loadShortcutMap(); 
    
    // --- Initialize Systems ---
    App.initializeShortcuts(); // This is now much smarter
    UI.updateAll(); 
    
    console.log("Number Tracker App Initialized.");

    // --- Settings Tab Event Listeners ---
    
    // Profile Management
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
    });

    const stealthHideButtonsInput = document.getElementById('setting-stealth-hidebuttons');
    stealthHideButtonsInput.addEventListener('change', (e) => {
        App.currentSettings.stealthMode.hideButtons = e.target.checked;
        App.saveGlobalSettings();
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
            App.initializeShortcuts(); // Re-apply all listeners with new map
            
            console.log(`Shortcut updated: ${eventMapKey} -> ${newAction}`);
        }
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
    
    actionLibrary: {
        // --- Profile Actions ---
        loadProfile: (profileIndex) => {
            if (App.settingsProfiles[profileIndex]) {
                App.currentSettings = JSON.parse(JSON.stringify(App.settingsProfiles[profileIndex].settings));
                App.saveGlobalSettings(); 
                UI.loadSettingsToUI(); 
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
            console.log(`Autoplay set to: ${App.currentSettings.autoplayEnabled}`);
        },
        changeMode: (modeName) => {
            App.currentSettings.currentMode = modeName;
            App.saveGlobalSettings(); 
            console.log(`Mode changed to: ${modeName}`);
        },
        
        // --- Number/Sequence Actions ---
        addNumber: (number) => {
            console.log(`Adding number: ${number}`);
            // (Old logic will be merged here)
        },
        deleteLastNumber: () => {
            console.log('Deleting last number');
        },
        clearCurrentSequence: () => {
            console.log('Clearing current sequence');
        },
        clearAllData: () => {
            console.log('Clearing ALL data');
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

    loadShortcutMap: () => {
        const savedMap = localStorage.getItem('shortcutMap');
        if (savedMap) {
            App.shortcutMap = JSON.parse(savedMap);
        } else {
            App.shortcutMap = {
                'playButton_longPress': 'toggleAutoplay' 
            };
            App.saveShortcutMap();
        }
    },

    saveShortcutMap: () => {
        localStorage.setItem('shortcutMap', JSON.stringify(App.shortcutMap));
    },

    // --- [Phase 2: The "Engine"] ---
    
    initializeShortcuts: () => {
        // [NEW] This is now much simpler.
        // We just tell the ShortcutEngine to re-initialize itself.
        // It will read the triggerManifest and attach all necessary listeners.
        ShortcutEngine.init(App.shortcutMap);
    }
};

// ==========================================================
// ShortcutEngine (The "Listeners")
// [MASSIVE UPGRADE] This is the new, robust gesture engine.
// ==========================================================
const ShortcutEngine = {
    // Configurable delays
    config: {
        doubleTapDelay: 250, // Max time (ms) between taps for a double tap
        longPressDelay: 800   // Min time (ms) for a long press
    },
    
    activeMap: {}, // The shortcut map (e.g., 'playButton_longPress': 'toggleAutoplay')
    elements: {},  // Stores state for elements (e.g., 'playButton': { tapTimer, ... })

    // This is called once by App.initializeShortcuts()
    init: (shortcutMap) => {
        ShortcutEngine.activeMap = shortcutMap;

        // First, clear all old listeners by cloning nodes
        // This is a robust way to remove all listeners we've added
        for (const elementId of Object.keys(triggerManifest)) {
            const el = document.getElementById(elementId);
            if (el) {
                const oldEl = ShortcutEngine.elements[elementId] ? ShortcutEngine.elements[elementId].element : el;
                const newEl = oldEl.cloneNode(true); // Clone
                oldEl.parentNode.replaceChild(newEl, oldEl); // Replace
                ShortcutEngine.elements[elementId] = { element: newEl }; // Store the new element
            }
        }
        
        // Now, attach new, smart listeners to the new elements
        for (const elementId of Object.keys(triggerManifest)) {
            const el = ShortcutEngine.elements[elementId].element;
            if (el) {
                // Attach the raw down/up listeners
                el.addEventListener('mousedown', (e) => ShortcutEngine.handlePress(e, elementId), false);
                el.addEventListener('mouseup', (e) => ShortcutEngine.handleRelease(e, elementId), false);
                el.addEventListener('touchstart', (e) => ShortcutEngine.handlePress(e, elementId), { passive: false });
                el.addEventListener('touchend', (e) => ShortcutEngine.handleRelease(e, elementId), false);
            }
        }
    },

    // Called on mousedown or touchstart
    handlePress: (e, elementId) => {
        e.preventDefault();
        const state = ShortcutEngine.elements[elementId];
        
        // Clear any pending click/double-tap from a previous tap
        if (state.tapTimer) {
            clearTimeout(state.tapTimer);
            state.tapTimer = null;
        }

        // Set a timer for long press
        state.longPressTimer = setTimeout(() => {
            console.log(`Gesture: ${elementId} -> longPress`);
            ShortcutEngine.executeAction(`${elementId}_longPress`);
            state.longPressFired = true; // Mark that long press has fired
        }, ShortcutEngine.config.longPressDelay);
    },

    // Called on mouseup or touchend
    handleRelease: (e, elementId) => {
        e.preventDefault();
        const state = ShortcutEngine.elements[elementId];

        // 1. Clear the long press timer
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;

        // 2. Check if a long press already fired
        if (state.longPressFired) {
            state.longPressFired = false; // Reset for next press
            return; // Don't do anything else (no click/double-tap)
        }

        // 3. This is a "tap". Now we check if it's single or double.
        state.tapCount = (state.tapCount || 0) + 1;

        // Start a timer to wait for another tap
        state.tapTimer = setTimeout(() => {
            if (state.tapCount === 1) {
                // Timer expired, it was a single click
                console.log(`Gesture: ${elementId} -> click`);
                ShortcutEngine.executeAction(`${elementId}_click`);
            } else if (state.tapCount === 2) {
                // Timer expired, it was a double tap
                console.log(`Gesture: ${elementId} -> doubleTap`);
                ShortcutEngine.executeAction(`${elementId}_doubleTap`);
            }
            // Reset state
            state.tapCount = 0;
            state.tapTimer = null;
        }, ShortcutEngine.config.doubleTapDelay);
    },
    
    // Finds and runs the action from the Action Library
    executeAction: (eventMapKey) => {
        const actionString = ShortcutEngine.activeMap[eventMapKey];
        if (!actionString) {
            // No action assigned to this gesture
            return;
        }

        // Check for parameters, e.g., "loadProfile(2)"
        const match = actionString.match(/(\w+)\((.*?)\)/);
        
        if (match) {
            // Action WITH parameters
            const actionName = match[1]; // "loadProfile"
            const args = match[2].split(',').map(arg => arg.trim()); // ["2"]
            
            if (App.actionLibrary[actionName]) {
                App.actionLibrary[actionName](...args); // Run the function
            } else {
                console.error(`Action not found: ${actionName}`);
            }
        } else {
            // Action with NO parameters
            const actionName = actionString; // "toggleAutoplay"
            if (App.actionLibrary[actionName]) {
                App.actionLibrary[actionName](); // Run the function
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
const actionManifest = [
    { name: '--- Profiles ---', id: 'none', disabled: true },
    { name: 'Load Profile 1', id: 'loadProfile(0)' },
    { name: 'Load Profile 2', id: 'loadProfile(1)' },
    { name: 'Load Profile 3', id: 'loadProfile(2)' },
    { name: 'Load Profile 4', id: 'loadProfile(3)' },
    { name: 'Load Profile 5', id: 'loadProfile(4)' },
    { name: '--- Core ---', id: 'none', disabled: true },
    { name: 'Toggle Autoplay', id: 'toggleAutoplay' },
    { name: '--- Data ---', id: 'none', disabled: true },
    { name: 'Add Number 1', id: 'addNumber(1)' },
    { name: 'Add Number 2', id: 'addNumber(2)' },
    { name: 'Add Number 3', id: 'addNumber(3)' },
    { name: 'Add Number 4', id: 'addNumber(4)' },
    { name: 'Add Number 5', id: 'addNumber(5)' },
    { name: 'Add Number 6', id: 'addNumber(6)' },
    { name: 'Add Number 7', id: 'addNumber(7)' },
    { name: 'Add Number 8', id: 'addNumber(8)' },
    { name: 'Add Number 9', id: 'addNumber(9)' },
    { name: 'Add Number 10', id: 'addNumber(10)' },
    { name: 'Delete Last Number', id: 'deleteLastNumber' },
    { name: 'Clear Current Sequence', id: 'clearCurrentSequence' },
    { name: 'Clear ALL Data', id: 'clearAllData' },
];


const UI = {
    updateAll: () => {
        UI.populateProfileDropdown();
        UI.loadSettingsToUI();
        UI.buildShortcutList(); 
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
        document.getElementById('setting-delete-speed').value = App.currentSettings.deleteSpeed;
        document.getElementById('setting-stealth-opacity').value = App.currentSettings.stealthMode.opacity;
        document.getElementById('setting-stealth-hidebuttons').checked = App.currentSettings.stealthMode.hideButtons;
    },

    buildShortcutList: () => {
        const container = document.getElementById('shortcut-list-container');
        container.innerHTML = ''; // Clear old list

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
    }
};


// ==========================================================
// DEFAULT SETTINGS AND PROFILES
// ==========================================================
const masterSettingsTemplate = {
    currentMode: 'standard',
    deleteSpeed: 100,
    stealthMode: {
        opacity: 1.0,
        hideButtons: false
    },
    autoplayEnabled: false
};

const defaultSettingsProfiles = [
    { name: "Profile 1: Standard", isDefault: true, settings: { ...masterSettingsTemplate } },
    { name: "Profile 2: Stealth", isDefault: true, settings: { ...masterSettingsTemplate, currentMode: 'stealth', stealthMode: { opacity: 0.5, hideButtons: true } } },
    { name: "Profile 3: Rapid Input", isDefault: true, settings: { ...masterSettingsTemplate, currentMode: 'rapid', deleteSpeed: 50 } },
    { name:G: "Profile 4: Autoplay", isDefault: true, settings: { ...masterSettingsTemplate, autoplayEnabled: true } },
    { name: "Profile 5: Custom", isDefault: true, settings: { ...masterSettingsTemplate } }
];
