import { 
    PREMADE_THEMES, PREMADE_VOICE_PRESETS, HAND_GESTURES_LIST, 
    GESTURE_PRESETS, CRAYONS, LANG 
} from './constants.js';
import { renderUI, updateAllChrome } from './ui.js';

/**
 * SettingsManager: The central controller for the Settings and Editor UIs.
 */
export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings; 
        this.callbacks = callbacks; 
        this.sensorEngine = sensorEngine; 
        this.currentTargetKey = 'bubble';
        this.tempTheme = null;

        this.initDomCache();
        this.initListeners(); 
        
        // Initial populations
        this.populateConfigDropdown(); 
        this.populateThemeDropdown(); 
        this.buildColorGrid(); 
        this.populateVoicePresetDropdown();
        this.populatePlaybackSpeedDropdown();
        this.populateUIScaleDropdown(); 
        this.populateMappingUI();
        this.populateMorseUI();
        
        if(this.dom.gestureToggle) {
            this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
        }
    }

    initDomCache() {
        this.dom = {
            editorModal: document.getElementById('theme-editor-modal'), 
            editorGrid: document.getElementById('color-grid'),
            ftContainer: document.getElementById('fine-tune-container'), 
            ftToggle: document.getElementById('toggle-fine-tune'), 
            ftPreview: document.getElementById('fine-tune-preview'), 
            ftHue: document.getElementById('ft-hue'), 
            ftSat: document.getElementById('ft-sat'), 
            ftLit: document.getElementById('ft-lit'),
            targetBtns: document.querySelectorAll('.target-btn'), 
            edName: document.getElementById('theme-name-input'), 
            edPreview: document.getElementById('theme-preview-box'), 
            edPreviewBtn: document.getElementById('preview-btn'), 
            edPreviewCard: document.getElementById('preview-card'), 
            edSave: document.getElementById('save-theme-btn'), 
            edCancel: document.getElementById('cancel-theme-btn'),
            openEditorBtn: document.getElementById('open-theme-editor'),
            voicePresetSelect: document.getElementById('voice-preset-select'),
            voicePresetAdd: document.getElementById('voice-preset-add'),
            voicePresetSave: document.getElementById('voice-preset-save'),
            voicePresetRename: document.getElementById('voice-preset-rename'),
            voicePresetDelete: document.getElementById('voice-preset-delete'),
            voicePitch: document.getElementById('voice-pitch'), 
            voiceRate: document.getElementById('voice-rate'), 
            voiceVolume: document.getElementById('voice-volume'), 
            voiceTestBtn: document.getElementById('test-voice-btn'),
            settingsModal: document.getElementById('settings-modal'), 
            themeSelect: document.getElementById('theme-select'), 
            themeAdd: document.getElementById('theme-add'), 
            themeRename: document.getElementById('theme-rename'), 
            themeDelete: document.getElementById('theme-delete'), 
            themeSave: document.getElementById('theme-save'),
            configSelect: document.getElementById('config-select'), 
            quickConfigSelect: document.getElementById('quick-config-select'), 
            configAdd: document.getElementById('config-add'), 
            configRename: document.getElementById('config-rename'), 
            configDelete: document.getElementById('config-delete'), 
            configSave: document.getElementById('config-save'),
            input: document.getElementById('input-select'), 
            mode: document.getElementById('mode-select'), 
            practiceMode: document.getElementById('practice-mode-toggle'), 
            machines: document.getElementById('machines-select'), 
            seqLength: document.getElementById('seq-length-select'),
            autoClear: document.getElementById('autoclear-toggle'), 
            autoplay: document.getElementById('autoplay-toggle'), 
            flash: document.getElementById('flash-toggle'),
            pause: document.getElementById('pause-select'), 
            audio: document.getElementById('audio-toggle'), 
            hapticMorse: document.getElementById('haptic-morse-toggle'), 
            playbackSpeed: document.getElementById('playback-speed-select'), 
            chunk: document.getElementById('chunk-select'), 
            delay: document.getElementById('delay-select'), 
            haptics: document.getElementById('haptics-toggle'), 
            speedGesturesToggle: document.getElementById('speed-gestures-toggle'),
            volumeGesturesToggle: document.getElementById('volume-gestures-toggle'),
            deleteGestureToggle: document.getElementById('delete-gesture-toggle'),
            clearGestureToggle: document.getElementById('clear-gesture-toggle'),
            autoTimerToggle: document.getElementById('auto-timer-toggle'),
            autoCounterToggle: document.getElementById('auto-counter-toggle'),
            arModeToggle: document.getElementById('ar-mode-toggle'),
            voiceInputToggle: document.getElementById('voice-input-toggle'),
            speedDelete: document.getElementById('speed-delete-toggle'), 
            showWelcome: document.getElementById('show-welcome-toggle'), 
            blackoutToggle: document.getElementById('blackout-toggle'), 
            stealth1KeyToggle: document.getElementById('stealth-1key-toggle'),
            longPressToggle: document.getElementById('long-press-autoplay-toggle'), 
            blackoutGesturesToggle: document.getElementById('blackout-gestures-toggle'),
            timerToggle: document.getElementById('timer-toggle'),
            counterToggle: document.getElementById('counter-toggle'),
            gestureToggle: document.getElementById('gesture-input-toggle'),
            uiScale: document.getElementById('ui-scale-select'), 
            seqSize: document.getElementById('seq-size-select'), 
            seqFontSize: document.getElementById('seq-font-size-select'),
            gestureMode: document.getElementById('gesture-mode-select'), 
            autoInput: document.getElementById('auto-input-select'),
            generalLang: document.getElementById('general-lang-select'), 
            closeSettingsBtn: document.getElementById('close-settings'),
            tabs: document.querySelectorAll('.tab-btn'),
            setupModal: document.getElementById('game-setup-modal'), 
            calibAudioSlider: document.getElementById('calib-audio-slider'), 
            calibCamSlider: document.getElementById('calib-cam-slider'),
            promptDisplay: document.getElementById('prompt-display')
        };
    }

    // --- COLOR & THEME HELPERS ---
    hexToHsl(hex) { 
        let r = 0, g = 0, b = 0; 
        if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } 
        else { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
        if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4;
        h = Math.round(h * 60); if (h < 0) h += 360;
        l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        return [h, Math.round(s * 100), Math.round(l * 100)];
    }

    hslToHex(h, s, l) {
        s /= 100; l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
        const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    buildColorGrid() { 
        if (!this.dom.editorGrid) return; 
        this.dom.editorGrid.innerHTML = ''; 
        CRAYONS.forEach(color => { 
            const btn = document.createElement('div'); 
            btn.style.backgroundColor = color; 
            btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-110"; 
            btn.onclick = () => this.applyColorToTarget(color); 
            this.dom.editorGrid.appendChild(btn); 
        }); 
    }

    applyColorToTarget(hex) {
        if (!this.tempTheme) return;
        this.tempTheme[this.currentTargetKey] = hex;
        const [h, s, l] = this.hexToHsl(hex);
        this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l;
        this.dom.ftPreview.style.backgroundColor = hex;
        this.updatePreview();
    }

    updatePreview() {
        const t = this.tempTheme;
        if (!this.dom.edPreview) return;
        this.dom.edPreview.style.backgroundColor = t.bgMain;
        this.dom.edPreviewCard.style.backgroundColor = t.bgCard;
        this.dom.edPreviewBtn.style.backgroundColor = t.bubble;
        this.dom.edPreview.style.color = this.dom.edPreviewCard.style.color = this.dom.edPreviewBtn.style.color = t.text;
    }

    // --- POPULATION HELPERS ---
    populateConfigDropdown() { 
        const populate = (el) => {
            if(!el) return;
            el.innerHTML = ''; 
            Object.keys(this.appSettings.profiles).forEach(id => {
                const o = document.createElement('option');
                o.value = id; o.textContent = this.appSettings.profiles[id].name;
                el.appendChild(o);
            });
            el.value = this.appSettings.activeProfileId;
        };
        populate(this.dom.configSelect); populate(this.dom.quickConfigSelect);
    }

    populateThemeDropdown() { 
        if (!this.dom.themeSelect) return; 
        const s = this.dom.themeSelect; s.innerHTML = '';
        const addGrp = (label, data) => {
            const grp = document.createElement('optgroup'); grp.label = label;
            Object.keys(data).forEach(k => { grp.innerHTML += `<option value="${k}">${data[k].name}</option>`; });
            s.appendChild(grp);
        };
        addGrp("Built-in", PREMADE_THEMES);
        addGrp("My Themes", this.appSettings.customThemes);
        s.value = this.appSettings.activeTheme; 
    }

    populateVoicePresetDropdown() {
        if (!this.dom.voicePresetSelect) return;
        this.dom.voicePresetSelect.innerHTML = '';
        const addGrp = (label, data) => {
            const grp = document.createElement('optgroup'); grp.label = label;
            Object.keys(data).forEach(k => { grp.innerHTML += `<option value="${k}">${data[k].name}</option>`; });
            this.dom.voicePresetSelect.appendChild(grp);
        };
        addGrp("Built-in", PREMADE_VOICE_PRESETS);
        if(this.appSettings.voicePresets) addGrp("My Voices", this.appSettings.voicePresets);
        this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
    }

    populatePlaybackSpeedDropdown() {
        if (!this.dom.playbackSpeed) return;
        this.dom.playbackSpeed.innerHTML = '';
        for (let i = 75; i <= 150; i += 5) {
            const val = (i / 100).toFixed(2);
            this.dom.playbackSpeed.innerHTML += `<option value="${val}">${i}%</option>`;
        }
        this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
    }

    populateUIScaleDropdown() {
        if (!this.dom.uiScale) return;
        this.dom.uiScale.innerHTML = '';
        for (let i = 50; i <= 300; i += 10) {
            this.dom.uiScale.innerHTML += `<option value="${i}">${i}%</option>`;
        }
        this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
    }

    // --- DYNAMIC UI BUILDERS ---
    populateMorseUI() {
        const tab = document.getElementById('tab-playback');
        if (!tab) return;
        let container = document.getElementById('morse-container');
        if (!container) {
            container = document.createElement('div'); container.id = 'morse-container';
            container.className = "mt-6 p-4 rounded-lg bg-black bg-opacity-20 border border-gray-700";
            tab.appendChild(container);
        }
        const morseOptions = ['.', '-', '..', '--', '...', '---'];
        const labels = ["1", "2", "3", "4", "5", "6 C", "7 D", "8 E", "9 F", "10 G", "11 A", "12 B"];
        let gridHtml = `<h3 class="text-xs font-bold uppercase text-gray-400 mb-3">Haptic Mapping</h3><div class="grid grid-cols-4 gap-2">`;
        labels.forEach((label, idx) => {
            const val = idx + 1;
            gridHtml += `<div class="text-[10px] text-gray-500 text-right self-center">${label}</div>
            <select class="settings-input text-[10px] p-1" data-morse-id="${val}">
                <option value="__TICK__">Tick</option><option value="__THUD__">Thud</option>
                ${morseOptions.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>`;
        });
        container.innerHTML = gridHtml + `</div>`;
        container.querySelectorAll('select').forEach(sel => {
            const id = sel.dataset.morseId;
            sel.value = (this.appSettings.morseMappings && this.appSettings.morseMappings[id]) || ".";
            sel.onchange = () => {
                if (!this.appSettings.morseMappings) this.appSettings.morseMappings = {};
                this.appSettings.morseMappings[id] = sel.value;
                this.callbacks.onSave();
            };
        });
    }

    populateMappingUI() {
        const tab = document.getElementById('tab-mapping');
        if (!tab) return;
        tab.innerHTML = `<p class="text-[10px] text-gray-400 mb-4">Assign touch and AI hand gestures to pad values.</p>`;
        const buildSection = (type, title, keyPrefix, customKeys, isOpen) => {
            const details = document.createElement('details');
            details.className = "group rounded-lg border border-custom bg-black bg-opacity-20 mb-3";
            if (isOpen) details.open = true;
            details.innerHTML = `<summary class="cursor-pointer p-3 font-bold text-sm flex justify-between"><span>${title}</span><span>▼</span></summary>`;
            const list = document.createElement('div'); list.className = "p-3 space-y-2 border-t border-gray-700 max-h-48 overflow-y-auto";
            customKeys.forEach(k => {
                const keyId = keyPrefix + k;
                const mapping = this.appSettings.gestureMappings?.[keyId] || {};
                const row = document.createElement('div'); row.className = "flex space-x-2";
                row.innerHTML = `<div class="text-[10px] w-4">${k}</div>
                <select class="settings-input text-[10px] flex-1" data-key="${keyId}" data-type="gesture"><option value="tap">Tap</option><option value="swipe_up">Swipe Up</option></select>
                <select class="settings-input text-[10px] flex-1 bg-blue-900 bg-opacity-10" data-key="${keyId}" data-type="hand"><option value="">-Hand-</option><option value="hand_1_up">1 Up</option></select>`;
                list.appendChild(row);
            });
            details.appendChild(list); tabRoot.appendChild(details);
        };
        const tabRoot = tab;
        buildSection('key9', '9-Key', 'k9_', ["1","2","3","4","5","6","7","8","9"], true);
        buildSection('key12', '12-Key', 'k12_', ["1","2","3","4","5","6","7","8","9","10","11","12"], false);
    }

    // --- MAIN LISTENERS ---
    initListeners() {
        this.dom.tabs.forEach(btn => {
            btn.onclick = () => {
                const parent = btn.closest('.settings-modal-bg');
                parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            };
        });

        const bind = (el, prop, isGlobal) => {
            if (!el) return;
            el.onchange = () => {
                const val = (el.type === 'checkbox') ? el.checked : el.value;
                if (isGlobal) this.appSettings[prop] = val; else this.appSettings.runtimeSettings[prop] = val;
                this.callbacks.onSave(); this.updateHeaderVisibility(); renderUI();
            };
        };

        bind(this.dom.input, 'currentInput', false);
        bind(this.dom.machines, 'machineCount', false);
        bind(this.dom.autoplay, 'isAutoplayEnabled', true);
        bind(this.dom.audio, 'isAudioEnabled', true);
        bind(this.dom.timerToggle, 'showTimer', true);
        bind(this.dom.counterToggle, 'showCounter', true);
        bind(this.dom.arModeToggle, 'isArModeEnabled', true);
        bind(this.dom.voiceInputToggle, 'isVoiceInputEnabled', true);
        bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
        
        if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); updateAllChrome(); this.callbacks.onSave(); };
        if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none');
    }

    updateHeaderVisibility() {
        const header = document.getElementById('aux-control-header');
        if (!header) return;
        const states = {
            timer: !!this.appSettings.showTimer,
            counter: !!this.appSettings.showCounter,
            mic: !!this.appSettings.isVoiceInputEnabled,
            cam: !!this.appSettings.isArModeEnabled,
            hand: !!this.appSettings.isHandGesturesEnabled
        };
        Object.keys(states).forEach(k => {
            const btn = document.getElementById(`header-${k}-btn`);
            if(btn) btn.classList.toggle('hidden', !states[k]);
        });
        header.classList.toggle('header-hidden', !Object.values(states).some(v => v));
    }

    openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); }
}
