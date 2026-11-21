import { useState } from "react";
import { Field } from "../components/shared";
import { useWorkspace } from "../workspace/state";
import { scopeSchema } from "./model";
import type { Standard } from "./standards";

export default function AssessmentScope({ standard }: { standard: Standard }) {
  const { studio, setStudio } = useWorkspace();
  const [draft, setDraft] = useState(studio.scope);
  const [feedback, setFeedback] = useState("");
  const boundary =
    standard.id === "pci-dss"
      ? "Cardholder data environment boundary"
      : standard.id === "iso-27001"
        ? "Information security management system boundary"
        : "CSF profile boundary";
  return (
    <details className="xa-panel xe-standard-metadata">
      <summary>
        Assessment scope · {studio.scope.services || "Service scope pending"}
      </summary>
      <p>{standard.scoping}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (
            !scopeSchema.safeParse(draft).success ||
            !draft.services.trim() ||
            !draft.boundary.trim() ||
            draft.periodStart > draft.periodEnd
          ) {
            setFeedback(
              "Record the service and boundary, and choose an assessment end date on or after its start.",
            );
            return;
          }
          setStudio((previous) => ({
            ...previous,
            scope: {
              ...previous.scope,
              services: draft.services,
              boundary: draft.boundary,
              periodStart: draft.periodStart,
              periodEnd: draft.periodEnd,
            },
          }));
          setFeedback("Assessment scope saved.");
        }}
      >
        <div className="xa-grid two">
          <Field label="Service in scope">
            <input
              required
              maxLength={4000}
              value={draft.services}
              onChange={(event) =>
                setDraft({ ...draft, services: event.target.value })
              }
            />
          </Field>
          <Field label={boundary}>
            <textarea
              required
              maxLength={4000}
              value={draft.boundary}
              onChange={(event) =>
                setDraft({ ...draft, boundary: event.target.value })
              }
            />
          </Field>
          <Field label="Assessment period start">
            <input
              type="date"
              required
              value={draft.periodStart}
              onChange={(event) =>
                setDraft({ ...draft, periodStart: event.target.value })
              }
            />
          </Field>
          <Field label="Assessment period end">
            <input
              type="date"
              required
              value={draft.periodEnd}
              onChange={(event) =>
                setDraft({ ...draft, periodEnd: event.target.value })
              }
            />
          </Field>
        </div>
        <button type="submit">Save assessment scope</button>
        {feedback && <p role="status">{feedback}</p>}
      </form>
    </details>
  );
}
