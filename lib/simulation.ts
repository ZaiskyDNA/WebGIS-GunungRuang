// simulation.ts - Eruption Physics & State Management for Gunung Ruang 2024

export interface SimulationState {
  pressure: number;          // 0-100
  magmaVolume: number;       // 0-100
  viscosity: number;         // 0-100 (higher = thicker lava)
  windStrength: number;      // 0-10 m/s
  windDirection: number;     // radians
  isErupting: boolean;
  eruptionIntensity: number; // 0-1
  eruptionPhase: 'dormant' | 'building' | 'erupting' | 'subsiding';
  time: number;
  ashDensity: number;        // 0-1
  lavaFlowSpeed: number;     // 0-1
}

export interface Particle {
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;         // 0-1 remaining life
  maxLife: number;
  type: 'lava' | 'ash' | 'smoke' | 'ember';
  size: number;
  color: [number, number, number];
  opacity: number;
}

export const ERUPTION_THRESHOLD = 75;
export const GRAVITY = -9.81;
export const SCALE_FACTOR = 0.05; // scale gravity to scene units

// Gunung Ruang eruption parameters based on April 2024 event
export const GUNUNG_RUANG_PARAMS = {
  height: 725,          // meters
  craterRadius: 80,     // meters estimated
  // April 16, 2024 eruption - column height 3000-5000m
  maxEruptionColumnHeight: 5000,
  // ~11,615 evacuees in 6km radius
  evacuationRadius: 6000,
  // Eruption started 21:45 WITA
  eruptionStartHour: 21,
};

export function createInitialState(): SimulationState {
  return {
    pressure: 0,
    magmaVolume: 30,
    viscosity: 60,
    windStrength: 3,
    windDirection: Math.PI * 0.25,
    isErupting: false,
    eruptionIntensity: 0,
    eruptionPhase: 'dormant',
    time: 0,
    ashDensity: 0,
    lavaFlowSpeed: 0,
  };
}

export function updateSimulation(state: SimulationState, deltaTime: number): SimulationState {
  const next = { ...state };
  next.time += deltaTime;

  // Pressure builds naturally (like magma accumulating)
  if (!state.isErupting) {
    next.pressure = Math.min(100, state.pressure + deltaTime * 2);
  }

  // Phase transitions
  if (next.pressure >= ERUPTION_THRESHOLD && next.eruptionPhase === 'dormant') {
    next.eruptionPhase = 'building';
  }

  if (next.pressure >= 90 && next.eruptionPhase === 'building') {
    next.isErupting = true;
    next.eruptionPhase = 'erupting';
  }

  if (next.isErupting) {
    // Eruption intensifies then subsides
    const targetIntensity = Math.min(1, (next.pressure - ERUPTION_THRESHOLD) / 25);
    next.eruptionIntensity += (targetIntensity - state.eruptionIntensity) * deltaTime * 2;
    
    // Pressure releases during eruption
    next.pressure = Math.max(0, state.pressure - deltaTime * 15);
    next.magmaVolume = Math.max(0, state.magmaVolume - deltaTime * 5);
    next.ashDensity = Math.min(1, state.ashDensity + deltaTime * 0.3);
    next.lavaFlowSpeed = next.eruptionIntensity;
    
    // Eruption subsides when pressure drops
    if (next.pressure < 20) {
      next.isErupting = false;
      next.eruptionPhase = 'subsiding';
    }
  } else {
    // Cool down
    next.eruptionIntensity = Math.max(0, state.eruptionIntensity - deltaTime * 0.5);
    next.ashDensity = Math.max(0, state.ashDensity - deltaTime * 0.1);
    next.lavaFlowSpeed = Math.max(0, state.lavaFlowSpeed - deltaTime * 0.3);
    
    if (next.eruptionIntensity < 0.01 && next.eruptionPhase === 'subsiding') {
      next.eruptionPhase = 'dormant';
    }
  }

  return next;
}

export function triggerEruption(state: SimulationState): SimulationState {
  return {
    ...state,
    pressure: 95,
    isErupting: true,
    eruptionPhase: 'erupting',
    eruptionIntensity: 0.1,
  };
}

// Physics for lava particle
export function updateLavaParticle(
  pos: Float32Array, vel: Float32Array, idx: number, dt: number
): void {
  const i3 = idx * 3;
  // Apply gravity
  vel[i3 + 1] += GRAVITY * SCALE_FACTOR * dt;
  pos[i3] += vel[i3] * dt;
  pos[i3 + 1] += vel[i3 + 1] * dt;
  pos[i3 + 2] += vel[i3 + 2] * dt;
}

// Physics for ash particle (wind-affected)
export function updateAshParticle(
  pos: Float32Array, vel: Float32Array, idx: number, dt: number,
  windStrength: number, windDir: number
): void {
  const i3 = idx * 3;
  const windX = Math.cos(windDir) * windStrength * 0.01;
  const windZ = Math.sin(windDir) * windStrength * 0.01;
  
  vel[i3] += windX * dt;
  vel[i3 + 2] += windZ * dt;
  vel[i3 + 1] += GRAVITY * SCALE_FACTOR * 0.1 * dt; // slower fall
  
  pos[i3] += vel[i3] * dt;
  pos[i3 + 1] += vel[i3 + 1] * dt;
  pos[i3 + 2] += vel[i3 + 2] * dt;
}