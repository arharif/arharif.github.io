import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base, Header, Field, download } from "../components/shared";
import { useScenario } from "../app/context";
import { useWorkspace, useLabState } from "../workspace/state";
import {
  stages,
  newTask,
  newId,
  taskSchema,
  isoDate,
  type Task,
} from "./model";
import { schedule, validateTask, referenceErrors } from "./engines";
import { standards } from "./standards";
import { generateImplementation } from "./planning";
import { csv } from "../utils/engines";
import { Panel, Method, Empty } from "./visuals";
import { Bars, Kpi, ProgressBar } from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
import Gantt from "./Gantt";
export default function ImplementationStudio() {
  const { studio: s, setStudio } = useWorkspace(),
    scenario = useScenario(),
    { explain } = useInsight(),
    [params] = useSearchParams(),
    [draft, setDraft] = useLabState<Task | null>(
      "implementation",
      "draft",
      null,
    ),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [view, setView] = useState("Plan");
  const [holidays, setHolidays] = useLabState(
    "implementation",
    "holidays",
    s.calendar.holidays.join(", "),
  );
  const [raid, setRaid] = useLabState("implementation", "raid", {
    type: "Risk" as "Risk" | "Assumption" | "Issue" | "Dependency",
    description: "",
    owner: "",
    action: "",
  });
  const { plan, planError } = useMemo(() => {
    try {
      return {
        plan: schedule(s.tasks, s.resources, s.scope.start, s.calendar),
        planError: "",
      };
    } catch (e) {
      return {
        plan: null,
        planError: e instanceof Error ? e.message : "Invalid plan.",
      };
    }
  }, [s.tasks, s.resources, s.scope.start, s.calendar]);
  useEffect(() => {
    const task = params.get("task");
    if (task) {
      const t = s.tasks.find((t) => t.id === task);
      if (t) setDraft({ ...t });
    }
    const standard = standards.find((x) => x.id === params.get("standard"));
    if (standard)
      setStudio((p) => ({
        ...p,
        framework: standard.id,
        edition: standard.edition,
      }));
  }, [params]);
  function patch(value: Partial<Task>) {
    if (draft) setDraft({ ...draft, ...value });
  }
  function choose(id: string) {
    const t = s.tasks.find((t) => t.id === id);
    if (!t) return;
    setDraft({ ...t });
    explain({
      ...metricInsight(
        t.title,
        `Stage ${t.stage}; responsible ${t.owner || "unassigned"}; accountable ${t.accountable || "unassigned"}.`,
        plan?.method ||
          "Correct the dependency/calendar errors before relying on dates.",
        "Implementation progress and validation are separate. A completed action never silently changes a risk or maturity score.",
      ),
      technical: `Source links: ${t.sourceIds.join(", ")}`,
      actions: [
        "Review dependencies and available resource capacity.",
        "Record a dated implementation milestone.",
        "Attach test evidence and reviewer before marking validated.",
      ],
    });
  }
  function generate() {
    try {
      const project = generateImplementation(s, scenario);
      setStudio(project);
      setError("");
      setMessage(
        project === s
          ? "This project already contains the generated lifecycle. Edit its existing tasks."
          : "Framework-specific implementation project generated with architecture tasks, linked assessment gaps and two approval milestones. Review every estimate, dependency and owner.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not generate this project.",
      );
    }
  }
  const baselineCost = s.baseline.reduce((n, b) => n + b.cost, 0),
    done = s.tasks.filter((t) => t.progress === 100).length;
  return (
    <>
      <Header
        eyebrow="IMPLEMENT / STANDARDS IMPLEMENTATION STUDIO"
        title="Turn a gap into a deliverable plan."
      >
        <p>
          Scope, RACI, dependencies, working calendars and validation belong
          together. Every action retains its requirement, finding or objective
          trace.
        </p>
      </Header>
      <div className="xa-toolbar">
        <Field label="Implementation standard">
          <select
            value={s.framework}
            onChange={(e) => {
              const std = standards.find((x) => x.id === e.target.value)!;
              setStudio((p) => ({
                ...p,
                framework: std.id,
                edition: std.edition,
              }));
            }}
          >
            {standards.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} · {x.edition}
              </option>
            ))}
          </select>
        </Field>
        <button className="primary" onClick={generate}>
          Generate seven-stage project
        </button>
        <button onClick={() => setDraft(newTask())}>
          Add implementation task
        </button>
      </div>
      <div className="xa-segment xs-tabs">
        {["Plan", "Tasks & RACI", "RAID & assurance"].map((v) => (
          <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
            {v}
          </button>
        ))}
      </div>
      <div className="xa-kpi-grid">
        <Kpi
          label="Planned effort"
          value={s.tasks.reduce((n, t) => n + t.effort, 0)}
          detail="Entered work hours"
          onClick={() =>
            explain(
              metricInsight(
                "Planned effort",
                "Sum of task work-hour estimates.",
                "Σ entered effort hours. Zero-effort milestones do not consume capacity.",
                "These are editable fictional estimates, not measured costs or supplier commitments.",
              ),
            )
          }
        />
        <Kpi
          label="Estimated cost"
          value={plan ? plan.cost.toLocaleString() : "—"}
          detail={s.currency}
          onClick={() =>
            explain(
              metricInsight(
                "Estimated programme cost",
                "Entered task effort multiplied by configured resource rates.",
                "Σ(task effort × assigned hourly rate). No supplier quote or currency conversion.",
                "Validate rates, tax/contingency and delivery uncertainty before committing real funds.",
              ),
            )
          }
        />
        <Kpi
          label="Implemented / validated"
          value={`${done} / ${s.tasks.filter((t) => t.status === "Validated").length}`}
          detail={`${s.tasks.length} tasks incl. milestones`}
          onClick={() => setView("Tasks & RACI")}
        />
        <Kpi
          label="Late / resource delayed"
          value={`${plan?.rows.filter((r) => r.late).length ?? "—"} / ${plan?.rows.filter((r) => r.resourceDelay > 0).length ?? "—"}`}
          detail="Compared with entered deadlines"
          tone="amber"
          onClick={() => setView("Plan")}
        />
      </div>
      {view === "Plan" && (
        <>
          <Panel
            title="Planning assumptions & resource calendar"
            subtitle="UTC dates · explicit resources · no hidden parallel-capacity assumption"
          >
            <div className="xa-grid">
              <Field label="Project start date">
                <input
                  type="date"
                  value={s.scope.start}
                  onChange={(e) => {
                    if (e.target.value)
                      setStudio((p) => ({
                        ...p,
                        scope: { ...p.scope, start: e.target.value },
                      }));
                  }}
                />
              </Field>
              <Field label="Planning budget">
                <input
                  type="number"
                  min="0"
                  value={s.budget}
                  onChange={(e) =>
                    setStudio((p) => ({
                      ...p,
                      budget: Math.max(0, +e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Currency or fictional unit label">
                <input
                  maxLength={240}
                  value={s.currency}
                  onChange={(e) =>
                    setStudio((p) => ({ ...p, currency: e.target.value }))
                  }
                />
              </Field>
            </div>
            <details className="xs-method">
              <summary>
                Working calendar, resource capacity and rate estimates
              </summary>
              <div className="xs-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, i) => (
                    <label className="xa-check" key={day}>
                      <input
                        type="checkbox"
                        checked={s.calendar.weekdays.includes(i)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...s.calendar.weekdays, i]
                            : s.calendar.weekdays.filter((n) => n !== i);
                          if (next.length)
                            setStudio((p) => ({
                              ...p,
                              calendar: { ...p.calendar, weekdays: next },
                            }));
                          else
                            setError(
                              "At least one working weekday is required.",
                            );
                        }}
                      />
                      {day}
                    </label>
                  ),
                )}
              </div>
              <Field label="Non-working holidays (YYYY-MM-DD, comma separated)">
                <input
                  value={holidays}
                  onChange={(e) => setHolidays(e.target.value)}
                  placeholder="2026-12-25, 2027-01-01"
                />
              </Field>
              <button
                onClick={() => {
                  const dates = holidays
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  if (!dates.every((d) => isoDate.safeParse(d).success)) {
                    setError("Use valid YYYY-MM-DD holiday dates.");
                    return;
                  }
                  setStudio((p) => ({
                    ...p,
                    calendar: { ...p.calendar, holidays: [...new Set(dates)] },
                  }));
                  setError("");
                  setMessage("Working calendar holidays applied.");
                }}
              >
                Apply working calendar
              </button>
              <div className="xa-table-scroll">
                <table>
                  <caption>
                    Resource capacities and explicitly estimated hourly rates
                  </caption>
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Hours / workday</th>
                      <th>Estimated rate / hour</th>
                      <th>Rule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.resources.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <input
                            aria-label={`Resource name ${r.id}`}
                            value={r.name}
                            maxLength={240}
                            onChange={(e) =>
                              setStudio((p) => ({
                                ...p,
                                resources: p.resources.map((x) =>
                                  x.id === r.id
                                    ? { ...x, name: e.target.value }
                                    : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={`Daily capacity ${r.id}`}
                            type="number"
                            min="0.5"
                            max="24"
                            step="0.5"
                            value={r.hoursPerDay}
                            onChange={(e) =>
                              setStudio((p) => ({
                                ...p,
                                resources: p.resources.map((x) =>
                                  x.id === r.id
                                    ? { ...x, hoursPerDay: +e.target.value }
                                    : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={`Hourly rate ${r.id}`}
                            type="number"
                            min="0"
                            value={r.rate}
                            onChange={(e) =>
                              setStudio((p) => ({
                                ...p,
                                resources: p.resources.map((x) =>
                                  x.id === r.id
                                    ? { ...x, rate: +e.target.value }
                                    : x,
                                ),
                              }))
                            }
                          />
                        </td>
                        <td>One task at a time</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() =>
                  setStudio((p) => ({
                    ...p,
                    resources: [
                      ...p.resources,
                      {
                        id: newId("resource"),
                        name: "New fictional resource",
                        hoursPerDay: 8,
                        rate: 100,
                      },
                    ],
                  }))
                }
              >
                Add resource estimate
              </button>
            </details>
            <p className="xs-notice">
              Budget position:{" "}
              {plan
                ? `${(s.budget - plan.cost).toLocaleString()} ${s.currency} remaining`
                : "unknown until schedule is valid"}
              . Rates and effort are learner estimates. Dependencies and
              resource availability can delay delivery.
            </p>
          </Panel>
          <Panel
            title="Implementation Gantt"
            subtitle={
              plan
                ? `${s.tasks.length} tasks · finish ${plan.finish}`
                : "Resolve schedule errors before relying on dates"
            }
            action={
              <button
                disabled={!plan || !s.tasks.length}
                onClick={() => {
                  if (plan)
                    setStudio((p) => ({
                      ...p,
                      baseline: plan!.rows.map((r) => ({
                        id: r.task.id,
                        start: r.start,
                        end: r.end,
                        cost: r.cost,
                      })),
                    }));
                  setMessage(
                    "Schedule/cost baseline captured. Future edits do not overwrite it.",
                  );
                }}
              >
                Capture plan baseline
              </button>
            }
          >
            {plan ? (
              <Gantt plan={plan} onSelect={choose} />
            ) : (
              <p role="alert">{planError}</p>
            )}
            {!!s.baseline.length && (
              <p>
                Baseline estimate {baselineCost.toLocaleString()} {s.currency};
                current difference{" "}
                {plan
                  ? `${(plan.cost - baselineCost).toLocaleString()} ${s.currency}`
                  : "unknown"}
                .
              </p>
            )}
          </Panel>
          {plan && (
            <Panel
              title="Schedule, milestones & baseline comparison"
              subtitle="Exact dates and dependency-derived critical status"
            >
              <div className="xa-table-scroll">
                <table>
                  <caption>Resource-levelled working-calendar schedule</caption>
                  <thead>
                    <tr>
                      <th>Task / stage</th>
                      <th>Start → finish</th>
                      <th>Dependency / resource delay</th>
                      <th>Baseline finish</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rows.map((r) => (
                      <tr key={r.task.id}>
                        <td>
                          <button
                            className="xa-text-button"
                            onClick={() => choose(r.task.id)}
                          >
                            {r.task.title}
                          </button>
                          <p>
                            {r.task.stage}
                            {r.task.milestone ? " · milestone" : ""}
                            {r.critical ? " · dependency-critical" : ""}
                          </p>
                        </td>
                        <td>
                          {r.start} → {r.end}
                        </td>
                        <td>
                          {r.task.dependencies
                            .map(
                              (id) =>
                                s.tasks.find((t) => t.id === id)?.title || id,
                            )
                            .join("; ") || "None"}
                          <p>{r.resourceDelay} calendar-day resource delay</p>
                        </td>
                        <td>
                          {s.baseline.find((b) => b.id === r.task.id)?.end ||
                            "Not baselined"}
                        </td>
                        <td>
                          {r.task.deadline || "Not set"}
                          {r.late ? " · Late" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Method>{plan.method}</Method>
            </Panel>
          )}
        </>
      )}
      {draft && (
        <Panel
          title="Implementation task editor"
          subtitle="Edits remain a draft until recorded; validation remains separate"
        >
          <div className="xa-grid two">
            <Field label="Implementation task title">
              <input
                value={draft.title}
                maxLength={240}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </Field>
            <Field label="Implementation stage">
              <select
                value={draft.stage}
                onChange={(e) =>
                  patch({ stage: e.target.value as Task["stage"] })
                }
              >
                {stages.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Responsible owner">
              <input
                value={draft.owner}
                maxLength={240}
                onChange={(e) => patch({ owner: e.target.value })}
              />
            </Field>
            <Field label="Accountable role">
              <input
                value={draft.accountable}
                maxLength={240}
                onChange={(e) => patch({ accountable: e.target.value })}
              />
            </Field>
            <Field label="Consulted roles">
              <input
                value={draft.consulted}
                maxLength={240}
                onChange={(e) => patch({ consulted: e.target.value })}
              />
            </Field>
            <Field label="Informed roles">
              <input
                value={draft.informed}
                maxLength={240}
                onChange={(e) => patch({ informed: e.target.value })}
              />
            </Field>
            <Field label="Assigned resource">
              <select
                value={draft.resourceId}
                onChange={(e) => patch({ resourceId: e.target.value })}
              >
                {s.resources.map((r) => (
                  <option value={r.id} key={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estimated effort hours">
              <input
                type="number"
                min="0"
                max="10000"
                value={draft.effort}
                disabled={draft.milestone}
                onChange={(e) => patch({ effort: +e.target.value })}
              />
            </Field>
            <Field label="Entered working-day duration">
              <input
                type="number"
                min={draft.milestone ? 0 : 1}
                max="730"
                value={draft.duration}
                disabled={draft.milestone}
                onChange={(e) => patch({ duration: +e.target.value })}
              />
            </Field>
            <Field label="Earliest requested start">
              <input
                type="date"
                value={draft.requestedStart}
                onChange={(e) => patch({ requestedStart: e.target.value })}
              />
            </Field>
            <Field label="Target deadline">
              <input
                type="date"
                value={draft.deadline}
                onChange={(e) => patch({ deadline: e.target.value })}
              />
            </Field>
            <Field label="Task status">
              <select
                value={draft.status}
                onChange={(e) =>
                  patch({ status: e.target.value as Task["status"] })
                }
              >
                {[
                  "Planned",
                  "In progress",
                  "Blocked",
                  "Implemented",
                  "Validated",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Implementation progress (0–100)">
              <input
                type="number"
                min="0"
                max="100"
                value={draft.progress}
                onChange={(e) => patch({ progress: +e.target.value })}
              />
            </Field>
            <Field label="Validation result">
              <select
                value={draft.validation}
                onChange={(e) =>
                  patch({ validation: e.target.value as Task["validation"] })
                }
              >
                {["Not tested", "Failed", "Passed"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Validation reviewer">
              <input
                value={draft.reviewer}
                maxLength={240}
                onChange={(e) => patch({ reviewer: e.target.value })}
              />
            </Field>
            <Field label="Validation evidence reference">
              <input
                value={draft.evidence}
                maxLength={4000}
                onChange={(e) => patch({ evidence: e.target.value })}
              />
            </Field>
          </div>
          <label className="xa-check">
            <input
              type="checkbox"
              checked={draft.milestone}
              onChange={(e) =>
                patch({
                  milestone: e.target.checked,
                  effort: e.target.checked ? 0 : 8,
                  duration: e.target.checked ? 0 : 1,
                })
              }
            />
            Zero-effort approval milestone
          </label>
          <Field label="Requirement, finding or objective source IDs (comma separated)">
            <input
              value={draft.sourceIds.join(",")}
              maxLength={4000}
              onChange={(e) =>
                patch({
                  sourceIds: e.target.value.split(","),
                })
              }
              onBlur={() =>
                patch({
                  sourceIds: draft.sourceIds
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <details>
            <summary>Finish-to-start dependencies</summary>
            {s.tasks
              .filter((t) => t.id !== draft.id)
              .map((t) => (
                <label className="xa-check" key={t.id}>
                  <input
                    type="checkbox"
                    checked={draft.dependencies.includes(t.id)}
                    onChange={(e) =>
                      patch({
                        dependencies: e.target.checked
                          ? [...draft.dependencies, t.id]
                          : draft.dependencies.filter((id) => id !== t.id),
                      })
                    }
                  />
                  {t.title}
                </label>
              ))}
            {s.tasks.length === 0 && (
              <p>Create another task before selecting a dependency.</p>
            )}
          </details>
          <div className="xa-actions">
            <button
              className="primary"
              onClick={() => {
                const parsed = taskSchema.safeParse(draft);
                const errors = parsed.success
                  ? validateTask(draft)
                  : parsed.error.issues.map(
                      (i) => i.path.join(".") + ": " + i.message,
                    );
                if (errors.length) {
                  setError(errors.join(" "));
                  return;
                }
                const tasks = s.tasks.some((t) => t.id === draft.id)
                  ? s.tasks.map((t) => (t.id === draft.id ? draft : t))
                  : [...s.tasks, draft];
                const refs = referenceErrors({ ...s, tasks });
                if (refs.length) {
                  setError(refs.join(" "));
                  return;
                }
                try {
                  schedule(tasks, s.resources, s.scope.start, s.calendar);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Invalid schedule");
                  return;
                }
                setStudio((p) => ({ ...p, tasks }));
                setDraft(null);
                setError("");
                setMessage(
                  "Task recorded; schedule and reports recalculate from the saved task data.",
                );
              }}
            >
              Record implementation task
            </button>
            <button onClick={() => setDraft(null)}>Close task draft</button>
          </div>
        </Panel>
      )}
      {view === "Tasks & RACI" && (
        <Panel
          title="Work breakdown, RACI and POA&M"
          subtitle="Each record traces to a requirement, finding, privacy risk or business objective"
        >
          <div className="xa-table-scroll">
            <table>
              <caption>
                Detailed implementation / remediation task register
              </caption>
              <thead>
                <tr>
                  <th>Stage / task / source</th>
                  <th>R / A</th>
                  <th>C / I</th>
                  <th>Progress / validation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {s.tasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <button
                        className="xa-text-button"
                        onClick={() => choose(t.id)}
                      >
                        {t.title}
                      </button>
                      <p>{t.stage}</p>
                      <small>{t.sourceIds.join(", ")}</small>
                    </td>
                    <td>
                      {t.owner || "Unassigned"} /{" "}
                      {t.accountable || "Unassigned"}
                    </td>
                    <td>
                      {t.consulted || "Not set"} / {t.informed || "Not set"}
                    </td>
                    <td>
                      <ProgressBar
                        value={t.progress}
                        label={`${t.title} implementation progress`}
                      />
                      {t.progress}% · {t.status}
                      <p>{t.validation}</p>
                    </td>
                    <td>
                      <button onClick={() => choose(t.id)}>Edit task</button>
                      <button
                        onClick={() => {
                          if (
                            s.tasks.some((x) =>
                              x.dependencies.includes(t.id),
                            ) ||
                            s.findings.some((f) => f.taskId === t.id) ||
                            s.privacyRisks.some((r) => r.taskId === t.id)
                          ) {
                            setError(
                              "Task is linked by dependencies/findings. Retarget those links before deleting.",
                            );
                            return;
                          }
                          setStudio((p) => ({
                            ...p,
                            tasks: p.tasks.filter((x) => x.id !== t.id),
                          }));
                        }}
                      >
                        Delete unlinked task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!s.tasks.length && (
            <Empty title="No implementation tasks yet">
              Create an action from a finding, or generate the seven-stage
              lifecycle and review its assumptions.
            </Empty>
          )}
        </Panel>
      )}
      {view === "RAID & assurance" && (
        <>
          <Panel
            title="RAID: risks, assumptions, issues and dependencies"
            subtitle="Management context is editable and separate from risk scoring"
          >
            <div className="xa-grid two">
              <Field label="RAID record type">
                <select
                  value={raid.type}
                  onChange={(e) =>
                    setRaid({
                      ...raid,
                      type: e.target.value as typeof raid.type,
                    })
                  }
                >
                  {["Risk", "Assumption", "Issue", "Dependency"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="RAID owner">
                <input
                  value={raid.owner}
                  maxLength={240}
                  onChange={(e) => setRaid({ ...raid, owner: e.target.value })}
                />
              </Field>
              <Field label="RAID description">
                <textarea
                  value={raid.description}
                  maxLength={4000}
                  onChange={(e) =>
                    setRaid({ ...raid, description: e.target.value })
                  }
                />
              </Field>
              <Field label="RAID response / review action">
                <textarea
                  value={raid.action}
                  maxLength={4000}
                  onChange={(e) => setRaid({ ...raid, action: e.target.value })}
                />
              </Field>
            </div>
            <button
              onClick={() => {
                if (!raid.description.trim() || !raid.owner.trim()) {
                  setError("RAID description and owner are required.");
                  return;
                }
                setStudio((p) => ({
                  ...p,
                  raid: [...p.raid, { id: newId("raid"), ...raid }],
                }));
                setRaid({
                  type: "Risk",
                  description: "",
                  owner: "",
                  action: "",
                });
                setError("");
              }}
            >
              Record RAID item
            </button>
            <div className="xa-table-scroll">
              <table>
                <caption>RAID register</caption>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Owner</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {s.raid.map((r) => (
                    <tr key={r.id}>
                      <td>{r.type}</td>
                      <td>{r.description}</td>
                      <td>{r.owner}</td>
                      <td>{r.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel
            title="Evidence requests and control validation plan"
            subtitle="Implementation progress is not operating effectiveness"
          >
            <div className="xa-table-scroll">
              <table>
                <caption>Finding-linked evidence requests</caption>
                <thead>
                  <tr>
                    <th>Requirement / gap</th>
                    <th>Evidence reference</th>
                    <th>Current verification</th>
                    <th>Owner / follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {s.findings.map((f) => (
                    <tr key={f.id}>
                      <td>
                        {f.framework} · {f.controlId}
                      </td>
                      <td>{f.evidence || "Evidence request required"}</td>
                      <td>{f.verification}</td>
                      <td>
                        {f.owner} · {f.taskId ? "Linked task" : "No action yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              For each task, define an examine/interview/test procedure,
              population, period, sample, expected result and exception
              handling. Record a reviewer and evidence before marking validation
              passed. A failure remains visible; the original maturity/risk
              record is reassessed separately.
            </p>
          </Panel>
        </>
      )}
      <section className="xa-panel">
        <h2>Produce the implementation deliverables</h2>
        <p>
          Exports include the complete project task scope, not just a selected
          task or chart. Scope, resources/rates, RACI, dates, dependencies, RAID
          and validation records remain traceable.
        </p>
        <div className="xa-actions">
          <button
            disabled={!plan}
            onClick={() =>
              download(
                "x1-implementation-plan.json",
                JSON.stringify(
                  {
                    scope: s.scope,
                    framework: s.framework,
                    edition: s.edition,
                    tasks: s.tasks,
                    resources: s.resources,
                    calendar: s.calendar,
                    baseline: s.baseline,
                    raid: s.raid,
                    schedule: plan?.rows.map((r) => ({ ...r, task: r.task })),
                    method: plan?.method,
                    assumptions:
                      "Entered effort/rates, exclusive resource levelling; no supplier quotations or certification.",
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            Export implementation project
          </button>
          <button
            disabled={!plan}
            onClick={() =>
              download(
                "x1-poam-raci-schedule.csv",
                csv(
                  plan!.rows.map((r) => ({
                    ...r.task,
                    start: r.start,
                    end: r.end,
                    estimatedCost: r.cost,
                    resourceDelayDays: r.resourceDelay,
                    dependencyCritical: r.critical,
                  })),
                ),
                "text/csv",
              )
            }
          >
            Export POA&M / RACI CSV
          </button>
          <Link className="xa-button primary" to={`${base}/report`}>
            Generate executive report →
          </Link>
        </div>
      </section>
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
      <details className="xs-method">
        <summary>Planning exercise and knowledge check</summary>
        <p>
          Choose one gap. Write the deliverable, accountable owner and
          verification evidence before estimating effort. Add a predecessor task
          and a real working calendar; test what happens when two tasks need the
          same resource.
        </p>
        <p>
          Analogy: a delivery route can be short on a map but late if two
          deliveries need the same van. The dependency-only critical path and
          resource-levelled dates answer different questions.
        </p>
        <p>
          Knowledge check: does 100% implementation establish control
          effectiveness? No. Test results and their scope must support a
          separate validation and reassessment decision.
        </p>
      </details>
    </>
  );
}
