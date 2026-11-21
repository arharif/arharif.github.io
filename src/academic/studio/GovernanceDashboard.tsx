import { useState } from "react";
import { aggregate } from "./engines";
import { Radar } from "./visuals";
import type { Studio } from "./model";
import type { AssessmentItem } from "./assessmentCatalog";

const functions = [
  "GOVERN",
  "IDENTIFY",
  "PROTECT",
  "DETECT",
  "RESPOND",
  "RECOVER",
];
const abbreviations = ["GV", "ID", "PR", "DE", "RS", "RC"];

export default function GovernanceDashboard({
  studio,
  items,
  onFilter,
}: {
  studio: Studio;
  items: AssessmentItem[];
  onFilter: (filter: string) => void;
}) {
  const [selected, setSelected] = useState("PROTECT");
  const profile = studio.findings.filter(
    (finding) => finding.framework === "nist-csf-2",
  );
  const charts = [
    {
      title: "CSF Functions",
      keys: functions,
      by: "group",
      abbrev: abbreviations,
    },
    {
      title: "Govern categories",
      keys: [
        ...new Set(
          items
            .filter((item) => item.group === "GOVERN")
            .map((item) => item.category),
        ),
      ],
      by: "category",
    },
    {
      title: `${selected[0]}${selected.slice(1).toLowerCase()} categories`,
      keys: [
        ...new Set(
          items
            .filter((item) => item.group === selected)
            .map((item) => item.category),
        ),
      ],
      by: "category",
    },
  ] as const;
  return (
    <section
      className="xa-assess-dashboard xa-governance-panel"
      aria-labelledby="xa-governance-title"
    >
      <header>
        <div>
          <h1 id="xa-governance-title">Governance dashboard</h1>
          <p>Current and target CSF profile ratings</p>
        </div>
        <label>
          Compare categories in
          <select
            aria-label="Governance comparison function"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            {functions.map((key) => (
              <option key={key}>{key}</option>
            ))}
          </select>
        </label>
      </header>
      <div className="xa-governance-grid">
        {charts.map(({ title, keys, by, ...rest }) => {
          const points = keys.map((name, index) => {
            const ids = new Set(
              items.filter((item) => item[by] === name).map((item) => item.id),
            );
            const rating = aggregate(
              profile.filter((finding) => ids.has(finding.controlId)),
              studio.rubric.weighting,
            );
            return {
              name,
              label: "abbrev" in rest ? rest.abbrev[index] : name,
              current: rating.current,
              target: rating.target,
              count: rating.assessed,
            };
          });
          return (
            <div key={title}>
              <h2>{title}</h2>
              <Radar
                compact
                items={points}
                onSelect={(label) => {
                  const name = points.find(
                    (point) => point.label === label,
                  )?.name;
                  if (name)
                    onFilter(
                      `${by === "group" ? "Group" : "Category"} ${name}`,
                    );
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
