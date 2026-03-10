import { useEffect, useMemo, useRef, useState } from 'react';
import { securityMapData } from '@/data/securityMap';
import { SecurityMapDetailPanel } from './SecurityMapDetailPanel';
import { SecurityMapNode } from './types';
import { SecurityMapToolbar } from './SecurityMapToolbar';

const viewWidth = 1800;
const viewHeight = 1200;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const norm = (v: string) => v.toLowerCase().trim();

export function SecurityRolesMap() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string>('category-executive-governance');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const overview = category === 'all' && !search.trim();

  const nodes = useMemo(() => {
    if (overview) {
      const categoryNodes = securityMapData.nodes.filter((n) => n.type === 'category');
      const cols = 4;
      return categoryNodes.map((node, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = 240 + col * 420;
        const y = 170 + row * 190;
        return { ...node, x, y };
      });
    }

    const term = norm(search);
    const filtered = securityMapData.nodes.filter((node) => {
      if (category !== 'all' && node.categoryId !== category) return false;
      if (!term) return true;
      return norm(`${node.label} ${node.description} ${node.categoryId}`).includes(term);
    });

    const selectedCategoryId = category === 'all'
      ? (filtered.find((n) => n.type === 'category')?.categoryId || securityMapData.categories[0].id)
      : category;

    const categoryNode = securityMapData.nodes.find((n) => n.id === `category-${selectedCategoryId}`);
    const subdomains = securityMapData.nodes.filter((n) => n.categoryId === selectedCategoryId && n.type === 'subdomain');
    const roles = securityMapData.nodes.filter((n) => n.categoryId === selectedCategoryId && n.type === 'role');

    const focusNodes: SecurityMapNode[] = [];
    if (categoryNode) focusNodes.push({ ...categoryNode, x: 900, y: 560 });

    const visibleSub = term ? subdomains.filter((n) => filtered.some((f) => f.id === n.id || f.id === categoryNode?.id)) : subdomains;
    const visibleRoles = term ? roles.filter((n) => filtered.some((f) => f.id === n.id || f.id === categoryNode?.id)) : roles;

    visibleSub.forEach((node, idx) => {
      focusNodes.push({ ...node, x: 460, y: 240 + idx * 42 });
    });
    visibleRoles.forEach((node, idx) => {
      focusNodes.push({ ...node, x: 1330, y: 180 + idx * 30 });
    });

    return focusNodes;
  }, [overview, category, search]);

  useEffect(() => {
    if (!nodes.length) return;
    if (!nodes.some((node) => node.id === activeId)) {
      setActiveId(nodes[0].id);
    }
  }, [nodes, activeId]);

  const edges = useMemo(() => {
    const ids = new Set(nodes.map((n) => n.id));
    return securityMapData.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  }, [nodes]);

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const activeNode = nodeMap.get(activeId) || nodes[0];

  const connectedIds = useMemo(() => {
    const target = hoverId || activeNode?.id;
    if (!target) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((edge) => {
      if (edge.source === target) set.add(edge.target);
      if (edge.target === target) set.add(edge.source);
    });
    return set;
  }, [hoverId, activeNode?.id, edges]);

  const fitView = (sourceNodes = nodes) => {
    if (!sourceNodes.length) return;
    const xs = sourceNodes.map((n) => n.x);
    const ys = sourceNodes.map((n) => n.y);
    const minX = Math.min(...xs) - 180;
    const minY = Math.min(...ys) - 140;
    const maxX = Math.max(...xs) + 180;
    const maxY = Math.max(...ys) + 140;
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const nextScale = clamp(Math.min(1280 / w, 760 / h), 0.5, 1.55);
    setScale(nextScale);
    setOffset({ x: -minX + 60, y: -minY + 42 });
  };

  useEffect(() => {
    fitView(nodes);
  }, [category, search]);

  const resetAll = () => {
    setCategory('all');
    setSearch('');
    setActiveId('category-executive-governance');
  };

  return (
    <div className="mindmap-shell">
      <SecurityMapToolbar
        categories={securityMapData.categories}
        category={category}
        search={search}
        setCategory={setCategory}
        setSearch={setSearch}
        onReset={resetAll}
      />

      <div className="mindmap-layout">
        <div
          className={`mindmap-canvas ${dragging ? 'is-dragging' : ''}`}
          onMouseDown={(e) => { setDragging(true); dragRef.current = { x: e.clientX, y: e.clientY }; }}
          onMouseMove={(e) => {
            if (!dragRef.current) return;
            const dx = (e.clientX - dragRef.current.x) / scale;
            const dy = (e.clientY - dragRef.current.y) / scale;
            setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
            dragRef.current = { x: e.clientX, y: e.clientY };
          }}
          onMouseUp={() => { setDragging(false); dragRef.current = null; }}
          onMouseLeave={() => { setDragging(false); dragRef.current = null; }}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            if (!touch) return;
            dragRef.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            if (!touch || !dragRef.current) return;
            const dx = (touch.clientX - dragRef.current.x) / scale;
            const dy = (touch.clientY - dragRef.current.y) / scale;
            setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
            dragRef.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={() => { dragRef.current = null; }}
          onWheel={(e) => { e.preventDefault(); setScale((v) => clamp(v + (e.deltaY < 0 ? 0.06 : -0.06), 0.45, 1.7)); }}
          role="img"
          aria-label="Cybersecurity roles map"
        >
          <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="mindmap-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="roles-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width={viewWidth} height={viewHeight} fill="url(#roles-grid)" opacity="0.6" />
            <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
              {edges.map((edge) => {
                const s = nodeMap.get(edge.source);
                const t = nodeMap.get(edge.target);
                if (!s || !t) return null;
                const active = (hoverId || activeNode?.id) && (edge.source === (hoverId || activeNode?.id) || edge.target === (hoverId || activeNode?.id));
                return <line key={edge.id} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={active ? 'rgba(255,255,255,.8)' : 'rgba(125,211,252,.28)'} strokeWidth={active ? 2.2 : 1.2} />;
              })}

              {nodes.map((node) => {
                const categoryDef = securityMapData.categories.find((c) => c.id === node.categoryId);
                const isActive = node.id === activeNode?.id;
                const isHover = node.id === hoverId;
                const connected = connectedIds.has(node.id);
                const opacity = isActive || isHover ? 1 : connected ? 0.92 : 0.72;
                const radius = node.type === 'category' ? 20 : node.type === 'subdomain' ? 12 : node.coreRole ? 11 : 9;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="mindmap-node"
                    onMouseEnter={() => setHoverId(node.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => {
                      setActiveId(node.id);
                      if (node.type === 'category') setCategory(node.categoryId);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setActiveId(node.id);
                        if (node.type === 'category') setCategory(node.categoryId);
                      }
                    }}
                    aria-label={`${node.type} ${node.label}`}
                  >
                    <circle r={radius} fill={categoryDef?.color.fill || '#334155'} opacity={opacity} />
                    <circle r={radius + 6} fill="transparent" stroke={categoryDef?.color.ring || '#cbd5e1'} strokeOpacity={isActive || isHover ? 0.9 : 0.28} />
                    <text x={node.type === 'subdomain' ? -16 : 16} y={4} textAnchor={node.type === 'subdomain' ? 'end' : 'start'} className="mindmap-label" style={{ fill: categoryDef?.color.text || '#e2e8f0', opacity }}>{node.label}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="glass rounded-xl p-2 flex gap-2 justify-end" role="toolbar" aria-label="Map zoom controls">
            <button className="mindmap-btn" onClick={() => setScale((v) => clamp(v + 0.08, 0.45, 1.7))} aria-label="Zoom in">+</button>
            <button className="mindmap-btn" onClick={() => setScale((v) => clamp(v - 0.08, 0.45, 1.7))} aria-label="Zoom out">−</button>
            <button className="mindmap-btn" onClick={() => fitView(nodes)} aria-label="Fit graph to viewport">Fit</button>
          </div>
          <SecurityMapDetailPanel node={activeNode} />
        </div>
      </div>
    </div>
  );
}
