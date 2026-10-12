---
parent: high-level-design
prefix: FEED
---

# Feedback

## Context and Design Philosophy

Learners can send a feature idea or a bug report without leaving the app. Feedback goes through the shared feedback platform used by every app on andreizimin.com (`feedback.andreizimin.com`), which files each submission as a Linear ticket labelled `learn-mandalorian` and titled `[learn-mandalorian] [Feature|Bug] …`. The app does not build its own form or backend: the platform's widget owns the form, the submission and the delivery. The app only decides where the entry point sits and keeps its own reading controls out of the way while the form is open.

## Loading the Widget

At startup the app adds the platform's script tag once:

- `src`: `https://feedback.andreizimin.com/widget.js?v=1.1.0`, naming the minimum widget version this app needs
- `data-project`: `learn-mandalorian` (the Linear label and title prefix)
- `data-launcher`: `none`, so the widget draws no floating button
- `data-accent`: the app's accent color (`#8a5a2b`), so the form's buttons match the app

The widget renders its form inside its own shadow DOM, so it cannot clash with the app's styles.

The version in the URL matters. The platform serves `widget.js` as cacheable for a year, and every andreizimin.com app uses the same address, so a browser that loaded an older widget for another app would keep using it here. A URL naming the version is a different address to the browser cache, so it always fetches a widget at least that new. When this app starts relying on a newer widget feature, the version in the URL is bumped.

## Opening the Form

The Feedback button is an ordinary app button among the reader controls (placement owned by `layout`). Tapping it calls `window.FeedbackWidget.open()`. The widget reports its state with window events: `feedback:ready` once loaded, and `feedback:open` and `feedback:close` as the form opens and closes. If the widget finished loading before the app started listening, the app finds `window.FeedbackWidget` already present and treats it as ready.

## Availability

The widget comes from another origin and is not part of the offline cache. Until it reports ready (offline, blocked by a content blocker, or failed to load), the Feedback button is disabled and says why: "Feedback needs a connection". Reading, the quiz and everything else keep working.

If a widget loads without the host API (a version older than 1.1.0, for example from a cache between the browser and the platform that ignores the version in the URL), the app hides the widget's host element, so its floating button never appears over the page, and shows the Feedback button disabled with "Feedback is unavailable right now". An old widget cannot be opened from the app's button anyway.

## Keeping Reading Quiet

While the form is open, page turns by arrow keys, swipes and edge taps are paused, so typing or tapping in the form never moves the passage. Independently of that, key and pointer events that come from inside the widget never count as page turns: the widget's shadow DOM makes them arrive at the app as events on the widget's host element (`#feedback-widget-host`), which the page-turn handlers ignore.

## What a Submission Sends

Only when the learner presses Send: the message, the Feature or Bug choice, optional name and contact fields, and context the widget captures (page, URL, user agent, language, viewport, environment, widget version and a trace ID). Nothing is sent by opening the form or by using the rest of the app.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Feedback channel | The shared feedback platform's widget | An in-app form posting to the platform; email link | One pipeline for every app, already delivering to Linear; the platform's docs ask embedders not to build their own form |
| Entry point | An app button among the reader controls, the widget's floating button hidden | The widget's floating corner button | A floating button sits over the reading page; an inline button matches the rest of the controls |
| Opening the form | The widget's public `open()` and events | Reaching into the widget's shadow DOM to click its hidden button | The public API is a contract the platform keeps; internals can change without notice |
| Stale cached widget | Load a versioned URL; hide any widget that lacks the host API | Rely on the platform fixing its cache headers; let an old widget's floating button show | Browsers that already cached the old widget keep it until it expires, whatever the platform does next; a floating button is what the app was asked never to show |
| Offline | Button disabled with a reason | Hide the button; queue feedback for later | A visible, explained state beats a button that silently does nothing; queueing would duplicate the platform's delivery |

## Open Questions & Future Decisions

### Deferred
1. The widget is loaded unversioned, so platform changes reach this app without a deploy here. Pinning a version would need the platform to publish versioned script URLs.
2. The widget's optional name and contact fields are visible to every learner. Hiding them per app would need a platform option.

## References

- Shared feedback platform: https://github.com/andreizimin/feedback-platform (`EMBED.md`, `constitution.md`)
- Inline-trigger support: ZZF-57, feedback-platform PR #1
