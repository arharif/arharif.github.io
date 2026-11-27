import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe2, Menu, X } from "lucide-react";
import { X1Mark } from "@/components/branding/X1Mark";
import { SiteSearchButton } from "@/components/SiteSearchButton";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { palettes } from "@/lib/palettes";
import { useTheme } from "@/lib/theme";
import "./console.css";

const base = "/x1-academic";
const secondary = [
  ["Frameworks & Standards", "/x1-academic"],
  ["X1 Insights", "/insights-innovation"],
  ["X1 Games", "/games"],
];
export function AcademicFrame({ children, focus = false, title = "X1 Academic", description = "Explore seven cybersecurity, privacy and AI standards with editable assessments and implementation plans." }: {
  children: ReactNode;
  focus?: boolean;
  title?: string;
  description?: string;
}) {
  const loc = useLocation();
  const [theme, setTheme] = useTheme();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [loc.pathname, loc.hash]);
  useEffect(() => {
    document.title = title;
    const url = "https://arharif.github.io" + loc.pathname;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
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
  }, [description, loc.pathname, title]);
  return (
    <div className="xc" data-theme={theme} data-scheme={palettes[theme][5]}>
      <a className="xc-skip" href="#xc-main">
        Skip to workspace
      </a>
      {!focus && (
        <header className="xc-top">
          <Link
            to="/"
            className="xc-brand"
            aria-label="X1 home"
          >
            <X1Mark mode={theme} />
          </Link>
          <Link className="xc-section-name" to={base} aria-label="X1 Academic overview">Academic</Link>
          <nav aria-label="Academic navigation">
            {secondary.map(([label, path]) => (
              <Link key={path} to={path}>
                {label}
              </Link>
            ))}
          </nav>
          <div>
            <SiteSearchButton />
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
      {children}
    </div>
  );
}
