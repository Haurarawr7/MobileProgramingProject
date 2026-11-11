import { auth, isFirebaseConfigured } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_SESSION_KEY = '@user_session';

/**
 * Mendapatkan sesi user yang tersimpan di storage lokal.
 */
export async function getSavedUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Gagal membaca sesi pengguna:', err);
    return null;
  }
}

/**
 * Menyimpan sesi user ke storage lokal.
 */
export async function saveUserSession(userData) {
  try {
    if (userData) {
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
    } else {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (err) {
    console.warn('Gagal menyimpan sesi pengguna:', err);
  }
}

/**
 * Login dengan Email & Password.
 */
export async function loginWithEmail(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        isGuest: false,
      };
      await saveUserSession(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: formatAuthError(error.code) };
    }
  }

  // Fallback mode lokal jika Firebase belum dikonfigurasi
  const localUser = {
    uid: 'local_user_' + Date.now(),
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    isGuest: false,
  };
  await saveUserSession(localUser);
  return { success: true, user: localUser };
}

/**
 * Registrasi Akun Baru (Buat Akun).
 */
export async function registerWithEmail(name, email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (isFirebaseConfigured) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      if (cleanName) {
        await updateProfile(user, { displayName: cleanName });
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        name: cleanName || user.email.split('@')[0],
        isGuest: false,
      };
      await saveUserSession(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: formatAuthError(error.code) };
    }
  }

  // Fallback mode lokal jika Firebase belum dikonfigurasi
  const localUser = {
    uid: 'local_user_' + Date.now(),
    email: cleanEmail,
    name: cleanName || cleanEmail.split('@')[0],
    isGuest: false,
  };
  await saveUserSession(localUser);
  return { success: true, user: localUser };
}

/**
 * Masuk sebagai Tamu (Guest Mode).
 */
export async function loginAsGuest() {
  if (isFirebaseConfigured) {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      const userData = {
        uid: user.uid,
        email: null,
        name: 'Tamu',
        isGuest: true,
      };
      await saveUserSession(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.warn('Anonymous login error:', error);
    }
  }

  const guestUser = {
    uid: 'guest_' + Math.random().toString(36).substring(2, 9),
    email: null,
    name: 'Tamu',
    isGuest: true,
  };
  await saveUserSession(guestUser);
  return { success: true, user: guestUser };
}

/**
 * Login dengan Akun Google (Google Sign-In).
 */
export async function loginWithGoogleCredential(idToken, userInfo = null) {
  if (isFirebaseConfigured && idToken) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || userInfo?.name || user.email?.split('@')[0] || 'Pengguna Google',
        photoURL: user.photoURL || userInfo?.picture,
        isGuest: false,
      };
      await saveUserSession(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.warn('Firebase Google Sign-In error:', error);
      return { success: false, error: formatAuthError(error.code) };
    }
  }

  // Fallback jika belum memasukkan idToken atau Firebase belum dikonfigurasi
  const localGoogleUser = {
    uid: 'google_user_' + Date.now(),
    email: userInfo?.email || 'user.google@gmail.com',
    name: userInfo?.name || 'Siswa Google',
    photoURL: userInfo?.picture || null,
    isGuest: false,
  };
  await saveUserSession(localGoogleUser);
  return { success: true, user: localGoogleUser };
}

/**
 * Lupa Kata Sandi (Kirim email reset).
 */
export async function resetPassword(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (isFirebaseConfigured) {
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (error) {
      return { success: false, error: formatAuthError(error.code) };
    }
  }
  return { success: true, message: 'Tautan reset sandi telah disimulasikan.' };
}

/**
 * Keluar / Logout.
 */
export async function logoutUser() {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
  }
  await saveUserSession(null);
}

/**
 * Terjemahan pesan error Firebase ke Bahasa Indonesia yang ramah.
 */
function formatAuthError(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini tidak ditemukan.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi yang Anda masukkan salah.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.';
    default:
      return 'Terjadi kesalahan autentikasi. Silakan coba lagi.';
  }
}

