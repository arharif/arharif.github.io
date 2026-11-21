import { useState } from "react";
import type { Studio } from "./model";
import { Panel, Bars } from "../workspace/charts";
import { metricInsight, useInsight } from "../workspace/insights";
type Decisions = Studio["sp"]["decisions"];
function state(d: Decisions[string]) {
  return d.reviewed ? (d.applicable ? d.status : "Excluded") : "Unreviewed";
}
export function ControlDecisionTable({
  decisions,
  filter = "All",
}: {
  decisions: Decisions;
  filter?: string;
}) {
  return (
    <div className="xa-table-scroll">
      <table>
        <caption>
          Recorded NIST system control decisions in this report snapshot
        </caption>
        <thead>
          <tr>
            <th>Control / responsibility</th>
            <th>Recorded state / applicability</th>
            <th>Owner / rationale</th>
            <th>Evidence / assessment finding</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(decisions)
            .filter(([, d]) => filter === "All" || state(d) === filter)
            .map(([id, d]) => (
              <tr key={id}>
                <td>
                  {id.toUpperCase()}
                  <p>
                    {d.responsibility} · {d.provider || "System boundary"}
                  </p>
                </td>
                <td>
                  {state(d)}
                  <p>{d.applicable ? "Applicable" : "Excluded"}</p>
                </td>
                <td>
                  {d.owner || "Unassigned"}
                  <p>{d.rationale || "No rationale"}</p>
                </td>
                <td>
                  {d.evidence || "No evidence reference"}
                  <p>
                    {d.assessmentMethod} ·{" "}
                    {d.finding || "No assessment finding recorded"}
                  </p>
                  <small>
                    {d.reviewed ? "Learner reviewed input" : "Draft input"}
                  </small>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
export default function ControlAssurance({ sp }: { sp: Studio["sp"] }) {
  const [filter, setFilter] = useState("All"),
    { explain } = useInsight();
  return (
    <Panel
      title="NIST system control assertions"
      subtitle={`${sp.edition} · all recorded control decisions`}
    >
      <p>
        Selected security baseline: {sp.baseline}. Privacy applicability:{" "}
        {sp.privacyApplicable ? "Included" : "Not included"}. A reviewed input
        is a learner assertion; it does not establish independent assurance.
        Unrecorded catalogue controls are outside this recorded-decision chart.
      </p>
      <Bars
        items={[
          "Unreviewed",
          "Not started",
          "Implementing",
          "Implemented",
          "Assessed",
          "Excluded",
        ].map((label) => ({
          label,
          value: Object.values(sp.decisions).filter((d) => state(d) === label)
            .length,
        }))}
        onSelect={(label) => {
          setFilter(label);
          explain(
            metricInsight(
              label,
              "Recorded system-control decisions in this snapshot.",
              "Count saved control IDs with this reviewed/applicability/status combination.",
              "Inspect owner, scope, evidence and actual findings before reliance. Assessed does not mean passed.",
              "control",
            ),
          );
        }}
      />
      <button onClick={() => setFilter("All")}>
        Show all control assertions
      </button>
      <ControlDecisionTable decisions={sp.decisions} filter={filter} />
    </Panel>
  );
}
