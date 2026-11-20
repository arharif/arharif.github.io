export type Discipline = "cybersecurity" | "grc" | "artificial-intelligence";
export type CaseId = "paysecure" | "petroshield" | "smartfactory";
export interface Scenario {
  id: CaseId;
  name: string;
  sector: string;
  process: string;
  asset: string;
  owner: string;
  architecture: string;
  threat: string;
  exposure: string;
  consequence: string;
  dependency: string;
  supplier: string;
  constraint: string;
  budget: number;
  tolerance: number;
}
export type AssessmentStatus =
  | "Not assessed"
  | "Implemented and evidenced"
  | "Partially implemented"
  | "Not implemented"
  | "Not applicable";
export interface ControlAssessment {
  status: AssessmentStatus;
  notes: string;
  evidence: string;
  owner: string;
  justification: string;
}
export interface FrameworkControl {
  id: string;
  framework: string;
  path: string[];
  title: string;
  explanation: string;
  objective: string;
  implementation: string;
  roles: string;
  assets: string;
  methods: string;
  evidence: string;
  gap: string;
  risk: string;
  source: string;
  lesson: string;
}
export interface Assessment {
  prompt: string;
  choices: string[];
  correct: number;
  explanation: string;
}
export interface LearningModule {
  id: string;
  discipline: Discipline;
  title: string;
  prerequisite: string;
  objectives: string[];
  analogy: string;
  sections: { title: string; text: string }[];
  activity: string;
  deliverable: string;
  misconception: string;
  revision: string[];
  assessment: Assessment;
  lab: string;
  resource: string;
}
export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  domain: Discipline;
  topic: string;
  type: string;
  difficulty: string;
  access: string;
  publisher: string;
  url: string;
  duration: string;
  reviewed: string;
  verification: string;
  framework: string;
  role: string;
  skills: string[];
  lesson: string;
}
export interface AIConfiguration {
  threshold: number;
  prevalence: number;
  shift: number;
  features: number;
  split: "holdout" | "training";
  seed: number;
}
export interface Prediction {
  label: boolean;
  score: number;
}
export interface LearnerProgress {
  version: 1;
  completed: string[];
  attempts: Record<string, number>;
  bookmarks: string[];
  currentModule: string | null;
  competencies: string[];
  savedExperiment: AIConfiguration | null;
}
export interface CaseArtifact {
  schemaVersion: 1;
  kind: "x1-case-state";
  caseId: CaseId;
  title: string;
  generatedAt: string;
  methodology: string;
  results: Record<string, unknown>;
  disclaimer: string;
}
