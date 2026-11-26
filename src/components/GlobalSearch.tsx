import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSearch } from "@/lib/siteSearch";

export default function GlobalSearch({ close }: { close: (restoreFocus?: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const { groups, status, retry } = useSiteSearch(query, 4);
  const shown = groups.filter((group) => group.items.length);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    input.current?.focus();
    return () => element.close();
  }, []);
  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };
  return (
    <dialog ref={dialog} className="site-search" aria-labelledby="site-search-title" onClick={closeOnBackdrop} onCancel={(event) => { event.preventDefault(); close(); }} onKeyDown={(event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const results = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>(".site-search-results a")];
      const focus = document.activeElement;
      const index = results.findIndex((item) => item === focus);
      if (focus !== input.current && index < 0) return;
      event.preventDefault();
      const next = event.key === "ArrowDown" ? index + 1 : index - 1;
      if (index < 0 && event.key === "ArrowUp") results[results.length - 1]?.focus();
      else if (next < 0 || next >= results.length) input.current?.focus();
      else results[next].focus();
    }}>
      <div className="site-search-inner">
        <header>
          <h2 id="site-search-title">Search X1</h2>
          <button type="button" className="site-search-close" onClick={() => close()} aria-label="Close search"><X size={20} /></button>
        </header>
        <form action="/search" onSubmit={(event) => {
          const result = dialog.current?.querySelector<HTMLAnchorElement>("[data-full-search]");
          if (result) { event.preventDefault(); result.click(); }
        }}>
          <label className="site-search-field">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search tools, articles, topics and games</span>
            <input ref={input} type="search" name="q" maxLength={120} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title or topic" />
          </label>
        </form>
        <div className="site-search-results">
          {shown.map((group) => <section key={group.title}>
            <h3>{group.title}</h3>
            {group.items.map((item) => <Link key={item.id} to={item.path} onClick={() => close(false)}>
              <span>{item.title}</span><ArrowUpRight size={15} aria-hidden="true" />
            </Link>)}
          </section>)}
          <div role="status">
            {status === "loading" && "Loading published content…"}
            {status === "ready" && !shown.length && "No results match your search."}
            {status === "error" && <>Published content is unavailable. <button type="button" onClick={retry}>Retry</button></>}
          </div>
        </div>
        <Link data-full-search className="site-search-all" to={"/search" + (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : "")} onClick={() => close(false)}>Open full search <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </dialog>
  );
}
