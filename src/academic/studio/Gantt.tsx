import type { schedule } from "./engines";
import { addDays } from "./engines";
export default function Gantt({
  plan,
  onSelect,
}: {
  plan: ReturnType<typeof schedule>;
  onSelect: (id: string) => void;
}) {
  const rows = plan.rows;
  if (!rows.length)
    return (
      <p>No tasks scheduled. Create or generate an implementation project.</p>
    );
  const first = rows.map((r) => r.start).sort()[0];
  const span = Math.max(
    1,
    (Date.parse(plan.finish) - Date.parse(first)) / 86400000 + 1,
  );
  return (
    <div className="xs-gantt">
      <div className="xs-gantt-axis">
        <span>Task / source</span>
        <div>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <small key={v} style={{ left: `${v * 100}%` }}>
              {addDays(first, Math.round((span - 1) * v))}
            </small>
          ))}
        </div>
      </div>
      {rows.map((r) => (
        <div className="xs-gantt-row" key={r.task.id}>
          <button
            className="xa-text-button"
            onClick={() => onSelect(r.task.id)}
          >
            {r.task.milestone ? "◆ " : ""}
            {r.task.title}
            <small>
              {r.task.stage} · {r.task.owner || "Unassigned"}
            </small>
          </button>
          <div className="xs-gantt-track">
            <button
              className={`xs-gantt-bar ${r.task.milestone ? "milestone" : ""} ${r.critical ? "critical" : ""}`}
              style={{
                left: `${((Date.parse(r.start) - Date.parse(first)) / 86400000 / span) * 100}%`,
                width: `${r.task.milestone ? 0 : Math.max(0.4, (((Date.parse(r.end) - Date.parse(r.start)) / 86400000 + 1) / span) * 100)}%`,
              }}
              aria-label={`${r.task.title}: ${r.start} to ${r.end}, ${r.task.progress}% implementation progress`}
              title={`${r.start} → ${r.end}`}
              onClick={() => onSelect(r.task.id)}
            >
              <i style={{ width: `${r.task.progress}%` }} />
            </button>
          </div>
        </div>
      ))}
      <p className="xa-muted">
        Dates use the working calendar and finish-to-start dependencies. Red
        outline marks the computed dependency-only critical path before resource
        levelling; actual resource delays are shown in the schedule table. Bar
        targets have a minimum visible width; exact dates are authoritative in
        the table.
      </p>
    </div>
  );
}
