# Executed validation

Validated on 2026-11-20 with Node 24.22.1, npm 11.9.0 and system Chromium through Playwright 1.65.1. The baseline commit had four passing Node tests. Tests ran against the actual checkout and built dist output. The original implementation results are recorded first. The publication follow-up below records later production verification and CI remediation.

| Command or check | Actual result |
| --- | --- |
| `npm run build` | Passed TypeScript and Vite production build. Prerendered 39 academic route documents and extended sitemap |
| `npm run lint` | Passed repository TypeScript check |
| `npm test` | 17 passed, 0 failed, 0 skipped |
| `npm run test:e2e` | 17 passed, covering functional journeys and accessibility/layout checks |
| `npm audit --omit=dev --audit-level=high` | Exit 0. Two moderate router dependency findings remain |
| Full dependency audit | After compatible updates, 0 critical, 0 high, 2 moderate findings |
| `npm run check:links` | Exit 1. All eight seed-source checks are unverified due to CONNECT 403 from the egress proxy. Full observations are in LINK_REPORT.json |
| `git diff --check` | Passed |

## Coverage

Node tests cover risk formulas, category boundaries, invalid ratings, control-state validation, summary counts, evidence thresholds, hand-calculated AI metrics, zero denominators, seeded reproducibility, threshold monotonicity, feature/shift changes, budgets, duplicate selection handling, CSV escaping and formula neutralisation, case schema/size/depth/date checks, progress restore, resource filtering, curriculum consistency and rubric coverage. Original certification and Supabase contract tests still execute.

Browser tests cover academic section navigation, the learning catalogue and published risk-assessment module, direct refresh, static lesson text and metadata, control selection and validation, gap reports, risk reasoning and JSON output, contextual import into the boardroom, incident evidence/hypothesis/report, live AI metrics and comparison, saved configuration reload, scenario reset, executive budget constraints and decisions, course completion, bookmarks, empty search results and deterministic navigator results. Legacy entry routes render through the Pages fallback. A query/fragment recovery test verifies multiple query parameters.

Eight representative academic pages run axe checks for WCAG 2 A/AA, 2.1 AA and 2.2 AA tags in dark and light modes. Each checks 320px and 768px viewport width, adjacent mobile navigation item bounds, reduced motion and keyboard focus. The final selected pages had zero reported axe violations. This is bounded automated coverage, with no claim of complete WCAG conformance or screen-reader certification.

Manual visual review used desktop and 320px screenshots. A keyboard-only browser walkthrough followed landing → lab catalogue → risk lab and adjusted a slider with an arrow key. A 640px layout check also passed. Production academic route traversal checked console errors and compiled asset failures. The inherited remote font is loaded only in the legacy shell, so academic pages use local system typography.

## Findings corrected during validation

Initial browser runs exposed missing parent route context, inline links without a non-colour affordance, mobile navigation label overlap and transient light-theme button contrast during inherited colour transitions. Corrections were applied and the full browser suite reran. Report roadmap order was corrected to follow selection order. Imported JSON bounds were strengthened after review.

## Limits and residual risk

The two moderate dependency records are react-router and its react-router-dom parent. Advisory fixes require React Router 7.18.6, a major-version migration. The academy supplies internal routes from controlled metadata and does not use SSR hydration. Those scope facts do not remove the advisories. A tested major-version migration remains pending.

Source editions, programme eligibility and external resource reachability remain unverified under the current egress policy. No production GitHub Pages deployment, live Supabase RLS test, hosted tutor test, Firefox/WebKit run or external screen-reader review occurred. Browser print is provided, with dedicated PDF fidelity review pending. The new academic application chunk is approximately 18 KB gzip, and individual lab chunks are approximately 3–4 KB gzip. The inherited entry bundle remains approximately 128 KB gzip.


## Publication follow-up

The user authorised direct publication to main. Fast-forward pushes succeeded without merge conflicts. The existing keepalive workflow had an invalid direct secrets reference in a step condition. Job-level environment bindings now support that condition, with a regression test bringing the Node suite to 18 tests.

GitHub-hosted CI found AI Studio table overflow at 768px that the local browser did not reproduce. The confusion matrix now has a keyboard-accessible scrolling region, and two-column panels stack below 1000px. The original width assertion remains active. CI uses the installed Playwright browser and publishes failure annotations and traces for diagnosis.

The Pages workflow now verifies its published commit using deployment.json, then checks ten public routes and compiled entry assets. This verification runs on the GitHub runner because the cloud machine's egress policy blocks the production hostname. Production verification succeeded during publication. Latest run status is available in the repository Actions pages.
