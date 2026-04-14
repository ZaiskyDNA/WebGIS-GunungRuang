"use client";

import { SimulationState, ERUPTION_THRESHOLD } from "../../lib/simulation";

interface ControlsProps {
  state: SimulationState;
  onTriggerEruption: () => void;
  onPressureChange: (v: number) => void;
  onWindChange: (v: number) => void;
  onViscosityChange: (v: number) => void;
}

const phaseLabels: Record<string, string> = {
  dormant: "🟢 Tidak Aktif",
  building: "🟡 Membangun Tekanan",
  erupting: "🔴 ERUPSI AKTIF",
  subsiding: "🟠 Meredam",
};

const phaseColors: Record<string, string> = {
  dormant: "#4ade80",
  building: "#facc15",
  erupting: "#ef4444",
  subsiding: "#f97316",
};

export default function Controls({
  state,
  onTriggerEruption,
  onPressureChange,
  onWindChange,
  onViscosityChange,
}: ControlsProps) {
  const phaseColor = phaseColors[state.eruptionPhase] || "#4ade80";

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Top Header */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "16px 24px",
        background: "linear-gradient(to bottom, rgba(5,0,10,0.95), transparent)",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "clamp(16px, 2.5vw, 22px)",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#ff6b35",
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(255,100,50,0.6)",
            }}>
              ⛰️ GUNUNG RUANG
            </h1>
            <p style={{
              margin: "2px 0 0",
              fontSize: "clamp(9px, 1.2vw, 11px)",
              color: "#aaa",
              letterSpacing: "0.15em",
            }}>
              KEPULAUAN SITARO · SULAWESI UTARA · ERUPSI 16–30 APRIL 2024
            </p>
          </div>
          <div style={{
            textAlign: "right",
            background: "rgba(0,0,0,0.5)",
            border: `1px solid ${phaseColor}44`,
            borderRadius: "6px",
            padding: "8px 12px",
          }}>
            <div style={{
              fontSize: "clamp(10px, 1.4vw, 13px)",
              fontWeight: 700,
              color: phaseColor,
              textShadow: `0 0 10px ${phaseColor}88`,
            }}>
              {phaseLabels[state.eruptionPhase]}
            </div>
            <div style={{ fontSize: "10px", color: "#888", marginTop: 3 }}>
              STATUS PVMBG
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel - Right */}
      <div style={{
        position: "absolute",
        top: "80px",
        right: "16px",
        width: "200px",
        background: "rgba(5,2,8,0.88)",
        border: "1px solid rgba(255,80,30,0.3)",
        borderRadius: "8px",
        padding: "14px",
        pointerEvents: "auto",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontSize: "9px", color: "#f97316", letterSpacing: "0.2em", marginBottom: 10, fontWeight: 700 }}>
          PARAMETER ERUPSI
        </div>

        <GaugeRow label="TEKANAN" value={state.pressure} max={100} color="#ef4444" threshold={ERUPTION_THRESHOLD} />
        <GaugeRow label="VOLUME MAGMA" value={state.magmaVolume} max={100} color="#f97316" />
        <GaugeRow label="VISKOSITAS" value={state.viscosity} max={100} color="#a78bfa" />
        <GaugeRow label="INTENSITAS ERUPSI" value={state.eruptionIntensity * 100} max={100} color="#ff6b35" />
        <GaugeRow label="KEPADATAN ABU" value={state.ashDensity * 100} max={100} color="#9ca3af" />
        <GaugeRow label="KECEPATAN ANGIN" value={state.windStrength} max={10} color="#60a5fa" unit=" m/s" />

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,80,30,0.2)" }}>
          <div style={{ fontSize: "8px", color: "#666", marginBottom: 6 }}>DATA HISTORIS</div>
          <div style={{ fontSize: "8px", color: "#888", lineHeight: 1.7 }}>
            📅 16 Apr 2024, 21:45 WITA<br />
            📊 Kolom abu: 3.000–5.000m<br />
            👥 Evakuasi: ±11.615 jiwa<br />
            🚨 Status: Level IV (AWAS)<br />
            🌊 Potensi tsunami: YA
          </div>
        </div>
      </div>

      {/* Controls Panel - Left bottom */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        width: "220px",
        background: "rgba(5,2,8,0.88)",
        border: "1px solid rgba(255,80,30,0.3)",
        borderRadius: "8px",
        padding: "14px",
        pointerEvents: "auto",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontSize: "9px", color: "#f97316", letterSpacing: "0.2em", marginBottom: 12, fontWeight: 700 }}>
          KONTROL SIMULASI
        </div>

        <button
          onClick={onTriggerEruption}
          style={{
            width: "100%",
            padding: "10px",
            background: state.isErupting
              ? "linear-gradient(135deg, #7f1d1d, #991b1b)"
              : "linear-gradient(135deg, #7f1d1d, #dc2626)",
            border: `1px solid ${state.isErupting ? "#666" : "#ef4444"}`,
            borderRadius: "6px",
            color: state.isErupting ? "#888" : "#fff",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: state.isErupting ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            fontFamily: "'Courier New', monospace",
            transition: "all 0.2s",
            boxShadow: state.isErupting ? "none" : "0 0 15px rgba(239,68,68,0.4)",
            marginBottom: 12,
          }}
          disabled={state.isErupting}
        >
          {state.isErupting ? "⚠️ SEDANG ERUPSI" : "🌋 PICU ERUPSI"}
        </button>

        <SliderControl
          label="TEKANAN MAGMA"
          value={state.pressure}
          min={0}
          max={100}
          color="#ef4444"
          onChange={onPressureChange}
        />
        <SliderControl
          label="KECEPATAN ANGIN"
          value={state.windStrength}
          min={0}
          max={10}
          color="#60a5fa"
          onChange={onWindChange}
          step={0.1}
        />
        <SliderControl
          label="VISKOSITAS LAVA"
          value={state.viscosity}
          min={0}
          max={100}
          color="#a78bfa"
          onChange={onViscosityChange}
        />

        <div style={{ marginTop: 12, fontSize: "9px", color: "#555", textAlign: "center" }}>
          Drag/Scroll untuk navigasi kamera
        </div>
      </div>

      {/* Eruption alert overlay */}
      {state.eruptionPhase === "erupting" && state.eruptionIntensity > 0.5 && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          textAlign: "center",
          animation: "pulse 0.5s ease-in-out infinite alternate",
        }}>
          <div style={{
            fontSize: "clamp(14px, 3vw, 24px)",
            fontWeight: 900,
            color: "#ef4444",
            letterSpacing: "0.2em",
            textShadow: "0 0 30px rgba(239,68,68,0.8)",
            border: "2px solid rgba(239,68,68,0.6)",
            padding: "8px 16px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "4px",
          }}>
            ⚠️ AWAS — LEVEL IV ⚠️
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function GaugeRow({ label, value, max, color, threshold, unit = "" }: {
  label: string; value: number; max: number; color: string; threshold?: number; unit?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const isWarning = threshold !== undefined && value >= threshold;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: "8px", color: "#777", letterSpacing: "0.1em" }}>{label}</span>
        <span style={{ fontSize: "8px", color: isWarning ? "#ef4444" : color, fontWeight: 700 }}>
          {Math.round(value)}{unit}
          {isWarning && " ⚠"}
        </span>
      </div>
      <div style={{ height: 3, background: "#1a1020", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: isWarning
            ? `linear-gradient(90deg, ${color}, #ef4444)`
            : `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
          transition: "width 0.2s",
          boxShadow: `0 0 4px ${color}66`,
        }} />
      </div>
    </div>
  );
}

function SliderControl({ label, value, min, max, color, onChange, step = 1 }: {
  label: string; value: number; min: number; max: number; color: string;
  onChange: (v: number) => void; step?: number;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "8px", color: "#777", letterSpacing: "0.1em" }}>{label}</span>
        <span style={{ fontSize: "8px", color, fontWeight: 700 }}>{Math.round(value * 10) / 10}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          accentColor: color,
          cursor: "pointer",
          height: "3px",
        }}
      />
    </div>
  );
}