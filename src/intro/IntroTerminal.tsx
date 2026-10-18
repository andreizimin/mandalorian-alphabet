import { useEffect, useState, type ReactNode } from 'react';
import type { FontState } from '../alphabet/alphabet';
import { Substituted } from '../reader/Substituted';
import { FINISHED, GLYPH_WORDS, GREETING, LINES, START, currentLine, delayAfter, isFinished, step, type Frame } from './typing';

const EVERY_LETTER: ReadonlySet<string> = new Set('abcdefghijklmnopqrstuvwxyz');
const NO_LETTERS: ReadonlySet<string> = new Set();

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

const Cursor = () => <span className="cursor" aria-hidden="true" />;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const longestFirst = (a: string, b: string) => b.length - a.length;
// A whole glyph word anywhere, or the beginning of one at the end of the text: the word being typed.
const PREFIXES = GLYPH_WORDS.flatMap((w) => Array.from({ length: w.length - 1 }, (_, i) => w.slice(0, i + 1)));
const GLYPH_WORD = new RegExp(
  `(${[...GLYPH_WORDS].sort(longestFirst).map(escape).join('|')}|(?:${[...PREFIXES].sort(longestFirst).map(escape).join('|')})$)`,
);

/** An English line with its Mandalorian words drawn in glyphs, including the one being typed. */
function Sprinkled({ text, glyphs }: { text: string; glyphs: boolean }): ReactNode {
  return text.split(GLYPH_WORD).map((part, i) =>
    i % 2 === 1 ? <Substituted key={i} text={part} letters={glyphs ? EVERY_LETTER : NO_LETTERS} /> : part,
  );
}

/**
 * The first-launch terminal: types the greeting in glyphs, holds it, types its
 * English beneath, explains the app, then offers Let's go. A tap finishes the typing.
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

  const glyphs = fontState === 'loaded';
  const typingGreeting = frame.greeting < GREETING.length;
  const line = currentLine(frame);
  // The cursor stays on the glyph greeting while it is typed and held, then follows the line being typed.
  const cursorOnGreeting = !ready || typingGreeting || (line === 0 && frame.lines[0] === 0);

  return (
    <section className="intro" aria-label="Intro">
      <div className="terminal" onClick={() => setFrame(FINISHED)}>
        <p className="intro-greeting">
          <Substituted text={GREETING.slice(0, frame.greeting)} letters={glyphs ? EVERY_LETTER : NO_LETTERS} />
          {cursorOnGreeting && <Cursor />}
        </p>
        {LINES.map((text, i) =>
          frame.lines[i] > 0 ? (
            <p key={i} className={i === 0 ? 'intro-greeting-english' : 'intro-line'}>
              {i === 0 ? text.slice(0, frame.lines[i]) : <Sprinkled text={text.slice(0, frame.lines[i])} glyphs={glyphs} />}
              {i === line && <Cursor />}
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
