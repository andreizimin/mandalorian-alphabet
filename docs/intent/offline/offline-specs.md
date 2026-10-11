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

- `[x]` **OFF-006**: The hosting SHALL serve the service worker, the manifest and `index.html` with `Cache-Control: no-cache`, serve hashed build assets with long-term caching, and attach `learn-mandalorian.andreizimin.com` only on the `production` stage.
