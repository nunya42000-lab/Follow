// ==========================================
// mod-engine-interceptor.js - Temporal Math & Filtering
// ==========================================

window.geminiMods = window.geminiMods || {};

// 1. The Fuzzy Snapping Dictionary
// If the engine sees a raw gesture that isn't on the whitelist, it tries these alternatives in order.
const fuzzySnapDict = {
    'swipe_ne': ['swipe_up', 'swipe_right'],
    'swipe_nw': ['swipe_up', 'swipe_left'],
    'swipe_se': ['swipe_down', 'swipe_right'],
    'swipe_sw': ['swipe_down', 'swipe_left'],
    'flick_ne': ['flick_up', 'flick_right'],
    'flick_nw': ['flick_up', 'flick_left'],
    'flick_se': ['flick_down', 'flick_right'],
    'flick_sw': ['flick_down', 'flick_left'],
    'switchback_up_cw': ['swipe_up', 'swipe_ne'],
    'boomerang_up': ['swipe_up'],
    'boomerang_down': ['swipe_down'],
    'boomerang_left': ['swipe_left'],
    'boomerang_right': ['swipe_right']
};

// 2. Stroke Tracking State
let activeStroke = null;

// 3. Touch Event Listeners (Passive Observers)
document.addEventListener('touchstart', (e) => {
    // Only track single-finger strokes for this basic interceptor 
    // (Multi-finger math follows the same logic but iterates over e.touches)
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        activeStroke = {
            startX: touch.clientX,
            startY: touch.clientY,
            startTime: Date.now(),
            path: [{ x: touch.clientX, y: touch.clientY, time: Date.now() }],
            isPaused: false,
            pauseStartTime: 0
        };
    }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!activeStroke || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const currentTime = Date.now();
    const lastPoint = activeStroke.path[activeStroke.path.length - 1];
    
    // Calculate distance moved to detect Pausing
    const distanceMoved = Math.hypot(touch.clientX - lastPoint.x, touch.clientY - lastPoint.y);
    
    if (distanceMoved < 5 && (currentTime - lastPoint.time) > 100) {
        if (!activeStroke.isPaused) {
            activeStroke.isPaused = true;
            activeStroke.pauseStartTime = currentTime;
        }
    } else if (distanceMoved >= 5) {
        activeStroke.isPaused = false;
    }

    activeStroke.path.push({ x: touch.clientX, y: touch.clientY, time: currentTime });
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!activeStroke || e.changedTouches.length !== 1) return;
    
    const touch = e.changedTouches[0];
    const finalX = touch.clientX;
    const finalY = touch.clientY;
    
    // Analyze the completed stroke
    const rawGesture = analyzeStroke(finalX, finalY);
    
    // Run it through the Whitelist and Snapper
    const finalGesture = applyConstraintFilter(rawGesture);
    
    if (finalGesture) {
        // Output to the Debugger UI we built in Module 3
        const debugLog = document.getElementById('touch-debug-log');
        if (debugLog) {
            debugLog.innerText = `Detected: ${finalGesture}\nRaw Math: ${rawGesture}`;
            // Add a quick flash effect
            debugLog.style.background = "#003300";
            setTimeout(() => debugLog.style.background = "#000", 200);
        }

        // TODO: This is where you will eventually link it to your game's input handler
        // Example: if (typeof myGameEngine.fireAction === 'function') myGameEngine.fireAction(finalGesture);
    }
    
    activeStroke = null; // Reset
});

// 4. The Math Engine
function analyzeStroke(finalX, finalY) {
    const totalTime = Date.now() - activeStroke.startTime;
    const totalDistance = Math.hypot(finalX - activeStroke.startX, finalY - activeStroke.startY);
    
    // If it barely moved, it's a tap
    if (totalDistance < 15) {
        if (totalTime > 500) return 'long_tap';
        return 'tap';
    }

    // Check for Curves first
    const curveShape = detectCurves();
    if (curveShape) return curveShape;

    // Calculate Cardinal/Diagonal Direction
    const direction = getDirection(activeStroke.startX, activeStroke.startY, finalX, finalY);
    
    // Calculate Velocity for Flicks
    const velocity = totalDistance / totalTime;
    let baseGesture = velocity > 1.5 ? `flick_${direction}` : `swipe_${direction}`;

    // Check for Pausing Swipes
    if (activeStroke.isPaused) {
        const pauseDuration = Date.now() - activeStroke.pauseStartTime;
        if (pauseDuration > 300) {
            baseGesture = velocity > 1.5 ? `pausing_flick_${direction}` : `pausing_swipe_${direction}`;
        }
    }

    return baseGesture;
}

function detectCurves() {
    if (activeStroke.path.length < 10) return null; // Too short to be a curve

    let angleChanges = [];
    let previousAngle = null;
    
    for (let i = 5; i < activeStroke.path.length; i += 5) {
        const p1 = activeStroke.path[i - 5];
        const p2 = activeStroke.path[i];
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        
        if (previousAngle !== null) {
            let delta = angle - previousAngle;
            if (delta > Math.PI) delta -= 2 * Math.PI;
            if (delta < -Math.PI) delta += 2 * Math.PI;
            angleChanges.push(delta);
        }
        previousAngle = angle;
    }
    
    let posTurns = 0, negTurns = 0;
    angleChanges.forEach(delta => {
        if (delta > 0.2) posTurns++;
        if (delta < -0.2) negTurns++;
    });
    
    // Basic S-Shape / Switchback logic
    if (posTurns > 2 && negTurns > 2) return "switchback_any";
    if (posTurns > 4 && negTurns === 0) return "u_shape_cw";
    if (negTurns > 4 && posTurns === 0) return "u_shape_ccw";
    
    return null;
}

function getDirection(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy * 2) return dx > 0 ? 'right' : 'left';
    if (absDy > absDx * 2) return dy > 0 ? 'down' : 'up';
    
    if (dx > 0 && dy > 0) return 'se';
    if (dx > 0 && dy < 0) return 'ne';
    if (dx < 0 && dy > 0) return 'sw';
    return 'nw';
}

// 5. The Constraint Filter & Snapper
function applyConstraintFilter(rawGesture) {
    // Make sure we have a whitelist (fallback to empty array if not initialized)
    const whitelist = window.geminiMods.activeWhitelist || [];
    
    // Direct match
    if (whitelist.includes(rawGesture)) {
        return rawGesture;
    }

    // Fuzzy Snapping
    const fallbacks = fuzzySnapDict[rawGesture];
    if (fallbacks) {
        for (let fallback of fallbacks) {
            if (whitelist.includes(fallback)) {
                console.log(`Fuzzy Snap applied: ${rawGesture} -> ${fallback}`);
                return fallback;
            }
        }
    }

    // Ignore unrecognized or toggled-off gestures
    return null; 
}
