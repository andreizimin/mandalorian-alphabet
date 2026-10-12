// @spec FEED-002, FEED-003
export function FeedbackButton({ ready, onOpen }: { ready: boolean; onOpen: () => void }) {
  return (
    <span className="feedback-button">
      <button type="button" onClick={onOpen} disabled={!ready}>
        Feedback
      </button>
      {!ready && <small className="feedback-reason">Feedback needs a connection</small>}
    </span>
  );
}
