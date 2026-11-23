import { useSyncExternalStore } from "react";
import { palettes, defaultTheme, type ThemeMode } from "./palettes";
import { safeStorage } from "./storage";
export type { ThemeMode };

function current(): ThemeMode {
  const name = document.documentElement.dataset.palette || "";
  return Object.prototype.hasOwnProperty.call(palettes, name)
    ? (name as ThemeMode)
    : defaultTheme;
}
function subscribe(listener: () => void) {
  window.addEventListener("x1-palette", listener);
  return () => window.removeEventListener("x1-palette", listener);
}
let paletteFrame = 0;
function setTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (palettes[current()][5] !== palettes[theme][5]) {
    // Commit readable foregrounds and backgrounds together when reversing polarity.
    cancelAnimationFrame(paletteFrame);
    root.dataset.paletteFlip = "true";
    paletteFrame = requestAnimationFrame(() => {
      paletteFrame = requestAnimationFrame(() => {
        delete root.dataset.paletteFlip;
      });
    });
  }
  root.dataset.palette = theme;
  safeStorage.set("theme", theme);
  window.dispatchEvent(new Event("x1-palette"));
}
export function useTheme() {
  return [useSyncExternalStore(subscribe, current), setTheme] as const;
}
