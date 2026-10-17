# CO-007: Dark and light mode

| | |
|---|---|
| Type | Feature |
| Status | Proposed |
| Requested | 2026-10-16 |
| Approved | |
| Completed | |
| Ticket | [ZZF-67](https://linear.app/zizify-workshop/issue/ZZF-67) |

## Request

"Should have a dark/light mode"

## Intent

The learner chooses how the app looks: Auto (follow the device, as today), Light or Dark. The choice is one tap away among the reader controls, applies at once, and is remembered on the device like text size.

## Predicted Impact

### HLD

None. Appearance is a layout detail; the design tree and key decisions are unchanged.

### LLDs

| Component | Section | Change |
|---|---|---|
| `layout` | Reader Controls | The appearance control joins the list: in the top bar at 600 px or wider, in the menu sheet under 600 px, where it leaves the sheet open like text size |
| `layout` | Appearance (new) | The setting (Auto, Light, Dark; default Auto), the one-button cycle, how it is applied (an attribute on the document root that selects the color tokens and `color-scheme`), and how settings saved before this change are read |
| `layout` | Platform | "Follows the system appearance" becomes "while Auto" |
| `layout` | Decisions & Alternatives | New row: one cycling button over a two-state toggle or a settings screen |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `LAYOUT-017` | Add | The system SHALL let the learner set the appearance to Auto, Light or Dark (default Auto) with one control that steps Auto → Light → Dark → Auto and shows the current choice; while Light or Dark is chosen the system SHALL draw the app in that appearance regardless of the system setting, and SHALL save the choice in the settings slice. |
| `LAYOUT-018` | Add | When restoring or importing settings saved without an appearance, the system SHALL treat the appearance as Auto. |
| `LAYOUT-005` | Revise | The system SHALL respect device safe areas and, while the appearance is Auto, SHALL follow the system light or dark appearance. |
| `LAYOUT-002` | Revise | The menu sheet's list gains appearance: "... Step back, Reset, Legend, Library, text size and appearance in a menu sheet ..." |
| `LAYOUT-003` | Revise | The top bar's list gains appearance: "... Library, text size, appearance and Feedback in a top bar ..." |
| `LAYOUT-014` | Revise | "... the text-size and appearance buttons SHALL leave it open so the result can be seen and stepped repeatedly." |

Net: +2 new, ~4 revised, 0 deleted.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/layout/settings.test.ts` | Change | `LAYOUT-017` (default Auto, cycle order), `LAYOUT-018` (validator accepts settings without an appearance, rejects unknown values) |
| `src/layout/appearance.test.ts` | Add | `LAYOUT-005`, `LAYOUT-017` (applying the setting sets or removes the root attribute) |
| `src/layout/ReaderChrome.test.tsx` | Change | `LAYOUT-002`, `LAYOUT-003`, `LAYOUT-014` (control in the top bar and the sheet; the sheet stays open) |
| `src/persistence/settingsPersistence.test.tsx` | Change | `PERS-001`, `LAYOUT-018` (stored shape includes appearance; older stored settings load as Auto without a notice) |
| `e2e/layout.spec.ts` | Change | `LAYOUT-005`, `LAYOUT-017` (Dark under a light system and Light under a dark system; Auto follows the system; the choice survives a reload; reachable at each width) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/layout/settings.ts` | Change | `appearance` in `Settings` (optional in the type, since older saved settings lack it); `cycleAppearance`; `validateSettings` accepts a missing or valid appearance |
| `src/layout/appearance.ts` | Add | Applies the setting to the document root (`data-appearance`, removed for Auto) |
| `src/layout/ReaderChrome.tsx` | Change | `AppearanceControl`; in `TopBar` and `MenuSheet`; new `appearance` and `onAppearance` in `ReaderActions` |
| `src/App.tsx` | Change | Applies the setting in an effect; wires the action |
| `src/app.css` | Change | Dark tokens also under `:root[data-appearance="dark"]`; the system-dark block skips `[data-appearance="light"]`; `color-scheme` follows the choice |

### Other

`docs/user-flow.md`: step 9 mentions the appearance choice. No new dependencies, assets or deploy changes. The `theme-color` meta tag stays as it is.

## Cross-Segment Effects

- **persistence:** stores the extended settings slice unchanged; the validator stays in `layout`. Older saved settings must load without the "could not be read" notice (LAYOUT-018).
- **reader, progression, quiz, content, alphabet, offline, feedback:** none. Every color already comes from the root tokens.

## Decisions Needed

None. The control is one button that cycles Auto → Light → Dark and shows the current choice; a two-state toggle would lose Auto, and a settings screen is more than three values need.

## Risks and Edge Cases

- **Existing learners:** their saved settings are `{ textSize }` only. If the validator rejected them, every learner would see the "saved progress could not be read" notice and lose their text size. LAYOUT-018 and a persistence test guard this.
- **Contrast:** the chosen appearance uses the same tokens as the system one, so the newest-letter contrast (LAYOUT-015) holds; the browser test runs the contrast check in both appearances.
- **Form controls and scrollbars:** `color-scheme` must follow the forced appearance, or a light page gets dark native controls.
- **Crowded phone menu:** the sheet gains one button and wraps to a second row on narrow phones; every button stays 44 pt.

## Verification

- Unit tests for the setting, its validator, the control and persistence of older settings.
- Browser tests in WebKit (iPhone, iPad, laptop): a forced appearance overrides the emulated system one, Auto follows it, the choice survives a reload.
- CI passes; the pipeline deploys dev; the requester checks on an iPhone and an iPad.
- Production from `main` on their go.

---

## Outcome

Filled in after the change is complete.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | None | | |
| LLDs | 4 sections in `layout` | | |
| Specs | +2 ~4 | | |
| Tests | 5 files | | |
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
