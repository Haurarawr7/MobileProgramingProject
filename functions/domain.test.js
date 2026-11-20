const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildLeaderboardEntry,
  getRewardPoints,
  getStreakUpdate,
} = require('./domain');

test('only approved game reward keys award points', () => {
  assert.equal(getRewardPoints('simulation-m1'), 10);
  assert.equal(getRewardPoints('practice-flashcards'), 10);
  assert.equal(getRewardPoints(''), 0);
  assert.throws(() => getRewardPoints('custom-points'));
});

test('streak activity increments once per day and resets after a missed day', () => {
  const today = '2026-11-20';
  assert.deepEqual(
    getStreakUpdate({
      currentStreak: 3,
      lastActivityDate: '2026-11-19',
      streakDays: ['2026-11-19'],
    }, today),
    {
      currentStreak: 4,
      lastActivityDate: today,
      streakDays: ['2026-11-19', today],
    },
  );
  assert.equal(
    getStreakUpdate({
      currentStreak: 4,
      lastActivityDate: today,
      streakDays: [today],
    }, today).currentStreak,
    4,
  );
  assert.equal(
    getStreakUpdate({
      currentStreak: 4,
      lastActivityDate: '2026-11-18',
      streakDays: ['2026-11-18'],
    }, today).currentStreak,
    1,
  );
});

test('leaderboard entry contains only public name, UID, and safe points', () => {
  assert.deepEqual(buildLeaderboardEntry('uid-1', {
    name: 'Siswa',
    points: 25,
    lifetimePoints: 35,
    email: 'private@example.test',
  }), {
    uid: 'uid-1',
    name: 'Siswa',
    points: 35,
  });
});
