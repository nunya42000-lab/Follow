// settings-ui.jsu
import {
    PREMADE_VOICE_PRESETS
} from './audio.js';
import {
    PREMADE_THEMES
} from './themes.js';

export function initUI(manager) {

    // 1. Generic Dropdown Builder
    manager.populateDropdown = (id, options, currentVal) => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '';
        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.value;
            el.textContent = opt.label;
            if (String(opt.value) === String(currentVal)) el.selected = true;
            select.appendChild(el);
        });
    };

    // 2. Main Dropdown Initialization (Updated for dynamic increments)
    manager.initGeneralDropdowns = () => {
        // 1. UI Scale - uses uiScaleStep
        const scaleOptions = [];
        const scaleStep = (manager.appSettings.uiScaleStep || 0.10) * 100;
        for (let i = 50; i <= 500; i += scaleStep) {
            scaleOptions.push({
                label: `${i.toFixed(0)}%`,
                value: i
            });
        }
        manager.populateDropdown('ui-scale-select', scaleOptions, manager.appSettings.globalUiScale || 100);

        // 2. Playback Speed - uses speedStep
        const speedOptions = [];
        const speedStep = (manager.appSettings.speedStep || 0.05) * 100;
        for (let i = 75; i <= 150; i += speedStep) {
            speedOptions.push({
                label: `${i.toFixed(0)}%`,
                value: (i / 100).toFixed(2)
            });
        }
        manager.populateDropdown('playback-speed-select', speedOptions, (manager.appSettings.playbackSpeed || 1.0).toFixed(2));

        // 3. Sequence Size - uses sequenceStep
        const sizeOptions = [];
        const seqStep = manager.appSettings.sequenceStep || 1;
        for (let i = seqStep; i <= 50; i += seqStep) {
            // Values stored in rem (e.g., 0.1rem, 0.2rem)
            sizeOptions.push({
                label: `${i} Units`,
                value: `${(i * 0.1).toFixed(1)}rem`
            });
        }
        manager.populateDropdown('seq-size-select', sizeOptions, manager.appSettings.sequenceSize || '1rem');
    };
    // 2.5 Increment Selectors (Controls how much the other dropdowns jump)
    manager.initIncrementSelectors = () => {
        const pctOptions = [{
                label: '1%',
                value: 0.01
            },
            {
                label: '2%',
                value: 0.02
            },
            {
                label: '5%',
                value: 0.05
            },
            {
                label: '10%',
                value: 0.10
            }
        ];

        const unitOptions = [{
                label: '1 Unit',
                value: 1
            },
            {
                label: '2 Units',
                value: 2
            },
            {
                label: '5 Units',
                value: 5
            }
        ];

        manager.populateDropdown('speed-step-select', pctOptions, manager.appSettings.speedStep || 0.05);
        manager.populateDropdown('ui-step-select', pctOptions, manager.appSettings.uiScaleStep || 0.10);
        manager.populateDropdown('seq-step-select', unitOptions, manager.appSettings.sequenceStep || 1);
    };

    // 3. Theme & Config Dropdowns
    manager.populateThemeDropdown = () => {
        if (!manager.dom.themeSelect) return;
        manager.dom.themeSelect.innerHTML = '';

        const grp1 = document.createElement('optgroup');
        grp1.label = "Premade Themes";
        Object.keys(PREMADE_THEMES).forEach(k => {
            const el = document.createElement('option');
            el.value = k;
            el.textContent = PREMADE_THEMES[k].name;
            grp1.appendChild(el);
        });
        manager.dom.themeSelect.appendChild(grp1);

        const grp2 = document.createElement('optgroup');
        grp2.label = "Custom Themes";
        if (manager.appSettings.customThemes) {
            Object.keys(manager.appSettings.customThemes).forEach(k => {
                const el = document.createElement('option');
                el.value = k;
                el.textContent = manager.appSettings.customThemes[k].name;
                grp2.appendChild(el);
            });
        }
        manager.dom.themeSelect.appendChild(grp2);
        manager.dom.themeSelect.value = manager.appSettings.activeTheme || 'default';
    };

    manager.populateConfigDropdown = () => {
        [manager.dom.configSelect, manager.dom.quickConfigSelect].forEach(select => {
            if (!select) return;
            select.innerHTML = '';
            const grp = document.createElement('optgroup');
            grp.label = "Saved Configs";
            if (manager.appSettings.savedConfigs) {
                Object.keys(manager.appSettings.savedConfigs).forEach(k => {
                    const el = document.createElement('option');
                    el.value = k;
                    el.textContent = manager.appSettings.savedConfigs[k].name;
                    grp.appendChild(el);
                });
            }
            select.appendChild(grp);
            select.value = manager.appSettings.activeConfigId || '';
        });
    };

    // 4. Voice Dropdowns
    manager.populateVoicePresetDropdown = () => {
        if (!manager.dom.voicePresetSelect) return;
        manager.dom.voicePresetSelect.innerHTML = '';

        const grp1 = document.createElement('optgroup');
        grp1.label = "Built-in";
        Object.keys(PREMADE_VOICE_PRESETS).forEach(k => {
            const el = document.createElement('option');
            el.value = k;
            el.textContent = PREMADE_VOICE_PRESETS[k].name;
            grp1.appendChild(el);
        });
        manager.dom.voicePresetSelect.appendChild(grp1);

        const grp2 = document.createElement('optgroup');
        grp2.label = "My Voices";
        if (manager.appSettings.voicePresets) {
            Object.keys(manager.appSettings.voicePresets).forEach(k => {
                const el = document.createElement('option');
                el.value = k;
                el.textContent = manager.appSettings.voicePresets[k].name;
                grp2.appendChild(el);
            });
        }
        manager.dom.voicePresetSelect.appendChild(grp2);
        manager.dom.voicePresetSelect.value = manager.appSettings.activeVoicePresetId || 'standard';
    };

    manager.populateVoiceList = () => {
        if (!window.speechSynthesis) return;
        const voiceSelect = document.getElementById('voice-select');
        if (!voiceSelect) return;

        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;

        voiceSelect.innerHTML = '';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) option.textContent += ' -- DEFAULT';
            option.value = voice.name;
            voiceSelect.appendChild(option);
        });

        if (manager.appSettings.selectedVoice) {
            voiceSelect.value = manager.appSettings.selectedVoice;
        }
    };

    // 5. Mappings UI (Gestures)
    manager.populateMappingUI = () => {
        const gestures = [
            'tap', 'double_tap', 'triple_tap', 'long_tap',
            'tap_2f_any', 'double_tap_2f_any', 'triple_tap_2f_any', 'long_tap_2f_any',
            'tap_3f_any', 'double_tap_3f_any', 'triple_tap_3f_any', 'long_tap_3f_any',
            'swipe_nw', 'swipe_left', 'swipe_sw', 'swipe_down', 'swipe_se', 'swipe_right', 'swipe_ne', 'swipe_up',
            'square_cw', 'square_ccw', 'triangle_cw', 'triangle_ccw', 'u_shape_cw', 'u_shape_ccw', 'zigzag_right', 'zigzag_left'
        ];

        const generateList = (container, keys, prefix, defaultMap) => {
            if (!container) return;
            container.innerHTML = '';
            keys.forEach((key, i) => {
                const row = document.createElement('div');
                row.className = "flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700/50";

                const label = document.createElement('span');
                label.className = "text-white/80 text-xs font-mono";
                label.textContent = `${prefix} ${i + 1}`;

                const select = document.createElement('select');
                select.className = "bg-black text-primary-app text-xs p-1 rounded border border-gray-700 outline-none";
                select.dataset.key = key;

                gestures.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g.replace(/_/g, ' ').toUpperCase();
                    select.appendChild(opt);
                });

                const currentMap = manager.appSettings.gestureProfiles?.[manager.appSettings.activeGestureProfile || 'default']?.map || defaultMap;
                select.value = currentMap[key] ? currentMap[key].gesture : gestures[0];

                row.appendChild(label);
                row.appendChild(select);
                container.appendChild(row);
            });
        };

        const map9 = {
            'k9_1': {
                gesture: 'tap'
            },
            'k9_2': {
                gesture: 'double_tap'
            },
            'k9_3': {
                gesture: 'triple_tap'
            },
            'k9_4': {
                gesture: 'long_tap'
            },
            'k9_5': {
                gesture: 'tap_2f_any'
            },
            'k9_6': {
                gesture: 'double_tap_2f_any'
            },
            'k9_7': {
                gesture: 'triple_tap_2f_any'
            },
            'k9_8': {
                gesture: 'long_tap_2f_any'
            },
            'k9_9': {
                gesture: 'tap_3f_any'
            }
        };
        const map12 = {
            'k12_1': {
                gesture: 'tap'
            },
            'k12_2': {
                gesture: 'double_tap'
            },
            'k12_3': {
                gesture: 'triple_tap'
            },
            'k12_4': {
                gesture: 'long_tap'
            },
            'k12_5': {
                gesture: 'tap_2f_any'
            },
            'k12_6': {
                gesture: 'double_tap_2f_any'
            },
            'k12_7': {
                gesture: 'triple_tap_2f_any'
            },
            'k12_8': {
                gesture: 'long_tap_2f_any'
            },
            'k12_9': {
                gesture: 'tap_3f_any'
            },
            'k12_10': {
                gesture: 'double_tap_3f_any'
            },
            'k12_11': {
                gesture: 'triple_tap_3f_any'
            },
            'k12_12': {
                gesture: 'long_tap_3f_any'
            }
        };
        const mapPiano = {
            'piano_C': {
                gesture: 'swipe_nw'
            },
            'piano_D': {
                gesture: 'swipe_left'
            },
            'piano_E': {
                gesture: 'swipe_sw'
            },
            'piano_F': {
                gesture: 'swipe_down'
            },
            'piano_G': {
                gesture: 'swipe_se'
            },
            'piano_A': {
                gesture: 'swipe_right'
            },
            'piano_B': {
                gesture: 'swipe_ne'
            }
        };

        generateList(manager.dom.mapping9Container, Object.keys(map9), "Key", map9);
        generateList(manager.dom.mapping12Container, Object.keys(map12), "Key", map12);
        generateList(manager.dom.mappingPianoContainer, Object.keys(mapPiano), "Note", mapPiano);
    };

    // 6. Morse & Haptic Timing UI
    manager.populateMorseUI = () => {
        const container = manager.dom.morseContainer;
        if (!container) return;

        const timingSettings = [{
                label: 'Dot Length (ms)',
                key: 'morseDot',
                min: 20,
                max: 200,
                step: 5
            },
            {
                label: 'Dash Length (ms)',
                key: 'morseDash',
                min: 100,
                max: 600,
                step: 10
            },
            {
                label: 'Haptic Intensity',
                key: 'hapticStrength',
                min: 0,
                max: 1,
                step: 0.1
            }
        ];

        container.innerHTML = '<h4 class="text-xs font-bold text-white/40 mb-3 uppercase tracking-tighter">Haptic & Morse Timings</h4>';

        timingSettings.forEach(s => {
            const val = manager.appSettings[s.key] !== undefined ? manager.appSettings[s.key] : (s.max / 2);
            const row = document.createElement('div');
            row.className = "mb-4";
            row.innerHTML = `
                <div class="flex justify-between text-[10px] text-white/60 mb-1">
                    <span>${s.label}</span>
                    <span id="val-${s.key}">${val}</span>
                </div>
                <input type="range" data-key="${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" value="${val}" class="w-full accent-primary-app">
            `;
            container.appendChild(row);
        });
    };

    // 7. Tabs Integration
    manager.switchTab = (tabId) => {
        if (!manager.dom.tabs || !manager.dom.contents) return;

        manager.dom.tabs.forEach(t => {
            t.classList.remove('active', 'border-primary-app', 'text-primary-app');
            t.classList.add('border-transparent', 'text-white/60');
        });
        manager.dom.contents.forEach(c => c.classList.add('hidden'));

        const activeTab = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(tabId);

        if (activeTab) {
            activeTab.classList.remove('border-transparent', 'text-white/60');
            activeTab.classList.add('active', 'border-primary-app', 'text-primary-app');
        }
        if (activeContent) activeContent.classList.remove('hidden');
    };

    manager.setupTabSwipe = () => {
        const container = document.querySelector('.settings-content-area');
        if (!container) return;

        let startX = 0;
        container.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX, {
            passive: true
        });
        container.addEventListener('touchend', e => {
            if (e.target.closest('.no-swipe-zone') || e.target.closest('button')) return;
            let endX = e.changedTouches[0].screenX;
            if (startX - endX > 50) manager.swipeNextTab();
            if (endX - startX > 50) manager.swipePrevTab();
        }, {
            passive: true
        });
    };

    manager.swipeNextTab = () => {
        const tabs = Array.from(manager.dom.tabs);
        const activeIdx = tabs.findIndex(t => t.classList.contains('active'));
        if (activeIdx >= 0 && activeIdx < tabs.length - 1) {
            manager.switchTab(tabs[activeIdx + 1].dataset.tab);
        }
    };

    manager.swipePrevTab = () => {
        const tabs = Array.from(manager.dom.tabs);
        const activeIdx = tabs.findIndex(t => t.classList.contains('active'));
        if (activeIdx > 0) {
            manager.switchTab(tabs[activeIdx - 1].dataset.tab);
        }

        if (activeIdx > 0) {
            manager.switchTab(tabs[activeIdx - 1].dataset.tab);
        }

    };
}