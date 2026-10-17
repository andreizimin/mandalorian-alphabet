# CO-008: X-ray: the English under the glyphs

| | |
|---|---|
| Type | Feature |
| Status | Proposed |
| Requested | 2026-10-16 |
| Approved | |
| Completed | |
| Ticket | [ZZF-68](https://linear.app/zizify-workshop/issue/ZZF-68) |

## Request

"I need some magnifying or x-ray glass that would show me the English original underneath the writing - to quickly check that I'm reading it right"

## Intent

While reading, the learner can hold an **X-ray** control and see the whole page in plain English, in place, with the words exactly where they were; letting go brings the glyphs back. It is a whole-page peek: a quick way to confirm a reading, not a way to read in English. Like a peek, using it is a signal that the newest letter is not yet known, so it counts as a peek on that letter.

## Predicted Impact

### HLD

None. Peeking is the reader's business (HLD glossary: "Peek: revealing the Latin letter behind a glyph"); X-ray is a peek at the page scale. The tenet "verification over uninterrupted flow" is why it costs a peek.

### LLDs

| Component | Section | Change |
|---|---|---|
| `reader` | X-ray (new) | A hold-to-reveal control draws every glyph on the page in the reading font, in place; the page's cut does not change; taps on the page are not peeks while it is on; a press shorter than the peek time (1.5 s) keeps the English on screen for that long; each press counts one peek on the newest letter; disabled while nothing is learned or the font is not loaded |
| `reader` | Decisions & Alternatives | New rows: in-place reveal over an overlay, a lens following the finger, or a per-word popover; a held button over a long-press on the page; counting it as a peek on the newest letter |
| `layout` | Reader Controls | X-ray joins the controls: top bar at 600 px or wider; beside Feedback at the right end of the title line under 600 px (decision 1) |
| `layout` | Reading Column | While X-ray is on, the page area may scroll if the English needs more room than the glyphs did |
| `progression` | Readiness Hint | An X-ray press counts as one peek on the newest letter (decision 2); no change to the reducer |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `READ-010` | Add | When the learner presses the X-ray control while a passage page is shown, the system SHALL draw every glyph on the page in the reading font, in place and with the page's cut unchanged, for as long as the control is held and for at least 1.5 s, SHALL NOT count taps on the page as peeks meanwhile, and when the control is released after that SHALL draw the glyphs again. |
| `READ-011` | Add | When the learner presses the X-ray control, the system SHALL count one peek on the newest learned letter. |
| `READ-012` | Add | While the learned set is empty or the glyph font is not loaded, the system SHALL disable the X-ray control. |
| `LAYOUT-019` | Add | The system SHALL show the X-ray control among the reader controls, styled like them and never floating over the page: in the top bar at 600 px or wider, and beside Feedback at the right end of the passage-title line under 600 px. |
| `LAYOUT-020` | Add | While X-ray is on, if the page's text in the reading font needs more room than the page area, the system SHALL let the page area scroll vertically; otherwise the page area SHALL NOT scroll. |
| `LAYOUT-003` | Revise | The top bar's list gains X-ray: "... Library, text size, appearance, X-ray and Feedback in a top bar ..." |

Net: +5 new, ~1 revised, 0 deleted. If decision 2 is "no", READ-011 is dropped (+4).

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/reader/XRay.test.tsx` | Add | `READ-010` (on while held, off on release, stays on for 1.5 s after a short press), `READ-011` (one press, one call), `READ-012` (disabled) |
| `src/reader/PassagePage.test.tsx` | Change | `READ-010` (the X-ray class while on; glyph spans stay in the DOM; taps are not peeks while on) |
| `src/layout/ReaderChrome.test.tsx` | Change | `LAYOUT-003`, `LAYOUT-019` (in the top bar; beside Feedback on the title line) |
| `e2e/layout.spec.ts` | Change | `READ-010`, `LAYOUT-019`, `LAYOUT-020` (glyphs' computed font while held is the reading font and back on release; the first word stays put; placement per width; the area scrolls only when it must) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/reader/XRay.tsx` | Add | The control: pointer and keyboard hold, the 1.5 s minimum, `onChange(active)` and `onPress()` |
| `src/reader/PassagePage.tsx` | Change | `xray` prop: adds the class, ignores taps while on |
| `src/layout/ReaderChrome.tsx` | Change | X-ray in `TopBar` and `TitleBar`; `ReaderActions` gains `canXRay`, `onXRay`, `onXRayPress` |
| `src/App.tsx` | Change | X-ray state; a press dispatches a peek on the newest letter; passes `xray` to the page |
| `src/app.css` | Change | `.passage-page.xray .g` in the reading font; `.page-area.xray` scrolls when needed |

### Other

`docs/user-flow.md`: step 5 mentions X-ray next to peeking. No new dependencies, assets or deploy changes.

## Cross-Segment Effects

- **layout:** owns where the control sits and the page area's scrolling while X-ray is on.
- **progression:** absorbs the peek: the existing `peek` event with the newest letter, so the reading signal sees X-ray use. No reducer change.
- **content:** none. The page is not re-cut; pagination keys on the learned set and text size, which X-ray does not touch.
- **quiz:** none. X-ray is a reader control and the quiz replaces the reader.

## Decisions Needed

1. **Where X-ray sits on a phone.** *Recommended:* beside Feedback at the right end of the title line, the same pattern as LAYOUT-016; the bottom bar is full. *Alternative:* in the bottom bar between Quiz and the menu, shortening "Next letter" to "Next" to make room; closer to the thumb, but it changes a button every learner knows.
2. **Does X-ray count against readiness?** *Recommended:* yes, one peek on the newest letter per press, so a learner who checks the whole page is not told they are ready; it follows the "verification over flow" tenet. *Alternative:* no, X-ray is free; the readiness hint then only sees glyph taps.

## Risks and Edge Cases

- **Reflow while on:** Latin letters in the reading font are not the same width as glyphs, so lines wrap differently while X-ray is on. The page's cut is unchanged, so the words are the same; if they need more room, the area scrolls (LAYOUT-020). The browser test measures it at three viewports.
- **A tap during X-ray:** glyph spans stay in the DOM so the page does not re-render, but a tap on one must not count as a peek or show a popover; the page ignores taps while X-ray is on.
- **Releasing outside the button:** a finger that slides off the button or a window that loses focus must turn X-ray off; pointer cancel, pointer leave and blur all end the hold.
- **Keyboard:** holding Space or Enter on the focused button is a hold; key repeat must not count extra presses.
- **Nothing learned:** the page is already English; the control is disabled rather than doing nothing.
- **Phone title line:** two compact buttons share the line with the title; the title truncates rather than the buttons wrapping.

## Verification

- Unit tests for the control's hold logic, the page's X-ray state and the control's placement.
- Browser tests in WebKit (iPhone, iPad, laptop): the glyphs' computed font changes and changes back; the first word stays; the area never overflows without scrolling.
- CI passes; the pipeline deploys dev; the requester checks on an iPhone.
- Production from `main` on their go.

---

## Outcome

Filled in after the change is complete.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | None | | |
| LLDs | 5 sections in 3 components | | |
| Specs | +5 ~1 | | |
| Tests | 4 files | | |
| Code | 5 files | | |

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
