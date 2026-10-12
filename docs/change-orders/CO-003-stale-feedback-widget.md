# CO-003: Stale cached feedback widget breaks the Feedback button

| | |
|---|---|
| Type | Bug |
| Status | Done |
| Requested | 2026-10-12 |
| Approved | 2026-10-12 |
| Completed | 2026-10-12 |
| Ticket | [ZZF-61](https://linear.app/zizify-workshop/issue/ZZF-61) |

## Request

"nope, same floating button as in my other projects - same with iPhone view" (with a screenshot of the live app on a laptop: the inline Feedback button disabled with "Feedback needs a connection", and the widget's floating Feedback button in the bottom-right corner).

## Intent

The Feedback button works for returning visitors too, and the widget's floating button never appears in this app. Today, a browser that already has widget 1.0.0 cached from another andreizimin.com app keeps using it: 1.0.0 ignores `data-launcher="none"` and has no host API, so it draws its floating button and the app's button never becomes ready. This violates FEED-001 (launcher hidden), FEED-002 (button opens the form) and LAYOUT-016 (never floating).

## Diagnosis

- **Cause:** `feedback.andreizimin.com/widget.js` is served `max-age=31536000, immutable` from an unversioned URL (ZZF-58). Browsers that loaded 1.0.0 from any app keep it for up to a year, so the 1.1.0 deploy never reaches them.
- **Reproduced:** loading the app with the 1.0.0 script gives no `window.FeedbackWidget`, the floating button drawn, and the inline button disabled, exactly as in the screenshot.
- **Fix available from this side:** `widget.js?v=1.1.0` is a different URL to the browser's cache; the CDN serves 1.1.0 for it (checked).
- **Why CO-002 missed it:** every check, unit, browser and the live submission, ran in fresh browser profiles with empty caches. None modelled a returning visitor who has used another app first.

## Predicted Impact

### HLD

None.

### LLDs

| Component | Section | Change |
|---|---|---|
| `feedback` | Loading the Widget | Load a versioned URL (`widget.js?v=1.1.0`), the minimum widget version this app needs, so a stale cached copy is never used; explain why |
| `feedback` | Availability | If a widget loads without the host API (an older version), hide its host element so its floating button never shows, and keep the Feedback button disabled with a reason |
| `feedback` | Decisions & Alternatives | New row: versioned URL over waiting for the platform cache fix |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `FEED-001` | Revise | When the app starts, the system SHALL load the shared feedback widget from `feedback.andreizimin.com` at a URL naming the minimum widget version the app needs (`widget.js?v=1.1.0`), with project slug `learn-mandalorian`, its floating launcher hidden, and its accent set to the app's accent color. |
| `FEED-005` | Add | If the feedback widget loads without the host API (a version older than 1.1.0), then the system SHALL hide the widget so its floating button never appears, and SHALL show the Feedback button disabled with the reason "Feedback is unavailable right now". |

Net: +1 new, ~1 revised, 0 deleted.

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/feedback/feedback.test.tsx` | Change | `FEED-001` (versioned URL), `FEED-005` (script loads without the API: widget host hidden, button disabled with reason) |
| `e2e/feedback.spec.ts` | Change | `FEED-005` with the real 1.0.0 widget code served as the stale copy: no floating button visible, inline button disabled with the reason |
| `e2e/helpers.ts` | Change | Serve the stand-in for `widget.js` with or without a query string |

### Code

| File | Action | What changes |
|---|---|---|
| `src/feedback/useFeedbackWidget.ts` | Change | Versioned script URL; after the script loads without the API, mark the widget outdated and hide its host element |
| `src/feedback/FeedbackButton.tsx` | Change | Reason text for the outdated state |
| `src/App.tsx` | Change | Pass the widget state to the buttons instead of a ready flag, if the button needs the reason |

### Other

- `e2e/fixtures/feedback-widget-1.0.0.js`: a copy of the platform's 1.0.0 widget (from feedback-platform commit `4e2cb46`) used as the stale-cache stand-in.
- No platform change: ZZF-58 remains the platform-side fix for every app.

## Cross-Segment Effects

- **layout:** none; the button's placement and style are unchanged.
- **feedback-platform:** none required. If ZZF-58 is fixed later, the versioned URL keeps working; bumping `?v=` is then needed only when this app starts relying on a newer widget feature.

## Decisions Needed

Both answered on 2026-10-12 with the recommended option: versioned URL now (ZZF-58 as the platform-wide follow-up); hide an old widget and show the button disabled with a reason.

1. **How to defeat the stale cache.** *Recommended:* load `widget.js?v=1.1.0` from this app now. *Alternatives:* wait for ZZF-58 alone (does not help browsers that already cached 1.0.0, which keep it until it expires); or do both, ZZF-58 for every app plus the versioned URL here (recommended as the follow-up).
2. **If an old widget still loads anyway** (for example a cache in between that ignores query strings). *Recommended:* hide the old widget entirely and show the button disabled with "Feedback is unavailable right now". *Alternative:* let the old floating button show as a fallback, so feedback still works, but floating, which the original request ruled out.

## Risks and Edge Cases

- **Version pin drift:** the app pins the minimum version it needs; when the platform ships a fix this app needs, the pin must be bumped. Recorded in the `feedback` design.
- **Hiding the host element** also hides an old widget's form, which is intended: the old version cannot be opened from the app's button anyway.
- **Test blind spot:** the new browser test serves real 1.0.0 code as the cached copy, so returning-visitor state is covered from now on.

## Verification

- Unit and browser tests, including the stale-widget case with the real 1.0.0 code.
- After deploy, on your laptop and iPhone **without clearing any cache**: the floating button is gone and the inline Feedback button opens the form.

---

## Outcome

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | 0 | 0 | |
| LLDs | 3 sections of `feedback` | 3 sections | As predicted |
| Specs | +1 ~1 −0 | +1 ~1 −0 | FEED-005 added, FEED-001 revised |
| Tests | 3 files + the 1.0.0 fixture | 3 files + the fixture | As predicted |
| Code | 2–3 files | 4 files | `src/layout/ReaderChrome.tsx` passes the new reason to both Feedback buttons |

### Surprises

1. **The reason had to travel further than predicted.** A second unavailable reason means the reason, not just a ready flag, flows from the hook through `App.tsx` and `ReaderChrome.tsx` to both Feedback buttons (top bar and title line).
2. **A test found a latent race.** If the widget's `feedback:ready` event fires before the app starts listening, the app relied only on a check at mount. The load handler now also marks the widget ready when its API is present. CO-002's tests had not exercised that ordering.
3. **The lesson behind the bug is about test state, not code.** Every CO-002 check used a fresh browser profile. Returning-visitor states (anything cached by an earlier visit, here or on another app) are now covered by a browser test that serves the real 1.0.0 widget, and the realistic check (stale copy at the old address, real CDN for the versioned one) passed.

### Commits

| Hash | Message |
|---|---|
| `122d80b` | CO-003 proposed: stale cached feedback widget breaks the Feedback button (ZZF-61) |
| `f61809a` | CO-003: load a versioned feedback widget and hide stale ones (ZZF-61) |

### Measurements

| | |
|---|---|
| Tests before → after | unit 256 → 259, browser 49 → 52 |
| Lines changed | +64 −13 (code, 4 files), +57 −2 (tests, 3 files) plus a 346-line fixture (the 1.0.0 widget), +8 −2 (design doc and specs) |
| Agent time | about 5 minutes from approval (16:02) to completion (16:07) |
| Deployed | Not yet |
