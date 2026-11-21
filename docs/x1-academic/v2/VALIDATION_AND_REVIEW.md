# Validation, accessibility and four-perspective review

Baseline: `4259b8cb55b9364ee5dc9c1c216ec7085c52f6d5`. Branch: `feat/x1-academic-2-connected-studio`. Local checks were executed against production builds, not Vite-only mock pages. Final revision and remote results are recorded in the PR/Actions history.

## Executed evidence

| Check | Observed local result |
| --- | --- |
| TypeScript / repository lint command | `npm run lint` passes; this command is `tsc -b`, not ESLint |
| Unit/domain/contracts | 37 tests pass, including 13 new studio calculation/schema/source/security tests with boundary/property sweeps |
| Lockfile reproducibility | Fresh `npm ci` succeeded with the committed dependency graph |
| Production build | Passes; 55 academic route documents emitted |
| Chromium E2E | 41 tests pass, including all 26 existing workflows and 15 new studio/route tests |
| Automated accessibility | Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA tags in dark/light; existing labs plus all seven new routes; no violations in executed checks |
| Responsive layout | 320px, 390px and 768px overflow assertions, mobile navigation and explanation drawer; desktop screenshots |
| Keyboard checks | Native tutorial Escape/focus return, knowledge check, navigation and focusable chart controls/alternatives |
| Spreadsheet workflows | Real XLSX template download→edit→worker import→mapping→analysis→CSV/XLSX/JSON export; row errors and malformed archive guards |
| Persistence/integrity | Draft navigation; explicit consent/save/reload/restore; versioned JSON round trip; malformed import leaves open data intact |
| Dependency security | Production and all-dependency npm audits: zero high/critical, two inherited moderate Router records |
| Limited source secret scan | No matching private-key/GitHub/AWS/OpenAI token patterns in academy/workflows/importer |
| Firefox/WebKit locally | Not executed: download hosts returned `403 Domain forbidden` under managed environment policy |
| Cross-browser CI | Configured to install and run Chromium, Firefox and WebKit; read the actual final Actions result before declaring remote success |
| Live Pages | The Pages workflow runs revision/route/asset verification after deployment. Its actual logs determine publication success |

Automated checks do not establish full WCAG conformance, independent assessor competence, or a penetration-test certificate. No physical screen-reader test was available. Some third-party dependency annotation and large lazy chunk warnings remain in the build; they are not concealed or promoted to successful performance certifications.

## Mandatory workflow reconciliation

- A novice enters scope, receives useful incomplete-input errors, records a CSF outcome at current 1/target 3, links R-001 and creates an action. Its scheduled 16-hour/two-day task starting 2027-02-08 finishes 2027-02-09 and costs 1,600 at the declared 100/hour rate. Report fields and restored project reproduce those inputs.
- A saved AC-2 assertion remains after resetting CSF. A no-match display filter still exports all 106 CSF outcome rows once a scoped assessment is recorded. Unsaved owner edits survive internal navigation.
- A mocked UTC clock of 2027-02-04 initialises that risk-analysis date. Changing the pending date to 2027-02-08 does not relabel an already analysed/exported snapshot.
- A privacy processing activity and individual-harm finding produce a source-linked implementation action and report row. 1.0 records remain distinct from the 1.1 IPD view.
- A generated nine-record seven-stage plan has RACI/source links. A dependency cycle is rejected. Validation without a passed test/evidence/reviewer/progress is rejected. Baseline and scheduled dates remain reproducible after valid validation recording.
- NIST data loads from its local asset, baseline counts match official membership, and changing confidentiality to High does not silently change the selected Low baseline. Privacy selection is separate.
- Unit tests reproduce weighted/unweighted maturity including explicit zero, unassessed and justified exclusions; reject invalid bounds; assert resource/calendar/dependency constraints; reject false expansion metadata; and retain immutable report inputs after source mutation.

Initial failures were retained and corrected, not suppressed: a test attempted export immediately after a deliberate reset with no recorded assessment; an old navigation test toggled an already-open tools group closed; a source label selector was ambiguous; and an accessibility sweep needed adequate time for two themes. Fixtures were corrected to exercise their intended states, all assertions retained, and the full suite rerun. Security scan S1 required a real dependency upgrade and schema migration before passing.

## Four review perspectives and correction cycles

These are explicitly simulated critical review passes by the implementation agent, not claims of four independent human sign-offs.

| Perspective / finding | Priority | Concrete correction | Retest / status |
| --- | --- | --- | --- |
| Product: peer navigation obscures the first useful action | P1 | Six workflow destinations, overview CTA, search, tutorial and continuation | Route, tutorial, search and mobile workflow tests pass |
| Product: unsaved edits and organisation changes lose context | P0 | Shared drafts, per-case projects, explicit recovery/export/expiry/delete | Draft, recovery and case-isolation tests pass |
| GRC: cross-framework reset and filtered exports alter the assessed population | P0 | Scoped resets and complete selected-scope export rows | Cross-framework and 106-row CSV regressions pass |
| GRC: fixed/pending date can misstate analysis age/overdue results | P0 | UTC initial date and separate analysed date used by charts, boardroom and exports | Mock-clock and snapshot-date regression passes |
| GRC: selected profile, maturity, Tiers and assurance need distinct denominators/meaning | P1 | Versioned X1 rubric, eligible population, separate SP 1302 components, verification state and explicit limitations | Boundary/manual-reproduction/source tests and profile journey pass |
| GRC: chart drill-downs could include excluded/unassessed items outside the displayed eligible count | P1 | Shared cohort filters for gaps/evidence/confidence; separate control-exclusion state; baseline reference drill-down | Eligibility boundary assertions and framework browser flows pass |
| GRC: report output read live weighting/currency after generation | P0 | Snapshot rubric, currency, resources, calendar and task inputs | Source-mutation and recovery reconciliation tests pass |
| GRC: an older editor draft could overwrite later risk/task relationships | P1 | Preserve stable finding identity and live relationship fields; check task/source backlinks | Stale-draft edit and privacy-action regressions, plus pure-engine test pass |
| GRC: printed reports omitted NIST system control decisions | P1 | Add snapshot-based control state distribution and source/evidence tables to screen and print reports | Complete control-evidence→task→executive export workflow passes |
| UX: resource settings pushed the Gantt below a long input table | P2 | Keep start/budget visible and disclose calendar/capacity/rate settings on demand | Planning workflow, accessibility and screenshots reviewed |
| GRC: actions and implementation could be mistaken for validated effectiveness | P1 | No automatic score change; validation prerequisites and separately reviewed control decisions | Negative and positive validation paths pass |
| Application security: newly introduced vulnerable validator | P1 / high advisory | Upgrade to Zod 4.6.7 and migrate strict schemas | Audit zero high/critical; all schema tests pass |
| Application security: XLSX bounds cannot trust metadata alone | P1 hardening | Header checks, bounded actual inflation, worker isolation/timeout, formula rejection | Real workbook round trip and malicious metadata rejection pass |
| Application security: typed UI casts must not trust imported lab drafts | P1 | Strict per-lab draft schemas and recorded-record/reference validation | Malformed JSON rejection and unchanged-project assertion pass |
| UX/accessibility: source-ID comma editing discarded trailing delimiters | P1 | Preserve typed delimiters and normalise on blur | Task/RACI/source edit workflow passes |
| UX/accessibility: fresh projects showed a misleading unsaved-work warning | P2 | Initial-state digest and clear saved-copy/recovery labels | Overview screenshots and recovery workflow reviewed |
| UX/accessibility: calendar field could not retain partial comma-separated dates | P1 | Shared text draft and explicit Apply working calendar validation | Calendar/domain and planning workflow tests pass |
| UX/accessibility: dense overview and tiny mobile dashboards | P1 | Readable scoped tokens, calm start, drawer/stacked views and table alternatives | Dark/light axe, viewport checks and real screenshots reviewed |

No unresolved critical/high change-specific finding remains in these review passes. Moderate inherited dependency records, limited manual assistive-technology coverage, static hosting header constraints and specialist-content breadth remain documented rather than hidden. Cross-browser and deployment status must be updated from genuine CI outcomes. Local browser runs performed concurrently with large screenshot captures also encountered two lazy-load/accessibility timeouts; those were retained as execution failures. The subsequent standalone full run passed all 41 tests without assertion changes.

## Local bundle and loading observations

The latest production build emits the academy core at 228.74 kB minified / 71.67 kB gzip, a separately requested 2.87 MB NIST JSON asset (397 kB gzip), and lazy ExcelJS/parser-worker chunks around 940–944 kB. The build retains its large-chunk warning. The actual screenshot run observed 10 initial home resource requests, with no NIST catalogue, ExcelJS or worker request, and no page errors. These measurements are local build/loading evidence, not a production Core Web Vitals or Lighthouse score.
