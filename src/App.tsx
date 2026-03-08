import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
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

export default function App() {
  const [mode, setMode] = useState<ThemeMode>(() => initTheme());
  const [universe, setUniverse] = useState<'landing' | 'professional' | 'personal'>('landing');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [selected, setSelected] = useState<ContentItem | null>(null);

  useMemo(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-purple');
    document.documentElement.classList.add(themeMap[mode]);
    localStorage.setItem('theme', mode);
  }, [mode]);

  const universeItems = content.filter((item) => (universe === 'professional' ? item.universe === 'professional' : item.universe === 'personal'));
  const filtered = queryItems(universeItems, query, tag);
  const allTags = [...new Set(universeItems.flatMap((item) => [item.category.toLowerCase(), ...item.tags]))].slice(0, 12);

  return (
    <div className="gradient-bg min-h-screen">
      <div className="fixed left-0 top-0 h-1 w-full bg-white/5"><motion.div className="h-1 bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: selected ? '100%' : '0%' }} /></div>
      <Navbar mode={mode} onTheme={setMode} />
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        {universe === 'landing' && (
          <section id="landing" className="grid gap-6 py-10 md:grid-cols-2">
            <SelectorCard title="Professional" vibe="Cybersecurity · Strategy" desc="Authoritative writing on architecture, identity, cloud security, and detection engineering." onClick={() => setUniverse('professional')} />
            <SelectorCard title="Personal" vibe="Books · Anime · Series" desc="Expressive cultural summaries, reflections, and storytelling with a purple-forward universe." onClick={() => setUniverse('personal')} />
          </section>
        )}

        {universe !== 'landing' && !selected && (
          <>
            <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{universe}</p>
                <h1 className="text-3xl font-semibold">{universe === 'professional' ? 'Professional Intelligence Hub' : 'Personal Culture Hub'}</h1>
              </div>
              <button className="rounded-xl bg-white/10 px-4 py-2" onClick={() => setUniverse('landing')}>Switch Universe</button>
            </section>
            <div className="glass mb-6 rounded-2xl p-4">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, tags, titles..." className="w-full bg-transparent outline-none" />
              <div className="mt-3 flex flex-wrap gap-2">{allTags.map((t)=><button onClick={()=>setTag(t)} key={t} className={`rounded-full px-3 py-1 text-xs ${tag===t?'bg-white/30':'bg-white/10'}`}>{t}</button>)}<button className="text-xs" onClick={()=>setTag('')}>Clear</button></div>
            </div>

            {Object.entries(sections).map(([title, kinds]) => {
              const items = filtered.filter((item) => kinds.includes(item.kind) && (universe === 'professional' ? item.universe === 'professional' : item.universe === 'personal'));
              if (!items.length) return null;
              return (
                <section key={title} className="mb-10">
                  <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ItemCard key={item.slug} item={item} onOpen={(slug)=>setSelected(content.find((i)=>i.slug===slug) || null)} />)}</div>
                </section>
              );
            })}
          </>
        )}

        {selected && (
          <section className="py-6">
            <button className="mb-4 rounded-lg bg-white/10 px-3 py-2" onClick={() => setSelected(null)}>← Back</button>
            <ArticleView item={selected} related={content.filter((c) => c.slug !== selected.slug && c.universe === selected.universe).slice(0, 3)} onOpen={(s)=>setSelected(content.find((c)=>c.slug===s) || null)} />
          </section>
        )}
      </main>
      <footer id="contact" className="mx-auto mt-8 max-w-6xl border-t border-white/10 p-6 text-sm text-muted">© 2026 X1 · Built for GitHub Pages · Connect: github.com/x1 · linkedin.com/in/x1</footer>
    </div>
  );
}
