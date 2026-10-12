# Feedback Specs

**LLD**: docs/intent/feedback/feedback-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Loading and Opening

- `[x]` **FEED-001**: When the app starts, the system SHALL load the shared feedback widget from `feedback.andreizimin.com` at a URL naming the minimum widget version the app needs (`widget.js?v=1.1.1`), with project slug `learn-mandalorian`, its floating launcher hidden, and its accent set to the app's accent color.
- `[x]` **FEED-002**: When the learner taps the Feedback button, the system SHALL open the shared feedback form.
- `[x]` **FEED-003**: While the feedback widget has not loaded (offline, blocked or failed), the system SHALL show the Feedback button disabled with the reason "Feedback needs a connection".
- `[x]` **FEED-005**: If the feedback widget loads without the host API (a version older than 1.1.0), then the system SHALL hide the widget so its floating button never appears, and SHALL show the Feedback button disabled with the reason "Feedback is unavailable right now".

## Keeping Reading Quiet

- `[x]` **FEED-004**: While the feedback form is open, the system SHALL ignore page-turn keys, swipes and edge taps, and SHALL never treat key or pointer events from inside the feedback widget as page turns.
