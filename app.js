// app.js (merged - Version B style for UI + Input engine)
// Full, complete file. Drop-in replacement for your app's app.js.
// Works with settings.js, sensors.js, mappingAPI, gesturePad, and autoplayManager.

// ----------------------------- Boot / Globals -----------------------------
const App = (function () {
  // internal state
  const state = {
    sequence: [],            // current sequence array (numbers or letters)
    userInput: [],           // inputs user has entered this round
    roundActive: false,      // whether round is currently in play (autoplay or user input active)
    mode: 'simon',           // 'simon' or 'unique'
    inputType: 'key9',       // 'key9' | 'key12' | 'piano'
    machines: 1,
    sequenceLength: 20,
    playbackChunk: 3,
    uniqueRoundIndex: 0,     // index used for unique rounds progression
    awaitingNextUnique: false,
    isPractice: false,
    lastTriggeredFrom: null  // source of last input (mapping token, button, etc.)
  };

  // convenience refs
  const dom = {};

  // expose for debugging
  window._APP_STATE = state;

  // ------------------------ Utility Functions ------------------------

  function $(id) { return document.getElementById(id); }
  function q(selector) { return document.querySelector(selector); }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function log(...args) { console.debug('[APP]', ...args); }
  function warn(...args) { console.warn('[APP]', ...args); }

  // small sleep helper
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  // Format value safely to display (numbers or letters)
  function formatInputValue(v) { return String(v); }

  // ------------------------ DOM Creation: pads ------------------------

  function createKeypad9(container) {
    container.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
      const btn = document.createElement('button');
      btn.className = 'pad-btn p-4 rounded-lg font-bold text-xl';
      btn.dataset.value = String(i);
      btn.id = `pad-key9-${i}`;
      btn.textContent = String(i);
      container.appendChild(btn);
    }
  }

  function createKeypad12(container) {
    container.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const btn = document.createElement('button');
      btn.className = 'pad-btn p-3 rounded-lg font-bold text-lg';
      btn.dataset.value = String(i);
      btn.id = `pad-key12-${i}`;
      btn.textContent = String(i);
      container.appendChild(btn);
    }
  }

  function createPiano(container) {
    container.innerHTML = '';
    const notes = ['C','D','E','F','G','A','B'];
    const pianoArea = document.createElement('div');
    pianoArea.className = 'flex gap-1';
    // 5 numeric region for your 1..5 config then notes
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement('button');
      btn.className = 'piano-btn py-4 px-3 rounded-md text-sm font-bold';
      btn.dataset.value = String(i);
      btn.id = `pad-piano-${i}`;
      btn.textContent = String(i);
      pianoArea.appendChild(btn);
    }
    notes.forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'piano-btn py-4 px-3 rounded-md text-sm font-bold';
      btn.dataset.value = n;
      btn.id = `pad-piano-${n}`;
      btn.textContent = n;
      pianoArea.appendChild(btn);
    });

    container.appendChild(pianoArea);
  }

  // Ensure pads exist in DOM from index.html container references
  function ensurePads() {
    dom.padKey9 = $('pad-key9');
    dom.padKey12 = $('pad-key12');
    dom.padPiano = $('pad-piano');

    if (!dom.padKey9) {
      // create a container
      const el = document.createElement('div');
      el.id = 'pad-key9';
      el.className = 'w-full grid grid-cols-3 gap-3';
      $('input-footer') && $('input-footer').insertBefore(el, $('input-footer').firstChild);
      dom.padKey9 = el;
    }
    if (!dom.padKey12) {
      const el = document.createElement('div');
      el.id = 'pad-key12';
      el.className = 'w-full grid grid-cols-4 gap-3 hidden';
      $('input-footer') && $('input-footer').appendChild(el);
      dom.padKey12 = el;
    }
    if (!dom.padPiano) {
      const el = document.createElement('div');
      el.id = 'pad-piano';
      el.className = 'w-full hidden';
      $('input-footer') && $('input-footer').appendChild(el);
      dom.padPiano = el;
    }

    // populate
    createKeypad9(dom.padKey9);
    createKeypad12(dom.padKey12);
    createPiano(dom.padPiano);
  }

  // ------------------------ UI Update / Render ------------------------

  function showInputMode(mode) {
    state.inputType = mode;
    if (!dom.padKey9) ensurePads();
    dom.padKey9.classList.toggle('hidden', mode !== 'key9');
    dom.padKey12.classList.toggle('hidden', mode !== 'key12');
    dom.padPiano.classList.toggle('hidden', mode !== 'piano');

    // ensure gesture pad visible only if gestures mode and appSetting allow
    if (window.settingsManager && settingsManager.appSettings.isGesturesEnabled) {
      // keep existing gesture pad visibility state
      if (settingsManager.appSettings._gesturePadVisible) settingsManager.showGesturePad();
    } else {
      // disable gesture pad
      settingsManager && settingsManager.hideGesturePad && settingsManager.hideGesturePad();
    }
  }

  // Render sequence visualization (simple)
  function renderSequence() {
    const visuals = $('sequence-visuals');
    if (!visuals) return;
    visuals.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-wrap gap-2 justify-center';
    state.sequence.forEach((s, idx) => {
      const bubble = document.createElement('div');
      bubble.className = 'px-3 py-2 rounded-full bg-[var(--card-bg)] text-sm font-mono';
      bubble.textContent = formatInputValue(s);
      if (state.roundActive && state.userInput.length > idx) {
        bubble.classList.add('opacity-50');
      }
      wrapper.appendChild(bubble);
    });
    visuals.appendChild(wrapper);
  }

  // ------------------------ Sequence Management ------------------------

  // Helpers to generate sequences (unique or simon)
  function randomChoice(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function possibleKeysForCurrentMode() {
    if (state.inputType === 'key9') return Array.from({length:9}, (_,i)=>String(i+1));
    if (state.inputType === 'key12') return Array.from({length:12}, (_,i)=>String(i+1));
    if (state.inputType === 'piano') return ['1','2','3','4','5','C','D','E','F','G','A','B'];
    return [];
  }

  function createInitialSequence() {
    state.sequence = [];
    const keys = possibleKeysForCurrentMode();
    for (let i = 0; i < state.sequenceLength; i++) {
      state.sequence.push(randomChoice(keys));
    }
    renderSequence();
  }

  // Unique sequence flow: holds a master sequence but reveals new items one-at-a-time per round
  function uniqueReset() {
    state.uniqueSequenceFull = [];
    // create a longer list of random unique items (no repetition guaranteed not enforced)
    const keys = possibleKeysForCurrentMode();
    for (let i = 0; i < state.sequenceLength; i++) {
      state.uniqueSequenceFull.push(randomChoice(keys));
    }
    state.uniqueRoundIndex = 0;
    state.sequence = state.uniqueSequenceFull.slice(0, state.uniqueRoundIndex+1);
    renderSequence();
  }

  function uniqueAdvanceOne() {
    state.uniqueRoundIndex = Math.min(state.uniqueRoundIndex + 1, state.uniqueSequenceFull.length - 1);
    state.sequence = state.uniqueSequenceFull.slice(0, state.uniqueRoundIndex+1);
    renderSequence();
  }

  // Start a new round (mode-specific)
  async function startRound() {
    // Check practice guard
    if (settingsManager && settingsManager.practiceGuard && settingsManager.practiceGuard()) {
      // blocked: practice guard shows start button; do not auto-start
      return;
    }

    state.userInput = [];
    state.roundActive = true;
    renderSequence();

    // Signal autoplay manager to play sequence if allowed
    if (globalThis.autoplayManager) {
      // autoplayManager will check settings and play if allowed
      await globalThis.autoplayManager.playSequence();
    }
  }

  // End current round: used when player completes input or loses
  function endRound({won=false, lost=false} = {}) {
    state.roundActive = false;
    // practice mode re-show start
    if (settingsManager && settingsManager.practiceState && settingsManager.practiceState.modeEnabled) {
      settingsManager.practiceSetState({ won, lost });
    }
    // notify settings manager of game end
    settingsManager && settingsManager.onGameEnded && settingsManager.onGameEnded({won, lost});
  }

  // ------------------------ Input Handling ------------------------

  // common handler for receiving an input value (string or number)
  async function handleInputValue(val, source = 'button') {
    // respect practice guard
    if (settingsManager && settingsManager.practiceGuard && settingsManager.practiceGuard()) {
      return;
    }

    // If blackout mode is on and blackout gestures enabled, allow gestures but ignore button presses?
    if (settingsManager && settingsManager.appSettings.isBlackoutFeatureEnabled) {
      // If blackout hides UI, still accept mapping tokens or touch events if blackout gestures enabled
      if (!settingsManager.appSettings.isBlackoutGesturesEnabled && source === 'button') {
        // ignore button input during blackout if gestures-only
        return;
      }
    }

    // If 'inputs-only' (Inputs only) reduce behavior? For now treat as same input handling

    // Append input and check against sequence
    state.userInput.push(String(val));
    state.lastTriggeredFrom = source;
    // Provide immediate audio/haptic feedback if enabled (light)
    if (settingsManager && settingsManager.appSettings.isAudioEnabled) {
      // speak the value (very simple)
      const utter = new SpeechSynthesisUtterance(String(val));
      utter.rate = settingsManager.appSettings.voiceRate || 1.0;
      utter.pitch = settingsManager.appSettings.voicePitch || 1.0;
      utter.volume = settingsManager.appSettings.voiceVolume || 1.0;
      try { speechSynthesis.speak(utter); } catch (e) {}
    }

    // If input length equals sequence length, evaluate
    if (state.userInput.length >= state.sequence.length) {
      // Check if matched
      const matched = state.sequence.every((v, idx) => String(v) === String(state.userInput[idx]));
      if (matched) {
        // Player won this round
        // If unique mode, ask autoplayManager to advance if needed
        if (state.mode === 'unique') {
          // If auto-clear is on, let autoplayManager.playNextIfNeeded handle it
          if (globalThis.autoplayManager && settingsManager.appSettings.isUniqueRoundsAutoClearEnabled) {
            await globalThis.autoplayManager.playNextIfNeeded();
          } else {
            // no auto-advance - just notify app that round ended
            endRound({won:true});
          }
        } else {
          // simon mode: sequences usually grow, so app should extend and start next round
          endRound({won:true});
        }
      } else {
        // player lost - provide feedback and end round
        endRound({lost:true});
      }
    }

    renderSequence();
  }

  // Button click wiring (for pads)
  function wirePadButtons() {
    // Key9
    dom.padKey9 && dom.padKey9.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      const val = btn.dataset.value;
      if (!val) return;
      handleInputValue(val, 'button');
    });

    // Key12
    dom.padKey12 && dom.padKey12.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      const val = btn.dataset.value;
      if (!val) return;
      handleInputValue(val, 'button');
    });

    // Piano
    dom.padPiano && dom.padPiano.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      const val = btn.dataset.value;
      if (!val) return;
      handleInputValue(val, 'button');
    });

    // Backspace button
    const backspace = $('btn-backspace');
    if (backspace) backspace.addEventListener('click', () => {
      if (state.userInput.length > 0) {
        state.userInput.pop();
        renderSequence();
      }
    });
  }

  // ------------------------ Mapping Token Handling ------------------------

  // Map incoming mapping tokens to actual input values using mappingAPI/getMappingForMode
  // If mappingAPI.applyMappingsToSensor exists, app could prefer that; here we do a direct mapping approach with fallback
  function handleMappingToken(token) {
    try {
      // Prefer mappingAPI.tokenToKey mapping
      if (globalThis.mappingAPI && typeof mappingAPI.getMappingForMode === 'function') {
        const map = mappingAPI.getMappingForMode(state.inputType);
        if (map && map.gestures) {
          // gestures map token -> key
          for (let k of Object.keys(map.gestures)) {
            if (map.gestures[k] === token) {
              // trigger input
              handleInputValue(k, 'gesture-token');
              return;
            }
          }
        }
      }

      // Legacy: handle tokens like 'tap_1f' -> map to DEFAULT_MAPPING if available
      if (typeof DEFAULT_MAPPING !== 'undefined' && DEFAULT_MAPPING[state.inputType]) {
        const gest = DEFAULT_MAPPING[state.inputType].gestures || {};
        for (let k of Object.keys(gest)) {
          if (gest[k] === token) {
            handleInputValue(k, 'gesture-token');
            return;
          }
        }
      }

      // If not found, just log
      console.debug('Mapping token not matched', token);
    } catch (e) {
      console.warn("handleMappingToken error", e);
    }
  }

  // Listen for mapping tokens emitted by gesturePad or mapping module
  function wireMappingTokenListeners() {
    window.addEventListener('mapping:token', (ev) => {
      try {
        const token = ev?.detail?.token;
        if (!token) return;
        handleMappingToken(token);
      } catch (e) {}
    });

    window.addEventListener('gesture:token', (ev) => {
      try {
        const token = ev?.detail?.token;
        if (!token) return;
        handleMappingToken(token);
      } catch (e) {}
    });

    // Also listen to gesture:tap or gesture:swipe optionally
    window.addEventListener('gesture:tap', (ev) => {
      // triple tap to toggle gesture pad is handled by settingsManager.triple-tap detector
      // but also handle direct tokens
      try {
        const detail = ev.detail || {};
        if (detail.token) handleMappingToken(detail.token);
      } catch (e) {}
    });

    window.addEventListener('gesture:swipe', (ev) => {
      try {
        const detail = ev.detail || {};
        if (detail.token) handleMappingToken(detail.token);
      } catch (e) {}
    });
  }

  // ------------------------ Autoplay & Integration ------------------------

  // Register autoplay callbacks: must be called once settings:ready triggers initialization
  function registerAutoplayCallbacks() {
    if (!settingsManager) return;
    settingsManager.registerAutoplayAppCallbacks({
      onPlayStep: (idx, value) => {
        // highlight the step visually (temporary highlight)
        highlightSequenceStep(idx);
        // If the step is a mapping token (value may be token?), the app uses mappingAPI to show specifics
      },
      onSequenceStart: (seq) => { /* optional */ },
      onSequenceEnd: (seq) => { /* optional */ },
      getSequence: () => state.sequence.slice(),
      getMode: () => state.mode,
      getSettings: () => ({
        isAutoplayEnabled: settingsManager.appSettings.isAutoplayEnabled,
        isUniqueRoundsAutoClearEnabled: settingsManager.appSettings.isUniqueRoundsAutoClearEnabled,
        playbackSpeed: settingsManager.appSettings.playbackSpeed,
        gesturePause: settingsManager.appSettings.gesturePause
      }),
      notifyAutoClearRequest: () => {
        // App should extend/advance sequence for unique mode synchronous to this call
        if (state.mode === 'unique') {
          uniqueAdvanceOne();
        }
      }
    });
  }

  function highlightSequenceStep(idx) {
    // Simple visual: flash the bubble in sequence visuals
    const visuals = $('sequence-visuals');
    if (!visuals) return;
    const bubble = visuals.querySelectorAll('div > div')[idx];
    if (!bubble) return;
    bubble.classList.add('ring', 'ring-offset-2');
    setTimeout(() => bubble.classList.remove('ring','ring-offset-2'), 350);
  }

  // ------------------------ Practice Mode Integration ------------------------

  function hookPracticeStartButton() {
    // The settings.js created 'practice-start-overlay' and 'practice-start-btn'
    const overlay = $('practice-start-overlay');
    const startBtn = $('practice-start-btn'); // this is the overlay button created in Section 9
    if (!overlay || !startBtn) {
      // settingsManager.initPracticeModeUI will create them later; wait for settings ready
      return;
    }
    // When clicked, settingsManager.practiceAPI.guard will be cleared and 'practice:start' event will be fired by settingsManager
    // App listens for that to actually call startRound()
    window.addEventListener('practice:start', () => {
      // begin round when user hits Start
      // Only start if practice mode is enabled and not currently active
      state.isPractice = true;
      startRound();
    });
  }

  // ------------------------ Header relocation wiring ------------------------

  function hookHeaderLayoutInit() {
    // Provide toggles for showing cam/mic buttons (these moves are handled by settingsManager)
    // Repositioning is done by settingsManager.initHeaderLayout called during finalizeIntegration
    // Here we just expose events to update layout if settings change.
    window.addEventListener('settings:ready', () => {
      try {
        // ensure settingsManager repositioning
        settingsManager && settingsManager.initHeaderLayout && settingsManager.initHeaderLayout();
      } catch (e) {}
    });
  }

  // ------------------------ Init / Ready Sequence ------------------------

  async function initialize() {
    // Wait for settings ready
    if (!window.settingsManager) {
      // Wait for settings:ready event
      await new Promise((resolve) => {
        window.addEventListener('settings:ready', () => resolve(), { once: true });
      });
    } else {
      // If manager already present but maybe not fully initialized, wait for settings:ready too
      if (!settingsManager.__initializedFinal) {
        await new Promise((resolve) => {
          window.addEventListener('settings:ready', () => resolve(), { once: true });
        });
      }
    }

    // Once here, settingsManager is ready.
    log('Settings ready — booting app');

    // Ensure pads exist and wire buttons
    ensurePads();
    wirePadButtons();

    // mapping token wiring
    wireMappingTokenListeners();

    // get initial mode from settings
    state.mode = settingsManager.appSettings?.runtimeSettings?.mode || 'simon';
    state.inputType = settingsManager.appSettings?.runtimeSettings?.currentInput || settingsManager.appSettings?.autoInputMode || 'key9';
    showInputMode(state.inputType);

    // Build initial sequence
    if (state.mode === 'unique') {
      uniqueReset();
    } else {
      // simon
      createInitialSequence();
    }

    // Wire mappingAPI registration if available
    if (globalThis.mappingAPI && typeof mappingAPI.registerSettingsManager === 'function') {
      // already registered by settingsManager, but ensure mappingAPI knows about the app
      mappingAPI.onMappingChanged((mapping) => {
        // mapping updated; we may want to refresh hints etc
        log('Mapping updated', mapping);
      });
    }

    // Register autoplay callbacks
    try {
      registerAutoplayCallbacks();
    } catch (e) { warn('autoplay callback registration failed', e); }

    // Setup practice API hooks
    hookPracticeStartButton();

    // Hook for practice guard use: app should check settingsManager.practiceGuard() before starting round
    window.addEventListener('practice:ended', (ev) => {
      // when practice ended (won/lost) settingsManager will show start button, app shouldn't auto start
      log('Practice round ended', ev.detail);
    });

    // Try to wire gestures to sensors mapping if mappingAPI provides helper
    if (mappingAPI && mappingAPI.applyMappingsToSensor && typeof mappingAPI.applyMappingsToSensor === 'function') {
      // If you have a sensorEngine, you can pass it. In this app we'll create a thin adapter that listens to mapping:token events
      // and calls handleInputValue (already wired above). We'll also offer mappingAPI a handleToken translator.
      const translator = mappingAPI.applyMappingsToSensor({
        onTrigger: (k, source) => {
          try { handleInputValue(k, source || 'sensor'); } catch (e) {}
        }
      }, state.inputType);

      // translator.handleToken can be used if your sensor engine prefers calling a function
      if (translator) {
        // listen for mapping:token and pass to translator.handleToken (translator may call onTrigger)
        window.addEventListener('mapping:token', (ev) => {
          try {
            const token = ev.detail?.token;
            if (!token) return;
            if (translator && typeof translator.handleToken === 'function') translator.handleToken(token, 'mapping');
          } catch (e) {}
        });
      }
    }

    // Integrations:
    // - Header layout repositioning
    settingsManager.initHeaderLayout && settingsManager.initHeaderLayout();

    // - Timer & Counter already initialized by settings.finalization; but ensure initial visibility
    if (settingsManager.appSettings.showTimerButton && $('top-left-timer')) $('top-left-timer').style.display = 'flex';
    if (settingsManager.appSettings.showCounterButton && $('top-right-counter')) $('top-right-counter').style.display = 'flex';

    // - Gesture pad attach listeners
    if (window.gesturePad && typeof gesturePad.attachPadListeners === 'function') {
      gesturePad.attachPadListeners();
    }

    // - Wire practice guard to prevent auto start
    // initial state
    settingsManager.practiceState.modeEnabled = !!settingsManager.appSettings.isPracticeModeEnabled;
    if (settingsManager.practiceState.modeEnabled) {
      // If practice mode enabled, show Start button (unless game started)
      settingsManager.practiceShowStartButton(true);
    }

    // - Register to UI events: Manual replay button
    const replay = document.querySelector('[data-action="play-demo"]');
    if (replay) {
      replay.addEventListener('click', async () => {
        if (settingsManager.practiceGuard && settingsManager.practiceGuard()) return;
        if (globalThis.autoplayManager) await globalThis.autoplayManager.playSequence();
      });
    }

    // - On user completing input signal for app.js, call settingsManager.onPlayerCompletedInput
    // We expect app code to call settingsManager.onPlayerCompletedInput after evaluating inputs; however for simplicity
    // we call it automatically where appropriate (in handleInputValue).
    // (The mapping to settingManager.onPlayerCompletedInput was done earlier in handleInputValue for unique mode.)

    // All set — emit app ready
    window.dispatchEvent(new CustomEvent('app:ready', { detail: { state } }));
    log('App initialized and ready');
  }

  // ------------------------ Public API (optional) ------------------------

  return {
    init: initialize,
    getState: () => state,
    setInputMode: (m) => {
      showInputMode(m);
      state.inputType = m;
    },
    setMode: (m) => {
      state.mode = m;
    },
    setSequenceLength: (len) => {
      state.sequenceLength = len;
    },
    createSequence: createInitialSequence,
    uniqueReset,
    startRound,
    endRound,
    handleInputValue, // exposed for debugging/testing
  };
})();

// ------------------------ Auto-init (wait for settings ready) ------------------------
(function autoInit() {
  // If settings manager exists and is ready, initialize now; otherwise wait for event
  if (window.settingsManager && window.settingsManager.__initializedFinal) {
    App.init();
  } else {
    window.addEventListener('settings:ready', () => {
      setTimeout(() => App.init(), 20);
    }, { once: true });
  }
})();

// ------------------------ Exports for console debugging ------------------------
window.App = App;

