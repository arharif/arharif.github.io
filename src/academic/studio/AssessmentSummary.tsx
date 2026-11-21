import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileCheck2,
  Target,
} from "lucide-react";
import { aggregate } from "./engines";
import type { Finding, Studio } from "./model";
import type { Standard } from "./standards";
import type { AssessmentItem } from "./assessmentCatalog";
import { Radar } from "./visuals";

const functionColors = [
  "#6b61dc",
  "#3275cd",
  "#08735f",
  "#8a5513",
  "#aa4e75",
  "#506c9b",
];

export default function AssessmentSummary({
  standard,
  studio,
  items,
  findings,
  onFilter,
  tabs,
}: {
  standard: Standard;
  studio: Studio;
  items: AssessmentItem[];
  findings: Finding[];
  onFilter: (filter: string) => void;
  tabs: ReactNode;
}) {
  const [radar, setRadar] = useState("Functions");
  const nist = standard.id === "nist-csf-2";
  const weights = studio.rubric.weighting;
  const applicable = findings.filter(
    (finding) => finding.applicability === "Applicable",
  );
  const prepared = aggregate(applicable, weights);
  const groups = [...new Set(items.map((item) => item.group))];
  const families = [
    ...new Set(
      items
        .filter((item) => item.category.startsWith("GV."))
        .map((item) => item.category),
    ),
  ];
  const byArea = (name: string, field: "group" | "category") => {
    const ids = new Set(
      items.filter((item) => item[field] === name).map((item) => item.id),
    );
    return aggregate(
      applicable.filter((finding) => ids.has(finding.controlId)),
      weights,
    );
  };
  const points = (
    nist && radar === "Govern categories" ? families : groups.slice(0, 8)
  ).map((name, index) => {
    const result = byArea(
      name,
      radar === "Govern categories" ? "category" : "group",
    );
    return {
      label: nist
        ? radar === "Govern categories"
          ? name
          : ["GV", "ID", "PR", "DE", "RS", "RC"][index]
        : `${index + 1}`,
      current: result.current,
      target: result.target,
      count: result.assessed,
      name,
    };
  });
  const mature = applicable.filter(
    (finding) => finding.current !== null && finding.current >= finding.target,
  ).length;
  const partial = applicable.filter(
    (finding) =>
      finding.current !== null &&
      finding.current > 0 &&
      finding.current < finding.target,
  ).length;
  const kpis = [
    {
      label: "Assessed",
      value: prepared.assessed,
      detail: `of ${items.length} indexed items`,
      Icon: ClipboardCheck,
      filter: "Assessed",
      color: "blue",
    },
    {
      label: "At target",
      value: mature,
      detail: "Current meets target",
      Icon: Target,
      filter: "At target",
      color: "mint",
    },
    {
      label: "Partial progress",
      value: partial,
      detail: "Some progress below target",
      Icon: ChartNoAxesCombined,
      filter: "Partial",
      color: "amber",
    },
    {
      label: "Open gaps",
      value: prepared.gaps.length + prepared.unassessed,
      detail: "Below target or unknown",
      Icon: FileCheck2,
      filter: "Gaps",
      color: "rose",
    },
  ];
  return (
    <div className="xa-assess-dashboard">
      <header className="xa-assess-hero">
        <div>
          <p>
            {standard.authority} · {standard.edition}
          </p>
          <h1>{standard.name}</h1>
          <p>{studio.scope.services || standard.scope}</p>
          <span>
            {items.length} indexed items · {groups.length} areas
          </span>
        </div>
        <div
          className="xa-score-ring"
          style={
            {
              "--score": `${(prepared.current ?? 0) * 25}%`,
            } as React.CSSProperties
          }
        >
          <strong>{prepared.current?.toFixed(1) ?? "—"}</strong>
          <small>Current / 4</small>
        </div>
      </header>
      <div className="xa-assess-layout">
        <div>
          <div className="xa-assess-kpis">
            {kpis.map(({ label, value, detail, Icon, filter, color }) => (
              <button
                type="button"
                className={color}
                key={label}
                onClick={() => onFilter(filter)}
              >
                <Icon size={18} aria-hidden="true" />
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{detail}</small>
              </button>
            ))}
          </div>
          {tabs}
          <section aria-labelledby="assessment-areas">
            <h2 id="assessment-areas">
              {nist ? "CSF Functions" : "Assessment areas"}
            </h2>
            <div className="xa-assess-functions">
              {groups.map((name, index) => {
                const result = byArea(name, "group");
                const total = items.filter(
                  (item) => item.group === name,
                ).length;
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => onFilter(`Group ${name}`)}
                    style={
                      {
                        "--area-color":
                          functionColors[index % functionColors.length],
                      } as React.CSSProperties
                    }
                  >
                    <span className="xa-function-icon">
                      {nist
                        ? ["GV", "ID", "PR", "DE", "RS", "RC"][index]
                        : index + 1}
                    </span>
                    <strong>{name}</strong>
                    <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="xa-function-coverage">
                      <span>
                        {result.assessed} of {total} assessed
                      </span>
                      <strong>{result.current?.toFixed(1) ?? "—"} / 4</strong>
                    </span>
                    <progress
                      max={total}
                      value={result.assessed}
                      aria-label={`${name} assessment coverage`}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
        <aside className="xa-assess-insights" aria-label="Assessment analysis">
          <section>
            <h2>Evidence & analysis</h2>
            <p>
              {prepared.assessed
                ? `Current ${prepared.current?.toFixed(1) ?? "—"} · Target ${prepared.target?.toFixed(1) ?? "—"}`
                : "Record a finding or load the fictional demo to calculate ratings."}
            </p>
            <button type="button" onClick={() => onFilter("With evidence")}>
              {applicable.filter((finding) => finding.evidence).length} evidence
              references <ArrowUpRight size={14} aria-hidden="true" />
            </button>
          </section>
          <section>
            <h2>{nist ? "Governance radar" : "Current and target by area"}</h2>
            {nist && (
              <div className="xa-segment" aria-label="Governance radar area">
                {["Functions", "Govern categories"].map((view) => (
                  <button
                    type="button"
                    key={view}
                    aria-pressed={radar === view}
                    onClick={() => setRadar(view)}
                  >
                    {view}
                  </button>
                ))}
              </div>
            )}
            <Radar
              compact
              items={points}
              onSelect={(label) => {
                const selected = points.find((point) => point.label === label);
                if (selected)
                  onFilter(
                    `${radar === "Govern categories" ? "Category" : "Group"} ${selected.name}`,
                  );
              }}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
