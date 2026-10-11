# Reader Specs

**LLD**: docs/intent/reader/reader-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Substitution

- `[ ]` **READ-001**: When rendering a passage page, the system SHALL render every letter in the learned set using the target font and all other characters using the reading font.
- `[ ]` **READ-007**: The substitution renderer SHALL take the set of letters to substitute as an explicit parameter from its caller (the reader passes the learned set; the quiz passes the letters of the item it shows), rendering those letters in the target font and all other characters in the reading font.
- `[ ]` **READ-002**: The system SHALL keep the underlying DOM text in Latin characters, so copy, find-in-page and selection return English.
- `[ ]` **READ-003**: The system SHALL expose each word containing glyphs to assistive technology with its Latin spelling.
- `[ ]` **READ-005**: The system SHALL leave digits, punctuation, whitespace and non-ASCII letters unchanged.
- `[ ]` **READ-006**: The system SHALL apply the same glyph to upper and lower case of a letter.

## Peek

- `[ ]` **READ-004**: When the learner taps a glyph in a passage page (not in the quiz), the system SHALL show its Latin letter for 1.5 s and increment that letter's peek count.
