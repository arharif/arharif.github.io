import {
  ArrowUpRight,
  Flame,
  ShieldAlert,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Donut, Kpi, Panel, RiskMatrix, palette } from "../workspace/charts";
import {
  band,
  residualScore,
  riskMethod,
  type RiskRecord,
  type analyseRisks,
} from "../workspace/risk";
import type { RiskObservation } from "../workspace/RiskHistory";

const severity = [
  { name: "Critical", Icon: Flame },
  { name: "High", Icon: ShieldAlert },
  { name: "Medium", Icon: AlertCircle },
  { name: "Low", Icon: ShieldCheck },
] as const;

type Select = (label: string, risks: RiskRecord[], method: string) => void;

function Trend({
  records,
  observations,
  asOf,
  onSelect,
}: {
  records: RiskRecord[];
  observations: RiskObservation[];
  asOf: string;
  onSelect: Select;
}) {
  const byId = new Map(records.map((record) => [record.id, record]));
  const entries = observations.filter(
    (entry) => entry.date <= asOf && byId.has(entry.riskId),
  );
  const dates = [...new Set(entries.map((entry) => entry.date))].sort();
  if (dates.length < 2)
    return (
      <p className="xa-chart-empty">
        Record residual ratings on two or more dates to plot the trend.
      </p>
    );
  const buckets = dates.map((date) =>
    entries.filter((entry) => entry.date === date),
  );
  const series = severity.map(({ name }) => ({
    name,
    values: buckets.map((rows) =>
      rows.filter((row) => band(row.likelihood * row.impact) === name),
    ),
  }));
  const max = Math.max(
    1,
    ...series.flatMap(({ values }) => values.map((rows) => rows.length)),
  );
  const start = Date.parse(dates[0]);
  const span = Date.parse(dates[dates.length - 1]!) - start;
  const x = (index: number) =>
    24 + (356 * (Date.parse(dates[index]) - start)) / span;
  const y = (count: number) => 114 - (92 * count) / max;
  return (
    <>
      <svg
        className="xa-risk-trend"
        viewBox="0 0 404 140"
        role="group"
        aria-label="Recorded risk ratings by date and severity"
      >
        <path d="M24 18V114H380" fill="none" stroke="var(--xa-line)" />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <path
            key={tick}
            d={`M24 ${y(tick * max)}H380`}
            stroke="var(--xa-line)"
            strokeDasharray="2 4"
          />
        ))}
        {series.map(({ name, values }) => {
          return (
            <g key={name}>
              <polyline
                points={values
                  .map((rows, index) => `${x(index)},${y(rows.length)}`)
                  .join(" ")}
                fill="none"
                stroke={palette[name]}
                strokeWidth="2.2"
              />
              {values.map((rows, index) => {
                const label = `${dates[index]} · ${name}: ${rows.length} observations`;
                const activate = () =>
                  onSelect(
                    label,
                    rows.map((row) => byId.get(row.riskId)!),
                    "Counts by severity from explicitly entered residual observations. The number of records observed may differ by date.",
                  );
                return (
                  <circle
                    key={dates[index]}
                    cx={x(index)}
                    cy={y(rows.length)}
                    r="5"
                    fill={palette[name]}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    onClick={activate}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        activate();
                      }
                    }}
                  >
                    <title>{label}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
        <text x="24" y="132">
          {dates[0]}
        </text>
        <text x="380" y="132" textAnchor="end">
          {dates[dates.length - 1]}
        </text>
      </svg>
      <div className="xa-risk-key">
        {severity.map(({ name }) => (
          <span key={name}>
            <i style={{ background: palette[name] }} />
            {name}
          </span>
        ))}
      </div>
    </>
  );
}

export default function RiskDashboard({
  stats,
  observations,
  asOf,
  onSelect,
}: {
  stats: ReturnType<typeof analyseRisks>;
  observations: RiskObservation[];
  asOf: string;
  onSelect: Select;
}) {
  const risks = stats.active;
  const aged = risks
    .filter((risk) => risk.openedDate)
    .map((risk) => ({
      risk,
      days: Math.max(
        0,
        (Date.parse(asOf) - Date.parse(risk.openedDate)) / 86400000,
      ),
    }));
  const maxAge = Math.max(30, ...aged.map((entry) => entry.days));
  const chooseSeverity = (name: string) =>
    onSelect(
      `${name} risks`,
      risks.filter((risk) => band(residualScore(risk)) === name),
      riskMethod,
    );
  const agedGroups = new Map<string, typeof aged>();
  for (const entry of aged) {
    const key = `${entry.days}:${residualScore(entry.risk)}`;
    agedGroups.set(key, [...(agedGroups.get(key) ?? []), entry]);
  }
  return (
    <section
      className="xa-risk-command"
      id="xa-risk-dashboard"
      aria-label="Risk intelligence dashboard"
    >
      <div className="xa-risk-severity">
        {severity.map(({ name, Icon }) => (
          <button
            type="button"
            key={name}
            style={{ "--severity": palette[name] } as React.CSSProperties}
            onClick={() => chooseSeverity(name)}
          >
            <Icon size={23} aria-hidden="true" />
            <span>
              <strong>{stats.distribution[name] ?? 0}</strong>
              <small>{name} risks</small>
            </span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="xa-risk-panel-row">
        <Panel title="Risk matrix" subtitle="Residual likelihood × impact">
          <RiskMatrix
            counts={(l, i) =>
              risks.filter(
                (risk) =>
                  risk.residualLikelihood === l && risk.residualImpact === i,
              ).length
            }
            onSelect={(l, i) =>
              onSelect(
                `Residual ${l} × ${i}`,
                risks.filter(
                  (risk) =>
                    risk.residualLikelihood === l && risk.residualImpact === i,
                ),
                riskMethod,
              )
            }
          />
        </Panel>
        <Panel
          title="Risk aging"
          subtitle="Calendar days since opening · residual index"
        >
          {aged.length ? (
            <svg
              className="xa-risk-aging"
              viewBox="0 0 284 162"
              role="group"
              aria-label="Risk aging and residual score"
            >
              <path d="M28 16V128H272" fill="none" stroke="var(--xa-line)" />
              {[5, 10, 15, 20, 25].map((n) => (
                <g key={n}>
                  <text x="7" y={132 - n * 4.2}>
                    {n}
                  </text>
                  <path
                    d={`M28 ${128 - n * 4.2}H272`}
                    stroke="var(--xa-line)"
                    strokeDasharray="2 5"
                  />
                </g>
              ))}
              <text x="28" y="149">
                0 days
              </text>
              <text x="272" y="149" textAnchor="end">
                {maxAge} days
              </text>
              {[...agedGroups].map(([key, group]) => {
                const { risk, days } = group[0];
                const score = residualScore(risk);
                const label =
                  group.length === 1
                    ? `${risk.id} · ${days} days · residual ${score}`
                    : `${group.length} risks · ${days} days · residual ${score}`;
                const activate = () =>
                  onSelect(
                    label,
                    group.map((entry) => entry.risk),
                    "Age is calculated from the recorded opening date to the analysis date.",
                  );
                return (
                  <circle
                    key={key}
                    cx={32 + (days / maxAge) * 230}
                    cy={128 - score * 4.2}
                    r={group.length > 1 ? 8 : 6}
                    fill={palette[band(score)]}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    onClick={activate}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        activate();
                      }
                    }}
                  >
                    <title>{label}</title>
                  </circle>
                );
              })}
            </svg>
          ) : (
            <p className="xa-chart-empty">No opening dates recorded.</p>
          )}
          {aged.length < risks.length && (
            <p className="xa-muted">
              {risks.length - aged.length} active risks without an opening date
            </p>
          )}
        </Panel>
        <Panel
          title="Inherent & residual risk"
          subtitle="Average ordinal index · scale 1–25"
        >
          <div className="xa-risk-gauges">
            {[
              ["Inherent", stats.inherent, palette.High],
              ["Residual", stats.residual, palette.Low],
            ].map(([label, sum, color]) => {
              const score = risks.length ? Number(sum) / risks.length : 0;
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() =>
                    onSelect(`${label} ratings`, risks, riskMethod)
                  }
                >
                  <svg viewBox="0 0 116 73" aria-hidden="true">
                    <path
                      d="M11 61a47 47 0 0 1 94 0"
                      pathLength="100"
                      fill="none"
                      stroke="var(--xa-line)"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    {risks.length > 0 && (
                      <path
                        d="M11 61a47 47 0 0 1 94 0"
                        pathLength="100"
                        fill="none"
                        stroke={String(color)}
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={`${score * 4} 100`}
                      />
                    )}
                    <text x="58" y="58" textAnchor="middle">
                      {risks.length ? score.toFixed(1) : "—"}
                    </text>
                  </svg>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>
      <div className="xa-risk-panel-row secondary">
        <Panel
          title="Risk mitigation trend"
          subtitle="Counts of recorded residual observations by date"
        >
          <Trend
            records={risks}
            observations={observations}
            asOf={asOf}
            onSelect={onSelect}
          />
        </Panel>
        <Panel title="Risk distribution" subtitle="Active residual ratings">
          <Donut
            label="active risks"
            segments={severity.map(({ name }) => ({
              label: name,
              value: stats.distribution[name] || 0,
              color: palette[name],
            }))}
            onSelect={chooseSeverity}
          />
        </Panel>
      </div>
      <div className="xa-kpi-grid xa-risk-supporting">
        <Kpi
          label="Active risk exposure"
          value={stats.residual}
          detail={`${stats.total} active risks · ordinal index sum`}
          onClick={() => onSelect("Active exposure", risks, riskMethod)}
        />
        <Kpi
          label="Overdue reviews"
          value={stats.overdue.length}
          detail={`Review date before ${asOf}`}
          tone="amber"
          onClick={() =>
            onSelect(
              "Overdue reviews",
              stats.overdue,
              "Review date precedes analysis date.",
            )
          }
        />
        <Kpi
          label="Evidence references"
          value={`${stats.withEvidence}/${stats.total}`}
          detail="References recorded"
          onClick={() =>
            onSelect(
              "Evidence references",
              risks.filter((risk) => !!risk.evidence),
              "Presence of a reference is counted independently of verification.",
            )
          }
        />
      </div>
    </section>
  );
}
