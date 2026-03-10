# Project Onboarding Guide

## 1) Project purpose

### What this project does
This repository is a **React + TypeScript + Vite** static web app that powers a personal/professional knowledge site named **X1**. It has:
- Public content browsing for **Professional** and **Personal** universes.
- A visual **Security Map** explorer.
- A **Games** area with mini-games and quiz modules.
- A lightweight **site assistant** that answers navigation/content discovery questions.
- A protected **Admin** area to create/edit topics and content (using Supabase when configured, or localStorage fallback when not). 

### What problem it solves
It combines multiple needs in one frontend-only deployable app:
1. Publishing structured long-form content (topics + posts/chapters).
2. Providing a cybersecurity career/role exploration surface (security map).
3. Offering a lightweight CMS and authentication path without running a separate backend service.
4. Keeping the app usable even without infrastructure by falling back to local seeded data.

### Main features
- Routing-driven pages: landing, search, professional topics, personal posts, games, security map, submit instructions, login/admin.
- Supabase-backed content CRUD + media upload for admin users.
- Two-step sign-in flow (password then OTP verification).
- Markdown rendering with safety guardrails for links/images.
- Theme switching (dark/light/purple/rainbow) persisted in localStorage.
- GitHub Pages deployment pipeline.

---

## 2) High-level architecture

### Main modules
- **UI shell + routes**: `src/main.tsx`, `src/App.tsx`
- **Auth layer**: `src/hooks/useAuth.tsx`, `src/lib/supabase.ts`, `src/routes/ProtectedRoute.tsx`
- **CMS data layer**: `src/lib/cms.ts`, `src/content/types.ts`, `src/content/data.ts`
- **Domain UIs**:
  - Core pages/components (`src/components/*`, `src/pages/*`)
  - Security map (`src/components/security-map/*`, `src/data/securityMap.ts`)
  - Site assistant (`src/components/site-assistant/*`, `src/lib/siteAssistant.ts`)
- **Styling/config**: Tailwind + global CSS + Vite config
- **Deployment**: `.github/workflows/deploy.yml`

### How modules interact
```text
Browser
  -> main.tsx mounts App in BrowserRouter
  -> App wraps Shell with ErrorBoundary + AuthProvider
  -> Routes choose page components
  -> Pages call lib/cms.ts for content/topics
       -> if Supabase configured: REST/auth/storage via lib/supabase.ts
       -> else: localStorage + seed content
```

### End-to-end flow (example: viewing Professional page)
1. User opens `/professional`.
2. `ProfessionalHome` loads published topics/content via `loadPublishedGraph()`.
3. `loadPublishedGraph()` calls `listPublishedTopics()` + `listPublishedContent()`.
4. `cms.ts` chooses Supabase fetch or local fallback.
5. UI filters by `topic.universe === professional`.
6. Filter/search/tag logic narrows cards shown.

---

## 3) Folder and file breakdown

## Root
- `package.json`: scripts and dependencies (`dev`, `build`, `preview`, `lint`).
- `vite.config.ts`: React plugin and `@ -> /src` alias.
- `tailwind.config.js`, `postcss.config.js`: utility CSS pipeline.
- `tsconfig*.json`: TS compile settings.
- `.github/workflows/deploy.yml`: CI build and GitHub Pages deploy.
- `docs/supabase.sql`: schema + RLS + storage bucket policy setup.

## `src/`
- `main.tsx`: runtime entrypoint and mount guard for `#root`.
- `App.tsx`: primary app composition, route table, page logic, admin dashboard.

### `src/lib`
- `cms.ts`: data access facade for topics/content/collections + uploads.
- `supabase.ts`: low-level HTTP functions for auth/rest/storage.
- `config.ts`, `env.ts`: environment variable ingestion and feature flags.
- `content.ts`: search filtering helper.
- `siteAssistant.ts`: ranking/summarization logic for assistant answers.
- `markdown.tsx`: markdown parser/renderer and URL safety checks.
- `theme.ts`: theme mapping/init.

### `src/hooks`
- `useAuth.tsx`: auth provider/state machine for login, OTP verification, session storage, admin checks.

### `src/routes`
- `ProtectedRoute.tsx`: gate admin route by session/admin status.

### `src/content`
- `types.ts`: Topic/Content/Collection interfaces.
- `data.ts`: fallback seed data for offline/local mode.

### `src/components`
- Core UI (`Navbar`, `Cards`, `ArticleView`, `ThemeSwitcher`, etc.)
- `admin/`: topic/content editor forms for CMS operations.
- `games/`: quiz mini-games.
- `security-map/`: interactive cybersecurity role map visualization + filters/panel/toolbar.
- `site-assistant/`: assistant launcher and panel.

### `src/pages`
- `SecurityMindmapPage.tsx`: page wrapper for Security Roles Map.

### `src/data`
- `securityMap.ts`: large structured graph data and layout feed for map rendering.

### `public`
Static public assets: sitemap, robots, rss, favicon, health check JSON.

---

## 4) Execution flow

### Startup sequence
```text
index.html
  -> loads src/main.tsx
      -> finds #root
      -> ReactDOM.createRoot + <BrowserRouter><App/></BrowserRouter>
          -> App() returns ErrorBoundary(AuthProvider(Shell))
              -> Shell sets theme class + document title + route rendering
```

### File load order (logical)
1. `src/main.tsx`
2. `src/App.tsx`
3. `src/hooks/useAuth.tsx`
4. Route-selected component tree
5. On-demand calls into `src/lib/cms.ts` and other helpers

### Data movement
- **Read path**: UI component -> `cms.ts` -> Supabase REST or local seed/localStorage -> normalized objects -> component state -> render.
- **Write path (admin)**: form component (`AdminEditor`/`TopicEditor`) -> App save handlers -> `cms.ts` create/update/delete -> reload list -> re-render dashboard.

---

## 5) Dependencies and tooling

### Key runtime libraries
- `react`, `react-dom`: UI and rendering.
- `react-router-dom`: route-based SPA navigation.
- `framer-motion`: page/login transition animations.
- `lucide-react`: icon pack.

### Build/dev tooling
- `vite`: dev server and production bundling.
- `typescript`: typing and compile checks.
- `tailwindcss` + `postcss` + `autoprefixer`: styling system.
- `eslint` + React plugins: lint checks.

### CI/CD
- GitHub Action deploy workflow installs deps, runs build, verifies built assets, and deploys `dist/` to GitHub Pages.

### Docker
- No Dockerfile present.

---

## 6) Important logic

### 1. Dual data backend strategy (critical)
`cms.ts` can operate in two modes:
- **Supabase mode**: reads/writes through REST and storage APIs.
- **Fallback mode**: reads/writes localStorage initialized with `seedContent/seedTopics`.

This keeps the site functional even when env config is missing.

### 2. Admin authentication strategy (critical)
`useAuth.tsx` enforces a two-step flow:
1. Password sign-in.
2. Immediately logout + OTP challenge email.
3. Verify OTP.
4. Grant admin only if user email equals `VITE_ADMIN_EMAIL`.

### 3. Publish-only workflow (business assumption)
Admin topic/content forms effectively publish immediately (`status: 'published'`) with no true moderation queue.

### 4. Assistant safety model
`siteAssistant.ts` blocks terms related to secrets/admin internals and only summarizes public-like content sources.

### 5. Security map rendering complexity
`SecurityRolesMap` handles filtering, graph layout, edge/node rendering, interaction states, drag, zoom, fit-to-view, and detail panel context.

### Risky/hidden assumptions
- Auth/session tokens are kept in localStorage (XSS risk if client compromised).
- Admin identity is tied to exact email match, not role claims.
- No backend of this repo; security depends heavily on Supabase RLS and policies.
- Large monolithic `App.tsx` and `GamesHub.tsx` increase maintenance friction.

---

## 7) Environment and configuration

Environment variables consumed (via `src/lib/config.ts`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`
- `VITE_SUPABASE_MEDIA_BUCKET` (default: `content-media`)
- `VITE_LINKEDIN_URL` (default value provided)

Flags:
- `hasSupabaseCoreConfig` = URL + anon key present.
- `hasSupabaseAuthConfig` = URL + anon key + admin email present.
- `isSupabaseConfigured` mirrors core config.

Secrets usage in CI:
- URL and anon key from GitHub **secrets**.
- Admin email and media bucket from GitHub **vars**.

Runtime assumptions:
- Supabase project has schema, RLS, and storage policies from `docs/supabase.sql`.
- `#root` exists in `index.html`.
- Browser supports modern JS APIs (crypto.randomUUID, fetch, localStorage).

---

## 8) API / UI / database

### API behavior in this app
No custom server API in repo. The app directly calls Supabase endpoints:
- `/auth/v1/token`, `/auth/v1/otp`, `/auth/v1/verify`, `/auth/v1/user`, `/auth/v1/logout`
- `/rest/v1/*` for topics/content/collections
- `/storage/v1/object/*` for media uploads

### UI structure
Main pages:
- Landing
- Professional hub + topic detail
- Personal hub + post detail
- Search
- Security map
- Games
- Submitting instructions
- Login
- Admin dashboard

State style:
- Local component state (`useState`, `useEffect`, `useMemo`) and context for auth only.
- No Redux/Zustand; data is fetched per-page.

### Database (Supabase)
`docs/supabase.sql` defines:
- `topics`
- `content_entries`
- `tags`
- `collections`
- junction tables for tags/collections
- triggers for `updated_at`
- RLS policies:
  - public read for topics/collections + published content
  - admin email-based manage policies
- storage bucket `content-media` + policies

Note: frontend queries `content` table path in REST calls; SQL defines `content_entries`. This implies either a renamed table/view in live DB or drift risk that must be reconciled.

---

## 9) How to run locally

1. Install dependencies
   - `npm ci`
2. Run in dev mode
   - `npm run dev`
3. Open shown local URL (typically http://localhost:5173)
4. Optional env setup (create `.env.local`)
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_ADMIN_EMAIL=...`
   - `VITE_SUPABASE_MEDIA_BUCKET=content-media`
5. Build production bundle
   - `npm run build`
6. Preview build
   - `npm run preview`
7. Lint
   - `npm run lint`

Debug tips:
- If auth/admin unavailable, verify env vars and DB RLS/policies.
- If content still appears, remember local fallback mode may be active.
- Check browser console for fetch/RLS errors in admin actions.

---

## 10) Improvement opportunities

1. **Split `App.tsx` and `GamesHub.tsx`** into smaller route/page modules.
2. Add **automated tests** (unit + component + smoke e2e).
3. Introduce a typed API layer with runtime validation (e.g., zod).
4. Replace ad-hoc markdown parser with hardened library if feature scope grows.
5. Move auth tokens to safer handling strategy where possible.
6. Add robust error boundaries per route and better user-facing diagnostics.
7. Align schema naming (`content` vs `content_entries`) to remove ambiguity.
8. Add explicit docs for required Supabase views/functions if used in production.
9. Add observability hooks (analytics/error tracking).
10. Add PR checks for lint/build and optionally type-only CI gates.

---

## 11) Recommended learning path

Read in this order:
1. `package.json` (scripts/deps)
2. `src/main.tsx` (entrypoint)
3. `src/App.tsx` (routing + page wiring)
4. `src/content/types.ts` (domain model)
5. `src/lib/cms.ts` (data flow)
6. `src/hooks/useAuth.tsx` + `src/lib/supabase.ts` (auth flow)
7. `src/components/admin/*` (write paths)
8. `src/lib/siteAssistant.ts` + assistant components
9. `src/data/securityMap.ts` + `src/components/security-map/*`
10. `docs/supabase.sql` + `.github/workflows/deploy.yml`

---

## Executive summary (10 lines)
1. This is a Vite/React TypeScript SPA for personal + professional knowledge publishing.
2. It includes a security role map, games section, and local assistant.
3. Content can come from Supabase or local fallback seed/localStorage.
4. Routing and most orchestration live in a large `App.tsx`.
5. Admin access uses password + OTP then strict email match.
6. Admin editing is publish-first (no staged draft workflow in UI path).
7. Markdown is rendered client-side with custom safe-link/image checks.
8. Deployment targets GitHub Pages via a build-and-deploy GitHub Action.
9. Supabase SQL defines schema, RLS policies, and media bucket rules.
10. Key technical debt: large component files, limited tests, and possible schema naming drift.

## Beginner-friendly explanation
Think of this project as a **single website app** that has two “worlds” (Professional and Personal), plus a cyber map and mini-games. It can work with a real cloud database (Supabase), but if that is not configured, it still works using built-in example data in your browser. There is also an admin mode for the site owner to publish content.

## Developer-level explanation
Architecturally this is a client-only SPA with route-level feature modules and a thin data-access abstraction (`cms.ts`) that multiplexes between Supabase REST/storage and browser-local persistence. Auth is managed in a context provider with OTP challenge and explicit email allowlisting, while authorization at data-level is delegated to Supabase RLS. The project is deployment-oriented for static hosting (GitHub Pages), so all backend behavior is externalized to Supabase APIs.
