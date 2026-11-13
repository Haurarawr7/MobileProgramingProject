import { useState } from 'react';

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sizeFor(level) {
  return 4 + Math.max(1, Math.min(5, level));
}

export function maxFor(level) {
  return sizeFor(level) * 4;
}

export function randomArray(size, max) {
  const values = new Set();
  while (values.size < size) {
    values.add(randInt(1, max));
  }
  return [...values];
}

export function useStats() {
  const [stats, setStats] = useState({ correct: 0, mistakes: 0 });

  return [
    stats,
    {
      ok: () => setStats((current) => ({ ...current, correct: current.correct + 1 })),
      bad: () => setStats((current) => ({ ...current, mistakes: current.mistakes + 1 })),
    },
  ];
}
