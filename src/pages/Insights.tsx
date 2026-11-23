import { EditorialImage } from '@/components/EditorialImage';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Cpu,
  Globe,

  Lightbulb,
  Monitor,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { listPublishedContent, listPublishedTopics } from "@/lib/cms";
import type { ContentRecord } from "@/content/types";
import { Bookmark } from "@/components/Bookmark";
import "./insights.css";
import { readingStats } from "@/lib/readingTime";

function Philosopher({size}: {size: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M6 8c0-4 3-6 7-5 3 0 5 3 4 6l2 3-2 1c0 3-1 5-4 5h-1l1 2 4 1H5l4-3v-3c-2-1-3-4-3-7Z"/><path d="m7 9 3-2 1-2 4 1m-3 6 2 2 3-1m-5 2 2 2m-1-7h2"/>
  </svg>;
}
const topics = [
  ["Technology", Monitor, /technology|professional|security|cyber|computing/i],
  ["Ideas", Lightbulb, /ideas?|reflection|creative|thinking/i],
  ["Philosophy", Philosopher, /philosoph|existential/i],
  ["Human Behaviour", Brain, /behavio[u]?r|psycholog|human factor/i],
  ["Emerging Trends", TrendingUp, /emerging|trends?|quantum/i],
  ["AI", Cpu, /\bai\b|artificial intelligence|machine learning/i],
  ["Books", BookOpen, /books?|literar/i],
  ["Anime", Globe, /anime|manga/i],
] as const;
function taxonomy(item: ContentRecord) {
  return [
    item.topic?.title,
    item.topic?.universe,
    item.topic?.category,
    item.topic?.subcategory,
    item.contentType,
    ...(item.tags || []),
    item.title,
    item.excerpt,
  ].join(" ");
}
function cover(item: ContentRecord, index: number) {
  if (item.coverImageUrl?.startsWith("https://")) return item.coverImageUrl;
  return (
    "/art/editorial-" +
    (item.topic?.category.includes("Anime")
      ? 2
      : item.topic?.category === "Books"
        ? 3
        : index % 2) +
    ".webp"
  );
}
export default function Insights() {
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, retry] = useState(0);
  useEffect(() => {
    let live = true;
    setStatus("loading");
    Promise.all([listPublishedContent(), listPublishedTopics()])
      .then(([rows, taxonomies]) => {
        if (!live) return;
        const byId = new Map(taxonomies.map((topic) => [topic.id, topic]));
        setItems(
          rows
            .filter(
              (row) => row.status === "published" && row.contentType !== "game",
            )
            .map((row) => ({
              ...row,
              topic: row.topic || byId.get(row.topicId),
            })),
        );
        setStatus("ready");
      })
      .catch(() => {
        if (live) setStatus("error");
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  const filter = topics.find(([name]) => name === category);
  const words = query.trim().toLowerCase().split(/\s+/);
  const filtered = items.filter(
    (row) =>
      (!filter || filter[2].test(taxonomy(row))) &&
      words.every((word) =>
        (taxonomy(row) + " " + row.body).toLowerCase().includes(word),
      ),
  );
  return (
    <section className="insights">
      <header className="insights-hero">
        <p className="cosmic-kicker">Knowledge &amp; Exploration</p>
        <h1>Insights &amp; Innovation</h1>
        <p className="insights-intro">
          Exploring technology, ideas, philosophy, human behaviour and emerging
          trends, connecting curiosity, critical thinking and different
          perspectives to better understand how the world is changing.
        </p>
        <label className="insights-search">
          <Search size={19} />
          <input
            type="search"
            aria-label="Search insights"
            placeholder="Search insights, ideas, topics and more..."
            value={query}
            maxLength={160}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
        </label>
        <div className="cosmic-filters" aria-label="Article categories">
          {topics.map(([name, Icon]) => (
            <button
              key={name}
              aria-pressed={category === name}
              onClick={() => setCategory(category === name ? "" : name)}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </div>
      </header>
      {status === "ready" && (
        <div className="editorial-grid">
          {filtered.map((row) => {
            const index = items.indexOf(row);
            const href =
              row.topic?.universe === "professional"
                ? "/professional/topic/" +
                  encodeURIComponent(row.topic.slug) +
                  "#" +
                  encodeURIComponent(row.slug)
                : "/personal/post/" + encodeURIComponent(row.slug);
            return (
              <article key={row.id} className="editorial-card">
                <Bookmark id={row.id} title={row.title} />
                <Link to={href}>
                  <EditorialImage
                    src={cover(row, index)}
                    alt=""
                    width="380"
                    height="210"
                    loading={index > 3 ? "lazy" : "eager"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      if (!e.currentTarget.src.includes("/art/editorial-"))
                        e.currentTarget.src =
                          "/art/editorial-" + (index % 4) + ".webp";
                    }}
                  />
                  <h2>{row.title}</h2>
                  <p>{row.excerpt}</p>
                </Link>
                <small>
                  <i />
                  {row.topic?.category ||
                    row.contentType.replace(/_/g, " ")} ·{" "}
                  {readingStats(row.body, row.readingMinutes).minutes} min read
                </small>
              </article>
            );
          })}
        </div>
      )}
      <div className="insights-status" data-loading={status === "loading"} role="status">
        {status === "loading" ? (
          "Loading published articles…"
        ) : status === "error" ? (
          <>
            Articles could not be loaded.{" "}
            <button onClick={() => retry(attempt + 1)}>Retry</button>
          </>
        ) : !filtered.length ? (
          <>
            No published articles match this selection.{" "}
            <button
              onClick={() => {
                setCategory("");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </>
        ) : null}
      </div>
      <nav
        className="collection-links"
        aria-label="Browse existing collections"
      >
        <Link to="/professional">Technology &amp; Innovation →</Link>
        <Link to="/personal">Curiosities &amp; Philosophy →</Link>
      </nav>
    </section>
  );
}
