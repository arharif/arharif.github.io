# Premium standards and implementation delivery

Date: 21 November 2026. This report describes the increment layered onto the connected X1 Academic 2.0 platform. Earlier reports retain their original revision-specific results.

## Baseline and integration

The initial inspected baseline was `9403047`. The independent implementation checkpoint is `d6003ad`. Before release, the dedicated `codex/academic-premium-workspace` branch incorporates concurrent mainline work through `440f8b4`, including the full NIST source snapshots, shared project contract, privacy workflow, risk spreadsheet worker, CSP-safe validation and independent assurance fields.

Conflicts were resolved by retaining the shared state, simulation engines, security fixes and source catalogues from mainline, then adapting the new explorer and overview to them. Duplicate risk-register, explanation and scheduling engines were removed. No personal homepage replacement or new academic product outside `/x1-academic` is introduced.

## Completed journeys

| Route | Working behaviour |
| --- | --- |
| `/x1-academic` | Four expandable workspaces: Explore Standards, Assess & Simulate, Implement, Security Mindmap. Contextual lesson links, search and continuation of the open fictional project remain available. |
| `/x1-academic/standards` | Searchable edition selector with 26 source records, framework-specific educational architecture, keyboard-selectable hierarchy, zoom/reset, contextual explanations and source boundaries. CSF drills through six Functions and 22 Categories into all 106 official outcomes. |
| `/x1-academic/standards?framework=…` | Appropriate original visual arrangements for management lifecycles, control families, regulatory pillars and decision flows. SP 800-53 exposes all 20 families with selected examples; its complete catalogue remains in the specialised workspace. Published Privacy Framework 1.0 uses its five Functions; draft comparison remains separately labelled. |
| `/x1-academic/standards` assessment dashboard | “Try Completed Demo” adds a clearly fictional, scoped assessment without replacing learner edits. Interactive level distribution and area-gap bars filter actual findings. Edit owner, current/target, rationale and evidence; export assessment CSV/JSON and gap CSV; continue into shared reports and implementation. |
| `/x1-academic/implement` | Generate framework-specific implementation and validation tasks alongside the seven-stage project and approval gates. Unlinked open findings create source-linked remediation tasks. Edit tasks, RACI, progress, resources, calendars and dependencies through the existing planner. |
| `/x1-academic/implement` Gantt | Day/week/calendar-month views, phase colours, collapsible groups, keyboard-selectable task bars, controlled scrolling and exact schedule table. Existing resource levelling, deadlines, baselines, RAID, validation and export remain intact. |
| `/x1-academic/security-map` | Original interactive Security Mindmap is embedded, preserving roles, operating-model view, skills, certifications and career relationships. The academy role-to-learning view remains available as a second view. |
| `/x1-academic/resources` | Curated source resources plus the original published Academic Library. Existing entries and authenticated management functionality are retained. |

The original X1 mark and seven-theme selector are reused. The logo returns to the Academy Overview. Separate gateway links return to the main website, including from the mobile menu. Standalone Learn is removed from primary navigation; published learning paths remain contextually linked and directly accessible.

## Architecture and educational method

- `src/academic/data/standards.ts` contains original educational architecture models, explanations, owners, implementation/evidence examples and relationship interpretations. It does not reproduce licensed ISO requirements.
- `src/academic/studio/standards.ts` remains the unified source/edition catalogue and resolves architecture models, aliases and the compact NIST family snapshot.
- `src/academic/data/sp80053-families.json` is derived from the retained official OSCAL catalogue. The complete controls and enhancements remain lazy loaded in the existing NIST workspace.
- `src/academic/studio/planning.ts` adds tasks using the shared typed Studio model. It never changes assessment ratings or evidence verification. High fan-in uses intermediate readiness milestones; generation rejects projects exceeding the scheduler's 500-task limit without replacing existing work.
- `src/academic/studio/timeline.ts` calculates actual calendar-month boundaries and limits tick rendering for long timelines. The existing working-day scheduling engine remains authoritative.
- Shared `WorkspaceProvider`, `InsightProvider`, explicit save/restore and version-2 project import/export are reused. No second persistence or assessment store is introduced.

Demo levels are authored examples on **X1-EMM-1**, not NIST-prescribed maturity or objective compliance. The demo's references are fictional learner assertions, not independently reviewed evidence. Generic diagrams and topic assessments state their selected educational scope. They do not imply complete legal, ISO, PCI or certification coverage.

## Source review and publication limits

Run `npm run check:standard-sources`. It records checked time, reachability, final URL and publisher title in `test-results/standards-source-review.json`. A title/reachable page is not automatic edition verification. The diagnostic CI job retains the evidence for manual editorial review.

The local attempt reached an environment proxy denial for all 26 publisher references. The [branch publisher job](https://github.com/arharif/arharif.github.io/actions/runs/44913613465/job/136874412443) subsequently reached 16 references and encountered access challenges on 10 ISO pages. It retained a review artifact and a public summary. The ISACA landing-page title now mentions COBIT 7; this requested COBIT 2019 learning track remains edition-specific, with current publisher review pending. A title alone is not edition validation. Existing official NIST snapshots and hashes are preserved; new source records explicitly retain pending edition/amendment/legal-status review where authoritative access was unavailable. No later edition is inferred from the current date. Publisher search URLs are discovery references, not asserted verified standard records. National NIS2 transposition and phased EU AI Act obligations require current jurisdictional review.

See [the retained source register](v2/FRAMEWORK_SOURCE_REGISTER.md) for NIST provenance and [the security review](v2/SECURITY_REVIEW.md) for the connected platform's boundaries.

## Verification and correction record

Required local checks: `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, `npm audit --omit=dev --audit-level=high`. The unit suite contains 43 tests, including all-catalogue roadmap scheduling/serialization, 106-gap fan-in and safe size-limit rejection. Browser coverage contains 48 tests per configured browser, including CSV/XLSX workflows, five laboratories, project recovery, chart filtering, source/version boundaries, legacy routes, Pages-style refresh, accessibility and responsive layout. Final execution/publication status is recorded below after completion.

Initial integrated browser failures identified obsolete navigation/plan-size expectations and two ambiguous new test selectors. These were corrected against the actual UI, without dropping functional assertions. Visual review identified a stale explanation after framework switching, overly distant diagrams and a mobile X1 label hidden by inherited CSS; each was corrected. Full-profile scheduling review identified dependency fan-in beyond the saved-project contract; a regression test now covers it. The final walkthrough separated standards and finding searches, preserved contextual explanations during query-driven framework navigation and made gap-bar selections filter the matching gaps.

| Review perspective | Finding and action | Remaining limitation |
| --- | --- | --- |
| Architecture | Preserved mainline engines and removed competing domain stores. Pure roadmap generation now has contract/scheduling tests. | Existing large legacy lab/editor components remain candidates for later extraction. |
| Cybersecurity | Kept CSP-safe schemas, worker/ZIP import protection, bounded project imports, text escaping, formula-neutralised exports and local data processing. | Two inherited moderate React Router advisories remain; a major router migration requires separate site-wide regression work. No high/critical production audit findings. |
| GRC and assurance | Kept assertion, evidence review, validation, Current/Target Profiles and Tiers separate. Legal instruments are distinguished from standards and guidance. | Most non-NIST assessments are scoped educational topics, not full requirements/testing catalogues. Publisher verification remains explicitly pending where blocked. |
| AI science | Preserved the seeded prediction/metric engines, configuration comparison and tested threshold invariants. | No claim of new empirical model results or hosted model integration. |
| UX and accessibility | Reviewed actual desktop/mobile screens against the supplied references for readable density, clear hierarchy, useful interactions and restrained semantic colours. Added scoped compact explorer styling and corrected stale context/mobile branding. | Automated axe and browser checks support the review; they do not establish complete WCAG conformance or replace assistive-technology user testing. |
| Education | Connected architecture → fictional assessment → gap → implementation → report; preserved lessons and original library/map. | Seven published modules; the rest of the 36-module programme remains explicitly planned. No hosted generative tutor, legal advice or certification result. |

## Development and release

Use Node.js 24, `npm ci` and `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`. Build before running browser tests. The Playwright fixture serves the actual build with the Pages 404 recovery mechanism on port 4174. CI also runs Firefox and WebKit with `X1_ALL_BROWSERS=1`.

All new architecture models should include accurate source/edition context, original explanations, evidence/owner examples and an appropriate layout. Extend the catalogue/architecture tests when adding models. Never infer an equivalence mapping from keyword similarity. Re-review publisher requirements before operational guidance is expanded.

The existing Pages workflow builds and deploys main, records its exact commit in `deployment.json`, then verifies public route metadata and entry assets. Dedicated-branch CI runs before publication. GitHub API requests and the live Pages origin are denied by the current local network policy; Git operations remain available. An actual PR or verified deployment must be reported only after the corresponding operation is confirmed.

Smallest remaining product backlog: complete authoritative review of pending source editions and applicability; expand priority non-NIST requirements only with suitable source rights; author the remaining substantive modules; consider a separately secured hosted tutor; perform manual assistive-technology testing and the router major-version migration.

### Execution evidence

Local execution: type checking passed; 43 unit tests passed; the complete 48-test Chromium suite passed. Subsequent changes were checked by rebuilding and rerunning the seven affected explorer tests, including a complete 106-outcome project export/import round trip. The production audit reported two inherited moderate router findings, with no high/critical findings. The build produced 56 academic route documents; the sitemap has 63 unique entries.

Current release evidence is the [dedicated branch and its checks](https://github.com/arharif/arharif.github.io/tree/codex/academic-premium-workspace), the [GitHub Actions execution records](https://github.com/arharif/arharif.github.io/actions) and, after a successful Pages run, the public `/deployment.json` revision. The latest in-chat implementation report identifies the actual publication outcome. PR creation was attempted and rejected by the environment's network policy at `api.github.com/graphql`; the branch and [baseline comparison](https://github.com/arharif/arharif.github.io/compare/440f8b4...codex/academic-premium-workspace) remain reviewable without claiming an actual PR exists.

[Actual premium workspace captures](premium-screenshots/) show the desktop overview, standards architecture, fictional demo dashboard, ISMS lifecycle and mobile overview. They contain synthetic data only.

The requested cloud onboarding setup/startup instructions and additive network requirements were saved in the environment configuration draft. This is separate from the website release. Activating that draft requires review/save and publication through the environment settings; it has not changed current runtime access or published a new environment snapshot.
