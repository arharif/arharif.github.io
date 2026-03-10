import { securityMapData } from '@/data/securityMap';
import { SecurityMapNode } from './types';

export function SecurityMapDetailPanel({ node }: { node?: SecurityMapNode }) {
  if (!node) {
    return <aside className="mindmap-panel"><p className="mindmap-chip">Security Map detail</p><h3 className="mindmap-panel-title">Select a category, role, or subdomain</h3><p className="text-sm text-muted">This map shows cybersecurity families, role pathways, and subdomain coverage across the ecosystem.</p></aside>;
  }

  const category = securityMapData.categories.find((c) => c.id === node.categoryId);
  const relatedRoles = securityMapData.nodes.filter((n) => n.categoryId === node.categoryId && n.type === 'role').slice(0, 8);
  const relatedSub = securityMapData.nodes.filter((n) => n.categoryId === node.categoryId && n.type === 'subdomain').slice(0, 8);

  return (
    <aside className="mindmap-panel">
      <p className="mindmap-chip" style={{ borderColor: category?.color.ring, color: category?.color.text }}>{category?.label}</p>
      <h3 className="mindmap-panel-title">{node.label}</h3>
      <p className="text-sm text-muted">{node.description}</p>
      {node.type === 'category' && (
        <>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Why it matters</p>
            <p className="mt-2 text-sm text-slate-200">{category?.whyItMatters}</p>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">Associated subdomains</p>
          <div className="mt-2 flex flex-wrap gap-2">{relatedSub.map((item) => <span key={item.id} className="mindmap-tag">{item.label}</span>)}</div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">Associated roles</p>
          <div className="mt-2 flex flex-wrap gap-2">{relatedRoles.map((item) => <span key={item.id} className="mindmap-tag">{item.label}</span>)}</div>
        </>
      )}
      {node.type === 'role' && (
        <>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">Associated subdomains</p>
          <div className="mt-2 flex flex-wrap gap-2">{relatedSub.map((item) => <span key={item.id} className="mindmap-tag">{item.label}</span>)}</div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">Adjacent roles</p>
          <div className="mt-2 flex flex-wrap gap-2">{relatedRoles.filter((r) => r.id !== node.id).slice(0, 6).map((item) => <span key={item.id} className="mindmap-tag">{item.label}</span>)}</div>
        </>
      )}
      {node.type === 'subdomain' && (
        <>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">Related roles</p>
          <div className="mt-2 flex flex-wrap gap-2">{relatedRoles.map((item) => <span key={item.id} className="mindmap-tag">{item.label}</span>)}</div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">Related concepts</p>
          <div className="mt-2 flex flex-wrap gap-2">{relatedSub.filter((r) => r.id !== node.id).slice(0, 6).map((item) => <span key={item.id} className="mindmap-tag">{item.label}</span>)}</div>
        </>
      )}
    </aside>
  );
}
