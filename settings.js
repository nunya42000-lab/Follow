// settings.js

export class SettingsManager {
    constructor(appSettings, callbacks) {
        this.appSettings = appSettings;
        this.callbacks = callbacks || {}; 
        
        this.INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
        this.MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };

        // DOM Elements
        this.dom = {
            // Setup Modal
            setupModal: document.getElementById('game-setup-modal'),
            closeSetupBtn: document.getElementById('close-game-setup-modal'),
            
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
            openHelpBtn: document.getElementById('open-help-button'),
            
            // Profile Specific Settings
            input: document.getElementById('input-select'),
            mode: document.getElementById('mode-toggle'),
            machines: document.getElementById('machines-slider'),
            machinesDisplay: document.getElementById('machines-display'),
            seqLength: document.getElementById('sequence-length-slider'),
            seqDisplay: document.getElementById('sequence-length-display'),
            chunk: document.getElementById('chunk-slider'),
            chunkDisplay: document.getElementById('chunk-display'),
            delay: document.getElementById('delay-slider'),
            delayDisplay: document.getElementById('delay-display'),
            
            // Global Settings
            autoClear: document.getElementById('autoclear-toggle'),
            autoplay: document.getElementById('autoplay-toggle'),
            speedDelete: document.getElementById('speed-delete-toggle'),
            audio: document.getElementById('audio-toggle'),
            haptics: document.getElementById('haptics-toggle'),
            showMic: document.getElementById('show-mic-toggle'),
            showCam: document.getElementById('show-cam-toggle'),
            
            playbackSpeed: document.getElementById('playback-speed-slider'),
            playbackDisplay: document.getElementById('playback-speed-display'),
            showWelcome: document.getElementById('show-welcome-toggle'),
            darkMode: document.getElementById('dark-mode-toggle'),
            uiScale: document.getElementById('ui-scale-slider'),
            uiScaleDisplay: document.getElementById('ui-scale-display'),
            gestureMode: document.getElementById('gesture-mode-toggle'),
            
            // Prompts
            promptDisplay: document.getElementById('prompt-display'),
            copyPromptBtn: document.getElementById('copy-prompt-btn'),
            
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
        // Globals
        if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled;
        if(this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
        if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
        this.toggleModal(this.dom.setupModal, true);
    }
    
    closeSetup() {
        if(this.dom.quickAutoplay) this.appSettings.isAutoplayEnabled = this.dom.quickAutoplay.checked;
        if(this.dom.quickAudio) this.appSettings.isAudioEnabled = this.dom.quickAudio.checked;
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
        const gs = this.appSettings; // Global Settings
        
        // Profile Specific
        this.dom.input.value = ps.currentInput;
        this.dom.mode.checked = (ps.currentMode === this.MODES.UNIQUE_ROUNDS);
        this.dom.machines.value = ps.machineCount;
        this.dom.seqLength.value = ps.sequenceLength;
        this.dom.chunk.value = ps.simonChunkSize;
        this.dom.delay.value = ps.simonInterSequenceDelay;
        
        // Globals
        this.dom.autoClear.checked = gs.isUniqueRoundsAutoClearEnabled;
        this.dom.autoplay.checked = gs.isAutoplayEnabled;
        this.dom.speedDelete.checked = gs.isSpeedDeletingEnabled;
        this.dom.audio.checked = gs.isAudioEnabled;
        this.dom.haptics.checked = gs.isHapticsEnabled;
        this.dom.showMic.checked = gs.showMicBtn;
        this.dom.showCam.checked = gs.showCamBtn;
        
        this.dom.playbackSpeed.value = gs.playbackSpeed * 100;
        this.dom.showWelcome.checked = gs.showWelcomeScreen;
        this.dom.darkMode.checked = gs.isDarkMode;
        this.dom.uiScale.value = gs.uiScaleMultiplier * 100; 
        
        if (this.dom.gestureMode) {
            this.dom.gestureMode.checked = (gs.gestureResizeMode === 'sequence');
        }
        
        this.updateDisplays();
        this.updateVisibility();
        this.generatePrompt(); // Update prompt on open
        
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
        if(this.dom.uiScaleDisplay) this.dom.uiScaleDisplay.textContent = parseInt(this.appSettings.uiScaleMultiplier * 100) + '%'; 
    }

    updateVisibility() {
        const ps = this.getCurrentProfileSettings();
        const isSimon = (ps.currentMode === this.MODES.SIMON);
        
        // Update Labels based on mode
        if (this.dom.seqLabel) this.dom.seqLabel.textContent = isSimon ? 'Sequence Length' : 'Unique Rounds';
        
        if (this.dom.machines) this.dom.machines.disabled = !isSimon;
        
        if (this.dom.autoClearGroup) this.dom.autoClearGroup.style.display = isSimon ? 'none' : 'flex';
        
        if (this.dom.multiSeqGroup) {
             this.dom.multiSeqGroup.style.display = isSimon ? 'block' : 'none';
        }
    }
    
    generatePrompt() {
        if(!this.dom.promptDisplay) return;
        
        const ps = this.getCurrentProfileSettings();
        
        // 1. Define Inputs
        let validInputs = "";
        if(ps.currentInput === 'piano') {
            validInputs = "Musical Notes: White Keys (C, D, E, F, G, A, B) and Black Keys (1, 2, 3, 4, 5).";
        } else if (ps.currentInput === 'key12') {
            validInputs = "Numbers 1 through 12.";
        } else {
            validInputs = "Numbers 1 through 9.";
        }

        // 2. Define Game Logic
        let logic = "";
        if (ps.currentMode === this.MODES.UNIQUE_ROUNDS) {
            logic = `GAME: UNIQUE ROUNDS.
            - Start at Round 1 (Length 1).
            - Each round, generate a COMPLETELY NEW random sequence of the current length.
            - Read the sequence to me.
            - Wait for me to repeat it back. Expect exactly {Round_Number} inputs from me.
            - If I am correct, say "Correct", increment Round number (Length + 1), and generate a new sequence.
            - Stop when Round ${ps.sequenceLength} is completed.`;
        } else {
            logic = `GAME: SIMON SAYS (Pattern Accumulation).
            - Start with a random sequence of length 1.
            - Read the sequence to me.
            - Wait for me to repeat the ENTIRE sequence from the start. Expect {Current_Length} inputs from me.
            - If I am correct, say "Correct", ADD one random item to the end of the EXISTING sequence, and read the whole thing again.
            - Continue until the sequence length reaches ${ps.sequenceLength}.`;
        }

        // 3. Reading Style (Chunks/Delay)
        let readingStyle = "";
        if (ps.machineCount > 1 || ps.simonChunkSize > 0) {
            const delaySec = (ps.simonInterSequenceDelay / 1000).toFixed(1);
            readingStyle = `READING STYLE:
            - Read items in groups (chunks) of ${ps.simonChunkSize}.
            - Pause for ${delaySec} seconds between chunks.
            - Speak clearly and fast.`;
        } else {
            readingStyle = `READING STYLE: Speak clearly.`;
        }

        // 4. Assembly
        const command = `Act as the Game Engine for "Follow Me".
        
        CONFIG:
        - Inputs: ${validInputs}
        - Max Goal: ${ps.sequenceLength} steps.
        
        ${logic}
        
        ${readingStyle}
        
        Start the game now by reading Round 1.`;
        
        this.dom.promptDisplay.value = command.replace(/^        /gm, ''); // Simple dedent
    }

    initListeners() {
        // Modal Logic
        if(this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if(this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => this.closeSettings();
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.toggleModal(this.dom.helpModal, false);
        if(this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => this.toggleModal(this.dom.helpModal, true);
        
        // Extras
        if(this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.toggleModal(this.dom.helpModal, true); };
        if(this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        
        if(this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
        if(this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.toggleModal(this.dom.shareModal, false);
        if(this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => {
             navigator.share({ title: 'Follow Me', url: window.location.href });
        };
        if(this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick = () => {
             navigator.clipboard.writeText(window.location.href);
             this.dom.copyLinkBtn.innerText = "Copied!";
        };
        
        if(this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => {
             if(this.dom.promptDisplay) {
                 navigator.clipboard.writeText(this.dom.promptDisplay.value);
                 this.dom.copyPromptBtn.innerText = "Copied!";
                 setTimeout(() => this.dom.copyPromptBtn.innerText = "Copy Prompt", 2000);
             }
        };
        
        // Profile Management
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
        
        // Quick Resize Buttons (Global)
        if(this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => {
            this.appSettings.globalUiScale = Math.min(150, this.appSettings.globalUiScale + 10);
            this.callbacks.onUpdate();
        };
        if(this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => {
            this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10);
            this.callbacks.onUpdate();
        };

        // --- INPUT HANDLING ---
        const handleInput = (el, prop, isGlobal = false, isBool = false, isFloat = false) => {
            if(!el) return;
            el.onchange = el.oninput = (e) => {
                let val = isBool ? el.checked : el.value;
                if(!isBool && !isFloat) val = parseInt(val);
                if(isFloat) val = parseFloat(val) / 100.0; // Keep floats for delays/scale

                if(isGlobal) {
                    this.appSettings[prop] = val;
                    if(prop === 'isDarkMode') {
                        document.body.classList.toggle('dark', val);
                        // Background Logic
                        if(!val) {
                            document.body.classList.remove('bg-gray-900', 'text-white');
                            document.body.classList.add('bg-white', 'text-gray-900');
                        } else {
                            document.body.classList.add('bg-gray-900', 'text-white');
                            document.body.classList.remove('bg-white', 'text-gray-900');
                        }
                    }
                    if(prop === 'globalUiScale') document.documentElement.style.fontSize = `${val}%`; 
                } else {
                    // Profile Setting Changed
                    const currentId = this.appSettings.activeProfileId;
                    const profile = this.appSettings.profiles[currentId];
                    
                    // If we are modifying a saved/premade profile, create a new "Custom" profile
                    if(profile.name !== 'Custom' && !profile.name.includes('(Custom)')) {
                        if (this.callbacks.onProfileAdd) {
                            // Create Custom Profile clone
                            const newId = 'custom_' + Date.now();
                            const newSettings = JSON.parse(JSON.stringify(profile.settings));
                            newSettings[prop] = val; // Apply change
                            if(prop === 'currentMode') newSettings.currentMode = val ? this.MODES.UNIQUE_ROUNDS : this.MODES.SIMON;
                            
                            this.callbacks.onProfileAdd("Custom", newSettings, newId); // Pass custom ID/settings
                            return; // Exit, onProfileAdd handles switch
                        }
                    } else {
                        // Already on custom profile, just update
                        profile.settings[prop] = val;
                        if(prop === 'currentMode') profile.settings.currentMode = val ? this.MODES.UNIQUE_ROUNDS : this.MODES.SIMON;
                    }
                }
                
                this.updateDisplays();
                this.updateVisibility();
                this.generatePrompt();
                this.callbacks.onUpdate(); 
            };
        };

        // Bind Profile Settings
        handleInput(this.dom.input, 'currentInput');
        handleInput(this.dom.mode, 'currentMode', false, true); 
        handleInput(this.dom.machines, 'machineCount');
        handleInput(this.dom.seqLength, 'sequenceLength');
        handleInput(this.dom.chunk, 'simonChunkSize');
        handleInput(this.dom.delay, 'simonInterSequenceDelay');
        
        // Bind Global Settings
        handleInput(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true, true);
        handleInput(this.dom.autoplay, 'isAutoplayEnabled', true, true);
        handleInput(this.dom.speedDelete, 'isSpeedDeletingEnabled', true, true);
        handleInput(this.dom.audio, 'isAudioEnabled', true, true);
        handleInput(this.dom.haptics, 'isHapticsEnabled', true, true);
        handleInput(this.dom.showMic, 'showMicBtn', true, true);
        handleInput(this.dom.showCam, 'showCamBtn', true, true);
        
        handleInput(this.dom.playbackSpeed, 'playbackSpeed', true, false, true);
        handleInput(this.dom.showWelcome, 'showWelcomeScreen', true, true);
        handleInput(this.dom.darkMode, 'isDarkMode', true, true);
        handleInput(this.dom.uiScale, 'uiScaleMultiplier', true, false, true); 
        
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
