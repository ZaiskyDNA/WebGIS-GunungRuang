"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Kita menerima 'currentRadius' sebagai string (misal "2 KM") dan 'colorHex' untuk warna lingkaran
export default function MapPasca({ currentRadius, colorHex = "#ff4444" }: { currentRadius: string, colorHex?: string }) {
  const volcanoPosition: [number, number] = [2.30597, 125.36680];

  // Konversi string radius ke number (ambil angka pertama dari string)
  const radiusNumber = parseInt(currentRadius.split(' ')[0]) * 1000; // Konversi KM ke meter

  const volcanoIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
  });

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-md border-2 border-gray-200 relative z-0">
      <MapContainer 
        center={volcanoPosition} 
        zoom={11} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Lingkaran Simulasi yang berubah ukuran & warna secara dinamis */}
        {radiusNumber > 0 && (
          <Circle
            center={volcanoPosition}
            pathOptions={{ fillColor: colorHex, color: colorHex, fillOpacity: 0.4 }}
            radius={radiusNumber}
          />
        )}

        <Marker position={volcanoPosition} icon={volcanoIcon}>
          <Popup>
            <div className="text-center">
              <strong>Gunung Ruang</strong><br/>
              Pusat Erupsi Historis 2024
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}