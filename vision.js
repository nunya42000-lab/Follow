// Import from YOUR local file (Offline Mode)
import { FilesetResolver, GestureRecognizer } from "./wasm/vision_bundle.js";

export class VisionEngine {
    constructor(onTrigger, onStatus) {
        this.onTrigger = onTrigger;
        this.onStatus = onStatus;
        this.recognizer = null;
        this.video = null;
        this.isActive = false;
        this.loopId = null;
        this.lastVideoTime = -1;
        
        // Debounce: Require gesture to hold for 5 frames to prevent flickering
        this.history = []; 
        this.requiredFrames = 5;
        this.cooldown = 0;
    }

    async start() {
        if (!this.recognizer) {
            this.onStatus("Loading AI (Offline)... 🧠");
            try {
                // 1. Load Wasm from LOCAL folder
                const vision = await FilesetResolver.forVisionTasks("./wasm");
                
                // 2. Load Model from LOCAL folder
                this.recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "./wasm/gesture_recognizer.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
            } catch (e) {
                console.error("Vision Init Error:", e);
                this.onStatus("AI Failed ❌ (Check Files)");
                return;
            }
        }

        if (this.isActive) return;

        // Create hidden video element
        this.video = document.createElement("video");
        this.video.setAttribute("autoplay", "");
        this.video.setAttribute("playsinline", "");
        this.video.style.display = "none";
        document.body.appendChild(this.video);

        try {
            // Front Camera
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: 320, height: 240 } 
            });
            this.video.srcObject = stream;
            this.video.onloadeddata = () => {
                this.isActive = true;
                this.predict();
                this.onStatus("Hand Tracking ON 🖐️");
            };
        } catch (e) {
            console.error("Camera Error:", e);
            this.onStatus("Cam Blocked 🚫");
        }
    }

        stop() {
        this.isActive = false;
        if (this.video) {
            if (this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(t => t.stop());
            }
            this.video.remove();
            this.video = null; // Clear reference
        }
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.onStatus("Vision Off 🌑");
    }

    predict() {
        if (!this.isActive || !this.recognizer || !this.video) return;

        const startTimeMs = Date.now();
        
        try {
            const results = this.recognizer.recognizeForVideo(this.video, startTimeMs);
            this.process(results);
        } catch(e) { 
            console.error("Vision Frame Error", e); 
        }

        this.loopId = requestAnimationFrame(() => this.predict());
    }

    process(results) {
        // ... (The rest of your process function remains the same)

        if (this.cooldown > 0) { this.cooldown--; return; }

        let gesture = "none";

        if (results.landmarks.length > 0) {
            const lm = results.landmarks[0]; 
            const fingers = this.countFingers(lm);
            
            // Direction Logic
            const dx = lm[9].x - lm[0].x;
            const dy = lm[9].y - lm[0].y;
            let dir = "";
            
            if (Math.abs(dx) > Math.abs(dy)) {
                dir = dx < 0 ? "right" : "left"; 
            } else {
                dir = dy < 0 ? "up" : "down"; 
            }

            if (fingers === 0) gesture = "hand_fist";
            else gesture = `hand_${fingers}_${dir}`;
        }

        // Debounce Logic
        this.history.push(gesture);
        if (this.history.length > this.requiredFrames) this.history.shift();
        
        const candidate = this.history[0];
        if (candidate !== "none" && this.history.every(g => g === candidate)) {
            this.onTrigger(candidate);
            this.cooldown = 25; 
            this.history = [];
        }
    }

    countFingers(lm) {
        let count = 0;
        // Thumb
        if (lm[4].x < lm[3].x && lm[4].x < lm[2].x) count++;
        
        // Fingers
        const w = lm[0]; 
        const isExtended = (tip, pip) => {
            const dTip = Math.hypot(tip.x - w.x, tip.y - w.y);
            const dPip = Math.hypot(pip.x - w.x, pip.y - w.y);
            return dTip > (dPip * 1.15); 
        };
        
        if (isExtended(lm[8], lm[6])) count++;   
        if (isExtended(lm[12], lm[10])) count++; 
        if (isExtended(lm[16], lm[14])) count++; 
        if (isExtended(lm[20], lm[18])) count++; 

        return Math.min(5, count);
    }
}
