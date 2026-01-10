// gestures.js
// Version: v99 - All Fixes (Delete/Clear + 8-Way Corners + Constraints)

export class GestureEngine {
    constructor(targetElement, config, callbacks) {
        this.target = targetElement || document.body;
        this.config = Object.assign({
            tapDelay: 800,        
            longPressTime: 300,   
            swipeThreshold: 40,   
            spatialThreshold: 10, 
            tapPrecision: 30,
            longSwipeThreshold: 150, 
            multiSwipeThreshold: 10, 
            debug: false
        }, config || {});

        this.callbacks = Object.assign({
            onGesture: (data) => console.log('Gesture:', data), 
            onContinuous: (data) => console.log('Continuous:', data), 
            onDebug: (msg) => {}
        }, callbacks || {});

        this.activePointers = {};
        this.history = [];
        this.tapStack = { count: 0, fingers: 0, timer: null, posHistory: [], active: false };
        
        // Safety: Initialize allowed gestures set
        this.allowedGestures = new Set();

        // Continuous State (For Delete/Clear/Twist)
        this.contState = {
            rotStartAngle: 0, rotAccumulator: 0, rotLastUpdate: 0, pinchStartDist: 0,
            squiggle: { isTracking: false, startX: 0, lastX: 0, direction: 0, flips: 0, hasTriggered: false },
            squiggle2F: { isTracking: false, lastX: 0, direction: 0, flips: 0, hasTriggered: false }
        };

        this._bindHandlers();
    }

    // Constraint Management
    updateAllowed(list) {
        this.allowedGestures = new Set(list);
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
        // Ignore buttons unless in gesture mode
        if (e.target.tagName === 'BUTTON' && !document.body.classList.contains('input-gestures-mode')) return;
        
        this.activePointers[e.pointerId] = {
            id: e.pointerId,
            pts: [{ x: e.clientX, y: e.clientY }],
            startTime: Date.now()
        };

        const count = Object.keys(this.activePointers).length;
        const pointers = Object.values(this.activePointers);

        // Init 1-Finger Squiggle (Delete)
        if (count === 1) {
            this.contState.squiggle = {
                isTracking: true, startX: e.clientX, lastX: e.clientX, direction: 0, flips: 0, hasTriggered: false
            };
        }
        
        // Init 2-Finger Squiggle (Clear) & Rotate/Pinch
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
        
        // Prevent scrolling if tracking complex gestures
        if (this.contState.squiggle.isTracking || this.contState.squiggle2F.isTracking) {
             if (e.cancelable) e.preventDefault();
        }

        const ptr = this.activePointers[e.pointerId];
        ptr.pts.push({ x: e.clientX, y: e.clientY });

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
                    this.contState.squiggle.hasTriggered = true;
                    // FIX: Emit as 'onGesture' so app.js listeners catch it as "DELETE"
                    this.callbacks.onGesture({ name: 'DELETE', base: 'squiggle', fingers: 1, id: 'squiggle' });
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
                
                if (this.contState.squiggle2F.flips >= 4) {
                    this.contState.squiggle2F.hasTriggered = true;
                    // FIX: Emit as 'onGesture' so app.js listeners catch it as "CLEAR"
                    this.callbacks.onGesture({ name: 'CLEAR', base: 'squiggle', fingers: 2, id: 'squiggle_2f' });
                }
            }
        }

        // 3. Twist
        if ((count === 2 || count === 3) && (now - this.contState.rotLastUpdate > 50)) {
            const p1 = pointers[0].pts.slice(-1)[0]; 
            const p2 = pointers[1].pts.slice(-1)[0];
            const currentAngle = this._getRotationAngle(p1, p2);
            let delta = currentAngle - this.contState.rotStartAngle;
            if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
            
            this.contState.rotAccumulator += delta; 
            this.contState.rotStartAngle = currentAngle;
            
            if (Math.abs(this.contState.rotAccumulator) > 15) {
                this.callbacks.onContinuous({ type: 'twist', fingers: count, value: this.contState.rotAccumulator > 0 ? 1 : -1 });
                this.contState.rotAccumulator = 0; 
                this.contState.rotLastUpdate = now;
            }
        }

        // 4. Pinch
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
            
            // If continuous action triggered (e.g., delete), don't analyze as a shape
            if (this.contState.squiggle.hasTriggered || this.contState.squiggle2F.hasTriggered) {
                this.history = []; 
                this.contState.squiggle.hasTriggered = false;
                this.contState.squiggle2F.hasTriggered = false;
                return;
            }

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this._analyze(), 50);
        }
    }

    _analyze() {
        const inputs = this.history; this.history = []; if (inputs.length === 0) return;
        const fingers = new Set(inputs.map(s => s.id)).size;
        let sc = {x:0,y:0}, ec = {x:0,y:0};
        inputs.forEach(s => { sc.x += s.pts[0].x; sc.y += s.pts[0].y; ec.x += s.pts[s.pts.length-1].x; ec.y += s.pts[s.pts.length-1].y; });
        sc.x /= inputs.length; sc.y /= inputs.length; ec.x /= inputs.length; ec.y /= inputs.length;

        const primaryPath = inputs[0].pts;
        let segments = this._segmentPath(primaryPath);
        segments = this._cleanSegments(segments);
        segments = this._mergeSegments(segments);

        const netDist = Math.hypot(ec.x - sc.x, ec.y - sc.y);
        const pathLen = this._getPathLen(primaryPath);
        const isClosed = netDist < 50;

        let turnSum = 0; if (segments.length > 1) { for (let i = 0; i < segments.length - 1; i++) { turnSum += this._getTurnDir(segments[i].vec, segments[i + 1].vec); } }
        const winding = turnSum > 0 ? 'cw' : 'ccw';
        let type = 'tap'; let meta = { fingers: fingers };

        // --- 1. Multi-Finger Hybrid Swipes ---
        if (fingers === 2 && pathLen > 40 && netDist > 40) {
             let startSpan = 0, endSpan = 0;
             inputs.forEach(s => { const f = s.pts[0], l = s.pts[s.pts.length-1]; startSpan += Math.hypot(f.x - sc.x, f.y - sc.y); endSpan += Math.hypot(l.x - ec.x, l.y - ec.y); });
             startSpan /= 2; endSpan /= 2;
             if (Math.abs(endSpan - startSpan) > 30) {
                 const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                 if (endSpan < startSpan * 0.7) { type = 'pinch_swipe'; meta.dir = dir; }
                 else if (endSpan > startSpan * 1.3) { type = 'expand_swipe'; meta.dir = dir; }
                 this._emitGesture(type, fingers, meta); return;
             }
        }

        // --- 2. Shapes & Swipes ---
        if (type === 'tap' && pathLen > this.config.swipeThreshold) {
            // 4+ Segments
            if (segments.length >= 4) {
                const t1 = this._getTurnDir(segments[0].vec, segments[1].vec); 
                const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
                
                const alternating = (t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0);
                
                if (alternating) {
                    type = 'long_zigzag'; // M/W Shape
                } else if (isClosed) { 
                    type = 'square'; meta.winding = winding; 
                } else {
                    type = 'long_zigzag'; 
                }
                meta.dir = segments[0].dir; 
            } 
            // 3 Segments
            else if (segments.length === 3) {
                 if (isClosed) { 
                     type = 'triangle'; meta.dir = segments[0].dir; meta.winding = winding; 
                 } else { 
                     const t1 = this._getTurnDir(segments[0].vec, segments[1].vec); 
                     const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
                     if ((t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0)) {
                         type = 'zigzag'; // Z Shape
                     } else {
                         const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                         if (Math.abs(angle) < 135) type = 'u_shape';
                         else type = 'long_boomerang';
                         meta.winding = winding;
                     }
                     meta.dir = segments[0].dir; 
                 }
            } 
            // 2 Segments
            else if (segments.length === 2) {
                meta.dir = segments[0].dir; meta.winding = winding;
                const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                if (Math.abs(angle) > 125) { type = 'boomerang'; }
                else { type = 'corner'; }
            } 
            // 1 Segment
            else {
                const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                let threshold = this.config.longSwipeThreshold;
                if (dir.length > 2) threshold += 60; // Diagonal penalty
                type = netDist > threshold ? 'swipe_long' : 'swipe';
                meta.dir = dir;
            }
        }

        // --- 3. Multi Finger Swipes ---
        if (fingers > 1 && type === 'tap' && netDist > this.config.multiSwipeThreshold) {
            type = 'swipe';
            if (segments.length >= 2) {
                 const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                 if (Math.abs(angle) > 150) type = 'boomerang';
            }
            meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
        }

        if (type === 'tap') {
            const dur = inputs[0].endTime - inputs[0].startTime;
            if (dur > this.config.longPressTime) type = 'long_tap';
            if (fingers > 1) meta.align = this._getAlignment(inputs);
        }

        // --- 4. Tap Stack (Spatial & Motion) ---
        if (this.tapStack.active) {
            clearTimeout(this.tapStack.timer); this.tapStack.active = false;
            
            if (type === 'tap' && fingers === this.tapStack.fingers) {
                const seqDist = Math.hypot(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
                if (seqDist > 50 && fingers === 1) {
                    const dir = this._getDirection(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
                    this._emitGesture('motion_tap', fingers, { subMode: 'spatial', dir: dir });
                    this._clearStack();
                    return;
                } else {
                    this.tapStack.count++;
                    this.tapStack.posHistory.push(ec);
                    this.tapStack.lastPos = ec;
                    this.tapStack.active = true;
                    this.tapStack.timer = setTimeout(() => this._commitStack(), this.config.tapDelay);
                    return;
                }
            }
            // Tap then Shape
            if (type !== 'tap' && fingers === 1 && this.tapStack.fingers === 1) {
                this._emitGesture('motion_tap', 1, { subMode: type, dir: meta.dir, winding: meta.winding });
                this._clearStack();
                return;
            }
            this._commitStack();
        }

        if (type === 'tap') { 
            this.tapStack = { 
                active: true, count: 1, fingers: fingers, 
                posHistory: [ec], lastPos: ec,
                align: meta.align, 
                timer: setTimeout(() => this._commitStack(), this.config.tapDelay) 
            }; 
            return; 
        }
        this._emitGesture(type, fingers, meta);
    }

    _commitStack() { 
        const { count, fingers, posHistory, align } = this.tapStack;
        if (count > 0) { 
            let maxDist = 0; 
            for(let i=1; i<posHistory.length; i++) {
                maxDist = Math.max(maxDist, Math.hypot(posHistory[i].x-posHistory[i-1].x, posHistory[i].y-posHistory[i-1].y));
            }

            if (maxDist > 50 && fingers === 1 && count >= 2) {
                // 3-Tap Spatial
                if (count === 3) {
                    const v1 = { x: posHistory[1].x - posHistory[0].x, y: posHistory[1].y - posHistory[0].y };
                    const v2 = { x: posHistory[2].x - posHistory[1].x, y: posHistory[2].y - posHistory[1].y };
                    const angle = Math.abs(this._getAngleDiff(v1, v2));
                    
                    let subMode = 'spatial_line';
                    let finalDir = this._getDirection(v1.x, v1.y);

                    if (angle > 150) {
                        subMode = 'spatial_boomerang';
                        finalDir = this._getDirection(v1.x, v1.y);
                    }
                    else if (angle > 45 && angle < 135) { 
                        subMode = 'spatial_corner'; 
                        
                        // NEW: 8-Way Corner Detection (Order matters)
                        const d1 = this._getDirection(v1.x, v1.y);
                        const d2 = this._getDirection(v2.x, v2.y);
                        const combo = d1 + '_' + d2;
                        
                        const dirMap = {
                            'up_right': 'ne',   'right_up': 'en',
                            'up_left': 'nw',    'left_up': 'wn',
                            'down_right': 'se', 'right_down': 'es',
                            'down_left': 'sw',  'left_down': 'ws'
                        };
                        
                        if(dirMap[combo]) finalDir = dirMap[combo];
                        else finalDir = this._getDirection(v1.x + v2.x, v1.y + v2.y); // Fallback
                    }
                    this._emitGesture('triple_tap', fingers, { subMode: subMode, dir: finalDir });
                }
            } else { 
                // Static Taps
                let type = 'tap'; 
                if (count === 2) type = 'double_tap'; 
                if (count === 3) type = 'triple_tap'; 
                this._emitGesture(type, fingers, { align: align }); 
            }
            this._clearStack(); 
        } 
    }

    _clearStack() { this.tapStack = { active: false, count: 0, fingers: 0, posHistory: [], timer: null }; }

    _emitGesture(baseType, fingers, meta, overrideName = null) {
        let id = baseType;
        if (meta && meta.subMode) id += '_' + meta.subMode;
        if (meta && meta.dir && meta.dir !== 'Any' && meta.dir !== 'none') id += '_' + meta.dir.toLowerCase(); 
        
        const windingShapes = ['corner', 'triangle', 'u_shape', 'square'];
        const checkType = meta && meta.subMode ? meta.subMode : baseType;
        if (meta && meta.winding && windingShapes.some(s => checkType.includes(s))) id += '_' + meta.winding; 

        if (fingers > 1) id += '_' + fingers + 'f';
        if (meta && meta.align) {
            const map = { 'Vertical': 'vertical', 'Horizontal': 'horizontal', 'Diagonal SE': 'diagonal_se', 'Diagonal SW': 'diagonal_sw' };
            if (map[meta.align]) id += `_${map[meta.align]}`;
        }

        const multiFingerBases = ['tap_2f', 'double_tap_2f', 'triple_tap_2f', 'long_tap_2f', 'tap_3f', 'double_tap_3f', 'triple_tap_3f', 'long_tap_3f'];
        if (multiFingerBases.includes(id)) id += '_any';

        // Constraint Checking
        let finalId = id;
        const tryFallback = (candidate) => {
            if (this.allowedGestures && this.allowedGestures.has(candidate)) { finalId = candidate; return true; }
            return false;
        };

        if (this.allowedGestures && this.allowedGestures.size > 0 && !this.allowedGestures.has(id)) {
            if (id.startsWith('swipe_long_')) {
                const standard = id.replace('swipe_long_', 'swipe_');
                if (tryFallback(standard)) { /* matched */ }
            } else if (id.startsWith('motion_tap_spatial_')) {
                 const standard = id.replace('motion_tap_spatial_', 'swipe_');
                 if (tryFallback(standard)) { /* matched */ }
            }
            if (!this.allowedGestures.has(finalId)) {
                const dirs = ['_up','_down','_left','_right','_nw','_ne','_sw','_se'];
                for (let d of dirs) {
                    if (finalId.includes(d)) {
                        let test = finalId.replace(d, '_any');
                        if (tryFallback(test)) break;
                    }
                }
            }
        }

        if (this.allowedGestures && this.allowedGestures.size > 0 && !this.allowedGestures.has(finalId)) return;
        
        const name = overrideName || finalId;
        this.callbacks.onGesture({ id: finalId, base: baseType, fingers: fingers, meta: meta, name: name });
    }

    // --- UTILS ---
    _getRotationAngle(p1, p2) { return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI; }
    _cleanSegments(segments) { return segments.filter(s => Math.hypot(s.vec.x, s.vec.y) > 15); }
    _mergeSegments(segments) {
        if (segments.length < 2) return segments;
        const merged = []; let current = segments[0];
        for (let i = 1; i < segments.length; i++) {
            const next = segments[i];
            if (Math.abs(this._getAngleDiff(current.vec, next.vec)) < 45) {
                current.vec.x += next.vec.x; current.vec.y += next.vec.y;
                current.dir = this._getDirection(current.vec.x, current.vec.y);
            } else { merged.push(current); current = next; }
        }
        merged.push(current); return merged;
    }
    _segmentPath(pts) {
        if (pts.length < 5) return [{dir: 'none', vec:{x:0,y:0}}];
        const segments = []; let start = 0; const threshold = 45; 
        for (let i = 2; i < pts.length - 2; i++) {
            const dx1 = pts[i].x - pts[start].x; const dy1 = pts[i].y - pts[start].y;
            const nextIdx = Math.min(i + 5, pts.length - 1);
            const dx2 = pts[nextIdx].x - pts[i].x; const dy2 = pts[nextIdx].y - pts[i].y;
            const a1 = Math.atan2(dy1, dx1) * 180/Math.PI; const a2 = Math.atan2(dy2, dx2) * 180/Math.PI;
            let diff = Math.abs(a1-a2); if (diff > 180) diff = 360 - diff;
            if (diff > threshold && Math.hypot(dx1,dy1) > 10) {
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
        return 'Diagonal';
    }
}
