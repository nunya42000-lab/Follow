// app.js - Partial Update for initGestureEngine

function initGestureEngine() {
    const engine = new GestureEngine(document.body, {
        tapDelay: appSettings.gestureTapDelay || 300,
        swipeThreshold: appSettings.gestureSwipeDist || 30,
        debug: false
    }, {
        onGesture: (data) => {
            // Global Actions (Updated to catch the new explicit emissions)
            if (data.name === 'DELETE') {
                if (appSettings.isDeleteGestureEnabled) { handleBackspace(); showToast("Deleted ⌫"); vibrate(); return; }
            }
            if (data.name === 'CLEAR') {
                if (appSettings.isClearGestureEnabled) { 
                    const s = getState(); s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
                    s.nextSequenceIndex = 0; renderUI(); saveState(); showToast("CLEARED 💥"); vibrate(); return; 
                }
            }

            // Input Mapping
            const isPadOpen = (typeof isGesturePadVisible !== 'undefined' && isGesturePadVisible);
            const isClassPresent = document.body.classList.contains('input-gestures-mode');
            const isBossActive = appSettings.isBlackoutFeatureEnabled && appSettings.isBlackoutGesturesEnabled && blackoutState.isActive;

            if (isPadOpen || isClassPresent || isBossActive) {
                const settings = getProfileSettings();
                const mapResult = mapGestureToValue(data.name, settings.currentInput);
                const indicator = document.getElementById('gesture-indicator');

                if (mapResult !== null) {
                    addValue(mapResult);
                    if(indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ').toUpperCase();
                        indicator.style.opacity = '1';
                        indicator.style.color = 'var(--seq-bubble)';
                        setTimeout(() => { indicator.style.opacity = '0.3'; indicator.style.color = ''; }, 250);
                    }
                } else {
                    if(indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ');
                        indicator.style.opacity = '0.5';
                        setTimeout(() => indicator.style.opacity = '0.3', 500);
                    }
                }
            }
        },
        onContinuous: (data) => {
            // ... (Twist and Pinch logic remains unchanged) ...
            if (data.type === 'twist' && data.fingers === 3 && appSettings.isVolumeGesturesEnabled) {
                let newVol = appSettings.voiceVolume || 1.0; newVol += (data.value * 0.05); 
                appSettings.voiceVolume = Math.min(1.0, Math.max(0.0, newVol)); saveState(); showToast(`Volume: ${(appSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
            }
            if (data.type === 'twist' && data.fingers === 2 && appSettings.isSpeedGesturesEnabled) {
                let newSpeed = appSettings.playbackSpeed || 1.0; newSpeed += (data.value * 0.05);
                appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed)); saveState(); showToast(`Speed: ${(appSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
            }
            if (data.type === 'pinch') {
                const mode = appSettings.gestureResizeMode || 'global';
                if (mode === 'none') return;
                if (!gestureState.isPinching) { gestureState.isPinching = true; gestureState.startGlobal = appSettings.globalUiScale; gestureState.startSeq = appSettings.uiScaleMultiplier; }
                clearTimeout(gestureState.resetTimer); gestureState.resetTimer = setTimeout(() => { gestureState.isPinching = false; }, 250);
                if (mode === 'sequence') {
                    let raw = gestureState.startSeq * data.scale; let newScale = Math.round(raw * 10) / 10;
                    if (newScale !== appSettings.uiScaleMultiplier) { appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, newScale)); renderUI(); showToast(`Cards: ${(appSettings.uiScaleMultiplier * 100).toFixed(0)}% 🔍`); }
                } else {
                    let raw = gestureState.startGlobal * data.scale; let newScale = Math.round(raw / 10) * 10;
                    if (newScale !== appSettings.globalUiScale) { appSettings.globalUiScale = Math.min(200, Math.max(50, newScale)); updateAllChrome(); showToast(`UI: ${appSettings.globalUiScale}% 🔍`); }
                }
            }
        }
    });
    // ...
