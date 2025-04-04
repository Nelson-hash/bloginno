// src/lib/firebase.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Votre configuration Firebase 
// Vous obtiendrez ces détails en créant un projet sur console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyD69_TDft60cMyzR-OKi5PDbfl7lleWFTo",
  authDomain: "blog-inno-6b0d5.firebaseapp.com",
  projectId: "blog-inno-6b0d5",
  storageBucket: "blog-inno-6b0d5.firebasestorage.app",
  messagingSenderId: "660524798508",
  appId: "1:660524798508:web:15660ec9487f9f56257789",
  measurementId: "G-GN0MZ5C2BL"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Créer et exporter les services Firebase
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
