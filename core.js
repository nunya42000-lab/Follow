import { CONFIG, DEFAULT_APP } from './constants.js';
import { vibrate, speak, showToast, vibrateMorse } from './utils.js';

// --- INJECTED DEPENDENCIES ---
let getAppSettings, getState, getProfileSettings, renderUI, disableInput, globalTimerActions, globalCounterActions, flashKey;

// --- LOCAL CORE STATE ---
export let practiceSequence = [];
export let practiceInputIndex = 0;
export let isDemoPlaying = false;
export let isPlaybackPaused = false;
export let playbackResumeCallback = null;

export function setDemoPlaying(val) { isDemoPlaying = val; }
export function setPlaybackPaused(val) { isPlaybackPaused = val; }
export function setPlaybackResumeCallback(cb) { playbackResumeCallback = cb; }
export function setPracticeInputIndex(val) { practiceInputIndex = val; }
export function resetPracticeSequence() { practiceSequence = []; }

// --- INITIALIZATION ---
export function initCore(deps) {
    getAppSettings = deps.getAppSettings;
    getState = deps.getState;
    getProfileSettings = deps.getProfileSettings;
    renderUI = deps.renderUI;
    disableInput = deps.disableInput;
    globalTimerActions = deps.globalTimerActions;
    globalCounterActions = deps.globalCounterActions;
    flashKey = deps.flashKey; // To blink buttons during playback
}

// --- STORAGE LOGIC ---
export function saveState(appSettings, appState) { 
    localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); 
    localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState)); 
}

export function loadState() { 
    try { 
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS); 
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE); 
        let settings = s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_APP));
        let state = st ? JSON.parse(st) : {};
        
        if(!state['current_session']) {
            state['current_session'] = { 
                sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), 
                nextSequenceIndex: 0, 
                currentRound: 1 
            };
        }
        return { settings, state };
    } catch(e) { 
        console.error("Load failed", e); 
        return { settings: JSON.parse(JSON.stringify(DEFAULT_APP)), state: {} }; 
    } 
}

// --- GAME ACTIONS ---
export function addValue(value) {
    const appSettings = getAppSettings();
    vibrate(appSettings); 
    const state = getState(); 
    const settings = getProfileSettings();
    
    // Practice Mode Logic
    if(appSettings.isPracticeModeEnabled) {
        if(practiceSequence.length === 0) return; 
        if(value == practiceSequence[practiceInputIndex]) { 
            practiceInputIndex++; 
            if(practiceInputIndex >= practiceSequence.length) { 
                speak("Correct", appSettings); 
                state.currentRound++; 
                setTimeout(startPracticeRound, 1500); 
            } 
        } else { 
            speak("Wrong", appSettings); 
            if(navigator.vibrate) navigator.vibrate(500); 
            setTimeout(() => playPracticeSequence(), 1500); 
        } 
        return;
    }
    
    // Standard Mode Logic
    let targetIndex = 0; 
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    const roundNum = parseInt(state.currentRound) || 1;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    let limit = isUnique ? (appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength) : settings.sequenceLength;
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
        if (isUnique && appSettings.isUniqueRoundsAutoClearEnabled) { 
            showToast("Round Full - Reset? 🛑", appSettings); 
            vibrate(appSettings); 
        }
        return;
    }

    // Timer/Counter Triggers
    let isFirstInput = state.sequences.every(s => s.length === 0);
    if (isFirstInput) {
        if (appSettings.isAutoTimerEnabled && globalTimerActions.start) globalTimerActions.start();
        if (appSettings.isAutoCounterEnabled && globalCounterActions.increment) globalCounterActions.increment();
    }

    state.sequences[targetIndex].push(value); 
    state.nextSequenceIndex++; 
    renderUI(); 
    saveState(appSettings, { current_session: state });
    
    if(appSettings.isAutoplayEnabled) {
        setTimeout(playDemo, 250);
    }
}

export function handleBackspace() { 
    const appSettings = getAppSettings();
    const state = getState();
    const settings = getProfileSettings();
    
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
         if(state.sequences[0].length > 0) { state.sequences[0].pop(); state.nextSequenceIndex--; }
    } else {
        let target = (state.nextSequenceIndex - 1) % settings.machineCount;
        if (target < 0) target = settings.machineCount - 1; 
        if(state.sequences[target]?.length > 0) { state.sequences[target].pop(); state.nextSequenceIndex--; }
    }
    
    if (state.sequences.every(s => s.length === 0) && globalTimerActions.stop) {
        globalTimerActions.stop();
    }

    renderUI(); 
    saveState(appSettings, { current_session: state }); 
}

// ... (startPracticeRound, playPracticeSequence, and playDemo remain as previously modularized)
