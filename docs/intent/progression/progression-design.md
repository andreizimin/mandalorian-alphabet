---
parent: high-level-design
prefix: PROG
---

# Progression

## Context and Design Philosophy

Progression decides which letter comes next and when to suggest advancing. The learner stays in control: the app hints, never forces. Two signals say a letter is sinking in: the learner stops peeking at it while reading, and they get it right in the quick quiz. Either is enough for a hint; neither is required to advance.

## Data

`Progress { order[], learnedCount, peeksByLetter{}, pagesSinceAdvance, quizByLetter{} }`

`quizByLetter[letter]` is a ring of the last 5 quiz answers that targeted the letter, newest last. The `quiz` node appends to it; progression reads it.

## Introducing a Letter

A new letter is introduced with a one-line intro card: glyph, Latin letter, and up to 3 example words from the current passage.

## Readiness Hint

The hint is non-blocking and names the signal that produced it. It appears when either holds for the newest letter:

- **Reading:** fewer than 2 peeks over the last 2 pages.
- **Quiz:** at least 4 of the last 5 quiz answers targeting the letter were correct.

Thresholds are configuration, not code. Advancing is always available whether or not the hint is showing.

## Controls

Advance, step back one letter, reset (with confirmation), and a legend of learned letters.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Default order | English letter frequency | Alphabetical; visual similarity | Frequent letters give the most exposure per page |
| Advancing | Learner-driven with hint | Automatic advance; quiz-gated advance | Learners vary; forced pace frustrates, and a gate strands a stuck learner |
| Combining signals | Either signal triggers the hint | Both required | Requiring both would make the quiz mandatory for ever seeing a hint, which contradicts the quiz being optional; a learner who never quizzes still gets reading-based hints |
| Quiz accuracy window | Last 5 answers per letter | All-time accuracy | Recent answers reflect current recognition; early misses should not haunt a letter |

## Open Questions & Future Decisions

### Deferred
1. "2 pages" changes meaning when text size or orientation changes. Proposed: measure readiness in words read (500) instead of pages.
2. Rare letters (Q, Z, X, J) may have no example words in the current passage. Proposed: fall back to a bundled common-word list per letter, shared with the quiz word pool.
3. Whether stepping back keeps the removed letter's peek and quiz history. Proposed: keep both; re-adding resumes them.
4. Whether reset clears `quizByLetter` along with peek counts. Proposed: yes, reset means a clean slate.
