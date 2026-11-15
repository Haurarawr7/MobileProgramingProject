// materiData.js
// Isi pembelajaran + kuis. Urut dari Dasar -> Lanjutan.
// Jenis blok konten: 'p' (paragraf), 'list' (poin), 'steps' (langkah bernomor),
// 'code' (kode), 'tip' (catatan penting).

export const MATERI = [
  // ------------------------------------------------------------------ 1
  {
    id: 'm1',
    title: 'Sequential Search',
    level: 'SMA',
    topic: 'Struktur Data',
    duration: '12 menit',
    summary: 'Cari data dengan memeriksa elemen satu per satu dari awal.',
    sections: [
      {
        heading: 'Apa itu Sequential Search?',
        blocks: [
          {
            type: 'p',
            text:
              'Sequential Search (pencarian berurutan, juga disebut pencarian linear) adalah cara paling sederhana untuk mencari data. Kita memeriksa elemen satu per satu dari awal, sampai data ketemu atau semua elemen sudah diperiksa.',
          },
          {
            type: 'p',
            text:
              'Bayangkan kamu mencari buku di rak tanpa susunan tertentu. Kamu akan melihat buku pertama, lalu kedua, dan seterusnya sampai menemukan judul yang dicari.',
          },
          {
            type: 'tip',
            text: 'Data tidak perlu terurut. Itu kelebihan utama Sequential Search.',
          },
        ],
      },
      {
        heading: 'Cara kerja',
        blocks: [
          {
            type: 'steps',
            items: [
              'Mulai dari elemen pertama (indeks 0).',
              'Bandingkan elemen saat ini dengan nilai yang dicari.',
              'Jika sama, pencarian selesai dan indeksnya dikembalikan.',
              'Jika berbeda, pindah ke elemen berikutnya.',
              'Jika semua elemen sudah diperiksa dan tidak ada yang cocok, data dinyatakan tidak ditemukan.',
            ],
          },
        ],
      },
      {
        heading: 'Contoh',
        blocks: [
          { type: 'p', text: 'Cari angka 7 pada data [4, 9, 7, 2, 5]:' },
          {
            type: 'list',
            items: [
              'Indeks 0: 4 ≠ 7, lanjut.',
              'Indeks 1: 9 ≠ 7, lanjut.',
              'Indeks 2: 7 = 7, ketemu!',
            ],
          },
          { type: 'p', text: 'Angka 7 ditemukan di indeks 2 setelah 3 kali perbandingan.' },
        ],
      },
      {
        heading: 'Kode',
        blocks: [
          {
            type: 'code',
            text: `def sequential_search(data, target):
    for i in range(len(data)):
        if data[i] == target:
            return i      # ketemu, kembalikan indeks
    return -1             # tidak ditemukan`,
          },
        ],
      },
      {
        heading: 'Kompleksitas',
        blocks: [
          {
            type: 'list',
            items: [
              'Terbaik: O(1), data yang dicari ada di posisi pertama.',
              'Terburuk: O(n), data ada di posisi terakhir atau tidak ada.',
              'Rata-rata: O(n), waktu bertambah seiring jumlah data.',
            ],
          },
          {
            type: 'tip',
            text: 'Cocok untuk data sedikit atau data yang tidak terurut. Untuk data besar yang terurut, ada cara yang lebih cepat: Binary Search.',
          },
        ],
      },
    ],
    quiz: [
      {
        q: 'Sequential Search juga dikenal dengan nama…',
        options: ['Pencarian linear', 'Pencarian biner', 'Pencarian rekursif', 'Pencarian acak'],
        answer: 0,
        explanation: 'Elemen diperiksa satu per satu secara berurutan, sehingga disebut pencarian linear.',
      },
      {
        q: 'Syarat data agar Sequential Search bisa digunakan adalah…',
        options: [
          'Data harus terurut naik',
          'Data harus terurut turun',
          'Data tidak harus terurut',
          'Data harus berjumlah genap',
        ],
        answer: 2,
        explanation: 'Sequential Search memeriksa semua elemen, jadi urutan data tidak berpengaruh.',
      },
      {
        q: 'Mencari 7 pada [4, 9, 7, 2, 5]. Berapa kali perbandingan sampai data ketemu?',
        options: ['1 kali', '2 kali', '3 kali', '5 kali'],
        answer: 2,
        explanation: 'Perbandingan dengan 4, 9, lalu 7. Total 3 kali.',
      },
      {
        q: 'Kompleksitas waktu terburuk Sequential Search adalah…',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answer: 2,
        explanation: 'Pada kasus terburuk, seluruh n elemen harus diperiksa.',
      },
      {
        q: 'Pada kode contoh, apa yang dikembalikan jika data tidak ditemukan?',
        options: ['0', '-1', 'None pada indeks terakhir', 'Jumlah data'],
        answer: 1,
        explanation: 'Nilai -1 adalah penanda umum bahwa data tidak ada, karena indeks valid tidak pernah negatif.',
      },
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    id: 'm2',
    title: 'Binary Search',
    level: 'SMA',
    topic: 'Struktur Data',
    duration: '15 menit',
    summary: 'Cari data terurut dengan membagi dua ruang pencarian di setiap langkah.',
    sections: [
      {
        heading: 'Apa itu Binary Search?',
        blocks: [
          {
            type: 'p',
            text:
              'Binary Search (pencarian biner) mencari data dengan cara membagi dua ruang pencarian di setiap langkah. Setiap kali membandingkan, setengah data yang tidak mungkin berisi jawaban langsung dibuang.',
          },
          {
            type: 'p',
            text:
              'Mirip permainan tebak angka 1 sampai 100: kamu menebak 50, lalu diberi tahu "lebih besar" atau "lebih kecil", dan terus mempersempit tebakan.',
          },
          {
            type: 'tip',
            text: 'Syarat utama: data HARUS sudah terurut. Tanpa itu, hasilnya bisa salah.',
          },
        ],
      },
      {
        heading: 'Cara kerja',
        blocks: [
          {
            type: 'steps',
            items: [
              'Tentukan batas awal (low = 0) dan batas akhir (high = n - 1).',
              'Hitung posisi tengah: mid = (low + high) // 2.',
              'Jika data[mid] sama dengan target, selesai.',
              'Jika target lebih besar dari data[mid], cari di kanan: low = mid + 1.',
              'Jika target lebih kecil dari data[mid], cari di kiri: high = mid - 1.',
              'Ulangi sampai ketemu, atau sampai low lebih besar dari high (tidak ditemukan).',
            ],
          },
        ],
      },
      {
        heading: 'Contoh',
        blocks: [
          { type: 'p', text: 'Cari 23 pada [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]:' },
          {
            type: 'list',
            items: [
              'low = 0, high = 9, mid = 4, data[4] = 16. 23 lebih besar, maka low = 5.',
              'low = 5, high = 9, mid = 7, data[7] = 56. 23 lebih kecil, maka high = 6.',
              'low = 5, high = 6, mid = 5, data[5] = 23. Ketemu!',
            ],
          },
          { type: 'p', text: 'Hanya 3 langkah, padahal Sequential Search butuh 6 langkah untuk data yang sama.' },
        ],
      },
      {
        heading: 'Kode',
        blocks: [
          {
            type: 'code',
            text: `def binary_search(data, target):
    low, high = 0, len(data) - 1
    while low <= high:
        mid = (low + high) // 2
        if data[mid] == target:
            return mid
        elif data[mid] < target:
            low = mid + 1     # buang separuh kiri
        else:
            high = mid - 1    # buang separuh kanan
    return -1`,
          },
        ],
      },
      {
        heading: 'Kompleksitas',
        blocks: [
          {
            type: 'list',
            items: [
              'Terbaik: O(1), target tepat di tengah pada percobaan pertama.',
              'Terburuk dan rata-rata: O(log n).',
              'Contoh: 1.024 data hanya butuh sekitar 10 langkah.',
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        q: 'Syarat utama agar Binary Search dapat digunakan adalah…',
        options: ['Data berjumlah ganjil', 'Data sudah terurut', 'Data berupa bilangan bulat', 'Data tidak ada duplikat'],
        answer: 1,
        explanation: 'Binary Search membuang separuh data berdasarkan perbandingan, sehingga data harus terurut.',
      },
      {
        q: 'Jika low = 0 dan high = 9, nilai mid = (low + high) // 2 adalah…',
        options: ['3', '4', '5', '9'],
        answer: 1,
        explanation: '(0 + 9) // 2 = 4 karena pembagian dibulatkan ke bawah.',
      },
      {
        q: 'Jika target lebih besar dari data[mid], langkah selanjutnya adalah…',
        options: ['high = mid - 1', 'low = mid + 1', 'Pencarian berhenti', 'Mengurutkan ulang data'],
        answer: 1,
        explanation: 'Target pasti berada di sisi kanan, sehingga batas bawah digeser ke mid + 1.',
      },
      {
        q: 'Kompleksitas waktu Binary Search pada kasus terburuk adalah…',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        answer: 1,
        explanation: 'Ruang pencarian dibagi dua setiap langkah, sehingga langkahnya sebanyak log₂ n.',
      },
      {
        q: 'Mencari 40 pada [10, 20, 30, 40, 50, 60, 70]. Berapa langkah yang dibutuhkan?',
        options: ['1 langkah', '2 langkah', '3 langkah', '4 langkah'],
        answer: 0,
        explanation: 'low = 0, high = 6, mid = 3, dan data[3] = 40. Ketemu pada langkah pertama.',
      },
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    id: 'm3',
    title: 'Bubble Sort',
    level: 'SMA',
    topic: 'Algoritma',
    duration: '14 menit',
    summary: 'Urutkan data dengan menukar pasangan elemen bersebelahan yang salah urutan.',
    sections: [
      {
        heading: 'Apa itu Bubble Sort?',
        blocks: [
          {
            type: 'p',
            text:
              'Bubble Sort mengurutkan data dengan membandingkan dua elemen yang bersebelahan, lalu menukarnya jika urutannya salah. Proses ini diulang sampai tidak ada lagi yang perlu ditukar.',
          },
          {
            type: 'p',
            text:
              'Disebut "bubble" (gelembung) karena elemen terbesar perlahan naik ke ujung kanan, seperti gelembung yang naik ke permukaan air.',
          },
        ],
      },
      {
        heading: 'Cara kerja',
        blocks: [
          {
            type: 'steps',
            items: [
              'Mulai dari awal data, bandingkan elemen ke-i dengan elemen ke-(i+1).',
              'Jika elemen kiri lebih besar, tukar posisinya.',
              'Lanjutkan sampai akhir data. Satu putaran ini disebut satu pass.',
              'Setelah satu pass, elemen terbesar sudah berada di posisi akhir.',
              'Ulangi pass untuk bagian yang belum terurut sampai selesai.',
            ],
          },
        ],
      },
      {
        heading: 'Contoh',
        blocks: [
          { type: 'p', text: 'Urutkan [5, 3, 8, 1] dari kecil ke besar:' },
          {
            type: 'list',
            items: [
              'Pass 1: (5,3) ditukar, jadi [3,5,8,1]. (5,8) tetap. (8,1) ditukar, jadi [3,5,1,8].',
              'Pass 2: (3,5) tetap. (5,1) ditukar, jadi [3,1,5,8].',
              'Pass 3: (3,1) ditukar, jadi [1,3,5,8].',
            ],
          },
          { type: 'p', text: 'Hasil akhir: [1, 3, 5, 8].' },
        ],
      },
      {
        heading: 'Kode',
        blocks: [
          {
            type: 'code',
            text: `def bubble_sort(data):
    n = len(data)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if data[j] > data[j + 1]:
                data[j], data[j + 1] = data[j + 1], data[j]
                swapped = True
        if not swapped:   # tidak ada pertukaran: sudah terurut
            break
    return data`,
          },
          {
            type: 'tip',
            text: 'Variabel swapped membuat proses berhenti lebih awal jika data sudah terurut.',
          },
        ],
      },
      {
        heading: 'Kompleksitas',
        blocks: [
          {
            type: 'list',
            items: [
              'Terburuk dan rata-rata: O(n²).',
              'Terbaik: O(n), jika data sudah terurut dan memakai swapped.',
              'Stabil: elemen bernilai sama tidak berubah urutan relatifnya.',
            ],
          },
          {
            type: 'p',
            text: 'Mudah dipahami, tetapi lambat untuk data besar. Cocok untuk belajar konsep pengurutan.',
          },
        ],
      },
    ],
    quiz: [
      {
        q: 'Bubble Sort bekerja dengan cara…',
        options: [
          'Memilih elemen terkecil lalu menaruhnya di depan',
          'Membandingkan dan menukar elemen yang bersebelahan',
          'Membagi data menjadi dua bagian',
          'Mencari elemen di tengah data',
        ],
        answer: 1,
        explanation: 'Dua elemen bersebelahan dibandingkan dan ditukar jika urutannya salah.',
      },
      {
        q: 'Hasil pass pertama pada [5, 3, 8, 1] adalah…',
        options: ['[1, 3, 5, 8]', '[3, 5, 1, 8]', '[3, 5, 8, 1]', '[5, 3, 1, 8]'],
        answer: 1,
        explanation: '(5,3) tukar, (5,8) tetap, (8,1) tukar. Hasilnya [3, 5, 1, 8].',
      },
      {
        q: 'Setelah satu pass selesai, elemen mana yang pasti sudah berada di posisi akhir?',
        options: ['Elemen terkecil', 'Elemen tengah', 'Elemen terbesar', 'Elemen pertama'],
        answer: 2,
        explanation: 'Elemen terbesar terus ditukar ke kanan hingga mencapai ujung.',
      },
      {
        q: 'Kompleksitas waktu terburuk Bubble Sort adalah…',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
        answer: 3,
        explanation: 'Ada dua perulangan bersarang, sehingga jumlah perbandingannya sekitar n².',
      },
      {
        q: 'Apa fungsi variabel swapped pada kode Bubble Sort?',
        options: [
          'Menghitung jumlah data',
          'Menyimpan elemen terbesar',
          'Menghentikan proses jika tidak ada pertukaran',
          'Membalik urutan data',
        ],
        answer: 2,
        explanation: 'Jika satu pass tidak menukar apa pun, data sudah terurut sehingga perulangan boleh berhenti.',
      },
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    id: 'm4',
    title: 'Selection Sort',
    level: 'SMA',
    topic: 'Algoritma',
    duration: '14 menit',
    summary: 'Urutkan data dengan memilih elemen terkecil lalu menaruhnya di posisi depan.',
    sections: [
      {
        heading: 'Apa itu Selection Sort?',
        blocks: [
          {
            type: 'p',
            text:
              'Selection Sort mengurutkan data dengan berulang kali memilih elemen terkecil dari bagian yang belum terurut, lalu menaruhnya di posisi paling depan bagian tersebut.',
          },
          {
            type: 'p',
            text:
              'Seperti menyusun kartu di tangan: kamu cari kartu terkecil, taruh paling kiri, lalu cari terkecil berikutnya dari sisa kartu.',
          },
        ],
      },
      {
        heading: 'Cara kerja',
        blocks: [
          {
            type: 'steps',
            items: [
              'Anggap seluruh data belum terurut. Mulai dari posisi i = 0.',
              'Cari elemen terkecil dari posisi i sampai akhir.',
              'Tukar elemen terkecil itu dengan elemen pada posisi i.',
              'Naikkan i satu langkah. Bagian kiri kini sudah terurut.',
              'Ulangi sampai seluruh data terurut.',
            ],
          },
        ],
      },
      {
        heading: 'Contoh',
        blocks: [
          { type: 'p', text: 'Urutkan [64, 25, 12, 22, 11]:' },
          {
            type: 'list',
            items: [
              'i = 0: terkecil 11, tukar dengan 64, jadi [11, 25, 12, 22, 64].',
              'i = 1: terkecil 12, tukar dengan 25, jadi [11, 12, 25, 22, 64].',
              'i = 2: terkecil 22, tukar dengan 25, jadi [11, 12, 22, 25, 64].',
              'i = 3: terkecil 25 sudah di tempatnya. Selesai.',
            ],
          },
        ],
      },
      {
        heading: 'Kode',
        blocks: [
          {
            type: 'code',
            text: `def selection_sort(data):
    n = len(data)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if data[j] < data[min_idx]:
                min_idx = j
        data[i], data[min_idx] = data[min_idx], data[i]
    return data`,
          },
        ],
      },
      {
        heading: 'Kompleksitas',
        blocks: [
          {
            type: 'list',
            items: [
              'Semua kasus (terbaik, rata-rata, terburuk): O(n²), karena selalu memeriksa seluruh sisa data.',
              'Pertukaran paling banyak n - 1 kali, lebih sedikit daripada Bubble Sort.',
              'Tidak stabil: urutan elemen bernilai sama bisa berubah.',
            ],
          },
          {
            type: 'tip',
            text: 'Selection Sort berguna jika biaya menukar data mahal, karena jumlah pertukarannya sedikit.',
          },
        ],
      },
    ],
    quiz: [
      {
        q: 'Pada setiap langkah, Selection Sort memilih…',
        options: [
          'Elemen terbesar dari seluruh data',
          'Elemen terkecil dari bagian yang belum terurut',
          'Elemen di tengah data',
          'Elemen acak',
        ],
        answer: 1,
        explanation: 'Elemen terkecil dari bagian belum terurut dipindahkan ke posisi depannya.',
      },
      {
        q: 'Hasil langkah pertama Selection Sort pada [64, 25, 12, 22, 11] adalah…',
        options: [
          '[11, 25, 12, 22, 64]',
          '[11, 12, 25, 22, 64]',
          '[25, 12, 22, 11, 64]',
          '[12, 25, 64, 22, 11]',
        ],
        answer: 0,
        explanation: 'Elemen terkecil adalah 11. Ditukar dengan 64 di posisi pertama.',
      },
      {
        q: 'Jumlah pertukaran maksimal Selection Sort untuk n elemen adalah…',
        options: ['n - 1', 'n', 'n²', 'log n'],
        answer: 0,
        explanation: 'Hanya ada satu pertukaran per langkah, dan langkahnya n - 1 kali.',
      },
      {
        q: 'Kompleksitas Selection Sort pada kasus terbaik adalah…',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
        answer: 2,
        explanation: 'Pencarian elemen terkecil tetap memeriksa seluruh sisa data, walaupun data sudah terurut.',
      },
      {
        q: 'Keunggulan Selection Sort dibanding Bubble Sort adalah…',
        options: [
          'Selalu lebih cepat untuk semua data',
          'Jumlah pertukaran lebih sedikit',
          'Bersifat stabil',
          'Tidak memerlukan perulangan',
        ],
        answer: 1,
        explanation: 'Selection Sort menukar paling banyak n - 1 kali, sedangkan Bubble Sort bisa jauh lebih banyak.',
      },
    ],
  },

  // ------------------------------------------------------------------ 5
  {
    id: 'm5',
    title: 'Quick Sort',
    level: 'SMA',
    topic: 'Algoritma',
    duration: '20 menit',
    summary: 'Urutkan data dengan memecah masalah berdasarkan pivot lalu mengurutkan tiap bagian.',
    sections: [
      {
        heading: 'Apa itu Quick Sort?',
        blocks: [
          {
            type: 'p',
            text:
              'Quick Sort memakai strategi divide and conquer (bagi dan taklukkan). Data dibagi menjadi dua kelompok berdasarkan sebuah elemen acuan yang disebut pivot, lalu setiap kelompok diurutkan dengan cara yang sama (rekursif).',
          },
          {
            type: 'p',
            text:
              'Dalam praktik, Quick Sort termasuk salah satu algoritma pengurutan tercepat untuk data berukuran besar.',
          },
        ],
      },
      {
        heading: 'Cara kerja',
        blocks: [
          {
            type: 'steps',
            items: [
              'Pilih satu elemen sebagai pivot (di sini: elemen terakhir).',
              'Partisi: elemen yang lebih kecil atau sama dengan pivot ke kiri, yang lebih besar ke kanan.',
              'Pivot kini berada di posisi akhirnya.',
              'Urutkan bagian kiri dengan Quick Sort.',
              'Urutkan bagian kanan dengan Quick Sort.',
              'Berhenti jika bagian hanya berisi 0 atau 1 elemen.',
            ],
          },
        ],
      },
      {
        heading: 'Contoh',
        blocks: [
          { type: 'p', text: 'Urutkan [7, 2, 9, 4, 6] dengan pivot elemen terakhir:' },
          {
            type: 'list',
            items: [
              'Pivot = 6. Kiri (≤ 6): [2, 4]. Kanan (> 6): [7, 9].',
              'Urutkan kiri [2, 4] menjadi [2, 4].',
              'Urutkan kanan [7, 9] menjadi [7, 9].',
              'Gabungkan: [2, 4] + [6] + [7, 9] = [2, 4, 6, 7, 9].',
            ],
          },
        ],
      },
      {
        heading: 'Kode',
        blocks: [
          {
            type: 'code',
            text: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[-1]
    kiri  = [x for x in arr[:-1] if x <= pivot]
    kanan = [x for x in arr[:-1] if x > pivot]
    return quick_sort(kiri) + [pivot] + quick_sort(kanan)`,
          },
          {
            type: 'tip',
            text: 'Versi ini mudah dibaca, tetapi membuat list baru. Versi in-place lebih hemat memori.',
          },
        ],
      },
      {
        heading: 'Kompleksitas',
        blocks: [
          {
            type: 'list',
            items: [
              'Terbaik dan rata-rata: O(n log n).',
              'Terburuk: O(n²), terjadi jika pivot selalu elemen terkecil atau terbesar, misalnya data sudah terurut dan pivot diambil dari ujung.',
              'Tidak stabil.',
            ],
          },
          {
            type: 'p',
            text: 'Memilih pivot yang baik (misalnya elemen tengah atau acak) membantu menghindari kasus terburuk.',
          },
        ],
      },
    ],
    quiz: [
      {
        q: 'Quick Sort menggunakan strategi…',
        options: ['Brute force', 'Greedy', 'Divide and conquer', 'Backtracking'],
        answer: 2,
        explanation: 'Masalah dipecah menjadi bagian lebih kecil berdasarkan pivot, lalu diselesaikan secara rekursif.',
      },
      {
        q: 'Apa fungsi pivot pada Quick Sort?',
        options: [
          'Elemen terbesar yang dibuang',
          'Elemen acuan untuk membagi data menjadi dua bagian',
          'Penanda data sudah terurut',
          'Jumlah perulangan',
        ],
        answer: 1,
        explanation: 'Elemen yang lebih kecil dikumpulkan di sisi kiri pivot dan yang lebih besar di sisi kanan.',
      },
      {
        q: 'Pada [7, 2, 9, 4, 6] dengan pivot 6, bagian kiri (≤ 6) berisi…',
        options: ['[7, 9]', '[2, 4]', '[2, 4, 7]', '[2, 9]'],
        answer: 1,
        explanation: 'Hanya 2 dan 4 yang bernilai ≤ 6 (selain pivot itu sendiri).',
      },
      {
        q: 'Kompleksitas rata-rata Quick Sort adalah…',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        answer: 1,
        explanation: 'Pembagian yang cukup seimbang menghasilkan sekitar log n tingkat, masing-masing diproses dalam O(n).',
      },
      {
        q: 'Kapan Quick Sort mengalami kasus terburuk O(n²)?',
        options: [
          'Pivot selalu elemen tengah',
          'Data berisi banyak elemen sama',
          'Pivot selalu elemen terkecil atau terbesar',
          'Data berjumlah sedikit',
        ],
        answer: 2,
        explanation: 'Pembagian menjadi sangat tidak seimbang (0 dan n - 1 elemen), sehingga kedalaman rekursi menjadi n.',
      },
    ],
  },
  {
    id: 'm6',
    title: 'Insertion Sort',
    level: 'SMA',
    topic: 'Algoritma',
    duration: '16 menit',
    summary: 'Urutkan data dengan menyisipkan setiap elemen ke posisi yang tepat.',
    sections: [
      {
        heading: 'Apa itu Insertion Sort?',
        blocks: [
          {
            type: 'p',
            text: 'Insertion Sort membangun bagian yang terurut sedikit demi sedikit. Setiap elemen baru diambil, lalu disisipkan ke posisi yang benar di antara elemen yang sudah terurut.',
          },
          {
            type: 'p',
            text: 'Caranya mirip menyusun kartu di tangan: ambil satu kartu, geser kartu yang lebih besar, lalu sisipkan kartu tersebut.',
          },
          {
            type: 'tip',
            text: 'Insertion Sort sederhana dan efektif untuk data yang sedikit atau hampir terurut.',
          },
        ],
      },
      {
        heading: 'Cara kerja',
        blocks: [
          {
            type: 'steps',
            items: [
              'Anggap elemen pertama sudah terurut.',
              'Ambil elemen berikutnya sebagai key.',
              'Geser elemen di sebelah kiri yang lebih besar dari key satu posisi ke kanan.',
              'Sisipkan key pada posisi kosong yang tepat.',
              'Ulangi sampai semua elemen masuk ke bagian terurut.',
            ],
          },
        ],
      },
      {
        heading: 'Contoh',
        blocks: [
          { type: 'p', text: 'Urutkan [5, 3, 4, 1] dari kecil ke besar:' },
          {
            type: 'list',
            items: [
              'Ambil 3. Geser 5 ke kanan, sisipkan 3: [3, 5, 4, 1].',
              'Ambil 4. Geser 5 ke kanan, sisipkan 4: [3, 4, 5, 1].',
              'Ambil 1. Geser 5, 4, dan 3 ke kanan, sisipkan 1 di depan.',
              'Hasil akhir: [1, 3, 4, 5].',
            ],
          },
        ],
      },
      {
        heading: 'Kode dan kompleksitas',
        blocks: [
          {
            type: 'code',
            text: `def insertion_sort(data):
    for i in range(1, len(data)):
        key = data[i]
        j = i - 1
        while j >= 0 and data[j] > key:
            data[j + 1] = data[j]
            j -= 1
        data[j + 1] = key
    return data`,
          },
          {
            type: 'list',
            items: [
              'Terbaik: O(n), jika data sudah terurut.',
              'Rata-rata dan terburuk: O(n²).',
              'Stabil: urutan elemen bernilai sama tetap terjaga.',
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        q: 'Insertion Sort mengurutkan data dengan cara…',
        options: [
          'Membagi data menjadi dua bagian',
          'Menyisipkan elemen ke posisi yang tepat di bagian terurut',
          'Menukar elemen pertama dan terakhir',
          'Memilih pivot',
        ],
        answer: 1,
        explanation: 'Setiap elemen baru disisipkan ke posisi yang benar di antara elemen yang sudah terurut.',
      },
      {
        q: 'Pada [5, 3, 4], setelah 3 disisipkan, hasilnya adalah…',
        options: ['[5, 3, 4]', '[3, 5, 4]', '[4, 3, 5]', '[3, 4, 5]'],
        answer: 1,
        explanation: 'Angka 5 digeser ke kanan dan 3 disisipkan di depannya.',
      },
      {
        q: 'Elemen mana yang dibandingkan dengan key untuk mengurutkan menaik?',
        options: [
          'Elemen di bagian kiri yang lebih besar dari key',
          'Hanya elemen terakhir',
          'Semua elemen di bagian kanan',
          'Pivot saja',
        ],
        answer: 0,
        explanation: 'Elemen kiri yang lebih besar digeser ke kanan agar tersedia tempat untuk key.',
      },
      {
        q: 'Kompleksitas terbaik Insertion Sort adalah…',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        answer: 0,
        explanation: 'Jika data sudah terurut, setiap elemen hanya perlu diperiksa sekali.',
      },
      {
        q: 'Insertion Sort paling sesuai digunakan untuk…',
        options: [
          'Data kecil atau hampir terurut',
          'Data besar yang selalu acak',
          'Mencari data tanpa membandingkan',
          'Data yang wajib dibagi dua',
        ],
        answer: 0,
        explanation: 'Algoritma ini sederhana dan bekerja efisien ketika jumlah data sedikit atau hampir terurut.',
      },
    ],
  },
];

// ---------------------------------------------------------------- helpers
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Kuis harian: campuran soal dari semua materi.
export function buildDailyQuiz(count = 5) {
  const all = MATERI.flatMap((m) => m.quiz.map((q) => ({ ...q, from: m.title })));
  return shuffle(all).slice(0, count);
}