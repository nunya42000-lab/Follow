// global-listeners.js
import {
    appSettings,
    timers,
    gestureState,
    blackoutState,
    simpleTimer,
    globalTimerActions,
    getState,
    saveState
} from './state.js';
import {
    showToast,
    disableInput
} from './ui-core.js';
import {
    playDemo,
    handleBackspace
} from './game-logic.js';
import {
    vibrate
} from './audio-haptics.js';
import {
    renderUI
} from './renderer.js';

export function initGlobalListeners() {
    // --- 1. Reset Round Counter Button ---
    document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => {
        b.addEventListener('click', () => {
            if (confirm("Reset Round Counter to 1?")) {
                const s = getState();
                s.currentRound = 1;
                s.sequences[0] = [];
                saveState();
                renderUI();
                showToast("Reset to Round 1");
            }
        });
    });

    // --- 2. Play / Autoplay Toggle Button ---
    document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
        let lpTriggered = false;
        let wasPlaying = false;

        const handleDown = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            lpTriggered = false;
            wasPlaying = false; // Add actual playback state check here if needed

            if (appSettings.isLongPressAutoplayEnabled) {
                timers.longPress = setTimeout(() => {
                    lpTriggered = true;
                    appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled;
                    showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`);
                    // ignoreNextClick logic would apply here
                    setTimeout(() => {}, 500);
                }, 800);
            }
        };

        const handleUp = (e) => {
            if (e && e.cancelable) {
                e.preventDefault();
                e.stopPropagation();
            }
            clearTimeout(timers.longPress);
            if (!wasPlaying && !lpTriggered) {
                playDemo();
            }
        };

        b.addEventListener('mousedown', handleDown);
        b.addEventListener('touchstart', handleDown, {
            passive: false
        });
        b.addEventListener('mouseup', handleUp);
        b.addEventListener('touchend', handleUp);
        b.addEventListener('mouseleave', () => clearTimeout(timers.longPress));
    });

    // --- 3. Header Timer Logic ---
    const headerTimer = document.getElementById('header-timer');
    if (headerTimer) {
        const updateTimer = () => {
            const ms = simpleTimer.elapsed + (Date.now() - simpleTimer.startTime);
            const s = Math.floor(ms / 1000);
            const m = Math.floor(s / 60);
            headerTimer.textContent = `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
        };

        globalTimerActions.start = () => {
            if (!simpleTimer.isRunning) {
                simpleTimer.startTime = Date.now();
                simpleTimer.interval = setInterval(updateTimer, 100);
                simpleTimer.isRunning = true;
            }
        };
        globalTimerActions.stop = () => {
            if (simpleTimer.isRunning) {
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
            if (simpleTimer.isRunning) globalTimerActions.stop();
            else globalTimerActions.start();
            vibrate();
        };

        const resetTimerAction = () => {
            globalTimerActions.reset();
            showToast("Timer Reset");
            vibrate();
        };

        let tTimer;
        let tIsLong = false;
        const startT = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            tIsLong = false;
            tTimer = setTimeout(() => {
                tIsLong = true;
                resetTimerAction();
            }, 600);
        };
        const endT = (e) => {
            if (e) e.preventDefault();
            clearTimeout(tTimer);
            if (!tIsLong) toggleTimer();
        };

        headerTimer.addEventListener('mousedown', startT);
        headerTimer.addEventListener('touchstart', startT, {
            passive: false
        });
        headerTimer.addEventListener('mouseup', endT);
        headerTimer.addEventListener('touchend', endT);
    }

    // --- 4. Boss Mode (Blackout) Device Shake Trigger ---
    let lastX = 0,
        lastY = 0,
        lastZ = 0;
    window.addEventListener('devicemotion', (e) => {
        if (!appSettings.isBlackoutFeatureEnabled) return;
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;

        const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
        if (delta > 25) {
            const now = Date.now();
            if (now - blackoutState.lastShake > 1000) {
                blackoutState.isActive = !blackoutState.isActive;
                document.body.classList.toggle('blackout-active', blackoutState.isActive);
                showToast(blackoutState.isActive ? "Boss Mode 🌑" : "Welcome Back");
                vibrate();
                renderUI();
                blackoutState.lastShake = now;
            }
        }
        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
    });

    // --- 5. Service Worker Reload (PWA Update Support) ---
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
            }
            window.location.reload(true);
        }
    });
}