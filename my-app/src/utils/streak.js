/**
 * Mengubah objek Date ke string key 'YYYY-MM-DD' menggunakan waktu lokal.
 */
export function toKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Menambahkan sejumlah hari ke objek Date (lokal).
 */
export function addDays(date, days) {
  const res = new Date(date);
  res.setDate(res.getDate() + days);
  return res;
}

/**
 * Parsing string 'YYYY-MM-DD' menjadi objek Date lokal (jam 00:00:00).
 */
export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Menghitung streak aktif, rekor terpanjang, total hari, dan progres minggu ini.
 * @param {Set<string>|string[]} activeDaysSet - Kumpulan tanggal 'YYYY-MM-DD' yang aktif belajar
 */
export function computeStreaks(activeDaysSet) {
  const set = activeDaysSet instanceof Set ? activeDaysSet : new Set(activeDaysSet || []);
  const today = new Date();
  const todayKey = toKey(today);
  const yesterdayKey = toKey(addDays(today, -1));

  // 1. Hitung Streak Saat Ini (Current Streak)
  // Kalau hari ini belum belajar, hitungan mulai dari kemarin supaya tidak langsung putus.
  let current = 0;
  let checkDate = null;

  if (set.has(todayKey)) {
    current = 1;
    checkDate = addDays(today, -1);
  } else if (set.has(yesterdayKey)) {
    current = 1;
    checkDate = addDays(today, -2);
  }

  while (checkDate) {
    const key = toKey(checkDate);
    if (set.has(key)) {
      current += 1;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  // 2. Hitung Rekor Terpanjang (Longest Streak)
  const sortedKeys = Array.from(set).sort();
  let longest = 0;
  let running = 0;
  let lastDate = null;

  for (const key of sortedKeys) {
    const curDate = parseKey(key);
    if (!lastDate) {
      running = 1;
    } else {
      const diffMs = curDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running += 1;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    lastDate = curDate;
    if (running > longest) {
      longest = running;
    }
  }
  if (current > longest) {
    longest = current;
  }

  // 3. Total Hari Belajar
  const total = set.size;

  // 4. Progres Minggu Ini (Senin s/d Minggu)
  const dayOfWeek = today.getDay(); // 0 = Minggu, 1 = Senin, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addDays(today, mondayOffset);

  let thisWeekCount = 0;
  const weekDays = [];
  const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const key = toKey(d);
    const isActive = set.has(key);
    if (isActive) thisWeekCount += 1;
    weekDays.push({
      date: d,
      key,
      dayName: DAY_NAMES[i],
      dayNum: d.getDate(),
      isActive,
      isToday: key === todayKey,
    });
  }

  return {
    current,
    longest,
    total,
    thisWeekCount,
    thisWeekText: `${thisWeekCount}/7`,
    weekDays,
  };
}

