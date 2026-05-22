//settings-features.js
/* global SpeechSynthesisUtterance */
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
    PREMADE_THEMES,
    CRAYONS
} from './themes.js';
import {
    PREMADE_VOICE_PRESETS
} from './audio.js';
import {
    LANG
} from './i18n.js';

export function initFeatures(manager) {

    // 1. General App Updates & UI Sync
    manager.updateApp = () => {
        if (manager.callbacks && manager.callbacks.onSettingsChange) {
            manager.callbacks.onSettingsChange(manager.appSettings);
        }
    };

    manager.updateUIFromSettings = () => {
        if (manager.dom.voicePitch) manager.dom.voicePitch.value = manager.appSettings.voicePitch;
        if (manager.dom.voiceRate) manager.dom.voiceRate.value = manager.appSettings.voiceRate;
        if (manager.dom.voiceVolume) manager.dom.voiceVolume.value = manager.appSettings.voiceVolume;
    };

    manager.updateHeaderVisibility = () => {
        const header = document.querySelector('header');
        const gestureBtn = document.getElementById('header-gesture-btn');
        const stealthBtn = document.getElementById('header-stealth-btn');
        const handBtn = document.getElementById('header-hand-btn');

        if (!header) return;

        if (gestureBtn) gestureBtn.style.display = manager.appSettings.isGestureInputEnabled ? 'flex' : 'none';
        if (stealthBtn) stealthBtn.style.display = manager.appSettings.stealth1KeyMode ? 'flex' : 'none';
        if (handBtn) handBtn.style.display = manager.appSettings.isHandGesturesEnabled ? 'flex' : 'none';
    };

    // 2. Firebase Database Sync
    manager.syncToFirebase = async (db, userId, dataObj) => {
        try {
            const settingsRef = collection(db, `users/${userId}/settings_backups`);
            await addDoc(settingsRef, {
                ...dataObj,
                timestamp: serverTimestamp()
            });
            console.log("Settings synced to Firebase successfully.");
        } catch (e) {
            console.error("Error syncing to Firebase: ", e);
        }
    };

    // 3. Prompt Generator (AI Assistance)
    manager.generatePrompt = () => {
        if (!manager.dom.promptDisplay) return;
        const ps = manager.appSettings.runtimeSettings || {};
        const max = ps.currentInput === 'key12' ? 12 : 9;
        const speed = manager.appSettings.playbackSpeed || 1.0;
        const machines = ps.machineCount || 1;
        const chunk = ps.simonChunkSize || 3;

        const promptText = `Act as an expert sequence tracker. I am playing a game with ${machines} machines. The input uses a ${max}-key layout. The chunk size is ${chunk} and the playback speed is ${speed}x. Please provide the optimal strategy based on these parameters.`;

        manager.dom.promptDisplay.textContent = promptText;
        manager.dom.promptDisplay.style.opacity = '0.5';
        setTimeout(() => manager.dom.promptDisplay.style.opacity = '1', 150);
    };

    // 4. Voice & Language Features
    manager.applyVoicePreset = (id) => {
        let preset = manager.appSettings.voicePresets?.[id] || PREMADE_VOICE_PRESETS[id] || PREMADE_VOICE_PRESETS.standard;
        manager.appSettings.voicePitch = preset.pitch;
        manager.appSettings.voiceRate = preset.rate;
        manager.appSettings.voiceVolume = preset.volume;
        manager.updateUIFromSettings();
        if (manager.callbacks && manager.callbacks.onSave) manager.callbacks.onSave();
    };

    manager.testVoice = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance("Testing 1 2 3.");
            if (manager.appSettings.selectedVoice) {
                const v = window.speechSynthesis.getVoices().find(voice => voice.name === manager.appSettings.selectedVoice);
                if (v) u.voice = v;
            }
            u.pitch = parseFloat(manager.dom.voicePitch.value || 1);
            u.rate = parseFloat(manager.dom.voiceRate.value || 1);
            u.volume = parseFloat(manager.dom.voiceVolume.value || 1);
            window.speechSynthesis.speak(u);
        }
    };

    manager.setLanguage = (lang) => {
        if (typeof LANG === 'undefined') return;
        const t = LANG[lang];
        if (!t) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
        manager.appSettings.generalLanguage = lang;
        if (manager.dom.quickLang) manager.dom.quickLang.value = lang;
        if (manager.dom.generalLang) manager.dom.generalLang.value = lang;
        if (manager.callbacks && manager.callbacks.onSave) manager.callbacks.onSave();
    };

    // 5. Modals & Overlays (Open/Close Logic)
    manager.openShare = () => {
        if (manager.dom.settingsModal) manager.dom.settingsModal.classList.add('hidden');
        if (manager.dom.shareModal) manager.dom.shareModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    };
    manager.closeShare = () => {
        if (manager.dom.shareModal) manager.dom.shareModal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    };

    manager.openSetup = () => {
        if (manager.dom.setupModal) manager.dom.setupModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    };
    manager.closeSetup = () => {
        if (manager.dom.setupModal) manager.dom.setupModal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    };

    manager.openCalibration = () => {
        if (manager.dom.calibModal) manager.dom.calibModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        if (manager.sensorEngine && manager.sensorEngine.startCalibration) manager.sensorEngine.startCalibration();
    };
    manager.closeCalibration = () => {
        if (manager.dom.calibModal) manager.dom.calibModal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    };

    manager.openRedeem = () => {
        if (manager.dom.redeemModal) manager.dom.redeemModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    };
    manager.closeRedeem = () => {
        if (manager.dom.redeemModal) manager.dom.redeemModal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    };

    manager.openDonate = () => {
        if (manager.dom.donateModal) manager.dom.donateModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    };
    manager.closeDonate = () => {
        if (manager.dom.donateModal) manager.dom.donateModal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    };

    manager.openHelp = () => {
        if (manager.dom.helpModal) manager.dom.helpModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    };
    manager.closeHelp = () => {
        if (manager.dom.helpModal) manager.dom.helpModal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    };

    // 6. Theme Editor & Core Color Operations
    manager.applyColorToTarget = (hex) => {
        if (!manager.tempTheme) return;
        manager.tempTheme[manager.currentTargetKey] = hex;
        const [h, s, l] = manager.hexToHsl(hex);
        if (manager.dom.ftHue) manager.dom.ftHue.value = h;
        if (manager.dom.ftSat) manager.dom.ftSat.value = s;
        if (manager.dom.ftLit) manager.dom.ftLit.value = l;
        if (manager.dom.ftPreview) manager.dom.ftPreview.style.backgroundColor = hex;

        if (manager.dom.ftContainer && manager.dom.ftContainer.classList.contains('hidden')) {
            manager.dom.ftContainer.classList.remove('hidden');
            if (manager.dom.ftToggle) manager.dom.ftToggle.style.display = 'none';
        }
        manager.updatePreview();
    };

    manager.updateColorFromSliders = () => {
        if (!manager.dom.ftHue || !manager.dom.ftSat || !manager.dom.ftLit) return;
        const h = parseInt(manager.dom.ftHue.value);
        const s = parseInt(manager.dom.ftSat.value);
        const l = parseInt(manager.dom.ftLit.value);
        const hex = manager.hslToHex(h, s, l);

        if (manager.dom.ftPreview) manager.dom.ftPreview.style.backgroundColor = hex;
        if (manager.tempTheme) {
            manager.tempTheme[manager.currentTargetKey] = hex;
            manager.updatePreview();
        }
    };

    manager.openThemeEditor = () => {
        if (!manager.dom.editorModal) return;
        const activeId = manager.appSettings.activeTheme;
        const source = (manager.appSettings.customThemes && manager.appSettings.customThemes[activeId]);
        const theme = userTheme ||
            PREMADE_THEMES[activeId] ||
            PREMADE_THEMES['default'];
        manager.tempTheme = {
            ...source
        };
        if (manager.dom.edName) manager.dom.edName.value = manager.tempTheme.name;

        if (manager.dom.targetBtns) {
            manager.dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app'));
            if (manager.dom.targetBtns.length > 2) manager.dom.targetBtns[2].classList.add('active', 'bg-primary-app');
        }

        manager.currentTargetKey = 'bubble';

        if (manager.tempTheme.bubble) {
            const [h, s, l] = manager.hexToHsl(manager.tempTheme.bubble);
            if (manager.dom.ftHue) manager.dom.ftHue.value = h;
            if (manager.dom.ftSat) manager.dom.ftSat.value = s;
            if (manager.dom.ftLit) manager.dom.ftLit.value = l;
            if (manager.dom.ftPreview) manager.dom.ftPreview.style.backgroundColor = manager.tempTheme.bubble;
        }

        manager.updatePreview();
        manager.dom.editorModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    };

    manager.updatePreview = () => {
        const t = manager.tempTheme;
        if (!t || !manager.dom.edPreview) return;
        manager.dom.edPreview.style.backgroundColor = t.bgMain;
        manager.dom.edPreview.style.color = t.text;

        if (manager.dom.edPreviewCard) {
            manager.dom.edPreviewCard.style.backgroundColor = t.bgCard;
            manager.dom.edPreviewCard.style.color = t.text;
            manager.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)';
        }

        if (manager.dom.edPreviewBtn) {
            manager.dom.edPreviewBtn.style.backgroundColor = t.bubble;
            manager.dom.edPreviewBtn.style.color = t.text;
        }
    };

    // 7. Math & Color Conversions
    manager.hexToHsl = (hex) => {
        if (!hex) return [0, 0, 0];
        hex = hex.replace(/^#/, '');
        let r = 0,
            g = 0,
            b = 0;
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        r /= 255;
        g /= 255;
        b /= 255;
        let max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) h = s = 0;
        else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    };

    manager.hslToHex = (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };
}