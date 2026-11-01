import { track } from '../analytics/analytics';

/**
 * The Suggest a feature key: opens the shared feedback form, whose default choice is Feature,
 * and reports the tap. Disabled, like Feedback, while the widget is unavailable.
 */
// @spec FEED-006, ANA-007
export function SuggestButton({ ready, onOpen }: { ready: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => {
        track('suggest_feature_click');
        onOpen();
      }}
    >
      Suggest a feature
    </button>
  );
}
