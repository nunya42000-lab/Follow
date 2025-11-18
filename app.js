// --- 0. FIREBASE SDK IMPORTS ---
// These imports are possible because we set type="module" in the HTML
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
const db = getFirestore(app); // This is our database object

// --- 1. CONFIG ---
(function() {
    'use strict';

    const MAX_MACHINES = 4;
    const DEMO_DELAY_BASE_MS = 798;
    const SPEED_DELETE_INITIAL_DELAY = 250;
    const SPEED_DELETE_INTERVAL_MS = 10;    
    const SHAKE_BASE_THRESHOLD = 25; 
    const SHAKE_TIMEOUT_MS = 500; 
    const FLASH_COOLDOWN_MS = 250; // Min time between flashes (ms)

    const SETTINGS_KEY = 'followMeAppSettings_v7'; // Incremented version
    const STATE_KEY = 'followMeAppState_v7';

    const INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
    const MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };
    const AUTO_INPUT_MODES = { OFF: '0', TONE: '1', PATTERN: '2' }; // NEW

    // --- EXPANDED: Shortcut Definitions ---
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
        
        // --- AUTO INPUT SETTINGS ---
        autoInputMode: AUTO_INPUT_MODES.OFF, // '0', '1', or '2'
        flashSensitivity: 50, 
        cameraGridConfig9: { // Config for 9-key
            top: '25%', left: '25%', width: '50%', height: '50%'
        },
        cameraGridConfig12: { // Config for 12-key
            top: '25%', left: '20%', width: '60%', height: '40%'
        }
    };
    
    const DEFAULT_APP_SETTINGS = {
        globalUiScale: 100,
        isDarkMode: true,
        showWelcomeScreen: true,
        activeProfileId: 'profile_1',
        profiles: {},
        playbackSpeed: 1.0,
    };
    
    const PREMADE_PROFILES = {
        'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS } },
        'profile_2': { name: "2 Machines", settings: { 
            ...DEFAULT_PROFILE_SETTINGS,
            machineCount: 2,
            simonChunkSize: 4,
            simonInterSequenceDelay: 200
        }},
        'profile_3': { name: "Bananas", settings: {
            ...DEFAULT_PROFILE_SETTINGS,
            sequenceLength: 25
        }},
        'profile_4': { name: "Piano", settings: {
            ...DEFAULT_PROFILE_SETTINGS,
            currentInput: INPUTS.PIANO
        }},
        'profile_5': { name: "15 Rounds", settings: {
            ...DEFAULT_PROFILE_SETTINGS,
            currentMode: MODES.UNIQUE_ROUNDS,
            sequenceLength: 15
        }}
    };

    // --- 2. STATE ---
    let appSettings = { ...DEFAULT_APP_SETTINGS };
    let appState = {}; 
    let initialDelayTimer = null; 
    let speedDeleteInterval = null; 
    let isHoldingBackspace = false;
    let lastShakeTime = 0; 
    let toastTimer = null; 
    
    // --- CAMERA/MIC STATE ---
    let cameraStream = null;
    let isDetecting = false;
    let detectionLoopId = null;
    let lastFlashTime = Array(12).fill(0);   // Expanded to 12
    let lastBrightness = Array(12).fill(0); // Expanded to 12
    let isDraggingGrid = false;
    let isCameraMasterOn = false; // NEW
    let isMicMasterOn = false;    // NEW

    // Global DOM Element Variables
    var sequenceContainer = null;
    var customModal = null, modalTitle = null, modalMessage = null, modalConfirm = null, modalCancel = null;
    var shareModal = null, closeShare = null, copyLinkButton = null, nativeShareButton = null;
    var toastNotification = null, toastMessage = null; 
    
    // --- MODAL: Game Setup
    var gameSetupModal = null, closeGameSetupModalBtn = null, dontShowWelcomeToggle = null;
    var configSelect = null, configAddBtn = null, configRenameBtn = null, configDeleteBtn = null;
    var quickAutoplayToggle = null, quickAudioToggle = null;
    var quickOpenHelpBtn = null, quickOpenSettingsBtn = null;
    var globalResizeUpBtn = null, globalResizeDownBtn = null;
    
    // --- MODAL: Settings
    var settingsModal = null, settingsTabNav = null, openHelpButton = null, openShareButton = null, closeSettings = null, openGameSetupFromSettings = null;
    var activeProfileNameSpan = null;
    var openCommentModalBtn = null; 
    
    // --- MODAL: Help
    var helpModal = null, helpContentContainer = null, helpTabNav = null, closeHelp = null;
    
    // --- MODAL: Comment ---
    var commentModal = null, closeCommentModalBtn = null, submitCommentBtn = null;
    var commentUsername = null, commentMessage = null, commentsListContainer = null;
    
    // --- MODAL: Camera ---
    var cameraModal = null, closeCameraModalBtn = null, openCameraModalBtn = null; // Renamed
    var cameraFeed = null, cameraFeedContainer = null;
    var grid9Key = null, grid12Key = null; // NEW
    var activeCalibrationGrid = null; // NEW
    var detectionCanvas = null, detectionContext = null; 
    var startCameraBtn = null, startDetectionBtn = null, stopDetectionBtn = null;
    var flashSensitivitySlider = null, flashSensitivityDisplay = null;

    // --- CONTROLS: Settings Tab "Profile"
    var inputSelect = null, modeToggle = null, modeToggleLabel = null;
    var machinesSlider = null, machinesDisplay = null;
    var sequenceLengthSlider = null, sequenceLengthDisplay = null, sequenceLengthLabel = null;
    var chunkSlider = null, chunkDisplay = null;
    var delaySlider = null, delayDisplay = null;
    var settingMultiSequenceGroup = null;
    var autoclearToggle = null, settingAutoclear = null;
    
    // --- CONTROLS: Settings Tab "Global"
    var playbackSpeedSlider = null, playbackSpeedDisplay = null;
    var showWelcomeToggle = null, darkModeToggle = null;
    var uiScaleSlider = null, uiScaleDisplay = null;
    
    // --- CONTROLS: Settings Tab "Shortcuts"
    var shortcutListContainer = null, addShortcutBtn = null;
    var shakeSensitivitySlider = null, shakeSensitivityDisplay = null;

    // --- CONTROLS: Settings Tab "Stealth"
    var autoplayToggle = null, speedDeleteToggle = null;
    var audioToggle = null, voiceInputToggle = null, hapticsToggle = null;
    var autoInputSlider = null; // NEW

    // --- CONTROLS: Footer ---
    var padKey9 = null, padKey12 = null, padPiano = null;
    var allVoiceInputs = null;
    var allResetButtons = null;
    var allCameraMasterBtns = null; // NEW
    var allMicMasterBtns = null;    // NEW

    
    const getCurrentProfileSettings = () => appSettings.profiles[appSettings.activeProfileId]?.settings;
    const getCurrentState = () => appState[appSettings.activeProfileId];

    function saveState() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
            localStorage.setItem(STATE_KEY, JSON.stringify(appState));
        } catch (error) {
            console.error("Failed to save state to localStorage:", error);
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
                        ...DEFAULT_PROFILE_SETTINGS, // Apply defaults first
                        ...(appSettings.profiles[profileId].settings || {}) // Then apply saved
                    };
                    
                    if (appSettings.profiles[profileId].settings.isAudioPlaybackEnabled !== undefined) {
                        appSettings.profiles[profileId].settings.isAudioEnabled = appSettings.profiles[profileId].settings.isAudioPlaybackEnabled;
                        delete appSettings.profiles[profileId].settings.isAudioPlaybackEnabled;
                    }
                    // --- MIGRATION: Old grid config to new ---
                    if (appSettings.profiles[profileId].settings.cameraGridConfig) {
                        appSettings.profiles[profileId].settings.cameraGridConfig9 = { ...appSettings.profiles[profileId].settings.cameraGridConfig };
                        delete appSettings.profiles[profileId].settings.cameraGridConfig;
                    }
                });
                
            } else {
                appSettings.profiles = {};
                Object.keys(PREMADE_PROFILES).forEach(id => { // Deep copy premade
                    appSettings.profiles[id] = { 
                        name: PREMADE_PROFILES[id].name, 
                        settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] }
                    };
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
            console.error("Failed to load state from localStorage:", error);
            localStorage.removeItem(SETTINGS_KEY);
            localStorage.removeItem(STATE_KEY);
            
            appSettings = { ...DEFAULT_APP_SETTINGS };
            appSettings.profiles = {};
            Object.keys(PREMADE_PROFILES).forEach(id => {
                appSettings.profiles[id] = { 
                    name: PREMADE_PROFILES[id].name, 
                    settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] }
                };
            });
            
            appState = {};
            Object.keys(appSettings.profiles).forEach(profileId => {
                appState[profileId] = getInitialState();
            });
        }
    }

    function getInitialState() {
        return { 
            sequences: Array.from({ length: MAX_MACHINES }, () => []),
            nextSequenceIndex: 0,
            currentRound: 1
        };
    }

    // --- 3. UI ---

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
        appSettings.profiles[newId] = {
            name: newName,
            settings: { ...DEFAULT_PROFILE_SETTINGS, shortcuts: [] } 
        };
        appState[newId] = getInitialState();
        
        appSettings.activeProfileId = newId;
        populateConfigDropdown();
        updateAllChrome();
        saveState();
    }
    
    function handleConfigRename() {
        const currentProfile = appSettings.profiles[appSettings.activeProfileId];
        if (!currentProfile) return;
        
        const newName = prompt("Enter new name:", currentProfile.name);
        if (!newName) return;
        
        currentProfile.name = newName;
        populateConfigDropdown();
        saveState();
    }
    
    function handleConfigDelete() {
        const profileCount = Object.keys(appSettings.profiles).length;
        if (profileCount <= 1) {
            showModal("Cannot Delete", "You must have at least one configuration.", () => closeModal(), "OK", "");
            return;
        }
        
        const currentProfile = appSettings.profiles[appSettings.activeProfileId];
        
        showModal(
            `Delete "${currentProfile.name}"?`,
            "This will permanently delete this configuration and its saved sequences. This cannot be undone.",
            () => {
                const profileIdToDelete = appSettings.activeProfileId;
                delete appSettings.profiles[profileIdToDelete];
                delete appState[profileIdToDelete];
                
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
                populateConfigDropdown();
                updateAllChrome();
                saveState();
            },
            "Delete",
            "Cancel"
        );
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
    
    // NEW: Update master button visual state
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
        autoInputSlider.value = profileSettings.autoInputMode; // NEW
        
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
        saveSettingsModal(); // Save on close
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
    
    // --- Comment Modal Functions ---
    function openCommentModal() {
        if (commentModal) {
            commentModal.classList.remove('opacity-0', 'pointer-events-none');
            commentModal.querySelector('div').classList.remove('scale-90');
        }
    }
    
    function closeCommentModal() {
        if (commentModal) {
            commentModal.querySelector('div').classList.add('scale-90');
            commentModal.classList.add('opacity-0');
            setTimeout(() => commentModal.classList.add('pointer-events-none'), 300);
        }
    }
    
    // --- Camera Modal Functions ---
    function openCameraModal() {
        if (!cameraModal) return;
        
        const profileSettings = getCurrentProfileSettings();
        
        // --- NEW: Show the correct grid based on input type ---
        if (profileSettings.currentInput === INPUTS.KEY12) {
            activeCalibrationGrid = grid12Key;
            const config = profileSettings.cameraGridConfig12;
            if (grid9Key) grid9Key.style.display = 'none';
            if (grid12Key) {
                grid12Key.style.display = 'grid';
                grid12Key.style.top = config.top;
                grid12Key.style.left = config.left;
                grid12Key.style.width = config.width;
                grid12Key.style.height = config.height;
            }
        } else { // Default to 9-key
            activeCalibrationGrid = grid9Key;
            const config = profileSettings.cameraGridConfig9;
            if (grid12Key) grid12Key.style.display = 'none';
            if (grid9Key) {
                grid9Key.style.display = 'grid';
                grid9Key.style.top = config.top;
                grid9Key.style.left = config.left;
                grid9Key.style.width = config.width;
                grid9Key.style.height = config.height;
            }
        }
        
        // Apply saved sensitivity
        if (flashSensitivitySlider) {
            flashSensitivitySlider.value = profileSettings.flashSensitivity;
            updateFlashSensitivityDisplay(profileSettings.flashSensitivity);
        }

        // Reset button states
        if (cameraStream) {
             startCameraBtn.style.display = 'none';
             startDetectionBtn.style.display = 'block';
             stopDetectionBtn.style.display = 'none';
        } else {
             startCameraBtn.style.display = 'block';
             startDetectionBtn.style.display = 'none';
             stopDetectionBtn.style.display = 'none';
        }
        isDetecting = false; // Always start stopped
        
        cameraModal.classList.remove('opacity-0', 'pointer-events-none');
        cameraModal.querySelector('div').classList.remove('scale-90');
    }

    function closeCameraModal() {
        if (!cameraModal) return;
        stopDetection(); // Stop detection loop
        stopCameraStream(); // Stop camera feed
        
        cameraModal.querySelector('div').classList.add('scale-90');
        cameraModal.classList.add('opacity-0');
        setTimeout(() => cameraModal.classList.add('pointer-events-none'), 300);
    }

    async function startCameraStream() {
        if (cameraStream) {
            stopCameraStream(); // Stop existing before starting new
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment', // Prefer back camera
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            cameraStream = stream;
            if (cameraFeed) {
                cameraFeed.srcObject = stream;
                // Wait for video metadata to load to get correct dimensions
                cameraFeed.onloadedmetadata = () => {
                    if (detectionCanvas) {
                        detectionCanvas.width = cameraFeed.videoWidth;
                        detectionCanvas.height = cameraFeed.videoHeight;
                    }
                };
                cameraFeed.play();
            }
            if (startCameraBtn) startCameraBtn.style.display = 'none';
            if (startDetectionBtn) startDetectionBtn.style.display = 'block';
            if (stopDetectionBtn) stopDetectionBtn.style.display = 'none';
            
        } catch (err) {
            console.error("Error accessing camera:", err);
            showModal("Camera Error", `Could not access camera: ${err.message}. Please check browser permissions.`, () => closeModal(), "OK", "");
        }
    }

    function stopCameraStream() {
        stopDetection(); // Ensure detection is stopped if stream is cut
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        if (cameraFeed) {
            cameraFeed.srcObject = null;
        }
        // Reset button states
        if (startCameraBtn) startCameraBtn.style.display = 'block';
        if (startDetectionBtn) startDetectionBtn.style.display = 'none';
        if (stopDetectionBtn) stopDetectionBtn.style.display = 'none';
    }
    
    // --- DETECTION ENGINE (UPGRADED) ---

    function startDetection() {
        if (isDetecting || !cameraStream || !detectionCanvas) return;
        
        isDetecting = true;
        lastBrightness.fill(0); // Reset brightness history
        lastFlashTime.fill(0); // Reset flash history
        
        if (startDetectionBtn) startDetectionBtn.style.display = 'none';
        if (stopDetectionBtn) stopDetectionBtn.style.display = 'block';

        if (detectionCanvas) {
            detectionContext = detectionCanvas.getContext('2d', { willReadFrequently: true });
            detectionCanvas.width = cameraFeed.videoWidth;
            detectionCanvas.height = cameraFeed.videoHeight;
        }

        detectionLoopId = requestAnimationFrame(runDetectionLoop);
    }

    function stopDetection() {
        isDetecting = false;
        if (detectionLoopId) {
            cancelAnimationFrame(detectionLoopId);
            detectionLoopId = null;
        }
        
        if (startDetectionBtn) startDetectionBtn.style.display = 'block';
        if (stopDetectionBtn) stopDetectionBtn.style.display = 'none';
        
        // Clear any active flash indicators
        if (activeCalibrationGrid) {
            for (let i = 0; i < activeCalibrationGrid.children.length; i++) {
                activeCalibrationGrid.children[i].classList.remove('flash-detected');
            }
        }
    }
    
    function getAverageBrightness(imageData, x, y, width, height) {
        let sum = 0;
        let count = 0;
        
        // Clamp coordinates to image boundaries
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(imageData.width, Math.ceil(x + width));
        const endY = Math.min(imageData.height, Math.ceil(y + height));

        for (let row = startY; row < endY; row++) {
            for (let col = startX; col < endX; col++) {
                const index = (row * imageData.width + col) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                // Using a simple average for brightness
                sum += (r + g + b) / 3;
                count++;
            }
        }
        return (count > 0) ? (sum / count) : 0;
    }

    function runDetectionLoop() {
        if (!isDetecting || !detectionContext || !cameraFeed || !activeCalibrationGrid) {
            isDetecting = false;
            return;
        }

        // 1. Draw video frame to hidden canvas
        detectionContext.drawImage(cameraFeed, 0, 0, detectionCanvas.width, detectionCanvas.height);
        
        // 2. Get pixel data from canvas
        let imageData;
        try {
            imageData = detectionContext.getImageData(0, 0, detectionCanvas.width, detectionCanvas.height);
        } catch (e) {
            console.error("Could not get image data:", e);
            runDetectionLoop(); // Try again next frame
            return;
        }
        
        // 3. Get geometry for calculation
        const feedRect = cameraFeed.getBoundingClientRect();
        const gridRect = activeCalibrationGrid.getBoundingClientRect();
        
        // Calculate scale factor in case video feed is letterboxed
        const scaleX = detectionCanvas.width / feedRect.width;
        const scaleY = detectionCanvas.height / feedRect.height;

        // Calculate the grid's top-left corner in canvas pixels
        const gridPixelX = (gridRect.left - feedRect.left) * scaleX;
        const gridPixelY = (gridRect.top - feedRect.top) * scaleY;
        
        // Calculate the grid's size in canvas pixels
        const gridPixelWidth = gridRect.width * scaleX;
        const gridPixelHeight = gridRect.height * scaleY;
        
        // --- DYNAMIC GRID LOGIC ---
        const profileSettings = getCurrentProfileSettings();
        const is12Key = (profileSettings.currentInput === INPUTS.KEY12);
        const numCols = is12Key ? 4 : 3;
        const numRows = is12Key ? 3 : 3;
        const numBoxes = numCols * numRows;

        // Calculate individual box size in canvas pixels
        const boxPixelWidth = gridPixelWidth / numCols;
        const boxPixelHeight = gridPixelHeight / numRows;
        
        const now = Date.now();
        const sensitivity = profileSettings.flashSensitivity;

        // 4. Analyze each box
        for (let i = 0; i < numBoxes; i++) {
            const row = Math.floor(i / numCols);
            const col = i % numCols;

            const boxX = gridPixelX + (col * boxPixelWidth);
            const boxY = gridPixelY + (row * boxPixelHeight);
            
            const currentBrightness = getAverageBrightness(imageData, boxX, boxY, boxPixelWidth, boxPixelHeight);
            
            const delta = currentBrightness - lastBrightness[i];
            
            // --- FLASH DETECTION LOGIC ---
            if (delta > sensitivity && (now - lastFlashTime[i] > FLASH_COOLDOWN_MS)) {
                
                const value = String(i + 1);
                
                // --- THE MASTER SWITCH CHECK ---
                // Only add value if the master switch is ON
                if (isCameraMasterOn) {
                    console.log(`Flash ${value} DETECTED & ADDED!`);
                    addValue(value);
                } else {
                    console.log(`Flash ${value} detected (CALIBRATION).`);
                }
                
                // Set cooldown
                lastFlashTime[i] = now;
                
                // Show visual feedback
                const boxEl = activeCalibrationGrid.children[i];
                if (boxEl) {
                    boxEl.classList.add('flash-detected');
                    setTimeout(() => boxEl.classList.remove('flash-detected'), 150);
                }
            }
            
            // Store current brightness for next frame's comparison
            lastBrightness[i] = currentBrightness;
        }
        
        // 5. Loop
        if (isDetecting) {
            detectionLoopId = requestAnimationFrame(runDetectionLoop);
        }
    }
    
    // --- END DETECTION ENGINE ---

    function saveGridConfig() {
        if (!activeCalibrationGrid || !cameraFeedContainer) return;
        
        const profileSettings = getCurrentProfileSettings();
        if (!profileSettings) return;

        // Get pixel values
        const containerRect = cameraFeedContainer.getBoundingClientRect();
        const gridRect = activeCalibrationGrid.getBoundingClientRect();

        // Convert to percentage
        const config = {
            top: `${((gridRect.top - containerRect.top) / containerRect.height) * 100}%`,
            left: `${((gridRect.left - containerRect.left) / containerRect.width) * 100}%`,
            width: `${(gridRect.width / containerRect.width) * 100}%`,
            height: `${(gridRect.height / containerRect.height) * 100}%`
        };
        
        // Save to the correct config
        if (profileSettings.currentInput === INPUTS.KEY12) {
            profileSettings.cameraGridConfig12 = config;
        } else {
            profileSettings.cameraGridConfig9 = config;
        }
        
        // Apply back to style to ensure consistency
        activeCalibrationGrid.style.top = config.top;
        activeCalibrationGrid.style.left = config.left;
        activeCalibrationGrid.style.width = config.width;
        activeCalibrationGrid.style.height = config.height;
        
        saveState();
    }


    function handleHelpTabClick(event) {
        const button = event.target.closest('button[data-tab]');
        if (button) {
            switchHelpTab(button.dataset.tab);
        }
    }
    function handleSettingsTabClick(event) {
        const button = event.target.closest('button[data-tab]');
        if (button) {
            switchSettingsTab(button.dataset.tab);
        }
    }

    function switchHelpTab(tabId) {
        if (helpContentContainer) {
            helpContentContainer.querySelectorAll('.help-tab-content').forEach(tab => tab.classList.add('hidden'));
        }
        if (helpTabNav) {
            helpTabNav.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active-tab'));
        }
        const content = document.getElementById(`help-tab-${tabId}`);
        if (content) content.classList.remove('hidden');
        if (helpTabNav) {
            const button = helpTabNav.querySelector(`button[data-tab="${tabId}"]`);
            if (button) button.classList.add('active-tab');
        }
    }

    function generateGeneralHelp() {
        const container = document.getElementById('help-tab-general');
        if (container) container.innerHTML = `
            <h4 class="text-primary-app">App Overview</h4>
            <p>This is a multi-mode sequence tracker with customizable profiles.</p>
            <p>Use the **Quick Start** modal (on launch) to select your saved **Configuration Profile**. You can add, rename, or delete profiles from there.</p>
            <p>All detailed settings are in the **Settings (⚙️)** menu, organized into tabs: "Profile", "Global", "Shortcuts", and "Stealth".</p>
            <h4 class="text-primary-app">Basic Controls</h4>
            <ul>
                <li><span class="font-bold">Keypad:</span> Tap the numbers or keys to add to the sequence.</li>
                <li><span class="font-bold">Play (▶):</span> Plays back the current sequence(s).</li>
                <li><span class="font-bold">Backspace (←):</span> Removes the last value.</li>
                <li><span class="font-bold">Settings (⚙️):</span> Opens app preferences.</li>
                <li><span class="font-bold">RESET:</span> (Unique Rounds Mode Only) Resets the game to Round 1.</li>
            </ul>`;
    }
    function generateModesHelp() {
        const container = document.getElementById('help-tab-modes');
        if (container) container.innerHTML = `
            <h4 class="text-primary-app">Inputs (The Keypads)</h4>
            <p>Set in Settings ➔ Profile Tab</p>
            <ul>
                <li><span class="font-bold">9-Key:</span> A 3x3 grid (1-9).</li>
                <li><span class="font-bold">12-Key:</span> A 4x3 grid (1-12).</li>
                <li><span class="font-bold">Piano:</span> A 7-key piano with 5 sharps.</li>
            </ul>
            <h4 class_=\"text-primary-app\">Modes (The Logic)</h4>
            <p>Set in Settings ➔ Profile Tab</p>
            <ul>
                <li><span class="font-bold">Simon Says (Default):</span> Standard mode. Enter values up to the Sequence Length. Supports 1-4 machines.</li>
                <li><span class="font-bold">Unique Rounds:</span> A round-based game. The sequence length increases by one each round, up to the Sequence Length (15, 20, or 25). This mode is always single-machine.</li>
            </ul>`;
    }
    function generatePromptsHelp() {
        const container = document.getElementById('help-tab-prompts');
        if (!container) return;
        const profileSettings = getCurrentProfileSettings();
        if (!profileSettings) return;
        const { currentMode, machineCount, sequenceLength, isUniqueRoundsAutoClearEnabled, isAutoplayEnabled } = profileSettings;
        let simonPrompt = "";
        let roundsPrompt = "";
        if (machineCount === 1) {
            simonPrompt = `Let's play 'Simon Says' (1 Machine).
1. I will give you values one at a time.
2. ${isAutoplayEnabled ? "The game is **automatic**. After I give you a value, you will **immediately** read the **entire** sequence back to me." : "After I give you values, I will say 'read back'. You will then read the entire sequence back to me."}
3. 'Clear': Delete the last value I gave you.
4. 'Clear all': Delete the entire sequence.
Let's start.`;
        } else {
            simonPrompt = `Let's play 'Simon Says' (${machineCount} Machines).
1. I will give you one value at a time. Assign each value to a machine in a cycle (Machine 1, Machine 2,${machineCount > 2 ? ' Machine 3,' : ''}${machineCount > 3 ? ' Machine 4,' : ''} then back to Machine 1).
2. ${isAutoplayEnabled ? `The game is **automatic**. After I give you the value for the *last* machine (Machine ${machineCount}), you will **immediately** read all sequences back to me, in order.` : "After I give you the value for the *last* machine, I will say 'read back'. You will then read all sequences back to me, in order."}
3. After you finish reading, I will give you the next value for Machine 1.
4. 'Clear': Delete the last value I gave you.
5. 'Clear all': Delete all sequences.
Let's start with Machine 1.`;
        }
        roundsPrompt = `Let's play 'Unique Rounds Mode'.
1. We will play from Round 1 up to Round ${sequenceLength}.
2. The sequence length matches the round number (e.g., Round 3 has 3 values).
3. I will give you the values for the current round, one at a time.
4. ${isAutoplayEnabled ? `The game is **automatic**. As soon as I give you the **last value for the current round**, you will **immediately** read the full sequence for that round back to me.` : "After I give you the last value for the current round, I will say 'read back'. You will then read the full sequence for that round back to me."}
5. ${isAutoplayEnabled && isUniqueRoundsAutoClearEnabled ? "After you finish reading, you will **automatically** clear the sequence, advance to the next round, and say 'Next Round'." : (isAutoplayEnabled && !isUniqueRoundsAutoClearEnabled ? "After you finish reading, wait for me to say 'next' to clear and advance." : "After you finish reading, wait for me to say 'next' to clear and advance.")}
6. 'Repeat': Read the current round's sequence again.
7. 'Reset': Go back to Round 1.
Let's start with Round 1.`;
        const simonTextarea = document.getElementById('prompt-simon');
        const roundsTextarea = document.getElementById('prompt-unique-rounds');
        if (simonTextarea) simonTextarea.value = simonPrompt.trim();
        if (roundsTextarea) roundsTextarea.value = roundsPrompt.trim();
        const simonGroup = document.getElementById('prompt-simon-group');
        const roundsGroup = document.getElementById('prompt-unique-rounds-group');
        if (simonGroup) simonGroup.style.display = (currentMode === MODES.SIMON) ? 'block' : 'none';
        if (roundsGroup) roundsGroup.style.display = (currentMode === MODES.UNIQUE_ROUNDS) ? 'block' : 'none';
        const promptSection = document.getElementById('virtual-assistant-prompts');
        if (promptSection) {
            promptSection.classList.remove('hidden');
            if (container.querySelector('#virtual-assistant-prompts') == null) {
                container.appendChild(promptSection);
            }
        }
    }

    function openShareModal() {
        closeSettingsModal();
        if (navigator.share) {
            if (nativeShareButton) nativeShareButton.classList.remove('hidden');
        } else {
            if (nativeShareButton) nativeShareButton.classList.add('hidden');
        }
        if (copyLinkButton) {
            copyLinkButton.disabled = false;
            copyLinkButton.classList.remove('!bg-btn-control-green');
            copyLinkButton.innerHTML = `<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 011-1z"></path><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path></svg> Copy Link`;
        }
        shareModal.classList.remove('opacity-0', 'pointer-events-none');
        shareModal.querySelector('div').classList.remove('scale-90');
    }

    function closeShareModal() {
        shareModal.querySelector('div').classList.add('scale-90');
        shareModal.classList.add('opacity-0');
        setTimeout(() => shareModal.classList.add('pointer-events-none'), 300);
    }

    function updateTheme(isDark) {
        appSettings.isDarkMode = isDark;
        document.body.classList.toggle('dark', isDark);
        document.body.classList.toggle('light', !isDark);
        renderSequences();
        saveState();
    }
    function applyGlobalUiScale(scalePercent) {
        if (scalePercent < 50) scalePercent = 50;
        if (scalePercent > 150) scalePercent = 150;
        appSettings.globalUiScale = scalePercent;
        document.documentElement.style.fontSize = `${scalePercent}%`;
    }
    function updateScaleDisplay(multiplier, displayElement) {
        const percent = Math.round(multiplier * 100);
        if (displayElement) displayElement.textContent = `${percent}%`;
    }
    function updateMachinesDisplay(count, el) {
        if(el) el.textContent = count + (count > 1 ? ' Machines' : ' Machine');
    }
    function updateSequenceLengthDisplay(val, el) {
        if(el) el.textContent = val;
    }
    function updatePlaybackSpeedDisplay(val, el) {
        if(el) el.textContent = val + '%';
    }
    function updateChunkDisplay(val, el) {
        if(el) el.textContent = val;
    }
    function updateDelayDisplay(val, el) {
        if(el) el.textContent = (val / 1000).toFixed(1) + 's';
    }
    function updateShakeSensitivityDisplay(val) {
        if(shakeSensitivityDisplay) shakeSensitivityDisplay.textContent = val;
    }
    function updateFlashSensitivityDisplay(val) {
        if(flashSensitivityDisplay) flashSensitivityDisplay.textContent = val;
    }
    
    function updateAllChrome() {
        const profileSettings = getCurrentProfileSettings();
        if (!profileSettings) return;
        const newInput = profileSettings.currentInput;
        padKey9.style.display = (newInput === INPUTS.KEY9) ? 'block' : 'none';
        padKey12.style.display = (newInput === INPUTS.KEY12) ? 'block' : 'none';
        padPiano.style.display = (newInput === INPUTS.PIANO) ? 'block' : 'none';
        updateMainUIControlsVisibility();
        updateVoiceInputVisibility();
        renderSequences();
    }

    function updateVoiceInputVisibility() {
        const profileSettings = getCurrentProfileSettings();
        const isEnabled = profileSettings.isVoiceInputEnabled;
        if (allVoiceInputs) {
            allVoiceInputs.forEach(input => input.classList.toggle('hidden', !isEnabled));
        }
    }
    
    function showToast(message) {
        if (toastTimer) clearTimeout(toastTimer);
        if (!toastMessage || !toastNotification) return;
        toastMessage.textContent = message;
        toastNotification.classList.remove('opacity-0', '-translate-y-10');
        
        toastTimer = setTimeout(() => {
            toastNotification.classList.add('opacity-0', '-translate-y-10');
            toastTimer = null;
        }, 2000);
    }

    function showModal(title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel') {
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
        modalConfirm.className = 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-primary-app hover:bg-secondary-app';
        if (confirmText === 'Restore' || confirmText === 'Reset' || confirmText === 'Delete' || confirmText === 'Clear All') {
             modalConfirm.className = 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-btn-control-red hover:bg-btn-control-red-active';
        }
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

    // --- 4. CORE ---

    function vibrate(duration = 10) {
        const profileSettings = getCurrentProfileSettings();
        if (profileSettings.isHapticsEnabled && 'vibrate' in navigator) {
            try {
                navigator.vibrate(duration);
            } catch (e) {
                console.warn("Haptic feedback failed.", e);
            }
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
        const mode = profileSettings.currentMode;
        const demoButton = document.querySelector(`#pad-${profileSettings.currentInput} button[data-action="play-demo"]`);
        if (demoButton && demoButton.disabled) return;
        if (state.nextSequenceIndex === 0) return; 
        
        let lastClickTargetIndex;
        if (mode === MODES.UNIQUE_ROUNDS) {
            lastClickTargetIndex = 0;
        } else {
            lastClickTargetIndex = (state.nextSequenceIndex - 1) % profileSettings.machineCount;
        }
        
        const targetSet = state.sequences[lastClickTargetIndex];
        
        if (targetSet.length > 0) {
            targetSet.pop();
            state.nextSequenceIndex--; 
            if (mode === MODES.UNIQUE_ROUNDS) {
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
            showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel');
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
                if (currentInput === INPUTS.KEY9 && /^[1-9]$/.test(value)) {
                    addValue(value);
                } else if (currentInput === INPUTS.KEY12 && /^(?:[1-9]|1[0-2])$/.test(value)) {
                    addValue(value);
                } else if (currentInput === INPUTS.PIANO && (/^[1-5]$/.test(value) || /^[A-G]$/.test(value))) {
                    addValue(value);
                }
            }
        }
    }

    function handleRestoreDefaults() {
        appSettings = { ...DEFAULT_APP_SETTINGS };
        appSettings.profiles = {}; 
        Object.keys(PREMADE_PROFILES).forEach(id => {
            appSettings.profiles[id] = { 
                name: PREMADE_PROFILES[id].name, 
                settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] }
            };
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
    }

    // --- 5. DEMO ---

    function speak(text) {
        const profileSettings = getCurrentProfileSettings();
        if (!profileSettings.isAudioEnabled || !('speechSynthesis'in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; 
            utterance.rate = 1.2; 
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Speech synthesis failed:", error);
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
                showModal('No Sequence', 'The sequences are empty. Enter some values first!', () => closeModal(), 'OK', '');
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
                        const value = activeSequences[seqIndex][valueIndex];
                        playlist.push({ seqIndex: seqIndex, value: value });
                    }
                }
            }
        }
        if (playlist.length === 0) return;
        if (demoButton) demoButton.disabled = true;
        if (inputKeys) inputKeys.forEach(key => key.disabled = true);
        let i = 0;
        const flashDuration = 250 * (speedMultiplier > 1 ? (1/speedMultiplier) : 1); 
        const pauseDuration = currentDelayMs;

        function playNextItem() {
            if (i < playlist.length) {
                const item = playlist[i];
                const { seqIndex, value } = item;
                let key = document.querySelector(`${padSelector} button[data-value="${value}"]`);
                const seqBox = sequenceContainer.children[seqIndex];
                const originalClasses = seqBox ? seqBox.dataset.originalClasses : '';
                if (demoButton) demoButton.innerHTML = String(i + 1);
                speak(input === 'piano' ? PIANO_SPEAK_MAP[value] || value : value);
                if (key) {
                    if(input === 'piano') key.classList.add('flash');
                    else key.classList.add(flashClass);
                }
                if (seqBox && numMachines > 1) seqBox.className = 'p-4 rounded-xl shadow-md transition-all duration-200 bg-accent-app scale-[1.02] shadow-lg text-gray-900';
                const nextSeqIndex = (i + 1 < playlist.length) ? playlist[i + 1].seqIndex : -1;
                let timeBetweenItems = pauseDuration - flashDuration;
                if (numMachines > 1 && nextSeqIndex !== -1 && seqIndex !== nextSeqIndex) {
                    timeBetweenItems += profileSettings.simonInterSequenceDelay;
                }
                setTimeout(() => {
                    if (key) {
                        if(input === 'piano') key.classList.remove('flash');
                        else key.classList.remove(flashClass);
                    }
                    if (seqBox && numMachines > 1) seqBox.className = originalClasses;
                    setTimeout(playNextItem, timeBetweenItems); 
                }, flashDuration);
                i++;
            } else {
                if (demoButton) {
                    demoButton.disabled = false;
                    demoButton.innerHTML = '▶'; 
                }
                if (inputKeys) inputKeys.forEach(key => key.disabled = false);
                renderSequences();
            }
        }
        playNextItem();
    }

    function advanceToUniqueRound() {
        const state = getCurrentState();
        const profileSettings = getCurrentProfileSettings();
        state.currentRound++;
        if (state.currentRound > profileSettings.sequenceLength) {
            state.currentRound = 1;
            showModal('Complete!', `You finished all ${profileSettings.sequenceLength} rounds. Resetting to Round 1.`, () => closeModal(), 'OK', '');
        }
        renderSequences();
        saveState();
        const allKeys = document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`);
        if (allKeys) allKeys.forEach(key => key.disabled = false);
    }

    function clearUniqueRoundsSequence() {
        const state = getCurrentState();
        const sequence = state.sequences[0];
        if (sequence.length === 0) {
            advanceToUniqueRound();
            return;
        }
        if (speedDeleteInterval) clearInterval(speedDeleteInterval);
        speedDeleteInterval = null;
        function rapidDelete() {
            if (sequence.length > 0) {
                sequence.pop();
                state.nextSequenceIndex--;
                renderSequences();
            } else {
                clearInterval(speedDeleteInterval);
                speedDeleteInterval = null;
                saveState(); 
                advanceToUniqueRound(); 
            }
        }
        setTimeout(() => {
            speedDeleteInterval = setInterval(rapidDelete, SPEED_DELETE_INTERVAL_MS);
        }, 10);
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
            showModal('No Sequence', 'The sequence is empty. Enter some values first!', () => closeModal(), 'OK', '');
            if (allKeys) allKeys.forEach(key => key.disabled = false);
            return;
        }
        demoButton.disabled = true;
        if (allKeys) allKeys.forEach(key => key.disabled = true);
        let i = 0;
        const flashDuration = 250 * (speedMultiplier > 1 ? (1/speedMultiplier) : 1);
        const pauseDuration = currentDelayMs; 
        function playNextNumber() {
            if (i < sequenceToPlay.length) {
                const value = sequenceToPlay[i]; 
                let key = document.querySelector(`${padSelector} button[data-value="${value}"]`);
                demoButton.innerHTML = String(i + 1); 
                speak(input === 'piano' ? PIANO_SPEAK_MAP[value] || value : value); 
                if (key) {
                    if(input === 'piano') key.classList.add('flash');
                    else key.classList.add(flashClass);
                    setTimeout(() => {
                        if(input === 'piano') key.classList.remove('flash');
                        else key.classList.remove(flashClass);
                        setTimeout(playNextNumber, pauseDuration - flashDuration);
                    }, flashDuration); 
                } else {
                    setTimeout(playNextNumber, pauseDuration);
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

    function handleCurrentDemo() {
        const profileSettings = getCurrentProfileSettings();
        if (profileSettings.currentMode === MODES.SIMON) {
            handleSimonDemo();
        } else {
            handleUniqueRoundsDemo();
        }
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
            triggerSelect.className = 'select-input shortcut-trigger'; // CSS fix will style this
            for (const key in SHORTCUT_TRIGGERS) {
                triggerSelect.options.add(new Option(SHORTCUT_TRIGGERS[key], key));
            }
            triggerSelect.value = shortcut.trigger;
            
            const actionSelect = document.createElement('select');
            actionSelect.className = 'select-input shortcut-action'; // CSS fix will style this
            for (const key in SHORTCUT_ACTIONS) {
                actionSelect.options.add(new Option(SHORTCUT_ACTIONS[key], key));
            }
            actionSelect.value = shortcut.action;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'shortcut-delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = 'Delete Shortcut';
            
            row.appendChild(triggerSelect);
            row.appendChild(actionSelect);
            row.appendChild(deleteBtn);
            shortcutListContainer.appendChild(row);
        });
    }
    
    function handleAddShortcut() {
        const profileSettings = getCurrentProfileSettings();
        const newShortcut = {
            id: `sc_${Date.now()}`,
            trigger: 'none',
            action: 'none'
        };
        profileSettings.shortcuts.push(newShortcut);
        renderShortcutList();
    }
    
    function handleShortcutListClick(event) {
        const profileSettings = getCurrentProfileSettings();
        const target = event.target;
        
        if (target.closest('.shortcut-delete-btn')) {
            const row = target.closest('.shortcut-row');
            const shortcutId = row.dataset.id;
            profileSettings.shortcuts = profileSettings.shortcuts.filter(sc => sc.id !== shortcutId);
            renderShortcutList();
        }
        else if (target.matches('.shortcut-trigger')) {
            const row = target.closest('.shortcut-row');
            const shortcutId = row.dataset.id;
            const shortcut = profileSettings.shortcuts.find(sc => sc.id === shortcutId);
            shortcut.trigger = target.value;
        }
        else if (target.matches('.shortcut-action')) {
            const row = target.closest('.shortcut-row');
            const shortcutId = row.dataset.id;
            const shortcut = profileSettings.shortcuts.find(sc => sc.id === shortcutId);
            shortcut.action = target.value;
        }
    }
    
    function cycleProfile(direction) {
        const profileIds = Object.keys(appSettings.profiles);
        let currentIndex = profileIds.indexOf(appSettings.activeProfileId);
        currentIndex += direction;
        if (currentIndex < 0) {
            currentIndex = profileIds.length - 1;
        } else if (currentIndex >= profileIds.length) {
            currentIndex = 0;
        }
        const newProfileId = profileIds[currentIndex];
        switchActiveProfile(newProfileId);
        showToast(`Profile: ${appSettings.profiles[newProfileId].name}`);
    }
    
    /**
     * Finds and executes a shortcut for a given trigger.
     */
    function executeShortcut(triggerKey) {
        const profileSettings = getCurrentProfileSettings();
        if (!profileSettings || !profileSettings.shortcuts) return false;
        
        const shortcut = profileSettings.shortcuts.find(sc => sc.trigger === triggerKey);
        
        if (!shortcut || shortcut.action === 'none') {
            return false; // No shortcut found
        }

        vibrate(50); 
        
        switch (shortcut.action) {
            case 'play_demo':
                handleCurrentDemo();
                break;
            case 'reset_rounds':
                if (profileSettings.currentMode === MODES.UNIQUE_ROUNDS) {
                    showModal('Reset Rounds?', 'Shortcut: Are you sure you want to reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel');
                }
                break;
            case 'clear_all':
                 showModal('Clear All?', 'Shortcut: Are you sure you want to clear all sequences?', () => {
                     const state = getCurrentState();
                     state.sequences = Array.from({ length: MAX_MACHINES }, () => []);
                     state.nextSequenceIndex = 0;
                     state.currentRound = 1;
                     renderSequences();
                 }, 'Clear All', 'Cancel');
                break;
            case 'clear_last':
                handleBackspace();
                break;
            case 'toggle_autoplay':
                profileSettings.isAutoplayEnabled = !profileSettings.isAutoplayEnabled;
                if (autoplayToggle) autoplayToggle.checked = profileSettings.isAutoplayEnabled;
                if (quickAutoplayToggle) quickAutoplayToggle.checked = profileSettings.isAutoplayEnabled;
                showToast(`Autoplay: ${profileSettings.isAutoplayEnabled ? 'On' : 'Off'}`);
                break;
            case 'toggle_audio':
                profileSettings.isAudioEnabled = !profileSettings.isAudioEnabled;
                if (audioToggle) audioToggle.checked = profileSettings.isAudioEnabled;
                if (quickAudioToggle) quickAudioToggle.checked = profileSettings.isAudioEnabled;
                showToast(`Audio: ${profileSettings.isAudioEnabled ? 'On' : 'Off'}`);
                break;
            case 'toggle_haptics':
                profileSettings.isHapticsEnabled = !profileSettings.isHapticsEnabled;
                if (hapticsToggle) hapticsToggle.checked = profileSettings.isHapticsEnabled;
                showToast(`Haptics: ${profileSettings.isHapticsEnabled ? 'On' : 'Off'}`);
                break;
            case 'toggle_dark_mode':
                updateTheme(!appSettings.isDarkMode);
                if (darkModeToggle) darkModeToggle.checked = appSettings.isDarkMode;
                showToast(`Dark Mode: ${appSettings.isDarkMode ? 'On' : 'Off'}`);
                break;
            case 'open_settings':
                if (settingsModal.classList.contains('opacity-0')) { openSettingsModal(); } else { closeSettingsModal(); }
                break;
            case 'open_help':
                if (helpModal.classList.contains('opacity-0')) { openHelpModal(); } else { closeHelpModal(); }
                break;
            case 'next_profile':
                cycleProfile(1);
                break;
            case 'prev_profile':
                cycleProfile(-1);
                break;
            default:
                console.warn(`Unknown shortcut action: ${shortcut.action}`);
                return false;
        }
        
        return true;
    }

    // --- 7. SENSOR LISTENERS (Shake) ---
    
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
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                // iOS 13+
            } else {
                // Non-iOS
                window.addEventListener('devicemotion', handleShake);
            }
        } else {
            console.warn('Device Motion not supported.');
        }
        
        if ('DeviceOrientationEvent' in window) {
            // window.addEventListener('deviceorientation', handleTilt);
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

    // --- 8. FIREBASE COMMENT SECTION (v9) ---

    async function handleSubmitComment() {
        const username = commentUsername.value;
        const message = commentMessage.value;
        
        if (!username || !message) {
            showModal("Missing Info", "Please enter both a name and a message.", () => closeModal(), "OK", "");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                username: username,
                message: message,
                timestamp: serverTimestamp() // v9 server timestamp
            });
            console.log("Comment saved with ID: ", docRef.id);
            commentMessage.value = ""; // Clear the message box
            showToast("Feedback sent!");
        } catch (error) {
            console.error("Error adding document: ", error);
            showModal("Error", "Could not send your comment. Check your internet connection.", () => closeModal(), "OK", "");
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

            commentsListContainer.innerHTML = ""; // Clear the "Loading..." text
            
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
            console.error("Error getting comments: ", error);
            commentsListContainer.innerHTML = '<p class="text-center text-red-500">Error loading comments. Please check your connection.</p>';
        });
    }

    // --- 9. MAIN ---

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
        globalResizeUpBtn = document.getElementById('global-resize-up');
        globalResizeDownBtn = document.getElementById('global-resize-down');
        configSelect = document.getElementById('config-select');
        configAddBtn = document.getElementById('config-add');
        configRenameBtn = document.getElementById('config-rename');
        configDeleteBtn = document.getElementById('config-delete');
        quickAutoplayToggle = document.getElementById('quick-autoplay-toggle');
        quickAudioToggle = document.getElementById('quick-audio-toggle');
        quickOpenHelpBtn = document.getElementById('quick-open-help');
        quickOpenSettingsBtn = document.getElementById('quick-open-settings');

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

        // --- Comment Modal ---
        commentModal = document.getElementById('comment-modal');
        closeCommentModalBtn = document.getElementById('close-comment-modal');
        submitCommentBtn = document.getElementById('submit-comment-btn');
        commentUsername = document.getElementById('comment-username');
        commentMessage = document.getElementById('comment-message');
        commentsListContainer = document.getElementById('comments-list-container');
        
        // --- Camera Modal ---
        cameraModal = document.getElementById('camera-modal');
        closeCameraModalBtn = document.getElementById('close-camera-modal'); // FIXED
        openCameraModalBtn = document.getElementById('open-camera-modal-btn');
        cameraFeed = document.getElementById('camera-feed');
        cameraFeedContainer = document.getElementById('camera-feed-container');
        grid9Key = document.getElementById('grid-9key');     // NEW
        grid12Key = document.getElementById('grid-12key');   // NEW
        detectionCanvas = document.getElementById('detection-canvas');
        startCameraBtn = document.getElementById('start-camera-btn');
        startDetectionBtn = document.getElementById('start-detection-btn');
        stopDetectionBtn = document.getElementById('stop-detection-btn');
        flashSensitivitySlider = document.getElementById('flash-sensitivity-slider');
        flashSensitivityDisplay = document.getElementById('flash-sensitivity-display');

        // --- CONTROLS: Settings ---
        // Tab 1: Profile
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
        
        // Tab 2: Global
        playbackSpeedSlider = document.getElementById('playback-speed-slider');
        playbackSpeedDisplay = document.getElementById('playback-speed-display');
        showWelcomeToggle = document.getElementById('show-welcome-toggle');
        darkModeToggle = document.getElementById('dark-mode-toggle');
        uiScaleSlider = document.getElementById('ui-scale-slider');
        uiScaleDisplay = document.getElementById('ui-scale-display');
        
        // Tab 3: Shortcuts
        shortcutListContainer = document.getElementById('shortcut-list-container');
        addShortcutBtn = document.getElementById('add-shortcut-btn');
        shakeSensitivitySlider = document.getElementById('shake-sensitivity-slider');
        shakeSensitivityDisplay = document.getElementById('shake-sensitivity-display');
        
        // Tab 4: Stealth
        autoplayToggle = document.getElementById('autoplay-toggle');
        speedDeleteToggle = document.getElementById('speed-delete-toggle');
        audioToggle = document.getElementById('audio-toggle');
        voiceInputToggle = document.getElementById('voice-input-toggle');
        hapticsToggle = document.getElementById('haptics-toggle');
        autoInputSlider = document.getElementById('auto-input-slider'); // NEW

        // Pads & Footer
        padKey9 = document.getElementById('pad-key9');
        padKey12 = document.getElementById('pad-key12');
        padPiano = document.getElementById('pad-piano');
        allResetButtons = document.querySelectorAll('.reset-button');
        allVoiceInputs = document.querySelectorAll('.voice-text-input');
        allCameraMasterBtns = document.querySelectorAll('#camera-master-btn'); // NEW
        allMicMasterBtns = document.querySelectorAll('#mic-master-btn');       // NEW
    }

    function initializeListeners() {
        
        // --- MASTER SWITCH LISTENERS (NEW) ---
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#camera-master-btn')) {
                isCameraMasterOn = !isCameraMasterOn;
                updateMasterButtonStates();
            }
            if (e.target.closest('#mic-master-btn')) {
                isMicMasterOn = !isMicMasterOn;
                // TODO: Add start/stop logic for tone detection
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
            
            // --- BUTTONS ---
            if (action === 'open-settings') { openSettingsModal(); return; }
            if (action === 'open-help') { closeSettingsModal(); openHelpModal(); return; }
            if (action === 'open-share') { openShareModal(); return; }
            if (action === 'open-comments') { closeSettingsModal(); openCommentModal(); return; }
            if (action === 'open-camera') { closeSettingsModal(); openCameraModal(); return; } 
            if (action === 'copy-link') {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    button.disabled = true;
                    button.classList.add('!bg-btn-control-green');
                    button.innerHTML = `Copied!`;
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
                showModal('Restore Defaults?', 
                          'This will reset all settings and clear all saved sequences. Are you sure?', 
                          handleRestoreDefaults, 
                          'Restore', 
                          'Cancel');
                return;
            }
            if (action === 'reset-unique-rounds') {
                showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel');
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
                if (transcript && transcript.length > 0) {
                    if (event.target.dataset.input === getCurrentProfileSettings().currentInput) {
                        processVoiceTranscript(transcript);
                    }
                    event.target.value = '';
                }
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
            if(showWelcomeToggle) showWelcomeToggle.checked = appSettings.showWelcomeScreen;
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
                    if (!profileSettings) return;
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
                    if (element === flashSensitivitySlider) { 
                        updateFlashSensitivityDisplay(value);
                    }
                    if (element === autoInputSlider) { // NEW
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
            if(dontShowWelcomeToggle) dontShowWelcomeToggle.checked = !appSettings.showWelcomeScreen;
        });
        if (darkModeToggle) darkModeToggle.addEventListener('change', (e) => updateTheme(e.target.checked));
        addProfileSettingListener(uiScaleSlider, 'input', 'uiScaleMultiplier'); 
        
        // Tab 3: Shortcuts
        if (addShortcutBtn) addShortcutBtn.addEventListener('click', handleAddShortcut);
        if (shortcutListContainer) shortcutListContainer.addEventListener('change', handleShortcutListClick);
        if (shortcutListContainer) shortcutListContainer.addEventListener('click', handleShortcutListClick);
        addProfileSettingListener(shakeSensitivitySlider, 'input', 'shakeSensitivity');
        
        // Tab 4: Stealth
        addProfileSettingListener(autoplayToggle, 'change', 'isAutoplayEnabled', 'checked');
        addProfileSettingListener(speedDeleteToggle, 'change', 'isSpeedDeletingEnabled', 'checked');
        addProfileSettingListener(audioToggle, 'change', 'isAudioEnabled', 'checked');
        addProfileSettingListener(voiceInputToggle, 'change', 'isVoiceInputEnabled', 'checked');
        addProfileSettingListener(hapticsToggle, 'change', 'isHapticsEnabled', 'checked');
        addProfileSettingListener(autoInputSlider, 'input', 'autoInputMode'); // NEW

        if (closeHelp) closeHelp.addEventListener('click', closeHelpModal);
        if (closeShare) closeShare.addEventListener('click', closeShareModal); 
        
        // --- Comment Modal Listeners ---
        if (closeCommentModalBtn) closeCommentModalBtn.addEventListener('click', closeCommentModal);
        if (submitCommentBtn) submitCommentBtn.addEventListener('click', handleSubmitComment);
        
        // --- Camera Modal Listeners ---
        if (closeCameraModalBtn) closeCameraModalBtn.addEventListener('click', closeCameraModal); // FIXED
        if (startCameraBtn) startCameraBtn.addEventListener('click', startCameraStream);
        if (startDetectionBtn) startDetectionBtn.addEventListener('click', startDetection); 
        if (stopDetectionBtn) stopDetectionBtn.addEventListener('click', stopDetection); 
        addProfileSettingListener(flashSensitivitySlider, 'input', 'flashSensitivity');
        
        // --- Grid Drag/Resize Listeners ---
        const initGridDragger = (gridElement) => {
            if (!gridElement) return;
            
            let startX, startY, startLeft, startTop;
            
            const dragStart = (e) => {
                e.preventDefault(); 
                isDraggingGrid = true;
                activeCalibrationGrid = gridElement; // Set the active grid
                
                startX = e.clientX || e.touches[0].clientX;
                startY = e.clientY || e.touches[0].clientY;
                startLeft = activeCalibrationGrid.offsetLeft;
                startTop = activeCalibrationGrid.offsetTop;

                window.addEventListener('mousemove', dragMove);
                window.addEventListener('mouseup', dragEnd);
                window.addEventListener('touchmove', dragMove, { passive: false });
                window.addEventListener('touchend', dragEnd);
            };

            const dragMove = (e) => {
                if (!isDraggingGrid) return;
                e.preventDefault();
                
                const currentX = e.clientX || e.touches[0].clientX;
                const currentY = e.clientY || e.touches[0].clientY;
                const dx = currentX - startX;
                const dy = currentY - startY;
                
                const parentRect = cameraFeedContainer.getBoundingClientRect();
                const newLeft = startLeft + dx;
                const newTop = startTop + dy;

                activeCalibrationGrid.style.left = `${(newLeft / parentRect.width) * 100}%`;
                activeCalibrationGrid.style.top = `${(newTop / parentRect.height) * 100}%`;
            };

            const dragEnd = (e) => {
                if (!isDraggingGrid) return;
                isDraggingGrid = false;
                
                window.removeEventListener('mousemove', dragMove);
                window.removeEventListener('mouseup', dragEnd);
                window.removeEventListener('touchmove', dragMove);
                window.removeEventListener('touchend', dragEnd);
                
                saveGridConfig(); // Save the final position
            };
            
            gridElement.addEventListener('mousedown', dragStart);
            gridElement.addEventListener('touchstart', dragStart, { passive: false });

            const resizeObserver = new ResizeObserver(() => {
                if (!isDraggingGrid) {
                    activeCalibrationGrid = gridElement;
                    saveGridConfig();
                }
            });
            resizeObserver.observe(gridElement);
        };
        
        initGridDragger(grid9Key);
        initGridDragger(grid12Key);
        
        initSensorListeners(); // Non-permission listeners
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
        
        initializeCommentListener(); // Start listening for comments

        if (appSettings.showWelcomeScreen) {
            setTimeout(openGameSetupModal, 500); 
        }
        if (getCurrentProfileSettings().isAudioEnabled) speak(" "); 
    };

})(); // IIFE wrapper
