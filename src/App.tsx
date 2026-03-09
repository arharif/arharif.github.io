import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AdminEditor } from '@/components/admin/AdminEditor';
import { TopicEditor } from '@/components/admin/TopicEditor';
import { ArticleView } from '@/components/ArticleView';
import { ContentCard, EntryCard } from '@/components/Cards';
import { Navbar } from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { createContent, createTopic, deleteContent, deleteTopic, listAdminContent, listAdminTopics, listPublishedContent, listPublishedTopics, updateContent, updateTopic, uploadMedia } from '@/lib/cms';
import { searchContent } from '@/lib/content';
import { appEnv, isSupabaseConfigured } from '@/lib/env';
import { initTheme, ThemeMode, themeMap } from '@/lib/theme';
import { ContentRecord, TopicRecord } from './content/types';

function Landing() {
  const nav = useNavigate();
  return <section className="grid gap-6 py-10 md:grid-cols-2"><EntryCard title="Professional" description="Interactive digital books for security knowledge topics." onClick={() => nav('/professional')} /><EntryCard title="Personal Culture Hub" description="Philosophy and Anime, Books, and Hobbies — curated and thematic." onClick={() => nav('/personal')} /></section>;
}

function ProfessionalHome() {
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const nav = useNavigate();
  useEffect(() => { listPublishedTopics().then((t) => setTopics(t.filter((x) => x.universe === 'professional'))); }, []);
  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold">Professional Knowledge Books</h1>
      <div className="grid gap-4 md:grid-cols-3">{topics.map((t) => <motion.button whileHover={{ y: -5 }} key={t.id} onClick={() => nav(`/professional/topic/${t.slug}`)} className="glass rounded-2xl p-5 text-left"><p className="text-xs text-muted">{t.category}</p><h3 className="mt-2 text-xl font-semibold">{t.title}</h3><p className="mt-2 text-sm text-muted">{t.description}</p></motion.button>)}</div>
    </section>
  );
}

function ProfessionalBook() {
  const { slug } = useParams();
  const [topic, setTopic] = useState<TopicRecord | null>(null);
  const [chapters, setChapters] = useState<ContentRecord[]>([]);
  useEffect(() => {
    Promise.all([listPublishedTopics(), listPublishedContent()]).then(([topics, content]) => {
      const t = topics.find((x) => x.slug === slug && x.universe === 'professional') || null;
      setTopic(t);
      setChapters(t ? content.filter((c) => c.topicId === t.id) : []);
    });
  }, [slug]);

  if (!topic) return <div className="glass rounded-2xl p-6">Loading topic book...</div>;

  return (
    <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="glass sticky top-24 h-fit rounded-2xl p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Table of contents</p>
        <h2 className="mt-2 text-xl font-semibold">{topic.title}</h2>
        <ul className="mt-3 space-y-2 text-sm">{chapters.map((c) => <li key={c.id}><a href={`#${c.slug}`} className="text-muted hover:text-white">{c.title}</a></li>)}</ul>
      </aside>
      <div>
        <div className="glass mb-6 rounded-3xl p-8"><p className="text-xs uppercase tracking-[0.2em] text-muted">Interactive guide · {topic.displayStyle}</p><h1 className="mt-2 text-4xl font-semibold">{topic.title}</h1><p className="mt-3 text-muted">{topic.description}</p></div>
        <div className="space-y-8">{chapters.map((c) => <section key={c.id} id={c.slug} className="glass rounded-2xl p-5"><h3 className="mb-3 text-2xl font-semibold">{c.title}</h3><ArticleView item={c} /></section>)}</div>
      </div>
    </section>
  );
}

function PersonalHub() {
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [content, setContent] = useState<ContentRecord[]>([]);
  const [query, setQuery] = useState('');
  const nav = useNavigate();
  useEffect(() => { Promise.all([listPublishedTopics(), listPublishedContent()]).then(([t, c]) => { setTopics(t.filter((x) => x.universe === 'personal')); setContent(c); }); }, []);
  const categories = ['Philosophy and Anime', 'Books', 'Hobbies'];
  return (
    <section>
      <h1 className="mb-2 text-3xl font-semibold">Personal Culture Hub</h1>
      <p className="mb-6 text-muted">Reflective, literary, and expressive spaces organized by theme.</p>
      <div className="glass mb-6 rounded-2xl p-4"><input className="w-full bg-transparent outline-none" placeholder="Search themes and notes" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {categories.map((cat) => {
        const t = topics.filter((x) => x.category === cat);
        const posts = searchContent(content.filter((c) => t.some((tt) => tt.id === c.topicId)), query);
        return <section key={cat} className="mb-8"><h2 className="mb-3 text-2xl font-semibold">{cat}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <ContentCard key={p.id} item={p} onOpen={() => nav(`/personal/post/${p.slug}`)} />)}</div></section>;
      })}
    </section>
  );
}

function PersonalPost() {
  const { slug } = useParams();
  const [item, setItem] = useState<ContentRecord | null>(null);
  useEffect(() => { listPublishedContent().then((c) => setItem(c.find((x) => x.slug === slug) || null)); }, [slug]);
  if (!item) return <div className="glass rounded-2xl p-6">Loading...</div>;
  return <ArticleView item={item} />;
}

function LoginPage() {
  const { sendOtp, verifyOtp, loading, isAdmin, session } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(appEnv.adminEmail);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (session && isAdmin) nav('/admin'); }, [isAdmin, nav, session]);

  return (
    <section className="mx-auto max-w-md py-20"><div className="glass rounded-2xl p-6"><h1 className="text-2xl font-semibold">Admin OTP Login</h1><p className="mt-2 text-sm text-muted">Email + OTP only. Authorized account: {appEnv.adminEmail}</p>
      {!isSupabaseConfigured && <p className="mt-3 text-amber-300 text-xs">Supabase env missing. Configure env vars to enable OTP auth.</p>}
      <input className="mt-4 w-full rounded-xl bg-white/10 p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button className="mt-3 rounded-xl bg-white/15 px-4 py-2" disabled={loading || !isSupabaseConfigured} onClick={async () => { setError(''); try { await sendOtp(email); setMessage('OTP sent to your email. Enter the OTP below or use magic link.'); } catch (e) { setError((e as Error).message); } }}>Send OTP</button>
      <input className="mt-4 w-full rounded-xl bg-white/10 p-2" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" />
      <button className="mt-3 rounded-xl bg-white/15 px-4 py-2" disabled={loading || !isSupabaseConfigured} onClick={async () => { setError(''); try { await verifyOtp(email, otp); nav('/admin'); } catch (e) { setError((e as Error).message); } }}>Verify OTP</button>
      {message && <p className="mt-3 text-xs text-emerald-300">{message}</p>}
      {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
    </div></section>
  );
}

function AdminPage() {
  const { session, isAdmin, logout } = useAuth();
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [content, setContent] = useState<ContentRecord[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicRecord | undefined>();
  const [selectedContent, setSelectedContent] = useState<ContentRecord | undefined>();
  const [saving, setSaving] = useState(false);

  const token = session?.access_token || '';
  const load = async () => {
    if (!token && isSupabaseConfigured) return;
    const [t, c] = await Promise.all([listAdminTopics(token), listAdminContent(token)]);
    setTopics(t); setContent(c);
  };
  useEffect(() => { load(); }, [token]);

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <div className="glass rounded-2xl p-6">Unauthorized. Only {appEnv.adminEmail} can access admin dashboard.</div>;

  return (
    <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="glass rounded-2xl p-4"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Admin</h2><button className="text-xs text-muted" onClick={async () => logout()}>Logout</button></div>
        <p className="mb-2 text-xs text-muted">Topics</p><button className="mb-2 w-full rounded-xl bg-white/10 p-2 text-left" onClick={() => setSelectedTopic(undefined)}>+ New Topic</button>
        <div className="space-y-1">{topics.map((t) => <div key={t.id} className="rounded-lg bg-white/5 p-2"><button className="text-left text-sm" onClick={() => setSelectedTopic(t)}>{t.title}</button><button className="ml-2 text-xs text-rose-300" onClick={async () => { await deleteTopic(t.id, token); await load(); }}>delete</button></div>)}</div>
        <p className="mb-2 mt-4 text-xs text-muted">Content</p><button className="mb-2 w-full rounded-xl bg-white/10 p-2 text-left" onClick={() => setSelectedContent(undefined)}>+ New Content</button>
        <div className="space-y-1">{content.slice(0, 12).map((c) => <div key={c.id} className="rounded-lg bg-white/5 p-2"><button className="text-left text-sm" onClick={() => setSelectedContent(c)}>{c.title}</button><button className="ml-2 text-xs text-rose-300" onClick={async () => { await deleteContent(c.id, token); await load(); }}>delete</button></div>)}</div>
      </aside>
      <div className="space-y-6">
        <TopicEditor value={selectedTopic} saving={saving} onSave={async (payload) => { setSaving(true); try { selectedTopic ? await updateTopic(selectedTopic.id, payload, token) : await createTopic(payload, token); await load(); setSelectedTopic(undefined); } finally { setSaving(false); } }} />
        <AdminEditor topics={topics} value={selectedContent} saving={saving} onUpload={(f) => uploadMedia(f, token)} onSave={async (payload) => { setSaving(true); try { selectedContent ? await updateContent(selectedContent.id, payload, token) : await createContent(payload, token); await load(); setSelectedContent(undefined); } finally { setSaving(false); } }} />
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
    <div className="gradient-bg min-h-screen transition-colors duration-500"><Navbar mode={mode} onTheme={setMode} /><main className="mx-auto max-w-6xl p-4 md:p-8"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}><Routes><Route path="/" element={<Landing />} /><Route path="/professional" element={<ProfessionalHome />} /><Route path="/professional/topic/:slug" element={<ProfessionalBook />} /><Route path="/personal" element={<PersonalHub />} /><Route path="/personal/post/:slug" element={<PersonalPost />} /><Route path="/login" element={<LoginPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="*" element={<NotFound />} /></Routes></motion.div></AnimatePresence></main><footer className="mx-auto mt-8 max-w-6xl border-t border-white/10 p-6 text-sm text-muted">© 2026 Arharif · Professional + Personal Culture Hub</footer></div>
  );
}

export default function App() { return <AuthProvider><Shell /></AuthProvider>; }
