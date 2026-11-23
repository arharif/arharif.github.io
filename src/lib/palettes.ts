// Each row contains the menu label, canvas, surface, readable ink, accent and native control scheme.
export const palettes = {
  "editorial-ivory": ["Editorial Ivory", "#F7F6F2", "#FFFDFC", "#1D2421", "#2E6B5E", "light"],
  "obsidian-sage": ["Obsidian Sage", "#0B0F0E", "#13201B", "#D7E4D8", "#2E6B5E", "dark"],
  "cosmic-indigo": ["Cosmic Indigo", "#0D0B1F", "#312E81", "#E9E5FF", "#7C3AED", "dark"],
  "arctic-blue": ["Arctic Blue", "#F0F7FF", "#D9ECFF", "#0B3B6E", "#00B3FF", "light"],
  "desert-amber": ["Desert Amber", "#FFF7E9", "#FFD9A8", "#7A4E2E", "#F59E0B", "light"],
  "forest-horizon": ["Forest Horizon", "#0F1F17", "#1F5D3F", "#E7F7EA", "#4CAF50", "dark"],
  "metropolitan-plum": ["Metropolitan Plum", "#2B0D3A", "#6B21A8", "#F3E8FF", "#C084FC", "dark"],
  "graphite-slate": ["Graphite Slate", "#1F2937", "#475569", "#F8FAFC", "#CBD5E1", "dark"],
} as const;

export type ThemeMode = keyof typeof palettes;
export const defaultTheme: ThemeMode = "editorial-ivory";
export const legacyThemes: Record<string, ThemeMode> = {
  dark: "graphite-slate",
  light: defaultTheme,
  purple: "cosmic-indigo",
  rainbow: "arctic-blue",
  egyptian: "desert-amber",
  horror: "metropolitan-plum",
  "elite-green": "forest-horizon",
  "midnight-slate": "graphite-slate",
  sandstone: "desert-amber",
  "pearl-teal": "arctic-blue",
  aubergine: "metropolitan-plum",
  "crimson-red": "metropolitan-plum",
  "imperial-gold": "desert-amber",
};
