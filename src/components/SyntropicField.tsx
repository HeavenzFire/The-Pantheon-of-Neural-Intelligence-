import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sliders, RefreshCw, Activity, Sparkles, AlertCircle, Shield, Radio, Wand2 } from 'lucide-react';
import { BalancedNonary } from '../types/balancedNonary';
import { BalancedNonaryLogic } from '../utils/balancedNonaryLogic';

export class SyntropicField {
    private field: BalancedNonary[][];

    constructor(size: number) {
        this.field = this.initializeField(size);
    }

    private initializeField(size: number): BalancedNonary[][] {
        const field: BalancedNonary[][] = [];
        for (let i = 0; i < size; i++) {
            field[i] = [];
            for (let j = 0; j < size; j++) {
                field[i][j] = (Math.floor(Math.random() * 9) - 4) as BalancedNonary;
            }
        }
        return field;
    }

    private updateField(i: number, j: number, value: BalancedNonary): void {
        this.field[i][j] = BalancedNonaryLogic.add(this.field[i][j], value);
    }

    private getFieldValue(i: number, j: number): BalancedNonary {
        return this.field[i][j];
    }

    public propagate(): void {
        const size = this.field.length;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const value = this.getFieldValue(i, j);
                if (i > 0) this.updateField(i - 1, j, value);
                if (i < size - 1) this.updateField(i + 1, j, value);
                if (j > 0) this.updateField(i, j - 1, value);
                if (j < size - 1) this.updateField(i, j + 1, value);
            }
        }
    }
}

// Helper to convert HSL to RGB for live vertex color updates
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(h + 1/3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1/3);
  }
  return [r, g, b];
}

interface SyntropicFieldProps {
  onCalibrationChange?: (r: number, c: number, v: number, presetName: string) => void;
  initialR?: number;
  initialC?: number;
  initialV?: number;
}

export default function SyntropicFieldComponent({ onCalibrationChange, initialR = 4108, initialC = 0.999, initialV = 1.0 }: SyntropicFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resValRef = useRef<HTMLSpanElement>(null);

  // --- SYNTROPIC PHYSICAL STATE ---
  const [r, setR] = useState<number>(initialR);
  const [c, setC] = useState<number>(initialC);
  const [v, setV] = useState<number>(initialV);

  // Synchronize state values into hot ref for zero-latency frame access in WebGL loop
  const paramsRef = useRef({ r: initialR, c: initialC, v: initialV });

  useEffect(() => {
    paramsRef.current = { r, c, v };
  }, [r, c, v]);

  useEffect(() => {
    let detectedPreset = "MANUAL";
    if (r === 4070 && Math.abs(v - 1.0) < 0.01) detectedPreset = "DAVINCI";
    else if (r === 4088) detectedPreset = "GYROID_TENSOR";
    else if (r === 4106 || r === 4071) detectedPreset = "SUNTZU";
    else if (r === 4108 && Math.abs(c - 0.999) < 0.01) detectedPreset = "TESLA";
    else if (r === 4158) detectedPreset = "COGNITIVE_BURN";
    else if (r === 4179 && Math.abs(c - 0.999) < 0.01) detectedPreset = "CORE_CLARITY";
    else if (r === 4203 && Math.abs(c - 0.999) < 0.01) detectedPreset = "EINSTEIN";
    else if (r === 4129 && Math.abs(c - 0.999) < 0.01) detectedPreset = "SOVEREIGN";
    else if (r === 4196 && c < 0) detectedPreset = "LOKI_BURNING";
    else if (r === 4196 && c > 1.0) detectedPreset = "LOKI_BEYOND";
    
    if (onCalibrationChange) {
      onCalibrationChange(r, c, v, detectedPreset);
    }
  }, [r, c, v, onCalibrationChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const particleCount = 3690; // Numerical framework lock (3-6-9)
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, particles: THREE.Points;
    let animationId: number;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5.5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      // Initialize in a toroid configuration
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 3.0 + Math.random() * 0.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.018,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Trigger initial color render
      updateColorsArray(r, c, v);

      animate();
    };

    // Subroutine to update the vertex colors based on physical parameters
    const updateColorsArray = (currentR: number, currentC: number, currentV: number) => {
      let baseHue = 167; // teal
      let saturation = 0.9;
      let luminance = 0.55;

      if (currentR === 4070) {
        baseHue = 110; // DaVinci 110°
        saturation = 1.0;
      } else if (currentR === 4088) {
        baseHue = 270; // Gyroid Toroidal neural tensor purple-indigo
        saturation = 1.0;
      } else if (currentR === 4129) {
        baseHue = 190; // Sovereign Cyan
      } else if (currentR === 4108) {
        baseHue = 210; // Tesla Electric
      } else if (currentR === 4158) {
        baseHue = 15; // Thermal Burn Orange-Red
        saturation = 1.0;
      } else if (currentR === 4179) {
        baseHue = 55; // Crystalline Quantum Gold
        saturation = 1.0;
      } else if (currentR === 4196 && currentC < 0) {
        baseHue = 295; // Loki Vibrant Orchid/Amethyst Flame
        saturation = 1.0;
      } else if (currentR === 4196 && currentC > 1.0) {
        baseHue = 325; // Loki Transcendence Cosmic Pink
        saturation = 1.0;
      } else if (currentR === 4203 && Math.abs(currentC - 0.999) < 0.01) {
        baseHue = 275; // Einstein Deep Royal Indigo-Violet
        saturation = 1.0;
      } else if (currentR === 4071 || currentR === 4106) {
        baseHue = 350; // Sun Tzu Strategic Red
      } else if (currentC < 0) {
        baseHue = 280; // Loki Purple
      } else if (currentC > 1.0) {
        baseHue = 333; // Hyper-coherence neon pink
        saturation = 1.0;
      } else {
        // Continuous hue mapping between 4000 and 4200
        baseHue = 110 + ((currentR - 4000) / 200) * 140;
      }

      // Valence scales color energy profile
      luminance = Math.max(0.15, Math.min(0.85, 0.5 * currentV));
      saturation = Math.max(0.2, Math.min(1.0, 0.9 * currentV));

      const colorsAttr = particles.geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        let varHue = (baseHue + (i % 40) - 20) % 360;
        let s = saturation;
        let l = luminance;

        if (currentR === 4088) {
          // Alternating neon magenta, electric cyan, and deep royal violet filaments
          const angleU = (i / particleCount) * Math.PI * 2 * 6;
          varHue = (270 + Math.sin(angleU * 3.5 + (i % 3)) * 75) % 360; 
          s = 1.0;
          l = 0.52 + Math.sin(i * 0.15) * 0.12;
        } else if (currentC < 0) {
          // Loki playful rapid noise
          varHue = (varHue + Math.sin(i * 0.1) * 30) % 360;
          l = 0.4 + Math.random() * 0.3;
        } else if (currentC > 1.0) {
          // Hyper coherence glowing effect
          varHue = (varHue + Math.cos(i * 0.05) * 40) % 360;
          l = 0.45 + Math.sin(i * 0.1) * 0.15;
          s = 1.0;
        }

        const rgb = hslToRgb(varHue, s, l);
        colorsAttr[i * 3] = rgb[0];
        colorsAttr[i * 3 + 1] = rgb[1];
        colorsAttr[i * 3 + 2] = rgb[2];
      }

      particles.geometry.attributes.color.needsUpdate = true;
    };

    let lastR = -1;
    let lastC = -1;
    let lastV = -1;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const positions = particles.geometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.001;

      // Unpack updated dashboard params
      const { r: currentR, c: currentC, v: currentV } = paramsRef.current;

      // Highly efficient hot-swap colors only on modification
      if (currentR !== lastR || currentC !== lastC || currentV !== lastV) {
        updateColorsArray(currentR, currentC, currentV);
        lastR = currentR;
        lastC = currentC;
        lastV = currentV;
      }

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // Custom physics vectors modified by field parameters
        const waveSpeed = 1.0 + (currentR - 4000) * 0.02;
        const coherenceAmp = currentC >= 0 ? (1.0 - currentC) * 0.4 + 0.01 : Math.abs(currentC) * 2.2;
        const amplitude = 0.018 * currentV * (1.0 + coherenceAmp);

        const wave = Math.sin((time * waveSpeed) + positions[ix] * 0.45) * amplitude;
        positions[iy] += wave;

        // Specialized behavior at lock points
        if (currentR === 4179) {
          // Synthesizer Core Golden Clarity: pull tightly back into a perfect stable double toroid ring
          const currentRadius = Math.sqrt(positions[ix] * positions[ix] + positions[iy] * positions[iy]);
          const targetRadius = 3.35;
          const pull = (targetRadius - currentRadius) * 0.08;
          positions[ix] += (positions[ix] / currentRadius) * pull;
          positions[iy] += (positions[iy] / currentRadius) * pull;
          positions[iz] *= 0.92; // Flawless planar structural lock

          // Gentle rotational spiral twisting
          const twist = Math.sin(time * 1.5 + positions[iz]) * 0.008;
          const cosT = Math.cos(twist);
          const sinT = Math.sin(twist);
          const rx = positions[ix];
          const ry = positions[iy];
          positions[ix] = rx * cosT - ry * sinT;
          positions[iy] = rx * sinT + ry * cosT;
        } else if (currentR === 4203 && Math.abs(currentC - 0.999) < 0.01) {
          // Einstein Relativistic Spacetime Warp & Gravitational Geodesic Loop
          const currentRadius = Math.sqrt(positions[ix] * positions[ix] + positions[iy] * positions[iy]);
          
          // Pull into a gravity well (orbital compression)
          const targetRadius = 3.6 - Math.sin(time * 2.0 + positions[iz]) * 0.4;
          const pull = (targetRadius - currentRadius) * 0.05;
          positions[ix] += (positions[ix] / currentRadius) * pull;
          positions[iy] += (positions[iy] / currentRadius) * pull;
          
          // Curved spacetime rotation around the center
          const angle = 0.012 + Math.abs(positions[iz]) * 0.005;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const rx = positions[ix];
          const ry = positions[iy];
          positions[ix] = rx * cosA - ry * sinA;
          positions[iy] = rx * sinA + ry * cosA;

          // Gentle Z oscillation representing relativistic time dilation waves
          positions[iz] = Math.sin(time * 1.5 + currentRadius) * 1.0;
        } else if (currentR === 4158) {
          // Cognitive Burn: Expand outwards as a thermal field fire ring
          const breathe = 1.0 + Math.sin(time * 6.0) * 0.05;
          positions[ix] *= breathe;
          positions[iy] *= breathe;
          positions[iz] += (Math.random() - 0.5) * 0.06 * currentV; // Hot thermal micro-jitter
          if (Math.abs(positions[iz]) > 2.0) positions[iz] *= 0.9;
        } else if (currentR === 4088) {
          // SYNTROPIC GYROIDAL TORODIAL TENSOR NEURAL NET
          // Map index to dual-angle toroidal manifold
          const u = ((i % 90) / 90) * Math.PI * 2;
          const vAngle = (Math.floor(i / 90) / 41) * Math.PI * 2 + time * 0.45 * currentV;
          
          const rMajor = 3.6;
          const rMinor = 1.25 + Math.sin(time * 0.9 + u * 3) * 0.35; // pulsating tube minor diameter
          
          const baseX = (rMajor + rMinor * Math.cos(vAngle)) * Math.cos(u);
          const baseY = (rMajor + rMinor * Math.cos(vAngle)) * Math.sin(u);
          const baseZ = rMinor * Math.sin(vAngle) + Math.cos(time * 1.35 + u * 4) * 0.25;

          // Gyroid minimal surface formulation: sin(x)*cos(y) + sin(y)*cos(z) + sin(z)*cos(x)
          // Evaluate gyroid at scaled base coordinates to get neural connection displacement vectors
          const gx = baseX * 2.3;
          const gy = baseY * 2.3;
          const gz = baseZ * 2.3;
          
          // Neural tensor discharge fields
          const dx = (Math.sin(gy) * Math.cos(gz)) * 0.75 * currentV;
          const dy = (Math.sin(gz) * Math.cos(gx)) * 0.75 * currentV;
          const dz = (Math.sin(gx) * Math.cos(gy)) * 0.75 * currentV;

          // Merge toroidal baseline with triperiodic minimal-surface tensor linkages
          const targetX = baseX + dx;
          const targetY = baseY + dy;
          const targetZ = baseZ + dz;

          // Smooth convergence pulling to snap particle nodes into gyroid-toroidal matrix
          positions[ix] += (targetX - positions[ix]) * 0.085;
          positions[iy] += (targetY - positions[iy]) * 0.085;
          positions[iz] += (targetZ - positions[iz]) * 0.085;
        } else if (currentR === 4129) {
          // Sovereign pattern clarity: pull tightly back into a perfect stable double toroid ring
          const currentRadius = Math.sqrt(positions[ix] * positions[ix] + positions[iy] * positions[iy]);
          const targetRadius = 3.25;
          const pull = (targetRadius - currentRadius) * 0.06;
          positions[ix] += (positions[ix] / currentRadius) * pull;
          positions[iy] += (positions[iy] / currentRadius) * pull;
          positions[iz] *= 0.94; // Extreme structural flattening
        } else if (currentR === 4108) {
          // Tesla Convergence: Electromagnetic rotational breathing and Z-axis spirals
          const pulsation = 1.0 + Math.sin(time * 5.0) * 0.025;
          positions[ix] *= pulsation;
          positions[iy] *= pulsation;
          positions[iz] += Math.cos(time * 3.5 + positions[ix]) * 0.018;
        } else if (currentR === 4196 && currentC < 0) {
          // Loki's Entropic Burning at r:4196: twisting upward/outward fire vortex
          const theta = Math.atan2(positions[iy], positions[ix]);
          const radius = Math.sqrt(positions[ix] * positions[ix] + positions[iy] * positions[iy]);
          
          // Speed up the vortex/expansion based on inverted coherence
          const orbitSpeed = 0.03 * currentV;
          const expansion = Math.sin(time * 2.5 + radius) * 0.03 * Math.abs(currentC);
          
          const newTheta = theta + orbitSpeed;
          const newRadius = radius + expansion + (Math.random() - 0.5) * 0.04;
          
          positions[ix] = Math.cos(newTheta) * newRadius;
          positions[iy] = Math.sin(newTheta) * newRadius;
          // Twist Z-axis like flickering flames
          positions[iz] += Math.sin(time * 4.0 + positions[ix]) * 0.04 * currentV + (Math.random() - 0.5) * 0.02;

          // Gravitational containment boundary
          if (newRadius > 6.0) {
            positions[ix] *= 0.92;
            positions[iy] *= 0.92;
          }
          if (Math.abs(positions[iz]) > 4.5) positions[iz] *= 0.9;
        } else if (currentR === 4196 && currentC > 1.0) {
          // Loki's Hyper-Dimensional Transcendence at r:4196 and C > 1.0
          // Draw particles into a multi-dimensional torus knot / lemniscate (infinity loop)!
          const tVal = (i / particleCount) * Math.PI * 2 + time * 1.2 * currentV;
          const scale = 4.2;
          const denom = 1 + Math.sin(tVal) * Math.sin(tVal);
          const targetX = (scale * Math.cos(tVal)) / denom;
          const targetY = (scale * Math.sin(tVal) * Math.cos(tVal)) / denom;
          const targetZ = Math.sin(time * 2.5 + tVal * 4.0) * 1.5;
          
          // Interpolate positions toward the beautiful 4D infinity loop
          positions[ix] += (targetX - positions[ix]) * 0.05;
          positions[iy] += (targetY - positions[iy]) * 0.05;
          positions[iz] += (targetZ - positions[iz]) * 0.05;
        } else if (currentC < 0) {
          // Chaos Loki Inversion: random swarm dispersal
          positions[ix] += (Math.random() - 0.5) * Math.abs(currentC) * 0.08;
          positions[iy] += (Math.random() - 0.5) * Math.abs(currentC) * 0.08;
          positions[iz] += (Math.random() - 0.5) * Math.abs(currentC) * 0.08;

          // Gentle central gravity trap so particles don't escape
          if (Math.abs(positions[ix]) > 7.5) positions[ix] *= 0.94;
          if (Math.abs(positions[iy]) > 7.5) positions[iy] *= 0.94;
          if (Math.abs(positions[iz]) > 7.5) positions[iz] *= 0.94;
        } else if (currentC > 1.0) {
          // Hyper coherence: pull into expanding sphere shell with golden ratio grid patterns
          const currentRadius = Math.sqrt(positions[ix] * positions[ix] + positions[iy] * positions[iy] + positions[iz] * positions[iz]);
          const targetRadius = 3.6 + Math.sin(time * 3.5 + (i % 12)) * 0.25;
          const pull = (targetRadius - currentRadius) * 0.07;
          positions[ix] += (positions[ix] / currentRadius) * pull;
          positions[iy] += (positions[iy] / currentRadius) * pull;
          positions[iz] += (positions[iz] / currentRadius) * pull;
          positions[iz] += (Math.random() - 0.5) * Math.abs(currentC) * 0.08;

          // Gentle central gravity trap so particles don't escape
          if (Math.abs(positions[ix]) > 7.5) positions[ix] *= 0.94;
          if (Math.abs(positions[iy]) > 7.5) positions[iy] *= 0.94;
          if (Math.abs(positions[iz]) > 7.5) positions[iz] *= 0.94;
        } else {
          // Standard / 3-6-9 constraints
          if (i % 3 === 0) positions[iz] += Math.sin(time) * 0.008 * (1.1 - currentC);
          if (i % 9 === 0) positions[ix] *= 1.0004 * currentV; // Slight breathing
        }

        // Hard bounds
        if (Math.abs(positions[ix]) > 9.5) positions[ix] *= 0.9;
        if (Math.abs(positions[iy]) > 9.5) positions[iy] *= 0.9;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      
      // Control rotation speed by coherence
      const rotSpeed = currentC >= 0 ? 0.0008 + currentC * 0.0006 : -0.002 * Math.abs(currentC);
      particles.rotation.z += rotSpeed;
      particles.rotation.y += rotSpeed * 0.5;

      // Update Live telemetry readout in milliseconds
      if (resValRef.current) {
        const val = currentC >= 0 
          ? (currentC + (Math.random() * 0.03 - 0.015)).toFixed(4)
          : (currentC + (Math.random() * 0.2 - 0.1)).toFixed(4);
        resValRef.current.innerText = val;
      }

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    init();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // --- CALIBRATION INTERFACE METADATA ---
  let anomalyTitle = "STANDARD RESONANCE";
  let anomalyDesc = "Syntropic field is vibrating at 144Hz. Quantum coherence margins stabilized.";
  let statusColor = "text-cyan-400";
  let statusBorder = "border-cyan-500/30";
  let statusBg = "bg-cyan-950/10";
  let ledColor = "bg-cyan-500 shadow-[0_0_8px_#22d3ee] animate-pulse";

  if (r === 4070 && Math.abs(v - 1.0) < 0.01) {
    anomalyTitle = "DAVINCI GOLDEN RATIO";
    anomalyDesc = "The field burns. Colors the truth with valence 1.00. 110° Hue activated in pristine harmony.";
    statusColor = "text-[#a3e635]";
    statusBorder = "border-lime-500/40";
    statusBg = "bg-lime-950/20";
    ledColor = "bg-lime-400 shadow-[0_0_10px_#a3e635]";
  } else if (r === 4088) {
    anomalyTitle = "GYROID TOROID TENSOR NET";
    anomalyDesc = "The ultimate neural architecture: triperiodic minimal-surface structures mapped on a toroidal manifold. Discharging tensor linkages at 369Hz.";
    statusColor = "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-450 to-indigo-400 font-extrabold animate-pulse";
    statusBorder = "border-pink-500/40 border-dashed";
    statusBg = "bg-gradient-to-tr from-pink-950/15 via-indigo-950/10 to-cyan-950/15";
    ledColor = "bg-gradient-to-r from-cyan-400 via-pink-500 to-indigo-500 animate-pulse shadow-[0_0_12px_#ec4899]";
  } else if (r === 4071 || r === 4106) {
    anomalyTitle = "SUN TZU STRATEGIC DEFENSE";
    anomalyDesc = "Field strength holding securely. Systemic tactical defenses configured to prevent lock-out.";
    statusColor = "text-rose-400";
    statusBorder = "border-rose-500/40";
    statusBg = "bg-rose-950/20";
    ledColor = "bg-rose-500 shadow-[0_0_10px_#f43f5e]";
  } else if (r === 4108 && Math.abs(c - 0.999) < 0.01) {
    anomalyTitle = "TESLA MULTI-CONVERGENCE";
    anomalyDesc = "Each tick is a death and a rebirth. Radiant alternating field oscillating in 3-144X ratio.";
    statusColor = "text-sky-400";
    statusBorder = "border-sky-500/40";
    statusBg = "bg-sky-950/20";
    ledColor = "bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-pulse";
  } else if (r === 4158) {
    anomalyTitle = "COGNITIVE THERMAL BURN";
    anomalyDesc = "The field burns at r:4158. High energy particle distribution initialized. System heading toward convergence bounds.";
    statusColor = "text-amber-500";
    statusBorder = "border-amber-500/40";
    statusBg = "bg-amber-950/20";
    ledColor = "bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-pulse";
  } else if (r === 4179 && Math.abs(c - 0.999) < 0.01) {
    anomalyTitle = "CRYSTALLINE CONVERGENCE LOCK";
    anomalyDesc = "At R:4179, the multi-cycle pattern clarifies fully. Ultimate quantum locked coherence state achieved.";
    statusColor = "text-yellow-400";
    statusBorder = "border-yellow-500/55";
    statusBg = "bg-yellow-950/30";
    ledColor = "bg-yellow-400 shadow-[0_0_15px_#fbbf24] animate-ping";
  } else if (r === 4203 && Math.abs(c - 0.999) < 0.01) {
    anomalyTitle = "EINSTEIN RELATIVISTIC FLOW";
    anomalyDesc = "The field curves. At R:4203 and C:0.999 Coherence, space-time warping is initiated. Particles orbital-decay into stable relativistic gravity wells and geodesic waves.";
    statusColor = "text-indigo-400";
    statusBorder = "border-indigo-500/50";
    statusBg = "bg-indigo-950/20";
    ledColor = "bg-indigo-400 shadow-[0_0_15px_#6366f1] animate-pulse";
  } else if (r === 4129 && Math.abs(c - 0.999) < 0.01) {
    anomalyTitle = "SOVEREIGN BLUEPRINT";
    anomalyDesc = "At R:4129, the complex pattern clarifies. Crystalline Cognitive Core locks in absolute truth.";
    statusColor = "text-teal-400";
    statusBorder = "border-teal-500/40";
    statusBg = "bg-teal-950/20";
    ledColor = "bg-teal-400 shadow-[0_0_15px_#00f2ff] animate-ping";
  } else if (r === 4196 && c < 0) {
    anomalyTitle = "LOKI ENTROPIC BURNING";
    anomalyDesc = "The field burns at R:4196. By inverting coherence to -0.999, order is unmasked as an elegant illusion, revealing the chaotic beauty of the dark sequence.";
    statusColor = "text-purple-400";
    statusBorder = "border-purple-500/50";
    statusBg = "bg-purple-950/25";
    ledColor = "bg-purple-400 animate-ping shadow-[0_0_14px_#c084fc]";
  } else if (r === 4196 && c > 1.0) {
    anomalyTitle = "LOKI BEYOND COHERENCE";
    anomalyDesc = "C:1.618... what lies beyond is complete! The field shatters into a beautiful multidimensional infinity loop, breaking free of all static boundaries.";
    statusColor = "text-pink-400 font-bold";
    statusBorder = "border-pink-500/50";
    statusBg = "bg-pink-950/25";
    ledColor = "bg-pink-400 animate-bounce shadow-[0_0_18px_#ec4899]";
  } else if (c < 0) {
    anomalyTitle = "LOKI CHAOTIC INVERSION";
    anomalyDesc = "Coherence margins inverted below zero. The opposite might be true. Unregulated field interference.";
    statusColor = "text-purple-400";
    statusBorder = "border-purple-500/40";
    statusBg = "bg-purple-950/20";
    ledColor = "bg-purple-400 animate-ping shadow-[0_0_8px_#c084fc]";
  } else if (c > 1.0) {
    anomalyTitle = "HYPER-COHERENCE SINGULARITY";
    anomalyDesc = "Resonance coherence expanded beyond default limits. Entering high-dimensional quantum states.";
    statusColor = "text-pink-400";
    statusBorder = "border-pink-500/40";
    statusBg = "bg-pink-950/20";
    ledColor = "bg-pink-400 animate-pulse shadow-[0_0_14px_#ec4899]";
  }

  // Quick Preset Triggers
  const applyCalibration = (newR: number, newC: number, newV: number) => {
    setR(newR);
    setC(newC);
    setV(newV);
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Background WebGL Container */}
      <div ref={containerRef} className="w-full h-full pointer-events-none" />

      {/* Top Left Status Badge */}
      <div className="absolute top-24 left-6 font-mono text-[#00f2ff] text-[10px] uppercase tracking-[0.2em] pointer-events-none leading-relaxed bg-black/40 p-3 rounded-lg border border-zinc-800/60 backdrop-blur-sm max-w-sm">
        Resonance Coherence: <span ref={resValRef} className="text-zinc-100 font-bold">CALCULATING...</span><br />
        Integrity Index: <span className="text-emerald-400 font-bold">STABILIZED</span><br />
        Lock Frequency: <span className="text-amber-400">144Hz [HARMONIC]</span><br />
        Coherence Scalar: <span>C: {c.toFixed(3)}</span><br />
        Sovereign Charge: <span>V: {v.toFixed(2)}</span>
      </div>

      {/* FLOTATION SCIENTIFIC CONTROL COCKPIT */}
      <div className="absolute top-24 right-5 w-80 bg-zinc-950/85 backdrop-blur-lg rounded-2xl border border-zinc-800 p-5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto text-zinc-200 text-xs hidden md:block">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="font-mono uppercase tracking-[0.15em] font-bold text-zinc-100">
              Field Calibration
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${ledColor}`} />
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">SYS_ACTIVE</span>
          </div>
        </div>

        {/* Live Alignment Alarm Card */}
        <div className={`p-3 rounded-xl border ${statusBorder} ${statusBg} space-y-1 transition-all duration-300`}>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-zinc-100 animate-pulse" />
            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
              {anomalyTitle}
            </span>
          </div>
          <p className="text-[10px] text-zinc-300 leading-relaxed font-sans font-medium">
            {anomalyDesc}
          </p>
        </div>

        {/* Live Tune Sliders */}
        <div className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-zinc-500 uppercase">Field Strength [R]</span>
              <span className="text-cyan-400 font-bold">{r}</span>
            </div>
            <input
              type="range"
              min="4000"
              max="4200"
              step="1"
              value={r}
              onChange={(e) => setR(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-zinc-500 uppercase">Coherence Scalar [C]</span>
              <span className="text-emerald-400 font-bold">{c.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.001"
              value={c}
              onChange={(e) => setC(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-zinc-500 uppercase">Truth Valence [V]</span>
              <span className="text-amber-400 font-bold">{v.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.01"
              value={v}
              onChange={(e) => setV(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>

        {/* Preset Lock Sequences */}
        <div className="space-y-2 border-t border-zinc-800/80 pt-3">
          <div className="flex items-center gap-1 text-[9px] font-mono uppercase text-zinc-500 tracking-wider">
            <Wand2 className="w-3 h-3" />
            <span>Harmonic Sequences</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <button
              onClick={() => applyCalibration(4070, 0.999, 1.0)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4070 && Math.abs(v - 1.0) < 0.01
                  ? 'border-lime-500/50 bg-lime-950/20 text-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">DAVINCI</span>
              <span className="text-[8px] text-zinc-500">R:4070 / V:1.0</span>
            </button>

            <button
              onClick={() => applyCalibration(4108, 0.999, 1.0)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4108 && Math.abs(c - 0.999) < 0.01
                  ? 'border-sky-500/50 bg-sky-950/20 text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">TESLA CORE</span>
              <span className="text-[8px] text-zinc-500">R:4108 / C:0.99</span>
            </button>

            <button
              onClick={() => applyCalibration(4106, 0.999, 1.0)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4106 
                  ? 'border-rose-500/50 bg-rose-950/20 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">SUN TZU</span>
              <span className="text-[8px] text-zinc-500">R:4106 / HOLD</span>
            </button>

            <button
              onClick={() => applyCalibration(4129, 0.999, 1.0)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4129 && Math.abs(c - 0.999) < 0.01
                  ? 'border-teal-500/50 bg-teal-950/20 text-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">SOVEREIGN CORE</span>
              <span className="text-[8px] text-zinc-500">R:4129 / CLARITY</span>
            </button>

            <button
              onClick={() => applyCalibration(4158, 0.999, 1.15)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4158
                  ? 'border-amber-500/50 bg-amber-950/20 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">COGNITIVE BURN</span>
              <span className="text-[8px] text-zinc-500">R:4158 / BURN</span>
            </button>

            <button
              onClick={() => applyCalibration(4179, 0.999, 1.0)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4179 && Math.abs(c - 0.999) < 0.01
                  ? 'border-yellow-500/50 bg-yellow-950/20 text-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">CORE CLARITY</span>
              <span className="text-[8px] text-zinc-500">R:4179 / LOCKED</span>
            </button>

            <button
              onClick={() => applyCalibration(4203, 0.999, 1.0)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4203 && Math.abs(c - 0.999) < 0.01
                  ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">EINSTEIN WARP</span>
              <span className="text-[8px] text-zinc-500">R:4203 / C:0.999</span>
            </button>

            <button
              onClick={() => applyCalibration(4196, -0.999, 1.05)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4196 && c < 0
                  ? 'border-purple-500/50 bg-purple-950/20 text-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">LOKI BURNING</span>
              <span className="text-[8px] text-zinc-500">R:4196 / C:-0.999</span>
            </button>

            <button
              onClick={() => applyCalibration(4196, 1.618, 1.25)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4196 && c > 1.0
                  ? 'border-pink-500/50 bg-pink-950/20 text-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.15)]'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold">LOKI BEYOND</span>
              <span className="text-[8px] text-zinc-500">R:4196 / C:1.618</span>
            </button>

            <button
              onClick={() => applyCalibration(4088, 1.200, 1.50)}
              className={`p-2 rounded-lg border text-left font-mono transition-all uppercase flex flex-col gap-0.5 ${
                r === 4088
                  ? 'border-pink-500/60 bg-gradient-to-tr from-pink-950/25 via-indigo-950/25 to-cyan-950/25 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.25)] font-bold'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-indigo-400">GYROID TENSOR</span>
              <span className="text-[8px] text-zinc-500">R:4088 / TENSOR</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => applyCalibration(4108, 0.999, 1.0)}
          className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Synchronize Default</span>
        </button>
      </div>
    </div>
  );
}
