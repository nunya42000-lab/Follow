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

const LANG = {
    en: {
        quick_title: "👋 Quick Start", select_profile: "Select Profile", autoplay: "Autoplay", audio: "Audio", help_btn: "Help 📚", settings_btn: "Settings", dont_show: "Don't show again", play_btn: "PLAY", theme_editor: "🎨 Theme Editor",
        lbl_profiles: "Profiles", lbl_game: "Game", lbl_playback: "Playback", lbl_general: "General", lbl_mode: "Mode", lbl_input: "Input",
        blackout_gestures: "Blackout Gestures", timer_toggle: "Show Timer", counter_toggle: "Show Counter",
        help_stealth_detail: "Stealth Mode (1-Key) simplifies input by mapping the 12 primary values (1-12) to a single key press. The interpretation depends on context and mode (Simon/Unique). This is intended for high-speed, minimal-movement input.",
        help_blackout_detail: "Blackout Mode turns the entire screen black to eliminate visual distraction, allowing you to focus purely on audio cues and muscle memory. The app remains fully functional, but the UI is hidden. If Blackout Gestures are enabled, input switches to a 'no-look' touch system.",
        help_gesture_detail: "Blackout Gestures: A 'no-look' input system. Use touch gestures (swipes, taps) to represent values 1 through 12. Values 6 through 12 are represented by letters A through G (A=6, B=7, etc.) on a virtual 3x4 grid. A fully detailed guide follows the Haptic Morse Guide."
    },
    es: {
        quick_title: "👋 Inicio Rápido", select_profile: "Perfil", autoplay: "Auto-reproducción", audio: "Audio", help_btn: "Ayuda 📚", settings_btn: "Ajustes", dont_show: "No mostrar más", play_btn: "JUGAR", theme_editor: "🎨 Editor de Temas",
        lbl_profiles: "Perfiles", lbl_game: "Juego", lbl_playback: "Reproducción", lbl_general: "General", lbl_mode: "Modo", lbl_input: "Entrada",
        blackout_gestures: "Gestos de Pantalla Negra", timer_toggle: "Mostrar Temporizador", counter_toggle: "Mostrar Contador",
        help_stealth_detail: "El modo sigilo (1-tecla) simplifica la entrada al asignar los 12 valores primarios (1-12) a una sola pulsación de tecla. La interpretación depende del contexto y del modo (Simon/Único). Está diseñado para una entrada de alta velocidad y movimiento mínimo.",
        help_blackout_detail: "El modo de pantalla negra (Blackout) oscurece toda la pantalla para eliminar la distracción visual, permitiéndole concentrarse únicamente en las señales de audio y la memoria muscular. La aplicación sigue siendo completamente funcional, pero la interfaz de usuario está oculta. Si los gestos de pantalla negra están habilitados, la entrada cambia a un sistema táctil 'sin mirar'.",
        help_gesture_detail: "Gestos de Pantalla Negra: Un sistema de entrada 'sin mirar'. Utiliza gestos táctiles (deslizamientos, toques) para representar los valores del 1 al 12. Los valores del 6 al 12 se representan con las letras A a G (A=6, B=7, etc.) en una cuadrícula virtual de 3x4. Una guía detallada completa sigue a la Guía de Morse Háptico."
    }
};

export class SettingsManager {
    constructor(appSettings, callbacks, sensorEngine) {
        this.appSettings = appSettings; this.callbacks = callbacks; this.sensorEngine = sensorEngine; this.currentTargetKey = 'bubble';
        this.injectHeaderToggles(); 
        this.injectLongPressToggle();
        this.injectBlackoutGesturesToggle();
        this.injectGestureInputToggle(); 
        this.init();
    }

    init() {
        if (!document.getElementById('settings-modal')) {
            const div = document.createElement('div');
            div.id = 'settings-modal';
            div.className = 'fixed inset-0 z-50 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300';
            div.innerHTML = `
                <div class="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"></div>
                <div class="relative w-full max-w-lg h-[80vh] flex flex-col settings-modal-bg rounded-2xl shadow-2xl transform scale-90 transition-transform duration-300">
                    <div class="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-modal)] rounded-t-2xl">
                        <h2 class="text-xl font-bold">Settings</h2>
                        <button id="close-settings" class="p-2 rounded-full hover:bg-[var(--btn-bg)] transition-colors">✕</button>
                    </div>
                    
                    <div class="flex border-b border-[var(--border)] bg-[var(--btn-bg)] overflow-x-auto">
                        <button data-tab="general" class="flex-1 py-3 text-sm font-medium border-b-2 border-transparent transition-colors opacity-60 hover:opacity-100">General</button>
                        <button data-tab="playback" class="flex-1 py-3 text-sm font-medium border-b-2 border-transparent transition-colors opacity-60 hover:opacity-100">Playback</button>
                        <button data-tab="inputs" class="flex-1 py-3 text-sm font-medium border-b-2 border-transparent transition-colors opacity-60 hover:opacity-100">Inputs</button>
                        <button data-tab="appearance" class="flex-1 py-3 text-sm font-medium border-b-2 border-transparent transition-colors opacity-60 hover:opacity-100">Theme</button>
                    </div>
                    
                    <div id="settings-content" class="flex-1 overflow-y-auto p-4 space-y-6"></div>
                    
                    <div class="p-4 border-t border-[var(--border)] bg-[var(--bg-modal)] rounded-b-2xl flex justify-between">
                         <button id="btn-redeem" class="text-xs opacity-50 hover:opacity-100">Code</button>
                         <button id="reset-app-btn" class="text-red-500 text-sm font-bold">Reset App</button>
                    </div>
                </div>
            `;
            document.body.appendChild(div);

            document.getElementById('close-settings').onclick = () => this.closeSettings();
            document.getElementById('reset-app-btn').onclick = () => { if(confirm("Factory Reset?")) this.callbacks.onReset(); };
            document.getElementById('btn-redeem').onclick = () => this.toggleRedeem();

            document.querySelectorAll('#settings-modal button[data-tab]').forEach(b => {
                b.onclick = () => this.switchTab(b.dataset.tab);
            });
            
            // Redeem Modal
            const rModal = document.createElement('div');
            rModal.id = 'redeem-modal';
            rModal.className = 'fixed inset-0 z-[60] flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300 hidden';
            rModal.innerHTML = `
                <div class="absolute inset-0 bg-black bg-opacity-80"></div>
                <div class="relative bg-[var(--card-bg)] p-6 rounded-xl w-80 text-center transform scale-90 transition-transform">
                    <h3 class="text-lg font-bold mb-4">Enter Code</h3>
                    <input type="text" id="redeem-input" class="w-full p-2 rounded mb-4 text-black text-center uppercase font-mono" placeholder="CODE">
                    <div class="flex gap-2 justify-center">
                        <button id="redeem-cancel" class="px-4 py-2 rounded bg-gray-600">Cancel</button>
                        <button id="redeem-submit" class="px-4 py-2 rounded bg-green-600 font-bold">Submit</button>
                    </div>
                </div>
            `;
            document.body.appendChild(rModal);
            document.getElementById('redeem-cancel').onclick = () => this.toggleRedeem(false);
            document.getElementById('redeem-submit').onclick = () => this.handleRedeem();
        }
    }

    openSettings() {
        const m = document.getElementById('settings-modal');
        m.classList.remove('opacity-0', 'pointer-events-none');
        m.querySelector('div.relative').classList.remove('scale-90');
        this.switchTab(this.activeTab);
    }

    closeSettings() {
        const m = document.getElementById('settings-modal');
        m.classList.add('opacity-0', 'pointer-events-none');
        m.querySelector('div.relative').classList.add('scale-90');
        this.save();
    }
    
    toggleRedeem(show = true) {
        const m = document.getElementById('redeem-modal');
        if(show) {
            m.classList.remove('hidden');
            setTimeout(() => { m.classList.remove('opacity-0', 'pointer-events-none'); m.querySelector('div.relative').classList.remove('scale-90'); }, 10);
            document.getElementById('redeem-input').value = '';
            document.getElementById('redeem-input').focus();
        } else {
            m.classList.add('opacity-0', 'pointer-events-none');
            m.querySelector('div.relative').classList.add('scale-90');
            setTimeout(() => m.classList.add('hidden'), 300);
        }
    }
    
    handleRedeem() {
        const code = document.getElementById('redeem-input').value.trim().toUpperCase();
        if(code === 'BLACKOUT') {
            this.appSettings.isBlackoutFeatureEnabled = true;
            alert("🌑 Blackout Mode Unlocked! Shake device to toggle.");
        } else if(code === 'GESTURE') {
            this.appSettings.isGestureInputEnabled = true;
            alert("👆 Gesture Input Unlocked!");
        } else if(code === 'MORSE') {
            this.appSettings.isHapticMorseEnabled = true;
            alert("📳 Haptic Morse Unlocked!");
        } else if(code === 'STEALTH') {
            this.appSettings.isStealth1KeyEnabled = true;
            alert("🥷 Stealth Mode Unlocked! (Hold '1' to toggle)");
        } else {
            alert("Invalid Code");
            return;
        }
        this.save();
        this.toggleRedeem(false);
        this.updateHeaderVisibility();
    }

    switchTab(tab) {
        this.activeTab = tab;
        document.querySelectorAll('#settings-modal button[data-tab]').forEach(b => {
            b.style.borderColor = (b.dataset.tab === tab) ? 'var(--seq-bubble)' : 'transparent';
            b.style.opacity = (b.dataset.tab === tab) ? '1' : '0.6';
        });
        const c = document.getElementById('settings-content');
        c.innerHTML = '';
        
        if (tab === 'general') this.injectGeneralSettings(c);
        else if (tab === 'playback') this.injectPlaybackSettings(c);
        else if (tab === 'inputs') this.injectInputSettings(c);
        else if (tab === 'appearance') this.injectAppearanceSettings(c);
    }

    createRow(className="flex gap-4 mb-4") {
        const div = document.createElement('div');
        div.className = className;
        return div;
    }

    createToggle(label, value, onChange) {
        const div = document.createElement('div');
        div.className = "flex-1 p-3 rounded-lg bg-[var(--btn-bg)] border border-[var(--border)] flex justify-between items-center";
        div.innerHTML = `<span class="font-medium text-sm">${label}</span>
        <div class="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${value ? 'bg-green-500' : 'bg-gray-600'}">
            <span class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${value ? 'translate-x-4' : ''}"></span>
        </div>`;
        div.onclick = () => {
            const newState = !value;
            onChange(newState);
            this.switchTab(this.activeTab); 
        };
        return div;
    }
    
    createDropdown(label, options, value, onChange) {
        const div = document.createElement('div');
        div.className = "flex-1 p-2 flex flex-col";
        const l = document.createElement('label');
        l.className = "text-xs uppercase font-bold opacity-70 mb-1";
        l.textContent = label;
        const sel = document.createElement('select');
        sel.className = "w-full p-2 rounded bg-[var(--bg-main)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--seq-bubble)]";
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            if(String(opt.value) === String(value)) o.selected = true;
            sel.appendChild(o);
        });
        sel.onchange = (e) => onChange(e.target.value);
        div.appendChild(l);
        div.appendChild(sel);
        return div;
    }

    save() {
        if(this.callbacks.onSave) this.callbacks.onSave();
        this.updateUIFromSettings();
    }
    
    updateUIFromSettings() {
        if(this.callbacks.onUpdate) this.callbacks.onUpdate();
        this.updateHeaderVisibility();
    }

    updateHeaderVisibility() {
        const header = document.getElementById('aux-control-header');
        if(!header) return;
        
        const btnTimer = document.getElementById('header-timer-btn');
        const btnCounter = document.getElementById('header-counter-btn');
        const btnMic = document.getElementById('header-mic-btn');
        const btnCam = document.getElementById('header-cam-btn');
        
        if(btnTimer) btnTimer.classList.toggle('hidden', !this.appSettings.showTimer);
        if(btnCounter) btnCounter.classList.toggle('hidden', !this.appSettings.showCounter);
        if(btnMic) btnMic.classList.toggle('hidden', !this.appSettings.showMicBtn);
        if(btnCam) btnCam.classList.toggle('hidden', !this.appSettings.showCamBtn);
        
        const anyVisible = this.appSettings.showTimer || this.appSettings.showCounter || this.appSettings.showMicBtn || this.appSettings.showCamBtn;
        
        if(anyVisible) {
            header.classList.remove('hidden');
            document.body.style.paddingTop = "4.5rem";
        } else {
            header.classList.add('hidden');
            document.body.style.paddingTop = "env(safe-area-inset-top)";
        }
    }

    injectHeaderToggles() {
        // This is now handled inside injectGeneralSettings to keep tab refreshing consistent
    }

    injectLongPressToggle() { /* Handled in General Tab now */ }
    injectBlackoutGesturesToggle() { /* Handled in Inputs Tab */ }
    injectGestureInputToggle() { /* Handled in Inputs Tab */ }

    injectGeneralSettings(container) {
        // Row 0: NEW Timer & Counter Toggles (Top of General)
        const row0 = this.createRow();
        row0.appendChild(this.createToggle("Timer ⏱️", this.appSettings.showTimer, (v) => {
            this.appSettings.showTimer = v;
            this.save();
        }));
        row0.appendChild(this.createToggle("Counter #", this.appSettings.showCounter, (v) => {
            this.appSettings.showCounter = v;
            this.save();
        }));
        container.appendChild(row0);

        // Row 1: Profile & Mode
        const row1 = this.createRow();
        const profiles = Object.keys(this.appSettings.profiles).map(k => ({ value: k, label: this.appSettings.profiles[k].name }));
        row1.appendChild(this.createDropdown("Profile", profiles, this.appSettings.activeProfileId, (v) => this.callbacks.onProfileSwitch(v)));
        
        const modes = [{value:'simon', label:'Simon'}, {value:'unique', label:'Unique Rounds'}];
        row1.appendChild(this.createDropdown("Mode", modes, this.appSettings.runtimeSettings.currentMode, (v) => {
            this.appSettings.runtimeSettings.currentMode = v;
            this.callbacks.onUpdate('mode_switch');
            this.save();
        }));
        container.appendChild(row1);

        // Row 2: Haptic Feedback & Speed Delete
        const row2 = this.createRow();
        row2.appendChild(this.createToggle("Vibration", this.appSettings.isHapticsEnabled, (v) => { this.appSettings.isHapticsEnabled = v; this.save(); }));
        row2.appendChild(this.createToggle("Speed Delete", this.appSettings.isSpeedDeletingEnabled, (v) => { this.appSettings.isSpeedDeletingEnabled = v; this.save(); }));
        container.appendChild(row2);
        
        // Row 3: Long Press Autoplay
        const row3 = this.createRow();
        row3.appendChild(this.createToggle("Long Press 'Play'", this.appSettings.isLongPressAutoplayEnabled, (v) => { this.appSettings.isLongPressAutoplayEnabled = v; this.save(); }));
        container.appendChild(row3);

        // Row 4: Profile Management
        const pM = document.createElement('div');
        pM.className = "p-4 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] space-y-3";
        pM.innerHTML = `<h3 class="text-xs font-bold uppercase opacity-50 mb-2">Profile Management</h3>
        <input type="text" id="profile-rename-input" class="w-full p-2 rounded bg-[var(--bg-main)] border border-[var(--border)] mb-2" value="${this.appSettings.profiles[this.appSettings.activeProfileId].name}">
        <div class="grid grid-cols-2 gap-2">
            <button id="p-save" class="btn-input py-2 text-xs">Save Settings</button>
            <button id="p-new" class="btn-input py-2 text-xs">New Profile</button>
            <button id="p-del" class="btn-input py-2 text-xs text-red-400">Delete Profile</button>
        </div>`;
        container.appendChild(pM);
        
        container.querySelector('#profile-rename-input').onchange = (e) => this.callbacks.onProfileRename(e.target.value);
        container.querySelector('#p-save').onclick = () => this.callbacks.onProfileSave();
        container.querySelector('#p-new').onclick = () => { const n = prompt("Profile Name:"); if(n) this.callbacks.onProfileAdd(n); };
        container.querySelector('#p-del').onclick = () => { if(confirm("Delete Profile?")) this.callbacks.onProfileDelete(); };
    }

    injectPlaybackSettings(container) {
        // Row 1: Autoplay & Flash (👀)
        const row1 = this.createRow();
        row1.appendChild(this.createToggle("Autoplay", this.appSettings.isAutoplayEnabled, (v) => { 
            this.appSettings.isAutoplayEnabled = v; 
            if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = v; 
            this.save(); 
        }));
        row1.appendChild(this.createToggle("Flash 👀", this.appSettings.isFlashEnabled, (v) => { 
            this.appSettings.isFlashEnabled = v; 
            this.save(); 
        }));
        container.appendChild(row1);

        // Row 2: Audio (👂) & Haptic Morse (✋)
        const row2 = this.createRow();
        row2.appendChild(this.createToggle("Audio 👂", this.appSettings.isAudioEnabled, (v) => { 
            this.appSettings.isAudioEnabled = v; 
            if (this.dom.quickAudio) this.dom.quickAudio.checked = v; 
            this.save(); 
        }));
        row2.appendChild(this.createToggle("Haptic Morse ✋", this.appSettings.isHapticMorseEnabled, (v) => { 
            this.appSettings.isHapticMorseEnabled = v; 
            this.save(); 
        }));
        container.appendChild(row2);

        // Row 3: Speed & Haptic Pause
        const row3 = this.createRow();
        const speeds = [
            {value: 0.5, label: '0.5x (Slow)'}, {value: 0.75, label: '0.75x'}, 
            {value: 1.0, label: '1.0x (Normal)'}, {value: 1.25, label: '1.25x'}, 
            {value: 1.5, label: '1.5x (Fast)'}, {value: 2.0, label: '2.0x'}, {value: 3.0, label: '3.0x'}
        ];
        row3.appendChild(this.createDropdown("Speed", speeds, this.appSettings.playbackSpeed, (v) => {
            this.appSettings.playbackSpeed = parseFloat(v);
            this.save();
            this.generatePrompt();
        }));

        const pauses = [
            {value: 0.0, label: 'None'}, {value: 0.1, label: '0.1s'}, {value: 0.2, label: '0.2s'}, 
            {value: 0.3, label: '0.3s'}, {value: 0.4, label: '0.4s'}, {value: 0.5, label: '0.5s'}
        ];
        row3.appendChild(this.createDropdown("Haptic Pause", pauses, this.appSettings.hapticPause, (v) => {
            this.appSettings.hapticPause = parseFloat(v);
            this.save();
        }));
        container.appendChild(row3);

        // Row 4: Chunk Size & Delay
        const row4 = this.createRow();
        const chunks = [
            {value: 1, label: '1'}, {value: 2, label: '2'}, {value: 3, label: '3'}, 
            {value: 4, label: '4'}, {value: 5, label: '5'}, {value: 10, label: '10'}
        ];
        row4.appendChild(this.createDropdown("Chunk Size", chunks, this.appSettings.runtimeSettings.simonChunkSize, (v) => {
            this.appSettings.runtimeSettings.simonChunkSize = parseInt(v);
            this.save();
            this.generatePrompt();
        }));

        const delays = [
            {value: 0, label: 'None'}, {value: 200, label: '0.2s'}, {value: 400, label: '0.4s'}, 
            {value: 600, label: '0.6s'}, {value: 800, label: '0.8s'}, {value: 1000, label: '1.0s'}
        ];
        row4.appendChild(this.createDropdown("Inter-Sequence Delay", delays, this.appSettings.runtimeSettings.simonInterSequenceDelay, (v) => {
            this.appSettings.runtimeSettings.simonInterSequenceDelay = parseInt(v);
            this.save();
            this.generatePrompt();
        }));
        container.appendChild(row4);

        // Voice Preset Section
        const vp = document.createElement('div');
        vp.className = "p-4 mt-4 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] space-y-3";
        vp.innerHTML = `<h3 class="text-xs font-bold uppercase opacity-50 mb-2">Voice Settings</h3>
        <select id="voice-preset-select" class="w-full p-2 rounded bg-[var(--bg-main)] border border-[var(--border)] mb-2 text-sm"></select>
        <div class="space-y-4">
            <div><div class="flex justify-between text-xs mb-1"><span>Pitch</span><span id="vp-pitch-val"></span></div><input type="range" id="voice-pitch" min="0.1" max="2.0" step="0.1" class="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer"></div>
            <div><div class="flex justify-between text-xs mb-1"><span>Rate</span><span id="vp-rate-val"></span></div><input type="range" id="voice-rate" min="0.1" max="3.0" step="0.1" class="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer"></div>
            <div><div class="flex justify-between text-xs mb-1"><span>Volume</span><span id="vp-vol-val"></span></div><input type="range" id="voice-volume" min="0" max="1" step="0.1" class="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer"></div>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2">
            <button id="test-voice-btn" class="btn-input py-2 text-xs">Test Voice</button>
            <button id="voice-preset-save" class="btn-input py-2 text-xs">Save Updates</button>
            <button id="voice-preset-add" class="btn-input py-2 text-xs">New Preset</button>
            <button id="voice-preset-rename" class="btn-input py-2 text-xs">Rename</button>
            <button id="voice-preset-delete" class="btn-input py-2 text-xs text-red-400 col-span-2">Delete Preset</button>
        </div>`;
        container.appendChild(vp);
        
        // Re-bind voice DOM elements since they were just recreated
        this.dom.voicePresetSelect = container.querySelector('#voice-preset-select');
        this.dom.voicePitch = container.querySelector('#voice-pitch');
        this.dom.voiceRate = container.querySelector('#voice-rate');
        this.dom.voiceVolume = container.querySelector('#voice-volume');
        this.dom.voiceTestBtn = container.querySelector('#test-voice-btn');
        this.dom.voicePresetAdd = container.querySelector('#voice-preset-add');
        this.dom.voicePresetSave = container.querySelector('#voice-preset-save');
        this.dom.voicePresetRename = container.querySelector('#voice-preset-rename');
        this.dom.voicePresetDelete = container.querySelector('#voice-preset-delete');
        
        this.initListeners(); // Re-attach listeners to new elements
        this.populateVoicePresetDropdown();
        
        // Update range inputs visual state
        this.dom.voicePitch.value = this.appSettings.voicePitch;
        this.dom.voiceRate.value = this.appSettings.voiceRate;
        this.dom.voiceVolume.value = this.appSettings.voiceVolume;
    }

    injectInputSettings(container) {
        // Input Method
        const row1 = this.createRow();
        const inputs = [{value:'key9', label:'Numpad (9)'}, {value:'key12', label:'Numpad (12)'}, {value:'piano', label:'Piano'}];
        row1.appendChild(this.createDropdown("Input Layout", inputs, this.appSettings.runtimeSettings.currentInput, (v) => {
            this.appSettings.runtimeSettings.currentInput = v;
            this.callbacks.onSave();
            this.callbacks.onUpdate();
            this.generatePrompt();
        }));
        
        // Auto-Input (Mic/Cam)
        const autoInputs = [{value:'none', label:'Touch Only'}, {value:'mic', label:'Microphone'}, {value:'cam', label:'Camera'}, {value:'both', label:'Mic & Camera'}];
        row1.appendChild(this.createDropdown("Auto-Input", autoInputs, this.appSettings.autoInputMode || 'none', (v) => {
            this.appSettings.autoInputMode = v;
            this.appSettings.showMicBtn = (v === 'mic' || v === 'both');
            this.appSettings.showCamBtn = (v === 'cam' || v === 'both');
            this.callbacks.onSave();
            this.callbacks.onUpdate();
            this.updateHeaderVisibility();
        }));
        container.appendChild(row1);
        
        // Sensor Calibration Access
        const rowCal = this.createRow();
        const btnCal = document.createElement('button');
        btnCal.className = "w-full py-3 rounded-lg bg-[var(--btn-bg)] border border-[var(--border)] font-bold text-sm hover:bg-[var(--seq-bubble)] transition-colors";
        btnCal.textContent = "Open Sensor Calibration 🎛️";
        btnCal.onclick = () => this.openCalibration();
        rowCal.appendChild(btnCal);
        container.appendChild(rowCal);

        // Gesture Settings
        const gesDiv = document.createElement('div');
        gesDiv.className = "p-4 mt-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] space-y-3";
        gesDiv.innerHTML = `<div class="flex justify-between items-center mb-2">
            <h3 class="text-xs font-bold uppercase opacity-50">Gesture Mappings</h3>
            <div class="flex items-center gap-2">
                <label class="text-xs font-bold">Enabled</label>
                <input type="checkbox" id="gesture-input-toggle-inner" class="h-4 w-4 accent-indigo-500">
            </div>
        </div>
        <div id="mapping-container" class="space-y-2 max-h-60 overflow-y-auto pr-1"></div>`;
        container.appendChild(gesDiv);

        this.dom.gestureToggle = gesDiv.querySelector('#gesture-input-toggle-inner');
        this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
        this.dom.gestureToggle.onchange = (e) => {
            this.appSettings.isGestureInputEnabled = e.target.checked;
            this.callbacks.onSave();
            this.callbacks.onUpdate();
        };

        const mapCont = gesDiv.querySelector('#mapping-container');
        // We'll hijack the existing DOM pointers for the mapping containers to point to this new temporary container
        // depending on active input.
        const currentInput = this.appSettings.runtimeSettings.currentInput;
        if(currentInput === 'key9') this.dom.mapping9Container = mapCont;
        else if(currentInput === 'key12') this.dom.mapping12Container = mapCont;
        else this.dom.mappingPianoContainer = mapCont;
        
        this.populateMappingUI();
    }

    injectAppearanceSettings(container) {
        // Theme Select
        const row1 = this.createRow();
        const themeSelect = document.createElement('select');
        themeSelect.id = "theme-select-inner"; // distinct ID
        themeSelect.className = "w-full p-3 rounded-lg bg-[var(--btn-bg)] border border-[var(--border)] text-sm focus:outline-none";
        themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); };
        
        // Populate Themes
        const grp1 = document.createElement('optgroup'); grp1.label = "Built-in";
        Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; if(k===this.appSettings.activeTheme) el.selected=true; grp1.appendChild(el); });
        themeSelect.appendChild(grp1);
        
        const grp2 = document.createElement('optgroup'); grp2.label = "My Themes";
        Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; if(k===this.appSettings.activeTheme) el.selected=true; grp2.appendChild(el); });
        themeSelect.appendChild(grp2);
        
        row1.appendChild(themeSelect);
        container.appendChild(row1);

        // Theme Actions
        const rowActions = this.createRow();
        const btnNew = document.createElement('button'); btnNew.className = "btn-input flex-1 py-3 text-xs"; btnNew.textContent = "New Theme";
        btnNew.onclick = () => { const n = prompt("Name:"); if (n) { const id = 'c_' + Date.now(); this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'], name: n }; this.appSettings.activeTheme = id; this.callbacks.onSave(); this.callbacks.onUpdate(); this.switchTab('appearance'); this.openThemeEditor(); } };
        
        const btnEdit = document.createElement('button'); btnEdit.className = "btn-input flex-1 py-3 text-xs"; btnEdit.textContent = "Edit Colors";
        btnEdit.onclick = () => this.openThemeEditor();
        
        const btnDel = document.createElement('button'); btnDel.className = "btn-input flex-1 py-3 text-xs text-red-400"; btnDel.textContent = "Delete";
        btnDel.onclick = () => { if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in."); if (confirm("Delete?")) { delete this.appSettings.customThemes[this.appSettings.activeTheme]; this.appSettings.activeTheme = 'default'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.switchTab('appearance'); } };

        rowActions.appendChild(btnNew);
        rowActions.appendChild(btnEdit);
        rowActions.appendChild(btnDel);
        container.appendChild(rowActions);

        // UI Scaling
        const scaleDiv = document.createElement('div');
        scaleDiv.className = "p-4 mt-4 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] space-y-4";
        scaleDiv.innerHTML = `<h3 class="text-xs font-bold uppercase opacity-50">UI Scaling</h3>
        <div><div class="flex justify-between text-xs mb-1"><span>Global Zoom</span><span id="ui-zoom-val">${this.appSettings.globalUiScale}%</span></div><input type="range" id="ui-scale-slider" min="50" max="150" step="5" value="${this.appSettings.globalUiScale}" class="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer"></div>
        <div><div class="flex justify-between text-xs mb-1"><span>Number Size</span><span id="ui-num-val">${Math.round(this.appSettings.uiScaleMultiplier*100)}%</span></div><input type="range" id="ui-num-slider" min="50" max="150" step="5" value="${Math.round(this.appSettings.uiScaleMultiplier*100)}" class="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer"></div>`;
        container.appendChild(scaleDiv);
        
        scaleDiv.querySelector('#ui-scale-slider').oninput = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); container.querySelector('#ui-zoom-val').textContent = e.target.value + '%'; this.callbacks.onUpdate(); };
        scaleDiv.querySelector('#ui-num-slider').oninput = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value)/100; container.querySelector('#ui-num-val').textContent = e.target.value + '%'; this.callbacks.onUpdate(); };
    }

    populateMappingUI() {
        if(!this.dom) return;
        if(!this.appSettings) return;
        if(!this.appSettings.gestureMappings) this.appSettings.gestureMappings = {};

        // We only populate the container that is currently visible in the Inputs tab
        // based on the logic in injectInputSettings which assigns one of these based on currentInput
        const container9 = this.dom.mapping9Container;
        const container12 = this.dom.mapping12Container;
        const containerPiano = this.dom.mappingPianoContainer;

        const gestureOptions = [ 'tap','double_tap','long_tap', 'tap_2f','double_tap_2f','long_tap_2f', 'tap_3f','double_tap_3f','long_tap_3f', 'swipe_left','swipe_right','swipe_up','swipe_down', 'swipe_nw','swipe_ne','swipe_se','swipe_sw', 'swipe_left_2f','swipe_right_2f','swipe_up_2f','swipe_down_2f', 'swipe_left_3f','swipe_right_3f','swipe_up_3f','swipe_down_3f' ];
        const morseOptions = ['.', '..', '...', '-', '-.', '-..', '--', '--.', '---', '...-', '.-.', '.--', '..-','.-'];

        const makeRow = (labelText, keyName, mappingId) => {
            const wrapper = document.createElement('div');
            wrapper.className = "flex items-center space-x-2 mapping-row border-b border-[var(--border)] pb-2 mb-2 last:border-0";
            const lbl = document.createElement('div');
            lbl.className = "text-sm font-semibold w-16 flex-shrink-0";
            lbl.textContent = labelText;
            
            const gestureSelect = document.createElement('select');
            gestureSelect.className = "settings-input p-1 rounded text-xs flex-grow w-24";
            gestureSelect.id = mappingId + "-gesture";
            gestureOptions.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o.replace(/_/g,' '); gestureSelect.appendChild(opt); });
            
            const morseSelect = document.createElement('select');
            morseSelect.className = "settings-input p-1 rounded text-xs w-16 flex-shrink-0 font-mono";
            morseSelect.id = mappingId + "-morse";
            morseOptions.forEach(m => { const opt = document.createElement('option'); opt.value = m; opt.textContent = m; morseSelect.appendChild(opt); });

            wrapper.appendChild(lbl);
            wrapper.appendChild(gestureSelect);
            wrapper.appendChild(morseSelect);

            const gm = this.appSettings.gestureMappings || {};
            if(gm[keyName]) { gestureSelect.value = gm[keyName].gesture || gestureSelect.value; morseSelect.value = gm[keyName].morse || morseSelect.value; }

            const save = () => {
                this.appSettings.gestureMappings = this.appSettings.gestureMappings || {};
                this.appSettings.gestureMappings[keyName] = { gesture: gestureSelect.value, morse: morseSelect.value };
                this.callbacks.onSave && this.callbacks.onSave();
            };
            gestureSelect.addEventListener('change', save);
            morseSelect.addEventListener('change', save);
            return wrapper;
        };

        if(container9) { container9.innerHTML = ''; for(let i=1;i<=9;i++){ container9.appendChild(makeRow('Key '+i, 'k9_' + i, 'map9_'+i)); } }
        if(container12) { container12.innerHTML = ''; for(let i=1;i<=12;i++){ container12.appendChild(makeRow('Key '+i, 'k12_' + i, 'map12_'+i)); } }
        if(containerPiano) { containerPiano.innerHTML = ''; const pianoOrder = ['C','D','E','F','G','A','B','1','2','3','4','5']; pianoOrder.forEach((id) => { containerPiano.appendChild(makeRow('Note '+id, 'piano_' + id, 'mapp_' + id)); }); }

        if(!this.appSettings.gestureMappings || Object.keys(this.appSettings.gestureMappings).length === 0) {
            this.applyDefaultGestureMappings();
            this.callbacks.onSave && this.callbacks.onSave();
            setTimeout(()=>{ this.populateMappingUI(); }, 50);
        }
    }

    applyDefaultGestureMappings() {
        this.appSettings.gestureMappings = this.appSettings.gestureMappings || {};
        const defs = {
            'k9_1': { gesture: 'tap', morse: '.' }, 'k9_2': { gesture: 'double_tap', morse: '..' }, 'k9_3': { gesture: 'long_tap', morse: '...' }, 'k9_4': { gesture: 'tap_2f', morse: '-' }, 'k9_5': { gesture: 'double_tap_2f', morse: '-.' }, 'k9_6': { gesture: 'long_tap_2f', morse: '-..' }, 'k9_7': { gesture: 'tap_3f', morse: '--' }, 'k9_8': { gesture: 'double_tap_3f', morse: '--.' }, 'k9_9': { gesture: 'long_tap_3f', morse: '---' },
            'k12_1': { gesture: 'swipe_left', morse: '.' }, 'k12_2': { gesture: 'swipe_down', morse: '..' }, 'k12_3': { gesture: 'swipe_up', morse: '...' }, 'k12_4': { gesture: 'swipe_right', morse: '...-' }, 'k12_5': { gesture: 'swipe_left_2f', morse: '-' }, 'k12_6': { gesture: 'swipe_down_2f', morse: '-.' }, 'k12_7': { gesture: 'swipe_up_2f', morse: '-..' }, 'k12_8': { gesture: 'swipe_right_2f', morse: '-.-' }, 'k12_9': { gesture: 'swipe_left_3f', morse: '--' }, 'k12_10': { gesture: 'swipe_down_3f', morse: '--.' }, 'k12_11': { gesture: 'swipe_up_3f', morse: '--..' }, 'k12_12': { gesture: 'swipe_right_3f', morse: '---' },
            'piano_C': { gesture: 'swipe_nw', morse: '.' }, 'piano_D': { gesture: 'swipe_left', morse: '..' }, 'piano_E': { gesture: 'swipe_sw', morse: '.-' }, 'piano_F': { gesture: 'swipe_down', morse: '...' }, 'piano_G': { gesture: 'swipe_se', morse: '..-' }, 'piano_A': { gesture: 'swipe_right', morse: '.-.' }, 'piano_B': { gesture: 'swipe_ne', morse: '.--' }, 'piano_1': { gesture: 'swipe_left_2f', morse: '-' }, 'piano_2': { gesture: 'swipe_nw_2f', morse: '-.' }, 'piano_3': { gesture: 'swipe_up_2f', morse: '--' }, 'piano_4': { gesture: 'swipe_ne_2f', morse: '-..' }, 'piano_5': { gesture: 'swipe_right_2f', morse: '-.-' }
        };
        this.appSettings.gestureMappings = Object.assign({}, defs, this.appSettings.gestureMappings || {});
    }
}


