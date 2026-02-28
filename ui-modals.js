// ui-modals.js
import {
    getSettingsModal
} from './settings-modal.js';
import {
    getDeveloperModal
} from './developer-modal.js';
import {
    getHelpModal
} from './help-modal.js';

export function injectModals() {
    const modalContainer = document.createElement('div');
    modalContainer.id = "injected-modals";

    // Construct the inner HTML by combining the base modals and the imported ones
    modalContainer.innerHTML = `
        
    <div id="game-setup-modal" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] transition-opacity duration-300 opacity-0 pointer-events-none">
        <div class="settings-modal-bg p-6 rounded-xl shadow-2xl max-w-lg w-full transform scale-90 transition-transform duration-300 flex flex-col relative border border-custom">
            <div class="flex items-center justify-between border-b border-custom pb-3 mb-4 relative">
                <div class="flex items-center space-x-2">
                    <button id="quick-resize-down" class="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition shadow border border-gray-600 text-xl">-</button>
                    <button id="quick-resize-up" class="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition shadow border border-gray-600 text-xl">+</button>
                </div>
                
                <h3 class="text-2xl font-bold text-center flex-grow">
                    <span id="dev-secret-trigger" class="cursor-pointer">FOLLOW ME</span>
                </h3>
               
                <select id="quick-lang-select" class="bg-black bg-opacity-30 text-white text-xs rounded p-2 border border-gray-600">
                    <option value="en">🇺🇸 EN</option>
                    <option value="es">🇲🇽 ES</option>
                </select>
            </div>
            <div class="overflow-y-auto py-2 px-1">
                <div class="mb-6">
                    <label class="block text-sm font-semibold mb-2 text-muted-custom" data-i18n="select_profile">Select Profile</label>
                    <select id="quick-config-select" class="settings-input w-full h-12 px-4 py-2 text-lg font-semibold shadow-sm rounded"></select>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="flex items-center justify-between settings-input p-3 rounded-lg border border-custom">
                        <label class="font-semibold" data-i18n="autoplay">Autoplay</label>
                        <input type="checkbox" id="quick-autoplay-toggle" class="h-6 w-6 rounded accent-indigo-500">
                    </div>
                    <div class="flex items-center justify-between settings-input p-3 rounded-lg border border-custom">
                        <label class="font-semibold" data-i18n="audio">Audio</label>
                        <input type="checkbox" id="quick-audio-toggle" class="h-6 w-6 rounded accent-indigo-500">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-2">
                    <button id="quick-open-help" class="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition" data-i18n="help_btn">Help 📚</button>
                    <button id="quick-open-settings" class="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition" data-i18n="settings_btn">Settings</button>
                </div>
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-custom mt-2">
                <label class="flex items-center text-sm text-muted-custom">
                    <input type="checkbox" id="dont-show-welcome-toggle" class="mr-2 rounded"> 
                    <span data-i18n="dont_show">Don't show again</span>
                </label>
                <button id="close-game-setup-modal" class="px-8 py-3 text-white bg-primary-app hover:opacity-90 rounded-lg font-bold shadow-lg transition transform active:scale-95" data-i18n="play_btn">PLAY</button>
            </div>
        </div>
    </div>

    <div id="theme-editor-modal" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[100] transition-opacity duration-300 opacity-0 pointer-events-none">
        <div class="settings-modal-bg p-6 rounded-xl shadow-2xl max-w-md w-full transform scale-90 transition-transform duration-300 flex flex-col border border-custom max-h-[95vh] overflow-hidden">
            <h3 class="text-xl font-bold mb-4" data-i18n="theme_editor">🎨 Theme Editor</h3>
            <div class="overflow-y-auto px-1 flex-grow">
                <div class="mb-4"><label class="block text-xs font-bold mb-1 text-muted-custom">Theme Name</label><input type="text" id="theme-name-input" class="settings-input w-full p-2 rounded border border-custom" placeholder="My Theme"></div>
                <div class="mb-4"><label class="block text-xs font-bold mb-2 text-muted-custom">Select Element:</label>
                    <div class="grid grid-cols-3 gap-2"><button class="target-btn active p-2 text-xs font-bold rounded border border-custom bg-primary-app" data-target="bgMain">Background</button><button class="target-btn p-2 text-xs font-bold rounded border border-custom opacity-60" data-target="bgCard">Cards/Modals</button><button class="target-btn p-2 text-xs font-bold rounded border border-custom opacity-60" data-target="bubble">Seq Bubble</button><button class="target-btn p-2 text-xs font-bold rounded border border-custom opacity-60" data-target="btn">Keypad Btn</button><button class="target-btn p-2 text-xs font-bold rounded border border-custom opacity-60" data-target="text">Text/Num</button></div>
                </div>
                <div class="mb-4"><label class="block text-xs font-bold mb-2 text-muted-custom">Palette</label>
                    <div id="color-grid" class="grid grid-cols-10 gap-1 mb-3 h-40 overflow-y-auto border border-gray-700 p-1 rounded"></div>
                    <div id="fine-tune-container" class="hidden bg-black bg-opacity-20 p-3 rounded border border-gray-700"><label class="block text-xs font-bold mb-2">Fine Tune</label><div class="flex space-x-2 items-center"><div id="fine-tune-preview" class="w-8 h-8 rounded border border-gray-500"></div><div class="flex-grow space-y-1"><input type="range" id="ft-hue" min="0" max="360" class="w-full h-1 bg-gray-600 appearance-none rounded"><input type="range" id="ft-sat" min="0" max="100" class="w-full h-1 bg-gray-600 appearance-none rounded"><input type="range" id="ft-lit" min="0" max="100" class="w-full h-1 bg-gray-600 appearance-none rounded"></div></div></div>
                    <button id="toggle-fine-tune" class="text-xs underline mt-1 text-blue-400">Show Fine Tune Controls</button>
                </div>
                <div class="mb-4 p-4 rounded border border-custom transition-colors" id="theme-preview-box"><div class="flex justify-between items-center mb-2"><span class="font-bold">Preview</span><button class="px-3 py-1 rounded text-sm font-bold transition-colors" id="preview-btn">Bubble</button></div><div class="p-4 rounded font-bold text-center text-sm transition-colors" id="preview-card">Keypad Button</div></div>
            </div>
            <div class="flex space-x-3 mt-2 pt-3 border-t border-custom"><button id="cancel-theme-btn" class="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold">Cancel</button><button id="save-theme-btn" class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">Save Theme</button></div>
        </div>
    </div>

    <div id="redeem-modal" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[130] transition-opacity duration-300 opacity-0 pointer-events-none">
        <div class="relative w-full max-w-lg h-[95vh] flex flex-col items-center justify-center p-4">
            <button id="close-redeem-btn" class="absolute top-4 right-4 z-50 bg-gray-800 text-white rounded-full w-10 h-10 font-bold text-xl shadow-lg border border-gray-600">✕</button>
            <div class="absolute top-16 right-4 z-50 flex flex-col gap-3">
                <button id="redeem-zoom-in" class="bg-gray-800 text-white rounded-full w-10 h-10 font-bold text-xl shadow-lg border border-gray-600 active:bg-gray-700">+</button>
                <button id="redeem-zoom-out" class="bg-gray-800 text-white rounded-full w-10 h-10 font-bold text-xl shadow-lg border border-gray-600 active:bg-gray-700">-</button>
            </div>
            <div class="bg-white p-2 rounded-lg shadow-2xl w-full h-full flex items-center justify-center overflow-hidden">
                <img id="redeem-img" src="redeem.jpg" alt="Redeem Barcode" class="w-full h-full object-contain transition-transform duration-200">
            </div>
        </div>
    </div>

    <div id="calibration-modal" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[110] transition-opacity duration-300 opacity-0 pointer-events-none">
        <div class="settings-modal-bg p-6 rounded-xl shadow-2xl max-w-md w-full border border-custom">
            <h3 class="text-xl font-bold mb-4">🎛️ Sensor Calibration</h3>
            <div class="mb-6"><div class="flex justify-between mb-1"><label class="font-bold text-sm">Audio Threshold</label><span id="audio-val-display" class="text-xs font-mono">-85dB</span></div><div class="h-6 w-full bg-gray-800 rounded relative mb-2 overflow-hidden border border-gray-600"><div id="calib-audio-bar" class="absolute top-0 left-0 h-full bg-green-500 transition-all duration-75" style="width: 0%"></div><div id="calib-audio-marker" class="absolute top-0 h-full w-1 bg-white shadow" style="left: 20%"></div></div><input type="range" id="calib-audio-slider" min="-100" max="-30" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"><p class="text-[10px] text-gray-400 mt-1">Adjust until the bar stays below the white line when silent, but jumps past it when the machine beeps.</p></div>
            <div class="mb-6"><div class="flex justify-between mb-1"><label class="font-bold text-sm">Camera Sensitivity</label><span id="cam-val-display" class="text-xs font-mono">30</span></div><div class="h-6 w-full bg-gray-800 rounded relative mb-2 overflow-hidden border border-gray-600"><div id="calib-cam-bar" class="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-75" style="width: 0%"></div><div id="calib-cam-marker" class="absolute top-0 h-full w-1 bg-white shadow" style="left: 30%"></div></div><input type="range" id="calib-cam-slider" min="5" max="100" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"><p class="text-[10px] text-gray-400 mt-1">Adjust until the bar stays below the line, but jumps past it when the screen flashes color.</p></div>
            <div class="flex justify-end"><button id="close-calibration-btn" class="px-6 py-2 bg-primary-app text-white rounded font-bold">Done</button></div>
        </div>
    </div>

    <div id="donate-modal" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[140] transition-opacity duration-300 opacity-0 pointer-events-none">
        <div class="settings-modal-bg p-6 rounded-xl shadow-2xl max-w-sm w-full transform scale-90 transition-transform duration-300 border border-custom flex flex-col text-center">
            <h3 class="text-2xl font-bold mb-2">Buy me a Coffee? ☕</h3>
            <p class="text-sm opacity-80 mb-6">If this app helps you win, consider sending a tip!</p>
            
            <div class="space-y-6">
                <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <button id="btn-cashapp-main" class="w-full bg-[#00D632] hover:bg-[#00bf2c] text-white font-bold py-3 rounded-lg mb-3 shadow-lg flex items-center justify-center text-lg">
                        <span class="mr-2">💸</span> Cash App
                    </button>
                    <div class="grid grid-cols-7 gap-1">
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="cash" data-amount="1">☕</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="cash" data-amount="2">🍦</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="cash" data-amount="3">🍺</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="cash" data-amount="5">🍔</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="cash" data-amount="10">🍕</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="cash" data-amount="20">🥩</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="cash" data-amount="50">🦞</button>
                    </div>
                </div>

                <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <button id="btn-paypal-main" class="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold py-3 rounded-lg mb-3 shadow-lg flex items-center justify-center text-lg">
                        <span class="mr-2">🅿️</span> PayPal
                    </button>
                    <div class="grid grid-cols-7 gap-1">
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="paypal" data-amount="1">☕</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="paypal" data-amount="2">🍦</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="paypal" data-amount="3">🍺</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="paypal" data-amount="5">🍔</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="paypal" data-amount="10">🍕</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="paypal" data-amount="20">🥩</button>
                        <button class="donate-quick-btn text-xl hover:scale-110 transition-transform" data-app="paypal" data-amount="50">🦞</button>
                    </div>
                </div>
            </div>

            <button id="close-donate-btn" class="mt-6 w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold">Close</button>
        </div>
    </div>

    <div id="share-modal" class="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-end z-[70] transition-opacity duration-300 opacity-0 pointer-events-none">
        <div class="share-sheet p-6 text-center flex flex-col items-center border-t border-gray-700 shadow-2xl transform translate-y-full transition-transform duration-300">
            <div class="w-12 h-1 bg-gray-600 rounded-full mb-4"></div> <div class="bg-white p-2 rounded-lg mb-6 shadow-inner"><img src="qr.jpg" alt="QR Code" class="w-64 h-64 object-contain"></div>
            <div class="flex items-center w-full mb-6"><div class="share-app-icon mr-4">🌎</div><div class="text-left flex-grow"><h3 class="text-lg font-bold">Follow Me</h3><p class="text-xs opacity-70 text-truncate w-48">https://nunya42000-lab.github.io/Follow/</p></div><button id="copy-link-button" class="p-2 bg-gray-700 rounded hover:bg-gray-600 text-white">📋</button></div>
            <div class="grid grid-cols-4 gap-4 w-full">
                <button id="native-share-button" class="flex flex-col items-center gap-1 opacity-80 hover:opacity-100"><div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl">📤</div><span class="text-xs">Share</span></button>
                <button id="chat-share-button" class="flex flex-col items-center gap-1 opacity-80 hover:opacity-100"><div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-xl">💬</div><span class="text-xs">Chat</span></button>
                <button id="email-share-button" class="flex flex-col items-center gap-1 opacity-80 hover:opacity-100"><div class="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-xl">📧</div><span class="text-xs">Email</span></button>
                <button id="close-share" class="flex flex-col items-center gap-1 opacity-80 hover:opacity-100"><div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl">✕</div><span class="text-xs">Close</span></button>
            </div>
        </div>
    </div>
                
    <div id="comment-modal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[120] transition-opacity duration-300 opacity-0 pointer-events-none hidden">
        <div class="settings-modal-bg p-6 rounded-xl shadow-2xl max-w-sm w-full transform scale-90 transition-transform duration-300 border border-custom">
             <h3 class="font-bold text-lg mb-4">Send Feedback 💬</h3>
             <input type="text" id="comment-username" class="settings-input w-full p-2 rounded mb-2 text-sm" placeholder="Name (Optional)">
             <textarea id="comment-message" class="settings-input w-full p-2 rounded mb-4 text-sm h-24 resize-none" placeholder="Message..."></textarea>
             <div id="comments-list-container" class="max-h-32 overflow-y-auto mb-4 text-xs"></div>
             <div class="flex space-x-2"><button id="close-comment-modal" class="flex-1 bg-gray-700 py-2 rounded text-white font-bold text-xs">Close</button><button id="submit-comment-btn" class="flex-1 bg-blue-600 py-2 rounded text-white font-bold text-xs">Send</button></div>
        </div>
    </div>
    
    ${getSettingsModal()}
    ${getDeveloperModal()}
    ${getHelpModal()}
   `;

    // Inserts the modals right at the top of the body
    document.body.insertBefore(modalContainer, document.body.firstChild);
}