import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X1Mark } from '@/components/branding/X1Mark';
import { SiteAssistantPanel } from './SiteAssistantPanel';
import { resolveAssistantSection } from './assistantContext';

const SINGLETON_KEY = '__x1_single_launcher__' as const;
const SEEN_KEY = 'x1-assistant-seen-sections';

type LauncherWindow = Window & { [SINGLETON_KEY]?: boolean };

const readSeen = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, boolean> : {};
  } catch {
    return {};
  }
};

const writeSeen = (value: Record<string, boolean>) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(value));
  } catch {
    /* ignore storage failures */
  }
};

export function SiteAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [seenSections, setSeenSections] = useState<Record<string, boolean>>(() => readSeen());

  const [navIndicator, setNavIndicator] = useState(false);
  const prevRouteKeyRef = useRef<string>('');
  const location = useLocation();
  const routeKey = useMemo(() => resolveAssistantSection(location.pathname), [location.pathname]);

  useEffect(() => {
    const w = window as LauncherWindow;
    if (w[SINGLETON_KEY]) {
      setEnabled(false);
      return;
    }
    w[SINGLETON_KEY] = true;
    return () => {
      w[SINGLETON_KEY] = false;
    };
  }, []);

  const markSeen = (key: string) => {
    setSeenSections((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      writeSeen(next);
      return next;
    });
  };

  useEffect(() => {
    if (open) markSeen(routeKey);
  }, [open, routeKey]);


  useEffect(() => {
    if (!prevRouteKeyRef.current) {
      prevRouteKeyRef.current = routeKey;
      return;
    }
    if (prevRouteKeyRef.current === routeKey) return;
    prevRouteKeyRef.current = routeKey;
    if (open) return;

    setNavIndicator(true);
    const timer = window.setTimeout(() => setNavIndicator(false), 2600);
    return () => window.clearTimeout(timer);
  }, [routeKey, open]);

  if (!enabled) return null;

  const showBadge = !open && (!seenSections[routeKey] || navIndicator);

  return (
    <>
      <button
        className="assistant-launcher"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) { markSeen(routeKey); setNavIndicator(false); }
            return next;
          });
        }}
        aria-label={open ? 'Close X1 assistant' : 'Open X1 assistant'}
        aria-expanded={open}
        aria-controls="x1-assistant-panel"
      >
        <span className="assistant-launcher-logo"><X1Mark size="sm" /></span>
        {showBadge && <span className="assistant-launcher-badge" aria-hidden="true" />}
      </button>
      <SiteAssistantPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
