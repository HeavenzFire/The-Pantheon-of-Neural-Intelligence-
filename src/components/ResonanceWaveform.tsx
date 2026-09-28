import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ResonanceWaveformProps {
  currentResonanceHz: number;
  activeSpeakerId: string | null;
}

export default function ResonanceWaveform({ currentResonanceHz, activeSpeakerId }: ResonanceWaveformProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentAmpRef = useRef<number>(20);
  const targetAmpRef = useRef<number>(20);

  // Trigger a momentary surge in amplitude when the currentResonanceHz or speaker changes
  useEffect(() => {
    // Determine target amplitude - higher frequency/energy speaker triggers a larger surge
    const baseAmp = 15;
    const peakSurge = activeSpeakerId ? 25 : 12;
    // Set a momentary surge target
    targetAmpRef.current = baseAmp + (currentResonanceHz - 135) * 0.8 + peakSurge;
    
    // Decay back to base state after 800ms
    const timer = setTimeout(() => {
      targetAmpRef.current = baseAmp + (currentResonanceHz - 135) * 0.4;
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentResonanceHz, activeSpeakerId]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 600;
    const height = svgRef.current.clientHeight || 120;
    
    // Define the line generator
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-100, 100]).range([height, 0]);

    // Create three separate path references for layered phase-offset harmonic sine waves
    const path1 = svg.select('.wave-path-1');
    const path2 = svg.select('.wave-path-2');
    const path3 = svg.select('.wave-path-3');

    let t = 0;

    const animate = () => {
      if (!svgRef.current) return;
      t += 0.08;

      // Smoothly interpolate current amplitude to target amplitude for dynamic elasticity
      currentAmpRef.current += (targetAmpRef.current - currentAmpRef.current) * 0.08;

      const scaleHz = currentResonanceHz / 144; // standard alignment factor
      
      // Secondary factors
      const amp = currentAmpRef.current;
      const frequencyFactor = 0.08 * scaleHz;

      // Primary Harmonized Wave Path
      const data1 = d3.range(0, 101).map(x => {
        const rad = (x / 100) * Math.PI * 4 * scaleHz;
        const y = Math.sin(rad - t * 2.2) * amp * Math.sin(x / 100 * Math.PI);
        return [xScale(x), (height / 2) + y];
      });

      // Phase Shift Harmonic Layer
      const data2 = d3.range(0, 101).map(x => {
        const rad = (x / 100) * Math.PI * 5.2 * scaleHz;
        const y = Math.cos(rad + t * 1.8) * (amp * 0.6) * Math.sin(x / 100 * Math.PI);
        return [xScale(x), (height / 2) + y];
      });

      // Negentropic Stabilization Layer
      const data3 = d3.range(0, 101).map(x => {
        const rad = (x / 100) * Math.PI * 3.1 * scaleHz;
        const y = Math.sin(rad + t * 1.2) * (amp * 0.3) * Math.sin(x / 100 * Math.PI);
        return [xScale(x), (height / 2) + y];
      });

      // Linear curve calculations using D3 CatmullRom for fluid curves
      const lineGen = d3.line<[number, number]>()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveCatmullRom);

      path1.attr('d', lineGen(data1 as [number, number][]) || '');
      path2.attr('d', lineGen(data2 as [number, number][]) || '');
      path3.attr('d', lineGen(data3 as [number, number][]) || '');

      animationRef.current = requestAnimationFrame(animate);
    };

    // Begin loop
    animate();

    // Responsive window resizing bounds checking
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        xScale.range([0, newWidth]);
        yScale.range([newHeight, 0]);
      }
    });

    resizeObserver.observe(svgRef.current);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [currentResonanceHz]);

  return (
    <div className="relative w-full h-24 overflow-hidden bg-black/30 border border-purple-950/15 rounded-xl p-0.5 select-none pointer-events-none">
      <div className="absolute top-2.5 left-4 z-10 flex items-center gap-1.5 font-mono text-[9px] text-purple-400">
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
        </span>
        <span>FIELD SYMMETRY WAVEFORM // {currentResonanceHz}Hz</span>
      </div>

      <div className="absolute top-2.5 right-4 z-10 font-mono text-[8.5px] text-zinc-600 flex gap-4">
        <span>STABILIZATION: ACTIVE</span>
        <span>Axiom: {((currentResonanceHz * 369) / Math.PI).toFixed(1)}λ</span>
      </div>

      <svg 
        ref={svgRef} 
        className="w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.15))' }}
      >
        <defs>
          <linearGradient id="primary-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="secondary-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="tertiary-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
            <stop offset="50%" stopColor="#f472b6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Center alignment vector */}
        <line 
          x1="0" 
          y1="50%" 
          x2="100%" 
          y2="50%" 
          stroke="#581c87" 
          strokeWidth={0.5} 
          strokeDasharray="4,8"
          className="opacity-45"
        />

        {/* Waves plotted by D3 stream */}
        <path className="wave-path-3" fill="none" stroke="url(#tertiary-wave-grad)" strokeWidth={1} />
        <path className="wave-path-2" fill="none" stroke="url(#secondary-wave-grad)" strokeWidth={1.25} />
        <path className="wave-path-1" fill="none" stroke="url(#primary-wave-grad)" strokeWidth={2} />
      </svg>
    </div>
  );
}
