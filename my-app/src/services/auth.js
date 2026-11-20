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
  onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncUserProfile, updateUserProfile } from './userData';

const USER_SESSION_KEY = '@user_session';

/**
 * Mendapatkan sesi user yang tersimpan di storage lokal.
 */
export async function getSavedUser() {
  try {
    if (!isFirebaseConfigured) {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      return null;
    }

    await new Promise((resolve, reject) => {
      let unsubscribe;
      unsubscribe = onAuthStateChanged(
        auth,
        () => {
          unsubscribe?.();
          resolve();
        },
        (error) => {
          unsubscribe?.();
          reject(error);
        },
      );
    });

    const user = auth.currentUser;
    if (!user) {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      return null;
    }

    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'Tamu',
      photoURL: user.photoURL,
      isGuest: user.isAnonymous,
    };
    try {
      const syncedUser = await syncUserProfile(userData);
      await saveUserSession(syncedUser);
      return syncedUser;
    } catch (syncError) {
      console.warn('Gagal menyinkronkan profil pengguna:', syncError);
      await saveUserSession(userData);
      return { ...userData, syncError: 'Profil belum dapat disinkronkan.' };
    }
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
      const sessionUser = Object.fromEntries(
        [
          'uid',
          'email',
          'name',
          'photoURL',
          'isGuest',
          'school',
          'grade',
          'points',
          'lifetimePoints',
          'quizCount',
          'rewardedActivities',
          'unlockedStories',
        ]
          .filter((key) => userData[key] !== undefined)
          .map((key) => [key, userData[key]]),
      );
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
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

  if (!isFirebaseConfigured) {
    return { success: false, error: 'Layanan autentikasi belum dikonfigurasi.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      isGuest: false,
    };
    const session = await createUserSession(userData);
    return { success: true, ...session };
  } catch (error) {
    return { success: false, error: formatAuthError(error.code) };
  }
}

/**
 * Registrasi Akun Baru (Buat Akun).
 */
export async function registerWithEmail(name, email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!isFirebaseConfigured) {
    return { success: false, error: 'Layanan autentikasi belum dikonfigurasi.' };
  }

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
    const session = await createUserSession(userData);
    return { success: true, ...session };
  } catch (error) {
    return { success: false, error: formatAuthError(error.code) };
  }
}

/**
 * Masuk sebagai Tamu (Guest Mode).
 */
export async function loginAsGuest() {
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Layanan autentikasi belum dikonfigurasi.' };
  }

  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    const userData = {
      uid: user.uid,
      email: null,
      name: 'Tamu',
      isGuest: true,
    };
    const session = await createUserSession(userData);
    return { success: true, ...session };
  } catch (error) {
    return { success: false, error: formatAuthError(error.code) };
  }
}

/**
 * Login dengan Akun Google (Google Sign-In).
 */
export async function loginWithGoogleCredential(idToken, userInfo = null) {
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Layanan autentikasi belum dikonfigurasi.' };
  }
  if (!idToken) {
    return { success: false, error: 'Google tidak mengembalikan token autentikasi.' };
  }

  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    const name =
      user.displayName ||
      userInfo?.name ||
      user.email?.split('@')[0] ||
      'Pengguna Google';
    const photoURL = userInfo?.picture || user.photoURL || null;
    if (user.displayName !== name || user.photoURL !== photoURL) {
      await updateProfile(user, { displayName: name, photoURL });
    }
    const userData = {
      uid: user.uid,
      email: user.email,
      name,
      photoURL,
      isGuest: false,
    };
    const session = await createUserSession(userData);
    return { success: true, ...session };
  } catch (error) {
    return { success: false, error: formatAuthError(error.code) };
  }
}

export async function getGoogleUserInfo(accessToken) {
  if (!accessToken) return null;
  try {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Google profile request failed (${response.status}).`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Gagal mengambil profil Google:', error);
    return null;
  }
}

export async function saveAuthenticatedProfile(profile) {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'Sesi pengguna telah berakhir. Silakan masuk kembali.' };
  }

  const name = profile.name.trim();
  if (!name) {
    return { success: false, error: 'Nama tidak boleh kosong.' };
  }

  try {
    await updateProfile(user, { displayName: name });
    const updatedProfile = await updateUserProfile(user.uid, {
      ...profile,
      name,
    });
    const userData = {
      uid: user.uid,
      email: user.email,
      name,
      photoURL: user.photoURL,
      isGuest: user.isAnonymous,
      ...updatedProfile,
    };
    await saveUserSession(userData);
    return { success: true, user: userData };
  } catch (error) {
    console.warn('Gagal menyimpan perubahan profil:', error);
    const message = error.code?.startsWith('auth/')
      ? formatAuthError(error.code)
      : error.message || 'Periksa koneksi internet lalu coba lagi.';
    return { success: false, error: message };
  }
}

/**
 * Lupa Kata Sandi (Kirim email reset).
 */
export async function resetPassword(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (!isFirebaseConfigured) {
    return { success: false, error: 'Layanan autentikasi belum dikonfigurasi.' };
  }
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (error) {
    return { success: false, error: formatAuthError(error.code) };
  }
}

/**
 * Keluar / Logout.
 */
export async function logoutUser() {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (error) {
      return { success: false, error: formatAuthError(error.code) };
    }
  }
  await saveUserSession(null);
  return { success: true };
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
    case 'auth/operation-not-allowed':
      return 'Metode masuk ini belum diaktifkan di Firebase Authentication.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Konfigurasi Firebase tidak valid. Periksa Firebase Console.';
    case 'auth/app-not-authorized':
      return 'Aplikasi ini belum diizinkan di Firebase Console.';
    case 'auth/unauthorized-domain':
      return 'Domain aplikasi belum diizinkan untuk autentikasi Firebase.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.';
    default:
      return 'Terjadi kesalahan autentikasi. Silakan coba lagi.';
  }
}

async function createUserSession(userData) {
  let syncedUser = userData;
  let syncError;
  try {
    syncedUser = await syncUserProfile(userData);
  } catch (error) {
    console.warn('Gagal menyinkronkan profil pengguna:', error);
    syncError = 'Profil belum dapat disinkronkan ke database.';
  }
  await saveUserSession(syncedUser);
  return { user: syncedUser, syncError };
}
