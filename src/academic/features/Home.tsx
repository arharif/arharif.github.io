import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Network,
  BrainCircuit,
  FlaskConical,
} from "lucide-react";
import { tracks, modules } from "../data/curriculum";
import { labLinks, scenarios } from "../data/cases";
import { resources } from "../data/resources";
import { academicSearch } from "../data/search";
import { base, Field, Source } from "../components/shared";
export default function Home() {
  const [query, setQuery] = useState("");
  const icons = [ShieldCheck, Network, BrainCircuit];
  return (
    <>
      <header className="xa-hero">
        <p className="xa-eyebrow">X1 Academic · Learning through practice</p>
        <h1>
          Understand cybersecurity.
          <br />
          Master risk.
          <br />
          <em>Govern AI.</em>
        </h1>
        <p className="xa-intro">
          Learn through interactive frameworks, realistic business scenarios,
          practical assessments and evidence-based guidance — from foundational
          concepts to executive decision-making.
        </p>
        <div className="xa-actions">
          <Link className="xa-button primary" to={`${base}/learning`}>
            Find your learning path <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="xa-button secondary" to={`${base}/labs`}>
            Explore the laboratories
          </Link>
        </div>
      </header>
      <div className="xa-search">
        <Field label="Search lessons, frameworks, laboratories and resources">
          <input
            type="search"
            value={query}
            maxLength={240}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try risk, incident response or model evaluation"
          />
        </Field>
        {query && (
          <div className="xa-panel" aria-live="polite">
            {academicSearch(query).map((row) => (
              <p key={`${row.path}-${row.title}`}>
                <Link to={`${base}${row.path}`}>{row.title}</Link>
                <br />
                <small>
                  {row.type} · {row.description}
                </small>
              </p>
            ))}
            {!academicSearch(query).length && (
              <p>
                No matches. Try a broader concept or explore the three pathways
                below.
              </p>
            )}
          </div>
        )}
      </div>
      <section>
        <div className="xa-section-heading">
          <h2>Three disciplines. Connected practice.</h2>
        </div>
        <div className="xa-grid">
          {tracks.map((track, index) => {
            const Icon = icons[index];
            return (
              <Link
                className="xa-card"
                key={track.id}
                to={`${base}/${track.id}`}
              >
                <Icon
                  size={25}
                  aria-hidden="true"
                  style={{
                    color: index === 2 ? "#b6a8f4" : "var(--xa-accent)",
                    marginBottom: "1.5rem",
                  }}
                />
                <h3>{track.title}</h3>
                <p>{track.summary}</p>
                <span className="xa-card-link">Explore the academy →</span>
              </Link>
            );
          })}
        </div>
      </section>
      <section>
        <div className="xa-section-heading">
          <h2>Learn by making decisions</h2>
          <Link to={`${base}/labs`}>All laboratories →</Link>
        </div>
        <div className="xa-grid two">
          {labLinks.map((lab) => (
            <Link
              className="xa-card"
              key={lab.id}
              to={`${base}/labs/${lab.id}`}
            >
              <div className="xa-tags">
                <FlaskConical size={16} aria-hidden="true" />
                <span>Interactive laboratory</span>
              </div>
              <h3 style={{ marginTop: ".8rem" }}>{lab.title}</h3>
              <p>{lab.detail}</p>
              <span className="xa-card-link">{lab.label} →</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="xa-section-heading">
          <h2>Start with a focused lesson</h2>
          <Link to={`${base}/progress`}>Your progress →</Link>
        </div>
        <p className="xa-muted">
          Discover a concept, practise in a laboratory, pass a knowledge check
          and produce a deliverable. These three modules are complete. The wider
          curriculum is labelled by publication status.
        </p>
        <div className="xa-grid">
          {modules.map((module) => (
            <Link
              key={module.id}
              to={`${base}/learning/${module.id}`}
              className="xa-card"
            >
              <p className="xa-eyebrow">
                {tracks.find((track) => track.id === module.discipline)!.title}
              </p>
              <h3>{module.title}</h3>
              <span className="xa-card-link">Start the module →</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="xa-grid two">
        <div className="xa-panel">
          <h2>One case. Several perspectives.</h2>
          <p>
            Follow the same business service from risk and control evidence to
            incident response and a board-level decision.
          </p>
          {scenarios.map((scenario) => (
            <p key={scenario.id}>
              <Link to={`${base}/case-studies`}>{scenario.name}</Link>
              <br />
              <small>
                {scenario.sector} · Fictional educational organisation
              </small>
            </p>
          ))}
        </div>
        <div className="xa-panel">
          <h2>Build a professional capability</h2>
          <p>
            Explore existing role responsibilities, connect skills to published
            modules and use exercises to practise the deliverables a role
            requires.
          </p>
          <div className="xa-actions">
            <Link className="xa-button" to={`${base}/security-map`}>
              Roles & competencies
            </Link>
            <Link className="xa-button" to={`${base}/certifications`}>
              Certification pathways
            </Link>
          </div>
          <h3 style={{ marginTop: "1.5rem" }}>Knowledge navigator</h3>
          <p>
            A source-linked local search guide helps you find the next lesson.
            It works without a paid AI service.
          </p>
          <Link to={`${base}/assistant`}>Ask the navigator →</Link>
        </div>
      </section>
      <section>
        <div className="xa-section-heading">
          <h2>Go to the source</h2>
          <Link to={`${base}/resources`}>Research & resources →</Link>
        </div>
        <div className="xa-grid">
          {resources
            .filter((row) => ["csf", "attack", "ai-rmf"].includes(row.id))
            .map((resource) => (
              <article className="xa-panel" key={resource.id}>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <Source href={resource.url}>{resource.publisher}</Source>
              </article>
            ))}
        </div>
        <p className="xa-muted" style={{ marginTop: "1rem" }}>
          Educational content reviewed 20 November 2026. Framework release and
          external-link verification status are documented with each source.
          Original research is available through the{" "}
          <Link to="/professional">professional gateway</Link>.
        </p>
      </section>
    </>
  );
}
