# X1 Elite product review

## Audit and implementation

The baseline is GitHub `main` at `a5dbfa0`. It already included nine theme identities, the approved X1 face, Grok astronaut and Phantom, SVG introductions, browser-local Academic workspaces, and the Supabase publishing studio. The audit found a full sequence on every home-card entry, an interior click that dismissed the sequence, a search utility that opened a separate page, a cosmic hero that kept its dark colors in light themes, and contact and submission actions that took extra navigation to find.

The homepage has three cards with named actions and Academic leads the row. The existing artwork is graded through the shared palette and its text sits on a solid surface. Search opens a keyboard-accessible dialog with Tools, Articles, Topics and Games. The full search page keeps the query in its URL. About Me has direct email and LinkedIn links, and Contribute opens a prefilled email draft for editorial review.

A first intentional home entry plays the approved journey. Repeat routes use a short, nonblocking transition. Each destination provides a Replay introduction control, and reduced-motion sessions go straight to the destination. The approved scenes and durations are 3.1 seconds for Academic, 4.5 seconds for Insights and 3.6 seconds for Arcade. Destination loading starts on navigation. The dialog supports immediate Skip and Escape. Browser history navigation bypasses the scene.

| Homepage | Desktop | Mobile |
| --- | --- | --- |
| Baseline | [1440 px](before-1440.jpg) | [390 px](before-390.jpg) |
| Onyx Black | [1440 px](onyx-1440.jpg) | [390 px](onyx-390.jpg) |
| Professional White | [1440 px](white-1440.jpg) | [390 px](white-390.jpg) |

[Insights in Professional White](insights-white-1440.jpg) · [Mobile search dialog](search-390.jpg)

## Design tokens

The existing nine preference keys and logo expressions are preserved. Onyx Black is the first-visit default. The theme selector labels the other eight choices Professional Light. Their page canvas is white, with distinct surfaces, accents and muted text. Editorial Ivory uses `#FFFFFF`, `#F5F5F2` and `#20252A`. Sandstone uses the Warm Stone surface `#F4F1ED` and bronze `#855B3E`. Onyx uses `#080A0D`, `#15181C`, `#F5F6F8` and `#D5D9DF`. Academic and the assistant still consume the shared tokens. Arcade has its own neon scheme.

The public HTML includes route-specific social information for Home, Insights, About, Games and Contribute. On a loaded article, the document uses the published title and excerpt or the editorial metadata when supplied. An existing public cover can serve as the social image. Private-bucket objects continue to use the authorized browser image loader.

## Security

- A read-only query against the connected Supabase project checked all seven public tables and the editorial Storage policies. RLS is enabled. The current restrictive policies constrain the older permissive policies.
- With the database role set to `anon`, both owner and publishing predicates returned false. The role could read six published articles, zero drafts and zero private editorial objects. All six legacy cover references matched objects in their existing public bucket.
- The native owner TOTP and private upload implementations are already on the baseline. The local PostgreSQL regression checks anonymous, member, owner AAL1 and owner AAL2 access, including cover visibility before and after publication. Supabase reported zero enrolled TOTP factors in the connected project at review time. This review used no live owner credentials and made no production writes.
- Public discovery uses the published CMS projection and checks publication and topic status again on the client. The assistant searches public content, uses internal routes and exposes no administrative operations. Markdown continues to render as React elements with sanitized links. Article embeds now require an HTTPS source on a different origin.
- Existing `content-media` URLs are legacy public assets. The separate editorial bucket is private and is used for new uploads. The legacy bucket should be treated as public storage. The project flagged zero production dependency advisories in the audit run.

## Evidence and limitations

The benchmark and browser evidence below use a locally built GitHub Pages fixture. The comparison uses the frozen GitHub baseline and this feature branch. The navigation tests use fixture articles and anonymous journeys. The contribution test verifies the exact recipient and template behind the email link. An email client is required to send it.

<!-- Results are recorded after browser verification. -->
