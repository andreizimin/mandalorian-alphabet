---
parent: high-level-design
prefix: PERS
---

# Persistence

## Context and Design Philosophy

All learner state lives on the device. Storage can be unavailable, cleared or corrupted, so the app must degrade gracefully rather than fail, and it must never silently throw away progress it could have kept.

## Storage

- **localStorage** for progress (learned letters, peek counts, quiz rings, hint and welcome flags) and settings, under versioned keys (`script-ramp:v1:progress`, `script-ramp:v1:settings`).
- **IndexedDB** for pasted passages, which can be larger than localStorage comfortably holds.
- Every storage access is wrapped so a thrown error becomes a handled state, never a crash.

Each segment owns the shape of its own state; persistence stores and restores it as an opaque **slice** under its own key and validates it with the owning segment's validator. Progress is the first slice; settings and pasted passages join when `layout` and `content` are built.

## Saving and Restoring

- **When:** a slice is written immediately after every change to it. Changes are small and rare (a tap, a page turn), so there is nothing to batch.
- **Startup:** the app checks once whether storage works by writing and removing a probe key. If it fails, the app runs on in-memory state and shows a banner that progress will not be saved.
- **Unreadable data:** if a stored slice fails to parse or validate (corruption, or a version this build does not know), the app starts that slice fresh, copies the raw value to a backup key (`script-ramp:v1:progress:unreadable`) so it is not lost, and shows a one-time notice.

## Export and Import

An export is one JSON file named `script-ramp-YYYY-MM-DD.json`:

```json
{ "app": "script-ramp", "version": 1, "exportedAt": "2026-10-10T18:00:00Z", "progress": { ... } }
```

Settings and pasted passages are added as fields when their segments exist. The font ships with the app and is never part of an export.

A file is a **valid export** when it parses as JSON, `app` is `"script-ramp"`, `version` is one this build knows, and every slice present passes its owning segment's validator. For progress that means: `learned` is a list of distinct letters a–z; peek counts are non-negative integers keyed by learned letters; each quiz ring holds at most 5 booleans; flags are booleans.

Importing a valid export asks for confirmation, then replaces the current state and saves it. Importing anything else changes nothing and shows an error that says the file is not a Script Ramp export.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Sync | Manual JSON export/import | Cloud sync | No backend in v1 (HLD option B) |
| Slice ownership | Each segment owns its state shape and validator | One central schema in persistence | Keeps the state shape next to the logic that uses it; persistence stays a thin, reusable layer |
| Unreadable data | Start fresh, keep a backup copy, tell the learner | Refuse to start; silently start fresh | Refusing strands the learner; silent reset loses progress with no explanation and no way back |
| Write timing | Write on every change | Debounced or on page hide | Changes are small and infrequent; a write on every change cannot lose the last tap when iOS kills a backgrounded tab |
| Import confirmation | In-app confirm step | Browser `confirm()` dialog | Matches the reset confirmation and works in installed Home Screen apps |

## Open Questions & Future Decisions

### Deferred
1. Prompt Home Screen install on first visit to reduce iOS storage eviction.
2. Migrating a `version: 1` slice when a later build changes a state shape. Until then an unknown version is treated as unreadable.
