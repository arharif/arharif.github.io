# arharif.github.io — Premium Dual-Universe Personal Website

Production-ready GitHub Pages **USER SITE** for **https://arharif.github.io/**.

## Overview
This repository delivers a design-forward personal website with two cinematic entry paths:
- **Professional**: cybersecurity articles and technical insights.
- **Personal**: books, anime, and series summaries/blogs.

The experience is Web3-inspired (glassmorphism, gradients, subtle motion), responsive, and theme-aware.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- React Router
- GitHub Actions Pages deployment

## User-Site Pages Configuration (Critical)
Because this is a **GitHub Pages user site** (`arharif.github.io`), runtime/build config is root-based:
- Vite `base` is `/`.
- Router has **no project basename**.
- SEO links target `https://arharif.github.io/`.
- 404 fallback includes SPA route recovery logic for direct/deep links.

## Local Development
```bash
npm ci
npm run dev
```

## Production Build
```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)
Deployment runs from `.github/workflows/deploy.yml` on push to `main` and uses official actions:
1. install dependencies via `npm ci` (requires committed `package-lock.json`)
2. build `dist/`
3. configure pages
4. upload artifact
5. deploy

## Architecture Summary
- `src/components/` reusable UI primitives
- `src/content/` typed content model and seeded entries
- `src/lib/` theme and content query helpers
- `src/styles/` design tokens + utilities
- `public/` SEO/static assets
- `404.html` SPA fallback + polished not-found presentation

## Troubleshooting Blank Page / Build Issues
If GitHub Pages shows a blank screen or CI fails:
- verify `vite.config.ts` still uses `base: '/'`
- verify there are no old project-subpath path assumptions from earlier repo naming
- ensure router basename is not set for a subpath; user site resolves from `/`
- ensure `robots.txt`, sitemap, canonical/OG URLs reference `https://arharif.github.io/`
- ensure Pages artifact uploads from `dist`
- if `npm ci` fails, confirm `package-lock.json` exists and is committed
- ensure Vite alias config remains ESM-safe (avoid `__dirname` issues in TS config)
- confirm no stale CNAME/custom-domain override is present

## Git Workflow Note
This repo is maintained directly on `main`; operational sync command:
```bash
git push --force-with-lease origin main
```
Then merge/deploy via GitHub Pages workflow execution on `main`.
