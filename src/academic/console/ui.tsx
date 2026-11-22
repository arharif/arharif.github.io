import { useEffect, useId, useState, useRef, type ReactNode } from "react";
import { ArrowUpRight, X } from "lucide-react";
export function Dialog({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const el = ref.current!,
      active = document.activeElement as HTMLElement | null;
    el.showModal();
    return () => {
      el.close();
      active?.focus();
    };
  }, []);
  return (
    <dialog
      className={"xc-dialog" + (wide ? " wide" : "")}
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <button className="xc-icon" aria-label="Close dialog" onClick={close}>
          <X />
        </button>
      </header>
      <div className="xc-dialog-body">{children}</div>
    </dialog>
  );
}
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"xc-panel " + className}>
      <header>
        <h3>{title}</h3>
        {action && (
          <button
            className="xc-icon"
            aria-label={"Inspect " + title}
            onClick={action}
          >
            <ArrowUpRight />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="xc-empty">{children}</p>;
}
export const bands = ["Critical", "High", "Medium", "Low"];
export const palette = ["#f15c74", "#ff9952", "#e9c74d", "#36bf88"];
export function dot(colour: string) {
  return <i className="xc-dot" style={{ background: colour }} />;
}
export function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
export function Ring({
  values,
  colors = palette,
  center,
  caption,
  onPick,
  labels,
  indicator,
}: {
  values: number[];
  colors?: string[];
  center: string | number;
  caption: string;
  onPick: (i: number) => void;
  labels?: string[];
  indicator?: number;
}) {
  const sum = values.reduce((a, b) => a + b, 0);
  let start = 0;
  return (
    <div className="xc-ring">
      <svg
        className="xc-ring-arcs"
        viewBox="0 0 100 100"
        role="group"
        aria-label={caption + " chart"}
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="var(--line)"
          strokeWidth="10"
        />
        {values.map((v, i) => {
          const length = sum ? (100 * v) / sum : 0,
            offset = start;
          start += length;
          if (!length) return null;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="10"
              pathLength="100"
              strokeDasharray={length + " " + (100 - length)}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
              pointerEvents="visibleStroke"
              role="button"
              tabIndex={0}
              aria-label={
                labels?.[i] ?? "Inspect " + caption + " segment " + (i + 1)
              }
              onClick={() => onPick(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(i);
                }
              }}
            />
          );
        })}
        {indicator !== undefined && sum > 0 && (
          <g transform={"rotate(" + indicator * 3.6 + " 50 50)"}>
            <path
              d="M47 2h6l-3 10z"
              fill="var(--ink)"
              stroke="var(--surface1)"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>
      <button aria-label={"Inspect " + caption} onClick={() => onPick(-1)}>
        <b>{center}</b>
        <small>{caption}</small>
      </button>
    </div>
  );
}
export function Columns({
  rows,
  onPick,
}: {
  rows: { label: string; value: number; colour: string }[];
  onPick: (i: number) => void;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="xc-columns">
      {rows.map((r, i) => (
        <button
          key={r.label}
          aria-label={r.label + " " + r.value}
          title={r.label + " · " + r.value}
          onClick={() => onPick(i)}
        >
          <span>
            <i
              style={{
                height: (100 * r.value) / max + "%",
                background: r.colour,
              }}
            />
          </span>
          <small>{r.label}</small>
        </button>
      ))}
    </div>
  );
}
export function Trend({
  series,
  labels,
  colors = palette,
  onPick,
  max,
  area = false,
}: {
  series: number[][];
  labels: string[];
  colors?: string[];
  onPick: (i: number) => void;
  max?: number;
  area?: boolean;
}) {
  const cap = max || Math.max(1, ...series.flat()),
    n = labels.length;
  const x = (i: number) => 23 + (i * 268) / Math.max(1, n - 1),
    y = (v: number) => 103 - (v / cap) * 87;
  return (
    <svg
      className="xc-trend"
      viewBox="0 0 312 126"
      aria-label="Trend by observation"
      role="group"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line
            className="gridline"
            x1="23"
            x2="296"
            y1={y((i * cap) / 4)}
            y2={y((i * cap) / 4)}
          />
          <text x="18" y={y((i * cap) / 4) + 3} textAnchor="end">
            {+((i * cap) / 4).toFixed(1)}
          </text>
        </g>
      ))}
      {series.map((s, k) => (
        <g key={k}>
          {area && s.length > 0 && (
            <polygon
              points={
                x(0) +
                ",103 " +
                s.map((v, i) => x(i) + "," + y(v)).join(" ") +
                " " +
                x(s.length - 1) +
                ",103"
              }
              fill={colors[k % colors.length]}
              opacity=".13"
            />
          )}
          <polyline
            fill="none"
            stroke={colors[k % colors.length]}
            strokeWidth="2"
            points={s.map((v, i) => x(i) + "," + y(v)).join(" ")}
          />
          {s.map((v, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(v)}
              r={n < 12 ? 3.2 : 1.5}
              fill={colors[k % colors.length]}
            />
          ))}
        </g>
      ))}
      {labels.map((l, i) => (
        <g
          key={i}
          role="button"
          tabIndex={0}
          aria-label={"Inspect " + l}
          onClick={() => onPick(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPick(i);
            }
          }}
        >
          <rect x={x(i) - 6} y="5" width="13" height="101" fill="transparent" />
          {(n < 8 || i % 4 === 0) && (
            <text x={x(i)} y="119" textAnchor="middle">
              {l}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
export type Axis = {
  id: string;
  label: string;
  current: number;
  target: number;
};
export function Radar({
  axes,
  onPick,
  polar = false,
  tooltip = false,
}: {
  axes: Axis[];
  onPick: (id: string) => void;
  polar?: boolean;
  tooltip?: boolean;
}) {
  const [hover, setHover] = useState("");
  const sample =
    axes.find((a) => a.id === hover) ??
    axes.find((a) => a.current > 0) ??
    axes[0];
  const count = Math.max(3, axes.length),
    point = (i: number, r: number) => [
      110 + Math.cos((i / count) * 2 * Math.PI - Math.PI / 2) * r,
      99 + Math.sin((i / count) * 2 * Math.PI - Math.PI / 2) * r,
    ];
  const points = (fn: (i: number) => number) =>
    Array.from({ length: count }, (_, i) => point(i, fn(i)).join(",")).join(
      " ",
    );
  return (
    <div className="xc-radar-wrap">
      <svg
        className="xc-radar"
        role="group"
        aria-label="Current and target profile on a zero to four scale"
        viewBox="0 0 220 198"
      >
        {[1, 2, 3, 4].map((r) =>
          polar ? (
            <circle key={r} className="radargrid" cx="110" cy="99" r={r * 19} />
          ) : (
            <polygon
              key={r}
              className="radargrid"
              points={points(() => r * 19)}
            />
          ),
        )}
        {axes.map((a, i) => (
          <line
            key={a.id}
            className="gridline"
            x1="110"
            y1="99"
            x2={point(i, 76)[0]}
            y2={point(i, 76)[1]}
          />
        ))}
        {(["target", "current"] as const).map((k, i) => (
          <polygon
            key={k}
            points={points((j) => (axes[j]?.[k] ?? 0) * 19)}
            fill={i ? "#17b99c" : "#5074cb"}
            fillOpacity=".55"
            stroke={i ? "#14b39a" : "#5378ce"}
            strokeWidth="1.6"
          />
        ))}
        {axes.map((a, i) => {
          const [x, y] = point(i, 87);
          return (
            <g
              key={a.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setHover(a.id)}
              onFocus={() => setHover(a.id)}
              aria-label={
                a.label +
                " current " +
                a.current.toFixed(1) +
                " target " +
                a.target.toFixed(1)
              }
              onClick={() => onPick(a.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(a.id);
                }
              }}
            >
              <title>
                {a.label} · {a.current.toFixed(1)} / {a.target.toFixed(1)}
              </title>
              <circle cx={x} cy={y} r="13" fill="transparent" />
              <text x={x} y={y + 3} textAnchor="middle">
                {a.label.slice(0, 12)}
              </text>
            </g>
          );
        })}
      </svg>
      {tooltip && sample && (
        <button
          className="xc-radartip"
          aria-label={"Inspect " + sample.label}
          onClick={() => onPick(sample.id)}
        >
          <b>{sample.label}</b>
          <span>
            Target <strong>{Math.round(sample.target * 25)}</strong>
          </span>
          <span>
            Current <strong>{Math.round(sample.current * 25)}</strong>
          </span>
        </button>
      )}
    </div>
  );
}
