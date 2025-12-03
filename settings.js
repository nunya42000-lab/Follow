// settings.js
export const PREMADE_THEMES={'default':{name:"Default Dark",bgMain:"#000000",bgCard:"#121212",bubble:"#4f46e5",btn:"#1a1a1a",text:"#e5e5e5"},'light':{name:"Light Mode",bgMain:"#f3f4f6",bgCard:"#ffffff",bubble:"#4f46e5",btn:"#e5e7eb",text:"#111827"},'ocean':{name:"Ocean Blue",bgMain:"#0f172a",bgCard:"#1e293b",bubble:"#0ea5e9",btn:"#334155",text:"#e2e8f0"},'matrix':{name:"The Matrix",bgMain:"#000000",bgCard:"#0a0a0a",bubble:"#00ff41",btn:"#002200",text:"#00ff41"},'cyber':{name:"Cyberpunk",bgMain:"#050505",bgCard:"#1a1625",bubble:"#d946ef",btn:"#2d1b4e",text:"#f0abfc"},'volcano':{name:"Volcano",bgMain:"#1a0505",bgCard:"#450a0a",bubble:"#b91c1c",btn:"#7f1d1d",text:"#fecaca"},'forest':{name:"Deep Forest",bgMain:"#021408",bgCard:"#064e3b",bubble:"#166534",btn:"#14532d",text:"#dcfce7"},'sunset':{name:"Sunset",bgMain:"#1a021c",bgCard:"#701a75",bubble:"#fb923c",btn:"#86198f",text:"#fff7ed"}};
const CRAYONS=["#000000","#1F75FE","#1CA9C9","#0D98BA","#FFFFFF","#C5D0E6","#B0B7C6","#AF4035","#F5F5F5","#FEFEFA","#FFFAFA","#F0F8FF","#F8F8FF","#F5F5DC","#FFFACD","#FAFAD2","#FFFFE0","#FFFFF0","#FFFF00","#FFEFD5","#FFE4B5","#FFDAB9","#EEE8AA","#F0E68C","#BDB76B","#E6E6FA","#D8BFD8","#DDA0DD","#EE82EE","#DA70D6","#FF00FF","#BA55D3","#9370DB","#8A2BE2","#9400D3","#9932CC","#8B008B","#800000","#4B0082","#483D8B","#6A5ACD","#7B68EE","#ADFF2F","#7FFF00","#7CFC00","#00FF00","#32CD32","#98FB98","#90EE90","#00FA9A","#00FF7F","#3CB371","#2E8B57","#228B22","#008000","#006400","#9ACD32","#6B8E23","#808000","#556B2F","#66CDAA","#8FBC8F","#20B2AA","#008B8B","#008080","#00FFFF","#00CED1","#40E0D0","#48D1CC","#AFEEEE","#7FFFD4","#B0E0E6","#5F9EA0","#4682B4","#6495ED","#00BFFF","#1E90FF","#ADD8E6","#87CEEB","#87CEFA","#191970","#000080","#0000FF","#0000CD","#4169E1","#8A2BE2","#4B0082","#FFE4C4","#FFEBCD","#F5DEB3","#DEB887","#D2B48C","#BC8F8F","#F4A460","#DAA520","#B8860B","#CD853F","#D2691E","#8B4513","#A0522D","#A52A2A","#800000","#FFA07A","#FA8072","#E9967A","#F08080","#CD5C5C","#DC143C","#B22222","#FF0000","#FF4500","#FF6347","#FF7F50","#FF8C00","#FFA500","#FFD700","#FFFF00","#808000","#556B2F","#6B8E23","#999999","#808080","#666666","#333333","#222222","#111111","#0A0A0A","#000000"];
const LANG={en:{quick_title:"👋 Quick Start",select_profile:"Select Profile",autoplay:"Autoplay",audio:"Audio",help_btn:"Help 📚",settings_btn:"Settings",dont_show:"Don't show again",play_btn:"PLAY",theme_editor:"🎨 Theme Editor"},es:{quick_title:"👋 Inicio Rápido",select_profile:"Perfil",autoplay:"Reproducción",audio:"Audio",help_btn:"Ayuda 📚",settings_btn:"Ajustes",dont_show:"No mostrar más",play_btn:"JUGAR",theme_editor:"🎨 Editor de Temas"}};

export class SettingsManager{
    constructor(appSettings,callbacks,sensorEngine){
        this.appSettings=appSettings;this.callbacks=callbacks;this.sensorEngine=sensorEngine;this.currentTargetKey='bubble';
        this.dom={
            editorModal:document.getElementById('theme-editor-modal'),editorGrid:document.getElementById('color-grid'),ftContainer:document.getElementById('fine-tune-container'),ftToggle:document.getElementById('toggle-fine-tune'),ftPreview:document.getElementById('fine-tune-preview'),ftHue:document.getElementById('ft-hue'),ftSat:document.getElementById('ft-sat'),ftLit:document.getElementById('ft-lit'),
            targetBtns:document.querySelectorAll('.target-btn'),edName:document.getElementById('theme-name-input'),edPreview:document.getElementById('theme-preview-box'),edPreviewBtn:document.getElementById('preview-btn'),edPreviewCard:document.getElementById('preview-card'),edSave:document.getElementById('save-theme-btn'),edCancel:document.getElementById('cancel-theme-btn'),
            openEditorBtn:document.getElementById('open-theme-editor'),voiceSelect:document.getElementById('voice-select'),voicePitch:document.getElementById('voice-pitch'),voiceRate:document.getElementById('voice-rate'),voiceVolume:document.getElementById('voice-volume'),voiceTestBtn:document.getElementById('test-voice-btn'),
            settingsModal:document.getElementById('settings-modal'),themeSelect:document.getElementById('theme-select'),themeAdd:document.getElementById('theme-add'),themeRename:document.getElementById('theme-rename'),themeDelete:document.getElementById('theme-delete'),themeSave:document.getElementById('theme-save'),
            configSelect:document.getElementById('config-select'),quickConfigSelect:document.getElementById('quick-config-select'),configAdd:document.getElementById('config-add'),configRename:document.getElementById('config-rename'),configDelete:document.getElementById('config-delete'),configSave:document.getElementById('config-save'),
            input:document.getElementById('input-select'),mode:document.getElementById('mode-select'),practiceMode:document.getElementById('practice-mode-toggle'),machines:document.getElementById('machines-select'),seqLength:document.getElementById('seq-length-select'),
            autoClear:document.getElementById('autoclear-toggle'),autoplay:document.getElementById('autoplay-toggle'),audio:document.getElementById('audio-toggle'),hapticMorse:document.getElementById('haptic-morse-toggle'),playbackSpeed:document.getElementById('playback-speed-select'),chunk:document.getElementById('chunk-select'),delay:document.getElementById('delay-select'),
            haptics:document.getElementById('haptics-toggle'),speedDelete:document.getElementById('speed-delete-toggle'),showWelcome:document.getElementById('show-welcome-toggle'),blackoutToggle:document.getElementById('blackout-toggle'),stealth1KeyToggle:document.getElementById('stealth-1key-toggle'),
            uiScale:document.getElementById('ui-scale-select'),seqSize:document.getElementById('seq-size-select'),gestureMode:document.getElementById('gesture-mode-select'),autoInput:document.getElementById('auto-input-select'),
            quickLang:document.getElementById('quick-lang-select'),generalLang:document.getElementById('general-lang-select'),closeSettingsBtn:document.getElementById('close-settings'),tabs:document.querySelectorAll('.tab-btn'),contents:document.querySelectorAll('.tab-content'),helpModal:document.getElementById('help-modal'),setupModal:document.getElementById('game-setup-modal'),shareModal:document.getElementById('share-modal'),closeSetupBtn:document.getElementById('close-game-setup-modal'),quickSettings:document.getElementById('quick-open-settings'),quickHelp:document.getElementById('quick-open-help'),
            quickAutoplay:document.getElementById('quick-autoplay-toggle'),quickAudio:document.getElementById('quick-audio-toggle'),dontShowWelcome:document.getElementById('dont-show-welcome-toggle'),
            quickResizeUp:document.getElementById('quick-resize-up'),quickResizeDown:document.getElementById('quick-resize-down'),
            openShareInside:document.getElementById('open-share-button'),closeShareBtn:document.getElementById('close-share'),closeHelpBtn:document.getElementById('close-help'),closeHelpBtnBottom:document.getElementById('close-help-btn-bottom'),openHelpBtn:document.getElementById('open-help-button'),promptDisplay:document.getElementById('prompt-display'),copyPromptBtn:document.getElementById('copy-prompt-btn'),restoreBtn:document.querySelector('button[data-action="restore-defaults"]'),
            calibModal:document.getElementById('calibration-modal'),openCalibBtn:document.getElementById('open-calibration-btn'),closeCalibBtn:document.getElementById('close-calibration-btn'),calibAudioSlider:document.getElementById('calib-audio-slider'),calibCamSlider:document.getElementById('calib-cam-slider'),calibAudioBar:document.getElementById('calib-audio-bar'),calibCamBar:document.getElementById('calib-cam-bar'),calibAudioMarker:document.getElementById('calib-audio-marker'),calibCamMarker:document.getElementById('calib-cam-marker'),calibAudioVal:document.getElementById('audio-val-display'),calibCamVal:document.getElementById('cam-val-display'),
            redeemModal:document.getElementById('redeem-modal'),openRedeemBtn:document.getElementById('open-redeem-btn'),closeRedeemBtn:document.getElementById('close-redeem-btn'),
            donateModal:document.getElementById('donate-modal'), openDonateBtn:document.getElementById('open-donate-btn'), closeDonateBtn:document.getElementById('close-donate-btn'),
            btnCashMain:document.getElementById('btn-cashapp-main'), btnPaypalMain:document.getElementById('btn-paypal-main'),
            copyLinkBtn:document.getElementById('copy-link-button'), nativeShareBtn:document.getElementById('native-share-button'),
            chatShareBtn:document.getElementById('chat-share-button'), emailShareBtn:document.getElementById('email-share-button')
        };
        this.tempTheme=null;this.initListeners();this.populateConfigDropdown();this.populateThemeDropdown();this.buildColorGrid();
        setTimeout(() => this.populateVoiceDropdown(), 500);
        if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => this.populateVoiceDropdown();
    }
    populateVoiceDropdown(){
        if(!this.dom.voiceSelect)return;
        const voices=window.speechSynthesis.getVoices();
        if(voices.length === 0) return;
        const currentSelection = this.appSettings.selectedVoice;
        this.dom.voiceSelect.innerHTML='';
        voices.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=v.name;this.dom.voiceSelect.appendChild(o);});
        if(currentSelection) { this.dom.voiceSelect.value = currentSelection; } else if (voices.length > 0) { this.dom.voiceSelect.value = voices[0].name; this.appSettings.selectedVoice = voices[0].name; }
    }
    buildColorGrid(){if(!this.dom.editorGrid)return;this.dom.editorGrid.innerHTML='';CRAYONS.forEach(color=>{const btn=document.createElement('div');btn.style.backgroundColor=color;btn.className="w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm";btn.onclick=()=>this.applyColorToTarget(color);this.dom.editorGrid.appendChild(btn);});}
    applyColorToTarget(hex){if(!this.tempTheme)return;this.tempTheme[this.currentTargetKey]=hex;const[h,s,l]=this.hexToHsl(hex);this.dom.ftHue.value=h;this.dom.ftSat.value=s;this.dom.ftLit.value=l;this.dom.ftPreview.style.backgroundColor=hex;if(this.dom.ftContainer.classList.contains('hidden')){this.dom.ftContainer.classList.remove('hidden');this.dom.ftToggle.style.display='none';}this.updatePreview();}
    updateColorFromSliders(){const h=parseInt(this.dom.ftHue.value);const s=parseInt(this.dom.ftSat.value);const l=parseInt(this.dom.ftLit.value);const hex=this.hslToHex(h,s,l);this.dom.ftPreview.style.backgroundColor=hex;if(this.tempTheme){this.tempTheme[this.currentTargetKey]=hex;this.updatePreview();}}
    openThemeEditor(){if(!this.dom.editorModal)return;const activeId=this.appSettings.activeTheme;const source=this.appSettings.customThemes[activeId]||PREMADE_THEMES[activeId]||PREMADE_THEMES['default'];this.tempTheme={...source};this.dom.edName.value=this.tempTheme.name;this.dom.targetBtns.forEach(b=>b.classList.remove('active','bg-primary-app'));this.dom.targetBtns[2].classList.add('active','bg-primary-app');this.currentTargetKey='bubble';const[h,s,l]=this.hexToHsl(this.tempTheme.bubble);this.dom.ftHue.value=h;this.dom.ftSat.value=s;this.dom.ftLit.value=l;this.dom.ftPreview.style.backgroundColor=this.tempTheme.bubble;this.updatePreview();this.dom.editorModal.classList.remove('opacity-0','pointer-events-none');this.dom.editorModal.querySelector('div').classList.remove('scale-90');}
    updatePreview(){const t=this.tempTheme;if(!this.dom.edPreview)return;this.dom.edPreview.style.backgroundColor=t.bgMain;this.dom.edPreview.style.color=t.text;this.dom.edPreviewCard.style.backgroundColor=t.bgCard;this.dom.edPreviewCard.style.color=t.text;this.dom.edPreviewCard.style.border='1px solid rgba(255,255,255,0.1)';this.dom.edPreviewBtn.style.backgroundColor=t.bubble;this.dom.edPreviewBtn.style.color=t.text;}
    testVoice(){if(window.speechSynthesis){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance("Testing 1 2 3.");if(this.appSettings.selectedVoice){const v=window.speechSynthesis.getVoices().find(voice=>voice.name===this.appSettings.selectedVoice);if(v)u.voice=v;}let p=parseFloat(this.dom.voicePitch.value);let r=parseFloat(this.dom.voiceRate.value);let v=parseFloat(this.dom.voiceVolume.value);u.pitch=p;u.rate=r;u.volume=v;window.speechSynthesis.speak(u);}}
    setLanguage(lang){const t=LANG[lang];if(!t)return;document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.getAttribute('data-i18n');if(t[key])el.textContent=t[key];});if(this.dom.quickLang)this.dom.quickLang.value=lang;if(this.dom.generalLang)this.dom.generalLang.value=lang;}
    openShare(){if(this.dom.settingsModal)this.dom.settingsModal.classList.add('opacity-0','pointer-events-none');if(this.dom.shareModal){this.dom.shareModal.classList.remove('opacity-0','pointer-events-none');setTimeout(()=>this.dom.shareModal.querySelector('.share-sheet').classList.add('active'),10);}}
    closeShare(){if(this.dom.shareModal){this.dom.shareModal.querySelector('.share-sheet').classList.remove('active');setTimeout(()=>this.dom.shareModal.classList.add('opacity-0','pointer-events-none'),300);}}
    openCalibration(){if(this.dom.calibModal){this.dom.calibModal.classList.remove('opacity-0','pointer-events-none');this.dom.calibModal.style.pointerEvents='auto';this.sensorEngine.toggleAudio(true);this.sensorEngine.toggleCamera(true);this.sensorEngine.setCalibrationCallback((data)=>{if(this.dom.calibAudioBar){const pct=((data.audio-(-100))/((-30)-(-100)))*100;this.dom.calibAudioBar.style.width=`${Math.max(0,Math.min(100,pct))}%`;}if(this.dom.calibCamBar){const pct=Math.min(100,data.camera);this.dom.calibCamBar.style.width=`${pct}%`;}});}}
    closeCalibration(){if(this.dom.calibModal){this.dom.calibModal.classList.add('opacity-0','pointer-events-none');this.dom.calibModal.style.pointerEvents='none';this.sensorEngine.setCalibrationCallback(null);this.sensorEngine.toggleAudio(this.appSettings.isAudioEnabled);this.sensorEngine.toggleCamera(this.appSettings.autoInputMode==='cam'||this.appSettings.autoInputMode==='both');}}
    toggleRedeem(show){if(show){if(this.dom.settingsModal)this.dom.settingsModal.classList.add('opacity-0','pointer-events-none');if(this.dom.redeemModal){this.dom.redeemModal.classList.remove('opacity-0','pointer-events-none');this.dom.redeemModal.style.pointerEvents='auto';}}else{if(this.dom.redeemModal){this.dom.redeemModal.classList.add('opacity-0','pointer-events-none');this.dom.redeemModal.style.pointerEvents='none';}}}
    toggleDonate(show){if(show){if(this.dom.settingsModal)this.dom.settingsModal.classList.add('opacity-0','pointer-events-none');if(this.dom.donateModal){this.dom.donateModal.classList.remove('opacity-0','pointer-events-none');this.dom.donateModal.style.pointerEvents='auto';}}else{if(this.dom.donateModal){this.dom.donateModal.classList.add('opacity-0','pointer-events-none');this.dom.donateModal.style.pointerEvents='none';}}}
    
    initListeners(){
        this.dom.targetBtns.forEach(btn=>{btn.onclick=()=>{this.dom.targetBtns.forEach(b=>{b.classList.remove('active','bg-primary-app');b.classList.add('opacity-60');});btn.classList.add('active','bg-primary-app');btn.classList.remove('opacity-60');this.currentTargetKey=btn.dataset.target;if(this.tempTheme){const[h,s,l]=this.hexToHsl(this.tempTheme[this.currentTargetKey]);this.dom.ftHue.value=h;this.dom.ftSat.value=s;this.dom.ftLit.value=l;this.dom.ftPreview.style.backgroundColor=this.tempTheme[this.currentTargetKey];}};});
        [this.dom.ftHue,this.dom.ftSat,this.dom.ftLit].forEach(sl=>{sl.oninput=()=>this.updateColorFromSliders();});
        this.dom.ftToggle.onclick=()=>{this.dom.ftContainer.classList.remove('hidden');this.dom.ftToggle.style.display='none';};
        if(this.dom.edSave)this.dom.edSave.onclick=()=>{if(this.tempTheme){const activeId=this.appSettings.activeTheme;if(PREMADE_THEMES[activeId]){const newId='custom_'+Date.now();this.appSettings.customThemes[newId]=this.tempTheme;this.appSettings.activeTheme=newId;}else{this.appSettings.customThemes[activeId]=this.tempTheme;}this.callbacks.onSave();this.callbacks.onUpdate();this.dom.editorModal.classList.add('opacity-0','pointer-events-none');this.dom.editorModal.querySelector('div').classList.add('scale-90');this.populateThemeDropdown();}};
        if(this.dom.openEditorBtn)this.dom.openEditorBtn.onclick=()=>this.openThemeEditor();
        if(this.dom.edCancel)this.dom.edCancel.onclick=()=>{this.dom.editorModal.classList.add('opacity-0','pointer-events-none');};
        if(this.dom.voiceTestBtn)this.dom.voiceTestBtn.onclick=()=>this.testVoice();
        const saveVoice=()=>{this.appSettings.selectedVoice=this.dom.voiceSelect.value;this.appSettings.voicePitch=parseFloat(this.dom.voicePitch.value);this.appSettings.voiceRate=parseFloat(this.dom.voiceRate.value);this.appSettings.voiceVolume=parseFloat(this.dom.voiceVolume.value);this.callbacks.onSave();};
        if(this.dom.voiceSelect)this.dom.voiceSelect.onchange=saveVoice;
        if(this.dom.voicePitch)this.dom.voicePitch.oninput=saveVoice;
        if(this.dom.voiceRate)this.dom.voiceRate.oninput=saveVoice;
        if(this.dom.voiceVolume)this.dom.voiceVolume.oninput=saveVoice;
        if(this.dom.quickLang)this.dom.quickLang.onchange=(e)=>this.setLanguage(e.target.value);
        if(this.dom.generalLang)this.dom.generalLang.onchange=(e)=>this.setLanguage(e.target.value);
        const handleProfileSwitch=(val)=>{this.callbacks.onProfileSwitch(val);this.openSettings();};
        if(this.dom.configSelect)this.dom.configSelect.onchange=(e)=>handleProfileSwitch(e.target.value);
        if(this.dom.quickConfigSelect)this.dom.quickConfigSelect.onchange=(e)=>handleProfileSwitch(e.target.value);
        
        const bind=(el,prop,isGlobal,isInt=false,isFloat=false)=>{if(!el)return;el.onchange=()=>{let val=(el.type==='checkbox')?el.checked:el.value;if(isInt)val=parseInt(val);if(isFloat)val=parseFloat(val);if(isGlobal){this.appSettings[prop]=val;if(prop==='activeTheme')this.callbacks.onUpdate();if(prop==='isPracticeModeEnabled')this.callbacks.onUpdate();}else{this.appSettings.runtimeSettings[prop]=val;}this.callbacks.onSave();this.generatePrompt();};};
        
        bind(this.dom.input,'currentInput',false);bind(this.dom.machines,'machineCount',false,true);bind(this.dom.seqLength,'sequenceLength',false,true);bind(this.dom.autoClear,'isUniqueRoundsAutoClearEnabled',true);
        
        if(this.dom.mode){
            this.dom.mode.onchange = () => {
                this.appSettings.runtimeSettings.currentMode = this.dom.mode.value;
                this.callbacks.onSave();
                this.callbacks.onUpdate('mode_switch');
                this.generatePrompt();
            };
        }

        if(this.dom.autoplay){
            this.dom.autoplay.onchange=(e)=>{
                this.appSettings.isAutoplayEnabled = e.target.checked;
                if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if(this.dom.audio){
            this.dom.audio.onchange=(e)=>{
                this.appSettings.isAudioEnabled = e.target.checked;
                if(this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if(this.dom.quickAutoplay){
            this.dom.quickAutoplay.onchange=(e)=>{
                this.appSettings.isAutoplayEnabled = e.target.checked;
                if(this.dom.autoplay) this.dom.autoplay.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if(this.dom.quickAudio){
            this.dom.quickAudio.onchange=(e)=>{
                this.appSettings.isAudioEnabled = e.target.checked;
                if(this.dom.audio) this.dom.audio.checked = e.target.checked;
                this.callbacks.onSave();
            }
        }
        if(this.dom.dontShowWelcome){
             this.dom.dontShowWelcome.onchange=(e)=>{
                this.appSettings.showWelcomeScreen = !e.target.checked;
                if(this.dom.showWelcome) this.dom.showWelcome.checked = !e.target.checked;
                this.callbacks.onSave();
             }
        }
        if(this.dom.showWelcome){
            this.dom.showWelcome.onchange=(e)=>{
                this.appSettings.showWelcomeScreen = e.target.checked;
                if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !e.target.checked;
                this.callbacks.onSave();
            }
        }

        bind(this.dom.hapticMorse,'isHapticMorseEnabled',true);
        if(this.dom.playbackSpeed)this.dom.playbackSpeed.onchange=(e)=>{this.appSettings.playbackSpeed=parseFloat(e.target.value);this.callbacks.onSave();};
        bind(this.dom.chunk,'simonChunkSize',false,true);
        if(this.dom.delay)this.dom.delay.onchange=(e)=>{this.appSettings.runtimeSettings.simonInterSequenceDelay=parseFloat(e.target.value)*1000;this.callbacks.onSave();};
        bind(this.dom.haptics,'isHapticsEnabled',true);bind(this.dom.speedDelete,'isSpeedDeletingEnabled',true);bind(this.dom.stealth1KeyToggle,'isStealth1KeyEnabled',true);
        bind(this.dom.blackoutToggle,'isBlackoutFeatureEnabled',true);bind(this.dom.practiceMode,'isPracticeModeEnabled',true);
        if(this.dom.uiScale)this.dom.uiScale.onchange=(e)=>{this.appSettings.globalUiScale=parseInt(e.target.value);this.callbacks.onUpdate();};
        if(this.dom.seqSize)this.dom.seqSize.onchange=(e)=>{this.appSettings.uiScaleMultiplier=parseInt(e.target.value)/100.0;this.callbacks.onUpdate();};
        if(this.dom.gestureMode)this.dom.gestureMode.onchange=(e)=>{this.appSettings.gestureResizeMode=e.target.value;this.callbacks.onSave();};
        if(this.dom.autoInput)this.dom.autoInput.onchange=(e)=>{const val=e.target.value;this.appSettings.autoInputMode=val;this.appSettings.showMicBtn=(val==='mic'||val==='both');this.appSettings.showCamBtn=(val==='cam'||val==='both');this.callbacks.onSave();this.callbacks.onUpdate();};
        if(this.dom.themeAdd)this.dom.themeAdd.onclick=()=>{const n=prompt("Name:");if(n){const id='c_'+Date.now();this.appSettings.customThemes[id]={...PREMADE_THEMES['default'],name:n};this.appSettings.activeTheme=id;this.callbacks.onSave();this.callbacks.onUpdate();this.populateThemeDropdown();this.openThemeEditor();}};
        if(this.dom.themeRename)this.dom.themeRename.onclick=()=>{const id=this.appSettings.activeTheme;if(PREMADE_THEMES[id])return alert("Cannot rename built-in.");const n=prompt("Rename:",this.appSettings.customThemes[id].name);if(n){this.appSettings.customThemes[id].name=n;this.callbacks.onSave();this.populateThemeDropdown();}};
        if(this.dom.themeDelete)this.dom.themeDelete.onclick=()=>{if(PREMADE_THEMES[this.appSettings.activeTheme])return alert("Cannot delete built-in.");if(confirm("Delete?")){delete this.appSettings.customThemes[this.appSettings.activeTheme];this.appSettings.activeTheme='default';this.callbacks.onSave();this.callbacks.onUpdate();this.populateThemeDropdown();}};
        if(this.dom.themeSelect)this.dom.themeSelect.onchange=(e)=>{this.appSettings.activeTheme=e.target.value;this.callbacks.onUpdate();this.populateThemeDropdown();};
        if(this.dom.configAdd)this.dom.configAdd.onclick=()=>{const n=prompt("Profile Name:");if(n)this.callbacks.onProfileAdd(n);this.openSettings();};
        if(this.dom.configRename)this.dom.configRename.onclick=()=>{const n=prompt("Rename:");if(n)this.callbacks.onProfileRename(n);this.populateConfigDropdown();};
        if(this.dom.configDelete)this.dom.configDelete.onclick=()=>{this.callbacks.onProfileDelete();this.openSettings();};
        if(this.dom.configSave) this.dom.configSave.onclick=()=>{ this.callbacks.onProfileSave(); };
        if(this.dom.themeSave) this.dom.themeSave.onclick=()=>{ 
            if(this.tempTheme){
                const activeId=this.appSettings.activeTheme;
                if(PREMADE_THEMES[activeId]){
                    const newId='custom_'+Date.now();
                    this.appSettings.customThemes[newId]=this.tempTheme;
                    this.appSettings.activeTheme=newId;
                }else{
                    this.appSettings.customThemes[activeId]=this.tempTheme;
                }
                this.callbacks.onProfileSave();
                this.callbacks.onUpdate();
                this.populateThemeDropdown();
                alert("Theme Saved!");
            }
        };
        if(this.dom.closeSetupBtn)this.dom.closeSetupBtn.onclick=()=>this.closeSetup();
        if(this.dom.quickSettings)this.dom.quickSettings.onclick=()=>{this.closeSetup();this.openSettings();};
        if(this.dom.quickHelp)this.dom.quickHelp.onclick=()=>{this.closeSetup();this.generatePrompt();this.dom.helpModal.classList.remove('opacity-0','pointer-events-none');};
        if(this.dom.closeHelpBtn)this.dom.closeHelpBtn.onclick=()=>this.dom.helpModal.classList.add('opacity-0','pointer-events-none');
        if(this.dom.closeHelpBtnBottom)this.dom.closeHelpBtnBottom.onclick=()=>this.dom.helpModal.classList.add('opacity-0','pointer-events-none');
        if(this.dom.openHelpBtn)this.dom.openHelpBtn.onclick=()=>{this.generatePrompt();this.dom.helpModal.classList.remove('opacity-0','pointer-events-none');};
        if(this.dom.closeSettingsBtn)this.dom.closeSettingsBtn.onclick=()=>{this.callbacks.onSave();this.dom.settingsModal.classList.add('opacity-0','pointer-events-none');this.dom.settingsModal.querySelector('div').classList.add('scale-90');};
        if(this.dom.openCalibBtn)this.dom.openCalibBtn.onclick=()=>this.openCalibration();
        if(this.dom.closeCalibBtn)this.dom.closeCalibBtn.onclick=()=>this.closeCalibration();
        if(this.dom.calibAudioSlider)this.dom.calibAudioSlider.oninput=()=>{const val=parseInt(this.dom.calibAudioSlider.value);this.appSettings.sensorAudioThresh=val;this.sensorEngine.setSensitivity('audio',val);const pct=((val-(-100))/((-30)-(-100)))*100;this.dom.calibAudioMarker.style.left=`${pct}%`;this.dom.calibAudioVal.innerText=val+'dB';this.callbacks.onSave();};
        if(this.dom.calibCamSlider)this.dom.calibCamSlider.oninput=()=>{const val=parseInt(this.dom.calibCamSlider.value);this.appSettings.sensorCamThresh=val;this.sensorEngine.setSensitivity('camera',val);const pct=Math.min(100,val);this.dom.calibCamMarker.style.left=`${pct}%`;this.dom.calibCamVal.innerText=val;this.callbacks.onSave();};
        
        this.dom.tabs.forEach(btn=>btn.onclick=()=>{
            this.dom.tabs.forEach(b=>b.classList.remove('active'));
            this.dom.contents.forEach(c=>c.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.tab;
            if(target === 'help-voice') this.generatePrompt();
            document.getElementById(`tab-${target}`).classList.add('active');
        });

        if(this.dom.openShareInside)this.dom.openShareInside.onclick=()=>this.openShare();
        if(this.dom.closeShareBtn)this.dom.closeShareBtn.onclick=()=>this.closeShare();
        if(this.dom.openRedeemBtn)this.dom.openRedeemBtn.onclick=()=>this.toggleRedeem(true);
        if(this.dom.closeRedeemBtn)this.dom.closeRedeemBtn.onclick=()=>this.toggleRedeem(false);
        if(this.dom.openDonateBtn)this.dom.openDonateBtn.onclick=()=>this.toggleDonate(true);
        if(this.dom.closeDonateBtn)this.dom.closeDonateBtn.onclick=()=>this.toggleDonate(false);

        if(this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick=()=>{ navigator.clipboard.writeText(window.location.href).then(()=>alert("Link Copied!")); };
        if(this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick=()=>{ 
            if(this.dom.promptDisplay) {
                this.dom.promptDisplay.select();
                navigator.clipboard.writeText(this.dom.promptDisplay.value).then(()=>alert("Prompt Copied!"));
            }
        };
        if(this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick=()=>{ if(navigator.share){ navigator.share({title:"Follow Me", url:window.location.href}); }else{ alert("Share not supported"); } };
        
        if(this.dom.chatShareBtn) this.dom.chatShareBtn.onclick=()=>{ window.location.href = `sms:?body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
        if(this.dom.emailShareBtn) this.dom.emailShareBtn.onclick=()=>{ window.location.href = `mailto:?subject=Follow%20Me%20App&body=Check%20out%20Follow%20Me:%20${window.location.href}`; };

        if(this.dom.btnCashMain) this.dom.btnCashMain.onclick=()=>{ window.open('https://cash.app/$jwo83', '_blank'); };
        if(this.dom.btnPaypalMain) this.dom.btnPaypalMain.onclick=()=>{ window.open('https://www.paypal.me/Oyster981', '_blank'); };

        document.querySelectorAll('.donate-quick-btn').forEach(btn => {
            btn.onclick = () => {
                const app = btn.dataset.app;
                const amt = btn.dataset.amount;
                if(app === 'cash') window.open(`https://cash.app/$jwo83/${amt}`, '_blank');
                if(app === 'paypal') window.open(`https://www.paypal.me/Oyster981/${amt}`, '_blank');
            };
        });

        if(this.dom.restoreBtn)this.dom.restoreBtn.onclick=()=>{if(confirm("Factory Reset?"))this.callbacks.onReset();};
        if(this.dom.quickResizeUp)this.dom.quickResizeUp.onclick=()=>{this.appSettings.globalUiScale=Math.min(200,this.appSettings.globalUiScale+10);this.callbacks.onUpdate();};
        if(this.dom.quickResizeDown)this.dom.quickResizeDown.onclick=()=>{this.appSettings.globalUiScale=Math.max(50,this.appSettings.globalUiScale-10);this.callbacks.onUpdate();};
    }
    populateConfigDropdown(){const createOptions=()=>Object.keys(this.appSettings.profiles).map(id=>{const o=document.createElement('option');o.value=id;o.textContent=this.appSettings.profiles[id].name;return o;});if(this.dom.configSelect){this.dom.configSelect.innerHTML='';createOptions().forEach(opt=>this.dom.configSelect.appendChild(opt));this.dom.configSelect.value=this.appSettings.activeProfileId;}if(this.dom.quickConfigSelect){this.dom.quickConfigSelect.innerHTML='';createOptions().forEach(opt=>this.dom.quickConfigSelect.appendChild(opt));this.dom.quickConfigSelect.value=this.appSettings.activeProfileId;}}
    populateThemeDropdown(){const s=this.dom.themeSelect;if(!s)return;s.innerHTML='';const grp1=document.createElement('optgroup');grp1.label="Built-in";Object.keys(PREMADE_THEMES).forEach(k=>{const el=document.createElement('option');el.value=k;el.textContent=PREMADE_THEMES[k].name;grp1.appendChild(el);});s.appendChild(grp1);const grp2=document.createElement('optgroup');grp2.label="My Themes";Object.keys(this.appSettings.customThemes).forEach(k=>{const el=document.createElement('option');el.value=k;el.textContent=this.appSettings.customThemes[k].name;grp2.appendChild(el);});s.appendChild(grp2);s.value=this.appSettings.activeTheme;}
    openSettings(){this.populateConfigDropdown();this.populateThemeDropdown();this.updateUIFromSettings();this.dom.settingsModal.classList.remove('opacity-0','pointer-events-none');this.dom.settingsModal.querySelector('div').classList.remove('scale-90');}
    openSetup(){
        this.populateConfigDropdown();
        this.updateUIFromSettings(); 
        this.dom.setupModal.classList.remove('opacity-0','pointer-events-none');this.dom.setupModal.querySelector('div').classList.remove('scale-90');
    }
    closeSetup(){this.callbacks.onSave();this.dom.setupModal.classList.add('opacity-0');this.dom.setupModal.querySelector('div').classList.add('scale-90');setTimeout(()=>this.dom.setupModal.classList.add('pointer-events-none'),300);}
    
    generatePrompt(){
        if(!this.dom.promptDisplay) return;
        const ps = this.appSettings.runtimeSettings;
        const max = ps.currentInput === 'key12' ? 12 : 9;
        const mode = ps.currentMode === 'simon' ? 'Repeating Sequence (Simon Says)' : 'Random Sequence (Unique)';
        
        let logic = "";
        if(ps.currentMode === 'simon') {
            logic = "MODE: Simon Says. \nTASK: I will speak a number. You must add it to the list and IMMEDIATELY recite the entire sequence back to me from the beginning. Speak fast. Do not explain. Just the numbers.";
        } else {
            logic = "MODE: Unique Random. \nTASK: I will speak a number. You just acknowledge it by repeating that single number. \nIMPORTANT: Keep a running list in memory. If I say 'Recall' or 'Review', recite the entire list back to me instantly.";
        }

        const txt = `Act as a fast sequence tracking assistant.\nValid Inputs: 1 to ${max}.\n${logic}\n\nExample Interaction:\nMe: "5"\nYou: "5"\nMe: "2"\nYou: "${ps.currentMode === 'simon' ? '5, 2' : '2'}"\n\nStart now. Waiting for input.`;
        
        this.dom.promptDisplay.value = txt;
    }

    updateUIFromSettings(){
        const ps=this.appSettings.runtimeSettings;
        const gs=this.appSettings;
        if(this.dom.input)this.dom.input.value=ps.currentInput;
        
        if(this.dom.mode)this.dom.mode.value=ps.currentMode;
        
        if(this.dom.machines)this.dom.machines.value=ps.machineCount;
        if(this.dom.seqLength)this.dom.seqLength.value=ps.sequenceLength;
        if(this.dom.autoClear)this.dom.autoClear.checked=gs.isUniqueRoundsAutoClearEnabled;
        
        if(this.dom.autoplay)this.dom.autoplay.checked=gs.isAutoplayEnabled;
        if(this.dom.audio)this.dom.audio.checked=gs.isAudioEnabled;
        
        if(this.dom.quickAutoplay) this.dom.quickAutoplay.checked = gs.isAutoplayEnabled;
        if(this.dom.quickAudio) this.dom.quickAudio.checked = gs.isAudioEnabled;
        if(this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !gs.showWelcomeScreen;
        if(this.dom.showWelcome) this.dom.showWelcome.checked = gs.showWelcomeScreen;

        if(this.dom.hapticMorse)this.dom.hapticMorse.checked=gs.isHapticMorseEnabled;
        if(this.dom.playbackSpeed)this.dom.playbackSpeed.value=gs.playbackSpeed.toFixed(1)||"1.0";
        if(this.dom.chunk)this.dom.chunk.value=ps.simonChunkSize;
        if(this.dom.delay)this.dom.delay.value=(ps.simonInterSequenceDelay/1000);
        if(this.dom.voicePitch)this.dom.voicePitch.value=gs.voicePitch||1.0;
        if(this.dom.voiceRate)this.dom.voiceRate.value=gs.voiceRate||1.0;
        if(this.dom.voiceVolume)this.dom.voiceVolume.value=gs.voiceVolume||1.0;
        if(this.dom.practiceMode)this.dom.practiceMode.checked=gs.isPracticeModeEnabled;
        if(this.dom.stealth1KeyToggle)this.dom.stealth1KeyToggle.checked=gs.isStealth1KeyEnabled;
        if(this.dom.calibAudioSlider)this.dom.calibAudioSlider.value=gs.sensorAudioThresh||-85;
        if(this.dom.calibCamSlider)this.dom.calibCamSlider.value=gs.sensorCamThresh||30;
        
        if(this.dom.uiScale) this.dom.uiScale.value = gs.globalUiScale || 100; 
        if(this.dom.seqSize) this.dom.seqSize.value = Math.round(gs.uiScaleMultiplier*100) || 100;
        
        if(this.dom.voiceSelect && gs.selectedVoice) this.dom.voiceSelect.value = gs.selectedVoice;
    }
    hexToHsl(hex){let r=0,g=0,b=0;if(hex.length===4){r="0x"+hex[1]+hex[1];g="0x"+hex[2]+hex[2];b="0x"+hex[3]+hex[3];}else if(hex.length===7){r="0x"+hex[1]+hex[2];g="0x"+hex[3]+hex[4];b="0x"+hex[5]+hex[6];}r/=255;g/=255;b/=255;let cmin=Math.min(r,g,b),cmax=Math.max(r,g,b),delta=cmax-cmin,h=0,s=0,l=0;if(delta===0)h=0;else if(cmax===r)h=((g-b)/delta)%6;else if(cmax===g)h=(b-r)/delta+2;else h=(r-g)/delta+4;h=Math.round(h*60);if(h<0)h+=360;l=(cmax+cmin)/2;s=delta===0?0:delta/(1-Math.abs(2*l-1));s=+(s*100).toFixed(1);l=+(l*100).toFixed(1);return[h,s,l];}
    hslToHex(h,s,l){s/=100;l/=100;let c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;if(0<=h&&h<60){r=c;g=x;b=0;}else if(60<=h&&h<120){r=x;g=c;b=0;}else if(120<=h&&h<180){r=0;g=c;b=x;}else if(180<=h&&h<240){r=0;g=x;b=c;}else if(240<=h&&h<300){r=x;g=0;b=c;}else{r=c;g=0;b=x;}r=Math.round((r+m)*255).toString(16);g=Math.round((g+m)*255).toString(16);b=Math.round((b+m)*255).toString(16);if(r.length===1)r="0"+r;if(g.length===1)g="0"+g;if(b.length===1)b="0"+b;return"#"+r+g+b;}
}
