import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AdminEditor } from '@/components/admin/AdminEditor';
import { ArticleView } from '@/components/ArticleView';
import { ContentCard, EntryCard } from '@/components/Cards';
import { Navbar } from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { createContent, deleteContent, getBySlug, listAdmin, listPublished, updateContent, uploadMedia } from '@/lib/cms';
import { searchContent } from '@/lib/content';
import { isSupabaseConfigured } from '@/lib/env';
import { initTheme, themeMap, ThemeMode } from '@/lib/theme';
import { ContentRecord } from './content/types';

function Landing() {
  const navigate = useNavigate();
  return (
    <section className="grid gap-6 py-10 md:grid-cols-2">
      <EntryCard title="Professional" description="Cybersecurity architecture, engineering systems, and leadership insights." onClick={() => navigate('/professional')} />
      <EntryCard title="Personal" description="Books, anime, and series reflections in a curated purple-forward universe." onClick={() => navigate('/personal')} />
    </section>
  );
}

function UniversePage({ universe }: { universe: 'professional' | 'personal' }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    listPublished().then((rows) => setItems(rows.filter((r) => r.universe === universe)));
  }, [universe]);

  const tags = [...new Set(items.flatMap((i) => [i.category.toLowerCase(), ...i.tags]))].slice(0, 14);
  const filtered = searchContent(items, query, tag);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{universe}</p>
          <h1 className="text-3xl font-semibold">{universe === 'professional' ? 'Professional Intelligence Hub' : 'Personal Culture Hub'}</h1>
        </div>
        <Link to="/" className="rounded-xl bg-white/10 px-4 py-2">Switch</Link>
      </div>
      <div className="glass mb-6 rounded-2xl p-4">
        <input className="w-full bg-transparent outline-none" placeholder="Search posts, tags, categories" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => <button key={t} onClick={() => setTag(t)} className={`rounded-full px-3 py-1 text-xs ${tag === t ? 'bg-white/30' : 'bg-white/10'}`}>{t}</button>)}
          <button className="text-xs" onClick={() => setTag('')}>Clear</button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => <ContentCard key={item.id} item={item} onOpen={() => navigate(`/${universe}/post/${item.slug}`)} />)}
      </div>
      {!filtered.length && <div className="glass mt-6 rounded-2xl p-6 text-sm text-muted">No published content found for this filter.</div>}
    </section>
  );
}

function PostPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [item, setItem] = useState<ContentRecord | null>(null);

  useEffect(() => {
    if (!slug) return;
    getBySlug(slug).then(setItem);
  }, [slug]);

  if (!item) return <div className="glass rounded-2xl p-6">Loading post...</div>;
  return (
    <section className="py-4">
      <button className="mb-4 rounded-lg bg-white/10 px-3 py-2" onClick={() => navigate(-1)}>← Back</button>
      <ArticleView item={item} />
    </section>
  );
}

function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <section className="mx-auto max-w-md py-20">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-sm text-muted">Authorized admin accounts only.</p>
        {!isSupabaseConfigured && <p className="mt-3 text-xs text-amber-300">Supabase env not configured. Admin features run in local fallback mode.</p>}
        <input className="mt-4 w-full rounded-xl bg-white/10 p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="mt-3 w-full rounded-xl bg-white/10 p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        <button
          className="mt-4 rounded-xl bg-white/15 px-4 py-2"
          disabled={loading}
          onClick={async () => {
            try {
              await login(email, password);
              navigate('/admin');
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </section>
  );
}

function AdminPage() {
  const { session, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [selected, setSelected] = useState<ContentRecord | undefined>();
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!session?.access_token && isSupabaseConfigured) return;
    const rows = await listAdmin(session?.access_token || '');
    setItems(rows);
  };

  useEffect(() => {
    load();
  }, [session?.access_token]);

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <div className="glass rounded-2xl p-6">Unauthorized account. Configure <code>VITE_ADMIN_EMAILS</code> to include this email.</div>;

  return (
    <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="glass rounded-2xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Admin Dashboard</h2>
          <button onClick={async () => { await logout(); navigate('/'); }} className="text-xs text-muted">Logout</button>
        </div>
        <button onClick={() => setSelected(undefined)} className="mb-3 w-full rounded-xl bg-white/10 px-3 py-2 text-left">+ New Content</button>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl bg-white/5 p-2">
              <button className="text-left text-sm" onClick={() => setSelected(item)}>{item.title}</button>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="rounded bg-white/10 px-2 py-0.5">{item.status}</span>
                <button className="text-rose-300" onClick={async () => {
                  await deleteContent(item.id, session.access_token);
                  await load();
                  setSelected(undefined);
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </aside>
      <AdminEditor
        value={selected}
        saving={saving}
        onUpload={(file) => uploadMedia(file, session.access_token)}
        onSave={async (payload) => {
          setSaving(true);
          try {
            if (selected) {
              await updateContent(selected.id, payload, session.access_token);
            } else {
              await createContent(payload, session.access_token);
            }
            await load();
            setSelected(undefined);
          } finally {
            setSaving(false);
          }
        }}
      />
    </section>
  );
}

function NotFound() {
  return (
    <section className="mx-auto max-w-xl py-24 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="mt-2 text-4xl font-semibold">Page drifted off-grid</h1>
      <p className="mt-4 text-muted">This route does not exist. Return to the main entry.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-white/10 px-4 py-2">Return Home</Link>
    </section>
  );
}

function Shell() {
  const [mode, setMode] = useState<ThemeMode>(() => initTheme());
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-purple');
    document.documentElement.classList.add(themeMap[mode]);
    localStorage.setItem('theme', mode);
  }, [mode]);

  return (
    <div className="gradient-bg min-h-screen">
      <Navbar mode={mode} onTheme={setMode} />
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/professional" element={<UniversePage universe="professional" />} />
              <Route path="/personal" element={<UniversePage universe="personal" />} />
              <Route path="/:universe/post/:slug" element={<PostPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="mx-auto mt-8 max-w-6xl border-t border-white/10 p-6 text-sm text-muted">© 2026 Arharif · Premium personal website · Built with React + Supabase + GitHub Pages</footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
