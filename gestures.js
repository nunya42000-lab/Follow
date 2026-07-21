// gestures.js
// Version: v100 - "I-Shape" Boomerangs & Switchbacks

// --- Merged from gesture_groups.js (was a separate file, now consolidated here) ---
export const HAND_GESTURE_GROUPS = [
    {
        id: "hand_poses",
        name: "Hand Static Poses",
        enabled: true,
        gestures: [
            { id: "0", name: "✊ Fist" },
            { id: "18", name: "🤘 Rock On" },
            { id: "34", name: "🤙 Shaka" },
            { id: "48", name: "🫵 Gun / L-Shape" },
            { id: "50", name: "🤟 Spidey / ILY" },
            { id: "600", name: "👍 Thumbs Up" },
            { id: "601", name: "👎 Thumbs Down" }
        ]
    },
    {
        id: "hand_pinches",
        name: "Hand Pinches",
        enabled: true,
        gestures: [
            { id: "100", name: "🤏 Basic Pinch" },
            { id: "104", name: "🤌 Chef Kiss (All)" },
            { id: "105", name: "👌 OK Sign" }
        ]
    },
    {
        id: "hand_counts",
        name: "Hand Finger Counts",
        enabled: true,
        gestures: [
            { id: "16", name: "☝️ 1 Finger (Index)" },
            { id: "24", name: "✌️ 2 Fingers (Peace)" },
            { id: "28", name: "3️⃣ 3 Fingers" },
            { id: "30", name: "4️⃣ 4 Fingers" },
            { id: "62", name: "🖐️ 5 Fingers (Palm)" }
        ]
    },
    {
        id: "hand_vision_shapes",
        name: "Hand Advanced Vision Shapes",
        enabled: true,
        gestures: [
            { id: "200", name: "🪃 Boomerang Pattern" },
            { id: "201", name: "⚡ Zigzag Motion" },
            { id: "202", name: "⚓ Anchor Hold" },
            { id: "203", name: "🔄 Circular Sweep" }
        ]
    },
    {
        id: "hand_combos",
        name: "Hand Combos (specific finger combinations)",
        enabled: true,
        gestures: [
            { id: "12", name: "🥢 Chopsticks" },
            { id: "14", name: "🤟 Three (No Index)" },
            { id: "20", name: "🤞 Index + Ring" },
            { id: "22", name: "Index + Ring + Pinky" },
            { id: "26", name: "✌️ Peace + Pinky" },
            { id: "36", name: "Thumb + Ring" },
            { id: "38", name: "Thumb + Ring + Pinky" },
            { id: "40", name: "Thumb + Middle" },
            { id: "42", name: "Thumb + Middle + Pinky" },
            { id: "44", name: "Thumb + Middle + Ring" },
            { id: "46", name: "Four (No Index)" },
            { id: "52", name: "Thumb + Index + Ring" },
            { id: "54", name: "Four (No Middle)" },
            { id: "56", name: "🖖 Scout Sign" },
            { id: "58", name: "Four (No Ring)" },
            { id: "60", name: "Five (No Pinky)" },
            { id: "101", name: "🤏 Pinch (Middle)" },
            { id: "102", name: "🤏 Pinch (Ring)" },
            { id: "103", name: "🤏 Pinch (Pinky)" }
        ]
    },
    {
        id: "hand_swipes",
        name: "Hand Directional Swipes",
        enabled: true,
        gestures: [
            { id: "300", name: "👆 Swipe Up" },
            { id: "301", name: "👇 Swipe Down" },
            { id: "302", name: "👈 Swipe Left" },
            { id: "303", name: "👉 Swipe Right" }
        ]
    },
    {
        id: "hand_transitions",
        name: "Motion Transitions",
        enabled: true,
        gestures: [
            { id: "400", name: "🗑️ Throw (Fist → Open)" },
            { id: "401", name: "✊ Grab (Open → Fist)" },
            { id: "402", name: "👐 Release (Pinch → Open)" },
            { id: "403", name: "🤏 Snatch (Open → Pinch)" },
            { id: "404", name: "☝️ Point Out (Fist → 1 Finger)" }
        ]
    },]
// NOTE: TOUCH_GESTURE_GROUPS was removed here - confirmed 100% unused anywhere in
// the project (touch filtering uses GESTURE_CATEGORIES in settings.js instead).



// --- End merged content ---

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
            anchorStillDistance: 15,
            anchorMinHoldTime: 150,
            chordSimultaneityWindow: 50,
            pauseDwellRadius: 22,
            pauseDwellTime: 400,
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
        this.allowedGestures = new Set();
        this.contState = {
            rotStartAngle: 0, rotAccumulator: 0, rotLastUpdate: 0, pinchStartDist: 0,
            squiggle: { isTracking: false, startX: 0, lastX: 0, direction: 0, flips: 0, hasTriggered: false },
            squiggle2F: { isTracking: false, lastX: 0, direction: 0, flips: 0, hasTriggered: false }
        };

        this._bindHandlers();
    }

    // FIX: this.config was captured once at construction and never re-read, so every
    // sensitivity slider (Tap Speed, Swipe Distance, etc.) silently required a page reload to
    // take effect - changing one updated appSettings but the live engine never saw it. This
    // reads the current value from appSettings each time, falling back to the constructor
    // default if appSettings isn't available yet.
    _cfg(key) {
        const appSettingsKeyMap = {
            tapDelay: 'gestureTapDelay',
            swipeThreshold: 'gestureSwipeDist',
            longPressTime: 'gestureLongPressTime',
            tapPrecision: 'gestureTapPrecision',
            spatialThreshold: 'gestureSpatialThreshold',
            longSwipeThreshold: 'gestureLongSwipeThreshold',
            multiSwipeThreshold: 'gestureMultiSwipeThreshold',
            anchorStillDistance: 'touchAnchorStillDistance',
            anchorMinHoldTime: 'touchAnchorMinHoldTime',
            chordSimultaneityWindow: 'touchChordSimultaneityWindow',
            pauseDwellRadius: 'touchPauseDwellRadius',
            pauseDwellTime: 'touchPauseDwellTime',
        };
        const settingKey = appSettingsKeyMap[key];
        if (settingKey && window.appSettings && window.appSettings[settingKey] !== undefined && window.appSettings[settingKey] !== null) {
            return window.appSettings[settingKey];
        }
        return this.config[key];
    }

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
        if (e.target.tagName === 'BUTTON' && !document.body.classList.contains('input-gestures-mode')) return;
        
        this.activePointers[e.pointerId] = {
            id: e.pointerId,
            pts: [{ x: e.clientX, y: e.clientY, t: Date.now() }],
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
        ptr.pts.push({ x: e.clientX, y: e.clientY, t: Date.now() });

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
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 1 });
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
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 2 });
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

    // Classifies a single finger's own path in isolation - used by anchor/chord detection,
    // which needs to look at what EACH finger did independently rather than the collective
    // average _analyze() uses for normal multi-finger swipes.
    _classifySingleFinger(ptr) {
        const pts = ptr.pts;
        const first = pts[0];
        const last = pts[pts.length - 1];
        const dx = last.x - first.x;
        const dy = last.y - first.y;
        const dist = Math.hypot(dx, dy);
        const duration = (ptr.endTime || Date.now()) - ptr.startTime;

        // "Still" (anchor candidate) needs BOTH minimal movement AND to have been held for a
        // while - a fast, precise tap can have equally tiny displacement, so distance alone
        // can't tell the two apart.
        if (dist < this._cfg('anchorStillDistance') && duration >= this._cfg('anchorMinHoldTime')) return { kind: 'still' };
        if (dist < this._cfg('tapPrecision') && duration < this._cfg('longPressTime')) return { kind: 'tap' };
        if (dist > this._cfg('swipeThreshold')) return { kind: 'swipe', dir: this._getDirection(dx, dy) };
        return { kind: 'ambiguous' };
    }

    // FIX: "anchors... hold 1 down and then tap or swipe with another" / "chords... each finger
    // isn't doing the same thing" - two genuinely new gesture types, not just re-exposing
    // existing ones. Anchor: whichever finger touched down FIRST stayed still (a modifier, like
    // holding Shift) while the second finger tapped or swiped. Chord: both fingers had real,
    // independent motion that DIFFERED from each other (two fingers swiping the same direction
    // together is already the existing multi-finger swipe - this is specifically for when they
    // don't match). Runs before the normal analyzer and only intercepts when one of these two
    // patterns actually matches; otherwise everything falls through unchanged.
    _tryAnchorOrChord(inputs) {
        if (inputs.length !== 2) return false;

        const sorted = [...inputs].sort((a, b) => a.startTime - b.startTime);
        const first = sorted[0], second = sorted[1];
        const downTimeDelta = second.startTime - first.startTime;
        const c1 = this._classifySingleFinger(first);
        const c2 = this._classifySingleFinger(second);

        // Anchor: first-down finger held still, second finger acted - inherently sequential
        // (that's the whole point of a modifier), so no simultaneity requirement here.
        if (c1.kind === 'still' && (c2.kind === 'tap' || c2.kind === 'swipe')) {
            if (c2.kind === 'tap') this._emitGesture('anchor', 2, { subMode: 'tap' });
            else this._emitGesture('anchor', 2, { subMode: 'swipe', dir: c2.dir });
            return true;
        }

        // Chord: both fingers touched down within a tight simultaneity window (humans can't
        // land multiple fingers on glass at the exact same millisecond) and each had real,
        // independent motion that differs from the other.
        const SIMULTANEITY_WINDOW_MS = this._cfg('chordSimultaneityWindow');
        const oppositePairs = { up: 'down', down: 'up', left: 'right', right: 'left', nw: 'se', se: 'nw', ne: 'sw', sw: 'ne' };
        if (downTimeDelta <= SIMULTANEITY_WINDOW_MS && (c1.kind === 'tap' || c1.kind === 'swipe') && (c2.kind === 'tap' || c2.kind === 'swipe')) {
            const label1 = c1.kind === 'tap' ? 'tap' : c1.dir;
            const label2 = c2.kind === 'tap' ? 'tap' : c2.dir;
            // Directly opposite directions (fingers converging or diverging) are pinch_swipe/
            // expand_swipe territory, not a chord - those are handled separately in _analyze().
            const isOppositePair = oppositePairs[label1] === label2;
            if (label1 !== label2 && !isOppositePair) {
                // Sort alphabetically so "up+left" and "left+up" produce the same id
                const [a, b] = [label1, label2].sort();
                this._emitGesture('chord', 2, { subMode: `${a}_${b}` });
                return true;
            }
        }

        return false;
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
            
            if (this.contState.squiggle.hasTriggered || this.contState.squiggle2F.hasTriggered) {
                this.history = []; 
                this.contState.squiggle.hasTriggered = false;
                this.contState.squiggle2F.hasTriggered = false;
                return;
            }

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                const inputs = this.history;
                if (this._tryAnchorOrChord(inputs)) {
                    this.history = [];
                    return;
                }
                this._analyze();
            }, 50);
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
        if (type === 'tap' && pathLen > this._cfg('swipeThreshold')) {
            
            // --- 4 Segments (Square or Long Zigzag) ---
            if (segments.length >= 4) {
                const t1 = this._getTurnDir(segments[0].vec, segments[1].vec); 
                const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
                const alternating = (t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0);
                
                if (alternating) { type = 'long_zigzag'; } 
                else if (isClosed) { type = 'square'; meta.winding = winding; } 
                else { type = 'long_zigzag'; }
                meta.dir = segments[0].dir; 
            } 
            // --- 3 Segments (Long Boomerang, Zigzag, Triangle, U-Shape) ---
            else if (segments.length === 3) {
                 if (isClosed) { type = 'triangle'; meta.dir = segments[0].dir; meta.winding = winding; } 
                 else { 
                     const t1 = this._getTurnDir(segments[0].vec, segments[1].vec); 
                     const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
                     // Check if turns alternate (Left-Right or Right-Left)
                     const alternating = (t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0);
                     
                     if (alternating) {
                         const a1 = this._getAngleDiff(segments[0].vec, segments[1].vec);
                         const a2 = this._getAngleDiff(segments[1].vec, segments[2].vec);
                         
                         // Tight "I" Shape check (Double 180 flip)
                         if (a1 >= 165 && a2 >= 165) {
                             type = 'long_boomerang';
                         } else {
                             type = 'zigzag';
                         }
                     } 
                     else {
                         const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                         // Note: 'long_boomerang' used to be here for wide curves, 
                         // but user redefined it as an I-shape. 
                         // Wide curves are now just U-Shapes or U-Shape derivatives.
                         type = 'u_shape';
                         meta.winding = winding;
                     }
                     meta.dir = segments[0].dir; 
                 }
            } 
            // --- 2 Segments (Boomerang, Switchback, Corner) ---
            else if (segments.length === 2) {
                meta.dir = segments[0].dir; 
                meta.winding = winding;
                const angle = Math.abs(this._getAngleDiff(segments[0].vec, segments[1].vec));
                
                if (angle >= 165) { type = 'boomerang'; }     // I-Shape (180 deg)
                else if (angle > 125) { type = 'switchback'; } // > Shape
                else { type = 'corner'; }                     // L Shape

                // Pausing variant: if the finger visibly held still (~half a second) at the
                // direction-change point, this is a "Pausing" gesture. Single-finger only, to
                // match the Pausing Curves category (which has no multi-finger entries).
                if (fingers === 1 && this._hasDwell(primaryPath)) {
                    if (type === 'boomerang') { this._emitGesture('Pausing_boomerang', 1, { dir: meta.dir }); return; }
                    if (type === 'switchback') { this._emitGesture('Pausing_Switchback', 1, { dir: meta.dir, winding: winding }); return; }
                    if (type === 'corner') { this._emitGesture('Pausing_corner', 1, { dir: meta.dir, winding: winding }); return; }
                }
            } 
            // --- 1 Segment (Swipe) ---
            else {
                const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                let threshold = this._cfg('longSwipeThreshold');
                if (dir.length > 2) threshold += 60; 
                type = netDist > threshold ? 'swipe_long' : 'swipe';
                meta.dir = dir;

                // Pausing swipe: a swipe with a deliberate mid-path hold (~half a second).
                // Single-finger only, matching the category. Checked before Flick since a paused
                // swipe is by definition not a quick flick.
                if (fingers === 1 && this._hasDwell(primaryPath)) {
                    this._emitGesture('Pausing_swipe', 1, { dir: dir });
                    return;
                }

                // FIX: "Flick" was listed as a selectable option (GESTURE_CATEGORIES, and your
                // own imported preset) but the engine never actually produced this gesture id -
                // any key mapped to it could never fire, no matter how the gesture was performed.
                // A flick is a swipe completed quickly (snappy, short duration), as opposed to a
                // slower, more deliberate swipe - using duration as the distinguishing factor
                // since both can cover similar distance.
                if (type === 'swipe' && fingers === 1) {
                    const swipeDuration = inputs[0].endTime - inputs[0].startTime;
                    if (swipeDuration < 200) {
                        this._emitGesture('Flick', fingers, { dir: dir });
                        return;
                    }
                }
            }
        }

        if (fingers > 1 && type === 'tap' && netDist > this._cfg('multiSwipeThreshold')) {
            type = 'swipe';
            if (segments.length >= 2) {
                 const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                 if (Math.abs(angle) > 150) type = 'boomerang';
            }
            meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
        }

        if (type === 'tap') {
            const dur = inputs[0].endTime - inputs[0].startTime;
            if (dur > this._cfg('longPressTime')) type = 'long_tap';
            if (fingers > 1) meta.align = this._getAlignment(inputs);
        }

        // --- 4. Tap Stack ---
        if (this.tapStack.active) {
            clearTimeout(this.tapStack.timer); this.tapStack.active = false;
            if (type === 'tap' && fingers === this.tapStack.fingers) {
                const seqDist = Math.hypot(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
                // FIX: this used to emit 'Double_tap_spatial_<dir>' (previously wrongly named
                // 'motion_tap_spatial_<dir>') immediately the instant a 2nd tap landed far from
                // the 1st - which meant a 3rd tap could never arrive to upgrade it into a
                // triple_tap_spatial_line/corner/boomerang shape. Those could never fire at all
                // as a result. Now this just accumulates like any other tap in the stack; the
                // actual spatial-vs-plain decision (and the double vs triple distinction) is made
                // once in _commitStack() after the tap-delay window closes, the same place the
                // triple-tap spatial shapes were already being decided.
                this.tapStack.count++;
                this.tapStack.posHistory.push(ec);
                this.tapStack.lastPos = ec;
                this.tapStack.active = true;
                this.tapStack.timer = setTimeout(() => this._commitStack(), this._cfg('tapDelay'));
                return;
            }
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
                timer: setTimeout(() => this._commitStack(), this._cfg('tapDelay')) 
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
                // Spatial Taps
                if (count === 2) {
                    const dir = this._getDirection(posHistory[1].x - posHistory[0].x, posHistory[1].y - posHistory[0].y);
                    this._emitGesture('Double_tap_spatial', 1, { dir: dir });
                } else if (count === 3) {
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
                        else finalDir = this._getDirection(v1.x + v2.x, v1.y + v2.y); 
                    }
                    this._emitGesture('triple_tap', fingers, { subMode: subMode, dir: finalDir });
                }
            } else { 
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
        
        const windingShapes = ['corner', 'triangle', 'u_shape', 'square', 'switchback'];
        const checkType = meta && meta.subMode ? meta.subMode : baseType;
        if (meta && meta.winding && windingShapes.some(s => checkType.includes(s))) id += '_' + meta.winding; 

        if (fingers > 1) id += '_' + fingers + 'f';

        if (meta && meta.align) {
            const map = { 
                'Vertical': 'vertical', 
                'Horizontal': 'horizontal', 
                'Diagonal SE': 'diagonal_se', 
                'Diagonal SW': 'diagonal_sw' 
            };
            if (map[meta.align]) id += `_${map[meta.align]}`;
        }

        const multiFingerBases = ['tap_2f', 'double_tap_2f', 'triple_tap_2f', 'long_tap_2f', 'tap_3f', 'double_tap_3f', 'triple_tap_3f', 'long_tap_3f'];
        if (multiFingerBases.includes(id)) id += '_any'; 
        
        let finalId = id;

        // Helper to check allow list
        const tryFallback = (candidate) => {
            if (this.allowedGestures && this.allowedGestures.has(candidate)) { finalId = candidate; return true; }
            return false;
        };

        // Try exact match first
        if (this.allowedGestures && this.allowedGestures.size > 0 && !this.allowedGestures.has(finalId)) {
            
            if (id.startsWith('swipe_long_')) {
                if (tryFallback(id.replace('swipe_long_', 'swipe_'))) {}
            } else if (id.startsWith('motion_tap_spatial_')) {
                 if (tryFallback(id.replace('motion_tap_spatial_', 'swipe_'))) {}
            }

            const alignments = ['_vertical', '_horizontal', '_diagonal_se', '_diagonal_sw'];
            for (let a of alignments) {
                if (finalId.includes(a)) {
                    let test = finalId.replace(a, '_any');
                    if (tryFallback(test)) break;
                }
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
    // Powers "Pausing" gestures: returns true if the finger held within a small radius for at
    // least ~half a second somewhere along the path (a deliberate mid-gesture pause). Requires
    // per-point timestamps (added at capture time). The radius keeps a naturally-slowing turn
    // from counting - only an actual hold-still qualifies.
    _hasDwell(pts) {
        if (!pts || pts.length < 3) return false;
        const DWELL_RADIUS = this._cfg('pauseDwellRadius');
        const DWELL_MS = this._cfg('pauseDwellTime');
        let i = 0;
        while (i < pts.length - 1) {
            let j = i + 1;
            while (j < pts.length &&
                   Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y) <= DWELL_RADIUS) {
                if ((pts[j].t - pts[i].t) >= DWELL_MS) return true;
                j++;
            }
            i = (j > i + 1) ? j - 1 : i + 1; // resume from where the cluster broke
        }
        return false;
    }
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
        
        if (inputs.length === 2) {
            const p1 = pts[0];
            const p2 = pts[1];
            const dx = Math.abs(p1.x - p2.x);
            const dy = Math.abs(p1.y - p2.y);
            
            if (dy > dx * 2.5) return 'Vertical';
            if (dx > dy * 2.5) return 'Horizontal';
            
            const rawDx = p1.x - p2.x;
            const rawDy = p1.y - p2.y;
            
            if ((rawDx * rawDy) > 0) return 'Diagonal SE';
            else return 'Diagonal SW';
        }
        
        const xs = pts.map(p => p.x); const ys = pts.map(p => p.y);
        const w = Math.max(...xs) - Math.min(...xs); const h = Math.max(...ys) - Math.min(...ys);
        if (h > w * 1.5) return 'Vertical'; 
        if (w > h * 1.5) return 'Horizontal';
        return 'Diagonal SE'; 
    }
}


