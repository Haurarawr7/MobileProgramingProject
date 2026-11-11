export const STREAK_TOTAL = 7;
export const STREAK_ACTIVE = 4;

export const SUMMARY = [
  { id: 's1', value: '84%', label: 'Kemajuan materi' },
  { id: 's2', value: '4', label: 'Peringkat' },
  { id: 's3', value: '360', label: 'Poin' },
];

export const ACTIVITIES = [
  {
    id: '1',
    icon: 'document-text-outline',
    title: 'Materi Pencarian Sequential Selesai',
    subtitle: 'Hebat, kamu baru saja menyelesaikan materi Pencarian Berurutan',
    time: 'Hari ini',
  },
];

// Urut dari Dasar -> Lanjutan
export const MATERI = [
  { id: 'm1', title: 'Sequential Search', level: 'SMA', topic: 'Struktur Data', duration: '12 menit' },
  { id: 'm2', title: 'Binary Search', level: 'SMA', topic: 'Struktur Data', duration: '15 menit' },
  { id: 'm3', title: 'Bubble Sort', level: 'SMA', topic: 'Algoritma', duration: '14 menit' },
  { id: 'm4', title: 'Selection Sort', level: 'SMA', topic: 'Algoritma', duration: '14 menit' },
  { id: 'm5', title: 'Quick Sort', level: 'SMA', topic: 'Algoritma', duration: '20 menit' },
];

// Daftar Mini Game (ubah judul/tambah game di sini)
export const GAMES = [
  { id: 'g1', title: 'Pencarian Berurutan' },
  { id: 'g2', title: 'Pencarian Biner' },
  { id: 'g3', title: 'Bubble Sort' },
  { id: 'g4', title: 'Selection Sort' },
  { id: 'g5', title: 'Quick Sort' },
  { id: 'g6', title: 'Insertion Sort' },
];

export const TABS = [
  { key: 'home', label: 'Beranda', icon: 'home-outline' },
  { key: 'materi', label: 'Materi', icon: 'grid-outline' },
  { key: 'games', label: 'Mini Game', icon: 'game-controller-outline' },
  { key: 'profile', label: 'Profil', icon: 'person-outline' },
];

export const PROFILE = {
  name: 'Siswa Informatika',
  school: 'SMA Negeri 1',
  grade: 'Kelas X',
};

export const BADGES = [
  { id: 'b1', icon: 'flame-outline', label: 'Streak 4 hari' },
  { id: 'b2', icon: 'ribbon-outline', label: 'Materi pertama' },
  { id: 'b3', icon: 'trophy-outline', label: '360 poin' },
];

export const MENU = [
  { id: 'edit', icon: 'person-outline', label: 'Ubah profil' },
  { id: 'help', icon: 'help-circle-outline', label: 'Bantuan' },
  { id: 'about', icon: 'information-circle-outline', label: 'Tentang aplikasi' },
];
