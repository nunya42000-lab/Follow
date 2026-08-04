(function(){
    // Autorotate/Settings wiring fix
    // This script attempts to unify the auto-rotate settings toggle and the header auto-rotate button
    // It will run after load and patch behaviors at runtime so the settings toggle reliably shows/hides
    // the header button and the header button controls the actual rotation via toggleAppRotation.

    function safeGet(obj, path) {
        return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined) ? acc[k] : null, obj);
    }

    function init() {
        const doc = document;
        const settingsToggle = doc.getElementById('autoRotateToggle') || doc.getElementById('settingsAutoRotateToggle') || safeGet(window, 'modules.settings.dom.autoRotateToggle') || safeGet(window, 'modules.settings?.dom?.autoRotateToggle');
        const headerBtn = doc.getElementById('headerautorotatebtn') || doc.getElementById('headerAutoRotateBtn') || safeGet(window, 'modules.settings.dom.headerAutoRotateBtn');

        if (!settingsToggle && !headerBtn) {
            // Nothing to do
            return;
        }

        const getSetting = () => {
            try {
                if (window.appSettings && typeof window.appSettings.showAutoRotateBtn !== 'undefined') return !!window.appSettings.showAutoRotateBtn;
                if (window.appSettings && window.appSettings.runtimeSettings && typeof window.appSettings.runtimeSettings.showAutoRotateBtn !== 'undefined') return !!window.appSettings.runtimeSettings.showAutoRotateBtn;
            } catch (e) {}
            return false;
        };
        const setSetting = (v) => {
            try {
                if (!window.appSettings) window.appSettings = {};
                window.appSettings.showAutoRotateBtn = v;
                if (!window.appSettings.runtimeSettings) window.appSettings.runtimeSettings = {};
                window.appSettings.runtimeSettings.showAutoRotateBtn = v;
                if (typeof saveState === 'function') saveState();
            } catch (e) { console.warn('setSetting failed', e); }
        };

        const updateHeaderVisibility = (visible) => {
            if (!headerBtn) return;
            if (visible) headerBtn.classList.remove('hidden');
            else headerBtn.classList.add('hidden');
        };

        // Wire settings toggle -> header visibility and persistence
        if (settingsToggle) {
            try {
                settingsToggle.checked = !!getSetting();
            } catch (e) {}
            settingsToggle.addEventListener('change', (e) => {
                const enabled = !!e.target.checked;
                setSetting(enabled);
                updateHeaderVisibility(enabled);
                if (!enabled) {
                    // if disabling the toggle, also attempt to turn rotation off
                    try {
                        document.body.classList.remove('auto-rotate');
                        if (typeof toggleAppRotation === 'function') toggleAppRotation(false);
                    } catch (err) {}
                }
            });
        }

        // Ensure header button actually controls rotation (attach idempotent handler)
        if (headerBtn) {
            headerBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                try {
                    const willEnable = !document.body.classList.contains('auto-rotate');
                    if (willEnable) document.body.classList.add('auto-rotate'); else document.body.classList.remove('auto-rotate');
                    if (typeof toggleAppRotation === 'function') toggleAppRotation(willEnable);
                    // visual state
                    headerBtn.classList.toggle('ring-2', willEnable);
                    headerBtn.classList.toggle('ring-emerald-500', willEnable);
                    // persist that the header button is visible/enabled
                    if (willEnable) setSetting(true);
                } catch (err) {
                    console.warn('header autorotate click failed', err);
                }
            });

            // initialize visibility based on settings
            try { updateHeaderVisibility(!!getSetting()); } catch (e){}
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(init, 0); else window.addEventListener('DOMContentLoaded', init);
})();
