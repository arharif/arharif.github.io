export type AcademicResourceType = 'course' | 'pdf' | 'guide' | 'framework' | 'research' | 'professional-resource' | 'other';

export interface AcademicResource {
  id: string;
  name: string;
  url: string;
  description: string;
  type: AcademicResourceType;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicResourceInput {
  name: string;
  url: string;
  description: string;
  type: AcademicResourceType;
}
