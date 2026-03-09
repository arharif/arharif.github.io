import { ContentRecord } from '@/content/types';

function renderLine(line: string, idx: number) {
  if (!line.trim()) return <div key={idx} className="h-2" />;
  if (line.startsWith('# ')) return <h2 key={idx} className="mt-4 text-2xl font-semibold">{line.slice(2)}</h2>;
  if (line.startsWith('## ')) return <h3 key={idx} className="mt-4 text-xl font-semibold">{line.slice(3)}</h3>;
  if (line.startsWith('- ')) return <li key={idx} className="ml-5 list-disc text-muted">{line.slice(2)}</li>;
  if (line.startsWith('![')) {
    const m = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (m) return <img key={idx} src={m[2]} alt={m[1]} className="my-4 rounded-xl" loading="lazy" />;
  }
  if (line.startsWith('> ')) return <blockquote key={idx} className="glass my-4 rounded-xl p-3 text-sm">{line.slice(2)}</blockquote>;
  if (line.startsWith('```')) return null;
  return <p key={idx} className="leading-7 text-muted">{line}</p>;
}

export function ArticleView({ item }: { item: ContentRecord }) {
  return (
    <article className="mx-auto max-w-4xl">
      {item.coverImageUrl && <div className="mb-4 h-56 overflow-hidden rounded-2xl"><img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" /></div>}
      <h1 className="text-3xl font-semibold">{item.title}</h1>
      <p className="mt-2 text-sm text-muted">{item.authorName}</p>
      {item.videoUrl && <div className="mt-5 aspect-video overflow-hidden rounded-2xl"><iframe src={item.videoUrl} title="Video" className="h-full w-full" allowFullScreen /></div>}
      <div className="mt-5">{item.body.split('\n').map(renderLine)}</div>
    </article>
  );
}
