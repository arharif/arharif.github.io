import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@/lib/theme";
import { SiteSearchButton } from "./SiteSearchButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { X1Mark } from "./branding/X1Mark";

const links = [
  ["/about-x1", "About Me"],
  ["/x1-academic", "X1 Academic"],
  ["/insights-innovation", "X1 Insights"],
  ["/games", "X1 Games"],
  ["/submitting", "Contribute"],
];
export function Navbar() {
  const [mode, setMode] = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const arcade = /^\/games\/?$/.test(location.pathname);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [location.pathname]);
  return (
    <header
      className="uni-nav"
      onKeyDown={(e) => {
        if (open && e.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <div className="uni-nav-inner">
        <Link to="/" aria-label="X1 home">
          <X1Mark size="sm" mode={arcade ? "onyx-black" : undefined} />
        </Link>
        <nav id="gateway-nav" aria-label="Primary navigation" data-open={open}>
          {links.map(([to, label]) => {
            const withinInsights = to === "/insights-innovation" && /^\/(professional|personal)(\/|$)/.test(location.pathname);
            return withinInsights
              ? <Link key={to} to={to} className="active" aria-current="location" onClick={() => setOpen(false)}>{label}</Link>
              : <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>;
          })}
        </nav>
        <div className="uni-utilities">
          <SiteSearchButton />
          {!arcade && <ThemeSwitcher mode={mode} onChange={setMode} />}
          <Link to="/admin" aria-label="Owner login" title="Owner login">
            <UserRound size={19} />
          </Link>
          <button
            ref={trigger}
            className="mobile-toggle"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="gateway-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
