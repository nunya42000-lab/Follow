// app.js
import { db, SHORTCUT_TRIGGERS, SHORTCUT_ACTIONS, VOICE_VALUE_MAP, INPUTS, MODES, AUTO_INPUT_MODES, SHAKE_TIMEOUT_MS, SHAKE_BASE_THRESHOLD, DEFAULT_APP_SETTINGS, PREMADE_PROFILES, DEFAULT_PROFILE_SETTINGS } from './config.js';
import { appSettings, appState, loadState, saveState, getCurrentProfileSettings, getInitialState, setAppSettings, setAppState } from './state.js';
// Removed import of DOM and assignDomElements from './dom.js';
import * as UI from './ui.js';
import * as Game from './game.js';
import * as Camera from './camera.js';
import { speak, showToast } from './utils.js';

// --- DOM OBJECT DEFINITION (MERGED FROM DOM.JS) ---
// Define the DOM object globally within this module scope.
export let DOM = {}; 

export function assignDomElements() {
    DOM.sequenceContainer = document.getElementById('sequence-container');
    DOM.customModal = document.getElementById('custom-modal');
    DOM.modalTitle = document.getElementById('modal-title');
    DOM.modalMessage = document.getElementById('modal-message');
    DOM.modalConfirm = document.getElementById('modal-confirm');
    DOM.modalCancel = document.getElementById('modal-cancel');
    DOM.shareModal = document.getElementById('share-modal');
    DOM.closeShare = document.getElementById('close-share');
    DOM.copyLinkButton = document.getElementById('copy-link-button'); 
    DOM.nativeShareButton = document.getElementById('native-share-button'); 
    DOM.toastNotification = document.getElementById('toast-notification');
    DOM.toastMessage = document.getElementById('toast-message');
    
    DOM.gameSetupModal = document.getElementById('game-setup-modal');
    DOM.closeGameSetupModalBtn = document.getElementById('close-game-setup-modal');
    DOM.dontShowWelcomeToggle = document.getElementById('dont-show-welcome-toggle');
    DOM.globalResizeUpBtn = document.getElementById('global-resize-up');
    DOM.globalResizeDownBtn = document.getElementById('global-resize-down');
    DOM.configSelect = document.getElementById('config-select');
    DOM.configAddBtn = document.getElementById('config-add');
    DOM.configRenameBtn = document.getElementById('config-rename');
    DOM.configDeleteBtn = document.getElementById('config-delete');
    DOM.quickAutoplayToggle = document.getElementById('quick-autoplay-toggle');
    DOM.quickAudioToggle = document.getElementById('quick-audio-toggle');
    DOM.quickOpenHelpBtn = document.getElementById('quick-open-help');
    DOM.quickOpenSettingsBtn = document.getElementById('quick-open-settings');

    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.settingsTabNav = document.getElementById('settings-tab-nav');
    DOM.openGameSetupFromSettings = document.getElementById('open-game-setup-from-settings');
    DOM.openShareButton = document.getElementById('open-share-button');
    DOM.openHelpButton = document.getElementById('open-help-button');
    DOM.openCommentModalBtn = document.getElementById('open-comment-modal'); 
    DOM.closeSettings = document.getElementById('close-settings');
    DOM.activeProfileNameSpan = document.getElementById('active-profile-name');
    
    DOM.helpModal = document.getElementById('help-modal');
    DOM.helpContentContainer = document.getElementById('help-content-container');
    DOM.helpTabNav = document.getElementById('help-tab-nav');
    DOM.closeHelp = document.getElementById('close-help');

    DOM.commentModal = document.getElementById('comment-modal');
    DOM.closeCommentModalBtn = document.getElementById('close-comment-modal');
    DOM.submitCommentBtn = document.getElementById('submit-comment-btn');
    DOM.commentUsername = document.getElementById('comment-username');
    DOM.commentMessage = document.getElementById('comment-message');
    DOM.commentsListContainer = document.getElementById('comments-list-container');
    
    DOM.cameraModal = document.getElementById('camera-modal');
    DOM.closeCameraModalBtn = document.getElementById('close-camera-modal'); 
    DOM.openCameraModalBtn = document.getElementById('open-camera-modal-btn');
    DOM.cameraFeed = document.getElementById('camera-feed');
    DOM.cameraFeedContainer = document.getElementById('camera-feed-container');
    DOM.grid9Key = document.getElementById('grid-9key');     
    DOM.grid12Key = document.getElementById('grid-12key');   
    DOM.detectionCanvas = document.getElementById('detection-canvas');
    DOM.startCameraBtn = document.getElementById('start-camera-btn');
    DOM.startDetectionBtn = document.getElementById('start-detection-btn');
    DOM.stopDetectionBtn = document.getElementById('stop-detection-btn');
    DOM.flashSensitivitySlider = document.getElementById('flash-sensitivity-slider');
    DOM.flashSensitivityDisplay = document.getElementById('flash-sensitivity-display');

    DOM.inputSelect = document.getElementById('input-select');
    DOM.modeToggle = document.getElementById('mode-toggle');
    DOM.modeToggleLabel = document.getElementById('mode-toggle-label');
    DOM.machinesSlider = document.getElementById('machines-slider');
    DOM.machinesDisplay = document.getElementById('machines-display');
    DOM.sequenceLengthSlider = document.getElementById('sequence-length-slider');
    DOM.sequenceLengthDisplay = document.getElementById('sequence-length-display');
    DOM.sequenceLengthLabel = document.getElementById('sequence-length-label');
    DOM.chunkSlider = document.getElementById('chunk-slider');
    DOM.chunkDisplay = document.getElementById('chunk-display');
    DOM.delaySlider = document.getElementById('delay-slider');
    DOM.delayDisplay = document.getElementById('delay-display');
    DOM.settingMultiSequenceGroup = document.getElementById('setting-multi-sequence-group');
    DOM.autoclearToggle = document.getElementById('autoclear-toggle');
    DOM.settingAutoclear = document.getElementById('setting-autoclear');
    
    DOM.playbackSpeedSlider = document.getElementById('playback-speed-slider');
    DOM.playbackSpeedDisplay = document.getElementById('playback-speed-display');
    DOM.showWelcomeToggle = document.getElementById('show-welcome-toggle');
    DOM.darkModeToggle = document.getElementById('dark-mode-toggle');
    DOM.uiScaleSlider = document.getElementById('ui-scale-slider');
    DOM.uiScaleDisplay = document.getElementById('ui-scale-display');
    
    DOM.shortcutListContainer = document.getElementById('shortcut-list-container');
    DOM.addShortcutBtn = document.getElementById('add-shortcut-btn');
    DOM.shakeSensitivitySlider = document.getElementById('shake-sensitivity-slider');
    DOM.shakeSensitivityDisplay = document.getElementById('shake-sensitivity-display');
    
    DOM.autoplayToggle = document.getElementById('autoplay-toggle');
    DOM.speedDeleteToggle = document.getElementById('speed-delete-toggle');
    DOM.audioToggle = document.getElementById('audio-toggle');
    DOM.voiceInputToggle = document.getElementById('voice-input-toggle');
    DOM.hapticsToggle = document.getElementById('haptics-toggle');
    DOM.autoInputSlider = document.getElementById('auto-input-slider'); 

    DOM.padKey9 = document.getElementById('pad-key9');
    DOM.padKey12 = document.getElementById('pad-key12');
    DOM.padPiano = document.getElementById('pad-piano');
    
    DOM.allResetButtons = document.querySelectorAll('.reset-button');
    DOM.allVoiceInputs = document.querySelectorAll('.voice-text-input');
    
    DOM.allCameraMasterBtns = document.querySelectorAll('.camera-master-btn'); 
    DOM.allMicMasterBtns = document.querySelectorAll('.mic-master-btn');       
}
// --- END MERGED CODE ---


// FIX: REMOVED FIREBASE IMPORTS AT THE TOP LEVEL TO PREVENT MODULE HANG
// If you need comments to work, you must manually re-add the Firestore imports at the top
// and remove the stubs below.

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
        try {
            localStorage.removeItem('followMeAppSettings_v7');
            localStorage.removeItem('followMeAppState_v7');
        } catch (e) { } // Ignore if fails

        // --- 2. STANDARD LOAD ---
        loadState(); 
        assignDomElements(); // Calls the merged function above
        
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
        setTimeout(() => {
            const modal = document.getElementById('game-setup-modal');
            if (modal) {
                modal.classList.remove('opacity-0', 'pointer-events-none');
                const inner = modal.querySelector('div');
                if (inner) inner.classList.remove('scale-90');
                if (DOM.gameSetupModal) openGameSetupModal();
            } else {
                alert("Error: Modal element missing from HTML.");
            }
        }, 500);
        
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

    // --- FIREBASE COMMENT STUBS (To prevent execution hang) ---
    async function handleSubmitComment() {
        showToast("Error: Comments service offline.");
    }
    function initializeCommentListener() {
        if (DOM.commentsListContainer) {
             DOM.commentsListContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Comments disabled in current code version.</p>';
        }
    }
    // --- END FIREBASE STUBS ---

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
