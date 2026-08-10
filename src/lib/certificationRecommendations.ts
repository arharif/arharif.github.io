import type { Certification } from '@/data/certifications';

const levelRank = (level: string) => {
  const normalized = level.toLowerCase();
  if (normalized.includes('expert')) return 4;
  if (normalized.includes('advanced')) return 3;
  if (normalized.includes('intermediate')) return 2;
  return 1;
};

const concepts: Record<string, string[]> = {
  governance: ['governance', 'management', 'leadership', 'program', 'policy'],
  risk: ['risk', 'control', 'grc', 'compliance'],
  assurance: ['audit', 'auditor', 'assurance', 'evidence', 'assessment'],
  resilience: ['resilience', 'continuity', 'recovery', 'crisis', 'bcms', 'incident'],
  ai: ['ai', 'artificial intelligence', 'aims', 'model'],
  privacy: ['privacy', 'data protection', 'gdpr'],
  security: ['security', 'cybersecurity', 'isms'],
  cloud: ['cloud', 'architecture'],
};

const searchableText = (cert: Certification) =>
  [cert.name, cert.area, cert.category, cert.bestFit, cert.practicalValue, cert.careerPath, ...cert.domains].join(' ').toLowerCase();

const conceptSet = (cert: Certification) => {
  const text = searchableText(cert);
  return new Set(Object.entries(concepts).filter(([, words]) => words.some((word) => text.includes(word))).map(([concept]) => concept));
};

export interface CertificationRecommendation {
  certification: Certification;
  sharedConcepts: string[];
}

/** Deterministic, metadata-driven recommendations; never recommends the selected item. */
export function recommendCertifications(selected: Certification, candidates: Certification[], limit = 5): CertificationRecommendation[] {
  const selectedConcepts = conceptSet(selected);
  const selectedLevel = levelRank(selected.level);
  return candidates
    .filter((candidate) => candidate.id !== selected.id)
    .map((candidate) => {
      const sharedConcepts = [...conceptSet(candidate)].filter((concept) => selectedConcepts.has(concept));
      const sameCategory = candidate.category === selected.category;
      const progression = levelRank(candidate.level) >= selectedLevel ? 1 : 0;
      // `priority` is existing editorial metadata and only resolves close
      // semantic matches; it can never make an unrelated candidate eligible.
      const score = sharedConcepts.length * 4 + (sameCategory ? 5 : 0) + progression + (candidate.priority ? 2 : 0);
      return { certification: candidate, sharedConcepts, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || (a.certification.priority ?? 99) - (b.certification.priority ?? 99) || a.certification.name.localeCompare(b.certification.name))
    .slice(0, limit)
    .map(({ certification, sharedConcepts }) => ({ certification, sharedConcepts }));
}
