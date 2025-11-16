(function() {
    'use strict';

    let initialDelayTimer = null; 
    let speedDeleteInterval = null; 
    let isHoldingBackspace = false;

    // --- NEW: Permission Functions ---
    async function requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Got permission. We don't need the stream now, so stop it.
            stream.getTracks().forEach(track => track.stop());
            
            // Update UI
            const dom = UI.getDomElements();
            dom.cameraPermissionButton.classList.add('hidden');
            dom.cameraCalibrateButton.classList.remove('hidden');
            dom.cameraInputToggle.disabled = false;
            
            UI.showModal("Camera Enabled", "Permission granted. You can now calibrate the camera input.", () => UI.closeModal(), "OK", "");
        } catch (err) {
            console.error("Camera permission denied:", err);
            UI.showModal("Camera Error", "You must grant camera permission for this feature to work.", () => UI.closeModal(), "OK", "");
        }
    }
    
    async function requestMicPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Got permission. Stop the stream.
            stream.getTracks().forEach(track => track.stop());
            
            // Update UI
            const dom = UI.getDomElements();
            dom.micPermissionButton.classList.add('hidden');
            dom.micCalibrateButton.classList.remove('hidden');
            dom.micInputToggle.disabled = false;
            
            UI.showModal("Mic Enabled", "Permission granted. You can now calibrate the audio input.", () => UI.closeModal(), "OK", "");
        } catch (err) {
            console.error("Mic permission denied:", err);
            UI.showModal("Mic Error", "You must grant microphone permission for this feature to work.", () => UI.closeModal(), "OK", "");
        }
    }

    function vibrate(duration = 10) {
        // ... (code is the same)
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
        // ... (code is the same)
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
        
        UI.updateMachineDisplay(targetIndex);
        
        if (mode === AppConfig.MODES.SIMON && state.machineCount > 1) {
             UI.updateMachineDisplay(state.nextSequenceIndex % state.machineCount);
        }
        
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
        // ... (code is the same)
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

            UI.updateMachineDisplay(lastClickTargetIndex);

            if (mode === AppConfig.MODES.SIMON && state.machineCount > 1) {
                UI.updateMachineDisplay(state.nextSequenceIndex % state.machineCount);
            }

            if (mode === AppConfig.MODES.UNIQUE_ROUNDS) {
                 const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
                 allKeys.forEach(key => key.disabled = false);
            }

            StateManager.saveState();
        }
    }

    function stopSpeedDeleting() {
        // ... (code is the same)
        if (initialDelayTimer) clearTimeout(initialDelayTimer);
        if (speedDeleteInterval) clearInterval(speedDeleteInterval);
        initialDelayTimer = null;
        speedDeleteInterval = null;
        isHoldingBackspace = false;
    }

    function handleBackspaceStart(event) {
        // ... (code is the same)
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
        // ... (code is the same)
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
        // ... (code is the same)
        const state = StateManager.getCurrentState();
        const settings = StateManager.getSettings();
        state.currentRound = 1;
        state.sequences = Array.from({ length: AppConfig.MAX_MACHINES }, () => []);
        state.nextSequenceIndex = 0;
        const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
        if (allKeys) allKeys.forEach(key => key.disabled = false);
        
        UI.updateMachineDisplay(0); 
        UI.updateUniqueRoundsDisplay();
        
        StateManager.saveState();
    }

    function advanceToUniqueRound() {
        // ... (code is the same)
        const state = StateManager.getCurrentState();
        const settings = StateManager.getSettings();
        state.currentRound++;
        if (state.currentRound > settings.sequenceLength) {
            state.currentRound = 1;
            UI.showModal('Complete!', `You finished all ${settings.sequenceLength} rounds. Resetting to Round 1.`, () => UI.closeModal(), 'OK', '');
        }
        
        UI.updateMachineDisplay(0); 
        UI.updateUniqueRoundsDisplay();

        StateManager.saveState();
        const allKeys = document.querySelectorAll(`#pad-${settings.currentInput} button[data-value]`);
        if (allKeys) allKeys.forEach(key => key.disabled = false);
    }

    function clearUniqueRoundsSequence() {
        // ... (code is the same)
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
                UI.updateMachineDisplay(0);
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
        // ... (code is the same)
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
        // ... (code is the same)
        StateManager.resetToDefaults();
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
        vibrate,
        requestCameraPermission, // <-- NEW
        requestMicPermission     // <-- NEW
    };

})();
