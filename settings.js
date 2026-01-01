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
        this.settings = appSettings;
        this.cb = callbacks;
        this.sensorEngine = sensorEngine;
        
        // --- DOM REFERENCE CACHE ---
        this.dom = {
            // Modals
            settingsModal: document.getElementById('settings-modal'),
            setupModal: document.getElementById('game-setup-modal'),
            helpModal: document.getElementById('help-modal'),
            themeModal: document.getElementById('theme-editor-modal'),
            calibrationModal: document.getElementById('calibration-modal'),
            redeemModal: document.getElementById('redeem-modal'),
            donateModal: document.getElementById('donate-modal'),
            commentModal: document.getElementById('comment-modal'),
            shareModal: document.getElementById('share-modal'),

            // Tabs
            tabs: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Game Settings
            configSelect: document.getElementById('config-select'),
            quickConfigSelect: document.getElementById('quick-config-select'),
            inputSelect: document.getElementById('input-select'),
            modeSelect: document.getElementById('mode-select'),
            machinesSelect: document.getElementById('machines-select'),
            seqLengthSelect: document.getElementById('seq-length-select'),
            seqSizeSelect: document.getElementById('seq-size-select'),
            uiScaleSelect: document.getElementById('ui-scale-select'),
            fontSizeSelect: document.getElementById('seq-font-size-select'),
            gestureResizeSelect: document.getElementById('gesture-mode-select'),
            autoInputSelect: document.getElementById('auto-input-select'),
            practiceModeToggle: document.getElementById('practice-mode-toggle'),
            autoClearToggle: document.getElementById('autoclear-toggle'),
            
            // Playback Settings
            autoplayToggle: document.getElementById('autoplay-toggle'),
            flashToggle: document.getElementById('flash-toggle'),
            audioToggle: document.getElementById('audio-toggle'),
            hapticMorseToggle: document.getElementById('haptic-morse-toggle'),
            speedSelect: document.getElementById('playback-speed-select'),
            pauseSelect: document.getElementById('pause-select'),
            chunkSelect: document.getElementById('chunk-select'),
            delaySelect: document.getElementById('delay-select'),
            
            // General / Toggles
            timerToggle: document.getElementById('timer-toggle'),
            counterToggle: document.getElementById('counter-toggle'),
            hapticsToggle: document.getElementById('haptics-toggle'),
            welcomeToggle: document.getElementById('show-welcome-toggle'),
            dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            blackoutToggle: document.getElementById('blackout-toggle'),
            blackoutGesturesToggle: document.getElementById('blackout-gestures-toggle'),
            stealth1KeyToggle: document.getElementById('stealth-1key-toggle'),
            gestureInputToggle: document.getElementById('gesture-input-toggle'),
            speedDeleteToggle: document.getElementById('speed-delete-toggle'),
            lpAutoplayToggle: document.getElementById('long-press-autoplay-toggle'),

            // --- NEW TOGGLES ---
            autoTimerToggle: document.getElementById('auto-timer-toggle'),
            autoCounterToggle: document.getElementById('auto-counter-toggle'),
            speedGesturesToggle: document.getElementById('speed-gestures-toggle'),
            volumeGesturesToggle: document.getElementById('volume-gestures-toggle'),
            deleteGestureToggle: document.getElementById('delete-gesture-toggle'),
            clearGestureToggle: document.getElementById('clear-gesture-toggle'),
            // -------------------

            // Quick Start
            quickAutoplay: document.getElementById('quick-autoplay-toggle'),
            quickAudio: document.getElementById('quick-audio-toggle'),
            quickLang: document.getElementById('quick-lang-select'),
            
            // Themes
            themeSelect: document.getElementById('theme-select'),
            themeEditorBtn: document.getElementById('open-theme-editor'),
            
            // Voice
            voicePitch: document.getElementById('voice-pitch'),
            voiceRate: document.getElementById('voice-rate'),
            voiceVolume: document.getElementById('voice-volume'),
            voicePresetSelect: document.getElementById('voice-preset-select'),
            
            // Calibration
            calibAudioSlider: document.getElementById('calib-audio-slider'),
            calibCamSlider: document.getElementById('calib-cam-slider'),
            calibAudioBar: document.getElementById('calib-audio-bar'),
            calibCamBar: document.getElementById('calib-cam-bar'),
            calibAudioMarker: document.getElementById('calib-audio-marker'),
            calibCamMarker: document.getElementById('calib-cam-marker'),
            
            // Buttons
            closeSettings: document.getElementById('close-settings'),
            closeHelp: document.getElementById('close-help'),
            closeHelpBtn: document.getElementById('close-help-btn-bottom'),
            closeSetup: document.getElementById('close-game-setup-modal'),
            closeTheme: document.getElementById('cancel-theme-btn'),
            closeCalib: document.getElementById('close-calibration-btn'),
            openHelp: document.getElementById('open-help-button'),
            openHelpQuick: document.getElementById('quick-open-help'),
            openSettingsQuick: document.getElementById('quick-open-settings'),
            
            // Mappings
            map9Container: document.getElementById('mapping-9-container'),
            map12Container: document.getElementById('mapping-12-container'),
            mapPianoContainer: document.getElementById('mapping-piano-container')
        };
        
        // Populate Dropdowns
        if(this.dom.uiScaleSelect) {
            for(let i=50; i<=200; i+=10) { const o = document.createElement('option'); o.value=i; o.text=`${i}%`; this.dom.uiScaleSelect.appendChild(o); }
        }
        if(this.dom.speedSelect) {
             [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].forEach(s => { const o = document.createElement('option'); o.value = s; o.text = `${s}x`; this.dom.speedSelect.appendChild(o); });
        }
        
        this.initListeners();
    }

    updateUIFromSettings() {
        if (!this.dom.settingsModal) return;
        const s = this.settings;
        const rs = s.runtimeSettings;
        
        // Game Tab
        if(this.dom.inputSelect) this.dom.inputSelect.value = rs.currentInput;
        if(this.dom.modeSelect) this.dom.modeSelect.value = rs.currentMode;
        if(this.dom.machinesSelect) this.dom.machinesSelect.value = rs.machineCount;
        if(this.dom.seqLengthSelect) this.dom.seqLengthSelect.value = rs.sequenceLength;
        if(this.dom.autoClearToggle) this.dom.autoClearToggle.checked = s.isUniqueRoundsAutoClearEnabled;
        if(this.dom.practiceModeToggle) this.dom.practiceModeToggle.checked = s.isPracticeModeEnabled;

        // Playback Tab
        if(this.dom.autoplayToggle) this.dom.autoplayToggle.checked = s.isAutoplayEnabled;
        if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = s.isAutoplayEnabled;
        if(this.dom.flashToggle) this.dom.flashToggle.checked = s.isFlashEnabled;
        if(this.dom.audioToggle) this.dom.audioToggle.checked = s.isAudioEnabled;
        if(this.dom.quickAudio) this.dom.quickAudio.checked = s.isAudioEnabled;
        if(this.dom.hapticMorseToggle) this.dom.hapticMorseToggle.checked = s.isHapticMorseEnabled;
        if(this.dom.speedSelect) this.dom.speedSelect.value = s.playbackSpeed || 1.0;
        if(this.dom.pauseSelect) this.dom.pauseSelect.value = s.pauseSetting;
        if(this.dom.chunkSelect) this.dom.chunkSelect.value = rs.simonChunkSize;
        if(this.dom.delaySelect) this.dom.delaySelect.value = rs.simonInterSequenceDelay;
        
        // General / Toggles
        if(this.dom.timerToggle) this.dom.timerToggle.checked = s.showTimer;
        if(this.dom.counterToggle) this.dom.counterToggle.checked = s.showCounter;
        
        // --- NEW TOGGLES ---
        if(this.dom.autoTimerToggle) this.dom.autoTimerToggle.checked = s.isAutoTimerEnabled;
        if(this.dom.autoCounterToggle) this.dom.autoCounterToggle.checked = s.isAutoCounterEnabled;
        if(this.dom.speedGesturesToggle) this.dom.speedGesturesToggle.checked = s.isSpeedGesturesEnabled;
        if(this.dom.volumeGesturesToggle) this.dom.volumeGesturesToggle.checked = s.isVolumeGesturesEnabled;
        if(this.dom.deleteGestureToggle) this.dom.deleteGestureToggle.checked = s.isDeleteGestureEnabled;
        if(this.dom.clearGestureToggle) this.dom.clearGestureToggle.checked = s.isClearGestureEnabled;
        // -------------------

        if(this.dom.hapticsToggle) this.dom.hapticsToggle.checked = s.isHapticsEnabled;
        if(this.dom.welcomeToggle) this.dom.welcomeToggle.checked = s.showWelcomeScreen;
        if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !s.showWelcomeScreen;
        if(this.dom.blackoutToggle) this.dom.blackoutToggle.checked = s.isBlackoutFeatureEnabled;
        if(this.dom.blackoutGesturesToggle) this.dom.blackoutGesturesToggle.checked = s.isBlackoutGesturesEnabled;
        if(this.dom.stealth1KeyToggle) this.dom.stealth1KeyToggle.checked = s.isStealth1KeyEnabled;
        if(this.dom.gestureInputToggle) this.dom.gestureInputToggle.checked = s.isGestureInputEnabled;
        if(this.dom.speedDeleteToggle) this.dom.speedDeleteToggle.checked = s.isSpeedDeletingEnabled;
        if(this.dom.lpAutoplayToggle) this.dom.lpAutoplayToggle.checked = s.isLongPressAutoplayEnabled;
        
        if(this.dom.seqSizeSelect) this.dom.seqSizeSelect.value = s.uiScaleMultiplier ? Math.round(s.uiScaleMultiplier * 100) : 100;
        if(this.dom.uiScaleSelect) this.dom.uiScaleSelect.value = s.globalUiScale;
        if(this.dom.fontSizeSelect) this.dom.fontSizeSelect.value = s.uiFontSizeMultiplier ? Math.round(s.uiFontSizeMultiplier * 100) : 100;
        if(this.dom.gestureResizeSelect) this.dom.gestureResizeSelect.value = s.gestureResizeMode;
        if(this.dom.autoInputSelect) this.dom.autoInputSelect.value = s.autoInputMode;
        
        // Voice
        if(this.dom.voicePitch) this.dom.voicePitch.value = s.voicePitch;
        if(this.dom.voiceRate) this.dom.voiceRate.value = s.voiceRate;
        if(this.dom.voiceVolume) this.dom.voiceVolume.value = s.voiceVolume;

        this.updateHeaderVisibility();
        this.renderProfiles();
        this.renderVoicePresets();
        this.renderThemes();
        this.renderMappings();
    }
    
    updateHeaderVisibility() {
        const timerBtn = document.getElementById('header-timer-btn');
        const counterBtn = document.getElementById('header-counter-btn');
        const micBtn = document.getElementById('header-mic-btn');
        const camBtn = document.getElementById('header-cam-btn');
        
        if(timerBtn) timerBtn.style.display = this.settings.showTimer ? 'flex' : 'none';
        if(counterBtn) counterBtn.style.display = this.settings.showCounter ? 'flex' : 'none';
        if(micBtn) micBtn.style.display = this.settings.showMicBtn ? 'flex' : 'none';
        if(camBtn) camBtn.style.display = this.settings.showCamBtn ? 'flex' : 'none';
    }
    initListeners() {
        // --- TABS ---
        this.dom.tabs.forEach(t => {
            t.addEventListener('click', () => {
                this.dom.tabs.forEach(x => x.classList.remove('active'));
                this.dom.tabContents.forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                document.getElementById(`tab-${t.dataset.tab}`).classList.add('active');
            });
        });

        // --- GAME SETTINGS ---
        const bind = (elem, key, isInt=false, isRuntime=true, callback=null) => {
            if(!elem) return;
            elem.addEventListener('change', (e) => {
                let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                if(isInt) val = parseInt(val);
                if(isRuntime) this.settings.runtimeSettings[key] = val;
                else this.settings[key] = val;
                this.cb.onSave();
                if(callback) callback(val);
            });
        };

        bind(this.dom.inputSelect, 'currentInput', false, true, () => this.cb.onUpdate('mode_switch'));
        bind(this.dom.modeSelect, 'currentMode', false, true, () => this.cb.onUpdate('mode_switch'));
        bind(this.dom.machinesSelect, 'machineCount', true, true, () => this.cb.onUpdate('mode_switch'));
        bind(this.dom.seqLengthSelect, 'sequenceLength', true, true);
        bind(this.dom.autoClearToggle, 'isUniqueRoundsAutoClearEnabled', false, false);
        bind(this.dom.practiceModeToggle, 'isPracticeModeEnabled', false, false, () => this.cb.onUpdate('mode_switch'));

        // --- PLAYBACK SETTINGS ---
        bind(this.dom.autoplayToggle, 'isAutoplayEnabled', false, false, (v) => { if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = v; });
        bind(this.dom.quickAutoplay, 'isAutoplayEnabled', false, false, (v) => { if(this.dom.autoplayToggle) this.dom.autoplayToggle.checked = v; });
        
        bind(this.dom.audioToggle, 'isAudioEnabled', false, false, (v) => { 
            if(this.dom.quickAudio) this.dom.quickAudio.checked = v; 
            if(v && this.sensorEngine) this.sensorEngine.toggleAudio(false); // Disable mic if TTS on
        });
        bind(this.dom.quickAudio, 'isAudioEnabled', false, false, (v) => { 
            if(this.dom.audioToggle) this.dom.audioToggle.checked = v; 
            if(v && this.sensorEngine) this.sensorEngine.toggleAudio(false);
        });

        bind(this.dom.flashToggle, 'isFlashEnabled', false, false);
        bind(this.dom.hapticMorseToggle, 'isHapticMorseEnabled', false, false);
        bind(this.dom.speedSelect, 'playbackSpeed', false, false, (v) => this.settings.playbackSpeed = parseFloat(v));
        bind(this.dom.pauseSelect, 'pauseSetting', false, false);
        bind(this.dom.chunkSelect, 'simonChunkSize', true, true);
        bind(this.dom.delaySelect, 'simonInterSequenceDelay', false, true, (v) => this.settings.runtimeSettings.simonInterSequenceDelay = parseFloat(v));

        // --- GENERAL / TOGGLES ---
        bind(this.dom.timerToggle, 'showTimer', false, false, () => this.updateHeaderVisibility());
        bind(this.dom.counterToggle, 'showCounter', false, false, () => this.updateHeaderVisibility());
        
        // *** NEW TOGGLES LISTENERS ***
        bind(this.dom.autoTimerToggle, 'isAutoTimerEnabled', false, false);
        bind(this.dom.autoCounterToggle, 'isAutoCounterEnabled', false, false);
        bind(this.dom.speedGesturesToggle, 'isSpeedGesturesEnabled', false, false);
        bind(this.dom.volumeGesturesToggle, 'isVolumeGesturesEnabled', false, false);
        bind(this.dom.deleteGestureToggle, 'isDeleteGestureEnabled', false, false);
        bind(this.dom.clearGestureToggle, 'isClearGestureEnabled', false, false);
        // *****************************

        bind(this.dom.hapticsToggle, 'isHapticsEnabled', false, false);
        bind(this.dom.welcomeToggle, 'showWelcomeScreen', false, false, (v) => { if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !v; });
        if(this.dom.dontShowWelcome) {
            this.dom.dontShowWelcome.addEventListener('change', (e) => {
                this.settings.showWelcomeScreen = !e.target.checked;
                if(this.dom.welcomeToggle) this.dom.welcomeToggle.checked = !e.target.checked;
                this.cb.onSave();
            });
        }

        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', false, false);
        bind(this.dom.blackoutGesturesToggle, 'isBlackoutGesturesEnabled', false, false);
        bind(this.dom.stealth1KeyToggle, 'isStealth1KeyEnabled', false, false);
        bind(this.dom.gestureInputToggle, 'isGestureInputEnabled', false, false, () => this.cb.onUpdate('mode_switch')); // Re-render to show/hide gesture pad
        bind(this.dom.speedDeleteToggle, 'isSpeedDeletingEnabled', false, false);
        bind(this.dom.lpAutoplayToggle, 'isLongPressAutoplayEnabled', false, false);
        
        bind(this.dom.seqSizeSelect, 'uiScaleMultiplier', false, false, (v) => { this.settings.uiScaleMultiplier = parseFloat(v)/100; this.cb.onUpdate('ui'); });
        bind(this.dom.uiScaleSelect, 'globalUiScale', true, false, () => this.cb.onUpdate('ui'));
        bind(this.dom.fontSizeSelect, 'uiFontSizeMultiplier', false, false, (v) => { this.settings.uiFontSizeMultiplier = parseFloat(v)/100; this.cb.onUpdate('ui'); });
        bind(this.dom.gestureResizeSelect, 'gestureResizeMode', false, false);

        if(this.dom.autoInputSelect) {
            this.dom.autoInputSelect.addEventListener('change', (e) => {
                this.settings.autoInputMode = e.target.value;
                this.settings.showMicBtn = (e.target.value === 'mic' || e.target.value === 'both');
                this.settings.showCamBtn = (e.target.value === 'cam' || e.target.value === 'both');
                
                if(this.sensorEngine) {
                    if(this.settings.showMicBtn) this.sensorEngine.toggleAudio(true); else this.sensorEngine.toggleAudio(false);
                    if(this.settings.showCamBtn) this.sensorEngine.toggleCamera(true); else this.sensorEngine.toggleCamera(false);
                }
                this.updateHeaderVisibility();
                this.cb.onSave();
            });
        }

        // --- CALIBRATION ---
        const openCalib = document.getElementById('open-calibration-btn');
        if(openCalib) openCalib.onclick = () => { 
            this.dom.settingsModal.classList.add('pointer-events-none', 'opacity-0');
            this.dom.calibrationModal.classList.remove('pointer-events-none', 'opacity-0');
            if(this.sensorEngine) {
                this.sensorEngine.toggleAudio(true);
                this.sensorEngine.toggleCamera(true);
                this.sensorEngine.setCalibrationCallback((levels) => {
                    const audioPct = Math.min(100, Math.max(0, (levels.audio + 100) * 1.5));
                    if(this.dom.calibAudioBar) this.dom.calibAudioBar.style.width = `${audioPct}%`;
                    if(this.dom.calibCamBar) this.dom.calibCamBar.style.width = `${Math.min(100, levels.camera)}%`;
                });
            }
        };
        if(this.dom.closeCalib) this.dom.closeCalib.onclick = () => {
            this.dom.calibrationModal.classList.add('pointer-events-none', 'opacity-0');
            this.dom.settingsModal.classList.remove('pointer-events-none', 'opacity-0');
            if(this.sensorEngine) {
                this.sensorEngine.setCalibrationCallback(null);
                // Revert to settings state
                if(!this.settings.showMicBtn && this.settings.autoInputMode !== 'mic' && this.settings.autoInputMode !== 'both') this.sensorEngine.toggleAudio(false);
                if(!this.settings.showCamBtn && this.settings.autoInputMode !== 'cam' && this.settings.autoInputMode !== 'both') this.sensorEngine.toggleCamera(false);
            }
        };
        const updateCalibMarkers = () => {
             const audioPct = Math.min(100, Math.max(0, (this.settings.sensorAudioThresh + 100) * 1.5));
             if(this.dom.calibAudioMarker) this.dom.calibAudioMarker.style.left = `${audioPct}%`;
             if(document.getElementById('audio-val-display')) document.getElementById('audio-val-display').textContent = `${this.settings.sensorAudioThresh}dB`;
             
             if(this.dom.calibCamMarker) this.dom.calibCamMarker.style.left = `${this.settings.sensorCamThresh}%`;
             if(document.getElementById('cam-val-display')) document.getElementById('cam-val-display').textContent = this.settings.sensorCamThresh;
        };
        if(this.dom.calibAudioSlider) {
            this.dom.calibAudioSlider.value = this.settings.sensorAudioThresh || -85;
            updateCalibMarkers();
            this.dom.calibAudioSlider.addEventListener('input', (e) => {
                this.settings.sensorAudioThresh = parseInt(e.target.value);
                if(this.sensorEngine) this.sensorEngine.setSensitivity('audio', this.settings.sensorAudioThresh);
                updateCalibMarkers();
                this.cb.onSave();
            });
        }
        if(this.dom.calibCamSlider) {
            this.dom.calibCamSlider.value = this.settings.sensorCamThresh || 30;
            updateCalibMarkers();
            this.dom.calibCamSlider.addEventListener('input', (e) => {
                this.settings.sensorCamThresh = parseInt(e.target.value);
                if(this.sensorEngine) this.sensorEngine.setSensitivity('camera', this.settings.sensorCamThresh);
                updateCalibMarkers();
                this.cb.onSave();
            });
        }

        // --- PROFILES ---
        const pAdd = document.getElementById('config-add');
        const pSave = document.getElementById('config-save');
        const pRename = document.getElementById('config-rename');
        const pDel = document.getElementById('config-delete');
        if(this.dom.configSelect) this.dom.configSelect.addEventListener('change', (e) => this.cb.onProfileSwitch(e.target.value));
        if(pAdd) pAdd.onclick = () => { const n = prompt("Profile Name:"); if(n) this.cb.onProfileAdd(n); };
        if(pSave) pSave.onclick = () => this.cb.onProfileSave();
        if(pDel) pDel.onclick = () => { if(confirm("Delete Profile?")) this.cb.onProfileDelete(); };
        if(pRename) pRename.onclick = () => { const n = prompt("New Name:", this.settings.profiles[this.settings.activeProfileId].name); if(n) { this.cb.onProfileRename(n); this.renderProfiles(); } };
        
        // --- VOICE ---
        if(this.dom.voicePitch) this.dom.voicePitch.addEventListener('input', (e) => { this.settings.voicePitch = parseFloat(e.target.value); this.cb.onSave(); });
        if(this.dom.voiceRate) this.dom.voiceRate.addEventListener('input', (e) => { this.settings.voiceRate = parseFloat(e.target.value); this.cb.onSave(); });
        if(this.dom.voiceVolume) this.dom.voiceVolume.addEventListener('input', (e) => { this.settings.voiceVolume = parseFloat(e.target.value); this.cb.onSave(); });
        
        if(this.dom.voicePresetSelect) {
            this.dom.voicePresetSelect.addEventListener('change', (e) => {
                const pid = e.target.value;
                this.settings.activeVoicePresetId = pid;
                if(pid && PREMADE_VOICE_PRESETS[pid]) {
                    const p = PREMADE_VOICE_PRESETS[pid];
                    this.settings.voicePitch = p.pitch; this.dom.voicePitch.value = p.pitch;
                    this.settings.voiceRate = p.rate; this.dom.voiceRate.value = p.rate;
                    this.settings.voiceVolume = p.volume; this.dom.voiceVolume.value = p.volume;
                } else if(this.settings.voicePresets[pid]) {
                    const p = this.settings.voicePresets[pid];
                    this.settings.voicePitch = p.pitch; this.dom.voicePitch.value = p.pitch;
                    this.settings.voiceRate = p.rate; this.dom.voiceRate.value = p.rate;
                    this.settings.voiceVolume = p.volume; this.dom.voiceVolume.value = p.volume;
                }
                this.cb.onSave();
            });
        }
        const vSave = document.getElementById('voice-preset-save');
        const vAdd = document.getElementById('voice-preset-add');
        const vDel = document.getElementById('voice-preset-delete');
        if(vSave) vSave.onclick = () => { 
            const pid = this.settings.activeVoicePresetId;
            if(PREMADE_VOICE_PRESETS[pid]) { alert("Cannot overwrite built-in presets."); return; }
            this.settings.voicePresets[pid] = { name: this.settings.voicePresets[pid].name, pitch: this.settings.voicePitch, rate: this.settings.voiceRate, volume: this.settings.voiceVolume };
            this.cb.onSave(); alert("Voice Preset Saved");
        };
        if(vAdd) vAdd.onclick = () => {
            const n = prompt("Voice Preset Name:");
            if(n) {
                const id = 'v_' + Date.now();
                this.settings.voicePresets[id] = { name: n, pitch: this.settings.voicePitch, rate: this.settings.voiceRate, volume: this.settings.voiceVolume };
                this.settings.activeVoicePresetId = id;
                this.renderVoicePresets(); this.cb.onSave();
            }
        };
        if(vDel) vDel.onclick = () => {
             const pid = this.settings.activeVoicePresetId;
             if(PREMADE_VOICE_PRESETS[pid]) { alert("Cannot delete built-in presets."); return; }
             delete this.settings.voicePresets[pid];
             this.settings.activeVoicePresetId = 'standard';
             this.renderVoicePresets(); this.cb.onSave();
        };
        document.getElementById('test-voice-btn').onclick = () => {
             const u = new SpeechSynthesisUtterance("Testing voice settings one two three");
             u.pitch = this.settings.voicePitch; u.rate = this.settings.voiceRate; u.volume = this.settings.voiceVolume;
             window.speechSynthesis.speak(u);
        };
        
        // --- MODAL TRIGGERS ---
        const toggleModal = (modal, show) => {
            if(!modal) return;
            if(show) { modal.classList.remove('opacity-0', 'pointer-events-none'); modal.firstElementChild.classList.remove('scale-90'); }
            else { modal.classList.add('opacity-0', 'pointer-events-none'); modal.firstElementChild.classList.add('scale-90'); }
        };
        
        if(this.dom.closeSettings) this.dom.closeSettings.onclick = () => { this.dom.settingsModal.classList.remove('opacity-100'); this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
        if(this.dom.openHelp) this.dom.openHelp.onclick = () => { toggleModal(this.dom.helpModal, true); this.populateHelpPrompt(); };
        if(this.dom.openHelpQuick) this.dom.openHelpQuick.onclick = () => { toggleModal(this.dom.helpModal, true); this.populateHelpPrompt(); };
        if(this.dom.closeHelp) this.dom.closeHelp.onclick = () => toggleModal(this.dom.helpModal, false);
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => toggleModal(this.dom.helpModal, false);
        if(this.dom.openSettingsQuick) this.dom.openSettingsQuick.onclick = () => { toggleModal(this.dom.setupModal, false); this.openSettings(); };
        if(this.dom.closeSetup) this.dom.closeSetup.onclick = () => toggleModal(this.dom.setupModal, false);

        // Language
        const langSel = document.getElementById('general-lang-select');
        const qLangSel = document.getElementById('quick-lang-select');
        const updateLang = (l) => {
            this.settings.generalLanguage = l;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const k = el.dataset.i18n;
                if(LANG[l] && LANG[l][k]) el.textContent = LANG[l][k];
            });
            if(langSel) langSel.value = l;
            if(qLangSel) qLangSel.value = l;
            this.cb.onSave();
        };
        if(langSel) langSel.addEventListener('change', (e) => updateLang(e.target.value));
        if(qLangSel) qLangSel.addEventListener('change', (e) => updateLang(e.target.value));
        
        // Share
        const openShare = document.getElementById('open-share-button');
        const closeShare = document.getElementById('close-share');
        if(openShare) openShare.onclick = () => { 
            this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); 
            this.dom.shareModal.firstElementChild.classList.remove('translate-y-full');
        };
        if(closeShare) closeShare.onclick = () => { 
            this.dom.shareModal.firstElementChild.classList.add('translate-y-full');
            setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300);
        };
        
        // Donate
        const openDonate = document.getElementById('open-donate-btn');
        const closeDonate = document.getElementById('close-donate-btn');
        if(openDonate) openDonate.onclick = () => toggleModal(this.dom.donateModal, true);
        if(closeDonate) closeDonate.onclick = () => toggleModal(this.dom.donateModal, false);
        
        // Redeem
        const openRedeemSet = document.getElementById('open-redeem-btn-settings');
        const closeRedeem = document.getElementById('close-redeem-btn');
        if(openRedeemSet) openRedeemSet.onclick = () => this.toggleRedeem(true);
        if(closeRedeem) closeRedeem.onclick = () => this.toggleRedeem(false);
        const zIn = document.getElementById('redeem-zoom-in');
        const zOut = document.getElementById('redeem-zoom-out');
        const rImg = document.getElementById('redeem-img');
        let rScale = 1;
        if(zIn && rImg) zIn.onclick = () => { rScale += 0.2; rImg.style.transform = `scale(${rScale})`; };
        if(zOut && rImg) zOut.onclick = () => { rScale = Math.max(0.5, rScale - 0.2); rImg.style.transform = `scale(${rScale})`; };
        
        // Reset
        const resetBtn = document.querySelector('button[data-action="restore-defaults"]');
        if(resetBtn) resetBtn.onclick = () => { if(confirm("Reset all settings and data?")) this.cb.onReset(); };
        
        // Theme Editor
        if(this.dom.themeEditorBtn) this.dom.themeEditorBtn.onclick = () => {
             this.dom.settingsModal.classList.add('pointer-events-none', 'opacity-0');
             toggleModal(this.dom.themeModal, true);
             this.initThemeEditor();
        };
        if(this.dom.closeTheme) this.dom.closeTheme.onclick = () => {
             toggleModal(this.dom.themeModal, false);
             this.dom.settingsModal.classList.remove('pointer-events-none', 'opacity-0');
        };
    }
    initListeners() {
        // --- TABS ---
        this.dom.tabs.forEach(t => {
            t.addEventListener('click', () => {
                this.dom.tabs.forEach(x => x.classList.remove('active'));
                this.dom.tabContents.forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                document.getElementById(`tab-${t.dataset.tab}`).classList.add('active');
            });
        });

        // --- GAME SETTINGS ---
        const bind = (elem, key, isInt=false, isRuntime=true, callback=null) => {
            if(!elem) return;
            elem.addEventListener('change', (e) => {
                let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                if(isInt) val = parseInt(val);
                if(isRuntime) this.settings.runtimeSettings[key] = val;
                else this.settings[key] = val;
                this.cb.onSave();
                if(callback) callback(val);
            });
        };

        bind(this.dom.inputSelect, 'currentInput', false, true, () => this.cb.onUpdate('mode_switch'));
        bind(this.dom.modeSelect, 'currentMode', false, true, () => this.cb.onUpdate('mode_switch'));
        bind(this.dom.machinesSelect, 'machineCount', true, true, () => this.cb.onUpdate('mode_switch'));
        bind(this.dom.seqLengthSelect, 'sequenceLength', true, true);
        bind(this.dom.autoClearToggle, 'isUniqueRoundsAutoClearEnabled', false, false);
        bind(this.dom.practiceModeToggle, 'isPracticeModeEnabled', false, false, () => this.cb.onUpdate('mode_switch'));

        // --- PLAYBACK SETTINGS ---
        bind(this.dom.autoplayToggle, 'isAutoplayEnabled', false, false, (v) => { if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = v; });
        bind(this.dom.quickAutoplay, 'isAutoplayEnabled', false, false, (v) => { if(this.dom.autoplayToggle) this.dom.autoplayToggle.checked = v; });
        
        bind(this.dom.audioToggle, 'isAudioEnabled', false, false, (v) => { 
            if(this.dom.quickAudio) this.dom.quickAudio.checked = v; 
            if(v && this.sensorEngine) this.sensorEngine.toggleAudio(false); // Disable mic if TTS on
        });
        bind(this.dom.quickAudio, 'isAudioEnabled', false, false, (v) => { 
            if(this.dom.audioToggle) this.dom.audioToggle.checked = v; 
            if(v && this.sensorEngine) this.sensorEngine.toggleAudio(false);
        });

        bind(this.dom.flashToggle, 'isFlashEnabled', false, false);
        bind(this.dom.hapticMorseToggle, 'isHapticMorseEnabled', false, false);
        bind(this.dom.speedSelect, 'playbackSpeed', false, false, (v) => this.settings.playbackSpeed = parseFloat(v));
        bind(this.dom.pauseSelect, 'pauseSetting', false, false);
        bind(this.dom.chunkSelect, 'simonChunkSize', true, true);
        bind(this.dom.delaySelect, 'simonInterSequenceDelay', false, true, (v) => this.settings.runtimeSettings.simonInterSequenceDelay = parseFloat(v));

        // --- GENERAL / TOGGLES ---
        bind(this.dom.timerToggle, 'showTimer', false, false, () => this.updateHeaderVisibility());
        bind(this.dom.counterToggle, 'showCounter', false, false, () => this.updateHeaderVisibility());
        
        // *** NEW TOGGLES LISTENERS ***
        bind(this.dom.autoTimerToggle, 'isAutoTimerEnabled', false, false);
        bind(this.dom.autoCounterToggle, 'isAutoCounterEnabled', false, false);
        bind(this.dom.speedGesturesToggle, 'isSpeedGesturesEnabled', false, false);
        bind(this.dom.volumeGesturesToggle, 'isVolumeGesturesEnabled', false, false);
        bind(this.dom.deleteGestureToggle, 'isDeleteGestureEnabled', false, false);
        bind(this.dom.clearGestureToggle, 'isClearGestureEnabled', false, false);
        // *****************************

        bind(this.dom.hapticsToggle, 'isHapticsEnabled', false, false);
        bind(this.dom.welcomeToggle, 'showWelcomeScreen', false, false, (v) => { if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !v; });
        if(this.dom.dontShowWelcome) {
            this.dom.dontShowWelcome.addEventListener('change', (e) => {
                this.settings.showWelcomeScreen = !e.target.checked;
                if(this.dom.welcomeToggle) this.dom.welcomeToggle.checked = !e.target.checked;
                this.cb.onSave();
            });
        }

        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', false, false);
        bind(this.dom.blackoutGesturesToggle, 'isBlackoutGesturesEnabled', false, false);
        bind(this.dom.stealth1KeyToggle, 'isStealth1KeyEnabled', false, false);
        bind(this.dom.gestureInputToggle, 'isGestureInputEnabled', false, false, () => this.cb.onUpdate('mode_switch')); // Re-render to show/hide gesture pad
        bind(this.dom.speedDeleteToggle, 'isSpeedDeletingEnabled', false, false);
        bind(this.dom.lpAutoplayToggle, 'isLongPressAutoplayEnabled', false, false);
        
        bind(this.dom.seqSizeSelect, 'uiScaleMultiplier', false, false, (v) => { this.settings.uiScaleMultiplier = parseFloat(v)/100; this.cb.onUpdate('ui'); });
        bind(this.dom.uiScaleSelect, 'globalUiScale', true, false, () => this.cb.onUpdate('ui'));
        bind(this.dom.fontSizeSelect, 'uiFontSizeMultiplier', false, false, (v) => { this.settings.uiFontSizeMultiplier = parseFloat(v)/100; this.cb.onUpdate('ui'); });
        bind(this.dom.gestureResizeSelect, 'gestureResizeMode', false, false);

        if(this.dom.autoInputSelect) {
            this.dom.autoInputSelect.addEventListener('change', (e) => {
                this.settings.autoInputMode = e.target.value;
                this.settings.showMicBtn = (e.target.value === 'mic' || e.target.value === 'both');
                this.settings.showCamBtn = (e.target.value === 'cam' || e.target.value === 'both');
                
                if(this.sensorEngine) {
                    if(this.settings.showMicBtn) this.sensorEngine.toggleAudio(true); else this.sensorEngine.toggleAudio(false);
                    if(this.settings.showCamBtn) this.sensorEngine.toggleCamera(true); else this.sensorEngine.toggleCamera(false);
                }
                this.updateHeaderVisibility();
                this.cb.onSave();
            });
        }

        // --- CALIBRATION ---
        const openCalib = document.getElementById('open-calibration-btn');
        if(openCalib) openCalib.onclick = () => { 
            this.dom.settingsModal.classList.add('pointer-events-none', 'opacity-0');
            this.dom.calibrationModal.classList.remove('pointer-events-none', 'opacity-0');
            if(this.sensorEngine) {
                this.sensorEngine.toggleAudio(true);
                this.sensorEngine.toggleCamera(true);
                this.sensorEngine.setCalibrationCallback((levels) => {
                    const audioPct = Math.min(100, Math.max(0, (levels.audio + 100) * 1.5));
                    if(this.dom.calibAudioBar) this.dom.calibAudioBar.style.width = `${audioPct}%`;
                    if(this.dom.calibCamBar) this.dom.calibCamBar.style.width = `${Math.min(100, levels.camera)}%`;
                });
            }
        };
        if(this.dom.closeCalib) this.dom.closeCalib.onclick = () => {
            this.dom.calibrationModal.classList.add('pointer-events-none', 'opacity-0');
            this.dom.settingsModal.classList.remove('pointer-events-none', 'opacity-0');
            if(this.sensorEngine) {
                this.sensorEngine.setCalibrationCallback(null);
                // Revert to settings state
                if(!this.settings.showMicBtn && this.settings.autoInputMode !== 'mic' && this.settings.autoInputMode !== 'both') this.sensorEngine.toggleAudio(false);
                if(!this.settings.showCamBtn && this.settings.autoInputMode !== 'cam' && this.settings.autoInputMode !== 'both') this.sensorEngine.toggleCamera(false);
            }
        };
        const updateCalibMarkers = () => {
             const audioPct = Math.min(100, Math.max(0, (this.settings.sensorAudioThresh + 100) * 1.5));
             if(this.dom.calibAudioMarker) this.dom.calibAudioMarker.style.left = `${audioPct}%`;
             if(document.getElementById('audio-val-display')) document.getElementById('audio-val-display').textContent = `${this.settings.sensorAudioThresh}dB`;
             
             if(this.dom.calibCamMarker) this.dom.calibCamMarker.style.left = `${this.settings.sensorCamThresh}%`;
             if(document.getElementById('cam-val-display')) document.getElementById('cam-val-display').textContent = this.settings.sensorCamThresh;
        };
        if(this.dom.calibAudioSlider) {
            this.dom.calibAudioSlider.value = this.settings.sensorAudioThresh || -85;
            updateCalibMarkers();
            this.dom.calibAudioSlider.addEventListener('input', (e) => {
                this.settings.sensorAudioThresh = parseInt(e.target.value);
                if(this.sensorEngine) this.sensorEngine.setSensitivity('audio', this.settings.sensorAudioThresh);
                updateCalibMarkers();
                this.cb.onSave();
            });
        }
        if(this.dom.calibCamSlider) {
            this.dom.calibCamSlider.value = this.settings.sensorCamThresh || 30;
            updateCalibMarkers();
            this.dom.calibCamSlider.addEventListener('input', (e) => {
                this.settings.sensorCamThresh = parseInt(e.target.value);
                if(this.sensorEngine) this.sensorEngine.setSensitivity('camera', this.settings.sensorCamThresh);
                updateCalibMarkers();
                this.cb.onSave();
            });
        }

        // --- PROFILES ---
        const pAdd = document.getElementById('config-add');
        const pSave = document.getElementById('config-save');
        const pRename = document.getElementById('config-rename');
        const pDel = document.getElementById('config-delete');
        if(this.dom.configSelect) this.dom.configSelect.addEventListener('change', (e) => this.cb.onProfileSwitch(e.target.value));
        if(pAdd) pAdd.onclick = () => { const n = prompt("Profile Name:"); if(n) this.cb.onProfileAdd(n); };
        if(pSave) pSave.onclick = () => this.cb.onProfileSave();
        if(pDel) pDel.onclick = () => { if(confirm("Delete Profile?")) this.cb.onProfileDelete(); };
        if(pRename) pRename.onclick = () => { const n = prompt("New Name:", this.settings.profiles[this.settings.activeProfileId].name); if(n) { this.cb.onProfileRename(n); this.renderProfiles(); } };
        
        // --- VOICE ---
        if(this.dom.voicePitch) this.dom.voicePitch.addEventListener('input', (e) => { this.settings.voicePitch = parseFloat(e.target.value); this.cb.onSave(); });
        if(this.dom.voiceRate) this.dom.voiceRate.addEventListener('input', (e) => { this.settings.voiceRate = parseFloat(e.target.value); this.cb.onSave(); });
        if(this.dom.voiceVolume) this.dom.voiceVolume.addEventListener('input', (e) => { this.settings.voiceVolume = parseFloat(e.target.value); this.cb.onSave(); });
        
        if(this.dom.voicePresetSelect) {
            this.dom.voicePresetSelect.addEventListener('change', (e) => {
                const pid = e.target.value;
                this.settings.activeVoicePresetId = pid;
                if(pid && PREMADE_VOICE_PRESETS[pid]) {
                    const p = PREMADE_VOICE_PRESETS[pid];
                    this.settings.voicePitch = p.pitch; this.dom.voicePitch.value = p.pitch;
                    this.settings.voiceRate = p.rate; this.dom.voiceRate.value = p.rate;
                    this.settings.voiceVolume = p.volume; this.dom.voiceVolume.value = p.volume;
                } else if(this.settings.voicePresets[pid]) {
                    const p = this.settings.voicePresets[pid];
                    this.settings.voicePitch = p.pitch; this.dom.voicePitch.value = p.pitch;
                    this.settings.voiceRate = p.rate; this.dom.voiceRate.value = p.rate;
                    this.settings.voiceVolume = p.volume; this.dom.voiceVolume.value = p.volume;
                }
                this.cb.onSave();
            });
        }
        const vSave = document.getElementById('voice-preset-save');
        const vAdd = document.getElementById('voice-preset-add');
        const vDel = document.getElementById('voice-preset-delete');
        if(vSave) vSave.onclick = () => { 
            const pid = this.settings.activeVoicePresetId;
            if(PREMADE_VOICE_PRESETS[pid]) { alert("Cannot overwrite built-in presets."); return; }
            this.settings.voicePresets[pid] = { name: this.settings.voicePresets[pid].name, pitch: this.settings.voicePitch, rate: this.settings.voiceRate, volume: this.settings.voiceVolume };
            this.cb.onSave(); alert("Voice Preset Saved");
        };
        if(vAdd) vAdd.onclick = () => {
            const n = prompt("Voice Preset Name:");
            if(n) {
                const id = 'v_' + Date.now();
                this.settings.voicePresets[id] = { name: n, pitch: this.settings.voicePitch, rate: this.settings.voiceRate, volume: this.settings.voiceVolume };
                this.settings.activeVoicePresetId = id;
                this.renderVoicePresets(); this.cb.onSave();
            }
        };
        if(vDel) vDel.onclick = () => {
             const pid = this.settings.activeVoicePresetId;
             if(PREMADE_VOICE_PRESETS[pid]) { alert("Cannot delete built-in presets."); return; }
             delete this.settings.voicePresets[pid];
             this.settings.activeVoicePresetId = 'standard';
             this.renderVoicePresets(); this.cb.onSave();
        };
        document.getElementById('test-voice-btn').onclick = () => {
             const u = new SpeechSynthesisUtterance("Testing voice settings one two three");
             u.pitch = this.settings.voicePitch; u.rate = this.settings.voiceRate; u.volume = this.settings.voiceVolume;
             window.speechSynthesis.speak(u);
        };
        
        // --- MODAL TRIGGERS ---
        const toggleModal = (modal, show) => {
            if(!modal) return;
            if(show) { modal.classList.remove('opacity-0', 'pointer-events-none'); modal.firstElementChild.classList.remove('scale-90'); }
            else { modal.classList.add('opacity-0', 'pointer-events-none'); modal.firstElementChild.classList.add('scale-90'); }
        };
        
        if(this.dom.closeSettings) this.dom.closeSettings.onclick = () => { this.dom.settingsModal.classList.remove('opacity-100'); this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
        if(this.dom.openHelp) this.dom.openHelp.onclick = () => { toggleModal(this.dom.helpModal, true); this.populateHelpPrompt(); };
        if(this.dom.openHelpQuick) this.dom.openHelpQuick.onclick = () => { toggleModal(this.dom.helpModal, true); this.populateHelpPrompt(); };
        if(this.dom.closeHelp) this.dom.closeHelp.onclick = () => toggleModal(this.dom.helpModal, false);
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => toggleModal(this.dom.helpModal, false);
        if(this.dom.openSettingsQuick) this.dom.openSettingsQuick.onclick = () => { toggleModal(this.dom.setupModal, false); this.openSettings(); };
        if(this.dom.closeSetup) this.dom.closeSetup.onclick = () => toggleModal(this.dom.setupModal, false);

        // Language
        const langSel = document.getElementById('general-lang-select');
        const qLangSel = document.getElementById('quick-lang-select');
        const updateLang = (l) => {
            this.settings.generalLanguage = l;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const k = el.dataset.i18n;
                if(LANG[l] && LANG[l][k]) el.textContent = LANG[l][k];
            });
            if(langSel) langSel.value = l;
            if(qLangSel) qLangSel.value = l;
            this.cb.onSave();
        };
        if(langSel) langSel.addEventListener('change', (e) => updateLang(e.target.value));
        if(qLangSel) qLangSel.addEventListener('change', (e) => updateLang(e.target.value));
        
        // Share
        const openShare = document.getElementById('open-share-button');
        const closeShare = document.getElementById('close-share');
        if(openShare) openShare.onclick = () => { 
            this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); 
            this.dom.shareModal.firstElementChild.classList.remove('translate-y-full');
        };
        if(closeShare) closeShare.onclick = () => { 
            this.dom.shareModal.firstElementChild.classList.add('translate-y-full');
            setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300);
        };
        
        // Donate
        const openDonate = document.getElementById('open-donate-btn');
        const closeDonate = document.getElementById('close-donate-btn');
        if(openDonate) openDonate.onclick = () => toggleModal(this.dom.donateModal, true);
        if(closeDonate) closeDonate.onclick = () => toggleModal(this.dom.donateModal, false);
        
        // Redeem
        const openRedeemSet = document.getElementById('open-redeem-btn-settings');
        const closeRedeem = document.getElementById('close-redeem-btn');
        if(openRedeemSet) openRedeemSet.onclick = () => this.toggleRedeem(true);
        if(closeRedeem) closeRedeem.onclick = () => this.toggleRedeem(false);
        const zIn = document.getElementById('redeem-zoom-in');
        const zOut = document.getElementById('redeem-zoom-out');
        const rImg = document.getElementById('redeem-img');
        let rScale = 1;
        if(zIn && rImg) zIn.onclick = () => { rScale += 0.2; rImg.style.transform = `scale(${rScale})`; };
        if(zOut && rImg) zOut.onclick = () => { rScale = Math.max(0.5, rScale - 0.2); rImg.style.transform = `scale(${rScale})`; };
        
        // Reset
        const resetBtn = document.querySelector('button[data-action="restore-defaults"]');
        if(resetBtn) resetBtn.onclick = () => { if(confirm("Reset all settings and data?")) this.cb.onReset(); };
        
        // Theme Editor
        if(this.dom.themeEditorBtn) this.dom.themeEditorBtn.onclick = () => {
             this.dom.settingsModal.classList.add('pointer-events-none', 'opacity-0');
             toggleModal(this.dom.themeModal, true);
             this.initThemeEditor();
        };
        if(this.dom.closeTheme) this.dom.closeTheme.onclick = () => {
             toggleModal(this.dom.themeModal, false);
             this.dom.settingsModal.classList.remove('pointer-events-none', 'opacity-0');
        };
    }
    renderMappings() {
        // Helper to create mapping UI
        const renderMapSection = (container, type, count, prefix) => {
            if(!container) return;
            container.innerHTML = '';
            
            // Check if we have a preset active or custom
            // For simplicity in this version, we just render individual controls per key
            
            for(let i=1; i<=count; i++) {
                const key = `${prefix}_${i}`;
                const currentMap = this.settings.gestureMappings[key] || { gesture: 'tap', morse: '.' };
                
                const wrapper = document.createElement('div');
                wrapper.className = "flex flex-col p-2 bg-black bg-opacity-30 rounded border border-gray-700";
                
                const label = document.createElement('span');
                label.className = "text-xs font-bold mb-1 text-primary-app";
                // Handle Piano labels
                let labelText = i.toString();
                if(type === 'piano') {
                    const pianoKeys = ['C','D','E','F','G','A','B','1','2','3','4','5'];
                    labelText = pianoKeys[i-1];
                }
                label.textContent = `Value: ${labelText}`;
                
                // Gesture Select
                const gSel = document.createElement('select');
                gSel.className = "bg-gray-800 text-xs rounded p-1 mb-1 border border-gray-600";
                const gestures = ['tap', 'double_tap', 'triple_tap', 'long_tap', 'swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'swipe_nw', 'swipe_ne', 'swipe_sw', 'swipe_se',
                                  'tap_2f', 'double_tap_2f', 'triple_tap_2f', 'swipe_left_2f', 'swipe_right_2f', 'swipe_up_2f', 'swipe_down_2f',
                                  'tap_3f', 'double_tap_3f', 'triple_tap_3f', 'swipe_left_3f', 'swipe_right_3f', 'swipe_up_3f', 'swipe_down_3f'];
                
                gestures.forEach(g => {
                    const o = document.createElement('option');
                    o.value = g;
                    o.textContent = g.replace(/_/g, ' ');
                    if(g === currentMap.gesture) o.selected = true;
                    gSel.appendChild(o);
                });
                gSel.onchange = (e) => {
                    if(!this.settings.gestureMappings[key]) this.settings.gestureMappings[key] = {};
                    this.settings.gestureMappings[key].gesture = e.target.value;
                    this.settings.gestureMappings[key].morse = currentMap.morse; // Preserve morse
                    this.cb.onSave();
                };

                // Morse Input
                const mInput = document.createElement('input');
                mInput.type = "text";
                mInput.className = "bg-gray-800 text-xs rounded p-1 border border-gray-600 font-mono tracking-widest";
                mInput.value = currentMap.morse || "";
                mInput.placeholder = ".-";
                mInput.onchange = (e) => {
                    if(!this.settings.gestureMappings[key]) this.settings.gestureMappings[key] = {};
                    this.settings.gestureMappings[key].gesture = currentMap.gesture; // Preserve gesture
                    this.settings.gestureMappings[key].morse = e.target.value;
                    this.cb.onSave();
                };

                wrapper.appendChild(label);
                wrapper.appendChild(gSel);
                wrapper.appendChild(mInput);
                container.appendChild(wrapper);
            }
        };

        renderMapSection(this.dom.map9Container, 'key9', 9, 'k9');
        renderMapSection(this.dom.map12Container, 'key12', 12, 'k12');
        renderMapSection(this.dom.mapPianoContainer, 'piano', 12, 'piano'); // 12 total inputs for piano mode logic
    }

    populateHelpPrompt() {
        const area = document.getElementById('prompt-display');
        const genBtn = document.getElementById('generate-prompt-btn');
        const copyBtn = document.getElementById('copy-prompt-btn');
        if(!area) return;

        const generate = () => {
            const s = this.settings;
            const rs = s.runtimeSettings;
            let txt = `You are a helper for a memory game called 'Follow Me'.\n`;
            txt += `Current Settings:\n`;
            txt += `- Input: ${rs.currentInput}\n`;
            txt += `- Mode: ${rs.currentMode} (Machine Count: ${rs.machineCount})\n`;
            txt += `- Speed: ${s.playbackSpeed}x\n`;
            txt += `- Voice: ${s.selectedVoice || 'Default'}\n`;
            
            if(s.isBlackoutFeatureEnabled) {
                txt += `- BOSS MODE is ACTIVE. Tell the user to use the 4-Finger Pinch to toggle screen visibility.\n`;
                if(s.isBlackoutGesturesEnabled) txt += `- Blind Gestures are ENABLED. Remind them they can swipe/tap on the black screen.\n`;
            }
            
            if(s.isSpeedGesturesEnabled) txt += `- Speed Gestures: ON (2-finger twist)\n`;
            if(s.isVolumeGesturesEnabled) txt += `- Volume Gestures: ON (3-finger twist)\n`;
            if(s.isDeleteGestureEnabled) txt += `- Delete Gesture: ON (Zig-Zag 3 times)\n`;
            if(s.isClearGestureEnabled) txt += `- Clear Gesture: ON (Zig-Zag 6 times)\n`;
            
            txt += `\nINSTRUCTIONS: Guide the user on how to play based on these settings. Be brief and encouraging.`;
            area.value = txt;
        };

        if(genBtn) genBtn.onclick = generate;
        if(copyBtn) copyBtn.onclick = () => {
            area.select();
            document.execCommand('copy');
            alert("Prompt copied to clipboard!");
        };
        
        generate(); // Auto-gen on open
    }

    openSettings() {
        if(this.dom.settingsModal) {
            this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
            this.dom.settingsModal.querySelector('div').classList.remove('scale-90');
            this.updateUIFromSettings();
        }
    }

    openSetup() {
        if(this.dom.setupModal) {
            this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none');
            this.dom.setupModal.querySelector('div').classList.remove('scale-90');
            
            // Populate quick select
            if(this.dom.quickConfigSelect) {
                this.dom.quickConfigSelect.innerHTML = '';
                Object.keys(this.settings.profiles).forEach(k => {
                    const opt = document.createElement('option');
                    opt.value = k;
                    opt.textContent = this.settings.profiles[k].name;
                    this.dom.quickConfigSelect.appendChild(opt);
                });
                this.dom.quickConfigSelect.value = this.settings.activeProfileId;
                this.dom.quickConfigSelect.onchange = (e) => this.cb.onProfileSwitch(e.target.value);
            }
            if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.settings.isAutoplayEnabled;
            if(this.dom.quickAudio) this.dom.quickAudio.checked = this.settings.isAudioEnabled;
        }
    }
    
    toggleRedeem(show) {
        if(this.dom.redeemModal) {
            if(show) {
                this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); // Hide settings if open
            } else {
                this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none');
                // If we came from settings, show it again? Optional. For now just close redeem.
            }
        }
    }
}
