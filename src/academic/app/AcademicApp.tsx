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
  Sun,
  Moon,
  Menu,
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
import {
  ExplanationPanel,
  InsightProvider,
  useInsight,
} from "../workspace/insights";
import { WorkspaceProvider } from "../workspace/state";
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
  { path: "", label: "Academic Overview", Icon: LayoutDashboard },
  { path: "/cybersecurity", label: "Cybersecurity Academy", Icon: Shield },
  { path: "/grc", label: "GRC & Risk Academy", Icon: BriefcaseBusiness },
  {
    path: "/artificial-intelligence",
    label: "AI & Machine Learning",
    Icon: BrainCircuit,
  },
  {
    path: "/labs/framework-explorer",
    label: "Control & Framework Explorer",
    Icon: CheckCircle,
  },
  {
    path: "/knowledge-graph",
    label: "Interactive Knowledge Graph",
    Icon: Network,
  },
  {
    path: "/labs/risk-decision",
    label: "Risk Register & Simulator",
    Icon: Activity,
  },
  { path: "/labs/cyber-incident", label: "Cyber Incident Lab", Icon: Shield },
  {
    path: "/labs/ai-experiment",
    label: "AI Experiment Studio",
    Icon: FlaskConical,
  },
  {
    path: "/labs/ciso-boardroom",
    label: "CISO Boardroom",
    Icon: BriefcaseBusiness,
  },
  { path: "/resources", label: "Learning Resources", Icon: Library },
  { path: "/certifications", label: "Certifications", Icon: GraduationCap },
  { path: "/progress", label: "Your progress", Icon: BookOpen },
];
function Layout() {
  const location = useLocation();
  const { open, setOpen } = useInsight();
  const [menuOpen, setMenuOpen] = useState(false);
  const { caseId, storageError } = useAcademic();
  const mainRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("x1-academic-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  const relative = location.pathname.slice(base.length).replace(/\/$/, "");
  const isLab = relative.startsWith("/labs/");
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
    <div className="xa" data-theme={theme}>
      <a className="skip-link" href="#academic-main">
        Skip to learning content
      </a>
      <header className="xa-top">
        <div className="xa-top-inner">
          <Link className="xa-brand" to={base}>
            <span className="xa-brand-mark">X1</span>{" "}
            <span>
              ACADEMIC<small>THE CONNECTED ACADEMY</small>
            </span>
          </Link>
          <div className="xa-top-context">
            <span className="xa-live-dot" /> Learning workspace{" "}
            <span className="xa-pill">LOCAL & PRIVATE</span>
          </div>
          <div className="xa-actions" style={{ margin: 0 }}>
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
            <button
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                try {
                  localStorage.setItem("x1-academic-theme", next);
                } catch {
                  /* Theme remains usable for the session. */
                }
              }}
            >
              {theme === "dark" ? (
                <Sun size={17} aria-hidden="true" />
              ) : (
                <Moon size={17} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>
      <div className="xa-shell">
        <aside
          id="academy-sidebar"
          className={`xa-sidebar ${menuOpen ? "is-open" : ""}`}
        >
          <p className="xa-nav-label">WORKSPACE</p>
          <nav aria-label="Academic navigation">
            {navigation.map(({ path, label, Icon }) => (
              <div key={path}>
                <NavLink key={path} to={`${base}${path}`} end={!path}>
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </NavLink>
                {path === "/labs/framework-explorer" && (
                  <div className="xa-subnav">
                    {[
                      ["nist-csf-2", "NIST CSF 2.0"],
                      ["nist-800-53", "NIST SP 800-53"],
                      ["iso-27001", "ISO/IEC 27001"],
                      ["pci-dss", "PCI DSS"],
                    ].map(([id, name]) => (
                      <Link
                        key={id}
                        to={`${base}/labs/framework-explorer?framework=${id}`}
                      >
                        {name}
                      </Link>
                    ))}
                    <Link to={`${base}/frameworks`}>
                      Other frameworks <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="xa-sidebar-note">
            <GraduationCap size={22} />
            <strong>Learn. Experiment. Lead.</strong>
            <p>Practical judgement starts with good questions.</p>
            <Link to={`${base}/learning`}>Find your learning path →</Link>
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
          {isLab && <CaseSelect />}
          <Suspense
            fallback={
              <div className="xa-panel" role="status">
                Loading learning workspace…
              </div>
            }
          >
            <Routes>
              <Route index element={<Home />} />
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
export default function AcademicApp() {
  return (
    <AcademicProvider>
      <WorkspaceProvider>
        <InsightProvider>
          <Layout />
        </InsightProvider>
      </WorkspaceProvider>
    </AcademicProvider>
  );
}
