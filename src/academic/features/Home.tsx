import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  FlaskConical,
  Library,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { base } from "../components/shared";
import { priorityStandards } from "../studio/priorities";

const workspaces = [
  {
    id: "standards",
    title: "Explore Standards",
    detail: "Browse requirements and the evidence behind them.",
    Icon: ShieldCheck,
    parameter: "framework",
  },
  {
    id: "assess",
    title: "Assess & Simulate",
    detail: "Record findings, analyse risk or load a worked demo.",
    Icon: FlaskConical,
    parameter: "standard",
  },
  {
    id: "implement",
    title: "Implement & Plan",
    detail: "Build a roadmap, assign work and track delivery.",
    Icon: Workflow,
    parameter: "standard",
  },
] as const;

const resources = [
  { path: "security-map", label: "Security Mindmap", Icon: Network },
  { path: "resources?view=library", label: "Academic Library", Icon: Library },
  { path: "frameworks", label: "Compliance Frameworks", Icon: ShieldCheck },
];

export default function Home() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="xa-academy-home">
      <header>
        <h1>X1 Academic</h1>
        <p>
          Explore cybersecurity standards, assess evidence and plan the work
          that follows.
        </p>
      </header>
      <div className="xa-home-workspaces">
        {workspaces.map(({ id, title, detail, Icon, parameter }) => (
          <section className="xa-home-workspace" key={id}>
            <h2>
              <button
                type="button"
                aria-expanded={expanded === id}
                aria-controls={`academy-home-${id}`}
                onClick={() => setExpanded(expanded === id ? null : id)}
              >
                <span className="xa-home-icon">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
                <ChevronDown size={18} aria-hidden="true" />
              </button>
            </h2>
            <div
              id={`academy-home-${id}`}
              hidden={expanded !== id}
              className="xa-home-options"
            >
              {priorityStandards.map((standard) => (
                <Link
                  key={standard.id}
                  to={`${base}/${id}?${parameter}=${standard.id}`}
                >
                  {standard.name}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ))}
              {id === "assess" && (
                <Link to={`${base}/risk-register`}>
                  Risk Register
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>
      <nav className="xa-home-resources" aria-label="Academic resources">
        {resources.map(({ path, label, Icon }) => (
          <Link key={path} to={`${base}/${path}`}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
