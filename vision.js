 // vision.js
import { FilesetResolver, GestureRecognizer } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.js";

export class VisionEngine {
    constructor(onTrigger, onStatus) {
        this.onTrigger = onTrigger;
        this.onStatus = onStatus;
        this.recognizer = null;
        this.video = null;
        this.isActive = false;
        this.loopId = null;
        this.lastVideoTime = -1;
        
        // Debounce: Require gesture to hold for N frames to prevent flickering
        this.history = []; 
        this.requiredFrames = 5;
        this.cooldown = 0;
    }

    async start() {
        if (!this.recognizer) {
            this.onStatus("Loading AI... 🧠");
            try {
                // For OFFLINE support later, change these URLs to "./wasm"
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
                this.recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
            } catch (e) {
                console.error(e);
                this.onStatus("AI Failed ❌");
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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } });
            this.video.srcObject = stream;
            this.video.onloadeddata = () => {
                this.isActive = true;
                this.predict();
                this.onStatus("Hand Tracking ON 🖐️");
            };
        } catch (e) {
            this.onStatus("Camera Blocked 🚫");
        }
    }

    stop() {
        this.isActive = false;
        if (this.video) {
            if (this.video.srcObject) this.video.srcObject.getTracks().forEach(t => t.stop());
            this.video.remove();
        }
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.onStatus("Vision Off 🌑");
    }

    predict() {
        if (!this.isActive) return;
        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            const results = this.recognizer.recognizeForVideo(this.video, Date.now());
            this.process(results);
        }
        this.loopId = requestAnimationFrame(() => this.predict());
    }

    process(results) {
        if (this.cooldown > 0) { this.cooldown--; return; }

        let gesture = "none";

        if (results.landmarks.length > 0) {
            const lm = results.landmarks[0]; // 21 points of the hand
            const fingers = this.countFingers(lm);
            
            // Direction Logic: Vector from Wrist(0) to Middle Finger MCP(9)
            const dx = lm[9].x - lm[0].x;
            const dy = lm[9].y - lm[0].y;
            
            let dir = "";
            if (Math.abs(dx) > Math.abs(dy)) {
                dir = dx < 0 ? "right" : "left"; // Camera is mirrored
            } else {
                dir = dy < 0 ? "up" : "down"; // Y is negative going UP in CV
            }

            if (fingers === 0) gesture = "hand_fist";
            else gesture = `hand_${fingers}_${dir}`;
        }

        // Debounce Logic
        this.history.push(gesture);
        if (this.history.length > this.requiredFrames) this.history.shift();
        
        const candidate = this.history[0];
        // Only trigger if we have N identical frames and it's not "none"
        if (candidate !== "none" && this.history.every(g => g === candidate)) {
            this.onTrigger(candidate);
            this.cooldown = 25; // ~1 second cooldown
            this.history = [];
        }
    }

    countFingers(lm) {
        let count = 0;
        // Thumb (Compare X coords)
        if (lm[4].x < lm[3].x && lm[4].x < lm[2].x) count++;
        
        // Fingers (Compare distance from wrist: Tip must be further than PIP)
        const w = lm[0];
        const isExtended = (t, p) => Math.hypot(t.x-w.x, t.y-w.y) > Math.hypot(p.x-w.x, p.y-w.y) * 1.2;
        
        if (isExtended(lm[8], lm[6])) count++;   // Index
        if (isExtended(lm[12], lm[10])) count++; // Middle
        if (isExtended(lm[16], lm[14])) count++; // Ring
        if (isExtended(lm[20], lm[18])) count++; // Pinky

        return Math.min(5, count);
    }
                                                                            }
      
