export function timelineTicks(
  first: string,
  span: number,
  mode: "day" | "week" | "month",
) {
  if (!Number.isInteger(span) || span < 1)
    throw new Error("Timeline span must be a positive whole number.");
  const start = new Date(first + "T00:00:00Z");
  if (!Number.isFinite(+start))
    throw new Error("Timeline start must be a valid date.");
  if (mode !== "month") {
    const base = mode === "day" ? 1 : 7,
      step = base * Math.max(1, Math.ceil(span / (base * 250)));
    return Array.from(
      { length: Math.ceil(span / step) },
      (_, index) => index * step,
    );
  }
  const ticks = [0],
    monthStep = Math.max(1, Math.ceil(span / (28 * 250)));
  let next = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1),
  );
  while ((+next - +start) / 86400000 < span) {
    ticks.push((+next - +start) / 86400000);
    next = new Date(
      Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + monthStep, 1),
    );
  }
  return ticks;
}
