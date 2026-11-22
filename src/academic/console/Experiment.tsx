import { useState } from "react";
import { Activity, SlidersHorizontal } from "lucide-react";
import { useProject } from "./context";
import { predictions, metrics } from "../utils/engines";
import { Dialog, Panel, Trend } from "./ui";
const models = [
  "Baseline classifier",
  "Context-enriched classifier",
  "Drift stress test",
];
export function Experiment() {
  const { project, change } = useProject(),
    cfg = project.experiment,
    [cell, pick] = useState<"tp" | "fp" | "fn" | "tn" | null>(null);
  const [curveKind, setCurveKind] = useState("Score distribution");
  const update = (patch: Partial<typeof cfg>) =>
    change((p) => ({ ...p, experiment: { ...p.experiment, ...patch } }));
  const data = predictions({
    split: "holdout",
    threshold: cfg.threshold,
    features: [2, 6, 4][cfg.model],
    shift: [1, 0, 4][cfg.model],
    seed: 2026,
    prevalence: cfg.prevalence,
  });
  const m = metrics(data, cfg.threshold),
    thresholds = Array.from({ length: 21 }, (_, i) => i / 20),
    curve = thresholds.map((t) =>
      curveKind === "F1 score"
        ? metrics(data, t).f1
        : data.filter((d) => d.score <= t).length / data.length,
    );
  const names = {
    tn: "True negative",
    fp: "False positive",
    fn: "False negative",
    tp: "True positive",
  };
  return (
    <div className="xc-experiment">
      <aside>
        <h3>
          <SlidersHorizontal /> Experiment setup
        </h3>
        <small>Model comparison</small>
        {models.map((v, i) => (
          <button
            key={v}
            aria-pressed={cfg.model === i}
            onClick={() => update({ model: i })}
          >
            <small>Model 0{i + 1}</small>
            <b>{v}</b>
            <span>{[2, 6, 4][i]} features · holdout</span>
          </button>
        ))}
        <label>
          Positive prevalence · {cfg.prevalence}%
          <input
            type="range"
            min="1"
            max="99"
            value={cfg.prevalence}
            onChange={(e) => update({ prevalence: +e.target.value })}
          />
        </label>
      </aside>
      <section>
        <h2>
          <Activity /> AI experiment studio
        </h2>
        <div className="xc-experiment-meta">
          <b>Evaluation</b>
          <span>400 synthetic observations</span>
          <span>Seed 2026</span>
        </div>
        <label>
          Decision threshold · {cfg.threshold.toFixed(2)}
          <input
            aria-label="Decision threshold"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={cfg.threshold}
            onChange={(e) => update({ threshold: +e.target.value })}
          />
        </label>
        <div className="xc-experiment-grid">
          <Panel title="Threshold analysis">
            <select
              aria-label="Experiment curve"
              value={curveKind}
              onChange={(e) => setCurveKind(e.target.value)}
            >
              <option>Score distribution</option>
              <option>F1 score</option>
            </select>
            <Trend
              series={[curve]}
              labels={thresholds.map((t) => t.toFixed(2))}
              max={1}
              colors={["#64c8b7"]}
              area
              onPick={(i) => update({ threshold: thresholds[i] })}
            />
            <small>Select a threshold on the curve to apply it.</small>
          </Panel>
          <Panel title="Confusion matrix">
            <small>Actual ↓ · Predicted →</small>
            <div className="xc-confusion">
              {(["tn", "fp", "fn", "tp"] as const).map((k) => (
                <button key={k} onClick={() => pick(k)}>
                  <small>{names[k]}</small>
                  <b>{m[k]}</b>
                </button>
              ))}
            </div>
          </Panel>
        </div>
        <div className="xc-experiment-meta">
          {(["precision", "recall", "f1"] as const).map((k) => (
            <span key={k}>
              {k.toUpperCase()} <b>{m[k].toFixed(3)}</b>
            </span>
          ))}
        </div>
      </section>
      {cell && (
        <Dialog title={names[cell] + " observations"} close={() => pick(null)}>
          <p>
            {m[cell]} of {data.length} observations at threshold{" "}
            {cfg.threshold.toFixed(2)}.
          </p>
          <div className="xc-scroll-table">
            <table>
              <thead>
                <tr>
                  <th>Observation</th>
                  <th>Actual</th>
                  <th>Predicted score</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .map((d, i) => ({ ...d, id: i + 1 }))
                  .filter(
                    (d) =>
                      (d.label
                        ? d.score >= cfg.threshold
                          ? "tp"
                          : "fn"
                        : d.score >= cfg.threshold
                          ? "fp"
                          : "tn") === cell,
                  )
                  .map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.label ? "Positive" : "Negative"}</td>
                      <td>{d.score.toFixed(3)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Dialog>
      )}
    </div>
  );
}
