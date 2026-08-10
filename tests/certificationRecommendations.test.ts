import assert from 'node:assert/strict';
import test from 'node:test';
import { certifications } from '../src/data/certifications.ts';
import { recommendCertifications } from '../src/lib/certificationRecommendations.ts';

const recommendationText = (selectedId: string) => {
  const selectedCertification = certifications.find(({ id }) => id === selectedId);
  assert.ok(selectedCertification, `Missing test certification: ${selectedId}`);

  const recommendations = recommendCertifications(selectedCertification, certifications);
  assert.ok(
    recommendations.every(({ certification }) => certification.id !== selectedCertification.id),
    `${selectedCertification.name} must not recommend itself`,
  );

  return recommendations
    .map(({ certification, sharedConcepts }) => `${certification.name}: ${sharedConcepts.join(', ')}`)
    .join('\n');
};

test('selection changes profile recommendations and excludes the selection', () => {
  const cismRecommendations = recommendationText('cism');
  const resilienceRecommendations = recommendationText('iso-22301-lead-implementer');

  assert.notEqual(cismRecommendations, resilienceRecommendations);
});

test('each required explorer selection has distinct, self-excluding recommendations', () => {
  const selectedIds = ['cism', 'cissp', 'crisc', 'cisa', 'iso-27001-lead-auditor', 'iso-22301-lead-implementer'];
  const results = selectedIds.map(recommendationText);

  assert.equal(new Set(results).size, selectedIds.length);
});
