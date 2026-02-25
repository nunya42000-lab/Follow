// help-modal.js
export function getHelpModal() {
    return `
    <div id="help-modal" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[90] transition-opacity duration-300 opacity-0 pointer-events-none overflow-y-auto">
        <div class="settings-modal-bg p-0 rounded-xl shadow-2xl max-w-2xl w-full transform scale-95 transition-transform duration-300 flex flex-col border border-custom my-8 max-h-[90vh]">
            
            <div class="p-6 border-b border-custom flex justify-between items-center bg-black bg-opacity-20">
                <h2 class="text-2xl font-bold flex items-center gap-3">
                    <span class="text-primary-app">📚</span>
                    <span data-i18n="help_title">User Manual & Guide</span>
                </h2>
                <button id="close-help-btn" class="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors text-xl">✕</button>
            </div>

            <div class="flex-grow overflow-y-auto p-6 space-y-8 text-sm leading-relaxed">
                
                <section>
                    <h3 class="text-lg font-bold text-primary-app mb-3 flex items-center gap-2">
                        🚀 Quick Start
                    </h3>
                    <div class="space-y-3 opacity-90">
                        <p>Welcome to <strong>Follow Me</strong>. This application is designed to help you track and identify patterns in real-time.</p>
                        <ul class="list-decimal list-inside space-y-2 ml-2">
                            <li>Select your machine profile from the home screen.</li>
                            <li>Tap the numbers/colors on the keypad as they appear.</li>
                            <li>The system will automatically calculate the most likely next sequence based on historical data.</li>
                        </ul>
                    </div>
                </section>

                <section class="bg-black bg-opacity-20 p-4 rounded-lg border border-custom">
                    <h3 class="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
                        🖐️ Gesture Controls
                    </h3>
                    <p class="mb-4 opacity-80 italic">You can use the following gestures anywhere on the main interface:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex items-start gap-3">
                            <div class="bg-gray-800 p-2 rounded font-mono text-xs text-white border border-gray-700">Swipe L</div>
                            <div class="text-[11px]">Undo last entry (Backspace)</div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="bg-gray-800 p-2 rounded font-mono text-xs text-white border border-gray-700">Swipe R</div>
                            <div class="text-[11px]">Clear current sequence</div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="bg-gray-800 p-2 rounded font-mono text-xs text-white border border-gray-700">2-Tap</div>
                            <div class="text-[11px]">Toggle Autoplay mode</div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="bg-gray-800 p-2 rounded font-mono text-xs text-white border border-gray-700">Long P</div>
                            <div class="text-[11px]">Open Quick Settings</div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                        🎤 Voice Commands
                    </h3>
                    <p class="mb-2 opacity-80">Ensure "Voice Control" is enabled in settings. You can say:</p>
                    <div class="bg-gray-900 p-3 rounded font-mono text-xs text-green-500 border border-gray-800 space-y-1">
                        <div>• "Input [number]" (e.g., "Input five")</div>
                        <div>• "Undo last" or "Delete"</div>
                        <div>• "Start Autoplay" / "Stop Autoplay"</div>
                        <div>• "Open Settings"</div>
                    </div>
                </section>

                <section>
                    <h3 class="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                        🔧 Troubleshooting
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-bold text-white text-xs uppercase mb-1">Visual Recognition not working?</h4>
                            <p class="opacity-70 text-[12px]">Go to Settings > Calibration and adjust the Camera Sensitivity slider until the blink detection is consistent with your screen's brightness.</p>
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-xs uppercase mb-1">App feels sluggish?</h4>
                            <p class="opacity-70 text-[12px]">Use the "Clear Cache" button in settings to refresh the application state. This will not delete your saved profiles.</p>
                        </div>
                    </div>
                </section>

            </div>

            <div class="p-4 border-t border-custom flex justify-end bg-black bg-opacity-30">
                <button id="close-help-btn-bottom" class="px-8 py-2 bg-primary-app text-white rounded-lg font-bold shadow-lg hover:opacity-90 transition active:scale-95">
                    Got it!
                </button>
            </div>
        </div>
    </div>
    `;
}
