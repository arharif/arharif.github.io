// Menu label, background, surface, text, accent, control scheme and muted text.
export const palettes = {
  "editorial-ivory": ["Editorial Ivory", "#FFFFFF", "#F8F7F3", "#202A25", "#246653", "light", "#545E57"],
  "obsidian-sage": ["Obsidian Sage", "#FFFFFF", "#F1F6F2", "#203329", "#31594A", "light", "#4E6357"],
  "midnight-slate": ["Midnight Slate", "#FFFFFF", "#F2F5FA", "#202C40", "#304D79", "light", "#536175"],
  "sandstone": ["Sandstone", "#FFFFFF", "#FAF5EF", "#332C25", "#855B3E", "light", "#6B5B4D"],
  "pearl-teal": ["Pearl Teal", "#FFFFFF", "#EFF8F7", "#173633", "#126D69", "light", "#4B6561"],
  "aubergine": ["Aubergine", "#FFFFFF", "#F8F1F8", "#332635", "#70486F", "light", "#67576A"],
  "crimson-red": ["Crimson Red", "#FFFFFF", "#FCF2F4", "#372329", "#98293B", "light", "#6F565D"],
  "imperial-gold": ["Imperial Gold", "#FFFFFF", "#FAF6EA", "#342F22", "#806015", "light", "#675E45"],
  "onyx-black": ["Onyx Black", "#080A0D", "#15181C", "#F5F6F8", "#D5D9DF", "dark", "#B1B8C2"],
} as const;

export type ThemeMode = keyof typeof palettes;
export const defaultTheme: ThemeMode = "editorial-ivory";
export const legacyThemes: Record<string, ThemeMode> = {
  dark: "onyx-black",
  light: defaultTheme,
  purple: "aubergine",
  rainbow: "pearl-teal",
  egyptian: "imperial-gold",
  horror: "crimson-red",
  "elite-green": "obsidian-sage",
  "graphite-slate": "midnight-slate",
  "cosmic-indigo": "aubergine",
  "arctic-blue": "pearl-teal",
  "forest-horizon": "obsidian-sage",
  "metropolitan-plum": "aubergine",
  "desert-amber": "sandstone",
};
