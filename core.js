(function() {
    'use strict';

    let initialDelayTimer = null; 
    let speedDeleteInterval = null; 
    let isHoldingBackspace = false;

    function vibrate(duration = 10) {
        const settings = StateManager.getSettings();
        if (settings.isHapticsEnabled && 'vibrate' in navigator) {
            try {
                navigator.vibrate(duration);
            } catch (e) {
                console.warn("Haptic feedback failed.", e);
            }
        }
    }

    function addValue(value) {
        vibrate();
        
        const state = StateManager.getCurrentState();
        const settings = StateManager.getSettings();
        const mode = settings.currentMode;
        let targetIndex;

        if (mode === AppConfig.MODES.UNIQUE_ROUNDS) {
            if (state.sequences[0].length >= state.currentRound) return; 
            targetIndex = 0;
        } else {
            targetIndex = state.nextSequenceIndex % state.machineCount;
            if (state.sequences[targetIndex] && state.sequences[targetIndex].length >= settings.sequenceLength) return;
        }

        state.sequences[targetIndex].push(value);
        state.nextSequenceIndex++;
        
        // --- PERFORMANCE FIX ---
        // Instead of UI.renderSequences(), we just update the machine that changed.
        UI.updateMachineDisplay(targetIndex);
        
        // Update highlighting for *next* machine if in Simon mode
        if (mode === AppConfig.MODES.SIMON && state.machineCount > 1) {
             UI.updateMachineDisplay(state.nextSequenceIndex % state.machineCount);
        }
        // ---------------------
        
        if (settings.isAutoplayEnabled) {
            if (mode === AppConfig.MODES.UNIQUE_ROUNDS) {
                const sequence = state.sequences[0];
                if (sequence.length === state.currentRound) {
                    const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
                    allKeys.forEach(key => key.disabled = true);
                    setTimeout(DemoPlayer.handleUniqueRoundsDemo, 100); 
                }
            }
            else if (mode === AppConfig.MODES.SIMON) {
                const justFilledIndex = (state.nextSequenceIndex - 1) % state.machineCount;
                 if (justFilledIndex === state.machineCount - 1) {
                     setTimeout(DemoPlayer.handleSimonDemo, 100);
                }
            }
        }
        
        StateManager.saveState();
    }

    function handleBackspace() {
        vibrate(20);
        
        const state = StateManager.getCurrentState();
        const settings = StateManager.getSettings();
        const mode = settings.currentMode;

        const demoButton = document.querySelector(`#pad-${settings.currentInput} button[data-action="play-demo"]`);
        if (demoButton && demoButton.disabled) return;

        if (state.nextSequenceIndex === 0) return; 
        
        let lastClickTargetIndex;
        if (mode === AppConfig.MODES.UNIQUE_ROUNDS) {
            lastClickTargetIndex = 0;
        } else {
            lastClickTargetIndex = (state.nextSequenceIndex - 1) % state.machineCount;
        }
        
        const targetSet = state.sequences[lastClickTargetIndex];
        
        if (targetSet.length > 0) {
            targetSet.pop();
            state.nextSequenceIndex--; 

            // --- PERFORMANCE FIX ---
            UI.updateMachineDisplay(lastClickTargetIndex);

            // Update highlighting for *new* active machine
            if (mode === AppConfig.MODES.SIMON && state.machineCount > 1) {
                UI.updateMachineDisplay(state.nextSequenceIndex % state.machineCount);
            }
            // ---------------------

            if (mode === AppConfig.MODES.UNIQUE_ROUNDS) {
                 const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
                 allKeys.forEach(key => key.disabled = false);
            }

            StateManager.saveState();
        }
    }

    function stopSpeedDeleting() {
        if (initialDelayTimer) clearTimeout(initialDelayTimer);
        if (speedDeleteInterval) clearInterval(speedDeleteInterval);
        initialDelayTimer = null;
        speedDeleteInterval = null;
        isHoldingBackspace = false;
    }

    function handleBackspaceStart(event) {
        event.preventDefault(); 
        stopSpeedDeleting(); 
        isHoldingBackspace = false;

        const settings = StateManager.getSettings();
        const demoButton = document.querySelector(`#pad-${settings.currentInput} button[data-action="play-demo"]`);
        if (demoButton && demoButton.disabled) return;

        initialDelayTimer = setTimeout(() => {
            isHoldingBackspace = true;
            if (settings.isSpeedDeletingEnabled && settings.currentMode !== AppConfig.MODES.UNIQUE_ROUNDS) {
                handleBackspace();
                speedDeleteInterval = setInterval(handleBackspace, AppConfig.SPEED_DELETE_INTERVAL_MS);
            }
            initialDelayTimer = null; 
        }, AppConfig.SPEED_DELETE_INITIAL_DELAY);
    }

    function handleBackspaceEnd() {
        const wasHolding = isHoldingBackspace;
        const settings = StateManager.getSettings();
        
        if (initialDelayTimer !== null) {
            stopSpeedDeleting();
            handleBackspace(); 
            return;
        }
        
        stopSpeedDeleting(); 

        if (wasHolding && settings.currentMode === AppConfig.MODES.UNIQUE_ROUNDS) {
            UI.showModal('Reset Rounds?', 'Are you sure you want to reset to Round 1?', resetUniqueRoundsMode, 'Reset', 'Cancel');
        }
    }

    function resetUniqueRoundsMode() {
        const state = StateManager.getCurrentState();
        const settings = StateManager.getSettings();
        state.currentRound = 1;
        state.sequences = Array.from({ length: AppConfig.MAX_MACHINES }, () => []);
        state.nextSequenceIndex = 0;
        const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
        if (allKeys) allKeys.forEach(key => key.disabled = false);
        
        // --- PERFORMANCE FIX ---
        UI.updateMachineDisplay(0); // Just update the first machine
        UI.updateUniqueRoundsDisplay(); // Update the round counter
        // ---------------------
        
        StateManager.saveState();
    }

    function advanceToUniqueRound() {
        const state = StateManager.getCurrentState();
        const settings = StateManager.getSettings();
        state.currentRound++;
        if (state.currentRound > settings.sequenceLength) {
            state.currentRound = 1;
            UI.showModal('Complete!', `You finished all ${settings.sequenceLength} rounds. Resetting to Round 1.`, () => UI.closeModal(), 'OK', '');
        }
        
        // --- PERFORMANCE FIX ---
        UI.updateMachineDisplay(0); // Just update the first machine
        UI.updateUniqueRoundsDisplay(); // Update the round counter
        // ---------------------

        StateManager.saveState();
        const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
        if (allKeys) allKeys.forEach(key => key.disabled = false);
    }

    function clearUniqueRoundsSequence() {
        const state = StateManager.getCurrentState();
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
                UI.updateMachineDisplay(0); // Update the machine display
            } else {
                clearInterval(speedDeleteInterval);
                speedDeleteInterval = null;
                StateManager.saveState(); 
                advanceToUniqueRound(); 
            }
        }
        setTimeout(() => {
            speedDeleteInterval = setInterval(rapidDelete, AppConfig.SPEED_DELETE_INTERVAL_MS);
        }, 10);
    }

    function processVoiceTranscript(transcript) {
        if (!transcript) return;
        
        const cleanTranscript = transcript.toLowerCase().replace(/[\.,]/g, '').trim();
        const words = cleanTranscript.split(' ');
        const currentInput = StateManager.getSettings().currentInput;

        for (const word of words) {
            let value = AppConfig.VOICE_VALUE_MAP[word];
            
            if (!value) {
                 const upperWord = word.toUpperCase();
                 if (/^[1-9]$/.test(word) || /^(1[0-2])$/.test(word)) { value = word; } 
                 else if (/^[A-G]$/.test(upperWord) || /^[1-5]$/.test(word)) { value = upperWord; }
            }

            if (value) {
                if (currentInput === AppConfig.INPUTS.KEY9 && /^[1-9]$/.test(value)) {
                    addValue(value);
                } else if (currentInput === AppConfig.INPUTS.KEY12 && /^(?:[1-9]|1[0-2])$/.test(value)) {
                    addValue(value);
                } else if (currentInput === AppConfig.INPUTS.PIANO && (/^[1-5]$/.test(value) || /^[A-G]$/.test(value))) {
                    addValue(value);
                }
            }
        }
    }

    function handleRestoreDefaults() {
        StateManager.resetToDefaults();
        const settings = StateManager.getSettings();
        
        UI.applyGlobalUiScale(settings.globalUiScale);
        UI.updateTheme(settings.isDarkMode);
        UI.updateVoiceInputVisibility();
        
        UI.closeSettingsModal(); 
        setTimeout(UI.openGameSetupModal, 10);
    }

    // Expose to global scope
    window.AppCore = {
        addValue,
        handleBackspace,
        handleBackspaceStart,
        handleBackspaceEnd,
        stopSpeedDeleting,
        resetUniqueRoundsMode,
        clearUniqueRoundsSequence,
        processVoiceTranscript,
        handleRestoreDefaults,
        vibrate
    };

})();
