import { ContentRecord } from '@/content/types';
import { renderMarkdown } from '@/lib/markdown';

const safeMediaUrl = (value?: string) => (value && /^https:\/\//.test(value) ? value : undefined);

export function ArticleView({ item }: { item: ContentRecord }) {
  return (
    <article className="mx-auto max-w-4xl">
      {safeMediaUrl(item.coverImageUrl) && <div className="mb-4 h-56 overflow-hidden rounded-2xl"><img src={safeMediaUrl(item.coverImageUrl)} alt={item.title} className="h-full w-full object-cover" loading="lazy" /></div>}
      <h1 className="text-3xl font-semibold">{item.title}</h1>
      <p className="mt-2 text-sm text-muted">{item.authorName}</p>
      {safeMediaUrl(item.videoUrl) && <div className="mt-5 aspect-video overflow-hidden rounded-2xl"><iframe src={safeMediaUrl(item.videoUrl)} title="Video" className="h-full w-full" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" /></div>}
      <div className="mt-5">{renderMarkdown(item.body || '')}</div>
    </article>
  );
}
