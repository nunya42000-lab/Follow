// settings.js - Handles Settings, Help, and Setup Modals

export class SettingsManager {
    constructor(appSettings, callbacks) {
        this.appSettings = appSettings;
        this.callbacks = callbacks || {}; // { onUpdate, onSave, onReset, onRequestPermissions, onProfileSwitch }
        
        this.INPUTS = { KEY9: 'key9', KEY12: 'key12', PIANO: 'piano' };
        this.MODES = { SIMON: 'simon', UNIQUE_ROUNDS: 'unique_rounds' };

        // DOM Elements
        this.dom = {
            // Setup Modal
            setupModal: document.getElementById('game-setup-modal'),
            closeSetupBtn: document.getElementById('close-game-setup-modal'),
            configSelect: document.getElementById('config-select'),
            configAdd: document.getElementById('config-add'),
            configRename: document.getElementById('config-rename'),
            configDelete: document.getElementById('config-delete'),
            dontShowWelcome: document.getElementById('dont-show-welcome-toggle'),
            quickAutoplay: document.getElementById('quick-autoplay-toggle'),
            quickAudio: document.getElementById('quick-audio-toggle'),
            quickHelp: document.getElementById('quick-open-help'),
            quickSettings: document.getElementById('quick-open-settings'),
            
            // Settings Modal
            settingsModal: document.getElementById('settings-modal'),
            closeSettingsBtn: document.getElementById('close-settings'),
            tabNav: document.getElementById('settings-tab-nav'),
            tabs: document.querySelectorAll('.settings-tab-content'),
            activeProfileName: document.getElementById('active-profile-name'),
            openGameSetupInside: document.getElementById('open-game-setup-from-settings'),
            
            // Help Modal
            helpModal: document.getElementById('help-modal'),
            closeHelpBtn: document.getElementById('close-help'),
            helpTabNav: document.getElementById('help-tab-nav'),
            helpTabs: document.querySelectorAll('.help-tab-content'),
            helpContent: document.getElementById('help-content-container'),
            
            // Form Inputs (Settings)
            input: document.getElementById('input-select'),
            mode: document.getElementById('mode-toggle'),
            modeLabel: document.getElementById('mode-toggle-label'),
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
            
            // Global/Stealth
            playbackSpeed: document.getElementById('playback-speed-slider'),
            playbackDisplay: document.getElementById('playback-speed-display'),
            showWelcome: document.getElementById('show-welcome-toggle'),
            darkMode: document.getElementById('dark-mode-toggle'),
            uiScale: document.getElementById('ui-scale-slider'),
            uiScaleDisplay: document.getElementById('ui-scale-display'),
            autoplay: document.getElementById('autoplay-toggle'),
            speedDelete: document.getElementById('speed-delete-toggle'),
            audio: document.getElementById('audio-toggle'),
            voice: document.getElementById('voice-input-toggle'),
            haptics: document.getElementById('haptics-toggle'),
            autoInput: document.getElementById('auto-input-slider'),
            
            // Shortcuts
            shakeSens: document.getElementById('shake-sensitivity-slider'),
            shakeSensDisplay: document.getElementById('shake-sensitivity-display'),
            shortcutList: document.getElementById('shortcut-list-container'),
            addShortcutBtn: document.getElementById('add-shortcut-btn'),
            
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
        
        // Trigger permissions request on close
        if(this.callbacks.onRequestPermissions) this.callbacks.onRequestPermissions();
    }

    populateConfigDropdown() {
        if (!this.dom.configSelect) return;
        this.dom.configSelect.innerHTML = '';
        Object.keys(this.appSettings.profiles).forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = this.appSettings.profiles[id].name;
            this.dom.configSelect.appendChild(option);
        });
        this.dom.configSelect.value = this.appSettings.activeProfileId;
    }

    // --- SETTINGS MODAL ---
    openSettings() {
        const ps = this.getCurrentProfileSettings();
        if(this.dom.activeProfileName) this.dom.activeProfileName.textContent = this.appSettings.profiles[this.appSettings.activeProfileId].name;
        
        // Populate fields
        this.dom.input.value = ps.currentInput;
        this.dom.mode.checked = (ps.currentMode === this.MODES.UNIQUE_ROUNDS);
        this.dom.machines.value = ps.machineCount;
        this.dom.seqLength.value = ps.sequenceLength;
        this.dom.chunk.value = ps.simonChunkSize;
        this.dom.delay.value = ps.simonInterSequenceDelay;
        this.dom.autoClear.checked = ps.isUniqueRoundsAutoClearEnabled;
        
        // Global
        this.dom.playbackSpeed.value = this.appSettings.playbackSpeed * 100;
        this.dom.showWelcome.checked = this.appSettings.showWelcomeScreen;
        this.dom.darkMode.checked = this.appSettings.isDarkMode;
        this.dom.uiScale.value = ps.uiScaleMultiplier * 100;
        
        // Stealth
        this.dom.autoplay.checked = ps.isAutoplayEnabled;
        this.dom.speedDelete.checked = ps.isSpeedDeletingEnabled;
        this.dom.audio.checked = ps.isAudioEnabled;
        this.dom.voice.checked = ps.isVoiceInputEnabled;
        this.dom.haptics.checked = ps.isHapticsEnabled;
        this.dom.autoInput.value = ps.autoInputMode;
        
        this.updateDisplays();
        this.updateVisibility();
        this.renderShortcuts();
        
        this.switchTab('settings', 'profile');
        this.toggleModal(this.dom.settingsModal, true);
    }
    
    closeSettings() {
        this.callbacks.onSave();
        this.callbacks.onUpdate();
        this.toggleModal(this.dom.settingsModal, false);
    }

    // --- HELP MODAL ---
    openHelp() {
        // We let the main app handle content generation or do it here? 
        // For simplicity, we assume static structure or generated by main app. 
        // But let's trigger the tab switch.
        this.switchTab('help', 'general');
        this.toggleModal(this.dom.helpModal, true);
    }
    
    closeHelp() {
        this.toggleModal(this.dom.helpModal, false);
    }

    // --- UTILS ---
    switchTab(modalType, tabId) {
        const nav = modalType === 'settings' ? this.dom.tabNav : this.dom.helpTabNav;
        const contents = modalType === 'settings' ? this.dom.tabs : this.dom.helpTabs;
        const prefix = modalType === 'settings' ? 'settings-tab-' : 'help-tab-';
        
        if(contents) contents.forEach(t => t.classList.add('hidden'));
        if(nav) nav.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active-tab'));
        
        const target = document.getElementById(prefix + tabId);
        if(target) target.classList.remove('hidden');
        
        const btn = nav.querySelector(`button[data-tab="${tabId}"]`);
        if(btn) btn.classList.add('active-tab');
    }

    updateDisplays() {
        const ps = this.getCurrentProfileSettings();
        if(this.dom.machinesDisplay) this.dom.machinesDisplay.textContent = ps.machineCount + (ps.machineCount > 1 ? ' Machines' : ' Machine');
        if(this.dom.seqDisplay) this.dom.seqDisplay.textContent = ps.sequenceLength;
        if(this.dom.chunkDisplay) this.dom.chunkDisplay.textContent = ps.simonChunkSize;
        if(this.dom.delayDisplay) this.dom.delayDisplay.textContent = (ps.simonInterSequenceDelay / 1000).toFixed(1) + 's';
        if(this.dom.playbackDisplay) this.dom.playbackDisplay.textContent = parseInt(this.appSettings.playbackSpeed * 100) + '%';
        if(this.dom.uiScaleDisplay) this.dom.uiScaleDisplay.textContent = parseInt(ps.uiScaleMultiplier * 100) + '%';
        if(this.dom.shakeSensDisplay) this.dom.shakeSensDisplay.textContent = ps.shakeSensitivity;
    }

    updateVisibility() {
        const ps = this.getCurrentProfileSettings();
        const isSimon = (ps.currentMode === this.MODES.SIMON);
        
        if (this.dom.seqLabel) this.dom.seqLabel.textContent = isSimon ? '4. Sequence Length' : '4. Unique Rounds';
        if (this.dom.modeLabel) this.dom.modeLabel.textContent = isSimon ? 'Off: Simon Says' : 'On: Unique Rounds';
        
        if (this.dom.machines) this.dom.machines.disabled = !isSimon;
        if (!isSimon && this.dom.machines) this.dom.machines.value = 1;

        if (this.dom.autoClearGroup) this.dom.autoClearGroup.style.display = isSimon ? 'none' : 'flex';
        if (this.dom.multiSeqGroup) this.dom.multiSeqGroup.style.display = (isSimon && ps.machineCount > 1) ? 'block' : 'none';
    }

    renderShortcuts() {
        const list = this.dom.shortcutList;
        if(!list) return;
        list.innerHTML = '';
        const ps = this.getCurrentProfileSettings();
        
        // Helper to create options
        const createOptions = (obj, selected) => {
            let html = '';
            for(const [k, v] of Object.entries(obj)) {
                html += `<option value="${k}" ${k === selected ? 'selected' : ''}>${v}</option>`;
            }
            return html;
        };

        const TRIGGERS = {
            'none': 'Select Trigger...', 'shake': 'Shake Device', 
            'longpress_backspace': 'Long Press Backspace', 'longpress_play': 'Long Press Play',
            'tilt_left': 'Tilt Left', 'tilt_right': 'Tilt Right',
            'swipe_up': 'Swipe Up', 'swipe_down': 'Swipe Down'
        };
        const ACTIONS = {
            'none': 'Select Action...', 'play_demo': 'Play Demo', 'reset_rounds': 'Reset Rounds',
            'clear_all': 'Clear All', 'clear_last': 'Backspace', 'toggle_autoplay': 'Toggle Autoplay',
            'toggle_audio': 'Toggle Audio', 'toggle_dark_mode': 'Toggle Dark Mode',
            'open_settings': 'Open Settings', 'next_profile': 'Next Profile'
        };

        ps.shortcuts.forEach((sc, idx) => {
            const row = document.createElement('div');
            row.className = 'shortcut-row';
            row.innerHTML = `
                <select class="select-input sc-trigger" data-idx="${idx}">${createOptions(TRIGGERS, sc.trigger)}</select>
                <select class="select-input sc-action" data-idx="${idx}">${createOptions(ACTIONS, sc.action)}</select>
                <button class="shortcut-delete-btn" data-idx="${idx}">&times;</button>
            `;
            list.appendChild(row);
        });
    }

    initListeners() {
        // Close Buttons
        if(this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
        if(this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => this.closeSettings();
        if(this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.closeHelp();

        // Setup Modal Extras
        if(this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.openHelp(); };
        if(this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
        if(this.dom.openGameSetupInside) this.dom.openGameSetupInside.onclick = () => { this.closeSettings(); this.openSetup(); };
        
        // Profile Management
        if(this.dom.configSelect) this.dom.configSelect.onchange = (e) => {
            if(this.callbacks.onProfileSwitch) this.callbacks.onProfileSwitch(e.target.value);
            this.populateConfigDropdown(); // Refresh UI incase properties changed
        };
        if(this.dom.configAdd) this.dom.configAdd.onclick = () => {
             const name = prompt("New Profile Name:", "New Setup");
             if(name && this.callbacks.onProfileAdd) this.callbacks.onProfileAdd(name);
             this.populateConfigDropdown();
        };
        if(this.dom.configRename) this.dom.configRename.onclick = () => {
             const name = prompt("Rename Profile:", this.appSettings.profiles[this.appSettings.activeProfileId].name);
             if(name && this.callbacks.onProfileRename) this.callbacks.onProfileRename(name);
             this.populateConfigDropdown();
        };
        if(this.dom.configDelete) this.dom.configDelete.onclick = () => {
             if(this.callbacks.onProfileDelete) this.callbacks.onProfileDelete();
             this.populateConfigDropdown();
        };

        // Tabs
        if(this.dom.tabNav) this.dom.tabNav.onclick = (e) => {
            if(e.target.dataset.tab) this.switchTab('settings', e.target.dataset.tab);
        };
        if(this.dom.helpTabNav) this.dom.helpTabNav.onclick = (e) => {
            if(e.target.dataset.tab) this.switchTab('help', e.target.dataset.tab);
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
                    // Special globals handling
                    if(prop === 'isDarkMode') document.body.classList.toggle('dark', val);
                    if(prop === 'globalUiScale') document.documentElement.style.fontSize = `${val}%`; // Actually stored as int in main app usually
                    if(prop === 'playbackSpeed') { /* Main app reads this directly */ }
                } else {
                    const ps = this.getCurrentProfileSettings();
                    ps[prop] = val;
                    if(prop === 'currentMode') ps.currentMode = val ? this.MODES.UNIQUE_ROUNDS : this.MODES.SIMON;
                }
                
                this.updateDisplays();
                this.updateVisibility();
                this.callbacks.onUpdate(); // Live update UI
            };
        };

        // Bind Settings
        handleInput(this.dom.input, 'currentInput');
        handleInput(this.dom.mode, 'currentMode', false, true); // Checked = Unique Rounds
        handleInput(this.dom.machines, 'machineCount');
        handleInput(this.dom.seqLength, 'sequenceLength');
        handleInput(this.dom.chunk, 'simonChunkSize');
        handleInput(this.dom.delay, 'simonInterSequenceDelay');
        handleInput(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', false, true);
        
        handleInput(this.dom.uiScale, 'uiScaleMultiplier', false, false, true);
        handleInput(this.dom.playbackSpeed, 'playbackSpeed', true, false, true);
        handleInput(this.dom.showWelcome, 'showWelcomeScreen', true, true);
        handleInput(this.dom.darkMode, 'isDarkMode', true, true);
        
        handleInput(this.dom.autoplay, 'isAutoplayEnabled', false, true);
        handleInput(this.dom.speedDelete, 'isSpeedDeletingEnabled', false, true);
        handleInput(this.dom.audio, 'isAudioEnabled', false, true);
        handleInput(this.dom.voice, 'isVoiceInputEnabled', false, true);
        handleInput(this.dom.haptics, 'isHapticsEnabled', false, true);
        handleInput(this.dom.autoInput, 'autoInputMode', false, false); // stored as string "0","1","2" usually? Handle in app.js or cast
        handleInput(this.dom.shakeSens, 'shakeSensitivity');

        // Shortcuts Logic
        if(this.dom.addShortcutBtn) this.dom.addShortcutBtn.onclick = () => {
            this.getCurrentProfileSettings().shortcuts.push({ id: Date.now(), trigger: 'none', action: 'none' });
            this.renderShortcuts();
        };
        
        if(this.dom.shortcutList) {
            this.dom.shortcutList.onclick = (e) => {
                if(e.target.classList.contains('shortcut-delete-btn')) {
                    const idx = e.target.dataset.idx;
                    this.getCurrentProfileSettings().shortcuts.splice(idx, 1);
                    this.renderShortcuts();
                }
            };
            this.dom.shortcutList.onchange = (e) => {
                const idx = e.target.dataset.idx;
                const ps = this.getCurrentProfileSettings();
                if(e.target.classList.contains('sc-trigger')) ps.shortcuts[idx].trigger = e.target.value;
                if(e.target.classList.contains('sc-action')) ps.shortcuts[idx].action = e.target.value;
            };
        }
        
        if(this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => {
            if(confirm("Factory Reset: Are you sure?")) this.callbacks.onReset();
        }
    }
}