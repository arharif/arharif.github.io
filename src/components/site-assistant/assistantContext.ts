export type AssistantSectionKey = 'landing' | 'professional' | 'personal' | 'security' | 'games' | 'search' | 'submitting' | 'admin' | 'default';

export interface AssistantWelcome {
  section: AssistantSectionKey;
  title: string;
  body: string;
  hint: string;
  visual: string;
}

export function resolveAssistantSection(pathname: string): AssistantSectionKey {
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
  landing: {
    section: 'landing',
    title: 'Welcome to X1',
    body: 'I can help you navigate the Technology & Innovation and Curiosities & Philosophy areas quickly.',
    hint: 'Try: “Show me cybersecurity topics” or “Find curiosity essays.”',
    visual: '✨',
  },
  professional: {
    section: 'professional',
    title: 'Technology & Innovation Hub',
    body: 'I can summarize technology and innovation topics, chapters, and cybersecurity-focused content.',
    hint: 'Try: “Show IAM or GRC content.”',
    visual: '🛡️',
  },
  personal: {
    section: 'personal',
    title: 'Curiosities & Philosophy Hub',
    body: 'I can help you discover curiosity-driven reflections across philosophy, anime, books, hobbies, and science.',
    hint: 'Try: “Find posts about philosophy.”',
    visual: '🌙',
  },
  security: {
    section: 'security',
    title: 'Security Map',
    body: 'I can guide you through categories, subdomains, and role exploration paths.',
    hint: 'Try: “Where should I start in cloud security?”',
    visual: '🧭',
  },
  games: {
    section: 'games',
    title: 'Games Zone',
    body: 'I can point you to lightweight learning and trivia games, including cyber awareness.',
    hint: 'Try: “Recommend a cybersecurity game.”',
    visual: '🎮',
  },
  search: {
    section: 'search',
    title: 'Search Assistant',
    body: 'Use me to narrow down topics and pages when you are not sure where to click.',
    hint: 'Try: “Find Security Map and governance content.”',
    visual: '🔎',
  },
  submitting: {
    section: 'submitting',
    title: 'Submitting Guide',
    body: 'I can summarize the submission instructions and route you to the right page sections.',
    hint: 'Try: “Summarize the submission format.”',
    visual: '📩',
  },
  admin: {
    section: 'admin',
    title: 'Admin Area',
    body: 'I can only summarize public website information and general navigation help.',
    hint: 'I cannot provide private/admin or sensitive system details.',
    visual: '🔐',
  },
  default: {
    section: 'default',
    title: 'X1 Assistant',
    body: 'I can summarize available website content and guide you to relevant pages.',
    hint: 'Use concise keywords for best results.',
    visual: '💡',
  },
};

export function getAssistantWelcome(pathname: string): AssistantWelcome {
  return welcomes[resolveAssistantSection(pathname)];
}
