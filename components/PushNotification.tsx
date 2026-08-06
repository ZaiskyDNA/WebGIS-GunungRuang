"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface EmergencyAlert {
  level: number;
  name: string;
  description: string;
}

export default function PushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification === "undefined" ? "denied" : Notification.permission,
  );
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("status-perubahan")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "volcano_status" },
        (payload) => {
          const status = payload.new as EmergencyAlert;
          setEmergencyAlert(status);

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const title = `Peringatan dini: Level ${status.level}`;
            const options: NotificationOptions = {
              body: `Gunung Ruang berstatus ${status.name}. ${status.description}`,
              requireInteraction: true,
            };

            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready
                .then((registration) => registration.showNotification(title, options))
                .catch(() => new Notification(title, options));
            } else {
              new Notification(title, options);
            }
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    setPermission(await Notification.requestPermission());
  };

  return (
    <>
      {permission === "default" && (
        <aside className="fixed bottom-4 left-4 z-[9999] max-w-xs rounded-2xl border border-volcano-orange/25 bg-white p-4 shadow-xl" aria-label="Aktivasi notifikasi">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-volcano-dark">Aktifkan peringatan YOTA?</p>
          <button type="button" onClick={requestPermission} className="w-full rounded-xl bg-volcano-main px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-volcano-dark">
            Izinkan notifikasi bencana
          </button>
        </aside>
      )}

      {emergencyAlert && (
        <div className="fixed inset-0 z-[10000] grid place-items-center bg-volcano-dark/90 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="emergency-title">
          <div className="w-full max-w-lg rounded-[32px] border-4 border-volcano-main bg-white p-8 text-center shadow-2xl">
            <div className="mb-4 text-6xl" aria-hidden="true">⚠️</div>
            <div className="mb-4 inline-block rounded-full bg-volcano-orange/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-volcano-main">Siaran darurat YOTA</div>
            <h2 id="emergency-title" className="mb-2 text-3xl font-black tracking-tight text-volcano-main">
              Level {emergencyAlert.level} · {emergencyAlert.name}
            </h2>
            <p className="mb-8 font-medium leading-relaxed text-gray-700">{emergencyAlert.description}</p>
            <button type="button" onClick={() => setEmergencyAlert(null)} className="w-full rounded-xl bg-volcano-main px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-volcano-dark">
              Saya mengerti dan bersiap
            </button>
          </div>
        </div>
      )}
    </>
  );
}
