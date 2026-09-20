# Project TODO

Completed review fixes and resolved or obsolete earlier findings have been removed.

## Remaining follow-ups

- [ ] **REV-021 — Verify the workflow on GitHub after the first push.**
  - The quality workflow, formatting, accessibility checks, regression tests, and pre-commit hook are implemented and verified locally.
  - After the changes are committed and pushed, confirm the GitHub Actions run passes on Linux. No commit or push has been made, as requested.
  - Before the public release, require the checks on the default branch and review fork-run approvals and repository secret-scanning settings. The repository currently has no default branch; GitHub does not expose rulesets or public-fork approval settings for this private repository on its current plan.

- [ ] **AUD-004 — Verify routing on a deployment preview.**
  - No catch-all rewrite or tracked Vercel project identity remains. Local production tests confirm normal pages, articles, and a true HTTP 404 for unknown URLs.
  - On the publication's own deployment preview, verify those routes again and confirm the configured site URL, canonical links, RSS, and sitemap match the deployed domain.
  - Verify production security headers at the hosting layer: a tested Content Security Policy, `X-Content-Type-Options: nosniff`, a referrer policy, and protection against unwanted framing. These are not established by the local static preview.

- [ ] **AUD-025 — Revisit TypeScript 7 when Astro's checker supports it.**
  - Retained dependencies now use exact eligible releases. TypeScript stays on 6.0.3 because the latest `@astrojs/check` 0.9.10 declares support for TypeScript 5/6 only.
  - Upgrade after upstream support lands, then rerun Astro checks and the regression suite. Turbo is on 2.10.13 because its 2.11.x releases were less than two days old on September 20, 2026.

- [ ] **AUD-039 — Create versioned release notes when the first release is ready.**
  - The template and web package are versioned as 1.0.0. Prepare the public release notes and release date when publishing is authorized.
  - No commit, release tag, or published release has been created. Do not label the current uncommitted work as shipped.

## Working rules

Remove completed tasks after verification. Keep code files within 500 lines, reuse shared configuration and utilities, update `openapi.json` for endpoint changes, use exact eligible dependency versions, and record completed work in the changelog. Run relevant tests, lint, formatting, Astro checks, and the production build before closing an item.
