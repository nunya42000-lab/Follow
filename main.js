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
        
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const { value, action, input, copyTarget } = button.dataset;
            const settings = StateManager.getSettings();

            if (copyTarget) {
                // ... (code is the same)
                const targetElement = document.getElementById(copyTarget);
                if (targetElement) {
                    targetElement.select();
                    navigator.clipboard.writeText(targetElement.value).then(() => {
                        const originalText = button.innerHTML;
                        button.innerHTML = "Copied!";
                        button.classList.add('!bg-btn-control-green');
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.classList.remove('!bg-btn-control-green');
                        }, 2000);
                    }).catch(err => console.error('Clipboard API failed: ', err));
                }
                return;
            }
            
            // --- MODAL/ACTION BUTTONS ---
            if (action === 'open-settings') { UI.openSettingsModal(); return; }
            if (action === 'open-help') { UI.closeSettingsModal(); UI.openHelpModal(); return; }
            if (action === 'open-share') { UI.openShareModal(); return; }
            if (action === 'open-chat') { UI.openChatModal(); return; }
            if (action === 'open-support') { UI.openSupportModal(); return; }

            if (action === 'copy-link') {
                // ... (code is the same)
                navigator.clipboard.writeText(window.location.href).then(() => {
                    button.disabled = true;
                    button.classList.add('!bg-btn-control-green');
                    button.innerHTML = `Copied!`;
                }).catch(err => {
                    button.innerHTML = 'Error';
                });
                return;
            }
            
            if (action === 'native-share') {
                // ... (code is the same)
                if (navigator.share) {
                    navigator.share({
                        title: 'Follow Me App',
                        text: 'Check out this sequence app!',
                        url: window.location.href,
                    }).catch((error) => console.log('Error sharing:', error));
                }
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
            if (action === 'play-demo' && input === settings.currentInput) {
                DemoPlayer.handleCurrentDemo();
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
            input.addEventListener('input', (event) => {
                const transcript = event.target.value;
                if (transcript && transcript.length > 0) {
                    if (event.target.dataset.input === StateManager.getSettings().currentInput) {
                        AppCore.processVoiceTranscript(transcript);
                    }
                    event.target.value = '';
                }
            });
        });
        
        document.querySelectorAll('button[data-action="backspace"]').forEach(btn => {
            // ... (code is the same)
            btn.addEventListener('mousedown', AppCore.handleBackspaceStart);
            btn.addEventListener('mouseup', AppCore.handleBackspaceEnd);
            btn.addEventListener('mouseleave', AppCore.stopSpeedDeleting);
            btn.addEventListener('touchstart', AppCore.handleBackspaceStart, { passive: false });
            btn.addEventListener('touchend', AppCore.handleBackspaceEnd);
        });
        
        // --- Modal: Game Setup (Welcome) Listeners ---
        if (dom.closeGameSetupModalBtn) dom.closeGameSetupModalBtn.addEventListener('click', UI.closeGameSetupModal);
        
        if (dom.dontShowWelcomeToggle) dom.dontShowWelcomeToggle.addEventListener('change', (e) => {
            StateManager.getSettings().showWelcomeScreen = !e.target.checked;
            StateManager.saveState();
        });
        
        if (dom.welcomePresetSelect) {
            dom.welcomePresetSelect.addEventListener('change', (event) => {
                const presetName = event.target.value;
                if (presetName === "__custom__") return;
                
                StateManager.loadSettingsFromPreset(presetName);
                applyAllSettings(); // Visually apply new settings
                
                // Update toggles on welcome screen
                dom.welcomeAutoplayToggle.checked = StateManager.getSettings().isAutoplayEnabled;
                dom.welcomeAudioToggle.checked = StateManager.getSettings().isAudioPlaybackEnabled;
            });
        }
        
        if (dom.welcomeAutoplayToggle) dom.welcomeAutoplayToggle.addEventListener('change', (e) => {
            StateManager.getSettings().isAutoplayEnabled = e.target.checked;
            StateManager.saveState();
            UI.renderPresetsDropdown(dom.welcomePresetSelect); // Mark as custom
        });
        
        if (dom.welcomeAudioToggle) dom.welcomeAudioToggle.addEventListener('change', (e) => {
            StateManager.getSettings().isAudioPlaybackEnabled = e.target.checked;
            StateManager.saveState();
            UI.renderPresetsDropdown(dom.welcomePresetSelect); // Mark as custom
        });

        if (dom.welcomeHelpButton) dom.welcomeHelpButton.addEventListener('click', () => {
            UI.closeGameSetupModal();
            UI.openHelpModal();
        });
        
        if (dom.welcomeFullSetupButton) dom.welcomeFullSetupButton.addEventListener('click', () => {
            UI.closeGameSetupModal();
            // Save quick changes before opening full setup
            StateManager.getSettings().isAutoplayEnabled = dom.welcomeAutoplayToggle.checked;
            StateManager.getSettings().isAudioPlaybackEnabled = dom.welcomeAudioToggle.checked;
            StateManager.saveState();
            UI.openSettingsModal();
        });

        if (dom.globalResizeUpBtn) dom.globalResizeUpBtn.addEventListener('click', () => {
            // ... (code is the same)
            const settings = StateManager.getSettings();
            settings.globalUiScale += 10;
            UI.applyGlobalUiScale(settings.globalUiScale);
            StateManager.saveState();
        });
        if (dom.globalResizeDownBtn) dom.globalResizeDownBtn.addEventListener('click', () => {
            // ... (code is the same)
            const settings = StateManager.getSettings();
            settings.globalUiScale -= 10;
            UI.applyGlobalUiScale(settings.globalUiScale);
            StateManager.saveState();
        });

        // --- Modal: Settings (Full Setup) Listeners ---
        
        // This button now SAVES and closes
        if (dom.closeSettings) dom.closeSettings.addEventListener('click', () => {
            UI.saveSettingsFromModal();
            UI.closeSettingsModal();
        });
        
        // Preset Management
        if (dom.savePresetButton) {
            dom.savePresetButton.addEventListener('click', () => {
                UI.saveSettingsFromModal(); // Save current changes first
                const name = prompt("Enter a name for this preset:", "My Preset");
                if (name) {
                    StateManager.saveCurrentSettingsAsPreset(name);
                    UI.renderPresetsDropdown(dom.presetSelect); 
                    dom.presetSelect.value = name; 
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
        
        // --- Game Setup (in Settings) ---
        // Mark as custom on change
        if (dom.inputSelect) dom.inputSelect.addEventListener('change', () => UI.renderPresetsDropdown(dom.presetSelect));
        if (dom.modeToggle) dom.modeToggle.addEventListener('change', () => {
            UI.updateGameSetupVisibility();
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.machinesSlider) {
            dom.machinesSlider.addEventListener('input', (e) => {
                UI.updateMachinesDisplay(parseInt(e.target.value), dom.machinesDisplay);
                UI.updateGameSetupVisibility();
                UI.renderPresetsDropdown(dom.presetSelect);
            });
        }
        if (dom.sequenceLengthSlider) dom.sequenceLengthSlider.addEventListener('input', (e) => {
            UI.updateSequenceLengthDisplay(parseInt(e.target.value), dom.sequenceLengthDisplay);
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.chunkSlider) dom.chunkSlider.addEventListener('input', (e) => {
            UI.updateChunkDisplay(parseInt(e.target.value), dom.chunkDisplay);
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.delaySlider) dom.delaySlider.addEventListener('input', (e) => {
            UI.updateDelayDisplay(parseInt(e.target.value), dom.delayDisplay);
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.autoclearToggle) dom.autoclearToggle.addEventListener('change', () => UI.renderPresetsDropdown(dom.presetSelect));


        // --- App Controls & Toggles (in Settings) ---
        // Mark as custom on change
        if (dom.playbackSpeedSlider) dom.playbackSpeedSlider.addEventListener('input', (e) => {
            UI.updatePlaybackSpeedDisplay(parseInt(e.target.value), dom.playbackSpeedDisplay);
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.uiScaleSlider) {
            dom.uiScaleSlider.addEventListener('input', (event) => {
                const multiplier = parseInt(event.target.value) / 100;
                UI.updateScaleDisplay(multiplier, dom.uiScaleDisplay);
                StateManager.getSettings().uiScaleMultiplier = multiplier; // Live update
                UI.renderSequences();
                UI.renderPresetsDropdown(dom.presetSelect);
            });
        }
        if (dom.autoplayToggle) dom.autoplayToggle.addEventListener('change', () => UI.renderPresetsDropdown(dom.presetSelect));
        if (dom.darkModeToggle) dom.darkModeToggle.addEventListener('change', (e) => {
            StateManager.getSettings().isDarkMode = e.target.checked; // Live update theme
            UI.updateTheme(e.target.checked);
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.speedDeleteToggle) dom.speedDeleteToggle.addEventListener('change', () => UI.renderPresetsDropdown(dom.presetSelect));
        if (dom.audioPlaybackToggle) dom.audioPlaybackToggle.addEventListener('change', (e) => {
             if (e.target.checked) DemoPlayer.speak("Audio");
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.voiceInputToggle) dom.voiceInputToggle.addEventListener('change', () => {
            StateManager.getSettings().isVoiceInputEnabled = dom.voiceInputToggle.checked; // Live update
            UI.updateVoiceInputVisibility();
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        if (dom.hapticsToggle) dom.hapticsToggle.addEventListener('change', (e) => {
            if (e.target.checked) AppCore.vibrate(50);
            UI.renderPresetsDropdown(dom.presetSelect);
        });
        
        // --- Other Modals ---
        if (dom.closeHelp) dom.closeHelp.addEventListener('click', UI.closeHelpModal);
        if (dom.closeShare) dom.closeShare.addEventListener('click', UI.closeShareModal);
        if (dom.closeChatModal) dom.closeChatModal.addEventListener('click', UI.closeChatModal);
        if (dom.closeSupportModal) dom.closeSupportModal.addEventListener('click', UI.closeSupportModal);
    }

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
