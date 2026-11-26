import { Link, useSearchParams } from "react-router-dom";
import { useSiteSearch } from "@/lib/siteSearch";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") ?? "").slice(0, 120);
  const { groups, status, retry } = useSiteSearch(query);
  return (
    <section>
      <h1 className="mb-4 text-3xl font-semibold">Search</h1>
      <label className="glass mb-5 block rounded-2xl p-3">
        <span className="sr-only">Search the website</span>
        <input type="search" maxLength={120} placeholder="Search tools, articles, topics and games" className="w-full bg-transparent" value={query} onChange={(event) => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} />
      </label>
      {status === "error" && <p role="alert">Published content could not be loaded. <button className="underline" onClick={retry}>Retry</button></p>}
      {status === "loading" && <p role="status" className="text-muted">Loading published content…</p>}
      <div className="grid gap-5 md:grid-cols-2">
        {groups.map(({ title, items }) => <section key={title}>
          <h2 className="mb-2 text-xl font-semibold">{title}</h2>
          {items.map((item) => <Link className="glass mb-2 block rounded-xl p-3" key={item.id} to={item.path}>
            {item.title}
            {item.description && <span className="block text-sm text-muted">{item.description}</span>}
          </Link>)}
          {items.length === 0 && status === "ready" && <p className="text-muted">No matches</p>}
        </section>)}
      </div>
    </section>
  );
}
