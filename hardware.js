// hardware.js
import { appSettings } from './state.js';

let wakeLockObj = null;

export async function applyWakeLock() {
    if (appSettings.isWakeLockEnabled && 'wakeLock' in navigator) {
        try {
            wakeLockObj = await navigator.wakeLock.request('screen');
            console.log('☀️ Wake Lock active');
        } catch (err) {
            console.log('Wake Lock denied:', err);
        }
    } else if (!appSettings.isWakeLockEnabled && wakeLockObj) {
        wakeLockObj.release().then(() => wakeLockObj = null);
        console.log('🌙 Wake Lock released');
    }
}

// Relock screen if user minimizes app and comes back
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && appSettings.isWakeLockEnabled) {
        applyWakeLock();
    }
});

export function applyUpsideDown() {
    const root = document.documentElement;
    if (appSettings.isUpsideDownEnabled) {
        // Force the flip at the highest possible level
        root.style.setProperty('transform', 'rotate(180deg)', 'important');
        root.style.setProperty('height', '100vh', 'important');
        root.style.setProperty('width', '100vw', 'important');
        root.style.setProperty('overflow', 'hidden', 'important');
    } else {
        root.style.removeProperty('transform');
        root.style.removeProperty('height');
        root.style.removeProperty('width');
        root.style.removeProperty('overflow');
    }
}

// Attach to window if legacy HTML inline handlers expect it
window.applyUpsideDown = applyUpsideDown;
