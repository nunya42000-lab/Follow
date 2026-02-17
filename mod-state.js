// ==========================================
// mod-state.js - Additive State & Unlock Logic
// ==========================================

// 1. Global Flags (Used by the other new modules later)
window.geminiMods = {
    ecoModeActive: false,
    arModeActive: false,
    isCalibrating: false,
    isRecording: false,
    activeWhitelist: []
};

// 2. The 7-Tap Secret Unlock Sequence
let devTapCount = 0;
let devTapTimer = null;

function initSecretUnlock() {
    // Find your existing Quick Start button (adjust the ID if yours is different)
    const quickStartBtn = document.getElementById('btn-quick-start') || document.querySelector('.quick-start-btn');
    
    if (!quickStartBtn) {
        console.warn("mod-state.js: Could not find the Quick Start button to attach the secret sequence.");
        return;
    }

    // Change the text to your requested "FOLLOW ME"
    quickStartBtn.innerText = "FOLLOW ME";

    // Override what happens when they tap it
    quickStartBtn.addEventListener('click', (e) => {
        // Stop the old quick start menu from opening if they are just tapping
        e.preventDefault(); 
        e.stopPropagation();

        if (localStorage.getItem('developer_mode') === 'true') {
            console.log("Dev mode already active.");
            return; 
        }

        devTapCount++;
        clearTimeout(devTapTimer);

        devTapTimer = setTimeout(() => {
            devTapCount = 0; // Reset if they pause too long
        }, 2000);

        // Countdown Toasts
        if (devTapCount === 4) alertToast("3");
        else if (devTapCount === 5) alertToast("2");
        else if (devTapCount === 6) alertToast("1");
        else if (devTapCount === 7) {
            localStorage.setItem('developer_mode', 'true');
            devTapCount = 0;
            alertToast("You are now a developer. Long press settings to access options.", 4000);
            enableSettingsLongPress();
        }
    });
}

// 3. Enable Long Press on Settings (Only if Dev Mode is true)
function enableSettingsLongPress() {
    const settingsBtn = document.getElementById('settings-button');
    if (!settingsBtn) return;

    let pressTimer;

    settingsBtn.addEventListener('touchstart', (e) => {
        if (localStorage.getItem('developer_mode') === 'true') {
            pressTimer = window.setTimeout(() => {
                // We will build this UI injection in Module 3
                if (window.openDevModal) window.openDevModal(); 
                else console.log("Dev modal module not loaded yet.");
            }, 800); 
        }
    });

    settingsBtn.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });
}

// Simple additive toast function so we don't rely on your existing one yet
function alertToast(msg, duration = 2000) {
    let toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.cssText = "position:fixed; bottom:20%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:#fff; padding:10px 20px; border-radius:20px; z-index:9999; font-family:sans-serif;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// Inject listeners once the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    initSecretUnlock();
    if (localStorage.getItem('developer_mode') === 'true') {
        enableSettingsLongPress();
    }
});
