const LESSON_TEMPLATES = [
  {
    aliases: ['binary search tree', 'pohon pencarian biner', 'bst'],
    lesson: {
      title: 'Binary Search Tree',
      topic: 'Struktur Data',
      summary: 'Struktur pohon yang menyimpan nilai agar pencarian dan penyisipan lebih terarah.',
      content: [
        'Binary Search Tree (BST) adalah pohon biner yang mengatur nilai: nilai yang lebih kecil dari sebuah node berada di subtree kiri, sedangkan nilai yang lebih besar berada di subtree kanan.',
        'Untuk mencari nilai, mulai dari root lalu bandingkan nilai target. Jika target lebih kecil, lanjut ke kiri; jika lebih besar, lanjut ke kanan. Aturan yang sama digunakan saat menyisipkan nilai baru.',
        'Pada pohon yang seimbang, pencarian dan penyisipan biasanya membutuhkan sekitar O(log n) langkah. Jika pohon menjadi sangat miring, kinerjanya dapat turun menjadi O(n).',
        'Contoh: masukkan 8, 3, dan 10. Nilai 3 ditempatkan di kiri node 8, sedangkan 10 ditempatkan di kanannya. Untuk mencari 10, cukup bandingkan dengan 8 lalu bergerak ke kanan.',
      ].join('\n\n'),
    },
  },
  {
    aliases: ['tree', 'trees', 'pohon', 'pohon biner'],
    lesson: {
      title: 'Tree (Pohon) dalam Pemrograman',
      topic: 'Struktur Data',
      summary: 'Kenali struktur data hierarkis yang terdiri dari node dan hubungan parent-child.',
      content: [
        'Tree atau pohon adalah struktur data untuk menyimpan informasi secara hierarkis. Setiap bagian disebut node, dan hubungan antar-node disebut edge.',
        'Node paling atas disebut root. Node yang memiliki hubungan ke bawah disebut parent, sedangkan node di bawahnya disebut child. Node tanpa child disebut leaf. Dalam tree biasa, setiap node (selain root) memiliki satu parent.',
        'Contoh sehari-hari adalah struktur folder: folder utama menjadi root, subfolder menjadi child, dan file di bagian paling bawah dapat menjadi leaf. Di pemrograman, tree dipakai untuk mewakili folder, struktur HTML, dan keputusan.',
        'Untuk menelusuri tree, algoritma traversal mengunjungi node satu per satu. Depth-first search menelusuri cabang lebih dalam dahulu, sedangkan breadth-first search mengunjungi node per tingkat.',
        'Ringkasnya: gunakan tree saat data memiliki hubungan bertingkat. Mulailah dari root, ikuti edge menuju child, dan pilih cara traversal sesuai urutan yang dibutuhkan.',
      ].join('\n\n'),
    },
  },
  {
    aliases: ['linked list', 'linked-list', 'daftar berantai', 'list berantai'],
    lesson: {
      title: 'Linked List',
      topic: 'Struktur Data',
      summary: 'Pelajari kumpulan node yang saling terhubung melalui referensi.',
      content: [
        'Linked list adalah struktur data yang tersusun dari node. Setiap node menyimpan nilai dan referensi ke node berikutnya; node pertama disebut head.',
        'Berbeda dari array, node linked list tidak harus berada bersebelahan di memori. Untuk menemukan elemen, program biasanya mulai dari head lalu mengikuti referensi satu per satu.',
        'Menyisipkan node di lokasi yang referensinya sudah diketahui dapat dilakukan dengan memperbarui beberapa referensi. Namun, mencari elemen berdasarkan posisi umumnya memerlukan O(n) langkah.',
        'Contoh: daftar tugas A → B → C. Untuk menyisipkan tugas X setelah A, ubah referensi A agar menunjuk ke X, lalu referensi X menunjuk ke B.',
      ].join('\n\n'),
    },
  },
  {
    aliases: ['stack', 'tumpukan'],
    lesson: {
      title: 'Stack (Tumpukan)',
      topic: 'Struktur Data',
      summary: 'Pahami struktur LIFO untuk mengelola data yang masuk dan keluar dari satu ujung.',
      content: [
        'Stack adalah struktur data dengan aturan LIFO (Last In, First Out): data yang terakhir dimasukkan akan menjadi data pertama yang dikeluarkan.',
        'Operasi utamanya adalah push untuk menambahkan data ke bagian atas dan pop untuk mengambil data teratas. Peek melihat data teratas tanpa menghapusnya.',
        'Stack digunakan untuk fitur undo, riwayat pemanggilan fungsi, dan memeriksa pasangan tanda kurung. Menambahkan atau mengambil elemen teratas biasanya membutuhkan O(1) waktu.',
        'Bayangkan tumpukan buku: buku yang diletakkan paling akhir berada di atas dan harus diambil lebih dahulu.',
      ].join('\n\n'),
    },
  },
  {
    aliases: ['queue', 'antrian'],
    lesson: {
      title: 'Queue (Antrian)',
      topic: 'Struktur Data',
      summary: 'Kenali struktur FIFO yang memproses data sesuai urutan kedatangannya.',
      content: [
        'Queue adalah struktur data dengan aturan FIFO (First In, First Out): data yang masuk lebih dahulu akan diproses lebih dahulu.',
        'Enqueue menambahkan data di bagian belakang antrian, sedangkan dequeue mengambil data dari bagian depan. Queue juga dapat menyediakan operasi untuk melihat elemen terdepan.',
        'Queue cocok untuk antrean cetak, pemrosesan pekerjaan, dan pesan yang menunggu giliran. Implementasi yang baik dapat melakukan enqueue dan dequeue dalam O(1) waktu.',
        'Contohnya, jika A masuk sebelum B, maka A keluar lebih dahulu walaupun B sudah ikut mengantre.',
      ].join('\n\n'),
    },
  },
  {
    aliases: ['graph', 'graf'],
    lesson: {
      title: 'Graph (Graf)',
      topic: 'Struktur Data',
      summary: 'Modelkan hubungan antarobjek menggunakan vertex dan edge.',
      content: [
        'Graph atau graf terdiri dari vertex (simpul) dan edge (sisi) yang menghubungkan simpul. Tidak seperti tree, graf dapat memiliki banyak jalur dan siklus.',
        'Edge dapat berarah atau tidak berarah. Edge juga dapat memiliki bobot, misalnya jarak antar kota. Daftar ketetanggaan dan matriks ketetanggaan adalah dua cara umum untuk menyimpan graf.',
        'Breadth-first search menelusuri graf per lapisan, sedangkan depth-first search menjelajahi satu jalur lebih dalam sebelum kembali. Keduanya membantu mengunjungi simpul yang terhubung.',
        'Contoh: kota dapat menjadi simpul dan jalan menjadi sisi. Graf membantu memodelkan rute, jaringan pertemanan, dan koneksi komputer.',
      ].join('\n\n'),
    },
  },
  {
    aliases: ['binary search', 'pencarian biner'],
    lesson: {
      title: 'Binary Search',
      topic: 'Algoritma Pencarian',
      summary: 'Cari nilai pada data terurut dengan membagi ruang pencarian menjadi dua.',
      content: [
        'Binary search mencari nilai pada kumpulan data yang sudah terurut. Algoritma membandingkan target dengan elemen tengah, lalu membuang separuh bagian yang tidak mungkin berisi target.',
        'Ulangi langkah tersebut pada bagian yang tersisa sampai target ditemukan atau tidak ada lagi elemen yang dapat diperiksa.',
        'Karena ruang pencarian berkurang setengah pada setiap langkah, kompleksitas waktunya O(log n). Syarat pentingnya adalah data harus terurut.',
        'Contoh: untuk mencari 7 pada [1, 3, 5, 7, 9], periksa nilai tengah 5. Karena 7 lebih besar, lanjutkan ke bagian kanan dan temukan 7.',
      ].join('\n\n'),
    },
  },
  {
    aliases: ['recursion', 'rekursi', 'rekursif'],
    lesson: {
      title: 'Rekursi dalam Pemrograman',
      topic: 'Konsep Pemrograman',
      summary: 'Selesaikan masalah dengan fungsi yang memanggil dirinya sendiri secara terkontrol.',
      content: [
        'Rekursi adalah teknik ketika sebuah fungsi memanggil dirinya sendiri untuk menyelesaikan bagian yang lebih kecil dari suatu masalah.',
        'Setiap fungsi rekursif memerlukan base case, yaitu kondisi berhenti. Tanpa base case, pemanggilan dapat terus berulang hingga program kehabisan ruang stack.',
        'Contoh sederhana adalah menghitung faktorial: faktorial(n) dapat didefinisikan sebagai n dikali faktorial(n - 1), dengan base case faktorial(1) = 1.',
        'Rekursi sering dipakai pada tree dan divide-and-conquer. Pastikan ukuran masalah benar-benar mengecil di setiap pemanggilan.',
      ].join('\n\n'),
    },
  },
];

const normalizeTopic = (topic) =>
  topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const containsPhrase = (topic, phrase) =>
  ` ${topic} `.includes(` ${normalizeTopic(phrase)} `);

export const isValidQrLesson = (lesson) =>
  lesson &&
  typeof lesson === 'object' &&
  !Array.isArray(lesson) &&
  lesson.type === 'lesson' &&
  lesson.version === 1 &&
  ['title', 'topic', 'level', 'duration', 'summary', 'content'].every(
    (key) => typeof lesson[key] === 'string',
  ) &&
  lesson.title.trim().length > 0 &&
  lesson.title.trim().length <= 100 &&
  lesson.topic.trim().length > 0 &&
  lesson.topic.trim().length <= 40 &&
  lesson.level.trim().length > 0 &&
  lesson.level.trim().length <= 30 &&
  lesson.duration.trim().length > 0 &&
  lesson.duration.trim().length <= 30 &&
  lesson.summary.trim().length > 0 &&
  lesson.summary.trim().length <= 250 &&
  lesson.content.trim().length > 0 &&
  lesson.content.trim().length <= 1400;

export const isValidQrLessonTopic = (payload) =>
  payload &&
  typeof payload === 'object' &&
  !Array.isArray(payload) &&
  payload.type === 'lesson-topic' &&
  payload.version === 1 &&
  typeof payload.topic === 'string' &&
  payload.topic.trim().length >= 2 &&
  payload.topic.trim().length <= 100;

export const createLessonFromTopic = (topic) => {
  const normalizedTopic = normalizeTopic(topic);
  const template = LESSON_TEMPLATES.find((item) =>
    item.aliases.some((alias) => containsPhrase(normalizedTopic, alias)),
  );
  if (!template) return null;

  return {
    ...template.lesson,
    level: 'SMA',
    duration: '10 menit',
  };
};

export const SUPPORTED_LESSON_TOPICS =
  'tree/pohon, binary search tree, linked list, stack, queue, graph, binary search, dan recursion';
