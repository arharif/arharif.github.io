import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { base, Field, Header, Source, download } from "../components/shared";
import { useAcademic, useScenario } from "../app/context";
import { useWorkspace, useLabState } from "../workspace/state";
import { controls, csfFunctions } from "../workspace/frameworks";
import { Bars, Donut, Kpi, palette } from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
import {
  newFinding,
  newTask,
  findingErrors,
  evidenceStates,
  type Finding,
} from "./model";
import {
  aggregate,
  maturityMethod,
  recordFinding,
  matchingFindings,
} from "./engines";
import { Stepper, Radar, Panel, Method, Empty } from "./visuals";
export default function AssessmentStudio() {
  const w = useWorkspace(),
    { studio: s, setStudio } = w,
    { explain } = useInsight(),
    scenario = useScenario(),
    [params] = useSearchParams();
  const [step, setStep] = useLabState<number>("guided-assessment", "step", 0),
    [mode, setMode] = useState(
      params.get("mode") === "tiers" ? "Tiers" : "Profile",
    );
  const [fn, setFn] = useState(() => ["GOVERN","IDENTIFY","PROTECT","DETECT","RESPOND","RECOVER"].includes(params.get("function") || "") ? params.get("function")! : "GOVERN"),
    [query, setQuery] = useState(params.get("category") || ""),
    [filter, setFilter] = useState("All");
  const [draft, setDraft] = useLabState<Finding>(
    "guided-assessment",
    "draft",
    () => newFinding("GV.OC-01", "Organisational mission", "GOVERN"),
  );
  const [errors, setErrors] = useState<string[]>([]),
    [notice, setNotice] = useState("");
  const profile = s.findings.filter((f) => f.framework === "nist-csf-2"),
    a = aggregate(profile, s.rubric.weighting),
    groups = csfFunctions.map((f) => {
      const g = a.groups.find((g) => g.group === f.title);
      return {
        label: f.id,
        current: g?.current ?? null,
        target: g?.target ?? null,
        count: g?.count ?? 0,
      };
    });
  const visibleControls = controls.filter(
    (c) =>
      c.framework === "nist-csf-2" &&
      c.path[0] === fn &&
      `${c.id} ${c.title} ${c.explanation}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const visibleFindings = matchingFindings(profile, filter);
  function selectProfile(label: string) {
    setFilter(label);
    const count = matchingFindings(profile, label).length;
    explain(
      metricInsight(
        label.replace("confidence:", "") + " profile records",
        `${count} matching source record(s) in this selected Profile. Unselected Core outcomes are separate.`,
        label.startsWith("confidence:")
          ? "Count applicable assessed outcomes with this learner confidence judgement. Confidence is separate from evidence verification."
          : maturityMethod,
        "Inspect the underlying records. Unknown and excluded records never silently enter assessed chart counts.",
        "control",
      ),
    );
  }
  const update = (patch: Partial<Finding>) => setDraft({ ...draft, ...patch });
  function commit() {
    if (!scopeValid) {
      setErrors([
        "Complete the mission, scope, stakeholders, tolerance and valid assessment period before recording outcomes.",
      ]);
      setStep(0);
      return;
    }
    const e = findingErrors({
      ...draft,
      periodStart: s.scope.periodStart,
      periodEnd: s.scope.periodEnd,
    });
    if (e.length) {
      setErrors(e);
      return;
    }
    setStudio((p) => ({
      ...p,
      findings: recordFinding(p.findings, draft, s.scope),
    }));
    setErrors([]);
    setNotice(
      "Profile outcome recorded. Proposed actions do not change these ratings.",
    );
  }
  function action(f: Finding) {
    if (f.taskId) {
      setNotice(
        "This gap already has a linked task. Open Implement to edit it.",
      );
      return;
    }
    const task = {
      ...newTask(`finding:${f.id}`, `Close ${f.controlId}: ${f.title}`),
      owner: f.owner,
      accountable: f.owner,
      effort: 16,
      duration: 2,
      deadline: s.scope.periodEnd,
    };
    setStudio((p) => ({
      ...p,
      tasks: [...p.tasks, task],
      findings: p.findings.map((x) =>
        x.id === f.id ? { ...x, taskId: task.id } : x,
      ),
    }));
    setNotice(
      "Remediation action created with an explicit 16-hour/two-day starting estimate. Review dates, resources and assumptions in Implement.",
    );
  }
  function choose(id: string) {
    const c = controls.find((c) => c.id === id)!;
    setDraft(
      profile.find((f) => f.controlId === id) ||
        newFinding(c.id, c.title, c.path[0]),
    );
    explain({
      ...metricInsight(
        c.id,
        c.explanation,
        c.methods,
        "Record implementation state, rating rationale and evidence separately. X1 maturity levels are educational and are not CSF Tiers.",
        "control",
      ),
      technical: c.implementation,
      business: c.risk,
      sources: [{ title: "NIST CSF 2.0", url: c.source }],
    });
  }
  const scopeValid =
    s.scope.mission.trim() &&
    s.scope.services.trim() &&
    s.scope.boundary.trim() &&
    s.scope.stakeholders.trim() &&
    s.scope.tolerance.trim() &&
    s.scope.periodStart <= s.scope.periodEnd;
  return (
    <>
      <Header
        eyebrow="ASSESS / GUIDED CURRENT & TARGET PROFILE"
        title="Understand your position. Plan your next move."
      >
        <p>
          Build a scoped, evidence-aware profile for {scenario.name}. Start with
          one outcome, then expand deliberately.
        </p>
      </Header>
      <div className="xa-segment xs-tabs">
        <button
          aria-pressed={mode === "Profile"}
          onClick={() => setMode("Profile")}
        >
          Current / Target Profile
        </button>
        <button
          aria-pressed={mode === "Tiers"}
          onClick={() => setMode("Tiers")}
        >
          Separate CSF Tier exercise
        </button>
      </div>
      {mode === "Tiers" ? (
        <Panel
          title="CSF Tiers: governance and management context"
          subtitle="SP 1302 · October 2024 · leadership judgement, not an arithmetic maturity score"
        >
          <p>
            Tiers describe the rigour of risk governance and management. Select
            the two components separately, explain your scope and identify the
            leadership decision. No overall Tier is calculated from outcome
            scores.
          </p>
          <div className="xa-grid two">
            {(["governance", "management"] as const).map((k) => (
              <Field key={k} label={`Current ${k} Tier`}>
                <select
                  value={s.tiers[k] ?? ""}
                  onChange={(e) =>
                    setStudio((p) => ({
                      ...p,
                      tiers: {
                        ...p.tiers,
                        [k]: e.target.value ? +e.target.value : null,
                      },
                    }))
                  }
                >
                  <option value="">Not assessed</option>
                  {["Partial", "Risk Informed", "Repeatable", "Adaptive"].map(
                    (v, i) => (
                      <option value={i + 1} key={v}>
                        Tier {i + 1} · {v}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            ))}
            <Field label="Target Tier for leadership review">
              <select
                value={s.tiers.target}
                onChange={(e) =>
                  setStudio((p) => ({
                    ...p,
                    tiers: { ...p.tiers, target: +e.target.value },
                  }))
                }
              >
                {["Partial", "Risk Informed", "Repeatable", "Adaptive"].map(
                  (v, i) => (
                    <option value={i + 1} key={v}>
                      Tier {i + 1} · {v}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Leadership decision owner">
              <input
                value={s.tiers.approver}
                maxLength={200}
                onChange={(e) =>
                  setStudio((p) => ({
                    ...p,
                    tiers: { ...p.tiers, approver: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
          <Field label="Tier rationale, scope and constraints">
            <textarea
              value={s.tiers.rationale}
              maxLength={4000}
              onChange={(e) =>
                setStudio((p) => ({
                  ...p,
                  tiers: { ...p.tiers, rationale: e.target.value },
                }))
              }
            />
          </Field>
          <p className="xs-notice">
            Partial: informal practices; Risk Informed: risk awareness guides
            some decisions; Repeatable: defined, consistently applied practices;
            Adaptive: learning and changing conditions inform adaptation. These
            are educational paraphrases; use the official descriptions for a
            formal organisational exercise.
          </p>
          <Source href="https://doi.org/10.6028/NIST.SP.1302">
            NIST SP 1302 — using the CSF Tiers
          </Source>
        </Panel>
      ) : (
        <>
          <Stepper
            steps={[
              "Frame scope",
              "Assess outcomes",
              "Review gaps",
              "Plan & report",
            ]}
            active={step}
            onSelect={setStep}
          />
          {step === 0 && (
            <Panel
              title="1. Define the assessment boundary"
              subtitle="Synthetic organisation · explicit business context"
            >
              <button
                onClick={() =>
                  setStudio((p) => ({
                    ...p,
                    scope: {
                      ...p.scope,
                      mission: `Maintain trusted ${scenario.process.toLowerCase()}.`,
                      services: scenario.process,
                      boundary: scenario.architecture,
                      stakeholders: `${scenario.owner}, security lead, risk owner, supplier and affected customers`,
                      tolerance: `Escalate ordinal residual indices above ${scenario.tolerance}; validate this fictional threshold with the risk owner.`,
                      informationTypes:
                        scenario.id === "paysecure"
                          ? "Payment and settlement information"
                          : scenario.id === "petroshield"
                            ? "Production monitoring and operational telemetry"
                            : "Production quality telemetry",
                      objective: `Maintain continuity and accountable operation of ${scenario.process.toLowerCase()}.`,
                    },
                  }))
                }
              >
                Use fictional case context
              </button>
              <div className="xa-grid two">
                {(
                  [
                    "mission",
                    "services",
                    "boundary",
                    "stakeholders",
                    "tolerance",
                    "informationTypes",
                  ] as const
                ).map((k) => (
                  <Field
                    key={k}
                    label={
                      {
                        mission: "Business mission",
                        services: "Critical services",
                        boundary: "System and organisational scope",
                        stakeholders: "Stakeholders and decision authority",
                        tolerance: "Risk tolerance and escalation",
                        informationTypes: "Information types",
                      }[k]
                    }
                  >
                    <textarea
                      value={s.scope[k]}
                      maxLength={4000}
                      onChange={(e) =>
                        setStudio((p) => ({
                          ...p,
                          scope: { ...p.scope, [k]: e.target.value },
                        }))
                      }
                    />
                  </Field>
                ))}
                <Field label="Assessment period start">
                  <input
                    type="date"
                    value={s.scope.periodStart}
                    onChange={(e) => {
                      if (e.target.value)
                        setStudio((p) => ({
                          ...p,
                          scope: { ...p.scope, periodStart: e.target.value },
                        }));
                    }}
                  />
                </Field>
                <Field label="Assessment period end">
                  <input
                    type="date"
                    value={s.scope.periodEnd}
                    onChange={(e) => {
                      if (e.target.value)
                        setStudio((p) => ({
                          ...p,
                          scope: { ...p.scope, periodEnd: e.target.value },
                        }));
                    }}
                  />
                </Field>
              </div>
              <button
                className="primary"
                onClick={() => {
                  if (!scopeValid) {
                    setErrors([
                      "Complete mission, services, scope, stakeholders and tolerance; period end must not precede start.",
                    ]);
                    return;
                  }
                  setErrors([]);
                  setStep(1);
                }}
              >
                Continue to outcome assessment <ArrowRight size={15} />
              </button>
              <details>
                <summary>Beginner walkthrough and knowledge check</summary>
                <p>
                  A profile is a map of what matters to your service, what is
                  currently achieved and what should improve. Like a building
                  inspection, scope defines which rooms and systems were
                  actually examined.
                </p>
                <ol>
                  <li>Identify the critical service and boundaries.</li>
                  <li>
                    Review one outcome using records and an owner interview.
                  </li>
                  <li>
                    Record what is known, what is untested and the desired
                    target.
                  </li>
                  <li>Create an action and a follow-up test.</li>
                </ol>
                <p>
                  Check: can a proposed access-control project prove an outcome
                  is achieved? No. Implementation and operating evidence must be
                  assessed after delivery.
                </p>
              </details>
            </Panel>
          )}
          {step === 1 && (
            <>
              <div className="xs-functions">
                {csfFunctions.map((f) => {
                  const count = profile.filter(
                    (p) => p.group === f.title,
                  ).length;
                  const position = aggregate(
                    profile.filter((p) => p.group === f.title),
                    s.rubric.weighting,
                  );
                  return (
                    <button
                      key={f.id}
                      aria-pressed={fn === f.title}
                      onClick={() => {
                        setFn(f.title);
                        const c = controls.find(
                          (c) =>
                            c.framework === "nist-csf-2" &&
                            c.path[0] === f.title,
                        )!;
                        choose(c.id);
                      }}
                    >
                      <span>{f.id}</span>
                      <strong>{f.title}</strong>
                      <small>{count} profile records</small>
                      <small>
                        {position.current === null
                          ? "Unassessed"
                          : `${position.current.toFixed(1)} → ${position.target!.toFixed(1)} · X1 scale`}
                      </small>
                    </button>
                  );
                })}
              </div>
              <div className="xa-toolbar">
                <Field label="Search CSF outcomes">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Field>
                <Field label="CSF outcome">
                  <select
                    value={
                      visibleControls.some((c) => c.id === draft.controlId)
                        ? draft.controlId
                        : ""
                    }
                    onChange={(e) => choose(e.target.value)}
                  >
                    <option value="">Choose outcome</option>
                    {visibleControls.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} · {c.path[1]} · {c.title}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Panel
                title={`${draft.controlId} · ${draft.title}`}
                subtitle="Authoritative outcome and educational interpretation are kept distinct"
              >
                <p>
                  {controls.find((c) => c.id === draft.controlId)?.explanation}
                </p>
                <details>
                  <summary>
                    Implementation examples & potential evidence
                  </summary>
                  <p>
                    {
                      controls.find((c) => c.id === draft.controlId)
                        ?.implementation
                    }
                  </p>
                  <p>
                    Educational evidence prompts:{" "}
                    {controls.find((c) => c.id === draft.controlId)?.evidence}.
                    Record scope, population, period and exceptions.
                  </p>
                  <Source href="https://doi.org/10.6028/NIST.CSWP.29">
                    Authoritative NIST outcome
                  </Source>
                </details>
                <div className="xa-grid two">
                  <Field label="Outcome applicability">
                    <select
                      value={draft.applicability}
                      onChange={(e) =>
                        update({
                          applicability: e.target
                            .value as Finding["applicability"],
                        })
                      }
                    >
                      <option>Applicable</option>
                      <option>Excluded</option>
                    </select>
                  </Field>
                  <Field label="Accountable assessment owner">
                    <input
                      value={draft.owner}
                      maxLength={200}
                      onChange={(e) => update({ owner: e.target.value })}
                    />
                  </Field>
                </div>
                {draft.applicability === "Excluded" ? (
                  <Field label="Exclusion justification">
                    <textarea
                      value={draft.exclusion}
                      maxLength={4000}
                      onChange={(e) => update({ exclusion: e.target.value })}
                    />
                  </Field>
                ) : (
                  <>
                    <div className="xa-grid two">
                      <Field label="Current state narrative">
                        <textarea
                          value={draft.currentState}
                          maxLength={4000}
                          onChange={(e) =>
                            update({ currentState: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Target outcome narrative">
                        <textarea
                          value={draft.targetState}
                          maxLength={4000}
                          onChange={(e) =>
                            update({ targetState: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Current X1 maturity level">
                        <select
                          value={draft.current ?? ""}
                          onChange={(e) =>
                            update({
                              current:
                                e.target.value === "" ? null : +e.target.value,
                            })
                          }
                        >
                          <option value="">Unassessed</option>
                          {s.rubric.labels.map((l, i) => (
                            <option value={i} key={i}>
                              {i} · {l}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Target X1 maturity level">
                        <select
                          value={draft.target}
                          onChange={(e) => update({ target: +e.target.value })}
                        >
                          {s.rubric.labels.map((l, i) => (
                            <option value={i} key={i}>
                              {i} · {l}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Evidence verification status">
                        <select
                          value={draft.verification}
                          onChange={(e) =>
                            update({
                              verification: e.target
                                .value as Finding["verification"],
                            })
                          }
                        >
                          {evidenceStates.map((v) => (
                            <option key={v} value={v}>
                              {v.startsWith("confidence:")
                                ? v.slice(11) + " confidence"
                                : v}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Evidence reference">
                        <input
                          value={draft.evidence}
                          maxLength={4000}
                          onChange={(e) => update({ evidence: e.target.value })}
                        />
                      </Field>
                      <Field label="Evidence reviewer">
                        <input
                          value={draft.reviewer}
                          maxLength={200}
                          onChange={(e) => update({ reviewer: e.target.value })}
                        />
                      </Field>
                      <Field label="Assessment confidence">
                        <select
                          value={draft.confidence}
                          onChange={(e) =>
                            update({
                              confidence: e.target
                                .value as Finding["confidence"],
                            })
                          }
                        >
                          {["Low", "Medium", "High"].map((v) => (
                            <option key={v} value={v}>
                              {v.startsWith("confidence:")
                                ? v.slice(11) + " confidence"
                                : v}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Risk priority (1 low to 5 urgent)">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={draft.priority}
                          onChange={(e) =>
                            update({ priority: +e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Aggregation weight (1–5)">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={draft.weight}
                          onChange={(e) => update({ weight: +e.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="Rating rationale and assessment limitations">
                      <textarea
                        value={draft.rationale}
                        maxLength={4000}
                        onChange={(e) => update({ rationale: e.target.value })}
                      />
                    </Field>
                  </>
                )}
                <Method>{maturityMethod}</Method>
                <div className="xa-actions">
                  <button className="primary" onClick={commit}>
                    <Check size={15} />
                    Record profile outcome
                  </button>
                  <button onClick={() => setStep(2)}>
                    Review recorded gaps
                  </button>
                </div>
              </Panel>
            </>
          )}
          {step === 2 && (
            <>
              <div className="xa-kpi-grid">
                <Kpi
                  label="Profile outcomes"
                  value={profile.length}
                  detail={`${106 - new Set(profile.map((f) => f.controlId)).size} Core outcomes not yet added`}
                  onClick={() => selectProfile("All")}
                />
                <Kpi
                  label="Assessed / unassessed"
                  value={`${a.assessed} / ${a.unassessed}`}
                  detail={`${a.excluded} justified exclusions`}
                  onClick={() =>
                    explain(
                      metricInsight(
                        "Eligible assessment records",
                        "Explicit zero is assessed; missing levels remain unassessed.",
                        maturityMethod,
                        "The profile is the declared selected population; unselected Core outcomes are not silently assigned zero.",
                        "control",
                      ),
                    )
                  }
                />
                <Kpi
                  label="Current → target"
                  value={`${a.current?.toFixed(1) ?? "—"} → ${a.target?.toFixed(1) ?? "—"}`}
                  detail="X1 educational scale 0–4"
                  onClick={() =>
                    explain(
                      metricInsight(
                        "Current versus target",
                        maturityMethod,
                        maturityMethod,
                        "A gap prioritises investigation and action; it is not a compliance result.",
                        "control",
                      ),
                    )
                  }
                />
                <Kpi
                  label="Priority gaps"
                  value={a.gaps.length}
                  detail="Eligible current level below target"
                  tone="amber"
                  onClick={() => selectProfile("Gaps")}
                />
              </div>
              <div className="xa-grid two">
                <Panel
                  title="Current / target by Function"
                  subtitle="Only eligible profile records contribute"
                >
                  <Radar
                    items={groups}
                    onSelect={(id) =>
                      selectProfile(
                        csfFunctions.find((f) => f.id === id)!.title,
                      )
                    }
                  />
                </Panel>
                <Panel
                  title="Evidence-confidence position"
                  subtitle="Recorded verification state, not a claim by X1"
                >
                  <Donut
                    label="assessed records"
                    segments={evidenceStates.map((label, i) => ({
                      label,
                      value: a.evidence[label],
                      color: [
                        palette.Unassessed,
                        palette.Gaps,
                        palette.Neutral,
                        palette.Evidenced,
                      ][i],
                    }))}
                    onSelect={selectProfile}
                  />
                  <Bars
                    items={["Low", "Medium", "High"].map((label) => ({
                      label,
                      value: profile.filter(
                        (f) =>
                          f.applicability === "Applicable" &&
                          f.confidence === label &&
                          f.current !== null,
                      ).length,
                    }))}
                    onSelect={(label) => selectProfile(`confidence:${label}`)}
                  />
                </Panel>
              </div>
              <Method>{maturityMethod}</Method>
              <Panel
                title="Gap and decision register"
                subtitle="Select a record to revise it; create an action explicitly"
              >
                <div className="xa-toolbar">
                  <Field label="Profile chart filter">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      {[
                        "All",
                        "Assessed",
                        "Unassessed",
                        "confidence:Low",
                        "confidence:Medium",
                        "confidence:High",
                        "Gaps",
                        ...csfFunctions.map((f) => f.title),
                        ...evidenceStates,
                      ].map((v) => (
                        <option key={v} value={v}>
                          {v.startsWith("confidence:")
                            ? v.slice(11) + " confidence"
                            : v}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button onClick={() => selectProfile("All")}>
                    Clear profile filter
                  </button>
                </div>
                <p>
                  <Link to={`${base}/labs/risk-decision`}>
                    Create or review a risk in the register →
                  </Link>{" "}
                  Return here to link the saved risk; ratings are assessed
                  separately.
                </p>
                <div className="xa-table-scroll">
                  <table>
                    <caption>
                      Declared CSF Current and Target Profile records
                    </caption>
                    <thead>
                      <tr>
                        <th>Outcome / priority</th>
                        <th>Current / target</th>
                        <th>Evidence / confidence</th>
                        <th>Risk relationship</th>
                        <th>Remediation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleFindings.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <button
                              className="xa-text-button"
                              onClick={() => {
                                setDraft(f);
                                setStep(1);
                                setFn(f.group);
                              }}
                            >
                              {f.controlId}
                            </button>
                            <p>{f.title}</p>
                            <small>
                              Priority {f.priority} · {f.owner}
                            </small>
                          </td>
                          <td>
                            {f.applicability === "Excluded"
                              ? "Excluded"
                              : `${f.current ?? "Unassessed"} → ${f.target}`}
                          </td>
                          <td>
                            {f.verification}
                            <p>{f.confidence} confidence</p>
                          </td>
                          <td>
                            <select
                              aria-label={`Linked risk for ${f.controlId}`}
                              value={f.riskId}
                              onChange={(e) =>
                                setStudio((p) => ({
                                  ...p,
                                  findings: p.findings.map((x) =>
                                    x.id === f.id
                                      ? { ...x, riskId: e.target.value }
                                      : x,
                                  ),
                                }))
                              }
                            >
                              <option value="">No linked risk</option>
                              {w.rows.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.id} · {r.asset}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              disabled={!!f.taskId}
                              onClick={() => action(f)}
                            >
                              {f.taskId
                                ? "Action linked"
                                : "Create remediation action"}
                            </button>
                            {f.taskId && (
                              <Link to={`${base}/implement?task=${f.taskId}`}>
                                Open action →
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!visibleFindings.length && (
                    <Empty title="No profile records in this view">
                      Assess an outcome, or clear the chart filter. Nothing is
                      inferred from an empty profile.
                    </Empty>
                  )}
                </div>
                <button className="primary" onClick={() => setStep(3)}>
                  Continue to plan & report
                </button>
              </Panel>
            </>
          )}
          {step === 3 && (
            <Panel
              title="4. Implement, validate and communicate"
              subtitle="Your assessments stay independent of proposed actions"
            >
              <p>
                {profile.length} profile record(s), {a.gaps.length} eligible
                gaps and{" "}
                {
                  s.tasks.filter((t) =>
                    t.sourceIds.some((id) =>
                      profile.some((f) => id === `finding:${f.id}`),
                    ),
                  ).length
                }{" "}
                linked action(s).
              </p>
              <div className="xa-actions">
                <Link className="xa-button primary" to={`${base}/implement`}>
                  Open Implementation Studio →
                </Link>
                <Link className="xa-button" to={`${base}/report`}>
                  Generate improvement report →
                </Link>
                <button
                  onClick={() =>
                    download(
                      "x1-csf-current-target-profile.json",
                      JSON.stringify(
                        {
                          framework: "NIST CSF 2.0",
                          scope: s.scope,
                          profile,
                          tiers: s.tiers,
                          maturityMethod,
                          counts: {
                            assessed: a.assessed,
                            unassessed: a.unassessed,
                            excluded: a.excluded,
                          },
                          limitations:
                            "Selected Current/Target Profile and X1 educational ratings. No certification or overall NIST maturity score.",
                        },
                        null,
                        2,
                      ),
                      "application/json",
                    )
                  }
                >
                  Export complete selected profile
                </button>
              </div>
              <button
                disabled={!profile.length}
                onClick={() =>
                  setStudio((p) => ({
                    ...p,
                    completedSimulations: [
                      ...new Set([...p.completedSimulations, "csf-profile"]),
                    ],
                  }))
                }
              >
                Mark CSF exercise complete
              </button>
              <p>
                Save or export your project using Project recovery above before
                refreshing. Return to the profile after implementation to
                reassess outcomes and evidence; completing a task does not
                change your rating.
              </p>
            </Panel>
          )}
        </>
      )}
      {!!errors.length && (
        <div role="alert" className="xa-feedback">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
      <p role="status">{notice}</p>
      <details className="xs-method">
        <summary>Configure X1 Educational Maturity Model v1</summary>
        <p>
          The 0–4 range is fixed in version X1-EMM-1; labels and weighting are
          explicit project settings. Exported projects retain them. This is not
          an official standard grading model.
        </p>
        <Field label="Maturity weighting">
          <select
            value={s.rubric.weighting}
            onChange={(e) =>
              setStudio((p) => ({
                ...p,
                rubric: {
                  ...p.rubric,
                  weighting: e.target.value as "Equal" | "Priority-weighted",
                },
              }))
            }
          >
            <option>Equal</option>
            <option>Priority-weighted</option>
          </select>
        </Field>
        {s.rubric.labels.map((label, i) => (
          <Field key={i} label={`Level ${i} definition`}>
            <input
              value={label}
              maxLength={240}
              onChange={(e) =>
                setStudio((p) => ({
                  ...p,
                  rubric: {
                    ...p.rubric,
                    labels: p.rubric.labels.map((v, j) =>
                      j === i ? e.target.value : v,
                    ),
                  },
                }))
              }
            />
          </Field>
        ))}
      </details>
      <Source href="https://doi.org/10.6028/NIST.CSWP.29">NIST CSF 2.0</Source>
    </>
  );
}
