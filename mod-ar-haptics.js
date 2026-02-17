// ==========================================
// mod-ar-haptics.js - Camera, Recording & Haptics
// ==========================================

window.geminiMods = window.geminiMods || {};

// 1. Inject AR Lab & Chord UI
function injectARAndHapticsUI() {
    // Inject AR controls into the placeholder from Module 3
    const arContainer = document.getElementById('ar-lab-container');
    if (arContainer) {
        arContainer.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="btn-ar-toggle" style="padding: 10px; flex: 2; background: #333; color: white; border: none; border-radius: 5px;">Start AR Mode</button>
                <button id="btn-camera-action" style="padding: 10px; flex: 1; background: #333; color: white; border: none; border-radius: 5px;" disabled>📸</button>
                <button id="btn-flip-camera" style="padding: 10px; flex: 1; background: #333; color: white; border: none; border-radius: 5px;" disabled>✋</button>
            </div>
            
            <div style="position: relative; width: 100%; background: #000; border-radius: 5px; overflow: hidden;">
                <video id="ar-hidden-video" autoplay playsinline style="display: none;"></video>
                <canvas id="ar-output-canvas" width="640" height="480" style="width: 100%; display: block;"></canvas>
                <div id="ar-gesture-monitor" style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: #0f0; padding: 5px 10px; border-radius: 5px; font-family: monospace;">Awaiting Input...</div>
            </div>

            <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                <label><input type="checkbox" id="toggle-skeleton" checked> 💀 Show Skeleton Overlay</label>
                <label><input type="checkbox" id="dev-chord-visuals" checked> Show Floating Chord Visuals</label>
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    Footer AR Opacity:
                    <input type="range" id="slider-footer-opacity" min="0.1" max="1.0" step="0.1" value="0.5" style="width: 60%;">
                </label>
            </div>
        `;
    }

    // Inject Floating Chord Visual Feedback into the body
    if (!document.getElementById('chord-visual-feedback')) {
        const chordUI = document.createElement('div');
        chordUI.id = 'chord-visual-feedback';
        chordUI.style.cssText = `
            position: fixed; top: 20%; left: 50%; transform: translateX(-50%) scale(0.9);
            background: rgba(0, 0, 0, 0.85); color: #00FF00; padding: 12px 24px; border-radius: 30px;
            display: flex; align-items: center; gap: 10px; font-family: monospace; font-size: 1.2rem;
            font-weight: bold; pointer-events: none; z-index: 9999; opacity: 0;
            transition: opacity 0.15s ease-out, transform 0.15s ease-out;
        `;
        chordUI.innerHTML = `<span style="font-size: 1.5rem;">✋</span> <span id="chord-name-display"></span>`;
        document.body.appendChild(chordUI);
    }
}

// 2. Enhanced Haptics API
window.geminiMods.triggerHaptic = function(gestureType) {
    if (window.geminiMods.ecoModeActive || !navigator.vibrate) return;

    if (gestureType.includes('tap')) {
        navigator.vibrate(10); // Sharp tick
    } else if (gestureType.includes('swipe') || gestureType.includes('flick')) {
        navigator.vibrate([10, 20, 30, 20, 50]); // Revving vibration
    } else if (gestureType.includes('chord')) {
        navigator.vibrate(50); // Heavy thud
    } else {
        navigator.vibrate(15); // Fallback
    }
};

// 3. Floating Chord Visuals
let chordFeedbackTimer = null;
window.geminiMods.showChordFeedback = function(chordName) {
    const showVisuals = document.getElementById('dev-chord-visuals')?.checked !== false;
    if (!showVisuals) return;

    const feedbackEl = document.getElementById('chord-visual-feedback');
    const textEl = document.getElementById('chord-name-display');
    if (!feedbackEl || !textEl) return;

    textEl.innerText = chordName.replace('chord_', '').replace(/_/g, ' + ').toUpperCase();
    
    feedbackEl.style.opacity = '1';
    feedbackEl.style.transform = 'translateX(-50%) scale(1)';
    window.geminiMods.triggerHaptic('chord');

    clearTimeout(chordFeedbackTimer);
    chordFeedbackTimer = setTimeout(() => {
        feedbackEl.style.opacity = '0';
        feedbackEl.style.transform = 'translateX(-50%) scale(0.9)';
    }, 800);
};

// 4. AR Camera & Media Recorder Logic
let stream = null;
let mediaRecorder = null;
let recordedChunks = [];
let useRearCamera = false;
let arAnimationLoop = null;

function toggleARCamera() {
    const btn = document.getElementById('btn-ar-toggle');
    const camBtn = document.getElementById('btn-camera-action');
    const flipBtn = document.getElementById('btn-flip-camera');

    if (window.geminiMods.arModeActive) {
        // Stop Camera
        if (stream) stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(arAnimationLoop);
        window.geminiMods.arModeActive = false;
        btn.innerText = "Start AR Mode";
        btn.style.background = "#333";
        camBtn.disabled = true;
        flipBtn.disabled = true;
        updateFooterOpacity(false);
    } else {
        // Start Camera
        startCameraStream();
        window.geminiMods.arModeActive = true;
        btn.innerText = "Stop AR Mode";
        btn.style.background = "#aa0000";
        camBtn.disabled = false;
        flipBtn.disabled = false;
        updateFooterOpacity(true);
    }
}

async function startCameraStream() {
    const videoEl = document.getElementById('ar-hidden-video');
    const canvasEl = document.getElementById('ar-output-canvas');
    const ctx = canvasEl.getContext('2d');
    const facingMode = useRearCamera ? "environment" : "user";

    if (stream) stream.getTracks().forEach(t => t.stop());

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode, height: { ideal: 720 }, frameRate: { ideal: 30 } },
            audio: true
        });
        videoEl.srcObject = stream;
        
        videoEl.onplay = () => {
            function drawLoop() {
                if (videoEl.paused || videoEl.ended) return;
                ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
                
                // If you have skeleton data from an AI engine, you draw it over the ctx here
                if (document.getElementById('toggle-skeleton').checked) {
                    // Example: drawSkeleton(window.currentHandLandmarks, ctx);
                }
                arAnimationLoop = requestAnimationFrame(drawLoop);
            }
            drawLoop();
        };
    } catch (err) {
        console.error("Camera error:", err);
        alert("Camera access denied or unavailable.");
    }
}

// 5. Button Bindings (Long Press to Delete 📸)
function bindARControls() {
    document.getElementById('btn-ar-toggle').addEventListener('click', toggleARCamera);

    const flipBtn = document.getElementById('btn-flip-camera');
    flipBtn.addEventListener('click', () => {
        useRearCamera = !useRearCamera;
        flipBtn.style.transform = useRearCamera ? 'rotate(180deg)' : 'rotate(0deg)';
        if (window.geminiMods.arModeActive) startCameraStream();
    });

    const camBtn = document.getElementById('btn-camera-action');
    let pressTimer;
    let isLongPress = false;

    camBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isLongPress = false;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            deleteRecording(camBtn);
        }, 800);
    });

    camBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(pressTimer);
        if (!isLongPress) toggleRecording(camBtn);
    });
    
    // Mouse fallback for desktop testing
    camBtn.addEventListener('mousedown', () => { isLongPress = false; pressTimer = setTimeout(() => { isLongPress = true; deleteRecording(camBtn); }, 800); });
    camBtn.addEventListener('mouseup', () => { clearTimeout(pressTimer); if (!isLongPress) toggleRecording(camBtn); });

    document.getElementById('slider-footer-opacity').addEventListener('input', () => {
        if (window.geminiMods.arModeActive) updateFooterOpacity(true);
    });
}

// Recording Logic
function toggleRecording(btn) {
    if (window.geminiMods.isRecording) {
        mediaRecorder.stop();
        window.geminiMods.isRecording = false;
        btn.innerText = "📸";
        btn.style.background = "#333";
    } else {
        const canvasStream = document.getElementById('ar-output-canvas').captureStream(30);
        if (stream.getAudioTracks().length > 0) canvasStream.addTrack(stream.getAudioTracks()[0]);

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            if (recordedChunks.length > 0) { // Only download if it wasn't deleted
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ar-session-${Date.now()}.webm`;
                a.click();
            }
        };
        mediaRecorder.start();
        window.geminiMods.isRecording = true;
        btn.innerText = "⏹";
        btn.style.background = "#aa0000";
    }
}

function deleteRecording(btn) {
    if (window.geminiMods.isRecording && mediaRecorder) {
        mediaRecorder.stop();
        recordedChunks = []; // Clear chunks so onstop doesn't download
        window.geminiMods.isRecording = false;
        btn.innerText = "📸";
        btn.style.background = "#333";
        window.geminiMods.triggerHaptic('chord'); // Heavy thud for deletion
        console.log("Recording trashed.");
    }
}

// Helper: Footer Transparency
function updateFooterOpacity(isARActive) {
    const footer = document.getElementById('input-footer') || document.querySelector('footer');
    if (!footer) return;
    
    if (isARActive) {
        const opacity = document.getElementById('slider-footer-opacity').value;
        footer.style.opacity = opacity;
    } else {
        footer.style.opacity = '1.0';
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    // Wait slightly to ensure Module 3 has injected the modal HTML
    setTimeout(() => {
        injectARAndHapticsUI();
        bindARControls();
    }, 200);
});
