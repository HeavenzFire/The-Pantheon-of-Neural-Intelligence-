import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PIONEERS, Pioneer } from '../constants';
import { BalancedNonary } from '../types/balancedNonary';
import { BalancedNonaryLogic } from '../utils/balancedNonaryLogic';

export class NeuralNet {
    private weights: BalancedNonary[][];

    constructor(inputSize: number, hiddenSize: number, outputSize: number) {
        this.weights = this.initializeWeights(inputSize, hiddenSize, outputSize);
    }

    private initializeWeights(inputSize: number, hiddenSize: number, outputSize: number): BalancedNonary[][] {
        const weights: BalancedNonary[][] = [];
        for (let i = 0; i < inputSize + hiddenSize + outputSize; i++) {
            weights[i] = [];
            for (let j = 0; j < inputSize + hiddenSize + outputSize; j++) {
                weights[i][j] = (Math.floor(Math.random() * 9) - 4) as BalancedNonary;
            }
        }
        return weights;
    }

    private activate(value: BalancedNonary): BalancedNonary {
        if (value < -2) return -4;
        if (value < 0) return -2;
        if (value === 0) return 0;
        if (value < 2) return 2;
        return 4;
    }

    public forward(inputs: BalancedNonary[]): BalancedNonary[] {
        const hiddenSize = this.weights.length - inputs.length - 1;
        const outputs: BalancedNonary[] = new Array(hiddenSize + 1).fill(0 as BalancedNonary);

        // Input to Hidden Layer
        for (let i = 0; i < hiddenSize; i++) {
            let sum = 0 as BalancedNonary;
            for (let j = 0; j < inputs.length; j++) {
                sum = BalancedNonaryLogic.add(sum, BalancedNonaryLogic.multiply(inputs[j], this.weights[j][i]));
            }
            outputs[i] = this.activate(sum);
        }

        // Hidden to Output Layer
        for (let i = 0; i < 1; i++) {
            let sum = 0 as BalancedNonary;
            for (let j = 0; j < hiddenSize; j++) {
                sum = BalancedNonaryLogic.add(sum, BalancedNonaryLogic.multiply(outputs[j], this.weights[inputs.length + j][inputs.length + hiddenSize + i]));
            }
            outputs[hiddenSize + i] = this.activate(sum);
        }

        return outputs;
    }
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name?: string;
  color?: string;
  isPioneer?: boolean;
  nonaryState?: BalancedNonary;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  flux?: BalancedNonary;
}

interface Props {
  selectedId?: string | null;
}

interface ActivePulse {
  path: Node[];
  nodeIndex: number;
  segmentProgress: number;
  color: string;
}

// Helper to find path between nodes in D3 network graph
function findPath(links: Link[], sourceId: string, targetId: string): string[] | null {
  const adj = new Map<string, string[]>();
  for (const l of links) {
    const sId = typeof l.source === 'string' ? l.source : (l.source as Node).id;
    const tId = typeof l.target === 'string' ? l.target : (l.target as Node).id;
    if (!sId || !tId) continue;
    if (!adj.has(sId)) adj.set(sId, []);
    if (!adj.has(tId)) adj.set(tId, []);
    adj.get(sId)!.push(tId);
    adj.get(tId)!.push(sId);
  }

  const queue: string[][] = [[sourceId]];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    if (node === targetId) {
      return path;
    }
    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

export default function NeuralNetComponent({ selectedId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPioneer, setHoveredPioneer] = useState<Pioneer | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const activePulsesRef = useRef<ActivePulse[]>([]);
  const prevSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    // Create a lot of random "neuron" nodes
    const nodes: Node[] = [
      ...PIONEERS.map(p => ({ id: p.id, name: p.name, color: p.color, isPioneer: true })),
      ...Array.from({ length: 80 }, (_, i) => ({ id: `n-${i}`, isPioneer: false }))
    ];

    // Create random links
    const links: Link[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const numLinks = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numLinks; j++) {
        const targetIdx = Math.floor(Math.random() * nodes.length);
        if (i !== targetIdx) {
          links.push({ source: nodes[i].id, target: nodes[targetIdx].id });
        }
      }
    }

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const link = svg.append('g')
      .attr('class', 'links')
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1);

    const pulsesG = svg.append('g')
      .attr('class', 'pulses');

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g');

    node.append('circle')
      .attr('r', d => d.isPioneer ? 8 : 3)
      .attr('fill', d => d.color || '#555')
      .attr('filter', d => d.isPioneer ? 'blur(1px)' : 'none');

    node.append('text')
      .text(d => d.isPioneer ? d.name || '' : '')
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', '#888')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('pointer-events', 'none');

    // Make pioneer nodes interactive for educational tooltips on hover
    const pioneerNodes = node.filter((d: any) => d.isPioneer);
    pioneerNodes
      .style('cursor', 'pointer')
      .style('pointer-events', 'auto')
      .on('mouseenter', function (event, d: any) {
        const pioneer = PIONEERS.find(p => p.id === d.id);
        if (pioneer) {
          setHoveredPioneer(pioneer);
          
          let x = event.clientX;
          let y = event.clientY;
          
          const tooltipWidth = 280;
          const tooltipHeight = 180;
          
          if (x + tooltipWidth + 30 > window.innerWidth) {
            x = x - tooltipWidth - 30;
          }
          if (y + tooltipHeight + 30 > window.innerHeight) {
            y = y - tooltipHeight - 30;
          }
          
          setTooltipPos({ x, y });
        }
        
        d3.select(this).select('circle')
          .transition()
          .duration(150)
          .attr('r', 12);
      })
      .on('mousemove', function (event) {
        let x = event.clientX;
        let y = event.clientY;
        const tooltipWidth = 280;
        const tooltipHeight = 180;
        
        if (x + tooltipWidth + 30 > window.innerWidth) {
          x = x - tooltipWidth - 30;
        }
        if (y + tooltipHeight + 30 > window.innerHeight) {
          y = y - tooltipHeight - 30;
        }
        
        setTooltipPos({ x, y });
      })
      .on('mouseleave', function (event, d: any) {
        setHoveredPioneer(null);
        
        d3.select(this).select('circle')
          .transition()
          .duration(150)
          .attr('r', 8);
      });

    const updateAndDrawPulses = () => {
      const pGroup = svg.select<SVGGElement>('.pulses');
      if (pGroup.empty()) return;

      const activePulses = activePulsesRef.current;
      const speed = 0.04;

      for (let i = activePulses.length - 1; i >= 0; i--) {
        const pulse = activePulses[i];
        pulse.segmentProgress += speed;
        if (pulse.segmentProgress >= 1.0) {
          pulse.segmentProgress = 0;
          pulse.nodeIndex += 1;
          if (pulse.nodeIndex >= pulse.path.length - 1) {
            activePulses.splice(i, 1);
          }
        }
      }

      const pulseSelections = pGroup.selectAll<SVGGElement, ActivePulse>('g.pulse-group')
        .data(activePulses);

      pulseSelections.exit().remove();

      const enter = pulseSelections.enter().append('g')
        .attr('class', 'pulse-group')
        .style('pointer-events', 'none');

      enter.append('circle')
        .attr('class', 'pulse-core')
        .attr('r', 4.5);

      enter.append('circle')
        .attr('class', 'pulse-glow')
        .attr('r', 10)
        .attr('opacity', 0.28)
        .style('filter', 'blur(1px)');

      const merged = pulseSelections.merge(enter);

      merged.select('.pulse-core')
        .attr('cx', (d: any) => {
          const n1 = d.path[d.nodeIndex];
          const n2 = d.path[d.nodeIndex + 1];
          if (!n1 || !n2 || n1.x === undefined || n2.x === undefined) return 0;
          return n1.x + (n2.x - n1.x) * d.segmentProgress;
        })
        .attr('cy', (d: any) => {
          const n1 = d.path[d.nodeIndex];
          const n2 = d.path[d.nodeIndex + 1];
          if (!n1 || !n2 || n1.y === undefined || n2.y === undefined) return 0;
          return n1.y + (n2.y - n1.y) * d.segmentProgress;
        })
        .attr('fill', (d: any) => d.color);

      merged.select('.pulse-glow')
        .attr('cx', (d: any) => {
          const n1 = d.path[d.nodeIndex];
          const n2 = d.path[d.nodeIndex + 1];
          if (!n1 || !n2 || n1.x === undefined || n2.x === undefined) return 0;
          return n1.x + (n2.x - n1.x) * d.segmentProgress;
        })
        .attr('cy', (d: any) => {
          const n1 = d.path[d.nodeIndex];
          const n2 = d.path[d.nodeIndex + 1];
          if (!n1 || !n2 || n1.y === undefined || n2.y === undefined) return 0;
          return n1.y + (n2.y - n1.y) * d.segmentProgress;
        })
        .attr('fill', (d: any) => d.color);
    };

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);

      updateAndDrawPulses();

      if (activePulsesRef.current.length > 0) {
        simulation.alphaTarget(0.1);
      } else {
        simulation.alphaTarget(0);
      }
    });

    simulationRef.current = simulation;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      svg.attr('width', w).attr('height', h);
      simulation.force('center', d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
    };
  }, []);

  // Effect to handle selection updates and start traveling pulses
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const prevId = prevSelectedIdRef.current;
    prevSelectedIdRef.current = selectedId || null;

    // Reset all nodes
    svg.select('.nodes').selectAll('circle')
      .classed('node-active', false)
      .transition()
      .duration(500)
      .attr('r', (d: any) => d.isPioneer ? 8 : 3)
      .attr('fill', (d: any) => d.color || '#555')
      .style('filter', (d: any) => d.isPioneer ? 'blur(1px)' : 'none');

    // Reset all links
    svg.select('.links').selectAll('line')
      .classed('link-active', false)
      .transition()
      .duration(500)
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1);

    if (selectedId) {
      const pioneer = PIONEERS.find(p => p.id === selectedId);
      const color = pioneer?.color || '#3b82f6';

      // Highlight selected node
      svg.select('.nodes').selectAll('circle')
        .filter((d: any) => d.id === selectedId)
        .classed('node-active', true)
        .transition()
        .duration(500)
        .attr('fill', color);

      // Highlight connected links
      svg.select('.links').selectAll('line')
        .filter((d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          return sourceId === selectedId || targetId === selectedId;
        })
        .classed('link-active', true)
        .transition()
        .duration(500)
        .attr('stroke', color);

      // Trigger traveling pulse from old active pioneer to new active pioneer
      if (prevId && prevId !== selectedId) {
        const nodes = svg.select('.nodes').selectAll<SVGGElement, Node>('g').data();
        const links = svg.select('.links').selectAll<SVGLineElement, Link>('line').data();

        const nodeMap = new Map<string, Node>();
        nodes.forEach(n => nodeMap.set(n.id, n));

        const startNode = nodeMap.get(prevId);
        const endNode = nodeMap.get(selectedId);

        if (startNode && endNode) {
          const pathIds = findPath(links, prevId, selectedId);
          let pathNodes: Node[] = [];
          
          if (pathIds) {
            pathNodes = pathIds.map(id => nodeMap.get(id)).filter(Boolean) as Node[];
          } else {
            // fallback: direct line pulse if graph components are separate
            pathNodes = [startNode, endNode];
          }

          if (pathNodes.length >= 2) {
            activePulsesRef.current.push({
              path: pathNodes,
              nodeIndex: 0,
              segmentProgress: 0,
              color,
            });

            if (simulationRef.current) {
              simulationRef.current.alpha(0.5).restart();
            }
          }
        }
      }
    }
  }, [selectedId]);

  return (
    <>
      <svg 
        ref={svgRef} 
        className="fixed inset-0 z-20 pointer-events-none opacity-40"
        style={{ filter: 'contrast(1.2) brightness(0.8)' }}
      />
      {hoveredPioneer && (
        <div 
          className="fixed z-50 p-4 rounded-xl border bg-black/95 text-zinc-100 flex flex-col gap-2 w-72 shadow-[0_10px_30px_rgba(0,0,0,0.85)] border-zinc-800 backdrop-blur-md transition-all duration-150 pointer-events-none"
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y + 15}px`,
            borderColor: `${hoveredPioneer.color}40`,
            boxShadow: `0 0 20px ${hoveredPioneer.color}15`,
          }}
        >
          <div className="flex items-center justify-between gap-4 border-b border-zinc-850/60 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: hoveredPioneer.color }} />
              <span className="font-bold text-sm tracking-tight text-white font-sans">{hoveredPioneer.name}</span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-wider">
              {hoveredPioneer.era}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">Primary Contribution</span>
            <p className="text-xs text-zinc-200 font-sans leading-snug font-medium">
              {hoveredPioneer.contribution}
            </p>
          </div>
          <div className="text-[10px] text-zinc-400 font-sans italic border-t border-zinc-900/55 pt-1.5 mt-0.5 leading-normal bg-[#04010a]/40 px-2 py-1.5 rounded-lg border border-zinc-900">
            {hoveredPioneer.bio}
          </div>
        </div>
      )}
    </>
  );
}
