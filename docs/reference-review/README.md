# Reference implementation review

The two supplied boards define the expressions, characters, order of the cinematic scenes and publishing controls. The application uses editable SVG portraits, layered scene artwork, animated geometry and React controls. The recordings show the running application.

| Destination | Character | Entrance duration | Recording |
| --- | --- | ---: | --- |
| Arcade | Purple Phantom | 3.6 s | [Neon street and portal](arcade.mp4) |
| Insights | Grok astronaut | 4.5 s | [Cosmic knowledge journey](insights.mp4) |
| Academic | Smiling X1 orb | 3.1 s | [Security dashboard journey](academic.mp4) |

The destination loads on click. The entry sequence supports Escape and a visible Skip journey button. A native dialog keeps keyboard focus inside the entrance while it is active. Reduced-motion visitors and browser history traversal bypass the cinematic sequence. Each movie uses actual browser frames sampled during navigation. Sampling rate depends on the capture machine. [Frame counts and durations](journeys.json)

## Visual evidence

| View | Desktop | Mobile |
| --- | --- | --- |
| Previous feature build | [1440 px](before-1440.jpg) | [390 px](before-390.jpg) |
| Reference build | [1440 px](after-1440.jpg) | [390 px](after-390.jpg) |

[Eight logo expressions](expressions.jpg) · [Homepage orb](guide-home.jpg) · [Grok on Insights](guide-insights.jpg) · [Arcade Phantom](guide-arcade.jpg) · [Owner studio](studio.jpg)

## Publishing verification and independent review

A production bundle and disposable Supabase Auth, PostgREST, PostgreSQL, Storage and Edge Runtime services verified the owner workflow. The test used two identities, native TOTP enrollment, a returning-owner challenge, draft recovery and anonymous read-back. A separate signed-out visitor opened the published Insights card and followed its link. Browser-decoded pixels matched the uploaded WebP on both views and matched the replacement WebP after the owner updated the article. Removing the cover cleared its association. Unpublishing withdrew anonymous access. [Results](owner-local.json)

The independent review identified missing visitor-side cover checks, click-through during the cinema, ambiguous focus targets in the studio and route matching on trailing slashes. The branch addresses these findings. The retriever is local and read-only. The Grok name identifies the astronaut character. No external model service or credentials are involved. The shared theme architecture, dependency audit, RLS details and legacy public media limitations are documented in the [security and platform review](../elite-review/README.md).

## Production status

The live read-only check against the Pages-configured project returned 404 for both owner RPCs and the editorial upload function. The new content projection returned 400. Deployment depends on applying the SQL to the existing owner UUID and deploying the function in that project. [Production preflight](https://github.com/arharif/arharif.github.io/actions/runs/45805225851)

## Performance and regression checks

Chromium 156 measured three fresh visits per route and viewport against local production builds. The baseline for this table is the feature build before the supplied reference-board changes. The earlier comparison against the original platform is in the [platform audit](../elite-review/README.md). Values are median largest contentful paint. [Baseline samples](before.json) · [Final samples](after.json)

| Route | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | ---: | ---: | ---: | ---: |
| Home | 1.13 s | 1.16 s | 0.58 s | 0.81 s |
| Insights | 0.95 s | 0.87 s | 0.55 s | 1.19 s |
| Academic | 0.58 s | 4.66 s | 0.52 s | 1.90 s |
| Arcade | 0.81 s | 2.10 s | 0.65 s | 2.01 s |
| About | 0.71 s | 4.00 s | 0.65 s | 3.49 s |
| Login | 0.44 s | 0.74 s | 0.35 s | 0.34 s |

The greatest layout shift total was 0.0031. The slowest recorded guide-opening Event Timing duration was 1368 ms, against 160 ms in the baseline. A run prior to adding guide preparation on focus, pointer entry and press recorded a 4,880 ms outlier. These measurements include renderer and runner load. Measuring field INP and sustained frame rates requires production traffic or physical-device profiling. [Earlier candidate samples](pre-optimization.json)

The mobile network test alternated the two builds in fresh 390 px Chromium contexts at 1.5 Mbps download, 100 ms latency and fourfold CPU slowdown. It used two visits per route and uncompressed fixture responses. On the homepage, median LCP rose from 3.10 s to 3.69 s. On Insights it fell from 4.14 s to 3.49 s after adding a direct Pages entry document and preloading its hero. Both routes exceeded the 2.5 s target in this test. [Network samples](mobile-network.json) · [Before the direct entry](pre-optimization-mobile.json) · [Benchmark script](../../scripts/review-mobile-network.mjs)

The final local run passed TypeScript, production compilation and 54 unit and contract cases. The production dependency audit reported zero known vulnerabilities. The browser matrix exercises Academic imports, exports and controls, published article discovery, theme persistence, reduced motion, keyboard navigation, cinematic journeys and Arcade gameplay. One earlier Linux WebKit run crashed in an Academic JSON export scenario. [Browser checks and logs](https://github.com/arharif/arharif.github.io/pull/124/checks)
