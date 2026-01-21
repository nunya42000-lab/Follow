// ar_core.js
// The lightweight "Eye" of the system.
export class ARCore {
    constructor(callbacks) {
        this.callbacks = callbacks || {};
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.audioCtx = null;
        this.analyser = null;
        this.dataArray = null;
        this.rafId = null;
    }

    async toggle(active) {
        if (this.isActive === active) return;
        this.isActive = active;

        if (active) {
            await this.initVideo();
            await this.initAudio();
            this.loop();
        } else {
            this.stop();
        }
    }

    async initVideo() {
        if (!this.video) {
            this.video = document.createElement('video');
            this.video.id = 'sensor-video-feed'; // ID matches Developer Tools
            this.video.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; object-fit:cover; z-index:-1; opacity:0.6; pointer-events:none;";
            this.video.autoplay = true;
            this.video.playsInline = true;
            this.video.setAttribute('playsinline', '');
            document.body.appendChild(this.video);
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            this.video.srcObject = stream;
        } catch (e) {
            console.error("Camera denied:", e);
            alert("Camera permission required for AR tools.");
        }
    }

    async initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            this.audioCtx = new AudioContext();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = this.audioCtx.createMediaStreamSource(stream);
                source.connect(this.analyser);
            } catch(e) { console.warn("Audio denied"); }
        } else if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    loop() {
        if (!this.isActive) return;

        // 1. Process Audio
        let audioVol = 0;
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            if (this.dataArray.length > 0) {
                const avg = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
                audioVol = avg; // 0-255 range
            }
        }

        // 2. Send Data to Dev UI
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate({
                audio: audioVol,
                videoReady: !!(this.video && this.video.readyState === 4)
            });
        }

        this.rafId = requestAnimationFrame(() => this.loop());
    }

    stop() {
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(t => t.stop());
            this.video.srcObject = null;
        }
        if (this.audioCtx) this.audioCtx.suspend();
        cancelAnimationFrame(this.rafId);
        
        // Cleanup DOM
        if (this.video) {
            this.video.remove();
            this.video = null;
        }
        this.isActive = false;
    }
}
