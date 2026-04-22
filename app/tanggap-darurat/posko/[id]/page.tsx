"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// Hati-hati dengan path supabase, sesuaikan ../ jika error
import { supabase } from '../../../../lib/supabase'; 

export default function DetailPosko() {
  const params = useParams();
  const poskoId = params.id;
  
  const [posko, setPosko] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoskoDetail() {
      const { data, error } = await supabase
        .from('view_evacuation_points')
        .select('*')
        .eq('id', poskoId)
        .single();

      if (data && !error) {
        setPosko(data);
      }
      setLoading(false);
    }
    fetchPoskoDetail();
  }, [poskoId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] font-bold text-[#4a1511] animate-pulse">Memuat Data Posko...</div>;
  if (!posko) return <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] text-red-500 font-bold">Data Posko Tidak Ditemukan.</div>;

  const percentageCapacity = Math.min(100, Math.round((posko.current_refugees / posko.capacity) * 100));
  const targetBeras = Math.ceil(posko.current_refugees * 1.2); 
  const targetAir = Math.ceil(posko.current_refugees * 15);    
  const targetMasker = Math.ceil(posko.current_refugees / 20); 

  const persenBeras = targetBeras > 0 ? Math.min(100, Math.round((posko.beras_kg / targetBeras) * 100)) : 100;
  const persenAir = targetAir > 0 ? Math.min(100, Math.round((posko.air_liter / targetAir) * 100)) : 100;
  const persenMasker = targetMasker > 0 ? Math.min(100, Math.round((posko.masker_box / targetMasker) * 100)) : 100;

  const kurangBeras = Math.max(0, targetBeras - posko.beras_kg);
  const kurangAir = Math.max(0, targetAir - posko.air_liter);
  const kurangMasker = Math.max(0, targetMasker - posko.masker_box);

  const getBarColor = (persen: number) => {
    if (persen < 30) return 'bg-red-500';
    if (persen < 70) return 'bg-orange-400';
    return 'bg-emerald-500';
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        <Link href="/tanggap-darurat" className="inline-flex text-[#4a1511] font-bold hover:text-red-800 items-center gap-2 mb-8 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <span>←</span> Kembali ke Peta Evakuasi
        </Link>

        {/* Header Posko */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8">
            <div>
              <div className="inline-block bg-[#4a1511]/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4a1511] mb-3">Detail Posko</div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#4a1511] mb-3">{posko.name}</h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm font-medium mb-5"><span>📍</span> {posko.address}</p>
              
              {/* TOMBOL RUTE GOOGLE MAPS (BARU) */}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${posko.lat},${posko.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#4a1511] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#6b201a] transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <span className="text-lg">🗺️</span> Petunjuk Rute (Google Maps)
              </a>
            </div>
            
            <div className={`px-5 py-3 rounded-2xl font-bold border-2 shadow-sm w-full md:w-auto text-center md:text-left ${
              posko.status_logistik === 'Kritis' ? 'bg-red-50 text-red-700 border-red-200' : 
              posko.status_logistik === 'Menipis' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <div className="text-[10px] uppercase tracking-widest opacity-70 mb-0.5">Status Logistik</div>
              <div className="text-lg md:text-base">{posko.status_logistik.toUpperCase()}</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tingkat Kepenuhan Posko</span>
              <span className="text-3xl font-black text-[#4a1511]">{posko.current_refugees} <span className="text-sm text-gray-400 font-bold">/ {posko.capacity} Jiwa</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200/50">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${percentageCapacity >= 100 ? 'bg-red-500' : percentageCapacity > 80 ? 'bg-orange-400' : 'bg-[#4a1511]'}`} 
                style={{ width: `${percentageCapacity}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Demografi Pengungsi */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 h-fit">
            <h2 className="text-xl font-bold text-[#4a1511] mb-6 flex items-center gap-3">
              <span className="text-2xl">👥</span> Rincian Demografi
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Bayi & Balita</div>
                <div className="text-3xl font-black text-blue-700">{posko.bayi} <span className="text-xs font-bold text-blue-400">jiwa</span></div>
              </div>
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Anak-anak</div>
                <div className="text-3xl font-black text-emerald-700">{posko.anak} <span className="text-xs font-bold text-emerald-400">jiwa</span></div>
              </div>
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Dewasa</div>
                <div className="text-3xl font-black text-indigo-700">{posko.dewasa} <span className="text-xs font-bold text-indigo-400">jiwa</span></div>
              </div>
              <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100/50">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Lansia</div>
                <div className="text-3xl font-black text-purple-700">{posko.lansia} <span className="text-xs font-bold text-purple-400">jiwa</span></div>
              </div>
            </div>
          </div>

          {/* Rincian Inventaris Logistik Dinamis */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-[#4a1511] flex items-center gap-3">
                  <span className="text-2xl">📦</span> Analitik Logistik
                </h2>
                <span className="text-[10px] font-bold bg-[#4a1511]/10 text-[#4a1511] px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Target: 3 Hari
                </span>
            </div>
            
            <div className="space-y-6">
              {[
                { title: "Beras / Makanan Pokok", icon: "🍚", available: posko.beras_kg, target: targetBeras, unit: "kg", percent: persenBeras, deficit: kurangBeras },
                { title: "Air Bersih (MCK & Minum)", icon: "💧", available: posko.air_liter, target: targetAir, unit: "liter", percent: persenAir, deficit: kurangAir },
                { title: "Masker N95 / Medis", icon: "😷", available: posko.masker_box, target: targetMasker, unit: "box", percent: persenMasker, deficit: kurangMasker },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-gray-100">{item.icon}</span>
                      <div>
                        <div className="font-bold text-[#4a1511]">{item.title}</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">Stok: {item.available} {item.unit} / Target: {item.target} {item.unit}</div>
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#4a1511]">{item.percent}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2.5 overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out ${getBarColor(item.percent)}`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                  {item.deficit > 0 ? (
                    <p className="text-xs text-red-600 font-bold text-right flex justify-end items-center gap-1"><span>⚠️</span> Defisit: Kurang {item.deficit} {item.unit}</p>
                  ) : (
                    <p className="text-xs text-emerald-600 font-bold text-right flex justify-end items-center gap-1"><span>✅</span> Stok Terpenuhi</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}