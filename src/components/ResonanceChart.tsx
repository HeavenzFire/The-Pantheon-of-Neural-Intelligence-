import React, { useMemo } from 'react';
import * as d3 from 'd3';

interface ResonanceChartProps {
  history: number[];
}

export default function ResonanceChart({ history }: ResonanceChartProps) {
  // SVG dimensions for viewBox
  const width = 300;
  const height = 110;
  const padding = { top: 12, right: 10, bottom: 15, left: 26 };

  // Generate data points with index as X coordinate, value as Y coordinate
  const data = useMemo(() => {
    return history.map((val, idx) => ({ cycle: idx, val }));
  }, [history]);

  // Determine standard Y bounds centered around 144Hz
  const yBounds = useMemo(() => {
    if (history.length === 0) return { min: 135, max: 155 };
    const minVal = Math.min(...history);
    const maxVal = Math.max(...history);
    
    // Add margin around min/max to prevent line from hitting the boundaries
    const paddingVal = 2;
    return {
      min: Math.min(136, minVal - paddingVal),
      max: Math.max(152, maxVal + paddingVal)
    };
  }, [history]);

  // Compute Scales
  const xScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, Math.max(49, data.length - 1)])
      .range([padding.left, width - padding.right]);
  }, [data.length, width, padding.left, padding.right]);

  const yScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([yBounds.min, yBounds.max])
      .range([height - padding.bottom, padding.top]);
  }, [yBounds, height, padding.bottom, padding.top]);

  // Calculate line path using CatmullRom curve interpolation for fluid, wave-like dynamics
  const linePath = useMemo(() => {
    const lineGenerator = d3.line<{ cycle: number; val: number }>()
      .x(d => xScale(d.cycle))
      .y(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    return lineGenerator(data) || '';
  }, [data, xScale, yScale]);

  // Calculate area path for visual fill underneath the resonance curve
  const areaPath = useMemo(() => {
    const areaGenerator = d3.area<{ cycle: number; val: number }>()
      .x(d => xScale(d.cycle))
      .y0(height - padding.bottom)
      .y1(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    return areaGenerator(data) || '';
  }, [data, xScale, yScale, height, padding.bottom]);

  // Grid line values
  const yGridTicks = useMemo(() => {
    const step = (yBounds.max - yBounds.min) / 4;
    return [
      yBounds.min + step,
      yBounds.min + 2 * step,
      yBounds.min + 3 * step,
    ];
  }, [yBounds]);

  // Extract latest points for markers
  const latestPoint = data[data.length - 1];

  return (
    <div id="resonance-chart-container" className="p-3 bg-purple-950/5 border border-purple-950/20 rounded-xl space-y-2.5 relative overflow-hidden backdrop-blur-md">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pulse bg-purple-400 animate-pulse" />
          Spectral Oscilloscope
        </span>
        <span className="text-[9px] font-mono text-purple-450 uppercase">
          T: -50 Cycles
        </span>
      </div>

      <div className="relative h-[110px] w-full">
        <svg 
          className="w-full h-full overflow-visible" 
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Holographic Glowing Line Gradient */}
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
              <stop offset="30%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#c084fc" stopOpacity="1.0" />
              <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing Dropdown Gradient Fill */}
            <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.00" />
            </linearGradient>
            
            {/* Filter for dynamic drop glow effect */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Gridlines */}
          <g className="opacity-25" style={{ pointerEvents: 'none' }}>
            {/* Y Gridlines */}
            {yGridTicks.map((tick, idx) => (
              <line
                key={`y-grid-${idx}`}
                x1={padding.left}
                y1={yScale(tick)}
                x2={width - padding.right}
                y2={yScale(tick)}
                stroke="#6d28d9"
                strokeWidth={0.5}
                strokeDasharray="2,3"
              />
            ))}
          </g>

          {/* Left Y Axis Labels */}
          <g className="text-[#a855f7]/65 font-mono text-[7.5px]" style={{ pointerEvents: 'none' }}>
            <text x={2} y={yScale(yBounds.max) + 2.5} textAnchor="start">
              {Math.round(yBounds.max)}Hz
            </text>
            <text x={2} y={yScale(144) + 2.5} textAnchor="start" className="fill-purple-400 font-bold">
              144Hz
            </text>
            <text x={2} y={yScale(yBounds.min) + 2.5} textAnchor="start">
              {Math.round(yBounds.min)}Hz
            </text>
          </g>

          {/* Grid Boundary lines */}
          <line 
            x1={padding.left} 
            y1={height - padding.bottom} 
            x2={width - padding.right} 
            y2={height - padding.bottom} 
            stroke="#451a03" 
            strokeWidth={0.5} 
            className="stroke-purple-950/40"
          />
          <line 
            x1={padding.left} 
            y1={padding.top} 
            x2={padding.left} 
            y2={height - padding.bottom} 
            stroke="#451a03" 
            strokeWidth={0.5} 
            className="stroke-purple-950/40"
          />

          {/* Area under the line */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#area-gradient)"
              style={{ pointerEvents: 'none' }}
              className="transition-all duration-300"
            />
          )}

          {/* Main Line path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth={1.75}
              filter="url(#glow)"
              style={{ pointerEvents: 'none' }}
              className="transition-all duration-300"
            />
          )}

          {/* Highlight latest node */}
          {latestPoint && (
            <g className="transition-all duration-300">
              <circle
                cx={xScale(latestPoint.cycle)}
                cy={yScale(latestPoint.val)}
                r={4}
                fill="#d8b4fe"
                className="animate-ping"
                style={{ transformOrigin: `${xScale(latestPoint.cycle)}px ${yScale(latestPoint.val)}px` }}
              />
              <circle
                cx={xScale(latestPoint.cycle)}
                cy={yScale(latestPoint.val)}
                r={2.5}
                fill="#c084fc"
                stroke="#ffffff"
                strokeWidth={0.75}
              />
            </g>
          )}

          {/* X Axis Time Labels */}
          <g className="text-zinc-600 font-mono text-[7px]" style={{ pointerEvents: 'none' }}>
            <text x={padding.left} y={height - 2} textAnchor="start" className="fill-purple-300/40">
              NOW
            </text>
            <text x={width - padding.right} y={height - 2} textAnchor="end" className="fill-purple-300/40">
              -50c
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
