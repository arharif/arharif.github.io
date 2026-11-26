export const originals = [
  {
    key: "phantom-dash",
    title: "Phantom Dash",
    type: "Runner",
    desc: "Leap through a haunted neon skyline.",
    instructions:
      "Press Space, ↑ or Jump to clear barriers. Collect gold coins for 25 points and earn 10 points per second survived.",
  },
  {
    key: "haunted-memory",
    title: "Haunted Memory",
    type: "Memory",
    desc: "Uncover the ghostly matching pairs.",
    instructions:
      "Turn over two cards at a time. Match every pair. Your score rewards more pairs, fewer moves and faster completion.",
  },
  {
    key: "neon-maze-escape",
    title: "Neon Maze Escape",
    type: "Maze",
    desc: "Collect the crystal. Find the way out.",
    instructions:
      "Use the arrows or touch controls to collect the gold crystal and reach the green exit. Each cleared maze earns at least 100 points and opens a larger maze.",
  },
  {
    key: "rocket-boom",
    title: "Rocket Boom",
    type: "Shooter",
    desc: "Blast a path through the asteroid belt.",
    instructions:
      "Move with ← and → and fire with Space or the touch controls. Destroy asteroids for 50 points. Three impacts end a round.",
  },
  {
    key: "pixel-panic",
    title: "Pixel Panic",
    type: "Survival",
    desc: "Dodge an accelerating pixel storm.",
    instructions:
      "Move in four directions with arrow keys or the touch controls. Avoid falling, drifting pixels. Survive for 10 points per second.",
  },
  {
    key: "quiz-chaos",
    title: "Quiz Chaos",
    type: "Trivia",
    desc: "Race the clock across five questions.",
    instructions:
      "Choose a topic and timer, then answer five questions. Each correct answer earns 100 points plus the seconds remaining.",
  },
  { key: "neon-stack", title: "Neon Stack", type: "Timing", desc: "Balance a tower above the skyline.",
    instructions: "Press Space, tap the board or choose Drop block to stack twelve layers. Only the overlap stays. A missed layer ends the round." },
  { key: "bubble-blitz", title: "Bubble Blitz", type: "Paddle", desc: "Clear a constellation of neon bubbles.",
    instructions: "Move with ← and →, a mouse or a finger to return the ball. Pop all 24 bubbles for 50 points each. Three misses end the round." },
] as const;
export type OriginalKey = (typeof originals)[number]["key"];
export interface PlayProps {
  onFinish: (score: number, outcome?: "win" | "loss") => void;
}
export function shuffle<T>(values: readonly T[]) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
