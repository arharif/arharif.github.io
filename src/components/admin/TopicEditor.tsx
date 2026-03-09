import { useState } from 'react';
import { ThemeUniverse, TopicDisplayStyle, TopicInput, TopicRecord } from '@/content/types';

export function TopicEditor({ value, onSave, saving }: { value?: TopicRecord; onSave: (input: TopicInput) => Promise<void>; saving: boolean }) {
  const [topic, setTopic] = useState<TopicInput>({
    slug: value?.slug ?? '',
    title: value?.title ?? '',
    description: value?.description ?? '',
    universe: value?.universe ?? 'professional',
    category: value?.category ?? '',
    subcategory: value?.subcategory,
    displayStyle: value?.displayStyle ?? 'book',
    coverImageUrl: value?.coverImageUrl,
    icon: value?.icon,
    orderIndex: value?.orderIndex ?? 1,
    palette: value?.palette,
    mood: value?.mood,
    featured: value?.featured,
  });

  const set = <K extends keyof TopicInput>(k: K, v: TopicInput[K]) => setTopic((t) => ({ ...t, [k]: v }));

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-3 text-lg font-semibold">{value ? 'Edit Topic' : 'Create Topic'}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl bg-white/10 p-2" placeholder="Topic title" value={topic.title} onChange={(e) => set('title', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Topic slug" value={topic.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
        <select className="rounded-xl bg-white/10 p-2" value={topic.universe} onChange={(e) => set('universe', e.target.value as ThemeUniverse)}>
          <option value="professional">professional</option><option value="personal">personal</option>
        </select>
        <select className="rounded-xl bg-white/10 p-2" value={topic.displayStyle} onChange={(e) => set('displayStyle', e.target.value as TopicDisplayStyle)}>
          <option value="book">book</option><option value="slides">slides</option><option value="article">article</option>
        </select>
        <input className="rounded-xl bg-white/10 p-2" placeholder="Category" value={topic.category} onChange={(e) => set('category', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Subcategory" value={topic.subcategory ?? ''} onChange={(e) => set('subcategory', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Cover image URL" value={topic.coverImageUrl ?? ''} onChange={(e) => set('coverImageUrl', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" type="number" placeholder="Order" value={topic.orderIndex} onChange={(e) => set('orderIndex', Number(e.target.value || 1))} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Palette" value={topic.palette ?? ''} onChange={(e)=>set('palette', e.target.value)} />
        <input className="rounded-xl bg-white/10 p-2" placeholder="Mood" value={topic.mood ?? ''} onChange={(e)=>set('mood', e.target.value)} />
      </div>
      <textarea className="mt-3 w-full rounded-xl bg-white/10 p-2" rows={3} placeholder="Description" value={topic.description} onChange={(e) => set('description', e.target.value)} />
      <label className="mt-2 block text-sm"><input type="checkbox" checked={Boolean(topic.featured)} onChange={(e)=>set('featured', e.target.checked)} /> Featured topic</label>
      <button disabled={saving} onClick={() => onSave(topic)} className="mt-3 rounded-xl bg-white/15 px-4 py-2">{saving ? 'Saving...' : 'Save Topic'}</button>
    </div>
  );
}
