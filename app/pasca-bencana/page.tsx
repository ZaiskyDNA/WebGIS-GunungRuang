"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { SimulationState, createInitialState, triggerEruption } from "../../lib/simulation";
import Controls from "../../components/ui/Controls";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Dynamic Import untuk Simulasi 2D Canvas
const VolcanoScene2D = dynamic(() => import("../../components/VolcanoScene2D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050208] text-[#ff6b35] font-mono gap-3 rounded-2xl">
      <div className="tracking-[0.2em] text-sm font-bold">MEMUAT MODEL FISIKA 2D...</div>
    </div>
  ),
});

// Data Historis VEI Gunung Ruang (Letusan Terkonfirmasi)
const veiHistoryData = [
  { year: '1808', vei: 2, desc: 'Explosive' },
  { year: '1836', vei: 2, desc: 'Explosive' },
  { year: '1840', vei: 2, desc: 'Explosive' },
  { year: '1856', vei: 1, desc: 'Severe' },
  { year: '1870', vei: 3, desc: 'Catastrophic' },
  { year: '1871', vei: 2, desc: 'Explosive' },
  { year: '1874', vei: 2, desc: 'Explosive' },
  { year: '1889', vei: 1, desc: 'Severe' },
  { year: '1904', vei: 3, desc: 'Catastrophic' },
  { year: '1914', vei: 2, desc: 'Explosive' },
  { year: '1949', vei: 2, desc: 'Explosive' },
  { year: '2002', vei: 4, desc: 'Cataclysmic' },
  { year: '2024', vei: 4, desc: 'Cataclysmic' },
];

export default function PascaBencana() {
  const [simState, setSimState] = useState<SimulationState>(createInitialState());
  const handleStateChange = useCallback((state: SimulationState) => setSimState(state), []);
  const handleTriggerEruption = useCallback(() => setSimState((prev) => triggerEruption(prev)), []);
  const handlePressureChange = useCallback((v: number) => setSimState((prev) => ({ ...prev, pressure: v })), []);
  const handleWindChange = useCallback((v: number) => setSimState((prev) => ({ ...prev, windStrength: v })), []);
  const handleViscosityChange = useCallback((v: number) => setSimState((prev) => ({ ...prev, viscosity: v })), []);

  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="yota-shell space-y-8 md:space-y-12">
        
        {/* =========================================
            HEADER HALAMAN
            ========================================= */}
        <div>
          <div className="yota-hero p-8 md:p-10 rounded-[32px] flex items-center">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 rounded-l-full translate-x-1/4 scale-150"></div>
            <div className="relative z-10 max-w-3xl">
              <div className="inline-block bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-red-200 border border-red-300/20 mb-4">
                YOTA · Pemulihan & Evaluasi
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Arsip Historis & Analitik Erupsi
              </h1>
              <p className="text-gray-200 md:text-lg leading-relaxed opacity-90 font-light">
                Mempelajari pola erupsi masa lalu melalui data indeks daya ledak (VEI) dan pemodelan fisika 3D. Analisis ini menjadi pondasi krusial bagi mitigasi tata ruang di masa depan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { value: '± 12.000', label: 'JIWA DIEVAKUASI' },
              { value: '3.000+', label: 'RUMAH RUSAK' },
              { value: '2 Desa', label: 'DIRELOKASI KE TEMPAT LAIN' },
              { value: 'Rp 300 M+', label: 'ESTIMASI KERUGIAN' },
            ].map((stat, i) => (
              <div key={i} className="bg-white py-6 md:py-8 px-4 rounded-2xl shadow-sm border border-gray-100 text-center transition-transform hover:-translate-y-1">
                <div className="text-2xl md:text-4xl font-black text-volcano-dark mb-2">{stat.value}</div>
                <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================
            SECTION 1: GRAFIK HISTORIS & GAMBAR VEI
            ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Grafik Bar VEI */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-volcano-dark flex items-center gap-2 mb-1">
                <span>📊</span> Jejak Historis Indeks Daya Ledak (1808 - 2024)
              </h2>
              <p className="text-sm text-gray-500">Grafik riwayat letusan terkonfirmasi Gunung Ruang berdasarkan skala VEI.</p>
            </div>
            
            <div style={{ width: '100%', minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={veiHistoryData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`${value}`, 'VEI']}
                    labelStyle={{ fontWeight: 'bold', color: '#5E0006', marginBottom: '4px' }}
                  />
                  <Bar dataKey="vei" radius={[6, 6, 0, 0]} maxBarSize={40} isAnimationActive={false}>
                    {veiHistoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.vei === 4 ? '#9B0F06' : entry.vei === 3 ? '#D53E0F' : '#EED9B9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex justify-center gap-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-volcano-sand rounded-sm"></div> VEI 1-2</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-volcano-orange rounded-sm"></div> VEI 3</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-volcano-main rounded-sm"></div> VEI 4</div>
            </div>
          </div>

          {/* Kartu Gambar Edukasi VEI (Baru) */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-volcano-dark tracking-tight">
                Mengenal Skala VEI
              </h2>
              <p className="text-gray-500 text-sm mt-1">Perbandingan volume material erupsi gunung berapi.</p>
            </div>
            
            {/* Wadah Gambar veiscala.jpg */}
            <div className="w-full flex-1 relative flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden p-4">
              <Image
                src="/veiscala.webp"
                alt="Infografis Skala Volcanic Explosivity Index (VEI)" 
                width={590}
                height={912}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="w-full h-full object-contain mix-blend-multiply"
                priority
              />
            </div>
          </div>
        </div>

        {/* =========================================
            SECTION 2: PEMODELAN FISIKA ERUPSI 2D
            ========================================= */}
        <div className="bg-volcano-dark text-white p-6 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden mt-8">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-block bg-white/10 p-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider text-orange-300 border border-orange-500/30">Modul Simulasi Geofisika</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Simulasi Erupsi Interaktif
              </h2>
              <p className="text-gray-300 mt-2 text-sm md:text-base leading-relaxed font-light">
                Eksplorasi interaktif variabel erupsi. Sesuaikan viskositas (kekentalan magma), tekanan gas, dan kecepatan angin untuk mensimulasikan dinamika letusan Gunung Ruang secara real-time.
              </p>
            </div>

            <div className="lg:col-span-8 relative w-full h-[400px] md:h-[550px] bg-[#050208] rounded-3xl overflow-hidden shadow-inner border-4 border-white/5">
              <VolcanoScene2D simState={simState} onStateChange={handleStateChange} />
              
              <Controls
                state={simState}
                onTriggerEruption={handleTriggerEruption}
                onPressureChange={handlePressureChange}
                onWindChange={handleWindChange}
                onViscosityChange={handleViscosityChange}
              />
            </div>
          </div>
        </div>

        {/* =========================================
            SECTION 3: KONTAK & EVALUASI
            ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-200 pt-12">
          {/* Info Kontak & Sosial Media */}
          <div>
            <h2 className="text-2xl font-bold text-volcano-dark mb-4">Pusat Layanan Informasi</h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              Hubungi kami untuk informasi darurat, donasi logistik, atau layanan evakuasi. Tim posko pusat kami beroperasi 24 jam selama masa tanggap darurat.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 text-xl">📞</div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hotline Darurat</div>
                  <div className="text-lg font-bold text-volcano-dark">117 (BNPB) / 119</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 text-xl">📧</div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Layanan</div>
                  <div className="text-lg font-bold text-volcano-dark">posko@yota.id</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Evaluasi via FORMSPREE */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-volcano-dark mb-2">Form Evaluasi & Saran</h2>
            <p className="text-xs text-gray-500 mb-6">Bantu kami meningkatkan layanan informasi website ini dengan memberikan masukan Anda.</p>
            <form action="https://formspree.io/f/mdaylwdv" method="POST" className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Email Anda</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="nama@email.com" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-volcano-orange outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Pesan / Masukan</label>
                <textarea 
                  rows={4} 
                  name="message" 
                  required 
                  placeholder="Tuliskan saran atau kendala yang Anda temukan..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-volcano-orange outline-none resize-none"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-volcano-main hover:bg-volcano-dark text-white font-bold py-3.5 rounded-xl transition shadow-md text-sm mt-2">
                Kirim Masukan
              </button>
            </form>
          </div>
        </div>

        <div className="text-center text-gray-400 text-[11px] pt-4 pb-2 border-t border-gray-200">
          Data Historis & VEI berdasarkan U.S. National Park Service & PVMBG. Website dikembangkan untuk prototipe edukasi.
        </div>

      </div>
    </main>
  );
}
