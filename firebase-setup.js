// firebase-setup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4", 
    authDomain: "follow-me-app-de3e9.firebaseapp.com", 
    projectId: "follow-me-app-de3e9", 
    storageBucket: "follow-me-app-de3e9.firebasestorage.app", 
    messagingSenderId: "957006680126", 
    appId: "1:957006680126:web:6d679717d9277fd9ae816f" 
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- ENABLE OFFLINE PERSISTENCE ---
export function initOfflinePersistence() {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one.');
        } else if (err.code == 'unimplemented') {
            console.warn('Browser does not support persistence');
        }
    });
}

// Auto-initialize when imported
initOfflinePersistence();
