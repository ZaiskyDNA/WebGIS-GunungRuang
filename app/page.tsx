/*
  Page Pra-Bencana: Mitigasi Gunung Ruang
*/
"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MapComponent = dynamic(() => import('../components/MapPraBencana'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-gray-800 animate-pulse rounded-xl flex items-center justify-center border border-volcano-dark/20 text-volcano-sand/60 font-medium text-sm">
      Memuat Peta Kawasan Rawan Bencana...
    </div>
  )
});

/* ─── Data ─── */

const krbZones = [
  {
    color: 'bg-red-600',
    borderColor: 'border-red-600',
    textColor: 'text-red-800',
    bgLight: 'bg-red-50',
    name: 'KRB III — Bahaya Tinggi',
    radius: '< 2,5 km',
    desc: 'Awan panas, lontaran batu pijar, gas beracun. Dilarang huni & aktivitas.',
  },
  {
    color: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-800',
    bgLight: 'bg-orange-50',
    name: 'KRB II — Bahaya Sedang',
    radius: '< 5 km',
    desc: 'Hujan abu lebat, aliran lahar, lontaran material dari erupsi.',
  },
  {
    color: 'bg-yellow-400',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
    bgLight: 'bg-yellow-50',
    name: 'Zona Bebas Aktivitas',
    radius: '< 6 km',
    desc: 'Larangan saat status Siaga/Awas. Lindungi saluran pernapasan.',
  },
  {
    color: 'bg-gray-400',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-50',
    name: 'KRB I — Bahaya Rendah',
    radius: '< 7 km',
    desc: 'Dampak abu tipis, waspada lahar dingin saat hujan deras.',
  },
];

const monitoringIndicators = [
  { label: 'Kegempaan', value: 'Meningkat', highlight: true },
  { label: 'Deformasi Tanah', value: 'Normal', highlight: false },
  { label: 'SO₂ Flux', value: 'Tinggi', highlight: true },
  { label: 'Visual Asap', value: '±300 m', highlight: false },
];

const hazards = [
  {
    color: 'border-red-300 bg-red-50',
    labelColor: 'text-red-800',
    title: 'Awan Panas (Pyroclastic)',
    desc: 'Gas panas ≥700°C bercampur material padat. Kecepatan hingga 700 km/jam. Satu-satunya perlindungan adalah evakuasi segera.',
  },
  {
    color: 'border-orange-300 bg-orange-50',
    labelColor: 'text-orange-800',
    title: 'Lahar & Aliran Lava',
    desc: 'Lahar dingin terbentuk saat hujan deras pasca erupsi. Tetap waspada di alur sungai hingga berminggu-minggu setelah erupsi.',
  },
  {
    color: 'border-yellow-300 bg-yellow-50',
    labelColor: 'text-yellow-800',
    title: 'Hujan Abu & Gas SO₂',
    desc: 'Mengganggu pernapasan dan penglihatan. Tutup sumur & tandon air. Gunakan masker N95 dan kacamata pelindung.',
  },
  {
    color: 'border-blue-300 bg-blue-50',
    labelColor: 'text-blue-800',
    title: 'Tsunami Vulkanik',
    desc: 'Erupsi masif atau longsor bawah laut dapat memicu gelombang. Tanda: air laut surut tiba-tiba → segera lari ke dataran tinggi.',
  },
];

const actionProtocols = [
  {
    level: 'Level I — Normal',
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
    textTitle: 'text-yellow-900',
    textDesc: 'text-yellow-800',
    desc: 'Aktivitas normal. Pantau informasi PVMBG secara berkala. Pastikan tas siaga selalu terisi dan siap dibawa.',
  },
  {
    level: 'Level II — Waspada ← Status Saat Ini',
    border: 'border-orange-400',
    bg: 'bg-orange-50',
    textTitle: 'text-orange-900',
    textDesc: 'text-orange-800',
    desc: 'Dilarang mendaki. Warga dalam radius 4 km bersiap evakuasi sewaktu-waktu. Ikuti arahan resmi BPBD.',
    isCurrent: true,
  },
  {
    level: 'Level III — Siaga',
    border: 'border-red-400',
    bg: 'bg-red-50',
    textTitle: 'text-red-900',
    textDesc: 'text-red-800',
    desc: 'Warga dalam radius 4 km wajib mengungsi. Jauhi alur sungai. Aktifkan jalur komunikasi keluarga.',
  },
  {
    level: 'Level IV — Awas',
    border: 'border-red-700',
    bg: 'bg-red-100',
    textTitle: 'text-red-950',
    textDesc: 'text-red-900',
    desc: 'Evakuasi massal seluruh penduduk radius 7 km. Tinggalkan harta benda — utamakan keselamatan jiwa. Waspadai tsunami jika terjadi erupsi besar.',
  },
];

const checklistGroups = [
  {
    title: 'Dokumen & Identitas',
    items: [
      { label: 'KTP, Kartu Keluarga, Akta Lahir', sub: 'Fotokopi dalam plastik zip-lock kedap air' },
      { label: 'Buku Tabungan & Sertifikat Tanah/Rumah', sub: 'Dokumen kepemilikan aset penting' },
      { label: 'Ijazah & Dokumen Pendidikan', sub: '' },
    ],
  },
  {
    title: 'Perlengkapan Darurat',
    items: [
      { label: 'Air minum 2 L + makanan tahan lama (3 hari)', sub: 'Biskuit, sarden kaleng, makanan bayi jika diperlukan' },
      { label: 'Obat-obatan rutin & Kotak P3K', sub: 'Termasuk obat resep dokter minimal 7 hari' },
      { label: 'Senter + baterai cadangan / power bank', sub: '' },
      { label: 'Masker N95 untuk perlindungan abu vulkanik', sub: '' },
      { label: 'Peluit & radio portabel (siaran darurat)', sub: 'Radio FM untuk pengumuman BPBD' },
      { label: 'Pakaian ganti, selimut, jas hujan', sub: '' },
    ],
  },
];

const officialSources = [
  { name: 'Magma Indonesia (PVMBG)', desc: 'Level aktivitas, laporan harian, rekomendasi', link: 'magma.esdm.go.id' },
  { name: 'inaRISK (BNPB)', desc: 'Peta risiko bencana nasional interaktif', link: 'inarisk.bnpb.go.id' },
  { name: 'BMKG', desc: 'Cuaca, gelombang laut, peringatan dini tsunami', link: 'bmkg.go.id' },
  { name: 'Aplikasi Info BMKG', desc: 'Peringatan dini & sirine digital di genggaman', link: 'Play Store / App Store' },
  { name: 'Radio Darurat BPBD Sitaro', desc: 'Siaran pengumuman & koordinasi evakuasi', link: 'FM 103.5 MHz' },
];

/* Komponen Kecil */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-volcano-main border-b-2 border-volcano-main/20 pb-2 mb-4">
      {children}
    </h2>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-volcano-dark/10 p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-base">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-volcano-dark">{children}</h3>
    </div>
  );
}

/*---- Page Utama -------- */

export default function Home() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  
  // State untuk menyimpan data dinamis dari Supabase
  const [currentStatus, setCurrentStatus] = useState({
    level: 2,
    name: 'Waspada',
    roman: 'II',
    description: 'Memuat data...',
    lastUpdated: 'Memuat...'
  });

  // Fungsi untuk mengambil data status dari Supabase
  useEffect(() => {
    async function fetchStatus() {
      const { data, error } = await supabase
        .from('volcano_status')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        // Konversi angka ke romawi
        const romanNumerals = ['I', 'II', 'III', 'IV'];
        const roman = romanNumerals[data.level - 1] || 'I';
        
        // Format tanggal (misal: 12 Apr 2024)
        const dateObj = new Date(data.updated_at);
        const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        setCurrentStatus({
          level: data.level,
          name: data.name,
          roman: roman,
          description: data.description,
          lastUpdated: formattedDate
        });
      }
    }
    
    fetchStatus();
  }, []);

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Menentukan warna dinamis berdasarkan level saat ini
  const getLevelColor = (level: number) => {
    if (level === 1) return 'text-yellow-300 bg-yellow-300'; // Normal
    if (level === 2) return 'text-orange-400 bg-orange-400'; // Waspada
    if (level === 3) return 'text-red-500 bg-red-500';       // Siaga
    return 'text-red-700 bg-red-700';                        // Awas
  };

  // Memisahkan class warna teks dan background
  const levelTextColor = getLevelColor(currentStatus.level).split(' ')[0];
  const levelBgColor = getLevelColor(currentStatus.level).split(' ')[1];

  return (
    <main className="min-h-screen bg-volcano-sand">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* ── Alert Banner Dinamis ── */}
        <div className={`text-white rounded-xl px-5 py-3 flex items-center gap-3 border-l-4 border-volcano-dark ${currentStatus.level >= 3 ? 'bg-red-600' : 'bg-volcano-main'}`}>
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${levelBgColor}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${levelBgColor}`}></span>
          </span>
          <p className="text-sm leading-relaxed flex-1">
            <span className="font-semibold">Status Terkini:</span> {currentStatus.description}
          </p>
          <span className={`flex-shrink-0 text-volcano-dark text-xs font-semibold px-3 py-1 rounded-full ${levelBgColor}`}>
            Diperbarui: {currentStatus.lastUpdated}
          </span>
        </div>

        {/* ── Header ── */}
        <div className="bg-volcano-dark rounded-xl p-6 md:p-8 text-white relative overflow-hidden">
          {/* Dekorasi lingkaran */}
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-16 -bottom-14 w-40 h-40 rounded-full bg-white/[0.03] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-volcano-main flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2L2 22h20L12 2zm0 4l7.5 14h-15L12 6zm-1 5v4h2v-4h-2zm0 5v2h2v-2h-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold leading-snug">
                  Sistem Informasi Bencana-Fase Pra-Bencana<br className="hidden md:block"/>
                  Gunung Ruang, Sulawesi Utara
                </h1>
                <p className="mt-2 text-sm text-white/65 leading-relaxed max-w-2xl">
                  Platform WebGIS untuk mitigasi, pemantauan Kawasan Rawan Bencana (KRB), dan
                  kesiapsiagaan masyarakat terdampak erupsi Gunung Ruang.
                </p>
              </div>
            </div>

            {/* Header Statistik */}
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { num: '725 mdpl', lbl: 'Ketinggian Puncak' },
                { num: '±12.000', lbl: 'Jiwa Terancam' },
                { num: '2 Desa', lbl: 'Radius 2,5 KM' },
                { num: '7 KM', lbl: 'Radius Bahaya Maks.' },
                { num: '1603', lbl: 'Pertama Terdokumentasi' },
              ].map(({ num, lbl }) => (
                <div key={lbl}>
                  <div className="text-lg font-semibold text-yellow-300">{num}</div>
                  <div className="text-xs text-white/50 mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Baris 1: Status Level + Metrik ── */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">

          {/* Status Level Dinamis */}
          <div className="bg-volcano-dark rounded-xl p-5 text-white flex flex-col">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Level Aktivitas Saat Ini</p>
            <div className={`text-5xl font-semibold leading-none ${levelTextColor}`}>
              {currentStatus.roman}
            </div>
            <div className="text-sm text-white/80 mt-1">{currentStatus.name}</div>

            {/* Progress bar Dinamis */}
            <div className="flex gap-1 mt-4">
              {['Normal', 'Waspada', 'Siaga', 'Awas'].map((l, i) => (
                <div
                  key={l}
                  className={`flex-1 h-1.5 rounded-full ${i < currentStatus.level ? levelBgColor : 'bg-white/20'}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {['Normal', 'Waspada', 'Siaga', 'Awas'].map((l, i) => (
                <span key={l} className={`text-[10px] ${i + 1 === currentStatus.level ? 'text-white font-bold' : 'text-white/40'}`}>{l}</span>
              ))}
            </div>

            {/* Indikator Pemantauan */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 mb-3">Indikator Pemantauan PVMBG</p>
              <div className="space-y-2">
                {monitoringIndicators.map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-white/60 text-xs">{label}</span>
                    <span className={`text-xs font-medium ${highlight ? levelTextColor : 'text-white/75'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-auto pt-4 text-[10px] text-white/30">
              Sumber: PVMBG / Magma Indonesia
            </p>
          </div>

          {/* Grid Metrik */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { num: '4×5 KM', lbl: 'Luas Pulau Ruang', sub: 'Seluruhnya terbentuk dari gunung' },
              { num: '±500 m', lbl: 'Diameter Kawah', sub: 'Kedalaman 50–100 meter' },
              { num: '9× Erupsi', lbl: 'Letusan Besar Tercatat', sub: '1808, 1871, 2002, 2024' },
              { num: 'Tsunami', lbl: 'Risiko Tambahan', sub: 'Erupsi besar → gelombang pesisir' },
              { num: 'Laingpatehi', lbl: 'Desa Utama KRB III', sub: 'Radius 2,5 km — paling rentan' },
              { num: 'Pumpente', lbl: 'Desa Utama KRB III', sub: 'Radius bahaya langsung' },
            ].map(({ num, lbl, sub }) => (
              <div
                key={num}
                className="bg-[#FDF5EC] rounded-xl p-4 border border-volcano-dark/10"
              >
                <div className="text-lg font-semibold text-volcano-main leading-tight">{num}</div>
                <div className="text-xs font-medium text-volcano-dark mt-1">{lbl}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Baris 2: Peta + KRB Zones ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

          {/* Peta */}
          <Card>
            <CardTitle icon="📍">Peta Kawasan Rawan Bencana (KRB) — Gunung Ruang</CardTitle>
            <div className="h-[500px] w-full rounded-xl overflow-hidden">
              <MapComponent />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {[
                { color: 'bg-red-600', label: 'KRB III — 2,5 km' },
                { color: 'bg-orange-500', label: 'KRB II — 5 km' },
                { color: 'bg-yellow-400', label: 'Bebas aktivitas — 6 km' },
                { color: 'bg-gray-400', label: 'KRB I — 7 km' },
                { color: 'bg-blue-600', label: 'Posko evakuasi', rounded: true },
              ].map(({ color, label, rounded }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`w-3 h-3 ${color} ${rounded ? 'rounded-sm' : 'rounded-full'} opacity-80`} />
                  {label}
                </span>
              ))}
            </div>
          </Card>

          {/* KRB Zones Detail */}
          <Card>
            <CardTitle icon="🛡️">Zona Bahaya (KRB)</CardTitle>
            <div className="space-y-3">
              {krbZones.map(({ color, name, radius, desc, bgLight,labelColor}) => (
                <div key={name} className={`${bgLight} rounded-lg p-3 border-l-4 ${color.replace('bg-', 'border-')}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-xs font-semibold ${labelColor}`}>{name}</div>
                    <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 ${labelColor}`}>
                      {radius}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 pt-3 border-t border-volcano-dark/10 text-[11px] text-gray-500 leading-relaxed">
              Penetapan KRB berdasarkan <strong>PVMBG</strong> Kementerian ESDM RI.
            </p>
          </Card>
        </div>

        {/* ── Baris 3: Karakteristik Bahaya + Protokol Tindakan ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Karakteristik Bahaya */}
          <Card>
            <CardTitle icon="⚠️">Karakteristik Bahaya Gunung Ruang</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hazards.map(({ color, labelColor, title, desc }) => (
                <div key={title} className={`rounded-xl p-3.5 border ${color}`}>
                  <div className={`text-[11px] font-semibold uppercase tracking-wide ${labelColor} mb-1.5`}>
                    {title}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Protokol Tindakan per Level */}
          <Card>
            <CardTitle icon="📋">Protokol Tindakan Berdasarkan Status</CardTitle>
            <div className="space-y-2.5">
              {actionProtocols.map((protocol, index) => {
                const protocolLevel = index + 1; // 1, 2, 3, 4
                const isCurrent = protocolLevel === currentStatus.level;
                
                return (
                  <div
                    key={protocol.level}
                    className={`rounded-xl p-3.5 border-l-4 ${protocol.border} ${protocol.bg} ${isCurrent ? 'ring-2 ring-orange-400 shadow-md' : ''}`}
                  >
                    <div className={`text-xs font-semibold ${protocol.textTitle} mb-1 flex items-center gap-2`}>
                      {protocol.level}
                      {isCurrent && (
                        <span className={`text-[10px] text-white px-1.5 py-0.5 rounded-full font-medium ${levelBgColor}`}>
                          Status Saat Ini
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${protocol.textDesc} leading-relaxed`}>{protocol.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Perhatian Khusus Tsunami */}
            <div className="mt-4 pt-3 border-t border-volcano-dark/10 flex gap-3 items-start bg-blue-50 rounded-xl p-3.5 border border-blue-200">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">▲</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-900 mb-0.5">Perhatian Khusus: Risiko Tsunami Lokal</div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Jika erupsi besar terjadi, segera menjauh dari pesisir ke dataran tinggi minimal
                  30 meter dpl — tanpa menunggu sirine peringatan.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Baris 4: Checklist Tas Siaga + Sumber Informasi ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Checklist Tas Siaga */}
          <Card>
            <CardTitle icon="🎒">Checklist Tas Siaga Bencana</CardTitle>
            <div className="text-xs text-gray-600 mb-4 px-3 py-2.5 bg-volcano-orange/10 rounded-lg border-l-3 border-volcano-orange leading-relaxed">
              Siapkan tas kedap air yang mudah dijinjing. Simpan di lokasi yang mudah dijangkau.
              Periksa kondisi isi setiap 6 bulan sekali.
            </div>

            {checklistGroups.map((group) => (
              <div key={group.title} className="mb-4">
                <p className="text-[10px] font-semibold text-volcano-dark uppercase tracking-widest mb-2">
                  {group.title}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const key = `${group.title}-${item.label}`;
                    const checked = checkedItems.has(key);
                    return (
                      <div
                        key={key}
                        className="flex gap-3 items-start cursor-pointer group"
                        onClick={() => toggleCheck(key)}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                            ${checked
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-volcano-dark/30 group-hover:border-volcano-main'
                            }`}
                        >
                          {checked && (
                            <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 12 12">
                              <path d="M1 6l3.5 3.5L11 2"/>
                              <path stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M1.5 6l3.5 3.5 5.5-6"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className={`text-xs leading-snug ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {item.label}
                          </div>
                          {item.sub && (
                            <div className="text-[10.5px] text-gray-400 mt-0.5">{item.sub}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              {checkedItems.size === 0
                ? 'Klik item untuk menandai ✓ — centang semua sebelum musim erupsi.'
                : `${checkedItems.size} dari ${checklistGroups.reduce((s, g) => s + g.items.length, 0)} item sudah disiapkan.`}
            </div>
          </Card>

          {/* Sumber Informasi Resmi */}
          <Card>
            <CardTitle icon="📡">Sumber Informasi Resmi</CardTitle>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Selalu gunakan sumber resmi pemerintah. Hindari berita dari media sosial yang belum
              diverifikasi oleh lembaga berwenang.
            </p>
            <div className="space-y-2.5">
              {officialSources.map(({ name, desc, link }) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-[#FDF5EC] rounded-xl border border-volcano-dark/10"
                >
                  <div>
                    <div className="text-xs font-semibold text-volcano-dark">{name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{desc}</div>
                  </div>
                  <span className="flex-shrink-0 text-[11px] font-medium text-volcano-main">
                    {link}
                  </span>
                </div>
              ))}
            </div>

            {/* Profil Gunung Ruang */}
            <div className="mt-5 pt-4 border-t border-volcano-dark/10">
              <p className="text-[10px] font-semibold text-volcano-dark uppercase tracking-widest mb-3">
                Profil Singkat Gunung Ruang
              </p>
              <div className="space-y-1.5 text-xs text-gray-700">
                {[
                  ['Lokasi', 'Pulau Ruang, Kec. Tagulandang, Kab. Sitaro, Sulawesi Utara'],
                  ['Tipe', 'Stratovolcano — membentuk seluruh Pulau Ruang'],
                  ['Ketinggian', '725 meter di atas permukaan laut (mdpl)'],
                  ['Diameter Kawah', '±500 m dengan kedalaman 50–100 m'],
                  ['Erupsi Terakhir', 'April 2024 — Status Awas Level IV'],
                  ['Desa Terdampak', 'Laingpatehi & Pumpente'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="font-medium text-volcano-dark w-28 flex-shrink-0">{k}</span>
                    <span className="text-gray-600 leading-snug">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ── Footer ── */}
        <div className="bg-volcano-dark rounded-xl px-6 py-4 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs text-white/50 leading-relaxed">
            <span className="text-white/70 font-medium">WebGIS Pra-Bencana — Gunung Ruang</span>
            <br />
            Sistem Informasi Mitigasi Bencana Vulkanik · Purwarupa Akademik · Data: PVMBG, BNPB, BMKG
          </div>
          <div className="text-xs text-white/35">
            2°18'N 125°25'E · Kab. Sitaro, Sulut
          </div>
        </div>

      </div>
    </main>
  );
}