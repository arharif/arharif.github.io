import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Network,
  ShieldCheck,
  Workflow,
  FlaskConical,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { standards } from "../data/standards";
import { labLinks } from "../data/cases";
import { modules } from "../data/curriculum";
import { academicSearch } from "../data/search";
import { base, Field } from "../components/shared";
import { useAcademic } from "../app/context";
import { useExplanation, metricExplanation } from "../components/Explanation";
const workspaces = [
  {
    id: "standards",
    title: "Explore Standards",
    description: "Understand architecture, obligations and evidence.",
    Icon: ShieldCheck,
    links: [
      ["Standards explorer", "/standards"],
      ["Try a completed assessment", "/standards?demo=1"],
      ["Connected knowledge graph", "/knowledge-graph"],
      ["Framework comparison", "/standards?view=relationships"],
    ],
  },
  {
    id: "assess",
    title: "Assess & Simulate",
    description: "Turn real inputs into explainable decisions.",
    Icon: FlaskConical,
    links: [
      ["Risk register & analytics", "/risk-register"],
      ["Control assessment", "/standards?view=assess"],
      ...labLinks
        .filter((row) => row.id !== "framework-explorer")
        .map((row) => [row.title, `/labs/${row.id}`]),
    ],
  },
  {
    id: "implement",
    title: "Implement",
    description: "Build a roadmap and manage delivery dependencies.",
    Icon: Workflow,
    links: [
      ["Implementation Gantt", "/implement"],
      ["Plan from assessment gaps", "/standards?view=results"],
      ["Implementation resources", "/resources"],
    ],
  },
  {
    id: "mindmap",
    title: "Security Mindmap",
    description: "Connect roles, skills, careers and concepts.",
    Icon: Network,
    links: [
      ["Original interactive security map", "/security-map"],
      ["Concept knowledge graph", "/knowledge-graph"],
      ["Certification explorer", "/certifications"],
      ["Academic resource library", "/resources"],
    ],
  },
];
export default function Home() {
  const [open, setOpen] = useState<string | null>("standards"),
    [query, setQuery] = useState("");
  const { progress } = useAcademic(),
    { explain } = useExplanation();
  return (
    <>
      <header className="xa-overview-header">
        <p className="xa-eyebrow">
          X1 Academic · One connected learning workspace
        </p>
        <h1>Explore. Assess. Implement.</h1>
        <p>
          Cybersecurity, governance, privacy, resilience and AI — connected
          through evidence, practice and professional judgement.
        </p>
      </header>
      <div className="xa-bubble-grid">
        {workspaces.map(({ id, title, description, Icon, links }) => (
          <section
            className={`xa-workspace-bubble ${open === id ? "is-expanded" : ""}`}
            key={id}
          >
            <button
              aria-expanded={open === id}
              aria-controls={`workspace-${id}`}
              onClick={() => {
                setOpen(open === id ? null : id);
                explain(
                  metricExplanation(
                    title,
                    description,
                    id === "standards"
                      ? "Select a standard, inspect its architecture, assess scoped teaching items and generate a roadmap."
                      : id === "implement"
                        ? "Roadmaps use explicit calendar-day durations and finish-to-start dependencies."
                        : id === "assess"
                          ? "Analytics are derived from fictional examples or learner-submitted records."
                          : "Existing role, organisational and certification data are preserved in the integrated map.",
                  ),
                );
              }}
            >
              <span className="xa-bubble-icon">
                <Icon size={29} aria-hidden="true" />
              </span>
              <strong>{title}</strong>
              <span>{description}</span>
              <ChevronDown
                size={17}
                className={open === id ? "is-rotated" : ""}
                aria-hidden="true"
              />
            </button>
            <div
              id={`workspace-${id}`}
              hidden={open !== id}
              className="xa-bubble-links"
            >
              {links.map(([label, path]) => (
                <Link key={path} to={`${base}${path}`}>
                  {label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="xa-overview-search">
        <Field label="Search standards, concepts and learning resources">
          <input
            type="search"
            value={query}
            maxLength={240}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try NIST, privacy, risk assessment or AI evaluation"
          />
        </Field>
        {query && (
          <div className="xa-panel" role="status">
            {academicSearch(query).map((row) => (
              <p key={`${row.title}-${row.path}`}>
                <Link to={`${base}${row.path}`}>{row.title}</Link>
                <small className="xa-block">{row.description}</small>
              </p>
            ))}
            {!academicSearch(query).length && (
              <p>No matches. Open a workspace above to browse its contents.</p>
            )}
          </div>
        )}
      </div>
      <section className="xa-overview-strip">
        <div>
          <strong>{standards.length}</strong>
          <span>Source-linked standards & regulatory records</span>
        </div>
        <div>
          <strong>{labLinks.length}</strong>
          <span>Connected decision laboratories</span>
        </div>
        <div>
          <strong>{modules.length}</strong>
          <span>Published teaching modules</span>
        </div>
        <div>
          <strong>{progress.completed.length}</strong>
          <span>Your completed module activities</span>
        </div>
      </section>
      <section className="xa-panel">
        <h2>Apply a concept to a professional task</h2>
        {modules.map((row) => (
          <div className="xa-pathway-row" key={row.id}>
            <div>
              <Link to={`${base}/learning/${row.id}`}>{row.title}</Link>
              <p>{row.deliverable}</p>
            </div>
            <Link
              className="xa-button secondary"
              to={`${base}/labs/${row.lab}`}
            >
              Practise →
            </Link>
          </div>
        ))}
      </section>
      <p className="xa-chart-note">
        Examples are fictional. Assessment assertions and simulation outputs
        require professional review. Publisher editions, amendments and
        regulatory applicability are tracked in each standard’s source status.
      </p>
    </>
  );
}
