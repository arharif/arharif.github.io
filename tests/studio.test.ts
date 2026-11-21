import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createStudio,
  newFinding,
  newTask,
  today,
  findingErrors,
} from "../src/academic/studio/model.ts";
import {
  aggregate,
  schedule,
  privacyScores,
  validateTask,
  referenceErrors,
  recordFinding,
  matchingFindings,
  controlDecisionState,
} from "../src/academic/studio/engines.ts";
import {
  createWorkspace,
  encodeProject,
  parseProject,
  isExpired,
} from "../src/academic/studio/persistence.ts";
import { buildReport } from "../src/academic/studio/report.ts";
import {
  inspectXlsxZip,
  validateWorkbookInflation,
} from "../src/academic/studio/zipSafety.ts";
import ExcelJS from "exceljs";
const assessed = (
  id: string,
  current: number | null,
  target = 3,
  weight = 1,
) => ({
  ...newFinding(id, id, "GOVERN"),
  owner: "Owner",
  rationale: "Exercise judgement",
  current,
  target,
  weight,
});
test("maturity uses eligible population, explicit zero, justified exclusions and unknowns", () => {
  const rows = [
    assessed("a", 0, 2),
    assessed("b", 4, 4, 3),
    assessed("c", null),
    {
      ...assessed("d", 1),
      applicability: "Excluded" as const,
      exclusion: "Outside scope",
    },
    { ...assessed("e", 1), applicability: "Excluded" as const, exclusion: "" },
  ];
  const a = aggregate(rows);
  assert.equal(a.current, 2);
  assert.equal(a.target, 3);
  assert.equal(a.assessed, 2);
  assert.equal(a.unassessed, 1);
  assert.equal(a.excluded, 1);
  assert.equal(a.invalidExclusions, 1);
  const b = aggregate(rows, "Priority-weighted");
  assert.equal(b.current, 3);
  assert.equal(b.target, 3.5);
  assert.equal(b.denominator, 4);
  assert.equal(aggregate([]).current, null);
  assert.equal(a.gaps.length, 1);
  assert.deepEqual(matchingFindings(rows, "Gaps"), [rows[0]]);
  assert.deepEqual(matchingFindings(rows, "None"), rows.slice(0, 2));
  assert.equal(matchingFindings(rows, "Unassessed").length, 1);
  assert.equal(matchingFindings(rows, "confidence:Low").length, 2);
  assert.throws(() => aggregate([assessed("bad", 5)]), /integers 0–4/);
  assert.throws(() => aggregate([assessed("bad", NaN)]), /integers 0–4/);
  assert.throws(
    () => aggregate([assessed("bad", 1, 3, 0)]),
    /weights integers/,
  );
});
test("maturity boundary/property sweep reproduces all small weighted means", () => {
  for (let x = 0; x <= 4; x++)
    for (let y = 0; y <= 4; y++)
      for (let w = 1; w <= 5; w++) {
        const a = aggregate(
          [assessed("a", x, 4, w), assessed("b", y, 3)],
          "Priority-weighted",
        );
        assert.equal(a.current, (x * w + y) / (w + 1));
        assert.ok(a.current! >= 0 && a.current! <= 4);
      }
});
test("recording a stale profile draft preserves stable identity and later risk/action links", () => {
  const old = assessed("GV.OC-01", 1),
    linked = { ...old, riskId: "R-001", taskId: "task-1" };
  const records = recordFinding(
    [linked],
    { ...old, id: "different-draft-id", current: 2 },
    createStudio("paysecure").scope,
  );
  assert.equal(records.length, 1);
  assert.equal(records[0].id, old.id);
  assert.equal(records[0].riskId, "R-001");
  assert.equal(records[0].taskId, "task-1");
  assert.equal(records[0].current, 2);
  const studio = {
    ...createStudio("paysecure"),
    findings: records,
    tasks: [
      {
        ...newTask("objective:continuity", "Wrong relationship"),
        id: "task-1",
      },
    ],
  };
  assert.ok(
    referenceErrors(studio).some((x) => x.includes("retain its source")),
  );
});
test("reviewed/tested evidence requires reference/reviewer; invalid levels and unjustified exclusions fail", () => {
  const f = assessed("x", 2);
  assert.deepEqual(findingErrors(f), []);
  assert.ok(
    findingErrors({
      ...f,
      verification: "Independently tested",
      reviewer: "",
      evidence: "",
    }).length >= 2,
  );
  assert.ok(
    findingErrors({ ...f, applicability: "Excluded", exclusion: "" }).length,
  );
  assert.ok(findingErrors({ ...f, weight: 0 }).length);
  assert.ok(findingErrors({ ...f, current: null }).length);
});
test("scheduler respects weekends/holidays, finish-to-start, zero-work milestone and cost", () => {
  const s = createStudio("paysecure", "2026-11-20"),
    a = { ...newTask("objective:a", "A"), id: "a", effort: 16, duration: 2 },
    b = { ...newTask("objective:b", "B"), id: "b", dependencies: ["a"] },
    g = {
      ...newTask("objective:g", "Gate"),
      id: "g",
      effort: 0,
      duration: 0,
      milestone: true,
      dependencies: ["b"],
    };
  const p = schedule([a, b, g], s.resources, s.scope.start, {
    weekdays: [1, 2, 3, 4, 5],
    holidays: ["2026-11-23"],
  });
  assert.equal(p.rows[0].end, "2026-11-24");
  assert.equal(p.rows[1].start, "2026-11-25");
  assert.equal(p.rows[2].start, "2026-11-26");
  assert.equal(p.cost, 2400);
  assert.deepEqual(p.criticalPath, ["a", "b", "g"]);
});
test("resource levelling differs from dependency-only slack; cycles/missing links and excessive work fail", () => {
  const s = createStudio("paysecure", "2026-11-23"),
    a = { ...newTask("objective:a", "A"), id: "a", effort: 16, duration: 2 },
    b = { ...newTask("objective:b", "B"), id: "b" };
  const p = schedule([a, b], s.resources, s.scope.start, s.calendar);
  assert.ok(p.rows[1].start > p.rows[0].end);
  assert.ok(p.rows[1].resourceDelay > 0);
  assert.equal(p.rows[1].critical, false);
  assert.throws(
    () =>
      schedule(
        [
          { ...a, dependencies: ["b"] },
          { ...b, dependencies: ["a"] },
        ],
        s.resources,
        s.scope.start,
        s.calendar,
      ),
    /Circular/,
  );
  assert.throws(
    () =>
      schedule(
        [{ ...a, dependencies: ["missing"] }],
        s.resources,
        s.scope.start,
        s.calendar,
      ),
    /missing dependency/,
  );
  assert.throws(
    () =>
      schedule(
        [{ ...a, effort: 10000 }],
        [{ ...s.resources[0], hoursPerDay: 0.5 }],
        s.scope.start,
        s.calendar,
      ),
    /730/,
  );
  assert.throws(
    () =>
      schedule(
        [{ ...a, milestone: true }],
        s.resources,
        s.scope.start,
        s.calendar,
      ),
    /milestone/,
  );
});
test("scheduler property: dependency dates and same-resource intervals never overlap", () => {
  const s = createStudio("paysecure", "2026-11-20");
  const tasks = Array.from({ length: 30 }, (_, i) => ({
    ...newTask(`objective:${i}`, `Task ${i}`),
    id: `t${i}`,
    effort: 4 + (i % 4) * 4,
    duration: 1,
    resourceId: i % 2 ? "assessor" : "control-owner",
    dependencies: i > 2 ? [`t${i - 3}`] : [],
  }));
  const p = schedule(tasks, s.resources, s.scope.start, s.calendar);
  for (const r of p.rows) {
    for (const d of r.task.dependencies)
      assert.ok(r.start > p.rows.find((x) => x.task.id === d)!.end);
    for (const o of p.rows) {
      if (o === r || o.task.resourceId !== r.task.resourceId) continue;
      assert.ok(r.end < o.start || o.end < r.start);
    }
  }
});
test("privacy scoring enforces ordinal bounds and distinct inherent/residual judgements", () => {
  const r = {
    id: "p",
    edition: "pf-1.0" as const,
    activityId: "a",
    event: "Unexpected reuse",
    harm: "Unfair exclusion",
    likelihood: 4,
    impact: 5,
    residualLikelihood: 3,
    residualImpact: 4,
    controls: "Minimise",
    assumptions: "Hypothetical",
    owner: "Owner",
    escalation: "Review",
    taskId: "",
  };
  assert.deepEqual(privacyScores(r), { inherent: 20, residual: 12 });
  assert.throws(() => privacyScores({ ...r, impact: 6 }));
  assert.throws(() => privacyScores({ ...r, likelihood: NaN }));
});
test("validated tasks need progress/evidence/reviewer; proposals never mutate assessments", () => {
  const f = assessed("a", 1);
  const t = {
    ...newTask(`finding:${f.id}`, "Improve"),
    owner: "Owner",
    accountable: "Sponsor",
    status: "Validated" as const,
    progress: 100,
  };
  assert.ok(validateTask(t).length);
  assert.deepEqual(
    validateTask({
      ...t,
      validation: "Passed",
      evidence: "Test-01",
      reviewer: "Reviewer",
    }),
    [],
  );
  assert.equal(f.current, 1);
  const control = {
    reviewed: true,
    applicable: false,
    status: "Assessed" as const,
    rationale: "Out of scope",
    responsibility: "System-specific" as const,
    provider: "",
    owner: "Owner",
    evidence: "",
    assessmentMethod: "Examine" as const,
    objective: "",
    procedure: "",
    finding: "",
  };
  assert.equal(controlDecisionState(control), "Excluded");
  assert.equal(
    controlDecisionState({ ...control, reviewed: false }),
    "Not started",
  );
  assert.ok(
    referenceErrors({ ...createStudio("paysecure"), tasks: [t] }).length,
  );
});
test("project round trip preserves drafts, enforces version/organisation/references and rejects hostile keys/size", () => {
  const w = createWorkspace("paysecure", "2026-11-20");
  w.assessmentDrafts.a = {
    status: "Partially implemented",
    owner: "Draft owner",
    notes: "Draft",
    evidence: "",
    justification: "",
  };
  w.studio.findings = [assessed("a", 1)];
  const e = parseProject(
    encodeProject(w, "paysecure", new Date("2026-11-20T10:00:00Z")),
  );
  assert.deepEqual(e.data, w);
  assert.equal(isExpired(e.savedAt, new Date("2026-12-21T10:00:00Z")), true);
  assert.throws(
    () => parseProject('{"__proto__":{"polluted":true}}'),
    /Unsafe/,
  );
  assert.throws(
    () => parseProject(JSON.stringify({ ...e, schemaVersion: 99 })),
    /schema/,
  );
  assert.throws(
    () =>
      parseProject(
        JSON.stringify({
          ...e,
          data: { ...w, studio: { ...w.studio, caseId: "petroshield" } },
        }),
      ),
    /organisation/,
  );
  assert.throws(() => parseProject(" ".repeat(3_000_001)), /3 MB/);
  assert.throws(
    () =>
      parseProject(
        JSON.stringify({
          ...e,
          data: {
            ...w,
            studio: {
              ...w.studio,
              tasks: [
                {
                  ...newTask("finding:missing", "Invalid"),
                  id: "t",
                  owner: "Owner",
                  accountable: "Sponsor",
                },
              ],
            },
          },
        }),
      ),
    /missing source/,
  );
  assert.equal(today(new Date("2027-02-04T23:00:00Z")), "2027-02-04");
  const worked = parseProject(
    readFileSync(
      "docs/x1-academic/v2/examples/fictional-connected-project.json",
      "utf8",
    ),
  );
  const report = buildReport(worked.data);
  assert.equal(report.summary.assessed, 6);
  assert.equal(report.summary.taskCount, 16);
  assert.equal(report.summary.current, 7 / 6);
});
test("report reconciles and remains detached from later source mutation", () => {
  const w = createWorkspace("paysecure", "2026-11-20");
  w.studio.findings = [assessed("a", 1), assessed("b", 3)];
  w.studio.tasks = [
    {
      ...newTask(`finding:${w.studio.findings[0].id}`, "Improve"),
      id: "t",
      owner: "Owner",
      accountable: "Sponsor",
    },
  ];
  const r = buildReport(w, new Date("2026-11-20T10:00:00Z"));
  assert.equal(r.summary.current, 2);
  assert.equal(r.summary.gaps, 1);
  assert.equal(r.summary.cost, 800);
  w.studio.findings[0].current = 4;
  w.studio.tasks[0].effort = 99;
  w.studio.rubric.weighting = "Priority-weighted";
  w.studio.currency = "EUR";
  w.studio.resources[0].rate = 999;
  assert.equal(r.summary.current, 2);
  assert.equal(r.findings[0].current, 1);
  assert.equal(r.plan[0].effort, 8);
  assert.equal(r.rubric.weighting, "Equal");
  assert.notEqual(r.currency, "EUR");
  assert.equal(r.resources[0].rate, 100);
});
test("NIST source contains full active controls/objectives and four exact baseline profiles", () => {
  const c = JSON.parse(
    readFileSync("src/academic/data/sp80053-catalog.json", "utf8"),
  );
  assert.equal(c.version, "5.2.0");
  assert.equal(c.controls.length, 1196);
  assert.equal(c.controls.filter((x: any) => !x.withdrawn).length, 1014);
  assert.equal(c.controls.filter((x: any) => x.objectives.length).length, 1014);
  assert.ok(
    c.controls
      .find((x: any) => x.id === "ac-2")
      .methods.some((m: any) => m.method === "TEST"),
  );
  const ids = new Set(c.controls.map((x: any) => x.id));
  for (const items of Object.values(c.baselines) as string[][]) {
    assert.equal(new Set(items).size, items.length);
    assert.ok(items.every((id) => ids.has(id)));
  }
  assert.equal(c.baselines.LOW.length, 149);
  assert.equal(c.baselines.PRIVACY.length, 96);
  assert.ok(c.provenance.every((p: any) => p.sha256.length === 64));
});
test("XLSX ZIP preflight rejects malformed archives and expansion bombs before parser", async () => {
  const b = new ExcelJS.Workbook();
  const sheet = b.addWorksheet("Input");
  sheet.addRow(["id", "asset"]);
  sheet.addRow(["R1", "API"]);
  const buffer = await b.xlsx.writeBuffer();
  const bytes = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  assert.ok(inspectXlsxZip(bytes).entries > 0);
  assert.equal(
    await validateWorkbookInflation(bytes),
    inspectXlsxZip(bytes).expandedBytes,
  );
  assert.throws(() => inspectXlsxZip(new ArrayBuffer(30)), /ZIP/);
  const poison = bytes.slice(0);
  const v = new DataView(poison);
  for (let i = 0; i < v.byteLength - 46; i++) {
    if (v.getUint32(i, true) === 0x02014b50) {
      v.setUint32(i + 24, 20 * 1024 * 1024, true);
      const local = v.getUint32(i + 42, true);
      v.setUint32(local + 22, 20 * 1024 * 1024, true);
      break;
    }
  }
  assert.throws(() => inspectXlsxZip(poison), /expansion/);
  const lying = bytes.slice(0),
    lie = new DataView(lying);
  for (let i = 0; i < lie.byteLength - 46; i++) {
    if (
      lie.getUint32(i, true) === 0x02014b50 &&
      lie.getUint32(i + 24, true) > 100
    ) {
      lie.setUint32(i + 24, 1, true);
      const local = lie.getUint32(i + 42, true);
      lie.setUint32(local + 22, 1, true);
      break;
    }
  }
  await assert.rejects(
    () => validateWorkbookInflation(lying),
    /Actual workbook expansion/,
  );
});
