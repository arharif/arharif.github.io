# arharif.github.io

Premium GitHub Pages **USER SITE** deployed at **https://arharif.github.io/**.

## Product Overview
This project includes:
1. **Public Website** with two universes:
   - Professional (interactive topic books/slide guides)
   - Personal Culture Hub (Philosophy and Anime, Books, Hobbies)
2. **Private Admin CMS**:
   - Email + OTP login only (Supabase Auth)
   - Topic CRUD (add/edit/delete/reorder-ready)
   - Content CRUD (draft/published)
   - Image upload + inline image insertion
   - Video embed URL support

## Stack
- React + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Supabase (Auth OTP + Postgres + Storage)
- GitHub Pages via GitHub Actions

## Theme Modes
- Dark
- Light
- Purple
- Rainbow (premium gradient system)

Theme persists in localStorage and is available in desktop/mobile nav.

## Authentication Model (Email + OTP Only)
- Admin login route: `/login`
- OTP is sent via Supabase Auth email flow
- Admin session persists in localStorage
- Admin route `/admin` is protected
- Access is granted only when authenticated email matches:
  - `x731072000@gmail.com`

No password is hardcoded or required in the frontend flow.

## Environment Setup
Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required vars:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL` (set to `x731072000@gmail.com`)
- `VITE_SUPABASE_MEDIA_BUCKET` (default `content-media`)

## Supabase Setup
Run `docs/supabase.sql` in Supabase SQL editor.

It creates:
- `topics` table
- `content_entries` table
- RLS policies:
  - public topic read
  - public published-content read
  - admin-only mutations for configured email
- storage bucket/policies for image uploads

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
- Trigger: push to `main`
- Install: `npm ci`
- Build: `npm run build`
- Upload: `dist/`
- Deploy: official Pages actions

## GitHub Pages User-Site Constraints (Applied)
- Vite `base: '/'`
- No project basename subpath
- SPA fallback via `404.html`
- Root URLs for canonical, sitemap, robots

## Admin CMS Usage
1. Go to `/login`
2. Enter admin email and click **Send OTP**
3. Verify with OTP (or magic link callback)
4. Open `/admin`
5. Manage topics and content
6. Upload images and insert inline
7. Publish content for public visibility

## Troubleshooting
- **Blank page after deploy**
  - ensure `vite.config.ts` has `base: '/'`
  - ensure no stale subpath routing assumptions
  - ensure `404.html` is present
- **OTP not sent**
  - verify Supabase URL/anon key
  - enable Email OTP provider in Supabase Auth
- **Unauthorized admin**
  - verify authenticated email equals `VITE_ADMIN_EMAIL`
- **Upload failed**
  - verify bucket exists and storage RLS policies are active
- **CI failure with npm ci**
  - ensure `package-lock.json` is committed

## Security Notes
- Frontend uses anon key only.
- Never commit Supabase service-role key.
- Mutations are protected by Supabase RLS + admin email policy.
