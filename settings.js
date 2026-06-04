import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { HAND_GESTURE_GROUPS, TOUCH_GESTURE_GROUPS } from './gesture_groups.js';

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
    { value: 'double_tap', label: '👆👆 Double Taps' },
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
    '9_taps': {
        name: "Taps (Default)",
        type: 'key9',
        map: {
            'k9_1': 'tap', 'k9_2': 'double_tap', 'k9_3': 'triple_tap',
            'k9_4': 'tap_2f_any', 'k9_5': 'double_tap_2f_any', 'k9_6': 'triple_tap_2f_any',
            'k9_7': 'tap_3f_any', 'k9_8': 'double_tap_3f_any', 'k9_9': 'triple_tap_3f_any'
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
            'k9_1': 'motion_tap_spatial_nw', 'k9_2': 'motion_tap_spatial_up', 'k9_3': 'motion_tap_spatial_ne',
            'k9_4': 'motion_tap_spatial_left', 'k9_5': 'double_tap', 'k9_6': 'motion_tap_spatial_right',
            'k9_7': 'motion_tap_spatial_sw', 'k9_8': 'motion_tap_spatial_down', 'k9_9': 'motion_tap_spatial_se' 
        }
    },
    '9_hand_count': {
        name: "Hand Count (Up/Down)",
        type: 'key9',
        map: {
            'k9_1': { hand: 'hand_1_up' }, 'k9_2': { hand: 'hand_2_up' }, 'k9_3': { hand: 'hand_3_up' },
            'k9_4': { hand: 'hand_4_up' }, 'k9_5': { hand: 'hand_5_up' }, 'k9_6': { hand: 'hand_1_down' },
            'k9_7': { hand: 'hand_2_down' }, 'k9_8': { hand: 'hand_3_down' }, 'k9_9': { hand: 'hand_4_down' }
        }
    },
    '12_taps': {
        name: "Taps (Default)",
        type: 'key12',
        map: {
            'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
            'k12_5': 'tap_2f_any', 'k12_6': 'double_tap_2f_any', 'k12_7': 'triple_tap_2f_any', 'k12_8': 'long_tap_2f_any',
            'k12_9': 'tap_3f_any', 'k12_10': 'double_tap_3f_any', 'k12_11': 'triple_tap_3f_any', 'k12_12': 'long_tap_3f_any'
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
    '12_hand_extended': {
        name: "Hand Extended (Up/Down/Side)",
        type: 'key12',
        map: {
            'k12_1': { hand: 'hand_1_up' }, 'k12_2': { hand: 'hand_2_up' }, 'k12_3': { hand: 'hand_3_up' },
            'k12_4': { hand: 'hand_4_up' }, 'k12_5': { hand: 'hand_5_up' },
            'k12_6': { hand: 'hand_1_down' }, 'k12_7': { hand: 'hand_2_down' }, 'k12_8': { hand: 'hand_3_down' },
            'k12_9': { hand: 'hand_4_down' }, 'k12_10': { hand: 'hand_5_down' },
            'k12_11': { hand: 'hand_1_right' }, 'k12_12': { hand: 'hand_1_left' }
        }
    },
    'piano_swipes': {
        name: "Swipes (Default)",
        type: 'piano',
        map: {
            'piano_C': 'swipe_nw', 'piano_D': 'swipe_left', 'piano_E': 'swipe_sw', 
            'piano_F': 'swipe_down', 'piano_G': 'swipe_se', 'piano_A': 'swipe_right', 'piano_B': 'swipe_ne',
            'piano_1': 'swipe_left_2f', 'piano_2': 'swipe_nw_2f', 'piano_3': 'swipe_up_2f', 
            'piano_4': 'swipe_ne_2f', 'piano_5': 'swipe_right_2f'
        }
    },
    'piano_taps': {
        name: "Taps Only",
        type: 'piano',
        map: {
            'piano_C': 'tap', 'piano_D': 'double_tap', 'piano_E': 'triple_tap',
            'piano_F': 'long_tap', 'piano_G': 'tap_2f_any', 'piano_A': 'double_tap_2f_any',
            'piano_B': 'triple_tap_2f_any', 'piano_1': 'tap_3f_any', 'piano_2': 'double_tap_3f_any',
            'piano_3': 'triple_tap_3f_any', 'piano_4': 'long_tap_2f_any', 'piano_5': 'long_tap_3f_any'
        }
    },
    'piano_hand_hybrid': {
        name: "Piano Hands",
        type: 'piano',
        map: {
            'piano_C': { hand: 'hand_1_up' }, 'piano_D': { hand: 'hand_2_up' }, 'piano_E': { hand: 'hand_3_up' },
            'piano_F': { hand: 'hand_4_up' }, 'piano_G': { hand: 'hand_5_up' },
            'piano_A': { hand: 'hand_1_right' }, 'piano_B': { hand: 'hand_2_right' },
            'piano_1': { hand: 'hand_1_down' }, 'piano_2': { hand: 'hand_2_down' }, 'piano_3': { hand: 'hand_3_down' },
            'piano_4': { hand: 'hand_4_down' }, 'piano_5': { hand: 'hand_5_down' }
        }
    }
};

const CRAYONS = ["#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", "#B0B7C6", "#AF4035", "#F5F5F5"];

const LANG = {
    en: {
        quick_title: "👋 Quick Start",
        select_profile: "Select Profile",
        autoplay: "Autoplay",
        audio: "Audio",
        help_btn: "Help 📚",
        settings_btn: "Settings",
        dont_show: "Don't show again",
        lbl_profiles: "Profiles",
        lbl_game: "Game",
        lbl_playback: "Playback",
        lbl_general: "General",
        lbl_mode: "Mode",
        lbl_input: "Input",
        timer_toggle: "Timer ⏱️",
        counter_toggle: "Counter #"
    },
    es: {
        quick_title: "👋 Inicio Rápido",
        select_profile: "Perfil",
        autoplay: "Auto-reproducción",
        audio: "Audio",
        help_btn: "Ayuda 📚",
        settings_btn: "Ajustes",
        dont_show: "No mostrar más",
        lbl_profiles: "Perfiles",
        lbl_game: "Juego",
        lbl_playback: "Reproducción",
        lbl_general: "General",
        lbl_mode: "Modo",
        lbl_input: "Entrada",
        timer_toggle: "Mostrar Temporizador",
        counter_toggle: "Mostrar Contador"
    }
};

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings;
        this.callbacks = callbacks;
        this.sensorEngine = sensorEngine;
        this.currentTargetKey = 'bubble';

        this.dom = {
            editorModal: document.getElementById('theme-editor-modal'),
            editorGrid: document.getElementById('color-grid'),
            ftContainer: document.getElementById('fine-tune-container'),
            ftToggle: document.getElementById('fine-tune-toggle'),
            targetBtns: document.querySelectorAll('.target-btn'),
            edName: document.getElementById('theme-name-input'),
            edPreview: document.getElementById('theme-preview-box'),
            edPreviewBtn: document.getElementById('apply-theme'),
            openEditorBtn: document.getElementById('open-theme-editor'),
            toneCadenceToggle: document.getElementById('tone-cadence-toggle'),
            toneHeaderBtn: document.getElementById('tone-header-btn'),
            filterToggles: document.querySelectorAll('.gesture-filter-toggle'),
            voicePresetSelect: document.getElementById('voice-preset-select'),
            voicePresetAdd: document.getElementById('voice-preset-add'),
            voicePresetSave: document.getElementById('voice-preset-save'),
            voicePresetRename: document.getElementById('voice-preset-rename'),
            voicePresetDelete: document.getElementById('voice-preset-delete'),
            voicePitch: document.getElementById('voice-pitch'),
            voiceRate: document.getElementById('voice-rate'),
            voiceVolume: document.getElementById('voice-volume'),
            voiceTestBtn: document.getElementById('voice-test-btn'),
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
            configSave: document.getElementById('config-save'),
            themeSave: document.getElementById('theme-save'),
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
            quickLang: document.getElementById('quick-lang-select'),
            generalLang: document.getElementById('general-lang-select'),
            closeSettingsBtn: document.getElementById('close-settings'),
            tabs: document.querySelectorAll('.tab-btn'),
            contents: document.querySelectorAll('.tab-content'),
            helpModal: document.getElementById('help-modal'),
            setupModal: document.getElementById('game-setup-modal'),
            shareModal: document.getElementById('share-modal'),
            closeSetupBtn: document.getElementById('close-setup-btn'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'),
            quickAudio: document.getElementById('quick-audio-toggle'),
            dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickSettings: document.getElementById('quick-settings-btn'),
            quickHelp: document.getElementById('quick-help-btn'),
            quickResizeUp: document.getElementById('quick-resize-up'),
            quickResizeDown: document.getElementById('quick-resize-down'),
            openShareInside: document.getElementById('open-share-button'),
            closeShareBtn: document.getElementById('close-share'),
            closeHelpBtn: document.getElementById('close-help'),
            closeHelpBtnBottom: document.getElementById('close-help-bottom'),
            openHelpBtn: document.getElementById('open-help-btn'),
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
            calibModal: document.getElementById('calibration-modal'),
            openCalibBtn: document.getElementById('open-calibration-btn'),
            closeCalibBtn: document.getElementById('close-calibration-btn'),
            calibAudioSlider: document.getElementById('calib-audio-slider'),
            calibCamSlider: document.getElementById('calib-cam-slider'),
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
            mapping9Container: document.getElementById('mapping-9-container'),
            mapping12Container: document.getElementById('mapping-12-container'),
            mappingPianoContainer: document.getElementById('mapping-piano-container'),
            gestureTapSlider: document.getElementById('gesture-tap-slider'),
            gestureSwipeSlider: document.getElementById('gesture-swipe-slider'),
            gestureTapVal: document.getElementById('gesture-tap-val'),
            gestureSwipeVal: document.getElementById('gesture-swipe-val'),
            voiceTriggerSelect: document.getElementById('voice-trigger-select'),
            upsideDownToggle: document.getElementById('upsidedown-toggle'),
            fullScreenToggle: document.getElementById('fullscreen-toggle'),
            ecoModeToggle: document.getElementById('ecomode-toggle'),
            arSpeedSelect: document.getElementById('ar-speed-select'),
            copyPromptBtn: document.getElementById('copy-prompt-btn'),
            generatePromptBtn: document.getElementById('generate-prompt-btn'),
            promptDisplay: document.getElementById('prompt-display'),
            haptics: document.getElementById('haptics-toggle'),
            delay: document.getElementById('delay-select'),
            chunk: document.getElementById('chunk-select')
        };
        
        this.tempTheme = null; 
        this.initListeners(); 
        this.populateConfigDropdown(); 
        this.populateThemeDropdown(); 
        this.buildColorGrid(); 
        this.populateVoicePresetDropdown();
        this.populatePlaybackSpeedDropdown();
        this.populateUIScaleDropdown(); 
        this.populateMappingUI();
        this.populateMorseUI();
        this.bindMappingEvents();
        this.updateUIFromSettings();
        this.renderMappingUI();
        
        if(this.dom.gestureToggle){
            this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
            this.dom.gestureToggle.addEventListener('change', (e) => {
                this.appSettings.isGestureInputEnabled = !!e.target.checked;
                this.callbacks.onSave();
                this.updateHeaderVisibility(); 
                this.callbacks.onSettingsChanged && this.callbacks.onSettingsChanged();
            });
        }
    }

    renderMappingUI() {
        const container = document.getElementById('mapping-accordion-container');
        if (!container) return;
        container.innerHTML = '';

        const targetKeys = ['k9_1', 'k9_2', 'k9_3', 'k9_4', 'k9_5', 'k9_6', 'k9_7', 'k9_8', 'k9_9', 'k12_1', 'piano_C']; 

        targetKeys.forEach(key => {
            const details = document.createElement('details');
            details.className = "group bg-gray-900 rounded-lg border border-gray-700 open:bg-gray-800 transition-colors mb-3";
            
            const summary = document.createElement('summary');
            summary.className = "cursor-pointer p-3 font-bold select-none flex justify-between items-center text-white outline-none";
            summary.innerHTML = `<span>Input Control: ${key.toUpperCase().replace('_', ' ')}</span><span class="group-open:rotate-180 transition-transform text-gray-500">▼</span>`;
            details.appendChild(summary);

            const contentDiv = document.createElement('div');
            contentDiv.className = "p-3 border-t border-gray-700 bg-black/20";

            const tabBar = document.createElement('div');
            tabBar.className = "flex border-b border-gray-700 mb-3 space-x-2";
            tabBar.innerHTML = `
                <button class="tab-btn-sub active text-xs font-bold py-1 px-3 text-white border-b-2 border-emerald-500" data-subtab="touch-${key}">👇 Touch Gestures</button>
                <button class="tab-btn-sub text-xs font-bold py-1 px-3 text-gray-400" data-subtab="hand-${key}">🖐️ Hand Gestures</button>
            `;
            contentDiv.appendChild(tabBar);

            const touchPanel = document.createElement('div');
            touchPanel.id = `panel-touch-${key}`;
            touchPanel.className = "sub-tab-content space-y-2";
            touchPanel.innerHTML = `<label class="text-[11px] text-gray-400 block font-bold uppercase">Assign Touch Gesture</label>`;
            
            const touchSelect = document.createElement('select');
            touchSelect.className = "w-full p-2 bg-gray-950 text-white rounded border border-gray-600 text-sm font-medium focus:outline-none focus:border-emerald-500";
            touchSelect.dataset.key = key;
            touchSelect.dataset.type = "touch";
            touchSelect.innerHTML = `<option value="">(None / Unassigned)</option>`;
            
            TOUCH_GESTURE_GROUPS.forEach(group => {
                const optGroup = document.createElement('optgroup');
                optGroup.label = `${group.name}${!group.enabled ? ' (Disabled)' : ''}`;
                
                group.gestures.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.id;
                    opt.textContent = g.name;
                    optGroup.appendChild(opt);
                });
                touchSelect.appendChild(optGroup);
            });
            
            if (this.appSettings.touchMappings && this.appSettings.touchMappings[key]) {
                touchSelect.value = this.appSettings.touchMappings[key];
            }
            touchPanel.appendChild(touchSelect);
            contentDiv.appendChild(touchPanel);

            const handPanel = document.createElement('div');
            handPanel.id = `panel-hand-${key}`;
            handPanel.className = "sub-tab-content space-y-2 hidden";
            handPanel.innerHTML = `<label class="text-[11px] text-gray-400 block font-bold uppercase">Assign Hand Gesture</label>`;
            
            const handSelect = document.createElement('select');
            handSelect.className = "w-full p-2 bg-gray-950 text-white rounded border border-gray-600 text-sm font-medium focus:outline-none focus:border-emerald-500";
            handSelect.dataset.key = key;
            handSelect.dataset.type = "hand";
            handSelect.innerHTML = `<option value="">(None / Unassigned)</option>`;
            
            HAND_GESTURE_GROUPS.forEach(group => {
                const optGroup = document.createElement('optgroup');
                optGroup.label = group.name;
                
                group.gestures.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.id;
                    opt.textContent = g.name;
                    optGroup.appendChild(opt);
                });
                handSelect.appendChild(optGroup);
            });

            if (this.appSettings.gestureMappings && this.appSettings.gestureMappings[key]) {
                handSelect.value = this.appSettings.gestureMappings[key];
            }
            handPanel.appendChild(handSelect);
            contentDiv.appendChild(handPanel);

            const handleSelectionChange = (e) => {
                const currentControlKey = e.target.dataset.key;
                const mappingType = e.target.dataset.type;
                
                if (mappingType === "touch") {
                    if (!this.appSettings.touchMappings) this.appSettings.touchMappings = {};
                    this.appSettings.touchMappings[currentControlKey] = e.target.value;
                } else {
                    if (!this.appSettings.gestureMappings) this.appSettings.gestureMappings = {};
                    this.appSettings.gestureMappings[currentControlKey] = e.target.value;
                }
                this.callbacks.onSave();
            };

            touchSelect.onchange = handleSelectionChange;
            handSelect.onchange = handleSelectionChange;

            tabBar.querySelectorAll('button').forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    tabBar.querySelectorAll('button').forEach(b => {
                        b.classList.remove('text-white', 'border-b-2', 'border-emerald-500');
                        b.classList.add('text-gray-400');
                    });
                    
                    btn.classList.add('text-white', 'border-b-2', 'border-emerald-500');
                    btn.classList.remove('text-gray-400');

                    touchPanel.classList.add('hidden');
                    handPanel.classList.add('hidden');

                    const targetId = btn.getAttribute('data-subtab');
                    contentDiv.querySelector(`#panel-${targetId}`).classList.remove('hidden');
                };
            });

            details.appendChild(contentDiv);
            container.appendChild(details);
        });
    }

    bindMappingEvents() {
        document.querySelectorAll('.mapping-subtab-btn').forEach(tab => {
            tab.onclick = (e) => {
                const keyId = e.target.dataset.key;
                const target = e.target.dataset.target;
                const parent = e.target.closest('details');
                
                parent.querySelectorAll('.mapping-subtab-btn').forEach(t => {
                    t.classList.remove('active', 'text-blue-400', 'text-emerald-400', 'border-b-2', 'border-blue-400', 'border-emerald-400');
                    t.classList.add('text-gray-500');
                });
                parent.querySelectorAll('.mapping-panel').forEach(p => p.classList.add('hidden'));
                
                e.target.classList.remove('text-gray-500');
                if (target === 'touch') {
                    e.target.classList.add('active', 'text-blue-400', 'border-b-2', 'border-blue-400');
                    parent.querySelector(`#panel-touch-${keyId}`).classList.remove('hidden');
                } else {
                    e.target.classList.add('active', 'text-emerald-400', 'border-b-2', 'border-emerald-400');
                    parent.querySelector(`#panel-hand-${keyId}`).classList.remove('hidden');
                }
            };
        });

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
                if (!this.appSettings.mappings[keyId]) this.appSettings.mappings[keyId] = { touch: 'none', handGesture: 'none', morse: '' };
                
                if (type === 'touch') {
                    this.appSettings.mappings[keyId].touch = e.target.value;
                } else {
                    this.appSettings.mappings[keyId].handGesture = e.target.value === 'none' ? 'none' : parseInt(e.target.value, 10);
                }
                this.callbacks.onSave();
            };
        });
    }

    populatePlaybackSpeedDropdown() {
        if (!this.dom.playbackSpeed) return;
        this.dom.playbackSpeed.innerHTML = '';
        for (let i = 75; i <= 150; i += 5) {
            const opt = document.createElement('option');
            const val = (i / 100).toFixed(2);
            opt.value = val;
            opt.textContent = i + '%';
            this.dom.playbackSpeed.appendChild(opt);
        }
        this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
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

    setupTabSwipe(modal) {
        const content = modal.querySelector('.settings-modal-bg');
        if (!content) return;

        let startX = 0;
        let startY = 0;
        let isSwipeIgnored = false;

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

                if (diffX < 0) {
                    if (activeIdx < tabs.length - 1) tabs[activeIdx + 1].click();
                } else {
                    if (activeIdx > 0) tabs[activeIdx - 1].click();
                }
            }
        }, { passive: true });
    }

    initListeners() {
        if (this.dom.toneCadenceToggle) {
            this.dom.toneCadenceToggle.checked = !!this.appSettings.isToneCadenceEnabled;
            this.dom.toneCadenceToggle.addEventListener('change', (e) => {
                this.appSettings.isToneCadenceEnabled = e.target.checked;
                this.callbacks.onSave();
                this.updateHeaderVisibility();
            });
        }

        if (this.dom.upsidedownToggle) {
            this.dom.upsidedownToggle.checked = !!this.appSettings.showUpsideDownBtn;
            this.dom.upsidedownToggle.onchange = (e) => {
                this.appSettings.showUpsideDownBtn = e.target.checked;
                this.updateHeaderVisibility();
                this.callbacks.onSave();
            };
        }

        if (this.dom.tabs && this.dom.tabs.length > 0) {
            this.dom.tabs.forEach(btn => {
                btn.onclick = () => {
                    const parent = btn.parentElement.parentElement;
                    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                    const target = btn.dataset.tab;
                    if (target === 'help-voice') this.generatePrompt();
                    const tabContent = document.getElementById(`tab-${target}`);
                    if (tabContent) tabContent.classList.add('active');
                }
            });
        }

        if (this.dom.settingsModal) {
            this.setupTabSwipe(this.dom.settingsModal);
        }
        if (this.dom.helpModal) {
            this.setupTabSwipe(this.dom.helpModal);
        }

        if (this.dom.closeSettingsBtn) {
            this.dom.closeSettingsBtn.onclick = () => {
                this.callbacks.onSave();
                this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.settingsModal.style.pointerEvents = 'none';
            };
        }
    }

    updateHeaderVisibility() {
        const header = document.getElementById('aux-control-header');
        const timerBtn = document.getElementById('header-timer-btn');
        const counterBtn = document.getElementById('header-counter-btn');
        const micBtn = document.getElementById('header-mic-btn');
        const camBtn = document.getElementById('header-cam-btn');
        const gestureBtn = document.getElementById('header-gesture-btn');
        const stealthBtn = document.getElementById('header-stealth-btn');
        const handBtn = document.getElementById('header-hand-btn');

        if (!header) return;

        const showTimer = !!this.appSettings.showTimer;
        const showCounter = !!this.appSettings.showCounter;
        const showMic = !!this.appSettings.isVoiceInputEnabled;
        const showCam = !!this.appSettings.isArModeEnabled;
        const showGesture = !!this.appSettings.isGestureInputEnabled;
        const showStealth = !!this.appSettings.isStealth1KeyEnabled;
        const showHand = !!this.appSettings.isHandGesturesEnabled;

        if(timerBtn) timerBtn.classList.toggle('hidden', !showTimer);
        if(counterBtn) counterBtn.classList.toggle('hidden', !showCounter);
        if(micBtn) micBtn.classList.toggle('hidden', !showMic);
        if(camBtn) camBtn.classList.toggle('hidden', !showCam);
        if(gestureBtn) gestureBtn.classList.toggle('hidden', !showGesture);
        if(stealthBtn) stealthBtn.classList.toggle('hidden', !showStealth);
        if(handBtn) handBtn.classList.toggle('hidden', !showHand);
        if (this.dom.toneHeaderBtn) {
            this.dom.toneHeaderBtn.classList.toggle('hidden', !this.appSettings.isToneCadenceEnabled);
        }

        if (!showTimer && !showCounter && !showMic && !showCam && !showGesture && !showStealth && !showHand) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
    }

    updateUIFromSettings() {
        const ps = this.appSettings.runtimeSettings || {};
        if (this.dom.input) this.dom.input.value = ps.currentInput;
        if (this.dom.mode) this.dom.mode.value = ps.currentMode;
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
        if (this.dom.generalLang) this.dom.generalLang.value = this.appSettings.generalLanguage || 'en';
        if (this.dom.quickLang) this.dom.quickLang.value = this.appSettings.generalLanguage || 'en';
        this.setLanguage(this.appSettings.generalLanguage || 'en');
        this.renderMappingUI();
        this.updateHeaderVisibility();
    }

    generatePrompt() {
        if (!this.dom.promptDisplay) return;
        const ps = this.appSettings.runtimeSettings || {};
        const max = ps.currentInput === 'key12' ? 12 : 9;
        const speed = this.appSettings.playbackSpeed || 1.0;
        this.dom.promptDisplay.value = `Example prompt for max ${max} at speed ${speed}x`;
    }

    populateMappingUI() {}
    populateMorseUI() {}
    applyDefaultGestureMappings() {}
}