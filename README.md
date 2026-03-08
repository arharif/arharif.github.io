# X1.github.io — Premium Personal Website

A production-style, animated personal site with two universes:
- **Professional** (cybersecurity-focused)
- **Personal** (books, anime, series)

Built with **React + TypeScript + Vite + Tailwind + Framer Motion** for reliable static deployment on GitHub Pages.

## Highlights
- Cinematic dual-entry landing (Professional / Personal)
- 3 themes: dark, light, purple (persisted in localStorage)
- Animated cards, glassmorphism surfaces, smooth hover motion
- Search + tag filtering across each universe
- Article detail experience with TOC, callouts, code styling, related posts
- Responsive navbar/mobile menu + sticky header + footer
- SEO baseline metadata, `robots.txt`, `sitemap.xml`, and `rss.xml`
- GitHub Actions workflow for Pages deployment

## Project Structure
- `src/components/` reusable UI components
- `src/content/` typed content model + seed data
- `src/lib/` helpers (theme/content query)
- `src/styles/` Tailwind + design tokens
- `public/` static SEO assets and favicon
- `.github/workflows/deploy.yml` CI/CD for GitHub Pages

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deployment
Deployment is automatic on push to `main` using GitHub Actions and official Pages actions.

## Notes
If your repository URL differs from `https://x1.github.io`, update canonical URLs in static files under `public/`.
