// Menu label, background, surface, text, accent, control scheme and muted text.
export const palettes = {
  "editorial-ivory": ["Editorial Ivory", "#F7F6F2", "#FFFFFF", "#1D2926", "#24685C", "light", "#53645C"],
  "obsidian-sage": ["Obsidian Sage", "#111915", "#1B2821", "#EAF1EA", "#ACD4BC", "dark", "#B8C7BC"],
  "midnight-slate": ["Midnight Slate", "#121B29", "#1F2C3C", "#F4F7FA", "#9CC6DA", "dark", "#B6C7D2"],
  sandstone: ["Sandstone", "#F7F2EB", "#FFFDF9", "#332D27", "#8A6147", "light", "#706155"],
  "pearl-teal": ["Pearl Teal", "#F2F8F6", "#FFFFFF", "#173633", "#0B706A", "light", "#526B67"],
  aubergine: ["Aubergine", "#1E1827", "#302637", "#F6F0F6", "#DEB7D8", "dark", "#CFBFCD"],
  "crimson-red": ["Crimson Red", "#221519", "#342126", "#FAF1F3", "#F0A4AD", "dark", "#D8BBC0"],
  "imperial-gold": ["Imperial Gold", "#1B1915", "#2C271F", "#F8F2E8", "#DFC47C", "dark", "#D7C9AC"],
} as const;

export type ThemeMode = keyof typeof palettes;
export const defaultTheme: ThemeMode = "editorial-ivory";
export const legacyThemes: Record<string, ThemeMode> = {
  dark: "midnight-slate", light: defaultTheme, purple: "aubergine",
  rainbow: "pearl-teal", egyptian: "imperial-gold", horror: "crimson-red",
  "elite-green": "obsidian-sage", "graphite-slate": "midnight-slate",
  "cosmic-indigo": "aubergine", "arctic-blue": "pearl-teal", "forest-horizon": "obsidian-sage",
  "metropolitan-plum": "aubergine", "desert-amber": "sandstone",
};
