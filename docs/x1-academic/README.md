# X1 Academic engineering and learner documentation

## Reference-based Academy

The Academy front page leads to Explore Standards, Assess & Simulate, and Implement & Plan. Each completed demo has its own editable fictional project. Returning to the learner project restores its open data. The original design references are served from `/x1-academic/reference-images/`.

| Assessment | Edition and coverage |
| --- | --- |
| NIST CSF | [CSF 2.0](https://doi.org/10.6028/NIST.CSWP.29). The local Core contains 106 publisher outcomes across 6 Functions and 22 Categories. |
| ISO/IEC 27001 | [2022](https://www.iso.org/standard/27001) and [Amendment 1:2024](https://www.iso.org/standard/88435.html). The index covers clauses 4–10 and 93 Annex A controls with original educational descriptions. Refer to the licensed text for requirements. |
| PCI DSS | [4.0.1](https://www.pcisecuritystandards.org/document_library/?class=pcidss&doc=pci_dss). The index covers 250 numbered requirements across 12 groups and 30 conditional appendix entries. IDs were checked against the [publisher document hosted by Western University](https://commerce.uwo.ca/pdf/PCI-DSS-v4_0_1-2.pdf) and [the public OSCAL index](https://github.com/ComplianceAsCode/oscal-content/tree/main/catalogs/pcidss_4). Requirement and testing text remain with the publisher. |

The Playwright comparisons cover the [desktop dashboards](reference-review/desktop.png), [mobile layouts](reference-review/mobile.png) and [remaining reference screens](reference-review/additional-references.png). The before images use GitHub `main` at `a34e5af`.

Build with `npm run build`, start the repository's local Pages fixture with `node scripts/serve-pages.mjs`, and run `node scripts/capture-x1-rebuild.mjs` for desktop, mobile and light-theme Chromium captures. The capture focuses on the rendered workspaces and loads samples through their real UI.


The current X1 Academic 2.0 delivery is documented in [the implementation report](v2/IMPLEMENTATION_REPORT.md).

The latest premium overview, expanded standards explorer and framework-specific Gantt increment is documented in [the delivery and review report](PREMIUM_STANDARDS_DELIVERY.md).

- [Baseline audit and prioritised plan](v2/AUDIT_AND_PLAN.md)
- [Architecture, calculation methodology, components and learner recovery guide](v2/ENGINEERING_AND_LEARNER_GUIDE.md)
- [Framework authority/version register and source hashes](v2/FRAMEWORK_SOURCE_REGISTER.md)
- [Security findings, remediation and future backend boundary](v2/SECURITY_REVIEW.md)
- [Executed checks and four-perspective correction cycle](v2/VALIDATION_AND_REVIEW.md)
- [Actual before/after screenshots](v2/screenshots/)

Earlier reports remain historical records for their original revisions; they do not override the version-2 contract.
