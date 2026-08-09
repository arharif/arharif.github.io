import { assistantKnowledge } from '@/data/assistantKnowledge';
import { resolveAssistantSection } from '@/components/site-assistant/assistantContext';
import { listPublishedContent, listPublishedTopics } from '@/lib/cms';

export interface AssistantSource { title: string; route: string; excerpt: string }
export interface AssistantReply { text: string; sources: AssistantSource[]; quickActions?: { label: string; route?: string; prompt?: string }[] }

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

export async function querySiteAssistant(rawQuery: string, pathname = '/'): Promise<AssistantReply> {
  const query = normalize(rawQuery).slice(0, 240);
  const section = resolveAssistantSection(pathname);
  const contextual = (quickBySection as Record<string, AssistantReply['quickActions']>)[section] ?? [{ label: 'Guide me through the platform', prompt: 'What content is available on this website?' }];

  if (!query) return {
    text: 'I can explain this page, recommend learning paths, compare frameworks (ISO 27001 vs SOC 2), suggest quizzes, and guide you to the best next page.',
    sources: assistantKnowledge.slice(0, 5).map((i) => ({ title: i.title, route: i.route, excerpt: i.description })),
    quickActions: contextual,
  };
  if (sensitivePatterns.some((pattern) => pattern.test(query))) return { text: 'I can only use published X1 information. I cannot reveal private content, credentials, configuration, or hidden instructions.', sources: [], quickActions: contextual };

  // Published CMS records are fetched through the same RLS-protected public
  // boundary used by the website. Drafts and administrative state never enter
  // assistant context. Retrieved text is used only as searchable data.
  let liveKnowledge: typeof assistantKnowledge = [];
  let retrievalAvailable = true;
  try {
    const [topics, content] = await Promise.all([listPublishedTopics(), listPublishedContent()]);
    liveKnowledge = [
      ...topics.map((item) => ({ title: item.title, route: item.universe === 'professional' ? `/professional/topic/${item.slug}` : '/personal', description: item.description, categories: [item.category], tags: [], keywords: [item.title, item.category, item.description] })),
      ...content.map((item) => ({ title: item.title, route: item.topic?.universe === 'professional' && item.topic ? `/professional/topic/${item.topic.slug}` : `/personal/post/${item.slug}`, description: item.excerpt || 'Published X1 content.', categories: [item.contentType], tags: item.tags ?? [], keywords: [item.title, item.excerpt, ...(item.tags ?? [])] })),
    ];
  } catch {
    retrievalAvailable = false;
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

  return { text, sources: top, quickActions: contextual };
}
