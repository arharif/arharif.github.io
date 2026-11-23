import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { resolveAssistantSection } from './assistantContext';
import { GuidePortrait, guideFor } from './GuidePortrait';

const Panel = lazy(() => import('./SiteAssistantPanel').then(module => ({ default: module.SiteAssistantPanel })));

export function SiteAssistantLauncher() {
  const location = useLocation();
  const section = resolveAssistantSection(location.pathname);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [host, setHost] = useState<HTMLDialogElement | null>(null);
  const [mood, setMood] = useState('idle');
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function syncRoom() {
      const room = document.querySelector<HTMLDialogElement>('.play-room[open]');
      setHost(room);
      setMood(room?.dataset.mood || 'idle');
    }
    syncRoom();
    window.addEventListener('x1-play-room', syncRoom);
    return () => window.removeEventListener('x1-play-room', syncRoom);
  }, [location.key]);
  useEffect(() => { setOpen(false); }, [location.key]);

  const ui = <>
    <button ref={trigger} className="assistant-launcher" data-guide={guideFor(section)} data-mood={mood}
      aria-expanded={open} aria-controls="x1-assistant-panel"
      aria-label={open ? 'Close X1 assistant' : 'Open X1 assistant'}
      onClick={() => { setLoaded(true); setOpen(!open); }}>
      <GuidePortrait section={section}/>
    </button>
    {loaded && <Suspense fallback={<span role="status" className="sr-only">Opening guide…</span>}>
      <Panel open={open} onClose={close}/>
    </Suspense>}
  </>;
  return host && section === 'games' ? createPortal(ui, host) : ui;
}
