export type ThemeUniverse = 'professional' | 'personal';

export type ContentType =
  | 'professional_blog'
  | 'book_summary'
  | 'anime_summary'
  | 'anime_blog'
  | 'series_summary'
  | 'series_blog';

export type ContentStatus = 'draft' | 'published';

export interface ContentRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  contentType: ContentType;
  universe: ThemeUniverse;
  category: string;
  tags: string[];
  coverImageUrl?: string;
  videoUrl?: string;
  status: ContentStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

export interface ContentInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  contentType: ContentType;
  universe: ThemeUniverse;
  category: string;
  tags: string[];
  coverImageUrl?: string;
  videoUrl?: string;
  status: ContentStatus;
  publishedAt?: string;
  authorName: string;
}
