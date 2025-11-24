// settings.js - Handles Settings, Help, Share and Setup Modals

export class SettingsManager {
    constructor(appSettings, callbacks) {
        this.appSettings = appSettings;
        this.callbacks = callbacks || {}; 
        
        this.INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
        this.MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };

        // DOM Elements
        this.dom = {
            // Setup Modal (Quick Start)
            setupModal: document.getElementById('game-setup-modal'),
            closeSetupBtn: document.getElementById('close-game-setup-modal'),
            
            // Profile Selectors
            configSelect: document.getElementById('config-select'),
            quickConfigSelect: document.getElementById('quick-config-select'),
            
            configAdd: document.getElementById('config-add'),
            configRename: document.getElementById('config-rename'),
            configDelete: document.getElementById('config-delete'),
            
            dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'),
            quickAudio: document.getElementById('quick-audio-toggle'),
            quickHelp: document.getElementById('quick-open-help'),
            quickSettings: document.getElementById('quick-open-settings'),
            
            // Resize Buttons (Quick Start)
            quickResizeUp: document.getElementById('quick-resize-up'),
            quickResizeDown: document.getElementById('quick-resize-down'),
            
            // Settings Modal
            settingsModal: document.getElementById('settings-modal'),
            closeSettingsBtn: document.getElementById('close-settings'),
            openShareInside: document.getElementById('open-share-button'),
            
            // Share Modal
            shareModal: document.getElementById('share-modal'),
            closeShareBtn: document.getElementById('close-share'),
            nativeShareBtn: document.getElementById('native-share-button'),
            copyLinkBtn: document.getElementById('copy-link-button'),
            
            // Help Modal
            helpModal: document.getElementById('help-modal'),
            closeHelpBtn: document.getElementById('close-help'),
            
            // Form Inputs (Settings)
            input: document.getElementById('input-select'),
            mode: document.getElementById('mode-toggle'),
            machines: document.getElementById('machines-slider'),
            machinesDisplay: document.getElementById('machines-display'),
            seqLength: document.getElementById('sequence-length-slider'),
            seqDisplay: document.getElementById('sequence-length-display'),
            seqLabel: document.getElementById('sequence-length-label'),
            chunk: document.getElementById('chunk-slider'),
            chunkDisplay: document.getElementById('chunk-display'),
            delay: document.getElementById('delay-slider'),
            delayDisplay: document.getElementById('delay-display'),
            autoClear: document.getElementById('autoclear-toggle'),
            multiSeqGroup: document.getElementById('setting-multi-sequence-group'),
            autoClearGroup: document.getElementById('setting-autoclear'),
            
            // Audio/Feedback
            autoplay: document.getElementById('autoplay-toggle'),
            speedDelete: document.getElementById('speed-delete-toggle'),
            audio: document.getElementById('audio-toggle'),
            haptics: document.getElementById('haptics-toggle'),
            
            // Tools (Stealth)
            showMic: document.getElementById('show-mic-toggle'),
            showCam: document.getElementById('show-cam-toggle'),
            
            // Global
            playbackSpeed: document.getElementById('playback-speed-slider'),
            playbackDisplay: document.getElementById('playback-speed-display'),
            showWelcome: document.getElementById('show-welcome-toggle'),
            darkMode: document.getElementById('dark-mode-toggle'),
            uiScale: document.getElementById('ui-scale-slider'),
            uiScaleDisplay: document.getElementById('ui-scale-display'),
            
            // NEW Gesture Toggle
            gestureMode: document.getElementById('gesture-mode-toggle'),
            
            // Other
            restoreBtn: document.querySelector('button[data-action="restore-defaults"]')
        };
        
        this.initListeners();
    }

    getCurrentProfileSettings() {
        return this.appSettings.profiles[this.appSettings.activeProfileId]?.settings;
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

    // --- SETUP MODAL ---
    openSetup() {
        this.populateConfigDropdown();
        const ps = this.getCurrentProfileSettings();
        if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = ps.isAutoplayEnabled;
        if(this.dom.quickAudio) this.dom.quickAudio.checked = ps.isAudioEnabled;
        if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        this.toggleModal(this.dom.setupModal, true);
    }
    
    closeSetup() {
        const ps = this.getCurrentProfileSettings();
        if(this.dom.quickAutoplay) ps.isAutoplayEnabled = this.dom.quickAutoplay.checked;
        if(this.dom.quickAudio) ps.isAudioEnabled = this.dom.quickAudio.checked;
        if(this.dom.dontShowWelcome) this.appSettings.showWelcomeScreen = !this.dom.dontShowWelcome.checked;
        
        this.callbacks.onSave();
        this.callbacks.onUpdate();
        this.toggleModal(this.dom.setupModal, false);
        
        if(this.callbacks.onRequestPermissions) this.callbacks.onRequestPermissions();
    }

    populateConfigDropdown() {
        const createOptions = () => {
             return Object.keys(this.appSettings.profiles).map(id => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = this.appSettings.profiles[id].name;
                return option;
             });
        };

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

    // --- SETTINGS MODAL ---
    openSettings() {
        this.populateConfigDropdown();
        
        const ps = this.getCurrentProfileSettings();
        
        this.dom.input.value = ps.currentInput;
        this.dom.mode.checked = (ps.currentMode === this.MODES.UNIQUE_ROUNDS);
        this.dom.machines.value = ps.machineCount;
        this.dom.seqLength.value = ps.sequenceLength;
        this.dom.chunk.value = ps.simonChunkSize;
        this.dom.delay.value = ps.simonInterSequenceDelay;
        this.dom.autoClear.checked = ps.isUniqueRoundsAutoClearEnabled;
        
        this.dom.autoplay.checked = ps.isAutoplayEnabled;
        this.dom.speedDelete.checked = ps.isSpeedDeletingEnabled;
        this.dom.audio.checked = ps.isAudioEnabled;
        this.dom.haptics.checked = ps.isHapticsEnabled;
        
        // Tools
        this.dom.showMic.checked = ps.showMicBtn || false;
        this.dom.showCam.checked = ps.showCamBtn || false;
        
        // Global
        this.dom.playbackSpeed.value = this.appSettings.playbackSpeed * 100;
        this.dom.showWelcome.checked = this.appSettings.showWelcomeScreen;
        this.dom.darkMode.checked = this.appSettings.isDarkMode;
        this.dom.uiScale.value = this.appSettings.globalUiScale;
        
        // Gesture
        if (this.dom.gestureMode) {
            this.dom.gestureMode.checked = (this.appSettings.gestureResizeMode === 'sequence');
        }
        
        this.updateDisplays();
        this.updateVisibility();
        
        this.toggleModal(this.dom.settingsModal, true);
    }
    
    closeSettings() {
        this.callbacks.onSave();
        this.callbacks.onUpdate();
        this.toggleModal(this.dom.settingsModal, false);
    }

    // --- SHARE MODAL ---
    openShare() {
        this.closeSettings();
        if(this.dom.nativeShareBtn) {
            this.dom.nativeShareBtn.style.display = navigator.share ? 'block' : 'none';
        }
        if(this.dom.copyLinkBtn) {
            this.dom.copyLinkBtn.innerHTML = 'Copy Link';
            this.dom.copyLinkBtn.disabled = false;
        }
        this.toggleModal(this.dom.shareModal, true);
    }

    updateDisplays() {
        const ps = this.getCurrentProfileSettings();
        if(this.dom.machinesDisplay) this.dom.machinesDisplay.textContent = ps.machineCount + (ps.machineCount > 1 ? ' Machines' : ' Machine');
        if(this.dom.seqDisplay) this.dom.seqDisplay.textContent = ps.sequenceLength;
        if(this.dom.chunkDisplay) this.dom.chunkDisplay.textContent = ps.simonChunkSize;
        if(this.dom.delayDisplay) this.dom.delayDisplay.textContent = (ps.simonInterSequenceDelay / 1000).toFixed(1) + 's';
        if(this.dom.playbackDisplay) this.dom.playbackDisplay.textContent = parseInt(this.appSettings.playbackSpeed * 100) + '%';
        if(this.dom.uiScaleDisplay) this.dom.uiScaleDisplay.textContent = parseInt(this.appSettings.globalUiScale) + '%';
    }

    updateVisibility() {
        const ps = this.getCurrentProfileSettings();
        const isSimon = (ps.currentMode === this.MODES.SIMON);
        
        if (this.dom.seqLabel) this.dom.seqLabel.textContent = isSimon ? '4. Sequence Length' : '4. Unique Rounds';
        if (this.dom.machines) this.dom.machines.disabled = !isSimon;
        if (!isSimon && this.dom.machines) this.dom.machines.value = 1;

        if (this.dom.autoClearGroup) this.dom.autoClearGroup.style.display = isSimon ? 'none' : 'flex';
        if (this.dom.multiSeqGroup) this.dom.multiSeqGroup.style.display = (isSimon && ps.machineCount > 1) ? 'block' : 'none';
    }

    initListeners() {
        // Modal Logic
        if(this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if(this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => this.closeSettings();
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.toggleModal(this.dom.helpModal, false);
        
        // Setup Modal Extras
        if(this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.openHelp(); };
        if(this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        
        // Share Modal Extras
        if(this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
        if(this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.toggleModal(this.dom.shareModal, false);
        if(this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => {
             navigator.share({ title: 'Follow Me', url: window.location.href });
        };
        if(this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick = () => {
             navigator.clipboard.writeText(window.location.href);
             this.dom.copyLinkBtn.innerText = "Copied!";
        };
        
        // Profile Management Helper
        const handleProfileSwitch = (val) => {
            if(this.callbacks.onProfileSwitch) this.callbacks.onProfileSwitch(val);
            this.populateConfigDropdown(); 
        };

        if(this.dom.configSelect) this.dom.configSelect.onchange = (e) => { handleProfileSwitch(e.target.value); this.openSettings(); };
        if(this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => { handleProfileSwitch(e.target.value); };

        if(this.dom.configAdd) this.dom.configAdd.onclick = () => {
             const name = prompt("New Profile Name:", "New Setup");
             if(name && this.callbacks.onProfileAdd) this.callbacks.onProfileAdd(name);
             this.populateConfigDropdown();
             this.openSettings();
        };
        if(this.dom.configRename) this.dom.configRename.onclick = () => {
             const name = prompt("Rename Profile:", this.appSettings.profiles[this.appSettings.activeProfileId].name);
             if(name && this.callbacks.onProfileRename) this.callbacks.onProfileRename(name);
             this.populateConfigDropdown();
        };
        if(this.dom.configDelete) this.dom.configDelete.onclick = () => {
             if(this.callbacks.onProfileDelete) this.callbacks.onProfileDelete();
             this.populateConfigDropdown();
             this.openSettings();
        };
        
        // Quick Resize Buttons
        if(this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => {
            this.appSettings.globalUiScale = Math.min(150, this.appSettings.globalUiScale + 10);
            this.callbacks.onUpdate();
        };
        if(this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => {
            this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10);
            this.callbacks.onUpdate();
        };

        // Generic Input Handler
        const handleInput = (el, prop, isGlobal = false, isBool = false, isFloat = false) => {
            if(!el) return;
            el.onchange = el.oninput = (e) => {
                let val = isBool ? el.checked : el.value;
                if(!isBool && !isFloat) val = parseInt(val);
                if(isFloat) val = parseFloat(val) / 100.0;

                if(isGlobal) {
                    this.appSettings[prop] = val;
                    if(prop === 'isDarkMode') document.body.classList.toggle('dark', val);
                    if(prop === 'globalUiScale') document.documentElement.style.fontSize = `${val}%`; 
                } else {
                    const ps = this.getCurrentProfileSettings();
                    ps[prop] = val;
                    if(prop === 'currentMode') ps.currentMode = val ? this.MODES.UNIQUE_ROUNDS : this.MODES.SIMON;
                }
                
                this.updateDisplays();
                this.updateVisibility();
                this.callbacks.onUpdate(); 
            };
        };

        // Bind Settings
        handleInput(this.dom.input, 'currentInput');
        handleInput(this.dom.mode, 'currentMode', false, true); 
        handleInput(this.dom.machines, 'machineCount');
        handleInput(this.dom.seqLength, 'sequenceLength');
        handleInput(this.dom.chunk, 'simonChunkSize');
        handleInput(this.dom.delay, 'simonInterSequenceDelay');
        handleInput(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', false, true);
        
        handleInput(this.dom.uiScale, 'globalUiScale', true, false, false); // Global UI Scale
        handleInput(this.dom.playbackSpeed, 'playbackSpeed', true, false, true);
        handleInput(this.dom.showWelcome, 'showWelcomeScreen', true, true);
        handleInput(this.dom.darkMode, 'isDarkMode', true, true);
        
        handleInput(this.dom.autoplay, 'isAutoplayEnabled', false, true);
        handleInput(this.dom.speedDelete, 'isSpeedDeletingEnabled', false, true);
        handleInput(this.dom.audio, 'isAudioEnabled', false, true);
        handleInput(this.dom.haptics, 'isHapticsEnabled', false, true);
        
        handleInput(this.dom.showMic, 'showMicBtn', false, true);
        handleInput(this.dom.showCam, 'showCamBtn', false, true);
        
        // Gesture Toggle Handler
        if (this.dom.gestureMode) {
            this.dom.gestureMode.onchange = (e) => {
                this.appSettings.gestureResizeMode = e.target.checked ? 'sequence' : 'global';
                this.callbacks.onSave();
            };
        }
        
        if(this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => {
            if(confirm("Factory Reset: Are you sure?")) this.callbacks.onReset();
        }
    }
}
