import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { drawGame, gameStatus, height, startGame, stepGame, width, type Input, type Sound } from "./featureEngine";
import type { FeatureGame as Game } from "./featureGames";
import { safeStorage } from "@/lib/storage";

const moves: Record<string, Input> = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
  a: "left", d: "right", w: "up", s: "down", " ": "up",
};
const bins: Record<string, Input> = { "1": "one", "2": "two", "3": "three", "4": "four", " ": "four" };
const pitch: Record<Sound, [number, number]> = {
  jump: [320, 560], collect: [520, 830], impact: [180, 85], finish: [430, 980],
};
const controls: Record<Game, [Input, string][]> = {
  "x1-platform-adventure": [["left", "Left"], ["right", "Right"], ["up", "Jump"]],
  "x1-racing": [["left", "Left"], ["right", "Right"], ["down", "Brake"], ["up", "Accelerate"]],
  "x1-fun-factory": [["one", "Bin 1"], ["two", "Bin 2"], ["three", "Bin 3"], ["four", "Recycle"]],
};
const soundKey = "x1-feature-game-sound";
export default function FeatureGame({ game, onFinish }: { game: Game; onFinish: (score: number, outcome: "win" | "loss", message: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef(startGame(game));
  const held = useRef(new Map<string | number, Input>());
  const pressed = useRef(new Set<Input>());
  const audio = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(() => safeStorage.get(soundKey) !== "on");
  const soundEnabled = useRef(!muted);
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState(() => gameStatus(state.current));
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const factory = game === "x1-fun-factory";

  function unlockSound() {
    if (soundEnabled.current && !audio.current && typeof AudioContext !== "undefined") {
      try { audio.current = new AudioContext(); } catch { return; }
    }
    if (audio.current?.state === "suspended") void audio.current.resume().catch(() => {});
  }
  function note(type: Sound) {
    const context = audio.current;
    if (!soundEnabled.current || !context || context.state !== "running") return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = type === "impact" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(pitch[type][0], now);
    oscillator.frequency.exponentialRampToValueAtTime(pitch[type][1], now + .13);
    gain.gain.setValueAtTime(.10, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + .16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(now + .17);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  useEffect(() => {
    function clearInput() { held.current.clear(); pressed.current.clear(); }
    function press(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, select, textarea, [contenteditable], .assistant-panel")) return;
      if (event.key === " " && event.target instanceof HTMLButtonElement) return;
      const input = (factory ? bins : moves)[event.key.toLowerCase()] ?? (factory ? bins : moves)[event.key];
      if (!input) return;
      event.preventDefault();
      if (event.repeat || paused) return;
      unlockSound();
      held.current.set(event.code, input);
      pressed.current.add(input);
    }
    function release(event: KeyboardEvent) { held.current.delete(event.code); }
    function suspend() {
      clearInput();
      setPaused(true);
    }
    function visibility() { if (document.hidden) suspend(); }
    function focusGuide(event: FocusEvent) {
      if (event.target instanceof HTMLElement && event.target.closest(".assistant-panel")) suspend();
    }
    window.addEventListener("keydown", press);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", suspend);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("focusin", focusGuide);
    return () => {
      clearInput();
      window.removeEventListener("keydown", press);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", suspend);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("focusin", focusGuide);
    };
  }, [factory, paused]);
  useEffect(() => () => {
    if (audio.current) { void audio.current.close().catch(() => {}); audio.current = null; }
  }, []);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    const scale = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.current!.width = width * scale;
    canvas.current!.height = height * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    canvas.current?.focus({ preventScroll: true });
    drawGame(context, state.current);
    if (paused) return;
    let frame = 0, last = 0, accumulator = 0, lastHud = -1;
    const timestep = 1 / 120;
    function update(now: number) {
      if (last) accumulator += Math.min(.05, (now - last) / 1000);
      last = now;
      const active = new Set(held.current.values());
      while (accumulator >= timestep) {
        state.current = stepGame(state.current, timestep, active, pressed.current, note);
        accumulator -= timestep;
        pressed.current.clear();
        if (state.current.result) break;
      }
      const run = state.current;
      drawGame(context!, run);
      if (run.result) {
        onFinish(run.score, run.result === "won" ? "win" : "loss", run.message);
        return;
      }
      if (now - lastHud > 125) {
        lastHud = now;
        setHud(gameStatus(run));
        setScore(run.score);
        const parcel = run.mode === "factory" ? run.packages[0] : undefined;
        setMessage(parcel && parcel.position >= 435 && parcel.position <= 606
          ? `Parcel for bin ${parcel.type + 1} ready` : run.message);
      }
      frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [paused, onFinish]);

  return (
    <section className="feature-game" aria-label="Game field">
      <div className="feature-game-hud">
        <p>{hud} · Score {score}</p>
        <button type="button" aria-label={paused ? "Resume game" : "Pause game"} onClick={() => setPaused(!paused)}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
        <button type="button" aria-label="Game sound" aria-pressed={!muted} onClick={() => {
          soundEnabled.current = muted;
          setMuted(!muted);
          safeStorage.set(soundKey, muted ? "on" : "off");
          if (muted) unlockSound();
        }}>{muted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
      </div>
      <canvas ref={canvas} width={width} height={height} tabIndex={0} aria-label="Arcade play area" />
      <p className="feature-game-message" role="status">{paused ? "Game paused" : message}</p>
      <div className="feature-game-input" aria-label="Touch controls">
        {controls[game].map(([input, label]) => (
          <button key={input} type="button" disabled={paused}
            onClick={(event) => { if (event.detail === 0) { unlockSound(); pressed.current.add(input); } }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              unlockSound();
              held.current.set(event.pointerId, input);
              pressed.current.add(input);
            }}
            onPointerUp={(event) => held.current.delete(event.pointerId)}
            onPointerCancel={(event) => held.current.delete(event.pointerId)}
            onLostPointerCapture={(event) => held.current.delete(event.pointerId)}
          >{label}</button>
        ))}
      </div>
    </section>
  );
}
