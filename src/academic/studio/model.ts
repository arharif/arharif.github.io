import { z } from "./schema.ts";
import type { CaseId } from "../data/types.ts";
export const stages = [
  "FRAME",
  "DIAGNOSE",
  "DESIGN",
  "PLAN",
  "IMPLEMENT",
  "ASSURE",
  "EMBED",
] as const;
const text = z.string().max(4000),
  short = z.string().max(240),
  id = z
    .string()
    .min(1)
    .max(160)
    .refine(
      (v) => !["__proto__", "constructor", "prototype"].includes(v),
      "Unsafe identifier",
    );
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + "T00:00:00Z");
    return Number.isFinite(+d) && d.toISOString().slice(0, 10) === v;
  }, "Invalid calendar date");
const maybeDate = z.union([z.literal(""), isoDate]);
export const evidenceStates = [
  "None",
  "Learner assertion",
  "Document reviewed",
  "Independently tested",
] as const;
export const findingSchema = z
  .object({
    id,
    framework: short,
    edition: short,
    controlId: short,
    group: short,
    title: short,
    applicability: z.enum(["Applicable", "Excluded"]),
    current: z.number().int().min(0).max(4).nullable(),
    target: z.number().int().min(0).max(4),
    weight: z.number().int().min(1).max(5),
    rationale: text,
    currentState: text,
    targetState: text,
    evidence: text,
    verification: z.enum(evidenceStates),
    reviewer: short,
    owner: short,
    confidence: z.enum(["Low", "Medium", "High"]),
    priority: z.number().int().min(1).max(5),
    riskId: short,
    taskId: short,
    periodStart: maybeDate,
    periodEnd: maybeDate,
    exclusion: text,
  })
  .strict();
export type Finding = z.infer<typeof findingSchema>;
export const taskSchema = z
  .object({
    id,
    title: short,
    stage: z.enum(stages),
    subphase: z.string().max(120).optional(),
    sourceIds: z.array(short).min(1).max(30),
    priority: z.enum(["Low", "Medium", "High"]).optional(),
    owner: short,
    accountable: short,
    consulted: short,
    informed: short,
    resourceId: short,
    effort: z.number().finite().min(0).max(10000),
    duration: z.number().int().min(0).max(730),
    requestedStart: maybeDate,
    deadline: maybeDate,
    dependencies: z.array(id).max(100),
    milestone: z.boolean(),
    status: z.enum([
      "Planned",
      "In progress",
      "Blocked",
      "Implemented",
      "Validated",
    ]),
    progress: z.number().int().min(0).max(100),
    evidence: text,
    validation: z.enum(["Not tested", "Failed", "Passed"]),
    reviewer: short,
  })
  .strict();
export type Task = z.infer<typeof taskSchema>;
export const resourceSchema = z
  .object({
    id,
    name: short,
    hoursPerDay: z.number().min(0.5).max(24),
    rate: z.number().finite().min(0).max(100000),
  })
  .strict();
export type Resource = z.infer<typeof resourceSchema>;
export const activitySchema = z
  .object({
    id,
    name: short,
    purpose: text,
    dataSubjects: text,
    categories: text,
    collection: text,
    use: text,
    sharing: text,
    retentionDays: z.number().int().min(0).max(36500),
    deletion: text,
    controller: short,
    processor: short,
    jurisdiction: short,
    legalReview: z.enum([
      "Not reviewed",
      "Review required",
      "Reviewed by learner",
    ]),
    obligations: text,
    necessity: text,
    proportionality: text,
    rights: text,
    minimisation: text,
  })
  .strict();
export type ProcessingActivity = z.infer<typeof activitySchema>;
export const privacyRiskSchema = z
  .object({
    id,
    activityId: id,
    edition: z.enum(["pf-1.0", "pf-1.1-ipd"]),
    event: text,
    harm: text,
    likelihood: z.number().int().min(1).max(5),
    impact: z.number().int().min(1).max(5),
    residualLikelihood: z.number().int().min(1).max(5),
    residualImpact: z.number().int().min(1).max(5),
    controls: text,
    assumptions: text,
    owner: short,
    escalation: text,
    taskId: short,
  })
  .strict();
export type PrivacyRisk = z.infer<typeof privacyRiskSchema>;
export const scopeSchema = z
  .object({
    mission: text,
    services: text,
    boundary: text,
    stakeholders: text,
    tolerance: text,
    informationTypes: text,
    start: isoDate,
    periodStart: isoDate,
    periodEnd: isoDate,
    objective: text,
  })
  .strict();
export const studioSchema = z
  .object({
    completedSimulations: z.array(short).max(30),
    id,
    caseId: z.enum(["paysecure", "petroshield", "smartfactory"]),
    framework: short,
    edition: short,
    scope: scopeSchema,
    findings: z.array(findingSchema).max(1500),
    tasks: z.array(taskSchema).max(500),
    resources: z.array(resourceSchema).min(1).max(60),
    calendar: z
      .object({
        weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
        holidays: z.array(isoDate).max(500),
      })
      .strict(),
    currency: short,
    budget: z.number().finite().min(0).max(1e10),
    baseline: z
      .array(
        z
          .object({
            id,
            start: isoDate,
            end: isoDate,
            cost: z.number().finite().min(0),
          })
          .strict(),
      )
      .max(500),
    raid: z
      .array(
        z
          .object({
            id,
            type: z.enum(["Risk", "Assumption", "Issue", "Dependency"]),
            description: text,
            owner: short,
            action: text,
          })
          .strict(),
      )
      .max(200),
    activities: z.array(activitySchema).max(100),
    privacyRisks: z.array(privacyRiskSchema).max(300),
    privacyEdition: z.enum(["pf-1.0", "pf-1.1-ipd"]),
    tiers: z
      .object({
        governance: z.number().int().min(1).max(4).nullable(),
        management: z.number().int().min(1).max(4).nullable(),
        target: z.number().int().min(1).max(4),
        rationale: text,
        approver: short,
      })
      .strict(),
    sp: z
      .object({
        edition: z.literal("Rev. 5 / release 5.2.0"),
        confidentiality: z.enum(["Low", "Moderate", "High"]),
        integrity: z.enum(["Low", "Moderate", "High"]),
        availability: z.enum(["Low", "Moderate", "High"]),
        categorisation: text,
        baseline: z.enum(["LOW", "MODERATE", "HIGH"]),
        privacyApplicable: z.boolean(),
        privacyRationale: text,
        decisions: z
          .record(
            id,
            z
              .object({
                reviewed: z.boolean(),
                applicable: z.boolean(),
                rationale: text,
                responsibility: z.enum([
                  "System-specific",
                  "Common",
                  "Inherited",
                ]),
                provider: short,
                status: z.enum([
                  "Not started",
                  "Implementing",
                  "Implemented",
                  "Assessed",
                ]),
                evidence: text,
                assessmentMethod: z.enum(["Examine", "Interview", "Test"]),
                objective: text,
                procedure: text,
                finding: text,
                owner: short,
              })
              .strict(),
          )
          .refine((v) => Object.keys(v).length <= 1500, "Too many decisions"),
      })
      .strict(),
    rubric: z
      .object({
        version: z.literal("X1-EMM-1"),
        labels: z.array(short).length(5),
        weighting: z.enum(["Equal", "Priority-weighted"]),
      })
      .strict(),
    history: z
      .array(
        z
          .object({
            id,
            createdAt: z.string().datetime(),
            label: short,
            summary: z
              .object({
                assessed: z.number().int().nonnegative(),
                current: z.number().nullable(),
                target: z.number().nullable(),
                tasks: z.number().int().nonnegative(),
                cost: z.number().finite().nonnegative(),
              })
              .strict(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();
export type Studio = z.infer<typeof studioSchema>;
export function today(now = new Date()) {
  return now.toISOString().slice(0, 10);
}
export const newId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
export function createStudio(caseId: CaseId, date = today()): Studio {
  return {
    completedSimulations: [],
    id: `project-${caseId}`,
    caseId,
    framework: "nist-csf-2",
    edition: "NIST CSF 2.0 (2024-02-26)",
    scope: {
      mission: "",
      services: "",
      boundary: "",
      stakeholders: "",
      tolerance: "",
      informationTypes: "",
      start: date,
      periodStart: date,
      periodEnd: date,
      objective: "Protect the continuity of the selected critical service.",
    },
    findings: [],
    tasks: [],
    resources: [
      { id: "control-owner", name: "Control owner", hoursPerDay: 8, rate: 100 },
      {
        id: "assessor",
        name: "Independent assessor",
        hoursPerDay: 4,
        rate: 120,
      },
    ],
    calendar: { weekdays: [1, 2, 3, 4, 5], holidays: [] },
    currency: "Fictional units",
    budget: 15000,
    baseline: [],
    raid: [],
    activities: [],
    privacyRisks: [],
    privacyEdition: "pf-1.0",
    tiers: {
      governance: null,
      management: null,
      target: 2,
      rationale: "",
      approver: "",
    },
    sp: {
      edition: "Rev. 5 / release 5.2.0",
      confidentiality: "Low",
      integrity: "Low",
      availability: "Low",
      categorisation: "",
      baseline: "LOW",
      privacyApplicable: false,
      privacyRationale: "",
      decisions: {},
    },
    rubric: {
      version: "X1-EMM-1",
      labels: [
        "Not established",
        "Initial / ad hoc",
        "Repeatable",
        "Defined and managed",
        "Measured and continuously improved",
      ],
      weighting: "Equal",
    },
    history: [],
  };
}
export function findingErrors(f: Finding): string[] {
  const errors: string[] = [];
  const parsed = findingSchema.safeParse(f);
  if (!parsed.success)
    return parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message);
  if (!f.owner.trim()) errors.push("Assign an accountable owner.");
  if (f.applicability === "Excluded") {
    if (!f.exclusion.trim()) errors.push("Justify the scope exclusion.");
    return errors;
  }
  if (!f.rationale.trim()) errors.push("Record the rating rationale.");
  if (f.current === null)
    errors.push("Select a current level or save it as an unassessed draft.");
  if (f.verification !== "None" && !f.evidence.trim())
    errors.push("Provide an evidence reference.");
  if (
    ["Document reviewed", "Independently tested"].includes(f.verification) &&
    !f.reviewer.trim()
  )
    errors.push("Identify the reviewer who performed the review or test.");
  if (f.periodStart && f.periodEnd && f.periodEnd < f.periodStart)
    errors.push("Assessment end must not precede start.");
  return errors;
}
export function newFinding(
  controlId: string,
  title: string,
  group: string,
  framework = "nist-csf-2",
  edition = "2.0",
): Finding {
  return {
    id: newId("finding"),
    framework,
    edition,
    controlId,
    title,
    group,
    applicability: "Applicable",
    current: null,
    target: 3,
    weight: 1,
    rationale: "",
    currentState: "",
    targetState: "",
    evidence: "",
    verification: "None",
    reviewer: "",
    owner: "",
    confidence: "Low",
    priority: 3,
    riskId: "",
    taskId: "",
    periodStart: "",
    periodEnd: "",
    exclusion: "",
  };
}
export function newTask(
  sourceId = "objective:continuity",
  title = "Define implementation action",
  stage: Task["stage"] = "IMPLEMENT",
): Task {
  return {
    id: newId("task"),
    title,
    stage,
    sourceIds: [sourceId],
    owner: "",
    accountable: "",
    consulted: "",
    informed: "",
    resourceId: "control-owner",
    effort: 8,
    duration: 1,
    requestedStart: "",
    deadline: "",
    dependencies: [],
    milestone: false,
    status: "Planned",
    progress: 0,
    evidence: "",
    validation: "Not tested",
    reviewer: "",
  };
}
