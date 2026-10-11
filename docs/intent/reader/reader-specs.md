# Reader Specs

**LLD**: docs/intent/reader/reader-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Substitution

- `[ ]` **READ-001**: The system SHALL render every letter in the learned set using the target font and all other characters using the reading font.
- `[ ]` **READ-002**: The system SHALL keep the underlying DOM text in Latin characters, so copy, find-in-page and selection return English.
- `[ ]` **READ-003**: The system SHALL expose each word containing glyphs to assistive technology with its Latin spelling.
- `[ ]` **READ-005**: The system SHALL leave digits, punctuation, whitespace and non-ASCII letters unchanged.
- `[ ]` **READ-006**: The system SHALL apply the same glyph to upper and lower case of a letter.

## Peek

- `[ ]` **READ-004**: When the learner taps a glyph, the system SHALL show its Latin letter for 1.5 s and increment that letter's peek count.
