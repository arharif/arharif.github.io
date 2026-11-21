import test from "node:test";
import assert from "node:assert/strict";
import {
  standards,
  architectureFor,
} from "../src/academic/studio/standards.ts";
import { timelineTicks } from "../src/academic/studio/timeline.ts";
test("expanded standards preserve official NIST editions and distinguish legal instruments", () => {
  const ids = standards.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(standards.length >= 24);
  for (const id of [
    "nist-rmf",
    "nist-800-53b",
    "iso-22313",
    "iso-27031",
    "nis2",
    "iso-27018",
    "iso-29100",
    "iso-23894",
    "eu-ai-act",
    "cobit-2019",
    "soc-2",
  ])
    assert.ok(ids.includes(id), id);
  assert.match(
    standards.find((row) => row.id === "nist-800-53")!.edition,
    /5\.2\.0/,
  );
  assert.equal(architectureFor("nist-800-53")!.nodes.length, 20);
  assert.equal(architectureFor("nis2")!.kind, "Directive");
  assert.equal(architectureFor("dora")!.kind, "Regulation");
  assert.equal(architectureFor("iso-22313")!.kind, "Guidance");
  for (const standard of standards)
    assert.ok(architectureFor(standard.id)?.nodes.length, standard.id);
  assert.deepEqual(
    architectureFor("pf-1.0")!.nodes.map((node) => node.id),
    ["ID-P", "GV-P", "CT-P", "CM-P", "PR-P"],
  );
  assert.ok(
    architectureFor("nist-800-53a")!.nodes.some(
      (node) => node.id === "examine",
    ),
  );
});
test("CSF architecture uses all six Functions and source-linked category identifiers", () => {
  const csf = architectureFor("nist-csf-2")!;
  assert.deepEqual(
    csf.nodes.map((row) => row.id),
    ["GOVERN", "IDENTIFY", "PROTECT", "DETECT", "RESPOND", "RECOVER"],
  );
  assert.equal(
    csf.nodes.reduce((sum, row) => sum + (row.children?.length ?? 0), 0),
    22,
  );
  assert.ok(
    csf.nodes
      .find((row) => row.id === "GOVERN")!
      .children!.some((row) => row.id === "GV.OC"),
  );
  assert.equal(architectureFor("iso-27001")!.layout, "cycle");
  assert.equal(architectureFor("dora")!.layout, "pillars");
  assert.equal(architectureFor("gdpr")!.layout, "flow");
});
test("Gantt calendar-month ticks handle leap years and bound rendering work", () => {
  assert.deepEqual(timelineTicks("2024-01-31", 65, "month"), [0, 1, 30, 61]);
  assert.deepEqual(timelineTicks("2026-11-21", 15, "week"), [0, 7, 14]);
  assert.ok(timelineTicks("2026-11-21", 100000, "day").length <= 250);
  assert.throws(() => timelineTicks("bad", 15, "week"));
});
