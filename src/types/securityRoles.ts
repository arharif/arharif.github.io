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
  careerPath: CareerPath;
}

export interface OperatingModelUnit {
  title: string;
  roles?: string[];
}

export interface OperatingModelGroup {
  title: string;
  units: OperatingModelUnit[];
}

export interface OperatingModelSection {
  title: string;
  groups: OperatingModelGroup[];
}
