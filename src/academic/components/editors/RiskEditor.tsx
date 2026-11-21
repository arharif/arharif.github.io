import { useState } from "react";
import { Field } from "../shared";
import { useWorkspace } from "../../workspace/state";
import {
  riskFields,
  riskFieldLabels,
  riskStatuses,
  validateRisk,
  type RiskRecord,
} from "../../workspace/risk";
export default function RiskEditor({
  onCommit,
}: {
  onCommit: (rows: RiskRecord[]) => boolean | void;
}) {
  const {
    riskDraft: draft,
    setRiskDraft: setDraft,
    riskEditing: editing,
    rows,
    provenance,
    setProvenance,
  } = useWorkspace();
  const [errors, setErrors] = useState<string[]>([]);
  if (!draft) return null;
  return (
    <section className="xa-panel" aria-label="Risk editor">
      <h2>{editing ? "Edit risk" : "New risk"}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!editing && rows.length >= 2000) {
            setErrors(["Maximum 2000 risks per register."]);
            return;
          }
          const v = validateRisk(
            draft as unknown as Record<string, unknown>,
            new Set(
              rows
                .filter((r) => r.id !== editing)
                .map((r) => r.id.toLowerCase()),
            ),
          );
          if (v.errors.length) {
            setErrors(v.errors);
            return;
          }
          if (
            onCommit(
              editing
                ? rows.map((r) => (r.id === editing ? v.record : r))
                : [...rows, v.record],
            ) === false
          )
            return;
          setProvenance(
            provenance === "Fictional educational scenario"
              ? "Fictional scenario with learner edits"
              : provenance,
          );
          setDraft(null);
        }}
      >
        <div className="xa-grid">
          {riskFields.map((f) => (
            <Field key={f} label={riskFieldLabels[f]}>
              {f === "status" ? (
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value })
                  }
                >
                  {riskStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={draft[f]}
                  required={[
                    "id",
                    "asset",
                    "threat",
                    "likelihood",
                    "impact",
                  ].includes(f)}
                  type={
                    f.includes("Date")
                      ? "date"
                      : typeof draft[f] === "number"
                        ? "number"
                        : "text"
                  }
                  min={typeof draft[f] === "number" ? 1 : undefined}
                  max={typeof draft[f] === "number" ? 5 : undefined}
                  maxLength={3000}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [f]:
                        typeof draft[f] === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
            </Field>
          ))}
        </div>
        {!!errors.length && <p role="alert">{errors.join("; ")}</p>}
        <div className="xa-actions">
          <button className="primary" type="submit">
            Save risk
          </button>
          <button type="button" onClick={() => setDraft(null)}>
            Cancel edit
          </button>
        </div>
      </form>
    </section>
  );
}
