import { useState, cloneElement, isValidElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Download, RotateCcw, ArrowUpRight } from "lucide-react";
import { useAcademic, useScenario } from "../app/context";
import { disclaimer, scenarios } from "../data/cases";
import { csv, parseCaseArtifact } from "../utils/engines";
import type { CaseArtifact } from "../data/types";
export const base = "/x1-academic";
export function Header({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="xa-page-header">
      <p className="xa-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <div className="xa-intro">{children}</div>}
    </header>
  );
}
export function Source({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  if (!/^https:\/\//.test(href)) return <span>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} <ArrowUpRight size={13} aria-hidden="true" />
    </a>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="xa-field">
      <span>{label}</span>
      {isValidElement<{ "aria-label"?: string }>(children) &&
      !children.props["aria-label"]
        ? cloneElement(children, { "aria-label": label })
        : children}
    </label>
  );
}
export function Reset({ onClick }: { onClick: () => void }) {
  return (
    <button className="xa-button secondary" onClick={onClick}>
      <RotateCcw size={15} aria-hidden="true" />
      Reset scenario
    </button>
  );
}
export function CaseSelect() {
  const { caseId, setCaseId, imported, setImported } = useAcademic();
  const scenario = useScenario();
  const [error, setError] = useState("");
  return (
    <section className="xa-case" aria-label="Scenario context">
      <div className="xa-case-controls">
        <Field label="Fictional organisation">
          <select
            value={caseId}
            onChange={(e) => {
              setCaseId(e.target.value as typeof caseId);
              setImported(null);
            }}
          >
            {scenarios.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name} · {row.sector}
              </option>
            ))}
          </select>
        </Field>
        <details className="xa-case-import">
          <summary>Import lab context (JSON)</summary>
          <Field label="Import case-state JSON">
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 100000)
                    throw new Error("Import must be smaller than 100 KB.");
                  const artifact = parseCaseArtifact(await file.text());
                  setCaseId(artifact.caseId);
                  setImported(artifact);
                  setError("");
                } catch (reason) {
                  setError(
                    reason instanceof Error ? reason.message : "Import failed.",
                  );
                }
                e.target.value = "";
              }}
            />
          </Field>
        </details>
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="xa-disclaimer">
        {disclaimer} Changing organisation starts a fresh lab workspace. Export
        your work before switching.
      </p>
      <details>
        <summary>{scenario.process} · Business context</summary>
        <dl className="xa-details">
          <dt>Service & owner</dt>
          <dd>
            {scenario.asset} · {scenario.owner}
          </dd>
          <dt>Architecture</dt>
          <dd>{scenario.architecture}</dd>
          <dt>Threat & exposure</dt>
          <dd>
            {scenario.threat} {scenario.exposure}
          </dd>
          <dt>Consequences</dt>
          <dd>{scenario.consequence}</dd>
          <dt>Dependencies</dt>
          <dd>{scenario.dependency}</dd>
          <dt>Supplier & constraint</dt>
          <dd>
            {scenario.supplier}. {scenario.constraint}
          </dd>
        </dl>
      </details>
      {imported && (
        <details open>
          <summary>Imported context · {imported.title}</summary>
          <p>
            Imported selections inform this scenario. Review their assumptions
            before making a new decision.
          </p>
          <pre className="xa-json">
            {JSON.stringify(imported.results, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
}
export function download(name: string, contents: string, mime: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ExportPanel({
  title,
  methodology,
  results,
  rows,
  ready = true,
}: {
  title: string;
  methodology: string;
  results: Record<string, unknown>;
  rows?: Record<string, unknown>[];
  ready?: boolean;
}) {
  const scenario = useScenario();
  const artifact: CaseArtifact = {
    schemaVersion: 1,
    kind: "x1-case-state",
    caseId: scenario.id,
    title,
    generatedAt: new Date().toISOString(),
    methodology,
    results,
    disclaimer,
  };
  const table = (
    rows?.length
      ? rows
      : Object.entries(results).map(([item, result]) => ({ item, result }))
  ).map((row) => ({
    document: title,
    organisation: scenario.name,
    scenario: scenario.id,
    generated: artifact.generatedAt,
    methodology,
    disclaimer,
    ...row,
  }));
  return (
    <section className="xa-panel xa-export" aria-label="Educational outputs">
      <h2>Produce your deliverable</h2>
      <p>
        {title} · Includes your current selections, assumptions and scenario
        provenance.
      </p>
      <div className="xa-actions">
        <button
          disabled={!ready}
          onClick={() =>
            download(
              `${scenario.id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`,
              JSON.stringify(artifact, null, 2),
              "application/json",
            )
          }
        >
          <Download size={15} aria-hidden="true" />
          Export JSON
        </button>
        <button
          disabled={!ready}
          onClick={() =>
            download(
              `${scenario.id}-register.csv`,
              csv(table),
              "text/csv;charset=utf-8",
            )
          }
        >
          Export CSV
        </button>
        <button disabled={!ready} onClick={() => window.print()}>
          Print / save PDF
        </button>
      </div>
      {!ready && (
        <p>
          Complete an interaction and its required fields to enable exports.
        </p>
      )}
      <details className="xa-print-report">
        <summary>Review report contents</summary>
        <p>
          {scenario.name} · {artifact.generatedAt}
        </p>
        <p>{methodology}</p>
        <pre className="xa-json">{JSON.stringify(results, null, 2)}</pre>
        <p>{disclaimer}</p>
      </details>
    </section>
  );
}
export function LabIntro({
  objectives,
  reference,
  children,
}: {
  objectives: string[];
  reference: string;
  children?: ReactNode;
}) {
  return (
    <details className="xa-guide">
      <summary>Learning objectives & reference guide</summary>
      <ul>
        {objectives.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      {children}
      <Link to={`${base}/learning/${reference}`}>
        Study the related lesson →
      </Link>
    </details>
  );
}
