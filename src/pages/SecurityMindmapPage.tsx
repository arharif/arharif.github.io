import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { legend } from '@/data/securityMindmap';
import { SecurityGraph } from '@/components/security-mindmap/SecurityGraph';

export function SecurityMindmapPage() {
  return (
    <section className="space-y-6">
      <div className="mindmap-hero rounded-3xl p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/90">Flagship Experience</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-5xl">Security Map</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200/90 md:text-base">
          From curiosity to cyber leadership: a living map of architecture, operations, governance, resilience, and strategic direction toward CISO as a Service.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href="#mindmap-graph" className="mindmap-cta">Explore the Map</a>
          <button className="mindmap-ghost">View My Journey</button>
          <button className="mindmap-ghost">Focus on Governance</button>
          <button className="mindmap-ghost">Focus on Security Operations</button>
        </div>
      </div>

      <div id="mindmap-graph" className="space-y-4">
        <SecurityGraph />
      </div>

      <motion.div className="glass rounded-2xl p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Legend & Journey signal</p>
        <div className="flex flex-wrap gap-2">
          {legend.map((entry) => (
            <span key={entry.key} className="mindmap-tag">{entry.label}</span>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          This map reflects my progression from technical depth to governance leadership, integrating domain expertise with executive strategy and resilience.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-3">
        <Link to="/games" className="mindmap-cta">Go to Games</Link>
        <Link to="/" className="mindmap-ghost">Back Home</Link>
        <Link to="/professional" className="mindmap-ghost">Professional Universe</Link>
      </div>
    </section>
  );
}
