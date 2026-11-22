import { controls, csfFunctions } from "../workspace/frameworks";
import { standards } from "../data/standards";

export const frameworkIds = ["nist-csf-2", "iso-27001", "pci-dss"] as const;
export type Framework = (typeof frameworkIds)[number];
export const names: Record<Framework, string> = {
  "nist-csf-2": "NIST CSF 2.0",
  "iso-27001": "ISO/IEC 27001",
  "pci-dss": "PCI DSS",
};
export const colours = [
  "#7476ee",
  "#3688e8",
  "#12ae90",
  "#e89a35",
  "#c56fb0",
  "#47a9bb",
  "#bc8c56",
];
export type Control = {
  id: string;
  title: string;
  group: string;
  category: string;
  explanation: string;
  example: string;
  evidence: string;
};
export type Group = {
  id: string;
  title: string;
  description: string;
  colour: string;
};
export const cases = {
  "nist-csf-2": {
    name: "Northstar Manufacturing",
    scope: "Connected production and industrial telemetry",
    owner: "Maya Chen",
    caseId: "smartfactory",
  },
  "iso-27001": {
    name: "Meridian Energy",
    scope: "Information security management for field operations",
    owner: "Amir Patel",
    caseId: "petroshield",
  },
  "pci-dss": {
    name: "Harbour Payments",
    scope: "Merchant checkout and the cardholder data environment",
    owner: "Leila Grant",
    caseId: "paysecure",
  },
} as const;
const clauses = [
  [
    "4",
    "Context",
    "Define the boundaries of the ISMS.",
    "Document the critical service, interested parties and in-scope sites.",
    "Approved scope and interested-party register",
  ],
  [
    "5",
    "Leadership",
    "Assign accountability for information security.",
    "Have the sponsor approve responsibilities and review the policy.",
    "Signed policy and role assignments",
  ],
  [
    "6",
    "Planning",
    "Assess risks and select appropriate treatments.",
    "Tie treatment decisions to a risk owner and a Statement of Applicability.",
    "Risk assessment and treatment plan",
  ],
  [
    "7",
    "Support",
    "Provide resources, skills and controlled information.",
    "Sample role competence and document version approvals.",
    "Training records and controlled document list",
  ],
  [
    "8",
    "Operation",
    "Operate the risk treatment programme.",
    "Trace a supplier change to its risk review and treatment record.",
    "Approved changes and operating records",
  ],
  [
    "9",
    "Performance evaluation",
    "Review performance and the effectiveness of the ISMS.",
    "Trace an internal audit finding into the management review.",
    "Audit report and management review minutes",
  ],
  [
    "10",
    "Improvement",
    "Resolve nonconformities and improve the system.",
    "Record root cause and test whether corrective action worked.",
    "Corrective action register and retest results",
  ],
];
export function catalogue(framework: Framework) {
  const source = standards.find((s) => s.id === framework)!;
  let groups: Group[], items: Control[];
  if (framework === "iso-27001") {
    groups = clauses.map(([id, title, description], i) => ({
      id: "CL-" + id,
      title,
      description,
      colour: colours[i],
    }));
    items = clauses.map(([id, title, explanation, example, evidence]) => ({
      id: "ISO-" + id,
      title,
      group: "CL-" + id,
      category: "Clause " + id,
      explanation,
      example,
      evidence,
    }));
    items.push(
      ...controls
        .filter((c) => c.framework === framework)
        .map((c, i) => ({
          id: c.id,
          title: c.title,
          group: ["CL-6", "CL-9", "CL-8"][i],
          category: c.path[1],
          explanation: c.explanation,
          example: c.implementation,
          evidence: c.evidence,
        })),
    );
  } else {
    groups =
      framework === "nist-csf-2"
        ? csfFunctions.map((f, i) => ({
            id: f.id,
            title: f.title[0] + f.title.slice(1).toLowerCase(),
            description: f.text,
            colour: colours[i],
          }))
        : source.nodes.map((n, i) => ({
            id: n.id,
            title: n.title,
            description: n.objective,
            colour: colours[i],
          }));
    items = controls
      .filter((c) => c.framework === framework)
      .map((c) => ({
        id: c.id,
        title: c.title,
        group:
          framework === "nist-csf-2"
            ? c.id.split(".")[0]
            : source.nodes.find((n) => n.children?.some((k) => k.id === c.id))!
                .id,
        category: c.path[1],
        explanation: c.explanation,
        example: c.implementation,
        evidence: c.evidence,
      }));
  }
  return { groups, items, source };
}
