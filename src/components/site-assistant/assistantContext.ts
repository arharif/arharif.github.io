export type AssistantSectionKey = 'landing' | 'academic' | 'insights' | 'professional' | 'personal' | 'security' | 'games' | 'search' | 'submitting' | 'admin' | 'default';

export interface AssistantWelcome {
  section: AssistantSectionKey;
  title: string;
  body: string;
  hint: string;
}

export function resolveAssistantSection(pathname: string): AssistantSectionKey {
  if (pathname.startsWith('/x1-academic')) return 'academic';
  if (pathname === '/insights-innovation') return 'insights';
  if (pathname === '/') return 'landing';
  if (pathname.startsWith('/professional')) return 'professional';
  if (pathname.startsWith('/personal')) return 'personal';
  if (pathname.startsWith('/security-mindmap') || pathname.startsWith('/Security_Mindmap')) return 'security';
  if (pathname.startsWith('/games')) return 'games';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/submitting')) return 'submitting';
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return 'admin';
  return 'default';
}

const welcomes: Record<AssistantSectionKey, AssistantWelcome> = {
  academic: {
    section: 'academic', title: 'Academic guide',
    body: 'Find a framework, open a simulator or explore privacy assessments.',
    hint: 'Try “Show me the NIST CSF simulator.”',
  },
  insights: {
    section: 'insights', title: 'Explore Insights',
    body: 'Find published articles by topic, title and keyword.',
    hint: 'Try “Find philosophy articles.”',
  },
  landing: {
    section: 'landing',
    title: 'Welcome to X1',
    body: 'Explore X1 Academic, find a published article or choose a game.',
    hint: 'Try: “Show me cybersecurity topics” or “Find curiosity essays.”',
  },
  professional: {
    section: 'professional',
    title: 'Technology & Innovation Hub',
    body: 'I can summarize technology and innovation topics, chapters, and cybersecurity-focused content.',
    hint: 'Try: “Show IAM or GRC content.”',
  },
  personal: {
    section: 'personal',
    title: 'Curiosities & Philosophy Hub',
    body: 'I can help you discover curiosity-driven reflections across philosophy, anime, books, hobbies, and science.',
    hint: 'Try: “Find posts about philosophy.”',
  },
  security: {
    section: 'security',
    title: 'Security Map',
    body: 'I can guide you through categories, subdomains, and role exploration paths.',
    hint: 'Try: “Where should I start in cloud security?”',
  },
  games: {
    section: 'games',
    title: 'X1 Arcade',
    body: 'Find arcade games, read the controls or open a learning quiz.',
    hint: 'Try: “Recommend a cybersecurity game.”',
  },
  search: {
    section: 'search',
    title: 'Search Assistant',
    body: 'Use me to narrow down topics and pages when you are not sure where to click.',
    hint: 'Try: “Find Security Map and governance content.”',
  },
  submitting: {
    section: 'submitting',
    title: 'Submitting Guide',
    body: 'I can summarize the submission instructions and route you to the right page sections.',
    hint: 'Try: “Summarize the submission format.”',
  },
  admin: {
    section: 'admin',
    title: 'Admin Area',
    body: 'I can only summarize public website information and general navigation help.',
    hint: 'I cannot provide private/admin or sensitive system details.',
  },
  default: {
    section: 'default',
    title: 'X1 Assistant',
    body: 'I can summarize available website content and guide you to relevant pages.',
    hint: 'Use concise keywords for best results.',
  },
};

export function getAssistantWelcome(pathname: string): AssistantWelcome {
  return welcomes[resolveAssistantSection(pathname)];
}
