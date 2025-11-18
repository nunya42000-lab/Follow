import { DOM } from './dom.js';
import { getCurrentProfileSettings, saveState } from './state.js';
import { addValue } from './game.js'; 
import { INPUTS } from './config.js';
import { showModal, closeModal } from './ui.js';

// --- STATE ---
export const cameraState = {
    stream: null,
    isDetecting: false,
    detectionLoopId: null,
    // We use an array of 16 to cover both 9-key and 12-key safely
    baselineData: new Array(16).fill(0),
    lastHitTime: 0, 
    isDraggingGrid: false,
    isCameraMasterOn: false,
    activeCalibrationGrid: null
};

// --- CONSTANTS FROM SNIPPET ---
const DEBOUNCE_MS = 300; // Prevent double-hits
const DRIFT_RATE = 0.2;  // How fast the baseline adapts (20% new, 80% old)

// --- CAMERA HARDWARE ---
export async function startCameraStream() {
    if (cameraState.stream) {
        stopCameraStream(); 
    }
    try {
        // Request environment (back) camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment', 
                width: { ideal: 320 }, // Lower res is faster for processing
                height: { ideal: 240 } 
            }
        });
        
        cameraState.stream = stream;
        
        if (DOM.cameraFeed) {
            DOM.cameraFeed.srcObject = stream;
            
            // Wait for metadata to set canvas dimensions
            DOM.cameraFeed.onloadedmetadata = () => {
                if (DOM.detectionCanvas) {
                    // Match canvas to video resolution for 1:1 pixel mapping
                    DOM.detectionCanvas.width = DOM.cameraFeed.videoWidth;
                    DOM.detectionCanvas.height = DOM.cameraFeed.videoHeight;
                }
            };
            DOM.cameraFeed.play();
        }

        // UI Button States
        if (DOM.startCameraBtn) DOM.startCameraBtn.style.display = 'none';
        if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'block';
        if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'none';
        
    } catch (err) {
        console.error("Error accessing camera:", err);
        showModal("Camera Error", `Could not access camera: ${err.message}`, () => closeModal(), "OK", "");
    }
}

export function stopCameraStream() {
    stopDetection(); 
    if (cameraState.stream) {
        cameraState.stream.getTracks().forEach(track => track.stop());
        cameraState.stream = null;
    }
    if (DOM.cameraFeed) {
        DOM.cameraFeed.srcObject = null;
    }
    // UI Button States
    if (DOM.startCameraBtn) DOM.startCameraBtn.style.display = 'block';
    if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'none';
    if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'none';
}

// --- DETECTION ENGINE (UPDATED LOGIC) ---
export function startDetection() {
    if (cameraState.isDetecting || !cameraState.stream || !DOM.detectionCanvas) return;
    
    cameraState.isDetecting = true;
    // Reset baseline and timer
    cameraState.baselineData.fill(0); 
    cameraState.lastHitTime = 0;
    
    // UI Button States
    if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'none';
    if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'block';

    // Get context once
    const ctx = DOM.detectionCanvas.getContext('2d', { willReadFrequently: true });
    
    // Start Loop
    cameraState.detectionLoopId = requestAnimationFrame(() => runDetectionLoop(ctx));
}

export function stopDetection() {
    cameraState.isDetecting = false;
    if (cameraState.detectionLoopId) {
        cancelAnimationFrame(cameraState.detectionLoopId);
        cameraState.detectionLoopId = null;
    }
    // UI Button States
    if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'block';
    if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'none';
    
    // Clean up visuals
    if (cameraState.activeCalibrationGrid) {
        for (let i = 0; i < cameraState.activeCalibrationGrid.children.length; i++) {
            cameraState.activeCalibrationGrid.children[i].classList.remove('flash-detected');
        }
    }
}

// The Core Logic from your HTML snippet, adapted for the App structure
function runDetectionLoop(ctx) {
    if (!cameraState.isDetecting || !cameraState.stream || !cameraState.activeCalibrationGrid) {
        cameraState.isDetecting = false;
        return;
    }

    // 1. Draw Video to Canvas
    const width = DOM.detectionCanvas.width;
    const height = DOM.detectionCanvas.height;
    ctx.drawImage(DOM.cameraFeed, 0, 0, width, height);
    
    // 2. Get Pixel Data
    let frame;
    try {
        frame = ctx.getImageData(0, 0, width, height);
    } catch (e) {
        // Sometimes happens if video isn't ready
        requestAnimationFrame(() => runDetectionLoop(ctx)); 
        return;
    }
    const data = frame.data;

    // 3. Get Geometry
    const videoRect = DOM.cameraFeed.getBoundingClientRect();
    const boxes = cameraState.activeCalibrationGrid.children;
    
    // Scaling factors (Canvas Resolution vs Display Size)
    const scaleX = width / videoRect.width;
    const scaleY = height / videoRect.height;

    // 4. Get Sensitivity from Slider
    const profileSettings = getCurrentProfileSettings();
    const sensitivity = profileSettings ? profileSettings.flashSensitivity : 40;

    const now = Date.now();

    // 5. Check Each Box
    for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const rect = box.getBoundingClientRect();

        // Calculate Center Point relative to the Video Element
        // (rect.left - videoRect.left) gives us the X position inside the video player
        const centerX = (rect.left + rect.width / 2) - videoRect.left;
        const centerY = (rect.top + rect.height / 2) - videoRect.top;

        // Map to Canvas Coordinates
        const x = Math.floor(centerX * scaleX);
        const y = Math.floor(centerY * scaleY);

        // Boundary Check
        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        // Get RGB Index
        const pixelIndex = (y * width + x) * 4;
        
        // Calculate Brightness (Simple Average of R+G+B)
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const currentBrightness = (r + g + b) / 3;

        // --- THE "BETTER IDEA" LOGIC ---
        
        // A. Calculate Difference
        const diff = Math.abs(currentBrightness - cameraState.baselineData[i]);

        // B. Check Threshold
        if (diff > sensitivity) {
            // Check Debounce (Global debounce for all keys to prevent chaotic triggering)
            if (now - cameraState.lastHitTime > DEBOUNCE_MS) {
                
                // Trigger!
                const value = String(i + 1);
                console.log(`Hit on box ${value} (Diff: ${diff.toFixed(1)})`);

                // 1. Visual Feedback
                box.classList.add('flash-detected');
                setTimeout(() => box.classList.remove('flash-detected'), 150);

                // 2. Send to Game Engine (Only if Master Switch is ON)
                if (cameraState.isCameraMasterOn) {
                    addValue(value);
                }
                
                cameraState.lastHitTime = now;
            }
        } else {
            // If not active, ensure visual class is removed
            box.classList.remove('flash-detected');
        }

        // C. Drift Baseline (Adaptive Lighting)
        // New Baseline = (Old * 0.8) + (Current * 0.2)
        cameraState.baselineData[i] = (cameraState.baselineData[i] * (1 - DRIFT_RATE)) + (currentBrightness * DRIFT_RATE);
    }
    
    // Loop
    if (cameraState.isDetecting) {
        cameraState.detectionLoopId = requestAnimationFrame(() => runDetectionLoop(ctx));
    }
}

// --- GRID CONFIG (Unchanged) ---
export function saveGridConfig() {
    if (!cameraState.activeCalibrationGrid || !DOM.cameraFeedContainer) return;
    const profileSettings = getCurrentProfileSettings();
    if (!profileSettings) return;

    const containerRect = DOM.cameraFeedContainer.getBoundingClientRect();
    const gridRect = cameraState.activeCalibrationGrid.getBoundingClientRect();

    const config = {
        top: `${((gridRect.top - containerRect.top) / containerRect.height) * 100}%`,
        left: `${((gridRect.left - containerRect.left) / containerRect.width) * 100}%`,
        width: `${(gridRect.width / containerRect.width) * 100}%`,
        height: `${(gridRect.height / containerRect.height) * 100}%`
    };
    
    if (profileSettings.currentInput === INPUTS.KEY12) {
        profileSettings.cameraGridConfig12 = config;
    } else {
        profileSettings.cameraGridConfig9 = config;
    }
    
    cameraState.activeCalibrationGrid.style.top = config.top;
    cameraState.activeCalibrationGrid.style.left = config.left;
    cameraState.activeCalibrationGrid.style.width = config.width;
    cameraState.activeCalibrationGrid.style.height = config.height;
    
    saveState();
}
