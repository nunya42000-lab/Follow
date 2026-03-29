/* ========================================
   FILE: vision.js
   ======================================== */
export class VisionEngine {
    constructor() {
        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.className = 'ar-background-video'; // Matches your CSS
        this.stream = null;
        this.recorder = null;
        this.chunks = [];
        this.currentVideoURL = null;
    }
async start() {
    this.isActive = true;
    this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
    });

    // Reuse the constructor's video element instead of creating a new one
    this.video.srcObject = this.stream;
    
    // CRITICAL: Ensure attributes are set correctly for iOS/Android
    this.video.setAttribute('playsinline', ''); 
    this.video.muted = true;
    this.video.autoplay = true;

    // Await the play promise to handle potential autoplay blocks
    try {
        await this.video.play();
    } catch (err) {
        console.error("Video play interrupted:", err);
    }

    return this.video;
}
   
    
            this.recorder = new MediaRecorder(this.stream);
            this.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data);
            };
            this.recorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'video/mp4' });
                this.currentVideoURL = URL.createObjectURL(blob);
                this.chunks = [];
                window.dispatchEvent(new CustomEvent('video-ready', { detail: this.currentVideoURL }));
            };
            return this.video;
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

    holdPause() { this.video.pause(); }
    releasePause() { this.video.play(); }
    setSpeed(value) { this.video.playbackRate = parseFloat(value); }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.video.remove();
    }
}
