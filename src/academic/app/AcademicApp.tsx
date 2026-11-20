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
} from "lucide-react";
import { AcademicProvider, useAcademic } from "./context";
import { base, CaseSelect } from "../components/shared";
import { searchIndex } from "../data/search";
import "./academic.css";
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
  { path: "", label: "Academy home", Icon: GraduationCap },
  { path: "/learning", label: "Learning paths", Icon: BookOpen },
  { path: "/labs", label: "Laboratories", Icon: FlaskConical },
  { path: "/frameworks", label: "Frameworks", Icon: Shield },
  { path: "/case-studies", label: "Case studies", Icon: Library },
  { path: "/security-map", label: "Roles & skills", Icon: Network },
  { path: "/certifications", label: "Certifications", Icon: CheckCircle },
  { path: "/resources", label: "Resources", Icon: Compass },
  { path: "/assistant", label: "Navigator", Icon: MessageSquare },
  { path: "/progress", label: "Your progress", Icon: BookOpen },
];
function Layout() {
  const location = useLocation();
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
            X1 <span>ACADEMIC</span>
          </Link>
          <div className="xa-actions" style={{ margin: 0 }}>
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
        <aside className="xa-sidebar">
          <nav aria-label="Academic navigation">
            {navigation.map(({ path, label, Icon }) => (
              <NavLink key={path} to={`${base}${path}`} end={!path}>
                <Icon size={17} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
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
      <Layout />
    </AcademicProvider>
  );
}
