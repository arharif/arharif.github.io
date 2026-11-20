import { useMemo, useState } from "react";
import { useAcademic } from "../app/context";
import type { AIConfiguration } from "../data/types";
import { predictions, metrics } from "../utils/engines";
import {
  ExportPanel,
  Field,
  Header,
  LabIntro,
  Reset,
} from "../components/shared";
const baseline: AIConfiguration = {
  threshold: 0.5,
  prevalence: 20,
  shift: 0,
  features: 4,
  split: "holdout",
  seed: 42,
};
const experiments = [
  [
    "Binary classification",
    "Inspect the four confusion-matrix cells. Positive means a synthetic suspicious event.",
    {},
  ],
  [
    "Precision, recall & F1",
    "Sweep the threshold and compare alert quality against missed events.",
    { threshold: 0.35 },
  ],
  [
    "Class imbalance",
    "Compare rare positives with the baseline and examine false-alert workload.",
    { prevalence: 3 },
  ],
  [
    "Decision thresholds",
    "The operating point changes the confusion matrix on a fixed dataset.",
    { threshold: 0.7 },
  ],
  [
    "Distribution shift",
    "A defined shift lowers positive scores and raises negative scores in a changed domain.",
    { shift: 5 },
  ],
  [
    "Feature selection",
    "Useful features improve separation up to six. Extra features add holdout noise.",
    { features: 2 },
  ],
  [
    "Overfitting & generalisation",
    "Compare optimistic training scores with noisy holdout scores at high feature counts.",
    { features: 12, split: "training" },
  ],
  [
    "Privacy & information leakage",
    "Training scores include a label-derived bonus to illustrate answer leakage. Remove this optimistic assumption by selecting holdout. Personnel identifiers require a separate privacy review.",
    { split: "training" },
  ],
  [
    "Detection under change",
    "Combine rare positives, changed telemetry and a high alert threshold.",
    { prevalence: 5, shift: 4, threshold: 0.65 },
  ],
] as const;
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
export default function AILab() {
  const { progress, setProgress } = useAcademic();
  const [config, setConfig] = useState<AIConfiguration>(
    progress.savedExperiment ?? baseline,
  );
  const [experiment, setExperiment] = useState(0);
  const [comparison, setComparison] = useState<
    { config: AIConfiguration; result: ReturnType<typeof metrics> }[]
  >([]);
  const [message, setMessage] = useState("");
  const data = useMemo(() => predictions(config), [config]);
  const result = metrics(data, config.threshold);
  const curve = Array.from({ length: 11 }, (_, i) => ({
    threshold: i / 10,
    ...metrics(data, i / 10),
  }));
  const update = (key: keyof AIConfiguration, value: number | string) =>
    setConfig({ ...config, [key]: value });
  return (
    <>
      <Header eyebrow="Laboratory · 04" title="AI Experiment Studio">
        <p>
          Reproduce a detection experiment. Change a defined assumption, examine
          actual counts and explain the trade-off.
        </p>
      </Header>
      <LabIntro
        objectives={[
          "Calculate metrics from defined predictions",
          "Explore thresholds, prevalence and distribution shift",
          "Compare configurations with reproducible metadata",
        ]}
        reference="detection-evaluation"
      >
        <p>
          A fixed-seed generator creates 400 labelled synthetic predictions. No
          model is trained here. The score formula is an authored demonstration
          of separation, noise, shift and optimistic training evaluation.
        </p>
      </LabIntro>
      <Field label="Experiment">
        <select
          value={experiment}
          onChange={(e) => {
            const next = +e.target.value;
            setExperiment(next);
            setConfig({
              ...baseline,
              ...experiments[next][2],
            } as AIConfiguration);
          }}
        >
          {experiments.map(([title], index) => (
            <option key={title} value={index}>
              {title}
            </option>
          ))}
        </select>
      </Field>
      <p className="xa-feedback">{experiments[experiment][1]}</p>
      <section className="xa-grid two">
        <div className="xa-panel">
          <h2>Experiment configuration</h2>
          <Field
            label={`Classification threshold · ${config.threshold.toFixed(2)}`}
          >
            <input
              aria-label="Classification threshold"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.threshold}
              onChange={(e) => update("threshold", +e.target.value)}
            />
          </Field>
          <Field label={`Positive class prevalence · ${config.prevalence}%`}>
            <input
              aria-label="Positive class prevalence"
              type="range"
              min="1"
              max="50"
              value={config.prevalence}
              onChange={(e) => update("prevalence", +e.target.value)}
            />
          </Field>
          <Field label={`Synthetic domain shift · ${config.shift}`}>
            <input
              aria-label="Synthetic domain shift"
              type="range"
              min="0"
              max="8"
              value={config.shift}
              onChange={(e) => update("shift", +e.target.value)}
            />
          </Field>
          <Field label={`Selected feature count · ${config.features}`}>
            <input
              aria-label="Selected feature count"
              type="range"
              min="1"
              max="12"
              value={config.features}
              onChange={(e) => update("features", +e.target.value)}
            />
          </Field>
          <Field label="Evaluation protocol">
            <select
              value={config.split}
              onChange={(e) => update("split", e.target.value)}
            >
              <option value="holdout">Synthetic holdout assumptions</option>
              <option value="training">
                Optimistic training / leakage assumptions
              </option>
            </select>
          </Field>
          <p>
            Seed 42 · generator v1 · 400 records. Class labels are assigned by
            index. One deterministic uniform noise sample is drawn per record.
            Features and shift alter scores under documented rules.
          </p>
          <div className="xa-actions">
            <button
              onClick={() => {
                setComparison([
                  ...comparison.slice(-3),
                  { config: { ...config }, result },
                ]);
              }}
            >
              Add to comparison
            </button>
            <button
              onClick={() => {
                setProgress({ ...progress, savedExperiment: config });
                setMessage("Configuration saved locally.");
              }}
            >
              Save configuration
            </button>
          </div>
          <p role="status">{message}</p>
        </div>
        <div className="xa-panel">
          <h2>Detection results</h2>
          <div className="xa-statline" aria-live="polite">
            {(["precision", "recall", "f1"] as const).map((key) => (
              <div className="xa-stat" key={key}>
                <strong data-testid={key}>{percent(result[key])}</strong>
                <span>{key}</span>
              </div>
            ))}
          </div>
          <div className="xa-table-scroll" role="region" aria-label="Confusion matrix results" tabIndex={0}>
            <table>
              <caption>
                Confusion matrix · threshold {config.threshold.toFixed(2)}
              </caption>
              <thead>
                <tr>
                  <th>Actual label</th>
                  <th>Flagged positive</th>
                  <th>Predicted negative</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Suspicious</th>
                  <td>TP {result.tp}</td>
                  <td>FN {result.fn}</td>
                </tr>
                <tr>
                  <th>Normal</th>
                  <td>FP {result.fp}</td>
                  <td>TN {result.tn}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            {result.fp} false alerts and {result.fn} missed positives in 400
            events. Precision = TP/(TP+FP). Recall = TP/(TP+FN). F1 = 2PR/(P+R).
          </p>
          {result.tp + result.fp === 0 && (
            <p>
              No positive predictions. Precision uses the declared zero
              convention.
            </p>
          )}
          <p className="xa-muted">
            Training-mode scores are deliberately optimistic. No confidence
            interval, real deployment performance, privacy guarantee or
            empirical feature importance is inferred.
          </p>
        </div>
      </section>
      <section className="xa-panel">
        <h2>Precision–recall operating points</h2>
        <div className="xa-plot" aria-hidden="true">
          {curve.map((row) => (
            <div
              key={row.threshold}
              style={{
                height: `${row.recall * 100}%`,
                opacity: 0.3 + row.precision * 0.7,
              }}
            />
          ))}
        </div>
        <p>
          Bar height shows recall as threshold rises from 0 to 1. The table
          provides the full accessible values.
        </p>
        <details>
          <summary>Threshold results table</summary>
          <div className="xa-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Threshold</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>False-positive rate</th>
                  <th>F1</th>
                </tr>
              </thead>
              <tbody>
                {curve.map((row) => (
                  <tr key={row.threshold}>
                    <td>{row.threshold.toFixed(1)}</td>
                    <td>{percent(row.precision)}</td>
                    <td>{percent(row.recall)}</td>
                    <td>{percent(row.fpr)}</td>
                    <td>{percent(row.f1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
      <section className="xa-panel">
        <h2>Compare experiment configurations</h2>
        {!comparison.length ? (
          <p>
            Add a baseline, change one assumption, then add a second
            configuration.
          </p>
        ) : (
          <div className="xa-table-scroll">
            <table>
              <caption>Up to four recorded configurations</caption>
              <thead>
                <tr>
                  <th>Configuration</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, index) => (
                  <tr key={index}>
                    <td>
                      #{index + 1} · threshold {item.config.threshold},
                      prevalence {item.config.prevalence}%, shift{" "}
                      {item.config.shift}, features {item.config.features},{" "}
                      {item.config.split}
                    </td>
                    <td>{percent(item.result.precision)}</td>
                    <td>{percent(item.result.recall)}</td>
                    <td>{percent(item.result.f1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <ExportPanel
        title="AI experiment evaluation report"
        methodology="Generator v1, LCG seed 42, 400 synthetic scores. Useful features saturate at six, domain shift reduces separation and training evaluation adds label-dependent optimism. Metrics computed from defined inputs. See SIMULATION_METHODOLOGY.md."
        results={{
          experiment: experiments[experiment][0],
          configuration: config,
          metrics: result,
          comparison,
          limitations:
            "Synthetic predictions with authored causal rules. No trained model, statistical performance guarantee or actual privacy test.",
          reproducibility:
            "Use the same generator version, seed and configuration.",
        }}
        rows={
          comparison.length
            ? comparison.map((item) => ({ ...item.config, ...item.result }))
            : [{ ...config, ...result }]
        }
      />
      <Reset
        onClick={() => {
          setConfig(baseline);
          setExperiment(0);
          setComparison([]);
          setMessage(
            "Experiment reset. Saved local configuration is managed in Progress.",
          );
        }}
      />
    </>
  );
}
