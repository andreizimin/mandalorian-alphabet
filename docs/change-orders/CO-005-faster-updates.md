# CO-005: Keep offline, with faster updates

| | |
|---|---|
| Type | Feature |
| Status | Proposed |
| Requested | 2026-10-12 |
| Approved | |
| Completed | |
| Ticket | [ZZF-65](https://linear.app/zizify-workshop/issue/ZZF-65) |

## Request

"Offline decision: keep it with faster updates"

Background: when asked whether offline support is worth its cost, the options offered were to keep it as is, keep it with faster updates, or drop it. Offline only started working in production with CO-004, which fixed the hosting gap that had kept the service worker from installing.

## Intent

The app stays readable with no connection, and a new version reaches the learner the next time they open the app, not one or more launches later. A page never changes under a learner who is already reading.

## Findings That Shape the Plan

- **Why updates are late today.** The service worker is set to wait (`skipWaiting: false`): a new version downloads in the background but takes over only once every copy of the app is closed. On iPhone, a Home Screen app is usually suspended rather than closed, so the new version can wait through several openings.
- **A resumed app never checks.** The browser looks for a new service worker when a page loads. An iPhone app brought back from the background resumes the same page without loading it, so it doesn't look for updates at all.
- **Taking over immediately is safe for this build.** The build is one JavaScript file and one stylesheet, both loaded before the learner sees anything. A new service worker taking control can't strand the open page waiting for a file that has since been replaced.
- **Taking over alone is not enough on iPhone.** Even when the new version takes control at once, the page already on screen is the old one. A Home Screen app has no reload button, so the learner would still see the change only on the following launch. Seeing it on the first opening needs one automatic reload, done before the learner starts reading.
- **A reload loses nothing.** Progress, settings, the current passage and the position on it are already saved across reloads (PERS-001).

## Predicted Impact

### HLD

None. Offline stays one of the app's goals; how updates arrive is in the `offline` LLD.

### LLDs

| Component | Section | Change |
|---|---|---|
| `offline` | Updates | Rewritten: check on every opening and every return to the foreground; a new version takes control as soon as it is downloaded; one automatic reload only in the opening window (decision 1) |
| `offline` | Mechanism | Registration is the app's own code (it needs the foreground check and the reload rule), not the plugin's generated script |
| `offline` | Decisions & Alternatives | "Update timing" row revised: the chosen option and why the quiet next-launch update was dropped |
| `offline` | Verification | How the update path is tested |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `OFF-004` | Revise | When the app opens or returns to the foreground with a connection, the system SHALL check for a new version, download it in the background and let it take control as soon as it is ready. |
| `OFF-009` | Add | When a new version takes control within 10 seconds of the app opening or returning to the foreground and before the learner has tapped, clicked, scrolled or pressed a key since then, the system SHALL reload once into the new version, keeping the current passage and position. |
| `OFF-010` | Add | When a new version takes control at any other time, the system SHALL leave the page on screen unchanged and use the new version from the next opening. |

Net: +2 new, ~1 revised, 0 deleted.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/offline/pwaOptions.test.ts` | Change | `OFF-004` (takes control at once; the plugin no longer injects its own registration) |
| `src/offline/updates.test.ts` | Add | `OFF-004`, `OFF-009`, `OFF-010` (checks on foreground return; reload inside the window only; no reload on a first install or after any interaction; at most one reload per opening) |
| `e2e/offline.spec.ts` | Change | `OFF-004`, `OFF-009` in Chromium: a changed service worker is picked up and the page reloads into it at the same position |

### Code

| File | Action | What changes |
|---|---|---|
| `src/offline/pwaOptions.ts` | Change | `skipWaiting` and `clientsClaim` on; `injectRegister: false` |
| `src/offline/updates.ts` | Add | Registers the service worker, checks for updates on return to the foreground, applies the reload rule |
| `src/main.tsx` | Change | Starts the update handling |

### Other

- **Hosting:** the build stops producing `registerSW.js`. Its no-cache rule in `deploy/hosting.ts` becomes unused but harmless, and is left in place.
- **Development log:** no change until the outcome.
- **Deploy:** dev first from this branch, then production from `main` on your go.

## Cross-Segment Effects

- **persistence:** relied on, not changed; the reload depends on PERS-001 restoring the passage and position.
- **reader, layout, quiz, progression, alphabet, content, feedback:** none. Interactions are detected with listeners on the window, so no component changes.

## Decisions Needed

1. **When the new version appears.**
   - *Recommended:* on the opening that finds it. If the download finishes within 10 seconds of opening (or of coming back from the background) and the learner hasn't touched anything yet, the app reloads once; the screen blinks and the learner lands on the same page. Otherwise it waits for the next opening.
   - *Alternative:* never reload. The new version takes control quietly and shows up on the next opening or reload; on an iPhone Home Screen app this is still one launch late, but more reliably than today.
   - *Alternative:* show a small "New version, tap to update" note and reload only when tapped.
2. **Checking when the app comes back from the background.**
   - *Recommended:* yes, on every return to the foreground; the check is a small no-cache request for the service worker file.
   - *Alternative:* only on a full launch.

## Risks and Edge Cases

- **First install:** the very first service worker also takes control, which looks like an update. The reload rule applies only when an earlier version was already in control.
- **Reload loops:** at most one automatic reload per opening, so a second deploy landing in the same window can't cause a chain of reloads.
- **A learner who reads without touching:** if the update arrives in the first 10 seconds, the page they're looking at is reloaded and comes back the same. The 10-second limit keeps this rare.
- **Offline or a failed check:** the check fails quietly; the current version keeps working.
- **iOS differences:** Chromium in the browser tests is not Safari. The real-device check on dev covers the Home Screen app.
- **Future code splitting:** immediate takeover is safe only while the page loads all its code up front. If the build ever splits code into lazily loaded files, this decision needs revisiting; the LLD will say so.

## Verification

- Unit tests for the reload rule and the foreground check, with a fake service worker container.
- A Chromium browser test that serves a changed service worker and checks that the page reloads into it at the same position, and does not reload after an interaction.
- CI passes on the pull request.
- On dev: two deploys in a row; you open the dev app on your iPhone after the second and see the change on that same opening.
- Production from `main` after your go.

---

## Outcome

To be filled in when the change is complete.
