# arharif.github.io

A React and TypeScript site containing the professional gateway, published content, games, administration and X1 Academic. The academy is rooted at `/x1-academic` and adds connected learning, fictional case studies and five interactive laboratories for cybersecurity, governance, risk and AI.

Use Node.js 24 and npm. Install with `npm ci`, then run `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`. Local academic learning works without credentials. Optional Supabase setup for the original site is documented in [the onboarding guide](docs/ONBOARDING_GUIDE.md).

Run `npm run lint`, `npm test` and `npm run build`. The build includes static academic route documents, lesson text, canonical metadata and an extended sitemap. Run `npm run test:e2e` after building, with system Chromium or Playwright Chromium installed. Run `npm run check:links` to update the source reachability report.

The academy now opens into an interactive workspace with a contextual explanation panel. It includes a local Excel/CSV risk register, analysis and treatment simulator, a full 106-outcome NIST CSF 2.0 explorer, selected SP 800-53 / ISO 27001 / PCI DSS teaching scopes, an interactive knowledge graph, reproducible AI evaluation, a synthetic incident lab and a budget decision boardroom. Three modules are published within the planned 36-module curriculum. Explanations and the navigator operate locally; a hosted generative tutor is not implemented.

Risk data and assessments stay in tab memory and survive internal navigation. Refreshing or closing the tab clears unsaved lab work. Export first. ExcelJS loads only when using Excel files. See the [interactive workspace implementation report](docs/x1-academic/INTERACTIVE_WORKSPACE_REPORT.md) for exact scope and validation.

- [Architecture, data contracts and route inventory](docs/x1-academic/ARCHITECTURE.md)
- [Design and accessibility](docs/x1-academic/DESIGN_SYSTEM.md)
- [Content authoring and resource review](docs/x1-academic/CONTENT_GUIDELINES.md)
- [Framework sources and verification status](docs/x1-academic/FRAMEWORK_SOURCES.md)
- [Simulation calculations and limitations](docs/x1-academic/SIMULATION_METHODOLOGY.md)
- [Security review](docs/x1-academic/SECURITY_REVIEW.md)
- [Executed test report](docs/x1-academic/TEST_REPORT.md)
- [Development, testing and deployment checklist](docs/x1-academic/RELEASE_CHECKLIST.md)
- [Remaining product scope](docs/x1-academic/ROADMAP.md)

All case companies and generated security evidence are fictional. The academy creates educational reports from learner selections. Its simulations provide practice with explicit assumptions and do not establish real compliance, operational safety or professional certification.
