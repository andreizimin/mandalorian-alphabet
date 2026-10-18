# CO-010: Intro paragraphs appear on tap

| | |
|---|---|
| Type | Minor fix |
| Status | In progress |
| Requested | 2026-10-17 |
| Approved | 2026-10-17 |
| Completed | |
| Ticket | [ZZF-70](https://linear.app/zizify-workshop/issue/ZZF-70) |

## Request

"in the intro box, make every new paragraph appear on click, not on time delay"

## Intent

The intro terminal types one paragraph, then waits for the learner to tap before typing the next, so the learner sets the pace instead of a timer. A tap while a paragraph is typing finishes that paragraph; a tap while waiting starts the next. Let's go still appears once every paragraph is on screen.

## Predicted Impact

### HLD

None.

### LLDs

| Component | Section | Change |
|---|---|---|
| `intro` | Typing | Paragraph-by-paragraph pacing: the timer types within a paragraph, a tap moves between paragraphs; the hold and line pauses go; a "tap to continue" prompt while waiting |
| `intro` | Decisions & Alternatives | New row: tap-paced paragraphs over timed ones; "Skipping" row revised to finish one paragraph, not the whole text |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `INTRO-002` | Revise | When the intro starts typing, the system SHALL first type "Hello, adventurer!" with every letter drawn as a Mandalorian glyph and leave it on screen; the same line in the reading font SHALL be typed beneath it as the first paragraph after the glyph greeting. |
| `INTRO-005` | Revise | When the learner taps the terminal while a paragraph is typing, the system SHALL show the rest of that paragraph at once; when the learner taps while the terminal is waiting, the system SHALL start typing the next paragraph. |
| `INTRO-009` | Add | When a paragraph (the glyph greeting or any line) is complete and more remain, the system SHALL wait for a tap before typing the next, showing a tap-to-continue prompt meanwhile. |

Net: +1 new, ~2 revised.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/intro/typing.test.ts` | Change | `INTRO-002`, `INTRO-005`, `INTRO-009` (no delay while waiting; tap finishes the current paragraph or starts the next) |
| `src/intro/IntroTerminal.test.tsx` | Change | `INTRO-005`, `INTRO-009` (the next paragraph never appears on time alone; the prompt shows while waiting; taps pace the paragraphs) |
| `e2e/helpers.ts` | Change | `passIntro` taps until Let's go appears |
| `e2e/intro.spec.ts` | Change | `INTRO-002`, `INTRO-005`, `INTRO-009` (the English greeting waits for a tap; taps bring the paragraphs) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/intro/typing.ts` | Change | `delayAfter` returns null while waiting; `isWaiting`; `tap(frame)`; the hold and line pauses removed |
| `src/intro/IntroTerminal.tsx` | Change | Timer only while typing; the terminal's tap calls `tap`; the prompt |
| `src/app.css` | Change | The prompt's style |

### Other

`docs/user-flow.md` step 1: "a tap finishes the typing" becomes "each tap brings the next paragraph".

## Cross-Segment Effects

None beyond the browser-test helper, which every test uses to start the app.

## Decisions Needed

None; approved as asked on 2026-10-17.

## Risks and Edge Cases

- **Reduced motion** still shows the whole text at once (INTRO-007): a learner who asked for no animation should not be made to tap five times either.
- **The glyph font still loading:** a tap before the font is ready finishes the greeting in whatever font there is; the wait for the font (INTRO-006) applies only to automatic typing.
- **Tests that start the app** tap until Let's go appears, bounded, so a regression that never shows the button fails fast rather than hanging.

## Verification

Unit tests with fake timers; WebKit browser tests at three viewports; CI; dev check; production on go.

---

## Outcome

Filled in after the change is complete.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | None | | |
| LLDs | 2 sections in `intro` | | |
| Specs | +1 ~2 | | |
| Tests | 4 files | | |
| Code | 3 files | | |

### Surprises

### Commits

| Hash | Message |
|---|---|

### Measurements

| | |
|---|---|
| Tests before → after | |
| Lines changed | |
| Agent time | |
| Deployed | |
