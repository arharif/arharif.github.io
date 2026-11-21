import test from "node:test";
import assert from "node:assert/strict";
import {
  demoRisks,
  parseCsv,
  validateImport,
  guessMapping,
  parseRiskWorkspace,
  riskAnalytics,
  validateRisk,
  ageDays,
  riskFields,
  labels,
  isoDate,
} from "../src/academic/features/risk-register/model.ts";
import {
  generatePlan,
  schedule,
  parsePlan,
  timelineOffsets,
  dateAt,
  planSummary,
} from "../src/academic/features/implement/engine.ts";
import { standards } from "../src/academic/data/standards.ts";
import { teachingItems } from "../src/academic/features/standards/items.ts";
import {
  readWorkbook,
  workbookBytes,
  validateWorkbookZip,
} from "../src/academic/features/risk-register/spreadsheet.ts";
import { csv } from "../src/academic/utils/engines.ts";

test("CSV quoted delimiters, embedded newlines, BOM and doubled quotes parse correctly", () => {
  const rows = parseCsv(
    '\uFEFFid,asset,notes\r\nR1,"Payment, API","a ""quote""\nand newline"\r\n',
  );
  assert.deepEqual(rows, [
    ["id", "asset", "notes"],
    ["R1", "Payment, API", 'a "quote"\nand newline'],
  ]);
  assert.throws(() => parseCsv('id\n"unfinished'));
  assert.throws(() => parseCsv("x\n".repeat(502)));
});
test("risk import maps human headers and reports row-level invalid and duplicate records", () => {
  const row = demoRisks("paysecure")[0];
  const headers = riskFields.map((field) => labels[field]);
  const values = riskFields.map((field) => row[field]);
  const mapping = guessMapping(headers);
  const result = validateImport([headers, values, values], mapping);
  assert.equal(result.records.length, 1);
  assert.ok(
    result.issues.some((issue) => issue.row === 3 && issue.field === "id"),
  );
  const invalid = validateRisk({
    ...row,
    likelihood: 6,
    reviewDate: "2026-02-30",
  });
  assert.ok(invalid.issues.some((issue) => issue.field === "likelihood"));
  assert.ok(invalid.issues.some((issue) => issue.field === "reviewDate"));
});
test("risk analysis is derived from submitted records and UTC date boundaries", () => {
  const rows = demoRisks("paysecure"),
    result = riskAnalytics(rows, "2026-11-21");
  assert.equal(result.count, 5);
  assert.equal(result.inherent, 77);
  assert.equal(result.residual, 52);
  assert.equal(result.counts.Critical, 1);
  assert.equal(result.overdue, 2);
  assert.equal(ageDays(rows[0], "2026-09-02"), 1);
  assert.throws(() => isoDate("2026-02-30"));
  assert.equal(isoDate("2024-02-29"), "2024-02-29");
  assert.equal(riskAnalytics([], "2026-11-21").residual, 0);
});
test("all supported standards generate acyclic, owner-assigned implementation plans", () => {
  assert.ok(standards.length >= 24);
  assert.equal(new Set(standards.map((row) => row.id)).size, standards.length);
  for (const standard of standards) {
    const plan = generatePlan(
      standard.id,
      "Fictional service",
      "2026-11-21",
      "Service owner",
    );
    const tasks = schedule(plan);
    assert.equal(tasks.length, standard.nodes.length * 2 + 3);
    assert.ok(tasks.every((task) => task.owner && task.end >= task.start));
    assert.equal(parsePlan(JSON.stringify(plan)).framework, standard.id);
  }
});
test("Gantt finish-to-start scheduling recalculates dependent dates and rejects cycles", () => {
  const plan = generatePlan("nist-csf-2", "PaySecure", "2026-11-21", "Owner");
  const original = schedule(plan);
  plan.tasks[0].duration += 7;
  const changed = schedule(plan);
  assert.equal(
    changed.find((row) => row.id === "area-1")!.offset,
    original.find((row) => row.id === "area-1")!.offset + 7,
  );
  plan.tasks[0].dependencies = ["milestone"];
  assert.throws(() => schedule(plan), /cycle/);
  plan.tasks[0].dependencies = ["missing"];
  assert.throws(() => schedule(plan), /Unknown/);
  assert.equal(dateAt("2026-12-31", 1), "2027-01-01");
});
test("Gantt progress, delays and imported values enforce declared bounds", () => {
  const plan = generatePlan(
    "gdpr",
    "Fictional processing",
    "2026-01-01",
    "Owner",
  );
  const tasks = schedule(plan);
  assert.equal(planSummary(tasks, "2026-11-21").delayed, tasks.length);
  plan.tasks[0].progress = 101;
  assert.throws(() => parsePlan(JSON.stringify(plan)));
  assert.throws(() => parsePlan(" ".repeat(500001)));
});
test("framework hierarchy includes six CSF Functions and meaningful scoped items", () => {
  const csf = standards.find((row) => row.id === "nist-csf-2")!;
  assert.deepEqual(
    csf.nodes.map((row) => row.id),
    ["GOVERN", "IDENTIFY", "PROTECT", "DETECT", "RESPOND", "RECOVER"],
  );
  const items = csf.nodes.flatMap((row) => teachingItems(csf.id, row));
  assert.ok(items.some((row) => row.id === "PR.AA-05"));
  assert.ok(items.some((row) => row.id === "GV.OC"));
  assert.equal(new Set(items.map((row) => row.id)).size, items.length);
  assert.equal(standards.find((row) => row.id === "nis2")!.kind, "Directive");
  assert.equal(standards.find((row) => row.id === "dora")!.kind, "Regulation");
});
test("Excel input template round-trips through local import and column validation", async () => {
  const rows = demoRisks("paysecure");
  const bytes = await workbookBytes(rows, true);
  validateWorkbookZip(bytes);
  const sheets = await readWorkbook(bytes);
  const sheet = sheets.find((row) => row.name === "Risk input")!;
  const result = validateImport(
    sheet.rows,
    guessMapping(sheet.rows[0].map(String)),
  );
  assert.equal(result.issues.length, 0);
  assert.equal(result.records.length, rows.length);
  assert.equal(result.records[0].likelihood, 5);
  assert.equal(result.records[0].asset, rows[0].asset);
  assert.throws(() => validateWorkbookZip(new Uint8Array([1, 2, 3])));
});
test("CSV exports protect formula-like imported values", () => {
  assert.match(
    csv([{ owner: '=HYPERLINK("https://invalid.example")' }]),
    /'=HYPERLINK/,
  );
});

test("risk workspaces validate session records and preserve provenance", () => {
  const rows = demoRisks("paysecure");
  const restored = parseRiskWorkspace(
    JSON.stringify({
      version: 1,
      sample: "paysecure",
      drafts: rows,
      analysed: rows,
      snapshots: [],
    }),
  );
  assert.equal(restored.drafts.length, 5);
  assert.equal(restored.drafts[0].provenance, "Fictional scenario");
  assert.throws(() =>
    parseRiskWorkspace(
      JSON.stringify({ ...restored, drafts: [{ ...rows[0], likelihood: 9 }] }),
    ),
  );
});
test("Gantt month ticks follow real calendar boundaries", () => {
  assert.deepEqual(timelineOffsets("2024-01-31", 65, "month"), [0, 1, 30, 61]);
  assert.deepEqual(timelineOffsets("2026-11-21", 15, "week"), [0, 7, 14]);
});
