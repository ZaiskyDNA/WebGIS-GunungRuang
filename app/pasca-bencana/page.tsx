"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SimulationState, createInitialState, triggerEruption } from "../../lib/simulation";
import Controls from "../../components/ui/Controls";

// 1. Dynamic Import untuk Peta 2D Historis Anda
const MapPasca2D = dynamic(() => import('../../components/MapPasca'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#faf8f5] flex flex-col items-center justify-center text-volcano-main font-bold rounded-2xl border-2 border-dashed border-volcano-main/30">
      <div className="text-3xl animate-spin mb-2">🗺️</div>
      Memuat Peta Historis...
    </div>
  )
});

// 2. Dynamic Import untuk Scene 3D
const VolcanoScene3D = dynamic(() => import("../../components/Volcanoscene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050208] text-[#ff6b35] font-mono gap-3 rounded-2xl">
      <div className="text-5xl animate-bounce">🌋</div>
      <div className="tracking-[0.2em] text-sm font-bold">MEMUAT MODEL 3D...</div>
    </div>
  ),
});

// Data Kronologi Nyata Erupsi 2024
const historicSteps = [
  { id: 1, title: 'Normal', icon: '🟢', date: 'Awal April 2024', status: 'Waspada / Level I', radius: '2 KM', desc: 'Aktivitas vulkanik mulai terekam namun masih dalam batas aman. PVMBG memantau peningkatan gempa.' },
  { id: 2, title: 'Siaga III', icon: '🟡', date: '16 April 2024', status: 'Siaga / Level III', radius: '4 KM', desc: 'Peningkatan gempa vulkanik drastis. Erupsi pertama memuntahkan abu vulkanik ke udara.' },
  { id: 3, title: 'Awas IV', icon: '🔴', date: '17 April 2024', status: 'AWAS / Level IV', radius: '6 KM', desc: 'Erupsi eksplosif masif diiringi kilat vulkanik. Lontaran batu pijar menghantam pemukiman warga.' },
  { id: 4, title: 'Puncak', icon: '🌋', date: '30 April 2024', status: 'AWAS / Puncak Erupsi', radius: '7 KM', desc: 'Erupsi susulan terbesar. Kolom abu mencapai 5 km. Pulau Ruang dikosongkan total.' }
];

export default function PascaBencana() {
  const [selectedStep, setSelectedStep] = useState(historicSteps[2]);

  // State untuk Simulasi 3D
  const [simState, setSimState] = useState<SimulationState>(createInitialState());
  const handleStateChange = useCallback((state: SimulationState) => setSimState(state), []);
  const handleTriggerEruption = useCallback(() => setSimState((prev) => triggerEruption(prev)), []);
  const handlePressureChange = useCallback((v: number) => setSimState((prev) => ({ ...prev, pressure: v })), []);
  const handleWindChange = useCallback((v: number) => setSimState((prev) => ({ ...prev, windStrength: v })), []);
  const handleViscosityChange = useCallback((v: number) => setSimState((prev) => ({ ...prev, viscosity: v })), []);

  return (
    <main className="min-h-screen bg-[#faf8f5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 md:space-y-12">
        
        {/* =========================================
            HEADER BARU (Sesuai Gambar Desain)
            ========================================= */}
        <div>
          {/* Banner Merah Gelap */}
          <div className="bg-[#4a1511] text-white p-8 md:p-10 rounded-2xl md:rounded-[32px] shadow-lg relative overflow-hidden flex items-center">
            {/* Dekorasi Lingkaran Halus di Kanan */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 rounded-l-full translate-x-1/4 scale-150"></div>
            
            <div className="relative z-10 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Arsip Historis: Memori Erupsi 2024
              </h1>
              <p className="text-gray-200 md:text-lg leading-relaxed opacity-90 font-light">
                Catatan dampak dan simulasi kejadian erupsi besar Gunung Ruang pada bulan April-Mei 2024. Data ini menjadi pondasi penting untuk evaluasi dan mitigasi tata ruang di masa depan.
              </p>
            </div>
          </div>

          {/* Deretan Kartu Metrik Putih (Sesuai Gambar Desain) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { value: '± 12.000', label: 'JIWA DIEVAKUASI' },
              { value: '3.000+', label: 'RUMAH RUSAK' },
              { value: '2 Desa', label: 'DIHAPUS PERMANEN' },
              { value: 'Rp 300 M+', label: 'ESTIMASI KERUGIAN' },
            ].map((stat, i) => (
              <div key={i} className="bg-white py-8 px-4 rounded-2xl shadow-sm border border-gray-100/80 text-center transition-transform hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-bold text-[#4a1511] mb-2">{stat.value}</div>
                <div className="text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================
            SECTION 1: SIMULASI KRONOLOGI 2D
            ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Kolom Peta Historis */}
          <div className="md:col-span-8 bg-white p-4 rounded-3xl shadow-lg border border-gray-100 h-[450px] md:h-[650px] relative z-10 group">
            {/* Overlay Indikator Status Melayang */}
            <div className="absolute top-6 left-6 z-[400] bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-[#4a1511]/10 flex items-center gap-3">
              <span className="text-4xl">{selectedStep.icon}</span>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{selectedStep.date}</p>
                <p className="text-xl text-[#4a1511] font-black">{selectedStep.status}</p>
                <p className="text-sm text-red-600 font-semibold">Radius Bahaya: {selectedStep.radius}</p>
              </div>
            </div>
            
            <MapPasca2D currentRadius={selectedStep.radius} /> 
          </div>

          {/* Kolom Navigasi Kronologi */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#4a1511] mb-5 flex items-center gap-2">
                <span>⏱️</span> Pilih Garis Waktu
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                {historicSteps.map((step) => {
                  const isActive = step.id === selectedStep.id;
                  return (
                    <button 
                      key={step.id} 
                      onClick={() => setSelectedStep(step)}
                      className={`p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 ${isActive ? 'bg-[#4a1511] border-[#4a1511] text-white shadow-md' : 'bg-gray-50 hover:bg-white border-gray-100'}`}
                    >
                      <span className={`text-2xl ${isActive ? 'opacity-100' : 'opacity-70'}`}>{step.icon}</span>
                      <div>
                        <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-800'}`}>{step.title}</div>
                        <div className={`text-[11px] ${isActive ? 'text-red-200' : 'text-gray-500'}`}>{step.date}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <span className="text-base">📝</span> Detail Kejadian
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed min-h-[5rem]">
                {selectedStep.desc}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================
            SECTION 2: PEMODELAN FISIKA 3D
            ========================================= */}
        <div className="bg-[#2a0e0c] text-white p-8 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden mt-8">
          <div className="absolute -bottom-10 -right-10 text-[180px] opacity-10">🌋</div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-block bg-white/10 p-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider text-red-200 border border-red-300/20">Modul Lanjutan</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
                <span>💻</span> Pemodelan Fisika 3D
              </h2>
              <p className="text-gray-300 mt-2 text-sm md:text-base leading-relaxed font-light">
                Visualisasi interaktif algoritma fisika viskositas lava dan tekanan magma. Gunakan panel kontrol untuk memicu dan memanipulasi erupsi virtual secara real-time.
              </p>
            </div>

            <div className="lg:col-span-8 relative w-full h-[500px] md:h-[700px] bg-[#050208] rounded-3xl overflow-hidden shadow-inner border-8 border-white/10 group">
              <VolcanoScene3D simState={simState} onStateChange={handleStateChange} />
              
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

        <div className="text-center text-gray-400 text-xs pt-4 border-t border-gray-200">
          Penetapan KRB dan Data Historis berdasarkan PVMBG & BNPB RI 2024.
        </div>

      </div>
    </main>
  );
}