import { injectModals } from './ui-modals.js';
import { initOfflinePersistence } from './firebase-setup.js';
import { loadState, saveState, appSettings } from './state.js';
import * as SharedState from './state.js';
import { applyUpsideDown, applyWakeLock } from './hardware.js';
import { updateAllChrome } from './ui-core.js';
import { renderUI } from './renderer.js';
import { addValue, handleBackspace, playDemo } from './game-logic.js';
import { VoiceCommander } from './voice-commander.js';
import { GestureEngine } from './gestures.js';
import { SensorEngine } from './sensors.js';
import { SettingsManager } from './settings.js';
import { initComments } from './comments.js';
import { VisionEngine } from './vision.js';

function initGlobalListeners() {
    // Input pads
    ['key9', 'key12', 'piano'].forEach(k => {
        const pad = document.getElementById(`pad-${k}`);
        if(pad) {
            pad.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-value]');
                if(btn) {
                    if (SharedState.ignoreNextClick) {
                        SharedState.ignoreNextClick = false;
                        return;
                    }
                    addValue(btn.dataset.value);
                }
            });
        }
    });

    // Toolbar buttons
    const demoBtn = document.querySelector('button[data-action="play-demo"]');
    if (demoBtn) demoBtn.addEventListener('click', playDemo);
    
    const backBtn = document.querySelector('button[data-action="backspace"]');
    if (backBtn) backBtn.addEventListener('click', handleBackspace);

    // Global Header Toggles
    const headerMicBtn = document.getElementById('header-mic-btn');
    if (headerMicBtn) {
        headerMicBtn.addEventListener('click', () => {
            if (SharedState.voiceModule) SharedState.voiceModule.toggle();
        });
    }
    
    const hGest = document.getElementById('header-gesture-btn');
    if (hGest) {
        hGest.addEventListener('click', () => {
            SharedState.isGesturePadVisible = !SharedState.isGesturePadVisible;
            renderUI();
        });
    }

    // Apply specific Dev Tools toggles on boot
    applyDeveloperVisibility();
}

function startApp() {
    // 1. Boot Core Systems
    injectModals();
    loadState(applyUpsideDown);
    applyWakeLock();
    
    // 2. Initialize Hardware & Settings
    SharedState.modules.sensor = new SensorEngine();
    
    // FIXED: Passed the required arguments so SettingsManager doesn't crash
    SharedState.modules.settings = new SettingsManager(
        SharedState.appSettings, 
        { 
            onSave: saveState,
            onSettingsChange: () => { 
                saveState(); 
                updateAllChrome(); 
            } 
        }, 
        SharedState.modules.sensor
    );

    // 3. Initialize Voice Engine
    SharedState.voiceModule = new VoiceCommander({
        onAddValue: (val) => addValue(val),
        onPlay: () => playDemo(),
        onStop: () => {
            SharedState.isDemoPlaying = false;
            SharedState.isPlaybackPaused = false;
            renderUI();
        },
        onBackspace: () => handleBackspace(),
        onStateChange: (isActive) => renderUI()
    });

    // 4. Attach Listeners and Render
    initGlobalListeners();
    updateAllChrome();
    
    try {
        initComments();
    } catch(e) {
        console.error('Comments failed', e);
    }
    
    // Fallback UI render to ensure data populates correctly on first load
    setTimeout(renderUI, 100);
}

function applyDeveloperVisibility() {
    const voiceSection = document.getElementById('voice-settings-section');
    const hapticSection = document.getElementById('morse-container');

    if (voiceSection) {
        // FIXED: Re-mapped to SharedState to avoid undefined object crashes
        if (SharedState.appSettings.devHideVoiceSettings) {
            voiceSection.classList.add('hidden');
        } else {
            voiceSection.classList.remove('hidden');
        }
    }

    if (hapticSection) {
        if (SharedState.appSettings.devHideHapticSettings) {
            hapticSection.classList.add('hidden');
        } else {
            hapticSection.classList.remove('hidden');
        }
    }
}
window.applyDeveloperVisibility = applyDeveloperVisibility;

const hardResetBtn = document.getElementById('hard-reset-btn'); 
if (hardResetBtn) {
    hardResetBtn.addEventListener('click', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister(); // Clears offline cache ghosts
                }
            });
        }
        window.location.reload(true); // Hard reboot
    });
}

document.addEventListener('DOMContentLoaded', () => {
    startApp(); 
});
