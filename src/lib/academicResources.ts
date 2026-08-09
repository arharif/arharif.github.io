import { hasSupabaseCoreConfig } from './config';
import { supabaseRest } from './supabase';
import { AcademicResource, AcademicResourceInput } from '@/types/academic';

type ResourceRow = { id: string; name: string; url: string; description: string; type: AcademicResource['type']; created_at?: string; updated_at?: string };

const fallbackResources: AcademicResource[] = [
  { id: 'nist-csf', name: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework', description: 'Official guidance for understanding, assessing and communicating cybersecurity outcomes.', type: 'guide' },
  { id: 'nist-ai-rmf', name: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework', description: 'A practical foundation for governing and managing risks across the AI lifecycle.', type: 'research' },
  { id: 'iso-27001', name: 'ISO/IEC 27001 Information Security', url: 'https://www.iso.org/isoiec-27001-information-security.html', description: 'An introduction to the international standard for information security management systems.', type: 'course' },
];

const toResource = (row: ResourceRow): AcademicResource => ({ ...row, createdAt: row.created_at, updatedAt: row.updated_at });

export async function listAcademicResources(signal?: AbortSignal): Promise<AcademicResource[]> {
  if (!hasSupabaseCoreConfig) return fallbackResources;
  const rows = await supabaseRest<ResourceRow[]>('academic_resources?select=id,name,url,description,type,created_at,updated_at&order=created_at.desc', { signal });
  return rows.map(toResource).filter((item) => isSafeHttpUrl(item.url));
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
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
  if (!rows[0]) throw new Error('The resource could not be saved.');
  return toResource(rows[0]);
}
