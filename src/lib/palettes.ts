export const palettes = {
  "editorial-ivory": [
    "Editorial Ivory",
    "#F7F6F2",
    "#FFFDFC",
    "#1D2421",
    "#2E6B5E",
    "light",
  ],
  "obsidian-sage": [
    "Obsidian Sage",
    "#121816",
    "#1B2420",
    "#ECF1EE",
    "#6FAF98",
    "dark",
  ],
  "midnight-slate": [
    "Midnight Slate",
    "#101522",
    "#171E2D",
    "#EEF3F8",
    "#5E8DF6",
    "dark",
  ],
  sandstone: ["Sandstone", "#F4EFE8", "#FFF8F0", "#332B26", "#B5845C", "light"],
  "pearl-teal": [
    "Pearl Teal",
    "#F3FAF9",
    "#FFFFFF",
    "#183330",
    "#2D8D88",
    "light",
  ],
  aubergine: ["Aubergine", "#1C1422", "#271D2F", "#F3EDF7", "#A56DE2", "dark"],
  "crimson-red": [
    "Crimson Red",
    "#1A1012",
    "#261619",
    "#FAF1F2",
    "#C93B4B",
    "dark",
  ],
  "imperial-gold": [
    "Imperial Gold",
    "#15120D",
    "#201A13",
    "#F7F1E8",
    "#D4A64C",
    "dark",
  ],
} as const;

export type ThemeMode = keyof typeof palettes;
export const defaultTheme: ThemeMode = "editorial-ivory";
export const legacyThemes: Record<string, ThemeMode> = {
  dark: "midnight-slate",
  light: defaultTheme,
  purple: "aubergine",
  rainbow: "pearl-teal",
  egyptian: "imperial-gold",
  horror: "crimson-red",
  "elite-green": "obsidian-sage",
};
