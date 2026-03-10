import { motion } from 'framer-motion';
import { categoryColors } from '@/data/securityMindmap';
import { MindmapNode } from './types';

export function NodeDetailPanel({ node, related }: { node?: MindmapNode; related: MindmapNode[] }) {
  if (!node) {
    return (
      <aside className="mindmap-panel">
        <p className="mindmap-chip">Node detail</p>
        <h3 className="mindmap-panel-title">Select a domain</h3>
        <p className="text-sm text-muted">Click any node to see what it means, why it matters, and how it connects to the journey from curiosity to strategic cyber leadership.</p>
      </aside>
    );
  }

  const color = categoryColors[node.colorKey];

  return (
    <motion.aside className="mindmap-panel" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
      <p className="mindmap-chip" style={{ borderColor: color.fill, color: color.text }}>{node.cluster}</p>
      <h3 className="mindmap-panel-title">{node.label}</h3>
      <p className="text-sm text-muted">{node.description}</p>
      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Why it matters</p>
        <p className="mt-2 text-sm text-slate-200">{node.whyItMatters}</p>
      </div>
      {node.journeyStage && (
        <p className="mt-3 text-xs text-cyan-200/90">Journey stage #{node.journeyStage} · From curiosity to CISO-grade strategy.</p>
      )}
      {related.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Connected domains</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {related.slice(0, 12).map((item) => <span key={item.id} className="mindmap-tag">{item.label}</span>)}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
