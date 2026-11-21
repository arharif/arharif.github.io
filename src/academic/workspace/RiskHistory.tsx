import { useState } from "react";
import { Field, download } from "../components/shared";
import { csv } from "../utils/engines";
import { validDate, type RiskRecord } from "./risk";
import { Panel } from "./charts";
import { metricInsight, useInsight } from "./insights";
export interface RiskObservation {
  riskId: string;
  date: string;
  likelihood: number;
  impact: number;
  note: string;
}
export function observationError(o: RiskObservation) {
  return !o.riskId
    ? "Select a risk."
    : !validDate(o.date)
      ? "Choose a valid observation date."
      : ![o.likelihood, o.impact].every(
            (n) => Number.isInteger(n) && n >= 1 && n <= 5,
          )
        ? "Ratings must be integers from 1 to 5."
        : !o.note.trim()
          ? "Record the source or assumption for this observation."
          : "";
}
export default function RiskHistory({
  risks,
  observations,
  onChange,
}: {
  risks: RiskRecord[];
  observations: RiskObservation[];
  onChange: (rows: RiskObservation[]) => void;
}) {
  const { explain } = useInsight();
  const [riskId, setRiskId] = useState(""),
    [date, setDate] = useState(""),
    [likelihood, setLikelihood] = useState(3),
    [impact, setImpact] = useState(3),
    [note, setNote] = useState(""),
    [error, setError] = useState("");
  const points = observations
    .filter((o) => o.riskId === riskId)
    .sort((a, b) => a.date.localeCompare(b.date));
  function select(o: RiskObservation) {
    explain({
      ...metricInsight(
        `${o.riskId} · ${o.date}`,
        `Learner-entered residual observation ${o.likelihood} × ${o.impact} = ${o.likelihood * o.impact}.`,
        "Each point is an explicitly entered dated observation for the same risk; dates are spaced proportionally. No interpolation or opening-date trend is inferred.",
        "Compare only observations with consistent scope and rating criteria. A line between observations does not establish what happened between them.",
      ),
      technical: o.note,
      actions: [
        "Verify the observation source.",
        "Explain any change in scope or rating criteria.",
        "Reassess treatment effectiveness separately.",
      ],
    });
  }
  const first = points.length ? Date.parse(points[0].date) : 0,
    last = points.length ? Date.parse(points[points.length - 1].date) : 1;
  const x = (o: RiskObservation) =>
    45 +
    ((Date.parse(o.date) - first) / Math.max(86400000, last - first)) * 510;
  return (
    <Panel
      title="Dated risk observations"
      subtitle="Learner-entered history · never inferred from review dates"
    >
      <details>
        <summary>Record an observation & inspect a trend</summary>
        <p>
          Enter at least two dated residual ratings for the same risk.
          Historical scores must come from your records or declared exercise
          assumptions.
        </p>
        <div className="xa-grid">
          <Field label="Historical risk">
            <select value={riskId} onChange={(e) => setRiskId(e.target.value)}>
              <option value="">Select risk</option>
              {risks.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} · {r.asset}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Observation date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Observed likelihood">
            <input
              type="number"
              min="1"
              max="5"
              value={likelihood}
              onChange={(e) => setLikelihood(+e.target.value)}
            />
          </Field>
          <Field label="Observed impact">
            <input
              type="number"
              min="1"
              max="5"
              value={impact}
              onChange={(e) => setImpact(+e.target.value)}
            />
          </Field>
          <Field label="Observation source or assumption">
            <input
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>
        <button
          onClick={() => {
            const o = { riskId, date, likelihood, impact, note };
            const error = observationError(o);
            if (error) {
              setError(error);
              return;
            }
            if (
              observations.some((p) => p.riskId === riskId && p.date === date)
            ) {
              setError(
                "This risk already has an observation on that date. Remove it before replacing.",
              );
              return;
            }
            onChange([...observations, o]);
            setError("");
          }}
        >
          Add dated observation
        </button>
        {error && <p role="alert">{error}</p>}
      </details>
      {points.length < 2 ? (
        <p className="xa-muted">
          {observations.length} observation(s) recorded. Select a risk and
          record two dates to visualise its history.
        </p>
      ) : (
        <>
          <svg
            viewBox="0 0 610 220"
            className="xa-history-chart"
            role="img"
            aria-label={`Residual index observations for ${riskId}. Exact records follow below.`}
          >
            <path d="M45 20V180H560" fill="none" stroke="var(--xa-line)" />
            {[1, 9, 16, 25].map((n) => (
              <g key={n}>
                <text x="12" y={184 - ((n - 1) / 24) * 150}>
                  {n}
                </text>
                <path
                  d={`M45 ${180 - ((n - 1) / 24) * 150}H560`}
                  stroke="var(--xa-line)"
                  strokeDasharray="3 5"
                />
              </g>
            ))}
            <path
              d={points
                .map(
                  (o, i) =>
                    `${i ? "L" : "M"}${x(o)},${180 - ((o.likelihood * o.impact - 1) / 24) * 150}`,
                )
                .join(" ")}
              stroke="var(--xa-accent)"
              strokeWidth="3"
              fill="none"
            />
            {points.map((o) => (
              <circle
                key={o.date}
                cx={x(o)}
                cy={180 - ((o.likelihood * o.impact - 1) / 24) * 150}
                r="5"
                fill="var(--xa-accent)"
                onClick={() => select(o)}
              />
            ))}
            <text x="45" y="206">
              {points[0].date}
            </text>
            <text x="482" y="206">
              {points[points.length - 1].date}
            </text>
          </svg>
        </>
      )}
      {!!observations.length && (
        <>
          <div className="xa-table-scroll">
            <table>
              <caption>
                Entered observations · separate from the current register
                snapshot
              </caption>
              <thead>
                <tr>
                  <th>Risk / date</th>
                  <th>Residual</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((o, index) => (
                  <tr key={o.riskId + o.date}>
                    <td>
                      <button
                        className="xa-text-button"
                        onClick={() => {
                          setRiskId(o.riskId);
                          select(o);
                        }}
                      >
                        {o.riskId} · {o.date}
                      </button>
                    </td>
                    <td>
                      {o.likelihood} × {o.impact} = {o.likelihood * o.impact}
                    </td>
                    <td>{o.note}</td>
                    <td>
                      <button
                        aria-label={`Remove observation ${o.riskId} ${o.date}`}
                        onClick={() =>
                          onChange(observations.filter((_, i) => i !== index))
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() =>
              download(
                "x1-risk-observations.csv",
                csv(
                  observations.map((o) => ({
                    ...o,
                    residualIndex: o.likelihood * o.impact,
                    provenance: "Learner-entered observation",
                  })),
                ),
                "text/csv",
              )
            }
          >
            Export dated observations
          </button>
        </>
      )}
    </Panel>
  );
}
