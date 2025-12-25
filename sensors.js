export class SensorEngine {
    constructor(onTrigger, onStatusUpdate) {
        this.onTrigger = onTrigger;
        this.onStatusUpdate = onStatusUpdate;
        this.calibrationCallback = null;
        
        // Color definitions for "Simon" inputs (Hue ranges)
        this.COLORS = [
            { n: 3, hue: 0, range: 12, satMin: 0.5 },   // Red
            { n: 9, hue: 30, range: 15, satMin: 0.5 },  // Orange
            { n: 4, hue: 60, range: 20, satMin: 0.4 },  // Yellow
            { n: 5, hue: 120, range: 30, satMin: 0.3 }, // Green
            { n: 6, hue: 180, range: 25, satMin: 0.3 }, // Cyan
            { n: 2, hue: 240, range: 25, satMin: 0.4 }, // Blue
            { n: 1, hue: 275, range: 20, satMin: 0.3 }, // Purple
            { n: 8, hue: 315, range: 25, satMin: 0.3 }  // Pink/Magenta
        ];

        // Frequencies for Audio Tones
        this.TONES = [
            { n: 1, f: 261 }, { n: 2, f: 293 }, { n: 3, f: 329 },
            { n: 4, f: 349 }, { n: 5, f: 392 }, { n: 6, f: 440 },
            { n: 7, f: 493 }, { n: 8, f: 523 }, { n: 9, f: 587 }
        ];

        // State
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        
        this.isListening = false;
        this.isViewing = false;
        
        // Processing limits
        this.lastTriggerTime = 0;
        this.COOLDOWN = 400; // ms
        
        // Camera logic
        this.baseColorData = null; // Calibration baseline
        this.isFlashing = false;
        this.flashFrames = 0;
        this.peakBrightness = 0;
        this.peakColorData = null;
        this.camSensitivity = 30; // % diff required
        
        // NEW: Cover Detection
        this.coverFrames = 0;
        this.COVER_THRESHOLD_FRAMES = 25; // Approx 1 second at 30fps
        this.brightnessHistory = [];

        // Audio logic
        this.audioThreshold = -85; // dB
        this.silenceCounter = 0;
        this.isToneDetected = false;

        // Shake logic
        this.lastX = null; this.lastY = null; this.lastZ = null;
        this.shakeThreshold = 15;
        this.initShakeDetection();
    }

    initShakeDetection() {
        if ('ondevicemotion' in window) {
            window.addEventListener('devicemotion', (e) => {
                const acc = e.accelerationIncludingGravity;
                if (!acc) return;
                
                if (this.lastX !== null) {
                    const deltaX = Math.abs(this.lastX - acc.x);
                    const deltaY = Math.abs(this.lastY - acc.y);
                    const deltaZ = Math.abs(this.lastZ - acc.z);

                    if (deltaX + deltaY + deltaZ > this.shakeThreshold) {
                        this.trigger(null, 'shake');
                    }
                }
                this.lastX = acc.x;
                this.lastY = acc.y;
                this.lastZ = acc.z;
            }, { passive: true });
        }
    }

    startAudio() {
        if (this.isListening) return;
        this.isListening = true;
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
        }
        
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            this.processAudio();
        }).catch(e => console.error("Mic error", e));
    }

    stopAudio() {
        this.isListening = false;
        if (this.microphone) { this.microphone.disconnect(); this.microphone = null; }
    }

    processAudio() {
        if (!this.isListening) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate average volume (dB approx)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        const db = (average / 255) * 100 - 100; // Rough map to -100..0 range

        // Tone Detection (Simplistic Peak Frequency)
        if (db > this.audioThreshold) {
            // Find peak frequency
            let maxVal = -1;
            let maxIndex = -1;
            for(let i=0; i<bufferLength; i++) {
                if(dataArray[i] > maxVal) { maxVal = dataArray[i]; maxIndex = i; }
            }
            
            const nyquist = this.audioContext.sampleRate / 2;
            const peakFreq = maxIndex * (nyquist / bufferLength);

            if (!this.isToneDetected) {
                // Find closest note
                let closest = null;
                let minDiff = Infinity;
                this.TONES.forEach(t => {
                    const diff = Math.abs(t.f - peakFreq);
                    if(diff < minDiff) { minDiff = diff; closest = t; }
                });

                // Tolerance 30Hz
                if (closest && minDiff < 30) {
                    this.trigger(closest.n, 'audio');
                    this.isToneDetected = true;
                }
            }
        } else {
            this.isToneDetected = false;
        }

        if (this.onStatusUpdate) this.onStatusUpdate({ audioLevel: db, camDiff: 0 });
        requestAnimationFrame(() => this.processAudio());
    }

    startCamera() {
        if (this.isViewing) return;
        this.isViewing = true;
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => {
            this.video.srcObject = stream;
            this.video.play();
            requestAnimationFrame(() => this.processCamera());
        }).catch(e => console.error("Cam error", e));
    }

    stopCamera() {
        this.isViewing = false;
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(t => t.stop());
            this.video = null;
        }
    }

    processCamera() {
        if (!this.isViewing || !this.video || this.video.readyState !== 4) {
            if(this.isViewing) requestAnimationFrame(() => this.processCamera());
            return;
        }

        if (this.canvas.width !== 50) { // Low res for performance
            this.canvas.width = 50;
            this.canvas.height = 50;
        }

        this.ctx.drawImage(this.video, 0, 0, 50, 50);
        const frame = this.ctx.getImageData(0, 0, 50, 50);
        const data = frame.data;
        
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        const pxCount = data.length / 4;
        r = Math.round(r / pxCount);
        g = Math.round(g / pxCount);
        b = Math.round(b / pxCount);

        const brightness = (r + g + b) / 3;

        // --- CAMERA COVER LOGIC ---
        // If brightness is very low (< 10 out of 255) for consecutive frames
        if (brightness < 10) {
            this.coverFrames++;
            if (this.coverFrames === this.COVER_THRESHOLD_FRAMES) {
                this.trigger(null, 'camera-cover');
                // Don't repeatedly trigger, wait for light again
            }
        } else {
            this.coverFrames = 0;
        }

        // --- FLASH DETECTION LOGIC ---
        // Auto-Calibrate baseline if first frame or stable
        if (!this.baseColorData) {
            this.baseColorData = { r, g, b, brightness };
        } else {
            // Drift baseline slowly
            this.baseColorData.r = (this.baseColorData.r * 0.95) + (r * 0.05);
            this.baseColorData.g = (this.baseColorData.g * 0.95) + (g * 0.05);
            this.baseColorData.b = (this.baseColorData.b * 0.95) + (b * 0.05);
            this.baseColorData.brightness = (this.baseColorData.brightness * 0.95) + (brightness * 0.05);
        }

        const diffScore = this.calculateDiff(r, g, b, brightness);
        
        // Pass stats to UI for calibration bar
        if (this.onStatusUpdate) this.onStatusUpdate({ audioLevel: -100, camDiff: diffScore });

        requestAnimationFrame(() => this.processCamera());
    }

    calculateDiff(r, g, b, br) {
        // Difference from baseline
        const dR = Math.abs(r - this.baseColorData.r);
        const dG = Math.abs(g - this.baseColorData.g);
        const dB = Math.abs(b - this.baseColorData.b);
        const dBr = br - this.baseColorData.brightness; // Only care if BRIGHTER

        const diffScore = (dR + dG + dB) / 3;
        
        // Threshold check (using sensitivity from settings via callback if I linked it, 
        // but simple internal logic: compare relative jump)
        
        if (dBr > 15 && diffScore > 10) { // Flash detected
            if (!this.isFlashing) {
                this.isFlashing = true;
                this.flashFrames = 0;
                this.peakBrightness = br;
                this.peakColorData = this.rgbToHsl(r, g, b);
            } else {
                // During flash, track peak
                if (br > this.peakBrightness) {
                    this.peakBrightness = br;
                    this.peakColorData = this.rgbToHsl(r, g, b);
                }
                this.flashFrames++;
            }
        } else {
            // Flash ended
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
        
        // Normalize for UI bar (0-100)
        return Math.min(100, diffScore * 2);
    }

    identifyColor(data) {
        const { h, s } = data;
        
        // Low Saturation = White flash usually
        if (s < 0.25) { 
            // Often white flash -> map to red or special
            // For now, let's map to '3' (Red) or just generic '1'
            // We'll skip white flash logic for specific inputs to avoid false positives 
            // unless we have specific mapping.
            return; 
        }

        // Wrap-around for Red
        if (h > 350 || h < 10) { this.trigger(3, 'camera'); return; }

        const match = this.COLORS.find(c => (h >= c.hue - c.range && h <= c.hue + c.range));
        if (match) this.trigger(match.n, 'camera');
    }

    trigger(num, source) {
        const now = Date.now();
        // Shake and Cover have their own logic, no cooldown or strict number requirement
        if(source === 'shake' || source === 'camera-cover') {
            if (now - this.lastTriggerTime < 1000) return; // 1 sec cooldown for system actions
            this.lastTriggerTime = now;
            this.onTrigger(null, source);
            return;
        }

        if (now - this.lastTriggerTime < this.COOLDOWN) return;
        this.lastTriggerTime = now;
        this.onTrigger(num, source);
    }

    rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) { h = s = 0; } 
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return { h, s, l };
    }
}
