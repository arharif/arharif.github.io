# X1 Elite release review

The November 2026 concept board guided the Academic framework cards and light trails, the Insights hero, the three-card Arcade and the advisory journey. The game illustrations and observatory artwork are original to X1. Onyx Black is the default. The same stored preference drives Mature White and Rainbow across all destinations, including the Arcade theme controls.

## Frameworks reviewed 27 November 2026

| Framework | Edition and application | Publisher |
| --- | --- | --- |
| NIST SP 800-53 | Revision 5, Release 5.2.0, issued 27 August 2025. The teaching catalogue includes SA-15(13), SA-24 and SI-2(7). The advanced catalogue includes SP 800-53A procedures and SP 800-53B baselines. | [NIST publication and release notes](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) |
| DORA | Regulation (EU) 2022/2554 applies from 17 January 2025. Applicability depends on the entity, the activity and the relevant technical instruments. | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2022/2554/oj), [ICT risk management RTS](https://eur-lex.europa.eu/eli/reg_del/2024/1774/oj), [incident reporting ITS](https://eur-lex.europa.eu/eli/reg_impl/2025/302/oj) |
| GDPR | Regulation (EU) 2016/679 has applied since 25 May 2018. Regulation (EU) 2025/2518 applies from 2 April 2027 and addresses cross-border enforcement procedure. | [EUR-Lex GDPR summary](https://eur-lex.europa.eu/EN/legal-content/summary/general-data-protection-regulation-gdpr.html) |
| EU AI Act | Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744. General application began on 2 August 2026. The amended high-risk dates are 2 December 2027 for Annex III and 2 August 2028 for AI in regulated products. The Learn workspace lists earlier duties and transitional dates. | [Consolidated act](https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng), [Commission enforcement timeline](https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act) |
| NIST CSF | CSF 2.0, issued 26 February 2024. Includes all 106 Core outcomes. | [NIST CSWP 29](https://doi.org/10.6028/NIST.CSWP.29) |
| ISO/IEC 27001 | 2022 edition and Amendment 1:2024 on climate change considerations. The workspace provides clause summaries and selected evidence examples. | [ISO 27001:2022](https://www.iso.org/standard/27001), [ISO Amendment 1:2024](https://www.iso.org/standard/88435.html) |
| PCI DSS | v4.0.1. Future-dated requirements took effect 31 March 2025, subject to applicability. The assessment uses high-level requirement summaries. | [PCI SSC v4.0.1 release](https://blog.pcisecuritystandards.org/just-published-pci-dss-v4-0-1), [PCI SSC current version consultation](https://blog.pcisecuritystandards.org/request-for-comments-pci-data-security-standard-pci-dss-v4-0-1) |

The X1 maturity score averages rated, applicable items on a 0–4 scale. Targets include all applicable items. Exclusions keep their rationale and stay out of those totals. Risk uses separately entered 1–5 likelihood and impact ratings. The demos use fixed scenario dates, authored values and fictional evidence. Generated Gantt tasks use gap points to estimate duration and effort. Users can edit task estimates, owners, priority, dependencies and milestones. CSV exports include plan dates, delays, evidence and validation status. The framework workspaces are educational and any applicable legal, assurance or certification criteria come from the publisher.

## Screenshots

| Screen | Desktop | Mobile |
| --- | --- | --- |
| Home | [1440 px](home-1440.jpg) | [390 px](home-390.jpg) |
| Academic | [1440 px](academic-1440.jpg) | [390 px](academic-390.jpg) |
| DORA demo | [1440 px](assessment-1440.jpg) | [390 px](assessment-390.jpg) |
| DORA remediation plan in Rainbow | [1440 px](plan-1440.jpg) | [390 px](plan-390.jpg) |
| Insights | [1440 px](insights-1440.jpg) | [390 px](insights-390.jpg) |
| Insights in Mature White | [1440 px](insights-white-1440.jpg) | [390 px](insights-white-390.jpg) |
| Arcade | [1440 px](arcade-1440.jpg) | [390 px](arcade-390.jpg) |
| Platform Adventure in play | [1440 px](play-1440.jpg) | [390 px](play-390.jpg) |
| Advisory journey | [1440 px](advisory-1440.jpg) | [390 px](advisory-390.jpg) |

## Performance

Median of three cold visits per viewport and route. The interaction value is the duration of the one scripted interaction in each visit.

| Route | Desktop LCP | Desktop interaction | Desktop CLS | Mobile LCP | Mobile interaction | Mobile CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 448 ms | 16 ms | 0.0000 | 1388 ms | 48 ms | 0.0000 |
| Academic | 568 ms | 32 ms | 0.0002 | 680 ms | 48 ms | 0.0000 |
| Assessment | 576 ms | 72 ms | 0.0170 | 700 ms | 192 ms | 0.0254 |
| Insights | 600 ms | 32 ms | 0.0000 | 1788 ms | 56 ms | 0.0000 |
| Arcade | 680 ms | 40 ms | 0.0000 | 1948 ms | 56 ms | 0.0000 |
| Advisory | 572 ms | 56 ms | 0.0000 | 1596 ms | 80 ms | 0.0000 |

Largest observed LCP 1984 ms. Largest observed interaction 200 ms. Largest observed CLS 0.0254.

## Security validation

The local PostgreSQL policy suite exercised anonymous, ordinary authenticated and owner access, including the AAL2 gate, publication, withdrawal and private editorial media. Client tests exercised published-cover rendering, draft filtering and the public assistant’s credential-request refusal. The production build retains the per-document Content Security Policy, which is applied after each route document is generated. The new planner export reuses the spreadsheet escaping used elsewhere in Academic.

The candidate leaves Supabase Auth, RLS and upload policies in place. The editorial image client still requests managed images through the existing Storage policies and revokes its local object URLs on cleanup. Lower article covers request their protected URLs as they approach the viewport. Owner MFA and uploads were not exercised against the live account.

## Reproduce

Use Node.js 24. Run `npm ci`, `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e`. To reproduce the browser benchmark and screenshots, run `X1_PAGES_GZIP=1 node scripts/serve-pages.mjs`, then run `node scripts/review-x1-elite.mjs` in a second shell. The [raw measurements](metrics.json) include three cold visits per route and viewport. Desktop uses a 1440 by 900 viewport. Mobile uses 390 by 844, 4× CPU slowdown, 100 ms network latency and 1.5 Mbps download. Interaction timing comes from the scripted action on each page. These are local lab measurements. Field Core Web Vitals require data from real sessions.
