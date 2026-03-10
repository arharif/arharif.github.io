import { useEffect, useMemo, useRef, useState } from 'react';
import { categoryColors, focusPresets, mindmapEdges, mindmapNodes } from '@/data/securityMindmap';
import { GraphControls } from './GraphControls';
import { NodeDetailPanel } from './NodeDetailPanel';
import { FocusMode, MindmapNode } from './types';

const viewWidth = 1700;
const viewHeight = 1300;
const focusStorageKey = 'security-mindmap-focus-mode';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function SecurityGraph() {
  const [focus, setFocus] = useState<FocusMode>(() => (localStorage.getItem(focusStorageKey) as FocusMode) || 'full');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string>('cybersecurity');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.62);
  const [offset, setOffset] = useState({ x: -180, y: -80 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);

  useEffect(() => { localStorage.setItem(focusStorageKey, focus); }, [focus]);

  const preset = useMemo(() => focusPresets.find((p) => p.id === focus) || focusPresets[0], [focus]);

  const visibleNodes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mindmapNodes.filter((node) => {
      const byFocus = preset.includeCategories.includes(node.category) || Boolean(preset.includeNodeIds?.includes(node.id));
      if (!byFocus) return false;
      if (!term) return true;
      const hay = `${node.label} ${node.cluster} ${node.keywords.join(' ')}`.toLowerCase();
      return hay.includes(term);
    });
  }, [preset, search]);

  const visibleSet = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(
    () => mindmapEdges.filter((edge) => visibleSet.has(edge.source) && visibleSet.has(edge.target)),
    [visibleSet],
  );

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
    setScale(0.62);
    setOffset({ x: -180, y: -80 });
  };

  const fitView = () => {
    const nodes = visibleNodes.length ? visibleNodes : mindmapNodes;
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x));
    const maxY = Math.max(...nodes.map((n) => n.y));
    const pad = 120;
    const width = maxX - minX + pad;
    const height = maxY - minY + pad;
    const nextScale = clamp(Math.min(1000 / width, 650 / height), 0.45, 1.2);
    setScale(nextScale);
    setOffset({ x: -(minX - pad / 2) + 60, y: -(minY - pad / 2) + 40 });
  };

  return (
    <div className="mindmap-shell">
      <GraphControls
        focus={focus}
        setFocus={setFocus}
        search={search}
        setSearch={setSearch}
        onZoomIn={() => setScale((v) => clamp(v + 0.08, 0.35, 1.7))}
        onZoomOut={() => setScale((v) => clamp(v - 0.08, 0.35, 1.7))}
        onFit={fitView}
        onReset={resetView}
      />

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
              setScale(clamp(pinchRef.current.scale * ratio, 0.35, 1.7));
            }
          }}
          onTouchEnd={() => {
            if (!pinchRef.current) {
              dragRef.current = null;
              setDragging(false);
              return;
            }
            pinchRef.current = null;
            dragRef.current = null;
            setDragging(false);
          }}
          onWheel={(e) => {
            e.preventDefault();
            setScale((prev) => clamp(prev + (e.deltaY < 0 ? 0.06 : -0.06), 0.35, 1.7));
          }}
          role="img"
          aria-label="Interactive cybersecurity mindmap with pan and zoom"
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
                return (
                  <line
                    key={edge.id}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={active ? 'rgba(255,255,255,0.85)' : edge.kind === 'future' ? 'rgba(147,197,253,0.55)' : 'rgba(148,163,184,0.35)'}
                    strokeWidth={active ? 2.6 : 1.2}
                    filter={active ? 'url(#mindmap-glow)' : undefined}
                  />
                );
              })}

              {visibleNodes.map((node) => {
                const color = categoryColors[node.colorKey];
                const isActive = node.id === activeId;
                const isHover = node.id === hoverId;
                const isNeighbor = neighborSet.has(node.id);
                const alpha = isActive || isHover ? 1 : isNeighbor ? 0.92 : 0.72;

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
