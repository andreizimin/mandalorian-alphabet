---
parent: high-level-design
prefix: PERS
---

# Persistence

## Context and Design Philosophy

All state lives on the device. Storage can be unavailable or cleared, so the app must degrade gracefully rather than fail.

## Storage

- localStorage for progress and settings.
- IndexedDB for pasted texts and, if uploaded, the font blob.
- All storage access wrapped in try/catch.

## Export and Import

All state (font excluded) exports as one JSON file and imports after confirmation.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Sync | Manual JSON export/import | Cloud sync | No backend in v1 (HLD option B) |

## Open Questions & Future Decisions

### Deferred
1. Prompt Home Screen install on first visit to reduce iOS storage eviction.
