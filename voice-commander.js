// voice-commander.js
import { appSettings, getProfileSettings } from './state.js';

export class VoiceCommander {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.recognition = null;
        this.isListening = false;
        this.restartTimer = null;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI(true);
            console.log("🎤 Voice Commander Active (Prefix Mode)");
        };

        this.recognition.onresult = (event) => {
            const lastIdx = event.results.length - 1;
            const transcript = event.results[lastIdx][0].transcript.trim().toLowerCase();
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                this.stop();
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                clearTimeout(this.restartTimer);
                this.restartTimer = setTimeout(() => {
                    try { this.recognition.start(); } 
                    catch (e) { this.isListening = false; this.updateUI(false); }
                }, 500);
            } else {
                this.updateUI(false);
            }
        };
    }

    start() {
        if (!this.recognition || this.isListening) return;
        try {
            const lang = appSettings.generalLanguage || 'en';
            this.recognition.lang = (lang === 'es') ? 'es-MX' : 'en-US';
            this.recognition.start();
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
        }
    }

    stop() {
        this.isListening = false;
        clearTimeout(this.restartTimer);
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }
        this.updateUI(false);
    }

    toggle() {
        if (this.isListening) this.stop();
        else this.start();
    }

    updateUI(isActive) {
        if (this.callbacks && this.callbacks.onStateChange) {
            this.callbacks.onStateChange(isActive);
        }
    }

    processCommand(transcript) {
        const settings = getProfileSettings();
        const activePresetId = appSettings.activeVoicePresetId || 'standard';
        let triggers = [];

        if (appSettings.voicePresets && appSettings.voicePresets[activePresetId]) {
             triggers = appSettings.voicePresets[activePresetId].triggers.map(t => t.toLowerCase());
        }

        if (!triggers || triggers.length === 0) {
            const lang = appSettings.generalLanguage || 'en';
            triggers = (lang === 'es') ? ['número'] : ['number', 'add'];
        }

        const actionMap = {
            'play': () => { if(this.callbacks.onPlay) this.callbacks.onPlay(); },
            'start': () => { if(this.callbacks.onPlay) this.callbacks.onPlay(); },
            'stop': () => { if(this.callbacks.onStop) this.callbacks.onStop(); },
            'delete': () => { if(this.callbacks.onBackspace) this.callbacks.onBackspace(); },
            'back': () => { if(this.callbacks.onBackspace) this.callbacks.onBackspace(); },
            'reproducir': () => { if(this.callbacks.onPlay) this.callbacks.onPlay(); },
            'parar': () => { if(this.callbacks.onStop) this.callbacks.onStop(); },
            'borrar': () => { if(this.callbacks.onBackspace) this.callbacks.onBackspace(); },
        };

        const words = transcript.split(/\s+/);
        
        for (let word of words) {
            if (actionMap[word]) { actionMap[word](); return; }
        }

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (triggers.includes(word)) {
                if (i + 1 < words.length) {
                    const nextWord = words[i + 1];
                    let parsedNum = parseInt(nextWord, 10);
                    
                    if (isNaN(parsedNum)) {
                         const numWords = { 
                             'one': 1, 'two': 2, 'to': 2, 'too': 2, 'three': 3, 'tree': 3,
                             'four': 4, 'for': 4, 'five': 5, 'six': 6, 'seven': 7,
                             'eight': 8, 'ate': 8, 'nine': 9, 'ten': 10, 'eleven': 11, 'twelve': 12,
                             'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
                             'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10, 'once': 11, 'doce': 12
                         };
                         parsedNum = numWords[nextWord];
                    }

                    if (parsedNum !== undefined && !isNaN(parsedNum)) {
                        let maxNum = (settings.currentInput === 'key12') ? 12 : 9;
                        if (parsedNum >= 1 && parsedNum <= maxNum) {
                            if (this.callbacks.onAddValue) this.callbacks.onAddValue(parsedNum);
                            return; 
                        }
                    }
                }
            }
        }
    }
}