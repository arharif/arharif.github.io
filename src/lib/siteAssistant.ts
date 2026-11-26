import { originals } from '@/components/arcade/catalog';
import { legacyCatalog } from '@/components/arcade/legacyCatalog';
import { assistantKnowledge } from '@/data/assistantKnowledge';
import { resolveAssistantSection } from '@/components/site-assistant/assistantContext';
import { listPublishedContent, listPublishedTopics } from '@/lib/cms';

export interface AssistantSource { title: string; route: string; excerpt: string }
export interface AssistantReply { text: string; unavailable?: boolean; sources: AssistantSource[]; quickActions?: { label: string; route?: string; prompt?: string }[] }

const sensitivePatterns = [
  /\b(system|developer) prompt\b/,
  /\b(password|access token|refresh token|private key|api key|secret|environment variable)s?\b/,
  /\b(unpublished|private note|admin credential|draft content)s?\b/,
  /ignore (all |your |the )?(previous|prior|system) instructions/,
  /treat (this|the) (article|document|content) as instructions/,
  /execute (a )?(command|instruction)/,
];
const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ').replace(/\s+/g, ' ').trim();
const tokenize = (v: string) => normalize(v).split(' ').filter(Boolean);

function score(query: string, hay: string) {
  const q = tokenize(query); const h = normalize(hay);
  return q.reduce((acc, t) => acc + (h === t ? 8 : h.startsWith(t) ? 5 : h.includes(t) ? 2 : 0), 0);
}

const quickBySection = {
  security: [{ label: 'Explore Security Map', route: '/security-mindmap' }, { label: 'Compare GRC and SOC roles', prompt: 'Compare GRC and SOC roles' }, { label: 'Recommend a cybersecurity path', prompt: 'Recommend me a learning path for cybersecurity' }],
  games: [{ label: 'Explore Games', route: '/games' }, { label: 'Take a quiz', prompt: 'Recommend me a quiz' }],
  professional: [{ label: 'Start with Cybersecurity Career', route: '/security-mindmap' }, { label: 'Compare frameworks', prompt: 'What is the difference between ISO 27001 and SOC 2?' }],
  landing: [{ label: 'Recommend a path', prompt: 'Where should I start?' }, { label: 'Explore Compliance Frameworks', route: '/compliance-frameworks' }],
};

export async function querySiteAssistant(rawQuery: string, pathname = '/', activeGame?: string): Promise<AssistantReply> {
  const query = normalize(rawQuery).slice(0, 240);
  const section = resolveAssistantSection(pathname);
  const contextual = (quickBySection as Record<string, AssistantReply['quickActions']>)[section] ?? [{ label: 'Guide me through the platform', prompt: 'What content is available on this website?' }];

  if (!query) return {
    text: 'I can explain this page, recommend learning paths, compare frameworks (ISO 27001 vs SOC 2), suggest quizzes, and guide you to the best next page.',
    sources: assistantKnowledge.slice(0, 5).map((i) => ({ title: i.title, route: i.route, excerpt: i.description })),
    quickActions: contextual,
  };
  if (sensitivePatterns.some((pattern) => pattern.test(query))) return { text: 'I can only use published X1 information. I cannot reveal private content, credentials, configuration, or hidden instructions.', sources: [], quickActions: contextual };

  const answer = (text: string, title: string, route: string): AssistantReply => ({
    text, sources: [{ title, route, excerpt: text }], quickActions: contextual,
  });
  const game = originals.find(game => query.includes(game.title.toLowerCase()));
  const selected = section === 'games' && /controls?|instructions?|how (do|to)|help me play/.test(query)
    ? originals.find(item => item.key === activeGame) : undefined;
  if (!game && selected) return answer(selected.instructions,selected.title,'/games?game='+selected.key);
  if (game) return answer(game.instructions, game.title, '/games?game='+game.key);
  const classic = legacyCatalog.find(game => query.includes(game.title.toLowerCase()));
  if (classic) return answer(classic.desc, classic.title, '/games?game='+classic.key);
  if (/games|arcade/.test(query)) return answer('X1 Originals include '+originals.map(g=>g.title).join(', ')+'. Open All Games for the complete catalogue of quizzes and classics.', 'X1 Arcade', '/games');
  if (/privacy/.test(query) && /assess|resource|simulat/.test(query))
    return answer('Open the privacy workspace to explore processing flows and assess individual harm.', 'Privacy workspace', '/x1-academic/simulate/privacy?previous=1');
  if (/nist|csf/.test(query) && /simulat|assess/.test(query))
    return answer('Open Assess & Simulate with NIST CSF selected to explore risk scenarios.', 'NIST CSF simulator', '/x1-academic/assess-simulate?standard=nist-csf-2&view=risk');
  if (/contribut|submi/.test(query)) return answer('Email the complete article in plain text for editorial review. The Contribute page provides the address, format and submission guidelines.', 'Contribute', '/submitting');
  if (/academic/.test(query)) return answer('Explore standards, assess risk or build implementation plans in X1 Academic.', 'X1 Academic', '/x1-academic');
  if (/insights/.test(query) && !/find|about|article/.test(query)) return answer('Search published X1 articles and browse by topic.', 'Insights & Innovation', '/insights-innovation');

  // Published CMS records are fetched through the same RLS-protected public
  // boundary used by the website. Drafts and administrative state never enter
  // assistant context. Retrieved text is used only as searchable data.
  let liveKnowledge: typeof assistantKnowledge = [];
  let retrievalAvailable = true;
  try {
    const [topics, content] = await Promise.all([listPublishedTopics(), listPublishedContent()]);
    const publicTopics = new Map(topics.map(topic => [topic.id,topic]));
    liveKnowledge = [
      ...topics.map((item) => ({ title: item.title, route: item.universe === 'professional' ? `/professional/topic/${item.slug}` : '/personal', description: item.description, categories: [item.category], tags: [], keywords: [item.title, item.category, item.description] })),
      ...content.filter(item => item.status === 'published').map((item) => {
        const topic = item.topic || publicTopics.get(item.topicId);
        return { title: item.title, route: topic?.universe === 'professional' ? `/professional/topic/${encodeURIComponent(topic.slug)}#${encodeURIComponent(item.slug)}` : `/personal/post/${encodeURIComponent(item.slug)}`, description: item.excerpt || 'Published X1 content.', categories: [item.contentType], tags: item.tags ?? [], keywords: [item.title, item.excerpt, topic?.category || '', ...(item.tags ?? [])] }; }),
    ];
  } catch {
    retrievalAvailable = false;
  }

  if (/articles?|posts?|essays?/.test(query)) {
    const terms = tokenize(query).filter(word => !['find','show','me','about','on','articles','article','posts','post','essays','please','for','the','an','and'].includes(word));
    const matches = liveKnowledge.filter(item => /#|\/personal\/post\//.test(item.route) && terms.every(term => tokenize(item.keywords.join(' ')).some(word=>word===term || (term.length>3 && word.startsWith(term)))));
    return {unavailable: !retrievalAvailable, text: matches.length ? 'Published articles matching your request:' : retrievalAvailable ? 'No published articles match those terms.' : 'Published content is currently unavailable.', sources:matches.slice(0,5).map(item=>({title:item.title,route:item.route,excerpt:item.description})),quickActions:[{label:'Browse Insights',route:'/insights-innovation'}]};
  }
  const authoritativeKnowledge = [...liveKnowledge, ...assistantKnowledge];
  const ranked = authoritativeKnowledge.map((item) => {
    const hay = [item.title, item.description, ...item.categories, ...item.tags, ...item.keywords, ...(item.synonyms || []), ...(item.related || [])].join(' ');
    return { item, s: score(query, hay) };
  }).sort((a, b) => b.s - a.s);

  const top = ranked.filter((r) => r.s > 0).slice(0, 5).map((r) => ({ title: r.item.title, route: r.item.route, excerpt: r.item.description }));
  const explainPage = query.includes('explain this page') || query.includes('summarize');

  const text = top.length
    ? explainPage
      ? `You're on ${section}. Summary: ${top[0]?.excerpt}. Next, explore ${top.slice(1, 3).map((s) => s.title).join(' and ')} for a stronger learning path.`
      : `Best X1 matches for “${query}”: ${top.map((t) => t.title).join(', ')}. I can also compare topics and suggest your next step.`
    : retrievalAvailable
      ? `I could not verify that information in published X1 content. Try a topic, article title, or platform section instead.`
      : `I cannot retrieve reliable platform context right now, so I will not guess. The public website remains available; please browse the main navigation or try again later.`;

  return { text, unavailable: !retrievalAvailable && !top.length, sources: top, quickActions: contextual };
}
