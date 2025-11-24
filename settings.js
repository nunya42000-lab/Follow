export class SettingsManager {
    constructor(appSettings, callbacks) {
        this.appSettings = appSettings;
        this.callbacks = callbacks;
        
        this.dom = {
            // Modals
            settingsModal: document.getElementById('settings-modal'),
            closeSettingsBtn: document.getElementById('close-settings'), // Exit
            helpModal: document.getElementById('help-modal'),
            setupModal: document.getElementById('game-setup-modal'), // Quick Start
            shareModal: document.getElementById('share-modal'),

            // Tabs
            tabs: document.querySelectorAll('.tab-btn'),
            contents: document.querySelectorAll('.tab-content'),

            // TAB 1: MODE
            configSelect: document.getElementById('config-select'),
            configAdd: document.getElementById('config-add'),
            configRename: document.getElementById('config-rename'),
            configDelete: document.getElementById('config-delete'),

            input: document.getElementById('input-select'),
            mode: document.getElementById('mode-select'),
            machines: document.getElementById('machines-select'),
            seqLength: document.getElementById('seq-length-select'),

            // TAB 2: PLAYBACK
            autoplay: document.getElementById('autoplay-toggle'),
            audio: document.getElementById('audio-toggle'),
            hapticMorse: document.getElementById('haptic-morse-toggle'), // NEW
            
            playbackSpeed: document.getElementById('playback-speed-select'),
            chunk: document.getElementById('chunk-select'),
            delay: document.getElementById('delay-select'),

            // TAB 3: GENERAL
            haptics: document.getElementById('haptics-toggle'),
            speedDelete: document.getElementById('speed-delete-toggle'),
            showWelcome: document.getElementById('show-welcome-toggle'),
            autoClear: document.getElementById('autoclear-toggle'),
            blackoutToggle: document.getElementById('blackout-toggle'),
            
            theme: document.getElementById('theme-select'),
            uiScale: document.getElementById('ui-scale-select'),
            gestureMode: document.getElementById('gesture-mode-select'),
            autoInput: document.getElementById('auto-input-select'),

            // Prompt (Moved to Help)
            promptDisplay: document.getElementById('prompt-display'),
            copyPromptBtn: document.getElementById('copy-prompt-btn'),
            
            // Buttons
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
            
            // Setup Modal Extras
            closeSetupBtn: document.getElementById('close-game-setup-modal'),
            quickConfigSelect: document.getElementById('quick-config-select'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'),
            quickAudio: document.getElementById('quick-audio-toggle'),
            quickHelp: document.getElementById('quick-open-help'),
            quickSettings: document.getElementById('quick-open-settings'),
            dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            
            // Share Extras
            openShareInside: document.getElementById('open-share-button'),
            closeShareBtn: document.getElementById('close-share'),
            nativeShareBtn: document.getElementById('native-share-button'),
            copyLinkBtn: document.getElementById('copy-link-button'),
            
            // Help Extras
            closeHelpBtn: document.getElementById('close-help'),
            openHelpBtn: document.getElementById('open-help-button'),
        };
        
        this.initListeners();
    }

    populateConfigDropdown() {
        const createOptions = () => Object.keys(this.appSettings.profiles).map(id => {
            const option = document.createElement('option');
            option.value = id; option.textContent = this.appSettings.profiles[id].name;
            return option;
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

    openSettings() {
        this.populateConfigDropdown();
        // CHANGED: Load from RUNTIME settings, not the saved profile
        const ps = this.appSettings.runtimeSettings;
        const gs = this.appSettings;

        // Populate Fields
        if(this.dom.input) this.dom.input.value = ps.currentInput;
        if(this.dom.mode) this.dom.mode.value = (ps.currentMode === 'unique_rounds') ? 'unique' : 'simon';
        if(this.dom.machines) this.dom.machines.value = ps.machineCount;
        if(this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;

        if(this.dom.autoplay) this.dom.autoplay.checked = gs.isAutoplayEnabled;
        if(this.dom.audio) this.dom.audio.checked = gs.isAudioEnabled;
        if(this.dom.hapticMorse) this.dom.hapticMorse.checked = gs.isHapticMorseEnabled;
        if(this.dom.playbackSpeed) this.dom.playbackSpeed.value = gs.playbackSpeed.toFixed(1);
        if(this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize;
        if(this.dom.delay) this.dom.delay.value = ps.simonInterSequenceDelay;

        if(this.dom.haptics) this.dom.haptics.checked = gs.isHapticsEnabled;
        if(this.dom.speedDelete) this.dom.speedDelete.checked = gs.isSpeedDeletingEnabled;
        if(this.dom.showWelcome) this.dom.showWelcome.checked = gs.showWelcomeScreen;
        if(this.dom.autoClear) this.dom.autoClear.checked = gs.isUniqueRoundsAutoClearEnabled;
        if(this.dom.blackoutToggle) this.dom.blackoutToggle.checked = gs.isBlackoutFeatureEnabled;
        if(this.dom.theme) this.dom.theme.value = gs.activeTheme;
        if(this.dom.uiScale) this.dom.uiScale.value = Math.round(gs.uiScaleMultiplier * 100);
        if(this.dom.gestureMode) this.dom.gestureMode.value = (gs.gestureResizeMode === 'sequence') ? 'sequence' : 'global';
        
        if(this.dom.autoInput) {
            let aim = 'none';
            if(gs.showMicBtn && gs.showCamBtn) aim = 'both';
            else if(gs.showMicBtn) aim = 'mic';
            else if(gs.showCamBtn) aim = 'cam';
            this.dom.autoInput.value = aim;
        }

        this.generatePrompt();
        this.toggleModal(this.dom.settingsModal, true);
    }

    openSetup() {
        this.populateConfigDropdown();
        if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled;
        if(this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
        if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        this.toggleModal(this.dom.setupModal, true);
    }
    
    closeSetup() {
        if(this.dom.quickAutoplay) this.appSettings.isAutoplayEnabled = this.dom.quickAutoplay.checked;
        if(this.dom.quickAudio) this.appSettings.isAudioEnabled = this.dom.quickAudio.checked;
        if(this.dom.dontShowWelcome) this.appSettings.showWelcomeScreen = !this.dom.dontShowWelcome.checked;
        this.callbacks.onSave(); this.callbacks.onUpdate();
        this.toggleModal(this.dom.setupModal, false);
    }

    toggleModal(modal, show) {
        if(!modal) return;
        if (show) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.querySelector('div').classList.remove('scale-90');
        } else {
            modal.querySelector('div').classList.add('scale-90');
            modal.classList.add('opacity-0');
            setTimeout(() => modal.classList.add('pointer-events-none'), 300);
        }
    }
    
    openShare() {
        this.toggleModal(this.dom.settingsModal, false);
        if(this.dom.nativeShareBtn) this.dom.nativeShareBtn.style.display = navigator.share ? 'block' : 'none';
        if(this.dom.copyLinkBtn) { this.dom.copyLinkBtn.innerHTML = 'Copy Link'; this.dom.copyLinkBtn.disabled = false; }
        this.toggleModal(this.dom.shareModal, true);
    }

    initListeners() {
        // Tab Logic
        this.dom.tabs.forEach(btn => {
            btn.onclick = () => {
                this.dom.tabs.forEach(b => b.classList.remove('active'));
                this.dom.contents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            };
        });

        // Helper for bindings
        const bind = (el, prop, isGlobal, isInt = false, isFloat = false) => {
            if(!el) return;
            el.onchange = () => {
                let val = (el.type === 'checkbox') ? el.checked : el.value;
                if(isInt) val = parseInt(val);
                if(isFloat) val = parseFloat(val);
                
                if(isGlobal) {
                    this.appSettings[prop] = val;
                    if(prop === 'activeTheme' || prop === 'isBlackoutFeatureEnabled') this.callbacks.onUpdate();
                } else {
                    // CHANGED: Update RUNTIME, not the PROFILE
                    this.appSettings.runtimeSettings[prop] = val;
                }
                this.callbacks.onSave();
                this.generatePrompt();
            };
        };

        // BINDINGS
        bind(this.dom.input, 'currentInput', false);
        bind(this.dom.machines, 'machineCount', false, true);
        bind(this.dom.seqLength, 'sequenceLength', false, true);
        bind(this.dom.autoplay, 'isAutoplayEnabled', true);
        bind(this.dom.audio, 'isAudioEnabled', true);
        bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
        bind(this.dom.playbackSpeed, 'playbackSpeed', true, false, true);
        bind(this.dom.chunk, 'simonChunkSize', false, true);
        bind(this.dom.delay, 'simonInterSequenceDelay', false, true);
        bind(this.dom.haptics, 'isHapticsEnabled', true);
        bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true);
        bind(this.dom.showWelcome, 'showWelcomeScreen', true);
        bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
        bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', true);
        bind(this.dom.theme, 'activeTheme', true);

        if(this.dom.mode) this.dom.mode.onchange = (e) => {
             // CHANGED: Update RUNTIME
             this.appSettings.runtimeSettings.currentMode = (e.target.value === 'unique') ? 'unique_rounds' : 'simon';
             this.callbacks.onSave(); this.callbacks.onUpdate(); this.generatePrompt();
        };

        if(this.dom.uiScale) this.dom.uiScale.onchange = (e) => {
            this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0;
            this.callbacks.onUpdate();
        };

        if(this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => {
            this.appSettings.gestureResizeMode = e.target.value;
            this.callbacks.onSave();
        };

        if(this.dom.autoInput) this.dom.autoInput.onchange = (e) => {
            const val = e.target.value;
            this.appSettings.showMicBtn = (val === 'mic' || val === 'both');
            this.appSettings.showCamBtn = (val === 'cam' || val === 'both');
            this.callbacks.onSave(); this.callbacks.onUpdate();
        };

        // Profile Buttons
        if(this.dom.configSelect) this.dom.configSelect.onchange = (e) => { this.callbacks.onProfileSwitch(e.target.value); this.openSettings(); };
        if(this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => { this.callbacks.onProfileSwitch(e.target.value); };
        if(this.dom.configAdd) this.dom.configAdd.onclick = () => { const n=prompt("Profile Name:"); if(n) this.callbacks.onProfileAdd(n); this.openSettings(); };
        if(this.dom.configRename) this.dom.configRename.onclick = () => { const n=prompt("Rename:"); if(n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
        if(this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };

        // Prompt
        if(this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => { if(this.dom.promptDisplay) { navigator.clipboard.writeText(this.dom.promptDisplay.value); this.dom.copyPromptBtn.innerText="Copied!"; }};

        // Modals
        if(this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); this.toggleModal(this.dom.settingsModal, false); };
        if(this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if(this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        if(this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.toggleModal(this.dom.helpModal, true); };
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.toggleModal(this.dom.helpModal, false);
        if(this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => this.toggleModal(this.dom.helpModal, true);
        
        if(this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
        if(this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.toggleModal(this.dom.shareModal, false);
        if(this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => navigator.share({ title: 'Follow Me', url: window.location.href });
        if(this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick = () => { navigator.clipboard.writeText(window.location.href); this.dom.copyLinkBtn.innerText = "Copied!"; };
        
        if(this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => { if(confirm("Factory Reset: Are you sure?")) this.callbacks.onReset(); };
    }
    
    generatePrompt() {
        if(!this.dom.promptDisplay) return;
        // CHANGED: Generate prompt based on RUNTIME settings
        const ps = this.appSettings.runtimeSettings;
        let logic = (ps.currentMode === 'unique_rounds') ? `Game: Unique Rounds. Sequence length ${ps.sequenceLength}. New random sequence every round.` : `Game: Simon Says. Accumulate pattern. Max ${ps.sequenceLength}.`;
        let reading = (ps.machineCount > 1 || ps.simonChunkSize > 0) ? `Read in chunks of ${ps.simonChunkSize}. Pause ${(ps.simonInterSequenceDelay/1000)}s between. Machines: ${ps.machineCount}.` : "";
        this.dom.promptDisplay.value = `You are the Game Engine.\n${logic}\n${reading}\nStart Round 1.`;
    }
}
