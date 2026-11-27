import { Link } from "react-router-dom";
import { useState, type CSSProperties } from "react";
import {
  CalendarDays,
  Download,
  ChevronDown,
  Diamond,
  GanttChartSquare,
  Kanban,
  Plus,
} from "lucide-react";
import { useProject } from "./context";
import { makePlan, phaseNames, plan, resources, riskControls, stats, syncPlan, unassessed } from "./project";
import { addDays } from "../studio/engines";
import { newTask, stages, today, type Task } from "../studio/model";
import { Dialog, Empty, Panel, Ring, Trend, fmtDate } from "./ui";
import { catalogue, names } from "./catalogue";
import { frameworkMetadata } from "./editions";
import { csv } from "../utils/engines";
import { download } from "../components/shared";

const phaseColours = [
  "#398cd0",
  "#559cc9",
  "#6186c2",
  "#737eab",
  "#27a989",
  "#e79853",
  "#9572ba",
];
const lanes = ["Planned", "In progress", "Implemented"] as const;
const laneTitle = ["To do", "In progress", "Done"];
const days = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const money = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
export function Planner() {
  const { project, change, notify } = useProject(),
    schedule = plan(project.tasks, project.start),
    { rows } = schedule;
  const [draft, edit] = useState<Task | null>(null),
    [error, fail] = useState(""),
    [closed, collapse] = useState<string[]>([]),
    [view, setView] = useState("Dashboard"),
    [inspect, show] = useState<{ title: string; ids: string[] } | null>(null);
  const visible = rows.filter((r) => !closed.includes(r.task.stage)),
    range = Math.max(14, days(project.start, schedule.finish) + 5),
    x = (d: string) => (days(project.start, d) / range) * 100;
  const progress = Math.round(
    rows.reduce((sum, r) => sum + r.task.effort * r.task.progress, 0) /
      (rows.reduce((n, r) => n + r.task.effort, 0) || 1),
  );
  const late = rows.filter(
    (r) => r.late || (r.end < today() && r.task.progress < 100),
  );
  const milestoneRows = rows.filter((r) => r.task.milestone),
    complete = rows.filter((r) => r.task.progress === 100);
  const ticks = Array.from({ length: 6 }, (_, i) =>
    addDays(project.start, Math.floor((i * range) / 6)),
  );
  const owners = [...new Set(rows.map((r) => r.task.owner))];
  function exportSoA() {
    const annex = catalogue("iso-27001").items.filter((item) => item.id.startsWith("A."));
    download(`iso-27001-${project.demo ? "sample-" : ""}soa.csv`, csv(annex.map((item) => {
      const row = project.assessments[item.id] ?? unassessed;
      return {
        Scenario: project.demo ? "SAMPLE DATA" : project.name, Control: item.id, Topic: item.title,
        Decision: row.soa, "Assessment applicability": row.applicability,
        "SoA justification and risk reference": row.tailoring, "Exclusion rationale": row.exclusion,
        Treatment: row.treatment, "Implementation rating": row.current ?? "", Evidence: row.note, Owner: row.owner,
      };
    })), "text/csv;charset=utf-8");
  }
  function exportSchedule() {
    download(`${project.framework}-${project.demo ? "fictional-demo" : "project"}-plan.csv`, csv(rows.map(({ task, start, end, late: overdue, critical }) => ({
      Scenario: project.demo ? "SAMPLE DATA · Fictional educational demo" : project.name,
      Framework: names[project.framework],
      Action: task.title,
      "Control or group": task.sourceIds.join(", "),
      "Linked risks": project.risks.filter((risk) => riskControls(risk.controls).some((id) => task.sourceIds.includes(id))).map((risk) => risk.id).join(", "),
      Phase: phaseNames[task.stage],
      Subphase: task.subphase || "",
      "Dependency-critical": critical ? "Yes" : "No",
      Owner: task.owner,
      Priority: task.priority ?? "Medium",
      Start: start,
      Finish: end,
      Deadline: task.deadline,
      Dependencies: task.dependencies.join(", "),
      Milestone: task.milestone ? "Yes" : "No",
      Status: task.status,
      "Progress (%)": task.progress,
      "Effort (hours)": task.effort,
      Delayed: overdue || (end < today() && task.progress < 100) ? "Yes" : "No",
      Evidence: task.evidence,
      Validation: task.validation,
    }))), "text/csv;charset=utf-8");
  }
  function save(t: Task) {
    try {
      if (!t.title.trim() || !t.owner.trim())
        throw Error("Enter a task name and owner.");
      const tasks = project.tasks.some((v) => v.id === t.id)
        ? project.tasks.map((v) => (v.id === t.id ? t : v))
        : [...project.tasks, t];
      plan(tasks, project.start);
      change((p) => ({ ...p, tasks }));
      edit(null);
      fail("");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Invalid task.");
    }
  }
  function updateLane(id: string, lane: (typeof lanes)[number]) {
    change((p) => ({
      ...p,
      tasks: p.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: lane,
              progress:
                lane === "Implemented"
                  ? 100
                  : lane === "Planned"
                    ? 0
                    : Math.max(1, Math.min(99, t.progress)),
            }
          : t,
      ),
    }));
  }
  function taskEdit(t: Task) {
    fail("");
    edit({ ...t });
  }
  const board = (
    <section className="xc-kanban">
      <header>
        <Kanban />
        <h3>Tasks</h3>
      </header>
      <div>
        {lanes.map((lane, i) => {
          const list = project.tasks.filter(
            (t) => (t.progress === 100 ? 2 : t.progress > 0 ? 1 : 0) === i,
          );
          return (
            <section
              key={lane}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                updateLane(e.dataTransfer.getData("text/plain"), lane);
              }}
            >
              <h4>
                {laneTitle[i]} <small>{list.length}</small>
              </h4>
              {list.map((t) => (
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", t.id);
                  }}
                  key={t.id}
                  onClick={() => taskEdit(t)}
                  style={{
                    borderLeftColor: phaseColours[stages.indexOf(t.stage)],
                  }}
                >
                  <strong>{t.title}</strong>
                  <small>{t.owner}</small>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
  return (
    <div className="xc-planner">
      <div className="xc-pmohead">
        <div>
          <GanttChartSquare />
          <h2>Project dashboard</h2>
        </div>
        <div>
          <select
            aria-label="Planner view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            {["Dashboard", "Gantt", "Kanban"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          {project.framework === "iso-27001" && <button onClick={exportSoA}><Download size={16} /> Export SoA</button>}
          {rows.length > 0 && <button onClick={exportSchedule}><Download size={16} /> Export POA&M</button>}
          <button
            onClick={() =>
              taskEdit({
                ...newTask("objective:" + project.framework, "", "PLAN"),
                requestedStart: project.start,
              })
            }
          >
            <Plus /> Task
          </button>
        </div>
      </div>
      {project.planIssue && <div className="xc-notice" role="status">
        <p>Assessment changes were saved. The last valid schedule is shown below.</p>
        <p>{project.planIssue} Review task estimates, available capacity or scope, then recalculate.</p>
        <button type="button" onClick={() => change((current) => syncPlan(current, current))}>Recalculate schedule</button>
      </div>}
      <p>{frameworkMetadata[project.framework].focus}. {stats(project).gaps.length} rated requirements are below their recorded targets.</p>
      <nav className="xc-profile-actions" aria-label="Remediation inputs">
        <Link to={`/x1-academic/assess-simulate?standard=${project.framework}&view=profile`}>Reassess requirements</Link>
        <Link to={`/x1-academic/assess-simulate?standard=${project.framework}&view=matrix`}>Review risk and treatment</Link>
      </nav>
      {!!rows.length && <p className="xc-planning-method">
        Generated work uses one working day per implementation gap point, up to 730 days per work package, and six effort hours per day. Linked residual risk and gap severity determine priority. The critical indicator marks zero slack in the dependency network. Scheduled dates also account for working days and resource capacity.
      </p>}
      {!rows.length && (
        <div className="xc-plan-empty">
          <h3>Build your implementation schedule</h3>
          <p>
            Generate phases for {names[project.framework]} or create the first
            task.
          </p>
          <button
            className="xc-primary"
            onClick={() =>
              change((p) => syncPlan({
                ...p,
                tasks: makePlan(p.framework, false, p.start),
              }))
            }
          >
            Generate framework plan
          </button>
        </div>
      )}
      {view !== "Kanban" && rows.length > 0 && (
        <section className="xc-gantt">
          <div className="xc-gantthead">
            <label>
              Project start
              <input
                aria-label="Project start date"
                type="date"
                value={project.start}
                onChange={(e) => {
                  try {
                    plan(project.tasks, e.target.value);
                    change((p) => ({ ...p, start: e.target.value }));
                  } catch (err) {
                    notify(
                      err instanceof Error
                        ? err.message
                        : "Invalid start date.",
                    );
                  }
                }}
              />
            </label>
            <div>
              {ticks.map((t) => (
                <small key={t}>{fmtDate(t)}</small>
              ))}
            </div>
          </div>
          <div className="xc-phasefilter">
            {stages
              .filter((s) => rows.some((r) => r.task.stage === s))
              .map((s) => (
                <button
                  key={s}
                  aria-pressed={!closed.includes(s)}
                  onClick={() =>
                    collapse(
                      closed.includes(s)
                        ? closed.filter((v) => v !== s)
                        : [...closed, s],
                    )
                  }
                >
                  <i style={{ background: phaseColours[stages.indexOf(s)] }} />
                  {phaseNames[s]} <ChevronDown />
                </button>
              ))}
          </div>
          <div className="xc-ganttrows">
            {visible.map(({ task: t, start, end, critical }, index) => {
              const left = x(start),
                width = ((days(start, end) + 1) / range) * 100,
                colour = phaseColours[stages.indexOf(t.stage)];
              return (
                <div
                  className="xc-ganttrow"
                  key={t.id}
                  data-task={t.id}
                  data-start={start}
                  data-end={end}
                  data-critical={critical || undefined}
                  style={{ "--phase": colour } as CSSProperties}
                >
                  <button className="xc-ganttlabel" onClick={() => taskEdit(t)}>
                    {t.milestone && <Diamond />}
                    <span>{t.title}{t.subphase && <small className="xc-subphase">{t.subphase}</small>}</span>
                    {critical && <small className="xc-critical">Critical</small>}
                  </button>
                  <div className="xc-track">
                    {t.dependencies.map((id) => {
                      const idx = visible.findIndex((r) => r.task.id === id);
                      if (idx < 0 || idx >= index) return null;
                      const endX = x(addDays(visible[idx].end, 1));
                      return (
                        <i
                          key={id}
                          className="xc-dependency"
                          style={{
                            left: endX + "%",
                            width: Math.max(0.4, left - endX) + "%",
                            height: "calc(var(--row) * " + (index - idx) + ")",
                          }}
                        />
                      );
                    })}
                    <button
                      className={t.milestone ? "milestone" : "bar"}
                      style={{
                        left: left + "%",
                        width: t.milestone
                          ? undefined
                          : Math.max(1, width) + "%",
                      }}
                      aria-label={
                        "Edit " + t.title + " · " + start + " to " + end
                      }
                      title={t.title + " · " + start + " → " + end}
                      onClick={() => taskEdit(t)}
                    >
                      {!t.milestone && (
                        <i style={{ width: t.progress + "%" }} />
                      )}
                    </button>
                    <small
                      style={{ left: Math.min(81, left + width + 1) + "%" }}
                    >
                      {fmtDate(end)}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {view !== "Gantt" && (
        <div
          className={"xc-pmomid " + (view === "Kanban" ? "kanban-only" : "")}
        >
          {board}
          {view === "Dashboard" && (
            <>
              <Panel title="Team assignments">
                {owners.map((o, i) => (
                  <button
                    className="xc-assignee"
                    key={o}
                    onClick={() =>
                      show({
                        title: o,
                        ids: rows
                          .filter((r) => r.task.owner === o)
                          .map((r) => r.task.id),
                      })
                    }
                  >
                    <i style={{ background: phaseColours[i % 7] }}>
                      {o
                        .split(" ")
                        .map((v) => v[0])
                        .slice(0, 2)
                        .join("")}
                    </i>
                    <span>{o}</span>
                    <b>
                      {rows
                        .filter((r) => r.task.owner === o)
                        .reduce((n, r) => n + r.task.effort, 0)}
                      h
                    </b>
                  </button>
                ))}
              </Panel>
              <Panel title="Milestone tracking">
                {milestoneRows.map((r) => (
                  <button
                    className="xc-lineitem"
                    key={r.task.id}
                    onClick={() => taskEdit(r.task)}
                  >
                    <Diamond />
                    <span>{r.task.title}</span>
                    <small>{fmtDate(r.end)}</small>
                  </button>
                ))}
              </Panel>
            </>
          )}
        </div>
      )}
      {view === "Dashboard" && (
        <div className="xc-pmofoot">
          <Panel
            title="Budget overview"
            action={() =>
              show({ title: "Costed tasks", ids: rows.map((r) => r.task.id) })
            }
          >
            <small>
              Planned cost {money(schedule.cost)} · earned value{" "}
              {money(
                rows.reduce((n, r) => n + (r.cost * r.task.progress) / 100, 0),
              )}
            </small>
            <Trend
              colors={["var(--chart-target)", "var(--chart-current)"]}
              series={[false, true].map((earned) =>
                ticks.map((t, i) =>
                  rows
                    .filter((r) => r.end <= (ticks[i + 1] ?? schedule.finish))
                    .reduce(
                      (n, r) =>
                        n + r.cost * (earned ? r.task.progress / 100 : 1),
                      0,
                    ),
                ),
              )}
              labels={ticks.map(fmtDate)}
              area
              onPick={(i) =>
                show({
                  title:
                    "Tasks through " + fmtDate(ticks[i + 1] ?? schedule.finish),
                  ids: rows
                    .filter((r) => r.end <= (ticks[i + 1] ?? schedule.finish))
                    .map((r) => r.task.id),
                })
              }
            />
          </Panel>
          <Panel title="Project progress">
            <div className="xc-pmorings">
              <Ring
                values={[progress, 100 - progress]}
                colors={["#398fcf", "#344554"]}
                center={progress + "%"}
                caption="effort complete"
                onPick={() =>
                  show({
                    title: "Completed tasks",
                    ids: complete.map((r) => r.task.id),
                  })
                }
              />
              <Ring
                values={[rows.length - late.length, late.length]}
                colors={["var(--chart-low)", "var(--chart-high)"]}
                center={late.length}
                caption="delayed tasks"
                onPick={() =>
                  show({
                    title: "Delayed tasks",
                    ids: late.map((r) => r.task.id),
                  })
                }
              />
            </div>
          </Panel>
        </div>
      )}
      {inspect && !draft && (
        <Dialog title={inspect.title} close={() => show(null)}>
          {rows
            .filter((r) => inspect.ids.includes(r.task.id))
            .map((r) => (
              <button
                key={r.task.id}
                className="xc-lineitem"
                onClick={() => taskEdit(r.task)}
              >
                {r.task.title}
                <small>{fmtDate(r.end)}</small>
              </button>
            ))}
          {!inspect.ids.length && <Empty>No matching tasks.</Empty>}
        </Dialog>
      )}
      {draft && (
        <Dialog
          title={draft.title || "New implementation task"}
          close={() => edit(null)}
        >
          <form
            className="xc-fields"
            onSubmit={(e) => {
              e.preventDefault();
              save(draft);
            }}
          >
            <label>
              Task name
              <input
                required
                maxLength={240}
                value={draft.title}
                onChange={(e) => edit({ ...draft, title: e.target.value })}
              />
            </label>
            <div className="xc-formgrid">
              <label>
                Owner
                <input
                  required
                  maxLength={240}
                  value={draft.owner}
                  onChange={(e) =>
                    edit({
                      ...draft,
                      owner: e.target.value,
                      accountable: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Phase
                <select
                  value={draft.stage}
                  onChange={(e) =>
                    edit({ ...draft, stage: e.target.value as Task["stage"] })
                  }
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {phaseNames[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Subphase
                <input value={draft.subphase ?? ""} maxLength={120} onChange={e => edit({ ...draft, subphase: e.target.value })} />
              </label>
              <label>
                Earliest start
                <input
                  type="date"
                  value={draft.requestedStart}
                  onChange={(e) =>
                    edit({ ...draft, requestedStart: e.target.value })
                  }
                />
              </label>
              <label>
                Deadline
                <input
                  type="date"
                  value={draft.deadline}
                  onChange={(e) => edit({ ...draft, deadline: e.target.value })}
                />
              </label>
              <label>
                Priority
                <select value={draft.priority ?? "Medium"}
                  onChange={(event) => edit({ ...draft, priority: event.target.value as Task["priority"] })}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </label>
              <label>
                Duration (workdays)
                <input
                  type="number"
                  min={draft.milestone ? 0 : 1}
                  max="730"
                  disabled={draft.milestone}
                  value={draft.duration}
                  onChange={(e) =>
                    edit({ ...draft, duration: +e.target.value })
                  }
                />
              </label>
              <label>
                Effort (hours)
                <input
                  type="number"
                  min="0"
                  max="10000"
                  disabled={draft.milestone}
                  value={draft.effort}
                  onChange={(e) => edit({ ...draft, effort: +e.target.value })}
                />
              </label>
              <label>
                Resource
                <select
                  value={draft.resourceId}
                  onChange={(e) =>
                    edit({ ...draft, resourceId: e.target.value })
                  }
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Progress (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.progress}
                  onChange={(e) => {
                    const v = +e.target.value;
                    edit({
                      ...draft,
                      progress: v,
                      status:
                        v === 100
                          ? "Implemented"
                          : v
                            ? "In progress"
                            : "Planned",
                    });
                  }}
                />
              </label>
            </div>
            <label>
              <input
                type="checkbox"
                checked={draft.milestone}
                onChange={(e) =>
                  edit({
                    ...draft,
                    milestone: e.target.checked,
                    effort: e.target.checked ? 0 : 8,
                    duration: e.target.checked ? 0 : 1,
                  })
                }
              />{" "}
              Milestone
            </label>
            <details>
              <summary>Dependencies ({draft.dependencies.length})</summary>
              {rows
                .filter((r) => r.task.id !== draft.id)
                .map(({ task: t }) => (
                  <label key={t.id}>
                    <input
                      type="checkbox"
                      checked={draft.dependencies.includes(t.id)}
                      onChange={(e) =>
                        edit({
                          ...draft,
                          dependencies: e.target.checked
                            ? [...draft.dependencies, t.id]
                            : draft.dependencies.filter((id) => id !== t.id),
                        })
                      }
                    />{" "}
                    {t.title}
                  </label>
                ))}
            </details>
            {error && <p role="alert">{error}</p>}
            <button className="xc-primary">
              <CalendarDays /> Save and reschedule
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
