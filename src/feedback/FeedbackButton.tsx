import { REASON_OFFLINE } from './useFeedbackWidget';

// @spec FEED-002, FEED-003, FEED-005
export function FeedbackButton({
  ready,
  reason = REASON_OFFLINE,
  onOpen,
}: {
  ready: boolean;
  reason?: string;
  onOpen: () => void;
}) {
  return (
    <span className="feedback-button">
      <button type="button" onClick={onOpen} disabled={!ready}>
        Feedback
      </button>
      {!ready && <small className="feedback-reason">{reason}</small>}
    </span>
  );
}
