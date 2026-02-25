// ui-controller.js
import { showToast } from './ui-core.js';
import { applyDeveloperVisibility, updateDynamicIncrements, simulateSequence } from './app.js';

export function initUIController() {
    // Utility to toggle modal visibility with animations
    const toggleModal = (id, show = true) => {
        const modal = document.getElementById(id);
        if (!modal) return;
        
        if (show) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            const inner = modal.querySelector('.transform');
            if (inner) {
                inner.classList.remove('scale-90', 'scale-95');
                inner.classList.add('scale-100');
            }
        } else {
            modal.classList.add('opacity-0', 'pointer-events-none');
            const inner = modal.querySelector('.transform');
            if (inner) {
                inner.classList.add('scale-90');
                inner.classList.remove('scale-100');
            }
        }
    };

    // --- Main Setup Modal ---
    document.getElementById('close-game-setup-modal')?.addEventListener('click', () => toggleModal('game-setup-modal', false));

    // --- Settings Modal ---
    document.getElementById('quick-open-settings')?.addEventListener('click', () => toggleModal('settings-modal', true));
    document.getElementById('close-settings')?.addEventListener('click', () => toggleModal('settings-modal', false));
    document.getElementById('save-settings-btn')?.addEventListener('click', () => {
        toggleModal('settings-modal', false);
        showToast("Settings Applied");
    });

    // --- Help Modal ---
    document.getElementById('quick-open-help')?.addEventListener('click', () => toggleModal('help-modal', true));
    document.getElementById('close-help-btn')?.addEventListener('click', () => toggleModal('help-modal', false));
    document.getElementById('close-help-btn-bottom')?.addEventListener('click', () => toggleModal('help-modal', false));

    // --- Developer Modal: Tab & Swipe Logic ---
    const devTabs = ['options', 'touch', 'hand'];
    let currentDevTabIndex = 0;

    const switchDevTab = (index) => {
        if (index < 0 || index >= devTabs.length) return;
        currentDevTabIndex = index;
        const target = devTabs[index];

        // Update Tab Buttons
        document.querySelectorAll('.dev-tab-btn').forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active-tab-style');
                btn.classList.remove('inactive-tab-style');
            } else {
                btn.classList.remove('active-tab-style');
                btn.classList.add('inactive-tab-style');
            }
        });

        // Update Content Visibility
        document.querySelectorAll('.dev-tab-content').forEach(content => content.classList.add('hidden'));
        document.getElementById(`dev-tab-${target}`)?.classList.remove('hidden');
    };

    // Tab Button Clicks
    document.querySelectorAll('.dev-tab-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => switchDevTab(index));
    });

    // Swipe Detection for Developer Modal
    const devModalContent = document.querySelector('#developer-modal .flex-grow');
    let touchStartX = 0;
    let touchEndX = 0;

    devModalContent?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    devModalContent?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleDevSwipe();
    }, { passive: true });

    const handleDevSwipe = () => {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped Left -> Next Tab
            switchDevTab(currentDevTabIndex + 1);
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped Right -> Previous Tab
            switchDevTab(currentDevTabIndex - 1);
        }
    };

    // Close Developer Modal
    document.getElementById('close-developer-modal')?.addEventListener('click', () => toggleModal('developer-modal', false));

    // Simulation Buttons (Developer Tools)
    document.querySelectorAll('.sim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            simulateSequence(action);
        });
    });

    // --- Calibration & Theme ---
    document.getElementById('open-calibration')?.addEventListener('click', () => toggleModal('calibration-modal', true));
    document.getElementById('close-calibration-btn')?.addEventListener('click', () => toggleModal('calibration-modal', false));
    document.getElementById('open-theme-editor')?.addEventListener('click', () => toggleModal('theme-editor-modal', true));
    document.getElementById('cancel-theme-btn')?.addEventListener('click', () => toggleModal('theme-editor-modal', false));

    // --- Comment/Feedback Modal ---
    document.getElementById('close-comment-modal')?.addEventListener('click', () => {
        document.getElementById('comment-modal').classList.add('hidden', 'opacity-0', 'pointer-events-none');
    });

    // Initialize Visibility and Increments on Start
    applyDeveloperVisibility();
    updateDynamicIncrements();
}
