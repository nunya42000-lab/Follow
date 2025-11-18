// ==========================================
// app.js - PART 1 of 3
// ==========================================

// --- 0. FIREBASE SDK IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    onSnapshot, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- YOUR FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4",
  authDomain: "follow-me-app-de3e9.firebaseapp.com",
  projectId: "follow-me-app-de3e9",
  storageBucket: "follow-me-app-de3e9.firebasestorage.app",
  messagingSenderId: "957006680126",
  appId: "1:957006680126:web:6d679717d9277fd9ae816f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 

// --- 1. CONFIG & STATE ---
(function() {
    'use strict';

    const MAX_MACHINES = 4;
    const DEMO_DELAY_BASE_MS = 798;
    const SPEED_DELETE_INITIAL_DELAY = 250;
    const SPEED_DELETE_INTERVAL_MS = 10;    
    const SHAKE_BASE_THRESHOLD = 25; 
    const SHAKE_TIMEOUT_MS = 500; 
    const FLASH_COOLDOWN_MS = 250; 

    const SETTINGS_KEY = 'followMeAppSettings_v7'; 
    const STATE_KEY = 'followMeAppState_v7';

    const INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
    const MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };
    const AUTO_INPUT_MODES = { OFF: '0', TONE: '1', PATTERN: '2' }; 

    const SHORTCUT_TRIGGERS = {
        'none': 'Select Trigger...',
        'shake': 'Shake Device (Experimental)',
        'longpress_backspace': 'Long Press Backspace',
        'longpress_play': 'Long Press Play',
        'longpress_settings': 'Long Press Settings',
        'tilt_left': 'Tilt Left (Experimental)',
        'tilt_right': 'Tilt Right (Experimental)',
        'swipe_up': 'Swipe Up (Screen)',
        'swipe_down': 'Swipe Down (Screen)',
        'swipe_left': 'Swipe Left (Screen)',
        'swipe_right': 'Swipe Right (Screen)'
    };
    const SHORTCUT_ACTIONS = {
        'none': 'Select Action...',
        'play_demo': 'Play Demo',
        'reset_rounds': 'Reset Rounds (Confirm)',
        'clear_all': 'Clear All (Confirm)',
        'clear_last': 'Clear Last (Backspace)',
        'toggle_autoplay': 'Toggle Autoplay',
        'toggle_audio': 'Toggle Audio',
        'toggle_haptics': 'Toggle Haptics',
        'toggle_dark_mode': 'Toggle Dark Mode',
        'open_settings': 'Open/Close Settings',
        'open_help': 'Open/Close Help',
        'next_profile': 'Switch to Next Profile',
        'prev_profile': 'Switch to Previous Profile'
    };

    const PIANO_SPEAK_MAP = {
        'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B',
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
    };
    const VOICE_VALUE_MAP = {
        'one': '1', 'two': '2', 'to': '2', 'three': '3', 'four': '4', 'for': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
        'eleven': '11', 'twelve': '12',
        'see': 'C', 'dee': 'D', 'e': 'E', 'eff': 'F', 'gee': 'G', 'eh': 'A', 'be': 'B',
        'c': 'C', 'd': 'D', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'
    };

    const DEFAULT_PROFILE_SETTINGS = {
        currentInput: INPUTS.KEY9,
        currentMode: MODES.SIMON,
        sequenceLength: 20,
        simonChunkSize: 3,
        simonInterSequenceDelay: 500,
        isAutoplayEnabled: true, 
        isUniqueRoundsAutoClearEnabled: true,
        isAudioEnabled: true,
        isVoiceInputEnabled: true,
        isHapticsEnabled: true,
        isSpeedDeletingEnabled: true, 
        uiScaleMultiplier: 1.0, 
        machineCount: 1,
        shortcuts: [], 
        shakeSensitivity: 10,
        autoInputMode: AUTO_INPUT_MODES.OFF,
        flashSensitivity: 50, 
        cameraGridConfig9: { top: '25%', left: '25%', width: '50%', height: '50%' },
        cameraGridConfig12: { top: '25%', left: '20%', width: '60%', height: '40%' }
    };
    
    const DEFAULT_APP_SETTINGS = {
        globalUiScale: 100,
        isDarkMode: true,
        showWelcomeScreen: true,
        isConfirmationsEnabled: true,
        activeProfileId: 'profile_1',
        profiles: {},
        playbackSpeed: 1.0,
    };
    
    const PREMADE_PROFILES = {
        'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS } },
        'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 200 }},
        'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }},
        'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: INPUTS.PIANO }},
        'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: MODES.UNIQUE_ROUNDS, sequenceLength: 15 }}
    };

    // --- STATE VARIABLES ---
    let appSettings = { ...DEFAULT_APP_SETTINGS };
    let appState = {}; 
    let initialDelayTimer = null; 
    let speedDeleteInterval = null; 
    let isHoldingBackspace = false;
    let lastShakeTime = 0; 
    let toastTimer = null; 
    
    let cameraStream = null;
    let isDetecting = false;
    let detectionLoopId = null;
    let lastFlashTime = Array(12).fill(0);
    let lastBrightness = Array(12).fill(0); 
    let isDraggingGrid = false;
    let isCameraMasterOn = false; 
    let isMicMasterOn = false;    

    // --- DOM ELEMENTS ---
    var sequenceContainer;
    var customModal, modalTitle, modalMessage, modalConfirm, modalCancel;
    var shareModal, closeShare, copyLinkButton, nativeShareButton;
    var toastNotification, toastMessage; 
    var gameSetupModal, closeGameSetupModalBtn, dontShowWelcomeToggle;
    var configSelect, configAddBtn, configRenameBtn, configDeleteBtn;
    var quickAutoplayToggle, quickAudioToggle, quickOpenHelpBtn, quickOpenSettingsBtn;
    var globalResizeUpBtn, globalResizeDownBtn;
    var settingsModal, settingsTabNav, openHelpButton, openShareButton, closeSettings, openGameSetupFromSettings;
    var activeProfileNameSpan, openCommentModalBtn; 
    var helpModal, helpContentContainer, helpTabNav, closeHelp;
    var commentModal, closeCommentModalBtn, submitCommentBtn, commentUsername, commentMessage, commentsListContainer;
    var cameraModal, closeCameraModalBtn, openCameraModalBtn, cameraFeed, cameraFeedContainer;
    var grid9Key, grid12Key, activeCalibrationGrid, detectionCanvas, detectionContext; 
    var startCameraBtn, startDetectionBtn, stopDetectionBtn, flashSensitivitySlider, flashSensitivityDisplay;
    var inputSelect, modeToggle, modeToggleLabel, machinesSlider, machinesDisplay;
    var sequenceLengthSlider, sequenceLengthDisplay, sequenceLengthLabel;
    var chunkSlider, chunkDisplay, delaySlider, delayDisplay, settingMultiSequenceGroup, autoclearToggle, settingAutoclear;
    var playbackSpeedSlider, playbackSpeedDisplay, showWelcomeToggle, darkModeToggle, showConfirmationsToggle, uiScaleSlider, uiScaleDisplay;
    var shortcutListContainer, addShortcutBtn, shakeSensitivitySlider, shakeSensitivityDisplay;
    var autoplayToggle, speedDeleteToggle, audioToggle, voiceInputToggle, hapticsToggle, autoInputSlider; 
    var padKey9, padKey12, padPiano, allVoiceInputs, allResetButtons, allCameraMasterBtns, allMicMasterBtns;    

    const getCurrentProfileSettings = () => appSettings.profiles[appSettings.activeProfileId]?.settings;
    const getCurrentState = () => appState[appSettings.activeProfileId];

    function saveState() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
            localStorage.setItem(STATE_KEY, JSON.stringify(appState));
        } catch (error) {
            console.error("Failed to save state:", error);
        }
    }

    function loadState() {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            const storedState = localStorage.getItem(STATE_KEY);

            if (storedSettings) {
                const loadedSettings = JSON.parse(storedSettings);
                appSettings = { ...DEFAULT_APP_SETTINGS, ...loadedSettings };
                
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
                    appSettings.profiles[id] = { name: PREMADE_PROFILES[id].name, settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] } };
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
                appSettings.profiles[id] = { name: PREMADE_PROFILES[id].name, settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] } };
            });
            appState = {};
            Object.keys(appSettings.profiles).forEach(profileId => {
                appState[profileId] = getInitialState();
            });
        }
    }

    function getInitialState() {
        return { sequences: Array.from({ length: MAX_MACHINES }, () => []), nextSequenceIndex: 0, currentRound: 1 };
    }
// --- END OF PART 1 ---
// --- 3. UI RENDERING & INTERACTION ---

function renderSequences() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    if (!state || !profileSettings || !sequenceContainer) return; 
    
    const { machineCount, currentMode } = profileSettings;
    const { sequences } = state;
    
    const activeSequences = (currentMode === MODES.UNIQUE_ROUNDS) 
        ? [state.sequences[0]] 
        : sequences.slice(0, machineCount);
    
    sequenceContainer.innerHTML = '';
    
    const currentTurnIndex = state.nextSequenceIndex % machineCount;

    let layoutClasses = 'gap-4 flex-grow mb-6 transition-all duration-300 pt-1 ';
    let numColumns = 5;

    if (currentMode === MODES.SIMON) {
        if (machineCount === 1) {
            layoutClasses += ' flex flex-col max-w-xl mx-auto';
            numColumns = 5;
        } else if (machineCount === 2) {
            layoutClasses += ' grid grid-cols-2 max-w-3xl mx-auto';
            numColumns = 4;
        } else if (machineCount === 3) {
            layoutClasses += ' grid grid-cols-3 max-w-4xl mx-auto';
            numColumns = 4;
        } else if (machineCount === 4) {
            layoutClasses += ' grid grid-cols-4 max-w-5xl mx-auto';
            numColumns = 3;
        }
    } else {
         layoutClasses += ' flex flex-col max-w-2xl mx-auto';
         numColumns = 5;
    }
    sequenceContainer.className = layoutClasses;

    if (currentMode === MODES.UNIQUE_ROUNDS) {
        const roundDisplay = document.createElement('div');
        roundDisplay.className = 'text-center text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100';
        roundDisplay.id = 'unique-rounds-round-display';
        roundDisplay.textContent = `Round: ${state.currentRound} / ${profileSettings.sequenceLength}`;
        sequenceContainer.appendChild(roundDisplay);
    }
    
    let gridClass = numColumns > 0 ? `grid grid-cols-${numColumns}` : 'flex flex-wrap';
    
    const baseSize = 40;
    const baseFont = 1.1;
    const newSize = baseSize * profileSettings.uiScaleMultiplier;
    const newFont = baseFont * profileSettings.uiScaleMultiplier;
    const sizeStyle = `height: ${newSize}px; line-height: ${newSize}px; font-size: ${newFont}rem;`;

    activeSequences.forEach((set, index) => {
        const isCurrent = (currentTurnIndex === index && machineCount > 1 && currentMode === MODES.SIMON);
        const sequenceDiv = document.createElement('div');
        
        const originalClasses = `p-4 rounded-xl shadow-md transition-all duration-200 ${isCurrent ? 'bg-accent-app scale-[1.02] shadow-lg text-gray-900' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'}`;
        sequenceDiv.className = originalClasses;
        sequenceDiv.dataset.originalClasses = originalClasses;
        
        sequenceDiv.innerHTML = `
            <div class="${gridClass} gap-2 min-h-[50px]"> 
                ${set.map(val => `
                    <span class="number-box bg-secondary-app text-white rounded-xl text-center shadow-sm"
                          style="${sizeStyle}">
                        ${val}
                    </span>
                `).join('')}
            </div>
        `;
        sequenceContainer.appendChild(sequenceDiv);
    });
}

function populateConfigDropdown() {
    if (!configSelect) return;
    configSelect.innerHTML = '';
    Object.keys(appSettings.profiles).forEach(profileId => {
        const option = document.createElement('option');
        option.value = profileId;
        option.textContent = appSettings.profiles[profileId].name;
        configSelect.appendChild(option);
    });
    configSelect.value = appSettings.activeProfileId;
}

function switchActiveProfile(newProfileId) {
    if (!appSettings.profiles[newProfileId]) return;
    appSettings.activeProfileId = newProfileId;
    updateAllChrome();
    saveState();
}

function handleConfigAdd() {
    const newName = prompt("Enter new configuration name:", "My New Setup");
    if (!newName) return;
    const newId = `profile_${Date.now()}`;
    appSettings.profiles[newId] = { name: newName, settings: { ...DEFAULT_PROFILE_SETTINGS, shortcuts: [] } };
    appState[newId] = getInitialState();
    appSettings.activeProfileId = newId;
    populateConfigDropdown(); updateAllChrome(); saveState();
}

function handleConfigRename() {
    const currentProfile = appSettings.profiles[appSettings.activeProfileId];
    const newName = prompt("Enter new name:", currentProfile.name);
    if (!newName) return;
    currentProfile.name = newName; populateConfigDropdown(); saveState();
}

function handleConfigDelete() {
    if (Object.keys(appSettings.profiles).length <= 1) {
        showModal("Cannot Delete", "You must have at least one configuration.", () => closeModal(), "OK", "", false);
        return;
    }
    showModal(`Delete "${appSettings.profiles[appSettings.activeProfileId].name}"?`, "This cannot be undone.", () => {
        const profileIdToDelete = appSettings.activeProfileId;
        delete appSettings.profiles[profileIdToDelete];
        delete appState[profileIdToDelete];
        appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
        populateConfigDropdown(); updateAllChrome(); saveState();
    }, "Delete", "Cancel", true);
}

function openGameSetupModal() {
    if (!gameSetupModal) return;
    populateConfigDropdown();
    const profileSettings = getCurrentProfileSettings();
    quickAutoplayToggle.checked = profileSettings.isAutoplayEnabled;
    quickAudioToggle.checked = profileSettings.isAudioEnabled;
    dontShowWelcomeToggle.checked = !appSettings.showWelcomeScreen;
    gameSetupModal.classList.remove('opacity-0', 'pointer-events-none');
    gameSetupModal.querySelector('div').classList.remove('scale-90');
}

function closeGameSetupModal() {
    if (!gameSetupModal) return;
    const profileSettings = getCurrentProfileSettings();
    profileSettings.isAutoplayEnabled = quickAutoplayToggle.checked;
    profileSettings.isAudioEnabled = quickAudioToggle.checked;
    appSettings.showWelcomeScreen = !dontShowWelcomeToggle.checked;
    if (showWelcomeToggle) showWelcomeToggle.checked = appSettings.showWelcomeScreen;
    saveState(); 
    if (autoplayToggle) autoplayToggle.checked = profileSettings.isAutoplayEnabled;
    if (audioToggle) audioToggle.checked = profileSettings.isAudioEnabled;
    gameSetupModal.querySelector('div').classList.add('scale-90');
    gameSetupModal.classList.add('opacity-0');
    setTimeout(() => gameSetupModal.classList.add('pointer-events-none'), 300);
}

function updateSettingsModalVisibility() {
    if (!settingsModal) return;
    const profileSettings = getCurrentProfileSettings();
    const mode = profileSettings.currentMode;
    const machineCount = profileSettings.machineCount;

    if (mode === MODES.SIMON) {
        sequenceLengthLabel.textContent = '4. Sequence Length';
        modeToggleLabel.textContent = 'Off: Simon Says';
    } else {
        sequenceLengthLabel.textContent = '4. Unique Rounds';
        modeToggleLabel.textContent = 'On: Unique Rounds';
    }
    machinesSlider.disabled = (mode === MODES.UNIQUE_ROUNDS);
    if (mode === MODES.UNIQUE_ROUNDS) {
         machinesSlider.value = 1;
         updateMachinesDisplay(1, machinesDisplay);
    }
    settingAutoclear.style.display = (mode === MODES.UNIQUE_ROUNDS) ? 'flex' : 'none';
    const showSimonSettings = (mode === MODES.SIMON && machineCount > 1);
    settingMultiSequenceGroup.style.display = showSimonSettings ? 'block' : 'none';
}

function updateMainUIControlsVisibility() {
    const profileSettings = getCurrentProfileSettings();
    
    // Toggle reset button
    allResetButtons.forEach(btn => {
        btn.style.display = (profileSettings.currentMode === MODES.UNIQUE_ROUNDS) ? 'block' : 'none';
    });
    
    // Toggle Auto-Input master switch buttons
    const mode = profileSettings.autoInputMode;
    allCameraMasterBtns.forEach(btn => btn.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.PATTERN));
    allMicMasterBtns.forEach(btn => btn.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.TONE));
    
    // Update master switch "active" state
    updateMasterButtonStates();
}

function updateMasterButtonStates() {
    allCameraMasterBtns.forEach(btn => btn.classList.toggle('master-active', isCameraMasterOn));
    allMicMasterBtns.forEach(btn => btn.classList.toggle('master-active', isMicMasterOn));
}

function openSettingsModal() {
    const profileSettings = getCurrentProfileSettings();
    if (activeProfileNameSpan) activeProfileNameSpan.textContent = appSettings.profiles[appSettings.activeProfileId].name;
    
    // --- Tab 1: Profile ---
    inputSelect.value = profileSettings.currentInput;
    modeToggle.checked = (profileSettings.currentMode === MODES.UNIQUE_ROUNDS);
    machinesSlider.value = profileSettings.machineCount;
    updateMachinesDisplay(profileSettings.machineCount, machinesDisplay);
    sequenceLengthSlider.value = profileSettings.sequenceLength;
    updateSequenceLengthDisplay(profileSettings.sequenceLength, sequenceLengthDisplay);
    chunkSlider.value = profileSettings.simonChunkSize;
    updateChunkDisplay(profileSettings.simonChunkSize, chunkDisplay);
    delaySlider.value = profileSettings.simonInterSequenceDelay;
    updateDelayDisplay(profileSettings.simonInterSequenceDelay, delayDisplay);
    autoclearToggle.checked = profileSettings.isUniqueRoundsAutoClearEnabled;
    
    // --- Tab 2: Global ---
    playbackSpeedSlider.value = appSettings.playbackSpeed * 100;
    updatePlaybackSpeedDisplay(appSettings.playbackSpeed * 100, playbackSpeedDisplay);
    showWelcomeToggle.checked = appSettings.showWelcomeScreen;
    darkModeToggle.checked = appSettings.isDarkMode;
    showConfirmationsToggle.checked = appSettings.isConfirmationsEnabled;
    uiScaleSlider.value = profileSettings.uiScaleMultiplier * 100; 
    updateScaleDisplay(profileSettings.uiScaleMultiplier, uiScaleDisplay);
    
    // --- Tab 3: Shortcuts ---
    shakeSensitivitySlider.value = profileSettings.shakeSensitivity;
    updateShakeSensitivityDisplay(profileSettings.shakeSensitivity);
    renderShortcutList();

    // --- Tab 4: Stealth ---
    speedDeleteToggle.checked = profileSettings.isSpeedDeletingEnabled; 
    autoplayToggle.checked = profileSettings.isAutoplayEnabled;
    audioToggle.checked = profileSettings.isAudioEnabled; 
    voiceInputToggle.checked = profileSettings.isVoiceInputEnabled;
    hapticsToggle.checked = profileSettings.isHapticsEnabled;
    autoInputSlider.value = profileSettings.autoInputMode; 
    
    updateSettingsModalVisibility();
    switchSettingsTab('profile');
    
    settingsModal.classList.remove('opacity-0', 'pointer-events-none');
    settingsModal.querySelector('div').classList.remove('scale-90');
}

function saveSettingsModal() {
    saveState();
    if (quickAutoplayToggle) quickAutoplayToggle.checked = getCurrentProfileSettings().isAutoplayEnabled;
    if (quickAudioToggle) quickAudioToggle.checked = getCurrentProfileSettings().isAudioEnabled;
    updateAllChrome();
}

function closeSettingsModal() {
    saveSettingsModal(); 
    settingsModal.querySelector('div').classList.add('scale-90');
    settingsModal.classList.add('opacity-0');
    setTimeout(() => settingsModal.classList.add('pointer-events-none'), 300);
}

function switchSettingsTab(tabId) {
    if (settingsModal) {
        settingsModal.querySelectorAll('.settings-tab-content').forEach(tab => tab.classList.add('hidden'));
    }
    if (settingsTabNav) {
        settingsTabNav.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active-tab'));
    }
    const content = document.getElementById(`settings-tab-${tabId}`);
    if (content) content.classList.remove('hidden');
    if (settingsTabNav) {
        const button = settingsTabNav.querySelector(`button[data-tab="${tabId}"]`);
        if (button) button.classList.add('active-tab');
    }
}

function openHelpModal() {
    generateGeneralHelp();
    generateModesHelp();
    generatePromptsHelp();
    if (helpTabNav) {
        helpTabNav.addEventListener('click', handleHelpTabClick);
    }
    switchHelpTab('general');
    helpModal.classList.remove('opacity-0', 'pointer-events-none');
    helpModal.querySelector('div').classList.remove('scale-90');
}

function closeHelpModal() {
    if (helpTabNav) {
        helpTabNav.removeEventListener('click', handleHelpTabClick);
    }
    const promptTab = helpTabNav.querySelector('button[data-tab="prompts"]');
    if (promptTab && promptTab.classList.contains('active-tab')) {
        const profileSettings = getCurrentProfileSettings();
        const mode = profileSettings.currentMode;
        const targetId = (mode === MODES.SIMON) ? 'prompt-simon' : 'prompt-unique-rounds';
        const promptText = document.getElementById(targetId);
        if (promptText && navigator.clipboard) {
            navigator.clipboard.writeText(promptText.value).catch(err => console.warn('Auto-copy failed', err));
        }
    }
    helpModal.querySelector('div').classList.add('scale-90');
    helpModal.classList.add('opacity-0');
    setTimeout(() => helpModal.classList.add('pointer-events-none'), 300);
}

function openCommentModal() {
    commentModal.classList.remove('opacity-0', 'pointer-events-none');
    commentModal.querySelector('div').classList.remove('scale-90');
}

function closeCommentModal() {
    commentModal.querySelector('div').classList.add('scale-90');
    commentModal.classList.add('opacity-0');
    setTimeout(() => commentModal.classList.add('pointer-events-none'), 300);
}

function showModal(title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel', isConfirmation = true) {
    // --- CONFIRMATION CHECK ---
    if (isConfirmation && !appSettings.isConfirmationsEnabled) {
        onConfirm();
        return;
    }
    
    if (!customModal) return;
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    const newConfirmBtn = modalConfirm.cloneNode(true); 
    newConfirmBtn.textContent = confirmText;
    modalConfirm.parentNode.replaceChild(newConfirmBtn, modalConfirm); 
    modalConfirm = newConfirmBtn; 
    const newCancelBtn = modalCancel.cloneNode(true);
    newCancelBtn.textContent = cancelText;
    modalCancel.parentNode.replaceChild(newCancelBtn, modalCancel);
    modalCancel = newCancelBtn; 
    modalConfirm.addEventListener('click', () => { onConfirm(); closeModal(); }); 
    modalCancel.addEventListener('click', closeModal); 
    modalCancel.style.display = cancelText ? 'inline-block' : 'none';
    modalConfirm.className = (confirmText === 'Restore' || confirmText === 'Reset' || confirmText === 'Delete' || confirmText === 'Clear All') ? 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-btn-control-red hover:bg-btn-control-red-active' : 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-primary-app hover:bg-secondary-app';
    customModal.classList.remove('opacity-0', 'pointer-events-none');
    customModal.querySelector('div').classList.remove('scale-90');
}

function closeModal() {
    if (customModal) {
        customModal.querySelector('div').classList.add('scale-90');
        customModal.classList.add('opacity-0');
        setTimeout(() => customModal.classList.add('pointer-events-none'), 300);
    }
}

// --- 4. CORE GAME LOGIC ---

function vibrate(duration = 10) {
    const profileSettings = getCurrentProfileSettings();
    if (profileSettings.isHapticsEnabled && 'vibrate' in navigator) {
        try { navigator.vibrate(duration); } catch (e) { console.warn("Haptic failed", e); }
    }
}

function addValue(value) {
    vibrate();
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    const mode = profileSettings.currentMode;
    let targetIndex;

    if (mode === MODES.UNIQUE_ROUNDS) {
        if (state.sequences[0].length >= state.currentRound) return; 
        targetIndex = 0;
    } else {
        targetIndex = state.nextSequenceIndex % profileSettings.machineCount;
        if (state.sequences[targetIndex] && state.sequences[targetIndex].length >= profileSettings.sequenceLength) return;
    }

    state.sequences[targetIndex].push(value);
    state.nextSequenceIndex++;
    renderSequences();
    
    if (profileSettings.isAutoplayEnabled) {
        if (mode === MODES.UNIQUE_ROUNDS) {
            const sequence = state.sequences[0];
            if (sequence.length === state.currentRound) {
                const allKeys = document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`);
                allKeys.forEach(key => key.disabled = true);
                setTimeout(handleUniqueRoundsDemo, 100); 
            }
        }
        else if (mode === MODES.SIMON) {
            const justFilledIndex = (state.nextSequenceIndex - 1) % profileSettings.machineCount;
             if (justFilledIndex === profileSettings.machineCount - 1) {
                 setTimeout(handleSimonDemo, 100);
            }
        }
    }
    saveState();
}

function handleBackspace() {
    vibrate(20);
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    if (state.nextSequenceIndex === 0) return; 
    
    let lastClickTargetIndex;
    if (profileSettings.currentMode === MODES.UNIQUE_ROUNDS) {
        lastClickTargetIndex = 0;
    } else {
        lastClickTargetIndex = (state.nextSequenceIndex - 1) % profileSettings.machineCount;
    }
    
    const targetSet = state.sequences[lastClickTargetIndex];
    
    if (targetSet.length > 0) {
        targetSet.pop();
        state.nextSequenceIndex--; 
        if (profileSettings.currentMode === MODES.UNIQUE_ROUNDS) {
             const allKeys = document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`);
             allKeys.forEach(key => key.disabled = false);
        }
        renderSequences();
        saveState();
    }
}

function stopSpeedDeleting() {
    if (initialDelayTimer) clearTimeout(initialDelayTimer);
    if (speedDeleteInterval) clearInterval(speedDeleteInterval);
    initialDelayTimer = null;
    speedDeleteInterval = null;
    isHoldingBackspace = false;
}

function handleBackspaceStart(event) {
    event.preventDefault(); 
    stopSpeedDeleting(); 
    isHoldingBackspace = false; 

    const profileSettings = getCurrentProfileSettings();
    const demoButton = document.querySelector(`#pad-${profileSettings.currentInput} button[data-action="play-demo"]`);
    if (demoButton && demoButton.disabled) return;

    initialDelayTimer = setTimeout(() => {
        isHoldingBackspace = true;
        if (executeShortcut('longpress_backspace')) {
            stopSpeedDeleting();
            return;
        }
        if (profileSettings.isSpeedDeletingEnabled && profileSettings.currentMode !== MODES.UNIQUE_ROUNDS) {
            handleBackspace();
            speedDeleteInterval = setInterval(handleBackspace, SPEED_DELETE_INTERVAL_MS);
        }
        initialDelayTimer = null; 
    }, SPEED_DELETE_INITIAL_DELAY);
}

function handleBackspaceEnd() {
    const wasHolding = isHoldingBackspace;
    const profileSettings = getCurrentProfileSettings();
    if (initialDelayTimer !== null) {
        stopSpeedDeleting();
        handleBackspace(); 
        return;
    }
    stopSpeedDeleting();
    if (wasHolding && profileSettings.currentMode === MODES.UNIQUE_ROUNDS && !executeShortcut('longpress_backspace')) {
        showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel', true);
    }
}

function resetUniqueRoundsMode() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    state.currentRound = 1;
    state.sequences = Array.from({ length: MAX_MACHINES }, () => []);
    state.nextSequenceIndex = 0;
    const allKeys = document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`);
    if (allKeys) allKeys.forEach(key => key.disabled = false);
    renderSequences();
    saveState();
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
            if (currentInput === INPUTS.KEY9 && /^[1-9]$/.test(value)) addValue(value);
            else if (currentInput === INPUTS.KEY12 && /^(?:[1-9]|1[0-2])$/.test(value)) addValue(value);
            else if (currentInput === INPUTS.PIANO && (/^[1-5]$/.test(value) || /^[A-G]$/.test(value))) addValue(value);
        }
    }
}

function handleRestoreDefaults() {
    showModal('Restore Defaults?', 'Reset all settings? This cannot be undone.', () => {
        appSettings = { ...DEFAULT_APP_SETTINGS };
        appSettings.profiles = {}; 
        Object.keys(PREMADE_PROFILES).forEach(id => {
            appSettings.profiles[id] = { name: PREMADE_PROFILES[id].name, settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] } };
        });
        appState = {};
        Object.keys(appSettings.profiles).forEach(profileId => {
            appState[profileId] = getInitialState();
        });
        saveState();
        applyGlobalUiScale(appSettings.globalUiScale);
        updateTheme(appSettings.isDarkMode);
        updateAllChrome();
        closeSettingsModal(); 
        setTimeout(openGameSetupModal, 10);
    }, 'Restore', 'Cancel', true);
}
// --- 5. DEMO & AUDIO ---

function speak(text) {
    const profileSettings = getCurrentProfileSettings();
    if (profileSettings && profileSettings.isAudioEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); 
        u.lang = 'en-US'; 
        u.rate = 1.2; 
        window.speechSynthesis.speak(u);
    }
}

const getSpeedMultiplier = () => appSettings.playbackSpeed;

function handleSimonDemo() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    const input = profileSettings.currentInput;
    const padSelector = `#pad-${input}`;
    const flashClass = input === 'piano' ? 'flash' : (input === 'key9' ? 'key9-flash' : 'key12-flash');
    const demoButton = document.querySelector(`${padSelector} button[data-action="play-demo"]`);
    const inputKeys = document.querySelectorAll(`${padSelector} button[data-value]`);
    const speedMultiplier = getSpeedMultiplier();
    const currentDelayMs = DEMO_DELAY_BASE_MS / speedMultiplier;
    const numMachines = profileSettings.machineCount;
    const activeSequences = state.sequences.slice(0, numMachines);
    const maxLength = Math.max(...activeSequences.map(s => s.length));
    
    if (maxLength === 0 || (demoButton && demoButton.disabled)) {
        if (demoButton && demoButton.disabled) return;
        if (!profileSettings.isAutoplayEnabled) {
            showModal('No Sequence', 'The sequences are empty.', () => closeModal(), 'OK', '', false);
        }
        return;
    }
    
    const playlist = [];
    const chunkSize = (numMachines > 1) ? profileSettings.simonChunkSize : maxLength;
    const numChunks = Math.ceil(maxLength / chunkSize);
    for (let chunkNum = 0; chunkNum < numChunks; chunkNum++) {
        for (let seqIndex = 0; seqIndex < numMachines; seqIndex++) {
            for (let k = 0; k < chunkSize; k++) {
                const valueIndex = (chunkNum * chunkSize) + k;
                if (valueIndex < activeSequences[seqIndex].length) {
                    playlist.push({ seqIndex: seqIndex, value: activeSequences[seqIndex][valueIndex] });
                }
            }
        }
    }
    
    if (playlist.length === 0) return;
    if (demoButton) demoButton.disabled = true;
    if (inputKeys) inputKeys.forEach(key => key.disabled = true);
    let i = 0;
    const flashDuration = 250 * (speedMultiplier > 1 ? (1/speedMultiplier) : 1); 

    function playNextItem() {
        if (i < playlist.length) {
            const item = playlist[i];
            const seqBox = sequenceContainer.children[item.seqIndex];
            const key = document.querySelector(`${padSelector} button[data-value="${item.value}"]`);
            
            if (demoButton) demoButton.innerHTML = String(i + 1);
            speak(input === 'piano' ? PIANO_SPEAK_MAP[item.value] || item.value : item.value);
            if (key) { 
                if(input === 'piano') key.classList.add('flash'); else key.classList.add(flashClass); 
            }
            if (seqBox && numMachines > 1) seqBox.className = 'p-4 rounded-xl shadow-md transition-all duration-200 bg-accent-app scale-[1.02] shadow-lg text-gray-900';
            
            const nextSeqIndex = (i + 1 < playlist.length) ? playlist[i + 1].seqIndex : -1;
            let timeBetweenItems = currentDelayMs - flashDuration;
            if (numMachines > 1 && nextSeqIndex !== -1 && item.seqIndex !== nextSeqIndex) {
                timeBetweenItems += profileSettings.simonInterSequenceDelay;
            }
            setTimeout(() => {
                if (key) { if(input === 'piano') key.classList.remove('flash'); else key.classList.remove(flashClass); }
                if (seqBox && numMachines > 1) seqBox.className = seqBox.dataset.originalClasses || seqBox.className;
                setTimeout(playNextItem, timeBetweenItems); 
            }, flashDuration);
            i++;
        } else {
            if (demoButton) { demoButton.disabled = false; demoButton.innerHTML = '▶'; }
            if (inputKeys) inputKeys.forEach(key => key.disabled = false);
            renderSequences();
        }
    }
    playNextItem();
}

function handleUniqueRoundsDemo() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    const input = profileSettings.currentInput;
    const padSelector = `#pad-${input}`;
    const flashClass = input === 'piano' ? 'flash' : (input === 'key9' ? 'key9-flash' : 'key12-flash');
    const sequenceToPlay = state.sequences[0]; 
    const demoButton = document.querySelector(`${padSelector} button[data-action="play-demo"]`);
    const allKeys = document.querySelectorAll(`${padSelector} button[data-value]`);
    const speedMultiplier = getSpeedMultiplier();
    const currentDelayMs = DEMO_DELAY_BASE_MS / speedMultiplier;
    
    if (!demoButton) return;
    if (sequenceToPlay.length === 0 || (demoButton.disabled && !profileSettings.isUniqueRoundsAutoClearEnabled) ) {
        if (demoButton.disabled && !profileSettings.isUniqueRoundsAutoClearEnabled) return;
        showModal('No Sequence', 'Empty sequence.', () => closeModal(), 'OK', '', false);
        if (allKeys) allKeys.forEach(key => key.disabled = false);
        return;
    }
    demoButton.disabled = true;
    if (allKeys) allKeys.forEach(key => key.disabled = true);
    let i = 0;
    const flashDuration = 250 * (speedMultiplier > 1 ? (1/speedMultiplier) : 1); 

    function playNextNumber() {
        if (i < sequenceToPlay.length) {
            const value = sequenceToPlay[i]; 
            let key = document.querySelector(`${padSelector} button[data-value="${value}"]`);
            demoButton.innerHTML = String(i + 1); 
            speak(input === 'piano' ? PIANO_SPEAK_MAP[value] || value : value); 
            if (key) {
                if(input === 'piano') key.classList.add('flash'); else key.classList.add(flashClass);
                setTimeout(() => {
                    if(input === 'piano') key.classList.remove('flash'); else key.classList.remove(flashClass);
                    setTimeout(playNextNumber, currentDelayMs - flashDuration);
                }, flashDuration); 
            } else {
                setTimeout(playNextNumber, currentDelayMs);
            }
            i++;
        } else {
            demoButton.disabled = false;
            demoButton.innerHTML = '▶'; 
            if (profileSettings.currentMode === MODES.UNIQUE_ROUNDS && profileSettings.isUniqueRoundsAutoClearEnabled) {
                setTimeout(clearUniqueRoundsSequence, 300); 
            } else {
                if (allKeys) allKeys.forEach(key => key.disabled = false);
            }
        }
    }
    playNextNumber();
}

function clearUniqueRoundsSequence() {
    const state = getCurrentState();
    const sequence = state.sequences[0];
    if (sequence.length === 0) {
        advanceToUniqueRound();
        return;
    }
    let speedDeleteInterval = setInterval(() => {
        if (sequence.length > 0) {
            sequence.pop();
            state.nextSequenceIndex--;
            renderSequences();
        } else {
            clearInterval(speedDeleteInterval);
            saveState(); 
            advanceToUniqueRound(); 
        }
    }, 10);
}

function advanceToUniqueRound() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    state.currentRound++;
    if (state.currentRound > profileSettings.sequenceLength) {
        state.currentRound = 1;
        showModal('Complete!', `Finished all rounds.`, () => closeModal(), 'OK', '', false);
    }
    renderSequences();
    saveState();
    document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`).forEach(key => key.disabled = false);
}

function handleCurrentDemo() {
    (getCurrentProfileSettings().currentMode === MODES.SIMON) ? handleSimonDemo() : handleUniqueRoundsDemo();
}

// --- 6. SHORTCUT COMMAND CENTER ---

function renderShortcutList() {
    if (!shortcutListContainer) return;
    const profileSettings = getCurrentProfileSettings();
    shortcutListContainer.innerHTML = ''; 
    
    profileSettings.shortcuts.forEach(shortcut => {
        const row = document.createElement('div');
        row.className = 'shortcut-row';
        row.dataset.id = shortcut.id;
        
        const triggerSelect = document.createElement('select');
        triggerSelect.className = 'select-input shortcut-trigger'; 
        for (const key in SHORTCUT_TRIGGERS) {
            triggerSelect.options.add(new Option(SHORTCUT_TRIGGERS[key], key));
        }
        triggerSelect.value = shortcut.trigger;
        
        const actionSelect = document.createElement('select');
        actionSelect.className = 'select-input shortcut-action';
        for (const key in SHORTCUT_ACTIONS) {
            actionSelect.options.add(new Option(SHORTCUT_ACTIONS[key], key));
        }
        actionSelect.value = shortcut.action;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'shortcut-delete-btn';
        deleteBtn.innerHTML = '&times;';
        
        row.appendChild(triggerSelect);
        row.appendChild(actionSelect);
        row.appendChild(deleteBtn);
        shortcutListContainer.appendChild(row);
    });
}

function handleAddShortcut() {
    const profileSettings = getCurrentProfileSettings();
    profileSettings.shortcuts.push({ id: `sc_${Date.now()}`, trigger: 'none', action: 'none' });
    renderShortcutList();
}

function handleShortcutListClick(event) {
    const profileSettings = getCurrentProfileSettings();
    const target = event.target;
    
    if (target.closest('.shortcut-delete-btn')) {
        const id = target.closest('.shortcut-row').dataset.id;
        profileSettings.shortcuts = profileSettings.shortcuts.filter(sc => sc.id !== id);
        renderShortcutList();
    } else if (target.matches('.shortcut-trigger')) {
        const id = target.closest('.shortcut-row').dataset.id;
        profileSettings.shortcuts.find(sc => sc.id === id).trigger = target.value;
    } else if (target.matches('.shortcut-action')) {
        const id = target.closest('.shortcut-row').dataset.id;
        profileSettings.shortcuts.find(sc => sc.id === id).action = target.value;
    }
}

function cycleProfile(direction) {
    const ids = Object.keys(appSettings.profiles);
    let idx = ids.indexOf(appSettings.activeProfileId) + direction;
    if (idx < 0) idx = ids.length - 1; else if (idx >= ids.length) idx = 0;
    switchActiveProfile(ids[idx]); 
    showToast(`Profile: ${appSettings.profiles[ids[idx]].name}`);
}

function executeShortcut(triggerKey) {
    const settings = getCurrentProfileSettings();
    if (!settings || !settings.shortcuts) return false;
    
    const shortcut = settings.shortcuts.find(sc => sc.trigger === triggerKey);
    if (!shortcut || shortcut.action === 'none') return false;

    vibrate(50); 
    
    switch (shortcut.action) {
        case 'play_demo': handleCurrentDemo(); break;
        case 'reset_rounds': 
            if (settings.currentMode === MODES.UNIQUE_ROUNDS) showModal('Reset?', 'Reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel', true); 
            break;
        case 'clear_all': 
            showModal('Clear All?', 'Clear sequence?', () => { 
                const state = getCurrentState(); 
                state.sequences = Array.from({ length: MAX_MACHINES }, () => []); 
                state.nextSequenceIndex = 0; 
                state.currentRound = 1; 
                renderSequences(); 
            }, 'Clear All', 'Cancel', true); 
            break;
        case 'clear_last': handleBackspace(); break;
        case 'toggle_autoplay': 
            settings.isAutoplayEnabled = !settings.isAutoplayEnabled; 
            if(autoplayToggle) autoplayToggle.checked = settings.isAutoplayEnabled; 
            showToast(`Autoplay: ${settings.isAutoplayEnabled}`); 
            break;
        case 'toggle_audio': 
            settings.isAudioEnabled = !settings.isAudioEnabled; 
            if(audioToggle) audioToggle.checked = settings.isAudioEnabled; 
            showToast(`Audio: ${settings.isAudioEnabled}`); 
            break;
        case 'toggle_haptics': 
            settings.isHapticsEnabled = !settings.isHapticsEnabled; 
            if(hapticsToggle) hapticsToggle.checked = settings.isHapticsEnabled; 
            showToast(`Haptics: ${settings.isHapticsEnabled}`); 
            break;
        case 'toggle_dark_mode': 
            updateTheme(!appSettings.isDarkMode); 
            if(darkModeToggle) darkModeToggle.checked = appSettings.isDarkMode; 
            break;
        case 'open_settings': 
            (settingsModal.classList.contains('opacity-0')) ? openSettingsModal() : closeSettingsModal(); 
            break;
        case 'open_help': 
            (helpModal.classList.contains('opacity-0')) ? openHelpModal() : closeHelpModal(); 
            break;
        case 'next_profile': cycleProfile(1); break;
        case 'prev_profile': cycleProfile(-1); break;
    }
    return true;
}

// --- 7. SENSORS & FIREBASE ---

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
        executeShortcut('shake');
    }
}

function initSensorListeners() {
    if ('DeviceMotionEvent' in window) {
        if (typeof DeviceMotionEvent.requestPermission !== 'function') {
            window.addEventListener('devicemotion', handleShake);
        }
    }
}

function requestSensorPermissions() {
     if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleShake);
                }
            })
            .catch(console.error);
    }
}

async function handleSubmitComment() {
    if (!commentUsername.value || !commentMessage.value) {
        showModal("Missing Info", "Please enter both a name and a message.", () => closeModal(), "OK", "", false);
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "comments"), {
            username: commentUsername.value,
            message: commentMessage.value,
            timestamp: serverTimestamp()
        });
        commentMessage.value = ""; 
        showToast("Feedback sent!");
    } catch (error) {
        showModal("Error", "Could not send your comment. Check your internet connection.", () => closeModal(), "OK", "", false);
    }
}

function initializeCommentListener() {
    if (!commentsListContainer) return;

    const commentsQuery = query(
        collection(db, "comments"), 
        orderBy("timestamp", "desc"), 
        limit(50)
    );

    onSnapshot(commentsQuery, (querySnapshot) => {
        if (querySnapshot.empty) {
            commentsListContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No feedback yet. Be the first!</p>';
            return;
        }
        commentsListContainer.innerHTML = ""; 
        querySnapshot.forEach((doc) => {
            const comment = doc.data();
            const commentEl = document.createElement('div');
            commentEl.className = "p-3 mb-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm";
            const usernameEl = document.createElement('p');
            usernameEl.className = "font-bold text-primary-app";
            usernameEl.textContent = comment.username;
            const messageEl = document.createElement('p');
            messageEl.className = "text-gray-900 dark:text-white";
            messageEl.textContent = comment.message;
            commentEl.appendChild(usernameEl);
            commentEl.appendChild(messageEl);
            commentsListContainer.appendChild(commentEl);
        });
    }, (error) => {
        commentsListContainer.innerHTML = '<p class="text-center text-red-500">Error loading comments.</p>';
    });
}

// --- 9. MAIN UI/DOM LOGIC ---

function assignDomElements() {
    sequenceContainer = document.getElementById('sequence-container');
    customModal = document.getElementById('custom-modal');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    modalConfirm = document.getElementById('modal-confirm');
    modalCancel = document.getElementById('modal-cancel');
    shareModal = document.getElementById('share-modal');
    closeShare = document.getElementById('close-share');
    copyLinkButton = document.getElementById('copy-link-button'); 
    nativeShareButton = document.getElementById('native-share-button'); 
    toastNotification = document.getElementById('toast-notification');
    toastMessage = document.getElementById('toast-message');
    
    gameSetupModal = document.getElementById('game-setup-modal');
    closeGameSetupModalBtn = document.getElementById('close-game-setup-modal');
    dontShowWelcomeToggle = document.getElementById('dont-show-welcome-toggle');
    configSelect = document.getElementById('config-select');
    configAddBtn = document.getElementById('config-add');
    configRenameBtn = document.getElementById('config-rename');
    configDeleteBtn = document.getElementById('config-delete');
    quickAutoplayToggle = document.getElementById('quick-autoplay-toggle');
    quickAudioToggle = document.getElementById('quick-audio-toggle');
    quickOpenHelpBtn = document.getElementById('quick-open-help');
    quickOpenSettingsBtn = document.getElementById('quick-open-settings');
    globalResizeUpBtn = document.getElementById('global-resize-up');
    globalResizeDownBtn = document.getElementById('global-resize-down');

    settingsModal = document.getElementById('settings-modal');
    settingsTabNav = document.getElementById('settings-tab-nav');
    openGameSetupFromSettings = document.getElementById('open-game-setup-from-settings');
    openShareButton = document.getElementById('open-share-button');
    openHelpButton = document.getElementById('open-help-button');
    openCommentModalBtn = document.getElementById('open-comment-modal'); 
    closeSettings = document.getElementById('close-settings');
    activeProfileNameSpan = document.getElementById('active-profile-name');
    
    helpModal = document.getElementById('help-modal');
    helpContentContainer = document.getElementById('help-content-container');
    helpTabNav = document.getElementById('help-tab-nav');
    closeHelp = document.getElementById('close-help');

    commentModal = document.getElementById('comment-modal');
    closeCommentModalBtn = document.getElementById('close-comment-modal');
    submitCommentBtn = document.getElementById('submit-comment-btn');
    commentUsername = document.getElementById('comment-username');
    commentMessage = document.getElementById('comment-message');
    commentsListContainer = document.getElementById('comments-list-container');
    
    cameraModal = document.getElementById('camera-modal');
    closeCameraModalBtn = document.getElementById('close-camera-modal'); 
    openCameraModalBtn = document.getElementById('open-camera-modal-btn');
    cameraFeed = document.getElementById('camera-feed');
    cameraFeedContainer = document.getElementById('camera-feed-container');
    grid9Key = document.getElementById('grid-9key');     
    grid12Key = document.getElementById('grid-12key');   
    detectionCanvas = document.getElementById('detection-canvas');
    startCameraBtn = document.getElementById('start-camera-btn');
    startDetectionBtn = document.getElementById('start-detection-btn');
    stopDetectionBtn = document.getElementById('stop-detection-btn');
    flashSensitivitySlider = document.getElementById('flash-sensitivity-slider');
    flashSensitivityDisplay = document.getElementById('flash-sensitivity-display');

    inputSelect = document.getElementById('input-select');
    modeToggle = document.getElementById('mode-toggle');
    modeToggleLabel = document.getElementById('mode-toggle-label');
    machinesSlider = document.getElementById('machines-slider');
    machinesDisplay = document.getElementById('machines-display');
    sequenceLengthSlider = document.getElementById('sequence-length-slider');
    sequenceLengthDisplay = document.getElementById('sequence-length-display');
    sequenceLengthLabel = document.getElementById('sequence-length-label');
    chunkSlider = document.getElementById('chunk-slider');
    chunkDisplay = document.getElementById('chunk-display');
    delaySlider = document.getElementById('delay-slider');
    delayDisplay = document.getElementById('delay-display');
    settingMultiSequenceGroup = document.getElementById('setting-multi-sequence-group');
    autoclearToggle = document.getElementById('autoclear-toggle');
    settingAutoclear = document.getElementById('setting-autoclear');
    
    playbackSpeedSlider = document.getElementById('playback-speed-slider');
    playbackSpeedDisplay = document.getElementById('playback-speed-display');
    showWelcomeToggle = document.getElementById('show-welcome-toggle');
    darkModeToggle = document.getElementById('dark-mode-toggle');
    showConfirmationsToggle = document.getElementById('show-confirmations-toggle');
    uiScaleSlider = document.getElementById('ui-scale-slider');
    uiScaleDisplay = document.getElementById('ui-scale-display');
    
    shortcutListContainer = document.getElementById('shortcut-list-container');
    addShortcutBtn = document.getElementById('add-shortcut-btn');
    shakeSensitivitySlider = document.getElementById('shake-sensitivity-slider');
    shakeSensitivityDisplay = document.getElementById('shake-sensitivity-display');
    
    autoplayToggle = document.getElementById('autoplay-toggle');
    speedDeleteToggle = document.getElementById('speed-delete-toggle');
    audioToggle = document.getElementById('audio-toggle');
    voiceInputToggle = document.getElementById('voice-input-toggle');
    hapticsToggle = document.getElementById('haptics-toggle');
    autoInputSlider = document.getElementById('auto-input-slider'); 

    padKey9 = document.getElementById('pad-key9');
    padKey12 = document.getElementById('pad-key12');
    padPiano = document.getElementById('pad-piano');
    allResetButtons = document.querySelectorAll('.reset-button');
    allVoiceInputs = document.querySelectorAll('.voice-text-input');
    allCameraMasterBtns = document.querySelectorAll('#camera-master-btn'); 
    allMicMasterBtns = document.querySelectorAll('#mic-master-btn');       
}

function initializeListeners() {
    
    // Master Switch Logic
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#camera-master-btn')) {
            isCameraMasterOn = !isCameraMasterOn;
            updateMasterButtonStates();
        }
        if (e.target.closest('#mic-master-btn')) {
            isMicMasterOn = !isMicMasterOn;
            updateMasterButtonStates();
        }
    });
    
    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const { value, action, input, copyTarget } = button.dataset;
        if (copyTarget) {
            const targetElement = document.getElementById(copyTarget);
            if (targetElement) {
                targetElement.select();
                navigator.clipboard.writeText(targetElement.value);
                button.classList.add('!bg-btn-control-green');
                setTimeout(() => button.classList.remove('!bg-btn-control-green'), 1000);
            }
            return;
        }
        
        if (action === 'open-settings') { openSettingsModal(); return; }
        if (action === 'open-help') { closeSettingsModal(); openHelpModal(); return; }
        if (action === 'open-share') { openShareModal(); return; }
        if (action === 'open-comments') { closeSettingsModal(); openCommentModal(); return; }
        if (action === 'open-camera') { closeSettingsModal(); openCameraModal(); return; } 
        if (action === 'copy-link') {
            navigator.clipboard.writeText(window.location.href);
            button.classList.add('!bg-btn-control-green');
            return;
        }
        if (action === 'native-share') {
            if (navigator.share) {
                navigator.share({ title: 'Follow Me App', text: 'Check out this sequence app!', url: window.location.href, });
            }
            return;
        }
        if (action === 'restore-defaults') {
            handleRestoreDefaults(); 
            return;
        }
        if (action === 'reset-unique-rounds') {
            showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel', true);
            return;
        }
        
        const currentInput = getCurrentProfileSettings().currentInput;
        if (action === 'play-demo' && input === currentInput) {
            handleCurrentDemo();
            return;
        }
        if (value && input === currentInput) {
            addValue(value);
        }
    });
    
    allVoiceInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            const transcript = event.target.value;
            if (transcript) processVoiceTranscript(transcript);
            event.target.value = '';
        });
    });
    
    document.querySelectorAll('button[data-action="backspace"]').forEach(btn => {
        btn.addEventListener('mousedown', handleBackspaceStart);
        btn.addEventListener('mouseup', handleBackspaceEnd);
        btn.addEventListener('mouseleave', stopSpeedDeleting);
        btn.addEventListener('touchstart', handleBackspaceStart, { passive: false });
        btn.addEventListener('touchend', handleBackspaceEnd);
    });
    
    if (closeGameSetupModalBtn) {
        closeGameSetupModalBtn.addEventListener('click', () => {
            closeGameSetupModal();
            requestSensorPermissions();
        });
    }
    if (dontShowWelcomeToggle) dontShowWelcomeToggle.addEventListener('change', (e) => {
        appSettings.showWelcomeScreen = !e.target.checked;
        saveState();
    });
    if (configSelect) configSelect.addEventListener('change', (e) => switchActiveProfile(e.target.value));
    if (configAddBtn) configAddBtn.addEventListener('click', handleConfigAdd);
    if (configRenameBtn) configRenameBtn.addEventListener('click', handleConfigRename);
    if (configDeleteBtn) configDeleteBtn.addEventListener('click', handleConfigDelete);
    if (quickOpenHelpBtn) quickOpenHelpBtn.addEventListener('click', () => {
        closeGameSetupModal();
        openHelpModal();
    });
    if (quickOpenSettingsBtn) quickOpenSettingsBtn.addEventListener('click', () => {
        closeGameSetupModal();
        openSettingsModal();
    });
    if (globalResizeUpBtn) globalResizeUpBtn.addEventListener('click', () => {
        applyGlobalUiScale(appSettings.globalUiScale + 10);
        saveState();
    });
    if (globalResizeDownBtn) globalResizeDownBtn.addEventListener('click', () => {
        applyGlobalUiScale(appSettings.globalUiScale - 10);
        saveState();
    });

    if (closeSettings) closeSettings.addEventListener('click', closeSettingsModal);
    if (settingsTabNav) settingsTabNav.addEventListener('click', handleSettingsTabClick);
    if (openGameSetupFromSettings) openGameSetupFromSettings.addEventListener('click', () => {
        closeSettingsModal();
        openGameSetupModal();
    });
    
    const addProfileSettingListener = (element, eventType, settingKey, valueType = 'value') => {
        if (element) {
            element.addEventListener(eventType, (e) => {
                const profileSettings = getCurrentProfileSettings();
                let value = e.target[valueType];
                if (valueType === 'checked') value = e.target.checked;
                if (element.type === 'range') value = parseInt(value);
                
                profileSettings[settingKey] = value;
                
                if (element === machinesSlider) updateMachinesDisplay(value, machinesDisplay);
                if (element === sequenceLengthSlider) updateSequenceLengthDisplay(value, sequenceLengthDisplay);
                if (element === chunkSlider) updateChunkDisplay(value, chunkDisplay);
                if (element === delaySlider) updateDelayDisplay(value, delayDisplay);
                if (element === modeToggle) profileSettings.currentMode = value ? MODES.UNIQUE_ROUNDS : MODES.SIMON;
                if (element === uiScaleSlider) {
                    value = value / 100.0;
                    profileSettings[settingKey] = value;
                    updateScaleDisplay(value, uiScaleDisplay);
                    renderSequences();
                }
                if (element === shakeSensitivitySlider) updateShakeSensitivityDisplay(value);
                if (element === flashSensitivitySlider) updateFlashSensitivityDisplay(value);
                if (element === autoInputSlider) { 
                    profileSettings.autoInputMode = String(value);
                    updateMainUIControlsVisibility();
                }
                updateSettingsModalVisibility();
            });
        }
    };
    
    // Tab 1: Profile Settings
    addProfileSettingListener(inputSelect, 'change', 'currentInput');
    addProfileSettingListener(modeToggle, 'change', 'currentMode', 'checked');
    addProfileSettingListener(machinesSlider, 'input', 'machineCount');
    addProfileSettingListener(sequenceLengthSlider, 'input', 'sequenceLength');
    addProfileSettingListener(chunkSlider, 'input', 'simonChunkSize');
    addProfileSettingListener(delaySlider, 'input', 'simonInterSequenceDelay');
    addProfileSettingListener(autoclearToggle, 'change', 'isUniqueRoundsAutoClearEnabled', 'checked');
    
    // Tab 2: Global Settings
    if (playbackSpeedSlider) playbackSpeedSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        appSettings.playbackSpeed = val / 100.0;
        updatePlaybackSpeedDisplay(val, playbackSpeedDisplay);
    });
    if (showWelcomeToggle) showWelcomeToggle.addEventListener('change', (e) => {
        appSettings.showWelcomeScreen = e.target.checked;
        saveState();
    });
    if (darkModeToggle) darkModeToggle.addEventListener('change', (e) => updateTheme(e.target.checked));
    if (showConfirmationsToggle) showConfirmationsToggle.addEventListener('change', (e) => { 
        appSettings.isConfirmationsEnabled = e.target.checked;
        saveState();
    });
    addProfileSettingListener(uiScaleSlider, 'input', 'uiScaleMultiplier'); 
    
    // Tab 3: Shortcuts
    if (addShortcutBtn) addShortcutBtn.addEventListener('click', handleAddShortcut);
    if (shortcutListContainer) shortcutListContainer.addEventListener('click', handleShortcutListClick);
    addProfileSettingListener(shakeSensitivitySlider, 'input', 'shakeSensitivity');
    
    // Tab 4: Stealth
    addProfileSettingListener(autoplayToggle, 'change', 'isAutoplayEnabled', 'checked');
    addProfileSettingListener(speedDeleteToggle, 'change', 'isSpeedDeletingEnabled', 'checked');
    addProfileSettingListener(audioToggle, 'change', 'isAudioEnabled', 'checked');
    addProfileSettingListener(voiceInputToggle, 'change', 'isVoiceInputEnabled', 'checked');
    addProfileSettingListener(hapticsToggle, 'change', 'isHapticsEnabled', 'checked');
    addProfileSettingListener(autoInputSlider, 'input', 'autoInputMode'); 

    if (closeHelp) closeHelp.addEventListener('click', closeHelpModal);
    if (closeShare) closeShare.addEventListener('click', closeShareModal); 
    
    // --- Comment Modal Listeners ---
    if (closeCommentModalBtn) closeCommentModalBtn.addEventListener('click', closeCommentModal);
    if (submitCommentBtn) submitCommentBtn.addEventListener('click', handleSubmitComment);
    
    // --- Camera Modal Listeners ---
    if (closeCameraModalBtn) closeCameraModalBtn.addEventListener('click', closeCameraModal); 
    if (startCameraBtn) startCameraBtn.addEventListener('click', startCameraStream);
    if (startDetectionBtn) startDetectionBtn.addEventListener('click', startDetection); 
    if (stopDetectionBtn) stopDetectionBtn.addEventListener('click', stopDetection); 
    addProfileSettingListener(flashSensitivitySlider, 'input', 'flashSensitivity');
    
    // --- Grid Drag/Resize Listeners ---
    const initGridDragger = (gridElement) => {
        if (!gridElement) return;
        
        let startX, startY, startLeft, startTop;
        
        const dragStart = (e) => {
            e.preventDefault(); isDraggingGrid = true; activeCalibrationGrid = gridElement; 
            startX = e.clientX || e.touches[0].clientX; startY = e.clientY || e.touches[0].clientY;
            startLeft = activeCalibrationGrid.offsetLeft; startTop = activeCalibrationGrid.offsetTop;
            window.addEventListener('mousemove', dragMove); window.addEventListener('mouseup', dragEnd); window.addEventListener('touchmove', dragMove, { passive: false }); window.addEventListener('touchend', dragEnd);
        };

        const dragMove = (e) => {
            if (!isDraggingGrid) return;
            e.preventDefault();
            const currentX = e.clientX || e.touches[0].clientX; const currentY = e.clientY || e.touches[0].clientY;
            const dx = currentX - startX; const dy = currentY - startY;
            const parentRect = cameraFeedContainer.getBoundingClientRect();
            activeCalibrationGrid.style.left = `${(startLeft + dx) / parentRect.width * 100}%`;
            activeCalibrationGrid.style.top = `${(startTop + dy) / parentRect.height * 100}%`;
        };

        const dragEnd = (e) => {
            if (!isDraggingGrid) return; isDraggingGrid = false;
            window.removeEventListener('mousemove', dragMove); window.removeEventListener('mouseup', dragEnd); window.removeEventListener('touchmove', dragMove); window.removeEventListener('touchend', dragEnd);
            saveGridConfig();
        };
        
        gridElement.addEventListener('mousedown', dragStart);
        gridElement.addEventListener('touchstart', dragStart, { passive: false });
        
        // BUG FIX: Only save on explicit end events
        gridElement.addEventListener('mouseup', () => saveGridConfig());
        gridElement.addEventListener('touchend', () => saveGridConfig());
    };
    
    initGridDragger(grid9Key);
    initGridDragger(grid12Key);
    
    initSensorListeners(); 
    if (!appSettings.showWelcomeScreen) {
         document.body.addEventListener('click', requestSensorPermissions, { once: true });
    }
}

// --- Initialization ---
window.onload = function() {
    loadState(); 
    assignDomElements();
    applyGlobalUiScale(appSettings.globalUiScale);
    updateTheme(appSettings.isDarkMode);
    initializeListeners();
    updateAllChrome();
    
    initializeCommentListener(); 

    if (appSettings.showWelcomeScreen) {
        setTimeout(openGameSetupModal, 500); 
    }
    if (getCurrentProfileSettings().isAudioEnabled) speak(" "); 
};

})(); // IIFE wrapper
