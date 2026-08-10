import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const cms = readFileSync(new URL('../src/lib/cms.ts', import.meta.url), 'utf8');
const keepalive = readFileSync(new URL('../.github/workflows/keepalive.yml', import.meta.url), 'utf8');

test('all CMS content operations use the deployed content table contract', () => {
  assert.match(cms, /`content\?select=\$\{select\}/);
  assert.match(cms, /'content\?select=\*&order=updated_at\.desc'/);
  assert.match(cms, /supabaseRest\('content', \{ method: 'POST'/);
  assert.doesNotMatch(cms, /content_entries/);
});

test('the keepalive probes the same deployed content table', () => {
  assert.match(keepalive, /rest\/v1\/content\?select=id&limit=1/);
  assert.doesNotMatch(keepalive, /content_entries/);
});
