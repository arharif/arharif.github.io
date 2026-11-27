import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { safeStorage } from "@/lib/storage";
import { syncBrowserThemeColor } from "@/lib/theme";
import type { Journey } from "./JourneyScene";

function Scene({ world }: { world: Journey }) {
  const [Portrait, setPortrait] = useState<ComponentType<{ world: Journey }>>();
  useEffect(() => {
    let active = true;
    import("./JourneyScene").then(({ default: Content }) => {
      if (active) setPortrait(() => Content);
    }).catch(() => { /* Navigation and Skip remain available without the scene. */ });
    return () => { active = false; };
  }, []);
  return Portrait ? <Portrait world={world} /> : null;
}
const journeyMs = { arcade: 3600, insights: 4500, academic: 3100 };
const briefMs = 240;
const replayEvent = "x1:replay-introduction";
const homeEntries: Record<string, Journey | undefined> = {
  "/games": "arcade",
  "/x1-academic": "academic",
  "/insights-innovation": "insights",
};

function world(path: string) {
  if (/^\/games\/?$/.test(path)) return "arcade";
  if (/^\/x1-academic(\/|$)/.test(path)) return "academic";
  if (/^\/(insights-innovation|personal|professional)(\/|$)/.test(path)) return "insights";
  return path === "/" ? "home" : "site";
}

const names = {
  arcade: "X1 Arcade",
  insights: "Insights & Innovation",
  academic: "X1 Academic",
  home: "Home",
  site: "X1",
};

type Destination = ReturnType<typeof world>;
type Travel = { journey?: Journey; accent?: string; from: Destination; to: Destination; replayTrigger?: HTMLButtonElement; x: number; y: number };

export function ReplayIntroduction() {
  const { pathname } = useLocation();
  const canReplay = Boolean(homeEntries[pathname.replace(/\/$/, "")]);
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    if (!canReplay) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(motion.matches);
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, [canReplay]);
  if (!canReplay || reduced) return null;
  return <button type="button" className="replay-intro" onClick={(event) => window.dispatchEvent(new CustomEvent(replayEvent, { detail: event.currentTarget }))}>
    <RotateCcw size={15} aria-hidden="true" /> Replay introduction
  </button>;
}

export function UniverseTransition() {
  const location = useLocation();
  const destination = world(location.pathname);
  const navigation = useNavigationType();
  const previous = useRef<Destination>(destination);
  const origin = useRef<{ path: string; accent: string; x: number; y: number }>();
  const seen = useRef(new Set<Journey>());
  const [travel, setTravel] = useState<Travel | null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const closeTravel = useCallback((trigger?: HTMLButtonElement) => {
    const dialog = modal.current;
    dialog?.close();
    setTravel(null);
    if (!dialog) return;
    requestAnimationFrame(() => {
      if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true });
      } else if (document.activeElement === document.body) {
        const main = document.querySelector<HTMLElement>("#main-content, #xc-main");
        if (main) {
          if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
          main.focus({ preventScroll: true });
        }
      }
    });
  }, []);

  useEffect(() => {
    function rememberLink(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.origin !== window.location.origin ||
          event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const bounds = target.getBoundingClientRect();
      const point = {
        path: target.pathname,
        accent: getComputedStyle(target).getPropertyValue("--x1-accent").trim(),
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      };
      origin.current = point;
      window.setTimeout(() => { if (origin.current === point) origin.current = undefined; }, 750);
    }
    document.addEventListener("click", rememberLink, true);
    return () => document.removeEventListener("click", rememberLink, true);
  }, []);

  const scrollPositions = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const key = location.key;
    if (navigation === "POP" && scrollPositions.current.has(key)) {
      window.scrollTo(0, scrollPositions.current.get(key)!);
    }
    const remember = () => scrollPositions.current.set(key, window.scrollY);
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [location.key, navigation]);

  useLayoutEffect(() => {
    document.documentElement.dataset.arcade = String(destination === "arcade");
    syncBrowserThemeColor();
    const from = previous.current;
    previous.current = destination;
    const point = origin.current?.path === location.pathname ? origin.current : null;
    origin.current = undefined;
    setTravel(null);
    if (from === destination || from === "site" || destination === "site" ||
        navigation === "POP" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const candidate = from === "home" && point ? homeEntries[location.pathname.replace(/\/$/, "")] : undefined;
    let journey: Journey | undefined;
    if (candidate) {
      const key = "x1-introduction:" + candidate;
      if (!seen.current.has(candidate) && !safeStorage.get(key)) journey = candidate;
      seen.current.add(candidate);
      safeStorage.set(key, "seen");
    }
    setTravel({ from, to: destination, journey, accent: destination === "arcade" ? "#7cecf7" : point?.accent, x: point?.x ?? innerWidth / 2, y: point?.y ?? innerHeight / 2 });
  }, [destination, location.pathname, location.key, navigation]);

  useEffect(() => {
    const replay = (event: Event) => {
      const journey = homeEntries[location.pathname.replace(/\/$/, "")];
      if (journey && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setTravel({ from: destination, to: destination, journey, replayTrigger: (event as CustomEvent<HTMLButtonElement>).detail, x: innerWidth / 2, y: innerHeight / 2 });
      }
    };
    window.addEventListener(replayEvent, replay);
    return () => window.removeEventListener(replayEvent, replay);
  }, [destination, location.pathname]);

  useLayoutEffect(() => {
    if (!travel) return;
    const node = modal.current;
    node?.showModal();
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const close = () => closeTravel(travel.replayTrigger);
    const timer = window.setTimeout(close, travel.journey ? journeyMs[travel.journey] : briefMs);
    motion.addEventListener("change", close);
    return () => {
      node?.close();
      window.clearTimeout(timer);
      motion.removeEventListener("change", close);
    };
  }, [travel, closeTravel]);

  return <>
    <span aria-live="polite" className="sr-only">{names[destination]}</span>
    {travel && <div className={travel.journey ? "uni-transit cinema" : "uni-transit"}
      style={{
        "--journey-accent": travel.accent,
        "--duration": (travel.journey ? journeyMs[travel.journey] : briefMs) + "ms",
        "--entry-x": travel.x + "px",
        "--entry-y": travel.y + "px",
      } as CSSProperties}
      data-from={travel.from} data-to={travel.to} aria-hidden={travel.journey ? undefined : true}>
      {travel.journey ? <dialog ref={modal} className="journey-modal" aria-label={names[travel.journey] + " entrance"}
        onCancel={(event) => { event.preventDefault(); closeTravel(travel.replayTrigger); }}>
        <Scene world={travel.journey} />
        <button className="journey-skip" onClick={() => closeTravel(travel.replayTrigger)}>Skip journey</button>
      </dialog> : <><i /><b /></>}
    </div>}
  </>;
}
