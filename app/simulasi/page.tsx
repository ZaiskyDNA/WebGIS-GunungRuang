"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SimulationState, createInitialState, triggerEruption } from "../../lib/simulation";
import Controls from "../../components/ui/Controls";

// Dynamic import to avoid SSR issues with Three.js
const VolcanoScene = dynamic(() => import("../../components/Volcanoscene"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#050208",
      fontFamily: "'Courier New', monospace",
      color: "#ff6b35",
      flexDirection: "column",
      gap: "12px",
    }}>
      <div style={{ fontSize: 40 }}>🌋</div>
      <div style={{ letterSpacing: "0.2em", fontSize: 14 }}>MEMUAT SIMULASI...</div>
      <div style={{ fontSize: 11, color: "#666" }}>Gunung Ruang Eruption Model 2024</div>
    </div>
  ),
});

export default function GunungRuangPage() {
  const [simState, setSimState] = useState<SimulationState>(createInitialState());

  const handleStateChange = useCallback((state: SimulationState) => {
    setSimState(state);
  }, []);

  const handleTriggerEruption = useCallback(() => {
    setSimState((prev) => triggerEruption(prev));
  }, []);

  const handlePressureChange = useCallback((v: number) => {
    setSimState((prev) => ({ ...prev, pressure: v }));
  }, []);

  const handleWindChange = useCallback((v: number) => {
    setSimState((prev) => ({ ...prev, windStrength: v }));
  }, []);

  const handleViscosityChange = useCallback((v: number) => {
    setSimState((prev) => ({ ...prev, viscosity: v }));
  }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "#050208",
      position: "relative",
    }}>
      {/* 3D Scene */}
      <div style={{ width: "100%", height: "100%" }}>
        <VolcanoScene simState={simState} onStateChange={handleStateChange} />
      </div>

      {/* UI Overlay */}
      <Controls
        state={simState}
        onTriggerEruption={handleTriggerEruption}
        onPressureChange={handlePressureChange}
        onWindChange={handleWindChange}
        onViscosityChange={handleViscosityChange}
      />
    </div>
  );
}