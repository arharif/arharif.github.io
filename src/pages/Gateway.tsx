import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const worlds = [
  {
    id: "games",
    path: "/games",
    load: () => import("@/components/GamesHub"),
    title: "X1 Games",
    sub: "Interactive Games & Challenges",
  },
  {
    id: "insights",
    path: "/insights-innovation",
    load: () => import("./Insights"),
    title: "X1 Insights & Innovation",
    sub: "Ideas, Philosophy & Emerging Trends",
  },
  {
    id: "academic",
    path: "/x1-academic",
    load: () => import("@/academic/app/AcademicApp"),
    title: "X1 Academic",
    sub: "Responsible AI • AI Risks • CISO Tools",
  },
];
export function Gateway() {
  return (
    <section className="gateway">
      <header className="gateway-hero">
        <h1>
          Clear Thinking for a<br className="wide-break" /> More Intelligent
          Digital World.
        </h1>
        <p>
          Exploring cybersecurity, technology, risk and human insight
          <br className="wide-break" /> through research, analysis and original
          ideas.
        </p>
        <div className="gateway-rule" aria-hidden="true" />
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
            <img
              src={"/art/" + world.id + ".webp"}
              alt=""
              srcSet={`/art/${world.id}-small.webp 448w, /art/${world.id}.webp 768w`}
              sizes="(max-width: 650px) 94vw, 31vw"
              width="768"
              height="341"
              fetchPriority={world.id === "games" ? "high" : "auto"}
            />
            <div>
              <h2>{world.title}</h2>
              <p>{world.sub}</p>
            </div>
            <span className="dest-arrow">
              <ArrowRight size={19} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
