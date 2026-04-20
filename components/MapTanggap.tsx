"use client";

import { useEffect, useState, useMemo } from 'react';
// Tambahkan LayersControl di import
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/supabase';

export default function MapTanggap() {
  const volcanoPosition: [number, number] = [2.30597, 125.36680];
  const [points, setPoints] = useState<any[]>([]);
  
  // State untuk menyimpan HANYA SATU radius bahaya
  const [radiusBahaya, setRadiusBahaya] = useState(7000);

  const icons = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return {
      volcano: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
      }),
      posko: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
      })
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Ambil titik posko
      const { data: poskoData } = await supabase.from('view_evacuation_points').select('*');
      if (poskoData) setPoints(poskoData);

      // Ambil radius bahaya tunggal dari database
      const { data: statusData } = await supabase.from('volcano_status').select('*').eq('id', 1).single();
      if (statusData && statusData.radius_bahaya) {
        setRadiusBahaya(statusData.radius_bahaya);
      }
    }
    fetchData();
  }, []);

  if (!icons) return null;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative z-0">
      <MapContainer 
        center={volcanoPosition} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* KONTROL LAYER / OPSI GANTI PETA */}
        <LayersControl position="topright">
          
          {/* OPSI 1: Peta Standar (OpenStreetMap) - Default */}
          <LayersControl.BaseLayer checked name="Peta Standar (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* OPSI 2: Citra Satelit (Menggunakan Esri World Imagery - Gratis & Bagus) */}
          <LayersControl.BaseLayer name="Citra Satelit (Esri)">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {/* OPSI 3: Peta Topografi (OpenTopoMap) */}
          <LayersControl.BaseLayer name="Peta Topografi (Lereng)">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        {/* SATU LINGKARAN RADIUS BAHAYA MERAH TEGAS */}
        <Circle 
          center={volcanoPosition} 
          pathOptions={{ fillColor: 'red', color: 'darkred', fillOpacity: 0.2, weight: 2 }} 
          radius={radiusBahaya} 
        />

        {/* Marker Gunung Ruang */}
        <Marker position={volcanoPosition} icon={icons.volcano}>
          <Popup><strong>🌋 Pusat Erupsi Gunung Ruang</strong></Popup>
        </Marker>

        {/* Marker Posko Evakuasi */}
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icons.posko}>
            <Popup>
              <div className="text-sm min-w-[200px] font-sans">
                <strong className="text-[#4a1511] block mb-2 text-base border-b pb-1">{p.name}</strong>
                <div className="text-gray-600 mb-1 text-xs">👥 Pengungsi: <span className="font-bold">{p.current_refugees} / {p.capacity}</span></div>
                <div className={`text-xs font-bold mb-4 px-2 py-1 rounded inline-block ${p.status_logistik === 'Kritis' ? 'bg-red-50 text-red-600' : p.status_logistik === 'Menipis' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  Logistik: {p.status_logistik}
                </div>
                <a 
                  href={`/tanggap-darurat/posko/${p.id}`}
                  className="block w-full text-center bg-[#4a1511] hover:bg-[#6b201a] text-white py-2 rounded-lg font-bold text-xs transition-colors shadow-sm"
                >
                  Lihat Lebih Detail
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}