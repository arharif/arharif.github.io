import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header, Field, base } from "../components/shared";
import { metricExplanation, useExplanation } from "../components/Explanation";
interface Concept {
  id: string;
  title: string;
  domain: string;
  meaning: string;
  example: string;
  lesson: string;
  links: string[];
}
const concepts: Concept[] = [
  {
    id: "business",
    title: "Business process",
    domain: "Governance",
    meaning:
      "An activity that delivers an organisational objective and depends on people, services and information.",
    example:
      "PaySecure authorises payment transactions. PetroShield monitors production.",
    lesson: "risk-assessment",
    links: ["asset", "decision"],
  },
  {
    id: "asset",
    title: "Asset or service",
    domain: "Cybersecurity",
    meaning:
      "Something of value whose confidentiality, integrity, availability or trustworthy operation matters.",
    example:
      "A payment API, OT gateway or IIoT telemetry broker supports a critical business process.",
    lesson: "incident-triage",
    links: ["business", "threat", "vulnerability"],
  },
  {
    id: "threat",
    title: "Threat event",
    domain: "Cybersecurity",
    meaning:
      "A potential adverse event or actor action affecting an asset and objective.",
    example:
      "A stolen supplier identity performs an unauthorised configuration change.",
    lesson: "incident-triage",
    links: ["asset", "vulnerability", "risk"],
  },
  {
    id: "vulnerability",
    title: "Vulnerability",
    domain: "Cybersecurity",
    meaning:
      "A weakness or exposure through which a threat can affect the service.",
    example:
      "Standing supplier privileges remain broad and access-review evidence is incomplete.",
    lesson: "risk-assessment",
    links: ["asset", "threat", "risk", "control"],
  },
  {
    id: "risk",
    title: "Risk",
    domain: "Governance",
    meaning: "Uncertainty about events and consequences for objectives.",
    example:
      "Supplier access misuse may interrupt payment authorisation or production monitoring.",
    lesson: "risk-assessment",
    links: ["threat", "vulnerability", "control", "decision"],
  },
  {
    id: "control",
    title: "Control",
    domain: "Cybersecurity",
    meaning:
      "A safeguard selected to modify exposure under stated assumptions.",
    example:
      "Time-bound supplier access and correlated monitoring support risk treatment.",
    lesson: "risk-assessment",
    links: ["risk", "framework", "evidence", "safeguard"],
  },
  {
    id: "framework",
    title: "Framework",
    domain: "Governance",
    meaning:
      "A structured set of outcomes, requirements, guidance or criteria with a particular purpose and scope.",
    example:
      "CSF outcomes, SP 800-53 controls and ISO 27001 ISMS requirements serve different purposes.",
    lesson: "risk-assessment",
    links: ["control", "assessment", "governance"],
  },
  {
    id: "evidence",
    title: "Evidence",
    domain: "Assurance",
    meaning: "Traceable records or observations used in a scoped assessment.",
    example:
      "Access-review samples, account removal events and a tested restoration record.",
    lesson: "risk-assessment",
    links: ["control", "assessment", "evaluation"],
  },
  {
    id: "assessment",
    title: "Assessment",
    domain: "Assurance",
    meaning:
      "Evaluate evidence against criteria within a defined scope, period and method.",
    example:
      "An independent assessor samples access reviews and records exceptions.",
    lesson: "risk-assessment",
    links: ["framework", "evidence", "decision"],
  },
  {
    id: "decision",
    title: "Executive decision",
    domain: "Governance",
    meaning:
      "An accountable choice balancing objectives, exposure, evidence and constraints.",
    example:
      "The risk committee reviews a time-bound acceptance recommendation with monitoring conditions.",
    lesson: "risk-assessment",
    links: ["assessment", "business", "risk", "governance"],
  },
  {
    id: "model",
    title: "AI model",
    domain: "AI",
    meaning:
      "A defined function or learned system mapping inputs to predictions or generated outputs.",
    example:
      "A detector assigns suspicious-event scores to SmartFactory telemetry.",
    lesson: "detection-evaluation",
    links: ["data", "evaluation", "governance"],
  },
  {
    id: "data",
    title: "Data & provenance",
    domain: "AI",
    meaning:
      "Inputs, labels, sampling and lineage define the evaluation context.",
    example:
      "A new production line changes telemetry and makes old evaluation data less representative.",
    lesson: "detection-evaluation",
    links: ["model", "privacy", "evaluation"],
  },
  {
    id: "safeguard",
    title: "AI safeguard",
    domain: "AI",
    meaning:
      "A measure addressing AI-system risks through lifecycle and operational controls.",
    example:
      "Separate holdout labels, restrict data access and require a release gate.",
    lesson: "detection-evaluation",
    links: ["control", "data", "evaluation"],
  },
  {
    id: "evaluation",
    title: "AI evaluation",
    domain: "AI",
    meaning:
      "Analyse system behaviour under a declared protocol and document limits.",
    example:
      "Compare false positives, missed events and threshold behaviour on fixed synthetic predictions.",
    lesson: "detection-evaluation",
    links: ["model", "data", "safeguard", "evidence", "governance"],
  },
  {
    id: "governance",
    title: "AI governance",
    domain: "AI",
    meaning:
      "Accountability, decisions and oversight for the AI system and its impacts.",
    example:
      "An owner approves intended use, release criteria, monitoring and reassessment triggers.",
    lesson: "detection-evaluation",
    links: ["model", "evaluation", "framework", "decision"],
  },
  {
    id: "privacy",
    title: "Privacy",
    domain: "Privacy",
    meaning:
      "Consider the effects of personal-data processing on individuals and the relevant duties.",
    example:
      "Minimise personnel identifiers in detection telemetry and assess processing roles and purposes.",
    lesson: "detection-evaluation",
    links: ["data", "risk", "governance"],
  },
];
const colours: Record<string, string> = {
  Governance: "#79b6d5",
  Cybersecurity: "#71c6b0",
  Assurance: "#d6b674",
  AI: "#b1a1da",
  Privacy: "#c7a3b7",
};
export default function KnowledgeGraph() {
  const { explain } = useExplanation(),
    location = useLocation();
  const [selected, setSelected] = useState(
      new URLSearchParams(location.search).get("concept") || "risk",
    ),
    [query, setQuery] = useState(""),
    [domain, setDomain] = useState(""),
    [expanded, setExpanded] = useState(false),
    [zoom, setZoom] = useState(1);
  const active = concepts.find((row) => row.id === selected) ?? concepts[4];
  const connected = new Set([
    active.id,
    ...active.links,
    ...concepts
      .filter((row) => row.links.includes(active.id))
      .map((row) => row.id),
  ]);
  const visible = concepts.filter(
    (row) =>
      (!domain || row.domain === domain) &&
      `${row.title} ${row.meaning}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (expanded || connected.has(row.id)),
  );
  const positions = new Map(
    visible.map((row, index) => [
      row.id,
      {
        x:
          420 +
          270 * Math.cos((index / visible.length) * Math.PI * 2 - Math.PI / 2),
        y:
          280 +
          190 * Math.sin((index / visible.length) * Math.PI * 2 - Math.PI / 2),
      },
    ]),
  );
  const choose = (id: string) => {
    setSelected(id);
    const row = concepts.find((value) => value.id === id)!;
    explain({
      ...metricExplanation(
        row.title,
        row.domain,
        row.meaning,
        row.domain === "AI" ? "ai" : "risk",
      ),
      id: `concept-${row.id}`,
      meaning: row.meaning,
      technical: row.example,
      business: row.example,
      actions: [
        `Explore connected concepts: ${row.links.map((id) => concepts.find((value) => value.id === id)!.title).join(", ")}.`,
        "Apply the concept in a linked laboratory.",
        "Review the related learning before making a decision.",
      ],
      lesson: row.lesson,
    });
  };
  return (
    <>
      <Header
        eyebrow="Connected knowledge · explore relationships"
        title="Interactive knowledge graph"
      >
        <p>
          Trace a business service through risk, controls and evidence, or
          connect AI data and evaluation to governance.
        </p>
      </Header>
      <div className="xa-grid two">
        <Field label="Search knowledge concepts">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Knowledge domain">
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          >
            <option value="">All domains</option>
            {Object.keys(colours).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="xa-actions">
        <button onClick={() => setZoom(Math.max(0.6, zoom - 0.2))}>
          Zoom out
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(2, zoom + 0.2))}>
          Zoom in
        </button>
        <button aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Focus connections" : "Expand all clusters"}
        </button>
        <button
          onClick={() => {
            setQuery("");
            setDomain("");
            setExpanded(false);
            setZoom(1);
            choose("risk");
          }}
        >
          Reset graph
        </button>
      </div>
      <div
        className="xa-graph-canvas"
        role="region"
        aria-label="Knowledge network canvas"
        tabIndex={0}
      >
        <svg
          viewBox={`${420 - 420 / zoom} ${280 - 280 / zoom} ${840 / zoom} ${560 / zoom}`}
          role="group"
          aria-label="Selectable concept network"
        >
          {visible.flatMap((row) =>
            row.links
              .filter((id) => positions.has(id))
              .map((id) => {
                const from = positions.get(row.id)!,
                  to = positions.get(id)!;
                return (
                  <line
                    key={`${row.id}-${id}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={
                      row.id === selected || id === selected
                        ? "var(--xa-accent)"
                        : "var(--xa-line)"
                    }
                    strokeWidth={row.id === selected || id === selected ? 2 : 1}
                  />
                );
              }),
          )}
          {visible.map((row) => {
            const p = positions.get(row.id)!;
            return (
              <g
                key={row.id}
                tabIndex={0}
                role="button"
                aria-label={`Explore ${row.title}`}
                onClick={() => choose(row.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    choose(row.id);
                  }
                }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={row.id === selected ? 27 : 21}
                  fill="var(--xa-panel)"
                  stroke={colours[row.domain]}
                  strokeWidth={row.id === selected ? 4 : 2}
                />
                <circle cx={p.x} cy={p.y} r="5" fill={colours[row.domain]} />
                <text x={p.x} y={p.y + 43} textAnchor="middle" fontSize="12">
                  {row.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {!visible.length && (
        <p>No concepts match. Clear filters to restore the network.</p>
      )}
      <section className="xa-panel">
        <h2>{active.title}</h2>
        <p>{active.meaning}</p>
        <p>{active.example}</p>
        <div className="xa-actions">
          <Link className="xa-button" to={`${base}/learning/${active.lesson}`}>
            Study the concept
          </Link>
          <Link className="xa-button" to={`${base}/standards`}>
            Explore standards
          </Link>
          <Link
            className="xa-button"
            to={`${base}/${active.domain === "AI" ? "labs/ai-experiment" : "risk-register"}`}
          >
            Apply in a simulation
          </Link>
        </div>
        <details open>
          <summary>Accessible relationship hierarchy</summary>
          <ul>
            {concepts
              .filter(
                (row) =>
                  (!domain || row.domain === domain) &&
                  `${row.title} ${row.meaning}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              )
              .map((row) => (
                <li key={row.id}>
                  <button
                    className="xa-record-link"
                    onClick={() => choose(row.id)}
                  >
                    {row.title}
                  </button>
                  <p>{row.meaning}</p>
                  <ul>
                    {row.links.map((id) => (
                      <li key={id}>
                        <button
                          className="xa-record-link"
                          onClick={() => choose(id)}
                        >
                          {concepts.find((value) => value.id === id)!.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </details>
      </section>
    </>
  );
}
