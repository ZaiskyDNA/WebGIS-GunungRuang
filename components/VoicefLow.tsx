"use client";

import { useEffect } from "react";

export default function VoiceflowAI() {
  useEffect(() => {
    if (document.getElementById("voiceflow-script")) return;

    const script = document.createElement("script");
    script.id = "voiceflow-script";
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.type = "text/javascript";
    
    script.onload = () => {
      (window as any).voiceflow?.chat?.load({
        verify: { projectID: '69dded7494f85164138e1dc7' }, 
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production'
      });
    };
    
    document.body.appendChild(script);
  }, []);

  return null;
}