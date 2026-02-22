import { initCore } from './settings-core.js';
import { initUI } from './settings-ui.js';
import { initFeatures } from './settings-features.js';
import { initEvents } from './settings-events.js';

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings;
        this.callbacks = callbacks;
        this.sensorEngine = sensorEngine;
        this.currentTargetKey = 'bubble';

        // 1. Setup the Backbone (DOM elements, Utility functions)
        initCore(this);
        
        // 2. Build the UI (Dropdowns, Mappings, Timings)
        initUI(this);
        this.initGeneralDropdowns();
        this.populateMappingUI();
        this.populateMorseUI();

        // 3. Setup Features (Themes, Tab Switching)
        initFeatures(this);
        
        // 4. Attach Event Listeners
        initEvents(this);
        this.initListeners();
    }
}
