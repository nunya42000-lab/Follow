// state.js
import { CONFIG, DEFAULT_PROFILE_SETTINGS, DEFAULT_APP } from './constants.js';

// Global App State and Settings
export let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
export let appState = {};
export let modules = { sensor: null, settings: null };

// Timers and hardware states
export let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null, stealth: null, stealthAction: null, playback: null, tap: null };
export let gestureState = { startDist: 0, startScale: 1, isPinching: false };
export let blackoutState = { isActive: false, lastShake: 0 }; 
export let gestureInputState = { startX: 0, startY: 0, startTime: 0, maxTouches: 0, isTapCandidate: false, tapCount: 0 };

// Game flags
export let isDeleting = false; 
export let isDemoPlaying = false;
export let isPlaybackPaused = false;
export let playbackResumeCallback = null;
export let practiceSequence = [];
export let practiceInputIndex = 0;
export let ignoreNextClick = false;
export let voiceModule = null;
export let isGesturePadVisible = false;

// Dev features
export let devClickCount = 0;
export let isDeveloperMode = localStorage.getItem('isDeveloperMode') === 'true';
export let devLongPressTimer; 

// Auto-logic globals
export let simpleTimer = { interval: null, startTime: 0, elapsed: 0, isRunning: false };
export let simpleCounter = 0;
export let globalTimerActions = { start: null, stop: null, reset: null };
export let globalCounterActions = { increment: null, reset: null };

// Getters
export const getProfileSettings = () => appSettings.runtimeSettings;
export const getState = () => appState['current_session'] || (appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 });

// Save / Load logic
export function saveState() { 
    localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); 
    localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState)); 
}

export function loadState(applyUpsideDownFn) { 
    try { 
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS); 
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE); 
        
        if(s) { 
            const loaded = JSON.parse(s); 
            appSettings = { ...DEFAULT_APP, ...loaded, profiles: { ...DEFAULT_APP.profiles, ...(loaded.profiles || {}) }, customThemes: { ...DEFAULT_APP.customThemes, ...(loaded.customThemes || {}) } }; 
            
            // Apply defaults for missing fields
            if (typeof appSettings.isHapticsEnabled === 'undefined') appSettings.isHapticsEnabled = true;
            if (typeof appSettings.isSpeedDeletingEnabled === 'undefined') appSettings.isSpeedDeletingEnabled = true;
            if (typeof appSettings.isLongPressAutoplayEnabled === 'undefined') appSettings.isLongPressAutoplayEnabled = true;
            if (typeof appSettings.isUniqueRoundsAutoClearEnabled === 'undefined') appSettings.isUniqueRoundsAutoClearEnabled = true; 
            if (typeof appSettings.showTimer === 'undefined') appSettings.showTimer = false;
            if (typeof appSettings.showCounter === 'undefined') appSettings.showCounter = false;

            if (!appSettings.voicePresets) appSettings.voicePresets = {};
            if (!appSettings.activeVoicePresetId) appSettings.activeVoicePresetId = 'standard';
            if (!appSettings.generalLanguage) appSettings.generalLanguage = 'en';
            if (!appSettings.gestureResizeMode) appSettings.gestureResizeMode = 'global';

            if(!appSettings.runtimeSettings) appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId]?.settings || DEFAULT_PROFILE_SETTINGS)); 
            if(appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
        } else { 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles['profile_1'].settings)); 
        } 
        
        if(st) appState = JSON.parse(st); 
        if(!appState['current_session']) appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
        
        appState['current_session'].currentRound = parseInt(appState['current_session'].currentRound) || 1;
        
        // Execute UI callback if provided to prevent circular dependencies
        if (typeof applyUpsideDownFn === 'function') {
            applyUpsideDownFn();
        }
        
    } catch(e) { 
        console.error("Load failed", e); 
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP)); 
        saveState(); 
    } 
}
