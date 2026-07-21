// Import from YOUR local file (Offline Mode)
// NOTE: FilesetResolver/GestureRecognizer used to be a static import here. A static import that
// fails (this WASM bundle is a real local dependency that may not always be present) fails this
// entire module - which cascades to fail app.js too, since app.js imports VisionEngine from here.
// It's now dynamically imported inside start() below, right where it's used, so a missing WASM
// bundle only disables hand tracking instead of the whole app.

// --- 1. EXHAUSTIVE 64-STATE ID MAP ---
// Motion/transition gestures - one pose changing into another within ~900ms. IDs start at 400
// to stay clear of the 0-63 static pose range. Chosen pairs read naturally as an action rather
// than just two shapes: Fist->Open reads as "throwing something away", Open->Fist as "grabbing".
const TRANSITION_GESTURES = {
    '0->62':   { id: 400, label: '🗑️ Throw (Fist → Open)' },
    '62->0':   { id: 401, label: '✊ Grab (Open → Fist)' },
    '100->62': { id: 402, label: '👐 Release (Pinch → Open)' },
    '62->100': { id: 403, label: '🤏 Snatch (Open → Pinch)' },
    '0->16':   { id: 404, label: '☝️ Point Out (Fist → 1 Finger)' },
};

const GESTURE_DICTIONARY = {
    0: 'FIST_KNUCKLES_FWD',           1: 'FIST_PALM_FWD',
    2: 'PINKY_KNUCKLES_FWD',          3: 'PINKY_PALM_FWD',
    4: 'RING_KNUCKLES_FWD',           5: 'RING_PALM_FWD',
    6: 'RING_PINKY_KNUCKLES_FWD',     7: 'RING_PINKY_PALM_FWD',
    8: 'MIDDLE_KNUCKLES_FWD',         9: 'MIDDLE_PALM_FWD',
    10: 'MIDDLE_PINKY_KNUCKLES_FWD',  11: 'MIDDLE_PINKY_PALM_FWD',
    12: 'CHOPSTICKS_KNUCKLES_FWD',    13: 'CHOPSTICKS_PALM_FWD',
    14: 'THREE_FINGERS_NO_INDEX_K',   15: 'THREE_FINGERS_NO_INDEX_P',
    16: 'INDEX_KNUCKLES_FWD',         17: 'INDEX_PALM_FWD',
    18: 'ROCK_ON_KNUCKLES_FWD',       19: 'ROCK_ON_PALM_FWD',
    20: 'INDEX_RING_KNUCKLES_FWD',    21: 'INDEX_RING_PALM_FWD',
    22: 'INDEX_RING_PINKY_K',         23: 'INDEX_RING_PINKY_P',
    24: 'PEACE_KNUCKLES_FWD',         25: 'PEACE_PALM_FWD',
    26: 'PEACE_PINKY_KNUCKLES_FWD',   27: 'PEACE_PINKY_PALM_FWD',
    28: 'THREE_FINGERS_KNUCKLES_FWD', 29: 'THREE_FINGERS_PALM_FWD',
    30: 'FOUR_FINGERS_KNUCKLES_FWD',  31: 'FOUR_FINGERS_PALM_FWD',
    32: 'THUMB_KNUCKLES_FWD',         33: 'THUMB_PALM_FWD',
    34: 'SHAKA_KNUCKLES_FWD',         35: 'SHAKA_PALM_FWD',
    36: 'THUMB_RING_KNUCKLES_FWD',    37: 'THUMB_RING_PALM_FWD',
    38: 'THUMB_RING_PINKY_K',         39: 'THUMB_RING_PINKY_P',
    40: 'THUMB_MIDDLE_KNUCKLES_FWD',  41: 'THUMB_MIDDLE_PALM_FWD',
    42: 'THUMB_MIDDLE_PINKY_K',       43: 'THUMB_MIDDLE_PINKY_P',
    44: 'THUMB_MIDDLE_RING_K',        45: 'THUMB_MIDDLE_RING_P',
    46: 'FOUR_FINGERS_NO_INDEX_K',    47: 'FOUR_FINGERS_NO_INDEX_P',
    48: 'GUN_KNUCKLES_FWD',           49: 'GUN_PALM_FWD',
    50: 'SPIDERMAN_KNUCKLES_FWD',     51: 'SPIDERMAN_PALM_FWD',
    52: 'THUMB_INDEX_RING_K',         53: 'THUMB_INDEX_RING_P',
    54: 'FOUR_FINGERS_NO_MIDDLE_K',   55: 'FOUR_FINGERS_NO_MIDDLE_P',
    56: 'SCOUT_KNUCKLES_FWD',         57: 'SCOUT_PALM_FWD',
    58: 'FOUR_FINGERS_NO_RING_K',     59: 'FOUR_FINGERS_NO_RING_P',
    60: 'FIVE_FINGERS_NO_PINKY_K',    61: 'FIVE_FINGERS_NO_PINKY_P',
    62: 'FIVE_FINGERS_KNUCKLES_FWD',  63: 'FIVE_FINGERS_PALM_FWD',
    
    // --- PRECISION MICRO-GESTURE OVERLAYS ---
    100: 'PINCH_INDEX',
    101: 'PINCH_MIDDLE',
    102: 'PINCH_RING',
    103: 'PINCH_PINKY',
    104: 'CHEF_KISS_ALL_PINCHED',
    105: 'OK_SIGN',
    600: 'THUMBS_UP',
    601: 'THUMBS_DOWN'
};

// --- 2. TEMPORAL DEBOUNCE BUFFER ---
class GestureBuffer {
    constructor(bufferSize = 4) {
        this.buffer = [];
        this.maxSize = bufferSize;
        this.currentLockedGesture = null;
    }

    pushAndEvaluate(gestureID) {
        // Reads live so the Hold Frames slider takes effect immediately without restarting tracking
        this.maxSize = (window.appSettings && window.appSettings.handHoldFrames) || 4;

        if (gestureID === null) {
            this.buffer = [];
            this.currentLockedGesture = null;
            return null;
        }

        this.buffer.push(gestureID);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }

        if (this.buffer.length === this.maxSize && this.buffer.every(val => val === this.buffer[0])) {
            this.currentLockedGesture = this.buffer[0];
            return this.currentLockedGesture;
        }

        return this.currentLockedGesture; 
    }
}

// --- 3. CORE VOLUMETRIC MATH ---
function processHandData(landmarks) {
    const wrist = landmarks[0];
    const n = landmarks.map(p => ({
        x: p.x - wrist.x,
        y: p.y - wrist.y,
        z: p.z - wrist.z
    }));

    const dist3D = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
    const nWrist = n[0];

    const T = dist3D(nWrist, n[4]) > (dist3D(nWrist, n[2]) * 1.15) ? 1 : 0;
    const I = dist3D(nWrist, n[8]) > (dist3D(nWrist, n[6]) * 1.25) ? 1 : 0;
    const M = dist3D(nWrist, n[12]) > (dist3D(nWrist, n[10]) * 1.25) ? 1 : 0;
    const R = dist3D(nWrist, n[16]) > (dist3D(nWrist, n[14]) * 1.25) ? 1 : 0;
    const P = dist3D(nWrist, n[20]) > (dist3D(nWrist, n[18]) * 1.25) ? 1 : 0;

    const baseMask = (T << 4) | (I << 3) | (M << 2) | (R << 1) | P;

    const vec1x = n[17].x - n[5].x; 
    const vec1y = n[17].y - n[5].y; 
    const vec2x = n[9].x - nWrist.x; 
    const vec2y = n[9].y - nWrist.y; 
    const crossProduct = (vec1x * vec2y) - (vec1y * vec2x);
    
    const palmFacing = crossProduct > 0 ? 1 : 0; 
    
    let gestureID = (baseMask << 1) | palmFacing;

    const pinchThreshold = 0.055; 
    const dThumbIndex = dist3D(n[4], n[8]);
    const dThumbMiddle = dist3D(n[4], n[12]);
    const dThumbRing = dist3D(n[4], n[16]);
    const dThumbPinky = dist3D(n[4], n[20]);

    const cx = (n[4].x + n[8].x + n[12].x + n[16].x + n[20].x) / 5;
    const cy = (n[4].y + n[8].y + n[12].y + n[16].y + n[20].y) / 5;
    const cz = (n[4].z + n[8].z + n[12].z + n[16].z + n[20].z) / 5;
    const centerTip = {x: cx, y: cy, z: cz};
    
    const isChefKiss = dist3D(n[4], centerTip) < 0.08 && 
                       dist3D(n[8], centerTip) < 0.08 && 
                       dist3D(n[12], centerTip) < 0.08;

    if (isChefKiss) {
        gestureID = 104;
    } else if (dThumbIndex < pinchThreshold) {
        gestureID = (M || R || P) ? 105 : 100;
    } else if (dThumbMiddle < pinchThreshold) {
        gestureID = 101;
    } else if (dThumbRing < pinchThreshold) {
        gestureID = 102;
    } else if (dThumbPinky < pinchThreshold) {
        gestureID = 103;
    } else if (T === 1 && I === 0 && M === 0 && R === 0 && P === 0) {
        // Thumb is the only finger extended - "thumb up" (id 32/33) can't tell up from down on
        // its own, since that's about which side of the hand faces the camera, not which way the
        // thumb points. Checking the thumb tip's position relative to its own base joint (not
        // just the wrist) gives a genuine, independent up/down reading.
        gestureID = (n[4].y < n[2].y) ? 600 : 601; // image y increases downward, so smaller y = higher up = thumbs up
    }

    return gestureID;
}

export class VisionEngine {
    constructor(onTrigger, onStatus) {
        this.onTrigger = onTrigger;
        this.onStatus = onStatus;
        this.recognizer = null;
        this.video = null;
        this.isActive = false;
        this.loopId = null;
        this.lastVideoTime = -1;
        this.engineBuffer = new GestureBuffer(4); // Attach buffer directly to engine state
    }

    async start() {
        if (!this.recognizer) {
            this.onStatus("Loading AI (Offline)... 🧠");
            try {
                const { FilesetResolver, GestureRecognizer } = await import("./wasm/vision_bundle.js");
                const vision = await FilesetResolver.forVisionTasks("./wasm");
                this.recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "./wasm/gesture_recognizer.task",
                        delegate: "GPU" 
                    },
                    runningMode: "VIDEO",
                    numHands: 2
                });
            } catch (e) {
                console.error("Vision Init Error:", e);
                this.onStatus("AI Failed ❌ (Check Files)");
                return;
            }
        }

        if (this.isActive) return;

        this.video = document.createElement("video");
        this.video.setAttribute("autoplay", "");
        this.video.setAttribute("playsinline", "");
        this.video.style.display = "none";
        document.body.appendChild(this.video);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 } 
                } 
            });
            this.video.srcObject = stream;
            this.video.onloadeddata = () => {
                this.isActive = true;
                this.engineBuffer.pushAndEvaluate(null); // Reset buffer on boot
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
            this.video = null;
        }

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
        
        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            try {
                const results = this.recognizer.recognizeForVideo(this.video, startTimeMs);
                this.process(results);
            } catch(e) { 
                console.error("Vision Frame Error", e); 
            }
        }

        this.loopId = requestAnimationFrame(() => this.predict());
    }

    process(results) {
        const isDebug = window.appSettings && window.appSettings.isSkeletonDebugEnabled;

        if (isDebug) {
            this._drawDebugSkeleton(results);
        } else if (this.debugCanvas && this.debugCtx) {
            this.debugCtx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
        }

        // FIX: "hand signals should be special 2 handed gestures" - Stop (both palms), Play
        // (both thumbs up), Delete (both thumbs down), Clear (both fists). Checked first, ahead
        // of normal single-hand processing, and only fires when both hands simultaneously show
        // the matching pose. Purely additive - doesn't touch or reinterpret any existing
        // single-hand pose id, so every preset and mapping built around those keeps working.
        if (results.landmarks && results.landmarks.length === 2) {
            const rawID0 = processHandData(results.landmarks[0]);
            const rawID1 = processHandData(results.landmarks[1]);
            const TWO_HAND_SIGNALS = {
                '62': { id: 'TWO_HAND_STOP', label: '✋✋ Both Palms - Stop' },
                '600': { id: 'TWO_HAND_PLAY', label: '👍👍 Both Thumbs Up - Play' },
                '601': { id: 'TWO_HAND_DELETE', label: '👎👎 Both Thumbs Down - Delete' },
                '0': { id: 'TWO_HAND_CLEAR', label: '✊✊ Both Fists - Clear' },
            };
            if (rawID0 === rawID1 && TWO_HAND_SIGNALS[rawID0]) {
                const signal = TWO_HAND_SIGNALS[rawID0];
                this.onTrigger({ id: signal.id, label: signal.label });
                this._prevStableID = null;
                return;
            }
        }

        if (results.landmarks && results.landmarks.length > 0) {
            const rawID = processHandData(results.landmarks[0]);
            const stableID = this.engineBuffer.pushAndEvaluate(rawID);

            if (stableID !== null && GESTURE_DICTIONARY[stableID]) {
                // FIX: "frozen gestures... adding motion would make them better" - poses were
                // purely static (hold one shape, done). This adds a small set of TRANSITION
                // gestures - one pose changing into another within a short window reads as an
                // actual motion (e.g. a fist opening into a throw), not just another static shape.
                if (this._prevStableID !== null && this._prevStableID !== stableID) {
                    const elapsed = Date.now() - (this._prevStableTime || 0);
                    const transition = TRANSITION_GESTURES[`${this._prevStableID}->${stableID}`];
                    if (transition && elapsed < 900) {
                        this.onTrigger({ id: transition.id, label: transition.label });
                        this._prevStableID = stableID;
                        this._prevStableTime = Date.now();
                        return;
                    }
                }
                this._prevStableID = stableID;
                this._prevStableTime = Date.now();

                // Sends a structured object downstream so app.js can use `gesture.id` or `gesture.label`
                this.onTrigger({
                    id: stableID,
                    label: GESTURE_DICTIONARY[stableID]
                });
                return;
            }
        } else {
            // Hand lost from frame, dump the buffer
            this.engineBuffer.pushAndEvaluate(null);
            this._prevStableID = null;
        }

        this.onTrigger("none");
    } 

    _drawDebugSkeleton(results) {
        if (!this.debugCanvas) {
            this.debugCanvas = document.createElement('canvas');
            this.debugCanvas.style.position = 'fixed';
            this.debugCanvas.style.top = '0';
            this.debugCanvas.style.left = '0';
            this.debugCanvas.style.margin = '0';
            this.debugCanvas.style.width = '100vw';
            this.debugCanvas.style.height = '100vh';
            this.debugCanvas.style.zIndex = '10';
            this.debugCanvas.style.pointerEvents = 'none';
            // FIX: appended to <html> instead of <body> - if a settings/help/etc modal is open,
            // the scroll-lock sets body.style.position = 'fixed' to anchor the page, which makes
            // body the containing block for its own position:fixed children and throws off their
            // top/left (a well-known CSS quirk). <html> is never given position:fixed, so this
            // stays correctly viewport-anchored no matter what else is open.
            document.documentElement.appendChild(this.debugCanvas);
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

        // Also draw onto the small Developer Mode practice preview canvas, if it's open
        const miniCanvas = document.getElementById('practice-preview-canvas');
        if (miniCanvas) {
            const miniCtx = miniCanvas.getContext('2d');
            const rect = miniCanvas.getBoundingClientRect();
            if (miniCanvas.width !== rect.width || miniCanvas.height !== rect.height) {
                miniCanvas.width = rect.width;
                miniCanvas.height = rect.height;
            }
            miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
            if (results.landmarks) {
                for (const landmarks of results.landmarks) {
                    this._drawHand(miniCtx, landmarks, miniCanvas.width, miniCanvas.height);
                }
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
}
