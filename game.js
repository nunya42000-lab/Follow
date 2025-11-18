// game.js
import { DOM } from './dom.js';
import { getCurrentState, getCurrentProfileSettings, saveState, appSettings, getInitialState } from './state.js';
import { renderSequences, showModal, closeModal, showToast, updateTheme, updateMainUIControlsVisibility } from './ui.js';
import { vibrate, speak } from './utils.js';
import { MODES, MAX_MACHINES, INPUTS, DEMO_DELAY_BASE_MS, PIANO_SPEAK_MAP, SHORTCUT_TRIGGERS, SHORTCUT_ACTIONS, SPEED_DELETE_INITIAL_DELAY, SPEED_DELETE_INTERVAL_MS } from './config.js';
import { startDetection } from './camera.js';

let initialDelayTimer = null;
let speedDeleteInterval = null;
let isHoldingBackspace = false;

// --- CORE ---
export function addValue(value) {
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

export function handleBackspace() {
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

export function resetUniqueRoundsMode() {
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

// --- SPEED DELETE LOGIC ---
export function stopSpeedDeleting() {
    if (initialDelayTimer) clearTimeout(initialDelayTimer);
    if (speedDeleteInterval) clearInterval(speedDeleteInterval);
    initialDelayTimer = null;
    speedDeleteInterval = null;
    isHoldingBackspace = false;
}

export function handleBackspaceStart(event) {
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

export function handleBackspaceEnd() {
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

// --- DEMOS ---
const getSpeedMultiplier = () => appSettings.playbackSpeed;

export function handleCurrentDemo() {
    const profileSettings = getCurrentProfileSettings();
    if (profileSettings.currentMode === MODES.SIMON) {
        handleSimonDemo();
    } else {
        handleUniqueRoundsDemo();
    }
}

export function handleSimonDemo() {
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
            const seqBox = DOM.sequenceContainer.children[seqIndex];
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

export function handleUniqueRoundsDemo() {
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

// --- SHORTCUTS ---
export function executeShortcut(triggerKey) {
    const profileSettings = getCurrentProfileSettings();
    if (!profileSettings || !profileSettings.shortcuts) return false;
    
    const shortcut = profileSettings.shortcuts.find(sc => sc.trigger === triggerKey);
    
    if (!shortcut || shortcut.action === 'none') return false;

    vibrate(50); 
    
    // Imported lazily or we use the DOM module to find buttons to click
    // To keep this clean, we implement logic here or call UI functions
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
            if (DOM.autoplayToggle) DOM.autoplayToggle.checked = profileSettings.isAutoplayEnabled;
            if (DOM.quickAutoplayToggle) DOM.quickAutoplayToggle.checked = profileSettings.isAutoplayEnabled;
            showToast(`Autoplay: ${profileSettings.isAutoplayEnabled ? 'On' : 'Off'}`);
            break;
        case 'toggle_audio':
            profileSettings.isAudioEnabled = !profileSettings.isAudioEnabled;
            if (DOM.audioToggle) DOM.audioToggle.checked = profileSettings.isAudioEnabled;
            if (DOM.quickAudioToggle) DOM.quickAudioToggle.checked = profileSettings.isAudioEnabled;
            showToast(`Audio: ${profileSettings.isAudioEnabled ? 'On' : 'Off'}`);
            break;
        case 'toggle_haptics':
            profileSettings.isHapticsEnabled = !profileSettings.isHapticsEnabled;
            if (DOM.hapticsToggle) DOM.hapticsToggle.checked = profileSettings.isHapticsEnabled;
            showToast(`Haptics: ${profileSettings.isHapticsEnabled ? 'On' : 'Off'}`);
            break;
        case 'toggle_dark_mode':
            updateTheme(!appSettings.isDarkMode);
            if (DOM.darkModeToggle) DOM.darkModeToggle.checked = appSettings.isDarkMode;
            showToast(`Dark Mode: ${appSettings.isDarkMode ? 'On' : 'Off'}`);
            break;
        case 'open_settings':
             // Use DOM to click the button or toggle class manually
            if (DOM.settingsModal.classList.contains('opacity-0')) { 
                DOM.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
                DOM.settingsModal.querySelector('div').classList.remove('scale-90');
            } else { 
                DOM.settingsModal.querySelector('div').classList.add('scale-90');
                DOM.settingsModal.classList.add('opacity-0');
                setTimeout(() => DOM.settingsModal.classList.add('pointer-events-none'), 300);
            }
            break;
        case 'open_help':
             // Simplified open help
             DOM.helpModal.classList.remove('opacity-0', 'pointer-events-none');
             DOM.helpModal.querySelector('div').classList.remove('scale-90');
            break;
        default:
            console.warn(`Unknown shortcut action: ${shortcut.action}`);
            return false;
    }
    return true;
}
