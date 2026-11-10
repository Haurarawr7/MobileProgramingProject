import { auth, db, isFirebaseConfigured } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_LAST_OPENED = '@last_opened_materi';
const STORAGE_KEY_FALLBACK_UID = '@local_user_uid';

/**
 * Mendapatkan UID user.
 * Menggunakan Firebase Anonymous Auth jika user belum login.
 * Jika Firebase belum dikonfigurasi / gagal, menggunakan ID fallback lokal.
 */
export async function getUid() {
  if (!isFirebaseConfigured) {
    let localUid = await AsyncStorage.getItem(STORAGE_KEY_FALLBACK_UID);
    if (!localUid) {
      localUid = 'local_' + Math.random().toString(36).substring(2, 10);
      await AsyncStorage.setItem(STORAGE_KEY_FALLBACK_UID, localUid);
    }
    return localUid;
  }

  try {
    if (auth.currentUser) {
      return auth.currentUser.uid;
    }
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch (error) {
    console.warn('Anonymous auth gagal atau belum disiapkan:', error?.message);
    let localUid = await AsyncStorage.getItem(STORAGE_KEY_FALLBACK_UID);
    if (!localUid) {
      localUid = 'local_' + Math.random().toString(36).substring(2, 10);
      await AsyncStorage.setItem(STORAGE_KEY_FALLBACK_UID, localUid);
    }
    return localUid;
  }
}

/**
 * Mendapatkan materi terakhir yang dibuka dan progresnya.
 * Mengembalikan objek { materiId, progress } atau null jika belum ada.
 */
export async function getLastOpened() {
  // 1. Coba ambil dari Firestore jika terhubung
  if (isFirebaseConfigured) {
    try {
      const uid = await getUid();
      if (uid && !uid.startsWith('local_')) {
        const q = query(
          collection(db, 'users', uid, 'progress'),
          orderBy('lastOpenedAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          const result = {
            materiId: docData.materiId,
            progress: typeof docData.progress === 'number' ? docData.progress : 0,
          };
          // Sinkronkan ke local storage
          await AsyncStorage.setItem(STORAGE_KEY_LAST_OPENED, JSON.stringify(result));
          return result;
        }
      }
    } catch (err) {
      console.warn('Gagal membaca progress dari Firestore, fallback ke local storage:', err?.message);
    }
  }

  // 2. Fallback ke AsyncStorage (offline / Firebase belum diisi)
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LAST_OPENED);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Gagal membaca local storage:', err);
  }

  return null;
}

/**
 * Menyimpan materi yang baru dibuka / ditekan "Mulai belajar".
 */
export async function saveOpened(materiId) {
  const dataToSave = { materiId, progress: 0 };

  // Simpan ke local storage selalu untuk offline support
  try {
    const existingRaw = await AsyncStorage.getItem(STORAGE_KEY_LAST_OPENED);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      if (existing.materiId === materiId) {
        dataToSave.progress = existing.progress ?? 0;
      }
    }
    await AsyncStorage.setItem(STORAGE_KEY_LAST_OPENED, JSON.stringify(dataToSave));
  } catch (e) {
    // abaikan kesalahan storage lokal
  }

  // Simpan ke Firestore
  if (isFirebaseConfigured) {
    try {
      const uid = await getUid();
      if (uid && !uid.startsWith('local_')) {
        const docRef = doc(db, 'users', uid, 'progress', materiId);
        await setDoc(
          docRef,
          {
            materiId,
            lastOpenedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Gagal menyimpan materi dibuka ke Firestore:', err?.message);
    }
  }
}

/**
 * Menyimpan progres belajar materi (nilai 0 sampai 1).
 */
export async function saveProgress(materiId, progress) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY_LAST_OPENED,
      JSON.stringify({ materiId, progress })
    );
  } catch (e) {
    // abaikan kesalahan storage lokal
  }

  if (isFirebaseConfigured) {
    try {
      const uid = await getUid();
      if (uid && !uid.startsWith('local_')) {
        const docRef = doc(db, 'users', uid, 'progress', materiId);
        await setDoc(
          docRef,
          {
            materiId,
            progress,
            lastOpenedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Gagal menyimpan progres ke Firestore:', err?.message);
    }
  }
}

