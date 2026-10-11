# Alphabet Specs

**LLD**: docs/intent/alphabet/alphabet-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Font Loading

- `[x]` **ALPHA-001**: When the app starts, the system SHALL load the bundled Mando AF Regular font from the app's own origin with the FontFace API.
- `[x]` **ALPHA-003**: If the bundled font fails to load, then the system SHALL render all text in the reading font and show a non-blocking message with a retry action.
- `[x]` **ALPHA-004**: While the bundled font is loading or has failed to load, the system SHALL disable substitution.
- `[x]` **ALPHA-006**: The system SHALL load the font without any request to a host other than the app's own origin.