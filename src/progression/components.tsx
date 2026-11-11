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

// @spec PROG-002, PROG-003, PROG-015
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
          <Substituted text={letter} letters={only} highlight={letter} />
        </span>
        <span className="intro-latin">{letter.toUpperCase()}</span>
      </div>
      {examples.length > 0 && (
        <ul className="intro-examples">
          {examples.map((word) => (
            <li key={word}>
              <Substituted text={word} letters={only} highlight={letter} />
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

/** Next letter, the action used between pages: in the top bar on wider screens and the bottom bar on phones. */
// @spec PROG-002, PROG-010, PROG-013
export function NextLetterButton({ canAdvance, onAdvance }: { canAdvance: boolean; onAdvance: () => void }) {
  return (
    <button type="button" className="primary" onClick={onAdvance} disabled={!canAdvance}>
      Next letter
    </button>
  );
}

// @spec PROG-007, PROG-015
export function Legend({ learned }: { learned: readonly string[] }) {
  const newest = learned[learned.length - 1];
  if (learned.length === 0) return <p className="legend-empty">No letters yet.</p>;
  return (
    <ul className="legend">
      {learned.map((letter) => (
        <li key={letter}>
          <Substituted text={letter} letters={new Set([letter])} highlight={newest} />
          <span className="legend-latin">{letter.toUpperCase()}</span>
        </li>
      ))}
    </ul>
  );
}
