// gesture-math.js

/**
 * Core Math Module for OmniGesture v114
 * Handles Path Analysis, Temporal Dynamics, and Curvature
 */

export const analyzeGesturePath = (points) => {
    if (points.length < 2) return null;

    const start = points[0];
    const end = points[points.length - 1];
    const duration = end.t - start.t; // Total time in ms

    // 1. Basic Vector Math
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const displacement = Math.sqrt(dx * dx + dy * dy);

    // 2. Temporal Logic: Velocity (px/ms)
    const velocity = displacement / duration;

    // 3. Path Complexity (Total Distance vs. Displacement)
    let totalDistance = 0;
    let maxDeviation = 0;
    
    // Calculate path length and find the furthest point from the straight-line chord
    for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        totalDistance += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        
        // Perpendicular distance from point i to the line [start -> end]
        const dev = getPerpendicularDistance(points[i], start, end);
        if (dev > maxDeviation) maxDeviation = dev;
    }

    // "Arc-ness" Index: 1.0 is a straight line, higher is more curved
    const complexity = totalDistance / displacement;

    // 4. Pause Detection (Looking for 'stagnant' segments)
    const pauseCount = detectPauses(points);

    // 5. Curvature Shape Detection
    const shape = detectShape(points, complexity, maxDeviation, dx, dy);

    return {
        type: velocity > 2.5 ? 'flick' : 'swipe',
        direction: getDirection(dx, dy),
        velocity: velocity.toFixed(2),
        complexity: complexity.toFixed(2),
        shape: shape,
        pauses: pauseCount,
        duration: duration,
        displacement: displacement.toFixed(0)
    };
};

/**
 * Calculates perpendicular distance of a point from a line
 */
function getPerpendicularDistance(p, lineStart, lineEnd) {
    const area = Math.abs((lineEnd.y - lineStart.y) * p.x - (lineEnd.x - lineStart.x) * p.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
    const bottom = Math.sqrt(Math.pow(lineEnd.y - lineStart.y, 2) + Math.pow(lineEnd.x - lineStart.x, 2));
    return area / bottom;
}

/**
 * Detects if the user held the gesture still during the path
 */
function detectPauses(points) {
    let pauses = 0;
    const speedThreshold = 0.1; // px per ms
    const timeThreshold = 100; // ms to qualify as a pause

    for (let i = 1; i < points.length; i++) {
        const dt = points[i].t - points[i - 1].t;
        const dist = Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) + Math.pow(points[i].y - points[i - 1].y, 2));
        if (dt > timeThreshold && (dist / dt) < speedThreshold) {
            pauses++;
        }
    }
    return pauses;
}

/**
 * Analyzes the path to distinguish C-curves from S-curves
 */
function detectShape(points, complexity, maxDev, dx, dy) {
    if (complexity < 1.15) return 'linear';

    // Split path into halves to check for inflection points (S-curve)
    const midIndex = Math.floor(points.length / 2);
    const firstHalf = points.slice(0, midIndex);
    const secondHalf = points.slice(midIndex);

    const firstSide = getSideOfLine(points[Math.floor(midIndex / 2)], points[0], points[points.length - 1]);
    const secondSide = getSideOfLine(points[midIndex + Math.floor(midIndex / 2)], points[0], points[points.length - 1]);

    // If they stayed on the same side of the chord, it's a C or U shape
    if (Math.sign(firstSide) === Math.sign(secondSide)) {
        return 'curve-c';
    } else {
        // If they crossed the line, it's an S-curve
        return 'curve-s';
    }
}

function getSideOfLine(p, lineStart, lineEnd) {
    return (lineEnd.x - lineStart.x) * (p.y - lineStart.y) - (lineEnd.y - lineStart.y) * (p.x - lineStart.x);
}

function getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'down' : 'up';
    }
}
Collapsible functions o
The inspector should run immediately and 
change the color of the file names.
The diagnostic hub should have a few
 tools along with a copy button for the 
text it generates. The fix button needs 
to make a comeback since the time machine is here.
This recognizes js. It should probably
 understand HTML css Json and other programming langues. It 
should be able to work with files in subfolder like this as well
[Missing File] vision.js imports from missing file wasm/vision_bundle.js.
I'm sure you can also come up with a few more improvements
This should be able to restructure code perfectly by function into hundreds of 
Little piece'sv or one giant block. 
