// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Klien-sisi Firebase Config
const firebaseConfig: FirebaseOptions = {
  "projectId": "chatterjet",
  "appId": "1:96030490593:web:6c298220502f6bac3a1ca0",
  "storageBucket": "chatterjet.firebasestorage.app",
  "apiKey": "AIzaSyBlRjjrp4euW80h8K4iy3Gd6kLqpLBQDxo",
  "authDomain": "chatterjet.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "96030490593"
};

// --- Inisialisasi Klien-sisi ---
// Inisialisasi Firebase untuk sisi klien (browser)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

// --- Inisialisasi Admin SDK (Hanya Sisi Server) ---
let adminInstance: import('firebase-admin').app.App | undefined;

function getAdminApp() {
    if (typeof window !== 'undefined') {
        // Jangan pernah menjalankan ini di klien
        return null;
    }
    
    if (adminInstance) {
        return adminInstance;
    }

    const admin = require('firebase-admin');
    
    if (admin.apps.length > 0) {
        adminInstance = admin.app();
        return adminInstance;
    }
    
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY variabel lingkungan tidak diatur. Diperlukan untuk Admin SDK.');
    }

    try {
        const credentials = JSON.parse(serviceAccount);
        adminInstance = admin.initializeApp({
            credential: admin.credential.cert(credentials),
            projectId: firebaseConfig.projectId,
        });
        return adminInstance;
    } catch (error) {
        console.error('Gagal mem-parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
        throw new Error('Kredensial akun layanan Firebase tidak valid.');
    }
}


function getAdminFirestore() {
    const adminApp = getAdminApp();
    if (!adminApp) {
        throw new Error('Firebase Admin SDK tidak dapat diinisialisasi di klien.');
    }
    return adminApp.firestore();
}

export { app, firestore, getAdminFirestore };
