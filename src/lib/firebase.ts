// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "chatterjet",
  "appId": "1:96030490593:web:6c298220502f6bac3a1ca0",
  "storageBucket": "chatterjet.firebasestorage.app",
  "apiKey": "AIzaSyBlRjjrp4euW80h8K4iy3Gd6kLqpLBQDxo",
  "authDomain": "chatterjet.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "96030490593"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export { app, firestore };
