// --- [App Initialization] ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Load Core Data ---
    App.loadGlobalSettings(); 
    App.loadProfiles(); 
    App.loadShortcutMap(); 
    
    // --- Initialize Systems ---
    App.initializeShortcuts(); 
    UI.updateAll(); // This now populates dropdowns and settings
    
    console.log("Number Tracker App Initialized.");

    // --- [NEW] Settings Tab Event Listeners ---
    
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
            saveProfileInput.value = ''; // Clear input after saving
        } else {
            alert("Please enter a name for the profile.");
        }
    });

    // Live-Updating Settings Inputs
    // --- Global Settings ---
    const deleteSpeedInput = document.getElementById('setting-delete-speed');
    deleteSpeedInput.addEventListener('change', (e) => {
        App.currentSettings.deleteSpeed = parseInt(e.target.value, 10);
        App.saveGlobalSettings();
    });

    // --- Stealth Settings ---
    const stealthOpacityInput = document.getElementById('setting-stealth-opacity');
    stealthOpacityInput.addEventListener('input', (e) => { // 'input' for live slider update
        App.currentSettings.stealthMode.opacity = parseFloat(e.target.value);
        App.saveGlobalSettings();
        // We can add a live UI update here, e.g.:
        // document.getElementById('app-container').style.opacity = App.currentSettings.stealthMode.opacity;
    });

    const stealthHideButtonsInput = document.getElementById('setting-stealth-hidebuttons');
    stealthHideButtonsInput.addEventListener('change', (e) => {
        App.currentSettings.stealthMode.hideButtons = e.target.checked;
        App.saveGlobalSettings();
    });
});

// ==========================================================
// App (The "Brain")
// Manages all data, settings, and logic.
// ==========================================================
const App = {
    // --- [Phase 1: Core Data Structures] ---
    
    currentSettings: {}, // The active settings object
    settingsProfiles: [], // All saved profiles (defaults + user)
    shortcutMap: {}, // All active shortcuts (e.g., 'playButton_longPress': 'toggleAutoplay')
    
    actionLibrary: {
        // --- Profile Actions ---
        loadProfile: (profileIndex) => {
            if (App.settingsProfiles[profileIndex]) {
                // Deep copy the profile to currentSettings
                App.currentSettings = JSON.parse(JSON.stringify(App.settingsProfiles[profileIndex].settings));
                App.saveGlobalSettings(); // Save this as the new active settings
                UI.loadSettingsToUI(); // [NEW] Update the UI to match
                console.log(`Loaded profile: ${App.settingsProfiles[profileIndex].name}`);
            } else {
                console.error(`Profile index ${profileIndex} not found.`);
            }
        },
        saveCurrentProfile: (profileName) => {
            const newProfile = {
                name: profileName,
                isDefault: false,
                settings: JSON.parse(JSON.stringify(App.currentSettings)) // Deep copy
            };
            App.settingsProfiles.push(newProfile);
            App.saveProfiles(); // Save to localStorage
            UI.populateProfileDropdown(); // [NEW] Refresh the dropdown
            console.log(`Saved new profile: ${profileName}`);
        },

        // --- Core App Actions ---
        toggleAutoplay: () => {
            App.currentSettings.autoplayEnabled = !App.currentSettings.autoplayEnabled;
            App.saveGlobalSettings(); // Save change
            console.log(`Autoplay set to: ${App.currentSettings.autoplayEnabled}`);
            // UI.updatePlayButtonState(); // We'll add this
        },
        changeMode: (modeName) => {
            App.currentSettings.currentMode = modeName;
            App.saveGlobalSettings(); // Save change
            console.log(`Mode changed to: ${modeName}`);
            // UI.updateModeDisplay(); // We'll add this
        },
        
        // --- Number/Sequence Actions ---
        addNumber: (number) => {
            console.log(`Adding number: ${number}`);
            // (Old logic will be merged here)
        },
        deleteLastNumber: () => {
            console.log('Deleting last number');
             // (Old logic will be merged here)
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
            // Merge saved settings with template to ensure new properties are added
            const saved = JSON.parse(savedSettings);
            App.currentSettings = { ...masterSettingsTemplate, ...saved };
        } else {
            // If no settings saved, load the first default profile
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
        ShortcutEngine.removeAllListeners(); 
        
        for (const elementEvent of Object.keys(App.shortcutMap)) {
            const [elementId, eventType] = elementEvent.split('_');
            const actionString = App.shortcutMap[elementEvent]; 

            const element = document.getElementById(elementId);
            if (!element) {
                console.warn(`Shortcut target not found: ${elementId}`);
                continue;
            }

            ShortcutEngine.attachListener(element, eventType, actionString);
        }
    }
};

// ==========================================================
// ShortcutEngine (The "Listeners")
// ==========================================================
const ShortcutEngine = {
    // (This object is unchanged from the previous file for now)
    // ... (keeping it folded for brevity, the logic is the same)
    
    attachListener: (element, eventType, actionString) => {
        // Simple example for 'click'
        if (eventType === 'click') {
            element.addEventListener('click', () => {
                ShortcutEngine.executeAction(actionString);
            });
        }
        
        // --- PLACEHOLDER for Long Press ---
        if (eventType === 'longPress') {
            let timer;
            element.addEventListener('mousedown', () => {
                timer = setTimeout(() => {
                    ShortcutEngine.executeAction(actionString);
                }, 800); // 800ms
            });
            element.addEventListener('mouseup', () => {
                clearTimeout(timer);
            });
            // Add touch events for mobile
            element.addEventListener('touchstart', () => {
                timer = setTimeout(() => {
                    ShortcutEngine.executeAction(actionString);
                }, 800);
            }, { passive: true });
            element.addEventListener('touchend', () => {
                clearTimeout(timer);
            });
        }
    },
    
    executeAction: (actionString) => {
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
    },
    
    removeAllListeners: () => {
        // (This still needs a robust implementation)
        // console.log("Removing all dynamic listeners... (placeholder)");
    }
};


// ==========================================================
// UI (The "Controls")
// [NEW] This object is now functional
// ==========================================================
const UI = {
    updateAll: () => {
        UI.populateProfileDropdown();
        UI.loadSettingsToUI();
        console.log("UI Updated");
    },

    // [NEW] Loads all profiles into the dropdown
    populateProfileDropdown: () => {
        const select = document.getElementById('profile-select-dropdown');
        select.innerHTML = ''; // Clear existing options
        
        App.settingsProfiles.forEach((profile, index) => {
            const option = document.createElement('option');
            option.value = index; // Store the index as the value
            option.textContent = profile.name;
            select.appendChild(option);
        });
    },

    // [NEW] Applies App.currentSettings to all form fields
    loadSettingsToUI: () => {
        // Global
        document.getElementById('setting-delete-speed').value = App.currentSettings.deleteSpeed;
        
        // Stealth
        document.getElementById('setting-stealth-opacity').value = App.currentSettings.stealthMode.opacity;
        document.getElementById('setting-stealth-hidebuttons').checked = App.currentSettings.stealthMode.hideButtons;
        
        // ... we will add all other settings here as we build them
    }
};


// ==========================================================
// DEFAULT SETTINGS AND PROFILES
// [NEW] Updated template with the settings we just added
// ==========================================================
const masterSettingsTemplate = {
    currentMode: 'standard',
    deleteSpeed: 100, // Linked to UI
    stealthMode: {
        opacity: 1.0, // Linked to UI
        hideButtons: false // Linked to UI
    },
    autoplayEnabled: false
};

// Your 5 default profiles (now using the full template)
const defaultSettingsProfiles = [
    {
        name: "Profile 1: Standard",
        isDefault: true,
        settings: {
            ...masterSettingsTemplate
        }
    },
    {
        name: "Profile 2: Stealth",
        isDefault: true,
        settings: {
            ...masterSettingsTemplate,
            currentMode: 'stealth',
            stealthMode: {
                opacity: 0.5,
                hideButtons: true
            }
        }
    },
    {
        name: "Profile 3: Rapid Input",
        isDefault: true,
        settings: {
            ...masterSettingsTemplate,
            currentMode: 'rapid',
            deleteSpeed: 50
        }
    },
    {
        name: "Profile 4: Autoplay",
        isDefault: true,
        settings: {
            ...masterSettingsTemplate,
            autoplayEnabled: true
        }
    },
    {
        name: "Profile 5: Custom",
        isDefault: true,
        settings: {
            ...masterSettingsTemplate
        }
    }
];
