// settings.js

// --- MOVED THEMES HERE TO FIX CRASH ---
export const PREMADE_THEMES = {
    'default': { name: "Default Dark", p1: "#4f46e5", p2: "#4338ca", s1: "#1f2937", s2: "#374151" },
    'light':   { name: "Light Mode",   p1: "#4f46e5", p2: "#4338ca", s1: "#f3f4f6", s2: "#ffffff" },
    'ocean':   { name: "Ocean Blue",   p1: "#0ea5e9", p2: "#0284c7", s1: "#0f172a", s2: "#1e293b" },
    'matrix':  { name: "The Matrix",   p1: "#003b00", p2: "#005500", s1: "#000000", s2: "#0a0a0a" },
    'cyber':   { name: "Cyberpunk",    p1: "#d946ef", p2: "#c026d3", s1: "#0f0b1e", s2: "#1a1625" },
    'volcano': { name: "Volcano",      p1: "#b91c1c", p2: "#991b1b", s1: "#2b0a0a", s2: "#450a0a" },
    'forest':  { name: "Deep Forest",  p1: "#166534", p2: "#14532d", s1: "#052e16", s2: "#064e3b" },
};

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings;
        this.callbacks = callbacks;
        this.sensorEngine = sensorEngine;
        
        this.dom = {
            settingsModal: document.getElementById('settings-modal'),
            
            // Theme UI
            themeSelect: document.getElementById('theme-select'),
            themeAdd: document.getElementById('theme-add'),
            themeRename: document.getElementById('theme-rename'),
            themeDelete: document.getElementById('theme-delete'),
            openThemeEditorBtn: document.getElementById('open-theme-editor'),

            // Theme Editor Modal
            themeEditorModal: document.getElementById('theme-editor-modal'),
            editorName: document.getElementById('theme-name-input'),
            editorP1: document.getElementById('color-p1'), editorP2: document.getElementById('color-p2'),
            editorS1: document.getElementById('color-s1'), editorS2: document.getElementById('color-s2'),
            hexP1: document.getElementById('hex-p1'), hexP2: document.getElementById('hex-p2'),
            hexS1: document.getElementById('hex-s1'), hexS2: document.getElementById('hex-s2'),
            editorPreview: document.getElementById('theme-preview-box'),
            editorPreviewBtn: document.getElementById('preview-btn'),
            editorPreviewCard: document.querySelector('#theme-preview-box div:last-child'),
            editorSaveBtn: document.getElementById('save-theme-btn'),
            editorCancelBtn: document.getElementById('cancel-theme-btn'),

            // Calibration Modal
            calibModal: document.getElementById('calibration-modal'),
            openCalibBtn: document.getElementById('open-calibration-btn'),
            closeCalibBtn: document.getElementById('close-calibration-btn'),
            calibAudioSlider: document.getElementById('calib-audio-slider'),
            calibAudioBar: document.getElementById('calib-audio-bar'),
            calibAudioMarker: document.getElementById('calib-audio-marker'),
            calibAudioVal: document.getElementById('audio-val-display'),
            calibCamSlider: document.getElementById('calib-cam-slider'),
            calibCamBar: document.getElementById('calib-cam-bar'),
            calibCamMarker: document.getElementById('calib-cam-marker'),
            calibCamVal: document.getElementById('cam-val-display'),

            // Tabs & General
            closeSettingsBtn: document.getElementById('close-settings'),
            tabs: document.querySelectorAll('.tab-btn'),
            contents: document.querySelectorAll('.tab-content'),
            configSelect: document.getElementById('config-select'),
            configAdd: document.getElementById('config-add'),
            configRename: document.getElementById('config-rename'),
            configDelete: document.getElementById('config-delete'),
            
            // Quick Start
            setupModal: document.getElementById('game-setup-modal'),
            closeSetupBtn: document.getElementById('close-game-setup-modal'),
            quickConfigSelect: document.getElementById('quick-config-select'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'),
            quickAudio: document.getElementById('quick-audio-toggle'),
            quickHelp: document.getElementById('quick-open-help'),
            quickSettings: document.getElementById('quick-open-settings'),
            dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickResizeUp: document.getElementById('quick-resize-up'),
            quickResizeDown: document.getElementById('quick-resize-down'),

            // Help & Share
            helpModal: document.getElementById('help-modal'),
            closeHelpBtn: document.getElementById('close-help'),
            openHelpBtn: document.getElementById('open-help-button'),
            shareModal: document.getElementById('share-modal'),
            openShareInside: document.getElementById('open-share-button'),
            closeShareBtn: document.getElementById('close-share'),
            nativeShareBtn: document.getElementById('native-share-button'),
            copyLinkBtn: document.getElementById('copy-link-button'),
            
            // Misc
            promptDisplay: document.getElementById('prompt-display'),
            copyPromptBtn: document.getElementById('copy-prompt-btn'),
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
            
            // Auto Input Select
            autoInput: document.getElementById('auto-input-select'),
            
            // Settings Fields
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
            theme: document.getElementById('theme-select'), // kept for reference
            uiScale: document.getElementById('ui-scale-select'),
            gestureMode: document.getElementById('gesture-mode-select'),
        };
        
        this.initListeners();
        this.populateConfigDropdown(); // Ensure profile dropdown is populated on load
    }

    populateThemeDropdown() {
        const s = this.dom.themeSelect;
        if (!s) return;
        s.innerHTML = '';
        
        const grp1 = document.createElement('optgroup'); grp1.label = "Built-in";
        Object.keys(PREMADE_THEMES).forEach(k => {
            const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name;
            grp1.appendChild(el);
        });
        s.appendChild(grp1);

        const grp2 = document.createElement('optgroup'); grp2.label = "My Themes";
        Object.keys(this.appSettings.customThemes).forEach(k => {
            const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name;
            grp2.appendChild(el);
        });
        s.appendChild(grp2);

        s.value = this.appSettings.activeTheme;
        
        const isCustom = !!this.appSettings.customThemes[this.appSettings.activeTheme];
        if(this.dom.themeRename) this.dom.themeRename.disabled = !isCustom;
        if(this.dom.themeDelete) this.dom.themeDelete.disabled = !isCustom;
        if(this.dom.openThemeEditorBtn) {
            this.dom.openThemeEditorBtn.disabled = !isCustom;
            this.dom.openThemeEditorBtn.style.opacity = isCustom ? '1' : '0.3';
        }
    }
    
    populateConfigDropdown() {
        const createOptions = () => Object.keys(this.appSettings.profiles).map(id => {
            const option = document.createElement('option');
            option.value = id; option.textContent = this.appSettings.profiles[id].name;
            return option;
        });

        if (this.dom.configSelect) {
            this.dom.configSelect.innerHTML = '';
            createOptions().forEach(opt => this.dom.configSelect.appendChild(opt));
            this.dom.configSelect.value = this.appSettings.activeProfileId;
        }
        if (this.dom.quickConfigSelect) {
            this.dom.quickConfigSelect.innerHTML = '';
            createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt));
            this.dom.quickConfigSelect.value = this.appSettings.activeProfileId;
        }
    }

    openSettings() {
        this.populateConfigDropdown();
        this.populateThemeDropdown();
        
        const ps = this.appSettings.runtimeSettings;
        const gs = this.appSettings;

        if(this.dom.input) this.dom.input.value = ps.currentInput;
        if(this.dom.mode) this.dom.mode.value = (ps.currentMode === 'unique_rounds') ? 'unique' : 'simon';
        if(this.dom.machines) this.dom.machines.value = ps.machineCount;
        if(this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;
        if(this.dom.autoClear) this.dom.autoClear.checked = gs.isUniqueRoundsAutoClearEnabled;
        if(this.dom.autoplay) this.dom.autoplay.checked = gs.isAutoplayEnabled;
        if(this.dom.audio) this.dom.audio.checked = gs.isAudioEnabled;
        if(this.dom.hapticMorse) this.dom.hapticMorse.checked = gs.isHapticMorseEnabled;
        if(this.dom.playbackSpeed) this.dom.playbackSpeed.value = gs.playbackSpeed.toFixed(1);
        if(this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize;
        if(this.dom.delay) this.dom.delay.value = ps.simonInterSequenceDelay;
        if(this.dom.haptics) this.dom.haptics.checked = gs.isHapticsEnabled;
        if(this.dom.speedDelete) this.dom.speedDelete.checked = gs.isSpeedDeletingEnabled;
        if(this.dom.showWelcome) this.dom.showWelcome.checked = gs.showWelcomeScreen;
        if(this.dom.blackoutToggle) this.dom.blackoutToggle.checked = gs.isBlackoutFeatureEnabled;
        if(this.dom.uiScale) this.dom.uiScale.value = Math.round(gs.uiScaleMultiplier * 100);
        if(this.dom.gestureMode) this.dom.gestureMode.value = (gs.gestureResizeMode === 'sequence') ? 'sequence' : 'global';
        if(this.dom.autoInput) this.dom.autoInput.value = gs.autoInputMode;

        this.generatePrompt();
        this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.settingsModal.querySelector('div').classList.remove('scale-90');
    }

    openSetup() {
        this.populateConfigDropdown();
        if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled;
        if(this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
        if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        if(this.dom.setupModal) {
            this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none');
            this.dom.setupModal.querySelector('div').classList.remove('scale-90');
        }
    }
    
    closeSetup() {
        if(this.dom.quickAutoplay) this.appSettings.isAutoplayEnabled = this.dom.quickAutoplay.checked;
        if(this.dom.quickAudio) this.appSettings.isAudioEnabled = this.dom.quickAudio.checked;
        if(this.dom.dontShowWelcome) this.appSettings.showWelcomeScreen = !this.dom.dontShowWelcome.checked;
        this.callbacks.onSave(); this.callbacks.onUpdate();
        if(this.dom.setupModal) {
            this.dom.setupModal.classList.add('opacity-0');
            this.dom.setupModal.querySelector('div').classList.add('scale-90');
            setTimeout(() => this.dom.setupModal.classList.add('pointer-events-none'), 300);
        }
    }

    openThemeEditor() {
        if(!this.dom.themeEditorModal) return;
        const themeData = this.appSettings.customThemes[this.appSettings.activeTheme] || PREMADE_THEMES[this.appSettings.activeTheme] || PREMADE_THEMES['default'];
        
        this.dom.editorName.value = themeData.name;
        this.dom.editorP1.value = themeData.p1; this.dom.editorP2.value = themeData.p2;
        this.dom.editorS1.value = themeData.s1; this.dom.editorS2.value = themeData.s2;
        
        this.updatePreview();
        this.dom.themeEditorModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.themeEditorModal.querySelector('div').classList.remove('scale-90');
    }

    updatePreview() {
        const s1 = this.dom.editorS1.value;
        const box = this.dom.editorPreview;
        this.dom.hexP1.innerText = this.dom.editorP1.value; this.dom.hexP2.innerText = this.dom.editorP2.value;
        this.dom.hexS1.innerText = this.dom.editorS1.value; this.dom.hexS2.innerText = this.dom.editorS2.value;

        box.style.backgroundColor = s1;
        const isDark = parseInt(s1.replace('#',''), 16) < 0xffffff / 2;
        box.style.color = isDark ? '#fff' : '#000';
        
        this.dom.editorPreviewBtn.style.backgroundColor = this.dom.editorP1.value;
        this.dom.editorPreviewCard.style.backgroundColor = this.dom.editorS2.value;
        this.dom.editorPreviewCard.style.color = isDark ? '#fff' : '#000';
    }

    openCalibration() {
        if(!this.dom.calibModal || !this.sensorEngine) return;
        this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none');

        const aThresh = this.appSettings.sensorAudioThresh || -85;
        const cThresh = this.appSettings.sensorCamThresh || 30;
        this.dom.calibAudioSlider.value = aThresh;
        this.dom.calibCamSlider.value = cThresh;
        this.updateCalibVisuals();

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
        this.dom.calibModal.querySelector('div').classList.add('scale-90');
        this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
    }

    updateCalibVisuals() {
        const aVal = parseInt(this.dom.calibAudioSlider.value);
        const aPct = ((aVal - (-100)) / ((-30) - (-100))) * 100;
        if(this.dom.calibAudioMarker) this.dom.calibAudioMarker.style.left = `${aPct}%`;
        if(this.dom.calibAudioVal) this.dom.calibAudioVal.innerText = `${aVal}dB`;

        const cVal = parseInt(this.dom.calibCamSlider.value);
        const cPct = Math.min(100, cVal);
        if(this.dom.calibCamMarker) this.dom.calibCamMarker.style.left = `${cPct}%`;
        if(this.dom.calibCamVal) this.dom.calibCamVal.innerText = cVal;
    }
    
    generatePrompt() {
        if(!this.dom.promptDisplay) return;
        const ps = this.appSettings.runtimeSettings;
        let logic = (ps.currentMode === 'unique_rounds') ? `Game: Unique Rounds. Sequence length ${ps.sequenceLength}. New random sequence every round.` : `Game: Simon Says. Accumulate pattern. Max ${ps.sequenceLength}.`;
        let reading = (ps.machineCount > 1 || ps.simonChunkSize > 0) ? `Read in chunks of ${ps.simonChunkSize}. Pause ${(ps.simonInterSequenceDelay/1000)}s between. Machines: ${ps.machineCount}.` : "";
        this.dom.promptDisplay.value = `You are the Game Engine.\n${logic}\n${reading}\nStart Round 1.`;
    }

    initListeners() {
        // --- Helper to Bind Inputs ---
        const bind = (el, prop, isGlobal, isInt=false, isFloat=false) => {
            if(!el) return;
            el.onchange = () => {
                let val = (el.type === 'checkbox') ? el.checked : el.value;
                if(isInt) val = parseInt(val);
                if(isFloat) val = parseFloat(val);
                if(isGlobal) {
                    this.appSettings[prop] = val;
                    if(prop === 'activeTheme') this.callbacks.onUpdate();
                } else {
                    this.appSettings.runtimeSettings[prop] = val;
                }
                this.callbacks.onSave();
                this.generatePrompt();
            };
        };

        // Standard Bindings
        bind(this.dom.input, 'currentInput', false);
        bind(this.dom.machines, 'machineCount', false, true);
        bind(this.dom.seqLength, 'sequenceLength', false, true);
        bind(this.dom.autoplay, 'isAutoplayEnabled', true);
        bind(this.dom.audio, 'isAudioEnabled', true);
        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        bind(this.dom.playbackSpeed, 'playbackSpeed', true, false, true);
        bind(this.dom.chunk, 'simonChunkSize', false, true);
        bind(this.dom.delay, 'simonInterSequenceDelay', false, true);
        bind(this.dom.haptics, 'isHapticsEnabled', true);
        bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true);
        bind(this.dom.showWelcome, 'showWelcomeScreen', true);
        bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', true);
        
        if(this.dom.blackoutToggle) {
            this.dom.blackoutToggle.addEventListener('change', (e) => {
                if (e.target.checked && typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    DeviceMotionEvent.requestPermission()
                        .then(response => {
                            if (response !== 'granted') {
                                alert("Motion permission required.");
                                e.target.checked = false; 
                                this.appSettings.isBlackoutFeatureEnabled = false;
                                this.callbacks.onSave();
                            }
                        }).catch(console.error);
                }
            });
        }
        
        if(this.dom.uiScale) this.dom.uiScale.onchange = (e) => {
            this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0;
            this.callbacks.onUpdate();
        };

        if(this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => {
            this.appSettings.gestureResizeMode = e.target.value;
            this.callbacks.onSave();
        };

        if(this.dom.autoInput) this.dom.autoInput.onchange = (e) => {
            const val = e.target.value;
            this.appSettings.autoInputMode = val;
            this.appSettings.showMicBtn = (val === 'mic' || val === 'both');
            this.appSettings.showCamBtn = (val === 'cam' || val === 'both');
            this.callbacks.onSave(); this.callbacks.onUpdate();
        };
        
        if(this.dom.mode) this.dom.mode.onchange = (e) => {
             this.appSettings.runtimeSettings.currentMode = (e.target.value === 'unique') ? 'unique_rounds' : 'simon';
             this.callbacks.onSave(); this.callbacks.onUpdate(); this.generatePrompt();
        };

        // Theme UI
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
            const id = this.appSettings.activeTheme;
            if(!this.appSettings.customThemes[id]) return;
            const n = prompt("Rename Theme:", this.appSettings.customThemes[id].name);
            if(n) { this.appSettings.customThemes[id].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); }
        };

        if(this.dom.themeDelete) this.dom.themeDelete.onclick = () => {
            const id = this.appSettings.activeTheme;
            if(!this.appSettings.customThemes[id]) return;
            if(confirm("Delete this theme?")) {
                delete this.appSettings.customThemes[id];
                this.appSettings.activeTheme = 'default';
                this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown();
            }
        };

        if(this.dom.openThemeEditorBtn) this.dom.openThemeEditorBtn.onclick = () => this.openThemeEditor();
        if(this.dom.editorCancelBtn) this.dom.editorCancelBtn.onclick = () => { this.dom.themeEditorModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.themeEditorModal.querySelector('div').classList.add('scale-90'); };
        
        if(this.dom.editorSaveBtn) this.dom.editorSaveBtn.onclick = () => {
            const id = this.appSettings.activeTheme;
            if(this.appSettings.customThemes[id]) {
                this.appSettings.customThemes[id].p1 = this.dom.editorP1.value;
                this.appSettings.customThemes[id].p2 = this.dom.editorP2.value;
                this.appSettings.customThemes[id].s1 = this.dom.editorS1.value;
                this.appSettings.customThemes[id].s2 = this.dom.editorS2.value;
                this.callbacks.onSave(); this.callbacks.onUpdate();
                this.dom.themeEditorModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.themeEditorModal.querySelector('div').classList.add('scale-90');
            }
        };

        ['editorP1','editorP2','editorS1','editorS2'].forEach(k => { if(this.dom[k]) this.dom[k].addEventListener('input', () => this.updatePreview()); });

        // Calibration UI
        if(this.dom.openCalibBtn) this.dom.openCalibBtn.onclick = () => this.openCalibration();
        if(this.dom.closeCalibBtn) this.dom.closeCalibBtn.onclick = () => this.closeCalibration();
        if(this.dom.calibAudioSlider) this.dom.calibAudioSlider.oninput = () => this.updateCalibVisuals();
        if(this.dom.calibCamSlider) this.dom.calibCamSlider.oninput = () => this.updateCalibVisuals();

        // Standard
        this.dom.tabs.forEach(btn => btn.onclick = () => {
            this.dom.tabs.forEach(b => b.classList.remove('active'));
            this.dom.contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
        
        if(this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
        
        // Setup Modal Buttons
        if(this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if(this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        if(this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
        if(this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none');
        
        // Share
        if(this.dom.openShareInside) this.dom.openShareInside.onclick = () => { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if(this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none');
        
        if(this.dom.configSelect) this.dom.configSelect.onchange = (e) => { this.callbacks.onProfileSwitch(e.target.value); this.populateThemeDropdown(); };
        if(this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => { this.callbacks.onProfileSwitch(e.target.value); };
        if(this.dom.configAdd) this.dom.configAdd.onclick = () => { const n=prompt("Profile Name:"); if(n) this.callbacks.onProfileAdd(n); this.openSettings(); };
        if(this.dom.configRename) this.dom.configRename.onclick = () => { const n=prompt("Rename:"); if(n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
        if(this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
        if(this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => { if(confirm("Factory Reset?")) this.callbacks.onReset(); };
        
        if(this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(150, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
        if(this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };
    }
}
