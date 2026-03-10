import { useEffect, useMemo, useRef, useState } from 'react';
import { approvedThemes, categoryColors, mindmapEdges, mindmapNodes, resolveNodeTheme } from '@/data/securityMindmap';
import { GraphControls } from './GraphControls';
import { safeStorage } from '@/lib/storage';
import { NodeDetailPanel } from './NodeDetailPanel';
import { ApprovedTheme, MindmapNode } from './types';

const viewWidth = 2100;
const viewHeight = 1400;
const themeStorageKey = 'security-map-theme';
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function SecurityGraph() {
  const [theme, setTheme] = useState<ApprovedTheme>(() => (safeStorage.get(themeStorageKey) as ApprovedTheme) || 'all');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string>('cybersecurity');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.55);
  const [offset, setOffset] = useState({ x: -140, y: -40 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);

  useEffect(() => { safeStorage.set(themeStorageKey, theme); }, [theme]);

  const searchedNodes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mindmapNodes;
    return mindmapNodes.filter((node) => {
      const hay = `${node.label} ${node.cluster} ${node.keywords.join(' ')}`.toLowerCase();
      return hay.includes(term);
    });
  }, [search]);

  const visibleSet = useMemo(() => new Set(searchedNodes.map((n) => n.id)), [searchedNodes]);

  const visibleEdges = useMemo(() => mindmapEdges.filter((edge) => visibleSet.has(edge.source) && visibleSet.has(edge.target)), [visibleSet]);

  const neighborSet = useMemo(() => {
    const target = hoverId || activeId;
    const out = new Set<string>();
    if (!target) return out;
    visibleEdges.forEach((edge) => {
      if (edge.source === target) out.add(edge.target);
      if (edge.target === target) out.add(edge.source);
    });
    return out;
  }, [activeId, hoverId, visibleEdges]);

  const activeNode = useMemo(() => mindmapNodes.find((n) => n.id === activeId), [activeId]);
  const relatedNodes = useMemo(() => {
    if (!activeNode) return [];
    return activeNode.related.map((id) => mindmapNodes.find((n) => n.id === id)).filter((n): n is MindmapNode => Boolean(n));
  }, [activeNode]);

  const resetView = () => {
    setScale(0.55);
    setOffset({ x: -140, y: -40 });
  };

  const fitView = () => {
    const nodes = searchedNodes.length ? searchedNodes : mindmapNodes;
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x));
    const maxY = Math.max(...nodes.map((n) => n.y));
    const pad = 140;
    const width = maxX - minX + pad;
    const height = maxY - minY + pad;
    const nextScale = clamp(Math.min(1200 / width, 680 / height), 0.35, 1.1);
    setScale(nextScale);
    setOffset({ x: -(minX - pad / 2) + 80, y: -(minY - pad / 2) + 40 });
  };

  return (
    <div className="mindmap-shell">
      <GraphControls
        theme={theme}
        setTheme={setTheme}
        options={approvedThemes}
        search={search}
        setSearch={setSearch}
        onZoomIn={() => setScale((v) => clamp(v + 0.08, 0.3, 1.7))}
        onZoomOut={() => setScale((v) => clamp(v - 0.08, 0.3, 1.7))}
        onFit={fitView}
        onReset={resetView}
      />

      {searchedNodes.length === 0 && (
        <div className="glass rounded-2xl p-4 text-sm text-muted">No nodes match this theme/search. Try “All Themes” or clear search.</div>
      )}

      <div className="mindmap-layout">
        <div
          className={`mindmap-canvas ${dragging ? 'is-dragging' : ''}`}
          onMouseDown={(e) => { dragRef.current = { x: e.clientX, y: e.clientY }; setDragging(true); }}
          onMouseMove={(e) => {
            if (!dragRef.current) return;
            const dx = (e.clientX - dragRef.current.x) / scale;
            const dy = (e.clientY - dragRef.current.y) / scale;
            setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
            dragRef.current = { x: e.clientX, y: e.clientY };
          }}
          onMouseUp={() => { dragRef.current = null; setDragging(false); }}
          onMouseLeave={() => { dragRef.current = null; setDragging(false); }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              const t = e.touches[0];
              dragRef.current = { x: t.clientX, y: t.clientY };
              setDragging(true);
            }
            if (e.touches.length === 2) {
              const [a, b] = [e.touches[0], e.touches[1]];
              const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
              pinchRef.current = { distance, scale };
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 1 && dragRef.current) {
              const t = e.touches[0];
              const dx = (t.clientX - dragRef.current.x) / scale;
              const dy = (t.clientY - dragRef.current.y) / scale;
              setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
              dragRef.current = { x: t.clientX, y: t.clientY };
            }
            if (e.touches.length === 2 && pinchRef.current) {
              const [a, b] = [e.touches[0], e.touches[1]];
              const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
              const ratio = distance / pinchRef.current.distance;
              setScale(clamp(pinchRef.current.scale * ratio, 0.3, 1.7));
            }
          }}
          onTouchEnd={() => { pinchRef.current = null; dragRef.current = null; setDragging(false); }}
          onWheel={(e) => {
            e.preventDefault();
            setScale((prev) => clamp(prev + (e.deltaY < 0 ? 0.06 : -0.06), 0.3, 1.7));
          }}
          role="img"
          aria-label="Interactive cybersecurity map with theme filters"
        >
          <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="mindmap-svg" preserveAspectRatio="xMinYMin meet">
            <defs>
              <filter id="mindmap-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <pattern id="mindmap-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              </pattern>
            </defs>

            <rect width={viewWidth} height={viewHeight} fill="url(#mindmap-grid)" opacity="0.5" />

            <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
              {visibleEdges.map((edge) => {
                const source = mindmapNodes.find((n) => n.id === edge.source);
                const target = mindmapNodes.find((n) => n.id === edge.target);
                if (!source || !target) return null;
                const active = (hoverId || activeId) && (edge.source === (hoverId || activeId) || edge.target === (hoverId || activeId));
                const sourceTheme = resolveNodeTheme(source);
                const targetTheme = resolveNodeTheme(target);
                const themeDim = theme !== 'all' && sourceTheme !== theme && targetTheme !== theme;
                return (
                  <line
                    key={edge.id}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={active ? 'rgba(255,255,255,0.85)' : themeDim ? 'rgba(100,116,139,0.14)' : edge.kind === 'future' ? 'rgba(147,197,253,0.45)' : 'rgba(148,163,184,0.3)'}
                    strokeWidth={active ? 2.6 : themeDim ? 0.8 : 1.2}
                    filter={active ? 'url(#mindmap-glow)' : undefined}
                  />
                );
              })}

              {searchedNodes.map((node) => {
                const color = categoryColors[node.colorKey];
                const isActive = node.id === activeId;
                const isHover = node.id === hoverId;
                const isNeighbor = neighborSet.has(node.id);
                const themeMatch = theme === 'all' || resolveNodeTheme(node) === theme;
                const alpha = isActive || isHover ? 1 : isNeighbor ? 0.92 : themeMatch ? 0.78 : 0.2;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setHoverId(node.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => setActiveId(node.id)}
                    className="mindmap-node"
                  >
                    <circle r={isActive || isHover ? 18 : 14} fill={color.fill} opacity={alpha} filter="url(#mindmap-glow)" />
                    <circle r={isActive || isHover ? 25 : 21} fill="transparent" stroke={color.ring} strokeOpacity={isActive || isHover ? 0.85 : 0.3} />
                    <text x={0} y={-28} textAnchor="middle" className="mindmap-label" style={{ fill: color.text, opacity: alpha }}>{node.shortLabel || node.label}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <NodeDetailPanel node={activeNode} related={relatedNodes} />
      </div>
    </div>
  );
}
