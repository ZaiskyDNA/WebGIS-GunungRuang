"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  SimulationState,
  updateSimulation,
} from "../lib/simulation";

interface VolcanoSceneProps {
  simState: SimulationState;
  onStateChange: (state: SimulationState) => void;
}

// Detect mobile for performance scaling (runs once at module load)
const IS_MOBILE = typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window);
const PERF_SCALE = IS_MOBILE ? 0.5 : 1;

const MAX_LAVA_PARTICLES = Math.round(800 * PERF_SCALE);
const MAX_ASH_PARTICLES = Math.round(1500 * PERF_SCALE);
const MAX_SMOKE_PARTICLES = Math.round(400 * PERF_SCALE);
const MAX_EMBER_PARTICLES = Math.round(300 * PERF_SCALE);

export default function VolcanoScene({ simState, onStateChange }: VolcanoSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    animId: number;
    lava: {
      positions: Float32Array;
      velocities: Float32Array;
      life: Float32Array;
      maxLife: Float32Array;
      colors: Float32Array;
      geometry: THREE.BufferGeometry;
      count: number;
    };
    ash: {
      positions: Float32Array;
      velocities: Float32Array;
      life: Float32Array;
      geometry: THREE.BufferGeometry;
      count: number;
    };
    smoke: {
      positions: Float32Array;
      velocities: Float32Array;
      life: Float32Array;
      sizes: Float32Array;
      geometry: THREE.BufferGeometry;
      count: number;
    };
    ember: {
      positions: Float32Array;
      velocities: Float32Array;
      life: Float32Array;
      geometry: THREE.BufferGeometry;
      count: number;
    };
    craterLight: THREE.PointLight;
    skyLight: THREE.HemisphereLight;
    sunLight: THREE.DirectionalLight;
    lavaFlowMesh: THREE.Mesh;
    lavaFlowTime: number;
    clock: THREE.Clock;
    simState: SimulationState;
  } | null>(null);

  const simStateRef = useRef(simState);

  useEffect(() => {
    simStateRef.current = simState;
  }, [simState]);

  // Build volcano geometry with procedural noise
  const buildVolcano = useCallback((scene: THREE.Scene) => {
    // Terrain base
    const terrainGeo = new THREE.PlaneGeometry(80, 80, 80, 80);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainPos = terrainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < terrainPos.count; i++) {
      const x = terrainPos.getX(i);
      const z = terrainPos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      const height =
        Math.max(0, 0.3 * Math.exp(-dist * 0.012)) +
        simplex2D(x * 0.1, z * 0.1) * 0.4 +
        simplex2D(x * 0.05, z * 0.05) * 0.6;
      terrainPos.setY(i, height);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1f });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrain);

    // Volcano cone
    const volcanoGeo = new THREE.ConeGeometry(14, 18, 64, 32, false);
    const vPos = volcanoGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < vPos.count; i++) {
      const y = vPos.getY(i);
      const x = vPos.getX(i);
      const z = vPos.getZ(i);
      const normalizedHeight = (y + 9) / 18;
      const noise =
        simplex2D(x * 0.3 + 10, z * 0.3 + 10) * 0.8 * (1 - normalizedHeight * 0.5) +
        simplex2D(x * 0.8, z * 0.8) * 0.3;
      const radialNoise = simplex2D(Math.atan2(z, x) * 2, normalizedHeight * 3) * 0.5;
      vPos.setX(i, x + noise * 0.6 + radialNoise * 0.4);
      vPos.setZ(i, z + noise * 0.6 + radialNoise * 0.4);
      vPos.setY(i, y + simplex2D(x * 0.2, z * 0.2) * 0.4 * normalizedHeight);
    }
    volcanoGeo.computeVertexNormals();

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.92,
      metalness: 0.05,
    });
    const volcano = new THREE.Mesh(volcanoGeo, rockMat);
    volcano.position.y = 9;
    volcano.castShadow = true;
    volcano.receiveShadow = true;
    scene.add(volcano);

    // Dark base ring
    const baseRingGeo = new THREE.CylinderGeometry(14.5, 16, 1.5, 32);
    const baseRingMat = new THREE.MeshLambertMaterial({ color: 0x2a1f14 });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.position.y = 0.2;
    scene.add(baseRing);

    // Crater inner
    const craterGeo = new THREE.CylinderGeometry(1.5, 2.5, 2, 32, 1, true);
    const craterMat = new THREE.MeshStandardMaterial({
      color: 0x1a0a00,
      side: THREE.BackSide,
      roughness: 1,
    });
    const crater = new THREE.Mesh(craterGeo, craterMat);
    crater.position.y = 18.3;
    scene.add(crater);

    // Crater rim
    const rimGeo = new THREE.TorusGeometry(2.2, 0.4, 12, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x3d2010, roughness: 0.95 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 18.5;
    rim.rotation.x = Math.PI / 2;
    scene.add(rim);

    // Lava pool inside crater
    const lavaPoolGeo = new THREE.CircleGeometry(1.4, 32);
    lavaPoolGeo.rotateX(-Math.PI / 2);
    const lavaPoolMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff2200,
      emissiveIntensity: 2.0,
      roughness: 0.3,
    });
    const lavaPool = new THREE.Mesh(lavaPoolGeo, lavaPoolMat);
    lavaPool.position.y = 17.5;
    scene.add(lavaPool);

    return { lavaPool };
  }, []);

  // Build lava flow meshes on volcano slopes
  const buildLavaFlows = useCallback((scene: THREE.Scene): THREE.Mesh => {
    const flowGeo = new THREE.PlaneGeometry(1.2, 8, 4, 20);
    flowGeo.rotateX(-Math.PI / 2);
    const lavaFlowMat = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 1.5,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
    });
    const flowMesh = new THREE.Mesh(flowGeo, lavaFlowMat);
    flowMesh.visible = false;
    // Position on slope
    flowMesh.position.set(3, 13, 3);
    flowMesh.rotation.set(-0.7, 0.5, 0.2);
    scene.add(flowMesh);

    // Second flow
    const flowGeo2 = new THREE.PlaneGeometry(0.9, 6, 4, 15);
    flowGeo2.rotateX(-Math.PI / 2);
    const flowMesh2 = new THREE.Mesh(flowGeo2, lavaFlowMat.clone());
    flowMesh2.visible = false;
    flowMesh2.position.set(-4, 12, 2);
    flowMesh2.rotation.set(-0.6, -0.8, 0.1);
    scene.add(flowMesh2);

    return flowMesh;
  }, []);

  // Initialize particle systems
  const initParticles = useCallback(() => {
    // LAVA
    const lavaPositions = new Float32Array(MAX_LAVA_PARTICLES * 3).fill(-999);
    const lavaVelocities = new Float32Array(MAX_LAVA_PARTICLES * 3).fill(0);
    const lavaLife = new Float32Array(MAX_LAVA_PARTICLES).fill(0);
    const lavaMaxLife = new Float32Array(MAX_LAVA_PARTICLES).fill(1);
    const lavaColors = new Float32Array(MAX_LAVA_PARTICLES * 3).fill(1);

    const lavaGeo = new THREE.BufferGeometry();
    lavaGeo.setAttribute("position", new THREE.BufferAttribute(lavaPositions, 3));
    lavaGeo.setAttribute("color", new THREE.BufferAttribute(lavaColors, 3));
    const lavaMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    });
    const lavaMesh = new THREE.Points(lavaGeo, lavaMat);

    // ASH
    const ashPositions = new Float32Array(MAX_ASH_PARTICLES * 3).fill(-999);
    const ashVelocities = new Float32Array(MAX_ASH_PARTICLES * 3).fill(0);
    const ashLife = new Float32Array(MAX_ASH_PARTICLES).fill(0);

    const ashGeo = new THREE.BufferGeometry();
    ashGeo.setAttribute("position", new THREE.BufferAttribute(ashPositions, 3));
    const ashMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x888880,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const ashMesh = new THREE.Points(ashGeo, ashMat);

    // SMOKE
    const smokePositions = new Float32Array(MAX_SMOKE_PARTICLES * 3).fill(-999);
    const smokeVelocities = new Float32Array(MAX_SMOKE_PARTICLES * 3).fill(0);
    const smokeLife = new Float32Array(MAX_SMOKE_PARTICLES).fill(0);
    const smokeSizes = new Float32Array(MAX_SMOKE_PARTICLES).fill(1);

    const smokeGeo = new THREE.BufferGeometry();
    smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      size: 2.5,
      color: 0x555550,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const smokeMesh = new THREE.Points(smokeGeo, smokeMat);

    // EMBER
    const emberPositions = new Float32Array(MAX_EMBER_PARTICLES * 3).fill(-999);
    const emberVelocities = new Float32Array(MAX_EMBER_PARTICLES * 3).fill(0);
    const emberLife = new Float32Array(MAX_EMBER_PARTICLES).fill(0);

    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xffaa00,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
    });
    const emberMesh = new THREE.Points(emberGeo, emberMat);

    return {
      lavaMesh, lavaPositions, lavaVelocities, lavaLife, lavaMaxLife, lavaColors, lavaGeo,
      ashMesh, ashPositions, ashVelocities, ashLife, ashGeo,
      smokeMesh, smokePositions, smokeVelocities, smokeLife, smokeSizes, smokeGeo,
      emberMesh, emberPositions, emberVelocities, emberLife, emberGeo,
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0508);
    scene.fog = new THREE.FogExp2(0x1a0805, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 500);
    camera.position.set(35, 22, 35);
    camera.lookAt(0, 10, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
    renderer.shadowMap.enabled = !IS_MOBILE;
    if (!IS_MOBILE) renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; 
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 15;
    controls.maxDistance = 80;
    controls.target.set(0, 8, 0);

    // Lighting
    const skyLight = new THREE.HemisphereLight(0x0a0510, 0x1a0803, 3.0);
    scene.add(skyLight);
    const sunLight = new THREE.DirectionalLight(0xffa060, 4.0);
    sunLight.position.set(-30, 40, -20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    const craterLight = new THREE.PointLight(0xff4400, 0, 100);
    craterLight.position.set(0, 18, 0);
    scene.add(craterLight);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 150 + Math.random() * 50;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi));
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Build volcano
    buildVolcano(scene);
    const lavaFlowMesh = buildLavaFlows(scene);

    // Particles
    const particles = initParticles();
    scene.add(particles.lavaMesh);
    scene.add(particles.ashMesh);
    scene.add(particles.smokeMesh);
    scene.add(particles.emberMesh);

    const clock = new THREE.Clock();
    const lavaCount = 0;
    const ashCount = 0;
    const smokeCount = 0;
    const emberCount = 0;
    const lavaFlowTime = 0;

    const refs = {
      scene, camera, renderer, controls,
      lava: {
        positions: particles.lavaPositions,
        velocities: particles.lavaVelocities,
        life: particles.lavaLife,
        maxLife: particles.lavaMaxLife,
        colors: particles.lavaColors,
        geometry: particles.lavaGeo,
        count: lavaCount,
      },
      ash: {
        positions: particles.ashPositions,
        velocities: particles.ashVelocities,
        life: particles.ashLife,
        geometry: particles.ashGeo,
        count: ashCount,
      },
      smoke: {
        positions: particles.smokePositions,
        velocities: particles.smokeVelocities,
        life: particles.smokeLife,
        sizes: particles.smokeSizes,
        geometry: particles.smokeGeo,
        count: smokeCount,
      },
      ember: {
        positions: particles.emberPositions,
        velocities: particles.emberVelocities,
        life: particles.emberLife,
        geometry: particles.emberGeo,
        count: emberCount,
      },
      craterLight,
      skyLight,
      sunLight,
      lavaFlowMesh,
      lavaFlowTime,
      clock,
      animId: 0,
      simState: simStateRef.current,
    };

    sceneRef.current = refs;

    const spawnLava = (intensity: number) => {
      const count = Math.floor(intensity * 12);
      for (let n = 0; n < count; n++) {
        const i = refs.lava.count % MAX_LAVA_PARTICLES;
        refs.lava.count++;
        const angle = Math.random() * Math.PI * 2;
        const spread = 0.4 + Math.random() * 0.6;
        const speed = 8 + Math.random() * 12 * intensity;
        const i3 = i * 3;
        refs.lava.positions[i3] = (Math.random() - 0.5) * 1.5;
        refs.lava.positions[i3 + 1] = 18.5;
        refs.lava.positions[i3 + 2] = (Math.random() - 0.5) * 1.5;
        refs.lava.velocities[i3] = Math.cos(angle) * spread * speed * 0.1;
        refs.lava.velocities[i3 + 1] = speed * 0.18 + Math.random() * speed * 0.1;
        refs.lava.velocities[i3 + 2] = Math.sin(angle) * spread * speed * 0.1;
        refs.lava.life[i] = 1.0;
        refs.lava.maxLife[i] = 1.5 + Math.random() * 2.0;
        // Start yellow-orange
        refs.lava.colors[i3] = 1.0;
        refs.lava.colors[i3 + 1] = 0.5 + Math.random() * 0.3;
        refs.lava.colors[i3 + 2] = 0.0;
      }
    };

    const spawnAsh = (intensity: number) => {
      const count = Math.floor(intensity * 20);
      for (let n = 0; n < count; n++) {
        const i = refs.ash.count % MAX_ASH_PARTICLES;
        refs.ash.count++;
        const i3 = i * 3;
        refs.ash.positions[i3] = (Math.random() - 0.5) * 3;
        refs.ash.positions[i3 + 1] = 19 + Math.random() * 5 * intensity;
        refs.ash.positions[i3 + 2] = (Math.random() - 0.5) * 3;
        refs.ash.velocities[i3] = (Math.random() - 0.5) * 0.5;
        refs.ash.velocities[i3 + 1] = 1 + Math.random() * 3 * intensity;
        refs.ash.velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
        refs.ash.life[i] = 1.0;
      }
    };

    const spawnSmoke = (intensity: number) => {
      if (Math.random() > 0.3) return;
      const i = refs.smoke.count % MAX_SMOKE_PARTICLES;
      refs.smoke.count++;
      const i3 = i * 3;
      refs.smoke.positions[i3] = (Math.random() - 0.5) * 2;
      refs.smoke.positions[i3 + 1] = 18 + Math.random() * 3;
      refs.smoke.positions[i3 + 2] = (Math.random() - 0.5) * 2;
      refs.smoke.velocities[i3] = (Math.random() - 0.5) * 0.2;
      refs.smoke.velocities[i3 + 1] = 0.3 + Math.random() * 0.5 * intensity;
      refs.smoke.velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
      refs.smoke.life[i] = 1.0;
    };

    const spawnEmbers = (intensity: number) => {
      const count = Math.floor(intensity * 6);
      for (let n = 0; n < count; n++) {
        const i = refs.ember.count % MAX_EMBER_PARTICLES;
        refs.ember.count++;
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 10;
        const i3 = i * 3;
        refs.ember.positions[i3] = (Math.random() - 0.5) * 1;
        refs.ember.positions[i3 + 1] = 18.5;
        refs.ember.positions[i3 + 2] = (Math.random() - 0.5) * 1;
        refs.ember.velocities[i3] = Math.cos(angle) * speed * 0.12;
        refs.ember.velocities[i3 + 1] = speed * 0.2 + Math.random() * 0.1;
        refs.ember.velocities[i3 + 2] = Math.sin(angle) * speed * 0.12;
        refs.ember.life[i] = 1.0;
      }
    };

    const animate = () => {
      refs.animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const state = simStateRef.current;

      // Update simulation
      const nextState = updateSimulation(state, dt);
      simStateRef.current = nextState;
      onStateChange(nextState);

      controls.update();

      const intensity = nextState.eruptionIntensity;
      const isErupting = nextState.isErupting;

      // Spawn particles during eruption
      if (isErupting || intensity > 0.05) {
        spawnLava(intensity);
        spawnAsh(intensity);
        spawnSmoke(intensity);
        spawnEmbers(intensity);
      }

      // Always emit a little smoke
      if (Math.random() < 0.2 + intensity * 0.5) {
        spawnSmoke(0.1 + intensity * 0.3);
      }

      const gravity = -0.012;
      const wind = nextState.windStrength;
      const windAngle = nextState.windDirection;
      const windX = Math.cos(windAngle) * wind * 0.002;
      const windZ = Math.sin(windAngle) * wind * 0.002;

      // Update lava particles
      for (let i = 0; i < MAX_LAVA_PARTICLES; i++) {
        if (refs.lava.life[i] <= 0) continue;
        refs.lava.life[i] -= dt / refs.lava.maxLife[i];
        const i3 = i * 3;
        refs.lava.velocities[i3 + 1] += gravity;
        refs.lava.positions[i3] += refs.lava.velocities[i3] * dt;
        refs.lava.positions[i3 + 1] += refs.lava.velocities[i3 + 1] * dt;
        refs.lava.positions[i3 + 2] += refs.lava.velocities[i3 + 2] * dt;
        // Color shift: yellow -> orange -> red -> dark
        const t = 1 - refs.lava.life[i];
        refs.lava.colors[i3] = Math.max(0.3, 1.0 - t * 0.5);
        refs.lava.colors[i3 + 1] = Math.max(0, 0.5 - t * 0.5);
        refs.lava.colors[i3 + 2] = 0;
        if (refs.lava.positions[i3 + 1] < 0) refs.lava.life[i] = 0;
        if (refs.lava.life[i] <= 0) refs.lava.positions[i3 + 1] = -999;
      }
      refs.lava.geometry.attributes.position.needsUpdate = true;
      refs.lava.geometry.attributes.color.needsUpdate = true;

      // Update ash particles
      for (let i = 0; i < MAX_ASH_PARTICLES; i++) {
        if (refs.ash.life[i] <= 0) continue;
        refs.ash.life[i] -= dt * 0.12;
        const i3 = i * 3;
        refs.ash.velocities[i3] += windX;
        refs.ash.velocities[i3 + 2] += windZ;
        refs.ash.velocities[i3 + 1] += gravity * 0.15;
        refs.ash.positions[i3] += refs.ash.velocities[i3] * dt;
        refs.ash.positions[i3 + 1] += refs.ash.velocities[i3 + 1] * dt;
        refs.ash.positions[i3 + 2] += refs.ash.velocities[i3 + 2] * dt;
        if (refs.ash.life[i] <= 0) refs.ash.positions[i3 + 1] = -999;
      }
      refs.ash.geometry.attributes.position.needsUpdate = true;

      // Update smoke
      for (let i = 0; i < MAX_SMOKE_PARTICLES; i++) {
        if (refs.smoke.life[i] <= 0) continue;
        refs.smoke.life[i] -= dt * 0.08;
        const i3 = i * 3;
        refs.smoke.velocities[i3] += windX * 0.3;
        refs.smoke.velocities[i3 + 2] += windZ * 0.3;
        refs.smoke.positions[i3] += refs.smoke.velocities[i3] * dt;
        refs.smoke.positions[i3 + 1] += refs.smoke.velocities[i3 + 1] * dt;
        refs.smoke.positions[i3 + 2] += refs.smoke.velocities[i3 + 2] * dt;
        if (refs.smoke.life[i] <= 0) refs.smoke.positions[i3 + 1] = -999;
      }
      refs.smoke.geometry.attributes.position.needsUpdate = true;

      // Update embers
      for (let i = 0; i < MAX_EMBER_PARTICLES; i++) {
        if (refs.ember.life[i] <= 0) continue;
        refs.ember.life[i] -= dt * 0.5;
        const i3 = i * 3;
        refs.ember.velocities[i3 + 1] += gravity * 1.5;
        refs.ember.positions[i3] += refs.ember.velocities[i3] * dt;
        refs.ember.positions[i3 + 1] += refs.ember.velocities[i3 + 1] * dt;
        refs.ember.positions[i3 + 2] += refs.ember.velocities[i3 + 2] * dt;
        if (refs.ember.positions[i3 + 1] < 0 || refs.ember.life[i] <= 0) {
          refs.ember.life[i] = 0;
          refs.ember.positions[i3 + 1] = -999;
        }
      }
      refs.ember.geometry.attributes.position.needsUpdate = true;

      // Crater light pulsing
      const pulseBase = 0.5 + intensity * 4;
      // PERBAIKAN: Kalikan 10 agar cahayanya terlihat di versi Three.js baru
      const pulse = (pulseBase + Math.sin(Date.now() * 0.008) * pulseBase * 0.3) * 10;
      refs.craterLight.intensity = pulse;
      refs.craterLight.color.setHex(intensity > 0.5 ? 0xff6600 : 0xff3300);

      // Lava flow visibility
      refs.lavaFlowMesh.visible = intensity > 0.2;
      // PERBAIKAN: Tambahkan intensitas material lava yang bersinar
      (refs.lavaFlowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (0.5 + intensity * 2.5) * 5;

      // Sky tint during eruption
      refs.skyLight.color.setHex(intensity > 0.3 ? 0x220808 : 0x0a0510);

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(refs.animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line

  // Handle external triggers
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.simState = simState;
    simStateRef.current = simState;
  }, [simState]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// Simple 2D simplex-like noise
function simplex2D(x: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Z = Math.floor(z) & 255;
  const xf = x - Math.floor(x);
  const zf = z - Math.floor(z);
  const u = fade(xf);
  const v = fade(zf);
  const a = (X + Z * 57) & 255;
  const b = (X + 1 + Z * 57) & 255;
  const c = (X + (Z + 1) * 57) & 255;
  const d = (X + 1 + (Z + 1) * 57) & 255;
  return lerp(v,
    lerp(u, grad(a, xf, zf), grad(b, xf - 1, zf)),
    lerp(u, grad(c, xf, zf - 1), grad(d, xf - 1, zf - 1))
  );
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, z: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : z;
  const v = h < 2 ? z : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}
