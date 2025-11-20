// --- LOGIC CORE ---
function addValue(val) {
    vibrate();
    const state = getCurrentState();
    const settings = getCurrentProfileSettings();
    
    let targetIdx = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : state.nextSequenceIndex % settings.machineCount;
    state.sequences[targetIdx].push(val);
    state.nextSequenceIndex++;
    renderSequences();
    
    // Autoplay Logic
    if(settings.isAutoplayEnabled) {
         if (settings.currentMode === MODES.SIMON && (state.nextSequenceIndex - 1) % settings.machineCount === settings.machineCount - 1) {
             setTimeout(handleCurrentDemo, 100);
         } else if (settings.currentMode === MODES.UNIQUE_ROUNDS && state.sequences[0].length === state.currentRound) {
             setTimeout(handleCurrentDemo, 100);
         }
    }
    saveState();
}

function handleBackspace() {
    vibrate(20);
    const state = getCurrentState();
    const settings = getCurrentProfileSettings();
    if(state.nextSequenceIndex === 0) return;
    
    let targetIdx = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : (state.nextSequenceIndex - 1) % settings.machineCount;
    state.sequences[targetIdx].pop();
    state.nextSequenceIndex--;
    renderSequences();
    saveState();
}

function handleCurrentDemo() {
    const settings = getCurrentProfileSettings();
    const state = getCurrentState();
    const isSimon = settings.currentMode === MODES.SIMON;
    
    const playlist = [];
    const activeSeqs = isSimon ? state.sequences.slice(0, settings.machineCount) : [state.sequences[0]];
    const len = Math.max(...activeSeqs.map(s => s.length));
    if(len === 0) return;

    // Build Playlist
    for(let i=0; i<len; i++) { // Simple sequential for demo
        activeSeqs.forEach((seq, mIdx) => {
            if(i < seq.length) playlist.push({ mIdx, val: seq[i] });
        });
    }

    // Disable inputs
    const padId = `pad-${settings.currentInput}`;
    document.querySelectorAll(`#${padId} button`).forEach(b => b.disabled = true);
    
    let idx = 0;
    const playNext = () => {
        if(idx >= playlist.length) {
            document.querySelectorAll(`#${padId} button`).forEach(b => b.disabled = false);
            if(!isSimon && settings.isUniqueRoundsAutoClearEnabled) {
                state.sequences[0] = []; state.nextSequenceIndex = 0; state.currentRound++;
                saveState(); renderSequences();
            }
            return;
        }
        const { mIdx, val } = playlist[idx];
        speak(settings.currentInput === 'piano' ? PIANO_SPEAK_MAP[val] || val : val);
        
        // Visual Flash
        const btn = document.querySelector(`#${padId} button[data-value="${val}"]`);
        if(btn) {
            btn.classList.add('bg-white', '!text-black'); // Generic flash
            setTimeout(() => btn.classList.remove('bg-white', '!text-black'), 200);
        }
        
        idx++;
        setTimeout(playNext, DEMO_DELAY_BASE_MS / appSettings.playbackSpeed);
    };
    playNext();
}

function speak(txt) {
    if(!getCurrentProfileSettings().isAudioEnabled || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(txt);
    u.rate = 1.2; 
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
}

// --- CAMERA & SENSOR LOGIC ---
async function openCameraModal() {
    toggleModal('camera-modal', true);
    const s = getCurrentProfileSettings();
    
    // Setup Grids
    const is12 = s.currentInput === INPUTS.KEY12;
    document.getElementById('grid-9key').style.display = is12 ? 'none' : 'grid';
    document.getElementById('grid-12key').style.display = is12 ? 'grid' : 'none';
    activeCalibrationGrid = document.getElementById(is12 ? 'grid-12key' : 'grid-9key');
    
    // Populate grid numbers if empty
    if(activeCalibrationGrid.children.length === 0) {
        for(let i=1; i<=(is12?12:9); i++) {
            const d = document.createElement('div'); d.className = 'calibration-box'; d.textContent = i;
            activeCalibrationGrid.appendChild(d);
        }
    }

    // Apply saved positions
    const cfg = is12 ? s.cameraGridConfig12 : s.cameraGridConfig9;
    Object.assign(activeCalibrationGrid.style, cfg);

    // Buttons
    document.getElementById('start-camera-btn').style.display = 'block';
    document.getElementById('start-detection-btn').style.display = 'none';
    document.getElementById('stop-detection-btn').style.display = 'none';

    // Drag Logic (simplified)
    makeDraggable(activeCalibrationGrid);
}

function makeDraggable(el) {
    let isDrag = false, startX, startY, startL, startT;
    el.onmousedown = el.ontouchstart = (e) => {
        isDrag = true;
        const evt = e.touches ? e.touches[0] : e;
        startX = evt.clientX; startY = evt.clientY;
        startL = el.offsetLeft; startT = el.offsetTop;
        e.preventDefault();
    };
    window.onmousemove = window.ontouchmove = (e) => {
        if(!isDrag) return;
        const evt = e.touches ? e.touches[0] : e;
        const p = el.parentElement.getBoundingClientRect();
        const l = ((startL + evt.clientX - startX) / p.width) * 100;
        const t = ((startT + evt.clientY - startY) / p.height) * 100;
        el.style.left = `${l}%`; el.style.top = `${t}%`;
    };
    window.onmouseup = window.ontouchend = () => {
        if(isDrag) {
            isDrag = false;
            const s = getCurrentProfileSettings();
            const cfg = { top: el.style.top, left: el.style.left, width: el.style.width, height: el.style.height };
            if(s.currentInput === INPUTS.KEY12) s.cameraGridConfig12 = cfg; else s.cameraGridConfig9 = cfg;
            saveState();
        }
    };
}

async function startCameraStream() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: {ideal:640} } });
        const feed = document.getElementById('camera-feed');
        feed.srcObject = cameraStream;
        document.getElementById('start-camera-btn').style.display = 'none';
        document.getElementById('start-detection-btn').style.display = 'block';
    } catch(e) { alert('Camera error: ' + e.message); }
}

function stopCameraStream() {
    if(cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
}

function startDetection() {
    if(isDetecting) return;
    isDetecting = true;
    document.getElementById('start-detection-btn').style.display = 'none';
    document.getElementById('stop-detection-btn').style.display = 'block';
    runDetectionLoop();
}

function stopDetection() {
    isDetecting = false;
    if(detectionLoopId) cancelAnimationFrame(detectionLoopId);
    document.getElementById('start-detection-btn').style.display = 'block';
    document.getElementById('stop-detection-btn').style.display = 'none';
}

function runDetectionLoop() {
    if(!isDetecting) return;
    const feed = document.getElementById('camera-feed');
    const cvs = document.getElementById('detection-canvas');
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    const grid = activeCalibrationGrid;
    
    if(feed.videoWidth === 0) { detectionLoopId = requestAnimationFrame(runDetectionLoop); return; }
    
    cvs.width = feed.videoWidth; cvs.height = feed.videoHeight;
    ctx.drawImage(feed, 0, 0);
    const imgData = ctx.getImageData(0,0,cvs.width,cvs.height);
    
    // Map grid coordinates to canvas
    const fRect = feed.getBoundingClientRect();
    const gRect = grid.getBoundingClientRect();
    const sx = cvs.width / fRect.width;
    const sy = cvs.height / fRect.height;
    
    const boxes = grid.children;
    const rows = (boxes.length === 12) ? 3 : 3;
    const cols = (boxes.length === 12) ? 4 : 3;
    const boxW = (gRect.width * sx) / cols;
    const boxH = (gRect.height * sy) / rows;
    const startX = (gRect.left - fRect.left) * sx;
    const startY = (gRect.top - fRect.top) * sy;

    const now = Date.now();
    const sensitivity = getCurrentProfileSettings().flashSensitivity;

    for(let i=0; i<boxes.length; i++) {
        const r = Math.floor(i/cols); const c = i%cols;
        const x = Math.floor(startX + c*boxW + boxW*0.25);
        const y = Math.floor(startY + r*boxH + boxH*0.25);
        
        // Simple brightness
        let bSum = 0;
        const idx = (y * cvs.width + x) * 4;
        if(idx < imgData.data.length) bSum = (imgData.data[idx]+imgData.data[idx+1]+imgData.data[idx+2])/3;

        const delta = bSum - lastBrightness[i];
        if(delta > sensitivity && (now - lastFlashTime[i] > FLASH_COOLDOWN_MS)) {
            lastFlashTime[i] = now;
            boxes[i].style.backgroundColor = 'rgba(0,255,0,0.5)';
            setTimeout(() => boxes[i].style.backgroundColor = '', 200);
            
            // ONLY ADD IF MASTER SWITCH IS ON
            if(isCameraMasterOn) addValue(String(i+1));
        }
        lastBrightness[i] = bSum;
    }

    detectionLoopId = requestAnimationFrame(runDetectionLoop);
}

// --- VOICE LOGIC ---
// Basic tone mapping simulated by text input for now (or Web Audio API later)
// Using the text inputs as "simulated voice" per your code structure
document.querySelectorAll('.voice-text-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
        if(!e.target.value) return;
        // ONLY PROCESS IF MASTER SWITCH IS ON
        if(isMicMasterOn) {
            // Simple mapping
            const val = e.target.value.toUpperCase();
            if(/[0-9A-G]/.test(val)) addValue(val);
        }
        e.target.value = '';
    });
});

// --- SHORTCUTS UI ---
function renderShortcutList() {
    const div = document.getElementById('shortcut-list-container');
    div.innerHTML = '';
    getCurrentProfileSettings().shortcuts.forEach((sc, i) => {
        const r = document.createElement('div');
        r.className = 'flex gap-2 mb-2';
        r.innerHTML = `<div class="flex-grow bg-gray-100 p-2 rounded text-black">${sc.trigger} -> ${sc.action}</div><button class="bg-red-500 text-white px-3 rounded" onclick="deleteShortcut(${i})">x</button>`;
        div.appendChild(r);
    });
}
window.deleteShortcut = (i) => { getCurrentProfileSettings().shortcuts.splice(i,1); saveState(); populateSettingsUI(); };
document.getElementById('add-shortcut-btn').onclick = () => {
    const trigger = prompt('Trigger (e.g. shake):', 'shake');
    const action = prompt('Action (e.g. play_demo):', 'play_demo');
    if(trigger && action) { getCurrentProfileSettings().shortcuts.push({id:Date.now(), trigger, action}); saveState(); populateSettingsUI(); }
};

// --- BOOT ---
window.onload = () => {
    loadState();
    initializeListeners();
    populateConfigDropdown();
    updateAllChrome();
    if(appSettings.showWelcomeScreen) toggleModal('game-setup-modal', true);
};

})();
// --- POPULATE UI ---
function populateConfigDropdown() {
    const sel = document.getElementById('config-select');
    if(!sel) return;
    sel.innerHTML = '';
    Object.keys(appSettings.profiles).forEach(pid => {
        sel.add(new Option(appSettings.profiles[pid].name, pid));
    });
    sel.value = appSettings.activeProfileId;
}

function populateSettingsUI() {
    const s = getCurrentProfileSettings();
    const activeId = appSettings.activeProfileId;
    
    if (!s || !appSettings.profiles[activeId]) return;

    const nameEl = document.getElementById('active-profile-name');
    if(nameEl) nameEl.textContent = appSettings.profiles[activeId].name;
    
    const setVal = (key, val, scope) => {
        const inputs = document.querySelectorAll(`[data-setting="${key}"]`);
        inputs.forEach(i => {
            if(scope && i.dataset.scope !== scope) return;
            if(i.type === 'checkbox') i.checked = val;
            else i.value = val;
            i.dispatchEvent(new Event('input')); 
        });
    };

    Object.keys(s).forEach(k => {
         let val = s[k];
         if(k === 'currentMode') val = (val === MODES.UNIQUE_ROUNDS);
         if (typeof val !== 'object') setVal(k, val);
    });

    setVal('playbackSpeed', appSettings.playbackSpeed, 'global');
    setVal('isDarkMode', appSettings.isDarkMode, 'global');
    setVal('showWelcomeScreen', appSettings.showWelcomeScreen, 'global');

    renderShortcutList();
}

// --- LOGIC CORE ---
function addValue(val) {
    vibrate();
    const state = getCurrentState();
    const settings = getCurrentProfileSettings();
    if(!state || !settings) return;

    let targetIdx = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : state.nextSequenceIndex % settings.machineCount;
    state.sequences[targetIdx].push(val);
    state.nextSequenceIndex++;
    renderSequences();
    
    // Autoplay Logic
    if(settings.isAutoplayEnabled) {
         if (settings.currentMode === MODES.SIMON && (state.nextSequenceIndex - 1) % settings.machineCount === settings.machineCount - 1) {
             setTimeout(handleCurrentDemo, 100);
         } else if (settings.currentMode === MODES.UNIQUE_ROUNDS && state.sequences[0].length === state.currentRound) {
             setTimeout(handleCurrentDemo, 100);
         }
    }
    saveState();
}

function handleBackspace() {
    vibrate(20);
    const state = getCurrentState();
    const settings = getCurrentProfileSettings();
    if(!state || state.nextSequenceIndex === 0) return;
    
    let targetIdx = (settings.currentMode === MODES.UNIQUE_ROUNDS) ? 0 : (state.nextSequenceIndex - 1) % settings.machineCount;
    state.sequences[targetIdx].pop();
    state.nextSequenceIndex--;
    renderSequences();
    saveState();
}

function handleCurrentDemo() {
    const settings = getCurrentProfileSettings();
    const state = getCurrentState();
    const isSimon = settings.currentMode === MODES.SIMON;
    
    const activeSeqs = isSimon ? state.sequences.slice(0, settings.machineCount) : [state.sequences[0]];
    const len = Math.max(...activeSeqs.map(s => s.length));
    if(len === 0) return;

    const playlist = [];
    for(let i=0; i<len; i++) { 
        activeSeqs.forEach((seq, mIdx) => {
            if(i < seq.length) playlist.push({ mIdx, val: seq[i] });
        });
    }

    const padId = `pad-${settings.currentInput}`;
    document.querySelectorAll(`#${padId} button`).forEach(b => b.disabled = true);
    
    let idx = 0;
    const playNext = () => {
        if(idx >= playlist.length) {
            document.querySelectorAll(`#${padId} button`).forEach(b => b.disabled = false);
            if(!isSimon && settings.isUniqueRoundsAutoClearEnabled) {
                state.sequences[0] = []; state.nextSequenceIndex = 0; state.currentRound++;
                saveState(); renderSequences();
            }
            return;
        }
        const { mIdx, val } = playlist[idx];
        speak(settings.currentInput === 'piano' ? PIANO_SPEAK_MAP[val] || val : val);
        
        const btn = document.querySelector(`#${padId} button[data-value="${val}"]`);
        if(btn) {
            btn.classList.add('bg-white', '!text-black'); 
            setTimeout(() => btn.classList.remove('bg-white', '!text-black'), 200);
        }
        idx++;
        setTimeout(playNext, DEMO_DELAY_BASE_MS / appSettings.playbackSpeed);
    };
    playNext();
}

function speak(txt) {
    if(!getCurrentProfileSettings()?.isAudioEnabled || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(txt);
    u.rate = 1.2; 
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
}

// --- CAMERA & SENSOR LOGIC ---
async function openCameraModal() {
    toggleModal('camera-modal', true);
    const s = getCurrentProfileSettings();
    
    const is12 = s.currentInput === INPUTS.KEY12;
    const grid9 = document.getElementById('grid-9key');
    const grid12 = document.getElementById('grid-12key');
    
    if(grid9) grid9.style.display = is12 ? 'none' : 'grid';
    if(grid12) grid12.style.display = is12 ? 'grid' : 'none';
    activeCalibrationGrid = is12 ? grid12 : grid9;
    
    if(activeCalibrationGrid && activeCalibrationGrid.children.length === 0) {
        for(let i=1; i<=(is12?12:9); i++) {
            const d = document.createElement('div'); d.className = 'calibration-box'; d.textContent = i;
            activeCalibrationGrid.appendChild(d);
        }
    }

    if(activeCalibrationGrid) {
        const cfg = is12 ? s.cameraGridConfig12 : s.cameraGridConfig9;
        Object.assign(activeCalibrationGrid.style, cfg);
        makeDraggable(activeCalibrationGrid);
    }

    document.getElementById('start-camera-btn').style.display = 'block';
    document.getElementById('start-detection-btn').style.display = 'none';
    document.getElementById('stop-detection-btn').style.display = 'none';
}

function makeDraggable(el) {
    let isDrag = false, startX, startY, startL, startT;
    el.onmousedown = el.ontouchstart = (e) => {
        isDrag = true;
        const evt = e.touches ? e.touches[0] : e;
        startX = evt.clientX; startY = evt.clientY;
        startL = el.offsetLeft; startT = el.offsetTop;
        e.preventDefault();
    };
    window.onmousemove = window.ontouchmove = (e) => {
        if(!isDrag) return;
        const evt = e.touches ? e.touches[0] : e;
        const p = el.parentElement.getBoundingClientRect();
        const l = ((startL + evt.clientX - startX) / p.width) * 100;
        const t = ((startT + evt.clientY - startY) / p.height) * 100;
        el.style.left = `${l}%`; el.style.top = `${t}%`;
    };
    window.onmouseup = window.ontouchend = () => {
        if(isDrag) {
            isDrag = false;
            const s = getCurrentProfileSettings();
            const cfg = { top: el.style.top, left: el.style.left, width: el.style.width, height: el.style.height };
            if(s.currentInput === INPUTS.KEY12) s.cameraGridConfig12 = cfg; else s.cameraGridConfig9 = cfg;
            saveState();
        }
    };
}

async function startCameraStream() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: {ideal:640} } });
        const feed = document.getElementById('camera-feed');
        feed.srcObject = cameraStream;
        document.getElementById('start-camera-btn').style.display = 'none';
        document.getElementById('start-detection-btn').style.display = 'block';
    } catch(e) { alert('Camera error: ' + e.message); }
}

function stopCameraStream() {
    if(cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
}

function startDetection() {
    if(isDetecting) return;
    isDetecting = true;
    document.getElementById('start-detection-btn').style.display = 'none';
    document.getElementById('stop-detection-btn').style.display = 'block';
    runDetectionLoop();
}

function stopDetection() {
    isDetecting = false;
    if(detectionLoopId) cancelAnimationFrame(detectionLoopId);
    document.getElementById('start-detection-btn').style.display = 'block';
    document.getElementById('stop-detection-btn').style.display = 'none';
}

function runDetectionLoop() {
    if(!isDetecting) return;
    const feed = document.getElementById('camera-feed');
    const cvs = document.getElementById('detection-canvas');
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    const grid = activeCalibrationGrid;
    
    if(feed.videoWidth === 0) { detectionLoopId = requestAnimationFrame(runDetectionLoop); return; }
    
    cvs.width = feed.videoWidth; cvs.height = feed.videoHeight;
    ctx.drawImage(feed, 0, 0);
    const imgData = ctx.getImageData(0,0,cvs.width,cvs.height);
    
    const fRect = feed.getBoundingClientRect();
    const gRect = grid.getBoundingClientRect();
    const sx = cvs.width / fRect.width;
    const sy = cvs.height / fRect.height;
    
    const boxes = grid.children;
    const cols = (boxes.length === 12) ? 4 : 3;
    const boxW = (gRect.width * sx) / cols;
    const boxH = (gRect.height * sy) / 3;
    const startX = (gRect.left - fRect.left) * sx;
    const startY = (gRect.top - fRect.top) * sy;

    const now = Date.now();
    const sensitivity = getCurrentProfileSettings().flashSensitivity;

    for(let i=0; i<boxes.length; i++) {
        const r = Math.floor(i/cols); const c = i%cols;
        const x = Math.floor(startX + c*boxW + boxW*0.25);
        const y = Math.floor(startY + r*boxH + boxH*0.25);
        
        let bSum = 0;
        const idx = (y * cvs.width + x) * 4;
        if(idx < imgData.data.length) bSum = (imgData.data[idx]+imgData.data[idx+1]+imgData.data[idx+2])/3;

        const delta = bSum - lastBrightness[i];
        if(delta > sensitivity && (now - lastFlashTime[i] > FLASH_COOLDOWN_MS)) {
            lastFlashTime[i] = now;
            boxes[i].style.backgroundColor = 'rgba(0,255,0,0.5)';
            setTimeout(() => boxes[i].style.backgroundColor = '', 200);
            
            if(isCameraMasterOn) addValue(String(i+1));
        }
        lastBrightness[i] = bSum;
    }

    detectionLoopId = requestAnimationFrame(runDetectionLoop);
}

// --- VOICE LOGIC ---
document.querySelectorAll('.voice-text-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
        if(!e.target.value) return;
        if(isMicMasterOn) {
            const val = e.target.value.toUpperCase();
            if(/[0-9A-G]/.test(val)) addValue(val);
        }
        e.target.value = '';
    });
});

// --- SHORTCUTS UI ---
function renderShortcutList() {
    const div = document.getElementById('shortcut-list-container');
    if(!div) return;
    div.innerHTML = '';
    const shortcuts = getCurrentProfileSettings()?.shortcuts || [];
    shortcuts.forEach((sc, i) => {
        const r = document.createElement('div');
        r.className = 'flex gap-2 mb-2';
        r.innerHTML = `<div class="flex-grow bg-gray-100 p-2 rounded text-black">${sc.trigger} -> ${sc.action}</div><button class="bg-red-500 text-white px-3 rounded" onclick="deleteShortcut(${i})">x</button>`;
        div.appendChild(r);
    });
}
window.deleteShortcut = (i) => { getCurrentProfileSettings().shortcuts.splice(i,1); saveState(); populateSettingsUI(); };
document.getElementById('add-shortcut-btn').onclick = () => {
    const trigger = prompt('Trigger (e.g. shake):', 'shake');
    const action = prompt('Action (e.g. play_demo):', 'play_demo');
    if(trigger && action) { getCurrentProfileSettings().shortcuts.push({id:Date.now(), trigger, action}); saveState(); populateSettingsUI(); }
};

// --- BOOT ---
window.onload = () => {
    loadState();
    initializeListeners();
    populateConfigDropdown();
    updateAllChrome();
    if(appSettings.showWelcomeScreen) toggleModal('game-setup-modal', true);
};

})();