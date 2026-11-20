import { useState } from "react";
import { useScenario } from "../app/context";
import {
  ExportPanel,
  Field,
  Header,
  LabIntro,
  Reset,
} from "../components/shared";
import { challengeResponse, riskCategory, riskValue } from "../utils/engines";
const safeguards = [
  [
    "Preventive",
    "Time-bound supplier privileges",
    "Restricts the opportunity for unauthorised service changes.",
  ],
  [
    "Detective",
    "Correlated service and identity alerts",
    "Supports earlier identification with a tested response path.",
  ],
  [
    "Corrective",
    "Revoke sessions and correct unauthorised configuration",
    "Limits persistence after an incident is confirmed.",
  ],
  [
    "Recovery",
    "Validate trusted restoration and reconciliation",
    "Reduces disruption when recovery assumptions are tested.",
  ],
];
export default function RiskLab() {
  const scenario = useScenario();
  const initialStatement = `${scenario.exposure} ${scenario.threat} This could cause ${scenario.consequence.toLowerCase()}`;
  const [statement, setStatement] = useState(initialStatement);
  const [likelihood, setLikelihood] = useState(4),
    [impact, setImpact] = useState(4);
  const [residualL, setResidualL] = useState(3),
    [residualI, setResidualI] = useState(4);
  const [method, setMethod] = useState("product"),
    [expert, setExpert] = useState(false);
  const [selected, setSelected] = useState<string[]>([]),
    [evidence, setEvidence] = useState("");
  const [treatment, setTreatment] = useState("Mitigate"),
    [reason, setReason] = useState("");
  const [owner, setOwner] = useState(""),
    [review, setReview] = useState("");
  const [evaluated, setEvaluated] = useState(false);
  const inherent = riskValue(likelihood, impact, method),
    residual = riskValue(residualL, residualI, method);
  const result = challengeResponse(reason);
  const ready =
    statement.trim().length >= 20 &&
    reason.trim().length >= 40 &&
    owner.trim().length > 0 &&
    review.trim().length > 0 &&
    evidence.trim().length > 0;
  const reset = () => {
    setStatement(initialStatement);
    setLikelihood(4);
    setImpact(4);
    setResidualL(3);
    setResidualI(4);
    setMethod("product");
    setSelected([]);
    setEvidence("");
    setTreatment("Mitigate");
    setReason("");
    setOwner("");
    setReview("");
    setEvaluated(false);
  };
  return (
    <>
      <Header eyebrow="Laboratory · 02" title="Risk Decision Simulator">
        <p>
          Move from a business exposure to a treatment recommendation that an
          accountable owner can review.
        </p>
      </Header>
      <LabIntro
        objectives={[
          "Identify a coherent business risk",
          "Compare inherent and residual judgements",
          "Defend a recommendation with evidence and authority",
        ]}
        reference="risk-assessment"
      />
      <label className="xa-check">
        <input
          type="checkbox"
          checked={expert}
          onChange={(e) => setExpert(e.target.checked)}
        />
        Expert mode · collapse rating guidance
      </label>
      <section className="xa-panel">
        <h2>Identify the risk</h2>
        <Field label="Learner risk statement">
          <textarea
            value={statement}
            maxLength={2000}
            onChange={(e) => setStatement(e.target.value)}
          />
        </Field>
        <p>
          <strong>{scenario.asset}</strong> · {scenario.threat}{" "}
          {scenario.exposure}
        </p>
        <p>{scenario.consequence}</p>
        <p>
          Likelihood driver · supplier access and detection coverage. Impact
          driver · criticality of {scenario.process.toLowerCase()}.
        </p>
        {!expert && (
          <p className="xa-feedback">
            Use a 12-month planning horizon. Likelihood ranges from 1 (rare
            under stated conditions) to 5 (frequent). Impact ranges from 1
            (limited local disruption) to 5 (severe enterprise or safety
            consequences). Ratings are ordinal judgements.
          </p>
        )}
      </section>
      <section className="xa-grid two">
        <div className="xa-panel">
          <h2>Analyse inherent exposure</h2>
          <Field label="Educational methodology">
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="product">Ordinal product · L × I</option>
              <option value="maximum">Conservative maximum · max(L,I)²</option>
            </select>
          </Field>
          <p className="xa-muted">
            Both models are simplified 1–25 prioritisation indices. They
            estimate neither loss nor probability. Tolerance is held fixed to
            expose model sensitivity.
          </p>
          <Field label={`Inherent likelihood · ${likelihood}`}>
            <input
              aria-label="Inherent likelihood"
              type="range"
              min="1"
              max="5"
              value={likelihood}
              onChange={(e) => setLikelihood(+e.target.value)}
            />
          </Field>
          <Field label={`Inherent impact · ${impact}`}>
            <input
              aria-label="Inherent impact"
              type="range"
              min="1"
              max="5"
              value={impact}
              onChange={(e) => setImpact(+e.target.value)}
            />
          </Field>
          <div
            className="xa-matrix"
            aria-label="Risk matrix. Rows are likelihood 5 to 1. Columns are impact 1 to 5."
          >
            {[5, 4, 3, 2, 1].flatMap((l) =>
              [1, 2, 3, 4, 5].map((i) => (
                <button
                  key={`${l}-${i}`}
                  aria-label={`Likelihood ${l}, impact ${i}, index ${riskValue(l, i, method)}`}
                  aria-pressed={l === likelihood && i === impact}
                  onClick={() => {
                    setLikelihood(l);
                    setImpact(i);
                  }}
                >
                  {riskValue(l, i, method)}
                </button>
              )),
            )}
          </div>
          <p className="xa-result">
            Inherent index {inherent} · {riskCategory(inherent)}
          </p>
          <p>
            Category boundaries · Low 1–4, Moderate 5–9, High 10–16, Critical
            17–25.
          </p>
        </div>
        <div className="xa-panel">
          <h2>Select treatment assumptions</h2>
          {safeguards.map(([kind, title, effect]) => (
            <label className="xa-check" key={title}>
              <input
                type="checkbox"
                checked={selected.includes(title)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, title]
                      : selected.filter((item) => item !== title),
                  )
                }
              />
              <span>
                <strong>
                  {kind} · {title}
                </strong>
                <br />
                <small>{effect}</small>
              </span>
            </label>
          ))}
          <Field label="Effectiveness evidence, limitations and uncertainty">
            <textarea
              maxLength={3000}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="What sample or test would support the residual estimate? What remains unknown?"
            />
          </Field>
          <Field label={`Residual likelihood judgement · ${residualL}`}>
            <input
              aria-label="Residual likelihood"
              type="range"
              min="1"
              max="5"
              value={residualL}
              onChange={(e) => setResidualL(+e.target.value)}
            />
          </Field>
          <Field label={`Residual impact judgement · ${residualI}`}>
            <input
              aria-label="Residual impact"
              type="range"
              min="1"
              max="5"
              value={residualI}
              onChange={(e) => setResidualI(+e.target.value)}
            />
          </Field>
          <p>
            Controls never automatically reduce ratings. Supply a separate,
            evidence-informed estimate.
          </p>
        </div>
      </section>
      <section className="xa-panel">
        <h2>Make and defend the decision</h2>
        <p className="xa-result" aria-live="polite">
          Residual index {residual} · {riskCategory(residual)} ·{" "}
          {residual > scenario.tolerance ? "Above" : "Within"} illustrative
          tolerance of {scenario.tolerance}
        </p>
        <p>
          {residual > scenario.tolerance
            ? "Committee challenge — Why is this recommendation justified while exposure remains above tolerance?"
            : "Committee challenge — What evidence supports the estimate and what would trigger reassessment?"}
        </p>
        <Field label="Treatment recommendation">
          <select
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          >
            {["Mitigate", "Avoid", "Transfer or share", "Accept"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </Field>
        <p>
          {
            {
              Mitigate:
                "Specify implementation ownership and evidence of effect.",
              Avoid:
                "Explain the business impact of discontinuing the risky activity.",
              "Transfer or share":
                "Contracts and insurance may share consequences. Operational and governance accountability remain.",
              Accept:
                "Acceptance requires authorised approval, monitoring, review date and a documented rationale.",
            }[treatment]
          }
        </p>
        <div className="xa-grid two">
          <Field label="Accountable decision owner">
            <input
              value={owner}
              maxLength={120}
              onChange={(e) => setOwner(e.target.value)}
            />
          </Field>
          <Field label="Review date or escalation trigger">
            <input
              value={review}
              maxLength={300}
              onChange={(e) => setReview(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Committee reasoning · at least 40 characters">
          <textarea
            value={reason}
            maxLength={4000}
            onChange={(e) => {
              setReason(e.target.value);
              setEvaluated(false);
            }}
            placeholder="Address business context, assumptions, evidence, cost, residual exposure and approval authority."
          />
        </Field>
        <button onClick={() => setEvaluated(true)}>
          Challenge my recommendation
        </button>
        {evaluated && (
          <div className="xa-feedback" role="status">
            <p>
              Deterministic coverage check · keyword cues identify topics to
              revisit. This does not judge professional reasoning quality.
            </p>
            <ul>
              {result.map((item) => (
                <li key={item.label}>
                  {item.mentioned ? "Topic mentioned" : "Develop further"} ·{" "}
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <ExportPanel
        title="Risk register and management decision"
        methodology={`${method === "product" ? "L × I" : "max(L,I)²"} ordinal educational model. Twelve-month horizon. Residual ratings are learner judgements. No measured control-reduction claim.`}
        ready={ready}
        results={{
          riskStatement: statement,
          asset: scenario.asset,
          threat: scenario.threat,
          exposure: scenario.exposure,
          consequence: scenario.consequence,
          inherent: { likelihood, impact, index: inherent },
          residual: {
            likelihood: residualL,
            impact: residualI,
            index: residual,
          },
          tolerance: scenario.tolerance,
          controls: selected,
          evidenceAndAssumptions: evidence,
          treatment,
          reasoning: reason,
          accountableOwner: owner,
          reviewTrigger: review,
          approval: "Recommendation awaiting authorised review",
          treatmentPlan: selected.map((control) => ({
            control,
            owner,
            review,
            validation: evidence,
          })),
        }}
      />
      <Reset onClick={reset} />
    </>
  );
}
