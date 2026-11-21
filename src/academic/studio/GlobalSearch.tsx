import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { academicSearch } from "../data/search";
import { standards } from "./standards";
import { base } from "../components/shared";
import { useWorkspace } from "../workspace/state";
export default function GlobalSearch() {
  const [query, setQuery] = useState(""),
    { studio } = useWorkspace();
  const term = query.trim().toLowerCase();
  const results = term
    ? [
        ...academicSearch(term),
        ...standards
          .filter((s) => `${s.name} ${s.edition}`.toLowerCase().includes(term))
          .map((s) => ({
            title: `${s.name} · ${s.edition}`,
            path: "/standards",
            type: "Standard",
            description: s.scope,
          })),
        ...studio.tasks
          .filter((t) => t.title.toLowerCase().includes(term))
          .map((t) => ({
            title: t.title,
            path: `/implement?task=${t.id}`,
            type: "Project action",
            description: t.stage,
          })),
        ...studio.findings
          .filter((f) =>
            `${f.controlId} ${f.title}`.toLowerCase().includes(term),
          )
          .map((f) => ({
            title: `${f.controlId} · ${f.title}`,
            path: "/assess",
            type: "Project finding",
            description: f.framework,
          })),
      ].slice(0, 10)
    : [];
  return (
    <div className="xs-global-search">
      <label>
        <Search size={15} aria-hidden="true" />
        <input
          aria-label="Search academy"
          type="search"
          value={query}
          maxLength={240}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search learning, standards and your project…"
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
        />
      </label>
      {term && (
        <div className="xs-search-results" aria-label="Academy search results">
          {results.length ? (
            results.map((r, i) => (
              <Link
                key={i}
                to={`${base}${r.path}`}
                onClick={() => setQuery("")}
              >
                <small>{r.type}</small>
                <strong>{r.title}</strong>
              </Link>
            ))
          ) : (
            <p>No matches. Try a control ID or a broader concept.</p>
          )}
          <button onClick={() => setQuery("")}>Close search results</button>
        </div>
      )}
    </div>
  );
}
