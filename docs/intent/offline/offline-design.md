---
parent: high-level-design
prefix: OFF
---

# Offline

## Context and Design Philosophy

Reading on a phone often happens without a reliable connection. After the first visit, the app must work with no network, and installing it to the Home Screen should make it feel like an app: its own icon, full screen, no browser bars.

## Mechanism

- **Service worker:** generated at build time by `vite-plugin-pwa` (Workbox). It precaches every file the build produces: the app shell, the JavaScript bundle (which contains the bundled passages and the quiz word pool), the stylesheet, the Mandalorian font and the icons. Navigation requests fall back to the cached `index.html`, so the app opens offline from any URL. The app registers the service worker itself (`src/offline/updates.ts`) rather than through the plugin's generated script, because it adds the foreground check and the reload rule in **Updates**.
- **Manifest:** name "Learn Mandalorian", short name "Mando" (what iOS shows under the icon; "Learn Mandalorian (Dev)" and "Mando Dev" on the dev stage, so the two installed apps are never confused), `display: standalone`, start URL `/`, background and theme colors matching the reading page.
- **Icons:** a Mandalorian glyph drawn from the bundled font on the app's reading background, at 180 px (`apple-touch-icon`, used by iOS) and 192 and 512 px (manifest). No franchise artwork or logos.
- Installing to the Home Screen also protects on-device storage from Safari's eviction of sites unused for 7 days.
- The shared feedback widget (see `feedback`) loads from another origin and is not precached; sending feedback needs a connection, and its button says so while offline.

## Updates

The app looks for a new version every time it opens and every time it returns to the foreground. The second matters on iPhone: a Home Screen app is usually suspended rather than closed, and a resumed app shows the same page without loading it, so the browser's own check on page load never runs. The check is a no-cache request for the service worker file and fails quietly with no connection.

A new version downloads in the background and takes control as soon as it is ready (Workbox `skipWaiting` and `clientsClaim`). Taking control does not change the page already on screen, which keeps running the code it loaded; this is safe because the build is one script and one stylesheet, both loaded before the learner sees anything. If the build ever splits code into files loaded later, an old page could ask for a file the new version has removed, and this rule needs revisiting.

Whether the learner sees the new version at once depends on when it arrives:

- **In the opening window** (within 10 seconds of opening or of returning to the foreground, and before any tap, click, scroll or key press since then), the app reloads once into the new version. The screen blinks and the learner lands on the same passage and position, which are saved across reloads (`persistence`).
- **Any later**, the page on screen stays as it is, and the new version is used from the next opening.

A page never changes under a learner who has started reading. The very first install also takes control of the page, but nothing changes for the learner then, so it never triggers a reload. At most one automatic reload happens per opening, so deploys landing close together cannot chain reloads. Learner state lives in on-device storage, not in the cache, so updates never touch progress.

## Hosting

The app is static files served by SST's `StaticSite` on AWS (S3 behind CloudFront, DNS in the existing `andreizimin.com` Route 53 zone), the same setup as the portfolio site. Each deploy stage is a separate site:

| Stage | Address | Purpose |
|---|---|---|
| `production` | `learn-mandalorian.andreizimin.com` | The live app; deployed from `main` only |
| `dev` | `learn-mandalorian-dev.andreizimin.com` | A change order's branch, for checking on real devices before it reaches production |
| any other | a throwaway CloudFront URL | Personal experiments; never given a custom domain |

Different addresses are different browser origins, so each stage has its own learner data, its own service worker and its own offline cache. The stage is baked into each build (`VITE_STAGE`), which decides the installed app's name, the DEV marker and whether search engines may index the site: every build other than production is marked `noindex` and ships a `robots.txt` that disallows all crawling.

Hashed build assets (the bundle, the stylesheet and the Workbox runtime the service worker imports) are cached long-term. The service worker file, the manifest, `index.html` and `robots.txt` are served with `no-cache`, so a phone checks for a new version on every launch with a connection. The host publishes only the files a caching rule covers, so the rules end with a `no-cache` catch-all: a file the build adds later is still published, and a service worker whose import is missing never installs. The custom domains are attached only on their own stages, so no other stage can claim them.

### Deploy pipeline

Deploys run on GitHub Actions (`.github/workflows/ci.yml`), not from a laptop:

| Push to | Runs | Then |
|---|---|---|
| any branch other than `main` | typecheck, unit tests, browser tests | deploy to `dev`, check the live dev site |
| `main` (a merged pull request) | the same tests | deploy to `production`, check the live production site |

The workflow signs in to AWS through GitHub's OpenID Connect provider and the role `gha-deploy-mandalorian-alphabet`, which trusts only this repository's GitHub environments `dev` and `production`; no AWS keys are stored anywhere. The `production` environment accepts only `main`. Deploys to one stage queue rather than overlap, so a later push never interleaves with an earlier deploy; `dev` shows the branch pushed last.

The live-site check (`e2e/live.spec.ts`, `npm run test:live`) runs against the deployed address, because a local server serves every file and cannot show what the host actually publishes. It requests every file of the build, checks the no-cache headers, the stage's names and indexing rules, and opens the app, goes offline and reloads it. A failed check fails the run; a bad production deploy is undone by reverting the pull request, which deploys the previous version the same way.

`npm run deploy:dev` and `npm run deploy:prod` deploy from a laptop with the same result, as a fallback when GitHub Actions is unavailable.

## Verification

Playwright's WebKit build does not run service workers, so the offline browser test runs in Chromium: load once, go offline, reload, read and finish a quiz. The update path is tested there too, by serving a changed service worker file: the page reloads into it in the opening window and stays put after an interaction. After every deploy the pipeline runs the live-site check against the deployed address. Behavior on iOS Safari is checked on the device, on dev, before a change reaches production.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Caching | Precache every build file at install | Runtime cache only | Guarantees offline after first load; the whole app is a few hundred KB |
| Service worker source | `vite-plugin-pwa` (Workbox) | Hand-written service worker | The plugin knows the hashed file names from the build; a hand-written list would drift |
| Update timing | Take control as soon as downloaded; reload once only in the 10-second opening window before any interaction | Wait until every copy of the app closes; never reload; a "tap to update" note | Waiting left iPhone Home Screen apps on an old version for several openings, because suspended apps are rarely closed. Never reloading still shows a change one launch late, as a Home Screen app has no reload button. A note interrupts reading. Reloading before the learner starts loses nothing, as position is saved |
| Hosting | SST `StaticSite` on AWS | GitHub Pages; Vercel | Matches the existing portfolio deployment and its Route 53 zone; one way to deploy across personal sites |
| Where deploys run | GitHub Actions, signed in through OpenID Connect | `sst deploy` from a laptop | Every deploy follows passing tests, uses no stored keys, and does not depend on one machine; the laptop scripts stay as a fallback |
| Production trigger | A merge into `main` deploys production | A GitHub "approve deployment" button; a manual workflow run | The requester's go on the dev site is the one approval; a second button would only repeat it. A revert undoes a bad deploy the same way |
| Name | "Learn Mandalorian", short name "Mando" | "Script Ramp"; "Mando Reader" | Matches the domain and tells the learner exactly what it is |
