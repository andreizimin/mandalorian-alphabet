# Intro Specs

**LLD**: docs/intent/intro/intro-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Terminal

- `[x]` **INTRO-001**: While the intro is shown, the system SHALL present it as a full-screen terminal in place of the reader, typing its text out character by character.
- `[x]` **INTRO-002**: When the intro starts typing, the system SHALL first type "Hello, adventurer!" with every letter drawn as a Mandalorian glyph, hold it alone for at least 2 seconds, then type the same line in the reading font beneath it, leaving the glyph line on screen.
- `[x]` **INTRO-003**: After the greeting's English line, the system SHALL type, in English, that the learner does not read Mando'a yet and how they will learn it: reading real stories in which one letter at a time becomes Mandalorian, Next letter to take the next one, a tap on a glyph to peek, and the quiz to check; the words "Mando'a" and "Mandalorian" in those lines SHALL be drawn in glyphs and every other word in the reading font.
- `[x]` **INTRO-004**: When the typing is complete, the system SHALL show a Let's go button; when the learner taps it, the system SHALL mark the intro completed and open the reader on the opening passage.
- `[x]` **INTRO-005**: When the learner taps the terminal while it is still typing, the system SHALL show the rest of the text at once.
- `[x]` **INTRO-006**: When the intro starts before the glyph font has loaded or failed, the system SHALL show the terminal with its cursor and begin typing once the font has loaded or failed.
- `[x]` **INTRO-007**: While the browser asks for reduced motion, the system SHALL show the intro's text at once instead of typing it.

## Replay

- `[x]` **INTRO-008**: The system SHALL offer Replay intro in the library; it SHALL show the intro again without changing progress, and Let's go SHALL return to the passage the learner was reading.
