export type ThemeUniverse = 'professional' | 'personal';
export type PersonalCategory = 'Philosophy and Anime' | 'Books' | 'Hobbies';

export type TopicDisplayStyle = 'book' | 'slides' | 'article';

export interface TopicRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  universe: ThemeUniverse;
  category: string;
  subcategory?: string;
  displayStyle: TopicDisplayStyle;
  coverImageUrl?: string;
  icon?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicInput {
  slug: string;
  title: string;
  description: string;
  universe: ThemeUniverse;
  category: string;
  subcategory?: string;
  displayStyle: TopicDisplayStyle;
  coverImageUrl?: string;
  icon?: string;
  orderIndex: number;
}

export type ContentStatus = 'draft' | 'published';

export interface ContentRecord {
  id: string;
  topicId: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  contentType: string;
  coverImageUrl?: string;
  videoUrl?: string;
  status: ContentStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

export interface ContentInput {
  topicId: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  contentType: string;
  coverImageUrl?: string;
  videoUrl?: string;
  status: ContentStatus;
  publishedAt?: string;
  authorName: string;
}
