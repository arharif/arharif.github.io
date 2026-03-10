import { useEffect, useMemo, useRef, useState } from 'react';
import { ContentInput, ContentRecord, TopicRecord } from '@/content/types';
import { isSafeExternalUrl, renderMarkdown } from '@/lib/markdown';

export function AdminEditor({
  value,
  topics,
  onSave,
  onUpload,
  saving,
  title = 'Create Content'
}: {
  value?: ContentRecord;
  topics: TopicRecord[];
  onSave: (payload: ContentInput) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
  saving: boolean;
  title?: string;
}) {
  const defaultTopic = useMemo(() => topics[0]?.id ?? '', [topics]);
  const blankForm = useMemo<ContentInput>(() => ({
    topicId: defaultTopic,
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    contentType: 'article',
    coverImageUrl: '',
    videoUrl: '',
    status: 'published',
    publishedAt: undefined,
    authorName: 'X1',
    tags: [],
    collectionIds: [],
    metaTitle: '',
    metaDescription: '',
    ogImageUrl: '',
    featured: false,
    favorite: false,
  }), [defaultTopic]);
  const [form, setForm] = useState<ContentInput>(blankForm);
  const [tagsLike, setTagsLike] = useState('');
  const [localError, setLocalError] = useState('');
  const [bodyFormat, setBodyFormat] = useState<'github' | 'markdown'>('markdown');
  const [previewMode, setPreviewMode] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('image');
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!value) {
      setForm(blankForm);
      setTagsLike('');
      setBodyFormat('markdown');
      setPreviewMode(false);
      setLinkText('');
      setLinkUrl('');
      return;
    }
    setForm({
      topicId: value.topicId,
      slug: value.slug,
      title: value.title,
      excerpt: value.excerpt,
      body: value.body,
      contentType: value.contentType,
      coverImageUrl: value.coverImageUrl ?? '',
      videoUrl: value.videoUrl ?? '',
      status: 'published',
      publishedAt: value.publishedAt,
      authorName: value.authorName ?? 'X1',
      tags: value.tags ?? [],
      collectionIds: value.collectionIds ?? [],
      metaTitle: value.metaTitle ?? '',
      metaDescription: value.metaDescription ?? '',
      ogImageUrl: value.ogImageUrl ?? '',
      featured: value.featured ?? false,
      favorite: value.favorite ?? false,
    });
    setTagsLike((value.tags ?? []).join(','));
    setBodyFormat((value.body || '').includes('## Overview') ? 'github' : 'markdown');
  }, [value, blankForm]);

  const update = <K extends keyof ContentInput>(key: K, val: ContentInput[K]) => setForm((f) => ({ ...f, [key]: val }));
  const safeUrl = (value?: string) => !value || /^https:\/\//.test(value);

  const insertAtCursor = (snippet: string) => {
    const el = bodyRef.current;
    if (!el) {
      update('body', `${form.body}${form.body.endsWith('\n') ? '' : '\n'}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? form.body.length;
    const end = el.selectionEnd ?? form.body.length;
    const next = `${form.body.slice(0, start)}${snippet}${form.body.slice(end)}`;
    update('body', next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const insertLink = () => {
    if (!isSafeExternalUrl(linkUrl)) {
      setLocalError('Only valid https:// or mailto: links can be inserted.');
      return;
    }
    const label = (linkText || 'Link').trim();
    insertAtCursor(`[${label}](${linkUrl.trim()})`);
    setLocalError('');
    setLinkText('');
    setLinkUrl('');
  };

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-4 text-xl font-semibold">{value ? `Edit ${title.replace('Create ', '')}` : title}</h3>
      {localError && <p className="mb-3 text-xs text-rose-300">{localError}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Title" value={form.title} onChange={(e) => { const nextTitle = e.target.value; update('title', nextTitle); if (!value) update('slug', nextTitle.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')); }} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))} />
        <select className="rounded-xl bg-white/10 p-2" value={form.topicId} onChange={(e) => update('topicId', e.target.value)}>
          {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
        </select>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Content type" value={form.contentType} onChange={(e) => update('contentType', e.target.value)} />
        <div className="rounded-xl bg-emerald-500/15 p-2 text-sm text-emerald-200">Publish-only workflow: this post will be published immediately.</div>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Author" value={form.authorName} onChange={(e) => update('authorName', e.target.value)} />
      </div>
      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Quick tags (optional, text only)" value={tagsLike} onChange={(e) => setTagsLike(e.target.value)} />
      <textarea className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={2} placeholder="Excerpt" value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />

      <div className="mt-3 grid gap-2 md:grid-cols-[200px_1fr_1fr]">
        <select className="rounded-xl bg-white/10 p-2" value={bodyFormat} onChange={(e)=>setBodyFormat(e.target.value as 'github' | 'markdown')}>
          <option value="markdown">Markdown</option>
          <option value="github">GitHub README friendly</option>
        </select>
        <button type="button" className="rounded-xl bg-white/10 px-3 py-2 text-sm text-left hover:bg-white/15" onClick={() => {
          const template = bodyFormat === 'github'
            ? '# Title\n\n## Overview\n\n## Key points\n- item\n\n## Notes\n'
            : '## Heading\n\nParagraph text here.\n\n- bullet\n1. numbered\n> quote\n\n```\ncode\n```\n';
          if (!form.body.trim()) update('body', template);
        }}>Insert starter template</button>
        <button type="button" className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15" onClick={() => setPreviewMode((v) => !v)}>{previewMode ? 'Back to editor' : 'Preview'}</button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Link text" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        <button type="button" className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15" onClick={insertLink}>Insert link</button>
      </div>

      {previewMode ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">{renderMarkdown(form.body || '')}</div>
      ) : (
        <textarea ref={bodyRef} className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={14} placeholder={bodyFormat === 'github' ? 'README-friendly structure' : 'Body (markdown-friendly)'} value={form.body} onChange={(e) => update('body', e.target.value)} />
      )}

      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Video embed URL" value={form.videoUrl ?? ''} onChange={(e) => update('videoUrl', e.target.value)} />
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Inline image alt text" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !file.type.startsWith('image/')) return;
          if (file.size > 8 * 1024 * 1024) {
            setLocalError('Upload failed. Use JPG/PNG/WEBP/GIF under 8MB.');
            return;
          }
          try {
            const url = await onUpload(file);
            const snippet = `![${(imageAlt || 'image').trim()}](${url})`;
            insertAtCursor(snippet);
            update('coverImageUrl', form.coverImageUrl || url);
            setLocalError('');
          } catch {
            setLocalError('Upload failed. Use JPG/PNG/WEBP/GIF under 8MB.');
          }
        }} />
        {form.coverImageUrl && <img src={form.coverImageUrl} className="h-12 w-20 rounded object-cover" />}
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
      <button disabled={saving || !form.topicId || !form.title.trim() || !form.slug.trim()} onClick={() => {
        if (!safeUrl(form.videoUrl) || !safeUrl(form.coverImageUrl) || !safeUrl(form.ogImageUrl)) {
          setLocalError('Only HTTPS URLs are allowed for media fields.');
          return;
        }
        setLocalError('');
        onSave({ ...form, status: 'published', contentType: form.contentType, title: form.title.trim(), slug: form.slug.trim(), body: `${form.body}${tagsLike ? `\n\n> tags: ${tagsLike}` : ''}`, publishedAt: form.publishedAt || new Date().toISOString() });
      }} className="mt-4 rounded-xl bg-white/15 px-4 py-2 hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Content'}
      </button>
    </div>
  );
}
