
// renderer.js
import {
    appSettings,
    getState,
    getProfileSettings,
    blackoutState,
    isGesturePadVisible,
    practiceSequence,
    saveState,
    modules
} from './state.js';
import {
    CONFIG
} from './config.js';
import {
    vibrate
} from './audio-haptics.js';
import {
    showToast
} from './ui-core.js';
import {
    startPracticeRound,
    playPracticeSequence
} from './game-logic.js';

/**
 * Main UI Rendering Function
 */
export function renderUI() {
    // 1. Core Element References
    const container = document.getElementById('sequence-container');
    const settings = getProfileSettings(); // DECLARE ONCE HERE

    // 2. Gesture Pad Visibility & Boss Mode Logic
    try {
        const gpWrap = document.getElementById('gesture-pad-wrapper');
        const pad = document.getElementById('gesture-pad');
        
        if (gpWrap) {
            const isGlobalGestureOn = appSettings.isGestureInputEnabled;
            const isBossGestureOn = appSettings.isBlackoutFeatureEnabled && appSettings.isBlackoutGesturesEnabled && blackoutState.isActive;

            if ((isGlobalGestureOn && isGesturePadVisible) || isBossGestureOn) {
                document.body.classList.add('input-gestures-mode');
                gpWrap.classList.remove('hidden');

                if (isBossGestureOn) {
                    gpWrap.style.zIndex = '10001';
                    if (pad) {
                        pad.style.opacity = '0.05';
                        pad.style.borderColor = 'transparent';
                    }
                } else {
                    gpWrap.style.zIndex = '';
                    if (pad) {
                        pad.style.opacity = '1';
                        pad.style.borderColor = '';
                    }
                }
            } else {
                document.body.classList.remove('input-gestures-mode');
                gpWrap.classList.add('hidden');
            }
        }
    } catch (e) {
        console.warn("Gesture UI sync failed:", e);
    }

    // 3. Sequence Grid Rendering
    if (!container) return;
    container.innerHTML = '';

    const session = getState();
    const sequences = session.sequences || [];

    sequences.forEach((seq, idx) => {
        if (seq.length === 0) return;

        const card = document.createElement('div');
        card.className = 'sequence-card';
        
        const label = document.createElement('div');
        label.className = 'sequence-label';
        label.textContent = `Machine ${idx + 1}`;
        card.appendChild(label);

        const numGrid = document.createElement('div');
        numGrid.className = 'number-grid';

        seq.forEach(num => {
            const span = document.createElement('span');
            span.className = 'number-node';
            
            const scale = appSettings.uiScaleMultiplier || 1.0;
            const boxSize = 40 * scale;
            span.style.width = boxSize + 'px';
            span.style.height = boxSize + 'px';

            const fontMult = appSettings.uiFontSizeMultiplier || 1.0;
            const fontSizePx = (boxSize * 0.5) * fontMult;
            span.style.fontSize = fontSizePx + 'px';
            span.textContent = num;
            numGrid.appendChild(span);
        });

        card.appendChild(numGrid);
        container.appendChild(card);
    });

    // 4. Header Action Buttons (Sync Visual State)
    const hMic = document.getElementById('header-mic-btn');
    const hCam = document.getElementById('header-cam-btn');
    const hGest = document.getElementById('header-gesture-btn');

    if (hMic) {
        const isSensorActive = modules.sensor && modules.sensor.mode.audio;
        // Correctly access voiceModule through the modules object
        const isVoiceActive = modules.voiceModule && modules.voiceModule.isListening;
        hMic.classList.toggle('header-btn-active', isSensorActive || isVoiceActive);
    }

    if (hCam) {
        hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active'));
    }

    if (hGest) {
        hGest.classList.toggle('header-btn-active', isGesturePadVisible);
    }

    // 5. Mode-Specific UI Adjustments
    document.querySelectorAll('.reset-button').forEach(b => {
        // Uses the 'settings' variable declared at the top of this function
        const isUniqueMode = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS || settings.currentMode === 'unique');
        b.style.display = isUniqueMode ? 'block' : 'none';
    });
                }
