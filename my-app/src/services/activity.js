import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUid } from './progress';
import { toKey } from '../utils/streak';

const STORAGE_KEY_ACTIVITY = '@activity_days_cache';

/**
 * Mengambil daftar tanggal aktif belajar dari Firestore / AsyncStorage.
 * Mengembalikan array of string ['YYYY-MM-DD', ...]
 */
export async function getActiveDays() {
  if (isFirebaseConfigured) {
    try {
      const uid = await getUid();
      if (uid && !uid.startsWith('local_')) {
        const colRef = collection(db, 'users', uid, 'activity');
        const snapshot = await getDocs(colRef);
        const days = [];
        snapshot.forEach((d) => {
          days.push(d.id);
        });
        // Sinkronkan ke cache lokal
        await AsyncStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(days));
        return days;
      }
    } catch (err) {
      console.warn('Gagal memuat aktivitas dari Firestore, fallback ke lokal:', err?.message);
    }
  }

  // Fallback membaca dari penyimpanan lokal
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ACTIVITY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Gagal membaca cache aktivitas lokal:', err);
  }

  return [];
}

/**
 * Mencatat hari ini sebagai hari aktif belajar di Firestore / AsyncStorage.
 */
export async function markActiveToday() {
  const todayKey = toKey(new Date());

  // 1. Simpan di cache lokal selalu
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ACTIVITY);
    const days = raw ? JSON.parse(raw) : [];
    if (!days.includes(todayKey)) {
      days.push(todayKey);
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(days));
    }
  } catch (err) {
    console.warn('Gagal menyimpan aktivitas ke lokal:', err);
  }

  // 2. Simpan di Firestore jika terhubung
  if (isFirebaseConfigured) {
    try {
      const uid = await getUid();
      if (uid && !uid.startsWith('local_')) {
        const docRef = doc(db, 'users', uid, 'activity', todayKey);
        await setDoc(
          docRef,
          {
            date: todayKey,
            lastActiveAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Gagal menyimpan aktivitas ke Firestore:', err?.message);
    }
  }

  return todayKey;
}

