"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../../lib/supabase';

const MapComponent = dynamic(() => import('../../components/MapTanggap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">Memuat Peta Evakuasi...</div>
});

export default function TanggapDarurat() {
  const [poskos, setPoskos] = useState<any[]>([]);
  const [totalRefugees, setTotalRefugees] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);

  useEffect(() => {
    async function fetchData() {
      // Mengambil data posko beserta kolom baru (current_refugees & status_logistik)
      const { data, error } = await supabase.from('view_evacuation_points').select('*');
      
      if (data && !error) {
        setPoskos(data);
        // Menghitung total keseluruhan
        const tRefugees = data.reduce((acc, curr) => acc + (curr.current_refugees || 0), 0);
        const tCapacity = data.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
        setTotalRefugees(tRefugees);
        setTotalCapacity(tCapacity);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        
        {/* Header Halaman */}
        <div className="bg-red-700 text-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fase Tanggap Darurat</h1>
            <p className="text-red-100 text-sm max-w-xl">
              Pemantauan sebaran pengungsi dan ketersediaan logistik di titik kumpul aman secara real-time. Data diperbarui oleh relawan di lapangan.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center min-w-[200px]">
            <div className="text-3xl font-bold text-yellow-300">{totalRefugees}</div>
            <div className="text-xs uppercase tracking-widest text-red-100 mt-1">Total Pengungsi Terdata</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          
          {/* Kolom Kiri: Peta */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🗺️</span> Peta Sebaran Posko
            </h2>
            <div className="flex-1 min-h-[400px] lg:min-h-[500px]">
              <MapComponent />
            </div>
          </div>

          {/* Kolom Kanan: Daftar Posko & Logistik */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px] lg:h-auto overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                Status Logistik per Posko
            </h2>
            
            <div className="overflow-y-auto pr-2 space-y-4">
              {poskos.map((posko) => {
                // Menghitung persentase kapasitas posko
                const percentage = Math.min(100, Math.round((posko.current_refugees / posko.capacity) * 100));
                
                // Menentukan warna label logistik
                let logistikColor = "bg-green-100 text-green-700 border-green-200";
                if (posko.status_logistik === 'Kritis') logistikColor = "bg-red-100 text-red-700 border-red-200";
                if (posko.status_logistik === 'Menipis') logistikColor = "bg-orange-100 text-orange-700 border-orange-200";

                return (
                  <div key={posko.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{posko.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${logistikColor}`}>
                        Logistik: {posko.status_logistik}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{posko.address}</p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600 font-medium">
                        <span>Pengungsi: {posko.current_refugees} jiwa</span>
                        <span>Kapasitas: {posko.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage > 80 ? 'bg-orange-400' : 'bg-blue-500'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      {percentage >= 100 && (
                        <div className="text-[10px] text-red-600 font-semibold mt-1">⚠️ Kapasitas Penuh / Overload!</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}