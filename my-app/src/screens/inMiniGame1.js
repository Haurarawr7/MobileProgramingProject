// src/services/activity.js
// Struktur: users/{uid}/activity/{YYYY-MM-DD}
import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { toKey } from '../utils/streak';

async function getUid() {
  await auth.authStateReady();
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser.uid;
}

// Panggil setiap kali user belajar (mulai materi, selesai kuis, dll.).
// Aman dipanggil berkali-kali di hari yang sama.
export async function markActiveToday() {
  const uid = await getUid();
  const key = toKey(new Date());
  await setDoc(
    doc(db, 'users', uid, 'activity', key),
    { date: key, at: serverTimestamp() },
    { merge: true },
  );
  return key;
}

// Return array 'YYYY-MM-DD' semua hari yang user belajar
export async function getActiveDays() {
  const uid = await getUid();
  const snap = await getDocs(collection(db, 'users', uid, 'activity'));
  return snap.docs.map((d) => d.id);
}