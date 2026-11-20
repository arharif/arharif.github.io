import { useState } from "react";
import { controls, frameworkSources, mappings } from "../data/controls";
import type { ControlAssessment } from "../data/types";
import { statuses, validateAssessment, gapSummary } from "../utils/engines";
import {
  ExportPanel,
  Field,
  Header,
  LabIntro,
  Reset,
  Source,
} from "../components/shared";
const blank = (): ControlAssessment => ({
  status: "Not assessed",
  notes: "",
  evidence: "",
  owner: "",
  justification: "",
});
export default function FrameworkLab() {
  const [framework, setFramework] = useState("nist-csf-2");
  const [selected, setSelected] = useState("GV.RR-02");
  const [query, setQuery] = useState("");
  const [register, setRegister] = useState<Record<string, ControlAssessment>>(
    {},
  );
  const [draft, setDraft] = useState(blank);
  const [message, setMessage] = useState("");
  const source = frameworkSources.find((item) => item.id === framework)!;
  const visible = controls.filter(
    (item) =>
      item.framework === framework &&
      `${item.id} ${item.title} ${item.path.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const control = controls.find((item) => item.id === selected)!;
  const summary = gapSummary(
    register,
    controls.map((item) => item.id),
  );
  const choose = (id: string) => {
    setSelected(id);
    setDraft(register[id] ?? blank());
    setMessage("");
  };
  return (
    <>
      <Header eyebrow="Laboratory · 01" title="Control & Framework Explorer">
        <p>
          Connect outcomes, implementation and evidence. Build a scoped
          assessment for a fictional service.
        </p>
      </Header>
      <LabIntro
        objectives={[
          "Navigate three distinct framework structures",
          "Separate implementation assertions from tested effectiveness",
          "Document gaps, owners and follow-up assessment",
        ]}
        reference="risk-assessment"
      >
        <p>
          The explorer contains a curated teaching subset. It does not certify
          conformity or calculate an overall compliance percentage.
        </p>
      </LabIntro>
      <div className="xa-grid two">
        <Field label="Framework">
          <select
            value={framework}
            onChange={(e) => {
              setFramework(e.target.value);
              choose(
                controls.find((item) => item.framework === e.target.value)!.id,
              );
            }}
          >
            {frameworkSources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Find an outcome or control">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Identifier, title or family"
          />
        </Field>
      </div>
      <p>
        {source.publisher} · {source.edition} · Metadata reviewed 20 November
        2026
      </p>
      <p className="xa-muted">
        {source.scope}. {source.limitation}
      </p>
      <Source href={source.url}>Official framework reference</Source>
      <div className="xa-workspace" style={{ marginTop: "1.5rem" }}>
        <nav className="xa-list" aria-label="Framework hierarchy">
          {visible.map((item) => (
            <button
              key={item.id}
              aria-pressed={selected === item.id}
              onClick={() => choose(item.id)}
            >
              <span>
                <small>
                  {item.path[0]} → {item.path[1]}
                </small>
                <br />
                {item.id} · {item.title}
              </span>
            </button>
          ))}
          {!visible.length && <p>No controls match. Try a broader search.</p>}
        </nav>
        <article className="xa-panel">
          <p className="xa-eyebrow">{control.id}</p>
          <h2>{control.title}</h2>
          <p>{control.explanation}</p>
          <dl className="xa-details">
            <dt>Business objective</dt>
            <dd>{control.objective}</dd>
            <dt>Implementation</dt>
            <dd>{control.implementation}</dd>
            <dt>Roles & assets</dt>
            <dd>
              {control.roles}. {control.assets}
            </dd>
            <dt>Assessment methods</dt>
            <dd>{control.methods}</dd>
            <dt>Possible evidence</dt>
            <dd>{control.evidence}</dd>
            <dt>Common gaps</dt>
            <dd>{control.gap}</dd>
            <dt>Associated risk</dt>
            <dd>{control.risk}</dd>
          </dl>
          <Source href={control.source}>Authoritative reference</Source>
          <h3 style={{ marginTop: "1.5rem" }}>Assess this item</h3>
          <p className="xa-muted">
            “Evidenced” records your assertion and reference. Independent
            effectiveness testing remains a follow-up activity.
          </p>
          <Field label="Assessment status">
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as ControlAssessment["status"],
                })
              }
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
          <Field label="Action owner">
            <input
              value={draft.owner}
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
            />
          </Field>
          <Field label="Evidence reference and assessment period">
            <input
              value={draft.evidence}
              maxLength={500}
              onChange={(e) => setDraft({ ...draft, evidence: e.target.value })}
              placeholder="Fictional sample reference, scope and period"
            />
          </Field>
          <Field label="Notes and next action">
            <textarea
              value={draft.notes}
              maxLength={2000}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </Field>
          {draft.status === "Not applicable" && (
            <Field label="Scope exclusion justification">
              <textarea
                value={draft.justification}
                maxLength={1000}
                onChange={(e) =>
                  setDraft({ ...draft, justification: e.target.value })
                }
              />
            </Field>
          )}
          <button
            className="primary"
            onClick={() => {
              const errors = validateAssessment(draft);
              if (errors.length) {
                setMessage(errors.join(" "));
                return;
              }
              setRegister({ ...register, [selected]: { ...draft } });
              setMessage("Assessment saved for this session.");
            }}
          >
            Save assessment
          </button>
          <p role="status">{message}</p>
        </article>
      </div>
      <section>
        <h2>Gap analysis & remediation register</h2>
        <div className="xa-statline">
          {Object.entries(summary).map(([key, value]) => (
            <div className="xa-stat" key={key}>
              <strong>{value}</strong>
              <span>{key}</span>
            </div>
          ))}
        </div>
        <p>
          Counts cover the ten-item teaching subset across all three frameworks.
          Unassessed items require scoping before any conclusion.
        </p>
        <div className="xa-table-scroll">
          <table>
            <caption>Saved assessment decisions</caption>
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Priority action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(register).map(([id, row]) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{row.status}</td>
                  <td>{row.owner || "Unassigned"}</td>
                  <td>
                    {row.notes ||
                      (row.status === "Implemented and evidenced"
                        ? "Independently sample operating effectiveness"
                        : "Scope, assign and investigate the gap")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="xa-panel">
        <h2>Comparison workspace</h2>
        <p>
          CSF describes risk outcomes. SP 800-53 provides detailed security and
          privacy controls. ISO 27001 specifies an ISMS. Similar concepts
          require contextual interpretation.
        </p>
        {mappings.map((item) => (
          <details key={item.from}>
            <summary>
              {item.from} ↔ {item.to} · {item.concept}
            </summary>
            <p>{item.rationale}</p>
            <p>
              {item.confidence}. Curated teaching relationship, reviewed 20
              November 2026. This is an author interpretation with a reference
              for mapping methodology.
            </p>
            <Source href={item.source}>
              NIST informative reference programme
            </Source>
          </details>
        ))}
      </section>
      <ExportPanel
        title="Framework assessment and gap roadmap"
        methodology="Scoped ten-item teaching subset. Status counts describe learner assertions. Gaps require risk-based prioritisation and independent follow-up. No overall conformity conclusion."
        results={{
          summary,
          assessmentRegister: register,
          followUp:
            "Validate scope, sample operating effectiveness and assign dated remediation milestones.",
        }}
        rows={Object.entries(register).map(([id, row]) => ({ id, ...row }))}
        ready={Object.keys(register).length > 0}
      />
      <Reset
        onClick={() => {
          setRegister({});
          setDraft(blank());
          setMessage("Assessment reset.");
        }}
      />
    </>
  );
}
