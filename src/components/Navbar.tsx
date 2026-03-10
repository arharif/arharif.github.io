import { Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ThemeMode } from '@/lib/theme';
import { ThemeSwitcher } from './ThemeSwitcher';
import { X1Mark } from './branding/X1Mark';

type NavItem = { to: string; label: string; match: (path: string) => boolean };

export function Navbar({ mode, onTheme }: { mode: ThemeMode; onTheme: (m: ThemeMode) => void }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = useMemo<NavItem[]>(() => [
    { to: '/', label: 'Landing', match: (path) => path === '/' },
    { to: '/professional', label: 'Technology & Innovation', match: (path) => path === '/professional' || path.startsWith('/professional/') },
    { to: '/personal', label: 'Curiosities & Philosophy', match: (path) => path === '/personal' || path.startsWith('/personal/') },
    { to: '/security-mindmap', label: 'Security Map', match: (path) => path === '/security-mindmap' || path === '/Security_Mindmap' },
    { to: '/submitting', label: 'Submitting', match: (path) => path === '/submitting' },
    { to: '/games#games-zone', label: 'Games', match: (path) => path === '/games' },
    { to: '/admin', label: 'Admin', match: (path) => path === '/admin' || path === '/login' },
  ], []);

  const navClass = (active: boolean, admin = false) =>
    `rounded-lg px-2 py-1 text-sm transition-colors ${active ? 'bg-white/15 text-white' : admin ? 'text-muted/90 hover:text-white' : 'text-muted hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="flex items-center" aria-label="Home">
          <X1Mark size="sm" mode={mode} />
        </Link>

        <nav className="hidden gap-3 md:flex" aria-label="Primary navigation">
          {links.map((link) => {
            const active = link.match(location.pathname);
            return (
              <NavLink key={link.label} to={link.to} className={navClass(active, link.label === 'Admin')}>
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:block"><ThemeSwitcher mode={mode} onChange={onTheme} /></div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}>{open ? <X /> : <Menu />}</button>
      </div>

      {open && (
        <div className="glass mx-4 mb-4 rounded-2xl p-4 md:hidden">
          <div className="mb-3 flex flex-col gap-2">
            {links.map((link) => {
              const active = link.match(location.pathname);
              return (
                <NavLink key={link.label} to={link.to} onClick={() => setOpen(false)} className={navClass(active, link.label === 'Admin')}>
                  {link.label}
                </NavLink>
              );
            })}
          </div>
          <ThemeSwitcher mode={mode} onChange={onTheme} />
        </div>
      )}
    </header>
  );
}
