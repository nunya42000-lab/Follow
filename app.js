import { GestureEngine } from './gestures.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS } from './settings.js';
import { initComments } from './comments.js';
import { VisionEngine } from './vision.js';
import { CONFIG, DEFAULT_APP, PREMADE_PROFILES, DEFAULT_PROFILE_SETTINGS, DEFAULT_MAPPINGS, DEFAULT_HAND_MAPPINGS } from './constants.js';
import { vibrate, vibrateMorse, speak, showToast, applyTheme } from './utils.js';
import { VoiceCommander } from './voice.js';
const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ENABLE OFFLINE PERSISTENCE ---
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one.');
    } else if (err.code == 'unimplemented') {
        console.log('Browser does not support persistence');
    }
});

let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = { sensor: null, settings: null };
let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null, stealth: null, stealthAction: null, playback: null, tap: null };
let gestureState = { startDist: 0, startScale: 1, isPinching: false };
let blackoutState = { isActive: false, lastShake: 0 }; 
let gestureInputState = { startX: 0, startY: 0, startTime: 0, maxTouches: 0, isTapCandidate: false, tapCount: 0 };
let isDeleting = false; 
let isDemoPlaying = false;
let isPlaybackPaused = false;
let playbackResumeCallback = null;
let practiceSequence = [];
let practiceInputIndex = 0;
let ignoreNextClick = false;
let voiceModule = null

// New flag for Shake Toggle
let isGesturePadVisible = false;

// --- NEW GLOBALS FOR AUTO-LOGIC ---
let simpleTimer = { interval: null, startTime: 0, elapsed: 0, isRunning: false };
let simpleCounter = 0;
let globalTimerActions = { start: null, stop: null, reset: null };
let globalCounterActions = { increment: null, reset: null };

const getProfileSettings = () => appSettings.runtimeSettings;
const getState = () => appState['current_session'] || (appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 });
function saveState() { localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState)); }

function loadState() { 
    try { 
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS); 
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE); 
        if(s) { 
            const loaded = JSON.parse(s); 
            appSettings = { ...DEFAULT_APP, ...loaded, profiles: { ...DEFAULT_APP.profiles, ...(loaded.profiles || {}) }, customThemes: { ...DEFAULT_APP.customThemes, ...(loaded.customThemes || {}) } }; 
            
            if (typeof appSettings.isHapticsEnabled === 'undefined') appSettings.isHapticsEnabled = true;
            if (typeof appSettings.isSpeedDeletingEnabled === 'undefined') appSettings.isSpeedDeletingEnabled = true;
            if (typeof appSettings.isLongPressAutoplayEnabled === 'undefined') appSettings.isLongPressAutoplayEnabled = true;
            if (typeof appSettings.isUniqueRoundsAutoClearEnabled === 'undefined') appSettings.isUniqueRoundsAutoClearEnabled = true; 
            if (typeof appSettings.showTimer === 'undefined') appSettings.showTimer = false;
            if (typeof appSettings.showCounter === 'undefined') appSettings.showCounter = false;

            if (!appSettings.voicePresets) appSettings.voicePresets = {};
            if (!appSettings.activeVoicePresetId) appSettings.activeVoicePresetId = 'standard';
            if (!appSettings.generalLanguage) appSettings.generalLanguage = 'en';
            if (!appSettings.gestureResizeMode) appSettings.gestureResizeMode = 'global';

            if(!appSettings.runtimeSettings) appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId]?.settings || DEFAULT_PROFILE_SETTINGS)); 
            if(appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
        } else { 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles['profile_1'].settings)); 
        } 
        if(st) appState = JSON.parse(st); 
        if(!appState['current_session']) appState['current_session'] = { sequences: Array.from({length: CONFIG.MAX_MACHINES}, () => []), nextSequenceIndex: 0, currentRound: 1 };
        
        appState['current_session'].currentRound = parseInt(appState['current_session'].currentRound) || 1;
        
    } catch(e) { 
        console.error("Load failed", e); 
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP)); 
        saveState(); 
    } 
}

    function handleGesture(kind) {
       const indicator = document.getElementById('gesture-indicator');
        if(indicator) {
            indicator.textContent = `Gesture: ${kind.replace(/_/g, ' ')}`;
            indicator.style.opacity = '1';
            setTimeout(()=> { indicator.style.opacity = '0.3'; indicator.textContent = 'Area Active'; }, 1000);
        }
        const settings = getProfileSettings();
        const mapResult = mapGestureToValue(kind, settings.currentInput);
        if(mapResult !== null) addValue(mapResult);
    }


function updateAllChrome() { applyTheme(appSettings.activeTheme); document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`; renderUI(); }

function startPracticeRound() {
    const settingsModal = document.getElementById('settings-modal');
    if(settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    const state = getState(); 
    const settings = getProfileSettings(); 
    const max = (settings.currentInput === 'key12') ? 12 : 9;
    const getRand = () => { 
        if(settings.currentInput === 'piano') { 
            const keys = ['C','D','E','F','G','A','B','1','2','3','4','5']; 
            return keys[Math.floor(Math.random()*keys.length)]; 
        } 
        return Math.floor(Math.random() * max) + 1; 
    };
    if(practiceSequence.length === 0) state.currentRound = 1;
    if(settings.currentMode === CONFIG.MODES.SIMON) {
        practiceSequence.push(getRand());
        state.currentRound = practiceSequence.length;
    } else {
        practiceSequence = []; 
        const len = state.currentRound; 
        for(let i=0; i<len; i++) practiceSequence.push(getRand());
    }
    practiceInputIndex = 0; 
    renderUI(); 
    showToast(`Practice Round ${state.currentRound}`); 
    setTimeout(() => playPracticeSequence(), 1000);
}

function playPracticeSequence() {
    const settingsModal = document.getElementById('settings-modal');
    if(settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    disableInput(true); 
    let i = 0; 
    const speed = appSettings.playbackSpeed || 1.0;
    function next() {
        if(i >= practiceSequence.length) { disableInput(false); return; }
        const val = practiceSequence[i]; 
        const settings = getProfileSettings(); 
        const key = document.querySelector(`#pad-${settings.currentInput} button[data-value=\"${val}\"]`);
        if(key) { key.classList.add('flash-active'); setTimeout(() => key.classList.remove('flash-active'), 250 / speed); }
        speak(val); 
        i++; 
        setTimeout(next, 800 / speed);
    } 
    next();
}
function addValue(value) {
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings();
    
    if(appSettings.isPracticeModeEnabled) {
        if(practiceSequence.length === 0) return; 
        if(value == practiceSequence[practiceInputIndex]) { 
            practiceInputIndex++; 
            if(practiceInputIndex >= practiceSequence.length) { 
                speak("Correct"); 
                state.currentRound++; 
                setTimeout(startPracticeRound, 1500); 
            } 
        } else { 
            speak("Wrong"); 
            navigator.vibrate(500); 
            setTimeout(() => playPracticeSequence(), 1500); 
        } 
        return;
    }
    
    let targetIndex = 0; 
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    const roundNum = parseInt(state.currentRound) || 1;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    let limit;
    if (isUnique) { limit = appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength; } else { limit = settings.sequenceLength; }
    
    if(state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
        if (isUnique && appSettings.isUniqueRoundsAutoClearEnabled) { showToast("Round Full - Reset? 🛑"); vibrate(); }
        return;
    }

    let isFirstInput = true;
    state.sequences.forEach(s => { if(s.length > 0) isFirstInput = false; });

    if (isFirstInput) {
        if (appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.reset && globalTimerActions.start) {
            globalTimerActions.reset();
            globalTimerActions.start();
        }
        if (appSettings.isAutoCounterEnabled && appSettings.showCounter && globalCounterActions.increment) {
            globalCounterActions.increment();
        }
    }

    if(!state.sequences[targetIndex]) state.sequences[targetIndex] = [];
    state.sequences[targetIndex].push(value); 
    state.nextSequenceIndex++; 
    renderUI(); 
    saveState();
    
    if(appSettings.isAutoplayEnabled) {
        if (settings.currentMode === CONFIG.MODES.SIMON) { 
            const justFilled = (state.nextSequenceIndex - 1) % settings.machineCount; 
            if(justFilled === settings.machineCount - 1) setTimeout(playDemo, 250); 
        } else { 
            if (appSettings.isUniqueRoundsAutoClearEnabled) {
                if(state.sequences[0].length >= roundNum) { disableInput(true); setTimeout(playDemo, 250); } 
            } else { setTimeout(playDemo, 250); }
        }
    }
}
function handleBackspace(e) { 
    if(e) { e.preventDefault(); e.stopPropagation(); } 
    vibrate(); 
    const state = getState(); 
    const settings = getProfileSettings(); 
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
         if(state.sequences[0].length > 0) { state.sequences[0].pop(); state.nextSequenceIndex--; }
    } else {
        let target = (state.nextSequenceIndex - 1) % settings.machineCount;
        if (target < 0) target = settings.machineCount - 1; 
        
        if(state.sequences[target] && state.sequences[target].length > 0) {
             state.sequences[target].pop();
             state.nextSequenceIndex--;
        }
    }
    
    let isEmpty = true;
    state.sequences.forEach(s => { if(s.length > 0) isEmpty = false; });
    
    if (isEmpty && appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.stop) {
        globalTimerActions.stop();
    }

    renderUI(); 
    saveState(); 
}
function renderUI() {
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
        header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span>`;
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
                practiceInputIndex = 0; 
                showToast("Replaying... 👂");
                playPracticeSequence(); 
            };

            const resetLvlBtn = document.createElement('button');
            resetLvlBtn.innerHTML = "⚠️ Reset to Level 1";
            resetLvlBtn.className = "text-xs text-red-400 hover:text-red-300 underline py-2";
            resetLvlBtn.onclick = () => {
                if(confirm("Restart practice from Level 1?")) {
                    practiceSequence = [];
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
        header.innerHTML = `Unique Mode: <span class=\"text-primary-app\">Round ${roundNum}</span>`;
        container.appendChild(header);
    }

    let gridCols = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 1 : Math.min(settings.machineCount, 4); 
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    
    activeSeqs.forEach((seq, idx) => { 
        const card = document.createElement('div'); 
        card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)] relative group"; 
        
        // --- UPDATED: Header Row is now CONDITIONAL ---
        // Only show the header (Trash/Backspace/Title) if there is more than 1 machine.
        if (settings.machineCount > 1) {
            const headerRow = document.createElement('div');
            headerRow.className = "flex justify-between items-center mb-2 pb-2 border-b border-custom border-opacity-20";
            
            const title = document.createElement('span');
            title.className = "text-[10px] font-bold uppercase text-muted-custom tracking-wider";
            title.textContent = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? "SEQUENCE" : `MACHINE ${idx + 1}`;
            
            const controls = document.createElement('div');
            controls.className = "flex space-x-3 opacity-60 hover:opacity-100 transition-opacity";

            // 1. Backspace for this specific machine
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

            // 2. Trash (Remove Machine Entirely)
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
        // ----------------------------------------

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
        card.appendChild(numGrid); container.appendChild(card); 
    });

    const hMic = document.getElementById('header-mic-btn');
    const hCam = document.getElementById('header-cam-btn');
    const hGest = document.getElementById('header-gesture-btn'); 

    if(hMic) {
        const isSensorActive = modules.sensor && modules.sensor.mode.audio;
        const isVoiceActive = voiceModule && voiceModule.isListening;
        hMic.classList.toggle('header-btn-active', isSensorActive || isVoiceActive);
    }
    if(hCam) hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active'));
    if(hGest) hGest.classList.toggle('header-btn-active', isGesturePadVisible); 

    document.querySelectorAll('.reset-button').forEach(b => { b.style.display = (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) ? 'block' : 'none'; });
}


function disableInput(disabled) {
    const footer = document.getElementById('input-footer');
    if(!footer) return;
    if(disabled) { footer.classList.add('opacity-50', 'pointer-events-none'); } 
    else { footer.classList.remove('opacity-50', 'pointer-events-none'); }
}

function playDemo() {
    if(isDemoPlaying) return;
    isDemoPlaying = true;
    isPlaybackPaused = false;
    playbackResumeCallback = null;

    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    const playBtn = document.querySelector('button[data-action="play-demo"]'); 
    
    let seqsToPlay = [];
    if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        seqsToPlay = [state.sequences[0]];
    } else {
        seqsToPlay = state.sequences.slice(0, settings.machineCount);
    }
    
    const chunkSize = settings.simonChunkSize || 3;
    let chunks = [];
    let maxLen = 0;
    seqsToPlay.forEach(s => { if(s.length > maxLen) maxLen = s.length; });
    
    for(let i=0; i<maxLen; i+=chunkSize) {
        for(let m=0; m<seqsToPlay.length; m++) {
            const seq = seqsToPlay[m];
            if(i < seq.length) {
                const slice = seq.slice(i, i+chunkSize);
                chunks.push({ 
                    machine: m, 
                    nums: slice, 
                    isNewRound: (m===0 && i===0 && chunks.length===0) 
                });
            }
        }
    }

    let cIdx = 0;
    let totalCount = 0; 

    const schedule = (fn, delay) => {
        setTimeout(() => {
            if(!isDemoPlaying) return; 
            if(isPlaybackPaused) {
                playbackResumeCallback = fn;
            } else {
                fn();
            }
        }, delay);
    };

        function nextChunk() {
        if(!isDemoPlaying) {
            if(playBtn) playBtn.textContent = "▶";
            return;
        }

        if(cIdx >= chunks.length) { 
            isDemoPlaying = false; 
            if(playBtn) playBtn.textContent = "▶";
            
            if(settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
               setTimeout(() => {
                   if(!isDemoPlaying) {
                       state.currentRound++;
                       state.sequences[0] = [];
                       state.nextSequenceIndex = 0;
                       renderUI();
                       showToast(`Round ${state.currentRound}`);
                       saveState();
                       disableInput(false);
                   }
               }, 500);
            }
            return; 
        }

        const chunk = chunks[cIdx];
        const machineDelay = (settings.simonInterSequenceDelay) || 0;
        
        let nIdx = 0;
        function playNum() {
            if(!isDemoPlaying) {
                if(playBtn) playBtn.textContent = "▶";
                return;
            }
            
            if(nIdx >= chunk.nums.length) {
                cIdx++;
                schedule(nextChunk, machineDelay);
                return;
            }
            const val = chunk.nums[nIdx];
            totalCount++; 
            
            if(playBtn) playBtn.textContent = totalCount;
            
            const kVal = val; 
            const padId = `pad-${settings.currentInput}`;
            const btn = document.querySelector(`#${padId} button[data-value="${kVal}"]`);
            if(btn) {
                btn.classList.add('flash-active');
                setTimeout(() => btn.classList.remove('flash-active'), 250/speed);
            }
            
            speak(val);
            if(appSettings.isHapticMorseEnabled) vibrateMorse(val);
            
            nIdx++;
            schedule(playNum, (CONFIG.DEMO_DELAY_BASE_MS / speed));
        }
        playNum();
    }
    nextChunk();
}

const startApp = () => {
    loadState();

    modules.settings = new SettingsManager(appSettings, {
        onSave: saveState,
        onUpdate: (type) => { 
            if(type === 'mode_switch') {
                const s = getState();
                s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []);
                s.nextSequenceIndex = 0;
                s.currentRound = 1;
                renderUI();
            } else {
                updateAllChrome(); 
            }
        },
        onReset: () => { 
            localStorage.clear(); 
            location.reload(); 
        },
        onProfileSwitch: (id) => { 
            appSettings.activeProfileId = id; 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); 
            if(appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
            saveState(); 
            const s = getState(); s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); s.nextSequenceIndex = 0; s.currentRound = 1;
            renderUI(); 
        },
        onProfileAdd: (name) => { 
            const id = 'p_' + Date.now(); 
            appSettings.profiles[id] = { name, settings: { ...DEFAULT_PROFILE_SETTINGS }, theme: 'default' }; 
            appSettings.activeProfileId = id; 
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings)); 
            saveState(); 
            renderUI(); 
        },
        onProfileRename: (name) => { 
            if(appSettings.profiles[appSettings.activeProfileId]) { 
                appSettings.profiles[appSettings.activeProfileId].name = name; 
                saveState(); 
            } 
        },
        onProfileDelete: () => { 
            if(Object.keys(appSettings.profiles).length > 1) { 
                delete appSettings.profiles[appSettings.activeProfileId]; 
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0]; 
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings)); 
                saveState(); 
                renderUI(); 
            } else { alert("Must keep one profile."); } 
        },
        onProfileSave: () => { 
            if(appSettings.profiles[appSettings.activeProfileId]) { 
                appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings)); 
                saveState(); 
                alert("Profile Saved!"); 
            } 
        }
    }, null); 

        modules.sensor = new SensorEngine(
        (val, source) => { 
             // --- FIX: Prevent Sensor Interference ---
             // If AI Vision is running, ignore the basic light/camera sensor
             // to prevent "7s" or random inputs from light changes.
             if (source === 'camera' && modules.vision && modules.vision.isActive) return;
             // ----------------------------------------

             addValue(val); 
             const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
             if(btn) { btn.classList.add('flash-active'); setTimeout(() => btn.classList.remove('flash-active'), 200); }
        },
        (status) => { }
    );

    modules.settings.sensorEngine = modules.sensor;
modules.vision = new VisionEngine(
        (gesture) => {
            // This runs when the AI detects a hand gesture (e.g. "hand_5_up")
            const settings = getProfileSettings();
            const mappedVal = mapGestureToValue(gesture, settings.currentInput);
            
            if (mappedVal) {
                addValue(mappedVal);
                
                // Visual Feedback
                const btn = document.querySelector(`#pad-${settings.currentInput} button[data-value="${mappedVal}"]`);
                if(btn) { 
                    btn.classList.add('flash-active'); 
                    setTimeout(() => btn.classList.remove('flash-active'), 200); 
                }
                showToast(`Hand: ${mappedVal} 🖐️`);
            }
        },
        (status) => showToast(status) // Shows "Loading AI...", "Cam Blocked", etc.
    );
    // --- FIX: INITIALIZE VOICE MODULE ---
    voiceModule = new VoiceCommander({
        onStatus: (msg) => showToast(msg),
            onInput: (val) => {
        addValue(val);

        // --- NEW: Blink the Mic Button ---
        const hMic = document.getElementById('header-mic-btn');
        if(hMic) {
            // 1. Force the visual state OFF
            hMic.classList.remove('header-btn-active');
            
            // 2. Wait 300ms (approx time for speech engine to reset) then turn ON
            setTimeout(() => {
                // Only turn back on if the user hasn't manually stopped it
                if(voiceModule && voiceModule.isListening) {
                    hMic.classList.add('header-btn-active');
                }
            }, 300);
        }
        // ---------------------------------

        const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
        if(btn) { 
            btn.classList.add('flash-active'); 
            setTimeout(() => btn.classList.remove('flash-active'), 200); 
        }
    },
        
        onCommand: (cmd) => {
            if(cmd === 'CMD_PLAY') playDemo();
            if(cmd === 'CMD_STOP') { isDemoPlaying = false; showToast("Stopped"); }
            if(cmd === 'CMD_CLEAR') { 
                const s = getState(); s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
                renderUI(); showToast("Cleared"); 
            }
            if(cmd === 'CMD_DELETE') handleBackspace();
            if(cmd === 'CMD_SETTINGS') modules.settings.openSettings();
        }
    });

        updateAllChrome();
    initComments(db);
    modules.settings.updateHeaderVisibility();
    
    // --- THIS IS THE CRITICAL CHANGE ---
    initGlobalListeners(); // Keep buttons working
    initGestureEngine();   // Start the new gesture system
    
    if (appSettings.autoInputMode === 'mic' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleAudio(true);
    }
    if (appSettings.autoInputMode === 'cam' || appSettings.autoInputMode === 'both') {
        modules.sensor.toggleCamera(true);
    }
    
    renderUI();
};

// ... (Previous imports and init logic remain unchanged) ...

// --- NEW: Default Hand Definitions ---
const DEFAULT_HAND_MAPPINGS = {
    // 9-Key Defaults
    'k9_1': 'hand_1_up', 'k9_2': 'hand_2_up', 'k9_3': 'hand_3_up',
    'k9_4': 'hand_4_up', 'k9_5': 'hand_5_up', 'k9_6': 'hand_1_down',
    'k9_7': 'hand_2_down', 'k9_8': 'hand_3_down', 'k9_9': 'hand_4_down',

    // 12-Key Defaults
    'k12_1': 'hand_1_up', 'k12_2': 'hand_2_up', 'k12_3': 'hand_3_up',
    'k12_4': 'hand_4_up', 'k12_5': 'hand_5_up', 'k12_6': 'hand_1_down',
    'k12_7': 'hand_2_down', 'k12_8': 'hand_3_down', 'k12_9': 'hand_4_down',
    'k12_10': 'hand_5_down', 'k12_11': 'hand_1_right', 'k12_12': 'hand_1_left',

    // Piano Defaults
    'piano_C': 'hand_1_up', 'piano_D': 'hand_2_up', 'piano_E': 'hand_3_up',
    'piano_F': 'hand_4_up', 'piano_G': 'hand_5_up', 'piano_A': 'hand_1_right', 'piano_B': 'hand_1_left',
    'piano_1': 'hand_1_down', 'piano_2': 'hand_2_down', 'piano_3': 'hand_3_down',
    'piano_4': 'hand_4_down', 'piano_5': 'hand_5_down'
};

function mapGestureToValue(kind, currentInput) {
    const saved = appSettings.gestureMappings || {};

    // Strict Match Helper
    const matches = (target, incoming) => {
        if (!target) return false;
        if (target === incoming) return true;
        if (target.endsWith('_any')) {
            const base = target.replace('_any', '');
            if (incoming.startsWith(base)) return true;
        }
        return false;
    };

    // --- UPDATED LOGIC: Check Touch AND Hand defaults ---
    const checkMatch = (key) => {
        const m = saved[key] || {};
        
        // 1. Check Saved/Default TOUCH Gesture
        const touchG = m.gesture || DEFAULT_MAPPINGS[key];
        if (matches(touchG, kind)) return true;

        // 2. Check Saved/Default HAND Gesture
        const handG = m.hand || DEFAULT_HAND_MAPPINGS[key];
        if (matches(handG, kind)) return true;

        return false;
    };

    if(currentInput === CONFIG.INPUTS.PIANO) {
        const keys = ['C','D','E','F','G','A','B','1','2','3','4','5'];
        for(let k of keys) { if (checkMatch('piano_' + k)) return k; }
    } else if(currentInput === CONFIG.INPUTS.KEY12) {
        for(let i=1; i<=12; i++) { if (checkMatch('k12_' + i)) return i; }
    } else if(currentInput === CONFIG.INPUTS.KEY9) {
        for(let i=1; i<=9; i++) { if (checkMatch('k9_' + i)) return i; }
    }
    return null;
}
// NEW FUNCTION: Tells the engine which gestures to look for
function updateEngineConstraints() {
    if (!modules.gestureEngine) return;
    const settings = getProfileSettings();
    const saved = appSettings.gestureMappings || {};
    const getG = (key) => (saved[key] && saved[key].gesture) ? saved[key].gesture : DEFAULT_MAPPINGS[key];

    const activeList = [];

    if(settings.currentInput === CONFIG.INPUTS.PIANO) {
        ['C','D','E','F','G','A','B','1','2','3','4','5'].forEach(k => activeList.push(getG('piano_' + k)));
    } else if(settings.currentInput === CONFIG.INPUTS.KEY12) {
        for(let i=1; i<=12; i++) activeList.push(getG('k12_' + i));
    } else if(settings.currentInput === CONFIG.INPUTS.KEY9) {
        for(let i=1; i<=9; i++) activeList.push(getG('k9_' + i));
    }

    if (appSettings.isDeleteGestureEnabled) activeList.push('delete'); 
    if (appSettings.isClearGestureEnabled) activeList.push('clear');   

    modules.gestureEngine.updateAllowed(activeList);
}


function initGestureEngine() {
    const engine = new GestureEngine(document.body, {
        tapDelay: appSettings.gestureTapDelay || 300,
        swipeThreshold: appSettings.gestureSwipeDist || 30,
        debug: false
    }, {
        onGesture: (data) => {
            // Input Mapping
            const isPadOpen = (typeof isGesturePadVisible !== 'undefined' && isGesturePadVisible);
            const isClassPresent = document.body.classList.contains('input-gestures-mode');
            const isBossActive = appSettings.isBlackoutFeatureEnabled && appSettings.isBlackoutGesturesEnabled && blackoutState.isActive;

            if (isPadOpen || isClassPresent || isBossActive) {
                const settings = getProfileSettings();
                const mapResult = mapGestureToValue(data.name, settings.currentInput);
                const indicator = document.getElementById('gesture-indicator');

                if (mapResult !== null) {
                    addValue(mapResult);
                    if(indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ').toUpperCase();
                        indicator.style.opacity = '1';
                        indicator.style.color = 'var(--seq-bubble)';
                        setTimeout(() => { indicator.style.opacity = '0.3'; indicator.style.color = ''; }, 250);
                    }
                } else {
                    if(indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ');
                        indicator.style.opacity = '0.5';
                        setTimeout(() => indicator.style.opacity = '0.3', 500);
                    }
                }
            }
        },
        onContinuous: (data) => {
            // --- FIX: HANDLE DELETE & CLEAR HERE ---
            // The v100 engine emits 'squiggle' as a continuous event for instant feedback.
            
            // 1. Delete (1-Finger Squiggle)
            if (data.type === 'squiggle' && data.fingers === 1) {
                if (appSettings.isDeleteGestureEnabled) { 
                    handleBackspace(); 
                    showToast("Deleted ⌫"); 
                    vibrate(); 
                }
                return;
            }

            // 2. Clear (2-Finger Squiggle)
            if (data.type === 'squiggle' && data.fingers === 2) {
                if (appSettings.isClearGestureEnabled) { 
                    const s = getState(); 
                    s.sequences = Array.from({length: CONFIG.MAX_MACHINES}, () => []); 
                    s.nextSequenceIndex = 0; 
                    renderUI(); 
                    saveState(); 
                    showToast("CLEARED 💥"); 
                    vibrate(); 
                }
                return;
            }
            // ---------------------------------------

            if (data.type === 'twist' && data.fingers === 3 && appSettings.isVolumeGesturesEnabled) {
                let newVol = appSettings.voiceVolume || 1.0; newVol += (data.value * 0.05); 
                appSettings.voiceVolume = Math.min(1.0, Math.max(0.0, newVol)); saveState(); showToast(`Volume: ${(appSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
            }
            if (data.type === 'twist' && data.fingers === 2 && appSettings.isSpeedGesturesEnabled) {
                let newSpeed = appSettings.playbackSpeed || 1.0; newSpeed += (data.value * 0.05);
                appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed)); saveState(); showToast(`Speed: ${(appSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
            }
            if (data.type === 'pinch') {
                const mode = appSettings.gestureResizeMode || 'global';
                if (mode === 'none') return;
                if (!gestureState.isPinching) { gestureState.isPinching = true; gestureState.startGlobal = appSettings.globalUiScale; gestureState.startSeq = appSettings.uiScaleMultiplier; }
                clearTimeout(gestureState.resetTimer); gestureState.resetTimer = setTimeout(() => { gestureState.isPinching = false; }, 250);
                if (mode === 'sequence') {
                    let raw = gestureState.startSeq * data.scale; let newScale = Math.round(raw * 10) / 10;
                    if (newScale !== appSettings.uiScaleMultiplier) { appSettings.uiScaleMultiplier = Math.min(2.5, Math.max(0.5, newScale)); renderUI(); showToast(`Cards: ${(appSettings.uiScaleMultiplier * 100).toFixed(0)}% 🔍`); }
                } else {
                    let raw = gestureState.startGlobal * data.scale; let newScale = Math.round(raw / 10) * 10;
                    if (newScale !== appSettings.globalUiScale) { appSettings.globalUiScale = Math.min(200, Math.max(50, newScale)); updateAllChrome(); showToast(`UI: ${appSettings.globalUiScale}% 🔍`); }
                }
            }
        }
    });
    modules.gestureEngine = engine;

    // Initial Update
    updateEngineConstraints();

    // Hook into renderUI so constraints update when you switch inputs
    const originalRender = renderUI;
    renderUI = function() {
        originalRender();
        updateEngineConstraints();
    };
}
                    
                            

function initGlobalListeners() {
    try {
        // --- BUTTON LISTENERS ---
        document.querySelectorAll('.btn-pad-number').forEach(b => {
            const press = (e) => { 
                if(e) { e.preventDefault(); e.stopPropagation(); } 
                if(ignoreNextClick) return; 
                addValue(b.dataset.value); 
                b.classList.add('flash-active'); 
                setTimeout(() => b.classList.remove('flash-active'), 150); 
            };
            b.addEventListener('mousedown', press); 
            b.addEventListener('touchstart', press, { passive: false });
            b.addEventListener('touchend', () => clearTimeout(timers.stealth));
        });

        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
            let wasPlaying = false; let lpTriggered = false;
            const handleDown = (e) => { 
                if(e && e.cancelable) { e.preventDefault(); e.stopPropagation(); } 
                wasPlaying = isDemoPlaying; lpTriggered = false;
                if(wasPlaying) { isDemoPlaying = false; b.textContent = "▶"; showToast("Playback Stopped 🛑"); return; }
                if (appSettings.isLongPressAutoplayEnabled) {
                    timers.longPress = setTimeout(() => {
                        lpTriggered = true;
                        appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled;
                        modules.settings.updateUIFromSettings();
                        showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`);
                        ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500);
                    }, 800);
                }
            };
            const handleUp = (e) => {
                if(e && e.cancelable) { e.preventDefault(); e.stopPropagation(); } 
                clearTimeout(timers.longPress);
                if (!wasPlaying && !lpTriggered) { playDemo(); }
            };
            b.addEventListener('mousedown', handleDown); b.addEventListener('touchstart', handleDown, { passive: false });
            b.addEventListener('mouseup', handleUp); b.addEventListener('touchend', handleUp); b.addEventListener('mouseleave', () => clearTimeout(timers.longPress));
        });

        document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => {
            b.addEventListener('click', () => { if(confirm("Reset Round Counter to 1?")) { const s = getState(); s.currentRound = 1; s.sequences[0] = []; s.nextSequenceIndex = 0; renderUI(); saveState(); showToast("Reset to Round 1"); } });
        });
        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
            b.addEventListener('click', () => { if(isDemoPlaying) { isDemoPlaying = false; const pb = document.querySelector('button[data-action="play-demo"]'); if(pb) pb.textContent = "▶"; showToast("Playback Stopped 🛑"); return; } modules.settings.openSettings(); });
            const start = () => { timers.settingsLongPress = setTimeout(() => { modules.settings.toggleRedeem(true); ignoreNextClick = true; setTimeout(() => ignoreNextClick = false, 500); }, 1000); };
            const end = () => clearTimeout(timers.settingsLongPress);
            b.addEventListener('touchstart', start, {passive:true}); b.addEventListener('touchend', end); b.addEventListener('mousedown', start); b.addEventListener('mouseup', end);
        });

        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            const startDelete = (e) => { 
                if(e) { e.preventDefault(); e.stopPropagation(); } 
                handleBackspace(null); 
                if(!appSettings.isSpeedDeletingEnabled) return; 
                isDeleting = false; 
                timers.initialDelay = setTimeout(() => { isDeleting = true; timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); }, CONFIG.SPEED_DELETE_DELAY); 
            }; 
            const stopDelete = () => { clearTimeout(timers.initialDelay); clearInterval(timers.speedDelete); setTimeout(() => isDeleting = false, 50); }; 
            b.addEventListener('mousedown', startDelete); b.addEventListener('touchstart', startDelete, { passive: false }); b.addEventListener('mouseup', stopDelete); b.addEventListener('mouseleave', stopDelete); b.addEventListener('touchend', stopDelete); b.addEventListener('touchcancel', stopDelete); 
        });

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
        
        const handlePause = (e) => { if(isDemoPlaying) { isPlaybackPaused = true; showToast("Paused ⏸️"); } };
        const handleResume = (e) => { if(isPlaybackPaused) { isPlaybackPaused = false; showToast("Resumed ▶️"); if(playbackResumeCallback) { const fn = playbackResumeCallback; playbackResumeCallback = null; fn(); } } };
        document.body.addEventListener('mousedown', handlePause); document.body.addEventListener('touchstart', handlePause, {passive:true});
        document.body.addEventListener('mouseup', handleResume); document.body.addEventListener('touchend', handleResume);
        
        document.getElementById('close-settings').addEventListener('click', () => { if(appSettings.isPracticeModeEnabled) { setTimeout(startPracticeRound, 500); } });

        // --- BOSS MODE SHAKE & GRID ---
        let lastX=0, lastY=0, lastZ=0;
        window.addEventListener('devicemotion', (e) => {
            if(!appSettings.isBlackoutFeatureEnabled) return; 
            const acc = e.accelerationIncludingGravity; if(!acc) return;
            const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
            
            if(delta > 25) { 
                const now = Date.now();
                if(now - blackoutState.lastShake > 1000) {
                    blackoutState.isActive = !blackoutState.isActive;
                    document.body.classList.toggle('blackout-active', blackoutState.isActive);
                    showToast(blackoutState.isActive ? "Boss Mode 🌑" : "Welcome Back");
                    vibrate();
                    renderUI(); 
                    blackoutState.lastShake = now;
                }
            }
            lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        });
                                                                                                                   
        const bl = document.getElementById('blackout-layer');
        if(bl) {
             bl.addEventListener('touchstart', (e) => {
                 if (appSettings.isBlackoutGesturesEnabled) return;
                 if (e.touches.length === 1) {
                     e.preventDefault(); 
                     const t = e.touches[0]; const w = window.innerWidth; const h = window.innerHeight;
                     let col = Math.floor(t.clientX / (w / 3)); if (col > 2) col = 2;
                     const settings = getProfileSettings();
                     let val = null;
                     if (settings.currentInput === 'key9') {
                         let row = Math.floor(t.clientY / (h / 3)); if (row > 2) row = 2;
                         val = (row * 3) + col + 1;
                     } else {
                         let row = Math.floor(t.clientY / (h / 4)); if (row > 3) row = 3;
                         const index = (row * 3) + col; 
                         if (settings.currentInput === 'piano') {
                             const map = ['1','2','3', '4','5','C', 'D','E','F', 'G','A','B']; val = map[index];
                         } else { val = index + 1; }
                     }
                     if (val !== null) { addValue(val.toString()); if(navigator.vibrate) navigator.vibrate(20); }
                 }
             }, { passive: false });
        }
        
        // --- HEADER BUTTONS ---
        const headerTimer = document.getElementById('header-timer-btn');
        const headerCounter = document.getElementById('header-counter-btn');
        const headerMic = document.getElementById('header-mic-btn');
        const headerCam = document.getElementById('header-cam-btn');
        const headerGesture = document.getElementById('header-gesture-btn'); 
        const headerHand = document.getElementById('header-hand-btn'); // Get the button

        if(headerHand) {
            headerHand.onclick = () => {
                if(!modules.vision) return;
                
                // Toggle State
                const isActive = !modules.vision.isActive;
                
                if (isActive) {
                    modules.vision.start();
                    headerHand.classList.add('header-btn-active');
                } else {
                    modules.vision.stop();
                    headerHand.classList.remove('header-btn-active');
                }
            };
        }
        
        const headerStealth = document.getElementById('header-stealth-btn');
if(headerStealth) {
    headerStealth.onclick = () => {
        document.body.classList.toggle('hide-controls');
        const isActive = document.body.classList.contains('hide-controls');
        headerStealth.classList.toggle('header-btn-active', isActive);
        showToast(isActive ? "Inputs Only Active" : "Controls Visible");
        
        // Force layout recalculation for the new huge buttons
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    };
}
        
        if(headerTimer) {
            headerTimer.textContent = "00:00"; 
            headerTimer.style.fontSize = "0.75rem"; 
            const formatTime = (ms) => {
                const totalSec = Math.floor(ms / 1000); const m = Math.floor(totalSec / 60); const s = totalSec % 60;
                return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            };
            const updateTimer = () => {
                const now = Date.now(); const diff = now - simpleTimer.startTime + simpleTimer.elapsed;
                headerTimer.textContent = formatTime(diff);
            };
            globalTimerActions.start = () => {
                if(!simpleTimer.isRunning) {
                    simpleTimer.startTime = Date.now();
                    simpleTimer.interval = setInterval(updateTimer, 100);
                    simpleTimer.isRunning = true;
                }
            };
            globalTimerActions.stop = () => {
                if(simpleTimer.isRunning) {
                    clearInterval(simpleTimer.interval);
                    simpleTimer.elapsed += Date.now() - simpleTimer.startTime;
                    simpleTimer.isRunning = false;
                }
            };
            globalTimerActions.reset = () => {
                clearInterval(simpleTimer.interval);
                simpleTimer.isRunning = false;
                simpleTimer.elapsed = 0;
                headerTimer.textContent = "00:00";
            };
            const toggleTimer = () => {
                if(simpleTimer.isRunning) globalTimerActions.stop(); else globalTimerActions.start();
                vibrate();
            };
            const resetTimer = () => { globalTimerActions.reset(); showToast("Timer Reset"); vibrate(); };
            let tTimer; let tIsLong = false;
            const startT = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; tIsLong = false; tTimer = setTimeout(() => { tIsLong = true; resetTimer(); }, 600); };
            const endT = (e) => { if(e) e.preventDefault(); clearTimeout(tTimer); if(!tIsLong) toggleTimer(); };
            headerTimer.addEventListener('mousedown', startT); headerTimer.addEventListener('touchstart', startT, {passive:true});
            headerTimer.addEventListener('mouseup', endT); headerTimer.addEventListener('touchend', endT); headerTimer.addEventListener('mouseleave', () => clearTimeout(tTimer));
        }

        if(headerCounter) {
            headerCounter.textContent = simpleCounter.toString(); headerCounter.style.fontSize = "1.2rem";
            const updateCounter = () => { headerCounter.textContent = simpleCounter; };
            globalCounterActions.increment = () => { simpleCounter++; updateCounter(); };
            globalCounterActions.reset = () => { simpleCounter = 0; updateCounter(); };
            const increment = () => { globalCounterActions.increment(); vibrate(); };
            const resetCounter = () => { globalCounterActions.reset(); showToast("Counter Reset"); vibrate(); };
            let cTimer; let cIsLong = false;
            const startC = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; cIsLong = false; cTimer = setTimeout(() => { cIsLong = true; resetCounter(); }, 600); };
            const endC = (e) => { if(e) e.preventDefault(); clearTimeout(cTimer); if(!cIsLong) increment(); };
            headerCounter.addEventListener('mousedown', startC); headerCounter.addEventListener('touchstart', startC, {passive:true});
            headerCounter.addEventListener('mouseup', endC); headerCounter.addEventListener('touchend', endC); headerCounter.addEventListener('mouseleave', () => clearTimeout(cTimer));
        }

        if(headerMic) { 
            headerMic.onclick = () => { 
                if(!voiceModule) return;
                const isActive = !voiceModule.isListening;
                voiceModule.toggle(isActive);
                headerMic.classList.toggle('header-btn-active', isActive);
            }; 
        }

        if(headerGesture) {
            headerGesture.onclick = () => {
                isGesturePadVisible = !isGesturePadVisible;
                headerGesture.classList.toggle('header-btn-active', isGesturePadVisible);
                const gpWrap = document.getElementById('gesture-pad-wrapper');
                if(gpWrap) {
                    if(isGesturePadVisible) {
                        gpWrap.classList.remove('hidden');
                        showToast("Pad Visible 🗒️");
                    } else {
                        gpWrap.classList.add('hidden');
                        showToast("Pad Hidden");
                    }
                }
                renderUI();
            };
        }
        
        if(headerCam) { 
            headerCam.onclick = () => {
                const isArActive = document.body.classList.contains('ar-active');
                const newState = !isArActive;
                if (newState) {
                    document.body.classList.add('ar-active');
                    headerCam.classList.add('header-btn-active');
                    if (modules.sensor) {
                        modules.sensor.toggleCamera(true); 
                        if (modules.sensor.videoEl) {
                            modules.sensor.videoEl.style.display = 'block';
                            modules.sensor.videoEl.className = 'ar-background-video';
                        }
                    }
                    showToast("AR Mode ON 📸");
                } else {
                    document.body.classList.remove('ar-active');
                    headerCam.classList.remove('header-btn-active');
                    if (modules.sensor) {
                        modules.sensor.toggleCamera(false);
                        if (modules.sensor.videoEl) {
                            modules.sensor.videoEl.style.display = 'none';
                        }
                    }
                    showToast("AR Mode OFF");
                }
            }; 
        }
    } catch(e) {
        console.error("Listener Error:", e);
    }
// Keep screen awake
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            let wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock active');
            // Re-acquire if app minimizes and comes back
            document.addEventListener('visibilitychange', async () => {
                if (document.visibilityState === 'visible') {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            });
        }
    } catch (err) {
        console.log('Wake Lock not supported/allowed');
    }
}
// Call this when the app starts
requestWakeLock();
        
}
        
document.addEventListener('DOMContentLoaded', startApp);
