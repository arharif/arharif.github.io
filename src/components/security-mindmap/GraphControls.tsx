import { FocusMode } from './types';

export function GraphControls({
  focus,
  setFocus,
  search,
  setSearch,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
}: {
  focus: FocusMode;
  setFocus: (v: FocusMode) => void;
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
        placeholder="Search domains, standards, journey stages"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select aria-label="Focus mode" className="mindmap-input" value={focus} onChange={(e) => setFocus(e.target.value as FocusMode)}>
        <option value="full">Full Map</option>
        <option value="journey">My Journey</option>
        <option value="technical">Technical Domains</option>
        <option value="governance">Governance & Risk</option>
        <option value="operations">Security Operations</option>
        <option value="future">Future Vision</option>
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
