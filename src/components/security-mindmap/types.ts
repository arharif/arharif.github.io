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
  | 'future'
  | 'ai';

export type ApprovedTheme =
  | 'all'
  | 'security-architecture'
  | 'application-security'
  | 'risk-assessment'
  | 'enterprise-risk-management'
  | 'threat-intelligence'
  | 'user-awareness'
  | 'security-operations'
  | 'frameworks-and-standards'
  | 'physical-security'
  | 'career-development'
  | 'ai-security';

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

export interface ApprovedThemeOption {
  id: ApprovedTheme;
  label: string;
}
