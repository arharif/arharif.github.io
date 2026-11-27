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
  blankRisk,
  validateRisk,
  type RiskRecord,
} from "../workspace/risk";
import { catalogue, frameworkIds, cases, names, type Framework } from "./catalogue";

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
  applicability: z.enum(["Applicable", "Excluded"]).default("Applicable"),
  exclusion: z.string().max(3000).default(""),
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
  applicability: "Applicable",
  exclusion: "",
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
  const prefix = names[framework];
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
    t.id = `roadmap:${framework}:${i}`;
    if (stage === "IMPLEMENT" && group) {
      t.id = `remediation:${framework}:${group.id}`;
      t.sourceIds = [group.id];
    }
    const progress = demo ? (i < 4 ? 100 : i === 4 ? 65 : i === 5 ? 30 : 0) : 0;
    tasks.push({
      ...t,
      resourceId,
      owner:
        !demo ? "Unassigned" : resourceId === "lead"
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
  p.start = "2026-11-04";
  const scenarioDate = "2026-11-27";
  items.forEach((c, i) => {
    const family = groups.findIndex((g) => g.id === c.group);
    const current = Math.max(
      0,
      Math.min(4, [3, 2, 3, 1, 2, 1, 3][family % 7] + [0, 1, 0, -1, 1][i % 5]),
    );
    const target = Math.min(
      4,
      [4, 3, 4, 3, 3, 4, 4][family % 7] - (i % 9 === 0 ? 1 : 0),
    );
    const evidence = evidenceStates[Math.min(3, current)];
    const excluded = (framework === "dora" && c.id === "Art. 26") ||
      (framework === "eu-ai-act" && c.group === "model");
    p.assessments[c.id] = {
      current: excluded ? null : current,
      applicability: excluded ? "Excluded" : "Applicable",
      exclusion: excluded
        ? framework === "dora" ? "Fictional assumption: the authority has not identified this entity for TLPT." : "Fictional assumption: the employer deploys an AI system and does not provide a GPAI model."
        : "",
      target,
      evidence: excluded ? "Missing" : evidence,
      owner:
        i % 3 === 0
          ? scenario.owner
          : i % 3 === 1
            ? "Rin Alvarez"
            : "Ellis Morgan",
      unit: ["Operations", "Technology", "Assurance"][i % 3],
      location: ["North campus", "Field office", "Central office"][i % 3],
      asset: ["Service platform", "Identity provider", "Data store"][i % 3],
      note: !excluded && current > 0 ? "Fictional sample " + (i + 1) + " · " + c.evidence : "",
      finding:
        !excluded && current < target
          ? "Follow up on " +
            c.title.toLowerCase() +
            " across the scoped service."
          : "",
    };
  });
  const legacyRisks = ["nist-csf-2", "iso-27001", "pci-dss"].includes(framework);
  const anchors = {
    "nist-800-53": ["Unreviewed privileged access", "Undetected integrity change", "Delayed flaw remediation"],
    dora: ["Unclear board accountability", "Late major incident notification", "Settlement provider outage"],
    gdpr: ["Incomplete processing inventory", "Undisclosed analytics use", "Delayed breach assessment"],
    "eu-ai-act": ["Incorrect recruitment classification", "Biased candidate ranking", "Ineffective human oversight"],
  };
  const risks = legacyRisks
    ? scenarioRisks(scenario.caseId)
    : anchors[framework as keyof typeof anchors].map((threat, i) => {
        const control = items.filter((item) => p.assessments[item.id].applicability === "Applicable")[i * 2];
        return {
          ...blankRisk(),
          id: `R-${framework}-${i + 1}`,
          asset: scenario.scope,
          threat,
          vulnerability: control.title,
          controls: control.id,
          likelihood: 4 - (i % 2),
          impact: 5 - (i % 2),
          residualLikelihood: 3 - (i % 2),
          residualImpact: 5 - (i % 2),
          treatment: control.example,
          evidence: "Fictional example · " + control.evidence,
          owner: scenario.owner,
        };
      });
  p.risks = risks.map((r, i) => ({
    ...r,
    openedDate: addDays(scenarioDate, -[98, 42, 18, 76, 8, 31][i % 6]),
    reviewDate: addDays(scenarioDate, i * 8 - 5),
  }));
  // Separate dated observations from today's register. Fictional histories are seeded only in demo mode.
  p.history = [
    [4, 5, 3, 1],
    [3, 6, 4, 2],
    [3, 5, 4, 2],
    [2, 4, 5, 3],
    [2, 3, 4, 3],
  ].map((counts, i) => ({ date: addDays(scenarioDate, -7 * (5 - i)), counts }));
  p.tasks = syncPlan({ ...p, tasks: makePlan(framework, true, p.start) }).tasks;
  const sources: Record<Framework, [string, string, string]> = {
    "nist-800-53": ["Identity provider", "Build pipeline", "Component register"],
    dora: ["Payment switch", "Settlement provider", "Incident intake"],
    gdpr: ["Support portal", "Member directory", "Analytics collection"],
    "eu-ai-act": ["Application portal", "Evaluation set", "Human review queue"],
    "pci-dss": ["Checkout", "Merchant portal", "Settlement file"],
    "iso-27001": ["Service desk", "Field operations", "Supplier portal"],
    "nist-csf-2": ["Factory sensors", "Operator portal", "Supplier feed"],
  };
  const source = sources[framework];
  const flows: [string, number, string, string, string[]][] = [
    ["a", 0, source[0], "Event ID", ["d", "e"]],
    ["b", 0, source[1], "User ID", ["d"]],
    ["c", 0, source[2], "Account ID", ["e"]],
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
  const applicable = rows.filter((r) => r.applicability === "Applicable");
  const scored = applicable.filter((r) => r.current !== null);
  const reviewed = applicable.filter((c) => c.evidence === "Reviewed" || c.evidence === "Tested");
  const outstanding = applicable.filter((c) => c.evidence === "Missing" || c.evidence === "Requested");
  const avg = (values: number[]) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const profiles = groups.map((g) => {
    const members = applicable.filter((c) => c.group === g.id),
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
    applicable,
    profiles,
    reviewed,
    outstanding,
    scored,
    current: avg(scored.map((c) => c.current!)),
    target: avg(applicable.map((c) => c.target)),
    met: scored.filter((c) => c.current! >= c.target).length,
    gaps: scored.filter((c) => c.current! < c.target),
    verified: reviewed.length,
  };
}

// Recalculate generated work from remaining gap points while retaining manual task edits.
export function syncPlan(project: Project, previous?: Project): Project {
  const prefix = `remediation:${project.framework}:`;
  if (!project.tasks.some((task) => task.id.startsWith(prefix))) return project;
  const gaps = stats(project).gaps;
  const before = previous ? stats(previous).gaps : [];
  const estimate = (rows: typeof gaps) => Math.max(1, rows.reduce(
    (total, row) => total + row.target - row.current!, 0,
  ));
  const priority = (rows: typeof gaps): Task["priority"] => {
    const highest = Math.max(0, ...rows.map((row) => row.target - row.current!));
    return highest >= 3 ? "High" : highest >= 2 ? "Medium" : "Low";
  };
  const tasks = project.tasks.map((task) => {
    if (!task.id.startsWith(prefix)) return task;
    const group = task.id.slice(prefix.length);
    const old = previous?.tasks.find((row) => row.id === task.id);
    const linked = gaps.filter((row) => row.group === group);
    const oldRows = before.filter((row) => row.group === group);
    const oldEstimate = estimate(oldRows);
    const days = estimate(linked);
    return {
      ...task,
      sourceIds: [group, ...linked.slice(0, 29).map((row) => row.id)],
      priority: old?.priority && old.priority !== priority(oldRows) ? task.priority : priority(linked),
      duration: old && old.duration !== oldEstimate ? task.duration : days,
      effort: old && old.effort !== oldEstimate * 6 ? task.effort : days * 6,
    };
  });
  return { ...project, tasks };
}
