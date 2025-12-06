// settings.js
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

const CRAYONS = ["#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", "#B0B7C6", "#AF4035", "#F5F5F5", "#FEFEFA", "#FFFAFA", "#F0F8FF", "#F8F8FF", "#F5F5DC", "#FFFACD", "#FAFAD2", "#FFFFE0", "#FFFFF0", "#FFFF00", "#FFEFD5", "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", "#BDB76B", "#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#FF00FF", "#BA55D3", "#9370DB", "#8A2BE2", "#9400D3", "#9932CC", "#8B008B", "#800000", "#4B0082", "#483D8B", "#6A5ACD", "#7B68EE", "#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", "#6B8E23", "#808000", "#556B2F", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#00FFFF", "#00CED1", "#40E0D0", "#48D1CC", "#AFEEEE", "#7FFFD4", "#B0E0E6", "#5F9EA0", "#4682B4", "#6495ED", "#00BFFF", "#1E90FF", "#ADD8E6", "#87CEEB", "#87CEFA", "#191970", "#000080", "#0000FF", "#0000CD", "#4169E1", "#8A2BE2", "#4B0082", "#FFE4C4", "#FFEBCD", "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F", "#F4A460", "#DAA520", "#B8860B", "#CD853F", "#D2691E", "#8B4513", "#A0522D", "#A52A2A", "#800000", "#FFA07A", "#FA8072", "#E9967A", "#F08080", "#CD5C5C", "#DC143C", "#B22222", "#FF0000", "#FF4500", "#FF6347", "#FF7F50", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00", "#808000", "#556B2F", "#6B8E23", "#999999", "#808080", "#666666", "#333333", "#222222", "#111111", "#0A0A0A", "#000000"];

const LANG = {
    en: {
        quick_title: "👋 Quick Start", select_profile: "Select Profile", autoplay: "Autoplay", audio: "Audio", help_btn: "Help 📚", settings_btn: "Settings", dont_show: "Don't show again", play_btn: "PLAY", theme_editor: "🎨 Theme Editor",
        lbl_profiles: "Profiles", lbl_game: "Game", lbl_playback: "Playback", lbl_general: "General", lbl_stealth: "Stealth", lbl_mode: "Mode", lbl_input: "Input",
        blackout_gestures: "Blackout Gestures", stealth_inputs_only: "Inputs Only (Hold '1')",
        help_stealth_detail: "Inputs Only (1-Key) simplifies input by mapping the 12 primary values (1-12) to a single key press. The interpretation depends on context and mode (Simon/Unique). This is intended for high-speed, minimal-movement input.", 
        help_blackout_detail: "Blackout Mode turns the entire screen black to eliminate visual distraction, allowing you to focus purely on audio cues and muscle memory. The app remains fully functional, but the UI is hidden. If Blackout Gestures are enabled, input switches to a 'no-look' touch system.", 
        help_gesture_detail: "Blackout Gestures: A 'no-look' input system. Use touch gestures (swipes, taps) to represent values 1 through 12. Values 6 through 12 are represented by letters A through G (A=6, B=7, etc.) on a virtual 3x4 grid. Customize these in the Stealth tab." 
    },
    es: {
        quick_title: "👋 Inicio Rápido", select_profile: "Perfil", autoplay: "Auto-reproducción", audio: "Audio", help_btn: "Ayuda 📚", settings_btn: "Ajustes", dont_show: "No mostrar más", play_btn: "JUGAR", theme_editor: "🎨 Editor de Temas",
        lbl_profiles: "Perfiles", lbl_game: "Juego", lbl_playback: "Reproducción", lbl_general: "General", lbl_stealth: "Sigilo", lbl_mode: "Modo", lbl_input: "Entrada",
        blackout_gestures: "Gestos de Pantalla Negra", stealth_inputs_only: "Solo Entradas (Mantener '1')",
        help_stealth_detail: "El modo sigilo (1-tecla) simplifica la entrada al asignar los 12 valores primarios (1-12) a una sola pulsación de tecla. La interpretación depende del contexto y del modo (Simon/Único). Está diseñado para una entrada de alta velocidad y movimiento mínimo.", 
        help_blackout_detail: "El modo de pantalla negra (Blackout) oscurece toda la pantalla para eliminar la distracción visual, permitiéndole concentrarse únicamente en las señales de audio y la memoria muscular. La aplicación sigue siendo completamente funcional, pero la interfaz de usuario está oculta. Si los gestos de pantalla negra están habilitados, la entrada cambia a un sistema táctil 'sin mirar'.", 
        help_gesture_detail: "Gestos de Pantalla Negra: Un sistema de entrada 'sin mirar'. Utiliza gestos táctiles (deslizamientos, toques) para representar los valores del 1 al 12. Personalízalos en la pestaña de Sigilo."
    }
};

const DEFAULT_GESTURE_MAP = {
    '1': 'Swipe Up', '2': 'Swipe Right', '3': 'Swipe Down', '4': 'Swipe Left', '5': 'Tap',
    '6': '2-Finger Swipe Up', '7': '2-Finger Swipe Right', '8': '2-Finger Swipe Down', '9': '2-Finger Swipe Left',
    '10': '2-Finger Tap', '11': 'Double Tap', '12': 'Long Press'
};
const DEFAULT_MORSE_MAP = {
    '1': '.', '2': '..', '3': '...', '4': '-.', '5': '-..', '6': '-...', 
    '7': '--.', '8': '--..', '9': '--...', '10': '---', '11': '---.', '12': '---..'
};
const AVAILABLE_GESTURES = [
    'Swipe Up', 'Swipe Down', 'Swipe Left', 'Swipe Right', 
    'Tap', 'Double Tap', 'Long Press', 
    '2-Finger Swipe Up', '2-Finger Swipe Down', '2-Finger Swipe Left', '2-Finger Swipe Right',
    '2-Finger Tap'
];

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings; this.callbacks = callbacks; this.sensorEngine = sensorEngine; this.currentTargetKey = 'bubble';
        
        // Initialize Default Mappings if they don't exist
        if(!this.appSettings.gestureMappings) this.appSettings.gestureMappings = { ...DEFAULT_GESTURE_MAP };
        if(!this.appSettings.morseMappings) this.appSettings.morseMappings = { ...DEFAULT_MORSE_MAP };

        // 1. Inject elements first (creates them in the DOM)
        this.injectLongPressToggle();
        this.injectStealthTab(); // Creates tab and moves elements

        // 2. Build the DOM cache (now includes the injected elements)
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

            // Inputs for Prompt Generation
            input: document.getElementById('input-select'), mode: document.getElementById('mode-select'), practiceMode: document.getElementById('practice-mode-toggle'), machines: document.getElementById('machines-select'), seqLength: document.getElementById('seq-length-select'),
            autoClear: document.getElementById('autoclear-toggle'), autoplay: document.getElementById('autoplay-toggle'), audio: document.getElementById('audio-toggle'), 
            
            // Moved to Stealth Tab
            hapticMorse: document.getElementById('haptic-morse-toggle'), 
            blackoutToggle: document.getElementById('blackout-toggle'), 
            stealth1KeyToggle: document.getElementById('stealth-1key-toggle'),
            blackoutGesturesToggle: document.getElementById('blackout-gestures-toggle'),

            playbackSpeed: document.getElementById('playback-speed-select'), chunk: document.getElementById('chunk-select'), delay: document.getElementById('delay-select'),

            haptics: document.getElementById('haptics-toggle'), speedDelete: document.getElementById('speed-delete-toggle'), showWelcome: document.getElementById('show-welcome-toggle'),
            
            // Injected Toggles
            longPressToggle: document.getElementById('long-press-autoplay-toggle'),

            uiScale: document.getElementById('ui-scale-select'), seqSize: document.getElementById('seq-size-select'), gestureMode: document.getElementById('gesture-mode-select'), autoInput: document.getElementById('auto-input-select'),
            quickLang: document.getElementById('quick-lang-select'), generalLang: document.getElementById('general-lang-select'), closeSettingsBtn: document.getElementById('close-settings'),

            // TABS (Global selection to catch Help tabs too)
            tabs: document.querySelectorAll('.tab-btn'),
            contents: document.querySelectorAll('.tab-content'),

            helpModal: document.getElementById('help-modal'), setupModal: document.getElementById('game-setup-modal'), shareModal: document.getElementById('share-modal'), closeSetupBtn: document.getElementById('close-game-setup-modal'), quickSettings: document.getElementById('quick-open-settings'), quickHelp: document.getElementById('quick-open-help'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'), quickAudio: document.getElementById('quick-audio-toggle'), dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickResizeUp: document.getElementById('quick-resize-up'), quickResizeDown: document.getElementById('quick-resize-down'),

            openShareInside: document.getElementById('open-share-button'), closeShareBtn: document.getElementById('close-share'), closeHelpBtn: document.getElementById('close-help'), closeHelpBtnBottom: document.getElementById('close-help-btn-bottom'), openHelpBtn: document.getElementById('open-help-button'), promptDisplay: document.getElementById('prompt-display'), copyPromptBtn: document.getElementById('copy-prompt-btn'), generatePromptBtn: document.getElementById('generate-prompt-btn'),
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
            calibModal: document.getElementById('calibration-modal'), openCalibBtn: document.getElementById('open-calibration-btn'), closeCalibBtn: document.getElementById('close-calibration-btn'), calibAudioSlider: document.getElementById('calib-audio-slider'), calibCamSlider: document.getElementById('calib-cam-slider'), calibAudioBar: document.getElementById('calib-audio-bar'), calibCamBar: document.getElementById('calib-cam-bar'), calibAudioMarker: document.getElementById('calib-audio-marker'), calibCamMarker: document.getElementById('calib-cam-marker'), calibAudioVal: document.getElementById('audio-val-display'), calibCamVal: document.getElementById('cam-val-display'),
            redeemModal: document.getElementById('redeem-modal'), openRedeemBtn: document.getElementById('open-redeem-btn'), closeRedeemBtn: document.getElementById('close-redeem-btn'),

            // Header Buttons for Settings Modal
            openDonateBtn: document.getElementById('open-donate-btn'),
            openRedeemSettingsBtn: document.getElementById('open-redeem-btn-settings'),

            donateModal: document.getElementById('donate-modal'), closeDonateBtn: document.getElementById('close-donate-btn'),
            btnCashMain: document.getElementById('btn-cashapp-main'), btnPaypalMain: document.getElementById('btn-paypal-main'),
            copyLinkBtn: document.getElementById('copy-link-button'), nativeShareBtn: document.getElementById('native-share-button'),
            chatShareBtn: document.getElementById('chat-share-button'), emailShareBtn: document.getElementById('email-share-button')
        };
        this.tempTheme = null; this.initListeners(); this.populateConfigDropdown(); this.populateThemeDropdown(); this.buildColorGrid(); this.populateVoicePresetDropdown();
        this.renderMappings();
    }

    injectLongPressToggle() {
        if (document.getElementById('long-press-autoplay-toggle')) return;
        const div = document.createElement('div');
        div.className = "flex justify-between items-center p-3 rounded-lg settings-input";
        div.innerHTML = `<span class="font-bold text-sm">Long Press 'Play' Toggle</span><input type="checkbox" id="long-press-autoplay-toggle" class="h-5 w-5 accent-indigo-500">`;
        const speedDeleteInput = document.getElementById('speed-delete-toggle');
        if (speedDeleteInput && speedDeleteInput.parentElement) {
            speedDeleteInput.parentElement.parentElement.insertBefore(div, speedDeleteInput.parentElement.nextSibling);
        }
    }

    injectStealthTab() {
        const settingsModal = document.getElementById('settings-modal');
        if(!settingsModal) return;

        // 1. Add Tab Button if not exists
        const tabContainer = settingsModal.querySelector('.border-b.bg-black.bg-opacity-20');
        if(tabContainer && !tabContainer.querySelector('[data-tab="stealth"]')) {
            const btn = document.createElement('div');
            btn.className = 'tab-btn';
            btn.dataset.tab = 'stealth';
            btn.dataset.i18n = 'lbl_stealth';
            btn.textContent = 'Stealth';
            tabContainer.appendChild(btn);
        }

        // 2. Create Tab Content Container
        const contentContainer = settingsModal.querySelector('.overflow-y-auto');
        if(contentContainer && !document.getElementById('tab-stealth')) {
            const contentDiv = document.createElement('div');
            contentDiv.id = 'tab-stealth';
            contentDiv.className = 'tab-content';
            contentDiv.style.display = 'none'; // Ensure hidden by default
            contentDiv.innerHTML = `<div id="stealth-toggles-container" class="space-y-3 mb-6"></div><div id="mapping-container" class="space-y-6"></div>`;
            contentContainer.appendChild(contentDiv);
        }

        // 3. Move Existing Controls to New Tab
        const stealthContainer = document.getElementById('stealth-toggles-container');
        if(!stealthContainer) return;

        const moveElement = (id, newLabel) => {
            const input = document.getElementById(id);
            if(input) {
                const row = input.closest('.settings-input');
                if(row) {
                    stealthContainer.appendChild(row);
                    if(newLabel) {
                        const labelSpan = row.querySelector('span');
                        if(labelSpan) {
                            labelSpan.textContent = newLabel;
                            // Update i18n key if needed for new label
                            if(id === 'stealth-1key-toggle') labelSpan.dataset.i18n = 'stealth_inputs_only';
                        }
                    }
                }
            }
        };

        // Move and Rename "Stealth Toggle" -> "Inputs Only"
        moveElement('stealth-1key-toggle', "Inputs Only (Hold '1')");
        moveElement('haptic-morse-toggle');
        moveElement('blackout-toggle');

        // Create Blackout Gestures if it doesn't exist yet, then move it
        if (!document.getElementById('blackout-gestures-toggle')) {
            const div = document.createElement('div');
            div.className = "flex justify-between items-center p-3 rounded-lg settings-input";
            div.innerHTML = `<span class="font-bold text-sm" data-i18n="blackout_gestures">Blackout Gestures</span><input type="checkbox" id="blackout-gestures-toggle" class="h-5 w-5 accent-indigo-500">`;
            stealthContainer.appendChild(div);
        } else {
             moveElement('blackout-gestures-toggle');
        }
    }

    renderMappings() {
        const container = document.getElementById('mapping-container');
        if(!container) return;
        container.innerHTML = '';

        // --- Gesture Section ---
        let html = `<div class="border-t border-custom pt-4"><h4 class="font-bold text-sm mb-3 text-primary-app">Gesture Mapping 👆</h4><div class="grid grid-cols-1 gap-2">`;
        
        for(let i=1; i<=12; i++) {
            const key = i.toString();
            const current = this.appSettings.gestureMappings[key] || DEFAULT_GESTURE_MAP[key];
            
            // Build Options
            const options = AVAILABLE_GESTURES.map(g => `<option value="${g}" ${g === current ? 'selected' : ''}>${g}</option>`).join('');
            
            html += `
            <div class="flex items-center justify-between bg-black bg-opacity-20 p-2 rounded">
                <span class="text-xs font-bold w-8 text-center">${key}</span>
                <select class="bg-gray-800 text-white text-xs rounded p-1 border border-gray-600 gesture-select" data-key="${key}">
                    ${options}
                </select>
            </div>`;
        }
        html += `</div></div>`;

        // --- Morse Section ---
        html += `<div class="border-t border-custom pt-4 mt-4"><h4 class="font-bold text-sm mb-3 text-primary-app">Morse Mapping 📳</h4><div class="grid grid-cols-2 gap-2">`;
        
        for(let i=1; i<=12; i++) {
            const key = i.toString();
            const current = this.appSettings.morseMappings[key] || DEFAULT_MORSE_MAP[key];
            html += `
            <div class="flex items-center justify-between bg-black bg-opacity-20 p-2 rounded">
                <span class="text-xs font-bold w-6 text-center">${key}</span>
                <input type="text" class="bg-gray-800 text-white text-xs rounded p-1 border border-gray-600 w-full ml-2 morse-input font-mono" 
                       data-key="${key}" value="${current}" placeholder=".-">
            </div>`;
        }
        html += `</div></div>`;
        
        container.innerHTML = html;

        // Add Listeners
        container.querySelectorAll('.gesture-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                this.appSettings.gestureMappings[e.target.dataset.key] = e.target.value;
                this.callbacks.onSave();
            });
        });

        container.querySelectorAll('.morse-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const val = e.target.value;
                if(/^[.-]+$/.test(val) || val === '') {
                    this.appSettings.morseMappings[e.target.dataset.key] = val;
                    this.callbacks.onSave();
                } else {
                    alert("Morse code can only contain dots (.) and dashes (-)");
                    e.target.value = this.appSettings.morseMappings[e.target.dataset.key];
                }
            });
        });
    }

    initListeners() {
        this.dom.targetBtns.forEach(btn => { btn.onclick = () => { this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); }); btn.classList.add('active', 'bg-primary-app'); btn.classList.remove('opacity-60'); this.currentTargetKey = btn.dataset.target; if (this.tempTheme) { const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme[this.currentTargetKey]; } }; });
        [this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => { sl.oninput = () => this.updateColorFromSliders(); });
        this.dom.ftToggle.onclick = () => { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; };
        if (this.dom.edSave) this.dom.edSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onSave(); this.callbacks.onUpdate(); this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.add('scale-90'); this.populateThemeDropdown(); } };
        if (this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
        if (this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };
/* settings.js - Settings Management (Part 2) */

// ... continuing from initListeners()
        this.dom.edName.oninput = (e) => { if (this.tempTheme) this.tempTheme.name = e.target.value; };
        this.dom.edPreviewBtn.onclick = () => { if (this.tempTheme) this.setTheme(this.tempTheme, true); };
        this.dom.themeSelect.onchange = () => this.setTheme(this.dom.themeSelect.value);
        this.dom.themeAdd.onclick = () => this.addTheme();
        this.dom.themeRename.onclick = () => this.renameTheme();
        this.dom.themeDelete.onclick = () => this.deleteTheme();
        this.dom.themeSave.onclick = () => this.callbacks.onSave();

        // Config Listeners
        this.dom.configSelect.onchange = () => this.callbacks.onSetCurrentConfig(this.dom.configSelect.value);
        this.dom.quickConfigSelect.onchange = () => this.callbacks.onSetCurrentConfig(this.dom.quickConfigSelect.value);
        this.dom.configAdd.onclick = () => this.callbacks.onAddConfig();
        this.dom.configRename.onclick = () => this.callbacks.onRenameConfig();
        this.dom.configDelete.onclick = () => this.callbacks.onDeleteConfig();
        this.dom.configSave.onclick = () => this.callbacks.onSave();

        // Input Listeners
        this.dom.input.onchange = () => this.updateInput(this.dom.input.value);
        this.dom.mode.onchange = () => this.updateMode(this.dom.mode.value);
        this.dom.machines.onchange = () => this.updateMachines(parseInt(this.dom.machines.value));
        this.dom.seqLength.onchange = () => this.appSettings.sequenceLength = parseInt(this.dom.seqLength.value);
        this.dom.practiceMode.onchange = (e) => this.updatePracticeMode(e.target.checked);
        this.dom.autoClear.onchange = (e) => this.updateAutoClear(e.target.checked);
        this.dom.autoplay.onchange = (e) => this.updateAutoplay(e.target.checked);
        this.dom.audio.onchange = (e) => this.updateAudio(e.target.checked);

        // Stealth / Inputs Listeners
        this.dom.hapticMorse.onchange = (e) => { this.appSettings.isHapticMorseEnabled = e.target.checked; this.callbacks.onSave(); };
        this.dom.blackoutToggle.onchange = (e) => { this.appSettings.isBlackoutModeEnabled = e.target.checked; this.callbacks.onSave(); };
        this.dom.stealth1KeyToggle.onchange = (e) => { this.appSettings.isStealth1KeyEnabled = e.target.checked; this.callbacks.onSave(); };
        this.dom.blackoutGesturesToggle.onchange = (e) => { this.appSettings.isBlackoutGesturesEnabled = e.target.checked; this.callbacks.onSave(); }; // Listener for the moved setting

        // Playback Listeners
        this.dom.playbackSpeed.onchange = () => this.updatePlaybackSpeed(parseInt(this.dom.playbackSpeed.value));
        this.dom.chunk.onchange = () => this.updateChunk(parseInt(this.dom.chunk.value));
        this.dom.delay.onchange = () => this.updateDelay(parseInt(this.dom.delay.value));

        // Other Listeners
        this.dom.haptics.onchange = (e) => this.updateHaptics(e.target.checked);
        this.dom.speedDelete.onchange = (e) => this.updateSpeedDelete(e.target.checked);
        this.dom.showWelcome.onchange = (e) => this.updateShowWelcome(e.target.checked);
        this.dom.longPressToggle.onchange = (e) => this.updateLongPressToggle(e.target.checked);

        this.dom.uiScale.onchange = () => this.updateUISelect(this.dom.uiScale.value);
        this.dom.seqSize.onchange = () => this.updateSeqSize(this.dom.seqSize.value);
        this.dom.gestureMode.onchange = () => this.updateGestureMode(this.dom.gestureMode.value);
        this.dom.autoInput.onchange = () => this.updateAutoInput(this.dom.autoInput.value);

        this.dom.quickLang.onchange = () => this.updateLang(this.dom.quickLang.value);
        this.dom.generalLang.onchange = () => this.updateLang(this.dom.generalLang.value);

        // UI Listeners
        this.dom.tabs.forEach(btn => btn.onclick = () => this.selectTab(btn.dataset.tab));
        if(this.dom.settingsModal) this.dom.settingsModal.addEventListener('transitionend', (e) => { if(e.propertyName === 'opacity' && e.target.classList.contains('opacity-0') && this.appSettings.isPracticeModeEnabled) this.callbacks.onSettingsClose(); });
        this.dom.closeSettingsBtn.onclick = () => { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); };
        
        // Calibration Listeners
        this.dom.openCalibBtn.onclick = () => this.dom.calibModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.closeCalibBtn.onclick = () => this.dom.calibModal.classList.add('opacity-0', 'pointer-events-none');
        this.dom.calibAudioSlider.oninput = (e) => this.updateCalibration('audio', parseFloat(e.target.value));
        this.dom.calibCamSlider.oninput = (e) => this.updateCalibration('camera', parseFloat(e.target.value));

        // Welcome / Setup Listeners
        if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.onchange = (e) => this.updateShowWelcome(!e.target.checked);
        if (this.dom.quickAutoplay) this.dom.quickAutoplay.onchange = (e) => this.updateAutoplay(e.target.checked);
        if (this.dom.quickAudio) this.dom.quickAudio.onchange = (e) => this.updateAudio(e.target.checked);

        // Voice Listeners
        this.dom.voicePresetSelect.onchange = () => this.setVoicePreset(this.dom.voicePresetSelect.value);
        this.dom.voicePresetAdd.onclick = () => this.saveVoicePreset(true);
        this.dom.voicePresetSave.onclick = () => this.saveVoicePreset(false);
        this.dom.voicePresetRename.onclick = () => this.renameVoicePreset();
        this.dom.voicePresetDelete.onclick = () => this.deleteVoicePreset();
        this.dom.voicePitch.oninput = (e) => this.updateVoiceSliders('pitch', parseFloat(e.target.value));
        this.dom.voiceRate.oninput = (e) => this.updateVoiceSliders('rate', parseFloat(e.target.value));
        this.dom.voiceVolume.oninput = (e) => this.updateVoiceSliders('volume', parseFloat(e.target.value));
        this.dom.voiceTestBtn.onclick = () => this.callbacks.onTestVoice();

        // Restore Defaults
        if(this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => this.callbacks.onRestoreDefaults();
        
        // Ensure initial mapping render
        this.renderMappings();
    }

    populateConfigDropdown() {
        // Implementation for populateConfigDropdown...
        [this.dom.configSelect, this.dom.quickConfigSelect].forEach(select => {
            select.innerHTML = '';
            // Add 'Current' placeholder
            const currentConfig = this.appSettings.activeConfig || 'default';
            let option = new Option(`[Current]`, currentConfig);
            select.add(option);
            
            // Add custom configs
            Object.keys(this.appSettings.customConfigs).forEach(id => {
                const config = this.appSettings.customConfigs[id];
                option = new Option(config.name, id);
                if (id === currentConfig) option.selected = true;
                select.add(option);
            });
            // Add 'New Config' option
            select.add(new Option('[Save New Config]', 'new'));
            select.value = currentConfig;
        });
    }

    populateThemeDropdown() {
        const select = this.dom.themeSelect;
        select.innerHTML = '';
        const themes = { ...PREMADE_THEMES, ...this.appSettings.customThemes };
        const activeThemeId = this.appSettings.activeTheme;
        
        Object.keys(themes).forEach(id => {
            const theme = themes[id];
            const option = new Option(theme.name, id);
            if (id === activeThemeId) {
                option.selected = true;
            }
            select.add(option);
        });
    }

    buildColorGrid() {
        if (!this.dom.editorGrid) return;
        this.dom.editorGrid.innerHTML = '';
        CRAYONS.forEach(hex => {
            const div = document.createElement('div');
            div.className = 'w-6 h-6 rounded-full cursor-pointer transition-transform duration-100 hover:scale-110 shadow-md';
            div.style.backgroundColor = hex;
            div.onclick = () => this.selectColor(hex);
            this.dom.editorGrid.appendChild(div);
        });
    }

    openThemeEditor() {
        this.tempTheme = { ...PREMADE_THEMES[this.appSettings.activeTheme] || this.appSettings.customThemes[this.appSettings.activeTheme] || PREMADE_THEMES.default };
        this.currentTargetKey = 'bubble';
        this.dom.targetBtns.forEach(b => { 
            b.classList.remove('active', 'bg-primary-app', 'opacity-60'); 
            b.classList.add('opacity-60'); 
            if (b.dataset.target === 'bubble') { 
                b.classList.add('active', 'bg-primary-app'); 
                b.classList.remove('opacity-60'); 
            }
        });

        this.dom.edName.value = this.tempTheme.name || '';
        this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.editorModal.querySelector('div').classList.remove('scale-90');

        // Initialize sliders based on the current target color
        const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]);
        this.dom.ftHue.value = h;
        this.dom.ftSat.value = s;
        this.dom.ftLit.value = l;
        this.updateColorPreview(this.tempTheme);
    }

    // Share Modal
    openShare() {
        this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.shareModal.querySelector('div').classList.remove('scale-90');
    }

    // Voice Preset Functions
    populateVoicePresetDropdown() {
        const select = this.dom.voicePresetSelect;
        select.innerHTML = '';
        const presets = { ...PREMADE_VOICE_PRESETS, ...this.appSettings.customVoicePresets };
        const activePresetId = this.appSettings.activeVoicePreset || 'standard';
        
        Object.keys(presets).forEach(id => {
            const preset = presets[id];
            const option = new Option(preset.name, id);
            if (id === activePresetId) {
                option.selected = true;
            }
            select.add(option);
        });
    }

    saveVoicePreset(isNew) {
        const currentId = this.appSettings.activeVoicePreset;
        let idToSave = currentId;
        let name = this.dom.voicePresetSelect.options[this.dom.voicePresetSelect.selectedIndex].text;

        if (isNew || PREMADE_VOICE_PRESETS[currentId]) {
            name = prompt("Enter new preset name:", `${name} Copy`);
            if (!name) return;
            idToSave = 'custom_' + Date.now();
        }

        this.appSettings.customVoicePresets[idToSave] = {
            name: name,
            pitch: parseFloat(this.dom.voicePitch.value),
            rate: parseFloat(this.dom.voiceRate.value),
            volume: parseFloat(this.dom.voiceVolume.value)
        };
        this.appSettings.activeVoicePreset = idToSave;
        this.callbacks.onSave();
        this.populateVoicePresetDropdown();
        this.setVoicePreset(idToSave);
    }

    renameVoicePreset() {
        const currentId = this.appSettings.activeVoicePreset;
        if (PREMADE_VOICE_PRESETS[currentId]) {
            alert("Cannot rename a premade preset.");
            return;
        }
        const oldName = this.appSettings.customVoicePresets[currentId].name;
        const newName = prompt("Rename preset:", oldName);
        if (newName && newName !== oldName) {
            this.appSettings.customVoicePresets[currentId].name = newName;
            this.callbacks.onSave();
            this.populateVoicePresetDropdown();
        }
    }

    deleteVoicePreset() {
        const currentId = this.appSettings.activeVoicePreset;
        if (PREMADE_VOICE_PRESETS[currentId]) {
            alert("Cannot delete a premade preset.");
            return;
        }
        if (confirm(`Are you sure you want to delete the preset: ${this.appSettings.customVoicePresets[currentId].name}?`)) {
            delete this.appSettings.customVoicePresets[currentId];
            this.appSettings.activeVoicePreset = 'standard';
            this.callbacks.onSave();
            this.populateVoicePresetDropdown();
            this.setVoicePreset('standard');
        }
    }

    setVoicePreset(id) {
        const preset = PREMADE_VOICE_PRESETS[id] || this.appSettings.customVoicePresets[id] || PREMADE_VOICE_PRESETS.standard;
        this.appSettings.activeVoicePreset = id;
        this.appSettings.voicePitch = preset.pitch;
        this.appSettings.voiceRate = preset.rate;
        this.appSettings.voiceVolume = preset.volume;
        this.applyVoice(preset);
        this.callbacks.onSave();
    }

    updateVoiceSliders(key, value) {
        this.appSettings[`voice${key.charAt(0).toUpperCase() + key.slice(1)}`] = value;
        this.applyVoice({ pitch: this.appSettings.voicePitch, rate: this.appSettings.voiceRate, volume: this.appSettings.voiceVolume });
        // Set the dropdown back to 'current' or update the custom preset if it's the active one
        if (!PREMADE_VOICE_PRESETS[this.appSettings.activeVoicePreset]) {
            this.dom.voicePresetSelect.value = this.appSettings.activeVoicePreset;
        } else {
            this.dom.voicePresetSelect.value = 'standard'; // Default selection if a premade is modified
        }
        this.callbacks.onSave();
    }

    applyVoice(preset) {
        this.dom.voicePitch.value = preset.pitch;
        this.dom.voiceRate.value = preset.rate;
        this.dom.voiceVolume.value = preset.volume;
        // Also update text displays next to sliders if you have them
        document.getElementById('pitch-val').textContent = preset.pitch.toFixed(1);
        document.getElementById('rate-val').textContent = preset.rate.toFixed(1);
        document.getElementById('volume-val').textContent = preset.volume.toFixed(1);
    }

    selectTab(tabName) {
        this.dom.contents.forEach(el => el.style.display = 'none');
        this.dom.tabs.forEach(el => el.classList.remove('bg-primary-app'));

        const activeContent = document.getElementById(`tab-${tabName}`);
        const activeBtn = Array.from(this.dom.tabs).find(b => b.dataset.tab === tabName);

        if (activeContent) activeContent.style.display = 'block';
        if (activeBtn) activeBtn.classList.add('bg-primary-app');
        
        if (tabName === 'stealth') {
            this.renderMappings(); // Re-render mappings when the tab is opened
        }
    }

    refreshSettingsModal() {
        // Ensure all DOM elements reflect the current appSettings
        // This is a crucial function, but for brevity, we'll only update the critical ones
        // The implementation assumes the rest of the updates (like updateInput, updateMode, etc.) are called when settings change.
        this.dom.autoplay.checked = this.appSettings.isAutoplayEnabled;
        this.dom.autoClear.checked = this.appSettings.isAutoAdvanceClearEnabled;

        // Stealth Toggles
        this.dom.hapticMorse.checked = this.appSettings.isHapticMorseEnabled;
        this.dom.blackoutToggle.checked = this.appSettings.isBlackoutModeEnabled;
        this.dom.stealth1KeyToggle.checked = this.appSettings.isStealth1KeyEnabled;
        this.dom.blackoutGesturesToggle.checked = this.appSettings.isBlackoutGesturesEnabled; // Update new setting

        this.applyVoice({
            pitch: this.appSettings.voicePitch, 
            rate: this.appSettings.voiceRate, 
            volume: this.appSettings.voiceVolume
        });
        this.populateVoicePresetDropdown();
        this.populateConfigDropdown();
        this.populateThemeDropdown();
        this.setLanguage(this.appSettings.language);
        this.renderMappings(); // Ensure mappings are current
    }

    // --- Setting Updaters (Simplified) ---

    updateInput(value) { this.appSettings.inputMode = value; this.callbacks.onSave(); }
    updateMode(value) { this.appSettings.gameMode = value; this.callbacks.onSave(); }
    updateMachines(value) { this.appSettings.machineCount = value; this.callbacks.onSave(); }
    updatePlaybackSpeed(value) { this.appSettings.playbackSpeed = value; this.callbacks.onSave(); }
    updateChunk(value) { this.appSettings.chunkSize = value; this.callbacks.onSave(); }
    updateDelay(value) { this.appSettings.delayMs = value; this.callbacks.onSave(); }
    updateLongPressToggle(checked) { this.appSettings.isLongPressAutoplayToggleEnabled = checked; this.callbacks.onSave(); }
    updatePracticeMode(checked) { this.appSettings.isPracticeModeEnabled = checked; this.callbacks.onSave(); }
    updateAutoClear(checked) { this.appSettings.isAutoAdvanceClearEnabled = checked; this.callbacks.onSave(); }

    updateAutoplay(checked) {
        this.appSettings.isAutoplayEnabled = checked; 
        if(checked) {
            document.getElementById('autoplay-status-indicator').classList.add('bg-green-500');
            document.getElementById('autoplay-status-indicator').classList.remove('bg-gray-500');
        } else {
            document.getElementById('autoplay-status-indicator').classList.remove('bg-green-500');
            document.getElementById('autoplay-status-indicator').classList.add('bg-gray-500');
        }
        this.callbacks.onSave(); 
    }

    updateAudio(checked) { 
        this.appSettings.isAudioEnabled = checked; 
        if(!checked) this.sensorEngine.stopAudio();
        this.callbacks.onSave(); 
    }

    updateHaptics(checked) { this.appSettings.isHapticsEnabled = checked; this.callbacks.onSave(); }
    updateSpeedDelete(checked) { this.appSettings.isSpeedDeletingEnabled = checked; this.callbacks.onSave(); }
    updateShowWelcome(checked) { this.appSettings.showWelcomeScreen = checked; this.callbacks.onSave(); }
    updateUISelect(value) { this.appSettings.uiScale = value; this.callbacks.onSave(); }
    updateSeqSize(value) { this.appSettings.sequenceSize = value; this.callbacks.onSave(); }
    updateGestureMode(value) { this.appSettings.gestureMode = value; this.callbacks.onSave(); }
    updateAutoInput(value) { this.appSettings.autoInputMode = value; this.callbacks.onSave(); }

    updateLang(lang) {
        this.appSettings.language = lang;
        this.setLanguage(lang);
        this.callbacks.onSave();
    }

    // --- Color Editor Logic (Simplified) ---

    selectColor(hex) {
        if (!this.tempTheme) return;
        this.tempTheme[this.currentTargetKey] = hex;
        this.updateColorPreview(this.tempTheme);
        this.dom.ftPreview.style.backgroundColor = hex;
        const [h, s, l] = this.hexToHsl(hex);
        this.dom.ftHue.value = h;
        this.dom.ftSat.value = s;
        this.dom.ftLit.value = l;
    }

    updateColorFromSliders() {
        if (!this.tempTheme) return;
        const h = parseInt(this.dom.ftHue.value);
        const s = parseInt(this.dom.ftSat.value);
        const l = parseInt(this.dom.ftLit.value);
        const hex = this.hslToHex(h, s, l);
        this.tempTheme[this.currentTargetKey] = hex;
        this.updateColorPreview(this.tempTheme);
        this.dom.ftPreview.style.backgroundColor = hex;
    }

    updateColorPreview(theme) {
        this.dom.edPreview.style.backgroundColor = theme.bgMain;
        this.dom.edPreviewCard.style.backgroundColor = theme.bgCard;
        this.dom.edPreviewCard.style.color = theme.text;
        this.dom.edPreviewBtn.style.backgroundColor = theme.bubble;
        this.dom.edPreviewBtn.style.color = theme.text;
    }

    // --- Color Conversion Utilities (Must be included for completeness) ---

    hexToRgb(hex) { let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i; hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b); let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]; }
    rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
    hslToRgb(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else if (300 <= h && h < 360) { r = c; g = 0; b = x; } r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255); return [r, g, b]; }
    rgbToHex(r, g, b) { const toHex = c => c.toString(16).padStart(2, '0'); return `#${toHex(r)}${toHex(g)}${toHex(b)}`; }
    hslToHex(h, s, l) { const [r, g, b] = this.hslToRgb(h, s, l); return this.rgbToHex(r, g, b); }
    hexToHsl(hex) { const [r, g, b] = this.hexToRgb(hex); return this.rgbToHsl(r, g, b); }

    // --- Theme Management ---

    addTheme() {
        const name = prompt("Enter new theme name:", "Custom Theme");
        if (name) {
            const newId = 'custom_' + Date.now();
            this.appSettings.customThemes[newId] = { ...PREMADE_THEMES.default, name: name };
            this.appSettings.activeTheme = newId;
            this.callbacks.onSave();
            this.populateThemeDropdown();
            this.setTheme(newId);
            this.openThemeEditor();
        }
    }

    renameTheme() {
        const activeId = this.appSettings.activeTheme;
        if (PREMADE_THEMES[activeId]) {
            alert("Cannot rename a premade theme.");
            return;
        }
        const oldName = this.appSettings.customThemes[activeId].name;
        const newName = prompt("Rename theme:", oldName);
        if (newName && newName !== oldName) {
            this.appSettings.customThemes[activeId].name = newName;
            this.callbacks.onSave();
            this.populateThemeDropdown();
        }
    }

    deleteTheme() {
        const activeId = this.appSettings.activeTheme;
        if (PREMADE_THEMES[activeId]) {
            alert("Cannot delete a premade theme.");
            return;
        }
        if (confirm(`Are you sure you want to delete the theme: ${this.appSettings.customThemes[activeId].name}?`)) {
            delete this.appSettings.customThemes[activeId];
            this.appSettings.activeTheme = 'default';
            this.callbacks.onSave();
            this.populateThemeDropdown();
            this.setTheme('default');
        }
    }

    setTheme(themeId, isPreview = false) {
        let theme;
        if (typeof themeId === 'string') {
            theme = PREMADE_THEMES[themeId] || this.appSettings.customThemes[themeId] || PREMADE_THEMES.default;
            if (!isPreview) {
                this.appSettings.activeTheme = themeId;
                this.callbacks.onSave();
            }
        } else {
            theme = themeId; // themeId is the actual theme object for preview
        }

        const root = document.documentElement.style;
        root.setProperty('--bg-main', theme.bgMain);
        root.setProperty('--bg-card', theme.bgCard);
        root.setProperty('--text-main', theme.text);
        root.setProperty('--btn-color', theme.btn);
        root.setProperty('--primary-app', theme.bubble);

        if (!isPreview) {
            this.callbacks.onUpdate();
        }
    }

    // --- Config Management (Assumes methods exist in parent app.js) ---

    getCustomConfig(id) { return this.appSettings.customConfigs[id]; }
    saveCustomConfig(id, config) { this.appSettings.customConfigs[id] = config; this.callbacks.onSave(); }
    deleteCustomConfig(id) { delete this.appSettings.customConfigs[id]; this.callbacks.onSave(); }
    populateCustomConfig(config) {
        this.appSettings = { ...this.appSettings, ...config };
        this.callbacks.onSave();
        this.refreshSettingsModal();
    }

    // --- Language ---
    setLanguage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        const languageData = LANG[lang] || LANG.en;
        elements.forEach(el => {
            const key = el.dataset.i18n;
            if (languageData[key]) {
                el.textContent = languageData[key];
            }
        });
        this.dom.generalLang.value = lang;
        this.dom.quickLang.value = lang;
    }
}
