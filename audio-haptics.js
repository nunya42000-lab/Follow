// audio-haptics.js
import { appSettings } from './state.js';
import { DICTIONARY } from './constants.js';

export function vibrate() { 
    if(appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10); 
}

export function vibrateMorse(val) { 
    if(!navigator.vibrate || !appSettings.isHapticMorseEnabled) return; 
    
    // 1. Resolve input to a key (1-12)
    let num = parseInt(val);
    if(isNaN(num)) {
        const map = { 'A':6, 'B':7, 'C':8, 'D':9, 'E':10, 'F':11, 'G':12 };
        num = map[val.toUpperCase()] || 0;
    }

    // 2. Get the user's mapping (or default)
    let patternStr = "";
    if (appSettings.morseMappings && appSettings.morseMappings[num]) {
        patternStr = appSettings.morseMappings[num];
    } else {
        // Default Fallback
        if (num <= 3) patternStr = ".".repeat(num);
        else if (num <= 6) patternStr = "-" + ".".repeat(num-3);
        else if (num <= 9) patternStr = "--" + ".".repeat(num-6);
        else patternStr = "---" + ".".repeat(num-10);
    }

    // 3. Tactile Preset Handler
    if (patternStr.startsWith('__')) {
        switch(patternStr) {
            case '__TICK__': navigator.vibrate(15); break;           // Sharp click
            case '__THUD__': navigator.vibrate(70); break;           // Heavy impact
            case '__BUZZ__': navigator.vibrate(400); break;          // Long warning
            case '__DBL__': navigator.vibrate([20, 50, 20]); break;  // Double tap
            case '__TRPL__': navigator.vibrate([20, 40, 20, 40, 20]); break; // Triple tap
            case '__HBEAT__': navigator.vibrate([60, 80, 150]); break; // Lub-dub
            case '__RAMP__': navigator.vibrate([10, 20, 40, 80]); break; // Revving up
        }
        return;
    }

    // 4. Standard Morse Logic
    const speed = appSettings.playbackSpeed || 1.0; 
    const factor = 1.0 / speed; 
    const DOT = 100 * factor, DASH = 300 * factor, GAP = 100 * factor; 
    let pattern = []; 
    for (let char of patternStr) {
        if(char === '.') pattern.push(DOT);
        if(char === '-') pattern.push(DASH);
        pattern.push(GAP);
    }
    if(pattern.length > 0) navigator.vibrate(pattern); 
}

export function speak(text) { 
    if(!appSettings.isAudioEnabled || !window.speechSynthesis) return; 
    window.speechSynthesis.cancel(); 
    
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    let msg = text;
    
    // Translation overrides
    if(text === "Correct") msg = dict.correct;
    if(text === "Wrong") msg = dict.wrong;
    if(text === "Stealth Active") msg = dict.stealth;
    
    const u = new SpeechSynthesisUtterance(msg); 
    if(lang === 'es') u.lang = 'es-MX'; else u.lang = 'en-US';
    
    if(appSettings.selectedVoice){
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(voice => voice.name === appSettings.selectedVoice);
        if(v) u.voice = v;
    } 
    
    let p = appSettings.voicePitch || 1.0; 
    let r = appSettings.voiceRate || 1.0; 
    u.volume = appSettings.voiceVolume || 1.0; 
    u.pitch = Math.min(2, Math.max(0.1, p));
    u.rate = Math.min(10, Math.max(0.1, r));
    window.speechSynthesis.speak(u); 
}
