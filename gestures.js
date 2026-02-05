// gestures.js
// Version: v2.0 - Flicks, Pausing Gestures, Curves, & Chords

export class GestureEngine {
    constructor(targetElement, config, callbacks) {
        this.target = targetElement || document.body;
        this.config = Object.assign({
            tapDelay: 800,
            longPressTime: 500, // Time to trigger a "long" tap
            pauseThreshold: 600, // Time to hold still to trigger a "pausing" gesture
            swipeThreshold: 40,
            flickVelocity: 1.5, // Pixels per ms to count as a flick
            chordLatency: 60, // Window to wait for other fingers
            debug: false
        }, config || {});

        this.callbacks = Object.assign({
            onGesture: (data) => console.log('Gesture:', data),
            onDebug: (msg) => {}
        }, callbacks || {});

        // State Tracking
        this.activePointers = {};
        this.history = [];
        this.chordState = { pending: false, timer: null, fingers: 0 };
        this.pauseState = { timer: null, triggered: false };
        this.allowedGestures = new Set(); // Whitelist

        this._bindHandlers();
    }

    updateAllowed(list) {
        this.allowedGestures = new Set(list);
    }

    _bindHandlers() {
        const t = this.target;
        t.addEventListener('pointerdown', e => this._handleDown(e));
        t.addEventListener('pointermove', e => this._handleMove(e));
        t.addEventListener('pointerup', e => this._handleUp(e));
        t.addEventListener('pointercancel', e => this._handleUp(e));
        t.addEventListener('contextmenu', e => e.preventDefault());
    }

    _handleDown(e) {
        if (e.target.tagName === 'BUTTON' && !document.body.classList.contains('input-gestures-mode')) return;
        
        // Chord Logic: Wait to see if more fingers land
        const now = Date.now();
        if (!this.chordState.pending) {
            this.chordState.pending = true;
            this.chordState.fingers = 1;
            
            setTimeout(() => {
                if (this.chordState.fingers > 1) {
                    this._fireGesture(`chord_${this.chordState.fingers}f`);
                }
                this.chordState.pending = false;
            }, this.config.chordLatency);
        } else {
            this.chordState.fingers++;
        }

        this.activePointers[e.pointerId] = {
            id: e.pointerId,
            pts: [{ x: e.clientX, y: e.clientY, t: now }],
            startTime: now
        };

        // Reset pause state on new touch
        this.pauseState.triggered = false;
        clearTimeout(this.pauseState.timer);
    }

    _handleMove(e) {
        if (!this.activePointers[e.pointerId]) return;
        
        const ptr = this.activePointers[e.pointerId];
        ptr.pts.push({ x: e.clientX, y: e.clientY, t: Date.now() });

        // --- Pausing Gesture Logic ---
        // Every time we move, reset the pause timer. 
        // If we stop moving for 'pauseThreshold', we check for a pausing gesture.
        clearTimeout(this.pauseState.timer);
        if (!this.pauseState.triggered) {
            this.pauseState.timer = setTimeout(() => {
                this._checkForPause(e.pointerId);
            }, this.config.pauseThreshold);
        }
    }

    _handleUp(e) {
        if (!this.activePointers[e.pointerId]) return;
        
        clearTimeout(this.pauseState.timer); // Stop checking for pause

        const ptr = this.activePointers[e.pointerId];
        ptr.pts.push({ x: e.clientX, y: e.clientY, t: Date.now() });
        
        // If we already triggered a "pausing" gesture, do not fire a normal one on lift
        if (!this.pauseState.triggered) {
            this._analyze(e.pointerId, false); // false = not pausing
        }

        delete this.activePointers[e.pointerId];
    }

    _checkForPause(pointerId) {
        // This runs if the user holds still at the end of a motion
        this.pauseState.triggered = true;
        this._analyze(pointerId, true); // true = is pausing
    }

    _analyze(pointerId, isPausing) {
        const history = this.activePointers[pointerId].pts;
        if (history.length < 2) return;

        const start = history[0];
        const end = history[history.length - 1];
        const duration = end.t - start.t;
        const dist = Math.hypot(end.x - start.x, end.y - start.y);
        const velocity = dist / duration;
        
        // Get pointers count (active fingers)
        const fingerCount = Object.keys(this.activePointers).length || 1; 

        // 1. Analyze Path Geometry
        const segments = this._segmentPath(history);
        const pathType = this._identifyShape(segments, dist);
        
        // 2. Determine Prefix (Flick vs Swipe vs Pause)
        let prefix = "swipe";
        let suffix = "";
        
        if (isPausing) {
            prefix = "pausing"; // e.g., pausing_swipe, pausing_boomerang
        } else if (pathType.type === 'swipe' && velocity > this.config.flickVelocity && duration < 400) {
            prefix = "flick"; // e.g., flick_up
        } else if (duration > this.config.longPressTime && dist < 10) {
             // Long Tap Logic handled separately usually, but fallback here
             this._fireGesture(`long_tap_${fingerCount}f`);
             return;
        }

        // 3. Construct Gesture Name
        let baseName = "";
        
        if (dist < this.config.swipeThreshold && !isPausing) {
            // It's a tap
            if (fingerCount === 1) this._fireGesture("tap");
            else this._fireGesture(`tap_${fingerCount}f`);
            return;
        }

        // Shape Naming
        if (pathType.type === 'swipe') {
            baseName = `${prefix}_${pathType.dir}`; 
        } else {
            // Shapes: boomerang, switchback, corner, zigzag, etc.
            // If pausing, prefix is 'pausing_'. If normal, prefix is empty (just "boomerang_up")
            const shapePrefix = isPausing ? "pausing_" : "";
            baseName = `${shapePrefix}${pathType.type}_${pathType.dir}`;
        }

        // Add Finger Suffix if > 1
        if (fingerCount > 1) {
            baseName += `_${fingerCount}f`;
        }

        // 4. Fire
        this._fireGesture(baseName);
    }

    _identifyShape(segments, totalDist) {
        // Return { type: 'swipe'|'boomerang'|'switchback'|..., dir: 'up'|'cw'... }
        
        const segCount = segments.length;
        const firstDir = segments[0]?.dir || 'up';
        
        // Simple Swipe
        if (segCount === 1) return { type: 'swipe', dir: firstDir };

        // 2 Segments: Corner, Boomerang, Switchback
        if (segCount === 2) {
            const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
            const winding = this._getWinding(segments[0].vec, segments[1].vec); // 'cw' or 'ccw'
            
            if (angle > 140) return { type: 'switchback', dir: `${firstDir}_${winding}` };
            if (angle > 100) return { type: 'boomerang', dir: firstDir }; // Rough return
            if (angle > 60) return { type: 'corner', dir: `${firstDir}_${winding}` };
        }

        // 3 Segments: Triangle, Zigzag
        if (segCount === 3) {
            // Check for Triangle (closed loop)
            // This requires start/end proximity logic which is complex on segments
            // Simplified: Zigzags alternate turns
            return { type: 'zigzag', dir: `${firstDir}_cw` }; // Simplified
        }

        // Curves (Heuristic based on segment count relative to length)
        // If many small segments changing direction gradually
        if (segCount > 3) {
             // Check for C-Shape or S-Shape
             // For now, default to complex swipe or map to specific shapes if needed
             // This is a placeholder for advanced curve math
             return { type: 'swipe', dir: firstDir }; // Fallback
        }

        return { type: 'swipe', dir: firstDir };
    }

    _segmentPath(points) {
        // Simplifies path into straight vectors
        const segments = [];
        const sampleRate = 5; // Look at every 5th point to smooth jitter
        if(points.length < sampleRate) return [{ dir: this._getDir(points[0], points[points.length-1]), vec: {x:0, y:0} }];

        for (let i = 0; i < points.length - sampleRate; i += sampleRate) {
            const p1 = points[i];
            const p2 = points[i + sampleRate];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 10) { // meaningful movement
                const dir = this._getDir(p1, p2);
                // Merge with previous if same direction
                if (segments.length > 0 && segments[segments.length-1].dir === dir) {
                    segments[segments.length-1].vec.x += dx;
                    segments[segments.length-1].vec.y += dy;
                } else {
                    segments.push({ dir, vec: {x: dx, y: dy} });
                }
            }
        }
        return segments.length ? segments : [{ dir: 'up', vec:{x:0,y:0}}];
    }

    _getDir(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
        return dy > 0 ? 'down' : 'up';
    }

    _getAngleDiff(v1, v2) {
        const a1 = Math.atan2(v1.y, v1.x);
        const a2 = Math.atan2(v2.y, v2.x);
        let diff = (a1 - a2) * 180 / Math.PI;
        return Math.abs(diff);
    }

    _getWinding(v1, v2) {
        // Cross product 2D
        return (v1.x * v2.y - v1.y * v2.x) > 0 ? 'cw' : 'ccw';
    }

    _fireGesture(name) {
        // Whitelist Check
        // Also allow "any" wildcards (e.g. if 'flick_any' is allowed, 'flick_up' fires)
        let valid = this.allowedGestures.has(name);
        
        if (!valid) {
            // Check wildcards
            const parts = name.split('_');
            const base = parts[0]; // flick, pausing, swipe
            if (this.allowedGestures.has(`${base}_any`)) valid = true;
            if (parts.length > 2 && this.allowedGestures.has(`${base}_${parts[1]}_any`)) valid = true;
        }

        // Always allow defaults if whitelist is empty (dev safety) or specifically enabled
        if (this.allowedGestures.size === 0 || valid) {
            this.callbacks.onGesture({ type: name });
            if (this.config.debug) console.log(`🔥 Fired: ${name}`);
        } else {
            if (this.config.debug) console.log(`🚫 Blocked: ${name}`);
        }
    }
}
