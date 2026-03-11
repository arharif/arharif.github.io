import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cyberOperatingModelSections } from '@/data/cyberOperatingModel';
import { roleFamilies, securityRoles } from '@/data/securityRoles';
import { OrgNode, SecurityRole } from '@/types/securityRoles';

const toRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const n = Number.parseInt(normalized, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function buildRadialSkills(role: SecurityRole) {
  const count = Math.max(role.mustHaveDomains.length, 12);
  const radiusX = 340;
  const radiusY = 210;
  return role.mustHaveDomains.map((skill, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      id: `${role.id}-${index}`,
      skill,
      x: Math.cos(angle) * radiusX,
      y: Math.sin(angle) * radiusY,
    };
  });
}

function OrgBranch({ node, path, expanded, onToggle }: { node: OrgNode; path: string; expanded: Set<string>; onToggle: (key: string) => void }) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(path);

  return (
    <li className="pl-3">
      <div className="flex items-center gap-2">
        {hasChildren ? (
          <button
            onClick={() => onToggle(path)}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.title}`}
            aria-expanded={isOpen}
            className="mindmap-tree-toggle h-6 w-6 rounded-md text-xs transition"
          >
            {isOpen ? '⌄' : '›'}
          </button>
        ) : (
          <span className="h-6 w-6" aria-hidden />
        )}
        <div className="mindmap-tree-node flex-1 rounded-lg px-3 py-2 text-sm">{node.title}</div>
      </div>

      {hasChildren && isOpen && (
        <ul className="mindmap-tree-branch mt-2 space-y-2 pl-3">
          {node.children?.map((child, index) => (
            <OrgBranch key={`${path}-${child.title}`} node={child} path={`${path}.${index}`} expanded={expanded} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SecurityMindmapExperience() {
  const operatingModelRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<string>('All');
  const [activeId, setActiveId] = useState(securityRoles[0]?.id ?? '');
  const [zoom, setZoom] = useState(1);
  const [expandedTree, setExpandedTree] = useState<Set<string>>(() => new Set(['0-root', '1-root']));
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const filteredRoles = useMemo(() => {
    const term = query.trim().toLowerCase();
    return securityRoles.filter((role) => {
      const familyMatch = family === 'All' || role.family === family;
      const searchMatch = !term || role.title.toLowerCase().includes(term);
      return familyMatch && searchMatch;
    });
  }, [query, family]);

  const activeRole = useMemo(() => {
    if (!filteredRoles.length) return securityRoles[0];
    return filteredRoles.find((role) => role.id === activeId) ?? filteredRoles[0];
  }, [filteredRoles, activeId]);

  const radialSkills = useMemo(() => (activeRole ? buildRadialSkills(activeRole) : []), [activeRole]);

  useLayoutEffect(() => {
    const element = mapViewportRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect;
      if (!next) return;
      setViewportSize({ width: next.width, height: next.height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const graphBounds = useMemo(() => {
    const skillWidth = 208;
    const skillHeight = 64;
    const centerWidth = 384;
    const centerHeight = 136;

    const minX = Math.min(-centerWidth / 2, ...radialSkills.map((node) => node.x - skillWidth / 2));
    const maxX = Math.max(centerWidth / 2, ...radialSkills.map((node) => node.x + skillWidth / 2));
    const minY = Math.min(-centerHeight / 2, ...radialSkills.map((node) => node.y - skillHeight / 2));
    const maxY = Math.max(centerHeight / 2, ...radialSkills.map((node) => node.y + skillHeight / 2));

    return {
      width: maxX - minX,
      height: maxY - minY,
      minX,
      minY,
    };
  }, [radialSkills]);

  const fitScale = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) return 1;
    const widthScale = viewportSize.width / (graphBounds.width + 56);
    const heightScale = viewportSize.height / (graphBounds.height + 56);
    return clamp(Math.min(widthScale, heightScale), 0.55, 1);
  }, [viewportSize.width, viewportSize.height, graphBounds]);

  const mapScale = clamp(fitScale * zoom, 0.42, 2.2);

  const onToggleTree = (key: string) => {
    setExpandedTree((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!activeRole) return null;

  return (
    <section className="space-y-5">
      <header className="mindmap-hero rounded-3xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="mindmap-chip">Career Architecture Explorer</p>
            <h1 className="mt-2 text-3xl font-semibold">Security Mindmap</h1>
            <p className="mt-2 text-sm text-slate-200/90">A premium role-based explorer for cybersecurity capabilities, certifications, and growth pathways.</p>
          </div>
          <button
            onClick={() => operatingModelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="mindmap-cta rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Cybersecurity Operating Model
          </button>
        </div>
      </header>

      <section className="roles-toolbar rounded-2xl p-4 md:p-5">
        <div className="roles-toolbar-grid roles-toolbar-grid--mindmap">
          <label className="roles-field">
            <span className="roles-field-label">Search roles</span>
            <input
              className="mindmap-input"
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, 120))}
              placeholder="Search by role title"
              aria-label="Search security role"
            />
          </label>

          <label className="roles-field">
            <span className="roles-field-label">Role family</span>
            <select className="mindmap-input" value={family} onChange={(event) => setFamily(event.target.value)} aria-label="Filter by role family">
              {['All', ...roleFamilies].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="roles-results mt-4">
          {filteredRoles.map((role) => {
            const selected = role.id === activeRole.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveId(role.id)}
                className="roles-result-chip"
                title={role.title}
                style={{
                  borderColor: selected ? role.color : 'rgba(148,163,184,0.35)',
                  background: selected ? toRgba(role.color, 0.2) : undefined,
                }}
              >
                {role.title}
              </button>
            );
          })}
          {filteredRoles.length === 0 && <p className="text-sm text-muted">No roles found for this search/filter.</p>}
        </div>
      </section>

      <section className="mindmap-layout">
        <article className="mindmap-canvas rounded-2xl p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Must Have Skills by Role</h2>
            <div className="flex items-center gap-2" role="group" aria-label="Map zoom controls">
              <button onClick={() => setZoom((v) => clamp(v - 0.12, 0.7, 2))} className="mindmap-btn px-3 py-1 text-xs">−</button>
              <span className="text-xs text-muted">{Math.round(mapScale * 100)}%</span>
              <button onClick={() => setZoom((v) => clamp(v + 0.12, 0.7, 2))} className="mindmap-btn px-3 py-1 text-xs">+</button>
              <button onClick={() => setZoom(1)} className="mindmap-btn px-3 py-1 text-xs">Fit</button>
            </div>
          </div>

          <div ref={mapViewportRef} className="relative mx-auto min-h-[620px] max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/65 p-4">
            <div
              key={activeRole.id}
              className="absolute left-1/2 top-1/2 h-full w-full"
              style={{ transform: `translate(-50%, -50%) scale(${mapScale})`, transformOrigin: 'center center', transition: 'transform 260ms ease, opacity 320ms ease', opacity: 1 }}
            >
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden>
                {radialSkills.map((node) => {
                  const x2 = 600 + (node.x / 420) * 410;
                  const y2 = 350 + (node.y / 260) * 250;
                  return <line key={`edge-${node.id}`} x1={600} y1={350} x2={x2} y2={y2} stroke={toRgba(activeRole.color, 0.5)} strokeWidth={1.6} />;
                })}
              </svg>

              {radialSkills.map((node, index) => (
                <div
                  key={node.id}
                  className="absolute left-1/2 top-1/2 z-10 w-52"
                  style={{
                    transform: `translate(calc(-50% + ${node.x}px), calc(-50% + ${node.y}px))`,
                    opacity: 1,
                    transition: `opacity 280ms ease ${Math.min(index * 16, 160)}ms, transform 280ms ease ${Math.min(index * 16, 160)}ms`,
                  }}
                >
                  <div
                    className="rounded-xl border px-3 py-2 text-center text-xs font-medium leading-relaxed text-slate-100 shadow-lg"
                    style={{ borderColor: toRgba(activeRole.color, 0.6), background: toRgba(activeRole.color, 0.2) }}
                  >
                    {node.skill}
                  </div>
                </div>
              ))}

              <div
                className="absolute left-1/2 top-1/2 z-20 w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-5 text-center shadow-2xl"
                style={{ borderColor: activeRole.color, background: toRgba(activeRole.color, 0.2), transition: 'all 260ms ease' }}
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-100/90">Selected Role</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{activeRole.title}</h3>
                <p className="mt-1 text-xs text-slate-200">{activeRole.family}</p>
              </div>
            </div>
          </div>
        </article>

        <aside className="mindmap-panel space-y-4">
          <span className="mindmap-chip" style={{ borderColor: toRgba(activeRole.color, 0.8), color: activeRole.color }}>{activeRole.family}</span>
          <h2 className="text-2xl font-semibold">{activeRole.title}</h2>
          <p className="text-sm text-muted">{activeRole.shortDescription}</p>

          <section>
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted">Main responsibilities</h3>
            <p className="mt-2 text-sm text-slate-200">{activeRole.mainResponsibilities}</p>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted">Must have skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeRole.mustHaveDomains.slice(0, 8).map((skill) => (
                <span key={skill} className="mindmap-tag" style={{ borderColor: toRgba(activeRole.color, 0.45), background: toRgba(activeRole.color, 0.16) }}>{skill}</span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted">Best certification path</h3>
            <p className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">{activeRole.certification}</p>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted">Career roadmap</h3>
            <div className="mt-2 grid gap-2">
              {[
                { label: 'N-2', value: activeRole.careerPath.nMinus2 },
                { label: 'N-1', value: activeRole.careerPath.nMinus1 },
                { label: 'N+1', value: activeRole.careerPath.nPlus1 },
                { label: 'N+2', value: activeRole.careerPath.nPlus2 },
              ].map((step) => (
                <div key={step.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">{step.label}</p>
                  <p className="mt-1 text-sm text-slate-100">{step.value}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section ref={operatingModelRef} className="glass rounded-2xl p-5 md:p-6" aria-label="Cybersecurity operating model">
        <div className="mb-3">
          <p className="mindmap-chip">Organization Architecture</p>
          <h2 className="mt-2 text-2xl font-semibold">Cybersecurity Operating Model</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">Executive-ready hierarchy showing governance, defense, engineering, assurance, and transformation lines.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {cyberOperatingModelSections.map((section, sectionIndex) => (
            <article key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2 border-l border-white/10 pl-2">
                <OrgBranch node={section.root} path={`${sectionIndex}-root`} expanded={expandedTree} onToggle={onToggleTree} />
              </ul>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
