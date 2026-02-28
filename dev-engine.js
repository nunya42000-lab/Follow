// dev-engine.js
import {
    appSettings
} from './state.js';

// State for the developer session
export let isDeveloperMode = localStorage.getItem('isDeveloperMode') === 'true';
let devClickCount = 0;
let devClickTimer = null;

/**
 * Initializes the secret 7-click trigger on the developer icon/area
 */
export function initDeveloperTrigger(showToast) {
    const devTrigger = document.getElementById('dev-secret-trigger');
    if (!devTrigger) return;

    devTrigger.addEventListener('click', () => {
        // Reset count if too much time passes between clicks (3 seconds)
        clearTimeout(devClickTimer);
        devClickTimer = setTimeout(() => {
            devClickCount = 0;
        }, 3000);

        if (isDeveloperMode) {
            showToast("Developer mode is already active.");
            return;
        }

        devClickCount++;

        // Start showing countdown after 3 clicks
        if (devClickCount >= 4 && devClickCount <= 6) {
            showToast(`You are ${7 - devClickCount} steps away from being a developer.`);
        } else if (devClickCount === 7) {
            isDeveloperMode = true;
            localStorage.setItem('isDeveloperMode', 'true');
            showToast("You are now a developer! Long press settings for options.");
            applyDeveloperVisibility();
        }
    });
}

/**
 * Handles the logic for hiding/showing UI elements based on developer settings
 */
export function applyDeveloperVisibility() {
    const voiceSection = document.getElementById('voice-settings-section');
    const hapticSection = document.getElementById('morse-container');

    // Toggle Voice Section
    if (voiceSection) {
        if (appSettings.devHideVoiceSettings) {
            voiceSection.classList.add('hidden');
        } else {
            voiceSection.classList.remove('hidden');
        }
    }

    // Toggle Haptic/Morse Section
    if (hapticSection) {
        if (appSettings.devHideHapticSettings) {
            hapticSection.classList.add('hidden');
        } else {
            hapticSection.classList.remove('hidden');
        }
    }
}

/**
 * Utility to reset developer status (useful for the settings menu)
 */
export function resetDeveloperMode() {
    isDeveloperMode = false;
    localStorage.removeItem('isDeveloperMode');
    appSettings.devHideVoiceSettings = false;
    appSettings.devHideHapticSettings = false;
    applyDeveloperVisibility();
}

// Ensure the visibility is applied whenever this module is loaded
if (isDeveloperMode) {
    // We wrap this in a timeout to ensure the DOM is ready if imported early
    setTimeout(applyDeveloperVisibility, 0);
}