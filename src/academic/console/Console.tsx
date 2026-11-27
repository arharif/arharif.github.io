import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  ChevronRight,
  Database,
  Download,
  Expand,
  FilePlus2,
  FolderOpen,
  GanttChartSquare,
  GitFork,
  House,
  Layers3,
  LayoutDashboard,
  Lightbulb,
  Minimize2,
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
import { frameworkIds, names, type Framework } from "./catalogue";
import { downloadProject, ProjectProvider, useProject } from "./context";
import { Dialog } from "./ui";
import { Profile, Governance, Learn } from "./Controls";
import { LearningGuide } from "./LearningGuide";
import { AcademicFrame } from "./AcademicFrame";
import { RiskDashboard } from "./Risks";
import { DataFlow, Knowledge } from "./Maps";
import { Planner } from "./Planner";
import { Experiment } from "./Experiment";

const base = "/x1-academic";
const spaces = [
  {
    path: "explore",
    title: "Learn",
    desc: "Explore the framework’s official structure, scope and evidence guidance.",
    icon: Layers3,
    color: "#7da8ff",
    views: [
      { id: "profile", label: "Framework profile", icon: ShieldCheck },
      { id: "learn", label: "Framework guide", icon: Layers3 },
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
      { id: "profile", label: "Control assessment", icon: ShieldCheck },
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
    title: "Plan & Implement",
    desc: "Turn security objectives into a dependency-aware schedule with owners and milestones.",
    icon: GanttChartSquare,
    color: "#d7acff",
    views: [
      { id: "planner", label: "Project dashboard", icon: GanttChartSquare },
    ],
  },
];
type Space = (typeof spaces)[number];
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
  const [exporting, setExporting] = useState(false);
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
                    {project.demo ? "SAMPLE DATA · Fictional demo" : "Personal project"}
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
                {space.path === "assess-simulate" && <button disabled={exporting} onClick={async () => {
                  setExporting(true);
                  try {
                    const { downloadAssessment } = await import("./assessmentWorkbook");
                    await downloadAssessment(project);
                  } catch {
                    notify("The Excel report could not be created. Please try again.");
                  } finally {
                    setExporting(false);
                  }
                }}>{exporting ? "Preparing Excel…" : "Download Assessment — Excel"}</button>}
                {project.demo && <>
                  <button onClick={resetDemo}>Reset Demo</button>
                  <button onClick={() => startBlank()}>{space.path === "implement-plan" ? "Start New Plan" : "Start New Assessment"}</button>
                  <button onClick={resume}>{space.path === "implement-plan" ? "Return to my plan" : "Return to my assessment"}</button>
                </>}
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
              <Link to="/" aria-label="X1 home"><X1Mark size="sm" /></Link>
              <b>{names[project.framework]}</b>
              <span>
                {project.demo ? "SAMPLE DATA · Fictional demo" : "Personal project"}
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
          key={project.framework + "-" + selected.id}
        >
          {project.demo && space.path === "explore" && selected.id !== "learn" && <details className="xc-framework-scope">
            <summary>Guided example and cheat sheet</summary><LearningGuide />
          </details>}
          {selected.id === "learn" ? (
            <Learn />
          ) : selected.id === "profile" ? (
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
              {project.demo ? "SAMPLE DATA" : "Local assessment"}
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
                { label: "Start Blank", icon: FilePlus2, action: () => startBlank() },
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
    [params, setParams] = useSearchParams(),
    [focus, setFocus] = useState(false);
  const space = spaces.find(
      (row) => loc.pathname.replace(/\/$/, "") === base + "/" + row.path,
    ) ?? spaces[0],
    requested = params.get("standard") as Framework,
    framework = frameworkIds.includes(requested) ? requested : frameworkIds[0],
    openDemo = params.get("demo") === "1";
  useEffect(() => {
    if (openDemo) {
      const next = new URLSearchParams(params);
      next.delete("demo");
      setParams(next, { replace: true });
    }
  }, [openDemo, params, setParams]);
  useEffect(() => setFocus(false), [loc.pathname]);
  return (
    <AcademicFrame focus={focus} title={space.title + " · X1 Academic"} description={space.desc}>
      <ProjectProvider key={framework} framework={framework} openDemo={openDemo}>
        <Workspace space={space} view={params.get("view") ?? space.views[0].id} focus={focus} setFocus={setFocus} />
      </ProjectProvider>
    </AcademicFrame>
  );
}
