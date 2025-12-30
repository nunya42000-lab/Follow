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
        this.appSettings = appSettings; 
        this.callbacks = callbacks; 
        this.sensorEngine = sensorEngine; 
        this.currentTargetKey = 'bubble';
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
            pause: document.getElementById('pause-select'), audio: document.getElementById('audio-toggle'), hapticMorse: document.getElementById('haptic-morse-toggle'), 
            
            playbackSpeed: document.getElementById('playback-speed-select'), // Target for the fix
            
            chunk: document.getElementById('chunk-select'), delay: document.getElementById('delay-select'), haptics: document.getElementById('haptics-toggle'), 
            
            // RENAMED ITEMS BINDINGS
            speedDelete: document.getElementById('speed-delete-toggle'), // "Quick Erase"
            showWelcome: document.getElementById('show-welcome-toggle'), 
            blackoutToggle: document.getElementById('blackout-toggle'), // "Boss Mode"
            stealth1KeyToggle: document.getElementById('stealth-1key-toggle'), // "Inputs Only"
            
            longPressToggle: document.getElementById('long-press-autoplay-toggle'), // "AP Shortcut"
            blackoutGesturesToggle: document.getElementById('blackout-gestures-toggle'), // "BM Gestures"
            timerToggle: document.getElementById('timer-toggle'),
            counterToggle: document.getElementById('counter-toggle'),
            gestureToggle: document.getElementById('gesture-input-toggle'),

            uiScale: document.getElementById('ui-scale-select'), 
            seqSize: document.getElementById('seq-size-select'), 
            seqFontSize: document.getElementById('seq-font-size-select'),
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
            redeemModal: document.getElementById('redeem-modal'), 
            openRedeemBtn: document.getElementById('open-redeem-btn'), 
            closeRedeemBtn: document.getElementById('close-redeem-btn'),
            redeemImg: document.getElementById('redeem-img'),
            redeemPlus: document.getElementById('redeem-zoom-in'),
            redeemMinus: document.getElementById('redeem-zoom-out'),

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
        this.tempTheme = null; 
        
        // Init calls
        this.populateSpeedDropdown(); // <--- CRITICAL FIX
        this.initListeners(); 
        this.populateConfigDropdown(); 
        this.populateThemeDropdown(); 
        this.buildColorGrid(); 
        this.populateVoicePresetDropdown();
        this.populateMappingUI();
        this.populateMorseUI();
        
        if(this.dom.gestureToggle){
            this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
            this.dom.gestureToggle.addEventListener('change', (e) => {
                this.appSettings.isGestureInputEnabled = !!e.target.checked;
                this.callbacks.onSave();
                this.callbacks.onSettingsChanged && this.callbacks.onSettingsChanged();
            });
        }
    }

    // --- NEW FUNCTION TO FIX EMPTY DROPDOWN ---
    populateSpeedDropdown() {
        if (!this.dom.playbackSpeed) return;
        this.dom.playbackSpeed.innerHTML = '';
        
        // Generate 75 to 200 in steps of 5
        for (let i = 75; i <= 200; i += 5) {
            const val = i / 100.0; // Convert 105 -> 1.05
            const el = document.createElement('option');
            el.value = val.toFixed(2);
            el.textContent = `${i}%`;
            this.dom.playbackSpeed.appendChild(el);
        }
        
        // Set initial value
        const current = this.appSettings.playbackSpeed || 1.0;
        this.dom.playbackSpeed.value = current.toFixed(2);
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
        
        // --- NEW FONT SIZE UPDATE ---
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
    populateConfigDropdown() {
        if (!this.dom.configSelect) return;
        this.dom.configSelect.innerHTML = '';
        Object.keys(this.appSettings.profiles).forEach(k => {
            const p = this.appSettings.profiles[k];
            const el = document.createElement('option');
            el.value = k;
            el.textContent = p.name;
            this.dom.configSelect.appendChild(el);
        });
        this.dom.configSelect.value = this.appSettings.activeProfileId;
        
        // Also update Quick Select if it exists
        if(this.dom.quickConfigSelect) {
             this.dom.quickConfigSelect.innerHTML = this.dom.configSelect.innerHTML;
             this.dom.quickConfigSelect.value = this.appSettings.activeProfileId;
        }
    }

    populateThemeDropdown() {
        if (!this.dom.themeSelect) return;
        this.dom.themeSelect.innerHTML = '';
        
        const grp1 = document.createElement('optgroup'); grp1.label = "Built-in";
        Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); });
        this.dom.themeSelect.appendChild(grp1);
        
        const grp2 = document.createElement('optgroup'); grp2.label = "Custom";
        Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); });
        this.dom.themeSelect.appendChild(grp2);
        
        this.dom.themeSelect.value = this.appSettings.activeTheme;
    }

    hexToHsl(H) { let r = 0, g = 0, b = 0; if (H.length == 4) { r = "0x" + H[1] + H[1]; g = "0x" + H[2] + H[2]; b = "0x" + H[3] + H[3]; } else if (H.length == 7) { r = "0x" + H[1] + H[2]; g = "0x" + H[3] + H[4]; b = "0x" + H[5] + H[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta == 0) h = 0; else if (cmax == r) h = ((g - b) / delta) % 6; else if (cmax == g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
    hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else if (300 <= h && h < 360) { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length == 1) r = "0" + r; if (g.length == 1) g = "0" + g; if (b.length == 1) b = "0" + b; return "#" + r + g + b; }

    populateMappingUI() {
        const containers = { 'key9': this.dom.mapping9Container, 'key12': this.dom.mapping12Container, 'piano': this.dom.mappingPianoContainer };
        Object.values(containers).forEach(c => { if(c) c.innerHTML = ''; });

        const createRow = (keyLabel, mapKey) => {
            const row = document.createElement('div');
            row.className = "flex items-center justify-between p-2 bg-white bg-opacity-5 rounded mb-2";
            const current = this.appSettings.gestureMappings[mapKey] || { gesture: 'none' };
            
            let html = `<span class="font-bold w-16">${keyLabel}</span><select class="bg-black border border-gray-600 rounded p-1 text-xs w-40" data-key="${mapKey}">`;
            const opts = ['none','tap','double_tap','triple_tap','long_tap','swipe_up','swipe_down','swipe_left','swipe_right','swipe_nw','swipe_ne','swipe_sw','swipe_se',
                          'tap_2f','double_tap_2f','triple_tap_2f','long_tap_2f','swipe_up_2f','swipe_down_2f','swipe_left_2f','swipe_right_2f','swipe_nw_2f','swipe_ne_2f','swipe_sw_2f','swipe_se_2f',
                          'tap_3f','double_tap_3f','triple_tap_3f','long_tap_3f','swipe_up_3f','swipe_down_3f','swipe_left_3f','swipe_right_3f'];
            opts.forEach(o => { html += `<option value="${o}" ${current.gesture===o?'selected':''}>${o.replace(/_/g,' ')}</option>`; });
            html += `</select>`;
            row.innerHTML = html;
            row.querySelector('select').onchange = (e) => {
                if(!this.appSettings.gestureMappings[mapKey]) this.appSettings.gestureMappings[mapKey] = {};
                this.appSettings.gestureMappings[mapKey].gesture = e.target.value;
                this.callbacks.onSave();
            };
            return row;
        };

        if(containers.key9) { for(let i=1; i<=9; i++) containers.key9.appendChild(createRow(`Key ${i}`, `k9_${i}`)); }
        if(containers.key12) { for(let i=1; i<=12; i++) containers.key12.appendChild(createRow(`Key ${i}`, `k12_${i}`)); }
        if(containers.piano) {
            ['C','D','E','F','G','A','B'].forEach(k => containers.piano.appendChild(createRow(`Note ${k}`, `piano_${k}`)));
            ['1','2','3','4','5'].forEach(k => containers.piano.appendChild(createRow(`Black ${k}`, `piano_${k}`)));
        }
    }
    
    populateMorseUI() {
        const div = document.getElementById('morse-reference-list');
        if(!div) return;
        div.innerHTML = '';
        const data = [
            {k:"1",m:".----"}, {k:"2",m:"..---"}, {k:"3",m:"...--"}, {k:"4",m:"....-"}, {k:"5",m:"....."},
            {k:"6",m:"-...."}, {k:"7",m:"--..."}, {k:"8",m:"---.."}, {k:"9",m:"----."}, {k:"10",m:"-----"},
            {k:"11",m:".---- ."}, {k:"12",m:".---- .."}
        ];
        data.forEach(d => {
            const r = document.createElement('div');
            r.className = "flex justify-between border-b border-gray-700 py-1";
            r.innerHTML = `<span>${d.k}</span><span class="font-mono text-primary-app">${d.m}</span>`;
            div.appendChild(r);
        });
    }

    updateHeaderVisibility() {
        const timerBtn = document.getElementById('header-timer-btn');
        const counterBtn = document.getElementById('header-counter-btn');
        const micBtn = document.getElementById('header-mic-btn');
        const camBtn = document.getElementById('header-cam-btn');
        
        if (timerBtn) timerBtn.classList.toggle('hidden', !this.appSettings.showTimer);
        if (counterBtn) counterBtn.classList.toggle('hidden', !this.appSettings.showCounter);
        
        if (micBtn) micBtn.classList.toggle('hidden', !(this.appSettings.autoInputMode === 'mic' || this.appSettings.autoInputMode === 'both'));
        if (camBtn) camBtn.classList.toggle('hidden', !(this.appSettings.autoInputMode === 'cam' || this.appSettings.autoInputMode === 'both'));
    }

    updateUIFromSettings() {
        // Dropdowns
        if (this.dom.configSelect) this.dom.configSelect.value = this.appSettings.activeProfileId;
        if (this.dom.quickConfigSelect) this.dom.quickConfigSelect.value = this.appSettings.activeProfileId;
        if (this.dom.themeSelect) this.dom.themeSelect.value = this.appSettings.activeTheme;
        if (this.dom.input) this.dom.input.value = this.appSettings.runtimeSettings.currentInput;
        if (this.dom.mode) this.dom.mode.value = this.appSettings.runtimeSettings.currentMode;
        if (this.dom.machines) this.dom.machines.value = this.appSettings.runtimeSettings.machineCount;
        if (this.dom.seqLength) this.dom.seqLength.value = this.appSettings.runtimeSettings.sequenceLength;
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
        if (this.dom.chunk) this.dom.chunk.value = this.appSettings.runtimeSettings.simonChunkSize;
        if (this.dom.delay) this.dom.delay.value = (this.appSettings.runtimeSettings.simonInterSequenceDelay / 1000) || 0; // Fix: was undefined check
        if (this.dom.pause) this.dom.pause.value = this.appSettings.pauseSetting || 'none';
        
        // Toggles
        if (this.dom.autoClear) this.dom.autoClear.checked = !!this.appSettings.isUniqueRoundsAutoClearEnabled;
        if (this.dom.autoplay) this.dom.autoplay.checked = !!this.appSettings.isAutoplayEnabled;
        if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = !!this.appSettings.isAutoplayEnabled;
        if (this.dom.flash) this.dom.flash.checked = !!this.appSettings.isFlashEnabled;
        if (this.dom.audio) this.dom.audio.checked = !!this.appSettings.isAudioEnabled;
        if (this.dom.quickAudio) this.dom.quickAudio.checked = !!this.appSettings.isAudioEnabled;
        if (this.dom.haptics) this.dom.haptics.checked = !!this.appSettings.isHapticsEnabled;
        if (this.dom.hapticMorse) this.dom.hapticMorse.checked = !!this.appSettings.isHapticMorseEnabled;
        if (this.dom.speedDelete) this.dom.speedDelete.checked = !!this.appSettings.isSpeedDeletingEnabled;
        if (this.dom.stealth1KeyToggle) this.dom.stealth1KeyToggle.checked = !!this.appSettings.isStealth1KeyEnabled;
        if (this.dom.longPressToggle) this.dom.longPressToggle.checked = !!this.appSettings.isLongPressAutoplayEnabled;
        if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        if (this.dom.showWelcome) this.dom.showWelcome.checked = !!this.appSettings.showWelcomeScreen;
        if (this.dom.blackoutToggle) this.dom.blackoutToggle.checked = !!this.appSettings.isBlackoutFeatureEnabled;
        if (this.dom.blackoutGesturesToggle) this.dom.blackoutGesturesToggle.checked = !!this.appSettings.isBlackoutGesturesEnabled;
        if (this.dom.practiceMode) this.dom.practiceMode.checked = !!this.appSettings.isPracticeModeEnabled;

        // New Header Toggles
        if (this.dom.timerToggle) this.dom.timerToggle.checked = !!this.appSettings.showTimer;
        if (this.dom.counterToggle) this.dom.counterToggle.checked = !!this.appSettings.showCounter;

        if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
        if (this.dom.seqSize) this.dom.seqSize.value = (this.appSettings.uiScaleMultiplier * 100) || 100;
        
        // Font Size UI
        if (this.dom.seqFontSize) this.dom.seqFontSize.value = (this.appSettings.uiFontSizeMultiplier * 100) || 100;

        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode;
        if (this.dom.autoInput) this.dom.autoInput.value = this.appSettings.autoInputMode || 'none';
        
        if (this.dom.quickLang) this.dom.quickLang.value = this.appSettings.generalLanguage || 'en';
        if (this.dom.generalLang) this.dom.generalLang.value = this.appSettings.generalLanguage || 'en';
        
        // Voice
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
        if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.voicePitch;
        if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.voiceRate;
        if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.voiceVolume;

        this.generatePrompt();
        this.updateHeaderVisibility();
    }

    generatePrompt() {
        const s = this.appSettings.runtimeSettings;
        let text = `Game: ${s.currentInput === 'piano' ? 'Piano' : (s.currentInput==='key12'?'12-Key':'9-Key')}, ${s.currentMode==='simon'?'Simon Says':'Unique Rounds'}.\n`;
        text += `Setup: ${s.machineCount} Machine${s.machineCount>1?'s':''}, Length ${s.sequenceLength}.\n`;
        text += `Speed: ${this.appSettings.playbackSpeed}x. `;
        if (s.currentMode === 'simon') text += `Chunk: ${s.simonChunkSize}, Delay: ${s.simonInterSequenceDelay/1000}s.`;
        if (this.dom.promptDisplay) this.dom.promptDisplay.textContent = text;
    }

    openSettings() { if (this.dom.settingsModal) { this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); this.updateUIFromSettings(); } }
    closeSettings() { if (this.dom.settingsModal) { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); } }
    openSetup() { if (this.dom.setupModal) { this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90'); } }
    closeSetup() { if (this.dom.setupModal) { this.dom.setupModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.add('scale-90'); } }
    openHelp() { if (this.dom.helpModal) { this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); } }
    closeHelp() { if (this.dom.helpModal) { this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none'); } }
}
