import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { HAND_GESTURE_GROUPS, TOUCH_GESTURE_GROUPS } from './gesture_groups.js';

// === PREMADE THEMES ===
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

// === PREMADE VOICE PRESETS ===
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

const CRAYONS = ["#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", "#B0B7C6", "#AF4035", "#F5F5F5"];

const LANG = {
    en: {
        quick_title: "👋 Quick Start", select_profile: "Select Profile", autoplay: "Autoplay", audio: "Audio", help_btn: "Help 📚", settings_btn: "Settings", dont_show: "Don't show again",
        lbl_profiles: "Profiles", lbl_game: "Game", lbl_playback: "Playback", lbl_general: "General", lbl_mode: "Mode", lbl_input: "Input",
        timer_toggle: "Timer ⏱️", counter_toggle: "Counter #"
    },
    es: {
        quick_title: "👋 Inicio Rápido", select_profile: "Perfil", autoplay: "Auto-reproducción", audio: "Audio", help_btn: "Ayuda 📚", settings_btn: "Ajustes", dont_show: "No mostrar más",
        lbl_profiles: "Perfiles", lbl_game: "Juego", lbl_playback: "Reproducción", lbl_general: "General", lbl_mode: "Modo", lbl_input: "Entrada",
        timer_toggle: "Mostrar Temporizador", counter_toggle: "Mostrar Contador"
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
            ftHue: document.getElementById('hue-slider'),
            ftSat: document.getElementById('sat-slider'),
            ftLit: document.getElementById('lit-slider'),
            targetBtns: document.querySelectorAll('.target-btn'),
            edName: document.getElementById('theme-name-input'),
            edPreview: document.getElementById('theme-preview-box'),
            edPreviewBtn: document.getElementById('apply-theme'),
            edSave: document.getElementById('save-theme-btn'),
            edCancel: document.getElementById('cancel-theme-btn'),
            openEditorBtn: document.getElementById('open-theme-editor'),
            voiceTestBtn: document.getElementById('voice-test-btn'),
            voicePresetSelect: document.getElementById('voice-preset-select'),
            voicePresetAdd: document.getElementById('voice-preset-add'),
            voicePresetSave: document.getElementById('voice-preset-save'),
            voicePresetRename: document.getElementById('voice-preset-rename'),
            voicePresetDelete: document.getElementById('voice-preset-delete'),
            voicePitch: document.getElementById('voice-pitch'),
            voiceRate: document.getElementById('voice-rate'),
            voiceVolume: document.getElementById('voice-volume'),
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
            autoClear: document.getElementById('autoclear-toggle'),
            autoplay: document.getElementById('autoplay-toggle'),
            flash: document.getElementById('flash-toggle'),
            pause: document.getElementById('pause-select'),
            audio: document.getElementById('audio-toggle'),
            hapticMorse: document.getElementById('haptic-morse-toggle'),
            playbackSpeed: document.getElementById('playback-speed-select'),
            arModeToggle: document.getElementById('ar-mode-toggle'),
            voiceInputToggle: document.getElementById('voice-input-toggle'),
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
            showWelcome: document.getElementById('show-welcome-toggle'),
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
            copyPromptBtn: document.getElementById('copy-prompt-btn'),
            generatePromptBtn: document.getElementById('generate-prompt-btn'),
            promptDisplay: document.getElementById('prompt-display'),
            delay: document.getElementById('delay-select'),
            chunk: document.getElementById('chunk-select'),
            upsidedownToggle: document.getElementById('upsidedown-toggle'),
            arSpeedSelect: document.getElementById('ar-speed-select'),
            gestureTapSlider: document.getElementById('gesture-tap-slider'),
            gestureSwipeSlider: document.getElementById('gesture-swipe-slider'),
            gestureTapVal: document.getElementById('gesture-tap-val'),
            gestureSwipeVal: document.getElementById('gesture-swipe-val'),
            gestureToggle: document.getElementById('gesture-input-toggle'),
            blackoutGesturesToggle: document.getElementById('blackout-gestures-toggle')
        };

        this.tempTheme = null;
        this.initListeners();
        this.populateConfigDropdown();
        this.populateThemeDropdown();
        this.buildColorGrid();
        this.populateVoicePresetDropdown();
        this.populatePlaybackSpeedDropdown();
        this.populateUIScaleDropdown();
        this.updateUIFromSettings();
    }

    initListeners() {
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
                };
            });
        }

        if (this.dom.closeSettingsBtn) {
            this.dom.closeSettingsBtn.onclick = () => {
                this.callbacks.onSave();
                this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.settingsModal.style.pointerEvents = 'none';
            };
        }

        // Color editor
        if (this.dom.targetBtns && this.dom.targetBtns.length > 0) {
            this.dom.targetBtns.forEach(btn => {
                btn.onclick = () => {
                    this.dom.targetBtns.forEach(b => {
                        b.classList.remove('active', 'bg-primary-app');
                        b.classList.add('opacity-60');
                    });
                    btn.classList.add('active', 'bg-primary-app');
                    btn.classList.remove('opacity-60');
                    this.currentTargetKey = btn.dataset.key;
                };
            });
        }

        if (this.dom.ftHue && this.dom.ftSat && this.dom.ftLit) {
            [this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => {
                sl.oninput = () => this.updateColorFromSliders();
            });
        }

        if (this.dom.ftToggle) {
            this.dom.ftToggle.onclick = () => {
                this.dom.ftContainer.classList.remove('hidden');
                this.dom.ftToggle.style.display = 'none';
            };
        }

        if (this.dom.edSave) {
            this.dom.edSave.onclick = () => {
                if (this.tempTheme) {
                    const activeId = this.appSettings.activeTheme;
                    if (PREMADE_THEMES[activeId]) {
                        const newId = 'custom_' + Date.now();
                        this.appSettings.customThemes[newId] = JSON.parse(JSON.stringify(this.tempTheme));
                        this.appSettings.activeTheme = newId;
                    } else {
                        this.appSettings.customThemes[activeId] = JSON.parse(JSON.stringify(this.tempTheme));
                    }
                    this.callbacks.onSave();
                    this.populateThemeDropdown();
                    this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none');
                }
            };
        }

        if (this.dom.openEditorBtn) {
            this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
        }

        if (this.dom.edCancel) {
            this.dom.edCancel.onclick = () => {
                this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none');
            };
        }

        // Voice controls
        if (this.dom.voiceTestBtn) {
            this.dom.voiceTestBtn.onclick = () => this.testVoice();
        }

        const updateVoiceLive = () => {
            if (this.dom.voicePitch) this.appSettings.voicePitch = parseFloat(this.dom.voicePitch.value);
            if (this.dom.voiceRate) this.appSettings.voiceRate = parseFloat(this.dom.voiceRate.value);
            if (this.dom.voiceVolume) this.appSettings.voiceVolume = parseFloat(this.dom.voiceVolume.value);
        };

        if (this.dom.voicePitch) this.dom.voicePitch.oninput = updateVoiceLive;
        if (this.dom.voiceRate) this.dom.voiceRate.oninput = updateVoiceLive;
        if (this.dom.voiceVolume) this.dom.voiceVolume.oninput = updateVoiceLive;

        // Voice presets
        if (this.dom.voicePresetSelect) {
            this.dom.voicePresetSelect.onchange = (e) => {
                this.appSettings.activeVoicePresetId = e.target.value;
                this.applyVoicePreset(e.target.value);
            };
        }

        if (this.dom.voicePresetAdd) {
            this.dom.voicePresetAdd.onclick = () => {
                const n = prompt("New Voice Preset Name:");
                if (n) {
                    const id = 'vp_' + Date.now();
                    this.appSettings.voicePresets[id] = {
                        name: n,
                        pitch: this.appSettings.voicePitch || 1.0,
                        rate: this.appSettings.voiceRate || 1.0,
                        volume: this.appSettings.voiceVolume || 1.0
                    };
                    this.callbacks.onSave();
                    this.populateVoicePresetDropdown();
                }
            };
        }

        if (this.dom.voicePresetSave) {
            this.dom.voicePresetSave.onclick = () => {
                const id = this.appSettings.activeVoicePresetId;
                if (PREMADE_VOICE_PRESETS[id]) {
                    alert("Cannot save over built-in presets.");
                } else if (this.appSettings.voicePresets[id]) {
                    this.appSettings.voicePresets[id].pitch = this.appSettings.voicePitch || 1.0;
                    this.appSettings.voicePresets[id].rate = this.appSettings.voiceRate || 1.0;
                    this.appSettings.voicePresets[id].volume = this.appSettings.voiceVolume || 1.0;
                    this.callbacks.onSave();
                    alert("Voice preset saved!");
                }
            };
        }

        if (this.dom.voicePresetDelete) {
            this.dom.voicePresetDelete.onclick = () => {
                const id = this.appSettings.activeVoicePresetId;
                if (PREMADE_VOICE_PRESETS[id]) {
                    alert("Cannot delete built-in presets.");
                } else if (confirm("Delete this preset?")) {
                    delete this.appSettings.voicePresets[id];
                    this.callbacks.onSave();
                    this.populateVoicePresetDropdown();
                }
            };
        }

        if (this.dom.voicePresetRename) {
            this.dom.voicePresetRename.onclick = () => {
                const id = this.appSettings.activeVoicePresetId;
                if (PREMADE_VOICE_PRESETS[id]) {
                    return alert("Cannot rename built-in presets.");
                }
                const newName = prompt("New name:");
                if (newName && this.appSettings.voicePresets[id]) {
                    this.appSettings.voicePresets[id].name = newName;
                    this.callbacks.onSave();
                    this.populateVoicePresetDropdown();
                }
            };
        }

        // Language
        if (this.dom.quickLang) {
            this.dom.quickLang.onchange = (e) => this.setLanguage(e.target.value);
        }
        if (this.dom.generalLang) {
            this.dom.generalLang.onchange = (e) => this.setLanguage(e.target.value);
        }

        // Config/profile switching
        const handleProfileSwitch = (val) => {
            this.callbacks.onProfileSwitch(val);
            this.openSettings();
        };
        if (this.dom.configSelect) {
            this.dom.configSelect.onchange = (e) => handleProfileSwitch(e.target.value);
        }
        if (this.dom.quickConfigSelect) {
            this.dom.quickConfigSelect.onchange = (e) => handleProfileSwitch(e.target.value);
        }

        // Theme management
        if (this.dom.themeSelect) {
            this.dom.themeSelect.onchange = (e) => {
                this.appSettings.activeTheme = e.target.value;
                this.callbacks.onUpdate();
                this.populateThemeDropdown();
            };
        }

        if (this.dom.themeAdd) {
            this.dom.themeAdd.onclick = () => {
                const n = prompt("Theme Name:");
                if (n) {
                    const id = 'c_' + Date.now();
                    this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'] };
                    this.callbacks.onSave();
                    this.populateThemeDropdown();
                }
            };
        }

        if (this.dom.themeRename) {
            this.dom.themeRename.onclick = () => {
                const id = this.appSettings.activeTheme;
                if (PREMADE_THEMES[id]) return alert("Cannot rename built-in themes.");
                const n = prompt("Rename:", this.appSettings.customThemes[id].name || '');
                if (n) {
                    this.appSettings.customThemes[id].name = n;
                    this.callbacks.onSave();
                    this.populateThemeDropdown();
                }
            };
        }

        if (this.dom.themeDelete) {
            this.dom.themeDelete.onclick = () => {
                if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in themes.");
                if (confirm("Delete this theme?")) {
                    delete this.appSettings.customThemes[this.appSettings.activeTheme];
                    this.appSettings.activeTheme = 'default';
                    this.callbacks.onSave();
                    this.populateThemeDropdown();
                }
            };
        }

        // Config management
        if (this.dom.configAdd) {
            this.dom.configAdd.onclick = () => {
                const n = prompt("Profile Name:");
                if (n) this.callbacks.onProfileAdd(n);
                this.openSettings();
            };
        }

        if (this.dom.configRename) {
            this.dom.configRename.onclick = () => {
                const n = prompt("Rename:");
                if (n) this.callbacks.onProfileRename(n);
                this.populateConfigDropdown();
            };
        }

        if (this.dom.configDelete) {
            this.dom.configDelete.onclick = () => {
                this.callbacks.onProfileDelete();
                this.openSettings();
            };
        }

        if (this.dom.configSave) {
            this.dom.configSave.onclick = () => {
                this.callbacks.onProfileSave();
            };
        }

        // Settings toggles
        const bindToggle = (el, prop, isGlobal) => {
            if (!el) return;
            el.onchange = () => {
                const val = el.checked;
                if (isGlobal) {
                    this.appSettings[prop] = val;
                } else {
                    this.appSettings.runtimeSettings[prop] = val;
                }
                this.callbacks.onSave();
                if (prop === 'showTimer' || prop === 'showCounter' || prop === 'isVoiceInputEnabled' || prop === 'isArModeEnabled') {
                    this.updateHeaderVisibility();
                }
            };
        };

        bindToggle(this.dom.autoplay, 'isAutoplayEnabled', true);
        bindToggle(this.dom.audio, 'isAudioEnabled', true);
        bindToggle(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        bindToggle(this.dom.upsidedownToggle, 'showUpsideDownBtn', true);
        bindToggle(this.dom.arModeToggle, 'isArModeEnabled', true);
        bindToggle(this.dom.voiceInputToggle, 'isVoiceInputEnabled', true);
        bindToggle(this.dom.gestureToggle, 'isGestureInputEnabled', true);
        bindToggle(this.dom.blackoutGesturesToggle, 'isHandGesturesEnabled', true);
        bindToggle(this.dom.quickAutoplay, 'isAutoplayEnabled', true);
        bindToggle(this.dom.quickAudio, 'isAudioEnabled', true);
        bindToggle(this.dom.dontShowWelcome, 'showWelcomeScreen', true);
        bindToggle(this.dom.showWelcome, 'showWelcomeScreen', true);

        // Playback speed
        if (this.dom.playbackSpeed) {
            this.dom.playbackSpeed.onchange = (e) => {
                this.appSettings.playbackSpeed = parseFloat(e.target.value);
                this.callbacks.onSave();
                this.generatePrompt();
            };
        }

        // UI Scale
        if (this.dom.uiScale) {
            this.dom.uiScale.onchange = (e) => {
                this.appSettings.globalUiScale = parseInt(e.target.value);
                this.callbacks.onUpdate();
            };
        }

        if (this.dom.seqSize) {
            this.dom.seqSize.onchange = (e) => {
                this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0;
                this.callbacks.onUpdate();
            };
        }

        if (this.dom.seqFontSize) {
            this.dom.seqFontSize.onchange = (e) => {
                this.appSettings.uiFontSizeMultiplier = parseInt(e.target.value) / 100.0;
                this.callbacks.onSave();
                this.callbacks.onUpdate();
            };
        }

        // Modal controls
        if (this.dom.openShareInside) {
            this.dom.openShareInside.onclick = () => this.openShare();
        }

        if (this.dom.closeShareBtn) {
            this.dom.closeShareBtn.onclick = () => {
                this.closeShare();
                this.openSettings();
            };
        }

        if (this.dom.openCalibBtn) {
            this.dom.openCalibBtn.onclick = () => this.openCalibration();
        }

        if (this.dom.closeCalibBtn) {
            this.dom.closeCalibBtn.onclick = () => this.closeCalibration();
        }

        if (this.dom.calibAudioSlider) {
            this.dom.calibAudioSlider.oninput = () => {
                const val = parseInt(this.dom.calibAudioSlider.value);
                this.appSettings.sensorAudioThresh = val;
                if (this.sensorEngine) this.sensorEngine.setSensitivity('audio', val);
            };
        }

        if (this.dom.calibCamSlider) {
            this.dom.calibCamSlider.oninput = () => {
                const val = parseInt(this.dom.calibCamSlider.value);
                this.appSettings.sensorCamThresh = val;
                if (this.sensorEngine) this.sensorEngine.setSensitivity('cam', val);
            };
        }

        // Redeem/Donate
        let rScale = 100;
        const updateRedeem = () => {
            if (this.dom.redeemImg) this.dom.redeemImg.style.transform = `scale(${rScale / 100})`;
        };

        if (this.dom.openRedeemBtn) {
            this.dom.openRedeemBtn.onclick = () => {
                rScale = 100;
                updateRedeem();
                this.toggleRedeem(true);
            };
        }

        if (this.dom.closeRedeemBtn) {
            this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);
        }

        if (this.dom.openRedeemSettingsBtn) {
            this.dom.openRedeemSettingsBtn.onclick = () => {
                rScale = 100;
                updateRedeem();
                this.toggleRedeem(true);
            };
        }

        if (this.dom.redeemPlus) {
            this.dom.redeemPlus.onclick = () => {
                rScale = Math.min(100, rScale + 10);
                updateRedeem();
            };
        }

        if (this.dom.redeemMinus) {
            this.dom.redeemMinus.onclick = () => {
                rScale = Math.max(10, rScale - 10);
                updateRedeem();
            };
        }

        if (this.dom.openDonateBtn) {
            this.dom.openDonateBtn.onclick = () => this.toggleDonate(true);
        }

        if (this.dom.closeDonateBtn) {
            this.dom.closeDonateBtn.onclick = () => this.toggleDonate(false);
        }

        // Share buttons
        if (this.dom.copyLinkBtn) {
            this.dom.copyLinkBtn.onclick = () => {
                navigator.clipboard.writeText(window.location.href).then(() => alert("Link Copied!"));
            };
        }

        if (this.dom.copyPromptBtn) {
            this.dom.copyPromptBtn.onclick = () => {
                if (this.dom.promptDisplay) {
                    this.dom.promptDisplay.select();
                    navigator.clipboard.writeText(this.dom.promptDisplay.value).then(() => alert("Copied!"));
                }
            };
        }

        if (this.dom.generatePromptBtn) {
            this.dom.generatePromptBtn.onclick = () => {
                this.generatePrompt();
                if (this.dom.promptDisplay) {
                    this.dom.promptDisplay.style.opacity = '0.5';
                    setTimeout(() => {
                        this.dom.promptDisplay.style.opacity = '1';
                    }, 200);
                }
            };
        }

        if (this.dom.nativeShareBtn) {
            this.dom.nativeShareBtn.onclick = () => {
                if (navigator.share) {
                    navigator.share({ title: "Follow Me", url: window.location.href });
                } else {
                    alert("Share not supported on this device.");
                }
            };
        }

        if (this.dom.chatShareBtn) {
            this.dom.chatShareBtn.onclick = () => {
                window.location.href = `sms:?body=Check%20out%20Follow%20Me:%20${window.location.href}`;
            };
        }

        if (this.dom.emailShareBtn) {
            this.dom.emailShareBtn.onclick = () => {
                window.location.href = `mailto:?subject=Follow%20Me%20App&body=Check%20out%20Follow%20Me:%20${window.location.href}`;
            };
        }

        // Donation links
        if (this.dom.btnCashMain) {
            this.dom.btnCashMain.onclick = () => {
                window.open('https://cash.app/$jwo83', '_blank');
            };
        }

        if (this.dom.btnPaypalMain) {
            this.dom.btnPaypalMain.onclick = () => {
                window.open('https://www.paypal.me/Oyster981', '_blank');
            };
        }

        // Quick buttons
        if (this.dom.quickSettings) {
            this.dom.quickSettings.onclick = () => {
                this.closeSetup();
                this.openSettings();
            };
        }

        if (this.dom.quickHelp) {
            this.dom.quickHelp.onclick = () => {
                this.closeSetup();
                this.generatePrompt();
                this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none');
            };
        }

        if (this.dom.closeHelpBtn) {
            this.dom.closeHelpBtn.onclick = () => {
                this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
            };
        }

        if (this.dom.closeHelpBtnBottom) {
            this.dom.closeHelpBtnBottom.onclick = () => {
                this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
            };
        }

        if (this.dom.openHelpBtn) {
            this.dom.openHelpBtn.onclick = () => {
                this.generatePrompt();
                this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none');
            };
        }

        if (this.dom.closeSetupBtn) {
            this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        }

        if (this.dom.quickResizeUp) {
            this.dom.quickResizeUp.onclick = () => {
                this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10);
                this.callbacks.onUpdate();
            };
        }

        if (this.dom.quickResizeDown) {
            this.dom.quickResizeDown.onclick = () => {
                this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10);
                this.callbacks.onUpdate();
            };
        }

        if (this.dom.restoreBtn) {
            this.dom.restoreBtn.onclick = () => {
                if (confirm("Factory Reset?")) this.callbacks.onReset();
            };
        }

        // AR Speed
        if (this.dom.arSpeedSelect) {
            this.dom.arSpeedSelect.onchange = (e) => {
                this.appSettings.arPlaybackSpeed = parseFloat(e.target.value);
                this.callbacks.onSave();
            };
        }

        // Gesture sliders
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
        if (!this.dom.configSelect) return;
        this.dom.configSelect.innerHTML = '';
        if (this.appSettings.profiles) {
            Object.keys(this.appSettings.profiles).forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = this.appSettings.profiles[id].name || id;
                this.dom.configSelect.appendChild(opt);
            });
        }
        if (this.dom.quickConfigSelect) this.dom.quickConfigSelect.innerHTML = this.dom.configSelect.innerHTML;
    }

    populateThemeDropdown() {
        if (!this.dom.themeSelect) return;
        this.dom.themeSelect.innerHTML = '';
        const grp1 = document.createElement('optgroup');
        grp1.label = "Built-in";
        Object.keys(PREMADE_THEMES).forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = PREMADE_THEMES[k].name;
            grp1.appendChild(opt);
        });
        this.dom.themeSelect.appendChild(grp1);

        const grp2 = document.createElement('optgroup');
        grp2.label = "Custom";
        if (this.appSettings.customThemes) {
            Object.keys(this.appSettings.customThemes).forEach(k => {
                const opt = document.createElement('option');
                opt.value = k;
                opt.textContent = this.appSettings.customThemes[k].name || k;
                grp2.appendChild(opt);
            });
        }
        this.dom.themeSelect.appendChild(grp2);
        this.dom.themeSelect.value = this.appSettings.activeTheme || 'default';
    }

    populateVoicePresetDropdown() {
        if (!this.dom.voicePresetSelect) return;
        this.dom.voicePresetSelect.innerHTML = '';

        const grp1 = document.createElement('optgroup');
        grp1.label = "Built-in";
        Object.keys(PREMADE_VOICE_PRESETS).forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = PREMADE_VOICE_PRESETS[k].name;
            grp1.appendChild(opt);
        });
        this.dom.voicePresetSelect.appendChild(grp1);

        const grp2 = document.createElement('optgroup');
        grp2.label = "Custom";
        if (this.appSettings.voicePresets) {
            Object.keys(this.appSettings.voicePresets).forEach(k => {
                const opt = document.createElement('option');
                opt.value = k;
                opt.textContent = this.appSettings.voicePresets[k].name;
                grp2.appendChild(opt);
            });
        }
        this.dom.voicePresetSelect.appendChild(grp2);
        this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
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

    applyVoicePreset(id) {
        let preset = this.appSettings.voicePresets[id] || PREMADE_VOICE_PRESETS[id] || PREMADE_VOICE_PRESETS['standard'];
        this.appSettings.voicePitch = preset.pitch;
        this.appSettings.voiceRate = preset.rate;
        this.appSettings.voiceVolume = preset.volume;
        this.updateUIFromSettings();
        this.callbacks.onSave();
    }

    buildColorGrid() {
        if (!this.dom.editorGrid) return;
        this.dom.editorGrid.innerHTML = '';
        CRAYONS.forEach(color => {
            const btn = document.createElement('div');
            btn.style.backgroundColor = color;
            btn.style.width = '40px';
            btn.style.height = '40px';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.border = '2px solid transparent';
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
        this.updatePreview();
    }

    updateColorFromSliders() {
        if (!this.tempTheme) return;
        const h = parseInt(this.dom.ftHue.value);
        const s = parseInt(this.dom.ftSat.value);
        const l = parseInt(this.dom.ftLit.value);
        const hex = this.hslToHex(h, s, l);
        this.tempTheme[this.currentTargetKey] = hex;
        this.updatePreview();
    }

    openThemeEditor() {
        if (!this.dom.editorModal) return;
        const activeId = this.appSettings.activeTheme;
        const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default'];
        this.tempTheme = JSON.parse(JSON.stringify(source));
        this.updatePreview();
        this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none');
    }

    updatePreview() {
        const t = this.tempTheme;
        if (!this.dom.edPreview) return;
        this.dom.edPreview.style.backgroundColor = t.bgMain;
        this.dom.edPreview.style.color = t.text;
    }

    testVoice() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance("Testing 1 2 3.");
            u.pitch = this.appSettings.voicePitch || 1.0;
            u.rate = this.appSettings.voiceRate || 1.0;
            u.volume = this.appSettings.voiceVolume || 1.0;
            window.speechSynthesis.speak(u);
        }
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

    openSettings() {
        this.populateConfigDropdown();
        this.populateThemeDropdown();
        this.updateUIFromSettings();
        this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.settingsModal.style.pointerEvents = 'auto';
    }

    openSetup() {
        this.populateConfigDropdown();
        this.updateUIFromSettings();
        this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none');
    }

    closeSetup() {
        this.callbacks.onSave();
        this.dom.setupModal.classList.add('opacity-0');
    }

    openShare() {
        if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none');
        if (this.dom.shareModal) {
            this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none');
            this.dom.shareModal.style.pointerEvents = 'auto';
        }
    }

    closeShare() {
        if (this.dom.shareModal) {
            this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none');
            this.dom.shareModal.style.pointerEvents = 'none';
        }
    }

    openCalibration() {
        if (this.dom.calibModal) {
            this.dom.calibModal.classList.remove('opacity-0', 'pointer-events-none');
            this.dom.calibModal.style.pointerEvents = 'auto';
        }
    }

    closeCalibration() {
        if (this.dom.calibModal) {
            this.dom.calibModal.classList.add('opacity-0', 'pointer-events-none');
            this.dom.calibModal.style.pointerEvents = 'none';
        }
    }

    toggleRedeem(show) {
        if (show) {
            if (this.dom.redeemModal) {
                this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.redeemModal.style.pointerEvents = 'auto';
            }
        } else {
            if (this.dom.redeemModal) {
                this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.redeemModal.style.pointerEvents = 'none';
            }
        }
    }

    toggleDonate(show) {
        if (show) {
            if (this.dom.donateModal) {
                this.dom.donateModal.classList.remove('opacity-0', 'pointer-events-none');
                this.dom.donateModal.style.pointerEvents = 'auto';
            }
        } else {
            if (this.dom.donateModal) {
                this.dom.donateModal.classList.add('opacity-0', 'pointer-events-none');
                this.dom.donateModal.style.pointerEvents = 'none';
            }
        }
    }

    generatePrompt() {
        if (!this.dom.promptDisplay) return;
        const ps = this.appSettings.runtimeSettings || {};
        const max = ps.currentInput === 'key12' ? 12 : 9;
        const speed = this.appSettings.playbackSpeed || 1.0;
        this.dom.promptDisplay.value = `Example prompt for max ${max} at speed ${speed}x`;
    }

    updateUIFromSettings() {
        const ps = this.appSettings.runtimeSettings || {};
        if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
        if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
        if (this.dom.generalLang) this.dom.generalLang.value = this.appSettings.generalLanguage || 'en';
        if (this.dom.quickLang) this.dom.quickLang.value = this.appSettings.generalLanguage || 'en';
        if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.voicePitch || 1.0;
        if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.voiceRate || 1.0;
        if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.voiceVolume || 1.0;
        if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
        if (this.dom.seqSize) this.dom.seqSize.value = Math.round(this.appSettings.uiScaleMultiplier * 100) || 100;
        if (this.dom.seqFontSize) this.dom.seqFontSize.value = Math.round((this.appSettings.uiFontSizeMultiplier || 1.0) * 100);
        if (this.dom.autoplay) this.dom.autoplay.checked = !!this.appSettings.isAutoplayEnabled;
        if (this.dom.audio) this.dom.audio.checked = !!this.appSettings.isAudioEnabled;
        if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = !!this.appSettings.isAutoplayEnabled;
        if (this.dom.quickAudio) this.dom.quickAudio.checked = !!this.appSettings.isAudioEnabled;
        if (this.dom.upsidedownToggle) this.dom.upsidedownToggle.checked = !!this.appSettings.showUpsideDownBtn;
        if (this.dom.arModeToggle) this.dom.arModeToggle.checked = !!this.appSettings.isArModeEnabled;
        if (this.dom.voiceInputToggle) this.dom.voiceInputToggle.checked = !!this.appSettings.isVoiceInputEnabled;
        if (this.dom.gestureToggle) this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
        if (this.dom.blackoutGesturesToggle) this.dom.blackoutGesturesToggle.checked = !!this.appSettings.isHandGesturesEnabled;
        if (this.dom.arSpeedSelect) this.dom.arSpeedSelect.value = this.appSettings.arPlaybackSpeed || 1.0;
        this.setLanguage(this.appSettings.generalLanguage || 'en');
        this.updateHeaderVisibility();
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

        if (timerBtn) timerBtn.classList.toggle('hidden', !showTimer);
        if (counterBtn) counterBtn.classList.toggle('hidden', !showCounter);
        if (micBtn) micBtn.classList.toggle('hidden', !showMic);
        if (camBtn) camBtn.classList.toggle('hidden', !showCam);
        if (gestureBtn) gestureBtn.classList.toggle('hidden', !showGesture);
        if (stealthBtn) stealthBtn.classList.toggle('hidden', !showStealth);
        if (handBtn) handBtn.classList.toggle('hidden', !showHand);

        if (!showTimer && !showCounter && !showMic && !showCam && !showGesture && !showStealth && !showHand) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
    }

    hexToHsl(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substr(1, 2), 16);
            g = parseInt(hex.substr(3, 2), 16);
            b = parseInt(hex.substr(5, 2), 16);
        }
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);
        if (r.length === 1) r = '0' + r;
        if (g.length === 1) g = '0' + g;
        if (b.length === 1) b = '0' + b;
        return '#' + r + g + b;
    }
}
