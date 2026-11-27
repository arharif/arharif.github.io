// Menu label, canvas, surface, readable ink, accent, control scheme and muted text.
export const palettes = {
  "onyx-black": ["Onyx Black", "#080A0D", "#15181C", "#F5F6F8", "#D5D9DF", "dark", "#B1B8C2"],
  "mature-white": ["Mature White", "#FFFFFF", "#F5F5F2", "#202529", "#345951", "light", "#525F5B"],
  rainbow: ["Rainbow", "#FFFFFF", "#F7F6FC", "#242039", "#673AB7", "light", "#5B4E6F"],
} as const;

export type ThemeMode = keyof typeof palettes;
export const defaultTheme: ThemeMode = "onyx-black";
export const legacyThemes: Record<string, ThemeMode> = {
  dark: "onyx-black",
  light: "mature-white",
  purple: "rainbow",
  egyptian: "mature-white",
  horror: "onyx-black",
  "elite-green": "onyx-black",
  "midnight-slate": "onyx-black",
  sandstone: "mature-white",
  "pearl-teal": "rainbow",
  aubergine: "onyx-black",
  "crimson-red": "onyx-black",
  "imperial-gold": "mature-white",
  "editorial-ivory": "mature-white",
  "obsidian-sage": "onyx-black",
  "cosmic-indigo": "onyx-black",
  "arctic-blue": "rainbow",
  "desert-amber": "mature-white",
  "forest-horizon": "onyx-black",
  "metropolitan-plum": "onyx-black",
  "graphite-slate": "onyx-black",
};
