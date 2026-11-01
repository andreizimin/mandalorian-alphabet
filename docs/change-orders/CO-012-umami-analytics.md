# CO-012: Umami analytics and a Suggest-a-feature link

| | |
|---|---|
| Type | Feature |
| Status | Done (not deployed) |
| Requested | 2026-10-31 |
| Approved | 2026-10-31 (as written; the decisions below were taken with the recommended options) |
| Completed | 2026-10-31 |
| Ticket | none (asked in conversation) |

## Request

"Add Umami analytics to this site. 1. Add this exact tag to the `<head>` of every HTML page served to users … Do not add a data-domains attribute; all my sites share one Umami website ID and are separated by hostname. `<script defer src="https://cloud.umami.is/script.js" data-website-id="743c516f-8c6d-4584-9f2a-72a062108294"></script>` 2. Add custom events for the 3 to 5 user actions that best answer 'did anyone actually use this, and where did they stop'. Pick them from this project's core loop, not from UI chrome. Name every event with a project prefix derived from this repo's name, e.g. mando_level_up … Use umami.track('event_name', { key: value }) and guard the call so the page works if the script is blocked: window.umami?.track(...). 3. Add a visible 'Suggest a feature' link that opens <SUGGESTION_URL> in a new tab, and fire an event <prefix>_suggest_feature_click when it is clicked. 4. Do not add cookies, consent banners, or any other analytics. Do not track form contents or anything typed by the user. 5. List the events you added with a one-line reason for each, and tell me which file(s) you changed. Do not deploy."

## Intent

The owner can see, in the shared Umami dashboard, whether anyone used the app and how far they got: through the intro, how many letters they learned, how many pages they read, whether they took the quiz. A learner with an idea has a second, lighter channel next to Feedback: a link straight to the suggestion page. Nothing the learner types is ever sent, no cookie is set, no banner appears, and reading keeps working when the analytics script is blocked or the device is offline. This resolves the HLD's open question on analytics: Umami is cookieless and collects no identifier, so no consent flow is needed; a privacy note and an opt-out setting stay deferred until asked for.

## Predicted Impact

### HLD

- Design Tree: new `analytics` node (prefix `ANA`).
- Key Decisions: one new entry, "Analytics: Umami, cookieless, loaded from the shared cloud account; a handful of core-loop events; nothing typed is sent."
- Open Questions: item 1 (analytics with a young user) is answered and removed; the deferred privacy note and opt-out are recorded in the `analytics` LLD instead.

### LLDs

| Component | Section | Change |
|---|---|---|
| `analytics` (new) | All | New leaf: the script tag and why it carries no `data-domains`, the event vocabulary and the `mando_` prefix, the guard when the script is absent, what is never sent, tests keeping Umami out of browser runs, and the deferred opt-out |
| `feedback` | Suggesting a Feature (new); Decisions | The Suggest a feature link: where it points, opens in a new tab, reports a click to `analytics` |
| `layout` | Reader Controls; Breakpoints | Suggest a feature in the top bar at 600 px and wider and in the phone menu sheet |
| `offline` | Mechanism | The analytics script is not precached and its absence is harmless |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `ANA-001` | Add | The system SHALL load the Umami tracker from `https://cloud.umami.is/script.js` with the shared website ID `743c516f-8c6d-4584-9f2a-72a062108294` as a deferred script in the head of the app's one HTML page, with no `data-domains` attribute. |
| `ANA-002` | Add | When the app reports an event, the system SHALL name it with the `mando_` prefix and SHALL do nothing if the tracker is not present on the page. |
| `ANA-003` | Add | When the learner completes the intro with Let's go, the system SHALL report `mando_intro_done`. |
| `ANA-004` | Add | When the learner advances to a new letter, the system SHALL report `mando_letter_advance` with the number of letters learned after the advance. |
| `ANA-005` | Add | When a page turn counts as new reading, the system SHALL report `mando_page_read` with the number of letters learned. |
| `ANA-006` | Add | When a quiz session reaches its results, the system SHALL report `mando_quiz_done` with the score out of 10 and the number of letters learned. |
| `ANA-007` | Add | When the learner taps Suggest a feature, the system SHALL report `mando_suggest_feature_click`. |
| `ANA-008` | Add | The system SHALL never report typed text, pasted passages, passage titles of pasted content, names or contact details, and SHALL set no cookie and show no consent banner. |
| `ANA-009` | Add (deferred) | The system SHALL carry a short privacy note and a setting that turns analytics off. |
| `FEED-006` | Add | The system SHALL show a Suggest a feature link among the reader controls that opens the suggestion page in a new tab. |
| `LAYOUT-002` | Revise | The menu sheet list gains Suggest a feature. |
| `LAYOUT-003` | Revise | The top-bar list gains Suggest a feature. |

Net: +10 new (1 deferred), ~2 revised, 0 deleted.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/analytics/analytics.test.tsx` | Add | `ANA-001` (the exact tag in `index.html`), `ANA-002` (prefix; no error without the tracker), `ANA-007`, `FEED-006` (the link's target, new tab, click event) |
| `src/quiz/QuizScreen.test.tsx` | Change | `ANA-006` |
| `src/layout/ReaderChrome.test.tsx` | Change | `LAYOUT-002`, `LAYOUT-003` (Suggest a feature in the top bar and the menu sheet) |
| `e2e/analytics.spec.ts` | Add | `ANA-003`, `ANA-004`, `ANA-005`, `ANA-007`, `FEED-006` with a stand-in `window.umami` recording calls; the real tracker is never reached |
| `e2e/test.ts` | Add | A shared `test` whose page blocks `cloud.umami.is`, used by every browser spec including the live check, so no test run counts as a visitor |

### Code

| File | Action | What changes |
|---|---|---|
| `index.html` | Change | The Umami script tag in the head |
| `src/analytics/analytics.ts` | Add | `track(event, data)`: prefixes the name and calls `window.umami?.track` |
| `src/feedback/SuggestLink.tsx` | Add | The Suggest a feature link, `target="_blank"`, reports the click |
| `src/layout/ReaderChrome.tsx` | Change | Suggest a feature in the top bar and the menu sheet |
| `src/App.tsx` | Change | Reports intro done, letter advance and page read |
| `src/quiz/QuizScreen.tsx` | Change | Reports quiz done when the results show |
| `src/app.css` | Change | The link drawn as a console key |

### Other

- `docs/user-flow.md`: step 10b mentions Suggest a feature; a line on what the app reports.
- `CLAUDE.md`: `analytics` (ANA) in the node list.
- No dependency: the tracker is a plain script tag.
- Not deployed by this change order: no push, no pull request, at the requester's instruction.

## Cross-Segment Effects

- **feedback:** owns the Suggest a feature link as a second feedback channel.
- **layout:** places the link.
- **offline:** records that the tracker is online-only and optional.
- **intro, progression, content, quiz:** the events hang off existing actions in `App.tsx` and `QuizScreen.tsx`; no logic changes in those nodes.

## Decisions Needed

Asked after the fact, since the request was to carry the change through without stops. Each was taken with the recommended option and can be reversed in a follow-up.

1. **The suggestion address.** The request names it `<SUGGESTION_URL>`, unfilled. *Taken:* one constant, `SUGGESTION_URL` in `src/feedback/SuggestLink.tsx`, holding the placeholder text until the real address is given. *Alternative:* point it at the shared feedback form, which already files feature ideas.
2. **Where the link sits on phones.** *Taken:* in the ⋯ menu sheet, next to Library; the title line is already full with Feedback (CO-011). *Alternative:* a second key on the title line.
3. **The opt-out setting and privacy note from the HLD's open question.** *Taken:* deferred as `ANA-009`; the request asks for no banner, and Umami stores nothing on the device. *Alternative:* a setting in the menu now.
4. **Dev and local traffic.** *Taken:* dev events reach the dashboard under the dev hostname, as the shared setup separates sites by hostname; local development and every test run block the tracker. *Alternative:* skip the tag outside production.

## Risks and Edge Cases

- **A blocked or offline tracker:** every call goes through `window.umami?.track`, so a missing script is a no-op; the script tag is `defer`, so it never delays the app.
- **Test runs as visitors:** the browser tests run on every push and the live check hits the real dev and production addresses; all of them block `cloud.umami.is`.
- **Typed text:** events carry only counts (letters learned, score); passage identity is never sent, so a pasted title cannot leak.
- **Event volume:** `mando_page_read` fires once per new page, not per re-read; a long session is a few hundred events at most.
- **The placeholder address:** until `SUGGESTION_URL` is filled, the link opens a page that does not exist; the test asserts the link uses the constant, so filling it is a one-line change.
- **Service worker:** the tracker is cross-origin and not in the precache; the navigation fallback does not touch it.

## Verification

- Unit tests: the tag in `index.html`, the guard, the prefix, the quiz event, the link.
- Browser tests with a stand-in tracker: intro done, letter advance, page read, suggest click and the new tab, at iPhone, iPad and laptop sizes.
- Typecheck and the full unit suite pass locally. No deploy.

---

## Outcome

Written at the end of the change, before any review. The change was not pushed, so there is no pipeline run and no dev check; screenshots of the laptop top bar and the phone menu in the day palette were taken with Playwright against a local build and reviewed.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | 3 changes | 3 changes | Design Tree row, Key Decision, open question closed |
| LLDs | 1 new, 3 changed (4 sections) | 1 new, 3 changed (5 sections) | `layout` also changed its Breakpoints table row, as the prediction's section list said but its count did not |
| Specs | +10 (1 deferred) ~2 | +11 (1 deferred) ~2 | `ANA-010` added for the tracker block in browser tests, so the `e2e/test.ts` annotation has a spec to cite |
| Tests | 5 files | 11 files | The six existing browser specs each changed one import line to pick up the shared `test` |
| Code | 7 files | 8 files | `src/feedback/suggestion.ts` holds the address on its own, so the browser spec can import it without pulling in React |
| Other | user flow, `CLAUDE.md` | user flow, `CLAUDE.md` | `CLAUDE.md`'s node list also gained the missing `intro` entry |

### Surprises

1. **The quiz event could not sit in `next()`.** The last question's results phase is reached either by the Next button or by the 1.5-second timer, and the timer's callback closes over the picks of an earlier render, one pick short. The event moved to an effect on the results phase, where the picks are complete. The unit test that answers the last question wrong is what made this visible in the design rather than in the dashboard.
2. **The sibling repos had no Umami to copy.** The request reads as a template applied across sites, and the suggestion address was left as `<SUGGESTION_URL>`; no other repo on this machine had the real one. The address is a placeholder on a `.invalid` host until given.
3. **A stale build fooled the screenshots.** Comparing the browser suite against the untouched tree rebuilt `dist/` from `main`, and the first screenshots showed no link. A rebuild fixed it; the browser tests, which build their own preview, had been right all along.
4. **Parallel browser runs saturate this machine.** One run with the default worker count timed out on every `page.goto`; a rerun passed. Not caused by the change, and CI runs one worker.

### Commits

| Hash | Message |
|---|---|
| `6f86f56` | CO-012 proposed: Umami analytics and a Suggest-a-feature link |
| (this commit) | CO-012: Umami analytics and a Suggest-a-feature link |

### Measurements

| | |
|---|---|
| Tests before → after | unit 319 → 327, browser 84 → 99 passed (5 skipped) |
| Lines changed | +103 −2 (code, 8 files), +209 −6 (tests, 11 files), +127 −8 (HLD, design docs, specs, user flow, `CLAUDE.md`) |
| Agent time | about 50 minutes from the proposal to the outcome, with no stops |
| Deployed | Not deployed, at the requester's instruction; the branch `co-012-umami-analytics` is local only |
