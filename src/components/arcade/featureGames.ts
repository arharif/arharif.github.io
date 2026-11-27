export const featureGames = [
  {
    key: "x1-platform-adventure",
    title: "X1 Platform Adventure",
    type: "Adventure",
    desc: "Guide a little courier across three sky gardens and restore the beacon.",
    instructions: "Move with ←/→ or A/D. Jump with ↑, W or Space. Collect at least three seeds in each garden and reach its beacon. Jump on patrol bots to disable them. You have three hearts.",
  },
  {
    key: "x1-racing",
    title: "X1 Racing",
    type: "Racing",
    desc: "Race through three neon circuits and weave past the traffic.",
    instructions: "Steer with ←/→ or A/D. Accelerate with ↑ or W and brake with ↓ or S. Finish all three circuits before time runs out. Impacts damage your car and slow it down.",
  },
  {
    key: "x1-fun-factory",
    title: "X1 Fun Factory",
    type: "Sorting",
    desc: "Pack wobbly sweets for a robot whose conveyor keeps speeding up.",
    instructions: "Press 1, 2 or 3 to sort each item into its matching numbered bin as it reaches the packing line. Press Space to recycle the striped prank parcels into bin 4. Clear the three shifts with fewer than five mistakes.",
  },
] as const;
export type FeatureGame = (typeof featureGames)[number]["key"];
export const isFeatureGame = (key: string): key is FeatureGame => featureGames.some((game) => game.key === key);
