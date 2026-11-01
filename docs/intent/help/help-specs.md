# Help Specs

**LLD**: docs/intent/help/help-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## The Panel

- `[x]` **HELP-001**: When the learner taps Help, the system SHALL open a Help panel over the page that says what the app does (reading real stories in which one letter at a time becomes a Mandalorian glyph, learned from context) and what each reader control and page-turn gesture does.
- `[ ]` **HELP-002**: When the learner taps Close in the Help panel, taps outside it, or presses Escape, the system SHALL close it and show the same place in the passage as before it opened, even if the pages were recut while it was open.
- `[ ]` **HELP-003**: While the Help panel is open, the system SHALL ignore every page-turn input: keys, swipes, edge taps and the on-screen page-turn buttons.
- `[ ]` **HELP-004**: The Help panel SHALL offer Replay intro, which closes the panel and shows the intro as INTRO-008 does; Let's go SHALL return to the same place in the passage with the panel closed.
- `[ ]` **HELP-005**: When the Help panel's content is taller than the viewport, the system SHALL scroll the panel within itself, keeping Close pinned at the top at every scroll position, while the page behind it stays put.
- `[ ]` **HELP-008**: When the learner taps outside the Help panel, the system SHALL close the panel without the tap reaching any control, glyph or edge zone beneath it.
- `[ ]` **HELP-009**: The system SHALL offer Help from the reader only, and SHALL NOT open the Help panel while the new-letter card, the end-of-passage card, the phone menu sheet or the feedback form is open.

## Focus and Assistive Technology

- `[ ]` **HELP-006**: When the Help panel opens, the system SHALL move keyboard focus to its Close key; when it closes, the system SHALL return focus to the Help key that opened it.
- `[ ]` **HELP-007**: While the Help panel is open, the system SHALL present it as a modal dialog labelled "Help" and SHALL keep keyboard focus and screen-reader navigation within it, the page behind being inert.

## Content

- `[ ]` **HELP-010**: The Help panel SHALL describe the controls in the same words at every width, and SHALL show the note about the ⋯ menu only while the viewport is under 600 px wide.
- `[ ]` **HELP-011**: The quiz facts the Help panel states (the number of questions in a session and the number of letters the quiz needs) SHALL be the values the quiz uses.
