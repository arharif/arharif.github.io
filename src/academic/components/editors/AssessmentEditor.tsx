import type { ControlAssessment, FrameworkControl } from "../../data/types";
import { Field, Source } from "../shared";
import { statuses } from "../../utils/engines";
export default function AssessmentEditor({
  control,
  draft,
  setDraft,
  onSave,
  message,
}: {
  control: FrameworkControl;
  draft: ControlAssessment;
  setDraft: (d: ControlAssessment) => void;
  onSave: () => void;
  message: string;
}) {
  return (
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
      <h3 style={{ marginTop: "1rem" }}>Assess this item</h3>
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
      <button className="primary" onClick={onSave}>
        Save assessment
      </button>
      <p role="status">{message}</p>
    </article>
  );
}
