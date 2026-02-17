import { DICTIONARY } from './constants.js';
import { PREMADE_THEMES } from './settings.js';

export function vibrate(appSettings) { 
    if(appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10); 
}

export function vibrateMorse(val, appSettings) { 
    if(!navigator.vibrate || !appSettings.isHapticMorseEnabled) return; 
    let num = parseInt(val);
    if(isNaN(num)) {
        const map = { 'A':6, 'B':7, 'C':8, 'D':9, 'E':10, 'F':11, 'G':12 };
        num = map[val.toUpperCase()] || 0;
    }
    let patternStr = "";
    if (appSettings.morseMappings && appSettings.morseMappings[num]) {
        patternStr = appSettings.morseMappings[num];
    } else {
        if (num <= 3) patternStr = ".".repeat(num);
        else if (num <= 6) patternStr = "-" + ".".repeat(num-3);
        else if (num <= 9) patternStr = "--" + ".".repeat(num-6);
        else patternStr = "---" + ".".repeat(num-10);
    }
    if (patternStr.startsWith('__')) {
        switch(patternStr) {
            case '__TICK__': navigator.vibrate(15); break;
            case '__THUD__': navigator.vibrate(70); break;
            case '__BUZZ__': navigator.vibrate(400); break;
            case '__DBL__': navigator.vibrate([20, 50, 20]); break;
            case '__TRPL__': navigator.vibrate([20, 40, 20, 40, 20]); break;
            case '__HBEAT__': navigator.vibrate([60, 80, 150]); break;
            case '__RAMP__': navigator.vibrate([10, 20, 40, 80]); break;
        }
        return;
    }
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

export function speak(text, appSettings) { 
    if(!appSettings.isAudioEnabled || !window.speechSynthesis) return; 
    window.speechSynthesis.cancel(); 
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    let msg = text;
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

export function showToast(msg, appSettings) { 
    const lang = appSettings.generalLanguage || 'en';
    const dict = DICTIONARY[lang] || DICTIONARY['en'];
    if(msg === "Reset to Round 1") msg = dict.reset;
    if(msg === "Playback Stopped 🛑") msg = dict.stop;
    if(msg === "Stealth Active") msg = dict.stealth;
    const t = document.getElementById('toast-notification'); 
    const m = document.getElementById('toast-message'); 
    if(!t || !m) return; 
    m.textContent = msg; 
    t.classList.remove('opacity-0', '-translate-y-10'); 
    setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000); 
}

export function applyTheme(themeKey, appSettings) { 
    const body = document.body; 
    body.className = body.className.replace(/theme-\w+/g, ''); 
    let t = appSettings.customThemes[themeKey]; 
    if (!t && PREMADE_THEMES[themeKey]) t = PREMADE_THEMES[themeKey]; 
    if (!t) t = PREMADE_THEMES['default']; 
    body.style.setProperty('--primary', t.bubble); 
    body.style.setProperty('--bg-main', t.bgMain); 
    body.style.setProperty('--bg-modal', t.bgCard); 
    body.style.setProperty('--card-bg', t.bgCard); 
    body.style.setProperty('--seq-bubble', t.bubble); 
    body.style.setProperty('--btn-bg', t.btn); 
    body.style.setProperty('--bg-input', t.bgMain); 
    body.style.setProperty('--text-main', t.text); 
    const isDark = parseInt(t.bgCard.replace('#',''), 16) < 0xffffff / 2; 
    body.style.setProperty('--border', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'); 
                           }
