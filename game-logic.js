// game-logic.js
import { appSettings, getState, getProfileSettings, saveState, globalTimerActions, globalCounterActions } from './state.js';
import * as SharedState from './state.js'; 
import { CONFIG } from './constants.js';
import { vibrate, vibrateMorse, speak } from './audio-haptics.js';
import { showToast, disableInput } from './ui-core.js';
import { renderUI } from './renderer.js';

export function startPracticeRound() {
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
    
    if(SharedState.practiceSequence.length === 0) state.currentRound = 1;
    
    if(settings.currentMode === CONFIG.MODES.SIMON) {
        SharedState.practiceSequence.push(getRand());
        state.currentRound = SharedState.practiceSequence.length;
    } else {
        SharedState.practiceSequence.length = 0; // clear
        const len = state.currentRound; 
        for(let i=0; i<len; i++) SharedState.practiceSequence.push(getRand());
    }
    
    SharedState.practiceInputIndex = 0; 
    renderUI(); 
    showToast(`Practice Round ${state.currentRound}`); 
    setTimeout(() => playPracticeSequence(), 1000);
}

export function playPracticeSequence() {
    const settingsModal = document.getElementById('settings-modal');
    if(settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    
    disableInput(true); 
    let i = 0; 
    const speed = appSettings.playbackSpeed || 1.0;
    
    function next() {
        if(i >= SharedState.practiceSequence.length) { disableInput(false); return; }
        const val = SharedState.practiceSequence[i]; 
        const settings = getProfileSettings(); 
        const key = document.querySelector(`#pad-${settings.currentInput} button[data-value="${val}"]`);
        
        if(key) { 
            key.classList.add('flash-active'); 
            setTimeout(() => key.classList.remove('flash-active'), 250 / speed); 
        }
        
        speak(val); 
        i++; 
        setTimeout(next, 800 / speed);
    } 
    next();
}

export function addValue(value) {
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings();
    
    if(appSettings.isPracticeModeEnabled) {
        if(SharedState.practiceSequence.length === 0) return; 
        if(value == SharedState.practiceSequence[SharedState.practiceInputIndex]) { 
            SharedState.practiceInputIndex++; 
            if(SharedState.practiceInputIndex >= SharedState.practiceSequence.length) { 
                speak("Correct"); 
                state.currentRound++; 
                setTimeout(startPracticeRound, 1500); 
            } 
        } else { 
            speak("Wrong"); 
            navigator.vibrate(500); 
            setTimeout(() => playPracticeSequence(), 1500); 
        } 
        return;
    }
    
    let targetIndex = 0; 
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    const roundNum = parseInt(state.currentRound) || 1;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    let limit;
    
    if (isUnique) { 
        limit = appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength; 
    } else { 
        limit = settings.sequenceLength; 
    }
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
        if (isUnique && appSettings.isUniqueRoundsAutoClearEnabled) { showToast("Round Full - Reset? 🛑"); vibrate(); }
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
    vibrate(); 
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
    if(SharedState.isDemoPlaying) return;
    SharedState.isDemoPlaying = true;
    SharedState.isPlaybackPaused = false;
    SharedState.playbackResumeCallback = null;
    
    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    const playBtn = document.querySelector('button[data-action="play-demo"]');
    let seqsToPlay = [];
    
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        seqsToPlay = [state.sequences[0]];
    } else {
        seqsToPlay = state.sequences.slice(0, settings.machineCount);
    }
    
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
            if(!SharedState.isDemoPlaying) return;
            if(SharedState.isPlaybackPaused) {
                SharedState.playbackResumeCallback = fn;
            } else { fn(); }
        }, delay);
    };

    function nextChunk() {
        if(!SharedState.isDemoPlaying) {
            if(playBtn) playBtn.textContent = "▶"; return;
        }
        
        if(cIdx >= chunks.length) {
            SharedState.isDemoPlaying = false;
            if(playBtn) playBtn.textContent = "▶";
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
                setTimeout(() => {
                    if(!SharedState.isDemoPlaying) {
                        state.currentRound++;
                        state.sequences[0] = [];
                        state.nextSequenceIndex = 0;
                        renderUI();
                        showToast(`Round ${state.currentRound}`);
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
            if(!SharedState.isDemoPlaying) { if(playBtn) playBtn.textContent = "▶"; return; }
            if(nIdx >= chunk.nums.length) { cIdx++; schedule(nextChunk, machineDelay); return; }
            
            const val = chunk.nums[nIdx];
            totalCount++;
            if(playBtn) playBtn.textContent = totalCount;
            
            const padId = `pad-${settings.currentInput}`;
            const btn = document.querySelector(`#${padId} button[data-value="${val}"]`);
            if(btn) { 
                btn.classList.add('flash-active'); 
                setTimeout(() => btn.classList.remove('flash-active'), 250/speed); 
            }
            speak(val);
            if(appSettings.isHapticMorseEnabled) vibrateMorse(val);
            nIdx++;
            schedule(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}