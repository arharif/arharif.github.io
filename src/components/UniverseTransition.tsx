import type { Journey } from './JourneyScene';
import {
  lazy, Suspense, useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const JourneyScene = lazy(() => import('./JourneyScene'));
const journeyMs = { arcade:3600, insights:4500, academic:3100 };

function world(path: string) {
  if (/^\/games\/?$/.test(path)) return "arcade";
  if (path.startsWith("/x1-academic")) return "academic";
  if (/^\/(insights-innovation|personal|professional)(\/|$)/.test(path))
    return "insights";
  return path === "/" ? "home" : "site";
}
const names = {
  arcade: "X1 Arcade",
  insights: "Insights & Innovation",
  academic: "X1 Academic",
  home: "Home",
  site: "X1",
};

export function UniverseTransition() {
  const location = useLocation();
  const destination = world(location.pathname);
  const previous = useRef(destination);
  const origin = useRef<{ world: string; accent: string; x: number; y: number; card?: DOMRect; image?: string } | null>(null);
  useEffect(() => {
    function rememberLink(event: MouseEvent) {
      const target =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !(target instanceof HTMLAnchorElement) ||
        target.origin !== window.location.origin ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const bounds = target.getBoundingClientRect();
      origin.current = {
        world: world(target.pathname),
        accent: getComputedStyle(target).getPropertyValue("--x1-accent").trim(),
        card: target.matches(".destination") ? bounds : undefined,
        image: target.querySelector("img")?.currentSrc,
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      };
    }
    document.addEventListener("click", rememberLink, true);
    return () => document.removeEventListener("click", rememberLink, true);
  }, []);
  const [travel, setTravel] = useState<{
    card?: DOMRect;
    image?: string;
    journey?: Journey;
    accent?: string;
    from: string;
    to: string;
    x: number;
    y: number;
  } | null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const node = modal.current;
    if (!node || !travel?.journey) return;
    node.showModal();
    return () => node.close();
  }, [travel]);
  const navigation = useNavigationType();
  const scrollPositions = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const key = location.key;
    if (navigation === "POP" && scrollPositions.current.has(key))
      window.scrollTo(0, scrollPositions.current.get(key)!);
    function remember() {
      scrollPositions.current.set(key, window.scrollY);
    }
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [location.key, navigation]);
  useLayoutEffect(() => {
    document.documentElement.dataset.arcade = String(destination === "arcade");
    const from = previous.current;
    previous.current = destination;
    if (from === destination || from === "site" || destination === "site") {
      setTravel(null);
      return;
    }
    const point = origin.current?.world === destination ? origin.current : null;
    origin.current = null;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (navigation === 'POP' || motion.matches) { setTravel(null); return; }
    const journey = from === 'home' && point?.card && destination !== 'home' ? destination as Journey : undefined;
    const cancel = () => setTravel(null);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); };
    window.addEventListener('keydown', escape);
    motion.addEventListener('change', cancel);
    setTravel({
      journey, accent: point?.accent,
      card: point?.card, image: point?.image,
      from,
      to: destination,
      x: point?.x ?? window.innerWidth / 2,
      y: point?.y ?? window.innerHeight / 2,
    });
    const timer = window.setTimeout(() => setTravel(null), journey ? journeyMs[journey] : 720);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', escape); motion.removeEventListener('change',cancel); };
  }, [destination, location.key, navigation]);
  return (
    <>
      <span aria-live="polite" className="sr-only">
        {names[destination]}
      </span>
      {travel && (
        <div
          key={travel.to}
          className={travel.journey ? "uni-transit cinema" : "uni-transit"}
          style={
            {
              "--journey-accent": travel.accent,
              "--duration": (travel.journey ? journeyMs[travel.journey] : 720) + "ms",
              "--entry-x": travel.x + "px",
              "--entry-y": travel.y + "px",
            } as CSSProperties
          }
          data-from={travel.from}
          data-to={travel.to}
          aria-hidden={travel.journey ? undefined : true}
        >
          {travel.journey && <dialog ref={modal} className="journey-modal" aria-label={names[travel.journey]+" entrance"} onCancel={() => setTravel(null)} onClick={() => setTravel(null)}><Suspense fallback={null}><JourneyScene world={travel.journey}/></Suspense><button className="journey-skip" onClick={() => setTravel(null)}>Skip journey</button></dialog>}
          {!travel.journey && travel.card && travel.image && <img alt="" className="portal-art" src={travel.image}
            style={{left:travel.card.left, top:travel.card.top,width:travel.card.width,height:travel.card.height}}/>}
          {!travel.journey && <><i/><b/></>}
        </div>
      )}
    </>
  );
}
