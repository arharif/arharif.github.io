# Internal quality review

> Historical release record. The current connected-studio implementation, methods, sources, security findings and executed checks are documented in [v2/IMPLEMENTATION_REPORT.md](v2/IMPLEMENTATION_REPORT.md) and its linked reports. The older scope/retention statements below describe their original revision.

This is a single-agent review across six requested professional perspectives. It does not substitute for independent human subject-matter approval.

| Perspective | Material finding | Severity | Resolution and evidence |
| --- | --- | --- | --- |
| Architecture | Academic routes initially lacked a parent route context | High | Added the scoped parent route. Browser tests open every section and all five labs through their production paths |
| Architecture | Executive roadmap order differed from learner priority order | Medium | Build roadmap from the selection order. Current exports retain the explicit order |
| Cybersecurity | Deep JSON and spreadsheet formulas could create unsafe imported or exported data | Medium | Bounded schemas, depth and sizes, prototype-key rejection, escaped React output and CSV formula neutralisation. Pure regression tests exercise these cases |
| Cybersecurity | Inherited tooling dependencies carried high-severity advisories | High | Compatible lockfile updates remove all observed high/critical advisories. Two moderate router findings require a major-version compatibility review |
| GRC | Implementation assertion could appear equivalent to independently effective control | High educational risk | Evidence references and owners are required. Counts describe assertions, and independent effectiveness review remains explicit |
| GRC | Full-catalogue compliance could be inferred from a subset | High educational risk | Explicit ten-item teaching scope, no aggregate compliance score, source/version caveats and documented mapping interpretations |
| AI science | Synthetic formula could be mistaken for trained-model research | High educational risk | Fixed generator and formulas documented. Metrics come from actual defined labels/scores. UI and reports identify synthetic and optimistic-training assumptions |
| AI science | Undefined precision could be misread | Medium | Declare zero-denominator convention, show confusion counts and a no-positive-predictions message |
| UX and accessibility | Inline links relied on colour | Medium | Underline inline links in both themes and rerun axe checks |
| UX and accessibility | Inherited button colour transitions could temporarily lose light-theme contrast | Medium | Scope transitions to borders so theme foreground/background change together. Both themes are checked in browser tests |
| UX and accessibility | Mobile navigation labels overlapped despite no viewport overflow | Medium | Prevent flex shrinking, inspect screenshots and add adjacent-item-bound assertions |
| UX and accessibility | Inherited Google font request failed on academic pages | Low | Load the original font only in the legacy shell. Academy uses system typography and its browser route test checks console and asset errors |
| Education | A 36-title list could imply 36 completed modules | High educational risk | Three full module records are published and 33 planned titles are explicitly labelled. Completion is based on an assessment and written activity |
| Education | Keyword rubric could imply semantic reasoning assessment | Medium | Report topic coverage with stated limits and human-review requirement |

Remaining items include source verification blocked by egress policy, curriculum completion, incident-story diversity, comprehensive framework and certification enrichment, cross-browser and assistive-technology review, and a hosted tutor backend. See ROADMAP.md for exact scope.
