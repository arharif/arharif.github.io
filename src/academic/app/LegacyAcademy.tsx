import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  BookOpen,
  FlaskConical,
  Library,
  Network,
  Compass,
  GraduationCap,
  Shield,
  MessageSquare,
  CheckCircle,
  ArrowUpRight,
  Menu,
  ListChecks,
  PanelRight,
  Activity,
  BriefcaseBusiness,
  BrainCircuit,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { AcademicProvider, useAcademic } from "./context";
import { base, CaseSelect } from "../components/shared";
import { searchIndex } from "../data/search";
import "./academic.css";
import "../studio/studio.css";
import "../features/standards/standards.css";
import { X1Mark } from "@/components/branding/X1Mark";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { palettes } from "@/lib/palettes";
import { useTheme } from "@/lib/theme";
import { AuthProvider } from "@/hooks/useAuth";
import GlobalSearch from "../studio/GlobalSearch";
import ProjectControls from "../studio/ProjectControls";
import Tutorial from "../studio/Tutorial";
const AssessmentStudio = lazy(() => import("../studio/AssessmentStudio"));
const StandardsAcademy = lazy(() => import("../studio/StandardsAcademy"));
const NistImplementation = lazy(() => import("../studio/NistImplementation"));
const PrivacyStudio = lazy(() => import("../studio/PrivacyStudio"));
const ImplementationStudio = lazy(
  () => import("../studio/ImplementationStudio"),
);
const ReportCenter = lazy(() => import("../studio/ReportCenter"));
const Simulate = lazy(() => import("../studio/Simulate"));
import {
  ExplanationPanel,
  InsightProvider,
  useInsight,
} from "../workspace/insights";
import { WorkspaceProvider } from "../workspace/state";
const KnowledgeGraph = lazy(() => import("../features/KnowledgeGraph"));
const Lesson = lazy(() => import("../features/Learning"));
const Catalogue = lazy(() =>
  import("../features/Learning").then((m) => ({
    default: m.LearningCatalogue,
  })),
);
const Labs = lazy(() =>
  import("../features/Explore").then((m) => ({ default: m.Labs })),
);
const Frameworks = lazy(() =>
  import("../features/Explore").then((m) => ({ default: m.Frameworks })),
);
const SecurityMap = lazy(() =>
  import("../features/Explore").then((m) => ({ default: m.SecurityMap })),
);
const Certifications = lazy(() =>
  import("../features/Explore").then((m) => ({ default: m.Certifications })),
);
const Cases = lazy(() =>
  import("../features/Explore").then((m) => ({ default: m.Cases })),
);
const Resources = lazy(() => import("../features/Resources"));
const Navigator = lazy(() => import("../features/Navigator"));
const Progress = lazy(() => import("../features/Progress"));
const FrameworkLab = lazy(() => import("../features/FrameworkLab"));
const RiskLab = lazy(() => import("../features/RiskLab"));
const IncidentLab = lazy(() => import("../features/IncidentLab"));
const AILab = lazy(() => import("../features/AILab"));
const BoardroomLab = lazy(() => import("../features/BoardroomLab"));
const navigation = [
  { path: "/standards", label: "Explore Standards", Icon: Shield },
  { path: "/simulate", label: "Assess & Simulate", Icon: FlaskConical },
  { path: "/assess", label: "Assess", Icon: CheckCircle },
  { path: "/implement", label: "Implement", Icon: ListChecks },
  { path: "/report", label: "Report", Icon: BriefcaseBusiness },
];
const toolsNavigation = [
  ["/labs/framework-explorer", "Control & Framework Explorer"],
  ["/labs/risk-decision", "Risk Register & Simulator"],
  ["/labs/cyber-incident", "Cyber Incident Lab"],
  ["/labs/ai-experiment", "AI Experiment Studio"],
  ["/labs/ciso-boardroom", "CISO Boardroom"],
  ["/knowledge-graph", "Interactive Knowledge Graph"],
  ["/resources", "Learning Resources"],
  ["/certifications", "Certifications"],
  ["/progress", "Your progress"],
];
function Layout() {
  const location = useLocation();
  const { open, setOpen, level, setLevel } = useInsight();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { caseId, storageError } = useAcademic();
  const mainRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useTheme();
  const relative = location.pathname.slice(base.length).replace(/\/$/, "");
  const isLab = relative.startsWith("/labs/");
  const hasCase =
    isLab ||
    [
      "/assess",
      "/implement",
      "/simulate/privacy",
      "/standards/800-53",
      "/report",
    ].includes(relative);
  const title = relative
    ? (searchIndex.find((row) => row.path === relative)?.title ??
      navigation.find((row) => row.path === relative)?.label ??
      relative.split("/").pop()!.replace(/-/g, " "))
    : "X1 Academic";
  useEffect(() => {
    document.title = `${title} · X1 Academic`;
    const description =
      searchIndex.find((row) => row.path === relative)?.description ??
      "Learn cybersecurity, governance, risk and artificial intelligence through source-linked lessons and reproducible educational laboratories.";
    const url = `https://arharif.github.io${location.pathname}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        "content",
        relative === "/progress" ? "noindex,follow" : "index,follow",
      );
    for (const key of ["og:title", "twitter:title"])
      document
        .querySelector(`meta[property="${key}"]`)
        ?.setAttribute("content", document.title);
    for (const key of ["og:description", "twitter:description"])
      document
        .querySelector(`meta[property="${key}"]`)
        ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", url);
    setMenuOpen(false);
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname, relative, title]);
  return (
    <div
      className="xa xs-academy"
      data-theme={theme} data-scheme={palettes[theme][5]}
      data-sidebar={collapsed ? "collapsed" : "expanded"}
    >
      <a className="skip-link" href="#academic-main">
        Skip to learning content
      </a>
      <header className="xa-top">
        <div className="xa-top-inner">
          <Link
            className="xa-brand"
            to="/"
            aria-label="X1 home"
          >
            <X1Mark size="sm" mode={theme} />{" "}
          </Link>
          <Link className="xa-brand" aria-label="X1 Academic overview" to={base}><span>
              ACADEMIC<small>THE CONNECTED ACADEMY</small>
            </span>
          </Link>
          <GlobalSearch />
          <div className="xa-actions" style={{ margin: 0 }}>
            <label className="xs-mode">
              <span>Explanation</span>
              <select
                aria-label="Academy explanation mode"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {["Beginner", "Practitioner", "Executive"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <Tutorial />
            <button
              className="xa-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="academy-sidebar"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={17} /> Menu
            </button>
            <button
              className="xa-guide-toggle"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <PanelRight size={17} /> Explain
            </button>
            <Link className="xa-button secondary" to="/">
              Professional gateway <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <ThemeSwitcher mode={theme} onChange={setTheme} />
          </div>
        </div>
      </header>
      <div className="xa-shell">
        <aside
          id="academy-sidebar"
          className={`xa-sidebar ${menuOpen ? "is-open" : ""}`}
        >
          <button
            className="xs-collapse"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={16} />
            <span>Workspace</span>
          </button>
          <NavLink className="xs-overview-link" to={base} end>
            <LayoutDashboard size={17} />
            <span className="xs-nav-text">Academy Overview</span>
          </NavLink>
          <p className="xa-nav-label">YOUR WORKFLOW</p>
          <nav aria-label="Academic navigation">
            {navigation.map(({ path, label, Icon }) => (
              <NavLink key={path} to={`${base}${path}`} aria-label={label}>
                <Icon size={17} aria-hidden="true" />
                <span className="xs-nav-text">{label}</span>
              </NavLink>
            ))}
            <details className="xs-tools-nav">
              <summary>All workspaces</summary>
              {toolsNavigation.map(([path, label]) => (
                <Link key={path} to={`${base}${path}`}>
                  {label}
                </Link>
              ))}
            </details>
          </nav>
          <div className="xa-sidebar-note">
            <GraduationCap size={22} />
            <strong>Learn. Experiment. Lead.</strong>
            <p>Practical judgement starts with good questions.</p>
            <Link to={`${base}/learning`} aria-label="Find your learning path">
              Find your learning path →
            </Link>
            <Link to="/games">X1 Games →</Link><Link to="/insights-innovation">X1 Insights →</Link><Link to="/">Main website ↗</Link>
          </div>
        </aside>
        <main id="academic-main" tabIndex={-1} ref={mainRef}>
          <nav className="xa-breadcrumbs" aria-label="Breadcrumb">
            <Link to={base}>X1 Academic</Link>
            {relative && (
              <>
                <span aria-hidden="true">/</span>
                {isLab && (
                  <>
                    <Link to={`${base}/labs`}>Laboratories</Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
                <span aria-current="page">{title}</span>
              </>
            )}
          </nav>
          {storageError && (
            <p role="alert">
              Local progress storage is unavailable. Export your learner data
              before closing this session.
            </p>
          )}
          <ProjectControls />
          {hasCase && <CaseSelect />}
          <Suspense
            fallback={
              <div className="xa-panel" role="status">
                Loading learning workspace…
              </div>
            }
          >
            <Routes>
              <Route path="standards" element={<StandardsAcademy />} />
              <Route path="standards/800-53" element={<NistImplementation />} />
              <Route path="simulate" element={<Simulate />} />
              <Route path="risk-register" element={<RiskLab />} />
              <Route path="simulate/privacy" element={<PrivacyStudio />} />
              <Route path="assess" element={<AssessmentStudio />} />
              <Route path="implement" element={<ImplementationStudio />} />
              <Route path="report" element={<ReportCenter />} />
              <Route path="learning" element={<Catalogue />} />
              <Route
                path="learning/:id"
                element={<Lesson key={location.pathname} />}
              />
              <Route
                path="learning/:discipline/:id"
                element={<Lesson key={location.pathname} />}
              />
              {["cybersecurity", "grc", "artificial-intelligence"].map((id) => (
                <Route
                  key={id}
                  path={id}
                  element={<Catalogue discipline={id} />}
                />
              ))}
              <Route path="labs" element={<Labs />} />
              <Route
                path="labs/framework-explorer"
                element={<FrameworkLab key={caseId} />}
              />
              <Route
                path="labs/risk-decision"
                element={<RiskLab key={caseId} />}
              />
              <Route
                path="labs/cyber-incident"
                element={<IncidentLab key={caseId} />}
              />
              <Route
                path="labs/ai-experiment"
                element={<AILab key={caseId} />}
              />
              <Route
                path="labs/ciso-boardroom"
                element={<BoardroomLab key={caseId} />}
              />
              <Route path="frameworks" element={<Frameworks />} />
              <Route path="frameworks/:id" element={<Frameworks />} />
              <Route path="knowledge-graph" element={<KnowledgeGraph />} />
              <Route path="security-map" element={<SecurityMap />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="resources" element={<Resources />} />
              <Route path="case-studies" element={<Cases />} />
              <Route path="assistant" element={<Navigator />} />
              <Route path="progress" element={<Progress />} />
              <Route
                path="*"
                element={
                  <>
                    <h1>Learning page unavailable</h1>
                    <p>
                      Explore the published catalogue for an available module.
                    </p>
                    <Link to={`${base}/learning`}>Learning paths →</Link>
                  </>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <ExplanationPanel />
      </div>
      <footer className="xa-footer">
        <span>X1 Academic · Evidence, practice & judgement</span>
        <Link to={`${base}/assistant`}>
          Need a learning direction? Open the navigator →
        </Link>
      </footer>
    </div>
  );
}
export default function LegacyAcademy({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <AcademicProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <InsightProvider>{children ?? <Layout />}</InsightProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </AcademicProvider>
  );
}
