import { content } from '@/content/data';
import { ContentItem } from '@/content/types';

export const getByUniverse = (universe: ContentItem['universe']) => content.filter((item) => item.universe === universe);
export const getByKind = (kind: ContentItem['kind']) => content.filter((item) => item.kind === kind);
export const getBySlug = (slug?: string) => content.find((item) => item.slug === slug);

export const queryItems = (items: ContentItem[], query: string, tag?: string) =>
  items.filter((item) => {
    const hit = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    const tagged = tag ? item.tags.includes(tag) || item.category.toLowerCase() === tag.toLowerCase() : true;
    return hit && tagged;
  });
