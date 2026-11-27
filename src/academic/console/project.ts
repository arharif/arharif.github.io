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
  residualScore,
  type RiskRecord,
} from "../workspace/risk";
import { baselineIds, catalogue, frameworkIds, cases, nistActiveIds, nistParent, type Framework } from "./catalogue";

import { frameworkMetadata } from "./editions";
import { pciExamples } from "../data/pci401";

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
  soa: z.enum(["Pending", "Included", "Excluded"]).default("Pending"),
  selection: z.enum(["System-specific", "Inherited", "Shared"]).default("System-specific"),
  tailoring: z.string().max(3000).default(""),
  treatment: z.enum(["Undecided", "Modify", "Avoid", "Share", "Retain"]).default("Undecided"),
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
  soa: "Pending",
  selection: "System-specific",
  tailoring: "",
  treatment: "Undecided",
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
const scope = z.object({
  baseline: z.enum(["ALL", "LOW", "MODERATE", "HIGH", "NONE"]),
  privacy: z.boolean(),
  added: z.array(short).max(1200),
  overlay: short,
  context: z.string().max(3000),
  decision: z.string().max(3000),
  decisionType: short.default(""),
  evidenceRef: short.default(""),
  tier: z.enum(["", "1", "2", "3", "4"]),
  targetTier: z.enum(["", "1", "2", "3", "4"]),
});
const defaultScope: z.infer<typeof scope> = {
  baseline: "ALL", privacy: false, added: [], overlay: "", context: "", decision: "", decisionType: "", evidenceRef: "", tier: "", targetTier: "",
};
const generatedEstimate = z.object({
  duration: z.number().int().min(1).max(730),
  effort: z.number().finite().min(0).max(10000),
  priority: z.enum(["Low", "Medium", "High"]),
});
const projectSchema = z.object({
  version: z.literal(1),
  framework: z.enum(frameworkIds),
  demo: z.boolean(),
  scope: scope.default(defaultScope),
  name: short.min(1),
  start: isoDate,
  assessments: z.record(short, assessment),
  risks: z.array(riskSchema).max(2000),
  tasks: z.array(taskSchema).max(500),
  automaticEstimates: z.record(short, generatedEstimate).default({}),
  planIssue: z.string().max(1000).default(""),
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
  if (p.framework === "iso-27001") allowed.add("ISO-A.5"); // Retain the historic aggregate in project exports.
  if (p.framework === "nist-800-53" && p.scope.added.some((id) => !nistActiveIds.has(id)))
    throw Error("Unknown overlay or tailored control.");
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
    scope: { ...defaultScope },
    name: "My assessment",
    start: today(),
    assessments: {},
    risks: [],
    tasks: [],
    automaticEstimates: {},
    planIssue: "",
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
  const [scoping, design, validation] = frameworkMetadata[framework].plan;
  const stages: [Task["stage"], string, string, number][] = [
    ["FRAME", scoping, "lead", 3],
    ["DIAGNOSE", "Inventory and evidence review", "assessor", 5],
    ["DESIGN", design, "control-owner", 4],
    ["PLAN", "Approve treatment plan", "lead", 0],
    ["ASSURE", validation, "assessor", 5],
    ["EMBED", "Management sign-off", "lead", 0],
  ];
  const tasks: Task[] = [];
  stages.forEach(([stage, title, resourceId, days], i) => {
    const t = newTask("objective:" + framework + ":" + stage, title, stage);
    t.id = `roadmap:${framework}:${i}`;
    const progress = demo && i < 4 ? 100 : 0;
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
  const demoNist = new Set(["AC-2", "AU-6", "CM-3", "IR-4", "RA-5", "SA-15", "SI-2", "SI-7", "SR-11", "SA-15(13)", "SA-24", "SI-2(7)"]);
  if (framework === "nist-800-53") p.scope = { ...p.scope, baseline: "MODERATE", added: [...demoNist].filter((id) => !baselineIds("MODERATE").includes(id)) };
  const pciSampleIds = new Set(pciExamples.map(([id]) => id));
  const sample = items.filter((item) => framework === "nist-800-53"
    ? demoNist.has(item.id)
    : framework === "iso-27001" && item.id.startsWith("A.") ? /^A\.[5-8]\.[1-3]$/.test(item.id)
    : framework === "pci-dss" ? pciSampleIds.has(item.id) : true);
  sample.forEach((c, i) => {
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
      (framework === "eu-ai-act" && c.group === "V");
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
      note: !excluded && current > 0 ? "SAMPLE DATA " + (i + 1) + " · " + c.evidence : "",
      soa: framework === "iso-27001" && c.id.startsWith("A.") ? "Included" : "Pending",
      selection: "System-specific",
      tailoring: framework === "iso-27001" && c.id.startsWith("A.") ? "SAMPLE DATA · Selected for the scoped service and recorded in the draft risk treatment plan." : "",
      treatment: framework === "iso-27001" && c.id.startsWith("A.") && current < target ? "Modify" : "Undecided",
      finding:
        !excluded && current < target
          ? "Follow up on " +
            c.title.toLowerCase() +
            " across the scoped service."
          : "",
    };
  });
  const existingRiskLinks = {
    "nist-csf-2": ["PR.AA-05", "PR.AA-03", "PR.DS-11", "DE.CM-09", "ID.RA-01", "DE.AE-02", "PR.AT-01", "PR.AA-01"],
    "iso-27001": ["A.8.2", "A.8.5", "A.8.13", "A.8.15", "A.8.8", "", "A.6.3", "A.5.18"],
    "pci-dss": ["7.2.2", "8.4.2", "", "10.5.1", "6.3.3", "", "5.4.1", "7.2.2"],
  } as const;
  const anchors = {
    "nist-800-53": [["AC-2", "Unreviewed privileged access"], ["SI-7", "Undetected integrity change"], ["SI-2", "Delayed flaw remediation"]],
    dora: [["Art. 5", "Unclear board accountability"], ["Art. 19", "Late major incident notification"], ["Art. 28", "Settlement provider outage"]],
    gdpr: [["Art. 30", "Incomplete processing inventory"], ["Arts. 5–6", "Undisclosed analytics use"], ["Arts. 33–34", "Delayed breach assessment"]],
    "eu-ai-act": [["Arts. 2–3, 6", "Incorrect recruitment classification"], ["Arts. 9–10", "Biased candidate ranking"], ["Arts. 26–27", "Ineffective human oversight"]],
  };
  const risks = framework in existingRiskLinks
    ? scenarioRisks(scenario.caseId).map((risk, i) => ({
        ...risk,
        controls: existingRiskLinks[framework as keyof typeof existingRiskLinks][i],
        evidence: risk.evidence ? "SAMPLE DATA · " + risk.evidence : "",
      }))
    : anchors[framework as keyof typeof anchors].map(([id, threat], i) => {
        const control = items.find((row) => row.id === id)!;
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
          evidence: "SAMPLE DATA · " + control.evidence,
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
  const scheduled = syncPlan({ ...p, tasks: makePlan(framework, true, p.start) });
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
  return { ...p, tasks: scheduled.tasks, automaticEstimates: scheduled.automaticEstimates, planIssue: scheduled.planIssue };
}
export function stats(p: Project) {
  const { items, groups } = catalogue(p.framework);
  const scope = p.scope ?? defaultScope;
  const selected = new Set([
    ...(scope.baseline !== "ALL" && scope.baseline !== "NONE" ? baselineIds(scope.baseline) : []),
    ...(scope.privacy ? baselineIds("PRIVACY") : []),
    ...scope.added,
    ...scope.added.flatMap((id) => {
      const parent = nistParent(id);
      return parent ? [parent] : [];
    }),
  ]);
  const rows = items.filter((control) => !control.withdrawn &&
    (p.framework !== "nist-800-53" || scope.baseline === "ALL" || selected.has(control.id)) &&
    (p.framework !== "pci-dss" || !control.id.startsWith("PCI-") || p.assessments[control.id]),
  ).map((c) => ({ ...c, ...(p.assessments[c.id] ?? unassessed) }));
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

// Keep one scheduled work package per group. Exact findings and linked risks
// remain available in the register even when the task's reference list is capped.
export function riskControls(reference: string) {
  // A grouped legal citation can contain commas. Semicolons and new lines
  // separate explicit identifiers; comma lists are supported for simple IDs.
  return reference.split(/[;\n]+/).flatMap((entry) =>
    /^Arts?\./i.test(entry.trim()) ? entry.trim() : entry.split(",").map((id) => id.trim()),
  ).filter(Boolean);
}
function residualByControl(source?: Project) {
  const map = new Map<string, number>();
  for (const risk of source?.risks ?? []) {
    if (risk.status === "Closed") continue;
    for (const id of riskControls(risk.controls)) {
      const key = id.toUpperCase();
      map.set(key, Math.max(map.get(key) ?? 0, residualScore(risk)));
    }
  }
  return map;
}
export function syncPlan(project: Project, previous?: Project): Project {
  const prefix = `remediation:${project.framework}:`;
  const gaps = stats(project).gaps;
  const oldGaps = previous ? stats(previous).gaps : [];
  if (!project.tasks.length && !gaps.length) return { ...project, planIssue: "" };
  const currentRisks = residualByControl(project);
  const previousRisks = residualByControl(previous);
  const estimates = (rows: typeof gaps, risks: Map<string, number>) => {
    const gap = Math.max(0, ...rows.map((row) => row.target - row.current!));
    const risk = Math.max(0, ...rows.map((row) => risks.get(row.id.toUpperCase()) ?? 0));
    const priority = risk >= 10 || gap >= 3 ? "High" : risk >= 5 || gap >= 2 ? "Medium" : "Low";
    const duration = Math.min(730, Math.max(1, rows.reduce((total, row) => total + row.target - row.current!, 0)));
    return { priority, duration, effort: duration * 6 } satisfies z.infer<typeof generatedEstimate>;
  };
  const generated = project.tasks.some(t => t.id.startsWith(`roadmap:${project.framework}:`));
  const scaffold = makePlan(project.framework, project.demo, project.start);
  const schedule = generated || !gaps.length || project.tasks.length + scaffold.length > 500
    ? project.tasks : [...scaffold, ...project.tasks];
  const approval = schedule.find((task) => task.stage === "PLAN" && task.id.startsWith("roadmap:"));
  const assurance = schedule.find((task) => task.stage === "ASSURE" && task.id.startsWith("roadmap:"));
  const tasks = [...schedule];
  const automaticEstimates = { ...project.automaticEstimates };
  for (const group of catalogue(project.framework).groups) {
    const id = prefix + group.id;
    const linked = gaps.filter((row) => row.group === group.id)
      .sort((a, b) => (currentRisks.get(b.id.toUpperCase()) ?? 0) - (currentRisks.get(a.id.toUpperCase()) ?? 0) || b.target - b.current! - (a.target - a.current!));
    const index = tasks.findIndex((task) => task.id === id);
    const task = tasks[index];
    if (!linked.length && (!task || !oldGaps.some((row) => row.group === group.id))) continue;
    const next = estimates(linked, currentRisks);
    const old = automaticEstimates[id] ?? estimates(oldGaps.filter((row) => row.group === group.id), previousRisks);
    automaticEstimates[id] = next;
    const sourceIds = [group.id, ...linked.slice(0, 29).map((row) => row.id)];
    if (task) {
      tasks[index] = {
        ...task, sourceIds: linked.length ? sourceIds : task.sourceIds,
        duration: task.duration === old.duration ? next.duration : task.duration,
        effort: task.effort === old.effort ? next.effort : task.effort,
        priority: !task.priority || task.priority === old.priority ? next.priority : task.priority,
      };
    } else if (tasks.length < 500) {
      const first = linked[0];
      tasks.push({
        ...newTask(first.id, group.title + " controls", "IMPLEMENT"),
        id, sourceIds, ...next,
        owner: first.owner || (project.demo ? cases[project.framework].owner : "Unassigned"),
        dependencies: approval ? [approval.id] : [],
        evidence: (`${first.id}: ${first.example} Evidence: ${first.evidence}`).slice(0, 3000),
      });
    }
  }
  if (assurance && approval) {
    const index = tasks.findIndex((task) => task.id === assurance.id);
    const existing = new Set(assurance.dependencies);
    // Only the generated predecessor list is managed automatically.
    if (existing.has(approval.id)) {
      tasks[index] = {
        ...assurance,
        dependencies: [...new Set([...assurance.dependencies, ...tasks.filter((t) => t.id.startsWith(prefix)).map((t) => t.id)])].slice(0, 100),
      };
    }
  }
  try {
    plan(tasks, project.start);
    return { ...project, tasks, automaticEstimates, planIssue: "" };
  } catch (error) {
    // Assessments and risk edits remain valid even when the proposed schedule
    // does not fit. Keep the last valid tasks and estimate provenance together.
    const message = error instanceof Error ? error.message : "The revised schedule could not be calculated.";
    return { ...project, planIssue: message.slice(0, 1000) };
  }
}
