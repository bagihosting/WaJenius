// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import admin from 'firebase-admin';

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

// --- Inisialisasi Admin SDK ---
// Inisialisasi Firebase Admin untuk sisi server (backend)
function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    // Memerlukan variabel lingkungan untuk otentikasi
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY variabel lingkungan tidak diatur. Diperlukan untuk Admin SDK.');
    }

    try {
        const credentials = JSON.parse(serviceAccount);
        return admin.initializeApp({
            credential: admin.credential.cert(credentials),
            projectId: firebaseConfig.projectId,
        });
    } catch (error) {
        console.error('Gagal mem-parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
        throw new Error('Kredensial akun layanan Firebase tidak valid.');
    }
}

function getAdminFirestore() {
    return getAdminApp().firestore();
}

export { app, firestore, getAdminFirestore };
