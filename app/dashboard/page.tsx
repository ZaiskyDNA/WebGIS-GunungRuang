"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; 

export default function Dashboard() {
  // ── STATE UNTUK TAB NAVIGASI ──
  const [activeTab, setActiveTab] = useState<'admin' | 'relawan'>('admin');

  // ── STATE ADMIN (STATUS GUNUNG & RADIUS) ──
  const [status, setStatus] = useState({ level: 2, name: 'Waspada', desc: '' });
  const [radiusBahaya, setRadiusBahaya] = useState(7000);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  // ── STATE RELAWAN (UPDATE POSKO) ──
  const [poskos, setPoskos] = useState<any[]>([]);
  const [selectedPoskoId, setSelectedPoskoId] = useState<string>('');
  const [poskoData, setPoskoData] = useState({
    current_refugees: 0,
    beras_kg: 0,
    air_liter: 0,
    masker_box: 0,
    status_logistik: 'Aman'
  });
  const [isUpdatingRelawan, setIsUpdatingRelawan] = useState(false);

  // ── FETCH DATA AWAL ──
  useEffect(() => {
    async function fetchData() {
      // Fetch Status Gunung & Radius
      const { data: statusData } = await supabase.from('volcano_status').select('*').eq('id', 1).single();
      if (statusData) {
        setStatus({ level: statusData.level, name: statusData.name, desc: statusData.description });
        if (statusData.radius_bahaya) setRadiusBahaya(statusData.radius_bahaya);
      }

      // Fetch Daftar Posko untuk Dropdown Relawan
      const { data: poskoData } = await supabase.from('evacuation_points').select('id, name').order('name');
      if (poskoData) {
        setPoskos(poskoData);
      }
    }
    fetchData();
  }, []);

  // Fetch Data spesifik saat Relawan memilih Posko dari Dropdown
  useEffect(() => {
    async function fetchDetailPosko() {
      if (!selectedPoskoId) return;
      const { data } = await supabase.from('evacuation_points').select('*').eq('id', selectedPoskoId).single();
      if (data) {
        setPoskoData({
          current_refugees: data.current_refugees || 0,
          beras_kg: data.beras_kg || 0,
          air_liter: data.air_liter || 0,
          masker_box: data.masker_box || 0,
          status_logistik: data.status_logistik || 'Aman'
        });
      }
    }
    fetchDetailPosko();
  }, [selectedPoskoId]);

  // ── FUNGSI ADMIN: UPDATE STATUS GUNUNG ──
  const handleUpdateStatus = async (newLevel: number, newName: string, newDesc: string) => {
    setIsUpdatingAdmin(true);
    const { error } = await supabase.from('volcano_status').update({
      level: newLevel, name: newName, description: newDesc
    }).eq('id', 1);

    if (!error) {
      setStatus({ level: newLevel, name: newName, desc: newDesc });
      alert(`Status berhasil diubah menjadi Level ${newLevel} (${newName})!`);
    } else {
      alert("Gagal mengubah status.");
    }
    setIsUpdatingAdmin(false);
  };

  // ── FUNGSI ADMIN: UPDATE RADIUS BAHAYA ──
  const handleUpdateRadius = async () => {
    setIsUpdatingAdmin(true);
    const { error } = await supabase.from('volcano_status').update({
      radius_bahaya: radiusBahaya
    }).eq('id', 1);

    if (!error) {
      alert("Radius Bahaya berhasil diperbarui! Peta Tanggap Darurat telah menyesuaikan area bahaya.");
    } else {
      alert("Gagal memperbarui radius.");
    }
    setIsUpdatingAdmin(false);
  };

  // ── FUNGSI RELAWAN: UPDATE DATA POSKO ──
  const handleUpdatePosko = async () => {
    if (!selectedPoskoId) return alert("Pilih posko terlebih dahulu!");
    setIsUpdatingRelawan(true);
    
    const { error } = await supabase.from('evacuation_points').update({
      current_refugees: poskoData.current_refugees,
      beras_kg: poskoData.beras_kg,
      air_liter: poskoData.air_liter,
      masker_box: poskoData.masker_box,
      status_logistik: poskoData.status_logistik
    }).eq('id', selectedPoskoId);

    if (!error) {
      alert("Data Posko berhasil diperbarui! Cek halaman Tanggap Darurat untuk melihat perubahannya.");
    } else {
      alert("Gagal memperbarui data posko.");
    }
    setIsUpdatingRelawan(false);
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* HEADER DASBOR */}
        <div className="bg-[#4a1511] text-white p-8 rounded-[32px] shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 rounded-l-full translate-x-1/4 scale-150 pointer-events-none"></div>
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Pusat Kendali Operasional</h1>
            <p className="text-gray-300 text-sm">Kelola status peringatan dini dan pembaruan data logistik lapangan.</p>
          </div>
          <div className="relative z-10 flex gap-2 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'admin' ? 'bg-white text-[#4a1511] shadow-md' : 'text-gray-300 hover:bg-white/10'}`}
            >
              Panel Admin (BPBD)
            </button>
            <button 
              onClick={() => setActiveTab('relawan')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'relawan' ? 'bg-white text-[#4a1511] shadow-md' : 'text-gray-300 hover:bg-white/10'}`}
            >
              Panel Relawan Lapangan
            </button>
          </div>
        </div>

        {/* =========================================
            PANEL ADMIN (STATUS & RADIUS)
            ========================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-8 animate-fade-in-down">
            
            {/* KENDALI STATUS GUNUNG */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🌋</span>
                <h2 className="text-xl font-bold text-[#4a1511]">Kendali Tingkat Aktivitas Gunung Ruang</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { level: 1, name: 'Normal', color: 'bg-emerald-500 hover:bg-emerald-600', desc: 'Aktivitas vulkanik dasar.' },
                  { level: 2, name: 'Waspada', color: 'bg-amber-500 hover:bg-amber-600', desc: 'Ada kenaikan aktivitas di atas level normal.' },
                  { level: 3, name: 'Siaga', color: 'bg-orange-500 hover:bg-orange-600', desc: 'Peningkatan seismik signifikan, letusan dapat terjadi.' },
                  { level: 4, name: 'Awas', color: 'bg-red-600 hover:bg-red-700', desc: 'Letusan utama sedang berlangsung, evakuasi total.' }
                ].map((btn) => (
                  <button
                    key={btn.level}
                    disabled={isUpdatingAdmin}
                    onClick={() => handleUpdateStatus(btn.level, btn.name, btn.desc)}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-white transition-all transform active:scale-95 ${btn.color} ${status.level === btn.level ? 'ring-4 ring-offset-2 ring-[#4a1511] shadow-lg scale-105' : 'opacity-80'}`}
                  >
                    <span className="text-xl font-black">Level {btn.level}</span>
                    <span className="text-xs font-bold uppercase tracking-widest">{btn.name}</span>
                  </button>
                ))}
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Status Aktif di Website:</span>
                <p className="text-lg font-black text-[#4a1511]">Level {status.level} — {status.name}</p>
              </div>
            </div>

            {/* KENDALI RADIUS BAHAYA */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-bold text-[#4a1511]">Kendali Radius Bahaya (Area Wajib Kosong)</h2>
              </div>
              <div className="max-w-xl">
                <label className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 block">
                  Jarak Radius Bahaya (Dalam Meter)
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input 
                    type="number" 
                    value={radiusBahaya} 
                    onChange={(e) => setRadiusBahaya(Number(e.target.value))}
                    className="w-full sm:flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 font-bold text-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <button 
                    onClick={handleUpdateRadius}
                    disabled={isUpdatingAdmin}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition whitespace-nowrap"
                  >
                    {isUpdatingAdmin ? "Menyimpan..." : "Terapkan Radius"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 border-l-2 border-red-500 pl-2">
                  Mengubah radius ini akan langsung memperbesar atau memperkecil lingkaran merah rawan bencana di halaman Peta Tanggap Darurat publik.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* =========================================
            PANEL RELAWAN (UPDATE POSKO & LOGISTIK)
            ========================================= */}
        {activeTab === 'relawan' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fade-in-down">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <span className="text-2xl">📦</span>
              <h2 className="text-xl font-bold text-[#4a1511]">Formulir Pelaporan Relawan</h2>
            </div>

            {/* Pilih Posko */}
            <div className="mb-8">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">1. Pilih Lokasi Bertugas</label>
              <select 
                value={selectedPoskoId}
                onChange={(e) => setSelectedPoskoId(e.target.value)}
                className="w-full bg-[#faf8f5] border border-gray-200 rounded-xl p-3 text-[#4a1511] font-bold focus:ring-2 focus:ring-[#4a1511] outline-none cursor-pointer"
              >
                <option value="" disabled>-- Pilih Posko Anda --</option>
                {poskos.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Form Input Muncul Jika Posko Terpilih */}
            {selectedPoskoId ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data Pengungsi */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <label className="text-xs font-bold text-[#4a1511] uppercase tracking-widest mb-3 block">👥 Jumlah Pengungsi Saat Ini</label>
                    <input 
                      type="number" 
                      value={poskoData.current_refugees}
                      onChange={(e) => setPoskoData({...poskoData, current_refugees: Number(e.target.value)})}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800"
                    />
                  </div>

                  {/* Status Logistik Keseluruhan */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <label className="text-xs font-bold text-[#4a1511] uppercase tracking-widest mb-3 block">🏷️ Status Logistik Umum</label>
                    <select 
                      value={poskoData.status_logistik}
                      onChange={(e) => setPoskoData({...poskoData, status_logistik: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800"
                    >
                      <option value="Aman">Aman (Hijau)</option>
                      <option value="Menipis">Menipis (Oranye)</option>
                      <option value="Kritis">Kritis (Merah)</option>
                    </select>
                  </div>
                </div>

                {/* Detail Inventaris Logistik */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <label className="text-xs font-bold text-[#4a1511] uppercase tracking-widest mb-4 block">📦 Pembaruan Stok Logistik</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-500 font-bold mb-1 block">Beras / Makanan (Kg)</label>
                      <input type="number" value={poskoData.beras_kg} onChange={(e) => setPoskoData({...poskoData, beras_kg: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 font-bold mb-1 block">Air Bersih (Liter)</label>
                      <input type="number" value={poskoData.air_liter} onChange={(e) => setPoskoData({...poskoData, air_liter: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 font-bold mb-1 block">Masker (Box)</label>
                      <input type="number" value={poskoData.masker_box} onChange={(e) => setPoskoData({...poskoData, masker_box: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleUpdatePosko}
                  disabled={isUpdatingRelawan}
                  className="w-full bg-[#4a1511] hover:bg-[#6b201a] text-white font-bold py-4 rounded-xl transition shadow-md mt-4"
                >
                  {isUpdatingRelawan ? "Mengirim Laporan..." : "Simpan & Publikasikan Laporan Posko"}
                </button>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <span className="text-4xl block mb-2">📍</span>
                <p className="text-gray-500 font-medium">Pilih posko di atas untuk mulai memperbarui data logistik dan pengungsi.</p>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}