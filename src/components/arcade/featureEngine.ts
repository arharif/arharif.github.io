import type { FeatureGame } from "./featureGames";

export const width = 720;
export const height = 390;
export type Input = "left" | "right" | "up" | "down" | "one" | "two" | "three" | "four";
export type Sound = "jump" | "collect" | "impact" | "finish";
type Result = "won" | "lost";
type Keys = ReadonlySet<Input>;
type Common = { score: number; stage: number; health: number; time: number; result: Result | null; message: string };
type Ledge = readonly [x: number, y: number, width: number];
type Seed = { x: number; y: number; picked: boolean };
type Bot = { x: number; start: number; y: number; active: boolean; direction: number };
const gardens = [
  {
    name: "Glasshouse",
    length: 1810,
    floor: [[0, 345, 410], [490, 345, 370], [935, 345, 245], [1245, 345, 565]],
    ledges: [[215, 265, 120], [581, 255, 160], [1012, 255, 120], [1350, 251, 124]],
    seeds: [[150, 312], [277, 236], [543, 307], [656, 224], [1053, 226], [1482, 312]],
    bots: [[665, 345], [1440, 345]],
  },
  {
    name: "Cloud Bridge",
    length: 2040,
    floor: [[0, 345, 285], [375, 345, 290], [752, 345, 340], [1190, 345, 248], [1525, 345, 515]],
    ledges: [[165, 257, 105], [438, 252, 135], [822, 256, 145], [1244, 248, 135], [1615, 246, 150]],
    seeds: [[216, 229], [491, 223], [822, 313], [893, 230], [1288, 218], [1680, 219], [1880, 313]],
    bots: [[502, 345], [978, 345], [1700, 345]],
  },
  {
    name: "The Aurora Beacon",
    length: 2210,
    floor: [[0, 345, 335], [428, 345, 210], [735, 345, 300], [1130, 345, 280], [1507, 345, 224], [1827, 345, 383]],
    ledges: [[174, 252, 105], [498, 251, 106], [832, 260, 130], [1200, 248, 130], [1557, 253, 110], [1890, 246, 120]],
    seeds: [[221, 223], [540, 218], [804, 311], [882, 229], [1270, 223], [1601, 220], [1950, 215]],
    bots: [[500, 345], [895, 345], [1240, 345], [1940, 345]],
  },
] as const;
type Platform = Common & { mode: "platform"; x: number; y: number; vx: number; vy: number; grounded: boolean; shield: number; camera: number; seeds: Seed[]; bots: Bot[] };
type Rival = { at: number; lane: number; passed: boolean };
type Racing = Common & { mode: "racing"; x: number; speed: number; distance: number; clock: number; shield: number; rivals: Rival[] };
type Package = { id: number; type: number; position: number };
type Factory = Common & { mode: "factory"; packages: Package[]; packed: number; spawned: number; spawnIn: number; feedback: number; lastBin: number };
export type GameState = Platform | Racing | Factory;

const circuits = [
  { name: "Ember Pass", length: 980, seconds: 27, colour: "#ff815d", swing: .55 },
  { name: "Violet Switchbacks", length: 1220, seconds: 32, colour: "#c6a4ff", swing: .75 },
  { name: "Aurora Run", length: 1420, seconds: 34, colour: "#69e8d9", swing: .9 },
];
const quotas = [8, 11, 14];
const inputBins: Input[] = ["one", "two", "three", "four"];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function garden(common: Common): Platform {
  const level = gardens[common.stage];
  return {
    ...common, mode: "platform", x: 58, y: 300, vx: 0, vy: 0, grounded: false, shield: 1, camera: 0,
    seeds: level.seeds.map(([x, y]) => ({ x, y, picked: false })),
    bots: level.bots.map(([x, y], i) => ({ x, start: x, y: y - 16, active: true, direction: i % 2 ? -1 : 1 })),
    message: level.name,
  };
}
function circuit(common: Common): Racing {
  const course = circuits[common.stage];
  return {
    ...common, mode: "racing", x: 0, speed: 20, distance: 0, clock: course.seconds, shield: 0,
    rivals: Array.from({ length: 9 + common.stage * 4 }, (_, i) => ({
      at: 100 + i * ((course.length - 160) / (9 + common.stage * 4)),
      lane: [-.66, .06, .68, -.12, .7, -.62, .08][(i + common.stage * 2) % 7],
      passed: false,
    })),
    message: course.name,
  };
}
function shift(common: Common): Factory {
  return { ...common, mode: "factory", packages: [], packed: 0, spawned: 0, spawnIn: .1, feedback: 0, lastBin: -1, message: "Shift " + (common.stage + 1) };
}
export function startGame(game: FeatureGame): GameState {
  const common = { score: 0, stage: 0, health: game === "x1-fun-factory" ? 5 : 3, time: 0, result: null, message: "" };
  if (game === "x1-platform-adventure") return garden(common);
  if (game === "x1-racing") return circuit(common);
  return shift(common);
}
function finish(state: GameState, result: Result, message: string, sound: (name: Sound) => void) {
  state.result = result;
  state.message = message;
  sound(result === "won" ? "finish" : "impact");
}
function damage(state: Platform | Racing, sound: (name: Sound) => void) {
  if (state.shield > 0) return;
  state.health -= 1;
  state.shield = 1.35;
  sound("impact");
}
function movePlatform(state: Platform, dt: number, held: Keys, pressed: Keys, sound: (name: Sound) => void): GameState {
  const level = gardens[state.stage];
  const direction = Number(held.has("right")) - Number(held.has("left"));
  state.vx += (direction * 260 - state.vx) * Math.min(1, dt * 10);
  if (state.grounded && pressed.has("up")) {
    state.vy = -500;
    state.grounded = false;
    sound("jump");
  }
  const lastY = state.y;
  state.x = clamp(state.x + state.vx * dt, 17, level.length - 17);
  state.vy += 1100 * dt;
  state.y += state.vy * dt;
  state.grounded = false;
  const ledges: readonly Ledge[] = [...level.floor, ...level.ledges];
  for (const [x, y, w] of ledges) {
    if (state.x + 10 >= x && state.x - 10 <= x + w && lastY <= y && state.y >= y) {
      state.y = y;
      state.vy = 0;
      state.grounded = true;
    }
  }
  state.shield = Math.max(0, state.shield - dt);
  for (const seed of state.seeds) {
    if (!seed.picked && Math.hypot(seed.x - state.x, seed.y - (state.y - 16)) < 27) {
      seed.picked = true;
      state.score += 100;
      sound("collect");
    }
  }
  for (const bot of state.bots) {
    if (!bot.active) continue;
    bot.x += bot.direction * (49 + state.stage * 13) * dt;
    if (Math.abs(bot.x - bot.start) > 38) bot.direction *= -1;
    if (Math.abs(bot.x - state.x) > 27 || Math.abs(bot.y - (state.y - 14)) > 24) continue;
    if (state.vy > 0 && lastY < bot.y + 4) {
      bot.active = false;
      state.vy = -295;
      state.score += 60;
      sound("collect");
    } else {
      damage(state, sound);
    }
  }
  state.camera = clamp(state.x - width * .34, 0, level.length - width);
  if (state.y > height + 42) {
    state.shield = 0;
    damage(state, sound);
    state.x = 58;
    state.y = 290;
    state.vy = 0;
  }
  if (!state.health) finish(state, "lost", "The courier is out of hearts.", sound);
  if (state.result || state.x < level.length - 85) return state;
  if (state.seeds.filter((seed) => seed.picked).length < 3) {
    state.message = "Collect three seeds to activate the beacon.";
    return state;
  }
  state.score += 400;
  if (state.stage === gardens.length - 1) {
    finish(state, "won", "All three gardens are lit!", sound);
    return state;
  }
  sound("finish");
  return garden({ ...state, stage: state.stage + 1 });
}
const curve = (course: Racing, offset = 0) =>
  Math.sin((course.distance + offset) / 82) * circuits[course.stage].swing;
function moveRacing(state: Racing, dt: number, held: Keys, sound: (name: Sound) => void): GameState {
  const course = circuits[state.stage];
  const steer = Number(held.has("right")) - Number(held.has("left"));
  const throttle = held.has("up") ? 34 : held.has("down") ? -55 : -10;
  const offRoad = Math.abs(state.x) > 1;
  state.speed = clamp(state.speed + (throttle - (offRoad ? 46 : 0)) * dt, 9, 76 + state.stage * 8);
  state.x = clamp(state.x + (steer * 1.45 - curve(state) * state.speed * .009) * dt, -1.27, 1.27);
  state.distance += state.speed * dt;
  state.clock -= dt;
  state.shield = Math.max(0, state.shield - dt);
  for (const rival of state.rivals) {
    if (rival.passed || state.distance < rival.at - 9) continue;
    rival.passed = true;
    if (Math.abs(state.x - rival.lane) < .23 && state.shield === 0) {
      damage(state, sound);
      state.speed *= .48;
    } else state.score += 50;
  }
  if (!state.health || state.clock <= 0) {
    finish(state, "lost", !state.health ? "Your car needs a pit stop." : "Time expired on this circuit.", sound);
    return state;
  }
  if (state.distance < course.length) return state;
  state.score += 350 + Math.round(state.clock * 20);
  if (state.stage === circuits.length - 1) {
    finish(state, "won", "Three circuits cleared!", sound);
    return state;
  }
  sound("finish");
  return circuit({ ...state, stage: state.stage + 1 });
}
function moveFactory(state: Factory, dt: number, pressed: Keys, sound: (name: Sound) => void): GameState {
  state.spawnIn -= dt;
  state.feedback -= dt;
  if (state.spawnIn <= 0) {
    const id = state.spawned++;
    const sequence = [0, 2, 1, 0, 3, 1, 2, 0, 3, 2, 1];
    state.packages.push({ id, type: sequence[(id + state.stage * 3) % sequence.length], position: -22 });
    state.spawnIn = 1.58 - state.stage * .21;
  }
  for (const parcel of state.packages) parcel.position += (156 + state.stage * 34) * dt;
  const parcel = state.packages[0];
  const bin = inputBins.findIndex((input) => pressed.has(input));
  if (bin >= 0 && parcel && parcel.position >= 435 && parcel.position <= 606) {
    state.packages.shift();
    state.lastBin = bin;
    state.feedback = .42;
    if (parcel.type === bin) {
      state.packed += 1;
      state.score += Math.abs(520 - parcel.position) < 23 ? 150 : 100;
      state.message = bin === 3 ? "Prank parcel recycled!" : "Packed!";
      sound("collect");
    } else {
      state.health -= 1;
      state.message = "Wrong bin!";
      sound("impact");
    }
  } else if (parcel && parcel.position > 606) {
    state.packages.shift();
    state.health -= 1;
    state.message = "A parcel got away!";
    sound("impact");
  }
  if (!state.health) {
    finish(state, "lost", "The robot called a tea break.", sound);
    return state;
  }
  if (state.packed < quotas[state.stage]) return state;
  state.score += 250;
  if (state.stage === quotas.length - 1) {
    finish(state, "won", "All three factory shifts complete!", sound);
    return state;
  }
  sound("finish");
  return shift({ ...state, stage: state.stage + 1 });
}
export function stepGame(state: GameState, dt: number, held: Keys, pressed: Keys, sound: (name: Sound) => void) {
  state.time += dt;
  if (state.mode === "platform") return movePlatform(state, dt, held, pressed, sound);
  if (state.mode === "racing") return moveRacing(state, dt, held, sound);
  return moveFactory(state, dt, pressed, sound);
}
export function gameStatus(state: GameState) {
  if (state.mode === "platform") return `${gardens[state.stage].name} · Seeds ${state.seeds.filter((s) => s.picked).length}/3 · Hearts ${state.health}`;
  if (state.mode === "racing") return `${circuits[state.stage].name} · ${Math.floor(100 * state.distance / circuits[state.stage].length)}% · ${Math.max(0, Math.ceil(state.clock))}s · Car ${state.health}/3`;
  return `Shift ${state.stage + 1} · Packed ${state.packed}/${quotas[state.stage]} · Chances ${state.health}`;
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const rect = (x: number, y: number, w: number, h: number, colour: string, radius = 0) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  };
  const dot = (x: number, y: number, radius: number, colour: string) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = colour;
    ctx.fill();
  };
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  const horizon = state.mode === "platform" ? ["#153959", "#253864", "#32244e"][state.stage] : state.mode === "racing" ? "#592545" : "#3d2a68";
  sky.addColorStop(0, "#10132c");
  sky.addColorStop(1, horizon);
  rect(0, 0, width, height, "#10132c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  if (state.mode === "platform") {
    const level = gardens[state.stage];
    for (let i = 0; i < 38; i++) dot((i * 151 - state.camera * .13 + 720) % 720, 35 + i * 63 % 180, i % 6 === 0 ? 2 : 1, "#c7f7ff76");
    dot(553 - state.camera * .08, 100, 57, "#d4f8f32e");
    for (let i = 0; i < 8; i++) {
      const x = i * 143 - state.camera * .27;
      ctx.fillStyle = i % 2 ? "#192b4f" : "#203959";
      ctx.beginPath(); ctx.moveTo(x - 90, height); ctx.lineTo(x + 65, 138 + i * 37 % 136); ctx.lineTo(x + 193, height); ctx.fill();
    }
    ctx.save();
    ctx.translate(-state.camera, 0);
    for (const [x, y, w] of [...level.floor, ...level.ledges]) {
      rect(x, y, w, y === 345 ? 48 : 17, "#2b4662", 5);
      rect(x, y, w, 6, "#75d2b4", 3);
      for (let i = 14; i < w - 9; i += 35) rect(x + i, y + 9, 2, 4, "#87c8a8");
    }
    for (const seed of state.seeds) {
      if (seed.picked) continue;
      const y = seed.y + Math.sin(state.time * 4 + seed.x) * 3;
      dot(seed.x, y, 13, "#fcd6704a"); dot(seed.x, y, 7, "#ffde75"); dot(seed.x - 2, y - 2, 2, "#fffae1");
    }
    for (const bot of state.bots.filter((item) => item.active)) {
      rect(bot.x - 14, bot.y - 12, 28, 23, "#dc728f", 6);
      rect(bot.x - 10, bot.y + 8, 20, 6, "#822956", 3);
      dot(bot.x - 5, bot.y - 2, 2, "#211f3e"); dot(bot.x + 5, bot.y - 2, 2, "#211f3e");
    }
    const end = level.length - 56;
    rect(end - 7, 267, 14, 78, "#83a5bc", 5);
    dot(end, 264, 18, state.seeds.filter((s) => s.picked).length >= 3 ? "#98f6cf" : "#bc9acb");
    if (!state.shield || Math.floor(state.time * 12) % 2 === 0) {
      const y = state.y - 35;
      rect(state.x - 16, y, 32, 28, "#e9f3ec", 9);
      rect(state.x - 12, y + 7, 24, 13, "#22495a", 5);
      dot(state.x - 4, y + 13, 2.5, "#90f8de"); dot(state.x + 4, y + 13, 2.5, "#90f8de");
      rect(state.x - 12, y + 30, 24, 4, "#66d8ce", 2);
    }
    ctx.restore();
  } else if (state.mode === "racing") {
    const course = circuits[state.stage];
    dot(545, 95, 60, course.colour + "56");
    for (let i = 0; i < 7; i++) {
      const x = -75 + i * 146;
      ctx.fillStyle = i % 2 ? "#322347" : "#231c3b";
      ctx.beginPath(); ctx.moveTo(x - 35, 190); ctx.lineTo(x + 65, 76 + i * 37 % 70); ctx.lineTo(x + 156, 192); ctx.fill();
    }
    for (let y = 146; y < height; y += 3) {
      const depth = (y - 146) / 244;
      const centre = width / 2 + curve(state, (1 - depth) * 150) * (1 - depth) * 145;
      const road = 16 + depth * depth * 340;
      const stripe = Math.floor(state.distance / 8 + (1 - depth) * 24) % 2 === 0;
      rect(centre - road - 7, y, road * 2 + 14, 3, stripe ? course.colour : "#513c69");
      rect(centre - road, y, road * 2, 3, stripe ? "#282843" : "#2d2d48");
      if (stripe) for (const side of [-1, 1]) rect(centre + side * road / 3 - 1, y, 2 + depth * 3, 3, "#d3d1ec");
    }
    const car = (x: number, y: number, scale: number, colour: string) => {
      rect(x - 27 * scale, y - 18 * scale, 54 * scale, 31 * scale, "#141523", 6 * scale);
      rect(x - 23 * scale, y - 21 * scale, 46 * scale, 27 * scale, colour, 6 * scale);
      rect(x - 12 * scale, y - 18 * scale, 24 * scale, 10 * scale, "#243451", 3 * scale);
      rect(x - 20 * scale, y - 1, 11 * scale, 3 * scale, "#ffeff2", 2 * scale);
      rect(x + 9 * scale, y - 1, 11 * scale, 3 * scale, "#ffeff2", 2 * scale);
    };
    for (const rival of [...state.rivals].reverse()) {
      const ahead = rival.at - state.distance;
      if (rival.passed || ahead > 210) continue;
      const p = 1 - ahead / 210;
      car(width / 2 + rival.lane * 265 * p * p + curve(state, ahead) * (1 - p) * 145, 150 + p * p * 192, .18 + p * .95, "#9b9ef3");
    }
    if (!state.shield || Math.floor(state.time * 12) % 2 === 0) car(width / 2 + state.x * 265, 342, 1.25, "#ff9169");
  } else {
    const colours = ["#ffc5db", "#a3f2d9", "#fce49a", "#c7b9ff"];
    for (let i = 0; i < 10; i++) rect(i * 79 - 12, 0, 26, 148, i % 2 ? "#524177" : "#69528d", 9);
    const grin = Math.sin(state.time * 4) * 3;
    rect(302, 35 + grin, 116, 94, "#a4e3d7", 32);
    rect(319, 52 + grin, 82, 51, "#413557", 21);
    dot(342, 75 + grin, 6, "#edfcff"); dot(378, 75 + grin, 6, "#edfcff");
    rect(354, 88 + grin, 13, 4, "#e9fcf7", 2);
    rect(0, 194, width, 87, "#2b284d", 8);
    rect(435, 189, 171, 94, "#baf5d167", 8);
    rect(518, 189, 4, 94, "#fff4b5");
    for (let i = -1; i < 18; i++) rect(i * 48 + state.time * 61 % 48, 255, 30, 7, "#7a719a", 3);
    state.packages.forEach((parcel) => {
      const x = parcel.position;
      rect(x - 18, 204, 36, 39, colours[parcel.type], 11);
      ctx.fillStyle = "#232040"; ctx.textAlign = "center"; ctx.font = "700 22px system-ui";
      ctx.fillText(String(parcel.type + 1), x, 232);
    });
    colours.forEach((colour, i) => {
      const x = 63 + i * 160;
      rect(x, state.feedback > 0 && state.lastBin === i ? 297 : 308, 114, 53, colour, 12);
      ctx.fillStyle = "#24213d"; ctx.textAlign = "center"; ctx.font = "bold 21px system-ui";
      ctx.fillText(i === 3 ? "4 Recycle" : String(i + 1), x + 57, 340);
    });
  }
}
