---
parent: high-level-design
prefix: TEXT
---

# Content

## Context and Design Philosophy

Content supplies what to read. Passages must be long enough that each new glyph appears many times before the next one arrives.

## Sources

- **Bundled:** 2 to 3 public-domain English passages, about 3,000 words each, chosen for good coverage of rare letters.
- **Custom:** paste any English text; stored locally.

## Pagination

Split by paragraph to fit the viewport, never mid-word. Re-paginate on viewport or text-size change while keeping the learner's place.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Paging | Paginated pages | Continuous scroll | Page turns give a natural unit for progress and one-thumb reading |

## Open Questions & Future Decisions

### Deferred
1. Choose the bundled passages.
2. Pasted text with accented letters (é, ü) leaves those Latin while plain e is substituted. Proposed: accept for v1 and document it.
