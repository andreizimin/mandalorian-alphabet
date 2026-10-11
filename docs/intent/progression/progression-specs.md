# Progression Specs

**LLD**: docs/intent/progression/progression-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Order and Advancing

- `[ ]` **PROG-001**: The system SHALL introduce letters in the active alphabet's order, defaulting to English frequency order.
- `[ ]` **PROG-002**: When the learner advances, the system SHALL add exactly one letter to the learned set and show its intro card.
- `[ ]` **PROG-003**: The intro card SHALL show the glyph, its Latin letter and up to 3 words from the current passage containing it.
- `[ ]` **PROG-004**: When the newest letter has fewer than 2 peeks over the last 2 pages, the system SHALL show a non-blocking "ready for the next letter" hint.

## Step Back and Reset

- `[ ]` **PROG-005**: When the learner steps back, the system SHALL remove the most recently added letter from the learned set.
- `[ ]` **PROG-006**: When the learner confirms reset, the system SHALL clear the learned set and peek counts.

## Legend

- `[ ]` **PROG-007**: The system SHALL show a legend of all learned letters, reachable in one tap from the reader.
