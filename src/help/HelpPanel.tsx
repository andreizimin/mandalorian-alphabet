import { useEffect } from 'react';
import { HELP_CONTROLS, HELP_INTRO, PHONE_NOTE } from './helpText';

/**
 * The Help panel: a console sub-panel over the page. Close sits at the top so
 * it stays reachable while the panel scrolls on a short screen.
 */
// @spec HELP-001, HELP-002, HELP-004, HELP-005
export function HelpPanel({ onClose, onReplayIntro }: { onClose: () => void; onReplayIntro: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="overlay help-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-label="Help" className="card help-panel">
        <div className="help-head">
          <h2 className="help-title">// Help</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {HELP_INTRO.map((line) => (
          <p key={line} className="help-intro">
            {line}
          </p>
        ))}
        <dl className="help-controls">
          {HELP_CONTROLS.map((entry) => (
            <div key={entry.name} className="help-entry">
              <dt>{entry.name}</dt>
              <dd>{entry.text}</dd>
            </div>
          ))}
        </dl>
        <p className="help-note">{PHONE_NOTE}</p>
        <div className="help-actions">
          <button type="button" onClick={onReplayIntro}>
            Replay intro
          </button>
        </div>
      </div>
    </div>
  );
}
