import { useEffect, useRef } from 'react';
import { keepTabInside } from '../layout/keepTabInside';
import { HELP_CONTROLS, HELP_INTRO, MENU_NOTE } from './helpText';

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
        {/* @spec HELP-010: the stylesheet shows the note for the current width. */}
        <p className="help-note narrow-only">{MENU_NOTE.narrow}</p>
        <p className="help-note wide-only">{MENU_NOTE.wide}</p>
        <div className="help-actions">
          <button type="button" onClick={onReplayIntro}>
            Replay intro
          </button>
        </div>
      </div>
    </div>
  );
}
