import { useEffect, useRef, useState, type ComponentType } from "react";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const loadSearch = () => import("./GlobalSearch");

export function SiteSearchButton() {
  const [SearchDialog, setSearchDialog] = useState<ComponentType<{ close: (restoreFocus?: boolean) => void }>>();
  const [opening, setOpening] = useState(false);
  const location = useLocation();
  const trigger = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!opening) return;
    let active = true;
    loadSearch().then(({ default: Dialog }) => {
      if (active) setSearchDialog(() => Dialog);
    }).catch(() => {
      if (active) window.location.assign("/search");
    });
    return () => { active = false; };
  }, [opening, location.key]);
  useEffect(() => {
    setOpening(false);
    setSearchDialog(undefined);
  }, [location.key]);
  const preload = () => { void loadSearch().catch(() => undefined); };
  return <>
    <Link ref={trigger} to="/search" className="site-search-trigger" title="Search" aria-label="Search website" aria-haspopup="dialog"
      onFocus={preload} onPointerEnter={preload} onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        event.preventDefault();
        setOpening(true);
      }}><Search size={18} aria-hidden="true" /></Link>
    {opening && !SearchDialog && <span className="sr-only" role="status">Opening search…</span>}
    {opening && SearchDialog && <SearchDialog close={(restoreFocus = true) => {
      setOpening(false);
      if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
    }} />}
  </>;
}
