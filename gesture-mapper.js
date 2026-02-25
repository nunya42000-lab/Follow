// gesture-mapper.js
import { getProfileSettings } from './state.js';
import { addValue } from './game-logic.js';

export function mapGestureToValue(gestureStr, currentInputType) {
    // Example mapping - you can link this to DEFAULT_MAPPINGS from constants if needed
    const map = {
        'swipe_up': '1', 'swipe_right': '2', 'swipe_down': '3', 'swipe_left': '4',
        'tap': '5', 'double_tap': '6', 'long_press': '7', 'pinch': '8', 'rotate': '9'
    };
    return map[gestureStr] || null;
}

export function handleGesture(kind) {
    const indicator = document.getElementById('gesture-indicator');
    if(indicator) {
        indicator.textContent = `Gesture: ${kind.replace(/_/g, ' ')}`;
        indicator.style.opacity = '1';
        setTimeout(()=> { 
            indicator.style.opacity = '0.3'; 
            indicator.textContent = 'Area Active'; 
        }, 1000);
    }
    const settings = getProfileSettings();
    const mapResult = mapGestureToValue(kind, settings.currentInput);
    if(mapResult !== null) addValue(mapResult);
}
