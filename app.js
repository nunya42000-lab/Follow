// app.js
import {
    loadState,
    saveState,
    appSettings,
    getState,
    modules
} from './state.js';
import {
    CONFIG,
    DEFAULT_PROFILE_SETTINGS
} from './config.js';
import { SettingsManager} from './settings.js';
    import {
    renderUI
} from './renderer.js';
import {
    VisionEngine
} from './vision.js';
import {
    SensorEngine
} from './sensors.js';
import {
    VoiceCommander
} from './voice-commander.js';
import {
    initComments
} from './comments.js';
import {
    showToast,
    updateAllChrome
} from './ui-core.js';
import {
    addValue,
    playDemo,
    handleBackspace
} from './game-logic.js';
import {
    initGlobalListeners
} from './global-listeners.js';
import {
    initGestureEngine
} from './gesture-engine-setup.js';
import {
    mapGestureToValue
} from './gesture-mappings.js';
import {
    db
} from './firebase-setup.js';
import {
    injectModals
} from './ui-modals.js';
import {
    initUIController
} from './ui-controller.js';

/**
 * Global Application State
 */
let isDeveloperMode = localStorage.getItem('isDeveloperMode') === 'true';
let devClickCount = 0;

export const startApp = () => {
    console.log("🛠️ System Boot Sequence Initiated...");

    // 1. Core Data Load & DOM Injection
    // injectModals MUST happen before we try to find any IDs
    loadState();
    injectModals();

    // 2. Initialize Settings Manager with full profile & lifecycle logic
    modules.settings = SettingsManager(appSettings, {
        onSave: saveState,
        onUpdate: (type) => {
            if (type === 'mode_switch') {
                const s = getState();
                s.sequences = Array.from({
                    length: CONFIG.MAX_MACHINES || 10
                }, () => []);
                s.nextSequenceIndex = 0;
                s.currentRound = 1;
                renderUI();
            } else {
                updateAllChrome();
                applyDeveloperVisibility();
                updateDynamicIncrements();
                if (type && type.toLowerCase().includes('step')) {
                    if (modules.settings.initGeneralDropdowns) modules.settings.initGeneralDropdowns();
                }
            }
        },
        onReset: () => {
            if (confirm("Factory Reset? This will wipe all data and reload.")) {
                localStorage.clear();
                location.reload();
            }
        },
        onProfileSwitch: (id) => {
            appSettings.activeProfileId = id;
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
            if (appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
            saveState();
            const s = getState();
            s.sequences = Array.from({
                length: CONFIG.MAX_MACHINES || 10
            }, () => []);
            s.nextSequenceIndex = 0;
            s.currentRound = 1;
            applyDeveloperVisibility();
            updateAllChrome();
            renderUI();
            showToast(`Profile: ${appSettings.profiles[id].name}`);
        },
        onProfileAdd: (name) => {
            const id = 'p_' + Date.now();
            appSettings.profiles[id] = {
                name,
                settings: {
                    ...DEFAULT_PROFILE_SETTINGS
                },
                theme: 'default'
            };
            appSettings.activeProfileId = id;
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
            saveState();
            renderUI();
            showToast("Profile Added");
        },
        onProfileRename: (name) => {
            if (appSettings.profiles[appSettings.activeProfileId]) {
                appSettings.profiles[appSettings.activeProfileId].name = name;
                saveState();
                updateAllChrome();
            }
        },
        onProfileDelete: () => {
            if (Object.keys(appSettings.profiles).length > 1) {
                delete appSettings.profiles[appSettings.activeProfileId];
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings));
                saveState();
                renderUI();
                showToast("Profile Deleted");
            } else {
                alert("Must keep one profile.");
            }
        },
        onProfileSave: () => {
            if (appSettings.profiles[appSettings.activeProfileId]) {
                appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings));
                saveState();
                showToast("Profile Saved!");
            }
        }
    }, null);

    // 3. Hardware Engines
    modules.sensor = new SensorEngine(
        (val, source) => {
            if (source === 'camera' && modules.vision && modules.vision.isActive) return;
            addValue(val);
            triggerKeypadVisuals(val);
        },
        (status) => {}
    );
    modules.settings.sensorEngine = modules.sensor;

    modules.vision = new VisionEngine(
        (gesture) => {
            const mappedVal = mapGestureToValue(gesture, appSettings.runtimeSettings.currentInput);
            if (mappedVal) {
                addValue(mappedVal);
                triggerKeypadVisuals(mappedVal);
                showToast(`Vision Match: ${mappedVal}`);
            }
        },
        (status) => showToast(status)
    );

    modules.voiceModule = new VoiceCommander({
        onStatus: (msg) => showToast(msg),
        onInput: (val) => {
            addValue(val);
            triggerKeypadVisuals(val);
        },
        onCommand: (cmd) => {
            if (cmd === 'CMD_PLAY') playDemo();
            if (cmd === 'CMD_CLEAR') {
                const s = getState();
                s.sequences = Array.from({
                    length: CONFIG.MAX_MACHINES || 10
                }, () => []);
                renderUI();
                showToast("Buffer Cleared");
            }
            if (cmd === 'CMD_DELETE') handleBackspace();
            if (cmd === 'CMD_SETTINGS') modules.settings.openSettings();
        }
    });

    // 4. Controller Initializations
    initUIController(); // Tab swiping & Modal management
    initGlobalListeners();
    initGestureEngine(); // OmniGesture Engine v114
    initComments(db); // Firebase Feedback

    // 5. Developer Feature Linkage
    initDeveloperControls();

    // 6. System Launch Lifecycle
    updateAllChrome();
    modules.settings.updateHeaderVisibility();

    // Auto-Input Persistence
    if (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') modules.sensor.toggleAudio(true);
    if (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') modules.sensor.toggleCamera(true);

    applyDeveloperVisibility();
    updateDynamicIncrements();
    renderUI();

    console.log("🚀 System Online.");
};

/**
 * Visual feedback for input
 */
function triggerKeypadVisuals(val) {
    const btn = document.querySelector(`#pad-${appSettings.runtimeSettings.currentInput} button[data-value="${val}"]`);
    if (btn) {
        btn.classList.add('flash-active');
        setTimeout(() => btn.classList.remove('flash-active'), 200);
    }
}

/**
 * Initialize listeners for Developer Modal features
 */
function initDeveloperControls() {
    // Visibility Toggles
    const vToggle = document.getElementById('dev-hide-voice-toggle');
    const hToggle = document.getElementById('dev-hide-haptic-toggle');

    if (vToggle) {
        vToggle.checked = appSettings.devHideVoiceSettings;
        vToggle.addEventListener('change', (e) => {
            appSettings.devHideVoiceSettings = e.target.checked;
            saveState();
            applyDeveloperVisibility();
        });
    }

    if (hToggle) {
        hToggle.checked = appSettings.devHideHapticSettings;
        hToggle.addEventListener('change', (e) => {
            appSettings.devHideHapticSettings = e.target.checked;
            saveState();
            applyDeveloperVisibility();
        });
    }

    // Increment Selectors (Speed, UI, Sequence Size)
    const selectors = {
        'dev-speed-inc-select': 'devSpeedIncrement',
        'dev-ui-inc-select': 'devUiIncrement',
        'dev-seq-inc-select': 'devSeqIncrement'
    };

    Object.entries(selectors).forEach(([id, settingKey]) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = appSettings[settingKey] || (id.includes('seq') ? "1" : "0.05");
            el.addEventListener('change', (e) => {
                appSettings[settingKey] = e.target.value;
                saveState();
                updateDynamicIncrements();
            });
        }
    });

    // Secret Trigger (7-Tap Logic)
    const devTrigger = document.getElementById('dev-secret-trigger');
    if (devTrigger) {
        devTrigger.addEventListener('click', () => {
            if (isDeveloperMode) return;
            devClickCount++;
            if (devClickCount >= 7) {
                isDeveloperMode = true;
                localStorage.setItem('isDeveloperMode', 'true');
                showToast("Developer Access Granted", "info");
                applyDeveloperVisibility();
            }
        });
    }
}

/**
 * Logic to hide/show Voice and Haptic sections in the Playback UI
 */
export function applyDeveloperVisibility() {
    const voiceSection = document.getElementById('voice-settings-section');
    const hapticSection = document.getElementById('morse-container');

    if (voiceSection) {
        voiceSection.classList.toggle('hidden', appSettings.devHideVoiceSettings);

    }
    if (hapticSection) {
        hapticSection.classList.toggle('hidden', appSettings.devHideHapticSettings);

    }

    // Update the visual state of the trigger
    const trigger = document.getElementById('dev-secret-trigger');
    if (isDeveloperMode && trigger) trigger.classList.add('text-blue-500', 'animate-pulse');
}

/**
 * Update slider step values based on Developer selections
 */
export function updateDynamicIncrements() {
    const speedSlider = document.getElementById('playback-speed-slider');
    const uiSlider = document.getElementById('ui-scale-slider');
    const seqSlider = document.getElementById('sequence-size-slider');

    if (speedSlider) speedSlider.step = appSettings.devSpeedIncrement || "0.05";
    if (uiSlider) uiSlider.step = appSettings.devUiIncrement || "0.05";
    if (seqSlider) seqSlider.step = appSettings.devSeqIncrement || "1";
}

/**
 * Developer Simulation Tools
 */
export const simulateSequence = (type) => {
    const s = getState();
    if (type === 'sim-win') s.sequences[0] = [1, 2, 3, 4, 5];
    if (type === 'sim-loss') s.sequences[0] = [9, 9, 9, 9, 9];
    if (type === 'fill-history') {
        for (let i = 0; i < 5; i++) s.sequences[i] = Array.from({
            length: 5
        }, () => Math.floor(Math.random() * 9) + 1);
    }
    renderUI();
    showToast(`Simulation: ${type}`);
};

// Global Exposure
window.applyDeveloperVisibility = applyDeveloperVisibility;
window.simulateSequence = simulateSequence;
window.updateDynamicIncrements = updateDynamicIncrements;

document.addEventListener('DOMContentLoaded', startApp);
