import { track } from '../analytics/analytics';
import { SUGGESTION_URL } from './suggestion';

/** The Suggest a feature link: the suggestion page in a new tab, drawn as a console key. */
// @spec FEED-006, ANA-007
export function SuggestLink({ onChoose }: { onChoose?: () => void }) {
  return (
    <a
      className="key-link"
      href={SUGGESTION_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        track('suggest_feature_click');
        onChoose?.();
      }}
    >
      Suggest a feature
    </a>
  );
}
