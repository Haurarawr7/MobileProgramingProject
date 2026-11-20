import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  addDays,
  getActiveStreakCount,
  getCurrentWeekDateKeys,
  toKey,
} from '../utils/streak';

const userDocument = (uid) => doc(db, 'users', uid);

function getStreakUpdate(account, today, date) {
  const lastActivityDate = account.lastActivityDate || null;
  const currentStreak = account.currentStreak || 0;
  const currentWeek = getCurrentWeekDateKeys();
  const streakDays = (account.streakDays || []).filter((day) =>
    currentWeek.includes(day),
  );

  if (!streakDays.includes(today)) streakDays.push(today);

  return {
    currentStreak:
      lastActivityDate === today
        ? Math.max(currentStreak, 1)
        : lastActivityDate === toKey(addDays(date, -1))
          ? currentStreak + 1
          : 1,
    lastActivityDate: today,
    streakDays,
  };
}

export async function syncUserProfile(user) {
  const ref = userDocument(user.uid);
  const snapshot = await getDoc(ref);
  const authProfile = {
    uid: user.uid,
    email: user.email || null,
    name: user.name || user.email?.split('@')[0] || 'Siswa',
    ...(user.photoURL ? { photoURL: user.photoURL } : {}),
    isGuest: Boolean(user.isGuest),
    updatedAt: serverTimestamp(),
  };

  if (!snapshot.exists()) {
    await setDoc(ref, {
      ...authProfile,
      photoURL: user.photoURL || null,
      school: '',
      grade: '',
      points: 0,
      quizCount: 0,
      currentStreak: 0,
      lastActivityDate: null,
      streakDays: [],
      rewardedActivities: [],
      unlockedStories: [],
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, authProfile, { merge: true });
  }

  const updatedSnapshot = await getDoc(ref);
  return { ...updatedSnapshot.data(), uid: user.uid };
}

export async function updateUserProfile(uid, profile) {
  const updatedProfile = {
    name: profile.name.trim(),
    school: profile.school.trim(),
    grade: profile.grade.trim(),
  };
  await setDoc(
    userDocument(uid),
    { ...updatedProfile, updatedAt: serverTimestamp() },
    { merge: true },
  );
  return updatedProfile;
}

export function subscribeUserData(uid, onUpdate, onError) {
  let profile = {};
  let progress = [];
  let activities = [];

  const publish = () => {
    const readingProgress = Object.fromEntries(
      progress.map((item) => [item.id, item.progress || 0]),
    );
    const completedMateri = progress
      .filter((item) => item.completed)
      .map((item) => item.id);
    const latestProgress = [...progress].sort(
      (first, second) =>
        (second.lastOpenedAt?.toMillis?.() || 0) -
        (first.lastOpenedAt?.toMillis?.() || 0),
    )[0];

    onUpdate({
      ...profile,
      currentStreak: getActiveStreakCount(
        profile.currentStreak,
        profile.lastActivityDate,
      ),
      readingProgress,
      completedMateri,
      activities,
      lastOpenedId: latestProgress?.id || null,
    });
  };

  const unsubscribeProfile = onSnapshot(
    userDocument(uid),
    (snapshot) => {
      profile = snapshot.exists() ? snapshot.data() : {};
      publish();
    },
    onError,
  );
  const unsubscribeProgress = onSnapshot(
    collection(db, 'users', uid, 'progress'),
    (snapshot) => {
      progress = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      publish();
    },
    onError,
  );
  const unsubscribeActivities = onSnapshot(
    collection(db, 'users', uid, 'activities'),
    (snapshot) => {
      activities = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort(
          (first, second) =>
            (second.createdAt?.toMillis?.() || 0) -
            (first.createdAt?.toMillis?.() || 0),
        )
        .slice(0, 10)
        .map((item) => ({
          id: item.id,
          icon: item.icon || 'sparkles-outline',
          title: item.title || 'Aktivitas belajar',
          subtitle: item.subtitle || '',
          time: item.createdAt?.toDate?.().toLocaleDateString('id-ID') || 'Baru saja',
        }));
      publish();
    },
    onError,
  );

  return () => {
    unsubscribeProfile();
    unsubscribeProgress();
    unsubscribeActivities();
  };
}

export async function recordLearningActivity(uid, {
  activityId,
  rewardKey,
  rewardPoints = 0,
  result,
}) {
  const accountRef = userDocument(uid);
  const activityRef = doc(db, 'users', uid, 'activities', activityId);

  return runTransaction(db, async (transaction) => {
    const [accountSnapshot, activitySnapshot] = await Promise.all([
      transaction.get(accountRef),
      transaction.get(activityRef),
    ]);

    const account = accountSnapshot.exists() ? accountSnapshot.data() : {};
    const rewardedActivities = account.rewardedActivities || [];
    const now = new Date();
    const today = toKey(now);
    const streakUpdate = getStreakUpdate(account, today, now);
    if (activitySnapshot.exists()) {
      if (
        account.lastActivityDate !== today ||
        !account.streakDays?.includes(today) ||
        account.currentStreak == null
      ) {
        transaction.set(
          accountRef,
          { ...streakUpdate, updatedAt: serverTimestamp() },
          { merge: true },
        );
      }
      return { points: account.points || 0, rewarded: false };
    }

    const shouldReward =
      rewardPoints > 0 &&
      rewardKey &&
      !rewardedActivities.includes(rewardKey);
    const points = (account.points || 0) + (shouldReward ? rewardPoints : 0);

    transaction.set(activityRef, {
      ...result,
      createdAt: serverTimestamp(),
      rewardPoints: shouldReward ? rewardPoints : 0,
    });
    transaction.set(
      accountRef,
      {
        points,
        ...streakUpdate,
        ...(result.kind === 'quiz'
          ? { quizCount: (account.quizCount || 0) + 1 }
          : {}),
        rewardedActivities: shouldReward
          ? [...rewardedActivities, rewardKey]
          : rewardedActivities,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { points, rewarded: shouldReward };
  });
}

export async function unlockStoryWithPoints(uid, storyId, cost) {
  const accountRef = userDocument(uid);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    if (!snapshot.exists()) {
      throw new Error('Profil pengguna belum tersinkron ke database.');
    }

    const account = snapshot.data();
    const unlockedStories = account.unlockedStories || [];
    if (unlockedStories.includes(storyId)) {
      return { success: true, points: account.points || 0, unlockedStories };
    }
    if ((account.points || 0) < cost) {
      return { success: false, points: account.points || 0, unlockedStories };
    }

    const nextUnlockedStories = [...unlockedStories, storyId];
    const points = account.points - cost;
    transaction.set(
      accountRef,
      {
        points,
        unlockedStories: nextUnlockedStories,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return {
      success: true,
      points,
      unlockedStories: nextUnlockedStories,
    };
  });
}
