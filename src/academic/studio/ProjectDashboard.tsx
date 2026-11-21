import { Panel } from "../workspace/charts";
import type { schedule } from "./engines";
import type { Studio } from "./model";

const columns = ["To do", "In progress", "Done"] as const;

export default function ProjectDashboard({
  plan,
  studio,
  onSelect,
}: {
  plan: ReturnType<typeof schedule>;
  studio: Studio;
  onSelect: (id: string) => void;
}) {
  const tasks = plan.rows.map((row) => row.task);
  const owners = [...new Set(tasks.map((task) => task.owner || "Unassigned"))]
    .map((owner) => ({
      owner,
      hours: tasks
        .filter((task) => (task.owner || "Unassigned") === owner)
        .reduce((total, task) => total + task.effort, 0),
    }))
    .sort((a, b) => b.hours - a.hours);
  const milestoneRows = plan.rows.filter((row) => row.task.milestone);
  const done = tasks.filter((task) => task.progress === 100).length;
  const validated = tasks.filter(
    (task) => task.status === "Validated" && task.validation === "Passed",
  ).length;
  const plannedHours = tasks.reduce((total, task) => total + task.effort, 0);
  const progress = plannedHours
    ? Math.round(
        tasks.reduce((total, task) => total + task.effort * task.progress, 0) /
          plannedHours,
      )
    : 0;
  const assurance = tasks.length
    ? Math.round((100 * validated) / tasks.length)
    : 0;
  const scopedIds = new Set(tasks.map((task) => task.id));
  const baseline = studio.baseline.filter((row) => scopedIds.has(row.id));
  return (
    <div className="xa-pmo-dashboard">
      <div className="xa-pmo-cards">
        <Panel title="Task board" className="xa-pmo-board">
          <div className="xa-pmo-board-columns">
            {columns.map((column) => {
              const members = tasks.filter(
                (task) =>
                  (task.progress === 100
                    ? "Done"
                    : task.progress ||
                        task.status === "In progress" ||
                        task.status === "Blocked"
                      ? "In progress"
                      : "To do") === column,
              );
              return (
                <section key={column}>
                  <h3>
                    {column} <span>{members.length}</span>
                  </h3>
                  <ul>
                    {members.slice(0, 4).map((task) => (
                      <li key={task.id}>
                        <button onClick={() => onSelect(task.id)}>
                          <strong>{task.title}</strong>
                          <small>
                            {task.owner} · {task.progress}%
                            {task.status === "Blocked" ? " · Blocked" : ""}
                          </small>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {members.length > 4 && (
                    <small>{members.length - 4} more in the schedule</small>
                  )}
                </section>
              );
            })}
          </div>
        </Panel>
        <Panel title="Team assignments">
          <table>
            <thead>
              <tr>
                <th>Owner</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {owners.slice(0, 6).map(({ owner, hours }) => (
                <tr key={owner}>
                  <td>{owner}</td>
                  <td>{hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Milestone tracking">
          {milestoneRows.length ? (
            <ul className="xa-pmo-milestones">
              {milestoneRows.slice(0, 8).map((row) => (
                <li key={row.task.id}>
                  <button
                    className="xa-text-button"
                    onClick={() => onSelect(row.task.id)}
                  >
                    {row.task.title}
                  </button>
                  <small>
                    {row.end} ·{" "}
                    {row.task.progress === 100
                      ? "Complete"
                      : row.late
                        ? "Late"
                        : row.task.status}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No milestones scheduled.</p>
          )}
        </Panel>
      </div>
      <div className="xa-pmo-cards xa-pmo-totals">
        <Panel title="Budget overview" subtitle={studio.currency}>
          <dl>
            <div>
              <dt>Planning budget</dt>
              <dd>{studio.budget.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Baseline estimate</dt>
              <dd>
                {baseline.length
                  ? baseline
                      .reduce((total, row) => total + row.cost, 0)
                      .toLocaleString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Current forecast</dt>
              <dd>{plan.cost.toLocaleString()}</dd>
            </div>
          </dl>
        </Panel>
        <Panel
          title="Project progress"
          subtitle={`${done} of ${tasks.length} tasks complete`}
        >
          <div className="xa-pmo-progress">
            {[
              ["Implementation", progress],
              ["Validated", assurance],
            ].map(([label, percentage], index) => (
              <div key={label}>
                <div
                  className="xa-score-ring"
                  style={
                    {
                      "--score": `${percentage}%`,
                      "--ring-accent": index ? "#53c9a4" : "#63b1ff",
                    } as React.CSSProperties
                  }
                >
                  <strong>{percentage}%</strong>
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
