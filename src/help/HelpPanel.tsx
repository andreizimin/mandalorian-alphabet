import { useEffect, useRef } from 'react';
import { HELP_CONTROLS, HELP_INTRO, PHONE_NOTE } from './helpText';

/**
 * The Help panel: a console sub-panel over the page. Close sits at the top so
 * it stays reachable while the panel scrolls on a short screen.
 */
// @spec HELP-001, HELP-002, HELP-004, HELP-005, HELP-006, HELP-007
export function HelpPanel({ onClose, onReplayIntro }: { onClose: () => void; onReplayIntro: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => closeRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') keepTabInside(e, dialogRef.current);
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
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Help" className="card help-panel">
        <div className="help-head">
          <h2 className="help-title">// Help</h2>
          <button ref={closeRef} type="button" onClick={onClose}>
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

/** Wraps Tab and Shift+Tab around the panel's own keys, so focus never reaches the page behind. */
function keepTabInside(e: KeyboardEvent, dialog: HTMLElement | null) {
  if (!dialog) return;
  const keys = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled])')];
  if (keys.length === 0) return;
  const first = keys[0];
  const last = keys[keys.length - 1];
  const inside = dialog.contains(document.activeElement);
  if (e.shiftKey && (document.activeElement === first || !inside)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
    e.preventDefault();
    first.focus();
  }
}
