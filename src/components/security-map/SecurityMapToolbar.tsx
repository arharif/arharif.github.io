export function SecurityMapToolbar({
  categories,
  category,
  search,
  setCategory,
  setSearch,
  onReset,
}: {
  categories: Array<{ id: string; label: string }>;
  category: string;
  search: string;
  setCategory: (value: string) => void;
  setSearch: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="roles-toolbar glass rounded-2xl p-3 md:p-4" role="region" aria-label="Security map controls">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Explore by category or keyword</p>
        <button className="mindmap-btn" onClick={onReset} aria-label="Reset map filters and view">Reset</button>
      </div>

      <div className="roles-toolbar-grid">
        <label className="roles-field">
          <span className="roles-field-label">Category</span>
          <select className="mindmap-input" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label className="roles-field">
          <span className="roles-field-label">Search</span>
          <input
            className="mindmap-input"
            value={search}
            onChange={(e) => setSearch(e.target.value.slice(0, 120))}
            placeholder="Search category, role, or subdomain"
            aria-label="Search security map"
            autoComplete="off"
          />
        </label>
      </div>
    </div>
  );
}
