# arharif.github.io

A React and TypeScript site containing the professional gateway, published content, games, administration and X1 Academic. The academy is rooted at `/x1-academic` and adds connected learning, fictional case studies and five interactive laboratories for cybersecurity, governance, risk and AI.

Use Node.js 24 and npm. Install with `npm ci`, then run `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`. Local academic learning works without credentials. Optional Supabase setup for the original site is documented in [the onboarding guide](docs/ONBOARDING_GUIDE.md).

Run `npm run lint`, `npm test` and `npm run build`. The build includes static academic route documents, lesson text, canonical metadata and an extended sitemap. Run `npm run test:e2e` after building, with system Chromium or Playwright Chromium installed. Run `npm run check:links` to update the source reachability report.

The academy opens through four expandable workspaces: Explore Standards, Assess & Simulate, Implement and Security Mindmap. It includes 26 source-linked catalogue records, interactive framework architectures and fictional assessment demos, a full 106-outcome NIST CSF 2.0 explorer, the versioned NIST SP 800-53/53A catalogue and 53B baselines, local Excel/CSV risk analytics, privacy assessment, knowledge graphs, reproducible AI evaluation, synthetic incidents and executive decisions. Seven modules are published within the planned 36-module curriculum. The original Security Mindmap and published Academic Library are integrated and their legacy routes remain available. Explanations and the navigator operate locally; a hosted generative tutor is not implemented.

Risk data, findings and implementation tasks share one connected fictional project. Internal navigation preserves open work; explicit local save/restore or JSON export recovers it across refreshes. Local copies expire after 30 days. Excel parsing loads in a worker when needed. The implementation planner supports RACI, working calendars, resources, dependencies, baseline comparisons and editable day/week/month Gantt views. See the [premium standards delivery report](docs/x1-academic/PREMIUM_STANDARDS_DELIVERY.md) for current scope, testing and source-review limitations. Run `npm run check:standard-sources` for publisher reachability evidence; a reachable page does not itself verify an edition.

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
