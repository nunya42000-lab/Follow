// ==========================================
// core.js - STABLE ENGINE & LOGIC
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4",
  authDomain: "follow-me-app-de3e9.firebaseapp.com",
  projectId: "follow-me-app-de3e9",
  storageBucket: "follow-me-app-de3e9.firebasestorage.app",
  messagingSenderId: "957006680126",
  appId: "1:957006680126:web:6d679717d9277fd9ae816f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- CONSTANTS ---
export const SETTINGS_KEY = 'followMeAppSettings_v7';
export const STATE_KEY = 'followMeAppState_v7';
export const MAX_MACHINES = 4;
export const DEMO_DELAY_BASE_MS = 798;
export const INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
export const MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };
export const AUTO_INPUT_MODES = { OFF: '0', TONE: '1', PATTERN: '2' };

export const PIANO_SPEAK_MAP = {
    'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B',
    '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
};

// --- DEFAULTS ---
export const DEFAULT_PROFILE_SETTINGS = {
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

export const DEFAULT_APP_SETTINGS = {
    globalUiScale: 100,
    isDarkMode: true,
    showWelcomeScreen: true,
    isConfirmationsEnabled: true,
    activeProfileId: 'profile_1',
    profiles: {},
    playbackSpeed: 1.0,
};

export const PREMADE_PROFILES = {
    'profile_1': { name: "Follow Me", settings: { ...DEFAULT_PROFILE_SETTINGS } },
    'profile_2': { name: "2 Machines", settings: { ...DEFAULT_PROFILE_SETTINGS, machineCount: 2, simonChunkSize: 4, simonInterSequenceDelay: 200 }},
    'profile_3': { name: "Bananas", settings: { ...DEFAULT_PROFILE_SETTINGS, sequenceLength: 25 }},
    'profile_4': { name: "Piano", settings: { ...DEFAULT_PROFILE_SETTINGS, currentInput: INPUTS.PIANO }},
    'profile_5': { name: "15 Rounds", settings: { ...DEFAULT_PROFILE_SETTINGS, currentMode: MODES.UNIQUE_ROUNDS, sequenceLength: 15 }}
};

// --- STATE ---
export let appSettings = { ...DEFAULT_APP_SETTINGS };
export let appState = {}; 

// --- EXPORTED HELPERS ---
export const getCurrentProfileSettings = () => appSettings.profiles[appSettings.activeProfileId]?.settings;
export const getCurrentState = () => appState[appSettings.activeProfileId];

export function updateAppSettings(newSettings) {
    appSettings = { ...appSettings, ...newSettings };
}

export function saveState() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
        localStorage.setItem(STATE_KEY, JSON.stringify(appState));
    } catch (error) {
        console.error("Failed to save state:", error);
    }
}

export function loadState() {
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

        if (storedState) { appState = JSON.parse(storedState); }
        Object.keys(appSettings.profiles).forEach(profileId => { if (!appState[profileId]) appState[profileId] = getInitialState(); });
        if (!appSettings.profiles[appSettings.activeProfileId]) appSettings.activeProfileId = Object.keys(appSettings.profiles)[0] || 'profile_1';
    } catch (error) {
        console.error("Failed to load state:", error);
        localStorage.removeItem(SETTINGS_KEY);
        localStorage.removeItem(STATE_KEY);
        appSettings = { ...DEFAULT_APP_SETTINGS };
        appSettings.profiles = {};
        Object.keys(PREMADE_PROFILES).forEach(id => { appSettings.profiles[id] = { name: PREMADE_PROFILES[id].name, settings: { ...PREMADE_PROFILES[id].settings, shortcuts: [] } }; });
        appState = {};
        Object.keys(appSettings.profiles).forEach(profileId => { appState[profileId] = getInitialState(); });
    }
}

export function getInitialState() {
    return { sequences: Array.from({ length: MAX_MACHINES }, () => []), nextSequenceIndex: 0, currentRound: 1 };
}

// --- DOM HELPERS ---
let customModal, modalTitle, modalMessage, modalConfirm, modalCancel;

export function initCoreDom() {
    customModal = document.getElementById('custom-modal'); 
    modalTitle = document.getElementById('modal-title'); 
    modalMessage = document.getElementById('modal-message'); 
    modalConfirm = document.getElementById('modal-confirm'); 
    modalCancel = document.getElementById('modal-cancel');
}

export function showModal(title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel', isConfirmation = true) {
    if (isConfirmation && !appSettings.isConfirmationsEnabled) { onConfirm(); return; }
    if (!customModal) initCoreDom();
    if (!customModal) return;
    
    modalTitle.textContent = title; 
    modalMessage.textContent = message;
    const newConfirmBtn = modalConfirm.cloneNode(true); newConfirmBtn.textContent = confirmText;
    modalConfirm.parentNode.replaceChild(newConfirmBtn, modalConfirm); modalConfirm = newConfirmBtn; 
    const newCancelBtn = modalCancel.cloneNode(true); newCancelBtn.textContent = cancelText;
    modalCancel.parentNode.replaceChild(newCancelBtn, modalCancel); modalCancel = newCancelBtn; 
    
    modalConfirm.addEventListener('click', () => { onConfirm(); closeModal(); }); 
    modalCancel.addEventListener('click', closeModal); 
    modalCancel.style.display = cancelText ? 'inline-block' : 'none';
    modalConfirm.className = (confirmText === 'Restore' || confirmText === 'Reset' || confirmText === 'Delete' || confirmText === 'Clear All') ? 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-btn-control-red hover:bg-btn-control-red-active' : 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-primary-app hover:bg-secondary-app';
    
    customModal.classList.remove('opacity-0', 'pointer-events-none');
    customModal.querySelector('div').classList.remove('scale-90');
}

export function closeModal() {
    if (customModal) {
        customModal.querySelector('div').classList.add('scale-90');
        customModal.classList.add('opacity-0');
        setTimeout(() => customModal.classList.add('pointer-events-none'), 300);
    }
}

export function showToast(message) {
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    if (!toastMessage || !toastNotification) return;
    toastMessage.textContent = message;
    toastNotification.classList.remove('opacity-0', '-translate-y-10');
    setTimeout(() => {
        toastNotification.classList.add('opacity-0', '-translate-y-10');
    }, 2000);
}

export function vibrate(duration = 10) {
    if (getCurrentProfileSettings()?.isHapticsEnabled && 'vibrate' in navigator) navigator.vibrate(duration);
}

export function speak(text) {
    if (getCurrentProfileSettings()?.isAudioEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 1.2; window.speechSynthesis.speak(u);
    }
}

// --- GAME LOGIC ---

export function renderSequences() {
    const sequenceContainer = document.getElementById('sequence-container');
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    if (!state || !profileSettings || !sequenceContainer) return; 
    
    const { machineCount, currentMode } = profileSettings;
    const { sequences } = state;
    const activeSequences = (currentMode === MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : sequences.slice(0, machineCount);
    
    sequenceContainer.innerHTML = '';
    const currentTurnIndex = state.nextSequenceIndex % machineCount;
    let layoutClasses = 'gap-4 flex-grow mb-6 transition-all duration-300 pt-1 ';
    let numColumns = 5;

    if (currentMode === MODES.SIMON) {
        if (machineCount === 1) { layoutClasses += ' flex flex-col max-w-xl mx-auto'; numColumns = 5; } 
        else if (machineCount === 2) { layoutClasses += ' grid grid-cols-2 max-w-3xl mx-auto'; numColumns = 4; } 
        else if (machineCount === 3) { layoutClasses += ' grid grid-cols-3 max-w-4xl mx-auto'; numColumns = 4; } 
        else if (machineCount === 4) { layoutClasses += ' grid grid-cols-4 max-w-5xl mx-auto'; numColumns = 3; }
    } else { layoutClasses += ' flex flex-col max-w-2xl mx-auto'; numColumns = 5; }
    sequenceContainer.className = layoutClasses;

    if (currentMode === MODES.UNIQUE_ROUNDS) {
        const roundDisplay = document.createElement('div');
        roundDisplay.className = 'text-center text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100';
        roundDisplay.textContent = `Round: ${state.currentRound} / ${profileSettings.sequenceLength}`;
        sequenceContainer.appendChild(roundDisplay);
    }
    
    let gridClass = numColumns > 0 ? `grid grid-cols-${numColumns}` : 'flex flex-wrap';
    const baseSize = 40, baseFont = 1.1;
    const newSize = baseSize * profileSettings.uiScaleMultiplier;
    const sizeStyle = `height: ${newSize}px; line-height: ${newSize}px; font-size: ${baseFont * profileSettings.uiScaleMultiplier}rem;`;

    activeSequences.forEach((set, index) => {
        const isCurrent = (currentTurnIndex === index && machineCount > 1 && currentMode === MODES.SIMON);
        const sequenceDiv = document.createElement('div');
        const originalClasses = `p-4 rounded-xl shadow-md transition-all duration-200 ${isCurrent ? 'bg-accent-app scale-[1.02] shadow-lg text-gray-900' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'}`;
        sequenceDiv.className = originalClasses;
        sequenceDiv.dataset.originalClasses = originalClasses; // Helper for demo
        sequenceDiv.innerHTML = `<div class="${gridClass} gap-2 min-h-[50px]">${set.map(val => `<span class="number-box bg-secondary-app text-white rounded-xl text-center shadow-sm" style="${sizeStyle}">${val}</span>`).join('')}</div>`;
        sequenceContainer.appendChild(sequenceDiv);
    });
}

export function addValue(value) {
    vibrate();
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    const mode = profileSettings.currentMode;
    let targetIndex = (mode === MODES.UNIQUE_ROUNDS) ? 0 : state.nextSequenceIndex % profileSettings.machineCount;
    
    if (mode === MODES.UNIQUE_ROUNDS && state.sequences[0].length >= state.currentRound) return;
    if (mode === MODES.SIMON && state.sequences[targetIndex].length >= profileSettings.sequenceLength) return;

    state.sequences[targetIndex].push(value);
    state.nextSequenceIndex++;
    renderSequences();
    
    if (profileSettings.isAutoplayEnabled) {
        if (mode === MODES.UNIQUE_ROUNDS && state.sequences[0].length === state.currentRound) {
            document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`).forEach(key => key.disabled = true);
            setTimeout(handleUniqueRoundsDemo, 100); 
        } else if (mode === MODES.SIMON && (state.nextSequenceIndex - 1) % profileSettings.machineCount === profileSettings.machineCount - 1) {
            setTimeout(handleSimonDemo, 100);
        }
    }
    saveState();
}

export function handleBackspace() {
    vibrate(20);
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    if (state.nextSequenceIndex === 0) return; 
    const targetSet = state.sequences[(profileSettings.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : (state.nextSequenceIndex - 1) % profileSettings.machineCount];
    if (targetSet.length > 0) {
        targetSet.pop(); state.nextSequenceIndex--; 
        if (profileSettings.currentMode === MODES.UNIQUE_ROUNDS) document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`).forEach(key => key.disabled = false);
        renderSequences(); saveState();
    }
}

export function resetUniqueRoundsMode() {
    const state = getCurrentState();
    state.currentRound = 1; state.sequences = Array.from({ length: MAX_MACHINES }, () => []); state.nextSequenceIndex = 0;
    document.querySelectorAll(`#pad-${getCurrentProfileSettings().currentInput} button[data-value]`).forEach(key => key.disabled = false);
    renderSequences(); saveState();
}

// --- DEMO LOGIC ---
export function handleSimonDemo() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    const input = profileSettings.currentInput;
    const padSelector = `#pad-${input}`;
    const flashClass = input === 'piano' ? 'flash' : (input === 'key9' ? 'key9-flash' : 'key12-flash');
    const demoButton = document.querySelector(`${padSelector} button[data-action="play-demo"]`);
    const inputKeys = document.querySelectorAll(`${padSelector} button[data-value]`);
    const speedMultiplier = appSettings.playbackSpeed;
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
            const seqBox = document.getElementById('sequence-container').children[item.seqIndex];
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

export function handleUniqueRoundsDemo() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    const input = profileSettings.currentInput;
    const padSelector = `#pad-${input}`;
    const flashClass = input === 'piano' ? 'flash' : (input === 'key9' ? 'key9-flash' : 'key12-flash');
    const sequenceToPlay = state.sequences[0]; 
    const demoButton = document.querySelector(`${padSelector} button[data-action="play-demo"]`);
    const allKeys = document.querySelectorAll(`${padSelector} button[data-value]`);
    const speedMultiplier = appSettings.playbackSpeed;
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

export function clearUniqueRoundsSequence() {
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

export function advanceToUniqueRound() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    state.currentRound++;
    if (state.currentRound > profileSettings.sequenceLength) {
        state.currentRound = 1;
        showModal('Complete!', `Finished all rounds. Resetting.`, () => closeModal(), 'OK', '', false);
    }
    renderSequences();
    saveState();
    document.querySelectorAll(`#pad-${profileSettings.currentInput} button[data-value]`).forEach(key => key.disabled = false);
}

export function handleCurrentDemo() {
    (getCurrentProfileSettings().currentMode === MODES.SIMON) ? handleSimonDemo() : handleUniqueRoundsDemo();
}
