import { useMemo, useRef, useState } from 'react';
import { getCertificationPath } from '@/data/certificationPaths';
import { cyberOperatingModelSections } from '@/data/cyberOperatingModel';
import { roleFamilies, securityRoles } from '@/data/securityRoles';
import { OrgNode } from '@/types/securityRoles';

const hexToRgba = (hex: string, alpha: number) => {
  const cleaned = hex.replace('#', '');
  const bigint = Number.parseInt(cleaned, 16);
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
};

function OrgTree({ node, accent }: { node: OrgNode; accent: string }) {
  return (
    <li className="relative pl-6">
      <div className="rounded-xl border bg-white/5 px-3 py-2 text-sm" style={{ borderColor: hexToRgba(accent, 0.4) }}>
        {node.title}
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="mt-3 space-y-3 border-l border-white/15 pl-4">
          {node.children.map((child) => (
            <OrgTree key={`${node.title}-${child.title}`} node={child} accent={accent} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SecurityRolesMap() {
  const operatingModelRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<'All' | string>('All');
  const [activeRoleId, setActiveRoleId] = useState(securityRoles[0].id);

  const filteredRoles = useMemo(() => {
    const term = query.trim().toLowerCase();
    return securityRoles.filter((role) => {
      const familyMatch = family === 'All' || role.family === family;
      const queryMatch = !term || role.title.toLowerCase().includes(term);
      return familyMatch && queryMatch;
    });
  }, [query, family]);

  const activeRole = useMemo(() => {
    return filteredRoles.find((role) => role.id === activeRoleId) || filteredRoles[0] || securityRoles[0];
  }, [filteredRoles, activeRoleId]);

  const certificationPath = getCertificationPath(activeRole.title);

  return (
    <section className="space-y-5">
      <header className="mindmap-hero rounded-3xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="mindmap-chip">Security Career Architecture</p>
            <h1 className="mt-3 text-2xl font-semibold md:text-4xl">Security Mindmap</h1>
            <p className="mt-2 text-sm text-slate-200/90">Explore cybersecurity roles with a cleaner, text-first role explorer and a premium organization structure view.</p>
          </div>
          <button onClick={() => operatingModelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mindmap-cta rounded-xl px-4 py-2 text-sm font-semibold">
            Cybersecurity Operating Model
          </button>
        </div>
      </header>

      <section className="glass rounded-2xl p-4 md:p-5">
        <div className="roles-toolbar-grid">
          <label className="roles-field">
            <span className="roles-field-label">Search role title</span>
            <input className="mindmap-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type role name (e.g., SOC L2 Analyst)" aria-label="Search security roles" />
          </label>
          <div className="roles-field">
            <span className="roles-field-label">Role family</span>
            <div className="flex flex-wrap gap-2">
              {['All', ...roleFamilies].map((item) => (
                <button key={item} onClick={() => setFamily(item)} className={`rounded-full border px-3 py-1.5 text-xs transition ${family === item ? 'border-cyan-300/70 bg-cyan-500/20 text-cyan-100' : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mindmap-layout">
        <article className="mindmap-canvas rounded-2xl p-4 md:p-6">
          <h2 className="text-lg font-semibold">Role Explorer</h2>
          <p className="mt-1 text-sm text-muted">Select a role to view responsibilities, domain focus, certification path, and progression.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {filteredRoles.map((role) => {
              const active = role.id === activeRole.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRoleId(role.id)}
                  className="rounded-xl border p-3 text-left transition hover:-translate-y-0.5"
                  style={{
                    borderColor: active ? role.color : 'rgba(148,163,184,0.3)',
                    backgroundColor: active ? hexToRgba(role.color, 0.18) : 'rgba(15,23,42,0.28)',
                    boxShadow: active ? `0 0 0 1px ${hexToRgba(role.color, 0.45)}` : 'none',
                  }}
                >
                  <p className="text-sm font-semibold">{role.title}</p>
                  <p className="mt-1 text-xs text-muted">{role.family}</p>
                </button>
              );
            })}
          </div>
          {filteredRoles.length === 0 && <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-muted">No matching role found. Try a broader title.</p>}
        </article>

        <aside className="mindmap-panel space-y-4">
          <span className="mindmap-chip" style={{ borderColor: hexToRgba(activeRole.color, 0.7), color: activeRole.color }}>{activeRole.family}</span>
          <h2 className="text-2xl font-semibold">{activeRole.title}</h2>
          <p className="text-sm text-muted">{activeRole.shortDescription}</p>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">Main responsibilities</h3>
            <p className="mt-2 text-sm text-slate-200">{activeRole.mainResponsibilities}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">Must-have domains</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {activeRole.mustHaveDomains.map((domain) => (
                <li key={domain} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">{domain}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">Best certification path</h3>
            <p className="mt-2 text-sm text-slate-100">{certificationPath}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">Career progression path</h3>
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
          </section>
        </aside>
      </section>

      <section ref={operatingModelRef} className="glass rounded-2xl p-5 md:p-6" aria-label="Cybersecurity operating model">
        <p className="mindmap-chip">Executive structure</p>
        <h2 className="mt-2 text-2xl font-semibold">Cybersecurity Operating Model</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">Hierarchical organization tree for cybersecurity leadership, delivery functions, and independent assurance.</p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {cyberOperatingModelSections.map((section, idx) => {
            const accent = idx === 0 ? '#22d3ee' : '#f59e0b';
            return (
              <article key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <ul className="mt-3 space-y-3 border-l border-white/15 pl-2">
                  <OrgTree node={section.root} accent={accent} />
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
