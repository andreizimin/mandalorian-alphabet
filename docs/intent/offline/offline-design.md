---
parent: high-level-design
prefix: OFF
---

# Offline

## Context and Design Philosophy

Reading on a phone often happens without a reliable connection. After the first visit, the app must work with no network.

## Mechanism

- A service worker precaches the app shell, bundled passages, the quiz word lists and the bundled Mandalorian font.
- A web app manifest lets the app install to the iOS Home Screen and launch full screen. Installing also protects on-device storage from Safari's eviction of unused sites.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Caching | Precache at install | Runtime cache only | Guarantees offline after first load |
