import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLocation, useNavigationType } from "react-router-dom";

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
  const origin = useRef<{ world: string; x: number; y: number; card?: DOMRect; image?: string } | null>(null);
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
    from: string;
    to: string;
    x: number;
    y: number;
  } | null>(null);
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
    setTravel({
      card: point?.card, image: point?.image,
      from,
      to: destination,
      x: point?.x ?? window.innerWidth / 2,
      y: point?.y ?? window.innerHeight / 2,
    });
    const timer = window.setTimeout(() => setTravel(null), 720);
    return () => window.clearTimeout(timer);
  }, [destination]);
  return (
    <>
      <span aria-live="polite" className="sr-only">
        {names[destination]}
      </span>
      {travel && (
        <div
          key={travel.to}
          className="uni-transit"
          style={
            {
              "--entry-x": travel.x + "px",
              "--entry-y": travel.y + "px",
            } as CSSProperties
          }
          data-from={travel.from}
          data-to={travel.to}
          aria-hidden="true"
        >
          {travel.card && travel.image && <img alt="" className="portal-art" src={travel.image}
            style={{left:travel.card.left, top:travel.card.top,width:travel.card.width,height:travel.card.height}}/>}
          <i />
          <b />
        </div>
      )}
    </>
  );
}
