import type { CaseId } from "../data/types.ts";
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
  unit: string;
  status: string;
  reviewDate: string;
  openedDate: string;
  evidence: string;
}
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
  "unit",
  "status",
  "reviewDate",
  "openedDate",
  "evidence",
] as const;
export const riskFieldLabels: Record<(typeof riskFields)[number], string> = {
  id: "Risk ID",
  asset: "Asset",
  threat: "Threat",
  vulnerability: "Vulnerability",
  businessImpact: "Business impact",
  likelihood: "Likelihood",
  impact: "Impact",
  residualLikelihood: "Residual likelihood",
  residualImpact: "Residual impact",
  controls: "Existing controls",
  treatment: "Treatment action",
  owner: "Risk owner",
  unit: "Business unit",
  status: "Status",
  reviewDate: "Review date",
  openedDate: "Opening date",
  evidence: "Evidence reference",
};
export const requiredRiskFields = [
  "id",
  "asset",
  "threat",
  "likelihood",
  "impact",
] as const;
export const riskStatuses = ["Open", "In progress", "Accepted", "Closed"];
export const riskMethod =
  "Educational ordinal index: likelihood × impact, each integer 1–5. Low 1–4, Medium 5–9, High 10–16, Critical 17–25. Residual ratings are separate judgements, defaulting to inherent when omitted. Aggregate indices support prioritisation; they are not money, probabilities or expected loss. Closed risks are excluded from active exposure. No trend is inferred from review or opening dates.";
export const band = (n: number): "Critical" | "High" | "Medium" | "Low" =>
  n >= 17 ? "Critical" : n >= 10 ? "High" : n >= 5 ? "Medium" : "Low";
export const inherentScore = (r: RiskRecord) => r.likelihood * r.impact;
export const residualScore = (r: RiskRecord) =>
  r.residualLikelihood * r.residualImpact;
export function blankRisk(): RiskRecord {
  return {
    id: "",
    asset: "",
    threat: "",
    vulnerability: "",
    businessImpact: "",
    likelihood: 3,
    impact: 3,
    residualLikelihood: 3,
    residualImpact: 3,
    controls: "",
    treatment: "",
    owner: "",
    unit: "",
    status: "Open",
    reviewDate: "",
    openedDate: "",
    evidence: "",
  };
}
export function validDate(raw: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === raw;
}
export function validateRisk(
  raw: Record<string, unknown>,
  ids = new Set<string>(),
): { record: RiskRecord; errors: string[] } {
  const record = blankRisk();
  const errors: string[] = [];
  for (const field of riskFields) {
    if (
      ["likelihood", "impact", "residualLikelihood", "residualImpact"].includes(
        field,
      )
    )
      continue;
    const value = String(raw[field] ?? "").trim();
    if (value.length > 3000) errors.push(`${field}: maximum 3000 characters`);
    (record as unknown as Record<string, unknown>)[field] = value;
  }
  for (const f of requiredRiskFields.slice(0, 3))
    if (!String(raw[f] ?? "").trim()) errors.push(`${f}: required`);
  if (ids.has(record.id.toLowerCase())) errors.push("id: duplicate risk ID");
  for (const field of [
    "likelihood",
    "impact",
    "residualLikelihood",
    "residualImpact",
  ] as const) {
    const fallback =
      field === "residualLikelihood"
        ? raw.likelihood
        : field === "residualImpact"
          ? raw.impact
          : undefined;
    const value =
      raw[field] === "" || raw[field] == null ? fallback : raw[field];
    record[field] = Number(value);
    if (
      value == null ||
      value === "" ||
      !Number.isInteger(record[field]) ||
      record[field] < 1 ||
      record[field] > 5
    )
      errors.push(`${field}: integer from 1 to 5 required`);
  }
  record.status = record.status || "Open";
  if (!riskStatuses.includes(record.status))
    errors.push("status: use Open, In progress, Accepted or Closed");
  for (const field of ["reviewDate", "openedDate"] as const)
    if (record[field] && !validDate(record[field]))
      errors.push(`${field}: use a valid YYYY-MM-DD date`);
  return { record, errors };
}
export function validateRiskRows(
  rows: Record<string, unknown>[],
  mapping: Record<string, string>,
  existing: RiskRecord[] = [],
) {
  const ids = new Set(existing.map((r) => r.id.toLowerCase()));
  const records: RiskRecord[] = [];
  const errors: { row: number; message: string }[] = [];
  if (!rows.length) errors.push({ row: 1, message: "No data rows found." });
  if (rows.length + existing.length > 2000)
    errors.push({ row: 1, message: "Maximum 2000 risks per register." });
  rows.slice(0, 2000).forEach((r, index) => {
    const mapped = Object.fromEntries(
      riskFields.map((f) => [f, mapping[f] ? r[mapping[f]] : ""]),
    );
    const v = validateRisk(mapped, ids);
    if (v.errors.length)
      errors.push({ row: index + 2, message: v.errors.join("; ") });
    else {
      records.push(v.record);
      ids.add(v.record.id.toLowerCase());
    }
  });
  return { records, errors };
}
export function analyseRisks(rows: RiskRecord[], asOf: string) {
  const active = rows.filter((r) => r.status !== "Closed");
  const total = active.length;
  const distribution = Object.fromEntries(
    ["Critical", "High", "Medium", "Low"].map((b) => [
      b,
      active.filter((r) => band(residualScore(r)) === b).length,
    ]),
  );
  const overdue = active.filter((r) => r.reviewDate && r.reviewDate < asOf);
  const ageDays = (r: RiskRecord) =>
    r.openedDate
      ? Math.max(
          0,
          Math.floor((Date.parse(asOf) - Date.parse(r.openedDate)) / 86400000),
        )
      : null;
  const ageing = [
    { label: "0–30 days", test: (n: number) => n <= 30 },
    { label: "31–90 days", test: (n: number) => n > 30 && n <= 90 },
    { label: "91+ days", test: (n: number) => n > 90 },
  ].map((b) => ({
    label: b.label,
    ids: active
      .filter((r) => {
        const d = ageDays(r);
        return d !== null && b.test(d);
      })
      .map((r) => r.id),
  }));
  ageing.push({
    label: "No opening date",
    ids: active.filter((r) => !r.openedDate).map((r) => r.id),
  });
  const grouped = (key: "owner" | "unit") =>
    [...new Set(active.map((r) => r[key] || "Unassigned"))].map((label) => ({
      label,
      value: active.filter((r) => (r[key] || "Unassigned") === label).length,
    }));
  return {
    active,
    total,
    distribution,
    overdue,
    ageing,
    owners: grouped("owner"),
    units: grouped("unit"),
    inherent: active.reduce((s, r) => s + inherentScore(r), 0),
    residual: active.reduce((s, r) => s + residualScore(r), 0),
    withControls: active.filter((r) => r.controls).length,
    withEvidence: active.filter((r) => r.evidence).length,
    treated: rows.filter((r) => r.status === "Closed").length,
  };
}
export function scenarioRisks(caseId: CaseId): RiskRecord[] {
  const asset =
    caseId === "paysecure"
      ? "Payment gateway"
      : caseId === "petroshield"
        ? "OT access gateway"
        : "IIoT telemetry broker";
  const rows = [
    [
      "R-001",
      asset,
      "Supplier account misuse",
      "Standing administrative privileges",
      "Unauthorised changes and service interruption",
      4,
      5,
      3,
      4,
      "Approval workflow",
      "Time-bound access",
      "Access owner",
      "Technology",
      "In progress",
      "2026-12-05",
      "2026-08-01",
      "",
    ],
    [
      "R-002",
      "Identity provider",
      "Credential theft",
      "Weak recovery verification",
      "Account takeover",
      5,
      4,
      4,
      5,
      "MFA for staff",
      "Test supplier MFA coverage",
      "IAM lead",
      "Technology",
      "Open",
      "2026-11-01",
      "2026-07-15",
      "",
    ],
    [
      "R-003",
      "Recovery vault",
      "Ransomware",
      "Unverified restore procedure",
      "Extended outage",
      3,
      5,
      3,
      5,
      "Offline backup",
      "Exercise trusted restoration",
      "Operations lead",
      "Operations",
      "In progress",
      "2026-11-10",
      "2026-09-04",
      "Synthetic backup job reference; restore effectiveness untested",
    ],
    [
      "R-004",
      "Audit log store",
      "Loss of telemetry",
      "Short retention window",
      "Delayed investigation",
      4,
      3,
      3,
      3,
      "Central log collector",
      "Validate coverage and retention",
      "SOC lead",
      "Security",
      "Open",
      "2026-12-10",
      "2026-10-10",
      "",
    ],
    [
      "R-005",
      "Customer portal",
      "Software exploitation",
      "Patch backlog",
      "Information disclosure",
      4,
      4,
      2,
      4,
      "WAF and patch reviews",
      "Patch in approved window",
      "Application owner",
      "Technology",
      "In progress",
      "2026-12-01",
      "2026-10-02",
      "Synthetic patch ticket; independent retest pending",
    ],
    [
      "R-006",
      "Analytics model",
      "Missed anomaly",
      "Changed input distribution",
      "Missed fraud or quality defect",
      3,
      4,
      3,
      4,
      "Human alert review",
      "Revalidate representative holdout",
      "Model owner",
      "Analytics",
      "Open",
      "2026-12-15",
      "2026-11-01",
      "",
    ],
    [
      "R-007",
      "Staff workstation",
      "Phishing",
      "Limited reporting practice",
      "Local account compromise",
      2,
      3,
      2,
      2,
      "MFA and awareness exercise",
      "Repeat reporting exercise",
      "Security lead",
      "Security",
      "Accepted",
      "2026-12-20",
      "2026-11-05",
      "Synthetic exercise attendance only",
    ],
    [
      "R-008",
      "Vendor support portal",
      "Unauthorised access",
      "Expired account",
      "Unapproved support activity",
      2,
      4,
      1,
      3,
      "Account disabled",
      "Validate removal",
      "IAM lead",
      "Technology",
      "Closed",
      "2026-11-18",
      "2026-09-01",
      "Synthetic removal record",
    ],
  ] as const;
  return rows.map(
    (r) =>
      Object.fromEntries(
        riskFields.map((f, i) => [f, r[i]]),
      ) as unknown as RiskRecord,
  );
}
export function autoMapping(headers: string[]) {
  const normal = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases: Record<string, string[]> = {
    id: ["riskid", "riskidentifier"],
    controls: ["existingcontrols"],
    treatment: ["treatmentaction"],
    unit: ["businessunit"],
    openedDate: ["openingdate"],
    businessImpact: ["consequence"],
  };
  return Object.fromEntries(
    riskFields.map((f) => [
      f,
      headers.find(
        (h) =>
          normal(h) === normal(f) ||
          normal(h) === normal(riskFieldLabels[f]) ||
          (aliases[f] || []).includes(normal(h)),
      ) || "",
    ]),
  );
}
