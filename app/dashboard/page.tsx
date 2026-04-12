"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; 

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>('');
  
  // State untuk status gunung (Admin)
  const [currentLevel, setCurrentLevel] = useState<number>(2);
  const [updatingAdmin, setUpdatingAdmin] = useState(false);
  const [messageAdmin, setMessageAdmin] = useState('');

  // State untuk form Relawan
  const [poskos, setPoskos] = useState<any[]>([]);
  const [selectedPosko, setSelectedPosko] = useState<string>('');
  const [updatingRelawan, setUpdatingRelawan] = useState(false);
  const [messageRelawan, setMessageRelawan] = useState('');
  
  // State untuk menampung isian form
  const [formData, setFormData] = useState({
    bayi: 0, anak: 0, dewasa: 0, lansia: 0,
    beras_kg: 0, air_liter: 0, masker_box: 0,
    status_logistik: 'Aman'
  });

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || 'Admin');
        fetchCurrentStatus();
        fetchPoskos();
      }
    }
    checkUser();
  }, [router]);

  // Ambil Data Status Gunung
  async function fetchCurrentStatus() {
    const { data } = await supabase.from('volcano_status').select('*').eq('id', 1).single();
    if (data) setCurrentLevel(data.level);
    setLoading(false);
  }

  // Ambil Data Daftar Posko untuk Dropdown
  async function fetchPoskos() {
    const { data } = await supabase.from('evacuation_points').select('*').order('name');
    if (data) setPoskos(data);
  }

  // Fungsi Keluar (Logout)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- FUNGSI ADMIN ---
  const handleUpdateStatus = async (level: number, name: string, description: string) => {
    setUpdatingAdmin(true);
    setMessageAdmin('');

    const { error } = await supabase
      .from('volcano_status')
      .update({ level, name, description, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (error) setMessageAdmin(`Gagal memperbarui: ${error.message}`);
    else {
      setCurrentLevel(level);
      setMessageAdmin(`Sukses! Status diubah ke Level ${level} (${name}).`);
    }
    setUpdatingAdmin(false);
  };

  // --- FUNGSI RELAWAN ---
  // 1. Saat dropdown posko dipilih, isi form dengan data yang ada di database
  const handlePoskoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const poskoId = e.target.value;
    setSelectedPosko(poskoId);
    
    const selected = poskos.find(p => p.id === poskoId);
    if (selected) {
      setFormData({
        bayi: selected.bayi || 0,
        anak: selected.anak || 0,
        dewasa: selected.dewasa || 0,
        lansia: selected.lansia || 0,
        beras_kg: selected.beras_kg || 0,
        air_liter: selected.air_liter || 0,
        masker_box: selected.masker_box || 0,
        status_logistik: selected.status_logistik || 'Aman'
      });
    }
  };

  // 2. Fungsi saat nilai di dalam form diketik
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status_logistik' ? value : Number(value)
    }));
  };

  // 3. Simpan perubahan ke database
  const handleUpdatePosko = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosko) return;

    setUpdatingRelawan(true);
    setMessageRelawan('');

    // Hitung total pengungsi otomatis
    const totalRefugees = Number(formData.bayi) + Number(formData.anak) + Number(formData.dewasa) + Number(formData.lansia);

    const { error } = await supabase
      .from('evacuation_points')
      .update({
        bayi: formData.bayi,
        anak: formData.anak,
        dewasa: formData.dewasa,
        lansia: formData.lansia,
        current_refugees: totalRefugees, // Kolom ini otomatis diisi dari penjumlahan
        beras_kg: formData.beras_kg,
        air_liter: formData.air_liter,
        masker_box: formData.masker_box,
        status_logistik: formData.status_logistik
      })
      .eq('id', selectedPosko);

    if (error) setMessageRelawan(`Gagal menyimpan data: ${error.message}`);
    else {
      setMessageRelawan('Sukses! Data posko dan logistik berhasil diperbarui secara real-time.');
      fetchPoskos(); // Refresh data posko di latar belakang
    }
    setUpdatingRelawan(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-semibold">Memuat Dasbor...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-volcano-dark text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="font-bold text-xl flex items-center gap-2"><span>🌋</span> Dasbor Kendali SIB</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 hidden md:block">Petugas: <strong className="text-white">{userEmail}</strong></span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-bold transition">Keluar</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* =========================================================
            MODUL 1: ADMIN (KENDALI STATUS GUNUNG)
            ========================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-volcano-dark">Kendali Status Gunung Ruang (Admin)</h2>
            <p className="text-gray-500 text-sm mt-1">Ubah level aktivitas di bawah ini. Perubahan akan langsung tercermin di portal publik.</p>
          </div>

          {messageAdmin && (
            <div className={`mb-6 p-4 rounded-xl font-semibold text-sm ${messageAdmin.includes('Sukses') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {messageAdmin}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
             <button onClick={() => handleUpdateStatus(1, 'Normal', 'Gunung Ruang berada pada Level I (Normal). Tidak ada aktivitas vulkanik yang membahayakan. Masyarakat dapat beraktivitas seperti biasa.')} disabled={updatingAdmin} className={`p-4 rounded-xl border-2 transition text-left ${currentLevel === 1 ? 'border-yellow-400 bg-yellow-50 shadow-md ring-2 ring-yellow-200' : 'border-gray-200 hover:border-yellow-400 opacity-70'}`}>
              <div className="text-xl font-bold text-yellow-600 mb-1">Level I</div><div className="font-semibold text-gray-800">Normal</div>
            </button>
            <button onClick={() => handleUpdateStatus(2, 'Waspada', 'Gunung Ruang berada pada Level II (Waspada). Masyarakat diimbau tidak memasuki radius 4 km dari kawah.')} disabled={updatingAdmin} className={`p-4 rounded-xl border-2 transition text-left ${currentLevel === 2 ? 'border-orange-400 bg-orange-50 shadow-md ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-400 opacity-70'}`}>
              <div className="text-xl font-bold text-orange-600 mb-1">Level II</div><div className="font-semibold text-gray-800">Waspada</div>
            </button>
            <button onClick={() => handleUpdateStatus(3, 'Siaga', 'Peringatan: Gunung Ruang berada pada Level III (Siaga). Terjadi peningkatan aktivitas vulkanik signifikan. Radius 4 KM wajib dikosongkan.')} disabled={updatingAdmin} className={`p-4 rounded-xl border-2 transition text-left ${currentLevel === 3 ? 'border-red-500 bg-red-50 shadow-md ring-2 ring-red-200' : 'border-gray-200 hover:border-red-500 opacity-70'}`}>
              <div className="text-xl font-bold text-red-600 mb-1">Level III</div><div className="font-semibold text-gray-800">Siaga</div>
            </button>
            <button onClick={() => handleUpdateStatus(4, 'Awas', 'AWAS! Gunung Ruang berada pada Level IV (Awas). Erupsi besar dapat terjadi sewaktu-waktu. Evakuasi total seluruh penduduk radius 7 KM sekarang juga!')} disabled={updatingAdmin} className={`p-4 rounded-xl border-2 transition text-left ${currentLevel === 4 ? 'border-red-800 bg-red-100 shadow-md ring-2 ring-red-300' : 'border-gray-200 hover:border-red-800 opacity-70'}`}>
              <div className="text-xl font-bold text-red-800 mb-1">Level IV</div><div className="font-semibold text-gray-900">Awas</div>
            </button>
          </div>
        </div>


        {/* =========================================================
            MODUL 2: RELAWAN (MANAJEMEN LOGISTIK & PENGUNGSI)
            ========================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-volcano-main">Manajemen Logistik & Pengungsi (Relawan)</h2>
            <p className="text-gray-500 text-sm mt-1">Pilih posko yang Anda tugasi, lalu mutakhirkan data jumlah pengungsi dan sisa logistik di gudang.</p>
          </div>

          {messageRelawan && (
            <div className={`mb-6 p-4 rounded-xl font-semibold text-sm ${messageRelawan.includes('Sukses') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {messageRelawan}
            </div>
          )}

          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Titik Posko Evakuasi</label>
            <select 
              value={selectedPosko} 
              onChange={handlePoskoChange}
              className="w-full md:w-1/2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-volcano-main outline-none bg-gray-50 font-semibold"
            >
              <option value="" disabled>-- Pilih Posko Anda --</option>
              {poskos.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedPosko && (
            <form onSubmit={handleUpdatePosko} className="space-y-8 animate-fadeIn">
              
              {/* Grup 1: Demografi Pengungsi */}
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">👥 Demografi Pengungsi</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bayi & Balita</label>
                    <input type="number" min="0" name="bayi" value={formData.bayi} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Anak-anak</label>
                    <input type="number" min="0" name="anak" value={formData.anak} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Dewasa</label>
                    <input type="number" min="0" name="dewasa" value={formData.dewasa} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Lansia</label>
                    <input type="number" min="0" name="lansia" value={formData.lansia} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-3 font-medium">Total Pengungsi: {Number(formData.bayi) + Number(formData.anak) + Number(formData.dewasa) + Number(formData.lansia)} jiwa (Dihitung otomatis)</p>
              </div>

              {/* Grup 2: Inventaris Logistik */}
              <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">📦 Stok Logistik Fisik</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Beras / Makanan Pokok (Kg)</label>
                    <input type="number" min="0" name="beras_kg" value={formData.beras_kg} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Air Bersih (Liter)</label>
                    <input type="number" min="0" name="air_liter" value={formData.air_liter} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Masker N95 (Box)</label>
                    <input type="number" min="0" name="masker_box" value={formData.masker_box} onChange={handleInputChange} className="w-full p-2.5 rounded border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none" />
                  </div>
                </div>
              </div>

              {/* Grup 3: Status Penilaian Relawan */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Penilaian Status Logistik Keseluruhan</label>
                  <select name="status_logistik" value={formData.status_logistik} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-volcano-main outline-none font-semibold">
                    <option value="Aman">Aman (Stok Mencukupi)</option>
                    <option value="Menipis">Menipis (Perlu Pasokan Segera)</option>
                    <option value="Kritis">Kritis (Kekurangan / Kelaparan)</option>
                  </select>
                </div>
                
                <div className="w-full md:w-auto mt-4 md:mt-0">
                  <button type="submit" disabled={updatingRelawan} className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-md transition ${updatingRelawan ? 'bg-gray-400' : 'bg-volcano-main hover:bg-volcano-dark'}`}>
                    {updatingRelawan ? 'Menyimpan...' : 'Simpan Pembaruan Data'}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>
      </div>
    </main>
  );
}