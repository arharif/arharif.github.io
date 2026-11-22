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
function setTheme(theme: ThemeMode) {
  document.documentElement.dataset.palette = theme;
  safeStorage.set("theme", theme);
  window.dispatchEvent(new Event("x1-palette"));
}
export function useTheme() {
  return [useSyncExternalStore(subscribe, current), setTheme] as const;
}
