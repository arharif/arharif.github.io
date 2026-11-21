import test from "node:test";
import assert from "node:assert/strict";
import {
  budgetResult,
  challengeResponse,
  csv,
  gapSummary,
  incidentFeedback,
  metrics,
  parseCaseArtifact,
  predictions,
  riskCategory,
  riskValue,
  validateAssessment,
} from "../src/academic/utils/engines.ts";
import {
  emptyProgress,
  parseProgress,
  validExperiment,
} from "../src/academic/utils/progress.ts";
import { scenarios } from "../src/academic/data/cases.ts";
import { controls } from "../src/academic/data/controls.ts";
import { modules, tracks } from "../src/academic/data/curriculum.ts";
import { filterResources } from "../src/academic/data/resources.ts";
const config = {
  threshold: 0.5,
  prevalence: 20,
  shift: 0,
  features: 4,
  split: "holdout" as const,
  seed: 42,
};
test("risk indices enforce rating bounds and category edges", () => {
  assert.equal(riskValue(3, 4, "product"), 12);
  assert.equal(riskValue(3, 4, "maximum"), 16);
  assert.deepEqual([4, 5, 9, 10, 16, 17, 25].map(riskCategory), [
    "Low",
    "Moderate",
    "Moderate",
    "High",
    "High",
    "Critical",
    "Critical",
  ]);
  assert.throws(() => riskValue(0, 4, "product"));
  assert.throws(() => riskValue(2.5, 4, "product"));
});
test("control assertions require owner, evidence and exclusion justification", () => {
  const row = {
    status: "Implemented and evidenced" as const,
    evidence: "",
    notes: "",
    owner: "",
    justification: "",
  };
  assert.equal(validateAssessment(row).length, 2);
  assert.deepEqual(
    validateAssessment({
      ...row,
      owner: "Service owner",
      evidence: "Sample A, November",
    }),
    [],
  );
  assert.equal(
    validateAssessment({ ...row, status: "Not applicable", owner: "Owner" })
      .length,
    1,
  );
  assert.deepEqual(
    gapSummary({ A: { ...row, status: "Partially implemented" } }, ["A", "B"]),
    { total: 2, unassessed: 1, evidenced: 0, gaps: 1, excluded: 0 },
  );
});
test("incident actions depend on evidence and reject unknown actions", () => {
  assert.equal(incidentFeedback("isolate", 0).premature, true);
  assert.equal(incidentFeedback("isolate", 3).premature, false);
  assert.throws(() => incidentFeedback("attack", 9));
});
test("metrics match hand-counted inputs including zero division", () => {
  const result = metrics(
    [
      { label: true, score: 0.9 },
      { label: true, score: 0.1 },
      { label: false, score: 0.8 },
      { label: false, score: 0.2 },
    ],
    0.5,
  );
  assert.deepEqual(result, {
    tp: 1,
    fp: 1,
    tn: 1,
    fn: 1,
    precision: 0.5,
    recall: 0.5,
    f1: 0.5,
    fpr: 0.5,
  });
  assert.equal(metrics([], 0.5).f1, 0);
});
test("experiments reproduce exactly and threshold moves counts monotonically", () => {
  const data = predictions(config);
  assert.equal(data.length, 400);
  assert.deepEqual(data, predictions(config));
  assert.equal(data.filter((row) => row.label).length, 80);
  const low = metrics(data, 0.2),
    high = metrics(data, 0.8);
  assert.ok(low.tp >= high.tp);
  assert.ok(low.fp >= high.fp);
  assert.notDeepEqual(
    metrics(data, 0.5),
    metrics(predictions({ ...config, shift: 6 }), 0.5),
  );
  assert.notDeepEqual(
    predictions(config),
    predictions({ ...config, features: 12 }),
  );
});
test("budget calculation deduplicates selections and reports constraints", () => {
  assert.equal(budgetResult(["identity", "identity"], 100).cost, 30);
  assert.equal(
    budgetResult(["identity", "recovery", "telemetry", "assurance"], 80)
      .overBudget,
    true,
  );
  assert.equal(budgetResult([], 80).weeks, 0);
});
test("CSV quotes content and neutralises spreadsheet formula injection", () => {
  const output = csv([{ note: "=SUM(A1)", text: 'a,"b"\nc' }]);
  assert.ok(output.includes("'=SUM(A1)"));
  assert.ok(output.includes('"a,""b""\nc"'));
  assert.ok(csv([{ a: " \t@evil" }]).includes("' \t@evil"));
});
test("case import validates format, size and scenario identifiers", () => {
  const artifact = {
    schemaVersion: 1,
    kind: "x1-case-state",
    caseId: "paysecure",
    title: "Risk register",
    generatedAt: new Date().toISOString(),
    methodology: "Ordinal",
    results: { risk: 12 },
    disclaimer: "Fictional",
  };
  assert.equal(parseCaseArtifact(JSON.stringify(artifact)).caseId, "paysecure");
  assert.throws(() =>
    parseCaseArtifact(JSON.stringify({ ...artifact, caseId: "real-company" })),
  );
  assert.throws(() => parseCaseArtifact(" ".repeat(100001)));
  assert.throws(() => parseCaseArtifact("null"));
});
test("progress round-trip validates stored data and experimental bounds", () => {
  const progress = {
    ...emptyProgress(),
    completed: ["risk-assessment"],
    savedExperiment: config,
  };
  assert.deepEqual(parseProgress(JSON.stringify(progress)), progress);
  assert.equal(validExperiment({ ...config, seed: NaN }), false);
  assert.equal(validExperiment({ ...config, threshold: 4 }), false);
  assert.throws(() =>
    parseProgress(JSON.stringify({ ...progress, attempts: { x: -1 } })),
  );
  assert.throws(() =>
    parseProgress(
      JSON.stringify({ ...progress, completed: ["x".repeat(500)] }),
    ),
  );
});
test("published content, frameworks and case identifiers are coherent", () => {
  assert.equal(tracks.length, 3);
  assert.equal(
    tracks.reduce((sum, row) => sum + row.modules.length, 0),
    37,
  );
  assert.equal(modules.length, 7);
  assert.equal(new Set(modules.map(m=>m.id)).size,7);
  assert.equal(scenarios.length, 3);
  assert.equal(new Set(controls.map((row) => row.id)).size, controls.length);
  modules.forEach((row) => {
    assert.equal(row.sections.length, 4);
    assert.ok(row.sections.every((section) => section.text.length > 250));
    assert.ok(row.assessment.choices[row.assessment.correct]);
  });
  assert.equal(
    controls.filter((row) => row.framework === "nist-csf-2").length,
    4,
  );
});
test("resource filtering composes domain, role and keywords", () => {
  const results = filterResources("model evaluation", {
    domain: "artificial-intelligence",
  });
  assert.ok(results.length >= 3);
  assert.ok(
    results.every(
      (row) =>
        row.domain === "artificial-intelligence" &&
        row.topic === "Model evaluation",
    ),
  );
  assert.equal(filterResources("impossibleword", {}).length, 0);
  assert.ok(filterResources("", { role: "SOC Analyst" }).length > 0);
});
test("reasoning coverage reports gaps instead of claiming semantic judgement", () => {
  assert.equal(
    challengeResponse(
      "payment evidence test budget residual committee assumption",
    ).filter((row) => row.mentioned).length,
    6,
  );
  assert.ok(challengeResponse("hello").every((row) => !row.mentioned));
});

test("imports reject deeply nested payloads and invalid time metadata", () => {
  const artifact = {
    schemaVersion: 1,
    kind: "x1-case-state",
    caseId: "paysecure",
    title: "Assessment",
    generatedAt: "2026-11-20T12:00:00Z",
    methodology: "Teaching",
    results: {},
    disclaimer: "Fictional",
  };
  let deep: Record<string, unknown> = {};
  for (let i = 0; i < 12; i++) deep = { nested: deep };
  assert.throws(() =>
    parseCaseArtifact(JSON.stringify({ ...artifact, results: deep })),
  );
  assert.throws(() =>
    parseCaseArtifact(JSON.stringify({ ...artifact, generatedAt: "bad-date" })),
  );
});
