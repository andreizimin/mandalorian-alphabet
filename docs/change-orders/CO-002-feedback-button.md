# CO-002: Feedback button in the top bar

| | |
|---|---|
| Type | Feature |
| Status | In progress |
| Requested | 2026-10-12 |
| Approved | 2026-10-12 |
| Completed | |
| Ticket | [ZZF-56](https://linear.app/zizify-workshop/issue/ZZF-56) |

## Request

"Add the feedback widget to the mandalorian alphabet project - as a separate button on the top - in the same style as the rest of the buttons, in line - not floating above the interface"

## Intent

Learners can send a feature idea or bug report from inside the app, through the shared feedback platform (feedback.andreizimin.com) that files Linear tickets labelled `learn-mandalorian`. The entry point is an ordinary button among the reader's controls, styled like them, instead of the widget's floating corner button.

## Findings That Shape the Plan

- **The widget has no inline mode.** `widget/widget.js` in the `feedback-platform` repo renders only a floating button (`position: fixed`, maximum z-index) and keeps its `open()` function private. Its options are project, endpoint, accent, label and position. An inline button cannot open the form without either a widget change or reaching into its internals.
- **Keys and taps leak out of the widget.** The form lives in a shadow DOM, so events from it reach this app retargeted to the widget's host element. Arrow keys typed in the feedback text box, and taps near the screen edges, would currently turn the reader's page.
- **The widget needs the network.** It loads from another origin and is not part of the offline cache, so the button must handle the widget being unavailable.
- **The platform has its own rules for changes.** [feedback-platform](https://github.com/andreizimin/feedback-platform)'s `constitution.md` treats any change to the embed contract as an infrastructure change affecting every app, requires the widget to stay small and inert in host pages, and names kids among its users. Its agent rules allow changes only by pull request; merging is the owner's, and a merge to `main` auto-deploys the widget.
- **The widget sends device details on submit:** page, URL, user agent, language and viewport, plus optional name and contact fields. Submitting is always the learner's choice.

## Predicted Impact

Assumes decision 1 is the recommended widget change.

### HLD

- Design Tree: new `feedback` node (prefix `FEED`).
- Key Decisions: in-app feedback goes through the shared feedback platform, opened from an in-app button.

### LLDs

| Component | Section | Change |
|---|---|---|
| `feedback` (new) | All | New leaf: what the widget is, how it is loaded (slug `learn-mandalorian`, launcher hidden, accent matched to the app), how the button opens it, availability offline or on load failure, keeping reading input quiet while the form is open, what data a submission sends, and decisions |
| `layout` | Reader Controls; Breakpoints | Feedback button in the top bar at 600 px and wider, and its phone placement (decision 2) |
| `layout` | Page Turning | Swipes, edge taps and arrow keys are ignored while the feedback form is open, and for events coming from inside the widget |
| `offline` | Mechanism | The widget is not precached; feedback needs a connection |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `FEED-001` | Add | When the app starts, the system SHALL load the shared feedback widget from `feedback.andreizimin.com` with project slug `learn-mandalorian`, its floating launcher hidden, and its accent set to the app's accent color. |
| `FEED-002` | Add | When the learner taps the Feedback button, the system SHALL open the shared feedback form. |
| `FEED-003` | Add | While the feedback widget has not loaded (offline, blocked or failed), the system SHALL show the Feedback button disabled with the reason "Feedback needs a connection". |
| `FEED-004` | Add | While the feedback form is open, the system SHALL ignore page-turn keys, swipes and edge taps, and SHALL never treat key or pointer events from inside the feedback widget as page turns. |
| `LAYOUT-016` | Add | The system SHALL show the Feedback button inline among the reader controls, styled like them and never floating over the page: in the top bar at 600 px or wider, and on phones per decision 2. |
| `LAYOUT-003` | Revise | Top-bar control list gains Feedback. |
| `LAYOUT-002` | Revise | Only if decision 2 places Feedback in the phone menu sheet. |

Net: +5 new, ~1–2 revised, 0 deleted.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/feedback/feedback.test.tsx` | Add | `FEED-001`, `FEED-002`, `FEED-003`, `FEED-004` (with a fake widget; no network) |
| `src/layout/ReaderChrome.test.tsx` | Change | `LAYOUT-016`, `LAYOUT-003` |
| `src/layout/gestures.test.ts` | Change | `FEED-004` (events from the widget host are ignored) |
| `e2e/feedback.spec.ts` | Add | `LAYOUT-016` (inline, same size as other controls, not fixed-position) and `FEED-002`/`FEED-004` in WebKit, with the widget script stubbed and the submit endpoint blocked so tests never file real tickets |

### Code

| File | Action | What changes |
|---|---|---|
| `src/feedback/useFeedbackWidget.ts` | Add | Injects the widget script once, tracks loaded and open state from the widget's events, exposes `open()` |
| `src/feedback/FeedbackButton.tsx` | Add | The button, its disabled reason, wired to `open()` |
| `src/layout/ReaderChrome.tsx` | Change | Feedback button in the top bar (and phone placement) |
| `src/layout/gestures.ts` | Change | Ignore pointer events whose target is the widget host |
| `src/layout/pageTurning.tsx` | Change | Ignore key events whose target is the widget host |
| `src/App.tsx` | Change | Page turns paused while the feedback form is open |

### Other

- **feedback-platform repo (outside this app's arrow):** `widget/widget.js` gains `data-launcher="none"` (hide the floating button), a `window.FeedbackWidget.open()` method, and `feedback:ready`, `feedback:open` and `feedback:close` events; `EMBED.md` documents them. The change is backwards compatible (existing embeds keep their floating button) and adds a few dozen lines to the widget. Per that repo's rules it goes in as a pull request on a branch; merging is the owner's decision and auto-deploys the widget. It gets its own ticket (decision 4), and this app's change ships only after that merge.
- `docs/user-flow.md`: a line about sending feedback.

## Cross-Segment Effects

- **layout:** places the button and pauses page turns while the form is open.
- **offline:** records that feedback is online-only.
- **persistence, progression, quiz, content, reader:** none.
- **feedback-platform (another repo):** the widget change above. This app's change depends on it shipping first.

## Decisions Needed

All four answered on 2026-10-12, each with the recommended option: extend the shared widget; on phones a compact button at the right end of the passage-title line; the label "Feedback"; a separate ticket for the widget change.

1. **How to get an inline button.** *Recommended:* extend the shared widget with a hidden-launcher option and a public `open()`, which every app can reuse. *Alternatives:* reach into the widget's shadow DOM from this app to hide its button and click it programmatically (no widget change, but breaks whenever the widget's internals change); or build an in-app form that posts to the platform's endpoint (duplicates the widget, which its own docs advise against).
2. **Phones.** Below 600 px there is no top bar; the bottom bar is full. *Recommended:* a compact Feedback button at the right end of the passage-title line at the top, which keeps it "on the top, in line". *Alternatives:* inside the ⋯ menu sheet (one more tap); or desktop and tablet only.
3. **Button text.** *Recommended:* "Feedback", matching the widget's own wording. *Alternative:* the 💬 icon only, with "Feedback" as its accessible name.
4. **A ticket for the widget change.** *Recommended:* file `[feedback-platform] [Feature] Inline trigger: hide the floating button and open the form from the host page` as its own ticket, so the platform change is tracked where it lives.

## Risks and Edge Cases

- **Page turns while typing feedback:** the main trap; FEED-004 and its tests cover keys and pointer events from inside the widget.
- **Real tickets from tests:** browser tests stub the widget and block `/submit`; unit tests never load the real script.
- **An embed-contract change touches every app:** the new options are additive and off by default, so apps that don't set them see no change; the pull request's description says so for review.
- **The shared widget changes later:** this app loads it unversioned from the platform, so a widget change can affect this app without a deploy here. The public `open()` and events become a contract the platform should keep stable.
- **Offline and slow loads:** the button stays disabled with a reason until the widget reports it is ready.
- **Data sent off the device:** only on submit, by the learner's choice; recorded in the `feedback` design. The widget's optional name and contact fields stay as they are.
- **Third-party fonts:** the widget loads Google Fonts for its own form; acceptable under the convenience tenet, and it does not affect the reading page.

## Verification

- Unit tests with a fake widget, covering loading, opening, the unavailable state and paused page turns.
- WebKit browser tests at iPhone, iPad and laptop sizes: the button sits inline, matches the other controls' size and style, opens the form, and arrow keys in the form don't turn pages.
- After the widget change and this change are both deployed: send one real feedback item from the live app and confirm a `[learn-mandalorian]` ticket appears in Linear.

---

## Outcome

To be filled in when the change is complete.
