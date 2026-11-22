export function makeMaze(level: number, random = Math.random) {
  const size = 7 + level * 2,
    grid = Array<number>(size * size).fill(1);
  const start = size + 1,
    exit = size * (size - 1) - 2;
  grid[start] = 0;
  const stack = [start];
  while (stack.length) {
    const cell = stack[stack.length - 1],
      x = cell % size,
      y = Math.floor(cell / size);
    const moves = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ].filter(
      ([dx, dy]) =>
        x + dx > 0 &&
        x + dx < size - 1 &&
        y + dy > 0 &&
        y + dy < size - 1 &&
        grid[cell + dx + dy * size] === 1,
    );
    if (!moves.length) {
      stack.pop();
      continue;
    }
    const [dx, dy] = moves[Math.floor(random() * moves.length)];
    const next = cell + dx + dy * size;
    grid[(cell + next) / 2] = 0;
    grid[next] = 0;
    stack.push(next);
  }
  const paths = grid
    .map((v, i) => (!v && i !== exit && i !== start ? i : -1))
    .filter((i) => i >= 0);
  return {
    grid,
    size,
    start,
    exit,
    crystal: paths[Math.floor(random() * paths.length)],
  };
}
