import { SecurityMapData, SecurityMapEdge, SecurityMapNode } from './types';

export interface FilterState {
  category: string;
  search: string;
  showRoles: boolean;
  showSubdomains: boolean;
  coreRolesOnly: boolean;
}

const norm = (s: string) => s.toLowerCase().trim();

export function filterNodes(data: SecurityMapData, state: FilterState): SecurityMapNode[] {
  const term = norm(state.search);
  return data.nodes.filter((node) => {
    if (state.category !== 'all' && node.categoryId !== state.category) return false;
    if (!state.showRoles && node.type === 'role') return false;
    if (!state.showSubdomains && node.type === 'subdomain') return false;
    if (state.coreRolesOnly && node.type === 'role' && !node.coreRole) return false;
    if (term && !norm(`${node.label} ${node.description} ${node.categoryId}`).includes(term)) return false;
    return true;
  });
}

export function filterEdges(nodes: SecurityMapNode[], edges: SecurityMapEdge[]) {
  const nodeSet = new Set(nodes.map((n) => n.id));
  return edges.filter((edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target));
}
