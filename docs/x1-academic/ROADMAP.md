# Precise implementation backlog

> Historical release record. The current connected-studio implementation, methods, sources, security findings and executed checks are documented in [v2/IMPLEMENTATION_REPORT.md](v2/IMPLEMENTATION_REPORT.md) and its linked reports. The older scope/retention statements below describe their original revision.

## Interactive workspace update (20 November 2026)

The dashboard shell, multi-record Excel/CSV register, full CSF Core, graph, contextual learning guide, ROC/PR curves and connected boardroom have now been implemented. See [the implementation report](INTERACTIVE_WORKSPACE_REPORT.md). The older increment notes below are retained with updated backlog wording.

## Delivered increment

Five laboratories support scenario selection, meaningful decisions or calculations, feedback, reset and CSV/JSON/print exports. Three shared case organisations maintain consistent service context. Three modules are published with teaching, exercises, assessments and explicit completion. All 36 curriculum titles are catalogued with publication state. Roles, frameworks, certification guidance, sources, search, navigator, progress and static lesson delivery are integrated below the academic namespace.

## Required for the full requested transformation

1. Author and review the remaining 33 modules. The exact planned titles appear in the three `tracks` arrays in curriculum.ts. Expand the one-lesson-per-module structure into multi-lesson paths where pedagogically warranted. Deepen subject-specific interactive diagrams and revision materials.
2. Expand the selected SP 800-53 / ISO 27001 / PCI DSS teaching scopes into complete, appropriately licensed hierarchies and testing procedures. CSF now includes the full Core. SP 800-53 5.2.0 and ISO 27001 Amd1:2024 metadata have been checked; inherited framework editions still require broader review.
3. Verify all certification titles and programme eligibility against issuer sources. Only four issuer links are enriched here. No prices, exam-version or current eligibility claims are supplied.
4. Verify the expanded sixteen-resource catalogue URLs and their editorial relevance in an environment permitted to reach publisher domains. Expand the seed to cover datasets, courses, books, templates and research with reviewed metadata. Current CONNECT 403 results remain in LINK_REPORT.json.
5. Add incident narratives beyond the current supplier-session pattern. Current sector variants share one authored timeline structure. Ransomware, botnet and additional cloud stories remain unimplemented.
6. Expand framework action records into separately dated POA&M, control testing and evidence-register workflows. Current reports contain assessment, notes, owners and gap actions. Deadline scheduling, independent validation and complete POA&M fields remain future work.
7. Add richer assessment components for multiple-answer, diagram and rubric exercises. Current learning checks are single-answer with written activity, supplemented by evidence marking, scenario decisions and topic-coverage checks in labs.
8. Persist versioned laboratory states beyond the single saved AI configuration. Risk registers, dated observations and framework assessments now persist during internal navigation in tab memory. Refresh persistence remains intentionally absent for potentially sensitive registers. Current case-state imports provide contextual prior results and do not restore every lab control. Imported evidence must remain explicitly unvalidated.
9. Add a securely operated tutor backend only with appropriate service credentials and deployment. The local navigator provides the working fallback. Authenticated progress sync also needs separately tested backend policies.
10. Conduct independent subject-matter and assistive-technology review, cross-browser checks in Firefox/WebKit, print-to-PDF quality checks, deployed GitHub Pages smoke tests and production Supabase policy tests. Automated Chromium/axe checks cover the increment and do not certify the full product.

## Performance follow-up

New labs are separate small chunks. The inherited entry bundle still includes the legacy application, around 128 KB gzip in this build. Further extraction of the legacy shell could reduce academic initial transfer. That work would require a broader compatibility test pass. Resource/source availability and a larger verified curriculum are higher priorities than adding visual effects.
