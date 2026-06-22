import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ContentRecord } from '@/content/types';

export function EntryCard({ title, description, onClick, label = 'Universe' }: { title: string; description: string; onClick: () => void; label?: string }) {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="glass card-premium group rounded-3xl p-8 text-left"
      onClick={onClick}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <h2 className="mt-2 text-4xl font-semibold transition-colors duration-300 group-hover:text-white">{title}</h2>
      <p className="mt-4 text-muted transition-colors duration-300 group-hover:text-slate-200">{description}</p>
      <div className="mt-6 h-1 w-16 rounded-full progress-accent transition-all duration-400 group-hover:w-28" />
    </motion.button>
  );
}

export function ContentCard({ item, onOpen }: { item: ContentRecord; onOpen: () => void }) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onOpen();
  };

  return (
    <motion.article
      whileHover={{ y: -5 }}
      role="link"
      tabIndex={0}
      aria-label={`Read ${item.title}`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="glass content-card-clickable overflow-hidden rounded-2xl"
    >
      <div className="h-36 token-card">
        {item.coverImageUrl && <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted">{item.contentType}</p>
        <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
        <p className="mt-2 text-sm text-muted">{item.excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-xs"><span className="rounded-full token-chip px-2 py-1">{item.status}</span></div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className="mt-4 rounded-lg token-btn px-3 py-2 text-sm"
        >
          Read
        </button>
      </div>
    </motion.article>
  );
}
