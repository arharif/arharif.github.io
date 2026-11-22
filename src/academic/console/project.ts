import { z } from "../studio/schema";
import {
  newTask,
  taskSchema,
  isoDate,
  today,
  type Task,
} from "../studio/model";
import { addDays, schedule } from "../studio/engines";
import {
  scenarioRisks,
  validateRisk,
  type RiskRecord,
} from "../workspace/risk";
import { catalogue, frameworkIds, cases, type Framework } from "./catalogue";

export const evidenceStates = [
  "Missing",
  "Requested",
  "Reviewed",
  "Tested",
] as const;
const rating = z.number().int().min(0).max(4);
const short = z.string().max(240);
const assessment = z.object({
  current: rating.nullable(),
  target: rating,
  evidence: z.enum(evidenceStates),
  note: z.string().max(3000),
  owner: short,
  unit: short.default(""),
  location: short.default(""),
  asset: short.default(""),
  finding: z.string().max(3000),
});
export type Assessment = z.infer<typeof assessment>;
export const unassessed: Assessment = {
  current: null,
  target: 3,
  evidence: "Missing",
  note: "",
  owner: "",
  unit: "",
  location: "",
  asset: "",
  finding: "",
};
export const flowStages = [
  "Collection",
  "Ingestion",
  "Processing",
  "Retention",
] as const;
const flow = z.object({
  id: short.min(1),
  stage: z.enum(flowStages),
  name: short.min(1),
  field: short,
  owner: short,
  next: z.array(short).max(20),
});
export type Flow = z.infer<typeof flow>;
const riskSchema = z
  .custom<RiskRecord>(
    (v) =>
      !!v &&
      typeof v === "object" &&
      !validateRisk(v as Record<string, unknown>).errors.length,
  )
  .transform(
    (v) => validateRisk(v as unknown as Record<string, unknown>).record,
  );
const projectSchema = z.object({
  version: z.literal(1),
  framework: z.enum(frameworkIds),
  demo: z.boolean(),
  name: short.min(1),
  start: isoDate,
  assessments: z.record(short, assessment),
  risks: z.array(riskSchema).max(2000),
  tasks: z.array(taskSchema).max(500),
  flow: z.array(flow).max(120),
  history: z
    .array(
      z.object({
        date: isoDate,
        counts: z.array(z.number().int().min(0).max(2000)).length(4),
      }),
    )
    .max(120),
  experiment: z.object({
    model: z.number().int().min(0).max(2),
    threshold: z.number().min(0).max(1),
    prevalence: z.number().int().min(1).max(99),
  }),
});
export type Project = z.infer<typeof projectSchema>;
export const resources = [
  { id: "control-owner", name: "Engineering", hoursPerDay: 8, rate: 95 },
  { id: "assessor", name: "Assurance", hoursPerDay: 8, rate: 110 },
  { id: "lead", name: "Programme office", hoursPerDay: 8, rate: 120 },
];
export const plan = (tasks: Task[], start: string) =>
  schedule(tasks, resources, start, {
    weekdays: [1, 2, 3, 4, 5],
    holidays: [],
  });
export function parseProject(raw: string) {
  if (raw.length > 3000000)
    throw Error("Projects can contain up to 3 MB of data.");
  const p = projectSchema.parse(JSON.parse(raw));
  const allowed = new Set(catalogue(p.framework).items.map((c) => c.id));
  if (Object.keys(p.assessments).some((id) => !allowed.has(id)))
    throw Error("Unknown framework control.");
  if (new Set(p.risks.map((r) => r.id.toLowerCase())).size !== p.risks.length)
    throw Error("Duplicate risk IDs.");
  const flowIds = new Set(p.flow.map((n) => n.id));
  if (
    flowIds.size !== p.flow.length ||
    p.flow.some((n) => n.next.some((id) => !flowIds.has(id)))
  )
    throw Error("Invalid data-flow connections.");
  plan(p.tasks, p.start);
  return p;
}
export function blank(framework: Framework): Project {
  return {
    version: 1,
    framework,
    demo: false,
    name: "My assessment",
    start: today(),
    assessments: {},
    risks: [],
    tasks: [],
    flow: [],
    history: [],
    experiment: { model: 0, threshold: 0.5, prevalence: 30 },
  };
}
export const phaseNames = {
  FRAME: "Initiation",
  DIAGNOSE: "Discovery",
  DESIGN: "Design",
  PLAN: "Planning",
  IMPLEMENT: "Implementation",
  ASSURE: "Validation",
  EMBED: "Handover",
};
export function makePlan(
  framework: Framework,
  demo: boolean,
  start: string,
): Task[] {
  const { groups } = catalogue(framework);
  const prefix = {
    "nist-csf-2": "CSF Profile",
    "pci-dss": "Cardholder environment",
    "iso-27001": "ISMS",
  }[framework];
  const stages: [Task["stage"], string, string, number][] = [
    ["FRAME", prefix + " scope", "lead", 3],
    ["DIAGNOSE", "Inventory and evidence review", "assessor", 5],
    ["DESIGN", prefix + " target design", "control-owner", 4],
    ["PLAN", "Approve treatment plan", "lead", 0],
    ...groups.map((g): [Task["stage"], string, string, number] => [
      "IMPLEMENT",
      g.title + " controls",
      "control-owner",
      4,
    ]),
    ["ASSURE", "Test operating evidence", "assessor", 5],
    ["EMBED", "Management sign-off", "lead", 0],
  ];
  const tasks: Task[] = [];
  stages.forEach(([stage, title, resourceId, days], i) => {
    const t = newTask("objective:" + framework + ":" + stage, title, stage);
    const group = groups[i - 4];
    if (stage === "IMPLEMENT" && group) t.sourceIds = [group.id];
    const progress = demo ? (i < 4 ? 100 : i === 4 ? 65 : i === 5 ? 30 : 0) : 0;
    tasks.push({
      ...t,
      resourceId,
      owner:
        resourceId === "lead"
          ? cases[framework].owner
          : resourceId === "assessor"
            ? "Ellis Morgan"
            : "Rin Alvarez",
      duration: days,
      effort: days * 7,
      milestone: days === 0,
      dependencies: i ? [tasks[i - 1].id] : [],
      progress,
      status:
        progress === 100 ? "Implemented" : progress ? "In progress" : "Planned",
      deadline: demo && i === 5 ? addDays(start, 18) : "",
    });
  });
  return tasks;
}
export function demoProject(framework: Framework): Project {
  const p = blank(framework),
    scenario = cases[framework],
    { items, groups } = catalogue(framework);
  p.demo = true;
  p.name = scenario.name;
  p.start = addDays(today(), -23);
  items.forEach((c, i) => {
    const family = groups.findIndex((g) => g.id === c.group);
    const current = Math.max(
      0,
      Math.min(4, [3, 2, 3, 1, 2, 1, 3][family] + [0, 1, 0, -1, 1][i % 5]),
    );
    const target = Math.min(
      4,
      [4, 3, 4, 3, 3, 4, 4][family] - (i % 9 === 0 ? 1 : 0),
    );
    const evidence = evidenceStates[Math.min(3, current)];
    p.assessments[c.id] = {
      current,
      target,
      evidence,
      owner:
        i % 3 === 0
          ? scenario.owner
          : i % 3 === 1
            ? "Rin Alvarez"
            : "Ellis Morgan",
      unit: ["Operations", "Technology", "Assurance"][i % 3],
      location: ["North campus", "Field office", "Central office"][i % 3],
      asset: ["Service platform", "Identity provider", "Data store"][i % 3],
      note: current > 0 ? "Sample " + (i + 1) + " · " + c.evidence : "",
      finding:
        current < target
          ? "Follow up on " +
            c.title.toLowerCase() +
            " across the scoped service."
          : "",
    };
  });
  p.risks = scenarioRisks(scenario.caseId).map((r, i) => ({
    ...r,
    openedDate: addDays(today(), -[98, 42, 18, 76, 8, 31][i % 6]),
    reviewDate: addDays(today(), i * 8 - 5),
  }));
  // Separate dated observations from today's register. Fictional histories are seeded only in demo mode.
  p.history = [
    [4, 5, 3, 1],
    [3, 6, 4, 2],
    [3, 5, 4, 2],
    [2, 4, 5, 3],
    [2, 3, 4, 3],
  ].map((counts, i) => ({ date: addDays(today(), -7 * (5 - i)), counts }));
  p.tasks = makePlan(framework, true, p.start);
  const sources =
    framework === "pci-dss"
      ? ["Checkout", "Merchant portal", "Settlement file"]
      : framework === "iso-27001"
        ? ["Service desk", "Field operations", "Supplier portal"]
        : ["Factory sensors", "Operator portal", "Supplier feed"];
  const flows: [string, number, string, string, string[]][] = [
    ["a", 0, sources[0], "Event ID", ["d", "e"]],
    ["b", 0, sources[1], "User ID", ["d"]],
    ["c", 0, sources[2], "Account ID", ["e"]],
    ["d", 1, "Event gateway", "Session ID", ["f", "g"]],
    ["e", 1, "Batch intake", "Record ID", ["f"]],
    ["f", 2, "Analytics store", "Service ID", ["h", "i"]],
    ["g", 2, "Access review", "User ID", ["i"]],
    ["h", 3, "Archive", "Retention policy", []],
    ["i", 3, "Review log", "Deletion record", []],
  ];
  p.flow = flows.map(([id, s, name, field, next]) => ({
    id,
    stage: flowStages[s],
    name,
    field,
    next,
    owner: scenario.owner,
  }));
  return p;
}
export function stats(p: Project) {
  const { items, groups } = catalogue(p.framework);
  const rows = items.map((c) => ({
    ...c,
    ...(p.assessments[c.id] ?? unassessed),
  }));
  const scored = rows.filter((r) => r.current !== null);
  const avg = (values: number[]) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const profiles = groups.map((g) => {
    const members = rows.filter((c) => c.group === g.id),
      rated = members.filter((r) => r.current !== null);
    return {
      ...g,
      total: members.length,
      assessed: rated.length,
      current: avg(rated.map((c) => c.current!)),
      target: avg(members.map((c) => c.target)),
    };
  });
  return {
    rows,
    profiles,
    scored,
    current: avg(scored.map((c) => c.current!)),
    target: avg(rows.map((c) => c.target)),
    met: scored.filter((c) => c.current! >= c.target).length,
    gaps: scored.filter((c) => c.current! < c.target),
    verified: rows.filter(
      (c) => c.evidence === "Reviewed" || c.evidence === "Tested",
    ).length,
  };
}
