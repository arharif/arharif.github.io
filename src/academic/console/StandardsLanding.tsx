import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, BookOpen, CircuitBoard, CreditCard, Fingerprint, GanttChartSquare,
  Landmark, Layers3, Radar, ShieldCheck, Workflow,
} from "lucide-react";
import { ReplayIntroduction } from "@/components/UniverseTransition";
import { LightTrails } from "@/components/LightTrails";
import { AcademicFrame } from "./AcademicFrame";
import { editions, frameworkIds, frameworkMetadata, moreStandards, names, primaryStandards, type Framework } from "./editions";
import { lessons } from "./learningContent";
import "./standardsLanding.css";

const base = "/x1-academic";
const icons = {
  "nist-800-53": ShieldCheck,
  dora: Landmark,
  gdpr: Fingerprint,
  "eu-ai-act": CircuitBoard,
  "nist-csf-2": Radar,
  "nist-ai-rmf": CircuitBoard,
  "iso-27001": Layers3,
  "pci-dss": CreditCard,
};
function demoPath(id: Framework) {
  return `${base}/assess-simulate?standard=${id}&view=profile&demo=1`;
}
function Card({ id, compact = false }: { id: Framework; compact?: boolean }) {
  const Icon = icons[id];
  const edition = editions[id];
  return (
    <article className={compact ? "standard-card standard-compact" : "standard-card"} data-standard={id}>
      <div className="standard-art" aria-hidden="true">
        {id === "dora" || id === "eu-ai-act" ? <div className="standard-art-bars">{[17, 28, 24, 39, 54, 49, 71, 82, 63, 76, 87, 94].map((level, i) => <i key={i} style={{ height: `${level}%` }} />)}</div> : <LightTrails className="standard-art-wave" />}
      </div>
      <div className="standard-copy">
        <Icon className="standard-card-icon" strokeWidth={1.6} aria-hidden="true" />
        <h3>{names[id]}</h3>
        <p className="standard-full-name">{edition.name}</p>
        <p className="standard-edition">{edition.edition}</p>
        <p className="standard-description">{edition.description}</p>
        <p className="standard-edition">{lessons[id].structure}</p>
        <a className="standard-source" href={edition.sources[0][1]} target="_blank" rel="noreferrer" aria-label={`Official source for ${names[id]}`}>Official source</a>
        <div className="standard-actions">
          <Link className="standard-explore" to={`${base}?standard=${id}`} aria-label={`Explore ${names[id]}`}>Explore <ArrowRight size={16} /></Link>
          <Link className="standard-demo" to={demoPath(id)} aria-label={`Try Demo for ${names[id]}`}>Try Demo</Link>
        </div>
      </div>
    </article>
  );
}

export default function StandardsLanding() {
  const [query] = useSearchParams();
  const [search, setSearch] = useState("");
  const matches = (id: Framework) => search.trim().toLowerCase().split(/\s+/).every((term) =>
    [names[id], editions[id].name, editions[id].edition, editions[id].description].join(" ").toLowerCase().includes(term),
  );
  const requested = query.get("standard") as Framework;
  const selected = frameworkIds.includes(requested) ? requested : undefined;
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef<Framework | undefined>(selected);
  useEffect(() => {
    if (selected !== previous.current) {
      window.scrollTo(0, 0);
      heading.current?.focus({ preventScroll: true });
    }
    previous.current = selected;
  }, [selected]);
  const standard = selected && editions[selected];
  const Icon = selected && icons[selected];
  return (
    <AcademicFrame title={selected ? names[selected] + " · X1 Academic" : "X1 Academic"} description={standard?.description}>
    <main className="standards-landing" id="xc-main">
      {selected && standard && Icon ? (
        <>
          <div className="standards-heading">
            <Link className="standards-breadcrumb" to={base}>All standards</Link>
            <div className="standards-selected-icon" aria-hidden="true"><Icon size={30} /></div>
            <h1 ref={heading} tabIndex={-1}>{names[selected]}</h1>
            <p>{standard.name} · {standard.edition}</p>
            <p>Verified <time dateTime={frameworkMetadata[selected].verified}>{frameworkMetadata[selected].verified}</time> · <a href={standard.sources[0][1]} target="_blank" rel="noreferrer">Official source</a></p>
            <Link className="standard-demo standalone" to={demoPath(selected)}>Try Demo</Link>
          </div>
          <nav className="standards-paths" aria-label={`${names[selected]} workspaces`}>
            {[
              { label: "Learn", icon: BookOpen, path: "explore", view: "learn", text: "Understand the structure, scope and requirements through examples and publisher guidance." },
              { label: "Assess & Simulate", icon: Workflow, path: "assess-simulate", view: "profile", text: "Evaluate implementation, collect evidence and explore assessed risks." },
              { label: "Plan & Implement", icon: GanttChartSquare, path: "implement-plan", view: "planner", text: "Turn gaps into an editable schedule with owners, milestones and validation." },
            ].map(({label, icon: PathIcon, path, view, text}) => (
              <Link key={path} to={`${base}/${path}?standard=${selected}&view=${view}`}>
                <PathIcon aria-hidden="true" />
                <h2>{label}</h2>
                <p>{text}</p>
                <ArrowRight className="standard-path-arrow" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </>
      ) : (
        <>
          <header className="standards-heading standards-overview-heading">
            <div className="standards-breadcrumb" aria-label="Breadcrumb"><Link to="/">Main website</Link><span aria-hidden="true">/</span> X1 Academic</div>
            <h1 ref={heading} tabIndex={-1}>X1 Academic<span>.</span></h1>
            <p>Apply leading cybersecurity, privacy and AI standards through guided learning, assessment and implementation planning.</p>
            <LightTrails className="standards-hero-trails" />
          </header>
          <section aria-labelledby="frameworks-and-standards">
            <div className="standard-index-heading">
              <h2 id="frameworks-and-standards" className="standard-featured-title">Frameworks &amp; Standards</h2>
              <input type="search" aria-label="Search frameworks and standards" placeholder="Search frameworks and standards" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="standard-primary">{primaryStandards.filter(matches).map((id) => <Card key={id} id={id} />)}</div>
            {moreStandards.some(matches) && <div className="standards-secondary">
              <div>{moreStandards.filter(matches).map((id) => <Card key={id} id={id} compact />)}</div>
            </div>}
            {search && <p role="status">{frameworkIds.filter(matches).length} matching frameworks</p>}
          </section>
          <div className="standards-replay"><ReplayIntroduction /></div>
        </>
      )}
    </main>
    </AcademicFrame>
  );
}
