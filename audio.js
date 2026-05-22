// audio.js

/**
 * PREMADE_VOICE_PRESETS
 * Configuration for the Text-to-Speech (TTS) system. 
 * Defines pitch, rate, and volume for various audio personas.
 */
export const PREMADE_VOICE_PRESETS = {
    'standard': {
        name: "Standard",
        pitch: 1.0,
        rate: 1.0,
        volume: 1.0
    },
    'speed': {
        name: "Speed Reader",
        pitch: 1.0,
        rate: 1.8,
        volume: 1.0
    },
    'slow': {
        name: "Slow Motion",
        pitch: 0.9,
        rate: 0.6,
        volume: 1.0
    },
    'deep': {
        name: "Deep Voice",
        pitch: 0.6,
        rate: 0.9,
        volume: 1.0
    },
    'high': {
        name: "Chipmunk",
        pitch: 1.8,
        rate: 1.1,
        volume: 1.0
    },
    'robot': {
        name: "Robot",
        pitch: 0.5,
        rate: 0.8,
        volume: 1.0
    },
    'announcer': {
        name: "Announcer",
        pitch: 0.8,
        rate: 1.1,
        volume: 1.0
    },
    'whisper': {
        name: "Quiet",
        pitch: 1.2,
        rate: 0.8,
        volume: 0.4
    }
};