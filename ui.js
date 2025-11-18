import { DOM } from './dom.js';
import { 
    appSettings, appState, getCurrentProfileSettings, getCurrentState, saveState 
} from './state.js';
import { INPUTS, MODES, AUTO_INPUT_MODES } from './config.js';

// --- RENDERER ---
export function renderSequences() {
    const state = getCurrentState();
    const profileSettings = getCurrentProfileSettings();
    if (!state || !profileSettings || !DOM.sequenceContainer) return; 
    
    const { machineCount, currentMode } = profileSettings;
    const { sequences } = state;
    
    const activeSequences = (currentMode === MODES.UNIQUE_ROUNDS) 
        ? [state.sequences[0]] 
        : sequences.slice(0, machineCount);
    
    DOM.sequenceContainer.innerHTML = '';
    
    const currentTurnIndex = state.nextSequenceIndex % machineCount;

    let layoutClasses = 'gap-4 flex-grow mb-6 transition-all duration-300 pt-1 ';
    let gridClass = '';

    // Fix: Avoid dynamic Tailwind classes
    if (currentMode === MODES.SIMON) {
        if (machineCount === 1) {
            layoutClasses += ' flex flex-col max-w-xl mx-auto';
            gridClass = 'grid grid-cols-5';
        } else if (machineCount === 2) {
            layoutClasses += ' grid grid-cols-2 max-w-3xl mx-auto';
            gridClass = 'grid grid-cols-4';
        } else if (machineCount === 3) {
            layoutClasses += ' grid grid-cols-3 max-w-4xl mx-auto';
            gridClass = 'grid grid-cols-4';
        } else if (machineCount === 4) {
            layoutClasses += ' grid grid-cols-4 max-w-5xl mx-auto';
            gridClass = 'grid grid-cols-3';
        }
    } else {
            layoutClasses += ' flex flex-col max-w-2xl mx-auto';
            gridClass = 'grid grid-cols-5';
    }
    DOM.sequenceContainer.className = layoutClasses;

    if (currentMode === MODES.UNIQUE_ROUNDS) {
        const roundDisplay = document.createElement('div');
        roundDisplay.className = 'text-center text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100';
        roundDisplay.id = 'unique-rounds-round-display';
        roundDisplay.textContent = `Round: ${state.currentRound} / ${profileSettings.sequenceLength}`;
        DOM.sequenceContainer.appendChild(roundDisplay);
    }
    
    // Fix: Double scaling removed. 
    // App.js handles root scaling. Here we just use base rems.
    const baseSize = 40;
    const baseFont = 1.1; 
    const sizeStyle = `height: ${baseSize}px; line-height: ${baseSize}px; font-size: ${baseFont}rem;`;

    activeSequences.forEach((set, index) => {
        const isCurrent = (currentTurnIndex === index && machineCount > 1 && currentMode === MODES.SIMON);
        const sequenceDiv = document.createElement('div');
        
        const originalClasses = `p-4 rounded-xl shadow-md transition-all duration-200 ${isCurrent ? 'bg-accent-app scale-[1.02] shadow-lg text-gray-900' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'}`;
        sequenceDiv.className = originalClasses;
        sequenceDiv.dataset.originalClasses = originalClasses;
        
        sequenceDiv.innerHTML = `
            <div class="${gridClass} gap-2 min-h-[50px]"> 
                ${set.map(val => `
                    <span class="number-box bg-secondary-app text-white rounded-xl text-center shadow-sm"
                            style="${sizeStyle}">
                        ${val}
                    </span>
                `).join('')}
            </div>
        `;
        DOM.sequenceContainer.appendChild(sequenceDiv);
    });
}

export function updateMainUIControlsVisibility(isCameraMasterOn, isMicMasterOn) {
    const profileSettings = getCurrentProfileSettings();
    
    DOM.allResetButtons.forEach(btn => {
        btn.style.display = (profileSettings.currentMode === MODES.UNIQUE_ROUNDS) ? 'block' : 'none';
    });
    
    const mode = profileSettings.autoInputMode;
    DOM.allCameraMasterBtns.forEach(btn => btn.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.PATTERN));
    DOM.allMicMasterBtns.forEach(btn => btn.classList.toggle('hidden', mode !== AUTO_INPUT_MODES.TONE));
    
    DOM.allCameraMasterBtns.forEach(btn => btn.classList.toggle('master-active', isCameraMasterOn));
    DOM.allMicMasterBtns.forEach(btn => btn.classList.toggle('master-active', isMicMasterOn));
}

export function updateAllChrome() {
    const profileSettings = getCurrentProfileSettings();
    if (!profileSettings) return;
    const newInput = profileSettings.currentInput;
    if(DOM.padKey9) DOM.padKey9.style.display = (newInput === INPUTS.KEY9) ? 'block' : 'none';
    if(DOM.padKey12) DOM.padKey12.style.display = (newInput === INPUTS.KEY12) ? 'block' : 'none';
    if(DOM.padPiano) DOM.padPiano.style.display = (newInput === INPUTS.PIANO) ? 'block' : 'none';
    
    if (DOM.allVoiceInputs) {
        DOM.allVoiceInputs.forEach(input => input.classList.toggle('hidden', !profileSettings.isVoiceInputEnabled));
    }
    renderSequences();
}

export function updateTheme(isDark) {
    appSettings.isDarkMode = isDark;
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    renderSequences();
    saveState();
}

export function applyGlobalUiScale(scalePercent) {
    if (scalePercent < 50) scalePercent = 50;
    if (scalePercent > 150) scalePercent = 150;
    appSettings.globalUiScale = scalePercent;
    document.documentElement.style.fontSize = `${scalePercent}%`;
}

export function updateScaleDisplay(multiplier) {
    const percent = Math.round(multiplier * 100);
    if (DOM.uiScaleDisplay) DOM.uiScaleDisplay.textContent = `${percent}%`;
}
export function updateMachinesDisplay(count) {
    if(DOM.machinesDisplay) DOM.machinesDisplay.textContent = count + (count > 1 ? ' Machines' : ' Machine');
}
export function updateSequenceLengthDisplay(val) {
    if(DOM.sequenceLengthDisplay) DOM.sequenceLengthDisplay.textContent = val;
}
export function updatePlaybackSpeedDisplay(val) {
    if(DOM.playbackSpeedDisplay) DOM.playbackSpeedDisplay.textContent = val + '%';
}
export function updateChunkDisplay(val) {
    if(DOM.chunkDisplay) DOM.chunkDisplay.textContent = val;
}
export function updateDelayDisplay(val) {
    if(DOM.delayDisplay) DOM.delayDisplay.textContent = (val / 1000).toFixed(1) + 's';
}
export function updateShakeSensitivityDisplay(val) {
    if(DOM.shakeSensitivityDisplay) DOM.shakeSensitivityDisplay.textContent = val;
}
export function updateFlashSensitivityDisplay(val) {
    if(DOM.flashSensitivityDisplay) DOM.flashSensitivityDisplay.textContent = val;
}

export function showModal(title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel') {
    if (!DOM.customModal) return;
    DOM.modalTitle.textContent = title;
    DOM.modalMessage.textContent = message;
    
    // Fix: Safer event listener handling using onclick
    DOM.modalConfirm.textContent = confirmText;
    DOM.modalConfirm.onclick = () => { onConfirm(); closeModal(); };
    
    DOM.modalCancel.textContent = cancelText;
    DOM.modalCancel.onclick = closeModal;
    
    DOM.modalCancel.style.display = cancelText ? 'inline-block' : 'none';
    DOM.modalConfirm.className = 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-primary-app hover:bg-secondary-app';
    if (confirmText === 'Restore' || confirmText === 'Reset' || confirmText === 'Delete' || confirmText === 'Clear All') {
            DOM.modalConfirm.className = 'px-4 py-2 text-white rounded-lg transition-colors font-semibold bg-btn-control-red hover:bg-btn-control-red-active';
    }
    DOM.customModal.classList.remove('opacity-0', 'pointer-events-none');
    DOM.customModal.querySelector('div').classList.remove('scale-90');
}

export function closeModal() {
    if (DOM.customModal) {
        DOM.customModal.querySelector('div').classList.add('scale-90');
        DOM.customModal.classList.add('opacity-0');
        setTimeout(() => DOM.customModal.classList.add('pointer-events-none'), 300);
    }
}

export function populateConfigDropdown() {
    if (!DOM.configSelect) return;
    DOM.configSelect.innerHTML = '';
    Object.keys(appSettings.profiles).forEach(profileId => {
        const option = document.createElement('option');
        option.value = profileId;
        option.textContent = appSettings.profiles[profileId].name;
        DOM.configSelect.appendChild(option);
    });
    DOM.configSelect.value = appSettings.activeProfileId;
}
