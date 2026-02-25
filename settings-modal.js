// settings-modal.js
export function getSettingsModal() {
    return `
    <div id="settings-modal" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[80] transition-opacity duration-300 opacity-0 pointer-events-none overflow-y-auto">
        <div class="settings-modal-bg p-6 rounded-xl shadow-2xl max-w-2xl w-full transform scale-95 transition-transform duration-300 flex flex-col border border-custom my-8">
            <div class="flex items-center justify-between mb-6 border-b border-custom pb-4">
                <h2 class="text-2xl font-bold flex items-center gap-2">
                    <span class="text-primary-app">⚙️</span> 
                    <span data-i18n="settings_title">Application Settings</span>
                </h2>
                <button id="close-settings" class="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors text-xl">✕</button>
            </div>

            <div class="space-y-6">
                <div class="bg-black bg-opacity-20 p-4 rounded-lg border border-custom">
                    <label class="block text-xs font-bold uppercase tracking-wider text-muted-custom mb-3" data-i18n="profile_config">Profile Configuration</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <select id="config-select" class="settings-input w-full p-3 rounded font-bold border border-custom bg-black"></select>
                        </div>
                        <div class="flex space-x-2">
                            <button id="save-config" class="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded shadow-lg transition" data-i18n="save">Save</button>
                            <button id="delete-config" class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded shadow-lg transition" data-i18n="delete">Delete</button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="settings-group">
                        <label class="settings-label" data-i18n="game_mode">Game Mode</label>
                        <select id="game-mode" class="settings-input w-full p-3 rounded border border-custom">
                            <option value="follow">Follow Me (Standard)</option>
                            <option value="pattern">Pattern Matcher</option>
                            <option value="visual">Visual Recognition (AR)</option>
                        </select>
                    </div>
                    <div class="settings-group">
                        <label class="settings-label" data-i18n="input_layout">Input Layout</label>
                        <select id="input-layout" class="settings-input w-full p-3 rounded border border-custom">
                            <option value="key9">9-Key Grid (Standard)</option>
                            <option value="key12">12-Key Grid (Extended)</option>
                            <option value="linear">Linear Horizontal</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex items-center justify-between p-3 rounded-lg border border-custom bg-black bg-opacity-20">
                        <div class="flex flex-col">
                            <span class="font-bold text-sm" data-i18n="voice_control">Voice Commands</span>
                            <span class="text-[10px] text-muted-custom">Enable hands-free input</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="voice-toggle" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-app"></div>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-3 rounded-lg border border-custom bg-black bg-opacity-20">
                        <div class="flex flex-col">
                            <span class="font-bold text-sm" data-i18n="haptic_feedback">Haptics</span>
                            <span class="text-[10px] text-muted-custom">Vibrate on touch</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="haptic-toggle" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-app"></div>
                        </label>
                    </div>
                </div>

                <div class="bg-black bg-opacity-20 p-4 rounded-lg border border-custom">
                    <label class="block text-xs font-bold mb-4 text-muted-custom uppercase tracking-wider">Visual & UI Customization</label>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between mb-1">
                                <label class="text-sm font-semibold" data-i18n="ui_scale">Interface Scale</label>
                                <span id="ui-scale-display" class="text-xs font-mono">1.0x</span>
                            </div>
                            <input type="range" id="ui-scale-slider" min="0.5" max="1.5" step="0.05" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-app">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 pt-2">
                            <button id="open-theme-editor" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition text-sm font-bold flex items-center justify-center gap-2">
                                🎨 <span>Theme Editor</span>
                            </button>
                            <button id="open-calibration" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition text-sm font-bold flex items-center justify-center gap-2">
                                🎛️ <span>Calibration</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap gap-3 pt-4">
                    <button id="reset-tutorial" class="text-[10px] text-muted-custom hover:text-white underline">Reset Welcome Tutorial</button>
                    <button id="clear-cache" class="text-[10px] text-muted-custom hover:text-red-400 underline">Clear Data & Cache</button>
                </div>
            </div>

            <div class="mt-8 flex justify-end">
                <button id="save-settings-btn" class="px-10 py-3 bg-primary-app text-white rounded-lg font-bold shadow-lg hover:opacity-90 transition transform active:scale-95" data-i18n="apply_settings">APPLY CHANGES</button>
            </div>
        </div>
    </div>
    `;
}
