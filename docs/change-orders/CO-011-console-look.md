# CO-011: The console look

| | |
|---|---|
| Type | Feature |
| Status | Proposed |
| Requested | 2026-10-17 |
| Approved | |
| Completed | |
| Ticket | [ZZF-71](https://linear.app/zizify-workshop/issue/ZZF-71) |

## Request

"I want the main interface to look like the mandalorian console - not a standard UI" (with a screenshot of the laptop layout: plain rounded buttons in two rows, a plain page, a plain bottom bar).

## Intent

The whole app reads as one Mandalorian console, the one the intro terminal already is: a framed dark panel, amber text and rules, monospace upper-case controls that look like console keys, a status line instead of a plain title, and the passage shown inside the panel. Nothing looks like a stock web page. Reading stays as comfortable as today: the passage keeps its reading font and sizes, the glyphs are unchanged, and every control keeps its name, place and size, so the layout specs and the browser tests hold.

## Predicted Impact

### HLD

Key Decisions: one new entry, "Look: the app is drawn as a Mandalorian console, the intro terminal's style carried through the reader, library and quiz; reading text keeps a reading font for legibility." The polish goal already asks for it.

### LLDs

| Component | Section | Change |
|---|---|---|
| `layout` | Console Look (new) | The design language: tokens (panel, ink, amber, rules), the frame around the page, the status line (passage title with a cursor, the DEV marker as a console tag), console keys (monospace, upper case, square corners, amber edge, filled key for the primary action), bars as console rails, cards and sheets as sub-panels, the readiness hint as a console message; what the two appearances mean under it (decision 1); reading text in the reading font (decision 2); effects (decision 4) |
| `layout` | Platform | The appearance setting's two looks are the console's night and day panels |
| `layout` | Decisions & Alternatives | Rows: console look over the stock look; reading font kept; appearance as two console palettes; effects |
| `intro` | Appearance | The terminal uses the shared console tokens rather than its own colors (no visible change) |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `LAYOUT-021` | Add | The system SHALL draw the reader, library and quiz as a Mandalorian console: a framed panel in the console palette, controls as monospace upper-case console keys with square corners and the accent edge, the passage title as a status line, and the page-turn and control bars as rails of the same panel; no control SHALL use the browser's default button look. |
| `LAYOUT-022` | Add | The system SHALL keep the passage text in the reading font at the chosen text size, and the glyph font unchanged, inside the console. |
| `LAYOUT-015` | Revise | The system SHALL define the console palette (page, text, muted, accent and newest-letter colors) for both appearances with a contrast ratio of at least 4.5:1 for text and the newest-letter highlight against the page. |
| `LAYOUT-017` | Revise | ... while Light or Dark is chosen the system SHALL draw the console in that appearance's palette regardless of the system setting ... (wording only; the control and the saving are unchanged) |

Net: +2 new, ~2 revised. Decision 4 may add one spec for effects under reduced motion.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `e2e/layout.spec.ts` | Change | `LAYOUT-021` (controls in a monospace family with square corners; the page inside a framed panel; the title line is a status line), `LAYOUT-022` (passage font family unchanged, serif), `LAYOUT-015` (contrast of text and highlight in both appearances; the existing test extended) |
| `src/layout/ReaderChrome.test.tsx` | Change | `LAYOUT-021` (the status line carries the title and the cursor; labels unchanged for assistive technology) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/app.css` | Change | Rewritten around console tokens: the panel, frame, rails, keys, status line, cards, sheet, hint, quiz choices and library; the intro's own colors become the shared tokens |
| `src/layout/ReaderChrome.tsx` | Change | The title line becomes a status line (`<p class="status-line">`) with a cursor and the DEV tag; class names only, no new behaviour |
| `src/App.tsx` | Change | The reader wrapper gets the console frame structure (a `console` class on `main`; the library and quiz views wrapped in the same panel) |
| `index.html`, `src/offline/pwaOptions.ts` | Change | `theme-color` and the manifest's `background_color` match the console palette |

### Other

- `docs/user-flow.md`: step 2 says the passage opens inside the console.
- The stage test for the manifest (`e2e/live.spec.ts`) matches names only, not colors; no change.
- No new dependencies: the console font is the same system monospace stack the intro uses, and the glyph font is unchanged.

## Cross-Segment Effects

- **intro:** adopts the shared tokens; nothing visible changes.
- **quiz, content (library), persistence (data panel), progression (cards, hint, legend), feedback (button), alphabet (font notice):** restyled through shared classes and tokens; no component logic or test changes expected beyond the chrome.
- **content (pagination):** the page area's size changes with the frame's padding; pagination measures the area, so pages re-cut correctly. The overflow browser test guards it.

## Decisions Needed

1. **What the appearance setting means in a console.** *Recommended:* the console has a night palette (black panel, amber text, the terminal's look) and a day palette (warm paper panel, dark brown ink and amber rules, the same frames and keys), and Auto/Light/Dark pick between them as today. *Alternative:* the console is always the night palette; the appearance control is removed and CO-007's specs are retired.
2. **The passage text.** *Recommended:* keep the serif reading font for the passage, inside the console; long reading in a monospace face is harder on the eyes, and the glyph font is unchanged either way. *Alternative:* everything in the console monospace, passage included.
3. **How far it goes.** *Recommended:* the whole app: reader, library, quiz, cards, menu sheet, hint, data panel. *Alternative:* the reader's chrome only, leaving the library and quiz as they are.
4. **Screen effects.** *Recommended:* a subtle inner glow and vignette on the panel, no scanlines; glyphs stay crisp. *Alternatives:* none at all; or full CRT scanlines and flicker (turned off under reduced motion).

## Risks and Edge Cases

- **Legibility:** amber on black at 4.5:1 is the floor; the newest-letter highlight needs its own distinct amber that still meets it. The contrast test measures both.
- **Tap targets:** square keys must stay 44 pt; the existing test measures every visible button.
- **Pagination:** the frame's padding shrinks the reading area a little; pages are measured, so they re-cut. Checked by the overflow test.
- **The feedback widget:** it is a third-party overlay with its own styling and stays as it is.
- **Day palette contrast:** a light console must not become a plain page again; the frame, keys and status line carry the look even on paper.
- **Screenshot drift:** no visual-regression tests exist; the requester's dev check is the visual acceptance.

## Verification

- Browser tests for the console properties (monospace keys, square corners, frame, status line, serif passage) and contrast in both appearances, at three viewports.
- Unit tests for the chrome unchanged in behaviour.
- CI; dev check on iPhone, iPad and laptop; production on go.

---

## Outcome

Filled in after the change is complete.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | 1 key decision | | |
| LLDs | 3 sections in `layout`, 1 in `intro` | | |
| Specs | +2 ~2 | | |
| Tests | 2 files | | |
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
