// developer-modal.js
export function getDeveloperModal() {
    return `
    <div id="developer-modal" class="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-[150] transition-opacity duration-300 opacity-0 pointer-events-none p-4">
        <div class="flex items-center justify-between border-b border-gray-700 pb-4 mb-4">
            <div class="flex items-center gap-3">
                <span class="text-2xl">🛠️</span>
                <div>
                    <h2 class="text-xl font-bold text-white uppercase tracking-tight">Developer Console</h2>
                    <p class="text-[9px] text-blue-400 font-mono tracking-widest">SYSTEM VERSION 2.0.114</p>
                </div>
            </div>
            <button id="close-developer-modal" class="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors text-white">✕</button>
        </div>

        <div class="flex space-x-1 mb-4 bg-black bg-opacity-40 p-1 rounded-lg border border-gray-800">
            <button class="dev-tab-btn flex-1 py-2 rounded text-[10px] font-bold transition-all active-tab-style" data-tab="options">OPTIONS</button>
            <button class="dev-tab-btn flex-1 py-2 rounded text-[10px] font-bold transition-all inactive-tab-style" data-tab="touch">TOUCH TEST</button>
            <button class="dev-tab-btn flex-1 py-2 rounded text-[10px] font-bold transition-all inactive-tab-style" data-tab="hand">HAND GESTURE</button>
        </div>

        <div class="flex-grow flex flex-col overflow-hidden bg-gray-900 rounded-lg border border-gray-700 relative">
            
            <div id="dev-tab-options" class="dev-tab-content h-full overflow-y-auto p-4 space-y-6">
                
                <div class="space-y-3">
                    <h4 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">UI Visibility Control</h4>
                    <div class="flex items-center justify-between p-3 bg-black bg-opacity-20 rounded border border-gray-800">
                        <label class="text-xs text-gray-300">Hide Voice Settings (Playback)</label>
                        <input type="checkbox" id="dev-hide-voice-toggle" class="h-5 w-5 rounded accent-blue-600">
                    </div>
                    <div class="flex items-center justify-between p-3 bg-black bg-opacity-20 rounded border border-gray-800">
                        <label class="text-xs text-gray-300">Hide Haptic Mapping (Playback)</label>
                        <input type="checkbox" id="dev-hide-haptic-toggle" class="h-5 w-5 rounded accent-blue-600">
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">Setting Increments</h4>
                    
                    <div class="grid grid-cols-1 gap-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-[11px] text-gray-400">Speed Increment Amount</label>
                            <select id="dev-speed-inc-select" class="bg-black text-white p-2 rounded border border-gray-700 text-xs">
                                <option value="0.01">1% Increment</option>
                                <option value="0.02">2% Increment</option>
                                <option value="0.05">5% Increment</option>
                                <option value="0.10">10% Increment</option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-[11px] text-gray-400">UI Scale Increment Amount</label>
                            <select id="dev-ui-inc-select" class="bg-black text-white p-2 rounded border border-gray-700 text-xs">
                                <option value="0.01">1% Increment</option>
                                <option value="0.02">2% Increment</option>
                                <option value="0.05">5% Increment</option>
                                <option value="0.10">10% Increment</option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-[11px] text-gray-400">Sequence Size Increment Amount</label>
                            <select id="dev-seq-inc-select" class="bg-black text-white p-2 rounded border border-gray-700 text-xs">
                                <option value="1">1 Step Increment</option>
                                <option value="2">2 Step Increment</option>
                                <option value="5">5 Step Increment</option>
                                <option value="10">10 Step Increment</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="pt-4">
                    <button id="dev-clear-logs" class="w-full py-3 bg-red-900 bg-opacity-20 text-red-400 border border-red-900 rounded text-xs font-bold hover:bg-opacity-40 transition">WIPE LOCAL STORAGE & RELOAD</button>
                </div>
            </div>

            <div id="dev-tab-touch" class="dev-tab-content hidden h-full flex flex-col">
                <div class="p-4 border-b border-gray-800 bg-black bg-opacity-30">
                    <p class="text-xs text-blue-400 font-mono italic">OmniGesture Engine v114 | Active Listening...</p>
                </div>
                <div id="touch-test-canvas" class="flex-grow flex items-center justify-center relative bg-black">
                    <div class="text-gray-700 text-[10px] text-center px-10">Perform gestures here to visualize patterns and vector IDs</div>
                    </div>
            </div>

            <div id="dev-tab-hand" class="dev-tab-content hidden h-full flex flex-col p-4">
                <div class="bg-black rounded-lg border border-gray-800 p-3 mb-4">
                    <h5 class="text-xs font-bold text-gray-300 mb-2">Visual Recognition Tuning</h5>
                    <div class="aspect-video bg-gray-800 rounded flex items-center justify-center mb-3">
                        <span class="text-gray-600 text-[10px]">CAMERA FEED STANDBY</span>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="text-[10px] text-gray-500 block mb-1">Sensitivity Threshold</label>
                            <input type="range" class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
                        </div>
                        <div class="flex gap-2">
                            <button class="flex-1 bg-blue-600 py-2 rounded text-[10px] font-bold">CALIBRATE HAND</button>
                            <button class="flex-1 bg-gray-700 py-2 rounded text-[10px] font-bold">RESET MODEL</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="mt-3 flex justify-between items-center px-1">
            <div class="text-[8px] text-gray-600 font-mono">
                MEM: <span id="dev-mem-usage">32.4MB</span> | FPS: <span id="dev-fps">60</span>
            </div>
            <div id="dev-status-indicator" class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-[8px] text-gray-600 font-bold">SECURE ACCESS</span>
            </div>
        </div>
    </div>
    
    <style>
        .active-tab-style { background-color: #2563eb; color: white; }
        .inactive-tab-style { background-color: transparent; color: #9ca3af; }
    </style>
    `;
}