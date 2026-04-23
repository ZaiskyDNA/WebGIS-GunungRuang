"use client";

import { useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Sesuaikan path ini jika berbeda

export default function PushNotification() {
  useEffect(() => {
    // 1. Minta izin kepada pengguna untuk menampilkan Notifikasi
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    // 2. Berlangganan (Subscribe) ke Supabase Realtime khusus tabel volcano_status
    const channel = supabase
      .channel('status-perubahan')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'volcano_status' },
        (payload) => {
          const statusBaru = payload.new;

          // 3. Picu Notifikasi saat Admin menekan tombol Update
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`⚠️ PERINGATAN DINI: STATUS LEVEL ${statusBaru.level}`, {
              body: `Gunung Ruang kini berstatus ${statusBaru.name}. ${statusBaru.description}`,
              icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', 
              requireInteraction: true 
            });
          } else {
            alert(`⚠️ PERINGATAN DINI!\n\nStatus Gunung Ruang naik menjadi LEVEL ${statusBaru.level} (${statusBaru.name}).\n\n${statusBaru.description}`);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; 
}