# CO-004: Dev environment and branch flow

| | |
|---|---|
| Type | Feature |
| Status | Done |
| Requested | 2026-10-12 |
| Approved | 2026-10-12 |
| Completed | 2026-10-12 |
| Ticket | [ZZF-62](https://linear.app/zizify-workshop/issue/ZZF-62) |

## Request

"I need a dev env - learn-mandalorian-dev.andreizimin.com to test out changes before they go into production"

Then, while reviewing this change order: "all changes first go to a feature branch - right?" They had not: every change so far was committed straight to `main`. Answered: a branch and pull request per change, with tests run automatically; the agent merges on the requester's go; no branch protection; folded into this change order.

## Intent

Every change can be tried on a real phone and laptop at a stable dev address before it reaches the live app. Dev is a full copy of the app, deployed from the same code with its own storage and its own offline cache, clearly marked as dev so it is never mistaken for production.

Each change order lives on its own branch until it is accepted:

1. A branch per change order, named after its ticket (for example `zzf-62-dev-environment`).
2. A pull request into `main` linking the change order. Continuous integration runs the typecheck, unit tests and browser tests on every push.
3. The branch is deployed to dev; the requester checks it there.
4. On the requester's go, the agent merges the pull request; production deploys from `main` after the merge, again on the requester's go.

## Findings That Shape the Plan

- **Only production has a domain today.** `deploy/hosting.ts` gives `learn-mandalorian.andreizimin.com` to the `production` stage and nothing to any other stage; `npm run deploy` deploys a personal stage to an anonymous CloudFront URL (the earlier test copy at `d3timh0n9to9fe.cloudfront.net`, still live).
- **Separate address, separate data.** A different hostname is a different browser origin, so dev and production never share progress, settings, pasted passages or service worker caches.
- **The feedback widget would call dev "prod".** The widget sets the ticket's Env from the hostname and recognises `dev.`, `staging.`, `stage.` and `preview.` as labels of their own. `learn-mandalorian-dev.` does not match, so feedback sent from dev would arrive in Linear marked `Env: prod`.
- **Two identical apps would be confusing.** Both would install to the Home Screen as "Mando" with the same icon, and a public dev site can be indexed by search engines.

## Predicted Impact

### HLD

- System Design: hosting names both addresses, production and dev, and the change flow (branch, pull request with CI, dev deploy, merge, production deploy).

### LLDs

| Component | Section | Change |
|---|---|---|
| `offline` | Hosting | Stages and domains: `production` → `learn-mandalorian.andreizimin.com`, `dev` → `learn-mandalorian-dev.andreizimin.com`, any other stage → a throwaway CloudFront URL; dev pages are excluded from search engines |
| `offline` | Mechanism (manifest) | On dev, the installed app is named "Mando Dev" |
| `layout` | Reader Controls | A small "DEV" marker on the title line on dev only |
| `feedback` | Loading the Widget | How dev feedback is labelled (decision 1) |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `OFF-006` | Revise | The hosting SHALL serve the service worker, the manifest and `index.html` with `Cache-Control: no-cache`, serve hashed build assets with long-term caching, and attach `learn-mandalorian.andreizimin.com` to the `production` stage, `learn-mandalorian-dev.andreizimin.com` to the `dev` stage, and no custom domain to any other stage. |
| `OFF-007` | Add | While the app is built for any stage other than `production`, the system SHALL tell search engines not to index it (`noindex` meta tag and a `robots.txt` disallowing all). |
| `OFF-008` | Add | While the app is built for the `dev` stage, the system SHALL name the installable app "Mando Dev" and show a "DEV" marker on the passage-title line. |
| `FEED-006` | Add | Only if decision 1 needs an app-side change. |

Net: +2 or +3 new, ~1 revised, 0 deleted.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `deploy/hosting.test.ts` | Change | `OFF-006` (dev domain; other stages none) |
| `src/offline/pwaOptions.test.ts` | Change | `OFF-008` (manifest name per stage) |
| `src/stage.test.ts` | Add | `OFF-007`, `OFF-008` (stage read from the build, `isProduction`, `isDev`) |
| `src/layout/ReaderChrome.test.tsx` | Change | `OFF-008` (DEV marker only on dev) |

### Code

| File | Action | What changes |
|---|---|---|
| `deploy/hosting.ts` | Change | `domainFor('dev')` returns the dev domain |
| `sst.config.ts` | Change | Passes the stage to the build (`VITE_STAGE`) |
| `src/stage.ts` | Add | Reads the build stage |
| `src/offline/pwaOptions.ts` | Change | Manifest name by stage |
| `vite.config.ts` | Change | `noindex` meta and `robots.txt` for non-production builds |
| `src/layout/ReaderChrome.tsx` | Change | DEV marker on the title line |
| `package.json` | Change | `deploy:dev` script; plain `deploy` points at dev |

### Other

- **CI:** `.github/workflows/ci.yml` (new) runs the typecheck, unit tests and browser tests (WebKit and Chromium) on every push and pull request.
- **Process:** `CLAUDE.md` records the branch, pull request, dev and production flow in the Change Orders section and Commands; the fixed commit command pushes the current branch (`git push -u origin HEAD`).
- **This change order is the first to use the flow:** its work happens on branch `zzf-62-dev-environment`.
- **AWS:** a new `dev` stage (S3, CloudFront, certificate, a DNS record in the `andreizimin.com` zone) created by the first dev deploy, which needs your approval like any deploy. Removing the old personal test stage (decision 4) also needs approval.
- **feedback-platform:** only if decision 1 picks the widget change (one more PR).

## Cross-Segment Effects

- **feedback:** dev feedback labelling (decision 1).
- **layout:** the DEV marker on the title line.
- **offline:** hosting and manifest per stage; each environment has its own service worker and update cycle.
- **reader, progression, quiz, content, persistence, alphabet:** none.

## Decisions Needed

All answered on 2026-10-12. Decisions 1–4 took the recommended option: a widget pull request so `-dev.` hostnames count as dev (on its own ticket); a DEV marker plus the installed name "Mando Dev"; `noindex` on non-production builds; remove the old test stage once dev is live. Decision 5 is recorded below.

1. **Feedback sent from dev.** *Recommended:* a one-line widget change so hostnames containing `-dev.` (and `-staging.`, `-preview.`) count as dev, so dev feedback arrives as `Env: dev` for every app that uses this naming; a PR on its own ticket, like ZZF-57. *Alternatives:* accept dev feedback marked `Env: prod` (the DEV marker and URL in the ticket still show where it came from); hide the Feedback button on dev; or use `dev.learn-mandalorian.andreizimin.com`, which the widget already recognises, instead of the requested name.
2. **Telling dev apart.** *Recommended:* a small "DEV" marker on the title line and the installed name "Mando Dev". *Alternative:* no visible difference beyond the address.
3. **Search engines.** *Recommended:* dev is marked `noindex` and disallowed in `robots.txt`. *Alternative:* leave it indexable.
4. **The old test stage** at `d3timh0n9to9fe.cloudfront.net`. *Recommended:* remove it once dev is live; dev replaces it. *Alternative:* keep it.
5. **The flow for future changes.** Answered on 2026-10-12: a branch and pull request per change order, CI on every push, a dev deploy from the branch for checking, the agent merges on the requester's go, production from `main`; no branch protection on `main`.

## Risks and Edge Cases

- **Dev drifting from production:** both deploy from the same code; dev is just the earlier step. A change that is never promoted stays only on dev, which is the point.
- **Shared AWS account:** the dev stage lives beside production in the same account and region; it uses `removal: remove`, so tearing it down never touches production, whose resources are retained.
- **Two installed apps on one phone:** distinct names and the DEV marker keep them apart; each has its own data.
- **Feedback tickets from dev** land in the same Linear project; decision 1 decides how they are labelled.
- **No branch protection:** the flow is a convention recorded in `CLAUDE.md`; nothing technical stops a direct push to `main`.
- **Browser tests in CI:** WebKit and Chromium run on GitHub's Linux machines, not on macOS or iOS, so CI catches layout regressions but not every Safari difference; the dev deploy on a real device covers that.
- **Build-time stage:** the stage is baked into each build, so a dev build can never be deployed as production by mistake without being rebuilt; the production deploy rebuilds with `VITE_STAGE=production`.

## Verification

- Unit tests for domains per stage, manifest names, the stage reader and the DEV marker.
- Browser tests still run against local builds, which behave as non-production builds.
- CI passes on the pull request for this change.
- After the first dev deploy (with your approval): `learn-mandalorian-dev.andreizimin.com` serves the app over HTTPS, shows the DEV marker, sends `noindex`, and production is unchanged.

---

## Outcome

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | System Design: both addresses and the change flow | As predicted | |
| LLDs | 4 sections in `offline`, `layout`, `feedback` | 4 sections, plus `offline` caching rules | Caching rules not predicted (surprise 2) |
| Specs | +2–3 ~1 −0 | +2 ~2 −0 | OFF-007, OFF-008 added; OFF-006 revised (domains as predicted, then "publish every build file"); FEED-001 revised (widget pin), not predicted; FEED-006 not needed |
| Tests | 4 files | 6 files | Also `src/feedback/feedback.test.tsx` (pin) and a new OFF-006 case in `deploy/hosting.test.ts` |
| Code | 7 files | 9 files, plus CSS | Also `src/App.tsx` (passes the stage to the title line) and `src/feedback/useFeedbackWidget.ts` (pin); `src/app.css` styles the marker |
| Other | CI, `CLAUDE.md`, branch flow, AWS dev stage, a widget PR | As predicted | Widget PR on its own ticket (ZZF-63); old test stage removed |

### Surprises

1. **The widget pin had to move, and in a set order.** Labelling dev feedback needed widget 1.1.1, so the app's pin moved from `?v=1.1.0` to `?v=1.1.1` (FEED-001). Because the widget CDN ignores the query string (ZZF-58), the widget release had to be live before any app build pinning it was deployed.
2. **The first dev deploy found a production bug that predates this change.** SST uploads only files some caching rule covers. `robots.txt` (new here) and `workbox-*.js` (there since the first deploy) matched no rule, so neither was published. Without the Workbox runtime the service worker never installs, so **offline had never worked in production**. Every browser test passed because they run against a local server that serves every file. The fix covers both files, adds a catch-all rule first, and adds a test that unknown files are still published. The check that caught it was the live-site check from Verification; checks against a deployed stage are now part of every change.
3. **A merge raced a push.** PR #1 was merged 31 seconds before the hosting fix reached the branch, so the fix went to `main` through a second pull request (#2). Production was deployed only after both were in.
4. **The flow's first run was partly direct.** This change order's proposal was committed straight to `main` (the last direct commit); everything after approval went through the branch.
5. **Fresh DNS names are cached as missing.** Right after the first dev deploy, local and some public resolvers still answered "no such host" from a negative cache, though the record existed; checks pinned the address until it cleared.

### Commits

| Hash | Message |
|---|---|
| `f95c2f1` | CO-004 proposed (on `main`) |
| `5da44ac` | CO-004 approved: start on branch zzf-62-dev-environment |
| `ad551d4` | CO-004: design and specs for the dev environment and branch flow (ZZF-62) |
| `8f3f711` | CO-004: dev stage, stage-aware builds, DEV marker and CI (ZZF-62) |
| `da40bd5` | Merge pull request #1 |
| `56f44fd` | CO-004: publish every build file (robots.txt, Workbox runtime) |
| `cce65a7` | Merge pull request #2 |

Widget side (feedback-platform, ZZF-63): PR #2, released as 1.1.1.

### Measurements

| | |
|---|---|
| Tests before → after | unit 259 → 266, browser 52 → 52 |
| Lines changed | +120 −22 (code, 9 files), +89 −13 (tests, 5 files), +31 −2 (CI and config, 3 files), +26 −10 (design docs, specs, `CLAUDE.md`) |
| CI | 4 runs on the branch and `main`, all green |
| Agent time | about 30 minutes from approval (16:16) to completion (16:46), including the widget release and two merges |
| Deployed | 2026-10-12: dev at learn-mandalorian-dev.andreizimin.com from the branch; production at learn-mandalorian.andreizimin.com from `main` (`cce65a7`). Live checks on production: `workbox-*.js` and `robots.txt` (`Allow: /`) served, no `noindex`, installed name "Mando", widget `?v=1.1.1`, service worker activates and the page reloads offline. Old test stage `andreizimin` removed. |

### Departures recorded during the work

- **Widget pin bumped to `?v=1.1.1`** (FEED-001 revised), so the widget labels dev submissions as dev; needed widget PR #2 (ZZF-63) live first, because the widget CDN ignores the query string.
- **Hosting dropped unlisted files** (OFF-006 revised; `deploy/hosting.ts`, `deploy/hosting.test.ts`, offline design). The first dev deploy answered `robots.txt` with 403: SST uploads only the files some caching rule covers. The same gap hid `workbox-*.js`, which the service worker imports, so **production's service worker has never installed and offline has never worked there** since the first deploy. The browser tests run against a local server, which serves every file, so they could not see it. Fix: the rules now cover `robots.txt` and `workbox-*.js` and start with a `no-cache` catch-all.
