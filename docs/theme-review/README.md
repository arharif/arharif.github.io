# X1 theme and identity review

The nine themes use the supplied backgrounds, surfaces and accents. The original saved theme names still resolve. The older generic dark preference now resolves to Onyx Black. Theme selection follows visitors across Home, About Me, Academic and Insights. Arcade uses its existing Neon palette.

| Evidence | Desktop | Mobile |
| --- | --- | --- |
| All nine themes | [1440 px captures](desktop-themes.jpg) | [390 px captures](mobile-themes.jpg) |
| Theme selector and assistant identities | [1440 px captures](1440-assistant-and-selector.jpg) | [390 px captures](390-assistant-and-selector.jpg) |
| Nine logo expressions | [Close-up captures](logo-expressions.jpg) | |

The X1 face stays transparent and uses a 48 px target. Its expression follows the existing assistant request state. The fine stroke on the eyes and mouth helps them remain legible when content scrolls underneath. The mark and assistant respond to keyboard interaction, and their motion respects reduced-motion settings.

## Speed and resilience

The gzipped homepage entry gained 96 bytes of JavaScript and 372 bytes of CSS against the production revision. The launcher chunk gained 484 bytes gzipped. The larger guide and query modules still load on demand. The production build adds no dependencies.

Local Chromium tests used three cold visits per build and route at 390 px, 1.5 Mbps download, 100 ms latency and fourfold CPU slowdown. The fixture served uncompressed assets.

| Median LCP | Production build | Feature branch |
| --- | ---: | ---: |
| Home | 2.83 s | 2.85 s |
| Insights | 2.98 s | 2.95 s |

Maximum layout shift total was 0.0029. The local run does not provide field data from real devices. [Raw measurements](mobile-network.json) · [Benchmark script](../../scripts/review-mobile-network.mjs)

Browser checks exercised loading and error expressions by delaying and then aborting the lazy-loaded guide module. The existing production check verified both publishing authorization functions, the published article projection and upload availability. The production dependency audit reported zero known vulnerabilities. [Production publishing check](https://github.com/arharif/arharif.github.io/actions/runs/45896193157)
