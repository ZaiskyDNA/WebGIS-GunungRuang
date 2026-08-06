"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// ==========================================
// 1. GAME CONFIGURATION & MITIGATION TIPS
// ==========================================
const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;
const HIGH_SCORE_KEY = "merapi_escape_highscore";
const ACHIEVEMENTS_KEY = "merapi_escape_achievements";
const SOUND_KEY = "merapi_escape_sound";

const MITIGATION_TIPS = [
  "Saat terjadi erupsi eksplosif, segera gunakan masker N95 untuk melindungi saluran pernapasan dari silika abu vulkanik.",
  "Ikuti rambu dan jalur evakuasi resmi yang telah ditetapkan oleh BPBD. Hindari menerobos alur sungai berisiko lahar.",
  "Area dalam radius berbahaya (KRB) wajib segera dikosongkan saat gunung berapi dinaikkan ke Level IV (AWAS).",
  "Penyebab utama cedera saat erupsi adalah hirupan abu tajam dan reruntuhan akibat beban akumulasi abu di atap rumah.",
  "Selalu siapkan Tas Siaga Bencana berisi air minum 3 hari, makanan instan, radio baterai, dokumen penting, dan P3K.",
  "Jika berada di pesisir pulau gunung api, segera naik ke dataran tinggi (>50 mdpl) untuk menghindari potensi tsunami vulkanik."
];

// Checkpoint Definitions
interface Checkpoint {
  distance: number;
  name: string;
  bonusScore: number;
  reached: boolean;
}

const CHECKPOINTS_DATA: Checkpoint[] = [
  { distance: 250, name: "Posko 1: Desa Bahoi", bonusScore: 1000, reached: false },
  { distance: 500, name: "Posko 2: Tagulandang", bonusScore: 2000, reached: false },
  { distance: 750, name: "Posko 3: Pelabuhan Evakuasi", bonusScore: 3500, reached: false },
  { distance: 1000, name: "Posko Utama: ZONA SAFE REFUGE", bonusScore: 5000, reached: false }
];

// Difficulty Presets
type DifficultyMode = "SANTAI" | "SIAGA" | "AWAS";

interface DifficultyConfig {
  name: string;
  label: string;
  badge: string;
  color: string;
  border: string;
  baseWorldSpeed: number;
  spawnInterval: number;
  multiplier: number;
  bombsActive: boolean;
  desc: string;
}

const DIFFICULTY_SETTINGS: Record<DifficultyMode, DifficultyConfig> = {
  SANTAI: {
    name: "SANTAI",
    label: "Mode Santai (Easy)",
    badge: "🌱 Pemula",
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    baseWorldSpeed: 130,
    spawnInterval: 1.5,
    multiplier: 1.0,
    bombsActive: false,
    desc: "Lava tenang di bawah. Rintangan longgar untuk latihan."
  },
  SIAGA: {
    name: "SIAGA",
    label: "Mode Siaga (Normal)",
    badge: "🟡 Standar",
    color: "text-amber-400",
    border: "border-amber-500/40",
    baseWorldSpeed: 155,
    spawnInterval: 1.2,
    multiplier: 1.5,
    bombsActive: false,
    desc: "Tantangan seimbang. Lava meluap saat menabrak rintangan."
  },
  AWAS: {
    name: "AWAS",
    label: "Mode AWAS (Hardcore)",
    badge: "🔥 Extreme",
    color: "text-rose-400",
    border: "border-rose-500/50",
    baseWorldSpeed: 185,
    spawnInterval: 0.9,
    multiplier: 2.5,
    bombsActive: true,
    desc: "Erupsi susulan + Hujan Bom Vulkanik! Multiplier Poin 2.5x!"
  }
};

// Expanded Challenging Achievements Data
interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  unlocked: boolean;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "checkpoint_1", title: "Penyintas Pertama", desc: "Tiba di Posko 1 Desa Bahoi (250m)", icon: "🏕️", tier: "BRONZE", unlocked: false },
  { id: "checkpoint_2", title: "Penyintas Tagulandang", desc: "Tiba di Posko 2 Tagulandang (500m)", icon: "🚁", tier: "SILVER", unlocked: false },
  { id: "checkpoint_3", title: "Master Evakuasi Sitaro", desc: "Tiba di Posko 3 Pelabuhan (750m)", icon: "🛳️", tier: "GOLD", unlocked: false },
  { id: "checkpoint_4", title: "Pahlawan RuangTangguh", desc: "Tiba di Posko Utama Refuge (1.000m)", icon: "👑", tier: "PLATINUM", unlocked: false },
  { id: "dodge_5", title: "Refleks Kilat", desc: "Lakukan 5 Near-Miss Dodge dalam 1 run", icon: "⚡", tier: "BRONZE", unlocked: false },
  { id: "dodge_12", title: "Dodge Master Supreme", desc: "Lakukan 12 Near-Miss Dodge dalam 1 run!", icon: "🥋", tier: "GOLD", unlocked: false },
  { id: "score_5000", title: "Penyelamat Tangguh", desc: "Raih skor 5.000 Poin", icon: "🏆", tier: "SILVER", unlocked: false },
  { id: "score_10000", title: "Legenda Evakuasi", desc: "Raih skor 10.000 Poin!", icon: "💎", tier: "PLATINUM", unlocked: false },
  { id: "shield_collector", title: "Benteng Kokoh", desc: "Kumpulkan 3 Perisai Evakuasi dalam 1 run", icon: "🛡️", tier: "SILVER", unlocked: false },
  { id: "mode_awas_extreme", title: "Penakluk Level AWAS", desc: "Raih >2.500 Poin di Mode AWAS (Hardcore)", icon: "🔥", tier: "PLATINUM", unlocked: false }
];

// ==========================================
// 2. AUDIO SYNTHESIZER (WEB AUDIO API)
// ==========================================
let _audioCtx: AudioContext | null = null;
const getAudioCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (_audioCtx && _audioCtx.state !== "closed") {
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    return _audioCtx;
  }
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;
    _audioCtx = new AudioCtxClass();
    return _audioCtx;
  } catch { return null; }
};

const playSound = (type: "move" | "pickup" | "shield" | "dodge" | "checkpoint" | "crash" | "alarm" | "gameover" | "bomb", soundEnabled: boolean) => {
  if (!soundEnabled || typeof window === "undefined") return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;

    if (type === "move") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "dodge") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "checkpoint") {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } else if (type === "pickup") {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.1);
      });
    } else if (type === "shield") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "bomb") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "crash") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "alarm") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "gameover") {
      const notes = [300, 260, 220, 160];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.2);
      });
    }
  } catch {
    // Web audio fail-safe
  }
};

// ==========================================
// 3. GAME TYPES & INTERFACES
// ==========================================
type GameState = "MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAME_OVER";

interface Player {
  x: number;
  targetX: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  vx: number;
  tilt: number;
  shieldTime: number;
  speedBoostTime: number;
}

interface Obstacle {
  id: number;
  type: "ROCK" | "TREE" | "CRACK";
  x: number;
  y: number;
  width: number;
  height: number;
  gapX?: number;
  gapWidth?: number;
  dodged?: boolean;
}

interface VolcanicBomb {
  id: number;
  x: number;
  targetY: number;
  y: number;
  radius: number;
  warningTime: number;
  impacted: boolean;
}

interface Item {
  id: number;
  type: "MASK" | "SHIELD" | "BOOTS";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  opacity: number;
  color: string;
}

interface AshParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

export default function GamePage() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [difficulty, setDifficulty] = useState<DifficultyMode>("SIAGA");
  const [showInstructions, setShowInstructions] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [dodgeStreak, setDodgeStreak] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [gameOverCause, setGameOverCause] = useState("");
  const [mitigationTip, setMitigationTip] = useState("");

  // Control states
  const [isLeftPressed, setIsLeftPressed] = useState(false);
  const [isRightPressed, setIsRightPressed] = useState(false);
  const [useTouchButtons, setUseTouchButtons] = useState(false);

  // Checkpoints State
  const checkpointsRef = useRef<Checkpoint[]>(JSON.parse(JSON.stringify(CHECKPOINTS_DATA)));
  const currentCheckpointBannerRef = useRef<{ name: string; bonus: number; timer: number } | null>(null);

  // Refs for Game Loop & Mascot Sprite
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const gameStateRef = useRef<GameState>("MENU");
  const difficultyRef = useRef<DifficultyMode>("SIAGA");
  const soundEnabledRef = useRef(true);

  // Stats Counters for Achievements
  const shieldsCollectedCountRef = useRef(0);

  // Engine Refs
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - 24,
    targetX: CANVAS_WIDTH / 2 - 24,
    y: CANVAS_HEIGHT - 150,
    width: 48,
    height: 56,
    speed: 340,
    vx: 0,
    tilt: 0,
    shieldTime: 0,
    speedBoostTime: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const bombsRef = useRef<VolcanicBomb[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<AshParticle[]>([]);
  const lavaYRef = useRef(CANVAS_HEIGHT + 140);
  const lavaTargetYRef = useRef(CANVAS_HEIGHT + 140);
  const worldSpeedRef = useRef(150);
  const nextEntityIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const bombTimerRef = useRef(0);
  const surgeTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const dodgeCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Sync refs with React State
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Load Mascot Image, Local Storage & Achievements
  useEffect(() => {
    const img = new window.Image();
    img.src = "/maskot.webp";
    img.onload = () => {
      playerImgRef.current = img;
    };

    if (typeof window !== "undefined") {
      const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
      if (savedScore) setHighScore(parseInt(savedScore, 10));

      const savedSound = localStorage.getItem(SOUND_KEY);
      if (savedSound !== null) setSoundEnabled(savedSound === "true");

      const savedAch = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (savedAch) {
        try {
          const parsed = JSON.parse(savedAch);
          // Merge with DEFAULT_ACHIEVEMENTS to maintain tier & icon definitions
          const merged = DEFAULT_ACHIEVEMENTS.map((def) => {
            const found = parsed.find((p: Achievement) => p.id === def.id);
            return found ? { ...def, unlocked: found.unlocked } : def;
          });
          setAchievements(merged);
        } catch {
          // ignore error
        }
      }
    }

    // Background Ash Particles
    const particles: AshParticle[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2.5 + 1,
        speedY: Math.random() * 35 + 15,
        speedX: (Math.random() - 0.5) * 12,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    particlesRef.current = particles;
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setIsLeftPressed(true);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setIsRightPressed(true);
      } else if (e.key === "Escape" || e.key === " ") {
        if (gameStateRef.current === "PLAYING") {
          setGameState("PAUSED");
          playSound("move", soundEnabledRef.current);
        } else if (gameStateRef.current === "PAUSED") {
          setGameState("PLAYING");
          lastTimeRef.current = performance.now();
          playSound("move", soundEnabledRef.current);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setIsLeftPressed(false);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setIsRightPressed(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && gameStateRef.current === "PLAYING") {
        setGameState("PAUSED");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // DIRECT TOUCH / DRAG CONTROLLER FOR CANVAS
  const handleCanvasPointer = (clientX: number) => {
    if (gameStateRef.current !== "PLAYING") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);

    const player = playerRef.current;
    player.targetX = Math.max(12, Math.min(CANVAS_WIDTH - player.width - 12, touchX - player.width / 2));
  };

  // Start Countdown Process
  const startCountdown = () => {
    playSound("move", soundEnabled);
    setGameState("COUNTDOWN");
    setCountdown(3);
    setShowInstructions(false);

    const config = DIFFICULTY_SETTINGS[difficulty];

    playerRef.current = {
      x: CANVAS_WIDTH / 2 - 24,
      targetX: CANVAS_WIDTH / 2 - 24,
      y: CANVAS_HEIGHT - 150,
      width: 48,
      height: 56,
      speed: 340,
      vx: 0,
      tilt: 0,
      shieldTime: 0,
      speedBoostTime: 0
    };

    checkpointsRef.current = JSON.parse(JSON.stringify(CHECKPOINTS_DATA));
    currentCheckpointBannerRef.current = null;
    obstaclesRef.current = [];
    bombsRef.current = [];
    itemsRef.current = [];
    floatingTextsRef.current = [];

    lavaYRef.current = CANVAS_HEIGHT + 140;
    lavaTargetYRef.current = CANVAS_HEIGHT + 140;

    worldSpeedRef.current = config.baseWorldSpeed;
    spawnTimerRef.current = 0;
    bombTimerRef.current = 0;
    surgeTimerRef.current = 0;
    scoreRef.current = 0;
    distanceRef.current = 0;
    dodgeCountRef.current = 0;
    shieldsCollectedCountRef.current = 0;

    setScore(0);
    setDistance(0);
    setDodgeStreak(0);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playSound("move", soundEnabledRef.current);
      } else {
        clearInterval(timer);
        setGameState("PLAYING");
        playSound("alarm", soundEnabledRef.current);
        lastTimeRef.current = performance.now();
      }
    }, 800);
  };

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    if (typeof window !== "undefined") {
      localStorage.setItem(SOUND_KEY, nextSound.toString());
    }
  };

  // Main Canvas Game Loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    let animId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      update(dt);
      render();

      if (gameStateRef.current === "PLAYING") {
        animId = requestAnimationFrame(gameLoop);
      }
    };

    animId = requestAnimationFrame(gameLoop);
    animFrameIdRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [gameState, isLeftPressed, isRightPressed]);

  // ==========================================
  // 4. GAME UPDATE LOGIC (DYNAMIC SURGES & SKILL)
  // ==========================================
  const update = (dt: number) => {
    const player = playerRef.current;
    const config = DIFFICULTY_SETTINGS[difficultyRef.current];

    if (player.shieldTime > 0) player.shieldTime = Math.max(0, player.shieldTime - dt);
    if (player.speedBoostTime > 0) player.speedBoostTime = Math.max(0, player.speedBoostTime - dt);

    const baseSpeed = player.speedBoostTime > 0 ? player.speed * 1.35 : player.speed;

    if (isLeftPressed) player.targetX -= baseSpeed * dt;
    if (isRightPressed) player.targetX += baseSpeed * dt;

    player.targetX = Math.max(8, Math.min(CANVAS_WIDTH - player.width - 8, player.targetX));

    const dx = player.targetX - player.x;
    player.vx = dx * 16;
    player.x += player.vx * dt;

    if (player.vx < -10) player.tilt = -0.15;
    else if (player.vx > 10) player.tilt = 0.15;
    else player.tilt = 0;

    worldSpeedRef.current += 1.0 * dt;
    const currentWorldSpeed = worldSpeedRef.current;

    // DYNAMIC LAVA SURGE LOGIC
    surgeTimerRef.current += dt;
    if (surgeTimerRef.current >= 26.0) {
      surgeTimerRef.current = 0;
      lavaTargetYRef.current -= 50;
      playSound("alarm", soundEnabledRef.current);
      floatingTextsRef.current.push({
        id: Date.now(),
        text: "⚠️ ERUPSI SUSULAN!",
        x: CANVAS_WIDTH / 2 - 60,
        y: CANVAS_HEIGHT - 120,
        opacity: 1.5,
        color: "#ef4444"
      });
    }

    lavaTargetYRef.current = Math.min(CANVAS_HEIGHT + 140, lavaTargetYRef.current + 8 * dt);
    lavaYRef.current += (lavaTargetYRef.current - lavaYRef.current) * 3 * dt;

    distanceRef.current += (currentWorldSpeed / 18) * dt;
    scoreRef.current += Math.round(24 * config.multiplier * dt);
    const currentDist = Math.floor(distanceRef.current);
    setScore(Math.floor(scoreRef.current));
    setDistance(currentDist);

    // CHECKPOINT DETECTION & REWARD
    checkpointsRef.current.forEach((cp) => {
      if (!cp.reached && currentDist >= cp.distance) {
        cp.reached = true;
        scoreRef.current += cp.bonusScore;
        player.shieldTime = 6.0;
        lavaTargetYRef.current = CANVAS_HEIGHT + 160;

        playSound("checkpoint", soundEnabledRef.current);
        currentCheckpointBannerRef.current = {
          name: cp.name,
          bonus: cp.bonusScore,
          timer: 3.0
        };
      }
    });

    if (currentCheckpointBannerRef.current) {
      currentCheckpointBannerRef.current.timer -= dt;
      if (currentCheckpointBannerRef.current.timer <= 0) {
        currentCheckpointBannerRef.current = null;
      }
    }

    particlesRef.current.forEach((p) => {
      p.y += p.speedY * dt;
      p.x += p.speedX * dt;
      if (p.y > CANVAS_HEIGHT) {
        p.y = -10;
        p.x = Math.random() * CANVAS_WIDTH;
      }
    });

    floatingTextsRef.current.forEach((ft) => {
      ft.y -= 30 * dt;
      ft.opacity -= 0.8 * dt;
    });
    floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.opacity > 0);

    obstaclesRef.current.forEach((obs) => {
      obs.y += currentWorldSpeed * dt;

      if (!obs.dodged && obs.y > player.y && obs.y < player.y + player.height + 20) {
        const dxLeft = Math.abs(player.x + player.width - obs.x);
        const dxRight = Math.abs(player.x - (obs.x + obs.width));
        if (dxLeft < 14 || dxRight < 14) {
          obs.dodged = true;
          dodgeCountRef.current += 1;
          setDodgeStreak(dodgeCountRef.current);
          scoreRef.current += 120 * config.multiplier;
          playSound("dodge", soundEnabledRef.current);
          floatingTextsRef.current.push({
            id: Date.now() + Math.random(),
            text: "⚡ DODGE! +120",
            x: player.x - 10,
            y: player.y - 15,
            opacity: 1,
            color: "#4ade80"
          });
        }
      }
    });
    obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.y < CANVAS_HEIGHT + 100);

    if (config.bombsActive) {
      bombTimerRef.current += dt;
      if (bombTimerRef.current >= 4.5) {
        bombTimerRef.current = 0;
        playSound("bomb", soundEnabledRef.current);
        bombsRef.current.push({
          id: Date.now(),
          x: Math.random() * (CANVAS_WIDTH - 60) + 30,
          targetY: Math.random() * (CANVAS_HEIGHT - 250) + 100,
          y: -40,
          radius: 26,
          warningTime: 1.2,
          impacted: false
        });
      }

      bombsRef.current.forEach((bomb) => {
        if (bomb.warningTime > 0) {
          bomb.warningTime -= dt;
        } else if (!bomb.impacted) {
          bomb.y += 450 * dt;
          if (bomb.y >= bomb.targetY) {
            bomb.impacted = true;
          }
        }
      });
      bombsRef.current = bombsRef.current.filter((b) => b.y < CANVAS_HEIGHT + 50);
    }

    itemsRef.current.forEach((item) => {
      item.y += currentWorldSpeed * dt;
    });
    itemsRef.current = itemsRef.current.filter((item) => item.y < CANVAS_HEIGHT + 50);

    spawnTimerRef.current += dt;
    if (spawnTimerRef.current >= config.spawnInterval) {
      spawnTimerRef.current = 0;
      spawnEntity();
    }

    checkCollisions();
  };

  const spawnEntity = () => {
    const id = nextEntityIdRef.current++;
    const rand = Math.random();

    if (rand < 0.65) {
      const typeRand = Math.random();
      if (typeRand < 0.45) {
        const width = 38;
        const height = 38;
        const x = Math.random() * (CANVAS_WIDTH - width - 30) + 15;
        obstaclesRef.current.push({ id, type: "ROCK", x, y: -50, width, height });
      } else if (typeRand < 0.75) {
        const height = 26;
        const gapWidth = 98;
        const gapX = Math.random() * (CANVAS_WIDTH - gapWidth - 40) + 20;
        obstaclesRef.current.push({
          id,
          type: "TREE",
          x: 0,
          y: -40,
          width: CANVAS_WIDTH,
          height,
          gapX,
          gapWidth
        });
      } else {
        const width = 65;
        const height = 45;
        const x = Math.random() * (CANVAS_WIDTH - width - 30) + 15;
        obstaclesRef.current.push({ id, type: "CRACK", x, y: -60, width, height });
      }
    } else {
      const itemTypeRand = Math.random();
      const type = itemTypeRand < 0.45 ? "MASK" : itemTypeRand < 0.75 ? "SHIELD" : "BOOTS";
      const width = 36;
      const height = 36;
      const x = Math.random() * (CANVAS_WIDTH - width - 40) + 20;
      itemsRef.current.push({ id, type, x, y: -40, width, height });
    }
  };

  const checkCollisions = () => {
    const player = playerRef.current;
    const pBox = {
      x: player.x + 8,
      y: player.y + 10,
      w: player.width - 16,
      h: player.height - 16
    };

    if (lavaYRef.current <= player.y + player.height - 18) {
      triggerGameOver("Lava vulkanik mengejarmu dari belakang!");
      return;
    }

    for (const bomb of bombsRef.current) {
      if (bomb.impacted || bomb.warningTime <= 0) {
        const dx = (player.x + player.width / 2) - bomb.x;
        const dy = (player.y + player.height / 2) - (bomb.impacted ? bomb.targetY : bomb.y);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bomb.radius + 14) {
          if (player.shieldTime > 0) {
            player.shieldTime = 0;
            bomb.y = CANVAS_HEIGHT + 200;
            playSound("crash", soundEnabledRef.current);
          } else {
            triggerGameOver("Kamu dihantam bom batu pijar vulkanik!");
            return;
          }
        }
      }
    }

    itemsRef.current = itemsRef.current.filter((item) => {
      const isColliding =
        pBox.x < item.x + item.width &&
        pBox.x + pBox.w > item.x &&
        pBox.y < item.y + item.height &&
        pBox.y + pBox.h > item.y;

      if (isColliding) {
        const config = DIFFICULTY_SETTINGS[difficultyRef.current];
        if (item.type === "MASK") {
          scoreRef.current += 500 * config.multiplier;
          playSound("pickup", soundEnabledRef.current);
        } else if (item.type === "SHIELD") {
          player.shieldTime = 7.0;
          shieldsCollectedCountRef.current += 1;
          playSound("shield", soundEnabledRef.current);
        } else if (item.type === "BOOTS") {
          player.speedBoostTime = 4.5;
          lavaTargetYRef.current = Math.min(CANVAS_HEIGHT + 140, lavaTargetYRef.current + 80);
          playSound("pickup", soundEnabledRef.current);
        }
        return false;
      }
      return true;
    });

    for (const obs of obstaclesRef.current) {
      if (obs.type === "ROCK") {
        if (
          pBox.x < obs.x + obs.width &&
          pBox.x + pBox.w > obs.x &&
          pBox.y < obs.y + obs.height &&
          pBox.y + pBox.h > obs.y
        ) {
          if (player.shieldTime > 0) {
            player.shieldTime = 0;
            obs.y = CANVAS_HEIGHT + 200;
            playSound("crash", soundEnabledRef.current);
          } else {
            lavaTargetYRef.current -= 45;
            triggerGameOver("Kamu menabrak batu vulkanik raksasa!");
            return;
          }
        }
      } else if (obs.type === "TREE") {
        if (obs.gapX !== undefined && obs.gapWidth !== undefined) {
          const hitLeft = pBox.x < obs.gapX;
          const hitRight = pBox.x + pBox.w > obs.gapX + obs.gapWidth;
          const isYOverlapping = pBox.y < obs.y + obs.height && pBox.y + pBox.h > obs.y;

          if ((hitLeft || hitRight) && isYOverlapping) {
            if (player.shieldTime > 0) {
              player.shieldTime = 0;
              obs.y = CANVAS_HEIGHT + 200;
              playSound("crash", soundEnabledRef.current);
            } else {
              lavaTargetYRef.current -= 45;
              triggerGameOver("Kamu terhalang pohon tumbang dan tidak menemukan celah evakuasi!");
              return;
            }
          }
        }
      } else if (obs.type === "CRACK") {
        if (
          pBox.x < obs.x + obs.width &&
          pBox.x + pBox.w > obs.x &&
          pBox.y < obs.y + obs.height &&
          pBox.y + pBox.h > obs.y
        ) {
          lavaTargetYRef.current -= 18 * 0.016;
          player.vx *= 0.65;
        }
      }
    }
  };

  // Trigger Game Over Sequence & Check Challenging Achievements
  const triggerGameOver = (cause: string) => {
    playSound("crash", soundEnabledRef.current);
    setTimeout(() => playSound("gameover", soundEnabledRef.current), 200);

    setGameState("GAME_OVER");
    setGameOverCause(cause);

    const randomTip = MITIGATION_TIPS[Math.floor(Math.random() * MITIGATION_TIPS.length)];
    setMitigationTip(randomTip);

    const finalScore = Math.floor(scoreRef.current);
    const finalDist = Math.floor(distanceRef.current);
    const dodges = dodgeCountRef.current;
    const shieldsCollected = shieldsCollectedCountRef.current;

    if (finalScore > highScore) {
      setHighScore(finalScore);
      if (typeof window !== "undefined") {
        localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
      }
    }

    // Check & Unlock 10 Challenging Achievements
    const updatedAchievements = achievements.map((ach) => {
      let isUnlocked = ach.unlocked;
      if (ach.id === "checkpoint_1" && finalDist >= 250) isUnlocked = true;
      if (ach.id === "checkpoint_2" && finalDist >= 500) isUnlocked = true;
      if (ach.id === "checkpoint_3" && finalDist >= 750) isUnlocked = true;
      if (ach.id === "checkpoint_4" && finalDist >= 1000) isUnlocked = true;

      if (ach.id === "dodge_5" && dodges >= 5) isUnlocked = true;
      if (ach.id === "dodge_12" && dodges >= 12) isUnlocked = true;

      if (ach.id === "score_5000" && finalScore >= 5000) isUnlocked = true;
      if (ach.id === "score_10000" && finalScore >= 10000) isUnlocked = true;

      if (ach.id === "shield_collector" && shieldsCollected >= 3) isUnlocked = true;
      if (ach.id === "mode_awas_extreme" && difficultyRef.current === "AWAS" && finalScore >= 2500) isUnlocked = true;

      return { ...ach, unlocked: isUnlocked };
    });

    setAchievements(updatedAchievements);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updatedAchievements));
    }
  };

  // ==========================================
  // 5. CANVAS RENDERER LOGIC
  // ==========================================
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#1e1315";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#4a2428";
    ctx.fillRect(0, 0, 16, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 16, 0, 16, CANVAS_HEIGHT);

    ctx.strokeStyle = "rgba(238, 217, 185, 0.2)";
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 22]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    particlesRef.current.forEach((p) => {
      ctx.fillStyle = `rgba(255, 220, 200, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    bombsRef.current.forEach((bomb) => {
      if (bomb.warningTime > 0) {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.targetY, bomb.radius + 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
        ctx.fill();

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("⚠️ BOM VULKANIK", bomb.x - 45, bomb.targetY - bomb.radius - 8);
      } else {
        const curY = bomb.impacted ? bomb.targetY : bomb.y;
        ctx.fillStyle = "#ff4500";
        ctx.beginPath();
        ctx.arc(bomb.x, curY, bomb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffc928";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = "bold 22px sans-serif";
        ctx.fillText("☄️", bomb.x - 14, curY + 8);
      }
    });

    obstaclesRef.current.forEach((obs) => {
      if (obs.type === "ROCK") {
        ctx.fillStyle = "#332c2e";
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 10);
        ctx.fill();
        ctx.strokeStyle = "#d53e0f";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = "#ff6b00";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(obs.x + 8, obs.y + 10);
        ctx.lineTo(obs.x + 20, obs.y + 22);
        ctx.lineTo(obs.x + 30, obs.y + 28);
        ctx.stroke();

        ctx.font = "bold 16px sans-serif";
        ctx.fillText("🪨", obs.x + 9, obs.y + 25);

      } else if (obs.type === "TREE") {
        ctx.fillStyle = "#5c3a1e";
        ctx.fillRect(0, obs.y, obs.gapX || 0, obs.height);
        ctx.fillStyle = "#2d4218";
        ctx.fillRect(0, obs.y - 4, obs.gapX || 0, 6);

        const rightStart = (obs.gapX || 0) + (obs.gapWidth || 0);
        ctx.fillStyle = "#5c3a1e";
        ctx.fillRect(rightStart, obs.y, CANVAS_WIDTH - rightStart, obs.height);
        ctx.fillStyle = "#2d4218";
        ctx.fillRect(rightStart, obs.y - 4, CANVAS_WIDTH - rightStart, 6);

        ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
        ctx.fillRect(obs.gapX || 0, obs.y - 6, obs.gapWidth || 0, obs.height + 12);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.gapX || 0, obs.y - 6, obs.gapWidth || 0, obs.height + 12);

        ctx.fillStyle = "#86efac";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("⬇ JALUR AMAN ⬇", (obs.gapX || 0) + (obs.gapWidth || 0) / 2 - 40, obs.y + 16);

      } else if (obs.type === "CRACK") {
        ctx.fillStyle = "rgba(20, 5, 8, 0.85)";
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ff4500";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("⚠️ SLOW", obs.x + 8, obs.y + 26);
      }
    });

    itemsRef.current.forEach((item) => {
      ctx.save();
      ctx.shadowBlur = 10;
      if (item.type === "MASK") {
        ctx.shadowColor = "#eed9b9";
        ctx.fillStyle = "#eed9b9";
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("😷", item.x + 7, item.y + 26);
        ctx.fillStyle = "#eed9b9";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("+500", item.x + 3, item.y - 4);
      } else if (item.type === "SHIELD") {
        ctx.shadowColor = "#38bdf8";
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("🛡️", item.x + 7, item.y + 26);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("PERISAI", item.x - 2, item.y - 4);
      } else if (item.type === "BOOTS") {
        ctx.shadowColor = "#22c55e";
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("⚡", item.x + 7, item.y + 26);
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("SPEED", item.x + 1, item.y - 4);
      }
      ctx.restore();
    });

    const player = playerRef.current;
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.tilt);

    if (player.shieldTime > 0) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
      ctx.fill();
    }

    if (playerImgRef.current && playerImgRef.current.complete && playerImgRef.current.naturalWidth > 0) {
      ctx.drawImage(
        playerImgRef.current,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
      );
    } else {
      ctx.fillStyle = "#eed9b9";
      ctx.beginPath();
      ctx.roundRect(-20, -24, 40, 48, 12);
      ctx.fill();
    }
    ctx.restore();

    floatingTextsRef.current.forEach((ft) => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.font = "bold 14px sans-serif";
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    if (currentCheckpointBannerRef.current) {
      const banner = currentCheckpointBannerRef.current;
      ctx.save();
      ctx.fillStyle = "rgba(16, 185, 129, 0.88)";
      ctx.fillRect(20, 80, CANVAS_WIDTH - 40, 60);
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 80, CANVAS_WIDTH - 40, 60);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`🎉 CHECKPOINT ZONA AMAN!`, CANVAS_WIDTH / 2, 102);
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`${banner.name} (+${banner.bonus} Pts)`, CANVAS_WIDTH / 2, 124);
      ctx.restore();
    }

    const lavaY = lavaYRef.current;
    const lavaGradient = ctx.createLinearGradient(0, lavaY, 0, CANVAS_HEIGHT);
    lavaGradient.addColorStop(0, "#ff6b00");
    lavaGradient.addColorStop(0.3, "#d93600");
    lavaGradient.addColorStop(1, "#5e0006");

    ctx.fillStyle = lavaGradient;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(0, lavaY);

    const time = performance.now() / 250;
    for (let x = 0; x <= CANVAS_WIDTH; x += 20) {
      const waveY = lavaY + Math.sin(x * 0.05 + time) * 6;
      ctx.lineTo(x, waveY);
    }

    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffc928";
    ctx.lineWidth = 3.5;
    ctx.stroke();
  };

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#120406] text-white py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden border border-volcano-orange/50">
              <Image src="/maskot.webp" alt="Yota Mascot" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-volcano-sand tracking-wide">
                MERAPI & RUANG ESCAPE
              </h1>
              <p className="text-xs text-white/70">
                2D Lava Survival Runner — Checkpoint Evakuasi & Tantangan Lencana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-2 transition"
            >
              {soundEnabled ? "🔊 Suara: ON" : "🔇 Suara: OFF"}
            </button>
            {highScore > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                🏆 High Score: {highScore}
              </div>
            )}
          </div>
        </div>

        {/* DUAL RESPONSIVE LAYOUT CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* DESKTOP SIDEBAR LEFT: MODE SELECTOR & CHECKPOINTS        */}
          {/* ======================================================== */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            
            {/* Difficulty Selector Card */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-volcano-sand flex items-center gap-2">
                ⚙️ Tingkat Kesulitan
              </h3>
              <div className="space-y-2">
                {(Object.keys(DIFFICULTY_SETTINGS) as DifficultyMode[]).map((key) => {
                  const cfg = DIFFICULTY_SETTINGS[key];
                  const isSelected = difficulty === key;
                  return (
                    <button
                      key={key}
                      disabled={gameState === "PLAYING"}
                      onClick={() => setDifficulty(key)}
                      className={`w-full p-3 rounded-2xl border text-left transition ${
                        isSelected
                          ? `bg-white/10 ${cfg.border} ring-2 ring-volcano-orange/50`
                          : "bg-white/5 border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10">
                          {cfg.multiplier}x Pts
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-1">{cfg.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkpoint Milestones Progress Card */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-volcano-sand flex items-center gap-2">
                🏕️ Posko Checkpoint Evakuasi
              </h3>
              <div className="space-y-2 text-xs">
                {CHECKPOINTS_DATA.map((cp) => {
                  const isReached = distance >= cp.distance;
                  return (
                    <div
                      key={cp.distance}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        isReached
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                          : "bg-white/5 border-white/10 text-white/50"
                      }`}
                    >
                      <span>{cp.name}</span>
                      <span>{isReached ? "✓ Terlewati" : `${cp.distance}m`}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* CENTER COLUMN: MAIN CANVAS ARCADE CABINET                */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Mobile Mode Switcher (Visible only on Mobile) */}
            <div className="w-full max-w-[360px] mb-3 grid grid-cols-3 gap-2 lg:hidden">
              {(Object.keys(DIFFICULTY_SETTINGS) as DifficultyMode[]).map((key) => {
                const cfg = DIFFICULTY_SETTINGS[key];
                return (
                  <button
                    key={key}
                    disabled={gameState === "PLAYING"}
                    onClick={() => setDifficulty(key)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                      difficulty === key
                        ? "bg-volcano-orange border-volcano-orange text-white"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    {cfg.name} ({cfg.multiplier}x)
                  </button>
                );
              })}
            </div>

            {/* ARCADE FRAME */}
            <div className="relative overflow-hidden rounded-3xl bg-white/5 border-2 border-volcano-orange/30 shadow-[0_20px_60px_rgba(213,62,15,0.2)] backdrop-blur-xl flex flex-col items-center w-full max-w-[360px]">
              
              {/* Arcade Topbar */}
              <div className="w-full px-4 py-3 bg-black/50 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌋</span>
                  <div>
                    <h2 className="text-xs font-black text-volcano-sand tracking-wide">YOTA ARCADE</h2>
                    <p className="text-[9px] text-white/50">{DIFFICULTY_SETTINGS[difficulty].label}</p>
                  </div>
                </div>

                {gameState === "PLAYING" && (
                  <button
                    onClick={() => setGameState("PAUSED")}
                    className="px-3 py-1 rounded-xl bg-volcano-orange hover:bg-volcano-main text-[11px] font-bold transition"
                  >
                    ⏸ Pause
                  </button>
                )}
              </div>

              {/* CANVAS VIEWPORT (WITH DIRECT TOUCH & DRAG) */}
              <div className="relative w-full aspect-[9/16] bg-black flex items-center justify-center touch-none select-none">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="w-full h-full object-contain block touch-none cursor-pointer"
                  onPointerDown={(e) => handleCanvasPointer(e.clientX)}
                  onPointerMove={(e) => {
                    if (e.buttons === 1) handleCanvasPointer(e.clientX);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length > 0) handleCanvasPointer(e.touches[0].clientX);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length > 0) handleCanvasPointer(e.touches[0].clientX);
                  }}
                />

                {/* 1. START MENU OVERLAY */}
                {gameState === "MENU" && (
                  <div className="absolute inset-0 bg-volcano-dark/95 backdrop-blur-md p-6 flex flex-col items-center justify-between text-center z-20">
                    <div className="my-auto space-y-4 max-w-xs flex flex-col items-center">
                      <div className="relative size-20 p-2 rounded-3xl bg-volcano-orange/20 border border-volcano-orange/40 shadow-xl overflow-hidden flex items-center justify-center">
                        <Image src="/maskot.webp" alt="Yota Mascot" width={70} height={70} className="object-contain" priority />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-volcano-sand">Lava Survival Runner</span>
                        <h2 className="text-2xl font-black text-white mt-0.5">MERAPI ESCAPE</h2>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                          Bantu YOTA berlari menuju Checkpoint Posko Evakuasi! Sentuh langsung layar untuk mengarahkan YOTA.
                        </p>
                      </div>

                      <div className="w-full space-y-2 pt-2">
                        <button
                          onClick={startCountdown}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-volcano-orange to-volcano-main text-white font-black text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
                        >
                          🎮 MULAI PERMAINAN (START)
                        </button>
                        <button
                          onClick={() => setShowInstructions(!showInstructions)}
                          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 font-bold text-xs transition"
                        >
                          📖 Petunjuk & Kontrol
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. INSTRUCTIONS MODAL */}
                {showInstructions && gameState === "MENU" && (
                  <div className="absolute inset-0 bg-black/90 p-5 flex flex-col justify-between z-30 text-left">
                    <div className="space-y-3 overflow-y-auto pr-1 text-xs">
                      <h3 className="text-sm font-bold text-volcano-sand border-b border-white/10 pb-2">
                        📖 Petunjuk & Kontrol Langsung
                      </h3>
                      <div className="space-y-1.5 text-white/80">
                        <p><b>📱 Mobile Direct Touch:</b> Sentuh/geser jari langsung di layar Canvas untuk menggerakkan YOTA!</p>
                        <p><b>🎮 Desktop:</b> Gunakan [A] / [D] atau Panah Kiri/Kanan.</p>
                        <p><b>🏕️ Checkpoint Evakuasi:</b> Capai Posko 250m & 500m untuk bonus poin, pemulihan perisai, dan mundurkan lava!</p>
                        <p><b>⚡ Dynamic Lava Surge:</b> Lava HANYA meluap saat menabrak rintangan atau terjadi sirine erupsi.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="w-full py-2 mt-3 rounded-xl bg-white/20 text-white font-bold text-xs hover:bg-white/30 transition"
                    >
                      Tutup Petunjuk
                    </button>
                  </div>
                )}

                {/* 3. COUNTDOWN OVERLAY */}
                {gameState === "COUNTDOWN" && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-20">
                    <div className="text-center animate-bounce">
                      <div className="text-7xl font-black text-volcano-sand drop-shadow-lg">
                        {countdown}
                      </div>
                      <div className="text-xs uppercase tracking-widest text-white/80 mt-2 font-bold">
                        Bersiap Evakuasi!
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PAUSE OVERLAY */}
                {gameState === "PAUSED" && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center z-20 space-y-4">
                    <div className="text-4xl">⏸</div>
                    <h3 className="text-xl font-bold text-white">Permainan Dijeda</h3>
                    <div className="w-full max-w-xs space-y-2 pt-2">
                      <button
                        onClick={() => {
                          setGameState("PLAYING");
                          lastTimeRef.current = performance.now();
                        }}
                        className="w-full py-3 rounded-xl bg-volcano-orange font-bold text-xs text-white transition"
                      >
                        ▶️ Lanjutkan Bermain
                      </button>
                      <button
                        onClick={startCountdown}
                        className="w-full py-2.5 rounded-xl bg-white/10 font-bold text-xs text-white transition"
                      >
                        🔄 Mulai Ulang
                      </button>
                      <button
                        onClick={() => setGameState("MENU")}
                        className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs transition"
                      >
                        🚪 Keluar ke Menu
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. GAME OVER OVERLAY */}
                {gameState === "GAME_OVER" && (
                  <div className="absolute inset-0 bg-volcano-dark/95 backdrop-blur-md p-5 flex flex-col items-center justify-between text-center z-20">
                    <div className="my-auto space-y-3 w-full flex flex-col items-center">
                      <div className="relative size-14 p-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 shadow-xl overflow-hidden flex items-center justify-center">
                        <Image src="/maskot.webp" alt="Yota Defeated" width={48} height={48} className="object-contain grayscale" />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Permainan Berakhir</span>
                        <h2 className="text-2xl font-extrabold text-white mt-0.5">GAME OVER</h2>
                        <p className="text-xs text-rose-200 mt-1 font-semibold">{gameOverCause}</p>
                      </div>

                      <div className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-white/70">
                          <span>Skor Akhir:</span>
                          <span className="font-bold text-amber-300 text-sm">{score} Poin</span>
                        </div>
                        <div className="flex justify-between items-center text-white/70">
                          <span>Jarak Tempuh:</span>
                          <span className="font-bold text-sky-300">{distance} Meter</span>
                        </div>
                        <div className="flex justify-between items-center text-white/70 border-t border-white/10 pt-1">
                          <span>High Score:</span>
                          <span className="font-bold text-amber-400">{highScore} Poin</span>
                        </div>
                      </div>

                      <div className="w-full p-2.5 rounded-xl bg-volcano-orange/15 border border-volcano-orange/30 text-left text-[11px] text-white/90 space-y-1">
                        <div className="font-bold text-volcano-sand">💡 Mitigasi Bencana BPBD:</div>
                        <p className="text-white/80 leading-snug">{mitigationTip}</p>
                      </div>

                      <div className="w-full space-y-2 pt-1">
                        <button
                          onClick={startCountdown}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-volcano-orange to-volcano-main text-white font-bold text-xs shadow-lg transition"
                        >
                          🔄 Main Lagi (PLAY AGAIN)
                        </button>
                        <button
                          onClick={() => setGameState("MENU")}
                          className="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition"
                        >
                          🏠 Menu Utama
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* HUD DISPLAY */}
              {gameState === "PLAYING" && (
                <div className="w-full px-4 py-2 bg-black/70 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-volcano-sand">
                  <div>🏃 {distance}m</div>
                  <div>⚡ {dodgeStreak} Combo</div>
                  <div>🏆 {score} Pts</div>
                </div>
              )}

              {/* OPTIONAL TOUCH CONTROLLER TOGGLE ON MOBILE */}
              <div className="w-full p-2.5 bg-black/90 border-t border-white/10 flex flex-col items-center lg:hidden">
                <button
                  onClick={() => setUseTouchButtons(!useTouchButtons)}
                  className="text-[10px] text-white/50 hover:text-white pb-1 font-bold"
                >
                  {useTouchButtons ? "👆 Sembunyikan Tombol (Mode Sentuh Langsung Screen)" : "🎮 Tampilkan Tombol Virtual Kiri/Kanan"}
                </button>

                {useTouchButtons && (
                  <div className="w-full grid grid-cols-2 gap-3 pt-1">
                    <button
                      onPointerDown={() => setIsLeftPressed(true)}
                      onPointerUp={() => setIsLeftPressed(false)}
                      onPointerLeave={() => setIsLeftPressed(false)}
                      className="py-3.5 rounded-2xl bg-white/10 active:bg-volcano-orange text-white font-black text-base text-center select-none touch-none"
                    >
                      ◀ KIRI
                    </button>
                    <button
                      onPointerDown={() => setIsRightPressed(true)}
                      onPointerUp={() => setIsRightPressed(false)}
                      onPointerLeave={() => setIsRightPressed(false)}
                      className="py-3.5 rounded-2xl bg-white/10 active:bg-volcano-orange text-white font-black text-base text-center select-none touch-none"
                    >
                      KANAN ▶
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP SIDEBAR RIGHT: EXPANDED CHALLENGING ACHIEVEMENTS */}
          {/* ======================================================== */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            
            {/* Achievements Card with Tiers */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-volcano-sand flex items-center justify-between">
                <span>🎖️ Pencapaian (10 Badges)</span>
                <span className="text-[10px] font-mono text-amber-400">
                  {achievements.filter((a) => a.unlocked).length} / {achievements.length}
                </span>
              </h3>

              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {achievements.map((ach) => {
                  const tierColors = {
                    BRONZE: "border-amber-700/40 bg-amber-950/20 text-amber-300",
                    SILVER: "border-slate-400/40 bg-slate-800/30 text-slate-200",
                    GOLD: "border-amber-400/50 bg-amber-500/15 text-amber-300",
                    PLATINUM: "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  };

                  return (
                    <div
                      key={ach.id}
                      className={`p-2.5 rounded-2xl border flex items-center gap-3 transition ${
                        ach.unlocked
                          ? `${tierColors[ach.tier]} shadow-md`
                          : "bg-white/5 border-white/10 text-white/35 opacity-55"
                      }`}
                    >
                      <div className="text-2xl">{ach.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs flex items-center justify-between gap-1">
                          <span className="truncate">{ach.title}</span>
                          {ach.unlocked && <span className="text-amber-400 font-bold shrink-0">✓</span>}
                        </div>
                        <div className="text-[10px] text-white/60 truncate mt-0.5">{ach.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Keyboard Controls Guide Card */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-volcano-sand flex items-center gap-2">
                ⌨️ Panduan Keyboard
              </h3>
              <div className="space-y-2 text-white/80">
                <div className="flex items-center justify-between">
                  <span>Bergerak Kiri:</span>
                  <span className="px-2 py-1 bg-white/10 rounded-lg font-mono font-bold">A / ◄</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bergerak Kanan:</span>
                  <span className="px-2 py-1 bg-white/10 rounded-lg font-mono font-bold">D / ►</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Jeda Permainan:</span>
                  <span className="px-2 py-1 bg-white/10 rounded-lg font-mono font-bold">ESC / SPASI</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Back Link to WebGIS Home */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition"
          >
            ← Kembali ke Peta WebGIS Mitigasi
          </Link>
        </div>

      </div>
    </main>
  );
}
