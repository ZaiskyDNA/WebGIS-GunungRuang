"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-semibold text-gray-500">Memuat Data Posko...</div>;
  if (!posko) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">Data Posko Tidak Ditemukan.</div>;

  // --- PERHITUNGAN OTOMATIS (LOGIKA ANALITIK) ---
  const percentageCapacity = Math.min(100, Math.round((posko.current_refugees / posko.capacity) * 100));

  // Target untuk ketahanan 3 Hari berdasarkan jumlah pengungsi saat ini
  const targetBeras = Math.ceil(posko.current_refugees * 1.2); 
  const targetAir = Math.ceil(posko.current_refugees * 15);    
  const targetMasker = Math.ceil(posko.current_refugees / 20); 

  // Kalkulasi Persentase Terpenuhi
  const persenBeras = targetBeras > 0 ? Math.min(100, Math.round((posko.beras_kg / targetBeras) * 100)) : 100;
  const persenAir = targetAir > 0 ? Math.min(100, Math.round((posko.air_liter / targetAir) * 100)) : 100;
  const persenMasker = targetMasker > 0 ? Math.min(100, Math.round((posko.masker_box / targetMasker) * 100)) : 100;

  // Kalkulasi Kekurangan
  const kurangBeras = Math.max(0, targetBeras - posko.beras_kg);
  const kurangAir = Math.max(0, targetAir - posko.air_liter);
  const kurangMasker = Math.max(0, targetMasker - posko.masker_box);

  // Fungsi pembantu warna bar logistik
  const getBarColor = (persen: number) => {
    if (persen < 30) return 'bg-red-500';
    if (persen < 70) return 'bg-orange-400';
    return 'bg-emerald-500';
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        <Link href="/tanggap-darurat" className="text-volcano-main font-semibold hover:text-volcano-dark flex items-center gap-2 mb-6 transition">
          <span>←</span> Kembali ke Peta Evakuasi
        </Link>

        {/* Header Posko */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{posko.name}</h1>
              <p className="text-gray-500 flex items-center gap-2"><span>📍</span> {posko.address}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold border-2 ${
              posko.status_logistik === 'Kritis' ? 'bg-red-50 text-red-700 border-red-200' : 
              posko.status_logistik === 'Menipis' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
              'bg-green-50 text-green-700 border-green-200'
            }`}>
              Status Logistik: {posko.status_logistik.toUpperCase()}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-600 font-medium">Tingkat Kepenuhan Posko</span>
              <span className="text-2xl font-bold text-gray-800">{posko.current_refugees} <span className="text-sm text-gray-500 font-normal">/ {posko.capacity} Jiwa</span></span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${percentageCapacity >= 100 ? 'bg-red-500' : percentageCapacity > 80 ? 'bg-orange-400' : 'bg-blue-500'}`} 
                style={{ width: `${percentageCapacity}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Demografi Pengungsi */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">👥 Rincian Demografi Pengungsi</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-gray-500 text-sm mb-1">Bayi & Balita</div>
                <div className="text-2xl font-bold text-blue-700">{posko.bayi} <span className="text-sm font-normal text-blue-500">jiwa</span></div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="text-gray-500 text-sm mb-1">Anak-anak</div>
                <div className="text-2xl font-bold text-emerald-700">{posko.anak} <span className="text-sm font-normal text-emerald-500">jiwa</span></div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-gray-500 text-sm mb-1">Dewasa</div>
                <div className="text-2xl font-bold text-indigo-700">{posko.dewasa} <span className="text-sm font-normal text-indigo-500">jiwa</span></div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="text-gray-500 text-sm mb-1">Lansia</div>
                <div className="text-2xl font-bold text-purple-700">{posko.lansia} <span className="text-sm font-normal text-purple-500">jiwa</span></div>
              </div>
            </div>
          </div>

          {/* Rincian Inventaris Logistik Dinamis */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">📦 Pemenuhan Logistik</h2>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                  Target: 3 Hari Darurat
                </span>
            </div>
            
            <div className="space-y-6">
              
              {/* Item: Beras */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🍚</span>
                    <div>
                      <div className="font-bold text-gray-800">Beras / Makanan Pokok</div>
                      <div className="text-xs text-gray-500">Tersedia: {posko.beras_kg} kg / Target: {targetBeras} kg</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{persenBeras}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(persenBeras)}`} style={{ width: `${persenBeras}%` }}></div>
                </div>
                {kurangBeras > 0 ? (
                  <p className="text-xs text-red-600 font-semibold text-right">⚠️ Defisit: Kurang {kurangBeras} kg</p>
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold text-right">✅ Stok Terpenuhi</p>
                )}
              </div>

              {/* Item: Air */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💧</span>
                    <div>
                      <div className="font-bold text-gray-800">Air Bersih (Minum & MCK)</div>
                      <div className="text-xs text-gray-500">Tersedia: {posko.air_liter} liter / Target: {targetAir} liter</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{persenAir}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(persenAir)}`} style={{ width: `${persenAir}%` }}></div>
                </div>
                {kurangAir > 0 ? (
                  <p className="text-xs text-red-600 font-semibold text-right">⚠️ Defisit: Kurang {kurangAir} liter</p>
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold text-right">✅ Stok Terpenuhi</p>
                )}
              </div>

              {/* Item: Masker */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">😷</span>
                    <div>
                      <div className="font-bold text-gray-800">Masker N95 / Medis</div>
                      <div className="text-xs text-gray-500">Tersedia: {posko.masker_box} box / Target: {targetMasker} box</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{persenMasker}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(persenMasker)}`} style={{ width: `${persenMasker}%` }}></div>
                </div>
                {kurangMasker > 0 ? (
                  <p className="text-xs text-red-600 font-semibold text-right">⚠️ Defisit: Kurang {kurangMasker} box</p>
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold text-right">✅ Stok Terpenuhi</p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}