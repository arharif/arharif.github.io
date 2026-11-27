import assert from "node:assert/strict";
import test from "node:test";
import { startGame, stepGame, type Input } from "../src/components/arcade/featureEngine.ts";

const dt = 1 / 120;
const silent = () => {};
const empty = new Set<Input>();

test("platform adventure clears all three gardens with jump and movement inputs", () => {
  let run = startGame("x1-platform-adventure");
  const right = new Set<Input>(["right"]);
  const jump = new Set<Input>(["up"]);
  const takeoff = [
    [168, 406, 842, 1381],
    [177, 420, 653, 1075, 1232, 1607],
    [168, 298, 621, 996, 1395, 1549, 1862],
  ];
  const jumped = new Set<string>();
  for (let tick = 0; tick < 3800 && !run.result; tick++) {
    assert.equal(run.mode, "platform");
    const { x, stage, grounded } = run;
    const target = takeoff[stage].find((edge) =>
      grounded && x >= edge && x < edge + 19 && !jumped.has(`${stage}/${edge}`),
    );
    if (target) jumped.add(`${stage}/${target}`);
    run = stepGame(run, dt, right, target ? jump : empty, silent);
  }
  assert.equal(run.result, "won");
  assert.equal(run.stage, 2);
  assert.ok(run.score >= 2100);
  let fall = startGame("x1-platform-adventure");
  for (let tick = 0; tick < 1400 && !fall.result; tick++) {
    fall = stepGame(fall, dt, right, empty, silent);
  }
  assert.equal(fall.result, "lost");
  assert.equal(fall.health, 0);
});

test("racing clears three circuits by steering around traffic and has a timeout", () => {
  let run = startGame("x1-racing");
  for (let tick = 0; tick < 10000 && !run.result; tick++) {
    assert.equal(run.mode, "racing");
    const rival = run.rivals.find((rival) => !rival.passed && rival.at < (run.mode === "racing" ? run.distance : 0) + 125);
    const target = rival ? rival.lane < -.15 ? .45 : -.45 : 0;
    const keys = new Set<Input>(["up"]);
    if (Math.abs(run.x - target) > .035) keys.add(run.x > target ? "left" : "right");
    run = stepGame(run, dt, keys, empty, silent);
  }
  assert.equal(run.result, "won");
  assert.equal(run.stage, 2);
  assert.ok(run.score > 1800);
  let idle = startGame("x1-racing");
  for (let tick = 0; tick < 3500 && !idle.result; tick++) {
    idle = stepGame(idle, dt, empty, empty, silent);
  }
  assert.equal(idle.result, "lost");
  assert.match(idle.message, /Time expired/);
});

test("factory advances all shifts, rewards timing and loses after five misses", () => {
  let run = startGame("x1-fun-factory");
  const bins: Input[] = ["one", "two", "three", "four"];
  for (let tick = 0; tick < 9000 && !run.result; tick++) {
    assert.equal(run.mode, "factory");
    const parcel = run.packages[0];
    const press = parcel?.position >= 519 ? new Set<Input>([bins[parcel.type]]) : empty;
    run = stepGame(run, dt, empty, press, silent);
  }
  assert.equal(run.result, "won");
  assert.equal(run.score, 33 * 150 + 3 * 250);
  assert.equal(run.health, 5);
  let idle = startGame("x1-fun-factory");
  for (let tick = 0; tick < 1500 && !idle.result; tick++) {
    idle = stepGame(idle, dt, empty, empty, silent);
  }
  assert.equal(idle.result, "lost");
  assert.equal(idle.health, 0);
});
