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
        flashSensitivity: 40, // Default based on your working engine
        cameraGridConfig9: { top: '25%', left: '25%', width: '50%', height: '50%' },
        cameraGridConfig12: { top: '25%', left: '20%', width: '60%', height: '40%' }
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
        'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 200 }},
        'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }},
        'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: INPUTS.PIANO }},
        'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: MODES.UNIQUE_ROUNDS, sequenceLength: 15 }}
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
    let lastFlashTime = Array(12).fill(0);   
    let baselineBrightness = Array(12).fill(0); // REPLACES lastBrightness
    let isDraggingGrid = false;
    let isCameraMasterOn = false; 
    let isMicMasterOn = false;    

    // DOM Elements
    var sequenceContainer, customModal, modalTitle, modalMessage, modalConfirm, modalCancel;
    var shareModal, closeShare, copyLinkButton, nativeShareButton;
    var toastNotification, toastMessage; 
    var gameSetupModal, closeGameSetupModalBtn, dontShowWelcomeToggle, configSelect, configAddBtn, configRenameBtn, configDeleteBtn;
    var quickAutoplayToggle, quickAudioToggle, quickOpenHelpBtn, quickOpenSettingsBtn, globalResizeUpBtn, globalResizeDownBtn;
    var settingsModal, settingsTabNav, openHelpButton, openShareButton, closeSettings, openGameSetupFromSettings, activeProfileNameSpan, openCommentModalBtn; 
    var helpModal, helpContentContainer, helpTabNav, closeHelp;
    var commentModal, closeCommentModalBtn, submitCommentBtn, commentUsername, commentMessage, commentsListContainer;
    var cameraModal, closeCameraModalBtn, openCameraModalBtn, cameraFeed, cameraFeedContainer;
    var grid9Key, grid12Key, activeCalibrationGrid, detectionCanvas, detectionContext; 
    var startCameraBtn, startDetectionBtn, stopDetectionBtn, flashSensitivitySlider, flashSensitivityDisplay;
    var inputSelect, modeToggle, modeToggleLabel, machinesSlider, machinesDisplay;
    var sequenceLengthSlider, sequenceLengthDisplay, sequenceLengthLabel, chunkSlider, chunkDisplay, delaySlider, delayDisplay;
    var settingMultiSequenceGroup, autoclearToggle, settingAutoclear, playbackSpeedSlider, playbackSpeedDisplay;
    var showWelcomeToggle, darkModeToggle, uiScaleSlider, uiScaleDisplay, shortcutListContainer, addShortcutBtn, shakeSensitivitySlider, shakeSensitivityDisplay;
    var autoplayToggle, speedDeleteToggle, audioToggle, voiceInputToggle, hapticsToggle, autoInputSlider; 
    var padKey9, padKey12, padPiano, allVoiceInputs, allResetButtons, allCameraMasterBtns, allMicMasterBtns;    

    const getCurrentProfileSettings = () => appSettings.profiles[appSettings.activeProfileId]?.settings;
    const getCurrentState = () => appState[appSettings.activeProfileId];

    // --- SAVE/LOAD STATE ---
    function saveState() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
            localStorage.setItem(STATE_KEY, JSON.stringify(appState));
        } catch (error) { console.error("Failed to save state", error); }
    }

    function loadState() {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            const storedState = localStorage.getItem(STATE_KEY);
            if (storedSettings) {
                appSettings = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(storedSettings) };
                // Re-apply defaults to ensure new fields exist
                Object.keys(appSettings.profiles).forEach(pid => {
                    appSettings.profiles[pid].settings = { ...DEFAULT_PROFILE_SETTINGS, ...appSettings.profiles[pid].settings };
                    // Migration logic
                    if (appSettings.profiles[pid].settings.cameraGridConfig) {
                        appSettings.profiles[pid].settings.cameraGridConfig9 = { ...appSettings.profiles[pid].settings.cameraGridConfig };
                        delete appSettings.profiles[pid].settings.cameraGridConfig;
                    }
                });
            } else {
                appSettings.profiles = {};
                Object.keys(PREMADE_PROFILES).forEach(id => appSettings.profiles[id] = JSON.parse(JSON.stringify(PREMADE_PROFILES[id])));
            }
            if (storedState) appState = JSON.parse(storedState);
            Object.keys(appSettings.profiles).forEach(pid => { if (!appState[pid]) appState[pid] = getInitialState(); });
            if (!appSettings.profiles[appSettings.activeProfileId]) appSettings.activeProfileId = Object.keys(appSettings.profiles)[0] || 'profile_1';
        } catch (error) {
            console.error("State load failed, resetting", error);
            localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem(STATE_KEY);
            appSettings = JSON.parse(JSON.stringify({ ...DEFAULT_APP_SETTINGS, profiles: PREMADE_PROFILES }));
            appState = {};
            Object.keys(appSettings.profiles).forEach(pid => appState[pid] = getInitialState());
        }
    }

    function getInitialState() {
        return { sequences: Array.from({ length: MAX_MACHINES }, () => []), nextSequenceIndex: 0, currentRound: 1 };
    }

    // --- 3. UI RENDERERS ---
    function renderSequences() {
        const state = getCurrentState();
        const profileSettings = getCurrentProfileSettings();
        if (!state || !profileSettings || !sequenceContainer) return; 
        
        const { machineCount, currentMode } = profileSettings;
        const activeSequences = (currentMode === MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, machineCount);
        const currentTurnIndex = state.nextSequenceIndex % machineCount;

        sequenceContainer.innerHTML = '';
        let layoutClasses = 'gap-4 flex-grow mb-6 transition-all duration-300 pt-1 ';
        let numColumns = 5;

        if (currentMode === MODES.SIMON) {
            if (machineCount === 1) { layoutClasses += ' flex flex-col max-w-xl mx-auto'; numColumns = 5; }
            else if (machineCount === 2) { layoutClasses += ' grid grid-cols-2 max-w-3xl mx-auto'; numColumns = 4; }
            else if (machineCount === 3) { layoutClasses += ' grid grid-cols-3 max-w-4xl mx-auto'; numColumns = 4; }
            else { layoutClasses += ' grid grid-cols-4 max-w-5xl mx-auto'; numColumns = 3; }
        } else { layoutClasses += ' flex flex-col max-w-2xl mx-auto'; numColumns = 5; }
        
        sequenceContainer.className = layoutClasses;

        if (currentMode === MODES.UNIQUE_ROUNDS) {
            const roundDisplay = document.createElement('div');
            roundDisplay.className = 'text-center text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100';
            roundDisplay.textContent = `Round: ${state.currentRound} / ${profileSettings.sequenceLength}`;
            sequenceContainer.appendChild(roundDisplay);
        }
        
        const gridClass = numColumns > 0 ? `grid grid-cols-${numColumns}` : 'flex flex-wrap';
        const sizeStyle = `height: ${40 * profileSettings.uiScaleMultiplier}px; line-height: ${40 * profileSettings.uiScaleMultiplier}px; font-size: ${1.1 * profileSettings.uiScaleMultiplier}rem;`;

        activeSequences.forEach((set, index) => {
            const isCurrent = (currentTurnIndex === index && machineCount > 1 && currentMode === MODES.SIMON);
            const div = document.createElement('div');
            div.className = `p-4 rounded-xl shadow-md transition-all duration-200 ${isCurrent ? 'bg-accent-app scale-[1.02] shadow-lg text-gray-900' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'}`;
            div.dataset.originalClasses = div.className;
            div.innerHTML = `<div class="${gridClass} gap-2 min-h-[50px]">${set.map(val => `<span class="number-box bg-secondary-app text-white rounded-xl text-center shadow-sm" style="${sizeStyle}">${val}</span>`).join('')}</div>`;
            sequenceContainer.appendChild(div);
        });
    }
    
    // --- MODAL & CONFIG HANDLERS ---
    function populateConfigDropdown() {
        if (!configSelect) return;
        configSelect.innerHTML = '';
        Object.keys(appSettings.profiles).forEach(pid => {
            const opt = document.createElement('option');
            opt.value = pid; opt.textContent = appSettings.profiles[pid].name;
            configSelect.appendChild(opt);
        });
        configSelect.value = appSettings.activeProfileId;
    }
    function switchActiveProfile(newId) {
        if (appSettings.profiles[newId]) { appSettings.activeProfileId = newId; updateAllChrome(); saveState(); }
    }
    function handleConfigAdd() {
        const name = prompt("New config name:", "New Setup");
        if (name) {
            const id = `profile_${Date.now()}`;
            appSettings.profiles[id] = { name, settings: { ...DEFAULT_PROFILE_SETTINGS } };
            appState[id] = getInitialState();
            switchActiveProfile(id); populateConfigDropdown();
        }
    }
    function handleConfigRename() {
        const name = prompt("New name:", appSettings.profiles[appSettings.activeProfileId].name);
        if (name) { appSettings.profiles[appSettings.activeProfileId].name = name; populateConfigDropdown(); saveState(); }
    }
    function handleConfigDelete() {
        if (Object.keys(appSettings.profiles).length <= 1) return showModal("Cannot Delete", "Keep at least one profile.", closeModal, "OK", "");
        showModal(`Delete "${appSettings.profiles[appSettings.activeProfileId].name}"?`, "Permanent.", () => {
            delete appSettings.profiles[appSettings.activeProfileId]; delete appState[appSettings.activeProfileId];
            switchActiveProfile(Object.keys(appSettings.profiles)[0]); populateConfigDropdown();
        }, "Delete", "Cancel");
    }

    // --- MODAL VISIBILITY ---
    function openGameSetupModal() { populateConfigDropdown(); gameSetupModal.classList.remove('opacity-0', 'pointer-events-none'); gameSetupModal.querySelector('div').classList.remove('scale-90'); }
    function closeGameSetupModal() { 
        gameSetupModal.querySelector('div').classList.add('scale-90'); gameSetupModal.classList.add('opacity-0'); setTimeout(() => gameSetupModal.classList.add('pointer-events-none'), 300); 
        saveState();
    }
    function openSettingsModal() {
        updateSettingsControls(); switchSettingsTab('profile');
        settingsModal.classList.remove('opacity-0', 'pointer-events-none'); settingsModal.querySelector('div').classList.remove('scale-90');
    }
    function closeSettingsModal() { saveState(); settingsModal.querySelector('div').classList.add('scale-90'); settingsModal.classList.add('opacity-0'); setTimeout(() => settingsModal.classList.add('pointer-events-none'), 300); updateAllChrome(); }
    
    function updateSettingsControls() {
        const s = getCurrentProfileSettings();
        inputSelect.value = s.currentInput;
        modeToggle.checked = (s.currentMode === MODES.UNIQUE_ROUNDS);
        machinesSlider.value = s.machineCount; updateMachinesDisplay(s.machineCount, machinesDisplay);
        sequenceLengthSlider.value = s.sequenceLength; updateSequenceLengthDisplay(s.sequenceLength, sequenceLengthDisplay);
        chunkSlider.value = s.simonChunkSize; updateChunkDisplay(s.simonChunkSize, chunkDisplay);
        delaySlider.value = s.simonInterSequenceDelay; updateDelayDisplay(s.simonInterSequenceDelay, delayDisplay);
        autoclearToggle.checked = s.isUniqueRoundsAutoClearEnabled;
        playbackSpeedSlider.value = appSettings.playbackSpeed * 100; updatePlaybackSpeedDisplay(appSettings.playbackSpeed * 100, playbackSpeedDisplay);
        showWelcomeToggle.checked = appSettings.showWelcomeScreen; darkModeToggle.checked = appSettings.isDarkMode;
        uiScaleSlider.value = s.uiScaleMultiplier * 100; updateScaleDisplay(s.uiScaleMultiplier, uiScaleDisplay);
        shakeSensitivitySlider.value = s.shakeSensitivity; updateShakeSensitivityDisplay(s.shakeSensitivity);
        autoplayToggle.checked = s.isAutoplayEnabled; speedDeleteToggle.checked = s.isSpeedDeletingEnabled;
        audioToggle.checked = s.isAudioEnabled; voiceInputToggle.checked = s.isVoiceInputEnabled; hapticsToggle.checked = s.isHapticsEnabled;
        autoInputSlider.value = s.autoInputMode;
        renderShortcutList(); updateSettingsModalVisibility();
    }
    
    function updateSettingsModalVisibility() {
        const s = getCurrentProfileSettings();
        sequenceLengthLabel.textContent = (s.currentMode === MODES.SIMON) ? '4. Sequence Length' : '4. Unique Rounds';
        modeToggleLabel.textContent = (s.currentMode === MODES.SIMON) ? 'Off: Simon Says' : 'On: Unique Rounds';
        machinesSlider.disabled = (s.currentMode === MODES.UNIQUE_ROUNDS);
        settingAutoclear.style.display = (s.currentMode === MODES.UNIQUE_ROUNDS) ? 'flex' : 'none';
        settingMultiSequenceGroup.style.display = (s.currentMode === MODES.SIMON && s.machineCount > 1) ? 'block' : 'none';
    }

    function switchSettingsTab(tabId) {
        settingsModal.querySelectorAll('.settings-tab-content').forEach(t => t.classList.add('hidden'));
        settingsTabNav.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active-tab'));
        document.getElementById(`settings-tab-${tabId}`).classList.remove('hidden');
        settingsTabNav.querySelector(`button[data-tab="${tabId}"]`).classList.add('active-tab');
    }

    // --- CAMERA ENGINE (ADAPTIVE BASELINE / V3 LOGIC) ---
    function openCameraModal() {
        const s = getCurrentProfileSettings();
        if (s.currentInput === INPUTS.KEY12) {
            activeCalibrationGrid = grid12Key;
            Object.assign(grid12Key.style, s.cameraGridConfig12, {display: 'grid'});
            if(grid9Key) grid9Key.style.display = 'none';
        } else {
            activeCalibrationGrid = grid9Key;
            Object.assign(grid9Key.style, s.cameraGridConfig9, {display: 'grid'});
            if(grid12Key) grid12Key.style.display = 'none';
        }
        if (flashSensitivitySlider) { flashSensitivitySlider.value = s.flashSensitivity; updateFlashSensitivityDisplay(s.flashSensitivity); }
        startCameraBtn.style.display = cameraStream ? 'none' : 'block';
        startDetectionBtn.style.display = cameraStream ? 'block' : 'none';
        stopDetectionBtn.style.display = 'none';
        isDetecting = false;
        cameraModal.classList.remove('opacity-0', 'pointer-events-none'); cameraModal.querySelector('div').classList.remove('scale-90');
    }
    
    function closeCameraModal() {
        stopDetection(); stopCameraStream();
        cameraModal.querySelector('div').classList.add('scale-90'); cameraModal.classList.add('opacity-0'); setTimeout(() => cameraModal.classList.add('pointer-events-none'), 300);
    }

    async function startCameraStream() {
        if (cameraStream) stopCameraStream();
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: {ideal:640}, height: {ideal:480} } });
            cameraFeed.srcObject = cameraStream;
            cameraFeed.onloadedmetadata = () => { if (detectionCanvas) { detectionCanvas.width = cameraFeed.videoWidth; detectionCanvas.height = cameraFeed.videoHeight; } };
            cameraFeed.play();
            startCameraBtn.style.display = 'none'; startDetectionBtn.style.display = 'block'; stopDetectionBtn.style.display = 'none';
        } catch (err) { showModal("Camera Error", err.message, closeModal, "OK", ""); }
    }
    function stopCameraStream() {
        stopDetection();
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
        cameraFeed.srcObject = null;
        startCameraBtn.style.display = 'block'; startDetectionBtn.style.display = 'none'; stopDetectionBtn.style.display = 'none';
    }

    function startDetection() {
        if (isDetecting || !cameraStream || !detectionCanvas) return;
        isDetecting = true;
        // Reset Baseline to 0 (will adapt quickly in loop)
        baselineBrightness.fill(0); 
        lastFlashTime.fill(0);
        startDetectionBtn.style.display = 'none'; stopDetectionBtn.style.display = 'block';
        detectionContext = detectionCanvas.getContext('2d', { willReadFrequently: true });
        detectionLoopId = requestAnimationFrame(runDetectionLoop);
    }

    function stopDetection() {
        isDetecting = false;
        if (detectionLoopId) cancelAnimationFrame(detectionLoopId);
        startDetectionBtn.style.display = 'block'; stopDetectionBtn.style.display = 'none';
        if(activeCalibrationGrid) Array.from(activeCalibrationGrid.children).forEach(c => c.classList.remove('flash-detected'));
    }

    // THE CORE V3 ENGINE LOGIC
    function runDetectionLoop() {
        if (!isDetecting || !detectionContext || !cameraFeed || !activeCalibrationGrid) { isDetecting = false; return; }

        detectionContext.drawImage(cameraFeed, 0, 0, detectionCanvas.width, detectionCanvas.height);
        let imageData;
        try { imageData = detectionContext.getImageData(0, 0, detectionCanvas.width, detectionCanvas.height); } 
        catch (e) { detectionLoopId = requestAnimationFrame(runDetectionLoop); return; }
        
        const feedRect = cameraFeed.getBoundingClientRect();
        const gridRect = activeCalibrationGrid.getBoundingClientRect();
        const scaleX = detectionCanvas.width / feedRect.width;
        const scaleY = detectionCanvas.height / feedRect.height;

        // Map Grid to Canvas
        const gridPixelX = (gridRect.left - feedRect.left) * scaleX;
        const gridPixelY = (gridRect.top - feedRect.top) * scaleY;
        const gridPixelW = gridRect.width * scaleX;
        const gridPixelH = gridRect.height * scaleY;

        const s = getCurrentProfileSettings();
        const is12Key = (s.currentInput === INPUTS.KEY12);
        const numCols = is12Key ? 4 : 3;
        const numRows = is12Key ? 3 : 3;
        const numBoxes = numCols * numRows;
        const boxW = gridPixelW / numCols;
        const boxH = gridPixelH / numRows;

        const now = Date.now();
        const sensitivity = s.flashSensitivity || 40; 

        for (let i = 0; i < numBoxes; i++) {
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            
            // Sample Center of Box
            const centerX = Math.floor(gridPixelX + (col * boxW) + (boxW / 2));
            const centerY = Math.floor(gridPixelY + (row * boxH) + (boxH / 2));

            // Safety Check
            if (centerX < 0 || centerX >= detectionCanvas.width || centerY < 0 || centerY >= detectionCanvas.height) continue;

            const idx = (centerY * detectionCanvas.width + centerX) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx+1];
            const b = imageData.data[idx+2];
            
            // Current Brightness
            const currentBrightness = (r + g + b) / 3;

            // Init baseline if 0 (first frame)
            if (baselineBrightness[i] === 0) baselineBrightness[i] = currentBrightness;

            // Adaptive Baseline Logic (from V3)
            const delta = Math.abs(currentBrightness - baselineBrightness[i]);

            if (delta > sensitivity && (now - lastFlashTime[i] > FLASH_COOLDOWN_MS)) {
                const val = String(i + 1);
                // Flash Detected!
                if (isCameraMasterOn) {
                    addValue(val);
                    console.log(`Flash ${val} DETECTED!`);
                }
                lastFlashTime[i] = now;
                const boxEl = activeCalibrationGrid.children[i];
                if (boxEl) { boxEl.classList.add('flash-detected'); setTimeout(() => boxEl.classList.remove('flash-detected'), 150); }
            }

            // Rolling Average Update (The V3 "Magic")
            // 80% old history, 20% new data. Adapts to slow changes, rejects fast ones.
            baselineBrightness[i] = (baselineBrightness[i] * 0.8) + (currentBrightness * 0.2);
        }

        if (isDetecting) detectionLoopId = requestAnimationFrame(runDetectionLoop);
    }

    function saveGridConfig() {
        if (!activeCalibrationGrid || !cameraFeedContainer) return;
        const p = getCurrentProfileSettings();
        const cRect = cameraFeedContainer.getBoundingClientRect();
        const gRect = activeCalibrationGrid.getBoundingClientRect();
        const cfg = {
            top: `${((gRect.top - cRect.top) / cRect.height) * 100}%`,
            left: `${((gRect.left - cRect.left) / cRect.width) * 100}%`,
            width: `${(gRect.width / cRect.width) * 100}%`,
            height: `${(gRect.height / cRect.height) * 100}%`
        };
        if (p.currentInput === INPUTS.KEY12) p.cameraGridConfig12 = cfg; else p.cameraGridConfig9 = cfg;
        saveState();
    }

    // --- 4. CORE APP LOGIC ---
    function vibrate(dur = 10) { if (getCurrentProfileSettings().isHapticsEnabled && navigator.vibrate) navigator.vibrate(dur); }
    function speak(text) { 
        if (!getCurrentProfileSettings().isAudioEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.rate = 1.2; window.speechSynthesis.speak(u);
    }

    function addValue(val) {
        vibrate();
        const s = getCurrentState(); const p = getCurrentProfileSettings();
        const targetIdx = (p.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : s.nextSequenceIndex % p.machineCount;
        
        // Max length check
        if (p.currentMode === MODES.UNIQUE_ROUNDS && s.sequences[0].length >= s.currentRound) return;
        if (p.currentMode === MODES.SIMON && s.sequences[targetIdx] && s.sequences[targetIdx].length >= p.sequenceLength) return;

        s.sequences[targetIdx].push(val);
        s.nextSequenceIndex++;
        renderSequences();
        
        // Auto-actions
        if (p.isAutoplayEnabled) {
            if (p.currentMode === MODES.UNIQUE_ROUNDS && s.sequences[0].length === s.currentRound) {
                disableKeys(true); setTimeout(handleUniqueRoundsDemo, 100);
            } else if (p.currentMode === MODES.SIMON) {
                const filledIdx = (s.nextSequenceIndex - 1) % p.machineCount;
                if (filledIdx === p.machineCount - 1) setTimeout(handleSimonDemo, 100);
            }
        }
        saveState();
    }
    
    function disableKeys(disable) {
        const p = getCurrentProfileSettings();
        const keys = document.querySelectorAll(`#pad-${p.currentInput} button[data-value]`);
        keys.forEach(k => k.disabled = disable);
    }

    function handleBackspace() {
        vibrate(20);
        const s = getCurrentState(); const p = getCurrentProfileSettings();
        if (s.nextSequenceIndex === 0) return;
        const targetIdx = (p.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : (s.nextSequenceIndex - 1) % p.machineCount;
        if (s.sequences[targetIdx].length > 0) {
            s.sequences[targetIdx].pop(); s.nextSequenceIndex--;
            if(p.currentMode === MODES.UNIQUE_ROUNDS) disableKeys(false);
            renderSequences(); saveState();
        }
    }

    function handleCurrentDemo() {
        const p = getCurrentProfileSettings();
        if (p.currentMode === MODES.SIMON) handleSimonDemo(); else handleUniqueRoundsDemo();
    }

    function handleSimonDemo() {
        const s = getCurrentState(); const p = getCurrentProfileSettings();
        const input = p.currentInput; const pad = `#pad-${input}`;
        const flashCls = input === INPUTS.PIANO ? 'flash' : (input === INPUTS.KEY9 ? 'key9-flash' : 'key12-flash');
        const demoBtn = document.querySelector(`${pad} button[data-action="play-demo"]`);
        const keys = document.querySelectorAll(`${pad} button[data-value]`);
        const activeSeqs = s.sequences.slice(0, p.machineCount);
        const maxLen = Math.max(...activeSeqs.map(seq => seq.length));

        if (maxLen === 0 || (demoBtn && demoBtn.disabled)) {
             if (!demoBtn.disabled) showModal('No Sequence', 'Empty.', closeModal, 'OK', ''); return;
        }

        const playlist = [];
        const chunkSize = (p.machineCount > 1) ? p.simonChunkSize : maxLen;
        const numChunks = Math.ceil(maxLen / chunkSize);
        for (let c = 0; c < numChunks; c++) {
            for (let m = 0; m < p.machineCount; m++) {
                for (let k = 0; k < chunkSize; k++) {
                    const idx = (c * chunkSize) + k;
                    if (idx < activeSeqs[m].length) playlist.push({ mIndex: m, val: activeSeqs[m][idx] });
                }
            }
        }
        
        if (!playlist.length) return;
        demoBtn.disabled = true; keys.forEach(k => k.disabled = true);
        
        let i = 0;
        const speed = appSettings.playbackSpeed;
        const flashDur = 250 / (speed > 1 ? speed : 1);
        const pauseDur = DEMO_DELAY_BASE_MS / speed;

        function playNext() {
            if (i < playlist.length) {
                const { mIndex, val } = playlist[i];
                const key = document.querySelector(`${pad} button[data-value="${val}"]`);
                const seqBox = sequenceContainer.children[mIndex];
                const origCls = seqBox ? seqBox.dataset.originalClasses : '';
                
                demoBtn.innerHTML = String(i+1);
                speak(input === INPUTS.PIANO ? PIANO_SPEAK_MAP[val] || val : val);
                
                if (key) key.classList.add(flashCls);
                if (seqBox && p.machineCount > 1) seqBox.className = 'p-4 rounded-xl shadow-lg bg-accent-app scale-[1.02] text-gray-900';

                const nextM = (i + 1 < playlist.length) ? playlist[i + 1].mIndex : -1;
                let delay = pauseDur - flashDur;
                if (p.machineCount > 1 && nextM !== -1 && mIndex !== nextM) delay += p.simonInterSequenceDelay;

                setTimeout(() => {
                    if (key) key.classList.remove(flashCls);
                    if (seqBox && p.machineCount > 1) seqBox.className = origCls;
                    setTimeout(playNext, delay);
                }, flashDur);
                i++;
            } else {
                demoBtn.disabled = false; demoBtn.innerHTML = '▶';
                keys.forEach(k => k.disabled = false); renderSequences();
            }
        }
        playNext();
    }

    function handleUniqueRoundsDemo() {
        const s = getCurrentState(); const p = getCurrentProfileSettings();
        const input = p.currentInput; const pad = `#pad-${input}`;
        const flashCls = input === INPUTS.PIANO ? 'flash' : (input === INPUTS.KEY9 ? 'key9-flash' : 'key12-flash');
        const seq = s.sequences[0];
        const demoBtn = document.querySelector(`${pad} button[data-action="play-demo"]`);
        const keys = document.querySelectorAll(`${pad} button[data-value]`);
        
        if (!seq.length || (demoBtn.disabled && !p.isUniqueRoundsAutoClearEnabled)) {
            if (!demoBtn.disabled) showModal('No Sequence', 'Empty.', closeModal, 'OK', ''); return;
        }

        demoBtn.disabled = true; keys.forEach(k => k.disabled = true);
        let i = 0;
        const speed = appSettings.playbackSpeed;
        const flashDur = 250 / (speed > 1 ? speed : 1);
        const pauseDur = DEMO_DELAY_BASE_MS / speed;

        function playNext() {
            if (i < seq.length) {
                const val = seq[i];
                const key = document.querySelector(`${pad} button[data-value="${val}"]`);
                demoBtn.innerHTML = String(i+1);
                speak(input === INPUTS.PIANO ? PIANO_SPEAK_MAP[val] || val : val);
                if (key) {
                    key.classList.add(flashCls);
                    setTimeout(() => { key.classList.remove(flashCls); setTimeout(playNext, pauseDur - flashDur); }, flashDur);
                } else setTimeout(playNext, pauseDur);
                i++;
            } else {
                demoBtn.disabled = false; demoBtn.innerHTML = '▶';
                if (p.isUniqueRoundsAutoClearEnabled) setTimeout(clearUniqueRoundsSequence, 300);
                else keys.forEach(k => k.disabled = false);
            }
        }
        playNext();
    }
    
    function clearUniqueRoundsSequence() {
        const s = getCurrentState();
        if (speedDeleteInterval) clearInterval(speedDeleteInterval);
        speedDeleteInterval = setInterval(() => {
            if (s.sequences[0].length > 0) { s.sequences[0].pop(); s.nextSequenceIndex--; renderSequences(); }
            else { 
                clearInterval(speedDeleteInterval); 
                s.currentRound++; 
                if (s.currentRound > getCurrentProfileSettings().sequenceLength) { s.currentRound = 1; showModal("Complete!", "Resetting to Round 1.", closeModal, "OK", ""); }
                renderSequences(); saveState(); disableKeys(false); 
            }
        }, SPEED_DELETE_INTERVAL_MS);
    }

    // --- 5. SHORTCUTS & SENSORS ---
    function renderShortcutList() {
        if (!shortcutListContainer) return;
        shortcutListContainer.innerHTML = '';
        getCurrentProfileSettings().shortcuts.forEach(sc => {
            const row = document.createElement('div'); row.className = 'shortcut-row'; row.dataset.id = sc.id;
            const trig = document.createElement('select'); trig.className = 'select-input shortcut-trigger';
            Object.keys(SHORTCUT_TRIGGERS).forEach(k => trig.add(new Option(SHORTCUT_TRIGGERS[k], k))); trig.value = sc.trigger;
            const act = document.createElement('select'); act.className = 'select-input shortcut-action';
            Object.keys(SHORTCUT_ACTIONS).forEach(k => act.add(new Option(SHORTCUT_ACTIONS[k], k))); act.value = sc.action;
            const del = document.createElement('button'); del.className = 'shortcut-delete-btn'; del.innerHTML = '&times;';
            row.append(trig, act, del); shortcutListContainer.appendChild(row);
        });
    }
    function executeShortcut(trig) {
        const s = getCurrentProfileSettings();
        const sc = s.shortcuts.find(x => x.trigger === trig);
        if (!sc || sc.action === 'none') return false;
        vibrate(50);
        switch (sc.action) {
            case 'play_demo': handleCurrentDemo(); break;
            case 'reset_rounds': if (s.currentMode === MODES.UNIQUE_ROUNDS) showModal('Reset?', 'Reset to R1?', () => { getCurrentState().currentRound = 1; getCurrentState().sequences[0] = []; renderSequences(); saveState(); }, 'Reset', 'Cancel'); break;
            case 'clear_all': showModal('Clear All?', 'Reset all?', () => { Object.assign(getCurrentState(), getInitialState()); renderSequences(); saveState(); }, 'Clear', 'Cancel'); break;
            case 'clear_last': handleBackspace(); break;
            case 'toggle_autoplay': s.isAutoplayEnabled = !s.isAutoplayEnabled; updateSettingsControls(); showToast(`Autoplay: ${s.isAutoplayEnabled?'On':'Off'}`); break;
            case 'toggle_audio': s.isAudioEnabled = !s.isAudioEnabled; updateSettingsControls(); showToast(`Audio: ${s.isAudioEnabled?'On':'Off'}`); break;
            case 'toggle_haptics': s.isHapticsEnabled = !s.isHapticsEnabled; updateSettingsControls(); showToast(`Haptics: ${s.isHapticsEnabled?'On':'Off'}`); break;
            case 'toggle_dark_mode': updateTheme(!appSettings.isDarkMode); showToast(`Dark Mode: ${appSettings.isDarkMode?'On':'Off'}`); break;
            case 'open_settings': if(settingsModal.classList.contains('opacity-0')) openSettingsModal(); else closeSettingsModal(); break;
            case 'open_help': if(helpModal.classList.contains('opacity-0')) { closeSettingsModal(); setTimeout(() => helpModal.classList.remove('opacity-0', 'pointer-events-none'), 100); } else helpModal.classList.add('opacity-0'); break;
            case 'next_profile': cycleProfile(1); break;
            case 'prev_profile': cycleProfile(-1); break;
        }
        saveState(); return true;
    }
    function cycleProfile(dir) {
        const ids = Object.keys(appSettings.profiles);
        let idx = ids.indexOf(appSettings.activeProfileId) + dir;
        if (idx < 0) idx = ids.length - 1; if (idx >= ids.length) idx = 0;
        switchActiveProfile(ids[idx]); showToast(`Profile: ${appSettings.profiles[ids[idx]].name}`);
    }
    function handleShake(e) {
        const now = Date.now(); if (now - lastShakeTime < SHAKE_TIMEOUT_MS) return;
        const thresh = SHAKE_BASE_THRESHOLD - (getCurrentProfileSettings().shakeSensitivity * 1.2);
        const acc = e.accelerationIncludingGravity;
        if (acc && (Math.abs(acc.x) > thresh || Math.abs(acc.y) > thresh)) { lastShakeTime = now; executeShortcut('shake'); }
    }

    // --- 6. FIREBASE COMMENTS ---
    async function handleSubmitComment() {
        const u = commentUsername.value; const m = commentMessage.value;
        if (!u || !m) return showModal("Error", "Name/Message missing.", closeModal, "OK", "");
        try { await addDoc(collection(db, "comments"), { username: u, message: m, timestamp: serverTimestamp() }); commentMessage.value = ""; showToast("Sent!"); }
        catch (e) { showModal("Error", "Failed to send.", closeModal, "OK", ""); }
    }
    function initCommentListener() {
        if (!commentsListContainer) return;
        onSnapshot(query(collection(db, "comments"), orderBy("timestamp", "desc"), limit(50)), snap => {
            commentsListContainer.innerHTML = snap.empty ? '<p class="text-gray-500">No feedback yet.</p>' : '';
            snap.forEach(doc => {
                const d = doc.data();
                const el = document.createElement('div'); el.className = "p-3 mb-2 rounded-lg bg-white dark:bg-gray-700 shadow";
                el.innerHTML = `<p class="font-bold text-primary-app">${d.username}</p><p class="text-gray-900 dark:text-white">${d.message}</p>`;
                commentsListContainer.appendChild(el);
            });
        });
    }

    // --- 7. INITIALIZATION ---
    function assignDomElements() {
        sequenceContainer = document.getElementById('sequence-container');
        customModal = document.getElementById('custom-modal'); modalTitle = document.getElementById('modal-title'); modalMessage = document.getElementById('modal-message'); modalConfirm = document.getElementById('modal-confirm'); modalCancel = document.getElementById('modal-cancel');
        shareModal = document.getElementById('share-modal'); closeShare = document.getElementById('close-share'); copyLinkButton = document.getElementById('copy-link-button'); nativeShareButton = document.getElementById('native-share-button');
        toastNotification = document.getElementById('toast-notification'); toastMessage = document.getElementById('toast-message');
        gameSetupModal = document.getElementById('game-setup-modal'); closeGameSetupModalBtn = document.getElementById('close-game-setup-modal'); dontShowWelcomeToggle = document.getElementById('dont-show-welcome-toggle');
        configSelect = document.getElementById('config-select'); configAddBtn = document.getElementById('config-add'); configRenameBtn = document.getElementById('config-rename'); configDeleteBtn = document.getElementById('config-delete');
        quickAutoplayToggle = document.getElementById('quick-autoplay-toggle'); quickAudioToggle = document.getElementById('quick-audio-toggle'); quickOpenHelpBtn = document.getElementById('quick-open-help'); quickOpenSettingsBtn = document.getElementById('quick-open-settings');
        globalResizeUpBtn = document.getElementById('global-resize-up'); globalResizeDownBtn = document.getElementById('global-resize-down');
        settingsModal = document.getElementById('settings-modal'); settingsTabNav = document.getElementById('settings-tab-nav'); closeSettings = document.getElementById('close-settings'); openGameSetupFromSettings = document.getElementById('open-game-setup-from-settings');
        openShareButton = document.getElementById('open-share-button'); openHelpButton = document.getElementById('open-help-button'); openCommentModalBtn = document.getElementById('open-comment-modal'); activeProfileNameSpan = document.getElementById('active-profile-name');
        helpModal = document.getElementById('help-modal'); helpContentContainer = document.getElementById('help-content-container'); helpTabNav = document.getElementById('help-tab-nav'); closeHelp = document.getElementById('close-help');
        commentModal = document.getElementById('comment-modal'); closeCommentModalBtn = document.getElementById('close-comment-modal'); submitCommentBtn = document.getElementById('submit-comment-btn'); commentUsername = document.getElementById('comment-username'); commentMessage = document.getElementById('comment-message'); commentsListContainer = document.getElementById('comments-list-container');
        cameraModal = document.getElementById('camera-modal'); closeCameraModalBtn = document.getElementById('close-camera-modal'); openCameraModalBtn = document.getElementById('open-camera-modal-btn'); cameraFeed = document.getElementById('camera-feed'); cameraFeedContainer = document.getElementById('camera-feed-container');
        grid9Key = document.getElementById('grid-9key'); grid12Key = document.getElementById('grid-12key'); detectionCanvas = document.getElementById('detection-canvas');
        startCameraBtn = document.getElementById('start-camera-btn'); startDetectionBtn = document.getElementById('start-detection-btn'); stopDetectionBtn = document.getElementById('stop-detection-btn'); flashSensitivitySlider = document.getElementById('flash-sensitivity-slider'); flashSensitivityDisplay = document.getElementById('flash-sensitivity-display');
        
        // Controls
        inputSelect = document.getElementById('input-select'); modeToggle = document.getElementById('mode-toggle'); modeToggleLabel = document.getElementById('mode-toggle-label');
        machinesSlider = document.getElementById('machines-slider'); machinesDisplay = document.getElementById('machines-display');
        sequenceLengthSlider = document.getElementById('sequence-length-slider'); sequenceLengthDisplay = document.getElementById('sequence-length-display'); sequenceLengthLabel = document.getElementById('sequence-length-label');
        chunkSlider = document.getElementById('chunk-slider'); chunkDisplay = document.getElementById('chunk-display');
        delaySlider = document.getElementById('delay-slider'); delayDisplay = document.getElementById('delay-display');
        settingMultiSequenceGroup = document.getElementById('setting-multi-sequence-group'); autoclearToggle = document.getElementById('autoclear-toggle'); settingAutoclear = document.getElementById('setting-autoclear');
        playbackSpeedSlider = document.getElementById('playback-speed-slider'); playbackSpeedDisplay = document.getElementById('playback-speed-display');
        showWelcomeToggle = document.getElementById('show-welcome-toggle'); darkModeToggle = document.getElementById('dark-mode-toggle'); uiScaleSlider = document.getElementById('ui-scale-slider'); uiScaleDisplay = document.getElementById('ui-scale-display');
        shortcutListContainer = document.getElementById('shortcut-list-container'); addShortcutBtn = document.getElementById('add-shortcut-btn'); shakeSensitivitySlider = document.getElementById('shake-sensitivity-slider'); shakeSensitivityDisplay = document.getElementById('shake-sensitivity-display');
        autoplayToggle = document.getElementById('autoplay-toggle'); speedDeleteToggle = document.getElementById('speed-delete-toggle');
        audioToggle = document.getElementById('audio-toggle'); voiceInputToggle = document.getElementById('voice-input-toggle'); hapticsToggle = document.getElementById('haptics-toggle'); autoInputSlider = document.getElementById('auto-input-slider');
        
        padKey9 = document.getElementById('pad-key9'); padKey12 = document.getElementById('pad-key12'); padPiano = document.getElementById('pad-piano');
        allVoiceInputs = document.querySelectorAll('.voice-text-input'); allResetButtons = document.querySelectorAll('.reset-button');
        allCameraMasterBtns = document.querySelectorAll('#camera-master-btn'); allMicMasterBtns = document.querySelectorAll('#mic-master-btn');
    }

    function initListeners() {
        document.body.addEventListener('click', (e) => {
            if(e.target.closest('#camera-master-btn')) { isCameraMasterOn = !isCameraMasterOn; updateMasterButtonStates(); }
            if(e.target.closest('#mic-master-btn')) { isMicMasterOn = !isMicMasterOn; updateMasterButtonStates(); }
        });
        document.addEventListener('click', e => {
            const btn = e.target.closest('button'); if(!btn) return;
            const { action, value } = btn.dataset;
            if(action === 'open-settings') openSettingsModal();
            else if(action === 'open-help') openHelpModal();
            else if(action === 'open-share') { closeSettingsModal(); if(shareModal) shareModal.classList.remove('opacity-0', 'pointer-events-none'); }
            else if(action === 'open-comments') openCommentModalBtn.click();
            else if(action === 'open-camera') openCameraModal();
            else if(action === 'copy-link') { navigator.clipboard.writeText(window.location.href); btn.innerHTML = 'Copied!'; setTimeout(()=>btn.innerHTML='Copy Link', 2000); }
            else if(action === 'restore-defaults') showModal('Restore?', 'Factory Reset?', () => { localStorage.clear(); location.reload(); }, 'Restore', 'Cancel');
            else if(action === 'reset-unique-rounds') executeShortcut('reset_rounds');
            else if(action === 'play-demo') handleCurrentDemo();
            else if(value && getCurrentProfileSettings().currentInput === btn.dataset.input) addValue(value);
        });
        
        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            b.addEventListener('mousedown', () => { stopSpeedDeleting(); initialDelayTimer = setTimeout(() => { isHoldingBackspace=true; if(!executeShortcut('longpress_backspace')) speedDeleteInterval=setInterval(handleBackspace, SPEED_DELETE_INTERVAL_MS); }, SPEED_DELETE_INITIAL_DELAY); });
            b.addEventListener('mouseup', () => { clearTimeout(initialDelayTimer); clearInterval(speedDeleteInterval); if(!isHoldingBackspace) handleBackspace(); isHoldingBackspace=false; });
            b.addEventListener('mouseleave', () => { clearTimeout(initialDelayTimer); clearInterval(speedDeleteInterval); isHoldingBackspace=false; });
        });

        if(closeGameSetupModalBtn) closeGameSetupModalBtn.onclick = () => { closeGameSetupModal(); if(DeviceMotionEvent && DeviceMotionEvent.requestPermission) DeviceMotionEvent.requestPermission(); };
        if(configSelect) configSelect.onchange = (e) => switchActiveProfile(e.target.value);
        if(configAddBtn) configAddBtn.onclick = handleConfigAdd; if(configRenameBtn) configRenameBtn.onclick = handleConfigRename; if(configDeleteBtn) configDeleteBtn.onclick = handleConfigDelete;
        if(quickOpenHelpBtn) quickOpenHelpBtn.onclick = () => { closeGameSetupModal(); openHelpModal(); };
        if(quickOpenSettingsBtn) quickOpenSettingsBtn.onclick = () => { closeGameSetupModal(); openSettingsModal(); };
        if(closeSettings) closeSettings.onclick = closeSettingsModal; if(closeHelp) closeHelp.onclick = () => helpModal.classList.add('opacity-0'); if(closeShare) closeShare.onclick = () => shareModal.classList.add('opacity-0');
        if(settingsTabNav) settingsTabNav.onclick = (e) => { const b=e.target.closest('button'); if(b) switchSettingsTab(b.dataset.tab); };
        if(openGameSetupFromSettings) openGameSetupFromSettings.onclick = () => { closeSettingsModal(); openGameSetupModal(); };
        
        if(allVoiceInputs) allVoiceInputs.forEach(v => v.oninput = (e) => { if(e.target.value) { processVoiceTranscript(e.target.value); e.target.value=''; } });
        if(closeCommentModalBtn) closeCommentModalBtn.onclick = () => commentModal.classList.add('opacity-0');
        if(submitCommentBtn) submitCommentBtn.onclick = handleSubmitComment;
        
        if(closeCameraModalBtn) closeCameraModalBtn.onclick = closeCameraModal;
        if(startCameraBtn) startCameraBtn.onclick = startCameraStream;
        if(startDetectionBtn) startDetectionBtn.onclick = startDetection;
        if(stopDetectionBtn) stopDetectionBtn.onclick = stopDetection;

        // Range Sliders
        [machinesSlider, sequenceLengthSlider, chunkSlider, delaySlider, playbackSpeedSlider, uiScaleSlider, shakeSensitivitySlider, flashSensitivitySlider, autoInputSlider].forEach(el => {
            if(el) el.addEventListener('input', updateSettingsControls); // Re-use update for simplicity, optimize if needed
        });

        // Grid Dragging
        [grid9Key, grid12Key].forEach(el => {
            if(!el) return;
            let startX, startY, startL, startT;
            const dragStart = e => { e.preventDefault(); isDraggingGrid=true; activeCalibrationGrid=el; startX=e.clientX||e.touches[0].clientX; startY=e.clientY||e.touches[0].clientY; startL=el.offsetLeft; startT=el.offsetTop; window.addEventListener('mousemove', dragMove); window.addEventListener('mouseup', dragEnd); window.addEventListener('touchmove', dragMove, {passive:false}); window.addEventListener('touchend', dragEnd); };
            const dragMove = e => { if(!isDraggingGrid)return; e.preventDefault(); const cx=e.clientX||e.touches[0].clientX; const cy=e.clientY||e.touches[0].clientY; const pRect=cameraFeedContainer.getBoundingClientRect(); el.style.left = `${((startL + cx - startX)/pRect.width)*100}%`; el.style.top = `${((startT + cy - startY)/pRect.height)*100}%`; };
            const dragEnd = () => { isDraggingGrid=false; saveGridConfig(); window.removeEventListener('mousemove', dragMove); window.removeEventListener('mouseup', dragEnd); window.removeEventListener('touchmove', dragMove); window.removeEventListener('touchend', dragEnd); };
            el.addEventListener('mousedown', dragStart); el.addEventListener('touchstart', dragStart, {passive:false});
        });

        if(window.DeviceMotionEvent) window.addEventListener('devicemotion', handleShake);
    }

    function updateAllChrome() {
        const s = getCurrentProfileSettings();
        padKey9.style.display = (s.currentInput === INPUTS.KEY9) ? 'block' : 'none';
        padKey12.style.display = (s.currentInput === INPUTS.KEY12) ? 'block' : 'none';
        padPiano.style.display = (s.currentInput === INPUTS.PIANO) ? 'block' : 'none';
        updateMasterButtonStates();
        renderSequences();
    }
    function updateMasterButtonStates() {
        allCameraMasterBtns.forEach(b => b.classList.toggle('master-active', isCameraMasterOn));
        allMicMasterBtns.forEach(b => b.classList.toggle('master-active', isMicMasterOn));
    }
    function updateMachinesDisplay(v, el){ if(el) el.textContent = v + (v > 1 ? ' Machines' : ' Machine'); }
    function updateSequenceLengthDisplay(v, el){ if(el) el.textContent = v; }
    function updateChunkDisplay(v, el){ if(el) el.textContent = v; }
    function updateDelayDisplay(v, el){ if(el) el.textContent = (v/1000).toFixed(1)+'s'; }
    function updatePlaybackSpeedDisplay(v, el){ if(el) el.textContent = v+'%'; }
    function updateScaleDisplay(v, el){ if(el) el.textContent = Math.round(v*100)+'%'; }
    function updateShakeSensitivityDisplay(v){ if(shakeSensitivityDisplay) shakeSensitivityDisplay.textContent = v; }
    function updateFlashSensitivityDisplay(v){ if(flashSensitivityDisplay) flashSensitivityDisplay.textContent = v; }
    function updateTheme(isDark) { appSettings.isDarkMode = isDark; document.body.classList.toggle('dark', isDark); document.body.classList.toggle('light', !isDark); saveState(); }
    function showToast(msg) { if(toastMessage){ toastMessage.textContent=msg; toastNotification.classList.remove('opacity-0', '-translate-y-10'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toastNotification.classList.add('opacity-0', '-translate-y-10'), 2000); } }
    function showModal(t, m, cb, txt1, txt2) { 
        modalTitle.textContent=t; modalMessage.textContent=m; 
        modalConfirm.textContent=txt1; modalConfirm.onclick=()=>{cb();customModal.classList.add('opacity-0');}; 
        modalCancel.textContent=txt2; modalCancel.style.display=txt2?'inline-block':'none'; modalCancel.onclick=()=>customModal.classList.add('opacity-0');
        customModal.classList.remove('opacity-0', 'pointer-events-none'); customModal.querySelector('div').classList.remove('scale-90');
    }
    function closeModal() { customModal.classList.add('opacity-0'); }
    function processVoiceTranscript(t) {
        const p = getCurrentProfileSettings();
        t.toLowerCase().replace(/[\.,]/g, '').split(' ').forEach(w => {
            let v = VOICE_VALUE_MAP[w];
            if (!v) { if(/^[1-9]$/.test(w) || /^(1[0-2])$/.test(w)) v=w; else if(/^[A-G]$/.test(w.toUpperCase()) || /^[1-5]$/.test(w)) v=w.toUpperCase(); }
            if(v && ((p.currentInput===INPUTS.KEY9 && /^[1-9]$/.test(v)) || (p.currentInput===INPUTS.KEY12 && /^(?:[1-9]|1[0-2])$/.test(v)) || (p.currentInput===INPUTS.PIANO && (/^[1-5]$/.test(v)||/^[A-G]$/.test(v))))) addValue(v);
        });
    }

    window.onload = function() {
        loadState(); assignDomElements();
        updateTheme(appSettings.isDarkMode); document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`;
        initListeners(); updateAllChrome(); initCommentListener();
        if(appSettings.showWelcomeScreen) setTimeout(openGameSetupModal, 500);
        if(getCurrentProfileSettings().isAudioEnabled) speak(" ");
    };

})();