// ==========================================
// app.js - ACTIVE FEATURES & UI GLUE
// ==========================================

import { 
    appSettings, getCurrentProfileSettings, getCurrentState, saveState, loadState,
    updateAppSettings, getInitialState, addValue, handleBackspace, resetUniqueRoundsMode,
    renderSequences, handleCurrentDemo, showModal, closeModal, showToast, speak, vibrate,
    INPUTS, MODES, AUTO_INPUT_MODES, db, initCoreDom, PREMADE_PROFILES, 
    DEFAULT_PROFILE_SETTINGS, DEFAULT_APP_SETTINGS, VOICE_VALUE_MAP
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

// --- CONSTANTS (Local) ---
const SHAKE_BASE_THRESHOLD = 25; 
const SHAKE_TIMEOUT_MS = 500; 
const FLASH_COOLDOWN_MS = 250;
const SPEED_DELETE_INITIAL_DELAY = 250;
const SPEED_DELETE_INTERVAL_MS = 10; 

const SHORTCUT_TRIGGERS = { 
    'none': 'Select Trigger...', 'shake': 'Shake Device', 
    'longpress_backspace': 'Long Press Backspace', 'longpress_play': 'Long Press Play', 
    'longpress_settings': 'Long Press Settings', 'tilt_left': 'Tilt Left', 
    'tilt_right': 'Tilt Right', 'swipe_up': 'Swipe Up', 'swipe_down': 'Swipe Down',
    'swipe_left': 'Swipe Left', 'swipe_right': 'Swipe Right' 
};
const SHORTCUT_ACTIONS = { 
    'none': 'Select Action...', 'play_demo': 'Play Demo', 'reset_rounds': 'Reset Rounds', 
    'clear_all': 'Clear All', 'clear_last': 'Clear Last', 'toggle_autoplay': 'Toggle Autoplay',
    'toggle_audio': 'Toggle Audio', 'toggle_haptics': 'Toggle Haptics', 'toggle_dark_mode': 'Toggle Dark Mode',
    'open_settings': 'Open Settings', 'open_help': 'Open Help', 'next_profile': 'Next Profile', 'prev_profile': 'Prev Profile'
};

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

// --- INITIALIZATION ---

window.onload = function() {
    loadState();
    initCoreDom(); 
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
        const { value, action, input, copyTarget } = button.dataset;

        if (action === 'open-settings') openSettingsModal();
        else if (action === 'open-help') openHelpModal();
        else if (action === 'open-share') openShareModal();
        else if (action === 'open-comments') openCommentModal();
        else if (action === 'open-camera') openCameraModal();
        else if (action === 'restore-defaults') handleRestoreDefaults();
        else if (action === 'reset-unique-rounds') showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel', true);
        else if (action === 'play-demo' && input === getCurrentProfileSettings().currentInput) handleCurrentDemo();
        else if (value && input === getCurrentProfileSettings().currentInput) addValue(value);
        
        // Copy link special logic
        if (action === 'copy-link') {
             navigator.clipboard.writeText(window.location.href).then(() => { 
                 const originalText = button.innerHTML;
                 button.innerHTML = "Copied!";
                 setTimeout(() => button.innerHTML = originalText, 2000);
             });
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
    
    // Grid Dragger
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
    
    if (closeHelp) closeHelp.addEventListener('click', closeHelpModal);
    if (closeShare) closeShare.addEventListener('click', closeShareModal); 
    if (closeCommentModalBtn) closeCommentModalBtn.addEventListener('click', closeCommentModal);
    if (submitCommentBtn) submitCommentBtn.addEventListener('click', handleSubmitComment);
    if (closeCameraModalBtn) closeCameraModalBtn.addEventListener('click', closeCameraModal); 
    if (startCameraBtn) startCameraBtn.addEventListener('click', startCameraStream);
    if (startDetectionBtn) startDetectionBtn.addEventListener('click', startDetection); 
    if (stopDetectionBtn) stopDetectionBtn.addEventListener('click', stopDetection); 
    
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
    
    if (grid9Key) initGridDragger(grid9Key); 
    if (grid12Key) initGridDragger(grid12Key);
    
    initSensorListeners(); 
    if (!appSettings.showWelcomeScreen) {
         document.body.addEventListener('click', requestSensorPermissions, { once: true });
    }
}

// --- MINOR HELPERS ---

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
    showModal('Restore Defaults?', 
        'This will reset all settings and clear all saved sequences. Are you sure?', 
        () => {
            localStorage.clear();
            location.reload();
        }, 
        'Restore', 
        'Cancel',
        true
    );
}

function handleBackspaceStart(event) {
    event.preventDefault(); stopSpeedDeleting(); isHoldingBackspace = false; 
    initialDelayTimer = setTimeout(() => {
        isHoldingBackspace = true;
        // This function doesn't have direct access to executeShortcut, so we assume standard behavior for now
        // or export executeShortcut if needed. For basic speed delete:
        const profileSettings = getCurrentProfileSettings();
        if (profileSettings.isSpeedDeletingEnabled && profileSettings.currentMode !== MODES.UNIQUE_ROUNDS) {
            handleBackspace();
            speedDeleteInterval = setInterval(handleBackspace, SPEED_DELETE_INTERVAL_MS);
        }
    }, 250);
}

function handleBackspaceEnd() {
    if (initialDelayTimer !== null) { stopSpeedDeleting(); handleBackspace(); return; }
    stopSpeedDeleting();
    // Reset logic handled in listeners or core
}

function stopSpeedDeleting() {
    if (initialDelayTimer) clearTimeout(initialDelayTimer);
    if (speedDeleteInterval) clearInterval(speedDeleteInterval);
    initialDelayTimer = null; speedDeleteInterval = null; isHoldingBackspace = false;
}

function updateTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
}

function applyGlobalUiScale(scalePercent) {
    if (scalePercent < 50) scalePercent = 50;
    if (scalePercent > 150) scalePercent = 150;
    document.documentElement.style.fontSize = `${scalePercent}%`;
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

// --- FIREBASE COMMENT SECTION ---

async function handleSubmitComment() {
    const username = commentUsername.value;
    const message = commentMessage.value;
    
    if (!username || !message) {
        showModal("Missing Info", "Please enter both a name and a message.", () => closeModal(), "OK", "", false);
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "comments"), {
            username: username,
            message: message,
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

    const commentsQuery = query(collection(db, "comments"), orderBy("timestamp", "desc"), limit(50));

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

function initSensorListeners() {
    if ('DeviceMotionEvent' in window) {
        if (typeof DeviceMotionEvent.requestPermission !== 'function') {
            window.addEventListener('devicemotion', handleShake);
        }
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
        // Shake logic here (simplified for app.js without full shortcut engine, or export shortcut engine from core)
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
