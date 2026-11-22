# X1 Academic workspace review

The main-site navigation opens `/x1-academic` directly. Each of the three expandable choices opens a workspace with NIST CSF 2.0, ISO/IEC 27001 or PCI DSS selected. Try Demo opens a fictional project for that standard. A visitor can edit the demo, switch back to their personal project, export either one, and reload it later. The project menu asks before replacing existing work.

## Visual evidence

Each capture below comes from the production build in Chromium with a 709-pixel-wide viewport. The height and theme follow the corresponding supplied PNG. Focus dashboard is a normal workspace action that frees the available space for the dashboard. The filenames correspond to the order in the reference ZIP.

| Reference | Viewport | Rebuilt view and comparison |
| --- | --- | --- |
| 01 · Cyber risk | 709 × 480 | [Score ring, heat map, trend and treatment register](captures/01-cyber-risk.png). The coloured bands and pointer encode the project's residual risk scale. The photographed monitor surround is omitted. |
| 02 · Knowledge graph | 709 × 464 | [Explorer, relationship canvas and inspector](captures/02-knowledge-graph.png). Shared owner and evidence relationships add cross-links to the framework hierarchy. Each connection comes from a catalogue or project record. |
| 03 · NIST assessment | 709 × 451 | [Profile banner, KPI cards, function grid and insights](captures/03-framework-profile.png). The first capture overflowed to 1,000 CSS pixels. The final grid fits the 709-pixel width, including its right-hand insight panel. |
| 04 · Risk matrix | 709 × 412 | [Severity strip, matrix, aging plot, gauges and trend](captures/04-risk-matrix.png). The matrix uses the project's five likelihood and five impact levels. |
| 05 · AI experiment | 709 × 361 | [Experiment selector, threshold curve and confusion matrix](captures/05-ai-experiment.png). A synthetic holdout sample supplies the chart, matrix cells and metrics. |
| 06 · Executive dashboard | 709 × 440 | [Six-panel GRC dashboard](captures/06-executive.png). The final pass paired the profile and severity bars, register, evidence table and findings with their charts to match the reference's panel density. |
| 07 · PMO | 709 × 720 | [Gantt, Kanban, assignments, milestones and cost](captures/07-project-dashboard.png). Shorter Gantt rows and a more compact budget plot made room for the project indicators. The cost curves show scheduled cost and earned value from recorded task progress. |
| 08 · Data flow | 709 × 456 | [Inventory rail, four stages and connected systems](captures/08-data-flow.png). Editable transfers determine the curves. |
| 09 · Governance | 709 × 418 | [Scope selectors and three governance charts](captures/09-governance.png). Current and target scores, detail callouts and the category sector come from the selected scope. |

The [capture manifest](captures/manifest.json) records dimensions, theme, workspace and measured document width for each reference. All nine measured widths are 709 pixels. The [desktop entry at 1440 × 900](captures/home.png) and [mobile risk workspace at 390 × 844](captures/mobile.png) include normal navigation.

## Data and compatibility

- The NIST workspace uses all 106 outcomes in the repository's CSF 2.0 Core snapshot. ISO uses original educational summaries for clauses 4–10 and selected topics. PCI covers the 12 high-level requirement summaries.
- The 0–4 assessment scale is an X1 educational rubric. Current maturity averages rated controls. Targets use the scoped controls. Evidence verification and findings are editable records.
- Risk controls reuse the existing risk calculation, import validation and bounded XLSX worker. A treatment projection changes the assumed likelihood. The gap simulation calculates the maturity effect of bringing the largest selected gaps to target.
- Planning reuses the working-day, resource-capacity and dependency scheduler. A gap can create a traceable remediation task. Completion and evidence review are separate decisions.
- Existing bare dashboard bookmarks open equivalent rebuilt views. Deep links with historic record identifiers, older editions and saved v2 projects retain their editors. **Previous Academy projects** opens those projects from the new home and project menus. New projects use separate per-framework storage keys.

## Reproduce the checks

Use Node 24 and the repository's installed dependencies. The Playwright configuration starts the production Pages fixture for the test suite.

```sh
npm run lint
npm test
npm run build
npm run test:e2e -- --project=chromium
```

To reproduce the screenshots, keep the first command running and execute the second in another terminal.

```sh
node scripts/serve-pages.mjs
node scripts/capture-academic-console.mjs
```

The [workspace browser tests](../../../tests/e2e/console.spec.ts) exercise every standard and demo entry, edit propagation, evidence changes, remediation, imports, project recovery, dependency dates, Kanban movement, themes, accessibility and responsive layouts. The existing regression suite also covers educational content, historical projects, exports and Pages fallback.
