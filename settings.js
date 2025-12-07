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
     /* =================================================================================================
   SECTION 3A — MAPPING ENGINE + DATA MODEL
   -------------------------------------------------------------------------------------------------
   This is the entire internal model for:
   - Gesture mappings
   - Morse mappings
   - All input modes (9-key, 12-key, Piano)
   - Full persistence
   - Auto-correction
   - Integration with Stealth tab and Help panel
================================================================================================= */

// Master container on the settings object
if (!settings.mapping) settings.mapping = {};

// Allowed gesture types
const GESTURE_TYPES = {
  TAP: "tap",
  DOUBLE_TAP: "double_tap",
  LONG_TAP: "long_tap",
  SWIPE: "swipe"
};

// Allowed directions (including diagonals and finger-count variations)
const SWIPE_DIRECTIONS = [
  "left", "right", "up", "down",
  "up_left", "up_right", "down_left", "down_right"
];

const FINGER_COUNTS = [1, 2, 3];

// Helper for building swipe identifiers
function swipeId(direction, fingers) {
  return `swipe_${direction}_${fingers}f`;
}

// Helper for building tap identifiers
function tapId(type, fingers) {
  return `${type}_${fingers}f`;
}

// =================================================================================================
// DEFAULT MORSE MAPS
// (dots/dashes as specified by your request)
// =================================================================================================

const DEFAULT_MORSE_9KEY = {
  1: ".",       // tap 1 finger
  2: "..",      // double tap 1 finger
  3: "...",     // long tap 1 finger
  4: "-",       // tap 2 fingers
  5: "-.",      // double tap 2 fingers
  6: "-..",     // long tap 2 fingers
  7: "--",      // tap 3 fingers
  8: "--.",     // double tap 3 fingers
  9: "---"      // long tap 3 fingers
};

const DEFAULT_MORSE_12KEY = {
  1: ".",        // swipe left
  2: "..",       // swipe down
  3: "...",      // swipe up
  4: "...-",     // swipe right
  5: "-",        // swipe left 2 fingers
  6: "-.",       // swipe down 2 fingers
  7: "-..",      // swipe up 2 fingers
  8: "-.-",      // swipe right 2 fingers
  9: "--",       // swipe left 3 fingers
  10: "--.",     // swipe down 3 fingers
  11: "--..",    // swipe up 3 fingers
  12: "---"      // swipe right 3 fingers
};

const DEFAULT_MORSE_PIANO = {
  1: "-",        // swipe left 2 fingers
  2: "-.",       // swipe up-left 2 fingers
  3: "--",       // swipe up 2 fingers
  4: "-..",      // swipe up-right 2 fingers
  5: "-.-",      // swipe right 2 fingers
  "C": ".",      // swipe up-left
  "D": "..",     // swipe left
  "E": ".-",     // swipe down-left
  "F": "...",    // swipe down
  "G": "..-",    // swipe down-right
  "A": ".-.",    // swipe right
  "B": ".--"     // swipe up-right
};

// =================================================================================================
// DEFAULT GESTURE MAPS
// (Each maps to input numbers or piano letters EXACTLY as you specified)
// =================================================================================================

const DEFAULT_GESTURES_9KEY = {
  1: tapId(GESTURE_TYPES.TAP, 1),
  2: tapId(GESTURE_TYPES.DOUBLE_TAP, 1),
  3: tapId(GESTURE_TYPES.LONG_TAP, 1),
  4: tapId(GESTURE_TYPES.TAP, 2),
  5: tapId(GESTURE_TYPES.DOUBLE_TAP, 2),
  6: tapId(GESTURE_TYPES.LONG_TAP, 2),
  7: tapId(GESTURE_TYPES.TAP, 3),
  8: tapId(GESTURE_TYPES.DOUBLE_TAP, 3),
  9: tapId(GESTURE_TYPES.LONG_TAP, 3)
};

const DEFAULT_GESTURES_12KEY = {
  1: swipeId("left", 1),
  2: swipeId("down", 1),
  3: swipeId("up", 1),
  4: swipeId("right", 1),
  5: swipeId("left", 2),
  6: swipeId("down", 2),
  7: swipeId("up", 2),
  8: swipeId("right", 2),
  9: swipeId("left", 3),
  10: swipeId("down", 3),
  11: swipeId("up", 3),
  12: swipeId("right", 3)
};

const DEFAULT_GESTURES_PIANO = {
  1: swipeId("left", 2),
  2: swipeId("up_left", 2),
  3: swipeId("up", 2),
  4: swipeId("up_right", 2),
  5: swipeId("right", 2),
  "C": swipeId("up_left", 1),
  "D": swipeId("left", 1),
  "E": swipeId("down_left", 1),
  "F": swipeId("down", 1),
  "G": swipeId("down_right", 1),
  "A": swipeId("right", 1),
  "B": swipeId("up_right", 1)
};

// =================================================================================================
// BUILD FULL DEFAULT MAPPING CONTAINER
// =================================================================================================

const DEFAULT_MAPPING = {
  "key9": {
    morse: DEFAULT_MORSE_9KEY,
    gestures: DEFAULT_GESTURES_9KEY
  },
  "key12": {
    morse: DEFAULT_MORSE_12KEY,
    gestures: DEFAULT_GESTURES_12KEY
  },
  "piano": {
    morse: DEFAULT_MORSE_PIANO,
    gestures: DEFAULT_GESTURES_PIANO
  }
};

// =================================================================================================
// Ensure settings.mapping exists and fill missing fields
// =================================================================================================

function initMappingDefaults() {
  if (!settings.mapping) settings.mapping = {};

  ["key9", "key12", "piano"].forEach(mode => {
    if (!settings.mapping[mode]) settings.mapping[mode] = {};

    if (!settings.mapping[mode].morse) {
      settings.mapping[mode].morse = JSON.parse(JSON.stringify(DEFAULT_MAPPING[mode].morse));
    }
    if (!settings.mapping[mode].gestures) {
      settings.mapping[mode].gestures = JSON.parse(JSON.stringify(DEFAULT_MAPPING[mode].gestures));
    }
  });
}

initMappingDefaults();

// =================================================================================================
// Save Mapping Back to settings + localStorage
// =================================================================================================

function saveMapping() {
  try {
    localStorage.setItem("settings.mapping", JSON.stringify(settings.mapping));
  } catch (e) {
    console.warn("Mapping save failed", e);
  }
}

// =================================================================================================
// Load Mapping From localStorage
// =================================================================================================

function loadMapping() {
  try {
    const raw = localStorage.getItem("settings.mapping");
    if (!raw) return;
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") return;

    // Merge with defaults
    ["key9", "key12", "piano"].forEach(mode => {
      if (!parsed[mode]) parsed[mode] = {};

      parsed[mode].morse = parsed[mode].morse || DEFAULT_MAPPING[mode].morse;
      parsed[mode].gestures = parsed[mode].gestures || DEFAULT_MAPPING[mode].gestures;
    });

    settings.mapping = parsed;
  } catch (e) {
    console.warn("Mapping load failed", e);
  }
}

loadMapping();
saveMapping();
/* =================================================================================================
   SECTION 3B — MORSE MAPPING UI BUILDER + Live Sync
   -------------------------------------------------------------------------------------------------
   Idempotent builder that constructs editable morse mapping inputs for:
   - key9 (1..9)
   - key12 (1..12)
   - piano (1..5, C..B)
   -------------------------------------------------------------------------------------------------
   Relies on:
     - settings.mapping (initialized in Section 3A)
     - saveMapping() and loadMapping() handlers (Section 3A)
================================================================================================= */

(function () {
  // Resolve a stable settings root (works with multiple integration patterns)
  const SETTINGS_ROOT = (typeof settings !== 'undefined' && settings) ||
                        (typeof globalThis !== 'undefined' && globalThis.settings) ||
                        (typeof window !== 'undefined' && window.settings) ||
                        (typeof window !== 'undefined' && window.appSettings) ||
                        null;

  if (!SETTINGS_ROOT) {
    // If nothing exists yet, create a safe global fallback to avoid runtime errors.
    console.warn("settings root not found. Creating fallback 'settings' object.");
    if (typeof globalThis !== 'undefined') globalThis.settings = globalThis.settings || {};
  }

  const root = SETTINGS_ROOT || globalThis.settings;

  // Safety: ensure mapping exists (re-run of defaults if required)
  if (!root.mapping) root.mapping = {};
  if (!root.mapping.key9) root.mapping.key9 = { morse: {}, gestures: {} };
  if (!root.mapping.key12) root.mapping.key12 = { morse: {}, gestures: {} };
  if (!root.mapping.piano) root.mapping.piano = { morse: {}, gestures: {} };

  // Utility validators
  function cleanMorseInput(v) {
    if (!v && v !== "") return "";
    // Keep only dot/dash characters and trim spaces
    return String(v).replace(/[^.\-]/g, '').trim();
  }
  function isValidMorse(v) {
    return /^[.\-]*$/.test(String(v));
  }

  // UI builder for one map (mode = 'key9'|'key12'|'piano')
  function buildMorseSection(mode, container) {
    const map = root.mapping[mode] && root.mapping[mode].morse ? root.mapping[mode].morse : {};
    // Decide keys ordering
    let keys = [];
    if (mode === 'key9') keys = Array.from({ length: 9 }, (_, i) => String(i + 1));
    else if (mode === 'key12') keys = Array.from({ length: 12 }, (_, i) => String(i + 1));
    else if (mode === 'piano') keys = ['1','2','3','4','5','C','D','E','F','G','A','B'];
    else keys = Object.keys(map);

    const section = document.createElement('div');
    section.className = 'mapping-section p-2 rounded border border-gray-700 bg-black bg-opacity-10';

    const title = document.createElement('div');
    title.className = 'font-bold mb-2';
    title.innerText = (mode === 'key9' ? '9-Key Morse' : mode === 'key12' ? '12-Key Morse' : 'Piano Morse');
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'grid gap-2';

    keys.forEach(k => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between';

      const label = document.createElement('div');
      label.className = 'text-xs w-20';
      label.innerText = k;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'settings-input p-1 text-xs w-44';
      input.placeholder = mode === 'piano' ? 'e.g. .- or -.' : 'e.g. . or -';
      input.value = map[k] || '';

      // When user input changes, validate and persist
      input.addEventListener('change', (ev) => {
        const raw = ev.target.value;
        const cleaned = cleanMorseInput(raw);
        if (!isValidMorse(cleaned)) {
          ev.target.classList.add('border-red-500');
          // rollback to previous
          ev.target.value = map[k] || '';
          setTimeout(() => ev.target.classList.remove('border-red-500'), 900);
          return;
        }
        // Save into settings mapping
        root.mapping[mode].morse = root.mapping[mode].morse || {};
        root.mapping[mode].morse[k] = cleaned;
        // Persist to storage
        try { saveMapping(); } catch (e) { console.warn("saveMapping missing", e); }
        // Update help guides
        updateHelpMappingGuide();
      });

      const hint = document.createElement('div');
      hint.className = 'text-xs opacity-60 ml-2';
      hint.innerText = cleanedPreview(map[k] || '');

      // live preview update
      input.addEventListener('input', (ev) => {
        const val = cleanMorseInput(ev.target.value);
        hint.innerText = cleanedPreview(val);
      });

      row.appendChild(label);
      const right = document.createElement('div');
      right.className = 'flex items-center gap-2';
      right.appendChild(input);
      right.appendChild(hint);
      row.appendChild(right);
      grid.appendChild(row);
    });

    // Add "Apply defaults" small button
    const actions = document.createElement('div');
    actions.className = 'mt-2 flex gap-2 justify-end';
    const defBtn = document.createElement('button');
    defBtn.className = 'py-1 px-2 bg-yellow-600 text-black rounded text-xs';
    defBtn.innerText = 'Apply Defaults';
    defBtn.onclick = () => {
      // take defaults from DEFAULT_MAPPING (from Section 3A)
      if (typeof DEFAULT_MAPPING !== 'undefined' && DEFAULT_MAPPING[mode] && DEFAULT_MAPPING[mode].morse) {
        root.mapping[mode].morse = JSON.parse(JSON.stringify(DEFAULT_MAPPING[mode].morse));
        try { saveMapping(); } catch (e) {}
        // rebuild UI
        refreshMorseMappingUI();
        updateHelpMappingGuide();
      } else {
        console.warn("Default mapping not available for", mode);
      }
    };
    actions.appendChild(defBtn);

    section.appendChild(grid);
    section.appendChild(actions);
    container.appendChild(section);
  }

  // small helper to render a visual cleaned preview (for hint)
  function cleanedPreview(morseStr) {
    if (!morseStr) return '';
    // compress long runs and show as spaced symbols for readability
    return morseStr.split('').join(' ');
  }

  // Primary function: build the entire morse mapping UI into #morse-mapping-container
  function buildAllMorseUI() {
    const container = document.getElementById('morse-mapping-container');
    if (!container) {
      console.warn("#morse-mapping-container not found in DOM");
      return;
    }
    // idempotent: clear existing contents
    container.innerHTML = '';

    // build per-mode sections
    buildMorseSection('key9', container);
    buildMorseSection('key12', container);
    buildMorseSection('piano', container);
  }

  // Public: refresh builder
  function refreshMorseMappingUI() {
    try {
      // reload mapping from storage in case other code modified it
      try { loadMapping(); } catch (e) {}
      buildAllMorseUI();
    } catch (e) {
      console.error("Failed to refresh Morse mapping UI", e);
    }
  }

  // Update help modal mapping guide summarizing key mappings (small readable grid)
  function updateHelpMappingGuide() {
    try {
      const helpGuide = document.getElementById('help-mapping-guide');
      if (!helpGuide) return;
      helpGuide.innerHTML = ''; // clear

      const title = document.createElement('div');
      title.className = 'font-bold mb-1';
      title.innerText = 'Morse Mappings (preview)';

      const table = document.createElement('div');
      table.className = 'grid grid-cols-3 gap-2 text-xs';

      const modes = ['key9','key12','piano'];
      modes.forEach(mode => {
        const box = document.createElement('div');
        box.className = 'p-2 rounded bg-black bg-opacity-20';
        const heading = document.createElement('div');
        heading.className = 'font-bold text-xs mb-1';
        heading.innerText = (mode === 'key9' ? '9-Key' : mode === 'key12' ? '12-Key' : 'Piano');
        box.appendChild(heading);

        const list = document.createElement('div');
        list.className = 'text-xs font-mono';
        const map = (root.mapping[mode] && root.mapping[mode].morse) ? root.mapping[mode].morse : {};
        // show up to 8 entries for compactness
        const keys = Object.keys(map).slice(0, 12);
        keys.forEach(k => {
          const row = document.createElement('div');
          row.innerText = `${k}: ${map[k] || ''}`;
          list.appendChild(row);
        });

        box.appendChild(list);
        table.appendChild(box);
      });

      helpGuide.appendChild(title);
      helpGuide.appendChild(table);
    } catch (e) {
      console.warn("Failed to update help mapping guide", e);
    }
  }

  // Ensure UI is present on load
  document.addEventListener('DOMContentLoaded', () => {
    // small delay to ensure settings modal insertion (Section 2) completed
    setTimeout(() => {
      try {
        // If the container doesn't exist yet, Section2 may not be injected; attempt injection if SettingsManager available
        if (!document.getElementById('morse-mapping-container') && typeof SettingsManager !== 'undefined') {
          try {
            const mgr = window.__settingsManagerInstance__;
            if (mgr && typeof mgr.injectUIElements === 'function') mgr.injectUIElements();
          } catch (e) {}
        }
        refreshMorseMappingUI();
        updateHelpMappingGuide();
      } catch (e) {
        console.error("Morse mapping init error", e);
      }
    }, 120);
  });

  // Expose helpers for external use (so app.js can call them)
  globalThis.refreshMorseMappingUI = refreshMorseMappingUI;
  globalThis.updateHelpMappingGuide = updateHelpMappingGuide;

})();
  /* =================================================================================================
   SECTION 3C — GESTURE MAPPING UI BUILDER + Live Sync
   -------------------------------------------------------------------------------------------------
   Builds the Gesture Mapping editor for:
   - key9
   - key12
   - piano

   Supports:
   - Tap / Double Tap / Long Tap
   - 1–3 fingers
   - Swipes (left, right, up, down, all diagonals)
   - Multi-finger swipes
   - Live update & save
   - Apply Defaults
   - Help panel sync
================================================================================================= */

(function () {
  // Ensure settings root exists
  const SETTINGS_ROOT =
    (typeof settings !== "undefined" && settings) ||
    (typeof globalThis !== "undefined" && globalThis.settings) ||
    (typeof window !== "undefined" && window.settings) ||
    (typeof window !== "undefined" && window.appSettings) ||
    null;

  if (!SETTINGS_ROOT) {
    console.warn("settings root not found, generating fallback");
    if (typeof globalThis !== "undefined")
      globalThis.settings = globalThis.settings || {};
  }
  const root = SETTINGS_ROOT || globalThis.settings;

  if (!root.mapping) root.mapping = {};
  if (!root.mapping.key9) root.mapping.key9 = { morse: {}, gestures: {} };
  if (!root.mapping.key12) root.mapping.key12 = { morse: {}, gestures: {} };
  if (!root.mapping.piano) root.mapping.piano = { morse: {}, gestures: {} };

  // Names
  const TAP_TYPES = ["tap", "double_tap", "long_tap"];
  const TAP_LABELS = {
    tap: "Tap",
    double_tap: "Double Tap",
    long_tap: "Long Tap"
  };

  const DIRECTIONS = [
    "left",
    "right",
    "up",
    "down",
    "up_left",
    "up_right",
    "down_left",
    "down_right"
  ];
  const DIR_LABELS = {
    left: "⬅️ Left",
    right: "➡️ Right",
    up: "⬆️ Up",
    down: "⬇️ Down",
    up_left: "↖️ Up-Left",
    up_right: "↗️ Up-Right",
    down_left: "↙️ Down-Left",
    down_right: "↘️ Down-Right"
  };

  const FINGERS = [1, 2, 3];

  // Helpers (already used in Section 3A)
  function tapId(type, fingers) {
    return `${type}_${fingers}f`;
  }
  function swipeId(direction, fingers) {
    return `swipe_${direction}_${fingers}f`;
  }

  // Dropdown builder: all gesture options
  function buildGestureSelector(currentValue) {
    const sel = document.createElement("select");
    sel.className = "settings-input p-1 text-xs w-44";

    // TAP section
    const optGroupTap = document.createElement("optgroup");
    optGroupTap.label = "Taps";

    TAP_TYPES.forEach((type) => {
      FINGERS.forEach((f) => {
        const id = tapId(type, f);
        const opt = document.createElement("option");
        opt.value = id;
        opt.innerText = `${TAP_LABELS[type]} (${f} finger${f > 1 ? "s" : ""})`;
        if (id === currentValue) opt.selected = true;
        optGroupTap.appendChild(opt);
      });
    });

    // SWIPES section
    const optGroupSwipe = document.createElement("optgroup");
    optGroupSwipe.label = "Swipes";

    DIRECTIONS.forEach((dir) => {
      FINGERS.forEach((f) => {
        const id = swipeId(dir, f);
        const opt = document.createElement("option");
        opt.value = id;
        opt.innerText = `${DIR_LABELS[dir]} (${f} finger${f > 1 ? "s" : ""})`;
        if (id === currentValue) opt.selected = true;
        optGroupSwipe.appendChild(opt);
      });
    });

    sel.appendChild(optGroupTap);
    sel.appendChild(optGroupSwipe);
    return sel;
  }

  // Build UI for a single mode (key9 / key12 / piano)
  function buildGestureSection(mode, container) {
    const section = document.createElement("div");
    section.className =
      "mapping-section p-2 rounded border border-gray-700 bg-black bg-opacity-10";

    const title = document.createElement("div");
    title.className = "font-bold mb-2";
    title.innerText =
      mode === "key9"
        ? "9-Key Gestures"
        : mode === "key12"
        ? "12-Key Gestures"
        : "Piano Gestures";

    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid gap-2";

    // determine keys
    let keys = [];
    if (mode === "key9") {
      keys = Array.from({ length: 9 }, (_, i) => String(i + 1));
    } else if (mode === "key12") {
      keys = Array.from({ length: 12 }, (_, i) => String(i + 1));
    } else if (mode === "piano") {
      keys = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "C",
        "D",
        "E",
        "F",
        "G",
        "A",
        "B"
      ];
    }

    const map = root.mapping[mode].gestures || {};

    keys.forEach((k) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between";

      const label = document.createElement("div");
      label.className = "text-xs w-20";
      label.innerText = k;

      const sel = buildGestureSelector(map[k]);

      sel.addEventListener("change", (ev) => {
        root.mapping[mode].gestures[k] = ev.target.value;
        try {
          saveMapping();
        } catch (e) {
          console.warn("saveMapping error", e);
        }
        updateHelpGestureGuide();
      });

      row.appendChild(label);
      row.appendChild(sel);
      grid.appendChild(row);
    });

    // apply defaults
    const actions = document.createElement("div");
    actions.className = "mt-2 flex gap-2 justify-end";

    const defBtn = document.createElement("button");
    defBtn.className = "py-1 px-2 bg-yellow-600 text-black rounded text-xs";
    defBtn.innerText = "Apply Defaults";
    defBtn.onclick = () => {
      if (DEFAULT_MAPPING && DEFAULT_MAPPING[mode]) {
        root.mapping[mode].gestures = JSON.parse(
          JSON.stringify(DEFAULT_MAPPING[mode].gestures)
        );
        try {
          saveMapping();
        } catch (e) {}
        refreshGestureMappingUI();
        updateHelpGestureGuide();
      }
    };

    actions.appendChild(defBtn);

    section.appendChild(grid);
    section.appendChild(actions);

    container.appendChild(section);
  }

  // Build entire gesture UI
  function buildAllGestureUI() {
    const container = document.getElementById("gesture-mapping-container");
    if (!container) {
      console.warn("#gesture-mapping-container not found");
      return;
    }

    container.innerHTML = "";

    buildGestureSection("key9", container);
    buildGestureSection("key12", container);
    buildGestureSection("piano", container);
  }

  function refreshGestureMappingUI() {
    try {
      loadMapping();
      buildAllGestureUI();
    } catch (e) {
      console.error("Failed to rebuild Gesture UI", e);
    }
  }

  // Help modal updater
  function updateHelpGestureGuide() {
    const helpGuide = document.getElementById("help-mapping-guide");
    if (!helpGuide) return;

    const mapRoot = root.mapping;

    const gestureTitle = document.createElement("div");
    gestureTitle.className = "font-bold mt-2 mb-1";
    gestureTitle.innerText = "Gesture Mappings (preview)";

    const wrapper = document.createElement("div");
    wrapper.className = "grid grid-cols-3 gap-2 text-xs";

    ["key9", "key12", "piano"].forEach((mode) => {
      const box = document.createElement("div");
      box.className = "p-2 rounded bg-black bg-opacity-20";

      const heading = document.createElement("div");
      heading.className = "font-bold text-xs mb-1";
      heading.innerText =
        mode === "key9"
          ? "9-Key"
          : mode === "key12"
          ? "12-Key"
          : "Piano";
      box.appendChild(heading);

      const list = document.createElement("div");
      list.className = "text-xs font-mono";

      const map = mapRoot[mode].gestures || {};
      const keys = Object.keys(map).slice(0, 12);

      keys.forEach((k) => {
        const row = document.createElement("div");
        row.innerText = `${k}: ${map[k]}`;
        list.appendChild(row);
      });

      box.appendChild(list);
      wrapper.appendChild(box);
    });

    // Remove old content safely and append new
    // (This merges with Morse preview already present)
    const previous = helpGuide.querySelector(".gesture-preview-wrapper");
    if (previous) previous.remove();

    const gestureWrapper = document.createElement("div");
    gestureWrapper.className = "gesture-preview-wrapper";
    gestureWrapper.appendChild(gestureTitle);
    gestureWrapper.appendChild(wrapper);

    helpGuide.appendChild(gestureWrapper);
  }

  // DOM load
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      refreshGestureMappingUI();
      updateHelpGestureGuide();
    }, 130);
  });

  // expose to global
  globalThis.refreshGestureMappingUI = refreshGestureMappingUI;
  globalThis.updateHelpGestureGuide = updateHelpGestureGuide;
})();
          /* =================================================================================================
   SECTION 3D — MAPPING GLUE, SAVE/LOAD, HOT-RELOAD, SENSOR BRIDGE, and API EXPORTS
================================================================================================= */

(function () {
  // Ensure global settings exists (as Sections 3A..3C used)
  if (typeof globalThis.settings === 'undefined') globalThis.settings = globalThis.settings || {};
  const SETTINGS = globalThis.settings;

  // Ensure DEFAULT_MAPPING exists (from 3A)
  if (typeof DEFAULT_MAPPING === 'undefined') {
    console.warn("DEFAULT_MAPPING missing - recreating minimal defaults.");
    // minimal fallback - avoids crashes; real defaults exist in Section 3A
    globalThis.DEFAULT_MAPPING = globalThis.DEFAULT_MAPPING || {};
  }

  // Robust saveMapping / loadMapping (idempotent, merges defaults)
  function saveMapping() {
    try {
      if (!SETTINGS.mapping) SETTINGS.mapping = {};
      // ensure each mode exists
      ["key9", "key12", "piano"].forEach((mode) => {
        if (!SETTINGS.mapping[mode]) SETTINGS.mapping[mode] = { morse: {}, gestures: {} };
        SETTINGS.mapping[mode].morse = SETTINGS.mapping[mode].morse || {};
        SETTINGS.mapping[mode].gestures = SETTINGS.mapping[mode].gestures || {};
      });
      const payload = JSON.stringify(SETTINGS.mapping);
      localStorage.setItem("settings.mapping", payload);
      // notify listeners
      notifyMappingListeners();
    } catch (e) {
      console.warn("saveMapping failed", e);
    }
  }

  function loadMapping() {
    try {
      const raw = localStorage.getItem("settings.mapping");
      if (!raw) {
        // no stored mapping — ensure defaults exist
        if (!SETTINGS.mapping) SETTINGS.mapping = JSON.parse(JSON.stringify(DEFAULT_MAPPING || {}));
        return;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        console.warn("Invalid mapping in storage; resetting to defaults");
        SETTINGS.mapping = JSON.parse(JSON.stringify(DEFAULT_MAPPING || {}));
        saveMapping();
        return;
      }
      // Merge parsed with defaults to ensure all entries present
      ["key9", "key12", "piano"].forEach((mode) => {
        SETTINGS.mapping[mode] = SETTINGS.mapping[mode] || {};
        SETTINGS.mapping[mode].morse = parsed[mode]?.morse || DEFAULT_MAPPING[mode]?.morse || {};
        SETTINGS.mapping[mode].gestures = parsed[mode]?.gestures || DEFAULT_MAPPING[mode]?.gestures || {};
      });
    } catch (e) {
      console.warn("loadMapping failed", e);
      SETTINGS.mapping = JSON.parse(JSON.stringify(DEFAULT_MAPPING || {}));
    }
  }

  // Ensure we have mapping loaded now
  try { loadMapping(); } catch (e) { console.warn("initial loadMapping error", e); }

  // Basic validator - ensure mapping targets are in-range for the mode
  function validateMappingForMode(mode) {
    const problems = [];
    try {
      const map = SETTINGS.mapping[mode] || {};
      const gestures = map.gestures || {};
      const morse = map.morse || {};
      const validKeys = mode === 'key9' ? Array.from({length:9},(_,i)=>String(i+1)) :
                        mode === 'key12' ? Array.from({length:12},(_,i)=>String(i+1)) :
                        ['1','2','3','4','5','C','D','E','F','G','A','B'];
      Object.keys(gestures).forEach(k => {
        if (!validKeys.includes(String(k))) problems.push(`Gesture mapped to invalid key ${k} in ${mode}`);
      });
      Object.keys(morse).forEach(k => {
        if (!validKeys.includes(String(k))) problems.push(`Morse mapped to invalid key ${k} in ${mode}`);
      });
    } catch (e) {
      console.warn("validateMappingForMode error", e);
    }
    return problems;
  }

  // Listener registry for mapping changes
  const _mappingListeners = new Set();
  function notifyMappingListeners() {
    try {
      // call each listener with (mapping)
      _mappingListeners.forEach(cb => {
        try { cb(SETTINGS.mapping); } catch (e) { console.warn("mapping listener failed", e); }
      });
      // update help UIs if present
      if (typeof globalThis.updateHelpMappingGuide === 'function') globalThis.updateHelpMappingGuide();
      if (typeof globalThis.updateHelpGestureGuide === 'function') globalThis.updateHelpGestureGuide();
    } catch (e) {
      console.warn("notifyMappingListeners error", e);
    }
  }

  // Public API: register mapping change callback
  function onMappingChanged(cb) {
    if (typeof cb !== 'function') return;
    _mappingListeners.add(cb);
    return () => _mappingListeners.delete(cb); // return unsubscribe
  }

  // Expose getter for mapping data (frozen)
  function getMappingForMode(mode) {
    if (!mode || !SETTINGS.mapping || !SETTINGS.mapping[mode]) return null;
    // return deep copy to prevent external mutation
    return JSON.parse(JSON.stringify(SETTINGS.mapping[mode]));
  }

  // Refresh both UIs
  function refreshAllMappingsUI() {
    try {
      if (typeof globalThis.refreshMorseMappingUI === 'function') globalThis.refreshMorseMappingUI();
      if (typeof globalThis.refreshGestureMappingUI === 'function') globalThis.refreshGestureMappingUI();
      // also update help
      if (typeof globalThis.updateHelpMappingGuide === 'function') globalThis.updateHelpMappingGuide();
      if (typeof globalThis.updateHelpGestureGuide === 'function') globalThis.updateHelpGestureGuide();
    } catch (e) {
      console.warn("refreshAllMappingsUI error", e);
    }
  }

  // Helper: apply mapping into a sensor engine
  // sensorEngine must have setCalibrationCallback and onTrigger handlers; here we only provide
  // a mapping layer: it translates gesture tokens into numeric inputs and calls onTrigger(n, source)
  function applyMappingsToSensor(sensorEngine, inputMode = 'key9') {
    if (!sensorEngine) {
      console.warn("applyMappingsToSensor: missing sensorEngine");
      return;
    }
    loadMapping(); // ensure current
    const map = SETTINGS.mapping[inputMode] || {};
    const gestures = map.gestures || {};
    const morse = map.morse || {};

    // Build reverse map: token -> key(s)
    const tokenToKey = {};
    Object.keys(gestures).forEach(k => {
      const tok = gestures[k];
      if (!tok) return;
      if (!tokenToKey[tok]) tokenToKey[tok] = [];
      tokenToKey[tok].push(k); // note: multiple keys could share tokens; app decides
    });

    // sensorEngine.onTrigger should be called by sensor processing code with (n, source)
    // Here, we expose a helper to translate a token into an input:
    function handleToken(token, source = 'sensor') {
      const targetKeys = tokenToKey[token] || [];
      if (targetKeys.length === 0) {
        // token may be a tapId like 'tap_1f' but mapping may be in gestures; if not found, ignore
        console.debug("Unhandled token", token);
        return;
      }
      // If multiple keys map, pick the first (safe fallback) — apps that need specific behavior can listen to mapping changes
      const key = targetKeys[0];
      // Call sensorEngine callback if available, otherwise emit a global event
      if (sensorEngine && typeof sensorEngine.onTrigger === 'function') {
        try { sensorEngine.onTrigger(Number(key) || key, source); }
        catch (e) { console.warn("sensorEngine.onTrigger failed", e); }
      } else {
        // fallback: dispatch custom event
        const ev = new CustomEvent('mapping:trigger', { detail: { key: Number(key) || key, source } });
        window.dispatchEvent(ev);
      }
    }

    // Return the translator so app can wire it into its gesture detection pipeline
    return {
      handleToken,
      tokenToKey
    };
  }

  // Register a SettingsManager instance (so mapping UI/manager can be accessed)
  function registerSettingsManager(instance) {
    try {
      if (!instance) return;
      globalThis.__settingsManagerInstance__ = instance;
      // automatically call refresh UI when manager registers
      refreshAllMappingsUI();
      // hook mapping changes to call manager callbacks if present
      onMappingChanged((mapping) => {
        try {
          if (instance && instance.callbacks && typeof instance.callbacks.onMappingChange === 'function') {
            instance.callbacks.onMappingChange(mapping);
          }
        } catch (e) { console.warn("registered manager mapping callback error", e); }
      });
    } catch (e) {
      console.warn("registerSettingsManager error", e);
    }
  }

  // Expose API on globalThis for app.js to use
  globalThis.mappingAPI = globalThis.mappingAPI || {};
  Object.assign(globalThis.mappingAPI, {
    saveMapping,
    loadMapping,
    getMappingForMode,
    applyMappingsToSensor,
    refreshAllMappingsUI,
    registerSettingsManager,
    onMappingChanged
  });

  // Ensure UI re-renders on storage events (in case user edits mapping in another tab)
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'settings.mapping') {
      try {
        loadMapping();
        refreshAllMappingsUI();
      } catch (e) { console.warn("storage event mapping reload failed", e); }
    }
  });

  // Ensure initial help content updates
  try {
    if (typeof globalThis.updateHelpMappingGuide === 'function') globalThis.updateHelpMappingGuide();
    if (typeof globalThis.updateHelpGestureGuide === 'function') globalThis.updateHelpGestureGuide();
  } catch (e) {
    // ignore
  }

  // Export small debug helpers
  globalThis._mappingDebug = {
    validateMappingForMode,
    _listenersCount: () => _mappingListeners.size
  };
})();
/* =================================================================================================
   SECTION 4 — SETTINGS MANAGER DOM cache, toggles, persistence, timer & counter behavior,
               mapping manager registration, and init finalization.
================================================================================================= */

Object.assign(SettingsManager.prototype, {
  // Build an expanded DOM cache for elements we interact with
  buildDomCache() {
    // Keep previous cache but augment
    this._domCache = this._domCache || {};

    const get = id => document.getElementById(id) || null;

    // core nodes
    this._domCache.settingsModal = get('settings-modal');
    this._domCache.tabGeneral = get('tab-general');
    this._domCache.tabPlayback = get('tab-playback');
    this._domCache.tabStealth = get('tab-stealth');
    this._domCache.morseContainer = get('morse-mapping-container');
    this._domCache.gestureContainer = get('gesture-mapping-container');

    // toggles
    this._domCache.gesturesToggle = get('gestures-toggle');
    this._domCache.timerToggle = get('timer-toggle');
    this._domCache.counterToggle = get('counter-toggle');
    this._domCache.hapticMorseToggle = get('haptic-morse-toggle');
    this._domCache.pauseSelect = get('gesture-pause-select');
    this._domCache.blackoutToggle = get('blackout-toggle');
    this._domCache.blackoutGestToggle = get('blackout-gestures-toggle');
    this._domCache.stealth1KeyToggle = get('stealth-1key-toggle');
    this._domCache.autoplayToggle = get('autoplay-toggle');
    this._domCache.audioToggle = get('audio-toggle');

    // timer & counter buttons (top level)
    this._domCache.timerBtn = get('top-left-timer');
    this._domCache.counterBtn = get('top-right-counter');

    // gesture pad container & practice start
    this._domCache.gesturePadContainer = get('gesture-pad-container');
    this._domCache.gesturePad = get('gesture-pad');
    this._domCache.practiceStartBtn = get('practice-start-btn');

    // donate modal chime buttons
    this._domCache.donateChimeCash = get('donate-chime-cash');
    this._domCache.donateChimePaypal = get('donate-chime-paypal');

    // for persistence control
    this._domCache.saveSettingsBtn = get('save-settings');
    this._domCache.closeSettingsBtn = get('close-settings');
  },

  // Save appSettings to localStorage
  persistSettings() {
    try {
      const key = 'appSettings.v1';
      localStorage.setItem(key, JSON.stringify(this.appSettings));
      if (this.callbacks.onSave) {
        try { this.callbacks.onSave(this.appSettings); } catch (e) { console.warn("callbacks.onSave failed", e); }
      }
    } catch (e) {
      console.warn("persistSettings failed", e);
    }
  },

  // Load appSettings from localStorage and merge
  loadPersistedSettings() {
    try {
      const raw = localStorage.getItem('appSettings.v1');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      // shallow merge into this.appSettings without removing existing props
      Object.keys(parsed).forEach(k => {
        this.appSettings[k] = parsed[k];
      });
    } catch (e) {
      console.warn("loadPersistedSettings failed", e);
    }
  },

  // Toggle wiring and event handlers
  initToggleListeners() {
    // Ensure DOM cache built
    this.buildDomCache();

    // Helper to wire checkbox to appSettings path and persist
    const wireBool = (el, key, onChange) => {
      if (!el) return;
      // set initial
      try { el.checked = !!this.appSettings[key]; } catch(e) {}
      el.onchange = () => {
        this.appSettings[key] = !!el.checked;
        this.persistSettings();
        if (typeof onChange === 'function') onChange(el.checked);
      };
    };

    // Gestures toggle
    wireBool(this._domCache.gesturesToggle, 'isGesturesEnabled', (val) => {
      // show/hide gesture pad container in UI immediately
      if (this._domCache.gesturePadContainer) {
        this._domCache.gesturePadContainer.style.display = val ? 'block' : 'none';
      }
      if (this.callbacks.onApply) this.callbacks.onApply('gestures', val);
    });

    // Timer toggle
    wireBool(this._domCache.timerToggle, 'showTimerButton', (val) => {
      if (this._domCache.timerBtn) this._domCache.timerBtn.style.display = val ? 'flex' : 'none';
      if (this.callbacks.onApply) this.callbacks.onApply('timer', val);
    });

    // Counter toggle
    wireBool(this._domCache.counterToggle, 'showCounterButton', (val) => {
      if (this._domCache.counterBtn) this._domCache.counterBtn.style.display = val ? 'flex' : 'none';
      if (this.callbacks.onApply) this.callbacks.onApply('counter', val);
    });

    // Haptic Morse
    wireBool(this._domCache.hapticMorseToggle, 'isHapticMorseEnabled', (val) => {
      if (this.callbacks.onApply) this.callbacks.onApply('hapticMorse', val);
    });

    // Pause select
    if (this._domCache.pauseSelect) {
      this._domCache.pauseSelect.value = String(this.appSettings.gesturePause || 0.2);
      this._domCache.pauseSelect.onchange = (e) => {
        this.appSettings.gesturePause = parseFloat(e.target.value);
        this.persistSettings();
        if (this.callbacks.onApply) this.callbacks.onApply('gesturePause', this.appSettings.gesturePause);
      };
    }

    // Blackout
    wireBool(this._domCache.blackoutToggle, 'isBlackoutFeatureEnabled', (val) => {
      if (this.callbacks.onApply) this.callbacks.onApply('blackout', val);
    });
    wireBool(this._domCache.blackoutGestToggle, 'isBlackoutGesturesEnabled', (val) => {
      if (this.callbacks.onApply) this.callbacks.onApply('blackoutGestures', val);
    });

    // Stealth (1-key)
    wireBool(this._domCache.stealth1KeyToggle, 'isStealth1KeyEnabled', (val) => {
      if (this.callbacks.onApply) this.callbacks.onApply('stealth1Key', val);
    });

    // Autoplay + Audio (quick wiring)
    wireBool(this._domCache.autoplayToggle, 'isAutoplayEnabled', (v) => {});
    wireBool(this._domCache.audioToggle, 'isAudioEnabled', (v) => {});

    // Save button
    if (this._domCache.saveSettingsBtn) {
      this._domCache.saveSettingsBtn.onclick = () => {
        this.persistSettings();
        if (this._domCache.settingsModal) this._domCache.settingsModal.classList.remove('active');
        if (this.callbacks.onCloseSettings) this.callbacks.onCloseSettings();
      };
    }
    if (this._domCache.closeSettingsBtn) {
      this._domCache.closeSettingsBtn.onclick = () => {
        if (this.callbacks.onCloseSettings) this.callbacks.onCloseSettings();
      };
    }
  },

  // Timer behavior: start/stop and long-press reset
  initTimerCounterBehavior() {
    // Build DOM refs again
    this.buildDomCache();
    const timer = this._domCache.timerBtn;
    const counter = this._domCache.counterBtn;
    // Timer state
    this._timerState = this._timerState || { running: false, startTs: 0, elapsed: 0, intervalId: null };

    const formatTime = (ms) => {
      const seconds = Math.floor(ms / 1000);
      const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
      const ss = (seconds % 60).toString().padStart(2, '0');
      return `${mm}:${ss}`;
    };

    // Timer click toggles start/stop; long press resets
    if (timer) {
      // show/hide based on settings
      timer.style.display = this.appSettings.showTimerButton ? 'flex' : 'none';
      // click handler
      timer.onclick = (e) => {
        e.preventDefault();
        if (!this._timerState.running) {
          // start
          this._timerState.running = true;
          this._timerState.startTs = Date.now() - (this._timerState.elapsed || 0);
          this._timerState.intervalId = setInterval(() => {
            this._timerState.elapsed = Date.now() - this._timerState.startTs;
            timer.innerText = formatTime(this._timerState.elapsed);
          }, 250);
        } else {
          // stop
          this._timerState.running = false;
          if (this._timerState.intervalId) {
            clearInterval(this._timerState.intervalId);
            this._timerState.intervalId = null;
          }
        }
        this.persistSettings();
      };

      // long-press detection (700ms) to reset
      let tpTimeout = null;
      const startPress = (ev) => {
        ev.preventDefault();
        tpTimeout = setTimeout(() => {
          // reset timer
          if (this._timerState.intervalId) {
            clearInterval(this._timerState.intervalId);
            this._timerState.intervalId = null;
          }
          this._timerState.running = false;
          this._timerState.elapsed = 0;
          timer.innerText = '00:00';
          this.persistSettings();
        }, 700);
      };
      const endPress = (ev) => {
        if (tpTimeout) {
          clearTimeout(tpTimeout);
          tpTimeout = null;
        }
      };
      timer.addEventListener('pointerdown', startPress);
      window.addEventListener('pointerup', endPress);
      timer.addEventListener('pointercancel', endPress);
    }

    // Counter behavior: tap increments; long press resets to zero
    if (counter) {
      counter.style.display = this.appSettings.showCounterButton ? 'flex' : 'none';
      // initialize counter value in settings if missing
      if (typeof this.appSettings._counterValue === 'undefined') this.appSettings._counterValue = 0;
      counter.innerText = String(this.appSettings._counterValue || 0);

      counter.onclick = (e) => {
        e.preventDefault();
        this.appSettings._counterValue = (this.appSettings._counterValue || 0) + 1;
        counter.innerText = String(this.appSettings._counterValue);
        this.persistSettings();
      };

      let cpTimeout = null;
      const startCPress = (ev) => {
        ev.preventDefault();
        cpTimeout = setTimeout(() => {
          this.appSettings._counterValue = 0;
          counter.innerText = '0';
          this.persistSettings();
        }, 700);
      };
      const endCPress = (ev) => {
        if (cpTimeout) { clearTimeout(cpTimeout); cpTimeout = null; }
      };
      counter.addEventListener('pointerdown', startCPress);
      window.addEventListener('pointerup', endCPress);
      counter.addEventListener('pointercancel', endCPress);
    }
  },

  // Gesture triple-tap (3-finger triple tap) detection wiring helper (delegates to app if available)
  // Note: core detection is implemented in sensors.js / app.js; this method exposes a small hook
  // that app.js can call to toggle gesture pad UI when triple-tap detected.
  toggleGesturePad(visible) {
    this.buildDomCache();
    if (this._domCache.gesturePadContainer) {
      this._domCache.gesturePadContainer.style.display = visible ? 'block' : 'none';
    }
  },

  // Final init: inject UI elements, wire listeners, mapping registration, timer/counter setup
  initFinal() {
    try {
      // load persisted settings if any
      this.loadPersistedSettings();

      // inject required UI elements (safe)
      try { this.initInjects(); } catch (e) { console.warn("initInjects failed", e); }

      // build DOM cache
      this.buildDomCache();

      // wire toggles and other listeners
      this.initToggleListeners();

      // initialize mapping registration if mappingAPI available
      if (globalThis.mappingAPI && typeof globalThis.mappingAPI.registerSettingsManager === 'function') {
        try { globalThis.mappingAPI.registerSettingsManager(this); } catch (e) { console.warn("mappingAPI.register failed", e); }
      }

      // initialize timer/counter
      this.initTimerCounterBehavior();

      // expose to global for debugging
      globalThis.__settingsManagerInstance__ = this;

      // build mapping UIs (deferred to mapping module) - safe to call
      if (typeof globalThis.refreshMorseMappingUI === 'function') globalThis.refreshMorseMappingUI();
      if (typeof globalThis.refreshGestureMappingUI === 'function') globalThis.refreshGestureMappingUI();

      // wire donate chime handlers (simple open to link placeholder)
      if (this._domCache.donateChimeCash) {
        this._domCache.donateChimeCash.onclick = () => {
          // open Cash App link - replace with your handle or handler
          window.open('https://cash.app/$jwo83', '_blank');
        };
      }
      if (this._domCache.donateChimePaypal) {
        this._domCache.donateChimePaypal.onclick = () => {
          window.open('https://www.paypal.me/jwo83', '_blank');
        };
      }

    } catch (e) {
      console.error("initFinal failed", e);
    }
  }
});

// End Section 4
  /* =================================================================================================
   SECTION 5 — THEME EDITOR, PLAYBACK & TOUCH-UP SETTINGS WIRING
   -----------------------------------------------------------------------------------------------
   This section wires together:
   - Theme selection
   - Voice preset selection
   - Playback/autoplay logic triggers (safe layer only)
   - General-tab two-per-row settings state updates
   - Ensures state is restored correctly when reopening settings
   ----------------------------------------------------------------------------------------------- */

Object.assign(SettingsManager.prototype, {

  /* ------------------------------------------
     Apply theme immediately
  --------------------------------------------*/
  applyTheme(themeName) {
    try {
      const root = document.documentElement;
      // Remove all theme-* classes
      root.className = [...root.classList].filter(c => !c.startsWith("theme-")).join(" ");
      // Apply new theme
      root.classList.add(`theme-${themeName}`);
    } catch (e) {
      console.warn("applyTheme failed", e);
    }
  },

  /* ------------------------------------------
     Theme Wiring
  --------------------------------------------*/
  initThemeEditor() {
    this.buildDomCache();

    const themeSelect = document.getElementById("theme-select");
    if (!themeSelect) return;

    // Load initial theme
    if (this.appSettings.theme) {
      themeSelect.value = this.appSettings.theme;
      this.applyTheme(this.appSettings.theme);
    }

    themeSelect.onchange = () => {
      const val = themeSelect.value;
      this.appSettings.theme = val;
      this.persistSettings();
      this.applyTheme(val);
    };
  },

  /* ------------------------------------------
     Voice presets wiring (if present)
  --------------------------------------------*/
  initVoicePresets() {
    const voiceSelect = document.getElementById("voice-select");
    if (!voiceSelect) return;

    // Load preset
    if (this.appSettings.voicePreset) {
      voiceSelect.value = this.appSettings.voicePreset;
    }

    voiceSelect.onchange = () => {
      const v = voiceSelect.value;
      this.appSettings.voicePreset = v;
      this.persistSettings();
      if (this.callbacks.onApply) {
        try { this.callbacks.onApply("voicePreset", v); } catch (e) {}
      }
    };
  },

  /* ------------------------------------------
     Playback Settings Wiring
     (Autoplay, Audio Feedback, Auto-advance-clear)
  --------------------------------------------*/
  initPlaybackSettings() {
    this.buildDomCache();

    // Autoplay toggle handled in Section 4 wiring
    // Audio toggle handled in Section 4 wiring

    // Auto-advance-clear
    const autoAdv = document.getElementById("auto-advance-toggle");
    if (autoAdv) {
      autoAdv.checked = !!this.appSettings.autoAdvanceClear;
      autoAdv.onchange = () => {
        this.appSettings.autoAdvanceClear = !!autoAdv.checked;
        this.persistSettings();
        if (this.callbacks.onApply) {
          try { this.callbacks.onApply("autoAdvanceClear", this.appSettings.autoAdvanceClear); } catch (e) {}
        }
      };
    }

    // Playback speed slider
    const playbackSpeed = document.getElementById("playback-speed");
    if (playbackSpeed) {
      playbackSpeed.value = String(this.appSettings.playbackSpeed || 1.0);
      playbackSpeed.oninput = () => {
        this.appSettings.playbackSpeed = parseFloat(playbackSpeed.value);
        this.persistSettings();
        if (this.callbacks.onApply) {
          try { this.callbacks.onApply("playbackSpeed", this.appSettings.playbackSpeed); } catch (e) {}
        }
      };
    }
  },

  /* ------------------------------------------
     General tab state restore
     (so toggles stay "in sync" after closing)
  --------------------------------------------*/
  restoreGeneralTabState() {
    this.buildDomCache();

    const map = {
      gesturesToggle: "isGesturesEnabled",
      timerToggle: "showTimerButton",
      counterToggle: "showCounterButton",
      autoplayToggle: "isAutoplayEnabled",
      audioToggle: "isAudioEnabled",
      blackoutToggle: "isBlackoutFeatureEnabled",
      blackoutGestToggle: "isBlackoutGesturesEnabled",
      hapticMorseToggle: "isHapticMorseEnabled",
      stealth1KeyToggle: "isStealth1KeyEnabled"
    };

    Object.keys(map).forEach(id => {
      const el = this._domCache[id];
      const key = map[id];
      if (el && key in this.appSettings) {
        try {
          el.checked = !!this.appSettings[key];
        } catch (e) {}
      }
    });
  },

  /* ------------------------------------------
     Called every time settings are opened
  --------------------------------------------*/
  onOpenSettings() {
    // Reload UI components
    try { this.restoreGeneralTabState(); } catch (e) {}
    try { this.initThemeEditor(); } catch (e) {}
    try { this.initVoicePresets(); } catch (e) {}
    try { this.initPlaybackSettings(); } catch (e) {}

    // Refresh mapping editors
    if (typeof globalThis.refreshMorseMappingUI === "function") globalThis.refreshMorseMappingUI();
    if (typeof globalThis.refreshGestureMappingUI === "function") globalThis.refreshGestureMappingUI();
  }

});
/* =================================================================================================
   SECTION 6 — PRACTICE MODE START BUTTON + GESTURE PAD ENABLE/DISABLE + 3-FINGER TRIPLE-TAP
================================================================================================= */

Object.assign(SettingsManager.prototype, {

  /* =============================================================================
     PRACTICE MODE: Start Button Logic
  ============================================================================= */
  initPracticeModeUI() {
    this.buildDomCache();

    const startBtn = this._domCache.practiceStartBtn;
    if (!startBtn) {
      console.warn("practiceStartBtn not found");
      return;
    }

    // Hide initially unless practice mode is on
    startBtn.style.display = this.appSettings.isPracticeModeEnabled ? "flex" : "none";

    // Provide global functions for game engine
    globalThis.practiceUI = globalThis.practiceUI || {};

    /* Called by game engine when practice mode is enabled but sequence should NOT start yet */
    globalThis.practiceUI.showStartButton = () => {
      try {
        if (!this.appSettings.isPracticeModeEnabled) return;
        startBtn.style.display = "flex";
      } catch (e) {}
    };

    /* Called by game engine when round ends */
    globalThis.practiceUI.endRound = () => {
      try {
        if (!this.appSettings.isPracticeModeEnabled) return;
        startBtn.style.display = "flex";
      } catch (e) {}
    };

    /* User presses Start */
    startBtn.onclick = () => {
      startBtn.style.display = "none";
      if (globalThis.practiceUI && typeof globalThis.practiceUI.beginRound === "function") {
        try { globalThis.practiceUI.beginRound(); } catch (e) {}
      }
    };
  },

  /* =============================================================================
     GESTURE PAD VISIBILITY LOGIC
  ============================================================================= */

  showGesturePad() {
    this.buildDomCache();
    const pad = this._domCache.gesturePadContainer;
    const buttons = document.getElementById("input-buttons");

    if (pad) pad.style.display = "flex";
    if (buttons) buttons.style.display = "none";

    this.appSettings._gesturePadVisible = true;
    this.persistSettings();
  },

  hideGesturePad() {
    this.buildDomCache();
    const pad = this._domCache.gesturePadContainer;
    const buttons = document.getElementById("input-buttons");

    if (pad) pad.style.display = "none";
    if (buttons) buttons.style.display = "flex";

    this.appSettings._gesturePadVisible = false;
    this.persistSettings();
  },

  /* Called when toggles change or on initial load */
  syncGesturePadToSettings() {
    if (!this.appSettings.isGesturesEnabled) {
      this.hideGesturePad();
      return;
    }
    if (this.appSettings._gesturePadVisible) this.showGesturePad();
    else this.hideGesturePad();
  },

  /* =============================================================================
     3-FINGER TRIPLE TAP DETECTOR
  ============================================================================= */

  initTripleTapDetector() {
    // Sensors.js will dispatch a "gesture" event with { fingers, type: 'tap', count }
    // We hook into that here.

    this._tripleTapCooldown = false;

    window.addEventListener("gesture:tap", (ev) => {
      try {
        const d = ev.detail;
        if (!d) return;
        if (d.type !== "tap") return;

        // must be 3-finger and triple tap
        if (d.fingers === 3 && d.count === 3) {
          if (!this.appSettings.isGesturesEnabled) return;

          // prevent rapid flipping
          if (this._tripleTapCooldown) return;
          this._tripleTapCooldown = true;
          setTimeout(() => (this._tripleTapCooldown = false), 900);

          // toggle pad state
          if (this.appSettings._gesturePadVisible) this.hideGesturePad();
          else this.showGesturePad();
        }
      } catch (e) {
        console.warn("triple-tap handler error", e);
      }
    });
  },

  /* =============================================================================
     Called after injects + all toggle wiring
  ============================================================================= */
  initGesturePadManager() {
    try {
      this.syncGesturePadToSettings();
      this.initTripleTapDetector();
    } catch (e) {
      console.warn("initGesturePadManager failed", e);
    }
  },

  /* =============================================================================
     MASTER INIT CONNECTED TO SETTINGS INIT FINAL
  ============================================================================= */
  initPracticeAndGestureSystems() {
    this.initPracticeModeUI();
    this.initGesturePadManager();
  }

});
/* =================================================================================================
   SECTION 7 — HEADER LAYOUT REBUILD: camera/mic repositioning, full-size controls,
               and top-row four-button bar
================================================================================================= */

Object.assign(SettingsManager.prototype, {

  // Utility: find camera or mic DOM nodes respecting different possible IDs
  _findCamButton() {
    return document.getElementById('camera-master-btn') || document.getElementById('camera-btn') || document.querySelector('[data-role="camera-btn"]') || null;
  },
  _findMicButton() {
    return document.getElementById('mic-master-btn') || document.getElementById('mic-btn') || document.querySelector('[data-role="mic-btn"]') || null;
  },

  // Move camera & mic buttons into header placeholders if enabled
  repositionCamMicButtons() {
    try {
      this.buildDomCache();
      const leftSlot = document.getElementById('header-middle-left') || document.getElementById('header-left') || null;
      const rightSlot = document.getElementById('header-middle-right') || document.getElementById('header-right') || null;

      const camBtn = this._findCamButton();
      const micBtn = this._findMicButton();

      // If user disabled showing them, move them back to original container (if we can find it)
      const originalCamParent = document.querySelector('[data-original-parent="camera"]') || document.querySelector('.camera-original') || document.body;
      const originalMicParent = document.querySelector('[data-original-parent="mic"]') || document.querySelector('.mic-original') || document.body;

      // Place camera on middle-left when showCamBtn true
      if (this.appSettings.showCamBtn && camBtn && leftSlot) {
        // mark original parent once
        if (!camBtn.dataset.originalParent) {
          camBtn.dataset.originalParent = camBtn.parentElement ? camBtn.parentElement.id || 'body' : 'body';
        }
        // detach and append
        leftSlot.appendChild(camBtn);
        camBtn.classList.add('header-control', 'header-cam-btn');
      } else if (camBtn && !this.appSettings.showCamBtn) {
        // move back
        try { originalCamParent.appendChild(camBtn); } catch (e) { document.body.appendChild(camBtn); }
        camBtn.classList.remove('header-control', 'header-cam-btn');
      }

      // Place mic on middle-right when showMicBtn true
      if (this.appSettings.showMicBtn && micBtn && rightSlot) {
        if (!micBtn.dataset.originalParent) {
          micBtn.dataset.originalParent = micBtn.parentElement ? micBtn.parentElement.id || 'body' : 'body';
        }
        rightSlot.appendChild(micBtn);
        micBtn.classList.add('header-control', 'header-mic-btn');
      } else if (micBtn && !this.appSettings.showMicBtn) {
        try { originalMicParent.appendChild(micBtn); } catch (e) { document.body.appendChild(micBtn); }
        micBtn.classList.remove('header-control', 'header-mic-btn');
      }

      // Give settings/backspace full size (if they exist)
      const backspace = document.getElementById('btn-backspace') || document.querySelector('[data-action="backspace"]');
      const settingsBtn = document.querySelector('[data-action="open-settings"]') || document.querySelector('#open-settings-btn');
      [backspace, settingsBtn].forEach(el => {
        if (!el) return;
        // remove cramped classes and ensure padding
        el.classList.remove('small-control', 'icon-only');
        el.classList.add('btn-control', 'btn-control-lg');
        el.style.minWidth = '48px';
        el.style.height = '44px';
      });

      // Build the top row of four buttons if all required features enabled
      this._maybeBuildTopRowFourButtons();

    } catch (e) {
      console.warn("repositionCamMicButtons failed", e);
    }
  },

  // Determine whether the top-row four-button bar should be shown
  // This is true when camera, mic, timer, and counter are all enabled and visible.
  areTopBarButtonsEnabled() {
    try {
      const cam = !!this.appSettings.showCamBtn;
      const mic = !!this.appSettings.showMicBtn;
      const timer = !!this.appSettings.showTimerButton;
      const counter = !!this.appSettings.showCounterButton;
      // adjust logic as desired: currently require all four
      return cam && mic && timer && counter;
    } catch (e) {
      return false;
    }
  },

  // Build a single-row of four compact buttons anchored to the top (idempotent)
  _maybeBuildTopRowFourButtons() {
    try {
      const existing = document.getElementById('top-row-4btns');
      if (!this.areTopBarButtonsEnabled()) {
        if (existing) existing.remove();
        return;
      }
      if (existing) {
        // ensure visible
        existing.style.display = 'flex';
        return;
      }

      // Create bar
      const bar = document.createElement('div');
      bar.id = 'top-row-4btns';
      bar.className = 'fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-black bg-opacity-50 rounded-b-lg shadow-lg';
      bar.style.backdropFilter = 'blur(6px)';

      // Button factory
      function makeBtn(id, label, title) {
        const b = document.createElement('button');
        b.id = id;
        b.className = 'py-2 px-3 rounded text-xs font-bold bg-[var(--card-bg)] border border-gray-700 hover:opacity-90';
        b.innerText = label;
        b.title = title || label;
        return b;
      }

      // Build four: Mic, Cam, Timer, Counter
      const micBtn = makeBtn('topbar-mic', 'Mic', 'Microphone');
      const camBtn = makeBtn('topbar-cam', 'Cam', 'Camera');
      const timerBtn = makeBtn('topbar-timer', 'Timer', 'Timer');
      const counterBtn = makeBtn('topbar-counter', 'Count', 'Counter');

      bar.appendChild(micBtn);
      bar.appendChild(camBtn);
      bar.appendChild(timerBtn);
      bar.appendChild(counterBtn);

      document.body.appendChild(bar);

      // Wire actions: delegate to existing controls if present
      micBtn.onclick = () => {
        const real = this._findMicButton();
        if (real) real.click();
        else console.debug('Mic not available');
      };
      camBtn.onclick = () => {
        const real = this._findCamButton();
        if (real) real.click();
        else console.debug('Cam not available');
      };
      timerBtn.onclick = () => {
        const real = document.getElementById('top-left-timer');
        if (real) real.click();
      };
      counterBtn.onclick = () => {
        const real = document.getElementById('top-right-counter');
        if (real) real.click();
      };

    } catch (e) {
      console.warn("_maybeBuildTopRowFourButtons failed", e);
    }
  },

  // Public init for header layout
  initHeaderLayout() {
    try {
      // call reposition once
      this.repositionCamMicButtons();

      // listen for settings changes that affect layout
      if (this.callbacks && typeof this.callbacks.onApply === 'function') {
        // we expect callbacks.onApply to be called when toggles change (wired earlier)
        // but to be safe, observe localStorage changes too (if other windows modify)
        window.addEventListener('storage', (ev) => {
          if (['appSettings.v1','settings.mapping','appSettings'].includes(ev.key)) {
            setTimeout(() => this.repositionCamMicButtons(), 120);
          }
        });
      }

      // Also observe DOM mutations for camera/mic actual buttons (in case loaded later)
      const observer = new MutationObserver((mutations) => {
        // attempt to reposition if cam/mic appear
        this.repositionCamMicButtons();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // Expose the bar build function publicly
      this._maybeBuildTopRowFourButtons();

    } catch (e) {
      console.warn("initHeaderLayout failed", e);
    }
  }

});
// End Section 7
/* =================================================================================================
   SECTION 8 — GESTURE PAD INTERNALS & SENSORS HOOKS
   -------------------------------------------------------------------------------------------------
   Pointer-based recognizer for:
   - multi-finger taps (1..3)
   - multi-tap sequences (double/triple)
   - long taps
   - swipes (L/R/U/D + diagonals)
   Emits CustomEvents: gesture:tap, gesture:swipe, gesture:token, mapping:token
================================================================================================= */

(function () {
  // Ensure helper builders (tapId, swipeId) are available; if not provide small fallbacks
  if (typeof tapId !== 'function' || typeof swipeId !== 'function') {
    // graceful fallback
    window.tapId = window.tapId || function(type, fingers){ return `${type}_${fingers}f`; };
    window.swipeId = window.swipeId || function(dir, fingers){ return `swipe_${dir}_${fingers}f`; };
  }

  const PAD_SELECTOR = '#gesture-pad-canvas';
  const PAD_CONTAINER = document.querySelector(PAD_SELECTOR) || document.getElementById('gesture-pad') || document.getElementById('gesture-pad-container');

  // Internal state
  const state = {
    pointers: new Map(), // pointerId -> {startX, startY, lastX, lastY, startTs}
    lastTapTimestampByFingers: {}, // fingers -> {time, count}
    multiTapTimeouts: {}, // fingers -> timeoutId
    TAP_MAX_MOVE: 20, // px
    TAP_MAX_DURATION: 350, // ms to consider a tap vs long
    LONG_TAP_MIN: 500, // ms
    SWIPE_MIN_DIST: 30, // px
    MULTITAP_WINDOW: 450, // ms between taps for double/triple recognition
    tripleTapCooldown: false
  };

  // Utility: calculate angle and direction
  function angleAndDirection(dx, dy) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Determine primary direction including diagonals (45-degree thresholds)
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return { angle, dir: null };
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    // compute normalized angle 0..360
    let normalized = (angle + 360) % 360;
    // Map to 8 sectors (each 45deg centered)
    // sectors centered at: 0 (right), 45 (up-right), 90 (up), 135 (up-left), 180 (left), 225 (down-left), 270 (down), 315 (down-right)
    if (normalized >= 337.5 || normalized < 22.5) return { angle, dir: 'right' };
    if (normalized >= 22.5 && normalized < 67.5) return { angle, dir: 'up_right' };
    if (normalized >= 67.5 && normalized < 112.5) return { angle, dir: 'up' };
    if (normalized >= 112.5 && normalized < 157.5) return { angle, dir: 'up_left' };
    if (normalized >= 157.5 && normalized < 202.5) return { angle, dir: 'left' };
    if (normalized >= 202.5 && normalized < 247.5) return { angle, dir: 'down_left' };
    if (normalized >= 247.5 && normalized < 292.5) return { angle, dir: 'down' };
    if (normalized >= 292.5 && normalized < 337.5) return { angle, dir: 'down_right' };
    return { angle, dir: null };
  }

  // Helper: dispatch events
  function emit(name, detail) {
    try {
      const ev = new CustomEvent(name, { detail });
      window.dispatchEvent(ev);
    } catch (e) {
      console.warn("emit failed", name, e);
    }
  }

  // Create handler to consume a recognized tap
  function handleRecognizedTap(fingers, tapCount, isLong=false) {
    const type = isLong ? 'long' : (tapCount === 1 ? 'tap' : (tapCount === 2 ? 'double' : (tapCount >= 3 ? 'triple' : 'tap')));
    const token = tapId(isLong ? 'long_tap' : (tapCount === 2 ? 'double_tap' : 'tap'), fingers);
    const detail = { type, fingers, count: tapCount, token };
    emit('gesture:tap', detail);
    emit('gesture:token', { token });
    emit('mapping:token', { token });
  }

  // Consume a recognized swipe
  function handleRecognizedSwipe(direction, fingers, dx, dy) {
    const token = swipeId(direction, fingers);
    const detail = { direction, fingers, token, dx, dy };
    emit('gesture:swipe', detail);
    emit('gesture:token', { token });
    emit('mapping:token', { token });
  }

  // Reset per-finger multi-tap counters after timeout
  function scheduleMultiTapReset(fingers) {
    if (state.multiTapTimeouts[fingers]) clearTimeout(state.multiTapTimeouts[fingers]);
    state.multiTapTimeouts[fingers] = setTimeout(() => {
      state.lastTapTimestampByFingers[fingers] = { time: 0, count: 0 };
      state.multiTapTimeouts[fingers] = null;
    }, state.MULTITAP_WINDOW + 60);
  }

  // Pointer event handlers
  function onPointerDown(ev) {
    try {
      // track pointer
      const p = {
        id: ev.pointerId,
        startX: ev.clientX,
        startY: ev.clientY,
        lastX: ev.clientX,
        lastY: ev.clientY,
        startTs: Date.now(),
        isDown: true
      };
      state.pointers.set(ev.pointerId, p);
    } catch (e) { console.warn("onPointerDown", e); }
  }

  function onPointerMove(ev) {
    try {
      const p = state.pointers.get(ev.pointerId);
      if (!p) return;
      p.lastX = ev.clientX;
      p.lastY = ev.clientY;
    } catch (e) { /* ignore */ }
  }

  function onPointerUp(ev) {
    try {
      const p = state.pointers.get(ev.pointerId);
      if (!p) return;
      const now = Date.now();
      const duration = now - (p.startTs || now);
      // compute bounding box across all active pointers that were involved in this gesture
      // We consider finger count as the max number of pointers that were down during this gesture.
      // For simplicity, use current active pointers count + this one (most common)
      const fingers = Math.min(3, Math.max(1, (state.pointers.size)));
      // compute average start and end positions for multi-pointer gestures
      let startX = p.startX, startY = p.startY, endX = p.lastX, endY = p.lastY;
      // For multi-pointer, compute min/max across pointers to evaluate movement
      if (state.pointers.size > 1) {
        let sx = 0, sy = 0, ex = 0, ey = 0, cnt = 0;
        state.pointers.forEach((pp) => {
          sx += (pp.startX || pp.lastX);
          sy += (pp.startY || pp.lastY);
          ex += (pp.lastX || pp.startX);
          ey += (pp.lastY || pp.startY);
          cnt++;
        });
        if (cnt) {
          startX = sx / cnt;
          startY = sy / cnt;
          endX = ex / cnt;
          endY = ey / cnt;
        }
      }

      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.hypot(dx, dy);

      // remove pointer
      state.pointers.delete(ev.pointerId);

      // Long tap detection
      if (duration >= state.LONG_TAP_MIN && dist < state.TAP_MAX_MOVE) {
        // treat as long tap single count (but allow multi-finger long tap as well)
        // For multi-finger long tap, we interpret as long_tap with that many fingers
        handleRecognizedTap(fingers, 1, true);
        return;
      }

      // Tap vs Swipe discrimination
      if (dist < state.TAP_MAX_MOVE && duration <= state.TAP_MAX_DURATION) {
        // It's a tap — handle multi-tap counting for this fingers count
        const prev = state.lastTapTimestampByFingers[fingers] || { time: 0, count: 0 };
        const nowTs = Date.now();

        if (prev.time && (nowTs - prev.time) <= state.MULTITAP_WINDOW) {
          // within multi-tap window => increment
          const newCount = Math.min(3, prev.count + 1);
          state.lastTapTimestampByFingers[fingers] = { time: nowTs, count: newCount };
          scheduleMultiTapReset(fingers);

          // If we've reached triple (3) immediately emit; otherwise emit for 1/2 as they come
          handleRecognizedTap(fingers, newCount, false);

          // For triple-tap cooldown management (used by Section 6), emit triple specially
          if (newCount === 3) {
            // extra triple event detail (same as gesture:tap with count 3)
            emit('gesture:tap', { type: 'triple', fingers, count: 3, token: tapId('tap', fingers) });
          }
        } else {
          // fresh first tap
          state.lastTapTimestampByFingers[fingers] = { time: nowTs, count: 1 };
          scheduleMultiTapReset(fingers);
          handleRecognizedTap(fingers, 1, false);
        }
        return;
      }

      // If movement large enough and mostly directional → interpret as swipe
      if (dist >= state.SWIPE_MIN_DIST) {
        const ad = angleAndDirection(dx, dy);
        const dir = ad.dir;
        if (dir) {
          handleRecognizedSwipe(dir, fingers, dx, dy);
          return;
        }
      }

      // Fallback: treat as a tap if nothing else matched
      handleRecognizedTap(fingers, 1, false);

    } catch (e) {
      console.warn("onPointerUp error", e);
      try { state.pointers.delete(ev.pointerId); } catch (e) {}
    }
  }

  // Cancel pointer (e.g., pointercancel)
  function onPointerCancel(ev) {
    try {
      state.pointers.delete(ev.pointerId);
    } catch (e) {}
  }

  // Long-press global detection on pad (for custom long-press actions)
  // (Not used directly here but exposed as utility)
  function detectLongPress(targetEl, callback, ms = 700) {
    if (!targetEl || typeof callback !== 'function') return;
    let timeoutId = null;
    const start = (e) => {
      timeoutId = setTimeout(() => callback(e), ms);
    };
    const end = () => {
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    };
    targetEl.addEventListener('pointerdown', start);
    targetEl.addEventListener('pointerup', end);
    targetEl.addEventListener('pointercancel', end);
    return () => {
      targetEl.removeEventListener('pointerdown', start);
      targetEl.removeEventListener('pointerup', end);
      targetEl.removeEventListener('pointercancel', end);
    };
  }

  // Wire to PAD (idempotent)
  function attachPadListeners() {
    try {
      const pad = document.querySelector(PAD_SELECTOR) || document.getElementById('gesture-pad-canvas') || document.getElementById('gesture-pad');
      if (!pad) {
        // if pad not present, still wire to document for global gestures (fallback)
        if (!window.__gesturePad_global_wired__) {
          document.addEventListener('pointerdown', onPointerDown, { passive: true });
          document.addEventListener('pointermove', onPointerMove, { passive: true });
          document.addEventListener('pointerup', onPointerUp, { passive: true });
          document.addEventListener('pointercancel', onPointerCancel, { passive: true });
          window.__gesturePad_global_wired__ = true;
        }
        return;
      }

      // Avoid double attaching
      if (pad.__gesturePadWired) return;
      pad.__gesturePadWired = true;

      // use passive listeners where possible
      pad.addEventListener('pointerdown', onPointerDown, { passive: true });
      pad.addEventListener('pointermove', onPointerMove, { passive: true });
      pad.addEventListener('pointerup', onPointerUp, { passive: true });
      pad.addEventListener('pointercancel', onPointerCancel, { passive: true });

      // Also wire global listeners so multi-finger gestures that start off-pad are still detected
      if (!window.__gesturePad_global_wired__) {
        document.addEventListener('pointerdown', onPointerDown, { passive: true });
        document.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('pointerup', onPointerUp, { passive: true });
        document.addEventListener('pointercancel', onPointerCancel, { passive: true });
        window.__gesturePad_global_wired__ = true;
      }

      // Expose long-press handler on pad for other modules
      pad.__gesturePadDetectLongPress = detectLongPress(pad, (e) => {
        // dispatch a custom long-press event for apps to use
        emit('gesture:longpress', { x: e.clientX, y: e.clientY });
      }, 700);

    } catch (e) {
      console.warn("attachPadListeners failed", e);
    }
  }

  // Auto-attach on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      try { attachPadListeners(); } catch (e) { console.warn("attachPadListeners exec failed", e); }
    }, 80);
  });

  // Expose small API for app.js to simulate tokens or read state
  globalThis.gesturePad = globalThis.gesturePad || {};
  Object.assign(globalThis.gesturePad, {
    attachPadListeners,
    handleRecognizedTap,
    handleRecognizedSwipe,
    state,
    emitToken: (token) => {
      emit('gesture:token', { token });
      emit('mapping:token', { token });
    }
  });

})();
/* =================================================================================================
   SECTION 9 — PRACTICE MODE START BUTTON SYSTEM + AUTOPLAY SAFETY GUARDS
   -------------------------------------------------------------------------------------------------
   This provides:
   - A central "Practice Start" button overlay
   - Automatic appearance when:
       * practice mode enabled AND
       * settings menu is open OR game not started yet
   - Automatic disappearance when the user taps Start
   - Reliable hooks for app.js:
       * settingsManager.practiceGuard()
       * settingsManager.practiceShowStartButton()
       * settingsManager.practiceHideStartButton()
       * settingsManager.practiceSetState()
   - Prevents autoplay & unique rounds from triggering early
================================================================================================= */

Object.assign(SettingsManager.prototype, {

  /* ---------------------------------------------------------------------------
     Internal practice-mode state machine
     ---------------------------------------------------------------------------*/
  practiceState: {
    modeEnabled: false,     // whether practice toggle is ON
    gameActive: false,      // whether user has tapped Start
    awaitingStart: false,   // whether Start button should be visible
    settingsOpen: false,    // set via settings modal hooks
    lastHideTs: 0
  },

  /* ---------------------------------------------------------------------------
     Initialize practice-mode integration
     ---------------------------------------------------------------------------*/
  initPracticeModeIntegration() {
    try {
      // build DOM cache if needed
      this.buildDomCache();

      // create start overlay if not present
      this._ensurePracticeStartButton();

      // load state
      this.practiceState.modeEnabled = !!this.appSettings.practiceMode;

      // observe settings open/close via callbacks attached in Section 1
      if (this.callbacks) {
        if (typeof this.callbacks.onSettingsOpen === 'function') {
          this.callbacks.onSettingsOpen(() => {
            this.practiceState.settingsOpen = true;
            if (this.practiceState.modeEnabled) {
              // force the Start button to reappear when settings are open
              this.practiceShowStartButton(true);
            }
          });
        }
        if (typeof this.callbacks.onSettingsClose === 'function') {
          this.callbacks.onSettingsClose(() => {
            this.practiceState.settingsOpen = false;
            // if user has already started game, hide; otherwise show
            if (this.practiceState.modeEnabled && !this.practiceState.gameActive) {
              this.practiceShowStartButton(true);
            } else if (this.practiceState.modeEnabled && this.practiceState.gameActive) {
              this.practiceHideStartButton();
            }
          });
        }
      }

      // toggle binder (practice toggle in UI)
      this._bindPracticeToggleWatcher();

      // Expose integration for app.js
      this._exposePracticeAPI();

    } catch (e) {
      console.warn("initPracticeModeIntegration failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     Bind practice toggle changes from settings UI
     --------------------------------------------------------------------------- */
  _bindPracticeToggleWatcher() {
    try {
      // whenever settings apply occurs, update mode
      if (this.callbacks && typeof this.callbacks.onApply === 'function') {
        const oldApply = this.callbacks.onApply;
        this.callbacks.onApply = (...args) => {
          oldApply(...args);
          this.practiceState.modeEnabled = !!this.appSettings.practiceMode;

          if (!this.practiceState.modeEnabled) {
            // if practice disabled entirely, ensure everything is active
            this.practiceState.gameActive = true;
            this.practiceHideStartButton(true);
          } else {
            // if enabling practice mode while settings open:
            if (this.practiceState.settingsOpen) {
              this.practiceState.gameActive = false;
              this.practiceShowStartButton(true);
            } else {
              // normal flow: require manual start
              this.practiceState.gameActive = false;
              this.practiceShowStartButton(true);
            }
          }
        };
      }
    } catch (e) {
      console.warn("_bindPracticeToggleWatcher failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     Build Start button overlay
     --------------------------------------------------------------------------- */
  _ensurePracticeStartButton() {
    try {
      if (document.getElementById('practice-start-overlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'practice-start-overlay';
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '6000';
      overlay.style.background = 'transparent';

      const btn = document.createElement('button');
      btn.id = 'practice-start-btn';
      btn.textContent = 'Start';
      btn.style.fontSize = '2rem';
      btn.style.padding = '1rem 2rem';
      btn.style.borderRadius = '1rem';
      btn.style.background = 'var(--accent)';
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
      btn.style.opacity = '0.92';
      btn.style.boxShadow = '0 0 10px rgba(0,0,0,0.45)';

      overlay.appendChild(btn);
      document.body.appendChild(overlay);

      btn.addEventListener('click', () => {
        this.practiceState.gameActive = true;
        this.practiceHideStartButton();
        // notify app.js
        window.dispatchEvent(new CustomEvent('practice:start', {}));
      });

      overlay.style.display = 'none';

    } catch (e) {
      console.warn("_ensurePracticeStartButton failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     Show Start button overlay
     --------------------------------------------------------------------------- */
  practiceShowStartButton(force=false) {
    try {
      if (!this.practiceState.modeEnabled) return;

      const overlay = document.getElementById('practice-start-overlay');
      if (!overlay) return;

      // Debounce to prevent flicker
      const now = Date.now();
      if (!force && now - this.practiceState.lastHideTs < 150) return;

      this.practiceState.awaitingStart = true;
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';

    } catch (e) {
      console.warn("practiceShowStartButton failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     Hide Start button overlay
     --------------------------------------------------------------------------- */
  practiceHideStartButton(force=false) {
    try {
      const overlay = document.getElementById('practice-start-overlay');
      if (!overlay) return;

      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';

      this.practiceState.awaitingStart = false;
      this.practiceState.lastHideTs = Date.now();

    } catch (e) {
      console.warn("practiceHideStartButton failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     API for app.js to set / sync game states
     --------------------------------------------------------------------------- */
  practiceSetState({ won=false, lost=false } = {}) {
    try {
      if (!this.practiceState.modeEnabled) return;

      this.practiceState.gameActive = false;

      // After win or loss, return to Start
      this.practiceShowStartButton(true);

      // Notify app.js
      window.dispatchEvent(new CustomEvent('practice:ended', {
        detail: { won, lost }
      }));

    } catch (e) {
      console.warn("practiceSetState failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     Guard used by app.js before autoplay, before step-advance, before unique rounds.
     Returns true if blocked.
     --------------------------------------------------------------------------- */
  practiceGuard() {
    try {
      if (!this.practiceState.modeEnabled) return false;

      // If Start not pressed, block everything
      if (!this.practiceState.gameActive || this.practiceState.settingsOpen) {
        this.practiceShowStartButton();
        return true;
      }
      return false;

    } catch (e) {
      console.warn("practiceGuard failed", e);
      return false;
    }
  },

  /* ---------------------------------------------------------------------------
     Expose clean API for app.js
     --------------------------------------------------------------------------- */
  _exposePracticeAPI() {
    try {
      globalThis.practiceAPI = globalThis.practiceAPI || {};

      Object.assign(globalThis.practiceAPI, {
        guard: () => this.practiceGuard(),
        showStart: (force=false) => this.practiceShowStartButton(force),
        hideStart: (force=false) => this.practiceHideStartButton(force),
        setEnded: (opts) => this.practiceSetState(opts),
        state: this.practiceState
      });

    } catch (e) {
      console.warn("_exposePracticeAPI failed", e);
    }
  }

});
// End Section 9
/* =================================================================================================
   SECTION 10 — AUTOPLAY MANAGER (unique rounds timing rewrite, timer queue, no-freeze)
   -------------------------------------------------------------------------------------------------
   Provides a deterministic autoplay scheduler and API for app.js.
   Fixes:
   - unique rounds autoplay replay-after-every-input bug
   - freezes caused by overlapped timers when auto-clear is enabled
================================================================================================= */

(function () {
  if (globalThis.autoplayManager && globalThis.autoplayManager._initialized) {
    // already loaded
    return;
  }

  const manager = {
    _timers: new Set(),
    _playing: false,
    _initialized: false,
    _callbacks: null,
    _lastPlayToken: 0,
    _playLock: false
  };

  // Clear all scheduled timers (safe)
  manager._clearTimers = function () {
    try {
      this._timers.forEach(id => {
        try { clearTimeout(id); } catch (e) {}
      });
      this._timers.clear();
    } catch (e) { console.warn("autoplay._clearTimers failed", e); }
  };

  // Schedule a single timeout and track it
  manager._schedule = function (fn, delay) {
    const id = setTimeout(() => {
      try { fn(); } catch (e) { console.warn("scheduled fn error", e); }
      this._timers.delete(id);
    }, delay);
    this._timers.add(id);
    return id;
  };

  // Internal: play one sequence step with proper spacing (haptic pause considered)
  manager._playStep = function (idx, value, baseDelay, stepIndexCallback) {
    // baseDelay: computed from playbackSpeed and pause settings
    this._schedule(() => {
      try {
        if (stepIndexCallback) stepIndexCallback(idx, value);
      } catch (e) { console.warn("stepIndexCallback error", e); }
    }, baseDelay);
  };

  // Play an entire sequence once, respecting playbackSpeed and gesturePause (haptic pause)
  // Returns a promise that resolves when playback completes.
  manager._playSequenceOnce = function (sequence, settings) {
    const self = this;
    return new Promise((resolve) => {
      try {
        if (!sequence || sequence.length === 0) {
          resolve();
          return;
        }
        // If playback disabled, resolve immediately
        if (!settings || !settings.isAutoplayEnabled) {
          resolve();
          return;
        }

        // Calculate base delays:
        // playbackSpeed: 1.0 is normal; we'll interpret this as (base ms) = 400ms / speed
        // gesturePause: extra pause (in seconds) appended between symbols (converted to ms)
        const baseMsPerItem = Math.max(80, Math.floor(400 / Math.max(0.25, settings.playbackSpeed || 1.0)));
        const pauseMs = Math.floor((settings.gesturePause || 0.2) * 1000);

        // Create a unique token so if playSequence is called again concurrently, we can ignore older plays
        const token = ++self._lastPlayToken;
        self._playing = true;

        // notify start lifecycle if provided
        if (self._callbacks && typeof self._callbacks.onSequenceStart === 'function') {
          try { self._callbacks.onSequenceStart(sequence); } catch (e) {}
        }

        let acc = 0;
        sequence.forEach((val, idx) => {
          // schedule each step in order
          const delay = acc;
          const playFn = () => {
            // ignore if superseded by newer token
            if (token !== self._lastPlayToken) return;
            if (self._callbacks && typeof self._callbacks.onPlayStep === 'function') {
              try { self._callbacks.onPlayStep(idx, val); } catch (e) {}
            }
          };

          // schedule step
          self._schedule(playFn, delay);

          // advance accumulator by base + optional pause
          acc += baseMsPerItem + pauseMs;
        });

        // schedule end-of-sequence callback
        const endDelay = acc + 10;
        self._schedule(() => {
          if (token !== self._lastPlayToken) {
            resolve();
            return;
          }
          self._playing = false;
          // lifecycle
          if (self._callbacks && typeof self._callbacks.onSequenceEnd === 'function') {
            try { self._callbacks.onSequenceEnd(sequence); } catch (e) {}
          }
          resolve();
        }, endDelay);

      } catch (e) {
        console.warn("playSequenceOnce error", e);
        self._playing = false;
        resolve();
      }
    });
  };

  // Decide whether autoplay should auto-play at given times:
  // - on round start (always allowed if autoplay ON)
  // - after player completes full input (unique mode): if autoClear enabled, we may auto-advance and play next sequence
  // This function is meant to be called by app.js at key points.
  manager.shouldPlayAtEvent = function (eventName, contextualInfo = {}) {
    // eventName: 'roundStart' | 'playerCompletedFullInput' | 'manualReplay'
    const cb = this._callbacks;
    if (!cb || typeof cb.getSettings !== 'function') return false;
    const s = cb.getSettings();
    if (!s || !s.isAutoplayEnabled) return false;

    const mode = (cb.getMode && typeof cb.getMode === 'function') ? cb.getMode() : (contextualInfo.mode || 'simon');

    if (eventName === 'roundStart') {
      // always play at start of the new sequence if autoplay enabled
      return true;
    }

    if (eventName === 'playerCompletedFullInput') {
      if (mode === 'unique') {
        // In unique mode we should NOT auto-play after each input.
        // Only if autoClear is enabled AND the manager is allowed by app logic to generate a new sequence and start it.
        // The app must call manager.playNextIfNeeded() to handle that case.
        return false;
      } else {
        // In simon mode, after player completes input, autoplay may play next sequence depending on app logic.
        return false;
      }
    }

    if (eventName === 'manualReplay') return true;

    return false;
  };

  // Public: request to play current sequence once
  manager.playSequence = async function () {
    // cancel previously scheduled timers and mark new token
    this._clearTimers();
    const cb = this._callbacks;
    if (!cb || typeof cb.getSequence !== 'function' || typeof cb.getSettings !== 'function') return;
    const seq = cb.getSequence() || [];
    const settings = cb.getSettings();
    try {
      await this._playSequenceOnce(seq, settings);
    } catch (e) {
      console.warn("playSequence failed", e);
    }
  };

  // Called after player has completed full input in unique mode — app should call this to allow auto-advance to happen
  // If auto-clear is enabled, manager will request the app to advance/clear (via callback notifyAutoClearRequest),
  // then schedule a small delay and optionally play the new sequence after the app updates its sequence.
  manager.playNextIfNeeded = async function () {
    const cb = this._callbacks;
    if (!cb) return;

    const settings = cb.getSettings ? cb.getSettings() : {};
    const mode = cb.getMode ? cb.getMode() : 'simon';

    // Only relevant for unique mode
    if (mode !== 'unique') return;

    // If auto-advance-clear disabled, do nothing
    if (!settings.isUniqueRoundsAutoClearEnabled) return;

    // Ask the app to clear/advance the sequence now (app should synchronously update sequence)
    if (cb.notifyAutoClearRequest && typeof cb.notifyAutoClearRequest === 'function') {
      try { cb.notifyAutoClearRequest(); } catch (e) { console.warn("notifyAutoClearRequest failed", e); }
    }

    // Cancel existing timers before scheduling new play
    this._clearTimers();

    // Small safety delay to let app update state (e.g., add a new unique item)
    const safetyDelayMs = Math.max(120, Math.floor(400 / Math.max(0.5, settings.playbackSpeed || 1.0)));
    // After that, play the current sequence once
    this._schedule(async () => {
      // Re-fetch sequence & settings
      const seq = (cb.getSequence && cb.getSequence()) || [];
      const s2 = (cb.getSettings && cb.getSettings()) || settings;
      try {
        await this._playSequenceOnce(seq, s2);
      } catch (e) { console.warn("playNextIfNeeded.playSequence failed", e); }
    }, safetyDelayMs);
  };

  // Stop and reset manager
  manager.stop = function () {
    this._clearTimers();
    this._playing = false;
    this._lastPlayToken++;
  };

  // Init must be called by app to wire callbacks
  manager.init = function (callbacks = {}) {
    if (this._initialized) {
      // allow rebinding callbacks safely
      this._callbacks = callbacks;
      return;
    }
    this._callbacks = callbacks;
    this._initialized = true;

    // If settings provide a guard (practice), respect it: app should call practiceGuard before invoking playback
    // No automatic binding here; app controls when to call playSequence

    // expose debug helpers
    this._debug = () => ({ playing: this._playing, timers: Array.from(this._timers).length });

    // attach to global
    globalThis.autoplayManager = this;
    this._initialized = true;
  };

  // Expose manager
  globalThis.autoplayManager = manager;
  globalThis.autoplayManager._initialized = true;

})();
/* =================================================================================================
   SECTION 11 — AUTOPLAY INTEGRATION, APP HOOKS, AND MIGRATION UTILITIES
   -------------------------------------------------------------------------------------------------
   - Connects autoplayManager to the practice guard to prevent unwanted playback
   - Provides helper functions for app.js to call at lifecycle moments:
       * onRoundStart
       * onPlayerCompletedInput
       * onManualReplayRequested
       * onGameWon / onGameLost
   - Migration helpers for older settings keys
================================================================================================= */

Object.assign(SettingsManager.prototype, {

  /* ---------------------------------------------------------------------------
     Wire autoplay manager with practice guard and provide lifecycle helpers
     ---------------------------------------------------------------------------*/
  initAutoplayIntegration() {
    try {
      // Ensure autoplayManager exists
      if (!globalThis.autoplayManager) {
        console.warn("autoplayManager not present; ensure Section 10 loaded.");
        return;
      }

      const manager = globalThis.autoplayManager;

      // Provide callback wiring for manager to call into app via settings callbacks
      // We expect app.js to call settingsManager.registerAutoplayAppCallbacks with functions below
      this._autoplayAppCallbacks = this._autoplayAppCallbacks || {};

      // Provide method to register app-specific callbacks (app.js must call this)
      this.registerAutoplayAppCallbacks = (callbacks = {}) => {
        // callbacks: onPlayStep, onSequenceStart, onSequenceEnd, getSequence, getMode, getSettings, notifyAutoClearRequest, notifyInputComplete
        manager.init({
          onPlayStep: callbacks.onPlayStep || function () {},
          onSequenceStart: callbacks.onSequenceStart || function () {},
          onSequenceEnd: callbacks.onSequenceEnd || function () {},
          getSequence: callbacks.getSequence || function () { return []; },
          getMode: callbacks.getMode || function () { return 'simon'; },
          getSettings: callbacks.getSettings || (() => ({
            isAutoplayEnabled: this.appSettings.isAutoplayEnabled,
            isUniqueRoundsAutoClearEnabled: this.appSettings.isUniqueRoundsAutoClearEnabled,
            playbackSpeed: this.appSettings.playbackSpeed,
            gesturePause: this.appSettings.gesturePause
          })),
          notifyAutoClearRequest: callbacks.notifyAutoClearRequest || function () {},
        });

        // Save for later reference
        this._autoplayAppCallbacks = callbacks;
      };

      // Exposed lifecycle helpers app.js should call at appropriate times:

      /**
       * Call when a new round starts (sequence generated or advanced).
       * If practice guard blocks, manager will not auto-play.
       */
      this.onRoundStart = async () => {
        try {
          // practice guard blocks autoplay until user presses Start
          if (this.practiceGuard && this.practiceGuard()) {
            return;
          }
          // request autoplay to play sequence once
          if (globalThis.autoplayManager) {
            await globalThis.autoplayManager.playSequence();
          }
        } catch (e) { console.warn("onRoundStart error", e); }
      };

      /**
       * Call when player has finished entering the required inputs for a round.
       * In unique mode, app should call manager.playNextIfNeeded() to let autoplay handle next round (if enabled).
       */
      this.onPlayerCompletedInput = async () => {
        try {
          if (this.practiceGuard && this.practiceGuard()) return;
          // If unique mode, delegate to autoplay manager
          if (globalThis.autoplayManager && typeof globalThis.autoplayManager.playNextIfNeeded === 'function') {
            await globalThis.autoplayManager.playNextIfNeeded();
          }
        } catch (e) { console.warn("onPlayerCompletedInput error", e); }
      };

      /**
       * Manual replay (user pressed replay). Honor practice guard.
       */
      this.onManualReplayRequested = async () => {
        try {
          if (this.practiceGuard && this.practiceGuard()) return;
          if (globalThis.autoplayManager) await globalThis.autoplayManager.playSequence();
        } catch (e) { console.warn("onManualReplayRequested error", e); }
      };

      /**
       * Game ended (win/loss). Expose to practice manager to re-show start button and stop autoplay timers.
       */
      this.onGameEnded = (opts = {}) => {
        try {
          // stop autoplay timers
          if (globalThis.autoplayManager) globalThis.autoplayManager.stop();
          // if practice mode, show start overlay
          if (this.practiceState && this.practiceState.modeEnabled) {
            this.practiceSetState(opts);
          }
        } catch (e) { console.warn("onGameEnded error", e); }
      };

    } catch (e) {
      console.warn("initAutoplayIntegration failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     Migration helpers to safely upgrade older appSettings shapes to new format
     ---------------------------------------------------------------------------*/
  migrateOldSettings() {
    try {
      // Example: old settings used 'showWelcomeScreen' differently; ensure keys exist
      if (typeof this.appSettings.isAutoplayEnabled === 'undefined' && typeof this.appSettings.autoplay !== 'undefined') {
        this.appSettings.isAutoplayEnabled = !!this.appSettings.autoplay;
      }
      // Old 'theme' key
      if (!this.appSettings.theme && this.appSettings.activeTheme) {
        this.appSettings.theme = this.appSettings.activeTheme;
      }
      // Ensure gesturePause numeric type
      if (typeof this.appSettings.gesturePause === 'string') {
        this.appSettings.gesturePause = parseFloat(this.appSettings.gesturePause) || 0.2;
      }
      // Ensure mapping object exists
      if (!this.appSettings.gestureMappings && globalThis.settings && globalThis.settings.mapping) {
        this.appSettings.gestureMappings = JSON.parse(JSON.stringify(globalThis.settings.mapping));
      }

      // Persist any migrations
      this.persistSettings();
    } catch (e) {
      console.warn("migrateOldSettings failed", e);
    }
  },

  /* ---------------------------------------------------------------------------
     Final app integration helper: initialize all remaining integrations
     ---------------------------------------------------------------------------*/
  finalizeIntegration() {
    try {
      // migrate legacy settings
      this.migrateOldSettings();

      // initialize practice+gesture
      this.initPracticeAndGestureSystems();

      // initialize autoplay integration
      this.initAutoplayIntegration();

      // init header layout
      this.initHeaderLayout();

      // ensure mapping registration
      if (globalThis.mappingAPI && typeof globalThis.mappingAPI.registerSettingsManager === 'function') {
        try { globalThis.mappingAPI.registerSettingsManager(this); } catch (e) {}
      }

      // ensure timer/counter initialized
      this.initTimerCounterBehavior();

    } catch (e) {
      console.warn("finalizeIntegration failed", e);
    }
  }

});

// End Section 11
/* =================================================================================================
   SECTION 12 — FINAL INITIALIZATION, EXPORTS, AND FULL APP INTEGRATION CHECKLIST
================================================================================================= */

(function () {

  // Prevent double instantiation
  if (window.settingsManager && window.settingsManager.__initializedFinal) {
    return;
  }

  // Create manager instance if missing
  window.settingsManager = window.settingsManager || new SettingsManager();

  const sm = window.settingsManager;

  /* ---------------------------------------------------------------------------
       FINAL INIT WRAPPER
     --------------------------------------------------------------------------- */

  sm.initializeAll = function () {
    try {
      // 1) Build DOM cache first
      sm.buildDomCache();

      // 2) Load + migrate settings
      sm.loadSettings();
      sm.migrateOldSettings();

      // 3) Initialize core UI tabs
      sm.initGeneralSettingsTab();
      sm.initPlaybackSettingsTab();
      sm.initStealthSettingsTab();
      sm.initMappingTab();             // Section 3
      sm.initInputOnlyToggle();        // Section 5
      sm.initGesturePadFeature();      // Section 6
      sm.initTimerCounterSettings();   // Section 4
      sm.initHeaderLayout();           // Section 7

      // 4) Practice mode & gesture pad sensors
      sm.initPracticeModeIntegration(); // Section 9
      if (window.gesturePad && typeof window.gesturePad.attachPadListeners === 'function') {
        window.gesturePad.attachPadListeners(); // Section 8
      }

      // 5) Autoplay integration
      sm.initAutoplayIntegration(); // Section 11

      // 6) Connect Settings → Gesture Mapping → Help Guide
      if (window.mappingAPI && typeof window.mappingAPI.registerSettingsManager === 'function') {
        window.mappingAPI.registerSettingsManager(sm);
      }

      // 7) Timer / Counter controllers
      sm.initTimerCounterBehavior();

      // 8) Persist updated defaults
      sm.persistSettings();

      // 9) Safety: Mark fully initialized
      sm.__initializedFinal = true;

      // 10) Emit global “ready”
      window.dispatchEvent(new CustomEvent('settings:ready', {
        detail: { manager: sm }
      }));

    } catch (e) {
      console.warn("SettingsManager.initializeAll failed", e);
    }
  };

  /* ---------------------------------------------------------------------------
       AUTO-INITIALIZE ON DOM READY
     --------------------------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Give PWA some time to mount UI
      setTimeout(() => sm.initializeAll(), 30);
    } catch (e) {
      console.warn("settings.js global init failed", e);
    }
  });

  /* ---------------------------------------------------------------------------
       GLOBAL EXPORTS
     --------------------------------------------------------------------------- */

  window.settingsManager = sm;
  window.getSettings = () => sm.appSettings;
  window.setSettings = (obj) => {
    try {
      Object.assign(sm.appSettings, obj || {});
      sm.persistSettings();
      sm.initializeAll(); // re-apply
    } catch (e) { console.warn("setSettings failed", e); }
  };

  /* ---------------------------------------------------------------------------
     FINAL APP INTEGRATION CHECKLIST (for app.js developer)
     ---------------------------------------------------------------------------

     app.js MUST do the following:

     1) Wait for SettingsManager to be ready:
        window.addEventListener('settings:ready', () => {
          // safe to initialize gameplay / sequence engine
        });

     2) Register autoplay callbacks:
        settingsManager.registerAutoplayAppCallbacks({
          onPlayStep: (idx, value) => { ... highlight/play ... },
          onSequenceStart: (seq) => { ... },
          onSequenceEnd: (seq) => { ... },
          getSequence: () => currentSequence,
          getMode: () => currentMode,        // "unique" or "simon"
          getSettings: () => ({
            isAutoplayEnabled: appSettings.isAutoplayEnabled,
            isUniqueRoundsAutoClearEnabled: appSettings.isUniqueRoundsAutoClearEnabled,
            playbackSpeed: appSettings.playbackSpeed,
            gesturePause: appSettings.gesturePause
          }),
          notifyAutoClearRequest: () => {
            // app must clear/extend sequence in unique mode
          }
        });

     3) On each new round:
        await settingsManager.onRoundStart();

     4) When player completes full input:
        await settingsManager.onPlayerCompletedInput();

     5) When user presses manual replay:
        await settingsManager.onManualReplayRequested();

     6) On game win/loss:
        settingsManager.onGameEnded({ won: true });   // or lost: true

     7) Every input cycle must respect the practice guard:
        if (settingsManager.practiceGuard()) return;

     8) If gesture pad is enabled (3-finger triple tap toggle):
        The gesturePad emits:
           gesture:token
           mapping:token
        app.js should subscribe to one of these.

     --------------------------------------------------------------------------- */

})(); // end SECTION 12 wrapper
