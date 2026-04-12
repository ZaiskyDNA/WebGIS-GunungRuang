"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Memanggil peta tanpa SSR (Server-Side Rendering)
const MapSimulation = dynamic(() => import('../../components/MapPasca'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">Memuat Simulasi Peta...</div>
});

// Data Kronologi Nyata Erupsi Ruang 2024
const timelineData = [
  { 
    id: 0,
    date: 'Awal April 2024', 
    status: 'Normal / Waspada', 
    desc: 'Aktivitas vulkanik mulai terekam namun masih dalam batas aman. Kehidupan masyarakat Tagulandang berjalan normal.', 
    radius: 0, 
    colorClass: 'bg-green-500',
    colorHex: 'transparent'
  },
  { 
    id: 1,
    date: '16 April 2024', 
    status: 'Siaga (Level III)', 
    desc: 'Terjadi peningkatan gempa vulkanik drastis. Erupsi pertama memuntahkan kolom abu setinggi 2 km. Warga dalam radius 4 km mulai dievakuasi.', 
    radius: 4000, 
    colorClass: 'bg-yellow-500',
    colorHex: '#eab308' // Kuning
  },
  { 
    id: 2,
    date: '17 April 2024', 
    status: 'Awas (Level IV)', 
    desc: 'Erupsi eksplosif masif diiringi kilat vulkanik. Lontaran batu pijar menghantam pemukiman. Evakuasi darurat besar-besaran keluar pulau dimulai.', 
    radius: 6000, 
    colorClass: 'bg-orange-500',
    colorHex: '#f97316' // Oranye
  },
  { 
    id: 3,
    date: '30 April 2024', 
    status: 'Awas (Puncak Erupsi)', 
    desc: 'Erupsi susulan yang jauh lebih besar. Kolom abu mencapai 5 km. Bandara Sam Ratulangi lumpuh, Pulau Ruang dikosongkan total secara permanen.', 
    radius: 7000, 
    colorClass: 'bg-red-600',
    colorHex: '#dc2626' // Merah
  }
];

export default function PascaBencana() {
  const [currentStep, setCurrentStep] = useState(0);

  const activeData = timelineData[currentStep];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* Header Halaman */}
        <div className="bg-volcano-dark text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Arsip Historis: Memori Erupsi 2024</h1>
            <p className="text-gray-300 max-w-2xl leading-relaxed">
              Catatan dampak dan simulasi kejadian erupsi besar Gunung Ruang pada bulan April-Mei 2024. Data ini menjadi pondasi penting untuk evaluasi dan mitigasi tata ruang di masa depan.
            </p>
          </div>
        </div>

        {/* Metrik Dampak Bencana */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-volcano-dark mb-1">± 12.000</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Jiwa Dievakuasi</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-volcano-dark mb-1">3.000+</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Rumah Rusak</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-volcano-dark mb-1">2 Desa</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Dihapus Permanen</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-volcano-dark mb-1">Rp 300 M+</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Estimasi Kerugian</div>
          </div>
        </div>

        {/* Sesi Simulasi */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
            
            {/* Kiri: Peta Simulasi */}
            <div className="h-[400px] lg:h-[600px] bg-gray-100 relative">
              <MapSimulation radius={activeData.radius} colorHex={activeData.colorHex} />
              
              {/* Overlay Label Radius */}
              <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase">Jangkauan KRB:</span>
                <div className="text-lg font-black text-volcano-dark">{activeData.radius / 1000} KM</div>
              </div>
            </div>

            {/* Kanan: Panel Kontrol Timeline */}
            <div className="p-6 md:p-8 flex flex-col justify-between bg-[#FDF5EC]">
              <div>
                <h2 className="text-2xl font-bold text-volcano-dark mb-6 flex items-center gap-2">
                  <span>⏱️</span> Simulasi Kronologi
                </h2>

                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                  {timelineData.map((item, index) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      
                      {/* Ikon Lingkaran (Timeline Node) */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 cursor-pointer transition-transform hover:scale-110 z-10 ${item.id === currentStep ? item.colorClass : 'bg-gray-300'}`}
                           onClick={() => setCurrentStep(index)}>
                      </div>
                      
                      {/* Kartu Informasi */}
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm border transition-all cursor-pointer ${item.id === currentStep ? 'bg-white border-volcano-main ring-1 ring-volcano-main scale-105' : 'bg-white/60 border-gray-200 hover:bg-white'}`}
                           onClick={() => setCurrentStep(index)}>
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-gray-900 text-sm">{item.date}</div>
                        </div>
                        <div className={`text-xs font-bold mb-2 ${item.id === currentStep ? 'text-volcano-main' : 'text-gray-500'}`}>
                          {item.status}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Rincian Kejadian Aktif */}
              <div className="mt-8 p-5 bg-white rounded-2xl shadow-inner border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Deskripsi Kejadian:</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {activeData.desc}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}