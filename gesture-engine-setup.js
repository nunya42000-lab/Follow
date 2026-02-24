// gesture-engine-setup.js
import { GestureEngine } from './gestures.js';
import { appSettings, gestureState, saveState } from './state.js';
import { showToast } from './ui-core.js';
import { renderUI } from './renderer.js';

let gestureEngineInstance = null;

export function initGestureEngine() {
    try {
        gestureEngineInstance = new GestureEngine(document.body, (data) => {
            if (data.type === 'swipe') {
                if (data.dir === 'up') {
                    let newSpeed = appSettings.playbackSpeed + 0.1;
                    appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed));
                    saveState();
                    showToast(`Speed: ${(appSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
                } else if (data.dir === 'down') {
                    let newSpeed = appSettings.playbackSpeed - 0.1;
                    appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed));
                    saveState();
                    showToast(`Speed: ${(appSettings.playbackSpeed * 100).toFixed(0)}% 🐢`);
                }
            }
            
            if (data.type === 'pinch') {
                const mode = appSettings.gestureResizeMode || 'global';
                if (mode === 'none') return;
                
                if (!gestureState.isPinching) {
                    gestureState.isPinching = true;
                    gestureState.startGlobal = appSettings.globalUiScale;
                    gestureState.startSeq = appSettings.uiScaleMultiplier;
                }
                
                clearTimeout(gestureState.resetTimer);
                gestureState.resetTimer = setTimeout(() => {
                    gestureState.isPinching = false;
                }, 250);
                
                if (mode === 'sequence') {
                    let raw = gestureState.startSeq * data.scale;
                    let newScale = Math.round(raw * 10) / 10;
                    if (newScale !== appSettings.uiScaleMultiplier) {
                        appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, newScale));
                        renderUI();
                        showToast(`Cards: ${(appSettings.uiScaleMultiplier * 100).toFixed(0)}% 🔍`);
                    }
                } else {
                    let raw = gestureState.startGlobal * data.scale;
                    let newScale = Math.round(raw * 10) / 10;
                    if (newScale !== appSettings.globalUiScale) {
                        appSettings.globalUiScale = Math.min(2.0, Math.max(0.5, newScale));
                        document.documentElement.style.fontSize = `${16 * appSettings.globalUiScale}px`;
                        showToast(`UI Scale: ${(appSettings.globalUiScale * 100).toFixed(0)}% 🔍`);
                    }
                }
            }
        });
    } catch(e) {
        console.error("Gesture Engine Initialization Error:", e);
    }
}

export function getGestureEngine() {
    return gestureEngineInstance;
}
