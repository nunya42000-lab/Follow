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
            this.onStatus("Loading AI... 🧠");
            try {
                // 1. Load the Wasm binary from local folder
                const vision = await FilesetResolver.forVisionTasks("./wasm");
                
                // 2. Load the Model from local folder
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
        
        // Only process if video has advanced
        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            
            // Generate Timestamp for MediaPipe
            const startTimeMs = performance.now();
            try {
                const results = this.recognizer.recognizeForVideo(this.video, startTimeMs);
                this.process(results);
            } catch(e) {
                // Occasional glitches in stream can cause MP errors, just ignore frame
            }
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
            // This determines Palm Orientation regardless of screen position
            const dx = lm[9].x - lm[0].x;
            const dy = lm[9].y - lm[0].y;
            
            let dir = "";
            
            // Determine Major Axis (Horizontal vs Vertical)
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal
                // Note: Camera is usually mirrored. 
                // dx < 0 means pointing LEFT in raw coords (0 is left), 
                // but visually looks like pointing RIGHT on a mirrored selfie cam.
                dir = dx < 0 ? "right" : "left"; 
            } else {
                // Vertical
                // In Computer Vision (0,0) is Top-Left.
                // dy < 0 means 9 is ABOVE 0 (Pointing Up)
                // dy > 0 means 9 is BELOW 0 (Pointing Down)
                dir = dy < 0 ? "up" : "down"; 
            }

            if (fingers === 0) gesture = "hand_fist";
            else gesture = `hand_${fingers}_${dir}`;
        }

        // Debounce Logic: Buffer results to prevent flickering
        this.history.push(gesture);
        if (this.history.length > this.requiredFrames) this.history.shift();
        
        const candidate = this.history[0];
        // Only trigger if we have N identical frames and it's not "none"
        if (candidate !== "none" && this.history.every(g => g === candidate)) {
            this.onTrigger(candidate);
            this.cooldown = 25; // ~0.8 seconds cooldown (at 30fps)
            this.history = [];
        }
    }

    countFingers(lm) {
        let count = 0;
        // Thumb: Compare X coordinates
        // Logic assumes Right Hand for simplicity (Left hand mirrors this).
        // A simple generic check is if the Tip(4) is further out than IP(3)
        // relative to the palm center, but X-check usually works fine for selfies.
        if (lm[4].x < lm[3].x && lm[4].x < lm[2].x) count++;
        
        // Fingers: Compare distance from wrist
        // Tip must be significantly further from wrist than the PIP joint
        const w = lm[0]; // Wrist
        
        const isExtended = (tip, pip) => {
            const dTip = Math.hypot(tip.x - w.x, tip.y - w.y);
            const dPip = Math.hypot(pip.x - w.x, pip.y - w.y);
            return dTip > (dPip * 1.15); // Threshold
        };
        
        if (isExtended(lm[8], lm[6])) count++;   // Index
        if (isExtended(lm[12], lm[10])) count++; // Middle
        if (isExtended(lm[16], lm[14])) count++; // Ring
        if (isExtended(lm[20], lm[18])) count++; // Pinky

        return Math.min(5, count);
    }
}
