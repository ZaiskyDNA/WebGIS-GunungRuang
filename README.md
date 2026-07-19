# 🌋 RuangTangguh: WebGIS Sistem Informasi Bencana Gunung Ruang

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

**RuangTangguh** adalah sebuah prototipe Sistem Informasi Geografis Berbasis Web (WebGIS) terintegrasi yang dirancang khusus untuk manajemen bencana gunung meletus. Platform ini memfasilitasi mitigasi, tanggap darurat *real-time*, dan edukasi pasca-bencana dengan studi kasus **Gunung Ruang di Kepulauan Sitaro, Sulawesi Utara**. 

*Proyek ini dikembangkan sebagai purwarupa (prototype) untuk Lomba Karya Tulis Ilmiah (KTI).*

🔗 **[Lihat Demo Langsung (Live Preview)](https://ruangtangguh.vercel.app/)** 

---

## ✨ Fitur Utama

Sistem ini dirancang untuk menyasar 3 siklus manajemen bencana dengan 3 peran pengguna utama (Admin BPBD, Relawan Lapangan, dan Warga/Publik):

### 🟢 1. Pra-Bencana (Mitigasi & Kesiapsiagaan)
* **Peta WebGIS Interaktif:** Pemetaan zonasi bahaya, posko terpusat/sementara, bandara terdampak, dan jalur logistik menggunakan *Leaflet.js*. Mendukung *Layer Switcher* (OSM, Citra Satelit Esri, Topografi).
* **Radius Bahaya Dinamis:** Area zona merah (Area Wajib Kosong) pada peta dapat diperbesar/diperkecil langsung oleh Admin melalui Dasbor secara *real-time*.
* **Edukasi Interaktif:** Ceklis tas siaga bencana interaktif dan panduan protokol keselamatan berdasarkan Tingkat Aktivitas (Level I - IV).
* **AI Chatbot terintegrasi:** Asisten virtual cerdas yang dilatih dengan dokumen mitigasi bencana untuk menjawab pertanyaan warga selama 24/7.

### 🟡 2. Tanggap Darurat (Respon *Real-Time*)
* **Dashboard Relawan:** Formulir cerdas bagi relawan di lapangan untuk memperbarui data jumlah pengungsi dan sisa stok logistik.
* **Analitik Logistik Otomatis:** Sistem otomatis menghitung *progress bar* kepenuhan kapasitas posko dan mendeteksi defisit (kekurangan) beras, air, dan masker berdasarkan perhitungan rasio per jiwa.
* **Push Notification Peringatan Dini:** Jika Admin menaikkan status gunung (misal ke Level IV: AWAS), website akan memicu Notifikasi Sistem (OS) dan *In-App Modal* merah darurat kepada semua pengguna yang sedang membuka website.
* **Rute Evakuasi (GPS):** Integrasi *Google Maps Directions* untuk memberikan panduan navigasi dari lokasi pengguna saat ini menuju posko evakuasi terdekat.

### 🔴 3. Pasca-Bencana (Evaluasi & Edukasi)
* **Visualisasi Arsip Historis:** Grafik batang interaktif menggunakan *Recharts* yang memetakan riwayat *Volcanic Explosivity Index* (VEI) Gunung Ruang sejak tahun 1808 hingga 2024.
* **Edukasi Skala VEI:** Infografis dan materi saintifik mengenai daya ledak letusan berdasarkan data *U.S. National Park Service*.
* **Laboratorium Geofisika 3D:** Modul simulasi interaktif (menggunakan *Three.js*) untuk memvisualisasikan hubungan antara viskositas magma, tekanan gas, dan muntahan letusan gunung berapi.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Mapping:** React-Leaflet, Leaflet.js
* **Backend & Database:** Supabase, PostgreSQL
* **Spatial Data Engine:** PostGIS (Geometry Types)
* **Real-time Engine:** Supabase Realtime (WebSockets)
* **Data Visualization:** Recharts
* **3D Rendering:** React Three Fiber / Three.js
* **Layanan Formulir:** Formspree
* **Hosting / Deployment:** Vercel

---

## 🗄️ Arsitektur Database (ERD)

Proyek ini memanfaatkan **PostgreSQL + PostGIS** di Supabase.
Tabel utama meliputi:
* `volcano_status`: Menyimpan status level gunung dan radius bahaya dinamis.
* `evacuation_points`: Tabel spasial (menggunakan tipe data `Geometry`) untuk menyimpan koordinat posko, data demografi pengungsi, dan stok logistik.
* `profiles`: Manajemen hak akses (*Role: Admin, Relawan, Publik*).

---

## 🚀 Panduan Instalasi (Local Development)

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer Anda:

**1. Clone Repositori**
```bash
git clone [https://github.com/username-anda/ruang-tangguh.git](https://github.com/username-anda/ruang-tangguh.git)
cd ruang-tangguh
