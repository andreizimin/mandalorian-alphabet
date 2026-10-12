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

- `[x]` **OFF-006**: The hosting SHALL serve the service worker, the manifest and `index.html` with `Cache-Control: no-cache`, serve hashed build assets with long-term caching, and attach `learn-mandalorian.andreizimin.com` to the `production` stage, `learn-mandalorian-dev.andreizimin.com` to the `dev` stage, and no custom domain to any other stage.
- `[x]` **OFF-007**: While the app is built for any stage other than `production`, the system SHALL tell search engines not to index it, with a `noindex` meta tag and a `robots.txt` that disallows all crawling.
- `[x]` **OFF-008**: While the app is built for the `dev` stage, the system SHALL name the installable app "Learn Mandalorian (Dev)" with short name "Mando Dev" and show a "DEV" marker after the passage title.
