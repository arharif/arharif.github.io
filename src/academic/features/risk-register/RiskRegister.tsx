import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Upload,
  Download,
  Play,
  Copy,
  Pencil,
  Trash2,
  Filter,
  ShieldAlert,
} from "lucide-react";
import { Header, Field, base, download } from "../../components/shared";
import { Metric, Panel, Donut, Bars, Curve } from "../../components/Analytics";
import {
  useExplanation,
  metricExplanation,
} from "../../components/Explanation";
import {
  csv,
  riskCategory,
  riskValue,
  challengeResponse,
} from "../../utils/engines";
import { scenarios } from "../../data/cases";
import type { CaseId } from "../../data/types";
import {
  parseRiskWorkspace,
  ageDays,
  demoRisks,
  guessMapping,
  labels,
  parseCsv,
  requiredFields,
  riskAnalytics,
  riskFields,
  validateImport,
  validateRisk,
  type ImportIssue,
  type RiskField,
  type RiskRecord,
  type SheetRows,
} from "./model";
import { readWorkbook, workbookBytes } from "./spreadsheet";
const today = new Date().toISOString().slice(0, 10);
type Selection = { label: string; ids: string[] } | null;
export default function RiskRegister() {
  const { explain } = useExplanation();
  const [restored] = useState(() => {
    try {
      return parseRiskWorkspace(
        sessionStorage.getItem("x1-risk-workspace-v1") || "null",
      );
    } catch {
      return null;
    }
  });
  const [storageError, setStorageError] = useState(false);
  const [sample, setSample] = useState<CaseId>(restored?.sample ?? "paysecure");
  const [drafts, setDrafts] = useState<RiskRecord[]>(
    () => restored?.drafts ?? demoRisks("paysecure"),
  );
  const [analysed, setAnalysed] = useState<RiskRecord[]>(
    () => restored?.analysed ?? demoRisks("paysecure"),
  );
  const [pending, setPending] = useState(() =>
      restored
        ? JSON.stringify(restored.drafts) !== JSON.stringify(restored.analysed)
        : false,
    ),
    [selection, setSelection] = useState<Selection>(null);
  const [query, setQuery] = useState(""),
    [view, setView] = useState("analytics");
  const [editing, setEditing] = useState<RiskRecord | null>(null),
    [originalId, setOriginalId] = useState<string | null>(null);
  const [issues, setIssues] = useState<ImportIssue[]>([]),
    [message, setMessage] = useState("");
  const [sheets, setSheets] = useState<{ name: string; rows: SheetRows }[]>([]),
    [sheet, setSheet] = useState(0);
  const [mapping, setMapping] = useState<Partial<Record<RiskField, number>>>(
      {},
    ),
    [busy, setBusy] = useState(false);
  const [snapshots, setSnapshots] = useState<
      { date: string; rows: RiskRecord[] }[]
    >(restored?.snapshots ?? []),
    [snapshotDate, setSnapshotDate] = useState(today),
    [historical, setHistorical] = useState<RiskRecord[] | null>(null);
  const [decisionId, setDecisionId] = useState(""),
    [proposedL, setProposedL] = useState(2),
    [proposedI, setProposedI] = useState(3),
    [reason, setReason] = useState(""),
    [assumptions, setAssumptions] = useState(""),
    [treatment, setTreatment] = useState("Mitigate"),
    [decisionReviewed, setDecisionReviewed] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "x1-risk-workspace-v1",
        JSON.stringify({ version: 1, sample, drafts, analysed, snapshots }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [sample, drafts, analysed, snapshots]);
  const rows = historical ?? analysed,
    analytics = riskAnalytics(rows, today);
  const selectedRows = rows.filter(
    (row) =>
      (!selection || selection.ids.includes(row.id)) &&
      `${row.id} ${row.asset} ${row.owner} ${row.threat}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const aggregate = (field: "owner" | "businessUnit") =>
    [...new Set(rows.map((row) => row[field]))].map((label) => ({
      label,
      value: rows.filter((row) => row[field] === label).length,
    }));
  const select = (label: string, filtered: RiskRecord[], method: string) => {
    setSelection({ label, ids: filtered.map((row) => row.id) });
    explain(
      metricExplanation(label, `${filtered.length} matching records`, method),
    );
  };
  const metric = (
    label: string,
    value: string | number,
    method: string,
    filtered = rows,
  ) => {
    select(label, filtered, method);
    explain(metricExplanation(label, String(value), method));
  };
  const updateDrafts = (next: RiskRecord[]) => {
    setDrafts(next);
    setPending(true);
  };
  const inspectRisk = (row: RiskRecord) =>
    explain({
      ...metricExplanation(
        row.id,
        `${riskValue(row.residualLikelihood, row.residualImpact, "product")} · ${riskCategory(row.residualLikelihood * row.residualImpact)}`,
        "Inherent and residual indices are separate ordinal likelihood × impact estimates on a 1–5 scale. Low 1–4, Moderate 5–9, High 10–16, Critical 17–25.",
      ),
      title: `${row.id} · ${row.asset}`,
      meaning: `${row.threat} ${row.businessImpact}. Owner: ${row.owner}.`,
      technical: `Exposure: ${row.vulnerability}. Controls: ${row.controls || "No control assertion supplied"}. Evidence: ${row.evidence || "No evidence reference supplied"}.`,
      interpretation: `${row.provenance}. Status ${row.status} records a learner assertion. Residual estimates require effectiveness evidence.`,
      actions: [
        row.treatment || "Define a treatment recommendation.",
        `Confirm decision authority with ${row.owner}.`,
        `Review ${row.reviewDate || "date must be assigned"}.`,
      ],
    });
  const edit = (row?: RiskRecord) => {
    setView("input");
    setIssues([]);
    setOriginalId(row?.id ?? null);
    setEditing(
      row
        ? { ...row }
        : {
            id: `RISK-${drafts.length + 1}`,
            asset: "",
            threat: "",
            vulnerability: "",
            businessImpact: "",
            likelihood: 3,
            impact: 3,
            residualLikelihood: 3,
            residualImpact: 3,
            controls: "",
            treatment: "",
            owner: "",
            businessUnit: "",
            status: "Open",
            createdAt: today,
            reviewDate: "",
            evidence: "",
            provenance: "Learner input",
          },
    );
  };
  const load = async (file: File) => {
    setBusy(true);
    setMessage("");
    setIssues([]);
    try {
      if (file.size > 5_000_000)
        throw new Error("Maximum upload size is 5 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const imported = file.name.toLowerCase().endsWith(".xlsx")
        ? await readWorkbook(bytes)
        : file.name.toLowerCase().endsWith(".csv")
          ? [
              {
                name: file.name,
                rows: parseCsv(
                  new TextDecoder("utf-8", { fatal: true }).decode(bytes),
                ),
              },
            ]
          : [];
      if (!imported.length || imported[0].rows.length < 2)
        throw new Error(
          "Choose an XLSX or CSV file with headers and at least one risk.",
        );
      setSheets(imported);
      setSheet(0);
      setMapping(guessMapping(imported[0].rows[0].map(String)));
      setView("input");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const saveExcel = async (template = false) => {
    setBusy(true);
    try {
      const bytes = await workbookBytes(
        template ? demoRisks(sample) : analysed,
        template,
      );
      if (!(bytes.buffer instanceof ArrayBuffer))
        throw new Error("Workbook buffer is unavailable.");
      download(
        template ? "x1-risk-input-template.xlsx" : "x1-risk-assessment.xlsx",
        new Blob([bytes.buffer]),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const decisionRisk = analysed.find((row) => row.id === decisionId);
  return (
    <>
      <Header
        eyebrow="GRC workspace · local data processing"
        title="Risk intelligence workspace"
      >
        <p>
          Build a register, analyse the submitted records and connect every
          indicator to a defensible decision.
        </p>
      </Header>
      <div className="xa-workspace-toolbar">
        <div className="xa-segmented" aria-label="Risk workspace view">
          {[
            ["analytics", "Analytics"],
            ["input", "Register input"],
            ["decision", "Decision simulator"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="xa-actions">
          <button onClick={() => edit()}>
            <Plus size={15} />
            Add risk
          </button>
          <button
            className="primary"
            onClick={() => {
              setAnalysed(drafts.map((row) => ({ ...row })));
              setPending(false);
              setSelection(null);
              setHistorical(null);
              setView("analytics");
              setMessage(`${drafts.length} submitted records analysed.`);
            }}
          >
            <Play size={14} />
            Analyse risks
          </button>
        </div>
      </div>
      <div className="xa-provenance">
        <ShieldAlert size={15} aria-hidden="true" />
        <span>
          {rows.length &&
          rows.every((row) => row.provenance === "Fictional scenario")
            ? "Fictional educational scenario — not real organisational evidence."
            : "Learner-supplied records · processed locally in this browser."}{" "}
          {pending
            ? "Draft changes are awaiting analysis."
            : "Analytics reflect the last submitted register."}{" "}
          Risk records are retained in this browser session. No files are
          uploaded.
        </span>
      </div>
      {storageError && (
        <p role="alert">
          Browser session storage is unavailable. Export your register before
          leaving the workspace.
        </p>
      )}
      <p role="status">
        {message}
        {busy && " Processing workbook…"}
      </p>
      {view === "input" && (
        <section className="xa-panel">
          <div className="xa-grid two">
            <Field label="Example organisation">
              <select
                value={sample}
                onChange={(event) => setSample(event.target.value as CaseId)}
              >
                {scenarios.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="xa-actions">
              <button
                onClick={() => {
                  updateDrafts(demoRisks(sample));
                  setSnapshots([]);
                  setMessage(
                    "Fictional examples loaded into the draft. Analyse to update the dashboard.",
                  );
                }}
              >
                Load example register
              </button>
              <button
                onClick={() => {
                  updateDrafts([]);
                  setSnapshots([]);
                  setMessage(
                    "Blank draft ready. Analyse to clear the submitted register.",
                  );
                }}
              >
                Start blank register
              </button>
            </div>
          </div>
          <p>
            Current draft · {drafts.length} risks. Import replaces this draft
            after validation. Export your current analysis before loading
            another dataset.
          </p>
          <div className="xa-grid two">
            <Field label="Import XLSX or CSV risk register">
              <input
                type="file"
                accept=".xlsx,.csv"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void load(file);
                  event.target.value = "";
                }}
              />
            </Field>
            <div className="xa-actions">
              <button disabled={busy} onClick={() => void saveExcel(true)}>
                <Download size={14} />
                Download Excel template
              </button>
            </div>
          </div>
          {sheets.length > 0 && (
            <div className="xa-import-mapping">
              <h2>Map and validate columns</h2>
              <Field label="Worksheet">
                <select
                  value={sheet}
                  onChange={(event) => {
                    const index = +event.target.value;
                    setSheet(index);
                    setMapping(guessMapping(sheets[index].rows[0].map(String)));
                    setIssues([]);
                  }}
                >
                  {sheets.map((value, index) => (
                    <option key={value.name} value={index}>
                      {value.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="xa-grid">
                {riskFields.map((field) => (
                  <Field
                    label={`${labels[field]}${requiredFields.includes(field) ? " *" : ""}`}
                    key={field}
                  >
                    <select
                      value={mapping[field] ?? ""}
                      onChange={(event) =>
                        setMapping({
                          ...mapping,
                          [field]:
                            event.target.value === ""
                              ? undefined
                              : +event.target.value,
                        })
                      }
                    >
                      <option value="">
                        Unmapped
                        {field.startsWith("residual")
                          ? " · inherits inherent rating"
                          : ""}
                      </option>
                      {sheets[sheet].rows[0].map((value, index) => (
                        <option key={index} value={index}>
                          {String(value || `Column ${index + 1}`)}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
              </div>
              <button
                onClick={() => {
                  const result = validateImport(sheets[sheet].rows, mapping);
                  setIssues(result.issues);
                  if (!result.issues.length && result.records.length) {
                    updateDrafts(result.records);
                    setSheets([]);
                    setSnapshots([]);
                    setMessage(
                      `${result.records.length} valid rows imported to the draft. Click Analyse Risks to calculate indicators.`,
                    );
                  } else
                    setMessage(
                      "Resolve all row errors before replacing the draft.",
                    );
                }}
              >
                Validate and import
              </button>
            </div>
          )}
          {issues.length > 0 && (
            <div role="alert">
              <h3>Validation requires attention</h3>
              <ul>
                {issues.slice(0, 60).map((issue, index) => (
                  <li key={index}>
                    Row {issue.row} · {issue.field} · {issue.message}
                  </li>
                ))}
              </ul>
              {issues.length > 60 && (
                <p>
                  {issues.length - 60} additional issues. Correct the displayed
                  errors and validate again.
                </p>
              )}
            </div>
          )}
          {editing && (
            <form
              className="xa-risk-editor"
              onSubmit={(event) => {
                event.preventDefault();
                const result = validateRisk(
                  editing as unknown as Record<string, unknown>,
                  1,
                  editing.provenance,
                );
                const duplicate = drafts.some(
                  (row) => row.id === editing.id && row.id !== originalId,
                );
                if (duplicate)
                  result.issues.push({
                    row: 1,
                    field: "id",
                    message: "Choose a unique Risk ID.",
                  });
                setIssues(result.issues);
                if (result.issues.length) return;
                updateDrafts(
                  originalId
                    ? drafts.map((row) =>
                        row.id === originalId ? result.record : row,
                      )
                    : [...drafts, result.record],
                );
                setEditing(null);
                setMessage(
                  "Risk saved to the draft. Analyse to refresh indicators.",
                );
              }}
            >
              <h2>{originalId ? "Edit risk" : "Add a risk"}</h2>
              <div className="xa-grid two">
                {riskFields.map((field) => (
                  <Field
                    key={field}
                    label={`${labels[field]}${requiredFields.includes(field) ? " *" : ""}`}
                  >
                    {field === "status" ? (
                      <select
                        value={editing.status}
                        onChange={(event) =>
                          setEditing({
                            ...editing,
                            status: event.target.value as RiskRecord["status"],
                          })
                        }
                      >
                        {["Open", "In progress", "Accepted", "Closed"].map(
                          (value) => (
                            <option key={value}>{value}</option>
                          ),
                        )}
                      </select>
                    ) : (
                      <input
                        type={
                          [
                            "likelihood",
                            "impact",
                            "residualLikelihood",
                            "residualImpact",
                          ].includes(field)
                            ? "number"
                            : ["createdAt", "reviewDate"].includes(field)
                              ? "date"
                              : "text"
                        }
                        min="1"
                        max="5"
                        maxLength={2000}
                        required={requiredFields.includes(field)}
                        value={editing[field]}
                        onChange={(event) =>
                          setEditing({
                            ...editing,
                            [field]: event.target.value,
                          })
                        }
                      />
                    )}
                  </Field>
                ))}
              </div>
              <div className="xa-actions">
                <button className="primary" type="submit">
                  Save risk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setIssues([]);
                  }}
                >
                  Cancel edit
                </button>
              </div>
            </form>
          )}
          <div className="xa-table-scroll">
            <table>
              <caption>Draft register · edits require Analyse Risks</caption>
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Asset</th>
                  <th>Owner</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.asset}</td>
                    <td>{row.owner}</td>
                    <td>
                      <div className="xa-actions">
                        <button
                          aria-label={`Edit ${row.id}`}
                          onClick={() => edit(row)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          aria-label={`Duplicate ${row.id}`}
                          onClick={() => {
                            let id = `${row.id}-COPY`;
                            while (drafts.some((record) => record.id === id))
                              id += "-COPY";
                            updateDrafts([...drafts, { ...row, id }]);
                          }}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          aria-label={`Delete ${row.id}`}
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {deleteId === row.id && (
                        <p>
                          Delete this draft risk?{" "}
                          <button
                            onClick={() => {
                              updateDrafts(
                                drafts.filter((record) => record.id !== row.id),
                              );
                              setDeleteId(null);
                            }}
                          >
                            Confirm delete
                          </button>
                          <button onClick={() => setDeleteId(null)}>
                            Keep risk
                          </button>
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {view === "analytics" && (
        <>
          <div className="xa-metric-grid">
            <Metric
              label="Submitted risks"
              value={analytics.count}
              detail="Select to inspect all records"
              onClick={() =>
                metric(
                  "Submitted risks",
                  analytics.count,
                  "Count of records in the last analysed register.",
                )
              }
            />
            <Metric
              label="Residual exposure index"
              value={analytics.residual}
              detail={`Inherent index ${analytics.inherent} · ordinal sums`}
              tone="amber"
              onClick={() =>
                metric(
                  "Residual exposure index",
                  analytics.residual,
                  "Sum of each residual likelihood × impact index. Ordinal totals support prioritisation and do not represent financial loss or a compliance score.",
                )
              }
            />
            <Metric
              label="Critical risks"
              value={analytics.counts.Critical}
              detail="Residual index 17–25"
              tone="red"
              onClick={() =>
                metric(
                  "Critical risks",
                  analytics.counts.Critical,
                  "Residual index greater than 16.",
                  rows.filter(
                    (row) => row.residualLikelihood * row.residualImpact >= 17,
                  ),
                )
              }
            />
            <Metric
              label="Overdue reviews"
              value={analytics.overdue}
              detail={`Compared with ${today} UTC`}
              tone="violet"
              onClick={() =>
                metric(
                  "Overdue reviews",
                  analytics.overdue,
                  "Non-closed records with a supplied review date earlier than today. Missing dates are excluded and need follow-up.",
                  rows.filter(
                    (row) =>
                      row.reviewDate &&
                      row.reviewDate < today &&
                      row.status !== "Closed",
                  ),
                )
              }
            />
          </div>
          <div className="xa-dashboard-grid">
            <Panel
              title="Likelihood × impact"
              subtitle="Residual estimates · select a cell"
            >
              <div
                className="xa-risk-heatmap"
                aria-label="Residual risk heatmap"
              >
                {[5, 4, 3, 2, 1].flatMap((l) =>
                  [1, 2, 3, 4, 5].map((i) => {
                    const matches = rows.filter(
                      (row) =>
                        row.residualLikelihood === l &&
                        row.residualImpact === i,
                    );
                    return (
                      <button
                        key={`${l}-${i}`}
                        className={`xa-risk-cell ${riskCategory(l * i).toLowerCase()}`}
                        aria-label={`Likelihood ${l}, impact ${i}: ${matches.length} risks`}
                        onClick={() =>
                          select(
                            `Likelihood ${l} × impact ${i}`,
                            matches,
                            `The selected cell groups residual likelihood ${l} and impact ${i}. Index ${l * i} is ${riskCategory(l * i)} under the declared model.`,
                          )
                        }
                      >
                        <span>{matches.length}</span>
                        <small>
                          {l} × {i}
                        </small>
                      </button>
                    );
                  }),
                )}
              </div>
              <p className="xa-chart-note">
                Likelihood 5 → 1, impact 1 → 5. Category labels are available in
                each cell’s explanation.
              </p>
            </Panel>
            <Panel
              title="Risk distribution"
              subtitle="Calculated from residual ratings"
            >
              <Donut
                label="risks"
                entries={Object.entries(analytics.counts).map(
                  ([label, value]) => ({ label, value }),
                )}
                onSelect={(label) =>
                  select(
                    `${label} residual risks`,
                    rows.filter(
                      (row) =>
                        riskCategory(
                          row.residualLikelihood * row.residualImpact,
                        ) === label,
                    ),
                    "Counts use residual likelihood × impact. Low 1–4, Moderate 5–9, High 10–16, Critical 17–25.",
                  )
                }
              />
            </Panel>
            <Panel
              title="Control & evidence coverage"
              subtitle="Assertions supplied with each risk"
            >
              <Bars
                label="Control and evidence coverage"
                entries={[
                  { label: "Control assertion", value: analytics.controlled },
                  { label: "Evidence reference", value: analytics.evidenced },
                  {
                    label: "No evidence reference",
                    value: analytics.count - analytics.evidenced,
                  },
                ]}
                onSelect={(label) =>
                  select(
                    label,
                    rows.filter((row) =>
                      label === "Control assertion"
                        ? !!row.controls
                        : label === "Evidence reference"
                          ? !!row.evidence
                          : !row.evidence,
                    ),
                    "A non-empty field counts as an assertion or reference. This measure does not independently validate implementation or effectiveness.",
                  )
                }
              />
              <button
                className="xa-text-button"
                onClick={() => {
                  explain(
                    metricExplanation(
                      "Control assurance",
                      `${analytics.evidenced}/${analytics.count} records have references`,
                      "Presence of a reference is a documentation indicator. Assess design, operation, period and sampling separately.",
                      "assurance",
                    ),
                  );
                }}
              >
                Interpret assurance →
              </button>
            </Panel>
            <Panel
              title="Treatment progress"
              subtitle="Learner-reported status"
            >
              <Bars
                label="Treatment progress"
                entries={["Open", "In progress", "Accepted", "Closed"].map(
                  (label) => ({
                    label,
                    value: rows.filter((row) => row.status === label).length,
                  }),
                )}
                onSelect={(label) =>
                  select(
                    `${label} treatment records`,
                    rows.filter((row) => row.status === label),
                    "Status is learner-reported. Closed requires subsequent validation. Accepted requires accountable approval and review conditions.",
                  )
                }
              />
            </Panel>
            <Panel
              title="Risk ageing"
              subtitle="Days since supplied identification date"
            >
              <Bars
                label="Risk ageing"
                entries={[
                  "0–30 days",
                  "31–90 days",
                  "Over 90 days",
                  "Date missing",
                ].map((label) => ({
                  label,
                  value: rows.filter((row) => {
                    const days = ageDays(row, today);
                    return label === "Date missing"
                      ? days === null
                      : label === "0–30 days"
                        ? days !== null && days >= 0 && days <= 30
                        : label === "31–90 days"
                          ? days !== null && days > 30 && days <= 90
                          : days !== null && days > 90;
                  }).length,
                }))}
                onSelect={(label) => {
                  const filtered = rows.filter((row) => {
                    const days = ageDays(row, today);
                    return label === "Date missing"
                      ? days === null
                      : label === "0–30 days"
                        ? days !== null && days >= 0 && days <= 30
                        : label === "31–90 days"
                          ? days !== null && days > 30 && days <= 90
                          : days !== null && days > 90;
                  });
                  select(
                    label,
                    filtered,
                    "Age is whole UTC days between the identification date and today. Missing dates are shown separately. Future-dated entries are excluded from positive age buckets.",
                  );
                }}
              />
            </Panel>
            <Panel
              title="Accountable ownership"
              subtitle="Select an owner to inspect their risks"
            >
              <Bars
                entries={aggregate("owner")}
                label="Risks by owner"
                onSelect={(label) =>
                  select(
                    `Owner · ${label}`,
                    rows.filter((row) => row.owner === label),
                    "Record count grouped by the entered accountable owner. Count alone does not measure business exposure.",
                  )
                }
              />
            </Panel>
            <Panel
              title="Business-unit exposure"
              subtitle="Risk counts grouped by supplied unit"
            >
              <Bars
                entries={aggregate("businessUnit")}
                label="Risks by business unit"
                onSelect={(label) =>
                  select(
                    `Business unit · ${label}`,
                    rows.filter((row) => row.businessUnit === label),
                    "Record count grouped by business unit. Compare residual estimates and criticality before allocating resources.",
                  )
                }
              />
            </Panel>
            <Panel
              title="Dated observations"
              subtitle="Trends use only snapshots you record"
            >
              <Field label="Observation date">
                <input
                  type="date"
                  value={snapshotDate}
                  onChange={(event) => setSnapshotDate(event.target.value)}
                />
              </Field>
              <button
                disabled={!snapshotDate || !analysed.length}
                onClick={() => {
                  setSnapshots((previous) =>
                    [
                      ...previous.filter((row) => row.date !== snapshotDate),
                      {
                        date: snapshotDate,
                        rows: analysed.map((row) => ({ ...row })),
                      },
                    ]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .slice(-30),
                  );
                  setMessage(
                    "Dated observation captured from the submitted register.",
                  );
                }}
              >
                Record dated snapshot
              </button>
              {snapshots.length < 2 ? (
                <p className="xa-empty-chart">
                  Record two observations to compare submitted registers.
                  Historical trends are awaiting dated observations.
                </p>
              ) : (
                <Curve
                  label="Observed residual exposure index"
                  xLabel="Observation order · full dates in values"
                  yLabel="Normalised residual index"
                  points={snapshots.map((row, index) => ({
                    x: index / (snapshots.length - 1),
                    y:
                      riskAnalytics(row.rows, today).residual /
                      Math.max(
                        1,
                        ...snapshots.map(
                          (value) => riskAnalytics(value.rows, today).residual,
                        ),
                      ),
                    label: `${row.date} · residual index ${riskAnalytics(row.rows, today).residual}`,
                  }))}
                  onSelect={(index) => {
                    setHistorical(snapshots[index].rows);
                    setSelection(null);
                    explain(
                      metricExplanation(
                        "Recorded observation",
                        snapshots[index].date,
                        `This snapshot contains ${snapshots[index].rows.length} captured records. Scope changes can affect the summed index.`,
                      ),
                    );
                  }}
                />
              )}
            </Panel>
          </div>
          <Panel
            title="Risk register & priority queue"
            subtitle={selection?.label ?? "Highest residual index first"}
            action={
              <button
                onClick={() => {
                  setSelection(null);
                  setHistorical(null);
                  setQuery("");
                }}
              >
                <Filter size={14} />
                Clear filters
              </button>
            }
          >
            <Field label="Search analysed risks">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Risk ID, asset, threat or owner"
              />
            </Field>
            <p role="status">
              {selectedRows.length} matching records
              {historical && " · viewing a recorded observation"}
            </p>
            <div className="xa-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Risk / asset</th>
                    <th>Inherent</th>
                    <th>Residual</th>
                    <th>Owner / status</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {[...selectedRows]
                    .sort(
                      (a, b) =>
                        b.residualLikelihood * b.residualImpact -
                        a.residualLikelihood * a.residualImpact,
                    )
                    .map((row) => (
                      <tr key={row.id}>
                        <td>
                          <button
                            className="xa-record-link"
                            onClick={() => inspectRisk(row)}
                          >
                            {row.id}
                          </button>
                          <small className="xa-block">{row.asset}</small>
                        </td>
                        <td>{row.likelihood * row.impact}</td>
                        <td>
                          <button
                            className={`xa-risk-pill ${riskCategory(row.residualLikelihood * row.residualImpact).toLowerCase()}`}
                            onClick={() => inspectRisk(row)}
                          >
                            {row.residualLikelihood * row.residualImpact} ·{" "}
                            {riskCategory(
                              row.residualLikelihood * row.residualImpact,
                            )}
                          </button>
                        </td>
                        <td>
                          {row.owner}
                          <small className="xa-block">{row.status}</small>
                        </td>
                        <td>{row.reviewDate || "Unassigned"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!selectedRows.length && (
              <p>
                No risks match this selection. Clear filters or analyse a
                populated register.
              </p>
            )}
          </Panel>
        </>
      )}
      {view === "decision" && (
        <section className="xa-panel">
          <h2>Defend a treatment recommendation</h2>
          <Field label="Risk to simulate">
            <select
              value={decisionId}
              onChange={(event) => {
                const row = analysed.find(
                  (value) => value.id === event.target.value,
                );
                setDecisionId(event.target.value);
                setProposedL(row?.residualLikelihood ?? 2);
                setProposedI(row?.residualImpact ?? 3);
                setDecisionReviewed(false);
              }}
            >
              <option value="">Choose a submitted risk</option>
              {analysed.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.id} · {row.asset}
                </option>
              ))}
            </select>
          </Field>
          {decisionRisk && (
            <>
              <p>
                {decisionRisk.threat} · {decisionRisk.businessImpact}
              </p>
              <div className="xa-grid two">
                <Field label={`Proposed residual likelihood · ${proposedL}`}>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={proposedL}
                    onChange={(event) => setProposedL(+event.target.value)}
                  />
                </Field>
                <Field label={`Proposed residual impact · ${proposedI}`}>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={proposedI}
                    onChange={(event) => setProposedI(+event.target.value)}
                  />
                </Field>
              </div>
              <p className="xa-result" aria-live="polite">
                Current residual{" "}
                {decisionRisk.residualLikelihood * decisionRisk.residualImpact}{" "}
                → proposed {proposedL * proposedI} ·{" "}
                {riskCategory(proposedL * proposedI)}
              </p>
              <p>
                The proposed estimate is a learner judgement. Control selection
                does not automatically reduce a score.
              </p>
              <Field label="Treatment option">
                <select
                  value={treatment}
                  onChange={(event) => setTreatment(event.target.value)}
                >
                  {["Mitigate", "Avoid", "Transfer or share", "Accept"].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Control assumptions and effectiveness evidence">
                <textarea
                  value={assumptions}
                  maxLength={3000}
                  onChange={(event) => setAssumptions(event.target.value)}
                />
              </Field>
              <Field label="Recommendation to the risk committee">
                <textarea
                  value={reason}
                  maxLength={4000}
                  onChange={(event) => setReason(event.target.value)}
                />
              </Field>
              <button
                onClick={() => {
                  setDecisionReviewed(true);
                  explain(
                    metricExplanation(
                      "Committee challenge",
                      `${riskCategory(proposedL * proposedI)} proposed exposure`,
                      "The committee checks coverage of context, assumptions, evidence, cost, remaining exposure and authority. Keyword cues identify topics and require human review.",
                    ),
                  );
                }}
              >
                Challenge recommendation
              </button>
              {decisionReviewed && (
                <ul>
                  {challengeResponse(reason).map((item) => (
                    <li key={item.label}>
                      {item.mentioned ? "Mentioned" : "Develop further"} ·{" "}
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
              <button
                disabled={reason.trim().length < 40 || !assumptions.trim()}
                onClick={() =>
                  download(
                    "risk-decision.json",
                    JSON.stringify(
                      {
                        risk: decisionRisk,
                        proposed: {
                          likelihood: proposedL,
                          impact: proposedI,
                          index: proposedL * proposedI,
                        },
                        treatment,
                        assumptions,
                        reason,
                        authority: decisionRisk.owner,
                        status: "Recommendation awaiting authorised review",
                        method:
                          "Ordinal L × I; no automatic measured control reduction",
                        generatedAt: new Date().toISOString(),
                      },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                Export decision record
              </button>
            </>
          )}
          <p>
            <Link to={`${base}/labs/risk-decision`}>
              Open the guided scenario lifecycle →
            </Link>
          </p>
        </section>
      )}
      <section className="xa-panel xa-export">
        <h2>Executive summary & professional outputs</h2>
        <p>
          {analytics.count} submitted risks have a summed inherent index of{" "}
          {analytics.inherent} and residual index of {analytics.residual}.{" "}
          {analytics.counts.Critical} critical risks and {analytics.overdue}{" "}
          overdue reviews need accountable attention. {analytics.evidenced}{" "}
          records include evidence references.
        </p>
        <p className="xa-muted">
          Ordinal indices support educational prioritisation. They estimate
          neither monetary exposure nor verified effectiveness. Reported status
          and evidence references require independent review.
        </p>
        <div className="xa-actions">
          <button
            disabled={!analysed.length || busy}
            onClick={() => void saveExcel()}
          >
            <Download size={14} />
            Export Excel
          </button>
          <button
            disabled={!analysed.length}
            onClick={() =>
              download(
                "risk-register.csv",
                csv(
                  analysed.map((row) => ({
                    ...row,
                    inherentIndex: row.likelihood * row.impact,
                    residualIndex: row.residualLikelihood * row.residualImpact,
                    method: "Ordinal likelihood × impact",
                    generatedAt: new Date().toISOString(),
                  })),
                ),
                "text/csv;charset=utf-8",
              )
            }
          >
            Export register CSV
          </button>
          <button
            disabled={!analysed.length}
            onClick={() =>
              download(
                "risk-treatment-plan.csv",
                csv(
                  analysed.map((row) => ({
                    id: row.id,
                    action: row.treatment,
                    owner: row.owner,
                    status: row.status,
                    reviewDate: row.reviewDate,
                    evidence: row.evidence,
                    provenance: row.provenance,
                  })),
                ),
                "text/csv;charset=utf-8",
              )
            }
          >
            Export treatment plan
          </button>
          <button disabled={!analysed.length} onClick={() => window.print()}>
            Print executive report
          </button>
        </div>
      </section>
    </>
  );
}
