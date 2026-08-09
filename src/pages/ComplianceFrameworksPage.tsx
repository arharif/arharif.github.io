import { motion } from 'framer-motion';
import {
  Scale,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  complianceFilters,
  complianceFrameworks,
  type ComplianceFramework,
  type FrameworkCategory,
} from '@/data/complianceFrameworks';
import { CertificationArchitecture } from '@/components/compliance/CertificationArchitecture';

const safeArray = <T,>(value: T[] | undefined | null): T[] => (Array.isArray(value) ? value : []);

export function ComplianceFrameworksPage() {
  const frameworks = safeArray(complianceFrameworks);
  const [activeFilter, setActiveFilter] = useState<(typeof complianceFilters)[number]>('All');
  const [activeId, setActiveId] = useState<string>(frameworks[0]?.id ?? '');

  const filteredFrameworks = useMemo(() => {
    if (activeFilter === 'All') return frameworks;
    return frameworks.filter((f) => f.category === (activeFilter as FrameworkCategory));
  }, [activeFilter, frameworks]);

  const selectedFramework: ComplianceFramework | null = useMemo(
    () => filteredFrameworks.find((f) => f.id === activeId) ?? filteredFrameworks[0] ?? frameworks[0] ?? null,
    [activeId, filteredFrameworks, frameworks],
  );

  return (
    <section className="compliance-universe relative isolate space-y-6 overflow-hidden rounded-3xl px-3 py-4 md:px-4">
      <div className="compliance-universe__bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <span className="compliance-orb compliance-orb--a" />
        <span className="compliance-orb compliance-orb--b" />
        <span className="compliance-stars" />
      </div>
      <div className="compliance-panel rounded-2xl p-5 md:p-6">
        <h1 className="text-3xl font-semibold">Compliance Frameworks</h1>
        <p className="mt-2 text-sm text-muted">
          Understand cybersecurity, privacy, resilience, AI governance, payment security, audit, and IT governance
          frameworks with simple summaries, practical context, and guided certification pathways.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => document.getElementById('frameworks-library')?.scrollIntoView({ behavior: 'smooth' })}
            className="compliance-cta compliance-cta--solid"
            aria-label="Explore frameworks section"
          >
            Explore Frameworks
          </button>
          <button
            onClick={() => document.getElementById('certification-explorer')?.scrollIntoView({ behavior: 'smooth' })}
            className="compliance-cta compliance-cta--ghost"
            aria-label="View certifications section"
          >
            View Certifications
          </button>
        </div>
      </div>

      <div className="compliance-anchor-nav" role="navigation" aria-label="Compliance sections">
        <a href="#frameworks-library" className="compliance-anchor-link">Frameworks</a>
        <a href="#certification-explorer" className="compliance-anchor-link">Certifications</a>
      </div>

      <section id="frameworks-library" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Frameworks Library</h2>
          <p className="text-sm text-muted">
            Browse frameworks with clear context on what they are, why they matter, who uses them, and when to apply them.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {complianceFilters.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`compliance-chip rounded-full px-3 py-1.5 text-sm ${activeFilter === chip ? 'compliance-chip--active' : ''}`}
            >
              {chip}
            </button>
          ))}
        </div>

        {filteredFrameworks.length === 0 ? (
          <div className="glass rounded-2xl p-4 text-sm text-muted">No frameworks are available for this category yet. Try another filter.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredFrameworks.map((item) => (
                <motion.button
                  whileHover={{ y: -3 }}
                  key={item.id}
                  id={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`glass compliance-panel rounded-2xl p-5 text-left transition theme-transition hover:-translate-y-1 hover:shadow-[0_14px_28px_var(--glow)] ${selectedFramework?.id === item.id ? 'border-[color:var(--active-border)] bg-[color:var(--active-bg)] shadow-[0_10px_30px_var(--glow)]' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[color:var(--badge-bg)] px-2.5 py-1 text-xs">{item.category}</span>
                    <Scale size={17} className="theme-accent-text" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm text-muted">{item.shortDescription}</p>
                  <p className="mt-2 text-xs text-muted">Why it matters: {item.definition?.slice(0, 96) ?? 'Helps structure security and compliance decisions.'}...</p>
                  <p className="mt-2 text-xs text-muted">
                    Domains: {safeArray(item.domains).slice(0, 2).map((d) => d.name).join(' · ') || 'N/A'}
                  </p>
                  <p className="mt-2 text-xs text-muted">{item.cheatSheet}</p>
                  <span className="mt-3 inline-block text-sm theme-accent-text">View guidance</span>
                </motion.button>
              ))}
            </div>

            <aside className="glass compliance-panel rounded-2xl p-5">
              <h2 className="text-2xl font-semibold">{selectedFramework?.name ?? 'Framework overview'}</h2>
              <p className="mt-2 text-sm text-muted">{selectedFramework?.fullName ?? 'No framework selected.'}</p>
              <div className="mt-4 space-y-3 text-sm leading-7">
                <p>
                  <strong>Definition:</strong> {selectedFramework?.definition ?? 'No data available.'}
                </p>
                <p>
                  <strong>Cheat Sheet Summary:</strong> {selectedFramework?.cheatSheet ?? 'No data available.'}
                </p>
                <p>
                  <strong>Best Role in Unified Model:</strong> {selectedFramework?.modelRole ?? 'No data available.'}
                </p>
                <p>
                  <strong>Purpose:</strong>{' '}
                  {safeArray(selectedFramework?.purpose)
                    .map((x) => `${x.label}: ${x.explanation}`)
                    .join(' · ') || 'No data available.'}
                </p>
                <p>
                  <strong>Scope:</strong>{' '}
                  {safeArray(selectedFramework?.scope)
                    .map((x) => `${x.area}: ${x.description}`)
                    .join(' · ') || 'No data available.'}
                </p>
                <p>
                  <strong>Domains:</strong>{' '}
                  {safeArray(selectedFramework?.domains)
                    .map((x) => `${x.name} (${x.description})`)
                    .join(' · ') || 'No data available.'}
                </p>
                <p>
                  <strong>Key requirements:</strong>{' '}
                  {safeArray(selectedFramework?.keyRequirements)
                    .map((x) => `${x.requirement}: ${x.practicalMeaning}`)
                    .join(' · ') || 'No data available.'}
                </p>
                <p>
                  <strong>Implementation roadmap:</strong>{' '}
                  {safeArray(selectedFramework?.roadmap)
                    .map((x) => `${x.phase}: ${x.deliverable}`)
                    .join(' → ') || 'No data available.'}
                </p>
                <p>
                  <strong>KPIs / KRIs:</strong>{' '}
                  {safeArray(selectedFramework?.metrics)
                    .map((x) => `${x.metric} (${x.type})`)
                    .join(' · ') || 'No data available.'}
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>

      <CertificationArchitecture />

    </section>
  );
}
