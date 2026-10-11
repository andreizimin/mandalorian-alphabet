# Persistence Specs

**LLD**: docs/intent/persistence/persistence-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## State

- `[ ]` **PERS-001**: The system SHALL persist progress (learned set, peek counts, per-letter quiz rings, hint dismissals and whether the welcome card was seen), settings, current passage and position across reloads.
- `[x]` **PERS-005**: When a persisted slice of learner state changes, the system SHALL write it to on-device storage immediately.
- `[x]` **PERS-004**: If storage is unavailable, then the system SHALL run with in-memory state and show a banner that progress will not be saved.
- `[x]` **PERS-006**: If a stored slice cannot be parsed or fails validation, then the system SHALL start that slice fresh, keep the raw stored value under a backup key, and show a one-time notice that saved progress could not be read.

## Export and Import

- `[ ]` **PERS-002**: When the learner exports, the system SHALL download one JSON file named `script-ramp-YYYY-MM-DD.json` containing the app id, a format version, the export time and all learner state (progress, settings, current passage and position, pasted passages).
- `[x]` **PERS-003**: When the learner imports a valid export (app id `script-ramp`, a known format version, every slice passing its owning segment's validation), the system SHALL ask for confirmation and then replace and save the current state.
- `[x]` **PERS-007**: If the learner imports a file that is not a valid export, then the system SHALL leave current state unchanged and show an error that the file is not a Script Ramp export.
