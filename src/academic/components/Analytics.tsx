import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
export const riskColours: Record<string, string> = {
  Critical: "#ed6978",
  High: "#edaa5d",
  Moderate: "#d4c65f",
  Low: "#65b9a0",
};
export function Metric({
  label,
  value,
  detail,
  onClick,
  tone = "teal",
}: {
  label: string;
  value: ReactNode;
  detail: string;
  onClick: () => void;
  tone?: string;
}) {
  return (
    <button className={`xa-metric xa-tone-${tone}`} onClick={onClick}>
      <span className="xa-metric-label">
        {label}
        <ArrowUpRight size={13} aria-hidden="true" />
      </span>
      <strong>{value}</strong>
      <span className="xa-metric-detail">{detail}</span>
    </button>
  );
}
export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="xa-analytics-panel">
      <header>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
export function Donut({
  entries,
  onSelect,
  label,
}: {
  entries: { label: string; value: number; colour?: string }[];
  onSelect: (label: string) => void;
  label: string;
}) {
  const total = entries.reduce((sum, row) => sum + row.value, 0);
  let cursor = 0;
  const segments = entries.map((row) => {
    const start = cursor;
    cursor += total ? (row.value / total) * 100 : 0;
    return `${row.colour ?? riskColours[row.label] ?? "#71b6c4"} ${start}% ${cursor}%`;
  });
  return (
    <div className="xa-donut-layout">
      <div
        className="xa-donut"
        role="img"
        aria-label={`${label}. ${entries.map((row) => `${row.label} ${row.value}`).join(", ")}`}
        style={{
          background: total
            ? `conic-gradient(${segments.join(",")})`
            : "var(--xa-line)",
        }}
      >
        <div>
          <strong>{total}</strong>
          <span>{label}</span>
        </div>
      </div>
      <div className="xa-chart-legend">
        {entries.map((row) => (
          <button
            key={row.label}
            disabled={!row.value}
            onClick={() => onSelect(row.label)}
            aria-label={`${row.label}: ${row.value}, show records`}
          >
            <span
              className="xa-dot"
              style={{
                background: row.colour ?? riskColours[row.label] ?? "#71b6c4",
              }}
            />
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
export function Bars({
  entries,
  onSelect,
  label,
}: {
  entries: { label: string; value: number }[];
  onSelect: (label: string) => void;
  label: string;
}) {
  const max = Math.max(1, ...entries.map((row) => row.value));
  return (
    <div className="xa-bars" aria-label={label}>
      {entries.map((row) => (
        <button key={row.label} onClick={() => onSelect(row.label)}>
          <span>{row.label}</span>
          <span className="xa-bar-track">
            <span style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
          <strong>{row.value}</strong>
        </button>
      ))}
      {!entries.length && <p>No submitted records.</p>}
    </div>
  );
}
export function Curve({
  points,
  label,
  onSelect,
  xLabel = "False-positive rate",
  yLabel = "True-positive rate",
}: {
  points: { x: number; y: number; label: string }[];
  label: string;
  onSelect: (index: number) => void;
  xLabel?: string;
  yLabel?: string;
}) {
  return (
    <div className="xa-curve">
      <svg viewBox="0 0 400 210" role="group" aria-label={label}>
        <path d="M36 12V177H388" fill="none" stroke="var(--xa-line)" />
        <path
          d="M36 53H388M36 94H388M36 135H388"
          stroke="var(--xa-line)"
          opacity=".5"
        />
        <polyline
          fill="none"
          stroke="var(--xa-accent)"
          strokeWidth="2.5"
          points={points
            .map((point) => `${36 + point.x * 350},${177 - point.y * 165}`)
            .join(" ")}
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={36 + point.x * 350}
            cy={177 - point.y * 165}
            r="5"
            fill="var(--xa-accent)"
            tabIndex={0}
            role="button"
            aria-label={point.label}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(index);
              }
            }}
          >
            <title>{point.label}</title>
          </circle>
        ))}
        <text x="36" y="202" fill="var(--xa-muted)" fontSize="11">
          {xLabel}
        </text>
        <text x="36" y="10" fill="var(--xa-muted)" fontSize="10">
          {yLabel}
        </text>
      </svg>
      <details>
        <summary>Accessible chart values</summary>
        {points.map((point, index) => (
          <button key={index} onClick={() => onSelect(index)}>
            {point.label} · {point.x.toFixed(2)}, {point.y.toFixed(2)}
          </button>
        ))}
      </details>
    </div>
  );
}
