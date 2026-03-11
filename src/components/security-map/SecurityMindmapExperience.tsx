import { useMemo, useRef, useState } from 'react';
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

function OperatingModelTree({ node }: { node: OrgNode }) {
  return (
    <li className="pl-4">
      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100">{node.title}</div>
      {node.children && node.children.length > 0 && (
        <ul className="mt-2 space-y-2 border-l border-white/10 pl-3">
          {node.children.map((child) => (
            <OperatingModelTree key={`${node.title}-${child.title}`} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function buildRadialDomains(role: SecurityRole) {
  const count = Math.max(role.mustHaveDomains.length, 12);
  const radiusX = 340;
  const radiusY = 210;
  return role.mustHaveDomains.map((domain, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      id: `${role.id}-${index}`,
      domain,
      x: Math.cos(angle) * radiusX,
      y: Math.sin(angle) * radiusY,
    };
  });
}

export function SecurityMindmapExperience() {
  const operatingModelRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<string>('All');
  const [activeId, setActiveId] = useState(securityRoles[0]?.id ?? '');

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

  const radialDomains = useMemo(() => (activeRole ? buildRadialDomains(activeRole) : []), [activeRole]);

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

      <section className="glass rounded-2xl p-4 md:p-5">
        <div className="roles-toolbar-grid">
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

          <div className="roles-field">
            <span className="roles-field-label">Role family</span>
            <div className="flex flex-wrap gap-2">
              {['All', ...roleFamilies].map((item) => (
                <button
                  key={item}
                  onClick={() => setFamily(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${family === item ? 'border-cyan-300/70 bg-cyan-500/20 text-cyan-50' : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex max-h-36 flex-wrap gap-2 overflow-auto rounded-xl border border-white/10 bg-black/10 p-3">
          {filteredRoles.map((role) => {
            const selected = role.id === activeRole.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveId(role.id)}
                className="rounded-full border px-3 py-1.5 text-xs transition"
                style={{
                  borderColor: selected ? role.color : 'rgba(148,163,184,0.35)',
                  background: selected ? toRgba(role.color, 0.22) : 'rgba(15,23,42,0.35)',
                  color: selected ? '#f8fafc' : '#cbd5e1',
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
            <h2 className="text-lg font-semibold">Must-Have Domains Map</h2>
            <span className="text-xs text-muted">Centered on selected role</span>
          </div>

          <div className="relative mx-auto min-h-[620px] max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/65 p-4">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden>
              {radialDomains.map((node) => {
                const x2 = 600 + (node.x / 420) * 410;
                const y2 = 350 + (node.y / 260) * 250;
                return <line key={`edge-${node.id}`} x1={600} y1={350} x2={x2} y2={y2} stroke={toRgba(activeRole.color, 0.5)} strokeWidth={1.6} />;
              })}
            </svg>

            {radialDomains.map((node) => (
              <div
                key={node.id}
                className="absolute left-1/2 top-1/2 z-10 w-52"
                style={{ transform: `translate(calc(-50% + ${node.x}px), calc(-50% + ${node.y}px))` }}
              >
                <div
                  className="rounded-xl border px-3 py-2 text-center text-xs font-medium leading-relaxed text-slate-100 shadow-lg"
                  style={{ borderColor: toRgba(activeRole.color, 0.6), background: toRgba(activeRole.color, 0.2) }}
                >
                  {node.domain}
                </div>
              </div>
            ))}

            <div
              className="absolute left-1/2 top-1/2 z-20 w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-5 text-center shadow-2xl"
              style={{ borderColor: activeRole.color, background: toRgba(activeRole.color, 0.2) }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-100/90">Selected Role</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{activeRole.title}</h3>
              <p className="mt-1 text-xs text-slate-200">{activeRole.family}</p>
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
          {cyberOperatingModelSections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2 border-l border-white/10 pl-2">
                <OperatingModelTree node={section.root} />
              </ul>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
