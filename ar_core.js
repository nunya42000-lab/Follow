class ARMode {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        this.isActive = false;
        this.video = null;
        this.mediaRecorder = null;
        this.chunks = [];
        this.currentVideoURL = null;
        this.playbackSpeed = 1.0;
    }

    async start() {
        this.isActive = true;
        
        // 1. Hide the rest of the PWA UI via CSS class
        document.body.classList.add('ar-active');

        // 2. Setup Video Element if it doesn't exist
        if (!this.video) {
            this.video = document.createElement('video');
            this.video.id = "ar-video-overlay";
            this.video.autoplay = true;
            this.video.playsInline = true;
            this.video.muted = true;
            document.body.appendChild(this.video);
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1280 } },
                audio: false 
            });
            this.video.srcObject = this.stream;
            this.createARControls(); // Create the REC/PAUSE/SAVE buttons
        } catch (e) {
            console.error("Camera denied:", e);
            this.stop();
        }
    }

    createARControls() {
        // Create a dedicated container for the camera UI
        const ui = document.createElement('div');
        ui.id = "ar-ui-layer";
        ui.innerHTML = `
            <div class="ar-speed-control">
                <span>Speed: <span id="ar-speed-val">1.0</span>x</span>
                <input type="range" id="ar-speed-slider" min="0.5" max="2.0" step="0.1" value="1.0">
            </div>
            <div class="ar-btns">
                <button id="ar-rec-btn">REC</button>
                <button id="ar-pause-btn" style="display:none;">PAUSE</button>
                <button id="ar-save-btn" style="display:none;">SAVE</button>
            </div>
        `;
        document.body.appendChild(ui);

        const recBtn = ui.querySelector('#ar-rec-btn');
        const pauseBtn = ui.querySelector('#ar-pause-btn');
        const saveBtn = ui.querySelector('#ar-save-btn');
        const slider = ui.querySelector('#ar-speed-slider');

        // Recording Logic
        const startRec = () => {
            if (this.currentVideoURL) URL.revokeObjectURL(this.currentVideoURL);
            this.chunks = [];
            this.video.srcObject = this.stream;
            this.video.muted = true;
            pauseBtn.style.display = 'none';
            saveBtn.style.display = 'none';

            this.mediaRecorder = new MediaRecorder(this.stream);
            this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'video/mp4' });
                this.currentVideoURL = URL.createObjectURL(blob);
                this.video.srcObject = null;
                this.video.src = this.currentVideoURL;
                this.video.playbackRate = this.playbackSpeed;
                this.video.play();
                pauseBtn.style.display = 'block';
                saveBtn.style.display = 'block';
            };
            this.mediaRecorder.start();
        };

        const stopRec = () => {
            if (this.mediaRecorder && this.mediaRecorder.state === "recording") this.mediaRecorder.stop();
        };

        // Event Listeners
        recBtn.addEventListener('mousedown', startRec);
        window.addEventListener('mouseup', (e) => { if(e.target === recBtn) stopRec(); });
        
        // Pause/Hold Logic
        pauseBtn.addEventListener('mousedown', () => this.video.pause());
        pauseBtn.addEventListener('mouseup', () => this.video.play());

        // Speed Logic
        slider.oninput = (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
            ui.querySelector('#ar-speed-val').innerText = this.playbackSpeed;
            this.video.playbackRate = this.playbackSpeed;
        };

        // Save Logic
        saveBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = this.currentVideoURL;
            a.download = `skill_analysis_${Date.now()}.mp4`;
            a.click();
        };
    }

    stop() {
        document.body.classList.remove('ar-active');
        if (this.stream) this.stream.getTracks().forEach(t => t.stop());
        if (this.video) this.video.remove();
        const ui = document.getElementById('ar-ui-layer');
        if (ui) ui.remove();
        this.isActive = false;
    }
}
