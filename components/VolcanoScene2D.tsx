"use client";

import { useEffect, useRef } from "react";
import { SimulationState } from "../lib/simulation";

interface VolcanoScene2DProps {
  simState: SimulationState;
  onStateChange: (state: SimulationState) => void;
}

export default function VolcanoScene2D({ simState, onStateChange }: VolcanoScene2DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simStateRef = useRef(simState);

  useEffect(() => {
    simStateRef.current = simState;
  }, [simState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    // Particle arrays for 2D simulation
    const ashParticles: { x: number; y: number; vx: number; vy: number; opacity: number; size: number }[] = [];
    const lavaParticles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

    // Initialize initial particles
    for (let i = 0; i < 40; i++) {
      ashParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.2 - 0.4,
        opacity: Math.random() * 0.5 + 0.2,
        size: Math.random() * 2.5 + 1
      });
    }

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const state = simStateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Sky Gradient (Night / Eruption Glow)
      const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
      if (state.isErupting || state.eruptionIntensity > 0.1) {
        skyGradient.addColorStop(0, "#160608");
        skyGradient.addColorStop(0.5, "#3b0a0e");
        skyGradient.addColorStop(1, "#5e0006");
      } else {
        skyGradient.addColorStop(0, "#08040a");
        skyGradient.addColorStop(0.7, "#140818");
        skyGradient.addColorStop(1, "#240e1e");
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 73 + 19) % w);
        const sy = ((i * 47 + 13) % (h * 0.5));
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Volcano Mountain Shape
      const centerX = w / 2;
      const craterY = h * 0.42;
      const baseWidth = w * 0.75;
      const craterWidth = 60;

      ctx.fillStyle = "#261a1c";
      ctx.beginPath();
      ctx.moveTo(centerX - baseWidth / 2, h);
      ctx.lineTo(centerX - craterWidth / 2, craterY);
      ctx.lineTo(centerX + craterWidth / 2, craterY);
      ctx.lineTo(centerX + baseWidth / 2, h);
      ctx.closePath();
      ctx.fill();

      // Mountain Texture Shading
      ctx.fillStyle = "#1b1113";
      ctx.beginPath();
      ctx.moveTo(centerX, craterY);
      ctx.lineTo(centerX + baseWidth / 2, h);
      ctx.lineTo(centerX - craterWidth / 2, craterY);
      ctx.closePath();
      ctx.fill();

      // 3. Eruption Column & Ash Cloud
      const intensity = state.isErupting ? Math.max(0.3, state.eruptionIntensity) : state.eruptionIntensity;
      const windX = Math.cos(state.windDirection) * state.windStrength * 12;

      if (intensity > 0.05) {
        // Eruption Column Plume
        const columnHeight = 120 + intensity * 200;
        const columnGradient = ctx.createLinearGradient(0, craterY, 0, craterY - columnHeight);
        columnGradient.addColorStop(0, "rgba(255, 87, 34, 0.85)");
        columnGradient.addColorStop(0.3, "rgba(180, 50, 20, 0.7)");
        columnGradient.addColorStop(1, "rgba(80, 70, 75, 0.4)");

        ctx.fillStyle = columnGradient;
        ctx.beginPath();
        ctx.moveTo(centerX - craterWidth / 2 + 5, craterY);
        ctx.quadraticCurveTo(
          centerX - 30 + windX * 0.5, craterY - columnHeight * 0.5,
          centerX - 50 + windX, craterY - columnHeight
        );
        ctx.lineTo(centerX + 50 + windX, craterY - columnHeight);
        ctx.quadraticCurveTo(
          centerX + 30 + windX * 0.5, craterY - columnHeight * 0.5,
          centerX + craterWidth / 2 - 5, craterY
        );
        ctx.closePath();
        ctx.fill();

        // Spawn Lava particles
        if (Math.random() < intensity * 0.8) {
          lavaParticles.push({
            x: centerX + (Math.random() - 0.5) * craterWidth * 0.6,
            y: craterY,
            vx: (Math.random() - 0.5) * 80 * intensity,
            vy: -150 - Math.random() * 120 * intensity,
            life: 1.0
          });
        }
      }

      // Update & Render Lava Particles
      for (let i = lavaParticles.length - 1; i >= 0; i--) {
        const p = lavaParticles[i];
        p.life -= dt * 0.8;
        p.vy += 220 * dt; // gravity
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.life <= 0 || p.y > h) {
          lavaParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.life > 0.5 ? "#ffc928" : "#ff4500";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update & Render Ash Particles
      ashParticles.forEach((p) => {
        p.x += (p.vx + windX * 0.1) * dt * 30;
        p.y += p.vy * dt * 30;
        if (p.y < 0) {
          p.y = h;
          p.x = Math.random() * w;
        }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.fillStyle = `rgba(220, 200, 190, ${p.opacity * (0.3 + intensity * 0.7)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Crater Glow
      const glowRadius = 30 + intensity * 40;
      const glowGradient = ctx.createRadialGradient(centerX, craterY, 5, centerX, craterY, glowRadius);
      glowGradient.addColorStop(0, "rgba(255, 200, 50, 0.9)");
      glowGradient.addColorStop(0.4, "rgba(255, 60, 0, 0.6)");
      glowGradient.addColorStop(1, "rgba(255, 0, 0, 0)");

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, craterY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Status Text Overlay on Canvas
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`TEKANAN MAGMA: ${Math.round(state.pressure)}%`, 16, 28);
      ctx.fillText(`VISKOSITAS: ${Math.round(state.viscosity)}%`, 16, 48);
      ctx.fillText(`ANGIN: ${Math.round(state.windStrength)} m/s`, 16, 68);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050208] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-full object-cover block"
      />
    </div>
  );
}
