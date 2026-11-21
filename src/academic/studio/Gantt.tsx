import { useEffect, useId, useRef, useState } from "react";
import type { schedule } from "./engines";
import { addDays } from "./engines";
import { timelineTicks } from "./timeline";

const colours: Record<string, string> = {
  FRAME: "#277f9f",
  DIAGNOSE: "#6256ad",
  DESIGN: "#238a78",
  PLAN: "#ab771f",
  IMPLEMENT: "#276bb4",
  ASSURE: "#925b82",
  EMBED: "#5b7e36",
};

const day = 86400000;
const axisHeight = 39;
const phaseHeight = 32;
const subphaseHeight = 24;
const rowHeight = 31;

type Row = ReturnType<typeof schedule>["rows"][number];

export default function Gantt({
  plan,
  onSelect,
}: {
  plan: ReturnType<typeof schedule>;
  onSelect: (id: string) => void;
}) {
  const arrow = useId();
  const [mode, setMode] = useState<"day" | "week" | "month">("week");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const hasRows = plan.rows.length > 0;
  useEffect(() => {
    const region = container.current;
    if (!region) return;
    const observer = new ResizeObserver(() => setAvailable(region.clientWidth));
    setAvailable(region.clientWidth);
    observer.observe(region);
    return () => observer.disconnect();
  }, [hasRows]);
  if (!hasRows)
    return (
      <p className="xa-gantt-empty">
        Generate a roadmap, add an implementation task or load a completed demo
        to build the timeline.
      </p>
    );

  const rows = plan.rows;
  const first = rows.map((row) => row.start).sort()[0];
  const span = Math.max(
    1,
    (Date.parse(plan.finish) - Date.parse(first)) / day + 1,
  );
  const labelWidth = available && available < 540 ? 154 : 228;
  const width = Math.max(
    650,
    available - labelWidth,
    span * { day: 30, week: 13, month: 4 }[mode],
  );
  const dayWidth = width / span;
  const offset = (date: string) =>
    ((Date.parse(date) - Date.parse(first)) / day) * dayWidth;
  const ticks = timelineTicks(first, span, mode);
  const groups = [...new Set(rows.map((row) => row.task.stage))].map(
    (stage) => {
      const members = rows.filter((row) => row.task.stage === stage);
      return {
        stage,
        members,
        subphases: [
          ...new Set(members.map((row) => row.task.subphase || "Tasks")),
        ],
      };
    },
  );
  const positions = new Map<string, { y: number; row: Row }>();
  let height = axisHeight;
  for (const { stage, members, subphases } of groups) {
    height += phaseHeight;
    if (collapsed.includes(stage)) continue;
    for (const subphase of subphases) {
      if (subphases.length > 1) height += subphaseHeight;
      for (const row of members.filter(
        (item) => (item.task.subphase || "Tasks") === subphase,
      )) {
        positions.set(row.task.id, { y: height + rowHeight / 2, row });
        height += rowHeight;
      }
    }
  }

  return (
    <>
      <div className="xa-toolbar xa-gantt-tools">
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
        ref={container}
        className="xs-gantt xe-gantt xa-pmo-gantt"
        role="region"
        aria-label="Interactive implementation Gantt"
        tabIndex={0}
      >
        <div
          className="xa-gantt-surface"
          style={
            {
              width: labelWidth + width,
              "--task-width": `${labelWidth}px`,
              "--axis-height": `${axisHeight}px`,
              "--phase-height": `${phaseHeight}px`,
              "--subphase-height": `${subphaseHeight}px`,
              "--row-height": `${rowHeight}px`,
            } as React.CSSProperties
          }
        >
          <div className="xa-gantt-axis">
            <span>Task / owner</span>
            <div className="xa-gantt-ticks">
              {ticks.map((tick, index) => (
                <small
                  key={tick}
                  className={index % 2 ? "xa-gantt-band" : ""}
                  style={{
                    left: tick * dayWidth,
                    width: ((ticks[index + 1] ?? span) - tick) * dayWidth,
                  }}
                >
                  {new Date(
                    addDays(first, tick) + "T00:00:00Z",
                  ).toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </small>
              ))}
            </div>
          </div>
          {groups.map(({ stage, members, subphases }) => {
            const from = Math.min(...members.map((row) => offset(row.start)));
            const to = Math.max(
              ...members.map((row) => offset(row.end) + dayWidth),
            );
            return (
              <div key={stage}>
                <div className="xa-gantt-phase">
                  <button
                    className="xe-phase-group"
                    aria-expanded={!collapsed.includes(stage)}
                    style={{ borderLeftColor: colours[stage] }}
                    onClick={() =>
                      setCollapsed((previous) =>
                        previous.includes(stage)
                          ? previous.filter((value) => value !== stage)
                          : [...previous, stage],
                      )
                    }
                  >
                    {collapsed.includes(stage) ? "▸" : "▾"} {stage} ·{" "}
                    {members.length} tasks
                  </button>
                  <div>
                    <i
                      style={{
                        left: from,
                        width: to - from,
                        background: colours[stage],
                      }}
                    />
                  </div>
                </div>
                {!collapsed.includes(stage) &&
                  subphases.map((subphase) => (
                    <div key={subphase}>
                      {subphases.length > 1 && (
                        <div className="xa-gantt-subphase">
                          <span>{subphase}</span>
                        </div>
                      )}
                      {members
                        .filter(
                          (row) => (row.task.subphase || "Tasks") === subphase,
                        )
                        .map((row) => (
                          <div
                            className="xs-gantt-row xa-gantt-task-row"
                            key={row.task.id}
                          >
                            <button
                              className="xa-text-button"
                              onClick={() => onSelect(row.task.id)}
                              title={`${row.task.title} · ${row.task.owner}`}
                            >
                              {row.task.milestone ? "◆ " : ""}
                              {row.task.title}
                              <small>
                                {row.task.owner || "Unassigned"}
                                {row.late ? " · Late" : ""}
                              </small>
                            </button>
                            <div
                              className="xs-gantt-track"
                              style={{
                                backgroundSize: `${7 * dayWidth}px 100%`,
                              }}
                            >
                              <button
                                className={`xs-gantt-bar ${row.task.milestone ? "milestone" : ""} ${row.critical ? "critical" : ""}`}
                                style={{
                                  left: offset(row.start),
                                  width: row.task.milestone
                                    ? 12
                                    : Math.max(
                                        17,
                                        offset(row.end) -
                                          offset(row.start) +
                                          dayWidth -
                                          2,
                                      ),
                                  background: colours[stage],
                                  borderColor: colours[stage],
                                }}
                                aria-label={`${row.task.title}: ${row.start} to ${row.end}, ${row.task.progress}% implementation progress${row.late ? ", late" : ""}`}
                                title={`${row.start} → ${row.end} · ${row.task.progress}%`}
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
            );
          })}
          <svg
            className="xa-gantt-dependencies"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id={arrow}
                viewBox="0 0 6 6"
                refX="5"
                refY="3"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M0 0 6 3 0 6z" fill="#6b7e94" />
              </marker>
            </defs>
            {[...positions.values()].flatMap(({ y, row }) =>
              row.task.dependencies.flatMap((id) => {
                const previous = positions.get(id);
                if (!previous) return [];
                const x0 = Math.min(
                  width - 5,
                  offset(previous.row.end) + dayWidth,
                );
                const x1 = offset(row.start);
                return (
                  <path
                    key={`${id}:${row.task.id}`}
                    d={`M${x0} ${previous.y} H${x0 + 5} V${y} H${x1}`}
                    fill="none"
                    stroke="#6b7e94"
                    strokeOpacity=".7"
                    markerEnd={`url(#${arrow})`}
                  />
                );
              }),
            )}
          </svg>
        </div>
      </div>
      <p className="xa-muted">
        Phase colours group work. Linked arrows show finish-to-start
        dependencies. Select a task for exact dates and delays.
      </p>
    </>
  );
}
