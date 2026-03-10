import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X1Mark } from '@/components/branding/X1Mark';
import { SiteAssistantPanel } from './SiteAssistantPanel';
import { resolveAssistantSection } from './assistantContext';

const singletonKey = '__x1_single_launcher__';
const seenKey = 'x1-assistant-seen-sections';

const readSeen = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(seenKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, boolean> : {};
  } catch {
    return {};
  }
};

const writeSeen = (value: Record<string, boolean>) => {
  try {
    localStorage.setItem(seenKey, JSON.stringify(value));
  } catch {
    /* ignore storage failures */
  }
};

const singletonKey = '__x1_single_launcher__';

export function SiteAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [seenSections, setSeenSections] = useState<Record<string, boolean>>(() => readSeen());
  const location = useLocation();
  const routeKey = useMemo(() => resolveAssistantSection(location.pathname), [location.pathname]);

  useEffect(() => {
    const w = window as Window & { [singletonKey]?: boolean };
    if (w[singletonKey]) {
      setEnabled(false);
      return;
    }
    w[singletonKey] = true;
    return () => {
      w[singletonKey] = false;
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

  if (!enabled) return null;

  const showBadge = !open && !seenSections[routeKey];

  return (
    <>
      <button
        className="assistant-launcher"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) markSeen(routeKey);
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
