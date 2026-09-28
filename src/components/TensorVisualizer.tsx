import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { BalancedNonary } from '../types/balancedNonary';
import { BalancedNonaryLogic } from '../utils/balancedNonaryLogic';
import { 
  Box, 
  Layers, 
  Activity, 
  RefreshCw, 
  RotateCw, 
  Play, 
  Pause, 
  Sliders, 
  Sparkles, 
  BarChart3,
  Compass,
  Zap
} from 'lucide-react';

interface TensorVisualizerProps {
  initialTensor?: BalancedNonary[][][];
  size?: number;
  onCellClick?: (coords: [number, number, number], value: BalancedNonary) => void;
  className?: string;
}

// Color palette mapping for BalancedNonary {-4, ..., +4}
const NONARY_COLORS: Record<BalancedNonary, { hex: string; threeColor: THREE.Color; label: string }> = {
  [-4]: { hex: '#ef4444', threeColor: new THREE.Color(0xef4444), label: 'Max Negative (-4)' },
  [-3]: { hex: '#f97316', threeColor: new THREE.Color(0xf97316), label: 'High Negative (-3)' },
  [-2]: { hex: '#f59e0b', threeColor: new THREE.Color(0xf59e0b), label: 'Mid Negative (-2)' },
  [-1]: { hex: '#eab308', threeColor: new THREE.Color(0xeab308), label: 'Low Negative (-1)' },
  [0]:  { hex: '#06b6d4', threeColor: new THREE.Color(0x06b6d4), label: 'Zero-Point Fulcrum (0)' },
  [1]:  { hex: '#10b981', threeColor: new THREE.Color(0x10b981), label: 'Low Positive (+1)' },
  [2]:  { hex: '#3b82f6', threeColor: new THREE.Color(0x3b82f6), label: 'Mid Positive (+2)' },
  [3]:  { hex: '#8b5cf6', threeColor: new THREE.Color(0x8b5cf6), label: 'High Positive (+3)' },
  [4]:  { hex: '#ec4899', threeColor: new THREE.Color(0xec4899), label: 'Max Positive (+4)' },
};

export const TensorVisualizer: React.FC<TensorVisualizerProps> = ({
  initialTensor,
  size = 5,
  onCellClick,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [tensorSize, setTensorSize] = useState<number>(size);
  const [tensor, setTensor] = useState<BalancedNonary[][][]>(() => {
    if (initialTensor && initialTensor.length > 0) return initialTensor;
    return generateHarmonicTensor(size);
  });

  const [selectedCoord, setSelectedCoord] = useState<[number, number, number] | null>(null);
  const [hoveredCoord, setHoveredCoord] = useState<[number, number, number] | null>(null);
  const [sliceFilter, setSliceFilter] = useState<'all' | number>('all');
  const [valueFilter, setValueFilter] = useState<BalancedNonary | 'all'>('all');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'cubes' | 'spheres'>('cubes');
  const [wireframeOnly, setWireframeOnly] = useState<boolean>(false);
  const [cellScale, setCellScale] = useState<number>(0.75);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const interactiveMeshesRef = useRef<{ mesh: THREE.Mesh; coord: [number, number, number] }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Helper to generate a default harmonic tensor
  function generateHarmonicTensor(dim: number): BalancedNonary[][][] {
    const t: BalancedNonary[][][] = [];
    for (let i = 0; i < dim; i++) {
      t[i] = [];
      for (let j = 0; j < dim; j++) {
        t[i][j] = [];
        for (let k = 0; k < dim; k++) {
          // Centered radial wave pattern mapped to nonary range
          const dx = i - (dim - 1) / 2;
          const dy = j - (dim - 1) / 2;
          const dz = k - (dim - 1) / 2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const raw = Math.round(4 * Math.cos(dist * 1.5));
          const clamped = Math.max(-4, Math.min(4, raw)) as BalancedNonary;
          t[i][j][k] = clamped;
        }
      }
    }
    return t;
  }

  // Distribution calculations
  const distribution = useMemo(() => {
    const counts: Record<BalancedNonary, number> = {
      [-4]: 0, [-3]: 0, [-2]: 0, [-1]: 0, [0]: 0, [1]: 0, [2]: 0, [3]: 0, [4]: 0
    };
    let totalCells = 0;
    let sum = 0;

    const dim = tensor.length;
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < (tensor[i]?.length || 0); j++) {
        for (let k = 0; k < (tensor[i][j]?.length || 0); k++) {
          const val = tensor[i][j][k];
          if (val !== undefined && counts[val] !== undefined) {
            counts[val]++;
            sum += val;
            totalCells++;
          }
        }
      }
    }

    const mean = totalCells > 0 ? (sum / totalCells).toFixed(3) : '0.000';
    const zeroPointRatio = totalCells > 0 ? ((counts[0] / totalCells) * 100).toFixed(1) : '0.0';
    const positiveCount = counts[1] + counts[2] + counts[3] + counts[4];
    const negativeCount = counts[-4] + counts[-3] + counts[-2] + counts[-1];
    const balanceRatio = totalCells > 0 ? (((positiveCount - negativeCount) / totalCells) * 100).toFixed(1) : '0.0';

    return {
      counts,
      totalCells,
      mean,
      zeroPointRatio,
      positiveCount,
      negativeCount,
      balanceRatio,
    };
  }, [tensor]);

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(tensorSize * 2.5, tensorSize * 2.2, tensorSize * 3.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.8);
    dirLight2.position.set(-20, -20, -20);
    scene.add(dirLight2);

    // Root Group for rotation and centering
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // Grid Bounding Wireframe
    const boxSize = tensorSize * 1.5;
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const boundingBox = new THREE.Mesh(boxGeo, boxMat);
    rootGroup.add(boundingBox);

    // Raycaster for mouse picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectionCoord = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshesRef.current.map(m => m.mesh));
      if (intersects.length > 0) {
        const hit = interactiveMeshesRef.current.find(item => item.mesh === intersects[0].object);
        return hit ? hit.coord : null;
      }
      return null;
    };

    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        if (rootGroupRef.current) {
          rootGroupRef.current.rotation.y += deltaX * 0.008;
          rootGroupRef.current.rotation.x += deltaY * 0.008;
        }
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const hovered = getIntersectionCoord(e);
        setHoveredCoord(hovered);
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      const clicked = getIntersectionCoord(e);
      if (clicked) {
        setSelectedCoord(clicked);
        if (onCellClick) {
          const val = tensor[clicked[0]]?.[clicked[1]]?.[clicked[2]] ?? 0;
          onCellClick(clicked, val);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(tensorSize * 1.2, Math.min(tensorSize * 8, camera.position.z + e.deltaY * 0.01));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isRotating && !isDraggingRef.current && rootGroupRef.current) {
        rootGroupRef.current.rotation.y += dt * 0.25;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
    };
  }, [tensorSize]);

  // Re-build 3D Meshes whenever tensor, filter, displayMode, or scale changes
  useEffect(() => {
    const rootGroup = rootGroupRef.current;
    if (!rootGroup) return;

    // Clear old cell meshes from rootGroup (preserve the bounding box wireframe at index 0)
    while (rootGroup.children.length > 1) {
      const child = rootGroup.children[1];
      rootGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }
    interactiveMeshesRef.current = [];

    const dim = tensor.length;
    const spacing = 1.35;
    const offset = ((dim - 1) * spacing) / 2;

    const baseGeometry = displayMode === 'spheres'
      ? new THREE.SphereGeometry(cellScale * 0.5, 16, 16)
      : new THREE.BoxGeometry(cellScale, cellScale, cellScale);

    for (let i = 0; i < dim; i++) {
      if (sliceFilter !== 'all' && sliceFilter !== i) continue;

      for (let j = 0; j < (tensor[i]?.length || 0); j++) {
        for (let k = 0; k < (tensor[i][j]?.length || 0); k++) {
          const val = tensor[i][j][k];
          if (valueFilter !== 'all' && val !== valueFilter) continue;

          const colorInfo = NONARY_COLORS[val] || NONARY_COLORS[0];
          const isSelected = selectedCoord && selectedCoord[0] === i && selectedCoord[1] === j && selectedCoord[2] === k;
          const isHovered = hoveredCoord && hoveredCoord[0] === i && hoveredCoord[1] === j && hoveredCoord[2] === k;

          // Compute opacity based on zero-point or value
          const opacity = val === 0 ? 0.45 : 0.85 + Math.abs(val) * 0.03;

          const material = new THREE.MeshStandardMaterial({
            color: colorInfo.threeColor,
            emissive: isSelected ? new THREE.Color(0xffffff) : (isHovered ? colorInfo.threeColor : (val === 0 ? 0x06b6d4 : 0x000000)),
            emissiveIntensity: isSelected ? 0.8 : (isHovered ? 0.6 : (val === 0 ? 0.2 : 0.05)),
            roughness: 0.3,
            metalness: 0.2,
            transparent: true,
            opacity: isSelected ? 1.0 : opacity,
            wireframe: wireframeOnly,
          });

          const mesh = new THREE.Mesh(baseGeometry.clone(), material);
          mesh.position.set(
            i * spacing - offset,
            j * spacing - offset,
            k * spacing - offset
          );

          if (isSelected || isHovered) {
            mesh.scale.set(1.25, 1.25, 1.25);
          }

          rootGroup.add(mesh);
          interactiveMeshesRef.current.push({ mesh, coord: [i, j, k] });
        }
      }
    }
  }, [tensor, sliceFilter, valueFilter, selectedCoord, hoveredCoord, displayMode, wireframeOnly, cellScale]);

  // Simulation tick (harmonic flux wave perturbation)
  const stepTensorSimulation = useCallback(() => {
    setTensor(prev => {
      const dim = prev.length;
      const next: BalancedNonary[][][] = [];
      for (let i = 0; i < dim; i++) {
        next[i] = [];
        for (let j = 0; j < (prev[i]?.length || 0); j++) {
          next[i][j] = [];
          for (let k = 0; k < (prev[i][j]?.length || 0); k++) {
            const currentVal = prev[i][j][k];
            // Compute neighbor nonary influence
            let neighborSum = 0;
            let neighborCount = 0;
            const offsets = [-1, 1];
            for (const dx of offsets) {
              const ni = i + dx;
              if (ni >= 0 && ni < dim) {
                neighborSum += prev[ni][j][k];
                neighborCount++;
              }
            }
            const avg = neighborCount > 0 ? Math.round(neighborSum / neighborCount) : 0;
            const delta = Math.sign(avg - currentVal);
            const stepped = BalancedNonaryLogic.add(currentVal, delta as BalancedNonary);
            next[i][j][k] = stepped;
          }
        }
      }
      return next;
    });
  }, []);

  // Live simulation loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      stepTensorSimulation();
    }, 450);
    return () => clearInterval(interval);
  }, [isSimulating, stepTensorSimulation]);

  // Handlers for quick presets
  const handleResetZeroPoint = () => {
    const dim = tensorSize;
    const t: BalancedNonary[][][] = [];
    for (let i = 0; i < dim; i++) {
      t[i] = [];
      for (let j = 0; j < dim; j++) {
        t[i][j] = [];
        for (let k = 0; k < dim; k++) {
          t[i][j][k] = 0;
        }
      }
    }
    setTensor(t);
  };

  const handleRandomize = () => {
    const dim = tensorSize;
    const t: BalancedNonary[][][] = [];
    for (let i = 0; i < dim; i++) {
      t[i] = [];
      for (let j = 0; j < dim; j++) {
        t[i][j] = [];
        for (let k = 0; k < dim; k++) {
          const randVal = (Math.floor(Math.random() * 9) - 4) as BalancedNonary;
          t[i][j][k] = randVal;
        }
      }
    }
    setTensor(t);
  };

  const handleInjectVortexHarmonic = () => {
    setTensor(generateHarmonicTensor(tensorSize));
  };

  const selectedValue = selectedCoord ? tensor[selectedCoord[0]]?.[selectedCoord[1]]?.[selectedCoord[2]] : null;
  const hoveredValue = hoveredCoord ? tensor[hoveredCoord[0]]?.[hoveredCoord[1]]?.[hoveredCoord[2]] : null;

  return (
    <div className={`flex flex-col h-full bg-[#030712] border border-cyan-900/30 rounded-xl overflow-hidden font-mono text-zinc-100 ${className}`}>
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 px-4 bg-zinc-950/80 border-b border-cyan-500/20 backdrop-blur-md gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Box className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-1.5">
              3D BALANCED NONARY STATE TENSOR
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                {tensorSize}x{tensorSize}x{tensorSize} [N={tensorSize * tensorSize * tensorSize}]
              </span>
            </h2>
            <p className="text-[9px] text-zinc-500">
              Topological Manifold Density Real-Time Visualizer &#123;-4, ..., +4&#125;
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1 text-[10px] rounded border transition-all flex items-center gap-1.5 ${
              isRotating ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title="Toggle Continuous 3D Orbit"
          >
            <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'ORBIT_ON' : 'ORBIT_PAUSED'}</span>
          </button>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-2.5 py-1 text-[10px] rounded border transition-all flex items-center gap-1.5 ${
              isSimulating ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title="Toggle Live Nonary Wave Propagation"
          >
            {isSimulating ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-zinc-400" />}
            <span>{isSimulating ? 'FLUX_ACTIVE' : 'FLUX_IDLE'}</span>
          </button>

          <button
            onClick={stepTensorSimulation}
            disabled={isSimulating}
            className="px-2.5 py-1 text-[10px] rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/30 transition-all flex items-center gap-1 disabled:opacity-40"
            title="Step One Harmonic Wave Iteration"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>STEP</span>
          </button>

          <button
            onClick={handleInjectVortexHarmonic}
            className="px-2 py-1 text-[10px] rounded bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 transition-all flex items-center gap-1"
            title="Inject Radial Harmonic Waveform"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>VORTEX</span>
          </button>

          <button
            onClick={handleResetZeroPoint}
            className="px-2 py-1 text-[10px] rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1"
            title="Reset All Tensor Voxels to Zero-Point 0"
          >
            <RefreshCw className="w-3 h-3 text-zinc-400" />
            <span>ZERO-POINT</span>
          </button>

          <button
            onClick={handleRandomize}
            className="px-2 py-1 text-[10px] rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Perturb Tensor with Random Nonary States"
          >
            SHUFFLE
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* 3D WebGL Canvas Viewport */}
        <div className="flex-1 relative h-[360px] lg:h-auto min-h-[300px]" ref={mountRef}>
          {/* Viewport Overlay HUD */}
          <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 z-10">
            <div className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded border border-cyan-500/20 text-[10px] text-zinc-300 flex items-center gap-2">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>ORBIT: Left Drag | ZOOM: Mouse Wheel | SELECT: Left Click</span>
            </div>

            {(hoveredCoord || selectedCoord) && (
              <div className="bg-zinc-950/85 backdrop-blur-md p-2 rounded border border-cyan-500/30 text-[10px] animate-fadeIn">
                <span className="text-zinc-500 block uppercase text-[8px]">
                  {selectedCoord ? 'ACTIVE SELECTED VOXEL' : 'HOVERED VOXEL'}
                </span>
                <div className="flex items-center gap-2 text-cyan-300 font-bold mt-0.5">
                  <span>Coord: [{(selectedCoord || hoveredCoord)?.join(', ')}]</span>
                  <span className="text-zinc-400">|</span>
                  <span 
                    className="px-1.5 py-0.2 rounded text-[10px]"
                    style={{ 
                      backgroundColor: `${NONARY_COLORS[(selectedCoord ? selectedValue : hoveredValue) ?? 0].hex}20`,
                      color: NONARY_COLORS[(selectedCoord ? selectedValue : hoveredValue) ?? 0].hex,
                      border: `1px solid ${NONARY_COLORS[(selectedCoord ? selectedValue : hoveredValue) ?? 0].hex}50`
                    }}
                  >
                    Val: {(selectedCoord ? selectedValue : hoveredValue) ?? 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick HUD Overlay for Dimension Toggle & Geometry */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-black/75 backdrop-blur-md p-1.5 rounded-lg border border-zinc-800 text-[10px]">
            <span className="text-zinc-500 text-[9px] uppercase px-1">Grid Size:</span>
            {[3, 4, 5, 6].map(d => (
              <button
                key={d}
                onClick={() => {
                  setTensorSize(d);
                  setTensor(generateHarmonicTensor(d));
                  setSelectedCoord(null);
                }}
                className={`px-2 py-0.5 rounded text-[9px] transition-all ${
                  tensorSize === d ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {d}³
              </button>
            ))}

            <div className="w-[1px] h-3 bg-zinc-800 mx-1" />

            <button
              onClick={() => setDisplayMode(displayMode === 'cubes' ? 'spheres' : 'cubes')}
              className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[9px]"
            >
              {displayMode === 'cubes' ? 'VOXELS' : 'SPHERES'}
            </button>

            <button
              onClick={() => setWireframeOnly(!wireframeOnly)}
              className={`px-2 py-0.5 rounded border text-[9px] ${
                wireframeOnly ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              WIRE
            </button>
          </div>
        </div>

        {/* Right Telemetry & Nonary Distribution Panel */}
        <div className="w-full lg:w-80 bg-zinc-950/90 border-t lg:border-t-0 lg:border-l border-zinc-800/80 p-4 flex flex-col gap-4 overflow-y-auto max-h-[420px] lg:max-h-none">
          {/* Density & Balance Summary */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Manifold Metrics
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">144Hz LOCK</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-black/40 border border-zinc-800/60">
                <span className="text-zinc-500 text-[8px] block uppercase">Zero-Point Fulcrum</span>
                <span className="text-cyan-300 font-bold text-xs">{distribution.zeroPointRatio}%</span>
                <span className="text-[8px] text-zinc-500 block">({distribution.counts[0]} nodes)</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-zinc-800/60">
                <span className="text-zinc-500 text-[8px] block uppercase">Mean Polarization</span>
                <span className={`font-bold text-xs ${parseFloat(distribution.mean) > 0 ? 'text-emerald-400' : parseFloat(distribution.mean) < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {distribution.mean}
                </span>
                <span className="text-[8px] text-zinc-500 block">Syntropic Drift</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-zinc-800/60">
                <span className="text-zinc-500 text-[8px] block uppercase">Positive Valence</span>
                <span className="text-purple-400 font-bold text-xs">{distribution.positiveCount} nodes</span>
                <span className="text-[8px] text-zinc-500 block">States [+1 .. +4]</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-zinc-800/60">
                <span className="text-zinc-500 text-[8px] block uppercase">Negative Valence</span>
                <span className="text-rose-400 font-bold text-xs">{distribution.negativeCount} nodes</span>
                <span className="text-[8px] text-zinc-500 block">States [-4 .. -1]</span>
              </div>
            </div>
          </div>

          {/* Balanced Nonary Histogram / Distribution */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                [-4 ... +4] Distribution
              </span>
              {valueFilter !== 'all' && (
                <button
                  onClick={() => setValueFilter('all')}
                  className="text-[8px] text-cyan-400 hover:underline"
                >
                  CLEAR FILTER
                </button>
              )}
            </div>

            <div className="space-y-1.5 mt-1">
              {([-4, -3, -2, -1, 0, 1, 2, 3, 4] as BalancedNonary[]).map(val => {
                const count = distribution.counts[val];
                const pct = distribution.totalCells > 0 ? (count / distribution.totalCells) * 100 : 0;
                const isFiltered = valueFilter === val;
                const color = NONARY_COLORS[val].hex;

                return (
                  <div
                    key={val}
                    onClick={() => setValueFilter(valueFilter === val ? 'all' : val)}
                    className={`p-1 px-1.5 rounded cursor-pointer transition-all flex items-center gap-2 text-[9px] ${
                      isFiltered ? 'bg-zinc-800 border border-cyan-400/50' : 'hover:bg-zinc-900/80 border border-transparent'
                    }`}
                  >
                    <span 
                      className="w-5 text-right font-bold"
                      style={{ color }}
                    >
                      {val > 0 ? `+${val}` : val}
                    </span>

                    <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(pct, count > 0 ? 3 : 0)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>

                    <span className="w-7 text-right text-zinc-400 font-mono text-[8px]">
                      {count}
                    </span>
                    <span className="w-9 text-right text-zinc-500 font-mono text-[8px]">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slicing & Layer Filtering */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Planar Z-Slice Isolation
              </span>
              <span className="text-[9px] text-zinc-500">
                {sliceFilter === 'all' ? 'FULL 3D' : `LAYER Z=${sliceFilter}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSliceFilter('all')}
                className={`px-2 py-0.5 rounded text-[9px] ${
                  sliceFilter === 'all' ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                ALL
              </button>
              {Array.from({ length: tensorSize }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setSliceFilter(i)}
                  className={`px-2 py-0.5 rounded text-[9px] ${
                    sliceFilter === i ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Z={i}
                </button>
              ))}
            </div>

            {/* Scale slider */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/80">
              <Sliders className="w-3 h-3 text-zinc-500" />
              <span className="text-[9px] text-zinc-400">Scale:</span>
              <input
                type="range"
                min="0.3"
                max="1.1"
                step="0.05"
                value={cellScale}
                onChange={e => setCellScale(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-zinc-500 w-6 text-right">{cellScale.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TensorVisualizer;
