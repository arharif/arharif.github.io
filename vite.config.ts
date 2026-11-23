import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { palettes, defaultTheme, legacyThemes } from "./src/lib/palettes";

// Resolve the same catalogue before first paint, including on prerendered Pages URLs.
const rules = Object.entries(palettes)
  .map(
    ([id, [, bg, surface, ink, accent, scheme, muted]]) =>
      `:root[data-palette="${id}"]{--x1-bg:${bg};--x1-surface:${surface};--x1-text:${ink};--x1-accent:${accent};--x1-text-muted:${muted};color-scheme:${scheme}}`,
  )
  .join("");
const bootstrap = `(()=>{let p='${defaultTheme}';try{const s=localStorage.getItem('theme'),legacy=${JSON.stringify(legacyThemes)};p=${JSON.stringify(Object.keys(palettes))}.includes(s)?s:Object.hasOwn(legacy,s)?legacy[s]:p;if(s&&s!==p)localStorage.setItem('theme',p)}catch{}const d=document.documentElement;d.dataset.palette=p;if(location.pathname.replace(/\\/$/,'')==='/games')d.dataset.arcade='true'})()`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: "x1-initial-palette",
      transformIndexHtml: () => [
        { tag: "script", children: bootstrap, injectTo: "head" },
        {
          tag: "style",
          children:
            rules + "html{background:var(--x1-bg);color:var(--x1-text)}",
          injectTo: "head",
        },
      ],
    },
  ],
  base: "/",
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
});
