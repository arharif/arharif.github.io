import { EditorialImage } from '../EditorialImage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ContentInput, ContentRecord, TopicRecord } from '@/content/types';
import { isSafeExternalUrl } from '@/lib/markdown';

import { readingStats } from '@/lib/readingTime';
import { safeStorage } from '@/lib/storage';
import { VisualEditor } from './VisualEditor';
import { ArticleView } from '../ArticleView';

export function AdminEditor({
  value,
  ownerId,
  topics,
  onSave,
  onUpload,
  saving,
  title = 'Create Content'
}: {
  value?: ContentRecord;
  ownerId: string;
  topics: TopicRecord[];
  onSave: (payload: ContentInput, id: string, revision?: string) => Promise<ContentRecord>;
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
    status: 'draft',
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
  const cacheKey = 'x1-editor:' + ownerId + ':' + (value?.id || 'new');
  const [recovery] = useState(() => {
    try {
      const cached = JSON.parse(safeStorage.get(cacheKey,'session') || 'null');
      return typeof cached?.form?.body === 'string' ? cached as {form: ContentInput; revision?:string; id?:string} : undefined;
    } catch { return undefined; }
  });
  const [entryId] = useState(() => value?.id ?? recovery?.id ?? crypto.randomUUID());
  const [form, setForm] = useState<ContentInput>(recovery?.form ?? value ?? blankForm);
  const [revision, setRevision] = useState(recovery?.revision ?? value?.updatedAt);
  const [localError, setLocalError] = useState('');
  const [bodyFormat, setBodyFormat] = useState<'github' | 'markdown' | 'visual'>('markdown');
  const [previewMode, setPreviewMode] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('image');
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(Boolean(recovery));
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (defaultTopic) setForm(f => f.topicId ? f : {...f,topicId:defaultTopic});
  }, [defaultTopic]);
  useEffect(() => {
    if (!dirty) return;
    safeStorage.set(cacheKey, JSON.stringify({form, revision, id:entryId}), 'session');
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, form, cacheKey, revision, entryId]);
  const update = <K extends keyof ContentInput>(key: K, val: ContentInput[K]) => {
    setDirty(true);
    setForm(f => ({ ...f, [key]: val }));
  };
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

  const stats = readingStats(form.body);
  async function save(status: 'draft' | 'published') {
    if (![form.videoUrl, form.coverImageUrl, form.ogImageUrl].every(safeUrl)) {
      setLocalError('Use HTTPS URLs for media.'); return;
    }
    try {
      setLocalError('');
      const saved = await onSave({...form, title: form.title.trim(), slug: form.slug.trim(), status,
        tags: form.tags?.map(tag => tag.trim()).filter(Boolean),
        publishedAt: status === 'published' ? form.publishedAt || new Date().toISOString() : undefined}, entryId, revision);
      setForm(saved); setRevision(saved.updatedAt);
      safeStorage.remove(cacheKey, 'session'); setDirty(false);
    } catch { setLocalError('Save failed. Your edits are retained in this tab.'); }
  }
  const incomplete = saving || uploading || !form.title.trim() || !form.topicId || !form.slug.trim();
  return (
    <fieldset disabled={saving || uploading} className="glass studio-editor rounded-2xl p-4">
      <h3 className="mb-4 text-xl font-semibold">{value ? `Edit ${title.replace('Create ', '')}` : title}</h3>
      {localError && <p className="mb-3 text-xs text-rose-300">{localError}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Title" aria-label="Article title" required value={form.title} onChange={(e) => { const nextTitle = e.target.value; update('title', nextTitle); if (!value) update('slug', nextTitle.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')); }} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))} />
        <select className="rounded-xl bg-white/10 p-2" aria-label="Topic" value={form.topicId} onChange={(e) => update('topicId', e.target.value)}>
          {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
        </select>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Content type" value={form.contentType} onChange={(e) => update('contentType', e.target.value)} />
        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-sm">
          Status: <strong>{form.status === 'published' ? 'Published' : 'Draft — private'}</strong>
        </div>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Author" value={form.authorName} onChange={(e) => update('authorName', e.target.value)} />
      </div>
      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Quick tags (optional, text only)" value={(form.tags || []).join(',')} onChange={e => update('tags', e.target.value.split(','))} />
      <textarea className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={2} placeholder="Excerpt" value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />

      <div className="mt-3 grid gap-2 md:grid-cols-[200px_1fr_1fr]">
        <select className="rounded-xl bg-white/10 p-2" aria-label="Editor mode" value={bodyFormat} onChange={(e)=>setBodyFormat(e.target.value as typeof bodyFormat)}>
          <option value="visual">Visual editor</option>
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

      {bodyFormat === 'visual'
        ? <VisualEditor value={form.body} onChange={v => update('body',v)}/>
        : <textarea aria-label="Article Markdown" ref={bodyRef} className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={14} placeholder="Body (markdown-friendly)" value={form.body} onChange={e => update('body',e.target.value)}/>}
      <label className="block text-sm">Reading time · {stats.words} words at 220 words/minute
        <input aria-label="Reading time override" className="ml-2 w-24 p-2" type="number" min={1} max={1440} placeholder={String(stats.automatic)}
          value={form.readingMinutes ?? ''} onChange={e => update('readingMinutes', e.target.value ? Math.min(1440,Math.max(1,Math.floor(Number(e.target.value)))) : undefined)}/> min
      </label>
      {previewMode && <section className="mt-3 rounded-xl border p-4" aria-label="Live preview"><ArticleView item={{...form, id: value?.id || 'preview', createdAt:'', updatedAt:''}} preview/></section>}
      <input className="mt-3 w-full rounded-xl bg-white/10 p-2" placeholder="Video embed URL" value={form.videoUrl ?? ''} onChange={(e) => update('videoUrl', e.target.value)} />
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Inline image alt text" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
        {(['Cover image', 'Inline image'] as const).map(label => <label key={label}>{label}
          <input type="file" aria-label={label} accept="image/jpeg,image/png,image/webp,image/gif" onChange={async e => {
            const file = e.target.files?.[0]; e.target.value = '';
            if (!file) return;
            setUploading(true);
            try {
              const url = await onUpload(file);
              if (label === 'Cover image') update('coverImageUrl', url);
              else insertAtCursor(`![${imageAlt.replace(/[\[\]]/g,'')}](${url})`);
              setLocalError('');
            } catch { setLocalError('Upload failed. Choose a valid JPG, PNG, WebP or GIF up to 8 MiB.'); }
            finally { setUploading(false); }
          }}/>
        </label>)}
        {uploading && <p role="status">Uploading image…</p>}
        {form.coverImageUrl && <><EditorialImage src={form.coverImageUrl} alt="Cover preview" className="h-16 w-24 rounded object-cover"/><button type="button" onClick={() => update('coverImageUrl','')}>Remove cover</button></>}
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
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Publishing actions">
        <button type="button" disabled={incomplete} onClick={() => void save('draft')}>
          {saving ? 'Saving…' : form.status === 'published' ? 'Unpublish to draft' : 'Save draft'}
        </button>
        <button type="button" disabled={incomplete || !form.body.trim()} onClick={() => void save('published')}>
          {saving ? 'Saving…' : form.status === 'published' ? 'Update published' : 'Publish'}
        </button>
        {dirty && <small>Unsaved changes</small>}
      </div>
    </fieldset>
  );
}
