# Release review

This increment is prepared for code and educational review. The complete transformation remains in progress. No production deployment was performed.

- [x] Baseline recorded and existing routes retained
- [x] New primary capabilities under `/x1-academic/*`
- [x] Five functional laboratory loops with actual report content
- [x] Three substantive published modules and explicit planned curriculum
- [x] Shared fictional case identity and contextual JSON portability
- [x] Anonymous progress, reset, backup and restore
- [x] Static lesson text, canonical metadata and generated sitemap
- [x] Build, unit, browser and automated accessibility checks run
- [ ] Current publisher editions and resource links verified
- [ ] All 36 modules authored and reviewed
- [ ] Full framework hierarchies and comprehensive certification metadata
- [ ] Independent subject-matter and assistive-technology sign-off
- [ ] Hosted tutor backend, if desired
- [ ] Deployed production smoke test

## Development and testing

Use Node 24. Run `npm ci`, `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`, `npm run lint`, `npm test` and `npm run build`. Build emits static academic pages after Vite compilation.

For browser tests, use installed Chromium or run `npx playwright install --with-deps chromium`. `npm run test:e2e` starts a port-4174 static fixture from dist. Build first. PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH may override the local Chromium executable. The fixture implements Pages-like directory indexes and actual 404 recovery. It is a development test server.

`npm run check:links` records HTTP reachability and exits nonzero when verification is incomplete. Permit publisher destinations in environment networking before retrying blocked checks. Do not disable TLS checks.

## Deployment

Review the branch and test report. The established GitHub Pages workflow builds from the lockfile using Node 24, validates compiled asset references and uploads dist. The CI workflow now runs the Node tests and Playwright checks. Merge through the repository's normal authorised review process. Production remains on the user-site domain with root-relative assets. Verify `/x1-academic`, all five labs, a lesson refresh, a shared query URL, report downloads and a representative legacy page after deployment. Never infer deployed success from a local build.
