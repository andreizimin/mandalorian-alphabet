---
parent: high-level-design
prefix: PROG
---

# Progression

## Context and Design Philosophy

Progression decides which letter comes next and when to suggest advancing. The learner stays in control: the app hints, never forces. Two signals say a letter is sinking in: the learner stops peeking at it while reading, and they get it right in the quick quiz. Either is enough for a hint; neither is required to advance.

## Data

`Progress { learned[], peeksByLetter{}, newestPagePeeks[], currentPagePeeks, quizByLetter{}, hintDismissedFor[], welcomeSeen }`

- `learned` is the list of learned letters in the order they were added; the last entry is the newest letter. The next letter to introduce is the first letter of the alphabet's fixed frequency order (owned by `alphabet`) that is not in `learned`.
- `peeksByLetter[letter]` counts all peeks on a letter while it is learned.
- `currentPagePeeks` counts peeks on the newest letter on the page being read. When a page is read, it is appended to `newestPagePeeks`, which therefore holds one entry per page read since the newest letter was introduced. A page counts as read when the learner turns forward past it.
- `quizByLetter[letter]` is a ring of the last 5 quiz answers that targeted the letter, newest last. The `quiz` node appends to it; progression reads it.
- `hintDismissedFor` lists the signals the learner has dismissed the hint for on the current newest letter.
- `welcomeSeen` records that the first-launch intro (owned by `intro`) has been completed. The field keeps the name it had when the first-launch screen was a welcome card, so saved progress and exports stay readable.

Progression also owns the validator for its persisted state (`validateProgress`), which `persistence` uses when restoring saved progress and checking an import.

Progression state changes only through named events (advance, step back, reset, peek, page read, quiz answers recorded, hint dismissed, intro completed), so the same logic serves the reader, the quiz and persistence.

## First Launch

The learned set starts empty and the first letter waits for a tap like every other one. On first launch, while the learned set is empty and the intro has not been completed, the app shows the intro terminal (owned by `intro`) instead of the reader; it explains that Next letter brings the first letter. No letter is introduced automatically. Reset does not clear the completion flag: the intro is about the app, not the learned set.

## Introducing a Letter

A new letter is introduced with a one-line intro card: glyph, Latin letter, and up to 3 example words from the current passage. The card draws its glyphs, the new letter and the glyphs in its example words, in the newest-letter highlight color, so the color the learner then sees on the page already means "your new letter".

## Readiness Hint

One non-blocking hint, which names the signal or signals that produced it. It appears when either holds for the newest letter:

- **Reading:** at least 2 pages have been read since the letter was introduced, and the last 2 of them carry fewer than 2 peeks on it.
- **Quiz:** at least 4 of the last 5 quiz answers targeting the letter were correct.

The hint is dismissible. Dismissing hides it for the signal that produced it until the learner advances; if the other signal fires later, the hint shows once more naming that signal. When both signals hold at once the single hint names both.

While all letters in the order are learned, no hint shows and *advance* is disabled.

Thresholds are configuration, not code. Advancing is available whenever a next letter exists, whether or not the hint is showing.

## Controls

Advance, step back one letter, reset (with confirmation), and a legend of learned letters. The legend draws the newest letter's glyph in the highlight color.

- **Step back** removes the newest letter and clears its peek count and quiz ring, so re-advancing it starts fresh.
- **Reset** clears the learned set, all peek counts and all quiz rings.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Default order | English letter frequency | Alphabetical; visual similarity | Frequent letters give the most exposure per page |
| Advancing | Learner-driven with hint | Automatic advance; quiz-gated advance | Learners vary; forced pace frustrates, and a gate strands a stuck learner |
| First letter | Waits for a tap, after the intro terminal has explained it | Auto-introduce on first launch; a welcome card over the first page | Keeps "the learner advances" true from the start and gives a moment of plain English to anchor the passage; the terminal (owned by `intro`) does the explaining the card used to |
| Combining signals | Either signal triggers the hint; one hint names both when both hold | Both required; two separate hints | Requiring both would make the quiz mandatory for ever seeing a hint; two banners compete for a phone screen |
| Reading signal window | Pages read since the letter was introduced, minimum 2 | Last 2 pages regardless of introduction | A just-introduced letter has 0 peeks on the previous pages, which would fire the hint instantly |
| Hint dismissal | Per signal, until the next advance | Never dismissible; dismiss forever | A hint that returns every page nags; one that never returns loses the second signal's evidence |
| Quiz accuracy window | Last 5 answers per letter | All-time accuracy | Recent answers reflect current recognition; early misses should not haunt a letter |
| Step back | Clears the letter's peek count and quiz ring | Keep history and resume on re-add | Stepping back is the learner saying the letter came too soon; stale answers could fire the quiz hint the moment it is re-added |

## Open Questions & Future Decisions

### Resolved
1. ✅ Stepping back clears the removed letter's peek and quiz history; reset clears all rings. Rationale in the table above.

### Deferred
1. "2 pages" changes meaning when text size or orientation changes. Proposed: measure readiness in words read (500) instead of pages.
2. Rare letters (Q, Z, X, J) may have no example words in the current passage. Proposed: fall back to a bundled common-word list per letter, shared with the quiz word pool.
