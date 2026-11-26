import { useEffect, useRef, useState } from "react";
import {
  newStack,
  stepStack,
  dropBlock,
  newBubbles,
  stepBubbles,
  type TableMode,
} from "./tableGames";
import type { PlayProps } from "./catalog";

export default function TableGame({
  mode,
  onFinish,
}: PlayProps & { mode: TableMode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stack] = useState(newStack);
  const [bubbles] = useState(newBubbles);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");
  const keys = useRef(new Set<string>());
  const isStack = mode === "neon-stack";
  useEffect(() => {
    canvas.current?.focus();
    const pause = () => {
      keys.current.clear();
      setPaused(true);
    };
    const hidden = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || paused) return;
    let frame = 0,
      previous = performance.now(),
      lastStatus = "";
    const tick = (now: number) => {
      const dt = Math.min(0.034, (now - previous) / 1000);
      previous = now;
      ctx.fillStyle = "#12132c";
      ctx.fillRect(0, 0, 480, 256);
      let text: string;
      if (isStack) {
        stepStack(stack, dt);
        const height = 16;
        stack.tower.forEach((layer, i) => {
          ctx.fillStyle = "hsl(" + (165 + i * 12) + " 68% 64%)";
          ctx.fillRect(layer.x, 238 - i * height, layer.width, height - 2);
        });
        ctx.fillStyle = "#ffb5ed";
        ctx.fillRect(
          stack.x,
          238 - stack.tower.length * height,
          stack.tower[stack.tower.length - 1].width,
          height - 2,
        );
        text =
          "Layers " + (stack.tower.length - 1) + "/12 · Score " + stack.score;
      } else {
        const direction =
          Number(keys.current.has("ArrowRight")) -
          Number(keys.current.has("ArrowLeft"));
        stepBubbles(bubbles, dt, direction);
        for (const b of bubbles.bubbles) {
          if (!b.active) continue;
          ctx.fillStyle = "hsl(" + (155 + b.y) + " 72% 67%)";
          ctx.beginPath();
          ctx.arc(b.x, b.y, 13, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = "#ffffffa8";
          ctx.fillRect(b.x - 5, b.y - 6, 4, 3);
        }
        ctx.fillStyle = "#93f3ff";
        ctx.fillRect(bubbles.paddle - 44, 232, 88, 8);
        ctx.beginPath();
        ctx.arc(bubbles.x, bubbles.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        text = "Lives " + bubbles.lives + " · Score " + bubbles.score;
      }
      if (lastStatus !== text) {
        setStatus(text);
        lastStatus = text;
      }
      const state = isStack ? stack : bubbles;
      if (state.ended) onFinish(state.score, state.win ? "win" : "loss");
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [bubbles, stack, paused, isStack, onFinish]);

  function point(clientX: number) {
    const box = canvas.current!.getBoundingClientRect();
    bubbles.paddle = Math.min(
      436,
      Math.max(44, ((clientX - box.left) * 480) / box.width),
    );
  }
  return (
    <div className="action-game">
      <div className="play-status">
        {status}
        <button
          onClick={() => {
            setPaused(!paused);
            canvas.current?.focus();
          }}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <canvas
        ref={canvas}
        width="480"
        height="256"
        tabIndex={0}
        aria-label={isStack ? "Stacking playfield" : "Bubble playfield"}
        style={{ touchAction: "none" }}
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", " "].includes(e.key)) return;
          e.preventDefault();
          if (!paused && isStack && e.key === " " && !e.repeat)
            dropBlock(stack);
          keys.current.add(e.key);
        }}
        onKeyUp={(e) => keys.current.delete(e.key)}
        onBlur={() => keys.current.clear()}
        onPointerDown={(e) => {
          if (paused) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          if (isStack) dropBlock(stack);
          else point(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!paused && !isStack && (e.pointerType === "mouse" || e.buttons))
            point(e.clientX);
        }}
      />
      {isStack && (
        <div className="game-controls">
          <button disabled={paused} onClick={() => dropBlock(stack)}>
            Drop block
          </button>
        </div>
      )}
    </div>
  );
}
