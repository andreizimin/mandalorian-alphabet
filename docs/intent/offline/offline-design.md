---
parent: high-level-design
prefix: OFF
---

# Offline

## Context and Design Philosophy

Reading on a phone often happens without a reliable connection. After the first visit, the app must work with no network, and installing it to the Home Screen should make it feel like an app: its own icon, full screen, no browser bars.

## Mechanism

- **Service worker:** generated at build time by `vite-plugin-pwa` (Workbox). It precaches every file the build produces: the app shell, the JavaScript bundle (which contains the bundled passages and the quiz word pool), the stylesheet, the Mandalorian font and the icons. Navigation requests fall back to the cached `index.html`, so the app opens offline from any URL.
- **Manifest:** name "Learn Mandalorian", short name "Mando" (what iOS shows under the icon; "Learn Mandalorian (Dev)" and "Mando Dev" on the dev stage, so the two installed apps are never confused), `display: standalone`, start URL `/`, background and theme colors matching the reading page.
- **Icons:** a Mandalorian glyph drawn from the bundled font on the app's reading background, at 180 px (`apple-touch-icon`, used by iOS) and 192 and 512 px (manifest). No franchise artwork or logos.
- Installing to the Home Screen also protects on-device storage from Safari's eviction of sites unused for 7 days.
- The shared feedback widget (see `feedback`) loads from another origin and is not precached; sending feedback needs a connection, and its button says so while offline.

## Updates

A new version is downloaded in the background the next time the app is opened with a connection. It takes over on the following launch, never mid-session, so a page never changes under the learner. Learner state lives in on-device storage, not in the cache, so updates never touch progress.

## Hosting

The app is static files served by SST's `StaticSite` on AWS (S3 behind CloudFront, DNS in the existing `andreizimin.com` Route 53 zone), the same setup as the portfolio site. Each deploy stage is a separate site:

| Stage | Address | Purpose |
|---|---|---|
| `production` | `learn-mandalorian.andreizimin.com` | The live app; deployed from `main` only |
| `dev` | `learn-mandalorian-dev.andreizimin.com` | A change order's branch, for checking on real devices before it reaches production |
| any other | a throwaway CloudFront URL | Personal experiments; never given a custom domain |

Different addresses are different browser origins, so each stage has its own learner data, its own service worker and its own offline cache. The stage is baked into each build (`VITE_STAGE`), which decides the installed app's name, the DEV marker and whether search engines may index the site: every build other than production is marked `noindex` and ships a `robots.txt` that disallows all crawling.

Hashed build assets are cached long-term. The service worker file, the manifest and `index.html` are served with `no-cache`, so a phone checks for a new version on every launch with a connection. The custom domains are attached only on their own stages, so no other stage can claim them.
## Verification

Playwright's WebKit build does not run service workers, so the offline browser test runs in Chromium: load once, go offline, reload, read and finish a quiz. Behavior on iOS Safari is checked on the device after deploy.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Caching | Precache every build file at install | Runtime cache only | Guarantees offline after first load; the whole app is a few hundred KB |
| Service worker source | `vite-plugin-pwa` (Workbox) | Hand-written service worker | The plugin knows the hashed file names from the build; a hand-written list would drift |
| Update timing | New version takes over on the next launch | Prompt to reload; take over immediately | A prompt interrupts reading; an immediate takeover could swap code mid-page. State is in storage, so a quiet next-launch update loses nothing |
| Hosting | SST `StaticSite` on AWS | GitHub Pages; Vercel | Matches the existing portfolio deployment and its Route 53 zone; one way to deploy across personal sites |
| Name | "Learn Mandalorian", short name "Mando" | "Script Ramp"; "Mando Reader" | Matches the domain and tells the learner exactly what it is |
