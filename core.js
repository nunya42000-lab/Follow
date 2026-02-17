import { CONFIG } from './constants.js';
import { vibrate, speak, showToast, vibrateMorse } from './utils.js';

// --- DEPENDENCIES INJECTED FROM APP.JS ---
let getAppSettings, getState, getProfileSettings, saveState, renderUI, disableInput, globalTimerActions, globalCounterActions;

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

// Initialize the core with references to App.js state and functions
export function initCore(deps) {
    getAppSettings = deps.getAppSettings;
    getState = deps.getState;
    getProfileSettings = deps.getProfileSettings;
    saveState = deps.saveState;
    renderUI = deps.renderUI;
    disableInput = deps.disableInput;
    globalTimerActions = deps.globalTimerActions;
    globalCounterActions = deps.globalCounterActions;
}

export function startPracticeRound() {
    const appSettings = getAppSettings();
    const settingsModal = document.getElementById('settings-modal');
    if(settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    
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
    const settingsModal = document.getElementById('settings-modal');
    if(settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    
    disableInput(true); 
    let i = 0; 
    const speed = appSettings.playbackSpeed || 1.0;
    
    function next() {
        if(i >= practiceSequence.length) { disableInput(false); return; }
        const val = practiceSequence[i]; 
        const settings = getProfileSettings(); 
        const key = document.querySelector(`#pad-${settings.currentInput} button[data-value="${val}"]`);
        
        if(key) { 
            key.classList.add('flash-active'); 
            setTimeout(() => key.classList.remove('flash-active'), 250 / speed); 
        }
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
            if(navigator.vibrate) navigator.vibrate(500); 
            setTimeout(() => playPracticeSequence(), 1500); 
        } 
        return;
    }
    
    let targetIndex = 0; 
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    const roundNum = parseInt(state.currentRound) || 1;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    let limit = isUnique ? (appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength) : settings.sequenceLength;
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
        if (isUnique && appSettings.isUniqueRoundsAutoClearEnabled) { showToast("Round Full - Reset? 🛑", appSettings); vibrate(appSettings); }
        return;
    }

    let isFirstInput = true;
    state.sequences.forEach(s => { if(s.length > 0) isFirstInput = false; });

    if (isFirstInput) {
        if (appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.reset && globalTimerActions.start) {
            globalTimerActions.reset();
            globalTimerActions.start();
        }
        if (appSettings.isAutoCounterEnabled && appSettings.showCounter && globalCounterActions.increment) {
            globalCounterActions.increment();
        }
    }

    if(!state.sequences[targetIndex]) state.sequences[targetIndex] = [];
    state.sequences[targetIndex].push(value); 
    state.nextSequenceIndex++; 
    
    renderUI(); 
    saveState();
    
    if(appSettings.isAutoplayEnabled) {
        if (settings.currentMode === CONFIG.MODES.SIMON) { 
            const justFilled = (state.nextSequenceIndex - 1) % settings.machineCount; 
            if(justFilled === settings.machineCount - 1) setTimeout(playDemo, 250); 
        } else { 
            if (appSettings.isUniqueRoundsAutoClearEnabled) {
                if(state.sequences[0].length >= roundNum) { disableInput(true); setTimeout(playDemo, 250); } 
            } else { setTimeout(playDemo, 250); }
        }
    }
}

export function handleBackspace(e) { 
    if(e) { e.preventDefault(); e.stopPropagation(); } 
    const appSettings = getAppSettings();
    vibrate(appSettings); 
    
    const state = getState(); 
    const settings = getProfileSettings(); 
    
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
         if(state.sequences[0].length > 0) { state.sequences[0].pop(); state.nextSequenceIndex--; }
    } else {
        let target = (state.nextSequenceIndex - 1) % settings.machineCount;
        if (target < 0) target = settings.machineCount - 1; 
        
        if(state.sequences[target] && state.sequences[target].length > 0) {
             state.sequences[target].pop();
             state.nextSequenceIndex--;
        }
    }
    
    let isEmpty = true;
    state.sequences.forEach(s => { if(s.length > 0) isEmpty = false; });
    
    if (isEmpty && appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.stop) {
        globalTimerActions.stop();
    }

    renderUI(); 
    saveState(); 
}

export function playDemo() {
    if(isDemoPlaying) return;
    const appSettings = getAppSettings();
    
    isDemoPlaying = true;
    isPlaybackPaused = false;
    playbackResumeCallback = null;

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
                const slice = seq.slice(i, i+chunkSize);
                chunks.push({ machine: m, nums: slice, isNewRound: (m===0 && i===0 && chunks.length===0) });
            }
        }
    }

    let cIdx = 0;
    let totalCount = 0; 

    const schedule = (fn, delay) => {
        setTimeout(() => {
            if(!isDemoPlaying) return; 
            if(isPlaybackPaused) { playbackResumeCallback = fn; } else { fn(); }
        }, delay);
    };

    function nextChunk() {
        if(!isDemoPlaying) { if(playBtn) playBtn.textContent = "▶"; return; }

        if(cIdx >= chunks.length) { 
            isDemoPlaying = false; 
            if(playBtn) playBtn.textContent = "▶";
            
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
               setTimeout(() => {
                   if(!isDemoPlaying) {
                       state.currentRound++;
                       state.sequences[0] = [];
                       state.nextSequenceIndex = 0;
                       renderUI();
                       showToast(`Round ${state.currentRound}`, appSettings);
                       saveState();
                       disableInput(false);
                   }
               }, 500);
            }
            return; 
        }

        const chunk = chunks[cIdx];
        const machineDelay = (settings.simonInterSequenceDelay) || 0;
        let nIdx = 0;
        
        function playNum() {
            if(!isDemoPlaying) { if(playBtn) playBtn.textContent = "▶"; return; }
            if(nIdx >= chunk.nums.length) { cIdx++; schedule(nextChunk, machineDelay); return; }
            
            const val = chunk.nums[nIdx];
            totalCount++; 
            if(playBtn) playBtn.textContent = totalCount;
            
            const btn = document.querySelector(`#pad-${settings.currentInput} button[data-value="${val}"]`);
            if(btn) {
                btn.classList.add('flash-active');
                setTimeout(() => btn.classList.remove('flash-active'), 250/speed);
            }
            
            speak(val, appSettings);
            if(appSettings.isHapticMorseEnabled) vibrateMorse(val, appSettings);
            
            nIdx++;
            schedule(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}
