// renderer.js
import { appSettings, getState, getProfileSettings, blackoutState, isGesturePadVisible, practiceSequence, saveState } from './state.js';
import { CONFIG } from './constants.js';
import { vibrate } from './audio-haptics.js';
import { showToast } from './ui-core.js';
import { startPracticeRound, playPracticeSequence } from './game-logic.js';

export function renderUI() {
    const container = document.getElementById('sequence-container'); 
    try {
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
                    if(pad) {
                        pad.style.opacity = '0.05'; 
                        pad.style.borderColor = 'transparent';
                    }
                } else {
                    gpWrap.style.zIndex = ''; 
                    if(pad) {
                        pad.style.opacity = '1';
                        pad.style.borderColor = '';
                    }
                }

            } else { 
                document.body.classList.remove('input-gestures-mode');
                gpWrap.classList.add('hidden'); 
                gpWrap.style.zIndex = ''; 
            }
        }
    } catch(e) { console.error('Gesture UI error', e); }

    container.innerHTML = ''; 
    const settings = getProfileSettings();
    const state = getState();

    ['key9', 'key12', 'piano'].forEach(k => { 
        const el = document.getElementById(`pad-${k}`); 
        if(el) el.style.display = (settings.currentInput === k) ? 'block' : 'none'; 
    });
    
    if(appSettings.isPracticeModeEnabled) {
        const header = document.createElement('h2');
        header.className = "text-2xl font-bold text-center w-full mt-4 mb-4"; 
        header.style.color = "var(--text-main)";
        header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class="text-sm opacity-70">Round ${state.currentRound}</span>`;
        container.appendChild(header);

        if(practiceSequence.length === 0) { 
            state.currentRound = 1; 
            
            const btn = document.createElement('button');
            btn.textContent = "START";
            btn.className = "w-48 h-48 rounded-full bg-green-600 hover:bg-green-500 text-white text-3xl font-bold shadow-[0_0_40px_rgba(22,163,74,0.5)] transition-all transform hover:scale-105 active:scale-95 animate-pulse mx-auto block"; 
            btn.onclick = () => {
                btn.style.display = 'none'; 
                startPracticeRound();       
            };
            container.appendChild(btn);
        } else {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = "flex flex-col items-center gap-3 w-full";

            const replayBtn = document.createElement('button');
            replayBtn.innerHTML = "↻ REPLAY ROUND";
            replayBtn.className = "w-64 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg text-xl active:scale-95 transition-transform";
            replayBtn.onclick = () => {
                showToast("Replaying... 👂");
                playPracticeSequence(); 
            };

            const resetLvlBtn = document.createElement('button');
            resetLvlBtn.innerHTML = "⚠️ Reset to Level 1";
            resetLvlBtn.className = "text-xs text-red-400 hover:text-red-300 underline py-2";
            resetLvlBtn.onclick = () => {
                if(confirm("Restart practice from Level 1?")) {
                    practiceSequence.length = 0;
                    state.currentRound = 1;
                    renderUI();
                }
            };

            controlsDiv.appendChild(replayBtn);
            controlsDiv.appendChild(resetLvlBtn);
            container.appendChild(controlsDiv);
        }
        return;
    }
    
    const activeSeqs = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const roundNum = parseInt(state.currentRound) || 1;
        const header = document.createElement('h2');
        header.className = "text-xl font-bold text-center w-full mb-4 opacity-80";
        header.style.color = "var(--text-main)";
        header.innerHTML = `Unique Mode: <span class="text-primary-app">Round ${roundNum}</span>`;
        container.appendChild(header);
    }

    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4); 
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    
    activeSeqs.forEach((seq, idx) => { 
        const card = document.createElement('div'); 
        card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)] relative group"; 
        
        if (settings.machineCount > 1) {
            const headerRow = document.createElement('div');
            headerRow.className = "flex justify-between items-center mb-2 pb-2 border-b border-custom border-opacity-20";
            
            const title = document.createElement('span');
            title.className = "text-[10px] font-bold uppercase text-muted-custom tracking-wider";
            title.textContent = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? "SEQUENCE" : `MACHINE ${idx + 1}`;
            
            const controls = document.createElement('div');
            controls.className = "flex space-x-3 opacity-60 hover:opacity-100 transition-opacity";

            const btnBack = document.createElement('button');
            btnBack.innerHTML = "⌫";
            btnBack.className = "hover:text-red-400 text-sm font-bold";
            btnBack.onclick = (e) => {
                e.stopPropagation();
                if(state.sequences[idx] && state.sequences[idx].length > 0) {
                    state.sequences[idx].pop();
                    if (state.nextSequenceIndex > 0) state.nextSequenceIndex--; 
                    vibrate();
                    renderUI();
                    saveState();
                }
            };

            if (settings.currentMode !== CONFIG.MODES.UNIQUE_ROUNDS) {
                const btnTrash = document.createElement('button');
                btnTrash.innerHTML = "🗑️";
                btnTrash.className = "hover:text-red-600 text-sm";
                btnTrash.title = "Remove Machine";
                btnTrash.onclick = (e) => {
                    e.stopPropagation();
                    if(confirm(`Remove Machine ${idx + 1} entirely?`)) {
                        const countToRemove = state.sequences[idx].length;
                        state.sequences.splice(idx, 1);
                        settings.machineCount--;
                        
                        const sel = document.getElementById('machines-select');
                        if(sel) sel.value = settings.machineCount;

                        state.nextSequenceIndex = Math.max(0, state.nextSequenceIndex - countToRemove);

                        vibrate();
                        showToast(`Removed Machine ${idx + 1}`);
                        renderUI();
                        saveState();
                    }
                };
                controls.appendChild(btnTrash);
            }

            controls.insertBefore(btnBack, controls.firstChild); 
            headerRow.appendChild(title);
            headerRow.appendChild(controls);
            card.appendChild(headerRow);
        }

        const numGrid = document.createElement('div'); 
        if (settings.machineCount > 1) { numGrid.className = "grid grid-cols-4 gap-2 justify-items-center"; } else { numGrid.className = "flex flex-wrap gap-2 justify-center"; }
        
        (seq || []).forEach(num => { 
            const span = document.createElement('span'); 
            span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold"; 
            
            const scale = appSettings.uiScaleMultiplier || 1.0; 
            const boxSize = 40 * scale;
            span.style.width = boxSize + 'px'; 
            span.style.height = boxSize + 'px'; 
            
            const fontMult = appSettings.uiFontSizeMultiplier || 1.0;
            const fontSizePx = (boxSize * 0.5) * fontMult;
            span.style.fontSize = fontSizePx + 'px';
            span.textContent = num;
            numGrid.appendChild(span); 
        }); 
        
        card.appendChild(numGrid); 
        container.appendChild(card); 
    });
    const hMic = document.getElementById('header-mic-btn'); 
    const hCam = document.getElementById('header-cam-btn'); 
    const hGest = document.getElementById('header-gesture-btn'); 
    
    if(hMic) { 
    // Syncs UI if either the environmental sensor or voice commander is listening
    const isSensorActive = SharedState.modules.sensor && SharedState.modules.sensor.mode.audio; 
    const isVoiceActive = SharedState.voiceModule && SharedState.voiceModule.isListening; 
    hMic.classList.toggle('header-btn-active', isSensorActive || isVoiceActive); 
    } 
    
    if(hCam) hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active')); 
    if(hGest) hGest.classList.toggle('header-btn-active', isGesturePadVisible); 
    
    // --- RESTORED: Reset Button Visibility ---
    document.querySelectorAll('.reset-button').forEach(b => { 
    b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none'; 
    }); 
    } // End of renderUI()
