/* ========================================
   FILE: vision.js
   ======================================== */

export class VisionEngine {
    constructor() {
        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.stream = null;
        this.recorder = null;
        this.chunks = [];
        this.currentVideoURL = null;
    }

    async start(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: true
            });
            this.video.srcObject = this.stream;
            container.appendChild(this.video);
            
            // Setup MediaRecorder
            this.recorder = new MediaRecorder(this.stream);
            this.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data);
            };
            this.recorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'video/mp4' });
                this.currentVideoURL = URL.createObjectURL(blob);
                this.chunks = [];
                // Dispatch event so app.js knows a recording is ready
                window.dispatchEvent(new CustomEvent('video-ready', { detail: this.currentVideoURL }));
            };
        } catch (err) {
            console.error("Camera access denied:", err);
        }
    }

    startRecording() {
        if (this.recorder && this.recorder.state === "inactive") {
            this.chunks = [];
            this.recorder.start();
        }
    }

    stopRecording() {
        if (this.recorder && this.recorder.state === "recording") {
            this.recorder.stop();
        }
    }

    holdPause() {
        this.video.pause();
    }

    releasePause() {
        this.video.play();
    }

    setSpeed(value) {
        this.video.playbackRate = parseFloat(value);
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.video.remove();
    }
}
