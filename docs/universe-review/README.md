# X1 Digital Universe release review

Branch `feat/x1-digital-universe` started at `d78919524d2d50ce6d0857cec21fe6c9a5533882`. The revised landscape palette implementation is in `da1629acb690aae2cc9c11b2adcdb697c848c985`. The pull request records the final test and deployment results. [Pull request 123](https://github.com/arharif/arharif.github.io/pull/123)

## Visible changes

| Area | Implementation | Browser capture |
| --- | --- | --- |
| Gateway | Editorial headline, three illustrated destination links, palette picker, site search, account and floating assistant | [Homepage](home.jpg) |
| Arcade | Neon sidebar, keyboard and touch games, searchable catalogue, favorites, high scores, daily progress and earned badges | [Arcade](arcade.jpg) |
| Insights | Cosmic hero, eight topic filters, published article search, chapter links, reading times and personal bookmarks | [Insights](insights.jpg) |
| Academic | Shared palette, entrance motion, assistant access and links between universes. Existing workspace routes and calculations continue to own Academic state | [Academic](academic.jpg) |
| About | Existing content and layout with themed reading surfaces and controls | [About](about.jpg) |
| Mobile | Single-column gateway, collapsible navigation, wrapping Arcade navigation and responsive article cards | [390 px captures](mobile.jpg) |

The review uses the three supplied compositions and the later eight-palette reference. The homepage keeps the reference's compact header, two-line desktop headline and balanced image cards. Arcade shows the player's actual progress. Insights renders the available CMS records, so article titles, article count and card lengths depend on the publication collection. Additional footer links preserve the existing store and email destinations.

## Palettes and navigation

Editorial Ivory is the default. The remaining palettes are Obsidian Sage, Cosmic Indigo, Arctic Blue, Desert Amber, Forest Horizon, Metropolitan Plum and Graphite Slate. The four printed swatches supply each theme's canvas, surface, text and accent. The dark themes use their lightest swatch for text. Desert Amber uses its brown text swatch for small controls on amber surfaces.

Vite generates the initial palette rule and preference bootstrap from the same catalogue used by the picker. The existing `theme` key migrates the seven original preferences and six retired names from the initial redesign. A route-scoped override gives Arcade its neon colors. Shared themes resume on exit.

The transition observer uses the previous and next universe, with the selected link as the visual origin. Its overlay ignores pointer input. Browser history, direct entry, hash targets and the reduced-motion preference remain available.

| All eight palettes | Captures |
| --- | --- |
| Homepage | [Theme sheet](themes-home.jpg) |
| Insights | [Theme sheet](themes-insights.jpg) |
| Academic | [Theme sheet](themes-academic.jpg) |
| About | [Theme sheet](themes-about.jpg) |
| Contribute | [Theme sheet](themes-contribute.jpg) |

## Games and progression

The catalogue includes 21 existing game and quiz entries, including five previously unlisted components. The six X1 Originals are Phantom Dash, Haunted Memory, Neon Maze Escape, Rocket Boom, Pixel Panic and Quiz Chaos. Game instructions are shared with the assistant.

| Original | Round score |
| --- | --- |
| Phantom Dash | 10 points per second survived and 25 per coin |
| Haunted Memory | 150 points per pair in the deck, less 5 per move and 1 per elapsed second, with a minimum finished score of 10 |
| Neon Maze Escape | 100 points per completed maze plus up to 100 time-bonus points per maze, across three levels |
| Rocket Boom | 10 points per second survived and 50 per asteroid destroyed |
| Pixel Panic | 10 points per second survived |
| Quiz Chaos | 100 points plus the remaining seconds for each correct answer |

Each finished Original earns 10 XP plus 1 XP per 10 points, capped at 110 XP. Levels advance every 250 XP. The daily challenge requires three completed Original rounds in a UTC day. An IndexedDB transaction updates totals and high scores together. Legacy games retain their prior score keys. These records are local to the device and editable by its owner. Account synchronization and public rankings are outside this release.

## Verification

The baseline production build, unit suite and 65 Chromium scenarios passed before implementation. The release checks cover stored preference migration, cross-universe navigation, reduced motion, nested Academic routes, assistant retrieval, the editorial workflow, original-game play and replay, legacy game launch, and 360, 390, 768, 1024, 1440 and 1920 px layouts. The PostgreSQL policy suite runs against an isolated in-memory database. The GitHub quality job also runs Playwright in Firefox and WebKit. See the PR checks for their result.

A separate axe sweep found zero reported violations across 72 palette-and-route combinations. It included the open assistant, published article, login, both legacy collection pages, About, Contribute, Insights and Academic. [Accessibility results](accessibility.json)

The performance capture uses the production bundle, local static serving, three cold Chromium contexts per page, a 1440 × 900 viewport and an assistant-opening interaction. The median home LCP was 580 ms. The median Arcade LCP was 1,320 ms. Maximum observed CLS was 0.00315 rounded up. The longest observed interaction was 224 ms on About, above the 200 ms target. These lab measurements do not establish production field INP. The existing lazy-loaded spreadsheet and worker bundles still trigger Vite's large-chunk warning. [Raw performance samples](metrics.json)

Run `npm ci`, `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` using Node 24. To reproduce browser captures, serve the build with `node scripts/serve-pages.mjs` and run `node --experimental-strip-types scripts/capture-universe.mjs /tmp/x1-review` in a second shell.

## Security and external dependencies

- Insights and the local assistant use published-only reads. The assistant renders React text, resolves links from site routes and game metadata, and receives no administrator token. Markdown continues to use the existing URL allowlists.
- Contribute still sends plain-text email for review. The login, OTP, upload limits, editorial mutations and Supabase configuration retain their existing contracts. This release introduces no database migration or hosted AI dependency.
- Isolated PostgreSQL tests exercise public and draft visibility, denied guest/member writes, allowed editor publication and storage permissions. The checked-in SQL targets `content_entries`, while the application queries `content`. Verifying the deployed table's actual policies, OTP and authenticated uploads requires access to that project. Production records were not used as test fixtures.
- The dependency audit reported two moderate affected packages in the React Router dependency chain, with zero high or critical findings. The application uses BrowserRouter and its generated editorial links encode the CMS slug. The server-side hydration advisory concerns a different rendering path. The dependency upgrade recommended by npm crosses a major version. [Router navigation advisory](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) · [Hydration advisory](https://github.com/advisories/GHSA-337j-9hxr-rhxg)
- The local external-link check could not verify the 39 publisher URLs through the outbound proxy. The scheduled publisher report remains a separate external-source check. The browser review also exercised the existing About portrait fallback when the external image was unavailable.

## Deployment and rollback

Merge the validated PR to main. The repository's existing **Deploy static content to Pages** workflow builds with the repository configuration, uploads the Pages artifact and records the deployed commit in `deployment.json`. Its final step verifies that revision, Academic route metadata and compiled entry assets.

To roll back, revert the PR merge on main through the normal review process and let the same Pages workflow publish the revert. For a merge commit the Git command is `git revert -m 1 <merge-sha>`. No data reversal is required.

## Changed files

- Updated `package-lock.json`
- Updated `package.json`
- Added `public/art/academic.webp`
- Added `public/art/arcade.webp`
- Added `public/art/cosmos.webp`
- Added `public/art/editorial-0.webp`
- Added `public/art/editorial-1.webp`
- Added `public/art/editorial-2.webp`
- Added `public/art/editorial-3.webp`
- Added `public/art/games.webp`
- Added `public/art/haunted-memory.webp`
- Added `public/art/insights.webp`
- Added `public/art/mascot.webp`
- Added `public/art/neon-maze-escape.webp`
- Added `public/art/phantom-dash.webp`
- Added `public/art/pixel-panic.webp`
- Added `public/art/quiz-chaos.webp`
- Added `public/art/rocket-boom.webp`
- Added `public/fonts/DM-Serif-Text-OFL.txt`
- Added `public/fonts/dm-serif-text-latin.woff`
- Added `scripts/capture-universe.mjs`
- Updated `src/App.tsx`
- Updated `src/academic/app/LegacyAcademy.tsx`
- Updated `src/academic/app/academic.css`
- Updated `src/academic/console/Console.tsx`
- Updated `src/academic/console/console.css`
- Updated `src/academic/features/standards/standards.css`
- Updated `src/academic/studio/studio.css`
- Updated `src/components/ArticleView.tsx`
- Added `src/components/Bookmark.tsx`
- Updated `src/components/GamesHub.tsx`
- Updated `src/components/Navbar.tsx`
- Removed `src/components/ThemeMotionBackground.tsx`
- Updated `src/components/ThemeSwitcher.tsx`
- Added `src/components/UniverseTransition.tsx`
- Added `src/components/arcade/ActionGame.tsx`
- Added `src/components/arcade/LegacyGame.tsx`
- Added `src/components/arcade/MazeGame.tsx`
- Added `src/components/arcade/MemoryGame.tsx`
- Added `src/components/arcade/QuizGame.tsx`
- Added `src/components/arcade/actionEngine.ts`
- Added `src/components/arcade/arcade.css`
- Added `src/components/arcade/catalog.ts`
- Added `src/components/arcade/legacyCatalog.ts`
- Added `src/components/arcade/maze.ts`
- Added `src/components/arcade/progress.ts`
- Updated `src/components/branding/X1Mark.tsx`
- Updated `src/components/site-assistant/SiteAssistantLauncher.tsx`
- Updated `src/components/site-assistant/SiteAssistantPanel.tsx`
- Updated `src/components/site-assistant/assistantContext.ts`
- Added `src/lib/palettes.ts`
- Updated `src/lib/siteAssistant.ts`
- Updated `src/lib/theme.ts`
- Updated `src/main.tsx`
- Added `src/pages/Gateway.tsx`
- Added `src/pages/Insights.tsx`
- Added `src/pages/SearchPage.tsx`
- Added `src/pages/insights.css`
- Updated `src/styles/index.css`
- Added `src/styles/universe.css`
- Updated `tests/e2e/academic.spec.ts`
- Added `tests/e2e/arcade-rounds.spec.ts`
- Updated `tests/e2e/console.spec.ts`
- Updated `tests/e2e/standards-premium.spec.ts`
- Updated `tests/e2e/studio.spec.ts`
- Added `tests/e2e/universe.spec.ts`
- Added `tests/publishingPolicy.test.ts`
- Added `tests/universe.test.ts`
- Updated `tsconfig.node.json`
- Updated `vite.config.ts`

The release evidence also adds the desktop and mobile captures, five palette sheets, performance samples and accessibility results in this directory.
