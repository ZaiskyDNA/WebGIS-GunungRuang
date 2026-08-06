"use client";

import { useEffect, useState, useMemo } from 'react';
// Kita impor semua komponen langsung (termasuk LayersControl) agar lebih rapi
import { MapContainer, TileLayer, Marker, Polygon, Popup, Tooltip, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- DATA STATIK ---
const AIRPORTS = [
  { name: "Bandara Sam Ratulangi Manado", lat: 1.550487, lng: 124.925372 },
  { name: "Bandara Taman Bung Karno Siau", lat: 2.650466, lng: 125.423891 },
  { name: "Bandara Naha Tahuna", lat: 3.689334, lng: 125.527484 },
  { name: "Bandara Djalaludin Gorontalo", lat: 0.642445, lng: 122.848305 },
];

const DROP_POINTS = [
  { name: "Kantor Gubernur Sulut (Drop Point Bantuan)", lat: 1.470085, lng: 124.844832 }
];

const GATHERING_POINTS = [
  { name: "Kantor Desa Apengsala (Pusat)", lat: 2.381348, lng: 125.389983, elev: "47.0m", type: "central" },
  { name: "Kantor Desa Lumbo (Pusat)", lat: 2.344265, lng: 125.418412, elev: "173.8m", type: "central" },
  { name: "Gereja GMIST Apengsara", lat: 2.380443, lng: 125.391550, elev: "66.9m", type: "temp" },
  { name: "Gereja GMIST Boto", lat: 2.355787, lng: 125.386658, elev: "159.8m", type: "temp" },
  { name: "Gereja GMIST Mohongsawang", lat: 2.374824, lng: 125.379567, elev: "11.7m", type: "temp" },
  { name: "Gereja GPDI Boto", lat: 2.356686, lng: 125.389331, elev: "200.5m", type: "temp" },
  { name: "Kantor Camat Tagulandang Utara", lat: 2.352551, lng: 125.429462, elev: "173.2m", type: "temp" },
  { name: "SDN Inpres Mohongsawang", lat: 2.380080, lng: 125.385743, elev: "10.6m", type: "temp" },
  { name: "SMK Negeri 1 Tagulandang Utara", lat: 2.346008, lng: 125.422166, elev: "166.4m", type: "temp" },
  { name: "SPPG Tagulandang Selatan", lat: 2.318665, lng: 125.437831, elev: "7.5m", type: "temp" },
  { name: "SPPG Tagulandang Utara", lat: 2.368347, lng: 125.418561, elev: "6.1m", type: "temp" }
];

export default function MapPraBencana() {
  // Center regional agar zoom out terlihat dari Manado - Tahuna
  const regionalCenter: [number, number] = [2.2, 124.5]; 
  const volcanoPosition: [number, number] = [2.30597, 125.36680];
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // ── Konfigurasi Ikon
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const base = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-";
    const shadow = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";

    return {
      volcano: new L.Icon({ iconUrl: base + 'red.png', shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
      airport: new L.Icon({ iconUrl: base + 'black.png', shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
      dropPoint: new L.Icon({ iconUrl: base + 'blue.png', shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
      centralShelter: new L.Icon({ iconUrl: base + 'gold.png', shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
      tempShelter: new L.Icon({ iconUrl: base + 'green.png', shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
      user: new L.Icon({ iconUrl: base + 'violet.png', shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
    };
  }, []);
  
  const eruptionArea2024 = useMemo(() => [
    [4.8, 120.5], [5.3, 122.0], [4.6, 123.8], [3.8, 124.8], [2.9, 125.5],
    [1.3, 125.5], [0.4, 124.6], [0.5, 123.0], [0.8, 121.8], [1.1, 120.8],
    [2.7, 119.8], [4.5, 119.8]
  ] as [number, number][], []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn('Akses lokasi ditolak')
      );
    }
  }, []);

  if (!icons) {
    return <div className="w-full h-[450px] md:h-[650px] rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">Memuat Peta Regional...</div>;
  }

  return (
    <div className="w-full h-[450px] md:h-[650px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative z-0">
      <MapContainer
        center={regionalCenter}
        zoom={7} // Zoom out regional
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* ==============================================
            KONTROL LAYER / OPSI GANTI PETA
            ============================================== */}
        <LayersControl position="topright">
          
          {/* OPSI 1: Peta Standar (OpenStreetMap) - Default */}
          <LayersControl.BaseLayer checked name="Peta Standar (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* OPSI 2: Citra Satelit (Esri World Imagery) */}
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

        {/* Area Erupsi 2024 */}
        <Polygon
          positions={eruptionArea2024}
          pathOptions={{ fillColor: 'orange', color: 'darkorange', fillOpacity: 0.15, weight: 1 }}
        />

        {/* 1. Bandara Terdampak */}
        {AIRPORTS.map((ap, i) => (
          <Marker key={`ap-${i}`} position={[ap.lat, ap.lng]} icon={icons.airport}>
            <Popup><strong>✈️ {ap.name}</strong><br/>Status: Terdampak Penerbangan</Popup>
            <Tooltip direction="top">Bandara</Tooltip>
          </Marker>
        ))}

        {/* 2. Drop Point Manado */}
        {DROP_POINTS.map((dp, i) => (
          <Marker key={`dp-${i}`} position={[dp.lat, dp.lng]} icon={icons.dropPoint}>
            <Popup><strong>📦 {dp.name}</strong><br/>Pusat Distribusi Bantuan Utama</Popup>
          </Marker>
        ))}

        {/* 3 & 4. Titik Kumpul Terpusat & Sementara */}
        {GATHERING_POINTS.map((gp, i) => (
          <Marker 
            key={`gp-${i}`} 
            position={[gp.lat, gp.lng]} 
            icon={gp.type === 'central' ? icons.centralShelter : icons.tempShelter}
          >
            <Popup>
              <strong>{gp.type === 'central' ? '🏢' : '⛺'} {gp.name}</strong><br/>
              Elevasi: {gp.elev}<br/>
              Kategori: {gp.type === 'central' ? 'Pusat' : 'Sementara'}
            </Popup>
          </Marker>
        ))}

        {/* Gunung Ruang */}
        <Marker position={volcanoPosition} icon={icons.volcano}>
          <Popup><strong>🌋 Gunung Ruang</strong><br/>Pusat Erupsi</Popup>
        </Marker>

        {/* Lokasi User */}
        {userLocation && (
          <Marker position={userLocation} icon={icons.user}>
            <Popup>Lokasi Anda</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
