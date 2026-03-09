import { CollectionRecord, ContentRecord, TopicRecord } from './types';

const now = '2026-01-10T00:00:00.000Z';

export const seedTopics: TopicRecord[] = [
  { id: 't-grc', slug: 'grc', title: 'GRC', description: 'Governance, Risk, and Compliance academy.', universe: 'professional', category: 'Risk Management', displayStyle: 'book', palette: 'indigo', mood: 'architectural', orderIndex: 1, featured: true, createdAt: now, updatedAt: now },
  { id: 't-iam', slug: 'iam', title: 'IAM', description: 'Identity and Access Management guide.', universe: 'professional', category: 'Identity', displayStyle: 'slides', palette: 'cyan', mood: 'technical', orderIndex: 2, createdAt: now, updatedAt: now },
  { id: 't-pci', slug: 'pci-dss', title: 'PCI DSS', description: 'Practical PCI DSS implementation journey.', universe: 'professional', category: 'Compliance', displayStyle: 'book', palette: 'violet', mood: 'structured', orderIndex: 3, createdAt: now, updatedAt: now },

  { id: 't-pa1', slug: 'existentialism-in-anime', title: 'Existentialism in Anime', description: 'Identity, freedom, and morality through anime narratives.', universe: 'personal', category: 'Philosophy and Anime', subcategory: 'Existentialism', displayStyle: 'article', palette: 'purple', mood: 'mystic', orderIndex: 1, featured: true, createdAt: now, updatedAt: now },
  { id: 't-b1', slug: 'literary-notes', title: 'Literary Notes', description: 'Reflections and distilled frameworks from books.', universe: 'personal', category: 'Books', subcategory: 'Reflections', displayStyle: 'article', palette: 'slate', mood: 'literary', orderIndex: 2, createdAt: now, updatedAt: now },
  { id: 't-h1', slug: 'creative-hobbies', title: 'Creative Hobbies', description: 'Personal craft, experiments, and routines.', universe: 'personal', category: 'Hobbies', subcategory: 'Learning Journeys', displayStyle: 'article', palette: 'amber', mood: 'warm', orderIndex: 3, createdAt: now, updatedAt: now },
];

export const seedCollections: CollectionRecord[] = [
  { id: 'col-grc', slug: 'grc-collection', title: 'GRC Collection', description: 'Best governance/risk/compliance guides.', universe: 'professional', category: 'Risk Management', featured: true },
  { id: 'col-anime-philosophy', slug: 'anime-philosophy', title: 'Anime Philosophy Collection', description: 'Narrative and symbolic philosophy deep-dives.', universe: 'personal', category: 'Philosophy and Anime', featured: true },
];

const chapter = (name: string) => `# ${name}\n\n## Why it matters\nHigh-quality systems are built through clarity, sequencing, and feedback.\n\n## Framework\n- Context\n- Controls\n- Metrics\n\n> Insight: structure beats intensity in long-term programs.`;

export const seedContent: ContentRecord[] = [
  { id: 'c1', topicId: 't-grc', slug: 'grc-foundations', title: 'GRC Foundations', excerpt: 'The operating model behind sustainable security governance.', body: chapter('GRC Foundations'), contentType: 'professional_chapter', status: 'published', tags: ['grc', 'risk'], collectionIds: ['col-grc'], featured: true, favorite: true, metaTitle: 'GRC Foundations', metaDescription: 'Governance and risk foundations.', publishedAt: '2026-01-02T00:00:00.000Z', createdAt: now, updatedAt: now, authorName: 'X1', videoUrl: 'https://www.youtube.com/embed/9B9wNf18W7s' },
  { id: 'c2', topicId: 't-grc', slug: 'grc-control-design', title: 'Control Design & Evidence', excerpt: 'Designing evidence-ready controls.', body: chapter('Control Design & Evidence'), contentType: 'professional_chapter', status: 'draft', tags: ['controls'], collectionIds: ['col-grc'], createdAt: now, updatedAt: now, authorName: 'X1' },
  { id: 'c3', topicId: 't-iam', slug: 'iam-control-plane', title: 'IAM as Security Control Plane', excerpt: 'Identity-centric architecture patterns.', body: chapter('IAM as Security Control Plane'), contentType: 'professional_chapter', status: 'published', tags: ['iam'], createdAt: now, updatedAt: now, authorName: 'X1' },
  { id: 'c4', topicId: 't-pa1', slug: 'freedom-and-identity', title: 'Freedom and Identity in Anime', excerpt: 'Narrative psychology and philosophical motifs.', body: chapter('Freedom and Identity in Anime'), contentType: 'personal_essay', status: 'published', collectionIds: ['col-anime-philosophy'], tags: ['anime', 'philosophy'], featured: true, favorite: true, createdAt: now, updatedAt: now, authorName: 'X1' },
  { id: 'c5', topicId: 't-b1', slug: 'book-reflections-systems', title: 'Book Reflections: Systems Thinking', excerpt: 'How books shape decision quality.', body: chapter('Book Reflections: Systems Thinking'), contentType: 'book_note', status: 'published', tags: ['books'], createdAt: now, updatedAt: now, authorName: 'X1' },
  { id: 'c6', topicId: 't-h1', slug: 'hobby-learning-loop', title: 'Hobby Learning Loop', excerpt: 'Building joyful routines with feedback loops.', body: chapter('Hobby Learning Loop'), contentType: 'hobby_note', status: 'archived', tags: ['hobbies'], createdAt: now, updatedAt: now, authorName: 'X1' },
];
