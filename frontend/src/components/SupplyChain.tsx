import React, { useEffect, useState } from 'react';
import { getSupplyChainGraph } from '../api';
import type { SupplyChainGraph, Supplier } from '../types';
import {
  AlertTriangle,
  Globe,
  ShieldCheck,
  Search,
  Layers,
} from 'lucide-react';

export const SupplyChain: React.FC = () => {
  const [graph, setGraph] = useState<SupplyChainGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<Supplier | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const data = await getSupplyChainGraph();
      setGraph(data);
      if (data.nodes.length > 0) {
        const critical = data.nodes.find((n) => n.status === 'Critical') ||
                         data.nodes.find((n) => n.status === 'Flagged') ||
                         data.nodes[0];
        setSelectedNode(critical);
      }
      setError(null);
    } catch (err: any) {
      setError('Failed to load multi-tier supply chain dependencies.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
          <span className="text-muted text-sm font-medium">Resolving multi-tier supplier graph...</span>
        </div>
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="rounded-xl border border-error/20 bg-error/5 p-8 text-center animate-fadeIn">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error" />
        <p className="font-semibold text-error mb-4">{error}</p>
        <button
          onClick={fetchGraph}
          className="rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 px-5 py-2 text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredNodes = graph.nodes.filter(
    (n) =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const width = 800;
  const height = 450;
  const paddingY = 60;

  const nodesByTier: Record<number, Supplier[]> = { 1: [], 2: [], 3: [] };
  graph.nodes.forEach((node) => {
    if (nodesByTier[node.tier]) {
      nodesByTier[node.tier].push(node);
    }
  });

  const nodeCoords: Record<string, { x: number; y: number }> = {};

  const tierX: Record<number, number> = {
    3: 100,
    2: 400,
    1: 700,
  };

  Object.entries(nodesByTier).forEach(([tierStr, tierNodes]) => {
    const tier = Number(tierStr);
    const x = tierX[tier];
    const n = tierNodes.length;

    tierNodes.forEach((node, index) => {
      const y = n > 1
        ? paddingY + (index * (height - 2 * paddingY)) / (n - 1)
        : height / 2;
      nodeCoords[node.id] = { x, y };
    });
  });

  const criticalSuppliers = graph.nodes.filter((n) => n.status !== 'Active');

  const getStatusStroke = (status: string) => {
    if (status === 'Critical') return '#c64545';
    if (status === 'Flagged') return '#e8a55a';
    return '#5db872';
  };

  const getStatusFill = (status: string) => {
    if (status === 'Critical') return 'rgba(198,69,69,0.15)';
    if (status === 'Flagged') return 'rgba(232,165,90,0.15)';
    return 'rgba(93,184,114,0.15)';
  };

  return (
    <div className="space-y-6">
      {criticalSuppliers.length > 0 && (
        <div className="rounded-xl border border-error/20 bg-error/5 p-4 flex items-start space-x-3 animate-slideUp">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-error animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-error">Upstream Dependency Alerts Flagged</h4>
            <p className="text-xs text-error/80">
              Refinery and mining tiers are experiencing geopolitical constraints or high quality deviation. Click on flagged nodes to review mitigation options.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-xl bg-surface-dark p-5 lg:col-span-1 space-y-4 animate-slideUp stagger-1">
          <div>
            <h3 className="font-serif text-base font-semibold text-on-dark mb-3" style={{ letterSpacing: '-0.3px' }}>Supplier Directory</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search material, country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-surface-dark-elevated bg-surface-dark-soft px-3 py-2.5 pl-9 text-xs text-on-dark placeholder-on-dark-soft outline-none focus:border-coral transition-colors"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-on-dark-soft" />
            </div>
          </div>

          <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
            {filteredNodes.map((node, i) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-full text-left rounded-lg p-2.5 border transition-all duration-200 flex items-center justify-between text-xs animate-slideInRight ${
                    isSelected
                      ? 'border-coral/50 bg-surface-dark-elevated text-on-dark'
                      : 'border-surface-dark-elevated bg-surface-dark-soft/30 text-on-dark-soft hover:border-coral/30 hover:bg-surface-dark-elevated/50'
                  }`}
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-on-dark text-xs">{node.name}</p>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-on-dark-soft">T{node.tier}</span>
                      <span className="text-on-dark-soft">&bull;</span>
                      <span className="text-[10px] text-on-dark-soft">{node.material}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    node.status === 'Critical'
                      ? 'bg-error/10 text-error'
                      : node.status === 'Flagged'
                      ? 'bg-accent-amber/10 text-accent-amber'
                      : 'bg-success/10 text-success'
                  }`}>
                    {node.status}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-surface-dark-elevated pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-dark-soft mb-3">Graph Legend</h4>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              {[
                { color: 'bg-success', label: 'Active' },
                { color: 'bg-accent-amber', label: 'Flagged' },
                { color: 'bg-error', label: 'Critical' },
              ].map((item) => (
                <span key={item.label} className="flex items-center text-on-dark-soft">
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-dark p-5 lg:col-span-2 relative overflow-hidden flex flex-col items-center animate-slideUp stagger-2">
          <div className="w-full flex items-center justify-between border-b border-surface-dark-elevated pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-coral" />
              <h3 className="font-serif text-sm font-semibold text-on-dark" style={{ letterSpacing: '-0.2px' }}>Interactive Multi-Tier Dependency Graph</h3>
            </div>
            <span className="text-[10px] text-on-dark-soft font-medium">Mines &gt; Refineries &gt; Assembly</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg width={width} height={height} className="rounded-lg bg-surface-dark-soft/40 border border-surface-dark-elevated">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#252320" strokeWidth="0.5" />
                </pattern>
                <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 2 L 10 5 L 0 8 z" fill="#252320" />
                </marker>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {graph.edges.map((edge, idx) => {
                const source = nodeCoords[edge.source_id];
                const target = nodeCoords[edge.target_id];
                if (!source || !target) return null;

                const isHighlighted =
                  selectedNode?.id === edge.source_id || selectedNode?.id === edge.target_id;

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={source.x} y1={source.y}
                      x2={target.x} y2={target.y}
                      stroke={isHighlighted ? '#cc785c' : '#252320'}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={isHighlighted ? '0' : '3 3'}
                      markerEnd="url(#arrow)"
                      opacity={isHighlighted ? 0.7 : 0.4}
                    />
                    {isHighlighted && (
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 - 5}
                        fill="#cc785c"
                        fontSize={8}
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {edge.volume_tpa} tpa
                      </text>
                    )}
                  </g>
                );
              })}

              {graph.nodes.map((node) => {
                const coord = nodeCoords[node.id];
                if (!coord) return null;

                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const radius = isSelected ? 16 : isHovered ? 14 : 12;
                const strokeColor = getStatusStroke(node.status);
                const fillColor = getStatusFill(node.status);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${coord.x}, ${coord.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {node.status !== 'Active' && (
                      <circle r={radius + 8} fill="none" stroke={strokeColor} strokeWidth={1.5} opacity={0.2}>
                        <animate attributeName="r" values={`${radius + 8};${radius + 14};${radius + 8}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {(isSelected || isHovered) && (
                      <circle r={radius + 4} fill="none" stroke="#cc785c" strokeWidth={1.5} opacity={0.5} />
                    )}

                    <circle r={radius} fill={fillColor} stroke={strokeColor} strokeWidth={2} />

                    <circle r={3} fill={strokeColor} />

                    <text y={radius + 14} textAnchor="middle" fill="#faf9f5" fontSize={9} fontWeight={isSelected ? '600' : '400'} className="select-none">
                      {node.name}
                    </text>
                    <text y={radius + 24} textAnchor="middle" fill="#a09d96" fontSize={8} className="select-none">
                      {node.material}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="rounded-xl bg-surface-dark p-6 lg:col-span-1 space-y-4 animate-slideUp stagger-3">
          {selectedNode ? (
            <div className="space-y-5">
              <div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                  selectedNode.status === 'Critical'
                    ? 'border-error/30 bg-error/10 text-error'
                    : selectedNode.status === 'Flagged'
                    ? 'border-accent-amber/30 bg-accent-amber/10 text-accent-amber'
                    : 'border-success/30 bg-success/10 text-success'
                }`}>
                  Tier {selectedNode.tier} &bull; {selectedNode.status}
                </span>
                <h3 className="mt-3 font-serif text-lg font-semibold text-on-dark leading-tight" style={{ letterSpacing: '-0.3px' }}>
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-on-dark-soft mt-1.5 flex items-center">
                  <Globe className="h-3.5 w-3.5 mr-1.5 text-on-dark-soft" />
                  {selectedNode.location}
                </p>
              </div>

              <div className="border-t border-surface-dark-elevated pt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-on-dark-soft">Aggregate Risk Index</span>
                    <span className="font-semibold text-on-dark">{(selectedNode.risk_score * 100).toFixed(0)}/100</span>
                  </div>
                  <div className="w-full bg-surface-dark-soft rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedNode.risk_score >= 0.7
                          ? 'bg-error'
                          : selectedNode.risk_score >= 0.4
                          ? 'bg-accent-amber'
                          : 'bg-success'
                      }`}
                      style={{ width: `${selectedNode.risk_score * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface-dark-soft/40 p-3 rounded-lg border border-surface-dark-elevated">
                    <p className="text-[10px] text-on-dark-soft uppercase font-semibold tracking-wider">Geopolitical</p>
                    <p className="text-sm font-semibold text-on-dark mt-0.5">{(selectedNode.geopolitical_risk * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-surface-dark-soft/40 p-3 rounded-lg border border-surface-dark-elevated">
                    <p className="text-[10px] text-on-dark-soft uppercase font-semibold tracking-wider">Concentration</p>
                    <p className="text-sm font-semibold text-on-dark mt-0.5">{(selectedNode.concentration_risk * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="bg-surface-dark-soft/40 p-3.5 rounded-lg border border-surface-dark-elevated text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-on-dark-soft">Quality Dev. Signature</span>
                    <span className={`font-semibold ${selectedNode.quality_deviation > 0.05 ? 'text-error' : 'text-on-dark'}`}>
                      +{(selectedNode.quality_deviation * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-on-dark-soft mt-1">
                    *Deviation signifies cell chemistry/purity variances affecting battery degradation rates.
                  </p>
                </div>
              </div>

              {selectedNode.status !== 'Active' ? (
                <div className="rounded-lg bg-error/5 border border-error/20 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-error flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                    Mitigation Protocols
                  </h4>
                  <p className="text-[11px] text-on-dark leading-relaxed">
                    Trigger dual-sourcing procurement. Route logistics via the alternative Dar es Salaam corridor to bypass bottlenecks.
                  </p>
                  <button className="w-full py-2 bg-error/20 hover:bg-error/30 border border-error/30 text-on-dark rounded-lg text-xs font-semibold transition-colors">
                    Activate Dual-Sourcing RFP
                  </button>
                </div>
              ) : (
                <div className="rounded-lg bg-success/5 border border-success/20 p-4 flex items-center space-x-3">
                  <ShieldCheck className="h-5 w-5 text-success shrink-0" />
                  <p className="text-xs text-on-dark">
                    Supplier operating within nominal risk boundaries. No immediate intervention required.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-on-dark-soft text-xs text-center">
              Select any supplier node to view geopolitical &amp; quality tracing details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
