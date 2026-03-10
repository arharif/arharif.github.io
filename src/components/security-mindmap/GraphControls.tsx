import { ApprovedTheme, ApprovedThemeOption } from './types';

export function GraphControls({
  theme,
  setTheme,
  options,
  search,
  setSearch,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
}: {
  theme: ApprovedTheme;
  setTheme: (v: ApprovedTheme) => void;
  options: ApprovedThemeOption[];
  search: string;
  setSearch: (v: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mindmap-controls">
      <label className="sr-only" htmlFor="mindmap-search">Search nodes</label>
      <input
        id="mindmap-search"
        className="mindmap-input"
        placeholder="Search cybersecurity domains"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select aria-label="Security map theme" className="mindmap-input" value={theme} onChange={(e) => setTheme(e.target.value as ApprovedTheme)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <div className="mindmap-btn-group" role="group" aria-label="Graph camera controls">
        <button className="mindmap-btn" onClick={onZoomIn}>+</button>
        <button className="mindmap-btn" onClick={onZoomOut}>−</button>
        <button className="mindmap-btn" onClick={onFit}>Fit</button>
        <button className="mindmap-btn" onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}
