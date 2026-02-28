// settings.js
import {
    injectModals
} from './ui-modals.js';
import {
    appSettings
} from './state.js';
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
    PREMADE_THEMES
} from './themes.js';
import {
    PREMADE_VOICE_PRESETS
} from './audio.js';
import {
    buildDomCache
} from './settings-dom.js';
import {
    initUI
} from './settings-ui.js';
import {
    initFeatures
} from './settings-features.js';
import {
    initEvents
} from './settings-events.js';

/**
 * SettingsManager Class
 * Handles the application configuration, UI updates, and profile management.
 */
export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        // 1. Establish Core State
        this.appSettings = appSettings; 
        this.callbacks = callbacks; 
        this.sensorEngine = sensorEngine; 
        this.currentTargetKey = 'bubble';
        this.tempTheme = null;

        // 2. Build the DOM Cache
        this.dom = buildDomCache();

        // 3. Attach Dynamic Methods to 'this'
        // These modules extend the class with UI, Feature, and Event logic
        initUI(this);
        initFeatures(this);

        // 4. Execute Initial UI Rendering & Data Population
        if (this.initGeneralDropdowns) this.initGeneralDropdowns();
        if (this.populateThemeDropdown) this.populateThemeDropdown();
        if (this.populateConfigDropdown) this.populateConfigDropdown();
        if (this.populateVoicePresetDropdown) this.populateVoicePresetDropdown();
        if (this.populateVoiceList) this.populateVoiceList();
        if (this.populateMappingUI) this.populateMappingUI();
        if (this.populateMorseUI) this.populateMorseUI();
        if (this.buildColorGrid) this.buildColorGrid();

        // 5. Sync Visual UI State
        if (this.updateHeaderVisibility) this.updateHeaderVisibility();
        if (this.updateUIFromSettings) this.updateUIFromSettings();

        // 6. Attach All Event Listeners
        initEvents(this);
    }

    /**
     * Opens the settings modal overlay
     */
    openSettings() {
        if (this.dom.settingsModal) {
            this.dom.settingsModal.classList.remove('hidden');
            this.updateUIFromSettings();
        }
    }

    /**
     * Closes the settings modal overlay
     */
    closeSettings() {
        if (this.dom.settingsModal) {
            this.dom.settingsModal.classList.add('hidden');
        }
    }

    /**
     * Updates header UI components based on current application settings
     */
    updateHeaderVisibility() {
        const header = document.querySelector('header');
        if (header) {
            header.style.display = this.appSettings.showWelcomeScreen ? 'flex' : 'none';
        }
    }
                }
            
