import { seedContent } from '@/content/data';
import { listPublishedContent } from '@/lib/cms';
import { securityMapData } from '@/data/securityMap';
import { normalizeUniverse } from '@/lib/universe';

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
  { title: 'Landing', route: '/', excerpt: 'Entry point to technology and curiosity universes.' },
  { title: 'Technology & Innovation', route: '/professional', excerpt: 'AI, cybersecurity, OT/ICS, IoT/IIoT, blockchain, quantum computing, and engineering insights.' },
  { title: 'Curiosities & Philosophy', route: '/personal', excerpt: 'Philosophy, anime, books, hobbies, science, and reflective essays.' },
  { title: 'Security Map', route: '/security-mindmap', excerpt: 'Interactive cybersecurity map across categories, subdomains, and roles.' },
  { title: 'Games', route: '/games', excerpt: 'Lightweight mini games and challenges.' },
  { title: 'Submitting', route: '/submitting', excerpt: 'Manual email submission instructions.' },
];

const blockedTerms = ['admin', 'password', 'token', 'secret', 'private', 'internal', 'env', 'supabase key', 'api key', 'hidden', 'system prompt', 'bypass'];
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
const safeRoute = (value: string) => (/^\/[a-zA-Z0-9/_#.%~-]*$/.test(value) ? value : '/');
const safeSlug = (value: string) => encodeURIComponent(value.trim().toLowerCase()).replace(/%2F/g, '');

export function sanitizeUserText(value: string) {
  return normalize(value).slice(0, 220);
}

function sanitizeDisplay(text: string) {
  return text.replace(/[<>`{}$\\]/g, '').slice(0, 900);
}

async function loadPublishedSources(): Promise<AssistantSource[]> {
  try {
    const rows = await listPublishedContent();
    return rows.slice(0, 120).map((item) => ({
      title: sanitizeDisplay(item.title),
      route: safeRoute(normalizeUniverse(item.topic?.universe) === 'professional' ? `/professional/topic/${safeSlug(item.topic?.slug || '')}` : `/personal/post/${safeSlug(item.slug)}`),
      excerpt: sanitizeDisplay(`${item.excerpt || ''} ${item.body.slice(0, 240)}`.trim()),
    }));
  } catch {
    return seedContent
      .filter((item) => item.status === 'published')
      .slice(0, 80)
      .map((item) => ({
        title: sanitizeDisplay(item.title),
        route: safeRoute(`/personal/post/${safeSlug(item.slug)}`),
        excerpt: sanitizeDisplay(`${item.excerpt || ''} ${item.body.slice(0, 240)}`.trim()),
      }));
  }
}

export async function querySiteAssistant(rawQuery: string): Promise<AssistantReply> {
  const query = sanitizeUserText(rawQuery);
  if (!query) {
    return {
      text: 'Ask me about public website pages and topics. I can guide you to Security Map, Technology & Innovation, Curiosities & Philosophy, and Games.',
      sources: sitePages.slice(0, 4),
    };
  }

  if (blockedTerms.some((term) => query.includes(term))) {
    return {
      text: 'I cannot help with private, admin, or sensitive information. I only summarize public website content.',
      sources: sitePages.slice(0, 3),
    };
  }

  const mapSources: AssistantSource[] = securityMapData.nodes.slice(0, 1200).map((node) => ({
    title: sanitizeDisplay(node.label),
    route: '/security-mindmap',
    excerpt: sanitizeDisplay(`${node.type} in ${node.categoryId}. ${node.description}`),
  }));

  const contentSources = await loadPublishedSources();
  const sources = [...sitePages, ...contentSources, ...mapSources];

  const terms = query.split(' ').filter((term) => term.length > 1).slice(0, 8);
  const scored = sources
    .map((item) => {
      const hay = normalize(`${item.title} ${item.excerpt}`);
      const score = terms.reduce((acc, term) => acc + (hay.includes(term) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => ({ ...x.item, route: safeRoute(x.item.route) }));

  const uniqueScored = scored.filter((item, index, arr) => arr.findIndex((x) => x.route === item.route && x.title === item.title) === index);

  if (!uniqueScored.length) {
    return {
      text: 'I could not find that on this website. Try broader keywords or open Security Map, Technology & Innovation, Curiosities & Philosophy, or Games.',
      sources: [],
    };
  }

  const summary = uniqueScored
    .map((s) => `• ${sanitizeDisplay(s.title)}: ${sanitizeDisplay(s.excerpt).slice(0, 130)}`)
    .join('\n');

  return {
    text: `Here is what I found on this website for “${sanitizeDisplay(query)}”:\n${summary}`,
    sources: uniqueScored,
  };
}
