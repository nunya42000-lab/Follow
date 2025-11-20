// sensors.js - "Simon Dual Fusion" Logic Port
// Handles Audio Frequency Analysis and Camera Flash/Color Detection

export class SensorEngine {
    constructor(onTrigger, onStatusUpdate) {
        this.onTrigger = onTrigger;       // Callback when a number is detected
        this.onStatusUpdate = onStatusUpdate; // Callback for debug/status text

        // --- CONFIG FROM V5 ---
        this.COLORS = [
            { n: 3, hue: 0,   range: 12, satMin: 0.5, hex: '#ef4444' }, // Red
            { n: 9, hue: 30,  range: 15, satMin: 0.5, hex: '#f97316' }, // Orange
            { n: 4, hue: 60,  range: 20, satMin: 0.4, hex: '#eab308' }, // Yellow
            { n: 5, hue: 120, range: 30, satMin: 0.3, hex: '#22c55e' }, // Green
            { n: 6, hue: 180, range: 25, satMin: 0.3, hex: '#06b6d4' }, // Cyan
            { n: 2, hue: 240, range: 25, satMin: 0.4, hex: '#3b82f6' }, // Blue
            { n: 1, hue: 275, range: 20, satMin: 0.3, hex: '#a855f7' }, // Purple
            { n: 8, hue: 315, range: 25, satMin: 0.3, hex: '#d946ef' }, // Magenta
        ];

        this.TONES = [
            { n: 1, f: 261 }, { n: 2, f: 293 }, { n: 3, f: 329 },
            { n: 4, f: 349 }, { n: 5, f: 392 }, { n: 6, f: 440 },
            { n: 7, f: 493 }, { n: 8, f: 523 }, { n: 9, f: 587 }
        ];

        // --- STATE ---
        this.isActive = false;
        this.mode = { audio: false, camera: false };
        this.lastTriggerTime = 0;
        this.COOLDOWN = 600;
        this.loopId = null;

        // --- AUDIO VARS ---
        this.audioCtx = null;
        this.analyser = null;
        this.micSrc = null;
        this.audioThresh = -85;

        // --- CAM VARS ---
        this.videoEl = null;
        this.canvasEl = null;
        this.ctx = null;
        this.prevFrame = null;
        this.motionThresh = 30;
        this.isFlashing = false;
        this.flashFrames = 0;
        this.peakBrightness = 0;
        this.peakColorData = null;
    }

    setupDOM(videoElement, canvasElement) {
        this.videoEl = videoElement;
        this.canvasEl = canvasElement;
        if (this.canvasEl) {
            this.ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
        }
    }

    setSensitivity(type, val) {
        if (type === 'audio') this.audioThresh = val; // -100 to -40
        if (type === 'camera') this.motionThresh = val; // 10 to 80
    }

    // --- LIFECYCLE ---

    async toggleAudio(enable) {
        this.mode.audio = enable;
        if (enable && !this.audioCtx) {
            try {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 8192;
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.micSrc = this.audioCtx.createMediaStreamSource(stream);
                this.micSrc.connect(this.analyser);
                this.onStatusUpdate("Audio Active");
            } catch (e) {
                console.error("Audio Init Failed", e);
                this.onStatusUpdate("Audio Failed: " + e.message);
                this.mode.audio = false;
            }
        } else if (!enable && this.audioCtx) {
            // We don't fully close ctx to allow quick toggle, but we could suspend
            if(this.audioCtx.state === 'running') this.audioCtx.suspend();
        } else if (enable && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        this.checkLoop();
    }

    async toggleCamera(enable) {
        this.mode.camera = enable;
        if (enable && !this.videoEl.srcObject) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } } 
                });
                this.videoEl.srcObject = stream;
                this.videoEl.onloadedmetadata = () => { 
                    if (this.canvasEl) {
                        this.canvasEl.width = 64; // Low res for processing speed
                        this.canvasEl.height = 64; 
                    }
                };
                this.onStatusUpdate("Camera Active");
            } catch (e) {
                console.error("Camera Init Failed", e);
                this.onStatusUpdate("Camera Failed: " + e.message);
                this.mode.camera = false;
            }
        } else if (!enable && this.videoEl.srcObject) {
            const tracks = this.videoEl.srcObject.getTracks();
            tracks.forEach(t => t.stop());
            this.videoEl.srcObject = null;
        }
        this.checkLoop();
    }

    checkLoop() {
        const shouldRun = this.mode.audio || this.mode.camera;
        if (shouldRun && !this.isActive) {
            this.isActive = true;
            this.loop();
        } else if (!shouldRun) {
            this.isActive = false;
            if (this.loopId) cancelAnimationFrame(this.loopId);
        }
    }

    loop() {
        if (!this.isActive) return;

        if (this.mode.audio) this.processAudio();
        if (this.mode.camera) this.processCamera();

        this.loopId = requestAnimationFrame(() => this.loop());
    }

    // --- PROCESSORS ---

    processAudio() {
        if (!this.analyser) return;
        const buffer = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(buffer);
        
        let maxVal = -Infinity, maxIdx = -1;
        const hzPerBin = this.audioCtx.sampleRate / 2 / buffer.length;
        
        // Scan 200-700Hz (Optimized range from v5)
        const startBin = Math.floor(200 / hzPerBin);
        const endBin = Math.floor(700 / hzPerBin);

        for (let i = startBin; i < endBin; i++) {
            if (buffer[i] > maxVal) { maxVal = buffer[i]; maxIdx = i; }
        }

        if (maxVal > this.audioThresh) {
            const freq = maxIdx * hzPerBin;
            // Tolerance: 4%
            const match = this.TONES.find(t => Math.abs(t.f - freq) < (t.f * 0.04));
            
            if (match) {
                this.trigger(match.n, 'audio');
            }
        }
    }

    processCamera() {
        if (!this.videoEl || !this.videoEl.videoWidth || !this.ctx) return;
        
        this.ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
        const frame = this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
        const data = frame.data;

        if (!this.prevFrame) { 
            this.prevFrame = new Uint8ClampedArray(data); 
            return; 
        }

        let diffScore = 0, rSum = 0, gSum = 0, bSum = 0, pxCount = 0;

        // Sampling every 4th pixel for speed
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            const diff = Math.abs(r - this.prevFrame[i]) + 
                         Math.abs(g - this.prevFrame[i+1]) + 
                         Math.abs(b - this.prevFrame[i+2]);
            
            if (diff > this.motionThresh * 3) {
                diffScore++; rSum += r; gSum += g; bSum += b; pxCount++;
            }
        }
        this.prevFrame.set(data);

        // Flash Logic
        if (diffScore > 20) {
            this.isFlashing = true;
            this.flashFrames++;
            
            const avgR = rSum/pxCount, avgG = gSum/pxCount, avgB = bSum/pxCount;
            const brightness = (avgR+avgG+avgB)/3;
            const [h, s, l] = this.rgbToHsl(avgR, avgG, avgB);
            const hueDeg = Math.round(h * 360);

            // Peak Finding
            const quality = brightness * (s + 0.5);
            if (quality > this.peakBrightness) {
                this.peakBrightness = quality;
                this.peakColorData = { h: hueDeg, s, l };
            }
        } else {
            if (this.isFlashing) {
                // End of flash - Identify Color
                if (this.flashFrames > 2 && this.peakColorData) {
                    this.identifyColor(this.peakColorData);
                }
                // Reset
                this.isFlashing = false; 
                this.flashFrames = 0; 
                this.peakBrightness = 0; 
                this.peakColorData = null;
            }
        }
    }

    identifyColor(data) {
        const { h, s } = data;
        // 1. Check for White/Grey (Low Saturation)
        if (s < 0.25) { this.trigger(7, 'camera-white'); return; } 
        
        // 2. Check for Red Wrap (Hue 0/360)
        if (h > 350 || h < 10) { this.trigger(3, 'camera'); return; } 

        // 3. Match Range
        const match = this.COLORS.find(c => (h >= c.hue - c.range && h <= c.hue + c.range));
        if (match) this.trigger(match.n, 'camera');
    }

    trigger(num, source) {
        const now = Date.now();
        if (now - this.lastTriggerTime < this.COOLDOWN) return;
        
        this.lastTriggerTime = now;
        this.onTrigger(num, source);
    }

    // Helper
    rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) { h = s = 0; } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, l];
    }
}