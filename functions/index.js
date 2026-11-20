const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const {
  buildLeaderboardEntry,
  cleanText,
  getRewardPoints,
  getStreakUpdate,
} = require('./domain');

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });
initializeApp();

const db = getFirestore();
const STORY_COSTS = Object.freeze({ 'story-binary-search': 50 });
const ACTIVITY_KINDS = new Set([
  'lesson',
  'quiz',
  'practice-game',
  'simulation',
  'story',
]);
const ACTIVITY_FIELDS = [
  'kind',
  'icon',
  'title',
  'subtitle',
  'correctCount',
  'totalQuestions',
  'correct',
  'total',
  'quizId',
];

function requireUid(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to use this feature.');
  }
  return request.auth.uid;
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpsError('invalid-argument', `${label} must be an object.`);
  }
  return value;
}

function optionalText(value, field, maxLength, fallback) {
  try {
    return cleanText(value, maxLength, fallback);
  } catch (error) {
    throw new HttpsError('invalid-argument', `${field}: ${error.message}`);
  }
}

function userResponse(uid, account) {
  return {
    uid,
    email: account.email || null,
    name: account.name || 'Siswa',
    photoURL: account.photoURL || null,
    isGuest: Boolean(account.isGuest),
    school: account.school || '',
    grade: account.grade || '',
    points: account.points || 0,
    lifetimePoints: account.lifetimePoints ?? account.points ?? 0,
    quizCount: account.quizCount || 0,
    currentStreak: account.currentStreak || 0,
    lastActivityDate: account.lastActivityDate || null,
    streakDays: account.streakDays || [],
    rewardedActivities: account.rewardedActivities || [],
    unlockedStories: account.unlockedStories || [],
  };
}

function writeLeaderboardEntry(transaction, uid, account) {
  const ref = db.collection('leaderboard').doc(uid);
  if (account.isGuest) {
    transaction.delete(ref);
    return;
  }
  transaction.set(ref, {
    ...buildLeaderboardEntry(uid, account),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function sanitizeActivity(value) {
  const input = requireObject(value, 'result');
  if (!ACTIVITY_KINDS.has(input.kind)) {
    throw new HttpsError('invalid-argument', 'Activity kind is invalid.');
  }

  const result = { kind: input.kind };
  for (const field of ACTIVITY_FIELDS.slice(1)) {
    if (input[field] == null) continue;
    if (['correctCount', 'totalQuestions', 'correct', 'total'].includes(field)) {
      if (!Number.isSafeInteger(input[field]) || input[field] < 0) {
        throw new HttpsError('invalid-argument', `${field} must be a non-negative integer.`);
      }
      result[field] = input[field];
      continue;
    }
    result[field] = optionalText(input[field], field, 160, '');
  }
  return result;
}

exports.ensureUserProfile = onCall(async (request) => {
  const uid = requireUid(request);
  const input = requireObject(request.data || {}, 'profile');
  const token = request.auth.token;
  const email = typeof token.email === 'string' ? token.email : null;
  const isGuest = token.firebase?.sign_in_provider === 'anonymous';
  const fallbackName = token.name || email?.split('@')[0] || 'Siswa';
  const name = optionalText(input.name, 'name', 50, fallbackName);
  const photoURL = optionalText(input.photoURL, 'photoURL', 2048, '');
  const userRef = db.collection('users').doc(uid);

  const account = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const existing = snapshot.exists ? snapshot.data() : {};
    const next = {
      uid,
      email,
      name,
      photoURL: photoURL || null,
      isGuest,
      school: existing.school || '',
      grade: existing.grade || '',
      points: existing.points || 0,
      lifetimePoints: existing.lifetimePoints ?? existing.points ?? 0,
      quizCount: existing.quizCount || 0,
      currentStreak: existing.currentStreak || 0,
      lastActivityDate: existing.lastActivityDate || null,
      streakDays: existing.streakDays || [],
      rewardedActivities: existing.rewardedActivities || [],
      unlockedStories: existing.unlockedStories || [],
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (!snapshot.exists) next.createdAt = FieldValue.serverTimestamp();

    transaction.set(userRef, next, { merge: true });
    writeLeaderboardEntry(transaction, uid, next);
    return next;
  });

  return userResponse(uid, account);
});

exports.updateUserProfile = onCall(async (request) => {
  const uid = requireUid(request);
  const input = requireObject(request.data || {}, 'profile');
  const name = optionalText(input.name, 'name', 50, '');
  if (!name) throw new HttpsError('invalid-argument', 'Name cannot be empty.');
  const school = optionalText(input.school, 'school', 100, '');
  const grade = optionalText(input.grade, 'grade', 40, '');
  const userRef = db.collection('users').doc(uid);

  const account = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists) {
      throw new HttpsError('failed-precondition', 'User profile is not initialized.');
    }
    const next = {
      ...snapshot.data(),
      name,
      school,
      grade,
      updatedAt: FieldValue.serverTimestamp(),
    };
    transaction.set(userRef, { name, school, grade, updatedAt: next.updatedAt }, { merge: true });
    writeLeaderboardEntry(transaction, uid, next);
    return next;
  });

  return userResponse(uid, account);
});

exports.recordLearningActivity = onCall(async (request) => {
  const uid = requireUid(request);
  const input = requireObject(request.data || {}, 'activity');
  if (
    typeof input.activityId !== 'string' ||
    !/^[A-Za-z0-9_-]{1,120}$/.test(input.activityId)
  ) {
    throw new HttpsError('invalid-argument', 'Activity ID is invalid.');
  }
  if (typeof input.localDate !== 'string') {
    throw new HttpsError('invalid-argument', 'Activity date is required.');
  }
  try {
    getStreakUpdate({}, input.localDate);
  } catch (error) {
    throw new HttpsError('invalid-argument', error.message);
  }
  const result = sanitizeActivity(input.result);
  let rewardPoints;
  try {
    rewardPoints = getRewardPoints(input.rewardKey || '');
  } catch (error) {
    throw new HttpsError('invalid-argument', error.message);
  }

  const accountRef = db.collection('users').doc(uid);
  const activityRef = accountRef.collection('activities').doc(input.activityId);
  return db.runTransaction(async (transaction) => {
    const [accountSnapshot, activitySnapshot] = await Promise.all([
      transaction.get(accountRef),
      transaction.get(activityRef),
    ]);
    if (!accountSnapshot.exists) {
      throw new HttpsError('failed-precondition', 'User profile is not initialized.');
    }

    const account = accountSnapshot.data();
    const todayStreak = getStreakUpdate(account, input.localDate);
    if (activitySnapshot.exists) {
      if (
        account.lastActivityDate !== input.localDate ||
        !account.streakDays?.includes(input.localDate)
      ) {
        transaction.set(accountRef, {
          ...todayStreak,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
      return { points: account.points || 0, rewarded: false };
    }

    const rewardedActivities = account.rewardedActivities || [];
    const shouldReward =
      rewardPoints > 0 &&
      input.rewardKey &&
      !rewardedActivities.includes(input.rewardKey);
    const points = (account.points || 0) + (shouldReward ? rewardPoints : 0);
    const lifetimePoints =
      (account.lifetimePoints ?? account.points ?? 0) +
      (shouldReward ? rewardPoints : 0);
    const nextAccount = {
      ...account,
      points,
      lifetimePoints,
      ...todayStreak,
      ...(result.kind === 'quiz'
        ? { quizCount: (account.quizCount || 0) + 1 }
        : {}),
      rewardedActivities: shouldReward
        ? [...rewardedActivities, input.rewardKey]
        : rewardedActivities,
    };

    transaction.set(activityRef, {
      ...result,
      createdAt: FieldValue.serverTimestamp(),
      rewardPoints: shouldReward ? rewardPoints : 0,
    });
    transaction.set(accountRef, {
      points: nextAccount.points,
      lifetimePoints: nextAccount.lifetimePoints,
      ...todayStreak,
      ...(result.kind === 'quiz'
        ? { quizCount: nextAccount.quizCount }
        : {}),
      rewardedActivities: nextAccount.rewardedActivities,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    writeLeaderboardEntry(transaction, uid, nextAccount);
    return { points, rewarded: Boolean(shouldReward) };
  });
});

exports.unlockStoryWithPoints = onCall(async (request) => {
  const uid = requireUid(request);
  const storyId = request.data?.storyId;
  const cost = STORY_COSTS[storyId];
  if (!cost) throw new HttpsError('invalid-argument', 'Story is not available.');

  const userRef = db.collection('users').doc(uid);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists) {
      throw new HttpsError('failed-precondition', 'User profile is not initialized.');
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
    const nextAccount = { ...account, points };
    transaction.set(userRef, {
      points,
      unlockedStories: nextUnlockedStories,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    writeLeaderboardEntry(transaction, uid, nextAccount);
    return { success: true, points, unlockedStories: nextUnlockedStories };
  });
});
