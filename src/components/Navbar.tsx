import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeMode } from '@/lib/theme';
import { ThemeSwitcher } from './ThemeSwitcher';
import { X1Mark } from './branding/X1Mark';

export function Navbar({ mode, onTheme }: { mode: ThemeMode; onTheme: (m: ThemeMode) => void }) {
  const [open, setOpen] = useState(false);
  const links = [
    { to: '/', label: 'Landing' },
    { to: '/professional', label: 'Professional' },
    { to: '/personal', label: 'Personal' },
    { to: '/search', label: 'Search' },
    { to: '/now', label: 'Now' },
    { to: '/games', label: 'Games' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="flex items-center" aria-label="Home">
          <X1Mark size="sm" mode={mode} />
        </Link>
        <nav className="hidden gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm text-muted hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block"><ThemeSwitcher mode={mode} onChange={onTheme} /></div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="glass mx-4 mb-4 rounded-2xl p-4 md:hidden">
          <div className="mb-3 flex flex-col gap-2">
            {links.map((link) => (
              <Link key={link.label} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
          <ThemeSwitcher mode={mode} onChange={onTheme} />
        </div>
      )}
    </header>
  );
}
