// utils.js
import { getCurrentProfileSettings } from './state.js';
import { DOM } from './dom.js';

let toastTimer = null;

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
    if (!profileSettings.isAudioEnabled || !('speechSynthesis'in window)) return;
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

export function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    if (!DOM.toastMessage || !DOM.toastNotification) return;
    DOM.toastMessage.textContent = message;
    DOM.toastNotification.classList.remove('opacity-0', '-translate-y-10');
    
    toastTimer = setTimeout(() => {
        DOM.toastNotification.classList.add('opacity-0', '-translate-y-10');
        toastTimer = null;
    }, 2000);
}
