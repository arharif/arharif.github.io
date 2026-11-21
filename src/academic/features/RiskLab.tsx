import RiskEditor from "../components/editors/RiskEditor";
import { useMemo, useState } from "react";
import {
  Plus,
  Upload,
  Download,
  Play,
  Copy,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { useScenario } from "../app/context";
import { base, download, Field, Header } from "../components/shared";
import { Link } from "react-router-dom";
import { csv } from "../utils/engines";
import {
  analyseRisks,
  autoMapping,
  band,
  blankRisk,
  inherentScore,
  residualScore,
  riskFields,
  riskFieldLabels,
  riskMethod,
  riskStatuses,
  scenarioRisks,
  validateRisk,
  validateRiskRows,
  validDate,
  type RiskRecord,
} from "../workspace/risk";
import { readSpreadsheet, exportWorkbook } from "../workspace/spreadsheets";
import { useWorkspace } from "../workspace/state";
import { Bars, Panel } from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
import RiskDecision from "./RiskDecision";
import RiskHistory from "../workspace/RiskHistory";
import RiskDashboard from "./RiskDashboard";
export default function RiskLab() {
  const scenario = useScenario();
  const workspace = useWorkspace();
  const {
    rows,
    setRows,
    analysed,
    setAnalysed,
    provenance,
    setProvenance,
    asOf,
    setAsOf,
    observations,
    setObservations,
  } = useWorkspace();
  const { explain } = useInsight();
  const [tab, setTab] = useState("Register");
  const {
    riskDraft: draft,
    setRiskDraft: setDraft,
    riskEditing: editing,
    setRiskEditing: setEditing,
    analysedAsOf,
  } = useWorkspace();
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [importData, setImportData] = useState<{
      headers: string[];
      rows: Record<string, unknown>[];
    } | null>(null),
    [mapping, setMapping] = useState<Record<string, string>>({}),
    [mode, setMode] = useState("Replace");
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<{ label: string; ids: string[] } | null>(
      null,
    );
  const data = analysed ?? [];
  const reportDate = analysed ? analysedAsOf : asOf;
  const stats = useMemo(
    () => analyseRisks(data, analysedAsOf),
    [data, analysedAsOf],
  );
  const validation = importData
    ? validateRiskRows(importData.rows, mapping, mode === "Append" ? rows : [])
    : null;
  const dirty =
    analysed !== null &&
    (JSON.stringify(analysed) !== JSON.stringify(rows) ||
      analysedAsOf !== asOf);
  const visible = (analysed && !dirty ? analysed : rows).filter(
    (r) =>
      (!filter || filter.ids.includes(r.id)) &&
      `${r.id} ${r.asset} ${r.threat} ${r.owner} ${r.unit} ${r.status}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const select = (label: string, selected: RiskRecord[], method: string) => {
    setFilter({ label, ids: selected.map((r) => r.id) });
    explain(
      metricInsight(
        label,
        `${selected.length} underlying risk record(s) in the analysed snapshot.`,
        method,
        selected.length
          ? "Review the records below. Scores are ordinal judgements; check evidence before deciding."
          : "There are no matching records in this snapshot.",
      ),
    );
  };
  const change = (next: RiskRecord[]) => {
    const linked = workspace.studio.findings.filter(
      (f) => f.riskId && !next.some((r) => r.id === f.riskId),
    );
    if (linked.length) {
      setError(
        `This change would remove linked risk records (${linked.map((f) => f.riskId).join(", ")}). Unlink them in Assess before replacing or deleting them.`,
      );
      return false;
    }
    setRows(next);
    setFilter(null);
    setMessage(
      "Register updated. Select Analyse risks to refresh the dashboard.",
    );
    return true;
  };
  async function workbook(template = false) {
    try {
      setBusy(true);
      await exportWorkbook(
        template ? "x1-risk-input-template.xlsx" : "x1-risk-assessment.xlsx",
        template
          ? [
              {
                ...blankRisk(),
                id: "EXAMPLE-001",
                asset: "Replace this fictional asset",
                threat: "Replace this fictional threat",
                status: "Open",
              },
            ]
          : data.map((r) => ({
              ...r,
              inherentIndex: inherentScore(r),
              residualIndex: residualScore(r),
              category: band(residualScore(r)),
              provenance,
              asOf: reportDate,
            })),
        riskMethod,
      );
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Workbook export failed.");
    } finally {
      setBusy(false);
    }
  }
  const exports = data.map((r) => ({
    ...r,
    inherentIndex: inherentScore(r),
    residualIndex: residualScore(r),
    category: band(residualScore(r)),
    provenance,
    asOf: reportDate,
  }));
  return (
    <div className="xa-risk-workspace">
      <Header
        eyebrow="GRC WORKSPACE / RISK INTELLIGENCE"
        title="Risk Register & Simulator"
      >
        <p>
          Turn exposures into evidence-backed decisions. Import, assess, explore
          and defend your treatment plan.
        </p>
      </Header>
      <div className="xa-segment xa-tabs">
        {["Register", "Decision simulator"].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === "Register" ? <SlidersHorizontal size={15} /> : null}
            {t}
          </button>
        ))}
      </div>
      {tab === "Decision simulator" ? (
        <RiskDecision />
      ) : (
        <>
          {analysed && (
            <>
              <RiskDashboard
                stats={stats}
                observations={observations}
                asOf={reportDate}
                onSelect={select}
              />
              <div className="xa-actions">
                <Link to={`${base}/labs/ciso-boardroom`}>
                  Bring this snapshot to the boardroom →
                </Link>
              </div>
            </>
          )}
          <div className="xa-data-banner">
            <span className="xa-live-dot" />
            <strong>{provenance}</strong>
            <span>
              {rows.length} draft records · local processing · export before
              refreshing
            </span>
            <button
              onClick={() => {
                if (!change(scenarioRisks(scenario.id))) return;
                setProvenance("Fictional educational scenario");
                setAnalysed(null);
                setObservations([]);
              }}
            >
              Reload scenario
            </button>
          </div>
          <details className="xa-guide">
            <summary>Walkthrough · from register to committee decision</summary>
            <ol>
              <li>
                Load a fictional organisation above, add a record or import the
                template.
              </li>
              <li>Map your columns and resolve every validation error.</li>
              <li>
                Select Analyse risks. Click a category, matrix cell or owner to
                inspect records.
              </li>
              <li>
                Open the Decision simulator to test residual ratings, document
                evidence and defend a recommendation.
              </li>
              <li>
                Export the analysed snapshot and treatment plan. Save work
                before leaving the browser.
              </li>
            </ol>
            <p>{riskMethod}</p>
            <p>
              Knowledge check: does a smaller residual score prove a control
              worked? No. It is a judgement until operating evidence supports
              it.
            </p>
            <Link to={`${base}/learning/risk-assessment`}>
              Study the complete risk assessment lesson →
            </Link>
          </details>
          <section className="xa-panel xa-input-panel">
            <div className="xa-panel-heading">
              <div>
                <h2>Risk input workspace</h2>
                <p>
                  CSV and Excel stay in this browser. Imports are atomic:
                  resolve all errors before applying.
                </p>
              </div>
              <button
                className="primary"
                disabled={rows.length >= 2000}
                onClick={() => {
                  setEditing(null);
                  setDraft({
                    ...blankRisk(),
                    id: `R-${Date.now().toString().slice(-6)}`,
                  });
                }}
              >
                <Plus size={15} /> Add risk
              </button>
            </div>
            <p className="xa-muted">
              Use fictional data only. Do not import confidential banking,
              personal or industrial information into this public teaching
              application. Files are processed locally.
            </p>
            <div className="xa-toolbar">
              <Field label="Import risk spreadsheet">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  disabled={busy}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      setBusy(true);
                      const d = await readSpreadsheet(f);
                      setImportData(d);
                      setMapping(autoMapping(d.headers));
                      setError("");
                    } catch (reason) {
                      setError(
                        reason instanceof Error
                          ? reason.message
                          : "Import failed",
                      );
                    } finally {
                      setBusy(false);
                      e.target.value = "";
                    }
                  }}
                />
              </Field>
              <button disabled={busy} onClick={() => workbook(true)}>
                <Download size={15} /> Excel input template
              </button>
              <Field label="Analysis date">
                <input
                  type="date"
                  value={asOf}
                  onChange={(e) => {
                    if (validDate(e.target.value)) setAsOf(e.target.value);
                  }}
                />
              </Field>
              <button
                className="primary"
                disabled={busy || !rows.length}
                onClick={() => {
                  setAnalysed(rows.map((r) => ({ ...r })));
                  requestAnimationFrame(() =>
                    document
                      .getElementById("xa-risk-dashboard")
                      ?.scrollIntoView({ block: "start" }),
                  );
                  setFilter(null);
                  setMessage(`Analysed ${rows.length} risk records.`);
                  explain(
                    metricInsight(
                      "Risk analysis",
                      `${rows.length} records have been analysed.`,
                      riskMethod,
                      "This snapshot updates only when you select Analyse risks. Review dates drive overdue counts against the selected analysis date.",
                    ),
                  );
                }}
              >
                <Play size={15} /> Analyse risks
              </button>
            </div>
            {importData && (
              <div className="xa-import-map">
                <h3>Map spreadsheet columns · {importData.rows.length} rows</h3>
                <p>
                  Required: ID, asset, threat, likelihood and impact. Optional
                  fields may be unmapped. Residual ratings default to inherent.
                </p>
                <div className="xa-grid">
                  {riskFields.map((f) => (
                    <Field key={f} label={`Map ${riskFieldLabels[f]}`}>
                      <select
                        value={mapping[f] || ""}
                        onChange={(e) =>
                          setMapping({ ...mapping, [f]: e.target.value })
                        }
                      >
                        <option value="">Unmapped</option>
                        {importData.headers.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                    </Field>
                  ))}
                </div>
                <Field label="Import mode">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option>Replace</option>
                    <option>Append</option>
                  </select>
                </Field>
                {!!validation?.errors.length && (
                  <div role="alert">
                    <h3>Validation errors · {validation.errors.length}</h3>
                    <ul className="xa-error-list">
                      {validation.errors.map((e, i) => (
                        <li key={i}>
                          Row {e.row}: {e.message}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() =>
                        download(
                          "x1-import-errors.csv",
                          csv(validation.errors),
                          "text/csv",
                        )
                      }
                    >
                      Download error report
                    </button>
                  </div>
                )}
                <div className="xa-actions">
                  <button
                    className="primary"
                    disabled={!validation || !!validation.errors.length}
                    onClick={() => {
                      if (!validation || validation.errors.length) return;
                      if (
                        !change(
                          mode === "Append"
                            ? [...rows, ...validation.records]
                            : validation.records,
                        )
                      )
                        return;
                      setProvenance(
                        mode === "Append"
                          ? "Mixed scenario / learner-supplied records"
                          : "Learner-supplied spreadsheet",
                      );
                      setAnalysed(null);
                      setObservations([]);
                      setImportData(null);
                      setMessage(
                        `Imported ${validation.records.length} validated records. Select Analyse risks.`,
                      );
                    }}
                  >
                    <Upload size={15} /> Apply validated import
                  </button>
                  <button onClick={() => setImportData(null)}>
                    Cancel import
                  </button>
                </div>
              </div>
            )}
          </section>
          {draft && <RiskEditor onCommit={change} />}
          {error && <p role="alert">{error}</p>}
          <p role="status">{busy ? "Processing workbook locally…" : message}</p>
          {dirty && (
            <p className="xa-feedback">
              Draft changes are pending. The analytics and exports show the last
              analysed snapshot. Select Analyse risks to update them.
            </p>
          )}
          {analysed ? (
            <details className="xa-guide">
              <summary>Ownership, controls and treatment</summary>
              <div className="xa-grid two">
                <Panel
                  title="Accountable owners"
                  subtitle="Active risk count per owner"
                >
                  <Bars
                    items={stats.owners}
                    onSelect={(o) =>
                      select(
                        o,
                        stats.active.filter(
                          (r) => (r.owner || "Unassigned") === o,
                        ),
                        "Count active records grouped by owner; missing owners appear as Unassigned.",
                      )
                    }
                  />
                </Panel>
                <Panel
                  title="Control & treatment coverage"
                  subtitle="Presence and workflow status, not effectiveness"
                >
                  <Bars
                    items={[
                      { label: "Controls recorded", value: stats.withControls },
                      {
                        label: "Evidence referenced",
                        value: stats.withEvidence,
                      },
                      { label: "Closed", value: stats.treated },
                      {
                        label: "In progress",
                        value: data.filter((r) => r.status === "In progress")
                          .length,
                      },
                    ]}
                    onSelect={(label) =>
                      select(
                        label,
                        data.filter((r) =>
                          label === "Closed"
                            ? r.status === "Closed"
                            : label === "In progress"
                              ? r.status === "In progress"
                              : r.status !== "Closed" &&
                                (label === "Controls recorded"
                                  ? !!r.controls
                                  : !!r.evidence),
                        ),
                        "Counts come from entered control descriptions, evidence references or workflow status. Closed is not equivalent to remediated without validation.",
                      )
                    }
                  />
                </Panel>
                <Panel
                  title="Business units"
                  subtitle="Active record ownership"
                >
                  <Bars
                    items={stats.units}
                    onSelect={(u) =>
                      select(
                        u,
                        stats.active.filter(
                          (r) => (r.unit || "Unassigned") === u,
                        ),
                        "Count active risks by business unit.",
                      )
                    }
                  />
                </Panel>
                <Panel
                  title="Executive brief"
                  subtitle={`${scenario.name} · ${reportDate}`}
                >
                  <p>
                    <strong>{stats.total}</strong> active risks carry a residual
                    index sum of <strong>{stats.residual}</strong>.{" "}
                    <strong>{stats.overdue.length}</strong> reviews are overdue;{" "}
                    <strong>
                      {stats.active.filter((r) => !r.owner).length}
                    </strong>{" "}
                    risks lack an owner.
                  </p>
                  <p className="xa-muted">
                    {observations.length
                      ? `${observations.length} learner-entered historical observations are available below; these do not overwrite the current register.`
                      : "No dated score observations were submitted. Historical risk trends cannot be calculated from this snapshot."}
                  </p>
                </Panel>
              </div>
            </details>
          ) : (
            <div className="xa-empty">
              <Play size={25} />
              <h2>Your risk intelligence starts here</h2>
              <p>
                {rows.length} records are ready. Select Analyse risks to build
                your dashboard.
              </p>
            </div>
          )}
          <Panel
            className="xa-risk-records"
            title={
              filter ? `Underlying records · ${filter.label}` : "Risk register"
            }
            subtitle={`${visible.length} records · sorted by residual priority`}
            action={
              filter ? (
                <button onClick={() => setFilter(null)}>
                  Clear chart filter
                </button>
              ) : undefined
            }
          >
            <Field label="Search risk register">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ID, asset, owner, threat or status"
              />
            </Field>
            <div className="xa-table-scroll">
              <table>
                <caption>
                  {dirty ? "Draft register" : "Risk records"} · {provenance}
                </caption>
                <thead>
                  <tr>
                    <th>Risk / asset</th>
                    <th>Threat</th>
                    <th>Inherent</th>
                    <th>Residual</th>
                    <th>Owner / review</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...visible]
                    .sort((a, b) => residualScore(b) - residualScore(a))
                    .map((r) => (
                      <tr key={r.id}>
                        <td>
                          <button
                            className="xa-text-button"
                            onClick={() =>
                              explain({
                                ...metricInsight(
                                  `${r.id} · ${r.asset}`,
                                  `${r.threat}. Vulnerability: ${r.vulnerability || "Not recorded"}. Business impact: ${r.businessImpact || "Not recorded"}.`,
                                  `${riskMethod} Inherent: ${r.likelihood}×${r.impact}; residual: ${r.residualLikelihood}×${r.residualImpact}.`,
                                  r.evidence
                                    ? `Evidence reference: ${r.evidence}. It has not been verified.`
                                    : "No evidence reference recorded. Validate the assumptions before accepting this rating.",
                                ),
                                technical:
                                  r.controls ||
                                  "No existing controls recorded.",
                                business:
                                  r.businessImpact ||
                                  "Define the business consequence.",
                                actions: [
                                  r.treatment || "Define treatment.",
                                  `Owner: ${r.owner || "Unassigned"}; review: ${r.reviewDate || "Missing"}`,
                                  "Compare treatment assumptions in the Decision simulator.",
                                ],
                              })
                            }
                          >
                            {r.id}
                            <br />
                            <strong>{r.asset}</strong>
                          </button>
                        </td>
                        <td>{r.threat}</td>
                        <td>{inherentScore(r)}</td>
                        <td>
                          <span
                            className={`xa-risk-badge ${band(residualScore(r)).toLowerCase()}`}
                          >
                            {residualScore(r)} · {band(residualScore(r))}
                          </span>
                        </td>
                        <td>
                          {r.owner || "Unassigned"}
                          <br />
                          <small>{r.reviewDate || "No review date"}</small>
                        </td>
                        <td>{r.status}</td>
                        <td>
                          <div className="xa-row-actions">
                            <button
                              aria-label={`Edit ${r.id}`}
                              onClick={() => {
                                setEditing(r.id);
                                setDraft({ ...r });
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              aria-label={`Duplicate ${r.id}`}
                              onClick={() => {
                                setEditing(null);
                                setDraft({ ...r, id: `${r.id}-copy` });
                              }}
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              aria-label={`Delete ${r.id}`}
                              onClick={() => {
                                change(rows.filter((item) => item.id !== r.id));
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!visible.length && (
                <p>No records match. Clear filters or add a risk.</p>
              )}
            </div>
          </Panel>
          {analysed && (
            <RiskHistory
              risks={data}
              observations={observations}
              onChange={setObservations}
            />
          )}
          {analysed && (
            <article
              className="xa-risk-print"
              aria-label="Printable analysed risk report"
            >
              <h1>X1 Academic · Executive risk assessment</h1>
              <p>
                {provenance} · analysis date {reportDate} · scenario context{" "}
                {scenario.name}
              </p>
              <p>
                {stats.total} active risks · residual ordinal sum{" "}
                {stats.residual} · {stats.overdue.length} overdue reviews ·{" "}
                {stats.withEvidence} evidence references (unverified).
              </p>
              <h2>Decision context</h2>
              <p>{riskMethod}</p>
              <p>
                This report contains the analysed snapshot. Draft edits and
                display filters do not change the report. The learner is
                responsible for scope, assumptions and authorised decisions.
              </p>
              <h2>Prioritised risk register & treatment plan</h2>
              <table>
                <thead>
                  <tr>
                    <th>Risk / asset / threat</th>
                    <th>Ratings</th>
                    <th>Treatment / owner / status</th>
                    <th>Review / evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data]
                    .sort((a, b) => residualScore(b) - residualScore(a))
                    .map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>
                            {r.id} · {r.asset}
                          </strong>
                          <p>{r.threat}</p>
                          <p>{r.businessImpact}</p>
                        </td>
                        <td>
                          Inherent {r.likelihood}×{r.impact}={inherentScore(r)}
                          <br />
                          Residual {r.residualLikelihood}×{r.residualImpact}=
                          {residualScore(r)}
                          <br />
                          {band(residualScore(r))}
                        </td>
                        <td>
                          {r.treatment || "No treatment recorded"}
                          <p>
                            {r.owner || "Unassigned"} ·{" "}
                            {r.unit || "Unassigned unit"} · {r.status}
                          </p>
                        </td>
                        <td>
                          {r.reviewDate || "No review date"}
                          <p>{r.evidence || "No evidence reference"}</p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!!observations.length && (
                <>
                  <h2>Dated observations</h2>
                  {observations.map((o) => (
                    <p key={o.riskId + o.date}>
                      {o.riskId} · {o.date} · residual {o.likelihood * o.impact}{" "}
                      · {o.note}
                    </p>
                  ))}
                </>
              )}
              <p>
                Generated {new Date().toISOString()} · Educational assessment;
                no certification, verified evidence or financial forecast is
                implied.
              </p>
            </article>
          )}
          <section className="xa-panel xa-export">
            <h2>Assessment & treatment reports</h2>
            <p>
              Exports contain the complete analysed snapshot, source label,
              date, methodology and entered treatment actions.{" "}
              {dirty ? "Draft edits are excluded." : ""}
            </p>
            <div className="xa-actions">
              <button disabled={!analysed || busy} onClick={() => workbook()}>
                <Download size={15} /> Export Excel
              </button>
              <button
                disabled={!analysed}
                onClick={() =>
                  download(
                    "x1-risk-register.csv",
                    csv(exports),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                Export risk CSV
              </button>
              <button
                disabled={!analysed}
                onClick={() =>
                  download(
                    "x1-treatment-plan.csv",
                    csv(
                      exports.map((r) => ({
                        id: r.id,
                        asset: r.asset,
                        treatment: r.treatment,
                        owner: r.owner,
                        status: r.status,
                        reviewDate: r.reviewDate,
                        evidence: r.evidence,
                        provenance,
                        asOf: reportDate,
                      })),
                    ),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                Export treatment plan
              </button>
              <button
                disabled={!analysed}
                onClick={() =>
                  download(
                    "x1-risk-report.json",
                    JSON.stringify(
                      {
                        methodology: riskMethod,
                        provenance,
                        asOf: reportDate,
                        records: exports,
                        datedObservations: observations,
                      },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                Export risk JSON
              </button>
              <button disabled={!analysed} onClick={() => window.print()}>
                Print executive report
              </button>
            </div>
            <details className="xa-print-report">
              <summary>Methodology & provenance</summary>
              <p>{riskMethod}</p>
              <p>
                {provenance} · analysis date {reportDate} · {data.length}{" "}
                records. Save the fictional project explicitly or export before
                closing.
              </p>
            </details>
          </section>
        </>
      )}
    </div>
  );
}
