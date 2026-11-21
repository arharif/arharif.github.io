import type { Finding, Studio, Task, Resource, PrivacyRisk } from "./model.ts";
import { isoDate } from "./model.ts";
export const maturityMethod =
  "X1 Educational Maturity Model v1 (0–4), not a NIST scale. Include applicable items with a recorded current level, including explicit 0. Exclude justified exclusions. Unassessed and unjustified exclusions are reported separately. Weighted mean = Σ(level × weight) / Σweight; target uses the identical eligible population. Equal weights are 1; priority weighting uses entered weight 1–5. Round for display only. Evidence verification is separate from rating.";
export function recordFinding(
  records: Finding[],
  draft: Finding,
  period: Studio["scope"],
) {
  const same = (f: Finding) =>
    f.framework === draft.framework &&
    f.edition === draft.edition &&
    f.controlId === draft.controlId;
  const previous = records.find(same);
  return [
    ...records.filter((f) => !same(f)),
    {
      ...draft,
      id: previous?.id ?? draft.id,
      riskId: previous?.riskId ?? draft.riskId,
      taskId: previous?.taskId ?? draft.taskId,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
    },
  ];
}
export function matchingFindings(records: Finding[], filter: string) {
  const eligible = records.filter(
    (f) => f.applicability === "Applicable" && f.current !== null,
  );
  if (filter === "All") return records;
  if (filter === "Assessed") return eligible;
  if (filter === "Unassessed")
    return records.filter(
      (f) => f.applicability === "Applicable" && f.current === null,
    );
  if (filter === "Gaps") return eligible.filter((f) => f.current! < f.target);
  if (
    [
      "None",
      "Learner assertion",
      "Document reviewed",
      "Independently tested",
    ].includes(filter)
  )
    return eligible.filter((f) => f.verification === filter);
  if (filter.startsWith("confidence:"))
    return eligible.filter((f) => f.confidence === filter.slice(11));
  return records.filter((f) => f.group === filter);
}
export function controlDecisionState(d?: Studio["sp"]["decisions"][string]) {
  return d?.reviewed ? (d.applicable ? d.status : "Excluded") : "Not started";
}
export function aggregate(
  findings: Finding[],
  weighting: Studio["rubric"]["weighting"] = "Equal",
) {
  for (const f of findings) {
    if (
      (f.current !== null &&
        (!Number.isInteger(f.current) || f.current < 0 || f.current > 4)) ||
      !Number.isInteger(f.target) ||
      f.target < 0 ||
      f.target > 4 ||
      !Number.isInteger(f.weight) ||
      f.weight < 1 ||
      f.weight > 5
    )
      throw new Error(
        "Maturity levels must be integers 0–4 and weights integers 1–5.",
      );
  }
  const eligible = findings.filter(
    (f) => f.applicability === "Applicable" && f.current !== null,
  );
  const excluded = findings.filter(
    (f) => f.applicability === "Excluded" && f.exclusion.trim(),
  );
  const invalidExclusions = findings.filter(
    (f) => f.applicability === "Excluded" && !f.exclusion.trim(),
  );
  const weight = (f: Finding) => (weighting === "Equal" ? 1 : f.weight);
  const denominator = eligible.reduce((n, f) => n + weight(f), 0);
  const current = denominator
    ? eligible.reduce((n, f) => n + f.current! * weight(f), 0) / denominator
    : null;
  const target = denominator
    ? eligible.reduce((n, f) => n + f.target * weight(f), 0) / denominator
    : null;
  return {
    current,
    target,
    denominator,
    assessed: eligible.length,
    excluded: excluded.length,
    unassessed: findings.filter(
      (f) => f.applicability === "Applicable" && f.current === null,
    ).length,
    invalidExclusions: invalidExclusions.length,
    gaps: eligible.filter((f) => f.current! < f.target),
    evidence: Object.fromEntries(
      [
        "None",
        "Learner assertion",
        "Document reviewed",
        "Independently tested",
      ].map((s) => [s, eligible.filter((f) => f.verification === s).length]),
    ),
    groups: [...new Set(findings.map((f) => f.group))].map((group) => {
      const items = eligible.filter((f) => f.group === group),
        d = items.reduce((n, f) => n + weight(f), 0);
      return {
        group,
        count: items.length,
        current: d
          ? items.reduce((n, f) => n + f.current! * weight(f), 0) / d
          : null,
        target: d
          ? items.reduce((n, f) => n + f.target * weight(f), 0) / d
          : null,
      };
    }),
  };
}
const dayMs = 86400000;
export const addDays = (date: string, n: number) =>
  new Date(Date.parse(date + "T00:00:00Z") + n * dayMs)
    .toISOString()
    .slice(0, 10);
export function schedule(
  tasks: Task[],
  resources: Resource[],
  start: string,
  calendar: Studio["calendar"],
) {
  if (tasks.length > 500) throw new Error("Maximum 500 implementation tasks.");
  if (!isoDate.safeParse(start).success)
    throw new Error("Choose a valid project start date.");
  if (!calendar.weekdays.length)
    throw new Error("Select at least one working weekday.");
  const ids = new Set<string>();
  for (const t of tasks) {
    if (ids.has(t.id)) throw new Error(`Duplicate task ID ${t.id}.`);
    ids.add(t.id);
    if (!t.sourceIds.length)
      throw new Error(
        `${t.title}: requirement or objective trace is required.`,
      );
    if (
      t.duration < 0 ||
      !Number.isInteger(t.duration) ||
      !Number.isFinite(t.effort) ||
      t.effort < 0
    )
      throw new Error(`${t.title}: invalid effort/duration.`);
    if (t.milestone && (t.effort !== 0 || t.duration !== 0))
      throw new Error(
        `${t.title}: milestone duration and effort must be zero.`,
      );
    if (!t.milestone && t.duration < 1)
      throw new Error(`${t.title}: task duration must be at least one day.`);
    for (const d of [t.requestedStart, t.deadline])
      if (d && !isoDate.safeParse(d).success)
        throw new Error(`${t.title}: invalid date.`);
  }
  const byId = new Map(tasks.map((t) => [t.id, t]));
  for (const t of tasks)
    for (const d of t.dependencies)
      if (!byId.has(d)) throw new Error(`${t.title}: missing dependency ${d}.`);
  const pending = new Set(tasks.map((t) => t.id)),
    order: Task[] = [];
  while (pending.size) {
    const ready = tasks.find(
      (t) => pending.has(t.id) && t.dependencies.every((d) => !pending.has(d)),
    );
    if (!ready)
      throw new Error(
        "Circular task dependencies detected. Remove the cycle before scheduling.",
      );
    order.push(ready);
    pending.delete(ready.id);
  }
  const working = (d: string) =>
    calendar.weekdays.includes(new Date(d + "T00:00:00Z").getUTCDay()) &&
    !calendar.holidays.includes(d);
  function next(d: string) {
    let v = d;
    for (let i = 0; i < 4000; i++) {
      if (working(v)) return v;
      v = addDays(v, 1);
    }
    throw new Error(
      "Working calendar has no available date within the planning horizon.",
    );
  }
  function finish(s: string, duration: number) {
    let date = next(s);
    for (let i = 1; i < duration; i++) date = next(addDays(date, 1));
    return date;
  }
  type Scheduled = {
    task: Task;
    start: string;
    end: string;
    duration: number;
    cost: number;
    late: boolean;
    resourceDelay: number;
    early: number;
    slack: number;
    critical: boolean;
  };
  const rows: Scheduled[] = [],
    resourceFree = new Map<string, string>(),
    earlyFinish = new Map<string, number>(),
    durations = new Map<string, number>();
  for (const t of order) {
    const r = resources.find((r) => r.id === t.resourceId);
    if (!t.milestone && !r) throw new Error(`${t.title}: assign a resource.`);
    if (
      r &&
      (!Number.isFinite(r.rate) ||
        r.rate < 0 ||
        !Number.isFinite(r.hoursPerDay) ||
        r.hoursPerDay <= 0)
    )
      throw new Error(
        "Resource rates and capacities must be valid nonnegative/positive numbers.",
      );
    const duration = t.milestone
      ? 0
      : Math.max(t.duration, Math.ceil(t.effort / r!.hoursPerDay));
    if (duration > 730)
      throw new Error(
        `${t.title}: effective duration exceeds 730 working days; split the task or review capacity.`,
      );
    durations.set(t.id, duration);
    const early = Math.max(
      0,
      ...t.dependencies.map((d) => earlyFinish.get(d)!),
    );
    earlyFinish.set(t.id, early + duration);
    const depEnd = t.dependencies.map(
      (id) => rows.find((s) => s.task.id === id)!.end,
    );
    const earliest = next(
      [
        start,
        t.requestedStart || start,
        ...depEnd.map((d) => next(addDays(d, 1))),
      ]
        .sort()
        .pop()!,
    );
    const available = resourceFree.get(t.resourceId);
    const planned = next(
      available && available > earliest && !t.milestone ? available : earliest,
    );
    const end = t.milestone ? planned : finish(planned, duration);
    if ((Date.parse(end) - Date.parse(start)) / dayMs > 3650)
      throw new Error(
        "Schedule exceeds the ten-year educational planning horizon.",
      );
    if (!t.milestone) resourceFree.set(t.resourceId, next(addDays(end, 1)));
    rows.push({
      task: t,
      start: planned,
      end,
      duration,
      cost: t.milestone ? 0 : t.effort * r!.rate,
      late: !!t.deadline && end > t.deadline,
      resourceDelay: Math.round(
        (Date.parse(planned) - Date.parse(earliest)) / dayMs,
      ),
      early,
      slack: 0,
      critical: false,
    });
  }
  const horizon = Math.max(0, ...earlyFinish.values()),
    lateStart = new Map<string, number>();
  for (const t of [...order].reverse()) {
    const successors = order.filter((o) => o.dependencies.includes(t.id));
    const latestFinish = successors.length
      ? Math.min(...successors.map((s) => lateStart.get(s.id)!))
      : horizon;
    const late = latestFinish - durations.get(t.id)!;
    lateStart.set(t.id, late);
    const row = rows.find((r) => r.task.id === t.id)!;
    row.slack = late - row.early;
    row.critical = row.slack === 0;
  }
  return {
    rows,
    cost: rows.reduce((n, r) => n + r.cost, 0),
    finish: rows.length
      ? rows
          .map((r) => r.end)
          .sort()
          .pop()!
      : start,
    criticalPath: rows.filter((r) => r.critical).map((r) => r.task.id),
    dependencyDuration: horizon,
    method:
      "UTC working days, explicit weekdays/holidays. Finish-to-start dependencies begin next working day; milestones have zero work and occur at their scheduled date. Each resource handles one task at a time, levelled in stable topological/task-register order. Duration=max(entered days, ceil(effort/resource daily capacity)). Cost=effort×configurable rate. Dependency-only CPM uses those durations and ignores earliest-start release dates, calendars and resource contention; zero slack denotes its critical path, not a promise of delivery.",
  };
}
export const privacyMethod =
  "Educational privacy prioritisation: likelihood of a problematic data action × severity of harm to individuals, each integer 1–5, over the defined assessment period. Low 1–4, Medium 5–9, High 10–16, Critical 17–25. Residual ratings require explicit learner assumptions; control proposals never change them automatically. These ordinal indices are not probabilities, money, GDPR conformity or legal advice.";
export function privacyScores(r: PrivacyRisk) {
  for (const n of [
    r.likelihood,
    r.impact,
    r.residualLikelihood,
    r.residualImpact,
  ])
    if (!Number.isInteger(n) || n < 1 || n > 5)
      throw new Error("Privacy ratings must be integers 1–5.");
  return {
    inherent: r.likelihood * r.impact,
    residual: r.residualLikelihood * r.residualImpact,
  };
}
export function validateTask(t: Task) {
  const e = [];
  if (!t.title.trim()) e.push("Name the task.");
  if (!t.owner.trim() || !t.accountable.trim())
    e.push("Assign responsible and accountable roles.");
  if (!t.sourceIds.some((s) => s.trim()))
    e.push("Link a requirement, gap, privacy finding or business objective.");
  if (
    t.status === "Validated" &&
    (t.validation !== "Passed" || !t.evidence.trim() || !t.reviewer.trim())
  )
    e.push(
      "Validated tasks require a passed test, evidence reference and reviewer.",
    );
  if (t.validation === "Passed" && (!t.evidence.trim() || !t.reviewer.trim()))
    e.push("Passing a test requires evidence and reviewer.");
  if (["Implemented", "Validated"].includes(t.status) && t.progress < 100)
    e.push("Implemented tasks require 100% implementation progress.");
  return e;
}

export function controlDecisionErrors(
  d: Studio["sp"]["decisions"][string],
  context: Studio,
) {
  const errors: string[] = [];
  if (
    !context.scope.informationTypes.trim() ||
    !context.sp.categorisation.trim() ||
    !context.sp.privacyRationale.trim()
  )
    errors.push(
      "Record system scope/information types, categorisation rationale and a separate privacy-applicability rationale.",
    );
  if (!d.owner.trim() || !d.rationale.trim())
    errors.push("Record an owner and applicability/tailoring rationale.");
  if (
    d.status === "Assessed" &&
    (!d.evidence.trim() || !d.objective.trim() || !d.procedure.trim())
  )
    errors.push(
      "An assessed record needs evidence, objective and a documented procedure.",
    );
  if (d.responsibility !== "System-specific" && !d.provider.trim())
    errors.push(
      "Identify the common/inherited provider and responsibility boundary.",
    );
  return errors;
}

export function referenceErrors(studio: Studio): string[] {
  const errors: string[] = [];
  const tasks = new Set(studio.tasks.map((t) => t.id));
  const findingIds = new Set(studio.findings.map((f) => f.id));
  const privacyIds = new Set(studio.privacyRisks.map((r) => r.id));
  const activityIds = new Set(studio.activities.map((a) => a.id));
  for (const f of studio.findings) {
    if (f.taskId && !tasks.has(f.taskId))
      errors.push(`Finding ${f.controlId} refers to a missing task.`);
    else if (
      f.taskId &&
      !studio.tasks
        .find((t) => t.id === f.taskId)!
        .sourceIds.includes(`finding:${f.id}`)
    )
      errors.push(
        `Finding ${f.controlId}: retain its source relationship in the linked task.`,
      );
  }
  for (const r of studio.privacyRisks) {
    if (!activityIds.has(r.activityId))
      errors.push("Privacy finding has no matching processing activity.");
    if (r.taskId && !tasks.has(r.taskId))
      errors.push("Privacy finding refers to a missing action.");
    else if (
      r.taskId &&
      !studio.tasks
        .find((t) => t.id === r.taskId)!
        .sourceIds.includes(`privacy:${r.id}`)
    )
      errors.push(
        "Privacy finding: retain its source relationship in the linked action.",
      );
  }
  for (const t of studio.tasks) {
    for (const source of t.sourceIds) {
      if (source.startsWith("finding:")) {
        if (!findingIds.has(source.slice(8)))
          errors.push(`${t.title}: missing source finding.`);
      } else if (source.startsWith("privacy:")) {
        if (!privacyIds.has(source.slice(8)))
          errors.push(`${t.title}: missing privacy source.`);
      } else if (source.startsWith("control:")) {
        if (source.split(":").length < 3)
          errors.push(`${t.title}: include framework and control ID.`);
      } else if (!source.startsWith("objective:") || !source.slice(10).trim())
        errors.push(
          `${t.title}: use a finding:, privacy:, control: or objective: source.`,
        );
    }
  }
  return errors;
}
