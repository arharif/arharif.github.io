import { ContentRecord } from '@/content/types';

export function searchContent(items: ContentRecord[], query: string, tag = '') {
  const q = query.toLowerCase();
  return items.filter((item) => {
    const blob = `${item.title} ${item.excerpt} ${item.body} ${item.contentType}`.toLowerCase();
    const queryOk = q ? blob.includes(q) : true;
    const tagOk = tag ? blob.includes(tag.toLowerCase()) : true;
    return queryOk && tagOk;
  });
}
