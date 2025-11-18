import { DOM } from './dom.js';
import { getCurrentProfileSettings, saveState } from './state.js';
import { addValue } from './game.js'; 
import { INPUTS } from './config.js';
import { showModal, closeModal } from './ui.js';

export const cameraState = {
    stream: null,
    isDetecting: false,
    detectionLoopId: null,
    baselineData: new Array(16).fill(0),
    lastHitTime: 0, 
    isDraggingGrid: false,
    isCameraMasterOn: false,
    activeCalibrationGrid: null,
    isFirstFrame: true 
};

const DEBOUNCE_MS = 300; 
const DRIFT_RATE = 0.2;

export async function startCameraStream() {
    if (cameraState.stream) stopCameraStream(); 
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment', 
                width: { ideal: 320 },
                height: { ideal: 240 } 
            }
        });
        
        cameraState.stream = stream;
        if (DOM.cameraFeed) {
            DOM.cameraFeed.srcObject = stream;
            DOM.cameraFeed.onloadedmetadata = () => {
                if (DOM.detectionCanvas) {
                    DOM.detectionCanvas.width = DOM.cameraFeed.videoWidth;
                    DOM.detectionCanvas.height = DOM.cameraFeed.videoHeight;
                }
            };
            DOM.cameraFeed.play();
        }
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
    if (DOM.startCameraBtn) DOM.startCameraBtn.style.display = 'block';
    if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'none';
    if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'none';
}

export function startDetection() {
    if (cameraState.isDetecting || !cameraState.stream || !DOM.detectionCanvas) return;
    
    cameraState.isDetecting = true;
    cameraState.baselineData.fill(0); 
    cameraState.lastHitTime = 0;
    cameraState.isFirstFrame = true; // Prevent flashbang
    
    if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'none';
    if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'block';

    const ctx = DOM.detectionCanvas.getContext('2d', { willReadFrequently: true });
    cameraState.detectionLoopId = requestAnimationFrame(() => runDetectionLoop(ctx));
}

export function stopDetection() {
    cameraState.isDetecting = false;
    if (cameraState.detectionLoopId) {
        cancelAnimationFrame(cameraState.detectionLoopId);
        cameraState.detectionLoopId = null;
    }
    if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'block';
    if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'none';
    
    if (cameraState.activeCalibrationGrid) {
        for (let i = 0; i < cameraState.activeCalibrationGrid.children.length; i++) {
            cameraState.activeCalibrationGrid.children[i].classList.remove('flash-detected');
        }
    }
}

function runDetectionLoop(ctx) {
    if (!cameraState.isDetecting || !cameraState.stream || !cameraState.activeCalibrationGrid) {
        cameraState.isDetecting = false;
        return;
    }

    const width = DOM.detectionCanvas.width;
    const height = DOM.detectionCanvas.height;

    // Fix: Zero-size crash check
    if (width === 0 || height === 0) {
        requestAnimationFrame(() => runDetectionLoop(ctx));
        return;
    }

    ctx.drawImage(DOM.cameraFeed, 0, 0, width, height);
    
    let frame;
    try {
        frame = ctx.getImageData(0, 0, width, height);
    } catch (e) {
        requestAnimationFrame(() => runDetectionLoop(ctx)); 
        return;
    }
    const data = frame.data;
    const videoRect = DOM.cameraFeed.getBoundingClientRect();
    const boxes = cameraState.activeCalibrationGrid.children;
    const scaleX = width / videoRect.width;
    const scaleY = height / videoRect.height;

    // Fix: Sensitivity Inversion
    // Slider 100 (High Sens) -> Low Threshold (e.g., 15)
    // Slider 10 (Low Sens) -> High Threshold (e.g., 105)
    const profileSettings = getCurrentProfileSettings();
    const sliderVal = profileSettings ? profileSettings.flashSensitivity : 50;
    const threshold = Math.max(10, 110 - sliderVal); 

    const now = Date.now();

    for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const rect = box.getBoundingClientRect();
        const centerX = (rect.left + rect.width / 2) - videoRect.left;
        const centerY = (rect.top + rect.height / 2) - videoRect.top;
        const x = Math.floor(centerX * scaleX);
        const y = Math.floor(centerY * scaleY);

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const pixelIndex = (y * width + x) * 4;
        const currentBrightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;

        // Fix: Flashbang prevention
        if (cameraState.isFirstFrame) {
            cameraState.baselineData[i] = currentBrightness;
            continue;
        }

        const diff = Math.abs(currentBrightness - cameraState.baselineData[i]);

        if (diff > threshold) {
            if (now - cameraState.lastHitTime > DEBOUNCE_MS) {
                const value = String(i + 1);
                console.log(`Hit on box ${value} (Diff: ${diff.toFixed(1)})`);
                box.classList.add('flash-detected');
                setTimeout(() => box.classList.remove('flash-detected'), 150);
                if (cameraState.isCameraMasterOn) {
                    addValue(value);
                }
                cameraState.lastHitTime = now;
            }
        } else {
            box.classList.remove('flash-detected');
        }
        cameraState.baselineData[i] = (cameraState.baselineData[i] * (1 - DRIFT_RATE)) + (currentBrightness * DRIFT_RATE);
    }
    
    cameraState.isFirstFrame = false;

    if (cameraState.isDetecting) {
        cameraState.detectionLoopId = requestAnimationFrame(() => runDetectionLoop(ctx));
    }
}

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
    saveState();
}
