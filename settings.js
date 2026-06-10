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
const HAND_GESTURES_LIST = [
    'hand_fist',
    'hand_1_up', 'hand_1_down', 'hand_1_left', 'hand_1_right',
    'hand_2_up', 'hand_2_down', 'hand_2_left', 'hand_2_right',
    'hand_3_up', 'hand_3_down', 'hand_3_left', 'hand_3_right',
    'hand_4_up', 'hand_4_down', 'hand_4_left', 'hand_4_right',
    'hand_5_up', 'hand_5_down', 'hand_5_left', 'hand_5_right'
];
    const TOUCH_GESTURES = [
    { value: 'none', label: '🚫 Unassigned' },
    { value: 'tap', label: '👆 Single Tap' },
    { value: 'double_tap', label: '👆👆 Double Taps' }, // Named per your correction
    { value: 'triple_tap', label: '👆👆👆 Triple Tap' },
    { value: 'long_tap', label: '⏱️ Long Press' },
    { value: 'swipe_up', label: '⬆️ Swipe Up' },
    { value: 'swipe_down', label: '⬇️ Swipe Down' },
    { value: 'swipe_left', label: '⬅️ Swipe Left' },
    { value: 'swipe_right', label: '➡️ Swipe Right' }
];

const VISUAL_HAND_GESTURES = [
    { value: 'none', label: '🚫 Unassigned' },
    { value: '105', label: '👌 OK Sign (Pinch)' },
    { value: '104', label: '🤌 Chef Kiss (All)' },
    { value: '100', label: '🤏 Basic Pinch' },
    { value: '16', label: '☝️ 1 Finger (Index)' },
    { value: '24', label: '✌️ 2 Fingers (Peace)' },
    { value: '28', label: '3️⃣ 3 Fingers' },
    { value: '30', label: '4️⃣ 4 Fingers' },
    { value: '62', label: '🖐️ 5 Fingers (Palm)' },
    { value: '0', label: '✊ Fist' },
    { value: '18', label: '🤘 Rock On' },
    { value: '34', label: '🤙 Shaka' },
    { value: '50', label: '🤟 Spider-Man / ILY' },
    { value: '48', label: '🫵 Gun / L-Shape' }
];

const GESTURE_PRESETS = {
    // ================= 9-KEY PROFILES =================
    '9_taps': {
        name: "Taps (Default)",
        type: 'key9',
        map: {
            'k9_1': 'tap', 
            'k9_2': 'double_tap', 
            'k9_3': 'triple_tap',
            'k9_4': 'tap_2f_any', 
            'k9_5': 'double_tap_2f_any', 
            'k9_6': 'triple_tap_2f_any',
            'k9_7': 'tap_3f_any', 
            'k9_8': 'double_tap_3f_any', 
            'k9_9': 'triple_tap_3f_any'
        }
    },
    '9_swipes': {
        name: "Swipes (Directional)",
        type: 'key9',
        map: {
            'k9_1': 'swipe_nw', 'k9_2': 'swipe_up', 'k9_3': 'swipe_ne',
            'k9_4': 'swipe_left', 'k9_5': 'tap', 'k9_6': 'swipe_right',
            'k9_7': 'swipe_sw', 'k9_8': 'swipe_down', 'k9_9': 'swipe_se'
        }
    },
    '9_motion': {
        name: "Spatial Taps (Micro)",
        type: 'key9',
        map: {
            // UPDATED to new ID names
           'k9_1': 'motion_tap_spatial_nw', 'k9_2': 'motion_tap_spatial_up', 'k9_3': 'motion_tap_spatial_ne',
            'k9_4': 'motion_tap_spatial_left', 'k9_5': 'double_tap', 'k9_6': 'motion_tap_spatial_right',
            'k9_7': 'motion_tap_spatial_sw', 'k9_8': 'motion_tap_spatial_down', 'k9_9': 'motion_tap_spatial_se' 
        }
    },
// === 9-KEY HAND ===
    '9_hand_count': {
        name: "Hand Count (Up/Down)",
        type: 'key9',
        map: {
            'k9_1': { hand: 'hand_1_up' },   // 1 Up
            'k9_2': { hand: 'hand_2_up' },   // 2 Up
            'k9_3': { hand: 'hand_3_up' },   // 3 Up
            'k9_4': { hand: 'hand_4_up' },   // 4 Up
            'k9_5': { hand: 'hand_5_up' },   // 5 Up (Palm)
            'k9_6': { hand: 'hand_1_down' }, // 1 Down
            'k9_7': { hand: 'hand_2_down' }, // 2 Down
            'k9_8': { hand: 'hand_3_down' }, // 3 Down
            'k9_9': { hand: 'hand_4_down' }  // 4 Down
        }
    },
    // ================= 12-KEY PROFILES =================
    '12_taps': {
        name: "Taps (Default)",
        type: 'key12',
        map: {
            'k12_1': 'tap', 
            'k12_2': 'double_tap', 
            'k12_3': 'triple_tap', 
            'k12_4': 'long_tap',
            'k12_5': 'tap_2f_any', 
            'k12_6': 'double_tap_2f_any', 
            'k12_7': 'triple_tap_2f_any', 
            'k12_8': 'long_tap_2f_any',
            'k12_9': 'tap_3f_any', 
            'k12_10': 'double_tap_3f_any', 
            'k12_11': 'triple_tap_3f_any', 
            'k12_12': 'long_tap_3f_any'
        }
    },
    '12_swipes': {
        name: "Swipes (Directional)",
        type: 'key12',
        map: {
            'k12_1': 'swipe_left', 'k12_2': 'swipe_up', 'k12_3': 'swipe_down', 'k12_4': 'swipe_right',
            'k12_5': 'swipe_left_2f', 'k12_6': 'swipe_up_2f', 'k12_7': 'swipe_down_2f', 'k12_8': 'swipe_right_2f',
            'k12_9': 'swipe_left_3f', 'k12_10': 'swipe_up_3f', 'k12_11': 'swipe_down_3f', 'k12_12': 'swipe_right_3f'
        }
    },
    '12_hybrid': {
        name: "Hybrid (Mix)",
        type: 'key12',
        map: {
            'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
            'k12_5': 'swipe_left', 'k12_6': 'swipe_up', 'k12_7': 'swipe_down', 'k12_8': 'swipe_right',
            'k12_9': 'swipe_left_2f', 'k12_10': 'swipe_up_2f', 'k12_11': 'swipe_down_2f', 'k12_12': 'swipe_right_2f'
        }
    },
// === 12-KEY HAND ===
    '12_hand_extended': {
        name: "Hand Extended (Up/Down/Side)",
        type: 'key12',
        map: {
            // 1-5: Up
            'k12_1': { hand: 'hand_1_up' },
            'k12_2': { hand: 'hand_2_up' },
            'k12_3': { hand: 'hand_3_up' },
            'k12_4': { hand: 'hand_4_up' },
            'k12_5': { hand: 'hand_5_up' },
            
            // 6-10: Down
            'k12_6': { hand: 'hand_1_down' },
            'k12_7': { hand: 'hand_2_down' },
            'k12_8': { hand: 'hand_3_down' },
            'k12_9': { hand: 'hand_4_down' },
            'k12_10': { hand: 'hand_5_down' },

            // 11-12: Directional (Thumb/Index sideways)
            'k12_11': { hand: 'hand_1_right' }, // Point Right
            'k12_12': { hand: 'hand_1_left' }   // Point Left
        }
    },
    
    // ================= PIANO PROFILES =================
    'piano_swipes': {
        name: "Swipes (Default)",
        type: 'piano',
        map: {
            'piano_C': 'swipe_nw', 'piano_D': 'swipe_left', 'piano_E': 'swipe_sw', 
            'piano_F': 'swipe_down', 'piano_G': 'swipe_se', 
            'piano_A': 'swipe_right', 'piano_B': 'swipe_ne',
            'piano_1': 'swipe_left_2f', 'piano_2': 'swipe_nw_2f', 'piano_3': 'swipe_up_2f', 
            'piano_4': 'swipe_ne_2f', 'piano_5': 'swipe_right_2f'
        }
    },
    'piano_taps': {
        name: "Taps Only",
        type: 'piano',
        map: {
            'piano_C': 'tap', 
            'piano_D': 'double_tap', 
            'piano_E': 'triple_tap',
            'piano_F': 'long_tap',
            'piano_G': 'tap_2f_any',
            'piano_A': 'double_tap_2f_any',
            'piano_B': 'triple_tap_2f_any',
            
            'piano_1': 'tap_3f_any',
            'piano_2': 'double_tap_3f_any',
            'piano_3': 'triple_tap_3f_any',
            'piano_4': 'long_tap_2f_any',
            'piano_5': 'long_tap_3f_any'
        }
    },
       // === PIANO HAND ===
    'piano_hand_hybrid': {
        name: "Piano Hands",
        type: 'piano',
        map: {
            // White Keys (C-B) -> Up & Sides
            'piano_C': { hand: 'hand_1_up' },
            'piano_D': { hand: 'hand_2_up' },
            'piano_E': { hand: 'hand_3_up' },
            'piano_F': { hand: 'hand_4_up' },
            'piano_G': { hand: 'hand_5_up' },
            'piano_A': { hand: 'hand_1_right' }, // Point Right
            'piano_B': { hand: 'hand_2_right' }, // Peace Sign Right

            // Black Keys (1-5) -> Down
            'piano_1': { hand: 'hand_1_down' },
            'piano_2': { hand: 'hand_2_down' },
            'piano_3': { hand: 'hand_3_down' },
            'piano_4': { hand: 'hand_4_down' },
            'piano_5': { hand: 'hand_5_down' }
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
    constructor(appSettings, callbacks) {
        this.appSettings = appSettings;
        this.callbacks = callbacks;
        this.currentTargetKey = 'bubble';

this.dom = {
    // -- Toggles (Matching your 26 grid items exactly) --
    timerToggle: document.getElementById('timerToggle'),
    autotimerToggle: document.getElementById('autotimerToggle'),
    counterToggle: document.getElementById('counterToggle'),
    autocounterToggle: document.getElementById('autocounterToggle'),
    hapticsToggle: document.getElementById('hapticsToggle'),
    introToggle: document.getElementById('introToggle'),
    upsidedownToggle: document.getElementById('upsidedownToggle'),
    fullscreenToggle: document.getElementById('fullscreenToggle'),
    ecoToggle: document.getElementById('ecoToggle'),
    wakelockToggle: document.getElementById('wakelockToggle'),
    voiceToggle: document.getElementById('voiceToggle'),
    voicecommandsToggle: document.getElementById('voicecommandsToggle'),
    toneToggle: document.getElementById('toneToggle'),
    touchToggle: document.getElementById('touchToggle'),
    bossToggle: document.getElementById('bossToggle'),
    newToggle: document.getElementById('newToggle'),
    biggerToggle: document.getElementById('biggerToggle'),
    arcamToggle: document.getElementById('arcamToggle'),
    handToggle: document.getElementById('handToggle'),
    handsignalsToggle: document.getElementById('handsignalsToggle'),
    speeddeleteToggle: document.getElementById('speeddeleteToggle'),
    apshortcutToggle: document.getElementById('apshortcutToggle'),
    volgesToggle: document.getElementById('volgesToggle'),
    speedToggle: document.getElementById('speedToggle'),
    deleteToggle: document.getElementById('deleteToggle'),
    clearToggle: document.getElementById('clearToggle'),
    
    // -- Header Buttons (Matching your 10 header items exactly) --
    headertimerbtn: document.getElementById('headertimerbtn'),
    headercounterbtn: document.getElementById('headercounterbtn'),
    headervoicebtn: document.getElementById('headervoicebtn'),
    headertonebtn: document.getElementById('headertonebtn'),
    headertouchbtn: document.getElementById('headertouchbtn'),
    headerhandbtn: document.getElementById('headerhandbtn'),
    headerarcambtn: document.getElementById('headerarcambtn'),
    headerbiggerbtn: document.getElementById('headerbiggerbtn'),
    headerfullscreenbtn: document.getElementById('headerfullscreenbtn'),
    headerupsidedownbtn: document.getElementById('headerupsidedownbtn'),          
            // Voice Settings
            voicePresetSelect: document.getElementById('voice-preset-select'),
            voicePresetAdd: document.getElementById('voice-preset-add'),
            voicePresetSave: document.getElementById('voice-preset-save'),
            voicePresetRename: document.getElementById('voice-preset-rename'),
            voicePresetDelete: document.getElementById('voice-preset-delete'),
            voicePitch: document.getElementById('voice-pitch'), 
            voiceRate: document.getElementById('voice-rate'), 
            voiceVolume: document.getElementById('voice-volume'), 
            voiceTestBtn: document.getElementById('test-voice-btn'),
            voiceTriggerSelect: document.getElementById('voice-trigger-select'),
            
            // Selects & Modals
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
            machines: document.getElementById('machines-select'), 
            seqLength: document.getElementById('seq-length-select'),
            pause: document.getElementById('pause-select'), 
            playbackSpeed: document.getElementById('playback-speed-select'), 
            arSpeedSelect: document.getElementById('ar-speed-select'),
            chunk: document.getElementById('chunk-select'), 
            delay: document.getElementById('delay-select'), 
            uiScale: document.getElementById('ui-scale-select'), 
            seqSize: document.getElementById('seq-size-select'), 
            seqFontSize: document.getElementById('seq-font-size-select'), 
            gestureMode: document.getElementById('gesture-mode-select'), 
            quickLang: document.getElementById('quick-lang-select'), 
            generalLang: document.getElementById('general-lang-select'), 
            autoInput: document.getElementById('auto-input-select'), // Added based on autoInput logic
            closeSettingsBtn: document.getElementById('close-settings'),
            tabs: document.querySelectorAll('.tab-btn'),
            contents: document.querySelectorAll('.tab-content'),
            
            // Help & Setup Modals
            helpModal: document.getElementById('help-modal'), 
            setupModal: document.getElementById('game-setup-modal'), 
            closeSetupBtn: document.getElementById('close-game-setup-modal'), 
            quickSettings: document.getElementById('quick-open-settings'), 
            quickHelp: document.getElementById('quick-open-help'),
            quickResizeUp: document.getElementById('quick-resize-up'), 
            quickResizeDown: document.getElementById('quick-resize-down'),
            closeHelpBtn: document.getElementById('close-help'), 
            closeHelpBtnBottom: document.getElementById('close-help-btn-bottom'), 
            openHelpBtn: document.getElementById('open-help-button'), 
            promptDisplay: document.getElementById('prompt-display'), 
            copyPromptBtn: document.getElementById('copy-prompt-btn'), 
            generatePromptBtn: document.getElementById('generate-prompt-btn'),
            
            // Mapping Containers & Sliders
            mapping9Container: document.getElementById('mapping-9-container'),
            mapping12Container: document.getElementById('mapping-12-container'),
            mappingPianoContainer: document.getElementById('mapping-piano-container'),
            gestureTapSlider: document.getElementById('gesture-tap-slider'),
            gestureSwipeSlider: document.getElementById('gesture-swipe-slider'),
            gestureTapVal: document.getElementById('gesture-tap-val'),
            gestureSwipeVal: document.getElementById('gesture-swipe-val'),
            
            // Share & Socials
            shareModal: document.getElementById('share-modal'), 
            openShareInside: document.getElementById('open-share-button'), 
            closeShareBtn: document.getElementById('close-share'), 
            redeemModal: document.getElementById('redeem-modal'), 
            openRedeemBtn: document.getElementById('open-redeem-btn'), 
            closeRedeemBtn: document.getElementById('close-redeem-btn'),
            redeemImg: document.getElementById('redeem-img'),
            redeemPlus: document.getElementById('redeem-zoom-in'),
            redeemMinus: document.getElementById('redeem-zoom-out'),
            openDonateBtn: document.getElementById('open-donate-btn'),
            openRedeemSettingsBtn: document.getElementById('open-redeem-btn-settings'),
            donateModal: document.getElementById('donate-modal'), 
            closeDonateBtn: document.getElementById('close-donate-btn'),
            btnCashMain: document.getElementById('btn-cashapp-main'), 
            btnPaypalMain: document.getElementById('btn-paypal-main'),
            copyLinkBtn: document.getElementById('copy-link-button'), 
            nativeShareBtn: document.getElementById('native-share-button'),
            chatShareBtn: document.getElementById('chat-share-button'), 
            emailShareBtn: document.getElementById('email-share-button'),    
            
            // System
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
            nukeBtn: document.querySelector('button[data-action="nuke-app"]')
        };     
        
        this.tempTheme = null; 
        this.initListeners(); 
        this.bindGestureFilters();
        this.populateConfigDropdown(); 
        this.populateThemeDropdown(); 
        this.buildColorGrid(); 
        this.populateVoicePresetDropdown();
        this.populatePlaybackSpeedDropdown();
        this.populateARSpeedDropdown();  
        this.populateUIScaleDropdown(); 
        this.populateMappingUI();
        this.populateMorseUI();
        this.updateUIFromSettings();
        this.renderMappingUI(); 

        const bindToggle = (toggleElement, settingKey, applyCallback) => {
            if (toggleElement) {
                let defaultState = settingKey === 'isWakeLockEnabled' ? true : false;
                toggleElement.checked = this.appSettings[settingKey] ?? defaultState;
                
                toggleElement.onchange = (e) => {
                    this.appSettings[settingKey] = e.target.checked;
                    this.callbacks.onSave();
                    if (applyCallback) applyCallback();
                };
            }
        };

        bindToggle(this.dom.wakelockToggle, 'isWakeLockEnabled', () => {
            if (typeof window.wakelockToggle === 'function') {
                window.wakelockToggle(this.appSettings.isWakeLockEnabled);
            }
        });

        bindToggle(this.dom.ecoToggle, 'isEcoModeEnabled', () => {
            document.body.classList.toggle('eco-mode', this.appSettings.isEcoModeEnabled);
        });

        if (this.dom.arSpeedSelect) {
            this.dom.arSpeedSelect.value = this.appSettings.arPlaybackSpeed || 1.0; 
            this.dom.arSpeedSelect.onchange = (e) => {
                this.appSettings.arPlaybackSpeed = parseFloat(e.target.value);
                this.callbacks.onSave();
            };
        }
    }

    renderMappingUI() {
        const container = document.getElementById('mapping-accordion-container');
        if (!container) return;
        
        container.innerHTML = ''; 

        const groups = [
            { id: 'key9', title: '9-Key Layout', keys: Array.from({length: 9}, (_, i) => `k9_${i+1}`) },
            { id: 'key12', title: '12-Key Layout', keys: Array.from({length: 12}, (_, i) => `k12_${i+1}`) },
            { id: 'piano', title: 'Piano Layout', keys: ['piano_C', 'piano_D', 'piano_E', 'piano_F', 'piano_G', 'piano_A', 'piano_B', 'piano_1', 'piano_2', 'piano_3', 'piano_4', 'piano_5'] }
        ];

        const touchOptionsHTML = (typeof TOUCH_GESTURES !== 'undefined' ? TOUCH_GESTURES : []).map(g => `<option value="${g.value}">${g.label}</option>`).join('');
        const handOptionsHTML = (typeof VISUAL_HAND_GESTURES !== 'undefined' ? VISUAL_HAND_GESTURES : []).map(g => `<option value="${g.value}">${g.label}</option>`).join('');

        groups.forEach(group => {
            container.innerHTML += `<h3 class="font-bold text-sm mt-6 mb-2 text-primary-app border-b border-gray-700 pb-1">${group.title}</h3>`;
            
            group.keys.forEach(keyId => {
                let displayName = keyId.replace('k9_', 'Key ').replace('k12_', 'Key ').replace('piano_', 'Note ');

                const accordion = `
                    <details class="group bg-gray-900 rounded-lg border border-gray-700 open:bg-gray-800 transition-colors shadow-sm mb-2">
                        <summary class="cursor-pointer p-3 font-bold select-none flex justify-between items-center text-white outline-none">
                            <span class="flex items-center gap-2">
                                <span class="bg-gray-700 w-16 h-6 flex items-center justify-center rounded text-xs text-blue-300 font-mono border border-gray-600">${displayName}</span>
                            </span>
                            <span class="group-open:rotate-180 transition-transform text-gray-500">▼</span>
                        </summary>
                        
                        <div class="p-3 border-t border-gray-700 mt-1 bg-black/20">
                            <div class="flex border-b border-gray-700 mb-3">
                                <button type="button" class="mapping-subtab-btn active flex-1 py-2 text-xs font-bold text-blue-400 border-b-2 border-blue-400 transition-colors" data-key="${keyId}" data-target="touch">👆 Touch</button>
                                <button type="button" class="mapping-subtab-btn flex-1 py-2 text-xs font-bold text-gray-500 hover:text-green-400 transition-colors" data-key="${keyId}" data-target="hand">🖐️ Hand Tracking</button>
                            </div>
                            
                            <div id="panel-touch-${keyId}" class="mapping-panel block space-y-2">
                                <select id="map-touch-${keyId}" class="mapping-select settings-input w-full p-2.5 rounded text-sm font-semibold shadow-sm border border-gray-600 bg-gray-950 text-white outline-none focus:border-blue-500 transition-colors" data-type="touch" data-key="${keyId}">
                                    ${touchOptionsHTML}
                                </select>
                            </div>
                            
                            <div id="panel-hand-${keyId}" class="mapping-panel hidden space-y-2">
                                <select id="map-hand-${keyId}" class="mapping-select settings-input w-full p-2.5 rounded text-sm font-semibold shadow-sm border border-gray-600 bg-gray-950 text-emerald-400 outline-none focus:border-emerald-500 transition-colors" data-type="hand" data-key="${keyId}">
                                    ${handOptionsHTML}
                                </select>
                            </div>
                        </div>
                    </details>
                `;
                container.innerHTML += accordion;
            });
        });

        this.bindMappingEvents();
    }

    bindMappingEvents() {
        const btnTouch = document.getElementById('btn-map-touch');
        const btnHand = document.getElementById('btn-map-hand');
        const secTouch = document.getElementById('section-map-touch');
        const secHand = document.getElementById('section-map-hand');

        if (btnTouch && btnHand) {
            btnTouch.onclick = () => {
                btnTouch.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
                btnTouch.classList.remove('text-gray-500');
                btnHand.classList.remove('text-emerald-400', 'border-b-2', 'border-emerald-400');
                btnHand.classList.add('text-gray-500');
                if (secTouch) secTouch.classList.remove('hidden');
                if (secHand) secHand.classList.add('hidden');
            };

            btnHand.onclick = () => {
                btnHand.classList.add('text-emerald-400', 'border-b-2', 'border-emerald-400');
                btnHand.classList.remove('text-gray-500');
                btnTouch.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
                btnTouch.classList.add('text-gray-500');
                if (secHand) secHand.classList.remove('hidden');
                if (secTouch) secTouch.classList.add('hidden');
            };
        }

        document.querySelectorAll('.mapping-select').forEach(select => {
            const keyId = select.dataset.key; 
            const type = select.dataset.type; 
            
            if (this.appSettings.mappings && this.appSettings.mappings[keyId]) {
                if (type === 'touch' && this.appSettings.mappings[keyId].touch) {
                    select.value = this.appSettings.mappings[keyId].touch;
                } else if (type === 'hand' && this.appSettings.mappings[keyId].handGesture !== undefined) {
                    select.value = this.appSettings.mappings[keyId].handGesture;
                }
            }

            select.onchange = (e) => {
                if (!this.appSettings.mappings) this.appSettings.mappings = {};
                if (!this.appSettings.mappings[keyId]) {
                    this.appSettings.mappings[keyId] = { touch: 'none', handGesture: 'none', morse: '' };
                }
                
                if (type === 'touch') {
                    this.appSettings.mappings[keyId].touch = e.target.value;
                } else {
                    this.appSettings.mappings[keyId].handGesture = e.target.value === 'none' ? 'none' : parseInt(e.target.value, 10);
                }
                
                this.callbacks.onSave(); 
            };
        });
    }

    bindGestureFilters() {
        if (!this.dom.filterToggles) return;
        this.dom.filterToggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.populateMappingUI();
            });
        });
    }

    populatePlaybackSpeedDropdown() {
        if (!this.dom.playbackSpeed) return;
        this.dom.playbackSpeed.innerHTML = '';
        for (let i = 75; i <= 150; i += 5) {
            const opt = document.createElement('option');
            opt.value = (i / 100).toFixed(2);
            opt.textContent = i + '%';
            this.dom.playbackSpeed.appendChild(opt);
        }
        this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
    }

    populateARSpeedDropdown() {
        if (!this.dom.arSpeedSelect) return;
        this.dom.arSpeedSelect.innerHTML = '';
        const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        speeds.forEach(speed => {
            const opt = document.createElement('option');
            opt.value = speed;
            opt.textContent = speed.toFixed(2) + 'x';
            this.dom.arSpeedSelect.appendChild(opt);
        });
        this.dom.arSpeedSelect.value = String(this.appSettings.arPlaybackSpeed || 1.0);
    }

    populateUIScaleDropdown() {
        if (!this.dom.uiScale) return;
        this.dom.uiScale.innerHTML = '';
        for (let i = 50; i <= 500; i += 10) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i + '%';
            this.dom.uiScale.appendChild(opt);
        }
        this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
    }

    populateVoicePresetDropdown() {
        if (!this.dom.voicePresetSelect) return;
        this.dom.voicePresetSelect.innerHTML = '';

        const grp1 = document.createElement('optgroup');
        grp1.label = "Built-in";
        if (typeof PREMADE_VOICE_PRESETS !== 'undefined') {
            Object.keys(PREMADE_VOICE_PRESETS).forEach(k => {
                const el = document.createElement('option');
                el.value = k;
                el.textContent = PREMADE_VOICE_PRESETS[k].name;
                grp1.appendChild(el);
            });
        }
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
        let preset = this.appSettings.voicePresets[id] || (typeof PREMADE_VOICE_PRESETS !== 'undefined' ? PREMADE_VOICE_PRESETS[id] : null) || {pitch: 1, rate: 1, volume: 1};
        this.appSettings.voicePitch = preset.pitch;
        this.appSettings.voiceRate = preset.rate;
        this.appSettings.voiceVolume = preset.volume;
        this.updateUIFromSettings();
        this.callbacks.onSave();
    }

    buildColorGrid() { 
        if (!this.dom.editorGrid || typeof CRAYONS === 'undefined') return; 
        this.dom.editorGrid.innerHTML = ''; 
        CRAYONS.forEach(color => { 
            const btn = document.createElement('div'); 
            btn.style.backgroundColor = color; 
            btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm"; 
            btn.onclick = () => this.applyColorToTarget(color); 
            this.dom.editorGrid.appendChild(btn); 
        }); 
    }

    applyColorToTarget(hex) { 
        if (!this.tempTheme) return; 
        this.tempTheme[this.currentTargetKey] = hex; 
        const [h, s, l] = this.hexToHsl(hex); 
        if (this.dom.ftHue) this.dom.ftHue.value = h; 
        if (this.dom.ftSat) this.dom.ftSat.value = s; 
        if (this.dom.ftLit) this.dom.ftLit.value = l; 
        if (this.dom.ftPreview) this.dom.ftPreview.style.backgroundColor = hex; 
        if (this.dom.ftContainer && this.dom.ftContainer.classList.contains('hidden')) { 
            this.dom.ftContainer.classList.remove('hidden'); 
            if (this.dom.ftToggle) this.dom.ftToggle.style.display = 'none'; 
        } 
        this.updatePreview(); 
    }

    updateColorFromSliders() { 
        if (!this.dom.ftHue || !this.dom.ftSat || !this.dom.ftLit) return;
        const h = parseInt(this.dom.ftHue.value); 
        const s = parseInt(this.dom.ftSat.value); 
        const l = parseInt(this.dom.ftLit.value); 
        const hex = this.hslToHex(h, s, l); 
        if (this.dom.ftPreview) this.dom.ftPreview.style.backgroundColor = hex; 
        if (this.tempTheme) { 
            this.tempTheme[this.currentTargetKey] = hex; 
            this.updatePreview(); 
        } 
    }

    openThemeEditor() { 
        if (!this.dom.editorModal || typeof PREMADE_THEMES === 'undefined') return; 
        const activeId = this.appSettings.activeTheme; 
        const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default']; 
        this.tempTheme = { ...source }; 
        if (this.dom.edName) this.dom.edName.value = this.tempTheme.name; 
        if (this.dom.targetBtns) {
            this.dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app')); 
            if (this.dom.targetBtns[2]) this.dom.targetBtns[2].classList.add('active', 'bg-primary-app'); 
        }
        this.currentTargetKey = 'bubble'; 
        const [h, s, l] = this.hexToHsl(this.tempTheme.bubble); 
        if (this.dom.ftHue) this.dom.ftHue.value = h; 
        if (this.dom.ftSat) this.dom.ftSat.value = s; 
        if (this.dom.ftLit) this.dom.ftLit.value = l; 
        if (this.dom.ftPreview) this.dom.ftPreview.style.backgroundColor = this.tempTheme.bubble; 
        this.updatePreview(); 
        this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none'); 
        this.dom.editorModal.querySelector('div').classList.remove('scale-90'); 
    }

    updatePreview() { 
        const t = this.tempTheme; 
        if (!this.dom.edPreview || !t) return; 
        this.dom.edPreview.style.backgroundColor = t.bgMain; 
        this.dom.edPreview.style.color = t.text; 
        if (this.dom.edPreviewCard) {
            this.dom.edPreviewCard.style.backgroundColor = t.bgCard; 
            this.dom.edPreviewCard.style.color = t.text; 
            this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)'; 
        }
        if (this.dom.edPreviewBtn) {
            this.dom.edPreviewBtn.style.backgroundColor = t.bubble; 
            this.dom.edPreviewBtn.style.color = t.text; 
        }
    }

    testVoice() { 
        if (window.speechSynthesis) { 
            window.speechSynthesis.cancel(); 
            const u = new SpeechSynthesisUtterance("Testing 1 2 3."); 
            if (this.appSettings.selectedVoice) { 
                const v = window.speechSynthesis.getVoices().find(voice => voice.name === this.appSettings.selectedVoice); 
                if (v) u.voice = v; 
            } 
            if (this.dom.voicePitch) u.pitch = parseFloat(this.dom.voicePitch.value); 
            if (this.dom.voiceRate) u.rate = parseFloat(this.dom.voiceRate.value); 
            if (this.dom.voiceVolume) u.volume = parseFloat(this.dom.voiceVolume.value); 
            window.speechSynthesis.speak(u); 
        } 
    }

    setLanguage(lang) {
        if (typeof LANG === 'undefined') return;
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

    openShare() { 
        if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); 
        if (this.dom.shareModal) { 
            this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); 
            setTimeout(() => {
                const sheet = this.dom.shareModal.querySelector('.share-sheet');
                if (sheet) sheet.classList.add('active');
            }, 10); 
        } 
    }

    closeShare() { 
        if (this.dom.shareModal) { 
            const sheet = this.dom.shareModal.querySelector('.share-sheet');
            if (sheet) sheet.classList.remove('active'); 
            setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300); 
        } 
    }

    toggleRedeem(show) { 
        if (this.dom.redeemModal) {
            if (show) { 
                this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none'); 
                this.dom.redeemModal.style.pointerEvents = 'auto'; 
            } else { 
                this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none'); 
                this.dom.redeemModal.style.pointerEvents = 'none'; 
            } 
        }
    }

    toggleDonate(show) { 
        if (this.dom.donateModal) {
            if (show) { 
                this.dom.donateModal.classList.remove('opacity-0', 'pointer-events-none'); 
                this.dom.donateModal.style.pointerEvents = 'auto'; 
            } else { 
                this.dom.donateModal.classList.add('opacity-0', 'pointer-events-none'); 
                this.dom.donateModal.style.pointerEvents = 'none'; 
            } 
        }
    }

    setupTabSwipe(modal) {
        const content = modal.querySelector('.settings-modal-bg');
        if (!content) return;

        let startX = 0, startY = 0, isSwipeIgnored = false;

        content.addEventListener('touchstart', (e) => {
            if (e.target.closest('.no-swipe-zone') || e.target.closest('button')) {
                isSwipeIgnored = true;
                return;
            }
            isSwipeIgnored = false;
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });

        content.addEventListener('touchend', (e) => {
            if (isSwipeIgnored) return;

            const endX = e.changedTouches[0].screenX;
            const endY = e.changedTouches[0].screenY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 2) {
                const tabs = Array.from(modal.querySelectorAll('.tab-btn'));
                const activeIdx = tabs.findIndex(t => t.classList.contains('active'));

                if (activeIdx === -1) return;

                if (diffX < 0 && activeIdx < tabs.length - 1) {
                    tabs[activeIdx + 1].click();
                } else if (diffX > 0 && activeIdx > 0) {
                    tabs[activeIdx - 1].click();
                }
            }
        }, { passive: true });
    }

initListeners() {
    // Simple helper to bind a checkbox toggle to a global appSetting property
    const bindToggle = (el, prop, updateHeader = false) => {
        if (!el) return;
        el.onchange = (e) => {
            this.appSettings[prop] = e.target.checked;
            this.callbacks.onSave();
            if (updateHeader) this.updateHeaderVisibility();
        };
    };

    // Header Visibility Triggers (These 10 affect the header)
    bindToggle(this.dom.timerToggle, 'showTimer', true);
    bindToggle(this.dom.counterToggle, 'showCounter', true);
    bindToggle(this.dom.voiceToggle, 'isVoiceInputEnabled', true);
    bindToggle(this.dom.toneToggle, 'isToneCadenceEnabled', true);
    bindToggle(this.dom.touchToggle, 'isGestureInputEnabled', true);
    bindToggle(this.dom.handToggle, 'isHandGesturesEnabled', true);
    bindToggle(this.dom.arcamToggle, 'isArModeEnabled', true);
    bindToggle(this.dom.biggerToggle, 'isStealth1KeyEnabled', true);
    bindToggle(this.dom.fullscreenToggle, 'showFullscreenBtn', true);
    bindToggle(this.dom.upsidedownToggle, 'showUpsideDownBtn', true);

    // Standard App Settings Triggers
    bindToggle(this.dom.autotimerToggle, 'isAutoTimerEnabled');
    bindToggle(this.dom.autocounterToggle, 'isAutoCounterEnabled');
    bindToggle(this.dom.hapticsToggle, 'isHapticsEnabled');
    bindToggle(this.dom.ecoToggle, 'isEcoModeEnabled');
    bindToggle(this.dom.voicecommandsToggle, 'isVoiceCommandsEnabled');
    bindToggle(this.dom.bossToggle, 'isBossModeEnabled');
    bindToggle(this.dom.newToggle, 'isNewFeatureEnabled'); // Placeholder
    bindToggle(this.dom.handsignalsToggle, 'isHandSignalsEnabled');
    bindToggle(this.dom.speeddeleteToggle, 'isSpeedDeletingEnabled');
    bindToggle(this.dom.apshortcutToggle, 'isApShortcutEnabled');
    bindToggle(this.dom.volgesToggle, 'isVolumeGesturesEnabled');
    bindToggle(this.dom.speedToggle, 'isSpeedGesturesEnabled');
    bindToggle(this.dom.deleteToggle, 'isDeleteGestureEnabled');
    bindToggle(this.dom.clearToggle, 'isClearGestureEnabled');

    // Special Overrides
    if (this.dom.introToggle) {
        this.dom.introToggle.onchange = (e) => { 
            this.appSettings.showWelcomeScreen = e.target.checked; 
            this.callbacks.onSave(); 
        };
    }

    if (this.dom.wakelockToggle) {
        this.dom.wakelockToggle.onchange = (e) => {
            this.appSettings.isWakeLockEnabled = e.target.checked;
            this.callbacks.onSave();
            if (typeof window.wakelockToggle === 'function') {
                window.wakelockToggle(e.target.checked);
            }
        };
    }

        // Theme
        if (this.dom.targetBtns) {
            this.dom.targetBtns.forEach(btn => { 
                btn.onclick = () => { 
                    this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); }); 
                    btn.classList.add('active', 'bg-primary-app'); 
                    btn.classList.remove('opacity-60'); 
                    this.currentTargetKey = btn.dataset.target; 
                    if (this.tempTheme) { 
                        const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]); 
                        if (this.dom.ftHue) this.dom.ftHue.value = h; 
                        if (this.dom.ftSat) this.dom.ftSat.value = s; 
                        if (this.dom.ftLit) this.dom.ftLit.value = l; 
                        if (this.dom.ftPreview) this.dom.ftPreview.style.backgroundColor = this.tempTheme[this.currentTargetKey]; 
                    } 
                }; 
            });
        }
        
        [this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => { if (sl) sl.oninput = () => this.updateColorFromSliders(); });
        
        if (this.dom.ftToggle) {
            this.dom.ftToggle.onclick = () => { 
                if (this.dom.ftContainer) this.dom.ftContainer.classList.remove('hidden'); 
                this.dom.ftToggle.style.display = 'none'; 
            };
        }

        if (this.dom.edSave) {
            this.dom.edSave.onclick = () => { 
                if (this.tempTheme && typeof PREMADE_THEMES !== 'undefined') { 
                    const activeId = this.appSettings.activeTheme; 
                    if (PREMADE_THEMES[activeId]) { 
                        const newId = 'custom_' + Date.now(); 
                        this.appSettings.customThemes[newId] = this.tempTheme; 
                        this.appSettings.activeTheme = newId; 
                    } else { 
                        this.appSettings.customThemes[activeId] = this.tempTheme; 
                    } 
                    this.callbacks.onSave(); 
                    this.callbacks.onUpdate(); 
                    this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); 
                    this.dom.editorModal.querySelector('div').classList.add('scale-90'); 
                    this.populateThemeDropdown(); 
                } 
            };
        }
        
        if (this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
        if (this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };
        
        // Voice Control Base
        if (this.dom.voiceTestBtn) this.dom.voiceTestBtn.onclick = () => this.testVoice();
        const updateVoiceLive = () => {
            if (this.dom.voicePitch) this.appSettings.voicePitch = parseFloat(this.dom.voicePitch.value);
            if (this.dom.voiceRate) this.appSettings.voiceRate = parseFloat(this.dom.voiceRate.value);
            if (this.dom.voiceVolume) this.appSettings.voiceVolume = parseFloat(this.dom.voiceVolume.value);
        };
        
        if (this.dom.voicePitch) this.dom.voicePitch.oninput = updateVoiceLive;
        if (this.dom.voiceRate) this.dom.voiceRate.oninput = updateVoiceLive;
        if (this.dom.voiceVolume) this.dom.voiceVolume.oninput = updateVoiceLive;

        // Toggles
        if (this.dom.toneCadenceToggle) {
            this.dom.toneCadenceToggle.checked = !!this.appSettings.isToneCadenceEnabled;
            this.dom.toneCadenceToggle.addEventListener('change', (e) => {
                this.appSettings.isToneCadenceEnabled = e.target.checked;
                this.callbacks.onSave();
                this.updateHeaderVisibility(); 
            });
        }

        if (this.dom.fullscreenToggle) {
            this.dom.fullscreenToggle.checked = !!this.appSettings.showFullscreenBtn;
            this.dom.fullscreenToggle.onchange = (e) => {
                this.appSettings.showFullscreenBtn = e.target.checked;
                this.updateHeaderVisibility();
                this.callbacks.onSave();
            };
        }

        if (this.dom.upsidedownToggle) {
            this.dom.upsidedownToggle.checked = !!this.appSettings.showUpsideDownBtn;
            this.dom.upsidedownToggle.onchange = (e) => {
                this.appSettings.showUpsideDownBtn = e.target.checked;
                this.updateHeaderVisibility();
                this.callbacks.onSave();
            };
        }

        if (this.dom.headerbiggerbtn) {
            this.dom.headerbiggerbtn.addEventListener('click', () => {
                const isActive = this.dom.headerbiggerbtn.classList.contains('bg-indigo-600');
                if (isActive) {
                    this.dom.headerbiggerbtn.classList.remove('bg-indigo-600', 'text-white');
                    this.dom.headerbiggerbtn.classList.add('bg-indigo-900/40', 'text-indigo-300');
                    this.dom.headerbiggerbtn.textContent = '🎵 Tones Off';
                    if (typeof toneEngine !== 'undefined') toneEngine.stop();
                } else {
                    this.dom.headerbiggerbtn.classList.add('bg-indigo-600', 'text-white');
                    this.dom.headerbiggerbtn.classList.remove('bg-indigo-900/40', 'text-indigo-300');
                    this.dom.headerbiggerbtn.textContent = '🎵 Tones ON';
                    if (typeof toneEngine !== 'undefined') toneEngine.start();
                }
            });
        }

        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.onchange = (e) => { 
            this.appSettings.activeVoicePresetId = e.target.value; 
            this.applyVoicePreset(e.target.value); 
        };
        
        if (this.dom.voicePresetAdd) {
            this.dom.voicePresetAdd.onclick = () => { 
                const n = prompt("New Voice Preset Name:"); 
                if (n) { 
                    const id = 'vp_' + Date.now(); 
                    this.appSettings.voicePresets[id] = { name: n, pitch: this.appSettings.voicePitch, rate: this.appSettings.voiceRate, volume: this.appSettings.voiceVolume }; 
                    this.appSettings.activeVoicePresetId = id; 
                    this.populateVoicePresetDropdown(); 
                    this.callbacks.onSave(); 
                } 
            };
        }

        if (this.dom.voicePresetSave) {
            this.dom.voicePresetSave.onclick = () => { 
                const id = this.appSettings.activeVoicePresetId; 
                if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) { 
                    alert("Cannot save over built-in presets. Create a new one."); 
                    return; 
                } 
                if (this.appSettings.voicePresets[id]) { 
                    this.appSettings.voicePresets[id] = { ...this.appSettings.voicePresets[id], pitch: parseFloat(this.dom.voicePitch.value), rate: parseFloat(this.dom.voiceRate.value), volume: parseFloat(this.dom.voiceVolume.value) }; 
                    this.callbacks.onSave(); 
                    alert("Voice Preset Saved!"); 
                } 
            };
        }

        if (this.dom.voicePresetDelete) {
            this.dom.voicePresetDelete.onclick = () => { 
                const id = this.appSettings.activeVoicePresetId; 
                if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) { 
                    alert("Cannot delete built-in."); 
                    return; 
                } 
                if (confirm("Delete this voice preset?")) { 
                    delete this.appSettings.voicePresets[id]; 
                    this.appSettings.activeVoicePresetId = 'standard'; 
                    this.populateVoicePresetDropdown(); 
                    this.applyVoicePreset('standard'); 
                } 
            };
        }

        if (this.dom.voicePresetRename) {
            this.dom.voicePresetRename.onclick = () => { 
                const id = this.appSettings.activeVoicePresetId; 
                if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) return alert("Cannot rename built-in."); 
                const n = prompt("Rename:", this.appSettings.voicePresets[id].name); 
                if (n) { 
                    this.appSettings.voicePresets[id].name = n; 
                    this.populateVoicePresetDropdown(); 
                    this.callbacks.onSave(); 
                } 
            };
        }

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
                
                if (['showTimer', 'showCounter', 'autoInputMode', 'isVoiceInputEnabled', 'isArModeEnabled', 'isStealth1KeyEnabled', 'isHandGesturesEnabled', 'isGestureInputEnabled'].includes(prop)) {
                    this.updateHeaderVisibility();
                }
            };
        };

        bind(this.dom.input, 'currentInput', false); 
        bind(this.dom.machines, 'machineCount', false, true); 
        bind(this.dom.seqLength, 'sequenceLength', false, true); 
        bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
        bind(this.dom.longPressToggle, 'isLongPressAutoplayEnabled', true);
        bind(this.dom.timerToggle, 'showTimer', true);
        bind(this.dom.counterToggle, 'showCounter', true);
        
        if (this.dom.arModeToggle) {
            this.dom.arModeToggle.onchange = (e) => {
                this.appSettings.isArModeEnabled = e.target.checked;
                this.updateHeaderVisibility(); 
                this.callbacks.onSave();
            };
        }
        
        bind(this.dom.voiceToggle, 'isVoiceInputEnabled', true);
        
        if (this.dom.mode) { 
            this.dom.mode.onchange = () => { 
                this.appSettings.runtimeSettings.currentMode = this.dom.mode.value; 
                this.callbacks.onSave(); 
                this.callbacks.onUpdate('mode_switch'); 
                this.generatePrompt(); 
            }; 
        }

        ['input', 'machines', 'seqLength', 'playbackSpeed', 'delay', 'chunk'].forEach(id => {
            if (this.dom[id]) this.dom[id].addEventListener('change', () => this.generatePrompt());
        });

        if (this.dom.autoplay) this.dom.autoplay.onchange = (e) => { this.appSettings.isAutoplayEnabled = e.target.checked; if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked; this.callbacks.onSave(); };
        if (this.dom.audio) this.dom.audio.onchange = (e) => { this.appSettings.isAudioEnabled = e.target.checked; if (this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked; this.callbacks.onSave(); };
        if (this.dom.quickAutoplay) this.dom.quickAutoplay.onchange = (e) => { this.appSettings.isAutoplayEnabled = e.target.checked; if (this.dom.autoplay) this.dom.autoplay.checked = e.target.checked; this.callbacks.onSave(); };
        if (this.dom.quickAudio) this.dom.quickAudio.onchange = (e) => { this.appSettings.isAudioEnabled = e.target.checked; if (this.dom.audio) this.dom.audio.checked = e.target.checked; this.callbacks.onSave(); };
        
        if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = !e.target.checked; if (this.dom.showWelcome) this.dom.showWelcome.checked = !e.target.checked; this.callbacks.onSave(); };
        if (this.dom.showWelcome) this.dom.showWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = e.target.checked; if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !e.target.checked; this.callbacks.onSave(); };

        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.onchange = (e) => { this.appSettings.playbackSpeed = parseFloat(e.target.value); this.callbacks.onSave(); this.generatePrompt(); };
        bind(this.dom.chunk, 'simonChunkSize', false, true); 
        bind(this.dom.flash, 'isFlashEnabled', true); 
        bind(this.dom.pause, 'pauseSetting', true);
        
        if (this.dom.delay) this.dom.delay.onchange = (e) => { this.appSettings.runtimeSettings.simonInterSequenceDelay = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
        
        bind(this.dom.haptics, 'isHapticsEnabled', true); 
        bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true); 
        bind(this.dom.biggerToggle, 'isStealth1KeyEnabled', true);
        bind(this.dom.speedGesturesToggle, 'isSpeedGesturesEnabled', true);
        bind(this.dom.volumeGesturesToggle, 'isVolumeGesturesEnabled', true);
        bind(this.dom.deleteGestureToggle, 'isDeleteGestureEnabled', true);
        bind(this.dom.clearGestureToggle, 'isClearGestureEnabled', true);
        bind(this.dom.autoTimerToggle, 'isAutoTimerEnabled', true);
        bind(this.dom.autoCounterToggle, 'isAutoCounterEnabled', true);
        bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
        
        if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); this.callbacks.onUpdate(); };
        if (this.dom.seqSize) this.dom.seqSize.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
        if (this.dom.seqFontSize) this.dom.seqFontSize.onchange = (e) => { this.appSettings.uiFontSizeMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onSave(); this.callbacks.onUpdate(); };
        
        // STANDARD HAND GESTURES INTEGRATION
        if (this.dom.handGesturesToggle) {
            this.dom.handGesturesToggle.checked = !!this.appSettings.isHandGesturesEnabled;
            this.dom.handGesturesToggle.onchange = (e) => {
                this.appSettings.isHandGesturesEnabled = e.target.checked;
                this.updateHeaderVisibility(); 
                this.callbacks.onSave();
            };
        }

        if (this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => { this.appSettings.gestureResizeMode = e.target.value; this.callbacks.onSave(); };
        
        if (this.dom.autoInput) {
            this.dom.autoInput.onchange = (e) => { 
                const val = e.target.value; 
                this.appSettings.autoInputMode = val; 
                this.appSettings.showMicBtn = (val === 'mic' || val === 'both'); 
                this.appSettings.showCamBtn = (val === 'cam' || val === 'both'); 
                this.callbacks.onSave(); 
                this.callbacks.onUpdate(); 
                this.updateHeaderVisibility(); 
            };
        }
        
        // Configuration Actions
        if (this.dom.themeAdd) this.dom.themeAdd.onclick = () => { const n = prompt("Name:"); if (n) { const id = 'c_' + Date.now(); this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'], name: n }; this.appSettings.activeTheme = id; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); this.openThemeEditor(); } };
        if (this.dom.themeRename) this.dom.themeRename.onclick = () => { const id = this.appSettings.activeTheme; if (PREMADE_THEMES[id]) return alert("Cannot rename built-in."); const n = prompt("Rename:", this.appSettings.customThemes[id].name); if (n) { this.appSettings.customThemes[id].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); } };
        if (this.dom.themeDelete) this.dom.themeDelete.onclick = () => { if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in."); if (confirm("Delete?")) { delete this.appSettings.customThemes[this.appSettings.activeTheme]; this.appSettings.activeTheme = 'default'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); } };
        if (this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); this.populateThemeDropdown(); };
        if (this.dom.configAdd) this.dom.configAdd.onclick = () => { const n = prompt("Profile Name:"); if (n) this.callbacks.onProfileAdd(n); this.openSettings(); };
        if (this.dom.configRename) this.dom.configRename.onclick = () => { const n = prompt("Rename:"); if (n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
        if (this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
        if (this.dom.configSave) this.dom.configSave.onclick = () => { this.callbacks.onProfileSave(); };
        if (this.dom.themeSave) this.dom.themeSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES && PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onProfileSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); alert("Theme Saved!"); } };
        
        // Modals & Navigation
        if (this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if (this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        if (this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.generatePrompt(); if (this.dom.helpModal) this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => { if (this.dom.helpModal) this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeHelpBtnBottom) this.dom.closeHelpBtnBottom.onclick = () => { if (this.dom.helpModal) this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none'); };
        if (this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => { this.generatePrompt(); if (this.dom.helpModal) this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); if (this.dom.settingsModal) { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); } };

        if (this.dom.tabs) {
            this.dom.tabs.forEach(btn => {
                btn.onclick = () => {
                    const parent = btn.parentElement.parentElement;
                    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                    const target = btn.dataset.tab;
                    if (target === 'help-voice') this.generatePrompt();
                    const tabEl = document.getElementById(`tab-${target}`);
                    if (tabEl) tabEl.classList.add('active');
                }
            });
        }
        
        if (this.dom.settingsModal) this.setupTabSwipe(this.dom.settingsModal);
        if (this.dom.helpModal) this.setupTabSwipe(this.dom.helpModal);
        
        // External Links and Actions
        if (this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
        if (this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => { this.closeShare(); this.openSettings(); };
        
        let rScale = 100;
        const updateRedeem = () => { if(this.dom.redeemImg) this.dom.redeemImg.style.transform = `scale(${rScale/100})`; };
        
        if (this.dom.openRedeemBtn) this.dom.openRedeemBtn.onclick = () => { rScale = 100; updateRedeem(); this.toggleRedeem(true); };
        if (this.dom.closeRedeemBtn) this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);
        if (this.dom.openRedeemSettingsBtn) this.dom.openRedeemSettingsBtn.onclick = () => { rScale = 100; updateRedeem(); this.toggleRedeem(true); };
        if (this.dom.redeemPlus) this.dom.redeemPlus.onclick = () => { rScale = Math.min(100, rScale + 10); updateRedeem(); };
        if (this.dom.redeemMinus) this.dom.redeemMinus.onclick = () => { rScale = Math.max(10, rScale - 10); updateRedeem(); };
        
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
        
        document.querySelectorAll('.donate-quick-btn').forEach(btn => { 
            btn.onclick = () => { 
                const app = btn.dataset.app; 
                const amt = btn.dataset.amount; 
                if (app === 'cash') window.open(`https://cash.app/$jwo83/${amt}`, '_blank'); 
                if (app === 'paypal') window.open(`https://www.paypal.me/Oyster981/${amt}`, '_blank'); 
            }; 
        });

        if (this.dom.restoreBtn) {
            this.dom.restoreBtn.onclick = () => { if (confirm("Factory Reset?")) this.callbacks.onReset(); };
        }

        if (this.dom.nukeBtn) {
            this.dom.nukeBtn.onclick = () => {
                if (confirm("☢️ NUKE APP? This will wipe all saved data, clear browser caches, unregister Service Workers, and force a fresh update from the server.")) {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(regs => {
                            for (let r of regs) r.unregister();
                        });
                    }
                    if (window.caches) {
                        caches.keys().then(names => {
                            for (let name of names) caches.delete(name);
                        });
                    }
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload(true);
                }
            };
        }

        if (this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
        if (this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };

        if (this.dom.gestureTapSlider) {
            this.dom.gestureTapSlider.oninput = (e) => {
                const val = parseInt(e.target.value);
                this.appSettings.gestureTapDelay = val;
                if (this.dom.gestureTapVal) this.dom.gestureTapVal.textContent = val + 'ms';
                this.callbacks.onSave();
            };
        }
        
        if (this.dom.gestureSwipeSlider) {
            this.dom.gestureSwipeSlider.oninput = (e) => {
                const val = parseInt(e.target.value);
                this.appSettings.gestureSwipeDist = val;
                if (this.dom.gestureSwipeVal) this.dom.gestureSwipeVal.textContent = val + 'px';
                this.callbacks.onSave();
            };
        }
    }

    populateConfigDropdown() { 
        const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { 
            const o = document.createElement('option'); 
            o.value = id; 
            o.textContent = this.appSettings.profiles[id].name; 
            return o; 
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

    populateThemeDropdown() { 
        const s = this.dom.themeSelect; 
        if (!s || typeof PREMADE_THEMES === 'undefined') return; 
        s.innerHTML = ''; 
        const grp1 = document.createElement('optgroup'); 
        grp1.label = "Built-in"; 
        Object.keys(PREMADE_THEMES).forEach(k => { 
            const el = document.createElement('option'); 
            el.value = k; 
            el.textContent = PREMADE_THEMES[k].name; 
            grp1.appendChild(el); 
        }); 
        s.appendChild(grp1); 
        const grp2 = document.createElement('optgroup'); 
        grp2.label = "My Themes"; 
        if (this.appSettings.customThemes) {
            Object.keys(this.appSettings.customThemes).forEach(k => { 
                const el = document.createElement('option'); 
                el.value = k; 
                el.textContent = this.appSettings.customThemes[k].name; 
                grp2.appendChild(el); 
            }); 
        }
        s.appendChild(grp2); 
        s.value = this.appSettings.activeTheme; 
    }

    openSettings() { 
        this.populateConfigDropdown(); 
        this.populateThemeDropdown(); 
        this.updateUIFromSettings(); 
        if (this.dom.settingsModal) {
            this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); 
            this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); 
        }
    }

    openSetup() { 
        this.populateConfigDropdown(); 
        this.updateUIFromSettings(); 
        if (this.dom.setupModal) {
            this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); 
            this.dom.setupModal.querySelector('div').classList.remove('scale-90'); 
        }
    }

    closeSetup() { 
        this.callbacks.onSave(); 
        if (this.dom.setupModal) {
            this.dom.setupModal.classList.add('opacity-0'); 
            this.dom.setupModal.querySelector('div').classList.add('scale-90'); 
            setTimeout(() => this.dom.setupModal.classList.add('pointer-events-none'), 300); 
        }
    }

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
    if (!ps) return;

    // Apply visual states to the toggles
    if (this.dom.timerToggle) this.dom.timerToggle.checked = !!this.appSettings.showTimer;
    if (this.dom.autotimerToggle) this.dom.autotimerToggle.checked = !!this.appSettings.isAutoTimerEnabled;
    if (this.dom.counterToggle) this.dom.counterToggle.checked = !!this.appSettings.showCounter;
    if (this.dom.autocounterToggle) this.dom.autocounterToggle.checked = !!this.appSettings.isAutoCounterEnabled;
    if (this.dom.hapticsToggle) this.dom.hapticsToggle.checked = (typeof this.appSettings.isHapticsEnabled === 'undefined') ? true : this.appSettings.isHapticsEnabled;
    if (this.dom.introToggle) this.dom.introToggle.checked = !!this.appSettings.showWelcomeScreen;
    if (this.dom.upsidedownToggle) this.dom.upsidedownToggle.checked = !!this.appSettings.showUpsideDownBtn;
    if (this.dom.fullscreenToggle) this.dom.fullscreenToggle.checked = !!this.appSettings.showFullscreenBtn;
    if (this.dom.ecoToggle) this.dom.ecoToggle.checked = !!this.appSettings.isEcoModeEnabled;
    if (this.dom.wakelockToggle) this.dom.wakelockToggle.checked = (typeof this.appSettings.isWakeLockEnabled === 'undefined') ? true : this.appSettings.isWakeLockEnabled;
    if (this.dom.voiceToggle) this.dom.voiceToggle.checked = !!this.appSettings.isVoiceInputEnabled;
    if (this.dom.voicecommandsToggle) this.dom.voicecommandsToggle.checked = !!this.appSettings.isVoiceCommandsEnabled;
    if (this.dom.toneToggle) this.dom.toneToggle.checked = !!this.appSettings.isToneCadenceEnabled;
    if (this.dom.touchToggle) this.dom.touchToggle.checked = !!this.appSettings.isGestureInputEnabled;
    if (this.dom.bossToggle) this.dom.bossToggle.checked = !!this.appSettings.isBossModeEnabled;
    if (this.dom.newToggle) this.dom.newToggle.checked = !!this.appSettings.isNewFeatureEnabled;
    if (this.dom.biggerToggle) this.dom.biggerToggle.checked = !!this.appSettings.isStealth1KeyEnabled;
    if (this.dom.arcamToggle) this.dom.arcamToggle.checked = !!this.appSettings.isArModeEnabled;
    if (this.dom.handToggle) this.dom.handToggle.checked = !!this.appSettings.isHandGesturesEnabled;
    if (this.dom.handsignalsToggle) this.dom.handsignalsToggle.checked = !!this.appSettings.isHandSignalsEnabled;
    if (this.dom.speeddeleteToggle) this.dom.speeddeleteToggle.checked = (typeof this.appSettings.isSpeedDeletingEnabled === 'undefined') ? true : this.appSettings.isSpeedDeletingEnabled;
    if (this.dom.apshortcutToggle) this.dom.apshortcutToggle.checked = !!this.appSettings.isApShortcutEnabled;
    if (this.dom.volgesToggle) this.dom.volgesToggle.checked = !!this.appSettings.isVolumeGesturesEnabled;
    if (this.dom.speedToggle) this.dom.speedToggle.checked = !!this.appSettings.isSpeedGesturesEnabled;
    if (this.dom.deleteToggle) this.dom.deleteToggle.checked = !!this.appSettings.isDeleteGestureEnabled;
    if (this.dom.clearToggle) this.dom.clearToggle.checked = !!this.appSettings.isClearGestureEnabled;

    // Trigger the header to reflect these current states
    this.updateHeaderVisibility();
} // <--- THIS WAS MISSING!

updateHeaderVisibility() {
    const header = document.getElementById('aux-control-header');
    if (!header) return;

    // Toggle hidden classes based strictly on appSettings properties
    if (this.dom.headertimerbtn) this.dom.headertimerbtn.classList.toggle('hidden', !this.appSettings.showTimer);
    if (this.dom.headercounterbtn) this.dom.headercounterbtn.classList.toggle('hidden', !this.appSettings.showCounter);
    if (this.dom.headervoicebtn) this.dom.headervoicebtn.classList.toggle('hidden', !this.appSettings.isVoiceInputEnabled);
    if (this.dom.headertonebtn) this.dom.headertonebtn.classList.toggle('hidden', !this.appSettings.isToneCadenceEnabled);
    if (this.dom.headertouchbtn) this.dom.headertouchbtn.classList.toggle('hidden', !this.appSettings.isGestureInputEnabled);
    if (this.dom.headerhandbtn) this.dom.headerhandbtn.classList.toggle('hidden', !this.appSettings.isHandGesturesEnabled);
    if (this.dom.headerarcambtn) this.dom.headerarcambtn.classList.toggle('hidden', !this.appSettings.isArModeEnabled);
    if (this.dom.headerbiggerbtn) this.dom.headerbiggerbtn.classList.toggle('hidden', !this.appSettings.isStealth1KeyEnabled);
    if (this.dom.headerfullscreenbtn) this.dom.headerfullscreenbtn.classList.toggle('hidden', !this.appSettings.showFullscreenBtn);
    if (this.dom.headerupsidedownbtn) this.dom.headerupsidedownbtn.classList.toggle('hidden', !this.appSettings.showUpsideDownBtn);

    // Check if AT LEAST ONE header button is supposed to be visible
    const anyVisible = [
        this.appSettings.showTimer, 
        this.appSettings.showCounter, 
        this.appSettings.isVoiceInputEnabled,
        this.appSettings.isToneCadenceEnabled, 
        this.appSettings.isGestureInputEnabled, 
        this.appSettings.isHandGesturesEnabled, 
        this.appSettings.isArModeEnabled, 
        this.appSettings.isStealth1KeyEnabled, 
        this.appSettings.showFullscreenBtn, 
        this.appSettings.showUpsideDownBtn
    ].some(val => !!val);

    // Hide or show the entire header container based on if it's empty
    if (!anyVisible) {
        header.classList.add('header-hidden');
        header.classList.remove('pointer-events-auto'); // Ensures it doesn't block clicks when invisible
    } else {
        header.classList.remove('header-hidden');
        header.classList.add('pointer-events-auto');
    }
}

updateHeaderVisibility() {
    const header = document.getElementById('aux-control-header');
    if (!header) return;

    // Toggle hidden classes based strictly on appSettings properties
    if (this.dom.headertimerbtn) this.dom.headertimerbtn.classList.toggle('hidden', !this.appSettings.showTimer);
    if (this.dom.headercounterbtn) this.dom.headercounterbtn.classList.toggle('hidden', !this.appSettings.showCounter);
    if (this.dom.headervoicebtn) this.dom.headervoicebtn.classList.toggle('hidden', !this.appSettings.isVoiceInputEnabled);
    if (this.dom.headertonebtn) this.dom.headertonebtn.classList.toggle('hidden', !this.appSettings.isToneCadenceEnabled);
    if (this.dom.headertouchbtn) this.dom.headertouchbtn.classList.toggle('hidden', !this.appSettings.isGestureInputEnabled);
    if (this.dom.headerhandbtn) this.dom.headerhandbtn.classList.toggle('hidden', !this.appSettings.isHandGesturesEnabled);
    if (this.dom.headerarcambtn) this.dom.headerarcambtn.classList.toggle('hidden', !this.appSettings.isArModeEnabled);
    if (this.dom.headerbiggerbtn) this.dom.headerbiggerbtn.classList.toggle('hidden', !this.appSettings.isStealth1KeyEnabled);
    if (this.dom.headerfullscreenbtn) this.dom.headerfullscreenbtn.classList.toggle('hidden', !this.appSettings.showFullscreenBtn);
    if (this.dom.headerupsidedownbtn) this.dom.headerupsidedownbtn.classList.toggle('hidden', !this.appSettings.showUpsideDownBtn);

    // Check if AT LEAST ONE header button is supposed to be visible
    const anyVisible = [
        this.appSettings.showTimer, 
        this.appSettings.showCounter, 
        this.appSettings.isVoiceInputEnabled,
        this.appSettings.isToneCadenceEnabled, 
        this.appSettings.isGestureInputEnabled, 
        this.appSettings.isHandGesturesEnabled, 
        this.appSettings.isArModeEnabled, 
        this.appSettings.isStealth1KeyEnabled, 
        this.appSettings.showFullscreenBtn, 
        this.appSettings.showUpsideDownBtn
    ].some(val => !!val);

    // Hide or show the entire header container based on if it's empty
    if (!anyVisible) {
        header.classList.add('header-hidden');
        header.classList.remove('pointer-events-auto'); // Ensures it doesn't block clicks when invisible
    } else {
        header.classList.remove('header-hidden');
        header.classList.add('pointer-events-auto');
    }
}


    hexToHsl(hex) { 
        let r = 0, g = 0, b = 0; 
        if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } 
        else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } 
        r /= 255; g /= 255; b /= 255; 
        let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; 
        if (delta === 0) h = 0; 
        else if (cmax === r) h = ((g - b) / delta) % 6; 
        else if (cmax === g) h = (b - r) / delta + 2; 
        else h = (r - g) / delta + 4; 
        h = Math.round(h * 60); 
        if (h < 0) h += 360; 
        l = (cmax + cmin) / 2; 
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); 
        s = +(s * 100).toFixed(1); 
        l = +(l * 100).toFixed(1); 
        return [h, s, l]; 
    }

    hslToHex(h, s, l) { 
        s /= 100; l /= 100; 
        let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; 
        if (0 <= h && h < 60) { r = c; g = x; b = 0; } 
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; } 
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; } 
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; } 
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; } 
        else { r = c; g = 0; b = x; } 
        r = Math.round((r + m) * 255).toString(16); 
        g = Math.round((g + m) * 255).toString(16); 
        b = Math.round((b + m) * 255).toString(16); 
        if (r.length === 1) r = "0" + r; 
        if (g.length === 1) g = "0" + g; 
        if (b.length === 1) b = "0" + b; 
        return "#" + r + g + b; 
    }

    populateMappingUI() {
        if (!this.dom || !this.appSettings) return;
        
        if (!this.appSettings.gestureMappings || Object.keys(this.appSettings.gestureMappings).length === 0) {
            this.applyDefaultGestureMappings();
        }
        
        if (!this.appSettings.gestureProfiles) this.appSettings.gestureProfiles = {};

        const tabRoot = document.getElementById('tab-mapping');
        if (tabRoot) {
            tabRoot.className = "tab-content p-1 space-y-4";
            
            tabRoot.innerHTML = `
                <div class="p-3 mb-4 rounded-lg border border-custom bg-black bg-opacity-30">
                    <h4 class="font-bold text-sm mb-3 text-primary-app">Gesture Sensitivity 🎛️</h4>
                    <div class="mb-4">
                        <div class="flex justify-between mb-1">
                            <label class="text-xs font-bold">Tap Speed (ms)</label>
                            <span id="gesture-tap-val" class="text-xs font-mono">${this.appSettings.gestureTapDelay || 300}ms</span>
                        </div>
                        <input type="range" id="gesture-tap-slider" min="100" max="800" step="50" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" value="${this.appSettings.gestureTapDelay || 300}">
                        <p class="text-[10px] text-gray-400 mt-1">Faster time = harder to tap, easier to swipe.</p>
                    </div>
                    <div>
                        <div class="flex justify-between mb-1">
                            <label class="text-xs font-bold">Swipe Distance (px)</label>
                            <span id="gesture-swipe-val" class="text-xs font-mono">${this.appSettings.gestureSwipeDist || 30}px</span>
                        </div>
                        <input type="range" id="gesture-swipe-slider" min="10" max="100" step="5" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" value="${this.appSettings.gestureSwipeDist || 30}">
                        <p class="text-[10px] text-gray-400 mt-1">Higher distance = fewer accidental swipes.</p>
                    </div>
                </div>
            `;
            
            const tapSlider = document.getElementById('gesture-tap-slider');
            const swipeSlider = document.getElementById('gesture-swipe-slider');
            const tapVal = document.getElementById('gesture-tap-val');
            const swipeVal = document.getElementById('gesture-swipe-val');

            if(tapSlider) {
                tapSlider.oninput = (e) => {
                    const val = parseInt(e.target.value);
                    this.appSettings.gestureTapDelay = val;
                    if(tapVal) tapVal.textContent = val + 'ms';
                    this.callbacks.onSave();
                };
            }
            if(swipeSlider) {
                swipeSlider.oninput = (e) => {
                    const val = parseInt(e.target.value);
                    this.appSettings.gestureSwipeDist = val;
                    if(swipeVal) swipeVal.textContent = val + 'px';
                    this.callbacks.onSave();
                };
            }
        }

        const GESTURE_CATEGORIES = {
            'Taps': ['tap', 'double_tap', 'triple_tap', 'long_tap'],
            'Spatial Taps': ['Double_tap_spatial_any', 'Double_tap_spatial_up', 'Double_tap_spatial_down', 'Double_tap_spatial_left', 'Double_tap_spatial_right', 'Double_tap_spatial_nw', 'Double_tap_spatial_ne', 'Double_tap_spatial_sw', 'Double_tap_spatial_se', 'triple_tap_spatial_line_any', 'triple_tap_spatial_line_up', 'triple_tap_spatial_line_down', 'triple_tap_spatial_line_left', 'triple_tap_spatial_line_right', 'triple_tap_spatial_corner_ne', 'triple_tap_spatial_corner_nw', 'triple_tap_spatial_corner_se', 'triple_tap_spatial_corner_sw', 'triple_tap_spatial_corner_en', 'triple_tap_spatial_corner_wn', 'triple_tap_spatial_corner_es', 'triple_tap_spatial_corner_ws', 'triple_tap_spatial_boomerang_any', 'triple_tap_spatial_boomerang_up', 'triple_tap_spatial_boomerang_down', 'triple_tap_spatial_boomerang_left', 'triple_tap_spatial_boomerang_right'],
            'Multi-Finger Taps': ['tap_2f', 'tap_2f_vertical', 'tap_2f_horizontal', 'tap_2f_diagonal_se', 'tap_2f_diagonal_sw', 'double_tap_2f', 'double_tap_2f_vertical', 'double_tap_2f_horizontal', 'double_tap_2f_diagonal_se', 'double_tap_2f_diagonal_sw', 'triple_tap_2f', 'triple_tap_2f_vertical', 'triple_tap_2f_horizontal', 'triple_tap_2f_diagonal_se', 'triple_tap_2f_diagonal_sw', 'long_tap_2f', 'long_tap_2f_vertical', 'long_tap_2f_horizontal', 'long_tap_2f_diagonal_se', 'long_tap_2f_diagonal_sw', 'tap_3f', 'tap_3f_vertical', 'tap_3f_horizontal', 'tap_3f_diagonal_se', 'tap_3f_diagonal_sw', 'double_tap_3f', 'double_tap_3f_vertical', 'double_tap_3f_horizontal', 'double_tap_3f_diagonal_se', 'double_tap_3f_diagonal_sw', 'triple_tap_3f', 'triple_tap_3f_vertical', 'triple_tap_3f_horizontal', 'triple_tap_3f_diagonal_se', 'triple_tap_3f_diagonal_sw', 'long_tap_3f', 'long_tap_3f_vertical', 'long_tap_3f_horizontal', 'long_tap_3f_diagonal_se', 'long_tap_3f_diagonal_sw'],
            'Swipes': ['swipe_any', 'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right', 'swipe_nw', 'swipe_ne', 'swipe_sw', 'swipe_se'],
            'Long Swipes': ['swipe_long_any', 'swipe_long_up', 'swipe_long_down', 'swipe_long_left', 'swipe_long_right', 'swipe_long_nw', 'swipe_long_ne', 'swipe_long_sw', 'swipe_long_se'],
            'Multi-Finger Swipes': ['swipe_any_2f', 'swipe_up_2f', 'swipe_down_2f', 'swipe_left_2f', 'swipe_right_2f', 'swipe_nw_2f', 'swipe_ne_2f', 'swipe_sw_2f', 'swipe_se_2f', 'swipe_any_3f', 'swipe_up_3f', 'swipe_down_3f', 'swipe_left_3f', 'swipe_right_3f', 'swipe_nw_3f', 'swipe_ne_3f', 'swipe_sw_3f', 'swipe_se_3f', 'pinch_swipe_any_2f', 'pinch_swipe_up_2f', 'pinch_swipe_down_2f', 'pinch_swipe_left_2f', 'pinch_swipe_right_2f', 'expand_swipe_any_2f', 'expand_swipe_up_2f', 'expand_swipe_down_2f', 'expand_swipe_left_2f', 'expand_swipe_right_2f'],
            'Boomerangs': ['boomerang_any', 'boomerang_up', 'boomerang_down', 'boomerang_left', 'boomerang_right', 'boomerang_nw', 'boomerang_ne', 'boomerang_sw', 'boomerang_se', 'boomerang_any_2f', 'boomerang_up_2f', 'boomerang_down_2f', 'boomerang_left_2f', 'boomerang_right_2f', 'boomerang_any_3f', 'boomerang_up_3f', 'boomerang_down_3f', 'boomerang_left_3f', 'boomerang_right_3f', 'long_boomerang_any', 'long_boomerang_up', 'long_boomerang_down', 'long_boomerang_left', 'long_boomerang_right', 'long_boomerang_any_2f', 'long_boomerang_up_2f', 'long_boomerang_down_2f', 'long_boomerang_left_2f', 'long_boomerang_right_2f'],
            'Switchbacks': ['switchback_any', 'switchback_any_cw', 'switchback_any_ccw', 'switchback_up_cw', 'switchback_down_cw', 'switchback_left_cw', 'switchback_right_cw', 'switchback_nw_cw', 'switchback_ne_cw', 'switchback_sw_cw', 'switchback_se_cw', 'switchback_up_ccw', 'switchback_down_ccw', 'switchback_left_ccw', 'switchback_right_ccw', 'switchback_nw_ccw', 'switchback_ne_ccw', 'switchback_sw_ccw', 'switchback_se_ccw'],
            'Zigzags': ['zigzag_any', 'zigzag_any_cw', 'zigzag_any_ccw', 'zigzag_up_cw', 'zigzag_down_cw', 'zigzag_left_cw', 'zigzag_right_cw', 'zigzag_nw_cw', 'zigzag_ne_cw', 'zigzag_sw_cw', 'zigzag_se_cw', 'zigzag_up_ccw', 'zigzag_down_ccw', 'zigzag_left_ccw', 'zigzag_right_ccw', 'zigzag_nw_ccw', 'zigzag_ne_ccw', 'zigzag_sw_ccw', 'zigzag_se_ccw'],
            'Corners & Shapes': ['corner_any', 'corner_cw', 'corner_ccw', 'corner_up_cw', 'corner_right_cw', 'corner_down_cw', 'corner_left_cw', 'corner_up_ccw', 'corner_left_ccw', 'corner_down_ccw', 'corner_right_ccw', 'triangle_any', 'triangle_cw', 'triangle_ccw', 'triangle_up_cw', 'triangle_right_cw', 'triangle_down_cw', 'triangle_left_cw', 'triangle_up_ccw', 'triangle_left_ccw', 'triangle_down_ccw', 'triangle_right_ccw', 'u_shape_any', 'u_shape_cw', 'u_shape_ccw', 'u_shape_up_cw', 'u_shape_right_cw', 'u_shape_down_cw', 'u_shape_left_cw', 'u_shape_up_ccw', 'u_shape_left_ccw', 'u_shape_down_ccw', 'u_shape_right_ccw', 'square_any', 'square_cw', 'square_ccw', 'square_up_cw', 'square_right_cw', 'square_down_cw', 'square_left_cw', 'square_up_ccw', 'square_left_ccw', 'square_down_ccw', 'square_right_ccw'],
            'Motion Gestures': ['motion_tap_swipe_any', 'motion_tap_swipe_up', 'motion_tap_swipe_down', 'motion_tap_swipe_left', 'motion_tap_swipe_right', 'motion_tap_swipe_nw', 'motion_tap_swipe_ne', 'motion_tap_swipe_sw', 'motion_tap_swipe_se', 'motion_tap_swipe_long_any', 'motion_tap_swipe_long_up', 'motion_tap_swipe_long_down', 'motion_tap_swipe_long_left', 'motion_tap_swipe_long_right', 'motion_tap_swipe_long_nw', 'motion_tap_swipe_long_ne', 'motion_tap_swipe_long_sw', 'motion_tap_swipe_long_se', 'motion_tap_boomerang_any', 'motion_tap_boomerang_up', 'motion_tap_boomerang_down', 'motion_tap_boomerang_left', 'motion_tap_boomerang_right', 'motion_tap_boomerang_nw', 'motion_tap_boomerang_ne', 'motion_tap_boomerang_sw', 'motion_tap_boomerang_se', 'motion_tap_corner_any', 'motion_tap_corner_cw', 'motion_tap_corner_ccw', 'motion_tap_corner_up_cw', 'motion_tap_corner_right_cw', 'motion_tap_corner_left_cw', 'motion_tap_corner_down_cw', 'motion_tap_corner_up_ccw', 'motion_tap_corner_right_ccw', 'motion_tap_corner_left_ccw', 'motion_tap_corner_down_ccw'],
            'Flicks': ['Flick_any', 'Flick_up', 'Flick_down', 'Flick_left', 'Flick_right', 'Flick_nw', 'Flick_ne', 'Flick_sw', 'Flick_se'],
            'Pausing Curves': ['Pausing_swipe_any', 'Pausing_swipe_up', 'Pausing_swipe_down', 'Pausing_swipe_left', 'Pausing_swipe_right', 'Pausing_swipe_nw', 'Pausing_swipe_ne', 'Pausing_swipe_sw', 'Pausing_swipe_se', 'Pausing_boomerang_any', 'Pausing_boomerang_up', 'Pausing_boomerang_down', 'Pausing_boomerang_left', 'Pausing_boomerang_right', 'Pausing_boomerang_nw', 'Pausing_boomerang_ne', 'Pausing_boomerang_sw', 'Pausing_boomerang_se', 'Pausing_Switchback_any', 'Pausing_Switchback_cw', 'Pausing_Switchback_ccw', 'Pausing_Switchback_up_cw', 'Pausing_Switchback_down_cw', 'Pausing_Switchback_left_cw', 'Pausing_Switchback_right_cw', 'Pausing_Switchback_nw_cw', 'Pausing_Switchback_ne_cw', 'Pausing_Switchback_sw_cw', 'Pausing_Switchback_se_cw', 'Pausing_Switchback_up_ccw', 'Pausing_Switchback_down_ccw', 'Pausing_Switchback_left_ccw', 'Pausing_Switchback_right_ccw', 'Pausing_Switchback_nw_ccw', 'Pausing_Switchback_ne_ccw', 'Pausing_Switchback_sw_ccw', 'Pausing_Switchback_se_ccw', 'Pausing_corner_any', 'Pausing_corner_cw', 'Pausing_corner_ccw', 'Pausing_corner_up_cw', 'Pausing_corner_right_cw', 'Pausing_corner_down_cw', 'Pausing_corner_left_cw', 'Pausing_corner_up_ccw', 'Pausing_corner_left_ccw', 'Pausing_corner_down_ccw', 'Pausing_corner_right_ccw']
        };

        if (!this.appSettings.activeGestureFilters) {
            this.appSettings.activeGestureFilters = ['Taps', 'Multi-Finger Taps', 'Swipes'];
        }

        const getAvailableGestures = () => {
            let available = [];
            this.appSettings.activeGestureFilters.forEach(cat => {
                if (GESTURE_CATEGORIES[cat]) available.push(...GESTURE_CATEGORIES[cat]);
            });
            return available;
        };

        this.updateAllMappingDropdowns = () => {
            const available = getAvailableGestures();
            const dropdowns = document.querySelectorAll('.gesture-map-select');
            dropdowns.forEach(select => {
                const currentVal = select.value;
                select.innerHTML = '';
                
                available.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g;
                    select.appendChild(opt);
                });
                
                if (!available.includes(currentVal) && currentVal) {
                    const opt = document.createElement('option');
                    opt.value = currentVal;
                    opt.textContent = currentVal;
                    select.appendChild(opt);
                }
                select.value = currentVal;
            });
        };

        const buildSection = (type, title, keyPrefix, count, customKeys = null, isOpen = false) => {
            const details = document.createElement('details');
            details.className = "group rounded-lg border border-custom bg-black bg-opacity-20 mb-3 open:bg-opacity-40 transition-all";
            if (isOpen) details.open = true;

            const summary = document.createElement('summary');
            summary.className = "cursor-pointer p-3 font-bold text-sm select-none flex justify-between items-center text-gray-200 hover:text-white";
            summary.innerHTML = `<span>${title} Mapping</span><span class="group-open:rotate-180 transition-transform">▼</span>`;
            details.appendChild(summary);

            const contentDiv = document.createElement('div');
            contentDiv.className = "p-3 pt-0 border-t border-gray-700 mt-2";
            
            const profileHeader = document.createElement('div');
            profileHeader.innerHTML = `<label class="text-xs font-bold uppercase text-muted-custom block mb-1 mt-2">Active Preset</label>`;
            contentDiv.appendChild(profileHeader);

            const select = document.createElement('select');
            select.className = "settings-input w-full p-2 rounded mb-3 font-bold text-xs";
            
            const populateSelect = () => {
                select.innerHTML = '';
                const def = document.createElement('option');
                def.textContent = "-- Select Preset --";
                def.value = "";
                select.appendChild(def);

                const grp1 = document.createElement('optgroup'); grp1.label = "Built-in";
                
                const safePresets = (typeof GESTURE_PRESETS !== 'undefined') ? GESTURE_PRESETS : {};

                Object.keys(safePresets).forEach(k => {
                    if(safePresets[k].type === type) {
                        const opt = document.createElement('option');
                        opt.value = k;
                        opt.textContent = safePresets[k].name;
                        grp1.appendChild(opt);
                    }
                });
                select.appendChild(grp1);

                const grp2 = document.createElement('optgroup'); grp2.label = "My Setups";
                if(this.appSettings.gestureProfiles) {
                    Object.keys(this.appSettings.gestureProfiles).forEach(k => {
                        if(this.appSettings.gestureProfiles[k].type === type) {
                            const opt = document.createElement('option');
                            opt.value = k;
                            opt.textContent = this.appSettings.gestureProfiles[k].name;
                            grp2.appendChild(opt);
                        }
                    });
                }
                select.appendChild(grp2);
            };
            populateSelect();
            contentDiv.appendChild(select);

            const btnGrid = document.createElement('div');
            btnGrid.className = "grid grid-cols-2 gap-2 mb-4"; 
            
            const createBtn = (txt, color, onClick) => {
                const b = document.createElement('button');
                b.textContent = txt;
                b.className = `py-2 text-xs bg-${color}-600 hover:bg-${color}-500 rounded text-white font-bold transition shadow`;
                b.onclick = (e) => { e.stopPropagation(); onClick(); }; 
                return b;
            };

            btnGrid.append(
                createBtn("NEW", "blue", () => {
                    const name = prompt("New Profile Name:");
                    if(!name) return;
                    const id = 'cust_gest_' + Date.now();
                    const currentMap = {};
                    listContainer.querySelectorAll('select.gesture-map-select').forEach(inp => currentMap[inp.dataset.key] = inp.value);
                    this.appSettings.gestureProfiles[id] = { name: name, type: type, map: currentMap };
                    this.callbacks.onSave();
                    populateSelect();
                    select.value = id;
                }),
                createBtn("SAVE 💾", "green", () => {
                    const val = select.value;
                    if(!val || val.indexOf('cust_') === -1) return alert("Select a custom profile to save (or use NEW).");
                    const currentMap = {};
                    listContainer.querySelectorAll('select.gesture-map-select').forEach(inp => currentMap[inp.dataset.key] = inp.value);
                    this.appSettings.gestureProfiles[val].map = currentMap;
                    this.callbacks.onSave();
                    alert("Profile Saved!");
                }),
                createBtn("RENAME", "gray", () => {
                    const val = select.value;
                    if(!val || val.indexOf('cust_') === -1) return alert("Cannot rename built-in profiles.");
                    const newName = prompt("Rename:", this.appSettings.gestureProfiles[val].name);
                    if(newName) {
                        this.appSettings.gestureProfiles[val].name = newName;
                        this.callbacks.onSave();
                        populateSelect();
                        select.value = val;
                    }
                }),
                createBtn("DELETE", "red", () => {
                    const val = select.value;
                    if(!val || val.indexOf('cust_') === -1) return alert("Cannot delete built-in profiles.");
                    if(confirm("Delete this profile?")) {
                        delete this.appSettings.gestureProfiles[val];
                        this.callbacks.onSave();
                        populateSelect();
                    }
                })
            );
            contentDiv.appendChild(btnGrid);

            const listContainer = document.createElement('div');
            listContainer.className = "space-y-2 border-t border-custom pt-3 max-h-60 overflow-y-auto";
            contentDiv.appendChild(listContainer);

            const renderMappings = () => {
                listContainer.innerHTML = '';
                const keysToRender = customKeys || Array.from({length: count}, (_, i) => String(i + 1));
                
                keysToRender.forEach(k => {
                    const keyId = keyPrefix + k;
                    const row = document.createElement('div');
                    row.className = "flex items-center space-x-2 mb-2";

                    const lbl = document.createElement('div');
                    lbl.className = "text-sm font-bold w-8 h-10 flex items-center justify-center bg-gray-800 rounded border border-gray-600 shrink-0";
                    lbl.textContent = k;

                    const dropTouch = document.createElement('select');
                    dropTouch.className = "settings-input p-1 rounded text-[10px] h-10 border border-custom flex-1 w-0 gesture-map-select";
                    dropTouch.dataset.key = keyId; 

                    const mapping = (this.appSettings.gestureMappings && this.appSettings.gestureMappings[keyId]) 
                        ? this.appSettings.gestureMappings[keyId] 
                        : {};

                    let savedGesture = mapping.gesture || 'tap';

                    const availableGestures = getAvailableGestures();
                    availableGestures.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g;
                        opt.textContent = g; 
                        dropTouch.appendChild(opt);
                    });

                    if (!availableGestures.includes(savedGesture) && savedGesture) {
                        const opt = document.createElement('option');
                        opt.value = savedGesture;
                        opt.textContent = savedGesture;
                        dropTouch.appendChild(opt);
                    }
                    dropTouch.value = savedGesture;

                    const dropHand = document.createElement('select');
                    dropHand.className = "settings-input p-1 rounded text-[10px] h-10 border border-custom flex-1 w-0 bg-blue-900 bg-opacity-20";
                    
                    const defHand = document.createElement('option');
                    defHand.value = ""; 
                    defHand.textContent = "- Hand -";
                    dropHand.appendChild(defHand);
                    
                    const handList = (typeof HAND_GESTURES_LIST !== 'undefined') ? HAND_GESTURES_LIST : [];

                    handList.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g;
                        opt.textContent = g.replace('hand_', '').replace('_', ' ').replace('fist', '✊ Fist').toUpperCase(); 
                        dropHand.appendChild(opt);
                    });

                    dropHand.value = mapping.hand || '';

                    const save = () => {
                        if(!this.appSettings.gestureMappings[keyId]) this.appSettings.gestureMappings[keyId] = {};
                        this.appSettings.gestureMappings[keyId].gesture = dropTouch.value;
                        this.appSettings.gestureMappings[keyId].hand = dropHand.value;
                        this.callbacks.onSave();
                    };

                    dropTouch.onchange = save;
                    dropHand.onchange = save;

                    row.appendChild(lbl);
                    row.appendChild(dropTouch);
                    row.appendChild(dropHand);
                    listContainer.appendChild(row);
                });
            };

            renderMappings();

            select.onchange = () => {
                 const val = select.value;
                 if(!val) return;
                 const safePresets = (typeof GESTURE_PRESETS !== 'undefined') ? GESTURE_PRESETS : {};
                 
                 let data = safePresets[val] ? safePresets[val].map : (this.appSettings.gestureProfiles[val] ? this.appSettings.gestureProfiles[val].map : null);
                 if(data) {
                     Object.keys(data).forEach(key => {
                         if(!this.appSettings.gestureMappings[key]) this.appSettings.gestureMappings[key] = {};
                         
                         const entry = data[key];
                         if (typeof entry === 'string') {
                             this.appSettings.gestureMappings[key].gesture = entry;
                         } else if (typeof entry === 'object') {
                             if(entry.gesture) this.appSettings.gestureMappings[key].gesture = entry.gesture;
                             if(entry.hand) this.appSettings.gestureMappings[key].hand = entry.hand;
                         }
                     });
                     this.callbacks.onSave();
                     renderMappings();
                 }
            };
            
            details.appendChild(contentDiv);
            if(tabRoot) tabRoot.appendChild(details);
        };

        buildSection('key9', '9-Key', 'k9_', 9, null, true); 
        buildSection('key12', '12-Key', 'k12_', 12);
        buildSection('piano', 'Piano', 'piano_', 0, ['C','D','E','F','G','A','B','1','2','3','4','5']);

        if (tabRoot) {
            const filterContainer = document.createElement('div');
            filterContainer.className = "p-3 mt-4 mb-4 rounded-lg border border-custom bg-black bg-opacity-30";
            filterContainer.innerHTML = `<h4 class="font-bold text-sm mb-3 text-primary-app">Visible Gesture Types 🔍</h4><div class="grid grid-cols-2 gap-2" id="gesture-filter-grid"></div>`;
            tabRoot.appendChild(filterContainer);

            const grid = document.getElementById('gesture-filter-grid');
            if (grid) {
                Object.keys(GESTURE_CATEGORIES).forEach(cat => {
                    const lbl = document.createElement('label');
                    lbl.className = "flex items-center space-x-2 text-xs font-bold text-gray-300 cursor-pointer";
                    const cb = document.createElement('input');
                    cb.type = "checkbox";
                    cb.className = "accent-indigo-500 gesture-filter-toggle w-4 h-4";
                    cb.dataset.category = cat;
                    cb.checked = this.appSettings.activeGestureFilters.includes(cat);
                    
                    cb.onchange = (e) => {
                        if (e.target.checked) {
                            if (!this.appSettings.activeGestureFilters.includes(cat)) {
                                this.appSettings.activeGestureFilters.push(cat);
                            }
                        } else {
                            this.appSettings.activeGestureFilters = this.appSettings.activeGestureFilters.filter(c => c !== cat);
                        }
                        this.callbacks.onSave();
                        this.updateAllMappingDropdowns();
                    };
                    
                    lbl.appendChild(cb);
                    lbl.appendChild(document.createTextNode(" " + cat));
                    grid.appendChild(lbl);
                });
            }
        }
    }

    populateMorseUI() {
        const tab = document.getElementById('tab-playback');
        if (!tab) return;
        
        let container = document.getElementById('morse-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'morse-container';
            container.className = "mt-6 p-4 rounded-lg bg-black bg-opacity-20 border border-gray-700";
            tab.appendChild(container);
        }

        const morseOptions = [];
        const chars = ['.', '-'];
        const generate = (current) => {
            if (current.length > 0) morseOptions.push(current);
            if (current.length >= 5) return;
            chars.forEach(c => generate(current + c));
        };
        generate('');
        
        morseOptions.sort((a, b) => {
            const lenDiff = a.length - b.length;
            if (lenDiff !== 0) return lenDiff;
            return a.localeCompare(b);
        });

        const labels = ["1", "2", "3", "4", "5", "6 C", "7 D", "8 E", "9 F", "10 G", "11 A", "12 B"];
        let gridHtml = `<div class="grid grid-cols-4 gap-y-3 gap-x-2 items-center">`;
        
        labels.forEach((label, index) => {
            const val = index + 1;
            let optionsHtml = `<optgroup label="Morse Patterns">`;
            optionsHtml += morseOptions.map(m => `<option value="${m}">${m}</option>`).join('');
            optionsHtml += `</optgroup>`;

            gridHtml += `
                <div class="text-right text-xs font-bold text-gray-400 pr-1 whitespace-nowrap">${label}</div>
                <select class="bg-gray-800 text-white text-xs p-1 rounded border border-gray-600 focus:border-primary-app outline-none h-8 w-full font-mono tracking-widest text-center" data-morse-id="${val}">
                    ${optionsHtml}
                </select>
            `;
        });
        
        gridHtml += `</div>`;

        container.innerHTML = `
            <h3 class="text-sm font-bold uppercase text-gray-400 mb-3">Haptic Output Mapping</h3>
            ${gridHtml}
            <p class="text-[10px] text-gray-500 mt-3 text-center">Custom dot/dash patterns for playback.</p>
        `;

        const selects = container.querySelectorAll('select');
        selects.forEach(sel => {
            const id = sel.dataset.morseId;
            
            if (this.appSettings.morseMappings && this.appSettings.morseMappings[id]) {
                sel.value = this.appSettings.morseMappings[id];
            } else {
                let d = "";
                const n = parseInt(id);
                if (n <= 3) d = ".".repeat(n);
                else if (n <= 6) d = "-" + ".".repeat(n-3);
                else if (n <= 9) d = "--" + ".".repeat(n-6);
                else d = "---" + ".".repeat(n-10);
                sel.value = d;
            }

            sel.onchange = () => {
                if (!this.appSettings.morseMappings) this.appSettings.morseMappings = {};
                this.appSettings.morseMappings[id] = sel.value;
                this.callbacks.onSave();

                if (navigator.vibrate) {
                    const pattern = [];
                    const speed = this.appSettings.playbackSpeed || 1.0;
                    const factor = 1.0 / speed; 
                    const DOT = 100 * factor, DASH = 300 * factor, GAP = 100 * factor;
                    
                    for (let char of sel.value) {
                        if(char === '.') pattern.push(DOT);
                        if(char === '-') pattern.push(DASH);
                        pattern.push(GAP);
                    }
                    if(pattern.length) navigator.vibrate(pattern);
                }
            };
        });
    }

    applyDefaultGestureMappings() {
        this.appSettings.gestureMappings = this.appSettings.gestureMappings || {};
        
        const defaults = {
            'k9_1': { gesture: 'tap' }, 
            'k9_2': { gesture: 'double_tap' }, 
            'k9_3': { gesture: 'triple_tap' }, 
            'k9_4': { gesture: 'tap_2f_any' }, 
            'k9_5': { gesture: 'double_tap_2f_any' }, 
            'k9_6': { gesture: 'triple_tap_2f_any' }, 
            'k9_7': { gesture: 'tap_3f_any' }, 
            'k9_8': { gesture: 'double_tap_3f_any' }, 
            'k9_9': { gesture: 'triple_tap_3f_any' },

            'k12_1': { gesture: 'tap' }, 
            'k12_2': { gesture: 'double_tap' }, 
            'k12_3': { gesture: 'triple_tap' }, 
            'k12_4': { gesture: 'long_tap' }, 
            'k12_5': { gesture: 'tap_2f_any' }, 
            'k12_6': { gesture: 'double_tap_2f_any' }, 
            'k12_7': { gesture: 'triple_tap_2f_any' }, 
            'k12_8': { gesture: 'long_tap_2f_any' }, 
            'k12_9': { gesture: 'tap_3f_any' }, 
            'k12_10': { gesture: 'double_tap_3f_any' }, 
            'k12_11': { gesture: 'triple_tap_3f_any' }, 
            'k12_12': { gesture: 'long_tap_3f_any' },

            'piano_C': { gesture: 'swipe_nw' }, 
            'piano_D': { gesture: 'swipe_left' }, 
            'piano_E': { gesture: 'swipe_sw' }, 
            'piano_F': { gesture: 'swipe_down' }, 
            'piano_G': { gesture: 'swipe_se' }, 
            'piano_A': { gesture: 'swipe_right' }, 
            'piano_B': { gesture: 'swipe_ne' }, 
            'piano_1': { gesture: 'swipe_left_2f' }, 
            'piano_2': { gesture: 'swipe_nw_2f' }, 
            'piano_3': { gesture: 'swipe_up_2f' }, 
            'piano_4': { gesture: 'swipe_ne_2f' }, 
            'piano_5': { gesture: 'swipe_right_2f' }
        };
        this.appSettings.gestureMappings = Object.assign({}, defaults, this.appSettings.gestureMappings || {});
    }
}