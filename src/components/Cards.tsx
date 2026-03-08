import { motion } from 'framer-motion';
import { ContentItem } from '@/content/types';

export function ItemCard({ item, onOpen }: { item: ContentItem; onOpen: (slug: string) => void }) {
  return (
    <motion.article whileHover={{ y: -6, scale: 1.01 }} className="glass rounded-2xl p-4 transition">
      <div className={`mb-3 h-28 rounded-xl bg-gradient-to-br ${item.cover}`} />
      <p className="text-xs text-muted">{item.category} · {item.readingTime}</p>
      <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm text-muted">{item.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full border border-white/20 px-2 py-0.5 text-xs">#{tag}</span>)}</div>
      <button onClick={() => onOpen(item.slug)} className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Read</button>
    </motion.article>
  );
}

export function SelectorCard({title, desc, vibe, onClick}: {title: string; desc: string; vibe: string; onClick: ()=>void}) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} onClick={onClick} className="glass group min-h-[280px] rounded-3xl p-8 text-left">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{vibe}</p>
      <h2 className="mt-4 text-4xl font-semibold">{title}</h2>
      <p className="mt-4 max-w-md text-muted">{desc}</p>
      <div className="mt-8 h-1 w-20 rounded bg-gradient-to-r from-cyan-400 to-violet-500 transition-all group-hover:w-40" />
    </motion.button>
  );
}
