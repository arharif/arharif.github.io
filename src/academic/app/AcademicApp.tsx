import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  Moon,
  PanelRight,
  Sun,
} from "lucide-react";
import { AcademicProvider, useAcademic } from "./context";
import { base, CaseSelect } from "../components/shared";
import { searchIndex } from "../data/search";
import "./academic.css";
import "../studio/studio.css";
import "../features/standards/standards.css";
import { X1Mark } from "@/components/branding/X1Mark";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { initTheme, themeMap, type ThemeMode } from "@/lib/theme";
import { AuthProvider } from "@/hooks/useAuth";
import GlobalSearch from "../studio/GlobalSearch";
import ProjectControls from "../studio/ProjectControls";
import Tutorial from "../studio/Tutorial";
import DemoButton from "../studio/DemoButton";
import ReferenceImages from "../studio/ReferenceImages";
import { isPriority } from "../studio/priorities";
import "./reference-workspaces.css";
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
import { WorkspaceProvider, useWorkspace } from "../workspace/state";
const KnowledgeGraph = lazy(() => import("../features/KnowledgeGraph"));
const Home = lazy(() => import("../features/Home"));
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
  { path: "/standards", label: "Explore Standards" },
  { path: "/simulate", label: "Assess & Simulate" },
  { path: "/implement", label: "Implement & Plan" },
];

const simulationRoutes: Record<string, string> = {
  "/risk-register": "risk",
  "/labs/risk-decision": "risk",
  "/labs/ai-experiment": "ai",
  "/labs/cyber-incident": "incident",
  "/labs/ciso-boardroom": "boardroom",
  "/labs/framework-explorer": "framework-explorer",
  "/standards/800-53": "nist-800-53",
  "/simulate/privacy": "privacy",
};

const routeReferences: Record<
  string,
  readonly (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[]
> = {
  "/assess": [3, 9],
  "/risk-register": [1, 4],
  "/labs/risk-decision": [1, 4],
  "/knowledge-graph": [2],
  "/labs/ai-experiment": [5],
  "/report": [6],
  "/implement": [7],
  "/simulate/privacy": [8],
};

function Layout() {
  const location = useLocation();
  const { open, setOpen, level, setLevel } = useInsight();
  const [menuOpen, setMenuOpen] = useState(false);
  const helpMenu = useRef<HTMLDetailsElement>(null);
  const { caseId, storageError } = useAcademic();
  const { demoId, studio } = useWorkspace();
  const mainRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => initTheme());
  useEffect(() => {
    document.documentElement.classList.remove(...Object.values(themeMap));
    document.documentElement.classList.add(themeMap[theme]);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* Session theme remains usable. */
    }
  }, [theme]);
  const relative = location.pathname.slice(base.length).replace(/\/$/, "");
  const isLab = relative.startsWith("/labs/");
  const params = new URLSearchParams(location.search);
  const standard = params.get("standard");
  const framework = params.get("framework") ?? "nist-csf-2";
  const priorityAssessment =
    relative === "/assess" && isPriority(standard) && !params.has("mode");
  const demoFor =
    relative === "/standards"
      ? null
      : relative === "/assess"
        ? (standard ?? "nist-csf-2")
        : relative === "/implement"
          ? (standard ?? studio.framework)
          : relative === "/labs/framework-explorer"
            ? (params.get("framework") ?? "nist-csf-2")
            : relative === "/simulate/privacy" &&
                (params.get("edition") === "pf-1.1-ipd" ||
                  studio.privacyEdition === "pf-1.1-ipd")
              ? "privacy-draft"
              : simulationRoutes[relative];
  const references =
    relative === "/assess" && standard && standard !== "nist-csf-2"
      ? undefined
      : routeReferences[relative];
  const hasCase =
    isLab ||
    [
      "/assess",
      "/implement",
      "/simulate/privacy",
      "/standards/800-53",
      "/report",
    ].includes(relative);
  const title = priorityAssessment
    ? "Control assessment"
    : relative
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
    if (helpMenu.current) helpMenu.current.open = false;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname, relative, title]);
  return (
    <div
      className={`xa xs-academy xa-reference-academy ${relative ? "xa-workspace-page" : "xa-home-page"}`}
      data-theme={theme}
    >
      <a className="skip-link" href="#academic-main">
        Skip to learning content
      </a>
      <header className="xa-top">
        <div className="xa-top-inner">
          <Link
            className="xa-brand"
            to={base}
            aria-label="X1 Academic overview"
          >
            <X1Mark size="sm" mode={theme} /> <span>X1 Academic</span>
          </Link>
          <GlobalSearch />
          <div className="xa-header-actions">
            <button
              className="xa-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="academy-sidebar"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={17} /> Menu
            </button>
            <details className="xa-help-menu" ref={helpMenu}>
              <summary>
                Help <ChevronDown size={13} aria-hidden="true" />
              </summary>
              <div>
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
                  className="xa-guide-toggle"
                  aria-expanded={open}
                  onClick={() => setOpen(!open)}
                >
                  <PanelRight size={17} /> Explain
                </button>
                <a href="/">
                  Main website <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </div>
            </details>
            <ThemeSwitcher mode={theme} onChange={setTheme} />
            <button
              className="xa-theme-shortcut"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun size={16} aria-hidden="true" />
              ) : (
                <Moon size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>
      <div className="xa-shell">
        <nav
          id="academy-sidebar"
          className={`xa-workspace-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Academic navigation"
        >
          {navigation.map(({ path, label }) => (
            <NavLink key={path} to={`${base}${path}`}>
              {label}
            </NavLink>
          ))}
          <a className="xa-mobile-gateway" href="/">
            Main website <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </nav>
        <main id="academic-main" tabIndex={-1} ref={mainRef}>
          {relative && (
            <div className="xa-context-bar">
              {relative && (
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
              )}
              {relative && (
                <div className="xa-page-tools">
                  {hasCase && !demoId && (
                    <details className="xa-case-menu">
                      <summary>
                        Scenario <ChevronDown size={13} aria-hidden="true" />
                      </summary>
                      <CaseSelect />
                    </details>
                  )}
                  <ProjectControls />
                  {(demoFor || (demoId && relative !== "/standards")) && (
                    <DemoButton id={demoFor ?? demoId!} />
                  )}
                </div>
              )}
            </div>
          )}
          {storageError && (
            <p role="alert">
              Local progress storage is unavailable. Export your learner data
              before closing this session.
            </p>
          )}
          <Suspense
            fallback={
              <div className="xa-panel" role="status">
                Loading learning workspace…
              </div>
            }
          >
            <Routes key={demoId ?? "learner"}>
              <Route index element={<Home />} />
              <Route
                path="standards"
                element={<StandardsAcademy key={framework} />}
              />
              <Route path="standards/800-53" element={<NistImplementation />} />
              <Route path="simulate" element={<Simulate />} />
              <Route path="risk-register" element={<RiskLab />} />
              <Route path="simulate/privacy" element={<PrivacyStudio />} />
              <Route
                path="assess"
                element={
                  priorityAssessment ? (
                    <StandardsAcademy key={standard} assessment />
                  ) : (
                    <AssessmentStudio />
                  )
                }
              />
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
          {references && <ReferenceImages ids={references} />}
        </main>
        <ExplanationPanel />
      </div>
    </div>
  );
}
export default function AcademicApp() {
  return (
    <AcademicProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <InsightProvider>
            <Layout />
          </InsightProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </AcademicProvider>
  );
}
