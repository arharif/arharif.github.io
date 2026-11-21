import { useState } from "react";
import { Link } from "react-router-dom";
import { base, Header, download, Field } from "../components/shared";
import { useAcademic } from "../app/context";
import { useWorkspace } from "../workspace/state";
import { modules } from "../data/curriculum";
import { buildReport } from "./report";
import { newId } from "./model";
import { aggregate, maturityMethod, matchingFindings } from "./engines";
import { Kpi, Bars, Donut, RiskMatrix, palette } from "../workspace/charts";
import { Panel, Radar, Empty, Method } from "./visuals";
import { metricInsight, useInsight } from "../workspace/insights";
import { csv } from "../utils/engines";
import ControlAssurance, { ControlDecisionTable } from "./ControlAssurance";
export default function ReportCenter() {
  const w = useWorkspace(),
    { progress } = useAcademic(),
    { explain } = useInsight(),
    [role, setRole] = useState("Practitioner"),
    [report, setReport] = useState<ReturnType<typeof buildReport> | null>(null),
    [stamp, setStamp] = useState(""),
    [filter, setFilter] = useState("All"),
    [message, setMessage] = useState("");
  const fingerprint = () =>
    JSON.stringify({
      studio: { ...w.studio, history: [] },
      rows: w.rows,
      analysed: w.analysed,
      assessments: w.assessments,
      asOf: w.asOf,
      analysedAsOf: w.analysedAsOf,
    });
  const stale = !!report && stamp !== fingerprint();
  const data = report?.findings ?? [],
    a = aggregate(data, report?.rubric.weighting ?? "Equal"),
    active = report?.risks.filter((r) => r.status !== "Closed") ?? [];
  const show = (title: string, meaning: string, method: string) =>
    explain(
      metricInsight(
        title,
        meaning,
        method,
        "Open the source records below; filters affect the view, not the exported full snapshot.",
        "control",
      ),
    );
  const filtered = matchingFindings(data, filter);
  function selectAssessment(label: string) {
    setFilter(label);
    show(
      label,
      `${matchingFindings(data, label).length} matching snapshot record(s). Evidence segments and gaps use only applicable assessed outcomes.`,
      report?.methodology.maturity || maturityMethod,
    );
  }
  function generate() {
    setReport(buildReport(w));
    setStamp(fingerprint());
    setFilter("All");
    setMessage(
      "Immutable report snapshot generated from the current project inputs.",
    );
  }
  return (
    <>
      <Header
        eyebrow="REPORT / EVIDENCE TO EXECUTIVE DECISIONS"
        title="Communicate what the evidence supports."
      >
        <p>
          Generate a traceable snapshot. Scope, methodology, source records and
          limitations travel with every report.
        </p>
      </Header>
      <div className="xa-toolbar">
        <div className="xa-segment">
          {["Learner", "Practitioner", "Executive"].map((r) => (
            <button
              key={r}
              aria-pressed={role === r}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="primary" onClick={generate}>
          Generate immutable report
        </button>
        <Link to={`${base}/labs/ciso-boardroom`}>
          Open the decision boardroom →
        </Link>
      </div>
      {role === "Learner" && (
        <Panel
          title="Your learning position"
          subtitle="Completion records are learner progress, not certification"
        >
          <div className="xa-kpi-grid">
            <Kpi
              label="Published modules completed"
              value={`${progress.completed.filter((id) => modules.some((m) => m.id === id)).length}/${modules.length}`}
              detail="Planned curriculum remains labelled"
              onClick={() =>
                show(
                  "Learning progress",
                  "Explicit module completions stored by the learning workflow.",
                  "Correct knowledge check and completed activity under the module rules.",
                )
              }
            />
            <Kpi
              label="Exercises marked complete"
              value={w.studio.completedSimulations.length}
              detail="Explicit learner completion records"
              onClick={() =>
                show(
                  "Simulation progress",
                  "Exercises explicitly marked complete in this project.",
                  "Recorded completion IDs; opening a tool does not mark it complete.",
                )
              }
            />
          </div>
          <h3>Your next recommended step</h3>
          <p>
            {w.studio.findings.length
              ? "Review evidence gaps and plan a validation task."
              : "Start a scoped CSF assessment and record one evidence-aware outcome."}
          </p>
          <div className="xa-actions">
            <Link className="xa-button primary" to={`${base}/assess`}>
              Continue guided assessment →
            </Link>
            <Link className="xa-button" to={`${base}/learning`}>
              Structured learning paths →
            </Link>
            <Link className="xa-button" to={`${base}/progress`}>
              Learner progress & bookmarks →
            </Link>
          </div>
        </Panel>
      )}
      {stale && (
        <p className="xs-notice">
          The project changed after this report was generated. The displayed
          report and exports retain the earlier snapshot. Regenerate to include
          new input.
        </p>
      )}
      {!report ? (
        <Empty title="A defensible report starts with a declared scope">
          Generate a snapshot from the current project. Empty or unassessed
          records remain visible as unknowns; no compliance or historical values
          are invented.
        </Empty>
      ) : (
        <>
          <div className="xa-data-banner">
            <strong>Snapshot {report.generatedAt}</strong>
            <span>
              {report.caseId} · {report.framework} · {report.edition}
            </span>
            <span>{report.provenance}</span>
          </div>
          <div className="xa-kpi-grid">
            {role === "Executive" ? (
              <>
                <Kpi
                  label="Active residual exposure"
                  value={report.summary.residualIndexSum}
                  detail={`${report.summary.activeRisks} risks · ordinal sum`}
                  onClick={() =>
                    show(
                      "Executive risk exposure",
                      "Sum of entered active residual risk indices.",
                      report.methodology.risk,
                    )
                  }
                />
                <Kpi
                  label="Decisions / eligible gaps"
                  value={report.summary.gaps}
                  detail="Current X1 level below target"
                  tone="amber"
                  onClick={() => selectAssessment("Gaps")}
                />
                <Kpi
                  label="Cost / budget"
                  value={`${report.summary.cost ?? "—"} / ${report.summary.budget}`}
                  detail={`${report.currency} · estimates`}
                  onClick={() =>
                    show(
                      "Estimated budget position",
                      "Cost from task effort and configured resource rates.",
                      report.methodology.schedule,
                    )
                  }
                />
                <Kpi
                  label="Validation complete"
                  value={report.summary.validated}
                  detail={`${report.summary.taskCount} task records`}
                  onClick={() =>
                    show(
                      "Validated actions",
                      "Tasks explicitly marked validated with passed tests.",
                      "Evidence reference, reviewer and a passed validation are required; implementation alone is separate.",
                    )
                  }
                />
              </>
            ) : (
              <>
                <Kpi
                  label="Eligible assessments"
                  value={report.summary.assessed}
                  detail={`${report.summary.unassessed} unassessed; ${report.summary.excluded} excluded`}
                  onClick={() => selectAssessment("All")}
                />
                <Kpi
                  label="Current → target"
                  value={`${report.summary.current?.toFixed(2) ?? "—"} → ${report.summary.target?.toFixed(2) ?? "—"}`}
                  detail="X1 0–4 scale · not CSF Tiers"
                  onClick={() =>
                    show(
                      "Reproduce the maturity mean",
                      maturityMethod,
                      maturityMethod,
                    )
                  }
                />
                <Kpi
                  label="Unresolved evidence"
                  value={
                    data.filter(
                      (f) =>
                        f.applicability === "Applicable" &&
                        f.current !== null &&
                        f.verification !== "Independently tested",
                    ).length
                  }
                  detail="Recorded outcomes requiring further assurance"
                  tone="amber"
                  onClick={() =>
                    show(
                      "Assurance gaps",
                      "A learner rating or reviewed document is not independent operating-effectiveness evidence.",
                      "Count applicable assessed records not labelled independently tested by the learner.",
                    )
                  }
                />
                <Kpi
                  label="Overdue risk reviews"
                  value={report.summary.overdueReviews}
                  detail="Snapshot analysis date"
                  onClick={() =>
                    show(
                      "Overdue risk reviews",
                      "Active dated review records before the analysed snapshot date.",
                      report.methodology.risk,
                    )
                  }
                />
              </>
            )}
          </div>
          <div className="xa-grid two">
            <Panel
              title="Current and target assessment position"
              subtitle="Same eligible population and weighting"
            >
              <Radar
                items={a.groups.map((g) => ({
                  label: g.group,
                  current: g.current,
                  target: g.target,
                  count: g.count,
                }))}
                onSelect={selectAssessment}
              />
              <Method>{report.methodology.maturity}</Method>
            </Panel>
            <Panel
              title="Evidence verification distribution"
              subtitle="Learner-recorded verification states"
            >
              <Donut
                label="assessed records"
                segments={Object.entries(a.evidence).map(
                  ([label, value], i) => ({
                    label,
                    value,
                    color: [
                      palette.Unassessed,
                      palette.Gaps,
                      palette.Neutral,
                      palette.Evidenced,
                    ][i],
                  }),
                )}
                onSelect={selectAssessment}
              />
            </Panel>
            <Panel
              title="Risk landscape"
              subtitle="Active residual ratings in this report snapshot"
            >
              <RiskMatrix
                counts={(l, i) =>
                  active.filter(
                    (r) => r.residualLikelihood === l && r.residualImpact === i,
                  ).length
                }
                onSelect={(l, i) =>
                  show(
                    `Risk ${l} × ${i}`,
                    `${
                      active
                        .filter(
                          (r) =>
                            r.residualLikelihood === l &&
                            r.residualImpact === i,
                        )
                        .map((r) => r.id)
                        .join(", ") || "No matching active records"
                    }.`,
                    report.methodology.risk,
                  )
                }
              />
              <details>
                <summary>Underlying risk records</summary>
                <ul>
                  {active.map((r) => (
                    <li key={r.id}>
                      {r.id} · {r.asset} · {r.residualLikelihood}×
                      {r.residualImpact} · {r.owner || "Unassigned"}
                    </li>
                  ))}
                </ul>
              </details>
            </Panel>
            <Panel
              title="Owner workload and assurance"
              subtitle="Entered task work hours, not actual timesheets"
            >
              <Bars
                items={[
                  ...new Set(report.plan.map((t) => t.owner || "Unassigned")),
                ].map((label) => ({
                  label,
                  value: report.plan
                    .filter((t) => (t.owner || "Unassigned") === label)
                    .reduce((n, t) => n + t.effort, 0),
                }))}
                onSelect={(owner) =>
                  show(
                    owner,
                    report.plan
                      .filter((t) => (t.owner || "Unassigned") === owner)
                      .map((t) => t.title)
                      .join("; "),
                    "Sum estimated effort hours assigned to this owner in the report snapshot.",
                  )
                }
              />
              <p>
                {report.summary.implementationComplete} task(s) have 100%
                implementation progress; {report.summary.validated} have
                recorded validation.{" "}
                {report.summary.finish
                  ? `Scheduled finish ${report.summary.finish}.`
                  : "No valid finish can be asserted."}
              </p>
              {report.scheduleError && (
                <p role="alert">Schedule blocked: {report.scheduleError}</p>
              )}
            </Panel>
          </div>
          <Panel
            title="Assessment source records"
            subtitle="Display filters do not narrow the full report export"
          >
            <Field label="Report display filter">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {[
                  ...new Set([
                    "All",
                    "Gaps",
                    ...data.map((f) => f.group),
                    ...Object.keys(a.evidence),
                  ]),
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <div className="xa-table-scroll">
              <table>
                <caption>
                  Underlying inputs for the snapshot’s X1 maturity calculations
                </caption>
                <thead>
                  <tr>
                    <th>Outcome / scope</th>
                    <th>Current / target / weight</th>
                    <th>Evidence / reviewer</th>
                    <th>Owner / priority</th>
                    <th>Trace</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id}>
                      <td>
                        {f.framework} · {f.controlId}
                        <p>{f.title}</p>
                        <small>{f.applicability}</small>
                      </td>
                      <td>
                        {f.current ?? "Unassessed"} / {f.target} / {f.weight}
                      </td>
                      <td>
                        {f.verification}
                        <p>
                          {f.evidence || "No reference"} ·{" "}
                          {f.reviewer || "No reviewer"}
                        </p>
                      </td>
                      <td>
                        {f.owner || "Unassigned"} · {f.priority}
                      </td>
                      <td>
                        {f.riskId || "No linked risk"}
                        <p>{f.taskId || "No linked action"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          {!!Object.keys(report.sp.decisions).length && (
            <ControlAssurance sp={report.sp} />
          )}
          <Panel
            title="Executive report and improvement roadmap"
            subtitle="Complete snapshot · methodology and provenance included"
          >
            <p>{report.scope.mission || "Mission not recorded"}</p>
            <p>
              Scope: {report.scope.boundary || "Not defined"}. Period{" "}
              {report.scope.periodStart} to {report.scope.periodEnd}.
            </p>
            <p>
              {report.summary.gaps} eligible assessment gap(s),{" "}
              {report.summary.privacyRisks} privacy finding(s),{" "}
              {report.summary.taskCount} implementation task(s), and{" "}
              {report.summary.validated} validated action(s). Budget figures are
              declared planning estimates.
            </p>
            <h3>Decisions and follow-up</h3>
            <ul>
              <li>
                Assign owners for unresolved findings and missing evidence.
              </li>
              <li>
                Review over-tolerance risk and privacy assumptions with
                accountable decision-makers.
              </li>
              <li>
                Resolve dependency/resource delays and approve scope, dates and
                budget assumptions.
              </li>
              <li>
                Validate implementation, then reassess risk and outcome ratings
                separately.
              </li>
            </ul>
            <div className="xa-actions">
              <button
                onClick={() =>
                  download(
                    "x1-executive-assessment-report-v2.json",
                    JSON.stringify(report, null, 2),
                    "application/json",
                  )
                }
              >
                Export complete report JSON
              </button>
              <button
                onClick={() =>
                  download(
                    "x1-assessment-source-records.csv",
                    csv(
                      report.findings.map((f) => ({
                        ...f,
                        projectId: report.projectId,
                        generatedAt: report.generatedAt,
                        methodology: report.methodology.maturity,
                      })),
                    ),
                    "text/csv",
                  )
                }
              >
                Export complete assessment CSV
              </button>
              <button
                onClick={() =>
                  download(
                    "x1-programme-roadmap.csv",
                    csv(report.plan),
                    "text/csv",
                  )
                }
              >
                Export roadmap & RACI CSV
              </button>
              <button onClick={() => window.print()}>
                Print programme report
              </button>
              <button
                disabled={!!report.scheduleError}
                onClick={() => {
                  w.setStudio((p) => ({
                    ...p,
                    history: [
                      ...p.history.slice(-99),
                      {
                        id: newId("checkpoint"),
                        createdAt: report.generatedAt,
                        label: `${report.summary.assessed} assessed / ${report.summary.gaps} gaps`,
                        summary: {
                          assessed: report.summary.assessed,
                          current: report.summary.current,
                          target: report.summary.target,
                          tasks: report.summary.taskCount,
                          cost: report.summary.cost ?? 0,
                        },
                      },
                    ],
                  }));
                  setMessage(
                    "Reporting checkpoint saved in this project. It is a summary of this snapshot; export JSON to retain all source records.",
                  );
                }}
              >
                Save reporting checkpoint
              </button>
            </div>
            <p className="xs-notice">{report.limitations}</p>
          </Panel>
          <article className="xs-print-report">
            <h1>X1 Academic programme assessment report</h1>
            <p>
              Generated {report.generatedAt} · {report.projectId} ·{" "}
              {report.edition}
            </p>
            <p>{report.scope.mission}</p>
            <p>{report.scope.boundary}</p>
            <h2>Position and decisions</h2>
            <p>
              Assessed {report.summary.assessed}; gaps {report.summary.gaps};
              current/target {report.summary.current ?? "Unassessed"} /{" "}
              {report.summary.target ?? "Unassessed"}; tasks{" "}
              {report.summary.taskCount}; validation records{" "}
              {report.summary.validated}.
            </p>
            <h2>Assessment source records</h2>
            <table>
              <thead>
                <tr>
                  <th>Outcome / finding</th>
                  <th>Current / target</th>
                  <th>Evidence / owner</th>
                </tr>
              </thead>
              <tbody>
                {report.findings.map((f) => (
                  <tr key={f.id}>
                    <td>
                      {f.framework} · {f.controlId}
                      <p>{f.rationale}</p>
                    </td>
                    <td>
                      {f.current ?? "Unassessed"} / {f.target}
                    </td>
                    <td>
                      {f.evidence || "Missing"} · {f.verification} · {f.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2>Implementation roadmap / RACI</h2>
            <table>
              <thead>
                <tr>
                  <th>Task / source</th>
                  <th>Dates / estimate</th>
                  <th>R / A / evidence</th>
                </tr>
              </thead>
              <tbody>
                {report.plan.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {t.title}
                      <p>{t.sources.join(", ")}</p>
                    </td>
                    <td>
                      {t.start} → {t.end}
                      <p>{t.cost}</p>
                    </td>
                    <td>
                      {t.owner} / {t.accountable}
                      <p>
                        {t.validation} · {t.evidence}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2>NIST system control assertions</h2>
            <p>
              {report.sp.edition} · security baseline {report.sp.baseline}.
              Learner-recorded decisions; assessed does not imply a successful
              test.
            </p>
            <p>
              System/information scope:{" "}
              {report.scope.informationTypes || "Not declared"}. Confidentiality{" "}
              {report.sp.confidentiality}; integrity {report.sp.integrity};
              availability {report.sp.availability}.{" "}
              {report.sp.categorisation ||
                "No categorisation rationale recorded."}{" "}
              Privacy review: {report.sp.privacyRationale || "Not reviewed."}
            </p>
            <ControlDecisionTable decisions={report.sp.decisions} />
            <h2>Privacy findings</h2>
            {report.privacy.map((r) => (
              <p key={r.id}>
                {r.edition} · {r.harm} · inherent {r.inherent}; residual{" "}
                {r.residual} · {r.assumptions}
              </p>
            ))}
            <h2>Methods and limitations</h2>
            {Object.values(report.methodology).map((m) => (
              <p key={m}>{m}</p>
            ))}
            <p>{report.limitations}</p>
          </article>
        </>
      )}
      <details className="xs-method">
        <summary>Reporting checkpoints in the active project</summary>
        {w.studio.history.length ? (
          <ol>
            {w.studio.history.map((h) => (
              <li key={h.id}>
                <button
                  className="xa-text-button"
                  onClick={() =>
                    show(
                      h.label,
                      `Recorded ${h.createdAt}; current ${h.summary.current ?? "unassessed"}, target ${h.summary.target ?? "unassessed"}, ${h.summary.tasks} tasks.`,
                      "A saved learner reporting checkpoint, not an invented historical KPI.",
                    )
                  }
                >
                  {h.createdAt} · {h.label}
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p>
            No checkpoints recorded. Historical trend lines would not be
            supported.
          </p>
        )}
      </details>
      <p role="status">{message}</p>
    </>
  );
}
