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
        }
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.onStatus("Vision Off 🌑");
    }

        predict() {
        if (!this.isActive) return;

        // --- ECO MODE LOGIC (BATTERY SAVER) ---
        // If Eco Mode is on, we skip frames to run at ~15fps instead of 60fps
        this.frameCount = (this.frameCount || 0) + 1;
        const isEco = window.appSettings?.isEcoModeEnabled;
        
        // Skip 3 out of 4 frames if Eco Mode is active
        if (isEco && this.frameCount % 4 !== 0) {
            this.loopId = requestAnimationFrame(() => this.predict());
            return;
        }

        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            const startTimeMs = performance.now();
            
            try {
                const results = this.recognizer.recognizeForVideo(this.video, startTimeMs);
                
                // --- SKELETON DEBUG OVERLAY ---
                // If Developer Mode enabled this, we draw the wireframe
                if (window.appSettings?.isSkeletonDebugEnabled) {
                    this._drawDebugSkeleton(results);
                }
                
                this.process(results);
            } catch(e) { console.error("Vision Frame Error", e); }
        }
        
        this.loopId = requestAnimationFrame(() => this.predict());
    }

            process(results) { // <--- Add this line
        if (!results.landmarks || !results.landmarks[0]) return; // Add safety check
        const lm = results.landmarks[0]; 
        
        const extensionThreshold = window.appSettings?.fingerExtensionThreshold || 1.15;
        const fingers = this.countFingers(lm, extensionThreshold);
        
        // You likely need to emit/trigger the gesture here, e.g.:
        // this.onTrigger(fingers);
    } // <--- Add closing brace

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
