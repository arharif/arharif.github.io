import test from "node:test";
import assert from "node:assert/strict";
import { scenarios } from "../src/academic/data/cases.ts";
import { standards } from "../src/academic/studio/standards.ts";
import {
  createStudio,
  newFinding,
  newTask,
  studioSchema,
} from "../src/academic/studio/model.ts";
import { generateImplementation } from "../src/academic/studio/planning.ts";
import { schedule, referenceErrors } from "../src/academic/studio/engines.ts";

test("every catalogue roadmap is schedulable, traceable, serialisable and idempotent", () => {
  for (const standard of standards) {
    const input = createStudio("paysecure", "2027-02-08");
    input.framework = standard.id;
    input.edition = standard.edition;
    const result = generateImplementation(input, scenarios[0]);
    assert.ok(studioSchema.safeParse(result).success, standard.id);
    assert.deepEqual(referenceErrors(result), [], standard.id);
    const plan = schedule(
      result.tasks,
      result.resources,
      result.scope.start,
      result.calendar,
    );
    assert.equal(plan.rows.length, result.tasks.length);
    assert.ok(plan.cost > 0);
    assert.strictEqual(generateImplementation(result, scenarios[0]), result);
    assert.equal(input.tasks.length, 0, "generation must not mutate the input");
  }
});

test("a complete 106-gap profile retains assessment claims and bounded dependency fan-in", () => {
  const input = createStudio("paysecure", "2027-02-08");
  input.findings = Array.from({ length: 106 }, (_, i) => ({
    ...newFinding(`test-${i}`, `Scoped outcome ${i}`, "GOVERN"),
    current: 0,
    target: 3,
    owner: "Service owner",
    rationale: "Fictional test assertion",
  }));
  const result = generateImplementation(input, scenarios[0]);
  assert.ok(studioSchema.safeParse(result).success);
  assert.deepEqual(referenceErrors(result), []);
  assert.ok(
    result.findings.every(
      (f) => f.taskId && f.current === 0 && f.verification === "None",
    ),
  );
  assert.ok(result.tasks.every((task) => task.dependencies.length <= 100));
  const plan = schedule(
    result.tasks,
    result.resources,
    result.scope.start,
    result.calendar,
  );
  const assurance = plan.rows.find(
    (row) => row.task.stage === "ASSURE" && row.task.subphase === "Lifecycle",
  )!;
  assert.ok(
    plan.rows
      .filter((row) => row.task.title.startsWith("Remediate "))
      .every((row) => row.end < assurance.start),
  );
});

test("roadmap size limits reject generation without losing existing learner work", () => {
  const input = createStudio("paysecure", "2027-02-08");
  input.tasks = Array.from({ length: 500 }, (_, i) =>
    newTask("objective:existing", `Existing learner task ${i}`),
  );
  assert.throws(() => generateImplementation(input, scenarios[0]), /500 tasks/);
  assert.equal(input.tasks.length, 500);
});
