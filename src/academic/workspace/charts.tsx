import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
export const palette = {
  Critical: "var(--chart-critical)",
  High: "var(--chart-high)",
  Medium: "var(--chart-medium)",
  Low: "var(--chart-low)",
  Neutral: "var(--chart-target)",
  Evidenced: "var(--chart-low)",
  Gaps: "var(--chart-high)",
  Unassessed: "#8190a7",
  Excluded: "var(--chart-target)",
};
export function Panel({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`xa-panel xa-chart-panel ${className}`}>
      <div className="xa-panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Kpi({
  label,
  value,
  detail,
  tone = "mint",
  onClick,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  tone?: string;
  onClick: () => void;
}) {
  return (
    <button className={`xa-kpi ${tone}`} onClick={onClick}>
      <span className="xa-kpi-label">
        {label}
        <ArrowUpRight size={14} aria-hidden="true" />
      </span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </button>
  );
}
export function Donut({
  segments,
  label,
  onSelect,
}: {
  segments: { label: string; value: number; color: string }[];
  label: string;
  onSelect: (label: string) => void;
}) {
  const total = segments.reduce((n, s) => n + s.value, 0);
  let cursor = 0;
  return (
    <div className="xa-donut-wrap">
      <div className="xa-donut">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="var(--xa-soft)"
            strokeWidth="14"
          />
          {segments
            .filter((s) => s.value)
            .map((s) => {
              const start = cursor;
              const fraction = total ? s.value / total : 0;
              cursor += fraction;
              return (
                <circle
                  key={s.label}
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke={s.color}
                  onClick={() => onSelect(s.label)}
                  style={{ cursor: "pointer" }}
                  strokeWidth="14"
                  pathLength="100"
                  strokeDasharray={`${fraction * 100} ${100 - fraction * 100}`}
                  strokeDashoffset={-start * 100}
                  transform="rotate(-90 60 60)"
                />
              );
            })}
        </svg>
        <div>
          <strong>{total}</strong>
          <small>{label}</small>
        </div>
      </div>
      <div className="xa-legend">
        {segments.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s.label)}
            aria-label={`${s.label}: ${s.value}`}
          >
            <i style={{ background: s.color }} />
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
export function Bars({
  items,
  onSelect,
  suffix = "",
}: {
  items: { label: string; value: number; color?: string }[];
  onSelect: (label: string) => void;
  suffix?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="xa-bars">
      {items.map((i) => (
        <button
          key={i.label}
          onClick={() => onSelect(i.label)}
          aria-label={`${i.label}: ${i.value}${suffix}`}
        >
          <span>{i.label}</span>
          <span className="xa-bar-track">
            <i
              style={{
                width: `${(i.value / max) * 100}%`,
                background: i.color || "var(--xa-accent)",
              }}
            />
          </span>
          <strong>
            {i.value}
            {suffix}
          </strong>
        </button>
      ))}
      {!items.length && <p className="xa-muted">No records in this view.</p>}
    </div>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="xa-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
export function RiskMatrix({
  counts,
  onSelect,
}: {
  counts: (l: number, i: number) => number;
  onSelect: (l: number, i: number) => void;
}) {
  return (
    <div className="xa-heatmap-wrap">
      <div className="xa-axis-y">Likelihood ↑</div>
      <div>
        <div className="xa-heatmap">
          {[5, 4, 3, 2, 1].flatMap((l) =>
            [1, 2, 3, 4, 5].map((i) => {
              const v = l * i;
              const level =
                v >= 17
                  ? "Critical"
                  : v >= 10
                    ? "High"
                    : v >= 5
                      ? "Medium"
                      : "Low";
              return (
                <button
                  key={`${l}-${i}`}
                  style={
                    { "--cell-color": palette[level] } as React.CSSProperties
                  }
                  aria-label={`Likelihood ${l}, impact ${i}: ${counts(l, i)} risks`}
                  onClick={() => onSelect(l, i)}
                >
                  <strong>{counts(l, i) || "·"}</strong>
                  <small>
                    {l}×{i}
                  </small>
                </button>
              );
            }),
          )}
        </div>
        <div className="xa-axis-x">
          1 <span>Impact →</span>5
        </div>
      </div>
    </div>
  );
}
export function Curve({
  points,
  xKey,
  yKey,
  label,
  onSelect,
}: {
  points: Record<string, number>[];
  xKey: string;
  yKey: string;
  label: string;
  onSelect: (p: Record<string, number>) => void;
}) {
  const path = points
    .map(
      (p, i) => `${i ? "L" : "M"}${38 + p[xKey] * 300},${170 - p[yKey] * 140}`,
    )
    .join(" ");
  return (
    <div className="xa-curve">
      <svg viewBox="0 0 370 210" role="img" aria-label={label}>
        <path d="M38 22V170H346" fill="none" stroke="var(--xa-line)" />
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <path
              d={`M38 ${170 - t * 140}H340`}
              stroke="var(--xa-line)"
              strokeDasharray="3 5"
            />
            <text x="10" y={174 - t * 140}>
              {t}
            </text>
            <text x={34 + t * 300} y="191">
              {t}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--xa-accent)" strokeWidth="3" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={38 + p[xKey] * 300}
            cy={170 - p[yKey] * 140}
            r="3"
            onClick={() => onSelect(p)}
            style={{ cursor: "pointer" }}
            fill="var(--xa-accent)"
          />
        ))}
      </svg>
      <div className="xa-curve-points" aria-label={`${label} operating points`}>
        {points.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p)}
            aria-label={`Threshold ${p.threshold.toFixed(2)}: ${xKey} ${p[xKey].toFixed(3)}, ${yKey} ${p[yKey].toFixed(3)}`}
          >
            {p.threshold.toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  );
}
