// src/utils/streak.js
export const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Hitung streak sekarang + rekor terpanjang dari Set berisi 'YYYY-MM-DD'.
// Streak sekarang tidak putus selama hari ini belum berakhir:
// kalau hari ini belum belajar, hitungan mulai dari kemarin.
export function computeStreaks(activeSet, today = new Date()) {
  let cursor = activeSet.has(toKey(today)) ? today : addDays(today, -1);
  let current = 0;
  while (activeSet.has(toKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let prev = null;
  [...activeSet].sort().forEach((key) => {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    run = prev && toKey(addDays(prev, 1)) === key ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = date;
  });

  return { current, longest };
}

// Senin..Minggu untuk minggu yang memuat `today`
export function weekDays(today = new Date()) {
  const dow = (today.getDay() + 6) % 7; // Senin = 0
  const monday = addDays(today, -dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}