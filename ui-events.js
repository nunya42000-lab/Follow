// ui-events.js

/**
 * Displays a temporary notification at the top of the screen.
 * @param {string} message - The text to display.
 */
export function initGlobalListeners(handlers) {
    // 1. Unified Click Listener (Event Delegation)
    document.addEventListener('click', (e) => {
        // Handle data-action buttons
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            if (handlers[action]) {
                handlers[action](actionBtn);
            }
            return;
        }

        // Handle number pad / value buttons
        const valueBtn = e.target.closest('[data-value]');
        if (valueBtn) {
            const value = valueBtn.dataset.value;
            if (handlers.onInput) {
                handlers.onInput(value);
            }
            return;
        }
    });

    // 2. Specialized Keydown Listeners (for keyboard support)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && handlers.backspace) {
            handlers.backspace();
        } else if (e.key === 'Escape' && handlers.closeModals) {
            handlers.closeModals();
        }
    });

    // 3. Prevent default zoom/scroll behaviors on specific UI elements
    const controlRows = document.querySelectorAll('.control-row');
    controlRows.forEach(row => {
        row.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) e.preventDefault();
        }, {
            passive: false
        });
    });

    // 4. Hard Reboot / Refresh Logic
    const footerTrigger = document.querySelector('footer');
    if (footerTrigger) {
        let lastClick = 0;
        footerTrigger.addEventListener('click', (e) => {
            // Secret double-tap on footer to force reload if things get stuck
            const now = Date.now();
            if (now - lastClick < 300) {
                if (confirm("Force refresh application?")) {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(regs => {
                            for (let reg of regs) reg.unregister();
                        });
                    }
                    window.location.reload(true);
                }
            }
            lastClick = now;
        });
    }
}
