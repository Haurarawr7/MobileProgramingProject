import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  isTeacherEmail,
  normalizeUserRole,
  USER_ROLE_STUDENT,
  USER_ROLE_TEACHER,
} from '../constants/userRoles';
import {
  addDays,
  getActiveStreakCount,
  getCurrentWeekDateKeys,
  toKey,
} from '../utils/streak';

const userDocument = (uid) => doc(db, 'users', uid);
const REWARD_POINTS = 10;
const REWARD_KEYS = new Set([
  'practice-flashcards',
  'practice-matching',
  'practice-speed-quiz',
  'simulation-m1',
  'simulation-m2',
  'simulation-m3',
  'simulation-m4',
  'simulation-m5',
  'simulation-m6',
]);
const STORY_COSTS = Object.freeze({ 'story-binary-search': 50 });

export async function syncUserProfile(user) {
  if (auth.currentUser?.uid !== user.uid) {
    throw new Error('You can only sync your own profile.');
  }

  const userRef = userDocument(user.uid);
  const leaderboardRef = doc(db, 'leaderboard', user.uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const existing = snapshot.exists() ? snapshot.data() : {};
    const points = Number.isSafeInteger(existing.points) && existing.points >= 0
      ? existing.points
      : 0;
    const weekDates = getCurrentWeekDateKeys();
    const account = {
      uid: user.uid,
      email: user.email || null,
      name: (user.name || 'Siswa').trim().slice(0, 50) || 'Siswa',
      photoURL: user.photoURL?.slice(0, 2048) || null,
      isGuest: Boolean(user.isGuest),
      role: isTeacherEmail(user.email) &&
        (normalizeUserRole(existing.role) === USER_ROLE_TEACHER ||
          normalizeUserRole(user.role) === USER_ROLE_TEACHER)
        ? USER_ROLE_TEACHER
        : USER_ROLE_STUDENT,
      school: typeof existing.school === 'string' ? existing.school.slice(0, 100) : '',
      grade: typeof existing.grade === 'string' ? existing.grade.slice(0, 40) : '',
      points,
      lifetimePoints: Number.isSafeInteger(existing.lifetimePoints) &&
        existing.lifetimePoints >= points
        ? existing.lifetimePoints
        : points,
      quizCount: Number.isSafeInteger(existing.quizCount) && existing.quizCount >= 0
        ? existing.quizCount
        : 0,
      currentStreak: Number.isSafeInteger(existing.currentStreak) &&
        existing.currentStreak >= 0
        ? existing.currentStreak
        : 0,
      lastActivityDate: typeof existing.lastActivityDate === 'string'
        ? existing.lastActivityDate
        : null,
      streakDays: [...new Set(
        (Array.isArray(existing.streakDays) ? existing.streakDays : [])
          .filter((date) => typeof date === 'string' && weekDates.includes(date)),
      )],
      rewardedActivities: [...new Set(
        (Array.isArray(existing.rewardedActivities) ? existing.rewardedActivities : [])
          .filter((key) => REWARD_KEYS.has(key)),
      )],
      unlockedStories: [...new Set(
        (Array.isArray(existing.unlockedStories) ? existing.unlockedStories : [])
          .filter((storyId) =>
            Object.prototype.hasOwnProperty.call(STORY_COSTS, storyId),
          ),
      )],
      createdAt: existing.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    transaction.set(userRef, account);
    if (!account.isGuest) {
      transaction.set(leaderboardRef, {
        uid: user.uid,
        name: account.name,
        points: account.lifetimePoints,
      });
    }
    return account;
  });
}

export async function updateUserProfile(uid, profile) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error('You can only update your own profile.');
  }

  const userRef = userDocument(uid);
  const leaderboardRef = doc(db, 'leaderboard', uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists()) throw new Error('User profile is not initialized.');
    const account = snapshot.data();
    const updated = {
      ...account,
      name: profile.name.trim(),
      school: profile.school.trim(),
      grade: profile.grade.trim(),
      updatedAt: serverTimestamp(),
    };
    transaction.update(userRef, {
      name: updated.name,
      school: updated.school,
      grade: updated.grade,
      updatedAt: updated.updatedAt,
    });
    if (!account.isGuest) {
      transaction.set(leaderboardRef, {
        uid,
        name: updated.name,
        points: account.lifetimePoints ?? account.points ?? 0,
      });
    }
    return updated;
  });
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

  if (typeof activityId !== 'string' || !/^[A-Za-z0-9_-]{1,120}$/.test(activityId)) {
    throw new Error('Activity ID is invalid.');
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('Activity result is invalid.');
  }
  if (!['lesson', 'quiz', 'practice-game', 'simulation', 'story'].includes(result.kind)) {
    throw new Error('Activity type is invalid.');
  }
  if (rewardKey && !REWARD_KEYS.has(rewardKey)) {
    throw new Error('This activity is not eligible for a point reward.');
  }
  const activity = {
    ...result,
    createdAt: serverTimestamp(),
  };
  const userRef = userDocument(uid);
  const activityRef = doc(collection(db, 'users', uid, 'activities'), activityId);
  const leaderboardRef = doc(db, 'leaderboard', uid);
  const activityDate = new Date();
  const today = toKey(activityDate);

  return runTransaction(db, async (transaction) => {
    const [userSnapshot, activitySnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(activityRef),
    ]);
    if (!userSnapshot.exists()) {
      throw new Error('User profile is not initialized.');
    }
    const account = userSnapshot.data();
    const previousDate = account.lastActivityDate;
    const yesterday = toKey(addDays(activityDate, -1));
    const weekDates = getCurrentWeekDateKeys(activityDate);
    const streakDays = [...new Set(account.streakDays || [])]
      .filter((date) => typeof date === 'string' && weekDates.includes(date));
    if (!streakDays.includes(today)) streakDays.push(today);
    const nextStreak = {
      currentStreak: previousDate === today
        ? Math.max(account.currentStreak || 0, 1)
        : previousDate === yesterday
          ? (account.currentStreak || 0) + 1
          : 1,
      lastActivityDate: today,
      streakDays,
    };

    if (activitySnapshot.exists()) {
      transaction.update(userRef, {
        ...nextStreak,
        updatedAt: serverTimestamp(),
      });
      if (!account.isGuest) {
        transaction.set(leaderboardRef, {
          uid,
          name: account.name || 'Siswa',
          points: account.lifetimePoints ?? account.points ?? 0,
        });
      }
      return { points: account.points || 0, rewarded: false };
    }

    const rewardedActivities = account.rewardedActivities || [];
    const isEligibleReward = Boolean(rewardKey) &&
      !rewardedActivities.includes(rewardKey);
    const reward = isEligibleReward ? REWARD_POINTS : 0;
    const points = (account.points || 0) + reward;
    const lifetimePoints = (account.lifetimePoints ?? account.points ?? 0) + reward;
    const nextAccount = {
      ...account,
      points,
      lifetimePoints,
      ...nextStreak,
      ...(result.kind === 'quiz' ? { quizCount: (account.quizCount || 0) + 1 } : {}),
      rewardedActivities: reward
        ? [...rewardedActivities, rewardKey]
        : rewardedActivities,
    };
    transaction.set(activityRef, activity);
    transaction.update(userRef, {
      points,
      lifetimePoints,
      ...nextStreak,
      ...(result.kind === 'quiz' ? { quizCount: nextAccount.quizCount } : {}),
      rewardedActivities: nextAccount.rewardedActivities,
      updatedAt: serverTimestamp(),
    });
    if (!account.isGuest) {
      transaction.set(leaderboardRef, {
        uid,
        name: nextAccount.name || 'Siswa',
        points: lifetimePoints,
      });
    }
    return { points, rewarded: reward > 0 };
  });
}

export async function unlockStoryWithPoints(uid, storyId, cost) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error('You can only purchase stories for your own account.');
  }
  if (!Number.isFinite(cost) || cost < 0) {
    throw new Error('Story price is invalid.');
  }
  if (STORY_COSTS[storyId] !== cost) {
    throw new Error('Story price is invalid.');
  }

  const userRef = userDocument(uid);
  const leaderboardRef = doc(db, 'leaderboard', uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists()) throw new Error('User profile is not initialized.');
    const account = snapshot.data();
    const unlockedStories = account.unlockedStories || [];
    if (unlockedStories.includes(storyId)) {
      return { success: true, points: account.points || 0, unlockedStories };
    }
    if ((account.points || 0) < cost) {
      return { success: false, points: account.points || 0, unlockedStories };
    }

    const points = account.points - cost;
    const nextUnlockedStories = [...unlockedStories, storyId];
    transaction.update(userRef, {
      points,
      unlockedStories: nextUnlockedStories,
      updatedAt: serverTimestamp(),
    });
    if (!account.isGuest) {
      transaction.set(leaderboardRef, {
        uid,
        name: account.name || 'Siswa',
        points: account.lifetimePoints ?? account.points ?? 0,
      });
    }
    return { success: true, points, unlockedStories: nextUnlockedStories };
  });
}
