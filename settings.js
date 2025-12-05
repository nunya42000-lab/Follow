// settings.js
export const PREMADE_THEMES = {
    'default': { name: "Default Dark", bgMain: "#000000", bgCard: "#121212", bubble: "#4f46e5", btn: "#1a1a1a", text: "#e5e5e5" },
    'light': { name: "Light Mode", bgMain: "#f3f4f6", bgCard: "#ffffff", bubble: "#4f46e5", btn: "#e5e7eb", text: "#111827" },
    'matrix': { name: "The Matrix", bgMain: "#000000", bgCard: "#0f2b0f", bubble: "#003300", btn: "#001100", text: "#00ff41" },
    'dracula': { name: "Vampire", bgMain: "#282a36", bgCard: "#44475a", bubble: "#ff5555", btn: "#6272a4", text: "#f8f8f2" },
    'neon': { name: "Neon City", bgMain: "#0b0014", bgCard: "#180029", bubble: "#d900ff", btn: "#24003d", text: "#00eaff" },
    'retro': { name: "Retro PC", bgMain: "#fdf6e3", bgCard: "#eee8d5", bubble: "#cb4b16", btn: "#93a1a1", text: "#586e75" },
    'steampunk': { name: "Steampunk", bgMain: "#100c08", bgCard: "#2b1d16", bubble: "#b87333", btn: "#422a18", text: "#d5c5a3" },
    'ocean': { name: "Ocean Blue", bgMain: "#0f172a", bgCard: "#1e293b", bubble: "#0ea5e9", btn: "#334155", text: "#e2e8f0" },
    'cyber': { name: "Cyberpunk", bgMain: "#050505", bgCard: "#1a1625", bubble: "#d946ef", btn: "#2d1b4e", text: "#f0abfc" },
    'volcano': { name: "Volcano", bgMain: "#1a0505", bgCard: "#450a0a", bubble: "#b91c1c", btn: "#7f1d1d", text: "#fecaca" },
    'forest': { name: "Deep Forest", bgMain: "#021408", bgCard: "#064e3b", bubble: "#166534", btn: "#14532d", text: "#dcfce7" },
    'sunset': { name: "Sunset", bgMain: "#1a021c", bgCard: "#701a75", bubble: "#fb923c", btn: "#86198f", text: "#fff7ed" },
    'halloween': { name: "Halloween 🎃", bgMain: "#1a0500", bgCard: "#2e0a02", bubble: "#ff6600", btn: "#4a1005", text: "#ffbf00" },
    'liberty': { name: "Liberty 🗽", bgMain: "#0d1b1e", bgCard: "#1c3f44", bubble: "#2e8b57", btn: "#143136", text: "#d4af37" },
    'shamrock': { name: "Shamrock ☘️", bgMain: "#021a02", bgCard: "#053305", bubble: "#00c92c", btn: "#0a450a", text: "#e0ffe0" },
    'midnight': { name: "Midnight 🌑", bgMain: "#000000", bgCard: "#111111", bubble: "#3b82f6", btn: "#1f1f1f", text: "#ffffff" },
    'candy': { name: "Candy 🍬", bgMain: "#260516", bgCard: "#4a0a2f", bubble: "#ff69b4", btn: "#701046", text: "#ffe4e1" },
    'bumblebee': { name: "Bumblebee 🐝", bgMain: "#1a1600", bgCard: "#332b00", bubble: "#fbbf24", btn: "#4d4100", text: "#ffffff" },
    'blueprint': { name: "Blueprint 📐", bgMain: "#0f2e52", bgCard: "#1b4d8a", bubble: "#ffffff", btn: "#2563eb", text: "#ffffff" },
    'rose': { name: "Rose Gold 🌹", bgMain: "#1f1212", bgCard: "#3d2323", bubble: "#e1adac", btn: "#5c3333", text: "#ffe4e1" },
    'hacker': { name: "Terminal 💻", bgMain: "#0c0c0c", bgCard: "#1a1a1a", bubble: "#00ff00", btn: "#0f380f", text: "#00ff00" },
    'royal': { name: "Royal 👑", bgMain: "#120024", bgCard: "#2e0059", bubble: "#9333ea", btn: "#4c1d95", text: "#ffd700" }
};

export const PREMADE_VOICE_PRESETS = {
    'standard': { name: "Standard", pitch: 1.0, rate: 1.0, volume: 1.0 },
    'speed': { name: "Speed Reader", pitch: 1.0, rate: 1.8, volume: 1.0 },
    'slow': { name: "Slow Motion", pitch: 0.9, rate: 0.6, volume: 1.0 },
    'deep': { name: "Deep Voice", pitch: 0.6, rate: 0.9, volume: 1.0 },
    'high': { name: "Chipmunk", pitch: 1.8, rate: 1.1, volume: 1.0 },
    'robot': { name: "Robot", pitch: 0.5, rate: 0.8, volume: 1.0 },
    'announcer': { name: "Announcer", pitch: 0.8, rate: 1.1, volume: 1.0 },
    'whisper': { name: "Quiet", pitch: 1.2, rate: 0.8, volume: 0.4 }
};

const CRAYONS = ["#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", "#B0B7C6", "#AF4035", "#F5F5F5", "#FEFEFA", "#FFFAFA", "#F0F8FF", "#F8F8FF", "#F5F5DC", "#FFFACD", "#FAFAD2", "#FFFFE0", "#FFFFF0", "#FFFF00", "#FFEFD5", "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", "#BDB76B", "#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#FF00FF", "#BA55D3", "#9370DB", "#8A2BE2", "#9400D3", "#9932CC", "#8B008B", "#800000", "#4B0082", "#483D8B", "#6A5ACD", "#7B68EE", "#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", "#6B8E23", "#808000", "#556B2F", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#00FFFF", "#00CED1", "#40E0D0", "#48D1CC", "#AFEEEE", "#7FFFD4", "#B0E0E6", "#5F9EA0", "#4682B4", "#6495ED", "#00BFFF", "#1E90FF", "#ADD8E6", "#87CEEB", "#87CEFA", "#191970", "#000080", "#0000FF", "#0000CD", "#4169E1", "#8A2BE2", "#4B0082", "#FFE4C4", "#FFEBCD", "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F", "#F4A460", "#DAA520", "#B8860B", "#CD853F", "#D2691E", "#8B4513", "#A0522D", "#A52A2A", "#800000", "#FFA07A", "#FA8072", "#E9967A", "#F08080", "#CD5C5C", "#DC143C", "#B22222", "#FF0000", "#FF4500", "#FF6347", "#FF7F50", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00", "#808000", "#556B2F", "#6B8E23", "#999999", "#808080", "#666666", "#333333", "#222222", "#111111", "#0A0A0A", "#000000"];
const TEXT = {
    'en': {
        title: "Settings", inputsHaptics: "Inputs & Haptics", autoSensors: "Auto & Sensors", appearance: "Appearance & Voice", profile: "Profile & Game", gestures: "Blackout Gesture Mapping (1-12)", morse: "Haptic Morse Mapping (1-12)",
        inputMode: "Input Mode", sequenceLen: "Sequence Length", machineCount: "Machine Count", simonChunk: "Simon Chunk Size", delay: "Inter-Sequence Delay (ms)",
        autoplay: "Autoplay Sequence", haptics: "Haptic Feedback (Taps)", morseHaptics: "Haptic Morse Feedback", speedDelete: "Speed Delete (Long Press)", longPressAutoplay: "Long Press Play/Autoplay", uniqueAutoClear: "Unique Rounds Auto-Clear",
        blackout: "Enable Stealth Mode (Shake)", blackoutGestures: "Use Gestures in Stealth Mode", stealth1Key: "Enable 1-Key Stealth Toggle",
        uiScale: "Global UI Scale", seqScale: "Sequence Bubble Scale", theme: "Active Theme", customTheme: "Custom Themes", playbackSpeed: "Playback Speed",
        language: "Language", voicePreset: "Voice Preset", voice: "Speech Voice", pitch: "Pitch", rate: "Rate", volume: "Volume",
        audioSens: "Audio Sensitivity (dB)", camSens: "Camera Sensitivity (Diff)",
        profileName: "Profile Name", saveProfile: "Save Profile", saveNew: "Save as New Profile", deleteProfile: "Delete Profile", resetApp: "Reset App",
        modes: { simon: "Simon Mode", unique: "Unique Rounds" },
        inputs: { key9: "9-Key Pad", key12: "12-Key Pad", piano: "Piano" },
        resizeModes: { global: "Global (All UI)", sequence: "Sequence Bubbles Only" },
        gesturesList: {
            'none': 'None', 'swipe_up': '1F Swipe Up', 'swipe_right': '1F Swipe Right', 'swipe_down': '1F Swipe Down', 'swipe_left': '1F Swipe Left',
            'tap': '1F Tap', '2f_swipe_up': '2F Swipe Up', '2f_swipe_right': '2F Swipe Right', '2f_swipe_down': '2F Swipe Down', '2f_swipe_left': '2F Swipe Left',
            '2f_tap': '2F Tap', 'double_tap': 'Double Tap', 'long_press': 'Long Press'
        }
    },
    'es': {
        title: "Configuración", inputsHaptics: "Entradas y Hápticos", autoSensors: "Auto y Sensores", appearance: "Apariencia y Voz", profile: "Perfil y Juego", gestures: "Mapeo de Gestos de Apagón (1-12)", morse: "Mapeo Háptico Morse (1-12)",
        inputMode: "Modo de Entrada", sequenceLen: "Longitud de Secuencia", machineCount: "Nro. de Máquinas", simonChunk: "Bloque Simon", delay: "Retraso entre Secuencias (ms)",
        autoplay: "Reproducción Automática", haptics: "Respuesta Háptica (Taps)", morseHaptics: "Respuesta Háptica Morse", speedDelete: "Borrado Rápido (Pulsación Larga)", longPressAutoplay: "Pulsación Larga Auto/Play", uniqueAutoClear: "Auto-Borrado Rondas Únicas",
        blackout: "Habilitar Modo Sigilo (Agitar)", blackoutGestures: "Usar Gestos en Modo Sigilo", stealth1Key: "Habilitar 1-Tecla Sigilo",
        uiScale: "Escala Global de UI", seqScale: "Escala de Burbujas de Secuencia", theme: "Tema Activo", customTheme: "Temas Personalizados", playbackSpeed: "Velocidad de Reproducción",
        language: "Idioma", voicePreset: "Preajuste de Voz", voice: "Voz de Habla", pitch: "Tono", rate: "Velocidad", volume: "Volumen",
        audioSens: "Sensibilidad de Audio (dB)", camSens: "Sensibilidad de Cámara (Diff)",
        profileName: "Nombre del Perfil", saveProfile: "Guardar Perfil", saveNew: "Guardar como Nuevo", deleteProfile: "Eliminar Perfil", resetApp: "Restablecer App",
        modes: { simon: "Modo Simon", unique: "Rondas Únicas" },
        inputs: { key9: "Pad de 9 Teclas", key12: "Pad de 12 Teclas", piano: "Piano" },
        resizeModes: { global: "Global (Toda la UI)", sequence: "Solo Burbujas de Secuencia" },
        gesturesList: {
            'none': 'Ninguno', 'swipe_up': '1D Deslizar Arriba', 'swipe_right': '1D Deslizar Derecha', 'swipe_down': '1D Deslizar Abajo', 'swipe_left': '1D Deslizar Izquierda',
            'tap': '1D Tocar', '2f_swipe_up': '2D Deslizar Arriba', '2f_swipe_right': '2D Deslizar Derecha', '2f_swipe_down': '2D Deslizar Abajo', '2f_swipe_left': '2D Deslizar Izquierda',
            '2f_tap': '2D Tocar', 'double_tap': 'Doble Tocar', 'long_press': 'Pulsación Larga'
        }
    }
};

const GESTURE_OPTIONS = [
    { value: 'none', labelKey: 'none' },
    { value: 'swipe_up', labelKey: 'swipe_up' }, { value: 'swipe_right', labelKey: 'swipe_right' },
    { value: 'swipe_down', labelKey: 'swipe_down' }, { value: 'swipe_left', labelKey: 'swipe_left' },
    { value: 'tap', labelKey: 'tap' }, { value: '2f_swipe_up', labelKey: '2f_swipe_up' },
    { value: '2f_swipe_right', labelKey: '2f_swipe_right' }, { value: '2f_swipe_down', labelKey: '2f_swipe_down' },
    { value: '2f_swipe_left', labelKey: '2f_swipe_left' }, { value: '2f_tap', labelKey: '2f_tap' },
    { value: 'double_tap', labelKey: 'double_tap' }, { value: 'long_press', labelKey: 'long_press' }
];

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings;
        this.callbacks = callbacks;
        this.sensorEngine = sensorEngine;
        this.voices = [];
        this.dict = TEXT['en'];
        this.currentTab = 'inputsHaptics'; // Start on the first tab
        this.initDOM();
        this.setLanguage(this.appSettings.generalLanguage || 'en');
        window.speechSynthesis.onvoiceschanged = () => {
            this.voices = window.speechSynthesis.getVoices();
            this.renderVoiceSelection();
        };
        this.voices = window.speechSynthesis.getVoices();
        
        // Initial setup for profile name input
        const profileNameInput = document.getElementById('profile-name-input');
        if(profileNameInput) {
            profileNameInput.value = this.appSettings.profiles[this.appSettings.activeProfileId].name;
            profileNameInput.addEventListener('change', () => this.callbacks.onProfileRename(profileNameInput.value));
        }
        
        // Setup Practice Mode toggle
        const practiceToggle = document.getElementById('toggle-practice-mode');
        if(practiceToggle) {
            practiceToggle.checked = this.appSettings.isPracticeModeEnabled;
            practiceToggle.addEventListener('change', (e) => {
                this.appSettings.isPracticeModeEnabled = e.target.checked;
                this.callbacks.onUpdate('practice_mode_toggle');
                // Reset mode to simon if in practice mode and piano is active, as practice mode doesn't fully support piano keys 1-5 currently
                if (e.target.checked && this.appSettings.runtimeSettings.currentInput === 'piano') {
                    this.appSettings.runtimeSettings.currentInput = 'key12';
                    this.callbacks.onUpdate('input_mode_change');
                }
            });
        }
    }

    setLanguage(lang) {
        this.appSettings.generalLanguage = lang;
        this.dict = TEXT[lang] || TEXT['en'];
        this.renderSettings();
    }

    initDOM() {
        const modal = document.getElementById('settings-modal');
        const contentContainer = document.getElementById('settings-content-container');
        const tabContainer = document.getElementById('settings-tab-container');
        const closeBtn = document.getElementById('close-settings');

        if (!modal || !contentContainer || !tabContainer || !closeBtn) return;

        closeBtn.onclick = () => this.closeSettings();
        document.getElementById('settings-overlay').onclick = (e) => {
            if (e.target === document.getElementById('settings-overlay')) {
                this.closeSettings();
            }
        };

        const tabs = [
            { id: 'inputsHaptics', labelKey: 'inputsHaptics' },
            { id: 'autoSensors', labelKey: 'autoSensors' },
            { id: 'appearance', labelKey: 'appearance' },
            { id: 'profile', labelKey: 'profile' }
        ];

        tabContainer.innerHTML = tabs.map(tab =>
            `<button data-tab="${tab.id}" class="settings-tab text-sm px-3 py-2 rounded-lg font-bold transition-colors duration-200">
                ${this.dict[tab.labelKey]}
            </button>`
        ).join('');

        document.querySelectorAll('.settings-tab').forEach(btn => {
            btn.onclick = (e) => this.switchTab(e.target.dataset.tab);
        });

        this.switchTab(this.currentTab, false);

        // Initial render of all content (must happen before setting values)
        this.renderSettings();
    }

    switchTab(tabId, shouldRender = true) {
        this.currentTab = tabId;
        document.querySelectorAll('.settings-tab').forEach(btn => {
            btn.classList.toggle('bg-primary-app', btn.dataset.tab === tabId);
            btn.classList.toggle('settings-input', btn.dataset.tab !== tabId);
        });
        if (shouldRender) this.renderSettingsContent();
    }

    // --- RENDER SECTIONS ---

    renderInputHapticsSection() {
        const settings = this.appSettings.runtimeSettings;
        return `
            ${this.renderToggle('autoplay', this.dict.autoplay)}
            ${this.renderToggle('isHapticsEnabled', this.dict.haptics)}
            ${this.renderToggle('isHapticMorseEnabled', this.dict.morseHaptics)}
            <hr class="border-custom my-4" />
            
            <h3 class="text-lg font-bold mb-3">${this.dict.gestures}</h3>
            ${this.renderGestureMappingSection()}

            <h3 class="text-lg font-bold my-3">${this.dict.morse}</h3>
            ${this.renderMorseMappingSection()}
            
            <hr class="border-custom my-4" />

            ${this.renderToggle('isSpeedDeletingEnabled', this.dict.speedDelete)}
            ${this.renderToggle('isLongPressAutoplayEnabled', this.dict.longPressAutoplay)}
            
            <div class="mt-4">
                <label for="input-mode-select" class="block text-sm font-medium mb-1">${this.dict.inputMode}</label>
                <select id="input-mode-select" class="settings-input w-full p-2 rounded-lg">
                    <option value="key9" ${settings.currentInput === 'key9' ? 'selected' : ''}>${this.dict.inputs.key9}</option>
                    <option value="key12" ${settings.currentInput === 'key12' ? 'selected' : ''}>${this.dict.inputs.key12}</option>
                    <option value="piano" ${settings.currentInput === 'piano' ? 'selected' : ''}>${this.dict.inputs.piano}</option>
                </select>
            </div>
            
            <div class="mt-4">
                <label for="playback-speed-range" class="block text-sm font-medium mb-1">
                    ${this.dict.playbackSpeed}: <span id="playback-speed-value">${this.appSettings.playbackSpeed.toFixed(1)}x</span>
                </label>
                <input type="range" id="playback-speed-range" min="0.5" max="2.0" step="0.1" value="${this.appSettings.playbackSpeed}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
        `;
    }
    
    renderGestureMappingSection() {
        const mapping = this.appSettings.gestureMapping || {};
        const maxInput = this.appSettings.runtimeSettings.currentInput === 'key9' ? 9 : 12;
        
        let html = `<div class="grid grid-cols-3 md:grid-cols-4 gap-2 text-xs">`;
        
        for (let i = 1; i <= maxInput; i++) {
            const key = i.toString();
            const currentValue = mapping[key] || 'none';
            
            html += `
                <div class="flex flex-col items-center">
                    <label class="text-xs font-semibold mb-1 opacity-70">Key ${key}</label>
                    <select id="gesture-map-${key}" data-key="${key}" class="settings-input w-full p-1 rounded-md text-xs">
                        ${GESTURE_OPTIONS.map(opt => `<option value="${opt.value}" ${currentValue === opt.value ? 'selected' : ''}>${this.dict.gesturesList[opt.labelKey]}</option>`).join('')}
                    </select>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }

    renderMorseMappingSection() {
        const mapping = this.appSettings.morseMapping || {};
        const maxInput = this.appSettings.runtimeSettings.currentInput === 'key9' ? 9 : 12;

        let html = `<div class="grid grid-cols-4 gap-2 text-xs">`;
        
        for (let i = 1; i <= maxInput; i++) {
            const key = i.toString();
            const currentValue = mapping[key] || '';
            
            html += `
                <div class="flex flex-col items-center">
                    <label class="text-xs font-semibold mb-1 opacity-70">Key ${key}</label>
                    <input type="text" id="morse-map-${key}" data-key="${key}" value="${currentValue}" maxlength="6" 
                           placeholder=".-." class="settings-input w-full p-1 rounded-md text-xs text-center font-mono uppercase" 
                           pattern="[.-]*" title="Only dots (.) and dashes (-) are allowed." />
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }

    renderAutoSensorsSection() {
        const s = this.appSettings;
        return `
            <div class="mt-4">
                <label for="auto-input-mode-select" class="block text-sm font-medium mb-1">Auto Input Mode</label>
                <select id="auto-input-mode-select" class="settings-input w-full p-2 rounded-lg">
                    <option value="none" ${s.autoInputMode === 'none' ? 'selected' : ''}>None</option>
                    <option value="audio" ${s.autoInputMode === 'audio' ? 'selected' : ''}>Audio</option>
                    <option value="camera" ${s.autoInputMode === 'camera' ? 'selected' : ''}>Camera</option>
                </select>
            </div>
            <div class="mt-4">
                <label for="audio-sensor-thresh" class="block text-sm font-medium mb-1">
                    ${this.dict.audioSens}: <span id="audio-sensor-value">${s.sensorAudioThresh} dB</span>
                </label>
                <input type="range" id="audio-sensor-thresh" min="-120" max="-30" step="5" value="${s.sensorAudioThresh}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            <div class="mt-4">
                <label for="camera-sensor-thresh" class="block text-sm font-medium mb-1">
                    ${this.dict.camSens}: <span id="camera-sensor-value">${s.sensorCamThresh}</span>
                </label>
                <input type="range" id="camera-sensor-thresh" min="5" max="100" step="5" value="${s.sensorCamThresh}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            <hr class="border-custom my-4" />
            ${this.renderToggle('isBlackoutFeatureEnabled', this.dict.blackout)}
            ${this.renderToggle('isBlackoutGesturesEnabled', this.dict.blackoutGestures)}
            ${this.renderToggle('isStealth1KeyEnabled', this.dict.stealth1Key)}
        `;
    }

    renderAppearanceSection() {
        const s = this.appSettings;
        const themes = { ...PREMADE_THEMES, ...s.customThemes };
        return `
            ${this.renderToggle('isAudioEnabled', "Enable Voice/Sound")}
            <div class="mt-4">
                <label for="language-select" class="block text-sm font-medium mb-1">${this.dict.language}</label>
                <select id="language-select" class="settings-input w-full p-2 rounded-lg">
                    <option value="en" ${s.generalLanguage === 'en' ? 'selected' : ''}>English</option>
                    <option value="es" ${s.generalLanguage === 'es' ? 'selected' : ''}>Español</option>
                </select>
            </div>
            <hr class="border-custom my-4" />

            <h3 class="text-lg font-bold mb-3">UI Scaling</h3>
            <div class="mt-4">
                <label for="ui-scale-range" class="block text-sm font-medium mb-1">
                    ${this.dict.uiScale}: <span id="ui-scale-value">${s.globalUiScale}%</span>
                </label>
                <input type="range" id="ui-scale-range" min="50" max="300" step="10" value="${s.globalUiScale}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            <div class="mt-4">
                <label for="seq-scale-range" class="block text-sm font-medium mb-1">
                    ${this.dict.seqScale}: <span id="seq-scale-value">${(s.uiScaleMultiplier * 100).toFixed(0)}%</span>
                </label>
                <input type="range" id="seq-scale-range" min="0.5" max="3.0" step="0.1" value="${s.uiScaleMultiplier}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            <div class="mt-4">
                <label for="resize-mode-select" class="block text-sm font-medium mb-1">Pinch-to-Scale Mode</label>
                <select id="resize-mode-select" class="settings-input w-full p-2 rounded-lg">
                    <option value="global" ${s.gestureResizeMode === 'global' ? 'selected' : ''}>${this.dict.resizeModes.global}</option>
                    <option value="sequence" ${s.gestureResizeMode === 'sequence' ? 'selected' : ''}>${this.dict.resizeModes.sequence}</option>
                </select>
            </div>
            <hr class="border-custom my-4" />
            
            <h3 class="text-lg font-bold mb-3">Speech Settings</h3>
            <div class="mt-4">
                <label for="voice-preset-select" class="block text-sm font-medium mb-1">${this.dict.voicePreset}</label>
                <select id="voice-preset-select" class="settings-input w-full p-2 rounded-lg">
                    ${Object.keys(PREMADE_VOICE_PRESETS).map(id => `<option value="${id}" ${s.activeVoicePresetId === id ? 'selected' : ''}>${PREMADE_VOICE_PRESETS[id].name}</option>`).join('')}
                    ${Object.keys(s.voicePresets).map(id => `<option value="${id}" ${s.activeVoicePresetId === id ? 'selected' : ''}>${s.voicePresets[id].name}</option>`).join('')}
                </select>
            </div>
            <div class="mt-4">
                <label for="speech-voice-select" class="block text-sm font-medium mb-1">${this.dict.voice}</label>
                <select id="speech-voice-select" class="settings-input w-full p-2 rounded-lg"></select>
            </div>
            <div class="mt-4">
                <label for="voice-pitch-range" class="block text-sm font-medium mb-1">
                    ${this.dict.pitch}: <span id="voice-pitch-value">${s.voicePitch.toFixed(1)}</span>
                </label>
                <input type="range" id="voice-pitch-range" min="0.5" max="2.0" step="0.1" value="${s.voicePitch}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            <div class="mt-4">
                <label for="voice-rate-range" class="block text-sm font-medium mb-1">
                    ${this.dict.rate}: <span id="voice-rate-value">${s.voiceRate.toFixed(1)}</span>
                </label>
                <input type="range" id="voice-rate-range" min="0.5" max="3.0" step="0.1" value="${s.voiceRate}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            <div class="mt-4">
                <label for="voice-volume-range" class="block text-sm font-medium mb-1">
                    ${this.dict.volume}: <span id="voice-volume-value">${s.voiceVolume.toFixed(1)}</span>
                </label>
                <input type="range" id="voice-volume-range" min="0.0" max="1.0" step="0.1" value="${s.voiceVolume}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            <hr class="border-custom my-4" />

            <h3 class="text-lg font-bold mb-3">${this.dict.theme}</h3>
            <div id="theme-selection-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                ${Object.keys(themes).map(key => `
                    <button data-theme="${key}" class="theme-select-btn p-3 rounded-lg shadow-md border-2 ${s.activeTheme === key ? 'border-primary-app' : 'border-custom'}" 
                        style="background-color:${themes[key].bgCard}; color:${themes[key].text}; border-color: ${s.activeTheme === key ? themes[key].bubble : 'var(--border)'};">
                        <span class="block text-sm font-bold">${themes[key].name}</span>
                        <div class="h-2 w-full mt-2 rounded" style="background-color:${themes[key].bubble}"></div>
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderProfileGameSection() {
        const settings = this.appSettings.runtimeSettings;
        const profiles = this.appSettings.profiles;
        const activeProfileId = this.appSettings.activeProfileId;
        
        return `
            <div class="mt-4">
                <label for="profile-select" class="block text-sm font-medium mb-1">Active Profile</label>
                <select id="profile-select" class="settings-input w-full p-2 rounded-lg">
                    ${Object.keys(profiles).map(id => `
                        <option value="${id}" ${id === activeProfileId ? 'selected' : ''}>${profiles[id].name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="mt-4">
                <label for="profile-name-input" class="block text-sm font-medium mb-1">${this.dict.profileName}</label>
                <input type="text" id="profile-name-input" value="${profiles[activeProfileId].name}" class="settings-input w-full p-2 rounded-lg" />
            </div>

            <div class="flex space-x-2 mt-4">
                <button id="save-profile-btn" class="settings-input flex-1 p-2 rounded-lg font-bold border-primary-app border-2 hover:bg-primary-app hover:text-white transition-all">${this.dict.saveProfile}</button>
                <button id="save-new-profile-btn" class="settings-input flex-1 p-2 rounded-lg font-bold border-custom border-2">${this.dict.saveNew}</button>
            </div>
            <button id="delete-profile-btn" class="settings-input w-full p-2 rounded-lg font-bold mt-2 text-red-500 border-red-500 border-2 hover:bg-red-500 hover:text-white transition-all" ${Object.keys(profiles).length === 1 ? 'disabled' : ''}>${this.dict.deleteProfile}</button>

            <hr class="border-custom my-4" />
            <h3 class="text-lg font-bold mb-3">Game Mode</h3>

            <div class="mt-4">
                <label for="game-mode-select" class="block text-sm font-medium mb-1">Game Mode</label>
                <select id="game-mode-select" class="settings-input w-full p-2 rounded-lg">
                    <option value="simon" ${settings.currentMode === 'simon' ? 'selected' : ''}>${this.dict.modes.simon}</option>
                    <option value="unique" ${settings.currentMode === 'unique' ? 'selected' : ''}>${this.dict.modes.unique}</option>
                </select>
            </div>

            <div class="mt-4">
                <label for="sequence-length-input" class="block text-sm font-medium mb-1">
                    ${this.dict.sequenceLen}: <span id="sequence-length-value">${settings.sequenceLength}</span>
                </label>
                <input type="range" id="sequence-length-input" min="5" max="50" step="5" value="${settings.sequenceLength}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>

            <div class="mt-4 ${settings.currentMode === 'unique' ? 'hidden' : ''}" id="simon-settings">
                <label for="machine-count-input" class="block text-sm font-medium mb-1">
                    ${this.dict.machineCount}: <span id="machine-count-value">${settings.machineCount}</span>
                </label>
                <input type="range" id="machine-count-input" min="1" max="4" step="1" value="${settings.machineCount}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
                
                <label for="simon-chunk-input" class="block text-sm font-medium mt-4 mb-1">
                    ${this.dict.simonChunk}: <span id="simon-chunk-value">${settings.simonChunkSize}</span>
                </label>
                <input type="range" id="simon-chunk-input" min="1" max="10" step="1" value="${settings.simonChunkSize}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />

                <label for="inter-delay-input" class="block text-sm font-medium mt-4 mb-1">
                    ${this.dict.delay}: <span id="inter-delay-value">${settings.simonInterSequenceDelay} ms</span>
                </label>
                <input type="range" id="inter-delay-input" min="0" max="1000" step="100" value="${settings.simonInterSequenceDelay}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" />
            </div>
            
            <div class="mt-4 ${settings.currentMode === 'simon' ? 'hidden' : ''}" id="unique-settings">
                ${this.renderToggle('isUniqueRoundsAutoClearEnabled', this.dict.uniqueAutoClear)}
            </div>
            
            <hr class="border-custom my-4" />
            <button id="reset-app-btn" class="settings-input w-full p-2 rounded-lg font-bold mt-2 text-red-500 border-red-500 border-2 hover:bg-red-500 hover:text-white transition-all">${this.dict.resetApp}</button>
        `;
    }

    renderToggle(settingKey, label) {
        return `
            <div class="flex items-center justify-between mt-4">
                <label for="toggle-${settingKey}" class="text-sm font-medium">${label}</label>
                <input type="checkbox" id="toggle-${settingKey}" data-setting="${settingKey}" class="h-5 w-10 rounded-full bg-gray-300 appearance-none cursor-pointer transition-colors duration-200 checked:bg-primary-app settings-toggle" ${this.appSettings[settingKey] ? 'checked' : ''}>
            </div>
        `;
    }

    renderSettingsContent() {
        const contentContainer = document.getElementById('settings-content-container');
        if (!contentContainer) return;

        let content = '';
        if (this.currentTab === 'inputsHaptics') content = this.renderInputHapticsSection();
        else if (this.currentTab === 'autoSensors') content = this.renderAutoSensorsSection();
        else if (this.currentTab === 'appearance') content = this.renderAppearanceSection();
        else if (this.currentTab === 'profile') content = this.renderProfileGameSection();

        contentContainer.innerHTML = content;
        this.attachEventListeners();
    }

    renderSettings() {
        // Rerender all tabs and content, and update the profile name in the main settings header
        this.initDOM();
        this.renderSettingsContent();
        const profileNameInput = document.getElementById('profile-name-input');
        if(profileNameInput) profileNameInput.value = this.appSettings.profiles[this.appSettings.activeProfileId].name;
    }

    attachEventListeners() {
        // --- Shared Handlers ---
        const handleSettingsChange = (key, value, type = 'app') => {
            if (type === 'app') this.appSettings[key] = value;
            else if (type === 'runtime') this.appSettings.runtimeSettings[key] = value;
            this.callbacks.onUpdate(key);
            this.renderSettingsContent(); // Re-render necessary for dynamic parts like simon/unique settings
        };

        const attachToggleListener = (key, type = 'app') => {
            document.getElementById(`toggle-${key}`)?.addEventListener('change', (e) => handleSettingsChange(key, e.target.checked, type));
        };

        const attachRangeListener = (id, settingKey, type = 'app', unit = '', runtimeKey = null) => {
            const range = document.getElementById(id);
            const valueSpan = document.getElementById(`${settingKey}-value`);
            if (!range || !valueSpan) return;

            range.oninput = (e) => {
                valueSpan.textContent = `${e.target.value}${unit}`;
            };
            range.onchange = (e) => {
                let value = parseFloat(e.target.value);
                if (unit === '%') value = parseInt(e.target.value);

                if (type === 'app') this.appSettings[settingKey] = value;
                else if (type === 'runtime') this.appSettings.runtimeSettings[settingKey] = value;
                
                if (runtimeKey) this.appSettings.runtimeSettings[runtimeKey] = value;
                
                this.callbacks.onUpdate(settingKey);
            };
        };

        // --- Inputs & Haptics ---
        attachToggleListener('isAutoplayEnabled', 'app');
        attachToggleListener('isHapticsEnabled', 'app');
        attachToggleListener('isHapticMorseEnabled', 'app');
        attachToggleListener('isSpeedDeletingEnabled', 'app');
        attachToggleListener('isLongPressAutoplayEnabled', 'app');
        attachRangeListener('playback-speed-range', 'playbackSpeed', 'app', 'x');
        
        // Custom Mapping Listeners
        // Gesture Mapping
        document.querySelectorAll('[id^="gesture-map-"]').forEach(select => {
            select.onchange = (e) => {
                const key = e.target.dataset.key;
                const value = e.target.value;
                this.appSettings.gestureMapping[key] = value;
                this.callbacks.onUpdate('gestureMapping');
            };
        });

        // Morse Mapping
        document.querySelectorAll('[id^="morse-map-"]').forEach(input => {
            input.oninput = (e) => {
                // Enforce only dots and dashes
                e.target.value = e.target.value.replace(/[^.\-]/g, '').toUpperCase();
            };
            input.onchange = (e) => {
                const key = e.target.dataset.key;
                this.appSettings.morseMapping[key] = e.target.value;
                this.callbacks.onUpdate('morseMapping');
            };
        });
        
        // Input Mode
        document.getElementById('input-mode-select')?.addEventListener('change', (e) => handleSettingsChange('currentInput', e.target.value, 'runtime', 'input_mode_change'));

        // --- Auto & Sensors ---
        attachToggleListener('isBlackoutFeatureEnabled', 'app');
        attachToggleListener('isBlackoutGesturesEnabled', 'app');
        attachToggleListener('isStealth1KeyEnabled', 'app');
        document.getElementById('auto-input-mode-select')?.addEventListener('change', (e) => { 
            this.sensorEngine.setMode(e.target.value); 
            handleSettingsChange('autoInputMode', e.target.value, 'app'); 
            this.appSettings.showMicBtn = (e.target.value === 'audio');
            this.appSettings.showCamBtn = (e.target.value === 'camera');
        });
        attachRangeListener('audio-sensor-thresh', 'sensorAudioThresh', 'app', ' dB');
        attachRangeListener('camera-sensor-thresh', 'sensorCamThresh', 'app', '');
        
        // Sensor listeners
        document.getElementById('audio-sensor-thresh')?.addEventListener('change', (e) => this.sensorEngine.setSensitivity('audio', parseFloat(e.target.value)));
        document.getElementById('camera-sensor-thresh')?.addEventListener('change', (e) => this.sensorEngine.setSensitivity('camera', parseFloat(e.target.value)));

        // --- Appearance & Voice ---
        attachToggleListener('isAudioEnabled', 'app');
        attachRangeListener('ui-scale-range', 'globalUiScale', 'app', '%');
        attachRangeListener('seq-scale-range', 'uiScaleMultiplier', 'app', '');
        
        document.getElementById('language-select')?.addEventListener('change', (e) => this.setLanguage(e.target.value));
        document.getElementById('resize-mode-select')?.addEventListener('change', (e) => handleSettingsChange('gestureResizeMode', e.target.value, 'app'));

        // Theme selection
        document.querySelectorAll('.theme-select-btn').forEach(btn => {
            btn.onclick = (e) => {
                const key = e.currentTarget.dataset.theme;
                if (this.appSettings.activeTheme !== key) {
                    this.appSettings.activeTheme = key;
                    this.appSettings.profiles[this.appSettings.activeProfileId].theme = key;
                    this.callbacks.onUpdate('theme_change');
                }
            };
        });
        
        // Voice selection
        this.renderVoiceSelection();
        document.getElementById('speech-voice-select')?.addEventListener('change', (e) => handleSettingsChange('selectedVoice', e.target.value, 'app'));
        document.getElementById('voice-preset-select')?.addEventListener('change', (e) => this.applyVoicePreset(e.target.value));
        
        attachRangeListener('voice-pitch-range', 'voicePitch', 'app', '');
        attachRangeListener('voice-rate-range', 'voiceRate', 'app', '');
        attachRangeListener('voice-volume-range', 'voiceVolume', 'app', '');
        
        // --- Profile & Game ---
        document.getElementById('profile-select')?.addEventListener('change', (e) => this.callbacks.onProfileSwitch(e.target.value));
        document.getElementById('save-profile-btn')?.addEventListener('click', () => this.callbacks.onProfileSave());
        document.getElementById('save-new-profile-btn')?.addEventListener('click', () => this.callbacks.onProfileAdd(this.appSettings.profiles[this.appSettings.activeProfileId].name + " Copy"));
        document.getElementById('delete-profile-btn')?.addEventListener('click', () => { if(confirm("Are you sure you want to delete this profile?")) this.callbacks.onProfileDelete(); });
        document.getElementById('reset-app-btn')?.addEventListener('click', () => { if(confirm("This will clear ALL settings and sequences and reload. Are you sure?")) this.callbacks.onReset(); });

        // Game Mode
        document.getElementById('game-mode-select')?.addEventListener('change', (e) => handleSettingsChange('currentMode', e.target.value, 'runtime', 'mode_switch'));
        attachRangeListener('sequence-length-input', 'sequenceLength', 'runtime', '', 'sequenceLength');
        
        // Simon Sub-settings
        attachRangeListener('machine-count-input', 'machineCount', 'runtime', '', 'machineCount');
        attachRangeListener('simon-chunk-input', 'simonChunkSize', 'runtime', '', 'simonChunkSize');
        attachRangeListener('inter-delay-input', 'simonInterSequenceDelay', 'runtime', ' ms', 'simonInterSequenceDelay');

        // Unique Sub-settings
        attachToggleListener('isUniqueRoundsAutoClearEnabled', 'app');

        // Initial state of sub-settings
        const mode = this.appSettings.runtimeSettings.currentMode;
        document.getElementById('simon-settings')?.classList.toggle('hidden', mode === 'unique');
        document.getElementById('unique-settings')?.classList.toggle('hidden', mode === 'simon');
        
        // Re-attach profile name input listener
        const profileNameInput = document.getElementById('profile-name-input');
        if(profileNameInput) {
            profileNameInput.onchange = (e) => this.callbacks.onProfileRename(e.target.value);
        }
    }
    
    applyVoicePreset(presetId) {
        let preset = PREMADE_VOICE_PRESETS[presetId] || this.appSettings.voicePresets[presetId];
        if (!preset) return;

        this.appSettings.voicePitch = preset.pitch;
        this.appSettings.voiceRate = preset.rate;
        this.appSettings.voiceVolume = preset.volume;
        this.appSettings.selectedVoice = preset.selectedVoice;
        this.appSettings.activeVoicePresetId = presetId;
        
        this.renderSettingsContent(); // Re-render to update ranges/values
        this.callbacks.onUpdate('voice_preset_change');
    }

    renderVoiceSelection() {
        const select = document.getElementById('speech-voice-select');
        if (!select) return;

        select.innerHTML = `<option value="">(Default Browser Voice)</option>`;

        this.voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.name === this.appSettings.selectedVoice) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    openSettings() {
        if(document.body.classList.contains('blackout-active')) return;
        this.renderSettings();
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
            modal.querySelector('div').classList.remove('scale-90');
        }
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.querySelector('div').classList.add('scale-90');
            modal.classList.add('opacity-0');
            setTimeout(() => {
                modal.classList.add('pointer-events-none');
                modal.classList.add('hidden');
            }, 300);
        }
    }

    openSetup() {
        this.currentTab = 'profile'; // Force setup screen to profile tab
        this.renderSettings();
        document.getElementById('settings-modal').classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        document.getElementById('settings-modal').querySelector('div').classList.remove('scale-90');
    }

    // --- Share/Redeem Functionality (No-Op for now, kept for structure) ---
    openShare() {
        showToast("Sharing is not yet implemented in this view.");
    }
    toggleRedeem(show) {
        showToast("Redeem functionality is not yet implemented.");
    }
populateVoicePresetDropdown() {
    if (!this.dom.voicePresetSelect) return;
    this.dom.voicePresetSelect.innerHTML = '';

    const grp1 = document.createElement('optgroup');
    grp1.label = "Built-in";
    Object.keys(PREMADE_VOICE_PRESETS).forEach(k => {
        const el = document.createElement('option');
        el.value = k;
        el.textContent = PREMADE_VOICE_PRESETS[k].name;
        grp1.appendChild(el);
    });
    this.dom.voicePresetSelect.appendChild(grp1);

    const grp2 = document.createElement('optgroup');
    grp2.label = "My Voices";
    if (this.appSettings.voicePresets) {
        Object.keys(this.appSettings.voicePresets).forEach(k => {
            const el = document.createElement('option');
            el.value = k;
            el.textContent = this.appSettings.voicePresets[k].name;
            grp2.appendChild(el);
        });
    }
    this.dom.voicePresetSelect.appendChild(grp2);

    this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
}

applyVoicePreset(id) {
    let preset = this.appSettings.voicePresets[id] || PREMADE_VOICE_PRESETS[id] || PREMADE_VOICE_PRESETS['standard'];
    this.appSettings.voicePitch = preset.pitch;
    this.appSettings.voiceRate = preset.rate;
    this.appSettings.voiceVolume = preset.volume;
    this.updateUIFromSettings();
    this.callbacks.onSave();
}

buildColorGrid() { if (!this.dom.editorGrid) return; this.dom.editorGrid.innerHTML = ''; CRAYONS.forEach(color => { const btn = document.createElement('div'); btn.style.backgroundColor = color; btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm"; btn.onclick = () => this.applyColorToTarget(color); this.dom.editorGrid.appendChild(btn); }); }
applyColorToTarget(hex) { if (!this.tempTheme) return; this.tempTheme[this.currentTargetKey] = hex; const [h, s, l] = this.hexToHsl(hex); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = hex; if (this.dom.ftContainer.classList.contains('hidden')) { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; } this.updatePreview(); }
updateColorFromSliders() { const h = parseInt(this.dom.ftHue.value); const s = parseInt(this.dom.ftSat.value); const l = parseInt(this.dom.ftLit.value); const hex = this.hslToHex(h, s, l); this.dom.ftPreview.style.backgroundColor = hex; if (this.tempTheme) { this.tempTheme[this.currentTargetKey] = hex; this.updatePreview(); } }
openThemeEditor() { if (!this.dom.editorModal) return; const activeId = this.appSettings.activeTheme; const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default']; this.tempTheme = { ...source }; this.dom.edName.value = this.tempTheme.name; this.dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app')); this.dom.targetBtns[2].classList.add('active', 'bg-primary-app'); this.currentTargetKey = 'bubble'; const [h, s, l] = this.hexToHsl(this.tempTheme.bubble); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme.bubble; this.updatePreview(); this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.remove('scale-90'); }
updatePreview() { const t = this.tempTheme; if (!this.dom.edPreview) return; this.dom.edPreview.style.backgroundColor = t.bgMain; this.dom.edPreview.style.color = t.text; this.dom.edPreviewCard.style.backgroundColor = t.bgCard; this.dom.edPreviewCard.style.color = t.text; this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)'; this.dom.edPreviewBtn.style.backgroundColor = t.bubble; this.dom.edPreviewBtn.style.color = t.text; }
testVoice() { if (window.speechSynthesis) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance("Testing 1 2 3."); if (this.appSettings.selectedVoice) { const v = window.speechSynthesis.getVoices().find(voice => voice.name === this.appSettings.selectedVoice); if (v) u.voice = v; } let p = parseFloat(this.dom.voicePitch.value); let r = parseFloat(this.dom.voiceRate.value); let v = parseFloat(this.dom.voiceVolume.value); u.pitch = p; u.rate = r; u.volume = v; window.speechSynthesis.speak(u); } }

setLanguage(lang) {
    const t = LANG[lang];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    
    // Persist
    this.appSettings.generalLanguage = lang;
    if (this.dom.quickLang) this.dom.quickLang.value = lang;
    if (this.dom.generalLang) this.dom.generalLang.value = lang;
    this.callbacks.onSave();
}

openShare() { if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); if (this.dom.shareModal) { this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); setTimeout(() => this.dom.shareModal.querySelector('.share-sheet').classList.add('active'), 10); } }
closeShare() { if (this.dom.shareModal) { this.dom.shareModal.querySelector('.share-sheet').classList.remove('active'); setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300); } }
openCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'auto'; this.sensorEngine.toggleAudio(true); this.sensorEngine.toggleCamera(true); this.sensorEngine.setCalibrationCallback((data) => { if (this.dom.calibAudioBar) { const pct = ((data.audio - (-100)) / ((-30) - (-100))) * 100; this.dom.calibAudioBar.style.width = `${Math.max(0, Math.min(100, pct))}%`; } if (this.dom.calibCamBar) { const pct = Math.min(100, data.camera); this.dom.calibCamBar.style.width = `${pct}%`; } }); } }
closeCalibration() { if (this.dom.calibModal) { this.dom.calibModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.calibModal.style.pointerEvents = 'none'; this.sensorEngine.setCalibrationCallback(null); this.sensorEngine.toggleAudio(this.appSettings.isAudioEnabled); this.sensorEngine.toggleCamera(this.appSettings.autoInputMode === 'cam' || this.appSettings.autoInputMode === 'both'); } }

toggleRedeem(show) {
    if (show) {
        if (this.dom.redeemModal) {
            this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none');
            this.dom.redeemModal.style.pointerEvents = 'auto';
        }
    } else {
        if (this.dom.redeemModal) {
            this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none');
            this.dom.redeemModal.style.pointerEvents = 'none';
        }
    }
}

toggleDonate(show) {
    if (show) {
        if (this.dom.donateModal) {
            this.dom.donateModal.classList.remove('opacity-0', 'pointer-events-none');
            this.dom.donateModal.style.pointerEvents = 'auto';
        }
    } else {
        if (this.dom.donateModal) {
            this.dom.donateModal.classList.add('opacity-0', 'pointer-events-none');
            this.dom.donateModal.style.pointerEvents = 'none';
        }
    }
}

initListeners() {
    this.dom.targetBtns.forEach(btn => { btn.onclick = () => { this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); }); btn.classList.add('active', 'bg-primary-app'); btn.classList.remove('opacity-60'); this.currentTargetKey = btn.dataset.target; if (this.tempTheme) { const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme[this.currentTargetKey]; } }; });
    [this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => { sl.oninput = () => this.updateColorFromSliders(); });
    this.dom.ftToggle.onclick = () => { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; };
    if (this.dom.edSave) this.dom.edSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onSave(); this.callbacks.onUpdate(); this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.add('scale-90'); this.populateThemeDropdown(); } };
    if (this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
    if (this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };

    // Voice Controls
    if (this.dom.voiceTestBtn) this.dom.voiceTestBtn.onclick = () => this.testVoice();
    const updateVoiceLive = () => {
        this.appSettings.voicePitch = parseFloat(this.dom.voicePitch.value);
        this.appSettings.voiceRate = parseFloat(this.dom.voiceRate.value);
        this.appSettings.voiceVolume = parseFloat(this.dom.voiceVolume.value);
    };
    if (this.dom.voicePitch) this.dom.voicePitch.oninput = updateVoiceLive;
    if (this.dom.voiceRate) this.dom.voiceRate.oninput = updateVoiceLive;
    if (this.dom.voiceVolume) this.dom.voiceVolume.oninput = updateVoiceLive;

    // Voice Preset Management
    if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.onchange = (e) => {
        this.appSettings.activeVoicePresetId = e.target.value;
        this.applyVoicePreset(e.target.value);
    };
    if (this.dom.voicePresetAdd) this.dom.voicePresetAdd.onclick = () => {
        const n = prompt("New Voice Preset Name:");
        if (n) {
            const id = 'vp_' + Date.now();
            this.appSettings.voicePresets[id] = {
                name: n,
                pitch: this.appSettings.voicePitch,
                rate: this.appSettings.voiceRate,
                volume: this.appSettings.voiceVolume
            };
            this.appSettings.activeVoicePresetId = id;
            this.populateVoicePresetDropdown();
            this.callbacks.onSave();
        }
    };
    if (this.dom.voicePresetSave) this.dom.voicePresetSave.onclick = () => {
        const id = this.appSettings.activeVoicePresetId;
        if (PREMADE_VOICE_PRESETS[id]) {
            alert("Cannot save over built-in presets. Create a new one.");
            return;
        }
        if (this.appSettings.voicePresets[id]) {
            this.appSettings.voicePresets[id] = {
                ...this.appSettings.voicePresets[id],
                pitch: parseFloat(this.dom.voicePitch.value),
                rate: parseFloat(this.dom.voiceRate.value),
                volume: parseFloat(this.dom.voiceVolume.value)
            };
            this.callbacks.onSave();
            alert("Voice Preset Saved!");
        }
    };
    if (this.dom.voicePresetDelete) this.dom.voicePresetDelete.onclick = () => {
        const id = this.appSettings.activeVoicePresetId;
        if (PREMADE_VOICE_PRESETS[id]) { alert("Cannot delete built-in."); return; }
        if (confirm("Delete this voice preset?")) {
            delete this.appSettings.voicePresets[id];
            this.appSettings.activeVoicePresetId = 'standard';
            this.populateVoicePresetDropdown();
            this.applyVoicePreset('standard');
        }
    };
    if (this.dom.voicePresetRename) this.dom.voicePresetRename.onclick = () => {
        const id = this.appSettings.activeVoicePresetId;
        if (PREMADE_VOICE_PRESETS[id]) return alert("Cannot rename built-in.");
        const n = prompt("Rename:", this.appSettings.voicePresets[id].name);
        if (n) {
            this.appSettings.voicePresets[id].name = n;
            this.populateVoicePresetDropdown();
            this.callbacks.onSave();
        }
    };

    if (this.dom.quickLang) this.dom.quickLang.onchange = (e) => this.setLanguage(e.target.value);
    if (this.dom.generalLang) this.dom.generalLang.onchange = (e) => this.setLanguage(e.target.value);
    const handleProfileSwitch = (val) => { this.callbacks.onProfileSwitch(val); this.openSettings(); };
    if (this.dom.configSelect) this.dom.configSelect.onchange = (e) => handleProfileSwitch(e.target.value);
    if (this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => handleProfileSwitch(e.target.value);

    const bind = (el, prop, isGlobal, isInt = false, isFloat = false) => {
        if (!el) return;
        el.onchange = () => {
            let val = (el.type === 'checkbox') ? el.checked : el.value;
            if (isInt) val = parseInt(val);
            if (isFloat) val = parseFloat(val);
            if (isGlobal) {
                this.appSettings[prop] = val;
                if (prop === 'activeTheme') this.callbacks.onUpdate();
                if (prop === 'isPracticeModeEnabled') this.callbacks.onUpdate();
            } else {
                this.appSettings.runtimeSettings[prop] = val;
            }
            this.callbacks.onSave();
            this.generatePrompt();
        };
    };

    bind(this.dom.input, 'currentInput', false); bind(this.dom.machines, 'machineCount', false, true); bind(this.dom.seqLength, 'sequenceLength', false, true); bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
    bind(this.dom.longPressToggle, 'isLongPressAutoplayEnabled', true);

    if (this.dom.mode) {
        this.dom.mode.onchange = () => {
            this.appSettings.runtimeSettings.currentMode = this.dom.mode.value;
            this.callbacks.onSave();
            this.callbacks.onUpdate('mode_switch');
            this.generatePrompt();
        };
    }

    if (this.dom.input) this.dom.input.addEventListener('change', () => this.generatePrompt());
    if (this.dom.machines) this.dom.machines.addEventListener('change', () => this.generatePrompt());
    if (this.dom.seqLength) this.dom.seqLength.addEventListener('change', () => this.generatePrompt());
    if (this.dom.playbackSpeed) this.dom.playbackSpeed.addEventListener('change', () => this.generatePrompt());
    if (this.dom.delay) this.dom.delay.addEventListener('change', () => this.generatePrompt());
    if (this.dom.chunk) this.dom.chunk.addEventListener('change', () => this.generatePrompt());

    if (this.dom.autoplay) {
        this.dom.autoplay.onchange = (e) => {
            this.appSettings.isAutoplayEnabled = e.target.checked;
            if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked;
            this.callbacks.onSave();
        }
    }
    if (this.dom.audio) {
        this.dom.audio.onchange = (e) => {
            this.appSettings.isAudioEnabled = e.target.checked;
            if (this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked;
            this.callbacks.onSave();
        }
    }
    if (this.dom.quickAutoplay) {
        this.dom.quickAutoplay.onchange = (e) => {
            this.appSettings.isAutoplayEnabled = e.target.checked;
            if (this.dom.autoplay) this.dom.autoplay.checked = e.target.checked;
            this.callbacks.onSave();
        }
    }
    if (this.dom.quickAudio) {
        this.dom.quickAudio.onchange = (e) => {
            this.appSettings.isAudioEnabled = e.target.checked;
            if (this.dom.audio) this.dom.audio.checked = e.target.checked;
            this.callbacks.onSave();
        }
    }
    if (this.dom.dontShowWelcome) {
        this.dom.dontShowWelcome.onchange = (e) => {
            this.appSettings.showWelcomeScreen = !e.target.checked;
            if (this.dom.showWelcome) this.dom.showWelcome.checked = !e.target.checked;
            this.callbacks.onSave();
        }
    }
    if (this.dom.showWelcome) {
        this.dom.showWelcome.onchange = (e) => {
            this.appSettings.showWelcomeScreen = e.target.checked;
            if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !e.target.checked;
            this.callbacks.onSave();
        }
    }

    // --- NEW BINDINGS FOR STEALTH TAB ---
    bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
    bind(this.dom.blackoutToggle, 'isBlackoutFeatureEnabled', true);
    bind(this.dom.blackoutGesturesToggle, 'isBlackoutGesturesEnabled', true);
    bind(this.dom.stealth1KeyToggle, 'isStealth1KeyEnabled', true); // Remapped inputs-only toggle
    // ------------------------------------

    if (this.dom.playbackSpeed) this.dom.playbackSpeed.onchange = (e) => { this.appSettings.playbackSpeed = parseFloat(e.target.value); this.callbacks.onSave(); this.generatePrompt(); };
    bind(this.dom.chunk, 'simonChunkSize', false, true);
    if (this.dom.delay) this.dom.delay.onchange = (e) => { this.appSettings.runtimeSettings.simonInterSequenceDelay = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
    bind(this.dom.haptics, 'isHapticsEnabled', true); bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true); 
    bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
    if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); this.callbacks.onUpdate(); };
    if (this.dom.seqSize) this.dom.seqSize.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
    if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
    if (this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => { this.appSettings.gestureResizeMode = e.target.value; this.callbacks.onSave(); };
    if (this.dom.autoInput) this.dom.autoInput.onchange = (e) => { const val = e.target.value; this.appSettings.autoInputMode = val; this.appSettings.showMicBtn = (val === 'mic' || val === 'both'); this.appSettings.showCamBtn = (val === 'cam' || val === 'both'); this.callbacks.onSave(); this.callbacks.onUpdate(); };
    if (this.dom.themeAdd) this.dom.themeAdd.onclick = () => { const n = prompt("Name:"); if (n) { const id = 'c_' + Date.now(); this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'], name: n }; this.appSettings.activeTheme = id; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); this.openThemeEditor(); } };
    if (this.dom.themeRename) this.dom.themeRename.onclick = () => { const id = this.appSettings.activeTheme; if (PREMADE_THEMES[id]) return alert("Cannot rename built-in."); const n = prompt("Rename:", this.appSettings.customThemes[id].name); if (n) { this.appSettings.customThemes[id].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); } };
    if (this.dom.themeDelete) this.dom.themeDelete.onclick = () => { if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in."); if (confirm("Delete?")) { delete this.appSettings.customThemes[this.appSettings.activeTheme]; this.appSettings.activeTheme = 'default'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); } };
    if (this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); this.populateThemeDropdown(); };
    if (this.dom.configAdd) this.dom.configAdd.onclick = () => { const n = prompt("Profile Name:"); if (n) this.callbacks.onProfileAdd(n); this.openSettings(); };
    if (this.dom.configRename) this.dom.configRename.onclick = () => { const n = prompt("Rename:"); if (n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
    if (this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
    if (this.dom.configSave) this.dom.configSave.onclick = () => { this.callbacks.onProfileSave(); };
    if (this.dom.themeSave) this.dom.themeSave.onclick = () => {
        if (this.tempTheme) {
            const activeId = this.appSettings.activeTheme;
            if (PREMADE_THEMES[activeId]) {
                const newId = 'custom_' + Date.now();
                this.appSettings.customThemes[newId] = this.tempTheme;
                this.appSettings.activeTheme = newId;
            } else {
                this.appSettings.customThemes[activeId] = this.tempTheme;
            }
            this.callbacks.onProfileSave();
            this.callbacks.onUpdate();
            this.populateThemeDropdown();
            alert("Theme Saved!");
        }
    };
    if (this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
    if (this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
    if (this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.generatePrompt(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
    if (this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
    if (this.dom.closeHelpBtnBottom) this.dom.closeHelpBtnBottom.onclick = () => this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none');
    if (this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => { this.generatePrompt(); this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); };
    if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); };
    if (this.dom.openCalibBtn) this.dom.openCalibBtn.onclick = () => this.openCalibration();
    if (this.dom.closeCalibBtn) this.dom.closeCalibBtn.onclick = () => this.closeCalibration();
    if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.oninput = () => { const val = parseInt(this.dom.calibAudioSlider.value); this.appSettings.sensorAudioThresh = val; this.sensorEngine.setSensitivity('audio', val); const pct = ((val - (-100)) / ((-30) - (-100))) * 100; this.dom.calibAudioMarker.style.left = `${pct}%`; this.dom.calibAudioVal.innerText = val + 'dB'; this.callbacks.onSave(); };
    if (this.dom.calibCamSlider) this.dom.calibCamSlider.oninput = () => { const val = parseInt(this.dom.calibCamSlider.value); this.appSettings.sensorCamThresh = val; this.sensorEngine.setSensitivity('camera', val); const pct = Math.min(100, val); this.dom.calibCamMarker.style.left = `${pct}%`; this.dom.calibCamVal.innerText = val; this.callbacks.onSave(); };

    this.dom.tabs.forEach(btn => {
        btn.onclick = () => {
            const parent = btn.parentElement.parentElement;
            parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.tab;
            if (target === 'help-voice') this.generatePrompt();
            
            // Handle generated DOM elements if using stealth tab
            const targetEl = document.getElementById(`tab-${target}`);
            if(targetEl) targetEl.classList.add('active');
        }
    });

    if (this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
    if (this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => this.closeShare();
    if (this.dom.openRedeemBtn) this.dom.openRedeemBtn.onclick = () => this.toggleRedeem(true);
    if (this.dom.closeRedeemBtn) this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);

    if (this.dom.openRedeemSettingsBtn) this.dom.openRedeemSettingsBtn.onclick = () => this.toggleRedeem(true);
    if (this.dom.openDonateBtn) this.dom.openDonateBtn.onclick = () => this.toggleDonate(true);
    if (this.dom.closeDonateBtn) this.dom.closeDonateBtn.onclick = () => this.toggleDonate(false);

    if (this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick = () => { navigator.clipboard.writeText(window.location.href).then(() => alert("Link Copied!")); };
    if (this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => {
        if (this.dom.promptDisplay) {
            this.dom.promptDisplay.select();
            navigator.clipboard.writeText(this.dom.promptDisplay.value).then(() => alert("Prompt Copied!"));
        }
    };
    if (this.dom.generatePromptBtn) this.dom.generatePromptBtn.onclick = () => {
        this.generatePrompt();
        if (this.dom.promptDisplay) {
            this.dom.promptDisplay.style.opacity = '0.5';
            setTimeout(() => this.dom.promptDisplay.style.opacity = '1', 150);
        }
    };

    if (this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => { if (navigator.share) { navigator.share({ title: "Follow Me", url: window.location.href }); } else { alert("Share not supported"); } };

    if (this.dom.chatShareBtn) this.dom.chatShareBtn.onclick = () => { window.location.href = `sms:?body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
    if (this.dom.emailShareBtn) this.dom.emailShareBtn.onclick = () => { window.location.href = `mailto:?subject=Follow%20Me%20App&body=Check%20out%20Follow%20Me:%20${window.location.href}`; };

    if (this.dom.btnCashMain) this.dom.btnCashMain.onclick = () => { window.open('https://cash.app/$jwo83', '_blank'); };
    if (this.dom.btnPaypalMain) this.dom.btnPaypalMain.onclick = () => { window.open('https://www.paypal.me/Oyster981', '_blank'); };

    document.querySelectorAll('.donate-quick-btn').forEach(btn => {
        btn.onclick = () => {
            const app = btn.dataset.app;
            const amt = btn.dataset.amount;
            if (app === 'cash') window.open(`https://cash.app/$jwo83/${amt}`, '_blank');
            if (app === 'paypal') window.open(`https://www.paypal.me/Oyster981/${amt}`, '_blank');
        };
    });

    if (this.dom.restoreBtn) this.dom.restoreBtn.onclick = () => { if (confirm("Factory Reset?")) this.callbacks.onReset(); };
    if (this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
    if (this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };
}
populateConfigDropdown() { const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { const o = document.createElement('option'); o.value = id; o.textContent = this.appSettings.profiles[id].name; return o; }); if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; } if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; } }
populateThemeDropdown() { const s = this.dom.themeSelect; if (!s) return; s.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); }); s.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Themes"; Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); }); s.appendChild(grp2); s.value = this.appSettings.activeTheme; }
openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.updateUIFromSettings(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); }
openSetup() {
    this.populateConfigDropdown();
    this.updateUIFromSettings();
    this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90');
}
closeSetup() { this.callbacks.onSave(); this.dom.setupModal.classList.add('opacity-0'); this.dom.setupModal.querySelector('div').classList.add('scale-90'); setTimeout(() => this.dom.setupModal.classList.add('pointer-events-none'), 300); }

generatePrompt() {
    if (!this.dom.promptDisplay) return;

    const ps = this.appSettings.runtimeSettings;
    const max = ps.currentInput === 'key12' ? 12 : 9;
    const speed = this.appSettings.playbackSpeed || 1.0;
    const machines = ps.machineCount || 1;
    const chunk = ps.simonChunkSize || 3;
    const delay = (ps.simonInterSequenceDelay / 1000) || 0;
    
    let instructions = "";
    
    if (machines > 1) {
        instructions = `MODE: MULTI-MACHINE AUTOPLAY (${machines} Machines).
        
        YOUR JOB:
        1. I will speak a batch of ${machines} numbers at once.
        2. You must immediately SORT them:
           - 1st number -> Machine 1
           - 2nd number -> Machine 2
           - 3rd number -> Machine 3 (if active), etc.
        3. IMMEDIATELY after hearing the numbers, you must READ BACK the sequences for all machines.
        
        READBACK RULES (Interleaved Chunking):
        - Recite the history in chunks of ${chunk}.
        - Order: Machine 1 (Chunk 1) -> Machine 2 (Chunk 1) -> ... -> Machine 1 (Chunk 2) -> Machine 2 (Chunk 2)...
        - Do not stop between machines. Flow through the list.
        - Pause ${delay} seconds between machine switches.`;
    } else {
        if (ps.currentMode === 'simon') {
            instructions = `MODE: SIMON SAYS (Single Machine).
            - The sequence grows by one number each round.
            - I will speak the NEW number.
            - You must add it to the list and READ BACK the ENTIRE list from the start.`;
        } else {
            instructions = `MODE: UNIQUE (Random/Non-Repeating).
            - Every round is a fresh random sequence.
            - I will speak a number. You simply repeat that number to confirm.
            - Keep a running list. If I say "Review", read the whole list.`;
        }
    }

    const promptText = `Act as a professional Sequence Caller for a memory skill game. 
You are the "Caller" (App). I am the "Player" (User).

SETTINGS:
- Max Number: ${max}
- Playback Speed: ${speed}x (Speak fast)
- Active Machines: ${machines}
- Chunk Size: ${chunk}

${instructions}

YOUR RULES:
1. Speak clearly but quickly. No fluff. No conversational filler.
2. If I get it wrong, correct me immediately.
3. If I say "Status", tell me the current round/sequence length.

START IMMEDIATELY upon my next input. Waiting for signal.`;

    this.dom.promptDisplay.value = promptText;
}

updateUIFromSettings() {
    const ps = this.appSettings.runtimeSettings;
    if (this.dom.input) this.dom.input.value = ps.currentInput;

    if (this.dom.mode) this.dom.mode.value = ps.currentMode;

    if (this.dom.machines) this.dom.machines.value = ps.machineCount;
    if (this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;
    if (this.dom.autoClear) this.dom.autoClear.checked = this.appSettings.isUniqueRoundsAutoClearEnabled;

    if (this.dom.autoplay) this.dom.autoplay.checked = this.appSettings.isAutoplayEnabled;
    if (this.dom.audio) this.dom.audio.checked = this.appSettings.isAudioEnabled;

    if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled;
    if (this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
    if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
    if (this.dom.showWelcome) this.dom.showWelcome.checked = this.appSettings.showWelcomeScreen;

    if (this.dom.hapticMorse) this.dom.hapticMorse.checked = this.appSettings.isHapticMorseEnabled;
    if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = this.appSettings.playbackSpeed.toFixed(1) || "1.0";
    if (this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize;
    if (this.dom.delay) this.dom.delay.value = (ps.simonInterSequenceDelay / 1000);

    // Voice Update
    if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.voicePitch || 1.0;
    if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.voiceRate || 1.0;
    if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.voiceVolume || 1.0;
    if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';

    if (this.dom.practiceMode) this.dom.practiceMode.checked = this.appSettings.isPracticeModeEnabled;
    if (this.dom.stealth1KeyToggle) this.dom.stealth1KeyToggle.checked = this.appSettings.isStealth1KeyEnabled;

    if (this.dom.longPressToggle) this.dom.longPressToggle.checked = (typeof this.appSettings.isLongPressAutoplayEnabled === 'undefined') ? true : this.appSettings.isLongPressAutoplayEnabled;

    if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.value = this.appSettings.sensorAudioThresh || -85;
    if (this.dom.calibCamSlider) this.dom.calibCamSlider.value = this.appSettings.sensorCamThresh || 30;

    if (this.dom.haptics) this.dom.haptics.checked = (typeof this.appSettings.isHapticsEnabled === 'undefined') ? true : this.appSettings.isHapticsEnabled;
    if (this.dom.speedDelete) this.dom.speedDelete.checked = (typeof this.appSettings.isSpeedDeletingEnabled === 'undefined') ? true : this.appSettings.isSpeedDeletingEnabled;

    if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
    if (this.dom.seqSize) this.dom.seqSize.value = Math.round(this.appSettings.uiScaleMultiplier * 100) || 100;
    if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
    
    if (this.dom.blackoutToggle) this.dom.blackoutToggle.checked = this.appSettings.isBlackoutFeatureEnabled;
    if (this.dom.blackoutGesturesToggle) this.dom.blackoutGesturesToggle.checked = this.appSettings.isBlackoutGesturesEnabled;

    // Language
    const lang = this.appSettings.generalLanguage || 'en';
    if (this.dom.quickLang) this.dom.quickLang.value = lang;
    if (this.dom.generalLang) this.dom.generalLang.value = lang;
    this.setLanguage(lang);
}
hexToHsl(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length === 1) r = "0" + r; if (g.length === 1) g = "0" + g; if (b.length === 1) b = "0" + b; return "#" + r + g + b; }
}
;
