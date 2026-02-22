import { PREMADE_VOICE_PRESETS } from './constants.js';

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

    // 2. Main Dropdown Initialization
    manager.initGeneralDropdowns = () => {
        // UI Scale: Range 50% to 500%
        const scaleOptions = [
            { label: 'Tiny (50%)', value: 0.5 },
            { label: 'Compact (80%)', value: 0.8 },
            { label: 'Standard (100%)', value: 1.0 },
            { label: 'Bigger Buttons (120%)', value: 1.2 },
            { label: 'Large (150%)', value: 1.5 },
            { label: 'Extra Large (200%)', value: 2.0 },
            { label: 'Huge (300%)', value: 3.0 },
            { label: 'Massive (500%)', value: 5.0 }
        ];
        manager.populateDropdown('ui-scale-select', scaleOptions, manager.appSettings.uiScale);

        // Playback Speed: Range 75% to 150%
        const speedOptions = [
            { label: 'Relaxed (0.75x)', value: 0.75 },
            { label: 'Steady (0.85x)', value: 0.85 },
            { label: 'Normal (1.0x)', value: 1.0 },
            { label: 'Quick (1.25x)', value: 1.25 },
            { label: 'Fast (1.5x)', value: 1.5 }
        ];
        manager.populateDropdown('playback-speed-select', speedOptions, manager.appSettings.playbackSpeed);
        
        manager.populateVoicePresetDropdown();
    };

    // 3. Voice Preset Dropdown
    manager.populateVoicePresetDropdown = () => {
        const select = manager.dom.voicePresetSelect;
        if (!select) return;
        
        select.innerHTML = '<option value="custom">-- Custom Voice --</option>';
        Object.keys(PREMADE_VOICE_PRESETS).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = PREMADE_VOICE_PRESETS[key].name;
            if (manager.appSettings.voicePreset === key) option.selected = true;
            select.appendChild(option);
        });
    };

    // 4. Full Input Mapping Logic
    manager.populateMappingUI = () => {
        const containers = {
            '9-key': manager.dom.mapping9Container,
            '12-key': manager.dom.mapping12Container,
            'piano': manager.dom.mappingPianoContainer
        };

        const gestureOptions = [
            'none', 'tap', 'double_tap', 'triple_tap', 'long_tap',
            'tap_2f_any', 'double_tap_2f_any', 'triple_tap_2f_any', 'long_tap_2f_any',
            'tap_3f_any', 'double_tap_3f_any', 'triple_tap_3f_any', 'long_tap_3f_any',
            'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right',
            'swipe_nw', 'swipe_ne', 'swipe_sw', 'swipe_se',
            'v_shape', 'i_shape', 'l_shape'
        ];

        Object.entries(containers).forEach(([mode, container]) => {
            if (!container) return;
            container.innerHTML = '';
            
            const keys = mode === '9-key' ? ['1','2','3','4','5','6','7','8','9'] :
                         mode === '12-key' ? ['1','2','3','4','5','6','7','8','9','10','11','12'] :
                         ['C','D','E','F','G','A','B'];
            
            const prefix = mode === '9-key' ? 'k9_' : mode === '12-key' ? 'k12_' : 'piano_';

            keys.forEach(label => {
                const mappingKey = `${prefix}${label}`;
                // Fallback to 'none' if undefined
                const current = manager.appSettings.mappings && manager.appSettings.mappings[mappingKey] 
                    ? manager.appSettings.mappings[mappingKey].gesture 
                    : 'none';
                
                const row = document.createElement('div');
                row.className = "flex items-center justify-between p-2 border-b border-white/5";
                row.innerHTML = `
                    <span class="text-sm font-medium text-white/70">Key ${label}</span>
                    <select data-mapping="${mappingKey}" class="mapping-select bg-zinc-900 text-xs text-primary-app border border-white/10 rounded px-1 py-1">
                        ${gestureOptions.map(g => `<option value="${g}" ${current === g ? 'selected' : ''}>${g.replace(/_/g, ' ')}</option>`).join('')}
                    </select>
                `;
                container.appendChild(row);
            });
        });
    };

    // 5. Morse & Haptic Timing UI
    manager.populateMorseUI = () => {
        const container = manager.dom.morseContainer;
        if (!container) return;

        const timingSettings = [
            { label: 'Dot Length (ms)', key: 'morseDot', min: 20, max: 200, step: 5 },
            { label: 'Dash Length (ms)', key: 'morseDash', min: 100, max: 600, step: 10 },
            { label: 'Haptic Intensity', key: 'hapticStrength', min: 0, max: 1, step: 0.1 }
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
                <input type="range" data-key="${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" value="${val}" 
                       class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-app">
            `;
            container.appendChild(row);
        });
    };
}
