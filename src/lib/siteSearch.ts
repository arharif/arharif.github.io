import { editions } from '@/academic/console/editions';
import { featureGames } from '@/components/arcade/featureGames';
import { useEffect, useMemo, useState } from "react";
import { listPublishedContent, listPublishedTopics } from "@/lib/cms";
import { searchIndex } from "@/data/searchIndex";
import { originals } from "@/components/arcade/catalog";
import { legacyCatalog } from "@/components/arcade/legacyCatalog";
import { articlePath } from "@/lib/articlePath";
import type { TopicRecord } from "@/content/types";

type Result = { id: string; title: string; path: string; description?: string; keywords?: string[] };

const tools: Result[] = [
  { id: "risk", title: "Cyber risk simulator", path: "/x1-academic/assess-simulate?view=risk", description: "Estimate loss exposure and compare risk treatments.", keywords: ["demo", "risk", "security"] },
  { id: "profile", title: "Framework profile", path: "/x1-academic/explore?view=profile", description: "Assess controls and requirements across eight frameworks." },
  { id: "ai", title: "AI experiment", path: "/x1-academic/assess-simulate?view=experiment", description: "Compare AI governance and risk scenarios." },
  { id: "planner", title: "Project dashboard", path: "/x1-academic/implement-plan?view=planner", description: "Plan and track control implementation." },
  { id: "graph", title: "Knowledge graph", path: "/x1-academic/explore?view=graph", description: "Explore relationships between cybersecurity controls." },
  { id: "matrix", title: "Risk matrix", path: "/x1-academic/assess-simulate?view=matrix", description: "Compare security risks by likelihood and impact." },
  { id: "flow", title: "Data flow map", path: "/x1-academic/assess-simulate?view=flow", description: "Explore data flows and their security controls." },
  { id: "executive", title: "Executive summary", path: "/x1-academic/assess-simulate?view=executive", description: "Review risk and control outcomes for leadership." },
  { id: "governance", title: "Governance radar", path: "/x1-academic/explore?view=governance", description: "Review governance coverage across the framework." },
  ...Object.entries(editions).map(([id, edition]) => ({
    id, title: id === "dora" ? "DORA" : id === "gdpr" ? "GDPR" : id === "eu-ai-act" ? "EU AI Act" : edition.edition,
    description: edition.description, path: "/x1-academic?standard=" + id,
    keywords: [edition.name, edition.category, "standard", "framework", "assessment"],
  })),
  ...searchIndex.filter((item) => !["admin", "landing", "games", "personal", "tech", "submitting"].includes(item.id)),
];

const games: Result[] = [...featureGames, ...originals, ...legacyCatalog].map((game) => ({
  id: game.key, title: game.title, path: "/games?game=" + game.key, description: game.desc, keywords: ["game", "play"],
}));

type Published = { topics: Result[]; articles: Result[] };
const empty: Published = { topics: [], articles: [] };
let inFlight: Promise<Published> | undefined;

function publications() {
  if (inFlight) return inFlight;
  inFlight = Promise.all([listPublishedTopics(), listPublishedContent()])
    .then(([topics, rows]) => {
      const byId = new Map(topics.map((topic) => [topic.id, topic]));
      return {
        topics: topics.map((topic: TopicRecord) => ({
          id: topic.id, title: topic.title, description: topic.description, keywords: [topic.category],
          path: topic.universe === "professional"
            ? "/professional/topic/" + encodeURIComponent(topic.slug)
            : "/insights-innovation?q=" + encodeURIComponent(topic.title),
        })),
        articles: rows.filter((row) => row.status === "published" && row.contentType !== "game").map((row) => {
          const topic = row.topic ?? byId.get(row.topicId);
          return { id: row.id, title: row.title, description: row.excerpt, path: articlePath(row, topic), keywords: [...(row.tags ?? []), topic?.title ?? "", topic?.category ?? "", row.body] };
        }),
      };
    })
    .finally(() => { inFlight = undefined; });
  return inFlight;
}

export function useSiteSearch(query: string, limit = 16) {
  const [published, setPublished] = useState(empty);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    publications().then((result) => {
      if (current) {
        setPublished(result);
        setStatus("ready");
      }
    }).catch(() => { if (current) setStatus("error"); });
    return () => { current = false; };
  }, [attempt]);

  const groups = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const find = (items: Result[]) => items.filter((item) => {
      const haystack = [item.title, item.description, ...(item.keywords ?? [])].join(" ").toLowerCase();
      return terms.every((term) => haystack.includes(term));
    }).slice(0, limit);
    return [
      { title: "Tools", items: find(tools) },
      { title: "Articles", items: find(published.articles) },
      { title: "Topics", items: find(published.topics) },
      { title: "Games", items: find(games) },
    ];
  }, [query, published, limit]);

  return { groups, status, retry: () => { setStatus("loading"); setAttempt((value) => value + 1); } };
}
