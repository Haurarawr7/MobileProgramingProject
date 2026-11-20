import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';
import { getActiveStreakCount, toKey } from '../utils/streak';

const userDocument = (uid) => doc(db, 'users', uid);

export async function syncUserProfile(user) {
  const result = await httpsCallable(functions, 'ensureUserProfile')({
    name: user.name || '',
    photoURL: user.photoURL || '',
  });
  return result.data;
}

export async function updateUserProfile(uid, profile) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error('You can only update your own profile.');
  }
  const result = await httpsCallable(functions, 'updateUserProfile')({
    name: profile.name.trim(),
    school: profile.school.trim(),
    grade: profile.grade.trim(),
  });
  return result.data;
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

export function subscribeLeaderboard(onUpdate, onError) {
  const leaderboardQuery = query(
    collection(db, 'leaderboard'),
    orderBy('points', 'desc'),
    limit(50),
  );
  return onSnapshot(
    leaderboardQuery,
    (snapshot) => {
      onUpdate(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    },
    onError,
  );
}

export async function recordLearningActivity(uid, {
  activityId,
  rewardKey,
  result,
}) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error('You can only record activity for your own account.');
  }
  const response = await httpsCallable(functions, 'recordLearningActivity')({
    activityId,
    rewardKey: rewardKey || '',
    result,
    localDate: toKey(new Date()),
  });
  return response.data;
}

export async function unlockStoryWithPoints(uid, storyId, cost) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error('You can only purchase stories for your own account.');
  }
  if (!Number.isFinite(cost) || cost < 0) {
    throw new Error('Story price is invalid.');
  }
  const response = await httpsCallable(functions, 'unlockStoryWithPoints')({ storyId });
  return response.data;
}
