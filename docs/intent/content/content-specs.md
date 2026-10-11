# Content Specs

**LLD**: docs/intent/content/content-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Passages

- `[ ]` **TEXT-001**: The system SHALL bundle at least 2 public-domain English passages of about 3,000 words each.
- `[ ]` **TEXT-002**: When the learner pastes text, the system SHALL save it as a new passage and open it in the reader.

## Library and First Launch

- `[ ]` **TEXT-005**: When the app is launched with no current passage, the system SHALL open the first bundled passage in the reader.
- `[ ]` **TEXT-006**: The library SHALL list every bundled and pasted passage and offer the paste action, and when the learner chooses a passage the system SHALL open it in the reader at the learner's last position in that passage.

## Pagination

- `[ ]` **TEXT-003**: The system SHALL paginate passages at paragraph or word boundaries so no word splits across pages.
- `[ ]` **TEXT-004**: When the viewport size or text size changes, the system SHALL re-paginate and keep the learner on the paragraph they were reading.
