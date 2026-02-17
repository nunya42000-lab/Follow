import { CONFIG } from './constants.js';
import { vibrate, showToast } from './utils.js';
import { addValue, playDemo, handleBackspace, isDemoPlaying, setDemoPlaying, isPlaybackPaused, setPlaybackPaused, playbackResumeCallback, setPlaybackResumeCallback } from './core.js';
import { renderUI } from './ui.js';

// --- LOCAL EVENT STATE ---
let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null, stealth: null, stealthAction: null, playback: null, tap: null };
let ignoreNextClick = false;
let isDeleting = false;

// --- DEPENDENCIES INJECTED FROM APP.JS ---
let getAppSettings, getState, getProfileSettings, saveState, getModules, getVoiceModule, getBlackoutState, getGesturePadVisible, setGesturePadVisible, simpleTimer, simpleCounter, globalTimerActions, globalCounterActions;

export function initEvents(deps) {
    getAppSettings = deps.getAppSettings;
    getState = deps.getState;
    getProfileSettings = deps.getProfileSettings;
    saveState = deps.saveState;
    getModules = deps.getModules;
    getVoiceModule = deps.getVoiceModule;
    getBlackoutState = deps.getBlackoutState;
    getGesturePadVisible = deps.getGesturePadVisible;
    setGesturePadVisible = deps.setGesturePadVisible;
    simpleTimer = deps.simpleTimer;
    simpleCounter = deps.simpleCounter;
    globalTimerActions = deps.globalTimerActions;
    globalCounterActions = deps.globalCounterActions;
}

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            let wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock active');
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

export function initGlobalListeners() {
    const appSettings = getAppSettings();
    const modules = getModules();
    const blackoutState = getBlackoutState();

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
                if(wasPlaying) { setDemoPlaying(false); b.textContent = "▶"; showToast("Playback Stopped 🛑", appSettings); return; }
                if (appSettings.isLongPressAutoplayEnabled) {
                    timers.longPress = setTimeout(() => {
                        lpTriggered = true;
                        appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled;
                        modules.settings.updateUIFromSettings();
                        showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`, appSettings);
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
            b.addEventListener('click', () => { if(confirm("Reset Round Counter to 1?")) { const s = getState(); s.currentRound = 1; s.sequences[0] = []; s.nextSequenceIndex = 0; renderUI(); saveState(); showToast("Reset to Round 1", appSettings); } });
        });
        
        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
            b.addEventListener('click', () => { if(isDemoPlaying) { setDemoPlaying(false); const pb = document.querySelector('button[data-action="play-demo"]'); if(pb) pb.textContent = "▶"; showToast("Playback Stopped 🛑", appSettings); return; } modules.settings.openSettings(); });
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
        
        const handlePause = (e) => { if(isDemoPlaying) { setPlaybackPaused(true); showToast("Paused ⏸️", appSettings); } };
        const handleResume = (e) => { if(isPlaybackPaused) { setPlaybackPaused(false); showToast("Resumed ▶️", appSettings); if(playbackResumeCallback) { const fn = playbackResumeCallback; setPlaybackResumeCallback(null); fn(); } } };
        document.body.addEventListener('mousedown', handlePause); document.body.addEventListener('touchstart', handlePause, {passive:true});
        document.body.addEventListener('mouseup', handleResume); document.body.addEventListener('touchend', handleResume);
        
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => { 
                // Need a dynamic import or reference to core.js startPracticeRound if needed here, 
                // but usually the modal handles it or we rely on the state to pick back up.
            });
        }

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
                    showToast(blackoutState.isActive ? "Boss Mode 🌑" : "Welcome Back", appSettings);
                    vibrate(appSettings);
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
                     if (val !== null) { addValue(val.toString()); vibrate(appSettings); }
                 }
             }, { passive: false });
        }
        
        // --- HEADER BUTTONS ---
        const headerTimer = document.getElementById('header-timer-btn');
        const headerCounter = document.getElementById('header-counter-btn');
        const headerMic = document.getElementById('header-mic-btn');
        const headerCam = document.getElementById('header-cam-btn');
        const headerGesture = document.getElementById('header-gesture-btn'); 
        const headerHand = document.getElementById('header-hand-btn');
        const headerStealth = document.getElementById('header-stealth-btn');

        if(headerHand) {
            headerHand.onclick = () => {
                if(!modules.vision) return;
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
        
        if(headerStealth) {
            headerStealth.onclick = () => {
                document.body.classList.toggle('hide-controls');
                const isActive = document.body.classList.contains('hide-controls');
                headerStealth.classList.toggle('header-btn-active', isActive);
                showToast(isActive ? "Inputs Only Active" : "Controls Visible", appSettings);
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
                vibrate(appSettings);
            };
            const resetTimer = () => { globalTimerActions.reset(); showToast("Timer Reset", appSettings); vibrate(appSettings); };
            let tTimer; let tIsLong = false;
            const startT = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; tIsLong = false; tTimer = setTimeout(() => { tIsLong = true; resetTimer(); }, 600); };
            const endT = (e) => { if(e) e.preventDefault(); clearTimeout(tTimer); if(!tIsLong) toggleTimer(); };
            headerTimer.addEventListener('mousedown', startT); headerTimer.addEventListener('touchstart', startT, {passive:true});
            headerTimer.addEventListener('mouseup', endT); headerTimer.addEventListener('touchend', endT); headerTimer.addEventListener('mouseleave', () => clearTimeout(tTimer));
        }

        if(headerCounter) {
            headerCounter.textContent = simpleCounter.toString(); headerCounter.style.fontSize = "1.2rem";
            const updateCounter = () => { headerCounter.textContent = simpleCounter; };
            globalCounterActions.increment = () => { simpleCounter.value++; updateCounter(); };
            globalCounterActions.reset = () => { simpleCounter.value = 0; updateCounter(); };
            const increment = () => { globalCounterActions.increment(); vibrate(appSettings); };
            const resetCounter = () => { globalCounterActions.reset(); showToast("Counter Reset", appSettings); vibrate(appSettings); };
            let cTimer; let cIsLong = false;
            const startC = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; cIsLong = false; cTimer = setTimeout(() => { cIsLong = true; resetCounter(); }, 600); };
            const endC = (e) => { if(e) e.preventDefault(); clearTimeout(cTimer); if(!cIsLong) increment(); };
            headerCounter.addEventListener('mousedown', startC); headerCounter.addEventListener('touchstart', startC, {passive:true});
            headerCounter.addEventListener('mouseup', endC); headerCounter.addEventListener('touchend', endC); headerCounter.addEventListener('mouseleave', () => clearTimeout(cTimer));
        }

        const voiceModule = getVoiceModule();
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
                let currentVisible = getGesturePadVisible();
                setGesturePadVisible(!currentVisible);
                headerGesture.classList.toggle('header-btn-active', !currentVisible);
                
                const gpWrap = document.getElementById('gesture-pad-wrapper');
                if(gpWrap) {
                    if(!currentVisible) {
                        gpWrap.classList.remove('hidden');
                        showToast("Pad Visible 🗒️", appSettings);
                    } else {
                        gpWrap.classList.add('hidden');
                        showToast("Pad Hidden", appSettings);
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
                    showToast("AR Mode ON 📸", appSettings);
                } else {
                    document.body.classList.remove('ar-active');
                    headerCam.classList.remove('header-btn-active');
                    if (modules.sensor) {
                        modules.sensor.toggleCamera(false);
                        if (modules.sensor.videoEl) {
                            modules.sensor.videoEl.style.display = 'none';
                        }
                    }
                    showToast("AR Mode OFF", appSettings);
                }
            }; 
        }

    } catch(e) {
        console.error("Listener Error:", e);
    }

    requestWakeLock();
}
