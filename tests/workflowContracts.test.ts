import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('keepalive uses job environment bindings in secret-dependent conditions', () => {
  const workflow = readFileSync(new URL('../.github/workflows/keepalive.yml', import.meta.url), 'utf8');
  assert.doesNotMatch(workflow, /if:.*secrets\./);
  assert.match(workflow, /env:\n\s+SUPABASE_URL:.*secrets\.VITE_SUPABASE_URL/);
  assert.match(workflow, /SUPABASE_ANON_KEY:.*secrets\.VITE_SUPABASE_ANON_KEY[\s\S]*steps:/);
  assert.match(workflow, /if:.*env\.SUPABASE_URL.*env\.SUPABASE_ANON_KEY/);
});
