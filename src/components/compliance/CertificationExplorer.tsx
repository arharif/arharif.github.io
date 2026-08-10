import { useMemo, useState } from 'react';
import { certifications, certificationCategories } from '@/data/certifications';
import { recommendCertifications } from '@/lib/certificationRecommendations';

const safeArray = <T,>(value: T[] | undefined | null): T[] => (Array.isArray(value) ? value : []);

export function CertificationExplorer() {
  const safeCertifications = safeArray(certifications);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(safeCertifications[0]?.id ?? '');

  const filteredCertifications = useMemo(() => {
    const term = query.trim().toLowerCase();
    return safeCertifications.filter((item) => {
      const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
      const searchMatch =
        !term ||
        `${item.name} ${item.area} ${item.bestFit} ${item.careerPath} ${item.category} ${safeArray(item.domains).join(' ')}`
          .toLowerCase()
          .includes(term);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, query, safeCertifications]);

  // Selection is the single source for every detail and recommendation. Search
  // and category filters only control the chooser; they must not silently
  // replace the selected profile with the first visible result.
  const selectedCertification = safeCertifications.find((item) => item.id === selectedId) ?? safeCertifications[0] ?? null;

  const recommendedForProfile = useMemo(
    () => selectedCertification ? recommendCertifications(selectedCertification, safeCertifications) : [],
    [safeCertifications, selectedCertification],
  );

  return (
    <section id="certification-explorer" className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <h2 className="text-2xl font-semibold">Certification Explorer</h2>
        <p className="mt-2 text-sm text-muted">Select a certification to explore its definition, domains, chapters, practical value, career path, and why it is recommended.</p>
      </div>

      {safeCertifications.length === 0 ? (
        <div className="glass rounded-2xl p-4 text-sm text-muted">No certifications available.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
          <div className="glass rounded-2xl p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search certifications..."
              aria-label="Search certifications"
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-bg)] px-3 py-2 text-sm outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {certificationCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-xs ${activeCategory === category ? 'bg-[color:var(--active-bg)] ring-1 ring-[color:var(--active-border)]' : 'bg-[color:var(--badge-bg)] hover:bg-[color:var(--surface-strong)]'}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {filteredCertifications.length === 0 ? (
                <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-bg)] px-3 py-3 text-sm text-muted">No matching certifications found.</div>
              ) : (
                filteredCertifications.map((cert) => {
                  const active = selectedCertification?.id === cert.id;
                  return (
                    <button
                      key={cert.id}
                      onClick={() => setSelectedId(cert.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left ${active ? 'border-[color:var(--active-border)] bg-[color:var(--active-bg)]' : 'border-[color:var(--border)] bg-[color:var(--surface-bg)] hover:bg-[color:var(--badge-bg)]'}`}
                      aria-label={`Select certification ${cert.name}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{cert.name}</p>
                        {cert.priority ? <span className="rounded-full bg-emerald-300/20 px-2 py-0.5 text-[10px] text-emerald-100">Recommended</span> : null}
                      </div>
                      <p className="mt-1 text-xs text-muted">{cert.category}</p>
                    </button>
                  );
                })
              )}
            </div>

            {recommendedForProfile.length > 0 && (
              <div className="mt-4 rounded-xl border border-[color:var(--accent-secondary)] bg-[color:var(--accent-soft)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] theme-accent-text">Recommended for this profile</p>
                <p className="mt-2 text-xs text-[color:var(--text-primary)]/90">Contextual next steps for {selectedCertification?.name}, ranked from its domain, role, career-path, and level metadata:</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-[color:var(--text-primary)]/90">
                  {recommendedForProfile.map(({ certification: cert, sharedConcepts }) => (
                    <li key={`recommended-${cert.id}`}>
                      <strong>{cert.name}</strong>
                      {sharedConcepts.length > 0 && <span className="text-muted"> — complements {sharedConcepts.join(', ')}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <aside className="glass rounded-2xl p-4 text-sm">
            {!selectedCertification ? (
              <p className="text-muted">Select a certification to view details.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold">{selectedCertification.name}</h3>
                  <span className="rounded-full bg-[color:var(--badge-bg)] px-2 py-0.5 text-xs">{selectedCertification.category}</span>
                  <span className="rounded-full bg-[color:var(--badge-bg)] px-2 py-0.5 text-xs">{selectedCertification.level}</span>
                </div>
                <div className="mt-3 space-y-3">
                  <div><p className="text-xs uppercase tracking-[0.14em] text-muted">Area</p><p className="mt-1">{selectedCertification.area}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.14em] text-muted">Best fit</p><p className="mt-1">{selectedCertification.bestFit}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.14em] text-muted">Career path</p><p className="mt-1">{selectedCertification.careerPath}</p></div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Domains / chapters covered</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {safeArray(selectedCertification.domains).map((domain) => <span key={domain} className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-bg)] px-2 py-0.5 text-xs">{domain}</span>)}
                    </div>
                  </div>
                  <div><p className="text-xs uppercase tracking-[0.14em] text-muted">Practical value</p><p className="mt-1">{selectedCertification.practicalValue}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.14em] text-muted">Why recommended</p><p className="mt-1">{selectedCertification.recommendationReason ?? `Relevant to ${selectedCertification.bestFit.toLowerCase()}`}</p></div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
