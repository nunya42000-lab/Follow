export function initCore(manager) {
    // 1. Build the DOM cache
    manager.dom = {
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

        // Voice Preset DOM
        voicePresetSelect: document.getElementById('voice-preset-select'),
        voicePresetAdd: document.getElementById('voice-preset-add'),
        voicePresetSave: document.getElementById('voice-preset-save'),
        voicePresetRename: document.getElementById('voice-preset-rename'),
        voicePresetDelete: document.getElementById('voice-preset-delete'),
        voicePitch: document.getElementById('voice-pitch'), 
        voiceRate: document.getElementById('voice-rate'), 
        voiceVolume: document.getElementById('voice-volume'), 
        voiceTestBtn: document.getElementById('test-voice-btn'),
        
        // Developer & Config
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

        // Inputs & Modes
        input: document.getElementById('input-select'), 
        mode: document.getElementById('mode-select'), // Where "Follow Me" is handled
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
        
        // Advanced Controls
        speedGesturesToggle: document.getElementById('speed-gestures-toggle'),
        volumeGesturesToggle: document.getElementById('volume-gestures-toggle'),
        deleteGestureToggle: document.getElementById('delete-gesture-toggle'),
        clearGestureToggle: document.getElementById('clear-gesture-toggle'),
        autoTimerToggle: document.getElementById('auto-timer-toggle'),
        autoCounterToggle: document.getElementById('auto-counter-toggle'),
        arModeToggle: document.getElementById('ar-mode-toggle'),
        voiceInputToggle: document.getElementById('voice-input-toggle'),
        wakeLockToggle: document.getElementById('wake-lock-toggle'),
        upsideDownToggle: document.getElementById('upside-down-toggle'),
        speedDelete: document.getElementById('speed-delete-toggle'), 
        showWelcome: document.getElementById('show-welcome-toggle'), 
        blackoutToggle: document.getElementById('blackout-toggle'), 
        stealth1KeyToggle: document.getElementById('stealth-1key-toggle'), // Bigger Buttons
        
        // Dynamic Dev Toggles
        devVoiceToggle: document.getElementById('dev-voice-toggle'),
        devHapticToggle: document.getElementById('dev-haptic-toggle'),

        // Mappings Containers
        mapping9Container: document.getElementById('mapping-9-container'),
        mapping12Container: document.getElementById('mapping-12-container'),
        mappingPianoContainer: document.getElementById('mapping-piano-container'),
        morseContainer: document.getElementById('morse-container'),
        voiceSection: document.getElementById('voice-settings-section'),

        // TABS
        tabs: document.querySelectorAll('.tab-btn'),
        contents: document.querySelectorAll('.tab-content'),
        closeSettingsBtn: document.getElementById('close-settings'),
        
        // Overlays
        shareModal: document.getElementById('share-modal'), 
        donateModal: document.getElementById('donate-modal'),
        redeemModal: document.getElementById('redeem-modal')
    };

    manager.updateApp = () => {
        if (manager.callbacks && manager.callbacks.onSettingsChange) {
            manager.callbacks.onSettingsChange(manager.appSettings);
        }
    };
}
