import { useEffect, useState } from 'react';
import type { FontState } from '../alphabet/alphabet';
import { Substituted } from '../reader/Substituted';
import { FINISHED, GREETING, LINES, START, delayAfter, isFinished, step, type Frame } from './typing';

const EVERY_LETTER: ReadonlySet<string> = new Set('abcdefghijklmnopqrstuvwxyz');
const NO_LETTERS: ReadonlySet<string> = new Set();

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

const Cursor = () => <span className="cursor" aria-hidden="true" />;

/**
 * The first-launch terminal: types the greeting in glyphs, switches it to
 * English, explains the app, then offers Let's go. A tap finishes the typing.
 */
// @spec INTRO-001, INTRO-002, INTRO-003, INTRO-004, INTRO-005, INTRO-006, INTRO-007
export function IntroTerminal({ fontState, onDone }: { fontState: FontState; onDone: () => void }) {
  const [frame, setFrame] = useState<Frame>(() => (prefersReducedMotion() ? FINISHED : START));
  const finished = isFinished(frame);
  // The greeting must not flash in a fallback font: typing waits until the font has loaded or failed.
  const ready = fontState !== 'loading';

  useEffect(() => {
    if (!ready || finished) return;
    const timer = setTimeout(() => setFrame(step), delayAfter(frame));
    return () => clearTimeout(timer);
  }, [ready, finished, frame]);

  const glyphs = frame.glyphs && fontState === 'loaded';
  const typingGreeting = frame.greeting < GREETING.length || frame.glyphs;
  const currentLine = frame.lines.findIndex((shown, i) => shown < LINES[i].length);

  return (
    <section className="intro" aria-label="Intro">
      <div className="terminal" onClick={() => setFrame(FINISHED)}>
        <p className="intro-greeting">
          <Substituted text={GREETING.slice(0, frame.greeting)} letters={glyphs ? EVERY_LETTER : NO_LETTERS} />
          {(typingGreeting || !ready) && <Cursor />}
        </p>
        {LINES.map((line, i) =>
          frame.lines[i] > 0 || (i === currentLine && !typingGreeting) ? (
            <p key={i}>
              {line.slice(0, frame.lines[i])}
              {i === currentLine && !typingGreeting && <Cursor />}
            </p>
          ) : null,
        )}
        {finished && (
          <p>
            <Cursor />
          </p>
        )}
      </div>
      {finished && (
        <button type="button" className="primary intro-go" onClick={onDone}>
          Let's go
        </button>
      )}
    </section>
  );
}
