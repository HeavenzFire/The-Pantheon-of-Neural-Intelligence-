import React, { useEffect, useRef, useState } from 'react';
import {
  BalancedNonaryDigit,
  NonaryMatrix,
  RADIX_9_STATES,
  generate3x3NonaryTensor,
  computeNonaryTrace,
  computeMatrixSyntropyRatio,
} from '../lib/councilLoop';

interface VisualizerProps {
  resonanceIndex: number; // e.g., 1.2 to 5.0
  activeState?: BalancedNonaryDigit;
  tensorMatrix?: NonaryMatrix;
  width?: number;
  height?: number;
  showMatrixGrid?: boolean;
}

export const HarmonicVisualizer: React.FC<VisualizerProps> = ({
  resonanceIndex,
  activeState = 0,
  tensorMatrix,
  width = 600,
  height = 140,
  showMatrixGrid = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<BalancedNonaryDigit>(activeState);

  // Derive or generate live 3x3 tensor matrix
  const matrix: NonaryMatrix =
    tensorMatrix || generate3x3NonaryTensor(144 * resonanceIndex + selectedDigit * 37);
  const trace = computeNonaryTrace(matrix);
  const syntropy = computeMatrixSyntropyRatio(matrix);

  useEffect(() => {
    setSelectedDigit(activeState);
  }, [activeState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep cosmic space background
      ctx.fillStyle = '#080811';
      ctx.fillRect(0, 0, width, height);

      // Draw radix-9 background orbital lines
      const nonaryRanks: BalancedNonaryDigit[] = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
      const midY = height / 2;

      nonaryRanks.forEach((digit) => {
        const yOffset = (digit / 4) * (height * 0.38);
        const yPos = midY - yOffset;
        const stateConfig = RADIX_9_STATES[digit];
        const isSelected = digit === selectedDigit;

        // Orbit guideline
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? stateConfig.color : digit === 0 ? 'rgba(0, 255, 204, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isSelected ? 1.5 : digit === 0 ? 1 : 0.5;
        if (!isSelected && digit !== 0) {
          ctx.setLineDash([3, 5]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw carrier wave modulated by balanced nonary frequency multiplier
      const activeConfig = RADIX_9_STATES[selectedDigit] || RADIX_9_STATES[0];
      const freqMultiplier = activeConfig.frequencyMod;

      // Primary 144Hz carrier
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = activeConfig.color;
      ctx.shadowColor = activeConfig.color;
      ctx.shadowBlur = 8;

      const frequency = 0.018 * resonanceIndex * freqMultiplier;
      const amplitude = height * 0.28;

      for (let x = 0; x < width; x++) {
        const nonaryMod = Math.sin(x * 0.05 + phase * 0.2) * (selectedDigit * 2.5);
        const y =
          midY - (selectedDigit / 4) * (height * 0.15) +
          Math.sin(x * frequency + phase) * amplitude * Math.cos(phase * 0.3) +
          nonaryMod;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Secondary 369Hz golden ratio vortex wave
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';

      for (let x = 0; x < width; x++) {
        const y =
          midY +
          Math.cos(x * (frequency * 1.618) - phase * 1.33) * (amplitude * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.04 * resonanceIndex * freqMultiplier;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [resonanceIndex, selectedDigit, width, height]);

  const nonaryDigits: BalancedNonaryDigit[] = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  return (
    <div className="rounded-lg overflow-hidden border border-cyan-500/30 bg-black/90 p-3 shadow-xl space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-cyan-400 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider text-white">BALANCED NONARY MATRIX (RADIX-9)</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300">
            {selectedDigit > 0 ? `+${selectedDigit}` : selectedDigit}
          </span>
        </div>
        <div className="text-[11px] text-zinc-400">
          RESONANCE: <span className="text-cyan-300 font-bold">{resonanceIndex.toFixed(2)}ms</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto rounded border border-white/5 bg-[#080811]"
      />

      {/* Radix-9 State Selector Bar */}
      <div className="flex items-center justify-between gap-1 pt-1 overflow-x-auto">
        {nonaryDigits.map((digit) => {
          const cfg = RADIX_9_STATES[digit];
          const isSelected = digit === selectedDigit;
          return (
            <button
              key={digit}
              type="button"
              onClick={() => setSelectedDigit(digit)}
              className={`flex-1 py-1 px-1.5 text-[10px] font-mono rounded transition-all flex flex-col items-center ${
                isSelected
                  ? 'bg-white/15 border border-cyan-400 text-white shadow-sm'
                  : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
              title={cfg.label}
            >
              <span className="font-bold" style={{ color: cfg.color }}>
                {digit > 0 ? `+${digit}` : digit}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-[10px] font-mono text-zinc-400 text-center truncate pt-0.5">
        <span className="text-zinc-500">Vector State: </span>
        <span style={{ color: RADIX_9_STATES[selectedDigit].color }}>
          {RADIX_9_STATES[selectedDigit].label}
        </span>
      </div>

      {showMatrixGrid && (
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">3×3 Tensor Coupling:</span>
            <div className="inline-grid grid-cols-3 gap-1 bg-black/60 p-1.5 rounded border border-zinc-800">
              {matrix.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const cfg = RADIX_9_STATES[cell];
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded bg-zinc-900 border border-zinc-800"
                      style={{ color: cfg.color }}
                      title={`Cell [${rIdx},${cIdx}]: ${cell >= 0 ? '+' : ''}${cell}`}
                    >
                      {cell > 0 ? `+${cell}` : cell}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 text-right text-zinc-400">
            <div>
              <span className="text-zinc-500">Trace: </span>
              <span className="text-cyan-300 font-bold">{trace >= 0 ? `+${trace}` : trace}</span>
            </div>
            <div>
              <span className="text-zinc-500">Syntropy: </span>
              <span className="text-emerald-400 font-bold">{(syntropy * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

