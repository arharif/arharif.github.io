import { Moon, Sun } from "lucide-react";
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
        {mode === "onyx-black" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
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
            const count = buttons.length;
            const columns = 2;
            const next = {
              ArrowRight: (index + 1) % count,
              ArrowDown: (index + columns) % count,
              ArrowLeft: (index + count - 1) % count,
              ArrowUp: (index + count - columns) % count,
              Home: 0,
              End: count - 1,
            }[e.key];
            if (next !== undefined) {
              e.preventDefault();
              buttons[next].focus();
            }
          }}
        >
          <p className="palette-foundation" role="presentation">Professional Light</p>
          {(Object.keys(palettes) as ThemeMode[]).map((id) => {
            const [label, , surface, , accent] = palettes[id];
            return (
              <button
                key={id}
                data-foundation={id === "onyx-black" ? "onyx" : "light"}
                title={label}
                role="menuitemradio"
                aria-label={`Activate ${label}`}
                aria-checked={id === mode}
                onClick={() => {
                  onChange(id);
                  close();
                }}
              >
                <i aria-hidden="true"
                  style={{
                    background: `linear-gradient(135deg, ${surface} 0 38%, ${accent} 40%)`,
                  }}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
