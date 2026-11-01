# Help Specs

**LLD**: docs/intent/help/help-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## The Panel

- `[x]` **HELP-001**: When the learner taps Help, the system SHALL open a Help panel over the page that says what the app does (reading real stories in which one letter at a time becomes a Mandalorian glyph, learned from context) and what each reader control and page-turn gesture does.
- `[x]` **HELP-002**: When the learner taps Close in the Help panel, taps outside it, or presses Escape, the system SHALL close it and show the same page as before it opened.
- `[x]` **HELP-003**: While the Help panel is open, the system SHALL ignore page-turn keys, swipes and edge taps.
- `[x]` **HELP-004**: The Help panel SHALL offer Replay intro, which closes the panel and shows the intro as INTRO-008 does, Let's go returning to the same passage.
- `[x]` **HELP-005**: When the Help panel's content is taller than the viewport, the system SHALL scroll the panel within itself, keeping Close reachable, while the page behind it stays put.
