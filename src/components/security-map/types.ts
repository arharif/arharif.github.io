export type MapNodeType = 'category' | 'subdomain' | 'role';

export interface CategoryTheme {
  fill: string;
  ring: string;
  text: string;
  edge: string;
}

export interface CategoryFamily {
  id: string;
  label: string;
  description: string;
  whyItMatters: string;
  color: CategoryTheme;
  subdomains: string[];
  roles: string[];
}

export interface SecurityMapNode {
  id: string;
  label: string;
  type: MapNodeType;
  categoryId: string;
  x: number;
  y: number;
  description: string;
  relatedIds: string[];
  coreRole?: boolean;
}

export interface SecurityMapEdge {
  id: string;
  source: string;
  target: string;
  categoryId: string;
}

export interface SecurityMapData {
  categories: CategoryFamily[];
  nodes: SecurityMapNode[];
  edges: SecurityMapEdge[];
}
