# 🌋 RuangTangguh / YOTA: WebGIS Sistem Informasi Bencana Gunung Ruang

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

**YOTA / RuangTangguh** adalah sebuah prototipe Sistem Informasi Geografis Berbasis Web (WebGIS) terintegrasi yang dirancang khusus untuk manajemen bencana gunung meletus. Platform ini memfasilitasi mitigasi, tanggap darurat *real-time*, dan pemulihan pasca-bencana dengan studi kasus **Gunung Ruang di Kepulauan Sitaro, Sulawesi Utara**.

🔗 **[Lihat Demo Langsung (Live Preview)](https://ruangtangguh.vercel.app/)**

---

## ✨ Fitur Utama

Sistem ini dirancang untuk menyasar 3 siklus manajemen bencana dengan 3 peran pengguna utama (Admin BPBD, Relawan Lapangan, dan Warga/Publik):

### 🟢 1. Pra-Bencana (Mitigasi & Kesiapsiagaan)
* **Peta WebGIS Interaktif:** Pemetaan zonasi bahaya, posko terpusat/sementara, bandara terdampak, dan jalur logistik menggunakan *Leaflet.js*. Mendukung *Layer Switcher* (OSM, Citra Satelit Esri, Topografi).
* **Radius Bahaya Dinamis:** Area zona merah (Area Wajib Kosong) pada peta dapat diperbesar/diperkecil langsung oleh Admin melalui Dasbor secara *real-time*.
* **Edukasi Interaktif:** Ceklis tas siaga bencana interaktif dan panduan protokol keselamatan berdasarkan Tingkat Aktivitas (Level I - IV).
* **YOTA AI Chatbot:** Asisten virtual cerdas terintegrasi dengan penjelas lengkap 24/7.

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
* **Backend & Database:** Supabase, PostgreSQL + PostGIS
* **Real-time Engine:** Supabase Realtime (WebSockets)
* **Data Visualization:** Recharts
* **3D Rendering:** Three.js
* **Deployment:** Vercel

---

## 🚀 Panduan Instalasi (Local Development)

**1. Clone & Install**
```bash
git clone https://github.com/ZaiskyDNA/WebGIS-GunungRuang.git
cd WebGIS-GunungRuang
npm install
npm run dev
```

Aplikasi tersedia di [http://localhost:3000](http://localhost:3000).

---

## 🔐 Variabel Lingkungan (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wxrfjuqxhvvsqisijgmc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.6-flash
```

---

## 📁 Struktur Proyek

- `app/` — Halaman dan layout Next.js App Router (`/`, `/tanggap-darurat`, `/pasca-bencana`, `/simulasi`, `/dashboard`, `/login`, `/api/chat`).
- `components/` — Navigasi, WebGIS Maps, YOTA AI Chat, Push Notification, dan Scene 3D.
- `lib/` — Supabase client, helper status gunung, dan fisika simulasi.
- `public/` — Asset statis (`maskot.webp`, `veiscala.jpg`).
