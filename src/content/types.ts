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
  palette?: string;
  mood?: string;
  coverImageUrl?: string;
  icon?: string;
  orderIndex: number;
  featured?: boolean;
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
  palette?: string;
  mood?: string;
  coverImageUrl?: string;
  icon?: string;
  orderIndex: number;
  featured?: boolean;
}

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface CollectionRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  universe: ThemeUniverse;
  category: string;
  coverImageUrl?: string;
  featured?: boolean;
}

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
  tags?: string[];
  collectionIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  featured?: boolean;
  favorite?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  topic?: TopicRecord;
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
  tags?: string[];
  collectionIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  featured?: boolean;
  favorite?: boolean;
  publishedAt?: string;
  authorName: string;
}
