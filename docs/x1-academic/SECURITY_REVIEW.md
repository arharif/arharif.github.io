# Security and privacy review

> Historical release record. The current connected-studio implementation, methods, sources, security findings and executed checks are documented in [v2/IMPLEMENTATION_REPORT.md](v2/IMPLEMENTATION_REPORT.md) and its linked reports. The older scope/retention statements below describe their original revision.

Review performed across the implemented source and exercised browser workflows on 2026-11-20.

| Finding | Severity | Action and result |
| --- | --- | --- |
| Imported case JSON could contain deeply nested payloads | Medium | Added 100 KB limit, depth and collection bounds, schema/version/case checks, timestamp validation and prototype-key rejection |
| CSV values could be interpreted as spreadsheet formulas | Medium | Quote cells and prefix formula-like values, with regression coverage |
| Framework assertions could omit support or ownership | Educational integrity | Validate references, owners and exclusion reasons before saving |
| Automated reasoning could be mistaken for professional judgement | Educational integrity | Explicit keyword-coverage limitations beside results and in exported methodology |
| New public learning could cross admin retrieval boundaries | High if introduced | Academic data stays static/local. Public academy mounts without admin provider or CMS retrieval. Existing backend policies remain outside this increment |
| Inherited dependency advisories | High in build tooling before update | Applied compatible audit fixes. Final audit results are recorded in TEST_REPORT.md |
| Hosted tutor has no secure server deployment | External dependency | Tutor remains unavailable. Deterministic navigator is operational |

React escapes user text, notes and imported context. Academic content does not use dangerouslySetInnerHTML or executable imported markup. HTTPS publisher links originate from checked-in data. Report downloads use Blob URLs that are revoked. Imports are plain data, with no remote execution or automatic URL fetching. No API keys or new secrets are requested or included in browser code.

Progress is anonymous local browser storage. It contains learning IDs, counts, bookmarks and an optional experiment configuration. It is user-editable and cannot establish trusted certification or authentication. Storage failures are visible and export remains available. Lab notes are held in session state until exported. Learners are told to export before changing scenarios. No analytics or new personal-data collection is introduced.

Legacy administration, authentication and Supabase integration retain their original boundaries. Source inspection and existing tests do not prove deployed RLS, storage policy or rate-limiting correctness. An authenticated policy test with an authorised test project remains a separate verification dependency. Browser-only throttling must never become an authorisation boundary.

A future tutor must run behind a server-side API with schema validation, bounded request sizes, quotas, rate limits, authorised retrieval, provenance, output escaping, prompt-injection-resistant treatment of retrieved material and safe logging. GitHub Pages alone cannot host that service. No hosted endpoint is represented as working in this increment.

## Interactive workspace update

Excel/CSV registers are processed locally through a lazy ExcelJS adapter; the browser workflow test monitors outgoing POST/PUT requests and asserts none occur during import/analysis/export. Required fields, rating/date/status bounds, case-insensitive duplicate IDs, row limits and append limits are checked before atomic application. Files are capped at 3 MB / 80 columns / 2000 records. Formula-bearing XLSX cells are rejected; workbook exports write literal strings and CSV prefixes remain neutralised. A compressed malicious workbook may still consume browser resources while parsing; archive preflight/worker isolation remains a hardening opportunity.

Risk data, dated observations and assessments stay in React tab memory across internal navigation. No new persistence or backend is introduced for these inputs. Refresh clears them. Changing organisation clears shared workspace data. Authoritative links remain checked-in URLs rather than links executed from uploads. Imported evidence text remains an unverified learner reference.

The ExcelJS UUID transitive dependency is overridden to 11.1.1. Workbook import/export regression tests exercise it. Production audit has no high/critical findings; the inherited React Router 6 advisories remain moderate and require a separately assessed major-version migration. No dependency downgrade is used to silence the audit.
