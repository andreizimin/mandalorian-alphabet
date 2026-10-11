# Progression Specs

**LLD**: docs/intent/progression/progression-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Order and Advancing

- `[ ]` **PROG-001**: The system SHALL introduce letters in the active alphabet's order, defaulting to English frequency order.
- `[ ]` **PROG-002**: When the learner advances, the system SHALL add exactly one letter to the learned set and show its intro card.
- `[ ]` **PROG-003**: The intro card SHALL show the glyph, its Latin letter and up to 3 words from the current passage containing it.
- `[ ]` **PROG-010**: The system SHALL allow the learner to advance at any time, whether or not a readiness hint is showing.

## Readiness Hint

- `[ ]` **PROG-004**: When the newest letter has fewer than 2 peeks over the last 2 pages, the system SHALL show a non-blocking "ready for the next letter" hint that names reading as its signal.
- `[ ]` **PROG-008**: When at least 4 of the last 5 recorded quiz answers targeting the newest letter are correct, the system SHALL show a non-blocking "ready for the next letter" hint that names the quiz as its signal.
- `[ ]` **PROG-009**: The system SHALL keep, for each letter, a ring of the last 5 quiz answers targeting it (`Progress.quizByLetter`), newest last, as part of progress state.

## Step Back and Reset

- `[ ]` **PROG-005**: When the learner steps back, the system SHALL remove the most recently added letter from the learned set.
- `[ ]` **PROG-006**: When the learner confirms reset, the system SHALL clear the learned set and peek counts.

## Legend

- `[ ]` **PROG-007**: The system SHALL show a legend of all learned letters, reachable in one tap from the reader.
