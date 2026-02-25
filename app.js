// app.js
import { loadState, saveState, appSettings, getState, modules } from './state.js';
import { CONFIG, DEFAULT_PROFILE_SETTINGS } from './constants.js';
import * as SharedState from './state.js';
import { renderUI } from './renderer.js';
import { SettingsManager } from './settings.js';
import { VisionEngine } from './vision.js';
import { SensorEngine } from './sensors.js';
import { VoiceCommander } from './voice-commander.js';
import { initComments } from './comments.js';
import { showToast, updateAllChrome } from './ui-core.js';
import { addValue, playDemo, handleBackspace } from './game-logic.js';
import { initGlobalListeners } from './global-listeners.js';
import { initGestureEngine } from './gesture-engine-setup.js';
import { mapGestureToValue } from './gesture-mappings.js';
import { db } from './firebase-setup.js';

let isDeveloperMode = localStorage.getItem('isDeveloperMode') === 'true';
let devClickCount = 0;

export const startApp = () => {
    loadState();

    modules.settings = new SettingsManager(appSettings, {
        onSave: saveState,
        onUpdate: (type) => { 
            if(type === 'mode_switch') {
                const s = getState();
                s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []);
                s.nextSequenceIndex = 0;
                s.currentRound = 1;
                renderUI();
            } else {
                updateAllChrome(); 
                applyDeveloperVisibility():
            }
        },
        onReset: () => { 
            localStorage.clear(); 
            location.reload(); 
        },
        onProfileSwitch: (id) => { 
            appSettings.activeProfileId = id; 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); 
            if(appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
            saveState(); 
            const s = getState(); 
            s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
            s.nextSequenceIndex = 0; 
            s.currentRound = 1;
            renderUI(); 
        },
        onProfileAdd: (name) => { 
            const id = 'p_' + Date.now(); 
            appSettings.profiles[id] = { name, settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }; 
            appSettings.activeProfileId = id; 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); 
            saveState(); 
            renderUI(); 
        },
        onProfileRename: (name) => { 
            if(appSettings.profiles[appSettings.activeProfileId]) { 
                appSettings.profiles[appSettings.activeProfileId].name = name; 
                saveState(); 
            } 
        },
        onProfileDelete: () => { 
            if(Object.keys(appSettings.profiles).length > 1) { 
                delete appSettings.profiles[appSettings.activeProfileId]; 
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0]; 
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings)); 
                saveState(); 
                renderUI(); 
            } else { 
                alert("Must keep one profile."); 
            } 
        },
        onProfileSave: () => { 
            if(appSettings.profiles[appSettings.activeProfileId]) { 
                appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings)); 
                saveState(); 
                alert("Profile Saved!"); 
            } 
        }
    }, null); 

    modules.sensor = new SensorEngine(
        (val, source) => { 
             // Prevent Sensor Interference
             if (source === 'camera' && modules.vision && modules.vision.isActive) return;
             
             addValue(val); 
             const btn = document.querySelector(`#pad-${appSettings.runtimeSettings.currentInput} button[data-value="${val}"]`);
             if(btn) { 
                 btn.classList.add('flash-active'); 
                 setTimeout(() => btn.classList.remove('flash-active'), 200); 
             }
        },
        (status) => { }
    );

    modules.settings.sensorEngine = modules.sensor;

    modules.vision = new VisionEngine(
        (gesture) => {
            const settings = appSettings.runtimeSettings;
            const mappedVal = mapGestureToValue(gesture, settings.currentInput);
            
            if (mappedVal) {
                addValue(mappedVal);
                const btn = document.querySelector(`#pad-${settings.currentInput} button[data-value="${mappedVal}"]`);
                if(btn) { 
                    btn.classList.add('flash-active'); 
                    setTimeout(() => btn.classList.remove('flash-active'), 200); 
                }
                showToast(`Hand: ${mappedVal} 🖐️`);
            }
        },
        (status) => showToast(status)
    );

    modules.voiceModule = new VoiceCommander({
        onStatus: (msg) => showToast(msg),
        onInput: (val) => {
            addValue(val);
            const hMic = document.getElementById('header-mic-btn');
            if(hMic) {
                hMic.classList.remove('header-btn-active');
                setTimeout(() => {
                    if(modules.voiceModule && modules.voiceModule.isListening) {
                        hMic.classList.add('header-btn-active');
                    }
                }, 300);
            }
            const btn = document.querySelector(`#pad-${appSettings.runtimeSettings.currentInput} button[data-value="${val}"]`);
            if(btn) { 
                btn.classList.add('flash-active'); 
                setTimeout(() => btn.classList.remove('flash-active'), 200); 
            }
        },
        onCommand: (cmd) => {
            if(cmd === 'CMD_PLAY') playDemo();
            if(cmd === 'CMD_STOP') { 
                showToast("Stopped"); 
            }
            if(cmd === 'CMD_CLEAR') { 
                const s = getState(); 
                s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
                renderUI(); 
                showToast("Cleared"); 
            }
            if(cmd === 'CMD_DELETE') handleBackspace();
            if(cmd === 'CMD_SETTINGS') modules.settings.openSettings();
        }
    });

    updateAllChrome();
    initComments(db);
    modules.settings.updateHeaderVisibility();
    
    initGlobalListeners(); 
    initGestureEngine();   
    
    if (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleAudio(true);
    }
    if (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleCamera(true);
    }
    
    renderUI();

    const devTrigger = document.getElementById('dev-secret-trigger');
    if (devTrigger) {
        devTrigger.addEventListener('click', () => {
            if (isDeveloperMode) return;

            devClickCount++;
            
            if (devClickCount === 4) showToast("3");
            if (devClickCount === 5) showToast("2");
            if (devClickCount === 6) showToast("1");
            
            if (devClickCount === 7) {
                isDeveloperMode = true;
                localStorage.setItem('isDeveloperMode', 'true');
                showToast("You are now a developer. Long press the settings button to access developer options");
            }
        });
    }
};

export function applyDeveloperVisibility() {
    const voiceSection = document.getElementById('voice-settings-section');
    const hapticSection = document.getElementById('morse-container');

    if (voiceSection) {
        if (appSettings.devHideVoiceSettings) {
            voiceSection.classList.add('hidden');
        } else {
            voiceSection.classList.remove('hidden');
        }
    }

    if (hapticSection) {
        if (appSettings.devHideHapticSettings) {
            hapticSection.classList.add('hidden');
        } else {
            hapticSection.classList.remove('hidden');
        }
    }
}
window.applyDeveloperVisibility = applyDeveloperVisibility;

document.addEventListener('DOMContentLoaded', () => {
    startApp(); 
    if (typeof applyDeveloperVisibility === 'function') {
        applyDeveloperVisibility();
    }
});;