import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDt4gXNntFKS_-eZT-BrA_kfmXOunfHCMI",
    authDomain: "ledianspa-repare.firebaseapp.com",
    projectId: "ledianspa-repare",
    storageBucket: "ledianspa-repare.firebasestorage.app",
    messagingSenderId: "756531917932",
    appId: "1:756531917932:web:869c5bd94604f8796f9449",
    measurementId: "G-C3QDD7HF8N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);
