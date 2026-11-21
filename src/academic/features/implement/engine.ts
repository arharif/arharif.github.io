import { findStandard } from "../../data/standards.ts";
export interface PlanTask {
  id: string;
  title: string;
  phase: string;
  owner: string;
  duration: number;
  requestedStart: string;
  dependencies: string[];
  progress: number;
  milestone: boolean;
  gap: string;
  issue: string;
}
export interface ImplementationPlan {
  version: 1;
  framework: string;
  scope: string;
  start: string;
  generatedAt: string;
  tasks: PlanTask[];
}
export interface ScheduledTask extends PlanTask {
  start: string;
  end: string;
  offset: number;
  finishOffset: number;
}
const day = 86400000;
export function dateNumber(value: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(`${value}T00:00:00Z`)) ||
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
  )
    throw new Error("Use a valid calendar date.");
  return Date.parse(`${value}T00:00:00Z`);
}
export function dateAt(start: string, offset: number) {
  return new Date(dateNumber(start) + offset * day).toISOString().slice(0, 10);
}
export function schedule(plan: ImplementationPlan): ScheduledTask[] {
  const start = dateNumber(plan.start),
    byId = new Map(plan.tasks.map((task) => [task.id, task]));
  if (byId.size !== plan.tasks.length || plan.tasks.length > 250)
    throw new Error(
      "Task IDs must be unique and plans support at most 250 tasks.",
    );
  const completed = new Map<string, ScheduledTask>(),
    visiting = new Set<string>();
  const visit = (id: string): ScheduledTask => {
    if (completed.has(id)) return completed.get(id)!;
    if (visiting.has(id)) throw new Error("Dependency cycle detected.");
    const task = byId.get(id);
    if (!task) throw new Error(`Unknown task dependency: ${id}`);
    if (
      !Number.isInteger(task.duration) ||
      task.duration < (task.milestone ? 0 : 1) ||
      task.duration > 365 ||
      !Number.isInteger(task.progress) ||
      task.progress < 0 ||
      task.progress > 100
    )
      throw new Error(
        "Duration must be 1–365 days, milestones 0–365 days, and progress 0–100.",
      );
    visiting.add(id);
    const earliest = task.requestedStart
      ? Math.max(0, Math.ceil((dateNumber(task.requestedStart) - start) / day))
      : 0;
    const prerequisite = Math.max(
      0,
      ...task.dependencies.map(
        (dependency) => visit(dependency).finishOffset + 1,
      ),
    );
    const offset = Math.max(earliest, prerequisite),
      finishOffset = offset + Math.max(0, task.duration - 1);
    const scheduled = {
      ...task,
      start: dateAt(plan.start, offset),
      end: dateAt(plan.start, finishOffset),
      offset,
      finishOffset,
    };
    visiting.delete(id);
    completed.set(id, scheduled);
    return scheduled;
  };
  return plan.tasks.map((task) => visit(task.id));
}
export function generatePlan(
  framework: string,
  scope: string,
  start: string,
  owner: string,
  gaps: { id: string; action: string }[] = [],
): ImplementationPlan {
  const standard = findStandard(framework);
  if (!standard) throw new Error("Choose a supported framework.");
  dateNumber(start);
  if (!scope.trim() || !owner.trim())
    throw new Error("Scope and accountable owner are required.");
  const tasks: PlanTask[] = [
    {
      id: "scope",
      title: "Confirm scope, applicability and accountable authority",
      phase: "Scope & governance",
      owner,
      duration: 5,
      requestedStart: start,
      dependencies: [],
      progress: 0,
      milestone: false,
      gap: "",
      issue:
        "Publisher edition and legal applicability require current verification.",
    },
  ];
  standard.nodes.forEach((node, index) => {
    const id = `area-${index + 1}`;
    tasks.push({
      id,
      title: `Implement · ${node.title}`,
      phase: node.title,
      owner: node.owner,
      duration: 10,
      requestedStart: "",
      dependencies: ["scope"],
      progress: 0,
      milestone: false,
      gap: gaps
        .filter((gap) => gap.id.startsWith(node.id))
        .map((gap) => `${gap.id} ${gap.action}`)
        .join(" "),
      issue: node.mistake,
    });
    tasks.push({
      id: `${id}-test`,
      title: `Validate · ${node.title}`,
      phase: node.title,
      owner: "Independent assessor / exercise lead",
      duration: 3,
      requestedStart: "",
      dependencies: [id],
      progress: 0,
      milestone: false,
      gap: "",
      issue: `Evidence needed: ${node.evidence}`,
    });
  });
  gaps
    .filter((gap) => !tasks.some((task) => task.gap.includes(gap.id)))
    .slice(0, 60)
    .forEach((gap, index) =>
      tasks.push({
        id: `gap-${index + 1}`,
        title: `Remediate ${gap.id} · ${gap.action}`,
        phase: "Assessment follow-up",
        owner,
        duration: 5,
        requestedStart: "",
        dependencies: ["scope"],
        progress: 0,
        milestone: false,
        gap: gap.id,
        issue:
          "Validate the proposed action and assessment scope with the control owner.",
      }),
    );
  tasks.push({
    id: "readiness",
    title: "Management review and readiness decision",
    phase: "Review & improve",
    owner,
    duration: 2,
    requestedStart: "",
    dependencies: tasks
      .filter((task) => task.id.endsWith("-test") || task.id.startsWith("gap-"))
      .map((task) => task.id),
    progress: 0,
    milestone: false,
    gap: "",
    issue:
      "An educational roadmap is not a certification or legal determination.",
  });
  tasks.push({
    id: "milestone",
    title: "Approved improvement milestone",
    phase: "Review & improve",
    owner,
    duration: 0,
    requestedStart: "",
    dependencies: ["readiness"],
    progress: 0,
    milestone: true,
    gap: "",
    issue: "Record the authorised decision and next review trigger.",
  });
  const plan: ImplementationPlan = {
    version: 1,
    framework,
    scope: scope.trim(),
    start,
    generatedAt: new Date().toISOString(),
    tasks,
  };
  schedule(plan);
  return plan;
}
export function parsePlan(raw: string): ImplementationPlan {
  if (raw.length > 500000) throw new Error("Plan file exceeds 500 KB.");
  const value = JSON.parse(raw);
  if (
    !value ||
    value.version !== 1 ||
    !findStandard(value.framework) ||
    typeof value.scope !== "string" ||
    value.scope.length > 2000 ||
    typeof value.generatedAt !== "string" ||
    !Array.isArray(value.tasks)
  )
    throw new Error("Invalid plan format.");
  for (const task of value.tasks) {
    if (
      !task ||
      ![
        "id",
        "title",
        "phase",
        "owner",
        "requestedStart",
        "gap",
        "issue",
      ].every(
        (key) => typeof task[key] === "string" && task[key].length <= 4000,
      ) ||
      !Array.isArray(task.dependencies) ||
      task.dependencies.length > 250 ||
      !task.dependencies.every((id: unknown) => typeof id === "string") ||
      typeof task.milestone !== "boolean"
    )
      throw new Error("Invalid plan task.");
  }
  const result: ImplementationPlan = {
    version: 1,
    framework: value.framework,
    scope: value.scope,
    start: value.start,
    generatedAt: value.generatedAt,
    tasks: value.tasks.map((task: PlanTask) => ({
      ...task,
      dependencies: [...task.dependencies],
    })),
  };
  schedule(result);
  return result;
}
export function planSummary(tasks: ScheduledTask[], today: string) {
  dateNumber(today);
  return {
    total: tasks.length,
    complete: tasks.filter((task) => task.progress === 100).length,
    delayed: tasks.filter((task) => task.end < today && task.progress < 100)
      .length,
    progress: tasks.length
      ? Math.round(
          tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length,
        )
      : 0,
    end: tasks.reduce(
      (latest, task) => (task.end > latest ? task.end : latest),
      "",
    ),
  };
}
export function timelineOffsets(
  start: string,
  days: number,
  scale: string,
): number[] {
  dateNumber(start);
  if (scale !== "month")
    return Array.from(
      { length: Math.ceil(days / (scale === "day" ? 1 : 7)) },
      (_, index) => index * (scale === "day" ? 1 : 7),
    );
  const offsets = [0],
    begin = new Date(`${start}T00:00:00Z`);
  let next = new Date(
    Date.UTC(begin.getUTCFullYear(), begin.getUTCMonth() + 1, 1),
  );
  while ((next.getTime() - begin.getTime()) / day < days) {
    offsets.push((next.getTime() - begin.getTime()) / day);
    next = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 1));
  }
  return offsets;
}
