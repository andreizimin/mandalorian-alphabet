import { useState } from 'react';
import { Substituted } from '../reader/Substituted';
import type { Signal } from './progression';

const MAX_EXAMPLES = 3;

// @spec PROG-003
export function exampleWords(passageText: string, letter: string, max = MAX_EXAMPLES): string[] {
  const words: string[] = [];
  for (const match of passageText.toLowerCase().matchAll(/[a-z]+/g)) {
    const word = match[0];
    if (word.includes(letter) && !words.includes(word)) words.push(word);
    if (words.length === max) break;
  }
  return words;
}

// @spec PROG-002, PROG-003
export function IntroCard({
  letter,
  passageText,
  onClose,
}: {
  letter: string;
  passageText: string;
  onClose: () => void;
}) {
  const only = new Set([letter]);
  const examples = exampleWords(passageText, letter);

  return (
    <div role="dialog" aria-label="New letter" className="card intro-card">
      <div className="intro-pair">
        <span className="intro-glyph">
          <Substituted text={letter} letters={only} />
        </span>
        <span className="intro-latin">{letter.toUpperCase()}</span>
      </div>
      {examples.length > 0 && (
        <ul className="intro-examples">
          {examples.map((word) => (
            <li key={word}>
              <Substituted text={word} letters={only} />
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={onClose}>
        Got it
      </button>
    </div>
  );
}

const SIGNAL_TEXT: Record<Signal, string> = {
  reading: "you've stopped peeking at it",
  quiz: 'you aced it in the quiz',
};

// @spec PROG-004, PROG-008, PROG-011, PROG-012
export function HintBanner({ signals, onDismiss }: { signals: readonly Signal[]; onDismiss: () => void }) {
  if (signals.length === 0) return null;
  return (
    <div role="status" className="hint">
      <span>
        Ready for the next letter: {signals.map((s) => SIGNAL_TEXT[s]).join(' and ')}.
      </span>
      <button type="button" aria-label="Dismiss hint" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

// @spec PROG-002, PROG-005, PROG-006, PROG-010, PROG-013
export function Controls({
  canAdvance,
  canStepBack,
  onAdvance,
  onStepBack,
  onReset,
}: {
  canAdvance: boolean;
  canStepBack: boolean;
  onAdvance: () => void;
  onStepBack: () => void;
  onReset: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="controls" role="group" aria-label="Confirm reset">
        <span>Reset all progress?</span>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            onReset();
          }}
        >
          Yes, reset
        </button>
        <button type="button" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="controls">
      <button type="button" onClick={onStepBack} disabled={!canStepBack}>
        Step back
      </button>
      <button type="button" className="primary" onClick={onAdvance} disabled={!canAdvance}>
        Next letter
      </button>
      <button type="button" onClick={() => setConfirming(true)}>
        Reset
      </button>
    </div>
  );
}

// @spec PROG-007
export function Legend({ learned }: { learned: readonly string[] }) {
  if (learned.length === 0) return <p className="legend-empty">No letters yet.</p>;
  return (
    <ul className="legend">
      {learned.map((letter) => (
        <li key={letter}>
          <Substituted text={letter} letters={new Set([letter])} />
          <span className="legend-latin">{letter.toUpperCase()}</span>
        </li>
      ))}
    </ul>
  );
}

// @spec PROG-014
export function WelcomeCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div role="dialog" aria-label="Welcome" className="card welcome-card">
      <p>
        This is plain English for now. Tap <strong>Next letter</strong> whenever you're ready, and one letter at a
        time will turn into Mandalorian.
      </p>
      <button type="button" onClick={onDismiss}>
        Start reading
      </button>
    </div>
  );
}
