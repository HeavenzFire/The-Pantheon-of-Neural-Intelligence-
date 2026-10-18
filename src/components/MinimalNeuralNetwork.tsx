import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PIONEERS } from '../constants';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: 'core' | 'agent' | 'signal';
  color: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  strength: number;
}

interface Props {
  selectedId?: string | null;
}

/**
 * Minimal dark neural graph for the Pantheon workspace.
 * The graph is a visualization of configured UI nodes, not a claim that every
 * displayed node is a connected or running external model.
 */
export default function MinimalNeuralNetwork({ selectedId }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const svgElement = svgRef.current;
    if (!host || !svgElement) return;

    const width = Math.max(host.clientWidth, 320);
    const height = Math.max(host.clientHeight, 360);
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const core: GraphNode = { id: 'heavenzfire-core', label: 'HEAVENZFIRE', group: 'core', color: '#e5e7eb' };
    const agents: GraphNode[] = PIONEERS.slice(0, 12).map((p: any) => ({
      id: String(p.id),
      label: String(p.name),
      group: 'agent',
      color: typeof p.color === 'string' ? p.color : '#67e8f9',
    }));
    const signals: GraphNode[] = Array.from({ length: 24 }, (_, i) => ({
      id: `signal-${i + 1}`,
      label: '',
      group: 'signal',
      color: i % 3 === 0 ? '#a78bfa' : '#67e8f9',
    }));
    const nodes = [core, ...agents, ...signals];
    const links: GraphLink[] = [
      ...agents.map((n) => ({ source: core.id, target: n.id, strength: 1 })),
      ...signals.map((n, i) => ({
        source: agents[i % Math.max(agents.length, 1)]?.id ?? core.id,
        target: n.id,
        strength: 0.45,
      })),
      ...agents.slice(0, -1).map((n, i) => ({
        source: n.id,
        target: agents[i + 1].id,
        strength: 0.2,
      })),
    ];

    const defs = svg.append('defs');
    const glow = defs.append('filter').attr('id', 'hf-node-glow');
    glow.append('feGaussianBlur').attr('stdDeviation', '3.2').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    svg.append('circle')
      .attr('cx', width / 2).attr('cy', height / 2).attr('r', Math.min(width, height) * 0.29)
      .attr('fill', 'none').attr('stroke', '#1f2937').attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 8');

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', (d) => d.strength === 1 ? 0.72 : 0.28)
      .attr('stroke-width', (d) => d.strength === 1 ? 1.1 : 0.7);

    const node = svg.append('g').selectAll('g').data(nodes).join('g')
      .attr('role', 'img')
      .attr('aria-label', (d) => d.label || d.id)
      .style('cursor', (d) => d.group === 'agent' ? 'pointer' : 'default');

    node.filter((d) => d.group !== 'signal').append('circle')
      .attr('r', (d) => d.group === 'core' ? 8 : 4)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', (d) => d.group === 'core' ? 1 : 0.88)
      .attr('stroke', (d) => d.color)
      .attr('stroke-opacity', 0.25)
      .attr('stroke-width', 6)
      .attr('filter', 'url(#hf-node-glow)');

    node.filter((d) => d.group === 'signal').append('circle')
      .attr('r', 1.8).attr('fill', (d) => d.color).attr('fill-opacity', 0.65);

    node.filter((d) => d.group !== 'signal').append('text')
      .text((d) => d.label)
      .attr('x', (d) => d.group === 'core' ? 14 : 9)
      .attr('y', 3)
      .attr('fill', (d) => d.group === 'core' ? '#f8fafc' : '#94a3b8')
      .attr('font-size', (d) => d.group === 'core' ? '10px' : '9px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
      .attr('letter-spacing', '0.08em')
      .style('pointer-events', 'none');

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance((d) => d.strength === 1 ? Math.min(width, height) * 0.18 : 42).strength((d) => d.strength))
      .force('charge', d3.forceManyBody().strength((d) => (d as GraphNode).group === 'core' ? -300 : -65))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<GraphNode>().radius((d) => d.group === 'core' ? 20 : d.group === 'agent' ? 13 : 5))
      .on('tick', () => {
        link
          .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
          .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
          .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
          .attr('y2', (d) => (d.target as GraphNode).y ?? 0);
        node.attr('transform', (d) => `translate(${d.x ?? width / 2},${d.y ?? height / 2})`);
      });

    if (selectedId) {
      node.filter((d) => d.id === selectedId).select('circle')
        .attr('r', 6).attr('stroke-opacity', 0.85).attr('stroke-width', 9);
    }

    const observer = new ResizeObserver(() => {
      if (!hostRef.current) return;
      const w = Math.max(hostRef.current.clientWidth, 320);
      const h = Math.max(hostRef.current.clientHeight, 360);
      svg.attr('viewBox', `0 0 ${w} ${h}`);
      simulation.force('center', d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.35).restart();
    });
    observer.observe(host);
    return () => {
      observer.disconnect();
      simulation.stop();
    };
  }, [selectedId]);

  return (
    <div ref={hostRef} className="pointer-events-none fixed inset-0 z-20 h-screen w-screen overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.055),transparent_58%)]" />
      <div className="absolute left-4 top-4 z-10">
        <div className="text-[9px] font-mono uppercase tracking-[0.24em] text-slate-500">Neural topology</div>
        <div className="mt-1 text-xs font-mono text-slate-300">HEAVENZFIRE / LOCAL GRAPH</div>
      </div>
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        Visual topology · runtime status requires health checks
      </div>
      <svg ref={svgRef} className="relative z-[1] h-full w-full opacity-80" />
    </div>
  );
}
