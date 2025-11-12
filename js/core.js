// REMOVED: vibrate() function

function addValue(value) {
    // REMOVED: vibrate();
    
    const state = getCurrentState();
    // ... (rest of function is unchanged) ...
    const { sequences, sequenceCount } = state;
    
    if (sequenceCount === 0) return;

    if (currentMode === 'rounds15' && sequences[0].length >= state.currentRound) return; 
    if (currentMode === 'bananas' && sequences[0].length >= 25) return;
    if (currentMode === 'follows' && sequences[state.nextSequenceIndex % sequenceCount].length >= 25) return;
    if (currentMode === 'piano' && sequences[0].length >= 20) return; 

    const targetIndex = state.nextSequenceIndex % sequenceCount;
    sequences[targetIndex].push(value);
    state.nextSequenceIndex++;
    
    const justFilledIndex = (state.nextSequenceIndex - 1) % sequenceCount;

    renderSequences();
    
    if (currentMode === 'piano' && settings.isPianoAutoplayEnabled) { 
        setTimeout(() => { handlePianoDemo(); }, 100); 
    }
    else if (currentMode === 'bananas' && settings.isBananasAutoplayEnabled) {
        setTimeout(() => { handleBananasDemo(); }, 100); 
    }
    else if (currentMode === 'follows' && settings.isFollowsAutoplayEnabled) {
        if (justFilledIndex === state.sequenceCount - 1) {
             setTimeout(() => { handleFollowsDemo(); }, 100);
        }
    }
    else if (currentMode === 'rounds15') {
        const sequence = state.sequences[0];
        if (sequence.length === state.currentRound) {
            const allKeys = document.querySelectorAll('#rounds15-pad button[data-value]');
            allKeys.forEach(key => key.disabled = true);
            
            setTimeout(() => { handleRounds15Demo(); }, 100); 
        }
    }
    
    saveState(); // <<< SAVE STATE
}

function handleBackspace() {
    // REMOVED: vibrate(20);
    
    const state = getCurrentState();
    // ... (rest of function is unchanged) ...
    const { sequences, sequenceCount } = state;
    
    if (currentMode === 'rounds15') {
        const demoButton = document.querySelector('#rounds15-pad button[data-action="demo"]');
        if (demoButton && demoButton.disabled) return;
    }
    if (currentMode === 'follows') {
        const demoButton = document.querySelector('#follows-pad button[data-action="play-demo"]');
        if (demoButton && demoButton.disabled) return;
    }

    if (state.nextSequenceIndex === 0) return; 
    
    const lastClickTargetIndex = (state.nextSequenceIndex - 1) % sequenceCount;
    const targetSet = sequences[lastClickTargetIndex];
    
    if (targetSet.length > 0) {
        targetSet.pop();
        state.nextSequenceIndex--; 

        if (currentMode === 'rounds15') {
             const allKeys = document.querySelectorAll('#rounds15-pad button[data-value]');
             allKeys.forEach(key => key.disabled = false);
        }

        renderSequences();
        saveState(); // <<< SAVE STATE
    }
}


// --- Backspace Speed Deleting Logic ---
function stopSpeedDeleting() {
    // ... (content unchanged) ...
}

function handleBackspaceStart(event) {
    // ... (content unchanged) ...
}

function handleBackspaceEnd() {
    // ... (content unchanged) ...
}

// --- Voice Input Functions (TEXT-BASED) ---
function processVoiceTranscript(transcript) {
    // ... (content unchanged) ...
}

// --- Restore Defaults Function ---
function handleRestoreDefaults() {
    // 1. Reset settings and state
    settings = { ...DEFAULT_SETTINGS }; // This will set showWelcomeScreen to true
    appState = {
        'bananas': getInitialState('bananas'),
        'follows': getInitialState('follows'),
        'piano': getInitialState('piano'), 
        'rounds15': getInitialState('rounds15'),
    };
    currentMode = settings.currentMode; // 'bananas'
    
    // 2. Save the new defaults
    saveState();
    
    // 3. Update all UI elements in the settings panel
    updateTheme(settings.isDarkMode);
    updateVoiceInputVisibility();
    updateSliderLockState();

    // Toggles
    if (showWelcomeToggle) showWelcomeToggle.checked = settings.showWelcomeScreen;
    if (darkModeToggle) darkModeToggle.checked = settings.isDarkMode;
    if (speedDeleteToggle) speedDeleteToggle.checked = settings.isSpeedDeletingEnabled;
    if (pianoAutoplayToggle) pianoAutoplayToggle.checked = settings.isPianoAutoplayEnabled;
    if (bananasAutoplayToggle) bananasAutoplayToggle.checked = settings.isBananasAutoplayEnabled;
    if (followsAutoplayToggle) followsAutoplayToggle.checked = settings.isFollowsAutoplayEnabled;
    if (rounds15ClearAfterPlaybackToggle) rounds15ClearAfterPlaybackToggle.checked = settings.isRounds15ClearAfterPlaybackEnabled;
    if (audioPlaybackToggle) audioPlaybackToggle.checked = settings.isAudioPlaybackEnabled;
    if (voiceInputToggle) voiceInputToggle.checked = settings.isVoiceInputEnabled;
    if (sliderLockToggle) sliderLockToggle.checked = settings.areSlidersLocked;
    // hapticsToggle REMOVED

    // Sliders
    if (bananasSpeedSlider) bananasSpeedSlider.value = settings.bananasSpeedMultiplier * 100;
    updateSpeedDisplay(settings.bananasSpeedMultiplier, bananasSpeedDisplay);
    if (pianoSpeedSlider) pianoSpeedSlider.value = settings.pianoSpeedMultiplier * 100;
    updateSpeedDisplay(settings.pianoSpeedMultiplier, pianoSpeedDisplay);
    if (rounds15SpeedSlider) rounds15SpeedSlider.value = settings.rounds15SpeedMultiplier * 100;
    updateSpeedDisplay(settings.rounds15SpeedMultiplier, rounds15SpeedDisplay);
    if (uiScaleSlider) uiScaleSlider.value = settings.uiScaleMultiplier * 100;
    updateScaleDisplay(settings.uiScaleMultiplier, uiScaleDisplay);

    // Follows Selects
    if (followsCountSelect) followsCountSelect.value = appState['follows'].sequenceCount;
    if (followsChunkSizeSelect) followsChunkSizeSelect.value = settings.followsChunkSize;
    if (followsDelaySelect) followsDelaySelect.value = settings.followsInterSequenceDelay;
    
    // 4. Update the main UI
    updateMode(settings.currentMode); // This also calls renderSequences
    
    // 5. Close the modal
    closeSettingsModal();
}

// --- NEW: Feedback Function ---
function handleSendFeedback() {
    if (!feedbackTextarea || !feedbackSendBtn) return;

    const text = feedbackTextarea.value.trim();
    if (text.length === 0) {
        alert("Please enter a message before sending.");
        return;
    }

    // Disable button and show sending state
    feedbackSendBtn.disabled = true;
    feedbackSendBtn.textContent = 'Sending...';

    try {
        const db = firebase.firestore();
        db.collection('feedback').add({
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            appVersion: '1.0' // You can update this later
        })
        .then(() => {
            // Success
            feedbackSendBtn.classList.remove('bg-primary-app');
            feedbackSendBtn.classList.add('!bg-btn-control-green');
            feedbackSendBtn.textContent = 'Sent!';
            
            setTimeout(() => {
                closeFeedbackModal();
            }, 1500); // Close modal after 1.5s
        })
        .catch((error) => {
            // Failure
            console.error("Error writing document: ", error);
            feedbackSendBtn.classList.remove('bg-primary-app');
            feedbackSendBtn.classList.add('!bg-btn-control-red');
            feedbackSendBtn.textContent = 'Error!';
            
            setTimeout(() => {
                feedbackSendBtn.disabled = false;
                feedbackSendBtn.classList.remove('!bg-btn-control-red');
                feedbackSendBtn.classList.add('bg-primary-app');
                feedbackSendBtn.textContent = 'Send';
            }, 3000); // Reset button after 3s
        });
    } catch (e) {
        console.error("Firebase is not initialized or failed:", e);
        alert("Error: Could not connect to feedback service.");
        feedbackSendBtn.disabled = false;
        feedbackSendBtn.textContent = 'Send';
    }
}
.pianoSpeedMultiplier * 100;
    updateSpeedDisplay(settings.pianoSpeedMultiplier, pianoSpeedDisplay);
    if (rounds15SpeedSlider) rounds15SpeedSlider.value = settings.rounds15SpeedMultiplier * 100;
    updateSpeedDisplay(settings.rounds15SpeedMultiplier, rounds15SpeedDisplay);
    if (uiScaleSlider) uiScaleSlider.value = settings.uiScaleMultiplier * 100;
    updateScaleDisplay(settings.uiScaleMultiplier, uiScaleDisplay);

    // Follows Selects
    if (followsCountSelect) followsCountSelect.value = appState['follows'].sequenceCount;
    if (followsChunkSizeSelect) followsChunkSizeSelect.value = settings.followsChunkSize;
    if (followsDelaySelect) followsDelaySelect.value = settings.followsInterSequenceDelay;
    
    // 4. Update the main UI
    updateMode(settings.currentMode); // This also calls renderSequences
    
    // 5. Close the modal
    closeSettingsModal();
}
