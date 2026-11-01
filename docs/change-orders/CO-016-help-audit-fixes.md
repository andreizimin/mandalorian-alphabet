# CO-016: Help panel audit fixes

| | |
|---|---|
| Type | Minor fix |
| Status | Approved |
| Requested | 2026-11-01 |
| Approved | 2026-11-01 |
| Completed | |
| Ticket | none (asked in conversation; follows [ZZF-74](https://linear.app/zizify-workshop/issue/ZZF-74)) |

## Request

"run the LID audit over CO-013", then, from the findings: fix the three gaps, and turn the behaviours the code already settles and the rules only the design states into specs. A replayed intro is counted only the first time.

## Intent

The retroactive LID audit of the Help button (CO-013) found three gaps:

1. **Keyboard and screen-reader users are not kept in the panel.** Focus does not move into it or come back to the Help key, and the page behind stays reachable.
2. **A replayed intro is counted as a new completion.** It reports `mando_intro_done` again.
3. **The help text's facts are not tested.** These are the quiz length and the letters the quiz needs.

The audit also found eight behaviours the code settles but no spec states, and five rules only the design states. After this change, the Help panel behaves as a proper modal dialog for every input method. The analytics dashboard counts each learner's intro once. The help text cannot drift from the quiz's real numbers. Every behaviour the audit surfaced is a spec with a test, so the next change cannot silently undo it.

## Predicted Impact

### HLD

None.

### LLDs

| Component | Section | Change |
|---|---|---|
| `help` | The Panel | Focus moves to Close on open and returns to the Help key on close; the panel is a modal dialog with the page behind inert; a tap outside is consumed; every page-turn input is paused, the on-screen buttons included; "the same page" is the same place in the passage, even if pages are recut while the panel is open; Help never opens over another overlay |
| `help` | Content | The quiz facts in the text come from the quiz's own values; the ⋯ note shows only under 600 px |
| `help` | Decisions & Alternatives | Rows: focus and modality; a consumed outside tap |
| `analytics` | Events | `mando_intro_done` is reported for the first completion only; replays from the library or Help are not counted |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `HELP-002` | Revise | When the learner taps Close in the Help panel, taps outside it, or presses Escape, the system SHALL close it and show the same place in the passage as before it opened, even if the pages were recut while it was open. |
| `HELP-003` | Revise | While the Help panel is open, the system SHALL ignore every page-turn input: keys, swipes, edge taps and the on-screen page-turn buttons. |
| `HELP-004` | Revise | The Help panel SHALL offer Replay intro, which closes the panel and shows the intro as INTRO-008 does; Let's go SHALL return to the same place in the passage with the panel closed. |
| `HELP-005` | Revise | When the Help panel's content is taller than the viewport, the system SHALL scroll the panel within itself, keeping Close pinned at the top at every scroll position, while the page behind it stays put. |
| `HELP-006` | Add | When the Help panel opens, the system SHALL move keyboard focus to its Close key; when it closes, the system SHALL return focus to the Help key that opened it. |
| `HELP-007` | Add | While the Help panel is open, the system SHALL present it as a modal dialog labelled "Help" and SHALL keep keyboard focus and screen-reader navigation within it, the page behind being inert. |
| `HELP-008` | Add | When the learner taps outside the Help panel, the system SHALL close the panel without the tap reaching any control, glyph or edge zone beneath it. |
| `HELP-009` | Add | The system SHALL offer Help from the reader only, and SHALL NOT open the Help panel while the new-letter card, the end-of-passage card, the phone menu sheet or the feedback form is open. |
| `HELP-010` | Add | The Help panel SHALL describe the controls in the same words at every width, and SHALL show the note about the ⋯ menu only while the viewport is under 600 px wide. |
| `HELP-011` | Add | The quiz facts the Help panel states (the number of questions in a session and the number of letters the quiz needs) SHALL be the values the quiz uses. |
| `ANA-003` | Revise | When the learner completes the intro with Let's go for the first time, the system SHALL report `mando_intro_done`; completing a replayed intro SHALL NOT report it. |

Net: +6 ~5.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/help/HelpPanel.test.tsx` | Change | `HELP-006` (focus to Close; focus back to the opener), `HELP-007` (`aria-modal`), `HELP-011` (the text built from the quiz's values) |
| `e2e/help.spec.ts` | Change | `HELP-002` (a resize while open keeps the place), `HELP-003` (an on-screen arrow under the backdrop does not turn), `HELP-005` (Close stays in view at every scroll position), `HELP-006`/`HELP-007` (Tab stays in the panel), `HELP-008` (a tap over Feedback or a top-bar key only closes), `HELP-009` (the menu sheet and the feedback form block Help), `HELP-010` (the ⋯ note at phone width only) |
| `e2e/analytics.spec.ts` | Change | `ANA-003` (a replay from Help reports nothing) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/help/HelpPanel.tsx` | Change | Focus to Close on mount; restore focus to the opener on unmount; `aria-modal`; Tab kept within the panel |
| `src/help/helpText.ts` | Change | The quiz line built from the quiz's values |
| `src/quiz/QuizScreen.tsx` or `src/quiz/session.ts` | Change | Export the number of letters the quiz needs, today a literal `2` (cross-segment, value unchanged) |
| `src/App.tsx` | Change | `inert` on the reader behind the panel; Help ignored while another overlay is open; `intro_done` reported only when the intro had not been completed before |

### Other

None.

## Cross-Segment Effects

- **analytics:** ANA-003's meaning narrows. The dashboard's `mando_intro_done` count drops to first completions from this deploy on; earlier data still includes replays.
- **quiz:** a named export for the letters the quiz needs; no behaviour change.
- **intro:** none. The intro itself does not change.

## Decisions Needed

Answered on 2026-11-01, each with the recommended option: replays are not counted (first completion only), and the follow-up fixes the three gaps and pins the settled behaviours and design-only rules.

### Edge audit (Phase 4) before tests

A blind reader probed the new and revised lines and found six forks. Two the code settles:
- **HELP-011:** both quiz values are constants (10 questions; 2 letters).
- **ANA-003:** "first time" is the saved intro-completed flag, which a replay always follows.

The requester resolved the other four on 2026-11-01, each with the recommended option:
1. **The same place:** closing Help shows the page holding the learner's word, as text size and resize already do.
2. **Replay intro:** focus moves into the intro terminal, and Let's go lands as usual.
3. **Focus on close:** focus returns to whichever Help key is on screen now.
4. **Withholding Help:** while another overlay is open, the key stays and activating it does nothing; a glyph peek does not block Help.

The resulting edits (outside the prediction above, which stands as written):
- HELP-002, HELP-004, HELP-006 and HELP-009 narrowed.
- HELP-009 split, adding HELP-013.
- HELP-012 added.

## Risks and Edge Cases

- **`inert` support:** Safari has supported `inert` since 15.5. On older browsers the panel still gets `aria-modal` and keeps Tab inside it, so the focus fixes still hold.
- **Focus return when the opener is gone:** after Replay intro, the Help key is not on screen, so focus is not restored; the intro has its own focus.
- **The feedback form:** it is a third-party overlay; the guard reads the widget's open state, which the app already tracks.

## Verification

- Unit and browser tests as listed; CI in WebKit at three viewports; dev check by explicit question; production on yes.

---

## Outcome

Filled in after the change is complete.
