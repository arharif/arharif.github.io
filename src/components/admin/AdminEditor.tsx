import { useState } from 'react';
import { ContentInput, ContentRecord, ContentStatus, ContentType, ThemeUniverse } from '@/content/types';

const types: ContentType[] = ['professional_blog', 'book_summary', 'anime_summary', 'anime_blog', 'series_summary', 'series_blog'];

export function AdminEditor({
  value,
  onSave,
  onUpload,
  saving,
}: {
  value?: ContentRecord;
  onSave: (payload: ContentInput) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
  saving: boolean;
}) {
  const [form, setForm] = useState<ContentInput>({
    slug: value?.slug ?? '',
    title: value?.title ?? '',
    excerpt: value?.excerpt ?? '',
    body: value?.body ?? '',
    contentType: value?.contentType ?? 'professional_blog',
    universe: value?.universe ?? 'professional',
    category: value?.category ?? '',
    tags: value?.tags ?? [],
    coverImageUrl: value?.coverImageUrl,
    videoUrl: value?.videoUrl,
    status: value?.status ?? 'draft',
    publishedAt: value?.publishedAt,
    authorName: value?.authorName ?? 'Arharif',
  });

  const [tagsInput, setTagsInput] = useState(form.tags.join(', '));

  const update = <K extends keyof ContentInput>(key: K, val: ContentInput[K]) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-4 text-xl font-semibold">{value ? 'Edit Content' : 'Create Content'}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
        <select className="rounded-xl bg-white/10 p-2" value={form.universe} onChange={(e) => update('universe', e.target.value as ThemeUniverse)}>{['professional', 'personal'].map((u) => <option key={u} value={u}>{u}</option>)}</select>
        <select className="rounded-xl bg-white/10 p-2" value={form.contentType} onChange={(e) => update('contentType', e.target.value as ContentType)}>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Category" value={form.category} onChange={(e) => update('category', e.target.value)} />
        <select className="rounded-xl bg-white/10 p-2" value={form.status} onChange={(e) => update('status', e.target.value as ContentStatus)}>{['draft', 'published'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Tags comma-separated" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} onBlur={() => update('tags', tagsInput.split(',').map((t) => t.trim()).filter(Boolean))} />
      <textarea className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={2} placeholder="Excerpt" value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
      <textarea className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={12} placeholder="Body (markdown-friendly)" value={form.body} onChange={(e) => update('body', e.target.value)} />
      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Video embed URL (optional)" value={form.videoUrl ?? ''} onChange={(e) => update('videoUrl', e.target.value)} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input type="file" accept="image/*" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!file.type.startsWith('image/')) return;
          const url = await onUpload(file);
          update('coverImageUrl', url);
          update('body', `${form.body}\n\n![uploaded image](${url})`);
        }} />
        {form.coverImageUrl && <img src={form.coverImageUrl} className="h-16 w-24 rounded object-cover" />}
      </div>
      <button disabled={saving} onClick={() => onSave({ ...form, tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean), publishedAt: form.status === 'published' ? new Date().toISOString() : undefined })} className="mt-4 rounded-xl bg-white/15 px-4 py-2 hover:bg-white/25">
        {saving ? 'Saving...' : 'Save Content'}
      </button>
    </div>
  );
}
