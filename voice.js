// voice.js
// Handles speech recognition for game inputs and commands
export class VoiceCommander {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.recognition = null;
        this.isListening = false;
        this.restartTimer = null;
        
        // Trigger words that must precede a number
        this.prefixes = ['add', 'plus', 'press', 'enter', 'push', 'input'];

        this.vocab = {
            // Digits (Handle both words and numbers)
            '1': '1', 'one': '1', 'won': '1',
            '2': '2', 'two': '2', 'to': '2', 'too': '2',
            '3': '3', 'three': '3', 'tree': '3',
            '4': '4', 'four': '4', 'for': '4', 'fore': '4',
            '5': '5', 'five': '5',
            '6': '6', 'six': '6',
            '7': '7', 'seven': '7',
            '8': '8', 'eight': '8', 'ate': '8',
            '9': '9', 'nine': '9',
            '10': '10', 'ten': '10', 'tin': '10',
            '11': '11', 'eleven': '11',
            '12': '12', 'twelve': '12',

            // Letters A-G (Piano Mode)
            'a': 'A', 'hey': 'A',
            'b': 'B', 'bee': 'B', 'be': 'B',
            'c': 'C', 'see': 'C', 'sea': 'C',
            'd': 'D', 'dee': 'D',
            'e': 'E',
            'f': 'F',
            'g': 'G', 'jee': 'G',

            // Global Commands (No prefix needed)
            'play': 'CMD_PLAY', 'start': 'CMD_PLAY', 'go': 'CMD_PLAY', 'read': 'CMD_PLAY',
            'stop': 'CMD_STOP', 'pause': 'CMD_STOP', 'halt': 'CMD_STOP',
            'delete': 'CMD_DELETE', 'back': 'CMD_DELETE', 'undo': 'CMD_DELETE',
            'clear': 'CMD_CLEAR', 'reset': 'CMD_CLEAR',
            'settings': 'CMD_SETTINGS', 'menu': 'CMD_SETTINGS', 'options': 'CMD_SETTINGS'
        };

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false; 
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => this.handleResult(event);
            this.recognition.onend = () => this.handleEnd();
            this.recognition.onerror = (e) => console.log('Voice Error:', e.error);
        } else {
            console.warn("Voice Control not supported.");
        }
    }
toggle(active) {
        if (!this.recognition) return;
        if (active) {
            this.isListening = true;
            try { this.recognition.start(); } catch(e) {}
            this.callbacks.onStatus("Voice Active (Say 'Add...') 🎙️");
        } else {
            this.isListening = false;
            try { this.recognition.stop(); } catch(e) {}
            clearTimeout(this.restartTimer);
            this.callbacks.onStatus("Voice Off 🔇");
        }
    }

    handleResult(event) {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        console.log("Heard:", transcript);
        
        let processed = false; // Track if we did something

        const words = transcript.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            if (this.vocab[word] && this.vocab[word].startsWith('CMD_')) {
                this.callbacks.onCommand(this.vocab[word]);
                processed = true;
                continue;
            }

            if (this.prefixes.includes(word)) {
                const nextWord = words[i + 1];
                if (nextWord) {
                    const mapped = this.vocab[nextWord];
                    if (mapped && !mapped.startsWith('CMD_')) {
                        this.callbacks.onInput(mapped);
                        processed = true;
                        i++; 
                    }
                }
            }
        }

        // Force restart if command processed to prevent mic lock-up
        if (processed && this.isListening) {
            try {
                this.recognition.stop(); 
            } catch(e) {}
        }
    }

    handleEnd() {
        if (this.isListening) {
            this.restartTimer = setTimeout(() => {
                try { this.recognition.start(); } catch(e) {}
            }, 100);
        }
    }
}
