import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeMode } from '@/lib/theme';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Navbar({ mode, onTheme }: { mode: ThemeMode; onTheme: (m: ThemeMode) => void }) {
  const [open, setOpen] = useState(false);
  const links = ['Landing', 'Professional', 'Personal', 'Contact'];
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <div className="font-semibold tracking-[0.2em]">X1</div>
        <nav className="hidden gap-6 md:flex">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-muted hover:text-white">
              {link}
            </a>
          ))}
        </nav>
        <div className="hidden md:block"><ThemeSwitcher mode={mode} onChange={onTheme} /></div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="glass mx-4 mb-4 rounded-2xl p-4 md:hidden">
          <div className="mb-3 flex flex-col gap-2">{links.map((l) => <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>)}</div>
          <ThemeSwitcher mode={mode} onChange={onTheme} />
        </div>
      )}
    </header>
  );
}
