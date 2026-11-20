# X1 Academic architecture

This increment introduces an isolated public academy under `/x1-academic/*`. The personal and professional site still mounts the existing Shell and AuthProvider. App.tsx selects the academic route boundary, then loads AcademicApp lazily. Academic CSS is scoped to `.xa`. Theme selection is independent of the personal site's themes.

## Feature boundaries

- `src/academic/app` owns routes, theme, breadcrumbs, focus and anonymous progress context.
- `src/academic/data` holds typed cases, controls, curriculum, curated resources and the navigation search index.
- `src/academic/features` contains separately loaded laboratories and learning pages. Explore composes inherited role, framework and certification data.
- `src/academic/components/shared.tsx` contains scenario import, reference links and report export.
- `src/academic/workspace` owns shared in-memory risk/assessment state, contextual explanations, charts, spreadsheet adapters and register analytics.
- `src/academic/utils` contains pure simulation engines, CSV transformation and validation for imported state.

No backend or paid service is needed. ExcelJS is dynamically imported for local XLSX processing. Its UUID transitive dependency is overridden to 11.1.1 and exercised by workbook round-trip tests. Playwright and axe are development dependencies. Node 24 supports the existing strip-types test runner and static content generation. Compatible dependency updates remove the high-severity advisories observed during review. A router major-version migration remains a separately documented compatibility decision.

## Data contracts

`data/types.ts` defines Discipline, Scenario, FrameworkControl, ControlAssessment, LearningModule, Assessment, EducationalResource, AIConfiguration, Prediction, LearnerProgress and CaseArtifact. A learning module owns objectives, prerequisites, explanations, an activity, a knowledge check, revision notes, related laboratory and source. The three tracks expose a 36-module curriculum with three published modules and 33 explicitly planned modules.

Stable case IDs are `paysecure`, `petroshield` and `smartfactory`. Every laboratory reads the selected case from the academic context. Selecting another case starts a fresh lab workspace. Lab decisions are session state. JSON exports retain the current results. Importing a case artifact selects its organisation and exposes prior results as contextual evidence to review. It does not silently approve or apply previous conclusions. AI configurations and course progress can be saved locally.

Progress uses `x1-academic-progress-v1`, schema version 1. Completion requires a correct knowledge response and at least 80 characters of activity reasoning. This is an observable participation rule, with no independent competency attestation. Attempts, completed module IDs, bookmarks, current module and one AI configuration can be exported, restored and reset. Disabled storage produces a visible warning.

## Route inventory

| Route suffix below `/x1-academic` | User journey |
| --- | --- |
| `/` | Interactive risk overview, learning entry points and contextual guide |
| `/cybersecurity`, `/grc`, `/artificial-intelligence` | Discipline curriculum with publication states |
| `/learning` | All pathways |
| `/learning/:id`, `/learning/:discipline/:id` | Published module, activity and knowledge check |
| `/labs` | Five laboratory entry points |
| `/labs/framework-explorer` | Control navigation, assertions, gaps and comparison |
| `/labs/risk-decision` | Multi-record Excel/CSV register, analysis snapshots, dated observations, reports and treatment simulation |
| `/knowledge-graph` | Search, domain filters, selectable connected concepts, zoom/pan, expansion and accessible outline |
| `/labs/cyber-incident` | Evidence chain, decisions and investigation report |
| `/labs/ai-experiment` | Reproducible configurations and metric comparisons |
| `/labs/ciso-boardroom` | Portfolio, constraints, governance and briefing |
| `/frameworks`, `/frameworks/:id` | Inherited catalogue with source overlays |
| `/security-map` | Existing roles, skills, progression and actual modules |
| `/certifications` | Inherited preparation guidance with verification limits |
| `/resources` | Seven-dimensional filters and bookmarks |
| `/case-studies` | Shared fictional organisations and lab entry points |
| `/assistant` | Deterministic published-metadata navigator |
| `/progress` | Local records, export, restore and reset |

Legacy routes remain independent. The baseline audit lists them. The navigation dropdown gains an Academic Home link. The root personal homepage retains its existing implementation.

## Static delivery

Vite builds root-relative assets for the user-site domain. `scripts/prerender.mjs` emits 39 academic route documents with metadata, canonical URLs, navigation and static teaching text for the three published lessons. React creates the interactive application after load. This is a static text shell, with no server rendering or hydration service. The generated sitemap extends the existing sitemap in dist. Build outputs remain ignored.

Unknown deep links use public/404.html and index.html recovery. Query ampersands are encoded in both fallback copies. The local Pages fixture returns actual 404 HTML for missing paths and directory index files for known academic paths.

The inherited Instrument Serif stylesheet is attached while the legacy Shell is mounted and removed when leaving it. This preserves the original site's font while keeping academic system typography independent of the Google Fonts network destination.

## In-memory workspace lifecycle

`WorkspaceProvider` retains risk drafts, the last analysed snapshot, dated observations and framework assertions during internal navigation. Changing the fictional organisation resets those values. Neither risk data nor assessment evidence is persisted to localStorage or sent to a backend. A refresh clears them; export before refreshing. Existing learner progress, bookmarks, theme and explicitly saved AI configuration retain their localStorage behaviour. The explanation guide is deterministic editorial content keyed to selected elements, with no external LLM call.

`RiskLab` imports and exports the first worksheet through a lazy ExcelJS adapter. Pure register validation and aggregation live in `workspace/risk.ts`; `utils/engines.ts` retains the original simulation methods. The source-reduced CSF JSON is bundled with the framework route. No changes to the legacy React shell or root-site routing are required. GitHub Pages receives one additional generated route document, `/x1-academic/knowledge-graph/index.html`.
