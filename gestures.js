// gestures.js
// Based on Gesture Architect v63 & Follow Me System Controls

export class GestureEngine {
    constructor(targetElement, config, callbacks) {
        this.target = targetElement || document.body;
        this.config = Object.assign({
            tapDelay: 300,        // Max time between taps for double/triple
            swipeThreshold: 30,   // Min distance for swipe
            holdDelay: 600,       // Time for long press
            doubleTapGap: 200,    // Max time between taps
            debug: false
        }, config || {});

        this.callbacks = Object.assign({
            onGesture: (data) => console.log('Gesture:', data), // { name, type, fingers, meta }
            onContinuous: (data) => {}, // { type: 'twist'|'pinch'|'squiggle', value, fingers }
            onDebug: (msg) => {}
        }, callbacks || {});

        // State Tracking
        this.activePointers = {};
        this.history = [];
        this.tapStack = { count: 0, fingers: 0, timer: null, lastPos: null, active: false };
        this.debounceTimer = null;

        // Continuous Gesture State
        this.contState = {
            rotStartAngle: 0,
            rotAccumulator: 0,
            rotLastUpdate: 0,
            pinchStartDist: 0,
            squiggle: { isTracking: false, startX: 0, lastX: 0, direction: 0, flips: 0, hasTriggered: false },
            squiggle2F: { isTracking: false, lastX: 0, direction: 0, flips: 0, hasTriggered: false }
        };

        this._bindHandlers();
    }

    _bindHandlers() {
        // We use pointer events for broad compatibility
        const t = this.target;
        t.addEventListener('pointerdown', e => this._handleDown(e), { passive: false });
        t.addEventListener('pointermove', e => this._handleMove(e), { passive: false });
        t.addEventListener('pointerup', e => this._handleUp(e), { passive: false });
        t.addEventListener('pointercancel', e => this._handleUp(e), { passive: false });
        
        // Prevent context menu on long press
        t.addEventListener('contextmenu', e => e.preventDefault());
    }

    _handleDown(e) {
        // Don't interfere with buttons unless we are in a specific gesture mode
        if (e.target.tagName === 'BUTTON' && !document.body.classList.contains('input-gestures-mode')) return;
        
        // Track pointer
        this.activePointers[e.pointerId] = {
            id: e.pointerId,
            pts: [{ x: e.clientX, y: e.clientY }],
            startTime: Date.now()
        };

        const pointers = Object.values(this.activePointers);
        const count = pointers.length;

        // --- Init Continuous Gestures ---
        
        // 1. Squiggle (Delete) - 1 Finger
        if (count === 1) {
            this.contState.squiggle = {
                isTracking: true,
                startX: e.clientX,
                lastX: e.clientX,
                direction: 0,
                flips: 0,
                hasTriggered: false
            };
        }

        // 2. Twist (Speed), Pinch (Resize), Squiggle (Clear) - 2 Fingers
        if (count === 2) {
            const p1 = pointers[0].pts[0];
            const p2 = pointers[1].pts[0];
            
            // Rotation Init
            this.contState.rotStartAngle = this._getRotationAngle(p1, p2);
            this.contState.rotAccumulator = 0;
            this.contState.rotLastUpdate = Date.now();

            // Pinch Init
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            this.contState.pinchStartDist = Math.hypot(dx, dy);

            // Squiggle 2F Init
            this.contState.squiggle2F = {
                isTracking: true,
                lastX: (p1.x + p2.x) / 2,
                direction: 0,
                flips: 0,
                hasTriggered: false
            };
        }

        // 3. Twist (Volume) - 3 Fingers
        if (count === 3) {
            const p1 = pointers[0].pts[0];
            const p2 = pointers[1].pts[0];
            this.contState.rotStartAngle = this._getRotationAngle(p1, p2);
            this.contState.rotAccumulator = 0;
            this.contState.rotLastUpdate = Date.now();
        }
    }

    _handleMove(e) {
        if (!this.activePointers[e.pointerId]) return;
        
        // Update history
        this.activePointers[e.pointerId].pts.push({ x: e.clientX, y: e.clientY });

        const pointers = Object.values(this.activePointers);
        const count = pointers.length;
        const now = Date.now();

        // --- Handle Continuous Gestures ---

        // 1. Squiggle (Delete) - 1 Finger
        if (count === 1 && this.contState.squiggle.isTracking && !this.contState.squiggle.hasTriggered) {
            const x = e.clientX;
            const dx = x - this.contState.squiggle.lastX;
            if (Math.abs(dx) > 8) { // Threshold
                const newDir = dx > 0 ? 1 : -1;
                if (this.contState.squiggle.direction !== 0 && newDir !== this.contState.squiggle.direction) {
                    this.contState.squiggle.flips++;
                }
                this.contState.squiggle.direction = newDir;
                this.contState.squiggle.lastX = x;

                if (this.contState.squiggle.flips >= 4) {
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 1 });
                    this.contState.squiggle.hasTriggered = true; // One shot per touch
                }
            }
        }

        // 2. Squiggle (Clear) - 2 Fingers
        if (count === 2 && this.contState.squiggle2F.isTracking && !this.contState.squiggle2F.hasTriggered) {
            const currentAvgX = (pointers[0].pts.slice(-1)[0].x + pointers[1].pts.slice(-1)[0].x) / 2;
            const dx = currentAvgX - this.contState.squiggle2F.lastX;
            if (Math.abs(dx) > 8) {
                const newDir = dx > 0 ? 1 : -1;
                if (this.contState.squiggle2F.direction !== 0 && newDir !== this.contState.squiggle2F.direction) {
                    this.contState.squiggle2F.flips++;
                }
                this.contState.squiggle2F.direction = newDir;
                this.contState.squiggle2F.lastX = currentAvgX;

                if (this.contState.squiggle2F.flips >= 3) {
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 2 });
                    this.contState.squiggle2F.hasTriggered = true;
                }
            }
        }

        // 3. Twist (Speed/Volume) - 2 or 3 Fingers
        if ((count === 2 || count === 3) && (now - this.contState.rotLastUpdate > 50)) {
            // Only calc rotation based on first two fingers for stability
            const p1 = pointers[0].pts.slice(-1)[0];
            const p2 = pointers[1].pts.slice(-1)[0];
            const currentAngle = this._getRotationAngle(p1, p2);
            
            let delta = currentAngle - this.contState.rotStartAngle;
            if (delta > 180) delta -= 360; 
            if (delta < -180) delta += 360;
            
            this.contState.rotAccumulator += delta;
            this.contState.rotStartAngle = currentAngle;

            if (Math.abs(this.contState.rotAccumulator) > 15) {
                // Fire Event
                this.callbacks.onContinuous({ 
                    type: 'twist', 
                    fingers: count, 
                    value: this.contState.rotAccumulator > 0 ? 1 : -1 // 1 = CW, -1 = CCW
                });
                this.contState.rotAccumulator = 0;
                this.contState.rotLastUpdate = now;
            }
        }

        // 4. Pinch (Resize) - 2 Fingers
        if (count === 2 && this.contState.pinchStartDist > 0) {
            const p1 = pointers[0].pts.slice(-1)[0];
            const p2 = pointers[1].pts.slice(-1)[0];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            
            if (Math.abs(dist - this.contState.pinchStartDist) > 20) {
                const ratio = dist / this.contState.pinchStartDist;
                // We don't reset pinchStartDist here to allow smooth scaling from initial point
                this.callbacks.onContinuous({ type: 'pinch', scale: ratio });
            }
        }
    }

    _handleUp(e) {
        if (!this.activePointers[e.pointerId]) return;

        // Finalize pointer
        this.activePointers[e.pointerId].endTime = Date.now();
        this.history.push(this.activePointers[e.pointerId]);
        delete this.activePointers[e.pointerId];

        const remaining = Object.keys(this.activePointers).length;
        
        if (remaining === 0) {
            // Reset Continuous States
            this.contState.pinchStartDist = 0;
            this.contState.squiggle.isTracking = false;
            this.contState.squiggle2F.isTracking = false;

            // Trigger Analysis (Debounced to catch multi-finger lifts)
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this._analyze(), 100);
        }
    }

    _analyze() {
        const inputs = this.history;
        this.history = [];
        if (inputs.length === 0) return;

        // If a continuous gesture triggered (Squiggle/Twist), we generally ignore the discrete tap/swipe
        // unless you want them to stack. For now, let's allow overlapping but maybe filter in app.
        
        const fingers = new Set(inputs.map(s => s.id)).size;
        
        // Calc Centroids
        let sc = {x:0,y:0}, ec = {x:0,y:0};
        inputs.forEach(s => {
            sc.x += s.pts[0].x; sc.y += s.pts[0].y;
            ec.x += s.pts[s.pts.length-1].x; ec.y += s.pts[s.pts.length-1].y;
        });
        sc.x /= inputs.length; sc.y /= inputs.length;
        ec.x /= inputs.length; ec.y /= inputs.length;

        // Calc Spans & Rotation for discrete gestures
        let startSpan = 0, endSpan = 0, rotSum = 0;
        inputs.forEach(s => {
            const f = s.pts[0], l = s.pts[s.pts.length-1];
            startSpan += Math.hypot(f.x - sc.x, f.y - sc.y);
            endSpan += Math.hypot(l.x - ec.x, l.y - ec.y);
            const a1 = Math.atan2(f.y - sc.y, f.x - sc.x);
            const a2 = Math.atan2(l.y - ec.y, l.x - ec.x);
            let da = (a2 - a1) * 180 / Math.PI;
            if (da > 180) da -= 360; if (da < -180) da += 360;
            rotSum += da;
        });
        if (inputs.length > 0) { 
            rotSum /= inputs.length; 
            startSpan /= inputs.length; 
            endSpan /= inputs.length; 
        }

        const primaryPath = inputs[0].pts;
        const segments = this._segmentPath(primaryPath);
        const netDist = Math.hypot(ec.x - sc.x, ec.y - sc.y);
        const pathLen = this._getPathLen(primaryPath);
        const isClosed = netDist < 50;

        let turnSum = 0;
        if (segments.length > 1) {
            for (let i = 0; i < segments.length - 1; i++) {
                turnSum += this._getTurnDir(segments[i].vec, segments[i + 1].vec);
            }
        }
        const winding = turnSum > 0 ? 'cw' : 'ccw';

        // --- CLASSIFICATION LOGIC (Ported from gestures.html) ---
        let type = 'tap';
        let meta = { fingers: fingers };

        // 1. Hybrid (Pinch-Swipe)
        if (fingers === 2 && pathLen > 40 && netDist > 40) {
            const spanChange = Math.abs(endSpan - startSpan);
            if (spanChange > 30) {
                const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                if (endSpan < startSpan * 0.7) { type = 'pinch_swipe'; meta.dir = dir; }
                else if (endSpan > startSpan * 1.3) { type = 'expand_swipe'; meta.dir = dir; }
            }
        }

        // 2. Standard Radial (Twist/Pinch in place)
        if (type === 'tap' && fingers > 1) {
            if (Math.abs(rotSum) > 15) { 
                type = 'twist'; 
                meta.dir = rotSum > 0 ? 'cw' : 'ccw'; 
            } else if (endSpan > startSpan * 1.2) { 
                type = 'expand'; 
            } else if (endSpan < startSpan * 0.8) { 
                type = 'pinch'; 
            }
        }

        // 3. Shapes / Motion
        if (type === 'tap' && pathLen > this.config.swipeThreshold) {
            if (segments.length >= 4) {
                if (!isClosed && Math.abs(this._getAngleDiff(segments[0].vec, segments[1].vec)) > 150) {
                    type = 'double_boomerang'; meta.dir = segments[0].dir;
                } else if (isClosed) {
                    type = 'square'; meta.dir = segments[0].dir; meta.winding = winding;
                }
            } else if (segments.length >= 2) {
                meta.dir = segments[0].dir;
                meta.winding = winding;
                if (segments.length === 3 && isClosed) type = 'triangle';
                else if (segments.length === 3 && !isClosed) {
                    const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                    if (Math.abs(angle) < 135) type = 'u_shape';
                    else type = 'long_boomerang';
                } else if (segments.length === 2) {
                    const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                    if (Math.abs(angle) > 150) { type = 'boomerang'; meta.dir = segments[0].dir; }
                    else type = 'corner';
                }
            } else if (netDist < 40 && pathLen > 100) {
                // Return to start without distinct corners (loop)
                type = 'boomerang';
                // Find furthest point to determine dir
                let maxD = 0, maxP = inputs[0].pts[0];
                inputs[0].pts.forEach(p => {
                    const d = Math.hypot(p.x - inputs[0].pts[0].x, p.y - inputs[0].pts[0].y);
                    if(d > maxD) { maxD = d; maxP = p; }
                });
                meta.dir = this._getDirection(maxP.x - inputs[0].pts[0].x, maxP.y - inputs[0].pts[0].y);
            } else {
                type = 'swipe';
                meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                if (netDist > 150) meta.len = 'long';
            }
        }

        // 4. Taps & Holds
        if (type === 'tap') {
            const dur = inputs[0].endTime - inputs[0].startTime;
            if (dur > this.config.holdDelay) type = 'long_tap';
            
            // Alignment Detection for 2/3 finger taps (Horizontal vs Vertical)
            if (fingers > 1) {
                meta.align = this._getAlignment(inputs);
            }
        }

        // --- Tap Stack Logic (Double/Triple Taps) ---
        if (this.tapStack.active) {
            clearTimeout(this.tapStack.timer);
            this.tapStack.active = false;

            if (type === 'tap' && fingers === this.tapStack.fingers) {
                const seqDist = Math.hypot(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
                if (seqDist > 60 && fingers === 1) {
                    // Spatial Tap (Motion Tap)
                    const dir = this._getDirection(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
                    this._emitGesture('motion_tap', fingers, { subMode: 'spatial', dir: dir });
                    this._clearStack();
                    return;
                } else {
                    // It is a multi-tap
                    this.tapStack.count++;
                    this.tapStack.lastPos = ec;
                    this.tapStack.active = true;
                    this.tapStack.timer = setTimeout(() => this._commitStack(), this.config.tapDelay);
                    return;
                }
            }
            
            // Mixed gesture in stack (Tap -> Swipe)
            if (type !== 'tap' && fingers === 1 && this.tapStack.fingers === 1) {
                 this._emitGesture('motion_tap', 1, { subMode: type, dir: meta.dir, len: meta.len });
                 this._clearStack();
                 return;
            }

            // If we are here, the sequence broke (different fingers or too slow), commit previous and process current
            this._commitStack();
        }

        // Start new stack if it's a short tap
        if (type === 'tap') {
            this.tapStack = {
                active: true,
                count: 1,
                fingers: fingers,
                lastPos: ec,
                align: meta.align, // Store alignment in stack
                timer: setTimeout(() => this._commitStack(), this.config.tapDelay)
            };
            return;
        }

        // Emit non-tap gestures immediately
        this._emitGesture(type, fingers, meta);
    }

    _commitStack() {
        if (this.tapStack.count > 0) {
            let type = 'tap';
            if (this.tapStack.count === 2) type = 'double_tap';
            if (this.tapStack.count === 3) type = 'triple_tap';
            // We can add quad_tap etc if needed
            
            this._emitGesture(type, this.tapStack.fingers, { align: this.tapStack.align });
            this._clearStack();
        }
    }

    _clearStack() {
        this.tapStack = { active: false, count: 0, fingers: 0, timer: null };
    }

    _emitGesture(baseType, fingers, meta) {
        // Construct the composite ID used by mapping settings
        // E.g., 'tap', 'swipe_up_2f', 'tap_2f_horizontal'
        
        let id = baseType;
        
        // Append Direction for swipes/shapes
        if (meta && meta.dir) {
            // Convert 'Right' to 'right', 'NE' to 'ne'
            id += '_' + meta.dir.toLowerCase(); 
        }

        // Append Finger Count suffix (if > 1)
        if (fingers === 2) id += '_2f';
        if (fingers === 3) id += '_3f';
        if (fingers === 4) id += '_4f';

        // Append Alignment (Crucial for the "Horizontal Taps" requirement)
        if (meta && meta.align) {
            // meta.align is 'Horizontal', 'Vertical', 'Diagonal SE', etc.
            if (meta.align === 'Horizontal') id += '_horizontal';
            if (meta.align === 'Vertical') id += '_vertical';
        }

        // Construct clean human-readable name for debug/toast
        let name = id.replace(/_/g, ' ').toUpperCase();

        this.callbacks.onGesture({
            id: id,
            base: baseType,
            fingers: fingers,
            meta: meta,
            name: name
        });
    }

    // --- UTILS (Ported from gestures.html) ---
    
    _getRotationAngle(p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    }

    _segmentPath(pts) {
        if (pts.length < 5) return [{dir: 'None', vec:{x:0,y:0}}];
        const segments = []; 
        let start = 0; 
        const threshold = 60; 
        
        for (let i = 5; i < pts.length - 5; i+=3) {
            const dx1 = pts[i].x - pts[start].x; 
            const dy1 = pts[i].y - pts[start].y;
            const dx2 = pts[i+5].x - pts[i].x; 
            const dy2 = pts[i+5].y - pts[i].y;
            
            const a1 = Math.atan2(dy1, dx1) * 180/Math.PI; 
            const a2 = Math.atan2(dy2, dx2) * 180/Math.PI;
            
            let diff = Math.abs(a1-a2); 
            if (diff > 180) diff = 360 - diff;
            
            if (diff > threshold && Math.hypot(dx1,dy1) > 20) {
                segments.push({ 
                    dir: this._getDirection(dx1, dy1), 
                    vec: {x:dx1, y:dy1} 
                }); 
                start = i;
            }
        }
        const lastDx = pts[pts.length-1].x - pts[start].x; 
        const lastDy = pts[pts.length-1].y - pts[start].y;
        if (Math.hypot(lastDx, lastDy) > 10) {
            segments.push({ 
                dir: this._getDirection(lastDx, lastDy), 
                vec: {x:lastDx, y:lastDy} 
            });
        }
        return segments;
    }

    _getTurnDir(v1, v2) { return (v1.x * v2.y - v1.y * v2.x); }
    
    _getAngleDiff(v1, v2) { 
        const a1 = Math.atan2(v1.y, v1.x)*180/Math.PI; 
        const a2 = Math.atan2(v2.y, v2.x)*180/Math.PI; 
        let d = Math.abs(a1-a2); 
        if(d>180) d=360-d; 
        return d; 
    }
    
    _getPathLen(pts) { 
        let l=0; 
        for(let i=1;i<pts.length;i++) l+=Math.hypot(pts[i].x-pts[i-1].x, pts[i].y-pts[i-1].y); 
        return l; 
    }
    
    _getDirection(dx, dy) {
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        if (ang > -22.5 && ang <= 22.5) return 'right'; 
        if (ang > 22.5 && ang <= 67.5) return 'se';
        if (ang > 67.5 && ang <= 112.5) return 'down'; 
        if (ang > 112.5 && ang <= 157.5) return 'sw';
        if (ang > 157.5 || ang <= -157.5) return 'left'; 
        if (ang > -157.5 && ang <= -112.5) return 'nw';
        if (ang > -112.5 && ang <= -67.5) return 'up'; 
        return 'ne';
    }

    _getAlignment(inputs) {
        if (inputs.length < 2) return null;
        const pts = inputs.map(s => s.pts[0]);
        const xs = pts.map(p => p.x);
        const ys = pts.map(p => p.y);
        const w = Math.max(...xs) - Math.min(...xs);
        const h = Math.max(...ys) - Math.min(...ys);
        
        // Strict aspect ratio check
        if (h > w * 1.5) return 'Vertical'; 
        if (w > h * 1.5) return 'Horizontal';
        
        const left = pts.reduce((a,b) => a.x < b.x ? a : b); 
        const right = pts.reduce((a,b) => a.x > b.x ? a : b);
        return right.y > left.y ? 'Diagonal SE' : 'Diagonal SW';
    }
}
