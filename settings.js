    // ... Continued from Part 1

    populateVoicePresetDropdown() {
        if (!this.dom.voicePresetSelect) return;
        this.dom.voicePresetSelect.innerHTML = '';

        const grp1 = document.createElement('optgroup');
        grp1.label = "Built-in";
        Object.keys(PREMADE_VOICE_PRESETS).forEach(k => {
            const el = document.createElement('option');
            el.value = k;
            el.textContent = PREMADE_VOICE_PRESETS[k].name;
            grp1.appendChild(el);
        });
        this.dom.voicePresetSelect.appendChild(grp1);

        const grp2 = document.createElement('optgroup');
        grp2.label = "My Voices";
        if (this.appSettings.voicePresets) {
            Object.keys(this.appSettings.voicePresets).forEach(k => {
                const el = document.createElement('option');
                el.value = k;
                el.textContent = this.appSettings.voicePresets[k].name;
                grp2.appendChild(el);
            });
        }
        this.dom.voicePresetSelect.appendChild(grp2);

        this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
    }

    applyVoicePreset(id) {
        let preset = this.appSettings.voicePresets[id] || PREMADE_VOICE_PRESETS[id] || PREMADE_VOICE_PRESETS['standard'];
        this.appSettings.voicePitch = preset.pitch;
        this.appSettings.voiceRate = preset.rate;
        this.appSettings.voiceVolume = preset.volume;
        this.updateUIFromSettings();
        this.callbacks.onSave();
    }

    buildColorGrid() { if (!this.dom.editorGrid) return; this.dom.editorGrid.innerHTML = ''; CRAYONS.forEach(color => { const btn = document.createElement('div'); btn.style.backgroundColor = color; btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm"; btn.onclick = () => this.applyColorToTarget(color); this.dom.editorGrid.appendChild(btn); }); }
    applyColorToTarget(hex) { if (!this.tempTheme) return; this.tempTheme[this.currentTargetKey] = hex; const [h, s, l] = this.hexToHsl(hex); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = hex; if (this.dom.ftContainer.classList.contains('hidden')) { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; } this.updatePreview(); }
    updateColorFromSliders() { const h = parseInt(this.dom.ftHue.value); const s = parseInt(this.dom.ftSat.value); const l = parseInt(this.dom.ftLit.value); const hex = this.hslToHex(h, s, l); this.dom.ftPreview.style.backgroundColor = hex; if (this.tempTheme) { this.tempTheme[this.currentTargetKey] = hex; this.updatePreview(); } }
    openThemeEditor() { if (!this.dom.editorModal) return; const activeId = this.appSettings.activeTheme; const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default']; this.tempTheme = { ...source }; this.dom.edName.value = this.tempTheme.name; this.dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app')); this.dom.targetBtns[2].classList.add('active', 'bg-primary-app'); this.currentTargetKey = 'bubble'; const [h, s, l] = this.hexToHsl(this.tempTheme.bubble); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme.bubble; this.updatePreview(); this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.remove('scale-90'); }
    updatePreview() { const t = this.tempTheme; if (!this.dom.edPreview) return; this.dom.edPreview.style.backgroundColor = t.bgMain; this.dom.edPreview.style.color = t.text; this.dom.edPreviewCard.style.backgroundColor = t.bgCard; this.dom.edPreviewCard.style.color = t.text; this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)'; this.dom.edPreviewBtn.style.backgroundColor = t.bubble; this.dom.edPreviewBtn.style.color = t.text; }
    testVoice() { if (window.speechSynthesis) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance("Testing 1 2 3."); if (this.appSettings.selectedVoice) { const v = window.speechSynthesis.getVoices().find(voice => voice.name === this.appSettings.selectedVoice); if (v) u.voice = v; } let p = parseFloat(this.dom.voicePitch.value); let r = parseFloat(this.dom.voiceRate.value); let v = parseFloat(this.dom.voiceVolume.value); u.pitch = p; u.rate = r; u.volume = v; window.speechSynthesis.speak(u); } }
    
    setLanguage(lang) {
        const t = LANG[lang];
        if (!t) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
        
        // Persist
        this.appSettings.generalLanguage = lang;
        if (this.dom.quickLang) this.dom.quickLang.value = lang;
        if (this.dom.generalLang) this.dom.generalLang.value = lang;
        this.callbacks.onSave();
    }

    openShare() { if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); if (this.dom.shareModal) { this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); setTimeout(() => this.dom.shareModal.querySelector('.share-sheet').classList.add('active'), 10); } }
    closeShare() { if (this.dom.shareModal) { this.dom.shareModal.querySelector('.share-sheet').classList.remove('active'); setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300); } }
    openCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'auto'; this.sensorEngine.toggleAudio(true); this.sensorEngine.toggleCamera(true); this.sensorEngine.setCalibrationCallback((data) => { if (this.dom.calibAudioBar) { const pct = ((data.audio - (-100)) / ((-30) - (-100))) * 100; this.dom.calibAudioBar.style.width = `${Math.max(0, Math.min(100, pct))}%`; } if (this.dom.calibCamBar) { const pct = Math.min(100, data.camera); this.dom.calibCamBar.style.width = `${pct}%`; } }); } }
    closeCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'none'; this.sensorEngine.setCalibrationCallback(null); this.sensorEngine.toggleAudio(this.appSettings.isAudioEnabled); this.sensorEngine.toggleCamera(this.appSettings.autoInputMode === 'cam' || this.appSettings.autoInputMode === 'both'); } }

    toggleRedeem(show) {
        if (show) {
            if (this.dom.redeemModal) {
                this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.redeemModal.style.pointerEvents = 'auto';
            }
        } else {
            if (this.dom.redeemModal) {
                this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.redeemModal.style.pointerEvents = 'none';
            }
        }
    }

    toggleDonate(show) {
        if (show) {
            if (this.dom.donateModal) {
                this.dom.donateModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.donateModal.style.pointerEvents = 'auto';
            }
        } else {
            if (this.dom.donateModal) {
                this.dom.donateModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.donateModal.style.pointerEvents = 'none';
            }
        }
    }

    initListeners() {
        this.dom.targetBtns.forEach(btn => { btn.onclick = () => { this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); }); btn.classList.add('active', 'bg-primary-app'); btn.classList.remove('opacity-60'); this.currentTargetKey = btn.dataset.target; if (this.tempTheme) { const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme[this.currentTargetKey]; } }; });
        [this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => { sl.oninput = () => this.updateColorFromSliders(); });
        this.dom.ftToggle.onclick = () => { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; };
        if (this.dom.edSave) this.dom.edSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onSave(); this.callbacks.onUpdate(); this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.add('scale-90'); this.populateThemeDropdown(); } };
        if (this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
        if (this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };

        // Voice Controls
        if (this.dom.voiceTestBtn) this.dom.voiceTestBtn.onclick = () => this.testVoice();
        const updateVoiceLive = () => {
            this.appSettings.voicePitch = parseFloat(this.dom.voicePitch.value);
            this.appSettings.voiceRate = parseFloat(this.dom.voiceRate.value);
            this.appSettings.voiceVolume = parseFloat(this.dom.voiceVolume.value);
        };
        if (this.dom.voicePitch) this.dom.voicePitch.oninput = updateVoiceLive;
        if (this.dom.voiceRate) this.dom.voiceRate.oninput = updateVoiceLive;
        if (this.dom.voiceVolume) this.dom.voiceVolume.oninput = updateVoiceLive;

        // Voice Preset Management
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.onchange = (e) => {
            this.appSettings.activeVoicePresetId = e.target.value;
            this.applyVoicePreset(e.target.value);
        };
        if (this.dom.voicePresetAdd) this.dom.voicePresetAdd.onclick = () => {
            const n = prompt("New Voice Preset Name:");
            if (n) {
                const id = 'vp_' + Date.now();
                this.appSettings.voicePresets[id] = {
                    name: n,
                    pitch: this.appSettings.voicePitch,
                    rate: this.appSettings.voiceRate,
                    volume: this.appSettings.voiceVolume
                };
                this.appSettings.activeVoicePresetId = id;
                this.populateVoicePresetDropdown();
                this.callbacks.onSave();
            }
        };
        if (this.dom.voicePresetSave) this.dom.voicePresetSave.onclick = () => {
            const id = this.appSettings.activeVoicePresetId;
            if (PREMADE_VOICE_PRESETS[id]) {
                alert("Cannot save over built-in presets. Create a new one.");
                return;
            }
            if (this.appSettings.voicePresets[id]) {
                this.appSettings.voicePresets[id] = {
                    ...this.appSettings.voicePresets[id],
                    pitch: parseFloat(this.dom.voicePitch.value),
                    rate: parseFloat(this.dom.voiceRate.value),
                    volume: parseFloat(this.dom.voiceVolume.value)
                };
                this.callbacks.onSave();
                alert("Voice Preset Saved!");
            }
        };
        if (this.dom.voicePresetDelete) this.dom.voicePresetDelete.onclick = () => {
            const id = this.appSettings.activeVoicePresetId;
            if (PREMADE_VOICE_PRESETS[id]) { alert("Cannot delete built-in."); return; }
            if (confirm("Delete this voice preset?")) {
                delete this.appSettings.voicePresets[id];
                this.appSettings.activeVoicePresetId = 'standard';
                this.populateVoicePresetDropdown();
                this.applyVoicePreset('standard');
            }
        };
        if (this.dom.voicePresetRename) this.dom.voicePresetRename.onclick = () => {
            const id = this.appSettings.activeVoicePresetId;
            if (PREMADE_VOICE_PRESETS[id]) return alert("Cannot rename built-in.");
            const n = prompt("Rename:", this.appSettings.voicePresets[id].name);
            if (n) {
                this.appSettings.voicePresets[id].name = n;
                this.populateVoicePresetDropdown();
                this.callbacks.onSave();
            }
        };

        if (this.dom.quickLang) this.dom.quickLang.onchange = (e) => this.setLanguage(e.target.value);
        if (this.dom.generalLang) this.dom.generalLang.onchange = (e) => this.setLanguage(e.target.value);
        const handleProfileSwitch = (val) => { this.callbacks.onProfileSwitch(val); this.openSettings(); };
        if (this.dom.configSelect) this.dom.configSelect.onchange = (e) => handleProfileSwitch(e.target.value);
        if (this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => handleProfileSwitch(e.target.value);

        const bind = (el, prop, isGlobal, isInt = false, isFloat = false) => {
            if (!el) return;
            el.onchange = () => {
                let val = (el.type === 'checkbox') ? el.checked : el.value;
                if (isInt) val = parseInt(val);
                if (isFloat) val = parseFloat(val);
                if (isGlobal) {
                    this.appSettings[prop] = val;
                    if (prop === 'activeTheme') this.callbacks.onUpdate();
                    if (prop === 'isPracticeModeEnabled') this.callbacks.onUpdate();
                } else {
                    this.appSettings.runtimeSettings[prop] = val;
                }
                this.callbacks.onSave();
                this.generatePrompt();
            };
        };

        bind(this.dom.input, 'currentInput', false); bind(this.dom.machines, 'machineCount', false, true); bind(this.dom.seqLength, 'sequenceLength', false, true); bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
        bind(this.dom.longPressToggle, 'isLongPressAutoplayEnabled', true);

        if (this.dom.mode) {
            this.dom.mode.onchange = () => {
                this.appSettings.runtimeSettings.currentMode = this.dom.mode.value;
                this.callbacks.onSave();
                this.callbacks.onUpdate('mode_switch');
                this.generatePrompt();
            };
        }

        if (this.dom.input) this.dom.input.addEventListener('change', () => this.generatePrompt());
        if (this.dom.machines) this.dom.machines.addEventListener('change', () => this.generatePrompt());
        if (this.dom.seqLength) this.dom.seqLength.addEventListener('change', () => this.generatePrompt());
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.addEventListener('change', () => this.generatePrompt());
        if (this.dom.delay) this.dom.delay.addEventListener('change', () => this.generatePrompt());
        if (this.dom.chunk) this.dom.chunk.addEventListener('change', () => this.generatePrompt());

        if (this.dom.autoplay) {
            this.dom.autoplay.onchange = (e) => {
                this.appSettings.isAutoplayEnabled = e.target.checked;
                if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.audio) {
            this.dom.audio.onchange = (e) => {
                this.appSettings.isAudioEnabled = e.target.checked;
                if (this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.quickAutoplay) {
            this.dom.quickAutoplay.onchange = (e) => {
                this.appSettings.isAutoplayEnabled = e.target.checked;
                if (this.dom.autoplay) this.dom.autoplay.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.quickAudio) {
            this.dom.quickAudio.onchange = (e) => {
                this.appSettings.isAudioEnabled = e.target.checked;
                if (this.dom.audio) this.dom.audio.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.dontShowWelcome) {
            this.dom.dontShowWelcome.onchange = (e) => {
                this.appSettings.showWelcomeScreen = !e.target.checked;
                if (this.dom.showWelcome) this.dom.showWelcome.checked = !e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.showWelcome) {
            this.dom.showWelcome.onchange = (e) => {
                this.appSettings.showWelcomeScreen = e.target.checked;
                if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !e.target.checked;
                this.callbacks.onSave();
            }
        }

        // --- NEW BINDINGS FOR STEALTH TAB ---
        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', true);
        bind(this.dom.blackoutGesturesToggle, 'isBlackoutGesturesEnabled', true);
        bind(this.dom.stealth1KeyToggle, 'isStealth1KeyEnabled', true); // Remapped inputs-only toggle
        // ------------------------------------

        if (this.dom.playbackSpeed) this.dom.playbackSpeed.onchange = (e) => { this.appSettings.playbackSpeed = parseFloat(e.target.value); this.callbacks.onSave(); this.generatePrompt(); };
        bind(this.dom.chunk, 'simonChunkSize', false, true);
        if (this.dom.delay) this.dom.delay.onchange = (e) => { this.appSettings.runtimeSettings.simonInterSequenceDelay = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
        bind(this.dom.haptics, 'isHapticsEnabled', true); bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true); 
        bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
        if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); this.callbacks.onUpdate(); };
        if (this.dom.seqSize) this.dom.seqSize.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
        if (this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => { this.appSettings.gestureResizeMode = e.target.value; this.callbacks.onSave(); };
        if (this.dom.autoInput) this.dom.autoInput.onchange = (e) => { const val = e.target.value; this.appSettings.autoInputMode = val; this.appSettings.showMicBtn = (val === 'mic' || val === 'both'); this.appSettings.showCamBtn = (val === 'cam' || val === 'both'); this.callbacks.onSave(); this.callbacks.onUpdate(); };
        if (this.dom.themeAdd) this.dom.themeAdd.onclick = () => { const n = prompt("Name:"); if (n) { const id = 'c_' + Date.now(); this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'], name: n }; this.appSettings.activeTheme = id; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); this.openThemeEditor(); } };
        if (this.dom.themeRename) this.dom.themeRename.onclick = () => { const id = this.appSettings.activeTheme; if (PREMADE_THEMES[id]) return alert("Cannot rename built-in."); const n = prompt("Rename:", this.appSettings.customThemes[id].name); if (n) { this.appSettings.customThemes[id].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); } };
        if (this.dom.themeDelete) this.dom.themeDelete.onclick = () => { if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in."); if (confirm("Delete?")) { delete this.appSettings.customThemes[this.appSettings.activeTheme]; this.appSettings.activeTheme = 'default'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); } };
        if (this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); this.populateThemeDropdown(); };
        if (this.dom.configAdd) this.dom.configAdd.onclick = () => { const n = prompt("Profile Name:"); if (n) this.callbacks.onProfileAdd(n); this.openSettings(); };
        if (this.dom.configRename) this.dom.configRename.onclick = () => { const n = prompt("Rename:"); if (n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
        if (this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
        if (this.dom.configSave) this.dom.configSave.onclick = () => { this.callbacks.onProfileSave(); };
        if (this.dom.themeSave) this.dom.themeSave.onclick = () => {
            if (this.tempTheme) {
                const activeId = this.appSettings.activeTheme;
                if (PREMADE_THEMES[activeId]) {
                    const newId = 'custom_' + Date.now();
                    this.appSettings.customThemes[newId] = this.tempTheme;
                    this.appSettings.activeTheme = newId;
                } else {
                    this.appSettings.customThemes[activeId] = this.tempTheme;
                }
                this.callbacks.onProfileSave();
                this.callbacks.onUpdate();
                this.populateThemeDropdown();
                alert("Theme Saved!");
            }
        };
        if (this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if (this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        if (this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.generatePrompt(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
        if (this.dom.closeHelpBtnBottom) this.dom.closeHelpBtnBottom.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
        if (this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => { this.generatePrompt(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
        if (this.dom.openCalibBtn) this.dom.openCalibBtn.onclick = () => this.openCalibration();
        if (this.dom.closeCalibBtn) this.dom.closeCalibBtn.onclick = () => this.closeCalibration();
        if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.oninput = () => { const val = parseInt(this.dom.calibAudioSlider.value); this.appSettings.sensorAudioThresh = val; this.sensorEngine.setSensitivity('audio', val); const pct = ((val - (-100)) / ((-30) - (-100))) * 100; this.dom.calibAudioMarker.style.left = `${pct}%`; this.dom.calibAudioVal.innerText = val + 'dB'; this.callbacks.onSave(); };
        if (this.dom.calibCamSlider) this.dom.calibCamSlider.oninput = () => { const val = parseInt(this.dom.calibCamSlider.value); this.appSettings.sensorCamThresh = val; this.sensorEngine.setSensitivity('camera', val); const pct = Math.min(100, val); this.dom.calibCamMarker.style.left = `${pct}%`; this.dom.calibCamVal.innerText = val; this.callbacks.onSave(); };

        this.dom.tabs.forEach(btn => {
            btn.onclick = () => {
                const parent = btn.parentElement.parentElement;
                parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.tab;
                if (target === 'help-voice') this.generatePrompt();
                
                // Handle generated DOM elements if using stealth tab
                const targetEl = document.getElementById(`tab-${target}`);
                if(targetEl) targetEl.classList.add('active');
            }
        });

        if (this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
        if (this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.closeShare();
        if (this.dom.openRedeemBtn) this.dom.openRedeemBtn.onclick = () => this.toggleRedeem(true);
        if (this.dom.closeRedeemBtn) this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);

        if (this.dom.openRedeemSettingsBtn) this.dom.openRedeemSettingsBtn.onclick = () => this.toggleRedeem(true);
        if (this.dom.openDonateBtn) this.dom.openDonateBtn.onclick = () => this.toggleDonate(true);
        if (this.dom.closeDonateBtn) this.dom.closeDonateBtn.onclick = () => this.toggleDonate(false);

        if (this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick = () => { navigator.clipboard.writeText(window.location.href).then(() => alert("Link Copied!")); };
        if (this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => {
            if (this.dom.promptDisplay) {
                this.dom.promptDisplay.select();
                navigator.clipboard.writeText(this.dom.promptDisplay.value).then(() => alert("Prompt Copied!"));
            }
        };
        if (this.dom.generatePromptBtn) this.dom.generatePromptBtn.onclick = () => {
            this.generatePrompt();
            if (this.dom.promptDisplay) {
                this.dom.promptDisplay.style.opacity = '0.5';
                setTimeout(() => this.dom.promptDisplay.style.opacity = '1', 150);
            }
        };

        if (this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => { if (navigator.share) { navigator.share({ title: "Follow Me", url: window.location.href }); } else { alert("Share not supported"); } };

        if (this.dom.chatShareBtn) this.dom.chatShareBtn.onclick = () => { window.location.href = `sms:?body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
        if (this.dom.emailShareBtn) this.dom.emailShareBtn.onclick = () => { window.location.href = `mailto:?subject=Follow%20Me%20App&body=Check%20out%20Follow%20Me:%20${window.location.href}`; };

        if (this.dom.btnCashMain) this.dom.btnCashMain.onclick = () => { window.open('https://cash.app/$jwo83', '_blank'); };
        if (this.dom.btnPaypalMain) this.dom.btnPaypalMain.onclick = () => { window.open('https://www.paypal.me/Oyster981', '_blank'); };

        document.querySelectorAll('.donate-quick-btn').forEach(btn => {
            btn.onclick = () => {
                const app = btn.dataset.app;
                const amt = btn.dataset.amount;
                if (app === 'cash') window.open(`https://cash.app/$jwo83/${amt}`, '_blank');
                if (app === 'paypal') window.open(`https://www.paypal.me/Oyster981/${amt}`, '_blank');
            };
        });

        if (this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => { if (confirm("Factory Reset?")) this.callbacks.onReset(); };
        if (this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
        if (this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };
    }
    populateConfigDropdown() { const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { const o = document.createElement('option'); o.value = id; o.textContent = this.appSettings.profiles[id].name; return o; }); if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; } if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; } }
    populateThemeDropdown() { const s = this.dom.themeSelect; if (!s) return; s.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); }); s.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Themes"; Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); }); s.appendChild(grp2); s.value = this.appSettings.activeTheme; }
    openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.updateUIFromSettings(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); }
    openSetup() {
        this.populateConfigDropdown();
        this.updateUIFromSettings();
        this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90');
    }
    closeSetup() { this.callbacks.onSave(); this.dom.setupModal.classList.add('opacity-0'); this.dom.setupModal.querySelector('div').classList.add('scale-90'); setTimeout(() => this.dom.setupModal.classList.add('pointer-events-none'), 300); }

    generatePrompt() {
        if (!this.dom.promptDisplay) return;

        const ps = this.appSettings.runtimeSettings;
        const max = ps.currentInput === 'key12' ? 12 : 9;
        const speed = this.appSettings.playbackSpeed || 1.0;
        const machines = ps.machineCount || 1;
        const chunk = ps.simonChunkSize || 3;
        const delay = (ps.simonInterSequenceDelay / 1000) || 0;
        
        let instructions = "";
        
        if (machines > 1) {
            instructions = `MODE: MULTI-MACHINE AUTOPLAY (${machines} Machines).
            
            YOUR JOB:
            1. I will speak a batch of ${machines} numbers at once.
            2. You must immediately SORT them:
               - 1st number -> Machine 1
               - 2nd number -> Machine 2
               - 3rd number -> Machine 3 (if active), etc.
            3. IMMEDIATELY after hearing the numbers, you must READ BACK the sequences for all machines.
            
            READBACK RULES (Interleaved Chunking):
            - Recite the history in chunks of ${chunk}.
            - Order: Machine 1 (Chunk 1) -> Machine 2 (Chunk 1) -> ... -> Machine 1 (Chunk 2) -> Machine 2 (Chunk 2)...
            - Do not stop between machines. Flow through the list.
            - Pause ${delay} seconds between machine switches.`;
        } else {
            if (ps.currentMode === 'simon') {
                instructions = `MODE: SIMON SAYS (Single Machine).
                - The sequence grows by one number each round.
                - I will speak the NEW number.
                - You must add it to the list and READ BACK the ENTIRE list from the start.`;
            } else {
                instructions = `MODE: UNIQUE (Random/Non-Repeating).
                - Every round is a fresh random sequence.
                - I will speak a number. You simply repeat that number to confirm.
                - Keep a running list. If I say "Review", read the whole list.`;
            }
        }

        const promptText = `Act as a professional Sequence Caller for a memory skill game. 
You are the "Caller" (App). I am the "Player" (User).

SETTINGS:
- Max Number: ${max}
- Playback Speed: ${speed}x (Speak fast)
- Active Machines: ${machines}
- Chunk Size: ${chunk}

${instructions}

YOUR RULES:
1. Speak clearly but quickly. No fluff. No conversational filler.
2. If I get it wrong, correct me immediately.
3. If I say "Status", tell me the current round/sequence length.

START IMMEDIATELY upon my next input. Waiting for signal.`;

        this.dom.promptDisplay.value = promptText;
    }

    updateUIFromSettings() {
        const ps = this.appSettings.runtimeSettings;
        if (this.dom.input) this.dom.input.value = ps.currentInput;

        if (this.dom.mode) this.dom.mode.value = ps.currentMode;

        if (this.dom.machines) this.dom.machines.value = ps.machineCount;
        if (this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;
        if (this.dom.autoClear) this.dom.autoClear.checked = this.appSettings.isUniqueRoundsAutoClearEnabled;

        if (this.dom.autoplay) this.dom.autoplay.checked = this.appSettings.isAutoplayEnabled;
        if (this.dom.audio) this.dom.audio.checked = this.appSettings.isAudioEnabled;

        if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled;
        if (this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
        if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        if (this.dom.showWelcome) this.dom.showWelcome.checked = this.appSettings.showWelcomeScreen;

        if (this.dom.hapticMorse) this.dom.hapticMorse.checked = this.appSettings.isHapticMorseEnabled;
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = this.appSettings.playbackSpeed.toFixed(1) || "1.0";
        if (this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize;
        if (this.dom.delay) this.dom.delay.value = (ps.simonInterSequenceDelay / 1000);

        // Voice Update
        if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.voicePitch || 1.0;
        if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.voiceRate || 1.0;
        if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.voiceVolume || 1.0;
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';

        if (this.dom.practiceMode) this.dom.practiceMode.checked = this.appSettings.isPracticeModeEnabled;
        if (this.dom.stealth1KeyToggle) this.dom.stealth1KeyToggle.checked = this.appSettings.isStealth1KeyEnabled;

        if (this.dom.longPressToggle) this.dom.longPressToggle.checked = (typeof this.appSettings.isLongPressAutoplayEnabled === 'undefined') ? true : this.appSettings.isLongPressAutoplayEnabled;

        if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.value = this.appSettings.sensorAudioThresh || -85;
        if (this.dom.calibCamSlider) this.dom.calibCamSlider.value = this.appSettings.sensorCamThresh || 30;

        if (this.dom.haptics) this.dom.haptics.checked = (typeof this.appSettings.isHapticsEnabled === 'undefined') ? true : this.appSettings.isHapticsEnabled;
        if (this.dom.speedDelete) this.dom.speedDelete.checked = (typeof this.appSettings.isSpeedDeletingEnabled === 'undefined') ? true : this.appSettings.isSpeedDeletingEnabled;

        if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
        if (this.dom.seqSize) this.dom.seqSize.value = Math.round(this.appSettings.uiScaleMultiplier * 100) || 100;
        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
        
        if (this.dom.blackoutToggle) this.dom.blackoutToggle.checked = this.appSettings.isBlackoutFeatureEnabled;
        if (this.dom.blackoutGesturesToggle) this.dom.blackoutGesturesToggle.checked = this.appSettings.isBlackoutGesturesEnabled;

        // Language
        const lang = this.appSettings.generalLanguage || 'en';
        if (this.dom.quickLang) this.dom.quickLang.value = lang;
        if (this.dom.generalLang) this.dom.generalLang.value = lang;
        this.setLanguage(lang);
    }
    hexToHsl(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
    hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length === 1) r = "0" + r; if (g.length === 1) g = "0" + g; if (b.length === 1) b = "0" + b; return "#" + r + g + b; }
}
    populateVoicePresetDropdown() {
        if (!this.dom.voicePresetSelect) return;
        this.dom.voicePresetSelect.innerHTML = '';

        const grp1 = document.createElement('optgroup');
        grp1.label = "Built-in";
        Object.keys(PREMADE_VOICE_PRESETS).forEach(k => {
            const el = document.createElement('option');
            el.value = k;
            el.textContent = PREMADE_VOICE_PRESETS[k].name;
            grp1.appendChild(el);
        });
        this.dom.voicePresetSelect.appendChild(grp1);

        const grp2 = document.createElement('optgroup');
        grp2.label = "My Voices";
        if (this.appSettings.voicePresets) {
            Object.keys(this.appSettings.voicePresets).forEach(k => {
                const el = document.createElement('option');
                el.value = k;
                el.textContent = this.appSettings.voicePresets[k].name;
                grp2.appendChild(el);
            });
        }
        this.dom.voicePresetSelect.appendChild(grp2);

        this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
    }

    applyVoicePreset(id) {
        let preset = this.appSettings.voicePresets[id] || PREMADE_VOICE_PRESETS[id] || PREMADE_VOICE_PRESETS['standard'];
        this.appSettings.voicePitch = preset.pitch;
        this.appSettings.voiceRate = preset.rate;
        this.appSettings.voiceVolume = preset.volume;
        this.updateUIFromSettings();
        this.callbacks.onSave();
    }

    buildColorGrid() { if (!this.dom.editorGrid) return; this.dom.editorGrid.innerHTML = ''; CRAYONS.forEach(color => { const btn = document.createElement('div'); btn.style.backgroundColor = color; btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm"; btn.onclick = () => this.applyColorToTarget(color); this.dom.editorGrid.appendChild(btn); }); }
    applyColorToTarget(hex) { if (!this.tempTheme) return; this.tempTheme[this.currentTargetKey] = hex; const [h, s, l] = this.hexToHsl(hex); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = hex; if (this.dom.ftContainer.classList.contains('hidden')) { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; } this.updatePreview(); }
    updateColorFromSliders() { const h = parseInt(this.dom.ftHue.value); const s = parseInt(this.dom.ftSat.value); const l = parseInt(this.dom.ftLit.value); const hex = this.hslToHex(h, s, l); this.dom.ftPreview.style.backgroundColor = hex; if (this.tempTheme) { this.tempTheme[this.currentTargetKey] = hex; this.updatePreview(); } }
    openThemeEditor() { if (!this.dom.editorModal) return; const activeId = this.appSettings.activeTheme; const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default']; this.tempTheme = { ...source }; this.dom.edName.value = this.tempTheme.name; this.dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app')); this.dom.targetBtns[2].classList.add('active', 'bg-primary-app'); this.currentTargetKey = 'bubble'; const [h, s, l] = this.hexToHsl(this.tempTheme.bubble); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme.bubble; this.updatePreview(); this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.remove('scale-90'); }
    updatePreview() { const t = this.tempTheme; if (!this.dom.edPreview) return; this.dom.edPreview.style.backgroundColor = t.bgMain; this.dom.edPreview.style.color = t.text; this.dom.edPreviewCard.style.backgroundColor = t.bgCard; this.dom.edPreviewCard.style.color = t.text; this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)'; this.dom.edPreviewBtn.style.backgroundColor = t.bubble; this.dom.edPreviewBtn.style.color = t.text; }
    testVoice() { if (window.speechSynthesis) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance("Testing 1 2 3."); if (this.appSettings.selectedVoice) { const v = window.speechSynthesis.getVoices().find(voice => voice.name === this.appSettings.selectedVoice); if (v) u.voice = v; } let p = parseFloat(this.dom.voicePitch.value); let r = parseFloat(this.dom.voiceRate.value); let v = parseFloat(this.dom.voiceVolume.value); u.pitch = p; u.rate = r; u.volume = v; window.speechSynthesis.speak(u); } }
    
    setLanguage(lang) {
        const t = LANG[lang];
        if (!t) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
        
        // Persist
        this.appSettings.generalLanguage = lang;
        if (this.dom.quickLang) this.dom.quickLang.value = lang;
        if (this.dom.generalLang) this.dom.generalLang.value = lang;
        this.callbacks.onSave();
    }

    openShare() { if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); if (this.dom.shareModal) { this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); setTimeout(() => this.dom.shareModal.querySelector('.share-sheet').classList.add('active'), 10); } }
    closeShare() { if (this.dom.shareModal) { this.dom.shareModal.querySelector('.share-sheet').classList.remove('active'); setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300); } }
    openCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'auto'; this.sensorEngine.toggleAudio(true); this.sensorEngine.toggleCamera(true); this.sensorEngine.setCalibrationCallback((data) => { if (this.dom.calibAudioBar) { const pct = ((data.audio - (-100)) / ((-30) - (-100))) * 100; this.dom.calibAudioBar.style.width = `${Math.max(0, Math.min(100, pct))}%`; } if (this.dom.calibCamBar) { const pct = Math.min(100, data.camera); this.dom.calibCamBar.style.width = `${pct}%`; } }); } }
    closeCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'none'; this.sensorEngine.setCalibrationCallback(null); this.sensorEngine.toggleAudio(this.appSettings.isAudioEnabled); this.sensorEngine.toggleCamera(this.appSettings.autoInputMode === 'cam' || this.appSettings.autoInputMode === 'both'); } }

    toggleRedeem(show) {
        if (show) {
            if (this.dom.redeemModal) {
                this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.redeemModal.style.pointerEvents = 'auto';
            }
        } else {
            if (this.dom.redeemModal) {
                this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.redeemModal.style.pointerEvents = 'none';
            }
        }
    }

    toggleDonate(show) {
        if (show) {
            if (this.dom.donateModal) {
                this.dom.donateModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.donateModal.style.pointerEvents = 'auto';
            }
        } else {
            if (this.dom.donateModal) {
                this.dom.donateModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.donateModal.style.pointerEvents = 'none';
            }
        }
    }

    initListeners() {
        this.dom.targetBtns.forEach(btn => { btn.onclick = () => { this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); }); btn.classList.add('active', 'bg-primary-app'); btn.classList.remove('opacity-60'); this.currentTargetKey = btn.dataset.target; if (this.tempTheme) { const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme[this.currentTargetKey]; } }; });
        [this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => { sl.oninput = () => this.updateColorFromSliders(); });
        this.dom.ftToggle.onclick = () => { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; };
        if (this.dom.edSave) this.dom.edSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onSave(); this.callbacks.onUpdate(); this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.add('scale-90'); this.populateThemeDropdown(); } };
        if (this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
        if (this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };

        // Voice Controls
        if (this.dom.voiceTestBtn) this.dom.voiceTestBtn.onclick = () => this.testVoice();
        const updateVoiceLive = () => {
            this.appSettings.voicePitch = parseFloat(this.dom.voicePitch.value);
            this.appSettings.voiceRate = parseFloat(this.dom.voiceRate.value);
            this.appSettings.voiceVolume = parseFloat(this.dom.voiceVolume.value);
        };
        if (this.dom.voicePitch) this.dom.voicePitch.oninput = updateVoiceLive;
        if (this.dom.voiceRate) this.dom.voiceRate.oninput = updateVoiceLive;
        if (this.dom.voiceVolume) this.dom.voiceVolume.oninput = updateVoiceLive;

        // Voice Preset Management
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.onchange = (e) => {
            this.appSettings.activeVoicePresetId = e.target.value;
            this.applyVoicePreset(e.target.value);
        };
        if (this.dom.voicePresetAdd) this.dom.voicePresetAdd.onclick = () => {
            const n = prompt("New Voice Preset Name:");
            if (n) {
                const id = 'vp_' + Date.now();
                this.appSettings.voicePresets[id] = {
                    name: n,
                    pitch: this.appSettings.voicePitch,
                    rate: this.appSettings.voiceRate,
                    volume: this.appSettings.voiceVolume
                };
                this.appSettings.activeVoicePresetId = id;
                this.populateVoicePresetDropdown();
                this.callbacks.onSave();
            }
        };
        if (this.dom.voicePresetSave) this.dom.voicePresetSave.onclick = () => {
            const id = this.appSettings.activeVoicePresetId;
            if (PREMADE_VOICE_PRESETS[id]) {
                alert("Cannot save over built-in presets. Create a new one.");
                return;
            }
            if (this.appSettings.voicePresets[id]) {
                this.appSettings.voicePresets[id] = {
                    ...this.appSettings.voicePresets[id],
                    pitch: parseFloat(this.dom.voicePitch.value),
                    rate: parseFloat(this.dom.voiceRate.value),
                    volume: parseFloat(this.dom.voiceVolume.value)
                };
                this.callbacks.onSave();
                alert("Voice Preset Saved!");
            }
        };
        if (this.dom.voicePresetDelete) this.dom.voicePresetDelete.onclick = () => {
            const id = this.appSettings.activeVoicePresetId;
            if (PREMADE_VOICE_PRESETS[id]) { alert("Cannot delete built-in."); return; }
            if (confirm("Delete this voice preset?")) {
                delete this.appSettings.voicePresets[id];
                this.appSettings.activeVoicePresetId = 'standard';
                this.populateVoicePresetDropdown();
                this.applyVoicePreset('standard');
            }
        };
        if (this.dom.voicePresetRename) this.dom.voicePresetRename.onclick = () => {
            const id = this.appSettings.activeVoicePresetId;
            if (PREMADE_VOICE_PRESETS[id]) return alert("Cannot rename built-in.");
            const n = prompt("Rename:", this.appSettings.voicePresets[id].name);
            if (n) {
                this.appSettings.voicePresets[id].name = n;
                this.populateVoicePresetDropdown();
                this.callbacks.onSave();
            }
        };

        if (this.dom.quickLang) this.dom.quickLang.onchange = (e) => this.setLanguage(e.target.value);
        if (this.dom.generalLang) this.dom.generalLang.onchange = (e) => this.setLanguage(e.target.value);
        const handleProfileSwitch = (val) => { this.callbacks.onProfileSwitch(val); this.openSettings(); };
        if (this.dom.configSelect) this.dom.configSelect.onchange = (e) => handleProfileSwitch(e.target.value);
        if (this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => handleProfileSwitch(e.target.value);

        const bind = (el, prop, isGlobal, isInt = false, isFloat = false) => {
            if (!el) return;
            el.onchange = () => {
                let val = (el.type === 'checkbox') ? el.checked : el.value;
                if (isInt) val = parseInt(val);
                if (isFloat) val = parseFloat(val);
                if (isGlobal) {
                    this.appSettings[prop] = val;
                    if (prop === 'activeTheme') this.callbacks.onUpdate();
                    if (prop === 'isPracticeModeEnabled') this.callbacks.onUpdate();
                } else {
                    this.appSettings.runtimeSettings[prop] = val;
                }
                this.callbacks.onSave();
                this.generatePrompt();
            };
        };

        bind(this.dom.input, 'currentInput', false); bind(this.dom.machines, 'machineCount', false, true); bind(this.dom.seqLength, 'sequenceLength', false, true); bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
        bind(this.dom.longPressToggle, 'isLongPressAutoplayEnabled', true);

        if (this.dom.mode) {
            this.dom.mode.onchange = () => {
                this.appSettings.runtimeSettings.currentMode = this.dom.mode.value;
                this.callbacks.onSave();
                this.callbacks.onUpdate('mode_switch');
                this.generatePrompt();
            };
        }

        if (this.dom.input) this.dom.input.addEventListener('change', () => this.generatePrompt());
        if (this.dom.machines) this.dom.machines.addEventListener('change', () => this.generatePrompt());
        if (this.dom.seqLength) this.dom.seqLength.addEventListener('change', () => this.generatePrompt());
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.addEventListener('change', () => this.generatePrompt());
        if (this.dom.delay) this.dom.delay.addEventListener('change', () => this.generatePrompt());
        if (this.dom.chunk) this.dom.chunk.addEventListener('change', () => this.generatePrompt());

        if (this.dom.autoplay) {
            this.dom.autoplay.onchange = (e) => {
                this.appSettings.isAutoplayEnabled = e.target.checked;
                if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.audio) {
            this.dom.audio.onchange = (e) => {
                this.appSettings.isAudioEnabled = e.target.checked;
                if (this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.quickAutoplay) {
            this.dom.quickAutoplay.onchange = (e) => {
                this.appSettings.isAutoplayEnabled = e.target.checked;
                if (this.dom.autoplay) this.dom.autoplay.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.quickAudio) {
            this.dom.quickAudio.onchange = (e) => {
                this.appSettings.isAudioEnabled = e.target.checked;
                if (this.dom.audio) this.dom.audio.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.dontShowWelcome) {
            this.dom.dontShowWelcome.onchange = (e) => {
                this.appSettings.showWelcomeScreen = !e.target.checked;
                if (this.dom.showWelcome) this.dom.showWelcome.checked = !e.target.checked;
                this.callbacks.onSave();
            }
        }
        if (this.dom.showWelcome) {
            this.dom.showWelcome.onchange = (e) => {
                this.appSettings.showWelcomeScreen = e.target.checked;
                if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !e.target.checked;
                this.callbacks.onSave();
            }
        }

        // --- NEW BINDINGS FOR STEALTH TAB ---
        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', true);
        bind(this.dom.blackoutGesturesToggle, 'isBlackoutGesturesEnabled', true);
        bind(this.dom.stealth1KeyToggle, 'isStealth1KeyEnabled', true); // Remapped inputs-only toggle
        // ------------------------------------

        if (this.dom.playbackSpeed) this.dom.playbackSpeed.onchange = (e) => { this.appSettings.playbackSpeed = parseFloat(e.target.value); this.callbacks.onSave(); this.generatePrompt(); };
        bind(this.dom.chunk, 'simonChunkSize', false, true);
        if (this.dom.delay) this.dom.delay.onchange = (e) => { this.appSettings.runtimeSettings.simonInterSequenceDelay = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
        bind(this.dom.haptics, 'isHapticsEnabled', true); bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true); 
        bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
        if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); this.callbacks.onUpdate(); };
        if (this.dom.seqSize) this.dom.seqSize.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
        if (this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => { this.appSettings.gestureResizeMode = e.target.value; this.callbacks.onSave(); };
        if (this.dom.autoInput) this.dom.autoInput.onchange = (e) => { const val = e.target.value; this.appSettings.autoInputMode = val; this.appSettings.showMicBtn = (val === 'mic' || val === 'both'); this.appSettings.showCamBtn = (val === 'cam' || val === 'both'); this.callbacks.onSave(); this.callbacks.onUpdate(); };
        if (this.dom.themeAdd) this.dom.themeAdd.onclick = () => { const n = prompt("Name:"); if (n) { const id = 'c_' + Date.now(); this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'], name: n }; this.appSettings.activeTheme = id; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); this.openThemeEditor(); } };
        if (this.dom.themeRename) this.dom.themeRename.onclick = () => { const id = this.appSettings.activeTheme; if (PREMADE_THEMES[id]) return alert("Cannot rename built-in."); const n = prompt("Rename:", this.appSettings.customThemes[id].name); if (n) { this.appSettings.customThemes[id].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); } };
        if (this.dom.themeDelete) this.dom.themeDelete.onclick = () => { if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in."); if (confirm("Delete?")) { delete this.appSettings.customThemes[this.appSettings.activeTheme]; this.appSettings.activeTheme = 'default'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); } };
        if (this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); this.populateThemeDropdown(); };
        if (this.dom.configAdd) this.dom.configAdd.onclick = () => { const n = prompt("Profile Name:"); if (n) this.callbacks.onProfileAdd(n); this.openSettings(); };
        if (this.dom.configRename) this.dom.configRename.onclick = () => { const n = prompt("Rename:"); if (n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
        if (this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
        if (this.dom.configSave) this.dom.configSave.onclick = () => { this.callbacks.onProfileSave(); };
        if (this.dom.themeSave) this.dom.themeSave.onclick = () => {
            if (this.tempTheme) {
                const activeId = this.appSettings.activeTheme;
                if (PREMADE_THEMES[activeId]) {
                    const newId = 'custom_' + Date.now();
                    this.appSettings.customThemes[newId] = this.tempTheme;
                    this.appSettings.activeTheme = newId;
                } else {
                    this.appSettings.customThemes[activeId] = this.tempTheme;
                }
                this.callbacks.onProfileSave();
                this.callbacks.onUpdate();
                this.populateThemeDropdown();
                alert("Theme Saved!");
            }
        };
        if (this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if (this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        if (this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.generatePrompt(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
        if (this.dom.closeHelpBtnBottom) this.dom.closeHelpBtnBottom.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
        if (this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => { this.generatePrompt(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
        if (this.dom.openCalibBtn) this.dom.openCalibBtn.onclick = () => this.openCalibration();
        if (this.dom.closeCalibBtn) this.dom.closeCalibBtn.onclick = () => this.closeCalibration();
        if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.oninput = () => { const val = parseInt(this.dom.calibAudioSlider.value); this.appSettings.sensorAudioThresh = val; this.sensorEngine.setSensitivity('audio', val); const pct = ((val - (-100)) / ((-30) - (-100))) * 100; this.dom.calibAudioMarker.style.left = `${pct}%`; this.dom.calibAudioVal.innerText = val + 'dB'; this.callbacks.onSave(); };
        if (this.dom.calibCamSlider) this.dom.calibCamSlider.oninput = () => { const val = parseInt(this.dom.calibCamSlider.value); this.appSettings.sensorCamThresh = val; this.sensorEngine.setSensitivity('camera', val); const pct = Math.min(100, val); this.dom.calibCamMarker.style.left = `${pct}%`; this.dom.calibCamVal.innerText = val; this.callbacks.onSave(); };

        this.dom.tabs.forEach(btn => {
            btn.onclick = () => {
                const parent = btn.parentElement.parentElement;
                parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.tab;
                if (target === 'help-voice') this.generatePrompt();
                
                // Handle generated DOM elements if using stealth tab
                const targetEl = document.getElementById(`tab-${target}`);
                if(targetEl) targetEl.classList.add('active');
            }
        });

        if (this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
        if (this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.closeShare();
        if (this.dom.openRedeemBtn) this.dom.openRedeemBtn.onclick = () => this.toggleRedeem(true);
        if (this.dom.closeRedeemBtn) this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);

        if (this.dom.openRedeemSettingsBtn) this.dom.openRedeemSettingsBtn.onclick = () => this.toggleRedeem(true);
        if (this.dom.openDonateBtn) this.dom.openDonateBtn.onclick = () => this.toggleDonate(true);
        if (this.dom.closeDonateBtn) this.dom.closeDonateBtn.onclick = () => this.toggleDonate(false);

        if (this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick = () => { navigator.clipboard.writeText(window.location.href).then(() => alert("Link Copied!")); };
        if (this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => {
            if (this.dom.promptDisplay) {
                this.dom.promptDisplay.select();
                navigator.clipboard.writeText(this.dom.promptDisplay.value).then(() => alert("Prompt Copied!"));
            }
        };
        if (this.dom.generatePromptBtn) this.dom.generatePromptBtn.onclick = () => {
            this.generatePrompt();
            if (this.dom.promptDisplay) {
                this.dom.promptDisplay.style.opacity = '0.5';
                setTimeout(() => this.dom.promptDisplay.style.opacity = '1', 150);
            }
        };

        if (this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => { if (navigator.share) { navigator.share({ title: "Follow Me", url: window.location.href }); } else { alert("Share not supported"); } };

        if (this.dom.chatShareBtn) this.dom.chatShareBtn.onclick = () => { window.location.href = `sms:?body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
        if (this.dom.emailShareBtn) this.dom.emailShareBtn.onclick = () => { window.location.href = `mailto:?subject=Follow%20Me%20App&body=Check%20out%20Follow%20Me:%20${window.location.href}`; };

        if (this.dom.btnCashMain) this.dom.btnCashMain.onclick = () => { window.open('https://cash.app/$jwo83', '_blank'); };
        if (this.dom.btnPaypalMain) this.dom.btnPaypalMain.onclick = () => { window.open('https://www.paypal.me/Oyster981', '_blank'); };

        document.querySelectorAll('.donate-quick-btn').forEach(btn => {
            btn.onclick = () => {
                const app = btn.dataset.app;
                const amt = btn.dataset.amount;
                if (app === 'cash') window.open(`https://cash.app/$jwo83/${amt}`, '_blank');
                if (app === 'paypal') window.open(`https://www.paypal.me/Oyster981/${amt}`, '_blank');
            };
        });

        if (this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => { if (confirm("Factory Reset?")) this.callbacks.onReset(); };
        if (this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
        if (this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };
    }
    populateConfigDropdown() { const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { const o = document.createElement('option'); o.value = id; o.textContent = this.appSettings.profiles[id].name; return o; }); if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; } if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; } }
    populateThemeDropdown() { const s = this.dom.themeSelect; if (!s) return; s.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); }); s.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Themes"; Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); }); s.appendChild(grp2); s.value = this.appSettings.activeTheme; }
    openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.updateUIFromSettings(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); }
    openSetup() {
        this.populateConfigDropdown();
        this.updateUIFromSettings();
        this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90');
    }
    closeSetup() { this.callbacks.onSave(); this.dom.setupModal.classList.add('opacity-0'); this.dom.setupModal.querySelector('div').classList.add('scale-90'); setTimeout(() => this.dom.setupModal.classList.add('pointer-events-none'), 300); }

    generatePrompt() {
        if (!this.dom.promptDisplay) return;

        const ps = this.appSettings.runtimeSettings;
        const max = ps.currentInput === 'key12' ? 12 : 9;
        const speed = this.appSettings.playbackSpeed || 1.0;
        const machines = ps.machineCount || 1;
        const chunk = ps.simonChunkSize || 3;
        const delay = (ps.simonInterSequenceDelay / 1000) || 0;
        
        let instructions = "";
        
        if (machines > 1) {
            instructions = `MODE: MULTI-MACHINE AUTOPLAY (${machines} Machines).
            
            YOUR JOB:
            1. I will speak a batch of ${machines} numbers at once.
            2. You must immediately SORT them:
               - 1st number -> Machine 1
               - 2nd number -> Machine 2
               - 3rd number -> Machine 3 (if active), etc.
            3. IMMEDIATELY after hearing the numbers, you must READ BACK the sequences for all machines.
            
            READBACK RULES (Interleaved Chunking):
            - Recite the history in chunks of ${chunk}.
            - Order: Machine 1 (Chunk 1) -> Machine 2 (Chunk 1) -> ... -> Machine 1 (Chunk 2) -> Machine 2 (Chunk 2)...
            - Do not stop between machines. Flow through the list.
            - Pause ${delay} seconds between machine switches.`;
        } else {
            if (ps.currentMode === 'simon') {
                instructions = `MODE: SIMON SAYS (Single Machine).
                - The sequence grows by one number each round.
                - I will speak the NEW number.
                - You must add it to the list and READ BACK the ENTIRE list from the start.`;
            } else {
                instructions = `MODE: UNIQUE (Random/Non-Repeating).
                - Every round is a fresh random sequence.
                - I will speak a number. You simply repeat that number to confirm.
                - Keep a running list. If I say "Review", read the whole list.`;
            }
        }

        const promptText = `Act as a professional Sequence Caller for a memory skill game. 
You are the "Caller" (App). I am the "Player" (User).

SETTINGS:
- Max Number: ${max}
- Playback Speed: ${speed}x (Speak fast)
- Active Machines: ${machines}
- Chunk Size: ${chunk}

${instructions}

YOUR RULES:
1. Speak clearly but quickly. No fluff. No conversational filler.
2. If I get it wrong, correct me immediately.
3. If I say "Status", tell me the current round/sequence length.

START IMMEDIATELY upon my next input. Waiting for signal.`;

        this.dom.promptDisplay.value = promptText;
    }

    updateUIFromSettings() {
        const ps = this.appSettings.runtimeSettings;
        if (this.dom.input) this.dom.input.value = ps.currentInput;

        if (this.dom.mode) this.dom.mode.value = ps.currentMode;

        if (this.dom.machines) this.dom.machines.value = ps.machineCount;
        if (this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;
        if (this.dom.autoClear) this.dom.autoClear.checked = this.appSettings.isUniqueRoundsAutoClearEnabled;

        if (this.dom.autoplay) this.dom.autoplay.checked = this.appSettings.isAutoplayEnabled;
        if (this.dom.audio) this.dom.audio.checked = this.appSettings.isAudioEnabled;

        if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled;
        if (this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
        if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        if (this.dom.showWelcome) this.dom.showWelcome.checked = this.appSettings.showWelcomeScreen;

        if (this.dom.hapticMorse) this.dom.hapticMorse.checked = this.appSettings.isHapticMorseEnabled;
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = this.appSettings.playbackSpeed.toFixed(1) || "1.0";
        if (this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize;
        if (this.dom.delay) this.dom.delay.value = (ps.simonInterSequenceDelay / 1000);

        // Voice Update
        if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.voicePitch || 1.0;
        if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.voiceRate || 1.0;
        if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.voiceVolume || 1.0;
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';

        if (this.dom.practiceMode) this.dom.practiceMode.checked = this.appSettings.isPracticeModeEnabled;
        if (this.dom.stealth1KeyToggle) this.dom.stealth1KeyToggle.checked = this.appSettings.isStealth1KeyEnabled;

        if (this.dom.longPressToggle) this.dom.longPressToggle.checked = (typeof this.appSettings.isLongPressAutoplayEnabled === 'undefined') ? true : this.appSettings.isLongPressAutoplayEnabled;

        if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.value = this.appSettings.sensorAudioThresh || -85;
        if (this.dom.calibCamSlider) this.dom.calibCamSlider.value = this.appSettings.sensorCamThresh || 30;

        if (this.dom.haptics) this.dom.haptics.checked = (typeof this.appSettings.isHapticsEnabled === 'undefined') ? true : this.appSettings.isHapticsEnabled;
        if (this.dom.speedDelete) this.dom.speedDelete.checked = (typeof this.appSettings.isSpeedDeletingEnabled === 'undefined') ? true : this.appSettings.isSpeedDeletingEnabled;

        if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
        if (this.dom.seqSize) this.dom.seqSize.value = Math.round(this.appSettings.uiScaleMultiplier * 100) || 100;
        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
        
        if (this.dom.blackoutToggle) this.dom.blackoutToggle.checked = this.appSettings.isBlackoutFeatureEnabled;
        if (this.dom.blackoutGesturesToggle) this.dom.blackoutGesturesToggle.checked = this.appSettings.isBlackoutGesturesEnabled;

        // Language
        const lang = this.appSettings.generalLanguage || 'en';
        if (this.dom.quickLang) this.dom.quickLang.value = lang;
        if (this.dom.generalLang) this.dom.generalLang.value = lang;
        this.setLanguage(lang);
    }
    hexToHsl(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
    hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length === 1) r = "0" + r; if (g.length === 1) g = "0" + g; if (b.length === 1) b = "0" + b; return "#" + r + g + b; }
}
