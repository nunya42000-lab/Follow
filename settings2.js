// settings.js - Section 1/12
// -----------------------------------------------------------------------------
// File header, exported theme & voice presets, language strings, defaults,
// gesture & morse mapping defaults, and SettingsManager skeleton + init.
// -----------------------------------------------------------------------------

/*
  Notes:
  - This file is delivered in multiple sequential sections. Apply each section
    in order into the same `settings.js` file. Do NOT mix or reorder sections.
  - After all sections are applied you'll have a complete single file.
*/

export const PREMADE_THEMES = {
  default: { name: "Default Dark", bgMain: "#000000", bgCard: "#121212", bubble: "#4f46e5", btn: "#1a1a1a", text: "#e5e5e5" },
  light: { name: "Light Mode", bgMain: "#f3f4f6", bgCard: "#ffffff", bubble: "#4f46e5", btn: "#e5e7eb", text: "#111827" },
  royal: { name: "Royal 👑", bgMain: "#120024", bgCard: "#2e0059", bubble: "#9333ea", btn: "#4c1d95", text: "#ffd700" },
  solar: { name: "Solar", bgMain: "#071013", bgCard: "#0b2a2f", bubble: "#f59e0b", btn: "#0f172a", text: "#fdf6e3" }
  // IMPORTANT: If you have more custom themes in your old settings.js,
  // we'll merge them later when applying subsequent sections.
};

export const PREMADE_VOICE_PRESETS = {
  standard: { name: "Standard", pitch: 1.0, rate: 1.0, volume: 1.0 },
  speed: { name: "Speed Reader", pitch: 1.0, rate: 1.8, volume: 1.0 },
  slow: { name: "Slow Motion", pitch: 0.9, rate: 0.6, volume: 1.0 },
  deep: { name: "Deep Voice", pitch: 0.6, rate: 0.9, volume: 1.0 }
};

// Simple translations used across UI strings. app.js will select language.
export const LANG = {
  en: {
    autoplay: "Autoplay",
    audio: "Audio",
    help_btn: "Help 📚",
    settings_btn: "Settings",
    lbl_profiles: "Profiles",
    lbl_game: "Game",
    lbl_playback: "Playback",
    lbl_general: "General",
    lbl_input: "Input",
    blackout_gestures: "Blackout Gestures",
    gestures_toggle: "Gestures (3-finger triple tap)",
    timer_toggle: "Timer (top-left)",
    counter_toggle: "Counter (top-right)",
    inputs_only: "Inputs only",
    pause_label: "Pause (s)",
    stealth_tab: "Stealth",
    playback_tab: "Playback",
    general_tab: "General",
    help_stealth_detail: "Inputs-only simplifies to single-key input for speed.",
    help_blackout_detail: "Blackout hides the UI to allow no-look input.",
    help_gesture_detail: "Customize gestures and Morse feedback. Changes update the guide."
  },
  es: {
    autoplay: "Auto-reproducción",
    audio: "Audio",
    help_btn: "Ayuda 📚",
    settings_btn: "Ajustes",
    lbl_profiles: "Perfiles",
    lbl_game: "Juego",
    lbl_playback: "Reproducción",
    lbl_general: "General",
    lbl_input: "Entrada",
    blackout_gestures: "Gestos de Pantalla Negra",
    gestures_toggle: "Gestos (toque triple 3 dedos)",
    timer_toggle: "Temporizador (esq. sup izq)",
    counter_toggle: "Contador (esq. sup der)",
    inputs_only: "Solo entradas",
    pause_label: "Pausa (s)",
    stealth_tab: "Sigilo",
    playback_tab: "Reproducción",
    general_tab: "General",
    help_stealth_detail: "Solo entradas simplifica a una sola tecla para velocidad.",
    help_blackout_detail: "Blackout oculta la UI para entrada sin mirar.",
    help_gesture_detail: "Personaliza gestos y retroalimentación Morse. Los cambios actualizan la guía."
  }
};

// Default gesture and morse mapping as requested.
// The keys correspond to input modes: 'key9', 'key12', 'piano'
// Each mapping entry: { gesture: 'token', morse: '.-.' }
export const DEFAULT_MAPPINGS = {
  key9: {
    '1': { gesture: 'tap_1', morse: '.' },
    '2': { gesture: 'doubletap_1', morse: '..' },
    '3': { gesture: 'longtap_1', morse: '...' },
    '4': { gesture: 'tap_2', morse: '-' },
    '5': { gesture: 'doubletap_2', morse: '-.' },
    '6': { gesture: 'longtap_2', morse: '-..' },
    '7': { gesture: 'tap_3', morse: '--' },
    '8': { gesture: 'doubletap_3', morse: '--.' },
    '9': { gesture: 'longtap_3', morse: '---' }
  },
  key12: {
    '1': { gesture: 'swipe_left_1', morse: '.' },
    '2': { gesture: 'swipe_down_1', morse: '..' },
    '3': { gesture: 'swipe_up_1', morse: '...' },
    '4': { gesture: 'swipe_right_1', morse: '...-' },
    '5': { gesture: 'swipe_left_2', morse: '-' },
    '6': { gesture: 'swipe_down_2', morse: '-.' },
    '7': { gesture: 'swipe_up_2', morse: '-..' },
    '8': { gesture: 'swipe_right_2', morse: '-.-' },
    '9': { gesture: 'swipe_left_3', morse: '--' },
    '10': { gesture: 'swipe_down_3', morse: '--.' },
    '11': { gesture: 'swipe_up_3', morse: '--..' },
    '12': { gesture: 'swipe_right_3', morse: '---' }
  },
  piano: {
    '1': { gesture: 'swipe_left_2', morse: '-' },
    '2': { gesture: 'swipe_up_left_2', morse: '-.' },
    '3': { gesture: 'swipe_up_2', morse: '--' },
    '4': { gesture: 'swipe_up_right_2', morse: '-..' },
    '5': { gesture: 'swipe_right_2', morse: '-.-' },
    'C': { gesture: 'swipe_up_left_1', morse: '.' },
    'D': { gesture: 'swipe_left_1', morse: '..' },
    'E': { gesture: 'swipe_down_left_1', morse: '.-' },
    'F': { gesture: 'swipe_down_1', morse: '...' },
    'G': { gesture: 'swipe_down_right_1', morse: '..-' },
    'A': { gesture: 'swipe_right_1', morse: '.-.' },
    'B': { gesture: 'swipe_up_right_1', morse: '.--' }
  }
};

// Core default app settings (preserve everything you had historically).
export const DEFAULT_APP = {
  globalUiScale: 100,
  uiScaleMultiplier: 1.0,
  showWelcomeScreen: true,
  gestureResizeMode: 'global',
  playbackSpeed: 1.0,
  isAutoplayEnabled: true,
  isUniqueRoundsAutoClearEnabled: true,
  isAudioEnabled: true,
  isHapticsEnabled: true,
  isSpeedDeletingEnabled: true,
  isLongPressAutoplayEnabled: true,
  isStealth1KeyEnabled: false,
  activeTheme: 'default',
  customThemes: {},
  sensorAudioThresh: -85,
  sensorCamThresh: 30,
  isBlackoutFeatureEnabled: false,
  isBlackoutGesturesEnabled: false,
  isHapticMorseEnabled: false,
  showMicBtn: false,
  showCamBtn: false,
  autoInputMode: 'none',
  activeProfileId: 'profile_1',
  profiles: {}, // will be populated / merged with existing profiles later
  runtimeSettings: {},
  isPracticeModeEnabled: false,
  voicePitch: 1.0,
  voiceRate: 1.0,
  voiceVolume: 1.0,
  selectedVoice: null,
  voicePresets: {},
  activeVoicePresetId: 'standard',
  generalLanguage: 'en',
  // NEW toggles requested:
  isGesturesEnabled: false,   // controls 3-finger triple-tap gesture pad swap
  showTimerButton: false,     // show timer top-left
  showCounterButton: false,   // show counter top-right
  gesturePause: 0.2,          // pause between symbols for haptic morse (default 0.2s)
  gestureMappings: JSON.parse(JSON.stringify(DEFAULT_MAPPINGS)),
  morseMappings: JSON.parse(JSON.stringify(DEFAULT_MAPPINGS))
};

// Export a convenient constructor-style SettingsManager that the app imports.
// We'll split the class over the next sections. For now create skeleton and export.
export class SettingsManager {
  constructor(appSettings = {}, callbacks = {}, sensorEngine = null) {
    // Merge provided appSettings over DEFAULT_APP but do NOT remove properties
    this.appSettings = { ...JSON.parse(JSON.stringify(DEFAULT_APP)), ...(appSettings || {}) };

    // Ensure nested objects exist and are merged safely
    if (!this.appSettings.profiles || Object.keys(this.appSettings.profiles).length === 0) {
      // populate a sane default profile set (will be merged later if real profiles exist)
      this.appSettings.profiles = {
        profile_1: {
          name: "Follow Me",
          settings: { currentInput: 'key9', currentMode: 'simon', sequenceLength: 20, machineCount: 1, simonChunkSize: 3, simonInterSequenceDelay: 400 },
          theme: 'default'
        }
      };
    }

    if (!this.appSettings.runtimeSettings || Object.keys(this.appSettings.runtimeSettings).length === 0) {
      this.appSettings.runtimeSettings = JSON.parse(JSON.stringify(this.appSettings.profiles[this.appSettings.activeProfileId]?.settings || this.appSettings.profiles['profile_1'].settings));
    }

    // Callbacks hook: onSave, onApply, onMappingChange, testVoice, onCloseSettings
    this.callbacks = callbacks || {};
    this.sensorEngine = sensorEngine || null;

    // Internal runtime state & timers
    this._domCache = {};
    this._timers = {};
    this._mappingWidgetsBuilt = false;

    // initialize
    this._initSanity();
  }

  _initSanity() {
    // Ensure mapping containers exist in settings object
    if (!this.appSettings.gestureMappings) this.appSettings.gestureMappings = JSON.parse(JSON.stringify(DEFAULT_MAPPINGS));
    if (!this.appSettings.morseMappings) this.appSettings.morseMappings = JSON.parse(JSON.stringify(DEFAULT_MAPPINGS));
    if (typeof this.appSettings.gesturePause === 'undefined') this.appSettings.gesturePause = 0.2;
  }

  // Methods will be provided in subsequent sections:
  // - buildDomCache()
  // - injectUIElements()
  // - buildMappingControlsIfNeeded()
  // - updateHelpGuides()
  // - wireListeners()
  // - populateDropdowns()
  // - save & persist logic
  // - public API hooks to apply settings to the app (callbacks.onApply)
  //
  // Continue to Section 2 to get DOM injection & safe element creation utilities.
}
// settings.js - Section 2/12
// -----------------------------------------------------------------------------
// DOM helpers, safe injectors, stealth tab creation, timer/counter placeholders,
// gesture pad container, mic/cam reposition. Idempotent - safe to call repeatedly.
// -----------------------------------------------------------------------------

// Helper: safely create element from HTML string
function createElementFromHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstChild;
}

// Helper: insert after reference node
function insertAfter(newNode, referenceNode) {
  if (!referenceNode || !referenceNode.parentNode) return;
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Append new child only if not present by id
function appendIfMissing(parent, el, id) {
  if (!parent) return parent?.appendChild(el);
  if (id && document.getElementById(id)) return;
  parent.appendChild(el);
}

// Add a small utility to add a row with two toggles (used on General tab)
function buildTwoToggleRow(labelA, idA, labelB, idB) {
  const wrapper = document.createElement('div');
  wrapper.className = 'grid grid-cols-2 gap-2';
  const left = document.createElement('div');
  left.className = 'flex justify-between items-center p-3 rounded-lg settings-input';
  left.innerHTML = `<span class="font-bold text-sm">${labelA}</span><input type="checkbox" id="${idA}" class="h-5 w-5 accent-indigo-500">`;
  const right = document.createElement('div');
  right.className = 'flex justify-between items-center p-3 rounded-lg settings-input';
  right.innerHTML = `<span class="font-bold text-sm">${labelB}</span><input type="checkbox" id="${idB}" class="h-5 w-5 accent-indigo-500">`;
  wrapper.appendChild(left);
  wrapper.appendChild(right);
  return wrapper;
}

Object.assign(SettingsManager.prototype, {
  // Build dom cache for frequently used nodes (safe nulls)
  buildDomCache() {
    this._domCache = {
      settingsModal: document.getElementById('settings-modal'),
      settingsTabBar: document.querySelector('#settings-modal .flex.border-b'),
      settingsContentsWrapper: document.querySelector('#settings-modal .overflow-y-auto') || document.querySelector('#settings-modal .flex-grow'),
      tabGeneral: document.getElementById('tab-general'),
      tabPlayback: document.getElementById('tab-playback'),
      tabMode: document.getElementById('tab-mode'),
      donateModal: document.getElementById('donate-modal'),
      donateCashBtn: document.getElementById('btn-cashapp-main'),
      donatePaypalBtn: document.getElementById('btn-paypal-main'),
      headerArea: document.querySelector('#settings-modal > .p-4') || document.querySelector('#settings-modal .flex') || document.querySelector('.settings-modal-bg'),
      headerRightIcons: document.querySelector('#settings-modal .flex.space-x-3')
    };
  },

  // Entry point to inject missing UI elements required by new features
  injectUIElements() {
    // Build cache first
    this.buildDomCache();

    // 1) Ensure Stealth tab button exists in tab bar
    const tabBar = this._domCache.settingsTabBar || document.querySelector('#settings-modal .flex.border-b');
    if (tabBar && !document.querySelector('.tab-btn[data-tab="stealth"]')) {
      const btn = document.createElement('div');
      btn.className = 'tab-btn';
      btn.dataset.tab = 'stealth';
      btn.innerText = LANG[this.appSettings.generalLanguage || 'en']?.stealth_tab || 'Stealth';
      tabBar.appendChild(btn);
    }

    // 2) Create Stealth tab content area if missing
    if (!document.getElementById('tab-stealth')) {
      const stealthPanel = document.createElement('div');
      stealthPanel.className = 'tab-content';
      stealthPanel.id = 'tab-stealth';
      stealthPanel.innerHTML = `
        <div class="space-y-4 p-3">
          <div class="grid grid-cols-2 gap-2 items-start">
            <div class="p-3 rounded-lg settings-input flex items-center justify-between">
              <span class="font-bold text-sm">Haptic Morse</span>
              <input type="checkbox" id="haptic-morse-toggle" class="h-5 w-5 accent-indigo-500"/>
            </div>
            <div class="p-3 rounded-lg settings-input">
              <label class="block text-xs font-bold mb-1 text-muted-custom">Pause (s)</label>
              <select id="gesture-pause-select" class="settings-input w-full p-2 rounded text-sm">
                <option value="0.0">0.0</option>
                <option value="0.1">0.1</option>
                <option value="0.2" selected>0.2</option>
                <option value="0.3">0.3</option>
                <option value="0.4">0.4</option>
                <option value="0.5">0.5</option>
              </select>
            </div>

            <div class="p-3 rounded-lg settings-input flex items-center justify-between">
              <span class="font-bold text-sm">Blackout Mode</span>
              <input type="checkbox" id="blackout-toggle" class="h-5 w-5 accent-indigo-500"/>
            </div>

            <div class="p-3 rounded-lg settings-input flex items-center justify-between">
              <span class="font-bold text-sm">Blackout Gestures</span>
              <input type="checkbox" id="blackout-gestures-toggle" class="h-5 w-5 accent-indigo-500"/>
            </div>

            <div class="col-span-2 p-3 rounded-lg settings-input">
              <h4 class="font-bold mb-2">Morse Mapping</h4>
              <div id="morse-mapping-container" class="space-y-2 text-xs"></div>
            </div>

            <div class="col-span-2 p-3 rounded-lg settings-input">
              <h4 class="font-bold mb-2">Gesture Mapping</h4>
              <div id="gesture-mapping-container" class="space-y-2 text-xs"></div>
            </div>
          </div>
        </div>
      `;
      // append into settings contents wrapper if available, else into the settings modal
      const container = this._domCache.settingsContentsWrapper || document.getElementById('settings-modal');
      container && container.appendChild(stealthPanel);
    }

    // 3) Update General tab: ensure gestures/timer/counter toggles present and arrange two toggles per row
    const gen = this._domCache.tabGeneral || document.getElementById('tab-general');
    if (gen) {
      // remove single toggle nodes if duplicates to avoid double insertion (we try not to remove user content)
      if (!document.getElementById('gestures-toggle') || !document.getElementById('timer-toggle') || !document.getElementById('counter-toggle')) {
        // Find container where toggles are held; keep existing .space-y-3 if present
        const container = gen.querySelector('.space-y-3') || gen;
        // Build two rows (gestures + timer) and (counter + stealth) to make two toggles per row
        // But only insert missing ones (idempotent)
        const row1 = buildTwoToggleRow(LANG.en.gestures_toggle, 'gestures-toggle', LANG.en.timer_toggle, 'timer-toggle');
        const row2 = buildTwoToggleRow(LANG.en.counter_toggle, 'counter-toggle', LANG.en.inputs_only, 'stealth-1key-toggle');

        // Place them near the top: attempt to insert after the initial few toggles
        const firstToggle = container.querySelector('.settings-input');
        if (firstToggle) {
          insertAfter(row2, firstToggle);
          insertAfter(row1, row2);
        } else {
          container.appendChild(row1);
          container.appendChild(row2);
        }
      }

      // Ensure existing Haptic / Speed delete etc remain - we don't remove anything.
    }

    // 4) Ensure playback tab has autoplay + audio side-by-side (wrap into grid if not)
    const pb = this._domCache.tabPlayback || document.getElementById('tab-playback');
    if (pb) {
      const autoplayNode = document.getElementById('autoplay-toggle')?.parentElement;
      const audioNode = document.getElementById('audio-toggle')?.parentElement;
      if (autoplayNode && audioNode && autoplayNode.parentElement === audioNode.parentElement) {
        // create grid wrapper if not already
        if (!autoplayNode.parentElement.classList.contains('grid-cols-2')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'grid grid-cols-2 gap-2 mb-3';
          autoplayNode.parentElement.insertBefore(wrapper, autoplayNode);
          wrapper.appendChild(autoplayNode);
          wrapper.appendChild(audioNode);
        }
      }
    }

    // 5) Gesture pad container (for swapping input UI) - create a dedicated container at top of sequence area
    if (!document.getElementById('gesture-pad-container')) {
      const seqContainer = document.getElementById('sequence-container');
      const padContainer = document.createElement('div');
      padContainer.id = 'gesture-pad-container';
      padContainer.className = 'w-full p-2 mb-2 hidden'; // hidden by default
      padContainer.innerHTML = `<div id="gesture-pad" class="bg-black bg-opacity-20 p-4 rounded text-center">Gesture Pad (3-finger triple tap toggles)</div>`;
      if (seqContainer && seqContainer.parentElement) {
        seqContainer.parentElement.insertBefore(padContainer, seqContainer);
      } else {
        // fallback - append to body
        document.body.appendChild(padContainer);
      }
    }

    // 6) Timer & Counter placeholders into header of main UI (not settings) - create if missing
    if (!document.getElementById('top-left-timer')) {
      const topLeft = document.createElement('button');
      topLeft.id = 'top-left-timer';
      topLeft.className = 'top-left-timer fixed top-3 left-3 z-40 bg-primary-app text-black font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg';
      topLeft.style.display = this.appSettings.showTimerButton ? 'flex' : 'none';
      topLeft.title = 'Timer - Tap start/stop, long-press reset';
      topLeft.innerText = '00:00';
      document.body.appendChild(topLeft);
    }
    if (!document.getElementById('top-right-counter')) {
      const topRight = document.createElement('button');
      topRight.id = 'top-right-counter';
      topRight.className = 'top-right-counter fixed top-3 right-3 z-40 bg-primary-app text-black font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg';
      topRight.style.display = this.appSettings.showCounterButton ? 'flex' : 'none';
      topRight.title = 'Counter - Tap increment, long-press reset';
      topRight.innerText = '0';
      document.body.appendChild(topRight);
    }

    // 7) Relocate camera & mic buttons to header middle-left/middle-right when enabled in settings.
    // We just ensure containers exist where app.js can move the buttons later.
    if (!document.getElementById('header-middle-left')) {
      const headerMiddleLeft = document.createElement('div');
      headerMiddleLeft.id = 'header-middle-left';
      headerMiddleLeft.className = 'header-middle-left absolute left-12 top-3 z-40';
      const header = document.body;
      header.appendChild(headerMiddleLeft);
    }
    if (!document.getElementById('header-middle-right')) {
      const headerMiddleRight = document.createElement('div');
      headerMiddleRight.id = 'header-middle-right';
      headerMiddleRight.className = 'header-middle-right absolute right-12 top-3 z-40';
      document.body.appendChild(headerMiddleRight);
    }

    // 8) Add custom CashApp / PayPal chime button ($jwo83) to donate modal (idempotent)
    const donate = this._domCache.donateModal || document.getElementById('donate-modal');
    if (donate) {
      // Add a small row under the main buttons if not present
      if (!document.getElementById('donate-chime-row')) {
        const row = document.createElement('div');
        row.id = 'donate-chime-row';
        row.className = 'mt-4 p-3 bg-gray-900 rounded border border-gray-800';
        row.innerHTML = `
          <div class="text-xs mb-2">Pay the dev (handles):</div>
          <div class="flex gap-2">
            <button class="py-2 px-3 rounded bg-yellow-500 text-black text-sm" id="donate-chime-cash">$jwo83 (Cash)</button>
            <button class="py-2 px-3 rounded bg-blue-500 text-white text-sm" id="donate-chime-paypal">$jwo83 (PayPal)</button>
          </div>
        `;
        const inner = donate.querySelector('.settings-modal-bg') || donate.querySelector('.flex') || donate;
        inner && inner.appendChild(row);
      }
    }

    // Finished injections
    // Build mapping widgets later when user opens stealth tab to avoid heavy DOM at load.
  },

  // Public init used by constructor after object creation
  initInjects() {
    try {
      this.injectUIElements();
    } catch (e) {
      console.error("UI injection failed", e);
    }
  }
});
