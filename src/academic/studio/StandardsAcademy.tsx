import { useState } from "react";
import { Link } from "react-router-dom";
import { base, Header, Field, Source } from "../components/shared";
import { useWorkspace } from "../workspace/state";
import { standards, stageGuidance } from "./standards";
import { Panel, Flow } from "./visuals";
import { metricInsight, useInsight } from "../workspace/insights";
export default function StandardsAcademy() {
  const { studio, setStudio } = useWorkspace(),
    { explain } = useInsight(),
    [selected, setSelected] = useState("nist-csf-2"),
    [query, setQuery] = useState("");
  const s = standards.find((s) => s.id === selected)!;
  return (
    <>
      <Header
        eyebrow="EXPLORE STANDARDS / AUTHORITATIVE CONTEXT"
        title="Understand the standard before you assess it."
      >
        <p>
          Compare purpose, scope and implementation. Official text and original
          educational guidance have separate labels.
        </p>
      </Header>
      <div className="xa-toolbar">
        <Field label="Search standards">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Privacy, 800-53, ISO or resilience"
          />
        </Field>
        <Field label="Standard edition">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {standards
              .filter((s) =>
                `${s.name} ${s.scope}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.edition}
                </option>
              ))}
          </select>
        </Field>
      </div>
      <Panel title={s.name} subtitle={`${s.authority} · ${s.edition}`}>
        <div className="xa-tags">
          <span>Publication / application: {s.publicationDate}</span>
          <span>
            {s.id === "pf-1.1-ipd"
              ? "DRAFT — separate track"
              : "Edition explicitly identified"}
          </span>
        </div>
        <h3>Purpose and intended audience</h3>
        <p>{s.scope}</p>
        <p>{s.audience}</p>
        <h3>Architecture and hierarchy</h3>
        <p>{s.architecture}</p>
        <h3>Application and scope</h3>
        <p>{s.scoping}</p>
        <div className="xa-actions">
          <Link className="xa-button primary" to={`${base}${s.workspace}`}>
            Open assessment or simulation →
          </Link>
          <Link
            className="xa-button"
            to={`${base}/implement?standard=${s.id}`}
            onClick={() =>
              setStudio((p) => ({ ...p, framework: s.id, edition: s.edition }))
            }
          >
            Build implementation project →
          </Link>
          <Source href={s.url}>Authoritative publisher document</Source>
        </div>
        <p className="xs-notice">{s.limitations}</p>
        <details>
          <summary>
            Edition, source-review status and interpretation boundary
          </summary>
          <p>{s.reviewStatus}</p>
          <p>
            This implementation lifecycle, evidence prompts and scenario are
            original educational interpretations. Official NIST control/outcome
            text is explicitly labelled in the explorers. Restricted ISO/PCI
            requirements are not reproduced here.
          </p>
        </details>
      </Panel>
      <Panel
        title="Implementation lifecycle"
        subtitle="Original educational seven-stage operating model"
      >
        <Flow
          nodes={stageGuidance.map((g) => ({
            id: g.id,
            label: g.id,
            text: g.title,
          }))}
          onSelect={(id) => {
            const g = stageGuidance.find((g) => g.id === id)!;
            explain({
              ...metricInsight(
                `${g.id} · ${g.title}`,
                g.activities,
                "Follow the standard’s scope and applicability rules; this sequence is the X1 educational project structure.",
                g.evidence,
                "control",
              ),
              technical: g.activities,
              business: s.scenario,
              sources: [{ title: s.name, url: s.url }],
            });
          }}
        />
        {stageGuidance.map((g, i) => (
          <details key={g.id}>
            <summary>
              {i + 1}. {g.title}
            </summary>
            <p>{g.activities}</p>
            <p>Expected deliverable / evidence: {g.evidence}</p>
            <p>
              Responsibility: accountable service/risk owner; responsible
              implementation lead; consulted security/privacy/operations;
              independent reviewer for assurance.
            </p>
          </details>
        ))}
      </Panel>
      <div className="xa-grid two">
        <Panel
          title="Worked business scenario"
          subtitle="Fictional application"
        >
          <p>{s.scenario}</p>
          <h3>System/process figure</h3>
          <Flow
            nodes={[
              {
                id: "objective",
                label: "Business objective",
                text: studio.scope.objective,
              },
              {
                id: "service",
                label: "Service boundary",
                text: studio.scope.services || "Define the critical service",
              },
              {
                id: "control",
                label: "Requirements & controls",
                text: s.architecture,
              },
              {
                id: "evidence",
                label: "Validation & decision",
                text: "Evidence, accountable review and remaining gaps",
              },
            ]}
            onSelect={(id) =>
              explain(
                metricInsight(
                  id,
                  "Trace the business objective through service boundaries, control selection and evidence.",
                  "A conceptual process view; relationships are educational, not a certified crosswalk.",
                  s.scoping,
                  "control",
                ),
              )
            }
          />
        </Panel>
        <Panel
          title="Deliverables and professional judgement"
          subtitle="Use the shared project and report model"
        >
          <ul>
            {[
              "Scope statement and roles/RACI",
              "Current state, target outcomes and assessment methods",
              "Control decisions, evidence requests and validation plan",
              "Gap/risk register and prioritised POA&M",
              "Resource assumptions, dependencies, working calendar and Gantt",
              "Management review, acceptance and executive report",
            ].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <details>
            <summary>Frequent implementation mistakes</summary>
            <p>
              Choosing a baseline from sector alone; treating documented policy
              as operating effectiveness; treating a draft as final; copying a
              framework’s labels without defining scope; reporting a completion
              percentage as certification; closing actions without validation.
            </p>
          </details>
          <details>
            <summary>Exercise and decision challenge</summary>
            <p>
              Select one critical service. Name an applicable outcome/control,
              its owner, one potential failure, a testable evidence request and
              a delivery dependency. Explain what remains unknown before
              recommending acceptance.
            </p>
            <p>
              Knowledge check: does adopting every control establish conformity?
              No. Applicability, implementation, operating evidence and the
              relevant assessment process require separate review.
            </p>
          </details>
          <Link to={`${base}/learning/risk-assessment`}>
            Study the risk-and-evidence foundation →
          </Link>
        </Panel>
      </div>
    </>
  );
}
