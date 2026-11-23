import { Check, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { palettes, type ThemeMode } from "@/lib/palettes";

export function ThemeSwitcher({
  mode,
  onChange,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    root.current
      ?.querySelector<HTMLButtonElement>("[aria-checked=true]")
      ?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div
      ref={root}
      className="palette-picker"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="palette-trigger"
        aria-label="Open theme selector"
        title={palettes[mode][0]}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Sun size={20} />
      </button>
      {open && (
        <div
          className="palette-menu"
          role="menu"
          aria-label="Theme options"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
              return;
            }
            const buttons = Array.from(
              e.currentTarget.querySelectorAll("button"),
            );
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const next = {
              ArrowDown: (index + 1) % 8,
              ArrowUp: (index + 7) % 8,
              Home: 0,
              End: 7,
            }[e.key];
            if (next !== undefined) {
              e.preventDefault();
              buttons[next].focus();
            }
          }}
        >
          {(Object.keys(palettes) as ThemeMode[]).map((id) => {
            const [label, bg, surface, ink, accent] = palettes[id];
            return (
              <button
                key={id}
                role="menuitemradio"
                aria-label={`Activate ${label}`}
                aria-checked={id === mode}
                onClick={() => {
                  onChange(id);
                  close();
                }}
              >
                <i
                  style={{
                    background: `conic-gradient(${bg} 25%, ${surface} 0 50%, ${ink} 0 75%, ${accent} 0)`,
                  }}
                />
                {label}
                {id === mode && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
