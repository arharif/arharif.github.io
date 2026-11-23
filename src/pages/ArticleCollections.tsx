import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArticleView } from '@/components/ArticleView';
import { ContentCard } from '@/components/Cards';
import { TopicFilterBar } from '@/components/TopicFilterBar';
import { listPublishedTopics, listPublishedContent } from '@/lib/cms';
import { normalizeUniverse, universeMeta } from '@/lib/universe';
import { ContentRecord, TopicRecord } from '@/content/types';
const inferUniverseFromContentType = (contentType?: string | null) => normalizeUniverse(contentType);

async function loadPublishedGraph(): Promise<{ topics: TopicRecord[]; content: ContentRecord[] }> {
  // A failed public query is not an empty data set. Let consumers render an
  // explicit error and retry rather than silently discarding the failure.
  const [topics, content] = await Promise.all([listPublishedTopics(), listPublishedContent()]);
  const topicFromContent = content
    .map((item) => item.topic)
    .filter((item): item is TopicRecord => Boolean(item));
  const topicMap = new Map<string, TopicRecord>();
  [...topics, ...topicFromContent].forEach((topic) => topicMap.set(topic.id, topic));
  return { topics: [...topicMap.values()], content };
}

export function ProfessionalHome() {
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [posts, setPosts] = useState<ContentRecord[]>([]);
  const [activeTopic, setActiveTopic] = useState('all');
  const [query, setQuery] = useState('');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reload, setReload] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    let current = true;
    setLoadState('loading');
    loadPublishedGraph().then(({ topics: t, content }) => {
      if (!current) return;
      const professionalTopics = t.filter((x) => normalizeUniverse(x.universe) === 'professional');
      const professionalTopicIds = new Set(professionalTopics.map((x) => x.id));
      const professionalPosts = content.filter((item) => {
        if (professionalTopicIds.size > 0) return professionalTopicIds.has(item.topicId);
        const topicUniverse = normalizeUniverse(item.topic?.universe);
        return topicUniverse === 'professional' || inferUniverseFromContentType(item.contentType) === 'professional';
      });
      setTopics(professionalTopics);
      setPosts(professionalPosts);
      setLoadState('ready');
    }).catch(() => { if (current) setLoadState('error'); });

    return () => { current = false; };
  }, [reload]);

  const filterOptions = [{ id: 'all', label: 'All' }, ...topics.map((t) => ({ id: t.id, label: t.title }))];
  const filteredTopics = useMemo(() => {
    const base = activeTopic === 'all' ? topics : topics.filter((t) => t.id === activeTopic);
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return base;
    return base.filter((item) => `${item.title ?? ''} ${item.description ?? ''} ${item.category ?? ''}`.toLowerCase().includes(q));
  }, [activeTopic, query, topics]);
  const filteredPosts = useMemo(() => {
    const base = activeTopic === 'all' ? posts : posts.filter((p) => p.topicId === activeTopic);
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return base;
    return base.filter((item) => `${item.title ?? ''} ${item.excerpt ?? ''} ${item.contentType ?? ''} ${(item.tags ?? []).join(' ')}`.toLowerCase().includes(q));
  }, [activeTopic, posts, query]);

  return (
    <section>
      <h1 className="mb-2 text-3xl font-semibold">{universeMeta.professional.label}</h1>
      <p className="mb-5 text-muted">This universe is for everything related to the latest technology including AI, Cybersecurity, IoT, OT/ICS, Blockchain, and modern engineering insights.</p>

      <TopicFilterBar label="Technology & Innovation Topics" options={filterOptions} active={activeTopic} onChange={setActiveTopic} count={filteredPosts.length + filteredTopics.length} />

      <div className="glass mb-4 mt-4 rounded-2xl p-4">
        <input aria-label="Search technology and innovation content" className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm" placeholder="Search technology, AI, cybersecurity, cloud, blockchain…" value={query} onChange={(e) => setQuery(e.target.value.slice(0, 120))} />
        <p className="mt-2 text-xs text-muted">Try searching by topic, tag, or keyword.</p>
      </div>

      {loadState === 'loading' ? (
        <div className="glass mb-6 mt-4 rounded-2xl p-4 text-sm text-muted" role="status">Loading technology and innovation content…</div>
      ) : loadState === 'error' ? (
        <div className="glass mb-6 mt-4 rounded-2xl p-4 text-sm" role="alert">We couldn’t load this content. Please try again. <button className="ml-2 underline" onClick={() => setReload((value) => value + 1)}>Retry</button></div>
      ) : filteredTopics.length > 0 ? (
        <div className="mb-6 mt-4 grid gap-4 md:grid-cols-3">
          {filteredTopics.map((t)=><motion.button whileHover={{y:-5}} key={t.id} onClick={()=>nav(`/professional/topic/${t.slug}`)} className="glass rounded-2xl p-5 text-left"><p className="text-xs text-muted">{t.category} · {t.displayStyle}</p><h3 className="mt-2 text-xl font-semibold">{t.title}</h3><p className="mt-2 text-sm text-muted">{t.description}</p></motion.button>)}
        </div>
      ) : filteredPosts.length > 0 ? null : (
        <div className="glass mb-6 mt-4 rounded-2xl p-4 text-sm text-muted">No technology and innovation topics match this filter.</div>
      )}

      {loadState !== 'ready' ? null : filteredPosts.length > 0 ? (
        <>
          <h2 className="mb-3 text-xl font-semibold">Latest Technology & Innovation Posts</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((p) => { const topic = topics.find((t) => t.id === p.topicId); return <ContentCard key={p.id} item={p} onOpen={() => nav(topic ? `/professional/topic/${topic.slug}` : '/professional')} />; })}
          </div>
        </>
      ) : (
        <div className="glass mb-6 rounded-2xl p-4 text-sm text-muted">{posts.length === 0 ? 'No published content is available in this section yet.' : 'No content matches your current search or filters.'}</div>
      )}

    </section>
  );
}

export function TechnologyBook() {
  const { slug } = useParams();
  const [topic, setTopic] = useState<TopicRecord | null>(null);
  const [chapters, setChapters] = useState<ContentRecord[]>([]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    loadPublishedGraph().then(({ topics, content }) => {
      const t = topics.find((x) => x.slug === slug && normalizeUniverse(x.universe) === 'professional') || null;
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
      <div className="fixed left-0 top-0 z-40 h-1 progress-accent" style={{ width: `${progress}%` }} />
      <aside className="glass sticky top-24 h-fit rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted">Table of contents</p><h2 className="mt-2 text-xl font-semibold">{topic.title}</h2><ul className="mt-3 space-y-2 text-sm">{chapters.map((c) => <li key={c.id}><a href={`#${c.slug}`} className="text-muted hover:text-white">{c.title}</a></li>)}</ul></aside>
      <div><div className="glass mb-6 rounded-3xl p-8"><p className="text-xs uppercase tracking-[0.2em] text-muted">Interactive guide · {topic.displayStyle}</p><h1 className="mt-2 text-4xl font-semibold">{topic.title}</h1><p className="mt-3 text-muted">{topic.description}</p></div><div className="space-y-8">{chapters.map((c) => <section key={c.id} id={c.slug} className="glass rounded-2xl p-5"><h3 className="mb-3 text-2xl font-semibold">{c.title}</h3><ArticleView item={c} /></section>)}</div></div>
    </section>
  );
}

export function CuriositiesHub() {
  const safeArray = <T,>(value: T[] | undefined | null): T[] => (Array.isArray(value) ? value : []);
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [content, setContent] = useState<ContentRecord[]>([]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [activeTopic, setActiveTopic] = useState('all');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reload, setReload] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    let current = true;
    setLoadState('loading');
    loadPublishedGraph().then(({ topics: t, content: c }) => {
      if (!current) return;
      const personalTopics = t.filter((x) => normalizeUniverse(x.universe) === 'personal');
      const personalTopicIds = new Set(personalTopics.map((x) => x.id));
      const personalContent = c.filter((item) => {
        if (personalTopicIds.size > 0) return personalTopicIds.has(item.topicId);
        const topicUniverse = normalizeUniverse(item.topic?.universe);
        return topicUniverse === 'personal' || inferUniverseFromContentType(item.contentType) === 'personal';
      });
      setTopics(personalTopics);
      setContent(personalContent);
      setLoadState('ready');
    }).catch(() => { if (current) setLoadState('error'); });
    return () => { current = false; };
  }, [reload]);

  const allTags = [...new Set(safeArray(content).flatMap((c) => safeArray(c.tags)))].slice(0, 16);
  const filterOptions = [{ id: 'all', label: 'All' }, ...topics.map((t) => ({ id: t.id, label: t.title }))];

  const filteredByTopic = activeTopic === 'all' ? safeArray(content) : safeArray(content).filter((item) => item.topicId === activeTopic);
  const searched = useMemo(() => {
    const base = filteredByTopic.filter((c) => (!tag || safeArray(c.tags).includes(tag)));
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return base;
    return base.filter((item) =>
      `${item.title ?? ''} ${item.excerpt ?? ''} ${item.contentType ?? ''} ${safeArray(item.tags).join(' ')}`.toLowerCase().includes(q),
    );
  }, [filteredByTopic, query, tag]);

  return (
    <section>
      <h1 className="mb-2 text-3xl font-semibold">{universeMeta.personal.label}</h1>
      <p className="mb-4 text-muted">{universeMeta.personal.description}</p>

      <TopicFilterBar label="Curiosities & Philosophy Topics" options={filterOptions} active={activeTopic} onChange={setActiveTopic} count={searched.length} />

      <div className="mb-6 mt-4 rounded-2xl border border-white/10 bg-transparent p-3">
        <label className="personal-premium-search">
          <Search size={16} className="personal-premium-search__icon" aria-hidden="true" />
          <input
            className="personal-premium-search__input"
            placeholder="Search philosophy, anime, books, science, reflections…"
            aria-label="Search curiosities and philosophy content"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 140))}
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map((t)=><button key={t} onClick={()=>setTag(t)} className={`rounded-full px-3 py-1 text-xs ${tag===t?'bg-white/30':'bg-white/10'}`}>#{t}</button>)}
          <button className="text-xs" onClick={()=>setTag('')}>clear</button>
        </div>
        <p className="mt-2 text-xs text-muted">Search by title, description, category, tags, or excerpt.</p>
      </div>

      {loadState === 'loading' ? (
        <div className="glass rounded-xl p-4 text-sm text-muted" role="status">Loading curiosities and philosophy content…</div>
      ) : loadState === 'error' ? (
        <div className="glass rounded-xl p-4 text-sm" role="alert">We couldn’t load this content. Please try again. <button className="ml-2 underline" onClick={() => setReload((value) => value + 1)}>Retry</button></div>
      ) : searched.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {searched.map((p) => <ContentCard key={p.id} item={p} onOpen={() => nav(`/personal/post/${p.slug}`)} />)}
        </div>
      ) : (
        <div className="glass rounded-xl p-4 text-sm text-muted">{content.length === 0 ? 'No published content is available in this section yet.' : 'No content matches your current search or filters.'}</div>
      )}
    </section>
  );
}

export function CuriosityPost() {
  const { slug } = useParams();
  const [item, setItem] = useState<ContentRecord | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  useEffect(() => {
    let current = true;
    setLoadState('loading');
    listPublishedContent().then((content) => {
      if (!current) return;
      const match = content.find((entry) => entry.slug === slug) || null;
      setItem(match);
      setLoadState(match ? 'ready' : 'not-found');
    }).catch(() => { if (current) setLoadState('error'); });
    return () => { current = false; };
  }, [slug]);
  if (loadState === 'loading') return <div className="glass rounded-2xl p-6" role="status">Loading article…</div>;
  if (loadState === 'error') return <div className="glass rounded-2xl p-6" role="alert">We couldn’t load this content. Please try again.</div>;
  if (loadState === 'not-found' || !item) return <div className="glass rounded-2xl p-6">This published article could not be found.</div>;
  return <ArticleView item={item} />;
}


