// camera.js
import { DOM } from './dom.js';
import { getCurrentProfileSettings, saveState } from './state.js';
import { addValue } from './game.js'; 
import { FLASH_COOLDOWN_MS, INPUTS } from './config.js';
import { showModal, closeModal } from './ui.js';

export const cameraState = {
    stream: null,
    isDetecting: false,
    detectionLoopId: null,
    lastFlashTime: Array(12).fill(0),
    lastBrightness: Array(12).fill(0),
    isDraggingGrid: false,
    isCameraMasterOn: false,
    activeCalibrationGrid: null
};

export async function startCameraStream() {
    if (cameraState.stream) {
        stopCameraStream(); 
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
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
    cameraState.lastBrightness.fill(0); 
    cameraState.lastFlashTime.fill(0); 
    
    if (DOM.startDetectionBtn) DOM.startDetectionBtn.style.display = 'none';
    if (DOM.stopDetectionBtn) DOM.stopDetectionBtn.style.display = 'block';

    const ctx = DOM.detectionCanvas.getContext('2d', { willReadFrequently: true });
    DOM.detectionCanvas.width = DOM.cameraFeed.videoWidth;
    DOM.detectionCanvas.height = DOM.cameraFeed.videoHeight;

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

function getAverageBrightness(imageData, x, y, width, height) {
    let sum = 0;
    let count = 0;
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(imageData.width, Math.ceil(x + width));
    const endY = Math.min(imageData.height, Math.ceil(y + height));

    for (let row = startY; row < endY; row++) {
        for (let col = startX; col < endX; col++) {
            const index = (row * imageData.width + col) * 4;
            sum += (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            count++;
        }
    }
    return (count > 0) ? (sum / count) : 0;
}

function runDetectionLoop(ctx) {
    if (!cameraState.isDetecting || !cameraState.stream || !cameraState.activeCalibrationGrid) {
        cameraState.isDetecting = false;
        return;
    }

    ctx.drawImage(DOM.cameraFeed, 0, 0, DOM.detectionCanvas.width, DOM.detectionCanvas.height);
    let imageData;
    try {
        imageData = ctx.getImageData(0, 0, DOM.detectionCanvas.width, DOM.detectionCanvas.height);
    } catch (e) {
        console.error("Could not get image data:", e);
        requestAnimationFrame(() => runDetectionLoop(ctx)); 
        return;
    }
    
    const feedRect = DOM.cameraFeed.getBoundingClientRect();
    const gridRect = cameraState.activeCalibrationGrid.getBoundingClientRect();
    
    const scaleX = DOM.detectionCanvas.width / feedRect.width;
    const scaleY = DOM.detectionCanvas.height / feedRect.height;
    const gridPixelX = (gridRect.left - feedRect.left) * scaleX;
    const gridPixelY = (gridRect.top - feedRect.top) * scaleY;
    const gridPixelWidth = gridRect.width * scaleX;
    const gridPixelHeight = gridRect.height * scaleY;
    
    const profileSettings = getCurrentProfileSettings();
    const is12Key = (profileSettings.currentInput === INPUTS.KEY12);
    const numCols = is12Key ? 4 : 3;
    const numRows = is12Key ? 3 : 3;
    const numBoxes = numCols * numRows;
    const boxPixelWidth = gridPixelWidth / numCols;
    const boxPixelHeight = gridPixelHeight / numRows;
    
    const now = Date.now();
    const sensitivity = profileSettings.flashSensitivity;

    for (let i = 0; i < numBoxes; i++) {
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        const boxX = gridPixelX + (col * boxPixelWidth);
        const boxY = gridPixelY + (row * boxPixelHeight);
        
        const currentBrightness = getAverageBrightness(imageData, boxX, boxY, boxPixelWidth, boxPixelHeight);
        const delta = currentBrightness - cameraState.lastBrightness[i];
        
        if (delta > sensitivity && (now - cameraState.lastFlashTime[i] > FLASH_COOLDOWN_MS)) {
            const value = String(i + 1);
            if (cameraState.isCameraMasterOn) {
                console.log(`Flash ${value} DETECTED & ADDED!`);
                addValue(value);
            }
            cameraState.lastFlashTime[i] = now;
            const boxEl = cameraState.activeCalibrationGrid.children[i];
            if (boxEl) {
                boxEl.classList.add('flash-detected');
                setTimeout(() => boxEl.classList.remove('flash-detected'), 150);
            }
        }
        cameraState.lastBrightness[i] = currentBrightness;
    }
    
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
    
    cameraState.activeCalibrationGrid.style.top = config.top;
    cameraState.activeCalibrationGrid.style.left = config.left;
    cameraState.activeCalibrationGrid.style.width = config.width;
    cameraState.activeCalibrationGrid.style.height = config.height;
    
    saveState();
}
