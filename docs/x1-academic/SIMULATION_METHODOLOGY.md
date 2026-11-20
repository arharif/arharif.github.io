# Educational simulation methods

All organisations, events, evidence samples and decisions are fictional educational scenarios. No lab performs a security action or predicts actual organisational outcomes.

## Framework assessment

The complete 106-outcome CSF Core, three SP 800-53 base-control summaries, three ISO clause/theme topics and twelve PCI DSS high-level requirements form the available teaching scopes. Status records contain notes, evidence reference, owner and exclusion justification. An evidenced assertion requires a reference and owner. Exclusion requires justification. Counts describe the register. There is no aggregate compliance percentage. Independent sampling remains a recommended follow-up, even when a learner asserts implementation.

## Risk decision

Likelihood and impact are ordinal integers 1–5 over an explicit twelve-month planning horizon. The default index is L × I. The alternative is max(L,I)². Categories are Low 1–4, Moderate 5–9, High 10–16 and Critical 17–25. These intervals teach prioritisation and are not expected loss bands. Case tolerances are illustrative fixed indices. Switching models changes the meaning of tolerance, intentionally exposing method sensitivity.

Control selection does not subtract a percentage from risk. Learners supply residual ratings and evidence assumptions separately. Recommendations include treatment, authority, reasoning and review trigger. Above-tolerance acceptance requires escalation through governance. The software does not approve risk.

## Incident investigation

The synthetic 09:02–09:12 sequence joins a new-device login, the same supplier session, an unapproved configuration change and an owner confirmation. Backup completion and an unrelated test-account failure are authored noise. Evidence relevance is known only within this exercise. Responses use explicit relevant-evidence count thresholds 0–3. Premature choices remain visible in the report with explanation. No count is a statistically calibrated forensic-confidence measure. Classification and severity are learner judgements. Recovery needs owner-led validation. Industrial isolation is an approval request requiring operational and safety review.

## AI experiment

Generator v1 creates 400 records using an LCG. State updates as `(1664525 × state + 1013904223) mod 2^32`, beginning with seed 42. Each record draws one noise sample in [0,1). The first round(400 × prevalence/100) records are positive. Base scores are 0.62 for positives and 0.26 for negatives. Noise contributes `(u − 0.5) × 0.9`. Useful features add or subtract `min(features,6) × 0.025`. Shift subtracts `shift × 0.035` for positives and adds `shift × 0.025` for negatives. Training mode adds ±0.2 by label, illustrating optimistic evaluation or leakage. Holdout mode adds `max(0,features−6) × (u−0.5) × 0.1` noise. Scores are clipped to [0,1].

A score at or above the threshold is predicted positive. Counts determine precision, recall, F1 and false-positive rate. Zero denominators use zero, with counts available for interpretation. Twenty-one sampled threshold points provide a full numeric alternative to the chart. Comparisons retain up to four configurations. Reports include generator version, seed, parameters and counts. No trained model, empirical research result, confidence interval or privacy guarantee is claimed. Privacy and leakage experiments explain principles through optimistic score assumptions, with no actual privacy attack or private data.

## Executive decisions

Initiatives cost 20–35 fictional capacity units, with starting case budgets of 80–100, adjustable by learners from 25–150. Each has a declared duration, dependency and illustrative exposure/evidence index contribution. Portfolio cost and point totals are additive. Delivery time is the maximum selected duration under a parallel-staffing assumption. Real dependencies and limited staffing can invalidate this simplification. Independent sampling adds evidence-readiness points without implementing controls. The exported roadmap preserves selection order. No export is enabled for an over-budget portfolio.

The committee and executive checks identify keyword cues in six topics. They report topic coverage and missing areas. They cannot assess truth, logical quality or professional competence. Human review is required for substantive judgement.

## Outputs and portability

Reports include a title, scenario ID, organisation, timestamp, method, selections, results, uncertainty and disclaimer. JSON preserves structured data and acts as contextual case-state input in another lab. CSV quotes values and neutralises formula prefixes. Browser print includes the expanded report content for saving to PDF. No dedicated PDF renderer is installed. Never label these documents as validated organisational evidence.

## Multi-record risk register

The register fixes L × I as its index. Each rating is an integer 1–5. Categories use Low 1–4, Medium 5–9, High 10–16, Critical 17–25; Medium is the same band called Moderate in the original decision simulator. Missing residual ratings default to inherent, with no implied control benefit. Closed risks are excluded from active exposure, matrix, category counts and coverage denominators. Closure is a workflow status, not verified risk elimination. Total exposure is an ordinal sum, not expected loss or currency. Counts, ratings, dates, owners and evidence references come only from the selected scenario or learner inputs.

Overdue = non-closed reviewDate earlier than analysisDate. Missing review dates are excluded from overdue and remain visible in records. Age = max(0, UTC calendar days from openedDate to analysisDate), with 0–30, 31–90, 91+ and unknown groups. Control/evidence coverage means nonempty reference presence only. Counts by owner/unit use Unassigned for missing values. Treatment progress counts entered statuses and does not infer effectiveness.

Analyse creates an immutable-by-copy snapshot. Draft edits trigger a visible stale-analysis notice; charts and exports keep the prior snapshot until reanalysis. Export CSV/Excel contains all analysed records, independent of chart filtering. Dates and source labels accompany exports. Reports distinguish fictional scenario, edited scenario, learner upload and mixed provenance. Excel reads the first sheet. Required fields are ID, asset, threat, likelihood and impact. Validation is atomic; errors include worksheet row numbers. Up to 2000 records, 80 columns and 3 MB per file are accepted. Formula cells are rejected; Excel exports use literal strings, and CSV formula prefixes are neutralised.

Dated observations are entered separately, with a risk ID, date, residual ratings and a source/assumption note. Duplicate risk/date pairs are rejected. A same-risk line is shown only for at least two points, with proportional UTC date spacing. Connecting points does not assert unobserved intervening values. Observations do not update the current register. They are included in the JSON report and have a separate CSV export. They are retained in tab memory during internal navigation.

The boardroom reads the last analysed risk snapshot or the selected fictional baseline, plus saved learner control assessments. Initiative teaching points do not subtract from risk-register ratings. No historical KPI trend, independently verified assurance or financial loss forecast is fabricated.

## Contextual learning guide

Curated local explanations are keyed to selected metrics, graph concepts, outcomes, events, actions and experiment results. Beginner, practitioner and executive views expose definition, methodology or decision relevance. The guide supplies interpretation, analogy, technical/business examples, sources and next steps. It is not a generative model or a professional decision authority.
