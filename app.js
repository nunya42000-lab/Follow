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
    const SHAKE_BASE_THRESHOLD = 25; 
    const SHAKE_TIMEOUT_MS = 500; 
    const GLOBAL_DEBOUNCE_MS = 250; // From your snippet

    const SETTINGS_KEY = 'followMeAppSettings_v8'; 
    const STATE_KEY = 'followMeAppState_v8';

    const INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
    const MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };
    const AUTO_INPUT_MODES = { OFF: '0', TONE: '1', PATTERN: '2' }; 

    const SHORTCUT_TRIGGERS = {
        'none': 'Select Trigger...',
        'shake': 'Shake Device (Experimental)',
        'longpress_backspace': 'Long Press Backspace',
        'tilt_left': 'Tilt Left (Experimental)',
        'tilt_right': 'Tilt Right (Experimental)',
    };
    
    const SHORTCUT_ACTIONS = {
        'none': 'Select Action...',
        'play_demo': 'Play Demo',
        'reset_rounds': 'Reset Rounds',
        'clear_all': 'Clear All',
        'toggle_autoplay': 'Toggle Autoplay',
        'toggle_audio': 'Toggle Audio',
        'open_settings': 'Open/Close Settings',
    };

    const PIANO_SPEAK_MAP = { 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' };
    const VOICE_VALUE_MAP = { 'one': '1', 'two': '2', 'to': '2', 'three': '3', 'four': '4', 'for': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10', 'eleven': '11', 'twelve': '12', 'see': 'C', 'dee': 'D', 'e': 'E', 'eff': 'F', 'gee': 'G', 'eh': 'A', 'be': 'B', 'c': 'C', 'd': 'D', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B' };

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
    let isHoldingBackspace = false;
    let lastShakeTime = 0; 
    let toastTimer = null; 
    
    // --- CAMERA STATE (Updated for new Engine) ---
    let cameraStream = null;
    let isDetecting = false;
    let detectionLoopId = null;
    let baselineData = Array(12).fill(0); // Added
    let lastHitTime = 0; // Added
    let isDraggingGrid = false;
    let isCameraMasterOn = false; 
    let isMicMasterOn = false;    
    let activeCalibrationGrid = null; 
    let detectionContext = null;

    // DOM Element Variables
    var sequenceContainer = null;
    var customModal = null, modalTitle = null, modalMessage = null, modalConfirm = null, modalCancel = null;
    var shareModal = null, closeShare = null, copyLinkButton = null, nativeShareButton = null;
    var toastNotification = null, toastMessage = null; 
    
    // MODAL: Game Setup
    var gameSetupModal = null, closeGameSetupModalBtn = null, dontShowWelcomeToggle = null;
    var configSelect = null, configAddBtn = null, configRenameBtn = null, configDeleteBtn = null;
    var quickAutoplayToggle = null, quickAudioToggle = null;
    var quickOpenHelpBtn = null, quickOpenSettingsBtn = null;
    var globalResizeUpBtn = null, globalResizeDownBtn = null;
    
    // MODAL: Settings
    var settingsModal = null, settingsTabNav = null, openHelpButton = null, openShareButton = null, closeSettings = null, openGameSetupFromSettings = null;
    var activeProfileNameSpan = null, openCommentModalBtn = null; 
    
    // MODAL: Help & Comments
    var helpModal = null, helpContentContainer = null, helpTabNav = null, closeHelp = null;
    var commentModal = null, closeCommentModalBtn = null, submitCommentBtn = null, commentUsername = null, commentMessage = null, commentsListContainer = null;
    
    // MODAL: Camera
    var cameraModal = null, closeCameraModalBtn = null, openCameraModalBtn = null; 
    var cameraFeed = null, cameraFeedContainer = null;
    var grid9Key = null, grid12Key = null; 
    var detectionCanvas = null; 
    var startCameraBtn = null, startDetectionBtn = null, stopDetectionBtn = null;
    var flashSensitivitySlider = null, flashSensitivityDisplay = null;

    // CONTROLS
    var inputSelect = null, modeToggle = null, modeToggleLabel = null;
    var machinesSlider = null, machinesDisplay = null;
    var sequenceLengthSlider = null, sequenceLengthDisplay = null, sequenceLengthLabel = null;
    var chunkSlider = null, chunkDisplay = null;
    var delaySlider = null, delayDisplay = null;
    var settingMultiSequenceGroup = null, autoclearToggle = null, settingAutoclear = null;
    var playbackSpeedSlider = null, playbackSpeedDisplay = null;
    var showWelcomeToggle = null, darkModeToggle = null;
    var uiScaleSlider = null, uiScaleDisplay = null;
    var shortcutListContainer = null, addShortcutBtn = null;
    var shakeSensitivitySlider = null, shakeSensitivityDisplay = null;
    var autoplayToggle = null, speedDeleteToggle = null, audioToggle = null, voiceInputToggle = null, hapticsToggle = null, autoInputSlider = null; 

    // FOOTER
    var padKey9 = null, padKey12 = null, padPiano = null;
    var allVoiceInputs = null, allResetButtons = null, allCameraMasterBtns = null, allMicMasterBtns = null;    

    const getCurrentProfileSettings = () => appSettings.profiles[appSettings.activeProfileId]?.settings;
    const getCurrentState = () => appState[appSettings.activeProfileId];

    function saveState() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
            localStorage.setItem(STATE_KEY, JSON.stringify(appState));
        } catch (error) { console.error("Save failed", error); }
    }

    function loadState() {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            const storedState = localStorage.getItem(STATE_KEY);
            if (storedSettings) {
                appSettings = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(storedSettings) };
                // Re-apply default structure to ensure new fields exist
                Object.keys(appSettings.profiles).forEach(pid => {
                    appSettings.profiles[pid].settings = { ...DEFAULT_PROFILE_SETTINGS, ...appSettings.profiles[pid].settings };
                });
            } else {
                appSettings.profiles = {};
                Object.keys(PREMADE_PROFILES).forEach(id => {
                    appSettings.profiles[id] = { name: PREMADE_PROFILES[id].name, settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] }};
                });
            }
            if (storedState) appState = JSON.parse(storedState);
            Object.keys(appSettings.profiles).forEach(pid => { if (!appState[pid]) appState[pid] = getInitialState(); });
            if (!appSettings.profiles[appSettings.activeProfileId]) appSettings.activeProfileId = Object.keys(appSettings.profiles)[0] || 'profile_1';
        } catch (error) {
            console.error("Load failed, resetting", error);
            handleRestoreDefaults();
        }
    }

    function getInitialState() {
        return { sequences: Array.from({ length: MAX_MACHINES }, () => []), nextSequenceIndex: 0, currentRound: 1 };
    }

    // --- 3. UI & RENDER ---

    function renderSequences() {
        const state = getCurrentState();
        const profileSettings = getCurrentProfileSettings();
        if (!state || !profileSettings || !sequenceContainer) return; 
        
        const { machineCount, currentMode } = profileSettings;
        const { sequences } = state;
        const activeSequences = (currentMode === MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : sequences.slice(0, machineCount);
        const currentTurnIndex = state.nextSequenceIndex % machineCount;

        let layoutClasses = 'gap-4 flex-grow mb-6 transition-all duration-300 pt-1 ';
        let numColumns = 5;

        if (currentMode === MODES.SIMON) {
            if (machineCount === 1) { layoutClasses += ' flex flex-col max-w-xl mx-auto'; } 
            else if (machineCount === 2) { layoutClasses += ' grid grid-cols-2 max-w-3xl mx-auto'; numColumns = 4; }
            else if (machineCount === 3) { layoutClasses += ' grid grid-cols-3 max-w-4xl mx-auto'; numColumns = 4; }
            else if (machineCount === 4) { layoutClasses += ' grid grid-cols-4 max-w-5xl mx-auto'; numColumns = 3; }
        } else {
             layoutClasses += ' flex flex-col max-w-2xl mx-auto';
        }
        sequenceContainer.className = layoutClasses;
        sequenceContainer.innerHTML = '';

        if (currentMode === MODES.UNIQUE_ROUNDS) {
            const roundDisplay = document.createElement('div');
            roundDisplay.className = 'text-center text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100';
            roundDisplay.textContent = `Round: ${state.currentRound} / ${profileSettings.sequenceLength}`;
            sequenceContainer.appendChild(roundDisplay);
        }
        
        let gridClass = numColumns > 0 ? `grid grid-cols-${numColumns}` : 'flex flex-wrap';
        const newSize = 40 * profileSettings.uiScaleMultiplier;
        const newFont = 1.1 * profileSettings.uiScaleMultiplier;
        const sizeStyle = `height: ${newSize}px; line-height: ${newSize}px; font-size: ${newFont}rem;`;

        activeSequences.forEach((set, index) => {
            const isCurrent = (currentTurnIndex === index && machineCount > 1 && currentMode === MODES.SIMON);
            const sequenceDiv = document.createElement('div');
            const originalClasses = `p-4 rounded-xl shadow-md transition-all duration-200 ${isCurrent ? 'bg-accent-app scale-[1.02] shadow-lg text-gray-900' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'}`;
            sequenceDiv.className = originalClasses;
            sequenceDiv.dataset.originalClasses = originalClasses;
            sequenceDiv.innerHTML = `<div class="${gridClass} gap-2 min-h-[50px]">${set.map(val => `<span class="number-box bg-secondary-app text-white rounded-xl text-center shadow-sm" style="${sizeStyle}">${val}</span>`).join('')}</div>`;
            sequenceContainer.appendChild(sequenceDiv);
        });
    }

    // --- 4. LOGIC & HELPERS (UPDATED FROM SNIPPET) ---

    function updateAllChrome() {
        const profileSettings = getCurrentProfileSettings();
        if (!profileSettings) return;
        const newInput = profileSettings.currentInput;
        if(padKey9) padKey9.style.display = (newInput === INPUTS.KEY9) ? 'block' : 'none';
        if(padKey12) padKey12.style.display = (newInput === INPUTS.KEY12) ? 'block' : 'none';
        if(padPiano) padPiano.style.display = (newInput === INPUTS.PIANO) ? 'block' : 'none';
        updateMainUIControlsVisibility();
        updateVoiceInputVisibility();
        renderSequences();
    }
    
    function updateMainUIControlsVisibility() {
        const settings = getCurrentProfileSettings();
        if (allResetButtons) allResetButtons.forEach(btn => btn.style.display = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 'block' : 'none');
        if (allCameraMasterBtns) allCameraMasterBtns.forEach(btn => btn.classList.toggle('hidden', settings.autoInputMode !== AUTO_INPUT_MODES.PATTERN));
        if (allMicMasterBtns) allMicMasterBtns.forEach(btn => btn.classList.toggle('hidden', settings.autoInputMode !== AUTO_INPUT_MODES.TONE));
        updateMasterButtonStates();
    }

    function updateMasterButtonStates() {
        if (allCameraMasterBtns) allCameraMasterBtns.forEach(btn => btn.classList.toggle('master-active', isCameraMasterOn));
        if (allMicMasterBtns) allMicMasterBtns.forEach(btn => btn.classList.toggle('master-active', isMicMasterOn));
    }
    
    function updateVoiceInputVisibility() {
        const isEnabled = getCurrentProfileSettings().isVoiceInputEnabled;
        if (allVoiceInputs) allVoiceInputs.forEach(input => input.classList.toggle('hidden', !isEnabled));
    }

    function addValue(value) {
        vibrate();
        const state = getCurrentState();
        const settings = getCurrentProfileSettings();
        const mode = settings.currentMode;
        let targetIndex = (mode === MODES.UNIQUE_ROUNDS) ? 0 : state.nextSequenceIndex % settings.machineCount;

        if (mode === MODES.UNIQUE_ROUNDS && state.sequences[0].length >= state.currentRound) return;
        if (mode === MODES.SIMON && state.sequences[targetIndex].length >= settings.sequenceLength) return;

        state.sequences[targetIndex].push(value);
        state.nextSequenceIndex++;
        renderSequences();
        
        // Autoplay Logic
        if (settings.isAutoplayEnabled) {
            if (mode === MODES.UNIQUE_ROUNDS && state.sequences[0].length === state.currentRound) {
                 const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
                 allKeys.forEach(key => key.disabled = true);
                 setTimeout(handleUniqueRoundsDemo, 100); 
            } else if (mode === MODES.SIMON && (state.nextSequenceIndex - 1) % settings.machineCount === settings.machineCount - 1) {
                 setTimeout(handleSimonDemo, 100);
            }
        }
        saveState();
    }
    
    function handleBackspace() {
        vibrate(20);
        const state = getCurrentState();
        if (state.nextSequenceIndex === 0) return;
        
        const settings = getCurrentProfileSettings();
        let index = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : (state.nextSequenceIndex - 1) % settings.machineCount;
        
        if (state.sequences[index].length > 0) {
            state.sequences[index].pop();
            state.nextSequenceIndex--;
            if (settings.currentMode === MODES.UNIQUE_ROUNDS) {
                 const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
                 allKeys.forEach(key => key.disabled = false);
            }
            renderSequences();
            saveState();
        }
    }

    // --- 5. CAMERA ENGINE (Skill Vision 2.1 Logic) ---
    
    function openCameraModal() {
        if (!cameraModal) return;
        const profileSettings = getCurrentProfileSettings();
        
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
        } else { 
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
        
        if (flashSensitivitySlider) {
            flashSensitivitySlider.value = profileSettings.flashSensitivity;
            if(flashSensitivityDisplay) flashSensitivityDisplay.textContent = profileSettings.flashSensitivity;
        }

        if (cameraStream) {
             startCameraBtn.style.display = 'none';
             startDetectionBtn.style.display = 'block';
             stopDetectionBtn.style.display = 'none';
        } else {
             startCameraBtn.style.display = 'block';
             startDetectionBtn.style.display = 'none';
             stopDetectionBtn.style.display = 'none';
        }
        isDetecting = false;
        cameraModal.classList.remove('opacity-0', 'pointer-events-none');
        cameraModal.querySelector('div').classList.remove('scale-90');
    }

    function closeCameraModal() {
        if (!cameraModal) return;
        stopDetection();
        stopCameraStream();
        cameraModal.querySelector('div').classList.add('scale-90');
        cameraModal.classList.add('opacity-0');
        setTimeout(() => cameraModal.classList.add('pointer-events-none'), 300);
    }

    function saveGridConfig() {
        if (!activeCalibrationGrid || !cameraFeedContainer) return;
        const profileSettings = getCurrentProfileSettings();
        const containerRect = cameraFeedContainer.getBoundingClientRect();
        const gridRect = activeCalibrationGrid.getBoundingClientRect();
        const config = {
            top: `${((gridRect.top - containerRect.top) / containerRect.height) * 100}%`,
            left: `${((gridRect.left - containerRect.left) / containerRect.width) * 100}%`,
            width: `${(gridRect.width / containerRect.width) * 100}%`,
            height: `${(gridRect.height / containerRect.height) * 100}%`
        };
        if (profileSettings.currentInput === INPUTS.KEY12) profileSettings.cameraGridConfig12 = config;
        else profileSettings.cameraGridConfig9 = config;
        
        activeCalibrationGrid.style.top = config.top;
        activeCalibrationGrid.style.left = config.left;
        activeCalibrationGrid.style.width = config.width;
        activeCalibrationGrid.style.height = config.height;
        saveState();
    }

    async function startCameraStream() {
        if (cameraStream) stopCameraStream();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } });
            cameraStream = stream;
            if (cameraFeed) {
                cameraFeed.srcObject = stream;
                cameraFeed.onloadedmetadata = () => {
                    if(detectionCanvas) { detectionCanvas.width = 320; detectionCanvas.height = 240; }
                };
                cameraFeed.play();
            }
            if(startCameraBtn) startCameraBtn.style.display = 'none';
            if(startDetectionBtn) startDetectionBtn.style.display = 'block';
            if(stopDetectionBtn) stopDetectionBtn.style.display = 'none';
        } catch (err) {
            console.error(err);
            showModal("Camera Error", "Check permissions.", closeModal, "OK");
        }
    }

    function stopCameraStream() {
        stopDetection();
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
        if (cameraFeed) cameraFeed.srcObject = null;
        if(startCameraBtn) startCameraBtn.style.display = 'block';
        if(startDetectionBtn) startDetectionBtn.style.display = 'none';
        if(stopDetectionBtn) stopDetectionBtn.style.display = 'none';
    }

    function startDetection() {
        if (isDetecting || !cameraStream || !detectionCanvas) return;
        isDetecting = true;
        baselineData.fill(0);
        if(startDetectionBtn) startDetectionBtn.style.display = 'none';
        if(stopDetectionBtn) stopDetectionBtn.style.display = 'block';
        detectionContext = detectionCanvas.getContext('2d', { willReadFrequently: true });
        detectionLoopId = requestAnimationFrame(runDetectionLoop);
    }

    function stopDetection() {
        isDetecting = false;
        if (detectionLoopId) { cancelAnimationFrame(detectionLoopId); detectionLoopId = null; }
        if(startDetectionBtn) startDetectionBtn.style.display = 'block';
        if(stopDetectionBtn) stopDetectionBtn.style.display = 'none';
        if (activeCalibrationGrid) {
            Array.from(activeCalibrationGrid.children).forEach(c => c.classList.remove('flash-detected'));
        }
    }

    function runDetectionLoop() {
        if (!isDetecting || !detectionContext || !cameraFeed || !activeCalibrationGrid) { isDetecting = false; return; }
        
        try {
            const w = detectionCanvas.width;
            const h = detectionCanvas.height;
            detectionContext.drawImage(cameraFeed, 0, 0, w, h);
            const data = detectionContext.getImageData(0, 0, w, h).data;

            const videoRect = cameraFeed.getBoundingClientRect();
            const scaleX = w / videoRect.width;
            const scaleY = h / videoRect.height;
            const THRESHOLD = 110 - getCurrentProfileSettings().flashSensitivity;
            const boxes = activeCalibrationGrid.children;

            for (let i = 0; i < boxes.length; i++) {
                const boxRect = boxes[i].getBoundingClientRect();
                const x = Math.floor((boxRect.left - videoRect.left + boxRect.width / 2) * scaleX);
                const y = Math.floor((boxRect.top - videoRect.top + boxRect.height / 2) * scaleY);

                if (x < 0 || x >= w || y < 0 || y >= h) continue;
                const idx = (y * w + x) * 4;
                const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;

                if (Math.abs(brightness - baselineData[i]) > THRESHOLD) {
                    if (Date.now() - lastHitTime > GLOBAL_DEBOUNCE_MS) {
                        if (isCameraMasterOn) addValue(String(i + 1));
                        boxes[i].classList.add('flash-detected');
                        lastHitTime = Date.now();
                    }
                } else {
                    boxes[i].classList.remove('flash-detected');
                }
                baselineData[i] = (baselineData[i] * 0.8) + (brightness * 0.2);
            }
        } catch (e) {
            console.error("Detection loop error", e);
            stopDetection(); 
        }

        if (isDetecting) detectionLoopId = requestAnimationFrame(runDetectionLoop);
    }

    // --- 6. APP FEATURES (DEMO, SHORTCUTS, ETC) ---

    function vibrate(duration = 10) {
        const settings = getCurrentProfileSettings();
        if (settings.isHapticsEnabled && 'vibrate' in navigator) navigator.vibrate(duration);
    }

    function speak(text) {
        const settings = getCurrentProfileSettings();
        if (!settings.isAudioEnabled || !('speechSynthesis'in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; utterance.rate = 1.2;
        window.speechSynthesis.speak(utterance);
    }

    function handleSimonDemo() {
        const state = getCurrentState();
        const settings = getCurrentProfileSettings();
        const input = settings.currentInput;
        const padSelector = `#pad-${input}`;
        const flashClass = input === 'piano' ? 'flash' : (input === 'key9' ? 'key9-flash' : 'key12-flash');
        const demoButton = document.querySelector(`${padSelector} button[data-action="play-demo"]`);
        const inputKeys = document.querySelectorAll(`${padSelector} button[data-value]`);
        
        const activeSequences = state.sequences.slice(0, settings.machineCount);
        const maxLength = Math.max(...activeSequences.map(s => s.length));
        
        if (maxLength === 0) {
             if (!settings.isAutoplayEnabled) showModal('No Sequence', 'Enter values first!', closeModal, 'OK');
             return;
        }
        
        const playlist = [];
        const chunkSize = (settings.machineCount > 1) ? settings.simonChunkSize : maxLength;
        const numChunks = Math.ceil(maxLength / chunkSize);
        for (let chunkNum = 0; chunkNum < numChunks; chunkNum++) {
            for (let seqIndex = 0; seqIndex < settings.machineCount; seqIndex++) {
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
        const speedMultiplier = appSettings.playbackSpeed;
        const flashDuration = 250 * (speedMultiplier > 1 ? (1/speedMultiplier) : 1); 
        const pauseDuration = DEMO_DELAY_BASE_MS / speedMultiplier;

        function playNextItem() {
            if (i < playlist.length) {
                const item = playlist[i];
                const key = document.querySelector(`${padSelector} button[data-value="${item.value}"]`);
                const seqBox = sequenceContainer.children[item.seqIndex];
                const originalClasses = seqBox ? seqBox.dataset.originalClasses : '';
                if (demoButton) demoButton.innerHTML = String(i + 1);
                speak(input === 'piano' ? PIANO_SPEAK_MAP[item.value] || item.value : item.value);
                if (key) key.classList.add(flashClass);
                if (seqBox && settings.machineCount > 1) seqBox.className = 'p-4 rounded-xl shadow-md transition-all duration-200 bg-accent-app scale-[1.02] shadow-lg text-gray-900';
                
                const nextSeqIndex = (i + 1 < playlist.length) ? playlist[i + 1].seqIndex : -1;
                let timeBetweenItems = pauseDuration - flashDuration;
                if (settings.machineCount > 1 && nextSeqIndex !== -1 && item.seqIndex !== nextSeqIndex) {
                    timeBetweenItems += settings.simonInterSequenceDelay;
                }
                setTimeout(() => {
                    if (key) key.classList.remove(flashClass);
                    if (seqBox && settings.machineCount > 1) seqBox.className = originalClasses;
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
        const settings = getCurrentProfileSettings();
        const sequenceToPlay = state.sequences[0];
        const input = settings.currentInput;
        const padSelector = `#pad-${input}`;
        const flashClass = input === 'piano' ? 'flash' : (input === 'key9' ? 'key9-flash' : 'key12-flash');
        const demoButton = document.querySelector(`${padSelector} button[data-action="play-demo"]`);
        const allKeys = document.querySelectorAll(`${padSelector} button[data-value]`);

        if (sequenceToPlay.length === 0) {
            if (!settings.isAutoplayEnabled) showModal('No Sequence', 'Enter values first!', closeModal, 'OK');
            if(allKeys) allKeys.forEach(k=>k.disabled=false);
            return;
        }
        if (demoButton) demoButton.disabled = true;
        if (allKeys) allKeys.forEach(key => key.disabled = true);
        
        let i = 0;
        const speedMultiplier = appSettings.playbackSpeed;
        const flashDuration = 250 * (speedMultiplier > 1 ? (1/speedMultiplier) : 1); 
        const pauseDuration = DEMO_DELAY_BASE_MS / speedMultiplier;

        function playNextNumber() {
            if (i < sequenceToPlay.length) {
                const val = sequenceToPlay[i];
                let key = document.querySelector(`${padSelector} button[data-value="${val}"]`);
                if (demoButton) demoButton.innerHTML = String(i + 1);
                speak(input === 'piano' ? PIANO_SPEAK_MAP[val] || val : val);
                if (key) {
                    key.classList.add(flashClass);
                    setTimeout(() => {
                        key.classList.remove(flashClass);
                        setTimeout(playNextNumber, pauseDuration - flashDuration);
                    }, flashDuration);
                } else { setTimeout(playNextNumber, pauseDuration); }
                i++;
            } else {
                if (demoButton) { demoButton.disabled = false; demoButton.innerHTML = '▶'; }
                if (settings.isUniqueRoundsAutoClearEnabled) {
                    setTimeout(() => {
                         state.sequences[0] = [];
                         state.nextSequenceIndex = 0;
                         state.currentRound++;
                         if (state.currentRound > settings.sequenceLength) {
                             state.currentRound = 1;
                             showModal('Complete!', 'All rounds finished.', closeModal, 'OK');
                         }
                         if(allKeys) allKeys.forEach(k=>k.disabled=false);
                         renderSequences();
                         saveState();
                    }, 300);
                } else {
                    if (allKeys) allKeys.forEach(key => key.disabled = false);
                }
            }
        }
        playNextNumber();
    }

    function handleCurrentDemo() {
        if (getCurrentProfileSettings().currentMode === MODES.SIMON) handleSimonDemo();
        else handleUniqueRoundsDemo();
    }

    function resetUniqueRoundsMode() {
        const state = getCurrentState();
        const settings = getCurrentProfileSettings();
        state.currentRound = 1;
        state.sequences = Array.from({ length: MAX_MACHINES }, () => []);
        state.nextSequenceIndex = 0;
        const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
        if (allKeys) allKeys.forEach(key => key.disabled = false);
        renderSequences();
        saveState();
    }

    function processVoiceTranscript(transcript) {
        if (!transcript) return;
        const words = transcript.toLowerCase().replace(/[\.,]/g, '').trim().split(' ');
        const currentInput = getCurrentProfileSettings().currentInput;
        for (const word of words) {
            let value = VOICE_VALUE_MAP[word];
            if (!value) {
                 if (/^[1-9]$/.test(word) || /^(1[0-2])$/.test(word)) value = word; 
                 else if (/^[A-G]$/.test(word.toUpperCase()) || /^[1-5]$/.test(word)) value = word.toUpperCase();
            }
            if (value) addValue(value);
        }
    }

    function handleConfigAdd() {
        const newName = prompt("Enter new configuration name:", "My New Setup");
        if (newName) {
            const newId = `profile_${Date.now()}`;
            appSettings.profiles[newId] = { name: newName, settings: { ...DEFAULT_PROFILE_SETTINGS, shortcuts: [] } };
            appState[newId] = getInitialState();
            appSettings.activeProfileId = newId;
            populateConfigDropdown();
            updateAllChrome();
            saveState();
        }
    }
    function handleConfigRename() {
        const p = appSettings.profiles[appSettings.activeProfileId];
        const newName = prompt("Enter new name:", p.name);
        if (newName) { p.name = newName; populateConfigDropdown(); saveState(); }
    }
    function handleConfigDelete() {
        if (Object.keys(appSettings.profiles).length <= 1) return alert("Keep at least one profile.");
        if (confirm("Delete this profile?")) {
            delete appSettings.profiles[appSettings.activeProfileId];
            delete appState[appSettings.activeProfileId];
            appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
            populateConfigDropdown();
            updateAllChrome();
            saveState();
        }
    }
    function populateConfigDropdown() {
        if (!configSelect) return;
        configSelect.innerHTML = '';
        Object.keys(appSettings.profiles).forEach(id => {
            const opt = document.createElement('option');
            opt.value = id; opt.textContent = appSettings.profiles[id].name;
            configSelect.appendChild(opt);
        });
        configSelect.value = appSettings.activeProfileId;
    }
    function switchActiveProfile(id) {
        if (appSettings.profiles[id]) { appSettings.activeProfileId = id; updateAllChrome(); saveState(); }
    }

    // Modals logic
    function openGameSetupModal() {
        if (!gameSetupModal) return;
        populateConfigDropdown();
        const s = getCurrentProfileSettings();
        if(quickAutoplayToggle) quickAutoplayToggle.checked = s.isAutoplayEnabled;
        if(quickAudioToggle) quickAudioToggle.checked = s.isAudioEnabled;
        if(dontShowWelcomeToggle) dontShowWelcomeToggle.checked = !appSettings.showWelcomeScreen;
        gameSetupModal.classList.remove('opacity-0', 'pointer-events-none');
        gameSetupModal.querySelector('div').classList.remove('scale-90');
    }
    function closeGameSetupModal() {
        if (!gameSetupModal) return;
        const s = getCurrentProfileSettings();
        if(quickAutoplayToggle) s.isAutoplayEnabled = quickAutoplayToggle.checked;
        if(quickAudioToggle) s.isAudioEnabled = quickAudioToggle.checked;
        if(dontShowWelcomeToggle) appSettings.showWelcomeScreen = !dontShowWelcomeToggle.checked;
        saveState();
        gameSetupModal.querySelector('div').classList.add('scale-90');
        gameSetupModal.classList.add('opacity-0');
        setTimeout(() => gameSetupModal.classList.add('pointer-events-none'), 300);
    }
    function openSettingsModal() {
        const s = getCurrentProfileSettings();
        if (activeProfileNameSpan) activeProfileNameSpan.textContent = appSettings.profiles[appSettings.activeProfileId].name;
        if(inputSelect) inputSelect.value = s.currentInput;
        if(modeToggle) modeToggle.checked = (s.currentMode === MODES.UNIQUE_ROUNDS);
        if(machinesSlider) machinesSlider.value = s.machineCount;
        if(sequenceLengthSlider) sequenceLengthSlider.value = s.sequenceLength;
        if(chunkSlider) chunkSlider.value = s.simonChunkSize;
        if(delaySlider) delaySlider.value = s.simonInterSequenceDelay;
        if(autoclearToggle) autoclearToggle.checked = s.isUniqueRoundsAutoClearEnabled;
        if(playbackSpeedSlider) playbackSpeedSlider.value = appSettings.playbackSpeed * 100;
        if(showWelcomeToggle) showWelcomeToggle.checked = appSettings.showWelcomeScreen;
        if(darkModeToggle) darkModeToggle.checked = appSettings.isDarkMode;
        if(uiScaleSlider) uiScaleSlider.value = s.uiScaleMultiplier * 100;
        if(shakeSensitivitySlider) shakeSensitivitySlider.value = s.shakeSensitivity;
        if(speedDeleteToggle) speedDeleteToggle.checked = s.isSpeedDeletingEnabled;
        if(autoplayToggle) autoplayToggle.checked = s.isAutoplayEnabled;
        if(audioToggle) audioToggle.checked = s.isAudioEnabled;
        if(voiceInputToggle) voiceInputToggle.checked = s.isVoiceInputEnabled;
        if(hapticsToggle) hapticsToggle.checked = s.isHapticsEnabled;
        if(autoInputSlider) autoInputSlider.value = s.autoInputMode;
        
        renderShortcutList();
        updateSettingsModalVisibility();
        settingsModal.classList.remove('opacity-0', 'pointer-events-none');
        settingsModal.querySelector('div').classList.remove('scale-90');
    }
    function closeSettingsModal() {
        saveState();
        updateAllChrome();
        settingsModal.querySelector('div').classList.add('scale-90');
        settingsModal.classList.add('opacity-0');
        setTimeout(() => settingsModal.classList.add('pointer-events-none'), 300);
    }
    function updateSettingsModalVisibility() {
        const s = getCurrentProfileSettings();
        if(sequenceLengthLabel) sequenceLengthLabel.textContent = (s.currentMode === MODES.SIMON) ? '4. Sequence Length' : '4. Unique Rounds';
        if(modeToggleLabel) modeToggleLabel.textContent = (s.currentMode === MODES.SIMON) ? 'Off: Simon Says' : 'On: Unique Rounds';
        if(machinesSlider) {
            machinesSlider.disabled = (s.currentMode === MODES.UNIQUE_ROUNDS);
            if (s.currentMode === MODES.UNIQUE_ROUNDS) { machinesSlider.value = 1; if(machinesDisplay) machinesDisplay.textContent = "1 Machine"; }
            else if(machinesDisplay) machinesDisplay.textContent = s.machineCount + " Machines";
        }
        if(settingAutoclear) settingAutoclear.style.display = (s.currentMode === MODES.UNIQUE_ROUNDS) ? 'flex' : 'none';
        if(settingMultiSequenceGroup) settingMultiSequenceGroup.style.display = (s.currentMode === MODES.SIMON && s.machineCount > 1) ? 'block' : 'none';
    }
    function openHelpModal() {
        helpModal.classList.remove('opacity-0', 'pointer-events-none');
        helpModal.querySelector('div').classList.remove('scale-90');
    }
    function closeModal() {
        if (customModal) {
            customModal.querySelector('div').classList.add('scale-90');
            customModal.classList.add('opacity-0');
            setTimeout(() => customModal.classList.add('pointer-events-none'), 300);
        }
    }
    function showModal(title, message, onConfirm, confirmText = 'OK') {
        if (!customModal) return;
        modalTitle.textContent = title; modalMessage.textContent = message;
        const newConfirm = modalConfirm.cloneNode(true); newConfirm.textContent = confirmText;
        modalConfirm.parentNode.replaceChild(newConfirm, modalConfirm); modalConfirm = newConfirm;
        modalConfirm.onclick = () => { onConfirm(); closeModal(); };
        modalCancel.onclick = closeModal;
        customModal.classList.remove('opacity-0', 'pointer-events-none');
        customModal.querySelector('div').classList.remove('scale-90');
    }

    function updateTheme(isDark) {
        appSettings.isDarkMode = isDark;
        document.body.classList.toggle('dark', isDark);
        document.body.classList.toggle('light', !isDark);
        saveState();
    }
    function applyGlobalUiScale(val) {
        appSettings.globalUiScale = val;
        document.documentElement.style.fontSize = `${val}%`;
    }

    // Shortcuts
    function renderShortcutList() {
        if (!shortcutListContainer) return;
        const shortcuts = getCurrentProfileSettings().shortcuts;
        shortcutListContainer.innerHTML = '';
        shortcuts.forEach(sc => {
            const row = document.createElement('div'); row.className = 'shortcut-row'; row.dataset.id = sc.id;
            const tSel = document.createElement('select'); tSel.className = 'select-input shortcut-trigger';
            for (const k in SHORTCUT_TRIGGERS) tSel.options.add(new Option(SHORTCUT_TRIGGERS[k], k));
            tSel.value = sc.trigger;
            const aSel = document.createElement('select'); aSel.className = 'select-input shortcut-action';
            for (const k in SHORTCUT_ACTIONS) aSel.options.add(new Option(SHORTCUT_ACTIONS[k], k));
            aSel.value = sc.action;
            const dBtn = document.createElement('button'); dBtn.className = 'shortcut-delete-btn'; dBtn.innerHTML = '&times;';
            row.append(tSel, aSel, dBtn); shortcutListContainer.appendChild(row);
        });
    }

    // Firebase Comments
    async function handleSubmitComment() {
        if (!commentUsername.value || !commentMessage.value) return alert("Name and Message required");
        try {
            await addDoc(collection(db, "comments"), { username: commentUsername.value, message: commentMessage.value, timestamp: serverTimestamp() });
            commentMessage.value = ""; alert("Feedback sent!");
        } catch (e) { console.error(e); alert("Error sending."); }
    }
    function initializeCommentListener() {
        if (!commentsListContainer) return;
        onSnapshot(query(collection(db, "comments"), orderBy("timestamp", "desc"), limit(50)), (snap) => {
            commentsListContainer.innerHTML = "";
            if(snap.empty) commentsListContainer.innerHTML = "<p>No comments.</p>";
            snap.forEach(d => {
                const c = d.data();
                const el = document.createElement('div'); el.className = "p-3 mb-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm";
                el.innerHTML = `<p class="font-bold text-primary-app">${c.username}</p><p class="text-gray-900 dark:text-white">${c.message}</p>`;
                commentsListContainer.appendChild(el);
            });
        });
    }

    // --- 7. ROBUST INITIALIZATION ---

    function handleRestoreDefaults() {
        localStorage.clear();
        window.location.reload();
    }
    
    function assignDomElements() {
        sequenceContainer = document.getElementById('sequence-container');
        customModal = document.getElementById('custom-modal');
        modalTitle = document.getElementById('modal-title'); modalMessage = document.getElementById('modal-message'); modalConfirm = document.getElementById('modal-confirm'); modalCancel = document.getElementById('modal-cancel');
        gameSetupModal = document.getElementById('game-setup-modal'); closeGameSetupModalBtn = document.getElementById('close-game-setup-modal'); dontShowWelcomeToggle = document.getElementById('dont-show-welcome-toggle');
        configSelect = document.getElementById('config-select'); configAddBtn = document.getElementById('config-add'); configRenameBtn = document.getElementById('config-rename'); configDeleteBtn = document.getElementById('config-delete');
        quickAutoplayToggle = document.getElementById('quick-autoplay-toggle'); quickAudioToggle = document.getElementById('quick-audio-toggle'); quickOpenHelpBtn = document.getElementById('quick-open-help'); quickOpenSettingsBtn = document.getElementById('quick-open-settings');
        globalResizeUpBtn = document.getElementById('global-resize-up'); globalResizeDownBtn = document.getElementById('global-resize-down');

        settingsModal = document.getElementById('settings-modal'); closeSettings = document.getElementById('close-settings'); openGameSetupFromSettings = document.getElementById('open-game-setup-from-settings');
        activeProfileNameSpan = document.getElementById('active-profile-name'); openHelpButton = document.getElementById('open-help-button'); openShareButton = document.getElementById('open-share-button'); openCommentModalBtn = document.getElementById('open-comment-modal');
        
        helpModal = document.getElementById('help-modal'); closeHelp = document.getElementById('close-help'); helpContentContainer = document.getElementById('help-content-container'); helpTabNav = document.getElementById('help-tab-nav');
        commentModal = document.getElementById('comment-modal'); closeCommentModalBtn = document.getElementById('close-comment-modal'); submitCommentBtn = document.getElementById('submit-comment-btn'); commentUsername = document.getElementById('comment-username'); commentMessage = document.getElementById('comment-message'); commentsListContainer = document.getElementById('comments-list-container');
        shareModal = document.getElementById('share-modal'); closeShare = document.getElementById('close-share'); copyLinkButton = document.getElementById('copy-link-button'); nativeShareButton = document.getElementById('native-share-button');
        toastNotification = document.getElementById('toast-notification'); toastMessage = document.getElementById('toast-message');

        // Settings Controls
        inputSelect = document.getElementById('input-select'); modeToggle = document.getElementById('mode-toggle'); modeToggleLabel = document.getElementById('mode-toggle-label');
        machinesSlider = document.getElementById('machines-slider'); machinesDisplay = document.getElementById('machines-display');
        sequenceLengthSlider = document.getElementById('sequence-length-slider'); sequenceLengthDisplay = document.getElementById('sequence-length-display'); sequenceLengthLabel = document.getElementById('sequence-length-label');
        chunkSlider = document.getElementById('chunk-slider'); chunkDisplay = document.getElementById('chunk-display');
        delaySlider = document.getElementById('delay-slider'); delayDisplay = document.getElementById('delay-display'); settingMultiSequenceGroup = document.getElementById('setting-multi-sequence-group');
        autoclearToggle = document.getElementById('autoclear-toggle'); settingAutoclear = document.getElementById('setting-autoclear');
        playbackSpeedSlider = document.getElementById('playback-speed-slider'); playbackSpeedDisplay = document.getElementById('playback-speed-display');
        showWelcomeToggle = document.getElementById('show-welcome-toggle'); darkModeToggle = document.getElementById('dark-mode-toggle');
        uiScaleSlider = document.getElementById('ui-scale-slider'); uiScaleDisplay = document.getElementById('ui-scale-display');
        shortcutListContainer = document.getElementById('shortcut-list-container'); addShortcutBtn = document.getElementById('add-shortcut-btn');
        shakeSensitivitySlider = document.getElementById('shake-sensitivity-slider'); shakeSensitivityDisplay = document.getElementById('shake-sensitivity-display');
        autoplayToggle = document.getElementById('autoplay-toggle'); speedDeleteToggle = document.getElementById('speed-delete-toggle'); audioToggle = document.getElementById('audio-toggle'); voiceInputToggle = document.getElementById('voice-input-toggle'); hapticsToggle = document.getElementById('haptics-toggle'); autoInputSlider = document.getElementById('auto-input-slider');

        // Camera
        cameraModal = document.getElementById('camera-modal'); closeCameraModalBtn = document.getElementById('close-camera-modal'); openCameraModalBtn = document.getElementById('open-camera-modal-btn');
        cameraFeed = document.getElementById('camera-feed'); cameraFeedContainer = document.getElementById('camera-feed-container');
        grid9Key = document.getElementById('grid-9key'); grid12Key = document.getElementById('grid-12key');
        detectionCanvas = document.getElementById('detection-canvas');
        startCameraBtn = document.getElementById('start-camera-btn'); startDetectionBtn = document.getElementById('start-detection-btn'); stopDetectionBtn = document.getElementById('stop-detection-btn');
        flashSensitivitySlider = document.getElementById('flash-sensitivity-slider'); flashSensitivityDisplay = document.getElementById('flash-sensitivity-display');

        // Pads & Masters
        padKey9 = document.getElementById('pad-key9'); padKey12 = document.getElementById('pad-key12'); padPiano = document.getElementById('pad-piano');
        allResetButtons = document.querySelectorAll('.reset-button'); allVoiceInputs = document.querySelectorAll('.voice-text-input');
        allCameraMasterBtns = document.querySelectorAll('#camera-master-btn'); allMicMasterBtns = document.querySelectorAll('#mic-master-btn');
    }

    function initializeListeners() {
        // Master Switches
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#camera-master-btn')) {
                isCameraMasterOn = !isCameraMasterOn;
                updateMasterButtonStates();
            }
        });
        
        // Global Button Handler
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const { value, action, input } = button.dataset;
            
            if (action === 'restore-defaults') { if(confirm("Reset everything?")) handleRestoreDefaults(); return; }
            if (action === 'reset-unique-rounds') { if(confirm("Reset rounds?")) resetUniqueRoundsMode(); return; }
            if (action === 'open-camera') { closeSettingsModal(); openCameraModal(); return; }
            if (action === 'open-settings') openSettingsModal();
            if (action === 'open-help') { closeSettingsModal(); openHelpModal(); }
            if (action === 'open-comments') { closeSettingsModal(); commentModal.classList.remove('opacity-0', 'pointer-events-none'); commentModal.querySelector('div').classList.remove('scale-90'); }
            if (action === 'open-share') { closeSettingsModal(); shareModal.classList.remove('opacity-0', 'pointer-events-none'); shareModal.querySelector('div').classList.remove('scale-90'); }
            if (action === 'play-demo' && input === getCurrentProfileSettings().currentInput) handleCurrentDemo();
            if (action === 'backspace') handleBackspace();
            if (value && input === getCurrentProfileSettings().currentInput) addValue(value);
        });

        // Camera Specific
        if(closeCameraModalBtn) closeCameraModalBtn.addEventListener('click', closeCameraModal);
        if(startCameraBtn) startCameraBtn.addEventListener('click', startCameraStream);
        if(startDetectionBtn) startDetectionBtn.addEventListener('click', startDetection);
        if(stopDetectionBtn) stopDetectionBtn.addEventListener('click', stopDetection);
        if(flashSensitivitySlider) flashSensitivitySlider.addEventListener('input', (e) => {
             getCurrentProfileSettings().flashSensitivity = e.target.value;
             if(flashSensitivityDisplay) flashSensitivityDisplay.textContent = e.target.value;
        });
        
        // Grid Draggers
        const initGridDragger = (grid) => {
            if(!grid) return;
            let startX, startY, startLeft, startTop;
            const dragStart = (e) => {
                e.preventDefault(); isDraggingGrid = true; activeCalibrationGrid = grid;
                startX = e.clientX || e.touches[0].clientX; startY = e.clientY || e.touches[0].clientY;
                startLeft = grid.offsetLeft; startTop = grid.offsetTop;
                window.addEventListener('mousemove', dragMove); window.addEventListener('mouseup', dragEnd);
                window.addEventListener('touchmove', dragMove, {passive:false}); window.addEventListener('touchend', dragEnd);
            };
            const dragMove = (e) => {
                if(!isDraggingGrid) return; e.preventDefault();
                const cx = e.clientX || e.touches[0].clientX; const cy = e.clientY || e.touches[0].clientY;
                const rect = cameraFeedContainer.getBoundingClientRect();
                grid.style.left = `${(startLeft + cx - startX) / rect.width * 100}%`;
                grid.style.top = `${(startTop + cy - startY) / rect.height * 100}%`;
            };
            const dragEnd = () => {
                isDraggingGrid = false;
                window.removeEventListener('mousemove', dragMove); window.removeEventListener('mouseup', dragEnd);
                window.removeEventListener('touchmove', dragMove); window.removeEventListener('touchend', dragEnd);
                saveGridConfig();
            };
            grid.addEventListener('mousedown', dragStart);
            grid.addEventListener('touchstart', dragStart, {passive:false});
        };
        initGridDragger(grid9Key);
        initGridDragger(grid12Key);

        // Setup & Settings Listeners
        if(closeGameSetupModalBtn) closeGameSetupModalBtn.addEventListener('click', closeGameSetupModal);
        if(configSelect) configSelect.addEventListener('change', (e) => switchActiveProfile(e.target.value));
        if(configAddBtn) configAddBtn.addEventListener('click', handleConfigAdd);
        if(configRenameBtn) configRenameBtn.addEventListener('click', handleConfigRename);
        if(configDeleteBtn) configDeleteBtn.addEventListener('click', handleConfigDelete);
        if(quickOpenHelpBtn) quickOpenHelpBtn.addEventListener('click', () => { closeGameSetupModal(); openHelpModal(); });
        if(quickOpenSettingsBtn) quickOpenSettingsBtn.addEventListener('click', () => { closeGameSetupModal(); openSettingsModal(); });
        if(closeSettings) closeSettings.addEventListener('click', closeSettingsModal);
        if(openGameSetupFromSettings) openGameSetupFromSettings.addEventListener('click', () => { closeSettingsModal(); openGameSetupModal(); });
        if(globalResizeUpBtn) globalResizeUpBtn.addEventListener('click', () => { applyGlobalUiScale(appSettings.globalUiScale + 10); saveState(); });
        if(globalResizeDownBtn) globalResizeDownBtn.addEventListener('click', () => { applyGlobalUiScale(appSettings.globalUiScale - 10); saveState(); });
        if(closeHelp) closeHelp.addEventListener('click', () => { helpModal.classList.add('opacity-0', 'pointer-events-none'); helpModal.querySelector('div').classList.add('scale-90'); });
        if(closeCommentModalBtn) closeCommentModalBtn.addEventListener('click', () => { commentModal.classList.add('opacity-0', 'pointer-events-none'); commentModal.querySelector('div').classList.add('scale-90'); });
        if(submitCommentBtn) submitCommentBtn.addEventListener('click', handleSubmitComment);
        if(closeShare) closeShare.addEventListener('click', () => { shareModal.classList.add('opacity-0', 'pointer-events-none'); shareModal.querySelector('div').classList.add('scale-90'); });
        if(copyLinkButton) copyLinkButton.addEventListener('click', () => navigator.clipboard.writeText(window.location.href));

        // Dynamic Settings inputs
        const bind = (el, prop, isChecked, isInt) => {
            if(el) el.addEventListener('change', (e) => {
                let val = isChecked ? e.target.checked : e.target.value;
                if(isInt) val = parseInt(val);
                getCurrentProfileSettings()[prop] = val;
                updateSettingsModalVisibility();
                updateAllChrome();
            });
        };
        bind(inputSelect, 'currentInput'); bind(modeToggle, 'currentMode', true); bind(autoclearToggle, 'isUniqueRoundsAutoClearEnabled', true);
        bind(autoplayToggle, 'isAutoplayEnabled', true); bind(speedDeleteToggle, 'isSpeedDeletingEnabled', true);
        bind(audioToggle, 'isAudioEnabled', true); bind(voiceInputToggle, 'isVoiceInputEnabled', true); bind(hapticsToggle, 'isHapticsEnabled', true);
        
        if(machinesSlider) machinesSlider.addEventListener('input', (e) => { getCurrentProfileSettings().machineCount = parseInt(e.target.value); updateSettingsModalVisibility(); });
        if(sequenceLengthSlider) sequenceLengthSlider.addEventListener('input', (e) => { getCurrentProfileSettings().sequenceLength = parseInt(e.target.value); if(sequenceLengthDisplay) sequenceLengthDisplay.textContent = e.target.value; });
        if(uiScaleSlider) uiScaleSlider.addEventListener('input', (e) => { getCurrentProfileSettings().uiScaleMultiplier = parseInt(e.target.value)/100; if(uiScaleDisplay) uiScaleDisplay.textContent = e.target.value+'%'; renderSequences(); });
        if(autoInputSlider) autoInputSlider.addEventListener('input', (e) => { getCurrentProfileSettings().autoInputMode = e.target.value; updateAllChrome(); });
        
        // Tabs
        if(settingsTabNav) settingsTabNav.addEventListener('click', (e) => {
            if(e.target.dataset.tab) {
                settingsModal.querySelectorAll('.settings-tab-content').forEach(c => c.classList.add('hidden'));
                settingsTabNav.querySelectorAll('button').forEach(b => b.classList.remove('active-tab'));
                document.getElementById(`settings-tab-${e.target.dataset.tab}`).classList.remove('hidden');
                e.target.classList.add('active-tab');
            }
        });
        if(helpTabNav) helpTabNav.addEventListener('click', (e) => {
            if(e.target.dataset.tab) {
                helpContentContainer.querySelectorAll('.help-tab-content').forEach(c => c.classList.add('hidden'));
                helpTabNav.querySelectorAll('button').forEach(b => b.classList.remove('active-tab'));
                document.getElementById(`help-tab-${e.target.dataset.tab}`).classList.remove('hidden');
                e.target.classList.add('active-tab');
            }
        });
        
        // Shortcuts
        if(addShortcutBtn) addShortcutBtn.addEventListener('click', () => { getCurrentProfileSettings().shortcuts.push({id:`sc_${Date.now()}`, trigger:'none', action:'none'}); renderShortcutList(); });
        if(shortcutListContainer) shortcutListContainer.addEventListener('change', (e) => {
            const id = e.target.closest('.shortcut-row').dataset.id;
            const sc = getCurrentProfileSettings().shortcuts.find(s => s.id === id);
            if(e.target.classList.contains('shortcut-trigger')) sc.trigger = e.target.value;
            else sc.action = e.target.value;
        });
        if(shortcutListContainer) shortcutListContainer.addEventListener('click', (e) => {
            if(e.target.classList.contains('shortcut-delete-btn')) {
                const id = e.target.closest('.shortcut-row').dataset.id;
                const p = getCurrentProfileSettings();
                p.shortcuts = p.shortcuts.filter(s => s.id !== id);
                renderShortcutList();
            }
        });

        // Voice
        allVoiceInputs.forEach(i => i.addEventListener('input', (e) => { processVoiceTranscript(e.target.value); e.target.value = ''; }));
    }

    // --- SAFETY INIT ---
    window.onload = function() {
        const watchdog = setTimeout(() => { if(confirm("App freezing. Reset?")) handleRestoreDefaults(); }, 3000);
        try {
            loadState();
            assignDomElements();
            if(!sequenceContainer) throw new Error("DOM load failure");
            applyGlobalUiScale(appSettings.globalUiScale);
            updateTheme(appSettings.isDarkMode);
            initializeListeners();
            updateAllChrome();
            initializeCommentListener();
            if (appSettings.showWelcomeScreen) setTimeout(openGameSetupModal, 500);
            clearTimeout(watchdog);
        } catch (err) {
            console.error("CRITICAL INIT ERROR:", err);
            if(confirm("App crashed. Reset?")) handleRestoreDefaults();
        }
    };

})();
