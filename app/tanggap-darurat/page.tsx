"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../../lib/supabase'; // Path ini sudah benar (../../)

// Memanggil Peta Tanggap Darurat, bukan Pra Bencana
const MapComponent = dynamic(() => import('../../components/MapTanggap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#faf8f5] animate-pulse rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-[#4a1511]/20 text-[#4a1511]/60 font-bold tracking-widest text-sm">
      <span className="text-4xl mb-2 animate-bounce">🗺️</span>
      MEMUAT PETA EVAKUASI...
    </div>
  )
});

export default function TanggapDarurat() {
  const [poskos, setPoskos] = useState<any[]>([]);
  const [totalRefugees, setTotalRefugees] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState({
    level: 2,
    name: 'Waspada',
    roman: 'II',
    description: 'Aktivitas vulkanik menunjukkan peningkatan. Masyarakat diimbau untuk tidak mendekati kawah.',
    lastUpdated: 'Memuat data...'
  });

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('view_evacuation_points').select('*');
      
      if (data && !error) {
        setPoskos(data);
        const tRefugees = data.reduce((acc, curr) => acc + (curr.current_refugees || 0), 0);
        const tCapacity = data.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
        setTotalRefugees(tRefugees);
        setTotalCapacity(tCapacity);
      }
    }
    fetchData();
  }, []);

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
    <main className="min-h-screen bg-[#faf8f5] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* ── ALERT BANNER DINAMIS ── */}
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
        
        {/* ── HEADER MARUN ELEGAN ── */}
        <div className="bg-[#4a1511] text-white p-8 md:p-10 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 rounded-l-full translate-x-1/3 scale-150 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-block bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-red-200 border border-red-300/20 mb-4">
              Pemantauan Real-Time
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Fase Tanggap Darurat
            </h1>
            <p className="text-gray-200 md:text-lg leading-relaxed font-light">
              Pemantauan sebaran pengungsi dan ketersediaan logistik di titik kumpul aman. Data diperbarui oleh relawan di lapangan untuk distribusi bantuan yang tepat sasaran.
            </p>
          </div>

          <div className="relative z-10 bg-white p-6 rounded-3xl shadow-2xl text-center min-w-[220px] transform hover:scale-105 transition-transform">
             <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Total Pengungsi Terdata</p>
             <div className="text-5xl font-black text-[#4a1511] mb-1">{totalRefugees}</div>
             <div className="text-xs font-bold text-gray-400 mt-2">Kapasitas Maks: {totalCapacity} Jiwa</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kolom Peta */}
          <div className="lg:col-span-8 bg-white p-4 rounded-[32px] shadow-lg border border-gray-100 flex flex-col h-[500px] md:h-[650px] relative">
            <div className="absolute top-8 left-8 z-[400] bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-[#4a1511]/10">
              <h2 className="text-sm font-bold text-[#4a1511] uppercase tracking-widest flex items-center gap-2">
                <span>🗺️</span> Peta Sebaran Posko
              </h2>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden">
              <MapComponent />
            </div>
          </div>

          {/* Kolom Daftar Posko */}
          <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[650px]">
            <h2 className="text-lg font-bold text-[#4a1511] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
               Status Logistik per Posko
            </h2>
            
            <div className="overflow-y-auto pr-2 space-y-4 flex-1 scrollbar-hide">
              {poskos.map((posko) => {
                const percentage = Math.min(100, Math.round((posko.current_refugees / posko.capacity) * 100));
                
                let logistikColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                if (posko.status_logistik === 'Kritis') logistikColor = "bg-red-50 text-red-700 border-red-200";
                if (posko.status_logistik === 'Menipis') logistikColor = "bg-orange-50 text-orange-700 border-orange-200";

                return (
                  <div key={posko.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all cursor-default">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-[#4a1511] text-sm leading-tight pr-2">{posko.name}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${logistikColor}`}>
                        {posko.status_logistik}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-gray-500 mb-4 line-clamp-1 flex items-center gap-1">
                      <span>📍</span> {posko.address}
                    </p>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                        <span>{posko.current_refugees} Jiwa</span>
                        <span>Maks: {posko.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage > 80 ? 'bg-orange-400' : 'bg-[#4a1511]'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      {percentage >= 100 && (
                        <div className="text-[10px] text-red-600 font-bold mt-1">⚠️ Kapasitas Overload!</div>
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