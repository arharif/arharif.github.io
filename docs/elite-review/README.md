# X1 Elite release review

The comparison starts at `bdd361d`, the revision that merged the approved X1 Digital Universe layout. The homepage, About biography, Academic workspaces and existing game catalogue remain in the original application. The visual references available for this release were the repository's approved screenshots and its working application.

## Visual and interaction evidence

| View | Evidence |
| --- | --- |
| Theme comparison | [Eight homepage captures](themes.jpg) |
| Exact theme tokens | [Computed values across Home, Insights, Academic and About](themes.json) |
| Original homepage | [Desktop](before-1440.jpg) · [Mobile](before-390.jpg) |
| Updated homepage | [Desktop](after-1440.jpg) · [Mobile](after-390.jpg) |
| Route-aware guidance | [Home orb](guide-home.jpg) · [Insights astronaut](guide-insights.jpg) · [Arcade Phantom](guide-arcade.jpg) |
| Authenticated publishing | [Studio using test records](studio.jpg) · [Supabase integration results](owner-local.json) |

The theme check visits every section after a fresh navigation and decodes all three destination images. The browser suite also checks theme persistence, legacy theme migration, keyboard selection, contrast, responsive layouts and reduced motion. The new illustrations use resized versions of the existing approved art with local lighting, edge shading and palette-dependent highlights.

The launcher uses the X1 mark on Home, a helmeted astronaut on Insights and the Phantom in Arcade. Game selection and outcome events change the Phantom's expression. The guide opens inside the active game dialog when needed. Queries search public articles and navigation metadata on demand. The Arcade additions and their rights are documented in the [game review](GAMES.md).

## Browser measurements

The same Chromium 156.0.8078.79 opened each of six routes three times in fresh contexts at 1440 × 900 and 390 × 844. Both runs used a local static server, native browser scheduling, the public fallback catalogue and an unthrottled connection. Each visit opened the contextual guide after first paint. The table reports median LCP, maximum CLS and median resource transfer size through that interaction. [Baseline samples](before.json) · [Release samples](after.json) · [Runner](../../scripts/review-elite.mjs)

| Route | Desktop LCP before → after | Mobile LCP before → after | Mobile CLS before → after | Mobile transfer before → after |
| --- | ---: | ---: | ---: | ---: |
| Home | 0.55 s → 1.13 s | 0.59 s → 0.58 s | 0.003 → 0.003 | 674 KiB → 409 KiB |
| Insights | 0.68 s → 0.95 s | 0.50 s → 0.55 s | 0.120 → 0.001 | 734 KiB → 612 KiB |
| Academic | 0.55 s → 0.58 s | 0.51 s → 0.52 s | 0.000 → 0.000 | 837 KiB → 701 KiB |
| Arcade | 0.80 s → 0.81 s | 0.60 s → 0.65 s | 0.000 → 0.000 | 776 KiB → 650 KiB |
| About | 0.57 s → 0.71 s | 0.59 s → 0.65 s | 0.000 → 0.000 | 474 KiB → 339 KiB |
| Login | 0.42 s → 0.44 s | 0.38 s → 0.35 s | 0.000 → 0.000 | 460 KiB → 326 KiB |

The largest observed LCP across all 36 after-change visits was 1.40 s. The largest recorded layout shift total was 0.003. Opening the guide produced a maximum recorded Event Timing duration of 160 ms. An earlier run while the local service stack was starting recorded a 440 ms About guide interaction. These synthetic interactions do not establish field INP, mobile-network LCP or sustained FPS on physical Android devices. Navigation uses a 720 ms transition with an immediate reduced-motion path.

Desktop homepage median LCP increased by 0.58 s over these samples, even as transfer size fell.

The homepage JavaScript entry fell from 364.39 to 220.54 kB before compression and from 115.76 to 72.50 kB gzipped. The optional Excel import still loads a 940.17 kB chunk, or 271.30 kB gzipped, when the workspace needs it. The browser transfer figures above include other route resources and use the static fixture's uncompressed HTTP responses.

The authenticated studio was measured in a separate release build against local Supabase. A single run took 1,727 ms from TOTP verification to the studio, 520 ms from saving to verified draft confirmation and 388 ms from publishing to public read-back. The earlier owner workflow used a different authentication flow, so there is no comparable authenticated baseline. [Studio measurements](owner-local.json)

## Publishing and security

- Supabase verifies the registered owner's password and native TOTP factor. An existing verified factor is reused. A first enrollment requires confirmation in an authenticator. Database authorization checks the immutable Auth user ID and AAL2 on every protected mutation.
- Restrictive RLS policies cover articles, topics, academic resources, collections, tags and their relationships. Draft topics hide their articles. The migration keeps the current table and content, including unpublished rows. A legacy installation containing only `content_entries` is upgraded by renaming that table in the same transaction.
- New editorial media enters a private bucket through an Edge Function. It validates the caller, streams up to 8 MiB, checks the image container signature and assigns a random key. The browser also verifies that it can decode the image. Only content references from publicly visible articles allow anonymous downloads. Legacy public media retains its existing URLs. Visitors can retain copies of any media previously made public.
- Markdown renders as React elements and text. The visual block editor and Markdown editor share one source string. Article preview uses the visitor renderer. Reading time uses the ceiling of visible Unicode word count divided by 220, with a one-minute minimum. Image markup and link destinations are excluded. An optional manual value takes precedence.
- The editor keeps recovery data in the owner's browser tab, clears it on explicit logout and compares the last saved revision before updating. Retried submissions reuse their article ID. Published visibility is checked using a separate anonymous request. The public contribution form continues to prepare a submission for review.
- Authentication uses explicit bearer headers. Private session and media requests go to the configured Supabase origin. GitHub Pages serves static content. Each built HTML page receives a document CSP with hashed inline scripts and a restricted connection policy. The host controls HTTP-only protections such as frame ancestors and HSTS. HTTPS article frames/images and inline CSS remain permitted for existing content.
- The dependency audit on the baseline reported two moderate findings. After the router update npm reported zero known vulnerabilities in the locked tree. npm's advisory database and this review cover different aspects of security.

## Verification

- The production build includes 59 prerendered Academic routes. The repository's lint command runs TypeScript build checks. All 12 Node unit and contract test files passed, including the PostgreSQL policy checks.
- The browser suite covers Academic workspaces, data import and export, lessons, deep links, article search, submission, responsive layouts, accessibility, game controls and the three assistants. CI runs the same scenarios in Chromium, Firefox and WebKit. [Pull-request checks](https://github.com/arharif/arharif.github.io/pull/124/checks)
- Owner verification uses an isolated copy of Supabase Auth, PostgreSQL, PostgREST, Storage and the Edge Runtime with throwaway identities. The production owner account and existing blog records are outside this fixture. The test submits a real authenticator code on enrollment and a fresh code on a second login. It verifies anonymous article and image access before and after publication and withdrawal. [Integration script](../../scripts/verify-owner-local.mjs)
- The external publisher link check could not verify 39 URLs from the restricted runner. The academic routes, link destinations and internal navigation were covered by browser tests. CI retains a separate publisher reachability artifact.

To reproduce the owner check, use a disposable local Supabase CLI workspace with project ID `x1-local-supabase`, local email confirmation disabled and TOTP enrollment and verification enabled. Run the `editorial-upload` function from this repository in that stack. With the local anonymous key in `X1_TEST_ANON`, run `node scripts/verify-owner-local.mjs` from the repository. This creates two local users, applies the schema with one local UUID and tests the production bundle. The fixture expects the local API on port 54321 and uses port 4177 for the browser preview.

## Releasing to the existing Supabase project

1. Match the project to the existing Pages build setting `VITE_SUPABASE_URL`. In that project's Auth users, identify the registered owner account and use its existing UUID. Preserve its password and enrolled factors.
2. Review current table names, dependencies, policy definitions and any custom public views or security-definer RPCs. Take a recoverable database backup using the project's existing process. If both content table names contain distinct records, reconcile their role in the installation before release.
3. Substitute the verified owner UUID for `<OWNER_UUID>` in [the transactional SQL migration](../supabase.sql) and apply it to that database. Enable TOTP enrollment and verification under Supabase Auth. Deploy the [editorial-upload Edge Function](../../supabase/functions/editorial-upload/index.ts) to the same project. For projects using asymmetric JWT signing keys, deploy with the Supabase CLI option `--no-verify-jwt` to bypass its legacy gateway verifier. The function calls authenticated PostgREST to verify the actual user token, owner UUID and AAL2 before accepting a body. Server credentials belong only in the function runtime.
4. Verify an anonymous public article read, a blocked unauthenticated write, the owner's native challenge and private media using a temporary draft. Retain existing public data and confirm existing article URLs still resolve. Avoid issuing a new production factor on the owner's behalf.
5. Merge the reviewed PR after the backend checks. The existing Pages workflow builds against the repository's configured public Supabase settings, publishes the commit and verifies the deployed revision, routes and asset links.

The GitHub Pages build requires the existing public Supabase URL and publishable or anonymous key. Those two browser settings alone cannot run a database migration or deploy a function.
