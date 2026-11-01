# CO-013: Help button

| | |
|---|---|
| Type | Feature |
| Status | Proposed |
| Requested | 2026-11-01 |
| Approved | |
| Completed | |
| Ticket | [ZZF-74](https://linear.app/zizify-workshop/issue/ZZF-74) |

## Request

"Add help button that explains what the app does" (filed through the feedback widget on production, from an iPhone, on the reader page `/`).

## Intent

A learner who is unsure what the app is or what a control does finds a Help key among the reader controls, on a phone as well as on a tablet or laptop. One tap opens a Help panel, drawn in the console look, that says in a few lines what the app does and how it teaches: real stories, one letter at a time turning into a Mandalorian glyph, learned by reading. It then says what each control and gesture does. The panel can replay the intro, closes with one tap, and leaves the learner on the same page. Today the only explanation is the intro, which is seen once and can only be replayed from inside the library, and it does not cover most of the controls.

## Predicted Impact

### HLD

- Design Tree: new `help` node (prefix `HELP`), "The Help panel: what the app does and what each reader control does, opened from the reader controls."
- Key Decisions: none. The Help panel follows the existing decisions (console look, reader controls inline).

### LLDs

| Component | Section | Change |
|---|---|---|
| `help` (new) | Whole LLD | Context; the panel's content (what the app is, how it teaches, each control and gesture, kept as data in `src/help/helpText.ts` like the intro's script); how it opens and closes; that page turns pause while it is open; Replay intro from it; how it fits small screens (scrolls inside itself); decisions and alternatives; verification |
| `layout` | Breakpoints, Reader Controls | Help joins the reader controls: a HELP key in the top bar at 600 px or wider, and a compact `?` key at the right end of the status line, beside Feedback, under 600 px (decision 2) |
| `layout` | Page Turning | Page-turn input also pauses while Help is open |
| `intro` | When It Shows | Replay is offered from the library and from the Help panel |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `HELP-001` | Add | When the learner taps Help, the system SHALL open a Help panel over the page that says what the app does (reading real stories in which one letter at a time becomes a Mandalorian glyph, learned from context) and what each reader control and page-turn gesture does. |
| `HELP-002` | Add | When the learner taps Close in the Help panel, taps outside it, or presses Escape, the system SHALL close it and show the same page as before it opened. |
| `HELP-003` | Add | While the Help panel is open, the system SHALL ignore page-turn keys, swipes and edge taps. |
| `HELP-004` | Add | The Help panel SHALL offer Replay intro, which closes the panel and shows the intro as INTRO-008 does, Let's go returning to the same passage. |
| `HELP-005` | Add | When the Help panel's content is taller than the viewport, the system SHALL scroll the panel within itself, keeping Close reachable, while the page behind it stays put. |
| `LAYOUT-003` | Revise | While the viewport is 600 px or wider, the system SHALL place Next letter, Quiz, Step back, Reset, Legend, Library, text size, appearance, Help, Feedback and Suggest a feature in a top bar, and only the page-turn buttons in the bottom bar. |
| `LAYOUT-016` | Revise | The system SHALL show the Help and Feedback buttons inline among the reader controls, styled like them and never floating over the page: in the top bar at 600 px or wider, and at the right end of the passage-title line at the top of the screen under 600 px, with the title keeping at least 40 % of that line. |

Net: +5 new, ~2 revised. With the alternative for decision 2 (Help in the phone menu sheet), LAYOUT-002 and LAYOUT-014 are revised in place of LAYOUT-016: +5 ~3.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/help/HelpPanel.test.tsx` | Add | `HELP-001` (the explanation and every control named in the text), `HELP-002` (Close, outside tap, Escape), `HELP-004` (Replay intro calls back) |
| `src/layout/ReaderChrome.test.tsx` | Change | `LAYOUT-003`, `LAYOUT-016` (Help in the top bar and in the title line) |
| `e2e/help.spec.ts` | Add | At three viewports: `LAYOUT-003`/`LAYOUT-016` (the Help key's place, 44 pt, the phone title still visible), `HELP-001` (opens over the page), `HELP-002` (closes back to the same page), `HELP-003` (arrow keys and edge taps do not turn the page while it is open), `HELP-004` (replay, then Let's go returns to the same passage), `HELP-005` (fits or scrolls at the phone viewport, Close reachable) |

`e2e/layout.spec.ts` needs no change: its console-key, 44 pt and overflow checks already cover every visible button, Help included.

### Code

| File | Action | What changes |
|---|---|---|
| `src/help/helpText.ts` | Add | The panel's text as data: the opening explanation and one entry per control or gesture |
| `src/help/HelpPanel.tsx` | Add | The panel (a console sub-panel in the overlay, with a dialog role and a label), Close and Replay intro keys, Escape |
| `src/layout/ReaderChrome.tsx` | Change | A `HelpButton`; it goes in `TopBar` and in `TitleBar`'s phone-only group beside Feedback; `ReaderActions` gains `onHelp` |
| `src/App.tsx` | Change | `helpOpen` state; the panel rendered over the reader; `reading` also false while it is open; Replay intro from it sets the intro view |
| `src/app.css` | Change | The panel (scrolling within itself, a rail for its keys) and the compact `?` key in the status line |

### Other

- `docs/user-flow.md`: a short step for finding Help (step 2, alongside the library and replay).
- `CLAUDE.md`: `help` (HELP) added to the list of nodes.
- No new dependencies, assets or deploy changes. No analytics event: the `analytics` LLD counts core-loop actions, not controls.

## Cross-Segment Effects

- **layout:** the top bar gains a key, which must still fit at the iPad portrait viewport without cutting a control (checked by the browser test); the phone status line gains a second key next to Feedback, so the title gets less room (see risks).
- **intro:** replay gains a second entry point; the intro itself is unchanged.
- **feedback:** the Feedback button shares the phone status line with Help; it keeps its place at the right end and its "needs a connection" note.
- **progression, quiz, content:** none. Help is a reader-only panel; the quiz and the library already have their own way back to reading.

## Decisions Needed

1. **What Help shows.** *Recommended:* a Help panel over the page, in the console look: two or three lines on what the app is and how it teaches, then one short line per control and gesture, with Replay intro and Close keys at the bottom. Quick to scan, and it covers the controls the intro does not mention (Legend, Step back, Library, page turns, X-ray). *Alternatives:* Help simply replays the intro terminal (smallest change, but slow to sit through and silent on most controls); or the panel without the Replay intro key.
2. **Where the Help key sits on a phone.** *Recommended:* a compact `?` key at the right end of the status line, beside Feedback, so a newcomer sees it without opening anything; on wider screens a HELP key in the top bar. *Alternative:* inside the ⋯ menu sheet on phones, like Suggest a feature (keeps the status line uncluttered, but the help is hidden behind a menu, which is where a confused learner looks last).

## Risks and Edge Cases

- **Phone status line space:** CO-011 found the Feedback key could crowd out the title; a second key makes that tighter. The `?` key is one square 44 pt key, and the revised LAYOUT-016 keeps the title at least 40 % of the line; the browser test checks the title is visible at the phone viewport.
- **Small or landscape phones:** the ticket was filed at 418 × 401 px. The panel's text will not fit that height, so it scrolls within itself with Close always reachable (HELP-005), tested at the phone viewport.
- **Page turns behind the panel:** a tap outside the panel closes it; that tap must not also turn the page or peek. The same gate used for the menu sheet and the feedback form (`reading`) covers keys and gestures, and the backdrop takes the tap.
- **Help text drifting from the controls:** the text names every control. The unit test checks that each reader control's label appears in the Help text, so a renamed or new control fails the test until Help is updated.
- **Overlap with the end and new-letter cards:** Help opens only from the reader controls, which those cards cover, so two overlays never stack.

## Verification

- Unit tests for the panel's content, closing and replay, and for the chrome placing the key.
- Browser tests in WebKit at the iPhone, iPad and laptop viewports for placement, size, opening and closing, paused page turns, replay and fitting the phone screen.
- CI; dev check on iPhone, iPad and laptop; production on go.

---

## Outcome

Filled in after the change is complete.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | 1 design-tree row | | |
| LLDs | 1 new (`help`), 3 sections in `layout`, 1 in `intro` | | |
| Specs | +5 ~2 | | |
| Tests | 3 files | | |
| Code | 5 files | | |
| Other | User flow, CLAUDE.md | | |

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
