// gesture-engine-setup.js
import { analyzeGesturePath } from './gesture-math.js';
import { showToast } from './ui-core.js';

/**
 * OmniGesture v114 Setup
 * Captures raw touch streams and routes them to the math analyzer
 */

export function initGestureEngine() {
    let activePoints = [];
    let isTracking = false;

    // We attach listeners to the document to allow global gestures
    document.addEventListener('touchstart', (e) => {
        // Ignore multi-touch for basic gesture analysis
        if (e.touches.length > 1) return;

        isTracking = true;
        activePoints = [];
        addPoint(e.touches[0]);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isTracking) return;
        addPoint(e.touches[0]);
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!isTracking) return;
        isTracking = false;

        // Run the math analysis
        const results = analyzeGesturePath(activePoints);
        
        if (results) {
            processGestureResults(results);
        }
    }, { passive: true });

    /**
     * Helper to push formatted points into the stream
     */
    function addPoint(touch) {
        activePoints.push({
            x: touch.clientX,
            y: touch.clientY,
            t: Date.now()
        });

        // Update Developer Tab indicator if visible
        const countDisplay = document.getElementById('active-touch-count');
        if (countDisplay) countDisplay.textContent = activePoints.length;
    }

    /**
     * Routes the calculated results to the UI and Logic
     */
    function processGestureResults(res) {
        // 1. Log to developer console for tuning
        console.log(`[OmniGesture] ${res.type.toUpperCase()} | Shape: ${res.shape} | Pauses: ${res.pauses} | Vel: ${res.velocity}`);

        // 2. Visual Feedback
        let feedbackIcon = "👆";
        if (res.type === 'flick') feedbackIcon = "⚡";
        if (res.shape === 'curve-s') feedbackIcon = "〰️";
        if (res.shape === 'curve-c') feedbackIcon = "↩️";
        if (res.pauses > 0) feedbackIcon = "⏸️";

        // 3. Example Logic: Using these new types
        if (res.type === 'flick' && res.direction === 'up') {
            showToast(`${feedbackIcon} Fast Flick Up`);
        } else if (res.shape === 'curve-s') {
            showToast(`${feedbackIcon} S-Curve Detected`);
        } else if (res.pauses > 0) {
            showToast(`${feedbackIcon} Paused Gesture`);
        } else {
            // Default swipe reporting
            showToast(`${feedbackIcon} ${res.direction} ${res.type}`);
        }
        
        // Update Developer Monitor
        const logContainer = document.getElementById('dev-log-container');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = "text-blue-400 border-l border-blue-900 pl-2 my-1";
            entry.innerHTML = `<span class="text-gray-500">[${new Date().toLocaleTimeString()}]</span> 
                               <strong>${res.shape} ${res.type}</strong> (${res.velocity}px/ms)`;
            logContainer.prepend(entry);
        }
    }
}
