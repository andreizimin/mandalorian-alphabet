---
parent: high-level-design
prefix: ANA
---

# Analytics

## Context and Design Philosophy

The owner wants two answers from the dashboard: did anyone actually use the app, and where did they stop. Every app on andreizimin.com reports to one Umami website, told apart by hostname, so this app adds the shared tag and a small vocabulary of events named after the project. Umami sets no cookie and keeps no identifier on the device, which is what makes analytics acceptable with a young primary user (HLD, Tenets: convenience over device purity) without a consent flow.

The events come from the core loop, not from the chrome: finishing the intro, advancing a letter, reading a page, finishing a quiz, and tapping the suggestion link. Together they show how far each session got on the ramp. Buttons like Legend, text size or appearance say nothing about learning and are not reported.

## The Tag

`index.html`, the app's one page, carries in its head:

```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="743c516f-8c6d-4584-9f2a-72a062108294"></script>
```

- `defer`: the tracker never delays the app's own script.
- No `data-domains`: the shared website is split by hostname in the dashboard, and a domain list here would stop the dev copy (`learn-mandalorian-dev.andreizimin.com`) from reporting under its own name.
- Nothing else: no `data-auto-track` changes, no tag manager.

The tracker reports a page view on load. The app has one route, so the view count is the visit count.

## Events

`src/analytics/analytics.ts` exports one function, `track(event, data?)`, which calls `window.umami?.track('mando_' + event, data)`. The prefix `mando_` comes from the repository name and keeps this app's events apart from other sites' in the shared dashboard. The optional chaining is the whole guard: when the script is blocked, offline, or not yet loaded, the call does nothing and the app behaves exactly as without analytics.

| Event | Fired when | Data | Why |
|---|---|---|---|
| `mando_intro_done` | Let's go on the intro terminal | none | Did the visitor get past the door? |
| `mando_letter_advance` | A new letter joins the learned set | `learned`: letters now learned | The ramp's progress; the highest count per visitor is where they stopped |
| `mando_page_read` | A forward page turn that counts as new reading (not a re-read) | `learned`: letters learned at the time | Did they read, and how much, at each stage of the ramp |
| `mando_quiz_done` | A quiz session shows its results | `score` out of 10, `learned` | Did they try the quiz and how they did |
| `mando_suggest_feature_click` | The Suggest a feature key is tapped | none | How often ideas are offered; the idea itself goes to the feedback platform, never here |

Data is counts only. Nothing identifies a passage (a pasted title is the learner's own text), and nothing the learner types, pastes or answers in the quiz is sent. The events are placed at the action in `App.tsx` (intro, advance, page read) and `QuizScreen.tsx` (results), next to the state change they describe.

## What Is Never Sent

- Typed or pasted text, passage titles, quiz prompts or answers, names, contact details.
- Anything from the feedback form; the widget is a separate channel with its own rules (see `feedback`).
- Cookies: Umami uses none, and the app sets none. There is no consent banner because there is nothing to consent to.

## Tests and the Tracker

Browser tests load the real `index.html`, so every browser test, including the live-site check against the dev and production addresses, blocks `https://cloud.umami.is/**`. Otherwise every CI run would count as a visitor. The shared `test` in `e2e/test.ts` does this for every page; specs import it instead of Playwright's own. Tests that check events install a stand-in `window.umami` that records calls. Unit tests never load the tracker; they check the tag text in `index.html` and call `track` with and without a stand-in.

## Offline

The tracker is cross-origin and not in the service worker's precache (see `offline`). Offline, the tag fails to load and every `track` call is a no-op; reading, the quiz and progression are unaffected.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Tracker | Umami, the shared cloud account | Plausible; a self-hosted Umami; none | One dashboard for every site; cookieless, so no consent flow |
| Prefix | `mando_` from the repository name | Per-event names without a prefix | The website ID is shared, so names must not collide |
| Guard | `window.umami?.track` at the call site | A queue that replays events once the script loads | A blocked tracker should lose events, not hold them; nothing is lost that matters |
| Event set | Five core-loop events | Every button; peeks; passage ends | Five answer "used it, how far"; peeks and ends add volume without changing that answer |
| Data in events | Counts only | Passage id or title | A pasted title is the learner's own text; counts cannot leak anything |
| Dev traffic | Reported under the dev hostname | Tag only in production builds | The shared setup already separates hostnames; seeing dev checks is useful, and the tag is identical on every stage |
| Tests | Block the tracker in every browser test | Let CI count as visits | A visit from CI on every push would drown real use |

## Open Questions & Future Decisions

### Deferred
1. A short privacy note and a setting to turn analytics off (`ANA-009`). Umami stores nothing on the device, so nothing is urgent; add when asked for.
2. A per-visitor funnel (intro → first letter → first quiz) needs session stitching in the dashboard, which Umami Cloud provides as reports; nothing in the app.

## References

- Umami tracker script and `umami.track`: https://umami.is/docs/tracker-functions
- HLD, Tenets: convenience over device purity.
