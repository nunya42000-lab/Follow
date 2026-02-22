export function initEvents(manager) {
    manager.initListeners = () => {
        const { dom, appSettings } = manager;

        // 1. Core Navigation & Overlays
        document.querySelector('[data-action="open-settings"]')?.addEventListener('click', () => {
            dom.settingsModal?.classList.remove('hidden');
        });
        
        dom.closeSettingsBtn?.addEventListener('click', () => {
            dom.settingsModal?.classList.add('hidden');
            manager.updateApp();
        });

        [dom.shareModal, dom.redeemModal, dom.donateModal, dom.editorModal].forEach(modal => {
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        });

        // 2. Tab Navigation
        dom.tabs.forEach(tab => {
            tab.addEventListener('click', () => manager.switchTab(tab.dataset.tab));
        });
        manager.setupTabSwipe();

        // 3. UI Resizing and Basic Toggles
        dom.uiScale?.addEventListener('change', (e) => {
            appSettings.uiScale = parseFloat(e.target.value);
            manager.updateApp();
        });

        dom.playbackSpeed?.addEventListener('change', (e) => {
            appSettings.playbackSpeed = parseFloat(e.target.value);
            manager.updateApp();
        });

        dom.stealth1KeyToggle?.addEventListener('change', (e) => {
            // Activates "Bigger Buttons" mode
            appSettings.stealth1KeyMode = e.target.checked;
            manager.updateApp();
        });

        // 4. Developer Dynamic Toggles Logic
        // Ensures Voice and Haptic sections are completely hidden until toggled on
        dom.devVoiceToggle?.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            appSettings.devHideVoiceSettings = !isEnabled;
            if (dom.voiceSection) {
                dom.voiceSection.classList.toggle('hidden', !isEnabled);
            }
            manager.updateApp();
        });

        dom.devHapticToggle?.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            appSettings.devHideHapticSettings = !isEnabled;
            if (dom.morseContainer) {
                dom.morseContainer.classList.toggle('hidden', !isEnabled);
            }
            manager.updateApp();
        });

        // 5. Input Mapping Listeners
        document.querySelectorAll('.mapping-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const key = e.target.dataset.mapping;
                if (!appSettings.mappings) appSettings.mappings = {};
                if (!appSettings.mappings[key]) appSettings.mappings[key] = {};
                appSettings.mappings[key].gesture = e.target.value;
                manager.updateApp();
            });
        });

        // 6. Morse & Haptic Timers Listeners
        document.querySelectorAll('input[type="range"][data-key]').forEach(range => {
            range.addEventListener('input', (e) => {
                const key = e.target.dataset.key;
                const val = parseFloat(e.target.value);
                appSettings[key] = val;
                
                const valDisplay = document.getElementById(`val-${key}`);
                if (valDisplay) valDisplay.textContent = val;
                
                manager.updateApp();
            });
        });
    };
}
    appSettings[key] = val;
                
                // Update the visual label next to the slider
                const label = document.getElementById(`val-${key}`);
                if (label) label.textContent = val;
                
                manager.updateApp();
            }
        });

        // 7. Developer Mode: The 7-Tap Secret Trigger
        let tapCount = 0;
        let lastTap = 0;
        const titleTrigger = document.getElementById('settings-title');

        titleTrigger?.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastTap < 500) {
                tapCount++;
            } else {
                tapCount = 1;
            }
            lastTap = now;

            if (tapCount === 7) {
                dom.devSection?.classList.remove('hidden');
                if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
                alert("Developer Mode Unlocked");
                tapCount = 0;
            }
        });
    };
}
