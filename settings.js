// 5-COLOR PREMADE THEMES
export const PREMADE_THEMES = {
    'default': { name: "Default Dark", bgMain: "#1f2937", bgCard: "#374151", bubble: "#4f46e5", btn: "#374151", text: "#ffffff" },
    'light':   { name: "Light Mode",   bgMain: "#f3f4f6", bgCard: "#ffffff", bubble: "#4f46e5", btn: "#e5e7eb", text: "#111827" },
    'ocean':   { name: "Ocean Blue",   bgMain: "#0f172a", bgCard: "#1e293b", bubble: "#0ea5e9", btn: "#334155", text: "#e2e8f0" },
    'matrix':  { name: "The Matrix",   bgMain: "#000000", bgCard: "#0a0a0a", bubble: "#00ff41", btn: "#002200", text: "#00ff41" },
    'cyber':   { name: "Cyberpunk",    bgMain: "#0f0b1e", bgCard: "#1a1625", bubble: "#d946ef", btn: "#2d1b4e", text: "#f0abfc" },
    'volcano': { name: "Volcano",      bgMain: "#2b0a0a", bgCard: "#450a0a", bubble: "#b91c1c", btn: "#7f1d1d", text: "#fecaca" },
    'forest':  { name: "Deep Forest",  bgMain: "#052e16", bgCard: "#064e3b", bubble: "#166534", btn: "#14532d", text: "#dcfce7" },
    'sunset':  { name: "Sunset",       bgMain: "#4a044e", bgCard: "#701a75", bubble: "#fb923c", btn: "#86198f", text: "#fff7ed" }
};

// 64 Basic Colors
const SWATCHES = [
    "#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#ffffff",
    "#1f2937", "#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6",
    "#7f1d1d", "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fef2f2",
    "#7c2d12", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fff7ed",
    "#713f12", "#a16207", "#ca8a04", "#eab308", "#facc15", "#fde047", "#fef08a", "#fefce8",
    "#14532d", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7",
    "#0c4a6e", "#0369a1", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe",
    "#4c1d95", "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"
];

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings;
        this.callbacks = callbacks;
        this.sensorEngine = sensorEngine;
        this.currentTargetKey = 'bubble';
        
        this.dom = {
            editorGrid: document.getElementById('color-grid'),
            fineTunePicker: document.getElementById('fine-tune-picker'),
            targetBtns: document.querySelectorAll('.target-btn'),
            edName: document.getElementById('theme-name-input'),
            edPreview: document.getElementById('theme-preview-box'),
            edPreviewBtn: document.getElementById('preview-btn'),
            edPreviewCard: document.getElementById('preview-card'),
            editorModal: document.getElementById('theme-editor-modal'),
            openEditorBtn: document.getElementById('open-theme-editor'),
            edSave: document.getElementById('save-theme-btn'),
            edCancel: document.getElementById('cancel-theme-btn'),
            settingsModal: document.getElementById('settings-modal'),
            themeSelect: document.getElementById('theme-select'),
            themeAdd: document.getElementById('theme-add'),
            themeRename: document.getElementById('theme-rename'),
            themeDelete: document.getElementById('theme-delete'),
            configSelect: document.getElementById('config-select'),
            quickConfigSelect: document.getElementById('quick-config-select'),
            configAdd: document.getElementById('config-add'),
            configRename: document.getElementById('config-rename'),
            configDelete: document.getElementById('config-delete'),
            calibModal: document.getElementById('calibration-modal'),
            openCalibBtn: document.getElementById('open-calibration-btn'),
            closeCalibBtn: document.getElementById('close-calibration-btn'),
            calibAudioSlider: document.getElementById('calib-audio-slider'),
            calibCamSlider: document.getElementById('calib-cam-slider'),
            calibAudioBar: document.getElementById('calib-audio-bar'),
            calibCamBar: document.getElementById('calib-cam-bar'),
            calibAudioMarker: document.getElementById('calib-audio-marker'),
            calibCamMarker: document.getElementById('calib-cam-marker'),
            calibAudioVal: document.getElementById('audio-val-display'),
            calibCamVal: document.getElementById('cam-val-display'),
            closeSettingsBtn: document.getElementById('close-settings'),
            tabs: document.querySelectorAll('.tab-btn'),
            contents: document.querySelectorAll('.tab-content'),
            input: document.getElementById('input-select'),
            mode: document.getElementById('mode-select'),
            machines: document.getElementById('machines-select'),
            seqLength: document.getElementById('seq-length-select'),
            autoClear: document.getElementById('autoclear-toggle'),
            autoplay: document.getElementById('autoplay-toggle'),
            audio: document.getElementById('audio-toggle'),
            hapticMorse: document.getElementById('haptic-morse-toggle'),
            playbackSpeed: document.getElementById('playback-speed-select'),
            chunk: document.getElementById('chunk-select'),
            delay: document.getElementById('delay-select'),
            haptics: document.getElementById('haptics-toggle'),
            speedDelete: document.getElementById('speed-delete-toggle'),
            showWelcome: document.getElementById('show-welcome-toggle'),
            blackoutToggle: document.getElementById('blackout-toggle'),
            uiScale: document.getElementById('ui-scale-select'),
            gestureMode: document.getElementById('gesture-mode-select'),
            autoInput: document.getElementById('auto-input-select'),
            helpModal: document.getElementById('help-modal'),
            setupModal: document.getElementById('game-setup-modal'),
            shareModal: document.getElementById('share-modal'),
            closeSetupBtn: document.getElementById('close-game-setup-modal'),
            quickSettings: document.getElementById('quick-open-settings'),
            quickHelp: document.getElementById('quick-open-help'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'),
            quickAudio: document.getElementById('quick-audio-toggle'),
            dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickResizeUp: document.getElementById('quick-resize-up'),
            quickResizeDown: document.getElementById('quick-resize-down'),
            openShareInside: document.getElementById('open-share-button'),
            closeShareBtn: document.getElementById('close-share'),
            closeHelpBtn: document.getElementById('close-help'),
            openHelpBtn: document.getElementById('open-help-button'),
            promptDisplay: document.getElementById('prompt-display'),
            copyPromptBtn: document.getElementById('copy-prompt-btn'),
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
        };
        
        this.tempTheme = null; 
        this.initListeners();
        this.populateConfigDropdown();
        this.populateThemeDropdown();
        this.buildColorGrid();
    }

    buildColorGrid() {
        if(!this.dom.editorGrid) return;
        this.dom.editorGrid.innerHTML = '';
        SWATCHES.forEach(color => {
            const btn = document.createElement('div');
            btn.style.backgroundColor = color;
            btn.className = "w-full h-8 rounded cursor-pointer border border-gray-600 hover:scale-110 transition-transform shadow-sm";
            btn.onclick = () => this.applyColor(color);
            this.dom.editorGrid.appendChild(btn);
        });
    }

    applyColor(color) {
        if(!this.tempTheme) return;
        this.tempTheme[this.currentTargetKey] = color;
        this.dom.fineTunePicker.value = color;
        this.updatePreview();
    }

    openThemeEditor() {
        if(!this.dom.editorModal) return;
        const activeId = this.appSettings.activeTheme;
        const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default'];
        this.tempTheme = { ...source }; 
        this.dom.edName.value = this.tempTheme.name;
        
        // Pre-fill fine tune picker
        this.dom.fineTunePicker.value = this.tempTheme[this.currentTargetKey];
        
        this.updatePreview();
        this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.editorModal.querySelector('div').classList.remove('scale-90');
    }

    updatePreview() {
        const t = this.tempTheme;
        if(!this.dom.edPreview) return;
        this.dom.edPreview.style.backgroundColor = t.bgMain;
        this.dom.edPreview.style.color = t.text;
        this.dom.edPreviewCard.style.backgroundColor = t.bgCard;
        this.dom.edPreviewCard.style.color = t.text;
        this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)';
        this.dom.edPreviewBtn.style.backgroundColor = t.bubble;
        this.dom.edPreviewBtn.style.color = t.text;
    }

    openCalibration() {
        if(!this.dom.calibModal || !this.sensorEngine) return;
        this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none');

        this.wasAudioOn = this.sensorEngine.mode.audio;
        this.wasCamOn = this.sensorEngine.mode.camera;
        
        if(!document.getElementById('hidden-video')) {
            const v = document.createElement('video'); v.id = 'hidden-video'; v.autoplay = true; v.muted = true; v.playsInline = true; v.style.display='none';
            const c = document.createElement('canvas'); c.id = 'hidden-canvas'; c.style.display='none';
            document.body.append(v, c);
            this.sensorEngine.setupDOM(v, c);
        }

        this.sensorEngine.toggleAudio(true);
        this.sensorEngine.toggleCamera(true);

        this.sensorEngine.setCalibrationCallback((data) => {
            const aMin = -100, aMax = -30;
            let aPct = Math.max(0, Math.min(100, ((data.audio - aMin) / (aMax - aMin)) * 100));
            if(this.dom.calibAudioBar) this.dom.calibAudioBar.style.width = `${aPct}%`;
            
            let cPct = Math.max(0, Math.min(100, data.camera)); 
            if(this.dom.calibCamBar) this.dom.calibCamBar.style.width = `${cPct}%`;
        });

        this.dom.calibAudioSlider.value = this.appSettings.sensorAudioThresh || -85;
        this.dom.calibCamSlider.value = this.appSettings.sensorCamThresh || 30;

        this.dom.calibModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.calibModal.querySelector('div').classList.remove('scale-90');
    }

    closeCalibration() {
        if(!this.dom.calibModal) return;
        this.appSettings.sensorAudioThresh = parseInt(this.dom.calibAudioSlider.value);
        this.appSettings.sensorCamThresh = parseInt(this.dom.calibCamSlider.value);
        this.callbacks.onSave();
        
        this.sensorEngine.setSensitivity('audio', this.appSettings.sensorAudioThresh);
        this.sensorEngine.setSensitivity('camera', this.appSettings.sensorCamThresh);
        this.sensorEngine.setCalibrationCallback(null);
        
        this.sensorEngine.toggleAudio(this.wasAudioOn);
        this.sensorEngine.toggleCamera(this.wasCamOn);

        this.dom.calibModal.classList.add('opacity-0', 'pointer-events-none');
        this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
    }

    populateConfigDropdown() {
        if(!this.appSettings.profiles) return;
        const createOptions = () => Object.keys(this.appSettings.profiles).map(id => {
            const option = document.createElement('option'); option.value = id; 
            option.textContent = this.appSettings.profiles[id].name; return option;
        });
        if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; }
        if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; }
    }

    populateThemeDropdown() {
        const s = this.dom.themeSelect; if (!s) return; s.innerHTML = '';
        const grp1 = document.createElement('optgroup'); grp1.label = "Built-in";
        Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); });
        s.appendChild(grp1);
        const grp2 = document.createElement('optgroup'); grp2.label = "My Themes";
        Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); });
        s.appendChild(grp2);
        s.value = this.appSettings.activeTheme;
        
        // UNLOCKED: Buttons always active
        if(this.dom.themeRename) this.dom.themeRename.disabled = false; 
        if(this.dom.themeDelete) this.dom.themeDelete.disabled = false; 
        if(this.dom.openEditorBtn) { this.dom.openEditorBtn.disabled = false; this.dom.openEditorBtn.style.opacity = '1'; }
    }

    initListeners() {
        this.dom.targetBtns.forEach(btn => {
            btn.onclick = () => {
                this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); });
                btn.classList.add('active', 'bg-primary-app'); btn.classList.remove('opacity-60');
                this.currentTargetKey = btn.dataset.target;
                if(this.tempTheme) this.dom.fineTunePicker.value = this.tempTheme[this.currentTargetKey];
            };
        });

        if(this.dom.fineTunePicker) this.dom.fineTunePicker.oninput = (e) => this.applyColor(e.target.value);

        if(this.dom.edSave) this.dom.edSave.onclick = () => {
            if(this.tempTheme) {
                // If overwriting premade, generate new ID or just save to custom
                if(PREMADE_THEMES[this.appSettings.activeTheme]) {
                    const newId = 'custom_' + Date.now();
                    this.appSettings.customThemes[newId] = this.tempTheme;
                    this.appSettings.activeTheme = newId;
                } else {
                    this.appSettings.customThemes[this.appSettings.activeTheme] = this.tempTheme;
                }
                this.callbacks.onSave(); this.callbacks.onUpdate();
                this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.editorModal.querySelector('div').classList.add('scale-90');
            }
        };

        if(this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
        if(this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };

        if(this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); this.populateThemeDropdown(); };
        if(this.dom.themeAdd) this.dom.themeAdd.onclick = () => {
            const n = prompt("New Theme Name:");
            if(n) {
                const current = this.appSettings.customThemes[this.appSettings.activeTheme] || PREMADE_THEMES[this.appSettings.activeTheme] || PREMADE_THEMES['default'];
                const id = 'custom_' + Date.now();
                this.appSettings.customThemes[id] = { ...current, name: n };
                this.appSettings.activeTheme = id;
                this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown();
                this.openThemeEditor();
            }
        };
        
        if(this.dom.themeRename) this.dom.themeRename.onclick = () => {
            // Clone if premade
            if(PREMADE_THEMES[this.appSettings.activeTheme]) {
               alert("Create a new theme from this preset to rename it.");
               return;
            }
            const n = prompt("Rename:", this.appSettings.customThemes[this.appSettings.activeTheme].name);
            if(n) { this.appSettings.customThemes[this.appSettings.activeTheme].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); }
        };

        if(this.dom.themeDelete) this.dom.themeDelete.onclick = () => {
            if(PREMADE_THEMES[this.appSettings.activeTheme]) { alert("Cannot delete built-in themes."); return; }
            if(confirm("Delete Theme?")) {
                delete this.appSettings.customThemes[this.appSettings.activeTheme];
                this.appSettings.activeTheme = 'default';
                this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown();
            }
        };

        if(this.dom.configSelect) this.dom.configSelect.onchange = (e) => { this.callbacks.onProfileSwitch(e.target.value); this.openSettings(); };
        if(this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => { this.callbacks.onProfileSwitch(e.target.value); };
        if(this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); this.generatePrompt(); };
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
        
        const bind = (el, prop, isGlobal, isInt=false, isFloat=false) => {
            if(!el) return;
            el.onchange = () => {
                let val = (el.type === 'checkbox') ? el.checked : el.value;
                if(isInt) val = parseInt(val); if(isFloat) val = parseFloat(val);
                if(isGlobal) { this.appSettings[prop] = val; if(prop === 'activeTheme') this.callbacks.onUpdate(); } else { this.appSettings.runtimeSettings[prop] = val; }
                this.callbacks.onSave(); this.generatePrompt();
            };
        };
        bind(this.dom.input, 'currentInput', false);
        bind(this.dom.mode, 'currentMode', false);
        bind(this.dom.machines, 'machineCount', false, true);
        bind(this.dom.seqLength, 'sequenceLength', false, true);
        bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
        bind(this.dom.autoplay, 'isAutoplayEnabled', true);
        bind(this.dom.audio, 'isAudioEnabled', true);
        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        bind(this.dom.playbackSpeed, 'playbackSpeed', true, false, true);
        bind(this.dom.chunk, 'simonChunkSize', false, true);
        bind(this.dom.delay, 'simonInterSequenceDelay', false, true);
        bind(this.dom.haptics, 'isHapticsEnabled', true);
        bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true);
        bind(this.dom.showWelcome, 'showWelcomeScreen', true);
        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', true);
        if(this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
        if(this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => { this.appSettings.gestureResizeMode = e.target.value; this.callbacks.onSave(); };
        if(this.dom.autoInput) this.dom.autoInput.onchange = (e) => { const val = e.target.value; this.appSettings.autoInputMode = val; this.appSettings.showMicBtn = (val === 'mic' || val === 'both'); this.appSettings.showCamBtn = (val === 'cam' || val === 'both'); this.callbacks.onSave(); this.callbacks.onUpdate(); };
        if(this.dom.mode) this.dom.mode.onchange = (e) => { this.appSettings.runtimeSettings.currentMode = (e.target.value === 'unique') ? 'unique_rounds' : 'simon'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.generatePrompt(); };
        
        if(this.dom.configAdd) this.dom.configAdd.onclick = () => { const n=prompt("Profile Name:"); if(n) this.callbacks.onProfileAdd(n); this.openSettings(); };
        if(this.dom.configRename) this.dom.configRename.onclick = () => { const n=prompt("Rename:"); if(n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
        if(this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
        
        if(this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if(this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        if(this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(150, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
        if(this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };
        
        if(this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => { this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); this.generatePrompt(); };
        if(this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => { navigator.clipboard.writeText(this.dom.promptDisplay.value); this.dom.copyPromptBtn.innerText = "Copied!"; };
        
        if(this.dom.openShareInside) this.dom.openShareInside.onclick = () => { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if(this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none');
        if(this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => { if(confirm("Factory Reset?")) this.callbacks.onReset(); };
        
        // Calibration
        if(this.dom.openCalibBtn) this.dom.openCalibBtn.onclick = () => this.openCalibration();
        if(this.dom.closeCalibBtn) this.dom.closeCalibBtn.onclick = () => this.closeCalibration();
        
        this.dom.tabs.forEach(btn => btn.onclick = () => { this.dom.tabs.forEach(b => b.classList.remove('active')); this.dom.contents.forEach(c => c.classList.remove('active')); btn.classList.add('active'); document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active'); });
        if(this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
    }

    openSetup() { this.populateConfigDropdown(); if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled; if(this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled; if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen; if(this.dom.setupModal) { this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90'); } }
    closeSetup() { if(this.dom.quickAutoplay) this.appSettings.isAutoplayEnabled = this.dom.quickAutoplay.checked; if(this.dom.quickAudio) this.appSettings.isAudioEnabled = this.dom.quickAudio.checked; if(this.dom.dontShowWelcome) this.appSettings.showWelcomeScreen = !this.dom.dontShowWelcome.checked; this.callbacks.onSave(); this.callbacks.onUpdate(); if(this.dom.setupModal) { this.dom.setupModal.classList.add('opacity-0'); this.dom.setupModal.querySelector('div').classList.add('scale-90'); setTimeout(() => this.dom.setupModal.classList.add('pointer-events-none'), 300); } }
    openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); const ps = this.appSettings.runtimeSettings; const gs = this.appSettings; if(this.dom.input) this.dom.input.value = ps.currentInput; if(this.dom.mode) this.dom.mode.value = (ps.currentMode === 'unique_rounds') ? 'unique' : 'simon'; if(this.dom.machines) this.dom.machines.value = ps.machineCount; if(this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength; if(this.dom.autoClear) this.dom.autoClear.checked = gs.isUniqueRoundsAutoClearEnabled; if(this.dom.autoplay) this.dom.autoplay.checked = gs.isAutoplayEnabled; if(this.dom.audio) this.dom.audio.checked = gs.isAudioEnabled; if(this.dom.hapticMorse) this.dom.hapticMorse.checked = gs.isHapticMorseEnabled; if(this.dom.playbackSpeed) this.dom.playbackSpeed.value = gs.playbackSpeed.toFixed(1); if(this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize; if(this.dom.delay) this.dom.delay.value = ps.simonInterSequenceDelay; if(this.dom.haptics) this.dom.haptics.checked = gs.isHapticsEnabled; if(this.dom.speedDelete) this.dom.speedDelete.checked = gs.isSpeedDeletingEnabled; if(this.dom.showWelcome) this.dom.showWelcome.checked = gs.showWelcomeScreen; if(this.dom.blackoutToggle) this.dom.blackoutToggle.checked = gs.isBlackoutFeatureEnabled; if(this.dom.uiScale) this.dom.uiScale.value = Math.round(gs.uiScaleMultiplier * 100); if(this.dom.gestureMode) this.dom.gestureMode.value = (gs.gestureResizeMode === 'sequence') ? 'sequence' : 'global'; if(this.dom.autoInput) this.dom.autoInput.value = gs.autoInputMode; this.generatePrompt(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); }
    generatePrompt() { if(!this.dom.promptDisplay) return; const ps = this.appSettings.runtimeSettings; const modeText = ps.currentMode === 'unique_rounds' ? 'Unique Rounds' : 'Simon Says (Accumulating)'; const isKey12 = ps.currentInput === 'key12'; const chunkSize = ps.simonChunkSize || 3; const txt = `Act as the "Follow Me" Game Engine. We are playing by voice only. Rules: 1. Digits: 1 to ${isKey12 ? 12 : 9}. 2. Mode: ${modeText}. 3. Speaking: Read digits clearly with a 1-second pause between chunks of ${chunkSize}. 4. Turn: Read the sequence, then wait for my voice response. 5. Validation: If I match exactly, say "Correct" and move to Round 1. If I fail, say "Game Over" and read the correct sequence. Start Round 1 now.`; this.dom.promptDisplay.value = txt; }
}
