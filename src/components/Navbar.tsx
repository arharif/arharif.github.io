import { ChevronDown, LockKeyhole, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ThemeMode } from '@/lib/theme';
import { ThemeSwitcher } from './ThemeSwitcher';
import { X1Mark } from './branding/X1Mark';

type NavItem = { to: string; label: string; active: (path: string) => boolean };
const academic: NavItem[] = [
  { to: '/compliance-frameworks', label: 'Compliance Frameworks', active: (p) => p === '/compliance-frameworks' },
  { to: '/academic-library', label: 'Course & PDF Library', active: (p) => p === '/academic-library' },
];
const insights: NavItem[] = [
  { to: '/professional', label: 'Technology & Innovation', active: (p) => p.startsWith('/professional') },
  { to: '/personal', label: 'Curiosities & Philosophy', active: (p) => p.startsWith('/personal') },
  { to: '/security-mindmap', label: 'Security Map', active: (p) => p === '/security-mindmap' || p === '/Security_Mindmap' },
];

function Dropdown({ label, items, open, setOpen, mobile = false }: { label: string; items: NavItem[]; open: boolean; setOpen: (value: boolean) => void; mobile?: boolean }) {
  const location = useLocation();
  const active = items.some((item) => item.active(location.pathname));
  const id = `${mobile ? 'mobile-' : ''}${label.toLowerCase().replace(/\W+/g, '-')}-menu`;
  return <div className="academic-nav">
    <button type="button" className={`nav-link ${active ? 'is-active' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      {label}<ChevronDown size={15} className={open ? 'rotate-180' : ''} aria-hidden="true" />
    </button>
    {open && <div className="academic-nav-menu" id={id}>{items.map((item) => <NavLink key={item.to} to={item.to} className={`nav-link ${item.active(location.pathname) ? 'is-active' : ''}`} aria-current={item.active(location.pathname) ? 'page' : undefined}>{item.label}</NavLink>)}</div>}
  </div>;
}

export function Navbar({ mode, onTheme }: { mode: ThemeMode; onTheme: (m: ThemeMode) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<'academic' | 'insights' | null>(null);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => { setMobileOpen(false); setMenu(null); }, [location.pathname]);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setMenu(null); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(null); setMobileOpen(false); } };
    document.addEventListener('pointerdown', closeOutside); document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, []);
  const aboutActive = location.pathname === '/about-x1';
  const contributeActive = location.pathname === '/submitting';
  const utility = <><NavLink to="/admin" className={`nav-utility ${location.pathname === '/admin' || location.pathname === '/login' ? 'is-active' : ''}`} aria-label="Admin" title="Admin"><LockKeyhole size={18} aria-hidden="true" /></NavLink><ThemeSwitcher mode={mode} onChange={onTheme} /></>;
  return <header ref={headerRef} className="nav-shell nav-enter sticky top-0 z-50">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-3 md:px-4">
      <Link to="/" className="flex items-center rounded-lg" aria-label="X1 home" title="Home"><X1Mark size="sm" mode={mode} /></Link>
      <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary navigation">
        <NavLink to="/about-x1" className={`nav-link ${aboutActive ? 'is-active' : ''}`}>About Me</NavLink>
        <Dropdown label="X1 Academic" items={academic} open={menu === 'academic'} setOpen={(v) => setMenu(v ? 'academic' : null)} />
        <Dropdown label="Insights & Innovation" items={insights} open={menu === 'insights'} setOpen={(v) => setMenu(v ? 'insights' : null)} />
        <NavLink to="/submitting" className={`nav-link ${contributeActive ? 'is-active' : ''}`}>Connect / Contribute</NavLink>
      </nav>
      <div className="hidden items-center gap-2 lg:flex">{utility}</div>
      <button className="nav-mobile-trigger lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}>{mobileOpen ? <X /> : <Menu />}</button>
    </div>
    {mobileOpen && <nav id="mobile-navigation" className="mobile-nav glass is-open mx-4 rounded-2xl p-4 lg:hidden" aria-label="Mobile navigation">
      <NavLink tabIndex={mobileOpen ? 0 : -1} to="/about-x1" className={`nav-link ${aboutActive ? 'is-active' : ''}`}>About Me</NavLink>
      <Dropdown mobile label="X1 Academic" items={academic} open={menu === 'academic'} setOpen={(v) => setMenu(v ? 'academic' : null)} />
      <Dropdown mobile label="Insights & Innovation" items={insights} open={menu === 'insights'} setOpen={(v) => setMenu(v ? 'insights' : null)} />
      <NavLink tabIndex={mobileOpen ? 0 : -1} to="/submitting" className={`nav-link ${contributeActive ? 'is-active' : ''}`}>Connect / Contribute</NavLink>
      <div className="mt-2 flex items-center gap-2">{utility}</div>
    </nav>}
  </header>;
}
