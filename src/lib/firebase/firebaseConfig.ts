// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Firebase services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJC4h7x_2OxZHrXwM2OOEqmbo4S3klg9g",
  authDomain: "zettel-c6dc8.firebaseapp.com",
  projectId: "zettel-c6dc8",
  storageBucket: "zettel-c6dc8.firebasestorage.app",
  messagingSenderId: "235471209462",
  appId: "1:235471209462:web:29e5f27f44a597c9edbdd7",
  measurementId: "G-T2D8SVCPDM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Service instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- Connect to Emulators in Development ---
// Check if we are in a development environment
/*if (import.meta.env.DEV) {
  console.log('Connecting to Firebase Emulators...');
  // Use the standard localhost address and default emulator ports
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'http://localhost', 8080);
    connectStorageEmulator(storage, 'http://localhost', 9199);
    console.log('Emulator connection successful.');
  } catch (error) {
    console.error('Failed to connect to Firebase Emulators:', error);
  }

}*/
