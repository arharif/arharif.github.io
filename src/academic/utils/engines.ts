import type {
  AIConfiguration,
  AssessmentStatus,
  CaseArtifact,
  ControlAssessment,
  Prediction,
} from "../data/types.ts";
export const statuses: AssessmentStatus[] = [
  "Not assessed",
  "Implemented and evidenced",
  "Partially implemented",
  "Not implemented",
  "Not applicable",
];
export function riskCategory(value: number) {
  if (!Number.isFinite(value) || value < 1 || value > 25)
    throw new Error("Risk index must be between 1 and 25.");
  if (value <= 4) return "Low";
  if (value <= 9) return "Moderate";
  if (value <= 16) return "High";
  return "Critical";
}
export function riskValue(likelihood: number, impact: number, method: string) {
  if (!["maximum", "product"].includes(method))
    throw new Error("Unknown risk methodology.");
  if (
    ![likelihood, impact].every((n) => Number.isInteger(n) && n >= 1 && n <= 5)
  )
    throw new Error("Ratings must be integers from 1 to 5.");
  return method === "maximum"
    ? Math.max(likelihood, impact) ** 2
    : likelihood * impact;
}
export function validateAssessment(value: ControlAssessment): string[] {
  const errors: string[] = [];
  if (!statuses.includes(value.status))
    errors.push("Choose a recognised status.");
  if (value.status === "Implemented and evidenced" && !value.evidence.trim())
    errors.push("An evidence reference is required for this assertion.");
  if (value.status === "Not applicable" && !value.justification.trim())
    errors.push("Explain why this item is outside the scenario scope.");
  if (value.status !== "Not assessed" && !value.owner.trim())
    errors.push("Assign an accountable owner.");
  return errors;
}
export function gapSummary(
  assessments: Record<string, ControlAssessment>,
  ids: string[],
) {
  const values = ids.map((id) => assessments[id]?.status ?? "Not assessed");
  return {
    total: ids.length,
    unassessed: values.filter((v) => v === "Not assessed").length,
    evidenced: values.filter((v) => v === "Implemented and evidenced").length,
    gaps: values.filter(
      (v) => v === "Not implemented" || v === "Partially implemented",
    ).length,
    excluded: values.filter((v) => v === "Not applicable").length,
  };
}
export const rubric = [
  {
    label: "Business context",
    terms: ["payment", "production", "service", "business", "customer"],
  },
  {
    label: "Assumptions and uncertainty",
    terms: ["assumption", "uncertain", "estimate", "unknown"],
  },
  {
    label: "Effectiveness evidence",
    terms: ["evidence", "test", "sample", "log"],
  },
  {
    label: "Cost and feasibility",
    terms: ["cost", "budget", "window", "feasible"],
  },
  { label: "Remaining exposure", terms: ["residual", "exposure", "remaining"] },
  {
    label: "Decision authority",
    terms: ["owner", "committee", "approve", "authority"],
  },
];
export function challengeResponse(text: string) {
  const words = text.toLowerCase();
  return rubric.map((item) => ({
    label: item.label,
    mentioned: item.terms.some((term) =>
      new RegExp(`\\b${term}\\w*\\b`).test(words),
    ),
  }));
}
export function predictions(config: AIConfiguration): Prediction[] {
  let state = config.seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: 400 }, (_, index) => {
    const label = index < Math.round((400 * config.prevalence) / 100);
    const noise = random();
    const signal = label ? 0.62 : 0.26;
    const featureGain = Math.min(config.features, 6) * 0.025;
    const shiftPenalty = label ? -config.shift * 0.035 : config.shift * 0.025;
    const trainingLeak = config.split === "training" ? (label ? 0.2 : -0.2) : 0;
    const excessFeatures =
      config.split === "holdout"
        ? Math.max(0, config.features - 6) * (noise - 0.5) * 0.1
        : 0;
    const score = Math.max(
      0,
      Math.min(
        1,
        signal +
          (label ? featureGain : -featureGain) +
          (noise - 0.5) * 0.9 +
          shiftPenalty +
          trainingLeak +
          excessFeatures,
      ),
    );
    return { label, score };
  });
}
export function metrics(data: Prediction[], threshold: number) {
  let tp = 0,
    fp = 0,
    tn = 0,
    fn = 0;
  data.forEach((row) => {
    if (row.label && row.score >= threshold) tp++;
    if (!row.label && row.score >= threshold) fp++;
    if (!row.label && row.score < threshold) tn++;
    if (row.label && row.score < threshold) fn++;
  });
  const divide = (a: number, b: number) => (b ? a / b : 0);
  const precision = divide(tp, tp + fp),
    recall = divide(tp, tp + fn);
  return {
    tp,
    fp,
    tn,
    fn,
    precision,
    recall,
    f1: divide(2 * precision * recall, precision + recall),
    fpr: divide(fp, fp + tn),
  };
}
export const incidentActions = [
  {
    id: "telemetry",
    label: "Request correlated telemetry",
    required: 0,
    feedback:
      "Adds identity, gateway and service context. Correlation improves confidence before disruptive action.",
    disruption: "Low",
  },
  {
    id: "preserve",
    label: "Preserve the evidence snapshot",
    required: 1,
    feedback:
      "Preserve timestamps, source identifiers and access history. Record collection scope and integrity before changes.",
    disruption: "Low",
  },
  {
    id: "restrict",
    label: "Restrict the suspicious identity",
    required: 2,
    feedback:
      "Targeted restriction is defensible after corroborating the identity and session. Coordinate business continuity and preserve the audit trail.",
    disruption: "Medium",
  },
  {
    id: "isolate",
    label: "Request asset isolation approval",
    required: 3,
    feedback:
      "Escalate to the service owner. Industrial isolation requires operations and safety approval. A request does not imply safe execution.",
    disruption: "High if executed",
  },
  {
    id: "recover",
    label: "Initiate a recovery review",
    required: 2,
    feedback:
      "Validate trusted recovery points, revoked sessions and monitoring before restoration. Recovery requires evidence of containment.",
    disruption: "Medium",
  },
  {
    id: "notify",
    label: "Notify the incident commander",
    required: 1,
    feedback:
      "Communicate observed facts, affected service and uncertainty. Legal and contractual notification decisions require authorised review.",
    disruption: "Low",
  },
];
export function incidentFeedback(actionId: string, evidenceCount: number) {
  const action = incidentActions.find((item) => item.id === actionId);
  if (!action) throw new Error("Unknown incident action.");
  return {
    ...action,
    premature: evidenceCount < action.required,
    message:
      evidenceCount < action.required
        ? `Premature decision. Mark at least ${action.required} relevant events and explain their relationship before this action. ${action.feedback}`
        : action.feedback,
  };
}
export const initiatives = [
  {
    id: "identity",
    title: "Access review & privileged identity",
    cost: 30,
    exposure: 3,
    evidence: 2,
    weeks: 3,
    dependency: "Service owner approves role boundaries",
  },
  {
    id: "telemetry",
    title: "Correlated telemetry & response exercise",
    cost: 25,
    exposure: 2,
    evidence: 3,
    weeks: 2,
    dependency: "Log retention and incident lead",
  },
  {
    id: "recovery",
    title: "Recovery validation & resilience test",
    cost: 35,
    exposure: 3,
    evidence: 2,
    weeks: 4,
    dependency: "Operations maintenance window",
  },
  {
    id: "assurance",
    title: "Independent evidence sampling",
    cost: 20,
    exposure: 0,
    evidence: 4,
    weeks: 2,
    dependency: "Implemented controls and assessor independence",
  },
  {
    id: "ai",
    title: "AI evaluation & governance gate",
    cost: 25,
    exposure: 2,
    evidence: 2,
    weeks: 3,
    dependency: "Representative validation data and model owner",
  },
];
export function budgetResult(selected: string[], budget: number) {
  const rows = initiatives.filter((item) => selected.includes(item.id));
  const cost = rows.reduce((sum, row) => sum + row.cost, 0);
  return {
    cost,
    remaining: budget - cost,
    overBudget: cost > budget,
    exposurePoints: rows.reduce((sum, row) => sum + row.exposure, 0),
    evidencePoints: rows.reduce((sum, row) => sum + row.evidence, 0),
    weeks: Math.max(0, ...rows.map((row) => row.weeks)),
  };
}
export function csv(rows: Record<string, unknown>[]) {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const cell = (value: unknown) => {
    let text =
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value ?? "");
    if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [
    headers.map(cell).join(","),
    ...rows.map((row) => headers.map((key) => cell(row[key])).join(",")),
  ].join("\r\n");
}
function validateImportedValue(value: unknown, depth = 0): boolean {
  if (depth > 8) return false;
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "string") return value.length <= 10000;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value))
    return (
      value.length <= 500 &&
      value.every((item) => validateImportedValue(item, depth + 1))
    );
  if (typeof value !== "object") return false;
  const entries = Object.entries(value);
  return (
    entries.length <= 100 &&
    entries.every(
      ([key, item]) =>
        !["__proto__", "constructor", "prototype"].includes(key) &&
        validateImportedValue(item, depth + 1),
    )
  );
}
export function parseCaseArtifact(raw: string): CaseArtifact {
  if (raw.length > 100000)
    throw new Error("Import must be smaller than 100 KB.");
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object")
    throw new Error("Expected a case artifact.");
  const item = data as Record<string, unknown>;
  if (
    !validateImportedValue(item.results) ||
    !Number.isFinite(Date.parse(String(item.generatedAt)))
  )
    throw new Error("Invalid or overly complex case artifact.");
  if (
    item.schemaVersion !== 1 ||
    item.kind !== "x1-case-state" ||
    !["paysecure", "petroshield", "smartfactory"].includes(
      String(item.caseId),
    ) ||
    typeof item.title !== "string" ||
    typeof item.generatedAt !== "string" ||
    typeof item.methodology !== "string" ||
    typeof item.disclaimer !== "string" ||
    !item.results ||
    typeof item.results !== "object" ||
    Array.isArray(item.results)
  )
    throw new Error("Unsupported or invalid case artifact.");
  return {
    schemaVersion: 1,
    kind: "x1-case-state",
    caseId: item.caseId as CaseArtifact["caseId"],
    title: item.title.slice(0, 200),
    generatedAt: item.generatedAt,
    methodology: item.methodology.slice(0, 2000),
    disclaimer: item.disclaimer,
    results: item.results as Record<string, unknown>,
  };
}
