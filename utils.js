import { DOM } from './dom.js';
import { getCurrentProfileSettings } from './state.js';

let toastTimer = null;

// --- DATA HELPERS ---
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

export function deepMerge(target, source) {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return target;

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]));
            }
        }
    }
    return { ...target, ...source };
}

// --- HARDWARE ---
export function vibrate(duration = 10) {
    const profileSettings = getCurrentProfileSettings();
    if (profileSettings && profileSettings.isHapticsEnabled && 'vibrate' in navigator) {
        try {
            navigator.vibrate(duration);
        } catch (e) {
            console.warn("Haptic feedback failed.", e);
        }
    }
}

export function speak(text) {
    const profileSettings = getCurrentProfileSettings();
    if (!profileSettings || !profileSettings.isAudioEnabled || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; 
        utterance.rate = 1.2; 
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error("Speech synthesis failed:", error);
    }
}

export function showToast(message, duration = 2000) {
    if (toastTimer) clearTimeout(toastTimer);
    if (!DOM.toastMessage || !DOM.toastNotification) return;
    DOM.toastMessage.textContent = message;
    DOM.toastNotification.classList.remove('opacity-0', '-translate-y-10');
    
    toastTimer = setTimeout(() => {
        DOM.toastNotification.classList.add('opacity-0', '-translate-y-10');
        toastTimer = null;
    }, duration);
}
