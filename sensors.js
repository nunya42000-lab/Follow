// sensors.js
// SensorEngine - integrates microphone & camera sensors and forwards tokens to mapping/translators.
// Emits mapping:token events and sensor:audio_pulse / sensor:camera_flash events.

(function () {
  const SensorEngine = function () {
    // internal state
    this._audioCtx = null;
    this._micStream = null;
    this._analyser = null;
    this._audioData = null;
    this._audioRunning = false;
    this._audioInterval = null;
    this._audioThreshold = 0.25; // default RMS threshold (0..1)
    this._audioSmoothing = 0.85; // smoothing factor for level
    this._audioSmoothed = 0;
    this._cameraStream = null;
    this._cameraRunning = false;
    this._cameraInterval = null;
    this._cameraThreshold = 18; // average brightness diff threshold
    this._translator = null; // mappingAPI.applyMappingsToSensor(...).handleToken(token)
    this._onTrigger = null; // fallback onTrigger(k, source) (used if translator absent)
    this._pollMs = 120; // poll interval for audio/camera checks
    this._lastAudioEmitTs = 0;
    this._audioCooldownMs = 350; // avoid multiple triggers in short succession
    this._lastCameraEmitTs = 0;
    this._cameraCooldownMs = 350;
    this._attached = false;
  };

  SensorEngine.prototype.setTranslator = function (translator) {
    // translator expected shape: { handleToken: fn(token, source), tokenToKey: {} }
    this._translator = translator;
  };

  SensorEngine.prototype.setOnTrigger = function (fn) {
    this._onTrigger = typeof fn === 'function' ? fn : null;
  };

  SensorEngine.prototype.emitToken = function (token, source = 'sensor') {
    try {
      // prefer translator if present
      if (this._translator && typeof this._translator.handleToken === 'function') {
        try {
          this._translator.handleToken(token, source);
        } catch (e) {
          console.warn('SensorEngine: translator.handleToken failed', e);
        }
      } else if (this._onTrigger && typeof this._onTrigger === 'function') {
        // translator not provided - fallback to onTrigger numeric mapping not possible here
        // but call with token so consumer can map or interpret
        try { this._onTrigger(token, source); } catch (e) {}
      }
      // Always emit mapping:token as well so mapping UI / app can pick up
      window.dispatchEvent(new CustomEvent('mapping:token', { detail: { token, source } }));
    } catch (e) {
      console.warn('SensorEngine.emitToken error', e);
    }
  };

  // Small helper to read calibration slider values if present
  SensorEngine.prototype._readCalibration = function () {
    try {
      const audioSlider = document.getElementById('calib-audio-slider');
      if (audioSlider) {
        const v = parseFloat(audioSlider.value);
        // slider is -100..-30 in index.html, we map to RMS threshold roughly
        // convert dB value to normalized RMS estimate: simple linear map to 0..1
        // Note: this is heuristic — fine tuned via UI by user
        const db = v; // -100 .. -30
        // map -100 -> 0.01, -30 -> 0.6
        const mapped = ((db + 100) / 70) * 0.59 + 0.01;
        this._audioThreshold = clamp(mapped, 0.01, 0.9);
      }
    } catch (e) {}

    try {
      const camSlider = document.getElementById('calib-cam-slider');
      if (camSlider) {
        // slider 5..100 in index.html; map to pixel brightness jump threshold (10..40)
        const v = parseFloat(camSlider.value);
        const mapped = Math.round(clamp((v / 100) * 40, 8, 60));
        this._cameraThreshold = mapped;
      }
    } catch (e) {}
  };

  // ---------------- Audio capture & pulse detection ----------------
  SensorEngine.prototype._ensureAudio = async function () {
    if (this._audioCtx) return;
    try {
      this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('SensorEngine: WebAudio not supported', e);
      this._audioCtx = null;
      return;
    }
  };

  SensorEngine.prototype.startAudio = async function () {
    try {
      await this._ensureAudio();
      if (!this._audioCtx) return;

      // if already running, don't re-request
      if (this._audioRunning) return;

      // request microphone
      if (!this._micStream) {
        try {
          this._micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (err) {
          console.warn('SensorEngine: microphone permission denied or unavailable', err);
          this._micStream = null;
          return;
        }
      }

      // create analyser
      const src = this._audioCtx.createMediaStreamSource(this._micStream);
      this._analyser = this._audioCtx.createAnalyser();
      this._analyser.fftSize = 2048;
      src.connect(this._analyser);
      this._audioData = new Float32Array(this._analyser.fftSize);

      this._audioRunning = true;
      this._readCalibration();

      // start polling
      this._audioInterval = setInterval(() => {
        try {
          this._analyser.getFloatTimeDomainData(this._audioData);
          // compute RMS
          let sum = 0;
          for (let i = 0; i < this._audioData.length; i++) {
            const s = this._audioData[i];
            sum += s * s;
          }
          const rms = Math.sqrt(sum / this._audioData.length);
          // smooth
          this._audioSmoothed = (this._audioSmoothing * this._audioSmoothed) + ((1 - this._audioSmoothing) * rms);

          // threshold crossing detection - consider short transient (use raw rms)
          const now = Date.now();
          // use short-term raw rms for detecting impulses
          if (rms > this._audioThreshold && (now - this._lastAudioEmitTs) > this._audioCooldownMs) {
            this._lastAudioEmitTs = now;
            // emit token for audio pulse
            const token = 'audio_pulse';
            window.dispatchEvent(new CustomEvent('sensor:audio_pulse', { detail: { rms, threshold: this._audioThreshold } }));
            this.emitToken(token, 'audio');
          }
        } catch (e) {
          console.warn('SensorEngine: audio poll error', e);
        }
      }, this._pollMs);
    } catch (e) {
      console.warn('SensorEngine.startAudio failed', e);
      this._audioRunning = false;
    }
  };

  SensorEngine.prototype.stopAudio = function () {
    try {
      if (this._audioInterval) { clearInterval(this._audioInterval); this._audioInterval = null; }
      if (this._analyser) { try { this._analyser.disconnect(); } catch (e) {} this._analyser = null; }
      if (this._micStream) {
        try {
          this._micStream.getTracks().forEach(t => t.stop());
        } catch (e) {}
        this._micStream = null;
      }
      if (this._audioCtx) {
        try { this._audioCtx.close(); } catch (e) {}
        this._audioCtx = null;
      }
      this._audioRunning = false;
    } catch (e) {
      console.warn('SensorEngine.stopAudio failed', e);
    }
  };

  // ---------------- Camera frame-difference brightness detection ----------------
  SensorEngine.prototype.startCamera = async function (facingMode = 'environment') {
    try {
      if (this._cameraRunning) return;
      // request camera
      try {
        this._cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      } catch (e) {
        console.warn('SensorEngine: camera permission denied or unavailable', e);
        this._cameraStream = null;
        return;
      }

      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      video.srcObject = this._cameraStream;

      // ensure video starts
      await video.play().catch(() => {});

      // create small offscreen canvas for frame analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // initial size
      const w = 160;
      const h = 120;
      canvas.width = w;
      canvas.height = h;

      let lastAvg = null;
      this._cameraRunning = true;
      this._readCalibration();

      this._cameraInterval = setInterval(() => {
        try {
          if (video.readyState < 2) return;
          ctx.drawImage(video, 0, 0, w, h);
          const img = ctx.getImageData(0, 0, w, h).data;
          let sum = 0;
          let count = 0;
          for (let i = 0; i < img.length; i += 4) {
            // luminance approximation
            const r = img[i], g = img[i+1], b = img[i+2];
            const lum = (0.299*r + 0.587*g + 0.114*b);
            sum += lum;
            count++;
          }
          const avg = sum / count;
          if (lastAvg !== null) {
            const diff = Math.abs(avg - lastAvg);
            const now = Date.now();
            if (diff > this._cameraThreshold && (now - this._lastCameraEmitTs) > this._cameraCooldownMs) {
              this._lastCameraEmitTs = now;
              const token = 'camera_flash';
              window.dispatchEvent(new CustomEvent('sensor:camera_flash', { detail: { avg, lastAvg, diff, threshold: this._cameraThreshold } }));
              this.emitToken(token, 'camera');
            }
          }
          lastAvg = avg;
        } catch (e) {
          console.warn('SensorEngine: camera interval error', e);
        }
      }, this._pollMs);
    } catch (e) {
      console.warn('SensorEngine.startCamera failed', e);
      this._cameraRunning = false;
    }
  };

  SensorEngine.prototype.stopCamera = function () {
    try {
      if (this._cameraInterval) { clearInterval(this._cameraInterval); this._cameraInterval = null; }
      if (this._cameraStream) {
        try { this._cameraStream.getTracks().forEach(t => t.stop()); } catch (e) {}
        this._cameraStream = null;
      }
      this._cameraRunning = false;
    } catch (e) {
      console.warn('SensorEngine.stopCamera failed', e);
    }
  };

  // ---------------- Attach gesture token listeners ----------------
  SensorEngine.prototype.attachGestureListeners = function () {
    if (this._attached) return;
    this._attached = true;
    // Forward gesture tokens to translator
    window.addEventListener('gesture:token', (ev) => {
      try {
        const token = ev?.detail?.token;
        if (!token) return;
        this.emitToken(token, 'gesture');
      } catch (e) {}
    });

    window.addEventListener('mapping:token', (ev) => {
      // mapping:token events might be generated by other modules; ignore to avoid loop
    });

    // Also pick up raw gesture taps/swipes with token fields
    window.addEventListener('gesture:tap', (ev) => {
      try {
        const d = ev.detail || {};
        if (d && d.token) this.emitToken(d.token, 'gesture');
      } catch (e) {}
    });

    window.addEventListener('gesture:swipe', (ev) => {
      try {
        const d = ev.detail || {};
        if (d && d.token) this.emitToken(d.token, 'gesture');
      } catch (e) {}
    });
  };

  // ---------------- Init / start / stop top-level ----------------
  SensorEngine.prototype.init = function (opts = {}) {
    // opts may include autoStartAudio, autoStartCamera, onTrigger (fallback), translator
    if (opts.onTrigger) this.setOnTrigger(opts.onTrigger);
    if (opts.translator) this.setTranslator(opts.translator);
    this._readCalibration();
    this.attachGestureListeners();
    if (opts.autoStartAudio) this.startAudio();
    if (opts.autoStartCamera) this.startCamera(opts.facingMode || 'environment');
  };

  SensorEngine.prototype.start = function (opts = {}) {
    opts = opts || {};
    this._readCalibration();
    if (opts.startAudio) this.startAudio();
    if (opts.startCamera) this.startCamera(opts.facingMode || 'environment');
    this.attachGestureListeners();
  };

  SensorEngine.prototype.stop = function () {
    this.stopAudio();
    this.stopCamera();
  };

  // expose singleton
  const engine = new SensorEngine();

  // Utility clamp used inside readCalibration
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Auto-initialize small parts when DOM ready: read calibration and wire to sliders
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Wire calibration UI to update engine thresholds live
      const audioSlider = document.getElementById('calib-audio-slider');
      if (audioSlider) {
        audioSlider.addEventListener('input', () => {
          try { engine._readCalibration(); } catch (e) {}
        });
      }
      const camSlider = document.getElementById('calib-cam-slider');
      if (camSlider) {
        camSlider.addEventListener('input', () => {
          try { engine._readCalibration(); } catch (e) {}
        });
      }

      // If the settings indicate we should start audio/camera, honor them (non-blocking)
      setTimeout(() => {
        try {
          const cfg = (window.settingsManager && settingsManager.appSettings) ? settingsManager.appSettings : {};
          if (cfg && cfg.autoStartMicrophone) {
            engine.startAudio().catch(()=>{});
          }
          if (cfg && cfg.autoStartCamera) {
            engine.startCamera().catch(()=>{});
          }
        } catch (e) {}
      }, 300);
    } catch (e) {
      console.warn('SensorEngine DOM ready init failed', e);
    }
  });

  // Provide global API
  window.sensorEngine = engine;

  // If mappingAPI.applyMappingsToSensor exists, automatically attach translator when mappingAPI ready
  // mappingAPI.applyMappingsToSensor expects sensorEngine-like object with onTrigger callback; our translator will be created when app calls it.
  // But provide a convenience: if mappingAPI exists now, create translator and set it
  try {
    if (globalThis.mappingAPI && typeof mappingAPI.applyMappingsToSensor === 'function') {
      // create a translator for the current default mode (if settingsManager available)
      const mode = (window.settingsManager && settingsManager.appSettings && settingsManager.appSettings.runtimeSettings && settingsManager.appSettings.runtimeSettings.currentInput) || 'key9';
      const translator = mappingAPI.applyMappingsToSensor({
        onTrigger: (k, source) => {
          // If translator calls with numeric key, dispatch as mapping or call fallback onTrigger
          // If onTrigger expects numeric, call engine._onTrigger if present
          if (engine._onTrigger) {
            try { engine._onTrigger(k, source); } catch (e) {}
          } else {
            // Emit generic mapping event so App can handle
            window.dispatchEvent(new CustomEvent('mapping:trigger', { detail: { key: k, source } }));
          }
        }
      }, mode);
      if (translator) engine.setTranslator(translator);
    }
  } catch (e) {
    // don't crash if mappingAPI not yet available
  }

})();
