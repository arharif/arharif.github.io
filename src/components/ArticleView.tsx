import { ContentItem } from '@/content/types';

export function ArticleView({ item, related, onOpen }: { item: ContentItem; related: ContentItem[]; onOpen: (s: string)=>void }) {
  const sections = ['Overview', 'Core Ideas', 'Implementation', 'Takeaways'];
  return (
    <article className="mx-auto max-w-4xl">
      <div className={`mb-6 h-56 rounded-2xl bg-gradient-to-br ${item.cover}`} />
      <h1 className="text-4xl font-semibold">{item.title}</h1>
      <p className="mt-2 text-sm text-muted">{item.date} · {item.readingTime}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_240px]">
        <div>
          <div className="glass mb-4 rounded-xl p-4 text-sm">{item.description}</div>
          <div className="space-y-4 text-[15px] leading-7 text-muted whitespace-pre-line">{item.body}</div>
          <div className="glass mt-6 rounded-xl p-4">
            <p className="text-sm font-semibold">Related posts</p>
            <div className="mt-2 flex flex-wrap gap-2">{related.map((r)=><button key={r.slug} onClick={()=>onOpen(r.slug)} className="rounded-full bg-white/10 px-3 py-1 text-xs">{r.title}</button>)}</div>
          </div>
        </div>
        <aside className="glass h-fit rounded-xl p-4 text-sm">
          <p className="mb-2 font-semibold">Table of contents</p>
          <ul className="space-y-2 text-muted">{sections.map((s)=><li key={s}>• {s}</li>)}</ul>
        </aside>
      </div>
    </article>
  );
}
