# Progression Specs

**LLD**: docs/intent/progression/progression-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Order and Advancing

- `[x]` **PROG-001**: The system SHALL introduce letters in English letter frequency order (E, T, A, O, I, N, ...).
- `[x]` **PROG-002**: When the learner advances, the system SHALL add exactly one letter to the learned set and show its intro card.
- `[x]` **PROG-003**: The intro card SHALL show the glyph, its Latin letter and up to 3 words from the current passage containing it.
- `[x]` **PROG-010**: While at least one letter in the order is not yet learned, the system SHALL allow the learner to advance at any time, whether or not a readiness hint is showing.
- `[x]` **PROG-013**: While every letter in the order is learned, the system SHALL disable advance and show no readiness hint.
- `[x]` **PROG-014**: When the app is launched with an empty learned set for the first time, the system SHALL show a one-time welcome card over the opening passage that points at the advance control; no letter is introduced until the learner taps advance.

## Readiness Hint

- `[x]` **PROG-004**: When at least 2 pages have been read since the newest letter was introduced and the last 2 of those pages carry fewer than 2 peeks on it, the system SHALL show a non-blocking "ready for the next letter" hint that names reading as its signal.
- `[x]` **PROG-008**: When at least 4 of the last 5 recorded quiz answers targeting the newest letter are correct, the system SHALL show a non-blocking "ready for the next letter" hint that names the quiz as its signal.
- `[x]` **PROG-011**: When the reading signal (PROG-004) and the quiz signal (PROG-008) hold at the same time, the system SHALL show a single hint naming both signals.
- `[x]` **PROG-012**: When the learner dismisses the readiness hint, the system SHALL hide it for the signal that produced it until the learner next advances, and SHALL show it once more if the other signal later holds, naming that signal.
- `[x]` **PROG-009**: The system SHALL keep, for each letter, a ring of the last 5 quiz answers targeting it (`Progress.quizByLetter`), newest last, as part of progress state.

## Step Back and Reset

- `[x]` **PROG-005**: When the learner steps back, the system SHALL remove the most recently added letter from the learned set and clear that letter's peek count and quiz ring.
- `[x]` **PROG-006**: When the learner confirms reset, the system SHALL clear the learned set, all peek counts and all quiz rings.

## Legend

- `[x]` **PROG-007**: The system SHALL show a legend of all learned letters, reachable from the reader controls (one tap at 600 px or wider; from the menu sheet under 600 px, per LAYOUT-002).
- `[ ]` **PROG-015**: The system SHALL draw every glyph on the intro card (the new letter and its example words) and the legend's entry for the newest learned letter in the same highlight color as the reader (READ-008).
