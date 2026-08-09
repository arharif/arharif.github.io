import { hasSupabaseCoreConfig } from './config';
import { supabaseRest } from './supabase';
import { AcademicResource, AcademicResourceInput } from '@/types/academic';

type ResourceRow = { id: unknown; name: unknown; url: unknown; description: unknown; type: unknown; created_at?: unknown; updated_at?: unknown };

const resourceTypes = new Set<AcademicResource['type']>(['course', 'pdf', 'guide', 'framework', 'research', 'professional-resource', 'other']);
const toResource = (row: ResourceRow): AcademicResource | null => {
  if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.url !== 'string' || typeof row.description !== 'string') return null;
  const type = typeof row.type === 'string' && resourceTypes.has(row.type as AcademicResource['type']) ? row.type as AcademicResource['type'] : 'other';
  return { id: row.id, name: row.name.slice(0, 120), url: row.url, description: row.description.slice(0, 500), type, createdAt: typeof row.created_at === 'string' ? row.created_at : undefined, updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined };
};

export async function listAcademicResources(signal?: AbortSignal): Promise<AcademicResource[]> {
  const staticRequest = fetch(`${import.meta.env.BASE_URL}academic-resources.json`, { signal })
    .then(async (response) => {
      if (!response.ok) throw new Error('The published library could not be loaded.');
      const rows: unknown = await response.json();
      if (!Array.isArray(rows)) throw new Error('The published library has an invalid format.');
      return rows.map((row) => toResource(row as ResourceRow)).filter((item): item is AcademicResource => Boolean(item));
    });
  if (!hasSupabaseCoreConfig) return staticRequest;
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), 8000);
  const abort = () => timeout.abort();
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const [published, remote] = await Promise.all([staticRequest, supabaseRest<unknown>('academic_resources?select=id,name,url,description,type,created_at,updated_at&status=eq.published&order=created_at.desc', { signal: timeout.signal }).catch(() => [])]);
    const remoteResources = Array.isArray(remote) ? remote.map((row) => toResource(row as ResourceRow)).filter((item): item is AcademicResource => Boolean(item)) : [];
    const unique = new Map(published.map((item) => [item.url.toLowerCase(), item]));
    remoteResources.forEach((item) => unique.set(item.url.toLowerCase(), item));
    return [...unique.values()];
  } finally {
    window.clearTimeout(timer); signal?.removeEventListener('abort', abort);
  }
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch { return false; }
}

export function normalizeResource(input: AcademicResourceInput): AcademicResourceInput {
  const url = new URL(input.url.trim());
  url.hash = '';
  return { name: input.name.trim().replace(/\s+/g, ' '), url: url.toString(), description: input.description.trim().replace(/\s+/g, ' '), type: input.type };
}

export async function createAcademicResource(input: AcademicResourceInput, accessToken: string): Promise<AcademicResource> {
  const normalized = normalizeResource(input);
  if (!normalized.name || !normalized.description || !isSafeHttpUrl(normalized.url)) throw new Error('Check the required fields and enter a valid web address.');
  const rows = await supabaseRest<ResourceRow[]>('academic_resources?select=id,name,url,description,type,created_at,updated_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...normalized, status: 'published' }),
  }, accessToken);
  const created = rows[0] && toResource(rows[0]);
  if (!created) throw new Error('The resource could not be saved.');
  return created;
}
