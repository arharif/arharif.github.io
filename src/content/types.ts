export type Universe = 'professional' | 'personal';

export interface ContentItem {
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: string;
  featured?: boolean;
  cover: string;
  kind: 'blog' | 'book-summary' | 'anime-summary' | 'anime-blog' | 'series-summary' | 'series-blog';
  universe: Universe;
  body: string;
}
