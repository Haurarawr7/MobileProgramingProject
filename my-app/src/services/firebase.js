import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti nilai berikut dengan firebaseConfig dari Firebase Console Anda
// (Project Settings > General > Your apps > Web app </>):
const firebaseConfig = {
  apiKey: "AIzaSyCwJjSDF69GxVWpCm1yLhJqS6bxf0pw0r4",
  authDomain: "logiterm-mobile.firebaseapp.com",
  projectId: "logiterm-mobile",
  storageBucket: "logiterm-mobile.firebasestorage.app",
  messagingSenderId: "1004261741417",
  appId: "1:1004261741417:web:170236b1d6eb320878e3f8",
  measurementId: "G-Z2VEJRVC5H"
};

export const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'AIzaSyCwJjSDF69GxVWpCm1yLhJqS6bxf0pw0r4' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'logiterm-mobile';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };

