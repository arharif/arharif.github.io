import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  Expand,
  FilePlus2,
  FolderOpen,
  GanttChartSquare,
  GitFork,
  Globe2,
  House,
  Layers3,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Minimize2,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Radar as RadarIcon,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  Waypoints,
  X,
} from "lucide-react";
import { X1Mark } from "@/components/branding/X1Mark";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { palettes } from "@/lib/palettes";
import { useTheme } from "@/lib/theme";
import { frameworkIds, names, type Framework } from "./catalogue";
import { downloadProject, ProjectProvider, useProject } from "./context";
import { Dialog } from "./ui";
import { Profile, Governance } from "./Controls";
import { RiskDashboard } from "./Risks";
import { DataFlow, Knowledge } from "./Maps";
import { Planner } from "./Planner";
import { Experiment } from "./Experiment";
import "./console.css";

const base = "/x1-academic";
const spaces = [
  {
    path: "explore",
    title: "Explore Standards",
    desc: "Navigate framework architecture, assess controls and compare maturity profiles.",
    icon: Layers3,
    color: "#7da8ff",
    views: [
      { id: "profile", label: "Framework profile", icon: ShieldCheck },
      { id: "graph", label: "Knowledge graph", icon: Waypoints },
      { id: "governance", label: "Governance radar", icon: RadarIcon },
    ],
  },
  {
    path: "assess-simulate",
    title: "Assess & Simulate",
    desc: "Investigate risk exposure, test treatments and trace the evidence behind each result.",
    icon: Activity,
    color: "#69dbb5",
    views: [
      { id: "risk", label: "Cyber risk", icon: Activity },
      { id: "matrix", label: "Risk matrix", icon: LayoutDashboard },
      {
        id: "executive",
        label: "Executive dashboard",
        icon: ChartNoAxesCombined,
      },
      { id: "experiment", label: "AI experiment", icon: SlidersHorizontal },
      { id: "flow", label: "Data flow map", icon: GitFork },
    ],
  },
  {
    path: "implement-plan",
    title: "Implement & Plan",
    desc: "Turn security objectives into a dependency-aware schedule with owners and milestones.",
    icon: GanttChartSquare,
    color: "#d7acff",
    views: [
      { id: "planner", label: "Project dashboard", icon: GanttChartSquare },
    ],
  },
];
type Space = (typeof spaces)[number];
const secondary = [
  ["Security Mindmap", "/security-mindmap"],
  ["Compliance Frameworks", "/compliance-frameworks"],
  ["Academic Library", "/academic-library"],
  ["X1 Insights", "/insights-innovation"],
  ["X1 Games", "/games"],
];
function Illustration({ index }: { index: number }) {
  const id = "mini" + index,
    st = spaces[index].color;
  const hubs = [
    [93, 65],
    [142, 37],
    [200, 62],
    [201, 113],
    [136, 136],
    [76, 113],
  ];
  return (
    <svg className="xc-illustration" viewBox="0 0 300 165" aria-hidden="true">
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r=".85" fill={st} opacity=".31" />
        </pattern>
        <linearGradient id={id + "fade"} x2="1" y2="1">
          <stop stopColor={st} stopOpacity=".28" />
          <stop offset="1" stopColor={st} stopOpacity=".02" />
        </linearGradient>
      </defs>
      <rect width="300" height="165" fill={"url(#" + id + ")"} />
      {index === 0 ? (
        <g fill="none" stroke={st}>
          {[37, 64, 84].map((r) => (
            <ellipse
              key={r}
              cx="147"
              cy="85"
              rx={r * 1.23}
              ry={r * 0.68}
              strokeDasharray="2 5"
              opacity=".4"
            />
          ))}
          {hubs.map(([x, y], i) => (
            <g key={i}>
              <line x1="147" y1="85" x2={x} y2={y} opacity=".8" />
              {[0, 1, 2].map((j) => {
                const xx = x + Math.cos(i + j * 1.7) * 24,
                  yy = y + Math.sin(i + j) * 16;
                return (
                  <g key={j}>
                    <line x1={x} y1={y} x2={xx} y2={yy} opacity=".55" />
                    <circle cx={xx} cy={yy} r="2" fill={st} />
                  </g>
                );
              })}
              <circle cx={x} cy={y} r="7" fill="#23384e" />
              <circle cx={x} cy={y} r="2" fill={st} />
            </g>
          ))}
          <path d="M147 68l15 8v18l-15 8-15-8V76z" fill="#203751" />
          <path d="M147 76l8 4v9l-8 5-8-5v-9z" fill={st} />
        </g>
      ) : index === 1 ? (
        <g>
          {[25, 43, 61].map((r) => (
            <g key={r}>
              <circle
                cx="141"
                cy="84"
                r={r}
                fill="none"
                stroke={st}
                strokeOpacity=".28"
              />
              <circle
                cx="141"
                cy="84"
                r={r + 2}
                fill="none"
                stroke={st}
                strokeOpacity=".12"
              />
            </g>
          ))}
          {Array.from({ length: 48 }, (_, i) => (
            <line
              key={i}
              x1="141"
              y1="13"
              x2="141"
              y2={i % 4 === 0 ? 20 : 16}
              stroke={st}
              opacity=".65"
              transform={`rotate(${i * 7.5} 141 84)`}
            />
          ))}
          <path
            d="M141 84l49-38a62 62 0 0 1 10 61z"
            fill={"url(#" + id + "fade)"}
          />
          <path
            d="M141 22v124M79 84h124"
            stroke={st}
            strokeDasharray="2 4"
            opacity=".55"
          />
          <path d="M141 84l49-38" stroke={st} />
          {[
            [149, 54],
            [123, 65],
            [171, 76],
            [152, 105],
            [105, 98],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="7" fill={st} opacity=".13" />
              <circle cx={x} cy={y} r="3" fill={st} />
            </g>
          ))}
        </g>
      ) : (
        <g transform="translate(55 30)">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M${i * 30} 0v107`}
              stroke={st}
              strokeDasharray="2 4"
              opacity=".35"
            />
          ))}
          {[
            [0, 56],
            [28, 58],
            [69, 43],
            [94, 48],
            [132, 40],
          ].map(([x, width], i) => (
            <g key={x}>
              {i > 0 && (
                <path
                  d={`M${x + 4} ${i * 19 - 9}v14h7`}
                  stroke={st}
                  fill="none"
                  opacity=".8"
                />
              )}
              <rect
                x={x}
                y={i * 19}
                width={width}
                height="11"
                rx="2"
                fill={st}
                fillOpacity={0.76 - i * 0.09}
                stroke={st}
              />
            </g>
          ))}
          <path d="M170 82v16h12" fill="none" stroke={st} />
          <path d="m184 92 6 6-6 6-6-6z" fill={st} />
        </g>
      )}
    </svg>
  );
}
function Home() {
  const [expanded, setExpanded] = useState(-1);
  return (
    <main className="xc-home" id="xc-main">
      <div className="xc-home-heading">
        <div className="xc-breadcrumb">
          <Link to="/">Main website</Link>
          <ChevronRight /> Academic
        </div>
        <h1>
          X1 Academic<span>.</span>
        </h1>
        <p>
          Explore cybersecurity standards, assess risk and plan implementation
          in three connected workspaces.
        </p>
      </div>
      <div className="xc-homecards">
        {spaces.map((s, i) => (
          <section
            key={s.path}
            style={{ "--card-accent": s.color } as React.CSSProperties}
            className={expanded === i ? "expanded" : ""}
          >
            <button
              aria-expanded={expanded === i}
              aria-controls={"choices-" + i}
              onClick={() => setExpanded(expanded === i ? -1 : i)}
            >
              <div className="xc-art">
                <Illustration index={i} />
              </div>
              <div className="xc-cardcopy">
                <s.icon />
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
                <span>
                  Choose a standard <ChevronDown />
                </span>
              </div>
            </button>
            {expanded === i && (
              <nav id={"choices-" + i} aria-label={s.title + " standards"}>
                {frameworkIds.map((f) => (
                  <Link key={f} to={base + "/" + s.path + "?standard=" + f}>
                    {names[f]} <ArrowRight />
                  </Link>
                ))}
              </nav>
            )}
          </section>
        ))}
      </div>
      <div className="xc-home-footer">
        <span>
          <Monitor /> Projects stay on this device
        </span>
        <Link to={base + "/assess?previous=1"}>
          Previous Academy projects <ArrowUpRight />
        </Link>
      </div>
    </main>
  );
}
function Workspace({
  space,
  view,
  focus,
  setFocus,
}: {
  space: Space;
  view: string;
  focus: boolean;
  setFocus: (v: boolean) => void;
}) {
  const {
    project,
    message,
    notify,
    pending,
    cancel,
    tryDemo,
    resetDemo,
    startBlank,
    resume,
    importFile,
    change,
  } = useProject();
  const [params, setParams] = useSearchParams(),
    [projectMenu, setMenu] = useState(false),
    [compact, setCompact] = useState(true);
  const selected = space.views.find((v) => v.id === view) ?? space.views[0];
  const input = useRef<HTMLInputElement>(null);
  const [rename, setRename] = useState(project.name);
  function demoButton() {
    return (
      <button className="xc-demo" onClick={tryDemo}>
        <Lightbulb />
        Try Demo
      </button>
    );
  }
  return (
    <div
      className={
        "xc-work " +
        (focus ? "focus-mode " : "") +
        (compact ? "rail-small" : "rail-large")
      }
    >
      {!focus && (
        <aside className="xc-rail">
          <button
            className="xc-icon"
            aria-label={
              compact
                ? "Expand workspace navigation"
                : "Collapse workspace navigation"
            }
            onClick={() => setCompact(!compact)}
          >
            {compact ? <PanelLeftOpen /> : <PanelLeftClose />}
          </button>
          <Link aria-label="Academy home" title="Academy home" to={base}>
            <House />
            <span>Academy home</span>
          </Link>
          {spaces.map((s) => (
            <Link
              key={s.path}
              aria-label={s.title}
              title={s.title}
              aria-current={s.path === space.path ? "page" : undefined}
              to={base + "/" + s.path + "?standard=" + project.framework}
            >
              <s.icon />
              <span>{s.title}</span>
            </Link>
          ))}
        </aside>
      )}
      <main id="xc-main" className="xc-workmain">
        {!focus && (
          <>
            <div className="xc-breadcrumb">
              <Link to={base}>X1 Academic</Link>
              <ChevronRight />
              {space.title}
            </div>
            <div className="xc-workhead">
              <div>
                <h1>{space.title}</h1>
                <p>
                  {project.name} <span> / </span>
                  <b className={project.demo ? "demo-status" : ""}>
                    {project.demo ? "Fictional demo" : "Personal project"}
                  </b>
                </p>
              </div>
              <div className="xc-toolbar">
                <select
                  aria-label="Standard edition"
                  value={project.framework}
                  onChange={(e) => {
                    const next = new URLSearchParams(params);
                    next.set("standard", e.target.value);
                    setParams(next);
                  }}
                >
                  {frameworkIds.map((f) => (
                    <option value={f} key={f}>
                      {names[f]}
                    </option>
                  ))}
                </select>
                {demoButton()}
                <button
                  className="xc-icon"
                  title="Project actions"
                  aria-label="Project actions"
                  onClick={() => {
                    setRename(project.name);
                    setMenu(true);
                  }}
                >
                  <FolderOpen />
                </button>
              </div>
            </div>
          </>
        )}
        <div className="xc-viewbar">
          {focus ? (
            <>
              <X1Mark size="sm" />
              <b>{names[project.framework]}</b>
              <span>
                {project.demo ? "Fictional demo" : "Personal project"}
              </span>
              {demoButton()}
            </>
          ) : (
            <nav aria-label="Workspace views">
              {space.views.map((v) => (
                <Link
                  key={v.id}
                  to={
                    base +
                    "/" +
                    space.path +
                    "?standard=" +
                    project.framework +
                    "&view=" +
                    v.id
                  }
                  aria-current={v.id === selected.id ? "page" : undefined}
                >
                  <v.icon />
                  {v.label}
                </Link>
              ))}
            </nav>
          )}
          <button
            className="xc-focus"
            aria-label={focus ? "Exit focus mode" : "Focus dashboard"}
            title={focus ? "Exit focus mode" : "Focus dashboard"}
            onClick={() => setFocus(!focus)}
          >
            {focus ? <Minimize2 /> : <Expand />}
          </button>
        </div>
        {message && (
          <div className="xc-notice" role="status">
            {message}
            <button aria-label="Dismiss status" onClick={() => notify("")}>
              <X />
            </button>
          </div>
        )}
        <div
          className={"xc-stage view-" + selected.id}
          key={project.framework + "-" + selected.id + "-" + project.demo}
        >
          {selected.id === "profile" ? (
            <Profile />
          ) : selected.id === "graph" ? (
            <Knowledge />
          ) : selected.id === "governance" ? (
            <Governance />
          ) : selected.id === "planner" ? (
            <Planner />
          ) : selected.id === "flow" ? (
            <DataFlow />
          ) : selected.id === "experiment" ? (
            <Experiment />
          ) : (
            <RiskDashboard
              view={selected.id as "risk" | "matrix" | "executive"}
            />
          )}
        </div>
        {!focus && (
          <footer className="xc-workfoot">
            <span>
              <Database />
              {project.demo ? "Fictional scenario" : "Local assessment"}
            </span>
            <button
              onClick={() => {
                setRename(project.name);
                setMenu(true);
              }}
            >
              Project actions <ArrowRight />
            </button>
          </footer>
        )}
        <input
          type="file"
          hidden
          ref={input}
          accept=".json"
          aria-label="Import project JSON"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importFile(file);
            e.target.value = "";
          }}
        />
        {projectMenu && (
          <Dialog title="Project actions" close={() => setMenu(false)}>
            <form
              className="xc-toolbar"
              onSubmit={(e) => {
                e.preventDefault();
                if (rename.trim())
                  change((p) => ({ ...p, name: rename.trim() }));
                setMenu(false);
              }}
            >
              <label>
                Project name
                <input
                  required
                  maxLength={240}
                  value={rename}
                  onChange={(e) => setRename(e.target.value)}
                />
              </label>
              <button>Save name</button>
            </form>
            <div className="xc-menu-actions">
              {[
                {
                  label: "Export project",
                  icon: Download,
                  action: () => downloadProject(project),
                },
                {
                  label: "Import project",
                  icon: Upload,
                  action: () => input.current?.click(),
                },
                ...(project.demo
                  ? [
                      {
                        label: "Return to my project",
                        icon: FolderOpen,
                        action: resume,
                      },
                      {
                        label: "Reset Demo",
                        icon: RotateCcw,
                        action: resetDemo,
                      },
                    ]
                  : []),
                { label: "Start Blank", icon: FilePlus2, action: startBlank },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => {
                    setMenu(false);
                    a.action();
                  }}
                >
                  <a.icon />
                  {a.label}
                </button>
              ))}
            </div>
            <Link className="xc-archive" to={base + "/assess?previous=1"}>
              Open previous Academy projects <ArrowUpRight />
            </Link>
          </Dialog>
        )}
        {pending && (
          <Dialog title="Confirm project change" close={cancel}>
            <p>{pending.message}</p>
            <div className="xc-toolbar">
              <button onClick={cancel}>Cancel</button>
              <button className="xc-primary" onClick={pending.apply}>
                Confirm replacement
              </button>
            </div>
          </Dialog>
        )}
      </main>
    </div>
  );
}
export default function Console() {
  const loc = useLocation(),
    [params] = useSearchParams(),
    [theme, setTheme] = useTheme(),
    [menu, setMenu] = useState(false),
    [focus, setFocus] = useState(false);
  const space = spaces.find(
      (s) => loc.pathname.replace(/\/$/, "") === base + "/" + s.path,
    ),
    requested = params.get("standard") as Framework,
    framework = frameworkIds.includes(requested) ? requested : frameworkIds[0];
  useEffect(() => {
    setMenu(false);
    setFocus(false);
    window.scrollTo(0, 0);
    document.title = space ? space.title + " · X1 Academic" : "X1 Academic";
    const url = "https://arharif.github.io" + loc.pathname;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    const description =
      space?.desc ??
      "Explore cybersecurity standards, assess risk and plan implementation in three connected workspaces.";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", "index,follow");
    for (const name of ["og:title", "twitter:title"])
      document
        .querySelector('meta[property="' + name + '"]')
        ?.setAttribute("content", document.title);
    for (const name of ["og:description", "twitter:description"])
      document
        .querySelector('meta[property="' + name + '"]')
        ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", url);
  }, [loc.pathname, space]);
  return (
    <div className="xc" data-theme={theme} data-scheme={palettes[theme][5]}>
      <a className="xc-skip" href="#xc-main">
        Skip to workspace
      </a>
      {!focus && (
        <header className="xc-top">
          <Link
            to={base}
            className="xc-brand"
            aria-label="X1 Academic overview"
          >
            <X1Mark mode={theme} />
            <span>Academic</span>
          </Link>
          <nav aria-label="Academic resources">
            {secondary.map(([label, path]) => (
              <Link key={path} to={path}>
                {label}
                <ArrowUpRight />
              </Link>
            ))}
          </nav>
          <div>
            <ThemeSwitcher mode={theme} onChange={setTheme} />
            <button
              className="xc-mobile-menu xc-icon"
              aria-label="Academic menu"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
            <Link className="xc-main-site" to="/">
              <Globe2 />
              Main website
            </Link>
          </div>
          {menu && (
            <nav className="xc-mobile-links" aria-label="Academic menu links">
              {[...secondary, ["Main website", "/"]].map(([label, path]) => (
                <Link key={path} to={path}>
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </header>
      )}
      {space ? (
        <ProjectProvider key={framework} framework={framework}>
          <Workspace
            space={space}
            view={params.get("view") ?? space.views[0].id}
            focus={focus}
            setFocus={setFocus}
          />
        </ProjectProvider>
      ) : (
        <Home />
      )}
    </div>
  );
}
