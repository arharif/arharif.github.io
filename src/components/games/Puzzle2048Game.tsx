import { useEffect, useMemo, useState } from 'react';

type Dir = 'left' | 'right' | 'up' | 'down';

const size = 4;

const emptyBoard = () => Array.from({ length: size }, () => Array(size).fill(0));

const clone = (board: number[][]) => board.map((row) => [...row]);

const addRandomTile = (board: number[][]) => {
  const spots: Array<{ r: number; c: number }> = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (!v) spots.push({ r, c }); }));
  if (!spots.length) return board;
  const pick = spots[Math.floor(Math.random() * spots.length)];
  if (!pick) return board;
  board[pick.r]![pick.c] = Math.random() < 0.9 ? 2 : 4;
  return board;
};

const scoreBoard = (board: number[][]) => board.flat().reduce((acc, value) => acc + value, 0);

const compress = (line: number[]) => {
  const compact = line.filter(Boolean);
  const out: number[] = [];
  for (let i = 0; i < compact.length; i += 1) {
    if (compact[i] && compact[i] === compact[i + 1]) {
      out.push((compact[i] || 0) * 2);
      i += 1;
    } else out.push(compact[i] || 0);
  }
  while (out.length < size) out.push(0);
  return out;
};

const reverse = (line: number[]) => [...line].reverse();

const transpose = (board: number[][]) => board[0]!.map((_, c) => board.map((row) => row[c] || 0));

function move(board: number[][], dir: Dir) {
  let next = clone(board);
  if (dir === 'left') next = next.map((row) => compress(row));
  if (dir === 'right') next = next.map((row) => reverse(compress(reverse(row))));
  if (dir === 'up') next = transpose(transpose(next).map((row) => compress(row)));
  if (dir === 'down') next = transpose(transpose(next).map((row) => reverse(compress(reverse(row)))));
  const changed = JSON.stringify(next) !== JSON.stringify(board);
  return { next, changed };
}

const canMove = (board: number[][]) => {
  if (board.flat().includes(0)) return true;
  for (let r = 0; r < size; r += 1) for (let c = 0; c < size; c += 1) {
    const v = board[r]![c];
    if (board[r + 1]?.[c] === v || board[r]?.[c + 1] === v) return true;
  }
  return false;
};

export function Puzzle2048Game() {
  const [board, setBoard] = useState<number[][]>(() => addRandomTile(addRandomTile(emptyBoard())));

  const applyMove = (dir: Dir) => {
    setBoard((prev) => {
      const { next, changed } = move(prev, dir);
      if (!changed) return prev;
      return addRandomTile(next);
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') applyMove('left');
      if (e.key === 'ArrowRight') applyMove('right');
      if (e.key === 'ArrowUp') applyMove('up');
      if (e.key === 'ArrowDown') applyMove('down');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const score = useMemo(() => scoreBoard(board), [board]);
  const bestTile = useMemo(() => Math.max(...board.flat()), [board]);
  const gameOver = !canMove(board);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted">
        <p>Score: {score} · Best tile: {bestTile}</p>
        <button className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/20" onClick={() => setBoard(addRandomTile(addRandomTile(emptyBoard())))}>Restart</button>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-xl bg-black/20 p-2">
        {board.flat().map((value, i) => (
          <div key={i} className="flex h-16 items-center justify-center rounded-lg border border-white/10 bg-white/10 font-semibold">
            {value > 0 ? value : ''}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(['left', 'up', 'down', 'right'] as Dir[]).map((dir) => (
          <button key={dir} onClick={() => applyMove(dir)} className="rounded-lg bg-white/10 px-3 py-1 text-xs capitalize hover:bg-white/20">{dir}</button>
        ))}
      </div>
      {gameOver && <p className="text-sm text-amber-300">No moves left. Restart to continue.</p>}
    </div>
  );
}
