# Framework authority, edition and source register

Source review: 21 November 2026. Publication editions and machine-readable representation timestamps are separate. This register describes actual content scope, not certification authority.

## Machine-readable NIST engine

Authority: NIST. Edition: SP 800-53 / 53A Rev. 5; release 5.2.0. Release 5.2.0 published 2025-08-27. OSCAL representation modified 2026-10-22T11:30:00.00000-00:00; original files retrieved 2026-11-20.

Imported records: 1196 total; 1014 active; 20 families. The full existing CSF Core remains 6 Functions, 22 Categories, 106 outcomes.

Baseline membership is exact OSCAL `include-controls/with-ids`, including enhancements as distinct IDs; no implicit include-all expansion: LOW 149, MODERATE 287, HIGH 370, PRIVACY 96. Security and privacy applicability remain separate.

| Original source | SHA-256 |
| --- | --- |
| [NIST_SP-800-53_rev5_catalog.json](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json) | `64ca6b4161de51ab6af098a7d101d326f14c95e1abf721396cd8a049e8115eeb` |
| [NIST_SP-800-53_rev5_LOW-baseline_profile.json](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_LOW-baseline_profile.json) | `cfd4f5d9a192eb42dc04b745d82f95a85926a2a85a45418034a380a42bda9424` |
| [NIST_SP-800-53_rev5_MODERATE-baseline_profile.json](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_MODERATE-baseline_profile.json) | `e3a0f11237cfaac24dfcf1586e07683f17423757fd84208deb33196b12e8f590` |
| [NIST_SP-800-53_rev5_HIGH-baseline_profile.json](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_HIGH-baseline_profile.json) | `d2ef340986b9f1ee820ad866a0f964d9a9d1088b24080c74b795ddb0148b9f83` |
| [NIST_SP-800-53_rev5_PRIVACY-baseline_profile.json](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_PRIVACY-baseline_profile.json) | `c0e3d54d9f474bc6c33338a8e524bc52ad070f94f9274db7ec48242242fecacc` |

Control statements, discussion, objectives and method objects come from the official catalogue representation. Organisation-defined parameters remain explicit placeholders. Learner-authored implementation/test procedures and evidence references are not NIST-authenticated findings. Withdrawn records remain identifiable and are excluded from the active catalogue view.

The importer is `scripts/standards/import-nist.mjs`. Retain the five source files outside the application, rerun the importer, compare hashes/edition/membership/objective counts and test before an intentional source update. Upstream `main` can change; the hashes identify exactly what was reviewed for this snapshot. The application does not fetch an unpinned upstream catalogue at runtime.

## Publisher register and educational scope

The in-app unified register is `src/academic/studio/standards.ts`, and each record contains authority, edition/publication date, architecture, scoping, source-review status, audience, scenario, limitations and an implementation destination.

| Standard | Edition / publication | Source / scope |
| --- | --- |
| NIST CSF | 2.0; 2024-02-26 | [CSWP 29](https://doi.org/10.6028/NIST.CSWP.29). Full Core, Current/Target Profile. |
| CSF Tiers | SP 1302; 2024-10 | [SP 1302](https://doi.org/10.6028/NIST.SP.1302). Separate risk governance/management exercise; no maturity average. |
| SP 800-53 | Rev. 5, release 5.2.0; 2025-08-27 | [Official publication](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final); complete imported catalogue. |
| SP 800-53A | Rev. 5, release 5.2.0; 2025-08-27 | [Official publication](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final); objectives and examine/interview/test prompts from NIST OSCAL. |
| SP 800-53B | Rev. 5 / release 5.2.0; 2025-08-27 representation release, baselines unchanged | [Official publication](https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final); exact Low/Moderate/High/privacy profiles. |
| Privacy Framework | 1.0; 2020-01-16 | [NIST](https://www.nist.gov/privacy-framework/privacy-framework). Published-edition processing/harms exercise; not a full PF Core import. |
| Privacy Framework | 1.1 initial public draft; 2025-04-14 | [NIST project/status](https://www.nist.gov/privacy-framework/new-projects/privacy-framework-version-11). Publisher still advertises IPD at review; edition-specific records, not silently finalised. |
| ISO/IEC 27001 | 2022 | [ISO](https://www.iso.org/standard/27001). Original summaries and implementation lifecycle; no licensed full requirement text. |
| ISO/IEC 27002 | 2022 | [ISO](https://www.iso.org/standard/75652.html). Reference guidance; original implementation interpretation. |
| PCI DSS | 4.0.1; 2024-06 | [PCI SSC document library](https://www.pcisecuritystandards.org/document_library/). Twelve high-level teaching summaries, not a full assessment/certification catalogue. |
| NIST AI RMF | 1.0; 2023-01-26 | [NIST](https://www.nist.gov/itl/ai-risk-management-framework). Reference/lifecycle and synthetic AI experiment lab. |
| ISO/IEC 42001 | 2023 | [ISO](https://www.iso.org/standard/81230.html). Educational AI-management implementation scope. |
| ISO/IEC 27701 | 2025 edition, publisher metadata requiring licensed edition review | [ISO](https://www.iso.org/standard/iso-iec-27701). Reference/lifecycle only; no restricted requirements reproduced. |
| ISO 22301 | 2019 | [ISO](https://www.iso.org/standard/75106.html). Continuity reference/lifecycle. |
| GDPR | Regulation (EU) 2016/679; applicable 2018-05-25 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj). Applicability is a reviewed legal input; no automated conformity declaration. |
| DORA | Regulation (EU) 2022/2554; applicable 2025-01-17 | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2022/2554/oj). Scope/reference and implementation lifecycle, including need to review relevant RTS/ITS. |
| CIS Controls | v8.1; 2024-06 | [CIS](https://www.cisecurity.org/controls/v8-1). Reference/lifecycle, not an exhaustive reproduced safeguard set. |

## Verification and interpretation boundaries

Publisher search/pages were checked for the 5.2.0 release and Privacy Framework 1.1 status on 21 November 2026. NIST describes 5.2.0 as an August 2025 minor release; the 53B notice says baselines did not change. The PF publisher page continues to describe the April 2025 initial public draft. No later final edition is inferred from the calendar.

CSF source counts/IDs and imported NIST family/active/objective/baseline/provenance integrity are automated tests. Other publisher-linked records are educational metadata, not a representation that a full licensed document has been independently audited line by line. Standard adoption alone cannot establish certification, operating effectiveness, authorisation, legal conformity or independent assurance.
