# Product Requirements Document

## Ruang Escape — Lightweight Vertical Survival Game

**Versi:** 1.0
**Status:** Draft Implementasi
**Platform:** Website
**Tipe aplikasi:** Mini-game 2D berbasis browser
**Teknologi utama:** HTML5 Canvas, CSS, dan JavaScript
**Integrasi:** Website WebGIS bencana Gunung Ruang

---

## 1. Ringkasan Produk

**Ruang Escape** adalah mini-game survival vertikal yang ditempatkan pada website WebGIS bencana Gunung Ruang.

Pemain mengendalikan karakter yang bergerak ke arah atas untuk menghindari lava yang terus naik dari bawah layar. Selama permainan, pemain harus menghindari berbagai rintangan seperti batu vulkanik, pohon tumbang, retakan tanah, dan aliran lahar.

Game harus ringan, responsif, dapat dimainkan melalui desktop maupun perangkat seluler, serta tidak mengganggu performa utama WebGIS.

Game tidak menggunakan game engine besar, model 3D, video, atau physics engine eksternal. Seluruh permainan dibuat menggunakan HTML5 Canvas dan JavaScript.

---

## 2. Tujuan Produk

### 2.1 Tujuan utama

Membuat mini-game sederhana yang:

1. Menambah interaktivitas pada website WebGIS.
2. Memberikan pengalaman edukatif mengenai bahaya erupsi Gunung Ruang.
3. Dapat dimainkan dengan mudah oleh pengguna umum.
4. Tidak membuat halaman WebGIS menjadi berat.
5. Dapat berjalan dengan baik pada desktop dan perangkat seluler.

### 2.2 Tujuan edukasi

Game harus membantu pengguna memahami bahwa saat terjadi bencana gunung api:

* masyarakat harus segera menjauh dari area berbahaya;
* jalur yang terhalang dapat memperlambat proses evakuasi;
* lembah dan aliran sungai dapat menjadi jalur lahar;
* pemain harus mengikuti jalur aman;
* keputusan cepat dan tepat penting dalam proses evakuasi.

Game ini bukan simulasi kebencanaan yang sepenuhnya realistis. Game berfungsi sebagai media edukasi ringan dan hiburan.

---

## 3. Target Pengguna

Target pengguna meliputi:

* pelajar;
* mahasiswa;
* masyarakat umum;
* pengunjung website WebGIS;
* pengguna desktop;
* pengguna smartphone;
* pengguna yang belum memahami mitigasi bencana gunung api.

Rentang usia utama adalah 10 tahun ke atas.

---

## 4. Konsep Permainan

Pemain mengendalikan karakter yang bergerak ke arah atas layar.

Lava terus naik dari bagian bawah layar. Pemain harus bergerak ke kiri atau kanan untuk:

* menghindari rintangan;
* melewati celah aman;
* mengambil item tambahan;
* menjaga jarak dari lava;
* memperoleh skor setinggi mungkin.

Permainan berakhir ketika:

1. pemain menyentuh lava;
2. pemain menabrak rintangan berbahaya;
3. nyawa pemain habis.

---

## 5. Nama Sementara

Nama utama:

**Ruang Escape**

Alternatif nama:

* Lari dari Lava
* Ruang Rush
* Escape Ruang
* Ruang Survival
* Lava Chase
* Ruang Evacuation Run

Nama dapat diganti tanpa memengaruhi mekanisme game.

---

## 6. Ruang Lingkup MVP

Versi pertama atau Minimum Viable Product harus memiliki fitur berikut:

* halaman atau panel pembuka;
* tombol mulai permainan;
* karakter pemain;
* pergerakan kiri dan kanan;
* lingkungan yang bergerak vertikal;
* lava yang mengejar dari bawah;
* rintangan acak;
* sistem tabrakan;
* sistem skor;
* tingkat kesulitan yang meningkat;
* layar game over;
* tombol bermain kembali;
* kontrol keyboard;
* kontrol sentuh;
* desain responsif;
* penyimpanan skor tertinggi secara lokal;
* informasi mitigasi singkat setelah game over;
* game dimuat hanya saat pengguna membuka fitur game.

Fitur di luar MVP tidak boleh dikerjakan sebelum seluruh fitur MVP stabil.

---

## 7. Fitur yang Tidak Termasuk MVP

Fitur berikut tidak termasuk dalam implementasi versi pertama:

* multiplayer;
* login pemain;
* leaderboard online;
* sinkronisasi database;
* model 3D;
* video latar;
* sistem akun;
* pembelian dalam aplikasi;
* integrasi media sosial;
* level berbasis peta geografis nyata;
* physics engine;
* voice-over;
* cutscene;
* sistem inventaris;
* karakter dengan banyak animasi kompleks;
* integrasi langsung dengan data real-time aktivitas Ruang.

Fitur-fitur tersebut dapat dipertimbangkan pada versi berikutnya.

---

## 8. Platform dan Teknologi

### 8.1 Teknologi wajib

Gunakan:

* HTML5;
* CSS3;
* JavaScript ES6 atau lebih baru;
* HTML5 Canvas;
* `requestAnimationFrame`;
* `localStorage`;
* JavaScript module;
* SVG, WebP, atau PNG yang telah dioptimalkan.

### 8.2 Teknologi yang tidak digunakan

Jangan menggunakan:

* Unity WebGL;
* Unreal Engine;
* Three.js;
* Phaser, kecuali benar-benar diperlukan;
* React hanya untuk game;
* physics engine eksternal;
* library animasi besar;
* jQuery;
* video sebagai latar permainan.

Game harus tetap dapat dijalankan hanya dengan JavaScript native.

### 8.3 Integrasi dengan framework website

Game harus dibuat sebagai modul terpisah sehingga dapat dimasukkan ke website yang menggunakan:

* HTML biasa;
* React;
* Vue;
* Next.js;
* Laravel;
* framework lain.

Logika inti game tidak boleh bergantung pada framework utama website.

---

## 9. Struktur Halaman Game

Game dapat ditampilkan melalui salah satu cara berikut:

1. halaman khusus, misalnya `/game`;
2. modal;
3. panel khusus;
4. tab di dalam website;
5. iframe lokal apabila diperlukan.

Pilihan yang direkomendasikan adalah halaman khusus atau modal layar penuh.

Contoh navigasi:

```text
WebGIS
  ├── Beranda
  ├── Peta Bencana
  ├── Informasi Mitigasi
  └── Game Ruang Escape
```

---

## 10. Alur Pengguna

```text
Pengguna membuka menu game
        ↓
Aset dan modul game dimuat
        ↓
Halaman pembuka ditampilkan
        ↓
Pengguna membaca petunjuk
        ↓
Pengguna menekan tombol Mulai
        ↓
Hitung mundur 3, 2, 1
        ↓
Permainan dimulai
        ↓
Pemain bergerak dan menghindari rintangan
        ↓
Skor bertambah
        ↓
Kecepatan permainan meningkat
        ↓
Pemain menyentuh lava atau rintangan
        ↓
Game over
        ↓
Skor dan informasi mitigasi ditampilkan
        ↓
Pengguna memilih Main Lagi atau Kembali
```

---

## 11. Tampilan Utama

### 11.1 Start screen

Start screen harus menampilkan:

* judul game;
* maskot atau karakter utama;
* tombol `Mulai`;
* tombol `Petunjuk`;
* skor tertinggi;
* tombol `Kembali ke WebGIS`;
* opsi suara aktif atau nonaktif.

### 11.2 Gameplay screen

Gameplay screen harus menampilkan:

* area permainan;
* karakter pemain;
* lava;
* rintangan;
* skor berjalan;
* jarak yang telah ditempuh;
* tombol pause;
* tombol kontrol pada perangkat seluler.

### 11.3 Pause screen

Pause screen harus menampilkan:

* tulisan `Permainan Dijeda`;
* tombol `Lanjutkan`;
* tombol `Mulai Ulang`;
* tombol `Keluar`.

### 11.4 Game-over screen

Game-over screen harus menampilkan:

* tulisan `Game Over`;
* penyebab kekalahan;
* skor akhir;
* skor tertinggi;
* jarak yang ditempuh;
* satu pesan mitigasi;
* tombol `Main Lagi`;
* tombol `Kembali ke Menu`.

---

## 12. Mekanisme Inti

### 12.1 Pergerakan pemain

Pemain bergerak ke kiri dan kanan.

Pergerakan ke atas dapat dibuat secara visual dengan cara:

* pemain berada relatif tetap pada bagian tengah layar;
* lingkungan dan rintangan bergerak ke bawah;
* lava bergerak naik apabila pemain melambat atau terkena penalti.

Kontrol desktop:

```text
Arrow Left / A  → bergerak ke kiri
Arrow Right / D → bergerak ke kanan
Space / Escape  → pause
```

Kontrol perangkat seluler:

* sentuh sisi kiri layar untuk bergerak ke kiri;
* sentuh sisi kanan layar untuk bergerak ke kanan;
* atau gunakan dua tombol virtual;
* tombol pause berada di kanan atas.

Pergerakan harus terasa halus dan tidak berpindah secara patah-patah.

### 12.2 Batas area permainan

Pemain tidak boleh keluar dari area canvas.

Contoh pembatasan posisi:

```javascript
player.x = Math.max(
  0,
  Math.min(player.x, canvas.width - player.width)
);
```

### 12.3 Pergerakan dunia

Rintangan dan elemen lingkungan bergerak ke bawah untuk menciptakan ilusi bahwa pemain bergerak naik.

Kecepatan dunia bertambah secara bertahap berdasarkan:

* waktu bertahan;
* skor;
* jarak tempuh.

---

## 13. Lava

Lava berada pada bagian bawah area permainan.

Karakteristik lava:

* bergerak naik secara perlahan;
* memberikan tekanan agar pemain terus bergerak;
* memiliki animasi sederhana;
* tidak memakai efek partikel berlebihan;
* menyebabkan game over saat menyentuh pemain.

Lava dapat digambar menggunakan:

* rectangle;
* gradient sederhana;
* pola gelombang;
* sprite kecil yang diulang.

Hindari simulasi cairan atau physics kompleks.

### 13.1 Perilaku lava

Kecepatan lava:

* lambat pada awal permainan;
* meningkat secara bertahap;
* naik lebih cepat saat pemain terkena rintangan ringan;
* dapat turun sedikit saat pemain mengambil item tertentu.

Contoh variabel awal:

```javascript
const lava = {
  y: canvas.height - 60,
  baseSpeed: 0.25,
  currentSpeed: 0.25,
  maximumSpeed: 1.2
};
```

---

## 14. Rintangan

MVP harus memiliki minimal tiga jenis rintangan.

### 14.1 Batu vulkanik

Karakteristik:

* diam di jalur;
* harus dihindari;
* tabrakan menyebabkan game over atau kehilangan nyawa.

### 14.2 Pohon tumbang

Karakteristik:

* berbentuk horizontal;
* memiliki celah pada sisi kiri atau kanan;
* memaksa pemain memilih jalur.

### 14.3 Retakan tanah

Karakteristik:

* berbentuk area gelap atau garis tidak beraturan;
* mengurangi kecepatan pemain;
* menyebabkan lava semakin dekat.

### 14.4 Aliran lahar

Fitur opsional untuk MVP apabila performa mencukupi.

Karakteristik:

* bergerak horizontal;
* muncul dari kiri atau kanan;
* harus dihindari;
* tidak boleh muncul terlalu sering.

---

## 15. Aturan Spawn Rintangan

Rintangan muncul dari bagian atas canvas.

Aturan wajib:

* tidak boleh muncul saling menumpuk secara tidak adil;
* selalu tersedia minimal satu jalur yang dapat dilewati;
* tidak boleh muncul langsung di atas posisi pemain tanpa waktu bereaksi;
* jarak antar-rintangan harus mempertimbangkan kecepatan permainan;
* jumlah objek aktif dibatasi.

Batas objek aktif yang direkomendasikan:

```text
Desktop: maksimal 10 rintangan
Mobile: maksimal 8 rintangan
```

Contoh jeda spawn:

```javascript
spawnInterval = Math.max(
  minimumSpawnInterval,
  initialSpawnInterval - difficultyLevel * 50
);
```

Nilai awal yang direkomendasikan:

```javascript
const initialSpawnInterval = 1400;
const minimumSpawnInterval = 550;
```

---

## 16. Sistem Tabrakan

Gunakan collision detection berbasis rectangle atau circle sederhana.

Rekomendasi:

* Axis-Aligned Bounding Box;
* bounding box pemain dibuat sedikit lebih kecil dari gambar;
* hindari pixel-perfect collision.

Contoh:

```javascript
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
```

Hitbox pemain sebaiknya sekitar 70–80% dari ukuran visual karakter agar permainan terasa lebih adil.

---

## 17. Sistem Nyawa

Untuk MVP, pilih salah satu pendekatan berikut.

### Opsi A — Sekali terkena langsung kalah

Kelebihan:

* implementasi paling sederhana;
* permainan terasa cepat;
* aturan mudah dipahami.

### Opsi B — Sistem tiga nyawa

Kelebihan:

* lebih ramah untuk pemain pemula;
* memungkinkan variasi rintangan.

Rekomendasi MVP:

Gunakan satu kali tabrakan langsung game over untuk batu vulkanik dan lava. Retakan tanah hanya memberikan penalti kecepatan.

---

## 18. Sistem Skor

Skor diperoleh berdasarkan:

* waktu bertahan;
* jarak tempuh;
* rintangan yang berhasil dilewati;
* item yang dikumpulkan.

Formula sederhana:

```text
Skor = waktu bertahan × 10
     + rintangan dilewati × 5
     + item dikumpulkan × 20
```

Implementasi dapat menggunakan skor berbasis frame atau delta time.

Contoh:

```javascript
score += deltaTime * scoreMultiplier;
```

Skor yang ditampilkan harus dibulatkan menjadi bilangan bulat.

---

## 19. Skor Tertinggi

Skor tertinggi disimpan menggunakan `localStorage`.

Contoh key:

```javascript
const HIGH_SCORE_KEY = "ruangEscapeHighScore";
```

Contoh penyimpanan:

```javascript
const highScore = Number(
  localStorage.getItem(HIGH_SCORE_KEY) || 0
);

if (currentScore > highScore) {
  localStorage.setItem(HIGH_SCORE_KEY, currentScore);
}
```

Tidak diperlukan penyimpanan ke server pada MVP.

---

## 20. Tingkat Kesulitan

Tingkat kesulitan meningkat secara otomatis selama permainan.

Kesulitan dipengaruhi oleh:

* kecepatan scroll;
* kecepatan lava;
* frekuensi munculnya rintangan;
* jumlah rintangan;
* kemungkinan munculnya rintangan bergerak.

Contoh tahap:

| Waktu bertahan   | Tingkat | Kondisi                        |
| ---------------- | ------: | ------------------------------ |
| 0–20 detik       |       1 | Lava lambat, rintangan sedikit |
| 21–40 detik      |       2 | Scroll lebih cepat             |
| 41–60 detik      |       3 | Rintangan lebih sering         |
| 61–90 detik      |       4 | Lava semakin cepat             |
| Di atas 90 detik |       5 | Kecepatan maksimum             |

Kesulitan harus memiliki batas agar game tetap dapat dimainkan.

---

## 21. Sistem Power-Up

Power-up tidak wajib pada implementasi paling awal.

Apabila ditambahkan, gunakan maksimal tiga jenis berikut.

### 21.1 Masker

Efek:

* menambah skor;
* menampilkan fakta tentang abu vulkanik;
* tidak perlu memengaruhi mekanisme kompleks.

### 21.2 Perisai

Efek:

* melindungi pemain dari satu kali tabrakan;
* aktif maksimal lima detik.

### 21.3 Sepatu cepat

Efek:

* meningkatkan kecepatan gerak pemain;
* aktif maksimal lima detik.

### 21.4 Penurun lava

Efek:

* menurunkan posisi lava;
* tidak boleh digunakan terlalu sering.

Power-up harus menggunakan ikon sederhana dan tidak menambah banyak objek aktif.

---

## 22. Informasi Edukasi

Setiap game over harus menampilkan satu informasi mitigasi secara acak.

Contoh pesan:

```text
Saat erupsi, ikuti arahan petugas dan gunakan jalur evakuasi resmi.
```

```text
Hindari lembah dan aliran sungai karena dapat menjadi jalur lahar.
```

```text
Gunakan masker untuk mengurangi paparan abu vulkanik.
```

```text
Siapkan dokumen penting dan perlengkapan darurat dalam satu tas.
```

```text
Jangan kembali ke zona bahaya sebelum ada informasi resmi.
```

```text
Tetap tenang dan prioritaskan keselamatan saat melakukan evakuasi.
```

Tambahkan catatan:

```text
Game ini merupakan media edukasi dan bukan pengganti panduan resmi kebencanaan.
```

---

## 23. Desain Visual

### 23.1 Gaya visual

Gunakan gaya:

* kartun 2D;
* sederhana;
* ramah;
* jelas;
* tidak terlalu realistis;
* sesuai dengan maskot gunung api;
* mudah dibaca pada layar kecil.

### 23.2 Palet warna

Rekomendasi warna:

```css
:root {
  --lava-orange: #ff6b00;
  --lava-red: #d93600;
  --lava-yellow: #ffc928;
  --rock-dark: #292d32;
  --rock-gray: #51565c;
  --safe-green: #2fa56f;
  --gis-cyan: #13b8c4;
  --background-dark: #17191c;
  --text-light: #f7f7f7;
}
```

Warna dapat disesuaikan dengan identitas visual website.

### 23.3 Ukuran canvas

Ukuran internal yang direkomendasikan:

```text
Lebar: 360 px
Tinggi: 640 px
```

Canvas harus diperbesar atau diperkecil secara responsif menggunakan CSS.

Contoh:

```css
.game-canvas {
  width: min(100%, 420px);
  height: auto;
  aspect-ratio: 9 / 16;
}
```

Jangan mengubah resolusi internal canvas setiap frame.

---

## 24. Aset Visual

Gunakan format aset berikut:

* SVG untuk ikon;
* WebP untuk sprite;
* PNG transparan apabila WebP tidak tersedia.

Batas ukuran aset:

| Jenis aset       |           Batas rekomendasi |
| ---------------- | --------------------------: |
| Sprite pemain    |                      100 KB |
| Sprite rintangan |              50 KB per aset |
| Background       |                      250 KB |
| Audio efek       |             100 KB per file |
| Musik            | 500 KB atau tidak digunakan |
| Total aset MVP   |             Maksimal 1,5 MB |

Gunakan satu sprite sheet apabila memungkinkan.

---

## 25. Audio

Audio bersifat opsional.

Audio yang dapat digunakan:

* suara tombol;
* suara tabrakan;
* suara mengambil item;
* suara game over;
* musik latar singkat.

Aturan audio:

* tidak autoplay sebelum interaksi pengguna;
* tersedia tombol mute;
* volume awal tidak terlalu keras;
* audio dimuat setelah pengguna membuka game;
* gunakan format MP3 atau OGG berukuran kecil;
* jangan memutar banyak suara secara bersamaan.

---

## 26. Performa

### 26.1 Target performa

Game harus memenuhi target berikut:

* sekitar 60 FPS pada perangkat modern;
* minimal 30 FPS pada perangkat kelas menengah;
* tidak menyebabkan halaman WebGIS lag saat game belum dibuka;
* waktu muat game maksimal sekitar 2–3 detik pada koneksi normal;
* penggunaan memori tetap rendah;
* tidak ada memory leak.

### 26.2 Optimasi wajib

Gunakan:

* satu canvas utama;
* `requestAnimationFrame`;
* object pooling untuk rintangan apabila diperlukan;
* pembatasan jumlah objek;
* penghapusan objek yang keluar layar;
* sprite yang telah dikompresi;
* event listener yang dibersihkan saat game ditutup;
* delta time untuk konsistensi kecepatan.

Jangan:

* membuat elemen DOM baru setiap frame;
* menggunakan `setInterval` sebagai game loop utama;
* memuat seluruh aset website kembali;
* melakukan network request selama gameplay;
* menggunakan filter blur besar;
* menggunakan bayangan kompleks pada banyak objek;
* membuat ratusan partikel.

---

## 27. Lazy Loading

Game tidak boleh dimuat ketika pengguna hanya membuka halaman WebGIS.

Gunakan dynamic import.

Contoh:

```javascript
const gameButton = document.querySelector("#open-game");

gameButton.addEventListener("click", async () => {
  const gameModule = await import("./game/index.js");
  gameModule.mountGame("#game-container");
});
```

Saat game ditutup, hentikan:

* animation frame;
* audio;
* event listener;
* timer;
* proses spawn;
* input handler.

---

## 28. Game State

Gunakan state yang jelas.

```javascript
const GameState = Object.freeze({
  LOADING: "loading",
  MENU: "menu",
  COUNTDOWN: "countdown",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "game_over"
});
```

Perubahan state harus dilakukan melalui fungsi khusus.

Contoh:

```javascript
function setGameState(nextState) {
  gameState = nextState;
}
```

Game loop hanya memperbarui gameplay saat state bernilai `PLAYING`.

---

## 29. Struktur File

Struktur berikut direkomendasikan:

```text
ruang-escape/
├── index.html
├── README.md
├── assets/
│   ├── images/
│   │   ├── player.webp
│   │   ├── rock.webp
│   │   ├── fallen-tree.webp
│   │   ├── ground-crack.webp
│   │   ├── lava.webp
│   │   └── background.webp
│   ├── icons/
│   │   ├── pause.svg
│   │   ├── sound-on.svg
│   │   └── sound-off.svg
│   └── audio/
│       ├── collision.mp3
│       ├── pickup.mp3
│       └── game-over.mp3
├── css/
│   └── game.css
└── js/
    ├── index.js
    ├── config.js
    ├── game.js
    ├── renderer.js
    ├── input.js
    ├── collision.js
    ├── storage.js
    ├── audio.js
    ├── entities/
    │   ├── player.js
    │   ├── obstacle.js
    │   ├── lava.js
    │   └── power-up.js
    └── utils/
        ├── random.js
        └── math.js
```

Untuk versi sangat sederhana, file JavaScript dapat dikurangi menjadi:

```text
js/
├── game.js
├── input.js
└── storage.js
```

---

## 30. Konfigurasi Game

Semua nilai keseimbangan game harus diletakkan dalam satu file konfigurasi.

Contoh:

```javascript
export const GAME_CONFIG = {
  canvas: {
    width: 360,
    height: 640
  },

  player: {
    width: 48,
    height: 58,
    speed: 280
  },

  world: {
    initialSpeed: 130,
    maximumSpeed: 320,
    acceleration: 3
  },

  obstacle: {
    initialSpawnInterval: 1400,
    minimumSpawnInterval: 550,
    maximumActive: 8
  },

  lava: {
    initialHeight: 52,
    initialSpeed: 8,
    maximumSpeed: 28
  },

  score: {
    timeMultiplier: 10,
    obstacleBonus: 5,
    itemBonus: 20
  }
};
```

Angka dapat disesuaikan setelah pengujian.

---

## 31. Game Loop

Gunakan struktur game loop berikut:

```javascript
let previousTime = 0;
let animationFrameId = null;

function gameLoop(currentTime) {
  const deltaTime = Math.min(
    (currentTime - previousTime) / 1000,
    0.05
  );

  previousTime = currentTime;

  if (gameState === GameState.PLAYING) {
    update(deltaTime);
  }

  render();

  animationFrameId = requestAnimationFrame(gameLoop);
}
```

Delta time harus dibatasi untuk mencegah objek melompat jauh saat tab browser kembali aktif.

---

## 32. Fungsi Update

Fungsi `update()` minimal menjalankan:

```text
1. Membaca input pemain
2. Memperbarui posisi pemain
3. Memperbarui posisi rintangan
4. Memperbarui posisi lava
5. Membuat rintangan baru
6. Menghapus objek di luar layar
7. Memeriksa tabrakan
8. Memperbarui skor
9. Memperbarui tingkat kesulitan
10. Memeriksa kondisi game over
```

Contoh:

```javascript
function update(deltaTime) {
  updatePlayer(deltaTime);
  updateObstacles(deltaTime);
  updateLava(deltaTime);
  updateSpawner(deltaTime);
  checkCollisions();
  updateScore(deltaTime);
  updateDifficulty(deltaTime);
  cleanupEntities();
}
```

---

## 33. Rendering

Fungsi render minimal menggambar elemen dalam urutan berikut:

```text
1. Background
2. Dekorasi lingkungan
3. Rintangan
4. Power-up
5. Pemain
6. Lava
7. Efek ringan
8. HUD
```

Gunakan `clearRect` setiap frame.

Contoh:

```javascript
function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(context);
  drawObstacles(context);
  drawPlayer(context);
  drawLava(context);
  drawHUD(context);
}
```

---

## 34. Input

Input harus mendukung keyboard dan sentuhan.

Struktur state input:

```javascript
const inputState = {
  left: false,
  right: false
};
```

Keyboard:

```javascript
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
```

Touch:

```javascript
leftButton.addEventListener("pointerdown", () => {
  inputState.left = true;
});

leftButton.addEventListener("pointerup", () => {
  inputState.left = false;
});
```

Gunakan Pointer Events apabila memungkinkan agar satu implementasi dapat mendukung mouse dan sentuhan.

Pastikan `pointercancel` juga ditangani.

---

## 35. Responsivitas

Game harus:

* muat pada layar smartphone;
* tidak menghasilkan horizontal scroll;
* tetap memiliki rasio 9:16;
* dapat dimainkan dalam orientasi portrait;
* tetap berfungsi pada desktop;
* memiliki tombol sentuh berukuran minimal 44 × 44 px.

Pada desktop, canvas dapat ditampilkan dengan lebar maksimal sekitar 420 px.

Pada perangkat seluler, canvas menggunakan hampir seluruh lebar layar.

---

## 36. Aksesibilitas

Implementasikan:

* tombol yang memiliki label jelas;
* kontras teks yang cukup;
* kontrol keyboard;
* indikator pause;
* pilihan mute;
* teks petunjuk di luar canvas;
* elemen tombol menggunakan elemen `<button>`;
* `aria-label` untuk tombol berbasis ikon.

Contoh:

```html
<button
  id="pause-button"
  type="button"
  aria-label="Jeda permainan"
>
  <img src="./assets/icons/pause.svg" alt="">
</button>
```

Jangan hanya mengandalkan warna untuk membedakan rintangan.

---

## 37. Integrasi dengan WebGIS

Game harus dipisahkan dari komponen peta utama.

Ketika game dibuka:

* layer peta tidak perlu dimuat ulang;
* game tidak mengambil data dari peta;
* game tidak mengubah state WebGIS;
* game dapat ditutup tanpa melakukan refresh halaman.

Apabila WebGIS menggunakan Leaflet atau MapLibre:

* hentikan animasi peta saat modal game aktif apabila diperlukan;
* jangan menggambar game pada canvas yang sama dengan peta;
* gunakan container terpisah;
* pastikan tombol keyboard tidak menggerakkan peta saat game aktif.

Contoh:

```javascript
function activateGameMode() {
  map.dragging.disable();
  map.keyboard.disable();
}

function deactivateGameMode() {
  map.dragging.enable();
  map.keyboard.enable();
}
```

Kode tersebut hanya digunakan apabila game ditampilkan di atas peta.

---

## 38. Kondisi Game Over

Game over terjadi ketika:

```text
Pemain menyentuh lava
atau
Pemain menabrak rintangan fatal
```

Saat game over:

1. hentikan update gameplay;
2. ubah state menjadi `GAME_OVER`;
3. hentikan suara gameplay;
4. mainkan efek game over satu kali;
5. simpan skor tertinggi;
6. pilih pesan edukasi secara acak;
7. tampilkan game-over screen.

Jangan langsung menghentikan `requestAnimationFrame` apabila layar game over masih dirender oleh canvas.

---

## 39. Pause dan Resume

Game otomatis pause ketika:

* pengguna menekan tombol pause;
* pengguna menekan `Escape`;
* tab browser tidak aktif;
* modal game ditutup.

Gunakan Page Visibility API:

```javascript
document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameState === GameState.PLAYING) {
    pauseGame();
  }
});
```

Saat resume, reset `previousTime` agar delta time tidak terlalu besar.

---

## 40. Penyebab Kekalahan

Game-over screen dapat menampilkan penyebab:

```text
Lava berhasil mengejarmu.
```

```text
Kamu menabrak batu vulkanik.
```

```text
Kamu terhalang pohon tumbang.
```

Pesan harus singkat dan tidak menakutkan.

---

## 41. Analitik Opsional

Tanpa menyimpan data pribadi, sistem dapat mencatat:

* jumlah game dimulai;
* jumlah game selesai;
* skor rata-rata;
* durasi permainan;
* jenis perangkat;
* tombol keluar yang digunakan.

Analitik tidak wajib pada MVP.

Jangan menyimpan:

* nama pemain;
* alamat;
* lokasi GPS;
* data pribadi;
* informasi akun.

---

## 42. Kriteria Penerimaan

### 42.1 Start screen

* [ ] Game memiliki judul.
* [ ] Tombol mulai berfungsi.
* [ ] Petunjuk dapat dibuka.
* [ ] Skor tertinggi ditampilkan.
* [ ] Game tidak berjalan sebelum tombol mulai ditekan.

### 42.2 Gameplay

* [ ] Pemain dapat bergerak ke kiri.
* [ ] Pemain dapat bergerak ke kanan.
* [ ] Pemain tidak dapat keluar canvas.
* [ ] Rintangan muncul dari atas.
* [ ] Rintangan bergerak ke bawah.
* [ ] Lava terlihat dari bawah.
* [ ] Lava dapat mengejar pemain.
* [ ] Skor bertambah selama permainan.
* [ ] Kesulitan meningkat secara bertahap.
* [ ] Tidak ada jalur yang mustahil dilewati akibat spawn.

### 42.3 Collision

* [ ] Tabrakan dengan rintangan fatal terdeteksi.
* [ ] Tabrakan dengan lava terdeteksi.
* [ ] Hitbox terasa adil.
* [ ] Game over hanya dipanggil satu kali.

### 42.4 Game over

* [ ] Skor akhir ditampilkan.
* [ ] Skor tertinggi disimpan.
* [ ] Pesan mitigasi ditampilkan.
* [ ] Tombol main lagi berfungsi.
* [ ] Tombol kembali ke menu berfungsi.

### 42.5 Mobile

* [ ] Tombol kiri dan kanan dapat digunakan.
* [ ] Tidak ada scroll halaman selama bermain.
* [ ] Canvas menyesuaikan layar.
* [ ] Kontrol tidak tertutup elemen browser.
* [ ] Game dapat dimainkan dalam orientasi portrait.

### 42.6 Performa

* [ ] Game menggunakan `requestAnimationFrame`.
* [ ] Objek di luar layar dihapus.
* [ ] Jumlah rintangan aktif dibatasi.
* [ ] Tidak ada elemen DOM yang dibuat setiap frame.
* [ ] Game dimuat secara lazy loading.
* [ ] Event listener dibersihkan saat game ditutup.
* [ ] Tidak terdapat error pada console.

---

## 43. Skenario Pengujian

### Test Case 1 — Memulai permainan

```text
Given pengguna berada di start screen
When pengguna menekan tombol Mulai
Then hitung mundur ditampilkan
And permainan dimulai
And skor dimulai dari nol
```

### Test Case 2 — Bergerak ke kiri

```text
Given permainan sedang berjalan
When pengguna menekan tombol Arrow Left
Then pemain bergerak ke kiri
And pemain tidak melewati batas canvas
```

### Test Case 3 — Tabrakan rintangan

```text
Given pemain mendekati batu vulkanik
When hitbox pemain menyentuh hitbox batu
Then permainan berakhir
And penyebab kekalahan ditampilkan
```

### Test Case 4 — Tabrakan lava

```text
Given lava naik mendekati pemain
When hitbox pemain menyentuh lava
Then permainan berakhir
And skor akhir ditampilkan
```

### Test Case 5 — Skor tertinggi

```text
Given skor sebelumnya adalah 500
When pemain memperoleh skor 700
Then localStorage menyimpan nilai 700
And start screen menampilkan skor tertinggi 700
```

### Test Case 6 — Pause otomatis

```text
Given permainan sedang berjalan
When pengguna berpindah tab
Then permainan dijeda
And tidak ada objek yang tetap bergerak
```

### Test Case 7 — Restart

```text
Given game-over screen sedang ditampilkan
When pengguna menekan Main Lagi
Then seluruh state permainan direset
And rintangan lama dihapus
And skor kembali nol
```

---

## 44. Penanganan Error

Game harus tetap stabil apabila:

* gambar gagal dimuat;
* audio gagal dimuat;
* `localStorage` tidak tersedia;
* ukuran layar berubah;
* pengguna berpindah tab;
* pengguna menekan tombol dengan cepat;
* game dibuka dan ditutup berulang kali.

Gunakan fallback visual untuk aset yang gagal dimuat.

Contoh:

```javascript
function drawFallbackPlayer(context, player) {
  context.fillRect(
    player.x,
    player.y,
    player.width,
    player.height
  );
}
```

Kesalahan audio tidak boleh menghentikan game.

---

## 45. Tahapan Implementasi untuk AI Agent

### Tahap 1 — Membuat fondasi

Tugas:

* buat struktur folder;
* buat halaman game;
* buat container;
* buat canvas responsif;
* buat start screen;
* buat tombol mulai;
* buat file konfigurasi.

Hasil yang diharapkan:

* halaman dapat dibuka;
* canvas tampil dengan benar;
* tombol mulai mengubah state.

### Tahap 2 — Membuat game loop

Tugas:

* implementasikan `requestAnimationFrame`;
* implementasikan delta time;
* buat fungsi `update`;
* buat fungsi `render`;
* buat mekanisme pause.

Hasil yang diharapkan:

* loop berjalan stabil;
* canvas diperbarui;
* game dapat dijeda.

### Tahap 3 — Membuat pemain

Tugas:

* buat entity pemain;
* implementasikan gerakan;
* implementasikan batas layar;
* implementasikan input keyboard;
* implementasikan input sentuh.

Hasil yang diharapkan:

* pemain dapat bergerak halus ke kiri dan kanan.

### Tahap 4 — Membuat dunia bergerak

Tugas:

* buat background;
* buat elemen tanah atau jalur;
* implementasikan scrolling vertikal;
* tingkatkan kecepatan secara bertahap.

Hasil yang diharapkan:

* terlihat seolah pemain bergerak ke arah atas.

### Tahap 5 — Membuat rintangan

Tugas:

* buat minimal tiga rintangan;
* implementasikan spawn;
* implementasikan perpindahan;
* hapus objek di luar canvas;
* pastikan selalu tersedia jalur aman.

Hasil yang diharapkan:

* rintangan muncul secara acak tetapi tetap adil.

### Tahap 6 — Membuat lava

Tugas:

* gambar lava;
* implementasikan pergerakan lava;
* implementasikan tabrakan;
* tambahkan animasi gelombang ringan.

Hasil yang diharapkan:

* lava mengejar pemain tanpa simulasi kompleks.

### Tahap 7 — Collision dan game over

Tugas:

* implementasikan AABB collision;
* buat hitbox yang lebih kecil;
* buat kondisi game over;
* tampilkan penyebab kekalahan.

Hasil yang diharapkan:

* tabrakan terdeteksi secara konsisten.

### Tahap 8 — Sistem skor

Tugas:

* hitung skor berdasarkan waktu;
* tambahkan bonus melewati rintangan;
* simpan skor tertinggi;
* tampilkan HUD.

Hasil yang diharapkan:

* skor berjalan dan skor tertinggi berfungsi.

### Tahap 9 — Edukasi

Tugas:

* buat daftar pesan mitigasi;
* pilih pesan secara acak;
* tampilkan pada game-over screen;
* tambahkan disclaimer.

Hasil yang diharapkan:

* setiap permainan memberikan informasi edukatif.

### Tahap 10 — Optimasi

Tugas:

* batasi objek aktif;
* optimalkan aset;
* bersihkan event listener;
* uji memory leak;
* implementasikan lazy loading;
* uji FPS perangkat seluler.

Hasil yang diharapkan:

* game ringan dan tidak mengganggu WebGIS.

---

## 46. Instruksi Utama untuk AI Agent

Gunakan instruksi berikut selama implementasi:

```text
Bangun mini-game 2D berbasis HTML5 Canvas bernama Ruang Escape.

Game berupa vertical survival runner. Pemain bergerak ke kiri dan kanan,
sementara lingkungan bergerak ke bawah untuk menciptakan ilusi bahwa
pemain berlari ke atas.

Lava mengejar pemain dari bawah. Pemain harus menghindari batu vulkanik,
pohon tumbang, dan retakan tanah.

Gunakan JavaScript native tanpa game engine dan tanpa dependency besar.
Gunakan requestAnimationFrame dan delta time.

Game harus responsif untuk desktop dan mobile. Sediakan kontrol keyboard
serta kontrol sentuh.

Pisahkan konfigurasi, input, rendering, collision, storage, dan entity
sebisa mungkin, tetapi jangan membuat arsitektur menjadi terlalu kompleks.

Muat game menggunakan dynamic import agar tidak menambah beban awal WebGIS.

Simpan high score menggunakan localStorage.

Tampilkan fakta mitigasi bencana secara acak setelah game over.

Prioritaskan:
1. Kode sederhana.
2. Performa ringan.
3. Permainan yang adil.
4. Responsivitas.
5. Kemudahan integrasi.
6. Kemudahan pemeliharaan.

Jangan menggunakan:
- Unity;
- Three.js;
- physics engine;
- React khusus untuk game;
- animasi berat;
- video background;
- network request selama gameplay.

Implementasikan seluruh acceptance criteria yang tercantum dalam PRD.
```

---

## 47. Definition of Done

Fitur dinyatakan selesai apabila:

* game dapat dimulai;
* pemain dapat bergerak menggunakan keyboard;
* pemain dapat bergerak menggunakan layar sentuh;
* lava mengejar pemain;
* minimal tiga jenis rintangan tersedia;
* collision bekerja;
* game over bekerja;
* restart bekerja;
* pause bekerja;
* skor berjalan;
* high score tersimpan;
* pesan edukasi ditampilkan;
* game responsif;
* game dimuat secara lazy;
* tidak ada error pada console;
* tidak ada memory leak yang terlihat;
* performa minimal 30 FPS pada perangkat kelas menengah;
* source code memiliki komentar secukupnya;
* tersedia README instalasi dan integrasi.

---

## 48. Deliverables

AI Agent harus menghasilkan:

```text
1. Source code lengkap
2. File HTML
3. File CSS
4. File JavaScript
5. Placeholder aset
6. README.md
7. Petunjuk integrasi ke WebGIS
8. Petunjuk mengganti karakter dan rintangan
9. Petunjuk mengatur tingkat kesulitan
10. Daftar pengujian manual
```

---

## 49. Isi README yang Wajib

README harus menjelaskan:

* deskripsi game;
* teknologi;
* cara menjalankan secara lokal;
* struktur folder;
* cara integrasi;
* cara mengganti aset;
* cara mengubah konfigurasi;
* cara build apabila menggunakan bundler;
* cara deployment;
* daftar kontrol;
* catatan performa;
* disclaimer edukasi.

Contoh menjalankan secara lokal:

```bash
npx serve .
```

atau:

```bash
python -m http.server 8000
```

Game kemudian dapat dibuka melalui:

```text
http://localhost:8000
```

---

## 50. Pengembangan Versi Berikutnya

Setelah MVP stabil, fitur berikut dapat dipertimbangkan:

* beberapa karakter;
* pemilihan tingkat kesulitan;
* power-up;
* pencapaian;
* misi harian;
* leaderboard lokal;
* beberapa tema wilayah;
* rute evakuasi;
* checkpoint;
* mini-kuis setelah permainan;
* integrasi wilayah pada WebGIS;
* level berdasarkan desa;
* fakta kebencanaan yang lebih lengkap;
* statistik pembelajaran;
* leaderboard online;
* mode aksesibilitas;
* Progressive Web App.

Semua penambahan harus mempertahankan prinsip utama bahwa game tetap ringan.

---

## 51. Catatan Keamanan dan Edukasi

Game harus menyertakan disclaimer berikut:

> Ruang Escape merupakan permainan edukasi sederhana. Informasi di dalam game tidak menggantikan arahan resmi dari BPBD, PVMBG, pemerintah daerah, atau petugas kebencanaan.

Jangan menampilkan informasi status aktivitas Gunung Ruang secara real-time kecuali data berasal dari sumber resmi dan telah melalui mekanisme validasi.

Jangan menggunakan game untuk memberikan keputusan evakuasi yang sebenarnya.

---

## 52. Prioritas Implementasi

Gunakan urutan prioritas berikut:

### Must Have

* gameplay utama;
* gerakan kiri-kanan;
* lava;
* rintangan;
* collision;
* skor;
* game over;
* restart;
* mobile control;
* lazy loading;
* pesan edukasi.

### Should Have

* pause;
* suara;
* high score;
* animasi karakter;
* variasi rintangan;
* tingkat kesulitan dinamis.

### Could Have

* power-up;
* beberapa karakter;
* achievement;
* skin;
* beberapa background.

### Won’t Have pada MVP

* multiplayer;
* backend;
* leaderboard online;
* model 3D;
* data bencana real-time;
* integrasi GPS;
* akun pemain.

---

## 53. Kesimpulan

Ruang Escape harus menjadi mini-game yang:

* mudah dipahami;
* cepat dimainkan;
* ringan;
* edukatif;
* menarik secara visual;
* relevan dengan tema Gunung Ruang;
* mudah diintegrasikan ke website WebGIS.

Versi pertama harus berfokus pada pengalaman inti:

```text
Bergerak → Menghindari rintangan → Menjauhi lava → Mendapatkan skor
```

Jangan menambahkan fitur lanjutan sebelum mekanisme inti, kontrol, performa, dan pengalaman pengguna pada perangkat seluler telah stabil.
