// gestures.js
// Version: v75 - Smart Fallback & Active Constraint System

export class GestureEngine {
    constructor(targetElement, config, callbacks) {
        this.target = targetElement || document.body;
        this.config = Object.assign({
            tapDelay: 300,        
            longPressTime: 500,   
            swipeThreshold: 30,   
            spatialThreshold: 10, 
            tapPrecision: 30,     
            debug: false
        }, config || {});

        this.callbacks = Object.assign({
            onGesture: (data) => console.log('Gesture:', data), 
            onContinuous: (data) => {}, 
            onDebug: (msg) => {}
        }, callbacks || {});

        // Smart Fallback System
        this.allowedGestures = new Set(); 

        this.activePointers = {};
        this.history = [];
        this.tapStack = { count: 0, fingers: 0, timer: null, history: [], active: false };
        this.debounceTimer = null;
        this.staleCheckTimer = null;

        this.contState = {
            rotStartAngle: 0, rotAccumulator: 0, rotLastUpdate: 0, pinchStartDist: 0,
            squiggle: { isTracking: false, startX: 0, lastX: 0, direction: 0, flips: 0, hasTriggered: false },
            squiggle2F: { isTracking: false, lastX: 0, direction: 0, flips: 0, hasTriggered: false }
        };

        this._bindHandlers();
        this._startStaleCheck();
    }

    // --- NEW: Update the list of gestures the App actually cares about ---
    updateAllowed(list) {
        if (!list || !Array.isArray(list)) return;
        this.allowedGestures = new Set(list);
    }

    _bindHandlers() {
        const t = this.target;
        t.addEventListener('pointerdown', e => this._handleDown(e), { passive: false });
        t.addEventListener('pointermove', e => this._handleMove(e), { passive: false });
        t.addEventListener('pointerup', e => this._handleUp(e), { passive: false });
        t.addEventListener('pointercancel', e => this._forceReset(e), { passive: false });
        t.addEventListener('contextmenu', e => e.preventDefault());
    }

    _startStaleCheck() {
        this.staleCheckTimer = setInterval(() => {
            const now = Date.now();
            let cleared = false;
            Object.keys(this.activePointers).forEach(key => {
                if (now - this.activePointers[key].startTime > 2000) {
                    delete this.activePointers[key];
                    cleared = true;
                }
            });
            if (cleared && Object.keys(this.activePointers).length === 0) {
                this._resetContinuous();
            }
        }, 1000);
    }

    _forceReset(e) {
        if (e && this.activePointers[e.pointerId]) delete this.activePointers[e.pointerId];
        if (Object.keys(this.activePointers).length === 0) {
            this._resetContinuous();
            this.history = [];
        }
    }

    _resetContinuous() {
        this.contState.pinchStartDist = 0;
        this.contState.squiggle.isTracking = false;
        this.contState.squiggle2F.isTracking = false;
        this.contState.squiggle.hasTriggered = false;
        this.contState.squiggle2F.hasTriggered = false;
    }

    _handleDown(e) {
        if (e.target.tagName === 'BUTTON' && !document.body.classList.contains('input-gestures-mode')) return;
        
        this.activePointers[e.pointerId] = {
            id: e.pointerId,
            pts: [{ x: e.clientX, y: e.clientY }],
            startTime: Date.now()
        };

        const count = Object.keys(this.activePointers).length;
        const pointers = Object.values(this.activePointers);

        if (count === 1) {
            this.contState.squiggle = {
                isTracking: true, startX: e.clientX, lastX: e.clientX, direction: 0, flips: 0, hasTriggered: false
            };
        }
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
    }

    _handleMove(e) {
        if (!this.activePointers[e.pointerId]) return;
        if (this.contState.squiggle.isTracking || this.contState.squiggle2F.isTracking) {
             if (e.cancelable) e.preventDefault();
        }

        const ptr = this.activePointers[e.pointerId];
        ptr.pts.push({ x: e.clientX, y: e.clientY });

        const pointers = Object.values(this.activePointers);
        const count = pointers.length;
        const now = Date.now();

        // Continuous Gestures (Delete/Clear/Twist/Pinch)
        // ... (Logic kept identical to v74) ...
        // 1. Squiggle 1F
        if (count === 1 && this.contState.squiggle.isTracking && !this.contState.squiggle.hasTriggered) {
            const x = e.clientX; const dx = x - this.contState.squiggle.lastX;
            if (Math.abs(dx) > 8) { 
                const newDir = dx > 0 ? 1 : -1;
                if (this.contState.squiggle.direction !== 0 && newDir !== this.contState.squiggle.direction) this.contState.squiggle.flips++;
                this.contState.squiggle.direction = newDir; this.contState.squiggle.lastX = x;
                if (this.contState.squiggle.flips >= 3) {
                    this.contState.squiggle.hasTriggered = true;
                    this._emitGesture('delete', 1, {}, 'DELETE');
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 1 });
                }
            }
        }
        // 2. Squiggle 2F
        if (count === 2 && this.contState.squiggle2F.isTracking && !this.contState.squiggle2F.hasTriggered) {
            const currentAvgX = (pointers[0].pts.slice(-1)[0].x + pointers[1].pts.slice(-1)[0].x) / 2;
            const dx = currentAvgX - this.contState.squiggle2F.lastX;
            if (Math.abs(dx) > 8) {
                const newDir = dx > 0 ? 1 : -1;
                if (this.contState.squiggle2F.direction !== 0 && newDir !== this.contState.squiggle2F.direction) this.contState.squiggle2F.flips++;
                this.contState.squiggle2F.direction = newDir; this.contState.squiggle2F.lastX = currentAvgX;
                if (this.contState.squiggle2F.flips >= 3) {
                    this.contState.squiggle2F.hasTriggered = true;
                    this._emitGesture('clear', 2, {}, 'CLEAR');
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 2 });
                }
            }
        }
        // 3. Twist
        if ((count === 2 || count === 3) && (now - this.contState.rotLastUpdate > 50)) {
            const p1 = pointers[0].pts.slice(-1)[0]; const p2 = pointers[1].pts.slice(-1)[0];
            const currentAngle = this._getRotationAngle(p1, p2);
            let delta = currentAngle - this.contState.rotStartAngle;
            if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
            this.contState.rotAccumulator += delta; this.contState.rotStartAngle = currentAngle;
            if (Math.abs(this.contState.rotAccumulator) > 15) {
                this.callbacks.onContinuous({ type: 'twist', fingers: count, value: this.contState.rotAccumulator > 0 ? 1 : -1 });
                this.contState.rotAccumulator = 0; this.contState.rotLastUpdate = now;
            }
        }
        // 4. Pinch
        if (count === 2 && this.contState.pinchStartDist > 0) {
            const p1 = pointers[0].pts.slice(-1)[0]; const p2 = pointers[1].pts.slice(-1)[0];
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
            this._resetContinuous();
            clearTimeout(this.debounceTimer);
            if (this.contState.squiggle.hasTriggered || this.contState.squiggle2F.hasTriggered) {
                this.history = []; return;
            }
            this.debounceTimer = setTimeout(() => this._analyze(), 50);
        }
    }

    _analyze() {
        const inputs = this.history; this.history = [];
        if (inputs.length === 0) return;
        const fingers = new Set(inputs.map(s => s.id)).size;
        
        let sc = {x:0,y:0}, ec = {x:0,y:0};
        let startTime = Infinity, endTime = -Infinity;
        inputs.forEach(s => {
            sc.x += s.pts[0].x; sc.y += s.pts[0].y;
            ec.x += s.pts[s.pts.length-1].x; ec.y += s.pts[s.pts.length-1].y;
            if(s.startTime < startTime) startTime = s.startTime;
            if(s.endTime > endTime) endTime = s.endTime;
        });
        sc.x /= inputs.length; sc.y /= inputs.length;
        ec.x /= inputs.length; ec.y /= inputs.length;

        const duration = endTime - startTime;
        const primaryPath = inputs[0].pts;
        const segments = this._segmentPath(primaryPath);
        const netDist = Math.hypot(ec.x - sc.x, ec.y - sc.y);
        const pathLen = this._getPathLen(primaryPath);
        const isClosed = netDist < 50;
        
        // --- 1. Long Tap Priority ---
        if (fingers === 1 && duration > this.config.longPressTime && netDist < this.config.tapPrecision) {
            this._emitGesture('long_tap', 1, { dir: 'none' });
            return;
        }

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

        // --- 2. Hybrid Gestures ---
        if (fingers === 2 && pathLen > 40 && netDist > 40) {
             let startSpan = 0, endSpan = 0;
             inputs.forEach(s => {
                 const f = s.pts[0], l = s.pts[s.pts.length-1];
                 startSpan += Math.hypot(f.x - sc.x, f.y - sc.y);
                 endSpan += Math.hypot(l.x - ec.x, l.y - ec.y);
             });
             startSpan /= 2; endSpan /= 2;
             if (Math.abs(endSpan - startSpan) > 30) {
                 const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                 if (endSpan < startSpan * 0.7) { type = 'pinch_swipe'; meta.dir = dir; }
                 else if (endSpan > startSpan * 1.3) { type = 'expand_swipe'; meta.dir = dir; }
                 this._emitGesture(type, fingers, meta);
                 return;
             }
        }

        // --- 3. One Finger Logic (Shapes & Swipes) ---
        if (fingers === 1) {
            let shapeDetected = false;
            if (pathLen > this.config.swipeThreshold) {
                if (segments.length >= 3) {
                    const a1 = this._getAngleDiff(segments[0].vec, segments[1].vec);
                    const a2 = this._getAngleDiff(segments[1].vec, segments[2].vec);
                    if (Math.abs(a1) > 140 && Math.abs(a2) > 140) { type = 'zigzag'; shapeDetected = true; }
                }
                if (!shapeDetected) {
                    if (segments.length >= 4 && isClosed) { type = 'square'; shapeDetected = true; }
                    else if (segments.length === 3 && isClosed) { type = 'triangle'; shapeDetected = true; }
                    else if (segments.length === 3 && !isClosed) { type = 'u_shape'; shapeDetected = true; }
                    else if (segments.length === 2) {
                        const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                        if (Math.abs(angle) > 150) type = 'boomerang'; else type = 'corner';
                        shapeDetected = true;
                    }
                }
            }

            if (!shapeDetected) {
                // RESTORED: Distinguish Long Swipe vs Swipe vs Spatial Tap
                if (netDist > 150) { 
                    type = 'swipe_long'; 
                    meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y); 
                } 
                else if (netDist > this.config.swipeThreshold) { 
                    type = 'swipe'; 
                    meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y); 
                } 
                else if (netDist > this.config.spatialThreshold) { 
                    type = 'spatial_tap'; 
                    meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y); 
                }
            } else if (pathLen < 150) {
                type = 'motion_tap_' + type;
            }
        } 

        // --- 4. Multi Finger Swipes ---
        if (fingers > 1 && type === 'tap' && netDist > 30) {
            type = 'swipe';
            if (segments.length >= 2) {
                 const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                 if (Math.abs(angle) > 150) type = 'boomerang';
            }
            meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
        }

        // --- 5. Tap Logic ---
        if (type === 'tap') {
            if (fingers > 1) meta.align = this._getAlignment(inputs);
            this._handleTapStack(ec, fingers, meta);
            return;
        }

        this._emitGesture(type, fingers, meta);
    }

    _handleTapStack(pos, fingers, meta) {
        if (this.tapStack.active) {
            clearTimeout(this.tapStack.timer);
            if (fingers === this.tapStack.fingers) {
                this.tapStack.count++;
                this.tapStack.history.push(pos);
                this.tapStack.active = true;
                this.tapStack.timer = setTimeout(() => this._commitStack(), this.config.tapDelay);
                return;
            }
            this._commitStack();
        }
        this.tapStack = {
            active: true, count: 1, fingers: fingers, history: [pos], align: meta.align,
            timer: setTimeout(() => this._commitStack(), this.config.tapDelay)
        };
    }

    _commitStack() {
        const { count, fingers, history, align } = this.tapStack;
        if (count === 0) return;
        this.tapStack = { active: false, count: 0, fingers: 0, history: [], timer: null };

        // 1. Single Tap
        if (count === 1) {
            let type = 'tap';
            if (fingers === 2) type = 'tap_2f';
            else if (fingers === 3) type = 'tap_3f';
            this._emitGesture(type, fingers, { align });
            return;
        }
        // 2. Double Tap
        if (count === 2) {
            const p1 = history[0]; const p2 = history[1];
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            let dir = null;
            if (dist > this.config.tapPrecision) dir = this._getDirection(p2.x - p1.x, p2.y - p1.y);
            let type = 'double_tap';
            if (fingers > 1) type += `_${fingers}f`;
            this._emitGesture(type, fingers, { align, dir }); 
            return;
        }
        // 3. Triple Tap
        if (count === 3) {
            const p1 = history[0]; const p2 = history[1]; const p3 = history[2];
            const v1 = { x: p2.x - p1.x, y: p2.y - p1.y }; const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
            const d1 = Math.hypot(v1.x, v1.y); const d2 = Math.hypot(v2.x, v2.y);
            let type = 'triple_tap'; let dir = null; let winding = null;
            if (d1 > this.config.tapPrecision && d2 > this.config.tapPrecision) {
                const angle = this._getAngleDiff(v1, v2); const dir1 = this._getDirection(v1.x, v1.y);
                if (angle < 45) { type = 'triple_tap_long'; dir = dir1; } 
                else if (angle > 135) { type = 'triple_tap_boomerang'; dir = dir1; } 
                else { type = 'triple_tap_corner'; dir = dir1; winding = (v1.x * v2.y - v1.y * v2.x) > 0 ? 'cw' : 'ccw'; }
            }
            if (fingers > 1) type += `_${fingers}f`;
            this._emitGesture(type, fingers, { align, dir, winding });
            return;
        }
    }

    // --- SMART EMITTER WITH FALLBACK ---
    _emitGesture(baseType, fingers, meta, overrideName = null) {
        let id = baseType;

        // Construct ID
        if (meta && meta.dir && meta.dir !== 'none') {
            const dir = meta.dir.toLowerCase();
            // Most directional things just get appended
            if (['swipe', 'swipe_long', 'spatial_tap', 'square', 'triangle', 'u_shape', 'corner', 'motion_tap_corner', 
                 'triple_tap_corner', 'triple_tap_long', 'triple_tap_boomerang', 'double_tap'].includes(baseType) || baseType.startsWith('double_tap_')) {
                 id += `_${dir}`;
            } else if (!baseType.includes(dir)) {
                 id += `_${dir}`;
            }
        } else {
            // Append _any for generic compatibility if needed
            if (['swipe', 'swipe_long', 'boomerang', 'zigzag', 'spatial_tap', 
                 'triple_tap_long', 'triple_tap_boomerang', 'triple_tap_corner'].includes(baseType)) {
                 id += '_any'; 
            }
            if (baseType.startsWith('motion_tap_') && !baseType.includes('corner')) {
                 id += '_any';
            }
        }

        if (meta && meta.winding) id += `_${meta.winding}`;
        if (fingers > 1 && !id.includes(`${fingers}f`) && !baseType.includes(`${fingers}f`)) id += `_${fingers}f`;
        if (meta && meta.align) {
            const map = { 'Vertical': 'vertical', 'Horizontal': 'horizontal', 'Diagonal SE': 'diagonal_se', 'Diagonal SW': 'diagonal_sw' };
            if (map[meta.align]) id += `_${map[meta.align]}`;
        }

        const multiFingerBases = ['tap_2f', 'double_tap_2f', 'triple_tap_2f', 'long_tap_2f', 'tap_3f', 'double_tap_3f', 'triple_tap_3f', 'long_tap_3f'];
        if (multiFingerBases.includes(id)) id += '_any';

        // --- SMART FALLBACK LOGIC ---
        // If we have an active allowed list, and the detected gesture ISN'T in it, try to degrade it.
        let finalId = id;

        if (this.allowedGestures.size > 0 && !this.allowedGestures.has(id)) {
            // 1. Fallback: Long Swipe -> Swipe
            if (id.startsWith('swipe_long_')) {
                const fallback = id.replace('swipe_long_', 'swipe_');
                if (this.allowedGestures.has(fallback)) finalId = fallback;
            }
            // 2. Fallback: Spatial Tap -> Swipe (Micro-swipes count as swipes if spatial not mapped)
            else if (id.startsWith('spatial_tap_')) {
                const fallback = id.replace('spatial_tap_', 'swipe_');
                if (this.allowedGestures.has(fallback)) finalId = fallback;
            }
        }

        const name = overrideName || finalId;
        this.callbacks.onGesture({ id: finalId, base: baseType, fingers: fingers, meta: meta, name: name });
    }

    // --- UTILS ---
    _getRotationAngle(p1, p2) { return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI; }
    _segmentPath(pts) {
        if (pts.length < 5) return [{dir: 'none', vec:{x:0,y:0}}];
        const segments = []; let start = 0; const threshold = 60; 
        for (let i = 5; i < pts.length - 5; i+=3) {
            const dx1 = pts[i].x - pts[start].x; const dy1 = pts[i].y - pts[start].y;
            const dx2 = pts[i+5].x - pts[i].x; const dy2 = pts[i+5].y - pts[i].y;
            const a1 = Math.atan2(dy1, dx1) * 180/Math.PI; const a2 = Math.atan2(dy2, dx2) * 180/Math.PI;
            let diff = Math.abs(a1-a2); if (diff > 180) diff = 360 - diff;
            if (diff > threshold && Math.hypot(dx1,dy1) > 20) {
                segments.push({ dir: this._getDirection(dx1, dy1), vec: {x:dx1, y:dy1} }); start = i;
            }
        }
        const lastDx = pts[pts.length-1].x - pts[start].x; const lastDy = pts[pts.length-1].y - pts[start].y;
        if (Math.hypot(lastDx, lastDy) > 10) segments.push({ dir: this._getDirection(lastDx, lastDy), vec: {x:lastDx, y:lastDy} });
        return segments;
    }
    _getTurnDir(v1, v2) { return (v1.x * v2.y - v1.y * v2.x); }
    _getAngleDiff(v1, v2) { const a1 = Math.atan2(v1.y, v1.x)*180/Math.PI; const a2 = Math.atan2(v2.y, v2.x)*180/Math.PI; let d = Math.abs(a1-a2); if(d>180) d=360-d; return d; }
    _getPathLen(pts) { let l=0; for(let i=1;i<pts.length;i++) l+=Math.hypot(pts[i].x-pts[i-1].x, pts[i].y-pts[i-1].y); return l; }
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
        const xs = pts.map(p => p.x); const ys = pts.map(p => p.y);
        const w = Math.max(...xs) - Math.min(...xs); const h = Math.max(...ys) - Math.min(...ys);
        if (h > w * 1.5) return 'Vertical'; if (w > h * 1.5) return 'Horizontal';
        const left = pts.reduce((a,b) => a.x < b.x ? a : b); const right = pts.reduce((a,b) => a.x > b.x ? a : b);
        return right.y > left.y ? 'Diagonal SE' : 'Diagonal SW';
    }
}
