import { ContentRecord } from '@/content/types';

export function searchContent(items: ContentRecord[], query: string, tag = '') {
  const q = query.toLowerCase();
  return items.filter((item) => {
    const full = `${item.title} ${item.excerpt} ${item.tags.join(' ')} ${item.category}`.toLowerCase();
    const queryOk = q ? full.includes(q) : true;
    const tagOk = tag ? item.tags.includes(tag) || item.category.toLowerCase() === tag.toLowerCase() : true;
    return queryOk && tagOk;
  });
}
