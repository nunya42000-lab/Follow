// gestures.js
// Version: v65 - Complete Motion & Shape Engine

export class GestureEngine {
    constructor(targetElement, config, callbacks) {
        this.target = targetElement || document.body;
        this.config = Object.assign({
            tapDelay: 300,        // Max time between taps for multi-taps
            swipeThreshold: 30,   // Min distance for a "Swipe" vs "Motion Tap"
            motionTapLimit: 80,   // Max distance for a "Motion Tap"
            holdDelay: 600,       // Time for long press
            debug: false
        }, config || {});

        this.callbacks = Object.assign({
            onGesture: (data) => console.log('Gesture:', data), 
            onContinuous: (data) => {}, 
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
        const t = this.target;
        t.addEventListener('pointerdown', e => this._handleDown(e), { passive: false });
        t.addEventListener('pointermove', e => this._handleMove(e), { passive: false });
        t.addEventListener('pointerup', e => this._handleUp(e), { passive: false });
        t.addEventListener('pointercancel', e => this._handleUp(e), { passive: false });
        t.addEventListener('contextmenu', e => e.preventDefault());
    }

    _handleDown(e) {
        // Allow normal button clicks unless in gesture mode
        if (e.target.tagName === 'BUTTON' && !document.body.classList.contains('input-gestures-mode')) return;
        
        this.activePointers[e.pointerId] = {
            id: e.pointerId,
            pts: [{ x: e.clientX, y: e.clientY }],
            startTime: Date.now()
        };

        const count = Object.keys(this.activePointers).length;
        const pointers = Object.values(this.activePointers);

        // --- Continuous Gestures Init ---
        
        // 1. Squiggle (Delete) - 1 Finger
        if (count === 1) {
            this.contState.squiggle = {
                isTracking: true, startX: e.clientX, lastX: e.clientX, direction: 0, flips: 0, hasTriggered: false
            };
        }

        // 2. Twist/Pinch/Squiggle - 2 Fingers
        if (count === 2) {
            const p1 = pointers[0].pts[0];
            const p2 = pointers[1].pts[0];
            
            this.contState.rotStartAngle = this._getRotationAngle(p1, p2);
            this.contState.rotAccumulator = 0;
            this.contState.rotLastUpdate = Date.now();

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            this.contState.pinchStartDist = Math.hypot(dx, dy);

            this.contState.squiggle2F = {
                isTracking: true, lastX: (p1.x + p2.x) / 2, direction: 0, flips: 0, hasTriggered: false
            };
        }

        // 3. Twist - 3 Fingers
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
        this.activePointers[e.pointerId].pts.push({ x: e.clientX, y: e.clientY });

        const pointers = Object.values(this.activePointers);
        const count = pointers.length;
        const now = Date.now();

        // 1. Squiggle 1F (Delete)
        if (count === 1 && this.contState.squiggle.isTracking && !this.contState.squiggle.hasTriggered) {
            const x = e.clientX;
            const dx = x - this.contState.squiggle.lastX;
            if (Math.abs(dx) > 8) { 
                const newDir = dx > 0 ? 1 : -1;
                if (this.contState.squiggle.direction !== 0 && newDir !== this.contState.squiggle.direction) {
                    this.contState.squiggle.flips++;
                }
                this.contState.squiggle.direction = newDir;
                this.contState.squiggle.lastX = x;
                if (this.contState.squiggle.flips >= 4) {
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 1 });
                    this.contState.squiggle.hasTriggered = true;
                }
            }
        }

        // 2. Squiggle 2F (Clear)
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

        // 3. Twist (Speed/Volume)
        if ((count === 2 || count === 3) && (now - this.contState.rotLastUpdate > 50)) {
            const p1 = pointers[0].pts.slice(-1)[0];
            const p2 = pointers[1].pts.slice(-1)[0];
            const currentAngle = this._getRotationAngle(p1, p2);
            
            let delta = currentAngle - this.contState.rotStartAngle;
            if (delta > 180) delta -= 360; 
            if (delta < -180) delta += 360;
            
            this.contState.rotAccumulator += delta;
            this.contState.rotStartAngle = currentAngle;

            if (Math.abs(this.contState.rotAccumulator) > 15) {
                this.callbacks.onContinuous({ type: 'twist', fingers: count, value: this.contState.rotAccumulator > 0 ? 1 : -1 });
                this.contState.rotAccumulator = 0;
                this.contState.rotLastUpdate = now;
            }
        }

        // 4. Pinch (Resize)
        if (count === 2 && this.contState.pinchStartDist > 0) {
            const p1 = pointers[0].pts.slice(-1)[0];
            const p2 = pointers[1].pts.slice(-1)[0];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (Math.abs(dist - this.contState.pinchStartDist) > 20) {
                this.callbacks.onContinuous({ type: 'pinch', scale: dist / this.contState.pinchStartDist });
            }
        }
    }

    _handleUp(e) {
        if (!this.activePointers[e.pointerId]) return;
        this.activePointers[e.pointerId].endTime = Date.now();
        this.history.push(this.activePointers[e.pointerId]);
        delete this.activePointers[e.pointerId];

        const remaining = Object.keys(this.activePointers).length;
        if (remaining === 0) {
            this.contState.pinchStartDist = 0;
            this.contState.squiggle.isTracking = false;
            this.contState.squiggle2F.isTracking = false;
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this._analyze(), 100);
        }
    }

    _analyze() {
        const inputs = this.history;
        this.history = [];
        if (inputs.length === 0) return;

        const fingers = new Set(inputs.map(s => s.id)).size;
        
        // Centroids
        let sc = {x:0,y:0}, ec = {x:0,y:0};
        inputs.forEach(s => {
            sc.x += s.pts[0].x; sc.y += s.pts[0].y;
            ec.x += s.pts[s.pts.length-1].x; ec.y += s.pts[s.pts.length-1].y;
        });
        sc.x /= inputs.length; sc.y /= inputs.length;
        ec.x /= inputs.length; ec.y /= inputs.length;

        // Spans
        let startSpan = 0, endSpan = 0;
        inputs.forEach(s => {
            const f = s.pts[0], l = s.pts[s.pts.length-1];
            startSpan += Math.hypot(f.x - sc.x, f.y - sc.y);
            endSpan += Math.hypot(l.x - ec.x, l.y - ec.y);
        });
        if (inputs.length > 0) { startSpan /= inputs.length; endSpan /= inputs.length; }

        const primaryPath = inputs[0].pts;
        const segments = this._segmentPath(primaryPath);
        const netDist = Math.hypot(ec.x - sc.x, ec.y - sc.y);
        const pathLen = this._getPathLen(primaryPath);
        const isClosed = netDist < 50;
        const dur = inputs[0].endTime - inputs[0].startTime;

        // Calculate Winding (Turn Direction)
        let turnSum = 0;
        if (segments.length > 1) {
            for (let i = 0; i < segments.length - 1; i++) {
                turnSum += this._getTurnDir(segments[i].vec, segments[i + 1].vec);
            }
        }
        const winding = turnSum > 0 ? 'cw' : 'ccw';
        const startDir = segments[0] ? segments[0].dir : 'none';

        let type = 'tap';
        let meta = { fingers: fingers, dir: startDir, winding: winding };

        // --- CLASSIFICATION LOGIC ---

        // 1. Hybrid (Pinch-Swipe) - 2 Fingers
        if (fingers === 2 && pathLen > 40 && netDist > 40) {
            const spanChange = Math.abs(endSpan - startSpan);
            if (spanChange > 30) {
                const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                if (endSpan < startSpan * 0.7) { type = 'pinch_swipe'; meta.dir = dir; }
                else if (endSpan > startSpan * 1.3) { type = 'expand_swipe'; meta.dir = dir; }
            }
        }

        // 2. Motion / Swipe / Shape (1 Finger)
        if (type === 'tap' && fingers === 1) {
            
            // A. Shapes (Closed or Multi-Segment)
            if (pathLen > this.config.swipeThreshold) {
                
                // --- FIX START: PRIORITIZE DOUBLE BOOMERANG ---
                // We check this first because it relies on specific angles (reversals),
                // whereas Square simply checks if the shape is closed.
                // A Double Boomerang (Up-Down-Up-Down) IS closed (returns to start),
                // so it was incorrectly being caught as a Square.
                let shapeDetected = false;

                if (segments.length === 4) {
                    const a1 = this._getAngleDiff(segments[0].vec, segments[1].vec);
                    const a2 = this._getAngleDiff(segments[1].vec, segments[2].vec);
                    const a3 = this._getAngleDiff(segments[2].vec, segments[3].vec);
                    
                    // Check for sharp reversals (> 100 degrees)
                    if (Math.abs(a1) > 100 && Math.abs(a2) > 100 && Math.abs(a3) > 100) {
                         type = 'double_boomerang';
                         shapeDetected = true;
                    }
                }

                if (!shapeDetected) {
                    if (segments.length >= 4 && isClosed) {
                        type = 'square'; 
                    } else if (segments.length === 3 && isClosed) {
                        type = 'triangle';
                    } else if (segments.length === 3 && !isClosed) {
                        // Check for U-Shape (3 segments, roughly 90 deg turns)
                        type = 'u_shape';
                        // Check for Zig Zag (3 segments, alternating directions)
                        const angle1 = this._getAngleDiff(segments[0].vec, segments[1].vec);
                        const angle2 = this._getAngleDiff(segments[1].vec, segments[2].vec);
                        if (Math.abs(angle1) > 120 && Math.abs(angle2) > 120) {
                             type = 'zigzag';
                        }
                    } else if (segments.length === 2) {
                        const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                        if (Math.abs(angle) > 150) { 
                            // Out and Back -> Boomerang
                            type = 'boomerang'; 
                            // Check for Long Boomerang (Zig Zag)
                            if (pathLen > 250) type = 'zigzag';
                        } else {
                            type = 'corner';
                        }
                    } else if (segments.length === 1 || (netDist > pathLen * 0.8)) {
                        // Straight Line
                        if (netDist > 150) {
                            type = 'swipe_long';
                            meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                        } else if (netDist > this.config.motionTapLimit) {
                             type = 'swipe';
                             meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                        } else if (netDist > 15) {
                            // Very short travel -> Motion Tap (Spatial)
                            type = 'motion_tap_spatial';
                            meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                        }
                    }
                }
                else if (netDist > 10 && netDist <= this.config.swipeThreshold) {
                // Micro movement -> Spatial Tap
                type = 'motion_tap_spatial';
                meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
            }

            // B. Motion Tap Prefix Logic
            // If we detected a shape/swipe but it was very small/fast, we might call it a "Motion Tap [Shape]"
            // But based on user requirements, "Motion Tap Swipe" is a distinct category.
            // Let's rely on the Distance thresholds above for Swipe vs Spatial.
            // For Shapes, if they are tiny (<80px total path), convert to Motion Tap Shape.
            if (['corner', 'boomerang', 'square', 'triangle'].includes(type) && pathLen < 150) {
                type = 'motion_tap_' + type;
            }
        }

        // 3. Multi-Finger Swipes
        if (fingers > 1 && type === 'tap' && netDist > 30) {
            type = 'swipe';
            // Check for Boomerang 2F/3F
            if (segments.length >= 2) {
                 const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                 if (Math.abs(angle) > 150) type = 'boomerang';
            }
            meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
        }

        // 4. Basic Taps & Holds
        if (type === 'tap') {
            if (dur > this.config.holdDelay) type = 'long_tap';
            if (fingers > 1) meta.align = this._getAlignment(inputs);
        }

        // --- Tap Stack Logic ---
        if (this.tapStack.active) {
            clearTimeout(this.tapStack.timer);
            this.tapStack.active = false;

            if (type === 'tap' && fingers === this.tapStack.fingers) {
                 this.tapStack.count++;
                 this.tapStack.lastPos = ec;
                 this.tapStack.active = true;
                 this.tapStack.timer = setTimeout(() => this._commitStack(), this.config.tapDelay);
                 return;
            }
            this._commitStack();
        }

        if (type === 'tap') {
            this.tapStack = {
                active: true, count: 1, fingers: fingers, lastPos: ec, align: meta.align,
                timer: setTimeout(() => this._commitStack(), this.config.tapDelay)
            };
            return;
        }

        this._emitGesture(type, fingers, meta);
    }

    _commitStack() {
        if (this.tapStack.count > 0) {
            let type = 'tap';
            if (this.tapStack.count === 2) type = 'double_tap';
            if (this.tapStack.count === 3) type = 'triple_tap';
            this._emitGesture(type, this.tapStack.fingers, { align: this.tapStack.align });
            this.tapStack = { active: false, count: 0, fingers: 0, timer: null };
        }
    }

    _emitGesture(baseType, fingers, meta) {
        let id = baseType;

        // 1. Direction Handling
        if (meta && meta.dir && meta.dir !== 'none') {
            const dir = meta.dir.toLowerCase();
            // Shapes put dir in middle: square_up_cw
            if (['square', 'triangle', 'u_shape', 'corner', 'motion_tap_corner'].includes(baseType)) {
                 id += `_${dir}`;
            } 
            // Swipes/Motion Taps put dir at end: swipe_up
            else if (!baseType.includes(dir)) {
                 id += `_${dir}`;
            }
        } else if (['swipe', 'swipe_long', 'boomerang', 'zigzag'].includes(baseType)) {
             id += '_any'; // Fallback if no specific direction
        }

        // 2. Winding Handling (Shapes)
        if (meta && meta.winding && ['square', 'triangle', 'u_shape', 'corner', 'motion_tap_corner'].includes(baseType)) {
            id += `_${meta.winding}`;
        }

        // 3. Finger Suffix
        if (fingers > 1) id += `_${fingers}f`;

        // 4. Alignment Suffix
        if (meta && meta.align) {
            const map = { 'Vertical': 'vertical', 'Horizontal': 'horizontal', 'Diagonal SE': 'diagonal_se', 'Diagonal SW': 'diagonal_sw' };
            if (map[meta.align]) id += `_${map[meta.align]}`;
        }

        // Clean up and Emit
        // Ensure "Motion Tap Swipe" naming convention matches settings
        if (id.startsWith('motion_tap_spatial')) {
             // User calls this "Spatial Tap" -> Settings expects motion_tap_spatial_up
             // Logic is already correct.
        }

        // Construct Human Name
        let name = id.replace(/_/g, ' ').toUpperCase();
        
        this.callbacks.onGesture({
            id: id,
            base: baseType,
            fingers: fingers,
            meta: meta,
            name: name
        });
    }

    // --- UTILS ---

    _getRotationAngle(p1, p2) { return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI; }

    _segmentPath(pts) {
        if (pts.length < 5) return [{dir: 'none', vec:{x:0,y:0}}];
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
                segments.push({ dir: this._getDirection(dx1, dy1), vec: {x:dx1, y:dy1} }); 
                start = i;
            }
        }
        const lastDx = pts[pts.length-1].x - pts[start].x; 
        const lastDy = pts[pts.length-1].y - pts[start].y;
        if (Math.hypot(lastDx, lastDy) > 10) {
            segments.push({ dir: this._getDirection(lastDx, lastDy), vec: {x:lastDx, y:lastDy} });
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
        
        if (h > w * 1.5) return 'Vertical'; 
        if (w > h * 1.5) return 'Horizontal';
        const left = pts.reduce((a,b) => a.x < b.x ? a : b); 
        const right = pts.reduce((a,b) => a.x > b.x ? a : b);
        return right.y > left.y ? 'Diagonal SE' : 'Diagonal SW';
    }
}
