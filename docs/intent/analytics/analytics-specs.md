# Analytics Specs

**LLD**: docs/intent/analytics/analytics-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## The Tag

- `[x]` **ANA-001**: The system SHALL load the Umami tracker from `https://cloud.umami.is/script.js` with the shared website ID `743c516f-8c6d-4584-9f2a-72a062108294` as a deferred script in the head of the app's one HTML page, with no `data-domains` attribute.

## Events

- `[x]` **ANA-002**: When the app reports an event, the system SHALL name it with the `mando_` prefix and SHALL do nothing if the tracker is not present on the page.
- `[x]` **ANA-003**: When the learner completes the intro with Let's go, the system SHALL report `mando_intro_done`.
- `[x]` **ANA-004**: When the learner advances to a new letter, the system SHALL report `mando_letter_advance` with the number of letters learned after the advance.
- `[x]` **ANA-005**: When a forward page turn counts as new reading, the system SHALL report `mando_page_read` with the number of letters learned.
- `[x]` **ANA-006**: When a quiz session reaches its results, the system SHALL report `mando_quiz_done` with the score out of 10 and the number of letters learned.
- `[x]` **ANA-007**: When the learner taps Suggest a feature, the system SHALL report `mando_suggest_feature_click`.

## Privacy

- `[x]` **ANA-008**: The system SHALL never report typed or pasted text, passage titles, quiz prompts or answers, names or contact details, and SHALL set no cookie and show no consent banner for analytics.
- `[D]` **ANA-009**: The system SHALL carry a short privacy note and a setting that turns analytics off.

## Tests

- `[x]` **ANA-010**: While a browser test runs, including the live-site check, the system's tests SHALL block requests to `cloud.umami.is`, so no test run is counted as a visit.
