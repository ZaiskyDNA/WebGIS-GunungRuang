"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/supabase';

export default function MapTanggap() {
  const volcanoPosition: [number, number] = [2.30597, 125.36680];
  const [points, setPoints] = useState<any[]>([]);

  const volcanoIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
  });

  const poskoIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
  });

  useEffect(() => {
    async function fetchPoints() {
      const { data } = await supabase.from('view_evacuation_points').select('*');
      if (data) setPoints(data);
    }
    fetchPoints();
  }, []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-md border-2 border-gray-200 relative z-0">
      <MapContainer 
        center={volcanoPosition} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* KRB III — Radius 2,5 km (merah) */}
        <Circle
          center={volcanoPosition}
          pathOptions={{ fillColor: 'red', color: 'darkred', fillOpacity: 0.3 }}
          radius={2500}
        />

        {/* KRB II — Radius 5 km (oranye) */}
        <Circle
          center={volcanoPosition}
          pathOptions={{ fillColor: 'orange', color: 'darkorange', fillOpacity: 0.15 }}
          radius={5000}
        />

        {/* Bebas Aktivitas — Radius 6 km (kuning) */}
        <Circle
          center={volcanoPosition}
          pathOptions={{ fillColor: 'yellow', color: '#b8960c', fillOpacity: 0.15 }}
          radius={6000}
        />

        {/* KRB I — Radius 7 km (abu-abu) */}
        <Circle
          center={volcanoPosition}
          pathOptions={{ fillColor: 'white', color: 'darkgray', fillOpacity: 0.15 }}
          radius={7000}
        />

        {/* Marker Gunung Ruang */}
        <Marker position={volcanoPosition} icon={volcanoIcon}>
          <Popup>Pusat Erupsi Gunung Ruang</Popup>
        </Marker>

        {/* Marker Posko Evakuasi */}
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={poskoIcon}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <strong className="text-volcano-dark block mb-1">{p.name}</strong>
                <div className="text-gray-600 mb-1">Pengungsi: {p.current_refugees} / {p.capacity}</div>
                <div className={`font-bold mb-3 ${p.status_logistik === 'Kritis' ? 'text-red-600' : p.status_logistik === 'Menipis' ? 'text-orange-500' : 'text-green-600'}`}>
                  Logistik: {p.status_logistik}
                </div>
                
                {/* Tombol Menuju Halaman Detail */}
                <a 
                  href={`/tanggap-darurat/posko/${p.id}`}
                  className="block w-full text-center bg-volcano-dark hover:bg-volcano-main text-white py-1.5 rounded-md font-semibold transition"
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