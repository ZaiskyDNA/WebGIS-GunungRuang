"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; 

export default function PushNotification() {
  const [permission, setPermission] = useState<string>("default");
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null);

  useEffect(() => {
    // Cek status izin saat ini
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Berlangganan ke Supabase Realtime
    const channel = supabase
      .channel('status-perubahan')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'volcano_status' },
        (payload) => {
          const statusBaru = payload.new;

          // 1. SET STATE UNTUK MUNCULKAN MODAL DARURAT DI DALAM WEB (Pasti Berhasil 100%)
          setEmergencyAlert(statusBaru);

          // 2. COBA MUNCULKAN NOTIFIKASI OS (Jika diizinkan)
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              // Coba gunakan Service Worker (Untuk HP Android)
              // Coba gunakan Service Worker (Untuk HP Android)
              navigator.serviceWorker.ready.then((registration) => {
                const notifOptions: any = {
                  body: `Gunung Ruang kini berstatus ${statusBaru.name}. ${statusBaru.description}`,
                  icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                  vibrate: [200, 100, 200, 100, 200],
                  requireInteraction: true
                };
                
                registration.showNotification(`⚠️ PERINGATAN DINI: STATUS LEVEL ${statusBaru.level}`, notifOptions);
              }).catch(() => {
                // Fallback ke Notifikasi Standar (Untuk Laptop/Desktop)
                new Notification(`⚠️ PERINGATAN DINI: STATUS LEVEL ${statusBaru.level}`, {
                  body: `Gunung Ruang berstatus ${statusBaru.name}. ${statusBaru.description}`,
                  icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                  requireInteraction: true
                });
              });
            } catch (error) {
              console.log("OS Notification gagal, mengandalkan In-App Modal.");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fungsi untuk meminta izin lewat klik tombol (Mencegah blokir HP)
  const requestPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((status) => {
        setPermission(status);
        if (status === "granted") alert("Sistem Peringatan Dini berhasil diaktifkan di perangkat Anda!");
      });
    }
  };

  return (
    <>
      {/* TOMBOL AKTIVASI NOTIFIKASI (Muncul jika belum diizinkan) */}
      {permission === "default" && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-white p-4 rounded-2xl shadow-xl border border-red-200 max-w-xs animate-bounce">
          <p className="text-xs text-gray-600 mb-2 font-bold uppercase">Aktifkan Sirene Darurat?</p>
          <button 
            onClick={requestPermission}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
          >
            Izinkan Notifikasi Bencana
          </button>
        </div>
      )}

      {/* MODAL PERINGATAN DARURAT DALAM APLIKASI (Fallback Anti-Gagal) */}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[10000] bg-red-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 text-center shadow-2xl border-4 border-red-500 animate-pulse">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 uppercase tracking-widest">
              SIARAN DARURAT OTOMATIS
            </div>
            <h2 className="text-3xl font-black text-red-600 mb-2 tracking-tight">
              STATUS LEVEL {emergencyAlert.level} ({emergencyAlert.name.toUpperCase()})
            </h2>
            <p className="text-gray-700 font-medium leading-relaxed mb-8">
              {emergencyAlert.description}
            </p>
            <button 
              onClick={() => setEmergencyAlert(null)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 px-8 rounded-xl w-full transition-colors shadow-lg active:scale-95"
            >
              SAYA MENGERTI & BERSIAP
            </button>
          </div>
        </div>
      )}
    </>
  );
}