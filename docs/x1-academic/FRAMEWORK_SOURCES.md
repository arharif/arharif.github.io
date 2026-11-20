# Framework and source register

Workspace review: 20 November 2026. The earlier blocked seed-link sweep remains in LINK_REPORT.json as historical evidence; it is not a current source verification claim.

| Assessment scope | Edition / source | Implemented scope |
| --- | --- | --- |
| NIST CSF | [2.0, February 2024](https://doi.org/10.6028/NIST.CSWP.29) | Complete Core hierarchy: 6 Functions, 22 Categories, 106 outcomes, with official implementation examples from the OSCAL source |
| NIST SP 800-53 | [Rev. 5 / release 5.2.0](https://csrc.nist.gov/news/2025/nist-releases-revision-to-sp-800-53-controls) | Original summaries of AC-2, AU-6, IR-4 base controls; enhancements and complete testing procedures are outside scope |
| ISO/IEC 27001 | [2022](https://www.iso.org/standard/27001), [Amd 1:2024](https://www.iso.org/standard/88435.html) | Three educational clause/theme summaries, not licensed requirements or a complete Annex A catalogue |
| PCI DSS | [v4.0.1, June 2024](https://www.pcisecuritystandards.org/document_library/) | 12 high-level requirement summaries; not full subrequirements, a SAQ, ROC or applicability determination |

The CSF source snapshot is `src/academic/data/csf-catalog.json`, reduced from [NIST's OSCAL catalogue](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/CSF/v2.0/json/NIST_CSF_v2.0_catalog.json), retrieved 2026-11-20. It records catalogue encoding version 1.2.1 and the original file SHA-256. This encoding version is distinct from framework version 2.0. Official outcome statements and examples are retained; local titles, evidence suggestions, business examples, gap prompts and assessment guidance are educational editorial content. The U.S. Government NIST material is attributed to NIST; local suggestions are not NIST-prescribed evidence requirements.

Evidence suggestions are contextual prompts. No evidence is prepopulated as an assessment result. Reviewed counts include recorded statuses and justified exclusions. No maturity score, certification or NIST compliance percentage is inferred. The initial four CSF summaries remain in the old data module for compatibility and provide short titles/context to the full catalogue.

The two comparison relationships are curated interpretations with partial overlap, not official equivalent mappings. Other inherited frameworks remain available through the framework reference catalogue; they have no assessment hierarchy in this increment and retain their explicit edition-review caveats. ISO-prefixed IDs denote local clause/theme navigation topics.

The publisher pages for SP 800-53 release 5.2.0 and ISO amendment metadata were checked using public search during this implementation. This does not constitute an independent review of every control or every inherited framework edition. Production use requires qualified scope, licensing and effectiveness review.
