# CO-004: Dev environment

| | |
|---|---|
| Type | Feature |
| Status | Proposed |
| Requested | 2026-10-12 |
| Approved | |
| Completed | |
| Ticket | [ZZF-62](https://linear.app/zizify-workshop/issue/ZZF-62) |

## Request

"I need a dev env - learn-mandalorian-dev.andreizimin.com to test out changes before they go into production"

## Intent

Every change can be tried on a real phone and laptop at a stable dev address before it reaches the live app. Dev is a full copy of the app, deployed from the same code with its own storage and its own offline cache, clearly marked as dev so it is never mistaken for production.

## Findings That Shape the Plan

- **Only production has a domain today.** `deploy/hosting.ts` gives `learn-mandalorian.andreizimin.com` to the `production` stage and nothing to any other stage; `npm run deploy` deploys a personal stage to an anonymous CloudFront URL (the earlier test copy at `d3timh0n9to9fe.cloudfront.net`, still live).
- **Separate address, separate data.** A different hostname is a different browser origin, so dev and production never share progress, settings, pasted passages or service worker caches.
- **The feedback widget would call dev "prod".** The widget sets the ticket's Env from the hostname and recognises `dev.`, `staging.`, `stage.` and `preview.` as labels of their own. `learn-mandalorian-dev.` does not match, so feedback sent from dev would arrive in Linear marked `Env: prod`.
- **Two identical apps would be confusing.** Both would install to the Home Screen as "Mando" with the same icon, and a public dev site can be indexed by search engines.

## Predicted Impact

### HLD

- System Design: hosting names both addresses, production and dev, and the deploy flow (dev first, then production).

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

- **Process:** `CLAUDE.md` (Commands; Change Orders step 4) records the new flow: every change deploys to dev, is checked there, then goes to production.
- **AWS:** a new `dev` stage (S3, CloudFront, certificate, a DNS record in the `andreizimin.com` zone) created by the first dev deploy, which needs your approval like any deploy. Removing the old personal test stage (decision 4) also needs approval.
- **feedback-platform:** only if decision 1 picks the widget change (one more PR).

## Cross-Segment Effects

- **feedback:** dev feedback labelling (decision 1).
- **layout:** the DEV marker on the title line.
- **offline:** hosting and manifest per stage; each environment has its own service worker and update cycle.
- **reader, progression, quiz, content, persistence, alphabet:** none.

## Decisions Needed

1. **Feedback sent from dev.** *Recommended:* a one-line widget change so hostnames containing `-dev.` (and `-staging.`, `-preview.`) count as dev, so dev feedback arrives as `Env: dev` for every app that uses this naming; a PR on its own ticket, like ZZF-57. *Alternatives:* accept dev feedback marked `Env: prod` (the DEV marker and URL in the ticket still show where it came from); hide the Feedback button on dev; or use `dev.learn-mandalorian.andreizimin.com`, which the widget already recognises, instead of the requested name.
2. **Telling dev apart.** *Recommended:* a small "DEV" marker on the title line and the installed name "Mando Dev". *Alternative:* no visible difference beyond the address.
3. **Search engines.** *Recommended:* dev is marked `noindex` and disallowed in `robots.txt`. *Alternative:* leave it indexable.
4. **The old test stage** at `d3timh0n9to9fe.cloudfront.net`. *Recommended:* remove it once dev is live; dev replaces it. *Alternative:* keep it.
5. **The flow for future changes.** *Recommended:* every change order deploys to dev first; you check there; production follows on your go. *Alternative:* dev is optional, used only when you ask.

## Risks and Edge Cases

- **Dev drifting from production:** both deploy from the same code; dev is just the earlier step. A change that is never promoted stays only on dev, which is the point.
- **Shared AWS account:** the dev stage lives beside production in the same account and region; it uses `removal: remove`, so tearing it down never touches production, whose resources are retained.
- **Two installed apps on one phone:** distinct names and the DEV marker keep them apart; each has its own data.
- **Feedback tickets from dev** land in the same Linear project; decision 1 decides how they are labelled.
- **Build-time stage:** the stage is baked into each build, so a dev build can never be deployed as production by mistake without being rebuilt; the production deploy rebuilds with `VITE_STAGE=production`.

## Verification

- Unit tests for domains per stage, manifest names, the stage reader and the DEV marker.
- Browser tests still run against local builds, which behave as non-production builds.
- After the first dev deploy (with your approval): `learn-mandalorian-dev.andreizimin.com` serves the app over HTTPS, shows the DEV marker, sends `noindex`, and production is unchanged.

---

## Outcome

To be filled in when the change is complete.
