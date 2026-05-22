//settings-events.js
export function initEvents(manager) {
    const {
        dom,
        appSettings
    } = manager;

    // Helper: Bind a checkbox/toggle to appSettings
    const bindToggle = (element, settingKey) => {
        if (!element) return;
        element.addEventListener('change', (e) => {
            appSettings[settingKey] = e.target.checked;
            manager.updateApp();
            manager.updateHeaderVisibility();
        });
    };

    // Helper: Bind a select dropdown or input field
    const bindSelect = (element, settingKey, isFloat = false) => {
        if (!element) return;
        element.addEventListener('change', (e) => {
            appSettings[settingKey] = isFloat ? parseFloat(e.target.value) : e.target.value;
            manager.updateApp();
        });
    };

    // 1. Toggles (Booleans)
    bindToggle(dom.practiceMode, 'practiceMode');
    bindToggle(dom.autoClear, 'autoClear');
    bindToggle(dom.autoplay, 'autoplay');
    bindToggle(dom.flash, 'flash');
    bindToggle(dom.audio, 'audio');
    bindToggle(dom.hapticMorse, 'hapticMorse');
    bindToggle(dom.haptics, 'haptics');
    bindToggle(dom.speedGesturesToggle, 'speedGestures');
    bindToggle(dom.volumeGesturesToggle, 'volumeGestures');
    bindToggle(dom.deleteGestureToggle, 'deleteGesture');
    bindToggle(dom.clearGestureToggle, 'clearGesture');
    bindToggle(dom.autoTimerToggle, 'autoTimer');
    bindToggle(dom.autoCounterToggle, 'autoCounter');
    bindToggle(dom.arModeToggle, 'arMode');
    bindToggle(dom.voiceInputToggle, 'voiceInput');
    bindToggle(dom.wakeLockToggle, 'wakeLock');
    bindToggle(dom.upsideDownToggle, 'upsideDown');
    bindToggle(dom.speedDelete, 'speedDelete');
    bindToggle(dom.showWelcome, 'showWelcome');
    bindToggle(dom.blackoutToggle, 'blackout');
    bindToggle(dom.stealth1KeyToggle, 'stealth1KeyMode');
    bindToggle(dom.longPressToggle, 'longPressAutoplay');
    bindToggle(dom.blackoutGesturesToggle, 'blackoutGestures');
    bindToggle(dom.timerToggle, 'showTimer');
    bindToggle(dom.counterToggle, 'showCounter');
    bindToggle(dom.gestureToggle, 'isGestureInputEnabled');
    bindToggle(dom.quickAutoplay, 'autoplay');
    bindToggle(dom.quickAudio, 'audio');
    bindToggle(dom.dontShowWelcome, 'hideWelcomeScreen');

    // 2. Selects (Values & Floats)
    bindSelect(dom.input, 'inputMode');
    bindSelect(dom.mode, 'gameMode');
    bindSelect(dom.machines, 'machineType');
    bindSelect(dom.seqLength, 'sequenceLength', true);
    bindSelect(dom.pause, 'pauseDuration', true);
    bindSelect(dom.playbackSpeed, 'playbackSpeed', true);
    bindSelect(dom.chunk, 'chunkSize', true);
    bindSelect(dom.delay, 'delayDuration', true);
    bindSelect(dom.uiScale, 'globalUiScale', true);
    bindSelect(dom.seqSize, 'sequenceSize');
    bindSelect(dom.seqFontSize, 'sequenceFontSize');
    bindSelect(dom.gestureMode, 'gestureMode');
    bindSelect(dom.autoInput, 'autoInputDelay', true);

    if (dom.quickLang) dom.quickLang.addEventListener('change', (e) => manager.setLanguage(e.target.value));
    if (dom.generalLang) dom.generalLang.addEventListener('change', (e) => manager.setLanguage(e.target.value));

    // 3. Tabs Navigation
    if (dom.tabs) {
        dom.tabs.forEach(tab => {
            tab.addEventListener('click', () => manager.switchTab(tab.dataset.tab));
        });
    }
    if (manager.setupTabSwipe) manager.setupTabSwipe();

    // 4. Modals & Overlays Operations
    dom.closeSettingsBtn?.addEventListener('click', () => {
        dom.settingsModal?.classList.add('hidden');
        manager.updateApp();
    });

    // Share Modal
    dom.openShareInside?.addEventListener('click', () => manager.openShare());
    dom.closeShareBtn?.addEventListener('click', () => manager.closeShare());

    // Game Setup Modal
    dom.setupModal?.addEventListener('click', (e) => {
        if (e.target === dom.setupModal) manager.closeSetup();
    });
    dom.closeSetupBtn?.addEventListener('click', () => manager.closeSetup());

    // Help Modal
    dom.openHelpBtn?.addEventListener('click', () => manager.openHelp());
    dom.quickHelp?.addEventListener('click', () => manager.openHelp());
    dom.closeHelpBtn?.addEventListener('click', () => manager.closeHelp());
    dom.closeHelpBtnBottom?.addEventListener('click', () => manager.closeHelp());

    // Calibration Modal
    dom.openCalibBtn?.addEventListener('click', () => manager.openCalibration());
    dom.closeCalibBtn?.addEventListener('click', () => manager.closeCalibration());

    // Redeem & Donate Modals
    dom.openRedeemBtn?.addEventListener('click', () => manager.openRedeem());
    dom.openRedeemSettingsBtn?.addEventListener('click', () => manager.openRedeem());
    dom.closeRedeemBtn?.addEventListener('click', () => manager.closeRedeem());
    dom.openDonateBtn?.addEventListener('click', () => manager.openDonate());
    dom.closeDonateBtn?.addEventListener('click', () => manager.closeDonate());

    // Generate Prompt Button
    dom.generatePromptBtn?.addEventListener('click', () => manager.generatePrompt());

    // 5. Voice & Speech Events
    dom.voicePresetSelect?.addEventListener('change', (e) => manager.applyVoicePreset(e.target.value));
    dom.voiceTestBtn?.addEventListener('click', () => manager.testVoice());

    ['voicePitch', 'voiceRate', 'voiceVolume'].forEach(key => {
        dom[key]?.addEventListener('input', (e) => {
            appSettings[key] = parseFloat(e.target.value);
            // Optional: Debounce a voice test here
            manager.updateApp();
        });
    });

    // 6. Theme Editor Events
    dom.openEditorBtn?.addEventListener('click', () => manager.openThemeEditor());
    dom.edCancel?.addEventListener('click', () => {
        dom.editorModal?.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    });

    dom.ftToggle?.addEventListener('click', () => {
        dom.ftContainer?.classList.toggle('hidden');
    });

    ['ftHue', 'ftSat', 'ftLit'].forEach(id => {
        dom[id]?.addEventListener('input', () => manager.updateColorFromSliders());
    });

    if (dom.targetBtns) {
        dom.targetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app'));
                e.currentTarget.classList.add('active', 'bg-primary-app');
                manager.currentTargetKey = e.currentTarget.dataset.target;

                if (manager.tempTheme && manager.tempTheme[manager.currentTargetKey]) {
                    const [h, s, l] = manager.hexToHsl(manager.tempTheme[manager.currentTargetKey]);
                    if (dom.ftHue) dom.ftHue.value = h;
                    if (dom.ftSat) dom.ftSat.value = s;
                    if (dom.ftLit) dom.ftLit.value = l;
                    if (dom.ftPreview) dom.ftPreview.style.backgroundColor = manager.tempTheme[manager.currentTargetKey];
                }
            });
        });
    }

    // 7. Dynamic Range Sliders (Morse & Haptics timings)
    // Using event delegation on containers in case they are re-rendered
    document.addEventListener('input', (e) => {
        if (e.target.matches('input[type="range"][data-key]')) {
            const key = e.target.dataset.key;
            const val = parseFloat(e.target.value);
            appSettings[key] = val;

            const valDisplay = document.getElementById(`val-${key}`);
            if (valDisplay) valDisplay.textContent = val;

            manager.updateApp();
        }
    });

    // 8. Dynamic Mapping Dropdowns (Gestures to Keys)
    // Using event delegation for the dynamically generated mapping selects
    [dom.mapping9Container, dom.mapping12Container, dom.mappingPianoContainer].forEach(container => {
        if (!container) return;
        container.addEventListener('change', (e) => {
            if (e.target.tagName === 'SELECT' && e.target.dataset.key) {
                const profileId = appSettings.activeGestureProfile || 'default';
                if (!appSettings.gestureProfiles) appSettings.gestureProfiles = {};
                if (!appSettings.gestureProfiles[profileId]) appSettings.gestureProfiles[profileId] = {
                    map: {}
                };

                appSettings.gestureProfiles[profileId].map[e.target.dataset.key] = {
                    gesture: e.target.value
                };
                manager.updateApp();
            }
        });
    });

    // 9. Close Modals on Background Click
    [dom.shareModal, dom.redeemModal, dom.donateModal, dom.editorModal, dom.calibModal, dom.helpModal].forEach(modal => {
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
                modal.style.pointerEvents = 'none'; // Ensure pointer events are killed on hide
            }
        });
    });

    // 10. Developer Mode: The 7-Tap Secret Trigger
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
            const devSection = document.getElementById('dev-section');
            if (devSection) devSection.classList.remove('hidden');
            if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
            console.log("Developer Mode Unlocked");
            tapCount = 0;
        }
    });
}