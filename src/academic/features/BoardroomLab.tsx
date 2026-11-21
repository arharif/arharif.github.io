import { Metric, Panel, Bars, Donut } from "../components/Analytics";
import { metricExplanation, useExplanation } from "../components/Explanation";
import { useState } from "react";
import { useAcademic, useScenario } from "../app/context";
import {
  ExportPanel,
  Field,
  Header,
  LabIntro,
  Reset,
} from "../components/shared";
import { budgetResult, challengeResponse, initiatives } from "../utils/engines";
const situations = [
  {
    title: "Critical vulnerability with limited time",
    weeks: 2,
    need: "Prioritise exposure reduction, compensating measures and an explicit owner for missed deadlines.",
    stakeholder: "CISO",
  },
  {
    title: "NIST programme under contractual deadline",
    weeks: 4,
    need: "Define a scoped current profile and evidence milestones. Avoid a blanket compliance claim.",
    stakeholder: "Client representative",
  },
  {
    title: "Cybersecurity investment prioritisation",
    weeks: 6,
    need: "Explain opportunity cost, dependencies and the business benefit of the selected portfolio.",
    stakeholder: "CFO",
  },
  {
    title: "Incomplete audit evidence",
    weeks: 2,
    need: "Distinguish control assertions from operating evidence. Select assurance depth and record evidence gaps.",
    stakeholder: "Internal auditor",
  },
  {
    title: "Major incident escalation",
    weeks: 1,
    need: "Set command authority, targeted containment, business communication and recovery criteria.",
    stakeholder: "CEO",
  },
  {
    title: "Supplier risk acceptance",
    weeks: 3,
    need: "Name the accountable risk owner, acceptance expiry and monitoring triggers.",
    stakeholder: "Risk committee",
  },
  {
    title: "Cloud transformation risk",
    weeks: 5,
    need: "Define shared responsibilities, identity boundaries and staged migration assurance.",
    stakeholder: "CISO",
  },
  {
    title: "AI adoption and governance",
    weeks: 4,
    need: "Require representative evaluation, data minimisation and a model release decision gate.",
    stakeholder: "Risk committee",
  },
];
export default function BoardroomLab() {
  const scenario = useScenario();
  const { explain } = useExplanation();
  const { imported } = useAcademic();
  const [situation, setSituation] = useState(0),
    [selected, setSelected] = useState<string[]>([]);
  const [owner, setOwner] = useState(""),
    [strategy, setStrategy] = useState("Stage delivery with explicit gates");
  const [assurance, setAssurance] = useState("Independent risk-based sampling"),
    [decision, setDecision] = useState("Escalate material residual exposure");
  const [brief, setBrief] = useState(""),
    [evaluated, setEvaluated] = useState(false);
  const result = budgetResult(selected, scenario.budget),
    context = situations[situation];
  const ready =
    selected.length > 0 &&
    !result.overBudget &&
    owner.trim().length > 0 &&
    brief.trim().length >= 40;
  const roadmap = selected
    .map((id) => initiatives.find((item) => item.id === id)!)
    .map((item, index) => ({
      priority: index + 1,
      initiative: item.title,
      budgetUnits: item.cost,
      deliveryWeeks: item.weeks,
      owner,
      dependency: item.dependency,
      gate: assurance,
    }));
  return (
    <>
      <Header eyebrow="Laboratory · 05" title="CISO Boardroom">
        <p>
          Make a constrained investment decision and turn the trade-offs into a
          clear executive request.
        </p>
      </Header>
      <div className="xa-metric-grid">
        <Metric
          label="Allocated budget"
          value={`${result.cost}/${scenario.budget}`}
          detail="Fictional planning units"
          onClick={() =>
            explain(
              metricExplanation(
                "Allocated budget",
                `${result.cost} units`,
                `Sum of selected initiative costs against a ${scenario.budget}-unit capacity assumption. No currency conversion.`,
                "executive",
              ),
            )
          }
        />
        <Metric
          label="Delivery horizon"
          value={`${result.weeks}w`}
          detail={`Scenario deadline ${context.weeks} weeks`}
          tone="amber"
          onClick={() =>
            explain(
              metricExplanation(
                "Delivery horizon",
                `${result.weeks} weeks`,
                "Maximum selected initiative duration, assuming parallel staffing. Dependencies and resource constraints require review.",
                "executive",
              ),
            )
          }
        />
        <Metric
          label="Exposure index"
          value={result.exposurePoints}
          detail="Authored improvement points"
          onClick={() =>
            explain(
              metricExplanation(
                "Exposure improvement index",
                String(result.exposurePoints),
                "Additive teaching points attached to selected initiatives. No calibrated risk-reduction percentage is claimed.",
                "executive",
              ),
            )
          }
        />
        <Metric
          label="Evidence readiness"
          value={result.evidencePoints}
          detail="Authored assurance points"
          onClick={() =>
            explain(
              metricExplanation(
                "Evidence readiness index",
                String(result.evidencePoints),
                "Additive authored assurance points. Independent evidence sampling does not itself implement controls.",
                "assurance",
              ),
            )
          }
        />
      </div>
      <LabIntro
        objectives={[
          "Prioritise under budget and deadline constraints",
          "Separate assurance readiness from exposure reduction",
          "Produce an issue–implication–recommendation briefing",
        ]}
        reference="risk-assessment"
      />
      <Field label="Executive scenario">
        <select
          value={situation}
          onChange={(e) => {
            setSituation(+e.target.value);
            setEvaluated(false);
          }}
        >
          {situations.map((item, index) => (
            <option key={item.title} value={index}>
              {item.title}
            </option>
          ))}
        </select>
      </Field>
      <section className="xa-panel">
        <h2>{context.stakeholder} challenge</h2>
        <p>{context.need}</p>
        <p>{scenario.constraint}</p>
        <p>
          Deadline · {context.weeks} weeks. Budget · {scenario.budget} fictional
          planning units. A unit represents a relative capacity assumption, with
          no currency conversion.
        </p>
        {imported && (
          <p>
            Use the imported {imported.title.toLowerCase()} as supporting
            context. Imported conclusions require review.
          </p>
        )}
      </section>
      <section className="xa-grid two">
        <div className="xa-panel">
          <h2>Prioritise investments</h2>
          <p>
            Select initiatives in priority order. Remove and reselect an item to
            move it to the end.
          </p>
          {initiatives.map((item) => (
            <label className="xa-check" key={item.id}>
              <input
                type="checkbox"
                aria-label={item.title}
                checked={selected.includes(item.id)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, item.id]
                      : selected.filter((id) => id !== item.id),
                  )
                }
              />
              <span>
                <strong>{item.title}</strong>
                <br />
                <small>
                  {item.cost} units · {item.weeks} weeks · {item.dependency}
                  {selected.includes(item.id) &&
                    ` · Priority ${selected.indexOf(item.id) + 1}`}
                </small>
              </span>
            </label>
          ))}
          <div className="xa-statline" aria-live="polite">
            <div className="xa-stat">
              <strong>
                {result.cost}/{scenario.budget}
              </strong>
              <span>Allocated units</span>
            </div>
            <div className="xa-stat">
              <strong>{result.remaining}</strong>
              <span>Remaining units</span>
            </div>
          </div>
          {result.overBudget && (
            <p role="alert">
              Budget exceeded. Reprioritise before exporting a funded
              recommendation.
            </p>
          )}
          <p>
            Exposure reduction index · {result.exposurePoints}. Evidence
            readiness index · {result.evidencePoints}. These additive teaching
            points describe assumptions, with no calibrated business forecast.
          </p>
          <p>
            {result.weeks > context.weeks
              ? "Delivery risk — at least one selected initiative exceeds the scenario deadline. Define a staged gate or explicit escalation."
              : "Selected durations fit the deadline under the parallel-delivery assumption. Dependencies still need validation."}
          </p>
        </div>
        <div className="xa-panel">
          <h2>Define governance</h2>
          <Field label="Accountable programme owner">
            <input
              value={owner}
              maxLength={120}
              onChange={(e) => setOwner(e.target.value)}
            />
          </Field>
          <Field label="Delivery strategy">
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            >
              {[
                "Stage delivery with explicit gates",
                "Deliver in parallel with dependency reviews",
                "Defer activity pending risk-owner approval",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Assurance depth">
            <select
              value={assurance}
              onChange={(e) => setAssurance(e.target.value)}
            >
              {[
                "Independent risk-based sampling",
                "Control-owner self-assessment",
                "Full scoped operating-effectiveness review",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <p>
            {assurance === "Control-owner self-assessment"
              ? "Self-assessment is fast but lacks independence. Declare that limitation in the assurance position."
              : "Independent review requires evidence access and assessor capacity. Include its cost and time when finalising the real plan."}
          </p>
          <Field label="Risk governance recommendation">
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              {[
                "Escalate material residual exposure",
                "Recommend time-bound acceptance for authorised review",
                "Defer the business activity",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Executive briefing · issue, implication, recommendation and decision request">
            <textarea
              value={brief}
              maxLength={5000}
              onChange={(e) => {
                setBrief(e.target.value);
                setEvaluated(false);
              }}
              placeholder="Explain the business issue first. State uncertainty, evidence, cost, residual exposure and the authority needed."
            />
          </Field>
          <button onClick={() => setEvaluated(true)}>
            Evaluate briefing coverage
          </button>
          {evaluated && (
            <div className="xa-feedback" role="status">
              <p>
                Structured topic coverage uses keyword cues. Professional
                quality requires human review.
              </p>
              <ul>
                {challengeResponse(brief).map((item) => (
                  <li key={item.label}>
                    {item.mentioned ? "Mentioned" : "Develop further"} ·{" "}
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      <div className="xa-dashboard-grid">
        <Panel
          title="Investment allocation"
          subtitle="Select an initiative to inspect its assumptions"
        >
          <Bars
            label="Initiative costs"
            entries={selected.map((id) => {
              const item = initiatives.find((row) => row.id === id)!;
              return { label: item.title, value: item.cost };
            })}
            onSelect={(label) => {
              const item = initiatives.find((row) => row.title === label)!;
              explain({
                ...metricExplanation(
                  item.title,
                  `${item.cost} planning units`,
                  `${item.weeks} weeks; dependency: ${item.dependency}. Authored exposure contribution ${item.exposure}, evidence contribution ${item.evidence}.`,
                  "executive",
                ),
                actions: [
                  `Validate ${item.dependency.toLowerCase()}.`,
                  "Confirm an owner, approval gate and residual exposure.",
                ],
              });
            }}
          />
        </Panel>
        <Panel
          title="Capacity position"
          subtitle="Budget totals use selected decisions"
        >
          <Donut
            label="units"
            entries={[
              { label: "Allocated", value: result.cost, colour: "#82b9c8" },
              {
                label: "Remaining",
                value: Math.max(0, result.remaining),
                colour: "#729d8a",
              },
            ]}
            onSelect={(label) =>
              explain(
                metricExplanation(
                  label,
                  label === "Allocated"
                    ? String(result.cost)
                    : String(result.remaining),
                  `Budget ${scenario.budget}; allocated ${result.cost}. Over-allocation is explicitly flagged and exports remain disabled.`,
                  "executive",
                ),
              )
            }
          />
        </Panel>
      </div>
      <section className="xa-panel">
        <h2>Prioritised roadmap</h2>
        {!selected.length ? (
          <p>Select an investment to build the roadmap.</p>
        ) : (
          <ol>
            {selected.map((id) => {
              const item = initiatives.find((row) => row.id === id)!;
              return (
                <li key={id}>
                  <strong>{item.title}</strong> · {item.cost} units ·{" "}
                  {item.dependency}
                </li>
              );
            })}
          </ol>
        )}
        <p>
          Consequence model · access and recovery improve the exposure index,
          telemetry supports detection and evidence, independent sampling
          improves assurance without implementing controls, and AI evaluation
          addresses model governance. Parallel durations assume independent
          staffing. Shared dependencies can invalidate that assumption.
        </p>
      </section>
      <ExportPanel
        title="Executive briefing and governance roadmap"
        methodology="Fictional planning units and additive authored indices. Delivery assumes parallel work with declared dependencies. No prediction of real financial loss, compliance or resilience."
        ready={ready}
        results={{
          executiveScenario: context.title,
          executiveBriefing: brief,
          businessService: scenario.process,
          budgetAssumptions: result,
          decisionRegister: {
            owner,
            decision,
            strategy,
            assurance,
            deadlineWeeks: context.weeks,
            status: "Recommendation awaiting authority",
          },
          roadmap,
          raidLog: [
            {
              risk: "Deadline or capacity shortfall",
              assumption: "Parallel staffing is available",
              issue: result.overBudget
                ? "Budget exceeded"
                : "Dependencies require validation",
              dependency: scenario.dependency,
              owner,
            },
          ],
          governanceActions: [
            "Confirm decision authority",
            "Validate evidence and dependencies",
            "Set acceptance expiry and escalation triggers",
          ],
          uncertainty:
            "Teaching indices are uncalibrated. The briefing remains a learner recommendation.",
        }}
        rows={roadmap}
      />
      <Reset
        onClick={() => {
          setSituation(0);
          setSelected([]);
          setOwner("");
          setStrategy("Stage delivery with explicit gates");
          setAssurance("Independent risk-based sampling");
          setDecision("Escalate material residual exposure");
          setBrief("");
          setEvaluated(false);
        }}
      />
    </>
  );
}
