# Alphabet Specs

**LLD**: docs/intent/alphabet/alphabet-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Font Loading

- `[ ]` **ALPHA-001**: When the learner uploads a TTF, OTF or WOFF2 file, the system SHALL load it with the FontFace API and store it on-device.
- `[ ]` **ALPHA-002**: The system SHALL never transmit an uploaded font file off the device.
- `[ ]` **ALPHA-003**: If the font fails to load, then the system SHALL render all text in the reading font and show an error naming the file.
- `[ ]` **ALPHA-004**: While no font is loaded, the system SHALL disable substitution and show a prompt to add one.

## Order

- `[ ]` **ALPHA-005**: Where the learner edits the letter order, the system SHALL use the edited order for all future advances.
