# X1 production hardening review

## Architecture and trust boundaries

X1 is a Vite/React single-page application deployed as static assets to GitHub Pages. React Router owns public, login, and admin routes. Public seed content is bundled with the application when Supabase is not configured. In production, the browser calls Supabase Auth, PostgREST, and Storage directly with a public anon key; PostgreSQL row-level security (RLS) is therefore the backend authorization boundary. The configured admin email is only a UX gate in React. It is **not** the authorization control: every database and storage mutation is independently authorized by Supabase RLS using the verified JWT email.

The content path is: public React route → CMS adapter → published-only PostgREST query/RLS → PostgreSQL. The administrative path is: password check → email OTP → verified Supabase JWT → editor → authenticated PostgREST/Storage request → RLS validation → persistence → read-back verification. Drafts are excluded from public queries and RLS. Static fallback data is public demonstration content only and must never be used as a production administrative store.

The assistant is a local, read-only retrieval guide; no AI provider or assistant action API is present. On every query it combines published CMS topic/content metadata with approved static navigation knowledge. It receives no JWT, draft, body, private note, log, or environment data. Retrieved text is treated as searchable data and rendered as React text, never raw HTML. The assistant has no write tools. Its availability is not required for navigation or published content.

External boundaries are GitHub Pages (hosting/TLS), Supabase (authentication, database, storage), and explicitly linked third-party destinations. No analytics, cookies, server runtime, AI SDK/provider, application monitoring service, or custom API server was discovered. `public/healthz.json` is a static availability probe, not a database-readiness check.

## Readiness assessment

**Overall: conditionally ready, not unconditionally production-certified.** The static public experience can be built and served independently of optional services. Publishing now supports private drafts, explicit publication/unpublication, and public read-back verification. Production readiness still depends on applying the reviewed SQL policies with the real admin email, configuring Supabase Auth/OTP and HTTPS environment values, and executing the live persistence journeys against the production project. GitHub Pages cannot provide a dynamic backend health check or per-route response headers.

## Fixed now

- Restored draft semantics end to end instead of coercing every write to `published`; unpublishing clears the public timestamp.
- Made publishing actions explicit: **Save draft**, **Publish**, **Update published**, and **Unpublish to draft**. The editor preserves draft state and does not clear input on a failed write. Publication is read back through the anonymous public query before success is shown.
- Made the assistant index current published CMS metadata automatically on each request, with static approved navigation knowledge as fallback. Drafts are never requested.
- Added explicit refusal for requests involving hidden instructions, secrets, credentials, unpublished content, and common direct/indirect prompt-injection patterns.
- Replaced generic fallback recommendations with an honest “not verified” response, and clearly distinguishes retrieval outage from “no published match.”
- Added assistant dialog focus entry, Escape close, focus containment, live loading status, mobile dynamic-viewport sizing, safe-area positioning, and scroll containment.
- Confirmed Markdown and assistant responses render through React nodes with HTTPS/mailto URL allowlists rather than raw HTML injection.
- Existing protections retained: request timeout/cancellation, RLS-backed authorization, two-step administrator login, session revalidation, upload MIME/size controls, reduced-motion rules, route error boundary, lazy loading for large public sections, and published-only public reads.

## Findings by discipline

### UX, admin, and publishing

Public navigation, page naming, responsive layouts, focus styles, empty states, lazy-route loading states, and human-facing error copy are broadly coherent. The admin previously presented an unsafe publish-only workflow. It now clearly exposes draft and publication state. Failed writes leave editor state intact, and destructive deletion requires explicit confirmation.

A successful database write is not treated as public proof: publication must be read back through the public published-content path. Live production verification could not be completed without production credentials and must remain an acceptance gate.

### Security and AI security

Supabase RLS is the authoritative enforcement point. Client route checks and the configured admin email improve UX only. The anon key is intentionally public; service-role keys, provider secrets, and credentials must never use the `VITE_` prefix. Repository scanning found configuration placeholders rather than an embedded production secret.

The assistant is deterministic local retrieval, not a generative or autonomous agent. It has no privileged tools. Current published content outranks approved static metadata. General model knowledge is absent, eliminating unsupported X1 claims. Inputs and retrieved fields are normalized for matching and never executed. Output is plain React text and controlled internal links. If a remote model is added later, preserve system/platform/retrieved/user separation server-side, sanitize output, minimize payloads, rate-limit the endpoint, and never pass authorization decisions to the model.

### Privacy, resilience, and observability

No analytics or assistant transcript persistence was found. Authentication state is stored in session storage rather than long-lived local storage; browser storage remains untrusted. Operational requests are time-limited and errors are converted to generic public messages. Optional assistant retrieval failure does not affect the public site.

Observability is proportionate to a static deployment but minimal. GitHub Pages availability can monitor `healthz.json`; Supabase dashboards/logs must cover authentication, database, and storage failures. Do not log passwords, JWTs, OTPs, full assistant queries, or confidential content. A future server endpoint should emit only request ID, status, latency, and failure category.

### Accessibility and performance

The application includes a skip link, semantic routes/headings, visible focus treatments, reduced-motion handling, labels on core controls, lazy routes, and lazy Markdown images. The assistant now behaves as a keyboard-contained modal and respects mobile safe areas. Remaining production QA should include automated WCAG scanning plus manual keyboard, screen reader, zoom, contrast, radar, roadmap, and editor checks at 320, 360, 390, 430, 768, 1024, 1280, and 1440 pixels.

The assistant adds no external SDK and loads only local code/data. Major page modules are route-lazy. The largest remaining performance risks are game/security-map code imported into the main application and media that lacks enforced dimensions/responsive variants; measure with production Lighthouse before optimizing.

## Remaining acceptance risks

1. Apply `docs/supabase.sql` to the production Supabase project after replacing `<ADMIN_EMAIL>`, then verify policies with anonymous, non-admin authenticated, and admin identities.
2. Execute the real login → draft → preview → publish → anonymous public read → update → republish → unpublish → logout journey. Confirm a forced failed publish retains the editor draft.
3. Add an append-only server-side audit table/RPC before treating administrative mutation auditing as complete.
4. GitHub Pages does not allow repository code to set HSTS, CSP, frame protection, Permissions Policy, or other HTTP response headers. Configure supported headers at a reverse proxy/custom host, or document and accept this platform boundary. A meta CSP was intentionally not pasted in because runtime Supabase origins vary and frame/HSTS directives require response headers.
5. Client-side login throttling improves feedback but is not an abuse boundary. Configure Supabase Auth rate limits, CAPTCHA/bot controls where warranted, and alerting at the service boundary.
6. Add CI for build, dependency audit, secret scanning, accessibility smoke tests, and responsive end-to-end journeys.

## Optional future improvements

- Add a small authenticated Supabase RPC for transactional publishing, idempotency keys, public read-back, and append-only audit events if publishing volume or number of administrators grows.
- Add a privacy-preserving frontend error service only if operational needs justify the external dependency.
- Split game and visualization routes further if production bundle measurements show a user-visible benefit.
- Introduce a server-side AI/retrieval service only when generative answers are a validated requirement; retain published-only indexing and read-only public capability by default.
