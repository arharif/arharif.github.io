import { AcademicLibraryPage } from "@/pages/AcademicLibraryPage";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAcademic } from "../app/context";
import { resources, filterResources } from "../data/resources";
import type { EducationalResource } from "../data/types";
import { base, Field, Header, Source } from "../components/shared";
type Filter =
  | "domain"
  | "type"
  | "difficulty"
  | "access"
  | "topic"
  | "framework"
  | "role";
const fields: Filter[] = [
  "domain",
  "type",
  "difficulty",
  "access",
  "topic",
  "framework",
  "role",
];
export default function Resources() {
  const [collection, setCollection] = useState("curated");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<
    Partial<Pick<EducationalResource, Filter>>
  >({});
  const { progress, setProgress } = useAcademic();
  const rows = filterResources(query, filters);
  return (
    <>
      <Header
        eyebrow="Research & resources"
        title="Follow the evidence to its source"
      >
        <p>
          A curated starting collection with transparent access and review
          metadata. The original published resource library remains available.
        </p>
      </Header>
      <div className="xa-segmented" aria-label="Resource collection">
        <button
          aria-pressed={collection === "curated"}
          onClick={() => setCollection("curated")}
        >
          Standards & learning sources
        </button>
        <button
          aria-pressed={collection === "published"}
          onClick={() => setCollection("published")}
        >
          Published Academic Library
        </button>
      </div>
      {collection === "published" ? (
        <AcademicLibraryPage embedded />
      ) : (
        <>
          <Field label="Search resource catalogue">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
          <div className="xa-grid">
            {fields.map((field) => (
              <Field key={field} label={`Filter by ${field}`}>
                <select
                  value={filters[field] ?? ""}
                  onChange={(e) =>
                    setFilters({ ...filters, [field]: e.target.value })
                  }
                >
                  <option value="">All {field} values</option>
                  {[...new Set(resources.map((row) => row[field]))].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    ),
                  )}
                </select>
              </Field>
            ))}
          </div>
          <p role="status">{rows.length} resources match.</p>
          {!rows.length && (
            <div className="xa-panel">
              <h2>No matching resources</h2>
              <p>Broaden the search or remove a filter.</p>
              <button
                onClick={() => {
                  setFilters({});
                  setQuery("");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="xa-grid two">
            {rows.map((row) => (
              <article className="xa-card" key={row.id}>
                <div className="xa-tags">
                  <span>{row.type}</span>
                  <span>{row.difficulty}</span>
                  <span>{row.access}</span>
                </div>
                <h2 style={{ marginTop: ".8rem" }}>{row.title}</h2>
                <p>{row.description}</p>
                <Source href={row.url}>{row.publisher} original source</Source>
                <p>
                  <Link to={`${base}/learning/${row.lesson}`}>
                    Related lesson →
                  </Link>
                </p>
                <details>
                  <summary>Learning & editorial metadata</summary>
                  <p>
                    Objective · Understand {row.topic.toLowerCase()} and
                    interpret evidence within its limitations.
                  </p>
                  <p>
                    Skills · {row.skills.join(", ")}. Role · {row.role}.
                    Framework · {row.framework}.
                  </p>
                  <p>
                    {row.duration}. Metadata reviewed {row.reviewed}.{" "}
                    {row.verification}. External pages can move or change
                    editions.
                  </p>
                </details>
                <button
                  onClick={() =>
                    setProgress({
                      ...progress,
                      bookmarks: progress.bookmarks.includes(row.id)
                        ? progress.bookmarks.filter((id) => id !== row.id)
                        : [...progress.bookmarks, row.id],
                    })
                  }
                >
                  {progress.bookmarks.includes(row.id)
                    ? "Remove bookmark"
                    : "Bookmark resource"}
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
