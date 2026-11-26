import { EditorialImage } from '@/components/EditorialImage';
import { readingStats } from '@/lib/readingTime';
import { Bookmark } from './Bookmark';
import { ContentRecord } from '@/content/types';
import { renderMarkdown } from '@/lib/markdown';

function safeMediaUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* Render articles even when a stored URL is invalid. */ }
}

export function ArticleView({ item, preview = false, chapter = false }: { item: ContentRecord; preview?: boolean; chapter?: boolean }) {
  const video = safeMediaUrl(item.videoUrl);
  const externalVideo = video && new URL(video).origin !== window.location.origin ? video : undefined;
  const Heading = chapter ? 'h2' : 'h1';
  return (
    <article className="mx-auto max-w-4xl">
      {safeMediaUrl(item.coverImageUrl) && <div className="mb-4 h-56 overflow-hidden rounded-2xl"><EditorialImage src={safeMediaUrl(item.coverImageUrl)} alt={item.title} className="h-full w-full object-cover" loading="lazy" /></div>}
      <Heading className="text-3xl font-semibold">{item.title}</Heading>
      <p className="mt-2 text-sm text-muted">{item.authorName} · {readingStats(item.body, item.readingMinutes).minutes} min read {!preview && <Bookmark key={item.id} id={item.id} title={item.title}/>}</p>
      {externalVideo && <div className="mt-5 aspect-video overflow-hidden rounded-2xl"><iframe src={externalVideo} title="Video" className="h-full w-full" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" /></div>}
      <div className="mt-5">{renderMarkdown(item.body || '')}</div>
    </article>
  );
}
