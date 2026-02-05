import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 1. Define the Config Type
const firebaseConfig = {
  apiKey: "AIzaSyAtaaZ7Li3P7IyRPtQVa8Axbp_VvMYpsO0",
  authDomain: "aresapp-tf404.firebaseapp.com",
  projectId: "aresapp-tf404",
  storageBucket: "aresapp-tf404.firebasestorage.app",
  messagingSenderId: "849148484453",
  appId: "1:849148484453:web:b751f79d73ff3350899f8c",
  measurementId: "G-PLCGS5274C"
};

// 2. Initialize App with Types
let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// 3. Initialize Firestore with the React Native Fix
// ADD THIS LINE
const db = getFirestore(app);

export { db };

