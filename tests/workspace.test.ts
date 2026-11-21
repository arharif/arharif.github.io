import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  analyseRisks,
  autoMapping,
  blankRisk,
  scenarioRisks,
  validateRiskRows,
  validateRisk,
  validDate,
} from "../src/academic/workspace/risk.ts";
import { parseCsv } from "../src/academic/workspace/spreadsheets.ts";
import { csv, metrics, predictions } from "../src/academic/utils/engines.ts";
test("risk analysis excludes closed exposure and counts dated overdue, evidence and owner records", () => {
  const rows = scenarioRisks("paysecure");
  const a = analyseRisks(rows, "2026-11-20");
  assert.equal(a.total, 7);
  assert.equal(a.residual, 12 + 20 + 15 + 9 + 8 + 12 + 4);
  assert.equal(a.inherent, 20 + 20 + 15 + 12 + 16 + 12 + 6);
  assert.equal(a.overdue.length, 2);
  assert.equal(a.withEvidence, 3);
  assert.equal(a.treated, 1);
  assert.equal(
    Object.values(a.distribution).reduce((a, b) => a + b, 0),
    7,
  );
  assert.equal(
    a.ageing.reduce((n, b) => n + b.ids.length, 0),
    7,
  );
  assert.equal(
    a.owners.reduce((n, b) => n + b.value, 0),
    7,
  );
});
test("validation checks bounds, duplicate IDs, dates, statuses and fallback residual ratings", () => {
  const row = {
    ...blankRisk(),
    id: "A",
    asset: "API",
    threat: "Misuse",
    likelihood: 4,
    impact: 5,
    residualLikelihood: "",
    residualImpact: "",
  };
  const valid = validateRisk(row);
  assert.deepEqual(valid.errors, []);
  assert.equal(valid.record.residualLikelihood, 4);
  assert.equal(valid.record.residualImpact, 5);
  assert.ok(validateRisk({ ...row, impact: 6 }).errors.length);
  assert.ok(validateRisk({ ...row, reviewDate: "2026-02-30" }).errors.length);
  assert.ok(validateRisk({ ...row, status: "Unknown" }).errors.length);
  assert.ok(validateRisk(row, new Set(["a"])).errors.length);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-02-29"), false);
});
test("spreadsheet mapping validates rows atomically and identifies source row numbers", () => {
  const headers = ["Risk ID", "Asset", "Threat", "Likelihood", "Impact"];
  const mapping = autoMapping(headers);
  assert.equal(mapping.id, "Risk ID");
  const rows = [
    {
      "Risk ID": "A",
      Asset: "API",
      Threat: "Misuse",
      Likelihood: 4,
      Impact: 5,
    },
    {
      "Risk ID": "a",
      Asset: "API",
      Threat: "Misuse",
      Likelihood: 2,
      Impact: 2,
    },
    {
      "Risk ID": "B",
      Asset: "API",
      Threat: "Misuse",
      Likelihood: 0,
      Impact: 4,
    },
  ];
  const r = validateRiskRows(rows, mapping);
  assert.equal(r.records.length, 1);
  assert.deepEqual(
    r.errors.map((e) => e.row),
    [3, 4],
  );
});
test("CSV handles quotes, BOM, CRLF and embedded newlines; rejects unclosed input", () => {
  assert.deepEqual(parseCsv('id,notes\r\nA,"line1\nline2, ""quoted"""\r\n'), [
    ["id", "notes"],
    ["A", 'line1\nline2, "quoted"'],
  ]);
  assert.throws(() => parseCsv('id\n"unclosed'));
  assert.match(csv([{ id: "=SUM(A1)", text: 'a,b"' }]), /'=SUM/);
});
test("CSF source snapshot contains six Functions, 22 Categories and 106 unique outcomes", () => {
  const c = JSON.parse(
    readFileSync("src/academic/data/csf-catalog.json", "utf8"),
  );
  assert.equal(c.functions.length, 6);
  assert.equal(c.functions.flatMap((f: any) => f.categories).length, 22);
  const ids = c.functions.flatMap((f: any) =>
    f.categories.flatMap((c: any) => c.outcomes.map((o: any) => o.id)),
  );
  assert.equal(ids.length, 106);
  assert.equal(new Set(ids).size, 106);
  assert.ok(ids.includes("RC.RP-06"));
  assert.equal(c.sha256.length, 64);
});
test("AI thresholds operate on the same reproducible data and preserve confusion count totals", () => {
  const config = {
    threshold: 0.5,
    prevalence: 5,
    shift: 2,
    features: 4,
    split: "holdout" as const,
    seed: 42,
  };
  const data = predictions(config);
  assert.deepEqual(data, predictions({ ...config, threshold: 0.9 }));
  const a = metrics(data, 0.2),
    b = metrics(data, 0.8);
  assert.equal(a.tp + a.fp + a.tn + a.fn, 400);
  assert.equal(a.tp + a.fn, 20);
  assert.ok(a.recall >= b.recall);
  assert.ok(a.fpr >= b.fpr);
  const exact = metrics(
    [
      { label: true, score: 0.8 },
      { label: false, score: 0.7 },
      { label: true, score: 0.1 },
    ],
    0.5,
  );
  assert.equal(exact.precision, 0.5);
  assert.equal(exact.recall, 0.5);
  assert.equal(exact.f1, 0.5);
});
