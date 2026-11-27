import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { annexA, annexAIds } from "../src/academic/data/iso27001.ts";
import { aiAnnexes, euStructure } from "../src/academic/data/euStructure.ts";
import { pciExamples, pciSections } from "../src/academic/data/pci401.ts";
import { editions, frameworkIds, frameworkMetadata } from "../src/academic/console/editions.ts";

const data = (file: string) => JSON.parse(readFileSync(new URL(`../src/academic/data/${file}.json`, import.meta.url), "utf8"));
type NistRow = { id: string; displayId: string; title: string; family: string; parent: string | null; withdrawn: boolean; objectives: string[]; methods: {method: string; text: string}[] };
test("every SP 800-53 entry, enhancement and SP 800-53B membership matches the pinned NIST import", () => {
  const full = data("sp80053-catalog");
  const index = data("sp80053-index");
  const rows: NistRow[] = full.controls;
  const counts = { ac: 147, at: 17, au: 69, ca: 32, cm: 66, cp: 56, ia: 74, ir: 42, ma: 30, mp: 30, pe: 59, pl: 17, pm: 37, ps: 18, pt: 21, ra: 26, sa: 147, sc: 162, si: 119, sr: 27 };
  assert.equal(index.version, "5.2.0");
  assert.deepEqual(index.families.map(([id]: string[]) => id), Object.keys(counts));
  assert.deepEqual(index.controls, rows.map(({ id, displayId, title, family, parent, withdrawn }) => ({ id, displayId, title, family, parent, withdrawn })));
  assert.equal(new Set(rows.map(row => row.id)).size, 1196);
  assert.equal(new Set(rows.map(row => row.displayId)).size, 1196);
  assert.equal(rows.filter(row => !row.withdrawn).length, 1014);
  for (const [family, count] of Object.entries(counts)) assert.equal(rows.filter(row => row.family === family).length, count, family);
  const byId = new Map(rows.map(row => [row.id, row]));
  for (const row of rows) {
    assert.equal(row.family, row.id.split("-")[0], row.id);
    if (row.parent) {
      const parent = byId.get(row.parent);
      assert.equal(parent?.parent, null, row.id);
      assert.equal(parent?.family, row.family, row.id);
      assert.ok(row.displayId.startsWith(parent!.displayId + "("), row.id);
    }
    if (!row.withdrawn) assert.ok(row.objectives.length && row.methods.some(method => ["EXAMINE", "INTERVIEW", "TEST"].includes(method.method)), row.id);
  }
  assert.deepEqual(index.baselines, full.baselines);
  for (const [key, count] of Object.entries({ LOW: 149, MODERATE: 287, HIGH: 370, PRIVACY: 96 })) {
    const ids: string[] = index.baselines[key];
    assert.equal(ids.length, count, key);
    assert.equal(new Set(ids).size, count, key);
    for (const id of ids) assert.equal(byId.get(id)?.withdrawn, false, key + " " + id);
    assert.ok(!ids.includes("sa-24"), key);
  }
  assert.equal(byId.get("sa-15.13")?.parent, "sa-15");
  assert.equal(byId.get("si-2.7")?.parent, "si-2");
});
test("CSF Core outcomes map to their actual parent category and function", () => {
  const csf = data("csf-catalog");
  const counts = { GV: [6, 31], ID: [3, 21], PR: [5, 22], DE: [2, 11], RS: [4, 13], RC: [2, 8] };
  assert.deepEqual(csf.functions.map((row: {id: string}) => row.id), Object.keys(counts));
  const all = new Set<string>();
  for (const f of csf.functions) {
    const key = f.id as keyof typeof counts;
    assert.equal(f.categories.length, counts[key][0]);
    let outcomes = 0;
    for (const category of f.categories) {
      assert.ok(category.id.startsWith(f.id + "."));
      for (const outcome of category.outcomes) {
        assert.ok(outcome.id.startsWith(category.id + "-"));
        assert.ok(!all.has(outcome.id));
        all.add(outcome.id);
        outcomes++;
      }
    }
    assert.equal(outcomes, counts[key][1], f.id);
  }
  assert.equal(all.size, 106);
});
test("EU article indexes cover published chapters and separately trace AI Act insertions", () => {
  const law = data("eu-article-index");
  for (const [id, count] of [["dora", 64], ["gdpr", 99], ["eu-ai-act", 113]] as const) {
    const chapters = euStructure[id];
    const articles: [string, string, string][] = law[id].articles;
    assert.equal(articles.length, count);
    assert.equal(new Set(articles.map(([identifier]) => identifier)).size, count);
    for (let n = 1; n <= count; n++) {
      const [identifier, chapter, title] = articles[n - 1];
      assert.equal(identifier, String(n));
      assert.ok(title);
      assert.equal(chapter, chapters.find(({first, last}) => n >= first && n <= last)?.id);
    }
  }
  assert.deepEqual(law["eu-ai-act"].inserted.map(([id]: string[]) => id), ["4a", "60a", "75a", "75b", "75c", "75d"]);
  assert.equal(aiAnnexes.length, 13);
});
test("ISO and PCI references have distinct IDs, expected group sizes and official edition links", () => {
  assert.deepEqual(annexA.map(group => group.topics.length), [37, 8, 14, 34]);
  assert.equal(new Set(annexAIds).size, 93);
  assert.equal(pciSections.length, 12);
  assert.equal(pciSections.reduce((sum, [, goals]) => sum + goals.length, 0), 63);
  const pci = data("pci401-index");
  const ids = new Set<string>(pci.requirements);
  assert.equal(pci.version, "4.0.1");
  assert.equal(pci.requirements.length, 250);
  assert.equal(ids.size, 250);
  assert.ok(ids.has("9.5.1.2.1"));
  assert.ok(!ids.has("12.6.3.3"));
  assert.deepEqual(pciSections.map((_, i) => pci.requirements.filter((id: string) => id.startsWith(`${i + 1}.`)).length), [19, 11, 29, 6, 13, 19, 12, 29, 27, 27, 21, 37]);
  for (const id of ids) {
    const segments = id.split(".");
    const [requirement, objective] = segments.map(Number);
    assert.ok(pciSections[requirement - 1]?.[1][objective - 1], id);
    if (segments.length > 3) assert.ok(ids.has(segments.slice(0, -1).join(".")), id);
  }
  assert.equal(new Set(pciExamples.map(([id]) => id)).size, pciExamples.length);
  for (const [id] of pciExamples) {
    assert.ok(ids.has(id), id);
    const [requirement, objective] = id.split(".").map(Number);
    assert.ok(pciSections[requirement - 1]?.[1][objective - 1], id);
  }
  for (const id of frameworkIds) {
    assert.match(frameworkMetadata[id].verified, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(editions[id].sources.every(([,source]) => source.startsWith("https://")));
    assert.ok(frameworkMetadata[id].reuse);
  }
});

test("AI RMF 1.0 maps 72 uniquely identified outcomes to individual exercises and evidence", async () => {
  const core = data("ai-rmf-core");
  const { outcomeGuidance } = await import("../src/academic/data/aiRmfGuidance.ts");
  assert.equal(core.version, "1.0");
  assert.equal(core.source, "https://doi.org/10.6028/NIST.AI.100-1");
  const counts: Record<string, number[]> = {
    GOVERN: [7, 3, 2, 3, 2, 2], MAP: [6, 3, 5, 2, 2],
    MEASURE: [3, 13, 3, 3], MANAGE: [4, 4, 2, 3],
  };
  const expected = Object.entries(counts).flatMap(([group, categories]) =>
    categories.flatMap((count, i) => Array.from({ length: count }, (_, k) => `${group} ${i + 1}.${k + 1}`)));
  assert.equal(expected.length, 72);
  assert.equal(core.outcomes.length, 72);
  assert.deepEqual(new Set(core.outcomes.map(([id]: string[]) => id)), new Set(expected));
  assert.deepEqual(new Set(Object.keys(outcomeGuidance)), new Set(expected));
  assert.equal(new Set(expected.map(id => outcomeGuidance[id][0])).size, 72);
  for (const [, description] of core.outcomes) assert.ok(description.length > 36);
  for (const [exercise, evidence] of Object.values(outcomeGuidance)) {
    assert.ok(exercise.length > 90);
    assert.ok(evidence.length > 20);
  }
});

test("each ISO reference and PCI objective has a nonempty original review prompt", async () => {
  const { isoGuidance } = await import("../src/academic/data/isoGuidance.ts");
  const { pciGuidance } = await import("../src/academic/data/pciGuidance.ts");
  const iso = annexA.flatMap(group => isoGuidance[group.section]);
  const pci = pciGuidance.flatMap(rows => [...rows]);
  assert.equal(iso.length, 93);
  assert.equal(pci.length, 63);
  assert.equal(new Set([...iso, ...pci]).size, 156);
  assert.deepEqual(pciGuidance.map(r => r.length), pciSections.map(([, rows]) => rows.length));
  for (const prompt of [...iso, ...pci]) assert.ok(prompt.length > 60, prompt);
});
