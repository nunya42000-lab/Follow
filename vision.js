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
        
        // Cleanup Video
        if (this.video) {
            if (this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(t => t.stop());
            }
            this.video.remove();
            this.video = null;
        }

        // Cleanup Debug Canvas (New)
        if (this.debugCanvas) {
            this.debugCanvas.remove();
            this.debugCanvas = null;
            this.debugCtx = null;
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
// ... inside vision.js ...
    process(results) {
        let gesture = "none";

        if (results.landmarks && results.landmarks.length > 0) {
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

            // --- DIAGNOSTIC HOOK START ---
            const devModal = document.getElementById('developer-modal');
            if (devModal && !devModal.classList.contains('hidden')) {
                const logger = window.logToDevBox || (typeof logToDevBox !== 'undefined' ? logToDevBox : null);
                const drawer = window.drawDevSkeleton || (typeof drawDevSkeleton !== 'undefined' ? drawDevSkeleton : null);
                
                if (logger) {
                    logger("VISION", `Fingers: ${fingers} | Dir: ${dir} | dx: ${dx.toFixed(2)} dy: ${dy.toFixed(2)}`);
                }
                if (drawer) {
                    drawer(lm);
                }
            }
            // --- DIAGNOSTIC HOOK END ---

            if (fingers === 0) {
                gesture = "hand_fist";
            } else {
                gesture = `hand_${fingers}_${dir}`;
            }
        }

        // Debounce Logic
        this.history.push(gesture);
        if (this.history.length > this.requiredFrames) {
            this.history.shift();
        }
        
        const candidate = this.history[0];
        if (candidate !== "none" && this.history.every(g => g === candidate)) {
            if (this.cooldown <= 0) {
                this.onTrigger(candidate);
                this.cooldown = 25; 
                this.history = [];
            }
        }
        
        if (this.cooldown > 0) this.cooldown--;
                    }
    

    // --- MOVE THESE FUNCTIONS OUTSIDE process() ---

    _drawDebugSkeleton(results) {
        if (!this.debugCanvas) {
            this.debugCanvas = document.createElement('canvas');
            this.debugCanvas.style.position = 'fixed';
            this.debugCanvas.style.top = '0';
            this.debugCanvas.style.left = '0';
            this.debugCanvas.style.width = '100vw';
            this.debugCanvas.style.height = '100vh';
            this.debugCanvas.style.zIndex = '9999';
            this.debugCanvas.style.pointerEvents = 'none';
            document.body.appendChild(this.debugCanvas);
            this.debugCtx = this.debugCanvas.getContext('2d');
        }

        const ctx = this.debugCtx;
        const canvas = this.debugCanvas;

        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                this._drawHand(ctx, landmarks, canvas.width, canvas.height);
            }
        }
    }

    _drawHand(ctx, landmarks, w, h) {
        const connectors = [
            [0, 1], [1, 2], [2, 3], [3, 4],           
            [0, 5], [5, 6], [6, 7], [7, 8],           
            [5, 9], [9, 10], [10, 11], [11, 12],      
            [9, 13], [13, 14], [14, 15], [15, 16],    
            [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] 
        ];

        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#00FF00"; 

        for (const [start, end] of connectors) {
            const p1 = landmarks[start];
            const p2 = landmarks[end];
            ctx.beginPath();
            ctx.moveTo((1.0 - p1.x) * w, p1.y * h); 
            ctx.lineTo((1.0 - p2.x) * w, p2.y * h);
            ctx.stroke();
        }

        ctx.fillStyle = "#FF0000"; 
        for (const point of landmarks) {
            ctx.beginPath();
            ctx.arc((1.0 - point.x) * w, point.y * h, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    countFingers(lm) {
    let count = 0;

    // Finger Tips: 8(index), 12(middle), 16(ring), 20(pinky)
    // Finger Bases (PIP joints): 6(index), 10(middle), 14(ring), 18(pinky)
    const fingerIndices = [
        { tip: 8, base: 6 },
        { tip: 12, base: 10 },
        { tip: 16, base: 14 },
        { tip: 20, base: 18 }
    ];

    // 1. Check the 4 fingers
    fingerIndices.forEach(f => {
        // If the tip is higher (lower Y value) than the base joint, it's extended
        if (lm[f.tip].y < lm[f.base].y) {
            count++;
        }
    });

    // 2. Special Logic for the Thumb (Landmark 4)
    // The thumb is unique; we check if it's stretched out horizontally 
    // relative to the index finger base (Landmark 5).
    // We check the X-axis instead of Y.
    const thumbTip = lm[4];
    const thumbBase = lm[3];
    const indexBase = lm[5];

    // Determine if hand is left or right based on palm orientation
    const isRightHand = lm[17].x > lm[5].x; 
    
    if (isRightHand) {
        if (thumbTip.x < thumbBase.x - 0.02) count++;
    } else {
        if (thumbTip.x > thumbBase.x + 0.02) count++;
    }

    return count;
}   
}
