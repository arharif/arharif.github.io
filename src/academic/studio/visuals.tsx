import { useId } from "react";
import type { ReactNode } from "react";
import { Panel } from "../workspace/charts";
export function Notice({ children }: { children: ReactNode }) {
  return <p className="xs-notice">{children}</p>;
}
export function Stepper({
  steps,
  active,
  onSelect,
}: {
  steps: string[];
  active: number;
  onSelect: (n: number) => void;
}) {
  return (
    <nav className="xs-stepper" aria-label="Guided workflow steps">
      {steps.map((s, i) => (
        <button
          key={s}
          aria-current={active === i ? "step" : undefined}
          onClick={() => onSelect(i)}
        >
          <span>{i + 1}</span>
          {s}
        </button>
      ))}
    </nav>
  );
}
export function Radar({
  items,
  onSelect,
  compact = false,
}: {
  compact?: boolean;
  items: {
    label: string;
    name?: string;
    current: number | null;
    target: number | null;
    count: number;
  }[];
  onSelect: (s: string) => void;
}) {
  const uid = useId();
  const n = Math.max(3, items.length),
    center = 150,
    radius = 105;
  const pos = (i: number, value: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [
      center + (Math.cos(a) * radius * value) / 4,
      center + (Math.sin(a) * radius * value) / 4,
    ];
  };
  const valid = items
    .map((p, i) => ({ ...p, i }))
    .filter((p) => p.current !== null && p.target !== null);
  return (
    <div className="xs-radar">
      <svg viewBox="0 0 300 300" role="img" aria-labelledby={uid}>
        <title id={uid}>
          X1 educational current and target maturity. Missing values have no
          polygon; exact records follow.
        </title>
        {[1, 2, 3, 4].map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: n }, (_, i) =>
              pos(i, r).join(","),
            ).join(" ")}
            fill="none"
            stroke="var(--xa-line)"
          />
        ))}
        {items.map((p, i) => {
          const [x, y] = pos(i, 4.8);
          return (
            <g key={p.label}>
              <line
                x1={center}
                y1={center}
                x2={pos(i, 4)[0]}
                y2={pos(i, 4)[1]}
                stroke="var(--xa-line)"
              />
              <text x={x} y={y + 4} textAnchor="middle">
                {p.label}
              </text>
            </g>
          );
        })}
        {valid.length === items.length && items.length >= 3 && (
          <>
            <polygon
              points={items
                .map((p, i) => pos(i, p.target!).join(","))
                .join(" ")}
              fill="var(--xs-blue)"
              fillOpacity=".12"
              stroke="var(--xs-blue)"
            />
            <polygon
              points={items
                .map((p, i) => pos(i, p.current!).join(","))
                .join(" ")}
              fill="var(--xa-accent)"
              fillOpacity=".18"
              stroke="var(--xa-accent)"
            />
          </>
        )}
        {valid.map((p) => (
          <circle
            key={p.label}
            cx={pos(p.i, p.current!)[0]}
            cy={pos(p.i, p.current!)[1]}
            r="5"
            fill="var(--xa-accent)"
            onClick={() => onSelect(p.label)}
          />
        ))}
      </svg>
      <div className="xa-tags">
        <span>● Current</span>
        <span>◌ Target · X1 0–4 scale</span>
      </div>
      <details
        className={compact ? "xa-radar-details" : undefined}
        open={!compact}
      >
        <summary>Current / target values</summary>
        <table>
          <caption>Current/target values and eligible record counts</caption>
          <thead>
            <tr>
              <th>Group</th>
              <th>Current</th>
              <th>Target</th>
              <th>Assessed</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.label}>
                <td>
                  <button
                    className="xa-text-button"
                    onClick={() => onSelect(p.label)}
                  >
                    {p.label}
                  </button>
                </td>
                <td>
                  {p.current === null ? "Unassessed" : p.current.toFixed(2)}
                </td>
                <td>{p.target === null ? "—" : p.target.toFixed(2)}</td>
                <td>{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
export function Flow({
  nodes,
  onSelect,
}: {
  nodes: { id: string; label: string; text: string }[];
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="xs-flow" aria-label="Processing lifecycle">
      {nodes.map((n, i) => (
        <li key={n.id}>
          <button onClick={() => onSelect(n.id)}>
            <span>0{i + 1}</span>
            <strong>{n.label}</strong>
            <small>{n.text || "Not recorded"}</small>
          </button>
          {i < nodes.length - 1 && <span aria-hidden="true">→</span>}
        </li>
      ))}
    </ol>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="xs-empty">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Method({ children }: { children: ReactNode }) {
  return (
    <details className="xs-method">
      <summary>Calculation method & limitations</summary>
      <p>{children}</p>
    </details>
  );
}
export { Panel };
