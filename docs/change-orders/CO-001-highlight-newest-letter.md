# CO-001: Highlight the newest letter

| | |
|---|---|
| Type | Feature |
| Status | Done |
| Requested | 2026-10-11 |
| Approved | 2026-10-11 |
| Completed | 2026-10-11 |
| Ticket | None |

## Request

"I want the most recent letter that got substituted to be highlighted somehow so that it is easy to spot what new letter we're learning at this stage."

## Intent

While reading, every occurrence of the newest learned letter stands out from the other glyphs, so the learner can find the letter they are currently learning at a glance. Older glyphs stay as they are. The highlight follows the newest letter: it moves on advance, moves back on step back, and disappears on reset.

## Predicted Impact

### HLD

None. The rendering approach (font-styled spans over Latin text) is unchanged; the highlight is a reader-level detail.

### LLDs

| Component | Section | Change |
|---|---|---|
| `reader` | Rendering | The renderer takes an optional highlight letter; its glyphs get an extra class drawn in the highlight color. The passage page passes the newest learned letter. Color only, so glyph widths and pagination are unaffected. |
| `reader` | Decisions & Alternatives | New row: highlight style (decision 1) and why color was chosen over weight or size, which would change text width and break pagination. |
| `progression` | Introducing a Letter; Controls (legend) | Intro card glyph and the legend's newest entry use the same highlight, so the color reads as "your new letter" from the moment it is introduced (decision 4). |
| `quiz` | Rendering | The quiz never highlights, since it would reveal which letter a question targets (decision 3). |
| `layout` | Platform | The highlight color is defined for light and dark appearance with a contrast ratio of at least 4.5:1 against the page. |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `READ-008` | Add | While a passage page is shown, the system SHALL draw every occurrence of the newest learned letter (the most recently added letter in the learned set) in a highlight color distinct from other glyphs, until the learned set changes. |
| `READ-009` | Add | The substitution renderer SHALL accept an optional highlight letter and mark only that letter's glyphs, in upper and lower case, without changing glyph size, weight or spacing. |
| `PROG-015` | Add | The intro card and the legend SHALL draw the newest learned letter's glyph in the same highlight color as the reader. |
| `QUIZ-026` | Add | The quiz SHALL render every glyph without the newest-letter highlight. |
| `LAYOUT-015` | Add | The system SHALL define the newest-letter highlight color for both light and dark appearance with a contrast ratio of at least 4.5:1 against the page background. |

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/reader/Substituted.test.tsx` | Change | `READ-009` |
| `src/reader/PassagePage.test.tsx` | Change | `READ-008` |
| `src/progression/components.test.tsx` | Change | `PROG-015` |
| `src/quiz/QuizScreen.test.tsx` | Change | `QUIZ-026` |
| `e2e/layout.spec.ts` | Change | `READ-008`, `LAYOUT-015` (computed color differs from other glyphs; contrast in light and dark; pages still fit) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/reader/Substituted.tsx` | Change | Optional `highlight` prop adds a `g-new` class to that letter's glyphs |
| `src/reader/PassagePage.tsx` | Change | Accepts the newest letter and passes it to the renderer |
| `src/progression/components.tsx` | Change | Intro card glyph and legend's newest entry highlighted |
| `src/App.tsx` | Change | Passes the newest learned letter to the passage page (only when the font is loaded) |
| `src/app.css` | Change | `--newest` color token for light and dark; `.g-new` rule |

### Other

`docs/user-flow.md` steps 4 and 5 mention the highlight. No new dependencies, assets or deploy changes beyond a normal production deploy.

## Cross-Segment Effects

- **progression:** intro card and legend adopt the highlight (decision 4).
- **quiz:** must explicitly stay unhighlighted; it shares the renderer, so a test guards it.
- **layout:** owns the color token and its contrast in both appearances.
- **content:** none. Pagination measures glyph widths, which a color change leaves untouched; the existing browser test that pages never overflow confirms it.

## Decisions Needed

All four answered on 2026-10-11, each with the recommended option: accent color only; always on until the next letter; no highlight in the quiz; same highlight on the intro card and legend.

1. **Highlight style.** *Recommended:* color only, the app's warm accent (brown on the light page, gold on dark). Alternatives: color plus a thin underline (more visible, slightly busier text), or a tinted background behind the glyph (most visible, looks like a search hit). Bold or larger glyphs are ruled out: they change text width and would break pagination.
2. **How long it lasts.** *Recommended:* always, until the next letter is added. Alternatives: only for the first few pages after a letter is introduced, or an on/off setting.
3. **The quiz.** *Recommended:* no highlight in the quiz, since it would reveal which letter a question is about.
4. **Intro card and legend.** *Recommended:* use the same highlight there too, so the color means "new letter" everywhere.

## Risks and Edge Cases

- **Pagination drift:** any style that changes glyph width would desynchronise the page measurer. Restricting the highlight to color avoids this; the browser overflow test guards it.
- **Too much color:** frequent letters (E, T) appear many times per page; a strong highlight could make the page noisy early on. The accent tone is muted for that reason.
- **Color-blind readers:** color alone may be hard to see for some learners; if decision 1 picks color only, the underline variant stays available as a follow-up.
- **Font not loaded:** with no glyphs shown there is nothing to highlight; the newest letter is passed only when the font is ready.
- **Step back and reset:** the highlight must follow `learned.at(-1)`; tests cover both.

## Verification

- Unit tests for the renderer, passage page, intro card, legend and quiz (no highlight).
- Browser tests in WebKit (iPhone, iPad, laptop): the newest glyph's computed color differs from other glyphs, meets 4.5:1 contrast in light and dark, and pages still never overflow.
- Manual check on a device after a production deploy (deploy needs separate approval).

---

## Outcome

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | 0 changes | 0 changes | |
| LLDs | 4 components, 6 sections | 4 components, 6 sections | Exactly as predicted |
| Specs | +5 ~0 −0 | +5 ~0 −0 | PROG-015's wording was refined before any test was written (see Surprises) |
| Tests | 5 files | 5 files | +8 unit tests, +3 browser tests (one test, three viewports) |
| Code | 5 files | 6 files | `src/quiz/QuizScreen.tsx` gained a spec annotation only |
| Other | User flow | User flow | |

### Surprises

1. **A spec was ambiguous at its edge.** PROG-015 said the intro card draws "the newest letter's glyph", but the card also shows example words whose glyphs are the same letter. The edge-case audit caught it before tests were written, and the spec was reworded to cover every glyph on the card. The prediction had the right files and the right spec count, but not the right wording.
2. **A spec about something *not* happening still needs a home in the code.** QUIZ-026 (the quiz never highlights) required no code change, so the prediction listed no quiz code. Traceability still needs a `@spec` tag at the place that guarantees the absence, so `QuizScreen.tsx` was touched for one comment line.
3. **The browser test exposed an existing reflow, not a highlight bug.** The new test measured page overflow right after a page turn and saw 63 px on iPad and laptop. Investigation showed that when the readiness hint appears, the header grows, and the page re-fits a frame or two later. The test now waits for layout to settle; every page fits once it does. The underlying behavior, text reflowing on the page being read when the hint appears, predates this change and is a candidate for its own change order.

### Commits

| Hash | Message |
|---|---|
| `893731a` | CO-001 proposed: highlight the newest letter |
| `be6902f` | CO-001: record decisions (all recommended options) |
| `1d8cfce` | CO-001: design and specs for the newest-letter highlight |
| `d39f1e9` | CO-001: tests for the newest-letter highlight |
| `53224df` | CO-001: implement the newest-letter highlight |

### Measurements

| | |
|---|---|
| Tests before → after | unit 237 → 245, browser 35 → 38 |
| Lines changed | +36 −13 (code, 6 files), +121 −0 (tests, 5 files), +18 −8 (design docs, specs and user flow) |
| Agent time | about 40 minutes from approval (09:51) to completion (about 10:35), including review stops |
| Deployed | 2026-10-11, to learn-mandalorian.andreizimin.com |
