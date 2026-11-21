import { useEffect, useState } from "react";
import PrivacyMap from "./PrivacyMap";
import { Link, useSearchParams } from "react-router-dom";
import { base, Header, Field, Source, download } from "../components/shared";
import { useScenario } from "../app/context";
import { useWorkspace, useLabState } from "../workspace/state";
import {
  newId,
  newTask,
  activitySchema,
  privacyRiskSchema,
  type ProcessingActivity,
  type PrivacyRisk,
} from "./model";
import { privacyScores, privacyMethod } from "./engines";
import { Panel, Method, Empty } from "./visuals";
import { RiskMatrix, Bars, Kpi } from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
function blankActivity(): ProcessingActivity {
  return {
    id: newId("processing"),
    name: "",
    purpose: "",
    dataSubjects: "",
    categories: "",
    collection: "",
    use: "",
    sharing: "",
    retentionDays: 90,
    deletion: "",
    controller: "",
    processor: "",
    jurisdiction: "",
    legalReview: "Not reviewed",
    obligations: "",
    necessity: "",
    proportionality: "",
    rights: "",
    minimisation: "",
  };
}
function blankPrivacy(
  edition: PrivacyRisk["edition"],
  activityId = "",
): PrivacyRisk {
  return {
    id: newId("privacy"),
    edition,
    activityId,
    event: "",
    harm: "",
    likelihood: 3,
    impact: 3,
    residualLikelihood: 3,
    residualImpact: 3,
    controls: "",
    assumptions: "",
    owner: "",
    escalation: "",
    taskId: "",
  };
}
export default function PrivacyStudio() {
  const { studio: s, setStudio } = useWorkspace(),
    scenario = useScenario(),
    { explain } = useInsight(),
    [params] = useSearchParams();
  const [activity, setActivity] = useLabState<ProcessingActivity>(
      "privacy",
      "activity",
      blankActivity,
    ),
    [risk, setRisk] = useLabState<PrivacyRisk>("privacy", "risk", () =>
      blankPrivacy(s.privacyEdition),
    );
  const [selectedActivity, setSelectedActivity] = useLabState(
      "privacy",
      "selectedActivity",
      "",
    ),
    [tolerance, setTolerance] = useLabState("privacy", "tolerance", 9),
    [filter, setFilter] = useState<{ l: number; i: number } | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (params.get("edition") === "pf-1.1-ipd")
      setStudio((p) => ({ ...p, privacyEdition: "pf-1.1-ipd" }));
  }, [params]);
  useEffect(() => {
    if (risk.edition !== s.privacyEdition)
      setRisk(blankPrivacy(s.privacyEdition, selectedActivity));
  }, [s.privacyEdition]);
  const risks = s.privacyRisks.filter((r) => r.edition === s.privacyEdition),
    visible = risks.filter(
      (r) =>
        !filter ||
        (r.residualLikelihood === filter.l && r.residualImpact === filter.i),
    );
  const selected =
    s.activities.find((a) => a.id === selectedActivity) || s.activities[0];
  function explainPrivacy(
    title: string,
    meaning: string,
    method = privacyMethod,
  ) {
    explain({
      ...metricInsight(
        title,
        meaning,
        method,
        "Prioritise potential harms to individuals, distinguish uncertainty and obtain competent legal/jurisdiction review.",
      ),
      tag: "PRIVACY RISK · INDIVIDUAL HARMS",
      analogy:
        "A perfectly locked filing cabinet can still contain excessive or unfairly collected information. Security of the cabinet does not justify the processing.",
      technical:
        "Trace collection, use, sharing, retention and deletion to identify problematic data actions, affected people and safeguards.",
      business:
        "A bank profiling decision may exclude a customer unfairly; a factory monitoring system may expose workers to intrusive surveillance.",
      sources: [
        {
          title: "NIST Privacy Framework 1.0",
          url: "https://www.nist.gov/privacy-framework/privacy-framework",
        },
        {
          title: "GDPR official legal text",
          url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
        },
      ],
      path: "/standards",
    });
  }
  function loadCase() {
    const industrial = scenario.id !== "paysecure";
    const a = {
      ...blankActivity(),
      name: industrial
        ? "Workforce quality and safety telemetry"
        : "Payment fraud review",
      purpose: industrial
        ? "Detect operational issues while protecting workers from disproportionate monitoring."
        : "Review suspicious payments with human oversight and proportionate data use.",
      dataSubjects: industrial
        ? "Plant employees and contractors"
        : "Customers and payment recipients",
      categories: industrial
        ? "Pseudonymous worker ID, shift, workstation and operational events"
        : "Pseudonymous customer ID, transaction amount, time and merchant category",
      collection: industrial
        ? "Plant device → telemetry broker"
        : "Customer channel → payment gateway",
      use: industrial
        ? "Quality analytics → authorised operations analyst"
        : "Risk scoring → human fraud analyst",
      sharing:
        "Approved processor under documented purpose and access restrictions",
      retentionDays: 180,
      deletion: "Scheduled deletion with sampled deletion evidence",
      controller: scenario.name,
      processor: "Fictional analytics service provider",
      jurisdiction:
        "To be reviewed by learner; do not assume legal applicability",
      obligations:
        "Review lawful authority, rights, transparency, contracts and any cross-border transfers.",
      necessity:
        "Explain why the minimum fields are needed for the stated purpose.",
      proportionality: "Compare less intrusive alternatives and safeguards.",
      rights:
        "Define access, correction, challenge and deletion handling where applicable.",
      minimisation:
        "Use pseudonymous identifiers and avoid unnecessary location/personnel attributes.",
    };
    setActivity(a);
    setMessage(
      "Fictional processing example loaded. Review and record it before assessing harms.",
    );
  }
  return (
    <div className="xa-privacy-workspace">
      <Header
        eyebrow="SIMULATE / PRIVACY RISK & GOVERNANCE"
        title="Privacy Risk & Governance"
      >
        <p>
          Security risk concerns objectives and assets; privacy risk concerns
          potential problems for people arising from data processing, even
          without a breach.
        </p>
      </Header>
      <PrivacyMap
        activities={s.activities}
        risks={risks}
        onEdit={(row) => {
          setSelectedActivity(row.id);
          setActivity(row);
          setRisk(blankPrivacy(s.privacyEdition, row.id));
          document
            .getElementById("xa-privacy-editor")
            ?.scrollIntoView({ block: "start" });
        }}
      />
      <div className="xa-toolbar">
        <Field label="Privacy Framework track">
          <select
            value={s.privacyEdition}
            onChange={(e) => {
              setStudio((p) => ({
                ...p,
                privacyEdition: e.target.value as typeof s.privacyEdition,
              }));
              setFilter(null);
              setRisk(
                blankPrivacy(
                  e.target.value as typeof s.privacyEdition,
                  selected?.id,
                ),
              );
            }}
          >
            <option value="pf-1.0">
              NIST Privacy Framework 1.0 · published, January 2020
            </option>
            <option value="pf-1.1-ipd">
              NIST Privacy Framework 1.1 · initial public draft, April 2025
            </option>
          </select>
        </Field>
        <Field label="Privacy escalation boundary (ordinal index)">
          <input
            type="number"
            min="1"
            max="25"
            value={tolerance}
            onChange={(e) =>
              setTolerance(Math.min(25, Math.max(1, +e.target.value || 1)))
            }
          />
        </Field>
      </div>
      {s.privacyEdition === "pf-1.1-ipd" && (
        <p className="xs-notice">
          Draft track only. Findings retain this edition ID and are displayed
          separately from 1.0. The publisher page must be checked for later
          finalisation; no draft record is silently relabelled final.
        </p>
      )}
      <div id="xa-privacy-editor">
        <Panel
          title="1. Define a processing activity"
          subtitle="Processing inventory and educational DPIA-style context"
        >
          <button onClick={loadCase}>Load fictional processing scenario</button>
          <div className="xa-grid two">
            {(
              [
                "name",
                "purpose",
                "dataSubjects",
                "categories",
                "collection",
                "use",
                "sharing",
                "deletion",
                "controller",
                "processor",
                "jurisdiction",
                "obligations",
                "necessity",
                "proportionality",
                "rights",
                "minimisation",
              ] as const
            ).map((k) => (
              <Field
                key={k}
                label={
                  {
                    name: "Processing activity name",
                    purpose: "Processing purpose",
                    dataSubjects: "Data subjects",
                    categories: "Personal-data categories",
                    collection: "Collection sources and systems",
                    use: "Processing use and systems",
                    sharing: "Recipients and third-party sharing",
                    deletion: "Deletion mechanism and verification",
                    controller: "Controller role",
                    processor: "Processor role",
                    jurisdiction: "Jurisdiction and legal-scope assumptions",
                    obligations: "Relevant obligations and review",
                    necessity: "Necessity assessment",
                    proportionality:
                      "Proportionality and less intrusive alternatives",
                    rights: "Rights, challenge and human review",
                    minimisation: "Data minimisation strategy",
                  }[k]
                }
              >
                <textarea
                  value={activity[k]}
                  maxLength={4000}
                  onChange={(e) =>
                    setActivity({ ...activity, [k]: e.target.value })
                  }
                />
              </Field>
            ))}
            <Field label="Retention period (days)">
              <input
                type="number"
                min="0"
                max="36500"
                value={activity.retentionDays}
                onChange={(e) =>
                  setActivity({ ...activity, retentionDays: +e.target.value })
                }
              />
            </Field>
            <Field label="Activity recorded on">
              <input
                type="date"
                value={activity.recordedOn ?? ""}
                onChange={(e) =>
                  setActivity({ ...activity, recordedOn: e.target.value })
                }
              />
            </Field>
            <Field label="Legal applicability review">
              <select
                value={activity.legalReview}
                onChange={(e) =>
                  setActivity({
                    ...activity,
                    legalReview: e.target
                      .value as ProcessingActivity["legalReview"],
                  })
                }
              >
                {["Not reviewed", "Review required", "Reviewed by learner"].map(
                  (v) => (
                    <option key={v}>{v}</option>
                  ),
                )}
              </select>
            </Field>
          </div>
          <div className="xa-actions">
            <button
              className="primary"
              onClick={() => {
                const v = activitySchema.safeParse(activity);
                if (
                  !v.success ||
                  ![
                    activity.name,
                    activity.purpose,
                    activity.dataSubjects,
                    activity.categories,
                    activity.controller,
                  ].every((x) => x.trim())
                ) {
                  setError(
                    "Record a valid name, purpose, subjects, data categories and controller; retention must be a whole nonnegative number.",
                  );
                  return;
                }
                setStudio((p) => ({
                  ...p,
                  activities: [
                    ...p.activities.filter((a) => a.id !== activity.id),
                    activity,
                  ],
                }));
                setSelectedActivity(activity.id);
                setRisk(blankPrivacy(s.privacyEdition, activity.id));
                setError("");
                setMessage(
                  "Processing inventory recorded. Legal review status remains a learner input, not conformity.",
                );
              }}
            >
              Record processing activity
            </button>
            <button onClick={() => setActivity(blankActivity())}>
              New processing activity
            </button>
          </div>
        </Panel>
      </div>
      {selected ? (
        <>
          <Panel
            title="2. Trace the personal-data lifecycle"
            subtitle="Select a stage for contextual privacy analysis"
          >
            <Field label="Recorded processing activity">
              <select
                value={selected.id}
                onChange={(e) => {
                  setSelectedActivity(e.target.value);
                  setRisk(blankPrivacy(s.privacyEdition, e.target.value));
                  setActivity(
                    s.activities.find((a) => a.id === e.target.value)!,
                  );
                }}
              >
                {s.activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <p>
              <strong>Data subjects:</strong> {selected.dataSubjects}.{" "}
              <strong>Categories:</strong> {selected.categories}
            </p>
            <p className="xs-notice">
              Educational DPIA-style practice. Determine legal scope, lawful
              authority, high-risk criteria and consultation needs with a
              qualified reviewer. No GDPR conformity or formal DPIA approval is
              generated.
            </p>
            <details>
              <summary>
                Minimisation experiment: compare retention exposure windows
              </summary>
              <Bars
                items={[
                  { label: "Recorded days", value: selected.retentionDays },
                  {
                    label: "Proposed days",
                    value:
                      activity.id === selected.id
                        ? activity.retentionDays
                        : selected.retentionDays,
                  },
                ]}
                onSelect={(label) =>
                  explainPrivacy(
                    label,
                    "Retention days are the entered retention window, not a measured probability or privacy-risk score.",
                    "Days are copied from the recorded inventory and current editable proposal. No automatic risk reduction is claimed.",
                  )
                }
              />
              <p>
                Edit the retention field above to compare a proposal. Recording
                a processing change does not alter residual harm ratings;
                reassess them separately.
              </p>
            </details>
          </Panel>
          <Panel
            title="3. Assess a problematic data action and individual harm"
            subtitle={`${s.privacyEdition} · explicit ordinal assumptions`}
          >
            <div className="xa-grid two">
              <Field label="Privacy event / problematic data action">
                <textarea
                  value={risk.event}
                  maxLength={4000}
                  placeholder="For example: using work telemetry for an unexpected disciplinary purpose."
                  onChange={(e) => setRisk({ ...risk, event: e.target.value })}
                />
              </Field>
              <Field label="Potential harm to individuals">
                <textarea
                  value={risk.harm}
                  maxLength={4000}
                  placeholder="For example: unfair exclusion, embarrassment, economic harm or loss of autonomy."
                  onChange={(e) => setRisk({ ...risk, harm: e.target.value })}
                />
              </Field>
              {(
                [
                  "likelihood",
                  "impact",
                  "residualLikelihood",
                  "residualImpact",
                ] as const
              ).map((k) => (
                <Field
                  key={k}
                  label={
                    {
                      likelihood: "Privacy-event likelihood (1–5)",
                      impact: "Individual-harm severity (1–5)",
                      residualLikelihood: "Residual privacy likelihood (1–5)",
                      residualImpact: "Residual individual-harm severity (1–5)",
                    }[k]
                  }
                >
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={risk[k]}
                    onChange={(e) => setRisk({ ...risk, [k]: +e.target.value })}
                  />
                </Field>
              ))}
              <Field label="Privacy risk owner">
                <input
                  value={risk.owner}
                  maxLength={240}
                  onChange={(e) => setRisk({ ...risk, owner: e.target.value })}
                />
              </Field>
              <Field label="Escalation and review trigger">
                <input
                  value={risk.escalation}
                  maxLength={4000}
                  onChange={(e) =>
                    setRisk({ ...risk, escalation: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Privacy controls and minimisation options">
              <textarea
                value={risk.controls}
                maxLength={4000}
                onChange={(e) => setRisk({ ...risk, controls: e.target.value })}
              />
            </Field>
            <Field label="Residual-rating rationale, evidence and uncertainty">
              <textarea
                value={risk.assumptions}
                maxLength={4000}
                onChange={(e) =>
                  setRisk({ ...risk, assumptions: e.target.value })
                }
              />
            </Field>
            <Method>{privacyMethod}</Method>
            <button
              className="primary"
              onClick={() => {
                if (risk.edition !== s.privacyEdition) {
                  setError(
                    "Start a new finding for the selected Privacy Framework edition.",
                  );
                  return;
                }
                const candidate = {
                  ...risk,
                  activityId: selected.id,
                  edition: s.privacyEdition,
                };
                const v = privacyRiskSchema.safeParse(candidate);
                if (
                  !v.success ||
                  ![risk.event, risk.harm, risk.owner, risk.assumptions].every(
                    (x) => x.trim(),
                  )
                ) {
                  setError(
                    "Record event, harm, owner and assumptions. All four privacy ratings must be integers 1–5.",
                  );
                  return;
                }
                setStudio((p) => ({
                  ...p,
                  privacyRisks: [
                    ...p.privacyRisks.filter((r) => r.id !== candidate.id),
                    {
                      ...candidate,
                      taskId:
                        p.privacyRisks.find((r) => r.id === candidate.id)
                          ?.taskId ?? candidate.taskId,
                    },
                  ],
                }));
                setRisk(blankPrivacy(s.privacyEdition, selected.id));
                setError("");
                setMessage(
                  "Privacy finding recorded for the selected edition.",
                );
              }}
            >
              Record privacy finding
            </button>
          </Panel>
        </>
      ) : (
        <Empty title="Begin with a processing inventory">
          Load the fictional case or enter an activity. Identify the purpose,
          people and data before scoring a privacy event.
        </Empty>
      )}
      <div className="xa-kpi-grid">
        <Kpi
          label="Processing activities"
          value={s.activities.length}
          detail="Shared factual inventory"
          onClick={() =>
            explainPrivacy(
              "Processing inventory",
              "A register of purposes, data subjects, systems, roles and lifecycle responsibilities.",
            )
          }
        />
        <Kpi
          label="Edition-specific findings"
          value={risks.length}
          detail={s.privacyEdition}
          onClick={() => setFilter(null)}
        />
        <Kpi
          label="Escalation candidates"
          value={
            risks.filter((r) => privacyScores(r).residual > tolerance).length
          }
          detail={`Residual index > ${tolerance}`}
          tone="amber"
          onClick={() =>
            explainPrivacy(
              "Escalation candidates",
              "Entered residual privacy ratings exceed the stated educational boundary. An accountable review is needed.",
            )
          }
        />
        <Kpi
          label="Legal scope unresolved"
          value={
            s.activities.filter((a) => a.legalReview !== "Reviewed by learner")
              .length
          }
          detail="Human review required"
          tone="rose"
          onClick={() =>
            explainPrivacy(
              "Legal applicability review",
              "The project records learner review state, never a legal conformity decision.",
            )
          }
        />
      </div>
      <div className="xa-grid two">
        <Panel
          title="Privacy harm landscape"
          subtitle="Residual likelihood × individual-harm severity"
        >
          <RiskMatrix
            counts={(l, i) =>
              risks.filter(
                (r) => r.residualLikelihood === l && r.residualImpact === i,
              ).length
            }
            onSelect={(l, i) => {
              setFilter({ l, i });
              explainPrivacy(
                `Privacy cell ${l} × ${i}`,
                `${risks.filter((r) => r.residualLikelihood === l && r.residualImpact === i).length} entered privacy findings in this cell.`,
              );
            }}
          />
        </Panel>
        <Panel
          title="Control assumptions: before / after"
          subtitle="Learner ratings, not an automatic control benefit"
        >
          <Bars
            items={[
              {
                label: "Inherent index sum",
                value: risks.reduce((n, r) => n + privacyScores(r).inherent, 0),
              },
              {
                label: "Residual index sum",
                value: risks.reduce((n, r) => n + privacyScores(r).residual, 0),
              },
            ]}
            onSelect={(label) =>
              explainPrivacy(
                label,
                "The sum is an ordinal prioritisation aid across this edition’s entered findings. Compare the underlying records and their assumptions.",
              )
            }
          />
        </Panel>
      </div>
      <Panel
        title="Privacy finding and action register"
        subtitle="Actions trace to a specific processing activity and edition"
      >
        <button onClick={() => setFilter(null)}>
          Clear privacy chart filter
        </button>
        <div className="xa-table-scroll">
          <table>
            <caption>
              Findings for {s.privacyEdition}; other editions remain separate
            </caption>
            <thead>
              <tr>
                <th>Processing / harm</th>
                <th>Ratings</th>
                <th>Owner / assumptions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="xa-text-button"
                      onClick={() => {
                        setRisk(r);
                        setSelectedActivity(r.activityId);
                      }}
                    >
                      {s.activities.find((a) => a.id === r.activityId)?.name}
                    </button>
                    <p>{r.event}</p>
                    <strong>{r.harm}</strong>
                  </td>
                  <td>
                    {privacyScores(r).inherent} → {privacyScores(r).residual}
                    <p>{r.edition}</p>
                  </td>
                  <td>
                    {r.owner}
                    <p>{r.assumptions}</p>
                  </td>
                  <td>
                    <button
                      disabled={!!r.taskId}
                      onClick={() => {
                        const task = {
                          ...newTask(
                            `privacy:${r.id}`,
                            `Address privacy harm: ${r.harm.slice(0, 120)}`,
                          ),
                          owner: r.owner,
                          accountable: r.owner,
                        };
                        setStudio((p) => ({
                          ...p,
                          tasks: [...p.tasks, task],
                          privacyRisks: p.privacyRisks.map((x) =>
                            x.id === r.id ? { ...x, taskId: task.id } : x,
                          ),
                        }));
                        setMessage(
                          "Privacy remediation task linked. Open Implement to set dates, dependencies, effort and validation.",
                        );
                      }}
                    >
                      {r.taskId
                        ? "Action linked"
                        : "Create privacy remediation action"}
                    </button>
                    {r.taskId && (
                      <Link to={`${base}/implement?task=${r.taskId}`}>
                        Open action →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <p>No privacy findings match this edition and filter.</p>
          )}
        </div>
        <div className="xa-actions">
          <button
            disabled={!risks.length || !s.activities.length}
            onClick={() =>
              setStudio((p) => ({
                ...p,
                completedSimulations: [
                  ...new Set([...p.completedSimulations, "privacy-assessment"]),
                ],
              }))
            }
          >
            Mark privacy exercise complete
          </button>
          <Link className="xa-button primary" to={`${base}/implement`}>
            Open implementation plan →
          </Link>
          <Link className="xa-button" to={`${base}/report`}>
            Programme report →
          </Link>
          <button
            onClick={() =>
              download(
                "x1-privacy-dpia-style-report.json",
                JSON.stringify(
                  {
                    edition: s.privacyEdition,
                    activities: s.activities,
                    findings: risks,
                    tolerance,
                    methodology: privacyMethod,
                    limitations:
                      "Educational DPIA-style record. Jurisdiction and legal applicability are reviewed inputs, not an automatic GDPR conformity declaration.",
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            Export privacy assessment
          </button>
        </div>
      </Panel>
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
      <details className="xs-method">
        <summary>Guided privacy exercise and knowledge check</summary>
        <p>
          Analogy: an invitation to one event is not permission to use a guest
          list for every future purpose. Trace what data are necessary, who is
          affected and who decides.
        </p>
        <ol>
          <li>Map the activity and lifecycle.</li>
          <li>
            Describe a problematic data action and a concrete individual harm.
          </li>
          <li>Compare minimisation, retention and sharing safeguards.</li>
          <li>Record residual assumptions and an escalation trigger.</li>
          <li>Create a task and validate the change before reassessment.</li>
        </ol>
        <p>
          Banking: challenge an adverse profiling decision and provide human
          review. Industry: avoid repurposing worker telemetry for
          disproportionate surveillance.
        </p>
        <p>
          Knowledge check: can privacy harm occur when access controls work?
          Yes. Excessive or unfair processing can cause harm without
          unauthorised access.
        </p>
      </details>
      <Source
        href={
          s.privacyEdition === "pf-1.0"
            ? "https://www.nist.gov/privacy-framework/privacy-framework"
            : "https://www.nist.gov/privacy-framework/new-projects/privacy-framework-version-11"
        }
      >
        Official source for the selected Privacy Framework track
      </Source>
    </div>
  );
}
