import { CONFIG } from './constants.js';
import { vibrate, showToast, applyTheme } from './utils.js';
import { startPracticeRound, playPracticeSequence, practiceSequence, setPracticeInputIndex } from './core.js';

// --- DEPENDENCIES INJECTED FROM APP.JS ---
let getAppSettings, getState, getProfileSettings, saveState, getModules, getVoiceModule, getBlackoutState, getGesturePadVisible;

export function initUI(deps) {
    getAppSettings = deps.getAppSettings;
    getState = deps.getState;
    getProfileSettings = deps.getProfileSettings;
    saveState = deps.saveState;
    getModules = deps.getModules;
    getVoiceModule = deps.getVoiceModule;
    getBlackoutState = deps.getBlackoutState;
    getGesturePadVisible = deps.getGesturePadVisible;
}

/**
 * Visually blinks a key on the active pad.
 * Useful for demo playback feedback.
 */
export function flashKey(value) {
    const settings = getProfileSettings();
    const btn = document.querySelector(`#pad-${settings.currentInput} button[data-value="${value}"]`);
    if(btn) {
        btn.classList.add('flash-active');
        const speed = getAppSettings().playbackSpeed || 1.0;
        setTimeout(() => btn.classList.remove('flash-active'), 250 / speed);
    }
}

export function updateAllChrome() { 
    const appSettings = getAppSettings();
    applyTheme(appSettings.activeTheme, appSettings); 
    document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`; 
    renderUI(); 
}

export function disableInput(disabled) {
    const footer = document.getElementById('input-footer');
    if(!footer) return;
    if(disabled) { 
        footer.classList.add('opacity-50', 'pointer-events-none'); 
    } else { 
        footer.classList.remove('opacity-50', 'pointer-events-none'); 
    }
}

export function renderUI() {
    const container = document.getElementById('sequence-container'); 
    if (!container) return;

    const appSettings = getAppSettings();
    const settings = getProfileSettings();
    const state = getState();
    const modules = getModules();
    const voiceModule = getVoiceModule();
    const blackoutState = getBlackoutState();
    const isGesturePadVisible = getGesturePadVisible();

    // --- 1. GESTURE PAD VISIBILITY ---
    const gpWrap = document.getElementById('gesture-pad-wrapper');
    const pad = document.getElementById('gesture-pad');
    if (gpWrap) {
        const isGlobalGestureOn = appSettings.isGestureInputEnabled; 
        const isBossGestureOn = appSettings.isBlackoutFeatureEnabled && appSettings.isBlackoutGesturesEnabled && blackoutState.isActive;

        if ((isGlobalGestureOn && isGesturePadVisible) || isBossGestureOn) {
            document.body.classList.add('input-gestures-mode');
            gpWrap.classList.remove('hidden');
            if (isBossGestureOn) {
                gpWrap.style.zIndex = '10001'; 
                if(pad) { pad.style.opacity = '0.05'; pad.style.borderColor = 'transparent'; }
            } else {
                gpWrap.style.zIndex = ''; 
                if(pad) { pad.style.opacity = '1'; pad.style.borderColor = ''; }
            }
        } else { 
            document.body.classList.remove('input-gestures-mode');
            gpWrap.classList.add('hidden'); 
        }
    }

    container.innerHTML = ''; 

    // --- 2. PAD VISIBILITY ---
    ['key9', 'key12', 'piano'].forEach(k => { 
        const el = document.getElementById(`pad-${k}`); 
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none'; 
    });
    
    // --- 3. PRACTICE MODE OVERLAY ---
    if(appSettings.isPracticeModeEnabled) {
        renderPracticeMode(container, settings, state, appSettings);
        return;
    }
    
    // --- 4. MAIN SEQUENCE CARDS ---
    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const header = document.createElement('h2');
        header.className = "text-xl font-bold text-center w-full mb-4 opacity-80 text-[var(--text-main)]";
        header.innerHTML = `Unique Mode: <span class="text-primary-app">Round ${state.currentRound}</span>`;
        container.appendChild(header);
    }

    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4); 
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    
    activeSeqs.forEach((seq, idx) => { 
        const card = createSequenceCard(seq, idx, settings, state, appSettings);
        container.appendChild(card); 
    });

    // --- 5. HEADER BUTTON STATUS ---
    updateHeaderButtons(modules, voiceModule, isGesturePadVisible);

    // Toggle reset button visibility
    document.querySelectorAll('.reset-button').forEach(b => { 
        b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none'; 
    });
}

// Internal helper to keep renderUI clean
function createSequenceCard(seq, idx, settings, state, appSettings) {
    const card = document.createElement('div'); 
    card.className = "p-4 rounded-xl shadow-md min-h-[100px] bg-[var(--card-bg)] relative"; 
    
    if (settings.machineCount > 1) {
        const headerRow = document.createElement('div');
        headerRow.className = "flex justify-between items-center mb-2 pb-2 border-b border-opacity-20";
        headerRow.innerHTML = `
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-50">${(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? "SEQUENCE" : `MACHINE ${idx + 1}`}</span>
        `;
        card.appendChild(headerRow);
    }

    const numGrid = document.createElement('div'); 
    numGrid.className = settings.machineCount > 1 ? "grid grid-cols-4 gap-2" : "flex flex-wrap gap-2 justify-center";
    
    (seq || []).forEach(num => { 
        const span = document.createElement('span'); 
        span.className = "number-box rounded-lg flex items-center justify-center font-bold"; 
        const scale = appSettings.uiScaleMultiplier || 1.0; 
        span.style.width = span.style.height = (40 * scale) + 'px'; 
        span.style.fontSize = (20 * scale) + 'px'; 
        span.textContent = num; 
        numGrid.appendChild(span); 
    }); 
    card.appendChild(numGrid);
    return card;
}

function updateHeaderButtons(modules, voiceModule, isGesturePadVisible) {
    const appSettings = getAppSettings(); // Ensure this is available
    const hMic = document.getElementById('header-mic-btn');
    const hCam = document.getElementById('header-cam-btn');
    const hGest = document.getElementById('header-gesture-btn'); 
    const hHand = document.getElementById('header-hand-btn'); // New

    if(hMic) {
        const isVoiceActive = voiceModule?.isListening;
        hMic.classList.toggle('header-btn-active', isVoiceActive);
    }
    
    // Toggle the hand tracking icon active state
    if(hHand) {
        const isVisionActive = modules.vision?.isActive;
        hHand.classList.toggle('header-btn-active', isVisionActive);
    }

    if(hCam) hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active'));
    if(hGest) hGest.classList.toggle('header-btn-active', isGesturePadVisible); 
        }

function renderPracticeMode(container, settings, state, appSettings) {
    const header = document.createElement('h2');
    header.className = "text-2xl font-bold text-center w-full mt-4 mb-4 text-[var(--text-main)]"; 
    header.innerHTML = `Practice Mode<br><span class="text-sm opacity-70">Round ${state.currentRound}</span>`;
    container.appendChild(header);

    if(practiceSequence.length === 0) { 
        const btn = document.createElement('button');
        btn.textContent = "START";
        btn.className = "w-48 h-48 rounded-full bg-green-600 text-white text-3xl font-bold mx-auto block animate-pulse"; 
        btn.onclick = startPracticeRound;
        container.appendChild(btn);
    } else {
        const replayBtn = document.createElement('button');
        replayBtn.innerHTML = "↻ REPLAY ROUND";
        replayBtn.className = "w-64 py-4 bg-yellow-600 text-white font-bold rounded-xl mx-auto block";
        replayBtn.onclick = () => { setPracticeInputIndex(0); playPracticeSequence(); };
        container.appendChild(replayBtn);
    }
}
