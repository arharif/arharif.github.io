import { PreviewToken } from '@/components/EditorialImage';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { ContentInput, TopicInput, ContentRecord, TopicRecord } from '@/content/types';
import { AdminEditor } from '@/components/admin/AdminEditor';
import { TopicEditor } from '@/components/admin/TopicEditor';
import { useAuth } from '@/hooks/useAuth';
import { createContent, createTopic, deleteContent, deleteTopic, listAdminContent, listAdminTopics, isPublicArticle, updateContent, updateTopic, uploadMedia } from '@/lib/cms';
import { genericAccessDenied, hasSupabaseCoreConfig } from '@/lib/config';
export default function AdminPage() {
  const { session, isAdmin, logout } = useAuth();
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [content, setContent] = useState<ContentRecord[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicRecord | undefined>();
  const [selectedContent, setSelectedContent] = useState<ContentRecord | undefined>();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const token = session?.access_token || '';

  const friendly = (err: unknown) => {
    const message = err instanceof Error ? err.message.toLowerCase() : '';
    if (message === 'edit-conflict') return 'This article has changed in another session. Copy your unsaved changes before reopening its latest version.';
    if (message.includes('row-level security') || message.includes('permission') || message.includes('not allowed')) return genericAccessDenied;
    return 'Unable to complete request. Please try again.';
  };

  const load = async () => {
    if (!token && hasSupabaseCoreConfig) return;
    setError('');
    try {
      const [t, c] = await Promise.all([listAdminTopics(token), listAdminContent(token)]);
      setTopics(t);
      setContent(c.filter((item) => item.contentType !== 'game'));
    } catch (e) {
      setError(friendly(e));
    }
  };

  useEffect(() => { load(); }, [token]);

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  const published = content.filter((c) => c.status === 'published').length;
  const recentPublished = content.filter((c) => c.status === 'published').slice(0, 5);
  const recentTopics = topics.slice(0, 5);
  const saveTopic = async (payload: TopicInput) => {
    setSaving(true);
    setNotice('');
    setError('');
    try {
      selectedTopic ? await updateTopic(selectedTopic.id, payload, token) : await createTopic(payload, token);
      setSelectedTopic(undefined);
      setNotice('Topic saved.');
      try { await load(); } catch { /* keep success notice when write succeeds */ }
    } catch (e) {
      setError(friendly(e));
    } finally {
      setSaving(false);
    }
  };

  const saveContent = async (payload: ContentInput, id: string, revision?: string) => {
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const clean = { ...payload, contentType: payload.contentType || 'article' };
      const persisted = revision ? await updateContent(id, clean, token, revision) : await createContent(clean, token, id);
      setSelectedContent(persisted);
      try {
        if ((await isPublicArticle(id)) !== (clean.status === 'published')) throw new Error('visibility');
        setNotice(clean.status === 'published' ? 'Published and verified on the public content service.' : 'Draft saved privately and verified.');
      } catch {
        setNotice('Saved to the content service. Public visibility could not be verified.');
      }
      await load();
      return persisted;
    } catch (e) {
      setError(friendly(e));
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <PreviewToken.Provider value={token}><section className="space-y-4">
      {notice && <div role="status" className="glass rounded-xl border border-emerald-300/30 p-3 text-xs text-emerald-200">{notice}</div>}
      {error && <div role="alert" className="glass rounded-xl border border-rose-300/30 p-3 text-xs text-rose-200">{error}</div>}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Owner Publishing Studio</h1>
            <p className="text-sm text-muted">Simple publishing controls and recent updates.</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/15" onClick={() => setSelectedTopic(undefined)}>Create Topic</button>
            <button className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/15" onClick={() => setSelectedContent(undefined)}>Create Content</button>
            <button className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15" onClick={async()=>logout()}>Logout</button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="glass rounded-xl p-3"><p className="text-xs text-muted">Published</p><p className="text-2xl font-semibold">{published}</p></div>
        <div className="glass rounded-xl p-3"><p className="text-xs text-muted">Drafts</p><p className="text-2xl font-semibold">{content.filter((c) => c.status === 'draft').length}</p></div>
        <div className="glass rounded-xl p-3"><p className="text-xs text-muted">Topics</p><p className="text-2xl font-semibold">{topics.length}</p></div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="glass rounded-xl p-3">
          <p className="mb-2 text-xs text-muted">Recent published</p>
          <div className="space-y-1 text-sm">{recentPublished.length ? recentPublished.map((item) => <button key={item.id} className="block w-full rounded bg-white/5 px-2 py-1 text-left hover:bg-white/10" onClick={() => setSelectedContent(item)}>{item.title}</button>) : <p className="text-xs text-muted">No published content yet.</p>}</div>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="mb-2 text-xs text-muted">Recent topics</p>
          <div className="space-y-1 text-sm">{recentTopics.length ? recentTopics.map((item) => <button key={item.id} className="block w-full rounded bg-white/5 px-2 py-1 text-left hover:bg-white/10" onClick={() => setSelectedTopic(item)}>{item.title}</button>) : <p className="text-xs text-muted">No topics yet.</p>}</div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="glass rounded-2xl p-4">
          <p className="mb-2 text-xs text-muted">Topics</p>
          <button className="mb-2 w-full rounded-xl bg-white/10 p-2 text-left" onClick={() => setSelectedTopic(undefined)}>+ New Topic</button>
          <div className="space-y-1">
            {topics.map((t)=><div key={t.id} className="rounded-lg bg-white/5 p-2"><button className="text-left text-sm" onClick={()=>setSelectedTopic(t)}>{t.title}</button><button className="ml-2 text-xs text-rose-300" onClick={async()=>{ if (!window.confirm(`Delete “${t.title}” and its content? This cannot be undone.`)) return; setNotice(''); setError(''); try { await deleteTopic(t.id, token); await load(); setNotice('Topic removed.'); } catch (e) { setError(friendly(e)); } }}>Delete</button></div>)}
          </div>
          <p className="mb-2 mt-4 text-xs text-muted">Posts</p>
          <button className="mb-2 w-full rounded-xl bg-white/10 p-2 text-left" onClick={() => setSelectedContent(undefined)}>+ New Post</button>
          <div className="space-y-1">{content.map((c)=><div key={c.id} className="rounded-lg bg-white/5 p-2"><button className="text-left text-sm" onClick={()=>setSelectedContent(c)}>{c.title} <span className="text-xs text-muted">({c.status})</span></button><button className="ml-2 text-xs text-rose-300" onClick={async()=>{ if (!window.confirm(`Delete “${c.title}”? This cannot be undone.`)) return; setNotice(''); setError(''); try { await deleteContent(c.id, token); await load(); setNotice('Post removed.'); } catch (e) { setError(friendly(e)); } }}>Delete</button></div>)}</div>
        </aside>
        <div className="space-y-6">
          <TopicEditor value={selectedTopic} saving={saving} onSave={saveTopic} />
          <AdminEditor key={selectedContent?.id ?? "new"} ownerId={session.user.id} title="Create Post" topics={topics} value={selectedContent} saving={saving} onUpload={(f)=>uploadMedia(f,token)} onSave={saveContent} />
        </div>
      </div>
    </section></PreviewToken.Provider>
  );
}
