// dom.js
// We export a single object that will hold all our DOM references.
// This allows other modules to access 'DOM.sequenceContainer' easily.

export const DOM = {
    sequenceContainer: null,
    customModal: null, modalTitle: null, modalMessage: null, modalConfirm: null, modalCancel: null,
    shareModal: null, closeShare: null, copyLinkButton: null, nativeShareButton: null,
    toastNotification: null, toastMessage: null,
    gameSetupModal: null, closeGameSetupModalBtn: null, dontShowWelcomeToggle: null,
    configSelect: null, configAddBtn: null, configRenameBtn: null, configDeleteBtn: null,
    quickAutoplayToggle: null, quickAudioToggle: null,
    quickOpenHelpBtn: null, quickOpenSettingsBtn: null,
    globalResizeUpBtn: null, globalResizeDownBtn: null,
    settingsModal: null, settingsTabNav: null, openHelpButton: null, openShareButton: null, closeSettings: null, openGameSetupFromSettings: null,
    activeProfileNameSpan: null, openCommentModalBtn: null,
    helpModal: null, helpContentContainer: null, helpTabNav: null, closeHelp: null,
    commentModal: null, closeCommentModalBtn: null, submitCommentBtn: null,
    commentUsername: null, commentMessage: null, commentsListContainer: null,
    cameraModal: null, closeCameraModalBtn: null, openCameraModalBtn: null,
    cameraFeed: null, cameraFeedContainer: null, grid9Key: null, grid12Key: null,
    detectionCanvas: null, startCameraBtn: null, startDetectionBtn: null, stopDetectionBtn: null,
    flashSensitivitySlider: null, flashSensitivityDisplay: null,
    
    // Settings Controls
    inputSelect: null, modeToggle: null, modeToggleLabel: null,
    machinesSlider: null, machinesDisplay: null,
    sequenceLengthSlider: null, sequenceLengthDisplay: null, sequenceLengthLabel: null,
    chunkSlider: null, chunkDisplay: null,
    delaySlider: null, delayDisplay: null,
    settingMultiSequenceGroup: null, autoclearToggle: null, settingAutoclear: null,
    playbackSpeedSlider: null, playbackSpeedDisplay: null,
    showWelcomeToggle: null, darkModeToggle: null,
    uiScaleSlider: null, uiScaleDisplay: null,
    shortcutListContainer: null, addShortcutBtn: null,
    shakeSensitivitySlider: null, shakeSensitivityDisplay: null,
    autoplayToggle: null, speedDeleteToggle: null,
    audioToggle: null, voiceInputToggle: null, hapticsToggle: null, autoInputSlider: null,

    // Footer
    padKey9: null, padKey12: null, padPiano: null,
    allVoiceInputs: null, allResetButtons: null,
    allCameraMasterBtns: null, allMicMasterBtns: null
};

export function assignDomElements() {
    DOM.sequenceContainer = document.getElementById('sequence-container');
    DOM.customModal = document.getElementById('custom-modal');
    DOM.modalTitle = document.getElementById('modal-title');
    DOM.modalMessage = document.getElementById('modal-message');
    DOM.modalConfirm = document.getElementById('modal-confirm');
    DOM.modalCancel = document.getElementById('modal-cancel');
    DOM.shareModal = document.getElementById('share-modal');
    DOM.closeShare = document.getElementById('close-share');
    DOM.copyLinkButton = document.getElementById('copy-link-button'); 
    DOM.nativeShareButton = document.getElementById('native-share-button'); 
    DOM.toastNotification = document.getElementById('toast-notification');
    DOM.toastMessage = document.getElementById('toast-message');
    
    DOM.gameSetupModal = document.getElementById('game-setup-modal');
    DOM.closeGameSetupModalBtn = document.getElementById('close-game-setup-modal');
    DOM.dontShowWelcomeToggle = document.getElementById('dont-show-welcome-toggle');
    DOM.globalResizeUpBtn = document.getElementById('global-resize-up');
    DOM.globalResizeDownBtn = document.getElementById('global-resize-down');
    DOM.configSelect = document.getElementById('config-select');
    DOM.configAddBtn = document.getElementById('config-add');
    DOM.configRenameBtn = document.getElementById('config-rename');
    DOM.configDeleteBtn = document.getElementById('config-delete');
    DOM.quickAutoplayToggle = document.getElementById('quick-autoplay-toggle');
    DOM.quickAudioToggle = document.getElementById('quick-audio-toggle');
    DOM.quickOpenHelpBtn = document.getElementById('quick-open-help');
    DOM.quickOpenSettingsBtn = document.getElementById('quick-open-settings');

    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.settingsTabNav = document.getElementById('settings-tab-nav');
    DOM.openGameSetupFromSettings = document.getElementById('open-game-setup-from-settings');
    DOM.openShareButton = document.getElementById('open-share-button');
    DOM.openHelpButton = document.getElementById('open-help-button');
    DOM.openCommentModalBtn = document.getElementById('open-comment-modal'); 
    DOM.closeSettings = document.getElementById('close-settings');
    DOM.activeProfileNameSpan = document.getElementById('active-profile-name');
    
    DOM.helpModal = document.getElementById('help-modal');
    DOM.helpContentContainer = document.getElementById('help-content-container');
    DOM.helpTabNav = document.getElementById('help-tab-nav');
    DOM.closeHelp = document.getElementById('close-help');

    DOM.commentModal = document.getElementById('comment-modal');
    DOM.closeCommentModalBtn = document.getElementById('close-comment-modal');
    DOM.submitCommentBtn = document.getElementById('submit-comment-btn');
    DOM.commentUsername = document.getElementById('comment-username');
    DOM.commentMessage = document.getElementById('comment-message');
    DOM.commentsListContainer = document.getElementById('comments-list-container');
    
    DOM.cameraModal = document.getElementById('camera-modal');
    DOM.closeCameraModalBtn = document.getElementById('close-camera-modal'); 
    DOM.openCameraModalBtn = document.getElementById('open-camera-modal-btn');
    DOM.cameraFeed = document.getElementById('camera-feed');
    DOM.cameraFeedContainer = document.getElementById('camera-feed-container');
    DOM.grid9Key = document.getElementById('grid-9key');     
    DOM.grid12Key = document.getElementById('grid-12key');   
    DOM.detectionCanvas = document.getElementById('detection-canvas');
    DOM.startCameraBtn = document.getElementById('start-camera-btn');
    DOM.startDetectionBtn = document.getElementById('start-detection-btn');
    DOM.stopDetectionBtn = document.getElementById('stop-detection-btn');
    DOM.flashSensitivitySlider = document.getElementById('flash-sensitivity-slider');
    DOM.flashSensitivityDisplay = document.getElementById('flash-sensitivity-display');

    // Controls
    DOM.inputSelect = document.getElementById('input-select');
    DOM.modeToggle = document.getElementById('mode-toggle');
    DOM.modeToggleLabel = document.getElementById('mode-toggle-label');
    DOM.machinesSlider = document.getElementById('machines-slider');
    DOM.machinesDisplay = document.getElementById('machines-display');
    DOM.sequenceLengthSlider = document.getElementById('sequence-length-slider');
    DOM.sequenceLengthDisplay = document.getElementById('sequence-length-display');
    DOM.sequenceLengthLabel = document.getElementById('sequence-length-label');
    DOM.chunkSlider = document.getElementById('chunk-slider');
    DOM.chunkDisplay = document.getElementById('chunk-display');
    DOM.delaySlider = document.getElementById('delay-slider');
    DOM.delayDisplay = document.getElementById('delay-display');
    DOM.settingMultiSequenceGroup = document.getElementById('setting-multi-sequence-group');
    DOM.autoclearToggle = document.getElementById('autoclear-toggle');
    DOM.settingAutoclear = document.getElementById('setting-autoclear');
    
    DOM.playbackSpeedSlider = document.getElementById('playback-speed-slider');
    DOM.playbackSpeedDisplay = document.getElementById('playback-speed-display');
    DOM.showWelcomeToggle = document.getElementById('show-welcome-toggle');
    DOM.darkModeToggle = document.getElementById('dark-mode-toggle');
    DOM.uiScaleSlider = document.getElementById('ui-scale-slider');
    DOM.uiScaleDisplay = document.getElementById('ui-scale-display');
    
    DOM.shortcutListContainer = document.getElementById('shortcut-list-container');
    DOM.addShortcutBtn = document.getElementById('add-shortcut-btn');
    DOM.shakeSensitivitySlider = document.getElementById('shake-sensitivity-slider');
    DOM.shakeSensitivityDisplay = document.getElementById('shake-sensitivity-display');
    
    DOM.autoplayToggle = document.getElementById('autoplay-toggle');
    DOM.speedDeleteToggle = document.getElementById('speed-delete-toggle');
    DOM.audioToggle = document.getElementById('audio-toggle');
    DOM.voiceInputToggle = document.getElementById('voice-input-toggle');
    DOM.hapticsToggle = document.getElementById('haptics-toggle');
    DOM.autoInputSlider = document.getElementById('auto-input-slider'); 

    DOM.padKey9 = document.getElementById('pad-key9');
    DOM.padKey12 = document.getElementById('pad-key12');
    DOM.padPiano = document.getElementById('pad-piano');
    
    DOM.allResetButtons = document.querySelectorAll('.reset-button');
    DOM.allVoiceInputs = document.querySelectorAll('.voice-text-input');
    DOM.allCameraMasterBtns = document.querySelectorAll('#camera-master-btn'); 
    DOM.allMicMasterBtns = document.querySelectorAll('#mic-master-btn');       
}
