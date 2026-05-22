class ARMode {
    constructor() {
        this.isActive = false;
        this.video = null;
        this.stream = null;
        this.recorder = null;
        this.chunks = [];
        this.debugLog = null;
    }

    log(msg) {
        if (this.debugLog) this.debugLog.innerText = `AR: ${msg}`;
        console.log(msg);
    }

    async start() {
        if (this.isActive) return;
        this.isActive = true;

        // Create Debug HUD
        this.debugLog = document.createElement('div');
        this.debugLog.style = "position:fixed; top:70px; left:10px; color:lime; font-family:monospace; z-index:10000; background:rgba(0,0,0,0.7); padding:5px; font-size:12px; pointer-events:none;";
        document.body.appendChild(this.debugLog);
        this.log("Initializing...");

        // 1. Activate CSS Stealth (defined in styles.css)
        document.body.classList.add('ar-active');

        try {
            // 2. Setup Video Element
            this.video = document.createElement('video');
            this.video.id = "ar-video-overlay";
            this.video.autoplay = true;
            this.video.playsInline = true;
            this.video.muted = true;
            this.video.setAttribute('muted', '');
            document.body.appendChild(this.video);

            this.log("Requesting Camera...");
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: { ideal: 'environment' } },
                audio: false 
            });
            
            this.video.srcObject = this.stream;
            await this.video.play();
            this.log("Streaming Live");

            this.createControls();
        } catch (e) {
            this.log(`Error: ${e.message}`);
            this.stop();
        }
    }

    createControls() {
        const ui = document.createElement('div');
        ui.id = "ar-ui-layer";
        ui.innerHTML = `
            <div class="ar-controls-wrap">
                <button id="ar-rec-trigger">HOLD TO ANALYZE</button>
                <div class="ar-speed-row">
                    <span>Speed: <span id="ar-speed-num">1.0</span>x</span>
                    <input type="range" id="ar-speed-slide" min="0.2" max="1.5" step="0.1" value="1.0">
                </div>
                <button id="ar-close-btn">EXIT CAMERA</button>
            </div>
        `;
        document.body.appendChild(ui);

        const recBtn = ui.querySelector('#ar-rec-trigger');
        const slider = ui.querySelector('#ar-speed-slide');
        
        // Record Logic
        recBtn.onmousedown = recBtn.ontouchstart = (e) => {
            e.preventDefault();
            this.chunks = [];
            this.video.src = "";
            this.video.srcObject = this.stream;
            this.video.play();
            
            this.recorder = new MediaRecorder(this.stream);
            this.recorder.ondataavailable = (ev) => this.chunks.push(ev.data);
            this.recorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'video/mp4' });
                this.video.srcObject = null;
                this.video.src = URL.createObjectURL(blob);
                this.video.loop = true;
                this.video.playbackRate = parseFloat(slider.value);
                this.video.play();
                this.log("Playback Mode");
            };
            this.recorder.start();
            this.log("Recording...");
        };

        recBtn.onmouseup = recBtn.ontouchend = () => {
            if (this.recorder && this.recorder.state === "recording") {
                this.recorder.stop();
            }
        };

        slider.oninput = (e) => {
            const val = e.target.value;
            ui.querySelector('#ar-speed-num').innerText = val;
            if (this.video) this.video.playbackRate = parseFloat(val);
        };

        ui.querySelector('#ar-close-btn').onclick = () => this.stop();
    }

    stop() {
        this.isActive = false;
        document.body.classList.remove('ar-active');
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
        if (this.video) this.video.remove();
        if (this.debugLog) this.debugLog.remove();
        const ui = document.getElementById('ar-ui-layer');
        if (ui) ui.remove();
    }
}
