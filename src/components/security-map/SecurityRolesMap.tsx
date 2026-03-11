import { useEffect, useMemo, useRef, useState } from 'react';
import { cyberOperatingModelSections } from '@/data/cyberOperatingModel';
import { roleFamilies, securityRoles } from '@/data/securityRoles';

const RADIAL_POINTS = 12;

const hexToRgba = (hex: string, alpha: number) => {
  const cleaned = hex.replace('#', '');
  const bigint = Number.parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function SecurityRolesMap() {
  const operatingModelRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<'All' | string>('All');
  const [activeRoleId, setActiveRoleId] = useState(securityRoles[0].id);

  const filteredRoles = useMemo(() => {
    const term = query.trim().toLowerCase();
    return securityRoles.filter((role) => {
      const familyMatch = family === 'All' || role.family === family;
      const queryMatch = !term || `${role.title} ${role.mainResponsibilities} ${role.mustHaveDomains.join(' ')}`.toLowerCase().includes(term);
      return familyMatch && queryMatch;
    });
  }, [query, family]);

  useEffect(() => {
    if (!filteredRoles.length) return;
    const activeStillVisible = filteredRoles.some((role) => role.id === activeRoleId);
    if (!activeStillVisible) {
      setActiveRoleId(filteredRoles[0].id);
    }
  }, [filteredRoles, activeRoleId]);

  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (!term) return;
    const exact = filteredRoles.find((role) => role.title.toLowerCase() === term);
    if (exact) setActiveRoleId(exact.id);
  }, [query, filteredRoles]);

  const activeRole = securityRoles.find((role) => role.id === activeRoleId) ?? securityRoles[0];

  const mindmapNodes = useMemo(() => {
    const radius = 260;
    return activeRole.mustHaveDomains.map((domain, idx) => {
      const angle = ((Math.PI * 2) / Math.max(activeRole.mustHaveDomains.length, RADIAL_POINTS)) * idx - Math.PI / 2;
      return {
        domain,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, [activeRole]);

  const scrollToOperatingModel = () => {
    operatingModelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="space-y-5">
      <header className="mindmap-hero rounded-3xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="mindmap-chip">Security Career Architecture</p>
            <h1 className="mt-3 text-2xl font-semibold md:text-4xl">Security Mindmap</h1>
            <p className="mt-2 text-sm text-slate-200/90">
              Explore cybersecurity roles with a centered capability map, role-specific color theme, and a clean career progression view designed for executive-friendly learning.
            </p>
          </div>
          <button onClick={scrollToOperatingModel} className="mindmap-cta rounded-xl px-4 py-2 text-sm font-semibold">
            Cybersecurity Operating Model
          </button>
        </div>
      </header>

      <section className="glass rounded-2xl p-4 md:p-5">
        <div className="roles-toolbar">
          <div className="roles-toolbar-grid">
            <label className="roles-field">
              <span className="roles-field-label">Search role</span>
              <input
                className="mindmap-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by role, responsibility, or domain"
                aria-label="Search security roles"
              />
            </label>
            <div className="roles-field">
              <span className="roles-field-label">Role family</span>
              <div className="flex flex-wrap gap-2">
                {['All', ...roleFamilies].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFamily(item)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${family === item ? 'border-cyan-300/70 bg-cyan-500/20 text-cyan-100' : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mindmap-layout">
        <article className="mindmap-canvas rounded-2xl p-4 md:p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Role Explorer</h2>
            <p className="text-xs text-muted">{filteredRoles.length} roles</p>
          </div>

          <div className="mb-4 flex max-h-40 flex-wrap gap-2 overflow-auto rounded-xl border border-white/10 bg-black/10 p-3">
            {filteredRoles.map((role) => {
              const active = role.id === activeRole.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRoleId(role.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? 'text-white' : 'text-slate-200 hover:bg-white/10'}`}
                  style={{
                    borderColor: active ? role.color : 'rgba(148,163,184,0.3)',
                    backgroundColor: active ? hexToRgba(role.color, 0.25) : 'rgba(15,23,42,0.3)',
                    boxShadow: active ? `0 0 0 1px ${hexToRgba(role.color, 0.4)}` : 'none',
                  }}
                >
                  {role.title}
                </button>
              );
            })}
            {filteredRoles.length === 0 && <p className="text-sm text-muted">No role matched your search. Try a broader keyword.</p>}
          </div>

          <div className="relative mx-auto min-h-[640px] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/60 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" aria-hidden />

            {mindmapNodes.map((node, idx) => (
              <div key={`${activeRole.id}-${idx}`} className="absolute left-1/2 top-1/2 z-10 w-52 -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(calc(-50% + ${node.x}px), calc(-50% + ${node.y}px))` }}>
                <div
                  className="rounded-xl border px-3 py-2 text-center text-xs font-medium leading-relaxed text-slate-100"
                  style={{ borderColor: hexToRgba(activeRole.color, 0.5), backgroundColor: hexToRgba(activeRole.color, 0.2) }}
                >
                  {node.domain}
                </div>
              </div>
            ))}

            <div className="absolute left-1/2 top-1/2 z-20 w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-5 text-center shadow-2xl" style={{ borderColor: activeRole.color, backgroundColor: hexToRgba(activeRole.color, 0.18) }}>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-100/90">Selected role</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{activeRole.title}</h3>
              <p className="mt-2 text-xs text-slate-200">{activeRole.family}</p>
            </div>

            <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden>
              {mindmapNodes.map((node, idx) => {
                const x1 = 500;
                const y1 = 350;
                const x2 = 500 + (node.x / 520) * 430;
                const y2 = 350 + (node.y / 320) * 240;
                return <line key={`line-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hexToRgba(activeRole.color, 0.45)} strokeWidth={1.8} />;
              })}
            </svg>
          </div>
        </article>

        <aside className="mindmap-panel space-y-4">
          <span className="mindmap-chip" style={{ borderColor: hexToRgba(activeRole.color, 0.7), color: activeRole.color }}>{activeRole.family}</span>
          <h2 className="text-2xl font-semibold">{activeRole.title}</h2>
          <p className="text-sm text-muted">{activeRole.shortDescription}</p>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">Main responsibilities</h3>
            <p className="mt-2 text-sm text-slate-200">{activeRole.mainResponsibilities}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">Must-have domains</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeRole.mustHaveDomains.map((domain) => (
                <span key={domain} className="mindmap-tag" style={{ borderColor: hexToRgba(activeRole.color, 0.45), backgroundColor: hexToRgba(activeRole.color, 0.15) }}>{domain}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">Career roadmap</h3>
            <div className="mt-2 grid gap-2">
              {[
                { label: 'N-2', value: activeRole.careerPath.nMinus2 },
                { label: 'N-1', value: activeRole.careerPath.nMinus1 },
                { label: 'Current', value: activeRole.title },
                { label: 'N+1', value: activeRole.careerPath.nPlus1 },
                { label: 'N+2', value: activeRole.careerPath.nPlus2 },
              ].map((step) => (
                <div key={step.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">{step.label}</p>
                  <p className="mt-1 text-sm text-slate-100">{step.value}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section ref={operatingModelRef} className="glass rounded-2xl p-5 md:p-6" aria-label="Cybersecurity operating model">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mindmap-chip">Executive structure</p>
            <h2 className="mt-2 text-2xl font-semibold">Cybersecurity Operating Model</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">A premium, organization-ready view of how strategy, defense, engineering, IAM, assurance, and transformation functions align across leadership and delivery layers.</p>
          </div>
        </div>

        <div className="grid gap-4">
          {cyberOperatingModelSections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {section.groups.map((group) => (
                  <div key={group.title} className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">{group.title}</h4>
                    <div className="mt-3 grid gap-3">
                      {group.units.map((unit) => (
                        <div key={unit.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="font-medium text-slate-100">{unit.title}</p>
                          {unit.roles && (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                              {unit.roles.map((role) => <li key={role}>{role}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
