// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { SensorEngine } from './sensors.js';
import { SettingsManager, PREMADE_THEMES, PREMADE_VOICE_PRESETS } from './settings.js';
import { initComments } from './comments.js';

const firebaseConfig = { apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", authDomain: "follow-me-app-de3e9.firebaseapp.com", projectId: "follow-me-app-de3e9", storageBucket: "follow-me-app-de3e9.firebasestorage.app", messagingSenderId: "957006680126", appId: "1:957006680126:web:6d679717d9277fd9ae816f" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CONFIG ---
const CONFIG = { 
    MAX_MACHINES: 4, 
    DEMO_DELAY_BASE_MS: 798, 
    SPEED_DELETE_DELAY: 250, 
    SPEED_DELETE_INTERVAL: 20, 
    STORAGE_KEY_SETTINGS: 'followMeAppSettings_v46', 
    STORAGE_KEY_STATE: 'followMeAppState_v46', 
    INPUTS: { KEY9: 'key...' } 
};

// --- STATE ---
let appSettings = {
    // Defaults (to be overwritten by loaded settings)
    language: 'en',
    activeTheme: 'default',
    activeConfig: 'default',
    isAutoplayEnabled: false,
    isAutoAdvanceClearEnabled: false, // New setting name
    gameMode: 'Simon', // 'Simon', 'Unique Rounds', 'Freeform'
    sequence: [],
    inputSequence: [],
    roundNumber: 1,
    machineCount: CONFIG.MAX_MACHINES,
    isDemoPlaying: false, // Crucial for Autoplay lock
    isAwaitingInput: false, // Crucial for input lock
    // Add other default settings here if needed
    isStealth1KeyEnabled: false, // Renamed setting
    isBlackoutModeEnabled: false,
    isBlackoutGesturesEnabled: false, // New setting
    isHapticMorseEnabled: false, // Moved setting
    playbackSpeed: CONFIG.DEMO_DELAY_BASE_MS,
    autoplayInterval: null, // Autoplay interval ID
    autoplayDelayTimeout: null, // Timeout before starting autoplay
    autoPlayAttempts: 0 // Counter for unique round retry logic
};
let modules = {};
let currentLevel = 1;
let isDeleting = false;
let timers = {};
const elements = {};

// --- UTILS ---

function saveState() {
    // Only save essential state variables to prevent bloat
    const stateToSave = {
        sequence: appSettings.sequence,
        inputSequence: appSettings.inputSequence,
        roundNumber: appSettings.roundNumber,
        currentLevel: currentLevel,
        // ... include other necessary state variables
    };
    localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(stateToSave));
}

function loadState() {
    try {
        const savedState = localStorage.getItem(CONFIG.STORAGE_KEY_STATE);
        if (savedState) {
            const state = JSON.parse(savedState);
            Object.assign(appSettings, state);
            appSettings.roundNumber = state.roundNumber || 1; // Ensure default if missing
            currentLevel = state.currentLevel || 1; // Ensure default if missing
            // Reset crucial flags on load
            appSettings.isDemoPlaying = false;
            appSettings.isAwaitingInput = false;
            appSettings.autoPlayAttempts = 0; // Reset
        }
    } catch (e) {
        console.warn("Failed to load state:", e);
    }
}

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
        if (savedSettings) {
            Object.assign(appSettings, JSON.parse(savedSettings));
        }
        // Ensure new settings have defaults if not in savedSettings
        appSettings.isBlackoutGesturesEnabled = appSettings.isBlackoutGesturesEnabled ?? false;
    } catch (e) {
        console.warn("Failed to load settings:", e);
    }
}

function applySettings() {
    // Apply settings globally (Theme, Blackout Mode, etc.)
    modules.settings.setTheme(appSettings.activeTheme);
    document.body.classList.toggle('blackout-mode', appSettings.isBlackoutModeEnabled);
    // Update any UI elements reflecting settings
    updateAutoplayIndicator();
}

function updateAutoplayIndicator() {
    const indicator = document.getElementById('autoplay-status-indicator');
    if (indicator) {
        indicator.classList.toggle('bg-green-500', appSettings.isAutoplayEnabled);
        indicator.classList.toggle('bg-gray-500', !appSettings.isAutoplayEnabled);
    }
}

function generateNextSequenceItem() {
    // Logic to generate the next number (1-12)
    const maxVal = appSettings.machineCount * 3; // Example logic
    return Math.floor(Math.random() * maxVal) + 1;
}

function nextRound() {
    if (appSettings.gameMode === 'Unique Rounds') {
        // In Unique Rounds, the sequence length increases only when the round is cleared.
        // If auto advance clear is off, sequence must be reset here.
        if (appSettings.isAutoAdvanceClearEnabled) {
            appSettings.roundNumber++;
            appSettings.sequence = []; // Start a new sequence of the new length
        } else {
            // If auto clear is off, the sequence stays the same for retries
            // but we reset the input for the player's next attempt.
            appSettings.inputSequence = [];
            
            // CRITICAL FIX: Only generate a new sequence item if the round number increases.
            // Since autoAdvanceClear is OFF, roundNumber doesn't increase here, so we skip sequence generation.
        }
    } else { // Simon Mode or others
        appSettings.roundNumber++;
    }

    // Always generate a new sequence item in Simon mode, or if auto advance clear is ON in Unique Rounds.
    if (appSettings.gameMode === 'Simon' || (appSettings.gameMode === 'Unique Rounds' && appSettings.isAutoAdvanceClearEnabled)) {
        appSettings.sequence.push(generateNextSequenceItem());
    }

    appSettings.inputSequence = [];
    appSettings.autoPlayAttempts = 0; // Reset attempts for new round or new sequence
    saveState();
    updateRoundDisplay();

    if (appSettings.isAutoplayEnabled && !appSettings.isDemoPlaying) {
        // Delay before starting the demo to allow UI update
        appSettings.autoplayDelayTimeout = setTimeout(playDemoSequence, appSettings.playbackSpeed);
    }
}

function startPracticeRound() {
    // Initialization for practice mode
    appSettings.sequence = [generateNextSequenceItem()];
    appSettings.inputSequence = [];
    appSettings.roundNumber = 1;
    appSettings.autoPlayAttempts = 0;
    saveState();
    updateRoundDisplay();
    // In practice, always play the demo immediately if enabled
    if (appSettings.isAutoplayEnabled && !appSettings.isDemoPlaying) {
        appSettings.autoplayDelayTimeout = setTimeout(playDemoSequence, appSettings.playbackSpeed);
    }
}

function playDemoSequence() {
    if (appSettings.isDemoPlaying) return; // Prevent re-entry

    // CRITICAL FIX: Check for Unique Rounds and AutoplayAttempts
    if (appSettings.gameMode === 'Unique Rounds' && appSettings.isAutoplayEnabled) {
        // If we are in Unique Rounds and have played the sequence before in this round, 
        // DO NOT play it again after an input, UNLESS it's the start of a new round
        // or a manual retry.
        if (appSettings.autoPlayAttempts > 0 && !appSettings.isAutoAdvanceClearEnabled) {
            // The sequence has already been shown this round. Wait for player input.
            appSettings.isDemoPlaying = false;
            appSettings.isAwaitingInput = true;
            return;
        }
    }

    appSettings.isDemoPlaying = true;
    appSettings.isAwaitingInput = false; // Lock input during playback
    appSettings.autoPlayAttempts++; // Increment attempt counter

    // Clear any previous interval/timeout
    clearInterval(appSettings.autoplayInterval);

    let i = 0;
    appSettings.autoplayInterval = setInterval(() => {
        if (i < appSettings.sequence.length) {
            // Play the next tone in the sequence
            modules.sensor.playTone(appSettings.sequence[i], appSettings.playbackSpeed);
            i++;
        } else {
            // Sequence finished playing
            clearInterval(appSettings.autoplayInterval);
            appSettings.isDemoPlaying = false;
            appSettings.isAwaitingInput = true; // Unlock input
            showToast("Your Turn!");
        }
    }, appSettings.playbackSpeed);
}

function handleInput(value) {
    if (appSettings.isDemoPlaying || !appSettings.isAwaitingInput) return;

    appSettings.inputSequence.push(value);
    
    // Play tone/haptic feedback for input
    modules.sensor.playTone(value, 200); // Shorter duration for input feedback

    const index = appSettings.inputSequence.length - 1;
    const isCorrect = appSettings.inputSequence[index] === appSettings.sequence[index];

    if (!isCorrect) {
        handleMistake();
        return;
    }

    if (appSettings.inputSequence.length === appSettings.sequence.length) {
        // Round Complete (Success)
        showToast("Success!", true);
        
        // Clear input sequence and move to the next round logic
        // This is where nextRound() handles Simon vs Unique Clear logic
        setTimeout(nextRound, 1000); 
    } else {
        // Input correct, but sequence is not finished
        // CRITICAL FIX: In Unique Rounds, if AutoAdvanceClear is OFF, and we are still in the input phase,
        // we DO NOT call playDemoSequence(). The logic is now locked behind autoPlayAttempts > 0 
        // in playDemoSequence itself, but explicitly ensuring no accidental call here is safer.
        
        // This function should simply end here, waiting for the next input.
    }

    saveState();
    updateInputDisplay();
}

function handleMistake() {
    showToast("Mistake! Try Again.", false);
    // Reset input sequence for retry
    appSettings.inputSequence = [];
    saveState();
    updateInputDisplay();

    // CRITICAL FIX: Autoplay retry logic for Unique Rounds
    if (appSettings.isAutoplayEnabled && appSettings.gameMode === 'Unique Rounds' && !appSettings.isAutoAdvanceClearEnabled) {
        // If in Unique Rounds mode with Autoplay ON and Auto Advance Clear OFF, 
        // re-run the demo sequence immediately after a mistake.
        // The playDemoSequence function will handle the attempt counter and ensure it runs.
        appSettings.isAwaitingInput = false; // Lock input temporarily
        clearTimeout(appSettings.autoplayDelayTimeout);
        appSettings.autoplayDelayTimeout = setTimeout(playDemoSequence, appSettings.playbackSpeed);
    } else {
        // For Simon Mode or Unique Rounds with Auto Advance Clear ON (which effectively makes it Simon-like for the player)
        // or if Autoplay is OFF, just unlock input.
        appSettings.isAwaitingInput = true;
    }
}

function handleBackspace(e) {
    if (appSettings.inputSequence.length > 0) {
        appSettings.inputSequence.pop();
        updateInputDisplay();
        saveState();
    }
}

function updateRoundDisplay() {
    const roundDisp = document.getElementById('round-display');
    if (roundDisp) {
        let display = `RND ${appSettings.roundNumber}`;
        if (appSettings.gameMode === 'Unique Rounds') {
            display += ` (${appSettings.sequence.length})`; // Show current sequence length
        }
        roundDisp.textContent = display;
    }
}

function updateInputDisplay() {
    const inputDisp = document.getElementById('input-display');
    if (inputDisp) {
        inputDisp.textContent = appSettings.inputSequence.join(' ');
    }
}

function showToast(message, isSuccess = null) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    
    toast.classList.remove('bg-green-500', 'bg-red-500');
    if (isSuccess === true) {
        toast.classList.add('bg-green-500');
    } else if (isSuccess === false) {
        toast.classList.add('bg-red-500');
    } else {
        toast.classList.add('bg-primary-app');
    }

    // Show
    toast.classList.remove('opacity-0', '-translate-y-10');
    toast.classList.add('opacity-100', 'translate-y-0');

    // Hide after 2 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-10');
        toast.classList.remove('opacity-100', 'translate-y-0');
    }, 2000);
}

// --- INITIALIZATION ---

window.onload = () => {
    try {
        // Load settings and state first
        loadSettings();
        loadState();

        // Initialize modules (Sensors, Settings Manager)
        modules.sensor = new SensorEngine(appSettings, { playTone, handleInput, vibrate });
        modules.settings = new SettingsManager(appSettings, { 
            onSave: () => localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)),
            onUpdate: applySettings,
            onSettingsClose: startPracticeRound, // Re-start practice mode when settings close
            onSetCurrentConfig: (id) => {}, // Dummy config handlers
            onAddConfig: () => {}, 
            onRenameConfig: () => {}, 
            onDeleteConfig: () => {},
            onTestVoice: () => modules.sensor.testVoice(),
            onRestoreDefaults: () => {} // Dummy restore defaults
        }, modules.sensor);
        
        // Initial setup and display
        applySettings();
        updateRoundDisplay();
        updateInputDisplay();

        // If the mode is Unique Rounds and autoAdvanceClear is OFF,
        // we must ensure the sequence is ready for the player's first input.
        if (appSettings.gameMode === 'Unique Rounds' && appSettings.sequence.length === 0) {
            // This case handles a fresh load in Unique Rounds.
            appSettings.sequence = [generateNextSequenceItem()];
            saveState();
            updateRoundDisplay();
        }


        // --- EVENT LISTENERS ---
        document.querySelectorAll('.btn-input[data-value]').forEach(b => b.addEventListener('click', (e) => handleInput(parseInt(e.currentTarget.dataset.value))));
        document.getElementById('mic-master-btn').addEventListener('click', () => modules.sensor.toggleMic());
        document.getElementById('camera-master-btn').addEventListener('click', () => modules.sensor.toggleCamera());
        document.querySelector('button[data-action="play-demo"]').addEventListener('click', () => {
            if (appSettings.gameMode === 'Unique Rounds' && appSettings.sequence.length === 0) {
                // Manual play in Unique Rounds should ensure the sequence exists
                appSettings.sequence = [generateNextSequenceItem()];
                updateRoundDisplay();
                saveState();
            }
            playDemoSequence();
        });
        document.querySelector('button[data-action="backspace"]').addEventListener('click', handleBackspace);
        document.querySelector('button[data-action="open-settings"]').addEventListener('click', () => modules.settings.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'));
        document.querySelector('button[data-action="reset-unique-rounds"]').addEventListener('click', () => {
            // Quick reset button handler
            appSettings.roundNumber = 1;
            appSettings.sequence = [generateNextSequenceItem()];
            appSettings.inputSequence = [];
            appSettings.autoPlayAttempts = 0;
            saveState();
            updateRoundDisplay();
            updateInputDisplay();
            showToast("Round Reset", true);
        });

        // Speed Delete Logic
        document.querySelector('button[data-action="backspace"]').addEventListener('touchstart', (e) => {
            let isDeleting = false;
            const startDelete = () => {
                if(!appSettings.isSpeedDeletingEnabled) return; 
                isDeleting = false; 
                timers.initialDelay = setTimeout(() => { 
                    isDeleting = true; 
                    timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL); 
                }, CONFIG.SPEED_DELETE_DELAY); 
            }; 
            const stopDelete = () => { 
                clearTimeout(timers.initialDelay); 
                clearInterval(timers.speedDelete); 
                setTimeout(() => isDeleting = false, 50); 
            }; 
            e.currentTarget.addEventListener('mousedown', startDelete); e.currentTarget.addEventListener('touchstart', startDelete, { passive: true }); e.currentTarget.addEventListener('mouseup', stopDelete); e.currentTarget.addEventListener('mouseleave', stopDelete); e.currentTarget.addEventListener('touchend', stopDelete); e.currentTarget.addEventListener('touchcancel', stopDelete); 
        });

        document.querySelectorAll('button[data-action="open-share"]').forEach(b => b.addEventListener('click', () => modules.settings.openShare())); 
        
        document.getElementById('close-settings').addEventListener('click', () => {
            if(appSettings.isPracticeModeEnabled) {
                setTimeout(startPracticeRound, 500);
            }
        });

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
    } catch (error) { console.error("CRITICAL ERROR:", error); alert("App crashed: " + error.message); }
};
