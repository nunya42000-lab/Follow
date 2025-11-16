(function() {
    'use strict';
    
    // --- Helper function to apply all settings visually ---
    function applyAllSettings() {
        const settings = StateManager.getSettings();
        UI.applyGlobalUiScale(settings.globalUiScale);
        UI.updateTheme(settings.isDarkMode);
        UI.updateVoiceInputVisibility();
        UI.updateInput(settings.currentInput); // This re-renders sequences
        UI.updateMainUIControlsVisibility();
    }

    function initializeListeners() {
        const dom = UI.getDomElements();
        const DOUBLE_CLICK_DELAY = 250; // 250ms
        
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const { value, action, input, copyTarget } = button.dataset;
            const settings = StateManager.getSettings();

            if (copyTarget) {
                // ... (code is the same)
                return;
            }
            
            // --- MODAL/ACTION BUTTONS ---
            if (action === 'open-settings') { UI.openSettingsModal(); return; }
            if (action === 'open-help') { UI.closeGameSetupModal(); UI.closeSettingsModal(); UI.openHelpModal(); return; }
            if (action === 'open-share') { UI.openShareModal(); return; }
            if (action === 'open-chat') { UI.openChatModal(); return; }
            if (action === 'open-support') { UI.openSupportModal(); return; }

            if (action === 'copy-link') {
                // ... (code is the same)
                return;
            }
            
            if (action === 'native-share') {
                // ... (code is the same)
                return;
            }
            
            if (action === 'restore-defaults') {
                UI.showModal('Restore Defaults?', 
                          'This will reset all settings, presets, and sequences. Are you sure?', 
                          () => {
                              AppCore.handleRestoreDefaults();
                              UI.populateSettingsModal(); // Refresh modal with defaults
                          }, 
                          'Restore', 
                          'Cancel');
                return;
            }

            if (action === 'reset-unique-rounds') {
                // ... (code is the same)
                UI.showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', AppCore.resetUniqueRoundsMode, 'Reset', 'Cancel');
                return;
            }

            // --- NEW: Sensor Permission Buttons ---
            if (action === 'request-camera') {
                AppCore.requestCameraPermission();
                return;
            }
            if (action === 'request-mic') {
                AppCore.requestMicPermission();
                return;
            }
            
            // --- VALUE BUTTONS ---
            if (value && input === settings.currentInput) {
                // ... (code is the same)
                if (input === AppConfig.INPUTS.KEY9 && /^[1-9]$/.test(value)) {
                    AppCore.addValue(value);
                }
                else if (input === AppConfig.INPUTS.KEY12 && /^(?:[1-9]|1[0-2])$/.test(value)) {
                    AppCore.addValue(value);
                }
                else if (input === AppConfig.INPUTS.PIANO && (/^[1-5]$/.test(value) || /^[A-G]$/.test(value))) {
                    AppCore.addValue(value);
                }
            }
        });
        
        dom.allVoiceInputs.forEach(input => {
            // ... (code is the same)
        });
        
        document.querySelectorAll('button[data-action="backspace"]').forEach(btn => {
            // ... (code is the same)
        });
        
        // --- Modal: Game Setup (Welcome) Listeners ---
        // ... (code is the same) ...
        
        // --- Modal: Settings (Full Setup) Listeners ---
        
        // This button now SAVES and closes
        if (dom.closeSettings) dom.closeSettings.addEventListener('click', () => {
            UI.saveSettingsFromModal();
            UI.closeSettingsModal();
        });
        
        // Tab Navigation
        if (dom.settingsTabNav) dom.settingsTabNav.addEventListener('click', UI.handleSettingsTabClick);
        
        // Preset Management
        if (dom.savePresetButton) {
            // ... (code is the same)
        }
        if (dom.renamePresetButton) {
            // ... (code is the same)
        }
        if (dom.deletePresetButton) {
            // ... (code is the same)
        }
        if (dom.presetSelect) {
            // ... (code is the same)
        }
        
        // --- All other settings toggles/sliders now just mark presets as 'custom' ---
        function markAsCustom() { UI.renderPresetsDropdown(dom.presetSelect); }
        
        // Tab 1: Setup
        if (dom.inputSelect) dom.inputSelect.addEventListener('change', markAsCustom);
        if (dom.modeToggle) dom.modeToggle.addEventListener('change', () => {
            UI.updateGameSetupVisibility();
            markAsCustom();
        });
        if (dom.machinesSlider) dom.machinesSlider.addEventListener('input', (e) => {
            UI.updateMachinesDisplay(parseInt(e.target.value), dom.machinesDisplay);
            UI.updateGameSetupVisibility();
            markAsCustom();
        });
        if (dom.sequenceLengthSlider) dom.sequenceLengthSlider.addEventListener('input', (e) => {
            UI.updateSequenceLengthDisplay(parseInt(e.target.value), dom.sequenceLengthDisplay);
            markAsCustom();
        });
        if (dom.chunkSlider) dom.chunkSlider.addEventListener('input', (e) => { UI.updateChunkDisplay(parseInt(e.target.value), dom.chunkDisplay); markAsCustom(); });
        if (dom.delaySlider) dom.delaySlider.addEventListener('input', (e) => { UI.updateDelayDisplay(parseInt(e.target.value), dom.delayDisplay); markAsCustom(); });
        if (dom.autoclearToggle) dom.autoclearToggle.addEventListener('change', markAsCustom);
        
        // Tab 2: Input
        if (dom.voiceInputToggle) dom.voiceInputToggle.addEventListener('change', markAsCustom);
        if (dom.speedDeleteToggle) dom.speedDeleteToggle.addEventListener('change', markAsCustom);
        if (dom.hapticsToggle) dom.hapticsToggle.addEventListener('change', (e) => { if (e.target.checked) AppCore.vibrate(50); markAsCustom(); });
        // --- NEW: Toggle listeners for mic/camera ---
        if (dom.cameraInputToggle) dom.cameraInputToggle.addEventListener('change', markAsCustom);
        if (dom.micInputToggle) dom.micInputToggle.addEventListener('change', markAsCustom);

        // Tab 3: Playback
        if (dom.playbackSpeedSlider) dom.playbackSpeedSlider.addEventListener('input', (e) => {
            UI.updatePlaybackSpeedDisplay(parseInt(e.target.value), dom.playbackSpeedDisplay);
            markAsCustom();
        });
        if (dom.autoplayToggle) dom.autoplayToggle.addEventListener('change', markAsCustom);
        if (dom.audioPlaybackToggle) dom.audioPlaybackToggle.addEventListener('change', (e) => { if (e.target.checked) DemoPlayer.speak("Audio"); markAsCustom(); });

        // Tab 4: General
        if (dom.uiScaleSlider) {
            // ... (code is the same)
        }
        if (dom.darkModeToggle) dom.darkModeToggle.addEventListener('change', (e) => {
            StateManager.getSettings().isDarkMode = e.target.checked; // Live update theme
            UI.updateTheme(e.target.checked);
            markAsCustom();
        });
        
        // --- Other Modals ---
        // ... (code is the same) ...
        
        // --- NEW: SWIPE-TO-DELETE GESTURE ---
        let touchstartX = 0;
        let touchendX = 0;
        const gestureZone = dom.sequenceContainer; // Only listen on the main content area

        gestureZone.addEventListener('touchstart', function(event) {
            touchstartX = event.changedTouches[0].screenX;
        }, false);

        gestureZone.addEventListener('touchend', function(event) {
            touchendX = event.changedTouches[0].screenX;
            handleSwipeGesture();
        }, false); 

        function handleSwipeGesture() {
            // Check if it was a left swipe
            if (touchendX < touchstartX - 50) { // 50px minimum swipe distance
                AppCore.handleBackspace();
            }
        }
        
        // --- NEW: PLAY BUTTON DOUBLE-CLICK LISTENER ---
        const allPlayButtons = document.querySelectorAll('button[data-action="play-demo"]');
        allPlayButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                // ... (code is the same)
            });
        });

    } // --- END of initializeListeners() ---

    // --- Initialization ---
    window.onload = function() {
        // ... (code is the same)
    };

})();
e = name; 
                }
            });
        }
        
        if (dom.renamePresetButton) {
            dom.renamePresetButton.addEventListener('click', () => {
                const oldName = dom.presetSelect.value;
                if (oldName === "__custom__") {
                    UI.showModal("Cannot Rename", "You must save custom settings as a new preset first.", () => UI.closeModal(), "OK", "");
                    return;
                }
                const newName = prompt("Enter new name for preset:", oldName);
                if (newName && newName !== oldName) {
                    StateManager.renamePreset(oldName, newName);
                    UI.renderPresetsDropdown(dom.presetSelect);
                    dom.presetSelect.value = newName;
                }
            });
        }
        
        if (dom.deletePresetButton) {
            dom.deletePresetButton.addEventListener('click', () => {
                const name = dom.presetSelect.value;
                if (name === "__custom__") {
                    UI.showModal("Cannot Delete", "You cannot delete unsaved settings.", () => UI.closeModal(), "OK", "");
                    return;
                }
                UI.showModal("Delete Preset?", `Are you sure you want to delete "${name}"?`, () => {
                    if (StateManager.deletePreset(name)) {
                        // Load the first available preset
                        const firstPreset = Object.keys(StateManager.getPresets())[0];
                        StateManager.loadSettingsFromPreset(firstPreset);
                        applyAllSettings();
                        UI.populateSettingsModal(); // Refresh modal
                    }
                }, "Delete", "Cancel");
            });
        }

        // THIS IS THE FIX:
        if (dom.presetSelect) {
            dom.presetSelect.addEventListener('change', (event) => {
                const presetName = event.target.value;
                if (presetName === "__custom__") return;
                
                StateManager.loadSettingsFromPreset(presetName);
                
                // REFRESH the modal with the new preset's values
                UI.populateSettingsModal(); 
                
                // Apply changes to the main app
                applyAllSettings();
            });
        }
        
        // --- All other settings toggles/sliders now just mark presets as 'custom' ---
        function markAsCustom() { UI.renderPresetsDropdown(dom.presetSelect); }
        
        // Tab 1: Setup
        if (dom.inputSelect) dom.inputSelect.addEventListener('change', markAsCustom);
        if (dom.modeToggle) dom.modeToggle.addEventListener('change', () => {
            UI.updateGameSetupVisibility();
            markAsCustom();
        });
        if (dom.machinesSlider) dom.machinesSlider.addEventListener('input', (e) => {
            UI.updateMachinesDisplay(parseInt(e.target.value), dom.machinesDisplay);
            UI.updateGameSetupVisibility();
            markAsCustom();
        });
        if (dom.sequenceLengthSlider) dom.sequenceLengthSlider.addEventListener('input', (e) => {
            UI.updateSequenceLengthDisplay(parseInt(e.target.value), dom.sequenceLengthDisplay);
            markAsCustom();
        });
        if (dom.chunkSlider) dom.chunkSlider.addEventListener('input', (e) => { UI.updateChunkDisplay(parseInt(e.target.value), dom.chunkDisplay); markAsCustom(); });
        if (dom.delaySlider) dom.delaySlider.addEventListener('input', (e) => { UI.updateDelayDisplay(parseInt(e.target.value), dom.delayDisplay); markAsCustom(); });
        if (dom.autoclearToggle) dom.autoclearToggle.addEventListener('change', markAsCustom);
        
        // Tab 2: Input
        if (dom.voiceInputToggle) dom.voiceInputToggle.addEventListener('change', markAsCustom);
        if (dom.speedDeleteToggle) dom.speedDeleteToggle.addEventListener('change', markAsCustom);
        if (dom.hapticsToggle) dom.hapticsToggle.addEventListener('change', (e) => { if (e.target.checked) AppCore.vibrate(50); markAsCustom(); });

        // Tab 3: Playback
        if (dom.playbackSpeedSlider) dom.playbackSpeedSlider.addEventListener('input', (e) => {
            UI.updatePlaybackSpeedDisplay(parseInt(e.target.value), dom.playbackSpeedDisplay);
            markAsCustom();
        });
        if (dom.autoplayToggle) dom.autoplayToggle.addEventListener('change', markAsCustom);
        if (dom.audioPlaybackToggle) dom.audioPlaybackToggle.addEventListener('change', (e) => { if (e.target.checked) DemoPlayer.speak("Audio"); markAsCustom(); });

        // Tab 4: General
        if (dom.uiScaleSlider) {
            dom.uiScaleSlider.addEventListener('input', (event) => {
                const multiplier = parseInt(event.target.value) / 100;
                UI.updateScaleDisplay(multiplier, dom.uiScaleDisplay);
                StateManager.getSettings().uiScaleMultiplier = multiplier; // Live update
                UI.renderSequences();
                markAsCustom();
            });
        }
        if (dom.darkModeToggle) dom.darkModeToggle.addEventListener('change', (e) => {
            StateManager.getSettings().isDarkMode = e.target.checked; // Live update theme
            UI.updateTheme(e.target.checked);
            markAsCustom();
        });
        
        // --- Other Modals ---
        if (dom.closeHelp) dom.closeHelp.addEventListener('click', UI.closeHelpModal);
        if (dom.closeShare) dom.closeShare.addEventListener('click', UI.closeShareModal);
        if (dom.closeChatModal) dom.closeChatModal.addEventListener('click', UI.closeChatModal);
        if (dom.closeSupportModal) dom.closeSupportModal.addEventListener('click', UI.closeSupportModal);
        
        // --- *** NEW: SWIPE-TO-DELETE GESTURE *** ---
        let touchstartX = 0;
        let touchendX = 0;
        const gestureZone = dom.sequenceContainer; // Only listen on the main content area

        gestureZone.addEventListener('touchstart', function(event) {
            touchstartX = event.changedTouches[0].screenX;
        }, false);

        gestureZone.addEventListener('touchend', function(event) {
            touchendX = event.changedTouches[0].screenX;
            handleSwipeGesture();
        }, false); 

        function handleSwipeGesture() {
            // Check if it was a left swipe
            if (touchendX < touchstartX - 50) { // 50px minimum swipe distance
                AppCore.handleBackspace();
            }
        }
        
        // --- *** NEW: PLAY BUTTON DOUBLE-CLICK LISTENER *** ---
        const allPlayButtons = document.querySelectorAll('button[data-action="play-demo"]');
        allPlayButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const button = event.currentTarget;
                const settings = StateManager.getSettings();
                button.clickCount = (button.clickCount || 0) + 1;
                if (button.clickCount === 1) {
                    setTimeout(() => {
                        if (button.clickCount === 1) {
                            // --- SINGLE-CLICK ACTION ---
                            if (button.dataset.input === settings.currentInput) {
                                DemoPlayer.handleCurrentDemo();
                            }
                        } else {
                            // --- DOUBLE-CLICK ACTION ---
                            settings.isAutoplayEnabled = !settings.isAutoplayEnabled;
                            StateManager.saveState();
                            // Update toggles in modals if they are open
                            if (dom.autoplayToggle) dom.autoplayToggle.checked = settings.isAutoplayEnabled;
                            if (dom.welcomeAutoplayToggle) dom.welcomeAutoplayToggle.checked = settings.isAutoplayEnabled;
                            
                            button.classList.add('!bg-btn-control-green');
                            setTimeout(() => {
                                button.classList.remove('!bg-btn-control-green');
                            }, 500);
                        }
                        button.clickCount = 0;
                    }, DOUBLE_CLICK_DELAY);
                }
            });
        });

    } // --- END of initializeListeners() ---

    // --- Initialization ---
    window.onload = function() {
        StateManager.loadState(); 
        const settings = StateManager.getSettings();
        
        UI.assignDomElements();
        
        applyAllSettings(); // Apply all loaded settings
        
        initializeListeners();
        
        if (settings.showWelcomeScreen) {
            setTimeout(UI.openGameSetupModal, 500); 
        }
        
        if (settings.isAudioPlaybackEnabled) DemoPlayer.speak(" "); 

        // Register the Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    };

})();
