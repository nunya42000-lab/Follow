import { CONFIG, DEFAULT_MAPPINGS, DEFAULT_HAND_MAPPINGS } from './constants.js';
import { GestureEngine } from './gestures.js';
import { addValue, handleBackspace } from './core.js';
import { renderUI, updateAllChrome } from './ui.js';
import { vibrate, showToast } from './utils.js';

let getAppSettings, getProfileSettings, saveState, getState, getBlackoutState, getGesturePadVisible, setGesturePadVisible, getModules;

export function initGestureHandler(deps) {
    getAppSettings = deps.getAppSettings;
    getProfileSettings = deps.getProfileSettings;
    saveState = deps.saveState;
    getState = deps.getState;
    getBlackoutState = deps.getBlackoutState;
    getGesturePadVisible = deps.getGesturePadVisible;
    setGesturePadVisible = deps.setGesturePadVisible;
    getModules = deps.getModules;
}

export function mapGestureToValue(kind, currentInput) {
    const appSettings = getAppSettings();
    const saved = appSettings.gestureMappings || {};

    const matches = (target, incoming) => {
        if (!target) return false;
        if (target === incoming) return true;
        if (target.endsWith('_any')) {
            const base = target.replace('_any', '');
            if (incoming.startsWith(base)) return true;
        }
        return false;
    };

    const checkMatch = (key) => {
        const m = saved[key] || {};
        const touchG = m.gesture || DEFAULT_MAPPINGS[key];
        if (matches(touchG, kind)) return true;
        const handG = m.hand || DEFAULT_HAND_MAPPINGS[key];
        if (matches(handG, kind)) return true;
        return false;
    };

    if(currentInput === CONFIG.INPUTS.PIANO) {
        const keys = ['C','D','E','F','G','A','B','1','2','3','4','5'];
        for(let k of keys) { if (checkMatch('piano_' + k)) return k; }
    } else if(currentInput === CONFIG.INPUTS.KEY12) {
        for(let i=1; i<=12; i++) { if (checkMatch('k12_' + i)) return i; }
    } else if(currentInput === CONFIG.INPUTS.KEY9) {
        for(let i=1; i<=9; i++) { if (checkMatch('k9_' + i)) return i; }
    }
    return null;
}

export function updateEngineConstraints() {
    const modules = getModules();
    if (!modules.gestureEngine) return;
    const settings = getProfileSettings();
    const appSettings = getAppSettings();
    const saved = appSettings.gestureMappings || {};
    const getG = (key) => (saved[key] && saved[key].gesture) ? saved[key].gesture : DEFAULT_MAPPINGS[key];

    const activeList = [];
    if(settings.currentInput === CONFIG.INPUTS.PIANO) {
        ['C','D','E','F','G','A','B','1','2','3','4','5'].forEach(k => activeList.push(getG('piano_' + k)));
    } else if(settings.currentInput === CONFIG.INPUTS.KEY12) {
        for(let i=1; i<=12; i++) activeList.push(getG('k12_' + i));
    } else if(settings.currentInput === CONFIG.INPUTS.KEY9) {
        for(let i=1; i<=9; i++) activeList.push(getG('k9_' + i));
    }

    if (appSettings.isDeleteGestureEnabled) activeList.push('delete'); 
    if (appSettings.isClearGestureEnabled) activeList.push('clear');   

    modules.gestureEngine.updateAllowed(activeList);
}

export function initGestureEngine(gestureState) {
    const appSettings = getAppSettings();
    const blackoutState = getBlackoutState();
    const modules = getModules();

    const engine = new GestureEngine(document.body, {
        tapDelay: appSettings.gestureTapDelay || 300,
        swipeThreshold: appSettings.gestureSwipeDist || 30,
        debug: false
    }, {
        onGesture: (data) => {
            const isPadOpen = getGesturePadVisible();
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
                } else if(indicator) {
                    indicator.textContent = data.name.replace(/_/g, ' ');
                    indicator.style.opacity = '0.5';
                    setTimeout(() => indicator.style.opacity = '0.3', 500);
                }
            }
        },
        onContinuous: (data) => {
            if (data.type === 'squiggle' && data.fingers === 1) {
                if (appSettings.isDeleteGestureEnabled) { 
                    handleBackspace(); 
                    showToast("Deleted ⌫", appSettings); 
                    vibrate(appSettings); 
                }
                return;
            }
            if (data.type === 'squiggle' && data.fingers === 2) {
                if (appSettings.isClearGestureEnabled) { 
                    const s = getState(); 
                    s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
                    s.nextSequenceIndex = 0; 
                    renderUI(); 
                    saveState(); 
                    showToast("CLEARED 💥", appSettings); 
                    vibrate(appSettings); 
                }
                return;
            }
            if (data.type === 'twist' && data.fingers === 3 && appSettings.isVolumeGesturesEnabled) {
                let newVol = appSettings.voiceVolume || 1.0; newVol += (data.value * 0.05); 
                appSettings.voiceVolume = Math.min(1.0, Math.max(0.0, newVol)); saveState(); showToast(`Volume: ${(appSettings.voiceVolume * 100).toFixed(0)}% 🔊`, appSettings);
            }
            if (data.type === 'twist' && data.fingers === 2 && appSettings.isSpeedGesturesEnabled) {
                let newSpeed = appSettings.playbackSpeed || 1.0; newSpeed += (data.value * 0.05);
                appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed)); saveState(); showToast(`Speed: ${(appSettings.playbackSpeed * 100).toFixed(0)}% 🐇`, appSettings);
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
                gestureState.resetTimer = setTimeout(() => { gestureState.isPinching = false; }, 250);
                
                if (mode === 'sequence') {
                    let raw = gestureState.startSeq * data.scale; 
                    let newScale = Math.round(raw * 10) / 10;
                    if (newScale !== appSettings.uiScaleMultiplier) { 
                        appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, newScale)); 
                        renderUI(); 
                        showToast(`Cards: ${(appSettings.uiScaleMultiplier * 100).toFixed(0)}% 🔍`, appSettings); 
                    }
                } else {
                    let raw = gestureState.startGlobal * data.scale; 
                    let newScale = Math.round(raw / 10) * 10;
                    if (newScale !== appSettings.globalUiScale) { 
                        appSettings.globalUiScale = Math.min(200, Math.max(50, newScale)); 
                        updateAllChrome(); 
                        showToast(`UI: ${appSettings.globalUiScale}% 🔍`, appSettings); 
                    }
                }
            }
        }
    });
    modules.gestureEngine = engine;
    updateEngineConstraints();
}
