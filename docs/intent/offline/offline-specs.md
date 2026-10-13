# Offline Specs

**LLD**: docs/intent/offline/offline-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Working Offline

- `[x]` **OFF-001**: After first load, the system SHALL open and display bundled passages with no network.
- `[x]` **OFF-003**: After first load, the system SHALL run a complete quiz session with no network, including the bundled word pool.
- `[x]` **OFF-004**: When a new version is available, the system SHALL download it in the background and use it from the next launch, without reloading or changing the current session.

## Installing

- `[x]` **OFF-002**: The system SHALL provide a web app manifest named "Learn Mandalorian" with short name "Mando", standalone display and start URL `/`, so it installs to the iOS Home Screen and launches full screen.
- `[x]` **OFF-005**: The system SHALL provide Home Screen icons showing a Mandalorian glyph: an `apple-touch-icon` of 180 px and manifest icons of 192 and 512 px.

## Hosting

- `[x]` **OFF-006**: The hosting SHALL publish every file the build produces, serve the service worker, the manifest and `index.html` with `Cache-Control: no-cache`, serve hashed build assets (including the Workbox runtime) with long-term caching, and attach `learn-mandalorian.andreizimin.com` to the `production` stage, `learn-mandalorian-dev.andreizimin.com` to the `dev` stage, and no custom domain to any other stage.
- `[x]` **OFF-007**: While the app is built for any stage other than `production`, the system SHALL tell search engines not to index it, with a `noindex` meta tag and a `robots.txt` that disallows all crawling.
- `[x]` **OFF-008**: While the app is built for the `dev` stage, the system SHALL name the installable app "Learn Mandalorian (Dev)" with short name "Mando Dev" and show a "DEV" marker after the passage title.

## Deploy pipeline

- `[x]` **OFF-011**: When a branch other than `main` is pushed and its typecheck, unit tests and browser tests pass, the pipeline SHALL deploy it to the `dev` stage and then run the live-site check against the dev address.
- `[x]` **OFF-012**: When `main` changes and its typecheck, unit tests and browser tests pass, the pipeline SHALL deploy it to the `production` stage and then run the live-site check against the production address.
- `[x]` **OFF-013**: The live-site check SHALL fail unless every file of the build is served, the service worker, the manifest and `index.html` are served with `Cache-Control: no-cache`, the stage's names and indexing rules (OFF-007, OFF-008) hold, and the app opens with no network after its first visit.
