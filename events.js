import { CONFIG } from './constants.js';
import { vibrate, showToast } from './utils.js';
import { 
    addValue, playDemo, handleBackspace, isDemoPlaying, setDemoPlaying, 
    isPlaybackPaused, setPlaybackPaused, playbackResumeCallback, setPlaybackResumeCallback 
} from './core.js';
import { renderUI } from './ui.js';

// --- LOCAL EVENT STATE ---
let timers = { speedDelete: null, initialDelay: null, longPress: null, settingsLongPress: null };
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

/**
 * Keeps the mobile screen from dimming while the app is active.
 */
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            let wakeLock = await navigator.wakeLock.request('screen');
            document.addEventListener('visibilitychange', async () => {
                if (document.visibilityState === 'visible') {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            });
        }
    } catch (err) {
        console.warn('Wake Lock not supported');
    }
}

export function initGlobalListeners() {
    const appSettings = getAppSettings();
    const modules = getModules();
    const blackoutState = getBlackoutState();

    // --- 1. KEYPAD BUTTONS ---
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
    });

    // --- 2. PLAY / AUTOPLAY TOGGLE ---
    document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
        let wasPlaying = false; let lpTriggered = false;
        const handleDown = (e) => { 
            if(e && e.cancelable) { e.preventDefault(); e.stopPropagation(); } 
            wasPlaying = isDemoPlaying; lpTriggered = false;
            if(wasPlaying) { 
                setDemoPlaying(false); 
                b.textContent = "▶"; 
                showToast("Playback Stopped 🛑", appSettings); 
                return; 
            }
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
            if (!wasPlaying && !lpTriggered) playDemo();
        };
        b.addEventListener('mousedown', handleDown); b.addEventListener('touchstart', handleDown, { passive: false });
        b.addEventListener('mouseup', handleUp); b.addEventListener('touchend', handleUp);
    });

    // --- 3. BACKSPACE & SPEED DELETE ---
    document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
        const startDelete = (e) => { 
            if(e) { e.preventDefault(); e.stopPropagation(); } 
            handleBackspace(); 
            if(!appSettings.isSpeedDeletingEnabled) return; 
            isDeleting = false; 
            timers.initialDelay = setTimeout(() => { 
                isDeleting = true; 
                timers.speedDelete = setInterval(() => handleBackspace(), CONFIG.SPEED_DELETE_INTERVAL); 
            }, CONFIG.SPEED_DELETE_DELAY); 
        }; 
        const stopDelete = () => { clearTimeout(timers.initialDelay); clearInterval(timers.speedDelete); }; 
        b.addEventListener('mousedown', startDelete); b.addEventListener('touchstart', startDelete, { passive: false }); 
        b.addEventListener('mouseup', stopDelete); b.addEventListener('touchend', stopDelete);
    });

    // --- 4. GLOBAL PAUSE / RESUME ---
    const handlePause = () => { if(isDemoPlaying) { setPlaybackPaused(true); showToast("Paused ⏸️", appSettings); } };
    const handleResume = () => { 
        if(isPlaybackPaused) { 
            setPlaybackPaused(false); 
            showToast("Resumed ▶️", appSettings); 
            if(playbackResumeCallback) { 
                const fn = playbackResumeCallback; 
                setPlaybackResumeCallback(null); 
                fn(); 
            } 
        } 
    };
    document.body.addEventListener('mousedown', handlePause); document.body.addEventListener('touchstart', handlePause, {passive:true});
    document.body.addEventListener('mouseup', handleResume); document.body.addEventListener('touchend', handleResume);

    // --- 5. BOSS MODE (SHAKE) ---
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

    // --- 6. HEADER TIMER & COUNTER ---
    setupHeaderControls(appSettings);

    requestWakeLock();
}

function setupHeaderControls(appSettings) {
    const headerTimer = document.getElementById('header-timer-btn');
    const headerCounter = document.getElementById('header-counter-btn');
        const headerHand = document.getElementById('header-hand-btn');

        if(headerHand) {
            headerHand.onclick = () => {
                const vision = modules.vision; // From getModules()
                if(!vision) return;
                
                const isActive = !vision.isActive;
                if (isActive) {
                    vision.start(); // This turns on the camera and AI
                    headerHand.classList.add('header-btn-active');
                    showToast("Hand Tracking ON 🖐️", appSettings);
                } else {
                    vision.stop();
                    headerHand.classList.remove('header-btn-active');
                    showToast("Hand Tracking OFF", appSettings);
                }
                vibrate(appSettings);
            };
        }
    
    if(headerTimer) {
        const formatTime = (ms) => {
            const totalSec = Math.floor(ms / 1000); 
            return `${Math.floor(totalSec / 60).toString().padStart(2,'0')}:${(totalSec % 60).toString().padStart(2,'0')}`;
        };
        const updateTimer = () => {
            const diff = Date.now() - simpleTimer.startTime + simpleTimer.elapsed;
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
        headerTimer.addEventListener('click', () => {
            if(simpleTimer.isRunning) globalTimerActions.stop(); else globalTimerActions.start();
            vibrate(appSettings);
        });
    }

    if(headerCounter) {
        const updateCounter = () => { headerCounter.textContent = simpleCounter.value; };
        globalCounterActions.increment = () => { simpleCounter.value++; updateCounter(); };
        globalCounterActions.reset = () => { simpleCounter.value = 0; updateCounter(); };
        headerCounter.addEventListener('click', () => { 
            globalCounterActions.increment(); 
            vibrate(appSettings); 
        });
    }
}
