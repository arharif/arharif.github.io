import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArticleView } from '@/components/ArticleView';
import { ItemCard, SelectorCard } from '@/components/Cards';
import { Navbar } from '@/components/Navbar';
import { content } from '@/content/data';
import { ContentItem } from '@/content/types';
import { queryItems } from '@/lib/content';
import { initTheme, themeMap, ThemeMode } from '@/lib/theme';

const sections: Record<string, ContentItem['kind'][]> = {
  Professional: ['blog'],
  'Books Summaries': ['book-summary'],
  'Anime Summaries': ['anime-summary'],
  'Anime Blogs': ['anime-blog'],
  'Series Summaries': ['series-summary'],
  'Series Blogs': ['series-blog'],
};

function Landing() {
  const navigate = useNavigate();
  return (
    <section id="landing" className="grid gap-6 py-10 md:grid-cols-2">
      <SelectorCard title="Professional" vibe="Cybersecurity · Strategy" desc="Authoritative writing on architecture, identity, cloud security, and detection engineering." onClick={() => navigate('/professional')} />
      <SelectorCard title="Personal" vibe="Books · Anime · Series" desc="Expressive cultural summaries, reflections, and storytelling with a purple-forward universe." onClick={() => navigate('/personal')} />
    </section>
  );
}

function UniversePage({ universe }: { universe: 'professional' | 'personal' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const universeItems = content.filter((item) => item.universe === universe);
  const filtered = queryItems(universeItems, query, tag);
  const allTags = [...new Set(universeItems.flatMap((item) => [item.category.toLowerCase(), ...item.tags]))].slice(0, 12);

  return (
    <>
      <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{universe}</p>
          <h1 className="text-3xl font-semibold">{universe === 'professional' ? 'Professional Intelligence Hub' : 'Personal Culture Hub'}</h1>
        </div>
        <Link to="/" className="rounded-xl bg-white/10 px-4 py-2">Switch Universe</Link>
      </section>
      <div className="glass mb-6 rounded-2xl p-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, tags, titles..." className="w-full bg-transparent outline-none" />
        <div className="mt-3 flex flex-wrap gap-2">{allTags.map((t) => <button onClick={() => setTag(t)} key={t} className={`rounded-full px-3 py-1 text-xs ${tag === t ? 'bg-white/30' : 'bg-white/10'}`}>{t}</button>)}<button className="text-xs" onClick={() => setTag('')}>Clear</button></div>
      </div>

      {Object.entries(sections).map(([title, kinds]) => {
        const items = filtered.filter((item) => kinds.includes(item.kind) && item.universe === universe);
        if (!items.length) return null;
        return (
          <section key={title} className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => <ItemCard key={item.slug} item={item} onOpen={(slug) => navigate(`/${universe}/post/${slug}`)} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

function PostPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const selected = content.find((c) => c.slug === slug);
  if (!selected) return <NotFound />;
  return (
    <section className="py-6">
      <button className="mb-4 rounded-lg bg-white/10 px-3 py-2" onClick={() => navigate(-1)}>← Back</button>
      <ArticleView item={selected} related={content.filter((c) => c.slug !== selected.slug && c.universe === selected.universe).slice(0, 3)} onOpen={(s) => navigate(`/${selected.universe}/post/${s}`)} />
    </section>
  );
}

function NotFound() {
  return (
    <section className="mx-auto max-w-2xl py-24 text-center">
      <p className="text-sm uppercase tracking-[0.25em] text-muted">404</p>
      <h1 className="mt-2 text-4xl font-semibold">Page drifted out of orbit</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">The route may be invalid or outdated. Use the button below to return to the home entry experience.</p>
      <Link to="/" className="mt-8 inline-block rounded-xl bg-white/10 px-4 py-2">Return Home</Link>
    </section>
  );
}

export default function App() {
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
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }} transition={{ duration: 0.28 }}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/professional" element={<UniversePage universe="professional" />} />
              <Route path="/personal" element={<UniversePage universe="personal" />} />
              <Route path="/:universe/post/:slug" element={<PostPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer id="contact" className="mx-auto mt-8 max-w-6xl border-t border-white/10 p-6 text-sm text-muted">© 2026 Arharif · Built for GitHub Pages user site · Connect: github.com/arharif · linkedin.com/in/arharif</footer>
    </div>
  );
}
