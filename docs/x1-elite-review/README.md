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

Home and direct Insights entries preload their display font. Insights also preloads its route stylesheet, code and lighter artwork. Owner authentication and editor code load on the routes that use them. The gzipped homepage JavaScript entry decreased from 73,423 to 72,377 bytes. Its CSS increased from 21,356 to 21,788 bytes.

The public HTML includes route-specific social information for Home, Insights, About, Games and Contribute. On a loaded article, the document uses the published title and excerpt or the editorial metadata when supplied. An existing public cover can serve as the social image. Private-bucket objects continue to use the authorized browser image loader.

## Security

- A read-only query against the connected Supabase project checked all seven public tables and the editorial Storage policies. RLS is enabled. The current restrictive policies constrain the older permissive policies.
- With the database role set to `anon`, both owner and publishing predicates returned false. The role could read six published articles, zero drafts and zero private editorial objects. All six legacy cover references matched objects in their existing public bucket.
- The native owner TOTP and private upload implementations are already on the baseline. The local PostgreSQL regression checks anonymous, member, owner AAL1 and owner AAL2 access, including cover visibility before and after publication. Supabase reported zero enrolled TOTP factors in the connected project at review time. This review used no live owner credentials and made no production writes.
- Public discovery uses the published CMS projection and checks publication and topic status again on the client. The assistant searches public content, uses internal routes and exposes no administrative operations. Markdown continues to render as React elements with sanitized links. Article embeds now require an HTTPS source on a different origin.
- Supabase’s security advisor reported that leaked-password protection is disabled. [Supabase Auth password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- Existing `content-media` URLs are legacy public assets. The separate editorial bucket is private and is used for new uploads. The legacy bucket should be treated as public storage. The project flagged zero production dependency advisories in the audit run.

## Browser and build checks

- TypeScript and the production build passed. All 54 unit and contract cases passed, including the PostgreSQL owner and media policy fixture. The build still reports large, lazy-loaded spreadsheet chunks.
- The 123-case Chromium run passed 120 cases. Two assertions still expected the old three-column theme menu, and one sampled a 240 ms transition after it had been removed. Corrected two-column keyboard assertions and the targeted public-journey suite passed 12 checks on the optimized build. All three targeted cinematic history cases passed on that build.
- The five journeys ran at 1440 and 390 pixels. The contribution test verified the recipient and prefilled body. The site-wide regression checked nine palettes, the approved characters, keyboard controls, reduced motion, responsive layouts down to 320 pixels, article bookmarks, multiple Arcade games, and Academic imports and exports.
- Axe checks passed on the tested routes and on both search-dialog palettes. Assistive-technology testing was limited to the browser accessibility tree, automated rules and keyboard interaction. External Academic publisher requests could not be verified from the local network.

## Performance

The benchmark and browser evidence below use a locally built GitHub Pages fixture. The comparison uses the frozen GitHub baseline and this feature branch. The navigation tests use fixture articles and anonymous journeys. The contribution test verifies the exact recipient and template behind the email link. An email client is required to send it.

The throttled comparison alternated three cold visits per build at 390 × 844 with 1.5 Mbps download, 100 ms latency and fourfold CPU slowdown. The gzip fixture compressed HTML, JS, CSS, JSON and SVG. The other fixture served raw responses. Both used the same assets, browser and network settings. All measured candidate layout-shift totals in the throttled runs were zero.

| Fixture | Route | Median LCP before | Median LCP after |
| --- | --- | ---: | ---: |
| Gzip | Home | 2.260 s | 2.340 s |
| Gzip | Insights | 2.320 s | 2.208 s |
| Uncompressed | Home | 3.184 s | 2.824 s |
| Uncompressed | Insights | 3.972 s | 4.532 s |

The gzip lab results met the 2.5-second LCP target. The uncompressed runs exceeded it. There is no field dataset for the feature branch. [Throttled gzip results](mobile-gzip.json) · [Uncompressed results](mobile-network.json) · [Benchmark script](../../scripts/review-mobile-network.mjs)

All three full introductions completed automatically in Chromium. The median animation-frame interval was 16.7 ms across all three scenes during the sampled 1.8 seconds. The 95th-percentile interval was 16.8 ms for Academic and Insights and 66.6 ms for Arcade. This desktop headless sample is sensitive to renderer load and does not establish frame rates on visitor devices. [Motion samples](motion.json)

Unthrottled LCP was measured with three cold visits per route and viewport. The local fixture used 1440 × 900 desktop and 390 × 844 mobile Chromium contexts. Each sample opened the guide after the initial paint measurements.

| Route | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | ---: | ---: | ---: | ---: |
| Home | 0.436 s | 0.360 s | 0.392 s | 0.396 s |
| Insights | 0.492 s | 0.972 s | 0.456 s | 0.616 s |
| Academic | 0.444 s | 0.416 s | 0.392 s | 0.412 s |
| Arcade | 0.632 s | 0.664 s | 0.520 s | 0.660 s |
| About Me | 0.492 s | 0.508 s | 0.420 s | 0.600 s |
| Owner Login | 0.292 s | 0.412 s | 0.284 s | 0.352 s |

The largest candidate layout-shift total was 0.0000. The longest Event Timing result for opening the guide was 184 ms on the candidate and 80 ms on the baseline. This is a single interaction sampled in the lab. Field INP and real-device frame rates are still unmeasured. [Unthrottled baseline](before.json) · [Unthrottled candidate](after.json) · [Measurement script](../../scripts/review-elite.mjs)
