# Reader Specs

**LLD**: docs/intent/reader/reader-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Substitution

- `[x]` **READ-001**: When rendering a passage page, the system SHALL render every letter in the learned set using the target font and all other characters using the reading font.
- `[x]` **READ-007**: The substitution renderer SHALL take the set of letters to substitute as an explicit parameter from its caller (the reader passes the learned set; the quiz passes the letters of the item it shows), rendering those letters in the target font and all other characters in the reading font.
- `[x]` **READ-002**: The system SHALL keep the underlying DOM text in Latin characters, so copy, find-in-page and selection return English.
- `[x]` **READ-003**: The system SHALL expose each word containing glyphs to assistive technology with its Latin spelling.
- `[x]` **READ-005**: The system SHALL leave digits, punctuation, whitespace and non-ASCII letters unchanged.
- `[x]` **READ-006**: The system SHALL apply the same glyph to upper and lower case of a letter.
- `[ ]` **READ-008**: While a passage page is shown, the system SHALL draw every occurrence of the newest learned letter (the most recently added letter in the learned set) in a highlight color distinct from other glyphs, until the learned set changes.
- `[ ]` **READ-009**: The substitution renderer SHALL accept an optional highlight letter and mark only that letter's glyphs, in upper and lower case, without changing glyph size, weight or spacing.

## Peek

- `[x]` **READ-004**: When the learner taps a glyph in a passage page (not in the quiz), wherever on the page the glyph sits, the system SHALL show its Latin letter for 1.5 s and increment that letter's peek count, and SHALL NOT turn the page.
