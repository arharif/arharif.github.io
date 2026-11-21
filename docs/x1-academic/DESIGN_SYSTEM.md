# Academic workspace interface

> Historical release record. The current connected-studio implementation, methods, sources, security findings and executed checks are documented in [v2/IMPLEMENTATION_REPORT.md](v2/IMPLEMENTATION_REPORT.md) and its linked reports. The older scope/retention statements below describe their original revision.

The academy uses a navy/mint palette, slate panels, violet AI accents, semantic severity colours, a system sans-serif font and a parallel light theme. Styles remain scoped to `.xa`. All status categories have text and numeric labels; colour is supplementary.

Desktop uses a persistent left navigation, central workspace and right contextual learning panel. Below 1190px the guide becomes an explicitly closable drawer; below 700px navigation opens from a Menu button. Mobile dashboards stack; KPIs use two readable columns, tables scroll inside their container, and the graph provides concept buttons plus a full outline. On desktop, SVG graph nodes have keyboard equivalents and do not interfere with canvas panning.

The shared chart primitives are KPIs, segmented donut/legend, 5×5 heatmap, horizontal bars, progress, threshold curves and dated observations. Buttons/legends provide exact values and selection actions. ROC/PR data tables and confusion counts accompany graphics. Risk analysis uses an explicit snapshot so draft edits cannot silently change an exported result. A dedicated print layout uses the analysed snapshot and excludes workspace controls and display filters.

The learning panel includes selected-element meaning, methodology, interpretation, analogy, technical and business examples, sources and recommended actions. Beginner/practitioner/executive options expose different explanatory perspectives. It uses local editorial data and describes that capability accurately.

Automated checks cover dark/light WCAG A/AA rules on nine academy experiences, 320px and 768px layout bounds, mobile navigation, keyboard controls and a 390px analysis/guide/filter workflow. The first review found insufficient light-mode active-nav contrast, standalone-link target-size issues and an obstructive intermediate-width drawer. Those were corrected and checked again. Desktop screenshots at 1600px and a 390px mobile screenshot are included in the implementation report. Automated checks do not substitute for a screen-reader audit or claim complete WCAG conformance.
