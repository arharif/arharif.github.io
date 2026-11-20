import { useState } from "react";
import { useScenario } from "../app/context";
import {
  ExportPanel,
  Field,
  Header,
  LabIntro,
  Reset,
} from "../components/shared";
import { Kpi, Panel, Bars } from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
import { incidentActions, incidentFeedback } from "../utils/engines";
export default function IncidentLab() {
  const scenario = useScenario();
  const { explain } = useInsight();
  const events = [
    {
      id: "E01",
      time: "09:02",
      source: "Identity provider",
      text: "Supplier identity authenticates from a previously unseen device.",
      relevant: true,
    },
    {
      id: "E02",
      time: "09:04",
      source: "Health monitor",
      text: "Scheduled backup completes with its normal service account.",
      relevant: false,
    },
    {
      id: "E03",
      time: "09:06",
      source: "Access gateway",
      text: `The same supplier session accesses ${scenario.asset.toLowerCase()}.`,
      relevant: true,
    },
    {
      id: "E04",
      time: "09:08",
      source: "Service audit",
      text: `An unapproved configuration change occurs on ${scenario.process.toLowerCase()}.`,
      relevant: true,
    },
    {
      id: "E05",
      time: "09:10",
      source: "Identity provider",
      text: "An unrelated test account fails a password check.",
      relevant: false,
    },
    {
      id: "E06",
      time: "09:12",
      source: "Operations desk",
      text: "The owner reports that no maintenance was authorised in this window.",
      relevant: true,
    },
  ];
  const [filter, setFilter] = useState(""),
    [marked, setMarked] = useState<string[]>([]);
  const [hypothesis, setHypothesis] = useState("Undetermined"),
    [classification, setClassification] = useState(
      "Suspected account compromise",
    );
  const [severity, setSeverity] = useState("High"),
    [notes, setNotes] = useState("");
  const [actions, setActions] = useState<ReturnType<typeof incidentFeedback>[]>(
    [],
  );
  const [reviewed, setReviewed] = useState(false);
  const count = marked.filter(
    (id) => events.find((event) => event.id === id)?.relevant,
  ).length;
  const reset = () => {
    setFilter("");
    setMarked([]);
    setHypothesis("Undetermined");
    setClassification("Suspected account compromise");
    setSeverity("High");
    setNotes("");
    setActions([]);
    setReviewed(false);
  };
  return (
    <>
      <Header eyebrow="Laboratory · 03" title="Cyber Incident Lab">
        <p>
          Investigate a synthetic supplier session, reconstruct the timeline and
          propose a proportionate response.
        </p>
      </Header>
      <LabIntro
        objectives={[
          "Correlate signals across sources",
          "Test a hypothesis against business context",
          "Preserve evidence and communicate uncertainty",
        ]}
        reference="incident-triage"
      >
        <p>
          All events are synthetic. No response action contacts a system. E01,
          E03, E04 and E06 form the intended evidence chain. Attempt the
          exercise before reading the explanation.
        </p>
      </LabIntro>
      <div className="xa-kpi-grid">
        <Kpi
          label="Training incident"
          value="01"
          detail={`INC-${scenario.id.toUpperCase()}`}
          onClick={() =>
            explain(
              metricInsight(
                "Training incident",
                `Synthetic alert affecting ${scenario.asset}.`,
                "One authored incident with six timestamped observations. No live telemetry is queried.",
                "Separate observations, hypotheses and confirmed facts before escalating.",
              ),
            )
          }
        />
        <Kpi
          label="Evidence marked"
          value={`${marked.length}/${events.length}`}
          detail="Selected event references"
          tone="blue"
          onClick={() =>
            explain(
              metricInsight(
                "Evidence selection",
                "Events you have marked for the investigation.",
                "Count of selected unique event IDs. Relevance is checked against the authored scenario only.",
                "More selected events do not necessarily strengthen a hypothesis. Explain how their timestamps and sources connect.",
              ),
            )
          }
        />
        <Kpi
          label="Assigned severity"
          value={severity}
          detail="Learner judgement"
          tone="rose"
          onClick={() =>
            explain(
              metricInsight(
                "Incident severity",
                `Current learner severity: ${severity}.`,
                "Severity is selected by the learner. It is not inferred from an event count.",
                "Consider service criticality, known scope, confidence and operational consequences.",
              ),
            )
          }
        />
        <Kpi
          label="Decisions recorded"
          value={actions.length}
          detail="Requests and proposals · no live actions"
          tone="amber"
          onClick={() =>
            explain(
              metricInsight(
                "Response decision log",
                "Unique response proposals recorded in this session.",
                "Count unique selected action IDs. Evidence thresholds are authored teaching rules.",
                "Check the evidence available at decision time and coordinate disruptive proposals with service owners.",
              ),
            )
          }
        />
      </div>
      <div className="xa-grid two">
        <Panel
          title="Investigation timeline"
          subtitle="Synthetic UTC sequence · one fictional day"
        >
          <div className="xa-timeline">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() =>
                  explain({
                    ...metricInsight(
                      `${event.time} · ${event.source}`,
                      event.text,
                      "Authored synthetic observation, not verified real-world telemetry. Correlate identity, session and service records before inferring causation.",
                      "A timestamped observation alone does not establish compromise or attribution.",
                    ),
                    technical: `Event ${event.id}: ${event.text}`,
                    business: scenario.consequence,
                    path: "/learning/incident-triage",
                  })
                }
              >
                <span>{event.time}</span>
                <i />
                <strong>{event.source}</strong>
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Affected service & response readiness"
          subtitle={scenario.name}
        >
          <h3>{scenario.asset}</h3>
          <p>{scenario.architecture}</p>
          <Bars
            items={[
              { label: "Events reviewed", value: marked.length },
              { label: "Response proposals", value: actions.length },
              {
                label: "Premature proposals",
                value: actions.filter((a) => a.premature).length,
              },
            ]}
            onSelect={(label) =>
              explain(
                metricInsight(
                  label,
                  "Investigation progress and evidence at the time each proposal was made.",
                  "Counts from event selections and recorded response proposals; repeat selection updates the same action.",
                  "A proposal is a learning decision, not an executed containment action.",
                ),
              )
            }
          />
        </Panel>
      </div>
      <section className="xa-panel">
        <h2>Alert queue & event timeline</h2>
        <p>
          {scenario.threat} Potential impact · {scenario.consequence}
        </p>
        <Field label="Filter synthetic logs">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Source, event or time"
          />
        </Field>
        <div className="xa-table-scroll">
          <table>
            <caption>Synthetic UTC event sequence · same fictional day</caption>
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Time</th>
                <th>Source</th>
                <th>Observation</th>
              </tr>
            </thead>
            <tbody>
              {events
                .filter((event) =>
                  `${event.source} ${event.text} ${event.time}`
                    .toLowerCase()
                    .includes(filter.toLowerCase()),
                )
                .map((event) => (
                  <tr key={event.id}>
                    <td>
                      <label className="xa-check">
                        <input
                          type="checkbox"
                          aria-label={`Mark ${event.id}`}
                          checked={marked.includes(event.id)}
                          onChange={(e) => {
                            setMarked(
                              e.target.checked
                                ? [...marked, event.id]
                                : marked.filter((id) => id !== event.id),
                            );
                            explain({
                              ...metricInsight(
                                `${event.id} · ${event.source}`,
                                event.text,
                                "Synthetic evidence reference. Correlation must preserve source, time and collection context.",
                                "Explain how this observation supports or challenges your hypothesis.",
                              ),
                              technical: event.text,
                              business: scenario.consequence,
                              path: "/learning/incident-triage",
                            });
                            setReviewed(false);
                          }}
                        />
                        {event.id}
                      </label>
                    </td>
                    <td>{event.time}</td>
                    <td>{event.source}</td>
                    <td>{event.text}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!events.some((event) =>
          `${event.source} ${event.text} ${event.time}`
            .toLowerCase()
            .includes(filter.toLowerCase()),
        ) && <p>No events match. Clear the filter to restore the timeline.</p>}
      </section>
      <section className="xa-grid two">
        <div className="xa-panel">
          <h2>Investigation worksheet</h2>
          <Field label="Working hypothesis">
            <select
              value={hypothesis}
              onChange={(e) => {
                setHypothesis(e.target.value);
                setReviewed(false);
              }}
            >
              {[
                "Undetermined",
                "Authorised maintenance",
                "Possible supplier account compromise",
                "Backup service failure",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Incident classification">
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            >
              {[
                "Suspected account compromise",
                "Unauthorised configuration change",
                "Service disruption under investigation",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Severity">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              {["Low", "Moderate", "High", "Critical"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Investigation notes, competing explanation and uncertainty">
            <textarea
              value={notes}
              maxLength={4000}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <button onClick={() => setReviewed(true)}>
            Review evidence chain
          </button>
          {reviewed && (
            <div className="xa-feedback" role="status">
              <p>
                {count >= 3 &&
                hypothesis === "Possible supplier account compromise"
                  ? "The selected chain supports suspected misuse. Attribution and initial access remain unproven."
                  : "Correlate the new device, supplier session, unapproved change and owner confirmation. Test authorised maintenance as a competing explanation."}
              </p>
              <p>
                {marked.length - count} marked event(s) are unrelated in this
                authored scenario. Relevance is scenario ground truth, not an
                automated forensic judgement.
              </p>
            </div>
          )}
        </div>
        <div className="xa-panel">
          <h2>Response decisions</h2>
          <p>
            Select an action to record its rationale, evidence threshold and
            operational trade-off.
          </p>
          <div className="xa-list">
            {incidentActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  const outcome = incidentFeedback(action.id, count);
                  explain({
                    ...metricInsight(
                      action.label,
                      outcome.feedback,
                      `Authored minimum relevant-event count: ${action.required}. At decision time: ${count}.`,
                      outcome.message,
                    ),
                    business: scenario.constraint,
                    path: "/learning/incident-triage",
                  });
                  setActions([
                    ...actions.filter((item) => item.id !== action.id),
                    outcome,
                  ]);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
          {actions.map((action) => (
            <div
              key={action.id}
              className={`xa-feedback ${action.premature ? "xa-caution" : ""}`}
            >
              <strong>{action.label}</strong>
              <p>{action.message}</p>
              <small>
                Disruption · {action.disruption}. Evidence threshold checked at
                decision time.
              </small>
            </div>
          ))}
        </div>
      </section>
      <ExportPanel
        title="Incident investigation report"
        methodology="Synthetic identity and service telemetry. Authored evidence chain with deterministic action thresholds. These thresholds are teaching rules and do not establish investigative confidence in real systems."
        ready={
          marked.length >= 2 &&
          actions.length > 0 &&
          notes.trim().length >= 20 &&
          hypothesis !== "Undetermined"
        }
        results={{
          executiveSummary: `Suspected misuse affecting ${scenario.process}. Classification and severity are learner judgements.`,
          classification,
          severity,
          hypothesis,
          affectedService: scenario.asset,
          timeline: events,
          evidenceExamined: events.filter((event) => marked.includes(event.id)),
          decisions: actions,
          investigationNotes: notes,
          businessImpact: scenario.consequence,
          recoveryConsiderations:
            "Validate trusted configuration, session revocation, service reconciliation and enhanced monitoring with the owner.",
          lessons:
            "Review supplier privilege boundaries, log coverage and escalation authority.",
          uncertainty:
            "Synthetic events do not establish actor attribution or complete scope.",
        }}
      />
      <Reset onClick={reset} />
    </>
  );
}
