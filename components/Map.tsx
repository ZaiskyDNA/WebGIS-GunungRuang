"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/supabase';

export default function Map() {
  const position: [number, number] = [2.30597, 125.36680];
  const [evacuationPoints, setEvacuationPoints] = useState<any[]>([]);

  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const volcanoIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    async function fetchPoints() {
      // PERUBAHAN DI SINI: Kita mengambil data dari "kacamata" (view) yang baru dibuat
      const { data, error } = await supabase.from('view_evacuation_points').select('*');
      
      if (error) {
        console.error("Gagal mengambil data:", error);
      } else if (data) {
        setEvacuationPoints(data);
      }
    }
    fetchPoints();
  }, []);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-xl border-4 border-volcano-dark">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={position} icon={volcanoIcon}>
          <Popup>
            <div className="text-center">
              <strong className="text-volcano-dark text-lg">Gunung Ruang</strong><br />
              <span className="text-volcano-orange font-semibold">Pusat Bencana</span>
            </div>
          </Popup>
        </Marker>

        {evacuationPoints.map((point) => (
          <Marker 
            key={point.id} 
            // PERUBAHAN DI SINI: Langsung pakai lat dan lng yang sudah diterjemahkan!
            position={[point.lat, point.lng]} 
            icon={customIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-volcano-dark text-lg mb-1">{point.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{point.address}</p>
                <div className="bg-volcano-sand/30 p-2 rounded border border-volcano-sand">
                  <p className="text-sm"><strong>Kapasitas:</strong> {point.capacity} jiwa</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}