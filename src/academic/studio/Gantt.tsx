import { useState } from "react";
import type { schedule } from "./engines";
import { addDays } from "./engines";
import { timelineTicks } from "./timeline";
const colours: Record<string, string> = {
  FRAME: "#71b5c6",
  DIAGNOSE: "#a59acc",
  DESIGN: "#78bfa9",
  PLAN: "#d2b876",
  IMPLEMENT: "#7ba6d2",
  ASSURE: "#c39ca9",
  EMBED: "#9cba7e",
};
export default function Gantt({
  plan,
  onSelect,
}: {
  plan: ReturnType<typeof schedule>;
  onSelect: (id: string) => void;
}) {
  const [mode, setMode] = useState<"day" | "week" | "month">("week"),
    [collapsed, setCollapsed] = useState<string[]>([]);
  const rows = plan.rows;
  if (!rows.length)
    return (
      <p>No tasks scheduled. Create or generate an implementation project.</p>
    );
  const first = rows.map((row) => row.start).sort()[0],
    span = Math.max(
      1,
      (Date.parse(plan.finish) - Date.parse(first)) / 86400000 + 1,
    ),
    pixels = mode === "day" ? 26 : mode === "week" ? 9 : 3;
  const groups = [...new Set(rows.map((row) => row.task.stage))],
    ticks = timelineTicks(first, span, mode),
    width = Math.max(360, span * pixels);
  return (
    <>
      <div className="xa-toolbar">
        <label className="xa-field">
          <span>Gantt timeline view</span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as typeof mode)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>
        <button onClick={() => setCollapsed([])}>Expand all phases</button>
      </div>
      <div
        className="xs-gantt xe-gantt"
        role="region"
        aria-label="Interactive implementation Gantt"
        tabIndex={0}
      >
        <div style={{ minWidth: 280 + width }}>
          <div className="xs-gantt-axis">
            <span>Task / source / owner</span>
            <div style={{ width }}>
              {ticks.map((offset) => (
                <small
                  key={offset}
                  style={{ left: `${(offset / span) * 100}%` }}
                >
                  {addDays(first, offset)}
                </small>
              ))}
            </div>
          </div>
          {groups.map((stage) => (
            <div key={stage}>
              <button
                className="xe-phase-group"
                aria-expanded={!collapsed.includes(stage)}
                style={{ borderLeftColor: colours[stage] }}
                onClick={() =>
                  setCollapsed(
                    collapsed.includes(stage)
                      ? collapsed.filter((value) => value !== stage)
                      : [...collapsed, stage],
                  )
                }
              >
                {collapsed.includes(stage) ? "▸" : "▾"} {stage} ·{" "}
                {rows.filter((row) => row.task.stage === stage).length} tasks
              </button>
              {!collapsed.includes(stage) &&
                rows
                  .filter((row) => row.task.stage === stage)
                  .map((row) => (
                    <div className="xs-gantt-row" key={row.task.id}>
                      <button
                        className="xa-text-button"
                        onClick={() => onSelect(row.task.id)}
                      >
                        {row.task.milestone ? "◆ " : ""}
                        {row.task.title}
                        <small>
                          {row.task.stage} · {row.task.owner || "Unassigned"}
                        </small>
                      </button>
                      <div className="xs-gantt-track" style={{ width }}>
                        <button
                          className={`xs-gantt-bar ${row.task.milestone ? "milestone" : ""} ${row.critical ? "critical" : ""}`}
                          style={{
                            left: `${((Date.parse(row.start) - Date.parse(first)) / 86400000 / span) * 100}%`,
                            width: `${row.task.milestone ? 0 : Math.max(0.4, (((Date.parse(row.end) - Date.parse(row.start)) / 86400000 + 1) / span) * 100)}%`,
                            background: colours[stage],
                            borderColor: colours[stage],
                          }}
                          aria-label={`${row.task.title}: ${row.start} to ${row.end}, ${row.task.progress}% implementation progress`}
                          title={`${row.start} → ${row.end}`}
                          onClick={() => onSelect(row.task.id)}
                        >
                          <i style={{ width: `${row.task.progress}%` }} />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          ))}
        </div>
      </div>
      <p className="xa-muted">
        Dates use the working calendar, finish-to-start dependencies and
        resource levelling. Phase colours identify work stages. Red outlines
        identify the dependency-only critical path. Long timelines sample date
        labels for readability. Exact dates, delays and validation status remain
        available in the schedule register.
      </p>
    </>
  );
}
