/**
 * Usage analytics through the shared Umami account. The tracker itself is the
 * script tag in index.html; this module only names and guards the events.
 */

/** From the repository name; keeps this app's events apart in the shared dashboard. */
export const EVENT_PREFIX = 'mando_';

/** The core-loop events, without the prefix. */
export type AnalyticsEvent = 'intro_done' | 'letter_advance' | 'page_read' | 'quiz_done' | 'suggest_feature_click';

/** Event data is counts only: never text the learner typed, pasted or answered. */
export type EventData = Record<string, number>;

interface Umami {
  track(name: string, data?: EventData): void;
}

declare global {
  interface Window {
    umami?: Umami;
  }
}

/** Reports an event; a no-op while the tracker is blocked, offline or not yet loaded. */
// @spec ANA-002, ANA-008
export function track(event: AnalyticsEvent, data?: EventData): void {
  window.umami?.track(`${EVENT_PREFIX}${event}`, data);
}
