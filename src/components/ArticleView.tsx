import { ContentRecord } from '@/content/types';

function renderLine(line: string, idx: number) {
  if (!line.trim()) return <div key={idx} className="h-2" />;
  if (line.startsWith('# ')) return <h2 key={idx} className="mt-4 text-2xl font-semibold">{line.slice(2)}</h2>;
  if (line.startsWith('## ')) return <h3 key={idx} className="mt-4 text-xl font-semibold">{line.slice(3)}</h3>;
  if (line.startsWith('- ')) return <li key={idx} className="ml-5 list-disc">{line.slice(2)}</li>;
  if (line.startsWith('![')) {
    const m = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (m) return <img key={idx} src={m[2]} alt={m[1]} className="my-4 rounded-xl" />;
  }
  if (line.startsWith('> ')) return <blockquote key={idx} className="glass my-4 rounded-xl p-3 text-sm">{line.slice(2)}</blockquote>;
  return <p key={idx} className="text-muted leading-7">{line}</p>;
}

export function ArticleView({ item }: { item: ContentRecord }) {
  return (
    <article className="mx-auto max-w-4xl">
      <div className="h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20">
        {item.coverImageUrl && <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />}
      </div>
      <h1 className="mt-6 text-4xl font-semibold">{item.title}</h1>
      <p className="mt-2 text-sm text-muted">{item.category} · {item.authorName}</p>
      {item.videoUrl && (
        <div className="mt-6 aspect-video overflow-hidden rounded-2xl">
          <iframe src={item.videoUrl} title="Embedded video" className="h-full w-full" allowFullScreen />
        </div>
      )}
      <div className="mt-6 space-y-2">{item.body.split('\n').map(renderLine)}</div>
    </article>
  );
}
