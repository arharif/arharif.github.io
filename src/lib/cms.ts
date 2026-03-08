import { seedContent } from '@/content/data';
import { ContentInput, ContentRecord, ContentStatus } from '@/content/types';
import { isSupabaseConfigured } from './env';
import { supabaseRest, supabaseUpload } from './supabase';

const localKey = 'arharif-local-cms';

const normalize = (row: Record<string, unknown>): ContentRecord => ({
  id: String(row.id),
  slug: String(row.slug),
  title: String(row.title),
  excerpt: String(row.excerpt ?? ''),
  body: String(row.body ?? ''),
  contentType: String(row.content_type) as ContentRecord['contentType'],
  universe: String(row.universe) as ContentRecord['universe'],
  category: String(row.category ?? ''),
  tags: Array.isArray(row.tags) ? row.tags.map((t) => String(t)) : [],
  coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : undefined,
  videoUrl: row.video_url ? String(row.video_url) : undefined,
  status: String(row.status) as ContentStatus,
  publishedAt: row.published_at ? String(row.published_at) : undefined,
  createdAt: String(row.created_at ?? new Date().toISOString()),
  updatedAt: String(row.updated_at ?? new Date().toISOString()),
  authorName: String(row.author_name ?? 'Arharif'),
});

const toRow = (input: ContentInput) => ({
  slug: input.slug,
  title: input.title,
  excerpt: input.excerpt,
  body: input.body,
  content_type: input.contentType,
  universe: input.universe,
  category: input.category,
  tags: input.tags,
  cover_image_url: input.coverImageUrl ?? null,
  video_url: input.videoUrl ?? null,
  status: input.status,
  published_at: input.publishedAt ?? null,
  author_name: input.authorName,
});

function getLocal(): ContentRecord[] {
  const raw = localStorage.getItem(localKey);
  if (!raw) return seedContent;
  try {
    return JSON.parse(raw) as ContentRecord[];
  } catch {
    return seedContent;
  }
}

function saveLocal(rows: ContentRecord[]) {
  localStorage.setItem(localKey, JSON.stringify(rows));
}

export async function listPublished(): Promise<ContentRecord[]> {
  if (!isSupabaseConfigured) return getLocal().filter((item) => item.status === 'published');
  const rows = await supabaseRest<Record<string, unknown>[]>('content_entries?select=*&status=eq.published&order=published_at.desc.nullslast');
  return rows.map(normalize);
}

export async function listAdmin(accessToken: string): Promise<ContentRecord[]> {
  if (!isSupabaseConfigured) return getLocal();
  const rows = await supabaseRest<Record<string, unknown>[]>('content_entries?select=*&order=updated_at.desc', undefined, accessToken);
  return rows.map(normalize);
}

export async function getBySlug(slug: string): Promise<ContentRecord | null> {
  if (!isSupabaseConfigured) return getLocal().find((item) => item.slug === slug && item.status === 'published') ?? null;
  const rows = await supabaseRest<Record<string, unknown>[]>(`content_entries?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
  return rows[0] ? normalize(rows[0]) : null;
}

export async function createContent(input: ContentInput, accessToken: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const next: ContentRecord = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveLocal([next, ...getLocal()]);
    return;
  }
  await supabaseRest('content_entries', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(toRow(input)) }, accessToken);
}

export async function updateContent(id: string, input: ContentInput, accessToken: string): Promise<void> {
  if (!isSupabaseConfigured) {
    saveLocal(getLocal().map((it) => (it.id === id ? { ...it, ...input, updatedAt: new Date().toISOString() } : it)));
    return;
  }
  await supabaseRest(`content_entries?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(toRow(input)) }, accessToken);
}

export async function deleteContent(id: string, accessToken: string): Promise<void> {
  if (!isSupabaseConfigured) {
    saveLocal(getLocal().filter((it) => it.id !== id));
    return;
  }
  await supabaseRest(`content_entries?id=eq.${id}`, { method: 'DELETE' }, accessToken);
}

export async function uploadMedia(file: File, accessToken: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  if (!isSupabaseConfigured) return URL.createObjectURL(file);
  return supabaseUpload(file, accessToken, path);
}
