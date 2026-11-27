# X1 learning, assessment and authentication review

## Framework coverage

Publisher editions and legal references checked on 27 November 2026. The [prior accuracy report](../x1-academic-accuracy.md) records the control sources, editions and legal dates in more detail.

| Framework | Verified and implemented | Coverage limits |
| --- | --- | --- |
| [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) | 20 families, 1,196 catalogue entries including withdrawn entries, parent/enhancement lineage, SP 800-53A procedures and separate Low, Moderate, High and Privacy baseline memberships. The Learn guide covers selection, tailoring and POA&M. | Publisher control text and procedures are available for all active entries. Original examples remain selected. |
| [NIST CSF 2.0](https://doi.org/10.6028/NIST.CSWP.29) | Six Functions, 22 Categories and 106 Subcategories. Current and Target Profiles, separate Tier choices and a six-step interactive guide. | X1 uses group-level evidence guidance and selected examples. CSF outcomes are voluntary and Tiers characterise risk governance and management practices. |
| [NIST AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1) | Four Functions, 19 Categories, 72 Core Subcategories and a fictional merchant-fraud case. Browse official outcomes by function and category. Learn and assess bias, privacy, explainability, reliability, monitoring and dependencies. | Outcome text comes from the description fields of the [official Playbook JSON](https://airc.nist.gov/docs/playbook.json). Category captions and X1 practice prompts are editorial. Playbook recommendations are separate and optional. NIST is revising 1.0. |
| [ISO/IEC 27001:2022](https://www.iso.org/standard/27001) and [Amd 1:2024](https://www.iso.org/standard/88435.html) | Clauses 4–10, subclause review prompts, 93 individually mapped Annex A prompts, scope and risk treatment, separate SoA decisions and exported review data. | ISO retains the normative wording and conformity criteria. Buy or consult licensed material for those. |
| [PCI DSS v4.0.1](https://www.pcisecuritystandards.org/document_library/?class=pcidss&doc=pci_dss) | 12 principal requirements, 63 objective-level original review prompts, 250 detailed identifiers, nesting and selected requirement-specific test examples. | The published testing and applicability notes and additional appendix requirements remain with PCI SSC. Detailed practice examples are limited to selected items. |
| [DORA](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng) | Nine chapters and all 64 article references and browseable base text. Selected applied assessment duties and current scope, regime, classification and resilience guidance. | Applicable RTS and ITS are linked separately. X1 does not provide article-by-article applied assessment or a complete independent RTS/ITS crosswalk. |
| [GDPR and corrigenda](https://eur-lex.europa.eu/eli/reg/2016/679/) | 11 chapters, all 99 article references and browseable base text. Selected applied questions cover purposes, rights, RoPA, DPIA, processor and breach duties. | See EUR-Lex for amendments, corrigenda and separate cross-border enforcement rules. X1 provides selected applied assessments. |
| [EU AI Act consolidated text](https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng) | 13 chapters, 113 original articles, six article insertions, Annexes I–XIII, actor and classification exercises, and amended effective dates. | The index links to the consolidated regulation. Applied questions cover selected duties. The workspace does not reproduce the consolidated article text. |

The DORA and GDPR reference copies are sourced from the Official Journal, via the public structured transcriptions at [revision 8801d38](https://github.com/CloudSecurityAlliance-DataSets/dataset-public-laws-regulations-standards/tree/8801d38f4d6d63d52b403fa0564865811c6e359c/regulation/europa.eu). EUR-Lex supplies the authentic versions, subsequent corrections and related measures.

## Workflows and exports

Each learning module includes an interactive workflow and downloadable text cheat sheet. Try Demo stays on the selected framework and view and uses a browser-local sample slot. Personal assessments stay in their existing slot. Creating a new personal assessment or plan asks before replacing saved work.

The Excel workbook contains seven sheets. It records a published edition, source date, official references, scope and applicability, mixed evidence and risk registers, and the calculations behind the results. Potential spreadsheet formulas in user-entered text are exported as literal strings. The implementation index averages only rated, applicable items. Coverage, evidence, risk and legal obligations are separate. The dependency-critical Gantt indicator identifies zero network slack. Working dates also reflect calendar and capacity.

## Authentication diagnosis and verification

A production sign-in log recorded successful password authentication followed by the owner authorization check. The confirmed account shown in the reported screenshot resolves to a different user ID from the existing publishing owner. Access stops before the MFA challenge. This feature branch has made no ownership change.

The proposed frontend uses Supabase password, enrolment, challenge and verification endpoints, returns a usable QR and manual setup option, and keeps pending enrolment credentials in memory. Reloading during enrolment requires sign-in again. A fresh enrolment can clean up this application's unverified factor. Verified factors are preserved. The browser stores the publishing session only after the server grants owner and AAL2 access. Session restoration checks the grant, refreshes when needed, and signs out safely after expiry or denial. Logout clears tab state and calls Supabase session sign-out. Existing access-token expiry remains managed by Supabase.

- An isolated browser build with a synthetic Auth server exercises accepted and rejected passwords, non-owner denial, first-time enrolment, QR display, incorrect and expired TOTP, fresh challenges, direct protected navigation, refresh, expiry, logout and a second sign-in.
- Production SQL read-only checks confirmed that the configured owner is recognised, AAL1 is denied publishing, AAL2 is accepted for that owner and AAL2 is denied for the other confirmed account. Publishing RLS is enabled and three protected storage policies reference the publishing gate.
- The [PostgreSQL policy suite](../../tests/publishingPolicy.test.ts) covers denied draft mutation and upload for anonymous, non-owner and owner AAL1 roles, permitted owner AAL2 publishing, and protected draft image reads. It uses synthetic data.
- A live owner-assisted session is still needed to validate the actual account selection, TOTP enrolment and verification, and an authorised publish with a cover upload. The owner binding remains a separate approval decision.

[NIST AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/) · [Supabase MFA API](https://supabase.com/docs/reference/javascript/auth-mfa) · [Supabase TOTP workflow](https://supabase.com/docs/guides/auth/auth-mfa/totp)
