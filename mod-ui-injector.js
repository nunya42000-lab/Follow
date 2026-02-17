// ==========================================
// mod-ui-injector.js - Dynamic UI Generation
// ==========================================

window.geminiMods = window.geminiMods || {};

// 1. Inject Required CSS dynamically
function injectStyles() {
    const css = `
        /* Dev Modal Styles */
        #gemini-dev-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; justify-content: center; align-items: center; font-family: sans-serif; }
        #gemini-dev-modal.hidden { display: none; }
        .gemini-modal-content { background: #222; color: #fff; width: 90%; max-width: 500px; height: 85%; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; }
        .gemini-modal-header { padding: 15px; background: #333; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; }
        .gemini-close-btn { background: red; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
        .gemini-tabs { display: flex; background: #2a2a2a; }
        .gemini-tab-btn { flex: 1; padding: 10px; background: none; border: none; color: #aaa; cursor: pointer; border-bottom: 2px solid transparent; }
        .gemini-tab-btn.active { color: #fff; border-bottom: 2px solid #00FF00; }
        .gemini-tab-pane { display: none; padding: 15px; overflow-y: auto; flex: 1; }
        .gemini-tab-pane.active { display: block; }
        
        /* Toggle Styles */
        .gemini-toggle-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #444; }
        
        /* Help Accordion Styles */
        .gemini-accordion-item { border-bottom: 1px solid #444; margin-bottom: 5px; }
        .gemini-accordion-header { width: 100%; text-align: left; background: #333; color: #fff; border: none; padding: 12px; font-size: 16px; display: flex; justify-content: space-between; cursor: pointer; }
        .gemini-accordion-content { display: none; padding: 10px; color: #ccc; line-height: 1.4; background: #2a2a2a; }
        .gemini-accordion-content.open { display: block; }
    `;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
}

// 2. Build the Developer Modal HTML
function injectDevModal() {
    if (document.getElementById('gemini-dev-modal')) return;

    const modalHTML = `
        <div id="gemini-dev-modal" class="hidden">
            <div class="gemini-modal-content">
                <div class="gemini-modal-header">
                    <h3 style="margin:0;">Developer Options</h3>
                    <button id="gemini-close-modal" class="gemini-close-btn">X</button>
                </div>
                <div class="gemini-tabs">
                    <button class="gemini-tab-btn active" data-target="gemini-tab-settings">Settings</button>
                    <button class="gemini-tab-btn" data-target="gemini-tab-touch">Touch Test</button>
                    <button class="gemini-tab-btn" data-target="gemini-tab-ar">AR Lab</button>
                </div>
                <div id="gemini-tab-settings" class="gemini-tab-pane active">
                    <h4 style="margin-top:0;">Master Gesture Toggles</h4>
                    <div id="gemini-toggles-container"></div>
                    <hr style="border-color:#444;">
                    <button id="btn-nuke-data" style="width:100%; padding:10px; background:#aa0000; color:#fff; border:none; border-radius:5px;">☢️ RESET ALL DATA</button>
                </div>
                <div id="gemini-tab-touch" class="gemini-tab-pane">
                    <h4>Touch Engine Debugger</h4>
                    <div id="touch-debug-log" style="background:#000; padding:10px; font-family:monospace; color:#0f0;">Waiting for input...</div>
                </div>
                <div id="gemini-tab-ar" class="gemini-tab-pane">
                    <div id="ar-lab-container">AR Media & Test Lab Loading...</div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Bind Close Button & Tabs
    document.getElementById('gemini-close-modal').addEventListener('click', () => {
        document.getElementById('gemini-dev-modal').classList.add('hidden');
    });

    document.querySelectorAll('.gemini-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.gemini-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.gemini-tab-pane').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.getAttribute('data-target')).classList.add('active');
        });
    });

    document.getElementById('btn-nuke-data').addEventListener('click', () => {
        if(confirm("Wipe all data and profiles?")) {
            localStorage.clear();
            window.location.reload();
        }
    });
}

// 3. Render Master Toggles & Populate Dropdowns
function renderMasterToggles() {
    const container = document.getElementById('gemini-toggles-container');
    if (!container) return;
    container.innerHTML = '';

    const groups = window.geminiMods.gestureGroups;
    
    for (const [key, data] of Object.entries(groups)) {
        // Get state from storage or default
        let isEnabled = localStorage.getItem(`group_${key}`);
        isEnabled = isEnabled !== null ? isEnabled === 'true' : data.defaultOn;

        const row = document.createElement('div');
        row.className = 'gemini-toggle-row';
        row.innerHTML = `
            <span>${data.label}</span>
            <input type="checkbox" class="gemini-group-toggle" data-key="${key}" ${isEnabled ? 'checked' : ''}>
        `;
        container.appendChild(row);
    }

    // Bind change events
    document.querySelectorAll('.gemini-group-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            localStorage.setItem(`group_${e.target.dataset.key}`, e.target.checked);
            updateMappingDropdowns();
        });
    });
}

function updateMappingDropdowns() {
    let activeGestures = [];
    const groups = window.geminiMods.gestureGroups;

    // Build active whitelist
    for (const [key, data] of Object.entries(groups)) {
        let isEnabled = localStorage.getItem(`group_${key}`);
        isEnabled = isEnabled !== null ? isEnabled === 'true' : data.defaultOn;
        if (isEnabled) activeGestures = activeGestures.concat(data.gestures);
    }

    // Save active whitelist globally for Module 4 (The Engine)
    window.geminiMods.activeWhitelist = activeGestures;

    // Find all mapping dropdowns (Assumes you use standard <select> elements for mapping)
    // Adjust the selector '.mapping-select' if your selects have a different class
    document.querySelectorAll('select.mapping-select').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="none">-- Unmapped --</option>';

        activeGestures.forEach(gesture => {
            const opt = document.createElement('option');
            opt.value = gesture;
            opt.innerText = gesture.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            select.appendChild(opt);
        });

        if (activeGestures.includes(currentValue)) select.value = currentValue;
    });
}

// 4. Inject Dynamic Help Section
function injectHelpSection() {
    // Looks for an existing container. If you don't have one, it will append to the body (hidden)
    let container = document.getElementById('gemini-help-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'gemini-help-container';
        document.body.appendChild(container); // You can manually move this to your Help menu
    }

    const isDev = localStorage.getItem('developer_mode') === 'true';
    const helpData = window.geminiMods.helpDictionary;
    let html = `<h2>Gestures Guide</h2>`;

    const buildCategory = (title, items) => {
        let catHtml = `<h3>${title}</h3>`;
        items.forEach(item => {
            if (item.devOnly && !isDev) return;
            const icon = item.devOnly ? '🛠️ ' : '';
            catHtml += `
                <div class="gemini-accordion-item">
                    <button class="gemini-accordion-header">${icon}${item.title} <span>+</span></button>
                    <div class="gemini-accordion-content">${item.content}</div>
                </div>
            `;
        });
        return catHtml;
    };

    html += buildCategory("Touch Gestures", helpData.touch);
    html += buildCategory("Hand Tracking", helpData.hand);
    
    container.innerHTML = html;

    // Bind Accordion Logic
    container.querySelectorAll('.gemini-accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isOpen = content.classList.contains('open');
            container.querySelectorAll('.gemini-accordion-content').forEach(c => c.classList.remove('open'));
            container.querySelectorAll('.gemini-accordion-header span').forEach(s => s.innerText = '+');
            
            if (!isOpen) {
                content.classList.add('open');
                this.querySelector('span').innerText = '−';
            }
        });
    });
}

// Global hook to open modal
window.openDevModal = () => {
    document.getElementById('gemini-dev-modal').classList.remove('hidden');
};

// Initialize Everything
window.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    injectDevModal();
    renderMasterToggles();
    updateMappingDropdowns();
    injectHelpSection();
});
