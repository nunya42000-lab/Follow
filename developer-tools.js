// developer-tools.js
import { appSettings, saveState, isDeveloperMode } from './state.js';
import { showToast } from './ui-core.js';

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

export function openDeveloperModal() {
    const modal = document.getElementById('developer-modal');
    if (!modal) return;
    
    const container = document.getElementById('developer-controls-container');
    if (container && !container.hasChildNodes()) {
        const visibilitySection = document.createElement('div');
        visibilitySection.className = "mb-6 p-3 bg-gray-900 rounded-lg border border-gray-700";
        visibilitySection.innerHTML = `
            <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">UI Visibility Overrides</h3>
            <div class="flex justify-between items-center mb-3">
                <span class="text-sm">Hide Voice Settings</span>
                <input type="checkbox" id="dev-hide-voice-toggle" class="h-5 w-5" ${appSettings.devHideVoiceSettings ? 'checked' : ''}>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm">Hide Haptic Mapping</span>
                <input type="checkbox" id="dev-hide-haptic-toggle" class="h-5 w-5" ${appSettings.devHideHapticSettings ? 'checked' : ''}>
            </div>
        `;
        container.appendChild(visibilitySection);
        
        document.getElementById('dev-hide-voice-toggle')?.addEventListener('change', (e) => {
            appSettings.devHideVoiceSettings = e.target.checked;
            saveState();
            applyDeveloperVisibility();
        });
        
        document.getElementById('dev-hide-haptic-toggle')?.addEventListener('change', (e) => {
            appSettings.devHideHapticSettings = e.target.checked;
            saveState();
            applyDeveloperVisibility();
        });
        
        initDevTestBed();
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div')?.classList.remove('scale-90');
    }, 10);
    
    const mainVideo = document.querySelector('video');
    const devPreview = document.getElementById('dev-camera-preview');
    if (mainVideo && devPreview && mainVideo.srcObject) {
        devPreview.srcObject = mainVideo.srcObject;
        logToDevBox("SYSTEM", "Camera feed synced to dev preview.");
    }
}

export function initDevTestBed() {
    logToDevBox("SYSTEM", "Developer TestBed Initialized.");
}

export function logToDevBox(tag, message) {
    const logBox = document.getElementById('dev-log-box');
    if (!logBox) return;
    const entry = document.createElement('div');
    entry.className = "text-xs mb-1 text-gray-300";
    entry.innerHTML = `<span class="font-bold text-blue-400">[${tag}]</span> ${message}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
}
