"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Memuat peta secara dinamis untuk menghindari error SSR
const MapComponent = dynamic(() => import('../components/MapPraBencana'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] md:h-[600px] w-full bg-[#faf8f5] rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-[#4a1511]/20 text-[#4a1511]/60 font-bold tracking-widest text-sm">
      <span className="text-4xl mb-3 animate-bounce">🗺️</span>
      MEMUAT PETA ZONASI BENCANA...
    </div>
  )
});

/* ─── DATA KONSTAN ─────────────────────────────────────────────── */

const hazards = [
  {
    icon: '💨',
    title: 'Awan Panas (Pyroclastic)',
    desc: 'Gas panas ≥700°C bercampur material padat. Kecepatan hingga 700 km/jam. Satu-satunya perlindungan adalah evakuasi segera.',
  },
  {
    icon: '🌋',
    title: 'Lahar & Aliran Lava',
    desc: 'Lahar dingin terbentuk saat hujan deras pasca erupsi. Tetap waspada di alur sungai hingga berminggu-minggu setelah letusan.',
  },
  {
    icon: '🌫️',
    title: 'Hujan Abu & Gas SO₂',
    desc: 'Mengganggu pernapasan dan penglihatan. Tutup sumur & tandon air. Gunakan masker N95 dan kacamata pelindung.',
  },
  {
    icon: '🌊',
    title: 'Tsunami Vulkanik',
    desc: 'Erupsi masif atau longsor bawah laut dapat memicu gelombang. Tanda: air laut surut tiba-tiba → segera lari ke dataran tinggi.',
  },
  {
    icon: '🪨',
    title: 'Lontaran Batu dan Pasir',
    desc: 'Material padat yang terlempar dari kawah saat letusan eksplosif.',
  },
  {
    icon: '🏚️',
    title: 'Gempa Bumi Vulkanik',
    desc: 'Getaran tanah yang disebabkan oleh pergerakan magma sebelum atau saat letusan, yang dapat meruntuhkan bangunan',
  },
];

const actionProtocols = [
  {
    level: 1, name: 'Level I — Normal',
    desc: 'Aktivitas normal. Pantau informasi PVMBG secara berkala. Pastikan tas siaga selalu terisi dan siap dibawa.',
  },
  {
    level: 2, name: 'Level II — Waspada',
    desc: 'Dilarang mendaki radius 2 km. Warga dalam radius 4 km bersiap evakuasi sewaktu-waktu. Ikuti arahan resmi BPBD.',
  },
  {
    level: 3, name: 'Level III — Siaga',
    desc: 'Warga dalam radius 4 km wajib mengungsi. Jauhi alur sungai. Aktifkan jalur komunikasi darurat keluarga.',
  },
  {
    level: 4, name: 'Level IV — Awas',
    desc: 'Evakuasi massal seluruh penduduk radius 7 km. Tinggalkan harta benda — utamakan keselamatan jiwa. Waspadai tsunami!',
  },
];

const checklistGroups = [
  {
    title: 'Dokumen & Identitas (Kedap Air)',
    items: [
      { label: 'KTP, Kartu Keluarga, Akta Lahir', sub: 'Simpan dalam plastik zip-lock' },
      { label: 'Buku Tabungan & Sertifikat Aset', sub: 'Dokumen kepemilikan penting' },
      { label: 'Ijazah & Surat Berharga', sub: '' },
    ],
  },
  {
    title: 'Perlengkapan Darurat (Tas Siaga)',
    items: [
      { label: 'Air minum 2 L + Makanan awet (3 hari)', sub: 'Biskuit, sarden kaleng, makanan bayi' },
      { label: 'Obat-obatan rutin & Kotak P3K', sub: 'Siapkan resep dokter minimal untuk 7 hari' },
      { label: 'Senter, baterai cadangan / Power bank', sub: '' },
      { label: 'Masker N95 (Perlindungan debu vulkanik)', sub: '' },
      { label: 'Peluit & Radio portabel', sub: 'Untuk memantau siaran darurat BPBD' },
    ],
  },
];

const officialSources = [
  { name: 'Magma Indonesia (PVMBG)', desc: 'Laporan harian & rekomendasi status', link: 'magma.esdm.go.id' },
  { name: 'inaRISK (BNPB)', desc: 'Peta risiko bencana nasional', link: 'inarisk.bnpb.go.id' },
  { name: 'BMKG', desc: 'Peringatan dini cuaca & tsunami', link: 'bmkg.go.id' },
  { name: 'Radio Darurat Sitaro', desc: 'Siaran koordinasi evakuasi lokal', link: 'FM 103.5 MHz' },
];

const disasterReductionGuide = [
  { num: 1, text: 'Tutup rapat jendela, Pintu, dan lubang angin rumah.' },
  { num: 2, text: 'Lindungi kendaraan bermotor atau peralatan mesin lainnya dan matikan mesinnya.' },
  { num: 4, text: 'Kumpulkan keluarga, ambil tas yang sudah di siapkan, dan segera mengungsi.' },
  { num: 5, text: 'Kenakan pakaian yang melindungi tubuh, seperti baju panjang, topi, dan lainnya.' },
  { num: 6, text: 'Gunakan kacamata atau apapun untuk mencegah debu masuk mata.' },
  { num: 7, text: 'Jangan memakai lensa kotak.' },
  { num: 8, text: 'Pakai masker atau kain untuk menutup mulut dan hidung.' },
  { num: 9, text: 'Menutup wajah dengan kedua belah tangan saat abu letusan gunung turun.' },
  { num: 10, text: 'Dengarkan instruksi pihak berwenang dan ikuti rute mengungsi yang di tetapkan.' },
  { num: 11, text: 'Hindari lokasi rawan letusan (Lereng Gunung, Lembah, Sungai Kering, Aliran lahar).' },
  { num: 12, text: 'Usahakan masuk ke ruang lindung darurat/ Bungker.' },
  { num: 13, text: 'Siapkan diri menghadapi bencana susulan.' },
];

/* ─── KOMPONEN UI ─────────────────────────────────────────────── */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h2 className="text-lg md:text-2xl font-bold text-[#4a1511] mb-5 flex items-center gap-3">
      <span className="text-2xl md:text-3xl">{icon}</span>
      {children}
    </h2>
  );
}

// Komponen Pembantu untuk Legenda Peta agar lebih rapi
function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
      <div className={`w-3 h-3 rounded-full ${colorClass} shadow-inner ring-1 ring-black/10`}></div>
      <span className="text-[11px] md:text-xs font-bold text-gray-700">{label}</span>
    </div>
  );
}

/* ─── HALAMAN UTAMA ─────────────────────────────────────────────── */

export default function Home() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentStatus, setCurrentStatus] = useState({
    level: 2,
    name: 'Waspada',
    roman: 'II',
    description: 'Aktivitas vulkanik menunjukkan peningkatan. Masyarakat diimbau untuk tidak mendekati kawah.',
    lastUpdated: 'Memuat data...'
  });

  useEffect(() => {
    async function fetchStatus() {
      try {
        const { data, error } = await supabase
          .from('volcano_status')
          .select('*')
          .eq('id', 1)
          .single();

        if (data && !error) {
          const romanNumerals = ['I', 'II', 'III', 'IV'];
          const roman = romanNumerals[data.level - 1] || 'I';
          
          const dateObj = new Date(data.updated_at);
          const formattedDate = dateObj.toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' 
          });

          setCurrentStatus({
            level: data.level,
            name: data.name,
            roman: roman,
            description: data.description,
            lastUpdated: `${formattedDate} WITA`
          });
        }
      } catch (err) {
        console.error("Gagal mengambil status gunung:", err);
      } finally {
        setIsLoading(false);
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

  const getLevelTheme = (level: number) => {
    switch(level) {
      case 1: return { color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50', border: 'border-emerald-500' };
      case 2: return { color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-700', lightBg: 'bg-amber-50', border: 'border-amber-500' };
      case 3: return { color: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700', lightBg: 'bg-orange-50', border: 'border-orange-500' };
      case 4: return { color: '#dc2626', bg: 'bg-red-600', text: 'text-red-700', lightBg: 'bg-red-50', border: 'border-red-600' };
      default: return { color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-700', lightBg: 'bg-amber-50', border: 'border-amber-500' };
    }
  };

  const theme = getLevelTheme(currentStatus.level);

  return (
    <main className="min-h-screen bg-[#faf8f5] py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 md:space-y-10">

        {/* ── 1. ALERT BANNER DINAMIS ── */}
        {!isLoading && (
          <div className={`${theme.bg} text-white rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 shadow-md`}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-white`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 bg-white/90`}></span>
              </span>
              <span className="font-bold tracking-widest uppercase text-sm whitespace-nowrap">Status {currentStatus.name}</span>
            </div>
            <p className="text-sm md:text-base leading-relaxed flex-1 border-l-0 md:border-l border-white/20 pl-0 md:pl-4">
              {currentStatus.description}
            </p>
            <div className="text-xs font-semibold bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm self-start md:self-center">
              Diperbarui: {currentStatus.lastUpdated}
            </div>
          </div>
        )}

        {/* ── 2. HEADER UTAMA RESMI ── */}
        <div className="bg-[#4a1511] text-white p-6 md:p-10 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 rounded-l-full translate-x-1/3 scale-150 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <div className="inline-block bg-white/10 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-red-200 border border-red-300/20 mb-4">
              Portal Siaga Bencana Daerah
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Sistem Informasi Bencana <br className="hidden md:block"/>
              Gunung Ruang
            </h1>
            <p className="text-gray-200 text-sm md:text-lg leading-relaxed font-light">
              Pusat informasi mitigasi, pemantauan status terkini, pemetaan kawasan rawan, dan panduan kesiapsiagaan masyarakat di Kepulauan Sitaro, Sulawesi Utara.
            </p>
          </div>

          <div className="relative z-10 bg-white p-5 md:p-6 rounded-3xl shadow-2xl text-center min-w-[200px] w-full md:w-auto">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Tingkat Aktivitas</p>
            <div className={`text-5xl md:text-6xl font-black mb-1 ${theme.text}`}>
              {isLoading ? '-' : currentStatus.roman}
            </div>
            <div className={`text-base md:text-lg font-bold uppercase tracking-widest ${theme.text}`}>
              {isLoading ? 'Memuat...' : currentStatus.name}
            </div>
            <div className="flex gap-1 mt-4">
              {[1, 2, 3, 4].map((lvl) => (
                <div key={lvl} className={`h-2 flex-1 rounded-full ${lvl <= currentStatus.level ? theme.bg : 'bg-gray-100'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. METRIK UTAMA ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5">
          {[
            { num: '725 mdpl', lbl: 'Ketinggian', sub: 'Tipe Stratovolcano' },
            { num: '±12.000', lbl: 'Jiwa Rentan', sub: 'Dalam Radius 7 KM' },
            { num: 'Tsunami', lbl: 'Potensi Ikutan', sub: 'Akibat material vulkanik yang masuk ke laut' },
            { num: 'VEI 4', lbl: 'Kekuatan Erupsi', sub: 'Skala Volcanic Explosivity Index' },
            { num: '2024', lbl: 'Terakhir Letusan', sub: 'Erupsi Besar Terakhir' },
          ].map(({ num, lbl, sub }, i) => (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-black text-[#4a1511] mb-1">{num}</div>
              <div className="text-[10px] md:text-[11px] font-bold text-gray-800 uppercase tracking-wider">{lbl}</div>
              <div className="text-[10px] text-gray-400 mt-1 hidden md:block">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── 4. PETA WEBGIS & PROTOKOL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Kolom Peta (Lebar 8/12) */}
          <div className="lg:col-span-8 bg-white p-4 md:p-5 rounded-[32px] shadow-lg border border-gray-100 flex flex-col">
            
            {/* Header Peta (Aman dari bug overlap absolute) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-2">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#4a1511] flex items-center gap-2">
                  <span>🗺️</span> Peta Dampak Erupsi 2024
                </h3>
                <p className="text-xs font-medium text-gray-500">Pemetaan Titik Evakuasi & Area Rentan Bencana</p>
                <p className="text-[10px] text-gray-400 mt-1">Sumber Data : BMKG 2024</p>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">Area Sebaran Abu Vulkanik </span>
              </div>
            </div>
            
            {/* Area Peta */}
            <div className="w-full h-[400px] md:h-[550px] rounded-2xl overflow-hidden mb-5 border border-gray-200">
              <MapComponent />
            </div>

            {/* LEGENDA PETA SESUAI WARNA PIN */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5">
               <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">Legenda Penanda Peta</div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <LegendItem colorClass="bg-red-600" label="Pusat Erupsi" />
                  <LegendItem colorClass="bg-yellow-500" label="Posko Terpusat" />
                  <LegendItem colorClass="bg-green-500" label="Posko Sementara" />
                  <LegendItem colorClass="bg-blue-600" label="Drop Point Bantuan" />
                  <LegendItem colorClass="bg-gray-800" label="Bandara Terdampak" />
                  <LegendItem colorClass="bg-purple-500" label="Lokasi Anda" />
                  
                  {/* Area Polygon */}
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm col-span-2 md:col-span-3">
                     <div className="w-4 h-4 bg-orange-400 opacity-50 border border-orange-500 rounded-sm"></div>
                     <span className="text-[11px] md:text-xs font-bold text-gray-700">Area Erupsi (Satelit VEI 4)</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Kolom Instruksi (Lebar 4/12) */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <Card className="!p-5 md:!p-6 flex-1">
              <h3 className="text-sm font-bold text-[#4a1511] uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <span>📋</span> Instruksi Keselamatan
              </h3>
              <div className="space-y-3">
                {actionProtocols.map((protocol) => {
                  const isCurrent = protocol.level === currentStatus.level;
                  return (
                    <div key={protocol.level} className={`rounded-2xl p-4 border-2 transition-all ${isCurrent ? `${theme.lightBg} ${theme.border} shadow-sm` : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCurrent ? theme.text : 'text-gray-500'}`}>
                        {protocol.name}
                      </div>
                      <p className={`text-[11px] md:text-xs leading-relaxed ${isCurrent ? 'text-gray-800' : 'text-gray-500'}`}>
                        {protocol.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* ── 5. KARAKTERISTIK BAHAYA & TAS SIAGA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <Card>
            <CardTitle icon="⚠️">Mengenal Potensi Bahaya</CardTitle>
            <p className="text-xs text-gray-500 mb-5 border-l-2 border-[#4a1511] pl-3 font-medium">
              Pahami karakteristik letusan Gunung Ruang agar Anda dan keluarga dapat mengambil keputusan evakuasi yang tepat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {hazards.map(({ icon, title, desc }) => (
                <div key={title} className="bg-gray-50/50 rounded-2xl p-4 md:p-5 border border-gray-100 transition-colors hover:bg-white hover:border-[#4a1511]/20">
                  <div className="text-2xl mb-2">{icon}</div>
                  <h4 className="text-sm font-bold text-[#4a1511] mb-1.5">{title}</h4>
                  <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle icon="🎒">Ceklis Tas Siaga Bencana</CardTitle>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 md:p-4 mb-5">
              <p className="text-xs text-orange-800 leading-relaxed font-medium">
                Siapkan tas ransel evakuasi. Sentuh/klik daftar di bawah ini untuk menandai perlengkapan yang sudah Anda siapkan di rumah.
              </p>
            </div>

            <div className="space-y-5">
              {checklistGroups.map((group) => (
                <div key={group.title}>
                  <h4 className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">{group.title}</h4>
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const key = `${group.title}-${item.label}`;
                      const checked = checkedItems.has(key);
                      return (
                        <div key={key} onClick={() => toggleCheck(key)} className={`flex items-start gap-3 p-2.5 md:p-3 rounded-xl cursor-pointer transition-all border ${checked ? 'bg-emerald-50/80 border-emerald-100' : 'border-transparent hover:bg-gray-50'}`}>
                          <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all ${checked ? 'bg-emerald-500 shadow-sm' : 'bg-gray-100 border border-gray-300'}`}>
                            {checked && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className={`text-xs md:text-sm font-bold transition-colors ${checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {item.label}
                            </div>
                            {item.sub && <div className="text-[10px] text-gray-500 mt-0.5">{item.sub}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── 6. PANDUAN MENGURANGI RISIKO BENCANA ── */}
        <Card>
          <CardTitle icon="📚">Informasi Panduan Mengurangi Risiko Bencana Gunung Meletus</CardTitle>
          <p className="text-xs text-gray-500 mb-5 border-l-2 border-[#4a1511] pl-3 font-medium">
            Ikuti langkah-langkah penting ini untuk melindungi diri dan keluarga dari bahaya letusan gunung meletus.
          </p>
          <div className="space-y-2.5">
            {disasterReductionGuide.map((guide) => (
              <div key={guide.num} className="flex items-start gap-3 p-3 md:p-4 bg-gradient-to-r from-orange-50/50 to-red-50/30 rounded-xl border border-orange-100/50 hover:border-orange-200 transition-colors">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4a1511] text-white flex items-center justify-center text-xs font-bold">
                  {guide.num}
                </div>
                <p className="text-xs md:text-sm text-gray-800 leading-relaxed pt-0.5">
                  {guide.text}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 7. FOOTER INFORMASI RESMI ── */}
        <div className="bg-[#2a0e0c] text-gray-400 p-6 md:p-8 rounded-3xl flex flex-col lg:flex-row justify-between items-center gap-5 text-center lg:text-left">
          <div>
            <h5 className="text-white font-bold mb-1.5 md:text-lg">Portal Siaga Bencana Daerah — Gunung Ruang</h5>
            <p className="text-xs md:text-sm text-gray-400">Pusat Informasi Mitigasi Terintegrasi Berbasis Data PVMBG, BNPB & BMKG.</p>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-3">
            {officialSources.slice(0, 3).map((src) => (
              <a key={src.name} href={`https://${src.link}`} target="_blank" rel="noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition-colors text-white font-bold">
                Link: {src.name}
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}