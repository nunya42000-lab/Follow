import {
    GestureEngine
} from './gestures.js';
import {
    SettingsManager,
    PREMADE_THEMES
} from './settings.js';
import {
    VisionEngine
} from './vision.js';
const arRecordBtn = document.getElementById('ar-record-btn');
const arPlaybackContainer = document.getElementById('ar-playback-container');
const arPlaybackVideo = document.getElementById('ar-playback-video');
const arBackgroundVideo = document.getElementById('ar-background-video');
const firebaseConfig = {
    apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4",
    authDomain: "follow-me-app-de3e9.firebaseapp.com",
    projectId: "follow-me-app-de3e9",
    storageBucket: "follow-me-app-de3e9.firebasestorage.app",
    messagingSenderId: "957006680126",
    appId: "1:957006680126:web:6d679717d9277fd9ae816f"
};
let db = null;
let screenWakeLock = null;
const CONFIG = {
    MAX_MACHINES: 4,
    DEMO_DELAY_BASE_MS: 798,
    SPEED_DELETE_DELAY: 250,
    SPEED_DELETE_INTERVAL: 20,
    STORAGE_KEY_SETTINGS: 'followMeAppSettings_v47',
    STORAGE_KEY_STATE: 'followMeAppState_v48',
    INPUTS: {
        KEY9: 'key9',
        KEY12: 'key12',
        PIANO: 'piano'
    },
    MODES: {
        SIMON: 'simon',
        UNIQUE_ROUNDS: 'unique'
    }
};
const DEFAULT_PROFILE_SETTINGS = {
    currentInput: CONFIG.INPUTS.KEY9,
    currentMode: CONFIG.MODES.SIMON,
    sequenceLength: 20,
    machineCount: 1,
    simonChunkSize: 40,
    simonInterSequenceDelay: 0
};
const PREMADE_PROFILES = {
    'profile_1': {
        name: "Follow Me",
        settings: {
            ...DEFAULT_PROFILE_SETTINGS
        },
        theme: 'default'
    },
    'profile_2': {
        name: "2 Machines",
        settings: {
            ...DEFAULT_PROFILE_SETTINGS,
            machineCount: 2,
            simonChunkSize: 40,
            simonInterSequenceDelay: 0
        },
        theme: 'default'
    },
    'profile_3': {
        name: "Bananas",
        settings: {
            ...DEFAULT_PROFILE_SETTINGS,
            sequenceLength: 25
        },
        theme: 'default'
    },
    'profile_4': {
        name: "Piano",
        settings: {
            ...DEFAULT_PROFILE_SETTINGS,
            currentInput: CONFIG.INPUTS.PIANO
        },
        theme: 'default'
    },
    'profile_5': {
        name: "15 Rounds",
        settings: {
            ...DEFAULT_PROFILE_SETTINGS,
            currentMode: CONFIG.MODES.UNIQUE_ROUNDS,
            sequenceLength: 15,
            currentInput: CONFIG.INPUTS.KEY12
        },
        theme: 'default'
    }
};
const DEFAULT_APP = {
    globalUiScale: 100,
    uiScaleMultiplier: 1.0,
    showWelcomeScreen: true,
    gestureResizeMode: 'global',
    playbackSpeed: 1.0,
    isAutoplayEnabled: true,
    isUniqueRoundsAutoClearEnabled: true,
    isAudioEnabled: true,
    isHapticsEnabled: true,
    isFlashEnabled: true,
    pauseSetting: 'none',
    isSpeedDeletingEnabled: true,
    isSpeedGesturesEnabled: false,
    isVolumeGesturesEnabled: false,
    isArModeEnabled: false,
   isArAutoCloseEnabled: false,
  isVoiceInputEnabled: false,
    arPlaybackSpeed: 1.00,
    voiceTriggerWord: 'set',
    gestureHoldFrames: 30,
    isDeleteGestureEnabled: true,
    isClearGestureEnabled: true,
    isAutoTimerEnabled: false,
    isAutoCounterEnabled: false,
    isWakeLockEnabled: true,
    isUpsidedownEnabled: false,
    isFullScreenEnabled: false,
    isEcoModeEnabled: true,
    isLongPressAutoplayEnabled: true,
    isStealth1KeyEnabled: false,
    activeTheme: 'default',
    customThemes: {},
    isRandomThemeEnabled: false,
    sensorAudioThresh: -85,
    sensorCamThresh: 30,
    isBlackoutFeatureEnabled: false,
    isHapticMorseEnabled: false,
    showTimer: false,
    showCounter: false,
    isHandGesturesEnabled: false,
    isHandSignalsEnabled: false,
    isVoiceCommandsEnabled: false,
    isToneCadenceEnabled: false,
    isPositionSwapEnabled: false,
    isSkeletonDebugEnabled: false,
    activeFontFamily: "'Inter', sans-serif",
    handGestureCooldown: 600,
    handHoldFrames: 4,
    voiceConfidenceThreshold: 50,
    toneVolumeThreshold: -85,
    isSliderLockEnabled: false,
    touchAnchorStillDistance: 15,
    touchAnchorMinHoldTime: 150,
    touchChordSimultaneityWindow: 50,
    activeProfileId: 'profile_1',
    profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)),
    runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)),
    isPracticeModeEnabled: false,
    voicePitch: 1.0,
    voiceRate: 1.0,
    voiceVolume: 1.0,
    selectedVoice: null,
    voicePresets: {},
    activeVoicePresetId: 'standard',
    isGestureInputEnabled: false,
    gestureMappings: {}
};
const DEFAULT_MAPPINGS = {
    'k9_1': 'tap',
    'k9_2': 'double_tap',
    'k9_3': 'triple_tap',
    'k9_4': 'tap_2f_any',
    'k9_5': 'double_tap_2f_any',
    'k9_6': 'triple_tap_2f_any',
    'k9_7': 'tap_3f_any',
    'k9_8': 'double_tap_3f_any',
    'k9_9': 'triple_tap_3f_any',
    'k12_1': 'tap',
    'k12_2': 'double_tap',
    'k12_3': 'triple_tap',
    'k12_4': 'long_tap',
    'k12_5': 'tap_2f_any',
    'k12_6': 'double_tap_2f_any',
    'k12_7': 'triple_tap_2f_any',
    'k12_8': 'long_tap_2f_any',
    'k12_9': 'tap_3f_any',
    'k12_10': 'double_tap_3f_any',
    'k12_11': 'triple_tap_3f_any',
    'k12_12': 'long_tap_3f_any',
    'piano_C': 'swipe_nw',
    'piano_D': 'swipe_left',
    'piano_E': 'swipe_sw',
    'piano_F': 'swipe_down',
    'piano_G': 'swipe_se',
    'piano_A': 'swipe_right',
    'piano_B': 'swipe_ne',
    'piano_1': 'swipe_left_2f',
    'piano_2': 'swipe_nw_2f',
    'piano_3': 'swipe_up_2f',
    'piano_4': 'swipe_ne_2f',
    'piano_5': 'swipe_right_2f'
};
let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = {
    settings: null,
    vision: null,
    gestureEngine: null
};
let timers = {
    speedDelete: null,
    initialDelay: null,
    longPress: null,
    settingsLongPress: null,
    stealth: null,
    stealthAction: null,
    playback: null,
    tap: null
};
let gestureState = {
    startDist: 0,
    startScale: 1,
    isPinching: false
};
let blackoutState = {
    isActive: false,
    lastShake: 0
};
let gestureInputState = {
    startX: 0,
    startY: 0,
    startTime: 0,
    maxTouches: 0,
    isTapCandidate: false,
    tapCount: 0
};
let isDeleting = false;
let isDemoPlaying = false;
let isPlaybackPaused = false;
let playbackResumeCallback = null;
let practiceSequence = [];
let practiceInputIndex = 0;
let ignoreNextClick = false;
let voiceModule = null;
let isGesturePadVisible = false;
let simpleTimer = {
    interval: null,
    startTime: 0,
    elapsed: 0,
    isRunning: false
};
let simpleCounter = 0;
let globalTimerActions = {
    start: null,
    stop: null,
    reset: null
};
let globalCounterActions = {
    increment: null,
    reset: null
};
const getProfileSettings = () => appSettings.runtimeSettings;
const getState = () => appState['current_session'] || (appState['current_session'] = {
    sequences: Array.from({
        length: CONFIG.MAX_MACHINES
    }, () => []),
    nextSequenceIndex: 0,
    currentRound: 1
});
let _savedScrollY = 0;
let _scrollLocked = false;
const _MODAL_IDS = ['settings-modal', 'help-modal', 'developer-mode-modal', 'share-modal', 'comment-modal', 'redeem-modal', 'donate-modal', 'theme-editor-modal', 'game-setup-modal'];
const startApp = () => {
    loadState();
    window.appSettings = appSettings;
    if (appSettings.isEcoModeEnabled) document.body.classList.add('eco-mode');
    const headerfullscreenbtn = document.getElementById('headerfullscreenbtn');
    if (headerfullscreenbtn) {
        headerfullscreenbtn.onclick = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn(`Fullscreen error: ${err.message}`);
                });
                headerfullscreenbtn.classList.add('ring-2', 'ring-emerald-500');
            } else {
                document.exitFullscreen();
                headerfullscreenbtn.classList.remove('ring-2', 'ring-emerald-500');
            }
        };
    }
    const headerupsidedownbtn = document.getElementById('headerupsidedownbtn');
    if (headerupsidedownbtn) {
        headerupsidedownbtn.onclick = () => {
            document.body.classList.toggle('rotate-180');
            if (document.body.classList.contains('rotate-180')) {
                headerupsidedownbtn.classList.add('ring-2', 'ring-emerald-500');
                showToast("Upside Down Mode: ON 🙃");
            } else {
                headerupsidedownbtn.classList.remove('ring-2', 'ring-emerald-500');
                showToast("Upside Down Mode: OFF");
            }
        };
    }
    if (appSettings.isWakeLockEnabled && typeof window.wakelockToggle === 'function') {
        window.wakelockToggle(true);
    }
    modules.settings = new SettingsManager(appSettings, {
        onSave: () => saveState(),
        onUpdate: () => updateAllChrome(),
        onProfileSwitch: id => {
            appSettings.activeProfileId = id;
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
            saveState();
            renderUI();
        },
        onProfileAdd: name => {
            const id = 'p_' + Date.now();
            appSettings.profiles[id] = {
                name: name,
                settings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)),
                theme: 'default'
            };
            saveState();
        },
        onProfileRename: name => {
            appSettings.profiles[appSettings.activeProfileId].name = name;
            saveState();
        },
        onProfileDelete: () => {
            if (Object.keys(appSettings.profiles).length > 1) {
                delete appSettings.profiles[appSettings.activeProfileId];
                appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
                appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings));
                saveState();
                renderUI();
            } else {
                alert("Cannot delete the last profile.");
            }
        },
        onProfileSave: () => {
            appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings));
            saveState();
        },
        onReset: () => {
            localStorage.clear();
            window.location.reload();
        }
    });
    class SmartCadenceTracker {
        constructor(onNewNote, onReset) {
            this.onNewNote = onNewNote;
            this.onReset = onReset;
            this.knownSeq = [];
            this.turnIndex = 0;
            this.lastToneTime = 0;
            this.countOffBuffer = [];
            this.TURN_TIMEOUT_MS = 1800;
        }
        handleTone(note) {
            const now = Date.now();
            const elapsed = now - this.lastToneTime;
            this.lastToneTime = now;
            if (elapsed > this.TURN_TIMEOUT_MS) {
                this.turnIndex = 0;
                this.countOffBuffer = [];
            }
            this.countOffBuffer.push(note);
            if (this.countOffBuffer.length > 9) this.countOffBuffer.shift();
            if (this.countOffBuffer.join(',') === "1,2,3,4,5,6,7,8,9") {
                showToast("Count-Off Complete. Tracking Ready 🎯");
                this.knownSeq = [];
                this.turnIndex = 0;
                this.countOffBuffer = [];
                this.onReset();
                return;
            }
            if (this.turnIndex < this.knownSeq.length) {
                if (note == this.knownSeq[this.turnIndex]) {
                    this.turnIndex++;
                } else {
                    if (this.turnIndex === 0) {
                        showToast("New Sequence Started 🔄");
                        this.knownSeq = [note];
                        this.turnIndex = 1;
                        this.onReset();
                        this.onNewNote(note);
                    } else {
                        console.log(`Ignored stray tone: expected ${this.knownSeq[this.turnIndex]}, got ${note}`);
                    }
                }
            } else if (this.turnIndex === this.knownSeq.length) {
                this.knownSeq.push(note);
                this.turnIndex++;
                this.onNewNote(note);
            }
        }
    }
    const smartTracker = new SmartCadenceTracker(val => {
        addValue(val);
        showToast(`🎵 Tone Added: ${val}`);
    }, () => {
        const state = getState();
        state.sequences = Array.from({
            length: CONFIG.MAX_MACHINES
        }, () => []);
        state.nextSequenceIndex = 0;
        state.currentRound = 1;
        renderUI();
        saveState();
    });
    class ToneSequenceTester {
        constructor() {
            this.audioCtx = null;
            this.isPlaying = false;
            this.stopRequested = false;
            this.TONES = {
                1: 261.63,
                2: 293.66,
                3: 329.63,
                4: 349.23,
                5: 392.00,
                6: 440.00,
                7: 493.88,
                8: 523.25,
                9: 587.33
            };
        }
        _initAudio() {
            if (!this.audioCtx) {
                this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
            }
        }
        async playTone(frequency, durationMs) {
            this._initAudio();
            if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            const attack = 0.01,
                release = 0.01;
            const durationSec = durationMs / 1000;
            const now = this.audioCtx.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, now + attack);
            gainNode.gain.setValueAtTime(1, now + durationSec - release);
            gainNode.gain.linearRampToValueAtTime(0, now + durationSec);
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            oscillator.start(now);
            oscillator.stop(now + durationSec);
            return new Promise(resolve => setTimeout(resolve, durationMs));
        }
        async playSequence(sequence, toneDurationMs = 200, silenceDurationMs = 800, onProgress) {
            this.isPlaying = true;
            this.stopRequested = false;
            for (let i = 0; i < sequence.length; i++) {
                if (this.stopRequested) break;
                const num = sequence[i];
                const freq = this.TONES[num];
                if (freq) {
                    if (onProgress) onProgress(i, sequence.length, num, freq);
                    await this.playTone(freq, toneDurationMs);
                    if (this.stopRequested) break;
                    if (i < sequence.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, silenceDurationMs));
                    }
                }
            }
            this.isPlaying = false;
            if (onProgress) onProgress(-1, sequence.length, null, null);
        }
        stop() {
            this.stopRequested = true;
        }
    }
    const toneSequenceTester = new ToneSequenceTester();
    window.toneSequenceTester = toneSequenceTester;
    const toneEngine = new ToneEngine(val => {
        smartTracker.handleTone(val);
   const devModal = document.getElementById('developer-mode-modal');
    if (devModal && !devModal.classList.contains('opacity-0')) {
        const historyEl = document.getElementById('tone-test-history');
        if (historyEl) {
            historyEl.textContent += (historyEl.textContent ? ", " : "") + val;
        }
    }
    }, debug => {
        const el = document.getElementById('tone-debug-indicator');
        const testEl = document.getElementById('test-tone-readout');
        let text;
        if (debug.error) {
            text = `🎵 Mic error: ${debug.error}`;
        } else if (debug.note) {
            text = `🎵 ${['', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D'][debug.note]} (${debug.freq}Hz) #${debug.note}`;
        } else if (debug.freq) {
            text = `🎵 ${debug.freq}Hz (no note match)`;
        } else {
            text = `🎵 listening...`;
        }
        if (el) el.textContent = text;
        if (testEl) testEl.textContent = text;
    });
    window.toneEngine = toneEngine;
    let gestureHistory = [];
    let gestureCooldownUntil = 0;
    if (typeof VisionEngine !== 'function') {
        console.warn('VisionEngine unavailable (wasm/vision_bundle.js not found) - hand tracking disabled.');
        modules.vision = {
            isActive: false,
            start() {
                showToast('Hand tracking unavailable (missing wasm/vision_bundle.js) ❌');
            },
            stop() {}
        };
    } else {
        modules.vision = new VisionEngine(gestureData => {
            const settings = getProfileSettings();
            if (Date.now() < gestureCooldownUntil) {
                return;
            }
            if (!gestureData || gestureData === "none") {
                return;
            }
            let gestureId = typeof gestureData === 'object' ? gestureData.id : gestureData;
            if (typeof gestureId === 'number' && gestureId >= 0 && gestureId <= 63 && gestureId % 2 === 1) {
                gestureId = gestureId - 1;
            }
            const gestureLabel = typeof gestureData === 'object' ? gestureData.label : "Gesture";
            const handSide = (typeof gestureData === 'object' && gestureData.hand) ? gestureData.hand : null;
            const handReadout = document.getElementById('test-hand-readout');
            if (handReadout) {
                const sideLabel = handSide === 'L' ? '✋ Left hand' : handSide === 'R' ? '🤚 Right hand' : '';
                handReadout.textContent = `ID ${gestureId} - ${gestureLabel}${sideLabel ? ' | ' + sideLabel : ''}`;
            }
            if (window.__testChecklists?.hand) window.__testChecklists.hand.mark(String(gestureId));
            // FIX: "also adds to sequence in test mode" - the vision engine is one shared
            // instance (unlike touch, which has its own fully separate test engine), so a
            // detection during a camera test was also flowing straight into real input handling
            // below. This flag, set only while the Hand test tab's camera is actually running,
            // stops it there - test detections still update the readout/checklist above, they
            // just never reach Hand Signals or the real per-key mapping.
            if (window.__handTestModeActive) return;
            if (appSettings.isHandGesturesEnabled && appSettings.isHandSignalsEnabled) {
                if (gestureId === 'TWO_HAND_CLEAR') {
                    showToast("Hand Signal: Clear 🧹✊✊");
                    if (typeof resetCurrentMachine === 'function') resetCurrentMachine();
                    gestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
                    return;
                }
                if (gestureId === 'TWO_HAND_DELETE') {
                    showToast("Hand Signal: Delete 🔙👎👎");
                    if (typeof handleBackspace === 'function') handleBackspace();
                    gestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
                    return;
                }
                if (gestureId === 'TWO_HAND_PLAY') {
                    showToast("Hand Signal: Playing ▶️👍👍");
                    playDemo();
                    gestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
                    return;
                }
                if (gestureId === 'TWO_HAND_STOP') {
                    isDemoPlaying = false;
                    showToast("Hand Signal: Stopped 🛑✋✋");
                    gestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
                    return;
                }
            }
            let mappedInput = null;
            if (appSettings.mappings) {
                for (const [key, mapData] of Object.entries(appSettings.mappings)) {
                    const prefix = settings.currentInput === 'key9' ? 'k9_' : settings.currentInput === 'key12' ? 'k12_' : 'piano_';
                    if (key.startsWith(prefix) && parseInt(mapData.handGesture) === gestureId) {
                        mappedInput = key.replace(prefix, '');
                        break;
                    }
                }
            } else if (typeof mapGestureToValue === 'function') {
                mappedInput = mapGestureToValue(gestureId, settings.currentInput);
            }
            if (mappedInput !== null) {
                addValue(mappedInput);
                showToast(`Hand: ${mappedInput} (${gestureLabel}) 🖐️`);
                document.body.style.backgroundColor = '#222';
                setTimeout(() => document.body.style.backgroundColor = '', 100);
                gestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
            }
        }, status => showToast(status));
    }
    voiceModule = new VoiceCommander({
        onStatus: msg => showToast(msg),
        onInput: val => {
            addValue(val);
            const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
            if (btn) {
                btn.classList.add('flash-active');
                setTimeout(() => btn.classList.remove('flash-active'), 200);
            }
            const hMic = document.getElementById('headervoicebtn');
            if (hMic) {
                hMic.classList.remove('header-btn-active');
                setTimeout(() => {
                    if (voiceModule.isListening) hMic.classList.add('header-btn-active');
                }, 300);
            }
        },
        onCommand: cmd => {
            if (!appSettings.isVoiceInputEnabled || !appSettings.isVoiceCommandsEnabled) {
                console.log("Voice commands disabled (Voice Input or Voice Commands is off). Ignoring:", cmd);
                return;
            }
            if (cmd === 'CMD_PLAY') {
                playDemo();
                showToast("Voice: Playing ▶️");
            }
            if (cmd === 'CMD_STOP') {
                isDemoPlaying = false;
                showToast("Voice: Stopped 🛑");
            }
            if (cmd === 'CMD_CLEAR') {
                const s = getState();
                s.sequences = Array.from({
                    length: CONFIG.MAX_MACHINES
                }, () => []);
                renderUI();
                showToast("Voice: Cleared All 💥");
            }
            if (cmd === 'CMD_DELETE') {
                handleBackspace();
                showToast("Voice: Backspace 🔙");
            }
            if (cmd === 'CMD_SETTINGS') {
                modules.settings.openSettings();
            }
        }
    });
    if (appSettings.isRandomThemeEnabled) {
        const allThemeKeys = [...Object.keys(PREMADE_THEMES), ...Object.keys(appSettings.customThemes || ({}))];
        if (allThemeKeys.length > 0) {
            appSettings.activeTheme = allThemeKeys[Math.floor(Math.random() * allThemeKeys.length)];
        }
    }
    updateAllChrome();
    initFirebaseAndComments();
    modules.settings.updateHeaderVisibility();
    initGlobalListeners();
    initGestureEngine();
    setupARLogic();
    renderUI();
};
const DEFAULT_HAND_MAPPINGS = {
    'k9_1': 'hand_1_up',
    'k9_2': 'hand_2_up',
    'k9_3': 'hand_3_up',
    'k9_4': 'hand_4_up',
    'k9_5': 'hand_5_up',
    'k9_6': 'hand_1_down',
    'k9_7': 'hand_2_down',
    'k9_8': 'hand_3_down',
    'k9_9': 'hand_4_down',
    'k12_1': 'hand_1_up',
    'k12_2': 'hand_2_up',
    'k12_3': 'hand_3_up',
    'k12_4': 'hand_4_up',
    'k12_5': 'hand_5_up',
    'k12_6': 'hand_1_down',
    'k12_7': 'hand_2_down',
    'k12_8': 'hand_3_down',
    'k12_9': 'hand_4_down',
    'k12_10': 'hand_5_down',
    'k12_11': 'hand_1_right',
    'k12_12': 'hand_1_left',
    'piano_C': 'hand_1_up',
    'piano_D': 'hand_2_up',
    'piano_E': 'hand_3_up',
    'piano_F': 'hand_4_up',
    'piano_G': 'hand_5_up',
    'piano_A': 'hand_1_right',
    'piano_B': 'hand_1_left',
    'piano_1': 'hand_1_down',
    'piano_2': 'hand_2_down',
    'piano_3': 'hand_3_down',
    'piano_4': 'hand_4_down',
    'piano_5': 'hand_5_down'
};
class ToneEngine {
    constructor(onInputCallback, onDebug) {
        this.onInput = onInputCallback;
        this.onDebug = onDebug || null;
        this.audioCtx = null;
        this.analyser = null;
        this.micSrc = null;
        this.isActive = false;
        this.loopId = null;
        this.TONES = [{
            n: 1,
            f: 261.63
        }, {
            n: 2,
            f: 293.66
        }, {
            n: 3,
            f: 329.63
        }, {
            n: 4,
            f: 349.23
        }, {
            n: 5,
            f: 392.00
        }, {
            n: 6,
            f: 440.00
        }, {
            n: 7,
            f: 493.88
        }, {
            n: 8,
            f: 523.25
        }, {
            n: 9,
            f: 587.33
        }];
        this.audioThresh = -70;
        this.currentTone = null;
        this.toneStartTime = 0;
        this.lastToneEndTime = 0;
    }
    async start() {
        if (this.isActive) return;
        try {
            this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 4096;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            this.micSrc = this.audioCtx.createMediaStreamSource(stream);
            this.micSrc.connect(this.analyser);
            this.isActive = true;
            this.lastToneEndTime = 0;
            this.currentTone = null;
            this.loop();
            console.log("🎵 Tone Cadence Engine: LISTENING");
        } catch (e) {
            console.error("Tone Engine failed to get microphone access:", e);
            if (this.onDebug) this.onDebug({
                error: e.name || 'Unknown'
            });
        }
    }
    stop() {
        this.isActive = false;
        if (this.loopId) cancelAnimationFrame(this.loopId);
        if (this.audioCtx && this.audioCtx.state === 'running') {
            this.audioCtx.suspend();
        }
        if (this.micSrc) {
            this.micSrc.mediaStream.getTracks().forEach(t => t.stop());
            this.micSrc.disconnect();
        }
        this.currentTone = null;
        console.log("🛑 Tone Cadence Engine: STOPPED");
    }
    _detectPitch(buffer, sampleRate) {
        const SIZE = buffer.length;
        let rms = 0;
        for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1;
        const minLag = Math.floor(sampleRate / 950);
        const maxLag = Math.ceil(sampleRate / 180);
        const usableSize = SIZE - maxLag;
        if (usableSize <= 0) return -1;
        const corr = new Float32Array(maxLag + 1);
        for (let lag = minLag; lag <= maxLag; lag++) {
            let c = 0;
            for (let i = 0; i < usableSize; i++) c += buffer[i] * buffer[i + lag];
            corr[lag] = c;
        }
        let bestLag = -1,
            bestCorr = -1;
        for (let lag = minLag; lag <= maxLag; lag++) {
            if (corr[lag] > bestCorr) {
                bestCorr = corr[lag];
                bestLag = lag;
            }
        }
        if (bestLag <= 0) return -1;
        const strongThreshold = bestCorr * 0.85;
        for (let lag = minLag; lag < bestLag; lag++) {
            if (corr[lag] >= strongThreshold) {
                bestLag = lag;
                bestCorr = corr[lag];
                break;
            }
        }
        let refinedLag = bestLag;
        if (bestLag > minLag && bestLag < maxLag) {
            const c0 = corr[bestLag - 1],
                c1 = bestCorr,
                c2 = corr[bestLag + 1];
            const denom = c0 - 2 * c1 + c2;
            if (denom !== 0) refinedLag = bestLag + 0.5 * (c0 - c2) / denom;
        }
        return refinedLag > 0 ? sampleRate / refinedLag : -1;
    }
    loop() {
        if (!this.isActive) return;
        const timeData = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(timeData);
        const freqData = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(freqData);
        let maxVal = -Infinity;
        for (let i = 0; i < freqData.length; i++)
            if (freqData[i] > maxVal) maxVal = freqData[i];
        const now = Date.now();
        if (maxVal > (appSettings.toneVolumeThreshold || this.audioThresh)) {
            const freq = this._detectPitch(timeData, this.audioCtx.sampleRate);
            const match = freq > 0 ? this.TONES.find(t => Math.abs(t.f - freq) < t.f * 0.04) : null;
            if (this.onDebug) this.onDebug({
                freq: freq > 0 ? Math.round(freq) : null,
                note: match ? match.n : null,
                db: Math.round(maxVal)
            });
            if (match) {
                if (!this.currentTone) {
                    this.currentTone = match.n;
                    this.toneStartTime = now;
                } else if (this.currentTone !== match.n) {
                    this.currentTone = match.n;
                    this.toneStartTime = now;
                }
            }
        } else {
            if (this.onDebug) this.onDebug({
                freq: null,
                note: null,
                db: Math.round(maxVal)
            });
            if (this.currentTone) {
                const toneDuration = now - this.toneStartTime;
                const silenceDuration = this.toneStartTime - this.lastToneEndTime;
                const isToneValid = toneDuration >= 100 && toneDuration <= 350;
                const isSilenceValid = this.lastToneEndTime === 0 || silenceDuration >= 600 && silenceDuration <= 1100;
                if (isToneValid && isSilenceValid) {
                    this.onInput(this.currentTone);
                }
                this.lastToneEndTime = now;
                this.currentTone = null;
            }
        }
        this.loopId = requestAnimationFrame(() => this.loop());
    }
}
class VoiceCommander {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.recognition = null;
        this.isListening = false;
        this.restartTimer = null;
        this.vocab = {
            '1': '1',
            'one': '1',
            'won': '1',
            '2': '2',
            'two': '2',
            'to': '2',
            'too': '2',
            '3': '3',
            'three': '3',
            'tree': '3',
            '4': '4',
            'four': '4',
            'for': '4',
            'fore': '4',
            '5': '5',
            'five': '5',
            '6': '6',
            'six': '6',
            '7': '7',
            'seven': '7',
            '8': '8',
            'eight': '8',
            'ate': '8',
            '9': '9',
            'nine': '9',
            '10': '10',
            'ten': '10',
            'tin': '10',
            '11': '11',
            'eleven': '11',
            '12': '12',
            'twelve': '12',
            'a': 'A',
            'hey': 'A',
            'b': 'B',
            'bee': 'B',
            'be': 'B',
            'c': 'C',
            'see': 'C',
            'sea': 'C',
            'd': 'D',
            'dee': 'D',
            'e': 'E',
            'f': 'F',
            'g': 'G',
            'jee': 'G'
        };
        this.commandVocab = {
            'play': 'CMD_PLAY',
            'start': 'CMD_PLAY',
            'go': 'CMD_PLAY',
            'stop': 'CMD_STOP',
            'pause': 'CMD_STOP',
            'clear': 'CMD_CLEAR',
            'reset': 'CMD_CLEAR',
            'delete': 'CMD_DELETE',
            'backspace': 'CMD_DELETE',
            'undo': 'CMD_DELETE',
            'back': 'CMD_DELETE',
            'settings': 'CMD_SETTINGS',
            'options': 'CMD_SETTINGS'
        };
        this.initEngine();
    }
    initEngine() {
        if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
            this.recognition = new SpeechRec();
            if (SpeechGrammarList) {
                const activeTrigger = appSettings.voiceTriggerWord || 'set';
                const targets = Object.keys(this.vocab);
                const commandWords = Object.keys(this.commandVocab);
                const whitelist = [activeTrigger, ...targets, ...commandWords].join(' | ');
                const grammar = `#JSGF V1.0; grammar appCommands; public <command> = ${whitelist} ;`;
                const speechRecognitionList = new SpeechGrammarList();
                speechRecognitionList.addFromString(grammar, 1);
                this.recognition.grammars = speechRecognitionList;
            }
            this.recognition.continuous = true;
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;
            this.recognition.onresult = event => this.handleResult(event);
            this.recognition.onend = () => this.handleEnd();
        }
    }
    toggle(active) {
        if (!this.recognition) return;
        if (active) {
            this.isListening = true;
            try {
                this.recognition.start();
            } catch (e) {}
            this.callbacks.onStatus(`Voice Active (Say '${appSettings.voiceTriggerWord.toUpperCase()}...') 🎙️`);
        } else {
            this.isListening = false;
            try {
                this.recognition.stop();
            } catch (e) {}
            clearTimeout(this.restartTimer);
            this.callbacks.onStatus("Voice Off 🔇");
        }
    }
    handleResult(event) {
        const activeTrigger = (appSettings.voiceTriggerWord || 'set').toLowerCase();
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            const words = transcript.split(/\s+/).filter(w => w !== "");
            const confidence = event.results[i][0].confidence;
            const voiceReadout = document.getElementById('test-voice-readout');
            if (voiceReadout) voiceReadout.textContent = `"${transcript}"` + (event.results[i].isFinal ? ` (${Math.round(confidence * 100)}%)` : ' (listening...)');
            const minConfidence = (appSettings.voiceConfidenceThreshold || 50) / 100;
            if (event.results[i].isFinal && confidence > 0 && confidence < minConfidence) {
                continue;
            }
            const triggerIdx = words.lastIndexOf(activeTrigger);
            if (triggerIdx !== -1 && triggerIdx < words.length - 1) {
                const nextWord = words[triggerIdx + 1];
                const cmd = this.commandVocab[nextWord];
                if (cmd) {
                    this.callbacks.onCommand(cmd);
                    this.recognition.abort();
                    return;
                }
                const mappedValue = this.vocab[nextWord];
                if (mappedValue) {
                    this.callbacks.onInput(mappedValue);
                    this.recognition.abort();
                    return;
                }
            }
        }
    }
    handleEnd() {
        if (this.isListening) {
            this.restartTimer = setTimeout(() => {
                try {
                    this.recognition.start();
                } catch (e) {}
            }, 100);
        }
    }
}
async function reacquireWakeLock() {
    if (document.visibilityState === 'visible' && appSettings.isWakeLockEnabled) {
        try {
            screenWakeLock = await navigator.wakeLock.request('screen');
        } catch (e) {
            console.warn('Wake Lock reacquire failed during visibility shift:', e);
        }
    }
}
async function initFirebaseAndComments() {
    try {
        const {
            initializeApp
        } = await import("https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js");
        const {
            getFirestore,
            enableIndexedDbPersistence,
            collection,
            addDoc,
            query,
            orderBy,
            limit,
            onSnapshot,
            serverTimestamp
        } = await import("https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js");
        const fbApp = initializeApp(firebaseConfig);
        db = getFirestore(fbApp);
        enableIndexedDbPersistence(db).catch(err => {
            if (err.code === 'failed-precondition') {
                console.log('Multiple tabs open, persistence can only be enabled in one.');
            } else if (err.code === 'unimplemented') {
                console.log('Browser does not support persistence');
            }
        });
        const submitBtn = document.getElementById('submit-comment-btn');
        const listContainer = document.getElementById('comments-list-container');
        const nameInput = document.getElementById('comment-username');
        const msgInput = document.getElementById('comment-message');
        if (submitBtn) {
            submitBtn.onclick = async () => {
                const username = nameInput.value.trim();
                const message = msgInput.value.trim();
                if (!username || !message) {
                    alert("Please enter name and message.");
                    return;
                }
                submitBtn.disabled = true;
                submitBtn.innerText = "Sending...";
                try {
                    await addDoc(collection(db, "comments"), {
                        username,
                        message,
                        timestamp: serverTimestamp()
                    });
                    msgInput.value = "";
                    submitBtn.innerText = "Sent!";
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Send";
                    }, 2000);
                } catch (e) {
                    console.error("Error sending comment", e);
                    submitBtn.innerText = "Error";
                    submitBtn.disabled = false;
                }
            };
        }
        const q = query(collection(db, "comments"), orderBy("timestamp", "desc"), limit(50));
        onSnapshot(q, snapshot => {
            if (!listContainer) return;
            if (snapshot.empty) {
                listContainer.innerHTML = '<p class="text-center text-gray-500 text-xs">No comments yet.</p>';
                return;
            }
            listContainer.innerHTML = "";
            snapshot.forEach(doc => {
                const data = doc.data();
                const el = document.createElement('div');
                el.className = "p-3 mb-2 rounded-lg bg-black bg-opacity-20 border border-gray-700";
                el.innerHTML = `<p class="font-bold text-primary-app text-xs">${escapeHtml(data.username)}</p><p class="text-gray-300 text-sm">${escapeHtml(data.message)}</p>`;
                listContainer.appendChild(el);
            });
        });
    } catch (err) {
        console.warn('Firebase/comments unavailable (offline or blocked) - rest of the app is unaffected:', err.message);
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function saveState() {
    localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings));
    localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState));
}

function settingsToHex() {
    const json = JSON.stringify(appSettings);
    const bytes = new TextEncoder().encode(json);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToSettingsObject(hex) {
    const clean = hex.trim().replace(/\s+/g, '');
    if (!(/^[0-9a-fA-F]+$/).test(clean) || clean.length % 2 !== 0) {
        throw new Error('Not a valid hex string');
    }
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
}

function importSettingsFromHex(hex) {
    const imported = hexToSettingsObject(hex);
    const merged = {
        ...DEFAULT_APP,
        ...imported
    };
    Object.keys(appSettings).forEach(k => delete appSettings[k]);
    Object.assign(appSettings, merged);
    saveState();
    updateAllChrome();
    if (modules.settings) modules.settings.updateUIFromSettings();
    return true;
}

function loadState() {
    try {
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
        const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE);
        if (s) {
            const loaded = JSON.parse(s);
            appSettings = {
                ...DEFAULT_APP,
                ...loaded,
                profiles: {
                    ...DEFAULT_APP.profiles,
                    ...loaded.profiles || ({})
                },
                customThemes: {
                    ...DEFAULT_APP.customThemes,
                    ...loaded.customThemes || ({})
                }
            };
            if (typeof appSettings.isHapticsEnabled === 'undefined') appSettings.isHapticsEnabled = true;
            if (typeof appSettings.isSpeedDeletingEnabled === 'undefined') appSettings.isSpeedDeletingEnabled = true;
            if (typeof appSettings.isLongPressAutoplayEnabled === 'undefined') appSettings.isLongPressAutoplayEnabled = true;
            if (typeof appSettings.isUniqueRoundsAutoClearEnabled === 'undefined') appSettings.isUniqueRoundsAutoClearEnabled = true;
            if (typeof appSettings.showTimer === 'undefined') appSettings.showTimer = false;
            if (typeof appSettings.showCounter === 'undefined') appSettings.showCounter = false;
            if (!appSettings.voicePresets) appSettings.voicePresets = {};
            if (!appSettings.activeVoicePresetId) appSettings.activeVoicePresetId = 'standard';
            if (!appSettings.gestureResizeMode) appSettings.gestureResizeMode = 'global';
            if (!appSettings.runtimeSettings) appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId]?.settings || DEFAULT_PROFILE_SETTINGS));
            if (appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
        } else {
            appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles['profile_1'].settings));
        }
        if (st) appState = JSON.parse(st);
        if (!appState['current_session']) appState['current_session'] = {
            sequences: Array.from({
                length: CONFIG.MAX_MACHINES
            }, () => []),
            nextSequenceIndex: 0,
            currentRound: 1
        };
        appState['current_session'].currentRound = parseInt(appState['current_session'].currentRound) || 1;
    } catch (e) {
        console.error("Load failed", e);
        appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
        saveState();
    }
}

function vibrate() {
    if (appSettings.isHapticsEnabled && navigator.vibrate) navigator.vibrate(10);
}

function vibrateMorse(val) {
    if (!navigator.vibrate || !appSettings.isHapticMorseEnabled) return;
    let num = parseInt(val);
    if (isNaN(num)) {
        const map = {
            'A': 6,
            'B': 7,
            'C': 8,
            'D': 9,
            'E': 10,
            'F': 11,
            'G': 12
        };
        num = map[val.toUpperCase()] || 1;
    }
    let patternStr = "";
    if (appSettings.morseMappings && appSettings.morseMappings[num]) {
        patternStr = appSettings.morseMappings[num];
    } else {
        if (num <= 3) patternStr = (".").repeat(num);
        else if (num <= 6) patternStr = "-" + (".").repeat(num - 3);
        else if (num <= 9) patternStr = "--" + (".").repeat(num - 6);
        else patternStr = "---" + (".").repeat(num - 10);
    }
    const speed = appSettings.playbackSpeed || 1.0;
    const factor = 1.0 / speed;
    const DOT = 100 * factor,
        DASH = 300 * factor,
        GAP = 100 * factor;
    let pattern = [];
    for (let char of patternStr) {
        if (char === '.') pattern.push(DOT);
        if (char === '-') pattern.push(DASH);
        pattern.push(GAP);
    }
    if (pattern.length > 0) navigator.vibrate(pattern);
}

function handleGesture(kind) {
    const indicator = document.getElementById('gesture-indicator');
    if (indicator) {
        indicator.textContent = `Gesture: ${kind.replace(/_/g, ' ')}`;
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0.3';
            indicator.textContent = 'Area Active';
        }, 1000);
    }
    const settings = getProfileSettings();
    const mapResult = mapGestureToValue(kind, settings.currentInput);
    if (mapResult !== null) addValue(mapResult);
}

function speak(text) {
    if (!appSettings.isAudioEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (appSettings.selectedVoice) {
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(voice => voice.name === appSettings.selectedVoice);
        if (v) u.voice = v;
    }
    let p = appSettings.voicePitch || 1.0;
    let r = appSettings.voiceRate || 1.0;
    u.volume = appSettings.voiceVolume || 1.0;
    u.pitch = Math.min(2, Math.max(0.1, p));
    u.rate = Math.min(10, Math.max(0.1, r));
    window.speechSynthesis.speak(u);
}

function _anyModalVisible() {
    return _MODAL_IDS.some(id => {
        const el = document.getElementById(id);
        return el && !el.classList.contains('opacity-0') && !el.classList.contains('pointer-events-none') && !el.classList.contains('hidden');
    });
}

function lockBodyScroll() {
    if (!_scrollLocked) {
        _savedScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${_savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        _scrollLocked = true;
    }
}

function unlockBodyScroll() {
    setTimeout(() => {
        if (_scrollLocked && !_anyModalVisible()) {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            window.scrollTo(0, _savedScrollY);
            _scrollLocked = false;
        }
    }, 50);
}

function showToast(msg) {
    const t = document.getElementById('toast-notification');
    const m = document.getElementById('toast-message');
    if (!t || !m) return;
    m.textContent = msg;
    t.classList.remove('opacity-0', '-translate-y-10');
    setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000);
}

function applyTheme(themeKey) {
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');
    let t = appSettings.customThemes[themeKey];
    if (!t && PREMADE_THEMES[themeKey]) t = PREMADE_THEMES[themeKey];
    if (!t) t = PREMADE_THEMES['default'];
    body.style.setProperty('--primary', t.bubble);
    body.style.setProperty('--bg-main', t.bgMain);
    body.style.setProperty('--bg-modal', t.bgCard);
    body.style.setProperty('--card-bg', t.bgCard);
    body.style.setProperty('--seq-bubble', t.bubble);
    body.style.setProperty('--btn-bg', t.btn);
    body.style.setProperty('--bg-input', t.bgMain);
    body.style.setProperty('--text-main', t.text);
    const hex = t.bgCard.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const isDark = 0.299 * r + 0.587 * g + 0.114 * b < 128;
    body.style.setProperty('--border', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
}

function updateAllChrome() {
    applyTheme(appSettings.activeTheme);
    document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`;
    document.body.style.fontFamily = appSettings.activeFontFamily || "'Inter', sans-serif";
    renderUI();
}

function startPracticeRound() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
    const state = getState();
    const settings = getProfileSettings();
    const max = settings.currentInput === 'key12' ? 12 : 9;
    const getRand = () => {
        if (settings.currentInput === 'piano') {
            const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', '1', '2', '3', '4', '5'];
            return keys[Math.floor(Math.random() * keys.length)];
        }
        return Math.floor(Math.random() * max) + 1;
    };
    if (practiceSequence.length === 0) state.currentRound = 1;
    if (settings.currentMode === CONFIG.MODES.SIMON) {
        practiceSequence.push(getRand());
        state.currentRound = practiceSequence.length;
    } else {
        practiceSequence = [];
        const len = state.currentRound;
        for (let i = 0; i < len; i++) practiceSequence.push(getRand());
    }
    practiceInputIndex = 0;
    renderUI();
    showToast(`Practice Round ${state.currentRound}`);
    setTimeout(() => playPracticeSequence(), 1000);
}

function playPracticeSequence() {
    let i = 0;
    const speed = appSettings.playbackSpeed || 1.0;
    disableInput(true);

    function next() {
        if (i >= practiceSequence.length) {
            disableInput(false);
            return;
        }
        const val = practiceSequence[i];
        const settings = getProfileSettings();
        const key = document.querySelector(`#pad-${settings.currentInput} button[data-value="${val}"]`);
        if (key) {
            key.classList.add('flash-active');
            setTimeout(() => key.classList.remove('flash-active'), 250 / speed);
        }
        speak(val);
        i++;
        setTimeout(next, 800 / speed);
    }
    next();
}

function addValue(value) {
    vibrate();
    const state = getState();
    const settings = getProfileSettings();
    if (appSettings.isPracticeModeEnabled) {
        if (practiceSequence.length === 0) return;
        if (value == practiceSequence[practiceInputIndex]) {
            practiceInputIndex++;
            if (practiceInputIndex >= practiceSequence.length) {
                speak("Correct");
                state.currentRound++;
                setTimeout(startPracticeRound, 1500);
            }
        } else {
            speak("Wrong");
            navigator.vibrate(500);
            setTimeout(() => playPracticeSequence(), 1500);
        }
        return;
    }
    let targetIndex = 0;
    if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
    const roundNum = parseInt(state.currentRound) || 1;
    const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
    let limit;
    if (isUnique) {
        limit = appSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength;
    } else {
        limit = settings.sequenceLength;
    }
    if (state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
        if (isUnique && appSettings.isUniqueRoundsAutoClearEnabled) {
            showToast("Round Full - Reset? 🛑");
            vibrate();
        }
        return;
    }
    let isFirstInput = true;
    state.sequences.forEach(s => {
        if (s.length > 0) isFirstInput = false;
    });
    if (isFirstInput) {
        if (appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.reset && globalTimerActions.start) {
            globalTimerActions.reset();
            globalTimerActions.start();
        }
        if (appSettings.isAutoCounterEnabled && appSettings.showCounter && globalCounterActions.increment) {
            globalCounterActions.increment();
        }
    }
    if (!state.sequences[targetIndex]) state.sequences[targetIndex] = [];
    state.sequences[targetIndex].push(value);
    state.nextSequenceIndex++;
    renderUI();
    saveState();
    if (appSettings.isAutoplayEnabled) {
        if (settings.currentMode === CONFIG.MODES.SIMON) {
            const justFilled = (state.nextSequenceIndex - 1) % settings.machineCount;
            if (justFilled === settings.machineCount - 1) setTimeout(playDemo, 250);
        } else {
            if (appSettings.isUniqueRoundsAutoClearEnabled) {
                if (state.sequences[0].length >= roundNum) {
                    disableInput(true);
                    setTimeout(playDemo, 250);
                }
            } else {
                setTimeout(playDemo, 250);
            }
        }
    }
}

function handleBackspace(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    vibrate();
    const state = getState();
    const settings = getProfileSettings();
    if (state.nextSequenceIndex <= 0) return;
    if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        if (state.sequences[0].length > 0) {
            state.sequences[0].pop();
            state.nextSequenceIndex--;
        }
    } else {
        let target = (state.nextSequenceIndex - 1) % settings.machineCount;
        if (target < 0) target = settings.machineCount - 1;
        if (state.sequences[target] && state.sequences[target].length > 0) {
            state.sequences[target].pop();
            state.nextSequenceIndex--;
        }
    }
    let isEmpty = true;
    state.sequences.forEach(s => {
        if (s.length > 0) isEmpty = false;
    });
    if (isEmpty && appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.stop) {
        globalTimerActions.stop();
    }
    renderUI();
    saveState();
}

function applyPositionSwapOffsets(isActive) {
    const footer = document.getElementById('input-footer');
    const app = document.getElementById('app');
    const header = document.getElementById('aux-control-header');
    if (!footer || !app) return;
    if (isActive) {
        const headerVisible = header && !header.classList.contains('header-hidden');
        const headerH = headerVisible ? header.offsetHeight : 0;
        footer.style.top = headerH + 'px';
        footer.style.bottom = 'auto';
        app.style.paddingTop = footer.offsetHeight + headerH + 16 + 'px';
        app.style.paddingBottom = '2rem';
    } else {
        footer.style.top = '';
        footer.style.bottom = '';
        app.style.paddingTop = '';
        app.style.paddingBottom = '';
    }
}

function renderUI() {
    const container = document.getElementById('sequence-container');
    if (!container) return;
    try {
        const gpWrap = document.getElementById('gesture-pad-wrapper');
        const pad = document.getElementById('gesture-pad');
        if (gpWrap) {
            const isGlobalGestureOn = appSettings.isGestureInputEnabled;
            const isBossGestureOn = appSettings.isBlackoutFeatureEnabled && appSettings.isGestureInputEnabled && blackoutState.isActive;
            if (isGlobalGestureOn && isGesturePadVisible || isBossGestureOn) {
                document.body.classList.add('input-gestures-mode');
                gpWrap.classList.remove('hidden');
                if (isBossGestureOn) {
                    gpWrap.style.zIndex = '10001';
                    if (pad) {
                        pad.style.opacity = '0.05';
                        pad.style.borderColor = 'transparent';
                    }
                } else {
                    gpWrap.style.zIndex = '';
                    if (pad) {
                        pad.style.opacity = '1';
                        pad.style.borderColor = '';
                    }
                }
            } else {
                document.body.classList.remove('input-gestures-mode');
                gpWrap.classList.add('hidden');
                gpWrap.style.zIndex = '';
            }
        }
    } catch (e) {
        console.error('Gesture UI error', e);
    }
    container.innerHTML = '';
    const settings = getProfileSettings();
    const state = getState();
    ['key9', 'key12', 'piano'].forEach(k => {
        const el = document.getElementById(`pad-${k}`);
        if (el) el.style.display = settings.currentInput === k ? 'block' : 'none';
    });
    if (document.body.classList.contains('layout-swapped')) {
        setTimeout(() => applyPositionSwapOffsets(true), 0);
    }
    if (appSettings.isPracticeModeEnabled) {
        const header = document.createElement('h2');
        header.className = "text-2xl font-bold text-center w-full mt-4 mb-4";
        header.style.color = "var(--text-main)";
        header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span>`;
        container.appendChild(header);
        if (practiceSequence.length === 0) {
            state.currentRound = 1;
            const btn = document.createElement('button');
            btn.textContent = "START";
            btn.className = "w-48 h-48 rounded-full bg-green-600 hover:bg-green-500 text-white text-3xl font-bold shadow-[0_0_40px_rgba(22,163,74,0.5)] transition-all transform hover:scale-105 active:scale-95 animate-pulse mx-auto block";
            btn.onclick = () => {
                btn.style.display = 'none';
                startPracticeRound();
            };
            container.appendChild(btn);
        } else {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = "flex flex-col items-center gap-3 w-full";
            const replayBtn = document.createElement('button');
            replayBtn.innerHTML = "↻ REPLAY ROUND";
            replayBtn.className = "w-64 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg text-xl active:scale-95 transition-transform";
            replayBtn.onclick = () => {
                practiceInputIndex = 0;
                showToast("Replaying... 👂");
                playPracticeSequence();
            };
            const resetLvlBtn = document.createElement('button');
            resetLvlBtn.innerHTML = "⚠️ Reset to Level 1";
            resetLvlBtn.className = "text-xs text-red-400 hover:text-red-300 underline py-2";
            resetLvlBtn.onclick = () => {
                if (confirm("Restart practice from Level 1?")) {
                    practiceSequence = [];
                    state.currentRound = 1;
                    renderUI();
                }
            };
            controlsDiv.appendChild(replayBtn);
            controlsDiv.appendChild(resetLvlBtn);
            container.appendChild(controlsDiv);
        }
        return;
    }
    const activeSeqs = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS ? [state.sequences[0]] : state.sequences.slice(0, settings.machineCount);
    if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        const roundNum = parseInt(state.currentRound) || 1;
        const header = document.createElement('h2');
        header.className = "text-xl font-bold text-center w-full mb-4 opacity-80";
        header.style.color = "var(--text-main)";
        header.innerHTML = `Unique Mode: <span class=\"text-primary-app\">Round ${roundNum}</span>`;
        container.appendChild(header);
    }
    let gridCols = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS ? 1 : Math.min(settings.machineCount, 4);
    container.className = `grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
    activeSeqs.forEach((seq, idx) => {
        const card = document.createElement('div');
        card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)] relative group";
        if (settings.machineCount > 1) {
            const headerRow = document.createElement('div');
            headerRow.className = "flex justify-between items-center mb-2 pb-2 border-b border-custom border-opacity-20";
            const title = document.createElement('span');
            title.className = "text-[10px] font-bold uppercase text-muted-custom tracking-wider";
            title.textContent = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS ? "SEQUENCE" : `MACHINE ${idx + 1}`;
            const controls = document.createElement('div');
            controls.className = "flex space-x-3 opacity-60 hover:opacity-100 transition-opacity";
            const btnBack = document.createElement('button');
            btnBack.innerHTML = "⌫";
            btnBack.className = "hover:text-red-400 text-sm font-bold";
            btnBack.onclick = e => {
                e.stopPropagation();
                if (state.sequences[idx] && state.sequences[idx].length > 0) {
                    state.sequences[idx].pop();
                    if (state.nextSequenceIndex > 0) state.nextSequenceIndex--;
                    vibrate();
                    renderUI();
                    saveState();
                }
            };
            if (settings.currentMode !== CONFIG.MODES.UNIQUE_ROUNDS) {
                const btnTrash = document.createElement('button');
                btnTrash.innerHTML = "🗑️";
                btnTrash.className = "hover:text-red-600 text-sm";
                btnTrash.title = "Remove Machine";
                btnTrash.onclick = e => {
                    e.stopPropagation();
                    if (confirm(`Remove Machine ${idx + 1} entirely?`)) {
                        const countToRemove = state.sequences[idx].length;
                        state.sequences.splice(idx, 1);
                        settings.machineCount--;
                        const sel = document.getElementById('machines-select');
                        if (sel) sel.value = settings.machineCount;
                        state.nextSequenceIndex = Math.max(0, state.nextSequenceIndex - countToRemove);
                        vibrate();
                        showToast(`Removed Machine ${idx + 1}`);
                        renderUI();
                        saveState();
                    }
                };
                controls.appendChild(btnTrash);
            }
            controls.insertBefore(btnBack, controls.firstChild);
            headerRow.appendChild(title);
            headerRow.appendChild(controls);
            card.appendChild(headerRow);
        }
        const numGrid = document.createElement('div');
        if (settings.machineCount > 1) {
            numGrid.className = "grid grid-cols-4 gap-2 justify-items-center";
        } else {
            numGrid.className = "flex flex-wrap gap-2 justify-center";
        }
        (seq || []).forEach(num => {
            const span = document.createElement('span');
            span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold";
            const scale = appSettings.uiScaleMultiplier || 1.0;
            const boxSize = 40 * scale;
            span.style.width = boxSize + 'px';
            span.style.height = boxSize + 'px';
            const fontMult = appSettings.uiFontSizeMultiplier || 1.0;
            const fontSizePx = boxSize * 0.5 * fontMult;
            span.style.fontSize = fontSizePx + 'px';
            span.textContent = num;
            numGrid.appendChild(span);
        });
        card.appendChild(numGrid);
        container.appendChild(card);
    });
    const hMic = document.getElementById('headervoicebtn');
    const hCam = document.getElementById('headerarcambtn');
    const hGest = document.getElementById('headertouchbtn');
    if (hMic) {
        const isVoiceActive = voiceModule && voiceModule.isListening;
        hMic.classList.toggle('header-btn-active', isVoiceActive);
    }
    if (hCam) hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active'));
    if (hGest) hGest.classList.toggle('header-btn-active', isGesturePadVisible);
    document.querySelectorAll('.reset-button').forEach(b => {
        b.style.display = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS ? 'block' : 'none';
    });
}

function disableInput(disabled) {
    const footer = document.getElementById('input-footer');
    if (!footer) return;
    if (disabled) {
        footer.classList.add('opacity-50', 'pointer-events-none');
    } else {
        footer.classList.remove('opacity-50', 'pointer-events-none');
    }
}

function playDemo() {
    if (isDemoPlaying) return;
    isDemoPlaying = true;
    isPlaybackPaused = false;
    playbackResumeCallback = null;
    const settings = getProfileSettings();
    const state = getState();
    const speed = appSettings.playbackSpeed || 1.0;
    const playBtn = document.querySelector('button[data-action="play-demo"]');
    let seqsToPlay = [];
    if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
        seqsToPlay = [state.sequences[0]];
    } else {
        seqsToPlay = state.sequences.slice(0, settings.machineCount);
    }
    const chunkSize = settings.simonChunkSize || 3;
    let chunks = [];
    let maxLen = 0;
    seqsToPlay.forEach(s => {
        if (s.length > maxLen) maxLen = s.length;
    });
    for (let i = 0; i < maxLen; i += chunkSize) {
        for (let m = 0; m < seqsToPlay.length; m++) {
            const seq = seqsToPlay[m];
            if (i < seq.length) {
                const slice = seq.slice(i, i + chunkSize);
                chunks.push({
                    machine: m,
                    nums: slice,
                    isNewRound: m === 0 && i === 0 && chunks.length === 0
                });
            }
        }
    }
    let cIdx = 0;
    let totalCount = 0;
    const schedule = (fn, delay) => {
        setTimeout(() => {
            if (!isDemoPlaying) return;
            if (isPlaybackPaused) {
                playbackResumeCallback = fn;
            } else {
                fn();
            }
        }, delay);
    };

    function nextChunk() {
        if (!isDemoPlaying) {
            if (playBtn) playBtn.textContent = "▶";
            return;
        }
        if (cIdx >= chunks.length) {
            isDemoPlaying = false;
            if (playBtn) playBtn.textContent = "▶";
            if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.isUniqueRoundsAutoClearEnabled) {
                setTimeout(() => {
                    if (!isDemoPlaying) {
                        state.currentRound++;
                        state.sequences[0] = [];
                        state.nextSequenceIndex = 0;
                        renderUI();
                        showToast(`Round ${state.currentRound}`);
                        saveState();
                        disableInput(false);
                    }
                }, 500);
            }
            return;
        }
        const chunk = chunks[cIdx];
        const machineDelay = settings.simonInterSequenceDelay || 0;
        let nIdx = 0;

        function playNum() {
            if (!isDemoPlaying) {
                if (playBtn) playBtn.textContent = "▶";
                return;
            }
            if (nIdx >= chunk.nums.length) {
                cIdx++;
                schedule(nextChunk, machineDelay);
                return;
            }
            const val = chunk.nums[nIdx];
            totalCount++;
            if (playBtn) playBtn.textContent = totalCount;
            const kVal = val;
            const padId = `pad-${settings.currentInput}`;
            const btn = document.querySelector(`#${padId} button[data-value="${kVal}"]`);
            if (btn) {
                btn.classList.add('flash-active');
                setTimeout(() => btn.classList.remove('flash-active'), 250 / speed);
            }
            speak(val);
            if (appSettings.isHapticMorseEnabled) vibrateMorse(val);
            nIdx++;
            schedule(playNum, CONFIG.DEMO_DELAY_BASE_MS / speed);
        }
        playNum();
    }
    nextChunk();
}

function setupARLogic() {
    const headerCam = document.getElementById('headerarcambtn');
    const inputFooter = document.getElementById('input-footer');
    const arRecordBtn = document.getElementById('ar-record-btn');
    const arBackgroundVideo = document.getElementById('ar-background-video');
    const arPlaybackContainer = document.getElementById('ar-playback-container');
    const arPlaybackVideo = document.getElementById('ar-playback-video');
    let mediaRecorder, recordedChunks = [];
    async function syncARState(isTargetActive) {
        document.body.classList.toggle('ar-active', isTargetActive);
        if (headerCam) headerCam.classList.toggle('header-btn-active', isTargetActive);
        if (inputFooter) {
            if (isTargetActive) inputFooter.classList.add('hidden');
            else inputFooter.classList.remove('hidden');
        }
        if (arRecordBtn) {
            if (isTargetActive) {
                arRecordBtn.classList.remove('hidden');
                arRecordBtn.classList.add('flex');
            } else {
                arRecordBtn.classList.add('hidden');
                arRecordBtn.classList.remove('flex');
            }
        }
        if (isTargetActive) {
            document.body.style.backgroundColor = "transparent";
            document.getElementById('ar-container')?.classList.remove('hidden');
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error("AR Camera: navigator.mediaDevices.getUserMedia is unavailable - this page needs to be served over HTTPS (or http://localhost) for camera access to work.");
                showToast("Camera needs HTTPS 🔒 (or localhost)");
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment"
                    }
                });
                if (arBackgroundVideo) {
                    arBackgroundVideo.srcObject = stream;
                    arBackgroundVideo.play().catch(e => console.warn(e));
                }
            } catch (err) {
                console.error("AR Camera runtime initialization error:", err.name, err.message);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    showToast("Camera Access Denied ❌ (check browser site settings)");
                } else if (err.name === 'NotFoundError') {
                    showToast("No Camera Found 📷❌");
                } else if (err.name === 'NotReadableError') {
                    showToast("Camera In Use By Another App ❌");
                } else {
                    showToast(`Camera Error: ${err.name || 'Unknown'} ❌`);
                }
            }
        } else {
            document.body.style.backgroundColor = "";
            document.getElementById('ar-container')?.classList.add('hidden');
            if (arBackgroundVideo && arBackgroundVideo.srcObject) {
                arBackgroundVideo.srcObject.getTracks().forEach(track => track.stop());
                arBackgroundVideo.srcObject = null;
            }
        }
    }
    if (headerCam) {
        headerCam.onclick = () => {
            const currentToggleState = !document.body.classList.contains('ar-active');
            syncARState(currentToggleState);
            showToast(currentToggleState ? "AR Mode: Ready to Record 📸" : "AR Mode OFF");
        };
    }
    if (arRecordBtn) {
        arRecordBtn.addEventListener('pointerdown', e => {
            e.preventDefault();
            recordedChunks = [];
            const stream = arBackgroundVideo?.srcObject;
            if (!stream) return showToast("Camera stream not ready 🛑");
            try {
                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm'
                });
            } catch (err) {
                mediaRecorder = new MediaRecorder(stream);
            }
            mediaRecorder.ondataavailable = ev => {
                if (ev.data.size > 0) recordedChunks.push(ev.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, {
                    type: 'video/webm'
                });
                if (arPlaybackVideo && arPlaybackContainer) {
                    arPlaybackVideo.src = URL.createObjectURL(blob);
                    arPlaybackContainer.classList.remove('hidden');
                    arPlaybackContainer.style.display = 'flex';
                    arPlaybackVideo.playbackRate = appSettings.arPlaybackSpeed || 1.0;
                    arPlaybackVideo.play().catch(err => console.warn(err));
                }
            };
            mediaRecorder.start();
            arRecordBtn.classList.add('bg-red-800', 'scale-90');
            showToast("Recording Video... 🔴");
        });
        arRecordBtn.addEventListener('pointerup', e => {
            e.preventDefault();
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            arRecordBtn.classList.remove('bg-red-800', 'scale-90');
        });
    }
        const arPlaybackClose = document.getElementById('ar-close-playback-btn');
    const closeArPlayback = () => {
        if (arPlaybackVideo) {
            arPlaybackVideo.pause();
            arPlaybackVideo.src = "";
        }
        if (arPlaybackContainer) {
            arPlaybackContainer.classList.add('hidden');
            arPlaybackContainer.style.display = 'none';
        }
    };

    if (arPlaybackClose) {
        arPlaybackClose.addEventListener('click', closeArPlayback);
    }

    if (arPlaybackVideo) {
        arPlaybackVideo.addEventListener('ended', () => {
            if (appSettings.isArAutoCloseEnabled) closeArPlayback();
        });

        let wasPlayingBeforeTouch = false;
        arPlaybackVideo.addEventListener('pointerdown', () => {
            wasPlayingBeforeTouch = !arPlaybackVideo.paused;
            if (wasPlayingBeforeTouch) arPlaybackVideo.pause();
        });
        
        const resumeIfNeeded = () => {
            if (wasPlayingBeforeTouch) {
                arPlaybackVideo.play().catch(() => {});
                wasPlayingBeforeTouch = false;
            }
        };
        
        arPlaybackVideo.addEventListener('pointerup', resumeIfNeeded);
        arPlaybackVideo.addEventListener('pointercancel', resumeIfNeeded);
        arPlaybackVideo.addEventListener('pointerleave', resumeIfNeeded);
    }
} 

function mapGestureToValue(kind, currentInput) {
    const saved = appSettings.gestureMappings || ({});
    const matches = (target, incoming) => {
        if (!target) return false;
        if (target === incoming) return true;
        if (target.endsWith('_any')) {
            const base = target.replace('_any', '');
            if (incoming.startsWith(base)) return true;
        }
        return false;
    };
    const checkMatch = key => {
        const m = saved[key] || ({});
        const touchG = m.gesture || DEFAULT_MAPPINGS[key];
        if (matches(touchG, kind)) return true;
        const handG = m.hand || DEFAULT_HAND_MAPPINGS[key];
        if (matches(handG, kind)) return true;
        return false;
    };
    if (currentInput === CONFIG.INPUTS.PIANO) {
        const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', '1', '2', '3', '4', '5'];
        for (let k of keys) {
            if (checkMatch('piano_' + k)) return k;
        }
    } else if (currentInput === CONFIG.INPUTS.KEY12) {
        for (let i = 1; i <= 12; i++) {
            if (checkMatch('k12_' + i)) return i;
        }
    } else if (currentInput === CONFIG.INPUTS.KEY9) {
        for (let i = 1; i <= 9; i++) {
            if (checkMatch('k9_' + i)) return i;
        }
    }
    return null;
}

function updateEngineConstraints() {
    if (!modules.gestureEngine) return;
    const settings = getProfileSettings();
    const saved = appSettings.gestureMappings || ({});
    const getG = key => saved[key] && saved[key].gesture ? saved[key].gesture : DEFAULT_MAPPINGS[key];
    const activeList = [];
    if (settings.currentInput === CONFIG.INPUTS.PIANO) {
        ['C', 'D', 'E', 'F', 'G', 'A', 'B', '1', '2', '3', '4', '5'].forEach(k => activeList.push(getG('piano_' + k)));
    } else if (settings.currentInput === CONFIG.INPUTS.KEY12) {
        for (let i = 1; i <= 12; i++) activeList.push(getG('k12_' + i));
    } else if (settings.currentInput === CONFIG.INPUTS.KEY9) {
        for (let i = 1; i <= 9; i++) activeList.push(getG('k9_' + i));
    }
    if (appSettings.isDeleteGestureEnabled) activeList.push('delete');
    if (appSettings.isClearGestureEnabled) activeList.push('clear');
    modules.gestureEngine.updateAllowed(activeList);
}

function initGestureEngine() {
    const engine = new GestureEngine(document.body, {
        tapDelay: appSettings.gestureTapDelay || 300,
        swipeThreshold: appSettings.gestureSwipeDist || 30,
        longPressTime: appSettings.gestureLongPressTime || 300,
        tapPrecision: appSettings.gestureTapPrecision || 30,
        spatialThreshold: appSettings.gestureSpatialThreshold || 10,
        longSwipeThreshold: appSettings.gestureLongSwipeThreshold || 150,
        multiSwipeThreshold: appSettings.gestureMultiSwipeThreshold || 10,
        debug: false
    }, {
        onGesture: data => {
            const touchReadout = document.getElementById('test-touch-readout');
            if (touchReadout) touchReadout.textContent = data.name || JSON.stringify(data);
            const isPadOpen = typeof isGesturePadVisible !== 'undefined' && isGesturePadVisible;
            const isClassPresent = document.body.classList.contains('input-gestures-mode');
            const isBossActive = appSettings.isBlackoutFeatureEnabled && appSettings.isGestureInputEnabled && blackoutState.isActive;
            if (isPadOpen || isClassPresent || isBossActive) {
                const settings = getProfileSettings();
                const mapResult = mapGestureToValue(data.name, settings.currentInput);
                const indicator = document.getElementById('gesture-indicator');
                if (mapResult !== null) {
                    addValue(mapResult);
                    if (indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ').toUpperCase();
                        indicator.style.opacity = '1';
                        indicator.style.color = 'var(--seq-bubble)';
                        setTimeout(() => {
                            indicator.style.opacity = '0.3';
                            indicator.style.color = '';
                        }, 250);
                    }
                } else {
                    if (indicator) {
                        indicator.textContent = data.name.replace(/_/g, ' ');
                        indicator.style.opacity = '0.5';
                        setTimeout(() => indicator.style.opacity = '0.3', 500);
                    }
                }
            }
        },
        onContinuous: data => {
            console.log("Continuous Gesture:", data.type, "Fingers:", data.fingers);
            if (data.type === 'squiggle' && data.fingers === 1) {
                if (appSettings.isDeleteGestureEnabled) {
                    handleBackspace();
                    showToast("Deleted ⌫");
                    vibrate();
                }
                return;
            }
            if (data.type === 'squiggle' && data.fingers === 2) {
                if (appSettings.isClearGestureEnabled) {
                    const s = getState();
                    s.sequences = Array.from({
                        length: CONFIG.MAX_MACHINES
                    }, () => []);
                    s.nextSequenceIndex = 0;
                    renderUI();
                    saveState();
                    showToast("CLEARED 💥");
                    vibrate();
                }
                return;
            }
            if (data.type === 'twist' && data.fingers === 3 && appSettings.isVolumeGesturesEnabled) {
                let newVol = appSettings.voiceVolume || 1.0;
                newVol += data.value * 0.05;
                appSettings.voiceVolume = Math.min(1.0, Math.max(0.0, newVol));
                saveState();
                showToast(`Volume: ${(appSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
            }
            if (data.type === 'twist' && data.fingers === 2 && appSettings.isSpeedGesturesEnabled) {
                let newSpeed = appSettings.playbackSpeed || 1.0;
                newSpeed += data.value * 0.05;
                appSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed));
                saveState();
                showToast(`Speed: ${(appSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
            }
            if (data.type === 'pinch') {
                const mode = appSettings.gestureResizeMode || 'global';
                if (mode === 'none') return;
                if (!gestureState.isPinching) {
                    gestureState.isPinching = true;
                    gestureState.startGlobal = appSettings.globalUiScale;
                    gestureState.startSeq = appSettings.uiScaleMultiplier;
                }
                clearTimeout(gestureState.resetTimer);
                gestureState.resetTimer = setTimeout(() => {
                    gestureState.isPinching = false;
                }, 250);
                if (mode === 'sequence') {
                    let raw = gestureState.startSeq * data.scale;
                    let newScale = Math.round(raw * 10) / 10;
                    if (newScale !== appSettings.uiScaleMultiplier) {
                        appSettings.uiScaleMultiplier = Math.min(3.0, Math.max(0.5, newScale));
                        renderUI();
                        showToast(`Cards: ${(appSettings.uiScaleMultiplier * 100).toFixed(0)}% 🔍`);
                    }
                } else {
                    let raw = gestureState.startGlobal * data.scale;
                    let newScale = Math.round(raw / 10) * 10;
                    if (newScale !== appSettings.globalUiScale) {
                        appSettings.globalUiScale = Math.min(200, Math.max(50, newScale));
                        updateAllChrome();
                        showToast(`UI: ${appSettings.globalUiScale}% 🔍`);
                    }
                }
            }
        }
    });
    modules.gestureEngine = engine;
    updateEngineConstraints();
    const originalRender = renderUI;
    renderUI = function() {
        originalRender();
        updateEngineConstraints();
    };
}

function initGlobalListeners() {
    try {
        document.querySelectorAll('.btn-pad-number').forEach(b => {
            const press = e => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (ignoreNextClick) return;
                addValue(b.dataset.value);
                b.classList.add('flash-active');
                setTimeout(() => b.classList.remove('flash-active'), 150);
            };
            b.addEventListener('mousedown', press);
            b.addEventListener('touchstart', press, {
                passive: false
            });
            b.addEventListener('touchend', () => clearTimeout(timers.stealth));
        });
        document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
            let wasPlaying = false;
            let lpTriggered = false;
            const handleDown = e => {
                if (e && e.cancelable) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                wasPlaying = isDemoPlaying;
                lpTriggered = false;
                if (wasPlaying) {
                    isDemoPlaying = false;
                    b.textContent = "▶";
                    showToast("Playback Stopped 🛑");
                    return;
                }
                if (appSettings.isLongPressAutoplayEnabled) {
                    timers.longPress = setTimeout(() => {
                        lpTriggered = true;
                        appSettings.isAutoplayEnabled = !appSettings.isAutoplayEnabled;
                        modules.settings.updateUIFromSettings();
                        showToast(`Autoplay: ${appSettings.isAutoplayEnabled ? "ON" : "OFF"}`);
                        ignoreNextClick = true;
                        setTimeout(() => ignoreNextClick = false, 500);
                    }, 800);
                }
            };
            const handleUp = e => {
                if (e && e.cancelable) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                clearTimeout(timers.longPress);
                if (!wasPlaying && !lpTriggered) {
                    playDemo();
                }
            };
            b.addEventListener('mousedown', handleDown);
            b.addEventListener('touchstart', handleDown, {
                passive: false
            });
            b.addEventListener('mouseup', handleUp);
            b.addEventListener('touchend', handleUp);
            b.addEventListener('mouseleave', () => clearTimeout(timers.longPress));
        });
        document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => {
            b.addEventListener('click', () => {
                if (confirm("Reset Round Counter to 1?")) {
                    const s = getState();
                    s.currentRound = 1;
                    s.sequences[0] = [];
                    s.nextSequenceIndex = 0;
                    renderUI();
                    saveState();
                    showToast("Reset to Round 1");
                }
            });
        });
        document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
            b.addEventListener('click', () => {
                if (isDemoPlaying) {
                    isDemoPlaying = false;
                    const pb = document.querySelector('button[data-action="play-demo"]');
                    if (pb) pb.textContent = "▶";
                    showToast("Playback Stopped 🛑");
                    return;
                }
                modules.settings.openSettings();
            });
        });
        document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
            const startDelete = e => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                handleBackspace(null);
                if (!appSettings.isSpeedDeletingEnabled) return;
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
            b.addEventListener('mousedown', startDelete);
            b.addEventListener('touchstart', startDelete, {
                passive: false
            });
            b.addEventListener('mouseup', stopDelete);
            b.addEventListener('mouseleave', stopDelete);
            b.addEventListener('touchend', stopDelete);
            b.addEventListener('touchcancel', stopDelete);
        });
        if (appSettings.showWelcomeScreen && modules.settings) setTimeout(() => modules.settings.openSetup(), 500);
        const handlePause = e => {
            if (isDemoPlaying) {
                isPlaybackPaused = true;
                showToast("Paused ⏸️");
            }
        };
        const handleResume = e => {
            if (isPlaybackPaused) {
                isPlaybackPaused = false;
                showToast("Resumed ▶️");
                if (playbackResumeCallback) {
                    const fn = playbackResumeCallback;
                    playbackResumeCallback = null;
                    fn();
                }
            }
        };
        document.body.addEventListener('mousedown', handlePause);
        document.body.addEventListener('touchstart', handlePause, {
            passive: true
        });
        document.body.addEventListener('mouseup', handleResume);
        document.body.addEventListener('touchend', handleResume);
        document.getElementById('close-settings').addEventListener('click', () => {
            if (appSettings.isPracticeModeEnabled) {
                setTimeout(startPracticeRound, 500);
            }
        });
        let lastX = 0,
            lastY = 0,
            lastZ = 0;
        window.addEventListener('devicemotion', e => {
            if (!appSettings.isBlackoutFeatureEnabled) return;
            const acc = e.accelerationIncludingGravity;
            if (!acc) return;
            const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
            if (delta > 25) {
                const now = Date.now();
                if (now - blackoutState.lastShake > 1000) {
                    blackoutState.isActive = !blackoutState.isActive;
                    document.body.classList.toggle('blackout-active', blackoutState.isActive);
                    showToast(blackoutState.isActive ? "Boss Mode 🌑" : "Welcome Back");
                    vibrate();
                    renderUI();
                    blackoutState.lastShake = now;
                }
            }
            lastX = acc.x;
            lastY = acc.y;
            lastZ = acc.z;
        });
        const bl = document.getElementById('blackout-layer');
        if (bl) {
            bl.addEventListener('touchstart', e => {
                if (appSettings.isGestureInputEnabled) return;
                if (e.touches.length === 1) {
                    e.preventDefault();
                    const t = e.touches[0];
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    let col = Math.floor(t.clientX / (w / 3));
                    if (col > 2) col = 2;
                    const settings = getProfileSettings();
                    let val = null;
                    if (settings.currentInput === 'key9') {
                        let row = Math.floor(t.clientY / (h / 3));
                        if (row > 2) row = 2;
                        val = row * 3 + col + 1;
                    } else {
                        let row = Math.floor(t.clientY / (h / 4));
                        if (row > 3) row = 3;
                        const index = row * 3 + col;
                        if (settings.currentInput === 'piano') {
                            const map = ['1', '2', '3', '4', '5', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
                            val = map[index];
                        } else {
                            val = index + 1;
                        }
                    }
                    if (val !== null) {
                        addValue(val.toString());
                        if (navigator.vibrate) navigator.vibrate(20);
                    }
                }
            }, {
                passive: false
            });
        }
        const headerTimer = document.getElementById('headertimerbtn');
        const headerCounter = document.getElementById('headercounterbtn');
        const headerMic = document.getElementById('headervoicebtn');
        const headerCam = document.getElementById('headerarcambtn');
        const headerGesture = document.getElementById('headertouchbtn');
        const headerHand = document.getElementById('headerhandbtn');
        if (headerHand) {
            headerHand.onclick = () => {
                if (!modules.vision) return;
                const isActive = !modules.vision.isActive;
                if (isActive) {
                    modules.vision.start();
                    headerHand.classList.add('header-btn-active');
                } else {
                    modules.vision.stop();
                    headerHand.classList.remove('header-btn-active');
                }
            };
        }
        const headerStealth = document.getElementById('headerbiggerbtn');
        if (headerStealth) {
            headerStealth.onclick = () => {
                document.body.classList.toggle('hide-controls');
                const isActive = document.body.classList.contains('hide-controls');
                headerStealth.classList.toggle('header-btn-active', isActive);
                showToast(isActive ? "Bigger Buttons Active" : "Controls Visible");
                setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
            };
        }
        const headerSwap = document.getElementById('headerswapbtn');
        if (headerSwap) {
            headerSwap.onclick = () => {
                const isActive = !document.body.classList.contains('layout-swapped');
                document.body.classList.toggle('layout-swapped', isActive);
                headerSwap.classList.toggle('header-btn-active', isActive);
                applyPositionSwapOffsets(isActive);
                showToast(isActive ? "Inputs Moved to Top 🔄" : "Inputs Back to Bottom 🔄");
            };
        }
        if (headerTimer) {
            headerTimer.textContent = "00:00";
            headerTimer.style.fontSize = "0.75rem";
            const formatTime = ms => {
                const totalSec = Math.floor(ms / 1000);
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };
            const updateTimer = () => {
                const now = Date.now();
                const diff = now - simpleTimer.startTime + simpleTimer.elapsed;
                headerTimer.textContent = formatTime(diff);
            };
            globalTimerActions.start = () => {
                if (!simpleTimer.isRunning) {
                    simpleTimer.startTime = Date.now();
                    simpleTimer.interval = setInterval(updateTimer, 100);
                    simpleTimer.isRunning = true;
                }
            };
            globalTimerActions.stop = () => {
                if (simpleTimer.isRunning) {
                    clearInterval(simpleTimer.interval);
                    simpleTimer.elapsed += Date.now() - simpleTimer.startTime;
                    simpleTimer.isRunning = false;
                }
            };
            globalTimerActions.reset = () => {
                clearInterval(simpleTimer.interval);
                simpleTimer.isRunning = false;
                simpleTimer.elapsed = 0;
                headerTimer.textContent = "00:00";
            };
            const toggleTimer = () => {
                if (simpleTimer.isRunning) globalTimerActions.stop();
                else globalTimerActions.start();
                vibrate();
            };
            const resetTimer = () => {
                globalTimerActions.reset();
                showToast("Timer Reset");
                vibrate();
            };
            let tTimer;
            let tIsLong = false;
            const startT = e => {
                if (e.type === 'mousedown' && e.button !== 0) return;
                tIsLong = false;
                tTimer = setTimeout(() => {
                    tIsLong = true;
                    resetTimer();
                }, 600);
            };
            const endT = e => {
                if (e) e.preventDefault();
                clearTimeout(tTimer);
                if (!tIsLong) toggleTimer();
            };
            headerTimer.addEventListener('mousedown', startT);
            headerTimer.addEventListener('touchstart', startT, {
                passive: true
            });
            headerTimer.addEventListener('mouseup', endT);
            headerTimer.addEventListener('touchend', endT);
            headerTimer.addEventListener('mouseleave', () => clearTimeout(tTimer));
        }
        if (headerCounter) {
            headerCounter.textContent = simpleCounter.toString();
            headerCounter.style.fontSize = "1.2rem";
            const updateCounter = () => {
                headerCounter.textContent = simpleCounter;
            };
            globalCounterActions.increment = () => {
                simpleCounter++;
                updateCounter();
            };
            globalCounterActions.reset = () => {
                simpleCounter = 0;
                updateCounter();
            };
            const increment = () => {
                globalCounterActions.increment();
                vibrate();
            };
            const resetCounter = () => {
                globalCounterActions.reset();
                showToast("Counter Reset");
                vibrate();
            };
            let cTimer;
            let cIsLong = false;
            const startC = e => {
                if (e.type === 'mousedown' && e.button !== 0) return;
                cIsLong = false;
                cTimer = setTimeout(() => {
                    cIsLong = true;
                    resetCounter();
                }, 600);
            };
            const endC = e => {
                if (e) e.preventDefault();
                clearTimeout(cTimer);
                if (!cIsLong) increment();
            };
            headerCounter.addEventListener('mousedown', startC);
            headerCounter.addEventListener('touchstart', startC, {
                passive: true
            });
            headerCounter.addEventListener('mouseup', endC);
            headerCounter.addEventListener('touchend', endC);
            headerCounter.addEventListener('mouseleave', () => clearTimeout(cTimer));
        }
        if (headerMic) {
            headerMic.onclick = () => {
                if (!voiceModule) return;
                const isActive = !voiceModule.isListening;
                voiceModule.toggle(isActive);
                headerMic.classList.toggle('header-btn-active', isActive);
            };
        }
        if (headerGesture) {
            headerGesture.onclick = () => {
                isGesturePadVisible = !isGesturePadVisible;
                headerGesture.classList.toggle('header-btn-active', isGesturePadVisible);
                const gpWrap = document.getElementById('gesture-pad-wrapper');
                if (gpWrap) {
                    if (isGesturePadVisible) {
                        gpWrap.classList.remove('hidden');
                        showToast("Pad Visible 🗒️");
                    } else {
                        gpWrap.classList.add('hidden');
                        showToast("Pad Hidden");
                    }
                }
                renderUI();
            };
        }
    } catch (e) {
        console.error("Listener Error:", e);
    }
}
window.upsidedownToggle = async function(enable) {
    try {
        if (('wakeLock' in navigator)) {
            if (enable) {
                screenWakeLock = await navigator.wakeLock.request('screen');
                document.addEventListener('visibilitychange', reacquireWakeLock);
                console.log('Wake Lock: ACTIVE 💡');
            } else {
                if (screenWakeLock) {
                    await screenWakeLock.release();
                    screenWakeLock = null;
                }
                document.removeEventListener('visibilitychange', reacquireWakeLock);
                console.log('Wake Lock: RELEASED 🔋');
            }
        }
    } catch (err) {
        console.warn('Wake Lock failed:', err);
    }
};
window.modules = modules;
window.settingsToHex = settingsToHex;
window.importSettingsFromHex = importSettingsFromHex;
window.lockBodyScroll = lockBodyScroll;
window.unlockBodyScroll = unlockBodyScroll;
document.addEventListener('DOMContentLoaded', startApp);
