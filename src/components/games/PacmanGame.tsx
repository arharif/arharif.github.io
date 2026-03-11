import { useEffect, useMemo, useState } from 'react';

type Ghost = { id: number; pos: number; dir: number };

const width = 19;
const mazeRows = [
  '###################',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#o###.##.#.##.###o#',
  '#.................#',
  '#.###.#.#####.#.###',
  '#.....#...#...#...#',
  '#####.### # ###.###',
  '#####.#       #.###',
  '#####.# ## ## #.###',
  '#........#........#',
  '#.###.##.#.##.###.#',
  '#o..#....P....#..o#',
  '###.#.#.#####.#.###',
  '#.....#...#...#...#',
  '#.#######.#.#######',
  '#.................#',
  '#.###############.#',
  '###################',
];

const parseMaze = () => {
  const grid: number[] = [];
  let pacmanStart = 0;
  const ghosts: number[] = [];

  mazeRows.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      const idx = y * width + x;
      if (char === '#') grid[idx] = 1;
      else if (char === '.') grid[idx] = 0;
      else if (char === 'o') grid[idx] = 3;
      else if (char === 'P') {
        grid[idx] = 0;
        pacmanStart = idx;
      } else if (char === ' ') {
        grid[idx] = 2;
      } else {
        grid[idx] = 0;
      }
    });
  });

  ghosts.push(9 * width + 8, 9 * width + 10, 8 * width + 9);
  return { grid, pacmanStart, ghosts };
};

const initial = parseMaze();
const directions = [-1, 1, -width, width];

const canMove = (grid: number[], from: number, dir: number) => {
  const to = from + dir;
  const x = from % width;
  if (dir === -1 && x === 0) return false;
  if (dir === 1 && x === width - 1) return false;
  if (to < 0 || to >= grid.length) return false;
  return grid[to] !== 1;
};

export function PacmanGame() {
  const [grid, setGrid] = useState<number[]>(initial.grid);
  const [pacman, setPacman] = useState(initial.pacmanStart);
  const [dir, setDir] = useState(1);
  const [queuedDir, setQueuedDir] = useState(1);
  const [ghosts, setGhosts] = useState<Ghost[]>(initial.ghosts.map((pos, id) => ({ id, pos, dir: directions[id % directions.length] })));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');

  const pelletsLeft = useMemo(() => grid.filter((cell) => cell === 0 || cell === 3).length, [grid]);

  const reset = () => {
    setGrid(initial.grid);
    setPacman(initial.pacmanStart);
    setDir(1);
    setQueuedDir(1);
    setGhosts(initial.ghosts.map((pos, id) => ({ id, pos, dir: directions[id % directions.length] })));
    setScore(0);
    setLives(3);
    setStatus('idle');
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setQueuedDir(-1);
      if (event.key === 'ArrowRight') setQueuedDir(1);
      if (event.key === 'ArrowUp') setQueuedDir(-width);
      if (event.key === 'ArrowDown') setQueuedDir(width);
      if (event.key === ' ' && status === 'idle') setStatus('playing');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    const tick = window.setInterval(() => {
      setPacman((prev) => {
        let nextDir = dir;
        if (canMove(grid, prev, queuedDir)) nextDir = queuedDir;
        if (!canMove(grid, prev, nextDir)) return prev;
        const next = prev + nextDir;
        setDir(nextDir);

        setGrid((old) => {
          const updated = [...old];
          if (updated[next] === 0) {
            updated[next] = 2;
            setScore((value) => value + 10);
          }
          if (updated[next] === 3) {
            updated[next] = 2;
            setScore((value) => value + 50);
          }
          return updated;
        });

        return next;
      });

      setGhosts((prevGhosts) =>
        prevGhosts.map((ghost) => {
          const options = directions.filter((option) => canMove(grid, ghost.pos, option));
          const keep = canMove(grid, ghost.pos, ghost.dir);
          const chosen = keep && Math.random() > 0.35 ? ghost.dir : options[Math.floor(Math.random() * options.length)] ?? ghost.dir;
          return { ...ghost, dir: chosen, pos: ghost.pos + chosen };
        }),
      );
    }, 170);

    return () => window.clearInterval(tick);
  }, [status, dir, queuedDir, grid]);

  useEffect(() => {
    if (status !== 'playing') return;
    const hitGhost = ghosts.some((ghost) => ghost.pos === pacman);
    if (hitGhost) {
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) setStatus('lost');
        return next;
      });
      setPacman(initial.pacmanStart);
      setGhosts(initial.ghosts.map((pos, id) => ({ id, pos, dir: directions[id % directions.length] })));
    }
  }, [ghosts, pacman, status]);

  useEffect(() => {
    if (status === 'playing' && pelletsLeft === 0) {
      setStatus('won');
    }
  }, [pelletsLeft, status]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p>Score: <span className="font-semibold">{score}</span></p>
        <p>Lives: <span className="font-semibold">{lives}</span></p>
        <p className="text-muted">{status === 'idle' ? 'Press space to start' : status === 'playing' ? 'Use arrow keys' : status === 'won' ? 'You cleared the maze!' : 'Game over'}</p>
      </header>

      <div className="mx-auto grid w-full max-w-[560px] gap-0.5 rounded-2xl border border-cyan-300/25 bg-slate-950/80 p-2" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
        {grid.map((cell, idx) => {
          const isPacman = idx === pacman;
          const ghost = ghosts.find((g) => g.pos === idx);
          return (
            <div key={idx} className="aspect-square rounded-[4px] flex items-center justify-center" style={{ background: cell === 1 ? '#1e3a8a' : '#020617' }}>
              {cell === 0 && <span className="h-1.5 w-1.5 rounded-full bg-yellow-200/90" />}
              {cell === 3 && <span className="h-3 w-3 rounded-full bg-amber-300" />}
              {isPacman && <span className="h-3.5 w-3.5 rounded-full bg-yellow-300" />}
              {!isPacman && ghost && <span className="h-3.5 w-3.5 rounded-sm bg-rose-400" />}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        {status === 'idle' && <button onClick={() => setStatus('playing')} className="rounded-lg bg-cyan-500/20 px-3 py-2 text-xs">Start</button>}
        {(status === 'won' || status === 'lost' || status === 'playing') && <button onClick={reset} className="rounded-lg bg-white/10 px-3 py-2 text-xs">Restart</button>}
      </div>
    </div>
  );
}
