
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

export const PREMADE_THEMES = {
    'default': { name: "Default Dark", bgMain: "#000000", bgCard: "#121212", bubble: "#4f46e5", btn: "#1a1a1a", text: "#e5e5e5" },
    'light': { name: "Light Mode", bgMain: "#f3f4f6", bgCard: "#ffffff", bubble: "#4f46e5", btn: "#e5e7eb", text: "#111827" },
    'matrix': { name: "The Matrix", bgMain: "#000000", bgCard: "#0f2b0f", bubble: "#003300", btn: "#001100", text: "#00ff41" },
    'dracula': { name: "Vampire", bgMain: "#282a36", bgCard: "#44475a", bubble: "#ff5555", btn: "#6272a4", text: "#f8f8f2" },
    'neon': { name: "Neon City", bgMain: "#0b0014", bgCard: "#180029", bubble: "#d900ff", btn: "#24003d", text: "#00eaff" },
    'retro': { name: "Retro PC", bgMain: "#fdf6e3", bgCard: "#eee8d5", bubble: "#cb4b16", btn: "#93a1a1", text: "#586e75" },
    'steampunk': { name: "Steampunk", bgMain: "#100c08", bgCard: "#2b1d16", bubble: "#b87333", btn: "#422a18", text: "#d5c5a3" },
    'ocean': { name: "Ocean Blue", bgMain: "#0f172a", bgCard: "#1e293b", bubble: "#0ea5e9", btn: "#334155", text: "#e2e8f0" },
    'cyber': { name: "Cyberpunk", bgMain: "#050505", bgCard: "#1a1625", bubble: "#d946ef", btn: "#2d1b4e", text: "#f0abfc" },
    'volcano': { name: "Volcano", bgMain: "#1a0505", bgCard: "#450a0a", bubble: "#b91c1c", btn: "#7f1d1d", text: "#fecaca" },
    'forest': { name: "Deep Forest", bgMain: "#021408", bgCard: "#064e3b", bubble: "#166534", btn: "#14532d", text: "#dcfce7" },
    'sunset': { name: "Sunset", bgMain: "#1a021c", bgCard: "#701a75", bubble: "#fb923c", btn: "#86198f", text: "#fff7ed" },
    'halloween': { name: "Halloween 🎃", bgMain: "#1a0500", bgCard: "#2e0a02", bubble: "#ff6600", btn: "#4a1005", text: "#ffbf00" },
    'liberty': { name: "Liberty 🗽", bgMain: "#0d1b1e", bgCard: "#1c3f44", bubble: "#2e8b57", btn: "#143136", text: "#d4af37" },
    'shamrock': { name: "Shamrock ☘️", bgMain: "#021a02", bgCard: "#053305", bubble: "#00c92c", btn: "#0a450a", text: "#e0ffe0" },
    'midnight': { name: "Midnight 🌑", bgMain: "#000000", bgCard: "#111111", bubble: "#3b82f6", btn: "#1f1f1f", text: "#ffffff" },
    'candy': { name: "Candy 🍬", bgMain: "#260516", bgCard: "#4a0a2f", bubble: "#ff69b4", btn: "#701046", text: "#ffe4e1" },
    'bumblebee': { name: "Bumblebee 🐝", bgMain: "#1a1600", bgCard: "#332b00", bubble: "#fbbf24", btn: "#4d4100", text: "#ffffff" },
    'blueprint': { name: "Blueprint 📐", bgMain: "#0f2e52", bgCard: "#1b4d8a", bubble: "#ffffff", btn: "#2563eb", text: "#ffffff" },
    'rose': { name: "Rose Gold 🌹", bgMain: "#1f1212", bgCard: "#3d2323", bubble: "#e1adac", btn: "#5c3333", text: "#ffe4e1" },
    'hacker': { name: "Terminal 💻", bgMain: "#0c0c0c", bgCard: "#1a1a1a", bubble: "#00ff00", btn: "#0f380f", text: "#00ff00" },
    'royal': { name: "Royal 👑", bgMain: "#120024", bgCard: "#2e0059", bubble: "#9333ea", btn: "#4c1d95", text: "#ffd700" }
};

export const PREMADE_VOICE_PRESETS = {
    'standard': { name: "Standard", pitch: 1.0, rate: 1.0, volume: 1.0 },
    'speed': { name: "Speed Reader", pitch: 1.0, rate: 1.8, volume: 1.0 },
    'slow': { name: "Slow Motion", pitch: 0.9, rate: 0.6, volume: 1.0 },
    'deep': { name: "Deep Voice", pitch: 0.6, rate: 0.9, volume: 1.0 },
    'high': { name: "Chipmunk", pitch: 1.8, rate: 1.1, volume: 1.0 },
    'robot': { name: "Robot", pitch: 0.5, rate: 0.8, volume: 1.0 },
    'announcer': { name: "Announcer", pitch: 0.8, rate: 1.1, volume: 1.0 },
    'whisper': { name: "Quiet", pitch: 1.2, rate: 0.8, volume: 0.4 }
};
const GESTURE_PRESETS = {
    '9_taps': {
        name: "Standard Taps (9)",
        type: 'key9',
        map: {
            'k9_1': 'tap', 'k9_2': 'double_tap', 'k9_3': 'triple_tap',
            'k9_4': 'tap_2f', 'k9_5': 'double_tap_2f', 'k9_6': 'triple_tap_2f',
            'k9_7': 'tap_3f', 'k9_8': 'double_tap_3f', 'k9_9': 'triple_tap_3f'
        }
    },
    '9_swipes': {
        name: "Directional Swipes (9)",
        type: 'key9',
        map: {
            'k9_1': 'swipe_nw', 'k9_2': 'swipe_up', 'k9_3': 'swipe_ne',
            'k9_4': 'swipe_left', 'k9_5': 'tap', 'k9_6': 'swipe_right',
            'k9_7': 'swipe_sw', 'k9_8': 'swipe_down', 'k9_9': 'swipe_se'
        }
    },
    '12_taps': {
        name: "Standard Taps (12)",
        type: 'key12',
        map: {
            'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
            'k12_5': 'tap_2f', 'k12_6': 'double_tap_2f', 'k12_7': 'triple_tap_2f', 'k12_8': 'long_tap_2f',
            'k12_9': 'tap_3f', 'k12_10': 'double_tap_3f', 'k12_11': 'triple_tap_3f', 'k12_12': 'long_tap_3f'
        }
    },
    '12_swipes': {
        name: "Directional Swipes (12)",
        type: 'key12',
        map: {
            'k12_1': 'swipe_left', 'k12_2': 'swipe_up', 'k12_3': 'swipe_down', 'k12_4': 'swipe_right',
            'k12_5': 'swipe_left_2f', 'k12_6': 'swipe_up_2f', 'k12_7': 'swipe_down_2f', 'k12_8': 'swipe_right_2f',
            'k12_9': 'swipe_left_3f', 'k12_10': 'swipe_up_3f', 'k12_11': 'swipe_down_3f', 'k12_12': 'swipe_right_3f'
        }
    },
    'piano_swipes': {
        name: "Piano Swipes",
        type: 'piano',
        map: {
            'piano_1': 'swipe_left_2f', 'piano_2': 'swipe_nw_2f', 'piano_3': 'swipe_up_2f', 'piano_4': 'swipe_ne_2f', 'piano_5': 'swipe_right_2f',
            'piano_C': 'swipe_nw', 'piano_D': 'swipe_left', 'piano_E': 'swipe_sw', 'piano_F': 'swipe_down',
            'piano_G': 'swipe_se', 'piano_A': 'swipe_right', 'piano_B': 'swipe_ne'
        }
    }
}; 
const CRAYONS = ["#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", "#B0B7C6", "#AF4035", "#F5F5F5", "#FEFEFA", "#FFFAFA", "#F0F8FF", "#F8F8FF", "#F5F5DC", "#FFFACD", "#FAFAD2", "#FFFFE0", "#FFFFF0", "#FFFF00", "#FFEFD5", "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", "#BDB76B", "#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#FF00FF", "#BA55D3", "#9370DB", "#8A2BE2", "#9400D3", "#9932CC", "#8B008B", "#800000", "#4B0082", "#483D8B", "#6A5ACD", "#7B68EE", "#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", "#6B8E23", "#808000", "#556B2F", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#00FFFF", "#00CED1", "#40E0D0", "#48D1CC", "#AFEEEE", "#7FFFD4", "#B0E0E6", "#5F9EA0", "#4682B4", "#6495ED", "#00BFFF", "#1E90FF", "#ADD8E6", "#87CEEB", "#87CEFA", "#191970", "#000080", "#0000FF", "#0000CD", "#4169E1", "#8A2BE2", "#4B0082", "#FFE4C4", "#FFEBCD", "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F", "#F4A460", "#DAA520", "#B8860B", "#CD853F", "#D2691E", "#8B4513", "#A0522D", "#A52A2A", "#800000", "#FFA07A", "#FA8072", "#E9967A", "#F08080", "#CD5C5C", "#DC143C", "#B22222", "#FF0000", "#FF4500", "#FF6347", "#FF7F50", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00", "#808000", "#556B2F", "#6B8E23", "#999999", "#808080", "#666666", "#333333", "#222222", "#111111", "#0A0A0A", "#000000"];

const LANG = {
    en: {
        quick_title: "👋 Quick Start", select_profile: "Select Profile", autoplay: "Autoplay", audio: "Audio", help_btn: "Help 📚", settings_btn: "Settings", dont_show: "Don't show again", play_btn: "PLAY", theme_editor: "🎨 Theme Editor",
        lbl_profiles: "Profiles", lbl_game: "Game", lbl_playback: "Playback", lbl_general: "General", lbl_mode: "Mode", lbl_input: "Input",
        timer_toggle: "Timer ⏱️", counter_toggle: "Counter #", 
        // Note: Boss Mode, Inputs Only etc are now hardcoded in HTML for cleanliness
        help_stealth_detail: "Inputs Only (1-Key) simplifies input by mapping the 12 primary values (1-12) to a single key press. The interpretation depends on context and mode (Simon/Unique). This is intended for high-speed, minimal-movement input.",
        help_blackout_detail: "Boss Mode (Blackout) turns the entire screen black to eliminate visual distraction, allowing you to focus purely on audio cues and muscle memory. The app remains fully functional, but the UI is hidden. If BM Gestures are enabled, input switches to a 'no-look' touch system.",
        help_gesture_detail: "BM Gestures: A 'no-look' input system. Use touch gestures (swipes, taps) to represent values 1 through 12. Values 6 through 12 are represented by letters A through G (A=6, B=7, etc.) on a virtual 3x4 grid."
    },
    es: {
        quick_title: "👋 Inicio Rápido", select_profile: "Perfil", autoplay: "Auto-reproducción", audio: "Audio", help_btn: "Ayuda 📚", settings_btn: "Ajustes", dont_show: "No mostrar más", play_btn: "JUGAR", theme_editor: "🎨 Editor de Temas",
        lbl_profiles: "Perfiles", lbl_game: "Juego", lbl_playback: "Reproducción", lbl_general: "General", lbl_mode: "Modo", lbl_input: "Entrada",
        timer_toggle: "Mostrar Temporizador", counter_toggle: "Mostrar Contador",
        help_stealth_detail: "Solo Entradas (1-tecla) simplifica la entrada al asignar los 12 valores primarios (1-12) a una sola pulsación de tecla.",
        help_blackout_detail: "Modo Jefe (Blackout) oscurece toda la pantalla para eliminar la distracción visual. La aplicación sigue siendo completamente funcional, pero la interfaz de usuario está oculta.",
        help_gesture_detail: "Gestos BM: Un sistema de entrada 'sin mirar' para valores del 1 al 12."
    }
};

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings; this.callbacks = callbacks; this.sensorEngine = sensorEngine; this.currentTargetKey = 'bubble';
        
        // Removed dynamic injections - UI is now hardcoded in index.html for cleaner layout

        // 2. Build the DOM cache
        this.dom = {
            editorModal: document.getElementById('theme-editor-modal'), editorGrid: document.getElementById('color-grid'), ftContainer: document.getElementById('fine-tune-container'), ftToggle: document.getElementById('toggle-fine-tune'), ftPreview: document.getElementById('fine-tune-preview'), ftHue: document.getElementById('ft-hue'), ftSat: document.getElementById('ft-sat'), ftLit: document.getElementById('ft-lit'),
            targetBtns: document.querySelectorAll('.target-btn'), edName: document.getElementById('theme-name-input'), edPreview: document.getElementById('theme-preview-box'), edPreviewBtn: document.getElementById('preview-btn'), edPreviewCard: document.getElementById('preview-card'), edSave: document.getElementById('save-theme-btn'), edCancel: document.getElementById('cancel-theme-btn'),
            openEditorBtn: document.getElementById('open-theme-editor'),

            // Voice Preset DOM
            voicePresetSelect: document.getElementById('voice-preset-select'),
            voicePresetAdd: document.getElementById('voice-preset-add'),
            voicePresetSave: document.getElementById('voice-preset-save'),
            voicePresetRename: document.getElementById('voice-preset-rename'),
            voicePresetDelete: document.getElementById('voice-preset-delete'),

            voicePitch: document.getElementById('voice-pitch'), voiceRate: document.getElementById('voice-rate'), voiceVolume: document.getElementById('voice-volume'), voiceTestBtn: document.getElementById('test-voice-btn'),

            settingsModal: document.getElementById('settings-modal'), themeSelect: document.getElementById('theme-select'), themeAdd: document.getElementById('theme-add'), themeRename: document.getElementById('theme-rename'), themeDelete: document.getElementById('theme-delete'), themeSave: document.getElementById('theme-save'),
            configSelect: document.getElementById('config-select'), quickConfigSelect: document.getElementById('quick-config-select'), configAdd: document.getElementById('config-add'), configRename: document.getElementById('config-rename'), configDelete: document.getElementById('config-delete'), configSave: document.getElementById('config-save'),

            // Inputs
            input: document.getElementById('input-select'), mode: document.getElementById('mode-select'), practiceMode: document.getElementById('practice-mode-toggle'), machines: document.getElementById('machines-select'), seqLength: document.getElementById('seq-length-select'),
            autoClear: document.getElementById('autoclear-toggle'), autoplay: document.getElementById('autoplay-toggle'), flash: document.getElementById('flash-toggle'),
            pause: document.getElementById('pause-select'), audio: document.getElementById('audio-toggle'), hapticMorse: document.getElementById('haptic-morse-toggle'), playbackSpeed: document.getElementById('playback-speed-select'), chunk: document.getElementById('chunk-select'), delay: document.getElementById('delay-select'), haptics: document.getElementById('haptics-toggle'), 
            
            // RENAMED ITEMS BINDINGS
            speedDelete: document.getElementById('speed-delete-toggle'), // "Quick Erase"
            showWelcome: document.getElementById('show-welcome-toggle'), 
            blackoutToggle: document.getElementById('blackout-toggle'), // "Boss Mode"
            stealth1KeyToggle: document.getElementById('stealth-1key-toggle'), // "Inputs Only"
            
            // Previously injected, now hardcoded
            longPressToggle: document.getElementById('long-press-autoplay-toggle'), // "AP Shortcut"
            blackoutGesturesToggle: document.getElementById('blackout-gestures-toggle'), // "BM Gestures"
            timerToggle: document.getElementById('timer-toggle'),
            counterToggle: document.getElementById('counter-toggle'),
            gestureToggle: document.getElementById('gesture-input-toggle'),

            uiScale: document.getElementById('ui-scale-select'), 
            seqSize: document.getElementById('seq-size-select'), 
            seqFontSize: document.getElementById('seq-font-size-select'), // <--- NEW FONT SIZE
            gestureMode: document.getElementById('gesture-mode-select'), autoInput: document.getElementById('auto-input-select'),
            quickLang: document.getElementById('quick-lang-select'), generalLang: document.getElementById('general-lang-select'), closeSettingsBtn: document.getElementById('close-settings'),

            // TABS
            tabs: document.querySelectorAll('.tab-btn'),
            contents: document.querySelectorAll('.tab-content'),

            helpModal: document.getElementById('help-modal'), setupModal: document.getElementById('game-setup-modal'), shareModal: document.getElementById('share-modal'), closeSetupBtn: document.getElementById('close-game-setup-modal'), quickSettings: document.getElementById('quick-open-settings'), quickHelp: document.getElementById('quick-open-help'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'), quickAudio: document.getElementById('quick-audio-toggle'), dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickResizeUp: document.getElementById('quick-resize-up'), quickResizeDown: document.getElementById('quick-resize-down'),

            openShareInside: document.getElementById('open-share-button'), closeShareBtn: document.getElementById('close-share'), closeHelpBtn: document.getElementById('close-help'), closeHelpBtnBottom: document.getElementById('close-help-btn-bottom'), openHelpBtn: document.getElementById('open-help-button'), promptDisplay: document.getElementById('prompt-display'), copyPromptBtn: document.getElementById('copy-prompt-btn'), generatePromptBtn: document.getElementById('generate-prompt-btn'),
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
            calibModal: document.getElementById('calibration-modal'), openCalibBtn: document.getElementById('open-calibration-btn'), closeCalibBtn: document.getElementById('close-calibration-btn'), calibAudioSlider: document.getElementById('calib-audio-slider'), calibCamSlider: document.getElementById('calib-cam-slider'), calibAudioBar: document.getElementById('calib-audio-bar'), calibCamBar: document.getElementById('calib-cam-bar'), calibAudioMarker: document.getElementById('calib-audio-marker'), calibCamMarker: document.getElementById('calib-cam-marker'), calibAudioVal: document.getElementById('audio-val-display'), calibCamVal: document.getElementById('cam-val-display'),
            redeemModal: document.getElementById('redeem-modal'), openRedeemBtn: document.getElementById('open-redeem-btn'), closeRedeemBtn: document.getElementById('close-redeem-btn'),

            openDonateBtn: document.getElementById('open-donate-btn'),
            openRedeemSettingsBtn: document.getElementById('open-redeem-btn-settings'),

            donateModal: document.getElementById('donate-modal'), closeDonateBtn: document.getElementById('close-donate-btn'),
            btnCashMain: document.getElementById('btn-cashapp-main'), btnPaypalMain: document.getElementById('btn-paypal-main'),
            copyLinkBtn: document.getElementById('copy-link-button'), nativeShareBtn: document.getElementById('native-share-button'),
            chatShareBtn: document.getElementById('chat-share-button'), emailShareBtn: document.getElementById('email-share-button'),
            
            mapping9Container: document.getElementById('mapping-9-container'),
            mapping12Container: document.getElementById('mapping-12-container'),
            mappingPianoContainer: document.getElementById('mapping-piano-container'),
        };
        this.tempTheme = null; this.initListeners(); this.populateConfigDropdown(); this.populateThemeDropdown(); this.buildColorGrid(); this.populateVoicePresetDropdown();
        this.populateMappingUI();
        if(this.dom.gestureToggle){
            this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
            this.dom.gestureToggle.addEventListener('change', (e) => {
                this.appSettings.isGestureInputEnabled = !!e.target.checked;
                this.callbacks.onSave();
                this.callbacks.onSettingsChanged && this.callbacks.onSettingsChanged();
            });
        }
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
        
        this.appSettings.generalLanguage = lang;
        if (this.dom.quickLang) this.dom.quickLang.value = lang;
        if (this.dom.generalLang) this.dom.generalLang.value = lang;
        this.callbacks.onSave();
    }

    openShare() { if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); if (this.dom.shareModal) { this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); setTimeout(() => this.dom.shareModal.querySelector('.share-sheet').classList.add('active'), 10); } }
    closeShare() { if (this.dom.shareModal) { this.dom.shareModal.querySelector('.share-sheet').classList.remove('active'); setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300); } }
    openCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'auto'; this.sensorEngine.toggleAudio(true); this.sensorEngine.toggleCamera(true); this.sensorEngine.setCalibrationCallback((data) => { if (this.dom.calibAudioBar) { const pct = ((data.audio - (-100)) / ((-30) - (-100))) * 100; this.dom.calibAudioBar.style.width = `${Math.max(0, Math.min(100, pct))}%`; } if (this.dom.calibCamBar) { const pct = Math.min(100, data.camera); this.dom.calibCamBar.style.width = `${pct}%`; } }); } }
    closeCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'none'; this.sensorEngine.setCalibrationCallback(null); this.sensorEngine.toggleAudio(this.appSettings.isAudioEnabled); this.sensorEngine.toggleCamera(this.appSettings.autoInputMode === 'cam' || this.appSettings.autoInputMode === 'both'); } }

    toggleRedeem(show) { if (show) { if (this.dom.redeemModal) { this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.redeemModal.style.pointerEvents = 'auto'; } } else { if (this.dom.redeemModal) { this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.redeemModal.style.pointerEvents = 'none'; } } }
    toggleDonate(show) { if (show) { if (this.dom.donateModal) { this.dom.donateModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.donateModal.style.pointerEvents = 'auto'; } } else { if (this.dom.donateModal) { this.dom.donateModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.donateModal.style.pointerEvents = 'none'; } } }

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
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.onchange = (e) => { this.appSettings.activeVoicePresetId = e.target.value; this.applyVoicePreset(e.target.value); };
        if (this.dom.voicePresetAdd) this.dom.voicePresetAdd.onclick = () => { const n = prompt("New Voice Preset Name:"); if (n) { const id = 'vp_' + Date.now(); this.appSettings.voicePresets[id] = { name: n, pitch: this.appSettings.voicePitch, rate: this.appSettings.voiceRate, volume: this.appSettings.voiceVolume }; this.appSettings.activeVoicePresetId = id; this.populateVoicePresetDropdown(); this.callbacks.onSave(); } };
        if (this.dom.voicePresetSave) this.dom.voicePresetSave.onclick = () => { const id = this.appSettings.activeVoicePresetId; if (PREMADE_VOICE_PRESETS[id]) { alert("Cannot save over built-in presets. Create a new one."); return; } if (this.appSettings.voicePresets[id]) { this.appSettings.voicePresets[id] = { ...this.appSettings.voicePresets[id], pitch: parseFloat(this.dom.voicePitch.value), rate: parseFloat(this.dom.voiceRate.value), volume: parseFloat(this.dom.voiceVolume.value) }; this.callbacks.onSave(); alert("Voice Preset Saved!"); } };
        if (this.dom.voicePresetDelete) this.dom.voicePresetDelete.onclick = () => { const id = this.appSettings.activeVoicePresetId; if (PREMADE_VOICE_PRESETS[id]) { alert("Cannot delete built-in."); return; } if (confirm("Delete this voice preset?")) { delete this.appSettings.voicePresets[id]; this.appSettings.activeVoicePresetId = 'standard'; this.populateVoicePresetDropdown(); this.applyVoicePreset('standard'); } };
        if (this.dom.voicePresetRename) this.dom.voicePresetRename.onclick = () => { const id = this.appSettings.activeVoicePresetId; if (PREMADE_VOICE_PRESETS[id]) return alert("Cannot rename built-in."); const n = prompt("Rename:", this.appSettings.voicePresets[id].name); if (n) { this.appSettings.voicePresets[id].name = n; this.populateVoicePresetDropdown(); this.callbacks.onSave(); } };

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
                
                // NEW: Trigger Header update on change of relevant settings
                if (['showTimer', 'showCounter', 'autoInputMode'].includes(prop)) {
                    this.updateHeaderVisibility();
                }
            };
        };

        bind(this.dom.input, 'currentInput', false); bind(this.dom.machines, 'machineCount', false, true); bind(this.dom.seqLength, 'sequenceLength', false, true); bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
        bind(this.dom.longPressToggle, 'isLongPressAutoplayEnabled', true);
        
        // NEW HEADER TOGGLE LISTENERS
        bind(this.dom.timerToggle, 'showTimer', true);
        bind(this.dom.counterToggle, 'showCounter', true);

        if (this.dom.mode) { this.dom.mode.onchange = () => { this.appSettings.runtimeSettings.currentMode = this.dom.mode.value; this.callbacks.onSave(); this.callbacks.onUpdate('mode_switch'); this.generatePrompt(); }; }
        if (this.dom.input) this.dom.input.addEventListener('change', () => this.generatePrompt());
        if (this.dom.machines) this.dom.machines.addEventListener('change', () => this.generatePrompt());
        if (this.dom.seqLength) this.dom.seqLength.addEventListener('change', () => this.generatePrompt());
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.addEventListener('change', () => this.generatePrompt());
        if (this.dom.delay) this.dom.delay.addEventListener('change', () => this.generatePrompt());
        if (this.dom.chunk) this.dom.chunk.addEventListener('change', () => this.generatePrompt());

        if (this.dom.autoplay) { this.dom.autoplay.onchange = (e) => { this.appSettings.isAutoplayEnabled = e.target.checked; if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked; this.callbacks.onSave(); } }
        if (this.dom.audio) { this.dom.audio.onchange = (e) => { this.appSettings.isAudioEnabled = e.target.checked; if (this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked; this.callbacks.onSave(); } }
        if (this.dom.quickAutoplay) { this.dom.quickAutoplay.onchange = (e) => { this.appSettings.isAutoplayEnabled = e.target.checked; if (this.dom.autoplay) this.dom.autoplay.checked = e.target.checked; this.callbacks.onSave(); } }
        if (this.dom.flash) this.dom.flash.checked = !!this.appSettings.isFlashEnabled;
        if (this.dom.pause) this.dom.pause.value = this.appSettings.pauseSetting || 'none';if (this.dom.quickAudio) { this.dom.quickAudio.onchange = (e) => { this.appSettings.isAudioEnabled = e.target.checked; if (this.dom.audio) this.dom.audio.checked = e.target.checked; this.callbacks.onSave(); } }
      
        if (this.dom.dontShowWelcome) { this.dom.dontShowWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = !e.target.checked; if (this.dom.showWelcome) this.dom.showWelcome.checked = !e.target.checked; this.callbacks.onSave(); } }
        if (this.dom.showWelcome) { this.dom.showWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = e.target.checked; if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !e.target.checked; this.callbacks.onSave(); } }

        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.onchange = (e) => { this.appSettings.playbackSpeed = parseFloat(e.target.value); this.callbacks.onSave(); this.generatePrompt(); };
        bind(this.dom.chunk, 'simonChunkSize', false, true); bind(this.dom.flash, 'isFlashEnabled', true); 
        bind(this.dom.pause, 'pauseSetting', true);
        if (this.dom.delay) this.dom.delay.onchange = (e) => { this.appSettings.runtimeSettings.simonInterSequenceDelay = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
        bind(this.dom.haptics, 'isHapticsEnabled', true); bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true); bind(this.dom.stealth1KeyToggle, 'isStealth1KeyEnabled', true);
        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', true); 
        bind(this.dom.blackoutGesturesToggle, 'isBlackoutGesturesEnabled', true);
        bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
        if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); this.callbacks.onUpdate(); };
        if (this.dom.seqSize) this.dom.seqSize.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
        
        // --- NEW FONT SIZE LISTENER ---
        if (this.dom.seqFontSize) {
            this.dom.seqFontSize.onchange = (e) => {
                this.appSettings.uiFontSizeMultiplier = parseInt(e.target.value) / 100.0;
                this.callbacks.onSave();
                this.callbacks.onUpdate();
            };
        }

        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
        if (this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => { this.appSettings.gestureResizeMode = e.target.value; this.callbacks.onSave(); };
        
        // Updated Auto-Input to also trigger header visibility check
        if (this.dom.autoInput) this.dom.autoInput.onchange = (e) => { const val = e.target.value; this.appSettings.autoInputMode = val; this.appSettings.showMicBtn = (val === 'mic' || val === 'both'); this.appSettings.showCamBtn = (val === 'cam' || val === 'both'); this.callbacks.onSave(); this.callbacks.onUpdate(); this.updateHeaderVisibility(); };
        
        if (this.dom.themeAdd) this.dom.themeAdd.onclick = () => { const n = prompt("Name:"); if (n) { const id = 'c_' + Date.now(); this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'], name: n }; this.appSettings.activeTheme = id; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); this.openThemeEditor(); } };
        if (this.dom.themeRename) this.dom.themeRename.onclick = () => { const id = this.appSettings.activeTheme; if (PREMADE_THEMES[id]) return alert("Cannot rename built-in."); const n = prompt("Rename:", this.appSettings.customThemes[id].name); if (n) { this.appSettings.customThemes[id].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); } };
        if (this.dom.themeDelete) this.dom.themeDelete.onclick = () => { if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in."); if (confirm("Delete?")) { delete this.appSettings.customThemes[this.appSettings.activeTheme]; this.appSettings.activeTheme = 'default'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); } };
        if (this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); this.populateThemeDropdown(); };
        if (this.dom.configAdd) this.dom.configAdd.onclick = () => { const n = prompt("Profile Name:"); if (n) this.callbacks.onProfileAdd(n); this.openSettings(); };
        if (this.dom.configRename) this.dom.configRename.onclick = () => { const n = prompt("Rename:"); if (n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
        if (this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
        if (this.dom.configSave) this.dom.configSave.onclick = () => { this.callbacks.onProfileSave(); };
        if (this.dom.themeSave) this.dom.themeSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onProfileSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); alert("Theme Saved!"); } };
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
                document.getElementById(`tab-${target}`).classList.add('active');
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
        if (this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => { if (this.dom.promptDisplay) { this.dom.promptDisplay.select(); navigator.clipboard.writeText(this.dom.promptDisplay.value).then(() => alert("Prompt Copied!")); } };
        if (this.dom.generatePromptBtn) this.dom.generatePromptBtn.onclick = () => { this.generatePrompt(); if (this.dom.promptDisplay) { this.dom.promptDisplay.style.opacity = '0.5'; setTimeout(() => this.dom.promptDisplay.style.opacity = '1', 150); } };
        if (this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => { if (navigator.share) { navigator.share({ title: "Follow Me", url: window.location.href }); } else { alert("Share not supported"); } };
        if (this.dom.chatShareBtn) this.dom.chatShareBtn.onclick = () => { window.location.href = `sms:?body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
        if (this.dom.emailShareBtn) this.dom.emailShareBtn.onclick = () => { window.location.href = `mailto:?subject=Follow%20Me%20App&body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
        if (this.dom.btnCashMain) this.dom.btnCashMain.onclick = () => { window.open('https://cash.app/$jwo83', '_blank'); };
        if (this.dom.btnPaypalMain) this.dom.btnPaypalMain.onclick = () => { window.open('https://www.paypal.me/Oyster981', '_blank'); };
        document.querySelectorAll('.donate-quick-btn').forEach(btn => { btn.onclick = () => { const app = btn.dataset.app; const amt = btn.dataset.amount; if (app === 'cash') window.open(`https://cash.app/$jwo83/${amt}`, '_blank'); if (app === 'paypal') window.open(`https://www.paypal.me/Oyster981/${amt}`, '_blank'); }; });
        if (this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => { if (confirm("Factory Reset?")) this.callbacks.onReset(); };
        if (this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
        if (this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };
    }
    populateConfigDropdown() { const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { const o = document.createElement('option'); o.value = id; o.textContent = this.appSettings.profiles[id].name; return o; }); if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; } if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; } }
    populateThemeDropdown() { const s = this.dom.themeSelect; if (!s) return; s.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); }); s.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Themes"; Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); }); s.appendChild(grp2); s.value = this.appSettings.activeTheme; }
    openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.updateUIFromSettings(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); }
    openSetup() { this.populateConfigDropdown(); this.updateUIFromSettings(); this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90'); }
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
            instructions = `MODE: MULTI-MACHINE AUTOPLAY (${machines} Machines).\nYOUR JOB:\n1. I will speak a batch of ${machines} numbers at once.\n2. You must immediately SORT them:\n   - 1st number -> Machine 1\n   - 2nd number -> Machine 2\n   - 3rd number -> Machine 3 (if active), etc.\n3. IMMEDIATELY after hearing the numbers, you must READ BACK the sequences for all machines.\n\nREADBACK RULES (Interleaved Chunking):\n- Recite the history in chunks of ${chunk}.\n- Order: Machine 1 (Chunk 1) -> Machine 2 (Chunk 1) -> ... -> Machine 1 (Chunk 2) -> Machine 2 (Chunk 2)...\n- Do not stop between machines. Flow through the list.\n- Pause ${delay} seconds between machine switches.`;
        } else {
            if (ps.currentMode === 'simon') {
                instructions = `MODE: SIMON SAYS (Single Machine).\n- The sequence grows by one number each round.\n- I will speak the NEW number.\n- You must add it to the list and READ BACK the ENTIRE list from the start.`;
            } else {
                instructions = `MODE: UNIQUE (Random/Non-Repeating).\n- Every round is a fresh random sequence.\n- I will speak a number. You simply repeat that number to confirm.\n- Keep a running list. If I say "Review", read the whole list.`;
            }
        }
        const promptText = `Act as a professional Sequence Caller for a memory skill game. \nYou are the "Caller" (App). I am the "Player" (User).\n\nSETTINGS:\n- Max Number: ${max}\n- Playback Speed: ${speed}x (Speak fast)\n- Active Machines: ${machines}\n- Chunk Size: ${chunk}\n\n${instructions}\n\nYOUR RULES:\n1. Speak clearly but quickly. No fluff. No conversational filler.\n2. If I get it wrong, correct me immediately.\n3. If I say "Status", tell me the current round/sequence length.\n\nSTART IMMEDIATELY upon my next input. Waiting for signal.`;
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
        if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.voicePitch || 1.0;
        if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.voiceRate || 1.0;
        if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.voiceVolume || 1.0;
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
        if (this.dom.practiceMode) this.dom.practiceMode.checked = this.appSettings.isPracticeModeEnabled;
        if (this.dom.stealth1KeyToggle) this.dom.stealth1KeyToggle.checked = this.appSettings.isStealth1KeyEnabled;
        if (this.dom.longPressToggle) this.dom.longPressToggle.checked = (typeof this.appSettings.isLongPressAutoplayEnabled === 'undefined') ? true : this.appSettings.isLongPressAutoplayEnabled;
        if (this.dom.timerToggle) this.dom.timerToggle.checked = !!this.appSettings.showTimer; // NEW
        if (this.dom.counterToggle) this.dom.counterToggle.checked = !!this.appSettings.showCounter; // NEW
        if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.value = this.appSettings.sensorAudioThresh || -85;
        if (this.dom.calibCamSlider) this.dom.calibCamSlider.value = this.appSettings.sensorCamThresh || 30;
        if (this.dom.haptics) this.dom.haptics.checked = (typeof this.appSettings.isHapticsEnabled === 'undefined') ? true : this.appSettings.isHapticsEnabled;
        if (this.dom.speedDelete) this.dom.speedDelete.checked = (typeof this.appSettings.isSpeedDeletingEnabled === 'undefined') ? true : this.appSettings.isSpeedDeletingEnabled;
        if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
        if (this.dom.seqSize) this.dom.seqSize.value = Math.round(this.appSettings.uiScaleMultiplier * 100) || 100;
        
        // --- NEW FONT SIZE UPDATE ---
        if (this.dom.seqFontSize) this.dom.seqFontSize.value = Math.round((this.appSettings.uiFontSizeMultiplier || 1.0) * 100);

        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
        if (this.dom.blackoutToggle) this.dom.blackoutToggle.checked = this.appSettings.isBlackoutFeatureEnabled;
        if (this.dom.blackoutGesturesToggle) this.dom.blackoutGesturesToggle.checked = this.appSettings.isBlackoutGesturesEnabled;
        if (this.dom.gestureToggle) this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
        if (this.dom.autoInput) this.dom.autoInput.value = this.appSettings.autoInputMode || 'none';
        
        // Language
        const lang = this.appSettings.generalLanguage || 'en';
        if (this.dom.quickLang) this.dom.quickLang.value = lang;
        if (this.dom.generalLang) this.dom.generalLang.value = lang;
        this.setLanguage(lang);
        
        // Ensure header visibility matches state on load
        this.updateHeaderVisibility();
    }

    // NEW METHOD: Manages the Auto-Hiding Header Bar
    updateHeaderVisibility() {
        const header = document.getElementById('aux-control-header');
        const timerBtn = document.getElementById('header-timer-btn');
        const counterBtn = document.getElementById('header-counter-btn');
        const micBtn = document.getElementById('header-mic-btn');
        const camBtn = document.getElementById('header-cam-btn');

        if (!header) return;

        // Check States
        const showTimer = !!this.appSettings.showTimer;
        const showCounter = !!this.appSettings.showCounter;
        const mode = this.appSettings.autoInputMode || 'none';
        const showMic = (mode === 'mic' || mode === 'both');
        const showCam = (mode === 'cam' || mode === 'both');

        // Toggle Buttons
        if(timerBtn) timerBtn.classList.toggle('hidden', !showTimer);
        if(counterBtn) counterBtn.classList.toggle('hidden', !showCounter);
        if(micBtn) micBtn.classList.toggle('hidden', !showMic);
        if(camBtn) camBtn.classList.toggle('hidden', !showCam);

        // Header Visibility Logic: Hide if ALL are hidden
        if (!showTimer && !showCounter && !showMic && !showCam) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
    }

    hexToHsl(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
    hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length === 1) r = "0" + r; if (g.length === 1) g = "0" + g; if (b.length === 1) b = "0" + b; return "#" + r + g + b; }
    populateMappingUI() {
        if (!this.dom) return;
        if (!this.appSettings) return;
        
        // FIX: Apply defaults BEFORE building the UI so the dropdowns have data
        if (!this.appSettings.gestureMappings || Object.keys(this.appSettings.gestureMappings).length === 0) {
            this.applyDefaultGestureMappings();
        }
        
        if (!this.appSettings.gestureProfiles) this.appSettings.gestureProfiles = {};

        // 1. CLEAN SLATE
        const tabRoot = document.getElementById('tab-mapping');
        if (tabRoot) {
            tabRoot.innerHTML = ''; 
            tabRoot.className = "tab-content p-1 space-y-4";
        }

        // 2. Readable Labels
        const getLabel = (techName) => {
            let fingers = "";
            if (techName.includes('_3f')) fingers = " (3 Finger)";
            else if (techName.includes('_2f')) fingers = " (2 Finger)";
            
            let base = techName.replace('_3f', '').replace('_2f', '');
            const map = {
                'tap': 'Tap', 'double_tap': 'Double Tap', 'triple_tap': 'Triple Tap', 'long_tap': 'Long Press',
                'swipe_up': 'Swipe Up', 'swipe_down': 'Swipe Down', 'swipe_left': 'Swipe Left', 'swipe_right': 'Swipe Right',
                'swipe_nw': 'Swipe Up-Left', 'swipe_ne': 'Swipe Up-Right', 'swipe_sw': 'Swipe Down-Left', 'swipe_se': 'Swipe Down-Right'
            };
            return (map[base] || base) + fingers;
        };

        const cleanProfileName = (name) => {
            if (name.includes("Standard Taps")) return "Taps";
            if (name.includes("Directional Swipes")) return "Swipes";
            if (name.includes("Piano Swipes")) return "Swipes";
            return name;
        };

        const gestureList = [
            'tap', 'double_tap', 'triple_tap', 'long_tap',
            'tap_2f', 'double_tap_2f', 'triple_tap_2f', 'long_tap_2f',
            'tap_3f', 'double_tap_3f', 'triple_tap_3f', 'long_tap_3f',
            'swipe_up', 'swipe_nw', 'swipe_left', 'swipe_sw', 'swipe_down', 'swipe_se', 'swipe_right', 'swipe_ne',
            'swipe_up_2f', 'swipe_nw_2f', 'swipe_left_2f', 'swipe_sw_2f', 'swipe_down_2f', 'swipe_se_2f', 'swipe_right_2f', 'swipe_ne_2f',
            'swipe_up_3f', 'swipe_nw_3f', 'swipe_left_3f', 'swipe_sw_3f', 'swipe_down_3f', 'swipe_se_3f', 'swipe_right_3f', 'swipe_ne_3f'
        ];

        // 3. Section Builder
        const buildSection = (type, title, keyPrefix, count, customKeys = null) => {
            const wrapper = document.createElement('div');
            wrapper.className = "p-3 rounded-lg border border-custom settings-input bg-opacity-50 mb-4";

            // Header
            const header = document.createElement('div');
            header.className = "mb-2";
            header.innerHTML = `<label class="text-xs font-bold uppercase text-muted-custom block">${title} PROFILE</label>`;
            wrapper.appendChild(header);

            // Profile Select
            const select = document.createElement('select');
            select.className = "settings-input w-full p-2 rounded mb-3 font-bold";
            
            const populateSelect = () => {
                select.innerHTML = '';
                // Default Option to show current state if not strictly matching a profile
                const def = document.createElement('option');
                def.textContent = "-- Select Preset --";
                def.value = "";
                select.appendChild(def);

                const grp1 = document.createElement('optgroup'); grp1.label = "Built-in";
                Object.keys(GESTURE_PRESETS).forEach(k => {
                    if(GESTURE_PRESETS[k].type === type) {
                        const opt = document.createElement('option');
                        opt.value = k;
                        opt.textContent = cleanProfileName(GESTURE_PRESETS[k].name);
                        grp1.appendChild(opt);
                    }
                });
                select.appendChild(grp1);

                const grp2 = document.createElement('optgroup'); grp2.label = "My Setups";
                Object.keys(this.appSettings.gestureProfiles).forEach(k => {
                    if(this.appSettings.gestureProfiles[k].type === type) {
                        const opt = document.createElement('option');
                        opt.value = k;
                        opt.textContent = this.appSettings.gestureProfiles[k].name;
                        grp2.appendChild(opt);
                    }
                });
                select.appendChild(grp2);
            };
            populateSelect();
            wrapper.appendChild(select);

            // Buttons
            const btnGrid = document.createElement('div');
            btnGrid.className = "grid grid-cols-2 gap-2 mb-4"; 

            const createBtn = (txt, color, onClick) => {
                const b = document.createElement('button');
                b.textContent = txt;
                b.className = `py-2 text-xs bg-${color}-600 hover:bg-${color}-500 rounded text-white font-bold transition shadow`;
                b.onclick = onClick;
                return b;
            };

            const btnNew = createBtn("NEW", "blue", () => {
                const name = prompt("New Profile Name:");
                if(!name) return;
                const id = 'cust_gest_' + Date.now();
                const currentMap = {};
                listContainer.querySelectorAll('select').forEach(inp => currentMap[inp.dataset.key] = inp.value);
                this.appSettings.gestureProfiles[id] = { name: name, type: type, map: currentMap };
                this.callbacks.onSave();
                populateSelect();
                select.value = id;
            });

            const btnSave = createBtn("SAVE 💾", "green", () => {
                const val = select.value;
                if(!val || GESTURE_PRESETS[val]) return alert("Select a custom profile to save (or use NEW).");
                const currentMap = {};
                listContainer.querySelectorAll('select').forEach(inp => currentMap[inp.dataset.key] = inp.value);
                this.appSettings.gestureProfiles[val].map = currentMap;
                this.callbacks.onSave();
                alert("Profile Saved!");
            });

            const btnRen = createBtn("RENAME", "gray", () => {
                const val = select.value;
                if(!val || GESTURE_PRESETS[val]) return alert("Cannot rename built-in profiles.");
                const newName = prompt("Rename:", this.appSettings.gestureProfiles[val].name);
                if(newName) {
                    this.appSettings.gestureProfiles[val].name = newName;
                    this.callbacks.onSave();
                    populateSelect();
                    select.value = val;
                }
            });

            const btnDel = createBtn("DELETE", "red", () => {
                const val = select.value;
                if(!val || GESTURE_PRESETS[val]) return alert("Cannot delete built-in profiles.");
                if(confirm("Delete this profile?")) {
                    delete this.appSettings.gestureProfiles[val];
                    this.callbacks.onSave();
                    populateSelect();
                }
            });

            btnGrid.append(btnNew, btnSave, btnRen, btnDel);
            wrapper.appendChild(btnGrid);

            // Mappings List
            const listContainer = document.createElement('div');
            listContainer.className = "space-y-2 border-t border-custom pt-3";
            wrapper.appendChild(listContainer);

            const renderMappings = () => {
                listContainer.innerHTML = '';
                const keysToRender = customKeys || Array.from({length: count}, (_, i) => String(i + 1));
                
                keysToRender.forEach(k => {
                    const keyId = keyPrefix + k;
                    const row = document.createElement('div');
                    row.className = "flex items-center space-x-3";

                    const lbl = document.createElement('div');
                    lbl.className = "text-sm font-bold w-10 h-10 flex items-center justify-center bg-gray-800 rounded border border-gray-600 shadow-sm";
                    lbl.textContent = k;

                    const dropdown = document.createElement('select');
                    dropdown.className = "settings-input p-2 rounded flex-grow text-xs font-semibold h-10 border border-custom";
                    dropdown.setAttribute('data-key', keyId);

                    gestureList.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g;
                        opt.textContent = getLabel(g);
                        dropdown.appendChild(opt);
                    });

                    // FIX: Ensure value is set from current mappings
                    if(this.appSettings.gestureMappings && this.appSettings.gestureMappings[keyId]) {
                        dropdown.value = this.appSettings.gestureMappings[keyId].gesture || 'tap';
                    }

                    dropdown.onchange = () => {
                        if(!this.appSettings.gestureMappings[keyId]) this.appSettings.gestureMappings[keyId] = {};
                        this.appSettings.gestureMappings[keyId].gesture = dropdown.value;
                        this.callbacks.onSave();
                    };

                    row.appendChild(lbl);
                    row.appendChild(dropdown);
                    listContainer.appendChild(row);
                });
            };

            renderMappings();

            // Select Change Event
            select.onchange = () => {
                 const val = select.value;
                 if(!val) return;
                 let data = GESTURE_PRESETS[val] ? GESTURE_PRESETS[val].map : (this.appSettings.gestureProfiles[val] ? this.appSettings.gestureProfiles[val].map : null);
                 if(data) {
                     Object.keys(data).forEach(key => {
                         if(!this.appSettings.gestureMappings[key]) this.appSettings.gestureMappings[key] = {};
                         this.appSettings.gestureMappings[key].gesture = data[key];
                     });
                     this.callbacks.onSave();
                     renderMappings();
                 }
            };

            if(tabRoot) tabRoot.appendChild(wrapper);
        };

        // 4. Build Sections
        buildSection('key9', '9-Key', 'k9_', 9);
        buildSection('key12', '12-Key', 'k12_', 12);
        buildSection('piano', 'Piano', 'piano_', 0, ['C','D','E','F','G','A','B','1','2','3','4','5']);
    }


    applyDefaultGestureMappings() {
        this.appSettings.gestureMappings = this.appSettings.gestureMappings || {};
        const defs = {
            'k9_1': { gesture: 'tap', morse: '.' }, 'k9_2': { gesture: 'double_tap', morse: '..' }, 'k9_3': { gesture: 'triple_tap', morse: '...' }, 
            'k9_4': { gesture: 'tap_2f', morse: '-' }, 'k9_5': { gesture: 'double_tap_2f', morse: '-.' }, 'k9_6': { gesture: 'triple_tap_2f', morse: '-..' }, 
            'k9_7': { gesture: 'tap_3f', morse: '--' }, 'k9_8': { gesture: 'double_tap_3f', morse: '--.' }, 'k9_9': { gesture: 'triple_tap_3f', morse: '---' },

            'k12_1': { gesture: 'tap', morse: '.' }, 'k12_2': { gesture: 'double_tap', morse: '..' }, 'k12_3': { gesture: 'triple_tap', morse: '...' }, 'k12_4': { gesture: 'long_tap', morse: '...-' }, 
            'k12_5': { gesture: 'tap_2f', morse: '-' }, 'k12_6': { gesture: 'double_tap_2f', morse: '-.' }, 'k12_7': { gesture: 'triple_tap_2f', morse: '-..' }, 'k12_8': { gesture: 'long_tap_2f', morse: '-.-' }, 
            'k12_9': { gesture: 'tap_3f', morse: '--' }, 'k12_10': { gesture: 'double_tap_3f', morse: '--.' }, 'k12_11': { gesture: 'triple_tap_3f', morse: '--..' }, 'k12_12': { gesture: 'long_tap_3f', morse: '---' },

            'piano_C': { gesture: 'swipe_nw', morse: '.' }, 'piano_D': { gesture: 'swipe_left', morse: '..' }, 'piano_E': { gesture: 'swipe_sw', morse: '.-' }, 'piano_F': { gesture: 'swipe_down', morse: '...' }, 'piano_G': { gesture: 'swipe_se', morse: '..-' }, 'piano_A': { gesture: 'swipe_right', morse: '.-.' }, 'piano_B': { gesture: 'swipe_ne', morse: '.--' }, 
            'piano_1': { gesture: 'swipe_left_2f', morse: '-' }, 'piano_2': { gesture: 'swipe_nw_2f', morse: '-.' }, 'piano_3': { gesture: 'swipe_up_2f', morse: '--' }, 'piano_4': { gesture: 'swipe_ne_2f', morse: '-..' }, 'piano_5': { gesture: 'swipe_right_2f', morse: '-.-' }
        };
        this.appSettings.gestureMappings = Object.assign({}, defs, this.appSettings.gestureMappings || {});
    }
}
