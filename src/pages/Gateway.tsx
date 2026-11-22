import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const worlds = [
  {
    id: "games",
    path: "/games",
    title: "X1 Games",
    sub: "Interactive Games & Challenges",
  },
  {
    id: "insights",
    path: "/insights-innovation",
    title: "X1 Insights & Innovation",
    sub: "Ideas, Philosophy & Emerging Trends",
  },
  {
    id: "academic",
    path: "/x1-academic",
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
          >
            <img
              src={"/art/" + world.id + ".webp"}
              alt=""
              width="768"
              height="400"
              fetchPriority="high"
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
