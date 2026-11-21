import { riskCategory, riskValue } from "../../utils/engines.ts";
import type { CaseId } from "../../data/types.ts";

export const riskFields = [
  "id",
  "asset",
  "threat",
  "vulnerability",
  "businessImpact",
  "likelihood",
  "impact",
  "residualLikelihood",
  "residualImpact",
  "controls",
  "treatment",
  "owner",
  "businessUnit",
  "status",
  "createdAt",
  "reviewDate",
  "evidence",
] as const;
export type RiskField = (typeof riskFields)[number];
export type RiskStatus = "Open" | "In progress" | "Accepted" | "Closed";
export interface RiskRecord {
  id: string;
  asset: string;
  threat: string;
  vulnerability: string;
  businessImpact: string;
  likelihood: number;
  impact: number;
  residualLikelihood: number;
  residualImpact: number;
  controls: string;
  treatment: string;
  owner: string;
  businessUnit: string;
  status: RiskStatus;
  createdAt: string;
  reviewDate: string;
  evidence: string;
  provenance: "Fictional scenario" | "Learner input";
}
export interface ImportIssue {
  row: number;
  field: string;
  message: string;
}
export type SheetValue = string | number | boolean | Date | null;
export type SheetRows = SheetValue[][];
export const labels: Record<RiskField, string> = {
  id: "Risk ID",
  asset: "Asset or service",
  threat: "Threat event",
  vulnerability: "Vulnerability or exposure",
  businessImpact: "Business consequence",
  likelihood: "Inherent likelihood",
  impact: "Inherent impact",
  residualLikelihood: "Residual likelihood",
  residualImpact: "Residual impact",
  controls: "Existing controls",
  treatment: "Treatment action",
  owner: "Accountable owner",
  businessUnit: "Business unit",
  status: "Status",
  createdAt: "Identified date",
  reviewDate: "Review date",
  evidence: "Evidence reference",
};
export const requiredFields: RiskField[] = [
  "id",
  "asset",
  "threat",
  "vulnerability",
  "businessImpact",
  "likelihood",
  "impact",
  "owner",
];
export function isoDate(value: unknown): string {
  if (value === "" || value === null || value === undefined) return "";
  if (value instanceof Date && Number.isFinite(value.getTime()))
    return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text))
    throw new Error("Use a real date in YYYY-MM-DD format.");
  const parsed = new Date(`${text}T00:00:00Z`);
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== text
  )
    throw new Error("Use a real calendar date.");
  return text;
}
export function validateRisk(
  input: Record<string, unknown>,
  row = 1,
  provenance: RiskRecord["provenance"] = "Learner input",
) {
  const issues: ImportIssue[] = [];
  const text = (field: RiskField) => {
    const value = input[field];
    if (value && typeof value === "object") {
      issues.push({ row, field, message: "Use plain text." });
      return "";
    }
    const result = String(value ?? "").trim();
    if (requiredFields.includes(field) && !result)
      issues.push({ row, field, message: `${labels[field]} is required.` });
    if (result.length > 2000)
      issues.push({ row, field, message: "Maximum 2,000 characters." });
    return result;
  };
  const rating = (field: RiskField, fallback?: number) => {
    const raw = input[field];
    const value =
      (raw === undefined || raw === null || raw === "") &&
      fallback !== undefined
        ? fallback
        : Number(raw);
    if (!Number.isInteger(value) || value < 1 || value > 5)
      issues.push({ row, field, message: "Enter an integer from 1 to 5." });
    return value;
  };
  const likelihood = rating("likelihood"),
    impact = rating("impact");
  const result: RiskRecord = {
    id: text("id"),
    asset: text("asset"),
    threat: text("threat"),
    vulnerability: text("vulnerability"),
    businessImpact: text("businessImpact"),
    likelihood,
    impact,
    residualLikelihood: rating("residualLikelihood", likelihood),
    residualImpact: rating("residualImpact", impact),
    controls: text("controls"),
    treatment: text("treatment"),
    owner: text("owner"),
    businessUnit: text("businessUnit") || "Unassigned",
    status: (text("status") || "Open") as RiskStatus,
    createdAt: "",
    reviewDate: "",
    evidence: text("evidence"),
    provenance,
  };
  if (!["Open", "In progress", "Accepted", "Closed"].includes(result.status))
    issues.push({
      row,
      field: "status",
      message: "Use Open, In progress, Accepted or Closed.",
    });
  for (const field of ["createdAt", "reviewDate"] as const) {
    try {
      result[field] = isoDate(input[field]);
    } catch (error) {
      issues.push({ row, field, message: (error as Error).message });
    }
  }
  if (
    result.createdAt &&
    result.reviewDate &&
    result.reviewDate < result.createdAt
  )
    issues.push({
      row,
      field: "reviewDate",
      message: "Review date precedes identification.",
    });
  return { record: result, issues };
}
export function parseCsv(raw: string): SheetRows {
  if (raw.length > 2_000_000) throw new Error("CSV must be smaller than 2 MB.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  const text = raw.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (character === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || cell.length === 0) quoted = !quoted;
      else throw new Error("Unexpected quote in CSV cell.");
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted cell.");
  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length > 501)
    throw new Error("Import supports up to 500 risk records.");
  if (rows.some((value) => value.length > 40))
    throw new Error("Import supports up to 40 columns.");
  return rows;
}
export function guessMapping(
  headers: string[],
): Partial<Record<RiskField, number>> {
  const normal = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return Object.fromEntries(
    riskFields.flatMap((field) => {
      const index = headers.findIndex((header) =>
        [normal(field), normal(labels[field])].includes(normal(header)),
      );
      return index < 0 ? [] : [[field, index]];
    }),
  );
}
export function validateImport(
  rows: SheetRows,
  mapping: Partial<Record<RiskField, number>>,
) {
  if (rows.length > 501)
    throw new Error("Import supports up to 500 risk records.");
  const records: RiskRecord[] = [],
    issues: ImportIssue[] = [];
  const identifiers = new Set<string>();
  rows.slice(1).forEach((cells, index) => {
    const input = Object.fromEntries(
      riskFields.map((field) => [
        field,
        mapping[field] === undefined ? "" : (cells[mapping[field]!] ?? ""),
      ]),
    );
    const result = validateRisk(input, index + 2);
    if (identifiers.has(result.record.id))
      result.issues.push({
        row: index + 2,
        field: "id",
        message: "Risk IDs must be unique.",
      });
    identifiers.add(result.record.id);
    issues.push(...result.issues);
    if (!result.issues.length) records.push(result.record);
  });
  return { records, issues };
}
export function riskAnalytics(rows: RiskRecord[], today: string) {
  const date = Date.parse(`${today}T00:00:00Z`);
  const counts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
  let inherent = 0,
    residual = 0,
    overdue = 0,
    evidenced = 0,
    controlled = 0,
    closed = 0;
  rows.forEach((row) => {
    const before = riskValue(row.likelihood, row.impact, "product"),
      after = riskValue(row.residualLikelihood, row.residualImpact, "product");
    counts[riskCategory(after)]++;
    inherent += before;
    residual += after;
    if (
      row.reviewDate &&
      Date.parse(`${row.reviewDate}T00:00:00Z`) < date &&
      row.status !== "Closed"
    )
      overdue++;
    if (row.evidence) evidenced++;
    if (row.controls) controlled++;
    if (row.status === "Closed") closed++;
  });
  return {
    count: rows.length,
    counts,
    inherent,
    residual,
    overdue,
    evidenced,
    controlled,
    closed,
  };
}
export function ageDays(row: RiskRecord, today: string) {
  return row.createdAt
    ? Math.floor(
        (Date.parse(`${today}T00:00:00Z`) -
          Date.parse(`${row.createdAt}T00:00:00Z`)) /
          86400000,
      )
    : null;
}
export function demoRisks(caseId: CaseId): RiskRecord[] {
  const contexts = {
    paysecure: {
      asset: "Payment authorisation API",
      owner: "Head of Payments",
      businessUnit: "Payments",
      consequence: "Settlement interruption and potential transaction fraud",
    },
    petroshield: {
      asset: "OT vendor access gateway",
      owner: "Production Operations Director",
      businessUnit: "Production",
      consequence: "Loss of monitoring and controlled production slowdown",
    },
    smartfactory: {
      asset: "IIoT telemetry broker",
      owner: "Plant Technology Director",
      businessUnit: "Manufacturing",
      consequence: "Missed anomalies and production quality loss",
    },
  };
  const context = contexts[caseId];
  return [
    [
      "01",
      "Stolen supplier identity alters service configuration",
      "Excessive standing supplier privileges",
      5,
      5,
      4,
      5,
      "Access review",
      "Time-bound roles and independent review",
      "",
      "Open",
      "2026-09-01",
      "2026-11-01",
    ],
    [
      "02",
      "Suspicious changes remain unobserved",
      "Incomplete correlation of service and identity logs",
      4,
      4,
      3,
      4,
      "Central log collection",
      "Test correlated detection and escalation",
      "Synthetic log collection sample E01",
      "In progress",
      "2026-10-01",
      "2026-12-01",
    ],
    [
      "03",
      "Recovery fails after a service interruption",
      "Restoration assumptions have not been tested",
      3,
      5,
      2,
      4,
      "Documented restoration plan",
      "Exercise trusted recovery with operations",
      "",
      "Open",
      "2026-10-15",
      "2026-11-15",
    ],
    [
      "04",
      "Former support identity retains access",
      "Account termination is not reconciled",
      3,
      3,
      1,
      3,
      "Time-limited accounts",
      "Sample terminated supplier accounts",
      "Fictional revocation test AC-04",
      "Closed",
      "2026-10-20",
      "2026-11-18",
    ],
    [
      "05",
      "Changed telemetry degrades detection quality",
      "Evaluation data does not represent new operating conditions",
      4,
      3,
      3,
      3,
      "",
      "Re-evaluate detector on representative holdout data",
      "",
      "Accepted",
      "2026-11-01",
      "2026-12-15",
    ],
  ].map((row) => ({
    id: `${caseId.toUpperCase()}-${row[0]}`,
    ...context,
    threat: String(row[1]),
    vulnerability: String(row[2]),
    businessImpact: context.consequence,
    likelihood: Number(row[3]),
    impact: Number(row[4]),
    residualLikelihood: Number(row[5]),
    residualImpact: Number(row[6]),
    controls: String(row[7]),
    treatment: String(row[8]),
    evidence: String(row[9]),
    status: row[10] as RiskStatus,
    createdAt: String(row[11]),
    reviewDate: String(row[12]),
    provenance: "Fictional scenario",
  }));
}
export interface RiskWorkspaceState {
  version: 1;
  sample: CaseId;
  drafts: RiskRecord[];
  analysed: RiskRecord[];
  snapshots: { date: string; rows: RiskRecord[] }[];
}
export function parseRiskWorkspace(raw: string): RiskWorkspaceState {
  if (raw.length > 4_000_000)
    throw new Error("Risk workspace exceeds the 4 MB restore limit.");
  const value = JSON.parse(raw);
  if (
    !value ||
    value.version !== 1 ||
    !["paysecure", "petroshield", "smartfactory"].includes(value.sample) ||
    !Array.isArray(value.snapshots) ||
    value.snapshots.length > 30
  )
    throw new Error("Unsupported risk workspace format.");
  const records = (input: unknown): RiskRecord[] => {
    if (!Array.isArray(input) || input.length > 500)
      throw new Error("Workspace supports up to 500 records.");
    const ids = new Set<string>();
    return input.map((record, index) => {
      if (
        !record ||
        typeof record !== "object" ||
        !["Fictional scenario", "Learner input"].includes(record.provenance)
      )
        throw new Error("Invalid record provenance.");
      const result = validateRisk(record, index + 1, record.provenance);
      if (result.issues.length || ids.has(result.record.id))
        throw new Error("Invalid or duplicated risk record.");
      ids.add(result.record.id);
      return result.record;
    });
  };
  return {
    version: 1,
    sample: value.sample,
    drafts: records(value.drafts),
    analysed: records(value.analysed),
    snapshots: value.snapshots.map(
      (snapshot: RiskWorkspaceState["snapshots"][number]) => ({
        date: isoDate(snapshot.date),
        rows: records(snapshot.rows),
      }),
    ),
  };
}
