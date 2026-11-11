# Help Specs

**LLD**: docs/intent/help/help-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## The Panel

- `[x]` **HELP-001**: When the learner taps Help, the system SHALL open a Help panel over the page that says what the app does (reading real stories in which one letter at a time becomes a Mandalorian glyph, learned from context) and what each reader control and page-turn gesture does.
- `[x]` **HELP-002**: When the learner taps Close in the Help panel, taps outside it, or presses Escape, the system SHALL close it and show the page holding the word the learner was reading before it opened, even if the pages were recut while it was open.
- `[x]` **HELP-003**: While the Help panel is open, the system SHALL ignore every page-turn input: keys, swipes, edge taps and the on-screen page-turn buttons.
- `[x]` **HELP-004**: The Help panel SHALL offer Replay intro, which closes the panel and shows the intro as INTRO-008 does; Let's go SHALL then show the page holding the word the learner was reading, with the panel closed.
- `[x]` **HELP-005**: When the Help panel's content is taller than the viewport, the system SHALL scroll the panel within itself, keeping Close pinned at the top at every scroll position, while the page behind it stays put.
- `[x]` **HELP-008**: When the learner taps outside the Help panel, the system SHALL close the panel without the tap reaching any control, glyph or edge zone beneath it.
- `[x]` **HELP-009**: The system SHALL offer Help from the reader only.
- `[x]` **HELP-013**: While the new-letter card, the end-of-passage card, the menu or the feedback form is open, when the Help key is activated, the system SHALL do nothing.

## Focus and Assistive Technology

- `[x]` **HELP-006**: When the Help panel opens, the system SHALL move keyboard focus to its Close key; when the learner closes it with Close, a tap outside or Escape, the system SHALL move focus to the Help key on screen at that moment.
- `[x]` **HELP-012**: When the learner chooses Replay intro in the Help panel, the system SHALL move keyboard focus to the intro terminal.
- `[x]` **HELP-007**: While the Help panel is open, the system SHALL present it as a modal dialog labelled "Help" and SHALL keep keyboard focus and screen-reader navigation within it, the page behind being inert.

## Content

- `[x]` **HELP-010**: The Help panel SHALL describe the controls in the same words at every width, and SHALL show a note about the ⋯ menu that names where its key is at the current width: in the bottom bar under 600 px, in the top bar at 600 px or wider.
- `[x]` **HELP-011**: The quiz facts the Help panel states (the number of questions in a session and the number of letters the quiz needs) SHALL be the values the quiz uses.
