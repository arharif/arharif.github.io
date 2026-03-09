import { motion } from 'framer-motion';
import { ContentRecord } from '@/content/types';

export function EntryCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <motion.button whileHover={{ y: -4, scale: 1.01 }} className="glass group rounded-3xl p-8 text-left" onClick={onClick}>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Universe</p>
      <h2 className="mt-2 text-4xl font-semibold">{title}</h2>
      <p className="mt-4 text-muted">{description}</p>
      <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all group-hover:w-28" />
    </motion.button>
  );
}

export function ContentCard({ item, onOpen }: { item: ContentRecord; onOpen: () => void }) {
  return (
    <motion.article whileHover={{ y: -5 }} className="glass overflow-hidden rounded-2xl">
      <div className="h-36 bg-gradient-to-br from-indigo-500/30 to-cyan-500/20">
        {item.coverImageUrl && <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted">{item.contentType}</p>
        <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
        <p className="mt-2 text-sm text-muted">{item.excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-xs"><span className="rounded-full bg-white/10 px-2 py-1">{item.status}</span></div>
        <button onClick={onOpen} className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Read</button>
      </div>
    </motion.article>
  );
}
