import { hasSupabaseCoreConfig } from './config';
import { supabaseRest } from './supabase';
import { AcademicResource, AcademicResourceInput } from '@/types/academic';

type ResourceRow = { id: unknown; name: unknown; url: unknown; description: unknown; type: unknown; created_at?: unknown; updated_at?: unknown };

const fallbackResources: AcademicResource[] = [
  { id: 'nist-csf', name: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework', description: 'Official guidance for understanding, assessing and communicating cybersecurity outcomes.', type: 'guide' },
  { id: 'nist-ai-rmf', name: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework', description: 'A practical foundation for governing and managing risks across the AI lifecycle.', type: 'research' },
  { id: 'iso-27001', name: 'ISO/IEC 27001 Information Security', url: 'https://www.iso.org/isoiec-27001-information-security.html', description: 'An introduction to the international standard for information security management systems.', type: 'course' },
];

const resourceTypes = new Set<AcademicResource['type']>(['course', 'pdf', 'guide', 'framework', 'research', 'other']);
const toResource = (row: ResourceRow): AcademicResource | null => {
  if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.url !== 'string' || typeof row.description !== 'string') return null;
  const type = typeof row.type === 'string' && resourceTypes.has(row.type as AcademicResource['type']) ? row.type as AcademicResource['type'] : 'other';
  return { id: row.id, name: row.name.slice(0, 120), url: row.url, description: row.description.slice(0, 500), type, createdAt: typeof row.created_at === 'string' ? row.created_at : undefined, updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined };
};

export async function listAcademicResources(signal?: AbortSignal): Promise<AcademicResource[]> {
  if (!hasSupabaseCoreConfig) return fallbackResources;
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), 8000);
  const abort = () => timeout.abort();
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const rows = await supabaseRest<unknown>('academic_resources?select=id,name,url,description,type,created_at,updated_at&order=created_at.desc', { signal: timeout.signal });
    if (!Array.isArray(rows)) throw new Error('The resource service returned an invalid response.');
    return rows.map((row) => toResource(row as ResourceRow)).filter((item): item is AcademicResource => Boolean(item));
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
    body: JSON.stringify(normalized),
  }, accessToken);
  const created = rows[0] && toResource(rows[0]);
  if (!created) throw new Error('The resource could not be saved.');
  return created;
}
