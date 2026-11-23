import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPublishedContent, listPublishedTopics } from "@/lib/cms";
import { searchIndex } from "@/data/searchIndex";
import { originals } from "@/components/arcade/catalog";
import type { ContentRecord, TopicRecord } from "@/content/types";

const destinations = [
  ...searchIndex,
  ...originals.map((g) => ({
    id: g.key,
    title: g.title,
    path: "/games?game=" + g.key,
    description: g.desc,
    keywords: [g.type, "game"],
  })),
  {
    id: "academic",
    title: "X1 Academic",
    path: "/x1-academic",
    description: "Standards, assessments and simulators.",
    keywords: ["learning", "NIST"],
  },
  {
    id: "insights",
    title: "Insights & Innovation",
    path: "/insights-innovation",
    description: "Search published articles and ideas.",
    keywords: ["editorial", "books"],
  },
];
export default function SearchPage() {
  const [query, setQuery] = useState(""),
    [topics, setTopics] = useState<TopicRecord[]>([]),
    [rows, setRows] = useState<ContentRecord[]>([]);
  const [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setError(false);
    Promise.all([listPublishedTopics(), listPublishedContent()])
      .then(([t, r]) => {
        if (live) {
          setTopics(t);
          setRows(r);
        }
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  const match = (text: string) =>
    query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .every((term) => text.toLowerCase().includes(term));
  const matches = destinations
    .filter((d) =>
      match([d.title, d.description, ...(d.keywords || [])].join(" ")),
    )
    .slice(0, 12);
  const topicMatches = topics.filter((t) =>
    match([t.title, t.description, t.category].join(" ")),
  );
  const content = rows.filter((r) =>
    match([r.title, r.body, r.excerpt, ...(r.tags || [])].join(" ")),
  );
  return (
    <section>
      <h1 className="mb-4 text-3xl font-semibold">Search</h1>
      <label className="glass mb-5 block rounded-2xl p-3">
        <span className="sr-only">Search the website</span>
        <input
          type="search"
          maxLength={120}
          placeholder="Search topics, articles, games and frameworks"
          className="w-full bg-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert">
          Published content could not be loaded.{" "}
          <button onClick={() => setAttempt(attempt + 1)}>Retry</button>
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          [
            "Pages and resources",
            matches.map((m) => ({ id: m.id, title: m.title, path: m.path })),
          ],
          [
            "Topics",
            topicMatches.map((t) => ({
              id: t.id,
              title: t.title,
              path:
                t.universe === "professional"
                  ? "/professional/topic/" + encodeURIComponent(t.slug)
                  : "/personal",
            })),
          ],
          [
            "Articles",
            content.map((r) => {
              const t = r.topic ?? topics.find((t) => t.id === r.topicId);
              return {
                id: r.id,
                title: r.title,
                path:
                  t?.universe === "professional"
                    ? "/professional/topic/" +
                      encodeURIComponent(t.slug) +
                      "#" +
                      encodeURIComponent(r.slug)
                    : "/personal/post/" + encodeURIComponent(r.slug),
              };
            }),
          ],
        ].map((group) => {
          const [title, items] = group as [
            string,
            { id: string; title: string; path: string }[],
          ];
          return (
            <section key={title}>
              <h2 className="mb-2 text-xl font-semibold">{title}</h2>
              {items.map((m) => (
                <Link
                  className="glass mb-2 block rounded-xl p-3"
                  key={m.id}
                  to={m.path}
                >
                  {m.title}
                </Link>
              ))}
              {items.length === 0 && <p className="text-muted">No matches</p>}
            </section>
          );
        })}
      </div>
    </section>
  );
}
