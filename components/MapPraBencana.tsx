"use client";

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/supabase';

// Import komponen react-leaflet secara dinamis untuk menghindari SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const Circle = dynamic(
  () => import('react-leaflet').then(mod => mod.Circle),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

export default function MapPraBencana() {
  const volcanoPosition: [number, number] = [2.30597, 125.36680];
  const [evacuationPoints, setEvacuationPoints] = useState<{ id: number; lat: number; lng: number; name: string }[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // ── Konfigurasi default icon Leaflet (penting untuk avoid error)
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // ── Semua ikon WAJIB dibuat di dalam useMemo (client-only)
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return {
      custom: new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      }),
      volcano: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      }),
      user: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      }),
    };
  }, []);

  useEffect(() => {
    // Gunakan setTimeout untuk memastikan DOM siap
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // 1. Ambil Data Posko Evakuasi dari Supabase
    async function fetchPoints() {
      const { data } = await supabase.from('view_evacuation_points').select('*');
      if (data) setEvacuationPoints(data);
    }
    fetchPoints();

    // 2. Minta Izin Lokasi Pengguna (Geolocation)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Akses lokasi ditolak atau gagal:', error.message);
        }
      );
    }
  }, [isMounted]);

  // Jangan render map di server — cegah hydration mismatch
  if (!isMounted || !icons) {
    return (
      <div className="w-full h-[400px] md:h-[500px] rounded-xl bg-gray-200 animate-pulse flex items-center justify-center text-sm text-gray-500">
        Memuat Peta...
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl border-4 border-volcano-dark relative z-0">
      <MapContainer
        key="map-pra-bencana"
        center={volcanoPosition}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
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

        {/* Marker Puncak Gunung Ruang */}
        <Marker position={volcanoPosition} icon={icons.volcano}>
          <Popup>
            <strong>Gunung Ruang</strong>
            <br />
            Pusat Radius Bahaya
            <br />
            <span style={{ color: '#9B0F06', fontWeight: 600 }}>Status: Level II — Waspada</span>
          </Popup>
        </Marker>

        {/* Marker Posko Evakuasi dari Supabase */}
        {evacuationPoints.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={icons.custom}>
            <Popup>
              <strong>{point.name}</strong>
              <br />
              Posko Evakuasi
            </Popup>
          </Marker>
        ))}

        {/* Marker Lokasi Pengguna (jika geolocation diizinkan) */}
        {userLocation && (
          <Marker position={userLocation} icon={icons.user}>
            <Popup>
              <strong>Lokasi Anda Saat Ini</strong>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}