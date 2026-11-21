# Engineering, methodology, design system and learner guide

## Routes and product architecture

All new product routes remain under `/x1-academic`:

| Destination | Route | Responsibility |
| --- | --- | --- |
| Academy Overview | `/x1-academic` | Guided start, continuation and focused labs |
| Learn | `/learning` | Published modules, planned labels, activities and knowledge checks |
| Explore Standards | `/standards` | Unified edition/authority/scope register and lifecycle |
| NIST system implementation | `/standards/800-53` | Official control/assessment/baseline catalogue |
| Simulate | `/simulate` | Focused laboratory entry points |
| Privacy | `/simulate/privacy` | Processing inventory, harms, edition-specific risk and actions |
| Assess | `/assess` | CSF Current/Target Profile and separate Tier exercise |
| Implement | `/implement` | Tasks, RACI, Gantt, resources, baseline, RAID and assurance |
| Report | `/report` | Learner, practitioner and executive reporting snapshots |

Suffix routes above are relative to `/x1-academic`. Every pre-existing academy and professional route is retained. The prerenderer emits 55 academic route documents. The deployment verifier includes the seven new entry points and existing public routes.

`app/AcademicApp.tsx` owns navigation, focus, themes and breadcrumbs. `workspace/state.tsx` holds separate typed project state for the three fictional cases. `studio/model.ts` and `persistence.ts` define the version-2 contract and trust boundary. `studio/engines.ts` contains pure calculations; visual components consume those outputs. `report.ts` clones complete source inputs before deriving a report. Feature modules are lazy-loaded. The large NIST source asset is fetched locally only in its specialist workspace; ExcelJS and its parser worker load only for spreadsheet use.

The shared project includes stable organisation/project/finding/task/activity/privacy/resource IDs; scope and period; framework editions; evidence references and learner-recorded verification; register risks; control decisions; milestones; RAID; baselines; real reporting checkpoints; and lab drafts. Source references use `finding:`, `privacy:`, `control:framework:control`, or `objective:` prefixes. Missing/circular dependencies, broken source links, duplicate IDs and invalid recorded assertions are rejected at import. Incomplete editor drafts are structurally bounded and kept distinct from recorded findings/tasks.

No existing anonymous `x1-academic-progress-v1` data was reinterpreted as version-2 evidence. Existing module completion, bookmarks and saved AI configuration remain compatible. Earlier case artifacts still use their original import workflow; they are contextual inputs, not automatically validated findings.

## Calculation contracts

### X1 Educational Maturity Model v1

The versioned algorithm uses integer levels 0–4. Default labels are Not established, Initial/ad hoc, Repeatable, Defined and managed, and Measured and continuously improved. Labels and Equal/Priority-weighted settings are explicit project configuration. This rubric is not an official NIST scale.

Eligible population = applicable records with a recorded current level, including explicit zero. Justified exclusions do not enter the denominator. Unassessed records and unjustified exclusions are reported separately. Target means use exactly the same eligible population as current means. Equal weighting assigns 1 to each; priority weighting uses the entered 1–5 aggregation weight. Round only for display.

`mean = Σ(level × effective weight) / Σ(effective weight)`. For current levels 0 and 4 with weights 1 and 3, weighted current = 3.00. If targets are 2 and 4, weighted target = 3.50. Equal means are 2.00 and 3.00. Missing records do not imply zero. Evidence confidence and verification never mechanically increase a rating.

The full CSF Core is 6 Functions, 22 Categories and 106 outcomes. A learner's selected Profile is a declared population within that Core. Unselected outcomes are shown separately from selected-but-unassessed records. CSF Tiers use SP 1302 governance and management judgements, rationale and leadership review; no Tier average or mapping from X1 maturity is computed.

### Risks and privacy

Risk analytics retain the existing transparent ordinal likelihood × impact engine and declared 1–5 bands. Closed records are excluded from active exposure. Analysis uses an explicit snapshot and its own date. Pending register/date edits never relabel it. A sum of indices is a prioritisation summary, not expected loss, probability or money. Historical curves require dated observations.

Privacy uses likelihood of a problematic data action × severity of harm to individuals, each 1–5 over the assessment period. Bands: Low 1–4, Medium 5–9, High 10–16, Critical 17–25. Inherent and residual ratings are separate entered judgements. Retention/minimisation proposals do not subtract arbitrary points. The exercise distinguishes potential individual harms from security loss to an asset and never automatically decides GDPR applicability.

### NIST control baseline and assessment

CIA categorisation is a reviewed system/information-type input; the greatest entered objective suggests a starting impact level. It never uses industry as a shortcut. A learner chooses Low/Moderate/High, documents deviations/tailoring and considers privacy separately. The four imported profiles list exact base/enhancement IDs; combining privacy/security membership is a deduplicated union.

Control implementation, applicability and common/inherited/system-specific responsibility are distinct from 53A assessment methods, evidence and findings. Draft decisions are labelled unreviewed and do not count as reviewed implementation. A reviewed/assessed assertion requires its relevant owner, rationale, evidence and procedure. Official statement/objective/method text has a separate label from original educational prompts and learner-authored tests.

### Gantt, resources, milestones and CPM

Scheduling is UTC date-only. Weekdays and holiday dates are explicit; finish-to-start successors begin on the next working day. An approval milestone has zero effort/duration and occurs at its scheduled date. Resource-levelled duration is `max(entered working days, ceil(effort hours / daily capacity))`. Each resource performs one task at a time, in stable topological/task-register order; it is an explicit conservative teaching assumption.

Estimated cost = entered effort × configured hourly rate, in the chosen currency/fictional unit. Rates and effort are not supplier quotations. Resource-delay values are calendar days. The exact schedule table is authoritative for dates; the Gantt uses proportional date spans with minimum click targets.

Dependency-only CPM computes earliest/latest offsets and zero slack on the DAG using these task durations. It ignores earliest-start release dates, calendars and contention; it does not purport to be a resource-constrained delivery critical path. The actual scheduled dates include those constraints. Cycles, absent predecessors, duplicate task IDs, invalid calendars, effective durations over 730 working days and schedules over ten years are rejected. Maximum: 500 project tasks.

Baselines retain the explicitly captured dates/costs. Delivery/progress changes do not rewrite the baseline or original assessments. Validation requires 100% progress, Passed, evidence and reviewer; implementation alone is insufficient. No task automatically modifies a linked risk or maturity score.

## Components and interaction rules

Use the existing `.xa` design tokens, scoped by `.xs-academy`. Semantic surfaces/lines/text and dark/light variables remain consistent. Body text is 15px with readable line spacing; input/legend sizes and touch targets are responsive. Charts are functional buttons/legends with exact table/list alternatives. Colour is accompanied by names/numbers. Use `Header`, `Field`, `Panel`, `Kpi`, `Bars`, `Donut`, `RiskMatrix`, `Radar`, `Stepper`, `Flow`, `Gantt`, `Method` and `Empty` before adding a new pattern.

The explanation provider owns one mode selection across routes. It persists a non-sensitive preference only. Selecting metrics supplies the current figure's meaning, method, business/technical examples, analogy, source and next action. Long methodology belongs in details. The native tutorial dialog supports Escape/focus return and an explicit knowledge check.

Generated report objects retain their own rubric, currency, resources, calendar and source date. Display filters affect the view only. Downloads use fixed filenames, escaped CSV and JSON text. Regenerate deliberately when inputs change; the stale-snapshot notice prevents accidental mixing.

## Learner walkthrough and recovery

1. Use fictional data; choose the appropriate organisation in the workspace selector.
2. Start a guided assessment. Use the case context, then review mission, services, boundary, stakeholders, tolerance and dates.
3. Record one outcome honestly. Distinguish a proposed target, current assertion, evidence reference and tested operating evidence. Explore the gap and create/link risks as appropriate.
4. Create an action explicitly. In Implement, assign RACI, resource, dates, effort and dependencies. Inspect both the Gantt and exact table. Capture a baseline only after reviewing assumptions.
5. Enter implementation progress, then a separate validation result. Reassess outcome/risk records explicitly after evidence supports it.
6. Generate a report and inspect its source rows. Export full JSON/CSV, roadmap/RACI, or print the executive report.
7. Open Project recovery. Consent before Save fictional project. Save is per organisation and explicit; navigation/switching cases retain tab drafts. Refresh/closing loses changes since the last save. On return choose the same organisation and Restore saved project, or import the JSON project.
8. A saved copy expires after 30 days and is deleted on the next academy visit/restore. Delete saved copy clears that organisation's stored copy while leaving the open tab. Reset open project resets only that organisation; reset one framework leaves other framework assessments intact. Learner progress has separate existing controls.

For privacy, record the processing activity before its harm finding. Retain the appropriate published/draft edition and reviewed legal-scope assumptions. Create the privacy action explicitly and follow it through Implement/Report. For a NIST system exercise, review information types/CIA, select and tailor a starting baseline, assess evidence, then create control-linked tasks.

## Developer checks and source maintenance

Use `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. The existing lint command is a TypeScript check, not a configured ESLint ruleset. CI runs Node 24 and Chromium/Firefox/WebKit using `X1_ALL_BROWSERS=1`; local Chromium can use `/usr/bin/chromium`. Tests serve `dist` through the Pages-like server, including direct-route documents and fallback recovery.

Rebuild NIST data from the five original OSCAL JSON files using `node scripts/standards/import-nist.mjs /directory/with/source/files`. Review source hashes, editions, changes, baseline IDs and objective extraction, then rerun catalogue tests and browser flows. Do not silently overwrite an assessment edition or interpret an OSCAL representation-modified timestamp as a new published standard.
