# X1 Academic 2.0 baseline audit and execution plan

Baseline: production main `4259b8cb55b9364ee5dc9c1c216ec7085c52f6d5`, incorporating PR #119. The initial local checkout was `23e5335`; its source tree matched production and was fast-forwarded before creating `feat/x1-academic-2-connected-studio`. Inspection covered AcademicApp/CSS, every academic feature family, workspace/context, calculation engines, data catalogues, routes/build/Pages/CI, unit and Playwright suites, and the architecture/source/methodology/design/security/test reports. No AGENTS.md was found in the workspace inventory.

## Inventory and confirmed findings

| Area | Working baseline | Defect / gap | Priority |
| --- | --- | --- | --- |
| Risk register | Local CSV/XLSX mapping, validation, explicit analysis snapshot, interactive charts and exports | Date initialised to a fixed 2026-11-20; no project restore; monolithic component | P0 |
| Framework lab | Full 106-outcome CSF Core; 3 SP control summaries, 3 ISO topics, 12 PCI summaries; validation and local assertions | Reset clears the complete shared register. CSV rows use visible filters, unlike JSON. Empty filtered rows trigger ExportPanel summary fallback | P0 |
| Drafts | Saved assertions survive internal navigation | Unsaved field edits are local component state, lost on navigation/refresh; no recovery contract | P0 |
| Navigation | All legacy and academic routes exist, themes and mobile menu work | Thirteen peer destinations, duplicate framework links, no global search or primary guided assessment action; small fonts and dense first screen | P1 |
| Assessments | Status/evidence/owner validation | No Current/Target Profile, independent evidence state, scope/period, separate Tier exercise, transparent maturity model or findings workflow | P1 |
| Implementation | Boardroom additive teaching portfolio | No dated tasks, RACI, resource calendars, dependency scheduling, cycle detection, critical path, baseline or linked validation | P1 |
| Privacy | Privacy/leakage lesson within synthetic AI studio | No first-class processing inventory, individual harms, DPIA-style assessment or privacy action chain | P1 |
| Standards | Source-linked CSF full Core, limited other summaries | No full versioned 800-53 / 53A catalogue, 53B baselines or separate privacy baseline; additional editions need review | P1 |
| Security | React text escaping, bounded case JSON, formula-neutralised CSV, no risk data uploads, least-privilege Pages/CI token scopes | XLSX parsing runs on UI thread with compressed size cap but no ZIP expansion preflight/time bound; browser saves do not exist | P1 hardening |
| Dependencies | npm production audit: zero high/critical | Two moderate inherited React Router records; major upgrade would affect unrelated site, so evaluate scope and record rather than claim removed | P2 |
| Tests | Re-executed 24 unit/contract tests pass | Prior report records 26 Chromium tests; lacks regression coverage for reset/export/date/drafts, maturity, privacy, scheduling or project integrity; cross-browser support not yet established | P1 |
| Content | Three published lessons, publication-labelled planned curriculum, 16 source resources | Standards implementation lifecycle, privacy teaching and project deliverables missing | P1 |

Browser reproduction on baseline: saved a CSF assertion and an AC-2 assertion; a CSF reset erased AC-2. Exporting CSV with a no-match query yielded generic `item/result` summary output instead of the saved scoped records. Typed an unsaved owner, navigated away/back, and the value disappeared. With the browser clock set to 2027-02-04, Analysis date remained 2026-11-20. These are confirmed integrity/UX defects, not claimed security exploits. A clean baseline production dependency audit is retained outside the repository in the task evidence; only the two moderate router records were reported.

## Prioritised implementation sequence

1. Fix isolated reset, complete-scope exports, clock-derived dates and shared draft state. Add regression tests before relying on these workflows.
2. Introduce a versioned, bounded project contract with explicit local save/restore/export/reset and retention/deletion. Preserve existing learner progress storage.
3. Add common findings, evidence assertions/verification, scope, Current/Target Profile and a separate SP 1302 Tier exercise. Add X1 Educational Maturity Model v1 and reproducible aggregation/radar/table outputs.
4. Import authorised NIST OSCAL 800-53/53A text and 53B Low/Moderate/High/privacy membership with source hashes and a repeatable importer. Keep ISO/PCI content as original licensed-text-aware summaries.
5. Build privacy processing/lifecycle/harms/minimisation/DPIA-style workflow with explicit jurisdiction review and linked actions.
6. Build the seven-stage implementation project engine: traceable tasks, RACI, working-day scheduling, dependencies, cycle detection, resource levelling, milestone logic, baseline comparison, RAID, effort/rates and evidence validation.
7. Consolidate navigation into Learn / Explore Standards / Simulate / Assess / Implement / Report, retaining every old route. Add search, beginner/practitioner/executive mode, onboarding and a guided primary action.
8. Add local XLSX worker isolation and ZIP preflight, schema/prototype limits, safe exports/links, scoped CSP feasibility, dependency/security documentation and tests.
9. Run domain/boundary tests, round trips, primary-path browser tests, accessibility/responsive checks and supported cross-browser runs. Perform four critical review passes, record corrections and capture real before/after screens.
10. Open a reviewable PR. The final user directive explicitly authorises direct deployment after validation; use existing Pages infrastructure and verify the deployed revision and routes.

## Product acceptance path

Start guided assessment → define organisation scope → assess an outcome/current/target/evidence → open gap → link/create risk → create action with owner/date → view scheduled task and RACI → record implementation and validation separately → produce a reconciling report → explicitly save/export → reload/restore and continue. Privacy and SP baselines use the same project/action/report contract. No proposed action silently changes risk ratings, maturity levels or evidence verification.
