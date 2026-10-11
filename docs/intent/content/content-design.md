---
parent: high-level-design
prefix: TEXT
---

# Content

## Context and Design Philosophy

Content supplies what to read. Passages must be long enough that each new glyph appears many times before the next one arrives, and engaging enough that a young reader keeps turning pages. Franchise text cannot be bundled, so the bundled passages are public-domain adventure and science fiction, the closest match in tone.

## Sources

- **Bundled:** 2 to 3 public-domain English passages, about 3,000 words each, chosen for good coverage of rare letters and for adventure or science-fiction tone.
- **Custom:** paste any English text; stored locally. This is how a learner reads their own favorite text.

## Pagination

Split by paragraph to fit the viewport, never mid-word. Re-paginate on viewport or text-size change while keeping the learner's place.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Paging | Paginated pages | Continuous scroll | Page turns give a natural unit for progress and one-thumb reading |
| Bundled tone | Public-domain adventure and science fiction | Classic literary prose; franchise text | Keeps a young reader reading; franchise text cannot be redistributed, and pasting covers it |

## Open Questions & Future Decisions

### Deferred
1. Choose the bundled passages. Candidates: Burroughs (*A Princess of Mars*), Wells (*The War of the Worlds*), Verne; pick excerpts with modern enough vocabulary.
2. Pasted text with accented letters (é, ü) leaves those Latin while plain e is substituted. Proposed: accept for v1 and document it.
