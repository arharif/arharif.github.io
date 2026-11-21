import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { standards } from "../../data/standards";
import { useAcademic, useScenario } from "../../app/context";
import { useAssessments } from "../standards/state";
import { Metric, Panel } from "../../components/Analytics";
import { Header, Field, download } from "../../components/shared";
import {
  metricExplanation,
  useExplanation,
} from "../../components/Explanation";
import { csv } from "../../utils/engines";
import {
  dateAt,
  dateNumber,
  generatePlan,
  parsePlan,
  planSummary,
  timelineOffsets,
  schedule,
  type ImplementationPlan,
  type PlanTask,
} from "./engine";
const key = "x1-implementation-plan-v1";
function savedPlan() {
  try {
    return parsePlan(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
export default function ImplementationPlanner() {
  const location = useLocation(),
    scenario = useScenario(),
    { caseId } = useAcademic(),
    { register } = useAssessments(),
    { explain } = useExplanation();
  const [plan, setPlan] = useState<ImplementationPlan | null>(savedPlan);
  const [framework, setFramework] = useState(
    new URLSearchParams(location.search).get("framework") ??
      plan?.framework ??
      standards[0].id,
  );
  const [scope, setScope] = useState(plan?.scope ?? scenario.process),
    [start, setStart] = useState(
      plan?.start ?? new Date().toISOString().slice(0, 10),
    ),
    [owner, setOwner] = useState(scenario.owner);
  const [scale, setScale] = useState("week"),
    [collapsed, setCollapsed] = useState<string[]>([]),
    [editing, setEditing] = useState<PlanTask | null>(null),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (!plan) return;
    try {
      localStorage.setItem(key, JSON.stringify(plan));
    } catch {
      setMessage(
        "Local persistence is unavailable. Export the plan to retain your work.",
      );
    }
  }, [plan]);
  const tasks = plan ? schedule(plan) : [],
    today = new Date().toISOString().slice(0, 10),
    summary = planSummary(tasks, today);
  const days = Math.max(1, ...tasks.map((task) => task.finishOffset + 1));
  const pixels = scale === "day" ? 32 : scale === "week" ? 11 : 4;
  const ticks = plan ? timelineOffsets(plan.start, days, scale) : [];
  const groups = [...new Set(tasks.map((task) => task.phase))];
  const gaps = Object.entries(register)
    .filter(
      ([id, value]) =>
        id.startsWith(`${caseId}:${framework}:`) &&
        ["Not implemented", "Partially implemented"].includes(value.status),
    )
    .map(([id, value]) => ({
      id: id.split(":").slice(2).join(":"),
      action: value.notes || "Validate and remediate the assessment gap",
    }));
  const inspect = (task: (typeof tasks)[number]) => {
    setEditing({ ...task, dependencies: [...task.dependencies] });
    explain({
      ...metricExplanation(
        task.title,
        `${task.start} → ${task.end}`,
        `Finish-to-start dependencies use calendar days. Each dependent starts after the predecessor ends. Requested start is a lower bound, and ${task.duration} days were allocated.`,
        "executive",
      ),
      technical: `Owner: ${task.owner}. Dependencies: ${task.dependencies.join(", ") || "Project start"}. Issue: ${task.issue}`,
      interpretation: `Progress ${task.progress}% is user reported. ${task.gap ? `Linked gap: ${task.gap}` : "No linked assessment gap."}`,
    });
  };
  return (
    <>
      <Header
        eyebrow="Implement · plan · validate · improve"
        title="Implementation roadmap studio"
      >
        <p>
          Generate a framework-specific plan, edit the tasks and explore a
          dependency-aware schedule directly in the academy.
        </p>
      </Header>
      <section className="xa-panel">
        <div className="xa-grid two">
          <Field label="Implementation framework">
            <select
              value={framework}
              onChange={(event) => setFramework(event.target.value)}
            >
              {standards.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Project start date">
            <input
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </Field>
          <Field label="Implementation scope">
            <input
              value={scope}
              maxLength={500}
              onChange={(event) => setScope(event.target.value)}
            />
          </Field>
          <Field label="Accountable programme owner">
            <input
              value={owner}
              maxLength={120}
              onChange={(event) => setOwner(event.target.value)}
            />
          </Field>
        </div>
        <p>
          {gaps.length} open assessment gaps are available for this framework
          and fictional organisation. Configurations apply when generating a new
          plan.
        </p>
        <button
          className="primary"
          onClick={() => {
            try {
              setPlan(generatePlan(framework, scope, start, owner, gaps));
              setCollapsed([]);
              setEditing(null);
              setMessage(
                "Roadmap generated. Durations are editable planning assumptions.",
              );
            } catch (error) {
              setMessage((error as Error).message);
            }
          }}
        >
          Generate roadmap
        </button>
        <p className="xa-chart-note">
          All supported standards receive a tailored educational plan using
          their architecture areas. Tasks are planning suggestions and require
          current source, applicability and owner validation.
        </p>
      </section>
      <p role="status">{message}</p>
      {!plan ? (
        <div className="xa-panel">
          <h2>Configure your implementation scope</h2>
          <p>
            Generate a roadmap to explore phases, dependencies, milestones and
            editable tasks.
          </p>
        </div>
      ) : (
        <>
          <div className="xa-metric-grid">
            <Metric
              label="Scheduled tasks"
              value={summary.total}
              detail="Includes readiness milestones"
              onClick={() =>
                explain(
                  metricExplanation(
                    "Scheduled tasks",
                    String(summary.total),
                    "Count of generated and edited tasks in this roadmap.",
                    "executive",
                  ),
                )
              }
            />
            <Metric
              label="Reported progress"
              value={`${summary.progress}%`}
              detail="Unweighted mean of task progress"
              onClick={() =>
                explain(
                  metricExplanation(
                    "Reported plan progress",
                    `${summary.progress}%`,
                    "Arithmetic mean of user-entered task progress, with no claim of verified implementation or schedule earned value.",
                    "executive",
                  ),
                )
              }
            />
            <Metric
              label="Delayed tasks"
              value={summary.delayed}
              tone="amber"
              detail={`Finish before ${today}, incomplete`}
              onClick={() => {
                setCollapsed([]);
                explain(
                  metricExplanation(
                    "Delayed tasks",
                    String(summary.delayed),
                    "Tasks ending before today with reported progress below 100%. Reassess owners, capacity and dependency constraints.",
                    "executive",
                  ),
                );
              }}
            />
            <Metric
              label="Target finish"
              value={<span className="xa-date-value">{summary.end}</span>}
              detail="Recalculated from dependencies"
              onClick={() =>
                explain(
                  metricExplanation(
                    "Target finish",
                    summary.end,
                    "Latest dependency-aware task finish under the current calendar-day and duration assumptions.",
                    "executive",
                  ),
                )
              }
            />
          </div>
          <Panel
            title={`${standards.find((row) => row.id === plan.framework)!.title} · Implementation Gantt`}
            subtitle={`${plan.scope} · calendar-day scheduling, finish-to-start dependencies`}
            action={
              <Field label="Timeline view">
                <select
                  value={scale}
                  onChange={(event) => setScale(event.target.value)}
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </Field>
            }
          >
            <div
              className="xa-gantt-scroll"
              role="region"
              aria-label="Editable implementation Gantt"
              tabIndex={0}
            >
              <div
                className="xa-gantt"
                style={{ minWidth: `${300 + days * pixels}px` }}
              >
                <div className="xa-gantt-header">
                  <strong>Phase / task / owner</strong>
                  <div
                    className="xa-gantt-ruler"
                    style={{ width: days * pixels }}
                  >
                    {ticks.map((offset) => (
                      <span key={offset} style={{ left: offset * pixels }}>
                        {dateAt(plan.start, offset)}
                      </span>
                    ))}
                  </div>
                </div>
                {groups.map((phase, phaseIndex) => (
                  <div key={phase}>
                    <button
                      className="xa-gantt-group"
                      aria-expanded={!collapsed.includes(phase)}
                      onClick={() =>
                        setCollapsed(
                          collapsed.includes(phase)
                            ? collapsed.filter((value) => value !== phase)
                            : [...collapsed, phase],
                        )
                      }
                    >
                      {collapsed.includes(phase) ? "▸" : "▾"} {phase}
                    </button>
                    {!collapsed.includes(phase) &&
                      tasks
                        .filter((task) => task.phase === phase)
                        .map((task) => (
                          <div
                            className={`xa-gantt-row ${task.end < today && task.progress < 100 ? "is-delayed" : ""}`}
                            key={task.id}
                          >
                            <button
                              className="xa-gantt-task"
                              onClick={() => inspect(task)}
                            >
                              <strong>{task.title}</strong>
                              <small>
                                {task.owner} · {task.progress}%
                                {task.end < today && task.progress < 100
                                  ? " · Delayed"
                                  : ""}
                              </small>
                            </button>
                            <div
                              className="xa-gantt-track"
                              style={{ width: days * pixels }}
                            >
                              <button
                                className={`xa-gantt-bar xa-stage-${phaseIndex % 5} ${task.milestone ? "is-milestone" : ""}`}
                                aria-label={`${task.title}, ${task.start} to ${task.end}, ${task.progress}% complete. Edit task`}
                                style={{
                                  left: task.offset * pixels,
                                  width: Math.max(
                                    16,
                                    Math.max(1, task.duration) * pixels,
                                  ),
                                }}
                                onClick={() => inspect(task)}
                              >
                                <span style={{ width: `${task.progress}%` }} />
                                <small>
                                  {task.milestone ? "◆" : `${task.duration}d`}
                                </small>
                              </button>
                            </div>
                          </div>
                        ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="xa-chart-note">
              Select a task or bar to edit. Group controls collapse phases.
              Timeline changes alter visual scale, while dates remain
              calendar-day calculations.
            </p>
          </Panel>
          {editing && (
            <section className="xa-panel">
              <h2>Edit roadmap task</h2>
              <Field label="Task title">
                <input
                  value={editing.title}
                  maxLength={500}
                  onChange={(event) =>
                    setEditing({ ...editing, title: event.target.value })
                  }
                />
              </Field>
              <div className="xa-grid two">
                <Field label="Task owner">
                  <input
                    value={editing.owner}
                    maxLength={120}
                    onChange={(event) =>
                      setEditing({ ...editing, owner: event.target.value })
                    }
                  />
                </Field>
                <Field label="Duration in calendar days">
                  <input
                    type="number"
                    min={editing.milestone ? 0 : 1}
                    max="365"
                    value={editing.duration}
                    onChange={(event) =>
                      setEditing({ ...editing, duration: +event.target.value })
                    }
                  />
                </Field>
                <Field label="Requested start · optional lower bound">
                  <input
                    type="date"
                    value={editing.requestedStart}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        requestedStart: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Task progress percent">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editing.progress}
                    onChange={(event) =>
                      setEditing({ ...editing, progress: +event.target.value })
                    }
                  />
                </Field>
              </div>
              <fieldset>
                <legend>Finish-to-start dependencies</legend>
                <div className="xa-dependency-grid">
                  {plan.tasks
                    .filter((task) => task.id !== editing.id)
                    .map((task) => (
                      <label className="xa-check" key={task.id}>
                        <input
                          type="checkbox"
                          checked={editing.dependencies.includes(task.id)}
                          onChange={(event) =>
                            setEditing({
                              ...editing,
                              dependencies: event.target.checked
                                ? [...editing.dependencies, task.id]
                                : editing.dependencies.filter(
                                    (id) => id !== task.id,
                                  ),
                            })
                          }
                        />
                        {task.title}
                      </label>
                    ))}
                </div>
              </fieldset>
              <Field label="Risk, issue or assumption">
                <textarea
                  value={editing.issue}
                  maxLength={2000}
                  onChange={(event) =>
                    setEditing({ ...editing, issue: event.target.value })
                  }
                />
              </Field>
              <button
                className="primary"
                onClick={() => {
                  try {
                    if (!editing.title.trim() || !editing.owner.trim())
                      throw new Error("Task title and owner are required.");
                    const next = {
                      ...plan,
                      tasks: plan.tasks.map((task) =>
                        task.id === editing.id ? editing : task,
                      ),
                    };
                    schedule(next);
                    setPlan(next);
                    setEditing(null);
                    setMessage(
                      "Task updated and dependent dates recalculated.",
                    );
                  } catch (error) {
                    setMessage((error as Error).message);
                  }
                }}
              >
                Save task and recalculate
              </button>
              <button onClick={() => setEditing(null)}>Cancel task edit</button>
            </section>
          )}
          <section className="xa-panel">
            <h2>Roadmap register & exports</h2>
            <div className="xa-table-scroll">
              <table>
                <caption>Accessible schedule alternative</caption>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Owner</th>
                    <th>Start</th>
                    <th>Finish</th>
                    <th>Progress</th>
                    <th>Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <button
                          className="xa-record-link"
                          onClick={() => inspect(task)}
                        >
                          {task.title}
                        </button>
                      </td>
                      <td>{task.owner}</td>
                      <td>{task.start}</td>
                      <td>{task.end}</td>
                      <td>{task.progress}%</td>
                      <td>{task.dependencies.join(", ") || "Project start"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="xa-actions">
              <button
                onClick={() =>
                  download(
                    "x1-implementation-plan.json",
                    JSON.stringify(plan, null, 2),
                    "application/json",
                  )
                }
              >
                Export roadmap JSON
              </button>
              <button
                onClick={() =>
                  download(
                    "x1-implementation-schedule.csv",
                    csv(
                      tasks.map((task) => ({
                        ...task,
                        framework: plan.framework,
                        scope: plan.scope,
                        method:
                          "Calendar-day finish-to-start educational schedule",
                      })),
                    ),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                Export schedule CSV
              </button>
              <button onClick={() => window.print()}>Print roadmap</button>
              <button
                onClick={() => {
                  setPlan(null);
                  setEditing(null);
                  localStorage.removeItem(key);
                  setMessage("Current local roadmap reset.");
                }}
              >
                Reset roadmap
              </button>
            </div>
            <Field label="Restore implementation plan JSON">
              <input
                type="file"
                accept=".json"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 500000)
                      throw new Error("Maximum plan import size is 500 KB.");
                    const restored = parsePlan(await file.text());
                    setPlan(restored);
                    setFramework(restored.framework);
                    setScope(restored.scope);
                    setStart(restored.start);
                    setEditing(null);
                    setMessage(
                      "Implementation plan restored and dependency schedule validated.",
                    );
                  } catch (error) {
                    setMessage((error as Error).message);
                  }
                  event.target.value = "";
                }}
              />
            </Field>
          </section>
        </>
      )}
    </>
  );
}
