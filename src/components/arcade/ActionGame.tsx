import { useEffect, useRef, useState } from "react";
import { newRun, scoreOf, step, type Mode, type Run } from "./actionEngine";
import type { PlayProps } from "./catalog";

function draw(ctx: CanvasRenderingContext2D, s: Run) {
  ctx.fillStyle = "#100e2d";
  ctx.fillRect(0, 0, 640, 244);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = i % 4 ? "#565275" : "#bbd4ff";
    ctx.fillRect(
      (i * 127 + 640 - (Math.floor(s.elapsed * 18) % 640)) % 640,
      (i * 37) % 224,
      2,
      2,
    );
  }
  if (s.mode === "phantom-dash") {
    ctx.fillStyle = "#38145c";
    for (let i = 0; i < 20; i++) {
      const h = 15 + ((i * 31) % 66);
      ctx.fillRect(
        ((i * 47 + 940 - s.elapsed * 37) % 940) - 47,
        223 - h,
        29,
        h,
      );
    }
    ctx.fillStyle = "#e653ff";
    ctx.fillRect(0, 223, 640, 3);
  }
  for (const o of s.objects) {
    ctx.fillStyle =
      o.type === "coin" ? "#ffdc67" : o.type === "shot" ? "#9bfdff" : "#fd58a6";
    if (o.type === "coin") {
      ctx.beginPath();
      ctx.arc(o.x, o.y, 7, 0, 2 * Math.PI);
      ctx.fill();
    } else if (o.type === "shot") ctx.fillRect(o.x - 2, o.y - 5, 4, 11);
    else {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(s.mode === "phantom-dash" ? 0 : s.elapsed);
      ctx.fillRect(-10, -11, 20, 22);
      ctx.fillStyle = "#ffbbef";
      ctx.fillRect(-6, -7, 6, 4);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.fillStyle = s.grace > 0 ? "#fff" : "#6dfaff";
  if (s.mode === "rocket-boom") {
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(13, 12);
    ctx.lineTo(0, 7);
    ctx.lineTo(-13, 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffae5a";
    ctx.fillRect(-3, 9, 6, 9);
  } else if (s.mode === "phantom-dash") {
    ctx.beginPath();
    ctx.arc(0, -1, 12, Math.PI, 2 * Math.PI);
    ctx.lineTo(12, 10);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 11);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-12, 11);
    ctx.fill();
    ctx.fillStyle = "#181137";
    ctx.fillRect(2, -4, 3, 4);
    ctx.fillRect(8, -4, 3, 4);
  } else {
    ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = "#151732";
    ctx.fillRect(-5, -4, 3, 4);
    ctx.fillRect(3, -4, 3, 4);
  }
  ctx.restore();
}
export default function ActionGame({
  mode,
  onFinish,
}: { mode: Mode } & PlayProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const run = useRef(newRun(mode));
  const keys = useRef(new Set<string>());
  const taps = useRef(new Set<string>());
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState({ score: 0, lives: run.current.lives });
  useEffect(() => {
    canvas.current?.focus();
  }, []);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || paused) return;
    let frame = 0,
      last = performance.now(),
      lastHud = 0;
    function tick(now: number) {
      const s = run.current;
      step(
        s,
        taps.current.size
          ? new Set([...keys.current, ...taps.current])
          : keys.current,
        (now - last) / 1000,
      );
      taps.current.clear();
      last = now;
      draw(ctx!, s);
      if (now - lastHud > 100) {
        setHud({ score: scoreOf(s), lives: s.lives });
        lastHud = now;
      }
      if (s.ended) {
        onFinish(scoreOf(s));
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    function pause() {
      keys.current.clear();
      taps.current.clear();
      setPaused(true);
    }
    function hidden() {
      if (document.hidden) pause();
    }
    frame = requestAnimationFrame(tick);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [paused, onFinish]);
  const buttons =
    mode === "phantom-dash"
      ? [[" ", "Jump"]]
      : mode === "rocket-boom"
        ? [
            ["ArrowLeft", "Left"],
            [" ", "Fire"],
            ["ArrowRight", "Right"],
          ]
        : [
            ["ArrowLeft", "Left"],
            ["ArrowUp", "Up"],
            ["ArrowDown", "Down"],
            ["ArrowRight", "Right"],
          ];
  return (
    <div
      className="action-game"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) keys.current.clear();
      }}
      onKeyDown={(e) => {
        if (e.target !== canvas.current) return;
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(
            e.key,
          )
        ) {
          e.preventDefault();
          keys.current.add(e.key);
          taps.current.add(e.key);
        }
      }}
      onKeyUp={(e) => keys.current.delete(e.key)}
    >
      <div className="play-status">
        Score {hud.score} · Lives {hud.lives}
        <button
          onClick={() => {
            keys.current.clear();
            setPaused(!paused);
            canvas.current?.focus();
          }}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <canvas
        width="640"
        height="244"
        ref={canvas}
        tabIndex={0}
        aria-label={
          mode + " playfield. Use the keyboard or the controls below."
        }
      />
      <div className="game-controls">
        {buttons.map(([key, label]) => (
          <button
            key={key}
            aria-label={label}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              keys.current.add(key);
              taps.current.add(key);
            }}
            onLostPointerCapture={() => keys.current.delete(key)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") keys.current.add(key);
            }}
            onKeyUp={() => keys.current.delete(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
