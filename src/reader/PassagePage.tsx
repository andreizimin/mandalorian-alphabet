import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { peekPlacement } from './peekPlacement';
import { Substituted } from './Substituted';

export const PEEK_MS = 1500;

interface PassagePageProps {
  paragraphs: readonly string[];
  learnedSet: ReadonlySet<string>;
  /** The most recently learned letter, drawn in the highlight color. */
  newestLetter?: string;
  onPeek: (letter: string) => void;
  /** Wired by the layout segment (LAYOUT-007); glyph taps never call it. */
  onPageTurn?: () => void;
}

interface Peek {
  /** The whitespace-delimited word the tapped glyph belongs to, punctuation included. */
  word: string;
  /** The tapped letter, lower case. */
  letter: string;
  /** The word's box and the page area's vertical extent, in viewport coordinates. */
  anchor: { left: number; top: number; width: number; height: number };
  area: { top: number; bottom: number };
}

/** The word in the reading font with every occurrence of the tapped letter marked. */
function PeekWord({ word, letter }: { word: string; letter: string }) {
  return (
    <>
      {[...word].map((ch, i) =>
        ch.toLowerCase() === letter ? (
          <mark key={i} className="peek-letter">
            {ch}
          </mark>
        ) : (
          ch
        ),
      )}
    </>
  );
}

// @spec READ-001, READ-004, READ-008, READ-010
export function PassagePage({ paragraphs, learnedSet, newestLetter, onPeek }: PassagePageProps) {
  const [peek, setPeek] = useState<Peek | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const popover = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // The popover's size is known only once it renders, so it is placed just before the frame shows.
  useLayoutEffect(() => {
    const el = popover.current;
    if (!peek || !el) return;
    const { width, height } = el.getBoundingClientRect();
    const place = peekPlacement(peek.anchor, { width, height }, { width: window.innerWidth, height: window.innerHeight }, peek.area);
    el.style.left = `${place.left}px`;
    el.style.top = `${place.top}px`;
  }, [peek]);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const glyph = (event.target as Element).closest('.g');
    if (!glyph) return;
    event.stopPropagation();
    const letter = (glyph.textContent ?? '').toLowerCase();
    const wordEl = glyph.closest('[role="img"]');
    const word = wordEl?.getAttribute('aria-label') ?? glyph.textContent ?? '';
    const { left, top, width, height } = (wordEl ?? glyph).getBoundingClientRect();
    const areaRect = glyph.closest('.page-area')?.getBoundingClientRect();
    const area = areaRect ? { top: areaRect.top, bottom: areaRect.bottom } : { top: 0, bottom: window.innerHeight };

    onPeek(letter);
    setPeek({ word, letter, anchor: { left, top, width, height }, area });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeek(null), PEEK_MS);
  }

  return (
    <div className="passage-page" onClick={handleClick}>
      {paragraphs.map((text, i) => (
        <p key={i}>
          <Substituted text={text} letters={learnedSet} highlight={newestLetter} />
        </p>
      ))}
      {peek && (
        <div role="tooltip" className="peek" ref={popover}>
          <PeekWord word={peek.word} letter={peek.letter} />
        </div>
      )}
    </div>
  );
}
