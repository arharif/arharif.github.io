import type { WorkspaceData } from "./persistence.ts";
import {
  aggregate,
  schedule,
  maturityMethod,
  privacyScores,
  privacyMethod,
} from "./engines.ts";
import { tasksForStandard } from "./planning.ts";
import { analyseRisks, riskMethod } from "../workspace/risk.ts";
export function buildReport(
  data: WorkspaceData,
  now = new Date(),
  selection?: { id: string; edition: string },
  demoId?: string | null,
) {
  const snapshot = JSON.parse(JSON.stringify(data)) as WorkspaceData;
  const studio = snapshot.studio;
  const findings = selection
    ? studio.findings.filter((finding) => finding.framework === selection.id)
    : studio.findings;
  const tasks = selection
    ? tasksForStandard(studio, selection.id)
    : studio.tasks;
  const taskIds = new Set(tasks.map((task) => task.id));
  const maturity = aggregate(findings, studio.rubric.weighting);
  let plan;
  let scheduleError = "";
  try {
    plan = schedule(
      studio.tasks,
      studio.resources,
      studio.scope.start,
      studio.calendar,
    );
    if (selection) {
      const rows = plan.rows.filter((row) => taskIds.has(row.task.id));
      plan = {
        ...plan,
        rows,
        cost: rows.reduce((cost, row) => cost + row.cost, 0),
        finish:
          rows
            .map((row) => row.end)
            .sort()
            .pop() ?? studio.scope.start,
      };
    }
  } catch (e) {
    scheduleError = e instanceof Error ? e.message : "Schedule invalid.";
  }
  const risks = analyseRisks(
    snapshot.analysed ?? snapshot.rows,
    snapshot.analysed ? snapshot.analysedAsOf : snapshot.asOf,
  );
  return {
    schemaVersion: 2,
    kind: "x1-educational-programme-report",
    generatedAt: now.toISOString(),
    caseId: studio.caseId,
    projectId: studio.id,
    framework: selection?.id ?? studio.framework,
    edition: selection?.edition ?? studio.edition,
    scope: studio.scope,
    resources: studio.resources,
    calendar: studio.calendar,
    taskInputs: tasks,
    rubric: studio.rubric,
    currency: studio.currency,
    riskAnalysisDate: snapshot.analysed ? snapshot.analysedAsOf : snapshot.asOf,
    provenance: demoId ? "Fictional completed demo" : snapshot.provenance,
    ...(demoId ? { demoId } : {}),
    methodology: {
      maturity: maturityMethod,
      risk: riskMethod,
      privacy: privacyMethod,
      schedule: plan?.method || "Invalid schedule; no dates or costs asserted.",
    },
    summary: {
      assessed: maturity.assessed,
      unassessed: maturity.unassessed,
      excluded: maturity.excluded,
      current: maturity.current,
      target: maturity.target,
      gaps: maturity.gaps.length,
      activeRisks: risks.total,
      residualIndexSum: risks.residual,
      overdueReviews: risks.overdue.length,
      taskCount: tasks.length,
      implementationComplete: tasks.filter((t) => t.progress === 100).length,
      validated: tasks.filter(
        (t) => t.status === "Validated" && t.validation === "Passed",
      ).length,
      cost: plan?.cost ?? null,
      budget: studio.budget,
      finish: plan?.finish ?? null,
      privacyRisks: studio.privacyRisks.length,
    },
    findings,
    assessments: snapshot.assessments,
    risks: snapshot.analysed ?? snapshot.rows,
    privacy: studio.privacyRisks.map((r) => ({ ...r, ...privacyScores(r) })),
    activities: studio.activities,
    plan:
      plan?.rows.map((r) => ({
        id: r.task.id,
        title: r.task.title,
        sources: r.task.sourceIds,
        stage: r.task.stage,
        owner: r.task.owner,
        accountable: r.task.accountable,
        consulted: r.task.consulted,
        informed: r.task.informed,
        start: r.start,
        end: r.end,
        cost: r.cost,
        effort: r.task.effort,
        progress: r.task.progress,
        status: r.task.status,
        validation: r.task.validation,
        evidence: r.task.evidence,
        reviewer: r.task.reviewer,
        dependencies: r.task.dependencies,
        criticalDependencyPath: r.critical,
        resourceDelayDays: r.resourceDelay,
        deadline: r.task.deadline,
        late: r.late,
      })) ?? [],
    scheduleError,
    tiers: studio.tiers,
    sp: studio.sp,
    raid: studio.raid,
    baseline: studio.baseline.filter((row) => taskIds.has(row.id)),
    history: studio.history,
    limitations:
      "Educational, learner-supplied assertions. No certification, independent assurance, legal conformity or measured business-cost claim. Proposed actions never change assessed risk/maturity automatically.",
  };
}
