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
    const SPEED_DELETE_INTERVAL_MS = 100; // Adjusted for better feel
    const SHAKE_BASE_THRESHOLD = 25; 
    const SHAKE_TIMEOUT_MS = 500; 
    
    // --- V3 CAMERA ENGINE SETTINGS ---
    const FLASH_COOLDOWN_MS = 300; 
    const ADAPTIVE_LEARNING_RATE = 0.2;

    // --- AUDIO ENGINE SETTINGS ---
    const AUDIO_DEBOUNCE_MS = 350;
    const MIC_THRESHOLD = 20; 

    const SETTINGS_KEY = 'followMeAppSettings_v7'; 
    const STATE_KEY = 'followMeAppState_v7';

    const INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
    const MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };
    const AUTO_INPUT_MODES = { OFF: '0', TONE: '1', PATTERN: '2' }; 

    const NOTE_MAP = [
        { note: 'C',  freq: 261.63, val: '1' }, { note: 'C#', freq: 277.18, val: '2' },
        { note: 'D',  freq: 293.66, val: '3' }, { note: 'D#', freq: 311.13, val: '4' },
        { note: 'E',  freq: 329.63, val: '5' }, { note: 'F',  freq: 349.23, val: '6' },
        { note: 'F#', freq: 369.99, val: '7' }, { note: 'G',  freq: 392.00, val: '8' },
        { note: 'G#', freq: 415.30, val: '9' }, { note: 'A',  freq: 440.00, val: '1' },
        { note: 'A#', freq: 466.16, val: '2' }, { note: 'B',  freq: 493.88, val: '3' }
    ];

    const SHORTCUT_TRIGGERS = {
        'none': 'Select Trigger...', 'shake': 'Shake Device (Experimental)',
        'longpress_backspace': 'Long Press Backspace', 'longpress_play': 'Long Press Play', 'longpress_settings': 'Long Press Settings'
    };
    const SHORTCUT_ACTIONS = {
        'none': 'Select Action...', 'play_demo': 'Play Demo', 'reset_rounds': 'Reset Rounds (Confirm)',
        'clear_all': 'Clear All (Confirm)', 'clear_last': 'Clear Last (Backspace)',
        'toggle_autoplay': 'Toggle Autoplay', 'toggle_audio': 'Toggle Audio', 'toggle_haptics': 'Toggle Haptics',
        'toggle_dark_mode': 'Toggle Dark Mode', 'open_settings': 'Open/Close Settings'
    };

    const PIANO_SPEAK_MAP = { 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' };
    const VOICE_VALUE_MAP = {
        'one': '1', 'two': '2', 'to': '2', 'three': '3', 'four': '4', 'for': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
        'eleven': '11', 'twelve': '12', 'see': 'C', 'dee': 'D', 'e': 'E', 'eff': 'F', 'gee': 'G', 'eh': 'A', 'be': 'B', 'c': 'C', 'd': 'D', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'
    };

    const DEFAULT_PROFILE_SETTINGS = {
        currentInput: INPUTS.KEY9, currentMode: MODES.SIMON, sequenceLength: 20, simonChunkSize: 3, simonInterSequenceDelay: 500,
        isAutoplayEnabled: true, isUniqueRoundsAutoClearEnabled: true, isAudioEnabled: true, isVoiceInputEnabled: true, isHapticsEnabled: true, isSpeedDeletingEnabled: true, 
        uiScaleMultiplier: 1.0, machineCount: 1, shortcuts: [], shakeSensitivity: 10, autoInputMode: AUTO_INPUT_MODES.OFF, flashSensitivity: 40, 
        cameraGridConfig9: { top: '25%', left: '25%', width: '50%', height: '50%' }, cameraGridConfig12: { top: '25%', left: '20%', width: '60%', height: '40%' }
    };
    
    const DEFAULT_APP_SETTINGS = { globalUiScale: 100, isDarkMode: true, showWelcomeScreen: true, activeProfileId: 'profile_1', profiles: {}, playbackSpeed: 1.0 };
    
    const PREMADE_PROFILES = {
        'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS } },
        'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 200 }},
        'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }},
        'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: INPUTS.PIANO }}
    };

    // --- 2. STATE ---
    let appSettings = { ...DEFAULT_APP_SETTINGS }; let appState = {}; 
    let initialDelayTimer = null; let speedDeleteInterval = null; let isHoldingBackspace = false;
    let lastShakeTime = 0; let toastTimer = null; 
    
    let cameraStream = null; let isDetecting = false; let detectionLoopId = null;
    let lastFlashTime = Array(12).fill(0); let baselineBrightness = Array(12).fill(0); 
    let isDraggingGrid = false; let isCameraMasterOn = false; 
    
    let audioContext = null; let audioAnalyser = null; let microphoneStream = null;
    let audioProcessLoopId = null; let isMicMasterOn = false; let lastAudioHitTime = 0;

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

    function saveState() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings)); localStorage.setItem(STATE_KEY, JSON.stringify(appState)); } catch (e) { console.error("Save failed", e); } }
    function loadState() {
        try {
            const s = localStorage.getItem(SETTINGS_KEY); const st = localStorage.getItem(STATE_KEY);
            if (s) { appSettings = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(s) }; Object.keys(appSettings.profiles).forEach(id => { appSettings.profiles[id].settings = { ...DEFAULT_PROFILE_SETTINGS, ...appSettings.profiles[id].settings }; }); } 
            else { appSettings.profiles = JSON.parse(JSON.stringify(PREMADE_PROFILES)); }
            if (st) appState = JSON.parse(st);
            Object.keys(appSettings.profiles).forEach(id => { if (!appState[id]) appState[id] = getInitialState(); });
            if (!appSettings.profiles[appSettings.activeProfileId]) appSettings.activeProfileId = Object.keys(appSettings.profiles)[0] || 'profile_1';
        } catch (e) { appSettings = JSON.parse(JSON.stringify({ ...DEFAULT_APP_SETTINGS, profiles: PREMADE_PROFILES })); appState = {}; Object.keys(appSettings.profiles).forEach(id => appState[id] = getInitialState()); }
    }
    function getInitialState() { return { sequences: Array.from({ length: MAX_MACHINES }, () => []), nextSequenceIndex: 0, currentRound: 1 }; }

    // --- UI RENDERERS ---
    function renderSequences() {
        const state = getCurrentState(); const s = getCurrentProfileSettings(); if (!state || !s || !sequenceContainer) return; 
        const activeSeqs = (s.currentMode === MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, s.machineCount);
        const turnIdx = state.nextSequenceIndex % s.machineCount;
        sequenceContainer.innerHTML = '';
        let cols = 5, cls = 'gap-4 flex-grow mb-6 transition-all duration-300 pt-1 ';
        if (s.currentMode === MODES.SIMON) {
            if (s.machineCount === 1) { cls += ' flex flex-col max-w-xl mx-auto'; cols = 5; } 
            else if (s.machineCount === 2) { cls += ' grid grid-cols-2 max-w-3xl mx-auto'; cols = 4; } 
            else if (s.machineCount === 3) { cls += ' grid grid-cols-3 max-w-4xl mx-auto'; cols = 4; } 
            else { cls += ' grid grid-cols-4 max-w-5xl mx-auto'; cols = 3; }
        } else { cls += ' flex flex-col max-w-2xl mx-auto'; cols = 5; }
        sequenceContainer.className = cls;

        if (s.currentMode === MODES.UNIQUE_ROUNDS) {
            const rd = document.createElement('div'); rd.className = 'text-center text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100';
            rd.textContent = `Round: ${state.currentRound} / ${s.sequenceLength}`; sequenceContainer.appendChild(rd);
        }
        const gridCls = cols > 0 ? `grid grid-cols-${cols}` : 'flex flex-wrap';
        const sz = `height: ${40 * s.uiScaleMultiplier}px; line-height: ${40 * s.uiScaleMultiplier}px; font-size: ${1.1 * s.uiScaleMultiplier}rem;`;

        activeSeqs.forEach((set, idx) => {
            const isCur = (turnIdx === idx && s.machineCount > 1 && s.currentMode === MODES.SIMON);
            const div = document.createElement('div');
            div.className = `p-4 rounded-xl shadow-md transition-all duration-200 ${isCur ? 'bg-accent-app scale-[1.02] shadow-lg text-gray-900' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'}`;
            div.dataset.originalClasses = div.className;
            div.innerHTML = `<div class="${gridCls} gap-2 min-h-[50px]">${set.map(v => `<span class="number-box bg-secondary-app text-white rounded-xl text-center shadow-sm" style="${sz}">${v}</span>`).join('')}</div>`;
            sequenceContainer.appendChild(div);
        });
    }
    function populateConfigDropdown() {
        if (!configSelect) return; configSelect.innerHTML = '';
        Object.keys(appSettings.profiles).forEach(id => { const o = document.createElement('option'); o.value = id; o.textContent = appSettings.profiles[id].name; configSelect.appendChild(o); });
        configSelect.value = appSettings.activeProfileId;
    }
    function switchActiveProfile(id) { if (appSettings.profiles[id]) { appSettings.activeProfileId = id; updateAllChrome(); saveState(); } }
    function handleConfigAdd() { const n = prompt("Name:", "New Setup"); if (n) { const id = `p_${Date.now()}`; appSettings.profiles[id] = { name: n, settings: { ...DEFAULT_PROFILE_SETTINGS } }; appState[id] = getInitialState(); switchActiveProfile(id); populateConfigDropdown(); } }
    function handleConfigRename() { const n = prompt("New name:", appSettings.profiles[appSettings.activeProfileId].name); if (n) { appSettings.profiles[appSettings.activeProfileId].name = n; populateConfigDropdown(); saveState(); } }
    function handleConfigDelete() { if (Object.keys(appSettings.profiles).length <= 1) return showModal("Error", "Keep one profile.", closeModal, "OK", ""); showModal("Delete?", "Permanent.", () => { delete appSettings.profiles[appSettings.activeProfileId]; delete appState[appSettings.activeProfileId]; switchActiveProfile(Object.keys(appSettings.profiles)[0]); populateConfigDropdown(); }, "Delete", "Cancel"); }

    // --- MODAL & SETTINGS ---
    function openGameSetupModal() { populateConfigDropdown(); gameSetupModal.classList.remove('opacity-0', 'pointer-events-none'); gameSetupModal.querySelector('div').classList.remove('scale-90'); }
    function closeGameSetupModal() { appSettings.showWelcomeScreen = !dontShowWelcomeToggle.checked; saveState(); gameSetupModal.querySelector('div').classList.add('scale-90'); gameSetupModal.classList.add('opacity-0'); setTimeout(() => gameSetupModal.classList.add('pointer-events-none'), 300); }
    function updateSettingsControls() {
        const s = getCurrentProfileSettings();
        inputSelect.value = s.currentInput; modeToggle.checked = (s.currentMode === MODES.UNIQUE_ROUNDS);
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
    function switchSettingsTab(id) {
        settingsModal.querySelectorAll('.settings-tab-content').forEach(t => t.classList.add('hidden'));
        settingsTabNav.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active-tab'));
        document.getElementById(`settings-tab-${id}`).classList.remove('hidden');
        settingsTabNav.querySelector(`button[data-tab="${id}"]`).classList.add('active-tab');
    }
    function openSettingsModal() { updateSettingsControls(); switchSettingsTab('profile'); settingsModal.classList.remove('opacity-0', 'pointer-events-none'); settingsModal.querySelector('div').classList.remove('scale-90'); }
    function closeSettingsModal() { saveState(); settingsModal.querySelector('div').classList.add('scale-90'); settingsModal.classList.add('opacity-0'); setTimeout(() => settingsModal.classList.add('pointer-events-none'), 300); updateAllChrome(); }
    function openHelpModal() { helpModal.classList.remove('opacity-0', 'pointer-events-none'); helpModal.querySelector('div').classList.remove('scale-90'); }
    function closeHelpModal() { helpModal.querySelector('div').classList.add('scale-90'); helpModal.classList.add('opacity-0'); setTimeout(() => helpModal.classList.add('pointer-events-none'), 300); }
    function openCommentModal() { commentModal.classList.remove('opacity-0', 'pointer-events-none'); commentModal.querySelector('div').classList.remove('scale-90'); }
    function closeCommentModal() { commentModal.querySelector('div').classList.add('scale-90'); commentModal.classList.add('opacity-0'); setTimeout(() => commentModal.classList.add('pointer-events-none'), 300); }
    function openShareModal() { closeSettingsModal(); shareModal.classList.remove('opacity-0', 'pointer-events-none'); shareModal.querySelector('div').classList.remove('scale-90'); }
    function closeShareModal() { shareModal.querySelector('div').classList.add('scale-90'); shareModal.classList.add('opacity-0'); setTimeout(() => shareModal.classList.add('pointer-events-none'), 300); }

    // --- CAMERA ---
    function openCameraModal() {
        const s = getCurrentProfileSettings();
        if (s.currentInput === INPUTS.KEY12) { activeCalibrationGrid = grid12Key; Object.assign(grid12Key.style, s.cameraGridConfig12, {display:'grid'}); if(grid9Key) grid9Key.style.display='none'; }
        else { activeCalibrationGrid = grid9Key; Object.assign(grid9Key.style, s.cameraGridConfig9, {display:'grid'}); if(grid12Key) grid12Key.style.display='none'; }
        if (flashSensitivitySlider) { flashSensitivitySlider.value = s.flashSensitivity; updateFlashSensitivityDisplay(s.flashSensitivity); }
        startCameraBtn.style.display = cameraStream ? 'none' : 'block'; startDetectionBtn.style.display = cameraStream ? 'block' : 'none'; stopDetectionBtn.style.display = 'none'; isDetecting = false;
        cameraModal.classList.remove('opacity-0', 'pointer-events-none'); cameraModal.querySelector('div').classList.remove('scale-90');
    }
    function closeCameraModal() { stopDetection(); stopCameraStream(); cameraModal.querySelector('div').classList.add('scale-90'); cameraModal.classList.add('opacity-0'); setTimeout(() => cameraModal.classList.add('pointer-events-none'), 300); }
    async function startCameraStream() {
        if (cameraStream) stopCameraStream();
        try { cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: {ideal:640}, height: {ideal:480} } }); cameraFeed.srcObject = cameraStream; cameraFeed.onloadedmetadata = () => { if (detectionCanvas) { detectionCanvas.width = cameraFeed.videoWidth; detectionCanvas.height = cameraFeed.videoHeight; } }; cameraFeed.play(); startCameraBtn.style.display='none'; startDetectionBtn.style.display='block'; stopDetectionBtn.style.display='none'; } 
        catch (err) { showModal("Camera Error", err.message, closeModal, "OK", ""); }
    }
    function stopCameraStream() { stopDetection(); if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; } cameraFeed.srcObject = null; startCameraBtn.style.display='block'; startDetectionBtn.style.display='none'; stopDetectionBtn.style.display='none'; }
    
    // --- V3 CAMERA ENGINE ---
    function startDetection() { if (isDetecting || !cameraStream || !detectionCanvas) return; isDetecting = true; baselineBrightness.fill(0); lastFlashTime.fill(0); startDetectionBtn.style.display='none'; stopDetectionBtn.style.display='block'; detectionContext = detectionCanvas.getContext('2d', { willReadFrequently: true }); detectionLoopId = requestAnimationFrame(runDetectionLoop); }
    function stopDetection() { isDetecting = false; if (detectionLoopId) cancelAnimationFrame(detectionLoopId); startDetectionBtn.style.display='block'; stopDetectionBtn.style.display='none'; if(activeCalibrationGrid) Array.from(activeCalibrationGrid.children).forEach(c => c.classList.remove('flash-detected')); }
    function runDetectionLoop() {
        if (!isDetecting || !detectionContext || !cameraFeed || !activeCalibrationGrid) { isDetecting = false; return; }
        detectionContext.drawImage(cameraFeed, 0, 0, detectionCanvas.width, detectionCanvas.height);
        let imageData; try { imageData = detectionContext.getImageData(0, 0, detectionCanvas.width, detectionCanvas.height); } catch (e) { detectionLoopId = requestAnimationFrame(runDetectionLoop); return; }
        const fr = cameraFeed.getBoundingClientRect(); const gr = activeCalibrationGrid.getBoundingClientRect();
        const sx = detectionCanvas.width / fr.width; const sy = detectionCanvas.height / fr.height;
        const gpx = (gr.left - fr.left) * sx; const gpy = (gr.top - fr.top) * sy;
        const s = getCurrentProfileSettings(); const is12 = (s.currentInput === INPUTS.KEY12);
        const cols = is12 ? 4 : 3; const rows = is12 ? 3 : 3; const boxW = (gr.width * sx) / cols; const boxH = (gr.height * sy) / rows;
        const now = Date.now(); const sens = s.flashSensitivity || 40;

        for (let i = 0; i < cols * rows; i++) {
            const r = Math.floor(i / cols); const c = i % cols;
            const cx = Math.floor(gpx + (c * boxW) + (boxW / 2)); const cy = Math.floor(gpy + (r * boxH) + (boxH / 2));
            if (cx < 0 || cx >= detectionCanvas.width || cy < 0 || cy >= detectionCanvas.height) continue;
            const idx = (cy * detectionCanvas.width + cx) * 4;
            const b = (imageData.data[idx] + imageData.data[idx+1] + imageData.data[idx+2]) / 3;
            if (baselineBrightness[i] === 0) baselineBrightness[i] = b;
            if (Math.abs(b - baselineBrightness[i]) > sens && (now - lastFlashTime[i] > FLASH_COOLDOWN_MS)) {
                if (isCameraMasterOn) addValue(String(i + 1));
                lastFlashTime[i] = now;
                const el = activeCalibrationGrid.children[i];
                if (el) { el.classList.add('flash-detected'); setTimeout(() => el.classList.remove('flash-detected'), 150); }
            }
            baselineBrightness[i] = (baselineBrightness[i] * (1 - ADAPTIVE_LEARNING_RATE)) + (b * ADAPTIVE_LEARNING_RATE);
        }
        if (isDetecting) detectionLoopId = requestAnimationFrame(runDetectionLoop);
    }

    // --- AUDIO ENGINE ---
    function toggleMicMaster() { isMicMasterOn = !isMicMasterOn; updateMasterButtonStates(); if (isMicMasterOn) startAudioListening(); else stopAudioListening(); }
    async function startAudioListening() {
        if (microphoneStream) return;
        try {
            microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioAnalyser = audioContext.createAnalyser(); audioAnalyser.fftSize = 2048;
            audioContext.createMediaStreamSource(microphoneStream).connect(audioAnalyser);
            runAudioLoop(); showToast("Listening...");
        } catch (e) { showModal("Mic Error", "Check permissions.", closeModal, "OK", ""); isMicMasterOn = false; updateMasterButtonStates(); }
    }
    function stopAudioListening() { if (microphoneStream) { microphoneStream.getTracks().forEach(t => t.stop()); microphoneStream = null; } if (audioContext) { audioContext.close(); audioContext = null; } if (audioProcessLoopId) cancelAnimationFrame(audioProcessLoopId); showToast("Mic Off"); }
    function runAudioLoop() {
        if (!isMicMasterOn || !audioAnalyser) return;
        const len = audioAnalyser.frequencyBinCount; const arr = new Uint8Array(len);
        audioAnalyser.getByteFrequencyData(arr);
        let max = 0, idx = 0; for (let i = 0; i < len; i++) { if (arr[i] > max) { max = arr[i]; idx = i; } }
        if (max > MIC_THRESHOLD) {
            const freq = idx * (audioContext.sampleRate / 2 / len);
            if (freq > 250 && freq < 550) {
                const m = NOTE_MAP.find(n => Math.abs(freq - n.freq) < 8);
                const now = Date.now();
                if (m && (now - lastAudioHitTime > AUDIO_DEBOUNCE_MS)) { addValue(m.val); lastAudioHitTime = now; }
            }
        }
        audioProcessLoopId = requestAnimationFrame(runAudioLoop);
    }

    // --- HELPERS & ACTIONS ---
    function saveGridConfig() {
        if (!activeCalibrationGrid || !cameraFeedContainer) return;
        const s = getCurrentProfileSettings(); const c = cameraFeedContainer.getBoundingClientRect(); const g = activeCalibrationGrid.getBoundingClientRect();
        const cfg = { top: `${((g.top - c.top) / c.height) * 100}%`, left: `${((g.left - c.left) / c.width) * 100}%`, width: `${(g.width / c.width) * 100}%`, height: `${(g.height / c.height) * 100}%` };
        if (s.currentInput === INPUTS.KEY12) s.cameraGridConfig12 = cfg; else s.cameraGridConfig9 = cfg; saveState();
    }
    function vibrate(d = 10) { if (getCurrentProfileSettings().isHapticsEnabled && navigator.vibrate) navigator.vibrate(d); }
    function speak(t) { if (!getCurrentProfileSettings().isAudioEnabled || !window.speechSynthesis) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 1.2; window.lastUtterance = u; window.speechSynthesis.speak(u); }
    function addValue(v) {
        vibrate(); const s = getCurrentState(); const p = getCurrentProfileSettings();
        const idx = (p.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : s.nextSequenceIndex % p.machineCount;
        if (p.currentMode === MODES.UNIQUE_ROUNDS && s.sequences[0].length >= s.currentRound) return;
        if (p.currentMode === MODES.SIMON && s.sequences[idx] && s.sequences[idx].length >= p.sequenceLength) return;
        s.sequences[idx].push(v); s.nextSequenceIndex++; renderSequences();
        if (p.isAutoplayEnabled) {
            if (p.currentMode === MODES.UNIQUE_ROUNDS && s.sequences[0].length === s.currentRound) { disableKeys(true); setTimeout(handleUniqueRoundsDemo, 100); }
            else if (p.currentMode === MODES.SIMON && (s.nextSequenceIndex - 1) % p.machineCount === p.machineCount - 1) setTimeout(handleSimonDemo, 100);
        }
        saveState();
    }
    function disableKeys(d) { document.querySelectorAll(`#pad-${getCurrentProfileSettings().currentInput} button[data-value]`).forEach(k => k.disabled = d); }
    
    // --- BACKSPACE LOGIC ---
    function handleBackspace() {
        vibrate(20); const s = getCurrentState(); const p = getCurrentProfileSettings();
        if (s.nextSequenceIndex === 0) return;
        const idx = (p.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : (s.nextSequenceIndex - 1) % p.machineCount;
        if (s.sequences[idx].length > 0) { s.sequences[idx].pop(); s.nextSequenceIndex--; if(p.currentMode === MODES.UNIQUE_ROUNDS) disableKeys(false); renderSequences(); saveState(); }
    }
    // The Robust Listeners
    function handleBackspaceStart(e) {
        if (e.type === 'touchstart') e.preventDefault(); 
        stopSpeedDeleting(); 
        initialDelayTimer = setTimeout(() => { 
            isHoldingBackspace = true; 
            if (!executeShortcut('longpress_backspace')) speedDeleteInterval = setInterval(handleBackspace, SPEED_DELETE_INTERVAL_MS); 
        }, SPEED_DELETE_INITIAL_DELAY);
    }
    function handleBackspaceEnd(e) {
        if (e.type === 'touchend') e.preventDefault(); 
        const wasHolding = isHoldingBackspace; 
        stopSpeedDeleting(); 
        if (!wasHolding) handleBackspace(); 
    }
    function stopSpeedDeleting() { clearTimeout(initialDelayTimer); clearInterval(speedDeleteInterval); isHoldingBackspace = false; }

    // --- DEMO ---
    function handleCurrentDemo() { const p = getCurrentProfileSettings(); if (p.currentMode === MODES.SIMON) handleSimonDemo(); else handleUniqueRoundsDemo(); }
    function handleSimonDemo() {
        const s = getCurrentState(); const p = getCurrentProfileSettings();
        const pad = `#pad-${p.currentInput}`; const btn = document.querySelector(`${pad} button[data-action="play-demo"]`);
        const seqs = s.sequences.slice(0, p.machineCount); const max = Math.max(...seqs.map(x => x.length));
        if (max === 0 || (btn && btn.disabled)) return;
        const list = []; const chk = (p.machineCount > 1) ? p.simonChunkSize : max;
        for (let c = 0; c < Math.ceil(max / chk); c++) { for (let m = 0; m < p.machineCount; m++) { for (let k = 0; k < chk; k++) { const x = (c * chk) + k; if (x < seqs[m].length) list.push({ m: m, v: seqs[m][x] }); } } }
        if (!list.length) return; btn.disabled = true; disableKeys(true);
        let i = 0; const spd = appSettings.playbackSpeed; const fd = 250 / (spd > 1 ? spd : 1); const pd = DEMO_DELAY_BASE_MS / spd;
        const play = () => {
            if (i < list.length) {
                const { m, v } = list[i]; const k = document.querySelector(`${pad} button[data-value="${v}"]`); const box = sequenceContainer.children[m];
                btn.innerHTML = String(i+1); speak(p.currentInput === INPUTS.PIANO ? PIANO_SPEAK_MAP[v] || v : v);
                const cls = p.currentInput === INPUTS.PIANO ? 'flash' : (p.currentInput === INPUTS.KEY9 ? 'key9-flash' : 'key12-flash');
                if (k) k.classList.add(cls); if (box && p.machineCount > 1) box.classList.add('bg-accent-app', 'scale-[1.02]');
                const nxtM = (i + 1 < list.length) ? list[i + 1].m : -1; let d = pd - fd;
                if (p.machineCount > 1 && nxtM !== -1 && m !== nxtM) d += p.simonInterSequenceDelay;
                setTimeout(() => { if (k) k.classList.remove(cls); if (box && p.machineCount > 1) box.classList.remove('bg-accent-app', 'scale-[1.02]'); setTimeout(play, d); }, fd);
                i++;
            } else { btn.disabled = false; btn.innerHTML = '▶'; disableKeys(false); renderSequences(); }
        }; play();
    }
    function handleUniqueRoundsDemo() {
        const s = getCurrentState(); const p = getCurrentProfileSettings();
        const pad = `#pad-${p.currentInput}`; const btn = document.querySelector(`${pad} button[data-action="play-demo"]`); const seq = s.sequences[0];
        if (!seq.length || (btn.disabled && !p.isUniqueRoundsAutoClearEnabled)) return;
        btn.disabled = true; disableKeys(true);
        let i = 0; const spd = appSettings.playbackSpeed; const fd = 250 / (spd > 1 ? spd : 1); const pd = DEMO_DELAY_BASE_MS / spd;
        const play = () => {
            if (i < seq.length) {
                const v = seq[i]; const k = document.querySelector(`${pad} button[data-value="${v}"]`);
                btn.innerHTML = String(i+1); speak(p.currentInput === INPUTS.PIANO ? PIANO_SPEAK_MAP[v] || v : v);
                const cls = p.currentInput === INPUTS.PIANO ? 'flash' : (p.currentInput === INPUTS.KEY9 ? 'key9-flash' : 'key12-flash');
                if (k) { k.classList.add(cls); setTimeout(() => { k.classList.remove(cls); setTimeout(play, pd - fd); }, fd); } else setTimeout(play, pd);
                i++;
            } else {
                btn.disabled = false; btn.innerHTML = '▶';
                if (p.isUniqueRoundsAutoClearEnabled) setTimeout(() => { 
                    clearInterval(speedDeleteInterval); speedDeleteInterval = setInterval(() => {
                        if (s.sequences[0].length > 0) { s.sequences[0].pop(); s.nextSequenceIndex--; renderSequences(); }
                        else { clearInterval(speedDeleteInterval); s.currentRound++; if (s.currentRound > p.sequenceLength) s.currentRound = 1; renderSequences(); saveState(); disableKeys(false); }
                    }, SPEED_DELETE_INTERVAL_MS);
                }, 300); else disableKeys(false);
            }
        }; play();
    }

    // --- INIT ---
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

    function initializeListeners() {
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#camera-master-btn')) { isCameraMasterOn = !isCameraMasterOn; updateMasterButtonStates(); }
            if (e.target.closest('#mic-master-btn')) { toggleMicMaster(); }
        });
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button'); if (!button) return;
            const { value, action } = button.dataset;
            if (action === 'open-settings') { openSettingsModal(); return; }
            if (action === 'open-help') { closeSettingsModal(); openHelpModal(); return; }
            if (action === 'open-share') { openShareModal(); return; }
            if (action === 'open-comments') { closeSettingsModal(); openCommentModal(); return; }
            if (action === 'open-camera') { closeSettingsModal(); openCameraModal(); return; } 
            if (action === 'copy-link') { navigator.clipboard.writeText(window.location.href); button.innerHTML = "Copied!"; setTimeout(() => button.innerHTML = "Copy Link", 2000); return; }
            if (action === 'restore-defaults') { showModal('Restore Defaults?', 'Are you sure?', () => { localStorage.clear(); location.reload(); }, 'Restore', 'Cancel'); return; }
            if (action === 'reset-unique-rounds') { executeShortcut('reset_rounds'); return; }
            if (action === 'play-demo' && getCurrentProfileSettings().currentInput === button.dataset.input) { handleCurrentDemo(); return; }
            if (value && getCurrentProfileSettings().currentInput === button.dataset.input) { addValue(value); }
        });
        
        allVoiceInputs.forEach(input => { input.addEventListener('input', (e) => { if (e.target.value) { processVoiceTranscript(e.target.value); e.target.value = ''; } }); });
        
        // --- FIXED BACKSPACE LISTENERS (TOUCH SUPPORT) ---
        document.querySelectorAll('button[data-action="backspace"]').forEach(btn => {
            btn.addEventListener('mousedown', handleBackspaceStart);
            btn.addEventListener('touchstart', handleBackspaceStart, { passive: false });
            btn.addEventListener('mouseup', handleBackspaceEnd);
            btn.addEventListener('touchend', handleBackspaceEnd);
            btn.addEventListener('mouseleave', stopSpeedDeleting);
        });
        
        if (closeGameSetupModalBtn) closeGameSetupModalBtn.addEventListener('click', closeGameSetupModal);
        if (dontShowWelcomeToggle) dontShowWelcomeToggle.addEventListener('change', (e) => { appSettings.showWelcomeScreen = !e.target.checked; saveState(); });
        if (configSelect) configSelect.addEventListener('change', (e) => switchActiveProfile(e.target.value));
        if (configAddBtn) configAddBtn.addEventListener('click', handleConfigAdd);
        if (configRenameBtn) configRenameBtn.addEventListener('click', handleConfigRename);
        if (configDeleteBtn) configDeleteBtn.addEventListener('click', handleConfigDelete);
        if (quickOpenHelpBtn) quickOpenHelpBtn.addEventListener('click', () => { closeGameSetupModal(); openHelpModal(); });
        if (quickOpenSettingsBtn) quickOpenSettingsBtn.addEventListener('click', () => { closeGameSetupModal(); openSettingsModal(); });
        if (globalResizeUpBtn) globalResizeUpBtn.addEventListener('click', () => { appSettings.globalUiScale += 10; applyGlobalUiScale(appSettings.globalUiScale); saveState(); });
        if (globalResizeDownBtn) globalResizeDownBtn.addEventListener('click', () => { appSettings.globalUiScale -= 10; applyGlobalUiScale(appSettings.globalUiScale); saveState(); });
        if (closeSettings) closeSettings.addEventListener('click', closeSettingsModal);
        if (settingsTabNav) settingsTabNav.addEventListener('click', (e) => { const btn = e.target.closest('button'); if (btn) switchSettingsTab(btn.dataset.tab); });
        if (openGameSetupFromSettings) openGameSetupFromSettings.addEventListener('click', () => { closeSettingsModal(); openGameSetupModal(); });
        
        const addSettingListener = (el, key, type='value') => {
            if (el) el.addEventListener('input', (e) => {
                const p = getCurrentProfileSettings();
                let val = (type==='checked') ? e.target.checked : e.target.value;
                if (type==='int') val = parseInt(val) || 0;
                if (key === 'uiScaleMultiplier') val = val / 100;
                p[key] = val;
                if(el===machinesSlider) updateMachinesDisplay(val, machinesDisplay);
                if(el===sequenceLengthSlider) updateSequenceLengthDisplay(val, sequenceLengthDisplay);
                if(el===chunkSlider) updateChunkDisplay(val, chunkDisplay);
                if(el===delaySlider) updateDelayDisplay(val, delayDisplay);
                if(el===uiScaleSlider) updateScaleDisplay(val, uiScaleDisplay);
                if(el===flashSensitivitySlider) updateFlashSensitivityDisplay(val);
                if(el===autoInputSlider || el===voiceInputToggle) updateAllChrome(); 
                updateSettingsModalVisibility();
            });
        };
        
        addSettingListener(inputSelect, 'currentInput');
        addSettingListener(modeToggle, 'currentMode', 'checked');
        addSettingListener(machinesSlider, 'machineCount', 'int');
        addSettingListener(sequenceLengthSlider, 'sequenceLength', 'int');
        addSettingListener(chunkSlider, 'simonChunkSize', 'int');
        addSettingListener(delaySlider, 'simonInterSequenceDelay', 'int');
        addSettingListener(autoclearToggle, 'isUniqueRoundsAutoClearEnabled', 'checked');
        addSettingListener(uiScaleSlider, 'uiScaleMultiplier', 'int');
        addSettingListener(shakeSensitivitySlider, 'shakeSensitivity', 'int');
        addSettingListener(autoplayToggle, 'isAutoplayEnabled', 'checked');
        addSettingListener(speedDeleteToggle, 'isSpeedDeletingEnabled', 'checked');
        addSettingListener(audioToggle, 'isAudioEnabled', 'checked');
        addSettingListener(voiceInputToggle, 'isVoiceInputEnabled', 'checked');
        addSettingListener(hapticsToggle, 'isHapticsEnabled', 'checked');
        addSettingListener(autoInputSlider, 'autoInputMode', 'value');
        addSettingListener(flashSensitivitySlider, 'flashSensitivity', 'int');
        
        if (playbackSpeedSlider) playbackSpeedSlider.addEventListener('input', (e) => { appSettings.playbackSpeed = (parseInt(e.target.value)||100) / 100; updatePlaybackSpeedDisplay(e.target.value, playbackSpeedDisplay); });
        if (showWelcomeToggle) showWelcomeToggle.addEventListener('change', (e) => { appSettings.showWelcomeScreen = e.target.checked; });
        if (darkModeToggle) darkModeToggle.addEventListener('change', (e) => updateTheme(e.target.checked));
        if (addShortcutBtn) addShortcutBtn.addEventListener('click', () => { getCurrentProfileSettings().shortcuts.push({ id: `sc_${Date.now()}`, trigger: 'none', action: 'none' }); renderShortcutList(); });
        if (shortcutListContainer) shortcutListContainer.addEventListener('change', (e) => {
            const row = e.target.closest('.shortcut-row'); if(!row) return;
            const sc = getCurrentProfileSettings().shortcuts.find(x => x.id === row.dataset.id);
            if (e.target.classList.contains('shortcut-trigger')) sc.trigger = e.target.value;
            if (e.target.classList.contains('shortcut-action')) sc.action = e.target.value;
        });
        if (shortcutListContainer) shortcutListContainer.addEventListener('click', (e) => {
             if(e.target.closest('.shortcut-delete-btn')) {
                 const id = e.target.closest('.shortcut-row').dataset.id;
                 getCurrentProfileSettings().shortcuts = getCurrentProfileSettings().shortcuts.filter(x => x.id !== id);
                 renderShortcutList();
             }
        });
        
        if (closeHelp) closeHelp.addEventListener('click', closeHelpModal);
        if (closeShare) closeShare.addEventListener('click', closeShareModal);
        if (closeCommentModalBtn) closeCommentModalBtn.addEventListener('click', closeCommentModal);
        if (submitCommentBtn) submitCommentBtn.addEventListener('click', handleSubmitComment);
        
        if (closeCameraModalBtn) closeCameraModalBtn.addEventListener('click', closeCameraModal);
        if (startCameraBtn) startCameraBtn.addEventListener('click', startCameraStream);
        if (startDetectionBtn) startDetectionBtn.addEventListener('click', startDetection);
        if (stopDetectionBtn) stopDetectionBtn.addEventListener('click', stopDetection);

        const initGridDragger = (el) => {
            if (!el) return;
            let sx, sy, sl, st;
            const start = e => { isDraggingGrid=true; activeCalibrationGrid=el; sx=e.clientX||e.touches[0].clientX; sy=e.clientY||e.touches[0].clientY; sl=el.offsetLeft; st=el.offsetTop; window.addEventListener('mousemove', move); window.addEventListener('mouseup', end); window.addEventListener('touchmove', move, {passive:false}); window.addEventListener('touchend', end); };
            const move = e => { if(!isDraggingGrid) return; e.preventDefault(); const cx=e.clientX||e.touches[0].clientX; const cy=e.clientY||e.touches[0].clientY; const r=cameraFeedContainer.getBoundingClientRect(); el.style.left = `${((sl+cx-sx)/r.width)*100}%`; el.style.top = `${((st+cy-sy)/r.height)*100}%`; };
            const end = () => { isDraggingGrid=false; saveGridConfig(); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end); };
            el.addEventListener('mousedown', start); el.addEventListener('touchstart', start, {passive:false});
        };
        initGridDragger(grid9Key); initGridDragger(grid12Key);
        if (window.DeviceMotionEvent) window.addEventListener('devicemotion', handleShake);
    }
    function applyGlobalUiScale(scale) { document.documentElement.style.fontSize = `${scale}%`; }
    function updateMasterButtonStates() {
        allCameraMasterBtns.forEach(b => b.classList.toggle('master-active', isCameraMasterOn));
        allMicMasterBtns.forEach(b => b.classList.toggle('master-active', isMicMasterOn));
    }
    function updateAllChrome() {
        const s = getCurrentProfileSettings();
        padKey9.style.display = (s.currentInput === INPUTS.KEY9) ? 'block' : 'none';
        padKey12.style.display = (s.currentInput === INPUTS.KEY12) ? 'block' : 'none';
        padPiano.style.display = (s.currentInput === INPUTS.PIANO) ? 'block' : 'none';
        const mode = s.autoInputMode;
        allCameraMasterBtns.forEach(b => b.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.PATTERN));
        allMicMasterBtns.forEach(b => b.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.TONE));
        allVoiceInputs.forEach(v => v.classList.toggle('hidden', !s.isVoiceInputEnabled));
        updateMasterButtonStates(); renderSequences();
    }

    window.onload = function() {
        loadState(); 
        assignDomElements();
        applyGlobalUiScale(appSettings.globalUiScale);
        updateTheme(appSettings.isDarkMode);
        initializeListeners();
        updateAllChrome();
        initCommentListener();
        if (appSettings.showWelcomeScreen) setTimeout(openGameSetupModal, 500);
        if (getCurrentProfileSettings().isAudioEnabled) speak(" ");
    };

})();
