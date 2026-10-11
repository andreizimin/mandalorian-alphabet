---
parent: high-level-design
prefix: PROG
---

# Progression

## Context and Design Philosophy

Progression decides which letter comes next and when to suggest advancing. The learner stays in control: the app hints, never forces.

## Data

`Progress { order[], learnedCount, peeksByLetter{}, pagesSinceAdvance }`

## Introducing a Letter

A new letter is introduced with a one-line intro card: glyph, Latin letter, and up to 3 example words from the current passage.

## Readiness Hint

Suggest advancing after 2 pages with fewer than 2 peeks on the newest letter. Thresholds are configuration, not code.

## Controls

Advance, step back one letter, reset (with confirmation), and a legend of learned letters.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Default order | English letter frequency | Alphabetical; visual similarity | Frequent letters give the most exposure per page |
| Advancing | Learner-driven with hint | Automatic advance | Learners vary; forced pace frustrates |

## Open Questions & Future Decisions

### Deferred
1. "2 pages" changes meaning when text size or orientation changes. Proposed: measure readiness in words read (500) instead of pages.
2. Rare letters (Q, Z, X, J) may have no example words in the current passage. Proposed: fall back to a bundled common-word list per letter.
3. Whether stepping back keeps the removed letter's peek history. Proposed: keep it; re-adding resumes it.
