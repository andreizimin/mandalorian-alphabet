# Persistence Specs

**LLD**: docs/intent/persistence/persistence-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## State

- `[ ]` **PERS-001**: The system SHALL persist progress (learned set, peek counts and per-letter quiz rings), settings, current passage and position across reloads.
- `[ ]` **PERS-004**: If storage is unavailable, then the system SHALL run with in-memory state and show a banner that progress will not be saved.

## Export and Import

- `[ ]` **PERS-002**: When the learner exports, the system SHALL download one JSON file with all learner state (progress, settings, current passage and position, pasted passages).
- `[ ]` **PERS-003**: When the learner imports a valid export, the system SHALL replace current state after confirmation.
