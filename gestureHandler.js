import { CONFIG, DEFAULT_MAPPINGS, DEFAULT_HAND_MAPPINGS } from './constants.js';
import { GestureEngine } from './gestures.js';
import { addValue, handleBackspace } from './core.js';
import { renderUI, updateAllChrome } from './ui.js';
import { vibrate, showToast } from './utils.js';

// --- DEPENDENCIES INJECTED FROM APP.JS ---
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

/**
 * Maps a raw gesture string (e.g., 'hand_1_up') to a game value (e.g., 'C' or '1').
 */
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
        // Check Touch Defaults vs Custom
        const touchG = m.gesture || DEFAULT_MAPPINGS[key];
        if (matches(touchG, kind)) return true;
        // Check Hand Defaults vs Custom
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

/**
 * Informs the Gesture Engine which specific gestures to listen for 
 * based on current settings (optimization).
 */
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

/**
 * Initializes the main Touch Gesture Engine.
 */
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
                    updateIndicator(indicator, data.name, true);
                } else {
                    updateIndicator(indicator, data.name, false);
                }
            }
        },
        onContinuous: (data) => {
            handleContinuousGestures(data, gestureState, appSettings);
        }
    });
    
    modules.gestureEngine = engine;
    updateEngineConstraints();
}

// --- INTERNAL HELPERS ---

function updateIndicator(el, name, isMapped) {
    if (!el) return;
    el.textContent = name.replace(/_/g, ' ').toUpperCase();
    el.style.opacity = isMapped ? '1' : '0.5';
    el.style.color = isMapped ? 'var(--seq-bubble)' : '';
    setTimeout(() => { 
        el.style.opacity = '0.3'; 
        el.style.color = ''; 
    }, 250);
}

function handleContinuousGestures(data, gestureState, appSettings) {
    // 1. Delete/Clear (Squiggles)
    if (data.type === 'squiggle') {
        if (data.fingers === 1 && appSettings.isDeleteGestureEnabled) {
            handleBackspace();
            showToast("Deleted ⌫", appSettings);
            vibrate(appSettings);
        } else if (data.fingers === 2 && appSettings.isClearGestureEnabled) {
            const s = getState();
            s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []);
            s.nextSequenceIndex = 0;
            renderUI();
            saveState(appSettings, { current_session: s });
            showToast("CLEARED 💥", appSettings);
            vibrate(appSettings);
        }
        return;
    }

    // 2. Pinch to Zoom UI
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
            let newScale = Math.round((gestureState.startSeq * data.scale) * 10) / 10;
            appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, newScale));
            renderUI();
        } else {
            let newScale = Math.round((gestureState.startGlobal * data.scale) / 10) * 10;
            appSettings.globalUiScale = Math.min(200, Math.max(50, newScale));
            updateAllChrome();
        }
    }
}
