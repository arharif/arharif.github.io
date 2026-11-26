import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const worlds = [
  {
    id: "academic",
    path: "/x1-academic",
    load: () => import("@/academic/app/AcademicApp"),
    title: "X1 Academic",
    sub: "Explore professional tools and interactive learning.",
    action: "Explore tools",
  },
  {
    id: "insights",
    path: "/insights-innovation",
    load: () => import("./Insights"),
    title: "X1 Insights & Innovation",
    sub: "Explore ideas, articles, philosophy and emerging trends.",
    action: "Read insights",
  },
  {
    id: "games",
    path: "/games",
    load: () => import("@/components/GamesHub"),
    title: "X1 Games",
    sub: "Play interactive games immediately.",
    action: "Play games",
  },
];
export function Gateway() {
  return (
    <section className="gateway">
      <header className="gateway-hero">
        <h1>Clear Thinking for a More Intelligent Digital World.</h1>
        <p>Cybersecurity tools, technology and philosophy articles, and games you can play in your browser.</p>
      </header>
      <div className="destinations">
        {worlds.map((world) => (
          <Link
            key={world.id}
            className={"destination dest-" + world.id}
            to={world.path}
            onPointerEnter={() => { void world.load().catch(() => undefined); }}
            onFocus={() => { void world.load().catch(() => undefined); }}
          >
            <div className="destination-art">
              <img
                src={`/art/${world.id}.webp`}
                alt=""
                srcSet={`/art/${world.id}-small.webp 448w, /art/${world.id}.webp 768w`}
                sizes="(max-width: 650px) calc(100vw - 40px), (max-width: 1260px) 32vw, 400px"
                width="768"
                height="341"
                loading={world.id === "academic" ? "eager" : "lazy"}
                fetchPriority={world.id === "academic" ? "high" : "auto"}
                decoding="async"
              />
            </div>
            <div className="destination-copy">
              <h2>{world.title}</h2>
              <p>{world.sub}</p>
              <span className="destination-action">{world.action}<ArrowUpRight size={16} aria-hidden="true" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
