# arharif.github.io

Premium GitHub Pages **USER SITE** deployed at **https://arharif.github.io/**.

## Architecture Overview
- Static frontend: React + TypeScript + Vite + Tailwind + Framer Motion
- Auth/CMS backend: Supabase (Auth, Postgres, Storage)
- Hosting: GitHub Pages user-site (root domain)

## Authentication Model (Login Only)
- `/login` supports:
  - Email + Password
  - Email + OTP
- OTP request uses Supabase `signInWithOtp` semantics with `shouldCreateUser: false`.
- OTP verification uses Supabase `verifyOtp` with `type: 'email'`.
- Admin authorization requires:
  1) authenticated session
  2) authenticated email equals `VITE_ADMIN_EMAIL`
- Unauthorized access responses are generic to reduce user enumeration.

## Environment Variables
Create `.env` from `.env.example`.

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`
- `VITE_SUPABASE_MEDIA_BUCKET`

`.env.example` contains placeholders only and no secrets.

## GitHub Actions Configuration
Workflow: `.github/workflows/deploy.yml`

Build-time env injection:
- **Secrets**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Repository Variables**
  - `VITE_ADMIN_EMAIL`
  - `VITE_SUPABASE_MEDIA_BUCKET`

## Supabase Setup
Run `docs/supabase.sql` in Supabase SQL editor after replacing `<ADMIN_EMAIL>` with your authorized admin email value.

Included setup:
- tables: `topics`, `content_entries`, `tags`, `collections`, `content_tags`, `content_collections`
- RLS policies for public reads + admin-only mutations
- storage bucket and storage policies for `content-media`

## Local Development
```bash
npm ci
npm run dev
npm run build
```

## Security Notes
- Frontend uses only Supabase anon key.
- Never use service-role key in browser code.
- Never commit secrets.
- Error/auth messaging is intentionally generic to avoid identity leakage.

## Troubleshooting
- **Blank page**
  - verify `vite.config.ts` has `base: '/'`
  - verify `index.html` has `<div id="root"></div>`
  - verify `src/main.tsx` mount path is correct
  - check browser console/runtime errors (UI has runtime error boundary)
- **Missing env vars**
  - app shows visible configuration warning state instead of blank screen
- **OTP not arriving**
  - ensure Email OTP is enabled in Supabase Auth
  - verify SMTP/email provider status in Supabase project
- **Auth redirect/session issues**
  - ensure hash tokens are preserved on callback route
- **Build failures**
  - ensure `package-lock.json` exists for `npm ci`
- **Old path assumptions**
  - ensure there are no stale project-subpath references from previous repo naming


## GitHub Pages Blank-Page / MIME Error Fix
If production shows:
- `Failed to load module script ... MIME type of application/octet-stream`
- and the browser requests `/src/main.tsx`

then GitHub Pages is serving repository source files instead of Vite build output.

Use this repository workflow as the deployment source:
1. In **Settings → Pages**, set **Build and deployment** source to **GitHub Actions**.
2. Ensure `.github/workflows/deploy.yml` runs successfully and uploads `./dist`.
3. Confirm deployed HTML references `/assets/...` files (not `/src/main.tsx`).

The workflow now includes a guard step that fails deployment if `dist/index.html` still references `/src/main.tsx`.


## Best-effort keepalive

A scheduled GitHub Actions workflow (`.github/workflows/keepalive.yml`) pings `https://arharif.github.io/healthz.json` every 5 days and optionally performs a lightweight Supabase REST read when secrets are configured. This is only a best-effort workaround and is not guaranteed to prevent inactivity behavior on free tiers. Upgrading your database/service plan is the only reliable solution.


## Submitting page
- Public route: `/submitting`
- Instructions-only; no backend form handling
- Manual email destination: `rharifanass@gmail.com` with prefilled subject `X1 Submitting: [Topic Title]`
- Required text-only submission template is shown directly on the page

## Editor and rendering safety
- Admin content editor supports Markdown and GitHub README-friendly writing mode.
- Built-in tools: inline link insertion, inline image upload to `content-media`, and preview mode.
- Public body rendering uses a safe markdown subset renderer (no raw HTML execution / no `dangerouslySetInnerHTML`).
- Link and media URLs are restricted to safe schemes (https + mailto for links; https for media).
