import { controls, csfFunctions } from "../workspace/frameworks";
import { standards } from "../data/standards";
import { priorityControls } from "./priorityStandards";
import nistIndex from "../data/sp80053-index.json";
import { annexA } from "../data/iso27001";
import { pciExamples, pciSections } from "../data/pci401";
import pciIndex from "../data/pci401-index.json";
import { euStructure } from "../data/euStructure";

import type { Framework } from "./editions";
export { frameworkIds, names, type Framework } from "./editions";

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
  locator?: string;
  parent?: string;
  withdrawn?: boolean;
};
export type Group = {
  id: string;
  title: string;
  description: string;
  colour: string;
};
export const cases = {
  "nist-800-53": { name: "Aster Research Services", scope: "Research data platform and software supply chain", owner: "Jo Rivera", caseId: "smartfactory" },
  dora: { name: "Bridgewater Mutual", scope: "EU credit institution’s payments and outsourced ICT settlement", owner: "Samira Hart", caseId: "paysecure" },
  gdpr: { name: "Cedar Member Services", scope: "Customer support, analytics and EU member records", owner: "Alex Morgan", caseId: "paysecure" },
  "eu-ai-act": { name: "Spindle Talent Systems", scope: "Candidate-ranking system used in EU recruitment", owner: "Robin Vale", caseId: "smartfactory" },
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
export const nistBaselines = nistIndex.baselines;
const nistIds = new Map(nistIndex.controls.map((control) => [control.id, control.displayId]));
const nistExamples = new Map(priorityControls["nist-800-53"].map((entry) => [entry.id, entry]));
export const nistActiveIds = new Set(nistIndex.controls.filter((control) => !control.withdrawn).map((control) => control.displayId));
const nistEntries = new Map(nistIndex.controls.map((row) => [row.displayId, row]));
export function nistParent(id: string) {
  const parent = nistEntries.get(id)?.parent;
  return parent ? nistIds.get(parent) : undefined;
}
const baselineDisplayIds = new Map(Object.entries(nistBaselines).map(([name, ids]) =>
  [name, new Set(ids.map((id) => nistIds.get(id)!))] as const,
));
export function baselineIds(name: keyof typeof nistBaselines) {
  return [...baselineDisplayIds.get(name)!];
}
export function baselineMembership(id: string) {
  return [...baselineDisplayIds].filter(([, ids]) => ids.has(id)).map(([name]) => name);
}
const group = (id: string, title: string, description: string, i: number): Group => ({
  id, title, description, colour: colours[i % colours.length],
});
const legalChapter = (framework: keyof typeof euStructure, reference: string) => {
  const first = Number(reference.match(/\d+/)?.[0]);
  return euStructure[framework].find((entry) => first >= entry.first && first <= entry.last)?.id;
};

const cache = new Map<Framework, { groups: Group[]; items: Control[]; source: (typeof standards)[number] }>();

export function catalogue(framework: Framework) {
  const saved = cache.get(framework);
  if (saved) return saved;
  const source = standards.find((s) => s.id === framework)!;
  let groups: Group[], items: Control[];
  if (framework === "nist-800-53") {
    groups = nistIndex.families.map(([id, title], index) => group(id.toUpperCase(), title, `NIST SP 800-53 family ${id.toUpperCase()}. Expand any control to inspect its official text and enhancements.`, index));
    items = nistIndex.controls.map((row) => {
      const sample = nistExamples.get(row.displayId);
      return {
        id: row.displayId, locator: row.id, title: row.title, group: row.family.toUpperCase(),
        parent: row.parent ? nistIds.get(row.parent) : undefined,
        withdrawn: row.withdrawn,
        category: row.parent ? "Control enhancement" : "Base control",
        explanation: "See the SP 800-53 statement and SP 800-53A procedures for the selected control.",
        example: sample?.example ?? "Identify the specific system population and sample implementation against the applicable assessment objectives.",
        evidence: sample?.evidence ?? "Use the SP 800-53A assessment objects to identify appropriate evidence for this system and assessment period.",
      };
    });
  } else if (framework === "dora" || framework === "gdpr" || framework === "eu-ai-act") {
    groups = euStructure[framework].map((entry, index) => group(entry.id, entry.title, `Chapter ${entry.id} · Article${entry.first === entry.last ? ` ${entry.first}` : `s ${entry.first}–${entry.last}`}`, index));
    items = priorityControls[framework].map((row) => ({
      ...row, group: legalChapter(framework, row.id)!,
      locator: row.id.match(/\d+/)?.[0],
    }));
  } else if (framework === "iso-27001") {
    groups = clauses.map(([id, title, description], i) => group("CL-" + id, title, description, i));
    groups.push(...annexA.map(({ section, title }, i) => group("A." + section, title, `Annex A · Section ${section}. Use risk treatment and Clause 6.1.3 to document the Statement of Applicability.`, 7 + i)));
    items = clauses.map(([id, title, explanation, example, evidence]) => ({
      id: "ISO-" + id, title, group: "CL-" + id, category: "Clause " + id, explanation, example, evidence,
    }));
    items.push(...controls.filter((c) => c.framework === framework && c.id !== "ISO-A.5").map((c) => ({
      id: c.id, title: c.title, group: "CL-" + c.id.slice(4, 5), category: c.path[1],
      explanation: c.explanation, example: c.implementation, evidence: c.evidence,
    })));
    items.push(...annexA.flatMap(({ section, title, topics }) => topics.map((topic, i) => ({
      id: `A.${section}.${i + 1}`, title: topic, group: "A." + section, category: title,
      explanation: "Use this Annex A reference when reviewing necessary risk treatments and omitted controls.",
      example: `Record how ${topic.toLowerCase()} addresses the identified risk, then confirm whether the treatment is implemented.`,
      evidence: "Statement of Applicability decision, risk treatment reference and sample operating evidence.",
    }))));
  } else if (framework === "pci-dss") {
    const principal = controls.filter((c) => c.framework === framework);
    groups = pciSections.map(([title], i) => group(`pci-${i + 1}`, title, principal[i].explanation, i));
    const examples = new Map(pciExamples.map((row) => [row[0], row]));
    const ids = new Set(pciIndex.requirements);
    items = pciIndex.requirements.map((id) => {
      const [requirement, objective] = id.split(".").map(Number);
      const parent = id.split(".").slice(0, -1).join(".");
      const group = "pci-" + requirement;
      const topic = pciSections[requirement - 1][1][objective - 1];
      const sample = examples.get(id);
      return {
        id, group, category: `${requirement}.${objective} · ${topic}`,
        parent: ids.has(parent) ? parent : undefined,
        title: sample?.[1] ?? topic,
        explanation: sample?.[2] ?? `Verify applicability to the scoped payment environment using the official v4.0.1 requirement ${id} and its applicability notes.`,
        example: sample?.[4] ?? `Use the finding and official text for ${id} to define the change, affected components and acceptance criteria.`,
        evidence: sample?.[3] ?? `Apply the official tests for ${id} and document the population, samples, observations and exceptions.`,
      };
    });
    items.push(...principal.map((c, index) => ({
      id: c.id, title: c.title, group: groups[index].id, category: "Principal requirement",
      explanation: c.explanation, example: c.implementation, evidence: c.evidence,
    })));
  } else {
    groups = csfFunctions.map((f, i) => group(f.id, f.title[0] + f.title.slice(1).toLowerCase(), f.text, i));
    items = controls.filter((c) => c.framework === framework).map((c) => ({
      id: c.id, title: c.title, group: c.id.split(".")[0], category: c.path[1],
      explanation: c.explanation, example: c.implementation, evidence: c.evidence,
    }));
  }
  const result = { groups, items, source };
  cache.set(framework, result);
  return result;
}
