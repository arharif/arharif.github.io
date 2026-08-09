export type AcademicResourceType = 'course' | 'pdf' | 'guide' | 'research' | 'other';

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
