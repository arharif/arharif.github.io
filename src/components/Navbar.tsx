import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ThemeMode } from '@/lib/theme';
import { ThemeSwitcher } from './ThemeSwitcher';
import { X1Mark } from './branding/X1Mark';

type NavItem = { to: string; label: string; match: (path: string) => boolean };
const academicLinks: NavItem[] = [
  { to: '/security-mindmap', label: 'Security Map', match: (path) => path === '/security-mindmap' || path === '/Security_Mindmap' },
  { to: '/compliance-frameworks', label: 'Compliance Frameworks', match: (path) => path === '/compliance-frameworks' },
  { to: '/academic-library', label: 'Course & PDF Library', match: (path) => path === '/academic-library' },
];

export function Navbar({ mode, onTheme }: { mode: ThemeMode; onTheme: (m: ThemeMode) => void }) {
  const [open, setOpen] = useState(false);
  const [academicOpen, setAcademicOpen] = useState(false);
  const location = useLocation();
  const academicRef = useRef<HTMLDivElement>(null);
  const academicButtonRef = useRef<HTMLButtonElement>(null);
  const links = useMemo<NavItem[]>(() => [
    { to: '/', label: 'Landing', match: (path) => path === '/' },
    { to: '/about-x1', label: 'About Me', match: (path) => path === '/about-x1' },
    { to: '/professional', label: 'Technology & Innovation', match: (path) => path.startsWith('/professional') },
    { to: '/personal', label: 'Curiosities & Philosophy', match: (path) => path.startsWith('/personal') },
    { to: '/submitting', label: 'Submitting', match: (path) => path === '/submitting' },
    { to: '/games#games-zone', label: 'Games', match: (path) => path === '/games' },
    { to: '/admin', label: 'Admin', match: (path) => path === '/admin' || path === '/login' },
  ], []);
  useEffect(() => { setOpen(false); setAcademicOpen(false); }, [location.pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!academicRef.current?.contains(event.target as Node)) setAcademicOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && academicOpen) { setAcademicOpen(false); academicButtonRef.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [academicOpen]);
  const navClass = (active: boolean, admin = false) => `nav-link ${active ? 'is-active' : ''} ${admin ? 'is-admin' : ''}`;
  const academicActive = academicLinks.some((link) => link.match(location.pathname));
  const academicMenu = (id: string) => <div className="academic-nav-menu" id={id}>{academicLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={() => { setAcademicOpen(false); setOpen(false); }} className={navClass(link.match(location.pathname))} aria-current={link.match(location.pathname) ? 'page' : undefined}>{link.label}</NavLink>)}</div>;

  return <header className="nav-shell nav-enter sticky top-0 z-50">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 p-3 md:gap-3 md:px-4">
      <Link to="/" className="flex items-center" aria-label="Home"><X1Mark size="sm" mode={mode} /></Link>
      <nav className="hidden flex-wrap items-center gap-1.5 lg:flex lg:justify-end" aria-label="Primary navigation">
        {links.slice(0, 2).map((link) => <NavLink key={link.label} to={link.to} className={navClass(link.match(location.pathname))}>{link.label}</NavLink>)}
        <div className="academic-nav" ref={academicRef}>
          <button ref={academicButtonRef} type="button" className={navClass(academicActive)} aria-expanded={academicOpen} aria-controls="academic-navigation-menu" onClick={() => setAcademicOpen((value) => !value)}>X1 Academic <ChevronDown size={15} className={academicOpen ? 'rotate-180' : ''} aria-hidden="true" /></button>
          {academicOpen && academicMenu('academic-navigation-menu')}
        </div>
        {links.slice(2).map((link) => <NavLink key={link.label} to={link.to} className={navClass(link.match(location.pathname), link.label === 'Admin')}>{link.label}</NavLink>)}
      </nav>
      <div className="hidden lg:block"><ThemeSwitcher mode={mode} onChange={onTheme} /></div>
      <button className="nav-mobile-trigger lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}>{open ? <X /> : <Menu />}</button>
    </div>
    <nav id="mobile-navigation" className={`mobile-nav glass mx-4 rounded-2xl p-4 lg:hidden ${open ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!open}>
      {links.slice(0, 2).map((link) => <NavLink key={link.label} tabIndex={open ? 0 : -1} to={link.to} className={navClass(link.match(location.pathname))}>{link.label}</NavLink>)}
      <button tabIndex={open ? 0 : -1} type="button" className={navClass(academicActive)} aria-expanded={academicOpen} aria-controls="mobile-academic-navigation-menu" onClick={() => setAcademicOpen((value) => !value)}>X1 Academic <ChevronDown size={15} className={academicOpen ? 'rotate-180' : ''} aria-hidden="true" /></button>
      {academicOpen && academicMenu('mobile-academic-navigation-menu')}
      {links.slice(2).map((link) => <NavLink tabIndex={open ? 0 : -1} key={link.label} to={link.to} className={navClass(link.match(location.pathname), link.label === 'Admin')}>{link.label}</NavLink>)}
      <ThemeSwitcher mode={mode} onChange={onTheme} />
    </nav>
  </header>;
}
