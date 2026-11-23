# X1 Elite release review

The comparison starts at `bdd361d`, the revision that merged the approved X1 Digital Universe layout. The homepage, About biography, Academic workspaces and existing game catalogue remain in the original application. The visual references available for this release were the repository's approved screenshots and its working application.

## Visual and interaction evidence

| View | Evidence |
| --- | --- |
| Theme comparison | [Eight homepage captures](themes.jpg) |
| Exact theme tokens | [Computed values across Home, Insights, Academic and About](themes.json) |
| Original homepage | [Desktop](before-1440.jpg) · [Mobile](before-390.jpg) |

The theme check visits every section after a fresh navigation and decodes all three destination images. The browser suite also checks theme persistence, legacy theme migration, keyboard selection, contrast, responsive layouts and reduced motion. The new illustrations use resized versions of the existing approved art with local lighting, edge shading and palette-dependent highlights.

The launcher uses the X1 mark on Home, a helmeted astronaut on Insights and the Phantom in Arcade. Game selection and outcome events change the Phantom's expression. The guide opens inside the active game dialog when needed. Queries search public articles and navigation metadata on demand. The Arcade additions and their rights are documented in the [game review](GAMES.md).

## Publishing and security

- Supabase verifies the registered owner's password and native TOTP factor. An existing verified factor is reused. A first enrollment requires confirmation in an authenticator. Database authorization checks the immutable Auth user ID and AAL2 on every protected mutation.
- Restrictive RLS policies cover articles, topics, academic resources, collections, tags and their relationships. Draft topics hide their articles. The migration keeps the current table and content, including unpublished rows. A legacy installation containing only `content_entries` is upgraded by renaming that table in the same transaction.
- New editorial media enters a private bucket through an Edge Function. It validates the caller, streams up to 8 MiB, checks the image container signature and assigns a random key. The browser also verifies that it can decode the image. Only content references from publicly visible articles allow anonymous downloads. Legacy public media retains its existing URLs. Visitors can retain copies of any media previously made public.
- Markdown renders as React elements and text. The visual block editor and Markdown editor share one source string. Article preview uses the visitor renderer. Reading time uses the ceiling of visible Unicode word count divided by 220, with a one-minute minimum. Image markup and link destinations are excluded. An optional manual value takes precedence.
- The editor keeps recovery data in the owner's browser tab, clears it on explicit logout and compares the last saved revision before updating. Retried submissions reuse their article ID. Published visibility is checked using a separate anonymous request. The public contribution form continues to prepare a submission for review.
- Authentication uses explicit bearer headers. Private session and media requests go to the configured Supabase origin. GitHub Pages serves static content. Each built HTML page receives a document CSP with hashed inline scripts and a restricted connection policy. The host controls HTTP-only protections such as frame ancestors and HSTS. HTTPS article frames/images and inline CSS remain permitted for existing content.
- The dependency audit on the baseline reported two moderate findings. After the router update npm reported zero known vulnerabilities in the locked tree. npm's advisory database and this review cover different aspects of security.

## Releasing to the existing Supabase project

1. Match the project to the existing Pages build setting `VITE_SUPABASE_URL`. In that project's Auth users, identify the registered owner account and use its existing UUID. Preserve its password and enrolled factors.
2. Review current table names, dependencies, policy definitions and any custom public views or security-definer RPCs. Take a recoverable database backup using the project's existing process. If both content table names contain distinct records, reconcile their role in the installation before release.
3. Substitute the verified owner UUID for `<OWNER_UUID>` in [the transactional SQL migration](../supabase.sql) and apply it to that database. Enable TOTP enrollment and verification under Supabase Auth. Deploy the [editorial-upload Edge Function](../../supabase/functions/editorial-upload/index.ts) to the same project. Server credentials belong only in the function runtime.
4. Verify an anonymous public article read, a blocked unauthenticated write, the owner's native challenge and private media using a temporary draft. Retain existing public data and confirm existing article URLs still resolve. Avoid issuing a new production factor on the owner's behalf.
5. Merge the reviewed PR after the backend checks. The existing Pages workflow builds against the repository's configured public Supabase settings, publishes the commit and verifies the deployed revision, routes and asset links.

The GitHub Pages build requires the existing public Supabase URL and publishable or anonymous key. Those two browser settings alone cannot run a database migration or deploy a function.
