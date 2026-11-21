# X1 Academic 2.0 implementation and product review

Review date: 21 November 2026. Baseline production revision: `4259b8cb55b9364ee5dc9c1c216ec7085c52f6d5`. Implementation branch: `feat/x1-academic-2-connected-studio`. The final revision is identified by the pull request, CI run and deployment manifest; this document deliberately does not predict a future commit hash.

## Product result

The academy now connects a scoped CSF Current/Target Profile to a risk relationship, remediation task, dated implementation plan, validation record and immutable executive report. Privacy processing/harms and NIST system-control decisions use the same project, task and reporting model. The original risk, AI, incident, boardroom, graph and learning routes remain available.

| Before | After |
| --- | --- |
| Thirteen peer navigation items and a dense first screen | Six primary destinations, calm overview, guided-assessment action, global search and breadcrumbs |
| Saved status assertions; unrecorded edits lost during navigation | Shared drafts, separate per-organisation projects, explicit local save/restore, JSON project round trips and expiry/deletion |
| One framework reset could erase another | Reset only touches the selected framework's saved assertions and drafts |
| CSV exports could follow hidden display filters or fall back to summary rows | Complete selected framework scope; report exports retain a detached snapshot |
| Fixed analysis date | Current UTC date initially, plus a separate immutable analysed date |
| No Current/Target Profile or transparent maturity engine | Scoped full CSF Core explorer, X1 0–4 rubric, eligible-population aggregates, radar/table alternatives, evidence and gaps |
| Three SP 800-53 teaching-control summaries | Separate official OSCAL engine: 1,196 records, 1,014 active controls/enhancements, 53A objectives/method prompts and four 53B baseline profiles |
| No first-class privacy workflow | Processing inventory, lifecycle, individual harms, separate inherent/residual judgements, edition-specific findings and linked actions |
| Boardroom portfolio estimates only | Seven-stage Implementation Studio, nine generated tasks/gates, editable RACI, working calendar, resource levelling, dependency/cycle logic, baseline and RAID |
| Three published lessons | Seven published modules, preserved planned curriculum labels, 19 curated resources |

## Demonstrated primary workflows

1. Start guided assessment, select the fictional case context and define scope/period. Incomplete scope or assessment input produces useful errors.
2. Assess a CSF outcome with independent current/target narratives, X1 rating rationale, owner, risk priority, evidence reference and learner-recorded verification/confidence.
3. Drill into Function/radar/evidence/gap records; link a register risk. Risks may also be created in the existing register, then linked from the profile. An action proposal changes neither risk ratings nor maturity.
4. Explicitly create a remediation action, edit its dates/RACI/resource assumptions, and view it in the working-calendar Gantt and exact schedule table.
5. Record implementation and validation separately. A validated task requires 100% progress, a passed test, evidence and a reviewer. Those fields remain learner assertions.
6. Generate a detached report. Assessment means, complete source records, resources/rates, calendar, task inputs, risk snapshot date, privacy findings, scope, rubric and limitations travel together.
7. Consent to an explicit fictional local save, refresh, restore the matching organisation, and reproduce the same findings and schedule. Export/import JSON is also available without browser persistence.

The privacy path records a processing activity, problematic data action and individual harm; the explicit action appears in the common Gantt/report. Switching 1.0/1.1 IPD views preserves but does not mix findings. The NIST system path separates impact categorisation, security-baseline choice and privacy applicability, and records tailoring, responsibility, evidence, assessment methods and remaining findings.

## Design and accessibility review

The supplied references informed the analytical workspaces: linked risk matrix/distributions, connected concepts, six CSF Functions, evidence-aware assessment figures, AI evaluation and implementation scheduling. The new landing page deliberately presents one clear starting action. Charts appear in the relevant workflow after inputs exist.

Desktop uses a collapsible sidebar and optional contextual explanation panel. Mobile has a navigation drawer, stacked inputs and scrollable labelled tables rather than shrunken desktop charts. Explanations use one academy-wide Beginner/Practitioner/Executive preference. Native details, form labels, keyboard-operable chart alternatives, reduced-motion support, a modal tutorial and useful empty states support progressive disclosure.

Real browser screenshots are in [screenshots](screenshots/); the previous overview is [before-overview.png](before-overview.png). Screens contain fictional, explicitly entered exercise inputs. They are browser captures, not generated mockups.

## Scope and remaining limitations

This is an educational local application, not a multi-tenant GRC system, certification service, trusted evidence vault or legal-conformity engine. No authenticated backend was added.

- The full machine-readable assessment content is CSF 2.0 and NIST 800-53/53A/53B. ISO/PCI remain original summaries and selected teaching scopes; a licensed exhaustive control catalogue is not claimed. Other standards have version-aware reference/lifecycle guidance and implementation project generation, not complete specialist simulators.
- Privacy tracks identify the governing edition of a processing/harms exercise. They are not a full machine-readable Privacy Framework Core, an automatic DPIA approval or a legal decision.
- Scope and task registers are editable; the generated seven-stage lifecycle is a starting template. It does not infer all requirements, effort or supplier prices from a framework name.
- Scheduling uses one global working calendar and exclusive task allocation per resource. It does not optimise a multi-resource project. Dependency-only CPM is explicitly distinct from the resource-levelled delivery schedule.
- Reporting checkpoints are real recorded summaries. They do not manufacture historical risk/maturity trends. Existing dated risk observations remain learner-entered.
- Browser saves are explicit and have a 30-day expiry checked on the next academy visit/restore. Browser storage is not an authenticated store. Refresh loses edits since the last save; deletion of a saved copy does not erase the open tab's project or unrelated learning progress.
- Chromium was tested locally. Firefox/WebKit downloads were blocked by the managed workspace; CI is configured to run all three, and its observed result must be read before claiming cross-browser success.
- No physical screen reader was available. Automated WCAG checks and keyboard interactions do not establish complete WCAG conformance.

See [engineering and learner guide](ENGINEERING_AND_LEARNER_GUIDE.md), [security review](SECURITY_REVIEW.md), [test/reviewer evidence](VALIDATION_AND_REVIEW.md), and [framework sources](FRAMEWORK_SOURCE_REGISTER.md).

## Prioritised follow-up

1. Publisher review/update process for changing editions, plus deeper original implementation content for licensed standards and full PF Core mappings where authorised.
2. Broader assistive-technology/manual testing, independent human content/GRC review and usability sessions with novice learners.
3. Per-resource calendars, additional relationship editing, richer explicit multi-period checkpoints and more sophisticated scheduling if demanded by real exercises.
4. A deliberate whole-site Router migration and server/CDN header strategy, avoiding unreviewed changes to unrelated public pages.
5. For confidential/multi-user use, build the separately secured backend architecture described in the security review before accepting such data.
