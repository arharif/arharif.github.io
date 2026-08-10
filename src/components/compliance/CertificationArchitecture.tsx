import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { certificationAreas, certifications } from '@/data/certifications';
import { recommendCertifications } from '@/lib/certificationRecommendations';

const safeArray = <T,>(value: T[] | undefined | null): T[] => (Array.isArray(value) ? value : []);

export function CertificationArchitecture() {
  const safeCertifications = safeArray(certifications);
  const [selectedId, setSelectedId] = useState(safeCertifications[0]?.id ?? '');
  const [activeArea, setActiveArea] = useState<(typeof certificationAreas)[number]>('All');
  const [searchValue, setSearchValue] = useState('');

  const filteredCertifications = useMemo(() => {
    const byArea = activeArea === 'All' ? safeCertifications : safeCertifications.filter((item) => item.area === activeArea);
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized || normalized.length < 2) return byArea;
    return byArea.filter((item) => {
      const target = [item.name, item.area, item.level, item.bestFit, item.practicalValue, item.careerPath, item.category, ...safeArray(item.domains)]
        .join(' ')
        .toLowerCase();
      return target.includes(normalized);
    });
  }, [activeArea, safeCertifications, searchValue]);

  const selectedCertification = safeCertifications.find((item) => item.id === selectedId) ?? safeCertifications[0] ?? null;

  const recommendedForProfile = useMemo(
    () => selectedCertification ? recommendCertifications(selectedCertification, safeCertifications) : [],
    [safeCertifications, selectedCertification],
  );

  return (
    <section id="certification-explorer" className="space-y-4">
      <div className="glass compliance-panel rounded-2xl p-5">
        <h2 className="text-2xl font-semibold">Certification Explorer</h2>
        <p className="mt-2 text-sm text-muted">Explore certifications by area, search by keyword, and inspect full exam domains with practical role alignment.</p>
      </div>

      {safeCertifications.length === 0 ? (
        <div className="glass rounded-2xl p-4 text-sm text-muted">No certifications available.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr]">
          <div className="glass compliance-panel space-y-4 rounded-2xl p-4">
            <div className="space-y-2">
              <label className="compliance-premium-search">
                <Search size={16} className="compliance-premium-search__icon" aria-hidden="true" />
                <input
                  aria-label="Search certifications, domains, career paths, or keywords"
                  className="compliance-premium-search__input"
                  placeholder="Search certifications, domains, career paths, or keywords…"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value.slice(0, 120))}
                />
              </label>
              <p className="text-xs text-muted">Search by certification name, category, level, domain, best fit, practical value, or career path.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {certificationAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setActiveArea(area)}
                  className={`compliance-chip rounded-full px-3 py-1 text-xs ${activeArea === area ? 'compliance-chip--active' : ''}`}
                >
                  {area}
                </button>
              ))}
            </div>

            <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
              {filteredCertifications.length === 0 ? (
                <p className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-bg)] p-3 text-sm text-muted">No matching certifications found.</p>
              ) : (
                filteredCertifications.map((certification) => (
                  <button
                    key={certification.id}
                    id={`cert-${certification.id}`}
                    onClick={() => setSelectedId(certification.id)}
                    aria-label={`Select certification ${certification.name}`}
                    className={`w-full rounded-xl border p-3 text-left ${selectedCertification?.id === certification.id ? 'border-[color:var(--active-border)] bg-[color:var(--active-bg)]' : 'border-[color:var(--border)] bg-[color:var(--surface-bg)] hover:bg-[color:var(--card-hover)]'}`}
                  >
                    <p className="text-sm font-semibold">{certification.name}</p>
                    <p className="text-xs text-muted">{certification.area} · {certification.level}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <aside className="glass compliance-panel rounded-2xl p-4 text-sm">
            {!selectedCertification ? (
              <p className="text-muted">Select a certification to view details.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedCertification.name}</h3>
                  <p className="mt-1 text-xs theme-accent-text">{selectedCertification.area} · {selectedCertification.level}</p>
                </div>
                <p><strong>Best fit:</strong> {selectedCertification.bestFit}</p>
                <p><strong>Career path:</strong> {selectedCertification.careerPath}</p>
                <p><strong>Practical value:</strong> {selectedCertification.practicalValue}</p>
                <div>
                  <p><strong>Full domains / exam areas:</strong></p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {safeArray(selectedCertification.domains).map((domain) => (
                      <li key={domain} className="rounded-full border border-[color:var(--accent-secondary)] bg-[color:var(--accent-soft)] px-2 py-1 text-xs">{domain}</li>
                    ))}
                  </ul>
                </div>
                {recommendedForProfile.length > 0 && (
                  <div className="rounded-xl border border-[color:var(--accent)] bg-[color:var(--accent-soft)] p-3">
                    <p className="text-sm font-semibold theme-accent-text">Recommended for this profile</p>
                    <p className="mt-1 text-xs text-muted">
                      Contextual next steps for {selectedCertification.name}, based on its {selectedCertification.category.toLowerCase()}, role, career-path, domain, and level metadata.
                    </p>
                    <div className="mt-2 space-y-2 text-xs">
                      <p><strong>Target professional profile:</strong> {selectedCertification.bestFit}</p>
                      <p><strong>Career path:</strong> {selectedCertification.careerPath}</p>
                      <p><strong>Why this path is recommended:</strong> {selectedCertification.recommendationReason ?? selectedCertification.practicalValue}</p>
                    </div>
                    <ol aria-label={`Recommended certifications for ${selectedCertification.name}`} className="mt-2 space-y-1 pl-4 text-xs">
                      {recommendedForProfile.map(({ certification, sharedConcepts }) => (
                        <li key={certification.id} className="list-decimal">
                          <strong>{certification.name}</strong>
                          {sharedConcepts.length > 0 && <span className="text-muted"> — complements {sharedConcepts.join(', ')}</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
