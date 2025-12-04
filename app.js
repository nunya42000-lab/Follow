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
const CONFIG = { MAX_MACHINES: 4, DEMO_DELAY_BASE_MS: 798, SPEED_DELETE_DELAY: 250, SPEED_DELETE_INTERVAL: 20, STORAGE_KEY_SETTINGS: 'followMeAppSettings_v46', STORAGE_KEY_STATE: 'followMeAppState_v46', INPUTS: { KEY9: 'key...' } };

// --- GLOBAL STATE ---
let state = {
    sequence: [],
    inputSequence: [],
    machineName: 'Default',
    round: 1,
    isListening: false,
    isPlaybackActive: false,
    isAutoInputActive: false,
    isUniqueRound: false,
    uniqueRoundTarget: 0,
    isAwaitingUniqueRoundPlayback: false, 
    practiceHistory: [],
    practiceIndex: 0,
};

let appSettings = {}; // Holds current settings
let timers = { initialDelay: null, speedDelete: null, playback: null };
let modules = { sensor: null, settings: null };

// --- DOM ELEMENTS ---
const elements = {};
const $ = id => {
    if (!elements[id]) elements[id] = document.getElementById(id);
    return elements[id];
};

// --- UTILITIES ---
const getDelay = () => {
    const base = CONFIG.DEMO_DELAY_BASE_MS;
    const modifier = appSettings.speedFactor / 100;
    const finalDelay = Math.max(100, base / modifier); // Ensure minimum delay
    return finalDelay;
};

const showToast = (message, duration = 1500) => {
    const toast = $('toast-notification');
    const toastMessage = $('toast-message');
    if (toast && toastMessage) {
        toastMessage.classList.remove('opacity-0', '-translate-y-10');
        toastMessage.classList.add('opacity-100', 'translate-y-0');
        toastMessage.textContent = message;
        toast.classList.remove('opacity-0', '-translate-y-10');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', '-translate-y-10');
        }, duration);
    }
};

const saveState = () => localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(state));
const loadState = () => {
    const storedState = localStorage.getItem(CONFIG.STORAGE_KEY_STATE);
    if (storedState) {
        try {
            Object.assign(state, JSON.parse(storedState));
        } catch (e) {
            console.error("Error loading state from localStorage, using default state.", e);
            // Default state will be used as Object.assign failed
        }
    }
    // Reset volatile states on load
    state.isListening = false;
    state.isPlaybackActive = false;
    state.isAwaitingUniqueRoundPlayback = false; 
    state.isAutoInputActive = false;
};

/**
 * Ensures core state variables are valid after loading from storage.
 * This prevents crashes if localStorage data is corrupt.
 */
const normalizeState = () => {
    // Critical check: Ensure round number is valid (must be >= 1)
    if (typeof state.round !== 'number' || state.round < 1) {
        state.round = 1;
        state.sequence = [];
        state.inputSequence = [];
        showToast('Game state restored to default due to corruption.', 3000);
        saveState();
    }
    // Ensure all other critical states are properly typed/reset
    state.machineName = state.machineName || 'Default';
    state.isUniqueRound = !!state.isUniqueRound;
    state.uniqueRoundTarget = state.uniqueRoundTarget || 0;
};

// --- GAME LOGIC ---

const updateVisuals = () => {
    // Round and Machine Name
    $('round-display').textContent = state.round;
    $('machine-name-display').textContent = state.machineName;

    // Sequence Display
    const sequenceText = state.sequence.join(' ');
    const inputText = state.inputSequence.join(' ');
    $('sequence-display').textContent = sequenceText;
    $('input-display').textContent = inputText;

    // Unique Round Indicator
    const uniqueIndicator = $('unique-round-indicator');
    const resetButton = document.querySelector('button[data-action="reset-unique-rounds"]');

    if (state.isUniqueRound) {
        uniqueIndicator.classList.remove('hidden');
        uniqueIndicator.textContent = `Unique Round ${state.round} (${state.uniqueRoundTarget})`;
    } else {
        uniqueIndicator.classList.add('hidden');
    }

    if (state.round > appSettings.uniqueRoundsStart) {
        resetButton.style.display = 'inline-block';
    } else {
        resetButton.style.display = 'none';
    }

    // Input Keys
    document.querySelectorAll('.btn-input').forEach(btn => {
        btn.classList.toggle('opacity-50', state.isPlaybackActive || state.isListening || state.isAutoInputActive);
    });

    // Control Buttons
    document.querySelectorAll('button[data-action="play-demo"]').forEach(btn => {
        btn.disabled = state.isPlaybackActive || state.isListening || state.isAutoInputActive;
    });

    // State Display
    const statusText = state.isPlaybackActive ? 'Playback' : (state.isListening ? 'Listening' : 'Ready');
    $('status-display').textContent = statusText;
    $('status-dot').className = `w-3 h-3 rounded-full ${state.isPlaybackActive ? 'bg-yellow-400' : (state.isListening ? 'bg-green-500' : 'bg-gray-500')} animate-pulse`;

    // Vis Bar
    const seqLen = state.sequence.length;
    const inputLen = state.inputSequence.length;
    const progress = seqLen > 0 ? (inputLen / seqLen) * 100 : 0;
    $('vis-bar-fill').style.width = `${Math.min(100, progress)}%`;

    // Sensor Buttons
    const micBtn = $('mic-master-btn');
    const camBtn = $('camera-master-btn');
    if (appSettings.isMicEnabled) micBtn.classList.remove('hidden'); else micBtn.classList.add('hidden');
    if (appSettings.isCameraEnabled) camBtn.classList.remove('hidden'); else camBtn.classList.add('hidden');
};

// --- SOUND AND FLASH FEEDBACK ---
const flashButton = (value, duration = 150) => {
    const key = document.querySelector(`button[data-value="${value}"]`);
    if (key) {
        key.classList.add('flash-active');
        setTimeout(() => key.classList.remove('flash-active'), duration);
    }
};

const playSound = (value) => {
    if (!modules.sensor) return;
    const tone = modules.sensor.getTone(value);
    if (tone) modules.sensor.playTone(tone);
};

// --- CORE GAME ACTIONS ---
const advanceRound = () => {
    state.round++;
    state.sequence = [];
    state.inputSequence = [];
    state.isUniqueRound = false;
    state.uniqueRoundTarget = 0;
    saveState();
    updateVisuals();
    showToast(`Round ${state.round} started!`);
    
    // Auto-start next round if setting is enabled
    if (appSettings.autoStartNewRounds) {
        setTimeout(startPlayback, 1000);
    }
};

const handleInput = (value, source = 'manual') => {
    if (state.isPlaybackActive) return;

    const num = parseInt(value);
    if (isNaN(num)) return;

    // 1. Give Feedback
    playSound(num);
    flashButton(num, appSettings.flashDurationMs);

    // 2. Add to Input Sequence
    state.inputSequence.push(num);

    // 3. Check for Errors/Progress
    const index = state.inputSequence.length - 1;

    if (state.sequence.length === 0 && appSettings.isPracticeModeEnabled) {
        // Practice Mode: Just record the input
        state.practiceHistory.push(num);
        state.inputSequence = []; // Clear for next input
        saveState();
        updateVisuals();
        return;
    }
    
    // Check Unique Round Mode
    if (state.isUniqueRound) {
        if (num !== state.sequence[index]) {
            // Unique Round: Error!
            showToast('Error! Sequence broken.', 2000);
            resetGame(false);
            return;
        }

        // Unique Round: Sequence Matched (Input length == Target)
        if (state.inputSequence.length === state.uniqueRoundTarget) {
            showToast('Unique Round Match!', 1500);
            
            // LOGIC FOR IMMEDIATE AUTO-PLAYBACK
            if (appSettings.autoPlaybackUniqueRounds) {
                state.isAwaitingUniqueRoundPlayback = true;
                // Instantly check for auto actions to start playback
                checkAutoActions(); 
            } else if (appSettings.autoClearAdvance) {
                 // If no auto-playback, but auto clear/advance is on, do it now.
                 setTimeout(advanceRound, appSettings.postMatchDelayMs);
            }
        }
        
    } else {
        // Normal Mode: Error check
        if (num !== state.sequence[index]) {
            showToast('Error! Sequence broken.', 2000);
            resetGame(false);
            return;
        }

        // Normal Round: Full Sequence Matched
        if (state.inputSequence.length === state.sequence.length) {
            showToast('Round Match! Next...', 1500);
            if (appSettings.autoClearAdvance) {
                // Advance the round after a short delay
                setTimeout(advanceRound, appSettings.postMatchDelayMs);
            } else {
                // If not auto-advancing, clear the input so user can prepare for next round
                state.inputSequence = [];
            }
        }
    }
    
    saveState();
    updateVisuals();
};


const generateSequence = (length) => {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        // Generate a random number from 1 to 9 (excluding 7 for white/error)
        let num;
        do {
            num = Math.floor(Math.random() * 9) + 1;
        } while (num === 7); 
        sequence.push(num);
    }
    return sequence;
};

const startPlayback = () => {
    if (state.isPlaybackActive) return;

    const isUniquePlayback = state.isAwaitingUniqueRoundPlayback;
    
    // 1. Prepare for Playback
    state.isPlaybackActive = true;
    state.isListening = false;
    state.isAutoInputActive = false; // Turn off auto input during playback
    updateVisuals();
    
    const seqToPlay = isUniquePlayback ? state.inputSequence : generateSequence(state.round);

    if (!isUniquePlayback) {
        // Only update the main sequence if this is a new round playback
        state.sequence = seqToPlay;
        state.inputSequence = [];
        saveState();
    }
    
    const delay = getDelay();
    let index = 0;

    const playbackStep = () => {
        if (index < seqToPlay.length) {
            const num = seqToPlay[index];
            playSound(num);
            flashButton(num, appSettings.flashDurationMs);
            index++;
            timers.playback = setTimeout(playbackStep, delay);
        } else {
            // Playback finished
            onPlaybackComplete(isUniquePlayback);
        }
    };

    playbackStep();
};

const onPlaybackComplete = (wasUniquePlayback) => {
    state.isPlaybackActive = false;
    clearTimeout(timers.playback);
    
    // 2. Post-Playback Actions
    if (wasUniquePlayback) {
        state.isAwaitingUniqueRoundPlayback = false; // Reset the state
        showToast('Playback Complete.', 1000);

        // Check for Auto Clear/Advance after playback
        if (appSettings.autoClearAdvance) {
            setTimeout(advanceRound, appSettings.postMatchDelayMs);
        } else {
            // If auto-advance is off, we must still clear the input and wait for user to hit 'Play' again
            state.inputSequence = []; 
            showToast('Input Cleared. Ready for Next Round.', 1000);
        }

    } else if (appSettings.isPracticeModeEnabled) {
        // In practice mode, we don't start listening automatically after playback
        showToast('Sequence Generated. Ready for input.', 1000);
    } else {
        // Normal game: Start listening
        state.isListening = true;
        showToast('Your Turn!', 1000);
    }

    updateVisuals();
    saveState();
};

const handleBackspace = (event) => {
    if (state.isPlaybackActive || state.isListening) return;

    if (state.inputSequence.length > 0) {
        state.inputSequence.pop();
        saveState();
        updateVisuals();
    }
};

const resetGame = (fullReset = true) => {
    clearTimeout(timers.playback);
    
    if (fullReset) {
        state.round = 1;
        state.machineName = 'Default';
    }
    
    state.sequence = [];
    state.inputSequence = [];
    state.isListening = false;
    state.isPlaybackActive = false;
    state.isUniqueRound = false;
    state.uniqueRoundTarget = 0;
    state.isAwaitingUniqueRoundPlayback = false; // Reset new state
    state.practiceHistory = [];
    state.practiceIndex = 0;
    
    saveState();
    updateVisuals();
    showToast(fullReset ? 'Game Reset!' : 'Game Over!', 2000);
    
    // Exit practice mode if reset
    if (appSettings.isPracticeModeEnabled) {
        appSettings.isPracticeModeEnabled = false;
        modules.settings.saveSettings(appSettings);
        modules.settings.updateUISettings();
        startPracticeRound();
    }
};

const startPracticeRound = () => {
    if (!appSettings.isPracticeModeEnabled) {
        resetGame(true);
        return;
    }
    
    state.round = 1;
    state.machineName = 'Practice';
    state.sequence = state.practiceHistory;
    state.inputSequence = [];
    state.isListening = true; // Start listening right away in practice mode
    state.isPlaybackActive = false;
    state.isUniqueRound = false;
    state.uniqueRoundTarget = 0;
    state.isAwaitingUniqueRoundPlayback = false;
    
    saveState();
    updateVisuals();
    showToast('Practice Mode: Ready!', 1000);
};

const checkAutoActions = () => {
    if (state.isPlaybackActive) return;

    // Check 1: Unique Round Auto Playback
    if (appSettings.autoPlaybackUniqueRounds && state.isAwaitingUniqueRoundPlayback) {
        // Playback will handle the advance logic via onPlaybackComplete
        startPlayback(); 
        return;
    }

    // Check 2: Auto Input
    if (state.isListening && appSettings.autoInputEnabled) {
        state.isAutoInputActive = true;
        updateVisuals();
        showToast('Auto Input Activated!', 1000);
        
        let autoIndex = 0;
        const autoInputStep = () => {
            if (autoIndex < state.sequence.length) {
                const expected = state.sequence[autoIndex];
                handleInput(expected);
                autoIndex++;
                setTimeout(autoInputStep, getDelay());
            } else {
                state.isAutoInputActive = false;
                updateVisuals();
            }
        };
        setTimeout(autoInputStep, getDelay()); // Start after a delay
    }
};

// --- SENSOR INTEGRATION ---
const onSensorTrigger = (num, source) => {
    if (state.isListening && appSettings.isAutoInputEnabled) {
        // If auto input is enabled, sensors are disabled while listening
        return;
    }
    if (state.isListening || state.isUniqueRound || (state.round > 1 && state.sequence.length > 0)) {
        handleInput(num, source);
    }
};

const onSensorStatusUpdate = (status) => {
    // Update camera/mic status in the UI
    const micBtn = $('mic-master-btn');
    const camBtn = $('camera-master-btn');

    if (micBtn && camBtn) {
        micBtn.classList.toggle('!bg-green-500', status.micActive);
        camBtn.classList.toggle('!bg-green-500', status.cameraActive);
        
        if (!appSettings.isMicEnabled) micBtn.classList.remove('!bg-green-500');
        if (!appSettings.isCameraEnabled) camBtn.classList.remove('!bg-green-500');
    }
};

const toggleSensor = (type) => {
    if (type === 'mic') {
        appSettings.isMicEnabled = !appSettings.isMicEnabled;
        modules.sensor.toggleMic(appSettings.isMicEnabled);
    } else if (type === 'camera') {
        appSettings.isCameraEnabled = !appSettings.isCameraEnabled;
        modules.sensor.toggleCamera(appSettings.isCameraEnabled);
    }
    modules.settings.saveSettings(appSettings);
    modules.settings.updateUISettings();
    updateVisuals();
};


// --- INITIALIZATION ---
window.onload = () => {
    try {
        // Initialize Modules
        modules.sensor = new SensorEngine(onSensorTrigger, onSensorStatusUpdate);
        modules.settings = new SettingsManager(db, (newSettings) => {
            appSettings = newSettings;
            // Apply theme
            const theme = PREMADE_THEMES[appSettings.theme] || PREMADE_THEMES.default;
            document.documentElement.style.setProperty('--bg-main', theme.bgMain);
            document.documentElement.style.setProperty('--card-bg', theme.bgCard);
            document.documentElement.style.setProperty('--seq-bubble', theme.bubble);
            document.documentElement.style.setProperty('--btn-bg', theme.btn);
            document.documentElement.style.setProperty('--text-main', theme.text);
            
            // Apply voice
            const voicePreset = PREMADE_VOICE_PRESETS[appSettings.voicePreset] || PREMADE_VOICE_PRESETS.default;
            modules.sensor.setVoice(voicePreset);
            
            // Apply sensor changes
            modules.sensor.toggleMic(appSettings.isMicEnabled);
            modules.sensor.toggleCamera(appSettings.isCameraEnabled);
            
            updateVisuals();
            checkAutoActions(); // Re-check for auto actions if settings change (e.g., auto input)
        });
        
        // Initialize Comments
        initComments(db);

        // Load state from local storage, then normalize it to prevent crashes from corrupt data
        loadState();
        normalizeState(); // <-- New step to ensure consistent state
        updateVisuals();

        // --- EVENT LISTENERS ---
        
        // Input Buttons
        document.querySelectorAll('button[data-value]').forEach(b => {
            b.addEventListener('click', (e) => handleInput(e.currentTarget.dataset.value));
        });

        // Control Buttons
        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => b.addEventListener('click', startPlayback));
        document.querySelectorAll('button[data-action="reset-game"]').forEach(b => b.addEventListener('click', () => resetGame(true)));
        document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => b.addEventListener('click', () => {
            resetGame(false);
            showToast('Unique Round Mode Reset to Round 1', 2000);
        }));
        
        // Sensor Toggles
        $('mic-master-btn').addEventListener('click', () => toggleSensor('mic'));
        $('camera-master-btn').addEventListener('click', () => toggleSensor('camera'));

        // Keyboard Input
        document.addEventListener('keydown', (e) => {
            if (e.repeat || modules.settings.isModalOpen()) return;
            const value = e.key;
            if (value >= '1' && value <= '9') {
                handleInput(value);
            } else if (value === 'Enter') {
                startPlayback();
            } else if (value === 'Backspace') {
                handleBackspace(e);
            }
        });

        // Backspace Speed Delete (Touch/Mouse)
        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            let isDeleting = false;
            const startDelete = () => {
                if(state.isPlaybackActive || state.isListening) return;
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
            b.addEventListener('mousedown', startDelete); b.addEventListener('touchstart', startDelete, { passive: true }); b.addEventListener('mouseup', stopDelete); b.addEventListener('mouseleave', stopDelete); b.addEventListener('touchend', stopDelete); b.addEventListener('touchcancel', stopDelete); 
        });

        document.querySelectorAll('button[data-action="open-share"]').forEach(b => b.addEventListener('click', () => modules.settings.openShare())); 
        
        document.getElementById('close-settings').addEventListener('click', () => {
            if(appSettings.isPracticeModeEnabled) {
                setTimeout(startPracticeRound, 500);
            }
        });

        if(appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
    } catch (error) { console.error("CRITICAL ERROR:", error); /* Use console for errors, not alert() */ }
};
