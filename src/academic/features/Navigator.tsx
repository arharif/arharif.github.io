import { useState } from "react";
import { Link } from "react-router-dom";
import { academicSearch } from "../data/search";
import { base, Field, Header } from "../components/shared";
export default function Navigator() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const results = academicSearch(submitted);
  return (
    <>
      <Header
        eyebrow="Verified Knowledge Navigator"
        title="Find your next learning step"
      >
        <p>
          A deterministic search guide over published academy metadata. It
          retrieves lessons, frameworks, laboratories and source-linked
          resources without a hosted language model.
        </p>
      </Header>
      <form
        className="xa-panel"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim().slice(0, 240));
        }}
      >
        <Field label="What would you like to learn?">
          <input
            value={query}
            maxLength={240}
            required
            onChange={(e) => setQuery(e.target.value)}
            placeholder="For example, risk assessment or AI evaluation"
          />
        </Field>
        <button className="primary" type="submit">
          Find learning material
        </button>
      </form>
      <div className="xa-actions">
        {["risk", "incident", "AI", "framework"].map((term) => (
          <button
            key={term}
            onClick={() => {
              setQuery(term);
              setSubmitted(term);
            }}
          >
            {term}
          </button>
        ))}
      </div>
      {submitted && (
        <section aria-live="polite">
          <h2>Learning matches</h2>
          {!results.length ? (
            <p>
              I could not find a reliable match in the published academy
              metadata. Browse the learning catalogue or consult an original
              source in the resource library.
            </p>
          ) : (
            results.map((row) => (
              <article
                key={`${row.path}-${row.title}`}
                className="xa-panel"
                style={{ marginBottom: ".7rem" }}
              >
                <p className="xa-eyebrow">{row.type}</p>
                <h3>
                  <Link to={`${base}${row.path}`}>{row.title}</Link>
                </h3>
                <p>{row.description}</p>
              </article>
            ))
          )}
        </section>
      )}
      <section className="xa-panel">
        <h2>AI tutor integration status</h2>
        <p>
          The hosted tutor is unavailable. A future integration requires an
          authenticated server-side endpoint, request validation, rate limits,
          source-grounded retrieval, safe output handling and privacy-conscious
          logging. Browser API keys are never accepted.
        </p>
        <p>
          Current guidance is navigation metadata. Framework explanations are
          educational interpretation. Case studies and lab results are
          fictional. Publisher references establish the source of authoritative
          material.
        </p>
      </section>
    </>
  );
}
