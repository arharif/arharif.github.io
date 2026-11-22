import { useEffect, useRef, useState } from "react";
import { makeMaze } from "./maze";
import type { PlayProps } from "./catalog";

export default function MazeGame({ onFinish }: PlayProps) {
  const [level, setLevel] = useState(1),
    [maze, setMaze] = useState(() => makeMaze(1));
  const [pos, setPos] = useState(maze.start),
    [crystal, setCrystal] = useState(false),
    [points, setPoints] = useState(0);
  const [start, setStart] = useState(Date.now),
    [seconds, setSeconds] = useState(0);
  const board = useRef<HTMLDivElement>(null);
  useEffect(() => {
    board.current?.focus();
    const id = setInterval(
      () => setSeconds(Math.floor((Date.now() - start) / 1000)),
      250,
    );
    return () => clearInterval(id);
  }, [start]);
  function move(delta: number) {
    const next = pos + delta;
    if (maze.grid[next] !== 0) return;
    setPos(next);
    if (next === maze.crystal) setCrystal(true);
    if (next === maze.exit && crystal) {
      const total =
        points +
        100 +
        Math.max(0, 100 - Math.floor((Date.now() - start) / 1000));
      if (level === 3) {
        onFinish(total);
        return;
      }
      const nextMaze = makeMaze(level + 1);
      setMaze(nextMaze);
      setPos(nextMaze.start);
      setPoints(total);
      setLevel(level + 1);
      setCrystal(false);
      setStart(Date.now());
      setSeconds(0);
    }
  }
  const dirs: Record<string, number> = {
    ArrowUp: -maze.size,
    ArrowDown: maze.size,
    ArrowLeft: -1,
    ArrowRight: 1,
  };
  return (
    <>
      <p className="play-status">
        Maze {level}/3 · {seconds}s ·{" "}
        {crystal ? "Crystal collected" : "Collect ◆ then reach ⚑"} · Score{" "}
        {points}
      </p>
      <div
        ref={board}
        tabIndex={0}
        className="maze-board"
        aria-label="Maze playfield"
        style={{ gridTemplateColumns: "repeat(" + maze.size + ",1fr)" }}
        onKeyDown={(e) => {
          if (e.key in dirs) {
            e.preventDefault();
            move(dirs[e.key]);
          }
        }}
      >
        {maze.grid.map((wall, i) => (
          <span key={i} className={wall ? "wall" : ""}>
            {pos === i
              ? "●"
              : i === maze.crystal && !crystal
                ? "◆"
                : i === maze.exit
                  ? "⚑"
                  : ""}
          </span>
        ))}
      </div>
      <div className="game-controls">
        {Object.entries(dirs).map(([k, d]) => (
          <button key={k} onClick={() => move(d)}>
            {k.slice(5)}
          </button>
        ))}
      </div>
    </>
  );
}
