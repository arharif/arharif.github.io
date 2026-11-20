import type { EducationalResource } from "./types";
const entries = [
  [
    "csf",
    "NIST Cybersecurity Framework 2.0",
    "Outcome-based risk communication and current/target profiles.",
    "grc",
    "Governance",
    "Framework",
    "Foundation",
    "NIST",
    "https://www.nist.gov/cyberframework",
    "NIST CSF 2.0",
    "GRC Analyst",
    "risk-assessment",
  ],
  [
    "controls",
    "NIST SP 800-53 Rev. 5",
    "Security and privacy control catalogue. Check the official page for release updates.",
    "grc",
    "Control assessment",
    "Framework",
    "Intermediate",
    "NIST",
    "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    "NIST SP 800-53",
    "Security Auditor",
    "risk-assessment",
  ],
  [
    "incident",
    "NIST Incident Response project",
    "Official incident response publications and guidance.",
    "cybersecurity",
    "Incident response",
    "Practitioner guide",
    "Intermediate",
    "NIST",
    "https://csrc.nist.gov/projects/incident-response",
    "NIST CSF 2.0",
    "SOC Analyst",
    "incident-triage",
  ],
  [
    "attack",
    "MITRE ATT&CK",
    "A source-linked knowledge base of adversary behaviours for defensive understanding.",
    "cybersecurity",
    "Threat modelling",
    "Documentation",
    "Intermediate",
    "MITRE",
    "https://attack.mitre.org/",
    "ATT&CK",
    "SOC Analyst",
    "incident-triage",
  ],
  [
    "owasp",
    "OWASP Application Security Verification Standard",
    "Requirements and verification guidance for application security.",
    "cybersecurity",
    "Application security",
    "Practitioner guide",
    "Intermediate",
    "OWASP",
    "https://owasp.org/www-project-application-security-verification-standard/",
    "ASVS",
    "Security Engineer",
    "incident-triage",
  ],
  [
    "ai-rmf",
    "NIST AI Risk Management Framework",
    "Govern, map, measure and manage AI risks.",
    "artificial-intelligence",
    "AI governance",
    "Framework",
    "Foundation",
    "NIST",
    "https://www.nist.gov/itl/ai-risk-management-framework",
    "NIST AI RMF",
    "AI Governance Officer",
    "detection-evaluation",
  ],
  [
    "ml",
    "Scikit-learn model evaluation guide",
    "Definitions, examples and caveats for classification metrics.",
    "artificial-intelligence",
    "Model evaluation",
    "Tutorial",
    "Intermediate",
    "Scikit-learn",
    "https://scikit-learn.org/stable/modules/model_evaluation.html",
    "None",
    "AI Security Specialist",
    "detection-evaluation",
  ],
  [
    "cisa",
    "CISA Cybersecurity Performance Goals",
    "Prioritised security practices and implementation resources.",
    "cybersecurity",
    "Resilience",
    "Practitioner guide",
    "Foundation",
    "CISA",
    "https://www.cisa.gov/cross-sector-cybersecurity-performance-goals",
    "CPG",
    "Security Engineer",
    "incident-triage",
  ],
] as const;
export const resources: EducationalResource[] = entries.map((row) => ({
  id: row[0],
  title: row[1],
  description: row[2],
  domain: row[3],
  topic: row[4],
  type: row[5],
  difficulty: row[6],
  access: "Free",
  publisher: row[7],
  url: row[8],
  framework: row[9],
  role: row[10],
  lesson: row[11],
  duration: "Self-paced reference",
  reviewed: "2026-11-20",
  verification:
    "Link verification recorded separately in docs/x1-academic/LINK_REPORT.json",
  skills: [row[4], "Evidence interpretation"],
}));
export function filterResources(
  query: string,
  filters: Partial<
    Pick<
      EducationalResource,
      | "domain"
      | "type"
      | "difficulty"
      | "access"
      | "topic"
      | "framework"
      | "role"
    >
  >,
) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return resources.filter(
    (resource) =>
      terms.every((term) =>
        `${resource.title} ${resource.description} ${resource.topic} ${resource.skills.join(" ")}`
          .toLowerCase()
          .includes(term),
      ) &&
      Object.entries(filters).every(
        ([key, value]) =>
          !value || resource[key as keyof EducationalResource] === value,
      ),
  );
}
