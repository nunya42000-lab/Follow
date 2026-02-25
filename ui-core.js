// ui-core.js
import { appSettings } from './state.js';
import { DICTIONARY } from './constants.js';
import { PREMADE_THEMES } from './settings.js';
import { renderUI } from './renderer.js'; // Imported to refresh the grid after chrome updates

export function showToast(msg) { 
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

export function applyTheme(themeKey) { 
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

export function updateAllChrome() { 
    applyTheme(appSettings.activeTheme); 
    document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`; 
    renderUI(); 
}

export function disableInput(disabled) { 
    const footer = document.getElementById('input-footer'); 
    if(!footer) return; 
    if(disabled) { 
        footer.classList.add('opacity-50', 'pointer-events-none'); 
    } else { 
        footer.classList.remove('opacity-50', 'pointer-events-none'); 
    } 
}
