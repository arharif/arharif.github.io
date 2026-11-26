import assert from "node:assert/strict";
import test from "node:test";
import { palettes, legacyThemes } from "../src/lib/palettes.ts";
import { makeMaze } from "../src/components/arcade/maze.ts";
import {
  newRun,
  step,
  scoreOf,
} from "../src/components/arcade/actionEngine.ts";
import { emptyProgress, addRound } from "../src/components/arcade/progress.ts";

function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((c) => parseInt(c, 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
test("approved palettes provide readable text and cover every historic preference", () => {
  assert.equal(Object.keys(palettes).length, 9);
  for (const [label, bg, surface, ink, accent, scheme, muted] of Object.values(palettes)) {
    assert.equal(bg, label === "Onyx Black" ? "#080A0D" : "#FFFFFF");
    assert.equal(scheme, label === "Onyx Black" ? "dark" : "light");
    for (const text of [ink, accent, muted]) {
      for (const layer of [bg, surface]) {
        const values = [luminance(layer), luminance(text)].sort((a, b) => b - a);
        assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5);
      }
    }
  }
  assert.equal(Object.keys(legacyThemes).length, 13);
  for (const id of Object.values(legacyThemes)) assert.ok(id in palettes);
});
test("all maze levels connect the player, crystal and exit", () => {
  for (let n = 0; n < 60; n++) {
    const { size, start, grid, crystal, exit } = makeMaze((n % 3) + 1);
    const seen = new Set([start]),
      queue = [start];
    while (queue.length) {
      const i = queue.pop()!;
      for (const j of [i - 1, i + 1, i - size, i + size]) {
        if (grid[j] !== 0 || seen.has(j)) continue;
        seen.add(j);
        queue.push(j);
      }
    }
    assert.ok(seen.has(crystal) && seen.has(exit));
    assert.equal(seen.size, grid.filter((c) => !c).length);
  }
});
test("runner jumps, collects coins and stops scoring after a collision", () => {
  const run = newRun("phantom-dash");
  step(run, new Set([" "]), 0.05);
  assert.ok(run.y < 210);
  run.objects.push({ type: "coin", x: run.x + 4, y: run.y, drift: 0 });
  step(run, new Set(), 0.016);
  assert.equal(run.points, 25);
  run.objects.push({ type: "hazard", x: run.x + 4, y: run.y, drift: 0 });
  step(run, new Set(), 0.016);
  assert.ok(run.ended);
  const frozen = scoreOf(run);
  step(run, new Set(), 1);
  assert.equal(scoreOf(run), frozen);
});
test("rocket movement and projectiles, pixel movement and damage immunity", () => {
  const rocket = newRun("rocket-boom");
  step(rocket, new Set(["ArrowLeft", " "]), 0.05);
  assert.ok(rocket.x < 320);
  const shot = rocket.objects.find((o) => o.type === "shot")!;
  rocket.objects.push({ ...shot, type: "hazard" });
  step(rocket, new Set(), 0.01);
  assert.equal(rocket.points, 50);
  assert.equal(rocket.objects.length, 0);
  for (let i = 0; i < 3; i++) {
    rocket.grace = 0;
    rocket.objects.push({ type: "hazard", x: rocket.x, y: rocket.y, drift: 0 });
    step(rocket, new Set(), 0.01);
  }
  assert.ok(rocket.ended);
  const pixel = newRun("pixel-panic");
  step(pixel, new Set(["ArrowUp", "ArrowRight"]), 0.05);
  assert.ok(pixel.y < 210 && pixel.x > 320);
  pixel.objects.push({ type: "hazard", x: pixel.x, y: pixel.y, drift: 0 });
  step(pixel, new Set(), 0);
  assert.ok(pixel.ended);
});
test("XP uses completed rounds, high scores never decrease, UTC challenge awards once per day", () => {
  let p = emptyProgress;
  for (const n of [100, 90, 0, 50])
    p = addRound(p, "phantom-dash", n, "2026-11-22");
  assert.deepEqual(
    [p.rounds, p.xp, p.completedDays, p.best["phantom-dash"]],
    [4, 64, 1, 100],
  );
  const next = addRound(p, "rocket-boom", 10000, "2026-11-23");
  assert.equal(next.daily, 1);
  assert.equal(next.xp, 174);
  assert.equal(next.best["phantom-dash"], 100);
  for (const n of [NaN, Infinity, -1, 0.5, 1e14])
    assert.throws(() => addRound(next, "rocket-boom", n));
});
