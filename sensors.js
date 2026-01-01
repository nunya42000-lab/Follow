export class SensorEngine {
    constructor(onTrigger, onStatusUpdate) {
        this.onTrigger = onTrigger;
        this.onStatusUpdate = onStatusUpdate;
        this.calibrationCallback = null;
        this.COLORS = [{ n: 3, hue: 0, range: 12, satMin: 0.5 }, { n: 9, hue: 30, range: 15, satMin: 0.5 }, { n: 4, hue: 60, range: 20, satMin: 0.4 }, { n: 5, hue: 120, range: 30, satMin: 0.3 }, { n: 6, hue: 180, range: 25, satMin: 0.3 }, { n: 2, hue: 240, range: 25, satMin: 0.4 }, { n: 1, hue: 275, range: 20, satMin: 0.3 }, { n: 8, hue: 315, range: 25, satMin: 0.3 }];
        this.TONES = [{ n: 1, f: 261 }, { n: 2, f: 293 }, { n: 3, f: 329 }, { n: 4, f: 349 }, { n: 5, f: 392 }, { n: 6, f: 440 }, { n: 7, f: 493 }, { n: 8, f: 523 }, { n: 9, f: 587 }];
        this.isActive = false;
        this.mode = { audio: false, camera: false };
        this.lastTriggerTime = 0;
        this.COOLDOWN = 600;
        this.loopId = null;
        this.audioCtx = null;
        this.analyser = null;
        this.micSrc = null;
        this.audioThresh = -85;
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
    setCalibrationCallback(cb) { this.calibrationCallback = cb; }
    setupDOM(videoElement, canvasElement) {
        this.videoEl = videoElement;
        this.canvasEl = canvasElement;
        if (this.canvasEl) { this.ctx = this.canvasEl.getContext('2d', { willReadFrequently: true }); }
    }
    setSensitivity(type, val) { if (type === 'audio') this.audioThresh = val; if (type === 'camera') this.motionThresh = val; }
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
            if (this.audioCtx.state === 'running') this.audioCtx.suspend();
        } else if (enable && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        this.checkLoop();
    }
    async toggleCamera(enable) {
        this.mode.camera = enable;
        if (enable) {
            if (!this.videoEl) {
                this.videoEl = document.createElement('video');
                this.videoEl.setAttribute('autoplay', '');
                this.videoEl.setAttribute('playsinline', '');
                this.videoEl.style.display = 'none';
                document.body.appendChild(this.videoEl);
            }
            if (!this.canvasEl) {
                this.canvasEl = document.createElement('canvas');
                this.canvasEl.width = 64;
                this.canvasEl.height = 64;
                this.canvasEl.style.display = 'none';
                document.body.appendChild(this.canvasEl);
                this.ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
            }

            if (!this.videoEl.srcObject) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } } });
                    this.videoEl.srcObject = stream;
                    this.videoEl.onloadedmetadata = () => {
                        if (this.canvasEl) {
                            this.canvasEl.width = 64;
                            this.canvasEl.height = 64;
                        }
                    };
                    this.onStatusUpdate("Camera Active");
                } catch (e) {
                    console.error("Camera Init Failed", e);
                    this.onStatusUpdate("Camera Failed: " + e.message);
                    this.mode.camera = false;
                }
            }
        } else if (!enable && this.videoEl && this.videoEl.srcObject) {
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
        let audioLevel = -120;
        let cameraLevel = 0;
        if (this.mode.audio) audioLevel = this.processAudio();
        if (this.mode.camera) cameraLevel = this.processCamera();
        if (this.calibrationCallback) {
            this.calibrationCallback({ audio: audioLevel, camera: cameraLevel });
        }
        this.loopId = requestAnimationFrame(() => this.loop());
    }
    processAudio() {
        if (!this.analyser) return -120;
        const buffer = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(buffer);
        let maxVal = -Infinity, maxIdx = -1;
        const hzPerBin = this.audioCtx.sampleRate / 2 / buffer.length;
        const startBin = Math.floor(200 / hzPerBin);
        const endBin = Math.floor(700 / hzPerBin);
        for (let i = startBin; i < endBin; i++) {
            if (buffer[i] > maxVal) {
                maxVal = buffer[i];
                maxIdx = i;
            }
        }
        if (maxVal > this.audioThresh) {
            const freq = maxIdx * hzPerBin;
            const match = this.TONES.find(t => Math.abs(t.f - freq) < (t.f * 0.04));
            if (match) { this.trigger(match.n, 'audio'); }
        }
        return maxVal;
    }
    processCamera() {
        if (!this.videoEl || !this.videoEl.videoWidth || !this.ctx) return 0;
        this.ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
        const frame = this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
        const data = frame.data;

        if (!this.prevFrame) {
            this.prevFrame = new Uint8ClampedArray(data);
            return 0;
        }
        let diffScore = 0, rSum = 0, gSum = 0, bSum = 0, pxCount = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const diff = Math.abs(r - this.prevFrame[i]) + Math.abs(g - this.prevFrame[i + 1]) + Math.abs(b - this.prevFrame[i + 2]);
            if (diff > 50) {
                diffScore++;
                rSum += r;
                gSum += g;
                bSum += b;
                pxCount++;
            }
        }
        this.prevFrame.set(data);
        if (diffScore > this.motionThresh) {
            this.isFlashing = true;
            this.flashFrames++;
            const avgR = rSum / pxCount, avgG = gSum / pxCount, avgB = bSum / pxCount;
            const brightness = (avgR + avgG + avgB) / 3;
            const [h, s, l] = this.rgbToHsl(avgR, avgG, avgB);
            const quality = brightness * (s + 0.5);
            if (quality > this.peakBrightness) {
                this.peakBrightness = quality;
                this.peakColorData = { h: Math.round(h * 360), s, l };
            }
        } else {
            if (this.isFlashing) {
                if (this.flashFrames > 2 && this.peakColorData) {
                    this.identifyColor(this.peakColorData);
                }
                this.isFlashing = false;
                this.flashFrames = 0;
                this.peakBrightness = 0;
                this.peakColorData = null;
            }
        }
        return diffScore;
    }
    identifyColor(data) {
        const { h, s } = data;
        if (s < 0.25) { this.trigger(7, 'camera-white'); return; }
        if (h > 350 || h < 10) { this.trigger(3, 'camera'); return; }
        const match = this.COLORS.find(c => (h >= c.hue - c.range && h <= c.hue + c.range));
        if (match) this.trigger(match.n, 'camera');
    }
    trigger(num, source) {
        const now = Date.now();
        if (now - this.lastTriggerTime < this.COOLDOWN) return;
        this.lastTriggerTime = now;
        this.onTrigger(num, source);
    }
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
