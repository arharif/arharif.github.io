import { useMemo, useState } from 'react';
import { ContentInput, ContentRecord, ContentStatus, TopicRecord } from '@/content/types';

export function AdminEditor({
  value,
  topics,
  onSave,
  onUpload,
  saving,
}: {
  value?: ContentRecord;
  topics: TopicRecord[];
  onSave: (payload: ContentInput) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
  saving: boolean;
}) {
  const defaultTopic = useMemo(() => topics[0]?.id ?? '', [topics]);
  const [form, setForm] = useState<ContentInput>({
    topicId: value?.topicId ?? defaultTopic,
    slug: value?.slug ?? '',
    title: value?.title ?? '',
    excerpt: value?.excerpt ?? '',
    body: value?.body ?? '',
    contentType: value?.contentType ?? 'chapter',
    coverImageUrl: value?.coverImageUrl,
    videoUrl: value?.videoUrl,
    status: value?.status ?? 'draft',
    publishedAt: value?.publishedAt,
    authorName: value?.authorName ?? 'X1',
  });

  const [tagsLike, setTagsLike] = useState('');

  const update = <K extends keyof ContentInput>(key: K, val: ContentInput[K]) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-4 text-xl font-semibold">{value ? 'Edit Content' : 'Create Content'}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
        <select className="rounded-xl bg-white/10 p-2" value={form.topicId} onChange={(e) => update('topicId', e.target.value)}>
          {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
        </select>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Content type" value={form.contentType} onChange={(e) => update('contentType', e.target.value)} />
        <select className="rounded-xl bg-white/10 p-2" value={form.status} onChange={(e) => update('status', e.target.value as ContentStatus)}>{['draft', 'published', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Author" value={form.authorName} onChange={(e) => update('authorName', e.target.value)} />
      </div>
      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Quick tags (optional, text only)" value={tagsLike} onChange={(e) => setTagsLike(e.target.value)} />
      <textarea className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={2} placeholder="Excerpt" value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
      <textarea className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={12} placeholder="Body (markdown-friendly)" value={form.body} onChange={(e) => update('body', e.target.value)} />
      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Video embed URL" value={form.videoUrl ?? ''} onChange={(e) => update('videoUrl', e.target.value)} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input type="file" accept="image/*" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !file.type.startsWith('image/')) return;
          if (file.size > 8 * 1024 * 1024) return;
          const url = await onUpload(file);
          update('coverImageUrl', url);
          update('body', `${form.body}\n\n![uploaded image](${url})`);
        }} />
        {form.coverImageUrl && <img src={form.coverImageUrl} className="h-16 w-24 rounded object-cover" />}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Collections IDs comma-separated" value={(form.collectionIds || []).join(',')} onChange={(e) => update('collectionIds', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="SEO meta title" value={form.metaTitle ?? ''} onChange={(e) => update('metaTitle', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="SEO meta description" value={form.metaDescription ?? ''} onChange={(e) => update('metaDescription', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="OG image URL" value={form.ogImageUrl ?? ''} onChange={(e) => update('ogImageUrl', e.target.value)} />
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        <label><input type="checkbox" checked={Boolean(form.featured)} onChange={(e)=>update('featured', e.target.checked)} /> Featured</label>
        <label><input type="checkbox" checked={Boolean(form.favorite)} onChange={(e)=>update('favorite', e.target.checked)} /> Favorite</label>
      </div>
      <button disabled={saving} onClick={() => onSave({ ...form, body: `${form.body}${tagsLike ? `\n\n> tags: ${tagsLike}` : ''}`, publishedAt: form.status === 'published' ? new Date().toISOString() : undefined })} className="mt-4 rounded-xl bg-white/15 px-4 py-2 hover:bg-white/25">
        {saving ? 'Saving...' : 'Save Content'}
      </button>
    </div>
  );
}
