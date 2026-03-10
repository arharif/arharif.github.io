import { seedCollections, seedContent, seedTopics } from '@/content/data';
import { CollectionRecord, ContentInput, ContentRecord, ContentStatus, TopicInput, TopicRecord } from '@/content/types';
import { isSupabaseConfigured } from './env';
import { supabaseRest, supabaseUpload } from './supabase';
import { normalizeUniverse } from './universe';

const localTopicsKey = 'arharif-local-topics';
const localContentKey = 'arharif-local-content';
const localCollectionsKey = 'arharif-local-collections';

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* no-op: storage can be unavailable in privacy modes */
  }
};


const normalizeTopic = (r: Record<string, unknown>): TopicRecord => ({
  id: String(r.id), slug: String(r.slug), title: String(r.title), description: String(r.description ?? ''),
  universe: (normalizeUniverse(String(r.universe)) || 'professional') as TopicRecord['universe'], category: String(r.category ?? ''), subcategory: r.subcategory ? String(r.subcategory) : undefined,
  displayStyle: String(r.display_style) as TopicRecord['displayStyle'], coverImageUrl: r.cover_image_url ? String(r.cover_image_url) : undefined,
  palette: r.palette ? String(r.palette) : undefined, mood: r.mood ? String(r.mood) : undefined,
  icon: r.icon ? String(r.icon) : undefined, orderIndex: Number(r.order_index ?? 0), featured: Boolean(r.featured), status: String(r.status ?? 'published') as TopicRecord['status'], createdAt: String(r.created_at), updatedAt: String(r.updated_at),
});

const normalizeContent = (r: Record<string, unknown>): ContentRecord => ({
  id: String(r.id), topicId: String(r.topic_id), slug: String(r.slug), title: String(r.title), excerpt: String(r.excerpt ?? ''), body: String(r.body ?? ''),
  contentType: String(r.content_type), coverImageUrl: r.cover_image_url ? String(r.cover_image_url) : undefined, videoUrl: r.video_url ? String(r.video_url) : undefined,
  status: String(r.status) as ContentStatus, publishedAt: r.published_at ? String(r.published_at) : undefined,
  tags: Array.isArray(r.tags) ? r.tags.map((x) => String(x)) : [],
  collectionIds: Array.isArray(r.collection_ids) ? r.collection_ids.map((x) => String(x)) : [],
  metaTitle: r.meta_title ? String(r.meta_title) : undefined,
  metaDescription: r.meta_description ? String(r.meta_description) : undefined,
  ogImageUrl: r.og_image_url ? String(r.og_image_url) : undefined,
  featured: Boolean(r.featured), favorite: Boolean(r.favorite),
  createdAt: String(r.created_at), updatedAt: String(r.updated_at), authorName: String(r.author_name ?? 'X1'),
  topic: r.topic && typeof r.topic === 'object' ? normalizeTopic(r.topic as Record<string, unknown>) : undefined,
});

const topicRow = (i: TopicInput) => ({ slug: i.slug, title: i.title, description: i.description, universe: i.universe, category: i.category, subcategory: i.subcategory ?? null, display_style: i.displayStyle, cover_image_url: i.coverImageUrl ?? null, icon: i.icon ?? null, order_index: i.orderIndex, status: i.status ?? 'published' });
const contentRow = (i: ContentInput) => ({ topic_id: i.topicId, slug: i.slug, title: i.title, excerpt: i.excerpt, body: i.body, content_type: i.contentType, cover_image_url: i.coverImageUrl ?? null, video_url: i.videoUrl ?? null, status: 'published', published_at: i.publishedAt ?? new Date().toISOString(), author_name: i.authorName });

const getLocalTopics = () => {
  const raw = readStorage(localTopicsKey);
  if (!raw) return seedTopics;
  try { return JSON.parse(raw) as TopicRecord[]; } catch { return seedTopics; }
};
const setLocalTopics = (v: TopicRecord[]) => writeStorage(localTopicsKey, JSON.stringify(v));
const getLocalContent = () => {
  const raw = readStorage(localContentKey);
  if (!raw) return seedContent;
  try { return JSON.parse(raw) as ContentRecord[]; } catch { return seedContent; }
};
const setLocalContent = (v: ContentRecord[]) => writeStorage(localContentKey, JSON.stringify(v));

const getLocalCollections = () => {
  const raw = readStorage(localCollectionsKey);
  if (!raw) return seedCollections;
  try { return JSON.parse(raw) as CollectionRecord[]; } catch { return seedCollections; }
};

export async function listCollections(): Promise<CollectionRecord[]> {
  if (!isSupabaseConfigured) return getLocalCollections();
  const rows = await supabaseRest<Record<string, unknown>[]>('collections?select=*');
  return rows.map((r) => ({ id: String(r.id), slug: String(r.slug), title: String(r.title), description: String(r.description ?? ''), universe: (normalizeUniverse(String(r.universe)) || 'professional') as CollectionRecord['universe'], category: String(r.category ?? ''), coverImageUrl: r.cover_image_url ? String(r.cover_image_url) : undefined, featured: Boolean(r.featured) }));
}

export async function listPublishedTopics() {
  if (!isSupabaseConfigured) return getLocalTopics().filter((t) => (t.status ?? 'published') === 'published').sort((a, b) => a.orderIndex - b.orderIndex);
  const rows = await supabaseRest<Record<string, unknown>[]>('topics?select=*&order=order_index.asc');
  return rows.map(normalizeTopic).filter((t) => (t.status ?? 'published') === 'published');
}

export async function listAdminTopics(accessToken: string) {
  if (!isSupabaseConfigured) return getLocalTopics();
  const rows = await supabaseRest<Record<string, unknown>[]>('topics?select=*&order=order_index.asc', undefined, accessToken);
  return rows.map(normalizeTopic);
}

export async function createTopic(input: TopicInput, accessToken: string) {
  if (!isSupabaseConfigured) {
    const next: TopicRecord = { ...input, status: 'published', id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setLocalTopics([...getLocalTopics(), next]);
    return;
  }
  await supabaseRest('topics', { method: 'POST', body: JSON.stringify(topicRow(input)) }, accessToken);
}

export async function updateTopic(id: string, input: TopicInput, accessToken: string) {
  if (!isSupabaseConfigured) {
    setLocalTopics(getLocalTopics().map((t) => (t.id === id ? { ...t, ...input, status: 'published', updatedAt: new Date().toISOString() } : t)));
    return;
  }
  await supabaseRest(`topics?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(topicRow(input)) }, accessToken);
}

export async function deleteTopic(id: string, accessToken: string) {
  if (!isSupabaseConfigured) {
    setLocalTopics(getLocalTopics().filter((t) => t.id !== id));
    setLocalContent(getLocalContent().filter((c) => c.topicId !== id));
    return;
  }
  await supabaseRest(`topics?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }, accessToken);
}

export async function listPublishedContent() {
  if (!isSupabaseConfigured) return getLocalContent().filter((c) => c.status === 'published');
  const rows = await supabaseRest<Record<string, unknown>[]>("content?select=*,topic:topics(id,slug,title,description,universe,category,subcategory,display_style,cover_image_url,icon,order_index,created_at,updated_at)&status=eq.published&order=published_at.desc.nullslast");
  return rows.map(normalizeContent);
}

export async function listAdminContent(accessToken: string) {
  if (!isSupabaseConfigured) return getLocalContent();
  const rows = await supabaseRest<Record<string, unknown>[]>('content?select=*&order=updated_at.desc', undefined, accessToken);
  return rows.map(normalizeContent);
}

export async function createContent(input: ContentInput, accessToken: string) {
  if (!isSupabaseConfigured) {
    const next: ContentRecord = { ...input, status: 'published', publishedAt: input.publishedAt ?? new Date().toISOString(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setLocalContent([next, ...getLocalContent()]);
    return;
  }
  await supabaseRest('content', { method: 'POST', body: JSON.stringify(contentRow(input)) }, accessToken);
}

export async function updateContent(id: string, input: ContentInput, accessToken: string) {
  if (!isSupabaseConfigured) {
    setLocalContent(getLocalContent().map((c) => (c.id === id ? { ...c, ...input, status: 'published', publishedAt: input.publishedAt ?? c.publishedAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() } : c)));
    return;
  }
  await supabaseRest(`content?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(contentRow(input)) }, accessToken);
}

export async function deleteContent(id: string, accessToken: string) {
  if (!isSupabaseConfigured) {
    setLocalContent(getLocalContent().filter((c) => c.id !== id));
    return;
  }
  await supabaseRest(`content?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }, accessToken);
}

export async function uploadMedia(file: File, accessToken: string) {
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  if (!allowed.has(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Invalid upload.');
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  if (!isSupabaseConfigured) return URL.createObjectURL(file);
  return supabaseUpload(file, accessToken, path);
}
