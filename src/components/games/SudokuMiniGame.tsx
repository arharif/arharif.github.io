import { useMemo, useState } from 'react';

const puzzle = [
  [1, 0, 0, 4],
  [0, 4, 1, 0],
  [2, 0, 4, 0],
  [0, 3, 0, 1],
];

const solution = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

export function SudokuMiniGame() {
  const [grid, setGrid] = useState<number[][]>(() => puzzle.map((r) => [...r]));

  const setCell = (r: number, c: number, value: number) => {
    if (puzzle[r]![c]) return;
    setGrid((prev) => prev.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? value : cell))));
  };

  const solved = useMemo(() => grid.every((row, r) => row.every((cell, c) => cell === solution[r]![c])), [grid]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Mini Sudoku (4×4). Fill empty cells with 1–4 so each row, column, and 2×2 block is unique.</p>
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-black/20 p-2">
        {grid.flatMap((row, r) => row.map((cell, c) => (
          <div key={`${r}-${c}`} className="rounded-md border border-white/10 bg-white/10 p-2">
            {puzzle[r]![c] ? (
              <p className="text-center font-semibold">{cell}</p>
            ) : (
              <select
                value={cell || ''}
                onChange={(e) => setCell(r, c, Number(e.target.value || 0))}
                className="w-full bg-transparent text-center outline-none"
                aria-label={`Sudoku cell ${r + 1}-${c + 1}`}
              >
                <option value="">·</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            )}
          </div>
        )))}
      </div>
      <button className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/20" onClick={() => setGrid(puzzle.map((r) => [...r]))}>Reset</button>
      {solved && <p className="text-sm text-emerald-300">Solved. Great work.</p>}
    </div>
  );
}
