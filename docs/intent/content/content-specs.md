# Content Specs

**LLD**: docs/intent/content/content-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Passages

- `[ ]` **TEXT-001**: The system SHALL bundle, in this order, chapter 1 of *The Call of the Wild*, chapters 1–2 of *Treasure Island* and chapters 1–2 of *The War of the Worlds*, from Project Gutenberg with its header, footer and trademark removed, each containing every letter a–z.
- `[ ]` **TEXT-002**: When the learner pastes text, the system SHALL save it as a new passage and open it in the reader.
- `[ ]` **TEXT-007**: When saving pasted text, the system SHALL split it into paragraphs on blank lines (joining single line breaks within a paragraph) or, if it has no blank lines, on line breaks; collapse runs of whitespace; drop empty paragraphs; and title it with the first six words of its first paragraph.
- `[ ]` **TEXT-008**: If pasted text contains no letter a–z or exceeds 100,000 characters, then the system SHALL not save it and SHALL say why.
- `[ ]` **TEXT-009**: When the learner confirms deleting a pasted passage, the system SHALL remove it, and if it was the passage being read, open the first bundled passage; bundled passages SHALL offer no delete action.

## Library and First Launch

- `[ ]` **TEXT-005**: When the app is launched with no current passage, the system SHALL open the first bundled passage in the reader.
- `[ ]` **TEXT-006**: The library SHALL list every bundled passage followed by every pasted passage newest first, and offer the paste action; when the learner chooses a passage the system SHALL open it at the learner's last position in that passage, or at its start.

## Pagination

- `[ ]` **TEXT-003**: The system SHALL paginate passages at paragraph or word boundaries so no word splits across pages, placing a word too large for an empty page alone on its page.
- `[ ]` **TEXT-004**: When the viewport size or text size changes, the system SHALL re-paginate and show the page containing the learner's current position (the first word of the page they were on).

## Page Turns

- `[ ]` **TEXT-010**: When the learner turns forward, the system SHALL show the next page and make its first word the current position; when the learner turns back, the system SHALL show the previous page.
- `[ ]` **TEXT-011**: When the learner turns forward from a page that extends past the furthest position reached in that passage, the system SHALL count one page read for the reading signal (progression's PROG-004); a forward turn over pages already read SHALL count nothing.
- `[ ]` **TEXT-012**: When the learner turns forward on the last page of a passage, the system SHALL count that page as read per TEXT-011 and show an end card naming the passage, with actions to open the next bundled passage (wrapping to the first) and to open the library.
