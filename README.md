# arharif.github.io

Premium GitHub Pages **USER SITE** deployed at **https://arharif.github.io/**.

## Stack
- React + TypeScript + Vite
- Tailwind CSS + Framer Motion
- React Router (SPA)
- Supabase (Auth + Postgres + Storage) for admin CMS
- GitHub Actions for Pages deployment

## Public Experience
- Cinematic split landing: **Professional** and **Personal**
- Premium card/grid browsing with search + tag filters
- Rich article pages with cover images, markdown-like body rendering, and video embeds
- Three themes: **dark**, **light**, **purple**

## Private Admin CMS
- `/login` for admin authentication (Supabase email/password)
- `/admin` protected route (admin allowlist via env)
- Create / edit / delete content
- Draft vs published status
- Image upload (Supabase Storage bucket)
- Video embed URL field (YouTube/Vimeo embed URL)
- Public site renders only published content

## Environment Configuration
Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAILS` (comma-separated admin emails)
- `VITE_SUPABASE_MEDIA_BUCKET` (default `content-media`)

## Supabase Setup
Run SQL in `docs/supabase.sql` (edit admin email allowlist in policies first).

This creates:
- `content_entries` table
- RLS policies for:
  - public read of `published`
  - admin write access by email allowlist
- `content-media` storage bucket + read/write policies

## Local Development
```bash
npm ci
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages Deployment
Workflow: `.github/workflows/deploy.yml`
- trigger: push to `main`
- install: `npm ci`
- build: `npm run build`
- deploy artifact: `dist/`
- actions: official `configure-pages`, `upload-pages-artifact`, `deploy-pages`

## GitHub Pages User-Site Requirements (already applied)
- Vite `base: '/'`
- No project subpath basename
- SPA fallback via `404.html` redirect strategy
- Canonical/sitemap/robots point to `https://arharif.github.io/`

## Troubleshooting
- **Blank page after deploy**
  - verify `vite.config.ts` still has `base: '/'`
  - verify no broken route basename/subpath assumptions
  - verify `404.html` SPA fallback exists
- **CI install fails (`npm ci`)**
  - ensure `package-lock.json` is committed
- **Admin login fails**
  - verify Supabase URL + anon key
  - verify user exists in Supabase Auth
  - verify email appears in `VITE_ADMIN_EMAILS`
- **Uploads fail**
  - verify storage bucket name and RLS policies

## Security Notes
- Frontend uses **anon key only** (safe for client apps)
- Never expose Supabase service-role key in this repository
- Enforce mutations via Supabase RLS policies

