import { ContentRecord, TopicRecord } from './types';

const now = '2026-01-10T00:00:00.000Z';

export const seedTopics: TopicRecord[] = [
  { id: 't-grc', slug: 'grc', title: 'GRC', description: 'Governance, Risk, and Compliance playbook.', universe: 'professional', category: 'Risk Management', displayStyle: 'book', orderIndex: 1, createdAt: now, updatedAt: now, coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80&auto=format&fit=crop' },
  { id: 't-iam', slug: 'iam', title: 'IAM', description: 'Identity and Access Management guide.', universe: 'professional', category: 'Identity', displayStyle: 'slides', orderIndex: 2, createdAt: now, updatedAt: now },
  { id: 't-pci', slug: 'pci-dss', title: 'PCI DSS', description: 'Practical PCI DSS implementation journey.', universe: 'professional', category: 'Compliance', displayStyle: 'book', orderIndex: 3, createdAt: now, updatedAt: now },

  { id: 't-pa1', slug: 'existentialism-in-anime', title: 'Existentialism in Anime', description: 'Identity, freedom, and morality through anime narratives.', universe: 'personal', category: 'Philosophy and Anime', subcategory: 'Existentialism', displayStyle: 'article', orderIndex: 1, createdAt: now, updatedAt: now },
  { id: 't-b1', slug: 'literary-notes', title: 'Literary Notes', description: 'Reflections and distilled frameworks from books.', universe: 'personal', category: 'Books', subcategory: 'Reflections', displayStyle: 'article', orderIndex: 2, createdAt: now, updatedAt: now },
  { id: 't-h1', slug: 'creative-hobbies', title: 'Creative Hobbies', description: 'Personal craft, experiments, and routines.', universe: 'personal', category: 'Hobbies', subcategory: 'Learning Journeys', displayStyle: 'article', orderIndex: 3, createdAt: now, updatedAt: now },
];

const chapter = (name: string) => `# ${name}\n\n## Why it matters\nHigh-quality systems are built through clarity, sequencing, and feedback.\n\n## Framework\n- Context\n- Controls\n- Metrics\n\n![Concept visual](https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop)\n\n> Insight: structure beats intensity in long-term programs.`;

export const seedContent: ContentRecord[] = [
  { id: 'c1', topicId: 't-grc', slug: 'grc-foundations', title: 'GRC Foundations', excerpt: 'The operating model behind sustainable security governance.', body: chapter('GRC Foundations'), contentType: 'professional_chapter', status: 'published', publishedAt: '2026-01-02T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'Arharif', videoUrl: 'https://www.youtube.com/embed/9B9wNf18W7s' },
  { id: 'c2', topicId: 't-grc', slug: 'grc-control-design', title: 'Control Design & Evidence', excerpt: 'Designing evidence-ready controls.', body: chapter('Control Design & Evidence'), contentType: 'professional_chapter', status: 'published', publishedAt: '2026-01-03T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'Arharif' },
  { id: 'c3', topicId: 't-iam', slug: 'iam-control-plane', title: 'IAM as Security Control Plane', excerpt: 'Identity-centric architecture patterns.', body: chapter('IAM as Security Control Plane'), contentType: 'professional_chapter', status: 'published', publishedAt: '2025-12-01T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'Arharif' },
  { id: 'c4', topicId: 't-pci', slug: 'pci-dss-scope', title: 'PCI DSS Scope Reduction', excerpt: 'Reducing compliance blast radius.', body: chapter('PCI DSS Scope Reduction'), contentType: 'professional_chapter', status: 'published', publishedAt: '2025-11-01T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'Arharif' },
  { id: 'c5', topicId: 't-pa1', slug: 'freedom-and-identity', title: 'Freedom and Identity in Anime', excerpt: 'Narrative psychology and philosophical motifs.', body: chapter('Freedom and Identity in Anime'), contentType: 'personal_essay', status: 'published', publishedAt: '2025-10-01T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'Arharif' },
  { id: 'c6', topicId: 't-b1', slug: 'book-reflections-systems', title: 'Book Reflections: Systems Thinking', excerpt: 'How books shape decision quality.', body: chapter('Book Reflections: Systems Thinking'), contentType: 'book_note', status: 'published', publishedAt: '2025-09-01T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'Arharif' },
  { id: 'c7', topicId: 't-h1', slug: 'hobby-learning-loop', title: 'Hobby Learning Loop', excerpt: 'Building joyful routines with feedback loops.', body: chapter('Hobby Learning Loop'), contentType: 'hobby_note', status: 'published', publishedAt: '2025-08-01T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'Arharif' },
];
