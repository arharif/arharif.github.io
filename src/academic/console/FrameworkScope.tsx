import { useState } from "react";
import { baselineIds, nistActiveIds } from "./catalogue";
import { frameworkMetadata } from "./editions";
import { useProject } from "./context";
import type { Project } from "./project";

const scopeDecisions = {
  gdpr: {
    label: "DPIA decision", options: ["Screening in progress", "DPIA required", "DPIA not indicated", "Residual high risk · consult authority"],
    evidence: "RoPA or DPIA evidence reference",
  },
  dora: {
    label: "ICT risk management regime", options: ["Standard ICT framework (Articles 5–15)", "Simplified framework (Article 16)", "Entity excluded or outside scope"],
    evidence: "Scope, critical services or TLPT determination reference",
  },
  "eu-ai-act": {
    label: "AI use classification", options: ["Prohibited practice", "High risk under Annex I", "High risk under Annex III", "Transparency obligations to check", "Other scoped use"],
    evidence: "Actor mapping, classification or transitional decision reference",
  },
  "iso-27001": {
    label: "Risk treatment approval", options: ["Risk assessment pending", "Treatment under review", "SoA approved", "Residual risk accepted by owner"],
    evidence: "Treatment plan and SoA record",
  },
  "pci-dss": {
    label: "Validation pathway", options: ["Confirm with acquirer or payment brand", "SAQ", "ROC"],
    evidence: "Scope, CDE diagrams or targeted risk analysis reference",
  },
} as const;

export function FrameworkScope() {
  const { project, change } = useProject();
  const { framework, scope } = project;
  const guidance = frameworkMetadata[framework];
  const workflow = framework in scopeDecisions ? scopeDecisions[framework as keyof typeof scopeDecisions] : undefined;
  const [addition, setAddition] = useState("");
  const selected = addition.trim().toUpperCase();
  const [error, setError] = useState("");
  const patch = (fields: Partial<Project["scope"]>) =>
    change((previous) => ({ ...previous, scope: { ...previous.scope, ...fields } }));
  return (
    <details className="xc-framework-scope">
      <summary>{guidance.focus}</summary>
      <p>{guidance.scope}.</p>
      <div className="xc-fields">
        <label>
          {workflow && <>
          <label>{workflow.label}
            <select value={scope.decisionType} onChange={(event) => patch({ decisionType: event.target.value })}>
              <option value="">Review pending</option>
              {workflow.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>{workflow.evidence}
            <input value={scope.evidenceRef} maxLength={240} onChange={(event) => patch({ evidenceRef: event.target.value })} />
          </label>
        </>}
        {framework === "nist-csf-2" ? "Current Profile scope" : "Assessment scope"}
          <textarea value={scope.context} maxLength={3000} onChange={(e) => patch({ context: e.target.value })} />
        </label>
        <label>
          {({
            "nist-800-53": "Categorisation and baseline rationale",
            "nist-csf-2": "Target Profile objectives",
            "iso-27001": "Risk treatment and SoA approval criteria",
            "pci-dss": "Applicability and validation pathway",
            dora: "Regime, critical functions and authority determination",
            gdpr: "DPIA screening and consultation decision",
            "eu-ai-act": "Actor, risk classification and application date",
          })[framework]}
          <textarea value={scope.decision} maxLength={3000} onChange={(e) => patch({ decision: e.target.value })} />
        </label>
        {framework === "nist-csf-2" && (["tier", "targetTier"] as const).map((key) => (
          <label key={key}>{key === "tier" ? "Current Tier" : "Target Tier"}
            <select value={scope[key]} onChange={(e) => patch({ [key]: e.target.value })}>
              <option value="">Not selected</option>
              <option value="1">1 · Partial</option>
              <option value="2">2 · Risk Informed</option>
              <option value="3">3 · Repeatable</option>
              <option value="4">4 · Adaptive</option>
            </select>
          </label>
        ))}
        {framework === "nist-800-53" && <>
          <label>SP 800-53B starting baseline
            <select value={scope.baseline} onChange={(e) => patch({ baseline: e.target.value as Project["scope"]["baseline"] })}>
              <option value="ALL">Browse all active controls</option>
              {(["LOW", "MODERATE", "HIGH"] as const).map((id) => <option key={id} value={id}>{id} ({baselineIds(id).length})</option>)}
              <option value="NONE">Custom or privacy-only selection</option>
            </select>
          </label>
          <label><input type="checkbox" checked={scope.privacy} onChange={(e) => patch({ privacy: e.target.checked })} /> Include the separate privacy baseline ({baselineIds("PRIVACY").length})</label>
          <label>Overlay reference or local policy
            <input value={scope.overlay} maxLength={240} onChange={(e) => patch({ overlay: e.target.value })} />
          </label>
          <label>Add active control or enhancement from an overlay
            <input value={addition} maxLength={30} onChange={(e) => { setAddition(e.target.value); setError(""); }} placeholder="SA-15(13)" />
          </label>
          <button type="button" disabled={!selected} onClick={() => {
            if (!nistActiveIds.has(selected)) { setError("Enter an active SP 800-53 identifier."); return; }
            patch({ added: [...new Set([...scope.added, selected])] });
            setAddition("");
          }}>Include control</button>
          <p>Adding an enhancement includes its parent for scope review.</p>
          {error && <p role="alert">{error}</p>}
        </>}
      </div>
      {framework === "nist-800-53" && scope.added.length > 0 && (
        <ul className="xc-scope-additions">
          {scope.added.map((id) => <li key={id}><button type="button" onClick={() => patch({ added: scope.added.filter((entry) => entry !== id) })}>Remove {id} from additions</button></li>)}
        </ul>
      )}
    </details>
  );
}
