// app.js
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db, SHORTCUT_TRIGGERS, SHORTCUT_ACTIONS, VOICE_VALUE_MAP, INPUTS, MODES, AUTO_INPUT_MODES, SHAKE_TIMEOUT_MS, SHAKE_BASE_THRESHOLD, DEFAULT_APP_SETTINGS, PREMADE_PROFILES, DEFAULT_PROFILE_SETTINGS } from './config.js';
import { appSettings, appState, loadState, saveState, getCurrentProfileSettings, getInitialState, setAppSettings, setAppState } from './state.js';
import { DOM, assignDomElements } from './dom.js';
import * as UI from './ui.js';
import * as Game from './game.js';
import * as Camera from './camera.js';
import { speak, showToast } from './utils.js';

// --- GLOBAL ERROR TRAP (For Mobile Debugging) ---
window.onerror = function(msg, url, lineNo, columnNo, error) {
    alert(`System Error:\n${msg}\nLine: ${lineNo}`);
    return false;
};

let lastShakeTime = 0;
let isMicMasterOn = false;
let retryCount = 0; 
let lastTiltTime = 0; 
let touchStartX = 0;
let touchStartY = 0;

// --- MAIN INITIALIZATION ---
(function() {
    'use strict';
    
    async function initApp() {
        // --- 1. NUCLEAR OPTION: CLEAR BAD DATA ---
        // This forces a factory reset every time you reload to prevent corruption freezes.
        try {
            localStorage.removeItem('followMeAppSettings_v7');
            localStorage.removeItem('followMeAppState_v7');
            console.log("Cleaned LocalStorage for fresh start.");
        } catch (e) {
            console.error("Could not clear storage", e);
        }

        // --- 2. STANDARD LOAD ---
        loadState(); 
        assignDomElements();
        
        if (!DOM.sequenceContainer) {
            if (retryCount < 10) {
                retryCount++;
                setTimeout(initApp, 200); 
            } else {
                alert("Critical Error: App failed to find screen elements.");
            }
            return;
        }

        UI.applyGlobalUiScale(appSettings.globalUiScale);
        UI.updateTheme(appSettings.isDarkMode);
        
        initializeListeners();
        UI.updateAllChrome();
        initializeCommentListener(); 

        // --- 3. BRUTE FORCE MODAL OPENER ---
        // This bypasses any "Saved Settings" logic to GUARANTEE the menu opens.
        setTimeout(() => {
            const modal = document.getElementById('game-setup-modal');
            if (modal) {
                // Forcefully strip the hiding classes
                modal.classList.remove('opacity-0', 'pointer-events-none');
                const inner = modal.querySelector('div');
                if (inner) inner.classList.remove('scale-90');
                
                // Force UI sync
                if (DOM.gameSetupModal) openGameSetupModal();
            } else {
                alert("Error: Modal element missing from HTML.");
            }
        }, 500); // 0.5 second delay to ensure render
        
        console.log("App Initialized.");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    function initializeListeners() {
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.camera-master-btn')) {
                Camera.cameraState.isCameraMasterOn = !Camera.cameraState.isCameraMasterOn;
                UI.updateMainUIControlsVisibility(Camera.cameraState.isCameraMasterOn, isMicMasterOn);
                showToast(Camera.cameraState.isCameraMasterOn ? "Camera Input: ON" : "Camera Input: OFF");
            }
            if (e.target.closest('.mic-master-btn')) {
                isMicMasterOn = !isMicMasterOn;
                UI.updateMainUIControlsVisibility(Camera.cameraState.isCameraMasterOn, isMicMasterOn);
                showToast(isMicMasterOn ? "Mic Input: ON" : "Mic Input: OFF");
            }
        });

        document.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const { value, action, input, copyTarget } = button.dataset;

            if (button.classList.contains('camera-master-btn') || button.classList.contains('mic-master-btn')) return;
            
            if (copyTarget) {
                const targetElement = document.getElementById(copyTarget);
                if (targetElement) {
                    targetElement.select();
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(targetElement.value).then(() => {
                            const originalText = button.innerHTML;
                            button.innerHTML = "Copied!";
                            button.classList.add('!bg-btn-control-green');
                            setTimeout(() => {
                                button.innerHTML = originalText;
                                button.classList.remove('!bg-btn-control-green');
                            }, 2000);
                        });
                    }
                }
                return;
            }

            if (action === 'open-settings') { openSettingsModal(); return; }
            if (action === 'open-help') { 
                UI.closeModal(); 
                switchHelpTab('general'); 
                openHelpModal(); 
                return; 
            }
            if (action === 'open-share') { openShareModal(); return; }
            if (action === 'open-comments') { UI.closeModal(); openCommentModal(); return; }
            if (action === 'open-camera') { UI.closeModal(); openCameraModal(); return; } 
            if (action === 'copy-link') {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    button.disabled = true;
                    button.classList.add('!bg-btn-control-green');
                    button.innerHTML = `Copied!`;
                    setTimeout(() => {
                         button.disabled = false; 
                         button.classList.remove('!bg-btn-control-green'); 
                         button.innerHTML = 'Copy Link';
                    }, 2000);
                });
                return;
            }
            if (action === 'native-share') {
                if (navigator.share) {
                    navigator.share({ title: 'Follow Me App', text: 'Check out this sequence app!', url: window.location.href, });
                }
                return;
            }
            if (action === 'restore-defaults') {
                UI.showModal('Restore Defaults?', 'This will reset all settings. Are you sure?', handleRestoreDefaults, 'Restore', 'Cancel');
                return;
            }
            if (action === 'reset-unique-rounds') {
                UI.showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', Game.resetUniqueRoundsMode, 'Reset', 'Cancel');
                return;
            }
            
            const currentInput = getCurrentProfileSettings().currentInput;
            if (input && input !== currentInput) return;

            if (action === 'play-demo') {
                Game.handleCurrentDemo();
                return;
            }
            if (value) {
                Game.addValue(value);
            }
        });

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: false });

        if (DOM.allVoiceInputs) {
            DOM.allVoiceInputs.forEach(input => {
                input.addEventListener('input', (event) => {
                    const transcript = event.target.value;
                    if (transcript && transcript.length > 0) {
                        if (event.target.dataset.input === getCurrentProfileSettings().currentInput) {
                            processVoiceTranscript(transcript);
                        }
                        event.target.value = '';
                    }
                });
            });
        }

        document.querySelectorAll('button[data-action="backspace"]').forEach(btn => {
            btn.addEventListener('mousedown', Game.handleBackspaceStart);
            btn.addEventListener('mouseup', Game.handleBackspaceEnd);
            btn.addEventListener('mouseleave', Game.stopSpeedDeleting);
            btn.addEventListener('touchstart', Game.handleBackspaceStart, { passive: false });
            btn.addEventListener('touchend', Game.handleBackspaceEnd);
        });

        if (DOM.closeGameSetupModalBtn) {
            DOM.closeGameSetupModalBtn.addEventListener('click', () => {
                closeGameSetupModal();
                requestSensorPermissions();
                if (getCurrentProfileSettings().isAudioEnabled) speak(" "); 
            });
        }
        if (DOM.dontShowWelcomeToggle) DOM.dontShowWelcomeToggle.addEventListener('change', (e) => {
            appSettings.showWelcomeScreen = !e.target.checked;
            if(DOM.showWelcomeToggle) DOM.showWelcomeToggle.checked = appSettings.showWelcomeScreen;
            saveState();
        });
        if (DOM.configSelect) DOM.configSelect.addEventListener('change', (e) => switchActiveProfile(e.target.value));
        if (DOM.configAddBtn) DOM.configAddBtn.addEventListener('click', handleConfigAdd);
        if (DOM.configRenameBtn) DOM.configRenameBtn.addEventListener('click', handleConfigRename);
        if (DOM.configDeleteBtn) DOM.configDeleteBtn.addEventListener('click', handleConfigDelete);
        
        if (DOM.quickOpenHelpBtn) DOM.quickOpenHelpBtn.addEventListener('click', () => { 
            closeGameSetupModal(); 
            switchHelpTab('general');
            openHelpModal(); 
        });
        if (DOM.quickOpenSettingsBtn) DOM.quickOpenSettingsBtn.addEventListener('click', () => { closeGameSetupModal(); openSettingsModal(); });
        
        if (DOM.globalResizeUpBtn) DOM.globalResizeUpBtn.addEventListener('click', () => { UI.applyGlobalUiScale(appSettings.globalUiScale + 10); saveState(); });
        if (DOM.globalResizeDownBtn) DOM.globalResizeDownBtn.addEventListener('click', () => { UI.applyGlobalUiScale(appSettings.globalUiScale - 10); saveState(); });

        if (DOM.closeSettings) DOM.closeSettings.addEventListener('click', closeSettingsModal);
        if (DOM.settingsTabNav) DOM.settingsTabNav.addEventListener('click', handleSettingsTabClick);
        if (DOM.openGameSetupFromSettings) DOM.openGameSetupFromSettings.addEventListener('click', () => { closeSettingsModal(); openGameSetupModal(); });

        setupProfileSettingsListeners();

        if (DOM.closeHelp) DOM.closeHelp.addEventListener('click', closeHelpModal);
        if (DOM.closeShare) DOM.closeShare.addEventListener('click', closeShareModal); 
        if (DOM.closeCommentModalBtn) DOM.closeCommentModalBtn.addEventListener('click', closeCommentModal);
        if (DOM.submitCommentBtn) DOM.submitCommentBtn.addEventListener('click', handleSubmitComment);
        
        if (DOM.closeCameraModalBtn) DOM.closeCameraModalBtn.addEventListener('click', closeCameraModal);
        if (DOM.startCameraBtn) DOM.startCameraBtn.addEventListener('click', Camera.startCameraStream);
        if (DOM.startDetectionBtn) DOM.startDetectionBtn.addEventListener('click', Camera.startDetection); 
        if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.addEventListener('click', Camera.stopDetection); 
        if (DOM.flashSensitivitySlider) DOM.flashSensitivitySlider.addEventListener('input', (e) => {
             const profileSettings = getCurrentProfileSettings();
             if(profileSettings) profileSettings.flashSensitivity = parseInt(e.target.value);
             UI.updateFlashSensitivityDisplay(e.target.value);
        });
        
        initGridDragger(DOM.grid9Key);
        initGridDragger(DOM.grid12Key);
        initSensorListeners();
        if (!appSettings.showWelcomeScreen) {
             document.body.addEventListener('click', requestSensorPermissions, { once: true });
        }
    }

    function setupProfileSettingsListeners() {
        const addProfileSettingListener = (element, eventType, settingKey, valueType = 'value') => {
            if (element) {
                element.addEventListener(eventType, (e) => {
                    const profileSettings = getCurrentProfileSettings();
                    if (!profileSettings) return;
                    let value = e.target[valueType];
                    if (valueType === 'checked') value = e.target.checked;
                    if (element.type === 'range') value = parseInt(value);
                    
                    profileSettings[settingKey] = value;
                    
                    if (element === DOM.machinesSlider) UI.updateMachinesDisplay(value);
                    if (element === DOM.sequenceLengthSlider) UI.updateSequenceLengthDisplay(value);
                    if (element === DOM.chunkSlider) UI.updateChunkDisplay(value);
                    if (element === DOM.delaySlider) UI.updateDelayDisplay(value);
                    if (element === DOM.modeToggle) profileSettings.currentMode = value ? MODES.UNIQUE_ROUNDS : MODES.SIMON;
                    if (element === DOM.uiScaleSlider) {
                        value = value / 100.0;
                        profileSettings[settingKey] = value;
                        UI.updateScaleDisplay(value);
                        UI.renderSequences();
                    }
                    if (element === DOM.shakeSensitivitySlider) UI.updateShakeSensitivityDisplay(value);
                    if (element === DOM.autoInputSlider) { 
                        profileSettings.autoInputMode = String(value);
                        UI.updateMainUIControlsVisibility(Camera.cameraState.isCameraMasterOn, isMicMasterOn);
                    }
                    updateSettingsModalVisibility();
                });
            }
        };
        
        addProfileSettingListener(DOM.inputSelect, 'change', 'currentInput');
        addProfileSettingListener(DOM.modeToggle, 'change', 'currentMode', 'checked');
        addProfileSettingListener(DOM.machinesSlider, 'input', 'machineCount');
        addProfileSettingListener(DOM.sequenceLengthSlider, 'input', 'sequenceLength');
        addProfileSettingListener(DOM.chunkSlider, 'input', 'simonChunkSize');
        addProfileSettingListener(DOM.delaySlider, 'input', 'simonInterSequenceDelay');
        addProfileSettingListener(DOM.autoclearToggle, 'change', 'isUniqueRoundsAutoClearEnabled', 'checked');
        
        if (DOM.playbackSpeedSlider) DOM.playbackSpeedSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            appSettings.playbackSpeed = val / 100.0;
            UI.updatePlaybackSpeedDisplay(val);
        });
        if (DOM.showWelcomeToggle) DOM.showWelcomeToggle.addEventListener('change', (e) => {
            appSettings.showWelcomeScreen = e.target.checked;
            if(DOM.dontShowWelcomeToggle) DOM.dontShowWelcomeToggle.checked = !appSettings.showWelcomeScreen;
        });
        if (DOM.darkModeToggle) DOM.darkModeToggle.addEventListener('change', (e) => UI.updateTheme(e.target.checked));
        addProfileSettingListener(DOM.uiScaleSlider, 'input', 'uiScaleMultiplier'); 
        
        if (DOM.addShortcutBtn) DOM.addShortcutBtn.addEventListener('click', handleAddShortcut);
        if (DOM.shortcutListContainer) DOM.shortcutListContainer.addEventListener('change', handleShortcutListClick);
        if (DOM.shortcutListContainer) DOM.shortcutListContainer.addEventListener('click', handleShortcutListClick);
        addProfileSettingListener(DOM.shakeSensitivitySlider, 'input', 'shakeSensitivity');
        
        addProfileSettingListener(DOM.autoplayToggle, 'change', 'isAutoplayEnabled', 'checked');
        addProfileSettingListener(DOM.speedDeleteToggle, 'change', 'isSpeedDeletingEnabled', 'checked');
        addProfileSettingListener(DOM.audioToggle, 'change', 'isAudioEnabled', 'checked');
        addProfileSettingListener(DOM.voiceInputToggle, 'change', 'isVoiceInputEnabled', 'checked');
        addProfileSettingListener(DOM.hapticsToggle, 'change', 'isHapticsEnabled', 'checked');
        addProfileSettingListener(DOM.autoInputSlider, 'input', 'autoInputMode'); 
    }

    function updateSettingsModalVisibility() {
        if (!DOM.settingsModal) return;
        const profileSettings = getCurrentProfileSettings();
        const mode = profileSettings.currentMode;
        const machineCount = profileSettings.machineCount;

        if (mode === MODES.SIMON) {
            DOM.sequenceLengthLabel.textContent = '4. Sequence Length';
            DOM.modeToggleLabel.textContent = 'Off: Simon Says';
        } else {
            DOM.sequenceLengthLabel.textContent = '4. Unique Rounds';
            DOM.modeToggleLabel.textContent = 'On: Unique Rounds';
        }
        DOM.machinesSlider.disabled = (mode === MODES.UNIQUE_ROUNDS);
        if (mode === MODES.UNIQUE_ROUNDS) {
             DOM.machinesSlider.value = 1;
             UI.updateMachinesDisplay(1);
        }
        DOM.settingAutoclear.style.display = (mode === MODES.UNIQUE_ROUNDS) ? 'flex' : 'none';
        const showSimonSettings = (mode === MODES.SIMON && machineCount > 1);
        DOM.settingMultiSequenceGroup.style.display = showSimonSettings ? 'block' : 'none';
    }

    function handleConfigAdd() {
        const newName = prompt("Enter new configuration name:", "My New Setup");
        if (!newName) return;
        const newId = `profile_${Date.now()}`;
        appSettings.profiles[newId] = { name: newName, settings: { ...DEFAULT_PROFILE_SETTINGS, shortcuts: [] } };
        appState[newId] = getInitialState();
        appSettings.activeProfileId = newId;
        UI.populateConfigDropdown();
        UI.updateAllChrome();
        saveState();
    }
    function handleConfigRename() {
        const currentProfile = appSettings.profiles[appSettings.activeProfileId];
        if (!currentProfile) return;
        const newName = prompt("Enter new name:", currentProfile.name);
        if (!newName) return;
        currentProfile.name = newName;
        UI.populateConfigDropdown();
        saveState();
    }
    function handleConfigDelete() {
        const profileCount = Object.keys(appSettings.profiles).length;
        if (profileCount <= 1) {
            UI.showModal("Cannot Delete", "You must have at least one configuration.", () => UI.closeModal(), "OK", "");
            return;
        }
        const currentProfile = appSettings.profiles[appSettings.activeProfileId];
        UI.showModal(`Delete "${currentProfile.name}"?`, "Cannot be undone.", () => {
            delete appSettings.profiles[appSettings.activeProfileId];
            delete appState[appSettings.activeProfileId];
            appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
            UI.populateConfigDropdown();
            UI.updateAllChrome();
            saveState();
        }, "Delete", "Cancel");
    }
    function switchActiveProfile(newProfileId) {
        if (!appSettings.profiles[newProfileId]) return;
        appSettings.activeProfileId = newProfileId;
        UI.updateAllChrome();
        saveState();
    }
    function handleRestoreDefaults() {
        const defaults = { ...DEFAULT_APP_SETTINGS };
        defaults.profiles = {}; 
        Object.keys(PREMADE_PROFILES).forEach(id => {
            defaults.profiles[id] = { name: PREMADE_PROFILES[id].name, settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] } };
        });
        const newState = {};
        Object.keys(defaults.profiles).forEach(pid => newState[pid] = getInitialState());
        setAppSettings(defaults);
        setAppState(newState);
        saveState();
        UI.applyGlobalUiScale(appSettings.globalUiScale);
        UI.updateTheme(appSettings.isDarkMode);
        UI.updateAllChrome();
        closeSettingsModal(); 
        setTimeout(openGameSetupModal, 10);
    }

    function openGameSetupModal() {
        if (!DOM.gameSetupModal) return;
        UI.populateConfigDropdown();
        const profileSettings = getCurrentProfileSettings();
        DOM.quickAutoplayToggle.checked = profileSettings.isAutoplayEnabled;
        DOM.quickAudioToggle.checked = profileSettings.isAudioEnabled;
        DOM.dontShowWelcomeToggle.checked = !appSettings.showWelcomeScreen;
        DOM.gameSetupModal.classList.remove('opacity-0', 'pointer-events-none');
        DOM.gameSetupModal.querySelector('div').classList.remove('scale-90');
    }
    function closeGameSetupModal() {
        if (!DOM.gameSetupModal) return;
        const profileSettings = getCurrentProfileSettings();
        profileSettings.isAutoplayEnabled = DOM.quickAutoplayToggle.checked;
        profileSettings.isAudioEnabled = DOM.quickAudioToggle.checked;
        appSettings.showWelcomeScreen = !DOM.dontShowWelcomeToggle.checked;
        if (DOM.showWelcomeToggle) DOM.showWelcomeToggle.checked = appSettings.showWelcomeScreen;
        saveState(); 
        if (DOM.autoplayToggle) DOM.autoplayToggle.checked = profileSettings.isAutoplayEnabled;
        if (DOM.audioToggle) DOM.audioToggle.checked = profileSettings.isAudioEnabled;
        DOM.gameSetupModal.querySelector('div').classList.add('scale-90');
        DOM.gameSetupModal.classList.add('opacity-0');
        setTimeout(() => DOM.gameSetupModal.classList.add('pointer-events-none'), 300);
    }
    function openSettingsModal() {
        const profileSettings = getCurrentProfileSettings();
        if (DOM.activeProfileNameSpan) DOM.activeProfileNameSpan.textContent = appSettings.profiles[appSettings.activeProfileId].name;
        
        DOM.inputSelect.value = profileSettings.currentInput;
        DOM.modeToggle.checked = (profileSettings.currentMode === MODES.UNIQUE_ROUNDS);
        DOM.machinesSlider.value = profileSettings.machineCount;
        UI.updateMachinesDisplay(profileSettings.machineCount);
        DOM.sequenceLengthSlider.value = profileSettings.sequenceLength;
        UI.updateSequenceLengthDisplay(profileSettings.sequenceLength);
        DOM.chunkSlider.value = profileSettings.simonChunkSize;
        UI.updateChunkDisplay(profileSettings.simonChunkSize);
        DOM.delaySlider.value = profileSettings.simonInterSequenceDelay;
        UI.updateDelayDisplay(profileSettings.simonInterSequenceDelay);
        DOM.autoclearToggle.checked = profileSettings.isUniqueRoundsAutoClearEnabled;
        
        DOM.playbackSpeedSlider.value = appSettings.playbackSpeed * 100;
        UI.updatePlaybackSpeedDisplay(appSettings.playbackSpeed * 100);
        DOM.showWelcomeToggle.checked = appSettings.showWelcomeScreen;
        DOM.darkModeToggle.checked = appSettings.isDarkMode;
        DOM.uiScaleSlider.value = profileSettings.uiScaleMultiplier * 100; 
        UI.updateScaleDisplay(profileSettings.uiScaleMultiplier);
        
        DOM.shakeSensitivitySlider.value = profileSettings.shakeSensitivity;
        UI.updateShakeSensitivityDisplay(profileSettings.shakeSensitivity);
        renderShortcutList();

        DOM.speedDeleteToggle.checked = profileSettings.isSpeedDeletingEnabled; 
        DOM.autoplayToggle.checked = profileSettings.isAutoplayEnabled;
        DOM.audioToggle.checked = profileSettings.isAudioEnabled; 
        DOM.voiceInputToggle.checked = profileSettings.isVoiceInputEnabled;
        DOM.hapticsToggle.checked = profileSettings.isHapticsEnabled;
        DOM.autoInputSlider.value = profileSettings.autoInputMode; 
        
        updateSettingsModalVisibility();
        switchSettingsTab('profile');
        
        DOM.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
        DOM.settingsModal.querySelector('div').classList.remove('scale-90');
    }
    function closeSettingsModal() {
        saveState();
        if (DOM.quickAutoplayToggle) DOM.quickAutoplayToggle.checked = getCurrentProfileSettings().isAutoplayEnabled;
        if (DOM.quickAudioToggle) DOM.quickAudioToggle.checked = getCurrentProfileSettings().isAudioEnabled;
        UI.updateAllChrome();
        DOM.settingsModal.querySelector('div').classList.add('scale-90');
        DOM.settingsModal.classList.add('opacity-0');
        setTimeout(() => DOM.settingsModal.classList.add('pointer-events-none'), 300);
    }
    function switchSettingsTab(tabId) {
        if (DOM.settingsModal) DOM.settingsModal.querySelectorAll('.settings-tab-content').forEach(tab => tab.classList.add('hidden'));
        if (DOM.settingsTabNav) DOM.settingsTabNav.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active-tab'));
        const content = document.getElementById(`settings-tab-${tabId}`);
        if (content) content.classList.remove('hidden');
        if (DOM.settingsTabNav) {
            const button = DOM.settingsTabNav.querySelector(`button[data-tab="${tabId}"]`);
            if (button) button.classList.add('active-tab');
        }
    }
    function handleSettingsTabClick(event) {
        const button = event.target.closest('button[data-tab]');
        if (button) switchSettingsTab(button.dataset.tab);
    }

    function renderShortcutList() {
        if (!DOM.shortcutListContainer) return;
        const profileSettings = getCurrentProfileSettings();
        DOM.shortcutListContainer.innerHTML = ''; 
        profileSettings.shortcuts.forEach(shortcut => {
            const row = document.createElement('div');
            row.className = 'shortcut-row';
            row.dataset.id = shortcut.id;
            const triggerSelect = document.createElement('select');
            triggerSelect.className = 'select-input shortcut-trigger'; 
            for (const key in SHORTCUT_TRIGGERS) triggerSelect.options.add(new Option(SHORTCUT_TRIGGERS[key], key));
            triggerSelect.value = shortcut.trigger;
            const actionSelect = document.createElement('select');
            actionSelect.className = 'select-input shortcut-action';
            for (const key in SHORTCUT_ACTIONS) actionSelect.options.add(new Option(SHORTCUT_ACTIONS[key], key));
            actionSelect.value = shortcut.action;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'shortcut-delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = 'Delete Shortcut';
            row.appendChild(triggerSelect);
            row.appendChild(actionSelect);
            row.appendChild(deleteBtn);
            DOM.shortcutListContainer.appendChild(row);
        });
    }
    function handleAddShortcut() {
        const profileSettings = getCurrentProfileSettings();
        const newShortcut = { id: `sc_${Date.now()}`, trigger: 'none', action: 'none' };
        profileSettings.shortcuts.push(newShortcut);
        renderShortcutList();
    }
    function handleShortcutListClick(event) {
        const profileSettings = getCurrentProfileSettings();
        const target = event.target;
        if (target.closest('.shortcut-delete-btn')) {
            const row = target.closest('.shortcut-row');
            profileSettings.shortcuts = profileSettings.shortcuts.filter(sc => sc.id !== row.dataset.id);
            renderShortcutList();
        }
        else if (target.matches('.shortcut-trigger')) {
            const shortcut = profileSettings.shortcuts.find(sc => sc.id === target.closest('.shortcut-row').dataset.id);
            shortcut.trigger = target.value;
        }
        else if (target.matches('.shortcut-action')) {
            const shortcut = profileSettings.shortcuts.find(sc => sc.id === target.closest('.shortcut-row').dataset.id);
            shortcut.action = target.value;
        }
    }

    function handleShake(event) {
        const now = Date.now();
        if (now - lastShakeTime < SHAKE_TIMEOUT_MS) return; 
        const profileSettings = getCurrentProfileSettings();
        if (!profileSettings) return;
        const sensitivity = profileSettings.shakeSensitivity;
        const threshold = SHAKE_BASE_THRESHOLD - (sensitivity * 1.2); 
        const accel = event.accelerationIncludingGravity;
        if (accel && (Math.abs(accel.x) > threshold || Math.abs(accel.y) > threshold)) {
            lastShakeTime = now;
            Game.executeShortcut('shake');
        }
    }
    
    function handleTilt(event) {
        const now = Date.now();
        if (now - lastTiltTime < 500) return; 
        const gamma = event.gamma; 

        if (gamma > 30) {
            if(Game.executeShortcut('tilt_right')) lastTiltTime = now;
        } else if (gamma < -30) {
            if(Game.executeShortcut('tilt_left')) lastTiltTime = now;
        }
    }

    function initSensorListeners() {
        if ('DeviceMotionEvent' in window) {
             if (typeof DeviceMotionEvent.requestPermission !== 'function') {
                 window.addEventListener('devicemotion', handleShake);
             }
        }
        if ('DeviceOrientationEvent' in window) {
             if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
                 window.addEventListener('deviceorientation', handleTilt);
             }
        }
    }

    function requestSensorPermissions() {
         if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(permissionState => {
                if (permissionState === 'granted') window.addEventListener('devicemotion', handleShake);
            }).catch(console.error);
        }
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(permissionState => {
                if (permissionState === 'granted') window.addEventListener('deviceorientation', handleTilt);
            }).catch(console.error);
        }
    }

    function handleSwipe(sx, sy, ex, ey) {
        const dx = ex - sx;
        const dy = ey - sy;
        const minSwipeDistance = 50; 

        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > minSwipeDistance) {
                if (dx > 0) Game.executeShortcut('swipe_right');
                else Game.executeShortcut('swipe_left');
            }
        } else {
            if (Math.abs(dy) > minSwipeDistance) {
                if (dy > 0) Game.executeShortcut('swipe_down');
                else Game.executeShortcut('swipe_up');
            }
        }
    }

    function processVoiceTranscript(transcript) {
        if (!transcript) return;
        const cleanTranscript = transcript.toLowerCase().replace(/[\.,]/g, '').trim();
        const words = cleanTranscript.split(' ');
        const profileSettings = getCurrentProfileSettings();
        const currentInput = profileSettings.currentInput;
        for (const word of words) {
            let value = VOICE_VALUE_MAP[word];
            if (!value) {
                 const upperWord = word.toUpperCase();
                 if (/^[1-9]$/.test(word) || /^(1[0-2])$/.test(word)) { value = word; } 
                 else if (/^[A-G]$/.test(upperWord) || /^[1-5]$/.test(word)) { value = upperWord; }
            }
            if (value) {
                if (currentInput === INPUTS.KEY9 && /^[1-9]$/.test(value)) Game.addValue(value);
                else if (currentInput === INPUTS.KEY12 && /^(?:[1-9]|1[0-2])$/.test(value)) Game.addValue(value);
                else if (currentInput === INPUTS.PIANO && (/^[1-5]$/.test(value) || /^[A-G]$/.test(value))) Game.addValue(value);
            }
        }
    }

    async function handleSubmitComment() {
        const username = DOM.commentUsername.value;
        const message = DOM.commentMessage.value;
        if (!username || !message) {
            UI.showModal("Missing Info", "Please enter both a name and a message.", () => UI.closeModal(), "OK", "");
            return;
        }
        try {
            await addDoc(collection(db, "comments"), { username: username, message: message, timestamp: serverTimestamp() });
            DOM.commentMessage.value = ""; 
            showToast("Feedback sent!");
        } catch (error) {
            console.error("Error adding document: ", error);
            UI.showModal("Error", "Could not send your comment.", () => UI.closeModal(), "OK", "");
        }
    }
    function initializeCommentListener() {
        if (!DOM.commentsListContainer) return;
        const commentsQuery = query(collection(db, "comments"), orderBy("timestamp", "desc"), limit(50));
        onSnapshot(commentsQuery, (querySnapshot) => {
            if (querySnapshot.empty) {
                DOM.commentsListContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No feedback yet.</p>';
                return;
            }
            DOM.commentsListContainer.innerHTML = ""; 
            querySnapshot.forEach((doc) => {
                const comment = doc.data();
                const commentEl = document.createElement('div');
                commentEl.className = "p-3 mb-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm";
                commentEl.innerHTML = `<p class="font-bold text-primary-app">${comment.username}</p><p class="text-gray-900 dark:text-white">${comment.message}</p>`;
                DOM.commentsListContainer.appendChild(commentEl);
            });
        });
    }

    function openHelpModal() {
        const profileSettings = getCurrentProfileSettings();
        if (DOM.helpTabNav) DOM.helpTabNav.addEventListener('click', (e) => {
             const button = e.target.closest('button[data-tab]');
             if (button) switchHelpTab(button.dataset.tab);
        });
        DOM.helpModal.classList.remove('opacity-0', 'pointer-events-none');
        DOM.helpModal.querySelector('div').classList.remove('scale-90');
    }
    function closeHelpModal() {
        DOM.helpModal.querySelector('div').classList.add('scale-90');
        DOM.helpModal.classList.add('opacity-0');
        setTimeout(() => DOM.helpModal.classList.add('pointer-events-none'), 300);
    }
    function switchHelpTab(tabId) {
        DOM.helpContentContainer.querySelectorAll('.help-tab-content').forEach(tab => tab.classList.add('hidden'));
        DOM.helpTabNav.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active-tab'));
        const content = document.getElementById(`help-tab-${tabId}`);
        if (content) content.classList.remove('hidden');
        const button = DOM.helpTabNav.querySelector(`button[data-tab="${tabId}"]`);
        if (button) button.classList.add('active-tab');
    }
    function openShareModal() {
        closeSettingsModal();
        if (navigator.share) DOM.nativeShareButton.classList.remove('hidden');
        else DOM.nativeShareButton.classList.add('hidden');
        DOM.shareModal.classList.remove('opacity-0', 'pointer-events-none');
        DOM.shareModal.querySelector('div').classList.remove('scale-90');
    }
    function closeShareModal() {
        DOM.shareModal.querySelector('div').classList.add('scale-90');
        DOM.shareModal.classList.add('opacity-0');
        setTimeout(() => DOM.shareModal.classList.add('pointer-events-none'), 300);
    }
    function openCommentModal() {
        DOM.commentModal.classList.remove('opacity-0', 'pointer-events-none');
        DOM.commentModal.querySelector('div').classList.remove('scale-90');
    }
    function closeCommentModal() {
        DOM.commentModal.querySelector('div').classList.add('scale-90');
        DOM.commentModal.classList.add('opacity-0');
        setTimeout(() => DOM.commentModal.classList.add('pointer-events-none'), 300);
    }
    function openCameraModal() {
        const profileSettings = getCurrentProfileSettings();
        if (profileSettings.currentInput === INPUTS.KEY12) {
            Camera.cameraState.activeCalibrationGrid = DOM.grid12Key;
            const config = profileSettings.cameraGridConfig12;
            DOM.grid9Key.style.display = 'none';
            DOM.grid12Key.style.display = 'grid';
            DOM.grid12Key.style.top = config.top; DOM.grid12Key.style.left = config.left; DOM.grid12Key.style.width = config.width; DOM.grid12Key.style.height = config.height;
        } else { 
            Camera.cameraState.activeCalibrationGrid = DOM.grid9Key;
            const config = profileSettings.cameraGridConfig9;
            DOM.grid12Key.style.display = 'none';
            DOM.grid9Key.style.display = 'grid';
            DOM.grid9Key.style.top = config.top; DOM.grid9Key.style.left = config.left; DOM.grid9Key.style.width = config.width; DOM.grid9Key.style.height = config.height;
        }
        DOM.flashSensitivitySlider.value = profileSettings.flashSensitivity;
        UI.updateFlashSensitivityDisplay(profileSettings.flashSensitivity);
        if (Camera.cameraState.stream) {
             DOM.startCameraBtn.style.display = 'none'; DOM.startDetectionBtn.style.display = 'block'; DOM.stopDetectionBtn.style.display = 'none';
        } else {
             DOM.startCameraBtn.style.display = 'block'; DOM.startDetectionBtn.style.display = 'none'; DOM.stopDetectionBtn.style.display = 'none';
        }
        Camera.cameraState.isDetecting = false; 
        DOM.cameraModal.classList.remove('opacity-0', 'pointer-events-none');
        DOM.cameraModal.querySelector('div').classList.remove('scale-90');
    }
    function closeCameraModal() {
        Camera.stopDetection(); 
        Camera.stopCameraStream();
        DOM.cameraModal.querySelector('div').classList.add('scale-90');
        DOM.cameraModal.classList.add('opacity-0');
        setTimeout(() => DOM.cameraModal.classList.add('pointer-events-none'), 300);
    }

    function initGridDragger(gridElement) {
        if (!gridElement) return;
        let startX, startY, startLeft, startTop;
        const dragStart = (e) => {
            e.preventDefault(); 
            Camera.cameraState.isDraggingGrid = true;
            Camera.cameraState.activeCalibrationGrid = gridElement; 
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            startLeft = gridElement.offsetLeft;
            startTop = gridElement.offsetTop;
            window.addEventListener('mousemove', dragMove);
            window.addEventListener('mouseup', dragEnd);
            window.addEventListener('touchmove', dragMove, { passive: false });
            window.addEventListener('touchend', dragEnd);
        };
        const dragMove = (e) => {
            if (!Camera.cameraState.isDraggingGrid) return;
            e.preventDefault();
            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;
            const parentRect = DOM.cameraFeedContainer.getBoundingClientRect();
            const newLeft = startLeft + dx;
            const newTop = startTop + dy;
            gridElement.style.left = `${(newLeft / parentRect.width) * 100}%`;
            gridElement.style.top = `${(newTop / parentRect.height) * 100}%`;
        };
        const dragEnd = (e) => {
            if (!Camera.cameraState.isDraggingGrid) return;
            Camera.cameraState.isDraggingGrid = false;
            window.removeEventListener('mousemove', dragMove);
            window.removeEventListener('mouseup', dragEnd);
            window.removeEventListener('touchmove', dragMove);
            window.removeEventListener('touchend', dragEnd);
            Camera.saveGridConfig(); 
        };
        gridElement.addEventListener('mousedown', dragStart);
        gridElement.addEventListener('touchstart', dragStart, { passive: false });
        
        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries || !entries.length) return;
            const entry = entries[0];
            if (entry.contentRect.width < 10 || entry.contentRect.height < 10) return; 
            if (!Camera.cameraState.isDraggingGrid) {
                Camera.cameraState.activeCalibrationGrid = gridElement;
                Camera.saveGridConfig();
            }
        });
        resizeObserver.observe(gridElement);
    }

})();
