export type CareerPath = {
  nMinus2: string;
  nMinus1: string;
  nPlus1: string;
  nPlus2: string;
};

export interface SecurityRole {
  id: string;
  slug: string;
  title: string;
  family: string;
  color: string;
  shortDescription: string;
  mainResponsibilities: string;
  mustHaveDomains: string[];
  certification: string;
  careerPath: CareerPath;
}

export interface OrgNode {
  title: string;
  children?: OrgNode[];
}

export interface OrgSection {
  title: string;
  root: OrgNode;
}
