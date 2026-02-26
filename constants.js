/* ========================================
   FILE: app.js
   ======================================== */

import { loadState, saveState, appSettings, getState, modules } from './state.js';
import { CONFIG, DEFAULT_PROFILE_SETTINGS } from './constants.js';
import { renderUI } from './renderer.js';
import { SettingsManager } from './settings.js';
import { VisionEngine } from './vision.js';
import { SensorEngine } from './sensors.js';
import { VoiceCommander } from './voice-commander.js';
import { initComments } from './comments.js';
import { showToast, updateAllChrome } from './ui-core.js';
import { addValue, playDemo, handleBackspace } from './game-logic.js';
import { initGlobalListeners } from './global-listeners.js';
import { initGestureEngine } from './gesture-engine-setup.js';
import { mapGestureToValue } from './gesture-mappings.js';
import { db } from './firebase-setup.js';
import { injectModals } from './ui-modals.js';
import { initUIController } from './ui-controller.js';

let isDeveloperMode = localStorage.getItem('isDeveloperMode') === 'true';
let devClickCount = 0;

export const startApp = () => {
    console.log("🛠️ System Boot Sequence Initiated...");

    loadState();
    injectModals();

    modules.settings = new SettingsManager(appSettings, {
        onSave: saveState,
        onUpdate: (type) => { 
            if (type === 'mode_switch') {
                const s = getState();
                s.sequences = Array.from({ length: CONFIG.MAX_MACHINES || 10 }, () => []);
                s.nextSequenceIndex = 0;
                s.currentRound = 1;
                renderUI();
            } else {
                updateAllChrome(); 
                applyDeveloperVisibility();
                updateDynamicIncrements();
            }
        },
        onReset: () => { 
            if (confirm("Factory Reset?")) {
                localStorage.clear(); 
                location.reload(); 
            }
        }
    });

    // Initialize remaining modules
    modules.sensor = new SensorEngine((val) => { addValue(val); triggerKeypadVisuals(val); });
    modules.vision = new VisionEngine((gst) => {
        const val = mapGestureToValue(gst, appSettings.runtimeSettings.currentInput);
        if (val) { addValue(val); triggerKeypadVisuals(val); }
    });

    initUIController();
    initGlobalListeners(); 
    initGestureEngine();
    initDeveloperControls();
    
    updateAllChrome();
    renderUI();
    console.log("🚀 System Online.");
};

function triggerKeypadVisuals(val) {
    const btn = document.querySelector(`button[data-value="${val}"]`);
    if (btn) {
        btn.classList.add('flash-active');
        setTimeout(() => btn.classList.remove('flash-active'), 200);
    }
}

function initDeveloperControls() {
    const trigger = document.getElementById('dev-secret-trigger');
    if (trigger) {
        trigger.addEventListener('click', () => {
            devClickCount++;
            if (devClickCount >= 7) {
                isDeveloperMode = true;
                localStorage.setItem('isDeveloperMode', 'true');
                showToast("Developer Access Granted");
                applyDeveloperVisibility();
            }
        });
    }
}

export function applyDeveloperVisibility() {
    const trigger = document.getElementById('dev-secret-trigger');
    if (isDeveloperMode && trigger) trigger.classList.add('text-blue-500', 'animate-pulse');
}

export function updateDynamicIncrements() {
    const speedSlider = document.getElementById('playback-speed-slider');
    if (speedSlider) speedSlider.step = appSettings.devSpeedIncrement || "0.05";
}


// DICTIONARY for Audio/TTS translations
export const DICTIONARY = {
    'en': {
        correct: "Correct", 
        wrong: "Wrong", 
        stealth: "Stealth Active",
        piano_mode: "Piano Mode Active"
    },
    'es': {
        correct: "Correcto", 
        wrong: "Incorrecto", 
        stealth: "Sigilo Activo",
        piano_mode: "Modo Piano Activo",
    
  
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
}};
export const PREMADE_VOICE_PRESETS = {
    'standard': { name: "Standard", pitch: 1.0, rate: 1.0, volume: 1.0 },
    'speed': { name: "Speed Reader", pitch: 1.0, rate: 1.8, volume: 1.0 },
    'slow': { name: "Slow Motion", pitch: 0.9, rate: 0.6, volume: 1.0 },
    'deep': { name: "Deep Voice", pitch: 0.6, rate: 0.9, volume: 1.0 },
    'high': { name: "Chipmunk", pitch: 1.8, rate: 1.1, volume: 1.0 },
    'robot': { name: "Robot", pitch: 0.5, rate: 0.8, volume: 1.0 },
    'announcer': { name: "Announcer", pitch: 0.8, rate: 1.1, volume: 1.0 },
    'whisper': { name: "Quiet", pitch: 1.2, rate: 0.8, volume: 0.4 }
}};
            
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
    
lp_gesture_detail: "Gestos BM: Un sistema de entrada 'sin mirar' para valores del 1 al 12."
        }
    };
    