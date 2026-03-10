import { CategoryFamily } from './types';
import { FilterState } from './filters';

export function SecurityMapFilters({
  categories,
  state,
  onChange,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
}: {
  categories: CategoryFamily[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}) {
  return (
    <div className="roles-filters glass rounded-2xl p-4">
      <div className="roles-filter-row">
        <input
          className="mindmap-input"
          aria-label="Search roles map"
          placeholder="Search category, role, or subdomain"
          value={state.search}
          onChange={(e) => onChange({ ...state, search: e.target.value.slice(0, 140) })}
        />
        <div className="mindmap-btn-group" role="group" aria-label="Map camera controls">
          <button className="mindmap-btn" onClick={onZoomIn}>+</button>
          <button className="mindmap-btn" onClick={onZoomOut}>−</button>
          <button className="mindmap-btn" onClick={onFit}>Fit</button>
          <button className="mindmap-btn" onClick={onReset}>Reset</button>
        </div>
      </div>

      <div className="roles-chip-wrap" role="tablist" aria-label="Category filter">
        <button
          className={`role-chip ${state.category === 'all' ? 'is-active' : ''}`}
          onClick={() => onChange({ ...state, category: 'all' })}
        >
          All categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`role-chip ${state.category === category.id ? 'is-active' : ''}`}
            style={{ borderColor: category.color.ring }}
            onClick={() => onChange({ ...state, category: category.id })}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="roles-toggle-row" role="group" aria-label="Type filters">
        <label><input type="checkbox" checked={state.showRoles} onChange={(e) => onChange({ ...state, showRoles: e.target.checked })} /> Roles</label>
        <label><input type="checkbox" checked={state.showSubdomains} onChange={(e) => onChange({ ...state, showSubdomains: e.target.checked })} /> Subdomains</label>
        <label><input type="checkbox" checked={state.coreRolesOnly} onChange={(e) => onChange({ ...state, coreRolesOnly: e.target.checked })} /> Core roles only</label>
      </div>
    </div>
  );
}
