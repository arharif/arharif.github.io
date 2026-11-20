import type { AIConfiguration, LearnerProgress } from "../data/types.ts";
export const emptyProgress = (): LearnerProgress => ({
  version: 1,
  completed: [],
  attempts: {},
  bookmarks: [],
  currentModule: null,
  competencies: [],
  savedExperiment: null,
});
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length <= 500 &&
  value.every((item) => typeof item === "string" && item.length <= 120);
export function validExperiment(value: unknown): value is AIConfiguration {
  if (!value || typeof value !== "object") return false;
  const row = value as AIConfiguration;
  return (
    Number.isFinite(row.threshold) &&
    row.threshold >= 0 &&
    row.threshold <= 1 &&
    Number.isInteger(row.prevalence) &&
    row.prevalence >= 1 &&
    row.prevalence <= 50 &&
    Number.isInteger(row.shift) &&
    row.shift >= 0 &&
    row.shift <= 8 &&
    Number.isInteger(row.features) &&
    row.features >= 1 &&
    row.features <= 12 &&
    Number.isInteger(row.seed) &&
    row.seed >= 0 &&
    row.seed <= 4294967295 &&
    ["training", "holdout"].includes(row.split)
  );
}
export function parseProgress(raw: string): LearnerProgress {
  if (raw.length > 100000) throw new Error("Progress import exceeds 100 KB.");
  const row = JSON.parse(raw);
  if (
    !row ||
    row.version !== 1 ||
    !strings(row.completed) ||
    !strings(row.bookmarks) ||
    !strings(row.competencies) ||
    !(
      row.currentModule === null ||
      (typeof row.currentModule === "string" && row.currentModule.length <= 120)
    ) ||
    !row.attempts ||
    typeof row.attempts !== "object" ||
    Array.isArray(row.attempts) ||
    Object.keys(row.attempts).length > 500 ||
    !Object.entries(row.attempts).every(
      ([key, value]) =>
        /^[a-z0-9-]{1,120}$/.test(key) &&
        Number.isInteger(value) &&
        Number(value) >= 0 &&
        Number(value) <= 10000,
    ) ||
    !(row.savedExperiment === null || validExperiment(row.savedExperiment))
  )
    throw new Error("Unsupported learner progress format.");
  return {
    version: 1,
    completed: row.completed,
    attempts: { ...row.attempts },
    bookmarks: row.bookmarks,
    currentModule: row.currentModule,
    competencies: row.competencies,
    savedExperiment: row.savedExperiment,
  };
}
