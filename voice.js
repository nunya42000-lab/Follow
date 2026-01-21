// voice.js
// Handles speech recognition for game inputs and commands
export class VoiceCommander {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.recognition = null;
        this.isListening = false;
        this.restartTimer = null;
        this.prefixes = ['add', 'plus', 'press', 'enter', 'push', 'input'];

        this.vocab = {
            '1': '1', 'one': '1', 'won': '1',
            '2': '2', 'two': '2', 'to': '2',
            '3': '3', 'three': '3', 'tree': '3',
            '4': '4', 'four': '4', 'for': '4',
            '5': '5', 'five': '5',
            '6': '6', 'six': '6',
            '7': '7', 'seven': '7',
            '8': '8', 'eight': '8',
            '9': '9', 'nine': '9',
            '10': '10', 'ten': '10',
            '11': '11', 'eleven': '11',
            '12': '12', 'twelve': '12',
            'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G',
            'play': 'CMD_PLAY', 'start': 'CMD_PLAY', 
            'stop': 'CMD_STOP', 'pause': 'CMD_STOP',
            'delete': 'CMD_DELETE', 'back': 'CMD_DELETE',
            'clear': 'CMD_CLEAR', 'reset': 'CMD_CLEAR',
            'settings': 'CMD_SETTINGS'
        };

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            this.recognition.onresult = (e) => this.handleResult(e);
            this.recognition.onend = () => this.handleEnd();
        }
    }

    toggle(active) {
        if (!this.recognition) return;
        if (active) {
            this.isListening = true;
            try { this.recognition.start(); } catch(e) {}
            this.callbacks.onStatus("Voice Active 🎙️");
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
        const words = transcript.split(' ');
        let processed = false;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            // Commands
            if (this.vocab[word] && this.vocab[word].startsWith('CMD_')) {
                this.callbacks.onCommand(this.vocab[word]);
                processed = true;
                continue;
            }
            // Prefix + Number (e.g., "Add One")
            if (this.prefixes.includes(word) && words[i + 1]) {
                const val = this.vocab[words[i + 1]];
                if (val && !val.startsWith('CMD_')) {
                    this.callbacks.onInput(val);
                    processed = true;
                    i++;
                }
            }
        }
        if (processed && this.isListening) try { this.recognition.stop(); } catch(e) {}
    }

    handleEnd() {
        if (this.isListening) {
            this.restartTimer = setTimeout(() => { try { this.recognition.start(); } catch(e) {} }, 100);
        }
    }
}
