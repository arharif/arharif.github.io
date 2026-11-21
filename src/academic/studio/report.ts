import type { WorkspaceData } from "./persistence.ts";
import {
  aggregate,
  schedule,
  maturityMethod,
  privacyScores,
  privacyMethod,
} from "./engines.ts";
import { analyseRisks, riskMethod } from "../workspace/risk.ts";
export function buildReport(data: WorkspaceData, now = new Date()) {
  const snapshot = JSON.parse(JSON.stringify(data)) as WorkspaceData;
  const studio = snapshot.studio;
  const maturity = aggregate(studio.findings, studio.rubric.weighting);
  let plan;
  let scheduleError = "";
  try {
    plan = schedule(
      studio.tasks,
      studio.resources,
      studio.scope.start,
      studio.calendar,
    );
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
    framework: studio.framework,
    edition: studio.edition,
    scope: studio.scope,
    resources: studio.resources,
    calendar: studio.calendar,
    taskInputs: studio.tasks,
    rubric: studio.rubric,
    currency: studio.currency,
    riskAnalysisDate: snapshot.analysed ? snapshot.analysedAsOf : snapshot.asOf,
    provenance: snapshot.provenance,
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
      taskCount: studio.tasks.length,
      implementationComplete: studio.tasks.filter((t) => t.progress === 100)
        .length,
      validated: studio.tasks.filter(
        (t) => t.status === "Validated" && t.validation === "Passed",
      ).length,
      cost: plan?.cost ?? null,
      budget: studio.budget,
      finish: plan?.finish ?? null,
      privacyRisks: studio.privacyRisks.length,
    },
    findings: studio.findings,
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
    baseline: studio.baseline,
    history: studio.history,
    limitations:
      "Educational, learner-supplied assertions. No certification, independent assurance, legal conformity or measured business-cost claim. Proposed actions never change assessed risk/maturity automatically.",
  };
}
