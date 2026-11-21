import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ShieldCheck, ListChecks } from "lucide-react";
import { base } from "../components/shared";
import { useWorkspace } from "../workspace/state";
import { useInsight } from "../workspace/insights";
import { useScenario } from "../app/context";
export default function Home() {
  const { studio } = useWorkspace(),
    { level } = useInsight(),
    scenario = useScenario(),
    [onboarding, setOnboarding] = useState(() => {
      try {
        return localStorage.getItem("x1-onboarding-v2") !== "seen";
      } catch {
        return true;
      }
    });
  return (
    <>
      <header className="xs-home-hero">
        <p className="xa-eyebrow">
          X1 ACADEMIC / A CONNECTED LEARNING WORKSPACE
        </p>
        <h1>
          Understand the standard.
          <br />
          <em>Put it into practice.</em>
        </h1>
        <p>
          {level === "Executive"
            ? "Connect assurance gaps, accountable decisions and implementation resources without losing sight of the underlying evidence."
            : level === "Practitioner"
              ? "Scope an assessment, inspect evidence, prioritise gaps and build a traceable implementation plan."
              : "Learn one concept, practise it in a fictional organisation, and turn what you find into a clear next action."}
        </p>
        <div className="xa-actions">
          <Link className="xa-button primary" to={`${base}/assess`}>
            Start a guided assessment <ArrowRight size={16} />
          </Link>
          <Link className="xa-button secondary" to={`${base}/learning`}>
            Find a learning path
          </Link>
        </div>
        <p className="xa-muted">
          Fictional scenarios · local processing · transparent methodology
        </p>
      </header>
      {onboarding && (
        <section className="xs-onboarding">
          <div>
            <strong>First time here?</strong>
            <p>
              Follow Learn → Assess → Implement → Report. Use the question-mark
              button above for an accessible interactive tutorial.
            </p>
          </div>
          <button
            onClick={() => {
              setOnboarding(false);
              try {
                localStorage.setItem("x1-onboarding-v2", "seen");
              } catch {}
            }}
          >
            Dismiss first-use guide
          </button>
        </section>
      )}
      <section className="xs-next-step">
        <div>
          <p className="xa-eyebrow">YOUR OPEN PROJECT</p>
          <h2>{scenario.name}</h2>
          <p>
            {studio.scope.services ||
              "Start by identifying the critical service and assessment boundary."}
          </p>
          <span>
            {studio.findings.length} profile records · {studio.tasks.length}{" "}
            actions · {studio.privacyRisks.length} privacy findings
          </span>
        </div>
        <Link
          className="xa-button"
          to={`${base}${studio.tasks.length ? "/implement" : studio.findings.length ? "/report" : "/assess"}`}
        >
          Continue your project →
        </Link>
      </section>
      <div className="xs-journey">
        {[
          {
            Icon: BookOpen,
            title: "Learn with context",
            text: "Definitions, business examples, exercises and authoritative sources.",
            path: "/learning",
            label: "Build your foundations",
          },
          {
            Icon: ShieldCheck,
            title: "Assess with evidence",
            text: "Current/Target Profiles, explicit assumptions and independently reviewed evidence.",
            path: "/assess",
            label: "Find the gap",
          },
          {
            Icon: ListChecks,
            title: "Implement with accountability",
            text: "Traceable actions, RACI, realistic dependencies and validation gates.",
            path: "/implement",
            label: "Plan the improvement",
          },
        ].map(({ Icon, title, text, path, label }, i) => (
          <Link key={path} to={`${base}${path}`}>
            <span className="xs-journey-number">0{i + 1}</span>
            <Icon size={22} />
            <h2>{title}</h2>
            <p>{text}</p>
            <strong>{label} →</strong>
          </Link>
        ))}
      </div>
      <section className="xa-panel">
        <h2>Explore a focused simulation</h2>
        <div className="xs-workspace-links">
          {[
            [
              "Risk Register & Simulator",
              "/labs/risk-decision",
              "Import and analyse your fictional risk register.",
            ],
            [
              "Privacy Risk & Governance",
              "/simulate/privacy",
              "Map processing and potential harms to people.",
            ],
            [
              "NIST system implementation",
              "/standards/800-53",
              "Categorise, tailor, implement and assess controls.",
            ],
            [
              "AI Experiment Studio",
              "/labs/ai-experiment",
              "Reproduce classification trade-offs from synthetic data.",
            ],
            [
              "Cyber Incident Lab",
              "/labs/cyber-incident",
              "Investigate evidence and response decisions.",
            ],
            [
              "Interactive Knowledge Graph",
              "/knowledge-graph",
              "Connect concepts across cybersecurity, risk and AI.",
            ],
          ].map(([name, path, description]) => (
            <Link key={path} to={`${base}${path}`}>
              <strong>{name}</strong>
              <span>{description}</span>
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>
      </section>
      <p className="xs-notice">
        Use fictional educational data. The academy does not certify conformity
        or replace an approved environment for confidential banking, personal or
        industrial information. Save or export a project explicitly before
        refreshing.
      </p>
    </>
  );
}
