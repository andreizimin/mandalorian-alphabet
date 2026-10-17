# CO-008: X-ray: the English under the glyphs

| | |
|---|---|
| Type | Feature |
| Status | Done |
| Requested | 2026-10-16 |
| Approved | 2026-10-17 |
| Completed | 2026-10-17 |
| Ticket | [ZZF-68](https://linear.app/zizify-workshop/issue/ZZF-68) |

## Request

"I need some magnifying or x-ray glass that would show me the English original underneath the writing - to quickly check that I'm reading it right"

In the decision round the requester added that it "should be activated when I click on some text", not from a control.

## Intent

When the learner taps a glyph to peek, they see the whole word in English directly under the word, with the tapped letter marked, instead of one letter at the bottom of the screen. The English sits under the writing, where the eye already is, so checking a reading is one tap and no new control. The letter peek is counted as before; seeing the word costs nothing extra.

## Predicted Impact

The first proposal was a held X-ray button that turned the whole page English. The requester asked for activation from the text itself, so the prediction below is for the chosen design; the button design is kept in the reader LLD's Decisions & Alternatives as the alternative considered.

### HLD

None. The HLD glossary already defines a peek as revealing the Latin behind a glyph; this widens what a peek shows.

### LLDs

| Component | Section | Change |
|---|---|---|
| `reader` | Peek | Rewritten: the popover shows the whole word in the reading font with the tapped letter marked, sits directly under the word (above it when there is no room below within the page area), is kept within the viewport's width, lasts 1.5 s and is replaced by the next peek; taps still count per letter |
| `reader` | Decisions & Alternatives | New rows: the word under the word over a letter at the bottom of the screen, a held X-ray button for the whole page, a long-press on the text, or a lens following the finger; marking every occurrence of the tapped letter in the word |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `READ-004` | Revise | When the learner taps a glyph in a passage page (not in the quiz), wherever on the page the glyph sits, the system SHALL show the whole word the glyph belongs to in the reading font, with every occurrence of the tapped letter in it marked, for 1.5 s, SHALL increment that letter's peek count, and SHALL NOT turn the page. |
| `READ-010` | Add | The peek popover SHALL sit directly under the tapped word, kept within the viewport's width, and above the word when there is no room below it within the page area. |

Net: +1 new, ~1 revised, 0 deleted.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/reader/PassagePage.test.tsx` | Change | `READ-004` (the popover holds the word with the tapped letter marked, every occurrence; a second tap replaces it; the timing and the count as before) |
| `src/reader/peekPlacement.test.ts` | Add | `READ-010` (centered under the word; clamped at the left and right edges; above the word when it would not fit within the page area) |
| `e2e/reader.spec.ts` | Add | `READ-004`, `READ-010` (in WebKit at three viewports: the popover's text is the tapped word, its top is just under the word, it stays within the viewport, and the first word on the page does not move) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/reader/PassagePage.tsx` | Change | The peek holds the word, the letter and the word's box; the popover renders the word with marked letters and is placed after it is measured |
| `src/reader/peekPlacement.ts` | Add | Pure placement: under or above the word, clamped to the viewport's width |
| `src/app.css` | Change | The popover in the reading font at the text size, the marked letter underlined and bold; no longer fixed at the bottom |

### Other

`docs/user-flow.md`: step 5 says the peek shows the word under the word. No new dependencies, assets or deploy changes.

## Cross-Segment Effects

- **progression:** none. The peek event is unchanged, so the readiness signal sees the same taps.
- **layout:** none. No control is added; the page-edge taps and the glyph-wins rule are unchanged. The popover is positioned relative to the viewport, so the page area's clipping does not cut it off.
- **content:** none. The page is not re-cut.
- **quiz:** none. The quiz has no peek.

## Decisions Needed

Answered on 2026-10-17.

1. **Where X-ray sits on a phone.** Asked as: beside Feedback on the title line (recommended) or in the bottom bar. *Answered:* neither; "should be activated when I click on some text". A follow-up asked how a tap on text shares the gesture with the letter peek: the word under the word (recommended), the sentence in place, press-and-hold for the page, or any tap for the page. *Answered:* the word under the word.
2. **Does X-ray count against readiness?** *Answered:* no, X-ray is free. The letter peek keeps its existing count; the word adds no cost. The proposed READ-011 is dropped.

## Risks and Edge Cases

- **Clipping:** the page area hides overflow. The popover is positioned relative to the viewport (fixed), which that clipping does not affect, so a word on the last line still gets its popover; when there is no room below within the page area, the popover goes above the word.
- **Long words at the edges:** a popover centered under a word at the right edge would leave the screen; its left is clamped so it stays within the viewport's width.
- **Punctuation:** the "word" is the whitespace-delimited token, so "gate." shows as "gate." The learner sees exactly what the glyphs stand for.
- **Case:** "Enter" tapped on its E marks both the E and the e; marking every occurrence avoids guessing which glyph of a repeated letter was tapped.
- **Measuring before placing:** the popover's width is known only after it renders, so it is placed in a layout effect; the learner never sees the unplaced frame.
- **The quiz:** uses the same renderer but has no peek; unchanged.

## Verification

- Unit tests for the popover's content and the placement function.
- Browser tests in WebKit (iPhone, iPad, laptop): the popover's text, position under the word, and containment in the viewport.
- CI passes; the pipeline deploys dev; the requester checks on an iPhone.
- Production from `main` on their go.

---

## Outcome

Written before the requester's dev check; the production run is reported on the ticket. Checked on dev together with CO-007 and CO-009.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | None | None | |
| LLDs | 2 sections in `reader` | 2 sections in `reader` | Peek rewritten; two decision rows |
| Specs | +1 ~1 | +1 ~1 | READ-010 added, READ-004 revised, as predicted (the first proposal was +5 ~1) |
| Tests | 3 files | 4 files | `playwright.config.ts` also changed, for the test runner itself (see Surprises) |
| Code | 3 files | 3 files | `PassagePage.tsx`, `peekPlacement.ts`, `app.css`, as predicted |
| Other | User flow step 5 | User flow step 5 | |

### Surprises

1. **The design changed at approval, and the prediction was redone before work.** The first proposal (a held X-ray button for the whole page, five new specs across `reader` and `layout`) was replaced when the requester asked for activation from the text itself. The rewritten prediction then held file for file. The lesson for future proposals: when a request names a mechanism ("x-ray glass"), ask how it is reached before predicting its specs.
2. **A browser test assumed the rule's edge instead of testing the rule.** The "last line" test expected the popover to flip above the word whenever the word was within 60 px of the bottom, but at the default text size the popover (about 40 px) still fit below. The test now computes whether the popover fits and expects the matching side; the pure placement function's unit tests cover the flip itself.
3. **The test port was taken by another project.** A preview server for a different repository was listening on 4173, and the Playwright config reuses an existing server on that port, so every browser test loaded the wrong app and timed out. `playwright.config.ts` now reads `E2E_PORT` (default 4173) so a run can pick a free port; CI is unaffected.

### Commits

| Hash | Message |
|---|---|
| `aa6a663` | CO-008 proposed: X-ray, the English under the glyphs (ZZF-68) |
| `7ef39c2` | Merge the finished CO-007 branch into the CO-008 branch (stacked for one dev check) |
| (this commit) | CO-008: a peek shows the whole word under the word (ZZF-68) |

### Measurements

| | |
|---|---|
| Tests before → after | unit 292 → 297, browser (reader) 0 → 6 (two tests, three viewports) |
| Lines changed | +116 −15 (code, 3 files), +114 −5 (tests and test config, 4 files), +51 −48 (design doc, specs, user flow and this change order) |
| Agent time | about 12 minutes from the branch merge (16:37) to the outcome (16:49) |
| Deployed | dev from the branch by the pipeline; production when the pull request merges |
