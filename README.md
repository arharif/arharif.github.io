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
