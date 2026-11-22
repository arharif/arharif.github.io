import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkle } from 'lucide-react';
import { resolveAssistantSection } from './assistantContext';
import { safeStorage } from '@/lib/storage';

const SINGLETON_KEY = '__x1_single_launcher__' as const;
const SEEN_KEY = 'x1-assistant-seen-sections';

type LauncherWindow = Window & { [SINGLETON_KEY]?: boolean };

const SiteAssistantPanel = lazy(() => import('./SiteAssistantPanel').then((module) => ({ default: module.SiteAssistantPanel })));

const readSeen = (): Record<string, boolean> => {
  const raw = safeStorage.get(SEEN_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, boolean> : {};
  } catch {
    return {};
  }
};

const writeSeen = (value: Record<string, boolean>) => safeStorage.set(SEEN_KEY, JSON.stringify(value));

export function SiteAssistantLauncher() {
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }, []);
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
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
        ref={trigger}
        className="assistant-launcher"
        onClick={() => {
          if (!open) { setHasOpened(true); setNavIndicator(false); }
          setOpen(!open);
        }}
        aria-label={open ? 'Close X1 assistant' : 'Open X1 assistant'}
        aria-expanded={open}
        aria-controls="x1-assistant-panel"
      >
        <Sparkle aria-hidden="true" size={24} fill="currentColor" strokeWidth={1.5}/>
        {showBadge && <span className="assistant-launcher-badge" aria-hidden="true" />}
      </button>
      {hasOpened && (
        <Suspense fallback={<span className="sr-only" role="status" aria-live="polite">Loading X1 assistant…</span>}>
          <SiteAssistantPanel open={open} onClose={close} />
        </Suspense>
      )}
    </>
  );
}
