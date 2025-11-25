import { PREMADE_THEMES } from './app.js';

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
            // ... (Other inputs assumed present)
        };
        
        this.initListeners();
        this.populateThemeDropdown();
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

    initListeners() {
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
        
        // Profile Dropdown logic omitted for brevity but should exist exactly as before...
        if(this.dom.configSelect) this.dom.configSelect.onchange = (e) => { this.callbacks.onProfileSwitch(e.target.value); this.populateThemeDropdown(); };
    }
}
