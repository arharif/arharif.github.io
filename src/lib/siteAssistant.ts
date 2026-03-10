import { seedContent } from '@/content/data';
import { listPublishedContent } from '@/lib/cms';
import { mindmapNodes } from '@/data/securityMindmap';

export interface AssistantSource {
  title: string;
  route: string;
  excerpt: string;
}

export interface AssistantReply {
  text: string;
  sources: AssistantSource[];
}

const sitePages: AssistantSource[] = [
  { title: 'Landing', route: '/', excerpt: 'Entry point to professional and personal universes.' },
  { title: 'Professional', route: '/professional', excerpt: 'Technology, cybersecurity, and engineering knowledge.' },
  { title: 'Personal', route: '/personal', excerpt: 'Philosophy, books, anime, and reflective essays.' },
  { title: 'Security Map', route: '/security-mindmap', excerpt: 'Interactive thematic map of cybersecurity domains.' },
  { title: 'Games', route: '/games', excerpt: 'Lightweight cyber-playground mini games.' },
  { title: 'Submitting', route: '/submitting', excerpt: 'Manual email submission instructions.' },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();

export function sanitizeUserText(value: string) {
  return normalize(value).slice(0, 220);
}

async function loadPublishedSources(): Promise<AssistantSource[]> {
  try {
    const rows = await listPublishedContent();
    return rows.slice(0, 120).map((item) => ({
      title: item.title,
      route: item.topic?.universe === 'professional' ? `/professional/topic/${item.topic?.slug || ''}` : `/personal/post/${item.slug}`,
      excerpt: `${item.excerpt || ''} ${item.body.slice(0, 280)}`.trim(),
    }));
  } catch {
    return seedContent.filter((item) => item.status === 'published').slice(0, 80).map((item) => ({
      title: item.title,
      route: `/personal/post/${item.slug}`,
      excerpt: `${item.excerpt || ''} ${item.body.slice(0, 280)}`.trim(),
    }));
  }
}

export async function querySiteAssistant(rawQuery: string): Promise<AssistantReply> {
  const query = sanitizeUserText(rawQuery);
  if (!query) {
    return {
      text: 'I can summarize only information available on this website. Ask about Professional topics, Personal posts, Security Map themes, or Games.',
      sources: sitePages.slice(0, 3),
    };
  }

  const mapSources: AssistantSource[] = mindmapNodes.slice(0, 240).map((node) => ({
    title: node.label,
    route: '/security-mindmap',
    excerpt: `${node.description} ${node.whyItMatters}`,
  }));
  const contentSources = await loadPublishedSources();
  const sources = [...sitePages, ...contentSources, ...mapSources];

  const scored = sources
    .map((item) => {
      const hay = normalize(`${item.title} ${item.excerpt}`);
      const qTerms = query.split(' ');
      const score = qTerms.reduce((acc, term) => acc + (hay.includes(term) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.item);

  if (!scored.length) {
    return {
      text: 'I could not find that information on this site. Try asking about Security Architecture, Application Security, Security Operations, Risk, AI & Security, Professional topics, or Personal essays.',
      sources: [],
    };
  }

  const summary = scored.map((s) => `• ${s.title}: ${s.excerpt.slice(0, 140)}`).join('\n');
  return {
    text: `Here is a website-only summary for “${query}”:\n${summary}\n\nI only summarize content available on this website.`,
    sources: scored,
  };
}
