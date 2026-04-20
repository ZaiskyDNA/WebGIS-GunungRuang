"use client";

import { useEffect } from "react";

export default function VoiceflowAI() {
  useEffect(() => {
    // PENGECEKAN GANDA: Jangan muat ulang jika script atau mesinnya sudah jalan
    if (document.getElementById("voiceflow-script") || (window as any).voiceflow) {
      return; 
    }

    const script = document.createElement("script");
    script.id = "voiceflow-script";
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.type = "text/javascript";
    
    script.onload = () => {
      // SABUK PENGAMAN: Gunakan try-catch agar error internal Voiceflow tidak merusak web
      try {
        (window as any).voiceflow?.chat?.load({
          verify: { projectID: '69dded7494f85164138e1dc7' }, 
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production'
        });
      } catch (error) {
        console.warn("Peringatan Sistem AI:", error);
      }
    };
    
    document.body.appendChild(script);
  }, []);

  return null;
}