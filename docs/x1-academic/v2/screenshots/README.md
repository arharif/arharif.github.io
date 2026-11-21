# Actual browser review captures

These are screenshots of functioning local production builds. No screenshot is used as a dashboard or substituted for an implemented feature. No image generation or image editing was used.

| Capture | Build / input |
| --- | --- |
| `before-overview-desktop.png`, `before-overview-mobile.png` | Isolated worktree of production baseline `4259b8c`, 1600×1000 and 390×844 viewports |
| `after-overview-dark-desktop.png`, `after-overview-light-desktop.png`, `after-overview-mobile.png` | New build; initial empty fictional project; light/dark and 390px layouts |
| `after-csf-profile-desktop.png`, `after-csf-profile-mobile.png`, `after-csf-charts.png` | Six explicitly entered CSF Current Profile levels `[1,2,2,1,1,0]`, target 3 for each; no evidence falsely labelled tested; mean 7/6 |
| `after-implementation-desktop.png`, `after-gantt-desktop.png`, `after-gantt-detail.png` | Six explicitly created profile actions and nine generated lifecycle tasks/gates. Start 2026-12-01; configured estimates and resource constraints. Component capture uses a taller viewport so a sticky header does not obscure its rows |
| `after-executive-report.png` | Immutable report from that point in the exercise, before the privacy finding was entered |
| `after-privacy-desktop.png`, `after-privacy-flow.png` | Fictional payment processing activity, a 3×3 individual-harm judgement and an explicitly linked action; no automatic mitigation score change |
| `after-nist-controls-desktop.png` | Official local NIST catalogue and selected Low baseline; defaults visibly remain unreviewed |
| `after-risk-desktop.png` | Default fictional register after explicit Analyse risks; current UTC analysis date and contextual explanation |
| `after-graph-desktop.png` | Expanded curated concept clusters and accessible navigation |
| `after-ai-desktop.png` | Seeded 400-row synthetic evaluation and calculated default configuration metrics |

The complete worked project is [fictional-connected-project.json](../examples/fictional-connected-project.json). Download the JSON, choose Import project JSON in Project recovery, and inspect the declared scope/ratings/actions. It is an educational artifact, not organisational evidence. Its contract and calculations are exercised by the unit suite.

To reproduce the after captures: build, serve `dist` on port 4176, then run `node scripts/capture-academic-review.mjs`. `X1_REVIEW_ORIGIN` can identify the local server. The script enters inputs through browser controls and exports the example through the same project export UI. It resets scroll/focus before full-page captures. Baseline captures were taken from the isolated baseline build, with no production change.

`browser-evidence.json` records the capture run's page errors and initial home resource observations. The home did not request the NIST catalogue, ExcelJS or its worker. This is a local loading observation, not a live-site performance score.
