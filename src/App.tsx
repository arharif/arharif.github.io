import { AnimatePresence, motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import { Component, ReactNode, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AdminEditor } from '@/components/admin/AdminEditor';
import { TopicEditor } from '@/components/admin/TopicEditor';
import { X1Mark } from '@/components/branding/X1Mark';
import { ArticleView } from '@/components/ArticleView';
import { ContentCard, EntryCard } from '@/components/Cards';
import { Navbar } from '@/components/Navbar';
import { GamesHub } from '@/components/GamesHub';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { createContent, createTopic, deleteContent, deleteTopic, listAdminContent, listAdminTopics, listCollections, listPublishedContent, listPublishedTopics, updateContent, updateTopic, uploadMedia } from '@/lib/cms';
import { searchContent } from '@/lib/content';
import { config, genericAccessDenied, genericAuthError, hasSupabaseCoreConfig } from '@/lib/config';
import { initTheme, ThemeMode, themeMap } from '@/lib/theme';
import { CollectionRecord, ContentRecord, TopicRecord } from './content/types';

const normUniverse = (value?: string | null) => (value || '').toLowerCase().trim();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message?: string }> {
  state = { hasError: false, message: undefined as string | undefined };
  static getDerivedStateFromError(error: Error) { return { hasError: true, message: error.message }; }
  render() {
    if (this.state.hasError) return <div className="mx-auto max-w-3xl p-10"><div className="glass rounded-2xl p-6"><h1 className="text-2xl font-semibold">Unable to load page</h1><p className="mt-3 text-muted">A temporary issue interrupted rendering. Please refresh and try again.</p></div></div>;
    return this.props.children;
  }
}

function Landing() {
  const nav = useNavigate();
  return (
    <section className="grid gap-6 py-10 md:grid-cols-2">
      <EntryCard title="Professional" description="AI, Cybersecurity, IoT, systems architecture, and emerging technology knowledge." onClick={() => nav('/professional')} />
      <EntryCard title="Personal" description="Philosophy, anime, books, hobbies, and thoughtful cultural reflections." onClick={() => nav('/personal')} />
    </section>
  );
}

function SearchPage() {
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [content, setContent] = useState<ContentRecord[]>([]);
  const [query, setQuery] = useState('');
  const nav = useNavigate();
  useEffect(() => { Promise.all([listPublishedTopics(), listPublishedContent()]).then(([t, c]) => { setTopics(t); setContent(c); }); }, []);
  const matchedTopics = topics.filter((t) => `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase()));
  const matchedContent = searchContent(content, query);
  return <section><h1 className="mb-4 text-3xl font-semibold">Search</h1><div className="glass mb-5 rounded-2xl p-3"><input className="w-full bg-transparent outline-none" placeholder="Search topics, articles, tags, collections" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="grid gap-6 md:grid-cols-2"><div><h2 className="mb-2 text-xl font-semibold">Topics</h2>{matchedTopics.map((t)=><button key={t.id} onClick={()=>nav(normUniverse(t.universe)==='professional'?`/professional/topic/${t.slug}`:'/personal')} className="glass mb-2 block w-full rounded-xl p-3 text-left">{t.title}</button>)}</div><div><h2 className="mb-2 text-xl font-semibold">Content</h2>{matchedContent.map((c)=>{ const topic = topics.find((t)=>t.id===c.topicId); return <button key={c.id} onClick={()=>nav(topic && normUniverse(topic.universe)==='professional'?`/professional/topic/${topic.slug}`:`/personal/post/${c.slug}`)} className="glass mb-2 block w-full rounded-xl p-3 text-left">{c.title}</button>; })}</div></div></section>;
}

function ProfessionalHome() {
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [posts, setPosts] = useState<ContentRecord[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([listPublishedTopics(), listPublishedContent()]).then(([t, content]) => {
      const professionalTopics = t.filter((x) => normUniverse(x.universe) === 'professional');
      const professionalTopicIds = new Set(professionalTopics.map((x) => x.id));
      setTopics(professionalTopics);
      setPosts(content.filter((item) => professionalTopicIds.has(item.topicId)).slice(0, 6));
    }).catch(() => {
      setTopics([]);
      setPosts([]);
    });

    listCollections()
      .then((c) => setCollections(c.filter((x) => normUniverse(x.universe) === 'professional')))
      .catch(() => setCollections([]));
  }, []);

  return (
    <section>
      <h1 className="mb-2 text-3xl font-semibold">Professional</h1>
      <p className="mb-5 text-muted">This universe is for everything related to the latest technology including AI, Cybersecurity, IoT, OT/ICS, Blockchain, and modern engineering insights.</p>

      {topics.length > 0 ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {topics.map((t)=><motion.button whileHover={{y:-5}} key={t.id} onClick={()=>nav(`/professional/topic/${t.slug}`)} className="glass rounded-2xl p-5 text-left"><p className="text-xs text-muted">{t.category} · {t.displayStyle}</p><h3 className="mt-2 text-xl font-semibold">{t.title}</h3><p className="mt-2 text-sm text-muted">{t.description}</p></motion.button>)}
        </div>
      ) : (
        <div className="glass mb-6 rounded-2xl p-4 text-sm text-muted">No professional topics are visible yet.</div>
      )}

      {posts.length > 0 && (
        <>
          <h2 className="mb-3 text-xl font-semibold">Latest Professional Posts</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => { const topic = topics.find((t) => t.id === p.topicId); return <ContentCard key={p.id} item={p} onOpen={() => nav(topic ? `/professional/topic/${topic.slug}` : '/professional')} />; })}
          </div>
        </>
      )}

      <h2 className="mb-3 text-xl font-semibold">Curated Collections</h2>
      {collections.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">{collections.map((c)=><div className="glass rounded-xl p-3" key={c.id}><p className="text-sm font-semibold">{c.title}</p><p className="text-xs text-muted">{c.description}</p></div>)}</div>
      ) : (
        <div className="glass rounded-xl p-3 text-xs text-muted">Collections are optional. Professional topics are shown above.</div>
      )}
    </section>
  );
}

function ProfessionalBook() {
  const { slug } = useParams();
  const [topic, setTopic] = useState<TopicRecord | null>(null);
  const [chapters, setChapters] = useState<ContentRecord[]>([]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    Promise.all([listPublishedTopics(), listPublishedContent()]).then(([topics, content]) => {
      const t = topics.find((x) => x.slug === slug && normUniverse(x.universe) === 'professional') || null;
      setTopic(t);
      setChapters(t ? content.filter((c) => c.topicId === t.id) : []);
    });
  }, [slug]);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (scrolled / h) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!topic) return <div className="glass rounded-2xl p-6">Loading topic book...</div>;

  return (
    <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="fixed left-0 top-0 z-40 h-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
      <aside className="glass sticky top-24 h-fit rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted">Table of contents</p><h2 className="mt-2 text-xl font-semibold">{topic.title}</h2><ul className="mt-3 space-y-2 text-sm">{chapters.map((c) => <li key={c.id}><a href={`#${c.slug}`} className="text-muted hover:text-white">{c.title}</a></li>)}</ul></aside>
      <div><div className="glass mb-6 rounded-3xl p-8"><p className="text-xs uppercase tracking-[0.2em] text-muted">Interactive guide · {topic.displayStyle}</p><h1 className="mt-2 text-4xl font-semibold">{topic.title}</h1><p className="mt-3 text-muted">{topic.description}</p></div><div className="space-y-8">{chapters.map((c) => <section key={c.id} id={c.slug} className="glass rounded-2xl p-5"><h3 className="mb-3 text-2xl font-semibold">{c.title}</h3><ArticleView item={c} /></section>)}</div></div>
    </section>
  );
}

function PersonalHub() {
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [content, setContent] = useState<ContentRecord[]>([]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([listPublishedTopics(), listPublishedContent()]).then(([t, c]) => {
      const personalTopics = t.filter((x) => normUniverse(x.universe) === 'personal');
      const personalTopicIds = new Set(personalTopics.map((x) => x.id));
      setTopics(personalTopics);
      setContent(c.filter((item) => personalTopicIds.has(item.topicId)));
    }).catch(() => {
      setTopics([]);
      setContent([]);
    });
  }, []);

  const categories = [...new Set(topics.map((t) => t.category?.trim() || 'Uncategorized').filter(Boolean))];
  const allTags = [...new Set(content.flatMap((c) => c.tags || []))].slice(0, 12);

  return <section><h1 className="mb-2 text-3xl font-semibold">Personal</h1><p className="mb-4 text-muted">Philosophy, anime, books, hobbies, and reflective personal themes.</p><div className="glass mb-6 rounded-2xl p-4"><input className="w-full bg-transparent outline-none" placeholder="Search themes and notes" value={query} onChange={(e) => setQuery(e.target.value)} /><div className="mt-3 flex flex-wrap gap-2">{allTags.map((t)=><button key={t} onClick={()=>setTag(t)} className={`rounded-full px-3 py-1 text-xs ${tag===t?'bg-white/30':'bg-white/10'}`}>#{t}</button>)}<button className="text-xs" onClick={()=>setTag('')}>clear</button></div></div>{categories.map((cat) => { const t = topics.filter((x) => (x.category?.trim() || 'Uncategorized') === cat); const posts = searchContent(content.filter((c) => t.some((tt) => tt.id === c.topicId) && (!tag || (c.tags||[]).includes(tag))), query); return <section key={cat} className="mb-8"><h2 className="mb-3 text-2xl font-semibold">{cat}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <ContentCard key={p.id} item={p} onOpen={() => nav(`/personal/post/${p.slug}`)} />)}</div></section>; })}{topics.length===0 && <div className="glass rounded-xl p-4 text-sm text-muted">No personal topics are visible yet.</div>}</section>;
}


function PersonalPost() {
  const { slug } = useParams();
  const [item, setItem] = useState<ContentRecord | null>(null);
  useEffect(() => { listPublishedContent().then((c) => setItem(c.find((x) => x.slug === slug) || null)); }, [slug]);
  if (!item) return <div className="glass rounded-2xl p-6">Loading...</div>;
  return <ArticleView item={item} />;
}


function LoginPage() {
  const { verifyOtpCode, beginSecureLogin, loading, isAdmin, session } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (session && isAdmin) nav('/admin'); }, [isAdmin, nav, session]);

  return <section className="mx-auto max-w-md py-20"><div className="glass rounded-2xl p-6"><div className="flex items-center gap-3"><X1Mark size="md" /><h1 className="text-2xl font-semibold">Sign in</h1></div><AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}><input className="mt-4 w-full rounded-xl bg-white/10 p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" disabled={step === 2} autoComplete="email" />{step === 1 ? <><input className="mt-3 w-full rounded-xl bg-white/10 p-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" /><button className="mt-3 w-full rounded-xl bg-white/15 px-4 py-2" disabled={loading || !hasSupabaseCoreConfig || !email.trim() || !password} onClick={async()=>{ setError(''); setMessage(''); try { await beginSecureLogin(email.trim(), password); setStep(2); setMessage('If the request can be completed, you will receive an email shortly.'); } catch { setError(genericAuthError); } }}>{loading ? 'Processing...' : 'Continue'}</button></> : <><input className="mt-3 w-full rounded-xl bg-white/10 p-2 tracking-[0.35em]" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP code" inputMode="numeric" /><button className="mt-3 w-full rounded-xl bg-white/15 px-4 py-2" disabled={loading || !hasSupabaseCoreConfig || otp.trim().length < 6} onClick={async () => { setError(''); setMessage(''); try { await verifyOtpCode(otp.trim()); nav('/admin'); } catch { setError(genericAccessDenied); } }}>{loading ? 'Verifying...' : 'Verify'}</button><button className="mt-2 w-full rounded-xl bg-white/5 px-4 py-2 text-xs text-muted" onClick={() => { setStep(1); setOtp(''); setMessage(''); setError(''); }}>Back</button></>}</motion.div></AnimatePresence>{message && <p className="mt-3 text-xs text-emerald-300">{message}</p>}{error && <p className="mt-3 text-xs text-rose-300">{error}</p>}{!hasSupabaseCoreConfig && <p className="mt-3 text-xs text-amber-300">Authentication could not be completed.</p>}</div></section>;
}


function AdminPage() {
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
    if (import.meta.env.DEV) console.error('Admin request failed:', err);
    const message = err instanceof Error ? err.message.toLowerCase() : '';
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
  if (!isAdmin) return <div className="glass rounded-2xl p-6">Access could not be granted.</div>;

  const published = content.filter((c) => c.status === 'published').length;
  const drafts = content.length - published;
  const recentPublished = content.filter((c) => c.status === 'published').slice(0, 5);
  const recentTopics = topics.slice(0, 5);
  const saveTopic = async (payload: any) => {
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

  const saveContent = async (payload: any) => {
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const clean = { ...payload, contentType: payload.contentType || 'article' };
      selectedContent ? await updateContent(selectedContent.id, clean, token) : await createContent(clean, token);
      setSelectedContent(undefined);
      setNotice('Post saved.');
      try { await load(); } catch { /* keep success notice when write succeeds */ }
    } catch (e) {
      setError(friendly(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      {notice && <div className="glass rounded-xl border border-emerald-300/30 p-3 text-xs text-emerald-200">{notice}</div>}
      {error && <div className="glass rounded-xl border border-rose-300/30 p-3 text-xs text-rose-200">{error}</div>}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Admin Dashboard</p>
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
        <div className="glass rounded-xl p-3"><p className="text-xs text-muted">Unposted</p><p className="text-2xl font-semibold">{drafts}</p></div>
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
            {topics.map((t)=><div key={t.id} className="rounded-lg bg-white/5 p-2"><button className="text-left text-sm" onClick={()=>setSelectedTopic(t)}>{t.title}</button><button className="ml-2 text-xs text-rose-300" onClick={async()=>{ setNotice(''); setError(''); try { await deleteTopic(t.id, token); await load(); setNotice('Topic removed.'); } catch (e) { setError(friendly(e)); } }}>delete</button></div>)}
          </div>
          <p className="mb-2 mt-4 text-xs text-muted">Posts</p>
          <button className="mb-2 w-full rounded-xl bg-white/10 p-2 text-left" onClick={() => setSelectedContent(undefined)}>+ New Post</button>
          <div className="space-y-1">{content.slice(0,14).map((c)=><div key={c.id} className="rounded-lg bg-white/5 p-2"><button className="text-left text-sm" onClick={()=>setSelectedContent(c)}>{c.title}</button><button className="ml-2 text-xs text-rose-300" onClick={async()=>{ setNotice(''); setError(''); try { await deleteContent(c.id, token); await load(); setNotice('Post removed.'); } catch (e) { setError(friendly(e)); } }}>delete</button></div>)}</div>
        </aside>
        <div className="space-y-6">
          <TopicEditor value={selectedTopic} saving={saving} onSave={saveTopic} />
          <AdminEditor title="Create Post" topics={topics} value={selectedContent} saving={saving} onUpload={(f)=>uploadMedia(f,token)} onSave={saveContent} />
        </div>
      </div>
    </section>
  );
}

function NotFound() { return <section className="mx-auto max-w-xl py-24 text-center"><h1 className="text-4xl font-semibold">404</h1><Link to="/" className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2">Home</Link></section>; }

function Shell() {
  const [mode, setMode] = useState<ThemeMode>(() => initTheme());
  const location = useLocation();
  useEffect(() => { document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-purple', 'theme-rainbow'); document.documentElement.classList.add(themeMap[mode]); localStorage.setItem('theme', mode); }, [mode]);

  return (
    <div className="gradient-bg min-h-screen transition-colors duration-500">
      <Navbar mode={mode} onTheme={setMode} />
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        {!hasSupabaseCoreConfig && <div className="glass mb-4 rounded-xl p-3 text-xs text-amber-300">Configuration is incomplete. Some authenticated features may be unavailable.</div>}
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/professional" element={<ProfessionalHome />} />
              <Route path="/professional/topic/:slug" element={<ProfessionalBook />} />
              <Route path="/personal" element={<PersonalHub />} />
              <Route path="/personal/post/:slug" element={<PersonalPost />} />
              <Route path="/games" element={<GamesHub />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="mx-auto mt-8 flex max-w-6xl items-center justify-between border-t border-white/10 p-6 text-sm text-muted"><span>arharif © 2026</span><a href={config.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"><Linkedin size={16} /></a></footer>
    </div>
  );
}

export default function App() {
  return <ErrorBoundary><AuthProvider><Shell /></AuthProvider></ErrorBoundary>;
}
