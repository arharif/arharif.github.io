export type Mode = "phantom-dash" | "rocket-boom" | "pixel-panic";
export interface Object2D {
  x: number;
  y: number;
  type: "hazard" | "coin" | "shot";
  drift: number;
}
export function newRun(mode: Mode) {
  return {
    mode,
    x: mode === "phantom-dash" ? 80 : 320,
    y: 210,
    vy: 0,
    elapsed: 0,
    points: 0,
    lives: mode === "rocket-boom" ? 3 : 1,
    objects: [] as Object2D[],
    spawn: 0.8,
    cooldown: 0,
    grace: 0,
    ended: false,
  };
}
export type Run = ReturnType<typeof newRun>;
export const scoreOf = (s: Run) => Math.floor(s.elapsed * 10) + s.points;
export function step(
  s: Run,
  keys: ReadonlySet<string>,
  seconds: number,
  random = Math.random,
) {
  if (s.ended) return;
  const dt = Math.min(0.05, Math.max(0, seconds));
  s.elapsed += dt;
  s.spawn -= dt;
  s.cooldown -= dt;
  s.grace -= dt;
  const speed = Math.min(360, 135 + s.elapsed * 2);
  if (s.mode === "phantom-dash") {
    if ((keys.has(" ") || keys.has("ArrowUp")) && s.y >= 209.9) s.vy = -340;
    s.vy += 770 * dt;
    s.y = Math.min(210, s.y + s.vy * dt);
  } else {
    s.x = Math.max(
      12,
      Math.min(
        628,
        s.x +
          (Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"))) *
            280 *
            dt,
      ),
    );
    if (s.mode === "pixel-panic")
      s.y = Math.max(
        15,
        Math.min(
          229,
          s.y +
            (Number(keys.has("ArrowDown")) - Number(keys.has("ArrowUp"))) *
              220 *
              dt,
        ),
      );
    if (s.mode === "rocket-boom" && keys.has(" ") && s.cooldown <= 0) {
      s.objects.push({ type: "shot", x: s.x, y: s.y - 13, drift: 0 });
      s.cooldown = 0.2;
    }
  }
  if (s.spawn <= 0) {
    if (s.mode === "phantom-dash") {
      s.objects.push(
        { type: "hazard", x: 656, y: 210, drift: 0 },
        { type: "coin", x: 651, y: 153, drift: 0 },
      );
      s.spawn = Math.max(0.95, 1.7 - s.elapsed * 0.008) + random() * 0.4;
    } else {
      s.objects.push({
        type: "hazard",
        x: 18 + random() * 604,
        y: -12,
        drift: s.mode === "pixel-panic" ? (random() - 0.5) * 100 : 0,
      });
      s.spawn = Math.max(0.22, 0.82 - s.elapsed * 0.007);
    }
  }
  const removed = new Set<Object2D>();
  for (const object of s.objects) {
    if (object.type === "shot") object.y -= 400 * dt;
    else if (s.mode === "phantom-dash") object.x -= speed * dt;
    else {
      object.y += speed * 0.8 * dt;
      object.x += object.drift * dt;
    }
  }
  for (const shot of s.objects.filter((o) => o.type === "shot")) {
    const hit = s.objects.find(
      (o) =>
        o.type === "hazard" &&
        !removed.has(o) &&
        Math.abs(o.x - shot.x) < 15 &&
        Math.abs(o.y - shot.y) < 16,
    );
    if (hit) {
      removed.add(hit);
      removed.add(shot);
      s.points += 50;
    }
  }
  for (const object of s.objects) {
    if (
      removed.has(object) ||
      object.type === "shot" ||
      Math.abs(s.x - object.x) > 17 ||
      Math.abs(s.y - object.y) > 18
    )
      continue;
    if (object.type === "coin") {
      s.points += 25;
      removed.add(object);
    } else if (s.grace <= 0) {
      s.lives--;
      s.grace = 0.8;
      removed.add(object);
      if (s.lives <= 0) s.ended = true;
    }
  }
  s.objects = s.objects.filter(
    (o) =>
      !removed.has(o) && o.x >= -20 && o.x <= 665 && o.y >= -25 && o.y <= 260,
  );
}
