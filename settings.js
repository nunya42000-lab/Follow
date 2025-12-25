// settings.js - Part 1 of 3

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

export const MAPPING_PRESETS = {
    '9key_taps': { name: "Taps Standard", map: { 'k9_1':{g:'tap'}, 'k9_2':{g:'double_tap'}, 'k9_3':{g:'long_tap'}, 'k9_4':{g:'tap_2f'}, 'k9_5':{g:'double_tap_2f'}, 'k9_6':{g:'long_tap_2f'}, 'k9_7':{g:'tap_3f'}, 'k9_8':{g:'double_tap_3f'}, 'k9_9':{g:'long_tap_3f'} } },
    '9key_swipes': { name: "Swipes Directional", map: { 'k9_1':{g:'swipe_nw'}, 'k9_2':{g:'swipe_up'}, 'k9_3':{g:'swipe_ne'}, 'k9_4':{g:'swipe_left'}, 'k9_5':{g:'tap'}, 'k9_6':{g:'swipe_right'}, 'k9_7':{g:'swipe_sw'}, 'k9_8':{g:'swipe_down'}, 'k9_9':{g:'swipe_se'} } },
    '12key_taps': { name: "Taps Extended", map: { 'k12_1':{g:'tap'}, 'k12_2':{g:'double_tap'}, 'k12_3':{g:'triple_tap'}, 'k12_4':{g:'long_tap'}, 'k12_5':{g:'tap_2f'}, 'k12_6':{g:'double_tap_2f'}, 'k12_7':{g:'triple_tap_2f'}, 'k12_8':{g:'long_tap_2f'}, 'k12_9':{g:'tap_3f'}, 'k12_10':{g:'double_tap_3f'}, 'k12_11':{g:'triple_tap_3f'}, 'k12_12':{g:'long_tap_3f'} } },
    '12key_swipes': { name: "Swipes Multi-Finger", map: { 'k12_1':{g:'swipe_left'}, 'k12_2':{g:'swipe_up'}, 'k12_3':{g:'swipe_down'}, 'k12_4':{g:'swipe_right'}, 'k12_5':{g:'swipe_left_2f'}, 'k12_6':{g:'swipe_up_2f'}, 'k12_7':{g:'swipe_down_2f'}, 'k12_8':{g:'swipe_right_2f'}, 'k12_9':{g:'swipe_left_3f'}, 'k12_10':{g:'swipe_up_3f'}, 'k12_11':{g:'swipe_down_3f'}, 'k12_12':{g:'swipe_right_3f'} } },
    'piano_swipes': { name: "Piano Swipes", map: { 'piano_1':{g:'swipe_left_2f'}, 'piano_2':{g:'swipe_nw_2f'}, 'piano_3':{g:'swipe_up_2f'}, 'piano_4':{g:'swipe_ne_2f'}, 'piano_5':{g:'swipe_right_2f'}, 'piano_C':{g:'swipe_nw'}, 'piano_D':{g:'swipe_left'}, 'piano_E':{g:'swipe_sw'}, 'piano_F':{g:'swipe_down'}, 'piano_G':{g:'swipe_se'}, 'piano_A':{g:'swipe_right'}, 'piano_B':{g:'swipe_ne'} } }
};

const SYSTEM_ACTIONS = [
    { id: 'act_toggle_blackout', label: 'Toggle Blackout' }, { id: 'act_toggle_input', label: 'Toggle Input Gestures' },
    { id: 'act_reset', label: 'Reset Game' }, { id: 'act_backspace', label: 'Backspace' },
    { id: 'act_play', label: 'Play/Stop Demo' }, { id: 'toggle_hud', label: 'Toggle HUD' },
    { id: 'timer_toggle', label: 'Timer Start/Stop' }, { id: 'timer_reset', label: 'Timer Reset' },
    { id: 'counter_inc', label: 'Counter +1' }, { id: 'counter_reset', label: 'Counter Reset' },
    { id: 'act_settings', label: 'Open Settings' }, { id: 'act_redeem', label: 'Open Redeem' }
];

const CRAYONS = ["#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", "#B0B7C6", "#AF4035", "#F5F5F5", "#FEFEFA", "#FFFAFA", "#F0F8FF", "#F8F8FF", "#F5F5DC", "#FFFACD", "#FAFAD2", "#FFFFE0", "#FFFFF0", "#FFFF00", "#FFEFD5", "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", "#BDB76B", "#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#FF00FF", "#BA55D3", "#9370DB", "#8A2BE2", "#9400D3", "#9932CC", "#8B008B", "#800000", "#4B0082", "#483D8B", "#6A5ACD", "#7B68EE", "#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", "#6B8E23", "#808000", "#556B2F", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#00FFFF", "#00CED1", "#40E0D0", "#48D1CC", "#AFEEEE", "#7FFFD4", "#B0E0E6", "#5F9EA0", "#4682B4", "#6495ED", "#00BFFF", "#1E90FF", "#ADD8E6", "#87CEEB", "#87CEFA", "#191970", "#000080", "#0000FF", "#0000CD", "#4169E1", "#8A2BE2", "#4B0082", "#FFE4C4", "#FFEBCD", "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F", "#F4A460", "#DAA520", "#B8860B", "#CD853F", "#D2691E", "#8B4513", "#A0522D", "#A52A2A", "#800000", "#FFA07A", "#FA8072", "#E9967A", "#F08080", "#CD5C5C", "#DC143C", "#B22222", "#FF0000", "#FF4500", "#FF6347", "#FF7F50", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00", "#808000", "#556B2F", "#6B8E23", "#999999", "#808080", "#666666", "#333333", "#222222", "#111111", "#0A0A0A", "#000000"];

const LANG = {
    en: { quick_title: "👋 Quick Start", select_profile: "Select Profile", autoplay: "Autoplay", audio: "Audio", help_btn: "Help 📚", settings_btn: "Settings", dont_show: "Don't show again", play_btn: "PLAY", theme_editor: "🎨 Theme Editor", lbl_profiles: "Profiles", lbl_game: "Game", lbl_playback: "Playback", lbl_general: "General", lbl_mode: "Mode", lbl_input: "Input", blackout_gestures: "Blackout Gestures" },
    es: { quick_title: "👋 Inicio Rápido", select_profile: "Perfil", autoplay: "Auto-reproducción", audio: "Audio", help_btn: "Ayuda 📚", settings_btn: "Ajustes", dont_show: "No mostrar más", play_btn: "JUGAR", theme_editor: "🎨 Editor de Temas", lbl_profiles: "Perfiles", lbl_game: "Juego", lbl_playback: "Reproducción", lbl_general: "General", lbl_mode: "Modo", lbl_input: "Entrada", blackout_gestures: "Gestos de Pantalla Negra" }
};

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings; 
        this.callbacks = callbacks; 
        this.sensorEngine = sensorEngine; 
        this.currentTargetKey = 'bubble';
        this.dom = this.cacheDOM();
        this.tempTheme = null; 
        
        this.bindUniversalHeaders();
        this.initListeners(); 
        this.initAccordions();
        this.initGestureCreator();
        
        this.populateConfigDropdown(); 
        this.populateThemeDropdown(); 
        this.buildColorGrid(); 
        this.populateVoicePresetDropdown();
        this.populateMappingUI();
        this.populatePresetDropdowns();
    }

    cacheDOM() {
        return {
            editorModal: document.getElementById('theme-editor-modal'), editorGrid: document.getElementById('color-grid'), ftContainer: document.getElementById('fine-tune-container'), ftToggle: document.getElementById('toggle-fine-tune'), ftPreview: document.getElementById('fine-tune-preview'), ftHue: document.getElementById('ft-hue'), ftSat: document.getElementById('ft-sat'), ftLit: document.getElementById('ft-lit'),
            targetBtns: document.querySelectorAll('.target-btn'), edName: document.getElementById('theme-name-input'), edPreview: document.getElementById('theme-preview-box'), edPreviewBtn: document.getElementById('preview-btn'), edPreviewCard: document.getElementById('preview-card'), edSave: document.getElementById('save-theme-btn'), edCancel: document.getElementById('cancel-theme-btn'),
            openEditorBtn: document.getElementById('open-theme-editor'),
            voicePresetSelect: document.getElementById('voice-preset-select'), voicePresetAdd: document.getElementById('voice-preset-add'), voicePresetSave: document.getElementById('voice-preset-save'), voicePresetRename: document.getElementById('voice-preset-rename'), voicePresetDelete: document.getElementById('voice-preset-delete'),
            voicePitch: document.getElementById('voice-pitch'), voiceRate: document.getElementById('voice-rate'), voiceVolume: document.getElementById('voice-volume'), voiceTestBtn: document.getElementById('test-voice-btn'),
            settingsModal: document.getElementById('settings-modal'), themeSelect: document.getElementById('theme-select'), themeAdd: document.getElementById('theme-add'), themeRename: document.getElementById('theme-rename'), themeDelete: document.getElementById('theme-delete'), themeSave: document.getElementById('theme-save'),
            configSelect: document.getElementById('config-select'), quickConfigSelect: document.getElementById('quick-config-select'), configAdd: document.getElementById('config-add'), configRename: document.getElementById('config-rename'), configDelete: document.getElementById('config-delete'), configSave: document.getElementById('config-save'),
            input: document.getElementById('input-select'), mode: document.getElementById('mode-select'), practiceMode: document.getElementById('practice-mode-toggle'), machines: document.getElementById('machines-select'), seqLength: document.getElementById('seq-length-select'),
            autoClear: document.getElementById('autoclear-toggle'), autoplay: document.getElementById('autoplay-toggle'), audio: document.getElementById('audio-toggle'), hapticMorse: document.getElementById('haptic-morse-toggle'), 
            hapticPause: document.getElementById('haptic-pause-select'), playbackSpeed: document.getElementById('playback-speed-select'), chunk: document.getElementById('chunk-select'), delay: document.getElementById('delay-select'),
            haptics: document.getElementById('haptics-toggle'), speedDelete: document.getElementById('speed-delete-toggle'), showWelcome: document.getElementById('show-welcome-toggle'), blackoutToggle: document.getElementById('blackout-toggle'), stealth1KeyToggle: document.getElementById('stealth-1key-toggle'),
            timerToggle: document.getElementById('header-timer-toggle'), counterToggle: document.getElementById('header-counter-toggle'), gestureInputToggle: document.getElementById('gesture-input-toggle'), fontSizeSlider: document.getElementById('font-size-select'), fontSizeDisplay: document.getElementById('font-size-display'),
            uiScale: document.getElementById('ui-scale-select'), seqSize: document.getElementById('seq-size-select'), gestureMode: document.getElementById('gesture-mode-select'), autoInput: document.getElementById('auto-input-select'),
            quickLang: document.getElementById('quick-lang-select'), generalLang: document.getElementById('general-lang-select'), closeSettingsBtn: document.getElementById('close-settings'),
            tabs: document.querySelectorAll('.tab-btn'), contents: document.querySelectorAll('.tab-content'),
            helpModal: document.getElementById('help-modal'), setupModal: document.getElementById('game-setup-modal'), shareModal: document.getElementById('share-modal'), closeSetupBtn: document.getElementById('close-game-setup-modal'), quickSettings: document.getElementById('quick-open-settings'), quickHelp: document.getElementById('quick-open-help'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'), quickAudio: document.getElementById('quick-audio-toggle'), dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickResizeUp: document.getElementById('quick-resize-up'), quickResizeDown: document.getElementById('quick-resize-down'),
            closeShareBtn: document.getElementById('close-share'), closeHelpBtnBottom: document.getElementById('close-help-btn-bottom'), promptDisplay: document.getElementById('prompt-display'), copyPromptBtn: document.getElementById('copy-prompt-btn'), generatePromptBtn: document.getElementById('generate-prompt-btn'),
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
            calibModal: document.getElementById('calibration-modal'), openCalibBtn: document.getElementById('open-calibration-btn'), closeCalibBtn: document.getElementById('close-calibration-btn'), calibAudioSlider: document.getElementById('calib-audio-slider'), calibCamSlider: document.getElementById('calib-cam-slider'), calibAudioBar: document.getElementById('calib-audio-bar'), calibCamBar: document.getElementById('calib-cam-bar'), calibAudioMarker: document.getElementById('calib-audio-marker'), calibCamMarker: document.getElementById('calib-cam-marker'), calibAudioVal: document.getElementById('audio-val-display'), calibCamVal: document.getElementById('cam-val-display'),
            redeemModal: document.getElementById('redeem-modal'), closeRedeemBtn: document.getElementById('close-redeem-btn'),
            redeemZoomIn: document.getElementById('redeem-zoom-in'), redeemZoomOut: document.getElementById('redeem-zoom-out'), redeemImg: document.getElementById('redeem-img'),
            donateModal: document.getElementById('donate-modal'), closeDonateBtn: document.getElementById('close-donate-btn'),
            btnCashMain: document.getElementById('btn-cashapp-main'), btnPaypalMain: document.getElementById('btn-paypal-main'),
            copyLinkBtn: document.getElementById('copy-link-button'), nativeShareBtn: document.getElementById('native-share-button'),
            chatShareBtn: document.getElementById('chat-share-button'), emailShareBtn: document.getElementById('email-share-button'),
            commentModal: document.getElementById('comment-modal'), closeCommentBtn: document.getElementById('close-comment-modal'), submitCommentBtn: document.getElementById('submit-comment-btn'), commentName: document.getElementById('comment-username'), commentMsg: document.getElementById('comment-message'), commentList: document.getElementById('comments-list-container'),
            map9: document.getElementById('mapping-9-container'), map12: document.getElementById('mapping-12-container'), mapPiano: document.getElementById('mapping-piano-container'), mapGeneral: document.getElementById('mapping-general-container'),
            preset9: document.getElementById('preset-9key'), preset12: document.getElementById('preset-12key'), presetPiano: document.getElementById('preset-piano'),
            savePreset9: document.getElementById('save-preset-9key'), savePreset12: document.getElementById('save-preset-12key'), savePresetPiano: document.getElementById('save-preset-piano'),
            gestureCanvas: document.getElementById('gesture-canvas'), newGestureName: document.getElementById('new-gesture-name'), recordGestureBtn: document.getElementById('record-gesture-btn'), addGestureBtn: document.getElementById('add-gesture-btn'), addActionRowBtn: document.getElementById('add-action-row-btn')
        };
    }
// settings.js - Part 2 of 3

    bindUniversalHeaders() {
        document.querySelectorAll('.universal-header').forEach(header => {
            // Bind Language Select
            header.querySelectorAll('.univ-lang-select').forEach(sel => {
                sel.value = this.appSettings.generalLanguage || 'en';
                sel.onchange = (e) => this.setLanguage(e.target.value);
            });
            
            // Bind Nav Buttons
            const bindBtn = (cls, fn) => { 
                const btn = header.querySelector(cls); 
                if(btn) btn.onclick = () => { this.closeAllModals(); fn(); }; 
            };
            
            bindBtn('.univ-settings-btn', () => this.openSettings());
            bindBtn('.univ-donate-btn', () => this.toggleDonate(true));
            bindBtn('.univ-redeem-btn', () => this.toggleRedeem(true));
            bindBtn('.univ-share-btn', () => this.openShare());
            bindBtn('.univ-comment-btn', () => this.openComments());
            bindBtn('.univ-help-btn', () => { 
                this.generatePrompt(); 
                this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); 
            });
        });
    }

    closeAllModals() {
        [this.dom.settingsModal, this.dom.helpModal, this.dom.shareModal, this.dom.donateModal, this.dom.redeemModal, this.dom.commentModal].forEach(m => {
            if(m) {
                m.classList.add('opacity-0', 'pointer-events-none');
                if(m.classList.contains('hidden')) m.classList.add('hidden'); // For comment modal
                
                // Reset scale animation
                const inner = m.querySelector('div');
                if(inner && inner.classList.contains('transform')) inner.classList.add('scale-90');
                
                // Reset share sheet
                if(m.classList.contains('share-sheet-wrapper')) m.querySelector('.share-sheet').classList.remove('active');
            }
        });
    }

    initAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.onclick = () => {
                const targetId = header.dataset.target;
                const content = document.getElementById(targetId);
                if(!content) return;
                
                const isCollapsed = content.parentElement.classList.contains('collapsed');
                
                // Toggle collapsed class on wrapper
                content.parentElement.classList.toggle('collapsed', !isCollapsed);
                
                // Rotate arrow
                const arrow = header.querySelector('.indicator');
                if(arrow) arrow.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)';
            };
        });
    }

    initGestureCreator() {
        const cvs = this.dom.gestureCanvas;
        if(!cvs) return;
        
        const ctx = cvs.getContext('2d');
        let points = [];
        let isDrawing = false;
        
        // Canvas Drawing Logic
        const start = (e) => { 
            e.preventDefault();
            isDrawing = true; 
            points = []; 
            const rect = cvs.getBoundingClientRect(); 
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; 
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; 
            
            // Clear and start line
            ctx.clearRect(0,0, cvs.width, cvs.height); 
            ctx.beginPath(); 
            ctx.moveTo(x,y); 
            ctx.lineWidth = 4; 
            ctx.lineCap = 'round';
            ctx.strokeStyle = "#4f46e5"; // Indigo
            points.push({x, y});
        };
        
        const move = (e) => { 
            if(!isDrawing) return; 
            e.preventDefault(); 
            const rect = cvs.getBoundingClientRect(); 
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; 
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; 
            points.push({x, y}); 
            ctx.lineTo(x,y); 
            ctx.stroke(); 
        };
        
        const end = () => { 
            isDrawing = false; 
            if(points.length < 5) return; 
            
            // Basic detection for label (Simplified for UI feedback)
            const dx = points[points.length-1].x - points[0].x; 
            const dy = points[points.length-1].y - points[0].y; 
            const angle = Math.atan2(dy, dx) * 180 / Math.PI; 
            
            let type = 'swipe_right'; 
            if(angle >= -22 && angle < 22) type = 'swipe_right'; 
            else if(angle >= 22 && angle < 68) type = 'swipe_se'; 
            else if(angle >= 68 && angle < 112) type = 'swipe_down'; 
            else if(angle >= 112 && angle < 158) type = 'swipe_sw'; 
            else if(angle >= 158 || angle < -158) type = 'swipe_left'; 
            else if(angle >= -158 && angle < -112) type = 'swipe_nw'; 
            else if(angle >= -112 && angle < -68) type = 'swipe_up'; 
            else if(angle >= -68 && angle < -22) type = 'swipe_ne'; 
            
            this.recordedGestureType = type; 
            this.recordedGesturePoints = points; // Store for custom shape matching later
            
            // Draw detected label
            ctx.fillStyle = "white"; 
            ctx.font = "12px sans-serif"; 
            ctx.fillText(`Detected: ${type}`, 10, 20); 
        };
        
        // Bind Canvas Events
        cvs.addEventListener('mousedown', start); 
        cvs.addEventListener('mousemove', move); 
        cvs.addEventListener('mouseup', end); 
        cvs.addEventListener('touchstart', start); 
        cvs.addEventListener('touchmove', move); 
        cvs.addEventListener('touchend', end);
        
        // Buttons
        if(this.dom.recordGestureBtn) {
            this.dom.recordGestureBtn.onclick = () => { 
                ctx.clearRect(0,0, cvs.width, cvs.height); 
                this.recordedGestureType=null; 
                this.recordedGesturePoints=null;
            };
        }
        
        if(this.dom.addGestureBtn) {
            this.dom.addGestureBtn.onclick = () => { 
                const name = this.dom.newGestureName.value.trim(); 
                if(!name || !this.recordedGestureType) return alert("Draw a gesture and name it first."); 
                
                if(!this.appSettings.customGestures) this.appSettings.customGestures = []; 
                
                // Add to list
                // Note: storing raw points 'data' allows for shape matching in app.js
                // storing 'type' allows for simple directional fallback
                this.appSettings.customGestures.push({ 
                    name: name, 
                    type: this.recordedGestureType,
                    data: this.normalizeStrokes([this.recordedGesturePoints]) // Normalize immediately
                }); 
                
                this.populateMappingUI(); 
                this.dom.newGestureName.value = ""; 
                ctx.clearRect(0,0, cvs.width, cvs.height); 
                this.callbacks.onSave();
                alert(`Added '${name}'`); 
            };
        }

        if(this.dom.addActionRowBtn) {
            this.dom.addActionRowBtn.onclick = () => { 
                this.renderGeneralMapping(null); 
            };
        }
    }

    populatePresetDropdowns() {
        const fill = (sel, filter) => { 
            if(!sel) return; 
            sel.innerHTML = '<option value="">Load Preset...</option>'; 
            
            Object.keys(MAPPING_PRESETS).filter(k => k.startsWith(filter)).forEach(k => { 
                const opt = document.createElement('option'); 
                opt.value = k; 
                opt.textContent = MAPPING_PRESETS[k].name; 
                sel.appendChild(opt); 
            }); 
            
            sel.onchange = () => { 
                if(sel.value && MAPPING_PRESETS[sel.value]) { 
                    if(confirm("Overwrite current mappings?")) { 
                        const map = MAPPING_PRESETS[sel.value].map; 
                        // Apply to settings
                        Object.keys(map).forEach(key => { 
                            if(!this.appSettings.gestureMappings[key]) this.appSettings.gestureMappings[key] = {}; 
                            this.appSettings.gestureMappings[key].gesture = map[key].g; 
                        }); 
                        this.populateMappingUI(); 
                        this.callbacks.onSave(); 
                    } 
                } 
            }; 
        };
        
        fill(this.dom.preset9, '9key'); 
        fill(this.dom.preset12, '12key'); 
        fill(this.dom.presetPiano, 'piano');
    }

    populateMappingUI() {
        // Define standard gesture options
        const standardGestures = ['tap','double_tap','long_tap','tap_2f','double_tap_2f','long_tap_2f','tap_3f','double_tap_3f','long_tap_3f','swipe_left','swipe_right','swipe_up','swipe_down','swipe_nw','swipe_ne','swipe_se','swipe_sw','swipe_left_2f','swipe_right_2f','swipe_up_2f','swipe_down_2f','swipe_left_3f','swipe_right_3f','swipe_up_3f','swipe_down_3f'];
        
        let allGestures = standardGestures.map(g => ({val: g, lbl: g.replace(/_/g,' ')}));
        
        // Append Custom Gestures to dropdown list
        if(this.appSettings.customGestures) { 
            this.appSettings.customGestures.forEach(cg => {
                allGestures.push({val: cg.type, lbl: `✨ ${cg.name} (${cg.type})`});
            }); 
        }

        // Helper to create a mapping row
        const makeRow = (label, key) => {
            const div = document.createElement('div'); 
            div.className = "flex items-center space-x-2 border-b border-gray-800 pb-1"; 
            div.innerHTML = `<span class="w-16 text-xs font-bold text-right pr-2 text-primary-app">${label}</span>`;
            
            const sel = document.createElement('select'); 
            sel.className = "settings-input flex-grow p-1 rounded text-xs"; 
            sel.innerHTML = `<option value="">-- None --</option>`; 
            
            allGestures.forEach(g => { 
                const opt = document.createElement('option'); 
                opt.value = g.val; 
                opt.textContent = g.lbl; 
                sel.appendChild(opt); 
            });

            if(this.appSettings.gestureMappings && this.appSettings.gestureMappings[key]) { 
                sel.value = this.appSettings.gestureMappings[key].gesture || ""; 
            }
            
            sel.onchange = () => { 
                if(!this.appSettings.gestureMappings) this.appSettings.gestureMappings = {}; 
                if(!this.appSettings.gestureMappings[key]) this.appSettings.gestureMappings[key] = {}; 
                this.appSettings.gestureMappings[key].gesture = sel.value; 
                this.callbacks.onSave(); 
            }; 
            
            div.appendChild(sel); 
            return div;
        };

        // Render 9-Key Container
        if(this.dom.map9) { 
            this.dom.map9.innerHTML = ''; 
            for(let i=1;i<=9;i++) this.dom.map9.appendChild(makeRow(i, `k9_${i}`)); 
        }
        
        // Render 12-Key Container
        if(this.dom.map12) { 
            this.dom.map12.innerHTML = ''; 
            for(let i=1;i<=12;i++) this.dom.map12.appendChild(makeRow(i, `k12_${i}`)); 
        }
        
        // Render Piano Container
        if(this.dom.mapPiano) { 
            this.dom.mapPiano.innerHTML = ''; 
            ['C','D','E','F','G','A','B','1','2','3','4','5'].forEach(k => this.dom.mapPiano.appendChild(makeRow(k, `piano_${k}`))); 
        }

        // Render General Actions Container
        if(this.dom.mapGeneral) { 
            this.dom.mapGeneral.innerHTML = ''; 
            
            // Ensure default general actions exist
            if(!this.appSettings.generalActions) { 
                this.appSettings.generalActions = [
                    {gesture: 'shake', action: 'toggle_input_gestures'}, 
                    {gesture: 'cam_cover', action: 'toggle_blackout'}
                ]; 
            } 
            
            this.appSettings.generalActions.forEach((item, idx) => {
                this.renderGeneralMapping(item, idx, allGestures);
            }); 
        }
    }

    renderGeneralMapping(item, idx, gestureList) {
        // If gestureList wasn't passed, rebuild basic list + triggers
        if(!gestureList) { 
            const standardGestures = ['tap','double_tap','long_tap','swipe_left','swipe_right','swipe_up','swipe_down']; 
            gestureList = standardGestures.map(g => ({val: g, lbl: g.replace(/_/g,' ')})); 
            if(this.appSettings.customGestures) {
                 this.appSettings.customGestures.forEach(cg => gestureList.push({val: cg.type, lbl: `✨ ${cg.name}`}));
            }
        }
        
        // Triggers specific to General Actions
        const fullGestureList = [...gestureList];
        fullGestureList.unshift({val: 'shake', lbl: '📳 Shake Phone'});
        fullGestureList.unshift({val: 'cam_cover', lbl: '🌑 Cover Front Camera'});

        const row = document.createElement('div'); 
        row.className = "flex gap-2 mb-2 items-center bg-gray-900 bg-opacity-40 p-1 rounded border border-gray-700";
        
        // Gesture Select
        const tSel = document.createElement('select'); 
        tSel.className = "settings-input flex-1 p-1 rounded text-xs"; 
        fullGestureList.forEach(g => { 
            const o = document.createElement('option'); 
            o.value = g.val; 
            o.textContent = g.lbl; 
            tSel.appendChild(o); 
        }); 
        if(item) tSel.value = item.gesture;
        
        // Action Select
        const aSel = document.createElement('select'); 
        aSel.className = "settings-input flex-1 p-1 rounded text-xs"; 
        SYSTEM_ACTIONS.forEach(a => { 
            const o = document.createElement('option'); 
            o.value = a.id; 
            o.textContent = a.label; 
            aSel.appendChild(o); 
        }); 
        if(item) aSel.value = item.action;
        
        // Delete Button
        const del = document.createElement('button'); 
        del.className = "bg-red-600 hover:bg-red-500 text-white px-2 rounded font-bold text-xs h-6 flex items-center justify-center"; 
        del.textContent = "✕"; 
        del.onclick = () => { 
            this.appSettings.generalActions.splice(idx, 1); 
            this.callbacks.onSave(); 
            this.populateMappingUI(); 
        };
        
        // Save Logic
        const save = () => { 
            if(idx === undefined || idx === null) { 
                this.appSettings.generalActions.push({gesture: tSel.value, action: aSel.value}); 
                idx = this.appSettings.generalActions.length - 1; 
                // Re-render to attach delete listener correctly
                this.populateMappingUI();
            } else { 
                this.appSettings.generalActions[idx] = {gesture: tSel.value, action: aSel.value}; 
            } 
            this.callbacks.onSave(); 
        };
        
        tSel.onchange = save; 
        aSel.onchange = save; 
        
        row.appendChild(tSel); 
        row.appendChild(aSel); 
        row.appendChild(del); 
        
        if(this.dom.mapGeneral) this.dom.mapGeneral.appendChild(row);
    }
    
    // Helper used by Gesture Creator
    normalizeStrokes(strokes) {
        let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
        strokes.flat().forEach(p => { if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x; if(p.y<minY)minY=p.y; if(p.y>maxY)maxY=p.y; });
        const w = Math.max(maxX - minX, 1); const h = Math.max(maxY - minY, 1); const scale = 1 / Math.max(w, h);
        return strokes.map(s => s.map(p => ({ x: (p.x - minX) * scale, y: (p.y - minY) * scale })));
    }
// settings.js - Part 3 of 3

    initListeners() {
        // Inject legacy toggles if missing from HTML structure (Safety fallback)
        this.injectLongPressToggle();
        this.injectBlackoutGesturesToggle();
        this.injectGestureInputToggle();

        const bind = (el, prop, isGlobal, isInt = false, isFloat = false) => {
            if (!el) return;
            el.onchange = () => {
                let val = (el.type === 'checkbox') ? el.checked : el.value;
                if (isInt) val = parseInt(val);
                if (isFloat) val = parseFloat(val);
                
                if (isGlobal) {
                    this.appSettings[prop] = val;
                    // Trigger specific updates based on property
                    if (prop === 'activeTheme') this.callbacks.onUpdate();
                    if (prop === 'isPracticeModeEnabled') this.callbacks.onUpdate();
                    if (prop === 'showHudTimer' || prop === 'showHudCounter') this.callbacks.onUpdate();
                    if (prop === 'isGestureInputEnabled') this.callbacks.onUpdate();
                } else {
                    this.appSettings.runtimeSettings[prop] = val;
                }
                
                this.callbacks.onSave();
                this.generatePrompt();
                
                // Update UI Scale immediately if changed
                if(prop === 'uiScale' || prop === 'sequenceSize' || prop === 'globalFontSize') this.callbacks.onUpdate();
            };
        };

        // Bind Settings Inputs
        bind(this.dom.input, 'currentInput', false); 
        bind(this.dom.mode, 'currentMode', false);
        bind(this.dom.machines, 'machineCount', false, true); 
        bind(this.dom.seqLength, 'sequenceLength', false, true); 
        bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', false); // Note: Moved to runtime
        bind(this.dom.autoplay, 'isAutoplayEnabled', false); 
        bind(this.dom.audio, 'isAudioEnabled', true);
        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true); 
        bind(this.dom.hapticPause, 'hapticMorsePause', false, false, true);
        bind(this.dom.playbackSpeed, 'playbackSpeed', false, false, true); 
        bind(this.dom.delay, 'simonInterSequenceDelay', false, false, true);
        bind(this.dom.chunk, 'simonChunkSize', false, true);
        
        // Global Toggles
        bind(this.dom.timerToggle, 'showHudTimer', true);
        bind(this.dom.counterToggle, 'showHudCounter', true);
        bind(this.dom.gestureInputToggle, 'isGestureInputEnabled', true);
        bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
        bind(this.dom.haptics, 'isHapticsEnabled', true);
        bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true);
        bind(this.dom.showWelcome, 'showWelcomeScreen', true);
        bind(this.dom.blackoutToggle, 'isBlackoutMode', true);
        bind(this.dom.stealth1KeyToggle, 'stealth1Key', true);
        bind(this.dom.gestureMode, 'gestureResizeMode', true);
        bind(this.dom.autoInput, 'autoInputMode', true);
        
        // Font Size Slider
        if(this.dom.fontSizeSlider) {
            this.dom.fontSizeSlider.oninput = (e) => {
                const val = parseInt(e.target.value);
                this.dom.fontSizeDisplay.textContent = val + "%";
                this.appSettings.globalFontSize = val;
                this.callbacks.onUpdate();
            };
            this.dom.fontSizeSlider.onchange = () => this.callbacks.onSave();
        }
        
        // Scale Dropdowns
        bind(this.dom.uiScale, 'uiScale', true, true);
        bind(this.dom.seqSize, 'sequenceSize', true, true);

        // Modal Controls
        if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
        if (this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.dom.setupModal.classList.add('opacity-0', 'pointer-events-none'); this.openSettings(); };
        if (this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.dom.setupModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
        if (this.dom.closeHelpBtnBottom) this.dom.closeHelpBtnBottom.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
        if (this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => { this.dom.shareModal.querySelector('.share-sheet').classList.remove('active'); setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300); };
        if (this.dom.closeRedeemBtn) this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);
        if (this.dom.closeDonateBtn) this.dom.closeDonateBtn.onclick = () => this.toggleDonate(false);
        if (this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => { this.dom.setupModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.add('scale-90'); if(this.appSettings.isPracticeModeEnabled) this.callbacks.onUpdate(); };
        if (this.dom.closeCommentBtn) this.dom.closeCommentBtn.onclick = () => this.dom.commentModal.classList.add('hidden');

        // Tab Navigation
        this.dom.tabs.forEach(tab => { 
            tab.onclick = () => { 
                this.dom.tabs.forEach(t => t.classList.remove('active')); 
                this.dom.contents.forEach(c => c.classList.remove('active')); 
                tab.classList.add('active'); 
                document.getElementById('tab-' + tab.dataset.tab).classList.add('active'); 
            }; 
        });
        
        // Profile Management
        if (this.dom.configAdd) this.dom.configAdd.onclick = () => { const name = prompt("Profile Name:"); if (name) { const id = 'profile_' + Date.now(); this.appSettings.profiles[id] = { name: name, settings: JSON.parse(JSON.stringify(this.appSettings.runtimeSettings)) }; this.appSettings.activeProfileId = id; this.appSettings.runtimeSettings = this.appSettings.profiles[id].settings; this.callbacks.onSave(); this.populateConfigDropdown(); this.updateUIFromSettings(); } };
        if (this.dom.configSave) this.dom.configSave.onclick = () => { if (this.appSettings.activeProfileId) { this.appSettings.profiles[this.appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(this.appSettings.runtimeSettings)); this.callbacks.onSave(); alert("Profile Saved!"); } };
        if (this.dom.configRename) this.dom.configRename.onclick = () => { if (this.appSettings.activeProfileId) { const name = prompt("New Name:", this.appSettings.profiles[this.appSettings.activeProfileId].name); if (name) { this.appSettings.profiles[this.appSettings.activeProfileId].name = name; this.callbacks.onSave(); this.populateConfigDropdown(); } } };
        if (this.dom.configDelete) this.dom.configDelete.onclick = () => { if (Object.keys(this.appSettings.profiles).length > 1) { if (confirm("Delete profile?")) { delete this.appSettings.profiles[this.appSettings.activeProfileId]; this.appSettings.activeProfileId = Object.keys(this.appSettings.profiles)[0]; this.appSettings.runtimeSettings = this.appSettings.profiles[this.appSettings.activeProfileId].settings; this.callbacks.onSave(); this.populateConfigDropdown(); this.updateUIFromSettings(); } } else alert("Cannot delete last profile."); };
        if (this.dom.configSelect) this.dom.configSelect.onchange = (e) => { this.appSettings.activeProfileId = e.target.value; this.appSettings.runtimeSettings = this.appSettings.profiles[e.target.value].settings; this.callbacks.onSave(); this.updateUIFromSettings(); this.callbacks.onUpdate(); };
        if (this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => { this.appSettings.activeProfileId = e.target.value; this.appSettings.runtimeSettings = this.appSettings.profiles[e.target.value].settings; this.callbacks.onSave(); this.updateUIFromSettings(); this.callbacks.onUpdate(); };

        // Theme Editor
        this.dom.targetBtns.forEach(btn => { btn.onclick = () => { this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); }); btn.classList.add('active', 'bg-primary-app'); btn.classList.remove('opacity-60'); this.currentTargetKey = btn.dataset.target; if (this.tempTheme) { const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme[this.currentTargetKey]; } }; });
        [this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => { sl.oninput = () => this.updateColorFromSliders(); });
        this.dom.ftToggle.onclick = () => { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; };
        if (this.dom.edSave) this.dom.edSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onSave(); this.callbacks.onUpdate(); this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.add('scale-90'); this.populateThemeDropdown(); } };
        if (this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
        if (this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };
        if (this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onSave(); this.callbacks.onUpdate(); };
        
        // Redeem Zoom
        let zoom = 1;
        if(this.dom.redeemZoomIn) this.dom.redeemZoomIn.onclick = () => { zoom += 0.1; this.dom.redeemImg.style.transform = `scale(${zoom})`; };
        if(this.dom.redeemZoomOut) this.dom.redeemZoomOut.onclick = () => { zoom = Math.max(0.5, zoom - 0.1); this.dom.redeemImg.style.transform = `scale(${zoom})`; };
        if(document.getElementById('rotate-redeem-btn')) document.getElementById('rotate-redeem-btn').onclick = () => {
            const container = document.getElementById('redeem-img-container');
            const img = document.getElementById('redeem-img');
            if(container && img) {
                // Check if currently rotated
                if (img.classList.contains('rotate-90')) {
                    img.classList.remove('rotate-90');
                    img.style.width = '100%'; img.style.height = '100%';
                } else {
                    img.classList.add('rotate-90');
                    // Adjust sizing when rotated to fit container
                    img.style.width = '70vh'; img.style.height = '100vw'; 
                }
            }
        };
        
        // Prompt & Voice
        if (this.dom.generatePromptBtn) this.dom.generatePromptBtn.onclick = () => this.generatePrompt();
        if (this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => { if (this.dom.promptDisplay) { this.dom.promptDisplay.select(); document.execCommand('copy'); alert("Copied to clipboard!"); } };
        
        if (this.dom.voiceTestBtn) this.dom.voiceTestBtn.onclick = () => {
            if('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance("One, Two, Three. Testing voice settings.");
                u.pitch = parseFloat(this.dom.voicePitch.value);
                u.rate = parseFloat(this.dom.voiceRate.value);
                u.volume = parseFloat(this.dom.voiceVolume.value);
                window.speechSynthesis.speak(u);
            }
        };
    }
    
    updateUIFromSettings() {
        const ps = this.appSettings.runtimeSettings;
        // Game Tab
        if (this.dom.input) this.dom.input.value = ps.currentInput;
        if (this.dom.mode) this.dom.mode.value = ps.currentMode;
        if (this.dom.machines) this.dom.machines.value = ps.machineCount;
        if (this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;
        if (this.dom.autoClear) this.dom.autoClear.checked = ps.isUniqueRoundsAutoClearEnabled;
        if (this.dom.practiceMode) this.dom.practiceMode.checked = !!this.appSettings.isPracticeModeEnabled;
        
        // Playback Tab
        if (this.dom.autoplay) this.dom.autoplay.checked = this.appSettings.runtimeSettings.isAutoplayEnabled; // Use runtime for this? Actually global setting in some versions, but here tied to runtime
        if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.runtimeSettings.isAutoplayEnabled;
        if (this.dom.audio) this.dom.audio.checked = this.appSettings.isAudioEnabled;
        if (this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
        if (this.dom.hapticMorse) this.dom.hapticMorse.checked = this.appSettings.isHapticMorseEnabled;
        if (this.dom.hapticPause) this.dom.hapticPause.value = this.appSettings.runtimeSettings.hapticMorsePause || 0;
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = this.appSettings.playbackSpeed;
        if (this.dom.delay) this.dom.delay.value = ps.simonInterSequenceDelay;
        if (this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize || 3;
        
        // General Tab
        if (this.dom.timerToggle) this.dom.timerToggle.checked = !!this.appSettings.showHudTimer;
        if (this.dom.counterToggle) this.dom.counterToggle.checked = !!this.appSettings.showHudCounter;
        if (this.dom.gestureInputToggle) this.dom.gestureInputToggle.checked = !!this.appSettings.isGestureInputEnabled;
        if (this.dom.haptics) this.dom.haptics.checked = this.appSettings.isHapticsEnabled;
        if (this.dom.speedDelete) this.dom.speedDelete.checked = this.appSettings.isSpeedDeletingEnabled;
        if (this.dom.showWelcome) this.dom.showWelcome.checked = this.appSettings.showWelcomeScreen;
        if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        if (this.dom.blackoutToggle) this.dom.blackoutToggle.checked = this.appSettings.isBlackoutMode;
        if (this.dom.stealth1KeyToggle) this.dom.stealth1KeyToggle.checked = this.appSettings.stealth1Key;
        
        if (this.dom.fontSizeSlider) {
             this.dom.fontSizeSlider.value = this.appSettings.globalFontSize || 100;
             this.dom.fontSizeDisplay.textContent = (this.appSettings.globalFontSize || 100) + "%";
        }

        if (this.dom.seqSize) this.dom.seqSize.value = this.appSettings.sequenceSize;
        if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.uiScale;
        if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode;
        if (this.dom.autoInput) this.dom.autoInput.value = this.appSettings.autoInputMode;
        
        this.populateMappingUI();
    }
    
    // --- Helper for App.js to resolve gestures ---
    getEffectiveMap(inputType) {
        const result = {};
        const prefix = inputType === 'key9' ? 'k9_' : inputType === 'key12' ? 'k12_' : 'piano_';
        
        if (this.appSettings.gestureMappings) {
            for (const [key, data] of Object.entries(this.appSettings.gestureMappings)) {
                // Return format: { 'k9_1': 'swipe_left' }
                if (key.startsWith(prefix) && data.gesture) {
                    result[key] = data.gesture;
                }
            }
        }
        return result;
    }

    // --- Theme & Utils ---
    openThemeEditor() { if (!this.dom.editorModal) return; const activeId = this.appSettings.activeTheme; const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default']; this.tempTheme = { ...source }; this.dom.edName.value = this.tempTheme.name; this.dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app')); this.dom.targetBtns[2].classList.add('active', 'bg-primary-app'); this.currentTargetKey = 'bubble'; const [h, s, l] = this.hexToHsl(this.tempTheme.bubble); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme.bubble; this.updatePreview(); this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.remove('scale-90'); }
    updatePreview() { const t = this.tempTheme; if (!this.dom.edPreview) return; this.dom.edPreview.style.backgroundColor = t.bgMain; this.dom.edPreview.style.color = t.text; this.dom.edPreviewCard.style.backgroundColor = t.bgCard; this.dom.edPreviewCard.style.color = t.text; this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)'; this.dom.edPreviewBtn.style.backgroundColor = t.bubble; this.dom.edPreviewBtn.style.color = t.text; }
    updateColorFromSliders() { const h = parseInt(this.dom.ftHue.value); const s = parseInt(this.dom.ftSat.value); const l = parseInt(this.dom.ftLit.value); const hex = this.hslToHex(h, s, l); this.dom.ftPreview.style.backgroundColor = hex; if (this.tempTheme) { this.tempTheme[this.currentTargetKey] = hex; this.updatePreview(); } }
    
    populateConfigDropdown() { const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { const o = document.createElement('option'); o.value = id; o.textContent = this.appSettings.profiles[id].name; return o; }); if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; } if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; } }
    populateThemeDropdown() { const s = this.dom.themeSelect; if (!s) return; s.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); }); s.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Themes"; Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); }); s.appendChild(grp2); s.value = this.appSettings.activeTheme; }
    buildColorGrid() { if (!this.dom.editorGrid) return; this.dom.editorGrid.innerHTML = ''; CRAYONS.forEach(color => { const btn = document.createElement('div'); btn.style.backgroundColor = color; btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm"; btn.onclick = () => this.applyColorToTarget(color); this.dom.editorGrid.appendChild(btn); }); }
    applyColorToTarget(hex) { if (!this.tempTheme) return; this.tempTheme[this.currentTargetKey] = hex; const [h, s, l] = this.hexToHsl(hex); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = hex; if (this.dom.ftContainer.classList.contains('hidden')) { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; } this.updatePreview(); }
    
    // Legacy Injectors (Maintained for safety)
    injectLongPressToggle() { if (document.getElementById('long-press-autoplay-toggle')) return; const div = document.createElement('div'); div.className = "flex justify-between items-center p-3 rounded-lg settings-input"; div.innerHTML = `<span class="font-bold text-sm">Long Press 'Play' Toggle</span><input type="checkbox" id="long-press-autoplay-toggle" class="h-5 w-5 accent-indigo-500">`; const el = document.getElementById('speed-delete-toggle'); if (el && el.parentElement) el.parentElement.parentElement.insertBefore(div, el.parentElement.nextSibling); }
    injectBlackoutGesturesToggle() { if (document.getElementById('blackout-gestures-toggle')) return; const div = document.createElement('div'); div.className = "flex justify-between items-center p-3 rounded-lg settings-input"; div.innerHTML = `<span class="font-bold text-sm">Blackout Gestures</span><input type="checkbox" id="blackout-gestures-toggle" class="h-5 w-5 accent-indigo-500">`; const el = document.getElementById('blackout-toggle'); if (el && el.parentElement) el.parentElement.parentElement.insertBefore(div, el.parentElement.nextSibling); }
    injectGestureInputToggle() { if (document.getElementById('gesture-input-toggle')) return; const div = document.createElement('div'); div.className = "flex justify-between items-center p-3 rounded-lg settings-input"; div.innerHTML = `<span class="font-bold text-sm">Gesture Input Mode</span><input type="checkbox" id="gesture-input-toggle" class="h-5 w-5 accent-indigo-500">`; const el = document.getElementById('stealth-1key-toggle'); if (el && el.parentElement) el.parentElement.parentElement.insertBefore(div, el.parentElement.nextSibling); }

    populateVoicePresetDropdown() { if(!this.dom.voicePresetSelect) return; this.dom.voicePresetSelect.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_VOICE_PRESETS).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_VOICE_PRESETS[k].name; grp1.appendChild(el); }); this.dom.voicePresetSelect.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Voices"; if (this.appSettings.voicePresets) { Object.keys(this.appSettings.voicePresets).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.voicePresets[k].name; grp2.appendChild(el); }); } this.dom.voicePresetSelect.appendChild(grp2); this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard'; }
    
    generatePrompt() {
        if (!this.dom.promptDisplay) return;
        const ps = this.appSettings.runtimeSettings;
        const max = ps.currentInput === 'key12' ? 12 : 9;
        const speed = this.appSettings.playbackSpeed || 1.0;
        const machines = ps.machineCount || 1;
        
        let instructions = "";
        if (machines > 1) {
            instructions = `MODE: MULTI-MACHINE (${machines} Machines).\nI will speak a batch of numbers. Sort them to machines 1-${machines} sequentially. Then read back the lists interleaved.`;
        } else {
            instructions = ps.currentMode === 'simon' 
                ? `MODE: SIMON SAYS. Sequence grows by 1. Read back full list every time.` 
                : `MODE: UNIQUE. Random sequence. Just repeat what I say to confirm.`;
        }

        this.dom.promptDisplay.value = `Act as a Sequence Caller.\nSETTINGS: Max ${max}, Speed ${speed}x.\n${instructions}\n\nStart immediately.`;
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

    openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.updateUIFromSettings(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); }
    openSetup() { this.populateConfigDropdown(); this.updateUIFromSettings(); this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90'); }
    toggleRedeem(show) { if(show) { this.dom.redeemModal.classList.remove('opacity-0','pointer-events-none'); this.dom.redeemModal.style.pointerEvents='auto'; } else { this.dom.redeemModal.classList.add('opacity-0','pointer-events-none'); } }
    toggleDonate(show) { if(show) { this.dom.donateModal.classList.remove('opacity-0','pointer-events-none'); this.dom.donateModal.style.pointerEvents='auto'; } else { this.dom.donateModal.classList.add('opacity-0','pointer-events-none'); } }
    openShare() { this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); setTimeout(() => this.dom.shareModal.querySelector('.share-sheet').classList.add('active'), 10); }
    openComments() { this.dom.commentModal.classList.remove('hidden'); setTimeout(() => { this.dom.commentModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.commentModal.querySelector('div').classList.remove('scale-90'); }, 10); }

    // Color Utils
    hexToHsl(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
    hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length === 1) r = "0" + r; if (g.length === 1) g = "0" + g; if (b.length === 1) b = "0" + b; return "#" + r + g + b; }
}
