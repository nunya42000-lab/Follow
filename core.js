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
    flashKey = deps.flashKey; 
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
        return { settings: JSON.parse(JSON.stringify(DEFAULT_APP)), state: {} }; 
    } 
}

// --- GAME ACTIONS ---
export function startPracticeRound() {
    const appSettings = getAppSettings();
    const state = getState(); 
    const settings = getProfileSettings(); 
    const max = (settings.currentInput === 'key12') ? 12 : 9;
    
    const getRand = () => { 
        if(settings.currentInput === 'piano') { 
            const keys = ['C','D','E','F','G','A','B','1','2','3','4','5']; 
            return keys[Math.floor(Math.random()*keys.length)]; 
        } 
        return Math.floor(Math.random() * max) + 1; 
    };

    if(practiceSequence.length === 0) state.currentRound = 1;

    if(settings.currentMode === CONFIG.MODES.SIMON) {
        practiceSequence.push(getRand());
        state.currentRound = practiceSequence.length;
    } else {
        practiceSequence = []; 
        const len = state.currentRound; 
        for(let i=0; i<len; i++) practiceSequence.push(getRand());
    }
    
    practiceInputIndex = 0; 
    renderUI(); 
    showToast(`Practice Round ${state.currentRound}`, appSettings); 
    setTimeout(() => playPracticeSequence(), 1000);
}

export function playPracticeSequence() {
    const appSettings = getAppSettings();
    disableInput(true); 
    let i = 0; 
    const speed = appSettings.playbackSpeed || 1.0;
    
    function next() {
        if(i >= practiceSequence.length) { disableInput(false); return; }
        const val = practiceSequence[i]; 
        if(flashKey) flashKey(val);
        speak(val, appSettings); 
        i++; 
        setTimeout(next, 800 / speed);
    } 
    next();
}

export function addValue(value) {
    const appSettings = getAppSettings();
    vibrate(appSettings); 
    const state = getState(); 
    const settings = getProfileSettings();
    
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
            setTimeout(() => playPracticeSequence(), 1500); 
        } 
        return;
    }
    
    let targetIndex = 0; 
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    const roundNum = parseInt(state.currentRound) || 1;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    let limit = isUnique ? (appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength) : settings.sequenceLength;
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) return;

    if (state.sequences.every(s => s.length === 0)) {
        if (appSettings.isAutoTimerEnabled && globalTimerActions.start) globalTimerActions.start();
        if (appSettings.isAutoCounterEnabled && globalCounterActions.increment) globalCounterActions.increment();
    }

    state.sequences[targetIndex].push(value); 
    state.nextSequenceIndex++; 
    renderUI(); 
    saveState(appSettings, { current_session: state });
    
    if(appSettings.isAutoplayEnabled) setTimeout(playDemo, 250);
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

export function playDemo() {
    if(isDemoPlaying) return;
    const appSettings = getAppSettings();
    isDemoPlaying = true;
    isPlaybackPaused = false;

    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    const playBtn = document.querySelector('button[data-action="play-demo"]'); 
    
    let seqsToPlay = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    const chunkSize = settings.simonChunkSize || 3;
    let chunks = [];
    let maxLen = 0;
    seqsToPlay.forEach(s => { if(s.length > maxLen) maxLen = s.length; });
    
    for(let i=0; i<maxLen; i+=chunkSize) {
        for(let m=0; m<seqsToPlay.length; m++) {
            const seq = seqsToPlay[m];
            if(i < seq.length) {
                chunks.push({ machine: m, nums: seq.slice(i, i+chunkSize) });
            }
        }
    }

    let cIdx = 0;
    const schedule = (fn, delay) => {
        setTimeout(() => {
            if(!isDemoPlaying) return; 
            if(isPlaybackPaused) { playbackResumeCallback = fn; } else { fn(); }
        }, delay);
    };

    function nextChunk() {
        if(!isDemoPlaying) return;
        if(cIdx >= chunks.length) { 
            isDemoPlaying = false; 
            if(playBtn) playBtn.textContent = "▶";
            return; 
        }
        const chunk = chunks[cIdx];
        let nIdx = 0;
        
        function playNum() {
            if(!isDemoPlaying) return;
            if(nIdx >= chunk.nums.length) { cIdx++; schedule(nextChunk, settings.simonInterSequenceDelay || 0); return; }
            const val = chunk.nums[nIdx];
            if(flashKey) flashKey(val);
            speak(val, appSettings);
            if(appSettings.isHapticMorseEnabled) vibrateMorse(val, appSettings);
            nIdx++;
            schedule(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}
