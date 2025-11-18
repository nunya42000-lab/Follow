// ==========================================
// app.js - ACTIVE FEATURES (Camera/Mic)
// ==========================================

import { 
    appSettings, getCurrentProfileSettings, getCurrentState, saveState, loadState,
    updateAppSettings, getInitialState, addValue, handleBackspace, resetUniqueRoundsMode,
    renderSequences, handleCurrentDemo, showModal, closeModal, showToast, speak, vibrate,
    INPUTS, MODES, AUTO_INPUT_MODES, db, initCoreDom, PREMADE_PROFILES, DEFAULT_PROFILE_SETTINGS, DEFAULT_APP_SETTINGS
} from './core.js';

import { 
    collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- STATE ---
let cameraStream = null;
let isDetecting = false;
let detectionLoopId = null;
let lastFlashTime = Array(12).fill(0);
let lastBrightness = Array(12).fill(0); 
let isDraggingGrid = false;
let isCameraMasterOn = false; 
let isMicMasterOn = false;    
let initialDelayTimer = null;
let speedDeleteInterval = null;
let isHoldingBackspace = false;
let lastShakeTime = 0;
// These are re-declared here so app.js can use them locally
const SHAKE_BASE_THRESHOLD = 25; 
const SHAKE_TIMEOUT_MS = 500; 
const FLASH_COOLDOWN_MS = 250;
const SPEED_DELETE_INITIAL_DELAY = 250;
const SPEED_DELETE_INTERVAL_MS = 10; 

// --- DOM ELEMENTS ---
let cameraModal, closeCameraModalBtn, openCameraModalBtn, cameraFeed, cameraFeedContainer;
let grid9Key, grid12Key, activeCalibrationGrid, detectionCanvas, detectionContext;
let startCameraBtn, startDetectionBtn, stopDetectionBtn;
let flashSensitivitySlider, flashSensitivityDisplay;
let commentModal, closeCommentModalBtn, submitCommentBtn, commentUsername, commentMessage, commentsListContainer;
let gameSetupModal, closeGameSetupModalBtn, dontShowWelcomeToggle;
let configSelect, configAddBtn, configRenameBtn, configDeleteBtn;
let settingsModal, settingsTabNav, openHelpButton, openShareButton, openCommentModalBtn, closeSettings, openGameSetupFromSettings;
let helpModal, helpContentContainer, helpTabNav, closeHelp;
let shareModal, closeShare, copyLinkButton, nativeShareButton;
let autoInputSlider;
// Controls
let inputSelect, modeToggle, modeToggleLabel, machinesSlider, machinesDisplay;
let sequenceLengthSlider, sequenceLengthDisplay, sequenceLengthLabel;
let chunkSlider, chunkDisplay, delaySlider, delayDisplay, settingMultiSequenceGroup, autoclearToggle, settingAutoclear;
let playbackSpeedSlider, playbackSpeedDisplay, showWelcomeToggle, darkModeToggle, showConfirmationsToggle, uiScaleSlider, uiScaleDisplay;
let shortcutListContainer, addShortcutBtn, shakeSensitivitySlider, shakeSensitivityDisplay;
let autoplayToggle, speedDeleteToggle, audioToggle, voiceInputToggle, hapticsToggle;
let padKey9, padKey12, padPiano, allVoiceInputs, allResetButtons, allCameraMasterBtns, allMicMasterBtns;
let quickAutoplayToggle, quickAudioToggle, quickOpenHelpBtn, quickOpenSettingsBtn;
let globalResizeUpBtn, globalResizeDownBtn;
let activeProfileNameSpan;

const SHORTCUT_TRIGGERS = { 'none': 'Select Trigger...', 'shake': 'Shake Device', 'longpress_backspace': 'Long Press Backspace', 'longpress_play': 'Long Press Play', 'longpress_settings': 'Long Press Settings' };
const SHORTCUT_ACTIONS = { 'none': 'Select Action...', 'play_demo': 'Play Demo', 'reset_rounds': 'Reset Rounds', 'clear_all': 'Clear All', 'clear_last': 'Clear Last' };
const VOICE_VALUE_MAP = { 'one': '1', 'two': '2', 'to': '2', 'three': '3', 'four': '4', 'for': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10' };

// --- INITIALIZATION ---

window.onload = function() {
    loadState();
    initCoreDom(); // Initialize modal elements in core
    assignDomElements();
    
    const settings = getCurrentProfileSettings();
    if (settings) {
        updateMainUIControlsVisibility();
        renderSequences();
    }

    updateTheme(appSettings.isDarkMode);
    applyGlobalUiScale(appSettings.globalUiScale);
    
    initializeListeners();
    initializeCommentListener();

    if (appSettings.showWelcomeScreen) {
        setTimeout(openGameSetupModal, 500);
    }
    if (settings?.isAudioEnabled) speak(" ");
};

// --- LISTENERS ---

function initializeListeners() {
    // Master Switch
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#camera-master-btn')) { isCameraMasterOn = !isCameraMasterOn; updateMasterButtonStates(); }
        if (e.target.closest('#mic-master-btn')) { isMicMasterOn = !isMicMasterOn; updateMasterButtonStates(); }
    });

    // Global Clicks
    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const { value, action, input } = button.dataset;

        if (action === 'open-settings') openSettingsModal();
        else if (action === 'open-help') openHelpModal();
        else if (action === 'open-share') openShareModal();
        else if (action === 'open-comments') openCommentModal();
        else if (action === 'open-camera') openCameraModal();
        else if (action === 'restore-defaults') handleRestoreDefaults();
        else if (action === 'reset-unique-rounds') showModal('Reset?', 'Reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel');
        else if (action === 'play-demo' && input === getCurrentProfileSettings().currentInput) handleCurrentDemo();
        else if (value && input === getCurrentProfileSettings().currentInput) addValue(value);
        
        // Copy link special logic
        if (action === 'copy-link') {
             navigator.clipboard.writeText(window.location.href).then(() => { button.innerHTML = "Copied!"; });
        }
    });

    // Backspace Logic
    document.querySelectorAll('button[data-action="backspace"]').forEach(btn => {
        btn.addEventListener('mousedown', handleBackspaceStart);
        btn.addEventListener('mouseup', handleBackspaceEnd);
        btn.addEventListener('mouseleave', stopSpeedDeleting);
        btn.addEventListener('touchstart', handleBackspaceStart, { passive: false });
        btn.addEventListener('touchend', handleBackspaceEnd);
    });
    
    // Voice Inputs
    document.querySelectorAll('.voice-text-input').forEach(input => {
        input.addEventListener('input', (event) => {
            const transcript = event.target.value;
            if (transcript) processVoiceTranscript(transcript);
            event.target.value = '';
        });
    });
    
    // Modal Controls
    if (closeGameSetupModalBtn) closeGameSetupModalBtn.addEventListener('click', () => { closeGameSetupModal(); requestSensorPermissions(); });
    if (closeSettings) closeSettings.addEventListener('click', closeSettingsModal);
    if (closeHelp) closeHelp.addEventListener('click', closeHelpModal);
    if (closeShare) closeShare.addEventListener('click', closeShareModal);
    if (closeCommentModalBtn) closeCommentModalBtn.addEventListener('click', closeCommentModal);
    if (submitCommentBtn) submitCommentBtn.addEventListener('click', handleSubmitComment);
    
    // Camera Controls
    if (closeCameraModalBtn) closeCameraModalBtn.addEventListener('click', closeCameraModal);
    if (startCameraBtn) startCameraBtn.addEventListener('click', startCameraStream);
    if (startDetectionBtn) startDetectionBtn.addEventListener('click', startDetection);
    if (stopDetectionBtn) stopDetectionBtn.addEventListener('click', stopDetection);
    
    // Grid Dragger (Updated with fix)
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
            if (!isDraggingGrid) return; e.preventDefault();
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
        gridElement.addEventListener('mousedown', dragStart); gridElement.addEventListener('touchstart', dragStart, { passive: false });
        gridElement.addEventListener('mouseup', () => saveGridConfig()); gridElement.addEventListener('touchend', () => saveGridConfig());
    };
    if(grid9Key) initGridDragger(grid9Key); 
    if(grid12Key) initGridDragger(grid12Key);
    
    setupSettingsListeners();
    initSensorListeners();
}

// --- CAMERA & DETECTION LOGIC ---

function openCameraModal() {
    if (!cameraModal) return;
    const profileSettings = getCurrentProfileSettings();
    
    if (profileSettings.currentInput === INPUTS.KEY12) {
        activeCalibrationGrid = grid12Key;
        applyGridConfig(grid12Key, profileSettings.cameraGridConfig12);
        grid9Key.style.display = 'none'; grid12Key.style.display = 'grid';
    } else { 
        activeCalibrationGrid = grid9Key;
        applyGridConfig(grid9Key, profileSettings.cameraGridConfig9);
        grid12Key.style.display = 'none'; grid9Key.style.display = 'grid';
    }
    
    if (flashSensitivitySlider) {
        flashSensitivitySlider.value = profileSettings.flashSensitivity;
        flashSensitivityDisplay.textContent = profileSettings.flashSensitivity;
    }
    if (cameraStream) {
         startCameraBtn.style.display = 'none'; startDetectionBtn.style.display = 'block'; stopDetectionBtn.style.display = 'none';
    } else {
         startCameraBtn.style.display = 'block'; startDetectionBtn.style.display = 'none'; stopDetectionBtn.style.display = 'none';
    }
    isDetecting = false;
    cameraModal.classList.remove('opacity-0', 'pointer-events-none');
    cameraModal.querySelector('div').classList.remove('scale-90');
}

function closeCameraModal() {
    stopDetection(); stopCameraStream();
    cameraModal.querySelector('div').classList.add('scale-90');
    cameraModal.classList.add('opacity-0');
    setTimeout(() => cameraModal.classList.add('pointer-events-none'), 300);
}

function applyGridConfig(grid, config) {
    if(!grid || !config) return;
    grid.style.top = config.top; grid.style.left = config.left; grid.style.width = config.width; grid.style.height = config.height;
}

function saveGridConfig() {
    if (!activeCalibrationGrid || !cameraFeedContainer) return;
    const rect = activeCalibrationGrid.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return; // Anti-shrink
    const containerRect = cameraFeedContainer.getBoundingClientRect();
    
    const config = {
        top: `${((rect.top - containerRect.top) / containerRect.height) * 100}%`,
        left: `${((rect.left - containerRect.left) / containerRect.width) * 100}%`,
        width: `${(rect.width / containerRect.width) * 100}%`,
        height: `${(rect.height / containerRect.height) * 100}%`
    };
    
    const profileSettings = getCurrentProfileSettings();
    if (profileSettings.currentInput === INPUTS.KEY12) profileSettings.cameraGridConfig12 = config;
    else profileSettings.cameraGridConfig9 = config;
    saveState();
}

async function startCameraStream() {
    if (cameraStream) stopCameraStream();
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        cameraStream = stream;
        cameraFeed.srcObject = stream;
        cameraFeed.onloadedmetadata = () => {
             if (detectionCanvas) { detectionCanvas.width = cameraFeed.videoWidth; detectionCanvas.height = cameraFeed.videoHeight; }
        };
        cameraFeed.play();
        startCameraBtn.style.display = 'none'; startDetectionBtn.style.display = 'block';
    } catch (e) { showModal("Error", "Camera access failed.", () => closeModal()); }
}

function stopCameraStream() {
    stopDetection();
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
    if(cameraFeed) cameraFeed.srcObject = null;
    startCameraBtn.style.display = 'block'; startDetectionBtn.style.display = 'none'; stopDetectionBtn.style.display = 'none';
}

function startDetection() {
    isDetecting = true;
    lastBrightness.fill(0); lastFlashTime.fill(0);
    startDetectionBtn.style.display = 'none'; stopDetectionBtn.style.display = 'block';
    if (detectionCanvas) detectionContext = detectionCanvas.getContext('2d', { willReadFrequently: true });
    detectionLoopId = requestAnimationFrame(runDetectionLoop);
}

function stopDetection() {
    isDetecting = false;
    if (detectionLoopId) cancelAnimationFrame(detectionLoopId);
    startDetectionBtn.style.display = 'block'; stopDetectionBtn.style.display = 'none';
    if (activeCalibrationGrid) {
        for (let i = 0; i < activeCalibrationGrid.children.length; i++) activeCalibrationGrid.children[i].classList.remove('flash-detected');
    }
}

function runDetectionLoop() {
    if (!isDetecting || !detectionContext || !cameraFeed || !activeCalibrationGrid) { isDetecting = false; return; }
    detectionContext.drawImage(cameraFeed, 0, 0, detectionCanvas.width, detectionCanvas.height);
    let imageData;
    try { imageData = detectionContext.getImageData(0, 0, detectionCanvas.width, detectionCanvas.height); } catch (e) { detectionLoopId = requestAnimationFrame(runDetectionLoop); return; }
    
    const feedRect = cameraFeed.getBoundingClientRect();
    const gridRect = activeCalibrationGrid.getBoundingClientRect();
    const scaleX = detectionCanvas.width / feedRect.width;
    const scaleY = detectionCanvas.height / feedRect.height;

    const gridPixelX = (gridRect.left - feedRect.left) * scaleX;
    const gridPixelY = (gridRect.top - feedRect.top) * scaleY;
    const gridPixelWidth = gridRect.width * scaleX;
    const gridPixelHeight = gridRect.height * scaleY;
    
    const profileSettings = getCurrentProfileSettings();
    const is12Key = (profileSettings.currentInput === INPUTS.KEY12);
    const numCols = is12Key ? 4 : 3;
    const numRows = is12Key ? 3 : 3;
    const numBoxes = numCols * numRows;
    const boxPixelWidth = gridPixelWidth / numCols;
    const boxPixelHeight = gridPixelHeight / numRows;
    const now = Date.now();
    const sensitivity = profileSettings.flashSensitivity;

    for (let i = 0; i < numBoxes; i++) {
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        const boxX = gridPixelX + (col * boxPixelWidth);
        const boxY = gridPixelY + (row * boxPixelHeight);
        const currentBrightness = getAverageBrightness(imageData, boxX, boxY, boxPixelWidth, boxPixelHeight);
        const delta = currentBrightness - lastBrightness[i];
        
        if (delta > sensitivity && (now - lastFlashTime[i] > FLASH_COOLDOWN_MS)) {
            const value = String(i + 1);
            if (isCameraMasterOn) addValue(value);
            lastFlashTime[i] = now;
            const boxEl = activeCalibrationGrid.children[i];
            if (boxEl) {
                boxEl.classList.add('flash-detected');
                setTimeout(() => boxEl.classList.remove('flash-detected'), 150);
            }
        }
        lastBrightness[i] = currentBrightness;
    }
    if (isDetecting) detectionLoopId = requestAnimationFrame(runDetectionLoop);
}

function getAverageBrightness(imageData, x, y, width, height) {
    let sum = 0, count = 0;
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(imageData.width, Math.ceil(x + width));
    const endY = Math.min(imageData.height, Math.ceil(y + height));

    for (let row = startY; row < endY; row++) {
        for (let col = startX; col < endX; col++) {
            const index = (row * imageData.width + col) * 4;
            const r = imageData.data[index], g = imageData.data[index + 1], b = imageData.data[index + 2];
            sum += (r + g + b) / 3;
            count++;
        }
    }
    return (count > 0) ? (sum / count) : 0;
}

// --- UI HELPERS & DOM ---

function assignDomElements() {
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

    shareModal = document.getElementById('share-modal');
    closeShare = document.getElementById('close-share');
    copyLinkButton = document.getElementById('copy-link-button');
    nativeShareButton = document.getElementById('native-share-button');

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

function updateMainUIControlsVisibility() {
    const settings = getCurrentProfileSettings();
    if (!settings) return;
    
    allResetButtons.forEach(btn => {
        btn.style.display = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 'block' : 'none';
    });
    
    const mode = settings.autoInputMode;
    allCameraMasterBtns.forEach(btn => btn.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.PATTERN));
    allMicMasterBtns.forEach(btn => btn.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.TONE));
    
    updateMasterButtonStates();
}

function updateMasterButtonStates() {
    allCameraMasterBtns.forEach(btn => btn.classList.toggle('master-active', isCameraMasterOn));
    allMicMasterBtns.forEach(btn => btn.classList.toggle('master-active', isMicMasterOn));
}

function setupSettingsListeners() {
    const addProfileSettingListener = (element, eventType, settingKey, valueType = 'value') => {
        if (element) {
            element.addEventListener(eventType, (e) => {
                const profileSettings = getCurrentProfileSettings();
                let value = (valueType === 'checked') ? e.target.checked : ((element.type === 'range') ? parseInt(e.target.value) : e.target.value);
                profileSettings[settingKey] = value;
                
                if (element === machinesSlider) updateMachinesDisplay(value, machinesDisplay);
                if (element === sequenceLengthSlider) updateSequenceLengthDisplay(value, sequenceLengthDisplay);
                if (element === chunkSlider) updateChunkDisplay(value, chunkDisplay);
                if (element === delaySlider) updateDelayDisplay(value, delayDisplay);
                if (element === modeToggle) profileSettings.currentMode = value ? MODES.UNIQUE_ROUNDS : MODES.SIMON;
                if (element === uiScaleSlider) { value = value / 100.0; profileSettings[settingKey] = value; updateScaleDisplay(value, uiScaleDisplay); renderSequences(); }
                if (element === shakeSensitivitySlider) updateShakeSensitivityDisplay(value);
                if (element === flashSensitivitySlider) updateFlashSensitivityDisplay(value);
                if (element === autoInputSlider) { profileSettings.autoInputMode = String(value); updateMainUIControlsVisibility(); }
                updateSettingsModalVisibility();
            });
        }
    };

    addProfileSettingListener(inputSelect, 'change', 'currentInput');
    addProfileSettingListener(modeToggle, 'change', 'currentMode', 'checked');
    addProfileSettingListener(machinesSlider, 'input', 'machineCount');
    addProfileSettingListener(sequenceLengthSlider, 'input', 'sequenceLength');
    addProfileSettingListener(chunkSlider, 'input', 'simonChunkSize');
    addProfileSettingListener(delaySlider, 'input', 'simonInterSequenceDelay');
    addProfileSettingListener(autoclearToggle, 'change', 'isUniqueRoundsAutoClearEnabled', 'checked');
    addProfileSettingListener(uiScaleSlider, 'input', 'uiScaleMultiplier'); 
    addProfileSettingListener(shakeSensitivitySlider, 'input', 'shakeSensitivity');
    addProfileSettingListener(autoplayToggle, 'change', 'isAutoplayEnabled', 'checked');
    addProfileSettingListener(speedDeleteToggle, 'change', 'isSpeedDeletingEnabled', 'checked');
    addProfileSettingListener(audioToggle, 'change', 'isAudioEnabled', 'checked');
    addProfileSettingListener(voiceInputToggle, 'change', 'isVoiceInputEnabled', 'checked');
    addProfileSettingListener(hapticsToggle, 'change', 'isHapticsEnabled', 'checked');
    addProfileSettingListener(autoInputSlider, 'input', 'autoInputMode'); 
    addProfileSettingListener(flashSensitivitySlider, 'input', 'flashSensitivity');
    
    if (showConfirmationsToggle) showConfirmationsToggle.addEventListener('change', (e) => { appSettings.isConfirmationsEnabled = e.target.checked; saveState(); });
    if (playbackSpeedSlider) playbackSpeedSlider.addEventListener('input', (e) => { appSettings.playbackSpeed = parseInt(e.target.value) / 100.0; updatePlaybackSpeedDisplay(parseInt(e.target.value), playbackSpeedDisplay); });
    if (showWelcomeToggle) showWelcomeToggle.addEventListener('change', (e) => { appSettings.showWelcomeScreen = e.target.checked; saveState(); });
    if (darkModeToggle) darkModeToggle.addEventListener('change', (e) => updateTheme(e.target.checked));
    if (addShortcutBtn) addShortcutBtn.addEventListener('click', handleAddShortcut);
    if (shortcutListContainer) shortcutListContainer.addEventListener('click', handleShortcutListClick);
    
    if (configSelect) configSelect.addEventListener('change', (e) => switchActiveProfile(e.target.value));
    if (configAddBtn) configAddBtn.addEventListener('click', handleConfigAdd);
    if (configRenameBtn) configRenameBtn.addEventListener('click', handleConfigRename);
    if (configDeleteBtn) configDeleteBtn.addEventListener('click', handleConfigDelete);
    if (quickOpenHelpBtn) quickOpenHelpBtn.addEventListener('click', () => { closeGameSetupModal(); openHelpModal(); });
    if (quickOpenSettingsBtn) quickOpenSettingsBtn.addEventListener('click', () => { closeGameSetupModal(); openSettingsModal(); });
}

// --- MINOR HELPERS ---
function processVoiceTranscript(text) { /* Standard voice logic if needed */ }
function handleRestoreDefaults() {
    showModal('Restore Defaults?', 
        'Reset all settings? This cannot be undone.', 
        () => {
            // (Logic would be imported from core, but handled here for UI refresh)
            // For simplicity, we reload page or manually trigger core restore
            localStorage.clear();
            location.reload();
        }, 
        'Restore', 'Cancel'
    );
}
function handleBackspaceStart(e) {
    e.preventDefault(); stopSpeedDeleting(); isHoldingBackspace = false; 
    initialDelayTimer = setTimeout(() => {
        isHoldingBackspace = true;
        // Check shortcut logic here
        if (getCurrentProfileSettings().isSpeedDeletingEnabled) {
            handleBackspace();
            speedDeleteInterval = setInterval(handleBackspace, SPEED_DELETE_INTERVAL_MS);
        }
    }, SPEED_DELETE_INITIAL_DELAY);
}
function handleBackspaceEnd(e) {
    if (initialDelayTimer !== null) { stopSpeedDeleting(); handleBackspace(); return; }
    stopSpeedDeleting();
    // Reset Check handled in core logic usually
}
function stopSpeedDeleting() {
    if (initialDelayTimer) clearTimeout(initialDelayTimer);
    if (speedDeleteInterval) clearInterval(speedDeleteInterval);
    initialDelayTimer = null; speedDeleteInterval = null; isHoldingBackspace = false;
}
function updateTheme(isDark) { document.body.classList.toggle('dark', isDark); document.body.classList.toggle('light', !isDark); }
function applyGlobalUiScale(scale) { document.documentElement.style.fontSize = `${scale}%`; }

// Helpers for display updates (local to app.js UI)
function updateMachinesDisplay(val, el) { if(el) el.textContent = val + (val > 1 ? ' Machines' : ' Machine'); }
function updateSequenceLengthDisplay(val, el) { if(el) el.textContent = val; }
function updatePlaybackSpeedDisplay(val, el) { if(el) el.textContent = val + '%'; }
function updateChunkDisplay(val, el) { if(el) el.textContent = val; }
function updateDelayDisplay(val, el) { if(el) el.textContent = (val / 1000).toFixed(1) + 's'; }
function updateShakeSensitivityDisplay(val) { if(shakeSensitivityDisplay) shakeSensitivityDisplay.textContent = val; }
function updateFlashSensitivityDisplay(val) { if(flashSensitivityDisplay) flashSensitivityDisplay.textContent = val; }
