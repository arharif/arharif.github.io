import { draftsSchema } from "./drafts.ts";
import {
  controlDecisionErrors,
  referenceErrors,
  validateTask,
  schedule,
} from "./engines.ts";
import { z } from "./schema.ts";
import {
  studioSchema,
  today,
  createStudio,
  isoDate,
  findingErrors,
} from "./model.ts";
import { scenarioRisks } from "../workspace/risk.ts";
import type { CaseId } from "../data/types.ts";
import { statuses } from "../utils/engines.ts";
const bounded = z.string().max(4000);
const optionalDate = z.union([z.literal(""), isoDate]);
const riskSchema = z
  .object({
    id: z.string().min(1).max(160),
    asset: bounded,
    threat: bounded,
    vulnerability: bounded,
    businessImpact: bounded,
    likelihood: z.number().int().min(1).max(5),
    impact: z.number().int().min(1).max(5),
    residualLikelihood: z.number().int().min(1).max(5),
    residualImpact: z.number().int().min(1).max(5),
    controls: bounded,
    treatment: bounded,
    owner: bounded,
    unit: bounded,
    status: z
      .string()
      .refine(
        (v) => ["Open", "In progress", "Accepted", "Closed"].includes(v),
        "Invalid risk status",
      ),
    reviewDate: optionalDate,
    openedDate: optionalDate,
    evidence: bounded,
  })
  .strict();
const assessmentSchema = z
  .object({
    status: z.enum(
      statuses as [(typeof statuses)[number], ...(typeof statuses)[number][]],
    ),
    notes: bounded,
    evidence: bounded,
    owner: bounded,
    justification: bounded,
  })
  .strict();
export const workspaceSchema = z
  .object({
    rows: z.array(riskSchema).max(2000),
    analysed: z.array(riskSchema).max(2000).nullable(),
    assessments: z.record(z.string(), assessmentSchema),
    assessmentDrafts: z.record(z.string(), assessmentSchema),
    observations: z
      .array(
        z
          .object({
            riskId: z.string().max(160),
            date: isoDate,
            likelihood: z.number().int().min(1).max(5),
            impact: z.number().int().min(1).max(5),
            note: bounded,
          })
          .strict(),
      )
      .max(1000),
    provenance: z.string().max(200),
    asOf: isoDate,
    analysedAsOf: isoDate,
    riskDraft: riskSchema.extend({ id: z.string().max(160) }).nullable(),
    riskEditing: z.string().max(160).nullable(),
    labDrafts: z
      .record(z.string(), z.record(z.string(), z.unknown()))
      .superRefine((v, ctx) => {
        const r = draftsSchema.safeParse(v);
        if (!r.success)
          for (const issue of r.error.issues)
            ctx.addIssue({ ...issue, path: issue.path });
      }),
    studio: studioSchema,
  })
  .strict();
export type WorkspaceData = z.infer<typeof workspaceSchema>;
const envelopeSchema = z
  .object({
    schemaVersion: z.literal(2),
    kind: z.literal("x1-fictional-project"),
    savedAt: z.string().datetime(),
    caseId: z.enum(["paysecure", "petroshield", "smartfactory"]),
    demoId: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9:-]+$/)
      .optional(),
    data: workspaceSchema,
  })
  .strict();
export type ProjectEnvelope = z.infer<typeof envelopeSchema>;
export const retentionDays = 30;
export const projectKey = (caseId: CaseId) =>
  `x1-academic-project-v2-${caseId}`;
export function createWorkspace(caseId: CaseId, date = today()): WorkspaceData {
  return {
    rows: scenarioRisks(caseId),
    analysed: null,
    assessments: {},
    assessmentDrafts: {},
    observations: [],
    provenance: "Fictional educational scenario",
    asOf: date,
    analysedAsOf: date,
    riskDraft: null,
    riskEditing: null,
    labDrafts: {},
    studio: createStudio(caseId, date),
  };
}
function boundedTree(value: unknown, depth = 0, counter = { nodes: 0 }) {
  if (++counter.nodes > 150000 || depth > 14)
    throw new Error(
      "Project nesting or record complexity exceeds the import limit.",
    );
  if (typeof value === "number" && !Number.isFinite(value))
    throw new Error("Non-finite numbers are not accepted.");
  if (typeof value === "string" && value.length > 16000)
    throw new Error("A project text field is too long.");
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length > 8000)
      throw new Error("Project collection is too large.");
    for (const [k, v] of entries) {
      if (["__proto__", "constructor", "prototype"].includes(k))
        throw new Error("Unsafe project property.");
      boundedTree(v, depth + 1, counter);
    }
  }
}
export function encodeProject(
  data: WorkspaceData,
  caseId: CaseId,
  now = new Date(),
  demoId?: string,
): string {
  const parsed = workspaceSchema.parse(data);
  const envelope = {
    schemaVersion: 2 as const,
    kind: "x1-fictional-project" as const,
    savedAt: now.toISOString(),
    caseId,
    demoId,
    data: parsed,
  };
  const raw = JSON.stringify(envelope, null, 2);
  parseProject(raw);
  return raw;
}
export function parseProject(raw: string): ProjectEnvelope {
  if (raw.length > 3_000_000)
    throw new Error(
      "Project must be smaller than 3 MB. Use register exports for larger datasets.",
    );
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("Invalid project JSON.");
  }
  boundedTree(value);
  const result = envelopeSchema.safeParse(value);
  if (!result.success)
    throw new Error(
      `Project schema/version is invalid: ${result.error.issues
        .slice(0, 3)
        .map((i) => i.path.join(".") + ": " + i.message)
        .join("; ")}`,
    );
  const e = result.data;
  for (const a of e.data.studio.activities) {
    if (
      ![a.name, a.purpose, a.dataSubjects, a.categories, a.controller].every(
        (v) => v.trim(),
      )
    )
      throw new Error(
        "Recorded processing activities require name, purpose, subjects, categories and controller.",
      );
  }
  for (const r of e.data.studio.privacyRisks) {
    if (![r.event, r.harm, r.owner, r.assumptions].every((v) => v.trim()))
      throw new Error(
        "Recorded privacy findings require event, individual harm, owner and assumptions.",
      );
  }
  for (const [id, d] of Object.entries(e.data.studio.sp.decisions)) {
    if (d.reviewed) {
      const errors = controlDecisionErrors(d, e.data.studio);
      if (errors.length)
        throw new Error(`Invalid reviewed control ${id}: ${errors.join(" ")}`);
    }
  }
  for (const task of e.data.studio.tasks) {
    const errors = validateTask(task);
    if (errors.length)
      throw new Error(
        `Invalid recorded task ${task.title}: ${errors.join(" ")}`,
      );
  }
  for (const finding of e.data.studio.findings) {
    if (finding.current !== null || finding.applicability === "Excluded") {
      const errors = findingErrors(finding);
      if (errors.length)
        throw new Error(
          `Invalid recorded finding ${finding.controlId}: ${errors.join(" ")}`,
        );
    }
  }
  schedule(
    e.data.studio.tasks,
    e.data.studio.resources,
    e.data.studio.scope.start,
    e.data.studio.calendar,
  );
  const refs = referenceErrors(e.data.studio);
  if (
    e.data.studio.findings.some(
      (f) => f.riskId && !e.data.rows.some((r) => r.id === f.riskId),
    )
  )
    throw new Error("A finding refers to a missing register risk.");
  if (refs.length) throw new Error(refs.join(" "));
  if (e.data.studio.caseId !== e.caseId)
    throw new Error("Project organisation does not match its workspace.");
  const unique = (rows: { id: string }[]) =>
    new Set(rows.map((r) => r.id)).size === rows.length;
  if (
    new Set(e.data.rows.map((r) => r.id.toLowerCase())).size !==
      e.data.rows.length ||
    new Set(
      e.data.studio.findings.map(
        (f) => f.framework + ":" + f.edition + ":" + f.controlId,
      ),
    ).size !== e.data.studio.findings.length
  )
    throw new Error("Duplicate assessment or risk scope keys.");
  if (
    !unique(e.data.rows) ||
    (e.data.analysed && !unique(e.data.analysed)) ||
    !unique(e.data.studio.tasks) ||
    !unique(e.data.studio.findings) ||
    !unique(e.data.studio.activities) ||
    !unique(e.data.studio.privacyRisks) ||
    !unique(e.data.studio.resources)
  )
    throw new Error("Duplicate stable IDs in project.");
  return e;
}
export function isExpired(savedAt: string, now = new Date()) {
  return +now - Date.parse(savedAt) > retentionDays * 86400000;
}
