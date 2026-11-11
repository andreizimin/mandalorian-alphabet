# CO-017: Top bar of six keys

| | |
|---|---|
| Type | Feature |
| Status | Approved |
| Requested | 2026-11-11 |
| Approved | 2026-11-11 |
| Completed | |
| Ticket | [ZZF-78](https://linear.app/zizify-workshop/issue/ZZF-78) |

## Request

"There are too many buttons on the top of the screen. They should be arranged and no more than 6 buttons should be displayed" (filed through the feedback widget on production, from a laptop at 1044 × 771 px, on the reader page `/`).

## Intent

On an iPad or laptop the top bar shows twelve keys in one undivided run: Next letter, Step back, Reset, Legend, Library, Quiz, A−, A+, appearance, Help, Feedback and Suggest a feature. A learner should instead see at most six keys there, in a deliberate order, with the ones used while reading in view and the occasional ones one tap away in a menu. No control is removed from the app.

## Predicted Impact

The prediction follows the answers recorded under Decisions Needed.

### HLD

None. The design tree, tenets and key decisions are unaffected: Feedback stays "an ordinary button among the reader controls", and the menu is one of those controls.

### LLDs

| Component | Section | Change |
|---|---|---|
| `layout` | Breakpoints | The ≥ 600 px row reads: a top bar of six keys (Next letter, Quiz, Legend, Library, Help, ⋯); the ⋯ menu holds the rest; the bottom bar holds ← and → |
| `layout` | Reader Controls | The wider-screens bullet names the six keys, their order and grouping (reading keys at the left, Help and ⋯ at the right, one row), and the menu's contents at that width (Step back, Reset, text size, appearance, Feedback, Suggest a feature). The menu is described once for both widths: what it holds at each, how it opens (the same sheet rising from the bottom of the screen at every width, from the ⋯ key in the bottom bar on phones and in the top bar on wider screens) and how it closes. The Feedback, Help and Suggest a feature bullets are reworded to match |
| `layout` | Decisions & Alternatives | New row "Wider-screen controls": six keys and a menu, against every control in the bar, or two rows; rationale: the bar is read at a glance while reading, and the occasional controls cost one more tap. New row "Menu on wider screens": the phone's bottom sheet, against a panel under the key; rationale: one menu that looks and behaves the same on every device |
| `help` | The panel's content / small screens | The note about the ⋯ menu is shown at every width and says where the key is at that width |
| `feedback` | Where the buttons sit | Feedback and Suggest a feature are in the ⋯ menu at 600 px or wider; the "needs a connection" reason shows beside the key inside the menu |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `LAYOUT-003` | Revise | While the viewport is 600 px or wider, the system SHALL show a top bar of exactly six keys, in this order: Next letter, Quiz, Legend, Library, Help and a menu key; SHALL place Step back, Reset, text size, appearance, Feedback and Suggest a feature in a menu opened from that key; and SHALL place only the page-turn buttons in the bottom bar. |
| `LAYOUT-023` | Add | While the viewport is 600 px or wider, the system SHALL keep the top bar's keys on one row, with Next letter, Quiz, Legend and Library at its left end and Help and the menu key at its right end. |
| `LAYOUT-024` | Add | While the viewport is 600 px or wider, when the learner activates the menu key, the system SHALL open the menu as a sheet rising from the bottom of the viewport, as it does under 600 px, and SHALL move keyboard focus into it; when the learner presses Escape, the system SHALL close the menu and return focus to the menu key. |
| `LAYOUT-014` | Revise | When the learner chooses Step back, Reset, Legend, Library, Feedback or Suggest a feature in the menu, or taps outside it, the system SHALL close the menu, at every width; the text-size and appearance buttons SHALL leave it open so the result can be seen and stepped repeatedly. |
| `LAYOUT-016` | Revise | The system SHALL show the Help and Feedback buttons inline among the reader controls, styled like them and never floating over the page: at 600 px or wider, Help in the top bar and Feedback in the menu; under 600 px, both at the right end of the passage-title line at the top of the screen, with the title keeping at least 40 % of that line. |
| `HELP-010` | Revise | The Help panel SHALL describe the controls in the same words at every width, and SHALL show a note about the ⋯ menu that names where its key is at the current width: in the bottom bar under 600 px, in the top bar at 600 px or wider. |
| `HELP-013` | Revise | While the new-letter card, the end-of-passage card, the menu or the feedback form is open, when the Help key is activated, the system SHALL do nothing. |

Net: +2 new, ~5 revised.

Unchanged, and checked against the change: `LAYOUT-002` (phone bars), `LAYOUT-011` (Library one tap from the top bar), `PROG-007` (Legend one tap at 600 px or wider), `LAYOUT-004` (44 pt), `FEED-003` and `FEED-006` (the disabled state and "among the reader controls" both still hold inside the menu), `HELP-006` (focus returns to the Help key, which stays in the top bar).

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/layout/ReaderChrome.test.tsx` | Change | `LAYOUT-003` (the six keys and their order; the moved controls absent from the bar), `LAYOUT-014` (Feedback and Suggest a feature close the menu), `LAYOUT-016`, `LAYOUT-024` (Escape closes, focus moves in and back) |
| `src/help/HelpPanel.test.tsx` | Change | `HELP-010` (the menu note at both widths) |
| `e2e/layout.spec.ts` | Change | `LAYOUT-003` (count of visible top-bar keys is six at iPad and laptop), `LAYOUT-023` (one row, left and right groups), `LAYOUT-024` (the sheet opens at the bottom of the viewport from the top-bar key), and the text-size, appearance, Step back and Reset checks reach their controls through the menu at wider widths |
| `e2e/feedback.spec.ts` | Change | `LAYOUT-016`, `FEED-002`, `FEED-003`, `FEED-006` (Feedback and Suggest a feature opened from the menu at wider widths) |
| `e2e/help.spec.ts` | Change | `HELP-010`, `HELP-013` (the menu note and the menu-open guard at wider widths) |
| `e2e/helpers.ts` | Change | A helper that opens the menu at any width, used by the specs above |

### Code

| File | Action | What changes |
|---|---|---|
| `src/layout/ReaderChrome.tsx` | Change | `TopBar` renders the six keys in two groups; `MenuSheet` holds the right items for each width and gains Feedback, Escape and focus handling |
| `src/progression/components.tsx` | Change | `Controls` (Next letter, Step back, Reset with its confirmation) is split so Next letter can stand alone in the top bar while Step back and Reset live in the menu |
| `src/App.tsx` | Change | The menu key in the top bar opens the same `menuOpen` state the phone uses; focus returns to the key on close |
| `src/app.css` | Change | The top bar as one row with a left and a right group; the menu sheet shown at every width, sized for wider screens |
| `src/help/helpText.ts` | Change | The menu note for each width, replacing the phone-only note |
| `src/help/HelpPanel.tsx` | Change | Shows the note at every width |

### Other

- `docs/user-flow.md`: the iPad paragraph ("controls move to a top bar") and the Feedback paragraph ("in the top bar on an iPad or laptop") are reworded.
- No new dependencies, assets, analytics events or deploy changes. The existing "suggestion link tapped" event still fires from the menu.

## Cross-Segment Effects

- **help:** the menu note stops being phone-only (`HELP-010`), and the menu-open guard covers every width (`HELP-013`). The Help key keeps its place in the top bar, so focus return is unchanged.
- **feedback:** Feedback and Suggest a feature are one tap further away on wider screens. Their behaviour is unchanged; the "needs a connection" reason is only seen once the menu is open.
- **progression:** Step back and Reset move into the menu on wider screens; the reset confirmation happens inside the menu, as it already does on phones. Legend stays one tap away.
- **quiz, intro, content, analytics, offline, persistence:** none.

## Decisions Needed

All four answered on 2026-11-11. Decisions 1, 2 and 4 took the recommended option; decision 3 took the alternative, and the Predicted Impact above was rewritten for it before approval.

1. **Which six keys stay in the top bar.** *Chosen (recommended):* Next letter, Quiz, Legend, Library, Help, ⋯. Feedback and Suggest a feature go into the menu with Step back, Reset, text size and appearance. *Alternatives:* (a) keep Feedback visible and put Help in the menu; (b) Next letter, Quiz, Library, Help, Feedback, ⋯, with Legend in the menu.
2. **Whether the ⋯ key counts toward the six.** *Chosen (recommended):* yes, six keys in total. *Alternative:* six controls plus the ⋯ key (seven keys).
3. **How the menu opens on wider screens.** *Chosen (the alternative):* the same sheet rising from the bottom as on a phone. *Recommended, not taken:* a panel directly under the ⋯ key.
4. **Phones.** *Chosen (recommended):* unchanged. *Alternative:* bring the phone in line with the wider layout's choice of visible keys.

## Risks and Edge Cases

- **Feedback is less visible on laptops.** Every ticket so far came through that key. The recommended option accepts this; decision 1(a) and decision 2's alternative avoid it.
- **One row at 600 px.** Six console keys, "Legend (26)" included, must fit the narrowest iPad Split View without wrapping or cutting a key. The browser test measures this at the iPad viewport; if they do not fit at 600 px, the labels shorten before the row wraps, and that is recorded in the Outcome.
- **The quiz's "needs N letters" reason** sits under the Quiz key in the top bar today; it must not push the row to two lines.
- **One sheet, two sets of contents.** The sheet holds different controls on each side of 600 px (Legend and Library on phones only; Feedback on wider screens only); a control must not appear in both the bar and the menu at the same width. The browser test asserts each control is reachable exactly once per width.
- **Resizing across 600 px with the menu open** (Split View, rotating): the menu closes, since its contents differ on each side.
- **The sheet opens far from its key on a laptop.** Accepted with decision 3; focus moves into the sheet and returns to the key, so the keyboard path stays short.
- **Taps behind the menu:** the open menu already pauses page turns and the Help key; the backdrop takes the outside tap, so it never turns the page or peeks.
- **The dev check question** in `CLAUDE.md` is unchanged; this change order ends at the dev check like the others.

## Verification

- Unit tests for the top bar's six keys, the menu's contents and closing at both widths, focus and Escape, and the Help note.
- Browser tests in WebKit at the iPhone, iPad and laptop viewports: six keys on one row, the menu sheet opening from the top-bar key, every moved control reachable through it, 44 pt keys, the phone layout unchanged.
- Screenshots at the three viewports and at the ticket's 1044 × 771, in both palettes.
- CI; dev check on iPad and laptop (and iPhone, to confirm nothing moved); production on go.

---

## Outcome

Filled in after the change is complete.
