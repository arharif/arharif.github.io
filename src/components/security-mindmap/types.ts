export type MindmapCategory =
  | 'journey'
  | 'architecture'
  | 'identity'
  | 'operations'
  | 'governance'
  | 'assurance'
  | 'awareness'
  | 'career'
  | 'frameworks'
  | 'resilience'
  | 'appsec'
  | 'future';

export type FocusMode = 'full' | 'journey' | 'technical' | 'governance' | 'operations' | 'future';

export interface MindmapNode {
  id: string;
  label: string;
  shortLabel?: string;
  category: MindmapCategory;
  cluster: string;
  description: string;
  whyItMatters: string;
  related: string[];
  journeyStage?: number;
  emphasis?: 'low' | 'medium' | 'high';
  futureVision?: boolean;
  icon?: string;
  colorKey: MindmapCategory;
  keywords: string[];
  x: number;
  y: number;
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  kind?: 'journey' | 'domain' | 'future';
}

export interface FocusPreset {
  id: FocusMode;
  label: string;
  includeCategories: MindmapCategory[];
  includeNodeIds?: string[];
}
