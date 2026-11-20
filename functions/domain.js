const GAME_COMPLETION_REWARD = 10;

const REWARD_POINTS = Object.freeze({
  'practice-flashcards': GAME_COMPLETION_REWARD,
  'practice-matching': GAME_COMPLETION_REWARD,
  'practice-speed-quiz': GAME_COMPLETION_REWARD,
  'simulation-m1': GAME_COMPLETION_REWARD,
  'simulation-m2': GAME_COMPLETION_REWARD,
  'simulation-m3': GAME_COMPLETION_REWARD,
  'simulation-m4': GAME_COMPLETION_REWARD,
  'simulation-m5': GAME_COMPLETION_REWARD,
  'simulation-m6': GAME_COMPLETION_REWARD,
});

function parseDateKey(dateKey) {
  if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new TypeError('Activity date must use YYYY-MM-DD format.');
  }

  const date = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) {
    throw new TypeError('Activity date is invalid.');
  }
  return date;
}

function getWeekDateKeys(dateKey) {
  const date = parseDateKey(dateKey);
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const weekDay = new Date(monday);
    weekDay.setUTCDate(monday.getUTCDate() + index);
    return weekDay.toISOString().slice(0, 10);
  });
}

function getStreakUpdate(account, today) {
  const previousDate = new Date(parseDateKey(today));
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  const yesterday = previousDate.toISOString().slice(0, 10);
  const week = getWeekDateKeys(today);
  const streakDays = [...new Set(account.streakDays || [])].filter((date) =>
    week.includes(date),
  );
  if (!streakDays.includes(today)) streakDays.push(today);

  return {
    currentStreak:
      account.lastActivityDate === today
        ? Math.max(account.currentStreak || 0, 1)
        : account.lastActivityDate === yesterday
          ? (account.currentStreak || 0) + 1
          : 1,
    lastActivityDate: today,
    streakDays,
  };
}

function cleanText(value, maxLength, fallback = '') {
  if (value == null) return fallback;
  if (typeof value !== 'string') {
    throw new TypeError('Profile text fields must be strings.');
  }
  const text = value.trim();
  if (text.length > maxLength) {
    throw new RangeError(`Text fields must be ${maxLength} characters or fewer.`);
  }
  return text || fallback;
}

function buildLeaderboardEntry(uid, account) {
  const score = account.lifetimePoints ?? account.points;
  return {
    uid,
    name: cleanText(account.name, 50, 'Siswa'),
    points: Number.isSafeInteger(score) && score >= 0
      ? score
      : 0,
  };
}

function getRewardPoints(rewardKey) {
  if (!rewardKey) return 0;
  if (!Object.hasOwn(REWARD_POINTS, rewardKey)) {
    throw new TypeError('This activity is not eligible for a point reward.');
  }
  return REWARD_POINTS[rewardKey];
}

module.exports = {
  REWARD_POINTS,
  buildLeaderboardEntry,
  cleanText,
  getRewardPoints,
  getStreakUpdate,
};
