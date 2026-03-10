export function TopicFilterBar({
  label,
  options,
  active,
  onChange,
  count,
}: {
  label: string;
  options: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
  count?: number;
}) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
        {typeof count === 'number' && <p className="text-xs text-muted">{count} results</p>}
      </div>
      <div className="filter-chip-row" role="tablist" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            role="tab"
            aria-selected={active === option.id}
            className={`filter-chip ${active === option.id ? 'is-active' : ''}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
